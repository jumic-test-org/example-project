# CDK Conventions

## Creating a New Stack

1. Create a new file in `lib/` (e.g., `lib/my-new-stack.ts`):

   ```typescript
   import * as cdk from 'aws-cdk-lib/core';
   import type { Construct } from 'constructs';

   export class MyNewStack extends cdk.Stack {
     constructor(scope: Construct, id: string, props?: cdk.StackProps) {
       super(scope, id, props);

       // Define resources here
     }
   }
   ```

2. Export from `lib/index.ts`:

   ```typescript
   export * from './my-new-stack';
   ```

3. Instantiate in `bin/example-project.ts`:

   ```typescript
   import { MyNewStack } from '../lib/my-new-stack';

   new MyNewStack(app, 'MyNewStack');
   ```

4. Add tests in `test/my-new-stack.test.ts`

## CDK App Entry Point

The app is defined in `bin/example-project.ts`:

- Creates a `cdk.App()`
- Instantiates all stacks
- Adds `AwsSolutionsChecks` as a validation plugin via `cdk.Validations.of(app).addPlugins()`

The CDK CLI runs this via: `npx ts-node --prefer-ts-exts bin/example-project.ts`

## cdk-nag Integration

This project uses cdk-nag with `AwsSolutionsChecks` to enforce AWS security best practices.

The validation plugin is added in the app entry point:

```typescript
import { AwsSolutionsChecks } from 'cdk-nag';

cdk.Validations.of(app).addPlugins(new AwsSolutionsChecks(app));
```

### Acknowledging cdk-nag Findings

When a cdk-nag rule must be suppressed (with justification), use `cdk.Validations.of().acknowledge()`:

```typescript
cdk.Validations.of(resource).acknowledge({
  id: 'AwsSolutions-SQS3',
  reason: 'This queue does not need a DLQ because...',
});
```

You can also acknowledge on multiple resources in a loop:

```typescript
for (const queue of [queue1, queue2]) {
  cdk.Validations.of(queue).acknowledge({
    id: 'AwsSolutions-SQS3',
    reason: 'Just some sample queues, no DLQ required',
  });
}
```

Always provide a meaningful reason explaining why the suppression is acceptable.

### Running cdk-nag Locally

```bash
npm run cdk-nag
```

This synthesizes all stacks (`npx cdk synth '**'`) and validates them against AwsSolutions rules.

## Feature Flags

The `cdk.json` file contains CDK feature flags in the `context` section. These enable newer default behaviors. When creating new projects or upgrading CDK versions, ensure all recommended feature flags are enabled.

Do not remove existing feature flags unless you understand the implications for deployed resources.

## Security Best Practices

- **Always set `enforceSSL: true`** on SQS queues
- **Enable encryption** on S3 buckets, DynamoDB tables, and other data stores
- **Use least-privilege IAM policies** - avoid `*` resources and actions where possible
- **Enable logging** for API Gateways, Load Balancers, and CloudTrail
- **Set removal policies appropriately** - use `RETAIN` for production data stores

## Import Patterns for CDK

Use namespace imports for AWS service modules:

```typescript
import * as cdk from 'aws-cdk-lib/core';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as iam from 'aws-cdk-lib/aws-iam';
```

Use type imports for construct types:

```typescript
import type { Construct } from 'constructs';
import type { StackProps } from 'aws-cdk-lib/core';
```
