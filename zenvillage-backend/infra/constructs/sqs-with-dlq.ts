import { Duration } from 'aws-cdk-lib'
import { Queue } from 'aws-cdk-lib/aws-sqs'
import { Construct } from 'constructs'

export interface SqsWithDlqProps {
  queueName: string
  maxReceiveCount?: number
  visibilityTimeout?: Duration
}

export class SqsWithDlq extends Construct {
  public readonly queue: Queue
  public readonly dlq: Queue

  constructor(scope: Construct, id: string, props: SqsWithDlqProps) {
    super(scope, id)

    const { queueName, maxReceiveCount = 3, visibilityTimeout } = props

    this.dlq = new Queue(this, 'Dlq', {
      queueName: `${queueName}-dlq`,
    })

    this.queue = new Queue(this, 'Queue', {
      queueName,
      visibilityTimeout,
      deadLetterQueue: {
        queue: this.dlq,
        maxReceiveCount,
      },
    })
  }
}
