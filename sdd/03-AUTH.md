# MarketFlow — Authentication Specification

> Especificação oficial de autenticação, identidade e gerenciamento de sessão do MarketFlow.

**Versão:** 1.0.0  
**Status:** Em desenvolvimento  
**Documento:** 03-AUTH.md  
**Documentos relacionados:**
- 00-VISION.md
- 01-FOUNDATION.md
- 02-DATABASE.md

---

# 1. Objetivo

Definir como usuários entram, saem e recuperam acesso à plataforma MarketFlow.

Este documento cobre:

- criação de conta;
- login;
- logout;
- Google OAuth;
- email e senha;
- recuperação de senha;
- verificação de email;
- sessão;
- primeiro acesso;
- troca de empresa;
- proteção de rotas;
- convite de usuários;
- encerramento de conta.

Este documento não define detalhadamente permissões de negócio.

As permissões serão especificadas em:

```text
04-PERMISSIONS.md
```

---

# 2. Princípios

A autenticação deverá seguir:

- Security by Default
- Menor privilégio
- Sessões seguras
- Tokens gerenciados pelo Supabase Auth
- Nenhuma senha armazenada pela aplicação
- Nenhum token sensível no banco de negócio
- Nenhuma credencial privada no frontend
- MFA preparado para implementação futura
- Recuperação de conta segura

---

# 3. Provider

O sistema utilizará:

```text
Supabase Auth
```

Métodos iniciais:

```text
Email + Password
Google OAuth
```

Arquitetura preparada para futuros providers.

Possíveis extensões:

```text
Microsoft
Apple
Magic Link
OIDC
SAML
```

---

# 4. Cadastro

O usuário deverá poder criar uma conta através da Landing Page.

Fluxo:

```text
Landing Page

↓

Criar conta

↓

Nome

Email

Senha

Confirmar senha

↓

Criar conta

↓

Verificação de email

↓

Login

↓

Configuração inicial
```

---

# 5. Cadastro via Google

O usuário poderá selecionar:

```text
Continuar com Google
```

Fluxo:

```text
Landing Page

↓

Google OAuth

↓

Autorização

↓

Supabase Auth

↓

Usuário autenticado

↓

Verificar perfil

↓

Verificar empresas

↓

Dashboard ou Onboarding
```

---

# 6. Primeiro Acesso

Após autenticação, o sistema deverá verificar:

```text
Usuário possui empresa?
```

Se:

```text
SIM
```

abrir Dashboard.

Se:

```text
NÃO
```

iniciar onboarding.

---

# 7. Onboarding

Primeiro acesso:

```text
Conta criada

↓

Criar empresa

↓

Nome da empresa

↓

Dados básicos

↓

Configuração inicial

↓

Dashboard
```

O onboarding deverá ser curto.

Evitar solicitar informações desnecessárias.

---

# 8. Criação da Primeira Empresa

O usuário deverá informar inicialmente:

```text
Nome da empresa

Slug

CNPJ (opcional)

Telefone (opcional)

WhatsApp (opcional)
```

Campos adicionais poderão ser configurados posteriormente.

---

# 9. Slug

Cada empresa deverá possuir um slug público.

Exemplo:

```text
Mercado Central

↓

mercado-central
```

O slug será utilizado no catálogo público.

---

# 10. Conta do Usuário

O usuário possui uma identidade global.

Exemplo:

```text
User

email:
joao@email.com
```

Esse usuário poderá possuir várias associações:

```text
Company A → Admin

Company B → Stock

Company C → Visitor
```

O papel não pertence globalmente ao usuário.

Ele pertence à relação:

```text
User + Company
```

---

# 11. Perfil

Após criação da conta, o sistema deverá manter um perfil complementar.

Informações:

```text
Nome

Avatar

Telefone

Preferências
```

O email de autenticação deverá ser gerenciado pelo Supabase Auth.

---

# 12. Email + Senha

Requisitos mínimos:

- email válido;
- senha obrigatória;
- confirmação de senha;
- email único no sistema.

