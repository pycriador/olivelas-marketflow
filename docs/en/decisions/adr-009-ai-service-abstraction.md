---
title: "ADR-009 — AI Service: Provider Abstraction"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-009 — AI Service: Provider Abstraction

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-009-ai-service-abstraction.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-05

## Context

MarketFlow uses AI for product registration, OCR and shelf recognition. Tying the product to a single AI vendor creates lock-in and makes cost/quality control harder.

## Problem

How to integrate AI providers without coupling the application to a single vendor?

## Decision

Create an **AI Service abstraction** (`AIProvider` interface) with provider adapters — **OpenAI**, **Google Gemini**, **Anthropic** and future providers (a `mock` adapter validates flows without external cost). The application only talks to the **AI Service**, never directly to a provider.

- Operations: `analyzeImage()`, `analyzeProduct()`, `extractText()` (OCR), `classifyProduct()`.
- Per-environment (and, when needed, per-company) configuration: provider, model, temperature, max tokens, timeout, enabled. **Provider keys never live in the frontend.**
- Product image analysis suggests name, brand, manufacturer, category, description, barcode (when readable), unit, weight/volume. AI output is a **suggestion**, never truth.
- Every relevant result carries a **confidence score** (`confidence`); below threshold → **human review** required. Shelf recognition is an **estimate** — never updates stock automatically.
- AI jobs are async (`ai_jobs`: pending/processing/completed/failed/cancelled) with usage logs (`ai_usage_logs`: company, user, operation, provider, model, input/output tokens, estimated cost, status) for per-company cost control and **plan limits** (configurable; never hardcoded in the frontend).
- **AI output is UNTRUSTED DATA**: mitigate prompt injection, malicious files, excessive uploads, abuse and cost; never execute instructions from AI output.

Details: `sdd/12-EXTRAS.md` sections 22–32.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Direct provider SDK calls in product flows | Fast to build | Vendor lock-in; hard to switch; duplicated code | Rejected — abstraction required |
| Single provider | Simple | Lock-in; no fallback | Rejected |
| No AI | — | Loses the main differentiator for registration | Rejected |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Provider portability (switch/cost control) | Abstraction layer must be maintained | `mock` adapter enables development without cost |
| Confidence-based human review | — | Jobs and usage logs enable quota/cost |
| Consistent, structured output | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Prompt injection / untrusted output | Treat output as UNTRUSTED DATA; never execute instructions | Proposed |
| Cost abuse | Usage logs + plan limits + rate limit | Proposed |
| Provider availability | Failure isolation; AI is auxiliary (does not block catalog/inventory) | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| AI Service + provider adapters | New abstraction | [../architecture/overview.md](../architecture/overview.md) |
| `ai_jobs` / `ai_usage_logs` | Async jobs and usage | [../architecture/data-model.md](../architecture/data-model.md) |
| AI Assistant (product registration) | Uses the service | [../architecture/overview.md](../architecture/overview.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | `POST /api/v1/ai/analyze-image`, `GET /api/v1/ai/jobs/{id}`, scopes `ai:use` | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-009 |
| Component | AI Service, adapters, `ai_jobs`, `ai_usage_logs` |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/12-EXTRAS.md` (spec; mock adapters implemented, real providers pending) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (Edge Functions host the AI service) |
| ADR-006 | related (AI limits tied to plan limits) |
| ADR-008 | related (AI exposed/scoped via API) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Security | [../security/security.md](../security/security.md) |
| Evidence | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |