import { Duration, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib'
import { BlockPublicAccess, Bucket } from 'aws-cdk-lib/aws-s3'
import {
  AllowedMethods,
  CachePolicy,
  Distribution,
  HttpVersion,
  PriceClass,
  ViewerProtocolPolicy,
} from 'aws-cdk-lib/aws-cloudfront'
import { S3BucketOrigin } from 'aws-cdk-lib/aws-cloudfront-origins'
import { Alarm, ComparisonOperator, Metric, TreatMissingData } from 'aws-cdk-lib/aws-cloudwatch'
import { SnsAction } from 'aws-cdk-lib/aws-cloudwatch-actions'
import { Topic } from 'aws-cdk-lib/aws-sns'
import { StringParameter } from 'aws-cdk-lib/aws-ssm'
import { Construct } from 'constructs'

/**
 * FrontendHostingStack
 *
 * Provisions a private S3 bucket + CloudFront distribution (OAC) for the
 * React PWA. No public bucket access — CloudFront is the sole entry point.
 *
 * SPA routing: CloudFront returns index.html for 403/404 responses from S3
 * so that React Router handles client-side navigation correctly.
 *
 * SSM outputs (read by CI/CD frontend build):
 *   /zenvillage/{env}/cloudfront-dist-id   — used for cache invalidation
 *   /zenvillage/{env}/cloudfront-url        — public app URL
 *   /zenvillage/{env}/frontend-bucket-name — used for `aws s3 sync`
 */

export interface FrontendHostingStackInnerProps {
  env: string
  snsAlarmTopicArn: string
}

export interface FrontendHostingStackProps extends StackProps {
  stackProps: FrontendHostingStackInnerProps
}

export class FrontendHostingStack extends Stack {
  public readonly bucket: Bucket
  public readonly distribution: Distribution

  constructor(scope: Construct, id: string, props: FrontendHostingStackProps) {
    super(scope, id, props)

    const { env, snsAlarmTopicArn } = props.stackProps
    const isProd = env === 'prod'

    const alarmTopic = Topic.fromTopicArn(this, 'AlarmTopic', snsAlarmTopicArn)

    // -------------------------------------------------------------------------
    // S3 — private bucket, no website hosting
    // -------------------------------------------------------------------------
    this.bucket = new Bucket(this, 'FrontendBucket', {
      bucketName: `zenvillage-frontend-${env}`,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      removalPolicy: isProd ? RemovalPolicy.RETAIN : RemovalPolicy.DESTROY,
      autoDeleteObjects: !isProd,
    })

    // -------------------------------------------------------------------------
    // CloudFront — OAC (Origin Access Control), HTTPS-only, SPA routing
    // -------------------------------------------------------------------------
    this.distribution = new Distribution(this, 'Distribution', {
      comment: `ZenAndVillage frontend — ${env}`,
      defaultBehavior: {
        // S3BucketOrigin.withOriginAccessControl() automatically creates an OAC
        // and adds the required bucket policy — no manual BucketPolicy needed.
        origin: S3BucketOrigin.withOriginAccessControl(this.bucket),
        viewerProtocolPolicy: ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: CachePolicy.CACHING_OPTIMIZED,
        compress: true,
      },
      defaultRootObject: 'index.html',
      // SPA fallback: S3 returns 403 (private bucket) or 404 for unknown keys.
      // Both are remapped to 200 + index.html so React Router takes over.
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
          ttl: Duration.seconds(0),
        },
      ],
      // PRICE_CLASS_ALL covers all CloudFront edge locations (prod).
      // PRICE_CLASS_100 covers US/EU/Israel only — cheaper for staging.
      priceClass: isProd ? PriceClass.PRICE_CLASS_ALL : PriceClass.PRICE_CLASS_100,
      httpVersion: HttpVersion.HTTP2_AND_3,
    })

    // -------------------------------------------------------------------------
    // CloudWatch alarm — 5xx error rate > 1% over 5 min
    // -------------------------------------------------------------------------
    const errorRateAlarm = new Alarm(this, 'CloudFront5xxAlarm', {
      alarmName: `zenvillage-frontend-5xx-${env}`,
      metric: new Metric({
        namespace: 'AWS/CloudFront',
        metricName: '5xxErrorRate',
        dimensionsMap: { DistributionId: this.distribution.distributionId, Region: 'Global' },
        period: Duration.minutes(5),
        statistic: 'Average',
      }),
      threshold: 1, // percent
      evaluationPeriods: 1,
      comparisonOperator: ComparisonOperator.GREATER_THAN_OR_EQUAL_TO_THRESHOLD,
      treatMissingData: TreatMissingData.NOT_BREACHING,
    })
    errorRateAlarm.addAlarmAction(new SnsAction(alarmTopic))

    // -------------------------------------------------------------------------
    // SSM Parameters — consumed by CI/CD frontend build and deploy steps
    // -------------------------------------------------------------------------
    new StringParameter(this, 'CloudFrontDistIdParam', {
      parameterName: `/zenvillage/${env}/cloudfront-dist-id`,
      stringValue: this.distribution.distributionId,
    })

    new StringParameter(this, 'CloudFrontUrlParam', {
      parameterName: `/zenvillage/${env}/cloudfront-url`,
      stringValue: `https://${this.distribution.distributionDomainName}`,
    })

    new StringParameter(this, 'FrontendBucketNameParam', {
      parameterName: `/zenvillage/${env}/frontend-bucket-name`,
      stringValue: this.bucket.bucketName,
    })
  }
}
