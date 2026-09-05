# MarketFlow — Database Specification

> Especificação oficial do modelo de dados PostgreSQL do MarketFlow.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento  
**Documento:** 02-DATABASE.md  
**Documentos relacionados:**  
- 00-VISION.md
- 01-FOUNDATION.md

---

# 1. Objetivo

Este documento define o modelo de dados oficial do MarketFlow.

A especificação contempla:

- entidades;
- relacionamentos;
- tipos de dados;
- chaves primárias;
- chaves estrangeiras;
- índices;
- constraints;
- enums;
- auditoria;
- estoque;
- catálogo;
- usuários;
- empresas;
- planos;
- utilização de IA;
- Row Level Security;
- integridade dos dados.

O banco deverá ser projetado para suportar o crescimento da plataforma sem exigir uma reestruturação completa.

---

# 2. Banco de Dados

Banco principal:

```text
PostgreSQL
```

Infraestrutura:

```text
Lovable Cloud
+
Supabase
```

O banco será compartilhado entre os tenants utilizando isolamento lógico por `company_id`.

---

# 3. Princípio Multi Tenant

Toda entidade pertencente ao ambiente de uma empresa deverá possuir:

```text
company_id UUID NOT NULL
```

Exemplo:

```text
products.company_id
categories.company_id
brands.company_id
suppliers.company_id
inventory.company_id
```

O `company_id` deverá ser protegido por RLS.

---

# 4. Identificadores

Todas as tabelas deverão utilizar UUID como chave primária.

Padrão:

```sql
id UUID PRIMARY KEY DEFAULT gen_random_uuid()
```

Não utilizar IDs sequenciais expostos publicamente.

---

# 5. Timestamps

Tabelas de negócio deverão possuir:

```sql
created_at TIMESTAMPTZ NOT NULL DEFAULT now()
updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
```

Quando necessário:

```sql
deleted_at TIMESTAMPTZ
```

---

# 6. Convenções

Nomes:

```text
snake_case
```

Tabelas:

```text
plural
```

Exemplos:

```text
companies
products
categories
suppliers
inventory_items
```

Foreign Keys:

```text
<entity>_id
```

Exemplo:

```text
company_id
product_id
supplier_id
```

---

# 7. Enum — Roles

Criar enum:

```sql
CREATE TYPE app_role AS ENUM (
  'global_admin',
  'admin',
  'stock',
  'visitor'
);
```

---

# 8. Enum — Status

Quando houver estados controlados, utilizar enums ou tabelas de referência conforme a necessidade.

Evitar strings arbitrárias para estados críticos.

---

# 9. Tabela: profiles

Representa informações adicionais do usuário autenticado.

```text
profiles

id
full_name
avatar_url
phone
created_at
updated_at
```

`id` deverá corresponder ao:

```text
auth.users.id
```

---

# 10. Tabela: companies

Representa uma empresa/tenant.

Campos:

```text
companies

id UUID PK

name VARCHAR(150) NOT NULL

legal_name VARCHAR(200)

cnpj VARCHAR(20)

slug VARCHAR(100) NOT NULL

email VARCHAR(255)

phone VARCHAR(30)

whatsapp VARCHAR(30)

logo_url TEXT

description TEXT

active BOOLEAN NOT NULL DEFAULT true

created_by UUID

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

---

# 11. Constraints — Companies

`slug` deverá ser único globalmente.

```text
UNIQUE(slug)
```

CNPJ deverá ser único quando informado.

Não permitir:

```text
slug vazio
name vazio
```

---

# 12. Tabela: company_users

Relaciona usuários às empresas.

```text
company_users

id UUID PK

company_id UUID NOT NULL

user_id UUID NOT NULL

role app_role NOT NULL

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

Relacionamentos:

```text
company_id → companies.id

user_id → profiles.id
```

---

# 13. Constraint — Company Users

Um usuário não poderá possuir dois registros ativos para a mesma empresa.

Criar constraint lógica equivalente a:

```text
UNIQUE(company_id, user_id)
```

---

# 14. Global Admin

O papel `global_admin` deverá ser tratado como privilégio de plataforma.

Não confiar exclusivamente em uma coluna manipulável pelo usuário.

A implementação deverá possuir uma estratégia segura para identificar administradores globais.

Essa regra será detalhada em:

