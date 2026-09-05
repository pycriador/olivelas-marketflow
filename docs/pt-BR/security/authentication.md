---
title: "MarketFlow — Autenticação"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Autenticação

> Language: pt-BR | [English](../../en/security/authentication.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md). Estado proposto (não implementado).

## Propósito

Definir como os usuários provam identidade no MarketFlow: providers, princípios e responsabilidades sobre credenciais e sessões.

## Ponto de entrada (mecanismo)

| Ponto de entrada | Mecanismo | Classificação |
| --- | --- | --- |
| Cadastro / login | Supabase Auth — email + senha | Confirmed (SDD) |
| Cadastro / login | Supabase Auth — Google OAuth | Confirmed (SDD) |
| Sessão | Tokens de sessão gerenciados pelo Supabase Auth | Confirmed (SDD) |

## Providers — MVP

| Provider | Status | Notas |
| --- | --- | --- |
| Email + senha | MVP | Senhas hasheadas pelo Supabase; a aplicação **nunca** armazena senhas |
| Google OAuth | MVP | OAuth 2.0 / OpenID via Supabase |
| Microsoft | Futuro | — |
| Apple | Futuro | — |
| Magic Link | Futuro | — |
| OIDC | Futuro | — |
| SAML | Futuro (enterprise) | — |

Os secrets de OAuth vivem em configuração segura do provedor (nunca no frontend).

## MFA

- Fora do MVP; planejado (P2/futuro). Ver [roadmap.md](../roadmap.md) e prioridades de segurança em [security.md](security.md).

## Princípios

| Princípio | Significado | Classificação |
| --- | --- | --- |
| Security by Default | Configurações seguras por padrão | Confirmed (SDD) |
| Least Privilege | Sessões e tokens com o mínimo necessário | Confirmed (SDD) |
| Sessões seguras | Tokens seguros; sem vazamento de cache em logout/troca de empresa | Confirmed (SDD) |
| Senhas não armazenadas pela aplicação | Hash gerido pelo Supabase | Confirmed (SDD) |
| Sem tokens sensíveis no banco de negócio | Secrets e credenciais fora das tabelas do produto | Confirmed (SDD) |
| Sem credenciais privadas no frontend | Nada de secrets no cliente | Confirmed (SDD) |

## Regras operacionais (SDD)

- Logout e troca de empresa não podem causar vazamento de cache.
- Usuários removidos perdem acesso imediatamente; usuários desativados não operam.
- Não criar Global Admin através de UI pública.
- Credenciais em trânsito por HTTPS (infraestrutura gerenciada).

## Responsabilidades

| Componente | Responsabilidade | Classificação |
| --- | --- | --- |
| Supabase Auth | Identidade, sessões, providers, hashing | Confirmed (SDD) |
| Frontend | Redirecionamentos, estados de sessão, captura de erros | Confirmed (SDD) |
| Edge Functions | Token validation em operações privilegiadas | Confirmed (SDD) |
| PostgreSQL/RLS | Nunca confia em `user_id`/`company_id` do cliente | Confirmed (SDD) |

## Documentação relacionada

| Documento | Path |
| --- | --- |
| Autorização (RBAC) | [authorization.md](authorization.md) |
| Segurança (postura geral) | [security.md](security.md) |
| Contratos | [contracts/api.md](../contracts/api.md) |
| Fonte completa | [`sdd/03-AUTH.md`](../../../sdd/03-AUTH.md) |