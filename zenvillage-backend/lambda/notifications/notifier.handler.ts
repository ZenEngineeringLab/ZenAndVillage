import type { SQSHandler, SQSRecord } from 'aws-lambda'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
import { ApiGatewayManagementApiClient, PostToConnectionCommand } from '@aws-sdk/client-apigatewaymanagementapi'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const ssm = new SSMClient({})
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!
const WS_SSM_PATH = process.env.WS_SSM_PATH!
const WS_STAGE = process.env.WS_STAGE!

// Cached at cold-start to avoid SSM lookup on every invocation.
let wsEndpoint: string | undefined

async function getWsEndpoint(): Promise<string> {
  if (wsEndpoint) return wsEndpoint
  const result = await ssm.send(new GetParameterCommand({ Name: WS_SSM_PATH }))
  wsEndpoint = `${result.Parameter!.Value!}/${WS_STAGE}`
  return wsEndpoint
}

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
  const endpoint = await getWsEndpoint()
  const apigw = new ApiGatewayManagementApiClient({ endpoint })
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
