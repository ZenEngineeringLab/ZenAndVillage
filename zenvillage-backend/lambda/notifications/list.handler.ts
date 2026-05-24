import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, ScanCommand } from '@aws-sdk/lib-dynamodb'
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
  const qs = event.queryStringParameters ?? {}
  const page = Number(qs['page'] ?? 1)
  const pageSize = Number(qs['pageSize'] ?? 20)

  try {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': `TENANT#${tenantId}#USER#${userId}#NOTIF#`,
        ':sk': 'PROFILE',
      },
    }))

    const items = (result.Items ?? []).sort((a, b) =>
      new Date(b['createdAt']).getTime() - new Date(a['createdAt']).getTime()
    )
    const total = items.length
    const data = items.slice((page - 1) * pageSize, page * pageSize)
    metrics.addMetric('NotificationsListed', MetricUnit.Count, 1)
    return ok({ items: data, pagination: { page, pageSize, total, totalPages: Math.ceil(total / pageSize) } })
  } catch (err) {
    logger.error('Failed to list notifications', { err, requestId })
    return internalError('Failed to retrieve notifications', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
