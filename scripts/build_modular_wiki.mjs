import fs from 'fs';
import path from 'path';

const DOCS_DIR = path.resolve('docs');

// Helper para garantir diretórios
function ensureDir(dirPath) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

// 1. docs/README.md
const README_CONTENT = `# 📚 MarketFlow Knowledge Wiki — Documentação Oficial do Sistema

Bem-vindo à **Wiki Técnica e de Arquitetura do Olivelas MarketFlow**. Esta base de conhecimento foi projetada de forma modular, navegável e exaustiva para permitir que desenvolvedores, arquitetos de software e sistemas de IA compreendam e operem todos os subsistemas do projeto.

---

## 🗺️ Mapa Navegável da Wiki

A documentação está dividida em 6 pilares temáticos. Utilize os links abaixo para navegar entre os módulos:

### 🏛️ 1. Arquitetura e Engenharia de Base
- [01. Visão Geral da Arquitetura](architecture/01-visao-geral.md) — Topologia global, filosofia Offline-First e o segredo do SPA Routing no GitHub Pages.
- [02. Modelo Relacional de Dados](architecture/02-modelo-de-dados.md) — Esquema PostgreSQL (Supabase), convenção de IDs semânticos e políticas de Row Level Security (RLS).
- [03. Gerenciamento de Estado e Sincronização](architecture/03-gerenciamento-de-estado.md) — O Singleton Cache-First \`DataStore\`, CustomEvents reativos e background sync.

### 📦 2. Módulos de Domínio e Operações
- [01. Gestão de Produtos e Controle de Validade](modules/01-produtos-e-validade.md) — Catálogo, sistema tricolor de perecibilidade, shelf-life preditivo e paginação/filtros.
- [02. Controle de Estoque, Lotes e Kardex](modules/02-estoque-e-lotes.md) — Rastreabilidade sanitária de lotes (\`lots\`), movimentações e saldos consolidados.
- [03. Motor de Cestas de Café da Manhã](modules/03-cestas-de-cafe.md) — Montagem paramétrica de kits (P/M/G), travas de bebidas por volumetria e despacho estruturado.
- [04. Motor de Etiquetas Térmicas de Gôndola](modules/04-etiquetas-termicas.md) — Impressão de gôndola via CSS Print, layout compacto e simulação de código de barras.

### 🧠 3. Inteligência Artificial e Visão Computacional
- [01. Pipeline Multimodal de IA](ai/01-pipeline-multimodal.md) — Análise fotográfica de produtos, detecção de lacunas em gôndolas, Edge Functions e fallback resiliente.

### 🔌 4. Integrações e Developer Ecosystem
- [01. In-Browser API Gateway e OpenAPI 3.0](integrations/01-api-gateway.md) — Emulação de gateway REST, tokens com hash SHA-256 de prefixo, Rate Limiting e Swagger.
- [02. Checkout e Despacho via WhatsApp](integrations/02-whatsapp-checkout.md) — Deep link internacional, comanda formatada em Markdown e gravação do intent de compra.

### 🛡️ 5. Segurança, Governança e Multi-Tenancy
- [01. Autenticação, IAM e Isolamento de Tenants](security/01-autenticacao-e-tenancy.md) — Supabase Auth, RBAC (\`app_role\`), profiles e isolamento por empresa.

### 🎨 6. Interface, Design System e Internacionalização
- [01. Design System, 20 Temas Dinâmicos e i18n](frontend/01-design-system-e-temas.md) — Injeção de variáveis CSS, suporte Dark/Light e dicionários em PT-BR, EN e ES.

---

## 🧭 Diagrama de Interconectividade da Wiki

\`\`\`mermaid
graph TD
    Home[Wiki Home: docs/README.md] --> Arch[1. Arquitetura]
    Home --> Mod[2. Módulos de Domínio]
    Home --> AI[3. Inteligência Artificial]
    Home --> Int[4. Integrações]
    Home --> Sec[5. Segurança & IAM]
    Home --> UI[6. Frontend & Temas]

    Arch --> Arch1[01-visao-geral.md]
    Arch --> Arch2[02-modelo-de-dados.md]
    Arch --> Arch3[03-gerenciamento-de-estado.md]

    Mod --> Mod1[01-produtos-e-validade.md]
    Mod --> Mod2[02-estoque-e-lotes.md]
    Mod --> Mod3[03-cestas-de-cafe.md]
    Mod --> Mod4[04-etiquetas-termicas.md]

    AI --> AI1[01-pipeline-multimodal.md]

    Int --> Int1[01-api-gateway.md]
    Int --> Int2[02-whatsapp-checkout.md]

    Sec --> Sec1[01-autenticacao-e-tenancy.md]

    UI --> UI1[01-design-system-e-temas.md]

    %% Relações Cruzadas
    Arch3 -.-> Mod1
    Mod1 -.-> Mod3
    Mod3 -.-> Int2
    AI1 -.-> Mod1
    Sec1 -.-> Arch2
\`\`\`

---

## 📌 Diretrizes de Leitura e Convenções

1. **Evite Duplicação de Conceitos:** Cada documento trata exclusivamente do seu escopo funcional e referencia os demais através de links relativos navegáveis.
2. **IDs Semânticos:** O sistema utiliza slugs alfanuméricos (\`comp-cesta-1\`, \`beb-suco-delvalle-200\`) em vez de UUIDs arbitrários para facilitar leitura física e interoperabilidade.
3. **Resiliência Offline:** Qualquer operação na plataforma é executada primeiro localmente (\`localStorage\`) e propagada em segundo plano para a nuvem.
`;

