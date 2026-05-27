import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../../shared/extract-context.js'
import { ok, notFound, internalError } from '../../shared/response-helpers.js'
import { occupantRepository } from '../infrastructure/sub-entity.repository.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  const unitId = event.pathParameters?.unitId
  const occupantId = event.pathParameters?.occupantId
  if (!condoId || !unitId || !occupantId) return notFound('OccupantTenant', 'undefined', requestId)

  const patch = (event as any).body ?? {}

  try {
    await occupantRepository.update(tenantId, condoId, unitId, occupantId, patch)
    return ok({ id: occupantId })
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') return notFound('OccupantTenant', occupantId, requestId)
    logger.error('Failed to update occupant', { err, requestId })
    return internalError('Failed to update occupant', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
