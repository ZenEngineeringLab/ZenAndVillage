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
import { condominiumRepository } from './infrastructure/condominium.repository.js'
import type { Condominium } from './domain/condominium.entity.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<Condominium>

  if (!body?.name || !body?.taxId || !body?.type) {
    return badRequest('name, taxId, and type are required', requestId)
  }

  const now = new Date().toISOString()
  const condo: Condominium = {
    id: randomUUID(),
    tenantId,
    name: body.name,
    taxId: body.taxId,
    type: body.type,
    status: body.status ?? 'active',
    address: body.address ?? { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' },
    numUnits: body.numUnits ?? 0,
    numBlocks: body.numBlocks ?? 0,
    numFloors: body.numFloors ?? 0,
    totalAreaSqm: body.totalAreaSqm,
    inauguratedAt: body.inauguratedAt,
    propertyManagerId: body.propertyManagerId,
    syndicResidentId: body.syndicResidentId,
    bylawsUrl: body.bylawsUrl,
    regulationsUrl: body.regulationsUrl,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await condominiumRepository.create(condo)
    metrics.addMetric('CondominiumCreated', MetricUnit.Count, 1)
    return created(condo)
  } catch (err) {
    logger.error('Failed to create condominium', { err, requestId })
    return internalError('Failed to create condominium', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