```text
04-PERMISSIONS.md
```

---

# 15. Tabela: categories

Categorias pertencem à empresa.

```text
categories

id UUID PK

company_id UUID NOT NULL

name VARCHAR(100) NOT NULL

description TEXT

parent_id UUID

image_url TEXT

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

---

# 16. Categorias Hierárquicas

`parent_id` permite categorias e subcategorias.

Exemplo:

```text
Bebidas
├── Refrigerantes
├── Sucos
└── Águas
```

Relacionamento:

```text
parent_id → categories.id
```

Uma categoria não poderá ser sua própria mãe.

---

# 17. Tabela: manufacturers

Fabricantes pertencem à empresa.

```text
manufacturers

id UUID PK

company_id UUID NOT NULL

name VARCHAR(150) NOT NULL

document VARCHAR(30)

email VARCHAR(255)

phone VARCHAR(30)

website TEXT

notes TEXT

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

---

# 18. Tabela: brands

Marcas pertencem à empresa.

```text
brands

id UUID PK

company_id UUID NOT NULL

name VARCHAR(100) NOT NULL

manufacturer_id UUID

logo_url TEXT

description TEXT

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

Relacionamento:

```text
manufacturer_id → manufacturers.id
```

---

# 19. Tabela: suppliers

Fornecedores pertencem à empresa.

```text
suppliers

id UUID PK

company_id UUID NOT NULL

name VARCHAR(150) NOT NULL

legal_name VARCHAR(200)

cnpj VARCHAR(20)

email VARCHAR(255)

phone VARCHAR(30)

whatsapp VARCHAR(30)

contact_name VARCHAR(150)

address TEXT

city VARCHAR(100)

state VARCHAR(100)

zip_code VARCHAR(20)

notes TEXT

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

---

# 20. Tabela: products

Tabela central do sistema.

```text
products

id UUID PK

company_id UUID NOT NULL

category_id UUID

brand_id UUID

manufacturer_id UUID

default_supplier_id UUID

name VARCHAR(200) NOT NULL

description TEXT

sku VARCHAR(100)

barcode VARCHAR(50)

unit VARCHAR(30)

weight NUMERIC(12,3)

volume NUMERIC(12,3)

cost_price NUMERIC(12,2)

sale_price NUMERIC(12,2)

promotional_price NUMERIC(12,2)

minimum_stock NUMERIC(12,3)

maximum_stock NUMERIC(12,3)

image_url TEXT

active BOOLEAN NOT NULL DEFAULT true

catalog_visible BOOLEAN NOT NULL DEFAULT false

show_price BOOLEAN NOT NULL DEFAULT true

allow_contact BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ

deleted_at TIMESTAMPTZ
```

---

# 21. Regras de Produto

Preço não poderá ser negativo.

```text
cost_price >= 0
sale_price >= 0
promotional_price >= 0
```

Estoque mínimo não poderá ser negativo.

SKU deverá ser único dentro da empresa quando informado.

Código de barras deverá ser único dentro da empresa quando informado.

---

# 22. Preços

O preço atual poderá ser armazenado no produto para acesso rápido.

Porém, alterações de preço deverão ser auditáveis.

Não sobrescrever o histórico sem registrar a alteração.

Futuro:

```text
product_price_history
```

---

# 23. Tabela: product_price_history

Preparada para histórico comercial.

```text
product_price_history

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

old_cost_price NUMERIC(12,2)

new_cost_price NUMERIC(12,2)

old_sale_price NUMERIC(12,2)

new_sale_price NUMERIC(12,2)

old_promotional_price NUMERIC(12,2)

new_promotional_price NUMERIC(12,2)

changed_by UUID

created_at TIMESTAMPTZ
```

---

# 24. Tabela: inventory_items

Representa o estoque atual de um produto.

```text
inventory_items

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

quantity NUMERIC(12,3) NOT NULL DEFAULT 0

reserved_quantity NUMERIC(12,3) NOT NULL DEFAULT 0

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 25. Estoque Disponível

Estoque disponível deverá ser calculado como:

```text
available_quantity =
quantity - reserved_quantity
```

Não armazenar esse valor separadamente sem necessidade.

---

# 26. Tabela: lots

Cada lote representa uma unidade de rastreabilidade do estoque.

```text
lots

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

supplier_id UUID

lot_number VARCHAR(100) NOT NULL

