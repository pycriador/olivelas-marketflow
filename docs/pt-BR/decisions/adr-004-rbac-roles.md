---
title: "ADR-004 — Papéis RBAC e Autorização Server-side"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-004 — Papéis RBAC e Autorização Server-side

> Language: pt-BR | [English](../../en/decisions/adr-004-rbac-roles.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow tem múltiplos perfis dentro da mesma empresa e trata privilege escalation e autorização apenas no frontend como ameaças críticas. Usuários podem pertencer a várias empresas.

## Problema

Como modelar permissões e onde aplicar a autorização?

## Decisão

Adotar **RBAC** com papéis **`GLOBAL_ADMIN`**, **`ADMIN`**, **`STOCK`**, **`VISITOR`**, residindo no **`CompanyUser.role`** (vínculo usuário+empresa), nunca no usuário global. Autorização considera **Usuário + Empresa + Papel + Recurso + Ação** e é decidida **server-side** (Edge Functions + RLS), nunca somente na UI. Detalhes: `sdd/04-PERMISSIONS.md`, `sdd/08-SECURITY.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Papel no usuário global | Simples | Trabalha mal com multiempresa; um usuário teria papel único | Rejeitado — papel por vínculo é o modelo |
| Autorização somente no frontend | Rápido de implementar | Inseguro; viola "nunca confiar no cliente" | Rejeitado por princípio |
| ABAC desde já | Flexível | Complexidade alta no MVP | Futuro (P2) — custom roles/ABAC |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Um usuário = papéis distintos por empresa | Matriz de permissões precisa ser mantida | Gerenciamento de membros dentro do app |
| Disponível para securitizar estoque, catálogo e IA | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Matriz de permissões não atualizada | Checklist de segurança + testes de role no MVP | Proposed |
| Elevação de privilégio dentro da empresa | Bloquear autoelevação; proteger o último Admin | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| `company_users` | Papel por vínculo | [architecture/data-model.md](../architecture/data-model.md) |
| Frontend | Estados unauthorized/forbidden (UX, não autorização) | [security/authorization.md](../security/authorization.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Autorização server-side em Edge Functions | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-004 |
| Component | `company_users`, Frontend, Edge Functions |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/04-PERMISSIONS.md` (spec — não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-003 | related (RLS complementa RBAC) |
| ADR-005 | related (auth define identidade; RBAC define autorização) |

## Referências

| Referência | Localização |
| --- | --- |
| Authorization doc | [security/authorization.md](../security/authorization.md) |
| Security | [security/security.md](../security/security.md) |
| Evidence | [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md) |