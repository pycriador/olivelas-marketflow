# MARKETFLOW — IAM COMPLETO, TEMAS, CRUD E INTERNACIONALIZAÇÃO

## Objetivo

Evoluir o MarketFlow para uma aplicação SaaS completa, segura, multiempresa e preparada para crescimento.

A IA responsável pela implementação deve:

1. Implementar IAM completo.
2. Garantir isolamento multi-tenant.
3. Implementar CRUD completo em todas as entidades administrativas e operacionais.
4. Criar 20 temas visuais, sendo 10 claros e 10 escuros.
5. Implementar seletor de idioma PT-BR, EN e ES.
6. Revisar a aplicação inteira antes de implementar.
7. Identificar lacunas, inconsistências e funcionalidades ausentes nos documentos existentes.
8. Não substituir decisões arquiteturais já definidas sem justificar a alteração.

---

# 1. REGRA PRINCIPAL

Antes de escrever código:

- Ler todos os documentos existentes em `/docs`.
- Identificar o que já está implementado.
- Comparar documentação x banco x frontend x backend.
- Identificar funcionalidades faltantes.
- Preservar a arquitetura existente.
- Não criar mocks onde a funcionalidade real já estiver especificada.
- Não duplicar tabelas ou componentes.
- Não remover funcionalidades existentes.
- Não alterar RLS de maneira insegura.
- Não confiar no frontend para autorização.
- Não criar permissões somente no frontend.
- Não permitir acesso cross-tenant.
- Criar migrations para alterações de banco.
- Atualizar documentação quando uma decisão arquitetural for tomada.

A IA deve agir como:

- Software Architect
- Security Engineer
- Product Engineer
- UX Engineer
- Database Engineer

---

# 2. IAM COMPLETO

## 2.1 Objetivo

Implementar um IAM completo para usuários, empresas, grupos, papéis, permissões, sessões, convites, auditoria e controle de acesso.

O IAM deve funcionar em conjunto com:

- Supabase Auth
- PostgreSQL
- RLS
- RBAC
- Multi-tenant
- Auditoria

---

# 3. MODELO DE IDENTIDADE

## Usuário global

O usuário é uma identidade global da plataforma.

Um mesmo usuário pode pertencer a várias empresas.

Exemplo:

```text
Usuário
 ├── Empresa A → Admin
 ├── Empresa B → Stock
 └── Empresa C → Visitor