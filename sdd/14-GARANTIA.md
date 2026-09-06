# MARKETFLOW — ROUTING, URL STATE, BACKEND PERSISTENCE & CRUD INTEGRITY

## Objetivo

Revisar e corrigir toda a aplicação MarketFlow para garantir que:

1. Toda opção de menu tenha uma rota própria.
2. Toda tela relevante seja diretamente acessível por URL.
3. Todo produto tenha uma URL própria e um ID único.
4. Todo registro criado no frontend seja persistido no backend.
5. Todo registro exibido no frontend venha do backend.
6. Toda edição feita no frontend atualize o backend.
7. Nenhuma informação de negócio dependa exclusivamente de estado local, mock ou memória do navegador.
8. Todas as telas com grande volume de dados tenham filtros organizados em um menu dropdown.
9. Filtros, paginação, busca, ordenação e contexto relevante sejam refletidos na URL.
10. Não existam botões ou opções de interface que não tenham implementação funcional.

Atue como Senior Software Engineer / Staff Engineer / Full Stack Engineer, com foco em arquitetura, React, TypeScript, Supabase/PostgreSQL, API First, UX, segurança, testes e CI/CD.

---

# 1. REGRA FUNDAMENTAL

Estabeleça esta regra para todo o projeto:

> O frontend é uma interface de operação. O backend é a fonte oficial dos dados.

Não permitir:

- dados de negócio somente em React state;
- dados permanentes somente em Zustand;
- dados permanentes somente em localStorage;
- mocks simulando persistência;
- arrays hardcoded como banco de dados;
- criação de registro apenas no frontend;
- edição apenas visual;
- exclusão apenas visual;
- alteração de status apenas no frontend;
- sucesso falso após uma operação que não foi persistida.

Pode existir estado temporário no frontend para:

- formulário antes do submit;
- filtros;
- paginação;
- modal aberto/fechado;
- seleção temporária;
- loading;
- optimistic UI controlada;
- preferências não críticas.

Mas qualquer dado de negócio precisa existir no backend.

---

# 2. AUDITORIA COMPLETA DE ROTAS

Mapear TODAS as opções existentes em:

- Sidebar
- Header
- Dropdowns
- Menus
- Menus de contexto
- Company Switcher
- User Menu
- Configurações
- Dashboard
- Cards clicáveis
- Quick Actions
- FABs
- CTAs
- Links
- Botões que navegam
- Breadcrumbs

Criar uma matriz:

| Menu | Opção | Rota | Existe? | Tela existe? | Funciona? | Permissão |
|---|---|---|---|---|---|---|

Nenhuma opção de menu pode permanecer sem uma rota própria.

---

# 3. REGRA: CADA OPÇÃO DE MENU = UMA ROTA

Toda opção navegacional deve possuir uma rota explícita.

Exemplo:

```text
/dashboard

/produtos
/produtos/novo
/produtos/:productId

/categorias
/categorias/nova
/categorias/:categoryId

/marcas
/marcas/nova
/marcas/:brandId

/fabricantes
/fabricantes/novo
/fabricantes/:manufacturerId

/fornecedores
/fornecedores/novo
/fornecedores/:supplierId

/estoque
/estoque/movimentacoes
/estoque/entrada
/estoque/saida
/estoque/ajuste

/lotes
/lotes/:lotId

/catalogo
/catalogo/configuracoes
/catalogo/produtos
/catalogo/categorias
/catalogo/solicitacoes

/usuarios
/usuarios/:userId

/empresa
/empresa/configuracoes

/ia
/ia/historico

/notificacoes

/relatorios

/configuracoes
/configuracoes/whatsapp
/configuracoes/api
/configuracoes/temas
/configuracoes/idioma

Os nomes devem ser adaptados ao routing existente, mas o princípio é obrigatório.

Não utilizar uma única tela genérica para representar várias opções diferentes do menu quando essas opções representam recursos ou contextos distintos.

4. ROTAS DEVEM SER DEEP-LINKABLE

Toda tela importante precisa funcionar quando acessada diretamente pela URL.

Exemplo:

/produtos

deve abrir corretamente.

Também:

/produtos/550e8400-e29b-41d4-a716-446655440000

deve abrir diretamente o produto.

Não depender de:

naveguei da tela anterior

para descobrir qual registro está sendo exibido.

A aplicação deve carregar o contexto necessário pela URL + backend.

5. PRODUTO = ID ÚNICO + URL PRÓPRIA

Todo produto deve possuir:

product.id

com UUID único.

Exemplo:

550e8400-e29b-41d4-a716-446655440000

A URL administrativa deve utilizar o ID:

/produtos/550e8400-e29b-41d4-a716-446655440000

Nunca utilizar somente o nome do produto como identificador.

Não utilizar:

/produtos/arroz

como identificador primário.

Pode existir futuramente um slug amigável, mas o ID continuará sendo a referência canônica.

6. URL DO PRODUTO PÚBLICO

O produto também deve possuir uma URL pública quando publicado no catálogo.

Exemplo:

/catalogo/:companySlug/produtos/:productId

ou equivalente definido pela arquitetura atual.

Exemplo:

/catalogo/mercado-exemplo/produtos/550e8400-e29b-41d4-a716-446655440000

A página pública deve validar:

empresa existente;
empresa ativa;
catálogo ativo;
produto existente;
produto ativo;
produto publicado;
permissões de exposição pública.

Nunca expor informações internas do produto.

7. FRONTEND → BACKEND

Auditar TODAS as operações CRUD.

Para cada entidade:

Create
Read
Update
Delete
Activate
Deactivate
Status changes
Relations
Uploads
Ordering
Visibility

confirmar que existe implementação real no backend.

Entidades principais:

Company
User
Company User
Category
Brand
Manufacturer
Supplier
Product
Product Image
Product Price
Inventory
Inventory Movement
Lot
Catalog Settings
Catalog Category
Catalog Product
Catalog Request
AI Job
Notification
Audit Log
API Key
WhatsApp Template
Plan
Subscription
8. CREATE

Quando o usuário clicar:

Salvar
Criar
Cadastrar
Adicionar
Confirmar

o fluxo obrigatório será:

Frontend
   ↓
Validação Zod
   ↓
TanStack Query Mutation
   ↓
API / Edge Function
   ↓
Autenticação
   ↓
Autorização
   ↓
Validação backend
   ↓
Business Logic
   ↓
PostgreSQL
   ↓
Audit
   ↓
Response
   ↓
Frontend

Somente apresentar:

Salvo com sucesso

depois da confirmação real do backend.

9. READ

As listagens devem consultar o backend.

Exemplo:

/produtos

não pode depender de:

const products = [...]

ou:

const mockProducts = [...]

como fonte permanente.

Utilizar:

TanStack Query
+
API / Supabase
+
PostgreSQL

com cache corretamente invalidado.

10. UPDATE

Ao abrir:

/produtos/:productId

carregar o produto pelo ID.

Ao editar:

PUT/PATCH /api/v1/products/:productId

ou equivalente arquitetural.

Após sucesso:

backend confirma atualização;
cache é invalidado/atualizado;
interface reflete o novo estado;
histórico/auditoria é registrado quando aplicável.

Nunca alterar somente:

setProduct(...)

e considerar a operação concluída.

11. DELETE

Exclusões devem executar operação real no backend.

Para entidades críticas, respeitar soft delete.

Nunca fazer:

setItems(items.filter(...))

sem persistência.

Fluxo:

Frontend
→ confirmação
→ backend
→ autorização
→ banco
→ audit
→ atualização do cache
12. RELACIONAMENTOS

Garantir que relações também sejam persistidas.

Exemplo de produto:

Product
 ├── Category
 ├── Brand
 ├── Manufacturer
 ├── Supplier
 ├── Images
 ├── Inventory
 └── Lots

Alterar uma relação no frontend deve atualizar a relação real no backend.

Exemplo:

Produto → alterar fornecedor

deve persistir:

default_supplier_id

no banco.

13. FILTROS — REGRA GLOBAL

Todas as telas com grande quantidade de registros precisam possuir filtros.

Não espalhar dezenas de campos de filtro permanentemente na tela.

Utilizar um:

Filtros ▼

ou:

Filter

em um dropdown/popover/drawer responsivo.

14. PADRÃO DE FILTROS

Exemplo para Produtos:

[ Buscar produtos... ] [ Filtros ▼ ] [ + Novo produto ]

Filtros
────────────────────────
Categoria
Marca
Fabricante
Fornecedor
Status
Visibilidade no catálogo
Faixa de preço
Estoque
Com estoque
Estoque baixo
Sem estoque

[Limpar] [Aplicar]

O mesmo padrão deve ser aplicado consistentemente.

15. TELAS QUE DEVEM SER AUDITADAS PARA FILTROS

No mínimo:

Produtos

Filtros:

categoria
marca
fabricante
fornecedor
status
catálogo
estoque
faixa de preço
Categorias

Filtros:

status
categoria pai
busca
Marcas

Filtros:

fabricante
status
busca
Fabricantes

Filtros:

status
busca
Fornecedores

Filtros:

status
cidade
estado
busca
Estoque

Filtros:

produto
categoria
estoque baixo
sem estoque
faixa de quantidade
Movimentações

Filtros:

produto
tipo
período
usuário
lote
Lotes

Filtros:

produto
fornecedor
vencimento
vencidos
próximos do vencimento
status
Usuários

Filtros:

empresa
role
status
convite
busca
Solicitações do catálogo

Filtros:

status
período
produto
cliente
busca
Logs de auditoria

Filtros:

usuário
ação
entidade
período
empresa
Jobs de IA

Filtros:

operação
status
provider
período
16. FILTROS DEVEM ESTAR NA URL

Filtros importantes devem ser serializados na URL.

Exemplo:

/produtos?
search=arroz
&category=uuid
&brand=uuid
&status=active
&page=2
&page_size=25
&sort=name
&order=asc

Isso permite:

refresh sem perder contexto;
compartilhar URL;
voltar/avançar no navegador;
deep linking;
melhor UX;
comportamento previsível.
17. PAGINAÇÃO

Todas as listas potencialmente grandes devem ter paginação.

Padrão:

?page=1&page_size=25

Limite máximo inicial:

page_size <= 100

Nunca carregar milhares de registros desnecessariamente.

A paginação deve funcionar no backend.

Não fazer:

buscar tudo
↓
filtrar no frontend
↓
paginar no frontend

para datasets grandes.

Preferir:

Backend
↓
WHERE
↓
ORDER BY
↓
LIMIT
↓
OFFSET/cursor
18. BUSCA

A busca de grandes datasets deve ser executada no backend.

Exemplo:

/produtos?search=arroz

Não carregar todos os produtos para depois executar:

products.filter(...)

quando o volume puder crescer.

19. ORDENAÇÃO

Ordenação deve ser suportada pelo backend quando aplicável.

Exemplo:

?sort=name&order=asc

Validar campos permitidos.

Nunca permitir que um campo arbitrário seja transformado diretamente em SQL.

Utilizar whitelist:

name
created_at
sale_price
stock

etc.

20. COMPANY CONTEXT

Todos os dados protegidos devem respeitar:

company_id

O frontend pode selecionar:

activeCompanyId

mas isso NÃO representa autorização.

O backend e o RLS precisam validar o acesso.

Exemplo:

GET /api/v1/products/:id

deve garantir:

usuário autenticado
+
usuário pertence à empresa
+
usuário possui permissão
+
produto pertence à empresa

Nunca confiar apenas no:

company_id

enviado pelo frontend.

21. CACHE

Revisar todas as queries do TanStack Query.

As chaves devem considerar o contexto.

Exemplo:

[
  "products",
  companyId,
  filters,
  pagination,
  sorting
]

Ao trocar de empresa:

limpar/invalidate cache relevante;
recarregar dados;
não mostrar dados da empresa anterior;
impedir vazamento visual entre tenants.
22. FORMULÁRIOS

Todo formulário precisa ter:

loading
success
error
validation
disabled state

Ao enviar:

Salvar

deve existir mutation real.

Após sucesso:

toast
invalidate query
redirect ou update

conforme o fluxo.

Se falhar:

não fechar silenciosamente
não mostrar sucesso
não perder dados digitados
mostrar erro útil
23. BOTÕES

Auditar TODOS os botões.

Classificar:

Navegação

Devem navegar para uma rota.

CRUD

Devem executar operação backend.

Ações

Devem executar operação real.

Dropdown

Cada opção deve executar uma ação real ou navegar.

CTA

Deve levar a uma funcionalidade existente.

Botões futuros

Se a funcionalidade não existir, não apresentar o botão como funcional.

Não aceitar:

onClick={() => {}}
console.log(...)
alert("Em breve")

como implementação final.

24. LINKS E CARDS CLICÁVEIS

Auditar:

cards;
linhas de tabela;
nomes de produtos;
imagens;
badges clicáveis;
breadcrumbs;
ações rápidas.

Se parecer clicável, deve possuir comportamento coerente.

Produto em uma tabela:

Arroz 5kg

deve levar para:

/produtos/:productId

e não abrir somente um modal sem URL quando a intenção é editar/consultar uma entidade persistente.

25. MODAIS VS ROTAS

Revisar o uso excessivo de modais.

Usar rota para:

detalhes;
edição de entidade;
criação de entidade;
configurações complexas;
páginas com conteúdo significativo.

Usar modal/drawer para:

confirmação;
ações rápidas;
filtros;
operações curtas;
pequenas interações contextuais.

Exemplo:

/produtos/:productId

preferível a:

modalProductOpen = true

para a tela principal de edição.

26. PRODUTO — FLUXO COMPLETO

Garantir:

/produtos

Lista.

/produtos/novo

Criação.

/produtos/:productId

Detalhes/edição.

Fluxo:

Novo produto
↓
Formulário
↓
POST backend
↓
Produto criado
↓
ID retornado
↓
redirect para /produtos/:id

Exemplo:

POST /api/v1/products

Response:

{
  "data": {
    "id": "uuid",
    "name": "Arroz 5kg"
  }
}

Frontend deve utilizar o ID retornado.

27. CRIAÇÃO DE PRODUTO COM IMAGEM

Se o produto possui imagem:

Upload
↓
Storage
↓
backend registra product_images
↓
produto relaciona imagem

Não considerar a imagem salva apenas porque o preview aparece no navegador.

28. ESTOQUE

Operações de estoque são sempre backend-first.

Exemplo:

Entrada
Saída
Ajuste
Perda
Vencimento
Inventário

devem:

validar
↓
executar transação
↓
atualizar inventory_items
↓
registrar inventory_movements
↓
audit

Nunca modificar estoque somente com:

setQuantity(...)
29. LOTES

Lote precisa ter:

lot.id

UUID.

URL:

/lotes/:lotId

ou contexto equivalente.

Ao editar:

backend
+
PostgreSQL
+
audit

Sempre respeitar:

company_id
product_id
supplier_id
30. CATÁLOGO

Configurações do catálogo devem persistir.

Exemplo:

catálogo ativo
mostrar preços
permitir contato
WhatsApp
mensagem

Tudo precisa existir em:

catalog_settings

ou estrutura equivalente.

Alterar no frontend deve atualizar backend.

31. CONFIGURAÇÕES

Todas as configurações visíveis devem possuir persistência real.

Auditar:

empresa;
catálogo;
WhatsApp;
API;
temas;
idioma;
notificações;
preferências;
IA.

Não apresentar uma configuração como funcional se ela somente altera estado local.

32. API FIRST

Todas as operações de negócio devem possuir uma camada de serviço clara.

Preferência:

UI
↓
Hook
↓
Service/API
↓
Backend
↓
Database

Evitar espalhar chamadas de banco diretamente em dezenas de componentes.

Centralizar:

services/
api/
hooks/
queries/
mutations/

conforme arquitetura atual.

33. TIPAGEM

Garantir tipos compartilhados para:

Product
Category
Brand
Manufacturer
Supplier
Inventory
Lot
Company
User
Catalog
AI Job
API Key
Notification

Não usar:

any

como solução para incompatibilidades entre frontend/backend.

Corrigir a origem do problema.

34. ESTADOS DE TODAS AS ROTAS

Toda rota deve tratar:

loading
empty
error
unauthorized
forbidden
not found
success

Produto inexistente:

/produtos/uuid-invalido

deve apresentar:

Produto não encontrado

e não:

tela quebrada
35. SEGURANÇA

Testar:

IDOR

Usuário tenta:

/produtos/{ID_DE_OUTRA_EMPRESA}

Resultado:

403 ou 404 seguro

Nunca retornar dados.

Cross-tenant

Usuário da Empresa A não pode:

consultar produtos da B;
editar produtos da B;
excluir produtos da B;
consultar estoque da B;
acessar usuários da B;
acessar fornecedores da B;
acessar auditoria da B.
Privilege escalation

Stock não pode executar ações de Admin.

Visitor não pode editar.

Usuário comum não pode criar Global Admin.

36. MOCK DATA

Fazer uma auditoria completa.

Encontrar:

mock
fake
dummy
sample
placeholder
hardcoded
static data

Classificar:

Permitido

Conteúdo puramente visual/documentacional.

Não permitido

Dados de negócio apresentados como se fossem reais.

Remover mocks das funcionalidades reais.

37. LOCAL STORAGE

Auditar todo uso de:

localStorage
sessionStorage
IndexedDB

Não utilizar para persistir dados de negócio quando o backend deveria ser a fonte oficial.

Pode ser utilizado para:

preferência de tema;
idioma;
preferências de UI;
dados temporários não críticos.

Não utilizar para:

produtos;
estoque;
usuários;
permissões;
fornecedores;
empresas;
preços;
lotes;
solicitações;
configurações de negócio.
38. AUDITORIA AUTOMATIZADA

Criar ou executar testes para garantir:

Routing
toda opção de menu possui rota;
rotas existem;
rotas protegidas estão protegidas;
rotas públicas estão acessíveis.
Product
create;
read;
update;
delete;
deep link;
ID;
company isolation.
Filters
search;
filter;
pagination;
sorting;
URL persistence.
Backend
mutations persistem;
reads retornam backend;
errors são tratados.
Security
RLS;
cross-tenant;
RBAC;
IDOR;
privilege escalation.
39. TESTES E2E OBRIGATÓRIOS

Criar/validar pelo menos:

Fluxo 1
Login
→ criar empresa
→ acessar dashboard
Fluxo 2
Produtos
→ novo produto
→ salvar
→ backend
→ redirect /produtos/:id
→ refresh
→ produto continua existindo
Fluxo 3
Produto
→ editar
→ salvar
→ refresh
→ alteração continua
Fluxo 4
Produtos
→ filtros
→ paginação
→ refresh
→ URL mantém contexto
Fluxo 5
Empresa A
→ produto A
→ trocar Empresa B
→ produto A não aparece
Fluxo 6
Produto público
→ URL direta
→ catálogo público
Fluxo 7
Estoque
→ entrada
→ refresh
→ saldo permanece atualizado
40. DEFINITION OF DONE

Uma funcionalidade somente será considerada pronta quando:

 possui rota;
 possui tela;
 possui backend;
 possui persistência;
 possui validação;
 possui autorização;
 possui RLS quando aplicável;
 possui estados de loading;
 possui estados de erro;
 possui empty state;
 possui not-found quando aplicável;
 possui feedback de sucesso;
 possui URL adequada;
 possui filtros quando necessário;
 possui paginação quando necessário;
 possui busca quando necessário;
 possui ordenação quando necessário;
 possui testes;
 não depende de mock;
 não depende de localStorage para persistência de negócio;
 funciona após refresh;
 funciona por deep link;
 respeita multi-company;
 respeita RBAC;
 respeita RLS;
 não apresenta dados de outra empresa;
 não possui botão morto.
41. REGRA FINAL

Não considerar a aplicação funcional apenas porque:

a tela aparece

ou:

o botão responde

A funcionalidade somente está pronta quando:

ROTA
+
UI
+
VALIDAÇÃO
+
API
+
BACKEND
+
DATABASE
+
RLS
+
AUTORIZAÇÃO
+
PERSISTÊNCIA
+
CACHE
+
ERROR HANDLING
+
TESTE

estiverem funcionando de ponta a ponta.

42. RELATÓRIO FINAL

Ao terminar a auditoria, gerar um relatório com:

Rotas
Total de opções de menu:
Total de rotas esperadas:
Total de rotas existentes:
Total de rotas quebradas:
CRUD
Entidades auditadas:
CRUD completo:
CRUD incompleto:
Operações somente frontend:
Filtros
Telas auditadas:
Telas com filtros:
Telas sem filtros que precisam:
Filtros persistidos na URL:
Persistência
Operações backend:
Operações frontend-only:
Mocks encontrados:
localStorage relacionado a negócio:
Segurança
RLS:
Cross-tenant:
IDOR:
RBAC:
Privilege escalation:
Qualidade

Classificar problemas:

P0 — bloqueador / perda de dados / vulnerabilidade crítica
P1 — funcionalidade principal quebrada
P2 — problema importante
P3 — melhoria

Corrigir os problemas P0 e P1 antes de considerar o projeto pronto.

Não mascarar erros.

Não criar mocks para esconder funcionalidades faltantes.

Não remover funcionalidades para fazer os testes passarem.

Corrigir a causa raiz.

RESULTADO ESPERADO

O MarketFlow deve terminar esta etapa com uma arquitetura coerente:

MENU
 ↓
ROTA
 ↓
TELA
 ↓
QUERY / MUTATION
 ↓
API
 ↓
AUTH
 ↓
AUTHORIZATION
 ↓
BUSINESS LOGIC
 ↓
POSTGRESQL
 ↓
RLS
 ↓
AUDIT
 ↓
RESPONSE
 ↓
CACHE
 ↓
UI

E para entidades como Produto:

/produtos
      ↓
/produtos/novo
      ↓
POST /api/v1/products
      ↓
PostgreSQL
      ↓
UUID
      ↓
/produtos/:productId
      ↓
GET /api/v1/products/:productId
      ↓
Editar
      ↓
PATCH /api/v1/products/:productId
      ↓
PostgreSQL
      ↓
Refresh
      ↓
Dados continuam existindo

Este comportamento deve ser aplicado a TODAS as entidades persistentes do MarketFlow.

O objetivo final é garantir que não exista diferença entre:

"parece funcionar no frontend"

e:

"funciona de verdade em produção".


**Eu considero essa regra especialmente importante para o MarketFlow:** a partir daqui, podemos tratar **rota + ID + backend + persistência** como requisitos obrigatórios de qualquer nova funcionalidade. Isso também evita que o projeto cresça com telas bonitas, mas com operações que na prática não persistem nada.