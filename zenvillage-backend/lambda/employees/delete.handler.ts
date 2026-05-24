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
import { employeeRepository } from './infrastructure/employee.repository.js'

const logger = new Logger({ serviceName: 'employees' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Employees' })
const tracer = new Tracer({ serviceName: 'employees' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  try {
    const existing = await employeeRepository.getById(tenantId, id)
    if (!existing) return notFound('Employee', id, requestId)
    await employeeRepository.delete(tenantId, id)
    metrics.addMetric('EmployeeDeleted', MetricUnit.Count, 1)
    return noContent()
  } catch (err) {
    logger.error('Failed to delete employee', { err, id, requestId })
    return internalError('Failed to delete employee', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