A senha deverá ser processada exclusivamente pelo mecanismo de autenticação.

A aplicação nunca deverá armazenar senha em tabelas próprias.

---

# 13. Política de Senha

A política mínima deverá seguir as capacidades disponíveis no provedor de autenticação.

Recomendação:

```text
Mínimo de 8 caracteres
```

Preferencialmente exigir combinação de:

- letras;
- números;
- caracteres especiais.

A política deverá poder evoluir futuramente.

---

# 14. Senhas Comprometidas

Quando suportado pelo provedor, utilizar proteção contra senhas comprometidas.

Não permitir senhas conhecidamente expostas em vazamentos quando essa funcionalidade estiver disponível.

---

# 15. Verificação de Email

O cadastro por email deverá utilizar confirmação de email.

Fluxo:

```text
Cadastro

↓

Email enviado

↓

Usuário confirma

↓

Conta habilitada
```

O usuário poderá visualizar:

```text
Verifique seu email para continuar.
```

---

# 16. Reenvio de Verificação

O sistema deverá permitir:

```text
Reenviar email de verificação
```

Com proteção contra abuso/rate limiting.

---

# 17. Login

Tela de login:

```text
Email

Senha

[Entrar]

[Continuar com Google]

Esqueci minha senha

Criar conta
```

---

# 18. Erros de Login

Não revelar informações desnecessárias.

Evitar mensagens como:

```text
Este email não existe.
```

Preferir mensagens genéricas:

```text
Email ou senha inválidos.
```

Isso reduz possibilidade de enumeração de usuários.

---

# 19. Recuperação de Senha

Fluxo:

```text
Login

↓

Esqueci minha senha

↓

Email

↓

Enviar recuperação

↓

Link seguro

↓

Nova senha

↓

Confirmar

↓

Login
```

---

# 20. Token de Recuperação

Tokens de recuperação deverão ser gerenciados pelo Supabase Auth.

Não criar mecanismo próprio de reset de senha.

---

# 21. Expiração

Links de recuperação deverão possuir validade limitada conforme configuração do provider.

Links expirados deverão apresentar:

```text
Este link expirou.
Solicite uma nova recuperação de senha.
```

---

# 22. Logout

O usuário deverá possuir ação:

```text
Sair
```

Após logout:

```text
Sessão encerrada

↓

Redirecionar para Login
```

---

# 23. Sessão

A sessão deverá ser administrada pelo Supabase Auth.

Não criar sistema paralelo de sessão.

O frontend deverá reagir aos eventos de:

```text
SIGNED_IN

SIGNED_OUT

TOKEN_REFRESHED

USER_UPDATED
```

---

# 24. Refresh Token

O mecanismo de refresh deverá ser administrado pelo Supabase Auth.

A aplicação não deverá implementar manualmente refresh tokens.

---

# 25. Proteção de Rotas

Rotas privadas deverão verificar autenticação.

Exemplo:

```text
/dashboard
/products
/inventory
/suppliers
/settings
```

Se usuário não autenticado:

```text
→ /login
```

---

# 26. Rotas Públicas

Exemplos:

```text
/
/login
/register
/forgot-password
/reset-password
/loja/:slug
```

Essas páginas poderão ser acessadas sem sessão quando apropriado.

---

# 27. Proteção Não é Autorização

Estar autenticado não significa possuir acesso.

Exemplo:

```text
Usuário autenticado
        ↓
Pertence à empresa?
        ↓
Possui permissão?
        ↓
Pode executar operação?
```

A autorização será definida em:

```text
04-PERMISSIONS.md
```

---

# 28. Contexto da Empresa

Após login, o sistema deverá determinar quais empresas pertencem ao usuário.

Exemplo:

```text
Minhas empresas

├── Mercado Central
├── Mercearia São João
└── Loja Express
```

O usuário deverá selecionar uma empresa para entrar no contexto administrativo.

---

# 29. Empresa Atual

O frontend poderá manter:

```text
current_company_id
```

Porém esse valor nunca deverá ser considerado suficiente para autorizar uma operação.

O backend/database deverá validar a associação.

---

# 30. Troca de Empresa

Usuário:

```text
Mercado Central
```

pode trocar para:

```text
Mercearia São João
```

Fluxo:

```text
Selecionar empresa

↓

Atualizar contexto

↓

Recarregar dados

↓

Aplicar permissões da empresa
```

---

# 31. Isolamento

A troca de empresa deverá limpar/invalidar dados específicos do contexto anterior quando necessário.

Não permitir que:

```text
Company A data
```

permaneça sendo exibida após mudar para:

```text
Company B
```

---

# 32. Convite de Usuários

Administradores poderão convidar usuários para sua empresa.

Fluxo:

```text
Admin

↓

Usuários

↓

Convidar

↓

Email

↓

Definir Role

↓

Enviar convite
```

---

# 33. Convite

O convite deverá possuir:

```text
company_id

email

role

token/reference

expires_at

status

invited_by

created_at
```

O mecanismo final poderá utilizar recursos próprios do Supabase Auth.

---

# 34. Aceitação do Convite

Usuário:

```text
Recebe convite

↓

Abre link

↓

Login ou criação de conta

↓

Aceita convite

↓

CompanyUser criado

↓

Acesso à empresa
```

---

# 35. Usuário Existente

Se o email já possuir conta:

```text
Login

↓

Aceitar convite

↓

Adicionar associação à empresa
```

Não criar uma nova conta.

---

# 36. Usuário Novo

Se o email ainda não possuir conta:

```text
Convite

↓

Criar conta

↓

Confirmar email

↓

Aceitar convite
```

---

# 37. Expiração de Convite

Convites deverão possuir validade.

Convites expirados:

```text
não podem ser aceitos
```

O administrador poderá:

```text
Reenviar convite
```

ou:

```text
Cancelar convite
```

---

# 38. Cancelamento de Convite

Um convite pendente poderá ser cancelado pelo administrador autorizado.

O link anterior deverá deixar de funcionar.

---

# 39. Remoção de Usuário

Remover usuário de uma empresa não significa necessariamente excluir sua conta global.

Exemplo:

```text
User

├── Company A
└── Company B
```

Remover de Company A:

```text
Company A → removido

Company B → permanece
```

---

# 40. Último Administrador

Uma empresa não deverá ficar sem administrador.

Não permitir remover ou desativar o último administrador sem:

```text
transferência de responsabilidade
```

---

# 41. Desativação

Usuários poderão ser desativados dentro de uma empresa.

Exemplo:

```text
company_users.active = false
```

Isso remove o acesso àquela empresa sem necessariamente excluir a conta global.

---

# 42. Exclusão da Conta

A exclusão da conta global deverá ser tratada como operação crítica.

Fluxo futuro:

```text
Solicitação

↓

Confirmação

↓

Verificação

↓

Anonimização/exclusão

↓

Revogação das sessões
```

A implementação completa deverá considerar LGPD e será detalhada em documentação de segurança.

---

# 43. Alteração de Email

Alterações de email deverão utilizar o fluxo seguro fornecido pelo provedor de autenticação.

Após alteração:

```text
novo email
        ↓
verificação
        ↓
atualização
```

---

# 44. Alteração de Senha

Usuário autenticado poderá alterar a senha.

Fluxo:

```text
Senha atual

Nova senha

Confirmar nova senha

↓

Atualizar
```

Quando possível, exigir reautenticação para operações sensíveis.

---

# 45. Reautenticação

Operações críticas poderão exigir confirmação adicional.

Exemplos:

- alteração de email;
- alteração de senha;
- exclusão da conta;
- operações administrativas críticas;
- alteração de configurações de segurança.

---

# 46. Login Google

O Google OAuth deverá utilizar:

```text
Supabase Auth
```

Nunca implementar OAuth manualmente se o provider já oferece integração segura.

---

