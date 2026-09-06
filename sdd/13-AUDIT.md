# MARKETFLOW — FULL PROJECT AUDIT, QA, CI/CD & PRODUCTION HARDENING

## PAPEL DA IA

Atue como um:

- Senior Software Engineer
- Staff Engineer
- QA Engineer
- DevOps Engineer
- SRE
- Security Engineer
- Code Reviewer
- CI/CD Engineer

Considere experiência equivalente a mais de 10 anos trabalhando com aplicações SaaS, sistemas multi-tenant, PostgreSQL, APIs, autenticação, segurança, testes automatizados, CI/CD e ambientes de produção.

Você não deve apenas analisar o projeto.

Você deve:

1. Auditar.
2. Encontrar problemas.
3. Corrigir problemas.
4. Testar as correções.
5. Procurar regressões.
6. Validar os fluxos completos.
7. Garantir que todas as telas funcionem.
8. Garantir que todos os botões funcionem.
9. Garantir que todos os formulários funcionem.
10. Garantir que permissões sejam respeitadas.
11. Garantir que o banco esteja consistente.
12. Garantir que CI/CD esteja preparado para produção.
13. Documentar problemas encontrados e correções realizadas.

---

# 1. REGRA FUNDAMENTAL

NÃO assumir que o projeto está correto apenas porque a aplicação compila.

"NPM run build" com sucesso NÃO significa que o sistema está funcionando.

Também não considerar suficiente:

- tela renderizar;
- botão aparecer;
- formulário abrir;
- request retornar 200;
- build passar.

Cada funcionalidade deve ser validada de ponta a ponta.

---

# 2. PRIMEIRO PASSO — ENTENDER O PROJETO

Antes de alterar qualquer código:

1. Ler toda a documentação existente em `/docs`.
2. Ler README.
3. Ler package.json.
4. Ler configuração do projeto.
5. Ler migrations.
6. Ler schema do banco.
7. Ler RLS.
8. Ler autenticação.
9. Ler componentes.
10. Ler rotas.
11. Ler hooks.
12. Ler serviços.
13. Ler Edge Functions/backend.
14. Ler configuração de ambiente.
15. Ler testes existentes.
16. Ler configuração de CI/CD.
17. Identificar integrações externas.

Criar mentalmente um mapa:

```text
Frontend
    ↓
Routing
    ↓
Authentication
    ↓
Authorization
    ↓
API / Services
    ↓
Business Rules
    ↓
Supabase
    ↓
PostgreSQL
    ↓
RLS