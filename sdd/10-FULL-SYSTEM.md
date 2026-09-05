"10-UX.md": """# 10 — UX

## Objetivo
Definir uma experiência simples, rápida, responsiva e fácil de entender para pequenos comércios.

## Diretrizes básicas
- Mobile-first e responsivo.
- PT-BR como idioma principal, preparado para EN/ES.
- Navegação simples e consistente.
- Evitar excesso de telas, campos e configurações.
- Toda ação deve possuir estados de carregamento, sucesso e erro.
- Filtros e paginação devem ser refletidos na URL quando aplicável.
- Não permitir scroll horizontal global.
- Respeitar permissões e contexto da empresa atual.
- Priorizar ações frequentes: cadastrar produto, consultar estoque, editar preço e publicar catálogo.

## Fluxos principais
1. Cadastro/login.
2. Criação da primeira empresa.
3. Cadastro de produto.
4. Entrada/ajuste de estoque.
5. Consulta de produtos e estoque.
6. Publicação do catálogo.
7. Uso das funções de IA.

## Regra para a IA de implementação
Use este documento como direção de UX e complete os fluxos, estados, componentes e detalhes de interação necessários, mantendo a simplicidade e o escopo do projeto.
""",

"11-COMPONENTS.md": """# 11 — COMPONENTS

## Objetivo
Criar uma biblioteca de componentes reutilizáveis para manter consistência visual e funcional.

## Componentes básicos
- Button
- Input
- Select
- Combobox
- Checkbox
- Switch
- Textarea
- Date Picker
- Dialog
- Drawer
- Dropdown
- Tooltip
- Toast
- Alert
- Badge
- Card
- Table
- Pagination
- Tabs
- Breadcrumb
- Sidebar
- Header
- Company Switcher
- Search
- Filters
- Empty State
- Loading State
- Error State
- Confirm Dialog
- File/Image Upload

## Regras
- Usar shadcn/ui, Radix e Tailwind.
- Componentes devem ser acessíveis.
- Criar variantes para estados comuns.
- Evitar duplicação de componentes.
- Componentes de domínio devem reutilizar os componentes base.

## Regra para a IA de implementação
Analise o projeto existente e complete os componentes necessários, mantendo uma arquitetura reutilizável e consistente com o Design System.
""",

"12-LANDING_PAGE.md": """# 12 — LANDING PAGE

## Objetivo
Apresentar o MarketFlow e converter visitantes em novos usuários.

## Estrutura básica
- Header.
- Hero.
- Principais benefícios.
- Funcionalidades.
- Como funciona.
- Recursos de IA.
- Catálogo público.
- Benefícios para pequenos comércios.
- CTA para cadastro.
- Planos ou indicação do plano gratuito.
- FAQ.
- Footer.

## Mensagem principal
Uma plataforma simples para organizar produtos, preços, estoque e catálogo, com recursos de IA para reduzir trabalho manual.

## CTAs
- Criar conta grátis.
- Entrar.
- Conhecer funcionalidades.

## Regra para a IA de implementação
Criar uma landing page profissional, responsiva, rápida e orientada à conversão, completando copy, layout, SEO e detalhes visuais conforme o contexto do produto.
""",

"13-DASHBOARD.md": """# 13 — DASHBOARD

## Objetivo
Ser a visão inicial da empresa após o login.

## Informações principais
- Produtos cadastrados.
- Produtos com estoque baixo.
- Produtos próximos do vencimento.
- Valor ou resumo do estoque quando apropriado.
- Atividades recentes.
- Solicitações do catálogo.
- Uso de IA.
- Alertas importantes.

## Ações rápidas
- Novo produto.
- Entrada de estoque.
- Ajustar estoque.
- Abrir catálogo.
- Usar IA.

## Regras
- Mostrar somente dados da empresa atual.
- Respeitar permissões.
- Ser útil também em telas pequenas.
- Evitar excesso de gráficos.
- Permitir evolução futura para métricas e relatórios.

## Regra para a IA de implementação
Definir os cards, indicadores, consultas, estados e visualizações necessárias com base no banco e nas demais especificações.
""",

