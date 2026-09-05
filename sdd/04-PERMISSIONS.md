# MarketFlow — Permissions & Authorization

> Especificação oficial de autorização, RBAC, permissões por recurso e isolamento de acesso do MarketFlow.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento  
**Documento:** 04-PERMISSIONS.md  
**Documentos relacionados:**
- 00-VISION.md
- 01-FOUNDATION.md
- 02-DATABASE.md
- 03-AUTH.md

---

# 1. Objetivo

Definir o modelo de autorização do MarketFlow.

Este documento determina:

- quem pode acessar o sistema;
- quais recursos cada perfil pode visualizar;
- quais ações cada perfil pode executar;
- como funciona o acesso entre empresas;
- como funciona o Global Admin;
- como o RBAC se relaciona com RLS;
- como proteger operações críticas;
- como tratar usuários públicos;
- como preparar a arquitetura para permissões mais granulares no futuro.

---

# 2. Princípio Fundamental

Autenticação responde:

```text
Quem é você?
```

Autorização responde:

```text
O que você pode fazer?
```

Um usuário autenticado não possui automaticamente acesso aos recursos da plataforma.

A autorização deverá considerar:

```text
User
+
Company
+
Role
+
Resource
+
Action
```

---

# 3. Modelo RBAC

O MVP utilizará RBAC:

```text
Role-Based Access Control
```

Papéis:

```text
GLOBAL_ADMIN
ADMIN
STOCK
VISITOR
```

---

# 4. Escopo do Papel

O papel pertence à associação entre usuário e empresa.

Não existe:

```text
User.role
```

como regra principal.

Existe:

```text
CompanyUser.role
```

Exemplo:

```text
João

Empresa A → ADMIN

Empresa B → STOCK

Empresa C → VISITOR
```

---

# 5. Hierarquia Conceitual

```text
GLOBAL_ADMIN
    │
    └── Plataforma inteira

ADMIN
    │
    └── Empresa

STOCK
    │
    └── Operações de estoque

VISITOR
    │
    └── Consulta
```

---

# 6. Global Admin

O Global Admin é um administrador da plataforma.

Não pertence necessariamente a uma empresa específica para exercer seus privilégios administrativos de plataforma.

Pode:

- visualizar empresas;
- criar empresas;
- editar empresas;
- suspender empresas;
- visualizar usuários;
- administrar usuários;
- visualizar planos;
- administrar planos;
- visualizar utilização;
- administrar configurações globais;
- visualizar auditoria global;
- administrar recursos da plataforma.

---

# 7. Restrição do Global Admin

O Global Admin deverá possuir privilégios elevados, mas suas ações deverão ser auditadas.

Operações críticas:

```text
Alterar empresa
Suspender empresa
Alterar plano
Alterar usuário
Alterar configuração global
```

deverão gerar auditoria.

---

# 8. Admin

O Admin possui autoridade administrativa dentro de uma empresa.

Pode:

```text
Products
Categories
Brands
Manufacturers
Suppliers
Inventory
Lots
Catalog
Users
Company Settings
```

---

# 9. Admin Não Pode

O Admin não pode:

- administrar outra empresa;
- alterar configurações globais;
- acessar dados de outros tenants;
- alterar planos globais;
- criar Global Admin;
- visualizar auditoria de outra empresa.

---

# 10. Stock

O perfil Stock é destinado a funcionários responsáveis pelo estoque.

Pode:

```text
Visualizar produtos
Criar produtos
Editar produtos
Visualizar categorias
Visualizar marcas
Visualizar fabricantes
Visualizar fornecedores
Criar/editar estoque
Criar/editar lotes
Consultar validade
Executar inventário
Utilizar recursos de IA relacionados ao estoque
```

---

# 11. Stock Não Pode

Não pode:

```text
Gerenciar usuários
Alterar permissões
Excluir empresa
Alterar assinatura
Alterar configurações administrativas críticas
```

---

# 12. Visitor

O Visitor possui acesso somente leitura.

Pode:

```text
Visualizar produtos
Visualizar preços
Visualizar categorias
Visualizar catálogo
Visualizar estoque quando explicitamente permitido
```

Por padrão, o estoque interno detalhado não deverá ser exibido.

---

# 13. Visitor Não Pode

Não pode:

```text
Criar
Editar
Excluir
Alterar preços
Alterar estoque
Gerenciar usuários
Alterar empresa
Executar ações administrativas
```

---

# 14. Público

