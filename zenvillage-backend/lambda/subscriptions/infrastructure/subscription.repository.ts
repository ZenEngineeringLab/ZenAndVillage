import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Subscription } from '../domain/subscription.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.SUBSCRIPTIONS_TABLE!

function toItem(sub: Subscription) {
  return {
    PK: `SUBSCRIPTION#${sub.id}`,
    SK: 'METADATA',
    ...sub,
  }
}

function fromItem(item: Record<string, any>): Subscription {
  const { PK, SK, ...sub } = item
  return sub as Subscription
}

export const subscriptionRepository = {
  async create(sub: Subscription): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: toItem(sub),
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async getById(id: string): Promise<Subscription | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `SUBSCRIPTION#${id}`, SK: 'METADATA' },
    }))
    return result.Item ? fromItem(result.Item) : null
  },

  /** Returns all subscriptions — admin use only. */
  async listAll(): Promise<Subscription[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': 'METADATA' },
    }))
    return (result.Items ?? []).map(fromItem)
  },

  /** Returns all subscriptions for a given tenant. */
  async listByTenant(tenantId: string): Promise<Subscription[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'SK = :sk AND tenantId = :tid',
      ExpressionAttributeValues: { ':sk': 'METADATA', ':tid': tenantId },
    }))
    return (result.Items ?? []).map(fromItem)
  },

  async update(id: string, patch: Partial<Omit<Subscription, 'id' | 'requestedAt'>>): Promise<void> {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `SUBSCRIPTION#${id}`, SK: 'METADATA' },
      UpdateExpression: `SET ${updates.join(', ')}`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: values,
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}