"14-PRODUCT.md": """# 14 — PRODUCT

## Objetivo
Gerenciar o cadastro dos produtos da empresa.

## Básico
- Listar produtos.
- Pesquisar e filtrar.
- Criar produto.
- Editar produto.
- Visualizar produto.
- Ativar/inativar.
- Imagens.
- Categoria.
- Marca.
- Fabricante.
- Fornecedor.
- SKU/barcode.
- Unidade.
- Preço de custo.
- Preço de venda.
- Preço promocional.
- Estoque mínimo/máximo.
- Visibilidade no catálogo.

## Regras
- Produto pertence a uma empresa.
- Validar dados no frontend e backend.
- Preços não podem ser negativos.
- SKU/barcode devem respeitar unicidade por empresa quando informados.
- Controle de acesso por papel/permissão.
- Alterações relevantes devem ser auditáveis.

## Regra para a IA de implementação
Completar formulário, tabela, detalhes, validações, filtros, estados e integrações com estoque, catálogo e IA.
""",

"15-CATEGORY.md": """# 15 — CATEGORY

## Objetivo
Organizar produtos por categorias.

## Básico
- Listar.
- Criar.
- Editar.
- Ativar/inativar.
- Excluir logicamente quando apropriado.
- Pesquisar.
- Hierarquia opcional de categorias.

## Regras
- Categoria pertence à empresa.
- Não permitir categoria como própria categoria pai.
- Não permitir acesso entre empresas.
- Produtos devem poder ser associados a uma categoria.

## Regra para a IA de implementação
Completar CRUD, validações, UX, permissões e relacionamento com produtos.
""",

"16-BRAND.md": """# 16 — BRAND

## Objetivo
Gerenciar marcas utilizadas nos produtos.

## Básico
- Nome.
- Logo opcional.
- Descrição.
- Fabricante opcional.
- Status ativo/inativo.
- Listagem, busca, criação e edição.

## Regras
- Marca pertence à empresa.
- Evitar duplicidades relevantes.
- Relacionar marca com produtos.

## Regra para a IA de implementação
Completar CRUD, validações, permissões e integração com produtos e fabricantes.
""",

"17-MANUFACTURER.md": """# 17 — MANUFACTURER

## Objetivo
Gerenciar fabricantes dos produtos.

## Básico
- Nome.
- Documento opcional.
- E-mail.
- Telefone.
- Website.
- Observações.
- Status.

## Regras
- Fabricante pertence à empresa.
- Relacionar fabricante com marcas e produtos.
- Validar dados quando informados.

## Regra para a IA de implementação
Completar CRUD, UX, validações, permissões e relacionamentos.
""",

"18-SUPPLIER.md": """# 18 — SUPPLIER

## Objetivo
Gerenciar fornecedores.

## Básico
- Nome.
- Razão social.
- CNPJ.
- E-mail.
- Telefone/WhatsApp.
- Contato.
- Endereço.
- Observações.
- Status.

## Regras
- Fornecedor pertence à empresa.
- Pode ser relacionado aos produtos e lotes.
- Dados sensíveis/internos não aparecem no catálogo público.

## Regra para a IA de implementação
Completar CRUD, validações, filtros, permissões e relacionamentos com produtos e estoque.
""",

"19-INVENTORY.md": """# 19 — INVENTORY

## Objetivo
Controlar o estoque de produtos.

## Básico
- Saldo atual.
- Estoque disponível.
- Entrada.
- Saída.
- Ajuste.
- Perda.
- Inventário.
- Histórico de movimentações.
- Estoque mínimo/máximo.
- Alertas de estoque baixo.

## Regras
- Produto e estoque são conceitos separados.
- Movimentações não devem ser apagadas.
- Correções devem gerar ajustes.
- Operações de estoque devem ser transacionais.
- Quantidades devem suportar casas decimais.
- Controle por empresa e permissão.

## Regra para a IA de implementação
Completar telas, fluxo de movimentação, validações, concorrência, histórico e integração com lotes.
""",

