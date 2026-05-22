import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { noContent, notFound, internalError } from '../shared/response-helpers.js'
import { tenantRepository } from './infrastructure/tenant.repository.js'

const logger = new Logger({ serviceName: 'tenants' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Tenants' })
const tracer = new Tracer({ serviceName: 'tenants' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''

  try {
    const existing = await tenantRepository.getById(tenantId, id)
    if (!existing) return notFound('Tenant', id, requestId)

    await tenantRepository.delete(tenantId, id)
    metrics.addMetric('TenantDeleted', MetricUnit.Count, 1)
    logger.info('Tenant deleted', { id, tenantId, requestId })
    return noContent()
  } catch (err) {
    logger.error('Failed to delete tenant', { err, id, requestId })
    return internalError('Failed to delete tenant', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
