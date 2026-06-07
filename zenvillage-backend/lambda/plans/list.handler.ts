/**
 * GET /v1/plans — public, no authorizer.
 *
 * Returns all plans where status = 'active' AND public = true.
 * Used by the self-service plan-selection screen during onboarding.
 */
import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { ok, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

const mainHandler = async (event: APIGatewayProxyEventV2) => {
  const requestId = event.requestContext.requestId

  try {
    const plans = await planRepository.listPublicActive()
    return ok(plans)
  } catch (err) {
    logger.error('Failed to list plans', { err, requestId })
    return internalError('Failed to list plans', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
