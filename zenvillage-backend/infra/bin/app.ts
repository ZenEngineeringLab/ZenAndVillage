#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { UsersStack } from '../stacks/users.stack.js'
import { CognitoStack } from '../stacks/cognito.stack.js'
import { ApiGatewayStack } from '../stacks/api-gateway.stack.js'
import { FrontendHostingStack } from '../stacks/frontend-hosting.stack.js'
import { TenantsStack } from '../stacks/tenants.stack.js'
import { PropertyManagersStack } from '../stacks/property-managers.stack.js'
import { CondominiumsStack } from '../stacks/condominiums.stack.js'
import { ResidentsStack } from '../stacks/residents.stack.js'
import { EmployeesStack } from '../stacks/employees.stack.js'
import { PlansStack } from '../stacks/plans.stack.js'
import { SubscriptionsStack } from '../stacks/subscriptions.stack.js'
import { NotificationsStack } from '../stacks/notifications.stack.js'

const app = new cdk.App()
const env = app.node.tryGetContext('env') ?? 'staging'

const awsEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
}

// ─── Shared alarm SNS topic ───────────────────────────────────────────────────
const alarmStack = new cdk.Stack(app, `zenvillage-alarms-${env}`, { env: awsEnv })
const alarmTopic = new Topic(alarmStack, 'AlarmTopic', {
  topicName: `zenvillage-alarms-${env}`,
})

// ─── API Gateway (HTTP + WebSocket) ───────────────────────────────────────────
const apiStack = new ApiGatewayStack(app, `zenvillage-api-${env}`, {
  env: awsEnv,
  stackProps: { env },
})

// ─── Users (table + Lambda handlers + API routes) ─────────────────────────────
// UsersStack must still come before CognitoStack so that the table ARN can be
// passed as a CDK cross-stack reference for the Pre-Token Generation Lambda.
const usersStack = new UsersStack(app, `zenvillage-users-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

// ─── Cognito ──────────────────────────────────────────────────────────────────
new CognitoStack(app, `zenvillage-cognito-${env}`, {
  env: awsEnv,
  stackProps: {
    env,
    usersTableArn: usersStack.table.tableArn,   // CDK cross-stack ref — no manual ARN needed
    usersTableName: usersStack.table.tableName,
  },
})

// ─── Frontend hosting (S3 + CloudFront) ───────────────────────────────────────
new FrontendHostingStack(app, `zenvillage-frontend-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn },
})

// ─── Domain stacks ────────────────────────────────────────────────────────────

// tenantsStack must be declared before SubscriptionsStack for cross-stack refs
const tenantsStack = new TenantsStack(app, `zenvillage-tenants-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new SubscriptionsStack(app, `zenvillage-subscriptions-${env}`, {
  env: awsEnv,
  stackProps: {
    env,
    snsAlarmTopicArn: alarmTopic.topicArn,
    apiStack,
    tenantsTableName: tenantsStack.table.tableName,
    tenantsTableArn: tenantsStack.table.tableArn,
    usersTableName: usersStack.table.tableName,
    usersTableArn: usersStack.table.tableArn,
  },
})

new PlansStack(app, `zenvillage-plans-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new PropertyManagersStack(app, `zenvillage-property-managers-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new CondominiumsStack(app, `zenvillage-condominiums-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new ResidentsStack(app, `zenvillage-residents-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new EmployeesStack(app, `zenvillage-employees-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

new NotificationsStack(app, `zenvillage-notifications-${env}`, {
  env: awsEnv,
  stackProps: { env, snsAlarmTopicArn: alarmTopic.topicArn, apiStack },
})

app.synth()
