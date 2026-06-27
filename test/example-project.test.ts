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
