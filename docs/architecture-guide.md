# Integrated Architecture Guide
## Frontend PWA + Serverless AWS

> **How to use this document**
> Replace `{project}` with your project's short identifier (e.g. `myapp`, `acme`, `foobar`).
> This document is the **single source of truth for engineering architecture**.
> UI decisions (components, tokens, styling, icons) are governed by Section 4 of this document.

---

## 1. Overview

This architecture combines a **PWA frontend** (React + TypeScript + Vite) with a
**serverless AWS backend** (Lambda + API Gateway + Cognito), organized by hexagonal
and DDD principles on both sides.

It is suited for **multi-tenant** SaaS products with multiple users per organization,
real-time requirements, file uploads, and offline support via PWA.

### System Topology

```
┌───────────────────────────────────────────────────────────────────┐
│  USER (browser / mobile PWA)                                      │
│                                                                   │
│  React SPA ──HTTP──► Amazon CloudFront ──► Amazon S3 (assets)     │
│     │                                                             │
│     │  REST (HTTPS)              WebSocket (WSS)                  │
│     ▼                                    ▼                        │
└───────────────────────────────────────────────────────────────────┘
           │                               │
           ▼                               ▼
┌───────────────────────────────────────────────────────────────────┐
│  AWS API GATEWAY                                                  │
│  ┌──────────────────────┐  ┌───────────────────────────────────┐  │
│  │  HTTP API (REST)     │  │  WebSocket API (Real-time)        │  │
│  │  /v1/{domain}/...    │  │  $connect / $disconnect / $default│  │
│  └──────────┬───────────┘  └──────────────┬────────────────────┘  │
│             │                             │                       │
│  ┌──────────▼───────────┐                 │                       │
│  │  Cognito Authorizer  │                 │                       │
│  │  + Lambda Authorizer │                 │                       │
│  │  (tenantId check)    │                 │                       │
│  └──────────┬───────────┘                 │                       │
└─────────────┼───────────────────────────┬─┘                       │
              │                           │                         │
              ▼                           ▼                         │
┌───────────────────────────────────────────────────────────────────┐
│  AWS LAMBDA (per domain)                │  NOTIFIER LAMBDA        │
│                                         │  (WebSocket push)       │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │                         │
│  │domain-a  │ │domain-b  │ │domain-c │  │                         │
│  └────┬─────┘ └────┬─────┘ └────┬────┘  │                         │
└───────┼─────────────┼────────────┼───────┼─────────────────────────┘
        │             │            │       │
        ▼             ▼            ▼       │
┌───────────────────────────────────────────────────────────────────┐
│  DATA STORES                    │  MESSAGING                      │
│  DynamoDB (per domain)          │  EventBridge → SQS → Lambda     │
│  DynamoDB Streams → Lambda      │  SNS (fan-out / push delivery)  │
│  S3 (uploads / exports)         │                                 │
│  Amazon Athena (analytics)      │                                 │
└───────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│  IDENTITY                       │  OBSERVABILITY                  │
│  Amazon Cognito User Pool       │  CloudWatch Logs + Metrics      │
│  Pre-Token Generation Trigger   │  AWS X-Ray (traces)             │
│  Identity Pool (direct S3)      │  CloudWatch Alarms + Dashboards │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend (AWS Serverless)

> **Runtime:** Node.js 22 (TypeScript) is the default for all Lambda functions in this stack.
> All code examples and CDK constructs use Node.js 22. Python 3.13 is available but introduces
> a second runtime surface — use it only when the domain team has a strong Python-first reason.
> Node.js 20 reaches EOL on 30 April 2026 — do not use for new projects.

| Role | Service |
| --- | --- |
| REST API | Amazon API Gateway HTTP API |
| Real-time API | Amazon API Gateway WebSocket API |
| Compute | AWS Lambda (Node.js 22 / TypeScript) |
| Identity | Amazon Cognito User Pool + Identity Pool |
| Primary data store | Amazon DynamoDB |
| Change streams | DynamoDB Streams → Lambda |
| Object storage | Amazon S3 |
| Analytics / reporting | Amazon Athena (queries S3 exports) |
| Async events | Amazon EventBridge + SQS + SNS |
| Observability | CloudWatch Logs + Metrics + X-Ray + Dashboards |
| Secrets | AWS Secrets Manager + Parameter Store (SSM) |
| Middleware | middy (Lambda middleware engine for Powertools) |
| IaC | AWS CDK (TypeScript) |
| CI/CD | AWS CodePipeline + CodeBuild |
| CDN + Hosting | Amazon CloudFront + S3 |

### Frontend (PWA)

> **Version baseline:** May 2026. Verify against npm before project kickoff — major bumps
> (React, Vite, React Router, Zustand) carry breaking changes and require their own migration step.

| Role | Technology | Authority |
| --- | --- | --- |
| Framework | React 19 + TypeScript 5 (strict) | This document |
| Bundler | Vite 8 | This document |
| UI layer (tokens, components, styling, icons) | shadcn/ui + Tailwind CSS v4 + Lucide React | This document (Section 4) |
| Routing | React Router 7 | This document |
| Server state | TanStack Query 5 | This document |
| Client state | Zustand 5 | This document |
| Forms | React Hook Form + Zod | This document |
| HTTP Client | Axios (custom interceptors) | This document |
| Auth | AWS Amplify Auth v6 (auth module only) | This document |
| Real-time | Native WebSocket (`useWebSocket` hook) | This document |
| PWA | vite-plugin-pwa + Workbox | This document |
| Testing | Vitest + React Testing Library + Playwright | This document |

> **Read the Authority column before adding anything to a component.**
> If the authority is "This document", the definition is in the referenced section below.
> All UI decisions (styling, components, icons) are governed by Section 4.

---

## 3. Compatibility Matrix

All versions in Section 2 were validated against each other as of **May 2026**.
Minimum patch versions marked below are required — do not use earlier patches.

### Frontend Compatibility

| Pair | Status | Minimum Version | Notes |
| --- | --- | --- | --- |
| React 19 + Vite 8 | ✅ | `vite@8.0.0` | `@vitejs/plugin-react` explicitly supports Vite 8; tested in Vite's own CI |
| React 19 + React Router 7 | ✅ | `react-router@7.0.0` | Built to bridge React 18 → 19 incrementally; non-breaking upgrade from v6 |
| React 19 + TanStack Query 5 | ✅ | `@tanstack/react-query@5.0.0` | Peer dep says `>=18` but React 19 is backward-compatible via `useSyncExternalStore` |
| React 19 + Zustand 5 | ✅ | **`zustand@5.0.13`** | Versions 5.0.1–5.0.2 had peer dep conflict via `use-sync-external-store`. Fixed in 5.0.13 — do not use earlier patches |
| React 19 + React Hook Form | ✅ | `react-hook-form@7.0.0` | Compatible for SPA use. Does not integrate with `useActionState` (React 19 Server Action feature — not used in this architecture) |
| React 19 + Amplify Auth v6 | ✅ | `aws-amplify@6.0.0` | Function-based API — no dependency on React's render cycle |
| Vite 8 + vite-plugin-pwa | ✅ | **`vite-plugin-pwa@1.3.0`** | v1.2.0 had peer dep capped at `^7.0.0`. v1.3.0 (May 2026) added `^8.0.0` — do not use earlier versions with Vite 8 |
| Vite 8 + TypeScript 5 | ✅ | `typescript@5.0.0` | Native support |
| Vite 8 + Node.js | ✅ | Node.js 20.19+ or **22.12+** | Vite 8 ESM-only distribution requires `require(esm)` support without a flag |

### React 19 Breaking Changes Relevant to This Architecture

These React 19 changes require attention when implementing features. They do not
affect the engineering patterns in this document, but do affect how UI components
are built.

| Change | Impact | Action |
| --- | --- | --- |
| `forwardRef` deprecated | Components wrapping `ref` must use the new `ref` prop instead | All UI components must use React 19 ref-as-prop pattern; no `forwardRef` in new components |
| `Context.Consumer` deprecated | Render-prop style context consumers removed | Use `useContext` hook only |
| `ReactDOM.render` removed | Legacy render API gone | Already not used — `createRoot` is the standard |
| `use()` hook (new) | Can read Context or Promises directly in render | Available to use in feature hooks if needed; does not replace TanStack Query for server state |
| `useActionState` (new) | Native form submission state management | Not used in this architecture — React Hook Form + Zod handles forms; `useActionState` is for server-action patterns |

### Backend Compatibility

| Pair | Status | Notes |
| --- | --- | --- |
| Node.js 22 + AWS CDK | ✅ | CDK TypeScript fully supports Node.js 22 |
| Node.js 22 + Lambda Powertools | ✅ | Powertools for AWS Lambda (TypeScript) supports Node.js 22 |
| Node.js 22 + middy | ✅ | middy v5+ supports Node.js 22 |
| DynamoDB + Lambda (no VPC) | ✅ | DynamoDB is a VPC-free managed service — no network config needed |
| S3 + Athena (analytics) | ✅ | Athena queries S3 directly — serverless, no infrastructure to provision |

### Installation Note

Due to peer dependency constraints in the ecosystem, install the frontend stack with:

```bash
npm install --legacy-peer-deps
```

This is required because TanStack Query's peer dep formally declares `react@">=18"` while
the project uses React 19. The library is fully functional — this is a declaration lag,
not a runtime incompatibility. Track [this issue](https://github.com/TanStack/query/issues)
for the official peer dep update.

---

## 4. UI Stack

### Stack

| Layer | Technology | Notes |
| --- | --- | --- |
| Component primitives | **shadcn/ui** (Radix UI) | Install via `npx shadcn@latest add <component>` |
| Styling | **Tailwind CSS v4** | Single styling mechanism — no CSS Modules or plain CSS |
| Icons | **Lucide React** | Single icon library — no mixing with other sets |
| Dark mode | Tailwind CSS `dark:` variant | Toggle sets `dark` class on `<html>`; no parallel theming |

### Rules

- **Use shadcn/ui components as the foundation for all UI primitives.** Run `npx shadcn@latest add <component>` before rebuilding anything that already exists in the catalog (Button, Input, Select, Dialog, Sheet, Table, Toast, Badge, Avatar, Skeleton, etc.).
- **All visual values come from Tailwind tokens.** Never use arbitrary values (`w-[137px]`, `text-[#ff0000]`). If a token is missing, add it to `tailwind.config.ts` and document the decision here.
- **Icons are always from Lucide React.** `import { IconName } from 'lucide-react'` — never import from heroicons, react-icons, or other libraries.
- **Dark mode is Tailwind-native.** The `dark` class on `<html>` is the single source of truth. Persist the user's preference in `localStorage` via a small hook; never implement a separate CSS variable strategy.
- **Component location:** shadcn output lives in `src/shared/components/ui/`; custom composites in `src/shared/components/`. Never scatter UI primitives across feature folders.
- **Extending shadcn components:** use `cva` (class-variance-authority) for new variants — never hardcode conditional class strings.

### What This Document Also Defines

This document defines everything that is **not UI appearance**:

- How components receive data (hooks, TanStack Query, props shape)
- How components communicate state changes (mutations, Zustand)
- Which file a component lives in (feature slice structure)
- How routing, auth guards, and error boundaries wrap pages
- How forms connect to API services (React Hook Form + Zod + mutation)
- Testing strategy (what to test, not how the component looks)

---

## 5. Feature ↔ Domain ↔ API Mapping

This table is the **single source of truth** for naming frontend features, Lambda
domains, and API routes. Fill it in at project kickoff and keep it updated with
every new feature.

**Both sides must reference this table. Never define a route name in the frontend
without registering it here first.**

| Frontend Feature | Lambda Domain | API Base Path | Primary Data Store |
| --- | --- | --- | --- |
| `auth` | `auth` | `/v1/auth` | DynamoDB |
| `dashboard` | `dashboard` | `/v1/dashboard` | DynamoDB |
| `{feature-a}` | `{domain-a}` | `/v1/{domain-a}` | DynamoDB |
| `{feature-b}` | `{domain-b}` | `/v1/{domain-b}` | DynamoDB |
| `{feature-c}` | `{domain-c}` | `/v1/{domain-c}` | DynamoDB + S3 |
| `notifications` | `notifications` | `/v1/notifications` | DynamoDB |
| `settings` | `settings` | `/v1/settings` | DynamoDB |

> **Feature examples by product category:**
> - B2B SaaS: `organizations`, `members`, `billing`, `reports`, `audit-log`
> - E-commerce: `products`, `orders`, `inventory`, `payments`, `shipments`
> - Field management: `assets`, `work-orders`, `inspections`, `schedules`

> **Note:** React Router v7 merged `react-router-dom` into `react-router`.
> Import everything from `"react-router"` — `react-router-dom` is no longer needed as a separate dependency.

**Rule:** Never use `/api/v1/`. The API Gateway HTTP API stage is `$default` — no `/api/` prefix.

---

## 6. API Contract (Single Source of Truth)

Every endpoint must follow this contract. Lambda and frontend implement exactly these
shapes. Never add fields outside this envelope without updating this document first.

### List — GET `/v1/{resource}`

```json
{
  "data": [
    { "id": "uuid", "...": "..." }
  ],
  "pagination": {
    "page": 1,
    "pageSize": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### Detail — GET `/v1/{resource}/{id}`

```json
{
  "data": { "id": "uuid", "...": "..." }
}
```

### Create / Update — POST / PATCH

```json
{
  "data": { "id": "uuid", "...": "..." }
}
```

### Delete — DELETE

```
HTTP 204 No Content  (no body)
```

### Error — 4xx / 5xx

```json
{
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "{Entity} with id '{id}' not found.",
    "requestId": "lambda-request-id-uuid",
    "timestamp": "2026-01-01T00:00:00Z"
  }
}
```

> `requestId` comes from `context.awsRequestId` in the Lambda — never generated on the frontend.
> The frontend reads `requestId` from the **body** (`error.response.data.error.requestId`),
> not from HTTP headers.

### Required Request Headers (Frontend → API)

| Header | Origin | Description |
| --- | --- | --- |
| `Authorization` | Axios interceptor | Bearer JWT (Cognito access token) |
| `X-Tenant-Id` | Axios interceptor | Active organization/tenant UUID |
| `X-Idempotency-Key` | Axios interceptor | Client-generated UUID for POST / PUT / PATCH |
| `Content-Type` | Axios default | `application/json` |

### Required Response Headers (API → Frontend)

| Header | Value | How to Set |
| --- | --- | --- |
| `X-Request-Id` | `context.awsRequestId` | Lambda response headers |
| `X-Trace-Id` | X-Ray trace ID | Lambda response headers |

---

## 7. Authentication and Authorization (End-to-End)

### Full Flow

```
1. LOGIN
   Browser → Amplify Auth.signIn()
   Cognito authenticates → fires Pre-Token Generation Lambda
   Lambda injects custom claims into the token (tenantId, roles, userId)
   Cognito returns: accessToken, idToken, refreshToken
   Frontend extracts claims → stores in Zustand auth store

