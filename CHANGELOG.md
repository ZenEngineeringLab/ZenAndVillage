# Changelog

All notable changes to ZenAndVillage are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Fixed
- **Tenants screen crash (`Cannot read properties of undefined (reading 'activeCondos')`)** — the seed wrote tenants in the legacy schema (`condominiumsLimit`, `plan`, `cnpj`, `joinDate`, `type: property_manager`), so the canonical Tenants UI crashed reading `usageLimits`. Realigned the seeded tenants to the canonical entity (`usageLimits`, `planId`, `taxId`, `subscriptionStatus`, `createdAt`, `type: management_company|independent_condo`) and hardened `TenantsPage`/`TenantDetailPanel` to tolerate missing `usageLimits` so malformed rows degrade gracefully instead of taking down the whole route
- **500 on every endpoint for platform admins** — the shared `extractContext` helper threw `Missing tenantId in authorizer context` whenever the authorizer context had no tenant, which is exactly the platform-admin case (tenantless). Every handler using it returned 500, including `/v1/admin/subscriptions` and `/v1/admin/plans`. `extractContext` now requires only `userId` and treats `tenantId` as optional (defaulting to `''`), so cross-tenant admin handlers run. **Requires a backend redeploy.**
- **Platform admins blocked from every authenticated endpoint** — the API used a single tenant authorizer that (a) required `X-Tenant-Id` as a mandatory identity source and (b) rejected any request whose header did not match the token's tenant. Platform admins are tenantless, so the frontend sent no `X-Tenant-Id` and API Gateway returned 401 before the authorizer even ran — breaking the admin subscriptions/plans screens (and all tenant lists) for the approver. Removed `X-Tenant-Id` from the required identity sources and updated the authorizer to authorize `platform_admin` tokens without a tenant, while still enforcing tenant-match for tenant-scoped users. **Requires a backend redeploy.**
- **`P.map is not a function` crash on plan selection / admin list screens** — direct `httpClient` list fetches extracted the response as `res.data.items ?? res.data`, but the backend wraps payloads in a `{ data: ... }` envelope (e.g. `GET /v1/plans` returns `{ data: [...] }`), so the whole object was passed to `.map`. Normalized extraction to unwrap `data` and always return an array across PlanSelectionPage, AdminPlansPage, AdminOverviewPage, AdminSubscriptionsPage, and CondominiumDetail (blocks/units)
- **Frontend production build failures (33 TypeScript errors)** — the Tenants screens (list, detail panel, form) still referenced legacy seed-era fields (`plan`, `cnpj`, `condominiumsCount`/`Limit`, `unitsCount`/`Limit`, `trialEnd`, `joinDate`) and outdated `type`/`status` enums; realigned them to the canonical `Tenant` entity (`planId`, `taxId`, `usageLimits`, `subscriptionStatus`, `trialEndDate`, `createdAt`, `type: management_company|independent_condo`, `status: active|suspended|canceled`) and updated the matching `tenants.type`/`tenants.status`/`tenants.usage` i18n keys in both locales. Also fixed the `zodResolver` input/output type mismatch (zod v4 + `@hookform/resolvers` v5) on the plan and unit forms, and removed two unused imports
- **CDK synth failure on `subscriptions` stack** — the cross-stack imports of the Tenants and Users tables passed both `tableArn` and `tableName` to `Table.fromTableAttributes`, which CDK rejects with `TableArnOrNameConflict`, aborting `cdk bootstrap`/`deploy`; switched to `Table.fromTableArn` (only the ARN is needed for the IAM grants)

### Added
- **`--clean` seed flag for a fresh demo** — `scripts/seed.ts --clean` now wipes all data tables (plans, tenants, property managers, condominiums, residents, employees, subscriptions; the users table is preserved so Cognito sign-in keeps working) before re-seeding, eliminating the duplicate clutter that accumulated across runs
- **Demo approval flow data** — the seed now provisions a pending tenant (`Condomínio Aurora`), a `pending-owner@zenvillage.dev` account in `pending_approval`, and a matching `pending_approval` subscription, so the platform admin has a real request to approve out of the box
- **Plan catalog seeding** — the staging seed script (`scripts/seed.ts`) now creates the three public plans (`starter`, `pro`, `enterprise`, all `active` + `public`) in the `zenvillage-plans-{env}` table. Without this the self-service plan-selection screen had no plans to choose and onboarding could not proceed
- **Platform admin seed user** — the seed now provisions a dedicated `platform-admin@zenvillage.dev` account with the `platform_admin` role (and no tenant), the only role allowed to approve/reject subscription requests. Seeded admin users now also get `onboardingStatus: 'complete'` and per-user `roles`, so they are no longer trapped in the onboarding funnel on first sign-in
- **Registration page** — email/password/full-name form with Zod validation (min 8 chars, upper/lower/digit/symbol requirements); calls Cognito `signUp` and navigates to the verify-email step with registration state in route location
- **Email verification page** — 6-digit code entry; on success calls Cognito `confirmSignUp`, creates the user record via `POST /v1/users` (public route), signs in, and routes to the onboarding funnel via AuthGuard
- **`signUp`, `confirmSignUp`, `resendSignUpCode` methods** added to `authAdapter`; all Amplify Auth imports remain within the single adapter boundary
- **Pre-Token Generation Lambda auto-advancement** — when `email_verified = true` and `onboardingStatus = pending_verification`, the Lambda atomically writes `pending_subscription` to DynamoDB before issuing the token, eliminating the need for a separate API call from the frontend; Lambda IAM permission updated from `grantReadData` to `grantReadWriteData`
- **Cognito User Pool self-signup enabled** — `selfSignUpEnabled: true` and `autoVerify: { email: true }` added to the CognitoStack so account owners can register through the web app
- **`custom:onboardingStatus` Cognito attribute** added to the User Pool custom attributes schema
- **"Don't have an account?" link** added to the login page

### Changed
- **`/onboarding/verify-email` moved to public router** — the page is reached before the user is authenticated, so it is registered as a top-level public route rather than under the AuthGuard; the AuthGuard `pending_verification` case redirects to this public route unchanged
- **`AuthUser` now includes `cognitoSub`** — the Cognito `sub` claim is stored separately from the internal UUID (`id`) so pages that call user-scoped API endpoints (which use the Cognito sub as a path parameter) can do so without decoding the JWT again

### Added
- **Plan selection page** — two-step flow: (1) plan cards with monthly/annual billing toggle and pricing; (2) organization info form (name, type, CNPJ, contact email); submits `POST /v1/subscriptions` and advances the auth store to `pending_approval`
- **Pending approval page** — waiting-state screen with a "Refresh status" button that calls `refreshSession`, reads the new JWT, and routes forward if the admin has approved; includes a sign-out option
- **First condominium wizard** — two-step form: (1) basic info (name, type, CNPJ); (2) address; on completion calls `POST /v1/condominiums` then `PATCH /v1/users/{sub}/onboarding-status` to advance to `complete`; "Skip for now" option advances without creating a condominium
- **`cross-domain.ts` `updateUserTenantId`** — new function that sets `User.tenantId` in DynamoDB; the approve handler now calls it alongside `updateUserOnboardingStatus` so the Pre-Token Generation Lambda emits the correct `custom:tenantId` claim after approval
- **Platform Admin area** — four admin pages behind an `AdminGuard` component that checks for the `platform_admin` role:
  - **AdminOverviewPage** — KPI cards (pending requests, total/active tenants, total plans) and recent subscription requests list
  - **AdminSubscriptionsPage** — filterable table of all subscriptions with approve (trial/active) and reject (rejectionReason ≥ 20 chars) actions via side sheet; enforces RN-ADM-002 and RN-ADM-003
  - **AdminTenantsPage** — placeholder noting that `GET /v1/admin/tenants` (cross-tenant scan) is pending backend implementation
  - **AdminPlansPage** — full plan management: create, edit, discontinue (RN-ADM-004) with side sheet forms
- **Conditional admin sidebar section** — `AppSidebar` now shows a Platform Admin navigation group (Overview, Subscriptions, Plans) for users with the `platform_admin` role
- **Condominium sub-entities UI** — `CondominiumDetail` now fetches blocks and units from the real API (`GET /v1/condominiums/{id}/blocks` and `GET /v1/condominiums/{id}/units`); replaced seed-data placeholders with full CRUD (create, edit, delete via Sheet panels); KPI row updated to show live block and unit counts
- **Dashboard connected to real API** — all four KPI cards (tenants, condominiums, residents, employees) now display live totals from `pagination.total`; charts (condo types, financial status, employee roles, subscription status, tenant growth) are derived from paginated API responses; seed data imports removed entirely; spinner shown while data loads; "Plan Distribution" chart replaced with "Subscription Status" distribution using `tenant.subscriptionStatus`
- **`tenants.subscriptionStatus.*` i18n keys** added to both `en_US` and `pt_BR` locales for the new subscription status chart labels


- **AuthGuard onboarding routing** — reads `custom:onboardingStatus` JWT claim on sign-in; AuthGuard enforces the onboarding state machine (pending_verification → verify-email, pending_subscription → plan-selection, pending_approval → pending-approval, onboarding → setup wizard, complete → app); scaffold pages created for all onboarding and admin routes
- **`custom:onboardingStatus` claim in JWT** — added to `AuthTokenClaims` interface in auth adapter; `LoginPage` now extracts and stores it in the auth store
- **Router updated** — adds `/register`, `/onboarding/*`, and `/admin/*` routes; all onboarding and admin pages scaffolded as placeholders
- **Condominium sub-entities** — Block, Unit, Owner, OccupantTenant entities sharing the condominiums DynamoDB table; 16 Lambda handlers (list/create/update/delete per entity); DynamoDB key pattern: PK = `TENANT#{tenantId}#CONDO#{condoId}`, SK = `BLOCK#`, `UNIT#`, `UNIT#{id}#OWNER#`, `UNIT#{id}#OCCUPANT#`; all handlers added to CondominiumsStack; RESTful nested routes under `/v1/condominiums/{condoId}/`
- **Subscription Lambda domain** — `POST /v1/subscriptions` (public — combined tenant+subscription creation at end of onboarding funnel); `GET /v1/subscriptions/{id}` (authenticated); `GET /v1/admin/subscriptions` with optional `?status=` filter (platform_admin); `POST /v1/subscriptions/{id}/approve` enforces RN-ADM-002 (status must be trial|active); `POST /v1/subscriptions/{id}/reject` enforces RN-ADM-003 (rejectionReason ≥ 20 chars); approval updates Tenant.subscriptionStatus and User.onboardingStatus → onboarding; rejection resets User.onboardingStatus → pending_subscription
- **Plan Lambda domain** — `GET /v1/plans` and `GET /v1/plans/{id}` (public, no authorizer — used during onboarding plan selection); `GET /v1/admin/plans` (authenticated, returns all plans including discontinued); `POST /v1/plans`, `PATCH /v1/plans/{id}`, `POST /v1/plans/{id}/discontinue` (authenticated, platform_admin only); DynamoDB table with PK `PLAN#{id}` / SK `METADATA`; plan discontinue enforces RN-ADM-004 (no hard delete)
- **User Lambda domain** — `POST /v1/users` (public, no authorizer), `GET /v1/users/{id}` and `PATCH /v1/users/{sub}/onboarding-status` (authenticated); DynamoDB table with PK `USER#{cognitoSub}` / SK `PROFILE`; CloudWatch error and throttle alarms; Pre-Token Generation Lambda now injects `custom:onboardingStatus` alongside existing custom claims
- **`addPublicRoute()` on ApiGatewayStack** — registers HTTP routes with `HttpNoneAuthorizer` for endpoints that must be reachable before the user has a valid JWT (e.g. user creation right after Cognito sign-up)

### Removed
- **Federated login (Google, Facebook, Apple)** removed from scope — all onboarding flows now use email+password exclusively; `auth_provider` and `auth_provider_id` fields removed from the `User` entity; RN-ONB-002/003 (federated-specific rules) removed and remaining rules reindexed RN-ONB-002–008

