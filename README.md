# ZenAndVillage

> **Connected Communities. Intelligent Operations. Peaceful Living.**

AI-powered SaaS platform for smart condominium and community management — simplifying operations, communication, security, and decision-making through intelligent automation.

---

## Repository structure

```
ZenAndVillage/
├── zenvillage-backend/     # AWS CDK infrastructure + Lambda handlers (Node.js 22 / TypeScript)
├── zenvillage-web/         # React 19 PWA (Vite 8 + TypeScript + Tailwind CSS v4)
├── docs/
│   ├── architecture-guide.md     # Single source of truth for all engineering decisions
│   ├── project-definition.md     # Project identity, version, git remote
│   ├── knowledge-base.md         # Domain knowledge (en-US — canonical)
│   └── knowledge-base-pt_BR.md  # Domain knowledge (pt-BR — translation)
├── CHANGELOG.md
└── CLAUDE.md               # Agent behavior rules (read by Claude Code on every session)
```

---

## Staging deployment guide

This guide covers the full path from a clean workstation to a running staging environment (Phases 0–9). Production deployment follows the same steps with `env=prod`.

### Prerequisites checklist

| Tool | Required version | Verify |
|---|---|---|
| Node.js | ≥ 22.12 | `node --version` |
| npm | ≥ 10 | `npm --version` |
| AWS CLI | v2.x | `aws --version` |
| AWS CDK CLI | ≥ 2.200 | `cdk --version` |

Install the CDK CLI globally if not present:

```bash
npm install -g aws-cdk
```

---

### Phase 0 — Configure AWS credentials

```bash
aws configure
# AWS Access Key ID:     <your key>
# AWS Secret Access Key: <your secret>
# Default region:        us-east-1
# Default output format: json
```

> **Recommended:** use a named profile to avoid mixing accounts.
> ```bash
> aws configure --profile zenvillage
> export AWS_PROFILE=zenvillage
> ```

Confirm which account you are targeting:

```bash
aws sts get-caller-identity --query 'Account' --output text
# Example output: 123456789012
```

---

### Phase 1 — Install backend dependencies

```bash
cd zenvillage-backend
npm install
```

---

### Phase 2 — CDK Bootstrap (once per account/region)

Bootstrap provisions the S3 bucket and IAM roles that CDK needs to deploy assets. This only needs to run once per AWS account + region pair.

```bash
cdk bootstrap aws://$(aws sts get-caller-identity --query Account --output text)/us-east-1
```

Expected output: `✅ Environment aws://123456789012/us-east-1 bootstrapped.`

---

### Phase 3 — Preview the infrastructure (no cost, no changes)

Run a dry-run synthesis before deploying to validate the CDK templates:

```bash
# From zenvillage-backend/
npm run cdk -- synth --context env=staging
```

This generates CloudFormation templates in `cdk.out/`. No AWS resources are created.

The following stacks will be provisioned:

| Stack | Key resources |
|---|---|
| `zenvillage-alarms-staging` | SNS topic — receives all CloudWatch alarm notifications |
| `zenvillage-users-staging` | DynamoDB table `zenvillage-users-staging` (Pre-Token Lambda + seed) |
| `zenvillage-cognito-staging` | Cognito User Pool + App Client + Pre-Token Generation Lambda |
| `zenvillage-api-staging` | HTTP API + WebSocket API + Lambda Authorizer |
| `zenvillage-frontend-staging` | S3 bucket + CloudFront distribution (OAC) |
| `zenvillage-tenants-staging` | DynamoDB + 5 Lambda CRUD handlers + CloudWatch alarms |
| `zenvillage-property-managers-staging` | DynamoDB + 5 Lambda CRUD handlers + CloudWatch alarms |
| `zenvillage-condominiums-staging` | DynamoDB + 5 Lambda CRUD handlers + CloudWatch alarms |
| `zenvillage-residents-staging` | DynamoDB + 5 Lambda CRUD handlers + CloudWatch alarms |
| `zenvillage-employees-staging` | DynamoDB + 5 Lambda CRUD handlers + CloudWatch alarms |
| `zenvillage-notifications-staging` | DynamoDB + WebSocket Lambdas + SQS notifier + S3 uploads |

CDK resolves cross-stack dependencies automatically. In particular, `zenvillage-users-staging` is always deployed before `zenvillage-cognito-staging` so that the table ARN is available for the IAM grant — no manual two-pass deploy is required.

