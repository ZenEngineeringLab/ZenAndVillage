/**
 * POST /v1/subscriptions/{id}/approve — authenticated, platform_admin only.
 *
 * Approves a pending subscription request (RN-ADM-002).
 * The admin must specify the resulting status: 'trial' or 'active'.
 *
 * Side effects:
 *   - Updates Tenant.subscriptionStatus
 *   - Updates User.onboardingStatus → 'onboarding'
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
import {
  updateTenantSubscriptionStatus,
  updateUserOnboardingStatus,
} from './infrastructure/cross-domain.js'
import type { SubscriptionStatus } from './domain/subscription.entity.js'

const logger = new Logger({ serviceName: 'subscriptions' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Subscriptions' })
const tracer = new Tracer({ serviceName: 'subscriptions' })

const APPROVAL_STATUSES: SubscriptionStatus[] = ['trial', 'active']

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { userId, roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  const id = event.pathParameters?.id
  if (!id) return notFound('Subscription', 'undefined', requestId)

  const body = (event as any).body as { status?: SubscriptionStatus }

  // RN-ADM-002: approval status must be 'trial' or 'active'
  if (!body?.status || !APPROVAL_STATUSES.includes(body.status)) {
    return badRequest(`status must be one of: ${APPROVAL_STATUSES.join(', ')}`, requestId)
  }

  const subscription = await subscriptionRepository.getById(id)
  if (!subscription) return notFound('Subscription', id, requestId)

  if (subscription.status !== 'pending_approval') {
    return badRequest(
      `Only pending_approval subscriptions can be approved. Current status: ${subscription.status}`,
      requestId,
    )
  }

  const now = new Date().toISOString()

  try {
    // Update Subscription record
    await subscriptionRepository.update(id, {
      status: body.status,
      startsAt: now,
      approvedBy: userId,
    })

    // Update Tenant.subscriptionStatus
    await updateTenantSubscriptionStatus(subscription.tenantId, body.status, now)

    // Update User.onboardingStatus → onboarding
    await updateUserOnboardingStatus(subscription.requestedByCognitoSub, 'onboarding')

    metrics.addMetric('SubscriptionApproved', MetricUnit.Count, 1)
    logger.info('Subscription approved', {
      id,
      tenantId: subscription.tenantId,
      status: body.status,
      approvedBy: userId,
      requestId,
    })

    return ok({ id, status: body.status, startsAt: now })
  } catch (err) {
    logger.error('Failed to approve subscription', { err, requestId })
    return internalError('Failed to approve subscription', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
