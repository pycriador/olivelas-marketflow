# 🤖 AI_CONTEXT.md — Manual Canônico e Contexto Técnico para Agentes de IA
> **INSTRUÇÃO PRIMÁRIA PARA A IA:**  
> Leia este documento integralmente antes de planejar, sugerir, refatorar ou escrever qualquer linha de código no projeto **Olivelas MarketFlow**. Ele condensa todo o conhecimento explícito e implícito, convenções, modelos mentais, armadilhas e regras de negócio do sistema. Trate as regras deste documento como axiomas invioláveis da arquitetura.

---

## 1. FILOSOFIA DO PROJETO E ESTRUTURA MENTAL

### 1.1 Missão de Negócio
O **Olivelas MarketFlow** é um sistema **Multi-Tenant (SaaS)** desenhado para a modernização operacional de micro e pequenos varejistas (mercados de bairro, lojas de conveniência, adegas e comércios especializados). O projeto possui um motor de destaque dedicado à **montagem personalizada e venda de Cestas de Café da Manhã**.

### 1.2 Os Quatro Pilares Filosóficos
1. **Zero Latência na UI (Cache-First Otimista):** Nenhuma ação do usuário (criar produto, editar lote, filtrar tabela) aguarda confirmação de rede para atualizar a interface. O sistema grava localmente e atualiza a tela em 0ms.
2. **Offline-First com Degradação Graciosa:** O sistema continua 100% operacional mesmo se a internet cair, o Supabase estiver indisponível ou as credenciais de nuvem forem revogadas. As chamadas de nuvem operam em segundo plano protegidas por \`.catch()\` silenciosos.
3. **Custo Operacional Zero de Infraestrutura (Serverless / Static First):** A aplicação inteira é um bundle SPA estático hospedado no **GitHub Pages**, utilizando o Supabase (PostgreSQL 15 + Edge Functions Deno) como BaaS. Não existe servidor Node.js intermediário rodando 24/7.
4. **Conversão Sem Fricção de Cadastro:** No catálogo público e na montagem de cestas, clientes finais não precisam preencher cadastros densos ou inserir cartões de crédito. O checkout é despachado via **WhatsApp Deep Link** em formato de comanda estruturada em Markdown.

---

## 2. PADRÕES DE ARQUITETURA E DECISÕES FUNDAMENTAIS

### 2.1 Topologia Sistêmica
\`\`\`text
[Navegador do Usuário (SPA React 18 + Vite)]
      │
      ├── [History State Router (App.tsx)]  <-- Sem react-router-dom (evita conflitos de base no GitHub Pages)
      │        ├── Interceptador SPA: public/404.html -> index.html (Decodificador de URL)
      │
      ├── [Camada de Contextos Reativos]
      │        ├── AuthContext (Supabase Auth + fallback local)
      │        ├── CompanyContext (Tenant ativo selecionado)
      │        └── ThemeContext (20 temas dinâmicos via CSS Variables)
      │
      ├── [DataStore Singleton (src/lib/data-store.ts)]
      │        ├── Leitura síncrona de cache: localStorage
      │        ├── Barramento de eventos local: CustomEvent('marketflow_datastore_change')
      │        └── Background Sync Assíncrono: Supabase PostgREST (Promise.all)
      │
      └── [Motores de Domínio]
               ├── Motor de Cestas & WhatsApp (src/lib/real-basket-data.ts)
               ├── Motor de Validade & Perecíveis (3 tiers tricolores)
               ├── Motor de Etiquetas Térmicas (CSS @media print)
               ├── Pipeline de IA Multimodal (Adapter Pattern + Mock Fallback)
               └── In-Browser API Gateway (Tokens SHA-256 + Rate Limiting)
\`\`\`

---

### 2.2 Decisões Arquiteturais e Seus Motivos (ADRs Implícitas)

| Decisão Arquitetural | Motivo / Rationale Técnico | O Que NÃO Fazer |
| :--- | :--- | :--- |
| **Roteamento próprio em \`App.tsx\` sem \`react-router-dom\`** | O GitHub Pages hospeda o repositório sob o caminho \`/olivelas-marketflow/\`. O \`react-router-dom\` frequentemente quebra basenames dinâmicos ao alternar entre ambiente local (\`localhost:5173\`) e produção (\`/olivelas-marketflow/\`). O roteador nativo em \`App.tsx\` usando \`window.history.pushState\` e \`popstate\` garante controle total sem bugs de subdiretório. | **NÃO** instale ou importe \`react-router-dom\`. Mantenha o roteamento via \`currentPath\` e \`pushState\`. |
| **O Segredo do SPA 404 Redirect** | Servidores de arquivos estáticos emitem HTTP 404 em rotas profundas (ex: \`/admin/products\`). O arquivo \`public/404.html\` converte a rota em query string (\`/?/admin/products\`), e o script no \`<head>\` do \`index.html\` restaura o histórico via \`window.history.replaceState\` antes de o React inicializar. | **NÃO** remova os scripts do \`public/404.html\` nem do \`index.html\`. |
| **Chaves Primárias Naturais Semânticas (\`TEXT PRIMARY KEY\`)** | Produtos, lojas e categorias utilizam IDs semânticos legíveis (ex: \`beb-suco-delvalle-200\`, \`comp-cesta-1\`, \`cat-bebidas\`). Isso permite que códigos de barras, QR codes de etiquetas térmicas, URLs e chaves de cache correspondam 1:1 sem tabelas de mapeamento. | **NÃO** force UUIDs aleatórios v4 em entidades de catálogo padrão. |
| **Singleton \`DataStore\` Cache-First** | Todos os componentes leem do \`localStorage\` via \`dataStore\`. Ao gravar, a gravação é síncrona no storage local, dispara o evento \`marketflow_datastore_change\` na janela do browser, e dispara um push assíncrono para o Supabase. | **NÃO** faça \`await supabase.from(...)\` bloqueando a renderização de componentes de tela. Use sempre o \`dataStore\`. |
| **Adapter Pattern no Serviço de IA** | \`AIService\` tenta invocar a Edge Function \`supabase.functions.invoke('ai-analyze')\`. Se não houver chaves configuradas ou o backend estiver offline, recai para o \`MockAIAdapter\` com delay realista de 600ms e heurísticas. | **NÃO** deixe a interface quebrar ou travar se a chave da OpenAI/Gemini não existir no \`.env\`. O fallback heurístico deve responder. |

---

## 3. CONVENÇÕES DE CÓDIGO E NOMENCLATURAS

### 3.1 Nomenclatura de Arquivos e Pastas
- **Páginas e Telas:** Pasta correspondente em \`src/pages/{dominio}/\` com nomes em kebab-case:
  - Ex: \`product-list.tsx\`, \`product-form.tsx\`, \`product-labels.tsx\`, \`basket-builder.tsx\`.
- **Serviços de API:** \`src/services/api/{entidade}-service.ts\`.
- **Componentes Reutilizáveis:** \`src/components/ui/{componente}.tsx\` (Base Radix UI / Tailwind).
- **Tipos TypeScript:** Centralizados estritamente em \`src/types/index.ts\`.

### 3.2 Convenções de TypeScript
- O compilador roda em modo estrito (\`"strict": true\`).
- **Zero Warnings / Zero Errors:** Qualquer código novo DEVE compilar com \`npx tsc --noEmit\` sem nenhum erro de tipagem.
- **Interfaces sobre Types:** Prefira \`interface\` para objetos de domínio (\`Product\`, \`Company\`, \`Lot\`) e \`type\` para unions/estados (\`ThemeKey\`, \`AppRole\`, \`AIProviderType\`).

### 3.3 Convenção de Estilização (Tailwind + Design System)
- Nunca utilize cores arbitrárias hardcoded (como \`text-[#2563eb]\`) na interface principal. Utilize as variáveis e tokens semânticos do Tailwind:
  - Fundo: \`bg-background\`, \`bg-card\`, \`bg-muted\`
  - Texto: \`text-foreground\`, \`text-muted-foreground\`, \`text-primary\`
  - Bordas: \`border-border\`
  - Badges/Status: \`variant="destructive"\` (vermelho), \`variant="warning"\` (âmbar), \`variant="success"\` ou borda emerald (verde).

---

## 4. REGRAS DE NEGÓCIO CRÍTICAS (IMUTÁVEIS)

### 4.1 Motor de Cestas de Café da Manhã (\`src/lib/real-basket-data.ts\`)
O sistema possui 3 portes de cestas pré-definidos com restrições rígidas:

1. **Cesta Pequena (\`pequena\`):**
   - Preço base: R$ 15,00
   - Limite de itens: Até 5 itens
   - Restrição obrigatória de bebida: **Pelo menos 1 bebida de Tier "P" (~200 ml)**
2. **Cesta Média (\`media\`):**
   - Preço base: R$ 20,00 (Produto Destaque / Mais Vendido)
   - Limite de itens: Até 8 itens
   - Restrição obrigatória de bebida: **Pelo menos 1 bebida de Tier "M" (~500 ml)**
3. **Cesta Grande (\`grande\`):**
   - Preço base: R$ 25,00
   - Limite de itens: Até 12 itens
   - Restrição obrigatória de bebida: **Pelo menos 1 bebida de Tier "G" (~1 Litro)**

**Regra de Precificação:**
$$\text{Preço Final} = \text{Preço Base da Cesta} + \sum (\text{Preço Unitário} \times \text{Quantidade})$$

**Validação de Checkout:**
- Não permite finalizar se ultrapassar o limite máximo de itens do tamanho.
- Não permite finalizar se não houver pelo menos 1 bebida compatível com o \`drink_tier\`.

---

### 4.2 Motor de Validade e Perecíveis
O sistema calcula a data de validade com base em 3 tiers de criticidade:
- **Vencido (\`destructive\` / Vermelho):** \`daysLeft < 0\` (Exibe: "Vencido (Xd)").
- **Alerta (\`warning\` / Âmbar):** \`0 <= daysLeft <= 15\` (Exibe: "Vence hoje" ou "Vence em Xd").
- **Regular (\`emerald\` / Verde):** \`daysLeft > 15\` (Exibe data formatada DD/MM/YYYY).

**Shelf-Life Preditivo por Categoria (ao cadastrar produto novo sem validade):**
- Frutas Frescas: 3 a 7 dias
- Frios e Queijos: 5 a 15 dias
- Padaria Artesanal: 3 a 5 dias
- Panificação Industrial: 14 a 18 dias
- Laticínios Líquidos: 7 a 14 dias
- Sucos e Bebidas UHT: 45 a 120 dias
- Mercearia e Biscoitos: 90 a 150 dias
- Doces e Geleias: 180 a 365 dias
- Canecas e Brindes: \`undefined\` (Não perecível)

---

### 4.3 Motor de Etiquetas Térmicas (\`src/pages/admin/products/product-labels.tsx\`)
- Utiliza CSS Print Media (\`@media print\`) com classes Tailwind \`print:...\`.
- Não depende de drivers proprietários ou bibliotecas externas.
- Grade de impressão em 3 colunas em A4 ou bobina, com \`break-inside: avoid\` para que uma etiqueta nunca quebre entre páginas.
- Layout padronizado: Nome da Empresa (topo), Título do Produto (2 linhas truncadas), Preço R$ Grande (centro) e Código de Barras + UN (rodapé).

---

### 4.4 In-Browser API Gateway e Swagger (\`src/api/v1/router.ts\`)
- Gera tokens identificáveis: \`mf_live_[24 chars]\` e \`mf_test_[24 chars]\`.
- O secret pleno só é exibido na criação. No storage e banco, grava-se apenas o hash SHA-256 e o prefixo visível (\`mf_live_abcd...\`).
- **Rate Limiting:** 60 requisições por minuto por chave. Se ultrapassado, retorna HTTP 429 (\`RATE_LIMIT_EXCEEDED\`).
- A rota \`/admin/api\` renderiza uma interface Swagger compatível com especificação OpenAPI 3.0.

---

### 4.5 Motor de 20 Temas Dinâmicos e i18n
- **20 Temas:** 10 Claros (\`theme-corporate\`, \`theme-emerald\`, etc.) e 10 Escuros (\`theme-dark-corporate\`, \`theme-dracula\`, \`theme-cyberpunk\`, etc.).
- A troca adiciona a classe correspondente ao elemento \`<html>\` e persiste na chave \`marketflow-theme-key\`.
- i18n suporta \`pt-BR\`, \`en\` e \`es\`. Toda chave não encontrada recai sobre o português.

---

## 5. BANCO DE DADOS E ROW LEVEL SECURITY (RLS)

### 5.1 Principais Tabelas Relacionais (Supabase PostgreSQL 15)
- \`public.companies\`: Cadastro do Tenant (loja), slug único, telefone, WhatsApp, flag \`breakfast_basket_enabled\`.
- \`public.profiles\`: Usuários da plataforma vinculados ao \`auth.users\` via UUID.
- \`public.company_users\`: Associação de usuários à empresa com papel \`app_role\` (\`global_admin\`, \`admin\`, \`stock\`, \`visitor\`).
- \`public.products\`: Cadastro mercantil com \`sale_price\`, \`cost_price\`, \`expiration_date\`, \`basket_sizes\` e \`drink_tier\`.
- \`public.inventory_items\`: Saldo consolidado de estoque físico (\`quantity\`, \`reserved_quantity\`).
- \`public.lots\`: Lotes rastreáveis com validade específica e quantidade remanescente.
- \`public.inventory_movements\`: Kardex de auditoria contábil (\`in\`, \`out\`, \`transfer\`, \`adjustment\`, \`loss\`).
- \`public.catalog_requests\`: Pedidos de catálogo público salvos antes do despacho ao WhatsApp.

### 5.2 Segurança RLS (Row Level Security)
- Visitantes têm acesso público de leitura (\`SELECT\`) a empresas com \`active = true\` e produtos ativos.
- A criação de pedidos em \`catalog_requests\` é pública (\`INSERT WITH CHECK (true)\`).
- Operações de escrita nas tabelas administrativas exigem usuário autenticado com vínculo válido em \`company_users\` para o tenant correspondente.

---

## 6. MAPA DE DIRETÓRIOS DO CÓDIGO-FONTE

\`\`\`text
olivelas-marketflow/
├── public/
│   ├── 404.html                     # Captura deep-links e converte em query string SPA
│   └── favicon.svg
├── index.html                       # Restaura rota SPA no <head> e monta o bundle Vite
├── src/
│   ├── main.tsx                     # Ponto de entrada React (ThemeProvider + App)
│   ├── App.tsx                      # Roteador central (History state, guarda de rotas)
│   ├── types/
│   │   └── index.ts                 # Definições estritas de tipos e interfaces do sistema
│   ├── lib/
│   │   ├── data-store.ts            # Singleton central de persistência e sync (DataStore)
│   │   ├── real-basket-data.ts      # Matriz das cestas P/M/G e 51 produtos canônicos
│   │   ├── supabase.ts              # Cliente Supabase e helpers de inicialização
│   │   └── utils.ts                 # Utilitários de moeda, formatação de data e classes
│   ├── context/
│   │   ├── auth-context.tsx         # Autenticação real (Supabase) com fallback demo
│   │   ├── company-context.tsx      # Seletor global do tenant ativo
│   │   └── theme-context.tsx        # Motor dos 20 temas dinâmicos e modo escuro
│   ├── services/
│   │   ├── api/                     # Serviços de chamada PostgREST Supabase
│   │   └── ai/
│   │       └── ai-service.ts        # Adaptadores de IA (Edge Function + Mock local)
│   ├── api/v1/
│   │   ├── router.ts                # API Gateway emulado no browser com Rate Limit
│   │   └── openapi-spec.ts          # Especificação OpenAPI 3.0 para Swagger
│   ├── components/
│   │   ├── layout/                  # Navbar, Sidebar, Breadcrumbs, Footer
│   │   └── ui/                      # Botões, Badges, Modais, Inputs, DropdownFilterMenu
│   └── pages/
│       ├── admin/                   # Telas restritas: Dashboard, Produtos, Lotes, API, etc.
│       ├── store/                   # Catálogo público e montador de cestas
│       └── landing/                 # Landing page institucional do produto
├── docs/                            # Wiki técnica modular navegável (13 documentos)
├── supabase/
│   └── consolidated_schema.sql      # DDL completa (1.718 linhas) com seed de 51 produtos
└── scripts/
    ├── build_modular_wiki.mjs       # Script gerador da Wiki em /docs
    └── test-backend-integration.mjs # Validador de conectividade com o Supabase
\`\`\`

---

## 7. LIMITAÇÕES CONHECIDAS E DÉBITO TÉCNICO

1. **Teto de Armazenamento do \`localStorage\`:** O cache local síncrono é limitado a ~5 MB por domínio. Para catálogos acima de 10.000 itens, deve-se migrar o storage subjacente do \`DataStore\` para **IndexedDB** (\`idb-keyval\`).
2. **Ambiente Estático no GitHub Pages:** Não é possível executar rotas de backend Node.js diretamente no servidor web do GitHub Pages. Todas as funções dinâmicas devem residir no Supabase (Edge Functions) ou serem simuladas no cliente.
3. **Resolução de Conflitos (Race Conditions):** O método \`syncWithRemote()\` substitui chaves locais por dados remotos de forma "última escrita vence" (\`last write wins\`). Não há algoritmo CRDT completo implementado para edições simultâneas offline em múltiplos dispositivos na mesma conta.

---

## 8. BACKLOG TÉCNICO E PONTOS DE EXTENSÃO PARA FUTURAS IAs

Se o usuário solicitar novas funcionalidades, priorize as seguintes diretrizes:

1. **PWA (Progressive Web App):** Adicionar Service Worker e \`manifest.json\` para que lojistas e estoquistas instalem o MarketFlow como app nativo no celular ou terminal de gôndola.
2. **Integração de Pagamento Instantâneo (Pix Automático):** Conectar um webhook de PSP (Mercado Pago, Efí ou Asaas) no checkout do catálogo para gerar QR Code Pix dinâmico antes do despacho ao WhatsApp.
3. **Migração do LocalStorage para IndexedDB:** Substituir \`localStorage.getItem/setItem\` por uma camada assíncrona baseada em IndexedDB mantendo a reatividade do \`marketflow_datastore_change\`.
4. **Z-API / WhatsApp Business API:** Permitir envio automatizado da mensagem sem depender da ação manual do cliente via deep link \`wa.me\`.

---
*Fim do AI_CONTEXT.md — Você agora possui 100% do contexto para continuar o desenvolvimento do Olivelas MarketFlow com fidelidade absoluta.*
