---
title: "MarketFlow — API and Access Surface"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
contract_type: "API"
---

# MarketFlow — API and Access Surface

> Language: EN | [Português (pt-BR)](../../pt-BR/contracts/api.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/05-API.md`](../../../sdd/05-API.md). Technology-agnostic contract describing the MarketFlow access surface in the proposed state (SDD), without inventing endpoints, fields or error codes without evidence.

## Purpose

Describe how clients (frontend and catalog visitors) access MarketFlow: data paths, Edge Functions and the public storefront — and the associated guarantees.

## Scope

| In scope | Out of scope |
| --- | --- |
| Frontend → Supabase (Database/Auth/Storage) | Public API for third parties (future, P3) |
| Frontend → Edge Functions (AI, integrations, privileged ops) | Payment gateway (future) |
| Public catalog (read by slug, no login) | |
| RLS as data authorization mechanism | |

## Participants

| Participant | Role | Notes | Classification |
| --- | --- | --- | --- |
| React frontend | consumer | Authenticated client (company member) | Confirmed (SDD) |
| Supabase Client (Database/Auth/Storage) | producer | Default frontend surface | Confirmed (SDD) |
| Edge Functions | producer | Privileged/served operations | Confirmed (SDD) |
| Visitor (catalog) | consumer | Public read without login | Confirmed (SDD) |

## Contract type

- [x] API
- [ ] Event / Message / File / Command / Callback / Library / Data / Integration / Other

## Protocol

| Field | Value | Classification |
| --- | --- | --- |
| Protocol | HTTPS (assumed via Supabase/Lovable Cloud) | Inferred |
| Interaction style | request-response (and RPC) | Confirmed (SDD) |

## Endpoints / channels / interfaces

### 1. Authenticated data access (frontend → Supabase)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Supabase Database/Storage/Auth SDKs | Confirmed (SDD) |
| Method / operation | Query/read/write per permissions; RLS applied | Confirmed (SDD) |
| Notes | Frontend **never** authorizes; RLS and policies define access | Confirmed (SDD) |

### 2. Edge Functions (privileged operations)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Supabase Edge Function (via API gateway/Functions) | Confirmed (SDD) |
| Method / operation | POST/RPC | Confirmed (SDD) |
| Notes | For AI, external integrations, privileged and async operations | Confirmed (SDD) |

### 3. Public catalog

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Public URL by company slug (`/` + slug) | Confirmed (SDD) |
| Method / operation | GET (read-only) | Confirmed (SDD) |
| Notes | No login; only published content; abuse-protected | Confirmed (SDD) |

## Authentication

| Mechanism | Notes | Classification |
| --- | --- | --- |
| Supabase Auth — email + password | MVP | Confirmed (SDD) |
| Supabase Auth — Google OAuth | MVP | Confirmed (SDD) |
| (Future) Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Out of the MVP | Confirmed (SDD) |

No secret values — references only. Details: [security/authentication.md](../security/authentication.md).

## Authorization

| Rule | Notes | Classification |
| --- | --- | --- |
| Server-side RBAC; role in `CompanyUser.role` | `GLOBAL_ADMIN`, `ADMIN`, `STOCK`, `VISITOR` | Confirmed (SDD) |
| Authorization considers User + Company + Role + Resource + Action | Authorization context model | Confirmed (SDD) |
| RLS in Postgres applied to data access | Never trust `company_id`/`user_id`/permissions sent by the client | Confirmed (SDD) |
| Public catalog: only published content; no internal data leak | Field filtering; rate limiting | Confirmed (SDD) |

Details: [security/authorization.md](../security/authorization.md).

## Validation

| Rule | Where applied | Notes | Classification |
| --- | --- | --- | --- |
| Input validation (Zod/frontend) | consumer | Immediate UX | Confirmed (SDD) |
| Server-side validation (Edge Functions/RLS) | producer | **Backend always validates** | Confirmed (SDD) |
| Prices non-negative; SKU/barcode unique per company | producer | Domain rules | Confirmed (SDD) |
| AI output validated and structured | producer | Prompt injection mitigated | Confirmed (SDD) |

## Errors

| Error / condition | Retryable | Consumer action | Classification |
| --- | --- | --- | --- |
| Authentication failure | no | Redirect to login | Confirmed (SDD) |
| Access denied (authorization) | no | Show unauthorized/forbidden state | Confirmed (SDD) |
| Plan limit/quota reached | Unknown | Inform limit; backend enforces | Confirmed (SDD) |
| AI provider failure | yes | Re-present to user; audit | Confirmed (SDD) |
| Validation violation (insufficient stock etc.) | no | Clear message + final validation on backend | Confirmed (SDD) |

Detailed error catalog: not defined yet (no evidence).

## Rate limits

| Limit | Value | Classification |
| --- | --- | --- |
| Public catalog (anti-abuse) | To be defined (required) | Proposed |
| AI | Quota + rate limit per company | Confirmed (SDD) |
| Public endpoints | Abuse-protected | Confirmed (SDD) |

## Size limits

| Limit | Value | Classification |
| --- | --- | --- |
| Image uploads | Validated (type, size, content) | Confirmed (SDD) |

## Security considerations

| Topic | Summary | Classification |
| --- | --- | --- |
| Data sensitivity | `cost_price`, margin, suppliers and audit data are internal — never in the public catalog | Confirmed (SDD) |
| Encryption in transit | HTTPS (maintained by managed infrastructure) | Inferred |
| PII / secrets handling | LGPD to be documented; secrets never in code/frontend | Confirmed (SDD) |

## Observability

| Signal | What to observe | Classification |
| --- | --- | --- |
| Logs | Critical operations audited; security events | Confirmed (SDD) |
| Metrics | Rate limiting, AI quota, errors | Proposed |
| Traces | Not applicable in the simple MVP | Not Applicable |

## Examples

### Example — success (authenticated data flow)

```text
Frontend → Supabase Client → PostgreSQL + RLS   (list products of the current company)
Frontend → Edge Function  → server auth + business → PostgreSQL  (privileged operation)
```

### Example — AI (assisted registration)

```text
Image/input → Edge Function → AI provider → result + confidence → human review → save
```

## Failure scenarios

| Scenario | Impact | Expected behavior | Mitigation | Classification |
| --- | --- | --- | --- | --- |
| AI provider unavailable | AI functions down | Does not block catalog/inventory | Failure isolation | Confirmed (SDD) |
| Public catalog abuse | Cost/exposure | Rate limiting | Anti-abuse protection | Confirmed (SDD) |
| Cross-tenant attempt | Leak | Denied by RLS/authorization | Cross-tenant + IDOR/BOLA tests | Confirmed (SDD) |

## Related components

| Component | Relationship | Path / ID |
| --- | --- | --- |
| React frontend | consumer | [architecture/overview.md](../architecture/overview.md) |
| Supabase (Database/Auth/Storage/Edge Functions) | producer | [architecture/overview.md](../architecture/overview.md) |
| Public catalog | producer (public read) | [architecture/overview.md](../architecture/overview.md) |

## Related architecture

| Document | Path |
| --- | --- |
| Architecture overview | [architecture/overview.md](../architecture/overview.md) |
| Data model | [architecture/data-model.md](../architecture/data-model.md) |

## Related ADRs

| ADR | Relevance | Path |
| --- | --- | --- |
| ADR-001 (cloud stack) | Managed backend; surface via Supabase | [decisions/adr-001-cloud-stack.md](../decisions/adr-001-cloud-stack.md) |
| ADR-003 (multi-tenant RLS) | RLS as data authorization mechanism | [decisions/adr-003-multi-tenant-isolation.md](../decisions/adr-003-multi-tenant-isolation.md) |
| ADR-004 (RBAC) | Server-side authorization | [decisions/adr-004-rbac-roles.md](../decisions/adr-004-rbac-roles.md) |