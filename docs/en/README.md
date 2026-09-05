---
title: "MarketFlow — Index"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Index

> Language: EN | [Português (pt-BR)](../pt-BR/README.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Documentation of MarketFlow, a SaaS platform for small businesses to organize products, prices, inventory and a public catalog, with AI features.

## Starting points

1. [AI Context](ai-context.md) — entry point for agents and AI prompts.
2. [Project Overview](project-overview.md) — purpose, scope and system map.
3. [Roadmap](roadmap.md) — priorities and planned evolution.

## Documents by category

| Document | Description | Mapped from |
| --- | --- | --- |
| [project-overview.md](project-overview.md) | Purpose, scope, users, system map | `sdd/00-VISION.md` |
| [roadmap.md](roadmap.md) | Priorities, MVP and incremental evolution | `sdd/06-ROADMAP.md`, `sdd/10-FULL-SYSTEM.md` |
| [architecture/overview.md](architecture/overview.md) | Context, components, boundaries, dependencies | `sdd/01-FOUNDATION.md` |
| [architecture/data-model.md](architecture/data-model.md) | Core entities, multi-tenant isolation | `sdd/02-DATABASE.md` |
| [contracts/api.md](contracts/api.md) | Access surface and API contracts | `sdd/05-API.md` |
| [security/security.md](security/security.md) | Security posture, threats, controls | `sdd/08-SECURITY.md` |
| [security/authentication.md](security/authentication.md) | Authentication (Supabase Auth, providers) | `sdd/03-AUTH.md` |
| [security/authorization.md](security/authorization.md) | Authorization and RBAC | `sdd/04-PERMISSIONS.md` |
| [decisions/README.md](decisions/README.md) | ADRs — architecture decisions | various `sdd/*.md` |

## Architecture decisions (ADRs)

| ADR | Decision | Mapped from |
| --- | --- | --- |
| [ADR-001](decisions/adr-001-cloud-stack.md) | Cloud stack: Supabase + Lovable Cloud | `sdd/01-FOUNDATION.md` |
| [ADR-002](decisions/adr-002-frontend-stack.md) | Frontend: React + TypeScript + Vite + shadcn/ui | `sdd/01-FOUNDATION.md` |
| [ADR-003](decisions/adr-003-multi-tenant-isolation.md) | Multi-tenant isolation via `company_id` + RLS | `sdd/02-DATABASE.md` |
| [ADR-004](decisions/adr-004-rbac-roles.md) | RBAC roles and server-side authorization | `sdd/04-PERMISSIONS.md` |
| [ADR-005](decisions/adr-005-auth-providers.md) | MVP authentication providers | `sdd/03-AUTH.md` |
| [ADR-006](decisions/adr-006-monetization-free-first.md) | Free First monetization with backend limits | `sdd/07-MONETIZATION.md` |
| [ADR-007](decisions/adr-007-design-system.md) | Design system: shadcn/ui, Content First | `sdd/09-DESIGN_SYSTEM.md` |

## Validation rules

- Every document requires frontmatter with `title`, `status`, `owner`, `updated`.
- `status` in frontmatter = document lifecycle (`DRAFT` until review; then `ACCEPTED`).
- In ADRs, the `## Status` section = decision status; independent fields.
- Manifest IDs follow `^[A-Z][A-Z0-9]*(-[A-Z0-9]+)+$`.
- Validation rules are defined in the `validation-config.yaml` of the external standard library (`aiops-documentation/docs/validation-config.yaml`); local manifest in [manifest.yaml](manifest.yaml).

## Related documentation

| Document | Location |
| --- | --- |
| Product source of truth | [`sdd/`](../../sdd/) |
| Documentation Standard v1.0 (external library) | `aiops-documentation/docs/` |