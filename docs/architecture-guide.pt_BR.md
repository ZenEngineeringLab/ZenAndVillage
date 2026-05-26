# Guia de Arquitetura Integrada
## PWA Frontend + Serverless AWS

> **Como usar este documento**
> `{project}` é um placeholder intencional — **não** o substitua diretamente neste arquivo. Agentes e ferramentas o resolvem no momento da tarefa a partir de `docs/project-definition.md`. Isso mantém o guia reutilizável entre projetos sem hardcode de identificadores aqui.
> Este documento é a **fonte única de verdade para a arquitetura de engenharia**.
> Decisões de UI (componentes, tokens, estilização, ícones) são regidas pela Seção 15 deste documento.

> **Versão pt_BR.** Este documento é a tradução em Português Brasileiro (pt_BR) de [`architecture-guide.md`](architecture-guide.md).
> Toda edição feita em `architecture-guide.md` deve ser refletida neste arquivo.
> Em caso de conflito de conteúdo, a versão em inglês (`architecture-guide.md`) é a canônica.

---

## 1. Overview

Esta arquitetura combina um **frontend PWA** (React + TypeScript + Vite) com um
**backend serverless AWS** (Lambda + API Gateway + Cognito), organizado por princípios
hexagonais e DDD em ambos os lados.

É adequada para produtos SaaS **multi-tenant** com múltiplos usuários por organização,
requisitos em tempo real, uploads de arquivos e suporte offline via PWA.

### Topologia do Sistema

```
┌───────────────────────────────────────────────────────────────────┐
│  USUÁRIO (browser / mobile PWA)                                   │
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
│  │  HTTP API (REST)     │  │  WebSocket API (Tempo Real)       │  │
│  │  /v1/{domain}/...    │  │  $connect / $disconnect / $default│  │
│  └──────────┬───────────┘  └──────────────┬────────────────────┘  │
│             │                             │                       │
│  ┌──────────▼───────────┐                 │                       │
│  │  Cognito Authorizer  │                 │                       │
│  │  + Lambda Authorizer │                 │                       │
│  │  (verificação de     │                 │                       │
│  │   tenantId)          │                 │                       │
│  └──────────┬───────────┘                 │                       │
└─────────────┼───────────────────────────┬─┘                       │
              │                           │                         │
              ▼                           ▼                         │
┌───────────────────────────────────────────────────────────────────┐
│  AWS LAMBDA (por domínio)               │  LAMBDA NOTIFICADOR     │
│                                         │  (push WebSocket)       │
│  ┌──────────┐ ┌──────────┐ ┌─────────┐  │                         │
│  │domínio-a │ │domínio-b │ │domínio-c│  │                         │
│  └────┬─────┘ └────┬─────┘ └────┬────┘  │                         │
└───────┼─────────────┼────────────┼───────┼─────────────────────────┘
        │             │            │       │
        ▼             ▼            ▼       │
┌───────────────────────────────────────────────────────────────────┐
│  ARMAZENAMENTO DE DADOS         │  MENSAGERIA                     │
│  DynamoDB (por domínio)         │  EventBridge → SQS → Lambda     │
│  DynamoDB Streams → Lambda      │  SNS (fan-out / entrega push)   │
│  S3 (uploads / exports)         │                                 │
│  Amazon Athena (analytics)      │                                 │
└───────────────────────────────────────────────────────────────────┘
        │
        ▼
┌───────────────────────────────────────────────────────────────────┐
│  IDENTIDADE                     │  OBSERVABILIDADE                │
│  Amazon Cognito User Pool       │  CloudWatch Logs + Metrics      │
│  Pre-Token Generation Trigger   │  AWS X-Ray (rastreamentos)      │
│  Identity Pool (S3 direto)      │  CloudWatch Alarms + Dashboards │
└───────────────────────────────────────────────────────────────────┘
```

---

## 2. Technology Stack

### Backend (AWS Serverless)

> **Runtime:** Node.js 22 (TypeScript) é o padrão para todas as funções Lambda nesta stack.
> Todos os exemplos de código e constructs CDK usam Node.js 22. Python 3.13 está disponível,
> mas introduz uma segunda superfície de runtime — use-o apenas quando a equipe de domínio
> tiver uma razão fortemente orientada a Python.
> Node.js 20 atinge EOL em 30 de abril de 2026 — não usar em novos projetos.

| Função | Serviço |
| --- | --- |
| API REST | Amazon API Gateway HTTP API |
| API Tempo Real | Amazon API Gateway WebSocket API |
| Computação | AWS Lambda (Node.js 22 / TypeScript) |
| Identidade | Amazon Cognito User Pool |
| Identity Pool (acesso S3 direto) | Amazon Cognito Identity Pool |
| Armazenamento primário | Amazon DynamoDB |
| Change streams | DynamoDB Streams → Lambda |
| Armazenamento de objetos | Amazon S3 |
| Analytics / relatórios | Amazon Athena (consultas em exports S3) |
| Eventos assíncronos | SQS + SNS |
| Eventos assíncronos (pub/sub de domínio) | Amazon EventBridge |
| Observabilidade | CloudWatch Logs + Metrics + X-Ray |
| Dashboards de observabilidade | CloudWatch Dashboards |
| Segredos | AWS Secrets Manager |
| Configuração | AWS SSM Parameter Store |
| Middleware | middy v7 (motor de middleware Lambda para Powertools) |
| IaC | AWS CDK (TypeScript) |
| CI/CD | AWS CodePipeline + CodeBuild |
| CDN + Hospedagem | Amazon CloudFront + S3 |

### Frontend (PWA)

> **Linha de base de versão:** Maio 2026. Verifique no npm antes do kickoff do projeto — saltos de versão major
> (React, Vite, React Router, Zustand) carregam breaking changes e exigem etapas de migração próprias.

| Função | Tecnologia | Autoridade |
| --- | --- | --- |
| Framework | React 19 + TypeScript 6 (strict) | Este documento |
| Bundler | Vite 8 | Este documento |
| Camada de UI (tokens, componentes, estilização, ícones) | shadcn/ui + Tailwind CSS v4 + Lucide React | Este documento (Seção 15) |
| Roteamento | React Router 7 | Este documento |
| Estado de servidor | TanStack Query 5 | Este documento |
| Estado de cliente | Zustand 5 | Este documento |
| Formulários | React Hook Form + Zod | Este documento |
| HTTP Client | Axios (interceptors customizados) | Este documento |
| Auth | AWS Amplify Auth v6 (apenas módulo auth) | Este documento |
| Tempo real | WebSocket nativo (hook `useWebSocket`) | Este documento |
| PWA | vite-plugin-pwa + Workbox | Este documento |
| Testes | Vitest + React Testing Library + Playwright | Este documento |

> **Leia a coluna Autoridade antes de adicionar qualquer coisa a um componente.**
> Se a autoridade for "Este documento", a definição está na seção referenciada abaixo.
> Todas as decisões de UI (estilização, componentes, ícones) são regidas pela Seção 15.

---

## 3. Compatibility Matrix

Todas as versões da Seção 2 foram validadas entre si em **Maio 2026**.
As versões mínimas de patch indicadas abaixo são obrigatórias — não use patches anteriores.

### Compatibilidade Frontend

| Par | Status | Versão Mínima | Notas |
| --- | --- | --- | --- |
| React 19 + Vite 8 | ✅ | `vite@8.0.0` | `@vitejs/plugin-react` suporta explicitamente Vite 8; testado no CI do Vite |
| React 19 + React Router 7 | ✅ | `react-router@7.0.0` | Construído para fazer a ponte React 18 → 19 incrementalmente; upgrade não-breaking do v6 |
| React 19 + TanStack Query 5 | ✅ | `@tanstack/react-query@5.0.0` | Peer dep declara `>=18`, mas React 19 é retrocompatível via `useSyncExternalStore` |
| React 19 + Zustand 5 | ✅ | **`zustand@5.0.13`** | Versões 5.0.1–5.0.2 tinham conflito de peer dep via `use-sync-external-store`. Corrigido em 5.0.13 — não use patches anteriores |
| React 19 + React Hook Form | ✅ | `react-hook-form@7.0.0` | Compatível para uso em SPA. Não integra com `useActionState` (funcionalidade Server Action do React 19 — não usada nesta arquitetura) |
| React 19 + Amplify Auth v6 | ✅ | `aws-amplify@6.0.0` | API baseada em funções — sem dependência do ciclo de render do React |
| Vite 8 + vite-plugin-pwa | ✅ | **`vite-plugin-pwa@1.3.0`** | v1.2.0 tinha peer dep limitada a `^7.0.0`. v1.3.0 (Maio 2026) adicionou `^8.0.0` — não use versões anteriores com Vite 8 |
| Vite 8 + TypeScript 6 | ✅ | `typescript@6.0.0` | Suporte nativo |
| Vite 8 + Node.js | ✅ | Node.js 20.19+ ou **22.12+** | Distribuição ESM-only do Vite 8 exige suporte a `require(esm)` sem flag |

### Breaking Changes do React 19 Relevantes para Esta Arquitetura

Estas mudanças do React 19 requerem atenção ao implementar funcionalidades. Não afetam
os padrões de engenharia deste documento, mas afetam como os componentes de UI são construídos.

| Mudança | Impacto | Ação |
| --- | --- | --- |
| `forwardRef` depreciado | Componentes que encapsulam `ref` devem usar o novo prop `ref` | Todos os componentes de UI devem usar o padrão ref-as-prop do React 19; sem `forwardRef` em novos componentes |
| `Context.Consumer` depreciado | Consumidores de contexto no estilo render-prop removidos | Use apenas o hook `useContext` |
| `ReactDOM.render` removido | API de render legada removida | Já não utilizada — `createRoot` é o padrão |
| Hook `use()` (novo) | Pode ler Context ou Promises diretamente no render | Disponível para uso em feature hooks se necessário; não substitui TanStack Query para estado de servidor |
| `useActionState` (novo) | Gerenciamento nativo de estado de submissão de formulário | Não usado nesta arquitetura — React Hook Form + Zod gerencia formulários; `useActionState` é para padrões de server-action |

### Compatibilidade Backend

