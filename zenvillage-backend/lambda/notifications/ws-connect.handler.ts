import type { APIGatewayProxyWebsocketEventV2 } from 'aws-lambda'

// queryStringParameters is present on $connect events but missing from the
// @types/aws-lambda type definition for WebSocket events — extend it locally.
type WsConnectEvent = APIGatewayProxyWebsocketEventV2 & {
  queryStringParameters?: Record<string, string>
}
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.CONNECTIONS_TABLE!

const decodeJwtPayload = (token: string): Record<string, string> => {
  const parts = token.split('.')
  if (parts.length !== 3) throw new Error('Invalid JWT format')
  const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/')
  const padded = payload + '='.repeat((4 - (payload.length % 4)) % 4)
  return JSON.parse(Buffer.from(padded, 'base64').toString('utf-8'))
}

export const handler = async (event: WsConnectEvent) => {
  const token = event.queryStringParameters?.['token']
  if (!token) {
    return { statusCode: 401 }
  }

  let tenantId: string
  let userId: string
  try {
    const payload = decodeJwtPayload(token)
    tenantId = payload['custom:tenantId']
    userId = payload['custom:userId']
    if (!tenantId || !userId) throw new Error('Missing claims')
  } catch {
    return { statusCode: 401 }
  }

  const connectionId = event.requestContext.connectionId
  const ttl = Math.floor(Date.now() / 1000) + 7200

  await ddb.send(new PutCommand({
    TableName: TABLE,
    Item: {
      PK: `TENANT#${tenantId}#USER#${userId}`,
      SK: `CONN#${connectionId}`,
      connectionId,
      tenantId,
      userId,
      ttl,
      connectedAt: new Date().toISOString(),
    },
  }))

  return { statusCode: 200 }
}
