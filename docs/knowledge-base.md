# Knowledge Base: Condominium Management in Brazil

> **Canonical version.** This document is the authoritative reference in American English (en-US).
> Every change made here must be reflected in [`knowledge-base-pt_BR.md`](knowledge-base-pt_BR.md).

---

## Table of Contents

1. [Legal and Regulatory Framework](#1-legal-and-regulatory-framework)
2. [Actors and Roles](#2-actors-and-roles)
3. [Governance and Assemblies](#3-governance-and-assemblies)
4. [Financial Management](#4-financial-management)
5. [Employee and HR Management](#5-employee-and-hr-management)
6. [Security and Access Control](#6-security-and-access-control)
7. [Building Maintenance and Technical Standards](#7-building-maintenance-and-technical-standards)
8. [LGPD Compliance](#8-lgpd-compliance)
9. [Communication and Resident Relations](#9-communication-and-resident-relations)
10. [Technology and Digitalization](#10-technology-and-digitalization)
11. [Data Domain — Entities and Attributes](#11-data-domain--entities-and-attributes)
12. [Critical Business Rules](#12-critical-business-rules)
13. [Condominium Glossary](#13-condominium-glossary)
14. [Multi-Tenancy Architecture](#14-multi-tenancy-architecture)
15. [Condominium Asset Management](#15-condominium-asset-management)
16. [Consumable Inventory Management](#16-consumable-inventory-management)

---

## 1. Legal and Regulatory Framework

### 1.1 Key Legislation

| Law / Standard | Description | Scope |
|---|---|---|
| **Law no. 4,591/1964** | Condominiums and Real Estate Incorporation Act. Founding statute. Governs constitution, incorporation, and structural aspects of condominiums. | National |
| **Law no. 10,406/2002 — Civil Code** | Arts. 1,331 to 1,358: "Building Condominium". Governs day-to-day operations — rights, duties, assemblies, syndic, bylaws. In force since 2003. | National |
| **Law no. 8,245/1991 (Tenancy Act)** | Governs lease relationships. Defines which condominium expenses are the tenant's responsibility vs. the owner's. | National |
| **Law no. 13,709/2018 (LGPD)** | General Personal Data Protection Act. Impacts all processing of residents', visitors', and employees' data. | National |
| **CLT — Decree-Law no. 5,452/1943** | Governs the employment relationship between the condominium and its employees. | National |
| **Labor Reform — Law no. 13,467/2017** | Updates the CLT: intermittent contracts, individual hour-bank agreements, 12×36 shifts by written agreement, broad outsourcing. | National |
| **Decree no. 11,905/2024** | Updates labor obligations; consolidates use of eSocial and DET (Electronic Labor Domicile) for condominiums. | National |
| **ABNT NBR 5674:2024** | Requirements for building maintenance management. Central technical reference. | Technical |

### 1.2 Condominium Normative Hierarchy

```
Federal Constitution
       ↓
  Civil Code (Law 10,406/2002) — arts. 1,331–1,358
       ↓
   Law 4,591/64 (supplementary for incorporations)
       ↓
  Condominium Bylaws (registered at the Real Estate Registry Office)
       ↓
  Internal Regulations
       ↓
  Assembly Resolutions
```

**Rule:** No condominium document may contradict a higher-hierarchy rule.

### 1.3 Constitutive Documents

**Condominium Bylaws (Convenção de Condomínio)**

- Legal instrument defining coexistence and administration rules.
- Must be registered at the Real Estate Registry Office to have legal validity (Art. 9, §1, Law 4,591/64).
- Approval: signatures representing at least **2/3 of the ideal fractions** of the condominium.
- Amendments: also require 2/3 of votes.
- Mandatory minimum content: description and individualization of units, ideal fraction per unit, purpose of common areas, manner of use and administration, condominium charges and apportionment method.

**Internal Regulations (Regimento Interno)**

- Governs use of common areas, schedules, pets, renovations, behavior.
- May be part of the Bylaws or a separate document.
- Approval: simple majority of condominiums present at assembly.

---

## 2. Actors and Roles

### 2.1 Syndic (Síndico)

**Legal basis:** Arts. 1,347 and 1,348 of the Civil Code.

**Profile:**

- Resident (condominium owner) or external professional (professional syndic).
- Term of **up to 2 years**, re-election allowed.
- Elected at assembly.

**Duties (Art. 1,348 CC):**

- Convene condominium assemblies.
- Represent the condominium, actively and passively, in court or outside it.
- Immediately inform the assembly of any judicial or administrative proceedings affecting the condominium.
- Comply with and enforce the bylaws, internal regulations, and assembly resolutions.
- Ensure the conservation and custody of common areas and the provision of services of interest to residents.
- Prepare the **revenue and expense budget** for each year.
- Collect condominium fees and impose and collect applicable fines.
- Report accounts to the assembly annually and on demand.
- Maintain building insurance.
- Hire and dismiss employees.

**Legal status of the syndic:**

- No employment relationship with the condominium (not subject to CLT).
- Compensation (pro labore) or exemption from condominium fee, if provided in bylaws or resolved at assembly.
- Pays INSS as individual contributor (11% rate); condominium pays 20%.
- May be removed at any time by an assembly convened by 1/4 of condominiums.

**Professional Syndic:**

- Provides services via a service agreement (not an employee).
- Growing trend of professional condominium management.

### 2.2 Fiscal Council (Conselho Fiscal)

**Legal basis:** Art. 1,356 of the Civil Code.

- Composed of **3 members** elected at assembly.
- Term of up to **2 years**.
- Primary function: review the syndic's accounts and issue an opinion.
- May also be advisory, assisting the syndic in decisions.

### 2.3 Property Management Company (Administradora)

- Company contracted to support the syndic in operational, financial, and documentary management.
- Legal responsibility remains with the syndic; the management company is contractually liable.
- Typical functions: billing, payroll, financial reporting, contracts, assemblies.

### 2.4 Condominium Owner (Condômino / Proprietário)

**Rights:**

- Use and enjoy common areas according to their purpose (pool, lounge, etc.).
- Vote at assemblies (provided they are current on payments).
- Access condominium accounts and documents.
- Access parking spaces linked to their unit (STJ ruling 2024: linked spaces are exclusive property, unless the bylaws state otherwise).

**Duties:**

- Pay the condominium fee on time.
- Comply with the bylaws and internal regulations.
- Not carry out renovations without notifying the syndic (NBR 16280).
- Contribute to the reserve fund as defined by the bylaws.

### 2.5 Tenant (Inquilino / Locatário)

- Has the same coexistence duties as the owner.
- Pays **ordinary expenses** of the condominium (routine maintenance, salaries, etc.).
- The **reserve fund** and **extraordinary expenses** (structural works, improvements) are the owner's responsibility, unless otherwise agreed.
- **Tenancy Act (8,245/91)** defines the division of responsibilities.

### 2.6 Condominium Employees

Typical positions (vary by size):

| Position | Primary Function |
|---|---|
| Building Superintendent (Zelador) | General supervision, first-level maintenance, team coordination |
| Doorman (Porteiro) | Access control, reception, service |
| General Services Assistant (ASG) | Cleaning and upkeep of common areas |
| Security Guard (Vigia) | Monitoring and patrol |
| Receptionist | Service in upscale condominiums |

---

## 3. Governance and Assemblies

### 3.1 Types of Assembly

**Ordinary General Assembly (AGO):**

- Held **at least once a year**.
- Mandatory agenda: approval of prior-year accounts, budget forecast for the next year, election of syndic (when applicable).

**Extraordinary General Assembly (AGE):**

- Convened when an urgent or out-of-cycle topic arises.
- May be convened by the syndic or by 1/4 of condominium owners.

**Permitted formats:**

- In-person, virtual (online), or hybrid.
- Digital voting valid provided authenticity and secrecy are guaranteed.
- Digital proxies accepted unless restricted by the bylaws.

### 3.2 Notice of Assembly

- Responsibility of the syndic (Art. 1,348, I, CC).
- Must include: date, venue/link, time of 1st and 2nd call (minimum 30-minute interval), full agenda (order of business), required quorum for each item.
- **Only items listed on the notice may be voted on.**
- Notice period as defined by the bylaws (usually 5 to 10 days).

### 3.3 Quorum Table

| Subject | 1st Call | Required Vote |
|---|---|---|
| Approval of accounts / Budget forecast | Half of condominium owners | Majority of those present |
| Election / Removal of syndic | Half of condominium owners | Majority of those present (50%+1 of those present) |
| Removal of syndic by owners | 1/4 convenes; any number approves | Simple majority of those present |
| Transfer of syndic's powers | — | Absolute majority (50%+1 of ALL owners) |
| Luxury works (improvement) | Half of owners | Absolute majority (all owners) |
| Useful works (remote gatehouse, meters) | Half of owners | Absolute majority (all owners) |
| Necessary urgent works | Any number | Majority of those present |
| Amendment to Bylaws | Any number | 2/3 of all condominium owners |
| Amendment to Internal Regulations | Any number | Simple majority of those present |
| 2nd Call (general rule) | Any number | Majority of those present |

> **Note:** At the 2nd call, the assembly deliberates with a majority of votes of those present, except for special quorums provided by law or bylaws (Art. 1,352 CC). If the special quorum is not reached, the session may be converted to a standing session with a new date within 60 days.

### 3.4 Assembly Minutes (Ata)

- Document formalizing all resolutions.
- Must be prepared by a secretary elected at the assembly.
- Must be distributed to all condominium owners after the assembly.
- For bylaw amendments: must be registered at the Real Estate Registry Office.
- In digital assemblies: recording the session is recommended to support drafting the minutes.

---

## 4. Financial Management

### 4.1 Condominium Fee (Cota Condominial)

- Monthly mandatory contribution by each unit to cover condominium expenses.
- Calculated based on the ideal fraction or equal shares per unit (defined in the bylaws).
- Must cover: ordinary expenses + reserve fund + emergency provisions.
- Adjustment: must be approved at assembly with transparency.

**Apportionment criteria (defined in the bylaws):**

- **By ideal fraction:** each unit contributes proportionally to its size/fraction.
- **Per unit (equal):** each unit pays the same amount.
- **Hybrid:** some expenses by ideal fraction, others per unit.

### 4.2 Expense Categories

**Ordinary Expenses (tenant's or owner's responsibility):**

- Employee payroll (salaries, charges, benefits)
- Water, gas, electricity for common areas
- Preventive and corrective equipment maintenance
- Outsourced cleaning, landscaping, and security services
- Mandatory insurance
- Cleaning and consumable supplies
- Reserve fund contributions (replenishment)
- Management company fees

**Extraordinary Expenses (owner's responsibility):**

- Structural works and improvements
- Elevator modernization
- Facade painting
- Acquisition of common-area equipment
- Initial constitution of the reserve fund

### 4.3 Reserve Fund (Fundo de Reserva)

**Legal basis:** Art. 1,336 of the Civil Code (obligation to contribute as defined by bylaws); bylaws must define the percentage and purpose.

**Characteristics:**

- Works as the condominium's "savings" to cover emergency expenses not budgeted in the ordinary plan.
- Monthly contribution: between **5% and 10%** of the condominium fee.
- Ideal balance: between **1× and 3×** the monthly collection amount.
- Must have a dedicated bank account for control.
- **Must NOT be used** for ordinary or routine expenses.
- Constitution: requires approval of **2/3 of condominium owners** at assembly.
- By law (8,245/91): the reserve fund is the owner's charge, except when partially or fully replenished by the tenant.

**Permitted uses:**

- Emergency repairs (pipe burst, structural failure, etc.)
- Temporary coverage of high delinquency (if provided in bylaws)
- Unforeseeable large expenses

**NOT permitted uses:**

- Current and scheduled expenses
- Replacement of operating cash to cover recurring cash-flow deficits

### 4.4 Budget Forecast

**Legal basis:** Art. 1,348, VIII, CC — the syndic is obligated to prepare the annual budget.

**Process:**

1. Review the financial history of the last 24 months (balance sheets, contracts, consumption).
2. Map and categorize all expenses: fixed, variable, emergency, reserve fund.
3. Estimate adjustments: inflation (IPCA/IGPM), salary floors, service contracts.
4. Calculate the historical delinquency rate and project its cash-flow impact.
5. Calculate the required reserve fund balance.
6. Define a fair and balanced condominium fee.
7. Present and approve at the **Ordinary General Assembly**.

**Common mistakes to avoid:**

- Ignoring historical delinquency when projecting revenues.
- Not budgeting for possible extraordinary expenses.
- Not updating contracts with the correct adjustment indices.
- Raising the fee without clear and transparent communication.

### 4.5 Delinquency (Inadimplência)

**Legal consequences for the delinquent owner:**

- Fine of up to **2% of the debt** (Art. 1,336, §1 CC).
- Interest of 1% per month.
- May not vote at assembly while delinquent.
- Debt may be enforced in court (collection action or enforcement of extrajudicial title).
- Property may be seized even if it is a family homestead (confirmed STJ ruling).

**Management strategies:**

- Preventive communication (notification before due date).
- Installment plan offer (approved at assembly).
- Amicable collection before judicial action.
- Negotiation via mediation chamber.

### 4.6 Financial Reporting

- Syndic's obligation: annual, at AGO, and when demanded by owners.
- Must include: monthly balance sheets, revenue and expense statement, reserve fund extract, copies of relevant contracts and invoices.
- Fiscal Council issues an opinion on the accounts.
- Documentation must be kept for at least 5 years.

### 4.7 Mandatory Insurance

**Legal basis:** Art. 1,346 of the Civil Code.

- The condominium is **required** to maintain fire insurance and coverage for other disasters causing destruction.
- Coverage value: full reconstruction cost of the building.
- Contracting responsibility: syndic.
- Policy must be renewed annually and kept on file.

---

## 5. Employee and HR Management

### 5.1 Legal Framework

- The condominium, when hiring employees, is treated as an employer (Art. 2, §1, CLT).
- All labor rights under the CLT apply in full.
- The condominium has a CNPJ and is directly responsible for all labor obligations.

### 5.2 Typical Positions and Working Hours

| Position | Common Schedule |
|---|---|
| Building Superintendent | 8h/day, 44h/week; or 12×36 per collective agreement |
| Doorman | 12×36 hours (provided in most collective agreements) |
| Security Guard | 12×36 hours |
| General Services Assistant | 8h/day, 44h/week; or part-time contract |

**12×36 shift:** 12 hours of work followed by 36 hours of rest. May be established by **individual written agreement** since the 2017 Labor Reform (previously required a union agreement).

### 5.3 Labor Charges and Obligations

Condominium obligations as an employer:

- Employment card registration (digital CTPS via eSocial)
- eSocial registration (mandatory and fully applicable to condominiums)
- Monitoring and submissions to DET (Electronic Labor Domicile) — Decree 11,905/2024
- Salary payment by the **5th business day**
- FGTS payment (8% of salary)
- Employer INSS contribution (20%)
- 13th salary: 1st installment by November; 2nd by December 20
- Vacation: 30 calendar days per 12 months, with 1/3 additional pay
- Transportation voucher (unless collective agreement provides otherwise)
- Benefits per CCT (Collective Labor Agreement) by category and city
- Occupational medicine: ASO, PCMSO, PPRA (depending on headcount)
- Mandatory timekeeping

### 5.4 Overtime

- Minimum surcharge of **50%** on the normal hourly rate (Monday to Saturday).
- Surcharge of **100%** on Sundays and holidays.
- Hour bank: may be established by individual written agreement (monthly, semi-annual, or annual).
- Monthly compensation: written agreement required.

### 5.5 Outsourcing

- Permitted for any activity after the Labor Reform (including gatehouse, cleaning, and security).
- The condominium retains **subsidiary liability** if the outsourcing company fails to meet labor obligations.
- The syndic may not exercise direct managerial authority over outsourced employees (risk of establishing a direct employment relationship).
- Before contracting: verify CNPJ, licenses, negative debt certificates (Federal Revenue, Labor), complaint history.
- In the contract: clause requiring monthly delivery of payment receipts (INSS, FGTS, tax slips).

### 5.6 Termination

- Deadline for payment of termination amounts: **10 days** after dismissal.
- Mutual rescission (distrato): worker receives 80% of FGTS, 50% of notice pay and rescission fine, but is not entitled to unemployment benefits.
- Union endorsement: **no longer required** since the Labor Reform.

### 5.7 Syndic vs. Employee

- The syndic is **not** an employee of the condominium.
- No employment relationship; not subject to the CLT.
- Resident syndic: may be compensated via pro labore or exempted from the condominium fee, if provided in bylaws or approved at assembly.
- Professional syndic: provides services via a service agreement (as a legal entity or independent contractor).

---

## 6. Security and Access Control

### 6.1 Gatehouse Models

**On-site Gatehouse (Organic):**

- Doorman who is a direct employee (CLT) or outsourced.
- Physical presence 24 hours or in shifts.
- Higher cost; human connection with residents.

**Remote Gatehouse (Virtual):**

- External monitoring center operates cameras, intercoms, and access controls.
- Growth of 24% per year in the sector (ABESE, 2024).
- More than 14,000 condominiums in Brazil already use this model.
- Expected growth of 25.3% in 2025 (ABESE).
- Technology: AI cameras, facial recognition, intelligence for risk identification.
- Requires strict LGPD compliance.
- **Note:** Federal District banned it by law; São Paulo has a bill under discussion (no. 906/2023).

**Hybrid Gatehouse:**

- Combination of on-site doorman during peak hours + remote monitoring at other times.
- Model that balances cost and human presence.

### 6.2 Access Control

**Technologies used:**

- Analog and digital (app) intercom
- RFID tags / badges
- QR Code for visitors
- Facial recognition (biometrics) — use grew 47% between 2022 and 2024 (ABESE)
- License plate readers (OCR)
- Self-service kiosks

**Typical access flows:**

- **Resident:** access via tag, facial, or app without interacting with the gatehouse.
- **Visitor:** release by resident via app or intercom; data recorded (name, CPF, photo).
- **Service provider:** prior or real-time authorization by the resident; mandatory registration.
- **Delivery person:** managed via smart locker or simplified protocol.

### 6.3 CCTV (Security Cameras)

**Legal rules:**

- Cameras may only be installed in **common areas** (not in private areas).
- Positioning must avoid capturing apartment interiors.
- In São Paulo: mandatory informational signs at all monitored points (Law 13,541/2003).
- Access to footage: restricted to syndic and council; only authorities in formal investigations.
- Condominiums must NOT provide footage directly to unit owners (violates LGPD — São Paulo Court of Justice, repeated rulings).
- Storage: limited and defined period; controlled access.
- Mandatory training for anyone who handles footage.

**Facial Recognition — special attention:**

- Biometric data is sensitive data under LGPD.
- Requires **explicit and individual consent** from each resident.
- An **alternative access method** must be available for those who do not consent.
- A Data Protection Impact Report (RIPD) is required.
- The condominium may not penalize or restrict access for those who refuse biometric use.

### 6.4 Perimeter Security

- Motion and intrusion sensors integrated with cameras and monitoring centers.
- AI video analysis: person detection, abandoned objects, suspicious behavior.
- Zonal perimeter alarms (each section of the perimeter is monitored independently).
- Integration: remote gatehouse + CCTV + access control = unified ecosystem.

---

## 7. Building Maintenance and Technical Standards

### 7.1 General Principle

Building maintenance is the syndic's obligation (Art. 1,348 CC) and is governed primarily by **ABNT NBR 5674:2024**, which requires the creation of a **Maintenance Plan** with preventive, corrective, and predictive activities, deadline control, and formal documentation.

### 7.2 Key ABNT Standards for Condominiums

There are more than 100 ABNT standards impacting condominiums. The most critical:

| Standard | Topic |
|---|---|
| NBR 5674:2024 | Building maintenance management — central reference |
| NBR 5410 | Low-voltage electrical installations |
| NBR 5419 | Lightning protection (SPDA) |
| NBR 5626 | Cold-water plumbing |
| NBR 8160 | Sanitary sewer installation |
| NBR 9050 | Accessibility for buildings and spaces |
| NBR 9077 | Emergency exits in buildings |
| NBR 9441 | Fire detection and alarm systems |
| NBR 10818 | Pool water quality |
| NBR 12693 | Sprinkler protection systems |
| NBR 13752 | Engineering inspections in civil construction |
| NBR 14037 | Building use, operation, and maintenance manual |
| NBR 15527 | Rainwater reuse |
| NBR 15575-1 | Performance of residential buildings |
| NBR 16042 | Semi-annual elevator inspection |
| NBR 16071 | Playgrounds — design, installation, and maintenance |
| NBR 16280:2024 | Building renovation management system |
| NBR 16537:2024 | Tactile floor signage |
| NBR 16747 | Building inspection |
| NBR 16858 | Passenger elevators — safety |

### 7.3 Mandatory Documents and Certifications

| Document / Certificate | Frequency | Responsible |
|---|---|---|
| **AVCB** (Fire Department Inspection Certificate) | 3 years (SP — Decree 69,118/2024 and IT-01/2025) | Syndic |
| **RIA** (Annual Elevator Inspection Report) | Annual (municipal law in many cities) | Maintenance company |
| **Cistern cleaning and bacteriological analysis** | Semi-annual (recommended) or per local regulation | Specialized company |
| **Fire extinguisher recharge** | Annual + after use | Certified company |
| **Extinguisher hydrostatic test** | Every 5 years | Certified company |
| **Gas network inspection** | Annual | Licensed company |
| **Fire Brigade Certificate** | Annual | Collective training |
| **PMOC** (HVAC Maintenance, Operation, and Control Plan) | Per ANVISA regulation | Specialized company |
| **Pest / rodent control** | Semi-annual (minimum) | Licensed company |
| **Fire insurance** | Annual (renewal) | Syndic (required by law) |
| **ART/RRT for works and renovations** | Per work/renovation | Engineer / Architect |
| **Waterproofing report** | Per building inspection | Engineer |

### 7.4 Elevator Maintenance

- **NBR 16042:** mandatory **semi-annual** inspections by an accredited company.
- **NBR 16083:** monthly preventive maintenance.
- **NBR NM 313:** accessibility requirements.
- ISO standards 8100-1 and 8100-2 in implementation (2025–2028).
- Non-compliance: fines, interdiction, and civil liability of the syndic.

### 7.5 Renovations in Private Units

**Basis: ABNT NBR 16280:2024**

- Resident must notify the syndic **before** starting any renovation.
- Renovations affecting structure, plumbing, electrical, or facade require a technical report with **ART** (engineer) or **RRT** (architect).
- The syndic must analyze and formally authorize.
- Deadlines and process must be defined in the internal regulations.

### 7.6 Building Inspection (NBR 16747)

- Assesses safety, habitability, and maintenance conditions of the building.
- Results guide the Maintenance Plan.
- Recommended frequency: annual (buildings up to 5 years old), biennial (5 to 15 years), annual again (over 15 years).
- Performed by a qualified engineer or architect.
- Generates a technical report that must be filed and made available to the condominium.

---

## 8. LGPD Compliance

### 8.1 Condominium as Data Controller

- The condominium is a **personal data controller** under LGPD (Law 13,709/2018).
- Syndic and management company are **jointly liable** for violations.
- Fines: up to **2% of revenue** (for for-profit entities) or up to **BRL 50 million** per infraction.
- For condominiums: application is unambiguous; civil and administrative liability is clear (Arts. 42 and 52 LGPD).

### 8.2 Categories of Data Processed by the Condominium

**Common data:**

- Name, CPF, RG, address, contact details of residents and owners.
- Visitor and service provider data: name, CPF, photo, vehicle plate, access time.
- Employee data: full data for labor purposes.

**Sensitive data (require specific legal basis and heightened care):**

- Biometric data (facial recognition, fingerprints).
- Health data (sick leave, medical certificates).
- Camera footage that enables identification of individuals.

### 8.3 Practical Obligations

- Draft a **Privacy Policy** for the condominium.
- Map all personal data flows (gatehouse, cameras, eSocial, communications).
- Define the legal basis for each processing activity (legitimate interest, legal obligation, consent).
- For biometric data: **free, informed, and unambiguous consent** from each data subject.
- Provide an alternative access method for those who do not consent to biometrics.
- Implement a **RIPD** (Data Protection Impact Report) for facial recognition systems.
- Guarantee data subject rights: access, correction, deletion, portability — response deadline: **15 business days**.
- Train doormen, building superintendents, and administrative staff to handle data requests.
- Contracts with third parties (management company, remote gatehouse company, system providers): include data protection clauses.
- Cameras: visible informational signs; limited storage period; access restricted to syndic and council.

### 8.4 Risk of Sharing Footage

- **Camera footage is personal data** (Art. 5, I, LGPD).
- Providing footage directly to condominium owners (even victims of infractions) **violates LGPD**.
- Correct procedure: contact authorities (police, public prosecutor) who formally request it from the condominium.
- São Paulo Court of Justice: has ruled that improper disclosure of footage violates personality rights, creating a duty to compensate.

---

## 9. Communication and Resident Relations

### 9.1 Communication Channels

#### Channel Types

| Channel | Primary Use | Formality |
|---|---|---|
| Condominium app | Notices, votes, reservations, incidents, bills, polls | Digital / Formal |
| Push notification (app) | Urgent alerts, due-date reminders, confirmations | Digital / Immediate |
| Email | Formal notices, assembly summons, financial reports | Formal |
| SMS | Critical alerts (water outage, emergency, delinquency) | Urgent |
| Physical bulletin board | General notices in common areas (elevator, lobby) | Physical / Informal |
| Printed circulars | Formal summons when required by bylaws | Physical / Formal |
| WhatsApp groups | Informal notices; risk of disorder and conflicts — not recommended as an official channel | Informal |
| Intercom / Gatehouse app | Access control, gatehouse communication | Operational |

#### Notice Types

| Type | Description | Examples |
|---|---|---|
| **General Notice** | Information requiring no action, for all residents | Water interruption, scheduled work, elevator maintenance |
| **Targeted Notice** | Information for a subset of residents (block, floor, unit type) | Issue in block B, maintenance on 5th floor |
| **Summons** | Formal call for assembly or meeting | AGO, AGE, council meeting |
| **Financial Notice** | Alerts about charges, due dates, delinquency | Bill available, overdue charge, approved installment plan |
| **Security Alert** | Urgent security notices | Attempted break-in, gate failure, camera offline |
| **Regulatory Notice** | Changes to rules, regulations, bylaws | New pool usage rule, change in quiet hours |
| **Incident Response** | Formal follow-up to a resident complaint | Status update, resolution, estimated deadline |

#### Per-Resident Notification Settings

Each resident must be able to configure individual preferences:

- Enabled channels (app, email, SMS)
- Types of notifications they wish to receive
- Allowed notification hours (e.g., no push after 10 PM)
- Summary frequency (daily, weekly)

#### Communication Rules

- **RN-COM-001:** Assembly summons must be sent via the formal channel defined in the bylaws (generally email + app + bulletin board).
- **RN-COM-002:** Delinquency notices must be sent exclusively to the unit owner/responsible party, never in group channels.
- **RN-COM-003:** Notices must have a registered read receipt for legal proof purposes.
- **RN-COM-004:** The history of all notices sent must be archived with date, time, recipients, and content.
- **RN-COM-005:** Emergency alerts (water, gas, structural) must trigger simultaneously across all active channels.

#### Entity: `Notice`

```
id, condo_id,
title, content, type (general | targeted | summons | financial | security | regulatory | incident_response),
sender_id (syndic | management_company | system),
recipients (all | block | specific_units | delinquents),
delivery_channels: [app | email | sms | digital_board],
published_at, expires_at?,
priority (normal | urgent | critical),
requires_read_receipt (bool),
read_receipts: [{resident_id, read_at}],
attachments: [url],
status (draft | scheduled | sent | expired)
```

---

### 9.2 Space and Amenity Reservations

#### Concept

The reservation of common areas is a right of the current (non-delinquent) condominium owner, governed by internal regulations. The system must ensure no overlapping reservations, that usage rules are applied automatically, and that the process is transparent for all residents.

#### Types of Reservable Common Areas

| Area | Typical Characteristics |
|---|---|
| Party Room (Salão de Festas) | Defined capacity; reservation by period (morning/afternoon/evening); cleaning fee or deposit |
| Barbecue / Gourmet Space | Usually attached to the party room; may have independent reservation |
| Sports Court | Fixed time slots (e.g., 1h per reservation); no fee |
| Pool | May have exclusive time slots or only occupancy control |
| Game Room / Movie Room | Hourly reservation; limited capacity |
| Coworking Space | Hourly or half-day reservation; individual or group use |
| Pet Area | Optional reservation or free use per regulations |
| Open Barbecue Area | Same rules as gourmet space |
| Tennis Court | Time slots; may require guest registration |

#### Reservation Flow

```
Resident accesses app
       ↓
Selects area and date
       ↓
System checks: availability + delinquency status + reservation limit
       ↓
   [Blocked] → Notification of reason (unavailable / delinquent / limit reached)
       ↓
   [Available] → Resident confirms → Reservation created
       ↓
Confirmation sent + data added to shared calendar
       ↓
Automatic reminder (e.g., 24h and 2h before)
       ↓
After use: checkout checklist (optional) + area released
```

#### Business Rules — Reservations

- **RN-RES-001:** Delinquent unit owners may not make new reservations.
- **RN-RES-002:** Each unit may have at most N active reservations per month (N defined in internal regulations).
- **RN-RES-003:** Cancellations must respect a minimum notice period (e.g., 24 hours) to avoid a penalty.
- **RN-RES-004:** Late cancellation or no-show may result in a temporary block on new reservations (per regulations).
- **RN-RES-005:** Reservations for dates more than 30 days away must require confirmation close to the date (e.g., 7 days before).
- **RN-RES-006:** Guest residents (non-owners) may only access the reserved area accompanied by the reserving owner or with prior registered authorization.
- **RN-RES-007:** The reserved area must be returned clean and in compliance with the checkout checklist; non-compliance results in a cleaning fee charge.
- **RN-RES-008:** Reservation conflicts (system error) must be resolved by the syndic; the second reservant receives priority at the next available date.
- **RN-RES-009:** Reservations on holidays or weekends may have different rules (additional fee, reduced hours).

#### Availability Calendar

- Visible to all residents (status only: free/occupied, without identifying the reservant for privacy).
- Administrator may block dates for maintenance, condominium events, etc.
- Integration with incident system: area with pending maintenance is automatically blocked.

#### Entity: `CommonArea`

```
id, condo_id, name, description,
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

#### Entity: `AreaReservation`

```
id, condo_id, area_id, unit_id, resident_id,
reservation_date, start_time, end_time,
expected_guests,
fee_charged?, deposit_held?,
status (pending | confirmed | canceled | completed | no_show),
cancellation_reason?, canceled_by?,
canceled_at?,
checkout_checklist_url?,
cleaning_fee_applied?,
notes,
notifications_sent: [{type, sent_at}]
```

---

### 9.3 Incidents and Complaints

#### Concept

An incident is any formal report by a resident about a problem, infraction, irregularity, or request requiring a response or action from management. It is an essential tool for management and transparency, and its record protects both the resident and the syndic.

#### Incident Categories

| Category | Subcategories / Examples |
|---|---|
| **Noise and Disturbance** | Loud music, out-of-hours works, late-night parties, animals, disputes |
| **Rule Violations** | Improper use of common area, smoking in prohibited area, pets without leash, irregular parking |
| **Maintenance / Infrastructure** | Leak, burnt light, elevator defect, gate failure, seepage |
| **Security** | Emergency door jammed, camera offline, suspicious person, unauthorized access |
| **Cleaning and Upkeep** | Dirty common area, garbage outside allowed hours, abandoned debris |
| **Employee Conduct** | Complaint about doorman, building superintendent, service provider |
| **Damage to Common Areas** | Damaged equipment, graffiti, vandalism |
| **Suggestions and Improvements** | Improvement proposals, requests for new services |
| **Financial** | Billing dispute, billing question, installment plan request |
| **Other** | Topics not fitting the above categories |

#### Incident Flow

```
Resident files incident (app / email / in-person)
       ↓
System generates unique protocol + notifies syndic/management company
       ↓
Responsible party analyzes and categorizes
       ↓
   [Rule infraction] → Formal written notice to offender + deadline to comply
   [Maintenance]     → Work Order (WO) opened and linked
   [Security]        → Immediate alert + protocol activation
   [Suggestion]      → Logged for assembly agenda or management decision
       ↓
Status updates sent automatically to the complainant
       ↓
Resolution → Syndic logs closure with description of solution
       ↓
Resident may confirm resolution or contest (reopen incident)
       ↓
Incident archived with full history
```

#### SLA (Response Deadlines by Priority)

| Priority | Criterion | First Response | Resolution |
|---|---|---|---|
| **Critical** | Risk to life, security, or structure | Immediate (up to 1h) | Up to 24h or emergency dispatch |
| **High** | Failure of essential equipment (elevator, gate, water pump) | Up to 4h | Up to 48h |
| **Medium** | Disturbance, cleaning, non-urgent maintenance | Up to 24h | Up to 7 days |
| **Low** | Suggestions, questions, aesthetic improvements | Up to 48h | Up to 30 days or next assembly |

> The deadlines above are best-practice references; internal regulations may define their own SLAs.

#### Fine Application Process for Infraction

When the incident involves a regulations violation:

1. **1st incident:** Formal written notice (warning); deadline to comply.
2. **2nd incident (same type):** Notice + fine as defined in regulations (basis: Art. 1,336 CC — up to 5× the condominium fee for non-compliance).
3. **Repeat offense:** Fine + possibility of calling an assembly to deliberate additional penalties.
4. **Seriously antisocial behavior (Art. 1,337 CC):** Assembly may deliberate a fine of up to **10× the condominium fee**.

> The regulations infraction fine is different from the delinquency fine. Both are condominium obligations and may be enforced in court.

#### Business Rules — Incidents

- **RN-OCO-001:** Every filed incident must receive a unique protocol immediately.
- **RN-OCO-002:** The complainant must receive automatic notification at every status change.
- **RN-OCO-003:** Security incidents with critical priority must notify the syndic via push and SMS simultaneously.
- **RN-OCO-004:** The syndic may not archive an incident without recording the resolution adopted.
- **RN-OCO-005:** Maintenance incidents must automatically generate a linked Work Order.
- **RN-OCO-006:** Internal regulations infraction notices must have a registered delivery confirmation (for validity in potential fine collection).
- **RN-OCO-007:** The incident history for a unit must be queryable by the syndic for repeat-offense analysis.
- **RN-OCO-008:** Anonymous incidents are permitted only for reports; complaints that result in a fine to the offender require the complainant to be identified.

#### Entity: `Incident`

```
id, condo_id, protocol (unique, auto-generated),
origin_unit_id, resident_id,
category (noise | violation | maintenance | security | cleaning | employee | damage | suggestion | financial | other),
subcategory?,
title, description, evidence: [url],
filed_at, filed_time,
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

---

### 9.4 Polls

#### Concept

Polls are non-binding consultations held by the syndic or administration to gather residents' opinions on topics of collective interest. They differ from **assembly votes** (which have legal deliberative force) in that they are listening and planning instruments, generating no legal obligations.

#### Typical Purposes

- Gather preferences before proposing an agenda item at an assembly (e.g., "Do you prefer remote or on-site gatehouse?")
- Assess satisfaction with contracted services (cleaning, security, management company)
- Decide everyday topics without requiring an assembly (e.g., mural color, gym hours)
- Prioritize works or improvements when there are multiple options and a limited budget
- Collect agenda suggestions for the next AGO
- Periodic satisfaction survey with the syndic's management

#### Poll Types

| Type | Description | Examples |
|---|---|---|
| **Single Choice** | Resident picks one of N options | "Which cleaning company do you prefer?" |
| **Multiple Choice** | Resident picks one or more options | "Which improvements do you want for 2026?" |
| **Satisfaction Scale** | Numerical rating (1–5 or NPS 0–10) | "How do you rate the gatehouse service?" |
| **Open Question** | Free-text field | "What is your suggestion for the leisure area?" |
| **Ranking / Prioritization** | Resident orders options by preference | "Rank the works by priority" |

#### Poll Flow

```
Syndic creates poll (title, question, type, options, deadline, target audience)
       ↓
System publishes and notifies eligible residents
       ↓
Residents respond within deadline (app or email)
       ↓
System records responses (identified or anonymous, per configuration)
       ↓
Deadline reached → results compiled automatically
       ↓
Syndic analyzes results + decides next step
       ↓
Results published to all participants (transparency)
```

#### Business Rules — Polls

- **RN-ENQ-001:** Polls are **non-binding**; results do not replace an assembly vote for decisions requiring a legal quorum.
- **RN-ENQ-002:** Each unit (not each person) has the right to one vote per poll, unless configured otherwise.
- **RN-ENQ-003:** The minimum duration of a poll must be 48 hours to ensure reasonable participation.
- **RN-ENQ-004:** Polls may be anonymous (results without identification) or nominal (syndic sees who voted for what); the configuration must be disclosed before participation.
- **RN-ENQ-005:** Anonymous polls: the system records that the unit voted, but does not associate the vote with the resident's identity.
- **RN-ENQ-006:** Poll results must be published to all condominium residents after closing.
- **RN-ENQ-007:** Polls may not be edited after voting begins; only canceled (with cancellation notice and reason).
- **RN-ENQ-008:** Delinquent owners may participate in polls (unlike formal assemblies, where they lose voting rights).
- **RN-ENQ-009:** Satisfaction polls about the syndic or management company must guarantee participation for all residents, with no restrictions.

#### Entity: `Poll`

```
id, condo_id,
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
id, poll_id, unit_id,
resident_id? (null if anonymous),
responded_at,
chosen_options: [option_id],
scale_value?,
open_text?,
ranking_options: [{option_id, position}]?
```

---

### 9.5 Packages and Delivery

- Package management: receipt protocol, resident notification, pickup deadline.
- Trend: smart lockers for autonomous 24h pickup.
- Delivery: delivery person access policies (access to gatehouse only, no floor access).

---

## 10. Technology and Digitalization

### 10.1 Categories of Condominium Systems

| Category | Features |
|---|---|
| **Condominium ERP** | Finance, billing, financial reporting, contracts, eSocial |
| **Resident App** | Notices, reservations, incidents, digital access, votes |
| **Gatehouse / Access Control** | CCTV, facial recognition, QR code, digital intercom |
| **Building Maintenance** | Work orders, checklists, expiry alerts, documents |
| **Security** | 24h monitoring, AI video analysis, intrusion alerts |
| **Communication** | Push notifications, email, digital bulletin board |

### 10.2 Trends and Innovations (2025–2026)

- **AI in security:** real-time video analysis, anomalous behavior detection, risk forecasting — from 54% to 64.3% of solutions including AI (ABESE, 2024).
- **Remote gatehouse with AI:** redundant centers, AI for access screening.
- **Digital assemblies:** online voting with biometric or identity validation.
- **Automated collections:** automatic delinquency notifications, installment plans, agreements.
- **Electric vehicles:** charging infrastructure in condominiums (São Paulo regulation in development, 2025).
- **Sustainability:** rainwater reuse (NBR 15527), solar energy, individualized water metering.
- **Smart lockers:** autonomous package and delivery management.

### 10.3 System Integration

Ideal architecture for a condominium management platform:

```
[Resident App] ←→ [Central Platform] ←→ [Financial System / ERP]
                         ↕
             [Access Control / Gatehouse]
                         ↕
               [CCTV / AI Security]
                         ↕
            [Building Maintenance Module]
                         ↕
             [HR / Labor Module]
```

---

## 11. Data Domain — Entities and Attributes

This section defines the core business domain entities for data modeling and code generation.

### Entity: `Condominium`

```
id, name, tax_id (cnpj), address, city, state, zip_code,
type (residential | commercial | mixed),
num_units, num_blocks, num_floors,
total_area_sqm, base_ideal_fraction,
inauguration_date, property_registration,
bylaws_url, regulations_url,
status (active | inactive)
```

### Entity: `Unit`

```
id, condo_id, block, floor, number,
type (apartment | office | store | parking),
private_area_sqm, ideal_fraction,
linked_parking_space,
occupancy_status (owned | rented | vacant)
```

### Entity: `Owner`

```
id, name, cpf, rg, email, phone,
unit_id, acquisition_date,
financial_status (current | delinquent),
is_syndic, is_council_member
```

### Entity: `Tenant`

```
id, name, cpf, email, phone,
unit_id, lease_start_date, lease_end_date,
lease_contract_url
```

### Entity: `Employee`

```
id, condo_id, name, cpf, social_security_id,
role (superintendent | doorman | general_services | guard | receptionist),
contract_type (direct_clt | outsourced),
outsourcing_company_id?,
hire_date, termination_date?,
base_salary, schedule (44h | 12x36 | part_time),
status (active | inactive | on_leave)
```

### Entity: `Assembly`

```
id, condo_id, type (ordinary | extraordinary),
date, start_time, end_time,
format (in_person | virtual | hybrid),
access_link?,
agenda_items: [{title, required_quorum, vote_result}],
minutes_url, status (scheduled | held | canceled)
```

### Entity: `CondoCharge`

```
id, unit_id, billing_period (MM/YYYY),
base_fee, reserve_fund_amount, extras_amount,
total_amount, due_date,
status (pending | paid | overdue | installment_plan),
paid_at?, late_fine?, interest?,
bill_url
```

### Entity: `MaintenanceWorkOrder`

```
id, condo_id, type (preventive | corrective | emergency),
location, description, priority (low | medium | high | critical),
opened_at, completed_at?,
responsible_id?, vendor_id?,
estimated_cost?, actual_cost?,
status (open | in_progress | completed | canceled),
documents: [url]
```

### Entity: `LegalDocument`

```
id, condo_id, type (avcb | insurance | elevator_inspection | cistern | extinguisher | fire_brigade | ...),
description, issued_at, expires_at,
responsible_company, file_url,
status (valid | expired | expiring_soon)
```

### Entity: `AccessLog`

```
id, condo_id, destination_unit_id?,
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
id, condo_id,
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
id, condo_id, name, description,
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
id, condo_id, area_id, unit_id, resident_id,
reservation_date, start_time, end_time,
expected_guests,
fee_charged?, deposit_held?,
status (pending | confirmed | canceled | completed | no_show),
cancellation_reason?, canceled_by?,
canceled_at?,
checkout_checklist_url?,
cleaning_fee_applied?,
notes,
notifications_sent: [{type, sent_at}]
```

### Entity: `Incident`

```
id, condo_id, protocol,
origin_unit_id, resident_id,
category (noise | violation | maintenance | security | cleaning | employee | damage | suggestion | financial | other),
subcategory?,
title, description, evidence: [url],
filed_at, filed_time,
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
resident_rating?,
rating_comment?
```

### Entity: `Poll`

```
id, condo_id,
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
id, poll_id, unit_id,
resident_id?,
responded_at,
chosen_options: [option_id],
scale_value?,
open_text?,
ranking_options: [{option_id, position}]?
```

---

## 12. Critical Business Rules

This section lists the most relevant business rules for implementation in AI and automation systems.

### Communication

- **RN-COM-001:** Assembly summons must be sent via the formal channel defined in the bylaws (email + app + bulletin board).
- **RN-COM-002:** Delinquency notices must be sent exclusively to the unit responsible party, never in group channels.
- **RN-COM-003:** Every notice must have a registered read receipt for legal proof purposes.
- **RN-COM-004:** The history of all notices sent must be archived with date, recipients, and content.
- **RN-COM-005:** Emergency alerts must trigger simultaneously across all active channels (app + SMS + email).

### Space Reservations

- **RN-RES-001:** Delinquent owners may not make new reservations for common areas.
- **RN-RES-002:** Each unit may have at most N active reservations per month, per regulations.
- **RN-RES-003:** Cancellations outside the minimum notice period (default: 24h) incur a penalty per regulations.
- **RN-RES-004:** No-show without cancellation may result in a temporary block on new reservations.
- **RN-RES-005:** Area with active maintenance must be automatically blocked for new reservations.
- **RN-RES-006:** Reservation conflicts must be resolved by the syndic; the second reservant receives priority at the next available date.
- **RN-RES-007:** Calendar availability must be public (free/occupied), without exposing the reservant's name.

### Incidents and Complaints

- **RN-OCO-001:** Every filed incident must receive a unique protocol immediately.
- **RN-OCO-002:** The complainant must receive automatic notification at every status change.
- **RN-OCO-003:** Security incidents with critical priority must notify the syndic via push and SMS simultaneously.
- **RN-OCO-004:** The syndic may not archive an incident without recording the resolution adopted.
- **RN-OCO-005:** Maintenance incidents must automatically generate a linked Work Order.
- **RN-OCO-006:** Internal regulations infraction notices must have a registered delivery confirmation (for validity in potential fine collection).
- **RN-OCO-007:** The incident history for a unit must be queryable by the syndic for repeat-offense analysis.

### Polls

- **RN-ENQ-001:** Polls are non-binding and do not replace an assembly vote for legal deliberations.
- **RN-ENQ-002:** Each unit has the right to one vote per poll, unless configured otherwise.
- **RN-ENQ-003:** The minimum duration of a poll is 48 hours.
- **RN-ENQ-004:** Anonymous polls record that the unit voted, but do not associate the vote with the identity.
- **RN-ENQ-005:** Poll results must be published to all residents after closing.
- **RN-ENQ-006:** Polls may not be edited after voting begins; only canceled with notification of reason.
- **RN-ENQ-007:** Delinquent owners may participate in polls (unlike formal assemblies).
- **RN-FIN-001:** Overdue condominium fee automatically accrues a 2% fine + 1% monthly interest after the due date.
- **RN-FIN-002:** Owner with outstanding debt may not vote at assembly (flag `financial_status = delinquent`).
- **RN-FIN-003:** The reserve fund may not be used for ordinary expenses already budgeted.
- **RN-FIN-004:** The budget forecast must be approved at the AGO before taking effect.
- **RN-FIN-005:** The reserve fund must have a separate bank account from the operational checking account.
- **RN-FIN-006:** Fire insurance is mandatory; its absence exposes the syndic to personal liability.

### Governance

- **RN-GOV-001:** Bylaw amendments require approval of 2/3 of ALL condominium owners.
- **RN-GOV-002:** The assembly agenda is closed; only items in the notice may be voted on.
- **RN-GOV-003:** The syndic may never chair their own removal assembly.
- **RN-GOV-004:** Assembly summons by owners require representation of at least 1/4 of the total.
- **RN-GOV-005:** Assembly minutes that amend bylaws must be registered at the Registry Office.
- **RN-GOV-006:** The syndic's term is at most 2 years, renewable.

### Security and Access

- **RN-SEG-001:** Facial biometrics require individual, explicit consent; an alternative access method must exist.
- **RN-SEG-002:** Camera footage may only be shared with authorities via formal request; never directly to owners.
- **RN-SEG-003:** Visitor data must have a defined retention period and be deleted after the period.
- **RN-SEG-004:** Cameras may not be positioned to capture private areas.

### Maintenance

- **RN-MAN-001:** Expired AVCB exposes the syndic to personal liability for any incident.
- **RN-MAN-002:** Elevators must have documented monthly preventive maintenance and semi-annual inspections.
- **RN-MAN-003:** Renovations in private units affecting structure, plumbing, or electrical require ART/RRT before starting.
- **RN-MAN-004:** Maintenance documents must be kept for at least 5 years.

### HR and Labor

- **RN-RH-001:** Every CLT employee must be registered in eSocial before starting work.
- **RN-RH-002:** The syndic has no employment relationship with the condominium.
- **RN-RH-003:** Outsourced employees may not receive direct orders from the syndic (risk of employment relationship).
- **RN-RH-004:** Termination amounts must be paid within 10 days of dismissal.

---

## 13. Condominium Glossary

| Term | Definition |
|---|---|
| **AVCB** | Auto de Vistoria do Corpo de Bombeiros. Fire Department Inspection Certificate. Certificate of compliance with fire safety standards. |
| **ART** | Anotação de Responsabilidade Técnica. Technical Responsibility Annotation. Document issued by an engineer to the CREA for works and reports. |
| **RRT** | Registro de Responsabilidade Técnica. Technical Responsibility Record. Equivalent of ART for architects (CAU). |
| **AGO** | Assembleia Geral Ordinária. Ordinary General Assembly. Held at least once a year. |
| **AGE** | Assembleia Geral Extraordinária. Extraordinary General Assembly. Convened for urgent or out-of-cycle topics. |
| **Bylaws (Convenção)** | The condominium's charter. Registry-recorded document defining coexistence and administration rules. |
| **Internal Regulations (Regimento Interno)** | Day-to-day rules for use of common areas; may be part of the bylaws or a separate document. |
| **Ideal Fraction (Fração Ideal)** | Percentage of common area corresponding to each private unit. Basis for contribution and vote calculations. |
| **Condominium Fee (Cota Condominial)** | Monthly fee paid by each unit to cover condominium expenses. |
| **Reserve Fund (Fundo de Reserva)** | Financial reserve for emergency and extraordinary expenses. |
| **Delinquency (Inadimplência)** | Non-payment of the condominium fee. Implies fine, interest, and suspension of voting rights. |
| **Pro Labore** | Syndic's compensation for management services, when provided. |
| **Quorum** | Minimum number of condominium owners required for an assembly or vote to be valid. |
| **Simple Majority** | 50% + 1 of those present at the assembly. |
| **Absolute Majority** | 50% + 1 of ALL condominium owners. |
| **CCT** | Convenção Coletiva de Trabalho. Collective Labor Agreement between workers' and employers' unions defining rights and salary floors by category and region. |
| **eSocial** | Federal government system centralizing labor, social security, and tax data for employees. Mandatory for condominiums with CLT employees. |
| **DET** | Domicílio Eletrônico Trabalhista. Electronic Labor Domicile. Official communication channel between the Ministry of Labor and employers (Decree 11,905/2024). |
| **PCMSO** | Programa de Controle Médico de Saúde Ocupacional. Occupational Health Medical Control Program. Mandatory for condominiums with employees. |
| **PPRA** | Programa de Prevenção de Riscos Ambientais. Environmental Risk Prevention Program. Complementary to PCMSO. |
| **CIPA** | Comissão Interna de Prevenção de Acidentes. Internal Accident Prevention Commission. Mandatory for condominiums with a certain number of employees. |
| **LGPD** | Lei Geral de Proteção de Dados (Law 13,709/2018). Brazil's General Personal Data Protection Act. |
| **RIPD** | Relatório de Impacto à Proteção de Dados. Data Protection Impact Report. Required for processing sensitive data (e.g., biometrics). |
| **CCTV** | Closed-circuit television. Security camera system. |
| **RIA** | Relatório de Inspeção Anual de Elevadores. Annual Elevator Inspection Report. Mandatory in many municipalities. |
| **PMOC** | Plano de Manutenção, Operação e Controle. HVAC Maintenance, Operation, and Control Plan. Mandatory for air-conditioning systems per ANVISA. |
| **Professional Syndic (Síndico Profissional)** | External syndic (non-resident), contracted as a service provider for professional condominium management. |
| **Management Company (Administradora)** | Company contracted for administrative, financial, and operational support of the syndic. |
| **Remote Gatehouse (Portaria Remota)** | Gatehouse model without physical presence, operated by a monitoring center via cameras, intercoms, and AI. |
| **NBR** | Norma Brasileira. Brazilian Standard. Technical document published by ABNT (Brazilian Technical Standards Association). |
| **Common Area (Área Comum)** | Parts of the condominium for collective use (lobby, pool, lounge, shared parking, stairs, etc.). |
| **Private Area (Área Privativa)** | Autonomous unit for exclusive use of the owner (apartment, office, linked parking space). |

---

## 14. Multi-Tenancy Architecture

This section defines the ZenAndVillage multi-tenancy model as a B2B2C SaaS platform, covering tenant hierarchy, data isolation, plans, permissions, and cross-level operating rules.

---

### 14.1 Model Overview

ZenAndVillage operates as a **hierarchical multi-tenant** model where a single platform deployment serves multiple completely isolated customers. The "customer" may be a property management company (managing several condominiums) or a self-managed condominium (with an independent syndic).

```
┌─────────────────────────────────────────────┐
│            ZENANDVILLAGE PLATFORM            │
│                  (SaaS Layer)                │
└──────────────┬──────────────────────────────┘
               │
   ┌───────────┼────────────┐
   ▼           ▼            ▼
[Tenant A]  [Tenant B]   [Tenant C]
Mgmt. Co.   Mgmt. Co.    Independent
XYZ         ABC          Condominium
   │           │
 ┌─┴─┐       ┌─┴─┐
[C1][C2]   [C3][C4]
Condo.     Condo.
```

**Level 1 Tenant — Management Company:**
Company managing N condominiums on the platform. Has a consolidated view, may have its own branding (white-label), and configures defaults that child condominiums inherit.

**Level 1 Tenant — Independent Condominium:**
Self-managed condominium, not linked to a management company. Syndic accesses directly without an intermediary.

**Level 2 Tenant — Condominium:**
Always a child of a management company or independent. Minimum operational unit with its own data, users, and settings.

---

### 14.2 Tenant Hierarchy

```
Platform (ZenAndVillage)
└── Tenant (Management Company | Independent Condominium)
    └── Condominium
        └── Block
            └── Unit
                └── Resident / Owner / Tenant
```

| Level | Entity | Description |
|---|---|---|
| **L0** | Platform | ZenAndVillage platform itself; exclusive access by ZenEngineeringLab team |
| **L1** | Tenant | Property management company or independent condominium (direct contract with the platform) |
| **L2** | Condominium | Operational unit; always belongs to an L1 Tenant |
| **L3** | Block / Tower | Physical grouping within the condominium (optional) |
| **L4** | Unit | Apartment, office, store, parking space |
| **L5** | End User | Resident, owner, tenant — linked to one or more units |

---

### 14.3 Data Isolation Strategy

Isolation guarantees that no tenant can access another tenant's data, even in the event of an authorization failure.

#### Recommended Model: Schema-per-Tenant + Row-Level Security

| Strategy | Description | Fit for ZenAndVillage |
|---|---|---|
| **Database-per-Tenant** | Each tenant has its own database | High security; high operational cost for N tenants |
| **Schema-per-Tenant** | Same database; separate schemas per tenant | Good security/cost balance; recommended |
| **Row-Level Security (RLS)** | Same schema; tenant_id on all tables with RLS at database level | More economical; requires implementation discipline |
| **Hybrid** | Schema-per-tenant for sensitive data; RLS for operational data | Ideal solution for growing platforms |

**Golden rule:** `tenant_id` (or `condo_id`) must be present on **all** data tables and in **all** queries. Never perform queries without a tenant filter.

#### Isolation Fields per Layer

```sql
-- Every operational entity must have:
tenant_id     UUID NOT NULL  -- Identifies the L1 (management company or independent)
condo_id      UUID NOT NULL  -- Identifies the L2

-- Mandatory composite indexes:
INDEX (tenant_id, condo_id, <entity_key>)
```

---

### 14.4 User Hierarchy and Permissions

Each user belongs to one or more levels of the hierarchy and has a role that defines their permissions.

#### Roles by Level

| Role | Level | Capabilities |
|---|---|---|
| `platform_admin` | L0 | Full platform access; tenant, plan, and support management |
| `platform_support` | L0 | Read access for support; cannot modify tenant data |
| `tenant_owner` | L1 | Tenant account owner; configures plan, billing, L1 users |
| `tenant_admin` | L1 | Management company administrator; access to all tenant condominiums |
| `tenant_viewer` | L1 | Consolidated read-only view of all tenant condominiums |
| `condo_syndic` | L2 | Condominium syndic; full management of that condominium |
| `condo_manager` | L2 | Delegated manager (e.g., management company employee assigned to the condominium) |
| `condo_council` | L2 | Fiscal council member; access to financial reports for that condominium |
| `condo_staff` | L2 | Internal employee (superintendent, doorman); limited operational access |
| `resident_owner` | L4/L5 | Unit owner; access to resident features |
| `resident_tenant` | L4/L5 | Unit tenant; access to resident features (excluding owner financial data) |

#### Permission Inheritance Rules

- `tenant_admin` has implicit access to all condominiums within their tenant.
- `condo_syndic` has access only to the condominium(s) they are linked to.
- A user may have different roles in different condominiums (e.g., syndic in Condo A, council member in Condo B).
- Residents only access data for their own unit(s); never other units' data.
- Cross-tenant: **strictly prohibited**; no user of one tenant may access another tenant's data, not even `platform_support` without explicit, audited authorization.

#### Entity: `User`

```
id, email, name, cpf?,
password_hash, mfa_enabled (bool),
status (active | inactive | blocked | pending_verification),
created_at, last_login?,
roles: [{
  role,
  tenant_id,
  condo_id?,   (null for tenant-level roles)
  unit_id?,    (null for condo-level roles)
  starts_at, ends_at?
}],
notification_preferences: {channels, schedules, types}
```

---

### 14.5 Plans and Subscriptions

The commercialization model is based on Tenant (L1) subscriptions, with plan limits applying to the set of managed condominiums.

#### Plan Limitation Dimensions

| Dimension | Description |
|---|---|
| `max_condos` | Maximum number of active condominiums in the tenant |
| `max_units_total` | Total units across all condominiums |
| `max_admin_users` | Number of users with L1/L2 roles (syndics, managers) |
| `enabled_modules` | List of modules available to the tenant |
| `data_retention_months` | How many months data is retained (history) |
| `support_level` | Support SLA level (basic, priority, dedicated) |
| `white_label` | Custom branding enabled (bool) |
| `api_access` | REST API access for integrations (bool) |
| `digital_assembly` | Digital assembly module enabled (bool) |
| `ai_insights` | AI insights and automation module enabled (bool) |

#### Platform Modules

| Module | Description |
|---|---|
| `financial` | Billing, invoices, budget forecast, delinquency management |
| `gatehouse_access` | Access control, visitors, QR Code |
| `communication` | Notices, push notifications, digital bulletin board |
| `reservations` | Common area reservations |
| `incidents` | Incident and complaint registration and management |
| `polls` | Poll creation and management |
| `maintenance` | Work orders, checklists, technical documents |
| `hr_labor` | Employee management, eSocial, payroll |
| `digital_assembly` | Online assemblies and votes |
| `documents` | Legal document storage and management |
| `ai_insights` | Smart reports, predictive alerts, AI assistant |
| `white_label` | Brand customization, custom domain, theme |

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
public (bool)   -- whether it appears on the pricing page
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

### 14.6 White-Label and Customization

Tenants with the `white_label` module enabled may customize the experience for their condominiums:

- **Platform name:** replace "ZenAndVillage" with the management company's name
- **Logo:** own logo displayed in the app and emails
- **Color palette:** primary and secondary colors of the visual identity
- **Custom domain:** app accessible at `management.companynamexyz.com.br`
- **Sender email:** notices sent from `noreply@companynamexyz.com.br`
- **Custom splash screen:** mobile app loading screen

**White-label rules:**

- **RN-WL-001:** Customization is per tenant (L1); all tenant condominiums inherit the same branding.
- **RN-WL-002:** Independent condominiums without white-label use the default ZenAndVillage identity.
- **RN-WL-003:** The app footer must always retain a discreet "Powered by ZenAndVillage" reference even in white-label (except enterprise plans with a specific contract).

---

### 14.7 Cross-Tenant Operations (Management Company)

Users with the `tenant_admin` role have unified access to all condominiums in their tenant. This enables:

- **Consolidated dashboard:** view of delinquency, open incidents, expired documents, and pending maintenance across all condominiums in a single panel.
- **Aggregated reports:** financial statements, benchmarks between condominiums (e.g., average cost per unit, average delinquency rate).
- **Centralized user management:** create/revoke access for syndics and managers across any condominium in the tenant.
- **Shared templates:** reusable regulation models, notices, and maintenance checklists across condominiums.
- **Multi-condominium calendar:** view AVCB, insurance, and other document expiry dates across all condominiums in a single calendar.

**Cross-tenant rules:**

- **RN-CT-001:** `tenant_admin` never accesses another tenant's data, even if it is a management company for condominiums in the same corporate group — each tenant is isolated.
- **RN-CT-002:** Consolidated reports only aggregate data within the same tenant.
- **RN-CT-003:** A condominium may not be transferred between tenants without a formal migration process with the responsible syndic's consent.
- **RN-CT-004:** The platform (L0) may access any tenant solely for support purposes, with an immutable audit log recorded.

---

### 14.8 Tenant Lifecycle

```
Registration / Trial
      ↓
Activation (contract + payment)
      ↓
Active operation
      ↓
   [Delinquency] → Notification → Grace period (e.g., 7 days) → Suspension
   [Cancellation] → Grace period → Closure
      ↓
Suspension: read-only access; write features blocked
      ↓
Closure: data retained for contractual period → Export made available → Deletion
```

#### Tenant Statuses

| Status | Description | Capabilities |
|---|---|---|
| `trial` | Free evaluation period | Full access with reduced limits |
| `active` | Active and current subscription | Full access per plan |
| `delinquent` | Payment overdue; within grace period | Full access; billing warnings |
| `suspended` | Grace period ended without payment | Read-only; no creation/editing |
| `canceled` | Cancellation requested | Data export only; no operational access |

---

### 14.9 Audit and Traceability

Every operation on the platform must generate an audit log associated with the tenant and the responsible user.

#### Entity: `AuditLog`

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

**Audit rules:**

- **RN-AUD-001:** Audit logs are **immutable**; no user, not even `platform_admin`, may delete audit records.
- **RN-AUD-002:** Sensitive actions (data export, plan change, L0 access to a tenant) must generate a real-time alert to the `tenant_owner`.
- **RN-AUD-003:** Logs must be retained for the period defined in the plan, with a minimum of 12 months.
- **RN-AUD-004:** In the event of a security incident, logs must be sufficient to reconstruct the full sequence of actions.

---

### 14.10 General Business Rules — Multi-Tenancy

- **RN-MT-001:** Every API request must validate `tenant_id` before any data operation.
- **RN-MT-002:** Database queries without a `tenant_id` filter are prohibited in production code.
- **RN-MT-003:** Upon reaching the plan's condominium or unit limit, new creations are blocked with a clear upgrade message.
- **RN-MT-004:** One tenant's data is never visible to another tenant under any circumstances.
- **RN-MT-005:** Trial does not automatically convert to a paid subscription; it requires explicit action by the `tenant_owner`.
- **RN-MT-006:** On suspension, residents (L5) retain read access to the app (view bills, history) so as not to impact the end-user experience due to the tenant's (management company's) delinquency.
- **RN-MT-007:** Tenant deletion must be preceded by a full data export in structured format (JSON/CSV) made available for at least 30 days.
- **RN-MT-008:** Modules not included in the plan must return error `403 Feature not available in current plan` — never display partial data.

---

## 15. Condominium Asset Management

This section covers the inventory, control, maintenance, and lifecycle of physical assets belonging to the condominium — from large infrastructure equipment to party room utensils.

---

### 15.1 Concept and Legal Responsibility

**Condominium assets** are the set of movable and immovable property owned collectively by the condominium, acquired with condominium funds and intended for the use and benefit of all owners.

**Legal responsibility:**

- The syndic is responsible for the custody, conservation, and control of assets (Art. 1,348, V, CC).
- The annual financial report must include the condominium's asset position.
- Assets acquired with condominium funds are collective property; the syndic may not sell, lend, or pledge condominium assets as collateral without assembly approval.
- Sale or disposal of assets of relevant value requires assembly deliberation.

---

### 15.2 Asset Categories

| Category | Subcategory | Examples |
|---|---|---|
| **Infrastructure Equipment** | Electrical / Plumbing | Water pumps, generators, electrical panels, UPS |
| | Elevation | Elevators, accessibility platforms |
| | HVAC | Common-area air conditioning, exhaust fans |
| | Security | CCTV cameras, alarm panels, electric fences, intercoms |
| | Gatehouse / Access | Barriers, automatic gates, biometric readers, kiosks |
| **Leisure Equipment** | Fitness | Treadmills, bikes, weight machines, free weights, dumbbells |
| | Recreation | Pool tables, ping-pong, foosball, video game, board games |
| | Audiovisual | TVs, projectors, sound systems, home theater, speakers |
| | Pool | Pumps, heaters, vacuums, chlorine meters |
| **Furniture** | Party Room | Tables, chairs, sofas, sideboards, shelving |
| | Gourmet Space | Freezers, refrigerators, ovens, stoves, microwaves, barbecues |
| | Office / Administration | Desks, chairs, filing cabinets, archives |
| | Common Areas | Benches, loungers, parasols, trash cans |
| **Utensils and Tableware** | Kitchen | Cutlery, plates, glasses, goblets, serving dishes, pots, baking trays |
| | Cleaning | Vacuums, floor polishers, hoses, cleaning carts |
| | Tools | Drills, sanders, toolboxes, ladders |
| **IT Equipment** | Administration | Computers, printers, tablets, routers |
| | Monitoring | CCTV recording servers, network switches |
| **Vehicles and Other** | — | Hand trucks, moving carts, community bicycles |
| **Physical Documents** | — | Insurance policies, equipment manuals, blueprints and plans |

---

### 15.3 Inventory and Asset Tagging

**Asset tagging** is the process of formally registering each asset, assigning it a unique identifier (tag number / label) and documenting its characteristics.

#### Tagging Information per Item

- **Tag number:** unique sequential code per condominium (e.g., `COND-2024-00142`)
- **Full description:** name, brand, model, color, physical characteristics
- **Category and subcategory**
- **Location:** common area where it is allocated (lounge, gym, gatehouse, etc.)
- **Acquisition date** and **acquisition value** with invoice
- **Supplier** and invoice number
- **Warranty:** start and end date
- **Condition:** excellent / good / fair / poor / unusable
- **Custodian** (building superintendent, doorman, administration)
- **Photos** of the condition at registration and at periodic reviews

#### Periodic Inventory

Conducted at least **once a year**, preferably before the AGO, to:

- Confirm the physical existence of registered assets
- Update the condition of each item
- Identify missing, damaged, or misplaced assets
- Support the financial report to the fiscal council

---

### 15.4 Asset Lifecycle

```
Acquisition (invoice)
       ↓
Receipt + Inspection
       ↓
Tagging (registration + physical label)
       ↓
Allocation to common area
       ↓
Use + Periodic maintenance ◄──────────────────┐
       ↓                                        │
Condition review                               │ loop
       ↓                                        │
  [Good / Fair] ─────────────────────────────────┘
       ↓
  [Poor / Unusable]
       ↓
  Disposition decision (syndic + council)
  Sale of relevant value → assembly required
       ↓              ↓              ↓
    Repair         Disposal       Disposal by sale
    (WO)        (documented)   (sale/donation)
                     ↓              ↓
               Asset write-off with record
```

---

### 15.5 Asset Depreciation

Best practice recommends tracking depreciation to plan asset replacement.

| Category | Estimated Useful Life | Approx. Annual Rate |
|---|---|---|
| Electronics (TV, projector, computer) | 3–5 years | 20–33% |
| Utensils and tableware | 3–5 years | 20–33% |
| Fitness equipment | 5–8 years | 12–20% |
| Security cameras / CCTV | 5–7 years | 14–20% |
| Tools | 5–10 years | 10–20% |
| Appliances (freezer, oven, refrigerator) | 8–10 years | 10–12% |
| Automatic gates and barriers | 8–10 years | 10–12% |
| Furniture (tables, chairs, sofas) | 10–15 years | 7–10% |
| Hydraulic equipment (pumps) | 10–15 years | 7–10% |
| Elevators | 20–25 years | 4–5% |

> Reference values for planning. The condominium may adopt its own tables defined at assembly.

---

### 15.6 Asset Movement Types

| Type | Description |
|---|---|
| **Entry** | Acquisition, donation, exchange |
| **Transfer** | Change of location within the condominium |
| **Internal Loan** | Temporary assignment for a condominium event |
| **Exit for Maintenance** | Asset sent for external repair |
| **Return from Maintenance** | Asset returned after repair |
| **Write-off by Disposal** | Unusable asset discarded |
| **Write-off by Sale/Donation** | Asset sold, donated, or exchanged |
| **Write-off by Loss** | Missing asset; triggers a linked incident |
| **Condition Update** | Condition review with no physical movement |

---

### 15.7 Business Rules — Assets

- **RN-PAT-001:** Every asset acquired with condominium funds must be tagged before being put into use, with the invoice linked.
- **RN-PAT-002:** Disposal of assets above the value limit defined in the bylaws requires assembly approval.
- **RN-PAT-003:** Assets missing from the physical inventory must automatically generate a loss incident for investigation.
- **RN-PAT-004:** Assets with an active warranty must generate an automatic alert 60 days before expiry.
- **RN-PAT-005:** No asset may be removed from the condominium without an asset movement record.
- **RN-PAT-006:** Assets in "unusable" condition must have their destination recorded within 30 days.
- **RN-PAT-007:** The asset report must be integrated into the syndic's annual financial report.
- **RN-PAT-008:** Damage to a condominium asset caused by a resident or visitor generates an incident linked to the item, with the option to charge the responsible party.
- **RN-PAT-009:** Items linked to common areas under maintenance must be flagged as unavailable in the reservations module.

---

### 15.8 Entities

#### Entity: `Asset`

```
id, condo_id,
tag_number,           -- unique per condominium, auto-generated
description, brand?, model?, serial_number?, color?,
category, subcategory?,
allocated_area_id,    -- common area where it is allocated
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
id, condo_id, asset_id,
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
id, condo_id,
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

---

## 16. Consumable Inventory Management

This section covers control of the condominium's consumable supplies — items used in day-to-day operations, depleted through use, and requiring periodic replenishment. Unlike assets (durable goods), consumables have a short cycle and are managed by quantity, expiry, and cost.

---

### 16.1 Distinction Between Assets and Consumables

| Dimension | Asset (Section 15) | Consumable (This Section) |
|---|---|---|
| **Nature** | Durable good; not depleted through use | Item of continuous use; depleted or expires |
| **Control** | Individual tagging per item | Control by product/SKU and stock quantity |
| **Useful life** | Years | Days to months |
| **Financial management** | Depreciation, residual value | Cost per use, average monthly consumption |
| **Replenishment** | Occasional, by decision | Periodic, triggered by minimum stock level |
| **Examples** | TV, freezer, cutlery set, drill | Detergent, toilet paper, chlorine, light bulb |

> **Note:** Some items straddle both categories depending on the context. Simple manual tools (sponges, brooms) are consumables; power tools (vacuum, drill) are assets.

---

### 16.2 Consumable Categories

| Category | Examples |
|---|---|
| **Cleaning and Hygiene** | Detergent, disinfectant, bleach, washing powder, multipurpose cleaner, drain cleaner, glass cleaner, floor wax, descaler, mop, sponge, broom, mop bucket, trash bags, paper towels, toilet paper, liquid soap |
| **Landscaping** | Fertilizer, substrate, insecticide, herbicide, seeds, seedlings, foliar fertilizer |
| **Pool and Leisure Area** | Granular chlorine, algaecide, clarifier, pH-minus, pH-plus, flocculant, chlorine tablets |
| **Electrical and Lighting** | Light bulbs (LED, fluorescent), fuses, electrical tape, outlets, switches, cables |
| **Plumbing** | Thread seal tape, PVC adhesive, sandpaper, clamps, PVC fittings, waterproofing tape, drain unblocking products |
| **General Maintenance** | Screws, nails, wall plugs, sandpaper, putty, touch-up paint, masking tape, silicone, glue |
| **Office / Administration** | A4 paper, pens, staples, clips, envelopes, printer cartridges, folders, labels |
| **Safety and PPE** | Disposable gloves, masks, protective goggles, hard hats, wet floor signs |
| **Gatehouse and Reception** | Visitor forms, ID labels, access printer paper rolls |
| **Staff Break Room** | Coffee, sugar, disposable cups, paper filters, dish detergent |

---

### 16.3 Inventory Management Flow

```
Product registration (SKU, category, unit, minimum stock)
                    ↓
         Stock entry
    (purchase, donation, transfer)
                    ↓
         Use / Exit recorded
    (request by employee or WO)
                    ↓
         Balance updated in real time
                    ↓
    Balance ≤ minimum stock?
         Yes → Replenishment alert generated
         No  → Monitoring continues
                    ↓
    Purchase request
    (auto-generated or manual)
                    ↓
    Approval (syndic / superintendent per authorization level)
                    ↓
    Purchase completed → Invoice recorded → Stock entry
```

---

### 16.4 Minimum Stock and Reorder Point

- **Minimum stock:** quantity below which the condominium risks operational disruption. Triggers a replenishment alert.
- **Maximum stock:** upper limit to avoid waste, expiry, and excess capital tied up.
- **Reorder point:** quantity at which the order must be triggered, accounting for the supplier's average lead time.
- **Average monthly consumption:** calculated automatically based on the exit history of the last 3–6 months.

```
Reorder Point = Average Daily Consumption × Lead Time (days) + Minimum Stock
```

**Example:**

- Detergent: consumption 2 bottles/day, lead time 3 days, minimum stock 5 bottles.
- Reorder point = (2 × 3) + 5 = **11 bottles**. Alert triggers when stock reaches 11.

---

### 16.5 Item Requests and Exits

- Every item removal from stock must be recorded by an identified responsible party.
- The request may be linked to a Work Order (maintenance) or a cost center (cleaning, gatehouse, administration).
- This allows calculation of the **actual cost per area / activity**, cross-referenced with the planned budget.

**Typical cost centers:**

- Cleaning and upkeep
- Building maintenance
- Gatehouse and security
- Pool and leisure
- Landscaping
- Administration

---

### 16.6 Expiry Control

- Products with expiry dates (disinfectants, chlorine, break room items, PPE) must have the expiry date recorded on the entry lot.
- The system must alert about items approaching expiry (e.g., 30 days in advance).
- FIFO policy (*First In, First Out*): older items are consumed first.
- Expired items must be written off from stock with a disposal record (to avoid counting as operational cost).

---

### 16.7 Consumable Supplier Management

- Each product may have one or more registered suppliers, with a reference price and lead time.
- The purchase history allows identification of price variations and supports negotiations.
- Pre-purchase quotes: for purchases above a value defined at assembly, a minimum of 3 quotes is recommended.
- Evaluation criteria: price, lead time, quality, tax compliance (active CNPJ, debt-free certificates).

---

### 16.8 Reports and Stock Intelligence

| Report | Purpose |
|---|---|
| **Stock Position** | Current balance of all items; identifies critical shortages and excesses |
| **Monthly Consumption by Category** | Actual supply cost per month and per cost center |
| **Movement History** | Tracking of entries, exits, and responsible parties |
| **Items Approaching Expiry** | Preventive alert for use or disposal |
| **Supplier Analysis** | Price and lead time comparison per supplier over time |
| **Budget Variance** | Comparison between planned and actual consumable costs |
| **Pending Replenishment Alerts** | Items below reorder point with no purchase requested |

---

### 16.9 Business Rules — Inventory

- **RN-EST-001:** Every stock entry must be linked to an invoice or receipt document.
- **RN-EST-002:** Every exit must be recorded with an identified responsible party and a cost center.
- **RN-EST-003:** Upon reaching the reorder point, the system must automatically generate a replenishment alert for the syndic or building superintendent.
- **RN-EST-004:** Items with an expiry date must generate an automatic alert 30 days before expiry.
- **RN-EST-005:** Expired or discarded items must be written off from stock with a recorded reason; they may not be counted as operational consumption.
- **RN-EST-006:** Purchases above the authorization value defined in the bylaws must have syndic approval before being processed.
- **RN-EST-007:** Consumable costs must be classified by cost center and reflected in the monthly balance sheet as ordinary expenses.
- **RN-EST-008:** The inventory report must be part of the syndic's financial report, showing actual supply spending vs. budgeted.
- **RN-EST-009:** Stock policies (minimum, maximum, reorder point) may be configured per item, respecting the condominium's size and needs.

---

### 16.10 Entities

#### Entity: `StockProduct`

```
id, condo_id,
sku,                      -- unique internal code per product
name, description?,
category (cleaning | landscaping | pool | electrical | plumbing |
          maintenance | office | safety | gatehouse | break_room | other),
unit_of_measure (unit | kg | l | m | box | pack | roll),
has_expiry (bool),
current_stock,
minimum_stock,
maximum_stock,
reorder_point,
avg_monthly_consumption?,  -- auto-calculated
preferred_suppliers: [{
  supplier_id, reference_price, lead_time_days
}],
storage_location?,
photo_url?,
notes?,
status (active | discontinued)
```

#### Entity: `StockMovement`

```
id, condo_id, product_id,
type (entry | exit | adjustment | expiry_disposal | transfer),
quantity, unit_of_measure,
balance_before, balance_after,
moved_at,
responsible_id,
cost_center (cleaning | maintenance | gatehouse | pool | landscaping | administration | other),
linked_work_order_id?,  -- if exit linked to a Work Order
invoice_url?,           -- if entry by purchase
lot?, expiry_date?,
unit_price?,
supplier_id?,
adjustment_reason?,     -- for inventory adjustments
notes?
```

#### Entity: `PurchaseRequest`

```
id, condo_id,
items: [{
  product_id, requested_quantity,
  justification?, urgent (bool)
}],
requester_id,
requested_at,
status (pending | approved | rejected | purchased | partially_purchased),
approver_id?, approved_at?,
rejection_reason?,
quotes: [{
  supplier_id, unit_price, lead_time, notes
}],
chosen_supplier_id?,
approved_total_value?,
purchased_at?, invoice_url?
```

#### Entity: `StockInventory`

```
id, condo_id,
conducted_at,
responsible_id,
items_counted: [{
  product_id,
  system_quantity,   -- balance expected by the system
  physical_quantity, -- physically counted balance
  difference,        -- physical - system
  adjustment_applied (bool),
  note?
}],
status (in_progress | completed | with_discrepancies),
report_url?
```

---

## References

- Brazilian Civil Code — Law no. 10,406/2002 (Arts. 1,331 to 1,358)
- Law no. 4,591/1964 — Condominiums and Real Estate Incorporation Act
- Law no. 8,245/1991 — Tenancy Act
- Law no. 13,709/2018 — General Personal Data Protection Act (LGPD)
- CLT — Decree-Law no. 5,452/1943 and Labor Reform (Law 13,467/2017)
- Decree no. 11,905/2024 — DET and labor obligations
- ABNT NBR 5674:2024 — Building Maintenance
- ABNT NBR 16280:2024 — Building Renovation
- State Decree no. 69,118/2024 (SP) and IT-01/2025 — AVCB
- ABESE — Electronic Security Market Overview 2024/2025
- SíndicoNet, Direcional Condomínios, Migalhas Edilicias — Case law and best practices
- STJ — Condominium case law (parking spaces, 2024)
- São Paulo Court of Justice — LGPD in condominiums (2024–2025)

---

*Document for internal development use. Review periodically to stay current with legislative and regulatory changes. Last review: May 2026 — v1.4 (expansion: Communication, Space Reservations, Incidents/Complaints, Polls, Multi-Tenancy, Asset Management, Consumable Inventory).*