| Par | Status | Notas |
| --- | --- | --- |
| Node.js 22 + AWS CDK | ✅ | CDK TypeScript suporta completamente Node.js 22 |
| Node.js 22 + Lambda Powertools | ✅ | Powertools for AWS Lambda (TypeScript) suporta Node.js 22 |
| Node.js 22 + middy | ✅ | middy v7 suporta Node.js 22 |
| DynamoDB + Lambda (sem VPC) | ✅ | DynamoDB é um serviço gerenciado sem VPC — nenhuma configuração de rede necessária |
| S3 + Athena (analytics) | ✅ | Athena consulta o S3 diretamente — serverless, sem infraestrutura para provisionar |

### Nota de Instalação

Devido a restrições de peer dependency no ecossistema, instale a stack frontend com:

```bash
npm install --legacy-peer-deps
```

Isso é necessário porque o peer dep do TanStack Query declara formalmente `react@">=18"` enquanto
o projeto usa React 19. A biblioteca é totalmente funcional — trata-se de um atraso de declaração,
não de uma incompatibilidade em runtime. Acompanhe [esta issue](https://github.com/TanStack/query/issues)
para a atualização oficial do peer dep.

---

## 4. Project Structure

### Backend

```
{project}-backend/
├── infra/
│   ├── bin/app.ts
│   ├── stacks/
│   │   ├── users.stack.ts              # Tabela DynamoDB users (Lambda Pre-Token)
│   │   ├── cognito.stack.ts
│   │   ├── api-gateway.stack.ts
│   │   ├── frontend-hosting.stack.ts   # S3 + CloudFront OAC
│   │   ├── {domain}.stack.ts           # um por domínio de negócio — um arquivo por domínio
│   │   └── pipeline.stack.ts           # CodePipeline CI/CD (adicionar ao habilitar o pipeline)
│   └── constructs/
│       ├── lambda-with-powertools.ts
│       └── sqs-with-dlq.ts
│
└── lambda/
    ├── shared/
    │   ├── tenant-authorizer.handler.ts  # HttpLambdaResponseType.SIMPLE
    │   ├── extract-context.ts
    │   └── response-helpers.ts           # ok(), created(), noContent(), badRequest(), …
    ├── auth/
    │   └── pre-token-generation.handler.ts
    ├── {domain}/                         # uma pasta por domínio de negócio
    │   ├── list.handler.ts
    │   ├── get-by-id.handler.ts
    │   ├── create.handler.ts
    │   ├── update.handler.ts
    │   ├── delete.handler.ts
    │   ├── domain/                       # Entidades, Value Objects
    │   └── infrastructure/               # Repositório DynamoDB
    ├── uploads/
    │   └── presign.handler.ts
    └── notifications/
        ├── ws-connect.handler.ts
        ├── ws-disconnect.handler.ts
        ├── notifier.handler.ts           # Trigger SQS → push WebSocket
        ├── list.handler.ts
        ├── mark-read.handler.ts
        └── mark-all-read.handler.ts
```

### Frontend

```
{project}-web/
├── public/
│   ├── pwa-192x192.png                   # Ícones PWA
│   ├── pwa-512x512.png
│   └── favicon.svg
│
├── src/
│   ├── App.tsx
│   ├── main.tsx                          # Amplify.configure() + init i18n aqui
│   ├── index.css
│   │
│   ├── app/
│   │   ├── router.tsx                    # Lazy-loaded por feature (React.lazy + Suspense)
│   │   └── query-client.ts
│   │
│   ├── features/                         # Uma pasta por domínio — estrutura plana
│   │   ├── auth/
│   │   │   ├── pages/LoginPage.tsx
│   │   │   └── store/auth.store.ts       # Zustand — user, activeTenantId, tenants
│   │   ├── dashboard/DashboardPage.tsx
│   │   ├── {feature}/
│   │   │   ├── {Feature}Page.tsx         # Componente de página (alvo de rota lazy-loaded)
│   │   │   ├── {Feature}Form.tsx         # Formulário de criação / edição
│   │   │   ├── {Feature}Detail.tsx       # Detalhe / painel lateral (opcional)
│   │   │   ├── hooks/
│   │   │   │   └── use{Feature}Query.ts  # Hooks TanStack Query + key factory
│   │   │   ├── services/
│   │   │   │   └── {feature}.service.ts  # Chamadas Axios — chave de idempotência gerada aqui
│   │   │   └── types/
│   │   │       └── {feature}.types.ts
│   │   ├── notifications/
│   │   │   ├── hooks/useNotificationsQuery.ts
│   │   │   └── services/notifications.service.ts
│   │   └── preferences/PreferencesPage.tsx
│   │
│   ├── i18n/
│   │   ├── index.ts                      # Init i18next (sem plugin LanguageDetector)
│   │   └── locales/
│   │       ├── en_US.json                # canônico
│   │       └── pt_BR.json
│   │
│   └── shared/
│       ├── api/
│       │   ├── http-client.ts            # Instância Axios + interceptors de requisição/resposta
│       │   └── error-mapper.ts
│       ├── auth/
│       │   └── auth.adapter.ts           # Arquivo único que importa aws-amplify
│       ├── components/
│       │   ├── AppShell.tsx              # useWebSocket chamado uma vez aqui
│       │   ├── AppHeader.tsx
│       │   ├── AppSidebar.tsx
│       │   ├── AuthGuard.tsx
│       │   ├── DataTable.tsx
│       │   ├── NotificationPanel.tsx
│       │   └── ui/                       # Saída shadcn/ui (button, input, dialog, …)
│       ├── hooks/
│       │   ├── useWebSocket.ts           # chamado uma vez no AppShell
│       │   ├── useServiceWorkerUpdate.ts
│       │   ├── useTheme.ts
│       │   └── useLocale.ts
│       ├── store/
│       │   └── app.store.ts              # Zustand — sidebar, theme, locale
│       └── types/
│           ├── api.types.ts              # PaginatedResponse<T>, ApiError
│           └── entities.ts
│
├── index.html
├── vite.config.ts
├── tsconfig.json
└── .env.example
```

### Variáveis de Ambiente (Frontend)

```bash
# .env.example — valores injetados pelo CodeBuild via SSM (nunca hardcoded)
VITE_API_BASE_URL=
VITE_WS_ENDPOINT=
VITE_COGNITO_USER_POOL_ID=
VITE_COGNITO_CLIENT_ID=
VITE_COGNITO_REGION=          # fixo por projeto  (ex.: us-east-1)
VITE_VAPID_PUBLIC_KEY=        # chave pública VAPID para Web Push
VITE_APP_VERSION=             # injetado pela CI (git tag ou commit SHA)
VITE_SENTRY_DSN=              # opcional — rastreamento de erros
```

---

## 5. Feature ↔ Domain ↔ API Mapping

Esta tabela é a **fonte única de verdade** para nomenclatura de features frontend, domínios
Lambda e rotas de API. Preencha-a no kickoff do projeto e mantenha-a atualizada a cada nova feature.

**Ambos os lados devem referenciar esta tabela. Nunca defina um nome de rota no frontend
sem registrá-lo aqui primeiro.**

| Feature Frontend | Domínio Lambda | Caminho Base da API | Armazenamento Primário |
| --- | --- | --- | --- |
| `auth` | `auth` | *(Trigger Cognito — sem rotas REST)* | DynamoDB (`{project}-users`) |
| `{feature-a}` | — | *(somente client-side — sem backend)* | — |
| `{feature-b}` | `{feature-b}` | `/v1/{feature-b}` | DynamoDB (`{project}-{feature-b}`) |
| `{feature-c}` | `{feature-c}` | `/v1/{feature-c}` | DynamoDB (`{project}-{feature-c}`) |
| `notifications` | `notifications` | `/v1/notifications` | DynamoDB (`{project}-notifications`) |
| `uploads` | `uploads` | `/v1/uploads/presign` | DynamoDB (`{project}-files`) + S3 |
| `preferences` | — | *(somente client-side — locale/theme)* | Cognito `custom:locale` |
| `{feature-d}` | `{feature-d}` | `/v1/{feature-d}` | DynamoDB |

> **Instruções:** Substitua `{feature-a}`, `{feature-b}`, etc. pelos nomes reais de features do
> seu projeto. Adicione uma linha por domínio no kickoff do projeto. `auth`, `notifications`,
> `uploads` e `preferences` são features de nível arquitetural presentes em todo projeto — mantenha-as como estão.

> **Nota:** React Router v7 fundiu `react-router-dom` em `react-router`.
> Importe tudo de `"react-router"` — `react-router-dom` não é mais necessário como dependência separada.

**Regra:** Nunca use `/api/v1/`. O stage da HTTP API do API Gateway é `$default` — sem prefixo `/api/`.

---

## 6. API Contract (Single Source of Truth)

Todo endpoint deve seguir este contrato. Lambda e frontend implementam exatamente estes
formatos. Nunca adicione campos fora deste envelope sem atualizar este documento primeiro.

### Listagem — GET `/v1/{resource}`

```json
{
  "data": {
    "items": [
      { "id": "uuid", "...": "..." }
    ],
    "pagination": {
      "page": 1,
      "pageSize": 20,
      "total": 150,
      "totalPages": 8
    }
  }
}
```

> O campo `data` encapsula um objeto `{ items, pagination }` — não um array puro.
> O frontend lê como `response.data.data` (envelope externo Axios + chave interna `data` da API).
> `PaginatedResponse<T>` em `shared/types/api.types.ts` representa o formato interno.

### Detalhe — GET `/v1/{resource}/{id}`

```json
{
  "data": { "id": "uuid", "...": "..." }
}
```

### Criação / Atualização — POST / PATCH

```json
{
  "data": { "id": "uuid", "...": "..." }
}
```

### Exclusão — DELETE

```
HTTP 204 No Content  (sem corpo)
```

### Erro — 4xx / 5xx

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

> `requestId` vem de `context.awsRequestId` na Lambda — nunca gerado no frontend.
> O frontend lê `requestId` do **corpo** (`error.response.data.error.requestId`),
> não de headers HTTP.

### Headers de Requisição Obrigatórios (Frontend → API)

| Header | Origem | Descrição |
| --- | --- | --- |
| `Authorization` | Interceptor Axios | Bearer JWT (token de acesso Cognito) |
| `X-Tenant-Id` | Interceptor Axios | UUID da organização/tenant ativo |
| `X-Idempotency-Key` | Interceptor Axios | UUID gerado pelo cliente para POST / PUT / PATCH |
| `Content-Type` | Padrão Axios | `application/json` |

### Headers de Resposta Obrigatórios (API → Frontend)

| Header | Valor | Como Definir |
| --- | --- | --- |
| `X-Request-Id` | `context.awsRequestId` | Headers de resposta Lambda |
| `X-Trace-Id` | ID de rastreamento X-Ray | Headers de resposta Lambda |

---

## 7. Authentication and Authorization (End-to-End)

### Fluxo Completo

```
1. LOGIN
   Browser → Amplify Auth.signIn()
   Cognito autentica → dispara Lambda Pre-Token Generation
   Lambda injeta claims customizadas no token (tenantId, roles, userId)
   Cognito retorna: accessToken, idToken, refreshToken
   Frontend extrai claims → armazena no Zustand auth store

2. REQUISIÇÃO AUTENTICADA
   Interceptor de requisição Axios:
     1. Amplify.getAccessToken() → token cacheado ou refresh automático
     2. Injeta Authorization: Bearer {token}
     3. Injeta X-Tenant-Id: {tenantId do Zustand}
     4. Injeta X-Idempotency-Key: {UUID} apenas para POST/PUT/PATCH
   API Gateway valida JWT contra Cognito JWKS (sem Lambda envolvida)
   Lambda Authorizer valida X-Tenant-Id == claim custom:tenantId
   Handler Lambda processa com tenantId validado via contexto

3. TOKEN EXPIRADO (401)
   Interceptor de resposta Axios:
     → Chama Amplify.refreshSession()
     → Em sucesso: repete a requisição original (flag _retried previne loop)
     → Em falha (refresh token expirado):
         clearSession() + queryClient.clear() + redirect /login

4. LOGOUT
   Amplify.signOut() + clearSession() + queryClient.clear()
   Cognito invalida o refresh token
```

### Lambda Pre-Token Generation — Obrigatória

Sem este trigger, `tenantId`, `roles` e `onboardingStatus` não existem no JWT e todo
o sistema de multi-tenancy e subscription gate falha silenciosamente.

**Claims injetados:**

| Claim | Tipo | Descrição |
| --- | --- | --- |
| `custom:tenantId` | `string` | UUID do tenant ativo; validado pelo Lambda Authorizer em toda requisição |
| `custom:roles` | `string` (array JSON) | Array serializado das strings de papel do usuário |
| `custom:userId` | `string` | UUID interno do usuário (distinto do `sub` do Cognito) |
| `custom:onboardingStatus` | `string` | Valor atual de `onboarding_status`; lido pelo `AuthGuard` do frontend para aplicar o subscription gate sem chamada de API adicional |

```typescript
// lambda/auth/pre-token-generation.handler.ts
export const handler = async (event: PreTokenGenerationTriggerEvent) => {
  const userId = event.request.userAttributes.sub;
  const user   = await userRepository.findById(userId);

  event.response = {
    claimsOverrideDetails: {
      claimsToAddOrOverride: {
        'custom:tenantId':         user.tenantId,
        'custom:roles':            JSON.stringify(user.roles),
        'custom:userId':           user.id,
        'custom:onboardingStatus': user.onboardingStatus,
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

### Lambda Authorizer — Validação de Tenant

Usa `HttpLambdaResponseType.SIMPLE` — retorna `{ isAuthorized, context }`, não um documento de política IAM.

```typescript
// lambda/shared/tenant-authorizer.handler.ts
export const handler = async (
  event: APIGatewayRequestAuthorizerEventV2
): Promise<APIGatewaySimpleAuthorizerWithContextResult<AuthorizerContext>> => {
  const authHeader    = event.headers?.authorization ?? '';
  const headerTenantId = event.headers?.['x-tenant-id'] ?? '';

  if (!authHeader.startsWith('Bearer ')) throw new Error('Unauthorized');

  const claims        = extractClaims(authHeader.slice(7));
  const tokenTenantId = claims['custom:tenantId'];
  const userId        = claims['custom:userId'] ?? claims['sub'];
  const roles         = claims['custom:roles'] ?? '[]';

  if (!headerTenantId)                      throw new Error('Unauthorized');
  if (headerTenantId !== tokenTenantId)     throw new Error('Unauthorized');

  return {
    isAuthorized: true,
    context: { tenantId: tokenTenantId, userId, roles },
  };
};
```

### Modelo de Autorização por Camada

| Camada | Mecanismo |
| --- | --- |
| Autenticação (API Gateway) | Cognito User Pool Authorizer — valida assinatura e expiração do JWT |
| Isolamento de tenant (API Gateway) | Lambda Authorizer — valida `X-Tenant-Id` contra a claim `custom:tenantId` |
| RBAC (handler Lambda) | Roles lidas de `event.requestContext.authorizer.lambda.roles` |
| Acesso a dados (Lambda → DynamoDB) | Partition key sempre inclui `TENANT#{tenantId}` |
| Serviço a serviço | IAM execution roles com `lambda:InvokeFunction` escopo para ARNs explícitos |

---

## 8. Multi-Tenancy (End-to-End)

### Padrão de Partition Key do DynamoDB

```
PK = "TENANT#{tenantId}#{ENTITY}#{entityId}"
SK = "PROFILE"                          ← registro estático
SK = "2026-01-01T00:00:00Z"             ← sort key temporal para listas
SK = "CONN#{connectionId}"              ← conexões WebSocket ativas
```

### Extraindo `tenantId` no Handler Lambda

```typescript
// lambda/shared/extract-context.ts
export const extractContext = (event: APIGatewayProxyEventV2) => ({
  tenantId: event.requestContext.authorizer?.lambda?.tenantId as string,
  userId:   event.requestContext.authorizer?.lambda?.userId   as string,
  roles:    event.requestContext.authorizer?.lambda?.roles    as string[],
});

// ❌ PROIBIDO — facilmente forjado pelo cliente
// const tenantId = event.headers['x-tenant-id'];

// ✅ CORRETO — já validado pelo Lambda Authorizer
// const { tenantId } = extractContext(event);
```

### Interceptor Axios (Frontend)

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

// Lê requestId do CORPO — não do header de resposta HTTP
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
      : ['http://localhost:3000', 'http://localhost:4173'],
    allowMethods: [
      CorsHttpMethod.GET, CorsHttpMethod.POST, CorsHttpMethod.PUT,
      CorsHttpMethod.PATCH, CorsHttpMethod.DELETE, CorsHttpMethod.OPTIONS,
    ],
    allowHeaders: [
      'Content-Type', 'Authorization', 'X-Tenant-Id',
      'X-Idempotency-Key',       // enviado pelo interceptor Axios em POST/PUT/PATCH
      'X-Amz-Date', 'X-Api-Key', 'X-Amz-Security-Token',
    ],
    exposeHeaders: ['X-Request-Id', 'X-Trace-Id'],
    allowCredentials: false,     // JWT no header Authorization — cookies não utilizados
    maxAge: Duration.seconds(300),
  },
});
```

---

## 10. Data Strategy

DynamoDB é o **único armazenamento de dados primário** nesta arquitetura. Cada domínio
possui sua própria tabela. Sem VPC, sem connection pools, sem scripts de migração, sem servidores provisionados.

> **Trade-off — ScanCommand:** Handlers `list` iniciais podem usar `ScanCommand` com
> `FilterExpression` no prefixo do tenant. Isso é aceitável para conjuntos de dados pequenos
> durante as fases iniciais do produto. Em escala (> 10 mil itens por tenant por tabela),
> substitua por `QueryCommand` usando um GSI com `tenantId` como partition key e `SK` como sort key.

### Padrão de Partition Key — Regra Universal

```
PK = "TENANT#{tenantId}#{ENTITY}#{entityId}"
SK = "PROFILE"                        ← registro estático/único
SK = "2026-01-01T00:00:00Z"           ← sort key temporal para listas
SK = "CONN#{connectionId}"            ← conexões WebSocket ativas

