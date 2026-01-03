# GitHub Actions Workflows

This directory contains CI/CD workflows for the Yukio Frontend.

## Workflows

### `ci.yml`
Main CI pipeline that runs on every push and pull request:
- **Lint**: Runs ESLint to check code quality
- **Type Check**: Validates TypeScript types
- **Build**: Builds the Next.js application

### `deploy.yml`
Deployment workflow that runs on pushes to `main`:
- **Deploy to Vercel**: Automatically deploys to Vercel production

### `code-quality.yml`
Code quality checks for pull requests:
- **Bundle Size Analysis**: Analyzes build output size
- **Accessibility**: Runs accessibility checks (optional)

### `dependency-review.yml`
Security workflow that reviews dependencies:
- **Dependency Review**: Checks for known vulnerabilities in npm packages

## Required Secrets

For deployment to work, add these secrets in GitHub Settings > Secrets:

- `VERCEL_TOKEN`: Vercel deployment token
- `VERCEL_ORG_ID`: Vercel organization ID
- `VERCEL_PROJECT_ID`: Vercel project ID
- `NEXT_PUBLIC_BACKEND_URL`: Backend API URL (optional, defaults to localhost)

## Usage

Workflows run automatically on:
- Push to `main` or `develop` branches
- Pull requests to `main` or `develop`
- Manual trigger via `workflow_dispatch`

