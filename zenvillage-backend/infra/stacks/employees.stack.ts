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

export interface EmployeesStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface EmployeesStackProps extends StackProps {
  stackProps: EmployeesStackInnerProps
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

export class EmployeesStack extends Stack {
  constructor(scope: Construct, id: string, props: EmployeesStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // DynamoDB Table
    const table = new Table(this, 'EmployeesTable', {
      tableName: `zenvillage-employees-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = { EMPLOYEES_TABLE: table.tableName }
    const entryBase = path.join(__dirname, '../../lambda/employees')

    // Lambda functions
    const listFn = new LambdaWithPowertools(this, 'ListEmployeesFn', {
      serviceName: `zenvillage-employees-list-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetEmployeeByIdFn', {
      serviceName: `zenvillage-employees-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const createFn = new LambdaWithPowertools(this, 'CreateEmployeeFn', {
      serviceName: `zenvillage-employees-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const updateFn = new LambdaWithPowertools(this, 'UpdateEmployeeFn', {
      serviceName: `zenvillage-employees-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const deleteFn = new LambdaWithPowertools(this, 'DeleteEmployeeFn', {
      serviceName: `zenvillage-employees-delete-${env}`,
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
    addLambdaAlarms(this, listFn, `zenvillage-employees-list-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-employees-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, createFn, `zenvillage-employees-create-${env}`, alarmTopic)
    addLambdaAlarms(this, updateFn, `zenvillage-employees-update-${env}`, alarmTopic)
    addLambdaAlarms(this, deleteFn, `zenvillage-employees-delete-${env}`, alarmTopic)

    // API Routes
    apiStack.addRoute(HttpMethod.GET, '/v1/employees', listFn)
    apiStack.addRoute(HttpMethod.GET, '/v1/employees/{id}', getByIdFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/employees', createFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/employees/{id}', updateFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/employees/{id}', deleteFn)
  }
}
