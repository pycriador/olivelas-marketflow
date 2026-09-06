---
title: "MarketFlow — Architecture Overview"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Architecture Overview

> Language: EN | [Português (pt-BR)](../../pt-BR/architecture/overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md), [`sdd/02-DATABASE.md`](../../../sdd/02-DATABASE.md), [`sdd/10-FULL-SYSTEM.md`](../../../sdd/10-FULL-SYSTEM.md), [`sdd/11-EXTRAS.md`](../../../sdd/11-EXTRAS.md) and [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md).

## Purpose

Describe the MarketFlow architecture: context, boundaries, main components, dependencies and failure/trust limits. Current implementation state: **frontend prototype** (`src/`, React/TS/Vite) plus **partial backend** (`supabase/migrations/` with 19 tables and RLS enabled). The full SDD target remains proposed.

## Context

Users (small business owners, staff, visitors, developers) access the product through a browser (mobile-first). The frontend talks to the managed Supabase backend (Auth, PostgreSQL, Storage, Edge Functions). A public storefront (catalog) is served by company slug, without login. Integrations and AI/WhatsApp flows come from a service layer (AI Service, WhatsApp Service, API layer).

## System

| Field | Value |
| --- | --- |
| Name | MarketFlow |
| Purpose | SaaS to organize products, prices, inventory and catalog with AI, API-first surface and WhatsApp messaging |
| Owner | marketflow-team |
| Boundary summary | Frontend (Lovable Cloud) + Supabase (Auth/Postgres/Storage/Edge Functions); no independent backend in the MVP |

## Objectives

| Objective | Notes |
| --- | --- |
| Multi-tenant and multi-user from v1 | `company_id` + RLS; role per user+company binding |
| Security by default | Zero Trust; server-side authorization; never trust the client |
| Mobile-first and responsive | UX simple; pt-BR primary, ready for EN/ES |
| Themes and language as UX layer | 20 themes (10 light/10 dark); pt-BR/EN/ES — never affects data/authorization |
| Simplicity and scope | Not an ERP; incremental evolution (P0–P3) |
| AI as an auxiliary service | AI is not the authoritative source; human review mandatory; provider abstraction |
| API first | Versioned REST (`/api/v1`), API Keys with scopes, OpenAPI, webhooks |
| Monetization preparation | Free First; configurable limits on the backend |

## Non-goals

| Non-goal | Justification |
| --- | --- |
| Independent backend API in the MVP | Managed backend + service layer is enough |
| Microservices | Unnecessary complexity for the MVP |
| P3 features (POS, finance) | Future explicit decision |

## System boundary

| Inside the system | Outside the system |
| --- | --- |
| React frontend (UI, navigation, form validation, themes, i18n) | AI providers (external, via AI Service) |
| Supabase Auth (identity) | Google (OAuth) |
| PostgreSQL + RLS (source of truth) | Lovable Cloud (frontend hosting) |
| Supabase Storage (files) | WhatsApp Provider (external, via WhatsApp Service) |
| Edge Functions (AI, WhatsApp, API, webhooks, privileged ops) | Payments/gateway (future) |
| Public catalog (storefront by slug) | Email/push (future) |
| API layer (`/api/v1`, `/public/v1`) | — |

## Architecture overview

```mermaid
flowchart LR
  user[User / Visitor] --> web[React Frontend<br>(Lovable Cloud)]
  web --> auth[Supabase Auth]
  web --> postgres[(PostgreSQL + RLS)]
  web --> storage[Supabase Storage]
  web --> edge[Edge Functions<br>AI / WhatsApp / API / webhooks]
  edge --> postgres
  edge --> aisvc[AI Service]
  aisvc --> ai[AI providers]
  edge --> wasvc[WhatsApp Service]
  wasvc --> wpp[WhatsApp Provider]
  dev[Developer / integrator] --> api[API v1 / public v1<br>API Keys + scopes]
  api --> edge
  public[Visitor] --> catalog[Public catalog by slug]
  catalog --> postgres
```

## Main components

