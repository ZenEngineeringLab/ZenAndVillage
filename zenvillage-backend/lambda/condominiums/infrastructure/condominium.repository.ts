import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { Condominium } from '../domain/condominium.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.CONDOMINIUMS_TABLE!

const PK = (tenantId: string, id: string) => `TENANT#${tenantId}#CONDO#${id}`

export const condominiumRepository = {
  async list(tenantId: string): Promise<Condominium[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: { ':prefix': `TENANT#${tenantId}#CONDO#`, ':sk': 'PROFILE' },
    }))
    return (result.Items ?? []) as Condominium[]
  },

  async getById(tenantId: string, id: string): Promise<Condominium | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: PK(tenantId, id), SK: 'PROFILE' },
    }))
    return (result.Item as Condominium) ?? null
  },

  async create(condo: Condominium): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: { ...condo, PK: PK(condo.tenantId, condo.id), SK: 'PROFILE' },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, id: string, patch: Partial<Condominium>): Promise<void> {
    const entries = Object.entries(patch).filter(([k]) => !['id', 'tenantId', 'createdAt'].includes(k))
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: PK(tenantId, id), SK: 'PROFILE' },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(tenantId: string, id: string): Promise<void> {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: PK(tenantId, id), SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}
