---
title: "MarketFlow — Superfície de API e Acesso"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
contract_type: "API"
---

# MarketFlow — Superfície de API e Acesso

> Language: pt-BR | [English](../../en/contracts/api.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/05-API.md`](../../../sdd/05-API.md) e [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md). Contrato agnóstico de tecnologia; descreve a superfície de acesso do MarketFlow — o contrato documentado é o alvo; o protótipo atual simula partes no frontend.

## Propósito

Descrever como clientes (frontend, visitantes do catálogo e consumidores de API) acessam o MarketFlow: caminhos de dados, API versionada, serviços via Edge Functions e a vitrine pública — e as garantias associadas.

## Escopo

| No escopo | Fora do escopo |
| --- | --- |
| Frontend → Supabase (Database/Auth/Storage) | Acesso direto de terceiros ao banco |
| Frontend → serviços (IA, WhatsApp, ops privilegiadas) | Gateway de pagamento (futuro) |
| **API REST versionada `/api/v1`** (API Keys, scopes, rate limits, idempotência, paginação, envelopes, OpenAPI) | |
| **API pública `/public/v1`** (somente leitura, ex.: catálogo por slug) | |
| Webhooks outbound (eventos, retries, assinaturas) | |
| Catálogo público (leitura por slug, sem login) | |
| RLS como mecanismo de autorização de dados | |

## Participantes

| Participante | Papel | Notas | Classificação |
| --- | --- | --- | --- |
| Frontend React | consumer | Cliente autenticado (utente da empresa) | Confirmed (SDD) |
| Supabase Client (Database/Auth/Storage) | producer | Superfície default do frontend | Confirmed (SDD) |
| Edge Functions (serviços + camada de API) | producer | IA, WhatsApp, `/api/v1`, `/public/v1`, webhooks | Confirmed (SDD) |
| Consumidor de API (integrador) | consumer | API Key bearer (`mf_live_`/`mf_test_`) + scopes | Confirmed (SDD) — ADR-008 |
| Visitante (catálogo) | consumer | Leitura pública sem login | Confirmed (SDD) |

## Tipo de contrato

- [x] API
- [ ] Event / Message / File / Command / Callback / Library / Data / Integration / Other

## Protocolo

| Campo | Valor | Classificação |
| --- | --- | --- |
| Protocolo | HTTPS (assumido por Supabase/Lovable Cloud) | Inferred |
| Estilo de interação | request-response (e RPC; webhooks são eventos outbound) | Confirmed (SDD) |

## Endpoints / canais / interfaces

### 1. Acesso a dados autenticado (frontend → Supabase)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | Supabase Database/Storage/Auth SDKs | Confirmed (SDD) |
| Method / operation | Query/read/write conforme permissões; RLS aplicado | Confirmed (SDD) |
| Notas | Frontend **nunca** autoriza; RLS + políticas definem o acesso | Confirmed (SDD) |

### 2. API REST versionada (API First — ADR-008)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | `/api/v1` (+ `/public/v1` para superfície pública somente-leitura) | Confirmed (SDD) |
| Method / operation | REST sobre categories/products/brands/manufacturers/suppliers/inventory/lots/catalog/requests, `GET /api/v1/ai/jobs/{id}`, `POST /api/v1/ai/analyze-image` | Confirmed (SDD) |
| Auth | API Key bearer: `Authorization: Bearer mf_live_...` / `mf_test_...`; armazenada como hash | Confirmed (SDD) |
| Scopes | `products:read/write`, `categories:read/write`, `brands:read/write`, `manufacturers:read/write`, `suppliers:read/write`, `inventory:read/write`, `lots:read/write`, `catalog:read/write`, `requests:read/write`, `ai:use`, `reports:read` | Confirmed (SDD) |
| Envelope de resposta | sucesso `{ data, meta }`; erro `{ error: { code, message, details } }` | Confirmed (SDD) |
| Paginação | page, page_size, sort, order, search, filters (máx. 100 por página) | Confirmed (SDD) |
| Idempotência | `Idempotency-Key` em mutações | Confirmed (SDD) |
| Docs | `/api/docs` (UI) e `/api/openapi.json` (OpenAPI) | Confirmed (SDD) |
| Notas | token + empresa + scopes + propriedade do recurso validados a cada request; rate-limited e auditado | Confirmed (SDD) |

### 3. Webhooks (eventos outbound)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | `webhook_endpoints` registrados (URL + secret por endpoint) | Confirmed (SDD) |
| Method / operation | POST assinado; retries com backoff; eventos idempotentes | Confirmed (SDD) |
| Notas | Histórico de entrega em `webhook_deliveries` | Confirmed (SDD) |

### 4. Edge Functions (serviços — IA, WhatsApp)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | Supabase Edge Function (via API gateway/Functions) | Confirmed (SDD) |
| Method / operation | AI Service (`analyzeImage`, `analyzeProduct`, `extractText`, `classifyProduct`); WhatsApp Service (envio com template) | Confirmed (SDD) |
| Notas | Abstração de providers (ADR-009/ADR-010); quota de IA + rate limit; revisão humana para baixa confiança | Confirmed (SDD) |

### 5. Catálogo público

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | URL pública por slug da empresa (`/` + slug) | Confirmed (SDD) |
| Method / operation | GET (somente leitura) | Confirmed (SDD) |
| Notas | Sem login; somente conteúdo publicado; protegido contra abuso; CTA WhatsApp | Confirmed (SDD) |

## Autenticação

| Mecanismo | Notas | Classificação |
| --- | --- | --- |
| Supabase Auth — email + senha | MVP | Confirmed (SDD) |
| Supabase Auth — Google OAuth | MVP | Confirmed (SDD) |
| API Keys (`mf_live_`/`mf_test_`, hash, por empresa, com scopes) | Acesso máquina (`/api/v1`) | Confirmed (SDD) — ADR-008 |
| (Futuro) Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Fora do MVP | Confirmed (SDD) |

Sem valores de secret — referências apenas. Detalhes: [security/authentication.md](../security/authentication.md).

## Autorização

| Regra | Notas | Classificação |
| --- | --- | --- |
| RBAC server-side; papel em `CompanyUser.role` | `GLOBAL_ADMIN`, `ADMIN`, `STOCK`, `VISITOR` | Confirmed (SDD) |
| Autorização considera Usuário + Empresa + Papel + Recurso + Ação | Modelo de contexto de autorização | Confirmed (SDD) |
| Acesso de API considera token + empresa + **scopes** + propriedade do recurso | Dimensão de authz por API Key | Confirmed (SDD) — ADR-008 |
| RLS no Postgres aplicado no acesso a dados | Nunca confiar em `company_id`/`user_id`/permissões enviados pelo cliente | Confirmed (SDD) |
| Catálogo público: somente conteúdo publicado; sem expor dados internos | Filtragem de campos; rate limiting | Confirmed (SDD) |

Detalhes: [security/authorization.md](../security/authorization.md).

## Validação

| Regra | Onde aplicada | Notas | Classificação |
| --- | --- | --- | --- |
| Validação de entrada (Zod/frontend) | consumer | UX imediata | Confirmed (SDD) |
| Validação server-side (serviços/RLS) | producer | **Backend sempre valida** | Confirmed (SDD) |
| Preços não negativos; SKU/barcode únicos por empresa | producer | Regras de domínio | Confirmed (SDD) |
| Resultado de IA validado e estruturado | producer | Confiança + revisão humana; prompt injection mitigado | Confirmed (SDD) |
| Variáveis de template WhatsApp validadas | producer | Placeholders desconhecidos bloqueados; preview | Confirmed (SDD) |
| Checagem de scope de API Key por request | producer | Menor privilégio | Confirmed (SDD) |

## Erros

| Erro / condição | Retryable | Ação do consumer | Classificação |
| --- | --- | --- | --- |
| Falha de autenticação | no | Redirecionar ao login / apresentar erro de token | Confirmed (SDD) |
| Acesso negado (authorization / scope) | no | Exibir estado unauthorized/forbidden | Confirmed (SDD) |
| Rate limit excedido | yes | Back off; ler `Retry-After` | Confirmed (SDD) |
| Quota/limite de plano atingido | Unknown | Informar limite; backend aplica | Confirmed (SDD) |
| Falha do provider de IA | yes | Reapresentar ao usuário; auditoria | Confirmed (SDD) |
| Replay idempotente | no | Retornar resultado original | Confirmed (SDD) |
| Violação de validação (estoque insuficiente etc.) | no | Mensagem clara + validação final no backend | Confirmed (SDD) |

Catálogo detalhado de erros: definido por endpoint no OpenAPI (`sdd/12-EXTRAS.md`); códigos por endpoint pendentes de implementação.

## Rate limits

| Limite | Valor | Classificação |
| --- | --- | --- |
| Catálogo público (anti-abuso) | A definir (necessário) | Proposed |
| IA | Quota + rate limit por empresa | Confirmed (SDD) |
| API versionada | Por categoria com quota/limites (por key/empresa) | Confirmed (SDD) |
| Endpoints públicos | Protegidos contra abuso | Confirmed (SDD) |

## Limites de tamanho

| Limite | Valor | Classificação |
| --- | --- | --- |
| Uploads de imagem | Validados (tipo, tamanho, conteúdo) | Confirmed (SDD) |
| Paginação | máx. 100 por página | Confirmed (SDD) |

## Considerações de segurança

| Tópico | Resumo | Classificação |
| --- | --- | --- |
| Sensibilidade dos dados | `cost_price`, margem, fornecedores e auditoria são internos — nunca no catálogo público | Confirmed (SDD) |
| Segurança de tokens | API Keys com hash em repouso; chave completa exibida uma vez; revogação/rotação | Confirmed (SDD) |
| Criptografia em trânsito | HTTPS (mantido pela infraestrutura gerenciada) | Inferred |
| Tratamento de PII / secrets | LGPD a documentar; secrets nunca em código/frontend | Confirmed (SDD) |

## Observabilidade

| Sinal | O que observar | Classificação |
| --- | --- | --- |
| Logs | Operações críticas auditadas; eventos de segurança; `api_request_logs` | Confirmed (SDD) |
| Metrics | Rate limiting, quota de IA, erros, falhas de entrega | Proposed |
| Traces | Não aplicável no MVP simples | Not Applicable |

## Exemplos

### Exemplo — sucesso (fluxo de dados autenticado)

```text
Frontend → Supabase Client → PostgreSQL + RLS   (lista de produtos da empresa atual)
Frontend → Edge Function  → autorização server + negócio → PostgreSQL  (operação privilegiada)
```

### Exemplo — API Key (integração máquina)

```text
Integrador → POST /api/v1/products
  Authorization: Bearer mf_live_<secret>
  Validado: hash do token + empresa + scope products:write + Idempotency-Key
  → 200 {"data": {...}, "meta": {...}}   (rate-limited, logado em api_request_logs)
```

### Exemplo — IA (cadastro assistido)

```text
Imagem/entrada → AI Service → provider de IA → resultado + confiança → revisão humana → salvar
```

### Exemplo — Entrega de webhook

```text
Evento do MarketFlow → webhook_endpoints(URL, secret) → POST assinado → webhook_deliveries(status, retries)
```

## Cenários de falha

| Cenário | Impacto | Comportamento esperado | Mitigação | Classificação |
| --- | --- | --- | --- | --- |
| Provider de IA indisponível | Funções de IA fora | Não bloqueia catálogo/estoque | Isolamento de falha | Confirmed (SDD) |
| WhatsApp Provider indisponível | Mensagens fora | Não bloqueia catálogo/estoque | Isolamento de falha + retry | Confirmed (SDD) |
| Abuso do catálogo público | Custo/exposição | Rate limiting | Proteção anti-abuso | Confirmed (SDD) |
| Vazamento de token | Exposição de dados | Revogação + contenção de escopo | Hash storage; menor privilégio | Confirmed (SDD) |
| Tentativa cross-tenant | Vazamento | Negado por RLS/autorização | Testes cross-tenant + IDOR/BOLA | Confirmed (SDD) |

## Componentes relacionados

| Componente | Relacionamento | Path / ID |
| --- | --- | --- |
| Frontend React | consumer | [architecture/overview.md](../architecture/overview.md) |
| Supabase (Database/Auth/Storage/Edge Functions) | producer | [architecture/overview.md](../architecture/overview.md) |
| Camada de API + webhooks | producer | [architecture/overview.md](../architecture/overview.md) |
| Catálogo público | producer (leitura pública) | [architecture/overview.md](../architecture/overview.md) |

## Arquitetura relacionada

| Documento | Path |
| --- | --- |
| Visão geral de arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Modelo de dados | [architecture/data-model.md](../architecture/data-model.md) |

## ADRs relacionados

| ADR | Relevância | Path |
| --- | --- | --- |
| ADR-001 (cloud stack) | Backend gerenciado; superfície via Supabase | [decisions/adr-001-cloud-stack.md](../decisions/adr-001-cloud-stack.md) |
| ADR-003 (multi-tenant RLS) | RLS como mecanismo de autorização de dados | [decisions/adr-003-multi-tenant-isolation.md](../decisions/adr-003-multi-tenant-isolation.md) |
| ADR-004 (RBAC) | Autorização server-side | [decisions/adr-004-rbac-roles.md](../decisions/adr-004-rbac-roles.md) |
| ADR-008 (API First) | REST versionada + API Keys + scopes | [decisions/adr-008-api-first-and-api-keys.md](../decisions/adr-008-api-first-and-api-keys.md) |
| ADR-009 (AI Service) | Endpoints e scopes de IA | [decisions/adr-009-ai-service-abstraction.md](../decisions/adr-009-ai-service-abstraction.md) |
| ADR-010 (WhatsApp) | Fluxos de solicitação/mensagens | [decisions/adr-010-whatsapp-service.md](../decisions/adr-010-whatsapp-service.md) |