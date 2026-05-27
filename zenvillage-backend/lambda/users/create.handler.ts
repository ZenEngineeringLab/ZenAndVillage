import type { APIGatewayProxyEventV2 } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { randomUUID } from 'crypto'
import { created, badRequest, internalError } from '../shared/response-helpers.js'
import { userRepository } from './infrastructure/user.repository.js'
import type { User } from './domain/user.entity.js'

const logger = new Logger({ serviceName: 'users' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Users' })
const tracer = new Tracer({ serviceName: 'users' })

// Called after Cognito PostConfirmation trigger or directly from the
// registration flow — no tenant auth required at this point.
const mainHandler = async (event: APIGatewayProxyEventV2) => {
  const requestId = event.requestContext.requestId
  const body = (event as any).body as Partial<User & { cognitoSub: string }>

  if (!body?.cognitoSub || !body?.email || !body?.name) {
    return badRequest('cognitoSub, email, and name are required', requestId)
  }

  const now = new Date().toISOString()
  const user: User = {
    id: randomUUID(),
    cognitoSub: body.cognitoSub,
    email: body.email,
    name: body.name,
    cpf: body.cpf,
    mfaEnabled: false,
    onboardingStatus: 'pending_verification',
    status: 'pending_verification',
    locale: body.locale ?? 'auto',
    roles: [],
    createdAt: now,
  }

  try {
    await userRepository.create(user)
    metrics.addMetric('UserCreated', MetricUnit.Count, 1)
    logger.info('User created', { id: user.id, cognitoSub: user.cognitoSub, requestId })
    return created(user)
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') {
      return badRequest('User with this Cognito sub already exists', requestId)
    }
    logger.error('Failed to create user', { err, requestId })
    return internalError('Failed to create user', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
