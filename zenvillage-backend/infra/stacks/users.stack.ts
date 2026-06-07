import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Topic, ITopic } from 'aws-cdk-lib/aws-sns'
import { Construct } from 'constructs'
import * as path from 'path'
import * as url from 'url'
import { LambdaWithPowertools } from '../constructs/lambda-with-powertools.js'
import { ApiGatewayStack } from './api-gateway.stack.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

/**
 * UsersStack
 *
 * Provisions the `zenvillage-users-{env}` DynamoDB table used by:
 *   - The Cognito Pre-Token Generation Lambda (reads tenantId + roles by USER# PK)
 *   - The seed script (writes one record per Cognito user after AdminCreateUser)
 *
 * Access key pattern:
 *   PK = "USER#{cognitoSub}"
 *   SK = "PROFILE"
 *
 * This stack must be deployed before CognitoStack so that the table ARN
 * can be passed as a CDK cross-stack reference to grant IAM read access
 * to the Pre-Token Generation Lambda.
 */

export interface UsersStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface UsersStackProps extends StackProps {
  stackProps: UsersStackInnerProps
}

function addLambdaAlarms(
  scope: Construct,
  fn: LambdaWithPowertools,
  id: string,
  alarmTopic: ITopic,
): void {
  const errorsAlarm = new Alarm(scope, `${id}ErrorsAlarm`, {
    alarmName: `${id}-errors`,
    metric: fn.metricErrors({
      period: Duration.minutes(5),
      statistic: 'Sum',
    }),
    threshold: 1,
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  })
  errorsAlarm.addAlarmAction(new SnsAction(alarmTopic))

  const throttlesAlarm = new Alarm(scope, `${id}ThrottlesAlarm`, {
    alarmName: `${id}-throttles`,
    metric: fn.metricThrottles({
      period: Duration.minutes(5),
      statistic: 'Sum',
    }),
    threshold: 1,
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  })
  throttlesAlarm.addAlarmAction(new SnsAction(alarmTopic))
}

export class UsersStack extends Stack {
  public readonly table: Table

  constructor(scope: Construct, id: string, props: UsersStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    this.table = new Table(this, 'UsersTable', {
      tableName: `zenvillage-users-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      // RETAIN in prod — never destroyed by cdk destroy
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = { USERS_TABLE: this.table.tableName }
    const entryBase = path.join(__dirname, '../../lambda/users')

    // Lambda functions
    const createFn = new LambdaWithPowertools(this, 'CreateUserFn', {
      serviceName: `zenvillage-users-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetUserByIdFn', {
      serviceName: `zenvillage-users-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const updateOnboardingStatusFn = new LambdaWithPowertools(this, 'UpdateOnboardingStatusFn', {
      serviceName: `zenvillage-users-update-onboarding-status-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'update-onboarding-status.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Permissions
    this.table.grantWriteData(createFn)
    this.table.grantReadData(getByIdFn)
    this.table.grantReadWriteData(updateOnboardingStatusFn)

    // CloudWatch Alarms
    addLambdaAlarms(this, createFn, `zenvillage-users-create-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-users-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, updateOnboardingStatusFn, `zenvillage-users-update-onboarding-status-${env}`, alarmTopic)

    // API Routes
    // POST /v1/users — no authorizer (called right after Cognito sign-up, before JWT carries tenantId)
    apiStack.addPublicRoute(HttpMethod.POST, '/v1/users', createFn)
    apiStack.addRoute(HttpMethod.GET, '/v1/users/{id}', getByIdFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/users/{sub}/onboarding-status', updateOnboardingStatusFn)
  }
}
