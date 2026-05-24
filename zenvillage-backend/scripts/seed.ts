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
      type: 'property_manager',
      cnpj: '12.345.678/0001-90',
      contactEmail: 'contato@agatha.com.br',
      phone: '(11) 3456-7890',
      responsibleName: 'Ágatha Mendes',
      responsibleEmail: 'agatha@agatha.com.br',
      plan: 'pro',
      billingCycle: 'monthly',
      status: 'active',
      condominiumsCount: 4,
      condominiumsLimit: 10,
      unitsCount: 480,
      unitsLimit: 1000,
      joinDate: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t2Id}#TENANT#${t2Id}`,
      SK: 'PROFILE',
      id: t2Id,
      name: 'Residencial Vista Verde',
      type: 'independent_condominium',
      cnpj: '98.765.432/0001-10',
      contactEmail: 'sindico@vistaverde.com.br',
      phone: '(11) 9876-5432',
      responsibleName: 'Carlos Andrade',
      responsibleEmail: 'carlos@vistaverde.com.br',
      plan: 'starter',
      billingCycle: 'monthly',
      status: 'trial',
      trialEnd: daysFromNow(8),
      condominiumsCount: 1,
      condominiumsLimit: 1,
      unitsCount: 80,
      unitsLimit: 100,
      joinDate: now(),
      updatedAt: now(),
    },
    {
      PK: `TENANT#${t3Id}#TENANT#${t3Id}`,
      SK: 'PROFILE',
      id: t3Id,
      name: 'Habitex Administração',
      type: 'property_manager',
      cnpj: '55.444.333/0001-22',
      contactEmail: 'contato@habitex.com.br',
      phone: '(11) 2222-3333',
      responsibleName: 'Ricardo Habitex',
      responsibleEmail: 'ricardo@habitex.com.br',
      plan: 'enterprise',
      billingCycle: 'annual',
      status: 'active',
      condominiumsCount: 7,
      condominiumsLimit: 50,
      unitsCount: 840,
      unitsLimit: 5000,
      joinDate: now(),
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
      cnpj: '12.345.678/0001-90',
      creci: 'CRECI-SP 12345J',
      email: 'contato@agatha.com.br',
      phone: '(11) 3456-7890',
      website: 'https://agatha.com.br',
      status: 'active',
      whiteLabel: false,
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
      PK: `TENANT#${t3Id}#PROPERTY_MANAGER#${pm2Id}`,
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
      whiteLabel: true,
      whiteLabelConfig: {
        platformName: 'Habitex Portal',
        primaryColor: '#1a56db',
        secondaryColor: '#f0f4ff',
        customDomain: 'portal.habitex.com.br',
        customSenderEmail: 'noreply@habitex.com.br',
      },
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
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c1Id}`,
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
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c2Id}`,
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
      PK: `TENANT#${t1Id}#CONDOMINIUM#${c3Id}`,
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
