# CLAUDE.md

This file is the **single source of truth** for all agent behavior in this project.
Claude Code reads this file automatically on every session and every sub-agent invocation.

---

## Project Identity

### Organization
ZenEngineeringLab

### Project name 
ZenAndVillage 

### Project identifier 
zenvillage 

### What it does 
ZenAndVillage is an AI-powered SaaS platform for smart condominium and community management, simplifying operations, communication, security, and decision-making through intelligent automation for a more connected, efficient, and peaceful living experience.

### Slogan
Connected Communities. Intelligent Operations. Peaceful Living.

### Brand Identity
- **Primary color:** teal
- **Visual tone:** calm, trustworthy, professional ("zen" aesthetic)

### Base version
0.3.0

### Git remote
github.com/ZenEngineeringLab/ZenAndVillage

---

## Architecture Reference

The full engineering architecture is maintained as a bilingual pair that must always stay in sync:

| File | Language | Role |
|---|---|---|
| [`docs/architecture-guide.md`](docs/architecture-guide.md) | English (en-US) | **Canonical version** — single source of truth for all engineering decisions |
| [`docs/architecture-guide.pt_BR.md`](docs/architecture-guide.pt_BR.md) | Portuguese (pt-BR) | Translation — kept in sync with the canonical version |

**Sync rule:** Any edit to `architecture-guide.md` must be reflected in `architecture-guide.pt_BR.md` before the task is considered complete. The en-US file takes precedence in case of conflict. Code identifiers, file paths, and code blocks are defined in en-US and referenced (not redefined) in pt-BR.

---

## Knowledge Base

Project documentation is split into two concerns — domain knowledge and software vision — each maintained as a bilingual pair that must always stay in sync:

### Domain Knowledge Base (Brazilian condominium domain only)

| File | Language | Role |
|---|---|---|
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | English (en-US) | **Canonical version** — domain definitions, legal framework, real-world roles and processes |
| [`docs/knowledge-base.pt_BR.md`](docs/knowledge-base.pt_BR.md) | Portuguese (pt-BR) | Translation — kept in sync with the canonical version |

Contains **only domain facts**: Brazilian condo law, actor/role definitions, governance processes, financial concepts, HR/labor rules, building operations, LGPD obligations. No entity schemas, no RN-XXX business rule codes, no software architecture.

### Software Vision (platform requirements and business rules)

| File | Language | Role |
|---|---|---|
| [`docs/software-vision.md`](docs/software-vision.md) | English (en-US) | **Canonical version** — authoritative for all implementation decisions |
| [`docs/software-vision.pt_BR.md`](docs/software-vision.pt_BR.md) | Portuguese (pt-BR) | Translation — kept in sync with the canonical version |

Contains: product vision, multi-tenancy **business model** (hierarchy, plans, tenant lifecycle), user roles and permissions, platform modules, data domain entities (with field definitions), and business rules (RN-XXX codes). For technical implementation details (DynamoDB patterns, Lambda Authorizer, Cognito flows), always defer to `docs/architecture-guide.md` — software-vision.md must not duplicate that content.

**Sync rule (applies to both pairs):** Any edit to either file in a pair must be reflected in the other before the task is considered complete. The en-US file is the source of truth. When content diverges, the en-US version takes precedence. Entity field names and code identifiers are defined in the en-US versions; the pt-BR versions may reference them rather than redefine them.

---

## Documentation Hygiene

**Never append version notes, review dates, or internal-use footers to any file in `docs/`.** Lines of the form:

```
*Document for internal development use. Last review: … — vX.Y (…)*
```

are forbidden. They duplicate information already captured in git history and CHANGELOG.md, drift out of sync immediately, and add noise that readers must filter out.

**Where change history belongs:**

- **`CHANGELOG.md`** — the single place where notable changes to the project (including significant documentation updates) are recorded. Add an entry here when opening a pull request, not as an inline footnote inside the edited document.
- **Git commit messages** — every commit already records what changed, when, and why. That is the audit trail for document edits.

**Rule:** when editing any `docs/*.md` file, do not add, update, or preserve any trailing footnote that mentions a version number, a review date, or the phrase "internal development use". If such a note already exists in a file being edited, remove it as part of the same change.

