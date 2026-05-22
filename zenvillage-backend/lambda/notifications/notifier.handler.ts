import type { SQSHandler, SQSRecord } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!
const WS_ENDPOINT = process.env.WS_ENDPOINT!

interface NotificationPayload {
  tenantId: string
  [key: string]: unknown
}

const processRecord = async (record: SQSRecord): Promise<void> => {
  const notification: NotificationPayload = JSON.parse(record.body)

  const result = await ddb.send(new ScanCommand({
    TableName: CONNECTIONS_TABLE,
    FilterExpression: 'begins_with(PK, :prefix)',
    ExpressionAttributeValues: {
      ':prefix': `TENANT#${notification.tenantId}#USER#`,
    },
  }))

  const connections = result.Items ?? []
  const apigw = new ApiGatewayManagementApiClient({ endpoint: WS_ENDPOINT })
  const data = Buffer.from(JSON.stringify(notification))

  await Promise.allSettled(
    connections.map(conn =>
      apigw.send(new PostToConnectionCommand({
        ConnectionId: conn['connectionId'] as string,
        Data: data,
      }))
    )
  )
}

export const handler: SQSHandler = async (event) => {
  await Promise.allSettled(event.Records.map(processRecord))
}