Exemplos por categoria de produto:
  B2B SaaS:    TENANT#{t}#MEMBER#{id}    /  PROFILE
  E-commerce:  TENANT#{t}#ORDER#{id}     /  2026-01-01T00:00:00Z
  Field ops:   TENANT#{t}#ASSET#{id}     /  STATUS
  Tempo real:  TENANT#{t}#USER#{id}      /  CONN#{connectionId}
  Push subs:   TENANT#{t}#USER#{id}      /  PUSH#{endpointSuffix}
  Idempotência: IDEM#{idempotencyKey}    /  —  (TTL: 24h)
```

### Operações ACID Entre Entidades — `TransactWriteItems`

Quando uma operação deve ter sucesso ou falhar atomicamente entre múltiplos itens ou tabelas,
use DynamoDB Transactions. Até 100 itens em múltiplas tabelas em uma única chamada atômica
— sem VPC, sem connection pool.

```typescript
// lambda/{domain}/application/transfer-balance.use-case.ts
await dynamodb.transactWrite({
  TransactItems: [
    {
      Update: {
        TableName: process.env.TABLE_NAME!,
        Key: { PK: `TENANT#${tenantId}#ACCOUNT#${fromId}`, SK: 'BALANCE' },
        UpdateExpression:    'SET balance = balance - :amount',
        ConditionExpression: 'balance >= :amount',          // ← previne saldo negativo
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

**Limites:** 100 itens por transação, 4 MB de payload total. Use para operações financeiras,
reservas de estoque e qualquer invariante de negócio que abranja múltiplas entidades.

### Change Streams — DynamoDB Streams → Lambda

Habilite Streams nas tabelas onde consumidores downstream precisam reagir a mudanças de estado
(log de auditoria, sincronização de índice de busca, projeção de read-model, invalidação de cache).

```typescript
// infra/stacks/{domain}.stack.ts
const table = new Table(this, `{project}-{domain}-table`, {
  stream: StreamViewType.NEW_AND_OLD_IMAGES,   // ← habilita DynamoDB Streams
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

**Use Streams para:** escritas de trilha de auditoria, publicação de eventos no EventBridge
após uma escrita confirmada (padrão transactional outbox), sincronização de read models
desnormalizados e disparo de Lambdas downstream em mudança de estado de item.

### Padrão de Log de Auditoria Imutável

Registros de auditoria são itens append-only escritos pelo consumidor DynamoDB Streams.
Nunca são atualizados ou deletados — apenas escritos com TTL definido para o futuro distante
(ou sem TTL para dados de conformidade).

```
PK = "TENANT#{tenantId}#AUDIT#{entityId}"
SK = "{timestamp ISO-8601}#{eventId}"      ← garante unicidade + ordenação temporal
```

### Analytics e Relatórios — Amazon Athena

Quando um domínio precisa de agregações, GROUP BY ou consultas ad-hoc que o DynamoDB
não consegue servir eficientemente, exporte dados para S3 e consulte com Athena.
Sem servidores, sem VPC, pagamento por consulta escaneada.

```
Fluxo:
  DynamoDB Streams → Lambda (exportador) → S3 (Parquet ou JSON, particionado por data)
  → Athena (consultas SQL) → QuickSight (dashboards) ou resposta de API
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

**Use Athena para:** agregações de receita mensal, relatórios de uso, exports de conformidade,
dashboards de BI e qualquer consulta que exija varredura de muitos itens por atributos fora da chave.
Nunca execute essas consultas diretamente na tabela DynamoDB.

### Referência de Timeout Lambda

Sempre defina o timeout explicitamente — nunca confie no padrão AWS de 3s.

| Tipo de Lambda | Timeout Recomendado | Justificativa |
| --- | --- | --- |
| CRUD (DynamoDB) | 10s | Leitura/escrita simples; 10s deixa margem para retentativas |
| List com filtros | 15s | Lógica de paginação + filtro pode varrer mais itens |
| File presign | 10s | Chamada S3 API + escrita DynamoDB |
| Notificador WebSocket | 30s | Pode fazer fan-out para muitas conexões |
| Consumidor EventBridge | 60s | Cadeia downstream pode incluir múltiplas escritas |
| Lançador de consulta Athena | 15s | Apenas inicia a consulta; polling é assíncrono |
| Escritor de auditoria (Streams) | 30s | Lote de até 100 registros de stream |
| Remetente de notificação push | 60s | Pode entregar para muitas assinaturas por usuário |

```typescript
// infra/constructs/lambda-with-powertools.ts
new Function(this, id, {
  runtime:      Runtime.NODEJS_22_X,
  timeout:      Duration.seconds(props.timeoutSeconds ?? 10),   // nunca o padrão
  memorySize:   props.memoryMb ?? 512,
  tracing:      Tracing.ACTIVE,
  environment:  { POWERTOOLS_SERVICE_NAME: props.serviceName },
});
```

---

## 11. Asynchronous Messaging

### EventBridge — Eventos de Domínio

```
Event bus:  {project}-events  (barramento customizado)
Source:     {project}.{domain}
DetailType: {EntityType}.{EventType}

Schema obrigatório:
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

Todo evento publicado deve ter um schema registrado no
**EventBridge Schema Registry** antes do deploy.

### Filas SQS Padrão por Projeto

| Fila | Lambda Consumidora | Propósito | DLQ Após |
| --- | --- | --- | --- |
| `{project}-notifier-queue` | `notifier` | Push WebSocket para o browser | 3 tentativas |
| `{project}-push-queue` | `push-sender` | Notificações Web Push | 3 tentativas |
| `{project}-email-queue` | `email-sender` | E-mails transacionais (SES) | 3 tentativas |
| `{project}-audit-queue` | `audit-writer` | Log de auditoria imutável | 5 tentativas |
| `{project}-{domain}-queue` | `{domain}-consumer` | Processamento assíncrono de domínio | 3 tentativas |

---

## 12. Real-Time Channel (WebSocket API Gateway)

### Arquitetura

```
EventBridge (evento de domínio publicado por qualquer Lambda)
    │
    ▼
SQS ({project}-notifier-queue)
    │
    ▼
Lambda (notificador)
    ├── Busca conexões ativas do tenant no DynamoDB
    └── Chama API Gateway WebSocket Management API (postToConnection)
              │
              ▼
        Browser (Service Worker / hook React)
              │
              ▼
        queryClient.invalidateQueries({ queryKey: ['{domain}'] })
```

### Handlers Lambda WebSocket

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

### Hook `useWebSocket` (Frontend)

```typescript
// shared/hooks/useWebSocket.ts
export const useWebSocket = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!user) return;

    let ws: WebSocket | null = null;
    let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
    let destroyed = false;  // previne reconexão após desmontagem

    const connect = async () => {
      // Sempre rebusca o token a cada (re)conexão — trata expiração de token
      const token = await authAdapter.getAccessToken();
      if (destroyed) return;

      ws = new WebSocket(`${env.VITE_WS_ENDPOINT}?token=${token}&tenantId=${tenantId}`);

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
          // Backoff exponencial limitado em 30s
          reconnectTimer = setTimeout(connect, Math.min(3000 * 2, 30_000));
        }
      };
    };

    connect();

    // Cleanup: fecha socket e cancela reconexão pendente no logout / desmontagem
    return () => {
      destroyed = true;
      if (reconnectTimer) clearTimeout(reconnectTimer);
      ws?.close();
    };
  }, [user?.id]);
};
```

> **Regra:** `useWebSocket` é chamado **apenas uma vez** no `AppShell`. Nunca em componentes individuais.

---

## 13. File Upload (Pre-Signed S3)

Nunca envie arquivos pelo API Gateway.

### Fluxo Ponta a Ponta

```
1. Frontend → POST /v1/uploads/presign
   Body: { filename, contentType, domain, metadata? }

2. Lambda → S3.createPresignedPost()
   Retorna: { uploadUrl, fields, fileId, expiresAt }

3. Frontend → PUT {uploadUrl}  (diretamente para S3, bypassando API Gateway)

4. S3 Event → EventBridge → SQS → Lambda (post-upload-processor)

5. Frontend recebe atualização via WebSocket → invalida cache do domínio
```

### Lambda de Presign

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

### Hook `useFileUpload` (Frontend)

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

## 14. Push Notifications (Web Push)

### Fluxo Ponta a Ponta

```
1. REGISTRO — Frontend → POST /v1/notifications/push-subscription
   Lambda salva { userId, tenantId, subscription } no DynamoDB (TTL 30d)

2. ENTREGA — EventBridge → SQS → Lambda (push-sender) → Web Push API

3. CANCELAMENTO — Frontend → DELETE /v1/notifications/push-subscription
```

### Endpoints Lambda

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

### Hook de Registro (Frontend)

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

## 15. UI Stack

### Stack

| Camada | Tecnologia | Notas |
| --- | --- | --- |
| Primitivos de componentes | **shadcn/ui** (Radix UI) | Instalar via `npx shadcn@latest add <componente>` |
| Estilização | **Tailwind CSS v4** | Único mecanismo de estilização — sem CSS Modules ou CSS puro |
| Ícones | **Lucide React** | Única biblioteca de ícones — sem mistura com outros conjuntos |
| Modo escuro | Variant `dark:` do Tailwind CSS | Toggle define classe `dark` no `<html>`; sem temas paralelos |

### Regras

- **Use componentes shadcn/ui como base para todos os primitivos de UI.** Execute `npx shadcn@latest add <componente>` antes de reconstruir qualquer coisa que já exista no catálogo (Button, Input, Select, Dialog, Sheet, Table, Toast, Badge, Avatar, Skeleton, etc.).
- **Todos os valores visuais vêm de tokens Tailwind.** Nunca use valores arbitrários (`w-[137px]`, `text-[#ff0000]`). Se um token estiver faltando, adicione-o em `tailwind.config.ts` e documente a decisão aqui.
- **Ícones são sempre do Lucide React.** `import { IconName } from 'lucide-react'` — nunca importe de heroicons, react-icons ou outras bibliotecas.
- **Modo escuro é nativo do Tailwind.** A classe `dark` no `<html>` é a única fonte de verdade. Persista a preferência do usuário em `localStorage` via um pequeno hook; nunca implemente uma estratégia separada de variáveis CSS.
- **Localização dos componentes:** a saída do shadcn fica em `src/shared/components/ui/`; compostos customizados em `src/shared/components/`. Nunca espalhe primitivos de UI por pastas de feature.
- **Extensão de componentes shadcn:** use `cva` (class-variance-authority) para novas variantes — nunca codifique strings de classe condicionais diretamente.

### O Que Este Documento Também Define

Este documento define tudo que **não é aparência de UI**:

- Como os componentes recebem dados (hooks, TanStack Query, formato de props)
- Como os componentes comunicam mudanças de estado (mutations, Zustand)
- Em qual arquivo um componente reside (estrutura de feature slice)
- Como roteamento, guards de auth e error boundaries envolvem as páginas
- Como formulários se conectam a serviços de API (React Hook Form + Zod + mutation)
- Estratégia de testes (o que testar, não como o componente aparece)

---

## 16. Server State — TanStack Query

Todo estado de servidor é gerenciado pelo TanStack Query. `useEffect + fetch` é proibido para
dados remotos — sem exceções.

### Query Key Factory — Padrão Obrigatório

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

### Query (leitura)

```typescript
export const use{Feature}Query = (filters: {Feature}Filters) =>
  useQuery({
    queryKey: {feature}Keys.list(filters),
    queryFn:  () => {feature}Service.list(filters),
    staleTime: 5 * 60 * 1000,
    gcTime:    10 * 60 * 1000,
  });
```

### Mutation (escrita)

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

### Configuração Global do Query Client

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

## 17. Client State — Zustand

| ✅ Use Zustand para | ❌ Nunca use Zustand para |
| --- | --- |
| Sessão de auth (userId, roles, tenantId) | Dados de servidor (listas, registros de detalhe) |
| Estado global de UI (sidebar aberta, tema ativo) | Respostas de API em cache |
| Contagem de notificações não lidas | Dados paginados |
| Filtros que sobrevivem à navegação | Estado de formulário (use React Hook Form) |

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

## 18. PWA — Cache Strategy and Offline Behavior

### Estratégias de Cache (Workbox)

| Recurso | Estratégia | Justificativa |
| --- | --- | --- |
| App shell (JS/CSS/HTML) | Cache First | Imutável até que uma nova versão seja instalada |
| Endpoints GET list/detail | Network First (timeout 10s) | Preferir dados frescos; fallback para cache offline |
| GET dados sensíveis (financeiro, auditoria) | Network Only | Nunca servir dados sensíveis desatualizados |
| Assets estáticos (fontes, imagens) | Cache First | Nome do arquivo com hash = imutável |
| Objetos S3 (uploads de usuários) | Stale While Revalidate | Exibição rápida, atualização em segundo plano |
| POST / PATCH / DELETE | Network Only | Mutations nunca são cacheadas |

### Mutations Offline com Idempotência

A chave de idempotência é gerada no **service** (não no hook) para que a mesma chave
viaje com cada retentativa de Background Sync:

```typescript
export const {feature}Service = {
  create: (input: Create{Feature}Input, idempotencyKey = crypto.randomUUID()) =>
    httpClient.post('/v1/{domain}', input, {
      headers: { 'X-Idempotency-Key': idempotencyKey },
    }).then(r => r.data),
};
```

### Atualização do Service Worker

```typescript
// shared/hooks/useServiceWorkerUpdate.ts
export const useServiceWorkerUpdate = () => {
  useRegisterSW({
    onNeedRefresh() {
      // Estilize o UpdateBanner usando shadcn/ui + Tailwind CSS
      toast.info(<UpdateBanner onConfirm={() => updateServiceWorker(true)} />, {
        duration: Infinity,
      });
    },
  });
};
```

---

## 19. Internationalization (i18n)

### Locales Suportados

| Locale | Descrição | Padrão |
| --- | --- | --- |
| `en_US` | Inglês Americano | ✅ Sim |
| `pt_BR` | Português Brasileiro | Não |

### Biblioteca

`i18next` + `react-i18next`. Nenhuma outra biblioteca i18n é permitida.

### Algoritmo de Detecção

O app resolve o locale ativo na inicialização nesta ordem:

1. **Preferência do usuário** — lida do perfil do usuário autenticado (atributo Cognito `custom:locale`). Se o valor for um locale suportado (`en_US` ou `pt_BR`), use-o imediatamente.
2. **Modo automático** — se a preferência for `auto` ou ausente, itere `navigator.languages`, normalize cada tag (ex.: `pt-BR` → `pt_BR`, `en-US` → `en_US`) e retorne a primeira correspondência com a lista de locales suportados.
3. **Fallback** — `en_US` se nenhuma língua do browser corresponder a um locale suportado.

O usuário nunca vê um locale que não escolheu ou que o browser não sinalizou. A detecção ocorre uma vez na inicialização; mudanças de locale durante uma sessão exigem ação explícita do usuário.

### Armazenamento de Preferência do Usuário

| Camada | Valor | Notas |
| --- | --- | --- |
| Atributo customizado Cognito | `custom:locale` (`en_US` \| `pt_BR` \| `auto`) | Fonte de verdade entre dispositivos |
| Store Zustand persistido | `userPreferences.locale` | Sincronizado do Cognito no login; usado offline |
| `localStorage` | `i18nextLng` (definido pelo i18next) | Cache de warm-start apenas — nunca lido diretamente no código do app |

A preferência de locale é atualizada apenas quando o usuário explicitamente a altera na tela de preferências. Nunca é inferida ou sobrescrita silenciosamente após o usuário tê-la definido.

### Estrutura de Arquivos

```
src/i18n/
├── index.ts            # Init i18next, configuração do detector
└── locales/
    ├── en_US.json      # canônico — todas as chaves devem ser definidas aqui
    └── pt_BR.json      # deve espelhar exatamente a estrutura de chaves do en_US; sem chaves extras
```

### Contrato de Init i18next

```typescript
// src/i18n/index.ts
i18next
  .use(LanguageDetector)   // lê store Zustand, depois navigator.languages
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

O `LanguageDetector` customizado deve implementar o algoritmo de detecção definido acima (preferência → auto/browser → fallback).

### Anti-Padrões (Proibidos)

| Anti-Padrão | Por Que É Proibido |
| --- | --- |
| Hardcoding de qualquer string visível ao usuário em JSX ou lógica | Bypassa tradução; quebra usuários pt_BR |
| Chamar `navigator.language` diretamente no código da aplicação | Sempre use `useTranslation()` — detecção centralizada em `src/i18n/index.ts` |
| Ler `localStorage.i18nextLng` diretamente no código da aplicação | Essa chave é um cache interno do i18next, não a preferência do usuário |
| Adicionar chave em `pt_BR.json` que não existe em `en_US.json` | `en_US` é a fonte canônica; chaves órfãs em outros locales criam dívida de manutenção |
| Omitir chave do `pt_BR.json` que existe em `en_US.json` | Faz fallback silencioso para inglês — usuários veem UI com línguas misturadas |
| Usar formato de locale `en-US`, `en`, `pt`, `pt-br` em qualquer lugar no código | Os únicos formatos aceitos são `en_US` e `pt_BR` (separador underline) |
| Armazenar preferência de locale fora de `custom:locale` | Fonte única de verdade — não duplique em outros atributos Cognito ou DynamoDB |
| Alterar o locale sem persistir em `custom:locale` | Preferência seria resetada no próximo login |

---

## 20. Observability

### Backend — Lambda Powertools (Obrigatório em Cada Lambda)

```typescript
const logger  = new Logger({ serviceName: '{domain}' });
const metrics = new Metrics({ namespace: '{Project}/{Domain}' });
const tracer  = new Tracer({ serviceName: '{domain}' });

export const handler = middy(mainHandler)
  .use(injectLambdaContext(logger))
  .use(captureLambdaHandler(tracer))
  .use(logMetrics(metrics));
```

Cada entrada de log deve incluir: `level`, `message`, `requestId`, `traceId`, `service`,
`tenantId`, `timestamp`. Nunca registre: tokens JWT, senhas, dados de cartão, PII sensível.

### Alarmes por Lambda (Obrigatório)

| Métrica | Threshold | Ação |
| --- | --- | --- |
| `Errors` | > 1% em 5 min | SNS → plantão |
| `Throttles` | > 0 | SNS → plantão |
| `Duration` | > 80% do timeout configurado | SNS → aviso |
| DLQ `NumberOfMessagesVisible` | > 0 | SNS → plantão |

### Frontend — Error Boundary com Correlação

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

## 21. Infrastructure as Code — CDK Outputs → Frontend

Nenhuma URL é codificada diretamente em nenhum lugar do repositório.

### CDK — Exportar para Parameter Store

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

### CodeBuild — Consumir no Build do Frontend

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
        VITE_API_BASE_URL=$API_URL VITE_WS_ENDPOINT=$WS_URL
        VITE_COGNITO_USER_POOL_ID=$POOL_ID VITE_COGNITO_CLIENT_ID=$CLIENT_ID
        npm run build
  post_build:
    commands:
      - aws s3 sync dist/ s3://{project}-frontend-$ENV/ --delete
      - aws cloudfront create-invalidation --distribution-id $CF_DIST_ID --paths "/*"
```

---

## 22. Unified CI/CD Pipeline

O frontend nunca vai para produção antes que o backend correspondente esteja saudável.

```
FONTE
  Push para `develop` ou `main`
        │
        ▼
BUILD PARALELO
  ├── Backend: lint + testes + CDK synth
  └── Frontend: lint + testes + Vite build
        │
        ▼
BACKEND STAGING
  CDK deploy → smoke tests
        │  (prossegue apenas se ✅)
        ▼
FRONTEND STAGING
  CodeBuild lê SSM de staging → build → S3 + invalidação CloudFront
        │
        ▼
E2E PLAYWRIGHT
  Frontend + Backend juntos em staging
  Cobre: login, CRUD, upload, tempo real, push, logout
        │  (prossegue apenas se ✅)
        ▼
APROVAÇÃO MANUAL
        │
        ▼
BACKEND PROD
  CDK deploy → health check 5 min
        │  (prossegue apenas se ✅)
        ▼
FRONTEND PROD
  CodeBuild lê SSM de prod → build → S3 + invalidação CloudFront
```

---

## 23. New Feature Checklist (Frontend + Backend)

### Backend
- [ ] Adicionar linha na tabela de mapeamento (Seção 5) com domínio, caminho e armazenamento
- [ ] Criar CDK Stack com IAM de menor privilégio por Lambda
- [ ] Implementar arquitetura hexagonal (domain → application → infrastructure)
- [ ] Definir rotas HTTP API com Cognito Authorizer + Lambda Authorizer de tenant
- [ ] Extrair `tenantId` do contexto do authorizer — nunca diretamente do header
- [ ] Usar `TENANT#{tenantId}` na partition key do DynamoDB em cada acesso
- [ ] Retornar respostas seguindo o contrato de API (Seção 6)
- [ ] Incluir `requestId` (`context.awsRequestId`) nos envelopes de erro
- [ ] Publicar evento de domínio no EventBridge com entrada no Schema Registry
- [ ] Criar SQS + DLQ para todos os consumidores assíncronos
- [ ] Definir timeout da Lambda explicitamente — use a tabela de referência na Seção 10
- [ ] Habilitar rastreamento ativo X-Ray na Lambda e no stage API Gateway
- [ ] Configurar logs estruturados com Lambda Powertools Logger (via middy)
- [ ] Emitir métricas de negócio com Lambda Powertools Metrics (EMF, via middy)
- [ ] Criar CloudWatch Alarms para erros, throttles e latência
- [ ] Exportar URLs de endpoints para SSM se o frontend precisar deles
- [ ] Aplicar Lambda Powertools Idempotency com `X-Idempotency-Key` para POST/PUT/PATCH em handlers API Gateway
- [ ] Para Lambdas consumidoras de SQS: use `eventId` do EventBridge como chave de idempotência, não `X-Idempotency-Key`
- [ ] Se atomicidade entre entidades for necessária: usar `TransactWriteItems` (até 100 itens)
- [ ] Se domínio precisa de reações a mudanças (auditoria, projeções): habilitar DynamoDB Streams na tabela
- [ ] Se domínio precisa de agregações ou relatórios: projetar o caminho de export S3 e consulta Athena

### Frontend
- [ ] Adicionar linha na tabela de mapeamento (Seção 5)
- [ ] Criar feature slice em `src/features/{feature}/` com estrutura completa
- [ ] Definir schema Zod + tipos TypeScript inferidos
- [ ] Implementar service com caminho `/v1/{domain}/...` (sem prefixo `/api/`)
- [ ] Implementar query key factory (sem strings hardcoded)
- [ ] Implementar hooks TanStack Query (query + mutation) — nunca `useEffect + fetch`
- [ ] Gerar `X-Idempotency-Key` no service — não no hook
- [ ] Registrar rotas lazy-loaded com `React.lazy` + `Suspense` + `ErrorBoundary`
- [ ] Construir página e componentes de feature usando **shadcn/ui** — executar `npx shadcn@latest add <componente>` antes de reconstruir qualquer primitivo existente
- [ ] Não usar valores arbitrários Tailwind — todas as cores, espaçamentos e radii de tokens `tailwind.config.ts`
- [ ] Verificar navegação por teclado e conformidade ARIA — primitivos Radix UI cobrem a maioria dos contratos; validar com axe-core
- [ ] Escrever teste de integração RTL cobrindo o fluxo principal de dados (não aparência visual)
- [ ] Escrever teste E2E Playwright para o caminho feliz
- [ ] Verificar comportamento offline com dados em cache
- [ ] Se eventos em tempo real: confirmar que `useWebSocket` invalida `queryKey: ['{domain}']`
- [ ] Se upload de arquivo: usar hook `useFileUpload` — nunca POST de arquivo pelo API Gateway
- [ ] Exportar apenas API pública via `index.ts` — sem imports internos entre features

---

## 24. Anti-Patterns (Forbidden — Both Sides)

### Backend

| Anti-Padrão | Por Que É Proibido |
| --- | --- |
| Ler `tenantId` do header `x-tenant-id` no handler Lambda | Facilmente forjado — sempre use o contexto do authorizer |
| DynamoDB sem `TENANT#` na partition key | Dados de tenant se misturam silenciosamente entre tenants |
| Lambda sem DLQ em um trigger assíncrono | Falhas desaparecem sem visibilidade |
| Lambda usando o timeout padrão AWS (3s) | Sempre defina explicitamente — use a tabela de referência na Seção 10 |
| Segredos armazenados em variáveis de ambiente Lambda | Visíveis no console AWS — sempre use Secrets Manager |
| IAM com wildcard (`*`) em ações sensíveis | Sempre escope para ARNs específicos de tabela/bucket |
| Cadeia síncrona Lambda-a-Lambda (A→B→C) | Use Step Functions ou EventBridge/SQS |
| ARNs ou URLs de API hardcoded | Sempre via variáveis de ambiente ou saídas CDK |
| Mudança manual no console AWS | Tudo via CDK — sem exceções em staging/prod |
| Publicar evento sem entrada no Schema Registry | Contratos de evento devem ser explícitos e versionados |
| Usar `X-Idempotency-Key` como chave de idempotência em consumidores SQS | Consumidores SQS nunca recebem esse header — use `eventId` do EventBridge |
| Executar consultas de agregação diretamente em tabela DynamoDB | Agregações vão para Athena sobre exports S3 — nunca escaneie a tabela primária |
| Escrever no DynamoDB dentro de um consumidor DynamoDB Streams da mesma tabela | Cria loop infinito de trigger — escreva em tabela diferente ou publique no EventBridge |

### Frontend — Engenharia

| Anti-Padrão | Por Que É Proibido |
| --- | --- |
| `useEffect + useState + fetch` para dados de servidor | Sempre TanStack Query — sem exceções |
| Ler `requestId` do header de resposta HTTP | Leia de `error.response.data.error.requestId` (corpo) |
| Enviar arquivo diretamente pelo API Gateway | Use hook `useFileUpload` (S3 pre-signed) |
| Cache PWA para dados sensíveis (financeiro, auditoria) | `NetworkOnly` obrigatório — nunca servir desatualizado |
| `X-Idempotency-Key` gerado no hook | Gerar no service para que a chave viaje com retentativas |
| Importar uma feature dentro de outra feature | Use router, Zustand ou eventos — nunca import direto |
| Chamar `useWebSocket` em múltiplos componentes | Uma vez no `AppShell`, distribuído via cache TanStack Query |
| Hardcoding de URLs em `.env.production` | Valores sempre vêm do SSM via CodeBuild |
| Imports de Amplify fora de `shared/auth/` | Encapsule completamente dentro do adapter de auth |
| Refresh token expirado sem redirect para `/login` | Interceptor deve capturar, limpar store e redirecionar |
| Rotas sem `ErrorBoundary` + `Suspense` | Toda rota lazy precisa de ambos os fallbacks |

### Frontend — Violações da Stack de UI

| Anti-Padrão | Por Que É Proibido |
| --- | --- |
| Usar valores arbitrários Tailwind (`w-[137px]`, `text-[#ff0000]`) | Todos os valores devem vir de tokens `tailwind.config.ts` — valores arbitrários criam drift |
| Adicionar CSS Modules ou arquivos `.css` para estilização de componentes | Tailwind CSS é o único mecanismo de estilização; sistemas paralelos divergem |
| Reconstruir componente já presente no catálogo shadcn/ui | Execute `npx shadcn@latest add <componente>` — nunca reconstrua Button, Input, Dialog, etc. |
| Importar ícones de qualquer biblioteca além de Lucide React | Um único conjunto de ícones mantém consistência visual e de bundle |
| Implementar modo escuro fora da estratégia de classe `dark:` do Tailwind | A classe `dark` no `<html>` é a única fonte de verdade para temas |
| Sobrescrever estilos de componentes shadcn com estilos inline ou `!important` | Estenda via variantes `cva` no arquivo do componente — nunca patches externos |
| Adicionar tokens em `theme.extend` sem documentá-los aqui | Adições de tokens devem ser registradas neste documento para permanecerem descobríveis |

---

## 25. Versioning Strategy

Este projeto usa um **modelo de versionamento de três camadas**. Cada camada tem um propósito distinto e um responsável distinto. Não as confunda.

### Camada 1 — Versão do Produto (SemVer)

Uma única versão SemVer representa um release coordenado de todos os componentes do monorepo (frontend, todos os domínios Lambda, infraestrutura). É a versão que o usuário vê, que o changelog referencia e que a CI/CD valida.

| Onde | Função |
| --- | --- |
| `docs/project-definition.md` — campo `Base version` | **Fonte única de verdade** — altere isso primeiro |
| `{project}-web/package.json` — campo `version` | Cópia propagada — deve permanecer em sincronia |
| `{domain}-lambda/package.json` — campo `version` (quando criado) | Cópia propagada — deve permanecer em sincronia |
| `CHANGELOG.md` | Histórico de releases legível por humanos |
| Tag git `vX.Y.Z` | Artefato de release imutável — pipelines CI/CD validam isso |

#### Regras de Bump

| Tipo de mudança | Bump | Exemplos |
| --- | --- | --- |
| Breaking change de contrato de API, migração de schema destrutiva | **Major** (`2.0.0`) | Remover campo do envelope da API, alterar padrão de PK |
| Nova feature visível ao usuário, novo domínio Lambda, nova rota de API | **Minor** (`1.1.0`) | Novo feature slice, novo caminho `/v1/{domain}` |
| Correção de bug, ajuste de config, refactor sem impacto externo | **Patch** (`1.0.1`) | Corrigir resposta Lambda, ajustar token Tailwind |

### Camada 2 — Versão do Contrato de API

O prefixo de API HTTP (`/v1/`, `/v2/`) desacopla o frontend de breaking changes no backend sem exigir bump de versão do produto. Um novo prefixo é criado apenas quando um contrato existente deve mudar de forma breaking enquanto o contrato antigo deve permanecer ativo para clientes existentes.

- Todas as rotas começam em `/v1/` (veja Seção 5).
- Um prefixo `/v2/` é introduzido apenas quando uma breaking change de contrato é necessária e a compatibilidade com versões anteriores deve ser preservada durante a migração.
- O prefixo **não** é SemVer — é um inteiro que incrementa independentemente.

### Camada 3 — Versão de Deploy

Controla qual código está rodando na AWS em determinado momento, sem overhead SemVer por função.

| Mecanismo | Propósito |
| --- | --- |
| Aliases Lambda `LIVE` / `STAGING` | Apontam para uma versão Lambda publicada; rollback instantâneo atualizando o alias |
| Número de versão Lambda | Snapshot imutável criado pelo CDK em cada deploy — usado apenas como alvo de alias |
| Hash do build frontend (`VITE_APP_VERSION`) | Commit SHA injetado pelo CodeBuild — exibido no rastreamento de erros (Sentry) e header `X-App-Version` |

`VITE_APP_VERSION` é injetado durante a etapa de build frontend do CodeBuild e nunca é hardcoded no repositório.

### Fluxo de Bump de Versão

O procedimento passo a passo de release é definido em `CLAUDE.md` sob **Versioning Policy**. A tag git `vX.Y.Z` é o marcador canônico de release; pipelines CI/CD o utilizam como referência.

---

## 26. Cost Reference

> **Preços obtidos das páginas públicas de pricing da AWS — Maio 2026, região us-east-1.**
> Todos os valores em USD. Os preços podem mudar; verifique em [aws.amazon.com/pricing](https://aws.amazon.com/pricing) antes de planejar orçamentos.
> Limites de free tier marcados como **Always Free** são permanentes. Os marcados como **Free Tier 12 meses** aplicam-se apenas a novas contas AWS no primeiro ano.

### 26.1 Visão Geral do Modelo de Custos

Esta arquitetura é inteiramente pay-per-use. Não há instâncias reservadas, servidores por hora nem taxas mínimas. O modelo de custo tem três zonas:

| Zona | Descrição |
| --- | --- |
| **Custo zero** | Uso permanece dentro do free tier always-free de cada serviço |
| **Buffer free tier** | Uso cresce mas permanece dentro do free tier de 12 meses para novas contas |
| **Cobrado** | Qualquer serviço excede o limite do free tier no mês de cobrança |

**Para um projeto novo com zero usuários, a fatura mensal AWS é $0.** Os free tiers de Lambda, DynamoDB, Cognito, S3, CloudFront, SQS, CloudWatch e X-Ray são generosos o suficiente para sustentar um projeto do lançamento até um volume significativo de usuários sem gerar cobranças.

---

### 26.2 AWS Lambda

> Pricing: [aws.amazon.com/lambda/pricing](https://aws.amazon.com/lambda/pricing/)

**Modelo de cobrança:** cobrado em duas dimensões — número de invocações e duração de computação (memória × tempo).

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Requisições | 1.000.000 / mês | $0,20 por milhão | Always Free |
| Duração | 400.000 GB-segundos / mês | $0,0000166667 por GB-segundo | Always Free |

**Cálculo de duração:** `(memória em MB / 1024) × tempo de execução em segundos`. Uma função de 512 MB rodando por 200 ms = 0,1 GB-segundo. A duração é arredondada para o ms mais próximo.

**Quando a cobrança começa:** após a 1.000.000ª invocação ou o 400.000° GB-segundo no mês — o que for excedido primeiro.

**Escala prática:** um handler CRUD típico (512 MB, ~100 ms em média) custa aproximadamente **$0 até ~8 milhões de requisições/mês** dentro do free tier. Após isso, 10 milhões de requisições custam aproximadamente **$1,80/mês** em taxas de requisição mais taxas de duração.

**Dica:** execute em ARM (Graviton2) — mesmo preço por GB-segundo, até 34 % melhor desempenho por dólar devido a ganhos de eficiência.

---

### 26.3 Amazon DynamoDB

> Pricing: [aws.amazon.com/dynamodb/pricing/on-demand](https://aws.amazon.com/dynamodb/pricing/on-demand/)

**Modelo de cobrança (modo on-demand):** cobrado por unidade de leitura e escrita consumida, mais armazenamento.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Write Request Units (WRU) | 25 WCU/mês (≈ 2,16 M escritas/dia) | $0,625 por milhão de WRUs | Always Free |
| Read Request Units (RRU) | 25 RCU/mês | $0,125 por milhão de RRUs | Always Free |
| Armazenamento | 25 GB / mês | $0,25 por GB (Standard) | Always Free |
| Leituras DynamoDB Streams | 2.500.000 leituras / mês | $0,02 por 100.000 leituras | Always Free |

**Consumo de unidades de requisição:**
- Escrita padrão: 1 WRU por 1 KB (ou fração)
- Escrita transacional: 2 WRUs por 1 KB
- Leitura eventualmente consistente: 0,5 RRU por 4 KB
- Leitura fortemente consistente: 1 RRU por 4 KB
- Leitura transacional: 2 RRUs por 4 KB

**Quando a cobrança começa:** quando as escritas mensais excedem o budget de WCU do free tier ou as leituras excedem o de RCU. O free tier é permanentemente disponível — não expira.

**Dica:** o free tier é por conta AWS, não por tabela. Distribuir carga entre múltiplas tabelas não aumenta a franquia gratuita.

---

### 26.4 Amazon API Gateway

> Pricing: [aws.amazon.com/api-gateway/pricing](https://aws.amazon.com/api-gateway/pricing/)

Esta arquitetura usa dois tipos de API Gateway: **HTTP API** (endpoints REST) e **WebSocket API** (canal em tempo real).

#### HTTP API

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Chamadas de API | 1.000.000 / mês | $1,00 por milhão (primeiros 300M), depois $0,90/M | Free Tier 12 meses |
| Data transfer out | — | $0,09 por GB | — |

> HTTP API é **3,5× mais barato** que REST API ($1,00 vs $3,50 por milhão de chamadas). Sempre use HTTP API em novos projetos.

#### WebSocket API

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Mensagens | 1.000.000 / mês | $1,00 por milhão | Free Tier 12 meses |
| Minutos de conexão | 750.000 / mês | $0,25 por milhão de minutos | Free Tier 12 meses |

Mensagens são medidas em chunks de 32 KB (uma mensagem de 96 KB = 3 mensagens).

**Quando a cobrança começa:** após o free tier de 12 meses expirar para novas contas, ou imediatamente para contas existentes. A $1,00/M, 10 milhões de chamadas HTTP API custam **$10/mês**.

---

### 26.5 Amazon Cognito

> Pricing: [aws.amazon.com/cognito/pricing](https://aws.amazon.com/cognito/pricing/)

**Modelo de cobrança:** cobrado por Usuário Ativo Mensal (MAU). Um MAU é um usuário que realiza qualquer operação de identidade (cadastro, login, logout, refresh de token, alteração de senha, atualização de atributo) ao menos uma vez no mês. Sessões subsequentes no mesmo mês não são refaturadas.

| Tier | MAUs gratuitos / mês | Preço por MAU (acima do free tier) | Tipo |
| --- | --- | --- | --- |
| Lite / Essentials (login direto) | 10.000 | $0,0055 (primeiros 90K acima do free) → $0,0046 | Always Free |
| Federação SAML 2.0 / OIDC | 50 | $0,015 | Always Free |
| Cognito Identity Pools | Ilimitado | $0,00 | Always Free |

**Quando a cobrança começa:** quando os usuários ativos no mês excedem 10.000 (login direto). O 10.001º MAU custa $0,0055.

**Escala prática:**
- 0–10.000 MAU → **$0/mês**
- 10.000–100.000 MAU → ~**$0,50–$4,95/mês**
- 100.000–1.000.000 MAU → ~**$4,95–$45/mês**

---

### 26.6 Amazon S3

> Pricing: [aws.amazon.com/s3/pricing](https://aws.amazon.com/s3/pricing/)

**Modelo de cobrança:** cobrado em volume de armazenamento, requisições de API e transferência de dados de saída.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Armazenamento (S3 Standard) | 5 GB / mês | $0,023 por GB | Free Tier 12 meses |
| Requisições PUT / COPY / POST | 2.000 / mês | $0,005 por 1.000 | Free Tier 12 meses |
| Requisições GET / SELECT | 20.000 / mês | $0,0004 por 1.000 | Free Tier 12 meses |
| Requisições DELETE | — | Gratuito | — |
| Transferência de dados para internet | 100 GB / mês (agregado) | $0,09 por GB | Always Free |
| Transferência de dados para CloudFront | — | Gratuito | — |

**Quando a cobrança começa:** quando o armazenamento excede 5 GB ou as contagens de requisição excedem os limites gratuitos (para novas contas no primeiro ano). A transferência de dados para CloudFront é sempre gratuita — todos os downloads de usuários devem passar pelo CloudFront, não por URLs diretas do S3.

**Dica:** nunca exponha URLs de bucket S3 diretamente para usuários. Sirva assets via CloudFront — isso elimina cobranças de transferência de dados do S3 e adiciona cache CDN.

---

### 26.7 Amazon CloudFront

> Pricing: [aws.amazon.com/cloudfront/pricing](https://aws.amazon.com/cloudfront/pricing/)

**Modelo de cobrança:** cobrado em dados transferidos para a internet e número de requisições HTTPS.

| Dimensão | Free Tier | Preço Após Free Tier (EUA/Europa) | Tipo |
| --- | --- | --- | --- |
| Transferência de dados de saída | 1 TB / mês | $0,085/GB (próximos 9 TB), $0,080/GB (próximos 40 TB) | Always Free |
| Requisições HTTPS | 10.000.000 / mês | $0,0100 por 10.000 requisições | Always Free |
| CloudFront Functions | 2.000.000 invocações / mês | $0,10 por milhão | Always Free |

**Quando a cobrança começa:** após 1 TB de egress mensal ou 10 milhões de requisições. Para um app SaaS típico servindo um React PWA (~2 MB gzipado) para 10.000 usuários/mês, a transferência de dados é aproximadamente 20 GB — bem dentro do free tier.

**Dica:** CloudFront tem um dos free tiers always-free mais generosos da AWS. O egress gratuito de 1 TB/mês cobre a grande maioria dos produtos SaaS em estágio inicial sem custo.

---

### 26.8 Amazon SQS

> Pricing: [aws.amazon.com/sqs/pricing](https://aws.amazon.com/sqs/pricing/)

**Modelo de cobrança:** cobrado por requisição de API. Cada chamada `Send`, `Receive`, `Delete` ou `ChangeMessageVisibility` conta como uma requisição. Payloads maiores que 64 KB são cobrados em chunks de 64 KB.

| Tipo de Fila | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Standard Queue | 1.000.000 requisições / mês | $0,40 por milhão de requisições | Always Free |
| FIFO Queue | 1.000.000 requisições / mês | $0,50 por milhão de requisições | Always Free |

**Quando a cobrança começa:** após a 1.000.000ª requisição no mês. Para o padrão assíncrono desta arquitetura (filas de notificador, e-mail, push, auditoria), cada ação do usuário gera aproximadamente 3–5 requisições SQS. Com 10.000 usuários ativos/dia, as requisições SQS mensais ficam dentro do free tier.

---

### 26.9 Amazon EventBridge

> Pricing: [aws.amazon.com/eventbridge/pricing](https://aws.amazon.com/eventbridge/pricing/)

**Modelo de cobrança:** cobrado por evento customizado publicado em um barramento customizado. Eventos são medidos em chunks de 64 KB.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Eventos customizados publicados | Nenhum | $1,00 por milhão de eventos | — |
| Entrega para serviços na mesma conta | — | Gratuito | — |
| Eventos de serviços AWS (management) | — | Gratuito | — |

**Quando a cobrança começa:** imediatamente ao publicar o primeiro evento customizado. Não há free tier para eventos customizados — cada evento é cobrado.

**Impacto prático:** a 1 evento por ação do usuário e 100.000 ações/mês, o custo é **$0,10/mês**. EventBridge é um dos serviços de menor custo desta stack.

**Dica:** mantenha payloads de eventos abaixo de 64 KB para evitar cobrança multi-chunk. O schema obrigatório definido na Seção 11 (eventId, source, detailType, entityId, tenantId, userId, timestamp, metadata) cabe confortavelmente em 1 KB.

---

### 26.10 Amazon SNS

> Pricing: [aws.amazon.com/sns/pricing](https://aws.amazon.com/sns/pricing/)

**Modelo de cobrança:** cobrado por requisição de API e por entrega de notificação. Notificações push mobile (APNs iOS, FCM Android) são gratuitas para entrega.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Requisições de API | 1.000.000 / mês | $0,50 por milhão de requisições | Always Free |
| Entrega push mobile (APNs, FCM) | — | Gratuito | — |
| Entrega HTTP/HTTPS | — | $0,60 por milhão de entregas | — |
| Entrega por e-mail | — | $2,00 por 100.000 entregas | — |

**Quando a cobrança começa:** após 1 milhão de requisições de API por mês. No padrão de fan-out usado aqui (EventBridge → SQS → Lambda), o SNS é usado principalmente para notificações de alarme — volume é negligenciável.

---

### 26.11 Amazon CloudWatch

> Pricing: [aws.amazon.com/cloudwatch/pricing](https://aws.amazon.com/cloudwatch/pricing/)

**Modelo de cobrança:** cobrado por GB de log ingerido, por métrica customizada, por alarme e por dashboard.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Ingestão de logs | 5 GB / mês | $0,50 por GB | Always Free |
| Armazenamento de logs (arquivo) | 5 GB / mês | $0,03 por GB / mês | Always Free |
| Métricas customizadas | 10 métricas / mês | $0,30 por métrica (primeiros 10K) → $0,10 → $0,05 | Always Free |
| Requisições de API | 1.000.000 / mês | $0,01 por 1.000 requisições | Always Free |
| Alarmes (resolução padrão) | 10 alarmes / mês | $0,10 por métrica por alarme | Always Free |
| Dashboards | 3 dashboards / mês | $3,00 por dashboard adicional | Always Free |

**Quando a cobrança começa:** quando qualquer dimensão excede sua cota gratuita no mês.

**Impacto prático:** logs estruturados do Lambda Powertools (Seção 20) têm em média ~1–2 KB por invocação. Com 1 milhão de invocações Lambda/mês, a ingestão de logs é ~1–2 GB — dentro do free tier de 5 GB. O principal driver de custo em escala são as **métricas customizadas**, não os logs.

**Dica:** métricas EMF do Lambda Powertools (Seção 20) criam uma métrica CloudWatch por nome de métrica por função Lambda. Com 4 alarmes obrigatórios por Lambda (erros, throttles, duração, DLQ) × N funções Lambda, planeje `4N` métricas. A $0,30/métrica, mantenha o número de funções Lambda enxuto nas fases iniciais.

---

### 26.12 AWS X-Ray

> Pricing: [aws.amazon.com/xray/pricing](https://aws.amazon.com/xray/pricing/)

**Modelo de cobrança:** cobrado por trace registrado e por trace recuperado/escaneado.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Traces registrados | 100.000 / mês | $5,00 por milhão de traces | Always Free |
| Traces recuperados / escaneados | 1.000.000 / mês | $0,50 por milhão de traces | Always Free |

**Quando a cobrança começa:** após 100.000 traces registrados ou 1.000.000 traces recuperados no mês.

**Dica:** regras de amostragem do X-Ray controlam que fração das requisições é rastreada. A taxa de amostragem padrão é 1 requisição/segundo + 5 % das requisições adicionais. Para a maioria das aplicações SaaS, isso mantém os traces registrados bem dentro do free tier. Não defina amostragem em 100 % em produção sem análise de orçamento.

---

### 26.13 AWS Secrets Manager

> Pricing: [aws.amazon.com/secrets-manager/pricing](https://aws.amazon.com/secrets-manager/pricing/)

**Modelo de cobrança:** cobrado por segredo armazenado por mês e por chamada de API.

| Dimensão | Free Tier | Preço | Observações |
| --- | --- | --- | --- |
| Segredos armazenados | Nenhum (permanente) | $0,40 por segredo / mês | Cobrança começa no dia 1 |
| Chamadas de API | Nenhum (permanente) | $0,05 por 10.000 chamadas | — |

**Quando a cobrança começa:** imediatamente ao criar o primeiro segredo. A $0,40/segredo/mês, um projeto com 10 segredos custa **$4,00/mês**.

**Nota arquitetural:** Priorize Secrets Manager para credenciais de banco de dados, chaves de API de terceiros e chaves de assinatura. Introduza-o antes do lançamento para evitar gerenciar segredos manualmente na camada de aplicação.

**Dica:** funções Lambda fazem cache de respostas do Secrets Manager em memória entre invocações warm. Uma única chamada `getSecretValue` por warm-start da Lambda amortiza o custo de API para quase zero.

---

### 26.14 AWS SSM Parameter Store

> Pricing: [aws.amazon.com/systems-manager/pricing](https://aws.amazon.com/systems-manager/pricing/)

**Modelo de cobrança:** parâmetros padrão e chamadas de API de throughput padrão são permanentemente gratuitos.

| Dimensão | Free Tier | Preço Após Free Tier | Tipo |
| --- | --- | --- | --- |
| Parâmetros padrão (≤ 4 KB) | Ilimitado | Gratuito | Always Free |
| Chamadas de API throughput padrão | Ilimitado | Gratuito | Always Free |
| Chamadas de API throughput elevado | — | $0,05 por 10.000 interações | — |
| Parâmetros avançados (> 4 KB) | — | $0,05 por parâmetro / mês | — |

**Quando a cobrança começa:** nunca para parâmetros padrão em throughput padrão. Throughput elevado (> 40 transações/segundo por conta-região) gera cobranças.

**Uso nesta arquitetura:** o CDK exporta URLs de infraestrutura (API Gateway, Cognito, WebSocket) para o Parameter Store no deploy. O CodeBuild as lê no momento do build. Ambas são operações pouco frequentes e de baixo throughput — **custo é $0**.

---

### 26.15 Amazon Athena

> Pricing: [aws.amazon.com/athena/pricing](https://aws.amazon.com/athena/pricing/)

**Modelo de cobrança:** cobrado por TB de dados escaneados por consulta SQL. Consultas com falha não são cobradas.

| Dimensão | Free Tier | Preço | Observações |
| --- | --- | --- | --- |
| Consultas SQL | Nenhum | $5,00 por TB escaneado | Cobrado por consulta |
| Escaneamento mínimo | Nenhum (SQL) | Sem mínimo | — |

**Quando a cobrança começa:** na primeira consulta. Não há free tier.

**Otimização de custo — crítica:**

| Técnica | Efeito no Custo | Implementação |
| --- | --- | --- |
| Particionamento por data/tenant | Até 99 % de redução | Exportar dados para `s3://.../year=YYYY/month=MM/` |
| Compressão com GZIP / Snappy | ~3× de redução | Habilitar compressão no exportador de DynamoDB Streams |
| Formato colunar (Parquet) | ~4× de redução | Converter exports JSON para Parquet via Glue ou Lambda |
| Combinado (partição + compressão + Parquet) | Até ~12× de redução | Padrão para qualquer caminho de analytics em produção |

**Impacto prático:** sem otimização, escanear 1 TB/consulta a $5,00/TB torna o Athena caro. Com particionamento e Parquet, a mesma consulta analítica pode escanear apenas 10–50 GB — reduzindo o custo para $0,05–$0,25 por consulta. Sempre implemente particionamento antes de habilitar Athena em produção.

---

### 26.16 Tabela Resumo de Custos

A tabela abaixo mostra o **teto mensal do free tier** — o nível de uso aproximado no qual o primeiro dólar AWS é cobrado em um projeto greenfield.

| Serviço | Gatilho de Cobrança | Gratuito Até | Observações |
| --- | --- | --- | --- |
| Lambda | > 1M invocações OU > 400K GB-s / mês | ~8M req/mês com 512 MB / 100 ms médio | Always Free |
| DynamoDB | > budget de WCU/RCU ou > 25 GB de armazenamento | Milhões de leituras/escritas por dia | Always Free |
| API Gateway HTTP | > 1M chamadas / mês | 1M chamadas/mês | 12 meses apenas |
| API Gateway WebSocket | > 1M mensagens / mês | 1M mensagens/mês | 12 meses apenas |
| Cognito | > 10.000 MAU / mês | 10K usuários ativos mensais | Always Free |
| S3 | > 5 GB armazenamento ou limites de PUT/GET | ~2.500 uploads de arquivo / mês | 12 meses apenas |
| CloudFront | > 1 TB egress ou > 10M requisições / mês | ~500K carregamentos de página / mês | Always Free |
| SQS | > 1M requisições / mês | ~200K ações de usuário / dia | Always Free |
| EventBridge | Primeiro evento customizado publicado | $0 — sem free tier | Cobrado desde o dia 1 |
| SNS | > 1M requisições de API / mês | Alto volume de notificações de alarme | Always Free |
| CloudWatch Logs | > 5 GB ingeridos / mês | ~1M invocações Lambda / mês | Always Free |
| CloudWatch Metrics | > 10 métricas customizadas / mês | 2–3 funções Lambda totalmente alarmadas | Always Free |
| X-Ray | > 100K traces registrados / mês | Maioria dos apps na taxa de amostragem padrão | Always Free |
| Secrets Manager | Primeiro segredo criado | $0 — sem free tier | $0,40/segredo/mês |
| SSM Parameter Store | Nunca (padrão) | Ilimitado | Always Free |
| Athena | Primeira consulta | $0 — sem free tier | $5,00/TB escaneado |

> **Insight principal:** EventBridge, Secrets Manager e Athena **não têm free tier** — geram custos desde o primeiro uso. Orçamente explicitamente para esses serviços. Todos os outros serviços desta arquitetura possuem free tiers significativos que cobrem o uso de produtos em estágio inicial.
