import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { randomUUID } from 'crypto'
import { extractContext } from '../shared/extract-context.js'
import { created, badRequest, internalError } from '../shared/response-helpers.js'
import { employeeRepository } from './infrastructure/employee.repository.js'
import type { Employee } from './domain/employee.entity.js'

const logger = new Logger({ serviceName: 'employees' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Employees' })
const tracer = new Tracer({ serviceName: 'employees' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<Employee>

  if (!body?.name || !body?.cpf || !body?.condoId || !body?.role || !body?.contractType || !body?.admissionDate || !body?.schedule || body?.baseSalary == null) {
    return badRequest('name, cpf, condoId, role, contractType, admissionDate, schedule, and baseSalary are required', requestId)
  }

  const now = new Date().toISOString()
  const employee: Employee = {
    id: randomUUID(),
    tenantId,
    condoId: body.condoId,
    name: body.name,
    cpf: body.cpf,
    socialSecurityId: body.socialSecurityId,
    email: body.email,
    phone: body.phone,
    role: body.role,
    contractType: body.contractType,
    outsourcingCompany: body.outsourcingCompany,
    admissionDate: body.admissionDate,
    terminationDate: body.terminationDate,
    schedule: body.schedule,
    baseSalary: body.baseSalary,
    status: body.status ?? 'active',
    asoUrl: body.asoUrl,
    contractUrl: body.contractUrl,
    otherDocsUrl: body.otherDocsUrl,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await employeeRepository.create(employee)
    metrics.addMetric('EmployeeCreated', MetricUnit.Count, 1)
    return created(employee)
  } catch (err) {
    logger.error('Failed to create employee', { err, requestId })
    return internalError('Failed to create employee', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
