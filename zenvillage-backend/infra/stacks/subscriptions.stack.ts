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

export interface SubscriptionsStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
  /** Cross-stack ref — needed to create Tenant records on subscription submit */
  tenantsTableName: string
  tenantsTableArn: string
  /** Cross-stack ref — needed to update User.onboardingStatus on approval/rejection */
  usersTableName: string
  usersTableArn: string
}

export interface SubscriptionsStackProps extends StackProps {
  stackProps: SubscriptionsStackInnerProps
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

export class SubscriptionsStack extends Stack {
  constructor(scope: Construct, id: string, props: SubscriptionsStackProps) {
    super(scope, id, props)

    const {
      env,
      snsAlarmTopicArn,
      apiStack,
      tenantsTableName,
      tenantsTableArn,
      usersTableName,
      usersTableArn,
    } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // Import cross-stack tables (read-only CDK references — no double-creation)
    const tenantsTable = Table.fromTableArn(this, 'TenantsTable', tenantsTableArn)
    const usersTable = Table.fromTableArn(this, 'UsersTable', usersTableArn)

    // Subscriptions DynamoDB table — PK = SUBSCRIPTION#{id}, SK = METADATA
    const table = new Table(this, 'SubscriptionsTable', {
      tableName: `zenvillage-subscriptions-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = {
      SUBSCRIPTIONS_TABLE: table.tableName,
      TENANTS_TABLE: tenantsTableName,
      USERS_TABLE: usersTableName,
    }
    const entryBase = path.join(__dirname, '../../lambda/subscriptions')

    // Lambda functions
    const createFn = new LambdaWithPowertools(this, 'CreateSubscriptionFn', {
      serviceName: `zenvillage-subscriptions-create-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetSubscriptionByIdFn', {
      serviceName: `zenvillage-subscriptions-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const adminListFn = new LambdaWithPowertools(this, 'AdminListSubscriptionsFn', {
      serviceName: `zenvillage-subscriptions-admin-list-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'admin-list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const approveFn = new LambdaWithPowertools(this, 'ApproveSubscriptionFn', {
      serviceName: `zenvillage-subscriptions-approve-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'approve.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const rejectFn = new LambdaWithPowertools(this, 'RejectSubscriptionFn', {
      serviceName: `zenvillage-subscriptions-reject-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'reject.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Permissions — subscriptions table
    table.grantWriteData(createFn)
    table.grantReadData(getByIdFn)
    table.grantReadData(adminListFn)
    table.grantReadWriteData(approveFn)
    table.grantReadWriteData(rejectFn)

    // Permissions — cross-stack tables
    tenantsTable.grantWriteData(createFn)      // creates Tenant record on submit
    tenantsTable.grantWriteData(approveFn)     // updates Tenant.subscriptionStatus

    usersTable.grantWriteData(createFn)        // updates User.onboardingStatus → pending_approval
    usersTable.grantWriteData(approveFn)       // updates User.onboardingStatus → onboarding
    usersTable.grantWriteData(rejectFn)        // updates User.onboardingStatus → pending_subscription

    // CloudWatch Alarms
    addLambdaAlarms(this, createFn, `zenvillage-subscriptions-create-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-subscriptions-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, adminListFn, `zenvillage-subscriptions-admin-list-${env}`, alarmTopic)
    addLambdaAlarms(this, approveFn, `zenvillage-subscriptions-approve-${env}`, alarmTopic)
    addLambdaAlarms(this, rejectFn, `zenvillage-subscriptions-reject-${env}`, alarmTopic)

    // API Routes
    // Public — no tenant context yet when submitting the initial subscription request
    apiStack.addPublicRoute(HttpMethod.POST, '/v1/subscriptions', createFn)

    // Authenticated
    apiStack.addRoute(HttpMethod.GET, '/v1/subscriptions/{id}', getByIdFn)
    apiStack.addRoute(HttpMethod.GET, '/v1/admin/subscriptions', adminListFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/subscriptions/{id}/approve', approveFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/subscriptions/{id}/reject', rejectFn)
  }
}
