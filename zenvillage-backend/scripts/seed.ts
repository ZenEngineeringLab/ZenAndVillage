#!/usr/bin/env ts-node
/**
 * Seed script for staging environment.
 * Usage: npx ts-node scripts/seed.ts --env=staging
 */

import { randomUUID } from 'crypto'
import {
  CognitoIdentityProviderClient,
  AdminCreateUserCommand,
  AdminSetUserPasswordCommand,
  AdminGetUserCommand,
} from '@aws-sdk/client-cognito-identity-provider'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand } from '@aws-sdk/lib-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------
const envArg = process.argv.find((a) => a.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : 'staging'
const region = process.env.AWS_REGION ?? 'us-east-1'

console.log(`[seed] Environment: ${env}  Region: ${region}`)

// ---------------------------------------------------------------------------
// AWS clients
// ---------------------------------------------------------------------------
const cognitoClient = new CognitoIdentityProviderClient({ region })
const dynamoClient = DynamoDBDocumentClient.from(new DynamoDBClient({ region }))
const ssmClient = new SSMClient({ region })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
async function getSsmParam(name: string): Promise<string> {
  const response = await ssmClient.send(
    new GetParameterCommand({ Name: name, WithDecryption: false }),
  )
  const value = response.Parameter?.Value
  if (!value) throw new Error(`SSM parameter not found: ${name}`)
  return value
}

async function putItem(tableName: string, item: Record<string, unknown>): Promise<void> {
  await dynamoClient.send(new PutCommand({ TableName: tableName, Item: item }))
}

function now(): string {
  return new Date().toISOString()
}

function daysFromNow(days: number): string {
  const d = new Date()
  d.setDate(d.getDate() + days)
  return d.toISOString()
}

// ---------------------------------------------------------------------------
// Table names
// ---------------------------------------------------------------------------
const TENANTS_TABLE = `zenvillage-tenants-${env}`
const PROPERTY_MANAGERS_TABLE = `zenvillage-property-managers-${env}`
const CONDOMINIUMS_TABLE = `zenvillage-condominiums-${env}`
const RESIDENTS_TABLE = `zenvillage-residents-${env}`
const EMPLOYEES_TABLE = `zenvillage-employees-${env}`
const USERS_TABLE = `zenvillage-users-${env}`

// ---------------------------------------------------------------------------
// IDs (generated once so they can be referenced across entities)
// ---------------------------------------------------------------------------
const t1Id = randomUUID()
const t2Id = randomUUID()
const t3Id = randomUUID()

const pm1Id = randomUUID()
const pm2Id = randomUUID()

const c1Id = randomUUID()
const c2Id = randomUUID()
const c3Id = randomUUID()

const r1Id = randomUUID()
const r2Id = randomUUID()
const r3Id = randomUUID()
const r4Id = randomUUID()
const r5Id = randomUUID()

const e1Id = randomUUID()
const e2Id = randomUUID()
const e3Id = randomUUID()
const e4Id = randomUUID()

// ---------------------------------------------------------------------------
// Seed: Tenants
// ---------------------------------------------------------------------------
async function seedTenants(): Promise<void> {
  const tenants = [
    {
      PK: `TENANT#${t1Id}#TENANT#${t1Id}`,
      SK: 'PROFILE',
      id: t1Id,
      name: 'Administradora Ágatha & Cia',
      type: 'management_company',
      plan: 'pro',
      status: 'active',
      condosUsed: 4,
      condosLimit: 10,
      unitsUsed: 480,
      unitsLimit: 1000,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t2Id}#TENANT#${t2Id}`,
      SK: 'PROFILE',
      id: t2Id,
      name: 'Residencial Vista Verde',
      type: 'independent_condo',
      plan: 'starter',
      status: 'trial',
      subscriptionStatus: 'trial',
      trialEndDate: daysFromNow(8),
      condosUsed: 1,
      condosLimit: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t3Id}#TENANT#${t3Id}`,
      SK: 'PROFILE',
      id: t3Id,
      name: 'Habitex Administração',
      type: 'management_company',
      plan: 'enterprise',
      status: 'active',
      condosUsed: 7,
      condosLimit: 50,
      unitsUsed: 840,
      unitsLimit: 5000,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(tenants.map((item) => putItem(TENANTS_TABLE, item)))
  console.log(`[seed] Tenants created: ${tenants.length}`)
}

// ---------------------------------------------------------------------------
// Seed: Property Managers
// ---------------------------------------------------------------------------
async function seedPropertyManagers(): Promise<void> {
  const propertyManagers = [
    {
      PK: `TENANT#${t1Id}#PROPERTY_MANAGER#${pm1Id}`,
      SK: 'PROFILE',
      id: pm1Id,
      tenantId: t1Id,
      legalName: 'Ágatha Mendes e Cia Ltda',
      tradeName: 'Administradora Ágatha & Cia',
      whiteLabelEnabled: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t3Id}#PROPERTY_MANAGER#${pm2Id}`,
      SK: 'PROFILE',
      id: pm2Id,
      tenantId: t3Id,
      legalName: 'Habitex Administração e Gestão Ltda',
      tradeName: 'Habitex Administração',
      whiteLabelEnabled: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(propertyManagers.map((item) => putItem(PROPERTY_MANAGERS_TABLE, item)))
  console.log(`[seed] Property managers created: ${propertyManagers.length}`)
}

// ---------------------------------------------------------------------------
// Seed: Condominiums
// ---------------------------------------------------------------------------
async function seedCondominiums(): Promise<void> {
  const condominiums = [
    {
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c1Id}`,
      SK: 'PROFILE',
      id: c1Id,
      tenantId: t1Id,
      name: 'Condomínio Jardim das Águas',
      type: 'residential',
      city: 'São Paulo',
      state: 'SP',
      totalUnits: 200,
      totalBlocks: 4,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c2Id}`,
      SK: 'PROFILE',
      id: c2Id,
      tenantId: t1Id,
      name: 'Edifício Central Park',
      type: 'mixed',
      city: 'Campinas',
      state: 'SP',
      totalUnits: 80,
      totalBlocks: 1,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c3Id}`,
      SK: 'PROFILE',
      id: c3Id,
      tenantId: t1Id,
      name: 'Residencial Solar Poente',
      type: 'residential',
      city: 'Santos',
      state: 'SP',
      totalUnits: 120,
      totalBlocks: 2,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(condominiums.map((item) => putItem(CONDOMINIUMS_TABLE, item)))
  console.log(`[seed] Condominiums created: ${condominiums.length}`)
}

// ---------------------------------------------------------------------------
// Seed: Residents
// ---------------------------------------------------------------------------
async function seedResidents(): Promise<void> {
  const residents = [
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r1Id}`,
      SK: 'PROFILE',
      id: r1Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Ana Lima',
      ownershipType: 'owner',
      unit: '302',
      financialStatus: 'current',
      isBoardMember: true,
      isSyndic: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r2Id}`,
      SK: 'PROFILE',
      id: r2Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Carlos Andrade',
      ownershipType: 'owner',
      unit: '501',
      financialStatus: 'current',
      isBoardMember: false,
      isSyndic: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r3Id}`,
      SK: 'PROFILE',
      id: r3Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Beatriz Santos',
      ownershipType: 'tenant',
      unit: '105',
      financialStatus: 'current',
      isBoardMember: false,
      isSyndic: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r4Id}`,
      SK: 'PROFILE',
      id: r4Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Roberto Melo',
      ownershipType: 'owner',
      unit: '212',
      financialStatus: 'delinquent',
      isBoardMember: false,
      isSyndic: false,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r5Id}`,
      SK: 'PROFILE',
      id: r5Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Fernanda Costa',
      ownershipType: 'owner',
      unit: '408',
      financialStatus: 'current',
      isBoardMember: false,
      isSyndic: false,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(residents.map((item) => putItem(RESIDENTS_TABLE, item)))
  console.log(`[seed] Residents created: ${residents.length}`)
}

