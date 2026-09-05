# MarketFlow — Foundation

> Fundação técnica, arquitetural e estrutural da plataforma.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento  
**Documento:** 01-FOUNDATION.md  
**Documento pai:** 00-VISION.md

---

# 1. Objetivo

Este documento define os princípios fundamentais de arquitetura, organização, segurança, escalabilidade e desenvolvimento do MarketFlow.

Todas as funcionalidades futuras deverão respeitar as regras estabelecidas neste documento.

Este documento deve ser considerado uma referência arquitetural central do projeto.

---

# 2. Princípios Arquiteturais

O MarketFlow deverá seguir os seguintes princípios:

- Multiempresa desde a primeira versão.
- Multiusuário desde a primeira versão.
- Isolamento de dados entre empresas.
- Segurança por padrão.
- Mobile-first.
- Componentização.
- Código reutilizável.
- Banco de dados relacional.
- APIs e serviços desacoplados quando necessário.
- IA integrada como serviço auxiliar.
- Preparação para expansão comercial.
- Observabilidade desde o início.
- Não depender de dados mock para funcionalidades reais.

---

# 3. Stack Oficial do MVP

## Frontend

- React
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Radix UI
- React Hook Form
- Zod
- TanStack Query
- TanStack Router

A implementação deverá priorizar componentes reutilizáveis e tipagem forte.

---

# 4. Backend

O MVP utilizará o backend gerenciado pelo Lovable Cloud.

Serviços principais:

- Supabase Auth
- PostgreSQL
- Supabase Storage
- Edge Functions
- Row Level Security
- APIs REST/RPC quando necessário

Não criar uma API backend independente no MVP sem necessidade arquitetural clara.

Uma futura API própria poderá ser adicionada sem alterar o domínio principal da aplicação.

---

# 5. Banco de Dados

O banco principal será PostgreSQL.

A arquitetura deverá utilizar:

- Foreign Keys
- Primary Keys
- Unique Constraints
- Check Constraints
- Indexes
- Timestamps
- Soft Delete quando aplicável
- Row Level Security

Todas as entidades de negócio deverão possuir relacionamento explícito com a empresa responsável pelos dados.

---

# 6. Multiempresa

Multiempresa é um requisito fundamental.

Uma conta de usuário poderá possuir ou participar de múltiplas empresas.

Exemplo:

```text
Usuário Will

├── Mercado Central
├── Mercearia São João
└── Loja Express
```

O usuário poderá trocar de empresa através de um seletor de contexto.

---

# 7. Tenant

Cada empresa representa um Tenant.

```text
Tenant = Company
```

Toda informação operacional deverá estar associada ao Tenant.

Exemplo:

```text
Company
   │
   ├── Users
   ├── Products
   ├── Categories
   ├── Brands
   ├── Manufacturers
   ├── Suppliers
   ├── Inventory
   ├── Lots
   ├── Catalog
   └── Settings
```

---

# 8. Isolamento de Dados

O isolamento entre empresas é obrigatório.

Um usuário pertencente à Empresa A não poderá:

- visualizar produtos da Empresa B;
- alterar estoque da Empresa B;
- consultar fornecedores da Empresa B;
- acessar usuários da Empresa B;
- visualizar dados administrativos da Empresa B.

O isolamento deverá ser aplicado no banco utilizando Row Level Security.

Nunca confiar exclusivamente no frontend para impedir acesso entre empresas.

---

# 9. Contexto da Empresa

Toda operação autenticada deverá possuir contexto de empresa.

Exemplo:

```text
current_company_id
```

O frontend poderá manter a empresa atualmente selecionada.

Porém, a autorização real deverá ser validada no backend/banco.

Nunca utilizar apenas um ID enviado pelo frontend como mecanismo de autorização.

---

# 10. Usuários

O usuário é uma identidade global da plataforma.

Um usuário poderá participar de uma ou várias empresas.

