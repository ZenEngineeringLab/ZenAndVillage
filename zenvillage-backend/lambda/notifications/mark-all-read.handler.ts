import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { extractContext } from '../shared/extract-context.js'
import { ok, internalError } from '../shared/response-helpers.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.NOTIFICATIONS_TABLE!

const logger = new Logger({ serviceName: 'notifications' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Notifications' })
const tracer = new Tracer({ serviceName: 'notifications' })

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, userId, requestId } = extractContext(event)

  try {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk AND #r = :unread',
      ExpressionAttributeNames: { '#r': 'read' },
      ExpressionAttributeValues: {
        ':prefix': `TENANT#${tenantId}#USER#${userId}#NOTIF#`,
        ':sk': 'PROFILE',
        ':unread': false,
      },
    }))

    const unread = result.Items ?? []
    const now = new Date().toISOString()

    await Promise.all(
      unread.map(item =>
        ddb.send(new UpdateCommand({
          TableName: TABLE,
          Key: { PK: item['PK'], SK: 'PROFILE' },
          UpdateExpression: 'SET #r = :r, updatedAt = :ua',
          ExpressionAttributeNames: { '#r': 'read' },
          ExpressionAttributeValues: { ':r': true, ':ua': now },
        }))
      )
    )

    metrics.addMetric('NotificationsAllMarkedRead', MetricUnit.Count, 1)
    return ok({ updated: unread.length })
  } catch (err) {
    logger.error('Failed to mark all notifications as read', { err, requestId })
    return internalError('Failed to mark all notifications as read', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
