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
import { ownerRepository } from '../infrastructure/sub-entity.repository.js'
import type { Owner } from '../domain/owner.entity.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  const unitId = event.pathParameters?.unitId
  if (!condoId || !unitId) return notFound('Unit', 'undefined', requestId)

  const body = (event as any).body as Partial<Owner>
  if (!body?.name || !body?.cpf || !body?.email) {
    return badRequest('name, cpf, and email are required', requestId)
  }

  const now = new Date().toISOString()
  const owner: Owner = {
    id: randomUUID(),
    tenantId,
    condoId,
    unitId,
    name: body.name,
    cpf: body.cpf,
    rg: body.rg,
    email: body.email,
    phone: body.phone ?? '',
    acquisitionDate: body.acquisitionDate ?? now,
    financialStatus: body.financialStatus ?? 'current',
    isSyndic: body.isSyndic ?? false,
    isCouncilMember: body.isCouncilMember ?? false,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await ownerRepository.create(owner)
    metrics.addMetric('OwnerCreated', MetricUnit.Count, 1)
    return created(owner)
  } catch (err) {
    logger.error('Failed to create owner', { err, requestId })
    return internalError('Failed to create owner', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
