import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, UpdateCommand } from '@aws-sdk/lib-dynamodb'
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
  const id = event.pathParameters?.id ?? ''

  try {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: {
        PK: `TENANT#${tenantId}#USER#${userId}#NOTIF#${id}`,
        SK: 'PROFILE',
      },
      UpdateExpression: 'SET #r = :r, updatedAt = :ua',
      ExpressionAttributeNames: { '#r': 'read' },
      ExpressionAttributeValues: { ':r': true, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
    metrics.addMetric('NotificationMarkedRead', MetricUnit.Count, 1)
    return ok({ id, read: true })
  } catch (err) {
    logger.error('Failed to mark notification as read', { err, id, requestId })
    return internalError('Failed to mark notification as read', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
