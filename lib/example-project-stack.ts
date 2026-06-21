import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';

export class ExampleProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // example resource 1
    const queue1 = new sqs.Queue(this, 'ExampleProjectQueue1', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
    });

    // example resource 2
    const queue2 = new sqs.Queue(this, 'ExampleProjectQueue2', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
    });

    for (const queue of [queue1, queue2]) {
      cdk.Validations.of(queue).acknowledge({
        id: 'AwsSolutions-SQS3',
        reason: 'Just some sample queues, no DLQ required',
      });
    }
    // test 2
  }
}