2. AUTHENTICATED REQUEST
   Axios request interceptor:
     1. Amplify.getAccessToken() → cached token or automatic refresh
     2. Injects Authorization: Bearer {token}
     3. Injects X-Tenant-Id: {tenantId from Zustand}
     4. Injects X-Idempotency-Key: {UUID} for POST/PUT/PATCH only
   API Gateway validates JWT against Cognito JWKS (no Lambda involved)
   Lambda Authorizer validates X-Tenant-Id == custom:tenantId claim
   Lambda handler processes with tenantId validated via context

3. EXPIRED TOKEN (401)
   Axios response interceptor:
     → Calls Amplify.refreshSession()
     → On success: retries the original request (_retried flag prevents loop)
     → On failure (refresh token expired):
         clearSession() + queryClient.clear() + redirect /login

4. LOGOUT
   Amplify.signOut() + clearSession() + queryClient.clear()
   Cognito invalidates the refresh token
```

### Pre-Token Generation Lambda — Required

Without this trigger, `tenantId` and `roles` do not exist in the JWT and the entire
multi-tenancy system fails silently.

```typescript
// lambda/auth/pre-token-generation.handler.ts
export const handler = async (event: PreTokenGenerationTriggerEvent) => {
  const userId = event.request.userAttributes.sub;
  const user   = await userRepository.findById(userId);

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        'custom:tenantId': user.organizationId,
        'custom:roles':    JSON.stringify(user.roles),
        'custom:userId':   user.id,
      },
    },
  };

  return event;
};
```

```typescript
// infra/stacks/cognito.stack.ts
userPool.addTrigger(UserPoolOperation.PRE_TOKEN_GENERATION, preTokenGenerationFn);
```

### Lambda Authorizer — Tenant Validation

```typescript
// lambda/shared/tenant-authorizer.handler.ts
export const handler = async (event: APIGatewayRequestAuthorizerEvent) => {
  const headerTenantId = event.headers?.['x-tenant-id'];
  const claims         = extractClaims(event.headers?.authorization!);
  const tokenTenantId  = claims['custom:tenantId'];

  if (!headerTenantId)              throw new Error('X-Tenant-Id header missing');
  if (headerTenantId !== tokenTenantId) throw new Error('Tenant mismatch');

  return allowPolicy(event.methodArn, {
    userId:   claims['custom:userId'],
    tenantId: tokenTenantId,
    roles:    JSON.parse(claims['custom:roles'] ?? '[]'),
  });
};
```

### Authorization Model by Layer

| Layer | Mechanism |
| --- | --- |
| Authentication (API Gateway) | Cognito User Pool Authorizer — validates JWT signature and expiry |
| Tenant isolation (API Gateway) | Lambda Authorizer — validates `X-Tenant-Id` against `custom:tenantId` claim |
| RBAC (Lambda handler) | Roles read from `event.requestContext.authorizer.lambda.roles` |
| Data access (Lambda → DynamoDB) | Partition key always includes `TENANT#{tenantId}` |
| Service-to-service | IAM execution roles with `lambda:InvokeFunction` scoped to explicit ARNs |

