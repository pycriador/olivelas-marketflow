# 09 — DESIGN SYSTEM

## 1. Objetivo

Este documento define o Design System oficial do MarketFlow.

O objetivo é estabelecer uma linguagem visual e comportamental consistente para:

- aplicação autenticada;
- landing page;
- onboarding;
- dashboards;
- cadastros;
- tabelas;
- formulários;
- estoque;
- catálogo;
- IA;
- administração;
- páginas públicas;
- estados de sistema;
- componentes reutilizáveis.

O Design System deve priorizar:

1. clareza;
2. velocidade de operação;
3. acessibilidade;
4. consistência;
5. responsividade;
6. baixa carga cognitiva;
7. aparência SaaS moderna;
8. facilidade de manutenção;
9. reutilização;
10. escalabilidade visual.

---

# 2. Princípios Visuais

O MarketFlow deve possuir uma identidade:

```text
Professional
Modern
Clean
Trustworthy
Efficient
Accessible
Friendly
Data-oriented

A interface não deve parecer:

um ERP legado;
um sistema fiscal;
uma planilha;
um dashboard excessivamente complexo;
uma aplicação genérica de administração.

A experiência deve transmitir:

"Eu consigo entender e operar meu negócio rapidamente."

3. Referências Visuais

As principais referências de qualidade visual e UX são:

Linear;
Stripe;
Vercel;
Supabase;
Notion;
Typeform.

Essas referências não devem ser copiadas.

Devem servir como referência para:

hierarquia;
espaçamento;
simplicidade;
componentes;
microinterações;
navegação;
feedback;
consistência.
4. Design Philosophy

A interface deve seguir:

Content First

O conteúdo e a operação são mais importantes que elementos decorativos.

Preferir:

clear hierarchy
+
simple controls
+
predictable interactions

em vez de:

visual complexity
+
excessive animations
+
decorative elements
5. Visual Identity

A identidade principal do MarketFlow utiliza:

Primary: Corporate Blue
Neutral: Slate / Gray
Success: Green
Warning: Amber
Danger: Red
Info: Blue

As cores devem ser definidas através de design tokens.

Não utilizar cores diretamente espalhadas pelo código.

Evitar:

className="bg-blue-600"

quando existir um token semântico equivalente.

Preferir:

className="bg-primary"

ou equivalente definido pelo Design System.

6. Color System

A aplicação deve possuir cores semânticas.

Primary

Utilizada para:

ações principais;
links;
elementos selecionados;
CTAs;
navegação ativa;
foco.
Secondary

Utilizada para:

ações secundárias;
elementos auxiliares;
controles complementares.
Success

Utilizada para:

operação concluída;
estoque saudável;
produto ativo;
publicação ativa;
confirmação.
Warning

Utilizada para:

estoque baixo;
produto próximo da validade;
ação que requer atenção;
configuração incompleta.
Danger

Utilizada para:

exclusão;
erro;
estoque crítico;
operação irreversível;
acesso negado.
Info

Utilizada para:

informação contextual;
dicas;
estados informativos;
explicações.
7. Color Tokens

Utilizar tokens semânticos.

Exemplo conceitual:

--background
--foreground

--card
--card-foreground

--popover
--popover-foreground

--primary
--primary-foreground

--secondary
--secondary-foreground

--muted
--muted-foreground

--accent
--accent-foreground

--destructive
--destructive-foreground

--border
--input
--ring

Estados adicionais:

--success
--success-foreground

--warning
--warning-foreground

--info
--info-foreground

Os valores reais devem ser centralizados no tema.

8. Accessibility Contrast

Todas as combinações devem possuir contraste adequado.

Objetivo:

WCAG 2.1 AA

Como referência:

texto normal: contraste mínimo adequado;
elementos interativos: foco claramente perceptível;
informações não dependem exclusivamente de cor.

Exemplo incorreto:

produto vencido = somente vermelho

Preferir:

ícone + texto + cor
9. Dark Mode

O MarketFlow deve suportar:

Light
Dark
System

O tema padrão pode seguir o sistema operacional quando configurado como System.

O usuário poderá alternar manualmente.

Não criar cores específicas diretamente em componentes.

Todos os componentes devem funcionar nos dois temas.

10. Themes

A arquitetura deve permitir futuramente múltiplos temas.

O sistema deve possuir:

Theme Tokens

em vez de valores fixos.

O primeiro tema oficial:

MarketFlow Corporate

Futuramente:

Corporate Blue
Emerald
Indigo
Violet
Orange
Rose
Slate
Teal

A existência de múltiplos temas não deve aumentar a complexidade dos componentes.

11. Typography

Fonte padrão recomendada:

Inter

Fallback:

system-ui
sans-serif

A tipografia deve priorizar legibilidade.

12. Typography Scale

Escala inicial:

xs   → 12px
sm   → 14px
base → 16px
lg   → 18px
xl   → 20px
2xl  → 24px
3xl  → 30px
4xl  → 36px
5xl  → 48px

Nem todos os tamanhos devem ser utilizados indiscriminadamente.

13. Font Weights

Utilizar principalmente:

400 → Regular
500 → Medium
600 → Semibold
700 → Bold

Evitar excesso de bold.

Hierarquia deve ser criada principalmente por:

tamanho;
peso;
espaçamento;
contraste.
14. Headings

Hierarquia:

H1
H2
H3
H4

Exemplo:

H1 → título principal da página
H2 → seção
H3 → subseção
H4 → agrupamento menor

Evitar múltiplos H1 na mesma página.

15. Body Text

Texto padrão:

16px
line-height: 1.5

Textos auxiliares:

14px

Microcopy:

12px

Textos muito pequenos devem ser evitados.

16. Spacing System

Utilizar escala baseada em múltiplos de 4.

Exemplo:

4px
8px
12px
16px
20px
24px
32px
40px
48px
64px
80px
96px

Preferir tokens Tailwind/shadcn equivalentes.

17. Layout Grid

O sistema deve utilizar layout responsivo.

Desktop:

Sidebar
+
Main Content

Mobile:

Header
+
Main Content
+
Mobile Navigation / Drawer

Nunca criar layouts que dependam exclusivamente de largura fixa.

18. Container

Conteúdo principal deve utilizar container com largura máxima.

Exemplo conceitual:

max-width: 1440px

O valor final pode variar conforme a página.

Landing pages podem utilizar containers maiores.

19. Responsive Breakpoints

Utilizar os breakpoints padrão do Tailwind quando possível.

Referência:

sm → 640px
md → 768px
lg → 1024px
xl → 1280px
2xl → 1536px

Mobile deve ser tratado como prioridade.

Não desenvolver primeiro apenas para desktop.

20. Mobile First

Todas as telas devem ser projetadas considerando primeiro:

320px+

e posteriormente:

tablet
desktop
large desktop

Operações importantes devem ser possíveis em mobile.

21. Horizontal Scroll

A aplicação não deve possuir scroll horizontal global.

Evitar:

overflow-x: auto

como solução padrão para layouts quebrados.

Para tabelas muito extensas, utilizar estratégias específicas:

colunas prioritárias;
ocultação responsiva;
cards em mobile;
tabela compacta;
ações contextuais;
detalhes em drawer/modal.
22. Navigation

A navegação autenticada deve ser simples.

Estrutura conceitual:

Dashboard

Cadastros
 ├── Produtos
 ├── Categorias
 ├── Marcas
 ├── Fabricantes
 └── Fornecedores

Estoque
 ├── Estoque
 ├── Movimentações
 ├── Lotes
 └── Validades

Catálogo

IA

Relatórios

Administração
 ├── Usuários
 ├── Empresa
 ├── Auditoria
 └── Configurações

Menus devem ser condicionados por permissão.

23. Sidebar

Desktop:

┌──────────────────────────────┐
│ MarketFlow                   │
│ Company Switcher             │
├──────────────────────────────┤
│ Dashboard                    │
│ Cadastros                    │
│ Estoque                      │
│ Catálogo                     │
│ IA                           │
│ Relatórios                   │
├──────────────────────────────┤
│ Administração                │
├──────────────────────────────┤
│ User                         │
│ Settings                     │
│ Logout                       │
└──────────────────────────────┘

A sidebar deve:

permitir collapse;
preservar contexto;
mostrar estado ativo;
respeitar permissões;
funcionar com teclado.
24. Company Switcher

O seletor de empresa deve ficar em posição de destaque.

Exemplo:

┌─────────────────────────┐
│ 🏪 Mercado Central   ▼  │
└─────────────────────────┘

Ao trocar:

validar membership;
atualizar contexto;
invalidar queries dependentes;
atualizar permissões;
atualizar navegação;
atualizar dados.
25. Breadcrumbs

Utilizar breadcrumbs em páginas com hierarquia.

Exemplo:

Produtos / Café Especial

Não utilizar breadcrumbs em páginas extremamente simples quando não agregarem valor.

26. Page Header

Padrão:

Título
Descrição curta

                    [Ação principal]

Exemplo:

Produtos
Gerencie os produtos disponíveis na sua empresa.

                    [+ Novo produto]
27. Page Actions

Ação principal:

Primary Button

Ações secundárias:

Secondary
Ghost
Dropdown

Ações destrutivas devem possuir confirmação quando apropriado.

28. Buttons

Variantes:

Primary
Secondary
Outline
Ghost
Destructive
Link

Tamanhos:

sm
default
lg
icon

Estados:

default
hover
active
focus
disabled
loading
29. Button Loading

Durante operações:

Salvar

deve tornar-se:

Salvando...

e impedir submissões duplicadas.

Exemplo:

[spinner] Salvando...
30. Forms

Formulários devem ser:

simples;
agrupados;
responsivos;
acessíveis;
validados;
previsíveis.

Campos relacionados devem ficar próximos.

Evitar formulários longos sem agrupamento.

31. Form Layout

Desktop:

┌──────────────────────────────┐
│ Nome                         │
│ [________________________]   │
│                              │
│ Categoria      Marca         │
│ [__________]   [__________]  │
│                              │
│ Preço         Estoque        │
│ [__________]  [__________]   │
└──────────────────────────────┘

Mobile:

Nome
[________________]

Categoria
[________________]

Marca
[________________]
32. Form Validation

Erros devem aparecer próximos ao campo.

Exemplo:

Preço de venda
[ -10,00 ]

O preço deve ser maior ou igual a zero.

Não depender somente de toast para erros de formulário.

33. Required Fields

Campos obrigatórios devem ser claramente indicados.

Evitar marcar todos os campos com excesso de símbolos.

Preferir:

Nome *

e uma indicação contextual:

* Campos obrigatórios
34. Input Types

Utilizar tipos adequados:

text
email
tel
number
date
search
url

Para valores monetários:

R$ 29,90

A camada de persistência deve armazenar valor numérico, não string formatada.

35. Money Input

Exibição:

R$ 29,90

Persistência:

29.90

Nunca utilizar floating point como autoridade financeira quando houver risco de precisão.

Banco:

NUMERIC(12,2)
36. Quantity Input

Quantidades podem possuir até três casas decimais quando necessário.

Exemplo:

1
1,5
2,250

Banco:

NUMERIC(12,3)

A UI deve respeitar a unidade do produto.

37. Search

Campos de busca devem indicar claramente o que pesquisam.

Exemplo:

🔎 Buscar por nome, SKU ou código de barras...

Debounce pode ser utilizado para pesquisas remotas.

38. Filters

Filtros devem ser fáceis de encontrar.

Exemplo:

Buscar
Categoria
Marca
Status
Estoque
Validade

Filtros importantes devem ser preservados na URL quando apropriado.

39. URL State

Listagens devem refletir estado relevante na URL.

Exemplo:

/products?page=2&search=cafe&category=cafes&status=active

Isso permite:

refresh;
compartilhamento;
navegação browser;
deep links.
40. Tables

Tabelas devem ser utilizadas quando comparação de dados for importante.

Exemplo:

Produto | SKU | Categoria | Estoque | Preço | Status | Ações

Boas práticas:

header claro;
alinhamento consistente;
números alinhados;
ações previsíveis;
hover;
estados vazios;
paginação.
41. Responsive Tables

No mobile, não forçar tabelas largas.

Estratégias:

desktop → table
mobile → card/list

ou:

primary columns
+
details drawer
42. Pagination

Padrão:

Anterior
1 2 3 ... 10
Próximo

Mostrar:

25 itens por página

Permitir opções quando apropriado:

10
25
50
100

Nunca ultrapassar o limite definido pela API.

43. Cards

Cards devem agrupar conteúdo relacionado.

Evitar transformar toda informação em card.

Cards são apropriados para:

métricas;
produto;
empresa;
resumo;
alertas;
ações.
44. Product Card

Produto pode ser representado por:

┌─────────────────────────┐
│       [imagem]          │
│                         │
│ Café Especial           │
│ Marca X                 │
│                         │
│ R$ 29,90                │
│ Estoque: 24             │
└─────────────────────────┘

No catálogo público, somente informações autorizadas devem aparecer.

45. Status Badges

Utilizar badges para estados.

Exemplos:

Ativo
Inativo
Publicado
Rascunho
Estoque baixo
Vencido
Próximo do vencimento
Processando
Concluído
Erro

Não utilizar badge apenas como decoração.

46. Toasts

Toasts são apropriados para:

sucesso;
operação concluída;
aviso não crítico;
informação contextual.

Exemplo:

✓ Produto salvo com sucesso.

Não utilizar toast como única forma de apresentar:

erro de formulário;
informação crítica;
conteúdo que o usuário precisa consultar.
47. Dialogs

Dialogs devem ser utilizados para:

confirmação;
ações rápidas;
pequenos formulários;
informações importantes.

Não colocar formulários enormes em modal.

Para fluxos complexos, utilizar:

page
drawer
stepper
48. Destructive Confirmation

Ações destrutivas devem utilizar confirmação.

Exemplo:

Excluir produto?

Esta ação removerá o produto do catálogo e impedirá novas operações relacionadas.

[Cancelar] [Excluir]

A confirmação deve explicar a consequência.

49. Drawer

Drawers são adequados para:

detalhes;
filtros;
edição rápida;
histórico;
informações contextuais.

Especialmente úteis em desktop/mobile híbrido.

50. Tooltips

Tooltips devem explicar:

ícones desconhecidos;
ações pouco frequentes;
termos técnicos.

Não utilizar tooltip para informação essencial que não esteja disponível de outra forma.

51. Empty States

Toda lista deve possuir estado vazio.

Exemplo:

Ainda não existem produtos.

Cadastre seu primeiro produto para começar a controlar seu estoque.

[+ Novo produto]

Evitar:

Nenhum dado.

sem contexto ou ação.

52. Loading States

Evitar tela completamente vazia durante carregamento.

Utilizar:

Skeleton
Spinner
Progress

dependendo do contexto.

Para tabelas:

Skeleton rows

Para cards:

Skeleton cards
53. Error States

Erros devem possuir:

explicação;
ação possível;
opção de tentar novamente.

Exemplo:

Não foi possível carregar os produtos.

Verifique sua conexão e tente novamente.

[Tentar novamente]
54. Unauthorized

Quando usuário não está autenticado:

401

redirecionar para autenticação quando apropriado.

55. Forbidden

Quando usuário está autenticado mas não possui permissão:

403

mostrar:

Você não possui permissão para acessar este recurso.

Não revelar informações sensíveis sobre o recurso.

56. Not Found

Para recursos inexistentes ou não acessíveis:

Produto não encontrado.

Quando apropriado, utilizar 404 para não revelar existência de recursos protegidos.

57. Offline / Network State

A aplicação deve possuir comportamento previsível quando a rede falhar.

Exemplo:

Não foi possível conectar ao servidor.

[Tentar novamente]

Não informar sucesso antes da confirmação do backend.

58. Accessibility

A aplicação deve buscar conformidade:

WCAG 2.1 AA

Requisitos:

navegação por teclado;
foco visível;
labels;
aria-label quando necessário;
semântica HTML;
contraste;
suporte a leitores de tela;
tamanho adequado de targets;
mensagens de erro acessíveis.
59. Keyboard Navigation

Componentes interativos devem ser operáveis por teclado.

Garantir:

Tab
Shift + Tab
Enter
Space
Esc
Arrow keys

quando aplicável.

Não criar controles customizados que quebrem a navegação nativa.

60. Focus Management

Após abrir modal:

focus → modal

Após fechar:

focus → trigger

Após navegação importante:

focus → page heading

quando apropriado.

61. Icons

Utilizar:

Lucide Icons

ou biblioteca consistente com shadcn/ui.

Não misturar múltiplas bibliotecas de ícones sem necessidade.

Ícones devem possuir significado.

62. Icon Buttons

Botões somente com ícone devem possuir:

aria-label

Exemplo:

[🗑]

deve possuir:

aria-label="Excluir produto"
63. Microinteractions

Utilizar animações com moderação.

Exemplos apropriados:

hover;
focus;
abertura de drawer;
modal;
confirmação;
loading;
mudança de estado.

Evitar animações constantes ou distrativas.

64. Motion

Utilizar:

Framer Motion

quando houver valor real para UX.

Duração recomendada:

100–200ms

para microinterações.

Animações maiores devem ser reservadas para transições relevantes.

65. Reduced Motion

Respeitar:

prefers-reduced-motion

Usuários que solicitarem redução de movimento não devem receber animações desnecessárias.

66. Dashboard

Dashboard deve priorizar:

What needs attention?

e não somente:

How much data exists?

Exemplo:

┌────────────┐ ┌────────────┐ ┌────────────┐
│ Produtos   │ │ Estoque    │ │ Validades  │
│ 842        │ │ 93%        │ │ 8 alertas  │
└────────────┘ └────────────┘ └────────────┘

Alertas
────────────────────────────────
8 produtos próximos da validade

Estoque baixo
────────────────────────────────
12 produtos precisam de reposição
67. Data Visualization

Gráficos devem ser simples.

Priorizar:

barras;
linhas;
áreas;
distribuição;
indicadores.

Não utilizar gráficos complexos sem necessidade.

Dados devem possuir:

título;
unidade;
período;
legenda;
tooltip;
estado vazio.
68. Inventory Visual Language

Indicadores:

Healthy
Low
Critical
Expired

Exemplo:

🟢 Estoque saudável
🟡 Estoque baixo
🔴 Estoque crítico
⚠️ Vencido

A cor deve ser acompanhada de texto/ícone.

69. Expiration UX

Validades devem possuir hierarquia:

Vencido
≤ 7 dias
≤ 30 dias
> 30 dias

Os intervalos podem ser configuráveis futuramente.

Não depender apenas de cor.

70. AI UX

A IA deve parecer assistiva, não autônoma.

Exemplo:

✨ Sugestão da IA

Nome:
Café Especial

Marca:
Marca X

Categoria:
Cafés

Confiança:
91%

[Usar sugestões] [Revisar]

A UI deve deixar claro que a decisão final é do usuário.

71. AI Confidence

Representar confiança de maneira compreensível.

Exemplo:

Alta confiança
91%

ou:

Confiança: 91%

Não transformar uma probabilidade técnica em promessa de precisão.

72. AI Warnings

Quando necessário:

⚠️ A marca não pôde ser identificada com segurança.

O usuário deve poder corrigir o resultado.

73. Catalog Public UI

O catálogo público deve possuir identidade própria da empresa.

Elementos:

Logo
Nome
Descrição
Contato
Categorias
Produtos
Preços
WhatsApp

A empresa controla o que será publicado.

74. Public Catalog Responsiveness

O catálogo público deve ser:

Mobile First

O principal cenário é o cliente acessando através de:

WhatsApp
QR Code
celular
75. WhatsApp CTA

Quando habilitado:

Falar no WhatsApp

deve ser uma ação de destaque.

O número deve vir da configuração da empresa.

Nunca hardcodar número de contato.

76. Product Detail

Ao clicar em um produto:

imagem
nome
marca
categoria
descrição
preço
promoção
disponibilidade pública

somente quando configurado.

77. Notifications

Sistema de notificações deve suportar:

Success
Info
Warning
Error

Futuramente:

stock alerts
expiration alerts
catalog requests
AI completion
system notifications
78. Notification Center

Futuramente:

🔔

com:

não lidas;
lidas;
timestamp;
origem;
ação.

Não deve ser implementado como prioridade do MVP se não houver necessidade operacional.

79. Forms and Data Density

O MarketFlow possui muitos dados operacionais.

Por isso, a interface deve permitir densidade moderada.

Desktop:

compact / comfortable

Mobile:

comfortable

Evitar espaçamento excessivo que prejudique produtividade.

80. Data Formatting

Valores monetários:

R$ 1.234,56

Datas:

04/09/2026

Data/hora:

04/09/2026 14:30

Unidades devem respeitar configuração regional.

Configuração inicial:

locale: pt-BR
currency: BRL
timezone: America/Sao_Paulo
81. Internationalization

O idioma padrão:

PT-BR

Arquitetura preparada para:

EN
ES

Não hardcodar textos críticos em componentes de forma que inviabilize tradução futura.

Preferir:

translation keys
82. Localization

Não concatenar frases de maneira incompatível com tradução.

Evitar:

`${count} produto(s)`

Preferir sistema de pluralização.

Datas, números e moedas devem utilizar APIs de internacionalização apropriadas.

83. Component Architecture

Componentes devem ser divididos em:

Primitives
↓
UI Components
↓
Domain Components
↓
Feature Components
↓
Pages

Exemplo:

Button
  ↓
ProductForm
  ↓
ProductCreate
  ↓
ProductsPage
84. UI Primitives

Base inicial:

Button
Input
Textarea
Select
Checkbox
Radio
Switch
Label
Badge
Card
Dialog
Drawer
Popover
Tooltip
DropdownMenu
Tabs
Accordion
Table
Pagination
Skeleton
Alert
Toast
Separator
Avatar
Breadcrumb

Utilizar shadcn/ui e Radix como base quando possível.

85. Domain Components

Exemplos:

ProductCard
ProductStatusBadge
StockStatusBadge
ExpirationBadge
PriceDisplay
CompanySwitcher
RoleBadge
AIConfidenceBadge
CatalogProductCard
InventoryMovementBadge

Esses componentes devem encapsular padrões específicos do domínio.

86. Reusability

Não duplicar:

ProductForm
ProductFilters
Pagination
StatusBadge
PriceDisplay

em várias páginas.

Criar componentes reutilizáveis.

87. Design Tokens

Centralizar:

Colors
Typography
Spacing
Radius
Shadows
Motion
Breakpoints
Z-index

Exemplo:

--radius-sm
--radius-md
--radius-lg

--shadow-sm
--shadow-md
--shadow-lg
88. Border Radius

Utilizar bordas arredondadas moderadas.

Referência:

sm → 6px
md → 8px
lg → 12px
xl → 16px

Evitar excesso de componentes com rounded-full.

Pills devem ser utilizadas principalmente para:

status;
tags;
filtros;
pequenos indicadores.
89. Shadows

Sombras devem ser sutis.

Utilizar principalmente para:

modal;
dropdown;
popover;
card elevado;
floating action.

Evitar sombras pesadas em toda a aplicação.

90. Borders

Borders devem ser discretas.

Utilizar principalmente para:

separação;
inputs;
cards;
tabelas;
containers.

A hierarquia não deve depender exclusivamente de borders.

91. Z-Index

Definir níveis consistentes.

Exemplo conceitual:

base
dropdown
sticky
overlay
modal
toast
tooltip

Evitar valores arbitrários como:

z-[99999]

espalhados pelo código.

92. Responsive Behavior

Componentes devem possuir comportamento explícito por breakpoint.

Exemplo:

Sidebar
desktop → fixed
tablet → collapsible
mobile → drawer

Tabela:

desktop → table
mobile → cards

Filtros:

desktop → inline
mobile → filter drawer
93. Mobile Navigation

Mobile deve possuir navegação simples.

Opções:

Bottom Navigation

para ações principais, ou:

Header + Drawer

dependendo da quantidade de módulos.

Não replicar uma sidebar desktop inteira em uma tela pequena.

94. Touch Targets

Elementos interativos devem possuir tamanho adequado para toque.

Referência:

~44px

como mínimo confortável para áreas interativas importantes.

95. Tables and Keyboard

Tabelas devem permitir:

foco;
seleção;
ações;
navegação adequada.

Ações críticas não devem depender exclusivamente de hover.

96. Permission-Aware UI

A interface deve refletir permissões.

Exemplo:

ADMIN
[Editar] [Excluir]

STOCK
[Editar]

VISITOR
[Visualizar]

Porém:

esconder uma ação na UI não substitui autorização server-side.

97. Security-Aware UI

A UI deve evitar expor dados desnecessários.

Por exemplo, para Visitor:

Produto
Preço de venda
Estoque público

mas não:

Custo
Margem
Fornecedor
98. Destructive Actions

Ações destrutivas devem possuir diferenciação visual.

Exemplo:

Excluir
Desativar
Remover usuário
Cancelar operação

Utilizar variante destructive.

99. Confirmation Strategy

Nem toda ação precisa de confirmação.

Confirmar quando:

ação é destrutiva;
ação é difícil de desfazer;
ação possui impacto significativo;
alteração afeta múltiplos registros.

Não confirmar operações triviais repetidamente.

100. UX Consistency

A mesma ação deve possuir o mesmo comportamento.

Exemplo:

Todos os formulários devem seguir:

Editar
↓
Alterar
↓
Salvar
↓
Feedback

Todos os deletes:

Excluir
↓
Confirmar
↓
Executar
↓
Feedback
101. Design System File Structure

A implementação deve seguir estrutura semelhante:

src/
├── components/
│   ├── ui/
│   ├── layout/
│   ├── navigation/
│   ├── feedback/
│   └── domain/
│
├── features/
│   ├── products/
│   ├── inventory/
│   ├── catalog/
│   ├── ai/
│   └── companies/
│
├── styles/
│   ├── globals.css
│   ├── tokens.css
│   └── themes.css
│
└── lib/
    ├── i18n/
    └── formatting/

A estrutura final pode variar, mas os conceitos devem permanecer separados.

102. Component Documentation

Componentes reutilizáveis devem possuir documentação mínima:

Purpose
Props
Variants
States
Accessibility
Responsive behavior
Usage example

Futuramente pode ser utilizado Storybook ou documentação equivalente.

103. Component States

Todo componente interativo relevante deve considerar:

Default
Hover
Focus
Active
Disabled
Loading
Error
Success
Empty

Não criar apenas o estado visual "feliz".

104. Form States

Formulários devem suportar:

Idle
Loading
Success
Error
Validation Error
Disabled
Unsaved Changes
105. Unsaved Changes

Formulários longos podem avisar o usuário ao tentar sair com alterações não salvas.

Prioridade maior em:

edição de produto;
configurações;
empresa;
formulários administrativos.
106. Responsive Dashboard

Desktop:

┌──────────┐ ┌──────────┐ ┌──────────┐
│ Produtos │ │ Estoque  │ │ Alertas  │
└──────────┘ └──────────┘ └──────────┘

Mobile:

┌────────────────┐
│ Produtos       │
└────────────────┘

┌────────────────┐
│ Estoque        │
└────────────────┘

┌────────────────┐
│ Alertas        │
└────────────────┘
107. Landing Page Design

A landing page deve possuir:

Hero
Problem
Solution
Features
AI
Catalog
Stock
Multi-company
Pricing
FAQ
CTA
Footer

A estética deve ser SaaS moderna.

Não transformar a landing page em uma página administrativa.

108. Authentication Design

Login:

Email
Password

[Entrar]

[Continuar com Google]

Esqueci minha senha
Criar conta

A interface deve ser simples e rápida.

109. Onboarding Design

O onboarding deve minimizar fricção.

Fluxo:

Create Account
↓
Create Company
↓
Company Configuration
↓
First Product
↓
First Stock
↓
Publish Catalog

Não exigir configurações avançadas antes de permitir o primeiro valor.

110. Progressive Disclosure

Recursos avançados devem aparecer quando necessários.

Exemplo:

No cadastro básico:

Nome
Categoria
Preço

Opções avançadas:

SKU
Barcode
Peso
Volume
Fornecedor
Estoque mínimo
Estoque máximo

podem ficar em:

Mais opções
111. Product Form UX

O cadastro de produto deve possuir fluxo rápido.

Estrutura sugerida:

Informações básicas
Imagem
Classificação
Preço
Estoque
Catálogo
Informações adicionais

A IA poderá preencher campos sugeridos.

112. Inventory UX

Estoque deve privilegiar operações rápidas.

Ações principais:

Entrada
Saída
Ajuste
Perda
Inventário

Não esconder operações frequentes em menus excessivamente profundos.

113. Expiration UX

Criar uma visão específica para:

Vencidos
Vencendo
Próximos

Permitir filtros por:

período
produto
categoria
lote
114. Catalog Management UX

A administração do catálogo deve permitir:

Publicar
Despublicar
Destacar
Alterar ordem
Ocultar preço
Habilitar contato

Preferir controles simples e visuais.

115. AI Product Registration UX

Fluxo recomendado:

Upload / Camera
        ↓
Processing
        ↓
AI Result
        ↓
Review
        ↓
Confirm
        ↓
Product

Mostrar claramente:

Processando imagem...

e nunca bloquear a aplicação inteira durante a análise.

116. Accessibility for AI

Resultados de IA devem ser compreensíveis sem depender de:

animação;
cor;
ícone isolado.

Exemplo:

Confiança alta — 91%

em vez de somente uma barra verde.

117. Performance

O Design System deve favorecer performance.

Evitar:

bibliotecas duplicadas;
componentes excessivamente pesados;
animações desnecessárias;
imagens sem otimização;
renderizações desnecessárias.
118. Image Guidelines

Imagens de produtos devem:

possuir proporção consistente;
utilizar object-fit adequado;
possuir fallback;
possuir alt text;
ser comprimidas;
suportar lazy loading.
119. Skeleton Guidelines

Skeleton deve representar a estrutura aproximada do conteúdo.

Não criar:

tela inteira piscando

sem necessidade.

120. Error Prevention

A interface deve prevenir erros quando possível.

Exemplo:

Se estoque atual:

5

e saída:

10

mostrar:

Estoque insuficiente.
Disponível: 5

antes da operação quando possível.

A validação final deve ocorrer no backend.

121. Confirmation Feedback

Após sucesso:

Produto criado com sucesso.

Após falha:

Não foi possível salvar o produto.

Nunca mostrar:

Sucesso!

sem contexto.

122. Design System Governance

Alterações importantes no Design System devem ser avaliadas antes de introduzir:

nova cor;
novo componente;
nova biblioteca;
nova variante;
novo padrão de interação.

O objetivo é evitar fragmentação visual.

123. Anti-Patterns

Evitar:

❌ cores hardcoded
❌ componentes duplicados
❌ múltiplos sistemas de ícones
❌ layouts desktop-only
❌ tabelas quebrando mobile
❌ modal para tudo
❌ toast para tudo
❌ animação excessiva
❌ texto minúsculo
❌ botões sem estados
❌ campos sem labels
❌ informações apenas por cor
❌ autorização somente na UI
❌ dados sensíveis em componentes públicos
124. Definition of Done — Design

Uma tela está pronta quando:

[ ] utiliza Design Tokens
[ ] suporta Light Mode
[ ] suporta Dark Mode
[ ] é responsiva
[ ] não possui horizontal scroll indevido
[ ] possui loading state
[ ] possui empty state quando aplicável
[ ] possui error state
[ ] possui success feedback
[ ] possui unauthorized/forbidden quando aplicável
[ ] possui acessibilidade básica
[ ] funciona por teclado
[ ] possui foco visível
[ ] possui labels
[ ] utiliza componentes reutilizáveis
[ ] não possui cores hardcoded desnecessárias
[ ] não possui dados sensíveis expostos
[ ] respeita permissões
125. Design System Acceptance Criteria

O Design System será considerado estabelecido quando:

todas as páginas utilizarem os mesmos tokens;
Light/Dark funcionarem de forma consistente;
componentes básicos forem reutilizáveis;
formulários possuírem padrão único;
tabelas possuírem padrão único;
estados de loading/error/empty forem consistentes;
navegação possuir padrão único;
mobile não possuir scroll horizontal indevido;
acessibilidade básica estiver implementada;
PT-BR estiver corretamente suportado;
EN/ES puderem ser adicionados sem refatoração estrutural;
produtos, estoque e catálogo possuírem componentes de domínio reutilizáveis;
IA possuir padrões visuais próprios;
permissões refletirem corretamente na interface;
nenhuma decisão visual crítica estiver espalhada por componentes individuais.
126. Final Principle

O Design System do MarketFlow deve seguir:

Simple enough for a small business.
Powerful enough for a growing business.
Consistent enough for an enterprise product.

A interface deve sempre responder rapidamente:

Onde estou?
O que estou vendo?
O que posso fazer?
O que aconteceu?
O que precisa da minha atenção?

Se a interface não responder essas perguntas claramente, o componente ou fluxo deve ser reconsiderado.