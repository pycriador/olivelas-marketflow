---
title: "MarketFlow — Segurança"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Segurança

> Language: pt-BR | [English](../../en/security/security.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md) e [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md). Documento de entrada da postura de segurança do MarketFlow (parcialmente implementado: protótipo de frontend + migrations com RLS).

**Regra final:** nunca confiar no cliente. O frontend melhora a experiência; o backend aplica regras de negócio; PostgreSQL/RLS garante isolamento de dados; Storage garante isolamento de arquivos; o sistema de autenticação garante identidade; a camada de API garante acesso máquina com tokens escopados; a auditoria garante rastreabilidade. Segurança em profundidade: Authn + Authz + Isolamento + RLS + Validação + Constraints + Rate limiting + Audit + Monitoramento — uma única camada nunca é suficiente.

## Escopo

| No escopo | Fora do escopo |
| --- | --- |
| Autenticação, autorização, isolamento multi-tenant, RLS | Segurança física / datacenter (managed) |
| Storage seguro, API (`/api/v1`, API Keys, webhooks), catálogo público | SIEM/EDR corporativos |
| IA (quota/prompt/saída não confiável), WhatsApp (privacidade/LGPD) | Auditoria externa / compliance formal |
| LGPD básica, auditoria, secrets | Criptografia customizada |
| Testes de segurança (cross-tenant, IDOR/BOLA) | |

## Ownership

| Papel | Owner |
| --- | --- |
| Segurança | marketflow-team |
| Sistema / técnico | marketflow-team |
| Dados | marketflow-team |
| Operacional / incidente | marketflow-team (a formalizar) |

## Ativos e classificação

| Ativo | Classificação | Owner | Notas |
| --- | --- | --- | --- |
| Dados dos clientes (produtos, estoque, preços) | Sensível | marketflow-team | RLS por empresa |
| `cost_price` / margem | Restrito | marketflow-team | Nunca no catálogo público |
| Credenciais / sessões | Crítico | Supabase (managed) | Auth gerenciada |
| API Keys (`secret_hash`) | Crítico | marketflow-team | Hash em repouso; exibidas uma vez; scopes |
| Secrets de webhooks | Crítico | marketflow-team | Por endpoint; assinam entregas |
| Imagens/logos | Sensível | marketflow-team | Storage isolado por empresa |
| Dados pessoais (LGPD) | Sensível | marketflow-team | Mínimo necessário; fluxos a documentar |
| Recursos de IA | Precioso (custo) | marketflow-team | Quota + rate limit |

## Modelo de ameaças

Fonte: inicial `sdd/08-SECURITY.md` + `sdd/12-EXTRAS.md`.

| Ameaça | Ativo afetado | Probabilidade | Impacto | Mitigação | Classificação |
| --- | --- | --- | --- | --- | --- |
| Cross-tenant access | Dados clientes | Medium | Critical | RLS + authorization | Confirmed (SDD) |
| IDOR/BOLA | Dados clientes | High | Critical | Object-level authorization | Confirmed (SDD) |
| Privilege escalation | Roles | Medium | Critical | Server-side RBAC; sem autoelevação | Confirmed (SDD) |
| Credential theft | Contas | Medium | Critical | Supabase Auth + sessões seguras | Confirmed (SDD) |
| **Roubo de API Key** | Dados de API | Medium | Critical | Armazenamento só-hash; scopes; revogação/rotação | Confirmed (SDD) |
| **Falsificação/replay de webhook** | Integrações | Medium | High | Entregas assinadas; eventos idempotentes; retries | Confirmed (SDD) |
| API abuse | API | Medium | High | Rate limiting por categoria | Confirmed (SDD) |
| AI abuse | Recursos de IA | Medium | High | Quotas + limits + usage logs | Confirmed (SDD) |
| Prompt injection | IA | Medium | High | Saída estruturada + validação; tratar saída da IA como UNTRUSTED DATA | Confirmed (SDD) |
| Data leakage | Dados | Low | Critical | Field filtering | Confirmed (SDD) |
| Malicious upload | Storage | Medium | High | Validação + Storage policies | Confirmed (SDD) |
| SQL Injection | Banco | Low | Critical | Query parameterizada | Confirmed (SDD) |
| XSS | Frontend | Low | High | Escaping + sanitização | Confirmed (SDD) |
| Spam catalog | Catálogo | Medium | Medium | Rate limiting | Confirmed (SDD) |
| Inventory manipulation | Estoque | Medium | High | Transações + permissões + auditoria | Confirmed (SDD) |
| Secret exposure | Secrets | Low | Critical | Secrets em ambiente; nunca em código; keys com hash | Confirmed (SDD) |
| Dependency vulnerability | Stack | High | High | Scanning + updates (P1) | Confirmed (SDD) |
| Data loss | Dados | Low | Critical | Backups + recovery (P1) | Confirmed (SDD) |

## Riscos

