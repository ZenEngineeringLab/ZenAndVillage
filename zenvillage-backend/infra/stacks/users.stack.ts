import { RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { Construct } from 'constructs'

/**
 * UsersStack
 *
 * Provisions the `zenvillage-users-{env}` DynamoDB table used by:
 *   - The Cognito Pre-Token Generation Lambda (reads tenantId + roles by USER# PK)
 *   - The seed script (writes one record per Cognito user after AdminCreateUser)
 *
 * Access key pattern:
 *   PK = "USER#{cognitoSub}"
 *   SK = "PROFILE"
 *
 * This stack must be deployed before CognitoStack so that the table ARN
 * can be passed as a CDK cross-stack reference to grant IAM read access
 * to the Pre-Token Generation Lambda.
 */

export interface UsersStackInnerProps {
  env: string
}

export interface UsersStackProps extends StackProps {
  stackProps: UsersStackInnerProps
}

export class UsersStack extends Stack {
  public readonly table: Table

  constructor(scope: Construct, id: string, props: UsersStackProps) {
    super(scope, id, props)

    const { env } = props.stackProps
    const isProd = env === 'prod'

    this.table = new Table(this, 'UsersTable', {
      tableName: `zenvillage-users-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      // RETAIN in prod — never destroyed by cdk destroy
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })
  }
}
