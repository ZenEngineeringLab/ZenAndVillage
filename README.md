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
WS_URL=$(aws ssm get-parameter  --name /zenvillage/staging/ws-url     --query Parameter.Value --output text | sed 's|^https://|wss://|')
POOL_ID=$(aws ssm get-parameter --name /zenvillage/staging/cognito-pool-id   --query Parameter.Value --output text)
CLIENT_ID=$(aws ssm get-parameter --name /zenvillage/staging/cognito-client-id --query Parameter.Value --output text)
BUCKET=$(aws ssm get-parameter  --name /zenvillage/staging/frontend-bucket-name --query Parameter.Value --output text)
DIST_ID=$(aws ssm get-parameter --name /zenvillage/staging/cloudfront-dist-id  --query Parameter.Value --output text)

# Build — all runtime config injected at build time, nothing hardcoded
VITE_API_BASE_URL=$API_URL \
VITE_WS_ENDPOINT=$WS_URL \
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

### Phase 10 — Tear down the environment

> ⚠️ **Destructive and irreversible.** All DynamoDB data, Cognito users, S3 files, and CloudWatch logs will be permanently deleted. Only proceed when you are certain the environment is no longer needed.

#### 10a — Empty the frontend S3 bucket

CDK cannot delete buckets that still contain objects. The **uploads bucket** (`zenvillage-uploads-staging`) is configured with `autoDeleteObjects: true`, so CDK handles it automatically. Only the frontend bucket needs to be emptied manually:

```bash
BUCKET=$(aws ssm get-parameter --name /zenvillage/staging/frontend-bucket-name --query Parameter.Value --output text)
aws s3 rm s3://$BUCKET --recursive
```

#### 10b — Destroy all CDK stacks

```bash
# From zenvillage-backend/
npm run cdk -- destroy --all --context env=staging --force
```

CDK destroys stacks in reverse dependency order. **Estimated time:** 10–20 minutes.

> **Note:** in `staging` all resources have `RemovalPolicy.DESTROY`, so DynamoDB tables, the Cognito User Pool, and the CloudFront distribution are all deleted automatically. In `prod`, the Cognito User Pool has `RemovalPolicy.RETAIN` and must be deleted manually from the AWS Console or CLI after the stack is destroyed.

#### 10c — Delete orphaned CloudWatch Log Groups (optional)

CDK stacks do not manage Lambda Log Groups — CloudWatch creates them automatically on first invocation and leaves them behind after a destroy. Clean them up manually if needed:

```bash
# List all Log Groups for this environment
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/zenvillage-" \
  --query 'logGroups[*].logGroupName' \
  --output text | tr '\t' '\n' | grep staging

# Delete each one (repeat for every group listed above)
aws logs delete-log-group --log-group-name "/aws/lambda/zenvillage-<function-name>-staging"
```

Or delete all staging Lambda Log Groups in one pass:

```bash
aws logs describe-log-groups \
  --log-group-name-prefix "/aws/lambda/zenvillage-" \
  --query 'logGroups[*].logGroupName' \
  --output text \
| tr '\t' '\n' \
| grep staging \
| xargs -I {} aws logs delete-log-group --log-group-name {}
```

#### 10d — Delete the VAPID secret (optional)

```bash
aws secretsmanager delete-secret \
  --secret-id "/zenvillage/staging/vapid-private-key" \
  --force-delete-without-recovery
```

#### What is NOT deleted

| Resource | Reason | How to remove |
|---|---|---|
| CDK Bootstrap stack (`CDKToolkit`) | Shared by all CDK deployments in the account — do not delete unless you are done with CDK entirely | `cdk bootstrap` creates it; delete via CloudFormation console if needed |
| CloudWatch Log Groups | Not managed by CDK stacks | Phase 10c above |
| VAPID secret | Not part of any CDK stack | Phase 10d above |
| Cognito User Pool (prod only) | `RemovalPolicy.RETAIN` | AWS Console → Cognito → Delete user pool |

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
| `VITE_WS_ENDPOINT` | WebSocket API endpoint |
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

## AWS cost estimate

Monthly cost estimate for a production deployment in **us-east-1** across three scale tiers.
All figures are derived from [AWS public pricing](https://aws.amazon.com/pricing/) as of May 2026 and cover the services provisioned by the CDK stacks.
Actual costs vary with traffic patterns, data transfer destinations, and log volumes.

> **AWS Free Tier note:** a new AWS account includes 12-month free-tier credits (e.g. 1 TB CloudFront egress, 5 GB S3) and always-free allowances (1 M Lambda requests/month, 400K GB-seconds/month, 25 GB DynamoDB storage, 1 M SQS requests/month, first 100K X-Ray traces/month). The estimates below do **not** apply free-tier credits so they remain accurate after the first year.

---

### Deployment tiers and assumptions

| | MVP | Small Production | Medium Scale |
|---|---|---|---|
| Monthly Active Users | 100 | 1,000 | 10,000 |
| Tenants | 3 | 20 | 100 |
| API requests / month | 300 K | 1.5 M | 6 M |
| WebSocket messages / month | 150 K | 750 K | 3 M |
| Async Lambda invocations / month | 60 K | 300 K | 1 M |
| Total Lambda invocations / month | 510 K | 2.55 M | 10 M |
| S3 storage (assets + uploads) | 5 GB | 50 GB | 500 GB |
| CloudFront egress | 5 GB | 50 GB | 500 GB |
| CloudWatch log ingestion | 0.5 GB | 2 GB | 10 GB |
| Lambda memory / avg duration | 512 MB / 200 ms | 512 MB / 200 ms | 512 MB / 200 ms |
| X-Ray sampling rate | 5 % | 5 % | 5 % |

---

### Per-service cost breakdown (USD / month)

| Service | MVP | Small Production | Medium Scale | Pricing basis |
|---|---|---|---|---|
| **AWS Lambda** | $0.00 | $0.31 | $11.80 | $0.20 / 1M requests; $0.0000166667 / GB-s |
| **API Gateway HTTP API** | $0.30 | $1.50 | $6.00 | $1.00 / 1M requests |
| **API Gateway WebSocket API** | $0.15 | $0.79 | $3.38 | $1.00 / 1M messages; $0.25 / 1M connection-minutes |
| **Amazon DynamoDB (on-demand)** | $0.40 | $2.50 | $25.00 | $1.25 / 1M WCU; $0.25 / 1M RCU; $0.25 / GB storage |
| **Amazon Cognito** | $0.00 | $0.00 | $0.00 | Free up to 50K MAU |
| **Amazon S3** | $0.20 | $1.85 | $18.50 | $0.023 / GB storage; $0.005 / 1K PUT; $0.0004 / 1K GET |
| **Amazon CloudFront** | $0.73 | $5.75 | $48.50 | $0.085 / GB egress (US); $0.010 / 10K HTTPS requests |
| **Amazon SQS** | $0.00 | $0.00 | $0.80 | $0.40 / 1M requests after 1M free |
| **Amazon CloudWatch** (logs + alarms) | $2.25 | $5.00 | $13.00 | $0.50 / GB ingested; $0.10 / alarm / month |
| **AWS X-Ray** | $0.00 | $0.00 | $1.00 | $5.00 / 1M traces after 100K free |
| **AWS SSM Parameter Store** | $0.00 | $0.00 | $0.00 | Standard parameters are free |
| **Total** | **~$4 / mo** | **~$18 / mo** | **~$128 / mo** | |

---

### Cost growth summary

```
$4 / mo  ───────  MVP           (100 MAU,    3 tenants)
$18 / mo ──────── Small Prod    (1 K MAU,   20 tenants)
$128 / mo ─────── Medium Scale  (10 K MAU, 100 tenants)
```

The largest cost driver at medium scale is **CloudFront egress** (~38 %) followed by **DynamoDB** (~20 %) and **Lambda compute** (~9 %). At MVP and small-production scale, **CloudWatch alarms** are the dominant line item — the architecture provisions ~20–80 alarms depending on the number of active Lambda domains.

---

### Cost optimization levers

| Lever | Applicable tier | Expected saving |
|---|---|---|
| Enable DynamoDB provisioned capacity (+ auto-scaling) once traffic is predictable | Medium Scale | 20–50 % on DynamoDB |
| Add CloudFront caching for API GET responses (stale-while-revalidate) | Small Prod + | 30–60 % on API Gateway + Lambda |
| Use CloudWatch Log Groups with 7-day retention for non-audit logs | All tiers | 40–60 % on CloudWatch storage |
| Reduce X-Ray sampling to 1 % in production (adjust in CDK) | Medium Scale | Keeps traces within free tier |
| Compress S3 assets with Brotli/gzip + use S3 Intelligent-Tiering for uploads | Small Prod + | 10–30 % on S3 + CloudFront |
| Reserve Lambda concurrency + use Graviton2 (`arm64`) runtime | Medium Scale | ~20 % on Lambda compute |

---

## Architecture

The full architecture — stack, patterns, API contracts, auth, multi-tenancy, data strategy, CI/CD, and UI stack — is documented in [`docs/architecture-guide.md`](docs/architecture-guide.md).
