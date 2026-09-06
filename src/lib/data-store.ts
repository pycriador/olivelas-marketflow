import {
  Product,
  Category,
  Brand,
  Manufacturer,
  Supplier,
  Lot,
  InventoryItem,
  InventoryMovement,
  Company,
  CatalogRequest
} from '../types';
import {
  REAL_COMPANY,
  getRealCategories,
  getRealBrands,
  getRealProducts
} from './real-basket-data';

// Chaves de armazenamento persistente no localStorage
const STORAGE_KEYS = {
  COMPANIES: 'marketflow_all_companies',
  PRODUCTS: 'marketflow_all_products',
  CATEGORIES: 'marketflow_all_categories',
  BRANDS: 'marketflow_all_brands',
  MANUFACTURERS: 'marketflow_all_manufacturers',
  SUPPLIERS: 'marketflow_all_suppliers',
  INVENTORY: 'marketflow_all_inventory',
  LOTS: 'marketflow_all_lots',
  MOVEMENTS: 'marketflow_all_movements',
  REQUESTS: 'marketflow_all_requests',
};

const initialManufacturers: Manufacturer[] = [
  {
    id: 'mfg-1',
    company_id: REAL_COMPANY.id,
    name: 'Ambev S.A.',
    document: '07.526.557/0001-00',
    email: 'contato@ambev.com.br',
    phone: '(11) 2122-1000',
    website: 'https://www.ambev.com.br',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mfg-2',
    company_id: REAL_COMPANY.id,
    name: 'Coca-Cola FEMSA Brasil',
    document: '45.997.418/0001-53',
    email: 'sac@cocacola.com.br',
    phone: '0800 021 2121',
    website: 'https://www.cocacolabrasil.com.br',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'mfg-3',
    company_id: REAL_COMPANY.id,
    name: 'Vinícola Aurora Bento Gonçalves',
    document: '87.548.724/0001-30',
    email: 'comercial@vinicolaaurora.com.br',
    phone: '(54) 3455-2000',
    website: 'https://www.vinicolaaurora.com.br',
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }
];

// Seed de dados iniciais reais
const initialCompany: Company = REAL_COMPANY;
const initialCategories: Category[] = getRealCategories(initialCompany.id);
const initialBrands: Brand[] = getRealBrands(initialCompany.id);
const initialProducts: Product[] = getRealProducts(initialCompany.id);

const initialInventory: InventoryItem[] = initialProducts.map((p, idx) => ({
  id: `inv-${p.id}`,
  company_id: initialCompany.id,
  product_id: p.id,
  quantity: idx % 6 === 0 ? 3 : 25,
  reserved_quantity: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}));

const initialSuppliers: Supplier[] = [
  {
    id: 'sup-1',
    company_id: initialCompany.id,
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
    company_id: initialCompany.id,
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

const initialLots: Lot[] = [
  {
    id: 'lot-1',
    company_id: initialCompany.id,
    product_id: 'beb-suco-aurora-1l',
    supplier_id: 'sup-1',
    lot_number: 'LOTE-AURORA-2026',
    manufacturing_date: new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    initial_quantity: 30,
    current_quantity: 20,
    cost_price: 11.34,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'lot-2',
    company_id: initialCompany.id,
    product_id: 'fq-queijo-prato-sadia',
    supplier_id: 'sup-2',
    lot_number: 'LOTE-SADIA-9921',
    manufacturing_date: new Date(Date.now() - 10 * 86400000).toISOString().split('T')[0],
    expiration_date: new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0],
    initial_quantity: 40,
    current_quantity: 35,
    cost_price: 7.74,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
];

const initialMovements: InventoryMovement[] = [
  {
    id: 'mov-1',
    company_id: initialCompany.id,
    product_id: 'beb-suco-delvalle-200',
    type: 'entry',
    quantity: 50,
    reason: 'Entrada Inicial de Estoque - Cestas de Café da Manhã',
    created_at: new Date(Date.now() - 3600000 * 48).toISOString(),
  },
  {
    id: 'mov-2',
    company_id: initialCompany.id,
    product_id: 'pb-pao-queijo-fdm',
    type: 'exit',
    quantity: 2,
    reason: 'Montagem Cesta Grande #1042',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
  {
    id: 'mov-3',
    company_id: initialCompany.id,
    product_id: 'fq-queijo-prato-sadia',
    type: 'entry',
    quantity: 35,
    reason: 'Recebimento de Fornecedor NF 9921',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
  },
];

const initialRequests: CatalogRequest[] = [
  {
    id: 'req-1',
    company_id: initialCompany.id,
    customer_name: 'Roberto Silva',
    customer_phone: '5511963820374',
    customer_email: 'roberto@email.com',
    notes: 'Cesta Média montada pelo WhatsApp para presente.',
    status: 'new',
    items: [
      { product_id: 'beb-ades-500', product_name: 'Bebida de Soja Ades Maçã 500 ml', quantity: 1, unit_price: 6.49 },
      { product_id: 'pb-pao-queijo-fdm', product_name: 'Pão de Queijo Forno de Minas 400 g', quantity: 1, unit_price: 16.90 },
      { product_id: 'ad-caneca', product_name: 'Caneca personalizada', quantity: 1, unit_price: 24.90 },
    ],
    created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
    updated_at: new Date(Date.now() - 3600000 * 2).toISOString(),
  },
];

// Funções utilitárias seguras com fallback para localStorage
function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(fallback));
      return fallback;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error(`Erro ao carregar chave ${key} do localStorage:`, err);
    return fallback;
  }
}

function saveToStorage<T>(key: string, data: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(data));
    // Dispara evento customizado para sincronização reativa entre abas e componentes
    window.dispatchEvent(new CustomEvent('marketflow_datastore_change', { detail: { key } }));
  } catch (err) {
    console.error(`Erro ao salvar chave ${key} no localStorage:`, err);
  }
}

// SINGLETON CENTRAL DE DADOS
class DataStore {
  // PRODUTOS
  getProducts(companyId?: string): Product[] {
    const all = loadFromStorage<Product[]>(STORAGE_KEYS.PRODUCTS, initialProducts);
    if (!companyId) return all;
    return all.filter(p => p.company_id === companyId || p.company_id === 'comp-cesta-1');
  }

  getProductById(id: string): Product | undefined {
    const all = this.getProducts();
    return all.find(p => p.id === id);
  }

  saveProduct(product: Product): Product {
    const all = this.getProducts();
    const index = all.findIndex(p => p.id === product.id);
    let updatedList: Product[];
    const now = new Date().toISOString();

    if (index >= 0) {
      const existing = all[index];
      const updated: Product = { ...existing, ...product, updated_at: now };
      updatedList = [...all];
      updatedList[index] = updated;
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedList);
      return updated;
    } else {
      const newProduct: Product = {
        ...product,
        created_at: product.created_at || now,
        updated_at: now,
      };
      updatedList = [newProduct, ...all];
      saveToStorage(STORAGE_KEYS.PRODUCTS, updatedList);

      // Garante criação automática do item de estoque para o novo produto
      this.ensureInventoryItem(newProduct);
      return newProduct;
    }
  }

  deleteProduct(id: string): boolean {
    const all = this.getProducts();
    const filtered = all.filter(p => p.id !== id);
    if (filtered.length !== all.length) {
      saveToStorage(STORAGE_KEYS.PRODUCTS, filtered);
      return true;
    }
    return false;
  }

  // ESTOQUE
  getInventory(companyId?: string): InventoryItem[] {
    const all = loadFromStorage<InventoryItem[]>(STORAGE_KEYS.INVENTORY, initialInventory);
    if (!companyId) return all;
    return all.filter(i => i.company_id === companyId || i.company_id === 'comp-cesta-1');
  }

  getInventoryItemByProductId(productId: string): InventoryItem | undefined {
    const all = this.getInventory();
    return all.find(i => i.product_id === productId);
  }

  updateInventoryQuantity(productId: string, deltaQuantity: number, type: InventoryMovement['type'], reason?: string, companyId?: string): InventoryItem {
    const all = this.getInventory();
    const index = all.findIndex(i => i.product_id === productId);
    const now = new Date().toISOString();

    let item: InventoryItem;
    if (index >= 0) {
      const existing = all[index];
      const newQty = Math.max(0, existing.quantity + deltaQuantity);
      item = { ...existing, quantity: newQty, updated_at: now };
      all[index] = item;
    } else {
      item = {
        id: `inv-${productId}`,
        company_id: companyId || initialCompany.id,
        product_id: productId,
        quantity: Math.max(0, deltaQuantity),
        reserved_quantity: 0,
        created_at: now,
        updated_at: now,
      };
      all.push(item);
    }

    saveToStorage(STORAGE_KEYS.INVENTORY, all);

    // Registra a movimentação automaticamente
    this.addMovement({
      id: `mov-${Date.now()}`,
      company_id: companyId || initialCompany.id,
      product_id: productId,
      type,
      quantity: Math.abs(deltaQuantity),
      reason: reason || `Ajuste de estoque (${type})`,
      created_at: now,
    });

    return item;
  }

  private ensureInventoryItem(product: Product) {
    const all = this.getInventory();
    if (!all.some(i => i.product_id === product.id)) {
      all.push({
        id: `inv-${product.id}`,
        company_id: product.company_id,
        product_id: product.id,
        quantity: 10,
        reserved_quantity: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      saveToStorage(STORAGE_KEYS.INVENTORY, all);
    }
  }

  // MOVIMENTAÇÕES
  getMovements(companyId?: string): InventoryMovement[] {
    const all = loadFromStorage<InventoryMovement[]>(STORAGE_KEYS.MOVEMENTS, initialMovements);
    if (!companyId) return all;
    return all.filter(m => m.company_id === companyId || m.company_id === 'comp-cesta-1');
  }

  addMovement(mov: InventoryMovement): InventoryMovement {
    const all = this.getMovements();
    const updated = [mov, ...all];
    saveToStorage(STORAGE_KEYS.MOVEMENTS, updated);
    return mov;
  }

  // LOTES
  getLots(companyId?: string): Lot[] {
    const all = loadFromStorage<Lot[]>(STORAGE_KEYS.LOTS, initialLots);
    if (!companyId) return all;
    return all.filter(l => l.company_id === companyId || l.company_id === 'comp-cesta-1');
  }

  saveLot(lot: Lot): Lot {
    const all = this.getLots();
    const index = all.findIndex(l => l.id === lot.id);
    let updated: Lot[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...lot, updated_at: now };
      updated = [...all];
    } else {
      const newLot: Lot = { ...lot, created_at: now, updated_at: now };
      updated = [newLot, ...all];
    }
    saveToStorage(STORAGE_KEYS.LOTS, updated);
    return lot;
  }

  // CATEGORIAS
  getCategories(companyId?: string): Category[] {
    const all = loadFromStorage<Category[]>(STORAGE_KEYS.CATEGORIES, initialCategories);
    if (!companyId) return all;
    return all.filter(c => c.company_id === companyId || c.company_id === 'comp-cesta-1');
  }

  saveCategory(category: Category): Category {
    const all = this.getCategories();
    const index = all.findIndex(c => c.id === category.id);
    let updated: Category[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...category, updated_at: now };
      updated = [...all];
    } else {
      updated = [{ ...category, created_at: now, updated_at: now }, ...all];
    }
    saveToStorage(STORAGE_KEYS.CATEGORIES, updated);
    return category;
  }

  // MARCAS
  getBrands(companyId?: string): Brand[] {
    const all = loadFromStorage<Brand[]>(STORAGE_KEYS.BRANDS, initialBrands);
    if (!companyId) return all;
    return all.filter(b => b.company_id === companyId || b.company_id === 'comp-cesta-1');
  }

  saveBrand(brand: Brand): Brand {
    const all = this.getBrands();
    const index = all.findIndex(b => b.id === brand.id);
    let updated: Brand[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...brand, updated_at: now };
      updated = [...all];
    } else {
      updated = [{ ...brand, created_at: now, updated_at: now }, ...all];
    }
    saveToStorage(STORAGE_KEYS.BRANDS, updated);
    return brand;
  }

  // FABRICANTES
  getManufacturers(companyId?: string): Manufacturer[] {
    const all = loadFromStorage<Manufacturer[]>(STORAGE_KEYS.MANUFACTURERS, initialManufacturers);
    if (!companyId) return all;
    return all.filter(m => m.company_id === companyId || m.company_id === 'comp-cesta-1');
  }

  saveManufacturer(mfg: Manufacturer): Manufacturer {
    const all = this.getManufacturers();
    const index = all.findIndex(m => m.id === mfg.id);
    let updated: Manufacturer[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...mfg, updated_at: now };
      updated = [...all];
    } else {
      updated = [{ ...mfg, created_at: now, updated_at: now }, ...all];
    }
    saveToStorage(STORAGE_KEYS.MANUFACTURERS, updated);
    return mfg;
  }

  // FORNECEDORES
  getSuppliers(companyId?: string): Supplier[] {
    const all = loadFromStorage<Supplier[]>(STORAGE_KEYS.SUPPLIERS, initialSuppliers);
    if (!companyId) return all;
    return all.filter(s => s.company_id === companyId || s.company_id === 'comp-cesta-1');
  }

  saveSupplier(supplier: Supplier): Supplier {
    const all = this.getSuppliers();
    const index = all.findIndex(s => s.id === supplier.id);
    let updated: Supplier[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...supplier, updated_at: now };
      updated = [...all];
    } else {
      updated = [{ ...supplier, created_at: now, updated_at: now }, ...all];
    }
    saveToStorage(STORAGE_KEYS.SUPPLIERS, updated);
    return supplier;
  }

  // SOLICITAÇÕES DO CATÁLOGO
  getRequests(companyId?: string): CatalogRequest[] {
    const all = loadFromStorage<CatalogRequest[]>(STORAGE_KEYS.REQUESTS, initialRequests);
    if (!companyId) return all;
    return all.filter(r => r.company_id === companyId || r.company_id === 'comp-cesta-1');
  }

  saveRequest(req: CatalogRequest): CatalogRequest {
    const all = this.getRequests();
    const index = all.findIndex(r => r.id === req.id);
    let updated: CatalogRequest[];
    const now = new Date().toISOString();

    if (index >= 0) {
      all[index] = { ...all[index], ...req, updated_at: now };
      updated = [...all];
    } else {
      updated = [{ ...req, created_at: now, updated_at: now }, ...all];
    }
    saveToStorage(STORAGE_KEYS.REQUESTS, updated);
    return req;
  }
}

export const dataStore = new DataStore();
