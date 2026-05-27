import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'

const logger = new Logger({ serviceName: 'pre-token-generation' })
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: PreTokenGenerationV2TriggerEvent) => {
  const sub = event.request.userAttributes.sub
  const email = event.request.userAttributes.email
  const isEmailVerified = event.request.userAttributes.email_verified === 'true'

  logger.info('Pre-token generation triggered', { sub, email, isEmailVerified })

  const result = await ddb.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { PK: `USER#${sub}`, SK: 'PROFILE' },
  }))

  const user = result.Item
  if (!user) {
    logger.error('User record not found in DynamoDB', { sub })
    throw new Error(`User ${sub} not found in users table`)
  }

  let onboardingStatus: string = user.onboardingStatus ?? 'pending_verification'

  // Auto-advance: if email is verified but status is still pending_verification,
  // promote to pending_subscription so the frontend can skip the verify-email screen.
  if (isEmailVerified && onboardingStatus === 'pending_verification') {
    logger.info('Auto-advancing onboardingStatus to pending_subscription', { sub })
    try {
      await ddb.send(new UpdateCommand({
        TableName: USERS_TABLE,
        Key: { PK: `USER#${sub}`, SK: 'PROFILE' },
        UpdateExpression: 'SET onboardingStatus = :s, updatedAt = :t',
        ExpressionAttributeValues: {
          ':s': 'pending_subscription',
          ':t': new Date().toISOString(),
        },
      }))
      onboardingStatus = 'pending_subscription'
    } catch (err) {
      // Non-fatal — token will still be issued with pending_verification;
      // the next sign-in will retry the advancement.
      logger.error('Failed to auto-advance onboardingStatus', { sub, err })
    }
  }

  event.response = {
    claimsAndScopeOverrideDetails: {
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'custom:tenantId':         user.tenantId ?? '',
          'custom:roles':            JSON.stringify(user.roles ?? []),
          'custom:userId':           user.id,
          'custom:locale':           user.locale ?? 'auto',
          'custom:onboardingStatus': onboardingStatus,
        },
      },
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'custom:tenantId':         user.tenantId ?? '',
          'custom:roles':            JSON.stringify(user.roles ?? []),
          'custom:userId':           user.id,
          'custom:onboardingStatus': onboardingStatus,
        },
      },
    },
  }

  return event
}