// ---------------------------------------------------------------------------
// Seed: Employees
// ---------------------------------------------------------------------------
async function seedEmployees(): Promise<void> {
  const employees = [
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e1Id}`,
      SK: 'PROFILE',
      id: e1Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'João Ferreira',
      role: 'superintendent',
      contractType: 'direct_clt',
      workSchedule: '44h',
      salary: 3200,
      currency: 'BRL',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e2Id}`,
      SK: 'PROFILE',
      id: e2Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Marcos Silva',
      role: 'doorman',
      contractType: 'direct_clt',
      workSchedule: '12x36',
      salary: 2800,
      currency: 'BRL',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e3Id}`,
      SK: 'PROFILE',
      id: e3Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Lúcia Rocha',
      role: 'general_services',
      contractType: 'outsourced',
      outsourcingCompany: 'Limpeza Total Ltda',
      workSchedule: '44h',
      salary: 2200,
      currency: 'BRL',
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e4Id}`,
      SK: 'PROFILE',
      id: e4Id,
      tenantId: t1Id,
      condoId: c1Id,
      name: 'Paulo Nunes',
      role: 'guard',
      contractType: 'outsourced',
      outsourcingCompany: 'SegMax Segurança',
      workSchedule: '12x36',
      salary: 3000,
      currency: 'BRL',
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(employees.map((item) => putItem(EMPLOYEES_TABLE, item)))
  console.log(`[seed] Employees created: ${employees.length}`)
}

