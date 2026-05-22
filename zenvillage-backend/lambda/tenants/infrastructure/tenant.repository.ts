import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import type { Tenant } from '../domain/tenant.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.TENANTS_TABLE!

const PK = (platformTenantId: string, id: string) =>
  `TENANT#${platformTenantId}#TENANT#${id}`

export const tenantRepository = {
  async list(platformTenantId: string): Promise<Tenant[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: {
        ':prefix': `TENANT#${platformTenantId}#TENANT#`,
        ':sk': 'PROFILE',
      },
    }))
    return (result.Items ?? []) as Tenant[]
  },

  async getById(platformTenantId: string, id: string): Promise<Tenant | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: PK(platformTenantId, id), SK: 'PROFILE' },
    }))
    return (result.Item as Tenant) ?? null
  },

  async create(tenant: Tenant): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        ...tenant,
        PK: PK(tenant.tenantId, tenant.id),
        SK: 'PROFILE',
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(platformTenantId: string, id: string, patch: Partial<Tenant>): Promise<void> {
    const entries = Object.entries(patch).filter(([k]) => !['id', 'tenantId', 'createdAt'].includes(k))
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))

    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: PK(platformTenantId, id), SK: 'PROFILE' },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(platformTenantId: string, id: string): Promise<void> {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: PK(platformTenantId, id), SK: 'PROFILE' },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}
