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
  if (!ctx?.tenantId) {
    throw new Error('Missing tenantId in authorizer context — authorizer misconfigured')
  }
  return {
    tenantId: ctx.tenantId,
    userId: ctx.userId,
    roles: JSON.parse(ctx.roles ?? '[]'),
    requestId: event.requestContext.requestId,
  }
}
