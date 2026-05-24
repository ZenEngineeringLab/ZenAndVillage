import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, notFound, internalError } from '../shared/response-helpers.js'
import { propertyManagerRepository } from './infrastructure/property-manager.repository.js'

const logger = new Logger({ serviceName: 'property-managers' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/PropertyManagers' })
const tracer = new Tracer({ serviceName: 'property-managers' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  try {
    const pm = await propertyManagerRepository.getById(tenantId, id)
    if (!pm) return notFound('PropertyManager', id, requestId)
    return ok(pm)
  } catch (err) {
    logger.error('Failed to get property manager', { err, id, requestId })
    return internalError('Failed to retrieve property manager', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
