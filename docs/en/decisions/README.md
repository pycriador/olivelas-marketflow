---
title: "MarketFlow — Architecture Decisions (ADR)"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Architecture Decisions (ADR)

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/README.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Index of MarketFlow architecture decisions. Each ADR follows the `adr.md` template of the Documentation Standard (external library): the frontmatter `status` is the document lifecycle; the `## Status` section is the decision status — they are independent.

## ADRs

| ADR | Decision | Decision status | Mapped from |
| --- | --- | --- | --- |
| [ADR-001](adr-001-cloud-stack.md) | Cloud stack: Supabase + Lovable Cloud; no independent backend in the MVP | Accepted | `sdd/01-FOUNDATION.md` |
| [ADR-002](adr-002-frontend-stack.md) | Frontend: React + TypeScript + Vite + shadcn/ui | Accepted | `sdd/01-FOUNDATION.md` |
| [ADR-003](adr-003-multi-tenant-isolation.md) | Multi-tenant isolation via `company_id` + RLS | Accepted | `sdd/02-DATABASE.md` |
| [ADR-004](adr-004-rbac-roles.md) | RBAC roles; server-side authorization; role in `CompanyUser.role` | Accepted | `sdd/04-PERMISSIONS.md` |
| [ADR-005](adr-005-auth-providers.md) | Authentication providers (email+password, Google OAuth; MFA future) | Accepted | `sdd/03-AUTH.md` |
| [ADR-006](adr-006-monetization-free-first.md) | Free First monetization; backend limits; billing per company | Accepted | `sdd/07-MONETIZATION.md` |
| [ADR-007](adr-007-design-system.md) | Design system: shadcn/ui, Content First | Accepted | `sdd/09-DESIGN_SYSTEM.md` |

## How to record a new ADR

1. Read the relevant documentation before changing architecture.
2. Record context, problem, decision, alternatives and consequences.
3. Keep lifecycle `DRAFT` until review; the `## Status` section reflects the decision situation.

## Related documentation

| Document | Location |
| --- | --- |
| Architecture | [architecture/overview.md](../architecture/overview.md) |
| ADR template | `aiops-documentation/docs/pt-BR/templates/adr.md` (external library) |
| Source | [`sdd/`](../../../sdd/) |