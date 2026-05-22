import type { PreTokenGenerationV2TriggerEvent } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'

const logger = new Logger({ serviceName: 'pre-token-generation' })
const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))

const USERS_TABLE = process.env.USERS_TABLE!

export const handler = async (event: PreTokenGenerationV2TriggerEvent) => {
  const sub = event.request.userAttributes.sub
  const email = event.request.userAttributes.email

  logger.info('Pre-token generation triggered', { sub, email })

  const result = await ddb.send(new GetCommand({
    TableName: USERS_TABLE,
    Key: { PK: `USER#${sub}`, SK: 'PROFILE' },
  }))

  const user = result.Item
  if (!user) {
    logger.error('User record not found in DynamoDB', { sub })
    throw new Error(`User ${sub} not found in users table`)
  }

  event.response = {
    claimsAndScopeOverrideDetails: {
      idTokenGeneration: {
        claimsToAddOrOverride: {
          'custom:tenantId': user.tenantId,
          'custom:roles': JSON.stringify(user.roles ?? []),
          'custom:userId': user.id,
          'custom:locale': user.locale ?? 'auto',
        },
      },
      accessTokenGeneration: {
        claimsToAddOrOverride: {
          'custom:tenantId': user.tenantId,
          'custom:roles': JSON.stringify(user.roles ?? []),
          'custom:userId': user.id,
        },
      },
    },
  }

  return event
}
