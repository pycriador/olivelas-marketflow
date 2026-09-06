---
title: "ADR-008 — API First: Versioned REST API + API Keys"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-008 — API First: Versioned REST API + API Keys

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-008-api-first-and-api-keys.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-05

## Context

MarketFlow evolves from a web application into an extensible SaaS platform. The web app must not own exclusive business rules, and external systems need a controlled, auditable and rate-limited way to integrate.

## Problem

How to expose the business layer as an official API and control machine-to-machine access?

## Decision

Adopt **API First**: a versioned **REST API under `/api/v1`** as an official product interface. The web frontend consumes the same business layer that the API will expose — no exclusive business rules hidden in the UI.

- **Versioning**: `/api/v1`. Never break an existing version silently; incompatible changes → new version.
- **API Keys/tokens**: bearer keys `mf_live_...` / `mf_test_...` (prefix + environment + secret). Full secret shown only once at creation; database stores only the **hash** (`secret_hash`). Table `api_keys` with `company_id`, scopes, environment, status (active/revoked/expired), `expires_at`, `last_used_at`, `revoked_at`.
- **Scopes** (least privilege): `products:read/write`, `categories:read/write`, `brands:read/write`, `manufacturers:read/write`, `suppliers:read/write`, `inventory:read/write`, `lots:read/write`, `catalog:read/write`, `requests:read/write`, `ai:use`, `reports:read`.
- **Tenant binding**: every key belongs to one `company`; token + company + permission + resource ownership validated on every request.
- **Rate limiting**, **idempotency** (`Idempotency-Key`) for mutations, **pagination** (page, page_size, sort, order, search, filters; max 100), consistent **response envelope** (`{ data, meta }` / `{ error: { code, message, details } }`), **OpenAPI** documentation (`/api/docs`, `/api/openapi.json`).
- **Public API** separated under `/public/v1` (e.g., catalog by slug) — never reuse administrative endpoints for public access.
- **Webhooks** architecture prepared (events, secret, status, retries, signatures, idempotency).
- API keys, webhooks and AI/WhatsApp services never bypass Authentication, Authorization, Tenant Isolation, RLS, Audit, Rate Limits or Plan Limits.

Details: `sdd/12-EXTRAS.md` sections 1–21, 49–60.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Only frontend + Supabase client | Simple; fast MVP | No official surface for integrations; rules trapped in the UI | API First is the product direction |
| Third-party direct DB access | Simple | No authorization/audit; insecure | Never expose the database |
| GraphQL | Flexible queries | More complexity | REST covers the MVP; GraphQL not needed now |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Official, documented, versioned integration surface | Larger attack surface (must be rate limited and audited) | Scopes add a second authorization dimension alongside RBAC |
| Controlled access via tokens + scopes | Token lifecycle management (rotation, revocation) | Token format/prefix shows environment |
| Webhooks and integrations prepared | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Token leakage | Hash-only storage; least privilege scopes; rotation/revocation | Proposed |
| API abuse | Rate limiting per category; audit logs | Proposed |
| Breaking changes | Versioning; never silent breaks | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| API Layer (`/api/v1`, `/public/v1`) | New official interface | [../contracts/api.md](../contracts/api.md) |
| `api_keys` / `api_request_logs` | Token + audit storage | [../architecture/data-model.md](../architecture/data-model.md) |
| Developer area (API Keys, Docs, Webhooks, Logs) | Product UI | [../architecture/overview.md](../architecture/overview.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Versioned REST, tokens, scopes, envelopes, OpenAPI | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-008 |
| Component | API Layer, `api_keys`, Developer area |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/12-EXTRAS.md` (spec; frontend simulation implemented, backend pending) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (managed backend hosts the API layer) |
| ADR-003 | related (tokens are tenant-scoped) |
| ADR-004 | related (RBAC + scopes combine for authorization) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Security | [../security/security.md](../security/security.md) |
| Evidence | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |