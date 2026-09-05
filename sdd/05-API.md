# MarketFlow — API Specification

> Especificação oficial da camada de API, operações de dados, Edge Functions, validação, paginação, filtros, erros e integração entre frontend e backend.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento  
**Documento:** 05-API.md  
**Documentos relacionados:**
- 00-VISION.md
- 01-FOUNDATION.md
- 02-DATABASE.md
- 03-AUTH.md
- 04-PERMISSIONS.md

---

# 1. Objetivo

Definir o padrão de comunicação entre frontend, Supabase, Edge Functions e serviços externos.

A API deverá ser:

- segura;
- multi-tenant;
- previsível;
- tipada;
- validada;
- observável;
- compatível com evolução futura;
- independente da implementação visual do frontend.

---

# 2. Arquitetura

Arquitetura principal:

```text
Frontend
React + TypeScript
       │
       ▼
TanStack Query
       │
       ├──────────────► Supabase Database
       │
       ├──────────────► Supabase Auth
       │
       ├──────────────► Supabase Storage
       │
       └──────────────► Edge Functions
                              │
                              ├── IA
                              ├── integrações externas
                              ├── operações privilegiadas
                              └── processamento assíncrono
```

---

# 3. Princípio

Sempre que possível:

```text
Frontend
   ↓
Supabase Client
   ↓
PostgreSQL + RLS
```

Para operações que exigem lógica protegida:

```text
Frontend
   ↓
Edge Function
   ↓
Authorization
   ↓
Business Logic
   ↓
Database
```

---

# 4. Supabase Client

O frontend utilizará o client oficial do Supabase.

O client deverá utilizar a sessão do usuário autenticado.

Nunca utilizar:

```text
service_role key
```

no frontend.

---

# 5. Service Role

A Service Role Key somente poderá existir em:

```text
Edge Functions
Backend seguro
Ambiente server-side
```

Nunca:

```text
React
Browser
LocalStorage
Código público
```

---

# 6. Tenant Context

O frontend poderá manter uma:

```text
activeCompanyId
```

para determinar a empresa atualmente selecionada.

Porém:

> `company_id` enviado pelo frontend nunca deverá ser considerado prova de autorização.

A autorização deverá ser validada no backend/database.

---

# 7. Company Context

Após login:

```text
User
 ↓
Company memberships
 ↓
Selected company
```

Exemplo:

```text
GET company memberships

[
  {
    company_id: "...",
    role: "admin"
  },
  {
    company_id: "...",
    role: "stock"
  }
]
```

---

# 8. Troca de Empresa

Ao trocar de empresa:

```text
Company A
   ↓
Company B
```

o frontend deverá:

1. atualizar contexto;
2. invalidar queries relacionadas à empresa anterior;
3. atualizar permissões;
4. recarregar dados;
5. impedir dados residuais da empresa anterior.

---

# 9. Query Keys

As queries deverão incluir contexto de empresa.

Exemplo:

```typescript
[
  "products",
  companyId,
  filters
]
```

Evitar:

```typescript
["products"]
```

quando a query for multi-tenant.

---

# 10. Padrão de Recursos

Os recursos principais são:

```text
companies
users
categories
brands
manufacturers
suppliers
products
product-images
inventory
lots
inventory-movements
catalog
catalog-requests
ai
audit
plans
subscriptions
settings
```

---

# 11. Operações CRUD

As operações deverão seguir o padrão:

```text
create
read
update
delete
```

Quando aplicável.

Exemplo:

```text
products.create
products.read
products.update
products.delete
```

---

# 12. Produtos

Operações principais:

```text
List products
Get product
Create product
Update product
Delete product
```

---

# 13. List Products

A listagem deverá suportar:

```text
search
category
brand
manufacturer
supplier
active
catalog_visible
stock_status
page
page_size
sort
order
```

Exemplo conceitual:

```text
products
?search=arroz
&category=...
&page=1
&page_size=25
&sort=name
&order=asc
```

---

# 14. Paginação

Todas as listagens potencialmente grandes deverão possuir paginação.

