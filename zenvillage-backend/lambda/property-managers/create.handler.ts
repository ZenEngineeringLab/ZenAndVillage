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
import { propertyManagerRepository } from './infrastructure/property-manager.repository.js'
import type { PropertyManager } from './domain/property-manager.entity.js'

const logger = new Logger({ serviceName: 'property-managers' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/PropertyManagers' })
const tracer = new Tracer({ serviceName: 'property-managers' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<PropertyManager>

  if (!body?.legalName || !body?.tradeName || !body?.taxId) {
    return badRequest('legalName, tradeName, and taxId are required', requestId)
  }

  const now = new Date().toISOString()
  const pm: PropertyManager = {
    id: randomUUID(),
    tenantId,
    legalName: body.legalName,
    tradeName: body.tradeName,
    taxId: body.taxId,
    creci: body.creci,
    email: body.email ?? '',
    phone: body.phone ?? '',
    site: body.site,
    address: body.address ?? { zipCode: '', street: '', number: '', neighborhood: '', city: '', state: '' },
    status: body.status ?? 'active',
    createdAt: now,
    updatedAt: now,
  }

  try {
    await propertyManagerRepository.create(pm)
    metrics.addMetric('PropertyManagerCreated', MetricUnit.Count, 1)
    return created(pm)
  } catch (err) {
    logger.error('Failed to create property manager', { err, requestId })
    return internalError('Failed to create property manager', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
