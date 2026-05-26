# Visão de Software: Plataforma ZenAndVillage

> **Versão pt_BR.** Este documento é a tradução em Português Brasileiro (pt_BR) de [`software-vision.md`](software-vision.md).
> Toda edição feita em `software-vision.md` deve ser refletida neste arquivo, e vice-versa.
> Em caso de conflito de conteúdo, a versão em inglês (`software-vision.md`) é a canônica.
> Para conhecimento de domínio condominial, consulte [`knowledge-base.pt_BR.md`](knowledge-base.pt_BR.md).
> Para decisões técnicas de implementação, consulte [`architecture-guide.md`](architecture-guide.md).

---

## Índice

1. [Visão do Produto](#1-visão-do-produto)
2. [Modelo de Negócio Multi-Tenancy](#2-modelo-de-negócio-multi-tenancy)
3. [Cadastro e Onboarding de Usuários](#3-cadastro-e-onboarding-de-usuários)
4. [Papéis de Usuário e Permissões](#4-papéis-de-usuário-e-permissões)
5. [Planos e Assinaturas](#5-planos-e-assinaturas)
6. [Módulos da Plataforma](#6-módulos-da-plataforma)
7. [White-Label e Personalização](#7-white-label-e-personalização)
8. [Domínio de Dados — Entidades e Atributos](#8-domínio-de-dados--entidades-e-atributos)
9. [Regras de Negócio](#9-regras-de-negócio)
10. [Auditoria e Rastreabilidade](#10-auditoria-e-rastreabilidade)

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

## 2. Modelo de Negócio Multi-Tenancy

### 2.1 Visão Geral do Modelo

O ZenAndVillage opera como um modelo **multi-tenant hierárquico**. Um único deployment da plataforma atende múltiplas contas de assinatura (tenants) completamente isoladas entre si. A hierarquia natural é:

```
Plataforma → Conta de Assinatura → Condomínios → Blocos → Unidades → Moradores
```

Uma conta de assinatura (chamada **Tenant** no modelo de dados) é a unidade contratual e de faturamento: ela possui um plano, gerencia 1 a N condomínios conforme esse plano, e é completamente isolada de todas as outras contas na plataforma.

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

O campo `type` na entidade Tenant (`management_company` | `independent_condo`) é mantido para funcionalidades que diferem por perfil (ex: relatórios consolidados, elegibilidade para white-label), mas não impõe diferenças estruturais de acesso — os limites do plano são a restrição autoritativa.

**Conta Administradora (L1):**

- Gerencia N condomínios sob uma única assinatura.
- Tem visão consolidada de todos os seus condomínios.
- Pode habilitar marca white-label.
- Configura padrões que os condomínios filhos podem herdar.

**Conta Síndico Individual (L1):**

- Edifício autogerido sem vínculo com administradora.
- Síndico acessa diretamente, sem intermediário.
- Utiliza a identidade padrão ZenAndVillage (sem white-label por padrão).
- Limite de `max_condos = 1` restringe ao escopo de um único condomínio.

### 2.4 Isolamento de Dados

- Cada registro pertence exatamente a um tenant e, quando aplicável, a um condomínio.
- Nenhum tenant pode acessar dados de outro tenant em nenhuma circunstância.
- A equipe da plataforma (L0) pode acessar dados de qualquer tenant apenas para fins de suporte, com registro obrigatório de auditoria.
- Agregação de dados entre tenants é proibida; relatórios só agregam dados dentro do mesmo tenant.

### 2.5 Ciclo de Vida do Tenant

```
Cadastro
      ↓
Verificação de Identidade  (ignorada para auth federada)
      ↓
Seleção de Plano & Checkout
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
Encerramento: exportação de dados disponibilizada → dados retidos pelo período contratual → exclusão
```

#### Status do Tenant

| Status | Descrição | Capacidades |
|---|---|---|
| `trial` | Período gratuito de avaliação | Acesso completo com limites reduzidos |
| `active` | Assinatura ativa e em dia | Acesso completo conforme plano |
| `delinquent` | Pagamento vencido; dentro do período de carência | Acesso completo; avisos de cobrança exibidos |
| `suspended` | Carência encerrada sem pagamento | Somente leitura; sem criação ou edição |
| `canceled` | Cancelamento solicitado | Apenas exportação de dados; sem acesso operacional |

---

## 3. Cadastro e Onboarding de Usuários

### 3.1 Visão Geral do Funil de Onboarding

Todo novo usuário percorre um funil linear. Nenhum acesso operacional é concedido até que a assinatura esteja ativa e o primeiro condomínio esteja configurado.

```
[Landing Page]
      ↓
[Cadastro / Login]
      ↓  (e-mail+senha OU login federado)
[Verificação de Identidade]   ← apenas para e-mail+senha; ignorada para federado
      ↓
[Seleção de Plano & Checkout]
      ↓
[Confirmação de Pagamento]
      ↓
[Conta Ativada]   (registros de Tenant + Subscription criados)
      ↓
[Assistente de Configuração do Primeiro Condomínio]
      ↓
[Acesso Operacional]
```

### 3.2 Formas de Cadastro

Dois caminhos de autenticação são suportados:

**E-mail e senha (conta local):**

1. O usuário informa nome completo, endereço de e-mail e senha.
2. O sistema envia um e-mail de verificação com link de validade limitada.
3. A conta fica em estado `pending_verification` até que o link seja clicado.
4. Contas não verificadas não podem avançar para a seleção de plano.
5. Requisitos de senha: mínimo de 8 caracteres, ao menos uma letra maiúscula, um número e um caractere especial.

**Login federado (social):**

Provedores suportados: **Google**, **Facebook**, **Apple**.

1. O usuário seleciona um provedor e se autentica na tela de consentimento do provedor.
2. O provedor retorna uma identidade verificada (nome, e-mail, subject ID).
3. Se não existir conta ZenAndVillage para o e-mail retornado, uma é criada automaticamente com `onboarding_status = pending_subscription`.
4. A identidade é considerada pré-verificada; a etapa de confirmação de e-mail é completamente ignorada.
5. Se o e-mail retornado já pertencer a uma conta local (e-mail+senha), o usuário deve vincular explicitamente as contas antes de obter acesso — nenhuma fusão silenciosa ocorre.

### 3.3 Gate de Assinatura

Após a autenticação, se o usuário não tiver assinatura ativa, ele é direcionado para a tela de seleção de plano. Este é um bloqueio obrigatório: nenhum condomínio pode ser criado ou acessado até que um plano seja selecionado e o pagamento confirmado (ou um trial ativado).

**Ações permitidas no estado `pending_subscription`:**

- Visualizar e comparar os planos disponíveis.
- Selecionar um plano e avançar para o checkout.
- Nenhuma outra funcionalidade da plataforma está disponível.

**A seleção de plano é a decisão de negócio central:**

Escolher um plano com `max_condos = 1` posiciona o usuário como síndico individual. Escolher um plano com limites maiores o posiciona como administradora. A plataforma não exige que o usuário declare seu perfil antecipadamente — a escolha do plano é a declaração implícita.

### 3.4 Ativação da Conta

Após pagamento bem-sucedido (ou ativação do trial sem pagamento):

1. Um registro de **Tenant** é criado e vinculado ao usuário como `tenant_owner`.
2. Um registro de **Subscription** é criado com `status = trial` (trial) ou `status = active` (pago).
3. O `onboarding_status` do usuário avança para `onboarding`.
4. O usuário é redirecionado para o **Assistente de Configuração do Primeiro Condomínio**.

### 3.5 Assistente de Configuração do Primeiro Condomínio

O assistente coleta os dados mínimos necessários para criar o primeiro condomínio operacional:

1. **Identidade do condomínio:** nome, CNPJ (opcional nesta etapa), endereço, cidade, estado.
2. **Estrutura:** número de unidades, número de blocos (opcional).
3. **Atribuição de síndico:** o `tenant_owner` recebe automaticamente o papel `condo_syndic` neste condomínio.

Ao concluir o assistente:

- Um registro de **Condominium** é criado sob o tenant.
- O `onboarding_status` avança para `complete`.
- Acesso operacional completo a todos os módulos incluídos no plano é concedido.

Condomínios adicionais (até o `max_condos` do plano) podem ser criados a partir do painel do tenant a qualquer momento após o onboarding.

### 3.6 Status de Onboarding

O campo `onboarding_status` na entidade `User` rastreia a posição do usuário no funil:

| Status | Significado |
|---|---|
| `pending_verification` | Cadastrado via e-mail+senha; e-mail ainda não confirmado |
| `pending_subscription` | Identidade verificada (ou federada); sem assinatura ativa |
| `onboarding` | Assinatura ativa; assistente do primeiro condomínio não concluído |
| `complete` | Ao menos um condomínio configurado; acesso operacional completo concedido |

---

## 4. Papéis de Usuário e Permissões

### 4.1 Taxonomia de Papéis

| Papel | Nível | Capacidades |
|---|---|---|
| `platform_admin` | L0 | Acesso completo à plataforma; gestão de tenants, planos e suporte |
| `platform_support` | L0 | Acesso de leitura para suporte; não pode modificar dados de tenants |
| `tenant_owner` | L1 | Proprietário da conta do tenant; configura plano, cobrança e usuários L1 |
| `tenant_admin` | L1 | Administrador da administradora; acesso a todos os condomínios do tenant |
| `tenant_viewer` | L1 | Visão consolidada somente leitura de todos os condomínios do tenant |
| `condo_syndic` | L2 | Síndico do condomínio; gestão completa daquele condomínio |
| `condo_manager` | L2 | Gestor delegado (ex: funcionário da administradora alocado ao condomínio) |
| `condo_council` | L2 | Membro do conselho fiscal; acesso de leitura a relatórios financeiros daquele condomínio |
| `condo_staff` | L2 | Funcionário interno (zelador, porteiro); acesso operacional limitado |
| `resident_owner` | L4/L5 | Proprietário de unidade; acesso a todos os recursos do morador |
| `resident_tenant` | L4/L5 | Inquilino de unidade; acesso a recursos do morador exceto dados financeiros exclusivos do proprietário |

### 4.2 Regras de Herança de Permissão

- `tenant_admin` tem acesso implícito a todos os condomínios do seu tenant sem atribuição explícita por condomínio.
- `condo_syndic` tem acesso apenas ao(s) condomínio(s) ao(s) qual(is) está explicitamente vinculado.
- Um usuário pode ter papéis diferentes em condomínios distintos (ex: `condo_syndic` no Condomínio A, `condo_council` no Condomínio B).
- Moradores (`resident_owner`, `resident_tenant`) acessam apenas dados da(s) própria(s) unidade(s); nunca dados de outras unidades.
- Acesso entre tenants é estritamente proibido; nenhum usuário de um tenant pode acessar dados de outro, nem mesmo `platform_support` sem autorização explícita e auditada.

### 4.3 Comportamento na Suspensão para Usuários Finais

Quando um tenant é suspenso por inadimplência, os moradores (L5) mantêm acesso de leitura ao app (visualização de boletos, histórico, comunicados), para que a experiência do usuário final não seja penalizada pela inadimplência da administradora.

---

## 5. Planos e Assinaturas

### 5.1 Modelo de Comercialização

As assinaturas são vendidas no nível **Tenant (L1)**. Os limites do plano se aplicam ao conjunto de condomínios gerenciados pelo tenant. O campo `max_condos` é o principal diferenciador entre planos para síndico individual e planos para administradoras.

#### Dimensões de Limite do Plano

| Dimensão | Descrição |
|---|---|
| `max_condos` | Número máximo de condomínios ativos no tenant |
| `max_units_total` | Total de unidades em todos os condomínios |
| `max_admin_users` | Número de usuários com papéis L1/L2 (síndicos, gestores) |
| `enabled_modules` | Lista de módulos disponíveis para o tenant (ver Seção 6) |
| `data_retention_months` | Quantos meses de histórico de dados são retidos |
| `support_level` | Nível de SLA de suporte: `basic`, `priority`, `dedicated` |
| `white_label` | Marca personalizada habilitada (bool) |
| `api_access` | Acesso à API REST para integrações (bool) |

### 5.2 Entidades

> Os nomes de campos seguem a versão canônica em inglês (`software-vision.md`).

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
usage_limits: {
  active_condos, total_units, admin_users
},
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

---

## 6. Módulos da Plataforma

| ID do Módulo | Nome do Módulo | Descrição |
|---|---|---|
| `financial` | Gestão Financeira | Boletos, faturas, previsão orçamentária, gestão de inadimplência |
| `gatehouse_access` | Portaria e Controle de Acesso | Controle de acesso, registro de visitantes, QR Code, registros de acesso |
| `communication` | Comunicação | Comunicados, notificações push, mural digital |
| `reservations` | Reserva de Espaços | Gestão de reservas de áreas comuns |
| `incidents` | Ocorrências e Reclamações | Registro, acompanhamento e resolução de ocorrências |
| `polls` | Enquetes | Criação de enquetes, votação e resultados |
| `maintenance` | Manutenção | Ordens de serviço, checklists, controle de vencimentos, documentos técnicos |
| `hr_labor` | RH e Trabalhista | Gestão de funcionários, integração eSocial, suporte à folha de pagamento |
| `digital_assembly` | Assembleia Digital | Assembleias online, pauta e votação digital |
| `documents` | Documentos Legais | Armazenamento e controle de vencimento de certidões obrigatórias |
| `assets` | Gestão de Patrimônio | Inventário e ciclo de vida do patrimônio condominial |
| `inventory` | Estoque de Consumíveis | Controle de estoque, pedidos de compra, rastreamento de custos |
| `ai_insights` | Insights com IA | Relatórios inteligentes, alertas preditivos, assistente de IA |
| `white_label` | White-Label | Personalização de marca, domínio personalizado, remetente de e-mail |

> Módulos não incluídos no plano do tenant devem retornar `403 Feature not available in current plan`. Acesso parcial ou degradado não é permitido.

---

## 7. White-Label e Personalização

Tenants com o módulo `white_label` habilitado podem personalizar a experiência da plataforma para seus condomínios:

- **Nome da plataforma:** substituir "ZenAndVillage" pela marca da administradora
- **Logo:** próprio logo exibido no app e nos e-mails
- **Paleta de cores:** cores primária e secundária da identidade visual
- **Domínio personalizado:** app acessível em `app.nomeadministradora.com.br`
- **E-mail remetente:** comunicados enviados de `noreply@nomeadministradora.com.br`
- **Tela de splash personalizada:** tela de carregamento do app mobile

**Regras de white-label:**

- **RN-WL-001:** A personalização é por tenant (L1); todos os condomínios do tenant herdam a mesma marca.
- **RN-WL-002:** Condomínios independentes sem o módulo white-label utilizam a identidade padrão ZenAndVillage.
- **RN-WL-003:** O rodapé do app deve manter uma referência discreta "Powered by ZenAndVillage" no modo white-label, exceto em contratos enterprise que explicitamente dispensem esse requisito.

---

## 8. Domínio de Dados — Entidades e Atributos

> Os nomes de campos seguem a versão canônica em inglês (`software-vision.md`), que é a referência para implementação.

### Entidade: `Condominium`

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

### Entidade: `Unit`

```
id, condo_id, tenant_id,
block, floor, number,
type (apartment | office | store | parking),
private_area_sqm, ideal_fraction,
linked_parking_space,
occupancy_status (owned | rented | vacant)
```

### Entidade: `Owner`

```
id, tenant_id, condo_id,
name, cpf, rg, email, phone,
unit_id, acquisition_date,
financial_status (current | delinquent),
is_syndic, is_council_member
```

### Entidade: `Tenant` (inquilino morador)

```
id, tenant_id, condo_id,
name, cpf, email, phone,
unit_id, lease_start_date, lease_end_date,
lease_contract_url
```

### Entidade: `Employee`

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

### Entidade: `User`

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
  starts_at, ends_at?
}],
notification_preferences: {channels, schedules, types}
```

### Entidade: `Assembly`

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

### Entidade: `CondoCharge`

```
id, unit_id, condo_id, tenant_id,
billing_period (MM/YYYY),
base_fee, reserve_fund_amount, extras_amount,
total_amount, due_date,
status (pending | paid | overdue | installment_plan),
paid_at?, late_fine?, interest?,
bill_url
```

### Entidade: `MaintenanceWorkOrder`

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

### Entidade: `LegalDocument`

```
id, condo_id, tenant_id,
type (avcb | insurance | elevator_inspection | cistern | extinguisher | fire_brigade | pmoc | other),
description, issued_at, expires_at,
responsible_company, file_url,
status (valid | expired | expiring_soon)
```

### Entidade: `AccessLog`

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

### Entidade: `Notice`

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

### Entidade: `CommonArea`

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

### Entidade: `AreaReservation`

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

### Entidade: `Incident`

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

### Entidade: `Poll`

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

### Entidade: `PollResponse`

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

### Entidade: `Asset`

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

### Entidade: `AssetMovement`

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

### Entidade: `PhysicalInventory`

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

### Entidade: `StockProduct`

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

### Entidade: `StockMovement`

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

### Entidade: `PurchaseRequest`

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

### Entidade: `StockInventory`

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

---

## 9. Regras de Negócio

### 9.1 Comunicação

- **RN-COM-001:** Convocações de assembleia devem ser enviadas pelo canal formal definido na convenção (e-mail + app + mural).
- **RN-COM-002:** Comunicados sobre inadimplência devem ser enviados exclusivamente ao responsável pela unidade, nunca em grupos coletivos.
- **RN-COM-003:** Todo comunicado formal (convocação, inadimplência, multas) deve ter confirmação de leitura registrada para fins de comprovação legal.
- **RN-COM-004:** O histórico de todos os comunicados enviados deve ser arquivado com data, hora, destinatários e conteúdo.
- **RN-COM-005:** Alertas de emergência (água, gás, estrutura) devem disparar simultaneamente em todos os canais ativos (app + SMS + e-mail).

### 9.2 Reserva de Espaços

- **RN-RES-001:** Condômino inadimplente não pode realizar novas reservas de áreas comuns.
- **RN-RES-002:** Cada unidade pode ter no máximo N reservas ativas por mês; N é definido no regimento interno do condomínio.
- **RN-RES-003:** Cancelamentos fora do prazo mínimo (padrão: 24h) geram penalidade conforme regimento interno.
- **RN-RES-004:** Não comparecimento sem cancelamento pode gerar bloqueio temporário de novas reservas.
- **RN-RES-005:** Áreas com manutenção ativa devem ser bloqueadas automaticamente para novas reservas.
- **RN-RES-006:** Conflito de reservas (erro de sistema) deve ser resolvido pelo síndico; o segundo reservante recebe prioridade na próxima data disponível.
- **RN-RES-007:** O calendário de disponibilidade deve ser público (livre/ocupado) sem expor a identidade do reservante.
- **RN-RES-008:** Reservas para datas com mais de 30 dias de antecedência requerem confirmação em até 7 dias antes da data.
- **RN-RES-009:** Reservas em feriados ou fins de semana podem ter regras distintas (taxas, horários) configuráveis por condomínio.

### 9.3 Ocorrências e Reclamações

- **RN-OCO-001:** Toda ocorrência registrada deve receber número de protocolo único imediatamente após o registro.
- **RN-OCO-002:** O reclamante deve receber notificação automática a cada mudança de status.
- **RN-OCO-003:** Ocorrências de segurança com prioridade crítica devem notificar o síndico via push e SMS simultaneamente.
- **RN-OCO-004:** O síndico não pode arquivar uma ocorrência sem registrar a resolução adotada.
- **RN-OCO-005:** Ocorrências de manutenção devem gerar automaticamente uma Ordem de Serviço vinculada.
- **RN-OCO-006:** Notificações de infração ao regimento devem ter comprovante de entrega registrado para validade em eventual cobrança de multa.
- **RN-OCO-007:** O histórico de ocorrências de uma unidade deve ser consultável pelo síndico para análise de reincidência.
- **RN-OCO-008:** Ocorrências anônimas são permitidas apenas para denúncias; reclamações que gerem multa ao infrator exigem identificação do reclamante.

### 9.4 Enquetes

- **RN-ENQ-001:** Enquetes são não vinculantes e não substituem votação em assembleia para decisões que exigem quórum legal.
- **RN-ENQ-002:** Cada unidade (não cada pessoa) tem direito a um único voto por enquete, salvo configuração diferente pelo síndico.
- **RN-ENQ-003:** O prazo mínimo de uma enquete é de 48 horas para garantir participação razoável.
- **RN-ENQ-004:** Enquetes anônimas registram que a unidade votou, mas não associam o voto à identidade do morador.
- **RN-ENQ-005:** O resultado de enquetes deve ser publicado a todos os moradores após o encerramento.
- **RN-ENQ-006:** Enquetes não podem ser editadas após o início da votação; apenas canceladas com notificação de cancelamento e motivo.
- **RN-ENQ-007:** Condôminos inadimplentes podem participar de enquetes (diferente de assembleias formais, onde perdem o direito de voto).
- **RN-ENQ-008:** Enquetes de satisfação com o síndico ou administradora devem ter participação garantida a todos os moradores, sem restrição.

### 9.5 Financeiro

- **RN-FIN-001:** Cota condominial vencida gera automaticamente multa de 2% + juros de 1% ao mês após o vencimento (Art. 1.336 CC).
- **RN-FIN-002:** Condômino com débito em aberto não pode votar em assembleia (flag `financial_status = delinquent`).
- **RN-FIN-003:** O fundo de reserva não pode ser utilizado para despesas ordinárias previstas no orçamento.
- **RN-FIN-004:** A previsão orçamentária anual deve ser aprovada em AGO antes de entrar em vigor.
- **RN-FIN-005:** O fundo de reserva deve ter conta bancária separada da conta corrente operacional.
- **RN-FIN-006:** O seguro de incêndio é obrigatório; sua ausência expõe o síndico a responsabilidade pessoal.

### 9.6 Governança

- **RN-GOV-001:** Alterações na Convenção exigem aprovação de 2/3 de TODOS os condôminos.
- **RN-GOV-002:** A pauta de assembleia é fechada; apenas itens do edital oficial podem ser votados.
- **RN-GOV-003:** O síndico nunca pode presidir a própria assembleia de destituição.
- **RN-GOV-004:** Convocações de assembleia por condôminos requerem representação de pelo menos 1/4 do total de proprietários.
- **RN-GOV-005:** A ata de assembleia que altera a convenção deve ser registrada em Cartório de Registro de Imóveis.
- **RN-GOV-006:** O mandato do síndico é de no máximo 2 anos, renovável.

### 9.7 Segurança e Acesso

- **RN-SEG-001:** O uso de biometria facial exige consentimento individual e explícito; deve haver meio alternativo de acesso para quem recusar.
- **RN-SEG-002:** Imagens de câmeras só podem ser compartilhadas com autoridades via requisição formal; nunca diretamente a condôminos.
- **RN-SEG-003:** Dados de visitantes devem ter prazo de retenção definido e ser excluídos após o período.
- **RN-SEG-004:** Câmeras não podem ser posicionadas de modo a capturar áreas privativas ou interior dos apartamentos.

### 9.8 Manutenção

- **RN-MAN-001:** AVCB vencido expõe o síndico a responsabilização pessoal por qualquer sinistro.
- **RN-MAN-002:** Elevadores devem ter manutenção preventiva mensal e inspeção semestral documentadas.
- **RN-MAN-003:** Reformas em unidades privativas que afetem estrutura, hidráulica ou elétrica exigem ART/RRT antes do início.
- **RN-MAN-004:** Documentos de manutenção devem ser arquivados por no mínimo 5 anos.

### 9.9 RH e Trabalhista

- **RN-RH-001:** Todo funcionário CLT deve ser registrado no eSocial antes do início das atividades.
- **RN-RH-002:** O síndico não tem vínculo empregatício com o condomínio.
- **RN-RH-003:** Funcionários terceirizados não podem receber ordens diretas do síndico (risco de vínculo empregatício).
- **RN-RH-004:** Pagamento de verbas rescisórias deve ocorrer em até 10 dias após o desligamento.

### 9.10 Gestão de Patrimônio

- **RN-PAT-001:** Todo bem adquirido com recursos condominiais deve ser tombado antes de entrar em uso, com a nota fiscal vinculada.
- **RN-PAT-002:** O descarte de bens acima do valor limite definido na convenção exige aprovação em assembleia.
- **RN-PAT-003:** Bens ausentes no inventário físico devem gerar automaticamente uma ocorrência de extravio para investigação.
- **RN-PAT-004:** Bens com garantia ativa devem gerar alerta automático 60 dias antes do vencimento.
- **RN-PAT-005:** Nenhum bem pode sair do condomínio sem registro de movimentação patrimonial.
- **RN-PAT-006:** Bens em estado "inservível" devem ter destino registrado em até 30 dias.
- **RN-PAT-007:** O relatório patrimonial deve ser integrado ao relatório financeiro anual do síndico.
- **RN-PAT-008:** Dano a bem condominial causado por morador ou visitante gera ocorrência vinculada ao item, com opção de cobrar o responsável.
- **RN-PAT-009:** Itens vinculados a áreas comuns em manutenção devem ser sinalizados como indisponíveis no módulo de reservas.

### 9.11 Estoque de Consumíveis

- **RN-EST-001:** Toda entrada em estoque deve estar vinculada a uma nota fiscal ou documento de recebimento.
- **RN-EST-002:** Toda saída de estoque deve ser registrada com responsável identificado e centro de custo.
- **RN-EST-003:** Ao atingir o ponto de pedido, o sistema deve gerar automaticamente alerta de reposição para o síndico ou zelador.
- **RN-EST-004:** Itens com data de validade devem gerar alerta automático 30 dias antes do vencimento.
- **RN-EST-005:** Itens vencidos ou descartados devem ser baixados do estoque com motivo registrado; não podem ser contabilizados como consumo operacional.
- **RN-EST-006:** Compras acima do valor de autorização definido na convenção devem ter aprovação do síndico antes de serem processadas.
- **RN-EST-007:** Os custos de consumíveis devem ser classificados por centro de custo e refletidos no balancete mensal como despesas ordinárias.
- **RN-EST-008:** O relatório de estoque deve compor o relatório financeiro do síndico, comparando gastos reais com suprimentos vs. orçado.
- **RN-EST-009:** As políticas de estoque (mínimo, máximo, ponto de pedido) podem ser configuradas por item, por condomínio.

### 9.12 Multi-Tenancy

- **RN-MT-001:** Toda requisição à API deve validar o `tenant_id` antes de qualquer operação de dados (detalhes técnicos em `architecture-guide.md`).
- **RN-MT-002:** Consultas ao banco de dados sem filtro de `tenant_id` são proibidas em código de produção.
- **RN-MT-003:** Ao atingir o limite de condomínios ou unidades do plano, novas criações são bloqueadas com mensagem clara de upgrade.
- **RN-MT-004:** Dados de um tenant nunca são visíveis para outro tenant em nenhuma circunstância.
- **RN-MT-005:** O período de trial não se converte automaticamente em assinatura paga; requer ação explícita do `tenant_owner`.
- **RN-MT-006:** Em caso de suspensão, os moradores (L5) mantêm acesso de leitura ao app para que a experiência do usuário final não seja impactada pela inadimplência do tenant.
- **RN-MT-007:** A exclusão de um tenant deve ser precedida de exportação completa dos dados em formato estruturado (JSON/CSV) disponibilizada por ao menos 30 dias.
- **RN-MT-008:** Módulos não incluídos no plano devem retornar `403 Feature not available in current plan` — nunca exibir dados parciais.

### 9.13 White-Label

- **RN-WL-001:** A personalização white-label é por tenant (L1); todos os condomínios do tenant herdam a mesma marca.
- **RN-WL-002:** Condomínios independentes sem o módulo white-label utilizam a identidade padrão ZenAndVillage.
- **RN-WL-003:** O rodapé do app deve manter referência discreta "Powered by ZenAndVillage" no modo white-label, exceto em contratos enterprise que explicitamente dispensem.

### 9.14 Entre Condomínios da Mesma Administradora

- **RN-CT-001:** `tenant_admin` nunca acessa dados de outro tenant, mesmo que as administradoras pertençam ao mesmo grupo empresarial.
- **RN-CT-002:** Relatórios consolidados só agregam dados dentro do mesmo tenant.
- **RN-CT-003:** Um condomínio não pode ser transferido entre tenants sem processo formal de migração e consentimento por escrito do síndico responsável.
- **RN-CT-004:** A plataforma (L0) pode acessar dados de qualquer tenant apenas para fins de suporte, com registro imutável de auditoria.

### 9.15 Cadastro e Onboarding

- **RN-ONB-001:** Um usuário sem assinatura ativa (`onboarding_status = pending_subscription`) não pode criar, acessar nem interagir com nenhum dado de condomínio.
- **RN-ONB-002:** Identidade federada (Google, Facebook, Apple) é tratada como pré-verificada; a etapa de confirmação de e-mail é completamente ignorada para essas contas.
- **RN-ONB-003:** Se um provedor federado retornar um e-mail já cadastrado como conta local (e-mail+senha), o usuário deve vincular explicitamente as contas; fusão silenciosa de contas é proibida.
- **RN-ONB-004:** Uma conta local e uma conta federada com o mesmo e-mail são tratadas como identidades separadas até que o usuário as vincule explicitamente.
- **RN-ONB-005:** O Assistente de Configuração do Primeiro Condomínio deve ser concluído antes de o usuário acessar qualquer módulo operacional; contas com `onboarding_status = onboarding` estão restritas às telas do assistente.
- **RN-ONB-006:** A ativação do trial não exige dados de pagamento no momento do cadastro; a conversão para assinatura paga exige forma de pagamento válida antes do encerramento do período de trial.
- **RN-ONB-007:** Um `tenant_owner` pode ter papéis em condomínios de outros tenants como papel não-proprietário (ex: `condo_manager`); cada assinatura e cada atribuição de papel são independentes.
- **RN-ONB-008:** O `max_condos` do plano é verificado no momento da criação do condomínio; tentativas de criar condomínios além do limite são bloqueadas com prompt claro de upgrade.

---

## 10. Auditoria e Rastreabilidade

Toda operação na plataforma deve gerar um registro de auditoria associado ao tenant e ao usuário responsável.

### Entidade: `AuditLog`

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

### Regras de Auditoria

- **RN-AUD-001:** Registros de auditoria são **imutáveis**; nenhum usuário, nem mesmo `platform_admin`, pode excluir registros de auditoria.
- **RN-AUD-002:** Ações sensíveis (exportação de dados, alteração de plano, acesso L0 a um tenant) devem gerar alerta em tempo real para o `tenant_owner`.
- **RN-AUD-003:** Logs devem ser retidos pelo período definido no plano, com mínimo de 12 meses.
- **RN-AUD-004:** Em caso de incidente de segurança, os logs devem ser suficientes para reconstruir a sequência completa de ações.

---

*Documento para uso interno de desenvolvimento. Última revisão: Maio 2026 — v1.1 (adicionada Seção 3 Cadastro e Onboarding de Usuários; hierarquia L1 renomeada para Conta de Assinatura; entidade User atualizada com campos auth_provider e onboarding_status; adicionadas regras de negócio RN-ONB).*
