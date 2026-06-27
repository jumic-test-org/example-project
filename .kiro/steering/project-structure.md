# Project Structure

## Directory Layout

```
example-project/
├── bin/                    # CDK app entry point
│   └── example-project.ts # Instantiates stacks and adds cdk-nag validation
├── lib/                    # CDK stacks and constructs (source of truth)
│   ├── index.ts            # Barrel export file - all stacks/constructs exported here
│   └── example-project-stack.ts
├── test/                   # Jest unit tests
│   └── example-project.test.ts
├── dist/                   # Compiled JS output (gitignored, built by tsc)
├── cdk.out/                # CDK synthesis output (gitignored)
├── .github/workflows/      # CI/CD pipelines
│   ├── build.yml           # PR checks: format, lint, typecheck, cdk-nag
│   ├── semantic-pr.yml     # PR title validation
│   ├── release-please.yml  # Automated releases and publishing
│   └── dependabot-auto-merge.yml
├── .vscode/                # Editor settings (formatOnSave, Prettier, ESLint)
├── .kiro/steering/         # Kiro AI assistant guidance files
├── cdk.json                # CDK app config and feature flags
├── tsconfig.json           # TypeScript compiler configuration
├── eslint.config.ts        # ESLint flat config
├── .prettierrc             # Prettier formatting config
├── jest.config.js          # Jest test configuration
└── package.json            # Dependencies and npm scripts
```

## Conventions for Adding New Stacks

1. Create the stack class in `lib/` (e.g., `lib/my-new-stack.ts`)
2. Export it from `lib/index.ts` using `export * from './my-new-stack';`
3. Instantiate it in `bin/example-project.ts`
4. Add unit tests in `test/` (e.g., `test/my-new-stack.test.ts`)

## Conventions for Adding New Constructs

1. Create the construct in `lib/` (e.g., `lib/constructs/my-construct.ts`)
2. Export it from `lib/index.ts`
3. Use the construct within a stack
4. Add unit tests in `test/`

## Gitignored Build Artifacts

The `.gitignore` excludes:

- `*.js` files (except `jest.config.js` and `eslint.config.js`)
- `*.d.ts` declaration files
- `node_modules/`
- `.cdk.staging/` and `cdk.out/`
- `dist/` directory

Only TypeScript source files (`.ts`) should be committed.
