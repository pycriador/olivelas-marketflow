---
title: "MarketFlow — Visão Geral de Arquitetura"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Visão Geral de Arquitetura

> Language: pt-BR | [English](../../en/architecture/overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/01-FOUNDATION.md`](../../../sdd/01-FOUNDATION.md), [`sdd/02-DATABASE.md`](../../../sdd/02-DATABASE.md), [`sdd/10-FULL-SYSTEM.md`](../../../sdd/10-FULL-SYSTEM.md), [`sdd/11-EXTRAS.md`](../../../sdd/11-EXTRAS.md) e [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md).

## Propósito

Descrever a arquitetura do MarketFlow: contexto, fronteiras, componentes principais, dependências e limites de falha/confiança. Estado atual de implementação: **protótipo de frontend** (`src/`, React/TS/Vite) mais **backend parcial** (`supabase/migrations/` com 19 tabelas e RLS habilitado). O alvo completo dos SDDs permanece proposto.

## Contexto

Usuários (donos de pequenos comércios, funcionários, visitantes, desenvolvedores) acessam o produto via navegador (mobile-first). O frontend conversa com o backend gerenciado Supabase (Auth, PostgreSQL, Storage, Edge Functions). Uma vitrine pública (catálogo) é servida por slug da empresa, sem login. Integrações e fluxos de IA/WhatsApp vêm de uma camada de serviços (AI Service, WhatsApp Service, camada de API).

## Sistema

| Campo | Valor |
| --- | --- |
| Nome | MarketFlow |
| Propósito | SaaS para organizar produtos, preços, estoque e catálogo com IA, superfície API-first e mensagens WhatsApp |
| Owner | marketflow-team |
| Resumo do limite | Frontend (Lovable Cloud) + Supabase (Auth/Postgres/Storage/Edge Functions); sem backend independente no MVP |

## Objetivos

| Objetivo | Notas |
| --- | --- |
| Multi-tenant e multiusuário desde v1 | `company_id` + RLS; papel por vínculo usuário+empresa |
| Segurança por padrão | Zero Trust; autorização server-side; nunca confiar no cliente |
| Mobile-first e responsivo | UX simples; PT-BR principal, pronto para EN/ES |
| Temas e idioma como camada UX | 20 temas (10 light/10 dark); pt-BR/EN/ES — nunca afetam dados/autorização |
| Simplicidade e escopo | Não virar ERP; evolução incremental (P0–P3) |
| IA como serviço auxiliar | IA não é fonte autoritativa; revisão humana obrigatória; abstração de providers |
| API First | REST versionada (`/api/v1`), API Keys com scopes, OpenAPI, webhooks |
| Preparação para monetização | Free First; limites configuráveis no backend |

## Não-objetivos

| Não-objetivo | Justificativa |
| --- | --- |
| Backend API independente no MVP | Backend gerenciado + camada de serviços é suficiente |
| Serviços em microserviços | Complexidade desnecessária no MVP |
| Funcionalidades P3 (PDV, financeiro) | Decisão explícita futura |

## Fronteira do sistema

| Dentro do sistema | Fora do sistema |
| --- | --- |
| Frontend React (UI, navegação, validação de formulário, temas, i18n) | Providers de IA (externos, via AI Service) |
| Supabase Auth (identidade) | Google (OAuth) |
| PostgreSQL + RLS (fonte da verdade) | Lovable Cloud (hospedagem do frontend) |
| Supabase Storage (arquivos) | WhatsApp Provider (externo, via WhatsApp Service) |
| Edge Functions (IA, WhatsApp, API, webhooks, ops privilegiadas) | Pagamentos/gateway (futuro) |
| Catálogo público (vitrine por slug) | E-mail/push (futuro) |
| Camada de API (`/api/v1`, `/public/v1`) | — |

## Visão geral da arquitetura

```mermaid
flowchart LR
  user[Usuário / Visitante] --> web[Frontend React<br>(Lovable Cloud)]
  web --> auth[Supabase Auth]
  web --> postgres[(PostgreSQL + RLS)]
  web --> storage[Supabase Storage]
  web --> edge[Edge Functions<br>IA / WhatsApp / API / webhooks]
  edge --> postgres
  edge --> aisvc[AI Service]
  aisvc --> ai[Providers de IA]
  edge --> wasvc[WhatsApp Service]
  wasvc --> wpp[WhatsApp Provider]
  dev[Desenvolvedor / integrador] --> api[API v1 / public v1<br>API Keys + scopes]
  api --> edge
  public[Visitante] --> catalog[Catálogo público por slug]
  catalog --> postgres
```

## Componentes principais

| Componente | Responsabilidade | Documentação |
| --- | --- | --- |
| Frontend (React/TS/Vite/Tailwind/shadcn/ui) | UI, estado, validação no cliente, navegação, temas, i18n | — |
| Supabase Auth | Identidade, sessões, providers (email+senha, Google) | [../security/authentication.md](../security/authentication.md) |
| PostgreSQL + RLS | Fonte da verdade; isolamento por `company_id` | [data-model.md](data-model.md) |
| Supabase Storage | Imagens de produtos e logos (isoladas por empresa) | — |
| AI Service (Edge Functions) | Abstração de providers: analisar imagem/produto, OCR, classificar; confiança; jobs/logs | [../contracts/api.md](../contracts/api.md) |
| WhatsApp Service (Edge Functions) | Abstração de provider: templates, variáveis, histórico, retry | [../contracts/api.md](../contracts/api.md) |
| Camada de API (Edge Functions) | `/api/v1` + `/public/v1`, API Keys + scopes, webhooks, OpenAPI | [../contracts/api.md](../contracts/api.md) |
| Catálogo público | Vitrine pública por slug; proteção contra abuso | [../contracts/api.md](../contracts/api.md) |

## Relacionamentos entre componentes

| De | Para | Relacionamento | Contrato |
| --- | --- | --- | --- |
| Frontend | Supabase (Database/Auth/Storage) | calls (sync) | [../contracts/api.md](../contracts/api.md) |
| Frontend | Edge Functions | calls (sync/async) | [../contracts/api.md](../contracts/api.md) |
| Consumidor de API Key | Camada de API | API Keys bearer + scopes | [../contracts/api.md](../contracts/api.md) |
| Edge Functions | PostgreSQL | depends on | interno |
| Edge Functions | Providers de IA | calls (outbound) | Abstração AI Service (ADR-009) |
| Edge Functions | WhatsApp Provider | calls (outbound) | Abstração WhatsApp Service (ADR-010) |
| Catálogo público | PostgreSQL | depends on | RLS / somente leitura pública |

## Fluxo de dados

1. Usuário autentica (email+senha ou Google OAuth) via Supabase Auth.
2. Frontend lê/escreve dados via Supabase Client com RLS aplicado por `company_id`.
3. Consumidores de integração autenticam com API Keys (`mf_live_`/`mf_test_`) e scopes contra `/api/v1`; todo request é rate-limite, logado e validado contra token + empresa + scope.
4. IA de cadastro: imagem/entrada → AI Service → resultado + confiança → revisão humana → salvar.
5. Solicitação do catálogo dispara mensagem WhatsApp via WhatsApp Service (template + variáveis) com rastreio de status/retry.
6. Webhooks entregam eventos a URLs configuradas (assinados, com retry, idempotentes).
7. Visitante acessa a vitrine pública do catálogo por slug; somente conteúdo publicado é exibido.

## Dependências

| Dependência | Propósito | Impacto da falha | Classificação |
| --- | --- | --- | --- |
| Supabase Auth | Identidade e sessões | Login indisponível | Confirmed (SDD) |
| PostgreSQL | Fonte da verdade | Produto indisponível | Confirmed (SDD) |
| Supabase Storage | Imagens/logo | Uploads e exibição de imagens falham | Confirmed (SDD) |
| Edge Functions | IA, WhatsApp, API, webhooks | Serviços indisponíveis | Confirmed (SDD) |
| Lovable Cloud | Hospedagem do frontend | Frontend indisponível | Confirmed (SDD) |
| Providers de IA | OCR/reconhecimento | Funcionalidades de IA indisponíveis (auxiliar) | Confirmed (SDD); reais pendentes |
| WhatsApp Provider | Mensagens | Funcionalidades WhatsApp indisponíveis | Confirmed (SDD); real pendente |

## Fronteiras de segurança

| Fronteira | O que é protegido | Resumo dos controles |
| --- | --- | --- |
| Borda pública (catálogo) | Conteúdo publicado; não expõe dados internos | Rate limiting; somente leitura; filtragem de campos |
| Borda de API (`/api/v1`) | Dados via tokens | Hash de API Keys; scopes; rate limiting; auditoria |
| Autenticação | Identidade do usuário | Supabase Auth; providers seguros; sessões |
| Autorização | Operações por usuário+empresa+papel (+ scopes de API) | RBAC server-side; `CompanyUser.role` |
| PostgreSQL/RLS | Isolamento de dados entre empresas | RLS por `company_id`; políticas por papel |
| Storage | Arquivos por empresa | Políticas por `company_id` |
| Edge Functions | Operações privilegiadas | Autorização server-side; quota de IA; auditoria |

Detalhes: [../security/security.md](../security/security.md).

## Domínios de falha

| Domínio | Inclui | Efeito da falha |
| --- | --- | --- |
| Identidade | Supabase Auth | Login/cadastro indisponível; sessões falham |
| Dados | PostgreSQL | Produto/estoque indisponíveis |
| Arquivos | Supabase Storage | Uploads/exibição de imagens falham |
| Funções de IA | Edge Functions + provider | Funcionalidades de IA indisponíveis (não bloqueiam catálogo/estoque) |
| Mensageria | WhatsApp Provider | Mensagens indisponíveis (não bloqueiam catálogo/estoque) |
| Frontend | Lovable Cloud | UI indisponível |

## Trade-offs

| Decisão / abordagem | Benefício | Custo |
| --- | --- | --- |
| Backend gerenciado (Supabase + Lovable Cloud) | Menos infra para operar; RLS nativo | Dependência de vendor; menos controle operacional |
| PostgreSQL compartilhado com isolamento lógico | Simples e barato para o MVP | Requer disciplina de RLS; migração futura não trivial |
| Sem backend independente no MVP | Menos complexidade e superfície de ataque | Limita operações customizadas ao Edge Functions |
| Abstração de serviços IA/WhatsApp | Portabilidade de provider; dev com mock | Camada adicional de manutenção |
| Catálogo público como vitrine por slug | Zero login para o visitante; simples | Precisa de rate limiting e proteção contra abuso |

## Restrições arquiteturais

| ID | Descrição | Fonte | Impacto | Current Status |
| --- | --- | --- | --- | --- |
| CON-001 | Isolamento multi-tenant obrigatório desde v1 (`company_id` + RLS) | `sdd/01-FOUNDATION.md`, `sdd/02-DATABASE.md` | Define o modelo de dados | Active (RLS habilitado; políticas parciais) |
| CON-002 | Autorização server-side; nunca autorizar somente no frontend | `sdd/08-SECURITY.md` | Remove role/policy da UI exclusivamente | Active |
| CON-003 | Sem backend API independente no MVP | `sdd/01-FOUNDATION.md` | Frontend + Supabase + Edge Functions | Active |
| CON-004 | IA não é fonte autoritativa; revisão humana obrigatória | `sdd/25-AI` (via `10-FULL-SYSTEM.md`) | Pipeline de IA com confiança e confirmação | Active |
| CON-005 | API Keys asseguram token+empresa+scope; nunca contornar camadas de segurança | `sdd/12-EXTRAS.md` | Autoriza acesso máquina-a-máquina | Active |

## Limitações conhecidas

| Limitação | Impacto | Classificação |
| --- | --- | --- |
| Protótipo de frontend (mock/localStorage, roteamento por state machine) | Não é um backend de produção | Confirmed (protótipo) |
| Migrations: RLS habilitado em 19 tabelas mas políticas apenas em algumas; sem triggers/functions; `catalog_requests` referenciada mas não criada; tabelas SDD pendentes (`plan_limits`, catálogo, notifications) | Backend incompleto | Confirmed (protótipo) |
| Dependência de vendor gerenciado | Migração de Supabase/Lovable Cloud é custosa | Inferred |

## Decisões relacionadas

| ADR | Título | Status |
| --- | --- | --- |
| ADR-001 | Cloud stack: Supabase + Lovable Cloud | Accepted |
| ADR-002 | Frontend: React + TypeScript + Vite + shadcn/ui | Accepted |
| ADR-003 | Isolamento multi-tenant por `company_id` + RLS | Accepted |
| ADR-005 | Providers de autenticação | Accepted |
| ADR-006 | Monetização Free First | Accepted |
| ADR-007 | Design system: shadcn/ui, Content First | Accepted |
| ADR-008 | API First: REST versionada + API Keys | Accepted |
| ADR-009 | AI Service: abstração de providers | Accepted |
| ADR-010 | WhatsApp Service e templates | Accepted |
| ADR-011 | 20 temas e i18n (pt-BR/EN/ES) | Accepted |

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Visão geral do projeto | [../project-overview.md](../project-overview.md) |
| Modelo de dados | [data-model.md](data-model.md) |
| Contratos | [../contracts/api.md](../contracts/api.md) |
| Segurança | [../security/security.md](../security/security.md) |
| Roadmap | [../roadmap.md](../roadmap.md) |
| Decisions | [../decisions/README.md](../decisions/README.md) |