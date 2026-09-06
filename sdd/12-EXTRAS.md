# MARKETFLOW — API FIRST, TOKENS, IA E WHATSAPP

## Objetivo

Evoluir o MarketFlow para uma plataforma API First, permitindo:

- integração completa via API;
- criação e gerenciamento de API Keys/Tokens;
- controle de escopos e permissões;
- documentação OpenAPI;
- consumo da API por sistemas externos;
- integração com provedores de IA;
- análise de imagens e produtos;
- abstração entre diferentes provedores de IA;
- personalização completa das mensagens de WhatsApp;
- preparação para automações e integrações futuras.

A implementação deve analisar toda a documentação existente antes de alterar arquitetura, banco ou código.

---

# 1. API FIRST

## Princípio

A API deve ser considerada uma interface oficial do produto.

A aplicação web não deve possuir regras de negócio exclusivas que não possam futuramente ser utilizadas pela API.

Arquitetura:

```text
Frontend Web
      │
      ▼
   API Layer
      │
      ├── Auth
      ├── Authorization
      ├── Business Rules
      ├── Validation
      ├── Audit
      └── Database

Integrações externas:

Sistema externo
      │
      ▼
MarketFlow API
      │
      ▼
Business Layer
      │
      ▼
PostgreSQL
2. VERSIONAMENTO

A API deve utilizar versionamento.

Inicialmente:

/api/v1

Exemplos:

GET    /api/v1/products
POST   /api/v1/products
GET    /api/v1/products/{id}
PATCH  /api/v1/products/{id}
DELETE /api/v1/products/{id}

GET    /api/v1/categories
GET    /api/v1/inventory
GET    /api/v1/lots
GET    /api/v1/catalog

Nunca quebrar silenciosamente uma versão existente.

Mudanças incompatíveis devem gerar nova versão.

3. PADRÃO REST

Adotar REST para operações CRUD.

Exemplos:

GET     /products
POST    /products
GET     /products/{id}
PATCH   /products/{id}
DELETE  /products/{id}

Operações específicas podem utilizar endpoints próprios:

POST /inventory/{product_id}/entry
POST /inventory/{product_id}/exit
POST /inventory/{product_id}/adjust
POST /catalog/publish
POST /catalog/unpublish
4. API KEYS / TOKENS

Criar gerenciamento completo de tokens.

Tela:

/configuracoes/api

ou:

/desenvolvedores/api-keys

Permitir:

criar token;
visualizar metadados;
copiar token somente durante a criação;
revogar;
rotacionar;
expirar;
ativar/desativar;
definir nome;
definir descrição;
definir escopos;
visualizar última utilização;
visualizar data de criação;
visualizar data de expiração.
5. SEGURANÇA DOS TOKENS

Nunca armazenar o token em texto puro no banco.

Fluxo:

Usuário cria token
       ↓
Sistema gera segredo forte
       ↓
Mostra uma única vez
       ↓
Armazena somente hash
       ↓
Cliente utiliza token
       ↓
Sistema calcula hash
       ↓
Compara com registro

O token completo nunca deve aparecer novamente.

6. FORMATO DO TOKEN

Criar formato identificável.

Exemplo conceitual:

mf_live_xxxxxxxxxxxxxxxxx

Separar:

prefix
environment
secret

Exemplo:

mf_live_...
mf_test_...

Preparar ambientes de teste e produção.

7. METADADOS DE TOKEN

Tabela conceitual:

api_keys

Campos mínimos:

id
company_id
created_by
name
description
key_prefix
secret_hash
environment
status
expires_at
last_used_at
created_at
revoked_at

Adicionar campos adicionais quando necessários.

8. ESCOPOS

Cada token deve possuir escopos.

Exemplos:

products:read
products:write

categories:read
categories:write

brands:read
brands:write

manufacturers:read
manufacturers:write

suppliers:read
suppliers:write

inventory:read
inventory:write

lots:read
lots:write

catalog:read
catalog:write

requests:read
requests:write

ai:use

reports:read

Nunca conceder acesso maior que o necessário.

9. TOKEN + TENANT

Todo token deve estar associado a uma empresa.

API Key
   ↓
Company
   ↓
Permissions
   ↓
Resources

Uma API Key não pode consultar dados de outra empresa.

10. API AUTHORIZATION

A cada request:

Token
 ↓
Token válido?
 ↓
Ativo?
 ↓
Expirado?
 ↓
Company válida?
 ↓
Permission?
 ↓
Resource pertence à Company?
 ↓
Executar

Nunca confiar somente no company_id enviado pelo cliente.

11. RATE LIMIT

Implementar rate limiting.

Separar limites para:

API geral;
autenticação;
criação de tokens;
IA;
uploads;
endpoints públicos;
WhatsApp;
webhooks.

Os limites devem ser configuráveis.

Preparar futura associação ao plano comercial.

12. AUDITORIA DA API

Registrar:

API_KEY_CREATED
API_KEY_REVOKED
API_KEY_ROTATED
API_KEY_EXPIRED
API_REQUEST
API_REQUEST_FAILED

Quando apropriado registrar:

token id;
empresa;
endpoint;
método;
status;
duração;
timestamp;
request/correlation id;
IP;
user agent.

Nunca registrar o segredo do token.

13. IDEMPOTÊNCIA

Implementar suporte a:

Idempotency-Key

Principalmente em:

criação de produtos;
operações de estoque;
solicitações;
integrações;
webhooks;
operações de IA;
mensagens.

Evitar duplicidade causada por retries.

14. PAGINAÇÃO

Endpoints de listagem devem suportar:

page
page_size
sort
order
search
filters

Exemplo:

GET /api/v1/products?page=1&page_size=25

Limite máximo inicial:

100
15. RESPOSTAS

Utilizar estrutura consistente.

Sucesso:

{
  "data": {},
  "meta": {}
}

Lista:

{
  "data": [],
  "meta": {
    "page": 1,
    "page_size": 25,
    "total": 100
  }
}

Erro:

{
  "error": {
    "code": "PRODUCT_NOT_FOUND",
    "message": "Produto não encontrado.",
    "details": {}
  }
}
16. DOCUMENTAÇÃO OPENAPI

Criar documentação automática da API.

Disponibilizar:

/api/docs
/api/openapi.json

Quando apropriado disponibilizar também:

Swagger UI
Redoc

A documentação deve apresentar:

endpoints;
parâmetros;
schemas;
autenticação;
erros;
exemplos;
scopes;
paginação;
webhooks futuros.
17. API PARA PRODUTOS

Implementar API completa para:

GET products
GET product
POST product
PATCH product
DELETE/deactivate product

Suportar:

categoria;
marca;
fabricante;
fornecedor;
SKU;
barcode;
preços;
imagens;
estoque mínimo;
estoque máximo;
catálogo.
18. API PARA ESTOQUE

Implementar:

GET inventory
GET inventory/{product_id}

POST inventory/{product_id}/entry
POST inventory/{product_id}/exit
POST inventory/{product_id}/adjustment

GET inventory/movements

Toda operação deve:

validar autorização;
validar quantidade;
atualizar saldo;
gerar movimento;
preservar histórico;
ser transacional;
ser auditável.
19. API PARA CATÁLOGO

Implementar:

GET /api/v1/catalog
PATCH /api/v1/catalog/settings

POST /api/v1/catalog/products/{id}/publish
POST /api/v1/catalog/products/{id}/unpublish

A API nunca deve expor informações internas no catálogo público.

20. API PÚBLICA

Separar claramente:

Authenticated API

de:

Public API

A API pública deve possuir endpoints específicos.

Exemplo:

GET /public/v1/catalog/{slug}
POST /public/v1/catalog/{slug}/requests

Nunca reutilizar endpoints administrativos como endpoints públicos.

21. WEBHOOKS

Preparar arquitetura para webhooks.

Eventos futuros:

product.created
product.updated

inventory.updated

catalog.published

catalog.request.created

user.invited

ai.job.completed

ai.job.failed

Criar estrutura para:

endpoint;
eventos;
secret;
status;
retries;
assinatura;
logs;
entrega;
idempotência.

Não precisa necessariamente disponibilizar todos no MVP.

22. PROVEDORES DE IA

Criar uma camada de abstração.

Não acoplar a aplicação diretamente a um único fornecedor.

Arquitetura:

MarketFlow AI Service
        │
        ├── OpenAI
        ├── Google Gemini
        ├── Anthropic
        └── Outros futuros

O restante da aplicação deve conversar com:

AI Service

e não diretamente com o provider.

23. CONFIGURAÇÃO DE IA

Criar configuração por ambiente e, quando necessário, por empresa.

Exemplo:

AI Provider
AI Model
Temperature
Max Tokens
Timeout
Enabled

Nunca armazenar API Keys de providers no frontend.

24. PROVIDER ADAPTER

Criar interface conceitual:

AIProvider

Com operações como:

analyzeImage()
analyzeProduct()
extractText()
classifyProduct()

Cada provider implementa sua própria adaptação.

25. ANÁLISE DE PRODUTOS POR IMAGEM

Fluxo:

Usuário
 ↓
Upload da imagem
 ↓
Storage privado
 ↓
AI Service
 ↓
Provider
 ↓
Análise
 ↓
Resultado estruturado
 ↓
Confidence
 ↓
Revisão humana
 ↓
Produto

A IA pode sugerir:

nome;
marca;
fabricante;
categoria;
descrição;
código de barras quando identificável;
unidade;
peso/volume;
informações visíveis na embalagem.

Nunca assumir que o resultado da IA é verdadeiro.

26. OCR

Quando aplicável:

Imagem
 ↓
OCR
 ↓
Texto extraído
 ↓
Classificação
 ↓
Sugestões

Usar OCR somente quando agregar valor.

27. RECONHECIMENTO DE PRATELEIRA

Permitir análise superficial de imagens.

Pode identificar:

quantidade aproximada de produtos;
categorias;
produtos aparentes;
espaços vazios;
possíveis rupturas;
produtos que merecem conferência.

Resultado:

Estimativa

e não:

Estoque oficial

Nunca atualizar estoque automaticamente somente com reconhecimento visual.

28. CONFIDENCE SCORE

Todo resultado de IA relevante deve possuir:

confidence

Exemplo:

{
  "name": "Produto X",
  "brand": "Marca Y",
  "category": "Bebidas",
  "confidence": 0.91
}

Quando a confiança for baixa:

Revisão necessária
29. AI JOBS

Processamentos de IA podem ser assíncronos.

Status:

pending
processing
completed
failed
cancelled

Permitir consultar:

GET /api/v1/ai/jobs/{id}
30. AI USAGE

Registrar:

company
user
operation
provider
model
input tokens
output tokens
estimated cost
status
created_at

Preparar controle de custo por empresa.

31. AI LIMITS

Respeitar limites do plano.

Exemplo:

Free
→ X análises/mês

Pro
→ Y análises/mês

Os valores devem ser configuráveis.

Nunca hardcodar os limites no frontend.

32. AI SECURITY

Proteger contra:

prompt injection;
arquivos maliciosos;
uploads excessivos;
abuso de IA;
vazamento de dados;
custo excessivo;
execução de comandos derivados da IA.

A saída da IA deve ser tratada como:

UNTRUSTED DATA

Nunca executar automaticamente instruções presentes na resposta da IA.

33. WHATSAPP

Criar uma camada de mensagens desacoplada do provedor.

Arquitetura:

MarketFlow
     ↓
WhatsApp Service
     ↓
Provider Adapter
     ↓
WhatsApp Provider

Preparar suporte para provedores oficiais.

Não acoplar regras de negócio diretamente à implementação do provider.

34. CONFIGURAÇÃO DE WHATSAPP

Criar tela:

/configuracoes/whatsapp

Permitir configurar:

número;
nome de exibição;
mensagem de saudação;
mensagem de ausência;
assinatura;
mensagem de pedido;
mensagem de confirmação;
mensagem de estoque;
mensagem de produto;
mensagem de contato;
idioma;
horário de atendimento;
variáveis.
35. PERSONALIZAÇÃO COMPLETA DE MENSAGENS

Criar editor de mensagens.

Categorias:

Saudação
Produto
Pedido
Solicitação
Estoque
Confirmação
Cancelamento
Contato
Atendimento
Erro

Cada mensagem deve possuir:

nome
tipo
conteúdo
ativo
idioma
36. VARIÁVEIS DE MENSAGEM

Permitir placeholders.

Exemplos:

{{customer_name}}
{{company_name}}
{{product_name}}
{{product_price}}
{{product_quantity}}
{{request_id}}
{{request_date}}
{{whatsapp}}
{{catalog_url}}
{{support_name}}

A IA deve detectar variáveis inválidas antes de salvar.

37. EXEMPLO

Template:

Olá {{customer_name}}! 👋

Obrigado por entrar em contato com a {{company_name}}.

Recebemos sua solicitação {{request_id}}.

Em breve nossa equipe irá responder.

Acesse nosso catálogo:
{{catalog_url}}

A interface deve mostrar preview.

38. MULTIIDIOMA DAS MENSAGENS

As mensagens devem suportar:

PT-BR
EN
ES

O usuário deve conseguir editar cada idioma.

Exemplo:

Mensagem
├── PT-BR
├── EN
└── ES

Se uma tradução não existir:

utilizar fallback configurado;
informar que a tradução está ausente;
nunca enviar mensagem vazia.
39. VARIÁVEIS + VALIDAÇÃO

Antes de salvar:

Template
 ↓
Detectar variáveis
 ↓
Validar variáveis
 ↓
Validar tamanho
 ↓
Validar idioma
 ↓
Salvar

Não permitir placeholders desconhecidos.

40. WHATSAPP CTA

O catálogo público deve permitir:

Comprar / Solicitar

ou:

Falar pelo WhatsApp

A mensagem pode ser gerada dinamicamente.

Exemplo:

Olá! Gostaria de saber sobre o produto {{product_name}}.
41. SOLICITAÇÃO DE PRODUTO

Fluxo:

Cliente
 ↓
Seleciona produto
 ↓
Informa quantidade
 ↓
Envia solicitação
 ↓
MarketFlow
 ↓
Registra request
 ↓
Mensagem WhatsApp

A solicitação deve possuir ID próprio.

42. TEMPLATES POR EMPRESA

Cada empresa pode personalizar suas mensagens.

Nunca permitir que uma empresa altere os templates de outra.

43. MENSAGENS DO SISTEMA

Separar:

System Templates

de:

Company Templates

Global Admin pode manter templates padrão.

Empresa pode sobrescrever os templates permitidos.

44. PREVIEW

O editor deve possuir preview:

Template
       │
       ▼
Variáveis simuladas
       │
       ▼
Preview WhatsApp

Exemplo:

Olá João! 👋

Obrigado por entrar em contato com
Mercadinho Central.

Seu pedido #1024 foi recebido.
45. HISTÓRICO DE MENSAGENS

Preparar tabela:

whatsapp_messages

Registrar:

id
company_id
request_id
recipient
template_id
provider
status
provider_message_id
sent_at
delivered_at
read_at
failed_at
error
created_at

Nunca armazenar informações desnecessárias.

46. STATUS

Mensagens devem possuir:

queued
sending
sent
delivered
read
failed
cancelled
47. RETRY

Mensagens que falharem podem ser reenviadas conforme regras.

Implementar:

retry controlado;
exponential backoff;
limite de tentativas;
idempotência;
logs.

Nunca criar loops infinitos.

48. PRIVACIDADE

WhatsApp e dados de clientes devem seguir princípios de:

minimização;
finalidade;
segurança;
retenção adequada;
LGPD.

Não registrar dados sensíveis desnecessariamente.

49. ADMINISTRAÇÃO API

Criar área:

Desenvolvedores
├── API Keys
├── Documentação
├── Webhooks
├── Logs de API
└── Uso
50. API DASHBOARD

Mostrar:

requests;
erros;
consumo;
tokens;
endpoints mais utilizados;
última utilização;
API Keys ativas;
webhooks;
IA utilizada.
51. DOCUMENTAÇÃO PARA DESENVOLVEDORES

Criar experiência semelhante a plataformas modernas de API.

Referências conceituais:

Stripe
Vercel
Supabase
Linear

Criar:

Getting Started
Authentication
API Keys
Products
Inventory
Catalog
AI
Webhooks
Errors
Rate Limits
Examples
Changelog
52. EXEMPLOS DE API

Fornecer exemplos em:

cURL
JavaScript
TypeScript
Python

Quando fizer sentido.

53. API ERROR CODES

Padronizar erros.

Exemplos:

UNAUTHORIZED
FORBIDDEN
INVALID_TOKEN
TOKEN_EXPIRED
TOKEN_REVOKED

RESOURCE_NOT_FOUND
VALIDATION_ERROR
CONFLICT

RATE_LIMIT_EXCEEDED

PLAN_LIMIT_REACHED

AI_PROVIDER_ERROR
AI_QUOTA_EXCEEDED

WEBHOOK_DELIVERY_FAILED
54. CORRELATION ID

Toda request deve possuir:

request_id

ou:

correlation_id

Utilizado para rastreamento.

Retornar quando apropriado no response header.

55. OBSERVABILIDADE

Monitorar:

latência;
erros;
volume;
rate limit;
uso de tokens;
jobs de IA;
webhooks;
mensagens;
providers.

Nunca registrar secrets.

56. FEATURE FLAGS

Permitir ativar/desativar:

API
AI
WhatsApp
Webhooks
Public API
Advanced Integrations

sem alterar código.

57. ARQUITETURA FUTURA

Preparar:

MarketFlow
│
├── Web App
├── API
├── Auth
├── IAM
├── Catalog
├── Inventory
├── AI Service
├── WhatsApp Service
├── Webhooks
├── Notifications
└── Billing

Cada módulo deve possuir responsabilidades claras.

58. SEGURANÇA

A implementação deve obrigatoriamente considerar:

OWASP API Security
RLS
RBAC
tenant isolation
least privilege
rate limiting
token hashing
secret management
input validation
output validation
idempotency
audit logs
secure uploads
webhook signatures
HTTPS
CORS
CSP
proteção contra abuso
59. NÃO IMPLEMENTAR SEGREDOS NO FRONTEND

Nunca colocar no frontend:

AI Provider API Keys
Service Role Key
API Key Secrets
Webhook Secrets
WhatsApp Provider Secrets
Database Credentials

Todos devem permanecer no backend/secret manager.

60. DEFINITION OF DONE

API:

versionada;
documentada;
autenticada;
autorizada;
multi-tenant;
protegida por RLS;
paginada;
auditável;
rate limited;
versionada;
testada.

Tokens:

criação;
revogação;
rotação;
expiração;
scopes;
hash;
auditoria.

IA:

provider abstraction;
análise de imagens;
análise de produtos;
OCR;
confidence;
human review;
jobs;
usage;
limits;
segurança.

WhatsApp:

provider abstraction;
templates;
variáveis;
PT-BR;
EN;
ES;
preview;
histórico;
status;
retry;
auditoria.
61. REGRA FINAL PARA A IA

Não assumir que a primeira implementação precisa suportar todos os providers.

Criar primeiro as abstrações corretas.

Prioridade:

Arquitetura API First
Segurança
Multi-tenancy
IAM
API Keys
CRUD via API
OpenAPI
IA abstraída por providers
Análise de produtos/imagens
WhatsApp abstraído por provider
Templates de mensagens
Internacionalização
Webhooks
Observabilidade
Billing/limites

A IA deve analisar os documentos existentes e implementar o que for necessário para que essas funcionalidades se integrem corretamente ao MarketFlow.

Não duplicar regras entre frontend e API.

Não criar uma segunda arquitetura paralela.

A API deve ser a camada oficial de acesso às regras de negócio.

Não permitir que IA, WhatsApp, API Keys ou integrações contornem:

Authentication
Authorization
Tenant Isolation
RLS
Audit
Rate Limits
Plan Limits

O resultado final deve transformar o MarketFlow de uma aplicação web em uma plataforma SaaS extensível e integrável, mantendo a simplicidade do produto para o usuário final.