manufacturing_date DATE

expiration_date DATE

initial_quantity NUMERIC(12,3) NOT NULL

current_quantity NUMERIC(12,3) NOT NULL

cost_price NUMERIC(12,2)

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 27. Lotes

Um produto poderá possuir múltiplos lotes.

Exemplo:

```text
Produto:
Leite Integral 1L

Lote A123
Validade: 10/2026
Quantidade: 20

Lote B456
Validade: 12/2026
Quantidade: 50
```

---

# 28. Controle de Validade

O sistema deverá permitir identificar:

```text
Produtos vencidos

Produtos vencendo

Produtos próximos da validade

Produtos sem validade cadastrada
```

A quantidade de dias para alerta deverá ser configurável futuramente.

---

# 29. Tabela: inventory_movements

Toda alteração significativa de estoque deverá gerar movimentação.

```text
inventory_movements

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

lot_id UUID

type VARCHAR(30) NOT NULL

quantity NUMERIC(12,3) NOT NULL

reason VARCHAR(255)

reference_id UUID

performed_by UUID

created_at TIMESTAMPTZ
```

Tipos iniciais:

```text
entry
exit
adjustment
loss
expired
inventory
```

---

# 30. Regra de Estoque

Não apagar movimentações históricas.

Para corrigir um lançamento:

```text
Movimentação incorreta

↓

Nova movimentação de ajuste
```

Isso preserva rastreabilidade.

---

# 31. Tabela: product_images

Permite múltiplas imagens por produto.

```text
product_images

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

storage_path TEXT NOT NULL

public_url TEXT

alt_text TEXT

is_primary BOOLEAN NOT NULL DEFAULT false

created_at TIMESTAMPTZ
```

---

# 32. Tabela: catalog_settings

Configurações do catálogo público da empresa.

```text
catalog_settings

id UUID PK

company_id UUID NOT NULL

enabled BOOLEAN NOT NULL DEFAULT true

show_prices BOOLEAN NOT NULL DEFAULT true

allow_contact BOOLEAN NOT NULL DEFAULT true

contact_phone VARCHAR(30)

contact_whatsapp VARCHAR(30)

contact_email VARCHAR(255)

welcome_message TEXT

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 33. Tabela: catalog_categories

Opcionalmente permite controlar a ordem e publicação das categorias.

```text
catalog_categories

id UUID PK

company_id UUID NOT NULL

category_id UUID NOT NULL

visible BOOLEAN NOT NULL DEFAULT true

display_order INTEGER NOT NULL DEFAULT 0

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 34. Tabela: catalog_products

Permite controlar a publicação individual.

```text
catalog_products

id UUID PK

company_id UUID NOT NULL

product_id UUID NOT NULL

visible BOOLEAN NOT NULL DEFAULT true

display_order INTEGER NOT NULL DEFAULT 0

featured BOOLEAN NOT NULL DEFAULT false

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 35. Solicitações do Catálogo

Quando a loja habilitar contato, clientes poderão enviar solicitações.

Tabela:

```text
catalog_requests

id UUID PK

company_id UUID NOT NULL

customer_name VARCHAR(150)

customer_phone VARCHAR(30)

customer_email VARCHAR(255)

message TEXT

status VARCHAR(30) NOT NULL DEFAULT 'new'

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

Status:

```text
new
in_progress
completed
cancelled
```

---

# 36. Tabela: catalog_request_items

Permite que uma solicitação contenha produtos.

```text
catalog_request_items

id UUID PK

company_id UUID NOT NULL

request_id UUID NOT NULL

product_id UUID

product_name_snapshot VARCHAR(200)

quantity NUMERIC(12,3)

created_at TIMESTAMPTZ
```

O `product_name_snapshot` preserva o nome utilizado no momento da solicitação.

---

# 37. Configuração de Contato

A empresa poderá escolher:

```text
Contato habilitado
Contato desabilitado
```

Quando desabilitado:

```text
catalog_requests
```

não deverá ser criado através do catálogo público.

---

# 38. Tabela: ai_usage

Controle de utilização da Inteligência Artificial.

```text
ai_usage

id UUID PK

company_id UUID NOT NULL

user_id UUID

operation VARCHAR(50) NOT NULL

provider VARCHAR(50)

model VARCHAR(100)

tokens_input INTEGER

tokens_output INTEGER

estimated_cost NUMERIC(12,6)

status VARCHAR(30)

created_at TIMESTAMPTZ
```

Operações:

```text
product_recognition
shelf_recognition
ocr
product_suggestion
```

---

# 39. Tabela: ai_jobs

Representa uma operação de IA.

```text
ai_jobs

id UUID PK

company_id UUID NOT NULL

user_id UUID

operation VARCHAR(50) NOT NULL

status VARCHAR(30) NOT NULL

input_storage_path TEXT

result JSONB

confidence NUMERIC(5,2)

error_message TEXT

created_at TIMESTAMPTZ

completed_at TIMESTAMPTZ
```

Status:

```text
pending
processing
completed
failed
cancelled
```

---

# 40. Resultado de IA

Resultados estruturados deverão utilizar JSONB quando a estrutura variar conforme a operação.

Exemplo:

```json
{
  "products": [
    {
      "name": "Coca-Cola",
      "brand": "Coca-Cola",
      "volume": "2L",
      "confidence": 0.94
    }
  ]
}
```

---

# 41. Tabela: audit_logs

Registro de operações relevantes.

```text
audit_logs

id UUID PK

company_id UUID

user_id UUID

action VARCHAR(100) NOT NULL

entity_type VARCHAR(100)

entity_id UUID

old_data JSONB

new_data JSONB

metadata JSONB

ip_address INET

user_agent TEXT

created_at TIMESTAMPTZ
```

---

# 42. Ações Auditáveis

Exemplos:

```text
company.created

company.updated

user.invited

user.role_changed

product.created

product.updated

product.deleted

price.changed

inventory.updated

lot.created

lot.updated

catalog.updated

ai.requested
```

---

# 43. Tabela: plans

Planos comerciais.

```text
plans

id UUID PK

name VARCHAR(100) NOT NULL

slug VARCHAR(100) UNIQUE NOT NULL

description TEXT

price_monthly NUMERIC(12,2)

price_yearly NUMERIC(12,2)

active BOOLEAN NOT NULL DEFAULT true

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 44. Tabela: plan_limits

Limites dos planos.

```text
plan_limits

id UUID PK

plan_id UUID NOT NULL

resource VARCHAR(100) NOT NULL

limit_value INTEGER

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

Exemplos:

```text
companies
products
users
ai_requests
storage
catalog_views
```

---

# 45. Tabela: subscriptions

Assinatura da empresa.

```text
subscriptions

id UUID PK

company_id UUID NOT NULL

plan_id UUID NOT NULL

status VARCHAR(30) NOT NULL

external_customer_id VARCHAR(255)

external_subscription_id VARCHAR(255)

current_period_start TIMESTAMPTZ

current_period_end TIMESTAMPTZ

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

O processamento de pagamento será implementado futuramente.

---

# 46. Tabela: company_settings

Configurações gerais.

```text
company_settings

id UUID PK

company_id UUID NOT NULL

timezone VARCHAR(100) DEFAULT 'America/Sao_Paulo'

currency VARCHAR(10) DEFAULT 'BRL'

locale VARCHAR(20) DEFAULT 'pt-BR'

date_format VARCHAR(30)

created_at TIMESTAMPTZ

updated_at TIMESTAMPTZ
```

---

# 47. Relacionamentos Principais

```text
profiles
    │
    └── company_users
             │
             └── companies
                    │
                    ├── categories
                    ├── brands
                    ├── manufacturers
                    ├── suppliers
                    ├── products
                    │      │
                    │      ├── product_images
                    │      ├── inventory_items
                    │      ├── lots
                    │      ├── inventory_movements
                    │      └── price_history
                    │
                    ├── catalog_settings
                    ├── catalog_products
                    ├── catalog_categories
                    ├── catalog_requests
                    ├── ai_jobs
                    ├── ai_usage
                    └── audit_logs
```

---

# 48. Índices

Criar índices para colunas utilizadas frequentemente em:

- filtros;
- joins;
- busca;
- RLS;
- ordenação.

Índices mínimos:

```text
companies.slug

company_users.company_id

company_users.user_id

products.company_id

products.category_id

products.brand_id

products.sku

products.barcode

categories.company_id

brands.company_id

manufacturers.company_id

suppliers.company_id

inventory_items.company_id

inventory_items.product_id

lots.company_id

lots.product_id

lots.expiration_date

inventory_movements.company_id

inventory_movements.product_id

audit_logs.company_id

audit_logs.created_at

ai_jobs.company_id

ai_jobs.created_at
```

---

# 49. Índices Multi Tenant

Consultas frequentemente filtradas por empresa deverão priorizar índices compostos quando apropriado.

Exemplo:

```text
(company_id, created_at)

(company_id, name)

(company_id, active)
```

---

# 50. Busca de Produtos

A busca deverá suportar inicialmente:

- nome;
- SKU;
- código de barras;
- marca.

Futuro:

- busca full-text;
- trigram;
- busca semântica;
- embeddings.

---

# 51. Integridade Referencial

Foreign Keys deverão utilizar comportamento apropriado.

Não utilizar:

```text
ON DELETE CASCADE
```

indiscriminadamente.

Especialmente em:

- produtos;
- estoque;
- movimentações;
- auditoria.

Histórico operacional não deverá desaparecer porque uma entidade foi desativada.

---

# 52. Soft Delete

Entidades que possuem histórico deverão preferencialmente utilizar:

```text
deleted_at
```

ou:

```text
active
```

Produtos com movimentações não deverão ser fisicamente excluídos.

---

# 53. RLS

Todas as tabelas multi tenant deverão possuir Row Level Security habilitado.

Exemplo conceitual:

```sql
auth.uid()
```

deverá ser relacionado com:

```text
company_users.user_id
```

e posteriormente validado contra:

```text
resource.company_id
```

---

# 54. Regra Geral de RLS

Um usuário poderá acessar um recurso quando:

```text
authenticated user
        +
membership in company
        +
resource belongs to company
        +
role permits operation
```

---

# 55. Dados Públicos

O catálogo público possui uma exceção controlada.

Usuários não autenticados poderão acessar somente dados explicitamente publicados.

Exemplo:

```text
catalog_products.visible = true
```

e:

```text
products.catalog_visible = true
```

Dados administrativos nunca deverão ser expostos.

---

# 56. Segurança do Catálogo

Nunca expor publicamente:

- custo;
- margem;
- fornecedor;
- dados internos;
- estoque detalhado;
- usuários;
- audit logs;
- configurações privadas;
- informações de IA.

O catálogo deverá utilizar queries/views controladas.

---

# 57. Dados Sensíveis

Nunca armazenar secrets ou credenciais de terceiros diretamente nas tabelas de negócio.

Credenciais de integração deverão utilizar mecanismos seguros de secrets.

---

# 58. Triggers

Criar triggers para:

- atualizar `updated_at`;
- operações necessárias de auditoria;
- integridade específica do estoque quando aplicável.

Triggers não deverão conter regras de negócio excessivamente complexas sem necessidade.

---

# 59. Funções PostgreSQL

Funções poderão ser utilizadas para:

- consultas seguras;
- operações transacionais;
- atualização de estoque;
- validações;
- operações que exigem atomicidade.

---

# 60. Operações de Estoque

Alterações de estoque deverão ser atômicas.

Exemplo:

```text
Criar movimentação
+
Atualizar estoque
```

deverá ocorrer dentro da mesma operação transacional.

Não permitir que:

```text
inventory_movement = criado
inventory_item = não atualizado
```

ou o inverso.

---

# 61. Concorrência

Operações de estoque deverão considerar concorrência.

Exemplo:

Dois usuários tentando alterar o estoque simultaneamente.

A implementação deverá evitar:

```text
lost update
```

e inconsistência de quantidade.

---

# 62. Dinheiro

Valores monetários deverão utilizar:

```text
NUMERIC(12,2)
```

Nunca utilizar:

```text
FLOAT
```

para valores financeiros.

---

# 63. Quantidades

Quantidades deverão utilizar:

```text
NUMERIC(12,3)
```

para suportar produtos vendidos por:

- unidade;
- peso;
- volume.

---

# 64. CNPJ

O CNPJ deverá ser armazenado de maneira consistente.

Preferência:

```text
somente dígitos
```

A máscara deverá ser aplicada somente na interface.

---

# 65. Telefone

Telefones deverão ser armazenados de forma normalizada quando possível.

A formatação deverá ser responsabilidade da interface.

---

# 66. Slugs

Slugs públicos deverão:

- ser únicos;
- conter somente caracteres seguros;
- não possuir espaços;
- ser estáveis.

Exemplo:

```text
mercado-central
```

---

# 67. Storage

Estrutura conceitual:

```text
storage/

