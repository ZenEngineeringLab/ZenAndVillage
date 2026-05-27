/**
 * GET /v1/plans/{id} — public, no authorizer.
 *
 * Returns a single plan by id. Returns 404 for discontinued plans
 * requested without an admin token (discriminated by route: public endpoint
 * only serves active+public plans; admin uses /v1/admin/plans).
 */
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { ok, notFound, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

const mainHandler = async (event: APIGatewayProxyEventV2) => {
  const requestId = event.requestContext.requestId
  const id = event.pathParameters?.id

  if (!id) return notFound('Plan', 'undefined', requestId)

  try {
    const plan = await planRepository.getById(id)
    if (!plan || !plan.public || plan.status !== 'active') {
      return notFound('Plan', id, requestId)
    }
    return ok(plan)
  } catch (err) {
    logger.error('Failed to get plan', { err, requestId })
    return internalError('Failed to get plan', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
