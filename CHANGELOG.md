# Changelog

All notable changes to ZenAndVillage are documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning follows [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

## [1.0.0] - 2026-05-22

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

[Unreleased]: https://github.com/ZenEngineeringLab/ZenAndVillage/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/ZenEngineeringLab/ZenAndVillage/compare/v0.1.0...v1.0.0
[0.1.0]: https://github.com/ZenEngineeringLab/ZenAndVillage/releases/tag/v0.1.0
