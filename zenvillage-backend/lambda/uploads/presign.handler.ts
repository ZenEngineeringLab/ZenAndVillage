import type { APIGatewayProxyEventV2WithLambdaAuthorizer } from 'aws-lambda'
import middy from '@middy/core'
import jsonBodyParser from '@middy/http-json-body-parser'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { S3Client } from '@aws-sdk/client-s3'
import { createPresignedPost } from '@aws-sdk/s3-presigned-post'
import { Logger } from '@aws-lambda-powertools/logger'
import { Metrics, MetricUnit } from '@aws-lambda-powertools/metrics'
import { Tracer } from '@aws-lambda-powertools/tracer'
import { injectLambdaContext } from '@aws-lambda-powertools/logger/middleware'
import { captureLambdaHandler } from '@aws-lambda-powertools/tracer/middleware'
import { logMetrics } from '@aws-lambda-powertools/metrics/middleware'
import { randomUUID } from 'crypto'
import { extractContext } from '../shared/extract-context.js'
import { created, badRequest, internalError } from '../shared/response-helpers.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const s3 = new S3Client({})
const TABLE = process.env.FILES_TABLE!
const BUCKET = process.env.UPLOADS_BUCKET!

const logger = new Logger({ serviceName: 'uploads' })
const metrics = new Metrics({ namespace: 'ZenAndVillage/Uploads' })
const tracer = new Tracer({ serviceName: 'uploads' })

interface PresignBody {
  filename: string
  contentType: string
  domain: string
  metadata?: Record<string, string>
}

const mainHandler = async (event: APIGatewayProxyEventV2WithLambdaAuthorizer<any>) => {
  const { tenantId, userId, requestId } = extractContext(event)
  const body = (event as any).body as Partial<PresignBody>

  if (!body?.filename || !body?.contentType || !body?.domain) {
    return badRequest('filename, contentType, and domain are required', requestId)
  }

  const fileId = randomUUID()
  const key = `${tenantId}/${body.domain}/${fileId}/${body.filename}`
  const expiresAt = Date.now() + 300_000

  try {
    const { url, fields } = await createPresignedPost(s3, {
      Bucket: BUCKET,
      Key: key,
      Conditions: [
        ['content-length-range', 0, 52_428_800],
        ['starts-with', '$Content-Type', ''],
      ],
      Fields: { 'Content-Type': body.contentType },
      Expires: 300,
    })

    const now = new Date().toISOString()
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        PK: `TENANT#${tenantId}#FILE#${fileId}`,
        SK: 'PROFILE',
        fileId,
        tenantId,
        uploadedBy: userId,
        filename: body.filename,
        contentType: body.contentType,
        domain: body.domain,
        metadata: body.metadata ?? {},
        key,
        status: 'PENDING',
        createdAt: now,
        updatedAt: now,
      },
    }))

    metrics.addMetric('PresignedUrlGenerated', MetricUnit.Count, 1)
    return created({ uploadUrl: url, fields, fileId, expiresAt })
  } catch (err) {
    logger.error('Failed to generate presigned URL', { err, requestId })
    return internalError('Failed to generate presigned upload URL', requestId)
  }
}

export const handler = middy(mainHandler)
  .use(jsonBodyParser())
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics))
