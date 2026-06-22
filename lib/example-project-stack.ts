import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
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

    for (const [index, queue] of [queue1, queue2].entries()) {
      const topic = new sns.Topic(this, `ExampleProjectQueue${index + 1}Topic`, {
        enforceSSL: true,
      });
      topic.addSubscription(new subscriptions.SqsSubscription(queue));

      cdk.Validations.of(queue).acknowledge({
        id: 'AwsSolutions-SQS3',
        reason: 'Just some sample queues, no DLQ required',
      });
    }
    // test 2
  }
}
