---
title: "MarketFlow — Visão Geral do Projeto"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Visão Geral do Projeto

> Language: pt-BR | [English](../en/project-overview.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/00-VISION.md`](../../sdd/00-VISION.md) e [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md).

## Propósito

O MarketFlow é uma plataforma SaaS que ajuda pequenos comércios a organizar produtos, preços, estoque e catálogo, com recursos de IA para reduzir trabalho manual. Versão-alvo: MVP (1.0.0).

## Problema

Pequenos comércios (mercadinhos, mercearias, minimercados, hortifrútis, adegas e lojas de conveniência) gerenciam produtos, preços e estoque de forma manual, sem uma ferramenta simples. Sistemas complexos (ERP) são caros e desnecessários para esse público.

## Escopo

| No escopo | Notas |
| --- | --- |
| Gestão de produtos (CRUD, imagens, categorias, marcas, fabricantes, fornecedores) | Produto pertence a uma empresa |
| Estoque e lotes/validade | Movimentações com histórico imutável |
| Multiempresa (multi-tenant) e multiusuário desde a v1 | Isolamento por `company_id` + RLS |
| Autenticação e RBAC | Supabase Auth; papéis por vínculo usuário+empresa |
| Catálogo público por empresa | Vitrine pública sem login; slug da empresa |
| IA para cadastro de produto (foto → dados + confiança → revisão humana) | OCR, sugestão de nome/categoria/marca |
| Landing page, dashboard e onboarding | UX mobile-first, PT-BR como idioma principal |
| Relatórios simples (produtos, estoque, validade, movimentações) | Sem transformar o MVP em ERP |
| Monetização futura (Free First) preparada na arquitetura | Limites configuráveis no backend |

## Não-objetivos

| Não-objetivo | Justificativa |
| --- | --- |
| PDV (ponto de venda) | Fora do escopo do MVP; futuro separado |
| Financeiro, contabilidade, fiscal | Não virar ERP no MVP |
| CRM completo e e-commerce completo | Futuro, com decisão explícita |
| API pública para terceiros | Futuro (`P3`) |
| Pagamentos online (gateway) no MVP | Billing fica para etapa posterior; apenas abstração |
| Migração de sistema legado | Não previsto |

## Usuários / consumidores

| Usuário / consumidor | Necessidade |
| --- | --- |
| Dono de pequeno comércio | Cadastrar produtos, controlar estoque, precificar e publicar catálogo |
| Funcionário (estoque) | Registrar entradas/saídas, ajustes e validade |
| Visitante do catálogo público | Visualizar produtos publicados e solicitar contato |
| Global Admin da plataforma | Gerenciar a plataforma (escopo global) |

## Arquitetura

- Visão geral: SaaS multi-tenant · frontend React + backend gerenciado (Supabase: Auth, PostgreSQL, Storage, Edge Functions) hospedado em Lovable Cloud. Sem backend independente no MVP.
- Detalhes: [architecture/overview.md](architecture/overview.md)
- Modelo de dados: [architecture/data-model.md](architecture/data-model.md)

## Componentes

| Componente | Responsabilidade | Documentação |
| --- | --- | --- |
| Frontend (React/TS/Vite/shadcn/ui) | UI, estado, validação no cliente, navegação | [architecture/overview.md](architecture/overview.md) |
| Supabase Auth | Autenticação (email+senha, Google OAuth), sessões | [security/authentication.md](security/authentication.md) |
| PostgreSQL | Fonte da verdade; isolamento por RLS | [architecture/data-model.md](architecture/data-model.md) |
| Supabase Storage | Imagens de produtos e logos, isoladas por empresa | [security/security.md](security/security.md) |
| Edge Functions | IA, integrações externas, operações privilegiadas, assíncronas | [contracts/api.md](contracts/api.md) |
| Catálogo público | Vitrine pública por slug da empresa | [contracts/api.md](contracts/api.md), `sdd/10-FULL-SYSTEM.md` § 22-PUBLIC_STORE |

## Dependências

| Dependência | Tipo | Propósito | Classificação |
| --- | --- | --- | --- |
| React + TypeScript | runtime | UI do produto | Confirmed (SDD) |
| Vite | build | Bundling e dev server | Confirmed (SDD) |
| Tailwind CSS + shadcn/ui + Radix UI | runtime | Design system e componentes acessíveis | Confirmed (SDD) |
| React Hook Form + Zod | runtime | Formulários e validação | Confirmed (SDD) |
| TanStack Query + Router | runtime | Dados do servidor e navegação | Confirmed (SDD) |
| Supabase (Auth/PostgreSQL/Storage/Edge Functions) | external | Backend gerenciado | Confirmed (SDD) |
| Lovable Cloud | external | Hospedagem do frontend | Confirmed (SDD) |
| Provider de IA (a definir) | external | Reconhecimento/OCR de produtos | Inferred (a decidir) |

## Integrações

| Integração | Direção | Contrato | Documentação |
| --- | --- | --- | --- |
| Supabase Auth | bidirectional | [contracts/api.md](contracts/api.md) | [security/authentication.md](security/authentication.md) |
| Edge Functions (IA) | outbound | Sob decisão | [contracts/api.md](contracts/api.md) |
| Catálogo público | outbound | `GET` público por slug | [contracts/api.md](contracts/api.md) |
| Google OAuth | external | OAuth 2.0 | [security/authentication.md](security/authentication.md) |
| E-mail / WhatsApp / Push | future | — | Não implementado no MVP |

## Segurança

- Limites de confiança: `Anonymous → Authenticated → Company Member → Role/Permission → Backend/RLS → Database`. Nenhuma camada assume que a anterior é suficiente.
- Authn / Authz: Supabase Auth; RBAC server-side com papel em `CompanyUser.role`; RLS no Postgres.
- Regra final: **nunca confiar no cliente**. Detalhes: [security/security.md](security/security.md).

## Observabilidade

| Tipo de sinal | Status |
| --- | --- |
| Logging | Not Documented (planejado para P1) |
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
| local | Desenvolvimento/testes | a definir |

## Limitações conhecidas

| Limitação | Impacto | Classificação |
| --- | --- | --- |
| backend sem API pública para terceiros no MVP | Integrações externas limitadas | Confirmed (SDD) |
| Pagamentos não implementados no MVP | Monetização apenas via limites de plano | Confirmed (SDD) |
| Sem relatórios avançados/exportação no MVP | Relatórios simples apenas | Confirmed (SDD) |
| Notificações apenas in-app no MVP | E-mail/WhatsApp/push são futuro | Confirmed (SDD) |

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Arquitetura | [architecture/overview.md](architecture/overview.md) |
| Modelo de dados | [architecture/data-model.md](architecture/data-model.md) |
| Segurança | [security/security.md](security/security.md) |
| Contratos | [contracts/api.md](contracts/api.md) |
| Roadmap | [roadmap.md](roadmap.md) |
| Decisions | [decisions/README.md](decisions/README.md) |
| Checklist MVP/segurança | `sdd/08-SECURITY.md`, `sdd/06-ROADMAP.md` |