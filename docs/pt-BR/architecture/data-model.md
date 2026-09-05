---
title: "MarketFlow — Modelo de Dados"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Modelo de Dados

> Language: pt-BR | [English](../../en/architecture/data-model.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/02-DATABASE.md`](../../../sdd/02-DATABASE.md) e entidades descritas em [`sdd/10-FULL-SYSTEM.md`](../../../sdd/10-FULL-SYSTEM.md) (PRODUCT, INVENTORY, LOTS, CATALOG, COMPANY, USERS, etc.).

## Purpose

O que o leitor aprende: esquema lógico do MarketFlow, entidades centrais, isolamento multi-tenant e preocupações transversais de dados. Visão lógica — não catálogo completo de colunas.

## Schemas / namespaces

| Schema / store | Purpose | Owner | Classification |
| --- | --- | --- | --- |
| `public` (PostgreSQL) | Dados do produto | marketflow-team | Proposed |
| Supabase Auth (schema `auth`) | Identidade/usuários | Supabase (managed) | Confirmed (SDD) |
| Supabase Storage (`storage.objects`) | Imagens/logos com metadados de tenant | Supabase (managed) | Confirmed (SDD) |

## Core entities

| Entity | Store | Responsibility | Classification |
| --- | --- | --- | --- |
| `companies` | PostgreSQL | Tenant principal; nome, CNPJ, slug único, status | Proposed |
| `users` | Supabase Auth (identidade) | Credenciais de login (sem papéis de negócio) | Proposed |
| `company_users` | PostgreSQL | Vínculo usuário–empresa; `role` (`GLOBAL_ADMIN`/`ADMIN`/`STOCK`/`VISITOR`) | Proposed |
| `categories` | PostgreSQL | Organização de produtos; hierarquia opcional | Proposed |
| `brands` | PostgreSQL | Marcas | Proposed |
| `manufacturers` | PostgreSQL | Fabricantes | Proposed |
| `suppliers` | PostgreSQL | Fornecedores | Proposed |
| `products` | PostgreSQL | Produtos (SKU/barcode único por empresa, unidade, preços, mínimo/máximo, imagens, visibilidade) | Proposed |
| `inventory_movements` | PostgreSQL | Movimentações imutáveis de estoque (entrada, saída, ajuste, perda, inventário); histórico | Proposed |
| `lots` | PostgreSQL | Lotes e validade; quantidade inicial/atual, custo, status de validade | Proposed |
| `catalog_*` | PostgreSQL | Configuração do catálogo e solicitações | Proposed |
| `plan_limits` / `usage` | PostgreSQL | Limites de plano e uso por empresa (billing/entitlements) | Proposed |
| `notifications` | PostgreSQL | Notificações in-app | Proposed |

## Relationships (high level)

```mermaid
flowchart LR
    Company["companies"] --> CU["company_users"]
    Users["users (Auth)"] --> CU
    Company --> Products["products"]
    Categories["categories"] --> Products
    Brands["brands"] --> Products
    Manufacturers["manufacturers"] --> Products
    Suppliers["suppliers"] --> Products
    Products --> Inv["inventory_movements"]
    Products --> Lots["lots"]
    Company --> Lots
    Company --> Catalog["catalog"]
    Company --> Plans["plan_limits / usage"]
```

## Isolamento multi-tenant

- **Estratégia:** banco PostgreSQL compartilhado com isolamento lógico.
- **Coluna obrigatória:** `company_id UUID NOT NULL` em todas as tabelas empresariais (`products`, `categories`, `brands`, `manufacturers`, `suppliers`, `products`, movimentações, lotes, catálogo etc.).
- **RLS:** Row Level Security habilitado; políticas por papel + `company_id`. Enunciado padrão: `company_id` não é fonte de confiança vinda do cliente — derivado da sessão/RLS.
- **Chaves primárias:** `UUID` via `gen_random_uuid()`; sem IDs sequenciais expostos publicamente.
- **Slug,** SKU/barcode, category hierarchy: unicidade validada **por empresa**.

## Cross-cutting data concerns

| Concern | Approach | Classification |
| --- | --- | --- |
| Multi-tenancy / isolation | `company_id UUID NOT NULL` + RLS em todas as tabelas empresariais | Proposed |
| Soft delete / archive | Categorias/substituições com exclusão lógica quando apropriado; movimentações **nunca** apagadas | Proposed |
| PII / retention | LGPD: fluxos de consentimento e retenção a documentar; mínimo necessário | Proposed |
| Encryption at rest (app-level) | Supabase/managed; sem criptografia custom no MVP | Inferred |

## Regras de integridade (resumo dos SDDs)

- Deduplicação de SKU/barcode **por empresa**; preços não podem ser negativos.
- Produto e estoque são conceitos separados; movimentações transacionais e imutáveis; correções geram ajustes.
- Lotes: produto vencido ≠ estoque disponível normal.
- Catálogo público: somente produtos ativos e publicados; **nunca** expor `cost_price`, margem, fornecedor, usuários ou auditoria.
- Free plan inicial: até 3 empresas por usuário, 100 produtos/empresa, 3 usuários/empresa (ver [ADR-006](../decisions/adr-006-monetization-free-first.md)).

## Related

- Architecture overview: [overview.md](overview.md)
- Contracts que expõem estas entidades: [contracts/api.md](../contracts/api.md)
- Segurança (RLS, Storage, proteção de dados): [security/security.md](../security/security.md)
- Dados sensíveis: [security/authorization.md](../security/authorization.md)