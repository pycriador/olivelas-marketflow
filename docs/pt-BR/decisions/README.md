---
title: "MarketFlow — Decisões de Arquitetura (ADR)"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Decisões de Arquitetura (ADR)

> Language: pt-BR | [English](../../en/decisions/README.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Índice das decisões de arquitetura do MarketFlow. Cada ADR segue o template `adr.md` do Documentation Standard (biblioteca externa): o `status` do frontmatter é o ciclo de vida do documento; a seção `## Status` é o status da decisão — são independentes.

## ADRs

| ADR | Decisão | Status da decisão | Mapeado de |
| --- | --- | --- | --- |
| [ADR-001](adr-001-cloud-stack.md) | Cloud stack: Supabase + Lovable Cloud; sem backend independente no MVP | Accepted | `sdd/01-FOUNDATION.md` |
| [ADR-002](adr-002-frontend-stack.md) | Frontend: React + TypeScript + Vite + shadcn/ui | Accepted | `sdd/01-FOUNDATION.md` |
| [ADR-003](adr-003-multi-tenant-isolation.md) | Isolamento multi-tenant por `company_id` + RLS | Accepted | `sdd/02-DATABASE.md` |
| [ADR-004](adr-004-rbac-roles.md) | Papéis RBAC; autorização server-side; papel em `CompanyUser.role` | Accepted | `sdd/04-PERMISSIONS.md` |
| [ADR-005](adr-005-auth-providers.md) | Providers de autenticação (email+senha, Google OAuth; MFA futuro) | Accepted | `sdd/03-AUTH.md` |
| [ADR-006](adr-006-monetization-free-first.md) | Monetização Free First; limites no backend; billing por empresa | Accepted | `sdd/07-MONETIZATION.md` |
| [ADR-007](adr-007-design-system.md) | Design system: shadcn/ui, Content First | Accepted | `sdd/09-DESIGN_SYSTEM.md` |

## Como decidir uma nova ADR

1. Leia a documentação relevante antes de alterar arquitetura.
2. Registre contexto, problema, decisão, alternativas e consequências.
3. Mantenha lifecycle `DRAFT` até revisão; a seção `## Status` reflete a situação da decisão.

## Documentação relacionada

| Documento | Localização |
| --- | --- |
| Arquitetura | [architecture/overview.md](../architecture/overview.md) |
| Template de ADR | `aiops-documentation/docs/pt-BR/templates/adr.md` (biblioteca externa) |
| Fonte | [`sdd/`](../../../sdd/) |