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
import { employeeRepository } from './infrastructure/employee.repository.js'

const logger = new Logger({ serviceName: 'employees' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Employees' })
const tracer = new Tracer({ serviceName: 'employees' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const qs = event.queryStringParameters ?? {}
  const page = Number(qs['page'] ?? 1)
  const pageSize = Number(qs['pageSize'] ?? 20)
  const condoId = qs['condoId']

  try {
    const items = await employeeRepository.list(tenantId, condoId)
    const search = qs['search']?.toLowerCase()
    const role = qs['role']
    const status = qs['status']
    const contractType = qs['contractType']

    const filtered = items.filter(e => {
      if (search && !e.name.toLowerCase().includes(search)) return false
      if (role && e.role !== role) return false
      if (status && e.status !== status) return false
      if (contractType && e.contractType !== contractType) return false
      return true
    })

    const total = filtered.length
    const data = filtered.slice((page - 1) * pageSize, page * pageSize)
    metrics.addMetric('EmployeesListed', MetricUnit.Count, 1)
    return ok({ items: data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } })
  } catch (err) {
    logger.error('Failed to list employees', { err, requestId })
    return internalError('Failed to retrieve employees', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
