# Dependabot Auto-Merge Setup Guide

This guide explains how to configure your GitHub repository to enable automated approval and merging of Dependabot pull requests using the merge queue feature.

## Overview

The Dependabot auto-merge feature consists of two GitHub Actions workflows:

1. **Auto-Approve Workflow** - Automatically approves Dependabot PRs when they are opened or reopened
2. **Auto-Merge Workflow** - Enables auto-merge on approved Dependabot PRs using the merge queue

These workflows work together to automate dependency updates while maintaining safety through required status checks and GitHub's merge queue.

## Prerequisites

Before the workflows can function, you must configure the following repository settings:

### 1. Enable Merge Queue

The merge queue feature serializes merges and validates changes before merging to the default branch.

**Steps:**

1. Navigate to your repository on GitHub
2. Go to **Settings** → **General** → **Pull Requests**
3. Scroll to the "Merge queue" section
4. ✅ Check **"Enable merge queue"**
5. Click **Save changes**

### 2. Configure Branch Protection for `main`

Branch protection rules enforce safety requirements before code can be merged.

**Steps:**

1. Navigate to **Settings** → **Branches**
2. Click **Add branch protection rule** (or edit existing rule for `main`)
3. In "Branch name pattern", enter: `main`
4. Configure the following settings:

#### Required Settings:

- ✅ **Require a pull request before merging**
  - This ensures all changes go through a PR process
- ✅ **Require status checks to pass before merging**
  - Click "Add" and search for: `lint-typecheck-format`
  - This is the job name from your build workflow that must pass
- ✅ **Require merge queue**
  - This ensures PRs are validated through the merge queue before merging
- ✅ **Do not allow bypassing the above settings**
  - Ensures even administrators follow the rules

#### Optional but Recommended:

- ✅ **Require conversation resolution before merging**
- ✅ **Require linear history**

5. Click **Create** or **Save changes**

### 3. Configure Workflow Permissions

The workflows need permission to approve pull requests on behalf of GitHub Actions.

**Steps:**

1. Navigate to **Settings** → **Actions** → **General**
2. Scroll to **Workflow permissions**
3. Ensure the default GITHUB_TOKEN permissions are set to:
   - **"Read repository contents and packages permissions"** (or more permissive)
4. ✅ Check **"Allow GitHub Actions to create and approve pull requests"**
   - This is **critical** for the auto-approve workflow to function
5. Click **Save**

### 4. Configure Merge Methods

Ensure at least one merge method is enabled for the repository.

**Steps:**

1. Navigate to **Settings** → **General** → **Pull Requests**
2. Scroll to "Allow merge commits" section
3. Ensure at least one option is checked:
   - ✅ **Allow merge commits** (recommended for merge queue)
   - Optional: Allow squash merging
   - Optional: Allow rebase merging

The workflows use merge commits by default.

## Required Status Checks

The branch protection configuration must include the following required status check:

- **`lint-typecheck-format`** - This job from your build workflow validates code quality

This check will run automatically when PRs enter the merge queue. Only PRs that pass this check will be merged.

## Verification Checklist

After completing the configuration steps above, verify the following:

- [ ] Merge queue is enabled in repository settings
- [ ] Branch protection rule exists for `main` branch
- [ ] Branch protection requires pull requests before merging
- [ ] Branch protection requires status checks to pass
- [ ] Branch protection requires merge queue
- [ ] Required status check `lint-typecheck-format` is configured
- [ ] GitHub Actions can create and approve pull requests (workflow permissions)
- [ ] At least one merge method is enabled (merge commits recommended)
- [ ] Dependabot is enabled and configured in `.github/dependabot.yml`
- [ ] Auto-approve workflow exists at `.github/workflows/dependabot-auto-approve.yml`
- [ ] Auto-merge workflow exists at `.github/workflows/dependabot-auto-merge.yml`

## Testing Instructions

Once configuration is complete, test the automation with these steps:

### Option 1: Wait for Dependabot

1. Wait for Dependabot to automatically open a pull request for a dependency update
2. Monitor the Actions tab to see the workflows run
3. Proceed to verification steps below

### Option 2: Manually Trigger Dependabot

1. Navigate to **Insights** → **Dependency graph** → **Dependabot**
2. Click **"Check for updates"** on a dependency
3. Wait for Dependabot to create a PR
4. Proceed to verification steps below

### Verification Steps

