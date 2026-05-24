import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { AttributeType, BillingMode, Table } from 'aws-cdk-lib/aws-dynamodb'
import { HttpMethod } from 'aws-cdk-lib/aws-apigatewayv2'
import { Alarm, ComparisonOperator, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Topic, ITopic } from 'aws-cdk-lib/aws-sns'
import { SqsEventSource } from 'aws-cdk-lib/aws-lambda-event-sources'
import { Bucket, CorsRule, HttpMethods } from 'aws-cdk-lib/aws-s3'
import { PolicyStatement, Effect } from 'aws-cdk-lib/aws-iam'
import { Construct } from 'constructs'
import * as path from 'path'
import * as url from 'url'
import { LambdaWithPowertools } from '../constructs/lambda-with-powertools.js'
import { SqsWithDlq } from '../constructs/sqs-with-dlq.js'
import { ApiGatewayStack } from './api-gateway.stack.js'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export interface NotificationsStackInnerProps {
  env: string
  snsAlarmTopicArn: string
  apiStack: ApiGatewayStack
}

export interface NotificationsStackProps extends StackProps {
  stackProps: NotificationsStackInnerProps
}

function addLambdaAlarms(
  scope: Construct,
  fn: LambdaWithPowertools,
  id: string,
  alarmTopic: ITopic,
): void {
  const errorsAlarm = new Alarm(scope, `${id}ErrorsAlarm`, {
    alarmName: `${id}-errors`,
    metric: fn.metricErrors({
      period: Duration.minutes(5),
      statistic: 'Sum',
    }),
    threshold: 1,
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  })
  errorsAlarm.addAlarmAction(new SnsAction(alarmTopic))

  const throttlesAlarm = new Alarm(scope, `${id}ThrottlesAlarm`, {
    alarmName: `${id}-throttles`,
    metric: fn.metricThrottles({
      period: Duration.minutes(5),
      statistic: 'Sum',
    }),
    threshold: 1,
    evaluationPeriods: 1,
    comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
    treatMissingData: TreatMissingData.NOT_BREACHING,
  })
  throttlesAlarm.addAlarmAction(new SnsAction(alarmTopic))
}

export class NotificationsStack extends Stack {
  constructor(scope: Construct, id: string, props: NotificationsStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn, apiStack } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // DynamoDB Tables
    const notificationsTable = new Table(this, 'NotificationsTable', {
      tableName: `zenvillage-notifications-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      pointInTimeRecovery: true,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    const connectionsTable = new Table(this, 'ConnectionsTable', {
      tableName: `zenvillage-connections-${env}`,
      partitionKey: { name: 'PK', type: AttributeType.STRING },
      sortKey: { name: 'SK', type: AttributeType.STRING },
      billingMode: BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
    })

    // SQS Queue with DLQ
    const notifierQueue = new SqsWithDlq(this, 'NotifierQueue', {
      queueName: `zenvillage-notifier-queue`,
      maxReceiveCount: 3,
      visibilityTimeout: Duration.seconds(60),
    })

    // S3 Bucket for uploads
    const corsRule: CorsRule = {
      allowedMethods: [HttpMethods.GET, HttpMethods.PUT, HttpMethods.POST, HttpMethods.DELETE, HttpMethods.HEAD],
      allowedOrigins: isProd
        ? ['https://app.zenvillage.com']
        : ['http://localhost:3000', 'http://localhost:4173'],
      allowedHeaders: ['*'],
      maxAge: 3000,
    }

    const uploadsBucket = new Bucket(this, 'UploadsBucket', {
      bucketName: `zenvillage-uploads-${env}`,
      cors: [corsRule],
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    })

    // Lambda functions
    const listNotificationsFn = new LambdaWithPowertools(this, 'ListNotificationsFn', {
      serviceName: `zenvillage-notifications-list-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/notifications/list.handler.ts'),
      handler: 'handler',
      environment: {
        NOTIFICATIONS_TABLE: notificationsTable.tableName,
      },
    })

    const markReadFn = new LambdaWithPowertools(this, 'MarkReadFn', {
      serviceName: `zenvillage-notifications-mark-read-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/notifications/mark-read.handler.ts'),
      handler: 'handler',
      environment: {
        NOTIFICATIONS_TABLE: notificationsTable.tableName,
      },
    })

    const markAllReadFn = new LambdaWithPowertools(this, 'MarkAllReadFn', {
      serviceName: `zenvillage-notifications-mark-all-read-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/notifications/mark-all-read.handler.ts'),
      handler: 'handler',
      environment: {
        NOTIFICATIONS_TABLE: notificationsTable.tableName,
      },
    })