"20-LOTS.md": """# 20 — LOTS

## Objetivo
Controlar lotes e validade dos produtos.

## Básico
- Número do lote.
- Produto.
- Fornecedor.
- Data de fabricação.
- Data de validade.
- Quantidade inicial.
- Quantidade atual.
- Custo.
- Status de validade.

## Regras
- Lote pertence à empresa e a um produto.
- Destacar produtos próximos do vencimento.
- Produtos vencidos não devem ser tratados como estoque disponível normal.
- Movimentações devem poder referenciar lote.

## Regra para a IA de implementação
Definir regras de validade, filtros, alertas, UX e integração com estoque.
""",

"21-CATALOG.md": """# 21 — CATALOG

## Objetivo
Permitir que a empresa escolha quais produtos serão publicados no catálogo público.

## Básico
- Ativar/desativar catálogo.
- Selecionar produtos.
- Organizar categorias.
- Definir ordem.
- Destacar produtos.
- Mostrar/ocultar preço.
- Permitir/impedir contato.
- Configurar telefone, WhatsApp e e-mail.
- Mensagem de apresentação.
- Pré-visualização.

## Regras
- Produto precisa estar ativo e publicado para aparecer.
- Nunca expor custo, margem, fornecedor, usuários, auditoria ou dados internos.
- Catálogo deve possuir URL pública por slug da empresa.

## Regra para a IA de implementação
Completar editor do catálogo, publicação, preview, regras de exposição e integração com a loja pública.
""",

"22-PUBLIC_STORE.md": """# 22 — PUBLIC STORE

## Objetivo
Criar uma vitrine pública simples para cada empresa.

## Básico
- Logo e identidade da empresa.
- Nome e descrição.
- Categorias.
- Produtos.
- Preços quando habilitados.
- Busca.
- Produtos em destaque.
- Contato/WhatsApp.
- Solicitação de produtos.

## Regras
- Não exige login do visitante.
- Mostrar apenas conteúdo publicado.
- Interface mobile-first.
- URL pública baseada no slug.
- Proteger contra abuso e excesso de requisições.
- Não revelar informações internas.

## Regra para a IA de implementação
Criar a experiência completa da loja pública, incluindo SEO básico, responsividade, estados, acessibilidade e fluxo de contato.
""",

"23-USERS.md": """# 23 — USERS

## Objetivo
Gerenciar usuários e acessos das empresas.

## Papéis
- Global Admin.
- Admin.
- Stock.
- Visitor.

## Básico
- Listar usuários da empresa.
- Convidar usuário.
- Alterar papel.
- Ativar/inativar acesso.
- Remover usuário da empresa.
- Visualizar status.

## Regras
- Um usuário pode pertencer a várias empresas.
- Papel pertence ao vínculo usuário + empresa.
- Não permitir autoelevação de privilégio.
- Proteger o último Admin.
- Global Admin possui escopo da plataforma.

## Regra para a IA de implementação
Completar convites, gestão de acesso, permissões, estados e integração com Auth/RLS.
""",

"24-COMPANY.md": """# 24 — COMPANY

## Objetivo
Gerenciar empresas/tenants do MarketFlow.

## Básico
- Nome.
- Razão social.
- CNPJ.
- Slug.
- Logo.
- E-mail.
- Telefone.
- WhatsApp.
- Descrição.
- Status.

## Regras
- Empresa é o tenant principal do MVP.
- Usuários podem pertencer a várias empresas.
- Slug deve ser único.
- Dados da empresa devem ser isolados por RLS.
- Preparar arquitetura para futuras filiais sem implementá-las agora.
- Free plan inicialmente permite até 3 empresas por usuário.

## Regra para a IA de implementação
Completar onboarding, edição, troca de empresa, validações, permissões e integração com assinatura/limites.
""",

"25-AI.md": """# 25 — AI

## Objetivo
Usar IA para reduzir trabalho manual sem transformar a IA em fonte autoritativa dos dados.

## Funcionalidades iniciais
- Reconhecimento de produto por foto.
- Sugestão de nome, categoria, marca e fabricante.
- OCR quando necessário.
- Reconhecimento superficial de produtos em prateleiras.
- Sugestões para cadastro.

## Regra principal
Fluxo preferencial:
Imagem/entrada → IA → resultado + confiança → revisão humana → salvar.

## Segurança
- Autenticação e autorização.
- Limites de uso.
- Rate limiting.
- Auditoria.
- Validação do resultado.
- Não executar instruções vindas da saída da IA.
- Não permitir que IA altere dados críticos sem confirmação.

## Regra para a IA de implementação
Escolher a melhor arquitetura de provider, jobs, armazenamento, prompts, schemas, confiança, erros e custos, mantendo o humano no controle.
""",

"26-NOTIFICATIONS.md": """# 26 — NOTIFICATIONS

## Objetivo
Centralizar alertas relevantes do sistema.

## Notificações iniciais
- Estoque baixo.
- Produto próximo do vencimento.
- Produto vencido.
- Solicitação do catálogo.
- Convite de usuário.
- Falha em processamento de IA.
- Eventos importantes do sistema.

## Canais
Inicialmente:
- Notificação dentro da aplicação.

Preparar arquitetura para:
- E-mail.
- WhatsApp.
- Push.

## Regras
- Usuário deve visualizar somente notificações permitidas no seu contexto.
- Evitar excesso de notificações.
- Permitir marcar como lida.
- Registrar data e origem.

## Regra para a IA de implementação
Definir modelo de dados, prioridade, agrupamento, preferências, UI e futura arquitetura multicanal.
""",

"27-REPORTS.md": """# 27 — REPORTS

## Objetivo
Preparar relatórios simples para apoiar decisões sem transformar o MVP em um ERP.

## Relatórios iniciais
- Produtos.
- Estoque.
- Estoque baixo.
- Validade.
- Movimentações.
- Catálogo.
- Solicitações.

## Básico
- Filtros.
- Período quando aplicável.
- Ordenação.
- Paginação.
- Exportação futura para CSV/XLSX/PDF.

## Regra para a IA de implementação
Propor os relatórios de maior valor, consultas eficientes, filtros, permissões e exportações, mantendo o escopo simples.
""",

"28-BILLING.md": """# 28 — BILLING

## Objetivo
Preparar o sistema para monetização sem tornar pagamentos dependência do MVP.

## Planos
- Free.
- Basic futuro.
- Pro futuro.
- Business futuro.
- Enterprise futuro.

## Free inicial
- Até 3 empresas.
- Até 100 produtos por empresa.
- Até 3 usuários por empresa.
- Catálogo público.
- Estoque e lotes.
- IA limitada.

## Regras
- Limites configuráveis no banco.
- Backend deve aplicar limites.
- Frontend apenas informa o limite.
- Downgrade não deve apagar dados.
- Pagamentos ficam para etapa posterior.
- Preparar abstração para gateway e webhooks.

## Regra para a IA de implementação
Completar arquitetura de planos, limites, entitlements, subscriptions e futura integração de pagamento sem implementar gateway no MVP.
""",

"29-BACKLOG.md": """# 29 — BACKLOG

## Objetivo
Manter a evolução do MarketFlow organizada e evitar feature creep.

## Prioridades
- P0: obrigatório para funcionamento/MVP.
- P1: alto valor após MVP.
- P2: evolução.
- P3: futuro.

## MVP
- Landing page.
- Auth.
- Google OAuth.
- Empresas.
- Multiempresa.
- IAM/RBAC.
- Categorias.
- Marcas.
- Fabricantes.
- Fornecedores.
- Produtos.
- Imagens.
- Estoque básico.
- Lotes/validade.
- Catálogo público.
- Solicitações básicas.
- IA de cadastro de produto.

## Futuro
- PDV.
- Fiscal.
- Financeiro.
- Filiais.
- API pública.
- Integrações.
- AI Copilot.
- Automações.
- Billing/pagamentos.
- Recursos Enterprise.

## Regra para a IA de implementação
Analise todos os documentos do projeto antes de criar tarefas. Identifique dependências, lacunas e conflitos. Priorize segurança, multi-tenant, RLS, valor para o usuário e simplicidade. Não implemente funcionalidades futuras sem decisão explícita.