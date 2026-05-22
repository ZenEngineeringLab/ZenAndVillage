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
import { tenantRepository } from './infrastructure/tenant.repository.js'

const logger = new Logger({ serviceName: 'tenants' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Tenants' })
const tracer = new Tracer({ serviceName: 'tenants' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const qs = event.queryStringParameters ?? {}
  const page = Number(qs['page'] ?? 1)
  const pageSize = Number(qs['pageSize'] ?? 20)

  try {
    const items = await tenantRepository.list(tenantId)
    const search = qs['search']?.toLowerCase()
    const filtered = search ? items.filter(t => t.name.toLowerCase().includes(search)) : items
    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)

    metrics.addMetric('TenantsListed', MetricUnit.Count, 1)
    logger.info('Tenants listed', { tenantId, count: data.length, requestId })

    return ok({
      items: data,
      pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) },
    })
  } catch (err) {
    logger.error('Failed to list tenants', { err, requestId })
    return internalError('Failed to retrieve tenants', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
