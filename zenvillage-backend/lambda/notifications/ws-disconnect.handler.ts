import type { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

// queryStringParameters is present on $disconnect events but missing from the
// @types/aws-lambda type definition for WebSocket events — extend it locally.
type WsDisconnectEvent = APIGatewayProxyWebsocketEventV2 & {
  queryStringParameters?: Record<string, string>
}
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, DeleteCommand } from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.CONNECTIONS_TABLE!

const decodeJwtPayload = (token: string): Record<string, string> => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))
}

export const handler = async (event: WsDisconnectEvent) => {
  const token = event.queryStringParameters?.['token']
  if (!token) {
    return { statusCode: 200 }
  }

  let tenantId: string
  let userId: string
  try {
    const payload = decodeJwtPayload(token)
    tenantId = payload['custom:tenantId']
    userId = payload['custom:userId']
    if (!tenantId || !userId) throw new Error('Missing claims')
  } catch {
    return { statusCode: 200 }
  }

  const connectionId = event.requestContext.connectionId

  await ddb.send(new DeleteCommand({
    TableName: TABLE,
    Key: {
      PK: `TENANT#${tenantId}#USER#${userId}`,
      SK: `CONN#${connectionId}`,
    },
  }))

  return { statusCode: 200 }
}
