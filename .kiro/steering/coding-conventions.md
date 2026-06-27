# Coding Conventions

## Prettier Formatting

Configuration (`.prettierrc`):

```json
{
  "semi": true,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

Rules:

- Always use semicolons
- Always use single quotes (not double quotes)
- Always include trailing commas (including function parameters)
- Lines should not exceed 100 characters

## ESLint Rules

Configuration: `eslint.config.ts` (flat config format)

Key rules enforced:

| Rule                                         | Setting                                | Effect                                              |
| -------------------------------------------- | -------------------------------------- | --------------------------------------------------- |
| `@typescript-eslint/consistent-type-imports` | `error`                                | Must use `import type` for type-only imports        |
| `@typescript-eslint/no-floating-promises`    | `error`                                | All promises must be awaited or explicitly handled  |
| `@typescript-eslint/no-misused-promises`     | `error`                                | Prevents incorrect promise usage in conditionals    |
| `@typescript-eslint/no-unused-vars`          | `error` with `argsIgnorePattern: "^_"` | Unused vars are errors; prefix with `_` to suppress |

The config extends:

- `@eslint/js` recommended rules
- `typescript-eslint` recommendedTypeChecked (type-aware lint rules)
- `eslint-config-prettier` (disables formatting rules that conflict with Prettier)

Ignored paths: `*.config.js`, `*.config.ts`, `cdk.out/**`, `node_modules/**`, `dist/**`

## TypeScript Conventions

From `tsconfig.json`:

- **Strict mode** enabled (strict, noImplicitAny, strictNullChecks, noImplicitThis, alwaysStrict)
- **noImplicitReturns** enabled - all code paths must return a value
- `noUnusedLocals` and `noUnusedParameters` are **disabled** (ESLint handles this)
- Target: ES2022
- Module: CommonJS with Node module resolution

## Import Style

- Use `import type` for type-only imports (enforced by ESLint):

  ```typescript
  import type { Construct } from 'constructs';
  import * as cdk from 'aws-cdk-lib/core';
  ```

- Use namespace imports (`import * as`) for CDK service modules:

  ```typescript
  import * as sqs from 'aws-cdk-lib/aws-sqs';
  import * as lambda from 'aws-cdk-lib/aws-lambda';
  ```

## Naming Conventions

- Stack classes: PascalCase ending with `Stack` (e.g., `ExampleProjectStack`)
- Construct IDs: PascalCase descriptive names (e.g., `'ExampleProjectQueue1'`)
- Files: kebab-case (e.g., `example-project-stack.ts`)
- Unused parameters: prefix with underscore (`_unused`)

## Error Handling

- Never leave promises unhandled (enforced by `no-floating-promises`)
- Never use promises incorrectly in conditionals (enforced by `no-misused-promises`)