// 2. docs/architecture/01-visao-geral.md
const ARCH_01 = `# 🏛️ Visão Geral da Arquitetura e Topologia Global

## 1. Objetivo
Este documento define a topologia sistêmica do **Olivelas MarketFlow**, detalhando os princípios não-funcionais, a divisão em camadas cliente-servidor e a estratégia de execução do Single Page Application (SPA) em servidores de arquivos estáticos.

---

## 2. Visão Geral
O MarketFlow é uma aplicação web baseada em **React 18**, **TypeScript** e **Tailwind CSS**, operando com um Backend-as-a-Service (**Supabase / PostgreSQL 15**). A solução adota a filosofia **Offline-First com Degradação Graciosa**: a aplicação nunca bloqueia a navegação ou a entrada de dados em caso de lentidão ou ausência de conectividade com a nuvem.

Toda a camada frontend é hospedada no **GitHub Pages** (ambiente puramente estático), sem um servidor Node.js ou SSR intermediário, reduzindo o custo operacional de infraestrutura a zero.

---

## 3. Responsabilidades do Módulo
- Fornecer o runtime de interface reativa para operadores de loja e clientes finais.
- Resolver rotas e deep-links no navegador sem depender de reescritas do servidor web (\`mod_rewrite\` ou \`nginx\`).
- Gerenciar os limites de contexto entre a área administrativa restrita (\`/admin\`) e o catálogo público (\`/loja/:slug\`).
- Orquestrar a comunicação entre os componentes visuais e o motor de persistência híbrida.

---

## 4. Fluxo Interno: O "Hack" de Roteamento SPA no GitHub Pages

### O Problema do Roteamento em Servidores Estáticos
Servidores estáticos procuram arquivos físicos no disco. Quando um usuário acessa diretamente \`https://pycriador.github.io/olivelas-marketflow/admin/products\`, o GitHub Pages não encontra o arquivo \`admin/products.html\` e emite **HTTP 404**.

### A Solução em 2 Estágios (Redirect SPA Bypass)
O MarketFlow implementa o padrão industrial de redirecionamento em dois passos:

1. **Captura no \`public/404.html\`:** O arquivo de erro 404 captura o caminho requisitado, codifica a URI em parâmetros de busca (\`/?/admin/products\`) e executa um \`window.location.replace\`.
2. **Decodificação no \`<head>\` do \`index.html\`:** Antes do React inicializar, um script inline decodifica a query string e restaura o endereço original no histórico do browser via \`window.history.replaceState()\`.
3. **Roteador Vanilla no \`src/App.tsx\`:** O roteador customizado escuta o evento global \`popstate\` e atualiza a visualização sem recarregar a página.

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Cliente as Usuário / Navegador
    participant GHP as GitHub Pages
    participant FOF as public/404.html
    participant IDX as index.html (Head Script)
    participant APP as src/App.tsx (History Router)

    Cliente->>GHP: Acessa /olivelas-marketflow/admin/products
    GHP-->>FOF: Rota inexistente -> Serve 404.html
    Note over FOF: Codifica rota: /olivelas-marketflow/?/admin/products
    FOF->>Cliente: Executa window.location.replace()
    Cliente->>GHP: Requisita /olivelas-marketflow/ (raiz)
    GHP-->>IDX: Retorna index.html
    Note over IDX: Script intercepta query string e restaura histórico com replaceState()
    IDX->>APP: Inicializa React com URL /admin/products restaurada
    APP->>Cliente: Renderiza tela de produtos instantaneamente
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Modelo Relacional de Dados](02-modelo-de-dados.md):** Consome os schemas e endpoints PostgREST mapeados.
- **[Gerenciamento de Estado](03-gerenciamento-de-estado.md):** Inicializa o singleton \`DataStore\` durante o bootstrap do \`App.tsx\`.
- **[Autenticação e Tenancy](../security/01-autenticacao-e-tenancy.md):** Alimenta o \`AuthContext\` para proteção condicional de rotas.

---

## 6. Diagrama Arquitetural em Camadas

\`\`\`mermaid
graph TD
    subgraph Apresentacao ["Camada de Apresentação (Browser)"]
        UI_Store["Catálogo Público (/loja/:slug)"]
        UI_Admin["Portal Administrativo (/admin/*)"]
        Router["History State Router (App.tsx)"]
    end

    subgraph Contextos ["Contextos Reativos (React Context API)"]
        AuthCtx["AuthContext (Supabase Auth)"]
        ThemeCtx["ThemeContext (20 Temas)"]
        CompCtx["CompanyContext (Multi-Tenant Selector)"]
    end

    subgraph Estado ["Persistência Híbrida (Client-Side)"]
        DS["DataStore (Singleton Cache-First)"]
        LS[("localStorage")]
        Events["CustomEvent (marketflow_datastore_change)"]
    end

    subgraph Nuvem ["BaaS & Nuvem (Supabase Cloud)"]
        PostgREST["API REST PostgREST"]
        PG[("PostgreSQL 15 (Tabelas + RLS)")]
        Edge["Edge Functions (ai-analyze)"]
    end

    UI_Store --> Router
    UI_Admin --> Router
    Router --> AuthCtx
    Router --> ThemeCtx
    Router --> CompCtx

    AuthCtx --> DS
    CompCtx --> DS
    DS <--> LS
    DS --> Events
    Events --> UI_Admin
    Events --> UI_Store

    DS -.->|Sincronização Assíncrona| PostgREST
    PostgREST --> PG
    UI_Admin -.->|Visão Computacional| Edge
\`\`\`

---

## 7. Exemplos Práticos

### Snippet do Interceptor SPA no \`index.html\`
\`\`\`html
<script type="text/javascript">
  (function(l) {
    if (l.search[1] === '/' ) {
      var decoded = l.search.slice(1).split('&').map(function(s) { 
        return s.replace(/~and~/g, '&')
      }).join('?');
      window.history.replaceState(null, null,
          l.pathname.slice(0, -1) + decoded + l.hash
      );
    }
  }(window.location))
</script>
\`\`\`

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](02-modelo-de-dados.md)
- [Gerenciamento de Estado e Sincronização](03-gerenciamento-de-estado.md)
- [Autenticação e Tenancy](../security/01-autenticacao-e-tenancy.md)
- [Design System e 20 Temas](../frontend/01-design-system-e-temas.md)
`;

// 3. docs/architecture/02-modelo-de-dados.md
const ARCH_02 = `# 🗄️ Modelo Relacional de Dados e Segurança RLS

## 1. Objetivo
Especificar a modelagem de dados relacional oficial do **Olivelas MarketFlow**, as convenções de integridade referencial, a utilização de chaves primárias semânticas e as políticas de segurança a nível de linha (Row Level Security - RLS).

---

## 2. Visão Geral
O banco de dados é hospedado no **PostgreSQL 15** fornecido pelo Supabase. O esquema foi estruturado para atender a operações multi-empresa com isolamento estrito via \`company_id\` e relacionamento com os perfis de usuários autenticados (\`profiles\` vinculados a \`auth.users\`).

Um dos diferenciais do sistema é a adoção de **Chaves Primárias Naturais Semânticas** (\`TEXT PRIMARY KEY\`) para entidades de catálogo e configuração. Isso permite que códigos de barras, QR codes impressos em etiquetas e URLs amigáveis façam referência direta ao registro sem sobrecarga de mapeamento.

---

## 3. Responsabilidades do Módulo
- Garantir a persistência confiável de transações mercantis, produtos, clientes e pedidos.
- Aplicar regras de autorização no nível do banco via PostgreSQL Row Level Security (RLS).
- Manter o histórico de movimentações de estoque (Kardex) para auditoria e rastreabilidade sanitária.
- Sincronizar perfis de usuário automaticamente através do trigger \`handle_new_user\`.

---

## 4. Fluxo Interno: Ciclo de Criação de Perfil e Inquilinato

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User as Novo Usuário
    participant SBAuth as Supabase Auth (auth.users)
    participant Trg as Trigger on_auth_user_created
    participant Prof as public.profiles
    participant Mem as public.company_users
    participant Comp as public.companies

    User->>SBAuth: Realiza Cadastro (email + senha)
    SBAuth->>Trg: Executa após inserção no auth.users
    Trg->>Prof: Cria perfil público (id = auth.uid(), full_name)
    Comp->>Mem: Vincula usuário à empresa como 'admin'
    Mem-->>User: Acesso liberado aos dados do Tenant
\`\`\`

---

## 5. Diagrama Entidade-Relacionamento (ER)

\`\`\`mermaid
erDiagram
    COMPANIES ||--o{ COMPANY_USERS : "possui colaboradores"
    PROFILES ||--o{ COMPANY_USERS : "pertence a"
    COMPANIES ||--o{ CATEGORIES : "organiza produtos em"
    COMPANIES ||--o{ BRANDS : "comercializa marcas de"
    COMPANIES ||--o{ MANUFACTURERS : "cadastra fabricantes"
    COMPANIES ||--o{ SUPPLIERS : "recebe de fornecedores"
    COMPANIES ||--o{ PRODUCTS : "possui catálogo de"
    CATEGORIES ||--o{ PRODUCTS : "classifica"
    BRANDS ||--o{ PRODUCTS : "marca de"
    PRODUCTS ||--o{ INVENTORY_ITEMS : "mantém saldo em"
    PRODUCTS ||--o{ LOTS : "controla validade em"
    PRODUCTS ||--o{ INVENTORY_MOVEMENTS : "registra kardex"
    LOTS ||--o{ INVENTORY_MOVEMENTS : "lote afetado"
    COMPANIES ||--o{ CATALOG_REQUESTS : "recebe pedidos de"

    COMPANIES {
        TEXT id PK
        VARCHAR name
        VARCHAR slug UK
        VARCHAR phone
        VARCHAR whatsapp
        BOOLEAN breakfast_basket_enabled
        BOOLEAN active
    }

    PRODUCTS {
        TEXT id PK
        TEXT company_id FK
        TEXT category_id FK
        TEXT brand_id FK
        VARCHAR name
        NUMERIC sale_price
        NUMERIC cost_price
        DATE expiration_date
        VARCHAR unit
        BOOLEAN active_in_basket
        JSONB basket_sizes
        VARCHAR drink_tier
        BOOLEAN catalog_visible
    }

    LOTS {
        TEXT id PK
        TEXT company_id FK
        TEXT product_id FK
        VARCHAR lot_number
        DATE expiration_date
        INTEGER current_quantity
        VARCHAR status
    }

    CATALOG_REQUESTS {
        TEXT id PK
        TEXT company_id FK
        VARCHAR customer_name
        VARCHAR customer_phone
        NUMERIC total_amount
        JSONB items
        VARCHAR status
    }
\`\`\`

---

## 6. Relação com Outros Módulos
- **[Gerenciamento de Estado](03-gerenciamento-de-estado.md):** Todas as entidades mapeadas neste modelo possuem correspondência direta no \`localStorage\` e no \`DataStore\`.
- **[Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md):** Utiliza as colunas \`expiration_date\`, \`basket_sizes\` e \`drink_tier\` da tabela \`products\`.
- **[Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md):** Opera diretamente sobre \`inventory_items\`, \`lots\` e \`inventory_movements\`.

---

## 7. Exemplos Práticos

### DDL Canônica da Tabela \`products\`
\`\`\`sql
CREATE TABLE public.products (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  unit VARCHAR(20) NOT NULL DEFAULT 'UN',
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER NOT NULL DEFAULT 0,
  expiration_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  catalog_visible BOOLEAN NOT NULL DEFAULT true,
  active_in_basket BOOLEAN NOT NULL DEFAULT true,
  basket_sizes JSONB,               -- Ex: ["pequena", "media", "grande"]
  drink_tier VARCHAR(10),           -- Ex: 'P', 'M', 'G' ou NULL
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
\`\`\`

### Política RLS para Catálogo Público
\`\`\`sql
-- Visitantes podem visualizar empresas ativas e catálogo sem login
CREATE POLICY "Active companies viewable publicly" 
ON public.companies FOR SELECT 
USING (active = true);

CREATE POLICY "Public read products" 
ON public.products FOR SELECT 
USING (active = true);
\`\`\`

---

## 8. Referências para Outros Documentos
- [Visão Geral da Arquitetura](01-visao-geral.md)
- [Gerenciamento de Estado](03-gerenciamento-de-estado.md)
- [Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md)
- [Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md)
- [Autenticação e Tenancy](../security/01-autenticacao-e-tenancy.md)
`;

// 4. docs/architecture/03-gerenciamento-de-estado.md
const ARCH_03 = `# ⚡ Gerenciamento de Estado e Sincronização Híbrida

## 1. Objetivo
Descrever o padrão de persistência híbrida e gerenciamento de estado reativo implementado pela classe singleton \`DataStore\` (\`src/lib/data-store.ts\`).

---

## 2. Visão Geral
O MarketFlow utiliza uma abordagem **Cache-First Reativa**:
1. O usuário nunca espera por requisições de rede para interagir com o sistema.
2. Toda alteração de dados é salva de forma síncrona e imediata no \`localStorage\`.
3. Um evento customizado de broadcast (\`marketflow_datastore_change\`) é emitido na janela do navegador para notificar instantaneamente todos os componentes React em execução.
4. Em segundo plano (assincronamente), a mutação é enviada para os serviços PostgREST do Supabase.
5. Em caso de falha de conexão com o Supabase, a aplicação não interrompe a operação e continua com o estado local íntegro.

---

## 3. Responsabilidades do Módulo
- Abstrair as operações CRUD de todas as entidades do sistema.
- Gerenciar as chaves de particionamento local (\`marketflow_all_products\`, \`marketflow_all_companies\`, etc.).
- Emitir e escutar o evento nativo \`marketflow_datastore_change\`.
- Realizar o merge dos dados do banco remoto com o cache local através do método \`syncWithRemote()\`.

---

## 4. Fluxo Interno: Mutação Otimista e Sincronização

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Op as Operador / UI
    participant Comp as Componente React (ex: ProductList)
    participant DS as DataStore (Singleton)
    participant LS as localStorage
    participant Bus as window.dispatchEvent(marketflow_datastore_change)
    participant SB as Supabase PostgREST (Async)

    Op->>Comp: Salva ou Edita Produto
    Comp->>DS: dataStore.saveProduct(prod)
    DS->>LS: saveToStorage(STORAGE_KEYS.PRODUCTS, updated)
    DS->>Bus: Emite CustomEvent
    Bus-->>Comp: Componente escuta evento e executa setProducts()
    Note over Comp: UI atualizada em ~0ms (zero latência percebida)
    DS-)SB: productsService.updateProduct(prod) (em background)
    Note over SB: Se falhar ou offline: captura erro com catch() silencioso
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Visão Geral da Arquitetura](01-visao-geral.md):** Integrado diretamente ao ciclo de vida da aplicação.
- **[Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md):** Provê os métodos \`getProducts\`, \`saveProduct\` e \`deleteProduct\`.
- **[Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md):** Provê métodos de consulta e movimentação de inventário e lotes.
- **[Motor de Cestas de Café](../modules/03-cestas-de-cafe.md):** Alimenta o catálogo de montagem com os dados da empresa e produtos.

---

## 6. Diagrama de Estados do DataStore

\`\`\`mermaid
stateDiagram-v2
    [*] --> Inativo
    Inativo --> Inicializado: Aplicação carrega
    Inicializado --> LeituraLocal: getProducts(companyId)
    LeituraLocal --> ExibicaoUI: Retorna dados do localStorage
    
    ExibicaoUI --> Mutacao: Usuário cria/edita item
    Mutacao --> GravacaoLocal: Grava no localStorage
    GravacaoLocal --> Broadcast: Dispara marketflow_datastore_change
    Broadcast --> ExibicaoUI: Re-renderiza componentes
    GravacaoLocal --> SyncRemotoAssincrono: Chama Supabase Service
    SyncRemotoAssincrono --> Concluido: Sucesso na nuvem
    SyncRemotoAssincrono --> FallbackOffline: Erro na rede / Permanece local
\`\`\`

---

## 7. Exemplos Práticos

### Disparo e Escuta Reativa do Evento
\`\`\`typescript
// Dentro do DataStore (src/lib/data-store.ts):
function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    window.dispatchEvent(new CustomEvent('marketflow_datastore_change', { detail: { key } }));
  } catch (err) {
    console.error('Erro ao salvar no localStorage:', err);
  }
}

// Dentro do Componente React (ex: product-list.tsx):
React.useEffect(() => {
  const handleUpdate = () => {
    setProducts(dataStore.getProducts(currentCompany?.id));
  };
  window.addEventListener('marketflow_datastore_change', handleUpdate);
  return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
}, [currentCompany]);
\`\`\`

---

## 8. Referências para Outros Documentos
- [Visão Geral da Arquitetura](01-visao-geral.md)
- [Modelo Relacional de Dados](02-modelo-de-dados.md)
- [Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md)
- [Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md)
`;

// 5. docs/modules/01-produtos-e-validade.md
const MOD_01 = `# 🍎 Gestão de Produtos e Controle de Validade

## 1. Objetivo
Especificar as regras de cadastro, busca, paginação e o motor de controle de datas de validade de itens perecíveis no **Olivelas MarketFlow**.

---

## 2. Visão Geral
O módulo de produtos centraliza o inventário mercantil da loja, unindo informações comerciais (preços, código de barras, SKU) a metadados operacionais críticos:
1. **Controle de Validade Tricolor:** Indicadores visuais imediatos de vencimento.
2. **Shelf-Life Preditivo:** Sugestão inteligente de vida útil no momento do cadastro por categoria.
3. **Filtros Paramétricos em Dropdown:** Busca combinada com sincronização automática na URL (\`window.history.pushState\`).
4. **Paginação com Seletor 10, 20 ou 30 itens:** Navegação consistente em tabelas densas.

---

## 3. Responsabilidades do Módulo
- Manter o cadastro de produtos sincronizado entre \`localStorage\` e Supabase.
- Computar dinamicamente os dias restantes para o vencimento (\`daysLeft = expirationDate - hoje\`).
- Exibir alertas nas listagens: Vencido (vermelho), Vencendo logo $\le 15$ dias (âmbar) e No prazo (verde).
- Expor dados para o gerador de etiquetas de gôndola e para o catálogo de cestas.

---

## 4. Fluxo Interno: Classificação de Validade

\`\`\`mermaid
flowchart TD
    Inicio([Produto com data de validade]) --> Calc[Calcula dias restantes: daysLeft]
    Calc --> TesteVencido{daysLeft < 0?}
    TesteVencido -- Sim --> BadgeVencido[Badge Vermelho Destructive: Vencido há X dias]
    TesteVencido -- Não --> TesteAlerta{daysLeft <= 15?}
    TesteAlerta -- Sim --> BadgeAlerta[Badge Âmbar Warning: Vence hoje ou em X dias]
    TesteAlerta -- Não --> BadgeValido[Badge Verde Emerald: No prazo - data formatada]
    
    BadgeVencido --> Fim([Renderização na Tabela])
    BadgeAlerta --> Fim
    BadgeValido --> Fim
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md):** Lê e persiste itens via \`dataStore.getProducts()\` e \`dataStore.saveProduct()\`.
- **[Controle de Estoque e Lotes](02-estoque-e-lotes.md):** Relaciona produtos a saldos de inventário consolidado e lotes de fabricação.
- **[Motor de Cestas de Café](03-cestas-de-cafe.md):** Fornece produtos ativos com as flags \`active_in_basket\`, \`basket_sizes\` e \`drink_tier\`.
- **[Motor de Etiquetas Térmicas](04-etiquetas-termicas.md):** Envia dados de preço, código de barras e unidade para impressão física.

---

## 6. Tabela de Shelf-Life Preditivo por Categoria

Quando um produto é cadastrado e não possui validade informada, a função \`getRealExpirationDate\` aplica a vida útil recomendada:

| Categoria Biológica | Prazo Estimado | Exemplos no Sistema |
| :--- | :--- | :--- |
| **Frutas Frescas** | 3 a 7 dias | Banana Prata (3d), Mamão Papaya (5d), Uva (7d) |
| **Frios e Queijos Fatiados** | 5 a 15 dias | Presunto Seara (5d), Queijo Prato (12d), Mussarela (15d) |
| **Padaria Artesanal** | 3 a 5 dias | Croissant Francês (3d), Rosca Doce (5d) |
| **Panificação Industrial** | 14 a 18 dias | Pão de Forma Pullman (14d), Bisnaguinha (18d) |
| **Laticínios Líquidos** | 7 a 14 dias | Iogurte Danone (7d), Leite Fresco (14d) |
| **Sucos e Refrigerantes UHT** | 45 a 120 dias | Suco de Soja Ades (45d), Suco de Uva Integral (120d) |
| **Mercearia Seca & Biscoitos** | 90 a 150 dias | Biscoito Club Social (90d), Cream Cracker (120d) |
| **Doces e Geleias Lacradas** | 180 a 365 dias | Mel Silvestre (365d), Doce de Leite Viçosa (180d) |
| **Canecas e Brindes** | \`undefined\` | Não perecível |

---

## 7. Exemplos Práticos

### Snippet de Renderização do Badge de Validade
\`\`\`tsx
if (daysLeft !== null && daysLeft < 0) {
  return (
    <div className="inline-flex flex-col items-center">
      <Badge variant="destructive" className="text-[10px] py-0 px-1.5 font-mono">
        Vencido ({Math.abs(daysLeft)}d)
      </Badge>
      <span className="text-[10px] text-destructive font-mono mt-0.5">
        {formatDate(product.expiration_date)}
      </span>
    </div>
  );
}
\`\`\`

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
- [Controle de Estoque e Lotes](02-estoque-e-lotes.md)
- [Motor de Cestas de Café](03-cestas-de-cafe.md)
- [Motor de Etiquetas Térmicas](04-etiquetas-termicas.md)
`;

// 6. docs/modules/02-estoque-e-lotes.md
const MOD_02 = `# 📦 Controle de Estoque, Lotes e Kardex

## 1. Objetivo
Documentar a arquitetura de inventário físico, o controle de rastreabilidade de lotes (\`lots\`) com data de vencimento específica e o histórico de movimentações contábeis de estoque (\`inventory_movements\`).

---

## 2. Visão Geral
O sistema mantém dois níveis de controle de estoque:
1. **Estoque Consolidado (\`inventory_items\`):** Mantém o saldo total (\`quantity\`) e a quantidade reservada (\`reserved_quantity\`) por produto e empresa.
2. **Rastreabilidade por Lote (\`lots\`):** Cada lote possui número identificador, data de fabricação, data de validade obrigatória, quantidade inicial e saldo atual.

Toda alteração de saldo gera uma entrada imutável no Kardex (\`inventory_movements\`), registrando motivo, documento de suporte e usuário responsável.

---

## 3. Responsabilidades do Módulo
- Registrar entradas de mercadorias vinculadas a fornecedores e notas fiscais.
- Efetuar baixas automáticas de estoque em montagens de kits e cestas.
- Fornecer relatórios de rupturas e produtos com saldo abaixo do estoque mínimo.
- Alimentar a visualização de lotes próximos ao vencimento para ações promocionais de desova preventiva.

---

## 4. Fluxo Interno: Movimentação de Estoque e Kardex

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Op as Operador de Estoque
    participant UI as Tela de Movimentações
    participant DS as DataStore
    participant Lot as Tabela Lots
    participant Inv as Tabela Inventory Items
    participant Mov as Tabela Inventory Movements

    Op->>UI: Registra Entrada de Estoque (Lote, Qtd, Custo)
    UI->>DS: dataStore.saveLot() & saveMovement()
    DS->>Lot: Cria ou atualiza o saldo do Lote
    DS->>Inv: Incrementa saldo consolidado daquele produto
    DS->>Mov: Grava registro no Kardex com tipo 'in' e motivo
    DS-->>UI: Atualiza contadores em tempo real na interface
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](01-produtos-e-validade.md):** Cada lote está associado a um \`product_id\` canônico.
- **[Motor de Cestas de Café](03-cestas-de-cafe.md):** Quando uma cesta é montada e despachada, as baixas são debitadas dos itens correspondentes.
- **[API Gateway](../integrations/01-api-gateway.md):** Expõe endpoints seguros para sincronização de saldo de estoque via REST.

---

## 6. Diagrama de Entidades de Estoque

\`\`\`mermaid
classDiagram
    class InventoryItem {
        +String id
        +String company_id
        +String product_id
        +Integer quantity
        +Integer reserved_quantity
        +String location
    }

    class Lot {
        +String id
        +String company_id
        +String product_id
        +String lot_number
        +Integer current_quantity
        +Date expiration_date
        +String status
    }

    class InventoryMovement {
        +String id
        +String company_id
        +String product_id
        +String lot_id
        +String type
        +Integer quantity
        +Integer previous_quantity
        +Integer new_quantity
        +String reason
    }

    InventoryItem "1" -- "*" Lot : agrupa
    Lot "1" -- "*" InventoryMovement : rastreia
\`\`\`

---

## 7. Exemplos Práticos

### Objeto JSON de Registro de Kardex
\`\`\`json
{
  "id": "mov-1042",
  "company_id": "comp-cesta-1",
  "product_id": "pb-pao-queijo-fdm",
  "lot_id": "lot-2026-09-fdm",
  "type": "out",
  "quantity": 2,
  "previous_quantity": 25,
  "new_quantity": 23,
  "reason": "Montagem Cesta Grande Pedido #9812",
  "document_reference": "PED-9812",
  "created_at": "2026-09-07T14:30:00.000Z"
}
\`\`\`

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gestão de Produtos e Validade](01-produtos-e-validade.md)
- [Motor de Cestas de Café](03-cestas-de-cafe.md)
- [In-Browser API Gateway](../integrations/01-api-gateway.md)
`;

