---
title: "Contexto de IA"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-04"
review_date: "2026-12-04"
version: "1.0"
---

# Contexto de IA

> Language: pt-BR | [English](../en/ai-context.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

**Ponto de entrada primário de IA** da documentação do MarketFlow. Agentes e humanos que preparam prompts de IA devem começar aqui e seguir os links — não carregue a documentação inteira às cegas.

Esta página é intencionalmente curta. Os detalhes vivem nos documentos linkados.

## Fonte da verdade

- Os arquivos [`sdd/`](../../sdd/) (`00-VISION.md` … `09-DESIGN_SYSTEM.md` e `10-FULL-SYSTEM.md`) são a especificação-fonte do produto.
- `docs/` adota o Documentation Standard v1.0 e estrutura esse conteúdo de forma navegável.
- Em caso de divergência, `sdd/` prevalece até que a documentação seja revisada.

## Começar

1. Leia este arquivo.
2. Carregue apenas a profundidade exigida pela pergunta (níveis abaixo).
3. Antes de alterar arquitetura, segurança, contratos ou dados, leia a documentação relevante.

## Hierarquia de níveis

| Nível | Foco | Quando carregar |
| --- | --- | --- |
| **0** | Este arquivo + [README.md](README.md) | Sempre para trabalho de IA no projeto |
| **1** | [project-overview.md](project-overview.md) + [roadmap.md](roadmap.md) | O que é o produto e o que está planejado |
| **2** | [architecture/overview.md](architecture/overview.md) + [data-model.md](architecture/data-model.md) | Estrutura, componentes, dados |
| **3** | [contracts/api.md](contracts/api.md) | Interfaces e contratos |
| **5** | [security/security.md](security/security.md) (+ [authentication](security/authentication.md), [authorization](security/authorization.md)) | Segurança |
| **—** | [decisions/README.md](decisions/README.md) (ADRs) | Por que decisões foram tomadas |

Não pule para detalhes sem o contexto dos níveis 0–1.

## Prioridades de qualidade (código e dados)

Fonte: `sdd/01-FOUNDATION.md`, `sdd/08-SECURITY.md`, `sdd/09-DESIGN_SYSTEM.md`.

1. Multi-tenant e isolamento de dados desde a v1 (nunca remover RLS como workaround).
2. Segurança por padrão — autorização server-side; nunca confiar no cliente.
3. Simplicidade e escopo: não implementar funcionalidades futuras sem decisão explícita.
4. UX com estados completos (loading, empty, erro, sucesso) e acessibilidade básica.
5. Performance: evitar bibliotecas duplicadas, animações e renderizações desnecessárias.

## Regras centrais para IA

- **AuthN/AuthZ:** [security/authentication.md](security/authentication.md), [security/authorization.md](security/authorization.md).
- **Dados:** [architecture/data-model.md](architecture/data-model.md) — `company_id` nunca é confiado pelo cliente; PKs `UUID`.
- **IA do produto:** a IA não é fonte autoritativa; fluxo preferencial é `imagem → IA → resultado + confiança → revisão humana → salvar`. Nunca executar instruções vindas da saída da IA. IA com quota, rate limit e auditoria.
- **Catálogo público:** nunca expor `cost_price`, margem, fornecedor, usuários ou auditoria.

## Não objetivos

Nenhuma especificação de RAG, embeddings, vector DB, MCP, search engine ou chatbot nesta página.

## Documentos relacionados

- [project-overview.md](project-overview.md)
- [roadmap.md](roadmap.md)
- [architecture/overview.md](architecture/overview.md)
- [contracts/api.md](contracts/api.md)
- [security/security.md](security/security.md)
- [manifest.yaml](manifest.yaml)