---
title: "MarketFlow — Autorização e RBAC"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Autorização e RBAC

> Language: pt-BR | [English](../../en/security/authorization.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md) e [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) (scopes de API). Implementado parcialmente (protótipo; enforcement server-side pendente).

## Propósito

Definir o modelo de autorização do MarketFlow: papéis, onde o papel reside, scopes de API para acesso máquina e como a decisão de acesso é tomada.

## Modelo: RBAC com papel por vínculo usuário–empresa

- O papel **não** reside no usuário global (`users`), e sim no vínculo `CompanyUser.role`.
- Um usuário pode pertencer a várias empresas, com papéis diferentes em cada uma.
- A autorização considera a tupla: **Usuário + Empresa + Papel + Recurso + Ação**.
- Acesso máquina adiciona **scopes de API Key**: token + empresa + scope + propriedade do recurso (ADR-008). Usuários humanos dependem de RBAC; API Keys dependem de scopes — nunca fundir os dois caminhos silenciosamente.

## Papéis

| Papel | Escopo | Atribuições típicas | Classificação |
| --- | --- | --- | --- |
| `GLOBAL_ADMIN` | Plataforma (não empregado de uma empresa) | Gestão de plataforma; nunca criado via manipulação do frontend | Confirmed (SDD) |
| `ADMIN` | Empresa | Gestão completa da empresa (produtos, estoque, membros, catálogo, faturamento, API keys, templates WhatsApp) | Confirmed (SDD) |
| `STOCK` | Empresa | Estoque: entradas, saídas, ajustes, lotes/validade | Confirmed (SDD) |
| `VISITOR` | Empresa | Consulta somente; sem acesso a informações administrativas | Confirmed (SDD) |

## Scopes de API (acesso máquina)

| Scope | Acesso |
| --- | --- |
| `products:read` / `products:write` | Ler / criar-atualizar produtos |
| `categories:read` / `categories:write` | Categorias |
| `brands:read` / `brands:write` | Marcas |
| `manufacturers:read` / `manufacturers:write` | Fabricantes |
| `suppliers:read` / `suppliers:write` | Fornecedores |
| `inventory:read` / `inventory:write` | Estado e movimentações de estoque |
| `lots:read` / `lots:write` | Lotes/validade |
| `catalog:read` / `catalog:write` | Publicação do catálogo e configurações |
| `requests:read` / `requests:write` | Solicitações do catálogo |
| `ai:use` | Operações de análise de IA |
| `reports:read` | Relatórios |

Todo request verifica: key ativa (não revogada/vencida), pertencente à empresa e com o scope necessário presente. Scopes são de menor privilégio.

## Princípios

| Princípio | Significado | Classificação |
| --- | --- | --- |
| Deny by Default | Nenhum acesso sem autorização explícita | Confirmed (SDD) |
| Least Privilege | Papéis/scopes com o mínimo necessário | Confirmed (SDD) |
| Server-side authorization | Decisão sempre no backend; nunca somente na UI | Confirmed (SDD) |
| Tenant isolation | Acesso limitado à empresa da sessão / da key | Confirmed (SDD) |
| Separation of Duties | Ações de impacto exigem papéis/scopes adequados | Confirmed (SDD) |
| Object-level authorization | Prevenir IDOR/BOLA com autorização por objeto | Confirmed (SDD) |

## Regras do modelo

| Regra | Notas | Classificação |
| --- | --- | --- |
| Não permitir autoelevação de privilégio | Usuário não altera o próprio papel | Confirmed (SDD) |
| Proteger o último Admin | Não remover/demover o último `ADMIN` de uma empresa sem fluxo seguro | Confirmed (SDD) |
| Alteração de role exige autorização | Nunca pelo cliente sem aprovação do backend | Confirmed (SDD) |
| Keys vinculadas ao tenant | Uma key concede scopes apenas dentro de sua empresa | Confirmed (SDD) |
| Segredo da key só-hash | Chave completa exibida uma vez; nunca armazenada/logada em texto puro | Confirmed (SDD) |
| RLS complementa RBAC | RLS por `company_id` + papel no acesso a dados | Confirmed (SDD) |
| `company_id` nunca é fonte de confiança | Derivado da sessão/RLS | Confirmed (SDD) |
| Permissões nunca são informadas pelo cliente | Confiar em permissão enviada pelo cliente = vulnerabilidade | Confirmed (SDD) |
| Catálogo público sem dados internos | `<nothing>` além do publicado | Confirmed (SDD) |

## Mecanismos de enforcement

| Camada | Mecanismo | Classificação |
| --- | --- | --- |
| Frontend | UX: lista rotas/ações, estados unauthorized/forbidden — **não autoriza** | Confirmed (SDD) |
| Camada de API | Validação hash + empresa + scope + propriedade | Confirmed (SDD) — ADR-008 |
| Edge Functions | Valida role/permissão/scope + empresa server-side | Confirmed (SDD) |
| PostgreSQL RLS | Políticas por `company_id` (+ papel quando necessário) | Confirmed (SDD) |
| Storage policies | Isolamento de arquivos por empresa | Confirmed (SDD) |

Fluxo típico de operação privilegiada:

```text
Frontend → Edge Function → (token) autorização server-side → negócio → banco/RLS
```

Fluxo típico de máquina:

```text
Integrador → /api/v1 → hash da API Key + empresa + scope → negócio → banco/RLS → audit log
```

## Casos de guarda (aceitação de segurança)

- Usuários removidos perdem acesso imediatamente; desativados não operam.
- `VISITOR` não acessa informações administrativas.
- `GLOBAL_ADMIN` não é criável via manipulação do frontend.
- Uma API Key revogada/vencida é rejeitada; uma key não cruza empresas; um scope não é honrado sem a key.
- Testes cross-tenant e IDOR/BOLA como critérios de aceitação do MVP.

## Futuro

- Custom roles, ABAC, SSO/SAML/OIDC (P2/futuro) — ver [roadmap.md](../roadmap.md).

## Documentação relacionada

| Documento | Path |
| --- | --- |
| Autenticação | [authentication.md](authentication.md) |
| Segurança (postura geral) | [security.md](security.md) |
| Modelo de dados (`company_users`, `api_keys`) | [architecture/data-model.md](../architecture/data-model.md) |
| Contratos (autorização de acesso) | [contracts/api.md](../contracts/api.md) |
| Decisão API First | [decisions/adr-008-api-first-and-api-keys.md](../decisions/adr-008-api-first-and-api-keys.md) |
| Fonte completa | [`sdd/04-PERMISSIONS.md`](../../../sdd/04-PERMISSIONS.md), [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |