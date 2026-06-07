/**
 * GET /v1/subscriptions/{id} — authenticated.
 *
 * Users may only fetch their own subscription (matched by tenantId from
 * authorizer context). Platform admins may fetch any subscription.
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
import { ok, notFound, forbidden, internalError } from '../shared/response-helpers.js'
import { subscriptionRepository } from './infrastructure/subscription.repository.js'

const logger = new Logger({ serviceName: 'subscriptions' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Subscriptions' })
const tracer = new Tracer({ serviceName: 'subscriptions' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, roles, requestId } = extractContext(event)
  const id = event.pathParameters?.id

  if (!id) return notFound('Subscription', 'undefined', requestId)

  try {
    const subscription = await subscriptionRepository.getById(id)
    if (!subscription) return notFound('Subscription', id, requestId)

    const isPlatformAdmin = roles.includes('platform_admin')
    if (!isPlatformAdmin && subscription.tenantId !== tenantId) {
      return forbidden('Access denied', requestId)
    }

    return ok(subscription)
  } catch (err) {
    logger.error('Failed to get subscription', { err, requestId })
    return internalError('Failed to get subscription', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
