/**
 * POST /v1/subscriptions — public route, no Lambda Authorizer.
 *
 * Handles the combined tenant + subscription request submission at the end
 * of the self-service onboarding funnel. The user has already:
 *   1. Created a Cognito account (POST /v1/users)
 *   2. Verified their email (Cognito trigger)
 *   3. Selected a plan and filled in company info
 *
 * This handler:
 *   1. Creates the Tenant record (subscriptionStatus = pending_approval)
 *   2. Creates the Subscription record (status = pending_approval)
 *   3. Updates User.onboardingStatus → 'pending_approval'
 *
 * Public because at this point the user's JWT does not yet carry a tenantId
 * (the custom:tenantId claim is populated after approval, on the next sign-in).
 */
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
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { created, badRequest, internalError } from '../shared/response-helpers.js'
import { subscriptionRepository } from './infrastructure/subscription.repository.js'
import { updateUserOnboardingStatus } from './infrastructure/cross-domain.js'
import type { BillingCycle, Subscription } from './domain/subscription.entity.js'

const logger = new Logger({ serviceName: 'subscriptions' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Subscriptions' })
const tracer = new Tracer({ serviceName: 'subscriptions' })

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TENANTS_TABLE = process.env.TENANTS_TABLE!

const VALID_BILLING_CYCLES: BillingCycle[] = ['monthly', 'annual']

interface RequestBody {
  cognitoSub?: string
  planId?: string
  billingCycle?: BillingCycle
  // Tenant fields
  tenantName?: string
  tenantType?: 'management_company' | 'independent_condo'
  taxId?: string
  contactEmail?: string
  phone?: string
  responsibleName?: string
  responsibleEmail?: string
}

const mainHandler = async (event: APIGatewayProxyEventV2) => {
  const requestId = event.requestContext.requestId
  const body = (event as any).body as RequestBody

  // Validate required fields
  if (!body?.cognitoSub) return badRequest('cognitoSub is required', requestId)
  if (!body?.planId) return badRequest('planId is required', requestId)
  if (!body?.billingCycle || !VALID_BILLING_CYCLES.includes(body.billingCycle)) {
    return badRequest(`billingCycle must be one of: ${VALID_BILLING_CYCLES.join(', ')}`, requestId)
  }
  if (!body.tenantName || !body.tenantType || !body.taxId || !body.contactEmail) {
    return badRequest('tenantName, tenantType, taxId, and contactEmail are required', requestId)
  }

  const now = new Date().toISOString()
  const tenantId = randomUUID()
  const subscriptionId = randomUUID()

  // 1. Create Tenant record
  try {
    await ddb.send(new PutCommand({
      TableName: TENANTS_TABLE,
      Item: {
        PK: `TENANT#${tenantId}#TENANT#${tenantId}`,
        SK: 'PROFILE',
        id: tenantId,
        tenantId,
        name: body.tenantName,
        type: body.tenantType,
        taxId: body.taxId,
        contactEmail: body.contactEmail,
        phone: body.phone ?? '',
        responsibleName: body.responsibleName ?? '',
        responsibleEmail: body.responsibleEmail ?? '',
        planId: body.planId,
        subscriptionStatus: 'pending_approval',
        billingCycle: body.billingCycle,
        usageLimits: { activeCondos: 0, totalUnits: 0, adminUsers: 0 },
        status: 'active',
        statusChangeLog: [],
        createdAt: now,
        updatedAt: now,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  } catch (err: any) {
    logger.error('Failed to create tenant record', { err, requestId })
    return internalError('Failed to submit subscription request', requestId)
  }

  // 2. Create Subscription record
  const subscription: Subscription = {
    id: subscriptionId,
    tenantId,
    planId: body.planId,
    requestedByCognitoSub: body.cognitoSub,
    requestedAt: now,
    billingCycle: body.billingCycle,
    status: 'pending_approval',
  }

  try {
    await subscriptionRepository.create(subscription)
  } catch (err: any) {
    logger.error('Failed to create subscription record', { err, requestId })
    return internalError('Failed to submit subscription request', requestId)
  }

  // 3. Update User.onboardingStatus → pending_approval
  try {
    await updateUserOnboardingStatus(body.cognitoSub, 'pending_approval')
  } catch (err) {
    // Non-fatal — user can refresh and the onboarding status will be corrected
    logger.warn('Failed to update user onboarding status', { err, requestId })
  }

  metrics.addMetric('SubscriptionRequested', MetricUnit.Count, 1)
  logger.info('Subscription request created', {
    subscriptionId,
    tenantId,
    planId: body.planId,
    requestId,
  })

  return created({ subscriptionId, tenantId, status: 'pending_approval' })
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
