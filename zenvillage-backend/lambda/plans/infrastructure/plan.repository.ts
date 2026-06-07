import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Plan } from '../domain/plan.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.PLANS_TABLE!

function toItem(plan: Plan) {
  return {
    PK: `PLAN#${plan.id}`,
    SK: 'METADATA',
    ...plan,
  }
}

function fromItem(item: Record<string, any>): Plan {
  const { PK, SK, ...plan } = item
  return plan as Plan
}

export const planRepository = {
  /** Returns all plans (including discontinued). For admin use. */
  async listAll(): Promise<Plan[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'SK = :sk',
      ExpressionAttributeValues: { ':sk': 'METADATA' },
    }))
    return (result.Items ?? []).map(fromItem)
  },

  /** Returns only active plans where public = true. For self-service plan selection. */
  async listPublicActive(): Promise<Plan[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'SK = :sk AND #st = :active AND #pub = :true',
      ExpressionAttributeNames: {
        '#st': 'status',
        '#pub': 'public',
      },
      ExpressionAttributeValues: {
        ':sk': 'METADATA',
        ':active': 'active',
        ':true': true,
      },
    }))
    return (result.Items ?? []).map(fromItem)
  },

  async getById(id: string): Promise<Plan | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `PLAN#${id}`, SK: 'METADATA' },
    }))
    return result.Item ? fromItem(result.Item) : null
  },

  async create(plan: Plan): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: toItem(plan),
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(id: string, patch: Partial<Omit<Plan, 'id' | 'createdAt'>>): Promise<void> {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `PLAN#${id}`, SK: 'METADATA' },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}
