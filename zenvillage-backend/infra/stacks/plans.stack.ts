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

export interface PlansStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface PlansStackProps extends StackProps {
  stackProps: PlansStackInnerProps
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

export class PlansStack extends Stack {
  constructor(scope: Construct, id: string, props: PlansStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // DynamoDB table — global, not tenant-scoped; PK = PLAN#{id}, SK = METADATA
    const table = new Table(this, 'PlansTable', {
      tableName: `zenvillage-plans-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = { PLANS_TABLE: table.tableName }
    const entryBase = path.join(__dirname, '../../lambda/plans')

    // Lambda functions
    const listFn = new LambdaWithPowertools(this, 'ListPlansFn', {
      serviceName: `zenvillage-plans-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const adminListFn = new LambdaWithPowertools(this, 'AdminListPlansFn', {
      serviceName: `zenvillage-plans-admin-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'admin-list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetPlanByIdFn', {
      serviceName: `zenvillage-plans-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const createFn = new LambdaWithPowertools(this, 'CreatePlanFn', {
      serviceName: `zenvillage-plans-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const updateFn = new LambdaWithPowertools(this, 'UpdatePlanFn', {
      serviceName: `zenvillage-plans-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const discontinueFn = new LambdaWithPowertools(this, 'DiscontinuePlanFn', {
      serviceName: `zenvillage-plans-discontinue-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'discontinue.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Permissions
    table.grantReadData(listFn)
    table.grantReadData(adminListFn)
    table.grantReadData(getByIdFn)
    table.grantWriteData(createFn)
    table.grantReadWriteData(updateFn)
    table.grantReadWriteData(discontinueFn)

    // CloudWatch Alarms
    addLambdaAlarms(this, listFn, `zenvillage-plans-list-${env}`, alarmTopic)
    addLambdaAlarms(this, adminListFn, `zenvillage-plans-admin-list-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-plans-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, createFn, `zenvillage-plans-create-${env}`, alarmTopic)
    addLambdaAlarms(this, updateFn, `zenvillage-plans-update-${env}`, alarmTopic)
    addLambdaAlarms(this, discontinueFn, `zenvillage-plans-discontinue-${env}`, alarmTopic)

    // API Routes
    // Public routes — no authorizer (accessible during onboarding before tenant context)
    apiStack.addPublicRoute(HttpMethod.GET, '/v1/plans', listFn)
    apiStack.addPublicRoute(HttpMethod.GET, '/v1/plans/{id}', getByIdFn)

    // Authenticated routes — Lambda Authorizer + platform_admin role check in handler
    apiStack.addRoute(HttpMethod.GET, '/v1/admin/plans', adminListFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/plans', createFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/plans/{id}', updateFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/plans/{id}/discontinue', discontinueFn)
  }
}
