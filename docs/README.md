# MarketFlow — Documentação

> Documentation Standard v1.0

Este repositório adota o **Documentation Standard v1.0**. A documentação segue a estrutura em dois idiomas (`docs/pt-BR` e `docs/en`), espelhada e interligada.

- [Português (pt-BR) — índice](pt-BR/README.md)
- [English — index](en/README.md)

## Estrutura

```text
docs/
├── README.md            # Seletor de idioma
├── pt-BR/               # Documentação em português
└── en/                  # Documentation in English (mirror)
```

Cada ramo de idioma contém:

```text
<lang>/
├── README.md            # Índice e trilha de leitura
├── manifest.yaml        # Manifesto da documentação (paths relativos ao ramo)
├── ai-context.md        # Ponto de entrada para IA/agentes
├── project-overview.md  # Propósito, escopo e mapa do sistema (00-VISION)
├── roadmap.md           # Roadmap e prioridades (06-ROADMAP)
─ architecture/
│   ├── overview.md      # Visão geral de arquitetura (01-FOUNDATION)
│   └── data-model.md    # Modelo de dados (02-DATABASE, 12-EXTRAS)
├── contracts/
│   └── api.md           # Contrato da superfície de API (05-API, 12-EXTRAS)
├── security/
│   ├── security.md      # Postura de segurança (08-SECURITY, 12-EXTRAS)
│   ├── authentication.md# Autenticação (03-AUTH)
│   └── authorization.md # Autorização / RBAC + scopes (04-PERMISSIONS, 12-EXTRAS)
└── decisions/
    └── adr-001.md .. adr-011.md  # Decisões de arquitetura (ADRs)
```

A fonte da verdade do produto são os arquivos `sdd/*.md`, incluindo **`sdd/11-EXTRAS.md`** (IAM completo, 20 temas, i18n) e **`sdd/12-EXTRAS.md`** (API First, API Keys, webhooks, IA, WhatsApp). Os documentos em `docs/` são a adoção estruturada desse conteúdo no padrão. Cada decisão de arquitetura é registrada em `decisions/adr-XXX.md` (atualmente ADR-001 a ADR-011).