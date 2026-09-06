---
title: "ADR-010 — Serviço de WhatsApp e Templates de Mensagens"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-010 — Serviço de WhatsApp e Templates de Mensagens

> Language: pt-BR | [English](../../en/decisions/adr-010-whatsapp-service.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-05

## Contexto

Solicitações do catálogo e contato com clientes acontecem no WhatsApp. Mensagens precisam ser personalizáveis por empresa e independentes do provider para evitar lock-in.

## Problema

Como enviar mensagens de WhatsApp sem acoplar regras de negócio ao provider e permitindo templates por empresa?

## Decisão

Criar um **WhatsApp Service** desacoplado do provider: `MarketFlow → WhatsApp Service → Provider Adapter → WhatsApp Provider`. Regras de negócio nunca conversam com a implementação do provider diretamente.

- **Tela de configuração** (`/configuracoes/whatsapp`): número, nome de exibição, mensagens de saudação/ausência/pedido/confirmação/estoque/produto/contato, assinatura, idioma, horário de atendimento, variáveis.
- **Templates de mensagem** (`whatsapp_templates`): categorias (greeting, product, order, request, stock, confirmation, cancellation, contact, support, error) — cada um com nome, tipo, conteúdo, `active`, `language` (**PT-BR / EN / ES**).
- **Variáveis** com placeholders (`{{customer_name}}`, `{{company_name}}`, `{{product_name}}`, `{{product_price}}`, `{{product_quantity}}`, `{{request_id}}`, `{{request_date}}`, `{{whatsapp}}`, `{{catalog_url}}`, `{{support_name}}`). Placeholders desconhecidos são bloqueados antes de salvar; o editor mostra **preview** com valores simulados.
- **Templates de sistema vs empresa**: Global Admin mantém defaults; a empresa sobrescreve os templates permitidos. Uma empresa nunca altera templates de outra.
- **Histórico** (`whatsapp_messages`) com status (queued, sending, sent, delivered, read, failed, cancelled), retry (controlado, exponential backoff, limite de tentativas, idempotência — nunca loops infinitos), provider_message_id e timestamps.
- CTA do catálogo público gera mensagens dinâmicas ("Comprar/Solicitar" ou "Falar pelo WhatsApp").
- Privacidade: minimização de dados, finalidade, segurança, retenção adequada, **LGPD**; nunca armazenar dados sensíveis desnecessários.

Detalhes: `sdd/12-EXTRAS.md` seções 33–48.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não usada |
| --- | --- | --- | --- |
| SDK do provider direto nos fluxos | Rápido | Lock-in; regras de negócio acopladas ao provider | Rejeitada — abstração exigida |
| Sem templates (mensagens fixas) | Simples | Não personalizável por empresa; UX ruim | Rejeitada — personalização por empresa |
| Idioma único | Menos trabalho | Multi-idioma (PT-BR/EN/ES) é direção do produto | Rejeitada |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Portabilidade de provider e providers oficiais futuros | Complexidade do sistema de templates/variáveis | Multi-idioma com fallback |
| Personalização por empresa + defaults de sistema | — | Histórico de mensagens habilita auditoria de status/retry |
| Fluxo de CTA a partir do catálogo público | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Falhas de entrega | Status, retry controlado + exponential backoff, logs | Proposed |
| Templates inválidos/vazios | Validação de variáveis + preview; fallback quando tradução ausente | Proposed |
| Dados sensíveis em mensagens | Privacidade por design; dados mínimos; LGPD | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| WhatsApp Service + provider adapter | Nova abstração | [../architecture/overview.md](../architecture/overview.md) |
| `whatsapp_templates` / `whatsapp_messages` | Templates e histórico | [../architecture/data-model.md](../architecture/data-model.md) |
| CTA do catálogo público | Fluxo de mensagem dinâmica | [../architecture/overview.md](../architecture/overview.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Solicitações do catálogo e mensagens WhatsApp (outbound) | [../contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Decisão (este ADR) | ADR-010 |
| Componente | WhatsApp Service, adapters, templates, mensagens |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Evidência de implementação | `sdd/12-EXTRAS.md` (spec; editor de templates/entrega mock implementados, provider pendente) |

## Decisões relacionadas

| ADR | Relacionamento |
| --- | --- |
| ADR-003 | relacionado (mensagens/templates com escopo de tenant) |
| ADR-007 | relacionado (UX do editor segue o design system) |
| ADR-008 | relacionado (fluxo de solicitação exposto via API) |

## Referências

| Referência | Localização |
| --- | --- |
| Documento de arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Contrato | [../contracts/api.md](../contracts/api.md) |
| Evidência | [`sdd/12-EXTRAS.md`](../../../sdd/12-EXTRAS.md) |