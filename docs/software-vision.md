# Software Vision: ZenAndVillage Platform

> **Canonical version.** This document defines the ZenAndVillage platform in American English (en-US).
> It is organized following Domain-Driven Design (DDD) principles: each section after Section 4 represents a bounded context with its own aggregate roots, entities, and business rules.
> Every change made here must be reflected in [`software-vision.pt_BR.md`](software-vision.pt_BR.md).
> For condominium domain knowledge (Brazilian law, roles, processes), refer to [`knowledge-base.md`](knowledge-base.md).
> For technical implementation decisions (stack, API contracts, infrastructure), refer to [`architecture-guide.md`](architecture-guide.md).

---

## Table of Contents

1. [Product Vision](#1-product-vision)
2. [Application Shell & UI Design](#2-application-shell--ui-design)
3. [Platform & Multi-Tenancy](#3-platform--multi-tenancy)
4. [Domain Map](#4-domain-map)
5. [Identity & Access Domain](#5-identity--access-domain)
6. [Condominium Domain](#6-condominium-domain)
7. [Financial Domain](#7-financial-domain)
8. [Communication Domain](#8-communication-domain)
9. [Gatehouse & Access Control Domain](#9-gatehouse--access-control-domain)
10. [Reservations Domain](#10-reservations-domain)
11. [Incidents Domain](#11-incidents-domain)
12. [Polls Domain](#12-polls-domain)
13. [Digital Assembly Domain](#13-digital-assembly-domain)
14. [Maintenance Domain](#14-maintenance-domain)
15. [HR & Labor Domain](#15-hr--labor-domain)
16. [Asset Management Domain](#16-asset-management-domain)
17. [Consumable Inventory Domain](#17-consumable-inventory-domain)
18. [Audit & Traceability](#18-audit--traceability)

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
| **Property Manager (Administradora)** | Consolidated dashboard across all condominiums; automated delinquency management; compliance tracking |
| **Syndic** | Single platform to manage finances, maintenance, staff, legal documents, and residents; full audit trail for legal accountability |
| **Resident / Owner** | Transparent app for fee management, reservations, incidents, and real-time communication |
| **Fiscal Council** | Direct access to financial reports and audit logs |

### 1.4 Slogan

> **Connected Communities. Intelligent Operations. Peaceful Living.**

---

## 2. Application Shell & UI Design

This section documents the established design decisions for the authenticated web application experience. These decisions are implementation-confirmed and must be preserved across all future development. For technical stack choices (React, Tailwind CSS, Zustand, shadcn/ui), refer to `docs/architecture-guide.md`.

### 2.1 Layout Structure

The authenticated application uses a **two-layer shell**:

```
┌──────────────────────────────────────────────────────────┐
│                HEADER  (56 px, full-width)               │
├─────────────┬────────────────────────────────────────────┤
│             │  [Suspended tenant banner — conditional]   │
│  SIDEBAR    ├────────────────────────────────────────────┤
│             │                                            │
│  224 px     │          MAIN CONTENT AREA                 │
│  expanded   │          max-w-7xl · 24 px padding         │
│   56 px     │                                            │
│  collapsed  │                                            │
└─────────────┴────────────────────────────────────────────┘
```

| Zone | Description |
|---|---|
| **Header** | Fixed 56 px strip spanning the full viewport width; always visible |
| **Sidebar** | Collapsible vertical strip; 224 px expanded or 56 px icon-rail; auto-collapses on viewports narrower than 1024 px |
| **Content area** | Scrollable region to the right of the sidebar; page content constrained to a maximum width of 1280 px with 24 px padding |
| **Suspended tenant banner** | Destructive-styled warning bar rendered below the header (above content) when `Tenant.subscription_status = suspended`; does not replace the header |

### 2.2 Header

The header contains, from left to right:

| Element | Position | Behavior |
|---|---|---|
| **Hamburger button** | Left | Toggles sidebar between expanded and collapsed |
| **Flexible spacer** | Center | Pushes right-side controls to the right edge |
| **Search field** | Right | Inline input on `md+` screens (208 px → 256 px on `lg`); collapses to an icon button on smaller screens that opens an animated popover (288 px wide). Keyboard shortcut hint shown inside the inline variant. |
| **Vertical separator** | Right | Visual divider |
| **Notification bell** | Right | Bell icon with numeric unread-count badge (capped at "9+"); opens/closes the Notification Panel |
| **Vertical separator** | Right | Visual divider |
| **User menu trigger** | Right | Avatar (initials on primary-color background) + display name + active tenant name (hidden on mobile) + chevron icon; opens/closes the User Menu |

Notification Panel and User Menu are **mutually exclusive** — opening one closes the other.

### 2.3 Sidebar

The sidebar has three zones:

**Logo zone (top, 56 px — matches header height):**

| State | Asset |
|---|---|
| Expanded | Full horizontal logo; light variant (`/logo-light.svg`) in light mode, dark variant (`/logo-dark.svg`) in dark mode |
| Collapsed | Square icon-only logo (`/logo-icon.svg`) |

**Main navigation (middle, flex-grow):** primary feature links.

| Label | Route |
|---|---|
| Dashboard | `/` |
| Tenants | `/tenants` |
| Property Managers | `/property-managers` |
| Condominiums | `/condominiums` |
| Residents | `/residents` |
| Employees | `/employees` |

**Utility navigation (bottom, above a separator):**

| Label | Route |
|---|---|
| Settings | `/settings` |
| Help | `/help` |

In collapsed state, item labels are hidden and icons are centered; each icon carries an `aria-label` with the label text for accessibility. The active route is highlighted with a primary-tinted background and bold font weight.

### 2.4 Notification Panel

A popover anchored below-right of the bell icon (width: 320 px).

**Structure:**

| Zone | Content |
|---|---|
| **Header row** | "Notifications" title + "Mark all read" action button |
| **Scrollable list** | Max-height 320 px; each item shows an unread indicator dot (primary color when unread, transparent when read), title, description, and relative timestamp (`Xm ago` / `Xh ago` / `Xd ago`). Clicking an item marks it as read. |
| **Footer** | "View all" link for the full notification history page |

The panel closes on outside click or Escape key. An empty state message is shown when there are no notifications.

### 2.5 User Menu

A popover anchored below-right of the user trigger (width: 288 px). Content is divided by separators into four sections:

| # | Section | Content |
|---|---|---|
| 1 | **Identity header** | User display name + email — non-interactive, read-only |
| 2 | **Preferences** | Single link navigating to `/preferences`; closes the menu |
| 3 | **Tenant selector** | Rendered only when the user has access to more than one tenant. Header label "Switch account". Lists all accessible tenants; active tenant is bold with a checkmark. Selecting a different tenant updates `activeTenantId` in the session and triggers a full page reload to flush tenant-scoped data. |
| 4 | **Sign out** | Destructive styling; clears the local session store and navigates to `/login` |

### 2.6 Preferences Page

Route: `/preferences`. Accessible via the User Menu → Preferences. Content is constrained to 672 px.

Seven settings sections, each separated by a horizontal divider:

| Section | Options | Default |
|---|---|---|
| **Color preset** | Neutral, Blue, Cyan, Emerald, Pink, Yellow, Sky, Indigo, Amber, Lime | Blue |
| **Border radius** | None (0 px), Small (7 px), Default (10 px), Large (14 px) | Default |
| **Menu color** | Default, Inverted | Default |
| **Menu accent** | Subtle, Bold | Subtle |
| **Heading font** | Inter, Oxanium, Lora | Inter |
| **Body font** | Inter, Oxanium, Lora | Inter |
| **Appearance** | Light, Dark, Auto | Auto |
| **Language** | pt_BR, en_US, Auto | Auto |

**Color preset** overrides only the primary color and the five chart palette tokens; all other theme tokens are unchanged. **Inverted** menu color applies a dark sidebar background in light mode. **Bold** menu accent uses the active primary color for the selected navigation item highlight. **Auto** appearance follows the OS `prefers-color-scheme` setting; **Auto** language follows the browser's language preference.

All preferences are stored client-side in the application store. Server-side preference persistence is not implemented in the current version.

### 2.7 Dashboard

Route: `/`. Default landing page after login. This is a **platform-level overview** for `platform_admin` and `tenant_admin`; it is not a per-condominium operational view.

**Layout — three vertical rows:**

| Row | Components |
|---|---|
| **KPI cards** | Four equal-width cards in a responsive grid (1 col → 2 col → 4 col at `sm` / `lg`). Metrics: Tenants, Condominiums, Residents, Employees. Each card shows current count + month-over-month delta. |
| **Growth + mix (2/3 + 1/3)** | Area chart: tenant account growth over 6 months. Donut chart: plan distribution (Starter / Pro / Enterprise). |
| **Analytics (three equal columns)** | Donut: resident financial status (current vs. delinquent). Donut: condominium types (residential / commercial / mixed). Horizontal bar: employee roles breakdown. |

All chart colors use the five chart palette tokens, overridden by the active color preset so charts respond correctly to all theme choices.

---

## 3. Platform & Multi-Tenancy

### 3.1 Model Overview

ZenAndVillage operates as a **hierarchical multi-tenant** model. The natural reading of the hierarchy is:

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

### 3.2 Hierarchy

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

### 3.3 Subscription Account Profiles

Every L1 account is the same entity in the data model. What differentiates an individual syndic from a property management company is exclusively the **plan they subscribe to** — specifically the plan's `max_condos` limit.

| Profile | Typical Plan | max_condos | Notes |
|---|---|---|---|
| Individual Syndic | Solo / Starter | 1 | Manages a single condominium directly |
| Small Management Co. | Professional | 5–15 | Consolidated view; API access |
| Large Management Co. | Enterprise | Unlimited | API access; dedicated support |

### 3.4 Data Isolation

- Every data record belongs to exactly one tenant and, where applicable, one condominium.
- No tenant can access another tenant's data under any circumstances.
- The platform team (L0) may access any tenant's data only for support purposes, with a mandatory audit log entry.
- Cross-tenant data aggregation is prohibited; reports only aggregate within the same tenant.

### 3.5 Tenant Lifecycle

> **Current version — no payment broker integration.** Subscription activation is performed manually by a `platform_admin` after reviewing the request. There is no automated payment processing.

```
Registration → Identity Verification → Plan Selection & Submission
      ↓
Subscription Request Submitted  (status: pending_approval)
      ↓
Platform Admin Review
      ↓ approved                         ↓ rejected
Account Activated                   Rejection with reason
(status: trial or active)           (user may resubmit)
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
Closure: data export → data retained for contractual period → deletion
```

#### Tenant Statuses

| Status | Description | Capabilities |
|---|---|---|
| `pending_approval` | Plan selected; awaiting platform admin approval | None; user sees a pending confirmation screen |
| `trial` | Approved free evaluation period | Full access with reduced limits |
| `active` | Active and approved subscription | Full access per plan |
| `delinquent` | Payment overdue; within grace period | Full access; billing warnings displayed |
| `suspended` | Grace period ended without payment | Read-only; no creation or editing |
| `canceled` | Cancellation requested | Data export only; no operational access |

### 3.6 Plans & Subscriptions

#### Plan Limitation Dimensions

| Dimension | Description |
|---|---|
| `max_condos` | Maximum number of active condominiums in the tenant |
| `max_units_total` | Total units across all condominiums |
| `max_admin_users` | Number of users with L1/L2 roles (syndics, managers) |
| `enabled_modules` | List of modules available to the tenant |
| `data_retention_months` | How many months of historical data is retained |
| `support_level` | Support SLA level: `basic`, `priority`, `dedicated` |
| `api_access` | REST API access for integrations (bool) |

#### Entity: `Plan`

```
id, name, description,
monthly_price, annual_price,
max_condos, max_units_total, max_admin_users,
enabled_modules: [module_id],
data_retention_months,
support_level (basic | priority | dedicated),
api_access (bool),
status (active | discontinued),
public (bool)
```

#### Entity: `Tenant`

```
id, name, type (management_company | independent_condo),
tax_id (cnpj), contact_email, phone,
responsible_name, responsible_email,
plan_id, subscription_status (pending_approval | trial | active | delinquent | canceled | suspended),
subscription_start_date, trial_end_date?,
billing_cycle (monthly | annual),
usage_limits: { active_condos, total_units, admin_users },
status (active | suspended | canceled)
```

#### Entity: `Subscription`

```
id, tenant_id, plan_id,
requested_at,
starts_at?, ends_at?,
cycle (monthly | annual),
contracted_amount?, discount?,
status (pending_approval | trial | active | rejected | expired | canceled),
approved_by_id?,         -- platform_admin user who approved or rejected
approved_at?,
rejection_reason?,       -- populated when status = rejected
payment_method?,         -- informational only; no automated processing in current version
payment_history: [{date, amount, status, reference}],
next_billing_date?
```

> **Note:** `payment_method` is collected for record-keeping and future integration with a payment broker. In the current version, activation is performed manually by a `platform_admin` and this field is not processed automatically.

### 3.7 Business Rules — Multi-Tenancy

- **RN-MT-001:** Every API request must validate `tenant_id` before any data operation (technical detail in `architecture-guide.md`).
- **RN-MT-002:** Database queries without a `tenant_id` filter are prohibited in production code.
- **RN-MT-003:** Upon reaching the plan's condominium or unit limit, new creations are blocked with a clear upgrade message.
- **RN-MT-004:** One tenant's data is never visible to another tenant under any circumstances.
- **RN-MT-005:** Trial does not automatically convert to a paid subscription; it requires explicit action by the `tenant_owner`.
- **RN-MT-006:** On suspension, residents (L5) retain read access to the app so the end-user experience is not impacted by the tenant's delinquency.
- **RN-MT-007:** Tenant deletion must be preceded by a full data export in structured format (JSON/CSV) made available for at least 30 days.
- **RN-MT-008:** Modules not included in the plan must return `403 Feature not available in current plan` — never display partial data.
- **RN-CT-001:** `tenant_admin` never accesses another tenant's data, even if the management companies share a corporate group.
- **RN-CT-002:** Consolidated reports only aggregate data within the same tenant.
- **RN-CT-003:** A condominium may not be transferred between tenants without a formal migration process with the responsible syndic's written consent.
- **RN-CT-004:** The platform (L0) may access any tenant's data solely for support purposes, with an immutable audit log entry recorded.

---

## 4. Domain Map

ZenAndVillage is structured around **13 bounded contexts** (business domains), each owning its aggregates, entities, and business rules. Cross-domain dependencies are explicit and unidirectional.

```
┌──────────────────────────────────────────────────────────┐
│                  PLATFORM & MULTI-TENANCY                │
│              Plan · Tenant · Subscription                 │
└──────────────────────┬───────────────────────────────────┘
                       │ owns
          ┌────────────▼────────────┐
          │  IDENTITY & ACCESS      │
          │  User · ResidentInvite  │◄─── authenticates all domains
          └────────────┬────────────┘
                       │ unit linkage
          ┌────────────▼────────────┐
          │    CONDOMINIUM          │
          │  Condo · Unit · Owner   │◄─── referenced by all operational domains
          │  OccupantTenant         │
          └──┬──────┬──────┬────────┘
             │      │      │
    ┌────────▼─┐ ┌──▼──┐ ┌─▼──────────┐
    │FINANCIAL │ │COMM.│ │  GATEHOUSE │
    │ Charges  │ │Noti-│ │  AccessLog │
    └────────┬─┘ │ces  │ └─────┬──────┘
  delinquency│   └──┬──┘       │ credential
  check      │      │          │
    ┌─────────▼──────▼──────────▼───────┐
    │          RESERVATIONS             │
    │      CommonArea · Reservation     │
    └───────────────────────────────────┘

    INCIDENTS ──► MAINTENANCE ──► ASSET MANAGEMENT
        │                │
        └────────────────┘
             work orders

    POLLS · DIGITAL ASSEMBLY · HR & LABOR · CONSUMABLE INVENTORY
    (independent domains, reference Condominium for scoping)
```

### Bounded Context Directory

| # | Domain | Aggregate Root | Section |
|---|---|---|---|
| 1 | Identity & Access | `User` | §5 |
| 2 | Condominium | `Condominium` | §6 |
| 3 | Financial | `CondoCharge` | §7 |
| 4 | Communication | `Notice` | §8 |
| 5 | Gatehouse & Access Control | `AccessLog` | §9 |
| 6 | Reservations | `AreaReservation` | §10 |
| 7 | Incidents | `Incident` | §11 |
| 8 | Polls | `Poll` | §12 |
| 9 | Digital Assembly | `Assembly` | §13 |
| 10 | Maintenance | `MaintenanceWorkOrder` | §14 |
| 11 | HR & Labor | `Employee` | §15 |
| 12 | Asset Management | `Asset` | §16 |
| 13 | Consumable Inventory | `StockProduct` | §17 |

> **Module availability:** modules not included in the tenant's plan must return `403 Feature not available in current plan`. Partial or degraded access is not permitted.

---

## 5. Identity & Access Domain

**Aggregate root:** `User`

This domain owns authentication, authorization, user lifecycle, and all onboarding flows — both the account owner subscription funnel and the invite-based resident flow.

### 5.1 Account Owner Onboarding

Applies to syndics, managers, and administradoras who create and own a subscription account.

```
[Landing Page]
      ↓
[Registration / Sign-in]  (email+password OR federated)
      ↓
[Identity Verification]   ← email path only; skipped for federated
      ↓
[Plan Selection & Submission]
      ↓
[Subscription Request Submitted]  (onboarding_status = pending_approval)
      ↓
[Platform Admin Reviews and Approves]   ← manual step; no payment broker
      ↓
[Account Activated]   (user notified by email)
      ↓
[First Condominium Setup Wizard]
      ↓
[Operational Access]
```

**Registration methods:**

*Email and password:*
1. User provides full name, email, and password.
2. System sends a verification email with a time-limited link.
3. Account stays in `pending_verification` until the link is clicked.
4. Unverified accounts cannot proceed to plan selection.
5. Password requirements: min. 8 characters, at least one uppercase letter, one number, one special character.

*Federated login — supported providers: Google, Facebook, Apple:*
1. User authenticates on the provider's consent screen.
2. Provider returns a verified identity (name, email, subject ID).
3. If no ZenAndVillage account exists for the returned email, one is created with `onboarding_status = pending_subscription`.
4. Identity is pre-verified; email confirmation step is skipped.
5. If the returned email belongs to an existing local account, the user must explicitly link the provider — no silent account merge.

**Subscription gate:** After authentication, users without an active subscription land on the plan selection screen. This is a hard gate; no condominium can be created or accessed until the subscription request is approved by the platform admin.

**Subscription request:** After plan selection and submission:
1. A `Tenant` record is created with `subscription_status = pending_approval`; user is linked as `tenant_owner`.
2. A `Subscription` record is created with `status = pending_approval` and `requested_at` timestamp.
3. `onboarding_status` advances to `pending_approval`.
4. The `platform_admin` receives a notification of the new subscription request.
5. User sees a confirmation screen informing them that their request is pending manual review; no operational access is granted during this period.

**Account activation — by platform admin:** Upon approval:
1. `platform_admin` sets `Subscription.status` to `trial` or `active` and records `approved_by_id` and `approved_at`.
2. `Tenant.subscription_status` is updated accordingly.
3. `onboarding_status` advances to `onboarding`.
4. User is notified by email that their account is active and may proceed.
5. User is redirected to the First Condominium Setup Wizard on next login.

**Rejection:** If the platform admin rejects the request:
1. `Subscription.status` is set to `rejected`; `rejection_reason` is recorded.
2. User is notified by email with the rejection reason.
3. `onboarding_status` returns to `pending_subscription` so the user may select a different plan and resubmit.

**First Condominium Setup Wizard:**
1. Condominium identity: name, CNPJ (optional), address, city, state.
2. Structure: number of units, number of blocks (optional).
3. The `tenant_owner` is automatically assigned `condo_syndic` on this condominium.
4. `onboarding_status` advances to `complete`; full operational access is granted.

### 5.2 Resident and Authorized Person Onboarding

Triggered from within an active condominium. Requires no subscription or payment.

```
[Invite email sent by condo staff / primary resident]
      ↓
[Invitee clicks invite link]
      ↓
[Registration / Login]  (email+password OR federated)
      ↓
[Identity Verification]  ← email path only; skipped for federated
      ↓
[Invite token consumed → unit linkage created]
      ↓
[onboarding_status = complete → operational access]
```

**Step 1 — Invitation:**
- A user with `condo_syndic`, `condo_manager`, or `condo_staff` role sends an email invite specifying the unit and role (`resident_owner` or `resident_tenant`).
- Only one user per role type may hold `is_primary = true` on a unit at a time.
- A `ResidentInvite` record is created bound to the invitee's email.

**Step 2 — Registration/login:** Same methods as Section 5.1. The invite token is bound to the invited email; authentication with a different email rejects the token.

**Step 3 — Unit linkage:** Token is consumed; user is linked to the unit with the designated role and `is_primary = true`. `onboarding_status` → `complete`. Residents inherit access through the tenant's subscription — no personal subscription required.

**Step 4 — Inviting additional occupants:**

| Invitee type | Role granted | Access |
|---|---|---|
| Co-resident | `resident_owner` or `resident_tenant` | Full resident access; `is_primary = false` |
| Authorized person | `authorized_person` | QR credential + biometric photo upload only |

Condo staff may also invite authorized persons directly. A user may be linked to multiple units across the same or different condominiums; each linkage is independent.

### 5.3 Onboarding Status

| Status | Meaning |
|---|---|
| `pending_verification` | Registered via email+password; email not yet confirmed |
| `pending_subscription` | Identity verified (or federated); plan not yet selected — account owners only |
| `pending_approval` | Plan selected and submitted; awaiting platform admin approval — account owners only |
| `onboarding` | Subscription approved; first condominium wizard not yet completed — account owners only |
| `complete` | Full operational access granted |

### 5.4 Role Taxonomy

| Role | Level | Capabilities |
|---|---|---|
| `platform_admin` | L0 | Full platform access; tenant, plan, and support management |
| `platform_support` | L0 | Read access for support; cannot modify tenant data |
| `tenant_owner` | L1 | Account owner; configures plan, billing, and L1 users |
| `tenant_admin` | L1 | Management company administrator; access to all condominiums in the tenant |
| `tenant_viewer` | L1 | Consolidated read-only view across all tenant condominiums |
| `condo_syndic` | L2 | Condominium syndic; full management of that condominium |
| `condo_manager` | L2 | Delegated manager (e.g., management company employee assigned to a condominium) |
| `condo_council` | L2 | Fiscal council member; read access to financial reports |
| `condo_staff` | L2 | Internal employee (superintendent, doorman); limited operational access |
| `resident_owner` | L4/L5 | Unit owner; full resident-facing access |
| `resident_tenant` | L4/L5 | Unit tenant; resident access excluding owner-only financial data |
| `authorized_person` | L4/L5 | Authorized by a resident; QR credential + biometric photo only; no operational modules |

**Permission rules:**
- `tenant_admin` has implicit access to all condominiums within their tenant without explicit per-condominium assignment.
- `condo_syndic` has access only to the condominium(s) explicitly linked to them.
- A user may hold different roles in different condominiums.
- Residents only access data for their own unit(s).
- Each unit linkage carries an `is_primary` flag. Exactly one user per role type (`resident_owner` or `resident_tenant`) may hold `is_primary = true` per unit at a time.
- `authorized_person` access is strictly limited to credential management; no operational module access.
- When a tenant is suspended, residents (L5) retain read access (bills, history, notices).
- Cross-tenant access is strictly prohibited.

### 5.5 Entities

#### Entity: `User` — Aggregate Root

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
  is_primary?,              -- true for the primary resident of a unit (one per role type per unit)
  starts_at, ends_at?
}],
notification_preferences: {channels, schedules, types}
```

#### Entity: `ResidentInvite`

```
id, condo_id, tenant_id,
unit_id,
invited_by_id,
invited_by_role (condo_syndic | condo_manager | condo_staff | resident_owner | resident_tenant),
invitee_email,
invitee_role (resident_owner | resident_tenant | authorized_person),
is_primary (bool),
token,                      -- unique, time-limited hash; single-use
status (pending | accepted | expired | revoked),
sent_at, expires_at,
accepted_at?,
revoked_by_id?, revoked_at?
```

### 5.6 Business Rules

- **RN-ONB-001:** A user with `onboarding_status` of `pending_subscription`, `pending_approval`, or `onboarding` (wizard not yet complete) cannot create, access, or interact with any condominium data.
- **RN-ONB-002:** Federated identity is treated as pre-verified; the email confirmation step is skipped.
- **RN-ONB-003:** If a federated provider returns an email already registered as a local account, the user must explicitly link the accounts; silent merging is prohibited.
- **RN-ONB-004:** There is no automated payment processing in the current version. Subscription activation is performed manually by a `platform_admin`; the `payment_method` field is collected for record-keeping and future broker integration only.
- **RN-ONB-005:** The First Condominium Setup Wizard must be completed before accessing any operational module.
- **RN-ONB-006:** The plan's `max_condos` is enforced at condominium creation time; exceeding the limit is blocked with a clear upgrade prompt.
- **RN-ONB-007:** After plan selection, the subscription request enters `pending_approval` state; no operational access is granted until a `platform_admin` explicitly approves the request.
- **RN-ONB-008:** Only `platform_admin` may approve or reject subscription requests; `platform_support` does not have this capability.
- **RN-ONB-009:** On rejection, the `rejection_reason` is mandatory and is communicated to the user by email; the user's `onboarding_status` returns to `pending_subscription` so they may resubmit.
- **RN-ONB-010:** A `platform_admin` approval sets `Subscription.status` to `trial` (evaluation) or `active` (full); the distinction is at the admin's discretion based on the agreed commercial arrangement.
- **RN-MOD-001:** The first primary resident invite for a unit must be issued by a user with `condo_syndic`, `condo_manager`, or `condo_staff` role.
- **RN-MOD-002:** Each unit may have at most one active primary resident per role type (`resident_owner` or `resident_tenant`) at any time.
- **RN-MOD-003:** The primary resident may invite co-residents and authorized persons to the same unit.
- **RN-MOD-004:** A `ResidentInvite` token is single-use and expires 7 days after issuance.
- **RN-MOD-005:** The invite token is bound to the email it was sent to; authentication with a different email rejects it.
- **RN-MOD-006:** Residents do not require a personal subscription; access is inherited through the tenant's active subscription via the unit linkage.
- **RN-MOD-007:** A user may hold active unit linkages in multiple units across the same or different condominiums; each linkage is independent.
- **RN-MOD-008:** Removing a resident revokes all their role linkages to that unit and invalidates associated credentials but preserves their platform account and other unit linkages.
- **RN-MOD-009:** The primary resident may revoke invites they issued. `condo_syndic` or `condo_manager` may revoke any unit invite regardless of issuer.
- **RN-MOD-010:** `authorized_person` access is strictly limited to QR credential generation and biometric photo upload; no operational module is accessible.

---

## 6. Condominium Domain

**Aggregate root:** `Condominium`

This domain owns the physical and legal structure of the condominium: the building itself, its units, unit owners, and occupant tenants. It is the foundational domain that all other operational domains reference for scoping.

### 6.1 Entities

#### Entity: `Condominium` — Aggregate Root

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

#### Entity: `Unit`

```
id, condo_id, tenant_id,
block, floor, number,
type (apartment | office | store | parking),
private_area_sqm, ideal_fraction,
linked_parking_space,
occupancy_status (owned | rented | vacant)
```

#### Entity: `Owner`

```
id, tenant_id, condo_id,
name, cpf, rg, email, phone,
unit_id, acquisition_date,
financial_status (current | delinquent),
is_syndic, is_council_member
```

#### Entity: `OccupantTenant`

> Represents a unit occupant who rents (not owns) the unit. Named `OccupantTenant` to distinguish from the platform-level `Tenant` (subscription account).

```
id, tenant_id, condo_id,
name, cpf, email, phone,
unit_id, lease_start_date, lease_end_date,
lease_contract_url
```

### 6.2 Business Rules — Governance

- **RN-GOV-001:** Bylaw amendments require approval of 2/3 of ALL condominium owners.
- **RN-GOV-002:** The assembly agenda is closed; only items listed in the official summons may be voted on.
- **RN-GOV-003:** The syndic may never chair their own removal assembly.
- **RN-GOV-004:** Assembly summons by owners require representation of at least 1/4 of the total owners.
- **RN-GOV-005:** Assembly minutes that amend bylaws must be registered at the Real Estate Registry Office.
- **RN-GOV-006:** The syndic's term is at most 2 years, renewable.

---

## 7. Financial Domain

**Aggregate root:** `CondoCharge`

This domain owns condominium fee billing, delinquency tracking, budget management, and the reserve fund. Delinquency state produced here is consumed by the Reservations and Digital Assembly domains.

### 7.1 Entities

#### Entity: `CondoCharge` — Aggregate Root

```
id, unit_id, condo_id, tenant_id,
billing_period (MM/YYYY),
base_fee, reserve_fund_amount, extras_amount,
total_amount, due_date,
status (pending | paid | overdue | installment_plan),
paid_at?, late_fine?, interest?,
bill_url
```

### 7.2 Business Rules

- **RN-FIN-001:** Overdue condominium fee automatically accrues a 2% fine + 1% monthly interest after the due date (Art. 1,336 CC).
- **RN-FIN-002:** Owner with outstanding debt may not vote at assembly (`financial_status = delinquent` flag on `Owner`).
- **RN-FIN-003:** The reserve fund may not be used for ordinary expenses already budgeted.
- **RN-FIN-004:** The annual budget forecast must be approved at the AGO before taking effect.
- **RN-FIN-005:** The reserve fund must have a separate bank account from the operational checking account.
- **RN-FIN-006:** Fire insurance is mandatory; its absence exposes the syndic to personal liability.

---

## 8. Communication Domain

**Aggregate root:** `Notice`

This domain owns all outbound communications to residents: formal notices, delinquency alerts, summons, emergency broadcasts, and general announcements.

### 8.1 Entities

#### Entity: `Notice` — Aggregate Root

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

### 8.2 Business Rules

- **RN-COM-001:** Assembly summons must be sent via the formal channel defined in the bylaws (email + app + bulletin board).
- **RN-COM-002:** Delinquency notices must be sent exclusively to the responsible unit owner, never in group channels.
- **RN-COM-003:** Every formal notice (summons, delinquency, fines) must have a registered read receipt for legal proof purposes.
- **RN-COM-004:** The history of all notices sent must be archived with date, time, recipients, and content.
- **RN-COM-005:** Emergency alerts (water, gas, structural) must trigger simultaneously across all active channels (app + SMS + email).
- **RN-COM-006:** Notices are delivered to users with `resident_owner` or `resident_tenant` roles on the target unit. Users with the `authorized_person` role do not receive operational notices.

---

## 9. Gatehouse & Access Control Domain

**Aggregate root:** `AccessLog`

This domain owns physical access to the condominium: entry/exit logging, visitor management, QR code credentials, and biometric enrollment. It consumes credential data from the Identity & Access domain.

### 9.1 Entities

#### Entity: `AccessLog` — Aggregate Root

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

### 9.2 Business Rules

- **RN-SEG-001:** Facial biometrics require individual, explicit consent; an alternative access method must exist for those who decline. This rule applies to all users uploading biometric photos, including those with the `authorized_person` role.
- **RN-SEG-002:** Camera footage may only be shared with authorities via formal request; never directly to unit owners.
- **RN-SEG-003:** Visitor data must have a defined retention period and be deleted after the period.
- **RN-SEG-004:** Cameras may not be positioned to capture private areas or apartment interiors.
- **RN-SEG-005:** An `authorized_person`'s QR credential is valid only while their unit role linkage is active; revocation of the linkage immediately invalidates the credential.

---

## 10. Reservations Domain

**Aggregate root:** `AreaReservation`

This domain owns common area configuration and reservation management. It consumes delinquency state from the Financial domain and access status from the Maintenance domain.

### 10.1 Entities

#### Entity: `CommonArea`

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

#### Entity: `AreaReservation` — Aggregate Root

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

### 10.2 Business Rules

- **RN-RES-001:** Delinquent unit owners may not make new reservations for common areas.
- **RN-RES-002:** Each unit may have at most N active reservations per month; N is defined in the condominium's internal regulations.
- **RN-RES-003:** Cancellations outside the minimum notice period (default: 24h) incur a penalty per internal regulations.
- **RN-RES-004:** No-show without cancellation may result in a temporary block on new reservations.
- **RN-RES-005:** Areas with active maintenance must be automatically blocked for new reservations.
- **RN-RES-006:** Reservation conflicts (system error) must be resolved by the syndic; the second reservant receives priority at the next available date.
- **RN-RES-007:** The reservation calendar must be publicly visible (free/occupied status only) without exposing the reservant's identity.
- **RN-RES-008:** Reservations for dates more than 30 days in advance require confirmation within 7 days of the date.
- **RN-RES-009:** Reservations on holidays or weekends may have different rules (fees, hours) as configured per condominium.
- **RN-RES-010:** Only users with `resident_owner` or `resident_tenant` roles may make reservations. Users with the `authorized_person` role cannot reserve common areas.

---

## 11. Incidents Domain

**Aggregate root:** `Incident`

This domain owns the registration, tracking, and resolution of complaints, violations, and general incidents. Maintenance incidents trigger work orders in the Maintenance domain.

### 11.1 Entities

#### Entity: `Incident` — Aggregate Root

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

### 11.2 Business Rules

- **RN-OCO-001:** Every filed incident must receive a unique protocol number immediately upon submission.
- **RN-OCO-002:** The complainant must receive automatic notification at every status change.
- **RN-OCO-003:** Security incidents with critical priority must notify the syndic via push notification and SMS simultaneously.
- **RN-OCO-004:** The syndic may not archive an incident without recording the resolution adopted.
- **RN-OCO-005:** Maintenance incidents must automatically generate a linked Work Order in the Maintenance domain.
- **RN-OCO-006:** Internal regulations infraction notices must have registered delivery confirmation for validity in potential fine collection.
- **RN-OCO-007:** The incident history for a unit must be queryable by the syndic for repeat-offense analysis.
- **RN-OCO-008:** Anonymous incidents are permitted for reports only; complaints that result in a fine to the offender require the complainant to be identified.

---

## 12. Polls Domain

**Aggregate root:** `Poll`

This domain owns non-binding resident polls. Poll voting rights are independent of financial delinquency (unlike formal assemblies).

### 12.1 Entities

#### Entity: `Poll` — Aggregate Root

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

#### Entity: `PollResponse`

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

### 12.2 Business Rules

- **RN-ENQ-001:** Polls are non-binding and do not replace an assembly vote for decisions requiring a legal quorum.
- **RN-ENQ-002:** Each unit (not each person) has the right to one vote per poll, unless the syndic configures otherwise.
- **RN-ENQ-003:** The minimum duration of a poll is 48 hours to ensure reasonable participation.
- **RN-ENQ-004:** Anonymous polls record that the unit voted but do not associate the vote with the resident's identity.
- **RN-ENQ-005:** Poll results must be published to all residents after closing.
- **RN-ENQ-006:** Polls may not be edited after voting begins; they may only be canceled with a cancellation notice and reason.
- **RN-ENQ-007:** Delinquent owners may participate in polls (unlike formal assemblies, where they lose voting rights).
- **RN-ENQ-008:** Satisfaction polls about the syndic or management company must be available to all residents with no restrictions.

---

## 13. Digital Assembly Domain

**Aggregate root:** `Assembly`

This domain owns formal condominium assemblies (AGO and AGE), including agenda management, quorum control, digital voting, and minutes. Voting rights are gated by financial status from the Financial domain.

### 13.1 Entities

#### Entity: `Assembly` — Aggregate Root

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

### 13.2 Business Rules

- **RN-ASS-001:** Assembly summons must respect the notice period defined in the bylaws (minimum 3 days for AGE, minimum 8 days for AGO).
- **RN-ASS-002:** Owners with `financial_status = delinquent` may not vote at assemblies (per RN-FIN-002).
- **RN-ASS-003:** Bylaw amendments require a 2/3 quorum of all condominium owners (per RN-GOV-001).
- **RN-ASS-004:** The syndic may never chair their own removal assembly (per RN-GOV-003).
- **RN-ASS-005:** Digital assembly minutes must be archived with date, attendees, votes, and the elected syndic's digital signature.
- **RN-ASS-006:** Minutes that amend bylaws must be registered at the Real Estate Registry Office after the assembly.

---

## 14. Maintenance Domain

**Aggregate root:** `MaintenanceWorkOrder`

This domain owns scheduled and corrective maintenance, legal compliance documents (AVCB, insurance, inspections), and checklist tracking. Work orders may be created manually or automatically by the Incidents domain.

### 14.1 Entities

#### Entity: `MaintenanceWorkOrder` — Aggregate Root

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

#### Entity: `LegalDocument`

```
id, condo_id, tenant_id,
type (avcb | insurance | elevator_inspection | cistern | extinguisher | fire_brigade | pmoc | other),
description, issued_at, expires_at,
responsible_company, file_url,
status (valid | expired | expiring_soon)
```

### 14.2 Business Rules

- **RN-MAN-001:** Expired AVCB exposes the syndic to personal liability for any incident.
- **RN-MAN-002:** Elevators must have documented monthly preventive maintenance and semi-annual inspections.
- **RN-MAN-003:** Renovations in private units affecting structure, plumbing, or electrical require ART/RRT before starting.
- **RN-MAN-004:** Maintenance documents must be kept for at least 5 years.

---

## 15. HR & Labor Domain

**Aggregate root:** `Employee`

This domain owns direct and outsourced employee management for condominium staff, including eSocial integration, schedules, and employment contract lifecycle.

### 15.1 Entities

#### Entity: `Employee` — Aggregate Root

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

### 15.2 Business Rules

- **RN-RH-001:** Every CLT employee must be registered in eSocial before starting work.
- **RN-RH-002:** The syndic has no employment relationship with the condominium.
- **RN-RH-003:** Outsourced employees may not receive direct orders from the syndic (risk of establishing a direct employment relationship).
- **RN-RH-004:** Termination amounts must be paid within 10 days of dismissal.

---

## 16. Asset Management Domain

**Aggregate root:** `Asset`

This domain owns the inventory, lifecycle, and movement of all physical assets acquired with condominium funds. Asset damage can generate incidents in the Incidents domain; assets linked to common areas affect availability in the Reservations domain.

### 16.1 Entities

#### Entity: `Asset` — Aggregate Root

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

#### Entity: `AssetMovement`

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

#### Entity: `PhysicalInventory`

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

### 16.2 Business Rules

- **RN-PAT-001:** Every asset acquired with condominium funds must be tagged before being put into use, with the invoice linked.
- **RN-PAT-002:** Disposal of assets above the value limit defined in the bylaws requires assembly approval.
- **RN-PAT-003:** Assets missing from the physical inventory must automatically generate a loss incident in the Incidents domain.
- **RN-PAT-004:** Assets with an active warranty must generate an automatic alert 60 days before expiry.
- **RN-PAT-005:** No asset may be removed from the condominium without an asset movement record.
- **RN-PAT-006:** Assets in "unusable" condition must have their destination recorded within 30 days.
- **RN-PAT-007:** The asset report must be integrated into the syndic's annual financial report.
- **RN-PAT-008:** Damage to a condominium asset caused by a resident or visitor generates a linked incident with the option to charge the responsible party.
- **RN-PAT-009:** Items linked to common areas under maintenance must be flagged as unavailable in the Reservations domain.

---

## 17. Consumable Inventory Domain

**Aggregate root:** `StockProduct`

This domain owns supply stock control, replenishment workflows, and purchase request approvals. Costs are classified by cost center and reflected in the Financial domain's monthly balance sheet.

### 17.1 Entities

#### Entity: `StockProduct` — Aggregate Root

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

#### Entity: `StockMovement`

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

#### Entity: `PurchaseRequest`

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

#### Entity: `StockInventory`

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

### 17.2 Business Rules

- **RN-EST-001:** Every stock entry must be linked to an invoice or receipt document.
- **RN-EST-002:** Every stock exit must be recorded with an identified responsible party and a cost center.
- **RN-EST-003:** Upon reaching the reorder point, the system must automatically generate a replenishment alert for the syndic or building superintendent.
- **RN-EST-004:** Items with an expiry date must generate an automatic alert 30 days before expiry.
- **RN-EST-005:** Expired or discarded items must be written off from stock with a recorded reason; they may not be counted as operational consumption.
- **RN-EST-006:** Purchases above the authorization value defined in the bylaws must have syndic approval before being processed.
- **RN-EST-007:** Consumable costs must be classified by cost center and reflected in the monthly balance sheet as ordinary expenses.
- **RN-EST-008:** The inventory report must be part of the syndic's financial report, showing actual supply spending vs. budgeted.
- **RN-EST-009:** Stock policies (minimum, maximum, reorder point) may be configured per item, per condominium.

---

## 18. Audit & Traceability

**Cross-cutting concern.** Every write operation across all domains must generate an immutable audit log entry associated with the tenant and the responsible user.

### 18.1 Entity: `AuditLog`

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

### 18.2 Business Rules

- **RN-AUD-001:** Audit logs are **immutable**; no user, not even `platform_admin`, may delete audit records.
- **RN-AUD-002:** Sensitive actions (data export, plan change, L0 access to a tenant) must generate a real-time alert to the `tenant_owner`.
- **RN-AUD-003:** Logs must be retained for the period defined in the plan, with a minimum of 12 months.
- **RN-AUD-004:** In the event of a security incident, logs must be sufficient to reconstruct the full sequence of actions.
