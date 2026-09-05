---
title: "ADR-002 — Frontend: React + TypeScript + Vite + shadcn/ui"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-002 — Frontend: React + TypeScript + Vite + shadcn/ui

> Language: EN | [Português (pt-BR)](../../pt-BR/decisions/adr-002-frontend-stack.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Date

2026-09-04

## Context

MarketFlow is mobile-first and needs fast, consistent and accessible UX with low maintenance effort. The product team wants reusable components and strong type checking.

## Problem

Which frontend stack for the MVP?

## Decision

Use **React + TypeScript + Vite + Tailwind CSS + shadcn/ui** (on top of Radix UI) + **React Hook Form + Zod** for forms/validation + **TanStack Query** for server data + **TanStack Router** for navigation. Details: `sdd/01-FOUNDATION.md`, `sdd/09-DESIGN_SYSTEM.md`.

## Alternatives considered

| Alternative | Pros | Cons | Why not chosen |
| --- | --- | --- | --- |
| Next.js (SSR) | SEO/SSR | Complexity; the MVP is a mobile-first app, public catalog can be static | Not needed in the MVP |
| Vue/Svelte | Lightweight | Smaller component ecosystem; team optimizes React | Less aligned with product references |
| Ready component library (MUI) | Ready components | Heavy "enterprise/ERP" styling | Conflicts with the simple and light visual identity ([ADR-007](adr-007-design-system.md)) |

## Consequences

| Positive | Negative | Neutral |
| --- | --- | --- |
| TypeScript across the frontend; Zod validation | Multiple libs (TanStack, shadcn) require architectural discipline | Shared Tailwind design tokens |
| Accessible components (Radix) | — | No native SSR (no need now) |
| Low learning curve | — | — |

## Risks

| Risk | Mitigation | Classification |
| --- | --- | --- |
| Component fragmentation | shadcn/ui centralizes; DS governance ([ADR-007](adr-007-design-system.md)) | Proposed |
| Dependency updates (Vite/React) | Dependency scanning (P1) | Proposed |

## Affected components

| Component | Impact | Documentation |
| --- | --- | --- |
| React frontend | Stack defined in this ADR | [../architecture/overview.md](../architecture/overview.md) |

## Affected contracts

| Contract | Impact | Documentation |
| --- | --- | --- |
| API surface | Consumed via TanStack Query/Supabase Client | [../contracts/api.md](../contracts/api.md) |

## Traceability

```text
Architecture → Decision → Component → Contract
```

| Layer | Reference |
| --- | --- |
| Architecture | [../architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-002 |
| Component | React frontend |
| Contract | [../contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/01-FOUNDATION.md` (spec — not implemented yet) |

## Related decisions

| ADR | Relationship |
| --- | --- |
| ADR-001 | related (backend consumed by the frontend) |
| ADR-007 | related (design system on the same stack) |

## References

| Reference | Location |
| --- | --- |
| Architecture doc | [../architecture/overview.md](../architecture/overview.md) |
| Design system | [adr-007-design-system.md](adr-007-design-system.md) |
| Evidence | [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md) |