| Risco | Severidade | Residual | Status | Classificação |
| --- | --- | --- | --- | --- |
| Vazamento cross-tenant | Critical | — (RLS habilitado, políticas parciais) | mitigated por design (RLS) | Proposed |
| Exposição de secrets/keys | Critical | — | open (depende de disciplina) | Proposed |
| Abuso de IA (custo financeiro) | High | — | mitigated por design (quota) | Proposed |
| Dependência de supplier gerenciado | Medium | — | accepted | Proposed |

## Fronteiras de confiança

Fonte: modelo de fronteira em `sdd/08-SECURITY.md`.

| Fronteira | Dentro | Fora | Controles |
| --- | --- | --- | --- |
| Anonymous User | — | visitante/conteúdo público | Rate limit; somente publicados |
| Authenticated User | sessão válida | dados de outras empresas | Supabase Auth |
| Consumidor de API Key | token + empresa + scope | outros tenants/scopes | Hash store; validação de scope |
| Company Member | tenant atual | outros tenants | RLS `company_id` |
| Role / Permission (ou Scope) | ações do papel/scope | ações fora | RBAC server-side + scopes |
| Backend / RLS | enforcement confiável | client claims | RLS + Edge Functions |
| Database | fonte da verdade | — | Constraints + RLS |

Nenhuma camada deve assumir que a camada anterior é suficiente.

## Identidade e acesso

### Autenticação

| Ponto de entrada | Mecanismo | Classificação |
| --- | --- | --- |
| Login/cadastro | Supabase Auth — email+senha, Google OAuth (MVP) | Confirmed (SDD) |
| Acesso máquina | API Keys (`mf_live_`/`mf_test_`; hash; por empresa; scopes) | Confirmed (SDD) — ADR-008 |
| Futuro | Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Proposed |

Detalhes: [authentication.md](authentication.md).

### Autorização

| Ação / recurso | Quem tem permissão | Mecanismo | Classificação |
| --- | --- | --- | --- |
| Ações de estoque/produto | Papéis por empresa | RBAC no `CompanyUser.role` | Confirmed (SDD) |
| Operações de API | API Keys com os scopes necessários | Token + empresa + scope | Confirmed (SDD) — ADR-008 |
| Acesso a dados | Membros da empresa | RLS por `company_id` | Confirmed (SDD) |
| Catálogo público | Todos (itens publicados) | Leitura pública filtrada | Confirmed (SDD) |

Detalhes: [authorization.md](authorization.md).

## Secrets

| Nome | Propósito | Fonte | Obrigatório |
| --- | --- | --- | --- |
| Service Role Key (Supabase) | Admin/privilegiado | Ambiente (backend/Edge Functions) | yes |
| Keys do provider de IA | Chamadas de IA | Ambiente | yes |
| Credenciais do WhatsApp Provider | Entrega de mensagens | Ambiente | yes |
| Secrets de webhooks | Assinam entregas outbound | Por endpoint (gerado) | yes |
| Keys OAuth (Google) | Google OAuth config | Ambiente/Supabase | yes |

Sem valores secretos aqui — referências apenas. Nunca expor Service Role Key nem adicionar secrets no código.

## Criptografia e proteção de dados

| Dado / canal | Em repouso | Em trânsito | Classificação |
| --- | --- | --- | --- |
| Dados Postgres | managed (at-rest padrão do provider) | HTTPS/TLS | Inferred |
| Imagens/Storage | managed | HTTPS/TLS | Inferred |
| Sessões/tokens | — | HTTPS | Confirmed (SDD) |
| API Keys | hash (`secret_hash`) | HTTPS | Confirmed (SDD) |

| Classe de dado | Regras de tratamento | Retenção | Classificação |
| --- | --- | --- | --- |
| Dados pessoais (LGPD) | Mínimo necessário; fluxos a documentar | A definir | Proposed |
| `cost_price`/margem | Nunca no catálogo público | Persistente | Confirmed (SDD) |
| Mensagens WhatsApp | Minimização de dados; finalidade; tratamento seguro | Retenção adequada (LGPD) | Confirmed (SDD) |

## Rede e exposição

| Controle | Propósito | Classificação |
| --- | --- | --- |
| Rate limiting (catálogo público, IA, API v1, webhooks) | Anti-abuso | Confirmed (SDD) |
| HTTPS | Segurança em trânsito | Confirmed (SDD) |

| Superfície | Exposição | Notas |
| --- | --- | --- |
| App (frontend) | Exposed | autenticado |
| Catálogo público | Exposed | somente leitura, filtrado |
| `/api/v1` | Exposed | API Key + scopes + rate limits |
| Edge Functions | Internal (via app/API) | autorização server-side |

## Controles e requisitos

