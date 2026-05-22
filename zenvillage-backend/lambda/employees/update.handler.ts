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
import { employeeRepository } from './infrastructure/employee.repository.js'

const logger = new Logger({ serviceName: 'employees' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Employees' })
const tracer = new Tracer({ serviceName: 'employees' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  const body = (event as any).body ?? {}
  try {
    const existing = await employeeRepository.getById(tenantId, id)
    if (!existing) return notFound('Employee', id, requestId)
    await employeeRepository.update(tenantId, id, body)
    const updated = await employeeRepository.getById(tenantId, id)
    metrics.addMetric('EmployeeUpdated', MetricUnit.Count, 1)
    return ok(updated)
  } catch (err) {
    logger.error('Failed to update employee', { err, id, requestId })
    return internalError('Failed to update employee', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