Usuários não autenticados possuem acesso exclusivamente ao catálogo público.

Podem:

```text
Visualizar empresa publicada
Visualizar produtos publicados
Pesquisar produtos
Filtrar categorias
Visualizar preços publicados
Enviar solicitação de contato quando habilitado
```

---

# 15. Público Não Pode

Não pode:

```text
Acessar Dashboard
Acessar estoque
Acessar fornecedores
Acessar usuários
Acessar preços de custo
Acessar margem
Acessar auditoria
Acessar dados privados
```

---

# 16. Matriz Geral

| Recurso | Global Admin | Admin | Stock | Visitor | Público |
|---|---:|---:|---:|---:|---:|
| Empresas | CRUD | R | R | R | Público |
| Produtos | CRUD | CRUD | CRU | R | R* |
| Categorias | CRUD | CRUD | CRU | R | R* |
| Marcas | CRUD | CRUD | CRU | R | R* |
| Fabricantes | CRUD | CRUD | CRU | R | - |
| Fornecedores | CRUD | CRUD | R | R | - |
| Estoque | CRUD | CRUD | CRU | R limitado | - |
| Lotes | CRUD | CRUD | CRU | - | - |
| Usuários | CRUD | CRUD | - | - | - |
| Catálogo | CRUD | CRUD | R | R | R* |
| Configurações | CRUD | CRUD | R limitado | R | - |
| Auditoria | CRUD | R | - | - | - |
| IA | CRUD | CRUD | CRU | R limitado | - |
| Planos | CRUD | R | - | - | - |

`R*` = somente conteúdo publicado.

---

# 17. Convenção CRUD

```text
C = Create
R = Read
U = Update
D = Delete
```

---

# 18. Produto

## Global Admin

```text
Create ✓
Read ✓
Update ✓
Delete ✓
```

## Admin

```text
Create ✓
Read ✓
Update ✓
Delete ✓
```

## Stock

```text
Create ✓
Read ✓
Update ✓
Delete ✗
```

## Visitor

```text
Create ✗
Read ✓
Update ✗
Delete ✗
```

## Público

```text
Create ✗
Read ✓*
Update ✗
Delete ✗
```

---

# 19. Preços

Preço de venda:

```text
Admin → CRUD
Stock → R/U
Visitor → R
Público → R se publicado
```

Preço de custo:

```text
Admin → CRUD
Stock → R
Visitor → NÃO
Público → NÃO
```

Margem:

```text
Admin → R
Stock → NÃO
Visitor → NÃO
Público → NÃO
```

---

# 20. Estoque

Admin:

```text
visualizar
criar
ajustar
inventariar
```

Stock:

```text
visualizar
criar movimentações
ajustar
inventariar
```

Visitor:

```text
consulta limitada
```

Público:

```text
não acessar estoque interno
```

---

# 21. Lotes

Admin:

```text
CRUD
```

Stock:

```text
CRU
```

Visitor:

```text
R limitado
```

Público:

```text
não acessar
```

---

# 22. Validade

Admin:

```text
CRUD
```

Stock:

```text
CRU
```

Visitor:

```text
R
```

Público:

```text
não acessar
```

O catálogo público poderá futuramente exibir informações de validade apenas quando explicitamente configurado.

---

# 23. Fornecedores

Admin:

```text
CRUD
```

Stock:

```text
R
```

Visitor:

```text
R limitado
```

Público:

```text
não acessar
```

---

# 24. Usuários

Somente:

```text
GLOBAL_ADMIN
ADMIN
```

poderão gerenciar usuários.

Stock e Visitor não poderão:

```text
convidar
remover
editar role
desativar
```

---

# 25. Gerenciamento de Roles

Somente Admin poderá alterar roles dentro de sua própria empresa.

Porém:

```text
Admin não pode criar Global Admin.
```

---

# 26. Proteção do Último Admin

Não permitir:

```text
remover último Admin
```

sem que outro Admin seja definido.

Fluxo:

```text
Admin A

↓

Promover Admin B

↓

Remover Admin A
```

---

# 27. Convites

Admin pode:

```text
criar convite
definir role
reenviar convite
cancelar convite
```

Stock não pode criar convite.

Visitor não pode criar convite.

---

# 28. Empresa

Admin poderá editar:

```text
Nome
Logo
Telefone
WhatsApp
Endereço
Descrição
Configurações do catálogo
```

Algumas operações críticas poderão exigir confirmação adicional.

---

# 29. Exclusão da Empresa