---

### Phase 4 — Deploy all backend stacks (staging)

```bash
# From zenvillage-backend/
npm run deploy:staging
```

This runs:
```
cdk deploy --all --require-approval never --context env=staging
```

**Estimated time:** 15–25 minutes on a first deploy.

When complete, CDK prints the outputs for each stack. All endpoint URLs and IDs are also written to AWS Systems Manager Parameter Store — you do not need to copy them manually.

---

### Phase 5 — Verify SSM parameters

Confirm that CDK exported all values the frontend build will need:

```bash
aws ssm get-parameters-by-path \
  --path "/zenvillage/staging" \
  --query 'Parameters[*].[Name,Value]' \
  --output table
```

Expected parameters:

| SSM path | Description |
|---|---|
| `/zenvillage/staging/api-url` | HTTP API base URL |
| `/zenvillage/staging/ws-url` | WebSocket API endpoint |
| `/zenvillage/staging/cognito-pool-id` | Cognito User Pool ID |
| `/zenvillage/staging/cognito-client-id` | Cognito App Client ID |
| `/zenvillage/staging/cognito-region` | AWS region (`us-east-1`) |
| `/zenvillage/staging/cloudfront-dist-id` | CloudFront distribution ID |
| `/zenvillage/staging/cloudfront-url` | Public app URL (`https://xxxx.cloudfront.net`) |
| `/zenvillage/staging/frontend-bucket-name` | S3 bucket name for frontend assets |

---

### Phase 6 — Generate VAPID keys for Web Push

VAPID keys are required for the Web Push notification feature. Generate them once and store the private key securely in AWS Secrets Manager.

```bash
npx web-push generate-vapid-keys
# Public Key:  BBxxxxxx...  (goes to VITE_VAPID_PUBLIC_KEY in the frontend build)
# Private Key: xxxxxxxx...  (goes to Secrets Manager — never in code or .env)
```

Store the private key:

```bash
aws secretsmanager create-secret \
  --name "/zenvillage/staging/vapid-private-key" \
  --secret-string "YOUR_VAPID_PRIVATE_KEY_HERE"
```

> Keep the **public key** at hand — you will need it in Phase 7.

---

### Phase 7 — Build and deploy the frontend

#### 7a — Read SSM values and build

```bash
cd zenvillage-web
npm install --legacy-peer-deps

# Read backend outputs from SSM
API_URL=$(aws ssm get-parameter --name /zenvillage/staging/api-url    --query Parameter.Value --output text)
WS_URL=$(aws ssm get-parameter  --name /zenvillage/staging/ws-url     --query Parameter.Value --output text)
POOL_ID=$(aws ssm get-parameter --name /zenvillage/staging/cognito-pool-id   --query Parameter.Value --output text)
CLIENT_ID=$(aws ssm get-parameter --name /zenvillage/staging/cognito-client-id --query Parameter.Value --output text)
BUCKET=$(aws ssm get-parameter  --name /zenvillage/staging/frontend-bucket-name --query Parameter.Value --output text)
DIST_ID=$(aws ssm get-parameter --name /zenvillage/staging/cloudfront-dist-id  --query Parameter.Value --output text)

# Build — all runtime config injected at build time, nothing hardcoded
VITE_API_BASE_URL=$API_URL \
VITE_WS_URL=$WS_URL \
VITE_COGNITO_USER_POOL_ID=$POOL_ID \
VITE_COGNITO_CLIENT_ID=$CLIENT_ID \
VITE_COGNITO_REGION=us-east-1 \
VITE_VAPID_PUBLIC_KEY=YOUR_VAPID_PUBLIC_KEY_HERE \
VITE_APP_VERSION=$(git rev-parse --short HEAD) \
npm run build
```

#### 7b — Upload to S3

```bash
# From zenvillage-web/
aws s3 sync dist/ s3://$BUCKET/ --delete
```

#### 7c — Invalidate CloudFront cache

```bash
aws cloudfront create-invalidation \
  --distribution-id $DIST_ID \
  --paths "/*"
```

The app is now reachable at the `cloudfront-url` SSM value:

```bash
aws ssm get-parameter --name /zenvillage/staging/cloudfront-url --query Parameter.Value --output text
```

---

### Phase 8 — Seed initial data

The seed script creates three tenants, matching property managers, condominiums, residents, employees, and one Cognito admin user per tenant. It reads the Cognito User Pool ID from SSM automatically.

```bash
# From zenvillage-backend/
npm run seed
```

Default credentials created by the seed (change immediately after first login):

| Email | Tenant |
|---|---|
| `admin-agatha@zenvillage.dev` | Administradora Ágatha & Cia |
| `admin-vistaverde@zenvillage.dev` | Residencial Vista Verde |
| `admin-habitex@zenvillage.dev` | Habitex Administração |

> Temporary password: `ZenV1llage!2026`

---

### Phase 9 — Smoke tests

Run these manual checks to confirm the staging environment is healthy before enabling the CI/CD pipeline or inviting users.

| # | Test | What it validates |
|---|---|---|
| 1 | Open `cloudfront-url` in a browser | Frontend served from CloudFront; SPA routing works |
| 2 | Log in with `admin-agatha@zenvillage.dev` | Cognito auth → Pre-Token Lambda → JWT with `tenantId` + `roles` claims |
| 3 | Navigate to any list page (e.g. Condominiums) | API Gateway → Lambda Authorizer → DynamoDB read |
| 4 | Create a new record | POST with idempotency key; DynamoDB write |
| 5 | Edit and save the record | PATCH; DynamoDB update |
| 6 | Delete the record | DELETE → HTTP 204 |
| 7 | Open browser DevTools → Network tab; look for WebSocket connection | WebSocket API → `$connect` Lambda → connections table |
| 8 | Trigger any action that sends a notification | EventBridge → SQS → notifier Lambda → WebSocket push |
| 9 | Log out | Cognito sign-out; redirect to `/login` |

If all nine checks pass, the staging environment is healthy. ✅

---

## Environment variables reference

### Backend (set by CDK on each Lambda — never configured manually)

| Variable | Stack | Description |
|---|---|---|
| `TENANTS_TABLE` | tenants | DynamoDB table name |
| `PROPERTY_MANAGERS_TABLE` | property-managers | DynamoDB table name |
| `CONDOMINIUMS_TABLE` | condominiums | DynamoDB table name |
| `RESIDENTS_TABLE` | residents | DynamoDB table name |
| `EMPLOYEES_TABLE` | employees | DynamoDB table name |
| `NOTIFICATIONS_TABLE` | notifications | DynamoDB table name |
| `CONNECTIONS_TABLE` | notifications | DynamoDB table name (WebSocket connections) |
| `UPLOADS_BUCKET` | notifications | S3 bucket for file uploads |
| `USERS_TABLE` | cognito | DynamoDB table for Pre-Token Lambda |
| `WS_ENDPOINT` | notifications | WebSocket Management API endpoint |

### Frontend (injected by CI/CD build from SSM — see Phase 7)

| Variable | Description |
|---|---|
| `VITE_API_BASE_URL` | HTTP API base URL |
| `VITE_WS_URL` | WebSocket API endpoint |
| `VITE_COGNITO_USER_POOL_ID` | Cognito User Pool ID |
| `VITE_COGNITO_CLIENT_ID` | Cognito App Client ID |
| `VITE_COGNITO_REGION` | AWS region |
| `VITE_VAPID_PUBLIC_KEY` | VAPID public key for Web Push |
| `VITE_APP_VERSION` | Git commit SHA (injected by CI/CD) |
| `VITE_SENTRY_DSN` | Optional — error tracking DSN |

---

## Useful commands

```bash
# CDK commands (from zenvillage-backend/)
npm run cdk -- synth --context env=staging          # preview templates
npm run cdk -- diff --context env=staging            # diff against deployed state
npm run cdk -- deploy --context env=staging <stack>  # deploy a single stack
npm run deploy:staging                               # deploy all stacks (staging)
npm run deploy:prod                                  # deploy all stacks (prod — requires manual approval)

# Frontend (from zenvillage-web/)
npm run dev        # local dev server (http://localhost:3000)
npm run build      # production build
npm run preview    # preview production build locally

# Seed
npm run seed                        # default: staging
npm run seed -- --env=prod          # prod (use with care)
```

---

## Architecture

The full architecture — stack, patterns, API contracts, auth, multi-tenancy, data strategy, CI/CD, and UI stack — is documented in [`docs/architecture-guide.md`](docs/architecture-guide.md).
