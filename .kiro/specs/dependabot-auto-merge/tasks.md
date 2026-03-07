# Implementation Plan: Dependabot Auto-Merge

## Overview

This implementation plan creates two GitHub Actions workflows that automate the approval and merging of Dependabot pull requests. The workflows use GitHub CLI commands and the merge queue feature to ensure safe, automated dependency updates.

## Current State

- ✅ Dependabot is configured (`.github/dependabot.yml`)
- ✅ Build workflow exists with `lint-typecheck-format` job
- ❌ Auto-approve workflow does not exist
- ❌ Auto-merge workflow does not exist
- ❌ Configuration documentation does not exist

## Tasks

- [x] 1. Create auto-approve workflow
  - Create `.github/workflows/dependabot-auto-approve.yml`
  - Configure workflow to trigger on pull_request opened and reopened events for main branch
  - Set permissions to pull-requests: write
  - Add job with conditional check for Dependabot actor (`github.event.pull_request.user.login == 'dependabot[bot]'`)
  - Use GitHub CLI command `gh pr review --approve` when actor is `dependabot[bot]`
  - Add conditional to skip draft PRs (`github.event.pull_request.draft == false`)
  - _Requirements: 1.1, 1.2, 1.4, 6.1, 7.1, 7.4_

- [x] 2. Create auto-merge workflow
  - Create `.github/workflows/dependabot-auto-merge.yml`
  - Configure workflow to trigger on pull_request_review submitted events
  - Set permissions to pull-requests: write and contents: read
  - Add job with conditional checks for approved state (`github.event.review.state == 'approved'`) and Dependabot actor
  - Use GitHub CLI command `gh pr merge --auto --merge` to enable auto-merge with merge queue method
  - Add conditional to skip draft PRs
  - _Requirements: 2.1, 2.2, 2.3, 2.4, 6.2, 7.2, 7.4_

- [x] 3. Create repository configuration documentation
  - Create `.github/docs/dependabot-auto-merge-setup.md`
  - Document required branch protection settings (require PR, require status checks, require merge queue)
  - Document merge queue enablement steps
  - Document workflow permissions requirements (allow GitHub Actions to create and approve PRs)
  - Document required status checks configuration (`lint-typecheck-format` from build.yml)
  - Include verification checklist
  - Include testing instructions
  - _Requirements: 5.1, 5.2, 5.3, 5.4, 5.5, 5.6_

- [ ]\* 4. Create workflow validation script
  - Create a script to validate workflow YAML configuration
  - Check that trigger events match specifications
  - Check that permissions are correctly scoped and minimal
  - Check that conditionals reference correct event properties
  - Check that no personal access tokens are referenced
  - _Requirements: 6.1, 6.2, 6.4, 7.1, 7.2, 7.3_

- [x] 5. Checkpoint - Test workflows in repository
  - Ensure workflows are committed and pushed
  - Verify workflows appear in Actions tab
  - Wait for or trigger a Dependabot PR to test behavior
  - Verify auto-approve workflow runs and approves the PR
  - Verify auto-merge workflow runs and enables auto-merge
  - Verify PR enters merge queue and merges after checks pass
  - Ask the user if any issues arise

## Notes

- Tasks marked with `*` are optional and can be skipped for faster implementation
- The workflows use GitHub CLI (`gh`) which is pre-installed in GitHub Actions runners
- Both workflows are idempotent and safe to run multiple times
- Repository settings must be configured before workflows will function correctly (see configuration documentation)
- The merge queue feature must be enabled in repository settings
- Branch protection must require the merge queue for the main branch
- The existing `lint-typecheck-format` job in build.yml should be used as the required status check