Padrão inicial:

```text
page = 1
page_size = 25
```

Valores máximos deverão ser limitados pelo backend.

Exemplo:

```text
page_size <= 100
```

---

# 15. Paginação na URL

Quando a tela possuir paginação, filtros relevantes deverão ser refletidos na URL.

Exemplo:

```text
/products?page=2&page_size=25&search=arroz
```

Isso permite:

- deep link;
- compartilhamento;
- refresh sem perder contexto;
- navegação pelo browser;
- restauração do estado.

---

# 16. Cursor Pagination

Para recursos com grande volume de dados, avaliar posteriormente:

```text
cursor-based pagination
```

Especialmente:

```text
audit_logs
inventory_movements
catalog_requests
```

---

# 17. Ordenação

Permitir apenas campos previamente autorizados.

Exemplo:

```text
sort=name
sort=created_at
sort=sale_price
```

Nunca permitir que o usuário forneça SQL arbitrário.

---

# 18. Filtros

Filtros deverão ser tipados e validados.

Exemplo:

```text
active=true
category_id=UUID
minimum_price=10
maximum_price=100
```

---

# 19. Busca

Pesquisa de produtos poderá considerar:

```text
name
sku
barcode
description
brand
```

A busca deverá utilizar mecanismos adequados do PostgreSQL.

Avaliar posteriormente:

```text
Full Text Search
pg_trgm
```

---

# 20. Resposta de Listagem

Formato conceitual:

```json
{
  "data": [],
  "pagination": {
    "page": 1,
    "page_size": 25,
    "total": 120,
    "total_pages": 5
  }
}
```

---

# 21. Resposta de Recurso

```json
{
  "data": {
    "id": "...",
    "name": "Arroz 5kg"
  }
}
```

---

# 22. Erros

A API deverá utilizar erros previsíveis.

Categorias:

```text
400 Bad Request
401 Unauthorized
403 Forbidden
404 Not Found
409 Conflict
422 Validation Error
429 Too Many Requests
500 Internal Server Error
```

---

# 23. Estrutura de Erro

Formato recomendado:

```json
{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produto não encontrado.",
    "details": {}
  }
}
```

---

# 24. Códigos de Erro

Utilizar códigos estáveis.

Exemplos:

```text
AUTH_REQUIRED
AUTH_INVALID
ACCESS_DENIED
COMPANY_NOT_FOUND
COMPANY_ACCESS_DENIED

PRODUCT_NOT_FOUND
PRODUCT_ALREADY_EXISTS
PRODUCT_INVALID

CATEGORY_NOT_FOUND
CATEGORY_ALREADY_EXISTS

INVENTORY_INSUFFICIENT_STOCK
INVENTORY_INVALID_QUANTITY

LOT_NOT_FOUND
LOT_EXPIRED

PLAN_LIMIT_REACHED

AI_LIMIT_REACHED
AI_PROCESSING_FAILED
```

---

# 25. Mensagens

Mensagens exibidas ao usuário deverão ser amigáveis.

Não retornar:

```text
SQL exception
stack trace
database error
internal path
API key
provider error
```

---

# 26. Validação

Todos os inputs deverão ser validados.

Frontend:

```text
Zod
```

Backend:

```text
Validação equivalente
```

Nunca confiar somente na validação do frontend.

---

# 27. UUID

IDs deverão ser tratados como UUID.

Nunca confiar que:

```text
"123"
```

é um ID válido quando o recurso utiliza UUID.

---

# 28. Valores Monetários

Valores monetários deverão ser tratados como:

```text
NUMERIC(12,2)
```

Evitar operações financeiras críticas utilizando:

```text
JavaScript floating point
```

sem tratamento apropriado.

---

# 29. Quantidades

Quantidades de estoque:

```text
NUMERIC(12,3)
```

Permitir produtos vendidos por:

```text
unidade
kg
g
litro
ml
caixa
pacote
etc.
```

---

# 30. Transações

Operações que alteram múltiplos registros deverão ser transacionais.

Exemplo:

