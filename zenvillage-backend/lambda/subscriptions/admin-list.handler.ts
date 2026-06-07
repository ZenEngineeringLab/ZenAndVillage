/**
 * GET /v1/admin/subscriptions — authenticated, platform_admin only.
 *
 * Returns all subscriptions. Used by the Platform Admin → Subscription
 * Requests screen. Supports optional ?status= query filter.
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
import { subscriptionRepository } from './infrastructure/subscription.repository.js'
import type { SubscriptionStatus } from './domain/subscription.entity.js'

const logger = new Logger({ serviceName: 'subscriptions' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Subscriptions' })
const tracer = new Tracer({ serviceName: 'subscriptions' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  try {
    let subscriptions = await subscriptionRepository.listAll()

    const statusFilter = event.queryStringParameters?.status as SubscriptionStatus | undefined
    if (statusFilter) {
      subscriptions = subscriptions.filter(s => s.status === statusFilter)
    }

    return ok(subscriptions)
  } catch (err) {
    logger.error('Failed to list subscriptions', { err, requestId })
    return internalError('Failed to list subscriptions', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
