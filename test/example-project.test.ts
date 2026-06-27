import * as cdk from 'aws-cdk-lib/core';
import { Match, Template } from 'aws-cdk-lib/assertions';
import * as ExampleProject from '../lib/example-project-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/example-project-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300,
  });
});

test('SNS Topics Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::SNS::Topic', 2);
});

test('SNS Subscriptions Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::SNS::Subscription', 2);
  template.hasResourceProperties('AWS::SNS::Subscription', {
    Protocol: 'sqs',
  });
});

test('KMS Key Created with Key Rotation Enabled', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::KMS::Key', {
    EnableKeyRotation: true,
  });
});

test('SQS Queues are encrypted with Customer Managed KMS Key', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::SQS::Queue', {
    KmsMasterKeyId: {
      'Fn::GetAtt': [Match.stringLikeRegexp('ExampleProjectKey'), 'Arn'],
    },
  });
});

test('SNS Topics are encrypted with Customer Managed KMS Key', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::SNS::Topic', {
    KmsMasterKeyId: {
      'Fn::GetAtt': [Match.stringLikeRegexp('ExampleProjectKey'), 'Arn'],
    },
  });
});

test('S3 Bucket is created with KMS encryption', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::S3::Bucket', {
    BucketEncryption: {
      ServerSideEncryptionConfiguration: [
        {
          ServerSideEncryptionByDefault: {
            SSEAlgorithm: 'aws:kms',
            KMSMasterKeyID: {
              'Fn::GetAtt': [Match.stringLikeRegexp('ExampleProjectKey'), 'Arn'],
            },
          },
        },
      ],
    },
    VersioningConfiguration: {
      Status: 'Enabled',
    },
  });
});

test('Lambda function is created with Node.js 22.x runtime', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', {
    Runtime: 'nodejs22.x',
    Handler: 'index.handler',
    Timeout: 30,
  });
});

test('Lambda has SQS event source mapping with partial-batch failure reporting', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::EventSourceMapping', {
    EventSourceArn: {
      'Fn::GetAtt': [Match.stringLikeRegexp('ExampleProjectQueue1'), 'Arn'],
    },
    FunctionName: {
      Ref: Match.stringLikeRegexp('SqsToS3Function'),
    },
    FunctionResponseTypes: ['ReportBatchItemFailures'],
  });
});

test('Lambda has BUCKET_NAME environment variable', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::Lambda::Function', {
    Environment: {
      Variables: {
        BUCKET_NAME: {
          Ref: Match.stringLikeRegexp('ExampleProjectMessageBucket'),
        },
      },
    },
  });
});

test('Lambda execution role has S3 PutObject permission', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: Match.arrayWith(['s3:PutObject']),
          Effect: 'Allow',
        }),
      ]),
    },
    Roles: Match.arrayWith([{ Ref: Match.stringLikeRegexp('SqsToS3Function') }]),
  });
});

test('Lambda execution role has KMS encrypt/decrypt permissions', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: Match.arrayWith(['kms:Encrypt', 'kms:Decrypt']),
          Effect: 'Allow',
        }),
      ]),
    },
    Roles: Match.arrayWith([{ Ref: Match.stringLikeRegexp('SqsToS3Function') }]),
  });
});

test('Lambda execution role has SQS consume permissions', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.arrayWith([
        Match.objectLike({
          Action: Match.arrayWith([
            'sqs:ReceiveMessage',
            'sqs:ChangeMessageVisibility',
            'sqs:GetQueueUrl',
            'sqs:DeleteMessage',
            'sqs:GetQueueAttributes',
          ]),
          Effect: 'Allow',
        }),
      ]),
    },
    Roles: Match.arrayWith([{ Ref: Match.stringLikeRegexp('SqsToS3Function') }]),
  });
});

test('Lambda execution role does not have S3 DeleteObject permission', () => {
  const app = new cdk.App();
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  const template = Template.fromStack(stack);
  template.hasResourceProperties('AWS::IAM::Policy', {
    PolicyDocument: {
      Statement: Match.not(
        Match.arrayWith([
          Match.objectLike({
            Action: Match.arrayWith(['s3:DeleteObject*']),
          }),
        ]),
      ),
    },
    Roles: Match.arrayWith([{ Ref: Match.stringLikeRegexp('SqsToS3Function') }]),
  });
});