---

## Language Policy

**All project artifacts must be written in American English (en-US)**, regardless of the language the user uses in conversation.

This covers without exception:
- Source code (identifiers, comments, docblocks)
- Spec files (`requirements.md`, `design.md`, `tasks.md`)
- Git commit messages and branch names
- Configuration files, README, documentation
- Log and error messages in code
- Database schema names and column names
- API endpoint names and descriptions
- User-facing UI strings (labels, messages, placeholders, tooltips) — must use i18n translation keys (never hardcoded). `en_US` is the canonical locale; `pt_BR` is the second required locale. Both translation files must stay in sync. See Section 19 of `docs/architecture-guide.md`.

**Locale-sensitive formatting** (dates, numbers, currencies) is runtime behavior driven by `Intl` APIs — governed by the active locale, not by this policy.

---

## Ignore Files Policy

Whenever Claude creates, moves, deletes, or modifies files or directories, it must evaluate whether `.gitignore` and `.dockerignore` need to be updated.

**Update `.gitignore` when:** new build output dirs (`dist/`, `build/`), dependency dirs (`node_modules/`), env/secret files (`.env`, `*.key`), cache/temp dirs (`.cache/`, `tmp/`), IDE files (`.idea/`, `.vscode/`), or coverage dirs (`coverage/`) are introduced.

**Update `.dockerignore` when:** new dirs exist that should not be copied into Docker images, new build artifacts or local configs are added, or new secret/env files are created.

**Rules:**
- Never leave untracked sensitive files without a `.gitignore` entry
- Never copy unnecessary files into Docker images — keep images lean
- Both files must be reviewed together — a change affecting one usually affects the other
- If `.dockerignore` does not exist and Docker files are present, create it
- If `.gitignore` does not exist, create it before committing any new files

Both files live at the project root (or at the root of each Docker build context).

**Standard `.dockerignore` entries to always include:**
```
.git/
.kiro/
.claude/
node_modules/
vendor/
dist/
tests/
*.log
.env
.env.*
README.md
CHANGELOG.md
```

---

## Versioning Policy

This project uses a **three-layer versioning model** defined in full in Section 25 of [`docs/architecture-guide.md`](docs/architecture-guide.md). The summary below governs agent behavior.

### Source of truth

The canonical product version lives in `CLAUDE.md` under `## Project Identity → Base version`.
It must be propagated to every `package.json` in the monorepo and to `CHANGELOG.md` before a release commit is made.

### When to bump

| Change type | Bump |
|---|---|
| Breaking API contract, destructive schema migration | Major (`2.0.0`) |
| New user-visible feature, new Lambda domain, new API route | Minor (`1.1.0`) |
| Bug fix, config tweak, refactor with no external impact | Patch (`1.0.1`) |

### Version bump flow

Execute in this exact order:

```
1. Update  CLAUDE.md                        ← bump "Base version" under Project Identity
2. Update  zenvillage-web/package.json      ← set "version" to match
3. Update  {domain}-lambda/package.json     ← repeat for every Lambda package (when they exist)
4. Update  CHANGELOG.md                     ← add release section with date and summary
5. Commit  "chore(release): bump version to vX.Y.Z"
6. Tag     git tag vX.Y.Z
7. Push    git push origin main --tags
```

Steps 1–4 must land in the same commit. Never tag before committing, never push the tag without pushing the commit first.

---

## CHANGELOG Maintenance Policy

`CHANGELOG.md` must be kept current throughout the life of a feature branch — not only at release time.

### When to update

Update `CHANGELOG.md` **in the same commit** as the change it documents. Every incremental commit that touches user-visible behavior, adds a new capability, fixes a bug, or removes something must include a corresponding entry in the `[Unreleased]` section.

Do **not** batch changelog entries at the end of a branch. Each entry belongs alongside the commit that introduced it.

### How to write entries

Use the [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) categories. Pick the most accurate one:

