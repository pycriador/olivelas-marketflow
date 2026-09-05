---
title: "ADR-004 — RBAC Roles and Server-side Authorization"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-004 — RBAC Roles and Server-side Authorization

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-004-rbac-roles.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow has multiple profiles within the same company and treats privilege escalation and frontend-only authorization as critical threats. Users can belong to several companies.

## Problem

How to model permissions and where to enforce authorization?

## Decision

Adopt **RBAC** with roles **`GLOBAL_ADMIN`**, **`ADMIN`**, **`STOCK`**, **`VISITOR`**, living on the **`CompanyUser.role`** (user+company binding), never on the global user. Authorization considers **User + Company + Role + Resource + Action** and is decided **server-side** (Edge Functions + RLS), never UI-only. Details: `sdd/04-PERMISSIONS.md`, `sdd/08-SECURITY.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Role on the global user | Simple | Works poorly with multi-company; a user would have a single role | Rejected — role per binding is the model |
| Frontend-only authorization | Fast to implement | Insecure; violates "never trust the client" | Rejected for principle |
| ABAC from the start | Flexible | High complexity in the MVP | Future (P2) — custom roles/ABAC |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| One user = distinct roles per company | Permission matrix must be maintained | Member management inside the app |
| Ready to secure inventory, catalog and AI | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Permission matrix not updated | Security checklist + role tests in the MVP | Proposed |
| Privilege elevation within the company | Block self-elevation; protect the last Admin | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| `company_users` | Role per binding | [../architecture/data-model.md](../architecture/data-model.md) |
| Frontend | Unauthorized/forbidden states (UX, not authorization) | [../security/authorization.md](../security/authorization.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Server-side authorization in Edge Functions | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-004 |
| Component | `company_users`, Frontend, Edge Functions |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/04-PERMISSIONS.md` (spec — not implemented) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-003 | related (RLS complements RBAC) |
| ADR-005 | related (auth defines identity; RBAC defines authorization) |

## References

| Reference | Location |
| --- | --- |
| Authorization doc | [../security/authorization.md](../security/authorization.md) |
| Security | [../security/security.md](../security/security.md) |
| Evidence | [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md) |