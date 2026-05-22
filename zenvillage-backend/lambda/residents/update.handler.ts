import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, notFound, internalError } from '../shared/response-helpers.js'
import { residentRepository } from './infrastructure/resident.repository.js'

const logger = new Logger({ serviceName: 'residents' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Residents' })
const tracer = new Tracer({ serviceName: 'residents' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  const body = (event as any).body ?? {}
  try {
    const existing = await residentRepository.getById(tenantId, id)
    if (!existing) return notFound('Resident', id, requestId)
    await residentRepository.update(tenantId, id, body)
    const updated = await residentRepository.getById(tenantId, id)
    metrics.addMetric('ResidentUpdated', MetricUnit.Count, 1)
    return ok(updated)
  } catch (err) {
    logger.error('Failed to update resident', { err, id, requestId })
    return internalError('Failed to update resident', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
