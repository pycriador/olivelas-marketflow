---
title: "MarketFlow — API and Access Surface"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
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

Source: [`sdd/05-API.md`](../../../sdd/05-API.md) and [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md). Technology-agnostic contract describing the MarketFlow access surface — the documented contract is the target; the current prototype simulates parts in the frontend.

## Purpose

Describe how clients (frontend, catalog visitors and API consumers) access MarketFlow: data paths, versioned API, Edge Functions services and the public storefront — and the associated guarantees.

## Scope

| In scope | Out of scope |
| --- | --- |
| Frontend → Supabase (Database/Auth/Storage) | Direct third-party database access |
| Frontend → services (AI, WhatsApp, privileged ops) | Payment gateway (future) |
| **Versioned REST API `/api/v1`** (API Keys, scopes, Rate limits, idempotency, pagination, envelopes, OpenAPI) | |
| **Public API `/public/v1`** (read-only, e.g., catalog by slug) | |
| Outbound webhooks (events, retries, signatures) | |
| Public catalog (read by slug, no login) | |
| RLS as data authorization mechanism | |

## Participants

| Participant | Role | Notes | Classification |
| --- | --- | --- | --- |
| React frontend | consumer | Authenticated client (company member) | Confirmed (SDD) |
| Supabase Client (Database/Auth/Storage) | producer | Default frontend surface | Confirmed (SDD) |
| Edge Functions (services + API layer) | producer | AI, WhatsApp, `/api/v1`, `/public/v1`, webhooks | Confirmed (SDD) |
| API consumer (integrator) | consumer | API Key bearer (`mf_live_`/`mf_test_`) + scopes | Confirmed (SDD) — ADR-008 |
| Visitor (catalog) | consumer | Public read without login | Confirmed (SDD) |

## Contract type

- [x] API
- [ ] Event / Message / File / Command / Callback / Library / Data / Integration / Other

## Protocol

| Field | Value | Classification |
| --- | --- | --- |
| Protocol | HTTPS (assumed via Supabase/Lovable Cloud) | Inferred |
| Interaction style | request-response (and RPC; webhooks are outbound events) | Confirmed (SDD) |

## Endpoints / channels / interfaces

### 1. Authenticated data access (frontend → Supabase)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Supabase Database/Storage/Auth SDKs | Confirmed (SDD) |
| Method / operation | Query/read/write per permissions; RLS applied | Confirmed (SDD) |
| Notes | Frontend **never** authorizes; RLS and policies define access | Confirmed (SDD) |

### 2. Versioned REST API (API First — ADR-008)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | `/api/v1` (+ `/public/v1` for public read-only surface) | Confirmed (SDD) |
| Method / operation | REST over categories/products/brands/manufacturers/suppliers/inventory/lots/catalog/requests, `GET /api/v1/ai/jobs/{id}`, `POST /api/v1/ai/analyze-image` | Confirmed (SDD) |
| Auth | API Key bearer: `Authorization: Bearer mf_live_...` / `mf_test_...`; stored as hash | Confirmed (SDD) |
| Scopes | `products:read/write`, `categories:read/write`, `brands:read/write`, `manufacturers:read/write`, `suppliers:read/write`, `inventory:read/write`, `lots:read/write`, `catalog:read/write`, `requests:read/write`, `ai:use`, `reports:read` | Confirmed (SDD) |
| Response envelope | success `{ data, meta }`; error `{ error: { code, message, details } }` | Confirmed (SDD) |
| Pagination | page, page_size, sort, order, search, filters (max 100 per page) | Confirmed (SDD) |
| Idempotency | `Idempotency-Key` for mutations | Confirmed (SDD) |
| Docs | `/api/docs` (UI) and `/api/openapi.json` (OpenAPI) | Confirmed (SDD) |
| Notes | token + company + scopes + ownership validated on every request; rate-limited and audited | Confirmed (SDD) |

### 3. Webhooks (outbound events)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Registered `webhook_endpoints` (URL + secret per endpoint) | Confirmed (SDD) |
| Method / operation | Signed POST; retries with backoff; idempotent events | Confirmed (SDD) |
| Notes | Delivery history in `webhook_deliveries` | Confirmed (SDD) |

### 4. Edge Functions (services — AI, WhatsApp)

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Supabase Edge Function (via API gateway/Functions) | Confirmed (SDD) |
| Method / operation | AI Service (`analyzeImage`, `analyzeProduct`, `extractText`, `classifyProduct`); WhatsApp Service (send with template) | Confirmed (SDD) |
| Notes | Provider abstraction (ADR-009/ADR-010); AI quota + rate limit; human review for low confidence | Confirmed (SDD) |

### 5. Public catalog

| Field | Value | Classification |
| --- | --- | --- |
| Locator | Public URL by company slug (`/` + slug) | Confirmed (SDD) |
| Method / operation | GET (read-only) | Confirmed (SDD) |
| Notes | No login; only published content; abuse-protected; WhatsApp CTA | Confirmed (SDD) |

## Authentication

| Mechanism | Notes | Classification |
| --- | --- | --- |
| Supabase Auth — email + password | MVP | Confirmed (SDD) |
| Supabase Auth — Google OAuth | MVP | Confirmed (SDD) |
| API Keys (`mf_live_`/`mf_test_`, hash-stored, per-company, with scopes) | Machine access (`/api/v1`) | Confirmed (SDD) — ADR-008 |
| (Future) Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Out of the MVP | Confirmed (SDD) |

No secret values — references only. Details: [security/authentication.md](../security/authentication.md).

## Authorization

| Rule | Notes | Classification |
| --- | --- | --- |
| Server-side RBAC; role in `CompanyUser.role` | `GLOBAL_ADMIN`, `ADMIN`, `STOCK`, `VISITOR` | Confirmed (SDD) |
| Authorization considers User + Company + Role + Resource + Action | Authorization context model | Confirmed (SDD) |
| API access considers token + company + **scopes** + resource ownership | API Key authz dimension | Confirmed (SDD) — ADR-008 |
| RLS in Postgres applied to data access | Never trust `company_id`/`user_id`/permissions sent by the client | Confirmed (SDD) |
| Public catalog: only published content; no internal data leak | Field filtering; rate limiting | Confirmed (SDD) |

Details: [security/authorization.md](../security/authorization.md).

## Validation

| Rule | Where applied | Notes | Classification |
| --- | --- | --- | --- |
| Input validation (Zod/frontend) | consumer | Immediate UX | Confirmed (SDD) |
| Server-side validation (services/RLS) | producer | **Backend always validates** | Confirmed (SDD) |
| Prices non-negative; SKU/barcode unique per company | producer | Domain rules | Confirmed (SDD) |
| AI output validated and structured | producer | Confidence + human review; prompt injection mitigated | Confirmed (SDD) |
| WhatsApp template variables validated | producer | Unknown placeholders blocked; preview | Confirmed (SDD) |
| API Key scope check per request | producer | Least privilege | Confirmed (SDD) |

## Errors

| Error / condition | Retryable | Consumer action | Classification |
| --- | --- | --- | --- |
| Authentication failure | no | Redirect to login / present token error | Confirmed (SDD) |
| Access denied (authorization / scope) | no | Show unauthorized/forbidden state | Confirmed (SDD) |
| Rate limit exceeded | yes | Back off; read `Retry-After` | Confirmed (SDD) |
| Plan limit/quota reached | Unknown | Inform limit; backend enforces | Confirmed (SDD) |
| AI provider failure | yes | Re-present to user; audit | Confirmed (SDD) |
| Idempotent replay | no | Return original result | Confirmed (SDD) |
| Validation violation (insufficient stock etc.) | no | Clear message + final validation on backend | Confirmed (SDD) |

Detailed error catalog: defined per endpoint in OpenAPI (`sdd/12-EXTRAS.md`); per-endpoint codes pending implementation.

