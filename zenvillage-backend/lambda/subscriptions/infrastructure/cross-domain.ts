/**
 * Cross-domain DynamoDB updates performed by Subscription approval/rejection.
 *
 * The Subscriptions Lambda is granted read/write access to both the Tenants
 * and Users tables by its CDK stack, so direct SDK calls here are intentional.
 * This avoids service-to-service HTTP calls and keeps the operation synchronous.
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TENANTS_TABLE = process.env.TENANTS_TABLE!
const USERS_TABLE = process.env.USERS_TABLE!

/**
 * Updates Tenant.subscriptionStatus and optionally subscriptionStartDate.
 *
 * Tenants table key: PK = TENANT#{tenantId}#TENANT#{tenantId}, SK = PROFILE
 * (the tenant record uses its own id as both the platform-tenant prefix and
 * the entity id, matching the pattern in tenant.repository.ts).
 */
export async function updateTenantSubscriptionStatus(
  tenantId: string,
  subscriptionStatus: string,
  subscriptionStartDate?: string,
): Promise<void> {
  const updateExpr = subscriptionStartDate
    ? 'SET subscriptionStatus = :s, subscriptionStartDate = :sd'
    : 'SET subscriptionStatus = :s'

  const values: Record<string, any> = { ':s': subscriptionStatus }
  if (subscriptionStartDate) values[':sd'] = subscriptionStartDate

  await ddb.send(new UpdateCommand({
    TableName: TENANTS_TABLE,
    Key: {
      PK: `TENANT#${tenantId}#TENANT#${tenantId}`,
      SK: 'PROFILE',
    },
    UpdateExpression: updateExpr,
    ExpressionAttributeValues: values,
  }))
}

/**
 * Updates User.onboardingStatus using the user's cognitoSub.
 *
 * Users table key: PK = USER#{cognitoSub}, SK = PROFILE
 */
export async function updateUserOnboardingStatus(
  cognitoSub: string,
  onboardingStatus: string,
): Promise<void> {
  await ddb.send(new UpdateCommand({
    TableName: USERS_TABLE,
    Key: { PK: `USER#${cognitoSub}`, SK: 'PROFILE' },
    UpdateExpression: 'SET onboardingStatus = :s',
    ExpressionAttributeValues: { ':s': onboardingStatus },
  }))
}
