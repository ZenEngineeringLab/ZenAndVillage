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

export interface PropertyManagersStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface PropertyManagersStackProps extends StackProps {
  stackProps: PropertyManagersStackInnerProps
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

export class PropertyManagersStack extends Stack {
  constructor(scope: Construct, id: string, props: PropertyManagersStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // DynamoDB Table
    const table = new Table(this, 'PropertyManagersTable', {
      tableName: `zenvillage-property-managers-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = { PROPERTY_MANAGERS_TABLE: table.tableName }
    const entryBase = path.join(__dirname, '../../lambda/property-managers')

    // Lambda functions
    const listFn = new LambdaWithPowertools(this, 'ListPropertyManagersFn', {
      serviceName: `zenvillage-property-managers-list-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetPropertyManagerByIdFn', {
      serviceName: `zenvillage-property-managers-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const createFn = new LambdaWithPowertools(this, 'CreatePropertyManagerFn', {
      serviceName: `zenvillage-property-managers-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const updateFn = new LambdaWithPowertools(this, 'UpdatePropertyManagerFn', {
      serviceName: `zenvillage-property-managers-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const deleteFn = new LambdaWithPowertools(this, 'DeletePropertyManagerFn', {
      serviceName: `zenvillage-property-managers-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Permissions
    table.grantReadData(listFn)
    table.grantReadData(getByIdFn)
    table.grantWriteData(createFn)
    table.grantReadWriteData(updateFn)
    table.grantWriteData(deleteFn)

    // CloudWatch Alarms
    addLambdaAlarms(this, listFn, `zenvillage-property-managers-list-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-property-managers-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, createFn, `zenvillage-property-managers-create-${env}`, alarmTopic)
    addLambdaAlarms(this, updateFn, `zenvillage-property-managers-update-${env}`, alarmTopic)
    addLambdaAlarms(this, deleteFn, `zenvillage-property-managers-delete-${env}`, alarmTopic)

    // API Routes
    apiStack.addRoute(HttpMethod.GET, '/v1/property-managers', listFn)
    apiStack.addRoute(HttpMethod.GET, '/v1/property-managers/{id}', getByIdFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/property-managers', createFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/property-managers/{id}', updateFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/property-managers/{id}', deleteFn)
  }
}
