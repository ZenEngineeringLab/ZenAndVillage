/**
 * Generic DynamoDB repository for all Condominium sub-entities.
 *
 * All sub-entities share the `zenvillage-condominiums-{env}` table.
 *
 * Key patterns:
 *   Block      PK = TENANT#${tenantId}#CONDO#${condoId}  SK = BLOCK#${id}
 *   Unit       PK = TENANT#${tenantId}#CONDO#${condoId}  SK = UNIT#${id}
 *   Owner      PK = TENANT#${tenantId}#CONDO#${condoId}  SK = UNIT#${unitId}#OWNER#${id}
 *   Occupant   PK = TENANT#${tenantId}#CONDO#${condoId}  SK = UNIT#${unitId}#OCCUPANT#${id}
 */
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  PutCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from '@aws-sdk/lib-dynamodb'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.CONDOMINIUMS_TABLE!

const condoPK = (tenantId: string, condoId: string) =>
  `TENANT#${tenantId}#CONDO#${condoId}`

// ─── Blocks ──────────────────────────────────────────────────────────────────

export const blockRepository = {
  async list(tenantId: string, condoId: string) {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': condoPK(tenantId, condoId),
        ':prefix': 'BLOCK#',
      },
    }))
    return (result.Items ?? []).map(({ PK, SK, ...rest }) => rest)
  },

  async create(item: Record<string, any>) {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        ...item,
        PK: condoPK(item.tenantId, item.condoId),
        SK: `BLOCK#${item.id}`,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, condoId: string, id: string, patch: Record<string, any>) {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `BLOCK#${id}` },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(tenantId: string, condoId: string, id: string) {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `BLOCK#${id}` },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}

// ─── Units ────────────────────────────────────────────────────────────────────

export const unitRepository = {
  async list(tenantId: string, condoId: string) {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': condoPK(tenantId, condoId),
        ':prefix': 'UNIT#',
      },
    }))
    // Exclude owner and occupant items (their SK starts with UNIT#{id}#OWNER / UNIT#{id}#OCCUPANT)
    return (result.Items ?? [])
      .filter(item => /^UNIT#[^#]+$/.test(item.SK))
      .map(({ PK, SK, ...rest }) => rest)
  },

  async create(item: Record<string, any>) {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        ...item,
        PK: condoPK(item.tenantId, item.condoId),
        SK: `UNIT#${item.id}`,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, condoId: string, id: string, patch: Record<string, any>) {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${id}` },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(tenantId: string, condoId: string, id: string) {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${id}` },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}

// ─── Owners ───────────────────────────────────────────────────────────────────

export const ownerRepository = {
  async list(tenantId: string, condoId: string, unitId: string) {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': condoPK(tenantId, condoId),
        ':prefix': `UNIT#${unitId}#OWNER#`,
      },
    }))
    return (result.Items ?? []).map(({ PK, SK, ...rest }) => rest)
  },

  async create(item: Record<string, any>) {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        ...item,
        PK: condoPK(item.tenantId, item.condoId),
        SK: `UNIT#${item.unitId}#OWNER#${item.id}`,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, condoId: string, unitId: string, id: string, patch: Record<string, any>) {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${unitId}#OWNER#${id}` },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(tenantId: string, condoId: string, unitId: string, id: string) {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${unitId}#OWNER#${id}` },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}

// ─── OccupantTenants ──────────────────────────────────────────────────────────

export const occupantRepository = {
  async list(tenantId: string, condoId: string, unitId: string) {
    const result = await ddb.send(new QueryCommand({
      TableName: TABLE,
      KeyConditionExpression: 'PK = :pk AND begins_with(SK, :prefix)',
      ExpressionAttributeValues: {
        ':pk': condoPK(tenantId, condoId),
        ':prefix': `UNIT#${unitId}#OCCUPANT#`,
      },
    }))
    return (result.Items ?? []).map(({ PK, SK, ...rest }) => rest)
  },

  async create(item: Record<string, any>) {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: {
        ...item,
        PK: condoPK(item.tenantId, item.condoId),
        SK: `UNIT#${item.unitId}#OCCUPANT#${item.id}`,
      },
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async update(tenantId: string, condoId: string, unitId: string, id: string, patch: Record<string, any>) {
    const entries = Object.entries(patch)
    if (entries.length === 0) return
    const updates = entries.map(([k], i) => `#f${i} = :v${i}`)
    const names = Object.fromEntries(entries.map(([k], i) => [`#f${i}`, k]))
    const values = Object.fromEntries(entries.map(([, v], i) => [`:v${i}`, v]))
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${unitId}#OCCUPANT#${id}` },
      UpdateExpression: `SET ${updates.join(', ')}, updatedAt = :ua`,
      ExpressionAttributeNames: names,
      ExpressionAttributeValues: { ...values, ':ua': new Date().toISOString() },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },

  async delete(tenantId: string, condoId: string, unitId: string, id: string) {
    await ddb.send(new DeleteCommand({
      TableName: TABLE,
      Key: { PK: condoPK(tenantId, condoId), SK: `UNIT#${unitId}#OCCUPANT#${id}` },
      ConditionExpression: 'attribute_exists(PK)',
    }))
  },
}
