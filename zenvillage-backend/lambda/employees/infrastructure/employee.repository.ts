import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, GetCommand, PutCommand, UpdateCommand, DeleteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb'
import type { Employee } from '../domain/employee.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.EMPLOYEES_TABLE!

const PK = (tenantId: string, id: string) => `TENANT#${tenantId}#EMPLOYEE#${id}`

export const employeeRepository = {
  async list(tenantId: string, condoId?: string): Promise<Employee[]> {
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'begins_with(PK, :prefix) AND SK = :sk',
      ExpressionAttributeValues: { ':prefix': `TENANT#${tenantId}#EMPLOYEE#`, ':sk': 'PROFILE' },
    }))
    const items = (result.Items ?? []) as Employee[]
    return condoId ? items.filter(e => e.condoId === condoId) : items
  },

  async getById(tenantId: string, id: string): Promise<Employee | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: PK(tenantId, id), SK: 'PROFILE' },
    }))
    return (result.Item as Employee) ?? null
  },

  async create(employee: Employee): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: { ...employee, PK: PK(employee.tenantId, employee.id), SK: 'PROFILE' },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, id: string, patch: Partial<Employee>): Promise<void> {
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
