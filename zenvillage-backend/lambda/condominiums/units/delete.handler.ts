import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../../shared/extract-context.js'
import { noContent, notFound, internalError } from '../../shared/response-helpers.js'
import { unitRepository } from '../infrastructure/sub-entity.repository.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  const unitId = event.pathParameters?.unitId
  if (!condoId || !unitId) return notFound('Unit', 'undefined', requestId)

  try {
    await unitRepository.delete(tenantId, condoId, unitId)
    return noContent()
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') return notFound('Unit', unitId, requestId)
    logger.error('Failed to delete unit', { err, requestId })
    return internalError('Failed to delete unit', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
