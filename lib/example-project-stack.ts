import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';

export class ExampleProjectStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // The code that defines your stack goes here

    // Customer Managed KMS Key for encrypting all resources
    const key = new kms.Key(this, 'ExampleProjectKey', {
      enableKeyRotation: true,
      description: 'Customer Managed Key for encrypting Example Project resources',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // example resource 1
    const queue1 = new sqs.Queue(this, 'ExampleProjectQueue1', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
      encryptionMasterKey: key,
    });

    // example resource 2
    const queue2 = new sqs.Queue(this, 'ExampleProjectQueue2', {
      visibilityTimeout: cdk.Duration.seconds(300),
      enforceSSL: true,
      encryptionMasterKey: key,
    });

    // SNS Topic for Queue 1
    const topic1 = new sns.Topic(this, 'ExampleProjectTopic1', {
      enforceSSL: true,
      masterKey: key,
    });
    topic1.addSubscription(new subscriptions.SqsSubscription(queue1));

    // SNS Topic for Queue 2
    const topic2 = new sns.Topic(this, 'ExampleProjectTopic2', {
      enforceSSL: true,
      masterKey: key,
    });
    topic2.addSubscription(new subscriptions.SqsSubscription(queue2));

    for (const queue of [queue1, queue2]) {
      cdk.Validations.of(queue).acknowledge({
        id: 'AwsSolutions-SQS3',
        reason: 'Just some sample queues, no DLQ required',
      });
    }
    // test 2
  }
}
