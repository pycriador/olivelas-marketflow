---
title: "MarketFlow — Visão Geral do Projeto"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Visão Geral do Projeto

> Language: pt-BR | [English](../en/project-overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/00-VISION.md`](../../sdd/00-VISION.md), [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md), [`sdd/11-EXTRAS.md`](../../sdd/11-EXTRAS.md) e [`sdd/12-EXTRAS.md`](../../sdd/12-EXTRAS.md).

## Propósito

O MarketFlow é uma plataforma SaaS que ajuda pequenos comércios a organizar produtos, preços, estoque e catálogo, com recursos de IA para reduzir trabalho manual, superfície API-first para integrações e mensagens WhatsApp com templates por empresa. Versão-alvo: MVP (1.0.0).

## Problema

Pequenos comércios (mercadinhos, mercearias, minimercados, hortifrútis, adegas e lojas de conveniência) gerenciam produtos, preços e estoque de forma manual, sem uma ferramenta simples. Sistemas complexos (ERP) são caros e desnecessários para esse público.

## Escopo

| No escopo | Notas |
| --- | --- |
| Gestão de produtos (CRUD, imagens, categorias, marcas, fabricantes, fornecedores) | Produto pertence a uma empresa |
| Estoque e lotes/validade | Movimentações com histórico imutável |
| Multiempresa (multi-tenant) e multiusuário desde a v1 | Isolamento por `company_id` + RLS |
| Autenticação e RBAC | Supabase Auth; papéis por vínculo usuário+empresa |
| IAM/Área de desenvolvedores (API Keys, webhooks, docs, logs) | Tokens com scopes (`mf_live_`/`mf_test_`) |
| Catálogo público por empresa | Vitrine pública sem login; slug da empresa |
| IA para cadastro de produto (foto → dados + confiança → revisão humana) | OCR, sugestão de nome/categoria/marca; abstração de providers |
| Mensagens WhatsApp com templates por empresa | Variáveis, preview, histórico e retry |
| 20 temas visuais (10 light / 10 dark) e 3 idiomas (pt-BR/EN/ES) | Camada UX; persistidos por usuário |
| Landing page, dashboard e onboarding | UX mobile-first, PT-BR como idioma principal |
| Relatórios simples (produtos, estoque, validade, movimentações) | Sem transformar o MVP em ERP |
| Monetização futura (Free First) preparada na arquitetura | Limites configuráveis no backend |

## Não-objetivos

| Não-objetivo | Justificativa |
| --- | --- |
| PDV (ponto de venda) | Fora do escopo do MVP; futuro separado |
| Financeiro, contabilidade, fiscal | Não virar ERP no MVP |
| CRM completo e e-commerce completo | Futuro, com decisão explícita |
| Acesso direto de terceiros ao banco | Acesso apenas via produto ou API versionada |
| Pagamentos online (gateway) no MVP | Billing fica para etapa posterior; apenas abstração |
| Migração de sistema legado | Não previsto |

## Usuários / consumidores

| Usuário / consumidor | Necessidade |
| --- | --- |
| Dono de pequeno comércio | Cadastrar produtos, controlar estoque, precificar, publicar catálogo, gerir templates WhatsApp |
| Funcionário (estoque) | Registrar entradas/saídas, ajustes e validade |
| Visitante do catálogo público | Visualizar produtos publicados e solicitar contato (CTA WhatsApp) |
| Desenvolvedor / integrador | API Keys, scopes, docs OpenAPI, webhooks |
| Global Admin da plataforma | Gerenciar a plataforma (escopo global) |

## Arquitetura

- Visão geral: SaaS multi-tenant · frontend React + backend gerenciado (Supabase: Auth, PostgreSQL, Storage, Edge Functions) hospedado em Lovable Cloud. Sem backend independente no MVP; superfície API-first (`/api/v1`) definida para a camada de backend ([ADR-008](decisions/adr-008-api-first-and-api-keys.md)).
- Detalhes: [architecture/overview.md](architecture/overview.md)
- Modelo de dados: [architecture/data-model.md](architecture/data-model.md)

## Componentes

| Componente | Responsabilidade | Documentação |
| --- | --- | --- |
| Frontend (React/TS/Vite/shadcn/ui) | UI, estado, validação no cliente, navegação, temas & i18n | [architecture/overview.md](architecture/overview.md) |
| Supabase Auth | Autenticação (email+senha, Google OAuth), sessões | [security/authentication.md](security/authentication.md) |
| PostgreSQL | Fonte da verdade; isolamento por RLS | [architecture/data-model.md](architecture/data-model.md) |
| Supabase Storage | Imagens de produtos e logos, isoladas por empresa | [security/security.md](security/security.md) |
| Edge Functions | AI Service, WhatsApp, camada de API, webhooks, ops privilegiadas | [contracts/api.md](contracts/api.md) |
| Catálogo público | Vitrine pública por slug da empresa; CTA WhatsApp | [contracts/api.md](contracts/api.md), `sdd/10-FULL-SYSTEM.md` § 22-PUBLIC_STORE |
| Camada de API (`/api/v1`, `/public/v1`) | REST versionada + API Keys + scopes + OpenAPI | [contracts/api.md](contracts/api.md) |

## Dependências

| Dependência | Tipo | Propósito | Classificação |
| --- | --- | --- | --- |
| React + TypeScript | runtime | UI do produto | Confirmed (SDD); implementado (protótipo) |
| Vite | build | Bundling e dev server | Confirmed (SDD); implementado |
| Tailwind CSS + shadcn/ui + Radix UI | runtime | Design system e componentes acessíveis | Confirmed (SDD); implementado |
| React Hook Form + Zod | runtime | Formulários e validação | Confirmed (SDD); implementado |
| TanStack Query + Router | runtime | Dados do servidor e navegação | Confirmed (SDD) |
| Supabase (Auth/PostgreSQL/Storage/Edge Functions) | external | Backend gerenciado | Confirmed (SDD) |
| Lovable Cloud | external | Hospedagem do frontend | Confirmed (SDD) |
| Providers de IA (OpenAI/Gemini/Anthropic) | external | Reconhecimento/OCR via abstração do AI Service; adapter mock no protótipo | Confirmed (SDD); reais pendentes |
| WhatsApp Provider | external | Entrega de mensagens via abstração do WhatsApp Service | Confirmed (SDD); provider pendente |

## Integrações

| Integração | Direção | Contrato | Documentação |
| --- | --- | --- | --- |
| Supabase Auth | bidirectional | [contracts/api.md](contracts/api.md) | [security/authentication.md](security/authentication.md) |
| Edge Functions (IA, WhatsApp, API) | outbound | [contracts/api.md](contracts/api.md) | [architecture/overview.md](architecture/overview.md) |
| Catálogo público | outbound | `GET` público por slug | [contracts/api.md](contracts/api.md) |
| Providers de IA | external | Abstração do AI Service (mock no protótipo) | ADR-009 |
| WhatsApp Provider | external | Abstração do WhatsApp Service (templates no protótipo) | ADR-010 |
| Webhooks (outbound) | external | Assinados, com retry, idempotentes | [contracts/api.md](contracts/api.md) |
| Google OAuth | external | OAuth 2.0 | [security/authentication.md](security/authentication.md) |

## Segurança

- Limites de confiança: `Anonymous → Authenticated → Company Member → Role/Permission → Backend/RLS → Database`. Nenhuma camada assume que a anterior é suficiente.
- Authn / Authz: Supabase Auth; RBAC server-side com papel em `CompanyUser.role`; RLS no Postgres; API Keys adicionam um segundo eixo de autorização (token + empresa + scopes).
- Regra final: **nunca confiar no cliente**. Detalhes: [security/security.md](security/security.md).

## Observabilidade

| Tipo de sinal | Status |
| --- | --- |
| Logging | Not Documented (planejado para P1; tabelas de schema existem para request/usage logs) |
| Metrics | Not Documented (planejado para P1) |
| Tracing | Not Applicable no MVP simples |

Detalhes: não documentado — observar [roadmap.md](roadmap.md) (P1).

## Operações

| Cenário | Runbook |
| --- | --- |
| Backup / recovery | Não documentado ainda (P1) |
| Incidente de segurança | Não documentado ainda (`sdd/08-SECURITY` define o processo futuro) |

## Ambientes

| Ambiente | Propósito | Notas |
| --- | --- | --- |
| production | Uso real | hospedagem em Lovable Cloud + Supabase (a definir) |
| staging | Validação pré-release | a definir |
| local | Desenvolvimento/testes | Vite dev server; dados mock |

## Limitações conhecidas

| Limitação | Impacto | Classificação |
| --- | --- | --- |
| `src/` é um protótipo de frontend (mock/localStorage, roteamento interno por estado) | Não é um backend de produção | Confirmed (protótipo) |
| Camada de API especificada, não implementada como serviço | `/api/v1` descrito como contrato; frontend simula | Confirmed (SDD) |
| Migrations com RLS habilitado mas políticas parciais; sem triggers/functions e sem tabelas dos SDDs (`plan_limits`, `catalog_*`, notifications) | Backend ainda incompleto | Confirmed (protótipo) |
| Pagamentos não implementados no MVP | Monetização apenas via limites de plano | Confirmed (SDD) |
| Sem relatórios avançados/exportação no MVP | Relatórios simples apenas | Confirmed (SDD) |
| Notificações apenas in-app no MVP | E-mail/push são futuro; templates WhatsApp no escopo | Confirmed (SDD) |

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Arquitetura | [architecture/overview.md](architecture/overview.md) |
| Modelo de dados | [architecture/data-model.md](architecture/data-model.md) |
| Segurança | [security/security.md](security/security.md) |
| Contratos | [contracts/api.md](contracts/api.md) |
| Roadmap | [roadmap.md](roadmap.md) |
| Decisions | [decisions/README.md](decisions/README.md) |
| Checklist MVP/segurança | `sdd/08-SECURITY.md`, `sdd/06-ROADMAP.md`, `sdd/11-EXTRAS.md`, `sdd/12-EXTRAS.md` |