    const wsConnectFn = new LambdaWithPowertools(this, 'WsConnectFn', {
      serviceName: `zenvillage-notifications-ws-connect-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/notifications/ws-connect.handler.ts'),
      handler: 'handler',
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
      },
    })

    const wsDisconnectFn = new LambdaWithPowertools(this, 'WsDisconnectFn', {
      serviceName: `zenvillage-notifications-ws-disconnect-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/notifications/ws-disconnect.handler.ts'),
      handler: 'handler',
      environment: {
        CONNECTIONS_TABLE: connectionsTable.tableName,
      },
    })

    const notifierFn = new LambdaWithPowertools(this, 'NotifierFn', {
      serviceName: `zenvillage-notifications-notifier-${env}`,
      timeoutSeconds: 30,
      entry: path.join(__dirname, '../../lambda/notifications/notifier.handler.ts'),
      handler: 'handler',
      environment: {
        NOTIFICATIONS_TABLE: notificationsTable.tableName,
        CONNECTIONS_TABLE: connectionsTable.tableName,
        // WS_ENDPOINT is read from SSM at Lambda runtime to avoid a CDK cross-stack
        // circular dependency (NotificationsStack ↔ ApiGatewayStack).
        // The SSM value includes the stage path, e.g. https://id.execute-api.region.amazonaws.com/staging
        WS_SSM_PATH: `/zenvillage/${env}/ws-url`,
      },
    })

    const presignFn = new LambdaWithPowertools(this, 'PresignFn', {
      serviceName: `zenvillage-uploads-presign-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/uploads/presign.handler.ts'),
      handler: 'handler',
      environment: {
        UPLOADS_BUCKET: uploadsBucket.bucketName,
        FILES_TABLE: `zenvillage-files-${env}`,
      },
    })

    // SQS trigger for notifier
    notifierFn.addEventSource(new SqsEventSource(notifierQueue.queue, {
      batchSize: 10,
      reportBatchItemFailures: true,
    }))

    // Permissions
    notificationsTable.grantReadData(listNotificationsFn)
    notificationsTable.grantReadWriteData(markReadFn)
    notificationsTable.grantReadWriteData(markAllReadFn)
    notificationsTable.grantReadWriteData(notifierFn)

    connectionsTable.grantReadWriteData(wsConnectFn)
    connectionsTable.grantReadWriteData(wsDisconnectFn)
    connectionsTable.grantReadData(notifierFn)

    notifierQueue.queue.grantConsumeMessages(notifierFn)

    uploadsBucket.grantPut(presignFn)
    uploadsBucket.grantReadWrite(presignFn)

    // Allow notifier to post to WebSocket connections.
    // Wildcard on api-id breaks the CDK cross-stack reference that would otherwise
    // create a circular dependency between NotificationsStack and ApiGatewayStack.
    notifierFn.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [`arn:aws:execute-api:${this.region}:${this.account}:*/${env}/POST/@connections/*`],
    }))

    // Allow notifier to read the WebSocket endpoint URL from SSM at runtime.
    notifierFn.addToRolePolicy(new PolicyStatement({
      effect: Effect.ALLOW,
      actions: ['ssm:GetParameter'],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/zenvillage/${env}/ws-url`],
    }))

    // CloudWatch Alarms
    addLambdaAlarms(this, listNotificationsFn, `zenvillage-notifications-list-${env}`, alarmTopic)
    addLambdaAlarms(this, markReadFn, `zenvillage-notifications-mark-read-${env}`, alarmTopic)
    addLambdaAlarms(this, markAllReadFn, `zenvillage-notifications-mark-all-read-${env}`, alarmTopic)
    addLambdaAlarms(this, wsConnectFn, `zenvillage-notifications-ws-connect-${env}`, alarmTopic)
    addLambdaAlarms(this, wsDisconnectFn, `zenvillage-notifications-ws-disconnect-${env}`, alarmTopic)
    addLambdaAlarms(this, notifierFn, `zenvillage-notifications-notifier-${env}`, alarmTopic)
    addLambdaAlarms(this, presignFn, `zenvillage-uploads-presign-${env}`, alarmTopic)

    // HTTP API Routes
    apiStack.addRoute(HttpMethod.GET, '/v1/notifications', listNotificationsFn)
    apiStack.addRoute(HttpMethod.PATCH, '/v1/notifications/{id}/read', markReadFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/notifications/read-all', markAllReadFn)
    apiStack.addRoute(HttpMethod.POST, '/v1/uploads/presign', presignFn)

    // WebSocket Routes
    apiStack.addWsRoute('$connect', wsConnectFn)
    apiStack.addWsRoute('$disconnect', wsDisconnectFn)
  }
}
