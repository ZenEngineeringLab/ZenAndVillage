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
import { extractContext } from '../../shared/extract-context.js'
import { created, badRequest, notFound, internalError } from '../../shared/response-helpers.js'
import { occupantRepository } from '../infrastructure/sub-entity.repository.js'
import type { OccupantTenant } from '../domain/occupant-tenant.entity.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  const unitId = event.pathParameters?.unitId
  if (!condoId || !unitId) return notFound('Unit', 'undefined', requestId)

  const body = (event as any).body as Partial<OccupantTenant>
  if (!body?.name || !body?.cpf || !body?.email || !body?.leaseStartDate || !body?.leaseEndDate) {
    return badRequest('name, cpf, email, leaseStartDate, and leaseEndDate are required', requestId)
  }

  const now = new Date().toISOString()
  const occupant: OccupantTenant = {
    id: randomUUID(),
    tenantId,
    condoId,
    unitId,
    name: body.name,
    cpf: body.cpf,
    email: body.email,
    phone: body.phone ?? '',
    leaseStartDate: body.leaseStartDate,
    leaseEndDate: body.leaseEndDate,
    leaseContractUrl: body.leaseContractUrl,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await occupantRepository.create(occupant)
    metrics.addMetric('OccupantCreated', MetricUnit.Count, 1)
    return created(occupant)
  } catch (err) {
    logger.error('Failed to create occupant', { err, requestId })
    return internalError('Failed to create occupant', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
