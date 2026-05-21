# CLAUDE.md

This file is the **single source of truth** for all agent behavior in this project.
Claude Code reads this file automatically on every session and every sub-agent invocation.

---

## Project Identity

All project-specific values (`{project}`, `{org}`, base version, git remote, etc.) are resolved from [`docs/project-definition.md`](docs/project-definition.md). Read that file to determine the current project's identifier, organization, and starting version before executing any spec, branch, or version-bump task.

Never hardcode project identifiers in this file or in `docs/architecture-guide.md`. To reuse this document in a new project, only `docs/project-definition.md` needs to change.

---

## Architecture Reference

The full engineering architecture is documented in [`docs/architecture-guide.md`](docs/architecture-guide.md).
It is the **single source of truth for all engineering decisions** — stack, patterns, API contracts, auth, multi-tenancy, data strategy, CI/CD, and UI stack.

---

## Knowledge Base

The domain knowledge base is maintained in two files that must always stay in sync:

| File | Language | Role |
|---|---|---|
| [`docs/knowledge-base.md`](docs/knowledge-base.md) | English (en-US) | **Canonical version** — authoritative for all implementation decisions |
| [`docs/knowledge-base-pt_BR.md`](docs/knowledge-base-pt_BR.md) | Portuguese (pt-BR) | Translation — kept in sync with the canonical version |

**Sync rule:** Any edit to either file must be reflected in the other before the task is considered complete. The en-US file (`knowledge-base.md`) is the source of truth. When content diverges, the en-US version takes precedence. Entity field names and code identifiers are defined in the en-US version; the pt-BR version may reference them rather than redefine them.

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
- User-facing UI strings (labels, messages, placeholders, tooltips) — must use i18n translation keys (never hardcoded). `en_US` is the canonical locale; `pt_BR` is the second required locale. Both translation files must stay in sync. See Section 24 of `docs/architecture-guide.md`.

**Locale-sensitive formatting** (dates, numbers, currencies) is runtime behavior driven by `Intl` APIs — governed by the active locale, not by this policy.

---

## Brand Identity

- **Primary color:** teal
- **Visual tone:** calm, trustworthy, professional ("zen" aesthetic)
- Apply consistently across all UI work. Design tokens and component rules live in [`docs/architecture-guide.md` §4](docs/architecture-guide.md).

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
