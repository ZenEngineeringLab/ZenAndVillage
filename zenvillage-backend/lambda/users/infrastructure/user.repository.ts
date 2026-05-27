import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  UpdateCommand,
  ScanCommand,
} from '@aws-sdk/lib-dynamodb'
import type { User } from '../domain/user.entity.js'

const ddb = DynamoDBDocumentClient.from(new DynamoDBClient({}))
const TABLE = process.env.USERS_TABLE!

function toItem(user: User) {
  return {
    PK: `USER#${user.cognitoSub}`,
    SK: 'PROFILE',
    ...user,
  }
}

function fromItem(item: Record<string, any>): User {
  const { PK, SK, ...user } = item
  return user as User
}

export const userRepository = {
  async create(user: User): Promise<void> {
    await ddb.send(new PutCommand({
      TableName: TABLE,
      Item: toItem(user),
      ConditionExpression: 'attribute_not_exists(PK)',
    }))
  },

  async findBySub(cognitoSub: string): Promise<User | null> {
    const result = await ddb.send(new GetCommand({
      TableName: TABLE,
      Key: { PK: `USER#${cognitoSub}`, SK: 'PROFILE' },
    }))
    return result.Item ? fromItem(result.Item) : null
  },

  async findById(id: string): Promise<User | null> {
    // Scan by id — acceptable at this scale; replace with GSI if needed
    const result = await ddb.send(new ScanCommand({
      TableName: TABLE,
      FilterExpression: 'id = :id',
      ExpressionAttributeValues: { ':id': id },
      Limit: 1,
    }))
    const item = result.Items?.[0]
    return item ? fromItem(item) : null
  },

  async updateOnboardingStatus(
    cognitoSub: string,
    onboardingStatus: User['onboardingStatus'],
  ): Promise<void> {
    await ddb.send(new UpdateCommand({
      TableName: TABLE,
      Key: { PK: `USER#${cognitoSub}`, SK: 'PROFILE' },
      UpdateExpression: 'SET onboardingStatus = :s',
      ExpressionAttributeValues: { ':s': onboardingStatus },
    }))
  },
}
