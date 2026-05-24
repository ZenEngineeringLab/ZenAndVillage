import { Duration, Stack, StackProps } from 'aws-cdk-lib'
import {
  HttpApi,
  HttpMethod,
  CorsHttpMethod,
  HttpNoneAuthorizer,
} from 'aws-cdk-lib/aws-apigatewayv2'
import { HttpLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { HttpLambdaAuthorizer, HttpLambdaResponseType } from 'aws-cdk-lib/aws-apigatewayv2-authorizers'
import { WebSocketApi, WebSocketStage } from 'aws-cdk-lib/aws-apigatewayv2'
import { WebSocketLambdaIntegration } from 'aws-cdk-lib/aws-apigatewayv2-integrations'
import { IFunction } from 'aws-cdk-lib/aws-lambda'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'
import { LambdaWithPowertools } from '../constructs/lambda-with-powertools.js'
import * as path from 'path'
import * as url from 'url'

const __dirname = path.dirname(url.fileURLToPath(import.meta.url))

export interface ApiGatewayStackInnerProps {
  env: string
}

export interface ApiGatewayStackProps extends StackProps {
  stackProps: ApiGatewayStackInnerProps
}

export class ApiGatewayStack extends Stack {
  public readonly httpApi: HttpApi
  public readonly wsApi: WebSocketApi

  private readonly defaultAuthorizer: HttpLambdaAuthorizer

  constructor(scope: Construct, id: string, props: ApiGatewayStackProps) {
    super(scope, id, props)

    const { env } = props.stackProps
    const isProd = env === 'prod'

    const allowOrigins = isProd
      ? ['https://app.zenvillage.com']
      : ['*']  // staging: allow all origins (CloudFront URL not known at synth time)

    // Lambda Authorizer
    const authorizerFn = new LambdaWithPowertools(this, 'TenantAuthorizerFn', {
      serviceName: `zenvillage-authorizer-${env}`,
      timeoutSeconds: 10,
      entry: path.join(__dirname, '../../lambda/shared/tenant-authorizer.handler.ts'),
      handler: 'handler',
    })

    // SIMPLE response type matches the handler's { isAuthorized, context } return shape.
    // IAM would require a full policy document — not used here.
    this.defaultAuthorizer = new HttpLambdaAuthorizer('TenantAuthorizer', authorizerFn, {
      responseTypes: [HttpLambdaResponseType.SIMPLE],
      identitySource: [
        '$request.header.Authorization',
        '$request.header.X-Tenant-Id',
      ],
      resultsCacheTtl: Duration.minutes(5),
    })

    // HTTP API
    this.httpApi = new HttpApi(this, 'HttpApi', {
      apiName: `zenvillage-api-${env}`,
      corsPreflight: {
        allowOrigins,
        allowMethods: [
          CorsHttpMethod.GET,
          CorsHttpMethod.POST,
          CorsHttpMethod.PUT,
          CorsHttpMethod.PATCH,
          CorsHttpMethod.DELETE,
          CorsHttpMethod.OPTIONS,
        ],
        allowHeaders: [
          'Content-Type',
          'Authorization',
          'X-Tenant-Id',
          'X-Idempotency-Key',  // sent by Axios interceptor on POST/PUT/PATCH — must be allowed
          'X-Amz-Date',
          'X-Api-Key',
          'X-Amz-Security-Token',
        ],
        exposeHeaders: ['X-Request-Id', 'X-Trace-Id'],  // set by Lambda on every response
        allowCredentials: false,  // JWT in Authorization header — cookies not used
        maxAge: Duration.seconds(300),
      },
      defaultAuthorizer: this.defaultAuthorizer,
    })

    // WebSocket API
    this.wsApi = new WebSocketApi(this, 'WsApi', {
      apiName: `zenvillage-ws-${env}`,
    })

    new WebSocketStage(this, 'WsStage', {
      webSocketApi: this.wsApi,
      stageName: env,
      autoDeploy: true,
    })

    // SSM Parameters
    new StringParameter(this, 'ApiUrlParam', {
      parameterName: `/zenvillage/${env}/api-url`,
      stringValue: this.httpApi.url ?? `https://${this.httpApi.apiId}.execute-api.${this.region}.amazonaws.com/`,
    })

    new StringParameter(this, 'WsUrlParam', {
      parameterName: `/zenvillage/${env}/ws-url`,
      stringValue: this.wsApi.apiEndpoint,
    })
  }

  addRoute(method: HttpMethod, routePath: string, fn: IFunction): void {
    this.httpApi.addRoutes({
      path: routePath,
      methods: [method],
      integration: new HttpLambdaIntegration(`Integration-${method}-${routePath.replace(/\//g, '-').replace(/[{}]/g, '')}`, fn),
      authorizer: this.defaultAuthorizer,
    })
  }

  addWsRoute(routeKey: string, fn: IFunction): void {
    this.wsApi.addRoute(routeKey, {
      integration: new WebSocketLambdaIntegration(`WsIntegration-${routeKey.replace(/\$/g, '')}`, fn),
    })
  }
}