```text
Entrada de estoque

Inventory
+
Inventory Movement
+
Lot
```

deverão permanecer consistentes.

---

# 31. Estoque

Nunca atualizar somente:

```text
inventory_items.quantity
```

sem registrar a movimentação correspondente.

A movimentação é o histórico oficial.

---

# 32. Ajuste de Estoque

Operação:

```text
inventory.adjust
```

deverá:

1. validar permissão;
2. validar produto;
3. validar quantidade;
4. registrar movimento;
5. atualizar saldo;
6. registrar usuário;
7. registrar timestamp;
8. auditar quando aplicável.

---

# 33. Concorrência

Operações de estoque deverão considerar concorrência.

Exemplo:

```text
Usuário A → baixa 5
Usuário B → baixa 5
```

simultaneamente.

O backend deverá impedir inconsistência de saldo.

---

# 34. Preço

Alteração de preço deverá atualizar:

```text
products
```

e registrar:

```text
product_price_history
```

---

# 35. Delete

Para entidades críticas, utilizar:

```text
soft delete
```

quando definido no modelo.

Exemplo:

```text
deleted_at
```

---

# 36. Inventory Movements

Nunca executar:

```text
DELETE inventory_movements
```

como operação normal.

Correções deverão ser feitas através de novos movimentos de ajuste.

---

# 37. Idempotência

Operações que possam ser repetidas deverão considerar idempotência.

Especialmente:

```text
imports
webhooks
AI jobs
inventory operations
external integrations
```

---

# 38. Idempotency Key

Operações críticas poderão aceitar:

```text
Idempotency-Key
```

Exemplo:

```text
POST /inventory/adjustments
Idempotency-Key: UUID
```

---

# 39. Edge Functions

Utilizar Edge Functions para:

- IA;
- integrações externas;
- webhooks;
- operações privilegiadas;
- processamento assíncrono;
- geração de arquivos;
- tarefas que não devem ocorrer diretamente no browser.

---

# 40. Edge Function Structure

Cada função deverá possuir:

```text
authentication
authorization
input validation
business logic
database operation
audit
response
error handling
```

---

# 41. Exemplo

```text
POST /functions/v1/ai-product-recognition
```

Fluxo:

```text
Request
 ↓
Auth
 ↓
Company Membership
 ↓
Permission
 ↓
Plan Limit
 ↓
File Ownership
 ↓
AI Provider
 ↓
Result
 ↓
Audit
 ↓
Response
```

---

# 42. IA Assíncrona

Operações demoradas deverão utilizar:

```text
ai_jobs
```

Fluxo:

```text
Upload
 ↓
Create AI Job
 ↓
pending
 ↓
processing
 ↓
completed
```

ou:

```text
failed
```

---

# 43. AI Job Status

Estados:

```text
pending
processing
completed
failed
cancelled
```

---

# 44. Upload

Arquivos deverão ser armazenados no Storage.

Estrutura recomendada:

```text
companies/{company_id}/products/{product_id}/...
```

ou:

```text
companies/{company_id}/ai/{job_id}/...
```

---

# 45. Storage Security

Um usuário não poderá:

```text
read
write
delete
```

arquivos de outra empresa.

Storage deverá possuir políticas coerentes com o modelo multi-tenant.

---

# 46. Imagens de Produto

Ao adicionar imagem:

```text
Upload
 ↓
Storage
 ↓
product_images
 ↓
Primary image
```

A exclusão do arquivo e do registro deverá ser consistente.

---

# 47. Catálogo Público

O catálogo público não deverá depender de sessão autenticada.

Fluxo:

```text
GET public catalog
       ↓
company slug
       ↓
company active?
       ↓
catalog enabled?
       ↓
published products
       ↓
response
```

---

# 48. Endpoint Público

Exemplo conceitual:

```text
GET /public/catalog/{company_slug}
```

---

# 49. Dados Públicos

O endpoint público deverá retornar somente:

```text
company
name
logo
description
contact
categories
published products
public prices
images
```

quando configurados.

---

# 50. Dados Proibidos no Endpoint Público

Nunca retornar:

