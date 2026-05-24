import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, internalError } from '../shared/response-helpers.js'
import { propertyManagerRepository } from './infrastructure/property-manager.repository.js'

const logger = new Logger({ serviceName: 'property-managers' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/PropertyManagers' })
const tracer = new Tracer({ serviceName: 'property-managers' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const qs = event.queryStringParameters ?? {}
  const page = Number(qs['page'] ?? 1)
  const pageSize = Number(qs['pageSize'] ?? 20)

  try {
    const items = await propertyManagerRepository.list(tenantId)
    const search = qs['search']?.toLowerCase()
    const filtered = search ? items.filter(p => p.tradeName.toLowerCase().includes(search) || p.taxId.includes(search)) : items
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    metrics.addMetric('PropertyManagersListed', MetricUnit.Count, 1)
    return ok({ items: data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } })
  } catch (err) {
    logger.error('Failed to list property managers', { err, requestId })
    return internalError('Failed to retrieve property managers', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
