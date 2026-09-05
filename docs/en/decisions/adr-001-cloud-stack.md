---
title: "ADR-001 — Cloud Stack: Supabase + Lovable Cloud"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-001 — Cloud Stack: Supabase + Lovable Cloud

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-001-cloud-stack.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow needs a reliable backend for the MVP (auth, database, storage and functions) without operating its own infrastructure. The team seeks operational simplicity and speed.

## Problem

What is the backend/cloud stack for the MVP?

## Decision

Use **Supabase** (Auth, PostgreSQL, Storage, Edge Functions) as the managed backend and **Lovable Cloud** as the frontend host. **Do not create an independent backend API in the MVP** — the frontend accesses Supabase directly (with RLS) and uses Edge Functions for privileged operations. Details: `sdd/01-FOUNDATION.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Own backend (FastAPI/Nest) + managed Postgres | Full control | Higher operational cost; larger attack surface; slows the MVP | Unnecessary for the MVP scope |
| Firebase | Similar to Supabase | Firebase lock-in; less control over Postgres/SQL | Supabase offers Postgres + native RLS |
| Pure serverless (Vercel + external DB) | Simple | Tenant isolation/RLS require extra work | Supabase covers auth+db+storage+functions |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Native RLS/tenant isolation in Postgres | Managed vendor lock-in | Edge Functions replace custom endpoints |
| Less infrastructure to operate in the MVP | Future Supabase migration non-trivial | Dependency on the AI provider plan |
| Auth, storage and DB integrated | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Vendor lock-in | Standard Postgres data model; documented contracts | Proposed |
| Future scale cost | Limits and quota from the MVP | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| Frontend | Consumes Supabase Client + Edge Functions | [../architecture/overview.md](../architecture/overview.md) |
| Data backend | Supabase PostgreSQL + RLS | [../architecture/data-model.md](../architecture/data-model.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Via Supabase SDKs + Edge Functions | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-001 |
| Component | Frontend, Supabase, Edge Functions |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/01-FOUNDATION.md` (spec — not implemented yet) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | related (frontend stack) |
| ADR-003 | related (isolation analysis on the same Postgres) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Evidence | [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md) |