```text
cost_price
supplier_id
supplier data
inventory movements
internal notes
user data
audit logs
AI metadata
subscription data
```

---

# 51. Catalog Requests

Cliente poderá enviar:

```text
POST /public/catalog/{company_slug}/requests
```

quando:

```text
allow_contact = true
```

---

# 52. Rate Limiting Público

Endpoints públicos deverão possuir proteção contra abuso.

Especialmente:

```text
catalog requests
contact forms
AI endpoints
authentication
password reset
```

---

# 53. CAPTCHA / Anti-Abuse

Avaliar mecanismos como:

```text
Cloudflare Turnstile
```

ou solução equivalente quando necessário.

Não tornar CAPTCHA obrigatório no MVP sem evidência de abuso.

---

# 54. Rate Limits

Os limites deverão ser configuráveis.

Exemplo conceitual:

```text
Public catalog:
100 requests/min/IP

Catalog request:
10 requests/hour/IP

AI:
plan-based
```

Os valores finais poderão ser ajustados durante implementação.

---

# 55. API Versioning

O MVP poderá utilizar:

```text
v1
```

para funções ou APIs públicas que precisem de versionamento.

Exemplo:

```text
/functions/v1/...
```

Mudanças incompatíveis deverão gerar nova versão.

---

# 56. Compatibilidade

Mudanças de API deverão preferir:

```text
backward compatibility
```

quando possível.

Evitar alterar silenciosamente:

```text
field names
types
semantics
```

---

# 57. API Pública Futura

O MarketFlow poderá futuramente oferecer API para:

```text
ERP
e-commerce
marketplaces
apps
automação
integrações
```

Por isso, APIs internas não deverão ser projetadas de forma excessivamente acoplada ao frontend.

---

# 58. API Keys Futuras

Futuramente poderão existir:

```text
API Keys
```

associadas à empresa.

Nunca armazenar a chave em texto puro após sua criação.

---

# 59. Webhooks Futuros

Preparar arquitetura para eventos:

```text
product.created
product.updated
inventory.updated
catalog.product_published
catalog.request.created
company.updated
```

---

# 60. Auditoria

Operações relevantes deverão gerar:

```text
audit_logs
```

Exemplos:

```text
product.created
product.updated
product.deleted

inventory.adjusted
inventory.entry
inventory.exit

user.invited
user.role_changed

catalog.updated

company.updated
```

---

# 61. Observabilidade

Operações críticas deverão possuir:

```text
request identifier
user identifier
company identifier
operation
duration
status
error
```

Nunca registrar secrets.

---

# 62. Logs

Nunca registrar:

```text
password
access token
refresh token
service role key
API key
secret
private credentials
```

---

# 63. Correlation ID

As operações poderão utilizar:

```text
X-Request-ID
```

ou mecanismo equivalente.

Isso facilitará troubleshooting.

---

# 64. Timeouts

Integrações externas deverão possuir:

```text
timeout
retry control
error handling
```

Nunca deixar uma requisição indefinidamente pendente.

---

# 65. Retries

Retries deverão ser utilizados somente quando apropriado.

Evitar retry automático para:

```text
400
401
403
404
422
```

Podem ser considerados para:

```text
429
5xx
temporary network failures
```

com backoff.

---

# 66. Integrações Externas

Integrações futuras deverão utilizar adapters.

Exemplo:

```text
AIProvider
 ├── OpenAI
 ├── Gemini
 └── Claude
```

O domínio do MarketFlow não deverá depender diretamente de um único provider.

---

# 67. IA

A interface interna poderá utilizar:

```text
AIService
```

com operações:

```text
recognizeProduct
recognizeShelf
extractProductData
```

---

# 68. AI Provider

Configuração:

```text
provider
model
temperature
max_tokens
```

deverá ficar fora do frontend quando envolver credenciais ou configuração protegida.

---

# 69. AI Response

Resultado deverá possuir estrutura previsível.

Exemplo:

```json
{
  "product": {
    "name": "Arroz Branco 5kg",
    "brand": "Marca X",
    "barcode": "789..."
  },
  "confidence": 0.94,
  "warnings": []
}
```

---

# 70. Human-in-the-Loop

Resultado de IA não deverá ser considerado automaticamente como verdade absoluta para dados críticos.

Fluxo:

```text
AI
 ↓
Result
 ↓
Confidence
 ↓
Human Review
 ↓
Confirm
 ↓
Persist
```

---

# 71. Importação de Produtos

Futuro:

```text
CSV
XLSX
JSON
```

poderão ser suportados.

Importações deverão possuir:

```text
validation
preview
error report
commit
rollback
```

---

# 72. Bulk Operations

Operações em massa deverão possuir endpoints ou funções específicas.

Exemplos:

```text
bulk_update_products
bulk_publish_catalog
bulk_adjust_inventory
```

Não executar milhares de requests individuais quando uma operação transacional for mais adequada.

---

# 73. Transactions

Bulk operations críticas deverão ser transacionais sempre que possível.

Resultado:

```text
success
partial_failure
failure
```

deverá ser explicitamente definido.

---

# 74. Conflitos

Exemplo:

```text
SKU já existente
```

retornar:

```text
409 Conflict
```

com código:

```text
PRODUCT_SKU_ALREADY_EXISTS
```

---

# 75. Exclusão

Antes de excluir uma entidade, validar dependências.

Exemplo:

```text
Categoria
 ↓
Produtos associados
```

O sistema deverá decidir entre:

```text
bloquear
reassociar
soft delete
```

conforme regra de negócio.

---

# 76. Integridade Referencial

A API não deverá permitir criar referências inválidas.

Exemplo:

```text
product.category_id
```

deverá pertencer à mesma:

```text
company_id
```

do produto.

---

# 77. Cross-Tenant Validation

Exemplo inválido:

```text
Company A
Product A
Category B
```

Resultado:

```text
DENIED
```

mesmo que ambos os IDs sejam válidos.

---

# 78. Transações Multi-Tenant

Uma transação deverá manter:

```text
company_id
```

consistente em todos os registros relacionados.

---

# 79. Segurança

A API deverá seguir:

```text
Authentication
Authorization
Validation
Tenant Isolation
Rate Limiting
Audit
Logging
```

---

# 80. OWASP

A implementação deverá considerar especialmente:

```text
Broken Object Level Authorization
Broken Authentication
Broken Object Property Level Authorization
Unrestricted Resource Consumption
Broken Function Level Authorization
Security Misconfiguration
Improper Inventory Management
Unsafe Consumption of APIs
```

---

# 81. Documentação

Toda API relevante deverá possuir documentação.

Para funções internas:

```text
README / Markdown
```

Para API pública futura:

```text
OpenAPI
```

---

# 82. Tipagem

Tipos compartilhados deverão ser centralizados sempre que possível.

Exemplo:

```text
Product
Company
InventoryItem
Lot
CatalogProduct
```

Evitar duplicar interfaces incompatíveis entre telas.

---

# 83. Frontend State

Utilizar:

```text
TanStack Query
```

para estado remoto.

Utilizar estado local/global somente quando necessário.

---

# 84. Cache

Queries deverão definir estratégias apropriadas de:

```text
staleTime
gcTime
refetch
invalidation
```

---

# 85. Mutation

Após mutation:

```text
create
update
delete
```

invalidar ou atualizar as queries relacionadas.

Exemplo:

```text
updateProduct
 ↓
invalidate products
 ↓
invalidate product detail
```

---

# 86. Optimistic Updates

Podem ser utilizados para operações de baixo risco.

Evitar optimistic update para:

```text
inventory
financial values
critical permissions
```

sem estratégia de rollback robusta.

---

# 87. Loading

Toda operação deverá possuir estado:

```text
loading
```

---

# 88. Empty

Listagens vazias deverão possuir:

```text
empty state
```

Exemplo:

```text
Nenhum produto encontrado.
```

---

# 89. Error

Erros deverão possuir:

```text
message
retry
context
```

quando apropriado.

---

# 90. Unauthorized

