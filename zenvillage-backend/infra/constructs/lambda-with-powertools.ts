import { Duration } from 'aws-cdk-lib'
import { Runtime, Architecture, Tracing } from 'aws-cdk-lib/aws-lambda'
import { NodejsFunction, NodejsFunctionProps } from 'aws-cdk-lib/aws-lambda-nodejs'
import { Construct } from 'constructs'

export interface LambdaWithPowertoolsProps extends Omit<NodejsFunctionProps, 'runtime'> {
  serviceName: string
  timeoutSeconds?: number
  memoryMb?: number
  environment?: Record<string, string>
}

export class LambdaWithPowertools extends NodejsFunction {
  constructor(scope: Construct, id: string, props: LambdaWithPowertoolsProps) {
    super(scope, id, {
      ...props,
      runtime: Runtime.NODEJS_22_X,
      architecture: Architecture.ARM_64,
      timeout: Duration.seconds(props.timeoutSeconds ?? 10),
      memorySize: props.memoryMb ?? 512,
      tracing: Tracing.ACTIVE,
      bundling: {
        minify: true,
        sourceMap: true,
        target: 'es2022',
        externalModules: ['@aws-sdk/*'],
      },
      environment: {
        POWERTOOLS_SERVICE_NAME: props.serviceName,
        POWERTOOLS_LOG_LEVEL: 'INFO',
        ...props.environment,
      },
    })
  }
}
