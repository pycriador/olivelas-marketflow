---
title: "ADR-003 — Multi-tenant Isolation via company_id + RLS"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-003 — Multi-tenant Isolation via `company_id` + RLS

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-003-multi-tenant-isolation.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow is multi-company from v1 and treats cross-company leaks as a critical threat. The MVP runs on shared Postgres (Supabase) without dedicated infrastructure cost.

## Problem

How to isolate data between companies (tenants) in the MVP?

## Decision

Use **shared PostgreSQL with logical isolation**: a `company_id UUID NOT NULL` column on all business tables + **Row Level Security (RLS)** by `company_id` (and role when needed). Primary keys `UUID` (`gen_random_uuid()`); **no sequential IDs exposed publicly**; uniqueness (slug, SKU/barcode) validated **per company**. `company_id` is never trusted from the client — derived from the session/RLS. Details: `sdd/02-DATABASE.md`, `sdd/08-SECURITY.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Database per tenant (schema/database dedicated) | Strong isolation | Operational complexity and high cost; multiple migrations | Unnecessary cost/complexity in the MVP |
| Application-only isolation (no RLS) | Simple | Authorization outside the DB; high IDOR risk; violates "never trust the client" | Rejected for security principle |
| Multi-tenancy via `user_id` only | Easy | A user belongs to several companies — invalid for the model | Model requires `company_id` + role per binding |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| RLS as last line of defense on the data | Discipline: every query via Supabase Client respects RLS | Mandatory cross-tenant tests |
| Simple model for the MVP | Future migration to dedicated tenants is extra work | Branch support (`P3`) is prepared (not implemented) |
| Per-company uniqueness avoids collisions | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Incorrect RLS policy → leak | Cross-tenant and IDOR/BOLA tests as MVP acceptance criteria | Proposed |
| `company_id` trusted from the client | Validate via token/session; never from input | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| PostgreSQL | RLS + `company_id` on all business tables | [../architecture/data-model.md](../architecture/data-model.md) |
| Frontend/Edge Functions | Never pass `company_id` as a source of trust | [../contracts/api.md](../contracts/api.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Data access via RLS | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-003 |
| Component | PostgreSQL, Frontend, Edge Functions |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/02-DATABASE.md`, `sdd/08-SECURITY.md` (spec — not implemented) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (Supabase/Postgres chosen) |
| ADR-004 | related (role per binding complements RLS) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Data model | [../architecture/data-model.md](../architecture/data-model.md) |
| Security | [../security/security.md](../security/security.md) |
| Evidence | [`sdd/02-DATABASE.md`](../../../sdd/02-DATABASE.md) |