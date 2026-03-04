import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import { NagSuppressions } from 'cdk-nag';

export class ExampleProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource
    const queue1 = new sqs.Queue(this, 'ExampleProjectQueue', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
    });

    const queue2 = new sqs.Queue(this, 'ExampleProjectQueue2', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
      contentBasedDeduplication: true,
    });

    NagSuppressions.addResourceSuppressions(
      [queue1, queue2],
      [
        {
          id: 'AwsSolutions-SQS3',
          reason: 'Just some sample queues, no DLQ required',
        },
      ],
    );
  }
}