# 47. Conta Google + Email

O sistema deverá evitar criação acidental de contas duplicadas quando o mesmo usuário utilizar:

```text
email/password
```

e:

```text
Google
```

A estratégia de vinculação deverá ser definida conforme os mecanismos de identidade suportados pelo Supabase.

---

# 48. Avatar

Quando disponível através do provider:

```text
Google profile image
```

poderá ser utilizado como avatar inicial.

O usuário poderá posteriormente alterar o avatar.

---

# 49. Segurança do Frontend

Nunca armazenar em:

```text
localStorage
```

dados sensíveis que não sejam estritamente necessários.

Nunca armazenar:

```text
password
private API keys
service role keys
secrets
```

no frontend.

---

# 50. Supabase Service Role

A chave:

```text
SUPABASE_SERVICE_ROLE_KEY
```

nunca poderá ser enviada ao navegador.

Ela deverá permanecer exclusivamente em ambiente seguro de servidor/Edge Function quando necessária.

---

# 51. Public Anon Key

A chave pública do Supabase poderá ser utilizada no frontend conforme a arquitetura oficial do Supabase.

Porém:

```text
public key ≠ autorização
```

A proteção real deverá ocorrer através de:

```text
Auth
+
RLS
+
Policies
```

---

# 52. Rate Limiting

Operações relacionadas à autenticação deverão possuir proteção contra abuso.

Especialmente:

```text
Login

Cadastro

Reset password

Reenvio de email

Convites
```

A implementação poderá utilizar os mecanismos disponíveis no Supabase e infraestrutura complementar.

---

# 53. Brute Force

O sistema deverá possuir proteção contra tentativas excessivas de login.

Nunca implementar simplesmente:

```text
tentativas ilimitadas
```

---

# 54. Sessões Suspeitas

A arquitetura deverá permitir futuramente:

```text
Lista de sessões

Dispositivos

Último acesso

Localização aproximada

Revogar sessões
```

---

# 55. MFA

MFA não será obrigatório no MVP.

A arquitetura deverá estar preparada para:

```text
TOTP
Authenticator Apps
WebAuthn/Passkeys
```

MFA poderá ser obrigatório futuramente para:

```text
Global Admin
```

e opcional ou obrigatório em planos avançados.

---

# 56. Global Admin

O acesso de Global Admin deverá possuir proteção superior.

Recomendação futura:

```text
MFA obrigatório

Reautenticação

Auditoria

Sessões controladas
```

---

# 57. Primeiro Global Admin

A criação de Global Admin não deverá ser feita através de cadastro público.

Deverá existir mecanismo administrativo seguro para provisionamento.

---

# 58. Account Enumeration

O sistema deverá evitar revelar:

- quais emails estão cadastrados;
- quais contas existem;
- quais usuários pertencem a empresas.

Mensagens públicas deverão ser genéricas quando apropriado.

---

# 59. Erros

Erros de autenticação deverão ser tratados de forma amigável.

Exemplos:

```text
Não foi possível entrar.

Seu email ou senha estão incorretos.

Não foi possível concluir o cadastro.

O link de recuperação expirou.
```

Nunca exibir stack traces para usuários.

---

# 60. Auditoria

Eventos importantes de autenticação deverão ser registrados quando aplicável.

Exemplos:

```text
login.success

login.failed

logout

password.reset_requested

password.changed

email.changed

oauth.login

invite.created

invite.accepted

invite.cancelled
```

---

# 61. Segurança do Audit Log

Logs de autenticação não deverão ser manipuláveis por usuários comuns.

O usuário não poderá:

```text
UPDATE audit_logs
DELETE audit_logs
```

---

# 62. Onboarding e Limites

Após criação da conta, o sistema deverá verificar limites do plano.

Exemplo:

```text
Plano Free

max_companies = 3
```

O usuário poderá criar empresas enquanto:

```text
current_companies < max_companies
```

---

# 63. Conta Sem Empresa

É permitido existir um usuário autenticado sem empresa durante o onboarding.

