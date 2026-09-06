---
title: "ADR-009 — Serviço de IA: Abstração de Providers"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-009 — Serviço de IA: Abstração de Providers

> Language: pt-BR | [English](../../en/decisions/adr-009-ai-service-abstraction.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-05

## Contexto

O MarketFlow usa IA para cadastro de produto, OCR e reconhecimento de prateleira. Amarrar o produto a um único fornecedor de IA cria lock-in e dificulta controle de custo/qualidade.

## Problema

Como integrar providers de IA sem acoplar a aplicação a um único fornecedor?

## Decisão

Criar uma **abstração de Serviço de IA** (interface `AIProvider`) com adapters por provider — **OpenAI**, **Google Gemini**, **Anthropic** e providers futuros (um adapter `mock` valida fluxos sem custo externo). A aplicação conversa apenas com o **AI Service**, nunca diretamente com o provider.

- Operações: `analyzeImage()`, `analyzeProduct()`, `extractText()` (OCR), `classifyProduct()`.
- Configuração por ambiente (e, quando necessário, por empresa): provider, modelo, temperature, max tokens, timeout, enabled. **Keys de providers nunca no frontend.**
- Análise de imagem do produto sugere nome, marca, fabricante, categoria, descrição, código de barras (quando legível), unidade, peso/volume. A saída da IA é **sugestão**, nunca verdade.
- Todo resultado relevante possui **confidence score** (`confidence`); abaixo do limite → **revisão humana** obrigatória. Reconhecimento de prateleira é **estimativa** — nunca atualiza estoque automaticamente.
- Jobs de IA são assíncronos (`ai_jobs`: pending/processing/completed/failed/cancelled) com logs de uso (`ai_usage_logs`: empresa, usuário, operação, provider, modelo, tokens de entrada/saída, custo estimado, status) para controle de custo por empresa e **plan limits** (configuráveis; nunca hardcodados no frontend).
- **A saída da IA é UNTRUSTED DATA**: mitigar prompt injection, arquivos maliciosos, uploads excessivos, abuso e custo; nunca executar instruções presentes na resposta da IA.

Detalhes: `sdd/12-EXTRAS.md` seções 22–32.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não usada |
| --- | --- | --- | --- |
| Chamadas diretas ao SDK do provider nos fluxos | Rápido de construir | Lock-in; difícil trocar; código duplicado | Rejeitada — abstração exigida |
| Provider único | Simples | Lock-in; sem fallback | Rejeitada |
| Sem IA | — | Perde o principal diferencial de cadastro | Rejeitada |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Portabilidade de provider (troca/controle de custo) | Camada de abstração precisa de manutenção | Adapter `mock` permite desenvolver sem custo |
| Revisão humana baseada em confiança | — | Jobs e logs de uso habilitam quota/custo |
| Saída estruturada e consistente | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Prompt injection / saída não confiável | Tratar saída como UNTRUSTED DATA; nunca executar instruções | Proposed |
| Abuso de custo | Logs de uso + plan limits + rate limit | Proposed |
| Disponibilidade do provider | Isolamento de falha; IA é auxiliar (não bloqueia catálogo/estoque) | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| AI Service + adapters | Nova abstração | [../architecture/overview.md](../architecture/overview.md) |
| `ai_jobs` / `ai_usage_logs` | Jobs assíncronos e uso | [../architecture/data-model.md](../architecture/data-model.md) |
| Assistente de IA (cadastro de produto) | Usa o serviço | [../architecture/overview.md](../architecture/overview.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | `POST /api/v1/ai/analyze-image`, `GET /api/v1/ai/jobs/{id}`, escopo `ai:use` | [../contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Decisão (este ADR) | ADR-009 |
| Componente | AI Service, adapters, `ai_jobs`, `ai_usage_logs` |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Evidência de implementação | `sdd/12-EXTRAS.md` (spec; adapters mock implementados, providers reais pendentes) |

## Decisões relacionadas

| ADR | Relacionamento |
| --- | --- |
| ADR-001 | relacionado (Edge Functions hospedam o serviço de IA) |
| ADR-006 | relacionado (limites de IA atrelados a plan limits) |
| ADR-008 | relacionado (IA exposta/escopada via API) |

## Referências

| Referência | Localização |
| --- | --- |
| Documento de arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Segurança | [../security/security.md](../security/security.md) |
| Evidência | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |