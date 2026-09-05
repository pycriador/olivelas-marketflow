---
title: "MarketFlow — Segurança"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Segurança

> Language: pt-BR | [English](../../en/security/security.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md). Documento de entrada da postura de segurança do MarketFlow (estado proposto — não implementado).

**Regra final:** nunca confiar no cliente. O frontend melhora a experiência; o backend aplica regras de negócio; PostgreSQL/RLS garante isolamento de dados; Storage garante isolamento de arquivos; o sistema de autenticação garante identidade; a auditoria garante rastreabilidade. Segurança em profundidade: Authn + Authz + Isolamento + RLS + Validação + Constraints + Rate limiting + Audit + Monitoramento — uma única camada nunca é suficiente.

## Escopo

| No escopo | Fora do escopo |
| --- | --- |
| Autenticação, autorização, isolamento multi-tenant, RLS | Segurança física / datacenter (managed) |
| Storage seguro, API/catálogo público, IA (quota/prompt) | SIEM/EDR corporativos |
| LGPD básica, auditoria, secrets | Auditoria externa / compliance formal |
| Testes de segurança (cross-tenant, IDOR/BOLA) | Criptografia customizada |

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
| Imagens/logos | Sensível | marketflow-team | Storage isolado por empresa |
| Dados pessoais (LGPD) | Sensível | marketflow-team | Mínimo necessário; fluxos a documentar |
| Recursos de IA | Precioso (custo) | marketflow-team | Quota + rate limit |

## Modelo de ameaças

Fonte: inicial `sdd/08-SECURITY.md`.

| Ameaça | Ativo afetado | Probabilidade | Impacto | Mitigação | Classificação |
| --- | --- | --- | --- | --- | --- |
| Cross-tenant access | Dados clientes | Medium | Critical | RLS + authorization | Confirmed (SDD) |
| IDOR/BOLA | Dados clientes | High | Critical | Object-level authorization | Confirmed (SDD) |
| Privilege escalation | Roles | Medium | Critical | Server-side RBAC | Confirmed (SDD) |
| Credential theft | Contas | Medium | Critical | Supabase Auth + sessões seguras | Confirmed (SDD) |
| API abuse | API | Medium | High | Rate limiting | Confirmed (SDD) |
| AI abuse | Recursos de IA | Medium | High | Quotas + limits | Confirmed (SDD) |
| Prompt injection | IA | Medium | High | Saída estruturada + validação; não executar instruções da saída | Confirmed (SDD) |
| Data leakage | Dados | Low | Critical | Field filtering | Confirmed (SDD) |
| Malicious upload | Storage | Medium | High | Validação + Storage policies | Confirmed (SDD) |
| SQL Injection | Banco | Low | Critical | Query parameterizada | Confirmed (SDD) |
| XSS | Frontend | Low | High | Escaping + sanitização | Confirmed (SDD) |
| Spam catalog | Catálogo | Medium | Medium | Rate limiting | Confirmed (SDD) |
| Inventory manipulation | Estoque | Medium | High | Transações + permissões + auditoria | Confirmed (SDD) |
| Secret exposure | Secrets | Low | Critical | Secrets em ambiente; nunca em código | Confirmed (SDD) |
| Dependency vulnerability | Stack | High | High | Scanning + updates (P1) | Confirmed (SDD) |
| Data loss | Dados | Low | Critical | Backups + recovery (P1) | Confirmed (SDD) |

## Riscos

| Risco | Severidade | Residual | Status | Classificação |
| --- | --- | --- | --- | --- |
| Vazamento cross-tenant | Critical | — (não implementado) | mitigated por design (RLS) | Proposed |
| Exposição de secrets | Critical | — | open (depende de disciplina) | Proposed |
| Abuso de IA (custo financeiro) | High | — | mitigated por design (quota) | Proposed |
| Dependência de supplier gerenciado | Medium | — | accepted | Proposed |

## Fronteiras de confiança

Fonte: modelo de fronteira em `sdd/08-SECURITY.md`.

| Fronteira | Dentro | Fora | Controles |
| --- | --- | --- | --- |
| Anonymous User | — | visitante/conteúdo público | Rate limit; somente publicados |
| Authenticated User | sessão válida | dados de outras empresas | Supabase Auth |
| Company Member | tenant atual | outros tenants | RLS `company_id` |
| Role / Permission | ações do papel | ações fora do papel | RBAC server-side |
| Backend / RLS | enforcement confiável | client claims | RLS + Edge Functions |
| Database | fonte da verdade | — | Constraints + RLS |

Nenhuma camada deve assumir que a camada anterior é suficiente.

## Identidade e acesso

### Autenticação

| Ponto de entrada | Mecanismo | Classificação |
| --- | --- | --- |
| Login/cadastro | Supabase Auth — email+senha, Google OAuth (MVP) | Confirmed (SDD) |
| Futuro | Microsoft, Apple, Magic Link, OIDC, SAML, MFA | Proposed |

Detalhes: [authentication.md](authentication.md).

### Autorização

| Ação / recurso | Quem tem permissão | Mecanismo | Classificação |
| --- | --- | --- | --- |
| Ações de estoque/produto | Papéis por empresa | RBAC no `CompanyUser.role` | Confirmed (SDD) |
| Acesso a dados | Membros da empresa | RLS por `company_id` | Confirmed (SDD) |
| Catálogo público | Todos (itens publicados) | Leitura pública filtrada | Confirmed (SDD) |

Detalhes: [authorization.md](authorization.md).

## Secrets

| Nome | Propósito | Fonte | Obrigatório |
| --- | --- | --- | --- |
| Service Role Key (Supabase) | Admin/privilegiado | Ambiente (backend/Edge Functions) | yes |
| Keys do provider de IA | Chamadas de IA | Ambiente | yes |
| Keys OAuth (Google) | Google OAuth config | Ambiente/Supabase | yes |

Sem valores secretos aqui — referências apenas. Nunca expor Service Role Key nem adicionar secrets no código.

## Criptografia e proteção de dados

| Dado / canal | Em repouso | Em trânsito | Classificação |
| --- | --- | --- | --- |
| Dados Postgres | managed (at-rest padrão do provider) | HTTPS/TLS | Inferred |
| Imagens/Storage | managed | HTTPS/TLS | Inferred |
| Sessões/tokens | — | HTTPS | Confirmed (SDD) |

| Classe de dado | Regras de tratamento | Retenção | Classificação |
| --- | --- | --- | --- |
| Dados pessoais (LGPD) | Mínimo necessário; fluxos a documentar | A definir | Proposed |
| `cost_price`/margem | Nunca no catálogo público | Persistente | Confirmed (SDD) |

## Rede e exposição

| Controle | Propósito | Classificação |
| --- | --- | --- |
| Rate limiting (catálogo público, IA, endpoints públicos) | Anti-abuso | Confirmed (SDD) |
| HTTPS | Segurança em trânsito | Confirmed (SDD) |

| Superfície | Exposição | Notas |
| --- | --- | --- |
| App (frontend) | Exposed | autenticado |
| Catálogo público | Exposed | somente leitura, filtrado |
| Edge Functions | Internal (via app) | autorização server-side |

## Controles e requisitos

| Requisito | Controle | Tipo | Evidência |
| --- | --- | --- | --- |
| Isolamento multi-tenant | RLS + `company_id` | Preventive | `sdd/02-DATABASE`, `sdd/08-SECURITY` |
| Autorização server-side | RBAC + Edge Functions | Preventive | `sdd/08-SECURITY` |
| Auditoria de operações críticas | Audit logs | Detective | `sdd/08-SECURITY` |
| Validação de entrada/saída | Validação + field filtering | Preventive | `sdd/08-SECURITY` |
| Proteção de estoque/histórico | Movimentações imutáveis + permissões | Preventive | `sdd/08-SECURITY` |

## Auditabilidade e logging

| Evento | Registrado? | Onde | Classificação |
| --- | --- | --- | --- |
| Operações críticas de estoque | Sim (planejado) | Audit logs | Proposed |
| Eventos de autenticação | Sim (managed) | Supabase Auth | Confirmed (SDD) |
| Uso de IA | Sim (planejado) | Audit logs | Proposed |
| Logs sanitizados (sem secrets/PII) | Sim (planejado) | Logging | Proposed |

## Monitoramento e incidentes

| Sinal | Propósito de segurança | Ação |
| --- | --- | --- |
| Rate limit excedido (catálogo/IA) | Abuso | Alertar/bloquear |
| Erros de RLS/autorização | Ataque/incompatibilidade de policy | Investigar |
| Quota de IA | Custo/abuso | Alertar |

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
| Provider de IA | Acesso a dados de imagem; custo | marketflow-team |
| Bibliotecas npm (React, shadcn/ui, TanStack, Zod…) | Supply chain — scanning (P1) | marketflow-team |

## Testes e prontidão

| Estratégia | Em uso? | Última execução |
| --- | --- | --- |
| Cross-tenant tests | Planejado (P0/MVP) | — |
| IDOR/BOLA tests | Planejado (P0/MVP) | — |
| Role tests | Planejado (P0/MVP) | — |
| Dependency scanning | P1 | — |

| Resultado de prontidão | Not ready (não implementado) |
| --- | --- |
| Notas | Estado proposto — critérios de aceitação do MVP em `sdd/08-SECURITY.md` |

## Débito de segurança e drift

| ID | Descrição | Prioridade | Status |
| --- | --- | --- | --- |
| SEC-001 | Testes cross-tenant/IDOR/BOLA não implementados | High | Open |
| SEC-002 | Monitoring/alerts de segurança (P1) não implementados | Medium | Open |
| SEC-003 | LGPD procedures/retention não documentados | Medium | Open |
| SEC-004 | Incident response não documentado | Medium | Open |

## Recomendações de segurança

| Recomendação | Prioridade | Classificação |
| --- | --- | --- |
| Implementar RLS + `company_id` desde o primeiro schema | Critical | Proposed |
| Serviços: nunca confiar em `company_id`/`user_id`/permissões do cliente | Critical | Proposed |
| Quota + rate limit de IA desde o MVP | High | Proposed |
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
| Fonte completa | [`sdd/08-SECURITY.md`](../../../sdd/08-SECURITY.md) |