---
title: "ADR-011 — 20 Themes and Internationalization (pt-BR/EN/ES)"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-011 — 20 Themes and Internationalization (pt-BR/EN/ES)

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-011-themes-and-internationalization.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-05

## Context

MarketFlow is a mobile-first SaaS for small retailers. Visual customization and language support improve perception and adoption, and the product targets pt-BR first with EN/ES reach.

## Problem

How to support visual themes and multiple languages without compromising accessibility, performance or the design system?

## Decision

Support **20 visual themes — 10 light and 10 dark** — defined as CSS custom properties (Tailwind/shadcn-style tokens) in the frontend, with persistence per user and a theme picker:

- **Light (10):** corporate, emerald, indigo, amber, rose, slate-light, teal, paper, high-contrast-light, mint.
- **Dark (10):** dark-corporate, midnight, dracula, cyberpunk, nord, forest, high-contrast-dark, slate-dark, obsidian, sunset-dark.
- Default: `theme-corporate` (light). High-contrast variants improve accessibility.

Support **3 languages**: **pt-BR** (default), **en** and **es**, selectable and persisted. Themes and language are **UX-layer** decisions: they never change data access, authorization or business rules.

Evidence of stable design tokens and multi-language support (`src/i18n/translations.ts`, `src/index.css`) exists in the current frontend.

Details: `sdd/11-EXTRAS.md` items 4–5.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Only light or dark themes | Less token work | No personalization; weaker perception | Rejected — 20 themes is product direction |
| Only pt-BR language | Less work | Limits reach (EN/ES) | Rejected — multi-language is product direction |
| Custom component library per theme | Full control | High maintenance; inconsistent tokens | Rejected — same shadcn/ui base |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| Personalization and product perception | Design token maintenance (governance to avoid fragmentation) | Light/dark with high-contrast improves accessibility |
| Multi-language reach | i18n adoption is partial (do not half-translate) | Language/theme stored per user |
| Shared Tailwind tokens keep UI consistent | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Visual fragmentation | Design DoD: review before new color/component/lib/variant ([ADR-007](adr-007-design-system.md)) | Proposed |
| Partial translations | Fallback; translation completeness in the delivery criteria | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| React frontend | Theme system + i18n | [../architecture/overview.md](../architecture/overview.md), [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |

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
| Decision (this ADR) | ADR-011 |
| Component | React frontend (themes + i18n) |
| Contract | — |
| Implementation evidence | `sdd/11-EXTRAS.md` (spec; themes and i18n implemented in the frontend) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-002 | related (same frontend stack) |
| ADR-007 | related (design system governance) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Design system | [adr-007-design-system.md](adr-007-design-system.md) |
| Evidence | [`sdd/11-EXTRAS.md`](../../../sdd/11-EXTRAS.md) |