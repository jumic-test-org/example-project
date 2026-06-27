import * as cdk from 'aws-cdk-lib/core';
import type { Construct } from 'constructs';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as kms from 'aws-cdk-lib/aws-kms';
import * as subscriptions from 'aws-cdk-lib/aws-sns-subscriptions';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as lambdaNodejs from 'aws-cdk-lib/aws-lambda-nodejs';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as path from 'node:path';

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

    // S3 Bucket for persisting SQS messages
    const messageBucket = new s3.Bucket(this, 'ExampleProjectMessageBucket', {
      encryptionKey: key,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // CloudWatch Logs LogGroup for the Lambda function
    const sqsToS3LogGroup = new logs.LogGroup(this, 'SqsToS3FunctionLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
    });

    // Lambda function that reads messages from SQS and writes them to S3
    const sqsToS3Function = new lambdaNodejs.NodejsFunction(this, 'SqsToS3Function', {
      runtime: lambda.Runtime.NODEJS_24_X,
      entry: path.join(__dirname, 'handlers', 'sqs-to-s3-handler.ts'),
      handler: 'handler',
      timeout: cdk.Duration.seconds(30),
      environment: {
        BUCKET_NAME: messageBucket.bucketName,
      },
      logGroup: sqsToS3LogGroup,
    });

    // Add SQS event sources to Lambda with partial-batch failure reporting
    sqsToS3Function.addEventSource(
      new lambdaEventSources.SqsEventSource(queue1, {
        reportBatchItemFailures: true,
      }),
    );
    sqsToS3Function.addEventSource(
      new lambdaEventSources.SqsEventSource(queue2, {
        reportBatchItemFailures: true,
      }),
    );

    // Grant permissions
    messageBucket.grantPut(sqsToS3Function);
    queue1.grantConsumeMessages(sqsToS3Function);
    queue2.grantConsumeMessages(sqsToS3Function);
    key.grantEncryptDecrypt(sqsToS3Function);

    cdk.Validations.of(messageBucket).acknowledge({
      id: 'AwsSolutions-S1',
      reason:
        'Server access logging is not required for this message storage bucket in this example project',
    });

    // Acknowledge IAM4 and IAM5 findings via construct metadata directly because
    // the finding IDs contain '::' which cdk.Validations.of().acknowledge() rejects.
    const iamAcknowledgements: Record<string, string> = {
      'AwsSolutions-IAM4[Policy::arn:<AWS::Partition>:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole]':
        'The AWSLambdaBasicExecutionRole managed policy is required for Lambda CloudWatch logging',
      'AwsSolutions-IAM5[Action::kms:GenerateDataKey*]':
        'Wildcard in kms:GenerateDataKey* is required by CDK grant methods for KMS operations',
      'AwsSolutions-IAM5[Action::kms:ReEncrypt*]':
        'Wildcard in kms:ReEncrypt* is required by CDK grant methods for KMS operations',
      'AwsSolutions-IAM5[Action::s3:Abort*]':
        'Wildcard in s3:Abort* is granted by CDK bucket.grantPut() for multipart upload abort',
      [`AwsSolutions-IAM5[Resource::<${this.getLogicalId(messageBucket.node.defaultChild as cdk.CfnElement)}.Arn>/*]`]:
        'Wildcard resource path is required for S3 object-level operations granted by bucket.grantPut()',
    };

    for (const [id, reason] of Object.entries(iamAcknowledgements)) {
      sqsToS3Function.node.addMetadata(cdk.Validations.ACKNOWLEDGED_RULES_METADATA_KEY, {
        [id]: reason,
      });
    }

    cdk.Validations.of(sqsToS3Function).acknowledge({
      id: 'AwsSolutions-SQS3',
      reason: 'The source queue does not need a separate DLQ for Lambda event source processing',
    });
    // test 2
  }
}