companies/
    {company_id}/

products/
    {company_id}/

ai/
    {company_id}/
```

Arquivos de uma empresa nunca deverão ser acessíveis por outra empresa.

---

# 68. Migrações

Alterações de schema deverão ser feitas através de migrações.

Nunca alterar o banco manualmente em produção sem registrar a alteração.

Toda mudança deverá ser:

```text
reprodutível
versionada
auditável
```

---

# 69. Dados de Desenvolvimento

O MVP não deverá depender de dados mock para funcionar.

Dados de demonstração poderão existir separadamente, mas não deverão ser tratados como parte da lógica do sistema.

---

# 70. Seed

Seeds poderão ser utilizados para dados estruturais.

Exemplos:

```text
planos
configurações padrão
categorias iniciais
```

Dados específicos de clientes não deverão ser inseridos automaticamente.

---

# 71. Exclusão de Empresa

A exclusão de uma empresa deverá ser tratada como operação crítica.

Não realizar exclusão física imediatamente.

Fluxo recomendado:

```text
Solicitação

↓

Confirmação

↓

Desativação

↓

Período de retenção

↓

Exclusão definitiva
```

A política definitiva será definida posteriormente.

---

# 72. Backup e Recuperação

O banco deverá utilizar os mecanismos de backup fornecidos pela infraestrutura.

A aplicação deverá evitar operações destrutivas irreversíveis.

---

# 73. Escalabilidade

O modelo deverá suportar:

```text
1 empresa
10 empresas
1.000 empresas
10.000 empresas
100.000 empresas
```

sem alterar o conceito fundamental de multi tenancy.

---

# 74. Futuras Extensões

O modelo deverá permitir futuramente:

```text
Stores / Branches

Purchases

Purchase Orders

Sales

POS

Customers

Promotions

Financial

Invoices

Fiscal

Payments

Notifications

Integrations

API Keys

Webhooks
```

Esses módulos não fazem parte do MVP.

---

# 75. Branches / Filiais

Embora não sejam obrigatórias no MVP, a arquitetura deverá permitir posteriormente:

```text
Company
   │
   ├── Store A
   ├── Store B
   └── Store C
```

Quando esse módulo for implementado, o estoque poderá evoluir de:

```text
Company → Inventory
```

para:

```text
Company → Store → Inventory
```

Não implementar essa complexidade no MVP sem necessidade.

---

# 76. Regra de Ouro

Nenhuma tabela nova de negócio deverá ser criada sem responder:

1. A qual empresa pertence?
2. Quem pode acessar?
3. Qual é o ciclo de vida?
4. Possui histórico?
5. Precisa de RLS?
6. Pode ser excluída?
7. Possui dados sensíveis?
8. Precisa de auditoria?

---

# 77. Definition of Done — Database

O banco será considerado pronto quando:

- Todas as tabelas do MVP estiverem implementadas.
- Foreign Keys estiverem configuradas.
- Constraints estiverem configuradas.
- Índices essenciais estiverem configurados.
- RLS estiver ativo.
- Políticas RLS estiverem testadas.
- Multi tenancy estiver validado.
- Operações de estoque forem transacionais.
- Dados públicos estiverem isolados.
- Auditoria estiver funcionando.
- Migrações forem reproduzíveis.
- Não existirem secrets no banco ou frontend.
- Não houver dependência de mock data.

---

# 78. Documentos Relacionados

```text
00-VISION.md

01-FOUNDATION.md

03-AUTH.md

04-PERMISSIONS.md

05-API.md

08-SECURITY.md

14-PRODUCT.md

19-INVENTORY.md

20-LOTS.md

21-CATALOG.md

25-AI.md

28-BILLING.md
```

---

# 79. Próximo Documento

O próximo documento recomendado é:

```text
03-AUTH.md
```

Ele deverá especificar:

- cadastro;
- login;
- Google OAuth;
- email/senha;
- recuperação de senha;
- verificação de email;
- sessão;
- logout;
- convite de usuários;
- primeiro acesso;
- troca de empresa;
- proteção de rotas;
- gerenciamento de sessão;
- segurança da autenticação.