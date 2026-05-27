/**
 * GET /v1/admin/plans — authenticated, platform_admin only.
 *
 * Returns all plans including discontinued ones.
 * Used by the Platform Admin → Plan Management screen.
 */
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, forbidden, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  try {
    const plans = await planRepository.listAll()
    return ok(plans)
  } catch (err) {
    logger.error('Failed to list all plans', { err, requestId })
    return internalError('Failed to list plans', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