// ---------------------------------------------------------------------------
// Seed: Cognito users + DynamoDB user records
// ---------------------------------------------------------------------------
interface UserSeedConfig {
  email: string
  tenantId: string
  label: string
}

const userConfigs: UserSeedConfig[] = [
  { email: 'admin-agatha@zenvillage.dev', tenantId: t1Id, label: 'Ágatha admin' },
  { email: 'admin-vistaverde@zenvillage.dev', tenantId: t2Id, label: 'Vista Verde admin' },
  { email: 'admin-habitex@zenvillage.dev', tenantId: t3Id, label: 'Habitex admin' },
]

async function seedCognitoUsers(userPoolId: string): Promise<void> {
  const temporaryPassword = 'ZenV1llage!2026'

  for (const config of userConfigs) {
    // Create user in Cognito
    let cognitoSub: string

    try {
      const createResponse = await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: config.email,
          TemporaryPassword: temporaryPassword,
          MessageAction: 'SUPPRESS',
          UserAttributes: [
            { Name: 'email', Value: config.email },
            { Name: 'email_verified', Value: 'true' },
            { Name: 'name', Value: config.label },
            { Name: 'custom:tenantId', Value: config.tenantId },
            { Name: 'custom:roles', Value: JSON.stringify(['tenant_admin']) },
            { Name: 'custom:locale', Value: 'auto' },
          ],
        }),
      )

      cognitoSub = createResponse.User?.Attributes?.find((a) => a.Name === 'sub')?.Value ?? randomUUID()
    } catch (err: unknown) {
      // User may already exist — fetch sub
      if (err instanceof Error && err.name === 'UsernameExistsException') {
        console.log(`[seed] User ${config.email} already exists — fetching sub`)
        const getResponse = await cognitoClient.send(
          new AdminGetUserCommand({ UserPoolId: userPoolId, Username: config.email }),
        )
        cognitoSub = getResponse.UserAttributes?.find((a) => a.Name === 'sub')?.Value ?? randomUUID()
      } else {
        throw err
      }
    }

    // Set permanent password
    await cognitoClient.send(
      new AdminSetUserPasswordCommand({
        UserPoolId: userPoolId,
        Username: config.email,
        Password: temporaryPassword,
        Permanent: true,
      }),
    )

    // Write user record to DynamoDB
    const userItem = {
      PK: `USER#${cognitoSub}`,
      SK: 'PROFILE',
      id: cognitoSub,
      email: config.email,
      tenantId: config.tenantId,
      roles: ['tenant_admin'],
      locale: 'auto',
      createdAt: now(),
      updatedAt: now(),
    }

    await putItem(USERS_TABLE, userItem)
    console.log(`[seed] Cognito user created: ${config.email}  sub=${cognitoSub}`)
  }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('[seed] Starting...')

  // Read Cognito pool id from SSM
  const userPoolId = await getSsmParam(`/zenvillage/${env}/cognito-pool-id`)
  console.log(`[seed] User Pool ID: ${userPoolId}`)

  // Seed DynamoDB tables in parallel where possible
  await Promise.all([
    seedTenants(),
    seedPropertyManagers(),
    seedCondominiums(),
    seedResidents(),
    seedEmployees(),
  ])

  // Seed Cognito users (sequential because each writes to DynamoDB after creating the user)
  await seedCognitoUsers(userPoolId)

  console.log('\n[seed] Done! Summary:')
  console.log(`  Tenants:           3 (IDs: ${t1Id}, ${t2Id}, ${t3Id})`)
  console.log(`  Property Managers: 2 (IDs: ${pm1Id}, ${pm2Id})`)
  console.log(`  Condominiums:      3 (IDs: ${c1Id}, ${c2Id}, ${c3Id})`)
  console.log(`  Residents:         5 (IDs: ${r1Id}, ${r2Id}, ${r3Id}, ${r4Id}, ${r5Id})`)
  console.log(`  Employees:         4 (IDs: ${e1Id}, ${e2Id}, ${e3Id}, ${e4Id})`)
  console.log(`  Cognito users:     3 (admin-agatha, admin-vistaverde, admin-habitex)`)
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err)
  process.exit(1)
})
