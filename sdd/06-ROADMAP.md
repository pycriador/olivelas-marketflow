# 06 — ROADMAP

## MarketFlow

> Roadmap oficial de evolução do MarketFlow, organizado por fases e sprints, priorizando fundação técnica, segurança, valor para o usuário e evolução incremental.

**Projeto:** MarketFlow  
**Documento:** `06-ROADMAP.md`  
**Versão:** 1.0.0  
**Status:** Planejamento

---

# 1. Objetivo

Este documento define a estratégia de evolução do MarketFlow.

O roadmap deve orientar:

- desenvolvimento;
- priorização;
- definição de sprints;
- dependências técnicas;
- evolução do produto;
- implementação por IAs de desenvolvimento;
- decisões de MVP;
- futuras expansões.

O roadmap não deve ser interpretado como obrigação de implementar todas as funcionalidades imediatamente.

A prioridade deve sempre considerar:

```text
Valor para o usuário
+
Impacto comercial
+
Complexidade
+
Risco
+
Dependências
2. Princípios do Roadmap
2.1 Evolução incremental

O produto deve evoluir em pequenas entregas funcionais.

Evitar grandes blocos de implementação sem validação intermediária.

2.2 Segurança antes de escala

Funcionalidades envolvendo:

autenticação;
autorização;
multi-tenancy;
RLS;
dados privados;
estoque;
IA;

devem ser corretamente estruturadas antes da expansão do produto.

2.3 Não transformar o MVP em ERP

O MarketFlow deve permanecer simples.

Não antecipar funcionalidades de:

ERP;
PDV;
financeiro;
contabilidade;
fiscal;
CRM;
e-commerce completo.
3. Priorização

Utilizar quatro níveis:

P0 = Crítico / obrigatório
P1 = Alta prioridade
P2 = Importante
P3 = Futuro
4. P0 — Crítico

Funcionalidades necessárias para a fundação e funcionamento do MVP.

Foundation
Authentication
Multi-Tenancy
RLS
IAM
RBAC
Products
Inventory
Lots
Expiration
Public Catalog
AI Product Recognition
Security
5. P1 — Alta Prioridade

Funcionalidades importantes para o produto inicial.

Dashboard
Notifications
Audit
Reports básicos
Importação
Melhorias de catálogo
Melhorias de IA
6. P2 — Importante

Funcionalidades para evolução após validação do MVP.

Monetization
Subscriptions
Advanced Reports
Advanced AI
Integrations
Public API
Webhooks
7. P3 — Futuro

Funcionalidades avançadas.

Branches
Advanced RBAC
ABAC
SSO
OIDC
SAML
Enterprise
AI Copilot
AI Actions
Advanced Integrations
8. Fase 0 — Foundation
Objetivo

Criar a fundação técnica do sistema.

Entregas
Projeto
Frontend
Routing
Design System
Supabase
PostgreSQL
Auth foundation
RLS foundation
Environment configuration
Error handling
Query layer
Resultado esperado

Aplicação executando com arquitetura preparada para multi-tenancy.

9. Fase 1 — Landing Page
Objetivo

Criar a presença pública inicial do produto.

Entregas
Landing Page
Hero
Benefits
Features
AI section
Catalog section
How it works
Pricing placeholder
FAQ
CTA
Footer
Critérios
responsiva;
mobile-first;
SEO básico;
acessibilidade;
CTA para cadastro/login.
10. Fase 2 — Authentication
Objetivo

Permitir autenticação segura.

Entregas
Cadastro
Login
Logout
Email verification
Password recovery
Google OAuth
Session management
Protected routes
Resultado

Usuário autenticado consegue acessar o sistema.

11. Fase 3 — Company Onboarding
Objetivo

Permitir criação da primeira empresa.

Entregas
Company
Company settings
Slug
CNPJ
Phone
WhatsApp
Logo
Onboarding
Fluxo
Cadastro
 ↓
Login
 ↓
Criar empresa
 ↓
Configurar empresa
 ↓
Dashboard
12. Fase 4 — Multi-Company
Objetivo

Permitir que um usuário trabalhe com várias empresas.

Entregas
Company Switcher
Company Membership
Company Context
Company Access Validation
Plan Limit
Regra inicial

Plano Free:

Máximo de 3 empresas

O limite deve ser validado no backend.

13. Fase 5 — IAM
Objetivo

Criar gerenciamento de usuários e permissões.

Entregas
Users
Memberships
Roles
Invitations
User activation/deactivation
Role changes
User removal

Roles:

GLOBAL_ADMIN
ADMIN
STOCK
VISITOR
14. Fase 6 — Categories
Objetivo

Criar estrutura para organização dos produtos.

Entregas
Category CRUD
Hierarchical categories
Search
Filters
Pagination
Activation/deactivation
15. Fase 7 — Brands
Objetivo

Permitir gerenciamento de marcas.

Entregas
Brand CRUD
Manufacturer relationship
Logo
Description
Search
Filters
Pagination
16. Fase 8 — Manufacturers
Objetivo

Permitir gerenciamento de fabricantes.

Entregas
Manufacturer CRUD
Contact information
Document
Website
Search
Filters
Pagination
17. Fase 9 — Suppliers
Objetivo

Permitir gerenciamento de fornecedores.

Entregas
Supplier CRUD
Contact
CNPJ
Address
WhatsApp
Email
Notes
Search
Filters
Pagination
18. Fase 10 — Products
Objetivo

Criar o cadastro principal de produtos.

Entregas
Product CRUD
SKU
Barcode
Category
Brand
Manufacturer
Supplier
Unit
Weight
Volume
Cost price
Sale price
Promotional price
Minimum stock
Maximum stock
Active/inactive
Catalog visibility
19. Fase 11 — Product Images
Objetivo

Permitir imagens dos produtos.

Entregas
Upload
Primary image
Multiple images
Delete
Replace
Preview
Storage
Segurança

As imagens deverão respeitar o isolamento da empresa.

20. Fase 12 — Inventory
Objetivo

Criar controle básico de estoque.

Entregas
Current stock
Entries
Exits
Adjustments
Losses
Inventory operations
Movement history
Regra

Toda alteração de estoque deve gerar uma movimentação.

21. Fase 13 — Lots & Expiration
Objetivo

Controlar lotes e validade.

Entregas
Lot registration
Lot number
Manufacturing date
Expiration date
Initial quantity
Current quantity
Supplier
Cost
Expiration status

Status:

Valid
Expiring
Expired
22. Fase 14 — Inventory Dashboard
Objetivo

Dar visibilidade operacional ao estoque.

Indicadores
Total products
Available stock
Low stock
Out of stock
Expiring products
Expired products
Recent movements
23. Fase 15 — Public Catalog
Objetivo

Criar uma vitrine pública para cada empresa.

Entregas
Public URL
Company branding
Categories
Products
Search
Filters
Product detail
Prices
Featured products
24. Fase 16 — Catalog Requests
Objetivo

Permitir que clientes entrem em contato com a empresa.

Entregas
Contact form
Customer name
Phone
Email
Message
Requested products
Quantity
Status

Status:

New
In Progress
Completed
Cancelled
25. Fase 17 — AI Product Recognition
Objetivo

Reduzir o trabalho manual de cadastro de produtos.

Fluxo
Upload Photo
 ↓
AI Processing
 ↓
Product Recognition
 ↓
Extracted Data
 ↓
Confidence
 ↓
User Review
 ↓
Confirmation
 ↓
Product Creation
26. Fase 18 — AI Shelf Recognition
Objetivo

Auxiliar na análise visual de prateleiras.

Fluxo
Shelf Photo
 ↓
Vision AI
 ↓
Product Detection
 ↓
Estimated Quantity
 ↓
Warnings
 ↓
Human Review
Regra importante

A análise de prateleira não deve ser considerada inventário oficial no MVP.

O resultado deve ser tratado como:

Estimativa
27. Fase 19 — General Dashboard
Objetivo

Criar visão consolidada da empresa.

Indicadores
Products
Inventory
Low stock
Expiration
Catalog
Requests
AI usage

O dashboard deve respeitar as permissões do usuário.

28. Fase 20 — Notifications
Objetivo

Alertar usuários sobre eventos relevantes.

Eventos
Low stock
Out of stock
Expiration
Expired products
Catalog request
AI completed
29. Fase 21 — Audit
Objetivo

Garantir rastreabilidade das operações críticas.

Entregas
Audit logs
User
Company
Action
Resource
Before
After
Timestamp
Metadata
30. Fase 22 — Reports
Objetivo

Adicionar relatórios operacionais básicos.

Relatórios iniciais
Inventory
Inventory movements
Expiration
Products
Catalog

Exportações futuras:

CSV
XLSX
PDF
31. Fase 23 — Monetization Foundation
Objetivo

Preparar o produto para planos pagos.

Entregas
Plans
Plan limits
Usage
Subscription model
Feature gating

Não implementar pagamentos obrigatoriamente nesta fase.

32. Fase 24 — Payments
Objetivo

Adicionar cobrança recorrente.

Possibilidades:

PIX
Credit Card
Boleto
Subscription
Invoice
Billing Portal

O gateway deverá ser abstraído.

33. Fase 25 — Branches
Objetivo

Permitir múltiplas unidades por empresa.

Arquitetura:

Company
 ↓
Store
 ↓
Inventory

Não implementar antes de validar a necessidade real.

34. Fase 26 — Public API
Objetivo

Permitir integrações externas.

Possíveis consumidores:

E-commerce
ERP
Mobile App
Marketplace
Automation
AI Agents
35. Fase 27 — Integrations

Possíveis integrações:

WhatsApp
E-commerce
ERP
Marketplaces
Webhooks
External AI providers

Cada integração deverá ser implementada de forma desacoplada.

36. Fase 28 — AI Copilot
Objetivo

Permitir consultas inteligentes sobre a operação.

Exemplos:

Quais produtos estão com estoque baixo?

Quais produtos vencem nos próximos dias?

Quais produtos estão sem preço?

Quais produtos ainda não foram publicados?

Quais categorias possuem poucos produtos?

A IA deverá respeitar:

Authentication
Authorization
RLS
Tenant isolation
Plan limits
37. Fase 29 — AI Actions
Objetivo

Permitir que a IA execute operações controladas.

Fluxo obrigatório:

User
 ↓
AI
 ↓
Tool
 ↓
Permission Check
 ↓
Validation
 ↓
Human Confirmation
 ↓
Mutation
 ↓
Audit

Nenhuma ação crítica deve ser executada silenciosamente.

38. Fase 30 — Enterprise

Possíveis funcionalidades:

MFA
SSO
OIDC
SAML
SCIM
Advanced RBAC
ABAC
Advanced Audit
API Keys
Webhooks
Custom Domains
SLA
Advanced Observability
39. MVP Oficial

O MVP deverá conter:

[x] Landing Page
[x] Authentication
[x] Email + Password
[x] Google OAuth
[x] Password Recovery
[x] Company
[x] Company Onboarding
[x] Multi-Company
[x] IAM
[x] RBAC
[x] Categories
[x] Brands
[x] Manufacturers
[x] Suppliers
[x] Products
[x] Product Images
[x] Basic Inventory
[x] Inventory Movements
[x] Lots
[x] Expiration
[x] Public Catalog
[x] Catalog Requests
[x] AI Product Recognition
[x] Security Foundation
[x] RLS

Os marcadores acima representam escopo do MVP, não necessariamente funcionalidades já implementadas.

40. Fora do MVP

Não implementar como requisito do MVP:

[ ] POS
[ ] PDV
[ ] NFC-e
[ ] NF-e
[ ] Fiscal
[ ] Accounting
[ ] Finance
[ ] Accounts Payable
[ ] Accounts Receivable
[ ] Full CRM
[ ] Loyalty
[ ] Marketplace
[ ] Full E-commerce
[ ] Advanced Logistics
41. Sprint 1 — Foundation
Objetivo

Estabelecer a base técnica.

Entregas
Project structure
React
TypeScript
Vite
Tailwind
shadcn/ui
Routing
Supabase
PostgreSQL
Environment
Base layout
Theme
Error handling
Critérios de aceite
aplicação inicia corretamente;
rotas principais configuradas;
Supabase conectado;
estrutura preparada para autenticação;
design system base funcionando.
42. Sprint 2 — Identity
Entregas
Login
Register
Logout
Recovery
Google OAuth
Email verification
Session
Protected routes
Critérios
autenticação funcionando;
sessão persistente;
rotas protegidas;
tratamento de estados de autenticação.
43. Sprint 3 — IAM
Entregas
Companies
Memberships
Users
Roles
Invitations
Company switcher
Permissions
RLS
Critérios
usuário pode pertencer a múltiplas empresas;
role é específica por empresa;
cross-tenant bloqueado;
último Admin protegido.
44. Sprint 4 — Catalog Data
Entregas
Categories
Brands
Manufacturers
Suppliers
Critérios

Todas as entidades devem possuir:

CRUD
Search
Filters
Pagination
Validation
RLS
Authorization
45. Sprint 5 — Products
Entregas
Product CRUD
SKU
Barcode
Prices
Category
Brand
Manufacturer
Supplier
Images
Critérios
cadastro completo;
validações;
imagens;
histórico de preço;
RLS;
autorização.
46. Sprint 6 — Inventory
Entregas
Stock
Entries
Exits
Adjustments
Losses
Movements
Lots
Expiration
Critérios
operações transacionais;
histórico imutável;
estoque consistente;
controle de validade.
47. Sprint 7 — Public Catalog
Entregas
Public URL
Storefront
Products
Categories
Search
Filters
Prices
Contact
Critérios
acesso sem login;
somente dados publicados;
nenhuma informação privada exposta;
catálogo isolado por empresa.
48. Sprint 8 — AI
Entregas
Image upload
AI recognition
Confidence
Review
Confirmation
AI jobs
AI usage
Critérios
IA não grava automaticamente dados críticos;
usuário confirma resultado;
consumo é registrado;
limites são respeitados;
erros são tratados.
49. Sprint 9 — Dashboard
Entregas
KPIs
Stock alerts
Expiration alerts
Catalog metrics
AI usage
Recent activity
50. Sprint 10 — Hardening
Entregas
Security review
RLS review
Authorization review
Cross-tenant tests
Performance review
Accessibility
Audit
Error handling
Observability

Essa sprint deve ser considerada obrigatória antes de uma disponibilização pública relevante.

51. Sprint 11 — Monetization Foundation
Entregas
Plans
Plan limits
Usage
Feature flags
Subscription foundation
52. Sprint 12 — Reports
Entregas
Inventory reports
Expiration reports
Movement reports
Product reports
Export
53. Sprint 13 — Advanced AI
Entregas
Shelf recognition
AI Copilot foundation
AI recommendations
Classification
54. Sprint 14 — Enterprise
Entregas
MFA
SSO
OIDC
SAML
Advanced RBAC
ABAC
API Keys
Webhooks
Advanced Audit
55. Critérios de Entrada de uma Sprint

Uma sprint somente deve começar quando:

Dependências conhecidas
Schema necessário definido
Permissões definidas
UX minimamente especificada
Critérios de aceite definidos
56. Critérios de Saída de uma Sprint

Uma funcionalidade não deve ser considerada concluída apenas porque a interface funciona.

Deve possuir, quando aplicável:

Frontend
Backend
Database
Validation
Authorization
RLS
Tenant isolation
Loading state
Empty state
Error state
Success feedback
Responsive UI
Accessibility
Tests
Audit
Documentation
57. Dependências Principais

A sequência recomendada é:

Foundation
 ↓
Authentication
 ↓
Company
 ↓
Multi-Company
 ↓
IAM
 ↓
Catalog Data
 ↓
Products
 ↓
Inventory
 ↓
Lots
 ↓
Public Catalog
 ↓
AI
 ↓
Dashboard
 ↓
Hardening
 ↓
Monetization
58. Estratégia de Priorização

Ao surgir uma nova funcionalidade, avaliar:

Valor
Quanto resolve um problema real?
Impacto
Quantos usuários serão beneficiados?
Complexidade
Quanto código e infraestrutura exige?
Risco
Afeta segurança?
Dados?
Multi-tenancy?
Billing?
Dependências
Bloqueia outras funcionalidades?
59. Regra Contra Overengineering

Não implementar antecipadamente:

Enterprise features
Complex billing
Advanced AI
Branches
Custom RBAC
ABAC
Public API

sem necessidade validada.

A arquitetura deve estar preparada, mas a implementação deve acompanhar a necessidade.

60. Métricas do Produto

Após lançamento acompanhar:

Signups
Activated users
Companies created
Products created
Products published
Catalog visits
Catalog requests
Inventory operations
AI operations
AI acceptance rate
Retention
Churn
Free → Paid conversion
61. Ativação

Uma empresa poderá ser considerada ativada quando realizar:

Criar conta
+
Criar empresa
+
Cadastrar produto
+
Cadastrar estoque
+
Publicar catálogo
62. North Star Metric

Métrica candidata:

Número de empresas ativas que gerenciam produtos e utilizam regularmente estoque e/ou catálogo.

Essa métrica deverá ser validada após o lançamento.

63. Evolução Pós-MVP

Após validar o MVP, priorizar com base em:

Dados de utilização
Feedback dos clientes
Retenção
Uso das funcionalidades
Custos operacionais
Custo de IA
Conversão
Solicitações recorrentes

Não adicionar funcionalidades somente porque parecem interessantes.

64. Regra para IAs de Desenvolvimento

A IA responsável por implementar uma sprint deverá:

Ler este roadmap.
Identificar a sprint atual.
Ler os documentos técnicos relacionados.
Verificar dependências.
Não implementar funcionalidades de sprints futuras sem autorização.
Não remover funcionalidades existentes.
Não ignorar RLS.
Não criar autorização somente no frontend.
Não introduzir dados mock para substituir funcionalidades reais.
Atualizar documentação quando uma decisão arquitetural mudar.
65. Regra de Continuidade

A implementação deve respeitar a ordem lógica do roadmap.

Se uma funcionalidade futura for necessária para concluir uma funcionalidade atual:

Identificar dependência
 ↓
Implementar somente a fundação necessária
 ↓
Documentar
 ↓
Continuar a sprint atual

Não antecipar uma feature inteira apenas porque parte dela é necessária.

66. Estado do Roadmap
Foundation
[ ] Sprint 1 — Foundation
Identity & IAM
[ ] Sprint 2 — Identity
[ ] Sprint 3 — IAM
Catalog Data
[ ] Sprint 4 — Catalog Data
Products
[ ] Sprint 5 — Products
Inventory
[ ] Sprint 6 — Inventory
Public Catalog
[ ] Sprint 7 — Public Catalog
AI
[ ] Sprint 8 — AI
Dashboard
[ ] Sprint 9 — Dashboard
Hardening
[ ] Sprint 10 — Hardening
Monetization
[ ] Sprint 11 — Monetization Foundation
Reports
[ ] Sprint 12 — Reports
Advanced AI
[ ] Sprint 13 — Advanced AI
Enterprise
[ ] Sprint 14 — Enterprise