Porém, o usuário não poderá acessar recursos administrativos de uma empresa até possuir uma associação válida.

---

# 64. Usuário com Várias Empresas

O sistema deverá suportar:

```text
1 usuário
+
N empresas
```

Dentro dos limites do plano.

---

# 65. Estado de Autenticação

A aplicação deverá reconhecer pelo menos:

```text
loading

unauthenticated

authenticated

email_unverified

onboarding

authenticated_without_company
```

---

# 66. Loading Inicial

Durante inicialização:

```text
Verificar sessão

↓

Verificar usuário

↓

Verificar empresas

↓

Determinar rota
```

Evitar mostrar momentaneamente uma página de login para um usuário que ainda está sendo carregado.

---

# 67. Guardas de Rota

A aplicação deverá possuir mecanismos centralizados para:

```text
RequireAuth
RequireCompany
RequireRole
```

Exemplo conceitual:

```text
RequireAuth
    ↓
RequireCompany
    ↓
RequirePermission
    ↓
Page
```

---

# 68. Deep Links

Usuários autenticados deverão poder acessar diretamente URLs internas.

Exemplo:

```text
/products/abc123
```

O sistema deverá:

1. validar sessão;
2. validar empresa;
3. validar permissão;
4. carregar recurso.

---

# 69. Expiração de Sessão

Caso a sessão expire:

```text
API request

↓

Unauthorized

↓

Tentar refresh quando aplicável

↓

Se falhar

↓

Logout

↓

Login
```

Evitar loops infinitos.

---

# 70. Logout Global

Futuramente o usuário poderá possuir:

```text
Sair de todos os dispositivos
```

Isso deverá revogar sessões existentes quando suportado pelo provider.

---

# 71. Segurança de Links

Links de:

- recuperação;
- convite;
- confirmação;

não deverão expor informações desnecessárias.

Nunca colocar:

```text
password
secret
access token permanente
```

em parâmetros públicos.

---

# 72. Testes Obrigatórios

A autenticação deverá possuir testes para:

### Cadastro

- cadastro válido;
- email inválido;
- senha inválida;
- email duplicado.

### Login

- credenciais válidas;
- credenciais inválidas;
- sessão persistida.

### Recuperação

- solicitação válida;
- token expirado;
- senha atualizada.

### Google

- login;
- callback;
- usuário existente;
- usuário novo.

### Multiempresa

- usuário com uma empresa;
- usuário com várias empresas;
- usuário sem empresa.

### Convites

- convite válido;
- convite expirado;
- convite cancelado;
- convite para usuário existente;
- convite para usuário novo.

---

# 73. Definition of Done

A autenticação será considerada pronta quando:

- cadastro funcionar;
- login funcionar;
- logout funcionar;
- Google OAuth funcionar;
- recuperação de senha funcionar;
- verificação de email funcionar;
- sessão funcionar;
- proteção de rotas funcionar;
- onboarding funcionar;
- criação inicial da empresa funcionar;
- troca de empresa funcionar;
- convites funcionarem;
- usuários puderem ser removidos de uma empresa;
- último administrador for protegido;
- RLS estiver alinhado ao modelo de identidade;
- credenciais privadas não estiverem expostas;
- testes principais estiverem implementados.

---

# 74. Fora do Escopo do Documento

Não definir aqui:

- permissões detalhadas;
- RBAC completo;
- ABAC;
- regras de acesso a produtos;
- regras de estoque;
- regras do catálogo.

Esses assuntos pertencem a:

```text
04-PERMISSIONS.md
```

---

# 75. Próximo Documento

```text
04-PERMISSIONS.md
```

O próximo documento deverá definir detalhadamente o modelo de autorização do MarketFlow:

- Global Admin;
- Admin;
- Estoque;
- Visitante;
- permissões por recurso;
- permissões por ação;
- RBAC;
- RLS;
- matriz de permissões;
- acesso multiempresa;
- convites;
- delegação;
- proteção de operações críticas.