| Component | Responsibility | Documentation |
| --- | --- | --- |
| Frontend (React/TS/Vite/Tailwind/shadcn/ui) | UI, state, client validation, navigation, themes, i18n | — |
| Supabase Auth | Identity, sessions, providers (email+password, Google) | [../security/authentication.md](../security/authentication.md) |
| PostgreSQL + RLS | Source of truth; isolation via `company_id` | [data-model.md](data-model.md) |
| Supabase Storage | Product images and logos (isolated per company) | — |
| AI Service (Edge Functions) | Provider abstraction: analyze image/product, OCR, classify; confidence; jobs/usage logs | [../contracts/api.md](../contracts/api.md) |
| WhatsApp Service (Edge Functions) | Provider abstraction: templates, variables, history, retry | [../contracts/api.md](../contracts/api.md) |
| API layer (Edge Functions) | `/api/v1` + `/public/v1`, API Keys + scopes, webhooks, OpenAPI | [../contracts/api.md](../contracts/api.md) |
| Public catalog | Public storefront by slug; abuse protection | [../contracts/api.md](../contracts/api.md) |

## Component relationships

| From | To | Relationship | Contract |
| --- | --- | --- | --- |
| Frontend | Supabase (Database/Auth/Storage) | calls (sync) | [../contracts/api.md](../contracts/api.md) |
| Frontend | Edge Functions | calls (sync/async) | [../contracts/api.md](../contracts/api.md) |
| API key consumer | API layer | API Keys bearer + scopes | [../contracts/api.md](../contracts/api.md) |
| Edge Functions | PostgreSQL | depends on | internal |
| Edge Functions | AI providers | calls (outbound) | AI Service abstraction (ADR-009) |
| Edge Functions | WhatsApp Provider | calls (outbound) | WhatsApp Service abstraction (ADR-010) |
| Public catalog | PostgreSQL | depends on | RLS / public read-only |

## Data flow

1. User authenticates (email+password or Google OAuth) via Supabase Auth.
2. Frontend reads/writes data via the Supabase Client with RLS applied by `company_id`.
3. Integration consumers authenticate with API Keys (`mf_live_`/`mf_test_`) and scopes against `/api/v1`; every request is rate-limited, logged and validated against token + company + scope.
4. AI registration: image/input → AI Service → result + confidence → human review → save.
5. Catalog request triggers a WhatsApp message via the WhatsApp Service (template + variables) with status/retry tracking.
6. Webhooks deliver events to configured URLs (signed, retried, idempotent).
7. Visitor accesses the public catalog storefront by slug; only published content is shown.

## Dependencies

| Dependency | Purpose | Failure impact | Classification |
| --- | --- | --- | --- |
| Supabase Auth | Identity and sessions | Login unavailable | Confirmed (SDD) |
| PostgreSQL | Source of truth | Product unavailable | Confirmed (SDD) |
| Supabase Storage | Images/logo | Uploads and image display fail | Confirmed (SDD) |
| Edge Functions | AI, WhatsApp, API, webhooks | Service features unavailable | Confirmed (SDD) |
| Lovable Cloud | Frontend hosting | Frontend unavailable | Confirmed (SDD) |
| AI providers | OCR/recognition | AI features unavailable (auxiliary) | Confirmed (SDD); real pending |
| WhatsApp Provider | Messaging | WhatsApp features unavailable | Confirmed (SDD); real pending |

## Security boundaries

| Boundary | What is protected | Controls summary |
| --- | --- | --- |
| Public edge (catalog) | Published content; no internal data leak | Rate limiting; read-only; field filtering |
| API edge (`/api/v1`) | Data via tokens | API Key hash storage; scopes; rate limiting; audit |
| Authentication | User identity | Supabase Auth; secure providers; sessions |
| Authorization | Operations by user+company+role (+ API scopes) | Server-side RBAC; `CompanyUser.role` |
| PostgreSQL/RLS | Data isolation between companies | RLS by `company_id`; role policies |
| Storage | Files per company | Policies by `company_id` |
| Edge Functions | Privileged operations | Server-side authorization; AI quota; auditing |

