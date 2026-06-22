import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import * as ExampleProject from '../lib/example-project-stack';

// example test. To run these tests, uncomment this file along with the
// example resource in lib/example-project-stack.ts
test('SQS Queue Created', () => {
  const app = new cdk.App();
  // WHEN
  const stack = new ExampleProject.ExampleProjectStack(app, 'MyTestStack');
  // THEN
  const template = Template.fromStack(stack);
  template.resourceCountIs('AWS::SQS::Queue', 2);
  template.resourceCountIs('AWS::SNS::Topic', 2);
  template.resourceCountIs('AWS::SNS::Subscription', 2);
  template.resourceCountIs('AWS::SNS::TopicPolicy', 2);
  template.resourceCountIs('AWS::SQS::QueuePolicy', 2);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300,
  });
  template.hasResourceProperties('AWS::SNS::Subscription', {
    Protocol: 'sqs',
  });
});
