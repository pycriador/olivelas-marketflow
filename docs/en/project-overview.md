---
title: "MarketFlow — Project Overview"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Project Overview

> Language: EN | [Português (pt-BR)](../pt-BR/project-overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Source: [`sdd/00-VISION.md`](../../sdd/00-VISION.md) and [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md).

## Purpose

MarketFlow is a SaaS platform that helps small businesses organize products, prices, inventory and catalog, with AI features to reduce manual work. Target version: MVP (1.0.0).

## Problem

Small retailers (corner markets, grocery stores, mini-markets, produce stands, liquor stores and convenience stores) manage products, prices and inventory manually, without a simple tool. Complex ERP systems are expensive and unnecessary for this audience.

## Scope

| In scope | Notes |
| --- | --- |
| Product management (CRUD, images, categories, brands, manufacturers, suppliers) | A product belongs to one company |
| Inventory and lots/expiry | Movements with immutable history |
| Multi-company (multi-tenant) and multi-user from v1 | Isolation via `company_id` + RLS |
| Authentication and RBAC | Supabase Auth; roles per user+company binding |
| Public catalog per company | Public storefront without login; company slug |
| AI for product registration (photo → data + confidence → human review) | OCR, name/category/brand suggestions |
| Landing page, dashboard and onboarding | Mobile-first UX, pt-BR as primary language |
| Simple reports (products, inventory, expiry, movements) | Without turning the MVP into an ERP |
| Future monetization (Free First) prepared in the architecture | Configurable limits on the backend |

## Non-goals

| Non-goal | Justification |
| --- | --- |
| POS (point of sale) | Out of MVP scope; separate future item |
| Finance, accounting, tax | Do not become an ERP in the MVP |
| Complete CRM and e-commerce | Future, with explicit decision |
| Public API for third parties | Future (`P3`) |
| Online payments (gateway) in the MVP | Billing stays for a later phase; only abstraction |
| Legacy system migration | Not planned |

## Users / consumers

| User / consumer | Need |
| --- | --- |
| Small business owner | Register products, control inventory, price, publish catalog |
| Staff (stock) | Record entries/exits, adjustments and expiry |
| Public catalog visitor | View published products and request contact |
| Platform Global Admin | Manage the platform (global scope) |

## Architecture

- Overview: multi-tenant SaaS · React frontend + managed backend (Supabase: Auth, PostgreSQL, Storage, Edge Functions) hosted on Lovable Cloud. No independent backend in the MVP.
- Details: [architecture/overview.md](architecture/overview.md)
- Data model: [architecture/data-model.md](architecture/data-model.md)

## Components

| Component | Responsibility | Documentation |
| --- | --- | --- |
| Frontend (React/TS/Vite/shadcn/ui) | UI, state, client-side validation, navigation | [architecture/overview.md](architecture/overview.md) |
| Supabase Auth | Authentication (email+password, Google OAuth), sessions | [security/authentication.md](security/authentication.md) |
| PostgreSQL | Source of truth; isolation via RLS | [architecture/data-model.md](architecture/data-model.md) |
| Supabase Storage | Product images and logos, isolated per company | [security/security.md](security/security.md) |
| Edge Functions | AI, external integrations, privileged operations, async | [contracts/api.md](contracts/api.md) |
| Public catalog | Public storefront by company slug | [contracts/api.md](contracts/api.md), `sdd/10-FULL-SYSTEM.md` § 22-PUBLIC_STORE |

## Dependencies

| Dependency | Type | Purpose | Classification |
| --- | --- | --- | --- |
| React + TypeScript | runtime | Product UI | Confirmed (SDD) |
| Vite | build | Bundling and dev server | Confirmed (SDD) |
| Tailwind CSS + shadcn/ui + Radix UI | runtime | Design system and accessible components | Confirmed (SDD) |
| React Hook Form + Zod | runtime | Forms and validation | Confirmed (SDD) |
| TanStack Query + Router | runtime | Server data and navigation | Confirmed (SDD) |
| Supabase (Auth/PostgreSQL/Storage/Edge Functions) | external | Managed backend | Confirmed (SDD) |
| Lovable Cloud | external | Frontend hosting | Confirmed (SDD) |
| AI provider (to be defined) | external | Product recognition/OCR | Inferred (to decide) |

## Integrations

| Integration | Direction | Contract | Documentation |
| --- | --- | --- | --- |
| Supabase Auth | bidirectional | [contracts/api.md](contracts/api.md) | [security/authentication.md](security/authentication.md) |
| Edge Functions (AI) | outbound | Under decision | [contracts/api.md](contracts/api.md) |
| Public catalog | outbound | Public `GET` by slug | [contracts/api.md](contracts/api.md) |
| Google OAuth | external | OAuth 2.0 | [security/authentication.md](security/authentication.md) |
| Email / WhatsApp / Push | future | — | Not implemented in the MVP |

## Security

- Trust boundaries: `Anonymous → Authenticated → Company Member → Role/Permission → Backend/RLS → Database`. No layer assumes the previous one is sufficient.
- Authn / Authz: Supabase Auth; server-side RBAC with role in `CompanyUser.role`; RLS in PostgreSQL.
- Final rule: **never trust the client**. Details: [security/security.md](security/security.md).

## Observability

| Signal type | Status |
| --- | --- |
| Logging | Not Documented (planned for P1) |
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
| local | Development/tests | to be defined |

## Known limitations

| Limitation | Impact | Classification |
| --- | --- | --- |
| No public API for third parties in the MVP | Limited external integrations | Confirmed (SDD) |
| Payments not implemented in the MVP | Monetization only through plan limits | Confirmed (SDD) |
| No advanced reports/export in the MVP | Simple reports only | Confirmed (SDD) |
| In-app notifications only in the MVP | Email/WhatsApp/push are future | Confirmed (SDD) |

## Related documentation

| Document | Path |
| --- | --- |
| Architecture | [architecture/overview.md](architecture/overview.md) |
| Data model | [architecture/data-model.md](architecture/data-model.md) |
| Security | [security/security.md](security/security.md) |
| Contracts | [contracts/api.md](contracts/api.md) |
| Roadmap | [roadmap.md](roadmap.md) |
| Decisions | [decisions/README.md](decisions/README.md) |
| MVP/security checklist | `sdd/08-SECURITY.md`, `sdd/06-ROADMAP.md` |