Details: [../security/security.md](../security/security.md).

## Failure domains

| Domain | Includes | Failure effect |
| --- | --- | --- |
| Identity | Supabase Auth | Login/registration unavailable; sessions fail |
| Data | PostgreSQL | Product/inventory unavailable |
| Files | Supabase Storage | Uploads/image display fail |
| AI functions | Edge Functions + provider | AI features unavailable (do not block catalog/inventory) |
| Mailbox | WhatsApp Provider | Messaging unavailable (do not block catalog/inventory) |
| Frontend | Lovable Cloud | UI unavailable |

## Trade-offs

| Decision / approach | Benefit | Cost |
| --- | --- | --- |
| Managed backend (Supabase + Lovable Cloud) | Less infrastructure to operate; native RLS | Vendor lock-in; less operational control |
| Shared PostgreSQL with logical isolation | Simple and cheap for the MVP | Requires RLS discipline; non-trivial future migration |
| No independent backend in the MVP | Less complexity and attack surface | Limits custom operations to Edge Functions |
| AI/WhatsApp service abstraction | Provider portability; mock dev | Additional layer to maintain |
| Public catalog as slug storefront | Zero login for visitors; simple | Needs rate limiting and abuse protection |

## Architectural constraints

| ID | Description | Source | Impact | Current Status |
| --- | --- | --- | --- | --- |
| CON-001 | Multi-tenant isolation mandatory from v1 (`company_id` + RLS) | `sdd/01-FOUNDATION.md`, `sdd/02-DATABASE.md` | Defines the data model | Active (RLS enabled; policies partial) |
| CON-002 | Server-side authorization; never authorize only in the frontend | `sdd/08-SECURITY.md` | Removes role/policy from the UI exclusively | Active |
| CON-003 | No independent backend API in the MVP | `sdd/01-FOUNDATION.md` | Frontend + Supabase + Edge Functions | Active |
| CON-004 | AI is not the authoritative source; human review mandatory | `sdd/25-AI` (via `10-FULL-SYSTEM.md`) | AI pipeline with confidence and confirmation | Active |
| CON-005 | API Keys ensure token+company+scope validation; never bypass security layers | `sdd/12-EXTRAS.md` | Authorizes machine access | Active |

## Known limitations

| Limitation | Impact | Classification |
| --- | --- | --- |
| Frontend prototype (mock/localStorage, state-machine routing) | Not a production backend | Confirmed (prototype) |
| Migrations: RLS enabled on 19 tables but policies defined for few; no triggers/functions; `catalog_requests` referenced but not created; SDD tables pending (`plan_limits`, catalog, notifications) | Backend incomplete | Confirmed (prototype) |
| Managed vendor dependency | Migrating from Supabase/Lovable Cloud is costly | Inferred |

## Related decisions

| ADR | Title | Status |
| --- | --- | --- |
| ADR-001 | Cloud stack: Supabase + Lovable Cloud | Accepted |
| ADR-002 | Frontend: React + TypeScript + Vite + shadcn/ui | Accepted |
| ADR-003 | Multi-tenant isolation via `company_id` + RLS | Accepted |
| ADR-005 | Authentication providers | Accepted |
| ADR-006 | Free First monetization | Accepted |
| ADR-007 | Design system: shadcn/ui, Content First | Accepted |
| ADR-008 | API First: versioned REST + API Keys | Accepted |
| ADR-009 | AI Service provider abstraction | Accepted |
| ADR-010 | WhatsApp Service and templates | Accepted |
| ADR-011 | 20 themes and i18n (pt-BR/EN/ES) | Accepted |

## Related documentation

| Document | Path |
| --- | --- |
| Project overview | [../project-overview.md](../project-overview.md) |
| Data model | [data-model.md](data-model.md) |
| Contracts | [../contracts/api.md](../contracts/api.md) |
| Security | [../security/security.md](../security/security.md) |
| Roadmap | [../roadmap.md](../roadmap.md) |
| Decisions | [../decisions/README.md](../decisions/README.md) |