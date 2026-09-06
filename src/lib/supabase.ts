import { createClient } from '@supabase/supabase-js';
import { Company, CompanyUser, Product, Category, Brand, Manufacturer, Supplier, Lot, InventoryItem, InventoryMovement } from '../types';
import { REAL_COMPANY, getRealCategories, getRealBrands, getRealProducts } from './real-basket-data';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY || 'placeholder-anon-key';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const isSupabaseConfigured = () => {
  return (
    supabaseUrl !== 'https://placeholder.supabase.co' &&
    supabaseAnonKey !== 'placeholder-anon-key'
  );
};

// Dados Reais da Empresa "Cestas de Café da Manhã"
export const mockCompanies: Company[] = [
  REAL_COMPANY,
  {
    id: 'comp-2',
    name: 'Adega & Conveniência Gourmet',
    legal_name: 'Adega Gourmet Eireli',
    cnpj: '98.765.432/0001-10',
    slug: 'adega-gourmet',
    email: 'contato@adegagourmet.com',
    phone: '(11) 91234-5678',
    whatsapp: '5511912345678',
    description: 'Bebidas geladas, aperitivos e conveniência.',
    breakfast_basket_enabled: false,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockUserCompanies: CompanyUser[] = [
  {
    id: 'cu-admin-global',
    company_id: REAL_COMPANY.id,
    user_id: 'user-willian-global',
    role: 'global_admin',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: REAL_COMPANY,
    profile: {
      id: 'user-willian-global',
      full_name: 'Willian Oliveira (Global Admin)',
      phone: '(11) 96382-0374',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    },
  },
  {
    id: 'cu-1',
    company_id: REAL_COMPANY.id,
    user_id: 'user-default',
    role: 'admin',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: REAL_COMPANY,
  },
  {
    id: 'cu-2',
    company_id: 'comp-2',
    user_id: 'user-default',
    role: 'stock',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    company: mockCompanies[1],
  },
];

export const mockCategories: Category[] = getRealCategories(REAL_COMPANY.id);
export const mockBrands: Brand[] = getRealBrands(REAL_COMPANY.id);

export const mockSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    company_id: REAL_COMPANY.id,
    name: 'Distribuidora Panificação & Doces SP',
    legal_name: 'SP Panificação & Alimentos Ltda',
    cnpj: '11.222.333/0001-44',
    email: 'pedidos@sppanificacao.com',
    phone: '(11) 3333-4444',
    whatsapp: '5511963820374',
    contact_name: 'Carlos Fornecedor',
    city: 'São Paulo',
    state: 'SP',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'sup-2',
    company_id: REAL_COMPANY.id,
    name: 'Atacado Hortifruti & Laticínios Central',
    legal_name: 'Horti Laticínios Atacadista S.A.',
    cnpj: '55.666.777/0001-88',
    email: 'vendas@centralhorti.com',
    phone: '(11) 2222-1111',
    whatsapp: '5511963820374',
    contact_name: 'Fernanda Atacado',
    city: 'São Paulo',
    state: 'SP',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockProducts: Product[] = getRealProducts(REAL_COMPANY.id);

export const mockInventory: InventoryItem[] = mockProducts.map((p, idx) => ({
  id: `inv-${p.id}`,
  company_id: REAL_COMPANY.id,
  product_id: p.id,
  quantity: idx % 5 === 0 ? 3 : 25,
  reserved_quantity: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const dateInDays = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export const mockLots: Lot[] = [
  {
    id: 'lot-1',
    company_id: REAL_COMPANY.id,
    product_id: 'beb-suco-aurora-1l',
    supplier_id: 'sup-1',
    lot_number: 'LOTE-AURORA-2026',
    manufacturing_date: dateInDays(-30),
    expiration_date: dateInDays(5), // Vencendo em 5 dias
    initial_quantity: 30,
    current_quantity: 20,
    cost_price: 11.34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lot-2',
    company_id: REAL_COMPANY.id,
    product_id: 'fq-queijo-prato-sadia',
    supplier_id: 'sup-2',
    lot_number: 'LOTE-SADIA-9921',
    manufacturing_date: dateInDays(-10),
    expiration_date: dateInDays(45),
    initial_quantity: 40,
    current_quantity: 35,
    cost_price: 7.74,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

export const mockMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    company_id: REAL_COMPANY.id,
    product_id: 'beb-suco-delvalle-200',
    type: 'entry',
    quantity: 50,
    reason: 'Entrada Inicial de Estoque - Cestas de Café da Manhã',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mov-2',
    company_id: REAL_COMPANY.id,
    product_id: 'pb-pao-queijo-fdm',
    type: 'exit',
    quantity: 2,
    reason: 'Montagem Cesta Grande #1042',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

export const mockCatalogRequests = [
  {
    id: 'req-1',
    company_id: REAL_COMPANY.id,
    customer_name: 'Roberto Silva',
    customer_phone: '5511963820374',
    customer_email: 'roberto@email.com',
    notes: 'Cesta Média montada pelo WhatsApp para presente.',
    status: 'new' as const,
    items: [
      { product_id: 'beb-ades-500', product_name: 'Bebida de Soja Ades Maçã 500 ml', quantity: 1, unit_price: 6.49 },
      { product_id: 'pb-pao-queijo-fdm', product_name: 'Pão de Queijo Forno de Minas 400 g', quantity: 1, unit_price: 16.90 },
      { product_id: 'ad-caneca', product_name: 'Caneca personalizada', quantity: 1, unit_price: 24.90 },
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

export const mockNotifications = [
  {
    id: 'notif-1',
    company_id: 'comp-1',
    title: 'Estoque Baixo Detectado',
    message: 'Arroz Tipo 1 Camil 5kg atingiu 8 pacotes (abaixo do estoque mínimo de 15).',
    type: 'warning' as const,
    read: false,
    link: '/admin/inventory',
    created_at: new Date(Date.now() - 3600000 * 1).toISOString(),
  },
  {
    id: 'notif-2',
    company_id: 'comp-1',
    title: 'Alerta de Vencimento de Lote',
    message: 'Lote LOTE-LEITE-001 (Leite Ninho 1L) vence em 5 dias.',
    type: 'danger' as const,
    read: false,
    link: '/admin/lots',
    created_at: new Date(Date.now() - 3600000 * 3).toISOString(),
  },
  {
    id: 'notif-3',
    company_id: 'comp-1',
    title: 'Nova Solicitação do Catálogo',
    message: 'Cliente Roberto Silva enviou uma solicitação com 2 produtos.',
    type: 'info' as const,
    read: true,
    link: '/admin/catalog/requests',
    created_at: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
];

export const mockAuditLogs = [
  {
    id: 'log-1',
    company_id: 'comp-1',
    user_id: 'user-willian-global',
    user_name: 'Willian Oliveira (Global Admin)',
    action: 'Criação de Produto',
    resource: 'Refrigerante Coca-Cola 2L',
    details: 'Preço de Venda: R$ 11,90 • SKU: COC-2L-001',
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'log-2',
    company_id: 'comp-1',
    user_id: 'user-willian-global',
    user_name: 'Willian Oliveira (Global Admin)',
    action: 'Entrada de Estoque',
    resource: 'Coca-Cola 2L',
    details: '+50 unidades registradas via compra NF #1042',
    ip_address: '192.168.1.10',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'log-3',
    company_id: 'comp-1',
    user_id: 'user-maria',
    user_name: 'Maria Estoquista',
    action: 'Ajuste de Inventário',
    resource: 'Arroz Tipo 1 Camil 5kg',
    details: 'Ajuste para 8 unidades após conferência física',
    ip_address: '192.168.1.15',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];
