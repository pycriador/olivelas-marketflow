---
title: "ADR-007 — Design System: shadcn/ui, Content First"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-007 — Design System: shadcn/ui, Content First

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-007-design-system.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow needs a **professional, modern, clean, trustworthy, efficient, accessible** and data-oriented visual identity — deliberately far from "legacy ERP", "fiscal", "spreadsheet", "complex dashboard" or "generic admin" looks.

## Problem

Which design system and visual philosophy to adopt?

## Decision

Use **shadcn/ui on Radix UI + Tailwind CSS** as the component base, with a **Content First** philosophy (content is the center; UI is discreet). References for tone/craft: **Linear, Stripe, Vercel, Supabase, Notion, Typeform** (posture reference, not a copy). Support Light/Dark, basic accessibility, pt-BR as primary language and structural readiness for EN/ES. Details: `sdd/09-DESIGN_SYSTEM.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Material Design (MUI) | Widely adopted | Heavy enterprise look | Conflicts with the light and modern identity |
| Custom components from scratch | Full control | High maintenance and consistency cost | shadcn/ui + Radix covers it |
| Generic dashboard template | Fast delivery | "Generic admin" — product anti-pattern | Rejected by identity criteria |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Consistent tokens (Tailwind CSS vars) | DS governance required to avoid fragmentation | Light/Dark from the start |
| Accessible components (Radix) | — | EN/ES supported without structural refactoring |
| Complete states (loading/error/empty) centralized | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Visual fragmentation | Governance: review before new color/component/lib/variant | Proposed |
| Insufficient accessibility | Design DoD includes basic accessibility and keyboard | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| React frontend | All components/shared UI | [../architecture/overview.md](../architecture/overview.md), [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | No direct impact | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-007 |
| Component | React frontend (Design System) |
| Contract | — |
| Implementation evidence | `sdd/09-DESIGN_SYSTEM.md` (spec — not implemented) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | related (frontend stack with shadcn/ui) |
| ADR-004 | related (permissions reflect in the interface) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Frontend stack | [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |
| Evidence | [`sdd/09-DESIGN_SYSTEM.md`](../../../sdd/09-DESIGN_SYSTEM.md) |