---

## 8. Multi-Tenancy (End-to-End)

### DynamoDB Partition Key Pattern

```
PK = "TENANT#{tenantId}#{ENTITY}#{entityId}"
SK = "PROFILE"                          ← static record
SK = "2026-01-01T00:00:00Z"             ← temporal sort key for lists
SK = "CONN#{connectionId}"              ← active WebSocket connections
```

### Extracting `tenantId` in the Lambda Handler

```typescript
// lambda/shared/extract-context.ts
export const extractContext = (event: APIGatewayProxyEventV2) => ({
  tenantId: event.requestContext.authorizer?.lambda?.tenantId as string,
  userId:   event.requestContext.authorizer?.lambda?.userId   as string,
  roles:    event.requestContext.authorizer?.lambda?.roles    as string[],
});

// ❌ FORBIDDEN — easily forged by the client
// const tenantId = event.headers['x-tenant-id'];

// ✅ CORRECT — already validated by the Lambda Authorizer
// const { tenantId } = extractContext(event);
```

### Axios Interceptor (Frontend)

```typescript
// shared/api/http-client.ts
const httpClient = axios.create({ baseURL: env.VITE_API_BASE_URL });

httpClient.interceptors.request.use(async (config) => {
  const token    = await authAdapter.getAccessToken();
  const tenantId = useAuthStore.getState().tenantId;

  config.headers.Authorization  = `Bearer ${token}`;
  config.headers['X-Tenant-Id'] = tenantId ?? '';

  if (['post', 'put', 'patch'].includes(config.method ?? '')) {
    config.headers['X-Idempotency-Key'] =
      config.headers['X-Idempotency-Key'] ?? crypto.randomUUID();
  }

  return config;
});

httpClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    if (error.response?.status === 401 && !error.config?._retried) {
      try {
        (error.config as any)._retried = true;
        await authAdapter.refreshSession();
        return httpClient.request(error.config!);
      } catch {
        useAuthStore.getState().clearSession();
        queryClient.clear();
        window.location.replace('/login');
      }
    }
    return Promise.reject(mapApiError(error));
  }
);

// Reads requestId from the BODY — not from the HTTP response header
const mapApiError = (error: AxiosError): ApiError => ({
  code:      error.response?.data?.error?.code      ?? 'UNKNOWN_ERROR',
  message:   error.response?.data?.error?.message   ?? 'An unexpected error occurred.',
  requestId: error.response?.data?.error?.requestId ?? '',
  timestamp: error.response?.data?.error?.timestamp ?? new Date().toISOString(),
});
```

---

## 9. CORS (CDK — Required)

```typescript
// infra/stacks/api-gateway.stack.ts
const api = new HttpApi(this, `{project}-api-${props.env}`, {
  corsPreflight: {
    allowOrigins: props.env === 'prod'
      ? ['https://app.{project}.com']
      : ['https://app.{project}.com', 'http://localhost:3000', 'http://localhost:4173'],
    allowMethods: [
      CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT,
      CorsHttpMethod.PATCH, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS,
    ],
    allowHeaders: ['Content-Type', 'Authorization', 'X-Tenant-Id', 'X-Idempotency-Key'],
    exposeHeaders: ['X-Request-Id', 'X-Trace-Id'],
    allowCredentials: true,
    maxAge: Duration.days(1),
  },
});
```

---

## 10. Real-Time Channel (WebSocket API Gateway)

### Architecture

```
EventBridge (domain event published by any Lambda)
    │
    ▼
SQS ({project}-notifier-queue)
    │
    ▼
Lambda (notifier)
    ├── Fetches active tenant connections from DynamoDB
    └── Calls API Gateway WebSocket Management API (postToConnection)
              │
              ▼
        Browser (Service Worker / React hook)
              │
              ▼
        queryClient.invalidateQueries({ queryKey: ['{domain}'] })
```

### WebSocket Lambda Handlers

```typescript
// lambda/notifications/ws-connect.handler.ts
export const handler = async (event: APIGatewayProxyWebsocketHandlerV2) => {
  const tenantId     = extractTenantFromToken(event.queryStringParameters?.token);
  const userId       = extractUserIdFromToken(event.queryStringParameters?.token);
  const connectionId = event.requestContext.connectionId;

  await connectionsRepository.save({
    PK:  `TENANT#${tenantId}#USER#${userId}`,
    SK:  `CONN#${connectionId}`,
    connectionId, tenantId, userId,
    ttl: Math.floor(Date.now() / 1000) + 7200,
  });

  return { statusCode: 200 };
};

// lambda/notifications/notifier.handler.ts  (trigger: SQS)
export const handler = async (event: SQSEvent) => {
  for (const record of event.Records) {
    const notification = JSON.parse(record.body);
    const connections  = await connectionsRepository.findByTenant(notification.tenantId);

    await Promise.allSettled(
      connections.map(conn =>
        apiGwMgmt.postToConnection({
          ConnectionId: conn.connectionId,
          Data:         JSON.stringify(notification),
        }).promise()
      )
    );
  }
};
```

### `useWebSocket` Hook (Frontend)

```typescript
// shared/hooks/useWebSocket.ts
export const useWebSocket = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;  // prevents reconnect after unmount

    const connect = async () => {
      // Always re-fetch token on every (re)connect — handles token expiry
      const token = await authAdapter.getAccessToken();
      if (destroyed) return;

      ws = new WebSocket(`${env.VITE_WS_URL}?token=${token}`);

      ws.onmessage = ({ data }) => {
        const event: RealtimeEvent = JSON.parse(data);
        queryClient.invalidateQueries({ queryKey: [event.domain] });
        queryClient.setQueryData(
          notificationKeys.list(),
          (prev: Notification[]) => [mapToNotification(event), ...(prev ?? [])]
        );
      };

      ws.onclose = () => {
        if (!destroyed) {
          // Exponential backoff capped at 30s
          reconnectTimer = setTimeout(connect, Math.min(3000 * 2, 30_000));
        }
      };
    };

    connect();

    // Cleanup: close socket and cancel pending reconnect on logout / unmount
    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [user?.id]);
};
```

> **Rule:** `useWebSocket` is called **once only** in `AppShell`. Never in individual components.

---

## 11. File Upload (Pre-Signed S3)

Never send files through API Gateway.

### End-to-End Flow

```
1. Frontend → POST /v1/uploads/presign
   Body: { filename, contentType, domain, metadata? }

2. Lambda → S3.createPresignedPost()
   Returns: { uploadUrl, fields, fileId, expiresAt }

3. Frontend → PUT {uploadUrl}  (directly to S3, bypassing API Gateway)

4. S3 Event → EventBridge → SQS → Lambda (post-upload-processor)

5. Frontend receives update via WebSocket → invalidates domain cache
```

### Presign Lambda

```typescript
// lambda/uploads/presign.handler.ts
export const handler = async (event: APIGatewayProxyEventV2) => {
  const { filename, contentType, domain, metadata } = JSON.parse(event.body!);
  const { tenantId, userId } = extractContext(event);
  const fileId = randomUUID();
  const key    = `${tenantId}/${domain}/${fileId}/${filename}`;

  const { url, fields } = await s3.createPresignedPost({
    Bucket:     process.env.UPLOADS_BUCKET!,
    Key:        key,
    Conditions: [
      ['content-length-range', 0, 52_428_800],
      ['eq', '$Content-Type', contentType],
    ],
    Expires: 300,
  });

  await fileRepository.createPending({
    PK: `TENANT#${tenantId}#FILE#${fileId}`, SK: 'METADATA',
    fileId, tenantId, userId, domain, key, filename, metadata, status: 'PENDING',
  });

  return ok({ uploadUrl: url, fields, fileId, expiresAt: Date.now() + 300_000 });
};
```

### `useFileUpload` Hook (Frontend)

```typescript
// shared/hooks/useFileUpload.ts
export const useFileUpload = () => {
  const [progress, setProgress] = useState(0);
  const presignMutation = useMutation({
    mutationFn: (input: PresignInput) => uploadsService.presign(input),
  });

  const upload = async (file: File, domain: string, metadata?: Record<string, unknown>) => {
    const { uploadUrl, fields, fileId } = await presignMutation.mutateAsync({
      filename: file.name, contentType: file.type, domain, metadata,
    });

    const formData = new FormData();
    Object.entries(fields).forEach(([k, v]) => formData.append(k, v as string));
    formData.append('file', file);

    await axios.post(uploadUrl, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => setProgress(Math.round((e.progress ?? 0) * 100)),
    });

    return fileId;
  };

  return { upload, progress, isUploading: presignMutation.isPending };
};
```

---

## 12. Push Notifications (Web Push)

### End-to-End Flow

```
1. REGISTRATION — Frontend → POST /v1/notifications/push-subscription
   Lambda saves { userId, tenantId, subscription } in DynamoDB (TTL 30d)

2. DELIVERY — EventBridge → SQS → Lambda (push-sender) → Web Push API

3. UNREGISTRATION — Frontend → DELETE /v1/notifications/push-subscription
```

### Lambda Endpoints

```typescript
// POST /v1/notifications/push-subscription
export const registerHandler = async (event: APIGatewayProxyEventV2) => {
  const { subscription } = JSON.parse(event.body!);
  const { tenantId, userId } = extractContext(event);

  await subscriptionsRepository.save({
    PK:  `TENANT#${tenantId}#USER#${userId}`,
    SK:  `PUSH#${subscription.endpoint.slice(-16)}`,
    subscription,
    ttl: Math.floor(Date.now() / 1000) + 30 * 86400,
  });
  return created({});
};

// DELETE /v1/notifications/push-subscription
export const unregisterHandler = async (event: APIGatewayProxyEventV2) => {
  const { tenantId, userId } = extractContext(event);
  await subscriptionsRepository.deleteAll({ tenantId, userId });
  return noContent();
};
```

### Registration Hook (Frontend)

```typescript
// shared/hooks/usePushSubscription.ts
export const usePushSubscription = () => {
  const { user } = useAuthStore();

  useEffect(() => {
    if (!user || !('PushManager' in window)) return;
    const register = async () => {
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: env.VITE_VAPID_PUBLIC_KEY,
      });
      await notificationsService.registerPush(sub.toJSON());
    };
    register().catch(console.error);
  }, [user?.id]);
};
```

---

## 13. Data Strategy

DynamoDB is the **only primary data store** in this architecture. Every domain owns its
own table. No VPC, no connection pools, no migration scripts, no provisioned servers.

### Partition Key Pattern — Universal Rule

```
PK = "TENANT#{tenantId}#{ENTITY}#{entityId}"
SK = "PROFILE"                        ← static/single record
SK = "2026-01-01T00:00:00Z"           ← temporal sort key for lists
SK = "CONN#{connectionId}"            ← active WebSocket connections

Examples by product category:
  B2B SaaS:    TENANT#{t}#MEMBER#{id}    /  PROFILE
  E-commerce:  TENANT#{t}#ORDER#{id}     /  2026-01-01T00:00:00Z
  Field ops:   TENANT#{t}#ASSET#{id}     /  STATUS
  Real-time:   TENANT#{t}#USER#{id}      /  CONN#{connectionId}
  Push subs:   TENANT#{t}#USER#{id}      /  PUSH#{endpointSuffix}
  Idempotency: IDEM#{idempotencyKey}     /  —  (TTL: 24h)
```

### ACID Cross-Entity Operations — `TransactWriteItems`

When an operation must succeed or fail atomically across multiple items or tables,
use DynamoDB Transactions. Up to 100 items across multiple tables in a single atomic
call — no VPC, no connection pool.

```typescript
// lambda/{domain}/application/transfer-balance.use-case.ts
await dynamodb.transactWrite({
  TransactItems: [
    {
      Update: {
        TableName: process.env.TABLE_NAME!,
        Key: { PK: `TENANT#${tenantId}#ACCOUNT#${fromId}`, SK: 'BALANCE' },
        UpdateExpression:    'SET balance = balance - :amount',
        ConditionExpression: 'balance >= :amount',          // ← prevents overdraft
        ExpressionAttributeValues: { ':amount': { N: String(amount) } },
      },
    },
    {
      Update: {
        TableName: process.env.TABLE_NAME!,
        Key: { PK: `TENANT#${tenantId}#ACCOUNT#${toId}`, SK: 'BALANCE' },
        UpdateExpression: 'SET balance = balance + :amount',
        ExpressionAttributeValues: { ':amount': { N: String(amount) } },
      },
    },
    {
      Put: {
        TableName: process.env.TABLE_NAME!,
        Item: {
          PK: `TENANT#${tenantId}#LEDGER#${uuid()}`,
          SK: new Date().toISOString(),
          fromId, toId, amount, tenantId, type: 'TRANSFER',
        },
      },
    },
  ],
}).promise();
```

**Limits:** 100 items per transaction, 4 MB total payload. Use for financial operations,
inventory reservations, and any business invariant that spans multiple entities.

### Change Streams — DynamoDB Streams → Lambda

Enable Streams on tables where downstream consumers need to react to state changes
(audit log, search index sync, read-model projection, cache invalidation).

```typescript
// infra/stacks/{domain}.stack.ts
const table = new Table(this, `{project}-{domain}-table`, {
  stream: StreamViewType.NEW_AND_OLD_IMAGES,   // ← enables DynamoDB Streams
  // ...
});

const streamConsumer = new Function(this, `{domain}-stream-consumer`, { ... });

streamConsumer.addEventSourceMapping('StreamSource', {
  eventSourceArn:         table.tableStreamArn!,
  startingPosition:       StartingPosition.TRIM_HORIZON,
  batchSize:              100,
  bisectBatchOnError:     true,
  retryAttempts:          3,
  destinations: { onFailure: new SqsDlq(dlq) },
});
```

**Use Streams for:** audit trail writes, publishing events to EventBridge after a
confirmed write (transactional outbox pattern), syncing denormalized read models,
and triggering downstream Lambdas on item state change.

### Immutable Audit Log Pattern

Audit records are append-only items written by the DynamoDB Streams consumer.
They are never updated or deleted — only written with TTL set far in the future
(or no TTL at all for compliance data).

```
PK = "TENANT#{tenantId}#AUDIT#{entityId}"
SK = "{ISO-8601 timestamp}#{eventId}"      ← ensures uniqueness + time-sorted
```

### Analytics and Reporting — Amazon Athena

When a domain needs aggregations, GROUP BY, or ad-hoc queries that DynamoDB
cannot serve efficiently, export data to S3 and query with Athena.
No servers, no VPC, pay per query scanned.

```
Flow:
  DynamoDB Streams → Lambda (exporter) → S3 (Parquet or JSON, partitioned by date)
  → Athena (SQL queries) → QuickSight (dashboards) or API response
```

```typescript
// lambda/{domain}/infrastructure/athena-query.adapter.ts
const result = await athena.startQueryExecution({
  QueryString: `
    SELECT tenantId, COUNT(*) as total, SUM(amount) as revenue
    FROM "{project}_{domain}"
    WHERE tenantId = '${tenantId}'
      AND year = '${year}' AND month = '${month}'
    GROUP BY tenantId
  `,
  QueryExecutionContext: { Database: `{project}_analytics` },
  ResultConfiguration:  { OutputLocation: `s3://{project}-athena-results/` },
}).promise();
```

**Use Athena for:** monthly revenue aggregations, usage reports, compliance exports,
BI dashboards, and any query that requires scanning across many items by non-key
attributes. Never run these queries against the DynamoDB table directly.

### Lambda Timeout Reference

Always set timeout explicitly — never rely on the AWS default of 3s.

| Lambda Type | Recommended Timeout | Rationale |
| --- | --- | --- |
| CRUD (DynamoDB) | 10s | Simple read/write; 10s leaves room for retries |
| List with filters | 15s | Pagination + filter logic may scan more items |
| File presign | 10s | S3 API call + DynamoDB write |
| WebSocket notifier | 30s | May fan-out to many connections |
| EventBridge consumer | 60s | Downstream chain may include multiple writes |
| Athena query launcher | 15s | Only starts the query; polling is async |
| Audit writer (Streams) | 30s | Batch of up to 100 stream records |
| Push notification sender | 60s | May deliver to many subscriptions per user |

```typescript
// infra/constructs/lambda-with-powertools.ts
new Function(this, id, {
  runtime:      Runtime.NODEJS_22_X,
  timeout:      Duration.seconds(props.timeoutSeconds ?? 10),   // never default
  memorySize:   props.memoryMb ?? 512,
  tracing:      Tracing.ACTIVE,
  environment:  { POWERTOOLS_SERVICE_NAME: props.serviceName },
});
```

---

## 14. Asynchronous Messaging

### EventBridge — Domain Events

```
Event bus:  {project}-events  (custom bus)
Source:     {project}.{domain}
DetailType: {EntityType}.{EventType}

Required schema:
{
  "eventId":    "uuid-v4",
  "source":     "{project}.{domain}",
  "detailType": "{Entity}.{Action}",
  "entityId":   "uuid",
  "tenantId":   "uuid",
  "userId":     "uuid",
  "timestamp":  "ISO-8601",
  "metadata":   {}
}
```

Every published event must have a schema registered in the
**EventBridge Schema Registry** before deployment.

### Standard SQS Queues per Project

| Queue | Consumer Lambda | Purpose | DLQ After |
| --- | --- | --- | --- |
| `{project}-notifier-queue` | `notifier` | WebSocket push to browser | 3 attempts |
| `{project}-push-queue` | `push-sender` | Web Push notifications | 3 attempts |
| `{project}-email-queue` | `email-sender` | Transactional emails (SES) | 3 attempts |
| `{project}-audit-queue` | `audit-writer` | Immutable audit log | 5 attempts |
| `{project}-{domain}-queue` | `{domain}-consumer` | Domain async processing | 3 attempts |

---

## 15. Server State — TanStack Query

All server state is managed by TanStack Query. `useEffect + fetch` is forbidden for
remote data — no exceptions.

### Query Key Factory — Required Pattern

```typescript
// features/{feature}/hooks/use{Feature}Query.ts
export const {feature}Keys = {
  all:     ['{feature}'] as const,
  lists:   () => [...{feature}Keys.all, 'list'] as const,
  list:    (filters: {Feature}Filters) => [...{feature}Keys.lists(), filters] as const,
  details: () => [...{feature}Keys.all, 'detail'] as const,
  detail:  (id: string) => [...{feature}Keys.details(), id] as const,
};
```

### Query (read)

```typescript
export const use{Feature}Query = (filters: {Feature}Filters) =>
  useQuery({
    queryKey: {feature}Keys.list(filters),
    queryFn:  () => {feature}Service.list(filters),
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });
```

### Mutation (write)

```typescript
export const useCreate{Feature}Mutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: {feature}Service.create,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: {feature}Keys.lists() }),
    onError:   (error: ApiError) => toast.error(error.message),
  });
};
```

### Global Query Client Configuration

```typescript
// app/query-client.ts
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      retryDelay: attempt => Math.min(1000 * 2 ** attempt, 30_000),
      staleTime: 2 * 60 * 1000,
      refetchOnWindowFocus: true,
      refetchOnReconnect:   true,
    },
    mutations: { retry: 0 },
  },
});
```

---

## 16. Client State — Zustand

| ✅ Use Zustand for | ❌ Never use Zustand for |
| --- | --- |
| Auth session (userId, roles, tenantId) | Server data (lists, detail records) |
| Global UI state (sidebar open, active theme) | Cached API responses |
| Unread notification count | Paginated data |
| Filters that survive navigation | Form state (use React Hook Form) |

```typescript
// features/auth/store/auth.store.ts
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null, roles: [], tenantId: null, isAuthenticated: false,
      setUser:      (user) => set({ user, roles: user.roles, tenantId: user.tenantId, isAuthenticated: true }),
      clearSession: ()     => set({ user: null, roles: [], tenantId: null, isAuthenticated: false }),
    }),
    { name: '{project}-auth', partialize: (s) => ({ user: s.user, tenantId: s.tenantId }) }
  )
);
```

---

## 17. PWA — Cache Strategy and Offline Behavior

### Cache Strategies (Workbox)

| Resource | Strategy | Rationale |
| --- | --- | --- |
| App shell (JS/CSS/HTML) | Cache First | Immutable until a new version is installed |
| GET list/detail endpoints | Network First (10s timeout) | Prefer fresh; fall back to cache offline |
| GET sensitive data (financial, audit) | Network Only | Never serve stale sensitive data |
| Static assets (fonts, images) | Cache First | Hashed filename = immutable |
| S3 objects (user uploads) | Stale While Revalidate | Fast display, refresh in background |
| POST / PATCH / DELETE | Network Only | Mutations are never cached |

### Offline Mutations with Idempotency

The idempotency key is generated in the **service** (not the hook) so the same key
travels with every Background Sync retry:

```typescript
export const {feature}Service = {
  create: (input: Create{Feature}Input, idempotencyKey = crypto.randomUUID()) =>
    httpClient.post('/v1/{domain}', input, {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    }).then(r => r.data),
};
```

### Service Worker Update

```typescript
// shared/hooks/useServiceWorkerUpdate.ts
export const useServiceWorkerUpdate = () => {
  useRegisterSW({
    onNeedRefresh() {
      // Style the UpdateBanner using shadcn/ui + Tailwind CSS
      toast.info(<UpdateBanner onConfirm={() => updateServiceWorker(true)} />, {
        duration: Infinity,
      });
    },
  });
};
```

---

## 18. Observability

### Backend — Lambda Powertools (Required on Every Lambda)

```typescript
const logger  = new Logger({ serviceName: '{domain}' });
const metrics = new Metrics({ namespace: '{Project}/{Domain}' });
const tracer  = new Tracer({ serviceName: '{domain}' });

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
```

Every log entry must include: `level`, `message`, `requestId`, `traceId`, `service`,
`tenantId`, `timestamp`. Never log: JWT tokens, passwords, card data, sensitive PII.

### Alarms per Lambda (Required)

| Metric | Threshold | Action |
| --- | --- | --- |
| `Errors` | > 1% over 5 min | SNS → on-call |
| `Throttles` | > 0 | SNS → on-call |
| `Duration` | > 80% of configured timeout | SNS → warning |
| DLQ `NumberOfMessagesVisible` | > 0 | SNS → on-call |

### Frontend — Error Boundary with Correlation

```typescript
// app/ErrorBoundary.tsx
componentDidCatch(error: Error, info: ErrorInfo) {
  ErrorTracker.captureException(error, {
    extra: {
      componentStack: info.componentStack,
      requestId:      getLastApiRequestId(),
      tenantId:       useAuthStore.getState().tenantId,
    },
  });
}
```

---

## 19. Infrastructure as Code — CDK Outputs → Frontend

No URL is hardcoded anywhere in the repository.

### CDK — Export to Parameter Store

```typescript
// infra/stacks/api-gateway.stack.ts
const params = [
  { name: 'api-url',           value: api.url },
  { name: 'ws-url',            value: wsApi.apiEndpoint },
  { name: 'cognito-pool-id',   value: userPool.userPoolId },
  { name: 'cognito-client-id', value: userPoolClient.userPoolClientId },
];

for (const { name, value } of params) {
  new StringParameter(this, `Param-${name}`, {
    parameterName: `/{project}/${props.env}/${name}`,
    stringValue:   value,
  });
}
```

### CodeBuild — Consume in the Frontend Build

```yaml
# buildspec-frontend.yml
phases:
  pre_build:
    commands:
      - ENV=${ENVIRONMENT:-staging}
      - SSM="aws ssm get-parameter --query Parameter.Value --output text"
      - API_URL=$($SSM   --name /{project}/$ENV/api-url)
      - WS_URL=$($SSM    --name /{project}/$ENV/ws-url)
      - POOL_ID=$($SSM   --name /{project}/$ENV/cognito-pool-id)
      - CLIENT_ID=$($SSM --name /{project}/$ENV/cognito-client-id)
  build:
    commands:
      - >
        VITE_API_BASE_URL=$API_URL VITE_WS_URL=$WS_URL
        VITE_COGNITO_USER_POOL_ID=$POOL_ID VITE_COGNITO_CLIENT_ID=$CLIENT_ID
        npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://{project}-frontend-$ENV/ --delete
      - aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

---

## 20. Unified CI/CD Pipeline

The frontend never goes to production before the corresponding backend is healthy.

```
SOURCE
  Push to `develop` or `main`
        │
        ▼
PARALLEL BUILD
  ├── Backend: lint + tests + CDK synth
  └── Frontend: lint + tests + Vite build
        │
        ▼
STAGING BACKEND
  CDK deploy → smoke tests
        │  (proceeds only if ✅)
        ▼
STAGING FRONTEND
  CodeBuild reads staging SSM → build → S3 + CloudFront invalidation
        │
        ▼
E2E PLAYWRIGHT
  Frontend + Backend together on staging
  Covers: login, CRUD, upload, real-time, push, logout
        │  (proceeds only if ✅)
        ▼
MANUAL APPROVAL
        │
        ▼
PROD BACKEND
  CDK deploy → health check 5 min
        │  (proceeds only if ✅)
        ▼
PROD FRONTEND
  CodeBuild reads prod SSM → build → S3 + CloudFront invalidation
```

---

## 21. Project Structure

### Backend

```
{project}-backend/
├── infra/
│   ├── bin/app.ts
│   ├── stacks/
│   │   ├── pipeline.stack.ts
│   │   ├── cognito.stack.ts
│   │   ├── api-gateway.stack.ts
│   │   └── {domain}.stack.ts
│   └── constructs/
│       ├── lambda-with-powertools.ts
│       ├── sqs-with-dlq.ts
│       └── aurora-with-proxy.ts
│
└── lambda/
    ├── shared/
    │   ├── tenant-authorizer.handler.ts
    │   ├── extract-context.ts
    │   └── response-helpers.ts           # ok(), created(), noContent(), error()
    ├── auth/
    │   └── pre-token-generation.handler.ts
    ├── {domain}/
    │   ├── list.handler.ts
    │   ├── get-by-id.handler.ts
    │   ├── create.handler.ts
    │   ├── update.handler.ts
    │   ├── delete.handler.ts
    │   ├── domain/                       # Entities, Value Objects, Domain Services
    │   ├── application/                  # Use Cases, Ports
    │   └── infrastructure/               # DynamoDB / S3 adapters
    ├── uploads/
    │   ├── presign.handler.ts
    │   └── post-upload-processor.handler.ts
    └── notifications/
        ├── ws-connect.handler.ts
        ├── ws-disconnect.handler.ts
        ├── notifier.handler.ts
        ├── register-push.handler.ts
        ├── unregister-push.handler.ts
        └── push-sender.handler.ts
```

### Frontend

```
{project}-web/
├── public/
│   ├── icons/                            # PWA icons (192×192, 512×512, maskable)
│   ├── manifest.webmanifest              # theme_color from tailwind.config.ts token
│   └── robots.txt
│
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── router.tsx                    # Lazy-loaded per feature
│   │   ├── providers.tsx
│   │   └── query-client.ts
│   │
│   ├── features/
│   │   ├── auth/
│   │   ├── dashboard/
│   │   ├── {feature}/
│   │   │   ├── components/               # Feature components — compose from shadcn/ui
│   │   │   ├── hooks/
│   │   │   │   ├── use{Feature}Query.ts
│   │   │   │   ├── use{Feature}Mutation.ts
│   │   │   │   └── use{Feature}Form.ts
│   │   │   ├── services/
│   │   │   │   └── {feature}.service.ts
│   │   │   ├── schemas/
│   │   │   ├── types/
│   │   │   ├── pages/
│   │   │   └── index.ts                  # Explicit public exports only
│   │   ├── notifications/
│   │   └── settings/
│   │
│   └── shared/
│       ├── api/
│       │   ├── http-client.ts
│       │   └── error-mapper.ts
│       ├── auth/
│       │   └── auth.adapter.ts           # Amplify Auth wrapper
│       ├── hooks/
│       │   ├── useWebSocket.ts
│       │   ├── useFileUpload.ts
│       │   ├── usePushSubscription.ts
│       │   ├── useServiceWorkerUpdate.ts
│       │   ├── useAuth.ts
│       │   ├── useRequireRole.ts
│       │   ├── useDebounce.ts
│       │   ├── useMediaQuery.ts          # Wraps Tailwind breakpoint tokens
│       │   ├── useBreakpoint.ts          # Wraps Tailwind breakpoint tokens
│       │   ├── useOnlineStatus.ts
│       │   └── useLocalStorage.ts
│       ├── components/                   # shadcn/ui output + custom composites
│       ├── constants/
│       └── types/
│           └── api.types.ts              # PaginatedResponse<T>, ApiError
│
├── tailwind.config.ts                    # imports powerPreset — no custom tokens here
├── tests/
│   ├── unit/
│   ├── integration/
│   └── e2e/
├── index.html
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

### Environment Variables (Frontend)

```bash
# .env.example — values injected by CodeBuild from SSM (never hardcoded)
VITE_API_BASE_URL=
VITE_WS_URL=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_REGION=          # fixed per project  (e.g. us-east-1)
VITE_VAPID_PUBLIC_KEY=        # VAPID public key for Web Push
VITE_APP_VERSION=             # injected by CI (git tag or commit SHA)
VITE_SENTRY_DSN=              # optional — error tracking
```

---

## 22. New Feature Checklist (Frontend + Backend)

### Backend
- [ ] Add row to mapping table (Section 5) with domain, path, and data store
- [ ] Create CDK Stack with least-privilege IAM per Lambda
- [ ] Implement hexagonal architecture (domain → application → infrastructure)
- [ ] Define HTTP API routes with Cognito Authorizer + tenant Lambda Authorizer
- [ ] Extract `tenantId` from authorizer context — never from the header directly
- [ ] Use `TENANT#{tenantId}` in DynamoDB partition key on every access
- [ ] Return responses following the API contract (Section 6)
- [ ] Include `requestId` (`context.awsRequestId`) in error envelopes
- [ ] Publish domain event to EventBridge with Schema Registry entry
- [ ] Create SQS + DLQ for all async consumers
- [ ] Set Lambda timeout explicitly — use the reference table in Section 13
- [ ] Enable X-Ray active tracing on Lambda and API Gateway stage
- [ ] Configure structured logs with Lambda Powertools Logger (via middy)
- [ ] Emit business metrics with Lambda Powertools Metrics (EMF, via middy)
- [ ] Create CloudWatch Alarms for errors, throttles, and latency
- [ ] Export endpoint URLs to SSM if the frontend needs them
- [ ] Apply Lambda Powertools Idempotency with `X-Idempotency-Key` for POST/PUT/PATCH on API Gateway handlers
- [ ] For SQS consumer Lambdas: use the EventBridge `eventId` as the idempotency key, not `X-Idempotency-Key`
- [ ] If cross-entity atomicity is required: use `TransactWriteItems` (up to 100 items)
- [ ] If domain needs change reactions (audit, projections): enable DynamoDB Streams on the table
- [ ] If domain needs aggregations or reports: design the S3 export path and Athena query

### Frontend
- [ ] Add row to mapping table (Section 5)
- [ ] Create feature slice under `src/features/{feature}/` with full structure
- [ ] Define Zod schema + inferred TypeScript types
- [ ] Implement service with path `/v1/{domain}/...` (no `/api/` prefix)
- [ ] Implement query key factory (no hardcoded strings)
- [ ] Implement TanStack Query hooks (query + mutation) — never `useEffect + fetch`
- [ ] Generate `X-Idempotency-Key` in the service — not in the hook
- [ ] Register lazy-loaded routes with `React.lazy` + `Suspense` + `ErrorBoundary`
- [ ] Build page and feature components using **shadcn/ui** — run `npx shadcn@latest add <component>` before rebuilding any existing primitive
- [ ] Do not use Tailwind arbitrary values — all colors, spacing, and radii from `tailwind.config.ts` tokens
- [ ] Verify keyboard navigation and ARIA compliance — Radix UI primitives handle most contracts; validate with axe-core
- [ ] Write RTL integration test covering the primary data flow (not visual appearance)
- [ ] Write Playwright E2E test for the happy path
- [ ] Verify offline behavior with cached data
- [ ] If real-time events: confirm `useWebSocket` invalidates `queryKey: ['{domain}']`
- [ ] If file upload: use `useFileUpload` hook — never POST file through API Gateway
- [ ] Export only public API via `index.ts` — no internal cross-feature imports

---

## 23. Anti-Patterns (Forbidden — Both Sides)

### Backend

| Anti-Pattern | Why It Is Forbidden |
| --- | --- |
| Reading `tenantId` from the `x-tenant-id` header in Lambda handler | Easily forged — always use authorizer context |
| DynamoDB without `TENANT#` in the partition key | Tenant data silently mixes across tenants |
| Lambda without DLQ on an async trigger | Failures disappear with no visibility |
| Lambda using the AWS default timeout (3s) | Always set explicitly — use the reference table in Section 13 |
| Secrets stored in Lambda environment variables | Visible in AWS console — always use Secrets Manager |
| IAM with wildcard (`*`) on sensitive actions | Always scope to specific table/bucket ARNs |
| Synchronous Lambda-to-Lambda chain (A→B→C) | Use Step Functions or EventBridge/SQS |
| Hardcoded ARNs or API URLs | Always via environment variables or CDK outputs |
| Manual change in the AWS console | Everything via CDK — no exceptions in staging/prod |
| Publishing an event without a Schema Registry entry | Event contracts must be explicit and versioned |
| Using `X-Idempotency-Key` as idempotency key in SQS consumers | SQS consumers never receive this header — use EventBridge `eventId` instead |
| Running aggregation queries directly against a DynamoDB table | Aggregations go to Athena over S3 exports — never scan the primary table |
| Writing to DynamoDB inside a DynamoDB Streams consumer of the same table | Creates an infinite trigger loop — write to a different table or publish to EventBridge |

### Frontend — Engineering

| Anti-Pattern | Why It Is Forbidden |
| --- | --- |
| `useEffect + useState + fetch` for server data | Always TanStack Query — no exceptions |
| Reading `requestId` from the HTTP response header | Read from `error.response.data.error.requestId` (body) |
| Posting a file directly through API Gateway | Use `useFileUpload` hook (pre-signed S3) |
| PWA cache for sensitive data (financial, audit) | `NetworkOnly` required — never serve stale |
| `X-Idempotency-Key` generated in the hook | Generate in the service so the key travels with retries |
| Importing one feature inside another feature | Use router, Zustand, or events — never direct import |
| Calling `useWebSocket` in multiple components | Once in `AppShell`, distributed via TanStack Query cache |
| Hardcoding URLs in `.env.production` | Values always come from SSM via CodeBuild |
| Amplify imports outside `shared/auth/` | Fully encapsulate inside the auth adapter |
| Expired refresh token with no redirect to `/login` | Interceptor must catch, clear store, and redirect |
| Routes without `ErrorBoundary` + `Suspense` | Every lazy route needs both fallbacks |

### Frontend — UI Stack Violations

| Anti-Pattern | Why It Is Forbidden |
| --- | --- |
| Using Tailwind arbitrary values (`w-[137px]`, `text-[#ff0000]`) | All values must come from `tailwind.config.ts` tokens — arbitrary values create drift |
| Adding CSS Modules or plain `.css` files for component styling | Tailwind CSS is the single styling mechanism; parallel systems diverge |
| Rebuilding a component already in the shadcn/ui catalog | Run `npx shadcn@latest add <component>` — never rebuild Button, Input, Dialog, etc. |
| Importing icons from any library other than Lucide React | Single icon set maintains visual and bundle consistency |
| Implementing dark mode outside the Tailwind `dark:` class strategy | The `dark` class on `<html>` is the single theming source of truth |
| Overriding shadcn component styles with inline styles or `!important` | Extend via `cva` variants in the component file — never patch from outside |
| Adding tokens to `theme.extend` without documenting them here | Token additions must be recorded in this document to remain discoverable |

---

## 24. Internationalization (i18n)

### Supported Locales

| Locale | Description | Default |
| --- | --- | --- |
| `en_US` | American English | ✅ Yes |
| `pt_BR` | Brazilian Portuguese | No |

### Library

`i18next` + `react-i18next`. No other i18n library is allowed.

### Detection Algorithm

The app resolves the active locale on startup in this order:

1. **User preference** — read from the authenticated user's profile (`custom:locale` Cognito attribute). If the value is a supported locale (`en_US` or `pt_BR`), use it immediately.
2. **Auto mode** — if the preference is `auto` or absent, iterate `navigator.languages`, normalize each tag (e.g. `pt-BR` → `pt_BR`, `en-US` → `en_US`), and return the first match against the supported locales list.
3. **Fallback** — `en_US` if no browser language matches a supported locale.

The user never sees a locale they did not choose or that the browser did not signal. Detection runs once at startup; locale changes during a session require an explicit user action.

### User Preference Storage

| Layer | Value | Notes |
| --- | --- | --- |
| Cognito custom attribute | `custom:locale` (`en_US` \| `pt_BR` \| `auto`) | Source of truth across devices |
| Zustand persisted store | `userPreferences.locale` | Synced from Cognito on login; used offline |
| `localStorage` | `i18nextLng` (set by i18next) | Warm-start cache only — never read directly in app code |

The locale preference is updated only when the user explicitly changes it in the preferences screen. It is never inferred or overwritten silently after the user has set it.

### File Structure

```
src/i18n/
├── index.ts            # i18next init, detector configuration
└── locales/
    ├── en_US.json      # canonical — all keys must be defined here
    └── pt_BR.json      # must mirror en_US key structure exactly; no extra keys
```

### i18next Init Contract

```typescript
// src/i18n/index.ts
i18next
  .use(LanguageDetector)   // reads Zustand store, then navigator.languages
  .use(initReactI18next)
  .init({
    supportedLngs: ['en_US', 'pt_BR'],
    fallbackLng: 'en_US',
    interpolation: { escapeValue: false },
    resources: {
      en_US: { translation: enUS },
      pt_BR: { translation: ptBR },
    },
  });
```

The custom `LanguageDetector` must implement the detection algorithm defined above (preference → auto/browser → fallback).

### Anti-Patterns (Forbidden)

| Anti-Pattern | Why It Is Forbidden |
| --- | --- |
| Hardcoding any user-visible string in JSX or logic | Bypasses translation; breaks pt_BR users |
| Calling `navigator.language` directly in application code | Always go through `useTranslation()` — detection is centralized in `src/i18n/index.ts` |
| Reading `localStorage.i18nextLng` directly in application code | That key is an i18next internal cache, not the user preference |
| Adding a key to `pt_BR.json` that does not exist in `en_US.json` | `en_US` is the canonical source; orphaned keys in other locales create maintenance debt |
| Omitting a key from `pt_BR.json` that exists in `en_US.json` | Falls back silently to English — users see mixed-language UI |
| Using locale format `en-US`, `en`, `pt`, `pt-br` anywhere in code | The only accepted formats are `en_US` and `pt_BR` (underscore separator) |
| Storing locale preference outside `custom:locale` | Single source of truth — do not duplicate into other Cognito attributes or DynamoDB |
| Changing the locale without persisting to `custom:locale` | Preference would reset on next login |

---

## 25. Versioning Strategy

This project uses a **three-layer versioning model**. Each layer has a distinct purpose and a distinct owner. Do not conflate them.

### Layer 1 — Product Version (SemVer)

A single SemVer version represents a coordinated release of all components in the monorepo (frontend, all Lambda domains, infrastructure). It is the version the user sees, the changelog references, and CI/CD gates on.

| Where | Role |
| --- | --- |
| `docs/project-definition.md` — `Base version` field | **Single source of truth** — change this first |
| `zenvillage-web/package.json` — `version` field | Propagated copy — must stay in sync |
| `{domain}-lambda/package.json` — `version` field (when created) | Propagated copy — must stay in sync |
| `CHANGELOG.md` | Human-readable release history |
| Git tag `vX.Y.Z` | Immutable release artifact — CI/CD gates on this |

#### Bump Rules

| Type of change | Bump | Examples |
| --- | --- | --- |
| Breaking API contract change, destructive schema migration | **Major** (`2.0.0`) | Removing a field from the API envelope, changing a PK pattern |
| New user-visible feature, new Lambda domain, new API route | **Minor** (`1.1.0`) | New feature slice, new `/v1/{domain}` path |
| Bug fix, config tweak, refactor with no external impact | **Patch** (`1.0.1`) | Fixing a Lambda response, adjusting a Tailwind token |

### Layer 2 — API Contract Version

The HTTP API prefix (`/v1/`, `/v2/`) decouples the frontend from breaking backend changes without requiring a product version bump. A new prefix is created only when an existing contract must change in a breaking way while the old contract must remain live for existing clients.

- All routes start at `/v1/` (see Section 5).
- A `/v2/` prefix is introduced only when a breaking contract change is needed and backward compatibility must be preserved during migration.
- The prefix is **not** a SemVer — it is an integer that increments independently.

### Layer 3 — Deployment Version

Controls which code is running in AWS at any given moment, without SemVer overhead per function.

| Mechanism | Purpose |
| --- | --- |
| Lambda aliases `LIVE` / `STAGING` | Point to a published Lambda version; instant rollback by updating the alias |
| Lambda version number | Immutable snapshot created by CDK on each deploy — used only as an alias target |
| Frontend build hash (`VITE_APP_VERSION`) | Commit SHA injected by CodeBuild — surfaced in error tracking (Sentry) and `X-App-Version` header |

`VITE_APP_VERSION` is injected during the CodeBuild frontend build step and is never hardcoded in the repository.

### Version Bump Flow

The step-by-step release procedure is defined in `CLAUDE.md` under **Versioning Policy**. The git tag `vX.Y.Z` is the canonical release marker; CI/CD pipelines key off it.