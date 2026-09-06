---
title: "MarketFlow — Project Overview"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Project Overview

> Language: EN | [Português (pt-BR)](../pt-BR/project-overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/00-VISION.md`](../../sdd/00-VISION.md), [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md), [`sdd/11-EXTRAS.md`](../../sdd/11-EXTRAS.md) and [`sdd/12-EXTRAS.md`](../../sdd/12-EXTRAS.md).

## Purpose

MarketFlow is a SaaS platform that helps small businesses organize products, prices, inventory and catalog, with AI features to reduce manual work, an API-first surface for integrations and WhatsApp messaging with per-company templates. Target version: MVP (1.0.0).

## Problem

Small retailers (corner markets, grocery stores, mini-markets, produce stands, liquor stores and convenience stores) manage products, prices and inventory manually, without a simple tool. Complex ERP systems are expensive and unnecessary for this audience.

## Scope

| In scope | Notes |
| --- | --- |
| Product management (CRUD, images, categories, brands, manufacturers, suppliers) | A product belongs to one company |
| Inventory and lots/expiry | Movements with immutable history |
| Multi-company (multi-tenant) and multi-user from v1 | Isolation via `company_id` + RLS |
| Authentication and RBAC | Supabase Auth; roles per user+company binding |
| IAM/Developer area (API Keys, webhooks, docs, logs) | Scoped tokens (`mf_live_`/`mf_test_`) |
| Public catalog per company | Public storefront without login; company slug |
| AI for product registration (photo → data + confidence → human review) | OCR, name/category/brand suggestions; provider abstraction |
| WhatsApp messaging with company templates | Variables, preview, history and retry |
| 20 visual themes (10 light / 10 dark) and 3 languages (pt-BR/EN/ES) | UX-layer; persisted per user |
| Landing page, dashboard and onboarding | Mobile-first UX, pt-BR as primary language |
| Simple reports (products, inventory, expiry, movements) | Without turning the MVP into an ERP |
| Future monetization (Free First) prepared in the architecture | Configurable limits on the backend |

## Non-goals

| Non-goal | Justification |
| --- | --- |
| POS (point of sale) | Out of MVP scope; separate future item |
| Finance, accounting, tax | Do not become an ERP in the MVP |
| Complete CRM and e-commerce | Future, with explicit decision |
| Direct third-party database access | Access only via the product or the versioned API |
| Online payments (gateway) in the MVP | Billing stays for a later phase; only abstraction |
| Legacy system migration | Not planned |

## Users / consumers

| User / consumer | Need |
| --- | --- |
| Small business owner | Register products, control inventory, price, publish catalog, manage WhatsApp templates |
| Staff (stock) | Record entries/exits, adjustments and expiry |
| Public catalog visitor | View published products and request contact (WhatsApp CTA) |
| Developer / integrator | API Keys, scopes, OpenAPI docs, webhooks |
| Platform Global Admin | Manage the platform (global scope) |

## Architecture

- Overview: multi-tenant SaaS · React frontend + managed backend (Supabase: Auth, PostgreSQL, Storage, Edge Functions) hosted on Lovable Cloud. No independent backend in the MVP; API-first surface (`/api/v1`) defined for the backend layer ([ADR-008](decisions/adr-008-api-first-and-api-keys.md)).
- Details: [architecture/overview.md](architecture/overview.md)
- Data model: [architecture/data-model.md](architecture/data-model.md)

## Components

| Component | Responsibility | Documentation |
| --- | --- | --- |
| Frontend (React/TS/Vite/shadcn/ui) | UI, state, client-side validation, navigation, themes & i18n | [architecture/overview.md](architecture/overview.md) |
| Supabase Auth | Authentication (email+password, Google OAuth), sessions | [security/authentication.md](security/authentication.md) |
| PostgreSQL | Source of truth; isolation via RLS | [architecture/data-model.md](architecture/data-model.md) |
| Supabase Storage | Product images and logos, isolated per company | [security/security.md](security/security.md) |
| Edge Functions | AI Service, WhatsApp messaging, API layer, webhooks, privileged ops | [contracts/api.md](contracts/api.md) |
| Public catalog | Public storefront by company slug; WhatsApp CTA | [contracts/api.md](contracts/api.md), `sdd/10-FULL-SYSTEM.md` § 22-PUBLIC_STORE |
| API layer (`/api/v1`, `/public/v1`) | Versioned REST + API Keys + scopes + OpenAPI | [contracts/api.md](contracts/api.md) |

## Dependencies

| Dependency | Type | Purpose | Classification |
| --- | --- | --- | --- |
| React + TypeScript | runtime | Product UI | Confirmed (SDD); implemented (prototype) |
| Vite | build | Bundling and dev server | Confirmed (SDD); implemented |
| Tailwind CSS + shadcn/ui + Radix UI | runtime | Design system and accessible components | Confirmed (SDD); implemented |
| React Hook Form + Zod | runtime | Forms and validation | Confirmed (SDD); implemented |
| TanStack Query + Router | runtime | Server data and navigation | Confirmed (SDD) |
| Supabase (Auth/PostgreSQL/Storage/Edge Functions) | external | Managed backend | Confirmed (SDD) |
| Lovable Cloud | external | Frontend hosting | Confirmed (SDD) |
| AI providers (OpenAI/Gemini/Anthropic) | external | Recognition/OCR via AI Service abstraction; mock adapter in prototype | Confirmed (SDD); real providers pending |
| WhatsApp Provider | external | Message delivery via WhatsApp Service abstraction | Confirmed (SDD); provider pending |

## Integrations

| Integration | Direction | Contract | Documentation |
| --- | --- | --- | --- |
| Supabase Auth | bidirectional | [contracts/api.md](contracts/api.md) | [security/authentication.md](security/authentication.md) |
| Edge Functions (AI, WhatsApp, API) | outbound | [contracts/api.md](contracts/api.md) | [architecture/overview.md](architecture/overview.md) |
| Public catalog | outbound | Public `GET` by slug | [contracts/api.md](contracts/api.md) |
| AI providers | external | AI Service abstraction (mock in prototype) | ADR-009 |
| WhatsApp Provider | external | WhatsApp Service abstraction (templates in prototype) | ADR-010 |
| Webhooks (outbound) | external | Signed, retried, idempotent | [contracts/api.md](contracts/api.md) |
| Google OAuth | external | OAuth 2.0 | [security/authentication.md](security/authentication.md) |

## Security

- Trust boundaries: `Anonymous → Authenticated → Company Member → Role/Permission → Backend/RLS → Database`. No layer assumes the previous one is sufficient.
- Authn / Authz: Supabase Auth; server-side RBAC with role in `CompanyUser.role`; RLS in PostgreSQL; API Keys add a second authorization axis (token + company + scopes).
- Final rule: **never trust the client**. Details: [security/security.md](security/security.md).

## Observability

| Signal type | Status |
| --- | --- |
| Logging | Not Documented (planned for P1; API/schema tables exist for request/usage logs) |
| Metrics | Not Documented (planned for P1) |
| Tracing | Not Applicable for the simple MVP |

Details: not documented — see [roadmap.md](roadmap.md) (P1).

## Operations

| Scenario | Runbook |
| --- | --- |
| Backup / recovery | Not documented yet (P1) |
| Security incident | Not documented yet (`sdd/08-SECURITY` defines the future process) |

## Environments

| Environment | Purpose | Notes |
| --- | --- | --- |
| production | Real usage | Lovable Cloud + Supabase hosting (to be defined) |
| staging | Pre-release validation | to be defined |
| local | Development/tests | Vite dev server; mock data |

## Known limitations

| Limitation | Impact | Classification |
| --- | --- | --- |
| `src/` is a frontend prototype (mock/localStorage, internal state routing) | Not a production backend | Confirmed (prototype) |
| API layer is specified, not implemented as a service | `/api/v1` described as contract; frontend simulates it | Confirmed (SDD) |
| Migrations have RLS enabled but only partial policies; lacks triggers/functions and SDD tables (`plan_limits`, `catalog_*`, notifications) | Backend not yet complete | Confirmed (prototype) |
| Payments not implemented in the MVP | Monetization only through plan limits | Confirmed (SDD) |
| No advanced reports/export in the MVP | Simple reports only | Confirmed (SDD) |
| In-app notifications only in the MVP | Email/push are future; WhatsApp templates in scope | Confirmed (SDD) |

## Related documentation

| Document | Path |
| --- | --- |
| Architecture | [architecture/overview.md](architecture/overview.md) |
| Data model | [architecture/data-model.md](architecture/data-model.md) |
| Security | [security/security.md](security/security.md) |
| Contracts | [contracts/api.md](contracts/api.md) |
| Roadmap | [roadmap.md](roadmap.md) |
| Decisions | [decisions/README.md](decisions/README.md) |
| MVP/security checklist | `sdd/08-SECURITY.md`, `sdd/06-ROADMAP.md`, `sdd/11-EXTRAS.md`, `sdd/12-EXTRAS.md` |