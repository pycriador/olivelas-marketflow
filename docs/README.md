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
├── architecture/
│   ├── overview.md      # Visão geral de arquitetura (01-FOUNDATION)
│   └── data-model.md    # Modelo de dados (02-DATABASE)
├── contracts/
│   └── api.md           # Contrato da superfície de API (05-API)
├── security/
│   ├── security.md      # Postura de segurança (08-SECURITY)
│   ├── authentication.md# Autenticação (03-AUTH)
│   └── authorization.md # Autorização / RBAC (04-PERMISSIONS)
└── decisions/
    └── adr-XXX.md       # Decisões de arquitetura (ADRs)
```

A fonte da verdade do produto são os arquivos `sdd/*.md`; os documentos em `docs/` são a adoção estruturada desse conteúdo no padrão.