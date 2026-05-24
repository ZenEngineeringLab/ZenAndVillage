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
import { residentRepository } from './infrastructure/resident.repository.js'
import type { Resident } from './domain/resident.entity.js'

const logger = new Logger({ serviceName: 'residents' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Residents' })
const tracer = new Tracer({ serviceName: 'residents' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<Resident>

  if (!body?.name || !body?.cpf || !body?.email || !body?.condoId || !body?.unit || !body?.occupancyType) {
    return badRequest('name, cpf, email, condoId, unit, and occupancyType are required', requestId)
  }

  const now = new Date().toISOString()
  const resident: Resident = {
    id: randomUUID(),
    tenantId,
    condoId: body.condoId,
    name: body.name,
    cpf: body.cpf,
    rg: body.rg,
    email: body.email,
    phone: body.phone ?? '',
    secondaryPhone: body.secondaryPhone,
    birthDate: body.birthDate,
    block: body.block,
    unit: body.unit,
    occupancyType: body.occupancyType,
    acquisitionDate: body.acquisitionDate,
    leaseStartDate: body.leaseStartDate,
    leaseEndDate: body.leaseEndDate,
    leaseContractUrl: body.leaseContractUrl,
    vehiclePlate: body.vehiclePlate,
    vehicleModel: body.vehicleModel,
    isSyndic: body.isSyndic ?? false,
    isBoardMember: body.isBoardMember ?? false,
    financialStatus: body.financialStatus ?? 'current',
    createdAt: now,
    updatedAt: now,
  }

  try {
    await residentRepository.create(resident)
    metrics.addMetric('ResidentCreated', MetricUnit.Count, 1)
    return created(resident)
  } catch (err) {
    logger.error('Failed to create resident', { err, requestId })
    return internalError('Failed to create resident', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