Nenhum usuário comum deverá possuir exclusão imediata da empresa.

Mesmo Admin deverá seguir o fluxo de desativação/exclusão definido em:

```text
08-SECURITY.md
```

---

# 30. Catálogo

Admin pode:

```text
habilitar/desabilitar
publicar produtos
remover produtos
alterar ordem
configurar contato
```

Stock pode:

```text
visualizar
```

ou, quando autorizado futuramente:

```text
editar disponibilidade
```

---

# 31. Catálogo Público

O catálogo deverá utilizar somente dados explicitamente publicados.

Regra:

```text
Produto ativo
AND
Produto publicado
AND
Empresa ativa
AND
Catálogo ativo
```

---

# 32. Contato Público

A solicitação de contato somente deverá estar disponível quando:

```text
catalog_settings.allow_contact = true
```

---

# 33. Solicitações

Admin:

```text
Read
Update status
```

Stock:

```text
Read limitado
```

Visitor:

```text
Read limitado
```

Público:

```text
Create
```

O público não poderá visualizar solicitações existentes.

---

# 34. IA

Admin poderá utilizar todas as funções permitidas pelo plano.

Stock poderá utilizar funções relacionadas ao trabalho de estoque.

Visitor terá acesso somente a resultados explicitamente disponibilizados.

Público não terá acesso direto à IA administrativa.

---

# 35. Limites de IA

Permissões não substituem limites de plano.

Exemplo:

```text
Stock possui permissão para usar IA
```

mas:

```text
Company atingiu limite mensal
```

Resultado:

```text
Acesso negado por limite de plano.
```

---

# 36. Autorização em Camadas

Toda operação deverá passar por:

```text
1. Authentication

↓

2. Company Membership

↓

3. Role

↓

4. Resource Ownership

↓

5. Action Permission

↓

6. Plan Limit
```

---

# 37. Exemplo

Usuário:

```text
João
```

Empresa atual:

```text
Mercado Central
```

Role:

```text
Stock
```

Operação:

```text
Editar Produto
```

Validação:

```text
João autenticado?
        ↓
SIM

Pertence ao Mercado Central?
        ↓
SIM

Role permite edição?
        ↓
SIM

Produto pertence ao Mercado Central?
        ↓
SIM

Plano permite operação?
        ↓
SIM

→ PERMITIR
```

---

# 38. Cross-Tenant Access

A seguinte operação deverá ser sempre bloqueada:

```text
User Company A
        ↓
Product Company B
```

Mesmo que o usuário conheça:

```text
product_id
```

não poderá acessar o recurso.

---

# 39. IDOR

A arquitetura deverá proteger contra:

```text
Insecure Direct Object Reference
```

Exemplo:

```text
/products/{id}
```

Conhecer o ID não concede acesso.

---

# 40. RLS

RLS será a principal camada de isolamento de dados.

Políticas deverão verificar a associação:

```text
auth.uid()
```

com:

```text
company_users
```

---

# 41. RLS + Role

RLS deverá considerar:

```text
user
+
company
+
role
```

quando necessário.

Exemplo conceitual:

```text
Admin pode UPDATE products.

Stock pode UPDATE products.

Visitor somente SELECT.
```

---

# 42. Segurança

Não implementar:

```text
if (user.role === 'admin')
```

como única proteção.

Isso pode ser utilizado para UX.

A autorização real deverá existir no backend/banco.

---

# 43. Frontend

O frontend poderá esconder ações que o usuário não pode executar.

Exemplo:

```text
Stock
```

não deverá visualizar:

```text
Gerenciar usuários
```

Mas esconder o botão não é segurança.

A API/database deverá rejeitar a operação caso seja tentada diretamente.

---

# 44. Permission Helper

A aplicação deverá possuir mecanismo centralizado.

Exemplo conceitual:

```text
can("product.create")
can("product.update")
can("product.delete")
can("inventory.adjust")
can("user.manage")
```

Evitar espalhar verificações de role pelo código.

---

# 45. Permission Names

As permissões deverão utilizar nomenclatura consistente.

Exemplos:

```text
company.read
company.update

product.create
product.read
product.update
product.delete

inventory.read
inventory.adjust

lot.create
lot.read
lot.update

supplier.create
supplier.read
supplier.update
supplier.delete

user.invite
user.read
user.update
user.remove

catalog.read
catalog.manage

ai.product_recognition
ai.shelf_recognition
ai.ocr

audit.read
```

---