// 7. docs/modules/03-cestas-de-cafe.md
const MOD_03 = `# 🧺 Motor de Cestas de Café da Manhã

## 1. Objetivo
Documentar as regras de negócio, restrições paramétricas de volumetria e a lógica de precificação do motor de montagem interativa de **Cestas de Café da Manhã**.

---

## 2. Visão Geral
O motor de cestas permite que clientes finais montem suas próprias cestas de presentes no catálogo público da loja (\`/loja/:slug/cesta\`). O sistema resolve a complexidade logística do varejo de cestas aplicando regras rígidas de capacidade e proporcionalidade:
- Limite máximo de itens por porte de cesta.
- **Trava Obrigatória de Bebidas:** Toda cesta exige pelo menos uma bebida compatível com o seu porte (evitando que uma cesta grande receba uma bebida pequena de 200ml ou vice-versa).
- **Cálculo Dinâmico em Tempo Real:** Atualização instantânea do valor conforme os itens são marcados.

---

## 3. Responsabilidades do Módulo
- Aplicar a matriz de restrições de porte (Pequena, Média, Grande).
- Validar se a cesta possui ao menos 1 bebida do \`drink_tier\` correspondente.
- Impedir que a contagem de itens ultrapasse o \`maxItens\` configurado.
- Gerar o payload estruturado para persistência em \`catalog_requests\` e despacho via WhatsApp.

---

## 4. Matriz Paramétrica de Portes de Cesta

| Porte | Preço Base | Limite de Itens | Restrição de Bebida (\`drink_tier\`) | Destaque Visual |
| :--- | :--- | :--- | :--- | :--- |
| **Pequena** | R$ 15,00 | Até 5 itens | Exige $\ge 1$ bebida Tier "P" (~200 ml) | Econômica |
| **Média** | R$ 20,00 | Até 8 itens | Exige $\ge 1$ bebida Tier "M" (~500 ml) | Mais Vendida (Badge Destaque) |
| **Grande** | R$ 25,00 | Até 12 itens | Exige $\ge 1$ bebida Tier "G" (~1 Litro) | Premium / Família |

---

## 5. Fluxo Interno: Validação e Checkout da Cesta

\`\`\`mermaid
flowchart TD
    Inicio([Cliente Seleciona Porte da Cesta]) --> Escolha[Adiciona Produtos das Categorias]
    Escolha --> LimiteQtd{Qtd itens > Limite Máximo?}
    LimiteQtd -- Sim --> BloqueioQtd[Bloqueia Adição: Limite da Cesta Atingido]
    LimiteQtd -- Não --> ValidaBebida{Possui >= 1 Bebida do Tier Correto?}
    ValidaBebida -- Não --> BloqueioBebida[Aviso: Toda cesta precisa de pelo menos 1 bebida correspondente]
    ValidaBebida -- Sim --> LiberaCheckout[Botão Enviar Pedido Habilitado]
    
    LiberaCheckout --> SalvaBD[Registra em catalog_requests]
    SalvaBD --> GeraWhats[Gera Deep Link com Comanda Formatada]
    GeraWhats --> Redireciona([Abre WhatsApp do Lojista])
\`\`\`

---

## 6. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](01-produtos-e-validade.md):** Os produtos exibidos respeitam as flags \`active_in_basket: true\` e \`basket_sizes\`.
- **[Checkout e Despacho via WhatsApp](../integrations/02-whatsapp-checkout.md):** Recebe o carrinho validado para codificação de URI e transmissão ao lojista.
- **[Controle de Estoque e Lotes](02-estoque-e-lotes.md):** Alimenta as baixas de estoque dos produtos envolvidos na cesta.

---

## 7. Exemplos Práticos

### Comanda Gerada no WhatsApp
\`\`\`text
*Novo Pedido de Cesta - Cestas de Café da Manhã*
-----------------------------------
Tamanho: Cesta Média (R$ 20,00)

Itens Escolhidos:
- 1x Suco Natural One Laranja 500 ml (R$ 10,90)
- 1x Pão de Queijo Forno de Minas (R$ 16,90)
- 1x Presunto Seara Fatiado 200g (R$ 8,90)
- 1x Caneca Personalizada (R$ 24,90)

*Total do Pedido: R$ 81,60*
Cliente: Roberto Silva
Telefone: (11) 96382-0374
\`\`\`

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gestão de Produtos e Validade](01-produtos-e-validade.md)
- [Checkout e Despacho via WhatsApp](../integrations/02-whatsapp-checkout.md)
`;

// 8. docs/modules/04-etiquetas-termicas.md
const MOD_04 = `# 🏷️ Motor de Etiquetas Térmicas de Gôndola

## 1. Objetivo
Especificar o motor de visualização e geração de etiquetas de gôndola e código de barras (\`src/pages/admin/products/product-labels.tsx\`) para impressoras de bobina térmica e folhas A4 de etiquetas adesivas.

---

## 2. Visão Geral
Para garantir a operação integrada entre o sistema digital e a loja física, o MarketFlow inclui um módulo de geração de etiquetas de prateleira compatível com qualquer impressora instalada no sistema operacional (Epson, Zebra, Argox ou impressoras jato de tinta/laser comuns).

O módulo opera em **CSS Print Media** nativo (\`@media print\`), eliminando a necessidade de drivers proprietários ou plugins externos.

---

## 3. Responsabilidades do Módulo
- Permitir seleção individual ou em lote de produtos para etiquetagem.
- Exibir pré-visualização em tempo real das etiquetas antes do disparo da impressão.
- Formatar o layout em grid balanceado de 3 ou 4 colunas com quebra de página automática (\`break-inside: avoid\`).
- Renderizar em alto contraste: Nome da Loja, Nome do Produto em 2 linhas, Preço de Venda em destaque e representação de código de barras com unidade de medida.

---

## 4. Fluxo Interno: Seleção e Disparo da Impressão

\`\`\`mermaid
flowchart TD
    Inicio([Acesso à tela /admin/products/labels]) --> Tabela[Tabela com Filtros e Seleção com Checkboxes]
    Tabela --> Escolha[Marca produtos para impressão]
    Escolha --> Preview[Preview em grade das etiquetas na tela]
    Preview --> Disparo[Clica em 'Imprimir Folha Agora']
    Disparo --> NativePrint[Invoca window.print()]
    NativePrint --> CSSPrint[Aplica estilos @media print]
    CSSPrint --> Saida([Impressão Física sem cabeçalhos de browser])
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](01-produtos-e-validade.md):** Obtém nomes, preços, unidades, códigos de barras e status dos produtos.
- **[Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md):** Escuta atualizações no \`DataStore\` para refletir preços alterados em tempo real.

---

## 6. Diagrama do Gabarito Visual da Etiqueta

\`\`\`mermaid
classDiagram
    class EtiquetaGondola {
        +Topo: Nome da Empresa em Caixa Alta (truncate)
        +Titulo: Nome do Produto (line-clamp-2)
        +Corpo: Preço R$ Grande em Fonte Mono
        +Rodape: Ícone Barcode + Código EAN + Unidade (UN/KG)
    }
\`\`\`

---

## 7. Exemplos Práticos

### Estrutura HTML da Etiqueta de Impressão
\`\`\`tsx
<div className="border-2 border-black bg-white text-black p-3 rounded-md flex flex-col justify-between h-36 shadow-sm print:shadow-none print:break-inside-avoid">
  <div>
    <span className="text-[10px] uppercase font-bold text-gray-500 block truncate">
      {currentCompany?.name}
    </span>
    <h4 className="font-extrabold text-sm leading-tight uppercase line-clamp-2 mt-0.5">
      {product.name}
    </h4>
  </div>

  <div className="my-1 flex items-baseline justify-between border-t border-b border-black py-1">
    <span className="text-[10px] font-bold uppercase">Preço R$</span>
    <span className="text-xl font-black font-mono">
      {product.sale_price.toFixed(2).replace('.', ',')}
    </span>
  </div>

  <div className="flex items-center justify-between text-[9px] font-mono">
    <div className="flex items-center space-x-1">
      <Barcode className="h-4 w-4 shrink-0" />
      <span>{product.barcode || product.sku || '789000000000'}</span>
    </div>
    <span>UN: {product.unit}</span>
  </div>
</div>
\`\`\`

---

## 8. Referências para Outros Documentos
- [Gestão de Produtos e Validade](01-produtos-e-validade.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
`;

// 9. docs/ai/01-pipeline-multimodal.md
const AI_01 = `# 🧠 Pipeline Multimodal de IA e Visão Computacional

## 1. Objetivo
Descrever o pipeline de inteligência artificial multimodal com visão computacional para o varejo (\`src/services/ai/ai-service.ts\`), responsável pelo reconhecimento fotográfico de produtos e gôndolas.

---

## 2. Visão Geral
O **MarketFlow AI Vision** permite que operadores de loja utilizem fotos capturadas por celular ou câmeras de gôndola para:
1. **Cadastro Automático de Produtos:** Extrai nome comercial, código de barras, unidade e sugere preço com base na margem padrão (65%).
2. **Reconhecimento de Prateleira (Ruptura de Estoque):** Detecta lacunas vazias em gôndolas e calcula o score de itens faltantes.
3. **Extração de Validade via OCR:** Identifica datas de validade impressas em embalagens.

A arquitetura protege as chaves dos modelos de IA utilizando **Supabase Edge Functions** como proxy seguro e implementa um **Fallback Heurístico Local** quando a rede está inacessível.

---

## 3. Responsabilidades do Módulo
- Delegar a inferência para a Edge Function \`supabase.functions.invoke('ai-analyze')\` no backend.
- Prover o adaptador de contingência \`MockAIAdapter\` para homologação e operação offline.
- Avaliar a pontuação de confiança (\`confidence_score\`). Quando inferior a 0.85, sinalizar \`requires_human_review: true\`.
- Registrar auditoria de consumo e custos estimados em dólares no log de uso de IA.

---

## 4. Fluxo Interno: Execução de Análise Visual

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Op as Operador / Câmera
    participant UI as Interface de Análise
    participant AISvc as AIService
    participant Edge as Supabase Edge Function (ai-analyze)
    participant Fallback as MockAIAdapter (Local Heurístico)
    participant Log as Log de Jobs e Custos

    Op->>UI: Envia foto do produto
    UI->>AISvc: AIService.analyzeProductImage(params)
    
    alt Supabase Configurado e Online
        AISvc->>Edge: invoke('ai-analyze', { imageUrl, provider })
        Edge-->>AISvc: Retorna resultado inferido pelo modelo neural
    else Backend Indisponível ou Offline
        AISvc->>Fallback: Executa análise simulada inteligente (delay 600ms)
        Fallback-->>AISvc: Retorna dados estruturados de contingência
    end

    AISvc->>Log: Registra job, input_tokens, output_tokens e cost_usd
    AISvc-->>UI: Retorna sugestão + requiresHumanReview flag
    UI->>Op: Exibe formulário pré-preenchido para confirmação
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md):** Alimenta o formulário de cadastro de produtos com os dados extraídos.
- **[Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md):** Apoia a conferência de entrada de mercadorias por lote.
- **[Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md):** Persiste o histórico de processamento nas tabelas de auditoria.

---

## 6. Diagrama de Classes do Serviço de IA

\`\`\`mermaid
classDiagram
    class AIProviderAdapter {
        <<interface>>
        +analyzeProductImage(imageUrl)
        +recognizeShelf(imageUrl)
        +performOCR(imageUrl)
    }

    class MockAIAdapter {
        +analyzeProductImage(imageUrl)
        +recognizeShelf(imageUrl)
        +performOCR(imageUrl)
    }

    class OpenAIAdapter {
        -String apiKey
        +analyzeProductImage(imageUrl)
    }

    class GeminiAdapter {
        -String apiKey
        +analyzeProductImage(imageUrl)
    }

    class AIService {
        +analyzeProductImage(params)
        +recognizeShelf(params)
        +logJob(job)
        +logUsage(usage)
    }

    AIProviderAdapter <|.. MockAIAdapter
    AIProviderAdapter <|.. OpenAIAdapter
    AIProviderAdapter <|.. GeminiAdapter
    AIService --> AIProviderAdapter
\`\`\`

---

## 7. Exemplos Práticos

### Payload de Resposta da Análise de Imagem
\`\`\`json
{
  "suggested_name": "Café Torrado e Moído Gourmet 500g",
  "suggested_description": "Café 100% Arábica de torra média com notas achocolatadas.",
  "suggested_price": 24.90,
  "suggested_cost_price": 15.20,
  "barcode": "7891000123456",
  "unit": "UN",
  "suggested_category": "Bebidas & Matinais",
  "suggested_brand": "Café do Ponto",
  "confidence_score": 0.92,
  "notes": "Rótulo frontal legível com código de barras NCM identificável."
}
\`\`\`

---

## 8. Referências para Outros Documentos
- [Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md)
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
`;

// 10. docs/integrations/01-api-gateway.md
const INT_01 = `# 🔌 In-Browser API Gateway e OpenAPI 3.0

## 1. Objetivo
Especificar a arquitetura do Gateway de API REST emulado no navegador (\`src/api/v1/router.ts\`) e o portal interativo de documentação com Swagger / OpenAPI 3.0 (\`src/pages/admin/api/api-page.tsx\`).

---

## 2. Visão Geral
Para permitir que ERPs legados, sistemas de PDV externos e plataformas de e-commerce integrem com o MarketFlow mesmo quando hospedado em ambiente estático no GitHub Pages, o sistema conta com um **API Gateway Emulado no Navegador**.

O gateway implementa autenticação via Bearer Token identificável, armazenamento seguro de hashes SHA-256, Rate Limiting baseado em janela deslizante e documentação OpenAPI 3.0 navegável e executável.

---

## 3. Responsabilidades do Módulo
- Gerar e validar API Keys identificáveis: \`mf_live_...\` (produção) e \`mf_test_...\` (sandbox).
- Persistir apenas o hash SHA-256 da chave e o prefixo visível no banco/storage. O token pleno é exibido estritamente uma única vez no momento da criação.
- Aplicar **Rate Limiting de 60 requisições por minuto** por token de acesso.
- Registrar log de auditoria com método HTTP, rota, código de status e latência em milissegundos.
- Servir a especificação OpenAPI 3.0 e a interface Swagger interativa.

---

## 4. Fluxo Interno: Processamento de Requisições da API

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Dev as Sistema Externo / Swagger
    participant GW as ApiRouter (src/api/v1/router.ts)
    participant Rate as Rate Limiter (60 req/min)
    participant Auth as Auth & Scope Validator
    participant DS as DataStore
    participant Log as ApiRequestLog

    Dev->>GW: HTTP Request (GET /api/v1/products com Bearer Token)
    GW->>Rate: Verifica limite de chamadas
    alt Limite Excedido (> 60 req/min)
        Rate-->>Dev: HTTP 429 Too Many Requests
    else Limite Válido
        GW->>Auth: Valida hash SHA-256 e escopo 'products:read'
        alt Token Inválido ou Sem Permissão
            Auth-->>Dev: HTTP 401 Unauthorized ou 403 Forbidden
        else Autorizado
            GW->>DS: dataStore.getProducts(companyId)
            DS-->>GW: Retorna lista de produtos
            GW->>Log: Registra chamada no histórico de requisições
            GW-->>Dev: HTTP 200 OK com payload JSON
        end
    end
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md):** Expõe endpoints para consulta e criação de produtos via API.
- **[Controle de Estoque e Lotes](../modules/02-estoque-e-lotes.md):** Expõe endpoints para consulta de inventário.
- **[Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md):** Opera diretamente sobre os dados do \`DataStore\`.

---

## 6. Especificação das Chaves de API

| Ambiente | Prefixo do Token | Exemplo Gerado |
| :--- | :--- | :--- |
| **Produção** | \`mf_live_\` | \`mf_live_9a8b7c6d5e4f3a2b1c0d9e8f\` |
| **Sandbox / Teste** | \`mf_test_\` | \`mf_test_1f2e3d4c5b6a7f8e9d0c1b2a\` |

---

## 7. Exemplos Práticos

### Chamada cURL Simulatória
\`\`\`bash
curl -X GET "https://pycriador.github.io/olivelas-marketflow/api/v1/products" \\
  -H "Authorization: Bearer mf_live_9a8b7c6d5e4f3a2b1c0d9e8f" \\
  -H "Content-Type: application/json"
\`\`\`

### Formato de Resposta de Erro Padronizada
\`\`\`json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Limite de 60 requisições por minuto atingido para esta chave.",
    "retry_after_seconds": 24
  }
}
\`\`\`

---

## 8. Referências para Outros Documentos
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
- [Gestão de Produtos e Validade](../modules/01-produtos-e-validade.md)
`;

