---
title: "ADR-005 — Providers de Autenticação"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-005 — Providers de Autenticação

> Language: pt-BR | [English](../../en/decisions/adr-005-auth-providers.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-04

## Contexto

O MarketFlow precisa de identidade confiável no MVP com baixa fricção de cadastro (pequenos comércios) e preparo para enterprise no futuro.

## Problema

Quais mecanismos de autenticação oferecer no MVP e no futuro?

## Decisão

No MVP: **e-mail + senha** e **Google OAuth**, ambos via **Supabase Auth**. Futuro: Microsoft, Apple, Magic Link, OIDC, SAML e **MFA** (P2+). A aplicação nunca armazena senhas (hash em Supabase); secrets de OAuth vivem em configuração segura, nunca no frontend. Detalhes: `sdd/03-AUTH.md`.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não escolhida |
| --- | --- | --- | --- |
| Implementar auth própria (JWT + hash) | Controle total | Campo minado de segurança; risco alto no MVP | Supabase Auth entrega isso com menos risco |
| Somente login social (Google) | Fricção baixa | Exclui usuários sem Google; comerciantes muitas vezes preferem e-mail | MVP inclui os dois |
| MFA no MVP | Segurança forte | Fricção e complexidade para o usuário final do MVP | Futuro (P2) |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Cadastro com baixa fricção | Segredos de OAuth precisam de gestão | MFA/rótulos futuros adicionam opções |
| Senhas hasheadas fora da aplicação | Vínculo com provider de identidade | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Credential theft | Sessões seguras; monitorar eventos de auth | Proposed |
| Vazamento de cache em logout/troca de empresa | Testes/aceitação de segurança no MVP | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Supabase Auth | Identidade/sessões | [security/authentication.md](../security/authentication.md) |
| Frontend | Fluxos de login/cadastro; estados de sessão | [security/authentication.md](../security/authentication.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Token/sessão para acesso a dados | [contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Decision (this ADR) | ADR-005 |
| Component | Supabase Auth, Frontend |
| Contract | [contracts/api.md](../contracts/api.md) |
| Implementation evidence | `sdd/03-AUTH.md` (spec — não implementado) |

## Decisões relacionadas

| ADR | Relação |
| --- | --- |
| ADR-001 | related (Supabase como backend) |
| ADR-004 | related (autorização usa a identidade) |

## Referências

| Referência | Localização |
| --- | --- |
| Authentication doc | [security/authentication.md](../security/authentication.md) |
| Security | [security/security.md](../security/security.md) |
| Evidence | [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md) |