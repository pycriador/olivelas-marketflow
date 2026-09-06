---
title: "ADR-008 — API First: API REST versionada + API Keys"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-008 — API First: API REST versionada + API Keys

> Language: pt-BR | [English](../../en/decisions/adr-008-api-first-and-api-keys.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-05

## Contexto

O MarketFlow evolui de aplicação web para uma plataforma SaaS extensível. O app web não pode ter regras de negócio exclusivas, e sistemas externos precisam de uma forma controlada, auditável e com rate limit para integrar.

## Problema

Como expor a camada de negócio como API oficial e controlar o acesso máquina-a-máquina?

## Decisão

Adotar **API First**: uma **API REST versionada sob `/api/v1`** como interface oficial do produto. O frontend web consome a mesma camada de negócio que a API exporá — sem regras exclusivas escondidas na UI.

- **Versionamento**: `/api/v1`. Nunca quebrar silenciosamente uma versão existente; mudanças incompatíveis → nova versão.
- **API Keys/tokens**: chaves bearer `mf_live_...` / `mf_test_...` (prefixo + ambiente + segredo). O segredo completo é exibido uma única vez na criação; o banco guarda apenas o **hash** (`secret_hash`). Tabela `api_keys` com `company_id`, scopes, ambiente, status (active/revoked/expired), `expires_at`, `last_used_at`, `revoked_at`.
- **Escopos** (least privilege): `products:read/write`, `categories:read/write`, `brands:read/write`, `manufacturers:read/write`, `suppliers:read/write`, `inventory:read/write`, `lots:read/write`, `catalog:read/write`, `requests:read/write`, `ai:use`, `reports:read`.
- **Vínculo com tenant**: toda chave pertence a uma `company`; token + empresa + permissão + propriedade do recurso validados em cada request.
- **Rate limiting**, **idempotência** (`Idempotency-Key`) em mutações, **paginação** (page, page_size, sort, order, search, filters; máx. 100), **envelope padronizado** (`{ data, meta }` / `{ error: { code, message, details } }`), **OpenAPI** (`/api/docs`, `/api/openapi.json`).
- **API pública** separada sob `/public/v1` (ex.: catálogo por slug) — nunca reutilizar endpoints administrativos para acesso público.
- **Webhooks** preparados (eventos, secret, status, retries, assinatura, idempotência).
- API Keys, webhooks e serviços de IA/WhatsApp nunca contornam Authentication, Authorization, Tenant Isolation, RLS, Audit, Rate Limits ou Plan Limits.

Detalhes: `sdd/12-EXTRAS.md` seções 1–21, 49–60.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não usada |
| --- | --- | --- | --- |
| Somente frontend + Supabase client | Simples; MVP rápido | Sem superfície oficial para integrações; regras presas na UI | API First é a direção do produto |
| Acesso direto de terceiros ao banco | Simples | Sem autorização/auditoria; inseguro | Nunca expor o banco |
| GraphQL | Consultas flexíveis | Mais complexidade | REST cobre o MVP; GraphQL não é necessário agora |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Superfície de integração oficial, documentada e versionada | Maior superfície de ataque (exige rate limit e auditoria) | Scopes adicionam uma segunda dimensão de autorização junto do RBAC |
| Acesso controlado via tokens + scopes | Gerenciamento do ciclo de vida do token (rotação, revogação) | Formato/prefixo do token indica ambiente |
| Webhooks e integrações preparados | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Vazamento de token | Apenas hash no banco; scopes de menor privilégio; rotação/revogação | Proposed |
| Abuso da API | Rate limit por categoria; audit logs | Proposed |
| Mudanças incompatíveis | Versionamento; nunca quebra silenciosa | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Camada de API (`/api/v1`, `/public/v1`) | Nova interface oficial | [../contracts/api.md](../contracts/api.md) |
| `api_keys` / `api_request_logs` | Armazenamento de tokens + auditoria | [../architecture/data-model.md](../architecture/data-model.md) |
| Área de desenvolvedores (API Keys, Docs, Webhooks, Logs) | UI do produto | [../architecture/overview.md](../architecture/overview.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | REST versionada, tokens, scopes, envelopes, OpenAPI | [../contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Decisão (este ADR) | ADR-008 |
| Componente | Camada de API, `api_keys`, Área de desenvolvedores |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Evidência de implementação | `sdd/12-EXTRAS.md` (spec; simulação no frontend implementada, backend pendente) |

## Decisões relacionadas

| ADR | Relacionamento |
| --- | --- |
| ADR-001 | relacionado (backend gerenciado hospeda a camada de API) |
| ADR-003 | relacionado (tokens com escopo de tenant) |
| ADR-004 | relacionado (RBAC + scopes combinam na autorização) |

## Referências

| Referência | Localização |
| --- | --- |
| Documento de arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Segurança | [../security/security.md](../security/security.md) |
| Evidência | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |