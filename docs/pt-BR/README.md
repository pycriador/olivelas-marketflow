---
title: "MarketFlow — Índice"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Índice

> Language: pt-BR | [English](../en/README.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Documentação do MarketFlow, plataforma SaaS para pequenos comércios organizarem produtos, preços, estoque e catálogo público, com recursos de IA.

## Ponto de partida

1. [Contexto de IA](ai-context.md) — ponto de entrada para agentes e prompts de IA.
2. [Visão geral do projeto](project-overview.md) — propósito, escopo e mapa do sistema.
3. [Roadmap](roadmap.md) — prioridades e evolução planejada.

## Documentos por categoria

| Documento | Descrição | Mapeado de |
| --- | --- | --- |
| [project-overview.md](project-overview.md) | Propósito, escopo, usuários, mapa do sistema | `sdd/00-VISION.md` |
| [roadmap.md](roadmap.md) | Prioridades, MVP e evolução incremental | `sdd/06-ROADMAP.md`, `sdd/10-FULL-SYSTEM.md` |
| [architecture/overview.md](architecture/overview.md) | Contexto, componentes, limites, dependências | `sdd/01-FOUNDATION.md` |
| [architecture/data-model.md](architecture/data-model.md) | Entidades centrais, isolamento multi-tenant | `sdd/02-DATABASE.md` |
| [contracts/api.md](contracts/api.md) | Superfície de acesso e contratos de API | `sdd/05-API.md` |
| [security/security.md](security/security.md) | Postura de segurança, ameaças, controles | `sdd/08-SECURITY.md` |
| [security/authentication.md](security/authentication.md) | Autenticação (Supabase Auth, providers) | `sdd/03-AUTH.md` |
| [security/authorization.md](security/authorization.md) | Autorização e RBAC | `sdd/04-PERMISSIONS.md` |
| [decisions/README.md](decisions/README.md) | ADRs — decisões de arquitetura | vários `sdd/*.md` |

## Decisões de arquitetura (ADRs)

| ADR | Decisão | Mapeado de |
| --- | --- | --- |
| [ADR-001](decisions/adr-001-cloud-stack.md) | Cloud stack: Supabase + Lovable Cloud | `sdd/01-FOUNDATION.md` |
| [ADR-002](decisions/adr-002-frontend-stack.md) | Frontend: React + TypeScript + Vite + shadcn/ui | `sdd/01-FOUNDATION.md` |
| [ADR-003](decisions/adr-003-multi-tenant-isolation.md) | Isolamento multi-tenant por `company_id` + RLS | `sdd/02-DATABASE.md` |
| [ADR-004](decisions/adr-004-rbac-roles.md) | Papéis RBAC e autorização server-side | `sdd/04-PERMISSIONS.md` |
| [ADR-005](decisions/adr-005-auth-providers.md) | Providers de autenticação do MVP | `sdd/03-AUTH.md` |
| [ADR-006](decisions/adr-006-monetization-free-first.md) | Monetização Free First com limites no backend | `sdd/07-MONETIZATION.md` |
| [ADR-007](decisions/adr-007-design-system.md) | Design system: shadcn/ui, Content First | `sdd/09-DESIGN_SYSTEM.md` |

## Regras de validação

- Todo documento exige frontmatter com `title`, `status`, `owner`, `updated`.
- `status` no frontmatter = ciclo de vida do documento (`DRAFT` até revisão; depois `ACCEPTED`).
- Em ADRs, a seção `## Status` = status da decisão; são independentes.
- IDs no manifesto seguem o padrão `^[A-Z][A-Z0-9]*(-[A-Z0-9]+)+$`.
- Regras de validação do padrão definidas no `validation-config.yaml` da biblioteca externa (`aiops-documentation/docs/validation-config.yaml`); manifesto local em [manifest.yaml](manifest.yaml).

## Documentação relacionada

| Documento | Localização |
| --- | --- |
| Fonte da verdade do produto | [`sdd/`](../../sdd/) |
| Documentation Standard v1.0 (biblioteca externa) | `aiops-documentation/docs/` |