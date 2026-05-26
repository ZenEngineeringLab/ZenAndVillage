# Visão de Software: Plataforma ZenAndVillage

> **Versão pt_BR.** Este documento é a tradução em Português Brasileiro (pt_BR) de [`software-vision.md`](software-vision.md).
> Toda edição feita em `software-vision.md` deve ser refletida neste arquivo, e vice-versa.
> Em caso de conflito de conteúdo, a versão em inglês (`software-vision.md`) é a canônica.
> Este documento segue a metodologia DDD (Domain-Driven Design): cada seção a partir da Seção 4 representa um bounded context com seus próprios agregados, entidades e regras de negócio.
> Para conhecimento de domínio condominial, consulte [`knowledge-base.pt_BR.md`](knowledge-base.pt_BR.md).
> Para decisões técnicas de implementação, consulte [`architecture-guide.md`](architecture-guide.md).

---

## Índice

1. [Visão do Produto](#1-visão-do-produto)
2. [Plataforma & Multi-Tenancy](#2-plataforma--multi-tenancy)
3. [Mapa de Domínios](#3-mapa-de-domínios)
4. [Domínio: Identity & Access](#4-domínio-identity--access)
5. [Domínio: Condomínio](#5-domínio-condomínio)
6. [Domínio: Financeiro](#6-domínio-financeiro)
7. [Domínio: Comunicação](#7-domínio-comunicação)
8. [Domínio: Portaria & Controle de Acesso](#8-domínio-portaria--controle-de-acesso)
9. [Domínio: Reservas](#9-domínio-reservas)
10. [Domínio: Ocorrências](#10-domínio-ocorrências)
11. [Domínio: Enquetes](#11-domínio-enquetes)
12. [Domínio: Assembleia Digital](#12-domínio-assembleia-digital)
13. [Domínio: Manutenção](#13-domínio-manutenção)
14. [Domínio: RH & Trabalhista](#14-domínio-rh--trabalhista)
15. [Domínio: Gestão de Patrimônio](#15-domínio-gestão-de-patrimônio)
16. [Domínio: Estoque de Consumíveis](#16-domínio-estoque-de-consumíveis)
17. [Auditoria & Rastreabilidade](#17-auditoria--rastreabilidade)

---

## 1. Visão do Produto

### 1.1 Problema

A gestão condominial no Brasil é fragmentada em ferramentas desconectadas: planilhas para financeiro, WhatsApp para comunicação, papel para registros de manutenção, sem visão unificada para administradoras que gerenciam dezenas de condomínios simultaneamente. Síndicos são legalmente responsáveis, mas carecem de infraestrutura para gerenciar, documentar e auditar todas as suas obrigações.

### 1.2 Solução

ZenAndVillage é uma **plataforma SaaS B2B2C com IA** para gestão de condomínios e comunidades. Atende dois segmentos principais:

- **Administradoras de Condomínios:** empresas que gerenciam múltiplos condomínios em nome de síndicos. Precisam de visão operacional consolidada, relatórios centralizados e ferramentas para atender todos os seus condomínios em uma única plataforma.
- **Condomínios Autogeridos:** edifícios com síndico independente (morador ou profissional) que gerencia o condomínio diretamente, sem administradora.

### 1.3 Proposta de Valor

| Stakeholder | Valor |
|---|---|
| **Administradora** | Dashboard consolidado de todos os condomínios; gestão automatizada de inadimplência; controle de conformidade; marca white-label para seus clientes |
| **Síndico** | Plataforma única para financeiro, manutenção, funcionários, documentos legais e moradores; trilha de auditoria completa para responsabilidade legal |
| **Morador / Proprietário** | App transparente para gestão de boletos, reservas, ocorrências e comunicação em tempo real |
| **Conselho Fiscal** | Acesso direto a relatórios financeiros e logs de auditoria |

### 1.4 Slogan

> **Comunidades Conectadas. Operações Inteligentes. Vida Tranquila.**

---

## 2. Plataforma & Multi-Tenancy

### 2.1 Visão Geral do Modelo

O ZenAndVillage opera como um modelo **multi-tenant hierárquico**. A hierarquia natural é:

```
Plataforma → Conta de Assinatura → Condomínios → Blocos → Unidades → Moradores
```

Uma conta de assinatura (chamada **Tenant** no modelo de dados) é a unidade contratual e de faturamento: possui um plano, gerencia 1 a N condomínios conforme esse plano, e é completamente isolada de todas as outras contas da plataforma.

```
┌─────────────────────────────────────────────┐
│           PLATAFORMA ZENANDVILLAGE           │
│                 (Camada SaaS)                │
└──────────────┬──────────────────────────────┘
               │
   ┌───────────┼────────────┐
   ▼           ▼            ▼
[Conta A]   [Conta B]   [Conta C]
Admin.      Admin.       Síndico
XYZ         ABC          Individual
   │           │              │
 ┌─┴─┐       ┌─┴─┐          [C5]
[C1][C2]   [C3][C4]        1 condo
```

### 2.2 Hierarquia

```
Plataforma (ZenAndVillage)
└── Conta de Assinatura / Tenant
    └── Condomínio  (1 a N, conforme max_condos do plano)
        └── Bloco / Torre
            └── Unidade
                └── Morador / Proprietário / Ocupante
```

| Nível | Entidade | Descrição |
|---|---|---|
| **L0** | Plataforma | A própria plataforma ZenAndVillage; acesso exclusivo da equipe ZenEngineeringLab |
| **L1** | Conta de Assinatura (Tenant) | Unidade contratual e de faturamento; possui um plano que determina quantos condomínios podem ser gerenciados |
| **L2** | Condomínio | Unidade operacional; sempre pertence a uma conta L1 |
| **L3** | Bloco / Torre | Agrupamento físico dentro do condomínio (opcional) |
| **L4** | Unidade | Apartamento, sala, loja, vaga de garagem |
| **L5** | Usuário Final | Morador, proprietário, ocupante — vinculado a uma ou mais unidades |

### 2.3 Perfis de Conta de Assinatura

Toda conta L1 é a mesma entidade no modelo de dados. O que diferencia um síndico individual de uma administradora é exclusivamente o **plano contratado** — especificamente o limite `max_condos` do plano.

| Perfil | Plano Típico | max_condos | Observações |
|---|---|---|---|
| Síndico Individual | Solo / Starter | 1 | Gerencia um único condomínio diretamente |
| Pequena Administradora | Professional | 5–15 | Visão consolidada; pode habilitar white-label |
| Grande Administradora | Enterprise | Ilimitado | White-label completo; acesso à API; suporte dedicado |

### 2.4 Isolamento de Dados

- Cada registro pertence exatamente a um tenant e, quando aplicável, a um condomínio.
- Nenhum tenant pode acessar dados de outro tenant em nenhuma circunstância.
- A equipe da plataforma (L0) pode acessar dados de qualquer tenant apenas para fins de suporte, com registro obrigatório de auditoria.
- Agregação de dados entre tenants é proibida; relatórios só agregam dados dentro do mesmo tenant.

### 2.5 Ciclo de Vida do Tenant

```
Cadastro → Verificação de Identidade → Seleção de Plano & Checkout
      ↓
Conta Ativada  (status: trial ou active)
      ↓
Assistente de Configuração do Primeiro Condomínio
      ↓
Operação Ativa
      ↓
   [Inadimplência] → Pagamento vencido → Período de carência (7 dias) → Suspensão
   [Cancelamento]  → Cancelamento solicitado → Período de carência → Encerramento
      ↓
Suspensão: acesso somente leitura; todas as operações de escrita bloqueadas
      ↓
Encerramento: exportação de dados → dados retidos pelo período contratual → exclusão
```

#### Status do Tenant

| Status | Descrição | Capacidades |
|---|---|---|
| `trial` | Período gratuito de avaliação | Acesso completo com limites reduzidos |
| `active` | Assinatura ativa e em dia | Acesso completo conforme plano |
| `delinquent` | Pagamento vencido; dentro do período de carência | Acesso completo; avisos de cobrança exibidos |
| `suspended` | Carência encerrada sem pagamento | Somente leitura; sem criação ou edição |
| `canceled` | Cancelamento solicitado | Apenas exportação de dados; sem acesso operacional |

### 2.6 Planos & Assinaturas

#### Dimensões de Limite do Plano

| Dimensão | Descrição |
|---|---|
| `max_condos` | Número máximo de condomínios ativos no tenant |
| `max_units_total` | Total de unidades em todos os condomínios |
| `max_admin_users` | Número de usuários com papéis L1/L2 (síndicos, gestores) |
| `enabled_modules` | Lista de módulos disponíveis para o tenant |
| `data_retention_months` | Quantos meses de histórico de dados são retidos |
| `support_level` | Nível de SLA de suporte: `basic`, `priority`, `dedicated` |
| `white_label` | Marca personalizada habilitada (bool) |
| `api_access` | Acesso à API REST para integrações (bool) |

> Os nomes de campos das entidades seguem a versão canônica em inglês (`software-vision.md`).

#### Entidade: `Plan`

```
id, name, description,
monthly_price, annual_price,
max_condos, max_units_total, max_admin_users,
enabled_modules: [module_id],
data_retention_months,
support_level (basic | priority | dedicated),
white_label (bool),
api_access (bool),
status (active | discontinued),
public (bool)
```

#### Entidade: `Tenant`

```
id, name, type (management_company | independent_condo),
tax_id (cnpj), contact_email, phone,
responsible_name, responsible_email,
plan_id, subscription_status (trial | active | delinquent | canceled | suspended),
subscription_start_date, trial_end_date?,
billing_cycle (monthly | annual),
white_label_config?: {
  platform_name, logo_url, primary_color, secondary_color,
  custom_domain, custom_sender_email
},
usage_limits: { active_condos, total_units, admin_users },
status (active | suspended | canceled)
```

#### Entidade: `Subscription`

```
id, tenant_id, plan_id,
starts_at, ends_at?,
cycle (monthly | annual),
contracted_amount, discount?,
status (trial | active | expired | canceled),
payment_history: [{date, amount, status, reference}],
next_billing_date?,
payment_method (card | bank_slip | pix | transfer)
```

### 2.7 White-Label & Personalização

Tenants com o módulo `white_label` habilitado podem personalizar a experiência da plataforma para seus condomínios:

- **Nome da plataforma:** substituir "ZenAndVillage" pela marca da administradora
- **Logo:** próprio logo exibido no app e nos e-mails
- **Paleta de cores:** cores primária e secundária da identidade visual
- **Domínio personalizado:** app acessível em `app.nomeadministradora.com.br`
- **E-mail remetente:** comunicados enviados de `noreply@nomeadministradora.com.br`
- **Tela de splash personalizada:** tela de carregamento do app mobile

#### Regras de Negócio — White-Label

- **RN-WL-001:** A personalização é por tenant (L1); todos os condomínios do tenant herdam a mesma marca.
- **RN-WL-002:** Condomínios independentes sem o módulo white-label utilizam a identidade padrão ZenAndVillage.
- **RN-WL-003:** O rodapé do app deve manter uma referência discreta "Powered by ZenAndVillage" no modo white-label, exceto em contratos enterprise que explicitamente dispensem esse requisito.

#### Regras de Negócio — Multi-Tenancy

- **RN-MT-001:** Toda requisição à API deve validar o `tenant_id` antes de qualquer operação de dados (detalhes técnicos em `architecture-guide.md`).
- **RN-MT-002:** Consultas ao banco de dados sem filtro de `tenant_id` são proibidas em código de produção.
- **RN-MT-003:** Ao atingir o limite de condomínios ou unidades do plano, novas criações são bloqueadas com mensagem clara de upgrade.
- **RN-MT-004:** Dados de um tenant nunca são visíveis para outro tenant em nenhuma circunstância.
- **RN-MT-005:** O período de trial não se converte automaticamente em assinatura paga; requer ação explícita do `tenant_owner`.
- **RN-MT-006:** Em caso de suspensão, os moradores (L5) mantêm acesso de leitura ao app para que a experiência do usuário final não seja impactada pela inadimplência do tenant.
- **RN-MT-007:** A exclusão de um tenant deve ser precedida de exportação completa dos dados em formato estruturado (JSON/CSV) disponibilizada por ao menos 30 dias.
- **RN-MT-008:** Módulos não incluídos no plano devem retornar `403 Feature not available in current plan` — nunca exibir dados parciais.
- **RN-CT-001:** `tenant_admin` nunca acessa dados de outro tenant, mesmo que as administradoras pertençam ao mesmo grupo empresarial.
- **RN-CT-002:** Relatórios consolidados só agregam dados dentro do mesmo tenant.
- **RN-CT-003:** Um condomínio não pode ser transferido entre tenants sem processo formal de migração e consentimento por escrito do síndico responsável.
- **RN-CT-004:** A plataforma (L0) pode acessar dados de qualquer tenant apenas para fins de suporte, com registro imutável de auditoria.

---

## 3. Mapa de Domínios

O ZenAndVillage é estruturado em **13 bounded contexts** (domínios de negócio), cada um proprietário de seus agregados, entidades e regras de negócio. Dependências entre domínios são explícitas e unidirecionais.

```
┌──────────────────────────────────────────────────────────┐
│               PLATAFORMA & MULTI-TENANCY                 │
│         Plan · Tenant · Subscription · WhiteLabel        │
└──────────────────────┬───────────────────────────────────┘
                       │ owns
          ┌────────────▼────────────┐
          │  IDENTITY & ACCESS      │
          │  User · ResidentInvite  │◄─── autentica todos os domínios
          └────────────┬────────────┘
                       │ vínculo de unidade
          ┌────────────▼────────────┐
          │      CONDOMÍNIO         │
          │ Condo · Unit · Owner    │◄─── referenciado por todos os domínios operacionais
          │ OccupantTenant          │
          └──┬──────┬──────┬────────┘
             │      │      │
    ┌────────▼─┐ ┌──▼──┐ ┌─▼──────────┐
    │FINANCEIRO│ │COMU-│ │  PORTARIA  │
    │  Cobranç.│ │NICA-│ │ AccessLog  │
    └────────┬─┘ │ÇÃO  │ └─────┬──────┘
  inadimpl.  │   └──┬──┘       │ credencial
  check      │      │          │
    ┌─────────▼──────▼──────────▼───────┐
    │             RESERVAS              │
    │      CommonArea · Reservation     │
    └───────────────────────────────────┘

    OCORRÊNCIAS ──► MANUTENÇÃO ──► PATRIMÔNIO
        │                │
        └────────────────┘
             ordens de serviço

    ENQUETES · ASSEMBLEIA DIGITAL · RH & TRABALHISTA · ESTOQUE
    (domínios independentes; referenciam Condomínio para escopo)
```

### Diretório de Bounded Contexts

| # | Domínio | Agregado Raiz | Seção |
|---|---|---|---|
| 1 | Identity & Access | `User` | §4 |
| 2 | Condomínio | `Condominium` | §5 |
| 3 | Financeiro | `CondoCharge` | §6 |
| 4 | Comunicação | `Notice` | §7 |
| 5 | Portaria & Controle de Acesso | `AccessLog` | §8 |
| 6 | Reservas | `AreaReservation` | §9 |
| 7 | Ocorrências | `Incident` | §10 |
| 8 | Enquetes | `Poll` | §11 |
| 9 | Assembleia Digital | `Assembly` | §12 |
| 10 | Manutenção | `MaintenanceWorkOrder` | §13 |
| 11 | RH & Trabalhista | `Employee` | §14 |
| 12 | Gestão de Patrimônio | `Asset` | §15 |
| 13 | Estoque de Consumíveis | `StockProduct` | §16 |

> **Disponibilidade de módulos:** módulos não incluídos no plano do tenant devem retornar `403 Feature not available in current plan`. Acesso parcial ou degradado não é permitido.

---

## 4. Domínio: Identity & Access

**Agregado raiz:** `User`

Este domínio é proprietário da autenticação, autorização, ciclo de vida de usuários e todos os fluxos de onboarding — tanto o funil de assinatura do proprietário de conta quanto o fluxo de convite para moradores.

### 4.1 Onboarding do Proprietário de Conta

Aplica-se a síndicos, gestores e administradoras que criam e são donos de uma conta de assinatura.

```
[Landing Page]
      ↓
[Cadastro / Login]  (e-mail+senha OU login federado)
      ↓
[Verificação de Identidade]  ← apenas para e-mail+senha; ignorada para federado
      ↓
[Seleção de Plano & Checkout]
      ↓
[Conta Ativada]   (registros de Tenant + Subscription criados)
      ↓
[Assistente de Configuração do Primeiro Condomínio]
      ↓
[Acesso Operacional]
```

**Formas de cadastro:**

*E-mail e senha:*
1. O usuário informa nome completo, e-mail e senha.
2. O sistema envia um e-mail de verificação com link de validade limitada.
3. A conta fica em `pending_verification` até que o link seja clicado.
4. Contas não verificadas não podem avançar para a seleção de plano.
5. Requisitos de senha: mín. 8 caracteres, ao menos uma maiúscula, um número, um caractere especial.

*Login federado — provedores suportados: Google, Facebook, Apple:*
1. O usuário se autentica na tela de consentimento do provedor.
2. O provedor retorna uma identidade verificada (nome, e-mail, subject ID).
3. Se não existir conta ZenAndVillage para o e-mail retornado, uma é criada com `onboarding_status = pending_subscription`.
4. A identidade é pré-verificada; a confirmação de e-mail é ignorada.
5. Se o e-mail retornado pertencer a uma conta local existente, o usuário deve vincular as contas explicitamente — nenhuma fusão silenciosa ocorre.

**Gate de assinatura:** Após autenticação, usuários sem assinatura ativa são direcionados para a seleção de plano. Nenhum condomínio pode ser criado ou acessado até que um plano seja selecionado e o pagamento confirmado (ou trial ativado).

**Ativação da conta:** Após pagamento (ou trial):
1. Um registro `Tenant` é criado; o usuário é vinculado como `tenant_owner`.
2. Um registro `Subscription` é criado (`status = trial` ou `active`).
3. `onboarding_status` avança para `onboarding`.
4. O usuário é redirecionado para o Assistente de Configuração do Primeiro Condomínio.

**Assistente de Configuração do Primeiro Condomínio:**
1. Identidade do condomínio: nome, CNPJ (opcional), endereço, cidade, estado.
2. Estrutura: número de unidades, número de blocos (opcional).
3. O `tenant_owner` recebe automaticamente o papel `condo_syndic` neste condomínio.
4. `onboarding_status` avança para `complete`; acesso operacional completo é concedido.

### 4.2 Onboarding de Moradores e Pessoas Autorizadas

Acionado de dentro de um condomínio ativo. Não requer assinatura nem pagamento.

```
[E-mail de convite enviado pela equipe do condomínio / morador principal]
      ↓
[Convidado clica no link do convite]
      ↓
[Cadastro / Login]  (e-mail+senha OU login federado)
      ↓
[Verificação de Identidade]  ← apenas para e-mail+senha; ignorada para federado
      ↓
[Token de convite consumido → vínculo com a unidade criado]
      ↓
[onboarding_status = complete → acesso operacional]
```

**Passo 1 — Convite:**
- Um usuário com papel `condo_syndic`, `condo_manager` ou `condo_staff` envia um convite especificando a unidade e o papel (`resident_owner` ou `resident_tenant`).
- Apenas um usuário por tipo de papel pode ter `is_primary = true` em uma unidade por vez.
- Um registro `ResidentInvite` é criado vinculado ao e-mail do convidado.

**Passo 2 — Cadastro/login:** Mesmos métodos da Seção 4.1. O token está vinculado ao e-mail do convite; autenticação com outro e-mail rejeita o token.

**Passo 3 — Vínculo com a unidade:** O token é consumido; o usuário é vinculado à unidade com o papel designado e `is_primary = true`. `onboarding_status` → `complete`. Moradores herdam o acesso pela assinatura do tenant — não precisam de assinatura pessoal.

**Passo 4 — Convidar ocupantes adicionais:**

| Tipo do convidado | Papel concedido | Acesso |
|---|---|---|
| Comorador | `resident_owner` ou `resident_tenant` | Acesso completo de morador; `is_primary = false` |
| Pessoa autorizada | `authorized_person` | Credencial QR Code + upload de foto biométrica apenas |

A equipe do condomínio também pode convidar pessoas autorizadas diretamente. Um usuário pode estar vinculado a múltiplas unidades; cada vínculo é independente.

### 4.3 Status de Onboarding

| Status | Significado |
|---|---|
| `pending_verification` | Cadastrado via e-mail+senha; e-mail não confirmado |
| `pending_subscription` | Identidade verificada (ou federada); sem assinatura ativa — apenas proprietários de conta |
| `onboarding` | Assinatura ativa; assistente do primeiro condomínio não concluído — apenas proprietários de conta |
| `complete` | Acesso operacional completo concedido |

### 4.4 Taxonomia de Papéis

| Papel | Nível | Capacidades |
|---|---|---|
| `platform_admin` | L0 | Acesso completo à plataforma; gestão de tenants, planos e suporte |
| `platform_support` | L0 | Acesso de leitura para suporte; não pode modificar dados de tenants |
| `tenant_owner` | L1 | Proprietário da conta; configura plano, cobrança e usuários L1 |
| `tenant_admin` | L1 | Administrador da administradora; acesso a todos os condomínios do tenant |
| `tenant_viewer` | L1 | Visão consolidada somente leitura de todos os condomínios do tenant |
| `condo_syndic` | L2 | Síndico do condomínio; gestão completa daquele condomínio |
| `condo_manager` | L2 | Gestor delegado (ex: funcionário da administradora alocado ao condomínio) |
| `condo_council` | L2 | Membro do conselho fiscal; acesso de leitura a relatórios financeiros |
| `condo_staff` | L2 | Funcionário interno (zelador, porteiro); acesso operacional limitado |
| `resident_owner` | L4/L5 | Proprietário de unidade; acesso completo ao app de morador |
| `resident_tenant` | L4/L5 | Inquilino de unidade; acesso de morador exceto dados financeiros exclusivos do proprietário |
| `authorized_person` | L4/L5 | Autorizado por um morador; credencial QR Code + upload biométrico apenas; sem acesso a módulos operacionais |

**Regras de permissão:**
- `tenant_admin` tem acesso implícito a todos os condomínios do tenant sem atribuição explícita por condomínio.
- `condo_syndic` tem acesso apenas ao(s) condomínio(s) ao(s) qual(is) está explicitamente vinculado.
- Um usuário pode ter papéis diferentes em condomínios distintos.
- Moradores acessam apenas dados da(s) própria(s) unidade(s).
- Cada vínculo de unidade possui uma flag `is_primary`. Exatamente um usuário por tipo de papel (`resident_owner` ou `resident_tenant`) pode ter `is_primary = true` por unidade por vez.
- O acesso de `authorized_person` é estritamente limitado ao gerenciamento de credencial; sem acesso a módulos operacionais.
- Em caso de suspensão do tenant, moradores (L5) mantêm acesso de leitura (boletos, histórico, comunicados).
- Acesso entre tenants é estritamente proibido.

### 4.5 Entidades

#### Entidade: `User` — Agregado Raiz

```
id, email, name, cpf?,
auth_provider (local | google | facebook | apple),
auth_provider_id?,          -- subject ID retornado pelo provedor federado
password_hash?,             -- null para contas federadas
mfa_enabled (bool),
onboarding_status (pending_verification | pending_subscription | onboarding | complete),
status (active | inactive | blocked | pending_verification),
created_at, last_login?,
roles: [{
  role,
  tenant_id,
  condo_id?,
  unit_id?,
  is_primary?,              -- true para o morador principal de uma unidade (um por tipo de papel por unidade)
  starts_at, ends_at?
}],
notification_preferences: {channels, schedules, types}
```

#### Entidade: `ResidentInvite`

```
id, condo_id, tenant_id,
unit_id,
invited_by_id,
invited_by_role (condo_syndic | condo_manager | condo_staff | resident_owner | resident_tenant),
invitee_email,
invitee_role (resident_owner | resident_tenant | authorized_person),
is_primary (bool),
token,                      -- hash único com validade limitada; uso único
status (pending | accepted | expired | revoked),
sent_at, expires_at,
accepted_at?,
revoked_by_id?, revoked_at?
```

### 4.6 Regras de Negócio

- **RN-ONB-001:** Um usuário sem assinatura ativa (`onboarding_status = pending_subscription`) não pode criar, acessar nem interagir com nenhum dado de condomínio.
- **RN-ONB-002:** Identidade federada é tratada como pré-verificada; a etapa de confirmação de e-mail é ignorada.
- **RN-ONB-003:** Se um provedor federado retornar um e-mail já cadastrado como conta local, o usuário deve vincular as contas explicitamente; fusão silenciosa é proibida.
- **RN-ONB-004:** A ativação do trial não exige dados de pagamento; a conversão para assinatura paga exige forma de pagamento válida antes do encerramento do trial.
- **RN-ONB-005:** O Assistente de Configuração do Primeiro Condomínio deve ser concluído antes de acessar qualquer módulo operacional.
- **RN-ONB-006:** O `max_condos` do plano é verificado no momento da criação do condomínio; tentativas de criar condomínios além do limite são bloqueadas com prompt claro de upgrade.
- **RN-MOD-001:** O primeiro convite de morador principal de uma unidade deve ser emitido por um usuário com papel `condo_syndic`, `condo_manager` ou `condo_staff`.
- **RN-MOD-002:** Cada unidade pode ter no máximo um morador principal ativo por tipo de papel por vez (`is_primary = true`).
- **RN-MOD-003:** O morador principal pode convidar comoradores e pessoas autorizadas para a mesma unidade.
- **RN-MOD-004:** Um token `ResidentInvite` é de uso único e expira 7 dias após a emissão.
- **RN-MOD-005:** O token está vinculado ao e-mail para o qual foi enviado; autenticação com outro e-mail rejeita o token.
- **RN-MOD-006:** Moradores não precisam de assinatura pessoal; o acesso é herdado pela assinatura ativa do tenant via vínculo com a unidade.
- **RN-MOD-007:** Um usuário pode ter vínculos de unidade ativos em múltiplas unidades; cada vínculo é independente.
- **RN-MOD-008:** A remoção de um morador revoga os vínculos de papel na unidade e invalida as credenciais associadas, mas preserva a conta e vínculos com outras unidades.
- **RN-MOD-009:** O morador principal pode revogar convites que emitiu. `condo_syndic` ou `condo_manager` pode revogar qualquer convite ou vínculo de morador.
- **RN-MOD-010:** O acesso de `authorized_person` é estritamente limitado a geração de credencial QR Code e upload de foto biométrica; nenhum módulo operacional é acessível.

---

## 5. Domínio: Condomínio

**Agregado raiz:** `Condominium`

Este domínio é proprietário da estrutura física e jurídica do condomínio: o edifício, suas unidades, proprietários e ocupantes. É o domínio fundacional referenciado por todos os outros domínios operacionais para escopo.

### 5.1 Entidades

#### Entidade: `Condominium` — Agregado Raiz

```
id, tenant_id,
name, tax_id (cnpj), address, city, state, zip_code,
type (residential | commercial | mixed),
num_units, num_blocks, num_floors,
total_area_sqm, base_ideal_fraction,
inauguration_date, property_registration,
bylaws_url, regulations_url,
status (active | inactive)
```

#### Entidade: `Unit`

```
id, condo_id, tenant_id,
block, floor, number,
type (apartment | office | store | parking),
private_area_sqm, ideal_fraction,
linked_parking_space,
occupancy_status (owned | rented | vacant)
```

#### Entidade: `Owner`

```
id, tenant_id, condo_id,
name, cpf, rg, email, phone,
unit_id, acquisition_date,
financial_status (current | delinquent),
is_syndic, is_council_member
```

#### Entidade: `OccupantTenant`

> Representa o ocupante locatário da unidade. Nomeado `OccupantTenant` para distinguir do `Tenant` de plataforma (conta de assinatura).

```
id, tenant_id, condo_id,
name, cpf, email, phone,
unit_id, lease_start_date, lease_end_date,
lease_contract_url
```

### 5.2 Regras de Negócio — Governança

- **RN-GOV-001:** Alterações na Convenção exigem aprovação de 2/3 de TODOS os condôminos.
- **RN-GOV-002:** A pauta de assembleia é fechada; apenas itens do edital oficial podem ser votados.
- **RN-GOV-003:** O síndico nunca pode presidir a própria assembleia de destituição.
- **RN-GOV-004:** Convocações de assembleia por condôminos requerem representação de pelo menos 1/4 do total de proprietários.
- **RN-GOV-005:** A ata de assembleia que altera a convenção deve ser registrada em Cartório de Registro de Imóveis.
- **RN-GOV-006:** O mandato do síndico é de no máximo 2 anos, renovável.

---

## 6. Domínio: Financeiro

**Agregado raiz:** `CondoCharge`

Este domínio é proprietário da cobrança de cotas condominiais, controle de inadimplência, gestão orçamentária e fundo de reserva. O estado de inadimplência produzido aqui é consumido pelos domínios de Reservas e Assembleia Digital.

### 6.1 Entidades

#### Entidade: `CondoCharge` — Agregado Raiz

```
id, unit_id, condo_id, tenant_id,
billing_period (MM/YYYY),
base_fee, reserve_fund_amount, extras_amount,
total_amount, due_date,
status (pending | paid | overdue | installment_plan),
paid_at?, late_fine?, interest?,
bill_url
```

### 6.2 Regras de Negócio

- **RN-FIN-001:** Cota condominial vencida gera automaticamente multa de 2% + juros de 1% ao mês após o vencimento (Art. 1.336 CC).
- **RN-FIN-002:** Condômino com débito em aberto não pode votar em assembleia (flag `financial_status = delinquent` em `Owner`).
- **RN-FIN-003:** O fundo de reserva não pode ser utilizado para despesas ordinárias previstas no orçamento.
- **RN-FIN-004:** A previsão orçamentária anual deve ser aprovada em AGO antes de entrar em vigor.
- **RN-FIN-005:** O fundo de reserva deve ter conta bancária separada da conta corrente operacional.
- **RN-FIN-006:** O seguro de incêndio é obrigatório; sua ausência expõe o síndico a responsabilidade pessoal.

---

## 7. Domínio: Comunicação

**Agregado raiz:** `Notice`

Este domínio é proprietário de todas as comunicações de saída para moradores: comunicados formais, alertas de inadimplência, convocações, broadcasts de emergência e anúncios gerais.

### 7.1 Entidades

#### Entidade: `Notice` — Agregado Raiz

```
id, condo_id, tenant_id,
title, content,
type (general | targeted | summons | financial | security | regulatory | incident_response),
sender_id,
recipients (all | block | specific_units | delinquents),
delivery_channels: [app | email | sms | digital_board],
published_at, expires_at?,
priority (normal | urgent | critical),
requires_read_receipt (bool),
read_receipts: [{resident_id, read_at}],
attachments: [url],
status (draft | scheduled | sent | expired)
```

### 7.2 Regras de Negócio

- **RN-COM-001:** Convocações de assembleia devem ser enviadas pelo canal formal definido na convenção (e-mail + app + mural).
- **RN-COM-002:** Comunicados sobre inadimplência devem ser enviados exclusivamente ao responsável pela unidade, nunca em grupos coletivos.
- **RN-COM-003:** Todo comunicado formal (convocação, inadimplência, multas) deve ter confirmação de leitura registrada para fins de comprovação legal.
- **RN-COM-004:** O histórico de todos os comunicados enviados deve ser arquivado com data, hora, destinatários e conteúdo.
- **RN-COM-005:** Alertas de emergência (água, gás, estrutura) devem disparar simultaneamente em todos os canais ativos (app + SMS + e-mail).
- **RN-COM-006:** Comunicados são entregues a usuários com papel `resident_owner` ou `resident_tenant` na unidade-alvo. Usuários com papel `authorized_person` não recebem comunicados operacionais.

---

## 8. Domínio: Portaria & Controle de Acesso

**Agregado raiz:** `AccessLog`

Este domínio é proprietário do acesso físico ao condomínio: registro de entradas/saídas, gestão de visitantes, credenciais QR Code e matrícula biométrica. Consome dados de credencial do domínio Identity & Access.

### 8.1 Entidades

#### Entidade: `AccessLog` — Agregado Raiz

```
id, condo_id, tenant_id,
destination_unit_id?,
person_type (resident | visitor | service_provider | delivery),
person_id?, visitor_name?, visitor_cpf?,
entered_at, exited_at?,
access_method (tag | facial | qr_code | manual | app),
authorized_by_id?,
photo_url?,
vehicle_plate?
```

### 8.2 Regras de Negócio

- **RN-SEG-001:** O uso de biometria facial exige consentimento individual e explícito; deve haver meio alternativo de acesso para quem recusar. Esta regra aplica-se a todos os usuários que fazem upload de foto biométrica, inclusive aqueles com papel `authorized_person`.
- **RN-SEG-002:** Imagens de câmeras só podem ser compartilhadas com autoridades via requisição formal; nunca diretamente a condôminos.
- **RN-SEG-003:** Dados de visitantes devem ter prazo de retenção definido e ser excluídos após o período.
- **RN-SEG-004:** Câmeras não podem ser posicionadas de modo a capturar áreas privativas ou interior dos apartamentos.
- **RN-SEG-005:** A credencial QR Code de uma `authorized_person` é válida apenas enquanto o vínculo de papel na unidade estiver ativo; a revogação do vínculo invalida a credencial imediatamente.

---

## 9. Domínio: Reservas

**Agregado raiz:** `AreaReservation`

Este domínio é proprietário da configuração de áreas comuns e da gestão de reservas. Consome o estado de inadimplência do domínio Financeiro e o status de manutenção do domínio Manutenção.

### 9.1 Entidades

#### Entidade: `CommonArea`

```
id, condo_id, tenant_id,
name, description,
type (party_room | barbecue | sports_court | pool | coworking | movie_room | pet | other),
max_capacity, max_guest_capacity,
reservable (bool),
min_advance_hours, max_advance_days,
min_cancellation_hours,
max_reservations_per_unit_per_month,
usage_fee?, cleaning_fee?, deposit_amount?,
opening_time, closing_time,
available_days: [mon|tue|wed|thu|fri|sat|sun],
requires_checkout_checklist (bool),
usage_instructions, photos: [url],
status (active | under_maintenance | disabled)
```

#### Entidade: `AreaReservation` — Agregado Raiz

```
id, condo_id, tenant_id,
area_id, unit_id, resident_id,
reservation_date, start_time, end_time,
expected_guests,
fee_charged?, deposit_held?,
status (pending | confirmed | canceled | completed | no_show),
cancellation_reason?, canceled_by?, canceled_at?,
checkout_checklist_url?,
cleaning_fee_applied?,
notes,
notifications_sent: [{type, sent_at}]
```

### 9.2 Regras de Negócio

- **RN-RES-001:** Condômino inadimplente não pode realizar novas reservas de áreas comuns.
- **RN-RES-002:** Cada unidade pode ter no máximo N reservas ativas por mês; N é definido no regimento interno do condomínio.
- **RN-RES-003:** Cancelamentos fora do prazo mínimo (padrão: 24h) geram penalidade conforme regimento interno.
- **RN-RES-004:** Não comparecimento sem cancelamento pode gerar bloqueio temporário de novas reservas.
- **RN-RES-005:** Áreas com manutenção ativa devem ser bloqueadas automaticamente para novas reservas.
- **RN-RES-006:** Conflito de reservas (erro de sistema) deve ser resolvido pelo síndico; o segundo reservante recebe prioridade na próxima data disponível.
- **RN-RES-007:** O calendário de disponibilidade deve ser público (livre/ocupado) sem expor a identidade do reservante.
- **RN-RES-008:** Reservas para datas com mais de 30 dias de antecedência requerem confirmação em até 7 dias antes da data.
- **RN-RES-009:** Reservas em feriados ou fins de semana podem ter regras distintas (taxas, horários) configuráveis por condomínio.
- **RN-RES-010:** Apenas usuários com papel `resident_owner` ou `resident_tenant` podem realizar reservas. Usuários com papel `authorized_person` não podem reservar áreas comuns.

---

## 10. Domínio: Ocorrências

**Agregado raiz:** `Incident`

Este domínio é proprietário do registro, acompanhamento e resolução de reclamações, infrações e incidentes gerais. Ocorrências de manutenção disparam ordens de serviço no domínio Manutenção.

### 10.1 Entidades

#### Entidade: `Incident` — Agregado Raiz

```
id, condo_id, tenant_id,
protocol (único, gerado automaticamente),
origin_unit_id, resident_id,
category (noise | violation | maintenance | security | cleaning | employee | damage | suggestion | financial | other),
subcategory?,
title, description, evidence: [url],
filed_at,
priority (critical | high | medium | low),
anonymous (bool),
target_unit_id?,
responsible_id?,
linked_work_order_id?,
status (filed | under_review | in_progress | awaiting_offender | resolved | archived | reopened),
status_history: [{status, changed_at, responsible_id, description}],
offender_notified (bool),
fine_applied?, fine_amount?,
resolved_at?,
resolution_description?,
resident_rating? (1–5),
rating_comment?
```

### 10.2 Regras de Negócio

- **RN-OCO-001:** Toda ocorrência registrada deve receber número de protocolo único imediatamente após o registro.
- **RN-OCO-002:** O reclamante deve receber notificação automática a cada mudança de status.
- **RN-OCO-003:** Ocorrências de segurança com prioridade crítica devem notificar o síndico via push e SMS simultaneamente.
- **RN-OCO-004:** O síndico não pode arquivar uma ocorrência sem registrar a resolução adotada.
- **RN-OCO-005:** Ocorrências de manutenção devem gerar automaticamente uma Ordem de Serviço vinculada no domínio Manutenção.
- **RN-OCO-006:** Notificações de infração ao regimento devem ter comprovante de entrega registrado para validade em eventual cobrança de multa.
- **RN-OCO-007:** O histórico de ocorrências de uma unidade deve ser consultável pelo síndico para análise de reincidência.
- **RN-OCO-008:** Ocorrências anônimas são permitidas apenas para denúncias; reclamações que gerem multa ao infrator exigem identificação do reclamante.

---

## 11. Domínio: Enquetes

**Agregado raiz:** `Poll`

Este domínio é proprietário de enquetes não vinculantes com moradores. O direito de voto em enquetes é independente do status de inadimplência (diferente de assembleias formais).

### 11.1 Entidades

#### Entidade: `Poll` — Agregado Raiz

```
id, condo_id, tenant_id,
title, description, objective?,
type (single_choice | multiple_choice | scale | open | ranking),
options: [{id, text, order}]?,
scale_min?, scale_max?, scale_labels?,
creator_id,
target_audience (all | owners | tenants | specific_block),
anonymous (bool),
starts_at, ends_at,
status (draft | active | closed | canceled),
cancellation_reason?,
results_published (bool),
total_eligible, total_respondents,
results: [{option_id, count, percentage}],
open_responses: [{unit_id?, text}]?
```

#### Entidade: `PollResponse`

```
id, poll_id, condo_id, tenant_id,
unit_id,
resident_id? (null se anônimo),
responded_at,
chosen_options: [option_id],
scale_value?,
open_text?,
ranking_options: [{option_id, position}]?
```

### 11.2 Regras de Negócio

- **RN-ENQ-001:** Enquetes são não vinculantes e não substituem votação em assembleia para decisões que exigem quórum legal.
- **RN-ENQ-002:** Cada unidade (não cada pessoa) tem direito a um único voto por enquete, salvo configuração diferente pelo síndico.
- **RN-ENQ-003:** O prazo mínimo de uma enquete é de 48 horas para garantir participação razoável.
- **RN-ENQ-004:** Enquetes anônimas registram que a unidade votou, mas não associam o voto à identidade do morador.
- **RN-ENQ-005:** O resultado de enquetes deve ser publicado a todos os moradores após o encerramento.
- **RN-ENQ-006:** Enquetes não podem ser editadas após o início da votação; apenas canceladas com notificação e motivo.
- **RN-ENQ-007:** Condôminos inadimplentes podem participar de enquetes (diferente de assembleias formais, onde perdem o direito de voto).
- **RN-ENQ-008:** Enquetes de satisfação com o síndico ou administradora devem ter participação garantida a todos os moradores, sem restrição.

---

## 12. Domínio: Assembleia Digital

**Agregado raiz:** `Assembly`

Este domínio é proprietário das assembleias condominiais formais (AGO e AGE), incluindo gestão de pauta, controle de quórum, votação digital e ata. O direito de voto é condicionado ao status financeiro do domínio Financeiro.

### 12.1 Entidades

#### Entidade: `Assembly` — Agregado Raiz

```
id, condo_id, tenant_id,
type (ordinary | extraordinary),
date, start_time, end_time,
format (in_person | virtual | hybrid),
access_link?,
agenda_items: [{title, required_quorum, vote_result}],
minutes_url,
status (scheduled | held | canceled)
```

### 12.2 Regras de Negócio

- **RN-ASS-001:** As convocações devem respeitar o prazo definido na convenção (mínimo 3 dias para AGE, mínimo 8 dias para AGO).
- **RN-ASS-002:** Proprietários com `financial_status = delinquent` não podem votar em assembleias (conforme RN-FIN-002).
- **RN-ASS-003:** Alterações na convenção exigem quórum de 2/3 de todos os condôminos (conforme RN-GOV-001).
- **RN-ASS-004:** O síndico nunca pode presidir a própria assembleia de destituição (conforme RN-GOV-003).
- **RN-ASS-005:** A ata da assembleia digital deve ser arquivada com data, presentes, votos e assinatura digital do síndico eleito.
- **RN-ASS-006:** Atas que alterem a convenção devem ser registradas em Cartório de Registro de Imóveis após a assembleia.

---

## 13. Domínio: Manutenção

**Agregado raiz:** `MaintenanceWorkOrder`

Este domínio é proprietário de manutenções programadas e corretivas, documentos de conformidade legal (AVCB, seguro, inspeções) e controle de checklists. Ordens de serviço podem ser criadas manualmente ou automaticamente pelo domínio de Ocorrências.

### 13.1 Entidades

#### Entidade: `MaintenanceWorkOrder` — Agregado Raiz

```
id, condo_id, tenant_id,
type (preventive | corrective | emergency),
location, description,
priority (low | medium | high | critical),
opened_at, completed_at?,
responsible_id?, vendor_id?,
estimated_cost?, actual_cost?,
status (open | in_progress | completed | canceled),
documents: [url]
```

#### Entidade: `LegalDocument`

```
id, condo_id, tenant_id,
type (avcb | insurance | elevator_inspection | cistern | extinguisher | fire_brigade | pmoc | other),
description, issued_at, expires_at,
responsible_company, file_url,
status (valid | expired | expiring_soon)
```

### 13.2 Regras de Negócio

- **RN-MAN-001:** AVCB vencido expõe o síndico a responsabilização pessoal por qualquer sinistro.
- **RN-MAN-002:** Elevadores devem ter manutenção preventiva mensal e inspeção semestral documentadas.
- **RN-MAN-003:** Reformas em unidades privativas que afetem estrutura, hidráulica ou elétrica exigem ART/RRT antes do início.
- **RN-MAN-004:** Documentos de manutenção devem ser arquivados por no mínimo 5 anos.

---

## 14. Domínio: RH & Trabalhista

**Agregado raiz:** `Employee`

Este domínio é proprietário da gestão de funcionários diretos e terceirizados do condomínio, incluindo integração com eSocial, escalas e ciclo de vida do contrato de trabalho.

### 14.1 Entidades

#### Entidade: `Employee` — Agregado Raiz

```
id, condo_id, tenant_id,
name, cpf, social_security_id,
role (superintendent | doorman | general_services | guard | receptionist),
contract_type (direct_clt | outsourced),
outsourcing_company_id?,
hire_date, termination_date?,
base_salary, schedule (44h | 12x36 | part_time),
status (active | inactive | on_leave)
```

### 14.2 Regras de Negócio

- **RN-RH-001:** Todo funcionário CLT deve ser registrado no eSocial antes do início das atividades.
- **RN-RH-002:** O síndico não tem vínculo empregatício com o condomínio.
- **RN-RH-003:** Funcionários terceirizados não podem receber ordens diretas do síndico (risco de vínculo empregatício).
- **RN-RH-004:** Pagamento de verbas rescisórias deve ocorrer em até 10 dias após o desligamento.

---

## 15. Domínio: Gestão de Patrimônio

**Agregado raiz:** `Asset`

Este domínio é proprietário do inventário, ciclo de vida e movimentação de todos os bens físicos adquiridos com recursos condominiais. Danos a bens podem gerar ocorrências no domínio de Ocorrências; bens vinculados a áreas comuns afetam a disponibilidade no domínio de Reservas.

### 15.1 Entidades

#### Entidade: `Asset` — Agregado Raiz

```
id, condo_id, tenant_id,
tag_number,
description, brand?, model?, serial_number?, color?,
category, subcategory?,
allocated_area_id,
acquisition_date, acquisition_value?,
invoice_url?,
supplier_name?, supplier_tax_id?,
warranty_start?, warranty_end?,
useful_life_years?,
current_depreciated_value?,
condition (excellent | good | fair | poor | unusable),
custodian_id?,
photos: [url],
notes?,
status (active | under_maintenance | written_off),
written_off_date?, write_off_reason?,
write_off_document_url?
```

#### Entidade: `AssetMovement`

```
id, condo_id, tenant_id, asset_id,
type (entry | transfer | internal_loan | exit_maintenance |
      return_maintenance | write_off_disposal | write_off_sale |
      write_off_loss | condition_update),
moved_at,
origin_area_id?,
destination_area_id?,
responsible_id,
condition_before?, condition_after?,
sale_value?, sale_beneficiary?,
linked_work_order_id?,
linked_incident_id?,
notes, documents: [url]
```

#### Entidade: `PhysicalInventory`

```
id, condo_id, tenant_id,
conducted_at,
responsible_id,
items_verified: [{
  asset_id,
  found (bool),
  verified_condition (excellent | good | fair | poor | unusable),
  note?
}],
items_not_found: [asset_id],
status (in_progress | completed),
report_url?
```

### 15.2 Regras de Negócio

- **RN-PAT-001:** Todo bem adquirido com recursos condominiais deve ser tombado antes de entrar em uso, com a nota fiscal vinculada.
- **RN-PAT-002:** O descarte de bens acima do valor limite definido na convenção exige aprovação em assembleia.
- **RN-PAT-003:** Bens ausentes no inventário físico devem gerar automaticamente uma ocorrência de extravio no domínio de Ocorrências.
- **RN-PAT-004:** Bens com garantia ativa devem gerar alerta automático 60 dias antes do vencimento.
- **RN-PAT-005:** Nenhum bem pode sair do condomínio sem registro de movimentação patrimonial.
- **RN-PAT-006:** Bens em estado "inservível" devem ter destino registrado em até 30 dias.
- **RN-PAT-007:** O relatório patrimonial deve ser integrado ao relatório financeiro anual do síndico.
- **RN-PAT-008:** Dano a bem condominial causado por morador ou visitante gera ocorrência vinculada ao item, com opção de cobrar o responsável.
- **RN-PAT-009:** Itens vinculados a áreas comuns em manutenção devem ser sinalizados como indisponíveis no domínio de Reservas.

---

## 16. Domínio: Estoque de Consumíveis

**Agregado raiz:** `StockProduct`

Este domínio é proprietário do controle de estoque de suprimentos, fluxos de reposição e aprovação de pedidos de compra. Os custos são classificados por centro de custo e refletidos no balancete mensal do domínio Financeiro.

### 16.1 Entidades

#### Entidade: `StockProduct` — Agregado Raiz

```
id, condo_id, tenant_id,
sku,
name, description?,
category (cleaning | landscaping | pool | electrical | plumbing |
          maintenance | office | safety | gatehouse | break_room | other),
unit_of_measure (unit | kg | l | m | box | pack | roll),
has_expiry (bool),
current_stock,
minimum_stock,
maximum_stock,
reorder_point,
avg_monthly_consumption?,
preferred_suppliers: [{supplier_id, reference_price, lead_time_days}],
storage_location?,
photo_url?,
notes?,
status (active | discontinued)
```

#### Entidade: `StockMovement`

```
id, condo_id, tenant_id, product_id,
type (entry | exit | adjustment | expiry_disposal | transfer),
quantity, unit_of_measure,
balance_before, balance_after,
moved_at,
responsible_id,
cost_center (cleaning | maintenance | gatehouse | pool | landscaping | administration | other),
linked_work_order_id?,
invoice_url?,
lot?, expiry_date?,
unit_price?,
supplier_id?,
adjustment_reason?,
notes?
```

#### Entidade: `PurchaseRequest`

```
id, condo_id, tenant_id,
items: [{product_id, requested_quantity, justification?, urgent (bool)}],
requester_id,
requested_at,
status (pending | approved | rejected | purchased | partially_purchased),
approver_id?, approved_at?,
rejection_reason?,
quotes: [{supplier_id, unit_price, lead_time, notes}],
chosen_supplier_id?,
approved_total_value?,
purchased_at?, invoice_url?
```

#### Entidade: `StockInventory`

```
id, condo_id, tenant_id,
conducted_at,
responsible_id,
items_counted: [{
  product_id,
  system_quantity,
  physical_quantity,
  difference,
  adjustment_applied (bool),
  note?
}],
status (in_progress | completed | with_discrepancies),
report_url?
```

### 16.2 Regras de Negócio

- **RN-EST-001:** Toda entrada em estoque deve estar vinculada a uma nota fiscal ou documento de recebimento.
- **RN-EST-002:** Toda saída de estoque deve ser registrada com responsável identificado e centro de custo.
- **RN-EST-003:** Ao atingir o ponto de pedido, o sistema deve gerar automaticamente alerta de reposição para o síndico ou zelador.
- **RN-EST-004:** Itens com data de validade devem gerar alerta automático 30 dias antes do vencimento.
- **RN-EST-005:** Itens vencidos ou descartados devem ser baixados do estoque com motivo registrado; não podem ser contabilizados como consumo operacional.
- **RN-EST-006:** Compras acima do valor de autorização definido na convenção devem ter aprovação do síndico antes de serem processadas.
- **RN-EST-007:** Os custos de consumíveis devem ser classificados por centro de custo e refletidos no balancete mensal como despesas ordinárias.
- **RN-EST-008:** O relatório de estoque deve compor o relatório financeiro do síndico, comparando gastos reais com suprimentos vs. orçado.
- **RN-EST-009:** As políticas de estoque (mínimo, máximo, ponto de pedido) podem ser configuradas por item, por condomínio.

---

## 17. Auditoria & Rastreabilidade

**Preocupação transversal (cross-cutting concern).** Toda operação de escrita em todos os domínios deve gerar um registro de auditoria imutável associado ao tenant e ao usuário responsável.

### 17.1 Entidade: `AuditLog`

```
id, tenant_id, condo_id?,
user_id, user_role,
action (create | update | delete | read_sensitive | login | logout | export),
affected_entity, entity_id,
previous_data?: (snapshot JSON),
new_data?: (snapshot JSON),
source_ip, user_agent,
occurred_at,
success (bool), failure_reason?
```

### 17.2 Regras de Negócio

- **RN-AUD-001:** Registros de auditoria são **imutáveis**; nenhum usuário, nem mesmo `platform_admin`, pode excluir registros de auditoria.
- **RN-AUD-002:** Ações sensíveis (exportação de dados, alteração de plano, acesso L0 a um tenant) devem gerar alerta em tempo real para o `tenant_owner`.
- **RN-AUD-003:** Logs devem ser retidos pelo período definido no plano, com mínimo de 12 meses.
- **RN-AUD-004:** Em caso de incidente de segurança, os logs devem ser suficientes para reconstruir a sequência completa de ações.

---

*Documento para uso interno de desenvolvimento. Última revisão: Maio 2026 — v1.3 (reestruturado com bounded contexts DDD; cada domínio agora é dono de suas entidades e regras de negócio; Seção 3 com Mapa de Domínios adicionada; domínio de Assembleia formalizado; OccupantTenant renomeado de Tenant para evitar colisão com o Tenant de plataforma; Employee movido para o domínio RH & Trabalhista).*
