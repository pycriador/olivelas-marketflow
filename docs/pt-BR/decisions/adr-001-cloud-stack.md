---
title: "ADR-001 — Cloud Stack: Supabase + Lovable Cloud"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-001 — Cloud Stack: Supabase + Lovable Cloud

> Language: pt-BR | [English](../../en/decisions/adr-001-cloud-stack.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow precisa de um backend confiável para o MVP (auth, banco, storage e funções) sem operar infraestrutura própria. A equipe busca simplicidade operacional e velocidade.

## Problema

Qual é a stack de backend/cloud para o MVP?

## Decisão

Usar **Supabase** (Auth, PostgreSQL, Storage, Edge Functions) como backend gerenciado e **Lovable Cloud** como hospedagem do frontend. **Não criar um backend API independente no MVP** — o frontend acessa Supabase diretamente (com RLS) e Edge Functions para operações privilegiadas. Detalhes: `sdd/01-FOUNDATION.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Backend proprio (FastAPI/Nest) + Postgres gerenciado | Controle total | Maior custo operacional; superfície de ataque maior; desacelera o MVP | Desnecessário para o escopo do MVP |
| Firebase | Similar ao Supabase | Lock-in do Firebase; menos controle sobre Postgres/SQL | Supabase oferece Postgres + RLS nativo |
| Serverless puro (Vercel + DB externo) | Simples | RLS/isolação de tenant exige trabalho extra | Supabase cobre auth+db+storage+functions |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| RLS/isolação de tenant nativas no Postgres | Lock-in de fornecedor gerenciado | Edge Functions substituem endpoints custom |
| Menos infra para operar no MVP | Migração futura de Supabase não trivial | Dependência do plano/provider da IA |
| Auth, storage e DB integrados | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Dependência de vendor (lock-in) | Modelo de dados em Postgres padrão; contratos documentados | Proposed |
| Custo futuro em escala | Limites e quota desde o MVP | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Frontend | Consome Supabase Client + Edge Functions | [architecture/overview.md](../architecture/overview.md) |
| Backend de dados | Supabase PostgreSQL + RLS | [architecture/data-model.md](../architecture/data-model.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Via Supabase SDKs + Edge Functions | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-001 |
| Component | Frontend, Supabase, Edge Functions |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/01-FOUNDATION.md` (spec — ainda não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-002 | related (stack do frontend) |
| ADR-003 | related (análise de isolamento no mesmo Postgres) |

## Referências

| Referência | Localização |
| --- | --- |
| Architecture doc | [architecture/overview.md](../architecture/overview.md) |
| Contract | [contracts/api.md](../contracts/api.md) |
| Evidence | [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md) |