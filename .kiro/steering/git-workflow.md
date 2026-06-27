# Git Workflow

## Semantic PR Titles

PR titles must follow the [Conventional Commits](https://www.conventionalcommits.org/) format. This is enforced by CI (`semantic-pr.yml`).

Valid prefixes:

| Prefix      | Usage                                      | Triggers Release |
| ----------- | ------------------------------------------ | ---------------- |
| `feat:`     | New features                               | Yes (minor)      |
| `fix:`      | Bug fixes                                  | Yes (patch)      |
| `chore:`    | Maintenance tasks                          | No               |
| `docs:`     | Documentation changes                      | No               |
| `refactor:` | Code restructuring without behavior change | No               |
| `test:`     | Adding or updating tests                   | No               |
| `ci:`       | CI/CD pipeline changes                     | No               |
| `perf:`     | Performance improvements                   | Yes (patch)      |

Examples:

- `feat: add S3 bucket for data ingestion`
- `fix: correct IAM policy for Lambda execution role`
- `chore: bump aws-cdk-lib to v2.261.0`

Breaking changes: append `!` after the type (e.g., `feat!: redesign stack props interface`) - this triggers a major version bump.

## Release Process

This project uses [release-please](https://github.com/googleapis/release-please) for automated versioning and releases:

1. Merge PRs to `main` with semantic titles
2. release-please automatically creates/updates a release PR that bumps the version
3. When the release PR is merged, it:
   - Creates a GitHub release with a changelog
   - Builds the package
   - Publishes to AWS CodeArtifact under the `@my-org` scope

Version bumps are determined by commit types:

- `feat:` = minor version bump
- `fix:` / `perf:` = patch version bump
- `feat!:` / `fix!:` = major version bump

## Dependency Management

- **Dependabot** is configured for automated dependency updates
- Minor/patch updates are auto-merged via `dependabot-auto-merge.yml`
- Major updates require manual review

## Branch Strategy

- `main` is the primary branch - all PRs target `main`
- Feature branches should be descriptive (e.g., `feat/add-s3-bucket`, `fix/iam-permissions`)
- PRs must pass all CI checks before merging:
  - Prettier formatting
  - ESLint
  - TypeScript type checking
  - cdk-nag security validation
  - Semantic PR title validation
