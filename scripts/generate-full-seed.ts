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
-- MarketFlow — Dedicated Database Schema & Complete Seed Data
-- Target Database: Supabase PostgreSQL (project: mfyyezvpfpflpekosjif)
-- Dedicated Schema: "marketflow" (Isolamento total de outros projetos como serviceforge)
-- ====================================================================

-- 0. Criar Schema Dedicado "marketflow"
CREATE SCHEMA IF NOT EXISTS marketflow;

-- Conceder permissões no schema para os papéis de acesso do Supabase
GRANT USAGE ON SCHEMA marketflow TO anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA marketflow TO anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA marketflow TO anon, authenticated, service_role;
GRANT ALL ON ALL ROUTINES IN SCHEMA marketflow TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA marketflow GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA marketflow GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA marketflow GRANT ALL ON ROUTINES TO anon, authenticated, service_role;

-- 1. Custom Types & Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

DO $$ BEGIN
  CREATE TYPE marketflow.app_role AS ENUM ('global_admin', 'admin', 'stock', 'visitor');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- 2. Profiles (Linked to auth.users)
CREATE TABLE IF NOT EXISTS marketflow.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name VARCHAR(150) NOT NULL,
  avatar_url TEXT,
  phone VARCHAR(30),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Trigger: auto-create profile on auth.users sign up
CREATE OR REPLACE FUNCTION marketflow.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO marketflow.profiles (id, full_name, avatar_url, phone)
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

DROP TRIGGER IF EXISTS on_auth_user_created_marketflow ON auth.users;
CREATE TRIGGER on_auth_user_created_marketflow
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION marketflow.handle_new_user();

-- Auto-create profile for any existing auth.users
INSERT INTO marketflow.profiles (id, full_name, created_at, updated_at)
SELECT id, COALESCE(raw_user_meta_data->>'full_name', split_part(email, '@', 1)), now(), now()
FROM auth.users
ON CONFLICT (id) DO NOTHING;

-- 3. Companies (Tenants)
CREATE TABLE IF NOT EXISTS marketflow.companies (
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
  created_by UUID REFERENCES marketflow.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 4. Company Users (Tenant Membership & Roles)
CREATE TABLE IF NOT EXISTS marketflow.company_users (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES marketflow.profiles(id) ON DELETE CASCADE,
  role marketflow.app_role NOT NULL DEFAULT 'admin',
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_company_user_mf UNIQUE(company_id, user_id)
);

-- 5. Categories
CREATE TABLE IF NOT EXISTS marketflow.categories (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  parent_id TEXT REFERENCES marketflow.categories(id) ON DELETE SET NULL,
  image_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 6. Manufacturers (Fabricantes)
CREATE TABLE IF NOT EXISTS marketflow.manufacturers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS marketflow.brands (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  logo_url TEXT,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

-- 8. Suppliers (Fornecedores)
CREATE TABLE IF NOT EXISTS marketflow.suppliers (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS marketflow.products (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  category_id TEXT REFERENCES marketflow.categories(id) ON DELETE SET NULL,
  brand_id TEXT REFERENCES marketflow.brands(id) ON DELETE SET NULL,
  supplier_id TEXT REFERENCES marketflow.suppliers(id) ON DELETE SET NULL,
  manufacturer_id TEXT REFERENCES marketflow.manufacturers(id) ON DELETE SET NULL,
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
CREATE TABLE IF NOT EXISTS marketflow.inventory_items (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES marketflow.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 0,
  reserved_quantity INTEGER NOT NULL DEFAULT 0,
  location VARCHAR(100),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT unique_product_inventory_mf UNIQUE (company_id, product_id)
);

-- 11. Lots (Lotes com Data de Validade)
CREATE TABLE IF NOT EXISTS marketflow.lots (
  id TEXT PRIMARY KEY,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES marketflow.products(id) ON DELETE CASCADE,
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
CREATE TABLE IF NOT EXISTS marketflow.inventory_movements (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  product_id TEXT NOT NULL REFERENCES marketflow.products(id) ON DELETE CASCADE,
  lot_id TEXT REFERENCES marketflow.lots(id) ON DELETE SET NULL,
  type VARCHAR(30) NOT NULL,
  quantity INTEGER NOT NULL,
  previous_quantity INTEGER NOT NULL DEFAULT 0,
  new_quantity INTEGER NOT NULL DEFAULT 0,
  reason TEXT,
  document_reference VARCHAR(100),
  performed_by UUID REFERENCES marketflow.profiles(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 13. Catalog Requests (Pedidos e Contatos da Loja Pública)
CREATE TABLE IF NOT EXISTS marketflow.catalog_requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  company_id TEXT NOT NULL REFERENCES marketflow.companies(id) ON DELETE CASCADE,
  customer_name VARCHAR(150) NOT NULL,
  customer_phone VARCHAR(30) NOT NULL,
  customer_email VARCHAR(255),
  total_amount NUMERIC(10,2) NOT NULL DEFAULT 0.00,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  delivery_address TEXT,
  gift_message TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending',
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES NO SCHEMA MARKETFLOW
-- ====================================================================
ALTER TABLE marketflow.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.company_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.manufacturers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.brands ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.suppliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.inventory_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.lots ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.inventory_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketflow.catalog_requests ENABLE ROW LEVEL SECURITY;

-- Políticas de Leitura Pública e Modificação Autenticada
DO $$ BEGIN
  CREATE POLICY "Profiles are viewable by everyone" ON marketflow.profiles FOR SELECT USING (true);
  CREATE POLICY "Users can update their own profile" ON marketflow.profiles FOR ALL USING (auth.uid() = id);
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Companies viewable by everyone" ON marketflow.companies FOR SELECT USING (true);
  CREATE POLICY "Companies manageable by authenticated" ON marketflow.companies FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Categories viewable by everyone" ON marketflow.categories FOR SELECT USING (true);
  CREATE POLICY "Categories manageable by authenticated" ON marketflow.categories FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Brands viewable by everyone" ON marketflow.brands FOR SELECT USING (true);
  CREATE POLICY "Brands manageable by authenticated" ON marketflow.brands FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Products viewable by everyone" ON marketflow.products FOR SELECT USING (true);
  CREATE POLICY "Products manageable by authenticated" ON marketflow.products FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Inventory viewable by everyone" ON marketflow.inventory_items FOR SELECT USING (true);
  CREATE POLICY "Inventory manageable by authenticated" ON marketflow.inventory_items FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Lots viewable by everyone" ON marketflow.lots FOR SELECT USING (true);
  CREATE POLICY "Lots manageable by authenticated" ON marketflow.lots FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Movements viewable by everyone" ON marketflow.inventory_movements FOR SELECT USING (true);
  CREATE POLICY "Movements manageable by authenticated" ON marketflow.inventory_movements FOR ALL USING (auth.role() = 'authenticated');
EXCEPTION WHEN duplicate_object THEN null; END $$;

DO $$ BEGIN
  CREATE POLICY "Requests insertable by everyone" ON marketflow.catalog_requests FOR INSERT WITH CHECK (true);
  CREATE POLICY "Requests viewable by authenticated" ON marketflow.catalog_requests FOR SELECT USING (true);
EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ====================================================================
-- SEED DATA NO SCHEMA MARKETFLOW
-- ====================================================================

-- 1. Empresa Principal
INSERT INTO marketflow.companies (
  id, name, legal_name, cnpj, slug, phone, whatsapp, description,
  subtitulo, moeda, avisoRodape, breakfast_basket_enabled, active
) VALUES (
  ${escapeSql(REAL_COMPANY.id)},
  ${escapeSql(REAL_COMPANY.name)},
  ${escapeSql(REAL_COMPANY.legal_name)},
  ${escapeSql(REAL_COMPANY.cnpj)},
  ${escapeSql(REAL_COMPANY.slug)},
  ${escapeSql(REAL_COMPANY.phone)},
  ${escapeSql(REAL_COMPANY.whatsapp)},
  ${escapeSql(REAL_COMPANY.description)},
  ${escapeSql(REAL_COMPANY.subtitulo)},
  ${escapeSql(REAL_COMPANY.moeda)},
  ${escapeSql(REAL_COMPANY.avisoRodape)},
  true,
  true
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  legal_name = EXCLUDED.legal_name,
  cnpj = EXCLUDED.cnpj,
  slug = EXCLUDED.slug,
  whatsapp = EXCLUDED.whatsapp,
  description = EXCLUDED.description;

-- 2. Categorias Oficiais
INSERT INTO marketflow.categories (id, company_id, name, description, active) VALUES
('cat-mercearia-cafe', ${escapeSql(REAL_COMPANY.id)}, 'Cafés & Matinais', 'Cafés especiais, chás e matinais', true),
('cat-bebidas', ${escapeSql(REAL_COMPANY.id)}, 'Bebidas', 'Sucos, achocolatados, cafés prontos, chás e espumantes', true),
('cat-padaria', ${escapeSql(REAL_COMPANY.id)}, 'Padaria & Confeitaria', 'Pães especiais, torradas, croissants, bolos e waffles', true),
('cat-frios', ${escapeSql(REAL_COMPANY.id)}, 'Frios & Laticínios', 'Queijos selecionados, iogurtes, manteigas e requeijão', true),
('cat-biscoitos', ${escapeSql(REAL_COMPANY.id)}, 'Biscoitos & Snacks', 'Cookies artesanais, biscoitos finos, crackers e nuts', true),
('cat-frutas', ${escapeSql(REAL_COMPANY.id)}, 'Frutas Frescas', 'Frutas higienizadas e selecionadas para consumo imediato', true),
('cat-geleias', ${escapeSql(REAL_COMPANY.id)}, 'Geleias & Doces', 'Geleias artesanais, mel puro, cremes e chocolates', true),
('cat-flores', ${escapeSql(REAL_COMPANY.id)}, 'Flores & Afeto', 'Arranjos florais compactos e botões de rosas naturais', true),
('cat-canecas', ${escapeSql(REAL_COMPANY.id)}, 'Canecas & Lembranças', 'Canecas de cerâmica, xícaras especiais e cartões comemorativos', true),
('cat-embalagens', ${escapeSql(REAL_COMPANY.id)}, 'Cestas & Embalagens', 'Cestas de vime rústico, caixas cartonadas premium e laços', true),
('cat-adicionais', ${escapeSql(REAL_COMPANY.id)}, 'Adicionais & Acessórios', 'Itens complementares e brindes decorativos', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Marcas Oficiais (${brands.length} marcas)
INSERT INTO marketflow.brands (id, company_id, name, description, active) VALUES
${brands.map(b => `(${escapeSql(b.id)}, ${escapeSql(b.company_id)}, ${escapeSql(b.name)}, ${escapeSql(b.description)}, true)`).join(',\n')}
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Fabricantes Oficiais
INSERT INTO marketflow.manufacturers (id, company_id, name, document, phone, email, active) VALUES
('mfg-1', ${escapeSql(REAL_COMPANY.id)}, 'Ambev S.A.', '07.526.557/0001-00', '(11) 2122-1000', 'contato@ambev.com.br', true),
('mfg-2', ${escapeSql(REAL_COMPANY.id)}, 'Coca-Cola FEMSA Brasil', '45.997.418/0001-53', '0800 021 2121', 'sac@cocacola.com.br', true),
('mfg-3', ${escapeSql(REAL_COMPANY.id)}, 'Vinícola Aurora Bento Gonçalves', '87.548.724/0001-30', '(54) 3455-2000', 'comercial@vinicolaaurora.com.br', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Fornecedores Oficiais
INSERT INTO marketflow.suppliers (id, company_id, name, legal_name, cnpj, phone, whatsapp, active) VALUES
('sup-1', ${escapeSql(REAL_COMPANY.id)}, 'Distribuidora Matinais Brasil', 'Distribuidora Matinais Brasil Ltda', '11.222.333/0001-44', '(11) 3344-5566', '5511933445566', true),
('sup-2', ${escapeSql(REAL_COMPANY.id)}, 'Empório Central de Alimentos', 'Empório Central Alimentos Eireli', '22.333.444/0001-55', '(11) 4455-6677', '5511944556677', true),
('sup-3', ${escapeSql(REAL_COMPANY.id)}, 'Hortifruti & Flores Selecionadas', 'Hortifruti e Flores Ltda', '33.444.555/0001-66', '(11) 5566-7788', '5511955667788', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. Produtos Oficiais (${products.length} itens com shelf-life real)
INSERT INTO marketflow.products (
  id, company_id, category_id, brand_id, name, description,
  cost_price, sale_price, minimum_stock, maximum_stock,
  expiration_date, active, catalog_visible, show_price, allow_contact,
  active_in_basket, basket_sizes, drink_tier
) VALUES\n`;

  const productValues = products.map(p => {
    let catId = p.category_id;
    if (catId === 'cat-mercearia') catId = 'cat-mercearia-cafe';

    const basketSizesJson = escapeJson(p.basket_sizes || ['pequena', 'media', 'grande']);
    const drinkTier = p.drink_tier ? `'${p.drink_tier}'` : 'NULL';
    const expDate = p.expiration_date ? `'${p.expiration_date}'` : 'NULL';

    return `(
  ${escapeSql(p.id)},
  ${escapeSql(p.company_id)},
  ${escapeSql(catId)},
  ${escapeSql(p.brand_id)},
  ${escapeSql(p.name)},
  ${escapeSql(p.description)},
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
  sql += `INSERT INTO marketflow.inventory_items (id, company_id, product_id, quantity, reserved_quantity, location) VALUES\n`;
  const inventoryValues = products.map(p => 
    `('inv-${p.id}', ${escapeSql(p.company_id)}, ${escapeSql(p.id)}, 25, 0, 'Prateleira A')`
  ).join(',\n');
  sql += inventoryValues + '\nON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;\n\n';

  // 8. Lotes (lots) com validade
  sql += `-- 8. Lotes com Data de Validade Real\n`;
  sql += `INSERT INTO marketflow.lots (id, company_id, product_id, lot_number, initial_quantity, current_quantity, manufacturing_date, expiration_date, cost_price, status) VALUES\n`;
  const lotValues = products.filter(p => p.expiration_date).map((p, idx) => {
    return `('lot-${p.id}', ${escapeSql(p.company_id)}, ${escapeSql(p.id)}, 'LOT-2026-${String(idx + 1).padStart(3, '0')}', 25, 25, '2026-01-10', '${p.expiration_date}', ${p.cost_price.toFixed(2)}, 'active')`;
  }).join(',\n');
  sql += lotValues + '\nON CONFLICT (id) DO UPDATE SET expiration_date = EXCLUDED.expiration_date;\n\n';

  // 9. Comentários de Limpeza Opcional no Schema Public
  sql += `-- ====================================================================
-- INSTRUÇÕES DE EXPOSIÇÃO DA API NO SUPABASE DASHBOARD:
-- 1. No Supabase Dashboard, acesse: Project Settings > API > Data API Settings
-- 2. No campo "Exposed schemas", adicione "marketflow" (ex: public, serviceforge, marketflow)
-- 3. Clique em "Save" para aplicar.
-- ====================================================================

-- LIMPEZA OPCIONAL NO SCHEMA PUBLIC (APENAS SE DESEJAR REMOVER TABELAS ANTIGAS DO PUBLIC):
-- Descomente as linhas abaixo caso queira remover as tabelas do MarketFlow que estavam no schema public:
-- DROP TABLE IF EXISTS public.catalog_requests CASCADE;
-- DROP TABLE IF EXISTS public.inventory_movements CASCADE;
-- DROP TABLE IF EXISTS public.lots CASCADE;
-- DROP TABLE IF EXISTS public.inventory_items CASCADE;
-- DROP TABLE IF EXISTS public.products CASCADE;
-- DROP TABLE IF EXISTS public.suppliers CASCADE;
-- DROP TABLE IF EXISTS public.brands CASCADE;
-- DROP TABLE IF EXISTS public.manufacturers CASCADE;
-- DROP TABLE IF EXISTS public.categories CASCADE;
-- DROP TABLE IF EXISTS public.company_users CASCADE;
-- DROP TABLE IF EXISTS public.companies CASCADE;
`;

  writeFileSync('supabase/marketflow_schema.sql', sql, 'utf-8');
  writeFileSync('supabase/consolidated_schema.sql', sql, 'utf-8');
  console.log(`✅ Gerados supabase/marketflow_schema.sql e supabase/consolidated_schema.sql no schema "marketflow" com ${products.length} produtos e ${brands.length} marcas.`);
}

generate();
