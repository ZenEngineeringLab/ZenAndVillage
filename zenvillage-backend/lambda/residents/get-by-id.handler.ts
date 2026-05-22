import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, notFound, internalError } from '../shared/response-helpers.js'
import { residentRepository } from './infrastructure/resident.repository.js'

const logger = new Logger({ serviceName: 'residents' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Residents' })
const tracer = new Tracer({ serviceName: 'residents' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const id = event.pathParameters?.id ?? ''
  try {
    const resident = await residentRepository.getById(tenantId, id)
    if (!resident) return notFound('Resident', id, requestId)
    return ok(resident)
  } catch (err) {
    logger.error('Failed to get resident', { err, id, requestId })
    return internalError('Failed to retrieve resident', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
