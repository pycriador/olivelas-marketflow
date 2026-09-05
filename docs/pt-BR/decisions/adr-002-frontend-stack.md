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

> Language: pt-BR | [English](../../en/decisions/adr-002-frontend-stack.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow é mobile-first e precisa de UX rápida, consistente e acessível com pouco esforço de manutenção. O time de produtos deseja componentes reutilizáveis e forte checagem de tipos.

## Problema

Qual stack de frontend usar no MVP?

## Decisão

Usar **React + TypeScript + Vite + Tailwind CSS + shadcn/ui** (sobre Radix UI) + **React Hook Form + Zod** para formulários/validação + **TanStack Query** para dados do servidor + **TanStack Router** para navegação. Detalhes: `sdd/01-FOUNDATION.md`, `sdd/09-DESIGN_SYSTEM.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Next.js (SSR) | SEO/SSR | Complexidade; o MVP é app mobile-first, catálogo público pode ser estático | Não necessário no MVP |
| Vue/Svelte | Leves | Ecossistema menor de componentes; equipe otimiza por React | Menor alinhamento com referências do produto |
| Component lib pronta (MUI) | Componentes prontos | Estilo pesado tipo "enterprise/ERP" | Conflita com identidade visual simples e leve ([ADR-007](adr-007-design-system.md)) |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| TypeScript em todo o frontend; validação com Zod | Várias libs (TanStack, shadcn) exigem disciplina de arquitetura | Design tokens Tailwind compartilhados |
| Componentes acessíveis (Radix) | — | SSR não disponível nativamente (sem necessidade agora) |
| Curva de aprendizado baixa | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Fragmentação de componentes | shadcn/ui centraliza; governança de DS ([ADR-007](adr-007-design-system.md)) | Proposed |
| Atualizações de dependências (Vite/React) | Dependency scanning (P1) | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Frontend React | Stack definida nesta ADR | [architecture/overview.md](../architecture/overview.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Consumida via TanStack Query/Supabase Client | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-002 |
| Component | Frontend React |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/01-FOUNDATION.md` (spec — ainda não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-001 | related (backend consumido pelo frontend) |
| ADR-007 | related (design system no mesmo stack) |

## Referências

| Referência | Localização |
| --- | --- |
| Architecture doc | [architecture/overview.md](../architecture/overview.md) |
| Design system | [adr-007-design-system.md](adr-007-design-system.md) |
| Evidence | [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md) |