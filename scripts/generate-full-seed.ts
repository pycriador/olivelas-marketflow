import { writeFileSync } from 'node:fs';
import {
  OFFICIAL_BREAKFAST_BASKET_JSON,
  REAL_COMPANY,
  getRealBrands,
  getRealProducts,
  getRealExpirationDate
} from '../src/lib/real-basket-data';

function escapeSql(str: string | undefined | null): string {
  if (str === undefined || str === null) return 'NULL';
  return `'${str.replace(/'/g, "''")}'`;
}

function escapeJson(obj: any): string {
  if (!obj) return 'NULL';
  return `'${JSON.stringify(obj).replace(/'/g, "''")}'::jsonb`;
}

function generate() {
  const brands = getRealBrands(REAL_COMPANY.id);
  const products = getRealProducts(REAL_COMPANY.id);

  let sql = `-- ====================================================================
-- MarketFlow — Consolidated Database Schema & Complete Seed Data
-- Target Database: Supabase PostgreSQL (project: rstjtnrdpfaxlfxqycig)
-- ====================================================================

-- 1. Custom Types & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('global_admin', 'admin', 'stock', 'visitor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-create profile on auth.users sign up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url, phone)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'phone'
  )
  ON CONFLICT (id) DO UPDATE
  SET full_name = EXCLUDED.full_name,
      updated_at = now();
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Auto-create profile for any existing auth.users
INSERT INTO public.profiles (id, full_name, created_at, updated_at)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), now(), now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Companies (Tenants)
CREATE TABLE IF NOT EXISTS public.companies (
  id TEXT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(200),
  cnpj VARCHAR(30),
  slug VARCHAR(100) NOT NULL UNIQUE,
  email VARCHAR(255),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  logo_url TEXT,
  description TEXT,
  subtitulo TEXT,
  moeda VARCHAR(10) DEFAULT 'BRL',
  avisoRodape TEXT,
  breakfast_basket_enabled BOOLEAN NOT NULL DEFAULT true,
  active BOOLEAN NOT NULL DEFAULT true,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 4. Company Users (Tenant Membership & Roles)
CREATE TABLE IF NOT EXISTS public.company_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_company_user UNIQUE(company_id, user_id)
);

-- 5. Categories
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 6. Manufacturers (Fabricantes)
CREATE TABLE IF NOT EXISTS public.manufacturers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  document VARCHAR(30),
  phone VARCHAR(30),
  email VARCHAR(255),
  address TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 7. Brands (Marcas)
CREATE TABLE IF NOT EXISTS public.brands (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 8. Suppliers (Fornecedores)
CREATE TABLE IF NOT EXISTS public.suppliers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(150) NOT NULL,
  legal_name VARCHAR(200),
  cnpj VARCHAR(30),
  email VARCHAR(255),
  phone VARCHAR(30),
  whatsapp VARCHAR(30),
  address TEXT,
  notes TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 9. Products (Produtos com Data de Validade & Vínculos Cesta)
CREATE TABLE IF NOT EXISTS public.products (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  brand_id TEXT REFERENCES public.brands(id) ON DELETE SET NULL,
  supplier_id TEXT REFERENCES public.suppliers(id) ON DELETE SET NULL,
  manufacturer_id TEXT REFERENCES public.manufacturers(id) ON DELETE SET NULL,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  sku VARCHAR(50),
  barcode VARCHAR(50),
  unit VARCHAR(20) NOT NULL DEFAULT 'UN',
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  sale_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  minimum_stock INTEGER NOT NULL DEFAULT 0,
  maximum_stock INTEGER NOT NULL DEFAULT 0,
  expiration_date DATE,
  active BOOLEAN NOT NULL DEFAULT true,
  catalog_visible BOOLEAN NOT NULL DEFAULT true,
  show_price BOOLEAN NOT NULL DEFAULT true,
  allow_contact BOOLEAN NOT NULL DEFAULT true,
  active_in_basket BOOLEAN NOT NULL DEFAULT true,
  basket_sizes JSONB,
  drink_tier VARCHAR(10),
  image_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 10. Inventory Items (Estoque Consolidado)
CREATE TABLE IF NOT EXISTS public.inventory_items (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_product_inventory UNIQUE (company_id, product_id)
);

-- 11. Lots (Lotes com Data de Validade)
CREATE TABLE IF NOT EXISTS public.lots (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lot_number VARCHAR(100) NOT NULL,
  initial_quantity INTEGER NOT NULL DEFAULT 0,
  current_quantity INTEGER NOT NULL DEFAULT 0,
  manufacturing_date DATE,
  expiration_date DATE NOT NULL,
  cost_price NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  status VARCHAR(30) NOT NULL DEFAULT 'active',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 12. Inventory Movements (Kardex / Movimentações de Estoque)
CREATE TABLE IF NOT EXISTS public.inventory_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  lot_id TEXT REFERENCES public.lots(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL, -- 'in', 'out', 'transfer', 'adjustment', 'loss'
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL DEFAULT 0,
  new_quantity INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  document_reference VARCHAR(100),
  performed_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Catalog Requests (Pedidos e Contatos da Loja Pública)
CREATE TABLE IF NOT EXISTS public.catalog_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(255),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_address TEXT,
  gift_message TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  source VARCHAR(50) DEFAULT 'whatsapp_catalog',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.catalog_requests ENABLE ROW LEVEL SECURITY;

-- Profiles: Public read, user can update own profile
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Companies: Public read for active companies (public store), full access for members
CREATE POLICY "Active companies viewable publicly" ON public.companies FOR SELECT USING (active = true);
CREATE POLICY "Company members full access to company" ON public.companies FOR ALL TO authenticated USING (
  id IN (SELECT company_id FROM public.company_users WHERE user_id = auth.uid()) OR
  created_by = auth.uid()
);

-- Company Users: Authenticated members can view users
CREATE POLICY "Members can view company users" ON public.company_users FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage company users" ON public.company_users FOR ALL TO authenticated USING (
  company_id IN (
    SELECT company_id FROM public.company_users WHERE user_id = auth.uid() AND role IN ('global_admin', 'admin')
  )
);

-- Generic macro-like policies for tenant tables (public read for store, authenticated edit)
CREATE POLICY "Public read categories" ON public.categories FOR SELECT USING (active = true);
CREATE POLICY "Authenticated manage categories" ON public.categories FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read brands" ON public.brands FOR SELECT USING (active = true);
CREATE POLICY "Authenticated manage brands" ON public.brands FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated manage manufacturers" ON public.manufacturers FOR ALL TO authenticated USING (true);
CREATE POLICY "Authenticated manage suppliers" ON public.suppliers FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read products" ON public.products FOR SELECT USING (active = true);
CREATE POLICY "Authenticated manage products" ON public.products FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read inventory" ON public.inventory_items FOR SELECT USING (true);
CREATE POLICY "Authenticated manage inventory" ON public.inventory_items FOR ALL TO authenticated USING (true);

CREATE POLICY "Public read lots" ON public.lots FOR SELECT USING (true);
CREATE POLICY "Authenticated manage lots" ON public.lots FOR ALL TO authenticated USING (true);

CREATE POLICY "Authenticated manage movements" ON public.inventory_movements FOR ALL TO authenticated USING (true);

CREATE POLICY "Public insert catalog requests" ON public.catalog_requests FOR INSERT WITH CHECK (true);
CREATE POLICY "Company members view catalog requests" ON public.catalog_requests FOR ALL TO authenticated USING (true);

-- ====================================================================
-- SEED DATA
-- ====================================================================

-- 1. Empresas
INSERT INTO public.companies (
  id, name, legal_name, cnpj, slug, phone, whatsapp, description, subtitulo, moeda, avisoRodape, breakfast_basket_enabled, active
) VALUES
(
  'comp-cesta-1',
  'Cestas de Café da Manhã',
  'Olivelas MarketFlow Comércio Ltda',
  '12.345.678/0001-90',
  'cestas-cafe-da-manha',
  '(11) 96382-0374',
  '5511963820374',
  'Especialista em cestas de café da manhã e presentes para datas especiais.',
  'Monte a sua cesta e envie o pedido pelo WhatsApp',
  'BRL',
  'Cardápio de exemplo — em ajustes.',
  true,
  true
),
(
  'comp-2',
  'Adega & Conveniência Gourmet',
  'Adega Gourmet Eireli',
  '98.765.432/0001-10',
  'adega-gourmet',
  '(11) 91234-5678',
  '5511912345678',
  'Bebidas geladas, aperitivos e conveniência.',
  'Bebidas e produtos selecionados',
  'BRL',
  'Entregas rápidas na região.',
  false,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  legal_name = EXCLUDED.legal_name,
  cnpj = EXCLUDED.cnpj,
  whatsapp = EXCLUDED.whatsapp,
  breakfast_basket_enabled = EXCLUDED.breakfast_basket_enabled;

-- Vínculo automático de todos os usuários cadastrados como Admin da empresa principal
INSERT INTO public.company_users (company_id, user_id, role, active)
SELECT 'comp-cesta-1', id, 'admin'::public.app_role, true
FROM auth.users
ON CONFLICT (company_id, user_id) DO NOTHING;

-- 2. Categorias
INSERT INTO public.categories (id, company_id, name, description, active) VALUES
('cat-bebidas', 'comp-cesta-1', 'Bebidas', 'Sucos, chás, iogurtes, achocolatados e refrigerantes.', true),
('cat-paes-bolos', 'comp-cesta-1', 'Pães & Bolos', 'Pães artesanais, torradas, croissants e bolos.', true),
('cat-biscoitos', 'comp-cesta-1', 'Biscoitos & Bolachas', 'Wafers, cookies e biscoitos doces e salgados.', true),
('cat-frios-queijos', 'comp-cesta-1', 'Frios & Queijos', 'Queijos selecionados, presunto e requeijão.', true),
('cat-frutas', 'comp-cesta-1', 'Frutas Selecionadas', 'Frutas frescas e higienizadas da estação.', true),
('cat-doces-geleias', 'comp-cesta-1', 'Doces & Geleias', 'Nutella, geleias artesanais e mel.', true),
('cat-chocolates', 'comp-cesta-1', 'Chocolates & Bombons', 'Milka, Ferrero Rocher, Lindt e bombons.', true),
('cat-canecas-brindes', 'comp-cesta-1', 'Canecas & Brindes', 'Itens comemorativos, canecas e cartões de presente.', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 3. Fornecedores
INSERT INTO public.suppliers (id, company_id, name, legal_name, cnpj, phone, whatsapp, active) VALUES
('sup-1', 'comp-cesta-1', 'Distribuidora Panificação & Doces SP', 'SP Panificação & Alimentos Ltda', '11.222.333/0001-44', '(11) 3333-4444', '5511963820374', true),
('sup-2', 'comp-cesta-1', 'Atacado Hortifruti & Laticínios Central', 'Horti Laticínios Atacadista S.A.', '55.666.777/0001-88', '(11) 2222-1111', '5511963820374', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Fabricantes
INSERT INTO public.manufacturers (id, company_id, name, document, phone, active) VALUES
('mfg-1', 'comp-cesta-1', 'Ambev S.A.', '07.526.557/0001-00', '(11) 2122-1000', true),
('mfg-2', 'comp-cesta-1', 'Coca-Cola FEMSA Brasil', '45.997.418/0001-53', '0800 021 2121', true),
('mfg-3', 'comp-cesta-1', 'Vinícola Aurora Bento Gonçalves', '87.548.724/0001-30', '(54) 3455-2000', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Marcas
INSERT INTO public.brands (id, company_id, name, active) VALUES
`;

  const brandValues = brands.map(b => 
    `(${escapeSql(b.id)}, ${escapeSql(b.company_id)}, ${escapeSql(b.name)}, true)`
  ).join(',\n');
  sql += brandValues + '\nON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;\n\n';

  // 6. Produtos
  sql += `-- 6. Produtos (Todos os 51 Itens Oficiais com Validade Real)\n`;
  sql += `INSERT INTO public.products (
  id, company_id, category_id, brand_id, name, description, sku, barcode, unit,
  cost_price, sale_price, minimum_stock, maximum_stock, expiration_date,
  active, catalog_visible, show_price, allow_contact, active_in_basket, basket_sizes, drink_tier
) VALUES\n`;

  // Mapear nome da marca para brand_id
  const brandMap = new Map<string, string>();
  brands.forEach(b => brandMap.set(b.name.toLowerCase().trim(), b.id));

  // Achar marca de cada produto
  const productValues = products.map(p => {
    // Procura nome da marca correspondente
    let matchedBrandId: string | null = null;
    for (const [name, bId] of brandMap.entries()) {
      if (p.name.toLowerCase().includes(name)) {
        matchedBrandId = bId;
        break;
      }
    }

    const expDate = p.expiration_date ? `'${p.expiration_date}'` : 'NULL';
    const basketSizesJson = p.basket_sizes ? escapeJson(p.basket_sizes) : `'["pequena","media","grande"]'::jsonb`;
    const drinkTier = p.drink_tier ? escapeSql(p.drink_tier) : 'NULL';

    return `(
  ${escapeSql(p.id)},
  ${escapeSql(p.company_id)},
  ${escapeSql(p.category_id)},
  ${escapeSql(matchedBrandId)},
  ${escapeSql(p.name)},
  ${escapeSql(p.description)},
  ${escapeSql(p.sku)},
  ${escapeSql(p.barcode)},
  'UN',
  ${p.cost_price.toFixed(2)},
  ${p.sale_price.toFixed(2)},
  ${p.minimum_stock},
  ${p.maximum_stock},
  ${expDate},
  true,
  true,
  true,
  true,
  true,
  ${basketSizesJson},
  ${drinkTier}
)`;
  }).join(',\n');

  sql += productValues + `\nON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sale_price = EXCLUDED.sale_price,
  cost_price = EXCLUDED.cost_price,
  expiration_date = EXCLUDED.expiration_date,
  active_in_basket = EXCLUDED.active_in_basket,
  basket_sizes = EXCLUDED.basket_sizes,
  drink_tier = EXCLUDED.drink_tier;\n\n`;

  // 7. Estoque Consolidado (inventory_items)
  sql += `-- 7. Estoque Inicial (25 unidades de cada produto)\n`;
  sql += `INSERT INTO public.inventory_items (id, company_id, product_id, quantity, reserved_quantity, location) VALUES\n`;
  const inventoryValues = products.map(p => 
    `('inv-${p.id}', ${escapeSql(p.company_id)}, ${escapeSql(p.id)}, 25, 0, 'Prateleira A')`
  ).join(',\n');
  sql += inventoryValues + '\nON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;\n\n';

  // 8. Lotes (lots) com validade
  sql += `-- 8. Lotes com Data de Validade Real\n`;
  sql += `INSERT INTO public.lots (id, company_id, product_id, lot_number, initial_quantity, current_quantity, manufacturing_date, expiration_date, cost_price, status) VALUES\n`;
  const lotValues = products.filter(p => p.expiration_date).map((p, idx) => {
    return `('lot-${p.id}', ${escapeSql(p.company_id)}, ${escapeSql(p.id)}, 'LOT-2026-${String(idx + 1).padStart(3, '0')}', 25, 25, '2026-01-10', '${p.expiration_date}', ${p.cost_price.toFixed(2)}, 'active')`;
  }).join(',\n');
  sql += lotValues + '\nON CONFLICT (id) DO UPDATE SET expiration_date = EXCLUDED.expiration_date;\n';

  writeFileSync('supabase/consolidated_schema.sql', sql, 'utf-8');
  console.log(`Generated consolidated_schema.sql with ${products.length} products and ${brands.length} brands.`);
}

generate();
