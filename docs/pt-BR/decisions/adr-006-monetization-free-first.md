---
title: "ADR-006 — Monetização Free First com Limites no Backend"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-006 — Monetização Free First com Limites no Backend

> Language: pt-BR | [English](../../en/decisions/adr-006-monetization-free-first.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow quer adquirir usuários (pequenos comércios) com um plano gratuito e monetizar depois, sem que pagamentos sejam dependência do MVP. A arquitetura precisa permitir monetização sem retrabalho.

## Problema

Como preparar o modelo de monetização no MVP sem implementar gateway de pagamento?

## Decisão

Adotar **Free First** como estratégia (prioridade P2 para implementação completa, com preparação arquitetural no MVP). Modelo: **Plan → Plan Limits → Usage → Feature Access**. **Backend** aplica limites (`plan_limits` / `usage`); o frontend apenas informa. **Empresa (Company)** é a unidade de billing — assinatura pertence à empresa, e um usuário pode estar em várias empresas com planos/uso/limites distintos por empresa. Pagamentos/gateway ficam para etapa posterior, com abstração preparada. Detalhes: `sdd/07-MONETIZATION.md`, `sdd/28-BILLING`, `sdd/29-BACKLOG`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Somente pago desde o início | Receita imediata | Frenagem na aquisição de pequenos comércios | Free First alinha-se ao usuário do MVP |
| Limites no código/frontend | Simples | Violação: limites devem ser no backend; drift | Configurável no banco |
| Billing por usuário (tipo per-seat global) | Simples de modelar | Não reflete multiplicidade de empresas por usuário | Billing por empresa |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Modelos configuráveis no banco | Requer tabelas de `plan`/`usage` desde o MVP | Entitlements evoluem (feature access) |
| Backend enforcement protege limites | — | — |
| Preparação para gateway/webhooks sem bloqueio | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Downgrade apagar dados | Regra: downgrade não apaga dados | Proposed |
| Limites ignorados/frontend informa errado | Backend sempre valida; testes de quota | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| `companies` / `company_users` | Billing unit = empresa | [architecture/data-model.md](../architecture/data-model.md) |
| `plan_limits` / `usage` | Limites e uso por empresa | [architecture/data-model.md](../architecture/data-model.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Quota de IA, limite de produtos/usuários aplicados no backend | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-006 |
| Component | `plan_limits`, `usage`, Empresa |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/07-MONETIZATION.md`, `sdd/28-BILLING` (spec — não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-001 | related (backend gerenciado viabiliza entitlements) |
| ADR-003 | related (uso limitado por empresa/tenant) |
| ADR-004 | related (planos/limites por vínculo usuário+empresa) |

## Referências

| Referência | Localização |
| --- | --- |
| Architecture doc | [architecture/overview.md](../architecture/overview.md) |
| Roadmap | [roadmap.md](../roadmap.md) |
| Evidence | [`sdd/07-MONETIZATION.md`](../../../sdd/07-MONETIZATION.md) |