### Added
- **`custom:onboardingStatus` JWT claim** — documented in software-vision §5.3 and architecture-guide §7; the Pre-Token Generation Lambda injects `onboarding_status` as a JWT claim so the frontend `AuthGuard` can enforce the subscription gate without an extra API call, following the same pattern as `custom:roles`
- **Platform Admin Area** (software-vision §2.8 and §3.8) — specifies the `/admin` route prefix, conditional sidebar navigation for `platform_admin` role, and four admin screens: Overview (KPI cards + recent requests), Subscription Requests (approval/rejection queue with detail panel), Tenant Management (cross-tenant list with lifecycle status transitions), and Plan Management (create/edit/discontinue). Added business rules RN-ADM-001 through RN-ADM-007 governing admin access control, approval/rejection requirements, plan lifecycle, terminal states, and the mandatory `status_change_log` for all tenant status changes.
- **Architecture guide pt_BR translation** — full Portuguese translation of `docs/architecture-guide.md` covering all 25 sections; both files are now maintained as a bilingual pair
- **Architecture Section 26 — AWS Cost Reference** — comprehensive pricing reference for all 14 services in the stack (Lambda, DynamoDB, API Gateway HTTP + WebSocket, Cognito, S3, CloudFront, SQS, EventBridge, SNS, CloudWatch, X-Ray, Secrets Manager, SSM Parameter Store, Athena) with free tier limits, exact pricing after free tier (us-east-1), and practical scale estimates; available in both EN and pt_BR
- **`docs/software-vision.md`** (and pt_BR) — new dedicated document for platform requirements, business rules (RN-XXX codes), and data domain entities, extracted from the monolithic knowledge base
- **User registration and onboarding flow** (software-vision §3) — complete account owner funnel: email/password and federated (Google/Facebook/Apple) paths, subscription gate, first-condominium wizard, and `onboarding_status` state machine with RN-ONB-001–008
- **Resident and authorized person onboarding flow** (software-vision §3.7) — invite-based journey distinct from the subscription funnel; introduces the `authorized_person` role (QR credential + biometric photo only, no operational module access), `is_primary` flag, and `ResidentInvite` entity with full token lifecycle
- **Application Shell & UI Design section** in the software vision — documents established layout structure (header + collapsible sidebar + content area), header composition, sidebar zones, notification panel, user menu sections, preferences page with all eight setting categories and defaults, and dashboard layout

### Changed
- **Architecture guide restructured** into a logical 7-part reader-oriented progression: Foundation → Structure → Backend Core → Data & Messaging → Client Channels → Frontend → Observability & Ops; all internal cross-references updated accordingly
- **Architecture guide made fully project-agnostic** — all ZenAndVillage-specific references replaced with `{project}` placeholders in the feature map, project structure, and versioning sections; the guide can now be reused across projects by changing only `docs/project-definition.md`
- **Knowledge base narrowed to domain-only content** — entity schemas, RN-XXX business rules, and platform requirements removed; `docs/knowledge-base.md` now covers only Brazilian condo law, actor/role definitions, governance processes, financial concepts, HR/labor rules, building operations, and LGPD obligations
- **Software vision restructured around 13 DDD bounded contexts** — each context owns its aggregate root, entities, and business rules; added Domain Map section with context diagram and directory table
- **Subscription activation changed to manual platform admin approval** — removed payment broker integration; added `pending_approval` and `rejected` statuses to `Subscription` and `Tenant`; updated onboarding funnel and lifecycle diagram; rejection path requires `rejection_reason` and resets `onboarding_status` to `pending_subscription`
- **Application Shell section promoted to §2** in the software vision (was §18), immediately after Product Vision, reflecting its platform-level scope; remaining sections renumbered §3–§18
- **App logo SVGs updated** — both light and dark variants refreshed in frontend assets and source files
- **Agent behavior: CHANGELOG.md** must now be updated in the same commit as each change throughout the feature branch lifecycle, not only at release time
- **Agent behavior: PR estimated human effort** now uses a single hour estimate derived from lines of code and technologies involved, replacing the three-tier seniority breakdown
- **Agent behavior: version footnotes forbidden** — trailing footnotes with version numbers, review dates, or "internal development use" phrases are prohibited in all `docs/*.md` files

### Removed
- **White-Label & Customization feature** from the software vision — removed `white_label` from Plan entity, `white_label_config` from Tenant entity, RN-WL-001/002/003 rules, and all related references
- **Project-specific MVP status markers** from the architecture guide — section-level MVP annotations removed to keep the guide implementation-neutral
- **`scripts/reorder-arch.mjs`** one-off helper script no longer needed after the architecture guide restructure

### Renamed
- pt_BR documentation files renamed from `*-pt_BR.md` to `*.pt_BR.md` (dot-separated locale suffix) for consistency

## [0.2.0] - 2026-05-22

### Added
- **Full serverless backend** — AWS CDK v2 infrastructure: Cognito User Pool (MFA optional, pre-token-generation trigger), HTTP API Gateway + WebSocket API, per-domain DynamoDB tables (PAY_PER_REQUEST, PITR enabled), SNS alarms for errors and throttles
- **Five Lambda domains** — Tenants, Property Managers, Condominiums, Residents, Employees; each with CRUD handlers wrapped in middy + Lambda Powertools (Logger, Metrics, Tracer) on ARM64/Node.js 22
- **Notifications domain** — REST list/mark-read/mark-all-read handlers + WebSocket connect/disconnect + SQS-driven fan-out notifier using ApiGatewayManagementApi
- **File uploads** — presigned POST endpoint (S3) with per-tenant key isolation and PENDING record tracking
- **Shared Lambda utilities** — `extractContext` (tenant/user from authorizer context, never from headers), `LambdaWithPowertools` construct, `SqsWithDlq` construct, response helpers
- **Lambda Authorizer** — validates `X-Tenant-Id` header against JWT `custom:tenantId` claim; 5-minute cache
- **DynamoDB seed script** — creates Cognito users + seeds all five domains across three tenants for local/staging testing
- **Frontend auth wiring** — AWS Amplify Auth v6 adapter (single import boundary), Zustand auth store (persisted), Axios HTTP client with Bearer token + X-Tenant-Id interceptors, 401 auto-refresh with single retry
- **TanStack Query integration** — all five feature pages (Tenants, Property Managers, Condominiums, Residents, Employees) replaced `useState` mock persistence with server-driven queries + mutations; skeleton loading and error states on every list view
- **Notifications wired to API** — NotificationPanel uses `useNotificationsQuery` (30s stale, 60s poll), `useMarkReadMutation`, `useMarkAllReadMutation`
- **Real-time WebSocket hook** — `useWebSocket` connects once in AppShell, invalidates TanStack Query cache by domain on each push event; exponential back-off reconnect
- **PWA** — Workbox runtime caching: CacheFirst (fonts), NetworkFirst 10s (API GET `/v1/`), StaleWhileRevalidate (S3), NetworkOnly (mutations); `useServiceWorkerUpdate` toasts on update-waiting
- **Login page** — react-hook-form + zod, Amplify signIn, JWT claims → auth store → redirect
- **AuthGuard** — protects all routes, redirects unauthenticated users to `/login`
- **UserMenu** — reads user/tenant from auth store, signs out via Amplify + clears session
- **i18n** — added `common.loadError`, `auth.*`, `residents.financialStatus.delinquent` keys in both `en_US` and `pt_BR` locales
- **`.env.example`** — documents all required `VITE_*` environment variables for frontend

## [0.1.0] - 2026-05-22

### Added
- Initial PWA frontend scaffold (React 19 + TypeScript + Vite 8 + Tailwind CSS v4 + shadcn/ui)
- App branding: logo, favicon, and header identity
- i18n setup with `en_US` (canonical) and `pt_BR` locales via i18next + react-i18next
- Project architecture guide covering frontend PWA + serverless AWS stack
- Domain knowledge base (en-US and pt-BR)
- Agent behavior rules: incremental commit policy, PR policy with AI Productivity Analysis, versioning strategy

[Unreleased]: https://github.com/ZenEngineeringLab/ZenAndVillage/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/ZenEngineeringLab/ZenAndVillage/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/ZenEngineeringLab/ZenAndVillage/releases/tag/v0.1.0