Modelo conceitual:

```text
User
   │
   ├── Company A
   │      └── Admin
   │
   ├── Company B
   │      └── Estoque
   │
   └── Company C
          └── Visitante
```

O papel é atribuído por empresa.

---

# 11. Roles

Os papéis iniciais são:

```text
GLOBAL_ADMIN
ADMIN
STOCK
VISITOR
```

## GLOBAL_ADMIN

Administrador da plataforma.

Pode administrar todas as empresas.

---

## ADMIN

Administrador da empresa.

Pode administrar:

- Produtos
- Categorias
- Marcas
- Fabricantes
- Fornecedores
- Estoque
- Usuários
- Catálogo
- Configurações

---

## STOCK

Responsável pelo estoque.

Pode:

- cadastrar produtos;
- editar produtos;
- alterar quantidades;
- registrar lotes;
- registrar validade;
- consultar fornecedores.

Não pode:

- administrar usuários;
- alterar permissões;
- alterar assinatura;
- excluir a empresa.

---

## VISITOR

Acesso somente leitura.

Pode:

- visualizar produtos;
- visualizar preços;
- visualizar catálogo;
- consultar informações permitidas pela empresa.

---

# 12. Público

O catálogo público não exige autenticação.

O usuário público poderá:

- visualizar a vitrine;
- pesquisar produtos;
- navegar por categorias;
- visualizar preços;
- visualizar imagens;
- entrar em contato com a loja.

O visitante público não terá acesso ao ambiente administrativo.

---

# 13. Autenticação

O sistema deverá suportar:

### Email e senha

- Cadastro
- Login
- Logout
- Recuperação de senha
- Alteração de senha
- Verificação de email

### Google

Login utilizando Google OAuth.

---

# 14. Cadastro Inicial

O fluxo inicial deverá ser:

```text
Landing Page

↓

Criar conta

↓

Email/Senha ou Google

↓

Criar primeira empresa

↓

Configurar empresa

↓

Dashboard
```

O sistema deverá minimizar a quantidade de etapas necessárias para começar.

---

# 15. Empresas Gratuitas

No plano gratuito, um usuário poderá criar até:

```text
3 empresas
```

Esse limite deverá ser aplicado no backend.

Não confiar apenas em validações do frontend.

---

# 16. Estrutura Conceitual

Arquitetura:

```text
Platform
│
├── Users
│
├── Companies
│
├── Subscriptions
│
└── AI Usage
       │
       └── Company
              │
              ├── Users
              ├── Products
              ├── Categories
              ├── Brands
              ├── Manufacturers
              ├── Suppliers
              ├── Inventory
              ├── Lots
              ├── Catalog
              ├── Orders/Requests
              └── Settings
```

---

# 17. Produto

Produto é uma entidade pertencente a uma empresa.

Um produto deverá poder existir sem estoque.

Exemplo:

```text
Produto
Coca-Cola 2L

Estoque
0 unidades
```

O produto continua cadastrado, porém indisponível em estoque.

---

# 18. Estoque

O estoque não deverá ser tratado simplesmente como um campo `quantity` dentro do produto.

O sistema deverá estar preparado para:

- múltiplos lotes;
- diferentes validades;
- entradas;
- saídas;
- ajustes;
- inventários;
- histórico de movimentações.

Modelo conceitual:

```text
Product

↓

Inventory

↓

Lot

↓

Inventory Movements
```

---

# 19. Catálogo

O catálogo é uma camada de publicação dos produtos.

Um produto cadastrado não precisa necessariamente ser publicado.

Exemplo:

```text
Produto
   │
   ├── Ativo
   ├── Em estoque
   └── Publicado no catálogo
```

Esses estados deverão ser independentes.

---

# 20. Visibilidade do Produto

Cada produto poderá possuir configurações como:

```text
active
catalog_visible
show_price
allow_contact
```

A loja poderá definir quais informações serão públicas.

---

# 21. Identidade Pública da Empresa

Cada empresa deverá possuir um identificador público.

Exemplo:

```text
slug = mercado-central
```

A URL poderá ser:

```text
/loja/mercado-central
```

A arquitetura deverá permitir posteriormente:

```text
mercado-central.marketflow.app
```

---

# 22. Imagens

Imagens deverão ser armazenadas utilizando Storage.

Entidades que poderão possuir imagens:

- Empresa
- Produto
- Marca
- Catálogo
- Evidências de IA

O banco deverá armazenar apenas os metadados e referências necessárias.

---

# 23. Inteligência Artificial

A IA deverá ser tratada como um serviço independente.

Possíveis funcionalidades:

```text
Product Recognition

Shelf Recognition

OCR

Product Suggestion

Stock Estimation
```

A IA nunca deverá alterar dados críticos automaticamente sem confirmação quando houver risco de erro.

Fluxo preferencial:

```text
Imagem

↓

IA

↓

Resultado

↓

Confiança

↓

Usuário confirma

↓

Sistema salva
```

---

# 24. Confiança da IA

Resultados da IA deverão possuir nível de confiança quando aplicável.

Exemplo:

```text
Produto:
Coca-Cola 2L

Confiança:
94%
```

Resultados com baixa confiança deverão exigir revisão humana.

---

# 25. Auditoria

Operações relevantes deverão poder ser auditadas.

Exemplos:

- Login
- Criação de empresa
- Criação de produto
- Alteração de preço
- Alteração de estoque
- Exclusão
- Alteração de permissões
- Alteração de configurações
- Operações de IA

O módulo de auditoria será detalhado posteriormente.

---

# 26. Soft Delete

Entidades críticas não deverão ser removidas fisicamente sem necessidade.

Preferir:

```text
deleted_at
```

ou:

```text
active = false
```

Exemplos:

- Produtos
- Fornecedores
- Categorias
- Marcas
- Usuários

Histórico de estoque nunca deverá ser apagado para corrigir uma movimentação.

Correções deverão gerar novas movimentações.

---

# 27. Timestamps

Entidades persistidas deverão utilizar:

```text
created_at
updated_at
```

Quando aplicável:

```text
deleted_at
```

Datas deverão ser armazenadas de maneira consistente no banco.

A apresentação para o usuário deverá respeitar o timezone configurado.

---

# 28. Identificadores

As entidades deverão utilizar IDs únicos.

Preferência:

```text
UUID
```

IDs internos não deverão ser expostos desnecessariamente em URLs públicas.

Para recursos públicos utilizar:

```text
slug
```

ou identificadores públicos específicos.

---

# 29. Validação

A validação deverá ocorrer em múltiplas camadas.

Frontend:

```text
React Hook Form
+
Zod
```

Backend/Banco:

```text
Constraints
+
RLS
+
Validation
```

O frontend nunca será considerado uma camada de segurança.

---

# 30. Responsividade

A aplicação deverá ser:

- Desktop
- Tablet
- Mobile

Prioridade:

```text
Mobile First
```

O usuário deverá conseguir executar operações importantes pelo celular.

Especialmente:

- consultar estoque;
- cadastrar produto;
- tirar foto;
- utilizar IA;
- consultar catálogo.

---

# 31. Performance

Evitar:

- carregamento de listas gigantes;
- queries sem paginação;
- imagens sem otimização;
- chamadas desnecessárias à IA;
- consultas sem índices.

Listas deverão utilizar:

- paginação;
- filtros;
- busca;
- ordenação.

---

# 32. URLs

Filtros, paginação e estado navegável deverão preferencialmente utilizar URL.

Exemplo:

```text
/products?page=2&search=coca&category=bebidas
```

Isso permite:

- compartilhar URLs;
- usar botão voltar;
- manter estado;
- facilitar navegação.

---

# 33. Estados da Interface

Toda tela deverá tratar explicitamente:

```text
Loading

Empty

Success

Error

Unauthorized

Forbidden

Not Found
```

Não apresentar telas vazias ou quebradas quando não houver dados.

---

# 34. Feedback

Operações do usuário deverão possuir feedback.

Exemplos:

```text
Produto criado com sucesso.

Produto atualizado.

Estoque atualizado.

Erro ao salvar produto.

Você não possui permissão para esta operação.
```

---

# 35. Design

A interface deverá possuir aparência de SaaS moderno.

Referências conceituais:

- Linear
- Stripe
- Vercel
- Supabase
- Notion

Características:

- limpa;
- profissional;
- moderna;
- alta legibilidade;
- poucos elementos desnecessários;
- boa hierarquia visual.

---

# 36. Temas

O sistema deverá suportar:

- Light Mode
- Dark Mode

A arquitetura deverá permitir a inclusão futura de temas personalizados.

---

# 37. Internacionalização

O idioma inicial será:

```text
PT-BR
```

A arquitetura deverá estar preparada para:

```text
EN
ES
```

Nenhum texto importante da aplicação deverá ficar estruturalmente dependente de strings espalhadas pelo código.

---

# 38. Segurança

Requisitos mínimos:

- HTTPS
- Supabase Auth
- RLS
- Controle de acesso
- Validação de entrada
- Sanitização
- Proteção contra acesso cross-tenant
- Proteção de secrets
- Nenhuma chave privada no frontend
- Controle de upload
- Limitação de uso da IA

---

# 39. Secrets

Nunca armazenar no frontend:

- API Keys privadas
- Tokens
- Secrets
- Credenciais de serviços

Integrações sensíveis deverão utilizar:

```text
Environment Variables
+
Edge Functions
```

---

# 40. Uploads

Uploads deverão possuir:

- validação de tipo;
- limite de tamanho;
- nomes seguros;
- armazenamento privado quando necessário;
- URLs temporárias quando aplicável.

Imagens enviadas para IA deverão ser tratadas como conteúdo não confiável.

---

# 41. IA e Privacidade

Imagens enviadas à IA deverão ser utilizadas somente para a finalidade solicitada.

O sistema deverá evitar enviar dados desnecessários.

O usuário deverá saber quando uma imagem será processada por IA.

---

# 42. LGPD

O sistema deverá ser projetado considerando a LGPD.

Requisitos futuros:

- Política de Privacidade
- Termos de Uso
- Consentimentos
- Exportação de dados
- Exclusão de conta
- Gestão de dados pessoais
- Auditoria

---

# 43. Observabilidade

O sistema deverá estar preparado para registrar:

- erros;
- eventos importantes;
- operações de IA;
- falhas de integração;
- métricas de utilização.

---

# 44. Feature Flags

Funcionalidades experimentais deverão poder ser ativadas/desativadas sem alterar o código principal quando possível.

Exemplo:

```text
ai_product_recognition = true

public_catalog = true

whatsapp_contact = false
```

---

# 45. Configurações por Empresa

Configurações específicas deverão pertencer à empresa.

Exemplos:

- Nome público
- Logo
- Telefone
- WhatsApp
- Endereço
- Catálogo habilitado
- Contato habilitado
- Exibição de preços
- Configurações de IA

---

# 46. Integrações Futuras

A arquitetura deverá permitir integração futura com:

- WhatsApp
- Google
- ERPs
- Sistemas fiscais
- Gateways de pagamento
- APIs de fornecedores
- Sistemas de PDV
- Sistemas de emissão fiscal
- Marketplaces

Essas integrações não fazem parte do MVP.

---

# 47. Pagamentos

O sistema deverá ser arquitetado para futuramente possuir assinatura SaaS.

Conceito:

```text
User

↓

Company

↓

Subscription

↓

Plan

↓

Usage / Limits
```

O processamento financeiro não deverá ser implementado diretamente no MVP.

Quando implementado, utilizar um gateway especializado.

---

# 48. Limites

O sistema deverá possuir infraestrutura para controlar limites por plano.

Exemplos:

```text
max_companies

max_products

max_users

max_ai_requests

max_storage

max_catalog_views
```

Esses valores não deverão ficar hardcoded na interface.

---

# 49. Preparação para Escala

Mesmo sendo um MVP, evitar decisões que dificultem crescimento futuro.

A arquitetura deverá permitir:

```text
100 empresas

↓

1.000 empresas

↓

10.000 empresas

↓

100.000 empresas
```

sem exigir uma reescrita completa da aplicação.

---

# 50. Regra Fundamental

Nenhuma funcionalidade deverá quebrar o isolamento entre empresas.

A regra mais importante da plataforma é:

```text
USER
  ↓
COMPANY
  ↓
RESOURCE
```

O usuário somente poderá acessar um recurso quando:

```text
User pertence à Company
AND
Resource pertence à Company
AND
User possui Role adequada
```

---

# 51. Definition of Done

Uma funcionalidade será considerada concluída somente quando possuir:

- Interface funcional
- Validação
- Persistência
- Permissões
- RLS quando aplicável
- Estados de loading
- Estado vazio
- Tratamento de erro
- Responsividade
- Feedback ao usuário
- Teste dos principais fluxos
- Compatibilidade com Multiempresa

---

# 52. Regra para IAs de Desenvolvimento

Qualquer IA utilizada para implementar o MarketFlow deverá:

1. Ler este documento antes de implementar funcionalidades.
2. Respeitar a arquitetura existente.
3. Não criar estruturas paralelas sem necessidade.
4. Não utilizar dados mock quando a funcionalidade depender do banco real.
5. Não ignorar RLS.
6. Não implementar autorização somente no frontend.
7. Não remover funcionalidades existentes sem justificativa.
8. Não alterar o modelo de dados de forma destrutiva sem migração.
9. Reutilizar componentes existentes.
10. Informar conflitos arquiteturais antes de tomar decisões irreversíveis.

---

# 53. Fonte de Verdade

A documentação `/docs` será considerada a fonte de verdade do produto.

Quando houver conflito entre:

- prompt;
- implementação;
- comportamento atual;
- documentação;

a inconsistência deverá ser identificada e corrigida.

Nenhuma IA deverá simplesmente assumir que o código existente está correto.

---

# 54. Evolução da Arquitetura

A arquitetura poderá evoluir.

Porém, mudanças estruturais deverão considerar:

- compatibilidade;
- migração de dados;
- segurança;
- impacto nos tenants;
- impacto nas permissões;
- impacto no catálogo;
- impacto na IA;
- impacto nos planos comerciais.

---

# 55. Documentos Relacionados

Este documento deverá ser utilizado em conjunto com:

```text
00-VISION.md
02-DATABASE.md
03-AUTH.md
04-PERMISSIONS.md
05-API.md
08-SECURITY.md
09-DESIGN_SYSTEM.md
10-UX.md
```

---

# 56. Estado Atual

```text
Arquitetura:
MVP

Backend:
Lovable Cloud / Supabase

Database:
PostgreSQL

Authentication:
Supabase Auth

Storage:
Supabase Storage

Frontend:
React + TypeScript

AI:
Provider abstrato, implementação definida posteriormente

Multi Tenant:
Obrigatório

Multi User:
Obrigatório

Public Catalog:
Planejado no MVP

Billing:
Preparado, não implementado
```

---

# 57. Próximo Documento

O próximo documento recomendado é:

```text
02-DATABASE.md
```

Ele deverá transformar esta arquitetura conceitual em uma especificação concreta do banco de dados, incluindo:

- tabelas;
- colunas;
- tipos;
- relacionamentos;
- índices;
- constraints;
- enums;
- RLS;
- triggers;
- funções;
- auditoria;
- estratégia de migração.