// 11. docs/integrations/02-whatsapp-checkout.md
const INT_02 = `# 💬 Checkout e Despacho via WhatsApp

## 1. Objetivo
Documentar a integração do catálogo público com a API de Deep Link do WhatsApp para fechamento ágil de pedidos sem atrito de cadastro.

---

## 2. Visão Geral
No varejo de proximidade e no comércio especializado em presentes, a taxa de conversão aumenta drasticamente quando o comprador não é forçado a preencher formulários de checkout com dados de cartão de crédito.

O MarketFlow adota o fluxo de **Conversão Direta via WhatsApp**:
1. O cliente escolhe os produtos ou monta sua cesta no catálogo da loja.
2. O sistema valida as regras e totaliza o pedido.
3. Um registro de intent de compra é salvo no banco (\`catalog_requests\`).
4. Uma mensagem em Markdown estruturada é gerada e codificada na URL oficial \`https://wa.me/{numero}?text={texto}\`.
5. O WhatsApp Web ou aplicativo mobile do cliente é aberto com a comanda pronta para envio.

---

## 3. Responsabilidades do Módulo
- Sanitizar o número de telefone da empresa no padrão internacional E.164 (ex: \`5511963820374\`).
- Codificar os caracteres especiais e quebras de linha com \`encodeURIComponent\`.
- Gravar o registro histórico em \`catalog_requests\` no Supabase e \`DataStore\`.
- Disparar a navegação externa transparente para o usuário.

---

## 4. Fluxo Interno: Sequência de Checkout via WhatsApp

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente no Catálogo
    participant Store as Catálogo / Montador de Cesta
    participant DS as DataStore
    participant SB as Supabase (catalog_requests)
    participant WA as API WhatsApp (wa.me)

    Cliente->>Store: Clica em 'Finalizar Pedido via WhatsApp'
    Store->>DS: dataStore.saveRequest(pedido)
    DS-)SB: POST /rest/v1/catalog_requests
    Store->>WA: window.open('https://wa.me/5511963820374?text=...')
    WA-->>Cliente: Abre WhatsApp com comanda pronta para envio
    Cliente->>WA: Envia mensagem ao lojista com 1 clique
\`\`\`

---

## 5. Relação com Outros Módulos
- **[Motor de Cestas de Café](../modules/03-cestas-de-cafe.md):** É o principal originador de pedidos customizados para o WhatsApp.
- **[Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md):** Grava o registro estruturado na tabela \`catalog_requests\`.
- **[Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md):** Mantém o histórico no cache local da aplicação.

---

## 6. Exemplos Práticos

### Função de Geração do Link no Código
\`\`\`typescript
export function buildWhatsAppOrderLink(
  phone: string,
  storeName: string,
  items: { name: string; quantity: number; price: number }[],
  total: number,
  customerName?: string
): string {
  const cleanPhone = phone.replace(/\\D/g, '');
  
  let msg = \`*Novo Pedido - \${storeName}*\\n\`;
  msg += \`-----------------------------------\\n\`;
  items.forEach(item => {
    msg += \`- \${item.quantity}x \${item.name} (R$ \${item.price.toFixed(2).replace('.', ',')})\\n\`;
  });
  msg += \`\\n*Total: R$ \${total.toFixed(2).replace('.', ',')}*\\n\`;
  if (customerName) {
    msg += \`Cliente: \${customerName}\\n\`;
  }

  return \`https://wa.me/\${cleanPhone}?text=\${encodeURIComponent(msg)}\`;
}
\`\`\`

---

## 7. Referências para Outros Documentos
- [Motor de Cestas de Café](../modules/03-cestas-de-cafe.md)
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [Gerenciamento de Estado](../architecture/03-gerenciamento-de-estado.md)
`;

// 12. docs/security/01-autenticacao-e-tenancy.md
const SEC_01 = `# 🛡️ Autenticação, IAM e Isolamento de Tenants

## 1. Objetivo
Especificar a arquitetura de segurança, gestão de identidades (IAM), controle de acesso baseado em papéis (RBAC) e o isolamento multi-inquilino (Multi-Tenancy) do **Olivelas MarketFlow**.

---

## 2. Visão Geral
O MarketFlow emprega autenticação oficial do **Supabase Auth** complementada por políticas de **Row Level Security (RLS)** no PostgreSQL. A aplicação assegura que:
1. Operadores de uma loja jamais visualizem ou modifiquem dados de outra loja.
2. Visitantes públicos do catálogo possam consultar produtos ativos e criar solicitações sem login.
3. Operações críticas (exclusão de empresas, manipulação de usuários) sejam restritas a administradores.

---

## 3. Responsabilidades do Módulo
- Gerenciar o ciclo de vida da sessão do usuário com tokens JWT armazenados com segurança.
- Mapear permissões utilizando o tipo enumerado \`app_role\` no banco de dados.
- Interceptar rotas da área administrativa (\`/admin/*\`) redirecionando usuários não autenticados para o formulário de login.
- Sincronizar perfis de usuário entre \`auth.users\` e a tabela \`profiles\`.

---

## 4. Matriz de Papéis de Acesso (RBAC)

| Papel (\`app_role\`) | Descrição | Permissões no Sistema |
| :--- | :--- | :--- |
| **\`global_admin\`** | Superusuário da Plataforma | Acesso irrestrito a todas as empresas, configurações globais e logs de IA. |
| **\`admin\`** | Gestor da Loja / Tenant | Gestão de produtos, colaboradores da empresa, configurações de catálogo e API keys. |
| **\`stock\`** | Operador de Estoque | Visualização e registro de entradas/saídas de inventário e lotes de produtos. |
| **\`visitor\`** | Cliente / Visitante | Visualização de lojas e produtos ativos; montagem e envio de pedidos. |

---

## 5. Fluxo Interno: Validação de Acesso a Rotas Administrativas

\`\`\`mermaid
flowchart TD
    Req([Navegação para /admin/*]) --> AuthCheck{Usuário Autenticado no AuthContext?}
    AuthCheck -- Não --> RedirectLogin[Redireciona para /login]
    AuthCheck -- Sim --> TenantCheck{Usuário pertence à empresa ativa?}
    TenantCheck -- Não --> BloqueioAcesso[Exibe Alerta: Sem Permissão neste Tenant]
    TenantCheck -- Sim --> RoleCheck{Papel compatível com a ação?}
    RoleCheck -- Não --> BloqueioRole[Desabilita botões ou bloqueia ação]
    RoleCheck -- Sim --> LiberaTela[Renderiza a tela administrativa solicitada]
\`\`\`

---

## 6. Relação com Outros Módulos
- **[Visão Geral da Arquitetura](../architecture/01-visao-geral.md):** Fornece o \`AuthContext\` que engloba as rotas do \`App.tsx\`.
- **[Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md):** Define as tabelas \`profiles\`, \`company_users\` e as políticas RLS.
- **[In-Browser API Gateway](../integrations/01-api-gateway.md):** Utiliza conceitos análogos de escopos (\`scopes\`) para chaves programáticas.

---

## 7. Exemplos Práticos

### Política RLS de Isolamento por Tenant
\`\`\`sql
CREATE POLICY "Company members full access to company" 
ON public.companies FOR ALL TO authenticated 
USING (
  id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()) OR
  created_by = auth.uid()
);
\`\`\`

---

## 8. Referências para Outros Documentos
- [Visão Geral da Arquitetura](../architecture/01-visao-geral.md)
- [Modelo Relacional de Dados](../architecture/02-modelo-de-dados.md)
- [In-Browser API Gateway](../integrations/01-api-gateway.md)
`;