| Requisito | Controle | Tipo | Evidência |
| --- | --- | --- | --- |
| Isolamento multi-tenant | RLS + `company_id` | Preventive | `sdd/02-DATABASE`, `sdd/08-SECURITY` |
| Autorização server-side | RBAC + scopes + Edge Functions | Preventive | `sdd/08-SECURITY`, `sdd/12-EXTRAS` |
| Segurança de API Keys | Hash storage; validação de scope; revogação | Preventive | `sdd/12-EXTRAS` |
| Auditoria de operações críticas | Audit logs + `api_request_logs` | Detective | `sdd/08-SECURITY`, `sdd/12-EXTRAS` |
| Saída de IA não confiável | Confiança + revisão humana; nunca executar saída | Preventive | `sdd/12-EXTRAS` |
| Proteção de estoque/histórico | Movimentações imutáveis + permissões | Preventive | `sdd/08-SECURITY` |

## Auditabilidade e logging

| Evento | Registrado? | Onde | Classificação |
| --- | --- | --- | --- |
| Operações críticas de estoque | Sim (planejado) | Audit logs | Proposed |
| Eventos de autenticação | Sim (managed) | Supabase Auth | Confirmed (SDD) |
| Uso de IA | Sim (planejado/tabela) | `ai_usage_logs` | Proposed |
| Requests de API | Sim (tabela) | `api_request_logs` | Implementado (schema) |
| Entregas de webhook | Sim (tabela) | `webhook_deliveries` | Implementado (schema) |
| Logs sanitizados (sem secrets/PII) | Sim (planejado) | Logging | Proposed |

## Monitoramento e incidentes

| Sinal | Propósito de segurança | Ação |
| --- | --- | --- |
| Rate limit excedido (catálogo/API/IA) | Abuso | Alertar/bloquear |
| Erros de RLS/autorização | Ataque/incompatibilidade de policy | Investigar |
| Quota de IA | Custo/abuso | Alertar |
| Uso de key revogada/vencida | Abuso | Alertar |

| Tópico | Link / notas |
| --- | --- |
| Monitoramento de segurança | P1 — `sdd/08-SECURITY.md` |
| Incidentes de segurança | processo a documentar (Detect→Contain→Investigate→Eradicate→Recover→Post-Incident) |
| Vulnerabilidades | dependency scanning (P1) |
| Exceções | a definir |

## Dependências e supply chain

| Dependência | Notas de confiança / privilégio | Owner |
| --- | --- | --- |
| Supabase (Auth/Postgres/Storage/Functions) | Backend gerenciado — privilégio alto | marketflow-team |
| Lovable Cloud | Hospedagem frontend | marketflow-team |
| Providers de IA | Acesso a dados de imagem; custo | marketflow-team |
| WhatsApp Provider | Dados de contato do cliente; entregabilidade | marketflow-team |
| Bibliotecas npm (React, shadcn/ui, TanStack, Zod…) | Supply chain — scanning (P1) | marketflow-team |

## Testes e prontidão

| Estratégia | Em uso? | Última execução |
| --- | --- | --- |
| Cross-tenant tests | Planejado (P0/MVP) | — |
| IDOR/BOLA tests | Planejado (P0/MVP) | — |
| Role tests | Planejado (P0/MVP) | — |
| API scope tests | Planejado (P0/MVP) | — |
| Dependency scanning | P1 | — |

| Resultado de prontidão | Parcial — não pronto para produção |
| --- | --- |
| Notas | Trabalho pendente: políticas RLS completas, triggers/functions, tabelas SDD, enforcement no backend. Critérios de aceitação do MVP em `sdd/08-SECURITY.md` |

## Débito de segurança e drift

| ID | Descrição | Prioridade | Status |
| --- | --- | --- | --- |
| SEC-001 | Testes cross-tenant/IDOR/BOLA não implementados | High | Open |
| SEC-002 | Monitoring/alerts de segurança (P1) não implementados | Medium | Open |
| SEC-003 | LGPD procedures/retention não documentados | Medium | Open |
| SEC-004 | Incident response não documentado | Medium | Open |
| SEC-005 | Políticas RLS definidas apenas para 6 de 19 tabelas (demais negam por padrão) | High | Open |

## Recomendações de segurança

| Recomendação | Prioridade | Classificação |
| --- | --- | --- |
| Completar políticas RLS de todas as tabelas de negócio | Critical | Proposed |
| Serviços: nunca confiar em `company_id`/`user_id`/permissões do cliente | Critical | Proposed |
| API Keys: hash storage + menor privilégio de scope + rotação | Critical | Proposed |
| Quota + rate limit de IA desde o MVP; tratar saída como UNTRUSTED DATA | High | Proposed |
| Validação e storage policies para uploads | High | Proposed |
| Audit logs para operações críticas | High | Proposed |
| Sessões seguras; logout/troca de empresa sem vazamento de cache | High | Proposed |

## Documentação relacionada

| Documento | Path |
| --- | --- |
| Autenticação | [authentication.md](authentication.md) |
| Autorização | [authorization.md](authorization.md) |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Contratos (seções de segurança) | [contracts/api.md](../contracts/api.md) |
| ADRs | [decisions/README.md](../decisions/README.md) |
| Fonte completa | [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md), [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |