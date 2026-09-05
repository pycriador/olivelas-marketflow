---
title: "ADR-003 — Isolamento Multi-tenant por company_id + RLS"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-003 — Isolamento Multi-tenant por `company_id` + RLS

> Language: pt-BR | [English](../../en/decisions/adr-003-multi-tenant-isolation.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow é multiempresa desde a v1 e trata o vazamento entre empresas como ameaça crítica. O MVP rodará em Postgres compartilhado (Supabase) sem custo de infraestrutura dedicada.

## Problema

Como isolar dados entre empresas (tenants) no MVP?

## Decisão

Usar **PostgreSQL compartilhado com isolamento lógico**: coluna `company_id UUID NOT NULL` em todas as tabelas empresariais + **Row Level Security (RLS)** por `company_id` (e papel quando necessário). Chaves primárias `UUID` (`gen_random_uuid()`); **sem IDs sequenciais expostos publicamente**; unicidade (slug, SKU/barcode) validada **por empresa**. `company_id` nunca é confiado pelo cliente — deriva da sessão/RLS. Detalhes: `sdd/02-DATABASE.md`, `sdd/08-SECURITY.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Banco por tenant (schema/database dedicado) | Isolamento forte | Complexidade operacional e custo alto; migrações múltiplas | No MVP, custo e complexidade desnecessários |
| Isolamento só na aplicação (sem RLS) | Simples | Autorização fora do banco; risco alto de IDOR; viola "nunca confiar no cliente" | Rejeitado por princípio de segurança |
| Multi-tenancy via `user_id` apenas | Fácil | Usuário pertence a várias empresas — inválido para o modelo | Modelo exige `company_id` + papel por vínculo |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| RLS como última linha de defesa no dado | Disciplina: toda query via Supabase Client respeita RLS | Testes cross-tenant obrigatórios |
| Modelo simples para o MVP | Migração futura para tenants dedicados é trabalho extra | Suporte a filiais (`P3`) é preparado (sem implementar) |
| Unicidade por empresa evita colisões | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Policy de RLS incorreta → vazamento | Testes cross-tenant e IDOR/BOLA como critério de aceitação do MVP | Proposed |
| `company_id` confiado do cliente | Validar pelo token/sessão; nunca por input | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| PostgreSQL | RLS + `company_id` em todas as tabelas empresariais | [architecture/data-model.md](../architecture/data-model.md) |
| Frontend/Edge Functions | Nunca passam `company_id` como fonte de confiança | [contracts/api.md](../contracts/api.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Acesso a dados via RLS | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-003 |
| Component | PostgreSQL, Frontend, Edge Functions |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/02-DATABASE.md`, `sdd/08-SECURITY.md` (spec — não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-001 | related (Supabase/Postgres escolhido) |
| ADR-004 | related (papel por vínculo complementa RLS) |

## Referências

| Referência | Localização |
| --- | --- |
| Architecture doc | [architecture/overview.md](../architecture/overview.md) |
| Data model | [architecture/data-model.md](../architecture/data-model.md) |
| Security | [security/security.md](../security/security.md) |
| Evidence | [`sdd/02-DATABASE.md`](../../../sdd/02-DATABASE.md) |