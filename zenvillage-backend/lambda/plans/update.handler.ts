/**
 * PATCH /v1/plans/{id} — authenticated, platform_admin only.
 *
 * Allows updating any mutable Plan field except id, status (use discontinue),
 * and createdAt.
 */
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, notFound, forbidden, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'
import type { Plan } from './domain/plan.entity.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

// Fields that cannot be patched via this endpoint
const IMMUTABLE = new Set(['id', 'status', 'createdAt'])

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  const id = event.pathParameters?.id
  if (!id) return notFound('Plan', 'undefined', requestId)

  const body = (event as any).body as Partial<Plan>
  const patch = Object.fromEntries(
    Object.entries(body ?? {}).filter(([k]) => !IMMUTABLE.has(k))
  ) as Partial<Plan>

  if (Object.keys(patch).length === 0) {
    return ok({ message: 'No changes applied' })
  }

  try {
    await planRepository.update(id, patch)
    const updated = await planRepository.getById(id)
    logger.info('Plan updated', { id, requestId })
    return ok(updated)
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') {
      return notFound('Plan', id, requestId)
    }
    logger.error('Failed to update plan', { err, requestId })
    return internalError('Failed to update plan', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
