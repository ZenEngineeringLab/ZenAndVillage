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
import { created, badRequest, internalError } from '../shared/response-helpers.js'
import { tenantRepository } from './infrastructure/tenant.repository.js'
import type { Tenant } from './domain/tenant.entity.js'

const logger = new Logger({ serviceName: 'tenants' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Tenants' })
const tracer = new Tracer({ serviceName: 'tenants' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<Tenant>

  if (!body?.name || !body?.type || !body?.taxId || !body?.contactEmail) {
    return badRequest('name, type, taxId, and contactEmail are required', requestId)
  }

  const now = new Date().toISOString()
  const tenant: Tenant = {
    id: randomUUID(),
    tenantId,
    name: body.name,
    type: body.type,
    taxId: body.taxId,
    contactEmail: body.contactEmail,
    phone: body.phone ?? '',
    responsibleName: body.responsibleName ?? '',
    responsibleEmail: body.responsibleEmail ?? '',
    planId: body.planId ?? '',
    subscriptionStatus: 'pending_approval',
    billingCycle: body.billingCycle ?? 'monthly',
    usageLimits: body.usageLimits ?? { activeCondos: 0, totalUnits: 0, adminUsers: 0 },
    status: 'active',
    statusChangeLog: [],
    createdAt: now,
    updatedAt: now,
  }

  try {
    await tenantRepository.create(tenant)
    metrics.addMetric('TenantCreated', MetricUnit.Count, 1)
    logger.info('Tenant created', { id: tenant.id, tenantId, requestId })
    return created(tenant)
  } catch (err) {
    logger.error('Failed to create tenant', { err, requestId })
    return internalError('Failed to create tenant', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
