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
import { blockRepository } from '../infrastructure/sub-entity.repository.js'
import type { Block } from '../domain/block.entity.js'

const logger = new Logger({ serviceName: 'condominiums' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Condominiums' })
const tracer = new Tracer({ serviceName: 'condominiums' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const condoId = event.pathParameters?.condoId
  if (!condoId) return notFound('Condominium', 'undefined', requestId)

  const body = (event as any).body as Partial<Block>
  if (!body?.name) return badRequest('name is required', requestId)

  const now = new Date().toISOString()
  const block: Block = {
    id: randomUUID(),
    condoId,
    tenantId,
    name: body.name,
    description: body.description,
    createdAt: now,
    updatedAt: now,
  }

  try {
    await blockRepository.create(block)
    metrics.addMetric('BlockCreated', MetricUnit.Count, 1)
    return created(block)
  } catch (err) {
    logger.error('Failed to create block', { err, requestId })
    return internalError('Failed to create block', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