## Rate limits

| Limit | Value | Classification |
| --- | --- | --- |
| Public catalog (anti-abuse) | To be defined (required) | Proposed |
| AI | Quota + rate limit per company | Confirmed (SDD) |
| Versioned API | Per category with quota/limits (per key/company) | Confirmed (SDD) |
| Public endpoints | Abuse-protected | Confirmed (SDD) |

## Size limits

| Limit | Value | Classification |
| --- | --- | --- |
| Image uploads | Validated (type, size, content) | Confirmed (SDD) |
| Pagination | max 100 per page | Confirmed (SDD) |

## Security considerations

| Topic | Summary | Classification |
| --- | --- | --- |
| Data sensitivity | `cost_price`, margin, suppliers and audit data are internal — never in the public catalog | Confirmed (SDD) |
| Token security | API Keys hashed at rest; full secret shown once; revocation/rotation | Confirmed (SDD) |
| Encryption in transit | HTTPS (maintained by managed infrastructure) | Inferred |
| PII / secrets handling | LGPD to be documented; secrets never in code/frontend | Confirmed (SDD) |

## Observability

| Signal | What to observe | Classification |
| --- | --- | --- |
| Logs | Critical operations audited; security events; `api_request_logs` | Confirmed (SDD) |
| Metrics | Rate limiting, AI quota, errors, delivery failures | Proposed |
| Traces | Not applicable in the simple MVP | Not Applicable |

## Examples

### Example — success (authenticated data flow)

```text
Frontend → Supabase Client → PostgreSQL + RLS   (list products of the current company)
Frontend → Edge Function  → server auth + business → PostgreSQL  (privileged operation)
```

### Example — API Key (machine integration)

```text
Integrator → POST /api/v1/products
  Authorization: Bearer mf_live_<secret>
  Validated: token hash + company + scope products:write + Idempotency-Key
  → 200 {"data": {...}, "meta": {...}}   (rate-limited, logged in api_request_logs)
```

### Example — AI (assisted registration)

```text
Image/input → AI Service → AI provider → result + confidence → human review → save
```

### Example — Webhook delivery

```text
MarketFlow event → webhook_endpoints(URL, secret) → signed POST → webhook_deliveries(status, retries)
```

## Failure scenarios

| Scenario | Impact | Expected behavior | Mitigation | Classification |
| --- | --- | --- | --- | --- |
| AI provider unavailable | AI functions down | Does not block catalog/inventory | Failure isolation | Confirmed (SDD) |
| WhatsApp provider unavailable | Messaging down | Does not block catalog/inventory | Failure isolation + retry | Confirmed (SDD) |
| Public catalog abuse | Cost/exposure | Rate limiting | Anti-abuse protection | Confirmed (SDD) |
| Token leak | Data exposure | Revocation + scope containment | Hash storage; least privilege | Confirmed (SDD) |
| Cross-tenant attempt | Leak | Denied by RLS/authorization | Cross-tenant + IDOR/BOLA tests | Confirmed (SDD) |

## Related components

| Component | Relationship | Path / ID |
| --- | --- | --- |
| React frontend | consumer | [architecture/overview.md](../architecture/overview.md) |
| Supabase (Database/Auth/Storage/Edge Functions) | producer | [architecture/overview.md](../architecture/overview.md) |
| API layer + webhooks | producer | [architecture/overview.md](../architecture/overview.md) |
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
| ADR-008 (API First) | Versioned REST + API Keys + scopes | [decisions/adr-008-api-first-and-api-keys.md](../decisions/adr-008-api-first-and-api-keys.md) |
| ADR-009 (AI Service) | AI endpoints and scopes | [decisions/adr-009-ai-service-abstraction.md](../decisions/adr-009-ai-service-abstraction.md) |
| ADR-010 (WhatsApp) | Request/message flows | [decisions/adr-010-whatsapp-service.md](../decisions/adr-010-whatsapp-service.md) |