// 13. docs/frontend/01-design-system-e-temas.md
const UI_01 = `# 🎨 Design System, 20 Temas Dinâmicos e i18n

## 1. Objetivo
Descrever o motor de temas visuais (\`src/context/theme-context.tsx\`), a arquitetura de tokens com Tailwind CSS e Radix UI e o subsistema de internacionalização (\`src/i18n/translations.ts\`).

---

## 2. Visão Geral
O sistema de design do MarketFlow foi projetado com alta flexibilidade estética e usabilidade para ambientes de varejo iluminados ou escuros. Ele oferece:
- **20 Temas Dinâmicos Prontos:** 10 temas claros e 10 temas escuros.
- **Comutação em Tempo Real:** Sem necessidade de recarregar a página ou rebuild.
- **Persistência de Preferência:** Salvo na chave \`marketflow-theme-key\` no \`localStorage\`.
- **Internacionalização Multi-idioma:** Dicionários com suporte a Português (\`pt-BR\`), Inglês (\`en\`) e Espanhol (\`es\`).

---

## 3. Responsabilidades do Módulo
- Manipular dinamicamente as classes CSS injetadas no elemento \`<html>\` do DOM.
- Fornecer tokens padronizados de cor (\`bg-background\`, \`text-foreground\`, \`text-primary\`, \`border-border\`).
- Resolver strings de tradução utilizando interpolação segura com fallback para o português.

---

## 4. Catálogo dos 20 Temas Disponíveis

### 10 Temas Claros (Light)
1. **Corporate Blue (Padrão)** (\`#2563eb\`) — Azul clássico corporativo.
2. **Emerald Green** (\`#10b981\`) — Verde esmeralda para mercados e hortifrúti.
3. **Indigo Purple** (\`#6366f1\`) — Roxo moderno para lojas de presentes.
4. **Sunset Amber** (\`#f59e0b\`) — Âmbar acolhedor para padarias e confeitarias.
5. **Rose Crimson** (\`#f43f5e\`) — Rosa suave para floriculturas e cestas.
6. **Slate Cool** (\`#475569\`) — Cinza ardósia neutro e profissional.
7. **Teal Ocean** (\`#14b8a6\`) — Verde-azulado refrescante.
8. **Warm Paper** (\`#d97706\`) — Tons de papel aquecido e artesanato.
9. **Alto Contraste Claro** (\`#000000\`) — Acessibilidade para operadores com baixa visão.
10. **Fresh Mint** (\`#059669\`) — Verde menta suave.

### 10 Temas Escuros (Dark)
11. **MarketFlow Dark (Padrão)** (\`#3b82f6\`) — Azul noturno com contraste equilibrado.
12. **Midnight Blue** (\`#1e3a8a\`) — Azul meia-noite profundo.
13. **Dracula Purple** (\`#a855f7\`) — Tema inspirado no clássico padrão Dracula.
14. **Cyberpunk Neon** (\`#ec4899\`) — Rosa e azul neon de alto impacto.
15. **Nord Frost** (\`#38bdf8\`) — Azul gélido da paleta nórdica.
16. **Forest Dark** (\`#22c55e\`) — Verde floresta noturno.
17. **Alto Contraste Escuro** (\`#eab308\`) — Fundo preto total com destaque amarelo de alto contraste.
18. **Slate Dark** (\`#64748b\`) — Grafite escuro moderno.
19. **Obsidian Black** (\`#8b5cf6\`) — Preto obsidiana com detalhes em violeta.
20. **Sunset Dark** (\`#f97316\`) — Fundo escuro com realces em laranja pôr do sol.

---

## 5. Fluxo Interno: Comutação Reativa de Temas

\`\`\`mermaid
flowchart TD
    User([Usuário seleciona tema no seletor]) --> CallTheme[Chama setTheme(newTheme)]
    CallTheme --> SaveLocal[Grava no localStorage: marketflow-theme-key]
    SaveLocal --> CleanDOM[Remove todas as classes antigas do html]
    CleanDOM --> AddTheme[Adiciona classe do novo tema ex: theme-emerald]
    AddTheme --> DarkCheck{Tema é do tipo dark?}
    DarkCheck -- Sim --> AddDark[Adiciona classe 'dark' no html]
    DarkCheck -- Não --> RemoveDark[Garante remoção da classe 'dark']
    AddDark --> ApplyCSS[Navegador recalcula variáveis CSS imediatamente]
    RemoveDark --> ApplyCSS
\`\`\`

---

## 6. Relação com Outros Módulos
- **[Visão Geral da Arquitetura](../architecture/01-visao-geral.md):** O \`ThemeProvider\` envolve toda a árvore de componentes no \`src/main.tsx\`.
- **Todas as Telas Administrativas e Loja Pública:** Consomem as variáveis CSS de cor e as classes utilitárias do Tailwind.

---

## 7. Exemplos Práticos

### Snippet do \`ThemeProvider\` (\`src/context/theme-context.tsx\`)
\`\`\`tsx
useEffect(() => {
  const root = window.document.documentElement;
  themeOptionsList.forEach(t => root.classList.remove(t.key));
  root.classList.remove('light', 'dark');

  root.classList.add(activeTheme);

  const currentOpt = themeOptionsList.find(t => t.key === activeTheme);
  if (currentOpt?.type === 'dark') {
    root.classList.add('dark');
  }
}, [activeTheme]);
\`\`\`

---

## 8. Referências para Outros Documentos
- [Visão Geral da Arquitetura](../architecture/01-visao-geral.md)
- [Motor de Etiquetas Térmicas](../modules/04-etiquetas-termicas.md)
`;

// Execução da gravação de todos os arquivos
const FILES_TO_WRITE = [
  { dir: 'docs', file: 'README.md', content: README_CONTENT },
  { dir: 'docs/architecture', file: '01-visao-geral.md', content: ARCH_01 },
  { dir: 'docs/architecture', file: '02-modelo-de-dados.md', content: ARCH_02 },
  { dir: 'docs/architecture', file: '03-gerenciamento-de-estado.md', content: ARCH_03 },
  { dir: 'docs/modules', file: '01-produtos-e-validade.md', content: MOD_01 },
  { dir: 'docs/modules', file: '02-estoque-e-lotes.md', content: MOD_02 },
  { dir: 'docs/modules', file: '03-cestas-de-cafe.md', content: MOD_03 },
  { dir: 'docs/modules', file: '04-etiquetas-termicas.md', content: MOD_04 },
  { dir: 'docs/ai', file: '01-pipeline-multimodal.md', content: AI_01 },
  { dir: 'docs/integrations', file: '01-api-gateway.md', content: INT_01 },
  { dir: 'docs/integrations', file: '02-whatsapp-checkout.md', content: INT_02 },
  { dir: 'docs/security', file: '01-autenticacao-e-tenancy.md', content: SEC_01 },
  { dir: 'docs/frontend', file: '01-design-system-e-temas.md', content: UI_01 },
];

console.log('--- GERANDO WIKI MODULAR NAVEGÁVEL EM /docs ---');
for (const item of FILES_TO_WRITE) {
  const targetDir = path.resolve(item.dir);
  ensureDir(targetDir);
  const targetPath = path.join(targetDir, item.file);
  fs.writeFileSync(targetPath, item.content, 'utf8');
  console.log(`[OK] Gravado: ${path.relative(process.cwd(), targetPath)}`);
}

console.log('--- WIKI GERADA COM SUCESSO! ---');
