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
import { userRepository } from './infrastructure/user.repository.js'

const logger = new Logger({ serviceName: 'users' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Users' })
const tracer = new Tracer({ serviceName: 'users' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { userId, requestId } = extractContext(event)
  const id = event.pathParameters?.id

  if (!id) return notFound('User', 'undefined', requestId)

  // Users may only fetch their own record unless platform_admin
  const roles: string[] = JSON.parse(event.requestContext.authorizer?.lambda?.roles ?? '[]')
  const isPlatformAdmin = roles.includes('platform_admin')
  if (!isPlatformAdmin && id !== userId) {
    return forbidden('Access denied', requestId)
  }

  try {
    const user = await userRepository.findById(id)
    if (!user) return notFound('User', id, requestId)
    return ok(user)
  } catch (err) {
    logger.error('Failed to get user', { err, requestId })
    return internalError('Failed to get user', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
