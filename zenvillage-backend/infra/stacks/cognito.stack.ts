import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { Table } from 'aws-cdk-lib/aws-dynamodb'
import {
  AccountRecovery,
  Mfa,
  StringAttribute,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider,
} from 'aws-cdk-lib/aws-cognito'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import { LambdaWithPowertools } from '../constructs/lambda-with-powertools.js'
import * as path from 'path'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export interface CognitoStackInnerProps {
  env: string
  usersTableArn: string
  usersTableName: string
}

export interface CognitoStackProps extends StackProps {
  stackProps: CognitoStackInnerProps
}

export class CognitoStack extends Stack {
  public readonly userPool: UserPool
  public readonly userPoolClient: UserPoolClient

  constructor(scope: Construct, id: string, props: CognitoStackProps) {
    super(scope, id, props)

    const { env, usersTableArn, usersTableName } = props.stackProps
    const isProd = env === 'prod'

    // Pre-token generation Lambda
    const preTokenGenFn = new LambdaWithPowertools(this, 'PreTokenGenerationFn', {
      serviceName: `zenvillage-auth-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/auth/pre-token-generation.handler.ts'),
      handler: 'handler',
      environment: {
        USERS_TABLE: usersTableName,
      },
    })

    // Grant DynamoDB read access if table ARN is provided
    if (usersTableArn) {
      const usersTable = Table.fromTableArn(this, 'UsersTable', usersTableArn)
      usersTable.grantReadData(preTokenGenFn)
    }

    // User Pool
    this.userPool = new UserPool(this, 'UserPool', {
      userPoolName: `zenvillage-users-${env}`,
      selfSignUpEnabled: false,
      signInAliases: { email: true },
      standardAttributes: {
        email: { required: true, mutable: true },
        fullname: { required: true, mutable: true },
      },
      customAttributes: {
        tenantId: new StringAttribute({ mutable: true }),
        roles: new StringAttribute({ mutable: true }),
        userId: new StringAttribute({ mutable: true }),
        locale: new StringAttribute({ mutable: true }),
      },
      mfa: Mfa.OPTIONAL,
      mfaSecondFactor: {
        sms: false,
        otp: true,
      },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: true,
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      lambdaTriggers: {
        preTokenGeneration: preTokenGenFn,
      },
    })

    // User Pool Client
    this.userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
      userPool: this.userPool,
      userPoolClientName: `zenvillage-web-client-${env}`,
      authFlows: {
        userSrp: true,
        custom: false,
        adminUserPassword: false,
        userPassword: false,
      },
      generateSecret: false,
      accessTokenValidity: Duration.hours(1),
      refreshTokenValidity: Duration.days(30),
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO],
    })

    // SSM Parameters
    new StringParameter(this, 'CognitoPoolIdParam', {
      parameterName: `/zenvillage/${env}/cognito-pool-id`,
      stringValue: this.userPool.userPoolId,
    })

    new StringParameter(this, 'CognitoClientIdParam', {
      parameterName: `/zenvillage/${env}/cognito-client-id`,
      stringValue: this.userPoolClient.userPoolClientId,
    })

    new StringParameter(this, 'CognitoRegionParam', {
      parameterName: `/zenvillage/${env}/cognito-region`,
      stringValue: Stack.of(this).region,
    })
  }
}
