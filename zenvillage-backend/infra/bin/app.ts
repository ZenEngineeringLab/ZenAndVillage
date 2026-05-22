#!/usr/bin/env node
import 'source-map-support/register'
import * as cdk from 'aws-cdk-lib'
import { CognitoStack } from '../stacks/cognito.stack.js'
import { ApiGatewayStack } from '../stacks/api-gateway.stack.js'
import { TenantsStack } from '../stacks/tenants.stack.js'
import { PropertyManagersStack } from '../stacks/property-managers.stack.js'
import { CondominiumsStack } from '../stacks/condominiums.stack.js'
import { ResidentsStack } from '../stacks/residents.stack.js'
import { EmployeesStack } from '../stacks/employees.stack.js'
import { NotificationsStack } from '../stacks/notifications.stack.js'
import { Topic } from 'aws-cdk-lib/aws-sns'

const app = new cdk.App()
const env = app.node.tryGetContext('env') ?? 'staging'

const awsEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION ?? 'us-east-1',
}

// Shared alarm SNS topic
const alarmStack = new cdk.Stack(app, `zenvillage-alarms-${env}`, { env: awsEnv })
const alarmTopic = new Topic(alarmStack, 'AlarmTopic', {
  topicName: `zenvillage-alarms-${env}`,
})

const cognitoStack = new CognitoStack(app, `zenvillage-cognito-${env}`, {
  env: awsEnv,
  stackProps: {
    env,
    usersTableArn: '',   // updated after first deploy seeds the users table
    usersTableName: `zenvillage-users-${env}`,
  },
})

const apiStack = new ApiGatewayStack(app, `zenvillage-api-${env}`, {
  env: awsEnv,
  stackProps: { env },
})

new TenantsStack(app, `zenvillage-tenants-${env}`, {
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
