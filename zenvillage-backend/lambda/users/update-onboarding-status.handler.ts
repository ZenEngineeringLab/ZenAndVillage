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
import { userRepository } from './infrastructure/user.repository.js'
import type { OnboardingStatus } from './domain/user.entity.js'

const logger = new Logger({ serviceName: 'users' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Users' })
const tracer = new Tracer({ serviceName: 'users' })

const VALID_STATUSES: OnboardingStatus[] = [
  'pending_verification',
  'pending_subscription',
  'pending_approval',
  'onboarding',
  'complete',
]

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { userId, requestId } = extractContext(event)
  const cognitoSub = event.pathParameters?.sub
  const body = (event as any).body as { onboardingStatus?: OnboardingStatus }

  if (!cognitoSub) return notFound('User', 'undefined', requestId)
  if (!body?.onboardingStatus || !VALID_STATUSES.includes(body.onboardingStatus)) {
    return badRequest(`onboardingStatus must be one of: ${VALID_STATUSES.join(', ')}`, requestId)
  }

  // Users may only update their own onboarding status
  const roles: string[] = JSON.parse(event.requestContext.authorizer?.lambda?.roles ?? '[]')
  const isPlatformAdmin = roles.includes('platform_admin')
  const user = await userRepository.findBySub(cognitoSub)
  if (!user) return notFound('User', cognitoSub, requestId)

  if (!isPlatformAdmin && user.id !== userId) {
    return forbidden('Access denied', requestId)
  }

  try {
    await userRepository.updateOnboardingStatus(cognitoSub, body.onboardingStatus)
    metrics.addMetric('OnboardingStatusUpdated', MetricUnit.Count, 1)
    logger.info('Onboarding status updated', { cognitoSub, status: body.onboardingStatus, requestId })
    return ok({ onboardingStatus: body.onboardingStatus })
  } catch (err) {
    logger.error('Failed to update onboarding status', { err, requestId })
    return internalError('Failed to update onboarding status', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
