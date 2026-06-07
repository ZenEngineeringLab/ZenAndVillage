/**
 * POST /v1/plans — authenticated, platform_admin only.
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
import { randomUUID } from 'crypto'
import { extractContext } from '../shared/extract-context.js'
import { created, badRequest, forbidden, internalError } from '../shared/response-helpers.js'
import { planRepository } from './infrastructure/plan.repository.js'
import type { Plan } from './domain/plan.entity.js'

const logger = new Logger({ serviceName: 'plans' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Plans' })
const tracer = new Tracer({ serviceName: 'plans' })

const VALID_SUPPORT_LEVELS = ['basic', 'priority', 'dedicated'] as const

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { roles, requestId } = extractContext(event)

  if (!roles.includes('platform_admin')) {
    return forbidden('Access denied', requestId)
  }

  const body = (event as any).body as Partial<Plan>

  if (!body?.name || typeof body.monthlyPrice !== 'number' || typeof body.annualPrice !== 'number') {
    return badRequest('name, monthlyPrice, and annualPrice are required', requestId)
  }
  if (!body.supportLevel || !VALID_SUPPORT_LEVELS.includes(body.supportLevel as any)) {
    return badRequest(`supportLevel must be one of: ${VALID_SUPPORT_LEVELS.join(', ')}`, requestId)
  }

  const now = new Date().toISOString()
  const plan: Plan = {
    id: randomUUID(),
    name: body.name,
    description: body.description ?? '',
    monthlyPrice: body.monthlyPrice,
    annualPrice: body.annualPrice,
    maxCondos: body.maxCondos ?? 1,
    maxUnitsTotal: body.maxUnitsTotal ?? 50,
    maxAdminUsers: body.maxAdminUsers ?? 5,
    enabledModules: body.enabledModules ?? [],
    dataRetentionMonths: body.dataRetentionMonths ?? 12,
    supportLevel: body.supportLevel,
    apiAccess: body.apiAccess ?? false,
    status: 'active',
    public: body.public ?? false,
    createdAt: now,
  }

  try {
    await planRepository.create(plan)
    metrics.addMetric('PlanCreated', MetricUnit.Count, 1)
    logger.info('Plan created', { id: plan.id, name: plan.name, requestId })
    return created(plan)
  } catch (err: any) {
    if (err?.name === 'ConditionalCheckFailedException') {
      return badRequest('Plan with this id already exists', requestId)
    }
    logger.error('Failed to create plan', { err, requestId })
    return internalError('Failed to create plan', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
