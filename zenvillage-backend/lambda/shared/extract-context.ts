import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'

interface AuthorizerContext {
  tenantId: string
  userId: string
  roles: string
}

export interface RequestContext {
  tenantId: string
  userId: string
  roles: string[]
  requestId: string
}

export const extractContext = (
  event: APIGatewayProxyEventV2WithLambdaAuthorizer<AuthorizerContext>
): RequestContext => {
  const ctx = event.requestContext.authorizer?.lambda
  if (!ctx?.userId) {
    throw new Error('Missing authorizer context — authorizer misconfigured')
  }
  // tenantId is intentionally optional: platform admins are tenantless and
  // operate across tenants. Tenant-scoped handlers must validate that a
  // tenantId is present when they actually need one.
  return {
    tenantId: ctx.tenantId ?? '',
    userId: ctx.userId,
    roles: JSON.parse(ctx.roles ?? '[]'),
    requestId: event.requestContext.requestId,
  }
}