When a Dependabot PR is created, verify the following sequence:

1. **Auto-Approve Workflow Runs**
   - Go to **Actions** tab
   - Find the "Auto-approve Dependabot PRs" workflow run
   - Verify it completed successfully
   - Check the PR - it should show an approval from `github-actions[bot]`

2. **Auto-Merge Workflow Runs**
   - After approval, the "Auto-merge Dependabot PRs" workflow should trigger
   - Verify it completed successfully
   - Check the PR - it should show "Auto-merge enabled" with merge queue method

3. **Merge Queue Processing**
   - The PR should automatically enter the merge queue
   - The `lint-typecheck-format` status check should run
   - Monitor the merge queue status on the PR

4. **Automatic Merge**
   - If all checks pass, the PR should automatically merge to `main`
   - If any check fails, the PR will be removed from the queue and remain open

### Expected Timeline

- Auto-approve: Runs immediately when PR is opened (~30 seconds)
- Auto-merge enablement: Runs immediately after approval (~30 seconds)
- Merge queue processing: Depends on queue length and check duration (1-5 minutes typically)
- Automatic merge: Happens immediately after checks pass

## Troubleshooting

### Workflow doesn't approve the PR

**Possible causes:**

- Workflow permissions not configured correctly
  - Solution: Verify "Allow GitHub Actions to create and approve pull requests" is enabled
- PR is in draft state
  - Solution: The workflows skip draft PRs by design - mark the PR as ready for review
- PR actor is not `dependabot[bot]`
  - Solution: Workflows only process Dependabot PRs - this is expected behavior

### Auto-merge doesn't enable

**Possible causes:**

- PR is not approved
  - Solution: Ensure the auto-approve workflow ran successfully first
- Merge queue not enabled
  - Solution: Enable merge queue in repository settings
- Branch protection not configured
  - Solution: Follow branch protection configuration steps above

### PR doesn't enter merge queue

**Possible causes:**

- Branch protection doesn't require merge queue
  - Solution: Enable "Require merge queue" in branch protection settings
- Required status checks not configured
  - Solution: Add `lint-typecheck-format` as a required status check

### PR removed from merge queue

**Possible causes:**

- Status checks failed
  - Solution: Review the check results and fix any issues in the code
  - The PR will remain open for manual review and fixes
- Merge conflict detected
  - Solution: Rebase or merge the PR to resolve conflicts

## How It Works

### Workflow Sequence

```
1. Dependabot opens PR
   ↓
2. Auto-approve workflow triggers (on PR opened/reopened)
   ↓
3. Workflow checks: Is actor dependabot[bot]? Is PR not draft?
   ↓
4. If yes: Approve PR using GitHub CLI
   ↓
5. Auto-merge workflow triggers (on PR review submitted)
   ↓
6. Workflow checks: Is review approved? Is actor dependabot[bot]? Is PR not draft?
   ↓
7. If yes: Enable auto-merge with merge queue method
   ↓
8. PR enters merge queue
   ↓
9. Merge queue runs required status checks (lint-typecheck-format)
   ↓
10. If checks pass: PR automatically merges to main
    If checks fail: PR removed from queue, remains open
```

### Security Considerations

- Workflows use minimal permissions (pull-requests: write, contents: read)
- Workflows only process PRs from `dependabot[bot]` actor
- All PRs must pass required status checks before merging
- Merge queue validates changes before merging to main branch
- No personal access tokens or elevated credentials are used
- Draft PRs are excluded from automation

### Workflow Files

- **`.github/workflows/dependabot-auto-approve.yml`** - Approves Dependabot PRs
- **`.github/workflows/dependabot-auto-merge.yml`** - Enables auto-merge on approved PRs

Both workflows are idempotent and safe to run multiple times.

## Additional Resources

- [GitHub Merge Queue Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/configuring-pull-request-merges/managing-a-merge-queue)
- [GitHub Branch Protection Documentation](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-protected-branches/about-protected-branches)
- [Dependabot Documentation](https://docs.github.com/en/code-security/dependabot)
- [GitHub Actions Permissions](https://docs.github.com/en/actions/security-guides/automatic-token-authentication#permissions-for-the-github_token)

## Support

If you encounter issues not covered in this guide:

1. Check the Actions tab for workflow run logs
2. Verify all configuration steps in the checklist above
3. Review the troubleshooting section
4. Check that your repository has Dependabot enabled and configured
