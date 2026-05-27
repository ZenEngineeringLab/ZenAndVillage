/**
 * POST /v1/subscriptions/{id}/reject — authenticated, platform_admin only.
 *
 * Rejects a pending subscription request (RN-ADM-003).
 * rejectionReason is required (≥ 20 characters).
 *
 * Side effects:
 *   - Updates User.onboardingStatus → 'pending_subscription' so the user
 *     can select a different plan and resubmit.
 */
import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, badRequest, notFound, forbidden, internalError } from '../shared/response-helpers.js'
import { subscriptionRepository } from './infrastructure/subscription.repository.js'
import { updateUserOnboardingStatus } from './infrastructure/cross-domain.js'

const logger = new Logger({ serviceName: 'subscriptions' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Subscriptions' })
const tracer = new Tracer({ serviceName: 'subscriptions' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { userId, roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  const id = event.pathParameters?.id
  if (!id) return notFound('Subscription', 'undefined', requestId)

  const body = (event as any).body as { rejectionReason?: string }

  // RN-ADM-003: rejection reason is required, minimum 20 characters
  if (!body?.rejectionReason || body.rejectionReason.trim().length < 20) {
    return badRequest('rejectionReason is required and must be at least 20 characters', requestId)
  }

  const subscription = await subscriptionRepository.getById(id)
  if (!subscription) return notFound('Subscription', id, requestId)

  if (subscription.status !== 'pending_approval') {
    return badRequest(
      `Only pending_approval subscriptions can be rejected. Current status: ${subscription.status}`,
      requestId,
    )
  }

  try {
    // Update Subscription record
    await subscriptionRepository.update(id, {
      status: 'rejected',
      rejectionReason: body.rejectionReason.trim(),
      rejectedBy: userId,
    })

    // Reset User.onboardingStatus → pending_subscription so they can resubmit
    await updateUserOnboardingStatus(subscription.requestedByCognitoSub, 'pending_subscription')

    metrics.addMetric('SubscriptionRejected', MetricUnit.Count, 1)
    logger.info('Subscription rejected', {
      id,
      tenantId: subscription.tenantId,
      rejectedBy: userId,
      requestId,
    })

    return ok({ id, status: 'rejected' })
  } catch (err) {
    logger.error('Failed to reject subscription', { err, requestId })
    return internalError('Failed to reject subscription', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
