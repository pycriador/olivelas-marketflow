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

> Language: pt-BR | [English](../../en/decisions/adr-007-design-system.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow precisa de uma identidade visual **profissional, moderna, limpa, confiável, eficiente, acessível** e orientada a dados — deliberadamente distante de visual de "legacy ERP", "fiscal", "planilha", "dashboard complexo" ou "admin genérico".

## Problema

Qual design system e filosofia visual adotar?

## Decisão

Usar **shadcn/ui sobre Radix UI + Tailwind CSS** como base de componentes, com filosofia **Content First** (o conteúdo é o centro; UI discreta). Referências de tom/craft: **Linear, Stripe, Vercel, Supabase, Notion, Typeform** (referência de postura, não cópia). Suportar Light/Dark, acessibilidade básica, PT-BR como idioma principal e preparação estrutural para EN/ES. Detalhes: `sdd/09-DESIGN_SYSTEM.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Material Design (MUI) | Muito difundido | Visual pesado tipo enterprise | Conflita com a identidade leve e moderna |
| Componentes custom do zero | Controle total | Custo alto de manutenção e consistência | shadcn/ui + Radix atende |
| Template de dashboard genérico | Entrega rápida | "Generic admin" — anti-pattern do produto | Rejeitado pelo critério de identidade |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Tokens consistentes (Tailwind CSS vars) | Governança de DS é necessária para evitar fragmentação | Light/Dark desde o início |
| Componentes acessíveis (Radix) | — | EN/ES suportados sem refatoração estrutural |
| Estados completos (loading/error/empty) centralizados | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Fragmentação visual | Governança: revisar antes de nova cor/componente/lib/variante | Proposed |
| Acessibilidade insuficiente | DoD de design inclui acessibilidade básica e teclado | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Frontend React | Todos os componentes/shared UI | [architecture/overview.md](../architecture/overview.md), [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Sem impacto direto | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-007 |
| Component | Frontend React (Design System) |
| Contract | — |
| Implementation evidence | `sdd/09-DESIGN_SYSTEM.md` (spec — não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-002 | related (stack de frontend com shadcn/ui) |
| ADR-004 | related (permissões refletem na interface) |

## Referências

| Referência | Localização |
| --- | --- |
| Architecture doc | [architecture/overview.md](../architecture/overview.md) |
| Frontend stack | [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |
| Evidence | [`sdd/09-DESIGN_SYSTEM.md`](../../../sdd/09-DESIGN_SYSTEM.md) |