# 46. Permissões Futuras

A arquitetura deverá permitir migrar de:

```text
Role
```

para:

```text
Role
   ↓
Permissions
```

sem reescrever todo o sistema.

---

# 47. Permissões Customizadas

Não implementar permissões customizadas no MVP.

Porém, a estrutura deverá permitir futuramente:

```text
Admin
   ↓
Custom Role
   ↓
Selected Permissions
```

---

# 48. ABAC Futuro

A arquitetura poderá evoluir futuramente para ABAC:

```text
Attribute-Based Access Control
```

Exemplo:

```text
Role = Stock

AND

Store = Store A

AND

Operation = Inventory
```

Isso será necessário caso o sistema passe a suportar múltiplas filiais.

---

# 49. Auditoria

Toda alteração de autorização deverá ser auditada.

Exemplos:

```text
role.changed
user.invited
user.removed
user.disabled
permission.changed
```

---

# 50. Operações Críticas

Operações críticas deverão exigir permissões explícitas.

Exemplos:

```text
Alterar role
Excluir produto
Ajustar estoque
Alterar preço
Desativar empresa
Alterar plano
```

---

# 51. Confirmação

Para operações de alto risco, utilizar confirmação.

Exemplo:

```text
Você está prestes a alterar o preço de venda.

Preço atual:
R$ 10,00

Novo preço:
R$ 15,00

[Cancelar]
[Confirmar]
```

---

# 52. Reautenticação

Operações extremamente críticas poderão exigir reautenticação.

Exemplos:

```text
Excluir conta
Alterar email
Alterar senha
Desativar empresa
```

---

# 53. Planos

A autorização deverá considerar limites comerciais.

Exemplo:

```text
Role permite criar empresa
```

mas:

```text
Plano Free
3 empresas utilizadas
```

Resultado:

```text
Bloquear criação.
```

---

# 54. Mensagens de Acesso

Quando o usuário não tiver permissão:

```text
Você não possui permissão para realizar esta ação.
```

Quando o limite do plano for atingido:

```text
Você atingiu o limite do seu plano.
```

Não utilizar a mesma mensagem para situações diferentes.

---

# 55. Forbidden vs Not Found

Quando apropriado, o sistema poderá responder:

```text
403 Forbidden
```

para recurso conhecido mas não autorizado.

Em determinados cenários, poderá retornar:

```text
404 Not Found
```

para não revelar a existência do recurso.

Essa decisão deverá considerar segurança contra enumeração.

---

# 56. Público

Nunca permitir que endpoints administrativos sejam acessíveis simplesmente porque:

```text
auth.uid() IS NULL
```

A ausência de autenticação não significa acesso.

---

# 57. Views Públicas

Recomenda-se utilizar views ou queries específicas para catálogo público.

Exemplo conceitual:

```text
public_catalog_products
```

Essa camada deverá expor somente:

```text
nome
descrição
imagem
categoria
marca
preço público
```

---

# 58. Informações Nunca Públicas

Nunca disponibilizar:

```text
cost_price
supplier
margin
audit_logs
internal_notes
inventory_movements
user data
AI internal metadata
```

sem uma decisão explícita de produto.

---

# 59. Testes de Autorização

Deverão existir testes para:

```text
Admin → Company A

Admin → Company B

Stock → Company A

Visitor → Company A

Public → Catalog
```

---

# 60. Teste Cross-Tenant

Teste obrigatório:

```text
Usuário A

Company A

↓

tentar acessar Product da Company B
```

Resultado esperado:

```text
DENIED
```

---

# 61. Teste de Role

Exemplo:

```text
Stock

↓

tentar excluir produto
```

Resultado:

```text
DENIED
```

---

# 62. Teste de Preço de Custo

Exemplo:

```text
Visitor

↓

consultar cost_price
```

Resultado:

```text
DENIED
```

---

# 63. Teste de Usuário

Exemplo:

```text
Stock

↓

gerenciar usuários
```

Resultado:

```text
DENIED
```

---

# 64. Teste Público

Exemplo:

```text
Anonymous

↓

Produto não publicado
```

Resultado:

```text
DENIED
```

---

# 65. Princípio do Menor Privilégio

Todo usuário deverá receber somente os acessos necessários para realizar seu trabalho.

Não conceder:

```text
Admin
```

quando:

```text
Stock
```

for suficiente.

---

# 66. Default Deny

O comportamento padrão deverá ser:

```text
DENY
```

Acesso somente será permitido quando existir uma regra explícita.

