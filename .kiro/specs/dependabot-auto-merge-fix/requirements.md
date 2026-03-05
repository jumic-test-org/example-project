# Dependabot Auto-Merge Workflow Fix

## Overview

Fix the GitHub Actions workflow error where the default GITHUB_TOKEN cannot approve Dependabot pull requests.

## Problem Statement

The current workflow fails with: "GitHub Actions is not permitted to approve pull requests" because the default GITHUB_TOKEN has restricted permissions that prevent it from approving PRs.

## User Stories

### 1. As a repository maintainer

I want Dependabot PRs to be automatically approved and merged so that I don't have to manually review and approve every dependency update.

### 2. As a developer

I want the workflow to handle minor and patch updates automatically while maintaining security so that the project stays up-to-date without manual intervention.

## Acceptance Criteria

### 1.1 Workflow executes without permission errors

- The workflow must successfully approve Dependabot PRs without encountering permission errors
- The approval step must complete successfully

### 1.2 Security is maintained

- The solution must not compromise repository security
- Only Dependabot PRs should be auto-approved
- Major version updates should require manual review (optional enhancement)

### 1.3 Auto-merge functionality works

- After approval, PRs should be automatically merged if all checks pass
- The workflow should handle both approval and merge operations

## Solution Options

### Option A: Use Personal Access Token (Recommended)

- Create a PAT with `repo` and `pull_requests` permissions
- Store it as a repository secret
- Use the PAT instead of GITHUB_TOKEN for approval

### Option B: Enable auto-merge without explicit approval

- Use `gh pr merge --auto` instead of approval
- Requires repository settings to allow auto-merge
- Simpler but requires repo configuration changes

### Option C: Use GitHub App token

- Create a GitHub App with appropriate permissions
- More complex but more secure for organizations

## Constraints

- Must work with existing Dependabot configuration
- Should not require extensive repository permission changes
- Must be maintainable and well-documented
