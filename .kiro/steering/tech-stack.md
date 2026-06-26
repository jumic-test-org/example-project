# Technology Stack

## Runtime & Language

- **Node.js** >= 24.0.0 (enforced via `engines` in package.json)
- **TypeScript** ~5.9.3 with strict mode enabled
- **Module system:** CommonJS (`"module": "commonjs"` in tsconfig.json)
- **Target:** ES2022

## AWS CDK

- **AWS CDK v2** (`aws-cdk-lib` ^2.260.0) - infrastructure-as-code framework
- **Constructs** ^10.6.0 - base construct library
- **cdk-nag** ^3.0.1 - security and best-practice validation (AwsSolutionsChecks)
- **AWS CDK CLI** (`aws-cdk` ^2.1128.0) - dev dependency for synth/deploy

## Core Dependencies

| Package           | Version  | Purpose                                          |
| ----------------- | -------- | ------------------------------------------------ |
| `aws-cdk-lib`     | ^2.260.0 | CDK core library with all AWS service constructs |
| `constructs`      | ^10.6.0  | Base construct programming model                 |
| `cdk-nag`         | ^3.0.1   | Security best-practice checks                    |
| `ajv`             | ^8.20.0  | JSON schema validation                           |
| `fast-xml-parser` | ^5.9.3   | XML parsing                                      |

## Development Tools

| Tool                     | Version | Purpose                                           |
| ------------------------ | ------- | ------------------------------------------------- |
| `typescript`             | ~5.9.3  | Type checking and compilation                     |
| `jest`                   | ^30     | Unit testing framework                            |
| `ts-jest`                | ^29     | TypeScript transform for Jest                     |
| `eslint`                 | ^10.5.0 | Static code analysis                              |
| `typescript-eslint`      | ^8.61.1 | TypeScript-specific ESLint rules                  |
| `prettier`               | ^3.8.4  | Code formatting                                   |
| `eslint-config-prettier` | ^10.1.8 | Disables ESLint rules that conflict with Prettier |
| `ts-node`                | ^10.9.2 | TypeScript execution (used by CDK CLI)            |

## Package Info

- **Package name:** `@my-org/example-project`
- **Current version:** 1.4.2 (managed by release-please)
- **Published to:** AWS CodeArtifact (scoped to `@my-org`)
