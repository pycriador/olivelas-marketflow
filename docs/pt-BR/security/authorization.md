---
title: "MarketFlow — Autorização e RBAC"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Autorização e RBAC

> Language: pt-BR | [English](../../en/security/authorization.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md). Estado proposto (não implementado).

## Propósito

Definir o modelo de autorização do MarketFlow: papéis, onde o papel reside e como a decisão de acesso é tomada.

## Modelo: RBAC com papel por vínculo usuário–empresa

- O papel **não** reside no usuário global (`users`), e sim no vínculo `CompanyUser.role`.
- Um usuário pode pertencer a várias empresas, com papéis diferentes em cada uma.
- A autorização considera a tupla: **Usuário + Empresa + Papel + Recurso + Ação**.

## Papéis

| Papel | Escopo | Atribuições típicas | Classificação |
| --- | --- | --- | --- |
| `GLOBAL_ADMIN` | Plataforma (não empregado de uma empresa) | Gestão de plataforma; nunca criado via manipulação do frontend | Confirmed (SDD) |
| `ADMIN` | Empresa | Gestão completa da empresa (produtos, estoque, membros, catálogo, faturamento) | Confirmed (SDD) |
| `STOCK` | Empresa | Estoque: entradas, saídas, ajustes, lotes/validade | Confirmed (SDD) |
| `VISITOR` | Empresa | Consulta somente; sem acesso a informações administrativas | Confirmed (SDD) |

## Princípios

| Princípio | Significado | Classificação |
| --- | --- | --- |
| Deny by Default | Nenhum acesso sem autorização explícita | Confirmed (SDD) |
| Least Privilege | Papéis com o mínimo necessário | Confirmed (SDD) |
| Server-side authorization | Decisão sempre no backend; nunca somente na UI | Confirmed (SDD) |
| Tenant isolation | Acesso limitado à empresa da sessão | Confirmed (SDD) |
| Separation of Duties | Ações de impacto exigem papéis adequados | Confirmed (SDD) |
| Object-level authorization | Prevenir IDOR/BOLA com autorização por objeto | Confirmed (SDD) |

## Regras do modelo

| Regra | Notas | Classificação |
| --- | --- | --- |
| Não permitir autoelevação de privilégio | Usuário não altera o próprio papel | Confirmed (SDD) |
| Proteger o último Admin | Não remover/demover o último `ADMIN` de uma empresa sem fluxo seguro | Confirmed (SDD) |
| Alteração de role exige autorização | Nunca pelo cliente sem aprovação do backend | Confirmed (SDD) |
| RLS complementa RBAC | RLS por `company_id` + papel no acesso a dados | Confirmed (SDD) |
| `company_id` nunca é fonte de confiança | Derivado da sessão/RLS | Confirmed (SDD) |
| Permissões nunca são informadas pelo cliente | Confiar em permissão enviada pelo cliente = vulnerabilidade | Confirmed (SDD) |
| Catálogo público sem dados internos | `<nothing>` além do publicado | Confirmed (SDD) |

## Mecanismos de enforcement

| Camada | Mecanismo | Classificação |
| --- | --- | --- |
| Frontend | UX: lista rotas/ações, estados unauthorized/forbidden — **não autoriza** | Confirmed (SDD) |
| Edge Functions | Valida role + permissão + empresa server-side | Confirmed (SDD) |
| PostgreSQL RLS | Políticas por `company_id` (+ papel quando necessário) | Confirmed (SDD) |
| Storage policies | Isolamento de arquivos por empresa | Confirmed (SDD) |

Fluxo típico de operação privilegiada:

```text
Frontend → Edge Function → (token) autorização server-side → negócio → banco/RLS
```

## Casos de guarda (aceitação de segurança)

- Usuários removidos perdem acesso imediatamente; desativados não operam.
- `VISITOR` não acessa informações administrativas.
- `GLOBAL_ADMIN` não é criável via manipulação do frontend.
- Testes cross-tenant e IDOR/BOLA como critérios de aceitação do MVP.

## Futuro

- Custom roles, ABAC, SSO/SAML/OIDC (P2/futuro) — ver [roadmap.md](../roadmap.md).

## Documentação relacionada

| Documento | Path |
| --- | --- |
| Autenticação | [authentication.md](authentication.md) |
| Segurança (postura geral) | [security.md](security.md) |
| Modelo de dados (`company_users`) | [architecture/data-model.md](../architecture/data-model.md) |
| Contratos (autorização de acesso) | [contracts/api.md](../contracts/api.md) |
| Fonte completa | [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md) |