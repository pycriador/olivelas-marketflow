---
title: "AI Context"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# AI Context

> Language: EN | [Português (pt-BR)](../pt-BR/ai-context.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

**Primary AI entry point** of the MarketFlow documentation. Agents and humans preparing AI prompts should start here and follow the links — do not load the whole documentation blindly.

This page is intentionally short. Details live in the linked documents.

## Source of truth

- The [`sdd/`](../../sdd/) files (`00-VISION.md` … `10-FULL-SYSTEM.md`, plus [`11-EXTRAS.md`](../../sdd/11-EXTRAS.md) and [`12-EXTRAS.md`](../../sdd/12-EXTRAS.md)) are the product's source specification.
- `docs/` adopts the Documentation Standard v1.0 and structures that content in a navigable way.
- In case of divergence, `sdd/` prevails until the documentation is reviewed.

## Getting started

1. Read this file.
2. Load only the depth required by the question (levels below).
3. Before changing architecture, security, contracts or data, read the relevant documentation.

## Level hierarchy

| Level | Focus | Load when |
| --- | --- | --- |
| **0** | This file + [README.md](README.md) | Always for AI work on the project |
| **1** | [project-overview.md](project-overview.md) + [roadmap.md](roadmap.md) | What the product is and what is planned |
| **2** | [architecture/overview.md](architecture/overview.md) + [data-model.md](architecture/data-model.md) | Structure, components, data |
| **3** | [contracts/api.md](contracts/api.md) | Interfaces, contracts, versioned API, webhooks |
| **5** | [security/security.md](security/security.md) (+ [authentication](security/authentication.md), [authorization](security/authorization.md)) | Security |
| **—** | [decisions/README.md](decisions/README.md) (ADRs) | Why decisions were made |

Do not skip ahead to details without the context of levels 0–1.

## Quality priorities (code and data)

Source: `sdd/01-FOUNDATION.md`, `sdd/08-SECURITY.md`, `sdd/09-DESIGN_SYSTEM.md`, `sdd/11-EXTRAS.md`, `sdd/12-EXTRAS.md`.

1. Multi-tenant and data isolation from v1 (never remove RLS as a workaround).
2. Security by default — server-side authorization; never trust the client.
3. Simplicity and scope: do not implement future features without an explicit decision.
4. UX with complete states (loading, empty, error, success) and basic accessibility.
5. Performance: avoid duplicated libraries, unnecessary animations and renders.

## Central rules for AI

- **AuthN/AuthZ:** [security/authentication.md](security/authentication.md), [security/authorization.md](security/authorization.md).
- **Data:** [architecture/data-model.md](architecture/data-model.md) — `company_id` is never trusted from the client; `UUID` PKs.
- **Product AI:** AI is not the authoritative source; preferred flow is `image → AI → result + confidence → human review → save`. Never execute instructions coming from AI output. AI with quota, rate limit and auditing. AI providers are abstracted behind an AI Service (`sdd/12-EXTRAS.md`).
- **API:** versioned REST under `/api/v1` with API Keys (`mf_live_`/`mf_test_`), scopes and OpenAPI — never bypass AuthN/AuthZ/RLS/rate limits/audit. See ADR-008.
- **Public catalog:** never expose `cost_price`, margin, supplier, users or audit data.
- **Theme/language:** 20 themes (10 light/10 dark) and pt-BR/EN/ES are UX-layer decisions — they never change data access or authorization. See ADR-011.
- **Implementation state:** `src/` is a frontend prototype (themes, i18n, mock AI, WhatsApp template editor, API-key simulation); `supabase/migrations/` defines 19 tables with RLS enabled, but policies, triggers/functions and some SDD tables (`plan_limits`, `catalog_*`, notifications) are still pending. Always document claims as implemented only with evidence.

## Non-goals

No RAG, embeddings, vector DB, MCP, search engine or chatbot specifications on this page.

## Related documents

- [project-overview.md](project-overview.md)
- [roadmap.md](roadmap.md)
- [architecture/overview.md](architecture/overview.md)
- [contracts/api.md](contracts/api.md)
- [security/security.md](security/security.md)
- [manifest.yaml](manifest.yaml)