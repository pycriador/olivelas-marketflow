---
title: "MarketFlow — Roadmap"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# MarketFlow — Roadmap

> Language: pt-BR | [English](../en/roadmap.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

Fonte: [`sdd/06-ROADMAP.md`](../../sdd/06-ROADMAP.md) e itens de backlog em [`sdd/10-FULL-SYSTEM.md`](../../sdd/10-FULL-SYSTEM.md).

## Princípios de evolução

- Evolução incremental: entregar valor cedo e evoluir por prioridades.
- Segurança antes de escala: capacidades de segurança são P0/P1, nunca adiadas por escala.
- Não transformar o MVP em ERP: PDV, financeiro, contabilidade, fiscal, CRM e e-commerce completo são futuro com decisão explícita.
- Qualquer IA usada no desenvolvimento deve ler a documentação antes de alterar a arquitetura.

## Prioridades

| Prioridade | Significado |
| --- | --- |
| P0 | Obrigatório para MVP / funcionamento |
| P1 | Alto valor logo após o MVP |
| P2 | Evolução |
| P3 | Futuro |

## MVP (P0)

Fonte: `sdd/06-ROADMAP.md` e backlog `29-BACKLOG`.

- Landing page.
- Auth (email+senha + Google OAuth) e criação da primeira empresa.
- Multiempresa e troca de empresa.
- IAM/RBAC (GLOBAL_ADMIN, ADMIN, STOCK, VISITOR).
- Categorias, marcas, fabricantes, fornecedores.
- Produtos (CRUD, imagens, preço de custo/venda/promocional, SKU/barcode, unidades).
- Estoque básico (entrada, saída, ajuste, perda, inventário, histórico).
- Lotes e validade.
- Catálogo público (publicação de produtos, slug da empresa).
- Solicitações básicas do catálogo.
- IA de cadastro de produto (foto → dados + confiança → revisão humana → salvar).
- Notificações in-app (estoque baixo, vencimento, convites, solicitações).

## Segurança P0/P1

- P0: Supabase Auth, RLS, isolamento de tenant, RBAC, autorização no backend, Storage seguro, validação de entrada, filtragem de saída, secrets, HTTPS, rate limiting básico, audit logs para operações críticas, proteção de estoque e do catálogo público, quota de IA, testes cross-tenant e IDOR/BOLA.
- P1: security headers, CSP, monitoring, dependency scanning, backup/recovery, abuse detection, security alerts, controles avançados de custo de IA.
- P2 (futuro): MFA, custom roles, ABAC, SSO/SAML/OIDC, IP allowlist, detecção avançada de ameaças, fluxos avançados de LGPD.

Critérios de aceitação de segurança do MVP em `sdd/08-SECURITY.md`.

## P1 — Alta prioridade

- Relatórios com exportação (CSV/XLSX/PDF).
- Melhorias de observabilidade (logs estruturados, métricas, alertas).
- Segurança P1 (acima).
- Eficiência e otimização da IA (controles de custo).

## P2 — Evolução

- Monetização: planos Free/Basic/Pro/Business/Enterprise, limites configuráveis, assinaturas e billing por empresa. Ver [decisions/adr-006-monetization-free-first.md](decisions/adr-006-monetization-free-first.md).
- MFA e controles de segurança avançados.

## P3 — Futuro

- PDV.
- Fiscal.
- Financeiro.
- Filiais.
- API pública para terceiros.
- Automações e AI Copilot.
- Notificações multicanal (e-mail, WhatsApp, push).
- Billing/pagamentos online (gateway + webhooks).
- Recursos Enterprise (SSO, SAML, OIDC, IP allowlist, relatórios avançados).

## Regra para IA de implementação

Analise todos os documentos do projeto antes de criar tarefas. Identifique dependências, lacunas e conflitos. Priorize segurança, multi-tenant, RLS, valor para o usuário e simplicidade. Não implemente funcionalidades futuras sem decisão explícita.

## Documentação relacionada

| Documento | Caminho |
| --- | --- |
| Visão geral do projeto | [project-overview.md](project-overview.md) |
| Segurança (prioridades) | [security/security.md](security/security.md) |
| Monetização | [decisions/adr-006-monetization-free-first.md](decisions/adr-006-monetization-free-first.md) |
| Fonte | [`sdd/06-ROADMAP.md`](../../sdd/06-ROADMAP.md), [`sdd/07-MONETIZATION.md`](../../sdd/07-MONETIZATION.md) |