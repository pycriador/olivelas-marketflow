export type Language = 'pt-BR' | 'en' | 'es';

export interface TranslationDictionary {
  // Common UI
  dashboard: string;
  products: string;
  categories: string;
  brands: string;
  manufacturers: string;
  suppliers: string;
  inventory: string;
  lots: string;
  movements: string;
  catalog: string;
  catalogRequests: string;
  aiAssistant: string;
  reports: string;
  audit: string;
  users: string;
  companyData: string;
  platformSaaS: string;
  notifications: string;
  invitations: string;
  sessions: string;
  permissionsMatrix: string;

  // Actions
  save: string;
  cancel: string;
  edit: string;
  delete: string;
  create: string;
  search: string;
  filter: string;
  exportCSV: string;
  importCSV: string;
  printLabels: string;
  back: string;
  confirm: string;
  logout: string;
  switchCompany: string;
  changeTheme: string;
  changeLanguage: string;

  // Badges & Roles
  globalAdmin: string;
  admin: string;
  stock: string;
  visitor: string;
  active: string;
  inactive: string;
  lowStock: string;
  expiring: string;
  expired: string;

  // General Messages
  welcome: string;
  smartManagement: string;
  totalProducts: string;
  availableStock: string;
  quickActions: string;
  newProduct: string;
  aiScan: string;
  catalogPublic: string;
}

export const translations: Record<Language, TranslationDictionary> = {
  'pt-BR': {
    dashboard: 'Dashboard',
    products: 'Produtos',
    categories: 'Categorias',
    brands: 'Marcas',
    manufacturers: 'Fabricantes',
    suppliers: 'Fornecedores',
    inventory: 'Saldos & Estoque',
    lots: 'Lotes & Validades',
    movements: 'Movimentações',
    catalog: 'Catálogo Digital',
    catalogRequests: 'Solicitações de Clientes',
    aiAssistant: 'Assistente de IA',
    reports: 'Relatórios Operacionais',
    audit: 'Trilha de Auditoria',
    users: 'Usuários & Acessos',
    companyData: 'Dados da Empresa',
    platformSaaS: 'Plataforma SaaS',
    notifications: 'Notificações',
    invitations: 'Convites Pendentes',
    sessions: 'Sessões Ativas',
    permissionsMatrix: 'Matriz de Permissões',

    save: 'Salvar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Excluir',
    create: 'Cadastrar',
    search: 'Buscar...',
    filter: 'Filtrar',
    exportCSV: 'Exportar CSV',
    importCSV: 'Importar Planilha',
    printLabels: 'Etiquetas & Barcode',
    back: 'Voltar',
    confirm: 'Confirmar',
    logout: 'Sair da conta',
    switchCompany: 'Trocar Empresa',
    changeTheme: 'Alternar Tema',
    changeLanguage: 'Idioma',

    globalAdmin: 'Administrador Global',
    admin: 'Administrador',
    stock: 'Estoque',
    visitor: 'Leitura',
    active: 'Ativo',
    inactive: 'Inativo',
    lowStock: 'Estoque Baixo',
    expiring: 'Vencendo',
    expired: 'Vencido',

    welcome: 'Bem-vindo ao MarketFlow',
    smartManagement: 'Gestão Inteligente para Pequenos Comércios',
    totalProducts: 'Total de Produtos',
    availableStock: 'Estoque Disponível',
    quickActions: 'Ações Rápidas',
    newProduct: 'Novo Produto',
    aiScan: 'Cadastrar por Foto',
    catalogPublic: 'Ver Vitrine Pública',
  },
  'en': {
    dashboard: 'Dashboard',
    products: 'Products',
    categories: 'Categories',
    brands: 'Brands',
    manufacturers: 'Manufacturers',
    suppliers: 'Suppliers',
    inventory: 'Stock & Inventory',
    lots: 'Batches & Expiration',
    movements: 'Stock Movements',
    catalog: 'Digital Catalog',
    catalogRequests: 'Customer Requests',
    aiAssistant: 'AI Assistant',
    reports: 'Operational Reports',
    audit: 'Audit Trail',
    users: 'Users & Permissions',
    companyData: 'Company Settings',
    platformSaaS: 'SaaS Platform',
    notifications: 'Notifications',
    invitations: 'Pending Invitations',
    sessions: 'Active Sessions',
    permissionsMatrix: 'Permissions Matrix',

    save: 'Save',
    cancel: 'Cancel',
    edit: 'Edit',
    delete: 'Delete',
    create: 'Add New',
    search: 'Search...',
    filter: 'Filter',
    exportCSV: 'Export CSV',
    importCSV: 'Import Spreadsheet',
    printLabels: 'Print Labels & Barcode',
    back: 'Back',
    confirm: 'Confirm',
    logout: 'Log out',
    switchCompany: 'Switch Store',
    changeTheme: 'Change Theme',
    changeLanguage: 'Language',

    globalAdmin: 'Global Admin',
    admin: 'Administrator',
    stock: 'Stock Staff',
    visitor: 'Read Only',
    active: 'Active',
    inactive: 'Inactive',
    lowStock: 'Low Stock',
    expiring: 'Expiring Soon',
    expired: 'Expired',

    welcome: 'Welcome to MarketFlow',
    smartManagement: 'Smart Management for Retail Shops',
    totalProducts: 'Total Products',
    availableStock: 'Available Stock',
    quickActions: 'Quick Actions',
    newProduct: 'New Product',
    aiScan: 'Scan Photo with AI',
    catalogPublic: 'View Storefront',
  },
  'es': {
    dashboard: 'Panel Principal',
    products: 'Productos',
    categories: 'Categorías',
    brands: 'Marcas',
    manufacturers: 'Fabricantes',
    suppliers: 'Proveedores',
    inventory: 'Saldos y Inventario',
    lots: 'Lotes y Vencimiento',
    movements: 'Movimientos de Stock',
    catalog: 'Catálogo Digital',
    catalogRequests: 'Solicitudes de Clientes',
    aiAssistant: 'Asistente de IA',
    reports: 'Informes Operativos',
    audit: 'Registro de Auditoría',
    users: 'Usuarios y Accesos',
    companyData: 'Datos de la Empresa',
    platformSaaS: 'Plataforma SaaS',
    notifications: 'Notificaciones',
    invitations: 'Invitaciones Pendientes',
    sessions: 'Sesiones Activas',
    permissionsMatrix: 'Matriz de Permisos',

    save: 'Guardar',
    cancel: 'Cancelar',
    edit: 'Editar',
    delete: 'Eliminar',
    create: 'Registrar',
    search: 'Buscar...',
    filter: 'Filtrar',
    exportCSV: 'Exportar CSV',
    importCSV: 'Importar Planilla',
    printLabels: 'Etiquetas y Código de Barras',
    back: 'Volver',
    confirm: 'Confirmar',
    logout: 'Cerrar Sesión',
    switchCompany: 'Cambiar Empresa',
    changeTheme: 'Cambiar Tema',
    changeLanguage: 'Idioma',

    globalAdmin: 'Administrador Global',
    admin: 'Administrador',
    stock: 'Inventario',
    visitor: 'Lectura',
    active: 'Activo',
    inactive: 'Inactivo',
    lowStock: 'Stock Bajo',
    expiring: 'Por Vencer',
    expired: 'Vencido',

    welcome: 'Bienvenido a MarketFlow',
    smartManagement: 'Gestión Inteligente para Pequeños Comercios',
    totalProducts: 'Total de Productos',
    availableStock: 'Stock Disponible',
    quickActions: 'Acciones Rápidas',
    newProduct: 'Nuevo Producto',
    aiScan: 'Registrar con Fotos e IA',
    catalogPublic: 'Ver Tienda Pública',
  },
};
