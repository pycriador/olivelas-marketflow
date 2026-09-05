---
title: "MarketFlow — Superfície de API e Acesso"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
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

Fonte: [`sdd/05-API.md`](../../../sdd/05-API.md). Contrato agnóstico de tecnologia; descreve a superfície de acesso do MarketFlow no estado proposto (SDD), sem inventar endpoints, campos ou códigos de erro sem evidência.

## Propósito

Descrever como clientes (frontend e visitantes do catálogo) acessam o MarketFlow: caminhos de dados, Edge Functions e a vitrine pública — e as garantias associadas.

## Escopo

| No escopo | Fora do escopo |
| --- | --- |
| Frontend → Supabase (Database/Auth/Storage) | API pública para terceiros (futuro, P3) |
| Frontend → Edge Functions (IA, integrações, operações privilegiadas) | Gateway de pagamento (futuro) |
| Catálogo público (leitura por slug, sem login) | |
| RLS como mecanismo de autorização de dados | |

## Participantes

| Participante | Papel | Notas | Classificação |
| --- | --- | --- | --- |
| Frontend React | consumer | Cliente autenticado (utente da empresa) | Confirmed (SDD) |
| Supabase Client (Database/Auth/Storage) | producer | Superfície default do frontend | Confirmed (SDD) |
| Edge Functions | producer | Operações privilegiadas/servidas | Confirmed (SDD) |
| Visitante (catálogo) | consumer | Leitura pública sem login | Confirmed (SDD) |

## Tipo de contrato

- [x] API
- [ ] Event / Message / File / Command / Callback / Library / Data / Integration / Other

## Protocolo

| Campo | Valor | Classificação |
| --- | --- | --- |
| Protocolo | HTTPS (assumido por Supabase/Lovable Cloud) | Inferred |
| Estilo de interação | request-response (e RPC) | Confirmed (SDD) |

## Endpoints / canais / interfaces

### 1. Acesso a dados autenticado (frontend → Supabase)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | Supabase Database/Storage/Auth SDKs | Confirmed (SDD) |
| Method / operation | Query/read/write conforme permissões; RLS aplicado | Confirmed (SDD) |
| Notas | Frontend **nunca** autoriza; RLS + políticas definem o acesso | Confirmed (SDD) |

### 2. Edge Functions (operações privilegiadas)

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | Supabase Edge Function (via API gateway/Functions) | Confirmed (SDD) |
| Method / operation | POST/RPC | Confirmed (SDD) |
| Notas | Para IA, integrações externas, operações privilegiadas e assíncronas | Confirmed (SDD) |

### 3. Catálogo público

| Campo | Valor | Classificação |
| --- | --- | --- |
| Locator | URL pública por slug da empresa (`/` + slug) | Confirmed (SDD) |
| Method / operation | GET (somente leitura) | Confirmed (SDD) |
| Notas | Sem login; somente conteúdo publicado; protegido contra abuso | Confirmed (SDD) |

## Autenticação

| Mecanismo | Notas | Classificação |
| --- | --- | --- |
| Supabase Auth — email + senha | MVP | Confirmed (SDD) |
| Supabase Auth — Google OAuth | MVP | Confirmed (SDD) |
| (Futuro) Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Fora do MVP | Confirmed (SDD) |

Sem valores de secret — referências apenas. Detalhes: [security/authentication.md](../security/authentication.md).

## Autorização

| Regra | Notas | Classificação |
| --- | --- | --- |
| RBAC server-side; papel em `CompanyUser.role` | `GLOBAL_ADMIN`, `ADMIN`, `STOCK`, `VISITOR` | Confirmed (SDD) |
| Autorização considera Usuário + Empresa + Papel + Recurso + Ação | Modelo de contexto de autorização | Confirmed (SDD) |
| RLS no Postgres aplicado no acesso a dados | Nunca confiar em `company_id`/`user_id`/permissões enviados pelo cliente | Confirmed (SDD) |
| Catálogo público: somente conteúdo publicado; sem expor dados internos | Filtragem de campos; rate limiting | Confirmed (SDD) |

