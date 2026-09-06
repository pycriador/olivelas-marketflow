---
title: "ADR-011 — 20 Temas e Internacionalização (pt-BR/EN/ES)"
status: "DRAFT"
owner: "marketflow-team"
created: "2026-09-04"
updated: "2026-09-05"
review_date: "2026-12-04"
version: "1.0"
---

# ADR-011 — 20 Temas e Internacionalização (pt-BR/EN/ES)

> Language: pt-BR | [English](../../en/decisions/adr-011-themes-and-internationalization.md)
>
> Status: DRAFT
>
> Documentation Standard v1.0

## Status

Accepted

## Dados

2026-09-05

## Contexto

O MarketFlow é um SaaS mobile-first para pequenos comércios. Personalização visual e suporte a idiomas melhoram percepção e adoção, e o produto mira pt-BR primeiro com alcance EN/ES.

## Problema

Como suportar temas visuais e múltiplos idiomas sem comprometer acessibilidade, performance ou o design system?

## Decisão

Suportar **20 temas visuais — 10 light e 10 dark** — definidos como CSS custom properties (tokens estilo Tailwind/shadcn) no frontend, com persistência por usuário e seletor de tema:

- **Light (10):** corporate, emerald, indigo, amber, rose, slate-light, teal, paper, high-contrast-light, mint.
- **Dark (10):** dark-corporate, midnight, dracula, cyberpunk, nord, forest, high-contrast-dark, slate-dark, obsidian, sunset-dark.
- Default: `theme-corporate` (light). Variantes de alto contraste melhoram acessibilidade.

Suportar **3 idiomas**: **pt-BR** (default), **en** e **es**, selecionáveis e persistidos. Temas e idioma são decisões de **camada UX**: nunca alteram acesso a dados, autorização ou regras de negócio.

Há evidência de tokens de design estáveis e suporte multi-idioma no frontend atual (`src/i18n/translations.ts`, `src/index.css`).

Detalhes: `sdd/11-EXTRAS.md` itens 4–5.

## Alternativas consideradas

| Alternativa | Prós | Contras | Por que não usada |
| --- | --- | --- | --- |
| Somente temas light ou dark | Menos trabalho de tokens | Sem personalização; percepção mais fraca | Rejeitada — 20 temas é direção do produto |
| Somente idioma pt-BR | Menos trabalho | Limita alcance (EN/ES) | Rejeitada — multi-idioma é direção do produto |
| Biblioteca de componentes customizada por tema | Controle total | Alta manutenção; tokens inconsistentes | Rejeitada — mesma base shadcn/ui |

## Consequências

| Positivas | Negativas | Neutras |
| --- | --- | --- |
| Personalização e percepção do produto | Manutenção de tokens de design (governança p/ evitar fragmentação) | Light/dark com alto contraste melhoram acessibilidade |
| Alcance multi-idioma | Adoção de i18n é parcial (não meias-traduções) | Idioma/tema armazenados por usuário |
| Tokens Tailwind compartilhados mantêm UI consistente | — | — |

## Riscos

| Risco | Mitigação | Classificação |
| --- | --- | --- |
| Fragmentação visual | Design DoD: revisar antes de nova cor/componente/libraria/variante ([ADR-007](adr-007-design-system.md)) | Proposed |
| Traduções parciais | Fallback; completude de tradução nos critérios de entrega | Proposed |

## Componentes afetados

| Componente | Impacto | Documentação |
| --- | --- | --- |
| Frontend React | Sistema de temas + i18n | [../architecture/overview.md](../architecture/overview.md), [adr-002-frontend-stack.md](adr-002-frontend-stack.md) |

## Contratos afetados

| Contrato | Impacto | Documentação |
| --- | --- | --- |
| Superfície de API | Sem impacto direto | [../contracts/api.md](../contracts/api.md) |

## Rastreabilidade

```text
Architecture → Decision → Component → Contract
```

| Camada | Referência |
| --- | --- |
| Arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Decisão (este ADR) | ADR-011 |
| Componente | Frontend React (temas + i18n) |
| Contrato | — |
| Evidência de implementação | `sdd/11-EXTRAS.md` (spec; temas e i18n implementados no frontend) |

## Decisões relacionadas

| ADR | Relacionamento |
| --- | --- |
| ADR-002 | relacionado (mesmo stack de frontend) |
| ADR-007 | relacionado (governança do design system) |

## Referências

| Referência | Localização |
| --- | --- |
| Documento de arquitetura | [../architecture/overview.md](../architecture/overview.md) |
| Design system | [adr-007-design-system.md](adr-007-design-system.md) |
| Evidência | [`sdd/11-EXTRAS.md`](../../../sdd/11-EXTRAS.md) |