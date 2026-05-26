# Software Vision: ZenAndVillage Platform

> **Canonical version.** This document defines the ZenAndVillage platform in American English (en-US): product vision, multi-tenancy business model, user registration and onboarding, user roles, plans, data entities, and platform business rules.
> Every change made here must be reflected in [`software-vision.pt_BR.md`](software-vision.pt_BR.md).
> For condominium domain knowledge (Brazilian law, roles, processes), refer to [`knowledge-base.md`](knowledge-base.md).
> For technical implementation decisions (stack, API contracts, infrastructure), refer to [`architecture-guide.md`](architecture-guide.md).

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Multi-Tenancy Business Model](#2-multi-tenancy-business-model)
3. [User Registration and Onboarding](#3-user-registration-and-onboarding)
4. [User Roles and Permissions](#4-user-roles-and-permissions)
5. [Plans and Subscriptions](#5-plans-and-subscriptions)
6. [Platform Modules](#6-platform-modules)
7. [White-Label and Customization](#7-white-label-and-customization)
8. [Data Domain — Entities and Attributes](#8-data-domain--entities-and-attributes)
9. [Business Rules](#9-business-rules)
10. [Audit and Traceability](#10-audit-and-traceability)

---

## 1. Product Vision

### 1.1 Problem Statement

Condominium management in Brazil is fragmented across disconnected tools: spreadsheets for finances, WhatsApp for communication, paper for maintenance logs, and no unified view for property management companies that oversee dozens of condominiums simultaneously. Syndics are legally accountable but lack the infrastructure to manage, document, and audit all their obligations.

### 1.2 Solution

ZenAndVillage is an **AI-powered B2B2C SaaS platform** for condominium and community management. It serves two primary customer segments:

- **Property Management Companies (Administradoras):** companies managing multiple condominiums on behalf of syndics. They need a consolidated operational view, centralized reporting, and tools to serve all their condominiums from a single platform.
- **Self-managed Condominiums:** buildings with an independent syndic (resident or professional) who manages the condominium directly without a management company.

### 1.3 Value Proposition

| Stakeholder | Value |
|---|---|
| **Property Manager (Administradora)** | Consolidated dashboard across all condominiums; automated delinquency management; compliance tracking; white-label branding for their clients |
| **Syndic** | Single platform to manage finances, maintenance, staff, legal documents, and residents; full audit trail for legal accountability |
| **Resident / Owner** | Transparent app for fee management, reservations, incidents, and real-time communication |
| **Fiscal Council** | Direct access to financial reports and audit logs |

### 1.4 Slogan

> **Connected Communities. Intelligent Operations. Peaceful Living.**

---

## 2. Multi-Tenancy Business Model

### 2.1 Model Overview

ZenAndVillage operates as a **hierarchical multi-tenant** model. A single platform deployment serves multiple completely isolated subscription accounts (tenants). The natural reading of the hierarchy is:

```
Platform → Subscription Account → Condominiums → Blocks → Units → Residents
```

A subscription account (called **Tenant** in the data model) is the contractual and billing unit: it holds a plan, owns 1 to N condominiums according to that plan, and is fully isolated from every other account on the platform.

```
┌─────────────────────────────────────────────┐
│           ZENANDVILLAGE PLATFORM             │
│                 (SaaS Layer)                 │
└──────────────┬──────────────────────────────┘
               │
   ┌───────────┼────────────┐
   ▼           ▼            ▼
[Account A] [Account B]  [Account C]
Mgmt. Co.   Mgmt. Co.    Independent
XYZ         ABC          Syndic
   │           │              │
 ┌─┴─┐       ┌─┴─┐          [C5]
[C1][C2]   [C3][C4]        1 condo
```

### 2.2 Hierarchy

```
Platform (ZenAndVillage)
└── Subscription Account / Tenant
    └── Condominium  (1 to N, governed by plan's max_condos)
        └── Block / Tower
            └── Unit
                └── Resident / Owner / Occupant
```

| Level | Entity | Description |
|---|---|---|
| **L0** | Platform | ZenAndVillage platform itself; exclusive access by ZenEngineeringLab team |
| **L1** | Subscription Account (Tenant) | The contractual and billing unit; owns a plan that determines how many condominiums may be managed |
| **L2** | Condominium | Operational unit; always belongs to one L1 account |
| **L3** | Block / Tower | Physical grouping within the condominium (optional) |
| **L4** | Unit | Apartment, office, store, parking space |
| **L5** | End User | Resident, owner, occupant — linked to one or more units |

### 2.3 Subscription Account Profiles

Every L1 account is the same entity in the data model. What differentiates an individual syndic from a property management company is exclusively the **plan they subscribe to** — specifically the plan's `max_condos` limit.

| Profile | Typical Plan | max_condos | Notes |
|---|---|---|---|
| Individual Syndic | Solo / Starter | 1 | Manages a single condominium directly |
| Small Management Co. | Professional | 5–15 | Consolidated view; may enable white-label |
| Large Management Co. | Enterprise | Unlimited | Full white-label; API access; dedicated support |

The `type` field on the Tenant entity (`management_company` | `independent_condo`) is retained for features that differ by profile (e.g., consolidated reporting, white-label eligibility) but it does not impose structural access differences — the plan limits are the authoritative constraint.

**Management Company Account (L1):**

- Manages N condominiums under one subscription.
- Has a consolidated view across all their condominiums.
- May enable white-label branding.
- Configures defaults that child condominiums may inherit.

**Independent Syndic Account (L1):**

- Self-managed building not linked to a management company.
- Syndic accesses directly without an intermediary.
- Uses the default ZenAndVillage identity (no white-label by default).
- Plan limit of `max_condos = 1` enforces single-condominium scope.

### 2.4 Data Isolation

- Every data record belongs to exactly one tenant and, where applicable, one condominium.
- No tenant can access another tenant's data under any circumstances.
- The platform team (L0) may access any tenant's data only for support purposes, with a mandatory audit log entry.
- Cross-tenant data aggregation is prohibited; reports only aggregate within the same tenant.

### 2.5 Tenant Lifecycle

```
Registration
      ↓
Identity Verification  (skipped for federated auth)
      ↓
Plan Selection & Checkout
      ↓
Account Activated  (status: trial or active)
      ↓
First Condominium Setup Wizard
      ↓
Active Operation
      ↓
   [Delinquency] → Payment overdue → Grace period (7 days) → Suspension
   [Cancellation] → Cancellation requested → Grace period → Closure
      ↓
Suspension: read-only access; all write operations blocked
      ↓
Closure: data export made available → data retained for contractual period → deletion
```

#### Tenant Statuses

| Status | Description | Capabilities |
|---|---|---|
| `trial` | Free evaluation period | Full access with reduced limits |
| `active` | Active and current subscription | Full access per plan |
| `delinquent` | Payment overdue; within grace period | Full access; billing warnings displayed |
| `suspended` | Grace period ended without payment | Read-only; no creation or editing |
| `canceled` | Cancellation requested | Data export only; no operational access |

---

## 3. User Registration and Onboarding

### 3.1 Onboarding Funnel Overview

Every new user progresses through a linear funnel. No operational access is granted until the subscription is active and the first condominium is configured.

```
[Landing Page]
      ↓
[Registration / Sign-in]
      ↓  (email+password OR federated)
[Identity Verification]   ← email path only; skipped for federated
      ↓
[Plan Selection & Checkout]
      ↓
[Payment Confirmation]
      ↓
[Account Activated]   (Tenant + Subscription records created)
      ↓
[First Condominium Setup Wizard]
      ↓
[Operational Access]
```

### 3.2 Registration Methods

Two authentication paths are supported:

**Email and password (local account):**

1. User provides full name, email address, and password.
2. System sends a verification email with a time-limited link.
3. Account is in `pending_verification` state until the link is clicked.
4. Unverified accounts cannot proceed to plan selection.
5. Password requirements: minimum 8 characters, at least one uppercase letter, one number, and one special character.

**Federated (social) login:**

Supported providers: **Google**, **Facebook**, **Apple**.

1. User selects a provider and authenticates on the provider's consent screen.
2. The provider returns a verified identity (name, email, subject ID).
3. If no ZenAndVillage account exists for the returned email, one is created automatically with `onboarding_status = pending_subscription`.
4. Identity is considered pre-verified; the email confirmation step is skipped entirely.
5. If the returned email already belongs to a local (email+password) account, the user must explicitly link the provider before access is granted — no silent merge occurs.

### 3.3 Subscription Gate

After authentication, if the user has no active subscription, they land on the plan selection screen. This is a hard gate: no condominium can be created or accessed until a plan is selected and payment is confirmed (or a trial is activated).

**Permitted actions in `pending_subscription` state:**

- View and compare available plans.
- Select a plan and proceed to checkout.
- No other platform functionality is available.

**Plan selection is the key business decision:**

Choosing a plan with `max_condos = 1` positions the user as an individual syndic. Choosing a plan with higher limits positions them as a property management company. The platform does not require the user to declare their profile upfront — the plan choice is the implicit declaration.

### 3.4 Account Activation

After successful payment (or trial activation without payment):

1. A **Tenant** record is created and linked to the user as `tenant_owner`.
2. A **Subscription** record is created with `status = trial` (trial) or `status = active` (paid).
3. `onboarding_status` on the User is advanced to `onboarding`.
4. The user is redirected to the **First Condominium Setup Wizard**.

### 3.5 First Condominium Setup Wizard

The wizard collects the minimum data required to create the first operational condominium:

1. **Condominium identity:** name, CNPJ (optional at this stage), address, city, state.
2. **Structure:** number of units, number of blocks (optional).
3. **Syndic assignment:** the `tenant_owner` is automatically assigned the `condo_syndic` role on this condominium.

Upon wizard completion:

- A **Condominium** record is created under the tenant.
- `onboarding_status` is advanced to `complete`.
- Full operational access to all modules included in the plan is granted.

Additional condominiums (up to the plan's `max_condos`) may be created from the tenant dashboard at any time after onboarding is complete.

### 3.6 Onboarding Status

The `onboarding_status` field on the `User` entity tracks funnel position:

| Status | Meaning |
|---|---|
| `pending_verification` | Registered via email+password; email not yet confirmed |
| `pending_subscription` | Identity verified (or federated); no active subscription yet |
| `onboarding` | Subscription active; first condominium wizard not yet completed |
| `complete` | At least one condominium configured; full operational access granted |

---

## 4. User Roles and Permissions

### 4.1 Role Taxonomy

| Role | Level | Capabilities |
|---|---|---|
| `platform_admin` | L0 | Full platform access; tenant, plan, and support management |
| `platform_support` | L0 | Read access for support purposes; cannot modify tenant data |
| `tenant_owner` | L1 | Tenant account owner; configures plan, billing, and L1 users |
| `tenant_admin` | L1 | Management company administrator; access to all condominiums in the tenant |
| `tenant_viewer` | L1 | Consolidated read-only view across all tenant condominiums |
| `condo_syndic` | L2 | Condominium syndic; full management of that condominium |
| `condo_manager` | L2 | Delegated manager (e.g., management company employee assigned to a condominium) |
| `condo_council` | L2 | Fiscal council member; read access to financial reports for that condominium |
| `condo_staff` | L2 | Internal employee (superintendent, doorman); limited operational access |
| `resident_owner` | L4/L5 | Unit owner; access to all resident-facing features |
| `resident_tenant` | L4/L5 | Unit tenant; access to resident features excluding owner-only financial data |

### 4.2 Permission Inheritance Rules

- `tenant_admin` has implicit access to all condominiums within their tenant without explicit per-condominium assignment.
- `condo_syndic` has access only to the condominium(s) they are explicitly linked to.
- A user may hold different roles in different condominiums (e.g., `condo_syndic` in Condo A, `condo_council` in Condo B).
- Residents (`resident_owner`, `resident_tenant`) only access data for their own unit(s); they never access data from other units.
- Cross-tenant access is strictly prohibited; no user of one tenant may access another tenant's data, not even `platform_support` without explicit, audited authorization.

### 4.3 Suspension Behavior for End Users

When a tenant is suspended due to delinquency, residents (L5) retain read access to the app (view bills, history, notices) so the end-user experience is not penalized by the management company's payment status.

---

## 5. Plans and Subscriptions

### 5.1 Commercialization Model

Subscriptions are sold at the **Tenant (L1)** level. Plan limits apply to the entire set of condominiums managed by the tenant. The `max_condos` field is the primary differentiator between individual syndic plans and management company plans.

#### Plan Limitation Dimensions

| Dimension | Description |
|---|---|
| `max_condos` | Maximum number of active condominiums in the tenant |
| `max_units_total` | Total units across all condominiums |
| `max_admin_users` | Number of users with L1/L2 roles (syndics, managers) |
| `enabled_modules` | List of modules available to the tenant (see Section 6) |
| `data_retention_months` | How many months of historical data is retained |
| `support_level` | Support SLA level: `basic`, `priority`, `dedicated` |
| `white_label` | Custom branding enabled (bool) |
| `api_access` | REST API access for integrations (bool) |

### 5.2 Entities

#### Entity: `Plan`

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

#### Entity: `Tenant`

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

#### Entity: `Subscription`

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

## 6. Platform Modules

| Module ID | Module Name | Description |
|---|---|---|
| `financial` | Financial Management | Billing, invoices, budget forecast, delinquency management |
| `gatehouse_access` | Gatehouse and Access Control | Access control, visitor registration, QR Code, access logs |
| `communication` | Communication | Notices, push notifications, digital bulletin board |
| `reservations` | Space Reservations | Common area reservation management |
| `incidents` | Incidents and Complaints | Incident registration, tracking, and resolution |
| `polls` | Polls | Poll creation, voting, and results |
| `maintenance` | Maintenance | Work orders, checklists, expiry tracking, technical documents |
| `hr_labor` | HR and Labor | Employee management, eSocial integration, payroll support |
| `digital_assembly` | Digital Assembly | Online assemblies, agenda, and digital voting |
| `documents` | Legal Documents | Storage and expiry tracking of mandatory certifications |
| `assets` | Asset Management | Condominium asset inventory and lifecycle management |
| `inventory` | Consumable Inventory | Supply stock control, purchase requests, cost tracking |
| `ai_insights` | AI Insights | Smart reports, predictive alerts, AI assistant |
| `white_label` | White-Label | Brand customization, custom domain, email sender |

> Modules not included in the tenant's plan must return `403 Feature not available in current plan`. Partial or degraded access is not permitted.

---

## 7. White-Label and Customization

Tenants with the `white_label` module enabled may customize the platform experience for their condominiums:

- **Platform name:** replace "ZenAndVillage" with the management company's brand
- **Logo:** own logo displayed in the app and emails
- **Color palette:** primary and secondary colors of the brand identity
- **Custom domain:** app accessible at `app.companynamexyz.com.br`
- **Sender email:** notices sent from `noreply@companynamexyz.com.br`
- **Custom splash screen:** mobile app loading screen

**White-label rules:**

- **RN-WL-001:** Customization is per tenant (L1); all condominiums in the tenant inherit the same branding.
- **RN-WL-002:** Independent condominiums without the white-label module use the default ZenAndVillage identity.
- **RN-WL-003:** The app footer must retain a discreet "Powered by ZenAndVillage" reference even in white-label mode, except in enterprise contracts that explicitly waive this requirement.

---

## 8. Data Domain — Entities and Attributes

### Entity: `Condominium`

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

### Entity: `Unit`

```
id, condo_id, tenant_id,
block, floor, number,
type (apartment | office | store | parking),
private_area_sqm, ideal_fraction,
linked_parking_space,
occupancy_status (owned | rented | vacant)
```

### Entity: `Owner`

```
id, tenant_id, condo_id,
name, cpf, rg, email, phone,
unit_id, acquisition_date,
financial_status (current | delinquent),
is_syndic, is_council_member
```

### Entity: `Tenant` (resident)

```
id, tenant_id, condo_id,
name, cpf, email, phone,
unit_id, lease_start_date, lease_end_date,
lease_contract_url
```

### Entity: `Employee`

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

### Entity: `User`

```
id, email, name, cpf?,
auth_provider (local | google | facebook | apple),
auth_provider_id?,          -- subject ID returned by the federated provider
password_hash?,             -- null for federated accounts
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

### Entity: `Assembly`

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

### Entity: `CondoCharge`

```
id, unit_id, condo_id, tenant_id,
billing_period (MM/YYYY),
base_fee, reserve_fund_amount, extras_amount,
total_amount, due_date,
status (pending | paid | overdue | installment_plan),
paid_at?, late_fine?, interest?,
bill_url
```

### Entity: `MaintenanceWorkOrder`

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

### Entity: `LegalDocument`

```
id, condo_id, tenant_id,
type (avcb | insurance | elevator_inspection | cistern | extinguisher | fire_brigade | pmoc | other),
description, issued_at, expires_at,
responsible_company, file_url,
status (valid | expired | expiring_soon)
```

### Entity: `AccessLog`

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

### Entity: `Notice`

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

### Entity: `CommonArea`

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

### Entity: `AreaReservation`

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

### Entity: `Incident`

```
id, condo_id, tenant_id,
protocol (unique, auto-generated),
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

### Entity: `Poll`

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

### Entity: `PollResponse`

```
id, poll_id, condo_id, tenant_id,
unit_id,
resident_id? (null if anonymous),
responded_at,
chosen_options: [option_id],
scale_value?,
open_text?,
ranking_options: [{option_id, position}]?
```

### Entity: `Asset`

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

### Entity: `AssetMovement`

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

### Entity: `PhysicalInventory`

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

### Entity: `StockProduct`

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

### Entity: `StockMovement`

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

### Entity: `PurchaseRequest`

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

### Entity: `StockInventory`

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

## 9. Business Rules

### 9.1 Communication

- **RN-COM-001:** Assembly summons must be sent via the formal channel defined in the bylaws (email + app + bulletin board).
- **RN-COM-002:** Delinquency notices must be sent exclusively to the responsible unit owner, never in group channels.
- **RN-COM-003:** Every formal notice (summons, delinquency, fines) must have a registered read receipt for legal proof purposes.
- **RN-COM-004:** The history of all notices sent must be archived with date, time, recipients, and content.
- **RN-COM-005:** Emergency alerts (water, gas, structural) must trigger simultaneously across all active channels (app + SMS + email).

### 9.2 Space Reservations

- **RN-RES-001:** Delinquent unit owners may not make new reservations for common areas.
- **RN-RES-002:** Each unit may have at most N active reservations per month; N is defined in the condominium's internal regulations.
- **RN-RES-003:** Cancellations outside the minimum notice period (default: 24h) incur a penalty per internal regulations.
- **RN-RES-004:** No-show without cancellation may result in a temporary block on new reservations.
- **RN-RES-005:** Areas with active maintenance must be automatically blocked for new reservations.
- **RN-RES-006:** Reservation conflicts (system error) must be resolved by the syndic; the second reservant receives priority at the next available date.
- **RN-RES-007:** The reservation calendar must be publicly visible (free/occupied status only) without exposing the reservant's identity.
- **RN-RES-008:** Reservations for dates more than 30 days in advance require confirmation within 7 days of the date.
- **RN-RES-009:** Reservations on holidays or weekends may have different rules (fees, hours) as configured per condominium.

### 9.3 Incidents and Complaints

- **RN-OCO-001:** Every filed incident must receive a unique protocol number immediately upon submission.
- **RN-OCO-002:** The complainant must receive automatic notification at every status change.
- **RN-OCO-003:** Security incidents with critical priority must notify the syndic via push notification and SMS simultaneously.
- **RN-OCO-004:** The syndic may not archive an incident without recording the resolution adopted.
- **RN-OCO-005:** Maintenance incidents must automatically generate a linked Work Order.
- **RN-OCO-006:** Internal regulations infraction notices must have registered delivery confirmation for validity in potential fine collection.
- **RN-OCO-007:** The incident history for a unit must be queryable by the syndic for repeat-offense analysis.
- **RN-OCO-008:** Anonymous incidents are permitted for reports only; complaints that result in a fine to the offender require the complainant to be identified.

### 9.4 Polls

- **RN-ENQ-001:** Polls are non-binding and do not replace an assembly vote for decisions requiring a legal quorum.
- **RN-ENQ-002:** Each unit (not each person) has the right to one vote per poll, unless the syndic configures otherwise.
- **RN-ENQ-003:** The minimum duration of a poll is 48 hours to ensure reasonable participation.
- **RN-ENQ-004:** Anonymous polls record that the unit voted but do not associate the vote with the resident's identity.
- **RN-ENQ-005:** Poll results must be published to all residents after closing.
- **RN-ENQ-006:** Polls may not be edited after voting begins; they may only be canceled with a cancellation notice and reason.
- **RN-ENQ-007:** Delinquent owners may participate in polls (unlike formal assemblies, where they lose voting rights).
- **RN-ENQ-008:** Satisfaction polls about the syndic or management company must be available to all residents with no restrictions.

### 9.5 Financial

- **RN-FIN-001:** Overdue condominium fee automatically accrues a 2% fine + 1% monthly interest after the due date (Art. 1,336 CC).
- **RN-FIN-002:** Owner with outstanding debt may not vote at assembly (`financial_status = delinquent` flag).
- **RN-FIN-003:** The reserve fund may not be used for ordinary expenses already budgeted.
- **RN-FIN-004:** The annual budget forecast must be approved at the AGO before taking effect.
- **RN-FIN-005:** The reserve fund must have a separate bank account from the operational checking account.
- **RN-FIN-006:** Fire insurance is mandatory; its absence exposes the syndic to personal liability.

### 9.6 Governance

- **RN-GOV-001:** Bylaw amendments require approval of 2/3 of ALL condominium owners.
- **RN-GOV-002:** The assembly agenda is closed; only items listed in the official summons may be voted on.
- **RN-GOV-003:** The syndic may never chair their own removal assembly.
- **RN-GOV-004:** Assembly summons by owners require representation of at least 1/4 of the total owners.
- **RN-GOV-005:** Assembly minutes that amend bylaws must be registered at the Real Estate Registry Office.
- **RN-GOV-006:** The syndic's term is at most 2 years, renewable.

### 9.7 Security and Access

- **RN-SEG-001:** Facial biometrics require individual, explicit consent; an alternative access method must exist for those who decline.
- **RN-SEG-002:** Camera footage may only be shared with authorities via formal request; never directly to unit owners.
- **RN-SEG-003:** Visitor data must have a defined retention period and be deleted after the period.
- **RN-SEG-004:** Cameras may not be positioned to capture private areas or apartment interiors.

### 9.8 Maintenance

- **RN-MAN-001:** Expired AVCB exposes the syndic to personal liability for any incident.
- **RN-MAN-002:** Elevators must have documented monthly preventive maintenance and semi-annual inspections.
- **RN-MAN-003:** Renovations in private units affecting structure, plumbing, or electrical require ART/RRT before starting.
- **RN-MAN-004:** Maintenance documents must be kept for at least 5 years.

### 9.9 HR and Labor

- **RN-RH-001:** Every CLT employee must be registered in eSocial before starting work.
- **RN-RH-002:** The syndic has no employment relationship with the condominium.
- **RN-RH-003:** Outsourced employees may not receive direct orders from the syndic (risk of establishing a direct employment relationship).
- **RN-RH-004:** Termination amounts must be paid within 10 days of dismissal.

### 9.10 Asset Management

- **RN-PAT-001:** Every asset acquired with condominium funds must be tagged before being put into use, with the invoice linked.
- **RN-PAT-002:** Disposal of assets above the value limit defined in the bylaws requires assembly approval.
- **RN-PAT-003:** Assets missing from the physical inventory must automatically generate a loss incident for investigation.
- **RN-PAT-004:** Assets with an active warranty must generate an automatic alert 60 days before expiry.
- **RN-PAT-005:** No asset may be removed from the condominium without an asset movement record.
- **RN-PAT-006:** Assets in "unusable" condition must have their destination recorded within 30 days.
- **RN-PAT-007:** The asset report must be integrated into the syndic's annual financial report.
- **RN-PAT-008:** Damage to a condominium asset caused by a resident or visitor generates a linked incident with the option to charge the responsible party.
- **RN-PAT-009:** Items linked to common areas under maintenance must be flagged as unavailable in the reservations module.

### 9.11 Consumable Inventory

- **RN-EST-001:** Every stock entry must be linked to an invoice or receipt document.
- **RN-EST-002:** Every stock exit must be recorded with an identified responsible party and a cost center.
- **RN-EST-003:** Upon reaching the reorder point, the system must automatically generate a replenishment alert for the syndic or building superintendent.
- **RN-EST-004:** Items with an expiry date must generate an automatic alert 30 days before expiry.
- **RN-EST-005:** Expired or discarded items must be written off from stock with a recorded reason; they may not be counted as operational consumption.
- **RN-EST-006:** Purchases above the authorization value defined in the bylaws must have syndic approval before being processed.
- **RN-EST-007:** Consumable costs must be classified by cost center and reflected in the monthly balance sheet as ordinary expenses.
- **RN-EST-008:** The inventory report must be part of the syndic's financial report, showing actual supply spending vs. budgeted.
- **RN-EST-009:** Stock policies (minimum, maximum, reorder point) may be configured per item, per condominium.

### 9.12 Multi-Tenancy

- **RN-MT-001:** Every API request must validate `tenant_id` before any data operation (technical detail in `architecture-guide.md`).
- **RN-MT-002:** Database queries without a `tenant_id` filter are prohibited in production code.
- **RN-MT-003:** Upon reaching the plan's condominium or unit limit, new creations are blocked with a clear upgrade message.
- **RN-MT-004:** One tenant's data is never visible to another tenant under any circumstances.
- **RN-MT-005:** Trial does not automatically convert to a paid subscription; it requires explicit action by the `tenant_owner`.
- **RN-MT-006:** On suspension, residents (L5) retain read access to the app so the end-user experience is not impacted by the tenant's delinquency.
- **RN-MT-007:** Tenant deletion must be preceded by a full data export in structured format (JSON/CSV) made available for at least 30 days.
- **RN-MT-008:** Modules not included in the plan must return `403 Feature not available in current plan` — never display partial data.

### 9.13 White-Label

- **RN-WL-001:** White-label customization is per tenant (L1); all condominiums in the tenant inherit the same branding.
- **RN-WL-002:** Independent condominiums without the white-label module use the default ZenAndVillage identity.
- **RN-WL-003:** The app footer must retain a discreet "Powered by ZenAndVillage" reference in white-label mode, except in enterprise contracts that explicitly waive it.

### 9.14 Cross-Tenant (Management Company)

- **RN-CT-001:** `tenant_admin` never accesses another tenant's data, even if the management companies share a corporate group.
- **RN-CT-002:** Consolidated reports only aggregate data within the same tenant.
- **RN-CT-003:** A condominium may not be transferred between tenants without a formal migration process with the responsible syndic's written consent.
- **RN-CT-004:** The platform (L0) may access any tenant's data solely for support purposes, with an immutable audit log entry recorded.

### 9.15 User Registration and Onboarding

- **RN-ONB-001:** A user without an active subscription (`onboarding_status = pending_subscription`) cannot create, access, or interact with any condominium data.
- **RN-ONB-002:** Federated identity (Google, Facebook, Apple) is treated as pre-verified; the email confirmation step is skipped entirely for these accounts.
- **RN-ONB-003:** If a federated provider returns an email already registered as a local (email+password) account, the user must explicitly link the accounts; silent account merging is prohibited.
- **RN-ONB-004:** A user registered under a local account and a federated account with the same email are treated as separate identities until explicitly linked by the user.
- **RN-ONB-005:** The First Condominium Setup Wizard must be completed before the user can access any operational module; accounts in `onboarding_status = onboarding` are limited to the wizard screens only.
- **RN-ONB-006:** Trial activation does not require payment details at sign-up; conversion to a paid subscription requires a valid payment method before the trial period ends.
- **RN-ONB-007:** A `tenant_owner` may hold roles in other tenants' condominiums as a non-owner role (e.g., `condo_manager`); each subscription and each role assignment is independent.
- **RN-ONB-008:** The plan's `max_condos` is enforced at condominium creation time; attempting to create a condominium beyond the limit is blocked with a clear upgrade prompt.

---

## 10. Audit and Traceability

Every operation on the platform must generate an audit log associated with the tenant and the responsible user.

### Entity: `AuditLog`

```
id, tenant_id, condo_id?,
user_id, user_role,
action (create | update | delete | read_sensitive | login | logout | export),
affected_entity, entity_id,
previous_data?: (JSON snapshot),
new_data?: (JSON snapshot),
source_ip, user_agent,
occurred_at,
success (bool), failure_reason?
```

### Audit Rules

- **RN-AUD-001:** Audit logs are **immutable**; no user, not even `platform_admin`, may delete audit records.
- **RN-AUD-002:** Sensitive actions (data export, plan change, L0 access to a tenant) must generate a real-time alert to the `tenant_owner`.
- **RN-AUD-003:** Logs must be retained for the period defined in the plan, with a minimum of 12 months.
- **RN-AUD-004:** In the event of a security incident, logs must be sufficient to reconstruct the full sequence of actions.

---

*Document for internal development use. Last review: May 2026 — v1.1 (added Section 3 User Registration and Onboarding; clarified Subscription as the L1 hierarchy layer; updated User entity with auth_provider and onboarding_status fields; added RN-ONB business rules).*