| Category | Use when |
|---|---|
| `Added` | New feature, new route, new component, new domain, new config option |
| `Changed` | Behavior change in an existing feature, schema migration, UI redesign |
| `Fixed` | Bug fix — describe the symptom that was corrected |
| `Removed` | Feature, route, field, or dependency deleted |
| `Deprecated` | Something marked for future removal |
| `Security` | Vulnerability fix or security hardening |

Write entries from the user/operator perspective, not the implementation perspective. Describe what changed in the product, not which files were edited.

**Good:** `Added resident financial status badge to the Residents list view`
**Bad:** `Updated ResidentCard.tsx to include FinancialStatusBadge component`

Group multiple small entries under the same category rather than writing one entry per file touched.

### At release time

When cutting a release (following the Version bump flow), rename `[Unreleased]` to `[{version}] - {date}`, add the new empty `[Unreleased]` section above it, and update the comparison links at the bottom of the file.

---

## Incremental Commit Policy

When working on a feature branch, commit and push incrementally — do not accumulate all changes into a single end-of-task commit.

**When to commit:**
- After completing any self-contained unit of work (a component, an API route, a schema change, a config update, a passing test suite run).
- Whenever a meaningful milestone is reached, even if the overall task is not yet finished.
- Before switching context to a different area of the codebase within the same task.

**Commit hygiene:**
- Each commit must be buildable and must not break existing tests — never commit a half-implemented state that leaves the branch in a broken state.
- Write a concise, descriptive commit message following the project's commit style (imperative mood, present tense, e.g. `feat(auth): add JWT refresh logic`).
- Push to the remote branch after every commit, or at least after every two to three consecutive commits.

**Why:** Frequent pushes protect in-progress work from local machine failures, make code review easier by providing a clear history of decisions, and allow collaborators to see progress without waiting for a final PR.

---

## Pull Request Policy

Every pull request description must contain two sections: a **Code Changes Summary** and an **AI Productivity Analysis**.

### Code Changes Summary

Describe what changed, why, and any relevant architectural decisions. Follow the existing PR template in the repository if one exists.

### AI Productivity Analysis

Append this section to every PR body. Collect the data from git history and the diff; do not guess or omit fields.

```
## AI Productivity Analysis

| Metric | Value |
|---|---|
| Lines of code manipulated (added + removed) | {loc_added + loc_removed} ({loc_added} added, {loc_removed} removed) |
| Branch duration | {duration} (from `{branch_start_date}` to `{pr_date}`) |
| Technologies involved | {comma-separated list} |

### Estimated human effort (without AI assistance)

> **Estimated effort:** {hours}h — equivalent to approximately {total_days} work days (8h/day) or {total_weeks} work weeks (40h/week).
```

**How to populate each field:**

- **Lines of code manipulated** — run `git diff --stat origin/main...HEAD` and sum the insertions and deletions shown in the final totals line. Exclude lock files (`package-lock.json`, `yarn.lock`, `pnpm-lock.yaml`) from the count.
- **Branch duration** — use `git log --diff-filter=A --follow --format="%ad" --date=short -- .` on the first commit of the branch to get the start date; the PR date is today's date.
- **Technologies involved** — list every language, framework, library, and toolchain touched by the diff (e.g. TypeScript, React, Next.js, Tailwind CSS, Prisma, PostgreSQL, Docker). Derive from changed file extensions and import statements; do not list technologies present in the repo but untouched by this PR.
- **Estimated human effort** — produce a single realistic estimate of how long a human engineer would need to deliver the same result working alone, without AI assistance. Base the estimate on:
  - **Volume:** total lines of code manipulated (added + removed), weighted by complexity (boilerplate vs. logic-heavy code).
  - **Breadth:** number of distinct technologies involved — each additional technology adds ramp-up and integration overhead.
  - **Scope indicators:** number of new components, API routes, schema changes, config files, and test coverage added.
  - Express the result in hours (e.g. `8h`, `2h`). If the scope is very small (< 1h), use `< 1h`.
- **Total estimated effort** — use the single estimated hours value from above. Then compute:
  - `{total_days}` = `{hours}` ÷ 8, rounded to one decimal place
  - `{total_weeks}` = `{hours}` ÷ 40, rounded to one decimal place
  - If the estimate is `< 1h`, treat it as `0.5h` for arithmetic purposes and note the approximation inline.