Detalhes: [security/authorization.md](../security/authorization.md).

## Validação

| Regra | Onde aplicada | Notas | Classificação |
| --- | --- | --- | --- |
| Validação de entrada (Zod/frontend) | consumer | UX imediata | Confirmed (SDD) |
| Validação server-side (Edge Functions/RLS) | producer | **Backend sempre valida** | Confirmed (SDD) |
| Preços não negativos; SKU/barcode únicos por empresa | producer | Regras de domínio | Confirmed (SDD) |
| Resultado de IA validado e estruturado | producer | Prompt injection mitigado | Confirmed (SDD) |

## Erros

| Erro / condição | Retryable | Ação do consumer | Classificação |
| --- | --- | --- | --- |
| Falha de autenticação | no | Redirecionar ao login | Confirmed (SDD) |
| Acesso negado (authorization) | no | Exibir estado unauthorized/forbidden | Confirmed (SDD) |
| Quota/limite de plano atingido | Unknown | Informar limite; backend aplica | Confirmed (SDD) |
| Falha do provider de IA | yes | Reapresentar ao usuário; auditoria | Confirmed (SDD) |
| Violação de validação (estoque insuficiente etc.) | no | Mensagem clara + validação final no backend | Confirmed (SDD) |

Catálogo detalhado de erros: não definido ainda (sem evidência).

## Rate limits

| Limite | Valor | Classificação |
| --- | --- | --- |
| Catálogo público (anti-abuso) | A definir (necessário) | Proposed |
| IA | Quota + rate limit por empresa | Confirmed (SDD) |
| Endpoints públicos | Protegidos contra abuso | Confirmed (SDD) |

## Limites de tamanho

| Limite | Valor | Classificação |
| --- | --- | --- |
| Uploads de imagem | Validados (tipo, tamanho, conteúdo) | Confirmed (SDD) |

## Considerações de segurança

| Tópico | Resumo | Classificação |
| --- | --- | --- |
| Sensibilidade dos dados | `cost_price`, margem, fornecedores e auditoria são internos — nunca no catálogo público | Confirmed (SDD) |
| Criptografia em trânsito | HTTPS (mantido pela infraestrutura gerenciada) | Inferred |
| Tratamento de PII / secrets | LGPD a documentar; secrets nunca em código/frontend | Confirmed (SDD) |

## Observabilidade

| Sinal | O que observar | Classificação |
| --- | --- | --- |
| Logs | Operações críticas auditadas; eventos de segurança | Confirmed (SDD) |
| Metrics | Rate limiting, quota de IA, erros | Proposed |
| Traces | Não aplicável no MVP simples | Not Applicable |

## Exemplos

### Exemplo — sucesso (fluxo de dados autenticado)

```text
Frontend → Supabase Client → PostgreSQL + RLS   (lista de produtos da empresa atual)
Frontend → Edge Function  → autorização server + negócio → PostgreSQL  (operação privilegiada)
```

### Exemplo — IA (cadastro assistido)

```text
Imagem/entrada → Edge Function → provider de IA → resultado + confiança → revisão humana → salvar
```

## Cenários de falha

| Cenário | Impacto | Comportamento esperado | Mitigação | Classificação |
| --- | --- | --- | --- | --- |
| Provider de IA indisponível | Funções de IA fora | Não bloqueia catálogo/estoque | Isolamento de falha | Confirmed (SDD) |
| Abuso do catálogo público | Custo/exposição | Rate limiting | Proteção anti-abuso | Confirmed (SDD) |
| Tentativa cross-tenant | Vazamento | Negado por RLS/autorização | Testes cross-tenant + IDOR/BOLA | Confirmed (SDD) |

## Componentes relacionados

| Componente | Relacionamento | Path / ID |
| --- | --- | --- |
| Frontend React | consumer | [architecture/overview.md](../architecture/overview.md) |
| Supabase (Database/Auth/Storage/Edge Functions) | producer | [architecture/overview.md](../architecture/overview.md) |
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