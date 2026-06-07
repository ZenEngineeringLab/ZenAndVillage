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
import { DynamoDBDocumentClient, PutCommand, ScanCommand, BatchWriteCommand } from '@aws-sdk/lib-dynamodb'
import { SSMClient, GetParameterCommand } from '@aws-sdk/client-ssm'

// ---------------------------------------------------------------------------
// CLI arg parsing
// ---------------------------------------------------------------------------
const envArg = process.argv.find((a) => a.startsWith('--env='))
const env = envArg ? envArg.split('=')[1] : 'staging'
const region = process.env.AWS_REGION ?? 'us-east-1'
// --clean wipes all data tables before seeding, for a fresh demo with no
// accumulated duplicates from previous runs.
const clean = process.argv.includes('--clean')

console.log(`[seed] Environment: ${env}  Region: ${region}  Clean: ${clean}`)

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

/** Deletes every item in a table (all entities use a PK/SK key schema). */
async function purgeTable(tableName: string): Promise<void> {
  let lastKey: Record<string, any> | undefined
  let total = 0
  do {
    const res = await dynamoClient.send(new ScanCommand({
      TableName: tableName,
      ProjectionExpression: 'PK, SK',
      ExclusiveStartKey: lastKey,
    }))
    const items = res.Items ?? []
    for (let i = 0; i < items.length; i += 25) {
      const chunk = items.slice(i, i + 25)
      await dynamoClient.send(new BatchWriteCommand({
        RequestItems: {
          [tableName]: chunk.map((it) => ({ DeleteRequest: { Key: { PK: it.PK, SK: it.SK } } })),
        },
      }))
    }
    total += items.length
    lastKey = res.LastEvaluatedKey
  } while (lastKey)
  console.log(`[seed] Purged ${tableName}: ${total} items`)
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
const PLANS_TABLE = `zenvillage-plans-${env}`
const TENANTS_TABLE = `zenvillage-tenants-${env}`
const PROPERTY_MANAGERS_TABLE = `zenvillage-property-managers-${env}`
const CONDOMINIUMS_TABLE = `zenvillage-condominiums-${env}`
const RESIDENTS_TABLE = `zenvillage-residents-${env}`
const EMPLOYEES_TABLE = `zenvillage-employees-${env}`
const SUBSCRIPTIONS_TABLE = `zenvillage-subscriptions-${env}`
const USERS_TABLE = `zenvillage-users-${env}`

// Data tables wiped by --clean. USERS is intentionally excluded: deleting a
// user record would break Cognito sign-in (the Pre-Token Lambda needs it).
const DATA_TABLES = [
  PLANS_TABLE,
  TENANTS_TABLE,
  PROPERTY_MANAGERS_TABLE,
  CONDOMINIUMS_TABLE,
  RESIDENTS_TABLE,
  EMPLOYEES_TABLE,
  SUBSCRIPTIONS_TABLE,
]

// ---------------------------------------------------------------------------
// IDs (generated once so they can be referenced across entities)
// ---------------------------------------------------------------------------
const t1Id = randomUUID()
const t2Id = randomUUID()
const t3Id = randomUUID()
const t4Id = randomUUID() // pending tenant — its subscription awaits platform-admin approval

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
// Seed: Plans (public catalog — required for self-service onboarding)
// ---------------------------------------------------------------------------
async function seedPlans(): Promise<void> {
  const plans = [
    {
      PK: 'PLAN#starter',
      SK: 'METADATA',
      id: 'starter',
      name: 'Starter',
      description: 'For a single condominium getting started with digital management.',
      monthlyPrice: 99,
      annualPrice: 990,
      maxCondos: 1,
      maxUnitsTotal: 100,
      maxAdminUsers: 2,
      enabledModules: ['condominiums', 'residents', 'employees'],
      dataRetentionMonths: 12,
      supportLevel: 'basic',
      apiAccess: false,
      status: 'active',
      public: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: 'PLAN#pro',
      SK: 'METADATA',
      id: 'pro',
      name: 'Pro',
      description: 'For property managers handling multiple condominiums.',
      monthlyPrice: 299,
      annualPrice: 2990,
      maxCondos: 10,
      maxUnitsTotal: 1000,
      maxAdminUsers: 10,
      enabledModules: ['condominiums', 'residents', 'employees', 'financials', 'communications'],
      dataRetentionMonths: 24,
      supportLevel: 'priority',
      apiAccess: false,
      status: 'active',
      public: true,
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: 'PLAN#enterprise',
      SK: 'METADATA',
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large administrators with advanced integration and support needs.',
      monthlyPrice: 999,
      annualPrice: 9990,
      maxCondos: 50,
      maxUnitsTotal: 5000,
      maxAdminUsers: 50,
      enabledModules: ['condominiums', 'residents', 'employees', 'financials', 'communications', 'security', 'analytics'],
      dataRetentionMonths: 60,
      supportLevel: 'dedicated',
      apiAccess: true,
      status: 'active',
      public: true,
      createdAt: now(),
      updatedAt: now(),
    },
  ]

  await Promise.all(plans.map((item) => putItem(PLANS_TABLE, item)))
  console.log(`[seed] Plans created: ${plans.length}`)
}

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
      taxId: '12.345.678/0001-90',
      contactEmail: 'contato@agatha.com.br',
      phone: '(11) 3456-7890',
      responsibleName: 'Ágatha Mendes',
      responsibleEmail: 'agatha@agatha.com.br',
      planId: 'pro',
      billingCycle: 'monthly',
      subscriptionStatus: 'active',
      status: 'active',
      usageLimits: { activeCondos: 10, totalUnits: 1000, adminUsers: 10 },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t2Id}#TENANT#${t2Id}`,
      SK: 'PROFILE',
      id: t2Id,
      name: 'Residencial Vista Verde',
      type: 'independent_condo',
      taxId: '98.765.432/0001-10',
      contactEmail: 'sindico@vistaverde.com.br',
      phone: '(11) 9876-5432',
      responsibleName: 'Carlos Andrade',
      responsibleEmail: 'carlos@vistaverde.com.br',
      planId: 'starter',
      billingCycle: 'monthly',
      subscriptionStatus: 'trial',
      status: 'active',
      trialEndDate: daysFromNow(8),
      usageLimits: { activeCondos: 1, totalUnits: 100, adminUsers: 2 },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t3Id}#TENANT#${t3Id}`,
      SK: 'PROFILE',
      id: t3Id,
      name: 'Habitex Administração',
      type: 'management_company',
      taxId: '55.444.333/0001-22',
      contactEmail: 'contato@habitex.com.br',
      phone: '(11) 2222-3333',
      responsibleName: 'Ricardo Habitex',
      responsibleEmail: 'ricardo@habitex.com.br',
      planId: 'enterprise',
      billingCycle: 'annual',
      subscriptionStatus: 'active',
      status: 'active',
      usageLimits: { activeCondos: 50, totalUnits: 5000, adminUsers: 50 },
      createdAt: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t4Id}#TENANT#${t4Id}`,
      SK: 'PROFILE',
      id: t4Id,
      name: 'Condomínio Aurora (aguardando aprovação)',
      type: 'independent_condo',
      taxId: '11.444.777/0001-55',
      contactEmail: 'sindico@aurora.com.br',
      phone: '(11) 4444-7777',
      responsibleName: 'Marina Aurora',
      responsibleEmail: 'marina@aurora.com.br',
      planId: 'starter',
      billingCycle: 'monthly',
      subscriptionStatus: 'pending_approval',
      status: 'active',
      usageLimits: { activeCondos: 1, totalUnits: 100, adminUsers: 2 },
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
      PK: `TENANT#${t1Id}#PROPMGR#${pm1Id}`,
      SK: 'PROFILE',
      id: pm1Id,
      tenantId: t1Id,
      legalName: 'Ágatha Mendes e Cia Ltda',
      tradeName: 'Administradora Ágatha & Cia',
      cnpj: '12.345.678/0001-90',
      creci: 'CRECI-SP 12345J',
      email: 'contato@agatha.com.br',
      phone: '(11) 3456-7890',
      website: 'https://agatha.com.br',
      status: 'active',
      address: {
        zip: '01310-100',
        street: 'Av. Paulista',
        number: '1000',
        complement: 'Conj. 50',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
      },
      condominiumsCount: 4,
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t3Id}#PROPMGR#${pm2Id}`,
      SK: 'PROFILE',
      id: pm2Id,
      tenantId: t3Id,
      legalName: 'Habitex Administração e Gestão Ltda',
      tradeName: 'Habitex Administração',
      cnpj: '55.444.333/0001-22',
      creci: 'CRECI-SP 67890J',
      email: 'contato@habitex.com.br',
      phone: '(11) 2222-3333',
      website: 'https://habitex.com.br',
      status: 'active',
      address: {
        zip: '04538-133',
        street: 'Av. Brigadeiro Faria Lima',
        number: '3477',
        complement: '10º andar',
        neighborhood: 'Itaim Bibi',
        city: 'São Paulo',
        state: 'SP',
      },
      condominiumsCount: 7,
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
      PK: `TENANT#${t1Id}#CONDO#${c1Id}`,
      SK: 'PROFILE',
      id: c1Id,
      tenantId: t1Id,
      name: 'Condomínio Jardim das Águas',
      cnpj: '11.222.333/0001-44',
      type: 'residential',
      status: 'active',
      address: {
        zip: '01415-001',
        street: 'Rua Augusta',
        number: '500',
        complement: '',
        neighborhood: 'Consolação',
        city: 'São Paulo',
        state: 'SP',
      },
      numUnits: 200,
      numBlocks: 4,
      numFloors: 10,
      totalArea: '12000',
      inauguratedAt: '2015-03-15T00:00:00.000Z',
      propertyManagerId: pm1Id,
      propertyManagerName: 'Administradora Ágatha & Cia',
      syndic: 'Ana Lima',
      bylawsUrl: '',
      regulationsUrl: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#CONDO#${c2Id}`,
      SK: 'PROFILE',
      id: c2Id,
      tenantId: t1Id,
      name: 'Edifício Central Park',
      cnpj: '22.333.444/0001-55',
      type: 'mixed',
      status: 'active',
      address: {
        zip: '13010-030',
        street: 'Rua Coronel Quirino',
        number: '1200',
        complement: '',
        neighborhood: 'Cambuí',
        city: 'Campinas',
        state: 'SP',
      },
      numUnits: 80,
      numBlocks: 1,
      numFloors: 20,
      totalArea: '8500',
      inauguratedAt: '2018-07-01T00:00:00.000Z',
      propertyManagerId: pm1Id,
      propertyManagerName: 'Administradora Ágatha & Cia',
      syndic: 'Carlos Andrade',
      bylawsUrl: '',
      regulationsUrl: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#CONDO#${c3Id}`,
      SK: 'PROFILE',
      id: c3Id,
      tenantId: t1Id,
      name: 'Residencial Solar Poente',
      cnpj: '33.444.555/0001-66',
      type: 'residential',
      status: 'active',
      address: {
        zip: '11075-901',
        street: 'Av. Ana Costa',
        number: '300',
        complement: '',
        neighborhood: 'Vila Mathias',
        city: 'Santos',
        state: 'SP',
      },
      numUnits: 120,
      numBlocks: 2,
      numFloors: 8,
      totalArea: '9200',
      inauguratedAt: '2012-11-20T00:00:00.000Z',
      propertyManagerId: pm1Id,
      propertyManagerName: 'Administradora Ágatha & Cia',
      syndic: 'Fernanda Costa',
      bylawsUrl: '',
      regulationsUrl: '',
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
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Ana Lima',
      cpf: '111.222.333-44',
      rg: '11.222.333-4',
      email: 'ana.lima@email.com',
      phone: '(11) 91111-2222',
      secondaryPhone: '',
      birthdate: '1985-04-12T00:00:00.000Z',
      block: 'A',
      unit: '302',
      occupancyType: 'owner',
      financialStatus: 'current',
      isCouncilMember: true,
      isSyndic: false,
      licensePlate: 'ABC-1234',
      vehicleModel: 'Toyota Corolla',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r2Id}`,
      SK: 'PROFILE',
      id: r2Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Carlos Andrade',
      cpf: '222.333.444-55',
      rg: '22.333.444-5',
      email: 'carlos.andrade@email.com',
      phone: '(11) 92222-3333',
      secondaryPhone: '',
      birthdate: '1978-09-23T00:00:00.000Z',
      block: 'B',
      unit: '501',
      occupancyType: 'owner',
      financialStatus: 'current',
      isCouncilMember: false,
      isSyndic: true,
      licensePlate: 'DEF-5678',
      vehicleModel: 'Honda Civic',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r3Id}`,
      SK: 'PROFILE',
      id: r3Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Beatriz Santos',
      cpf: '333.444.555-66',
      rg: '33.444.555-6',
      email: 'beatriz.santos@email.com',
      phone: '(11) 93333-4444',
      secondaryPhone: '',
      birthdate: '1992-01-08T00:00:00.000Z',
      block: 'A',
      unit: '105',
      occupancyType: 'tenant',
      financialStatus: 'current',
      isCouncilMember: false,
      isSyndic: false,
      licensePlate: '',
      vehicleModel: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r4Id}`,
      SK: 'PROFILE',
      id: r4Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Roberto Melo',
      cpf: '444.555.666-77',
      rg: '44.555.666-7',
      email: 'roberto.melo@email.com',
      phone: '(11) 94444-5555',
      secondaryPhone: '',
      birthdate: '1970-06-30T00:00:00.000Z',
      block: 'C',
      unit: '212',
      occupancyType: 'owner',
      financialStatus: 'defaulting',
      isCouncilMember: false,
      isSyndic: false,
      licensePlate: 'GHI-9012',
      vehicleModel: 'Volkswagen Gol',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#RESIDENT#${r5Id}`,
      SK: 'PROFILE',
      id: r5Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Fernanda Costa',
      cpf: '555.666.777-88',
      rg: '55.666.777-8',
      email: 'fernanda.costa@email.com',
      phone: '(11) 95555-6666',
      secondaryPhone: '(11) 3333-4444',
      birthdate: '1988-11-15T00:00:00.000Z',
      block: 'B',
      unit: '408',
      occupancyType: 'owner',
      financialStatus: 'current',
      isCouncilMember: false,
      isSyndic: false,
      licensePlate: 'JKL-3456',
      vehicleModel: 'Fiat Pulse',
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
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'João Ferreira',
      cpf: '666.777.888-99',
      pisPasep: '111.22222.33-4',
      email: 'joao.ferreira@jardimdasaguas.com.br',
      phone: '(11) 96666-7777',
      role: 'superintendent',
      contractType: 'direct_clt',
      admissionDate: '2019-02-01T00:00:00.000Z',
      schedule: '44h',
      baseSalary: 3200,
      status: 'active',
      asoUrl: '',
      contractUrl: '',
      otherDocs: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e2Id}`,
      SK: 'PROFILE',
      id: e2Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Marcos Silva',
      cpf: '777.888.999-00',
      pisPasep: '222.33333.44-5',
      email: 'marcos.silva@jardimdasaguas.com.br',
      phone: '(11) 97777-8888',
      role: 'doorman',
      contractType: 'direct_clt',
      admissionDate: '2020-05-10T00:00:00.000Z',
      schedule: '12x36',
      baseSalary: 2800,
      status: 'active',
      asoUrl: '',
      contractUrl: '',
      otherDocs: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e3Id}`,
      SK: 'PROFILE',
      id: e3Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Lúcia Rocha',
      cpf: '888.999.000-11',
      pisPasep: '333.44444.55-6',
      email: 'lucia.rocha@limpezatotal.com.br',
      phone: '(11) 98888-9999',
      role: 'general_services',
      contractType: 'outsourced',
      outsourcingCompany: 'Limpeza Total Ltda',
      admissionDate: '2021-08-15T00:00:00.000Z',
      schedule: '44h',
      baseSalary: 2200,
      status: 'active',
      asoUrl: '',
      contractUrl: '',
      otherDocs: '',
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t1Id}#EMPLOYEE#${e4Id}`,
      SK: 'PROFILE',
      id: e4Id,
      tenantId: t1Id,
      condominiumId: c1Id,
      condominiumName: 'Condomínio Jardim das Águas',
      name: 'Paulo Nunes',
      cpf: '999.000.111-22',
      pisPasep: '444.55555.66-7',
      email: 'paulo.nunes@segmax.com.br',
      phone: '(11) 99999-0000',
      role: 'guard',
      contractType: 'outsourced',
      outsourcingCompany: 'SegMax Segurança',
      admissionDate: '2022-01-03T00:00:00.000Z',
      schedule: '12x36',
      baseSalary: 3000,
      status: 'active',
      asoUrl: '',
      contractUrl: '',
      otherDocs: '',
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
  roles: string[]
  onboardingStatus: string
}

const userConfigs: UserSeedConfig[] = [
  // Platform operator that approves subscription requests (no tenant).
  { email: 'platform-admin@zenvillage.dev', tenantId: '', label: 'Platform Admin', roles: ['platform_admin'], onboardingStatus: 'complete' },
  { email: 'admin-agatha@zenvillage.dev', tenantId: t1Id, label: 'Ágatha admin', roles: ['tenant_admin'], onboardingStatus: 'complete' },
  { email: 'admin-vistaverde@zenvillage.dev', tenantId: t2Id, label: 'Vista Verde admin', roles: ['tenant_admin'], onboardingStatus: 'complete' },
  { email: 'admin-habitex@zenvillage.dev', tenantId: t3Id, label: 'Habitex admin', roles: ['tenant_admin'], onboardingStatus: 'complete' },
  // Owner whose subscription is still pending — used to demo the approval flow.
  { email: 'pending-owner@zenvillage.dev', tenantId: t4Id, label: 'Pending Owner', roles: ['tenant_admin'], onboardingStatus: 'pending_approval' },
]

async function seedCognitoUsers(userPoolId: string): Promise<Record<string, string>> {
  const temporaryPassword = 'ZenV1llage!2026'
  const subsByEmail: Record<string, string> = {}

  for (const config of userConfigs) {
    // Create user in Cognito
    let cognitoSub: string

    try {
      const userAttributes = [
        { Name: 'email', Value: config.email },
        { Name: 'email_verified', Value: 'true' },
        { Name: 'name', Value: config.label },
        { Name: 'custom:roles', Value: JSON.stringify(config.roles) },
      ]
      // Only stamp custom:tenantId when the user belongs to a tenant
      // (platform admins have none, and empty custom attributes can be rejected).
      if (config.tenantId) {
        userAttributes.push({ Name: 'custom:tenantId', Value: config.tenantId })
      }

      const createResponse = await cognitoClient.send(
        new AdminCreateUserCommand({
          UserPoolId: userPoolId,
          Username: config.email,
          TemporaryPassword: temporaryPassword,
          MessageAction: 'SUPPRESS',
          UserAttributes: userAttributes,
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

    // Write user record to DynamoDB (roles here are the source of truth the
    // Pre-Token Generation Lambda reads to build the custom:roles JWT claim).
    const userItem = {
      PK: `USER#${cognitoSub}`,
      SK: 'PROFILE',
      id: cognitoSub,
      email: config.email,
      tenantId: config.tenantId,
      roles: config.roles,
      onboardingStatus: config.onboardingStatus,
      locale: 'auto',
      createdAt: now(),
      updatedAt: now(),
    }

    await putItem(USERS_TABLE, userItem)
    subsByEmail[config.email] = cognitoSub
    console.log(`[seed] Cognito user created: ${config.email}  sub=${cognitoSub}`)
  }

  return subsByEmail
}

// ---------------------------------------------------------------------------
// Seed: a pending subscription request for the platform admin to approve
// ---------------------------------------------------------------------------
async function seedPendingSubscription(requestedByCognitoSub: string): Promise<void> {
  const id = randomUUID()
  await putItem(SUBSCRIPTIONS_TABLE, {
    PK: `SUBSCRIPTION#${id}`,
    SK: 'METADATA',
    id,
    tenantId: t4Id,
    planId: 'starter',
    requestedByCognitoSub,
    requestedAt: now(),
    billingCycle: 'monthly',
    status: 'pending_approval',
  })
  console.log(`[seed] Pending subscription created: ${id} (tenant ${t4Id})`)
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------
async function main(): Promise<void> {
  console.log('[seed] Starting...')

  // Read Cognito pool id from SSM
  const userPoolId = await getSsmParam(`/zenvillage/${env}/cognito-pool-id`)
  console.log(`[seed] User Pool ID: ${userPoolId}`)

  // Optional clean slate: wipe all data tables so the demo has no duplicates
  // accumulated from previous runs (USERS is preserved — see DATA_TABLES).
  if (clean) {
    console.log('[seed] --clean: purging data tables...')
    for (const table of DATA_TABLES) {
      await purgeTable(table)
    }
  }

  // Seed DynamoDB tables in parallel where possible
  await Promise.all([
    seedPlans(),
    seedTenants(),
    seedPropertyManagers(),
    seedCondominiums(),
    seedResidents(),
    seedEmployees(),
  ])

  // Seed Cognito users (sequential because each writes to DynamoDB after creating the user)
  const subsByEmail = await seedCognitoUsers(userPoolId)

  // Seed a pending subscription tied to the pending owner, so the platform
  // admin has a real request to approve out of the box.
  await seedPendingSubscription(subsByEmail['pending-owner@zenvillage.dev'])

  console.log('\n[seed] Done! Summary:')
  console.log(`  Plans:             3 (starter, pro, enterprise)`)
  console.log(`  Tenants:           4 (3 active + 1 pending: ${t4Id})`)
  console.log(`  Property Managers: 2 (IDs: ${pm1Id}, ${pm2Id})`)
  console.log(`  Condominiums:      3 (IDs: ${c1Id}, ${c2Id}, ${c3Id})`)
  console.log(`  Residents:         5`)
  console.log(`  Employees:         4`)
  console.log(`  Cognito users:     5 (platform-admin, admin-agatha, admin-vistaverde, admin-habitex, pending-owner)`)
  console.log(`  Pending subs:      1 (awaiting platform-admin approval)`)
}

main().catch((err) => {
  console.error('[seed] Fatal error:', err)
  process.exit(1)
})
