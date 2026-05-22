import type { APIGatewayRequestAuthorizerEventV2, APIGatewaySimpleAuthorizerWithContextResult } from 'aws-lambda'
import { Logger } from '@aws-lambda-powertools/logger'

const logger = new Logger({ serviceName: 'tenant-authorizer' })

interface AuthorizerContext {
  tenantId: string
  userId: string
  roles: string
}

const extractClaims = (token: string): Record<string, string> => {
  try {
    const payload = token.split('.')[1]
    return JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'))
  } catch {
    throw new Error('Invalid JWT format')
  }
}

export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthorizerContext>> => {
  const authHeader = event.headers?.authorization ?? event.headers?.Authorization ?? ''
  const headerTenantId = event.headers?.['x-tenant-id'] ?? event.headers?.['X-Tenant-Id'] ?? ''

  if (!authHeader.startsWith('Bearer ')) {
    logger.warn('Missing or malformed Authorization header')
    throw new Error('Unauthorized')
  }

  const token = authHeader.slice(7)
  const claims = extractClaims(token)

  const tokenTenantId = claims['custom:tenantId']
  const userId = claims['custom:userId'] ?? claims['sub']
  const roles = claims['custom:roles'] ?? '[]'

  if (!headerTenantId) {
    logger.warn('X-Tenant-Id header missing')
    throw new Error('Unauthorized')
  }

  if (headerTenantId !== tokenTenantId) {
    logger.warn('Tenant mismatch', { headerTenantId, tokenTenantId })
    throw new Error('Unauthorized')
  }

  logger.info('Tenant authorized', { tenantId: tokenTenantId, userId })

  return {
    isAuthorized: true,
    context: {
      tenantId: tokenTenantId,
      userId,
      roles,
    },
  }
}
