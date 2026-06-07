/**
 * POST /v1/plans/{id}/discontinue — authenticated, platform_admin only.
 *
 * Sets plan.status = 'discontinued'. Plans may never be hard-deleted (RN-ADM-004).
 * Existing subscriptions that reference a discontinued plan are unaffected.
 */
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, badRequest, notFound, forbidden, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  const id = event.pathParameters?.id
  if (!id) return notFound('Plan', 'undefined', requestId)

  const plan = await planRepository.getById(id)
  if (!plan) return notFound('Plan', id, requestId)

  if (plan.status === 'discontinued') {
    return badRequest('Plan is already discontinued', requestId)
  }

  try {
    await planRepository.update(id, { status: 'discontinued', public: false })
    metrics.addMetric('PlanDiscontinued', MetricUnit.Count, 1)
    logger.info('Plan discontinued', { id, requestId })
    return ok({ id, status: 'discontinued' })
  } catch (err) {
    logger.error('Failed to discontinue plan', { err, requestId })
    return internalError('Failed to discontinue plan', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