---

# 67. Falha Segura

Se uma verificação de autorização falhar ou estiver indisponível:

```text
DENY
```

Nunca:

```text
ALLOW
```

---

# 68. Alteração de Role

Ao alterar uma role:

```text
CompanyUser.role
```

a nova permissão deverá ser aplicada imediatamente.

Sessões ou caches deverão ser invalidados quando necessário.

---

# 69. Cache

Não manter permissões em cache por tempo excessivo.

Após mudanças administrativas importantes, o sistema deverá atualizar o contexto de autorização.

---

# 70. Performance

As verificações de membership deverão ser eficientes.

Criar índices apropriados em:

```text
company_users.user_id

company_users.company_id

(company_id, user_id)
```

---

# 71. Segurança por Banco

As tabelas multi tenant deverão possuir RLS.

Não confiar somente em:

```text
React
```

ou:

```text
API client
```

para controle de acesso.

---

# 72. API

Toda API administrativa deverá assumir:

```text
authenticated
```

e validar:

```text
membership
+
role
+
resource
```

---

# 73. Edge Functions

Quando Edge Functions forem utilizadas:

- validar autenticação;
- validar empresa;
- validar autorização;
- validar input;
- aplicar limites;
- registrar operações críticas.

Nunca confiar no frontend.

---

# 74. IA

Operações de IA deverão validar:

```text
authenticated user

company membership

permission

plan limit

file ownership
```

antes do processamento.

---

# 75. Upload

Um usuário não poderá solicitar processamento de IA utilizando:

```text
storage_path
```

pertencente a outra empresa.

O arquivo deverá pertencer ao mesmo tenant.

---

# 76. Catálogo

O público poderá acessar:

```text
company slug
```

mas isso não significa acesso ao tenant inteiro.

Somente dados explicitamente publicados deverão ser retornados.

---

# 77. Auditoria de Autorização

Registrar:

```text
authorization.denied
```

quando houver tentativas relevantes de acesso negado.

Evitar registrar informações sensíveis desnecessárias.

---

# 78. Abuse Detection

Múltiplas tentativas de acesso indevido poderão gerar sinais de segurança.

Exemplo:

```text
User tenta acessar 100 products
de diferentes companies
```

Isso poderá ser tratado futuramente como comportamento suspeito.

---

# 79. Futuro — Hierarquia de Usuários

Futuramente poderá existir:

```text
Global Admin

Company Admin

Store Admin

Department Manager

Stock Operator

Viewer
```

A arquitetura atual deverá permitir essa evolução.

---

# 80. Futuro — Filiais

Quando múltiplas lojas forem implementadas:

```text
Company
   │
   ├── Store A
   ├── Store B
   └── Store C
```

permissões poderão ser aplicadas por:

```text
Company
Store
Resource
```

---

# 81. Futuro — Custom Roles

Poderá existir:

```text
Custom Role
```

com permissões selecionadas.

Exemplo:

```text
Supervisor de Estoque

✓ inventory.read
✓ inventory.adjust
✓ product.read
✓ product.update

✗ user.manage
✗ company.delete
```

---

# 82. Futuro — ABAC

Caso o produto cresça, avaliar ABAC quando RBAC não for suficiente.

Exemplo:

```text
User role = Stock

AND

User store = Store A

AND

Inventory store = Store A
```

---

# 83. Definition of Done

A autorização estará pronta quando:

- RBAC estiver implementado;
- roles estiverem centralizadas;
- permissions estiverem documentadas;
- RLS estiver ativo;
- cross-tenant estiver protegido;
- Global Admin estiver protegido;
- Admin estiver limitado à própria empresa;
- Stock estiver limitado às funções de estoque;
- Visitor possuir somente leitura;
- catálogo público estiver isolado;
- preços de custo estiverem protegidos;
- fornecedores estiverem protegidos;
- usuários estiverem protegidos;
- limites de plano forem considerados;
- operações críticas forem auditadas;
- testes de autorização estiverem implementados;
- default deny estiver garantido.

---

# 84. Próximo Documento

```text
05-API.md
```

O próximo documento deverá especificar a camada de comunicação da aplicação:

- padrões de API;
- endpoints;
- queries;
- mutations;
- Edge Functions;
- autenticação;
- autorização;
- paginação;
- filtros;
- ordenação;
- erros;
- validação;
- upload;
- IA;
- catálogo público;
- rate limiting;
- versionamento;
- webhooks futuros.