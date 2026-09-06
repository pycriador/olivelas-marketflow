---
title: "ADR-010 — WhatsApp Service and Message Templates"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-010 — WhatsApp Service and Message Templates

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-010-whatsapp-service.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-05

## Context

Catalog requests and customer contact happen on WhatsApp. Messaging must be customizable per company and independent of the provider to avoid vendor lock-in.

## Problem

How to send WhatsApp messages without coupling business rules to a provider and while allowing per-company templates?

## Decision

Create a **WhatsApp Service** decoupled from the provider: `MarketFlow → WhatsApp Service → Provider Adapter → WhatsApp Provider`. Business rules never talk to the provider implementation directly.

- **Configuration screen** (`/configuracoes/whatsapp`): number, display name, greeting/absence/order/confirmation/stock/product/contact messages, signature, language, service hours, variables.
- **Message templates** (`whatsapp_templates`): categories (greeting, product, order, request, stock, confirmation, cancellation, contact, support, error), each with name, type, content, `active`, `language` (**PT-BR / EN / ES**).
- **Variables** with placeholders (`{{customer_name}}`, `{{company_name}}`, `{{product_name}}`, `{{product_price}}`, `{{product_quantity}}`, `{{request_id}}`, `{{request_date}}`, `{{whatsapp}}`, `{{catalog_url}}`, `{{support_name}}`). Unknown placeholders are blocked before saving; editor shows **preview** with simulated values.
- **System vs company templates**: Global Admin maintains system defaults; companies override allowed templates. A company never changes another company's templates.
- **History** (`whatsapp_messages`) with statuses (queued, sending, sent, delivered, read, failed, cancelled), retry (controlled, exponential backoff, attempt limit, idempotency — never infinite loops), provider_message_id and timestamps.
- Public catalog CTA generates dynamic messages ("Buy/Ask" or "Talk on WhatsApp").
- Privacy: data minimization, purpose, security, adequate retention, **LGPD**; never store unnecessary sensitive data.

Details: `sdd/12-EXTRAS.md` sections 33–48.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Provider SDK directly in product flows | Fast | Lock-in; business rules coupled to provider | Rejected — abstraction required |
| No templates (hardcoded messages) | Simple | Not customizable per company; bad UX | Rejected — per-company personalization |
| Single language | Less work | Multi-language (PT-BR/EN/ES) is product direction | Rejected |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Provider portability and future official providers | Template/variable system complexity | Multi-language with fallback |
| Per-company personalization and system defaults | — | Message history enables status/retry audit |
| CTA flow from the public catalog | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Delivery failures | Statuses, controlled retry + exponential backoff, logs | Proposed |
| Invalid/empty templates | Variable validation + preview; fallback when a translation is missing | Proposed |
| Sensitive data in messages | Privacy by design; minimal data; LGPD | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| WhatsApp Service + provider adapter | New abstraction | [../architecture/overview.md](../architecture/overview.md) |
| `whatsapp_templates` / `whatsapp_messages` | Templates and history | [../architecture/data-model.md](../architecture/data-model.md) |
| Public catalog CTA | Dynamic message flow | [../architecture/overview.md](../architecture/overview.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Catalog requests and WhatsApp messages (outbound) | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-010 |
| Component | WhatsApp Service, adapters, templates, messages |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/12-EXTRAS.md` (spec; template editor/mock delivery implemented, provider pending) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-003 | related (messages/templates tenant-scoped) |
| ADR-007 | related (editor UX follows the design system) |
| ADR-008 | related (request flow can be exposed via API) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Evidence | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |