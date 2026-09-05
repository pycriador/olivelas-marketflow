# 07 — MONETIZATION

## MarketFlow

> Especificação da estratégia de monetização, planos, limites, consumo, assinatura e preparação para pagamentos do MarketFlow.

**Projeto:** MarketFlow  
**Documento:** `07-MONETIZATION.md`  
**Versão:** 1.0.0  
**Status:** Planejamento  
**Prioridade:** P2 no roadmap, com fundação arquitetural prevista desde o MVP

---

# 1. Objetivo

O MarketFlow deverá possuir uma arquitetura preparada para monetização desde a fundação, porém sem transformar cobrança e billing em dependência para o funcionamento do MVP.

A monetização deverá ser:

- simples;
- previsível;
- configurável;
- escalável;
- multi-tenant;
- segura;
- desacoplada do gateway de pagamento.

---

# 2. Princípios

## 2.1 Free First

O usuário deverá conseguir experimentar o produto antes de pagar.

O plano Free será utilizado para:

- aquisição;
- ativação;
- validação do produto;
- demonstração do catálogo;
- descoberta dos recursos de IA.

---

## 2.2 Limites Configuráveis

Nunca espalhar regras comerciais pelo código.

Evitar:

```ts
if (plan === "free") {
  ...
}

Preferir:

Plan
 ↓
Plan Limits
 ↓
Usage
 ↓
Feature Access
2.3 Backend Enforcement

Limites comerciais deverão ser aplicados no backend.

O frontend poderá informar o usuário sobre o limite, mas não poderá ser a única camada de controle.

2.4 Tenant-Based Billing

A unidade principal de cobrança será:

Company

Uma assinatura pertence à empresa.

Um usuário poderá participar de múltiplas empresas, cada uma com:

plano;
limites;
consumo;
assinatura;

independentes.

3. Modelo Comercial Inicial

O MarketFlow deverá começar com:

Free

e posteriormente evoluir para planos pagos.

Estrutura prevista:

Free
Basic
Pro
Business
Enterprise

Os nomes poderão ser alterados.

4. Plano Free

Configuração inicial:

Recurso	Limite
Empresas por usuário	3
Produtos por empresa	100
Usuários por empresa	3
Catálogo público	Sim
IA	Limitada
Estoque	Sim
Lotes	Sim
Validade	Sim
Solicitações do catálogo	Sim
Relatórios avançados	Não

Os valores devem ser configuráveis no banco.

5. Objetivo do Free

O plano gratuito deve permitir que um pequeno comerciante consiga experimentar o fluxo completo:

Criar conta
 ↓
Criar empresa
 ↓
Cadastrar produtos
 ↓
Controlar estoque
 ↓
Publicar catálogo
 ↓
Receber solicitações
 ↓
Experimentar IA

O usuário não deve precisar pagar para entender o valor principal do produto.

6. Planos Futuros
6.1 Basic

Possível público:

Pequenos comerciantes

Possíveis diferenciais:

mais produtos;
mais usuários;
maior uso de IA;
mais armazenamento;
relatórios adicionais.
6.2 Pro

Possível público:

Empresas com operação maior

Possíveis diferenciais:

limites maiores;
IA ampliada;
relatórios avançados;
automações;
integrações;
maior capacidade de catálogo.
6.3 Business

Possível público:

Empresas com maior volume operacional

Possíveis diferenciais:

maior número de usuários;
maior número de produtos;
múltiplas unidades futuramente;
API;
webhooks;
auditoria avançada;
recursos administrativos.
6.4 Enterprise

Possível público:

Empresas maiores

Possíveis recursos:

SSO;
SAML;
OIDC;
MFA;
SCIM;
ABAC;
RBAC avançado;
SLA;
suporte dedicado;
customizações;
API avançada;
auditoria avançada.
7. Banco de Dados

A arquitetura deverá possuir pelo menos:

plans
plan_limits
subscriptions

E poderá evoluir para:

usage_records
billing_events
invoices
payment_methods

quando necessário.

8. Plans

Tabela:

plans

Campos:

id
name
slug
description
monthly_price
yearly_price
active
display_order
created_at
updated_at
9. Plan Rules

O plano deverá possuir configuração independente do código.

Exemplo:

plan = free

limits:
  companies = 3
  products = 100
  users = 3
  ai_operations = 10
  storage_mb = 500

Os valores são exemplos arquiteturais.

Os limites reais deverão ser definidos posteriormente.

10. Plan Limits

Tabela:

plan_limits

Campos:

id
plan_id
resource
limit_value
created_at
updated_at

Exemplos:

companies
products
users
storage
ai_operations
catalog_requests
api_requests
11. Unlimited

Para recursos sem limite, evitar números arbitrários como:

999999999

Preferir uma representação explícita.

Exemplo:

limit_value = NULL

com semântica documentada:

NULL = unlimited

ou uma estrutura equivalente.

12. Feature Flags

Limites quantitativos não são suficientes.

Alguns recursos devem ser controlados como funcionalidades.

Exemplo:

advanced_reports
ai_shelf_recognition
api_access
webhooks
custom_roles

Estrutura conceitual:

Plan
 ↓
Feature Access
13. Feature Access

Exemplo:

Free
 ├── public_catalog = true
 ├── ai_product_recognition = true
 ├── ai_shelf_recognition = false
 ├── advanced_reports = false
 └── public_api = false
14. Subscription

Tabela:

subscriptions

Campos:

id
company_id
plan_id
status
external_customer_id
external_subscription_id
current_period_start
current_period_end
cancel_at_period_end
created_at
updated_at
15. Subscription Status

Estados possíveis:

trialing
active
past_due
paused
cancelled
expired
incomplete

A lista final deverá ser alinhada ao gateway escolhido.

16. Assinatura Atual

Uma empresa deverá possuir uma assinatura/plano efetivo.

Durante o MVP, empresas poderão utilizar:

Free

sem necessidade de gateway.

17. Effective Plan

O backend deverá determinar o plano efetivo.

Exemplo:

Company
 ↓
Subscription
 ↓
Plan
 ↓
Limits
 ↓
Feature Access

Nunca confiar em:

plan = "pro"

enviado pelo frontend.

18. Verificação de Limites

Antes de uma operação limitada:

Request
 ↓
Authentication
 ↓
Company Membership
 ↓
Authorization
 ↓
Current Plan
 ↓
Current Usage
 ↓
Limit Check
 ↓
Operation
19. Exemplo — Produtos

Plano:

Free

Limite:

100 products

Uso:

99 products

Tentativa:

create product

Resultado:

Allowed

Depois:

100 products

Nova tentativa:

create product

Resultado:

PLAN_LIMIT_REACHED
20. Error Contract

Quando um limite for atingido:

{
  "error": {
    "code": "PLAN_LIMIT_REACHED",
    "message": "O limite do seu plano foi atingido.",
    "details": {
      "resource": "products",
      "limit": 100,
      "current": 100
    }
  }
}
21. UX de Limites

O usuário deverá receber uma mensagem clara.

Exemplo:

Você atingiu o limite de 100 produtos do plano Free.

Remova produtos ou faça upgrade do plano para continuar.

Não utilizar mensagens técnicas.

22. Limite Próximo do Fim

Quando apropriado, apresentar indicador:

87 / 100 produtos

ou:

87%
23. Warning Threshold

O sistema poderá alertar quando o uso atingir:

80%
90%
100%

Os thresholds deverão ser configuráveis futuramente.

24. Upgrade

Quando uma funcionalidade estiver bloqueada pelo plano:

Feature
 ↓
Limit / Feature Check
 ↓
Blocked
 ↓
Upgrade CTA
25. Upgrade UX

A interface deverá explicar:

Qual recurso foi bloqueado
Por que foi bloqueado
Qual limite foi atingido
Qual plano libera o recurso

Evitar dark patterns.

26. Downgrade

Um downgrade não deverá apagar dados automaticamente.

Exemplo:

Pro
500 products

↓

Free
100 products

Se a empresa possuir 300 produtos:

Dados existentes permanecem.

Porém:

Novos produtos poderão ser bloqueados

até que o uso volte ao limite ou o plano seja atualizado.

27. Dados Acima do Limite

Nunca apagar automaticamente dados devido a downgrade.

O sistema deverá manter os dados e impedir novas operações incompatíveis quando necessário.

28. Cancelamento

Quando uma assinatura for cancelada:

cancel_at_period_end = true

preferencialmente significa:

continuar utilizando até o final do período

A regra exata dependerá do gateway.

29. Grace Period

O sistema poderá futuramente utilizar período de tolerância para problemas de pagamento.

Exemplo:

Payment failure
 ↓
Grace Period
 ↓
Retry
 ↓
Past Due
 ↓
Restriction

Não excluir dados.

30. Pagamentos

Pagamentos não fazem parte do MVP.

A arquitetura deverá estar preparada para integrar posteriormente um gateway.

Possíveis métodos:

PIX
Cartão
Boleto
31. Gateway Abstraction

Evitar acoplamento direto do domínio a um único provedor.

Criar uma camada conceitual:

Billing Provider

Exemplo:

MarketFlow
 ↓
Billing Service
 ↓
Provider Adapter
 ↓
Payment Gateway
32. Provider Adapter

O adapter deverá abstrair operações como:

createCustomer()
createSubscription()
cancelSubscription()
changePlan()
getSubscription()
createCheckout()
createBillingPortal()

Os nomes finais podem variar.

33. Webhooks

O billing deverá utilizar webhooks do provedor para sincronização.

Eventos possíveis:

customer.created
subscription.created
subscription.updated
subscription.cancelled
invoice.created
invoice.paid
invoice.failed
payment.succeeded
payment.failed

Os eventos exatos dependerão do gateway.

34. Webhook Security

Todo webhook deverá:

validar assinatura;
possuir idempotência;
registrar evento;
impedir replay quando aplicável;
não confiar somente no payload;
atualizar estado de forma transacional.
35. Billing Events

Futuramente criar:

billing_events

Campos possíveis:

id
company_id
provider
external_event_id
event_type
payload
processed
processed_at
created_at
36. Idempotência de Billing

Nunca processar duas vezes o mesmo evento externo.

Utilizar:

external_event_id

como identificador único quando possível.

37. Billing Portal

Futuramente permitir que o cliente:

consulte plano;
altere plano;
cancele assinatura;
atualize método de pagamento;
consulte cobranças.
38. Trial

O MarketFlow poderá futuramente oferecer:

Trial

Exemplo:

14 dias Pro

Porém trial não deve ser implementado antes da estratégia comercial estar definida.

39. Pricing Page

A página de preços deverá apresentar:

Free
Basic
Pro
Business
Enterprise

quando esses planos estiverem ativos.

40. Comparação de Planos

A comparação deverá destacar:

Empresas
Produtos
Usuários
IA
Armazenamento
Catálogo
Relatórios
Integrações
API
Suporte
41. Pricing Configuration

Preços não devem ser hardcoded no frontend.

Utilizar:

plans.monthly_price
plans.yearly_price

ou estrutura equivalente.

42. Moeda

Configuração inicial:

BRL

Futuras moedas poderão ser suportadas:

USD
ARS
CLP
MXN

caso o produto seja expandido internacionalmente.

43. Localização

O preço deverá considerar:

locale
currency
billing_period
44. Mensal vs Anual

Planos pagos poderão oferecer:

Monthly
Yearly

A cobrança anual poderá possuir desconto.

O percentual do desconto deve ser configurável.

45. Controle de IA

IA possui custo variável.

Por isso, o uso de IA deverá ser controlado separadamente.

Exemplo:

Free
10 AI operations/month

Pro
500 AI operations/month

Os valores são apenas exemplos.

46. AI Usage

Tabela:

ai_usage

deverá permitir calcular:

uso
custo estimado
provider
model
tokens
status
47. AI Limits

A limitação poderá considerar:

number of operations
tokens
estimated cost

A estratégia inicial deverá preferir uma métrica simples.

48. AI Abuse Prevention

Limites deverão proteger:

custos;
infraestrutura;
disponibilidade;
contra automações abusivas.
49. Storage Limits

Futuramente poderá existir limite de armazenamento por plano.

Exemplo:

Free
500 MB

Pro
10 GB

Não utilizar valores definitivos nesta fase.

50. Product Limits

O número de produtos será uma das principais dimensões de monetização.

Exemplo:

Free → 100
Basic → 500
Pro → 5.000
Business → 25.000
Enterprise → Custom

Esses valores são ilustrativos e não representam preços ou limites finais.

51. User Limits

Possível estrutura:

Free → 3 users
Basic → 5 users
Pro → 15 users
Business → 50 users
Enterprise → Custom

Os valores deverão ser definidos após validação comercial.

52. Company Limits

No Free:

3 companies per user

Esse limite é diferente do número de usuários por empresa.

53. Entitlements

O sistema deverá trabalhar conceitualmente com:

Entitlements

Um entitlement determina se a empresa pode utilizar determinada funcionalidade.

Exemplo:

catalog.public
ai.product_recognition
ai.shelf_recognition
advanced.reports
api.access
webhooks
54. Separação entre Limit e Entitlement

São conceitos diferentes.

Limit

Quantidade permitida:

100 products
Entitlement

Funcionalidade disponível:

AI Shelf Recognition = false
55. Feature Gating

A aplicação deverá utilizar uma camada central para verificar:

hasFeature(company, feature)

e:

checkLimit(company, resource)

Os nomes são conceituais.

56. Não Duplicar Regras

Evitar:

ProductPage
  → regra de plano

Dashboard
  → outra regra de plano

Backend
  → terceira regra

Preferir uma fonte centralizada de regras.

57. Monetização e RLS

Billing não pode quebrar isolamento multi-tenant.

Uma empresa não pode consultar:

subscription

de outra empresa.

58. Global Admin

Global Admin poderá consultar:

All Companies
All Plans
All Subscriptions
Usage
Billing Status

Essa capacidade deverá ser protegida por autorização específica.

59. Admin da Empresa

Admin poderá consultar somente:

Own Company
Own Subscription
Own Usage
Own Plan

Não poderá visualizar dados de billing de outras empresas.

60. Visitor / Stock

Esses perfis não devem possuir acesso administrativo a:

Subscription
Payment
Billing
Plan Management
61. Auditoria

Eventos relacionados a monetização deverão ser auditáveis.

Exemplos:

plan.changed
subscription.created
subscription.cancelled
subscription.upgraded
subscription.downgraded
limit.reached
billing.updated
62. Métricas de Monetização

Acompanhar:

Free users
Paid companies
MRR
ARR
ARPU
Conversion rate
Trial conversion
Churn
Expansion
Downgrade
Upgrade
LTV
CAC

Nem todas precisam estar disponíveis no MVP.

63. Product-Led Growth

O produto deverá favorecer:

Cadastro
 ↓
Ativação
 ↓
Uso recorrente
 ↓
Adoção de catálogo
 ↓
Adoção de estoque
 ↓
Uso de IA
 ↓
Limite atingido
 ↓
Upgrade

O bloqueio comercial deve ocorrer depois que o usuário perceber valor.

64. Estratégia de Upgrade

Priorizar limites que naturalmente acompanham crescimento:

Products
Users
AI
Storage
Advanced features
65. Não Monetizar Prematuramente

Não bloquear funcionalidades essenciais do MVP artificialmente apenas para criar paywall.

O objetivo inicial é:

Product Market Fit

antes de otimizar monetização.

66. Enterprise Pricing

Enterprise poderá possuir:

Custom pricing

baseado em:

número de usuários;
número de empresas;
número de unidades;
volume de produtos;
consumo de IA;
integrações;
SLA;
suporte;
segurança.
67. Segurança de Pagamentos

O MarketFlow não deverá armazenar diretamente:

Número completo do cartão
CVV
Dados sensíveis de pagamento

Esses dados deverão ser processados por um provedor especializado.

68. LGPD

A monetização deverá considerar:

minimização de dados;
finalidade;
retenção;
exclusão;
transparência;
controle de acesso;
auditoria.

Dados de billing não devem ser acessíveis por usuários sem necessidade.

69. Dados de Uso

Dados de uso poderão ser utilizados para:

limites;
métricas;
cobrança;
prevenção de abuso;
análise de produto.

A coleta deverá ser proporcional à finalidade.

70. Arquitetura Final Esperada
                    ┌──────────────────┐
                    │     Company      │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  Subscription    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │      Plan        │
                    └────────┬─────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
          ┌──────────────┐      ┌──────────────┐
          │ Plan Limits  │      │ Entitlements │
          └──────┬───────┘      └──────┬───────┘
                 │                     │
                 ▼                     ▼
          ┌──────────────┐      ┌──────────────┐
          │    Usage     │      │   Features   │
          └──────┬───────┘      └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │ Access Check │
          └──────┬───────┘
                 │
                 ▼
             Operation
71. Fluxo de uma Operação Limitada
User
 ↓
Authentication
 ↓
Company Context
 ↓
Membership
 ↓
Permission
 ↓
Plan
 ↓
Entitlement
 ↓
Usage
 ↓
Limit Check
 ↓
Business Operation
 ↓
Audit
72. MVP de Monetização

No MVP implementar somente a fundação necessária:

[x] Plan model
[x] Free plan
[x] Plan limits
[x] Basic feature flags
[x] Product limit
[x] User limit
[x] Company limit
[x] AI usage limit
[x] Backend enforcement
[x] Usage indicators

Não implementar inicialmente:

[ ] Credit card
[ ] PIX
[ ] Boleto
[ ] Checkout
[ ] Subscription payment
[ ] Billing portal
[ ] Invoices
[ ] Automated dunning
73. Pós-MVP

Prioridade recomendada:

1. Pricing Page
2. Plan Comparison
3. Usage Dashboard
4. Upgrade Flow
5. Subscription Foundation
6. Payment Gateway
7. Webhooks
8. Billing Portal
9. Invoice History
10. Advanced Billing
74. Definition of Done

A monetização estará adequadamente implementada quando:

planos estiverem modelados;
limites forem configuráveis;
features forem configuráveis;
limites forem aplicados no backend;
frontend não puder burlar limites;
multi-tenancy estiver preservado;
uso estiver sendo contabilizado;
operações bloqueadas retornarem erro consistente;
usuário receber feedback claro;
Global Admin possuir visão apropriada;
Admin somente visualizar sua própria empresa;
operações críticas forem auditadas;
testes de limites estiverem implementados.
75. Testes Obrigatórios
Teste 1 — Limite de produtos
Free
100 products

101º produto
→ DENIED
Teste 2 — Limite de usuários
Free
3 users

4º usuário
→ DENIED
Teste 3 — Limite de empresas
Free
3 companies

4ª company
→ DENIED
Teste 4 — Feature bloqueada
Free
AI Shelf Recognition = false

Request
→ DENIED
Teste 5 — Cross-Tenant
Company A
 ↓
Subscription Company B
 ↓
DENIED
Teste 6 — Frontend bypass

Mesmo que o frontend envie:

{
  "plan": "enterprise"
}

o backend deverá ignorar o valor.

Teste 7 — Downgrade
Pro
300 products

↓

Free
100 products

Resultado:

Dados preservados
Novos cadastros bloqueados
76. Decisões Comerciais Pendentes

Ainda deverão ser definidos com dados reais:

Preço Free
Preço Basic
Preço Pro
Preço Business
Preço Enterprise

Limite de produtos
Limite de usuários
Limite de empresas
Limite de IA
Limite de storage

Trial
Desconto anual
Política de downgrade
Política de cancelamento
Grace period

Esses valores não devem ser inventados durante a implementação técnica.

77. Regra para IAs de Desenvolvimento

Ao implementar monetização:

Não hardcodar preços.
Não hardcodar limites.
Não confiar no frontend.
Não permitir alteração de plano pelo cliente sem backend.
Não permitir privilege escalation.
Não expor subscription de outro tenant.
Não apagar dados após downgrade.
Não criar dependência obrigatória de gateway no MVP.
Não armazenar dados sensíveis de cartão.
Implementar idempotência em billing/webhooks.
Auditar mudanças importantes.
Atualizar documentação quando decisões comerciais forem alteradas.
78. Roadmap de Monetização
Phase 1
Free Plan
 ↓
Phase 2
Configurable Limits
 ↓
Phase 3
Usage Tracking
 ↓
Phase 4
Pricing Page
 ↓
Phase 5
Upgrade UX
 ↓
Phase 6
Payment Gateway
 ↓
Phase 7
Subscriptions
 ↓
Phase 8
Billing Portal
 ↓
Phase 9
Advanced Billing
 ↓
Phase 10
Enterprise Billing
79. Resultado Esperado

A arquitetura de monetização deve permitir que o MarketFlow comece gratuitamente e evolua para um SaaS pago sem necessidade de reescrever o núcleo da aplicação.

A estrutura principal deverá ser:

Company
 ↓
Plan
 ↓
Limits
 ↓
Entitlements
 ↓
Usage
 ↓
Subscription
 ↓
Billing Provider

O produto deve continuar funcionando corretamente mesmo quando o billing ainda não estiver implementado.