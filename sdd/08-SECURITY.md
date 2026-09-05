# 08 — Security

## 1. Objetivo

Este documento define os requisitos de segurança do MarketFlow.

A segurança deve ser tratada como requisito arquitetural e não como uma camada adicionada posteriormente.

O MarketFlow é uma aplicação SaaS multi-tenant que manipula:

- usuários;
- empresas;
- produtos;
- preços;
- estoque;
- lotes;
- fornecedores;
- imagens;
- dados de catálogo;
- solicitações de clientes;
- configurações;
- informações de uso;
- logs de auditoria;
- dados relacionados a IA;
- futuramente dados de assinatura e cobrança.

O principal objetivo é garantir:

1. isolamento completo entre empresas;
2. autorização correta por usuário e empresa;
3. proteção contra acesso indevido a dados;
4. proteção da autenticação;
5. proteção das APIs;
6. proteção do Storage;
7. proteção dos recursos de IA;
8. rastreabilidade de operações críticas;
9. segurança do catálogo público;
10. proteção contra abuso e automação maliciosa;
11. preparação para requisitos de LGPD;
12. segurança por padrão.

---

# 2. Princípios de Segurança

O sistema deve seguir os seguintes princípios:

- Zero Trust;
- Defense in Depth;
- Least Privilege;
- Secure by Default;
- Deny by Default;
- Fail Secure;
- Separation of Duties;
- Tenant Isolation;
- Server-Side Authorization;
- Data Minimization;
- Explicit Trust Boundaries;
- Auditability;
- Input Validation;
- Output Filtering;
- Secrets Management;
- Secure Error Handling.

Nenhuma funcionalidade deve depender exclusivamente da interface para garantir segurança.

---

# 3. Modelo de Segurança

O modelo principal é:

```text
User
  ↓
Authentication
  ↓
Session
  ↓
Company Membership
  ↓
Role
  ↓
Permission
  ↓
Resource
  ↓
Action
  ↓
RLS / Backend Authorization

Para operações sensíveis:

Request
  ↓
Authentication
  ↓
Tenant Resolution
  ↓
Authorization
  ↓
Validation
  ↓
Business Rules
  ↓
Database
  ↓
Audit
  ↓
Response

A seleção da empresa no frontend nunca deve ser considerada uma prova de autorização.

Exemplo:

activeCompanyId

é apenas contexto de interface.

O backend e o PostgreSQL devem validar se o usuário realmente possui acesso à empresa.

4. Multi-Tenant Security
4.1 Regra fundamental

Toda informação pertencente a uma empresa deve estar associada a:

company_id

Exemplos:

products.company_id
categories.company_id
brands.company_id
manufacturers.company_id
suppliers.company_id
inventory_items.company_id
lots.company_id
inventory_movements.company_id
catalog_settings.company_id
audit_logs.company_id
ai_jobs.company_id
4.2 Isolamento

Um usuário pertencente à:

Company A

não pode:

visualizar dados da Company B;
editar dados da Company B;
excluir dados da Company B;
consultar IDs de recursos da Company B;
inferir informações privadas da Company B;
acessar arquivos da Company B;
executar IA usando dados da Company B;
consultar logs da Company B.

Isso deve continuar verdadeiro mesmo que o usuário manipule:

URL;
query string;
request body;
headers;
IDs;
chamadas REST;
chamadas Supabase;
chamadas de Edge Functions.
5. RLS — Row Level Security

RLS é obrigatório para todas as tabelas que contenham dados protegidos.

Nunca depender somente de filtros como:

WHERE company_id = :company_id

no frontend.

O banco deve aplicar a política de segurança.

Exemplo conceitual:

create policy "company members can read products"
on products
for select
using (
  is_company_member(company_id)
);

A implementação final deve utilizar funções SQL seguras e evitar qualquer possibilidade de bypass.

6. Funções de Segurança

Criar funções auxiliares centralizadas.

Exemplos conceituais:

is_company_member(company_id)
has_company_role(company_id, role)
has_permission(company_id, permission)
is_global_admin()

Essas funções devem:

ser pequenas;
ser previsíveis;
evitar recursão de RLS;
não confiar em valores enviados pelo cliente;
ser testáveis;
ser utilizadas de maneira consistente.

Evitar duplicar regras complexas em dezenas de policies.

7. Authorization

A autorização deve considerar:

User
+
Company
+
Role
+
Permission
+
Resource
+
Action

Exemplo:

user = authenticated
company = company_123
role = stock
permission = inventory.adjust
resource = inventory_item
action = adjust

A operação só deve prosseguir se todas as condições necessárias forem satisfeitas.

8. RBAC

Os papéis iniciais são:

GLOBAL_ADMIN
ADMIN
STOCK
VISITOR
GLOBAL_ADMIN

Escopo:

Platform

Pode administrar recursos globais da plataforma.

Deve possuir proteção adicional.

Nunca deve ser possível:

criar Global Admin através de uma tela pública;
alterar o próprio papel para Global Admin;
conceder Global Admin apenas modificando um campo enviado pelo frontend.
ADMIN

Escopo:

Company

Pode administrar recursos da empresa conforme as permissões definidas.

Não pode:

acessar outra empresa;
administrar configurações globais;
criar Global Admin;
acessar secrets;
alterar políticas de segurança da plataforma.
STOCK

Pode executar operações relacionadas a:

produtos;
categorias;
marcas;
fabricantes;
fornecedores conforme permissão;
estoque;
lotes;
validade;
operações de IA relacionadas ao estoque.

Não pode:

gerenciar usuários;
alterar permissões;
alterar assinatura;
administrar a empresa;
acessar dados globais.
VISITOR

Acesso essencialmente de leitura.

Não deve possuir acesso a:

custo;
margem;
fornecedor interno;
auditoria;
configurações sensíveis;
dados de outros usuários;
informações administrativas.
9. Public Catalog Security

O catálogo público é uma superfície de ataque diferente da aplicação autenticada.

O visitante público não deve receber acesso direto às tabelas internas.

O catálogo deve expor apenas dados explicitamente publicados.

Condições mínimas:

company.active = true
AND
catalog_settings.enabled = true
AND
product.active = true
AND
catalog_products.visible = true

O endpoint público deve retornar somente informações necessárias.

Exemplo:

{
  "id": "...",
  "name": "Café Especial",
  "description": "...",
  "price": 29.90,
  "image_url": "...",
  "category": "Cafés"
}

Nunca retornar:

cost_price
supplier_id
default_supplier_id
margin
internal_stock
reserved_quantity
audit_logs
ai_jobs
ai_usage
company_users
subscription
internal metadata
10. Public Catalog Enumeration

IDs internos não devem ser utilizados como mecanismo de autorização.

Quando possível, o catálogo público deve utilizar:

company_slug

e identificadores públicos específicos.

Exemplo:

/public/catalog/{company_slug}

Evitar expor informações que permitam enumerar empresas privadas.

Empresas:

inactive
deleted
suspended
private

não devem aparecer no catálogo público.

11. Catalog Requests

Solicitações feitas por visitantes devem ser tratadas como entrada não confiável.

Exemplo:

customer_name
customer_phone
customer_email
message
product_id
quantity

Devem passar por:

validação;
sanitização;
limites de tamanho;
rate limiting;
proteção contra spam;
validação do produto;
validação da publicação do produto;
controle de quantidade.

Nunca confiar no preço enviado pelo cliente.

Se o preço for necessário, ele deve ser obtido do banco no servidor.

12. Authentication Security

Utilizar:

Supabase Auth

com:

email/password;
Google OAuth.

Requisitos:

sessão segura;
expiração adequada;
refresh token protegido;
logout correto;
recuperação de senha;
verificação de email;
proteção contra brute force;
proteção contra account enumeration;
mensagens de erro genéricas quando necessário.

Nunca armazenar senha diretamente na aplicação.

Nunca criar mecanismo próprio de armazenamento de senha.

13. OAuth Security

Para Google OAuth:

utilizar o fluxo oficial do Supabase;
validar corretamente o callback;
não confiar em dados de identidade enviados pelo frontend;
não criar conta duplicada;
associar corretamente a identidade autenticada ao usuário;
impedir troca indevida de identidade;
proteger contra manipulação de redirect.

Redirect URLs devem ser explicitamente configuradas.

Evitar:

redirect_uri

arbitrário fornecido pelo cliente.

14. Session Security

A aplicação deve possuir estados claros:

loading
unauthenticated
authenticated
email_unverified
onboarding
authenticated_without_company

Ao expirar uma sessão:

session expired
    ↓
clear sensitive state
    ↓
redirect to authentication

Não manter informações privadas em memória/cache após logout.

Ao trocar de empresa:

previous company cache
    ↓
invalidate
    ↓
load new company context

Nunca reutilizar dados da empresa anterior sem nova autorização.

15. Company Switching Security

O usuário pode pertencer a várias empresas.

Exemplo:

User
 ├── Company A → ADMIN
 ├── Company B → STOCK
 └── Company C → VISITOR

Ao trocar para Company B:

permissões devem ser recalculadas;
queries devem utilizar o novo contexto;
cache deve ser invalidado quando necessário;
menus devem refletir o novo papel;
operações administrativas da Company A não podem continuar disponíveis.

O frontend não deve simplesmente alterar:

activeCompanyId

e assumir que isso concede acesso.

16. IDOR / BOLA Protection

O sistema deve ser protegido contra:

IDOR
Insecure Direct Object Reference

e:

BOLA
Broken Object Level Authorization

Exemplo de ataque:

GET /products/company-B-product-id

mesmo que o usuário pertença somente à Company A.

Resultado esperado:

403 Forbidden

ou:

404 Not Found

conforme a estratégia de não exposição adotada.

Nunca retornar dados da Company B.

17. Input Validation

Todo input deve ser considerado não confiável.

Validar:

tipo;
formato;
tamanho;
limites;
enum;
relacionamento;
existência;
ownership;
estado;
permissões.

Frontend:

Zod

Backend:

server-side validation

Banco:

constraints

A validação deve existir em múltiplas camadas.

18. SQL Injection

Nunca concatenar SQL utilizando entrada do usuário.

Preferir:

Supabase client;
queries parametrizadas;
SQL parametrizado;
ORM/query builder quando aplicável.

Nunca construir:

SELECT * FROM products WHERE name = '${userInput}'
19. XSS

Dados inseridos por usuários ou visitantes devem ser tratados como não confiáveis.

Principalmente:

descrição de produto;
mensagens;
nome de empresa;
mensagens de catálogo;
dados de fornecedores;
respostas de IA.

Evitar renderização HTML arbitrária.

Não utilizar:

dangerouslySetInnerHTML

sem sanitização explícita e justificada.

20. CSRF

Para operações autenticadas, utilizar os mecanismos de autenticação e sessão de forma que impeçam requisições não autorizadas.

Endpoints sensíveis devem verificar:

sessão;
origem quando aplicável;
autorização;
método HTTP;
conteúdo esperado.

Não considerar apenas o fato de uma requisição possuir um token como prova suficiente de autorização.

21. API Security

Toda API deve possuir:

Authentication
Authorization
Validation
Rate Limiting
Logging
Error Handling

Fluxo:

Request
  ↓
Authentication
  ↓
Authorization
  ↓
Validation
  ↓
Business Logic
  ↓
Database
  ↓
Audit
  ↓
Response

Nunca:

Request
  ↓
Database

sem validação e autorização.

22. Edge Functions

Edge Functions devem ser utilizadas para:

IA;
operações privilegiadas;
integrações externas;
processamento assíncrono;
operações que exigem secrets;
regras que não devem ser executadas diretamente no cliente.

Fluxo obrigatório:

authenticate
↓
authorize
↓
validate
↓
execute
↓
audit
↓
return
23. Service Role Key

A Service Role Key do Supabase possui privilégios elevados.

Ela:

nunca deve ser enviada ao frontend;
nunca deve estar em código público;
nunca deve estar em Git;
nunca deve aparecer em logs;
nunca deve ser armazenada em tabelas acessíveis ao usuário.

Somente ambiente server-side deve possuir acesso.

24. Secrets Management

Secrets devem ficar exclusivamente em:

Environment Variables
Secret Manager
Supabase Secrets

Exemplos:

SUPABASE_SERVICE_ROLE_KEY
OPENAI_API_KEY
GOOGLE_CLIENT_SECRET
AI_PROVIDER_SECRET

Nunca armazenar secrets em:

database público
frontend
localStorage
JSON público
Git
logs
audit_logs
responses
25. Frontend Security

O frontend não é uma fronteira de segurança.

É permitido utilizar o frontend para:

esconder menus;
desabilitar botões;
melhorar UX;
mostrar permissões;
controlar navegação.

Mas isso nunca substitui:

RLS
Backend Authorization
Database Constraints

Exemplo incorreto:

if (user.role === "admin") {
  deleteProduct();
}

Isso pode existir para UX, mas a operação precisa ser protegida no servidor/banco.

26. Local Storage

Não armazenar dados sensíveis em:

localStorage
sessionStorage

Evitar armazenar:

tokens sensíveis;
secrets;
dados internos;
informações de fornecedores;
custos;
credenciais.

O armazenamento local pode ser utilizado para:

preferências de UI;
tema;
idioma;
filtros não sensíveis;
estado temporário.
27. Storage Security

As imagens devem utilizar caminhos associados à empresa.

Exemplo:

companies/{company_id}/products/{product_id}/...

As policies do Storage devem impedir acesso cruzado.

Um usuário da Company A não deve conseguir:

download Company B file

mesmo conhecendo o caminho.

28. Upload Security

Uploads devem possuir:

limite de tamanho;
MIME type permitido;
extensão validada;
nome de arquivo seguro;
caminho controlado;
autorização;
validação de ownership.

Para imagens:

JPEG
PNG
WEBP

podem ser suportados inicialmente.

Evitar aceitar arquivos executáveis ou tipos não necessários.

Não confiar somente na extensão:

arquivo.exe.jpg

deve ser tratado como potencialmente malicioso.

29. Image Processing

Imagens enviadas para IA devem passar por:

upload validation
↓
authorization
↓
storage
↓
processing
↓
AI provider

Quando possível:

limitar resolução;
comprimir;
remover metadata desnecessária;
limitar tamanho;
rejeitar arquivos inválidos.
30. AI Security

IA é uma superfície de risco própria.

Toda operação de IA deve possuir:

Authentication
Authorization
Quota
Rate Limit
Input Validation
Provider Isolation
Audit
Cost Control
31. AI Human-in-the-Loop

A IA nunca deve alterar dados críticos automaticamente no MVP.

Fluxo:

Image
  ↓
AI
  ↓
Result
  ↓
Confidence
  ↓
Warnings
  ↓
Human Review
  ↓
Confirmation
  ↓
Database

Exemplo:

{
  "name": "Café Especial",
  "brand": "Marca X",
  "category": "Cafés",
  "confidence": 0.91,
  "warnings": []
}

A confiança da IA não representa autorização.

32. Prompt Injection

Imagens e dados processados por IA devem ser considerados não confiáveis.

Nunca permitir que conteúdo externo altere regras internas do sistema.

Prompts devem:

possuir instruções controladas;
limitar o formato de saída;
utilizar schemas estruturados;
validar resposta;
rejeitar campos inesperados.

A saída da IA nunca deve ser executada diretamente como código ou comando.

33. AI Output Validation

Nunca salvar diretamente:

AI response → database

O fluxo deve ser:

AI response
↓
parse
↓
schema validation
↓
business validation
↓
permission validation
↓
human confirmation
↓
database

Utilizar schema estruturado, preferencialmente com Zod no aplicativo e validação equivalente no backend.

34. AI Cost Protection

Cada operação de IA deve possuir:

limite por usuário;
limite por empresa;
limite por plano;
rate limit;
timeout;
controle de tokens;
registro de uso;
estimativa de custo.

Tabela:

ai_usage

deve permitir acompanhar:

company
user
operation
provider
model
tokens
estimated_cost
status
timestamp
35. Shelf Recognition Security

O reconhecimento de prateleira é apenas uma estimativa.

Nunca tratar a resposta da IA como inventário oficial.

Fluxo:

Photo
↓
AI
↓
Estimated products
↓
Confidence
↓
Human confirmation
↓
Inventory operation

A IA não pode:

alterar estoque diretamente

sem autorização e confirmação explícita.

36. Inventory Security

Estoque é uma área crítica.

Operações devem ser transacionais.

Exemplo:

Inventory Adjustment
    ↓
validate permission
    ↓
validate product
    ↓
validate quantity
    ↓
update inventory
    ↓
create movement
    ↓
audit
    ↓
commit

A atualização do saldo e a criação da movimentação devem ocorrer na mesma transação.

37. Inventory History Integrity

Nunca permitir exclusão arbitrária de:

inventory_movements

Correções devem utilizar:

adjustment

Exemplo:

Entrada incorreta +10
↓
Adjustment -10

em vez de apagar a operação original.

38. Concurrency

Operações de estoque devem considerar concorrência.

Exemplo:

User A → adjusts stock
User B → adjusts stock

O sistema não deve perder uma das operações.

Utilizar mecanismos apropriados de:

transaction;
row locking quando necessário;
atomic update;
optimistic concurrency;
constraints.
39. Price Security

Preço de venda:

sale_price

e custo:

cost_price

possuem níveis diferentes de sensibilidade.

cost_price nunca deve ser exposto ao catálogo público.

Alterações relevantes de preço devem ser auditáveis.

Utilizar:

product_price_history

para registrar alterações.

40. Supplier Data Security

Dados de fornecedores são internos.

Não devem aparecer no:

public catalog

nem para:

VISITOR

exceto se explicitamente houver uma futura regra que permita isso.

41. Audit Logs

Operações críticas devem gerar auditoria.

Exemplos:

login
logout
company_created
company_updated
user_invited
user_removed
role_changed
permission_changed
product_created
product_updated
product_deleted
price_changed
inventory_adjusted
lot_created
lot_updated
catalog_enabled
catalog_disabled
ai_operation
subscription_changed
42. Audit Integrity

Audit logs devem ser:

append-oriented;
protegidos contra alteração;
protegidos contra exclusão;
associados à empresa quando aplicável;
associados ao usuário quando disponível;
registrados com timestamp.

Campos importantes:

company_id
user_id
action
entity_type
entity_id
old_data
new_data
metadata
ip_address
user_agent
created_at

Nunca armazenar secrets dentro do audit log.

43. Sensitive Data in Logs

Logs não devem conter:

passwords;
access tokens;
refresh tokens;
API keys;
Service Role Key;
OAuth client secrets;
secrets de provedores;
dados financeiros sensíveis desnecessários.

Aplicar redaction/masking quando necessário.

44. Error Handling

Mensagens de erro não devem revelar detalhes internos.

Evitar:

Postgres error: relation xyz failed because...

para o usuário final.

Utilizar códigos estáveis:

{
  "error": {
    "code": "FORBIDDEN",
    "message": "Você não possui permissão para executar esta operação."
  }
}

Erros internos devem permanecer nos logs.

45. Authentication Error Enumeration

Evitar informar:

"Este email existe"

ou:

"Este usuário não existe"

quando isso permitir enumeração de contas.

Preferir mensagens genéricas em fluxos de:

login;
recuperação de senha;
convite;
cadastro.
46. Rate Limiting

Rate limiting deve existir especialmente em:

login
password recovery
OAuth callbacks
public catalog
catalog requests
AI
uploads
imports
future public API

Exemplos:

per IP
per user
per company
per endpoint

A estratégia pode variar de acordo com o recurso.

47. Abuse Protection

O sistema deve estar preparado para:

bots;
spam;
scraping;
brute force;
abuso de IA;
uploads excessivos;
criação massiva de empresas;
criação massiva de produtos;
requests automatizados.

Para endpoints públicos, considerar:

rate limit
captcha/challenge futuro
IP throttling
request fingerprinting futuro

Não implementar mecanismos complexos antes de existir necessidade real.

48. Pagination Security

Toda listagem deve possuir limites.

Exemplo:

page_size = 25
max_page_size = 100

Nunca permitir:

?page_size=999999999

ou queries capazes de consumir recursos excessivos.

49. Search Security

Pesquisa textual deve:

possuir limite;
utilizar queries seguras;
evitar SQL injection;
evitar regex abusiva;
limitar resultados;
respeitar RLS.

Nunca permitir que uma busca pública acesse dados internos.

50. Denial of Service Considerations

Endpoints potencialmente caros devem possuir:

timeout;
rate limiting;
limite de payload;
limite de resultados;
paginação;
controle de concorrência.

Especialmente:

AI
image processing
imports
reports
exports
search
catalog requests
51. Import Security

Futuramente o sistema poderá importar:

CSV
XLSX
JSON

Todo import deve ser tratado como não confiável.

Validar:

extensão;
MIME type;
tamanho;
estrutura;
quantidade de linhas;
campos;
tipos;
valores;
relacionamento;
tenant.

Nunca permitir que o arquivo determine:

company_id
user_id
permissions
ownership
52. Export Security

Exports devem respeitar exatamente as permissões do usuário.

Um usuário STOCK não deve conseguir exportar:

cost_price
audit_logs
users
subscriptions

simplesmente porque existe uma rota de exportação.

O filtro de autorização deve ocorrer antes da geração do arquivo.

53. Data Minimization

O sistema deve armazenar somente os dados necessários.

Exemplo:

Se o catálogo precisa de:

nome
imagem
descrição
preço

não deve enviar:

fornecedor
custo
margem
estoque interno
54. LGPD Readiness

O sistema deve ser arquitetado considerando a LGPD.

Requisitos futuros:

identificação de dados pessoais;
finalidade;
minimização;
controle de acesso;
retenção;
exclusão quando aplicável;
exportação de dados;
consentimento quando aplicável;
registro de operações;
atendimento a solicitações do titular.

Dados pessoais potenciais:

name
email
phone
WhatsApp
IP
user_agent
customer contact information

A implementação completa de LGPD deve ser uma iniciativa própria, mas a arquitetura do MVP não deve impedir sua implementação.

55. Data Retention

Definir futuramente políticas para:

audit_logs
ai_usage
ai_jobs
catalog_requests
deleted users
deleted companies

Não apagar automaticamente dados de auditoria ou histórico operacional sem política definida.

56. Soft Delete

Entidades críticas podem utilizar:

deleted_at

Exemplos:

companies
products
categories
brands
manufacturers
suppliers

Soft delete não significa que o registro pode continuar aparecendo normalmente.

Todas as queries devem considerar o estado de exclusão.

57. Deleted Company

Ao excluir/desativar uma empresa:

impedir login contextual;
impedir acesso aos recursos;
impedir catálogo público;
bloquear novas operações;
preservar histórico conforme política de retenção;
impedir acesso aos arquivos;
registrar auditoria.

Não apagar automaticamente histórico operacional sem uma política explícita.

58. Global Admin Security

Global Admin representa o maior nível de privilégio da plataforma.

Requisitos:

acesso restrito;
auditoria reforçada;
futuras MFA;
proteção contra alteração indevida de papel;
confirmação para operações destrutivas;
logs de acesso;
sessões monitoradas.

Futuramente:

MFA
IP allowlist
session management
admin impersonation audit
step-up authentication
59. Impersonation / Login as Company

Caso futuramente exista:

Login as Company

ou:

Impersonation

a ação deve ser altamente auditável.

Registrar:

original_user
target_company
reason
started_at
ended_at
actions_performed

Nunca esconder que uma sessão está operando em modo de impersonation.

60. Subscription Security

Informações relacionadas a:

plans
subscriptions
billing
payment

devem possuir escopo adequado.

Um usuário comum não pode alterar:

plan_id
subscription_status
billing_period
external_customer_id

através do frontend.

Alterações devem ocorrer através de backend seguro.

61. Plan Limit Security

Limites do plano não podem ser considerados somente uma regra visual.

Exemplo:

Free
100 products

Não basta esconder o botão "Novo produto" após 100 registros.

O backend deve impedir:

101º product creation

mesmo através de uma requisição manual.

62. Business Rule Enforcement

Regras críticas devem ser aplicadas no servidor.

Exemplos:

maximum companies
maximum products
maximum users
AI quota
inventory limits
catalog permissions
role changes
company deletion
63. Database Constraints

Segurança também deve utilizar constraints.

Exemplos:

NOT NULL
UNIQUE
CHECK
FOREIGN KEY

Exemplos conceituais:

check (sale_price >= 0)
check (cost_price >= 0)
check (quantity >= 0)

Quando uma regra puder ser garantida pelo banco, preferir a garantia no banco.

64. Unique Constraints and Tenant Isolation

Valores únicos devem considerar o tenant quando apropriado.

Exemplo:

SKU

pode ser único por empresa:

UNIQUE(company_id, sku)

O mesmo SKU pode existir em empresas diferentes.

Para recursos globalmente únicos, a constraint deve ser global.

65. Foreign Key Security

Relacionamentos devem impedir referências cruzadas entre empresas.

Exemplo:

product.company_id = Company A
category.company_id = Company B

Essa relação não deve ser aceita.

Não confiar somente no frontend para impedir esse cenário.

66. Cross-Tenant Relationship Protection

Operações como:

create product
assign category
assign brand
assign supplier
create lot
create inventory movement

devem validar:

resource.company_id == target_company_id

antes de executar.

67. Secure Defaults

Novos recursos devem começar como:

private
disabled
restricted

quando houver dúvida.

Exemplos:

catalog_enabled = false
catalog_product_visible = false
allow_contact = false

A publicação deve ser uma decisão explícita.

68. CORS

Configurar CORS de forma restritiva.

Evitar:

Access-Control-Allow-Origin: *

para endpoints autenticados ou administrativos.

Endpoints públicos devem possuir somente a exposição necessária.

69. Content Security Policy

A aplicação deve considerar uma política CSP.

Objetivos:

reduzir XSS;
limitar scripts;
limitar frames;
controlar conexões;
controlar fontes;
reduzir impacto de conteúdo injetado.

A política deve ser evoluída conforme as integrações utilizadas.

Evitar:

unsafe-inline
unsafe-eval

sempre que tecnicamente possível.

70. Security Headers

Considerar:

Content-Security-Policy
Strict-Transport-Security
X-Content-Type-Options
Referrer-Policy
Permissions-Policy
X-Frame-Options

Quando compatível com a arquitetura e infraestrutura utilizada.

71. HTTPS

Toda comunicação deve utilizar HTTPS.

Nunca transmitir:

credentials
tokens
private data
AI payloads

por HTTP não protegido em produção.

HSTS deve ser considerado para produção.

72. Dependencies

Dependências devem ser mantidas atualizadas.

Processo recomendado:

dependency scan
↓
security advisory
↓
risk assessment
↓
update
↓
test

Evitar dependências abandonadas ou desnecessárias.

73. Supply Chain Security

Considerar:

lockfiles;
revisão de dependências;
versões fixadas;
npm audit;
Dependabot/Renovate futuramente;
revisão de pacotes críticos.

Evitar instalar bibliotecas apenas por conveniência quando uma implementação simples pode ser feita internamente.

74. Environment Separation

Separar claramente:

development
staging
production

Cada ambiente deve possuir:

banco separado;
secrets separados;
OAuth configuration separada;
AI keys separadas quando possível;
Storage separado;
logs separados.

Nunca utilizar credenciais de produção localmente sem necessidade explícita.

75. Production Security

Antes de produção:

HTTPS;
secrets configurados;
RLS validado;
Auth configurado;
Storage policies;
rate limits;
logs;
monitoring;
error tracking;
backups;
recovery strategy;
security headers;
CORS;
domínio;
OAuth redirects.
76. Backup and Recovery

O banco deve possuir estratégia de backup apropriada ao ambiente.

Definir:

RPO
RTO
backup frequency
retention
restore procedure

Backups também são dados sensíveis e devem possuir controle de acesso.

77. Disaster Recovery

Documentar futuramente:

Database recovery
Storage recovery
Secrets rotation
OAuth recovery
AI provider failure
Supabase outage

A aplicação não deve depender de um único componente sem estratégia de recuperação quando o risco justificar.

78. AI Provider Failure

A IA deve ser tratada como dependência externa.

Se o provedor falhar:

application continues working

Operações normais de:

produtos;
estoque;
catálogo;
empresas;
usuários

não devem depender da disponibilidade da IA.

79. AI Provider Abstraction

Não acoplar a aplicação diretamente a um único fornecedor.

Arquitetura:

AI Service
   ↓
Provider Adapter
   ├── OpenAI
   ├── Gemini
   └── Future Provider

Isso facilita:

troca de fornecedor;
fallback;
controle de custo;
testes;
compliance;
disponibilidade.
80. External Integrations

Integrações futuras devem possuir:

secrets isolados;
timeout;
retry controlado;
circuit breaker quando necessário;
rate limiting;
validation;
audit;
idempotency.

Nunca confiar cegamente em payloads externos.

81. Webhooks

Futuramente, webhooks devem possuir:

assinatura;
validação;
timestamp;
replay protection;
idempotency;
audit;
timeout.

Nunca processar webhook somente porque o endpoint recebeu uma requisição.

82. Idempotency

Operações sensíveis devem suportar idempotência quando necessário.

Exemplos:

inventory operations
imports
webhooks
AI jobs
payments

Uma mesma requisição repetida não deve gerar operações duplicadas.

83. Security Monitoring

Monitorar eventos como:

multiple failed logins
unusual AI usage
large number of requests
cross-tenant authorization failures
large uploads
mass product creation
mass deletion attempts
role changes
Global Admin actions
84. Security Alerts

Futuramente criar alertas para eventos críticos.

Exemplos:

multiple authentication failures
suspicious API activity
privilege escalation attempt
unexpected Global Admin action
large AI cost spike
massive catalog requests
85. Observability

Logs técnicos devem possuir:

timestamp
request_id
user_id
company_id
endpoint
operation
status
latency
error_code

Não registrar secrets.

Quando possível utilizar:

correlation_id

para rastrear uma operação ponta a ponta.

86. Security Testing

Testes obrigatórios devem incluir:

Authentication
login válido;
login inválido;
logout;
recuperação de senha;
sessão expirada;
OAuth;
usuário não verificado.
Authorization
Admin;
Stock;
Visitor;
Global Admin;
usuário sem membership;
usuário removido;
usuário desativado.
Tenant Isolation

Testar:

Company A → Company B

para:

products;
categories;
brands;
manufacturers;
suppliers;
inventory;
lots;
catalog;
requests;
audit logs;
AI jobs;
Storage.

Todos devem ser bloqueados.

87. Security Abuse Tests

Testar:

IDOR;
BOLA;
SQL injection;
XSS;
malformed JSON;
oversized payload;
oversized upload;
rate limiting;
enumeration;
privilege escalation;
forged company_id;
forged user_id;
forged role;
forged price;
forged inventory quantity.
88. Frontend Security Tests

Validar que:

menus são corretamente filtrados;
rotas protegidas não abrem;
permissões são recalculadas ao trocar empresa;
cache não vaza dados;
logout limpa estado sensível;
empresa anterior não aparece após troca;
usuário não consegue executar operação apenas removendo disabled do botão.
89. RLS Test Matrix

Criar uma matriz automatizada.

Exemplo:

Role	Company A	Company B	Read	Write	Delete
Global Admin	allowed	allowed	platform	platform	controlled
Admin A	allowed	denied	yes	yes	controlled
Stock A	allowed	denied	yes	limited	no
Visitor A	allowed	denied	limited	no	no
Anonymous	public only	public only	catalog only	request only	no
90. Security Definition of Done

Uma funcionalidade não está pronta se:

não possui autorização;
não possui RLS quando aplicável;
permite acesso cross-tenant;
expõe dados internos;
não valida input;
não possui tratamento de erro;
não considera abuso;
não possui estados de segurança na UI;
não respeita os limites do plano;
não registra operações críticas;
expõe secrets;
depende apenas de validação frontend.
91. Security Checklist

Antes de considerar uma feature pronta:

[ ] Authentication verified
[ ] Authorization verified
[ ] Tenant isolation verified
[ ] RLS implemented
[ ] Backend validation implemented
[ ] Database constraints reviewed
[ ] Input limits defined
[ ] Output fields reviewed
[ ] Sensitive fields protected
[ ] Storage policies reviewed
[ ] Rate limiting evaluated
[ ] Audit requirements reviewed
[ ] Error handling reviewed
[ ] Logs sanitized
[ ] Secrets reviewed
[ ] Cross-tenant tests implemented
[ ] Role tests implemented
[ ] Public access reviewed
[ ] Plan limits enforced server-side
[ ] Mobile security states reviewed
92. Security Priorities
P0 — Obrigatório para MVP
Supabase Auth;
RLS;
tenant isolation;
RBAC;
backend authorization;
secure Storage;
input validation;
output filtering;
secrets management;
HTTPS;
rate limiting básico;
audit logs para operações críticas;
proteção de estoque;
proteção do catálogo público;
AI quota;
cross-tenant tests;
IDOR/BOLA tests.
P1 — Alta prioridade
Security headers;
CSP;
monitoring;
dependency scanning;
backup/recovery;
abuse detection;
security alerts;
AI cost controls avançados.
P2 — Futuro
MFA;
custom roles;
ABAC;
SSO;
SAML;
OIDC;
IP allowlist;
advanced threat detection;
advanced LGPD workflows;
enterprise security controls.
93. Threat Model Inicial

Principais ameaças:

Threat	Impact	Mitigation
Cross-tenant access	Critical	RLS + authorization
IDOR/BOLA	Critical	Object-level authorization
Privilege escalation	Critical	Server-side RBAC
Credential theft	Critical	Supabase Auth + secure sessions
API abuse	High	Rate limiting
AI abuse	High	quotas + limits
Prompt injection	High	structured AI output + validation
Data leakage	Critical	field filtering
Malicious upload	High	validation + Storage policies
SQL Injection	Critical	parameterized queries
XSS	High	escaping + sanitization
Spam catalog	Medium	rate limiting
Inventory manipulation	High	transactions + permissions + audit
Secret exposure	Critical	environment secrets
Dependency vulnerability	High	scanning + updates
Data loss	Critical	backups + recovery
94. Security Architecture

A arquitetura de segurança deve ser:

                    ┌──────────────────────┐
                    │      Public Web      │
                    └──────────┬───────────┘
                               │
                               ▼
                    ┌──────────────────────┐
                    │  Public API Surface  │
                    │ Rate Limit / Filter  │
                    └──────────┬───────────┘
                               │
                               ▼
┌──────────────┐      ┌──────────────────────┐
│ Authenticated│─────▶│ Authentication       │
│    Client    │      │ Supabase Auth        │
└──────────────┘      └──────────┬───────────┘
                                 │
                                 ▼
                      ┌──────────────────────┐
                      │ Authorization        │
                      │ Role + Permission    │
                      │ + Company            │
                      └──────────┬───────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
          ┌──────────────────┐       ┌──────────────────┐
          │ Supabase / RLS   │       │ Edge Functions   │
          │ PostgreSQL       │       │ Business Logic   │
          └────────┬─────────┘       └────────┬─────────┘
                   │                          │
                   └────────────┬─────────────┘
                                ▼
                      ┌──────────────────────┐
                      │ Audit / Monitoring   │
                      └──────────────────────┘
95. Security Boundary Model

As fronteiras de confiança são:

Anonymous User
    ↓ UNTRUSTED

Authenticated User
    ↓ AUTHENTICATED

Company Member
    ↓ AUTHORIZED FOR TENANT

Role / Permission
    ↓ AUTHORIZED FOR ACTION

Backend / RLS
    ↓ TRUSTED ENFORCEMENT

Database
    ↓ DATA AUTHORITY

Nenhuma camada deve assumir que uma camada anterior é suficiente.

96. Development Rules for AI Agents

Qualquer IA utilizada para desenvolvimento do MarketFlow deve seguir estas regras:

Ler a documentação antes de alterar arquitetura.
Nunca remover RLS para corrigir um erro.
Nunca desabilitar políticas de segurança como workaround.
Nunca implementar autorização somente no frontend.
Nunca expor Service Role Key.
Nunca adicionar secrets no código.
Nunca criar acesso cross-tenant.
Nunca permitir alteração de role pelo cliente sem autorização.
Nunca criar Global Admin através de UI pública.
Nunca permitir que IA altere dados críticos sem fluxo definido.
Nunca remover histórico de estoque.
Nunca expor cost_price no catálogo público.
Nunca confiar em company_id enviado pelo cliente.
Nunca confiar em user_id enviado pelo cliente.
Nunca confiar em permissões enviadas pelo cliente.
Nunca realizar migração destrutiva sem justificativa e migração versionada.
Nunca criar endpoint público sem avaliar rate limiting.
Nunca utilizar dados mock para mascarar uma falha de segurança.
Nunca considerar esconder um botão como autorização.
Sempre considerar cenários de ataque ao implementar uma feature.
97. Security Incident Response

Futuramente documentar:

Detection
↓
Containment
↓
Investigation
↓
Eradication
↓
Recovery
↓
Post-Incident Review

Incidentes críticos incluem:

vazamento cross-tenant;
exposição de secrets;
comprometimento de conta administrativa;
privilege escalation;
exposição de dados pessoais;
alteração indevida de estoque;
comprometimento de API;
abuso financeiro de IA.
98. Security Documentation

Documentar futuramente:

Threat Model
Security Architecture
RLS Policies
Permission Matrix
Incident Response
Backup Strategy
Disaster Recovery
LGPD Procedures
Secrets Rotation
OAuth Configuration
AI Security
Storage Security
API Security

Este documento é a referência inicial.

Detalhes operacionais podem ser separados posteriormente em documentos específicos.

99. MVP Security Acceptance Criteria

O MVP somente poderá ser considerado pronto quando:

usuários autenticados não conseguirem acessar outra empresa;
RLS estiver habilitado nas tabelas protegidas;
roles forem aplicadas server-side;
company_id não for uma fonte de confiança;
cost_price não aparecer no catálogo público;
Storage estiver isolado por empresa;
operações críticas estiverem auditadas;
estoque possuir histórico imutável;
limites do plano forem aplicados no backend;
IA possuir quota e rate limit;
uploads forem validados;
endpoints públicos possuírem proteção contra abuso;
secrets não estiverem no frontend;
cross-tenant tests estiverem implementados;
IDOR/BOLA tests estiverem implementados;
logout e troca de empresa não causarem vazamento de cache;
usuários removidos perderem imediatamente acesso;
usuários desativados não puderem operar;
Visitor não puder acessar informações administrativas;
Global Admin não puder ser criado através de manipulação do frontend.
100. Regra Final

A regra de segurança do MarketFlow é:

Nunca confiar no cliente.

O frontend pode melhorar a experiência.

O backend pode aplicar regras de negócio.

O PostgreSQL/RLS deve garantir isolamento de dados.

O Storage deve garantir isolamento de arquivos.

O sistema de autenticação deve garantir identidade.

A auditoria deve garantir rastreabilidade.

A segurança deve existir em profundidade:

Authentication
        +
Authorization
        +
Tenant Isolation
        +
RLS
        +
Validation
        +
Database Constraints
        +
Rate Limiting
        +
Audit
        +
Monitoring

Uma única camada nunca deve ser considerada suficiente.