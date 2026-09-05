---
title: "ADR-006 — Free First Monetization with Backend Limits"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-006 — Free First Monetization with Backend Limits

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-006-monetization-free-first.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow wants to acquire users (small retailers) with a free plan and monetize later, without payments being an MVP dependency. The architecture must allow monetization without rework.

## Problem

How to prepare the monetization model in the MVP without implementing a payment gateway?

## Decision

Adopt **Free First** as the strategy (priority P2 for full implementation, with architectural preparation in the MVP). Model: **Plan → Plan Limits → Usage → Feature Access**. The **backend** enforces limits (`plan_limits` / `usage`); the frontend only informs. **Company** is the billing unit — subscription belongs to the company, and a user can be in several companies with distinct plans/usage/limits per company. Payments/gateway stay for a later phase, with abstraction prepared. Details: `sdd/07-MONETIZATION.md`, `sdd/28-BILLING`, `sdd/29-BACKLOG`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Paid-only from the start | Immediate revenue | Slows acquisition of small retailers | Free First aligns with the MVP user |
| Limits in code/frontend | Simple | Violation: limits must be in the backend; drift | Configurable in the database |
| Per-user billing (global per-seat) | Simple to model | Does not reflect multiple companies per user | Per-company billing |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Models configurable in the database | Requires `plan`/`usage` tables from the MVP | Entitlements evolve (feature access) |
| Backend enforcement protects limits | — | — |
| Gateway/webhook preparation without blocking | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Downgrade deletes data | Rule: downgrade does not delete data | Proposed |
| Limits ignored/frontend informs wrongly | Backend always validates; quota tests | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| `companies` / `company_users` | Billing unit = company | [../architecture/data-model.md](../architecture/data-model.md) |
| `plan_limits` / `usage` | Limits and usage per company | [../architecture/data-model.md](../architecture/data-model.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | AI quota, product/user limits enforced on the backend | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-006 |
| Component | `plan_limits`, `usage`, Company |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/07-MONETIZATION.md`, `sdd/28-BILLING` (spec — not implemented) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (managed backend enables entitlements) |
| ADR-003 | related (usage limited per company/tenant) |
| ADR-004 | related (plans/limits per user+company binding) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Roadmap | [../roadmap.md](../roadmap.md) |
| Evidence | [`sdd/07-MONETIZATION.md`](../../../sdd/07-MONETIZATION.md) |