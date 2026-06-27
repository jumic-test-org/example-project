# Build and Test

## NPM Scripts

| Command                | Description                                                                    |
| ---------------------- | ------------------------------------------------------------------------------ |
| `npm run build`        | Compiles TypeScript to JavaScript (`tsc`) into `dist/`                         |
| `npm run watch`        | Watches for changes and recompiles (`tsc -w`)                                  |
| `npm test`             | Runs Jest unit tests                                                           |
| `npm run typecheck`    | Type-checks without emitting (`tsc --noEmit`)                                  |
| `npm run lint`         | Runs ESLint on the entire project                                              |
| `npm run lint:fix`     | Runs ESLint with auto-fix                                                      |
| `npm run format`       | Formats all files with Prettier                                                |
| `npm run format-check` | Checks formatting without modifying files                                      |
| `npm run cdk-nag`      | Synthesizes all stacks and runs cdk-nag security checks (`npx cdk synth '**'`) |

## Running Tests

Tests use Jest with ts-jest for TypeScript support:

```bash
# Run all tests
npm test

# Run a specific test file
npx jest test/example-project.test.ts

# Run tests matching a pattern
npx jest --testPathPattern="my-stack"
```

Test configuration (`jest.config.js`):

- Test root: `<rootDir>/test`
- Test file pattern: `**/*.test.ts`
- Transform: ts-jest for `.ts`/`.tsx` files
- Setup: `aws-cdk-lib/testhelpers/jest-autoclean` (auto-cleans CDK synthesis artifacts)

## Writing Tests

Tests use CDK assertions library:

```typescript
import * as cdk from 'aws-cdk-lib/core';
import { Template } from 'aws-cdk-lib/assertions';
import { MyStack } from '../lib/my-stack';

test('My resource is created', () => {
  const app = new cdk.App();
  const stack = new MyStack(app, 'TestStack');
  const template = Template.fromStack(stack);

  template.hasResourceProperties('AWS::SQS::Queue', {
    VisibilityTimeout: 300,
  });
});
```

## CI Checks (build.yml)

The CI pipeline runs on every pull request and merge group event:

1. **Prettier check** - `npm run format-check`
2. **ESLint check** - `npm run lint`
3. **TypeScript check** - `npm run typecheck`
4. **cdk-nag check** - `npm run cdk-nag`

All four checks must pass before a PR can be merged.

## Validating Changes Before Submitting a PR

Run these commands locally in order:

```bash
npm run format-check   # Verify formatting (or npm run format to auto-fix)
npm run lint           # Check for lint errors (or npm run lint:fix to auto-fix)
npm run typecheck      # Verify types compile
npm test              # Run unit tests
npm run cdk-nag       # Validate CDK security best practices
```

If formatting fails, fix it with:

```bash
npm run format
```

If lint fails, try auto-fixing:

```bash
npm run lint:fix
```

## Excluding Generated Files from Formatting

Auto-generated directories (such as `.agents/` for task metadata) must be listed in
`.prettierignore` at the repository root. If you add a new generated or metadata directory
to the project, append it to `.prettierignore` so that `npm run format-check` does not
flag files that are not meant to follow project formatting rules.
