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
import { unitRepository } from '../infrastructure/sub-entity.repository.js'
import type { Unit } from '../domain/unit.entity.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  if (!condoId) return notFound('Condominium', 'undefined', requestId)

  const body = (event as any).body as Partial<Unit>
  if (!body?.number || !body?.type) return badRequest('number and type are required', requestId)
  if (typeof body.floor !== 'number') return badRequest('floor is required', requestId)

  const now = new Date().toISOString()
  const unit: Unit = {
    id: randomUUID(),
    condoId,
    tenantId,
    block: body.block,
    floor: body.floor,
    number: body.number,
    type: body.type,
    privateAreaSqm: body.privateAreaSqm,
    idealFraction: body.idealFraction,
    linkedParkingSpace: body.linkedParkingSpace,
    occupancyStatus: body.occupancyStatus ?? 'vacant',
    createdAt: now,
    updatedAt: now,
  }

  try {
    await unitRepository.create(unit)
    metrics.addMetric('UnitCreated', MetricUnit.Count, 1)
    return created(unit)
  } catch (err) {
    logger.error('Failed to create unit', { err, requestId })
    return internalError('Failed to create unit', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
