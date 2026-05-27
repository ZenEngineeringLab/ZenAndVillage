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

export interface CondominiumsStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface CondominiumsStackProps extends StackProps {
  stackProps: CondominiumsStackInnerProps
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

export class CondominiumsStack extends Stack {
  constructor(scope: Construct, id: string, props: CondominiumsStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // DynamoDB Table
    const table = new Table(this, 'CondominiumsTable', {
      tableName: `zenvillage-condominiums-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const commonEnv = { CONDOMINIUMS_TABLE: table.tableName }
    const entryBase = path.join(__dirname, '../../lambda/condominiums')
    const subEntryBase = entryBase

    // Lambda functions
    const listFn = new LambdaWithPowertools(this, 'ListCondominiumsFn', {
      serviceName: `zenvillage-condominiums-list-${env}`,
      timeoutSeconds: 15,
      entry: path.join(entryBase, 'list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const getByIdFn = new LambdaWithPowertools(this, 'GetCondominiumByIdFn', {
      serviceName: `zenvillage-condominiums-get-by-id-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'get-by-id.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const createFn = new LambdaWithPowertools(this, 'CreateCondominiumFn', {
      serviceName: `zenvillage-condominiums-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const updateFn = new LambdaWithPowertools(this, 'UpdateCondominiumFn', {
      serviceName: `zenvillage-condominiums-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    const deleteFn = new LambdaWithPowertools(this, 'DeleteCondominiumFn', {
      serviceName: `zenvillage-condominiums-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(entryBase, 'delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // ─── Sub-entity Lambda functions ─────────────────────────────────────────

    // Blocks
    const listBlocksFn = new LambdaWithPowertools(this, 'ListBlocksFn', {
      serviceName: `zenvillage-condominiums-blocks-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'blocks/list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const createBlockFn = new LambdaWithPowertools(this, 'CreateBlockFn', {
      serviceName: `zenvillage-condominiums-blocks-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'blocks/create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const updateBlockFn = new LambdaWithPowertools(this, 'UpdateBlockFn', {
      serviceName: `zenvillage-condominiums-blocks-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'blocks/update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const deleteBlockFn = new LambdaWithPowertools(this, 'DeleteBlockFn', {
      serviceName: `zenvillage-condominiums-blocks-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'blocks/delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Units
    const listUnitsFn = new LambdaWithPowertools(this, 'ListUnitsFn', {
      serviceName: `zenvillage-condominiums-units-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'units/list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const createUnitFn = new LambdaWithPowertools(this, 'CreateUnitFn', {
      serviceName: `zenvillage-condominiums-units-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'units/create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const updateUnitFn = new LambdaWithPowertools(this, 'UpdateUnitFn', {
      serviceName: `zenvillage-condominiums-units-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'units/update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const deleteUnitFn = new LambdaWithPowertools(this, 'DeleteUnitFn', {
      serviceName: `zenvillage-condominiums-units-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'units/delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Owners
    const listOwnersFn = new LambdaWithPowertools(this, 'ListOwnersFn', {
      serviceName: `zenvillage-condominiums-owners-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'owners/list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const createOwnerFn = new LambdaWithPowertools(this, 'CreateOwnerFn', {
      serviceName: `zenvillage-condominiums-owners-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'owners/create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const updateOwnerFn = new LambdaWithPowertools(this, 'UpdateOwnerFn', {
      serviceName: `zenvillage-condominiums-owners-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'owners/update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const deleteOwnerFn = new LambdaWithPowertools(this, 'DeleteOwnerFn', {
      serviceName: `zenvillage-condominiums-owners-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'owners/delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // OccupantTenants
    const listOccupantsFn = new LambdaWithPowertools(this, 'ListOccupantsFn', {
      serviceName: `zenvillage-condominiums-occupants-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'occupants/list.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const createOccupantFn = new LambdaWithPowertools(this, 'CreateOccupantFn', {
      serviceName: `zenvillage-condominiums-occupants-create-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'occupants/create.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const updateOccupantFn = new LambdaWithPowertools(this, 'UpdateOccupantFn', {
      serviceName: `zenvillage-condominiums-occupants-update-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'occupants/update.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })
    const deleteOccupantFn = new LambdaWithPowertools(this, 'DeleteOccupantFn', {
      serviceName: `zenvillage-condominiums-occupants-delete-${env}`,
      timeoutSeconds: 10,
      entry: path.join(subEntryBase, 'occupants/delete.handler.ts'),
      handler: 'handler',
      environment: commonEnv,
    })

    // Permissions
    table.grantReadData(listFn)
    table.grantReadData(getByIdFn)
    table.grantWriteData(createFn)
    table.grantReadWriteData(updateFn)
    table.grantWriteData(deleteFn)

    // Sub-entity permissions
    const subReadFns = [listBlocksFn, listUnitsFn, listOwnersFn, listOccupantsFn]
    const subWriteFns = [createBlockFn, createUnitFn, createOwnerFn, createOccupantFn,
                         updateBlockFn, updateUnitFn, updateOwnerFn, updateOccupantFn,
                         deleteBlockFn, deleteUnitFn, deleteOwnerFn, deleteOccupantFn]
    subReadFns.forEach(fn => table.grantReadData(fn))
    subWriteFns.forEach(fn => table.grantReadWriteData(fn))

    // CloudWatch Alarms
    addLambdaAlarms(this, listFn, `zenvillage-condominiums-list-${env}`, alarmTopic)
    addLambdaAlarms(this, getByIdFn, `zenvillage-condominiums-get-by-id-${env}`, alarmTopic)
    addLambdaAlarms(this, createFn, `zenvillage-condominiums-create-${env}`, alarmTopic)
    addLambdaAlarms(this, updateFn, `zenvillage-condominiums-update-${env}`, alarmTopic)
    addLambdaAlarms(this, deleteFn, `zenvillage-condominiums-delete-${env}`, alarmTopic)

    // Sub-entity alarms
    ;[
      [listBlocksFn, 'blocks-list'], [createBlockFn, 'blocks-create'],
      [updateBlockFn, 'blocks-update'], [deleteBlockFn, 'blocks-delete'],
      [listUnitsFn, 'units-list'], [createUnitFn, 'units-create'],
      [updateUnitFn, 'units-update'], [deleteUnitFn, 'units-delete'],
      [listOwnersFn, 'owners-list'], [createOwnerFn, 'owners-create'],
      [updateOwnerFn, 'owners-update'], [deleteOwnerFn, 'owners-delete'],
      [listOccupantsFn, 'occupants-list'], [createOccupantFn, 'occupants-create'],
      [updateOccupantFn, 'occupants-update'], [deleteOccupantFn, 'occupants-delete'],
    ].forEach(([fn, label]) =>
      addLambdaAlarms(this, fn as LambdaWithPowertools, `zenvillage-condominiums-${label}-${env}`, alarmTopic)
    )

    // API Routes — Condominiums
    apiStack.addRoute(HttpMethod.GET, '/v1/condominiums', listFn)
    apiStack.addRoute(HttpMethod.GET, '/v1/condominiums/{id}', getByIdFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/condominiums', createFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/condominiums/{id}', updateFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/condominiums/{id}', deleteFn)

    // API Routes — Blocks
    apiStack.addRoute(HttpMethod.GET,    '/v1/condominiums/{condoId}/blocks', listBlocksFn)
    apiStack.addRoute(HttpMethod.POST,   '/v1/condominiums/{condoId}/blocks', createBlockFn)
    apiStack.addRoute(HttpMethod.PATCH,  '/v1/condominiums/{condoId}/blocks/{blockId}', updateBlockFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/condominiums/{condoId}/blocks/{blockId}', deleteBlockFn)

    // API Routes — Units
    apiStack.addRoute(HttpMethod.GET,    '/v1/condominiums/{condoId}/units', listUnitsFn)
    apiStack.addRoute(HttpMethod.POST,   '/v1/condominiums/{condoId}/units', createUnitFn)
    apiStack.addRoute(HttpMethod.PATCH,  '/v1/condominiums/{condoId}/units/{unitId}', updateUnitFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/condominiums/{condoId}/units/{unitId}', deleteUnitFn)

    // API Routes — Owners (nested under units)
    apiStack.addRoute(HttpMethod.GET,    '/v1/condominiums/{condoId}/units/{unitId}/owners', listOwnersFn)
    apiStack.addRoute(HttpMethod.POST,   '/v1/condominiums/{condoId}/units/{unitId}/owners', createOwnerFn)
    apiStack.addRoute(HttpMethod.PATCH,  '/v1/condominiums/{condoId}/units/{unitId}/owners/{ownerId}', updateOwnerFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/condominiums/{condoId}/units/{unitId}/owners/{ownerId}', deleteOwnerFn)

    // API Routes — OccupantTenants (nested under units)
    apiStack.addRoute(HttpMethod.GET,    '/v1/condominiums/{condoId}/units/{unitId}/occupants', listOccupantsFn)
    apiStack.addRoute(HttpMethod.POST,   '/v1/condominiums/{condoId}/units/{unitId}/occupants', createOccupantFn)
    apiStack.addRoute(HttpMethod.PATCH,  '/v1/condominiums/{condoId}/units/{unitId}/occupants/{occupantId}', updateOccupantFn)
    apiStack.addRoute(HttpMethod.DELETE, '/v1/condominiums/{condoId}/units/{unitId}/occupants/{occupantId}', deleteOccupantFn)
  }
}
