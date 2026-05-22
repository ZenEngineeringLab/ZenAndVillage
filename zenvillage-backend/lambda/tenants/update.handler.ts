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
import { tenantRepository } from './infrastructure/tenant.repository.js'

const logger = new Logger({ serviceName: 'tenants' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Tenants' })
const tracer = new Tracer({ serviceName: 'tenants' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  const body = (event as any).body ?? {}

  try {
    const existing = await tenantRepository.getById(tenantId, id)
    if (!existing) return notFound('Tenant', id, requestId)

    await tenantRepository.update(tenantId, id, body)
    const updated = await tenantRepository.getById(tenantId, id)
    metrics.addMetric('TenantUpdated', MetricUnit.Count, 1)
    logger.info('Tenant updated', { id, tenantId, requestId })
    return ok(updated)
  } catch (err) {
    logger.error('Failed to update tenant', { err, id, requestId })
    return internalError('Failed to update tenant', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
