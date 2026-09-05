---
title: "MarketFlow — Authorization and RBAC"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Authorization and RBAC

> Language: EN | [Português (pt-BR)](../../pt-BR/security/authorization.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md). Proposed state (not implemented).

## Purpose

Define the MarketFlow authorization model: roles, where the role lives and how the access decision is made.

## Model: RBAC with role per user–company binding

- The role is **not** on the global user (`users`); it lives on the `CompanyUser.role` binding.
- A user can belong to multiple companies, with different roles in each.
- Authorization considers the tuple: **User + Company + Role + Resource + Action**.

## Roles

| Role | Scope | Typical assignments | Classification |
| --- | --- | --- | --- |
| `GLOBAL_ADMIN` | Platform (not employed by a company) | Platform management; never created via frontend manipulation | Confirmed (SDD) |
| `ADMIN` | Company | Full company management (products, inventory, members, catalog, billing) | Confirmed (SDD) |
| `STOCK` | Company | Inventory: entries, exits, adjustments, lots/expiry | Confirmed (SDD) |
| `VISITOR` | Company | Read-only; no access to administrative information | Confirmed (SDD) |

## Principles

| Principle | Meaning | Classification |
| --- | --- | --- |
| Deny by Default | No access without explicit authorization | Confirmed (SDD) |
| Least Privilege | Roles with the minimum required | Confirmed (SDD) |
| Server-side authorization | Decision always on the backend; never UI-only | Confirmed (SDD) |
| Tenant isolation | Access limited to the session's company | Confirmed (SDD) |
| Separation of Duties | Impactful actions require adequate roles | Confirmed (SDD) |
| Object-level authorization | Prevent IDOR/BOLA with per-object authorization | Confirmed (SDD) |

## Model rules

| Rule | Notes | Classification |
| --- | --- | --- |
| No self-privilege elevation | User cannot change own role | Confirmed (SDD) |
| Protect the last Admin | Do not remove/demote the last `ADMIN` of a company without a safe flow | Confirmed (SDD) |
| Role changes require authorization | Never by the client without backend approval | Confirmed (SDD) |
| RLS complements RBAC | RLS by `company_id` + role for data access | Confirmed (SDD) |
| `company_id` is never a source of trust | Derived from the session/RLS | Confirmed (SDD) |
| Permissions are never supplied by the client | Trusting client-supplied permission = vulnerability | Confirmed (SDD) |
| Public catalog without internal data | `<nothing>` beyond published content | Confirmed (SDD) |

## Enforcement mechanisms

| Layer | Mechanism | Classification |
| --- | --- | --- |
| Frontend | UX: lists routes/actions, unauthorized/forbidden states — **does not authorize** | Confirmed (SDD) |
| Edge Functions | Validates role + permission + company server-side | Confirmed (SDD) |
| PostgreSQL RLS | Policies by `company_id` (+ role when needed) | Confirmed (SDD) |
| Storage policies | File isolation per company | Confirmed (SDD) |

Typical privileged operation flow:

```text
Frontend → Edge Function → (token) server-side authorization → business → database/RLS
```

## Guard cases (security acceptance)

- Removed users lose access immediately; disabled users cannot operate.
- `VISITOR` does not access administrative information.
- `GLOBAL_ADMIN` is not createable via frontend manipulation.
- Cross-tenant and IDOR/BOLA tests as MVP acceptance criteria.

## Future

- Custom roles, ABAC, SSO/SAML/OIDC (P2/future) — see [roadmap.md](../roadmap.md).

## Related documentation

| Document | Path |
| --- | --- |
| Authentication | [authentication.md](authentication.md) |
| Security (overall posture) | [security.md](security.md) |
| Data model (`company_users`) | [architecture/data-model.md](../architecture/data-model.md) |
| Contracts (access authorization) | [contracts/api.md](../contracts/api.md) |
| Full source | [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md) |