Se não autenticado:

```text
401
```

Frontend deverá direcionar para:

```text
/login
```

quando apropriado.

---

# 91. Forbidden

Se autenticado mas sem permissão:

```text
403
```

Frontend deverá apresentar:

```text
Você não possui permissão para acessar este recurso.
```

---

# 92. Not Found

Recurso inexistente ou propositalmente ocultado:

```text
404
```

---

# 93. Rate Limit

Ao atingir limite:

```text
429
```

Frontend deverá apresentar uma mensagem apropriada.

---

# 94. Plan Limit

Quando a operação for bloqueada por plano:

```text
403
```

ou código de negócio específico.

Exemplo:

```text
PLAN_LIMIT_REACHED
```

---

# 95. API Contract

Antes de implementar uma nova operação, definir:

```text
Input
Output
Permissions
Tenant scope
Validation
Errors
Audit
Rate limit
Transaction
```

---

# 96. Exemplo de Contrato

```text
Operation:
Create Product

Input:
name
description
category_id
brand_id
sku
barcode
cost_price
sale_price

Permission:
product.create

Scope:
company

Validation:
name required
sale_price >= 0
category belongs to company

Audit:
product.created

Output:
Product

Errors:
PRODUCT_INVALID
PRODUCT_SKU_ALREADY_EXISTS
CATEGORY_NOT_FOUND
ACCESS_DENIED
```

---

# 97. Não Acoplar ao Frontend

A API não deverá assumir que:

```text
React
```

é o único consumidor.

Futuras possibilidades:

```text
Mobile App
CLI
External API
Integrations
AI Agents
```

---

# 98. API para Agentes de IA

Futuramente, operações poderão ser consumidas por agentes.

Por isso, endpoints críticos deverão possuir contratos explícitos e previsíveis.

Nenhum agente deverá receber permissões maiores que o usuário que o autorizou.

---

# 99. Segurança de Agentes

Futuro suporte a AI Agents deverá considerar:

```text
scoped credentials
least privilege
audit
rate limits
tool permissions
tenant isolation
human approval
```

---

# 100. Definition of Done

A camada de API estará pronta quando:

- autenticação estiver integrada;
- autorização estiver integrada;
- RLS estiver ativo;
- tenant isolation estiver garantido;
- CRUDs principais estiverem definidos;
- paginação estiver padronizada;
- filtros estiverem validados;
- erros possuírem formato consistente;
- operações críticas forem transacionais;
- estoque possuir histórico;
- uploads estiverem protegidos;
- IA utilizar Edge Functions quando necessário;
- catálogo público estiver isolado;
- rate limiting estiver preparado;
- auditoria estiver integrada;
- logs não expuserem secrets;
- queries utilizarem TanStack Query;
- contratos de API estiverem documentados;
- testes de autorização e integração existirem.

---

# 101. Regra para IAs de Desenvolvimento

Qualquer IA implementando uma API do MarketFlow deverá:

1. Ler `01-FOUNDATION.md`.
2. Ler `02-DATABASE.md`.
3. Ler `03-AUTH.md`.
4. Ler `04-PERMISSIONS.md`.
5. Respeitar RLS.
6. Nunca confiar em `company_id` fornecido pelo cliente.
7. Nunca expor Service Role Key.
8. Nunca implementar autorização somente no frontend.
9. Validar inputs no backend.
10. Respeitar os contratos definidos neste documento.
11. Não criar endpoints redundantes sem necessidade.
12. Não alterar schema sem migration.
13. Não remover histórico de estoque.
14. Não expor dados privados no catálogo.
15. Registrar operações críticas.
16. Preservar compatibilidade sempre que possível.

---

# 102. Próximo Documento

```text
06-ROADMAP.md
```

O próximo documento deverá consolidar a evolução do MarketFlow em fases e sprints, definindo:

- MVP;
- prioridades;
- dependências;
- entregas;
- critérios de conclusão;
- funcionalidades futuras;
- monetização;
- filiais;
- integrações;
- IA;
- API pública;
- evolução para arquitetura enterprise.