-- ====================================================================
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
  'comp-cesta-1',
  'Cestas de Café da Manhã',
  'Cestas & Cia Café da Manhã Ltda',
  '42.109.876/0001-55',
  'cestas-cafe-da-manha',
  '(11) 96382-0374',
  '5511963820374',
  'Monte a sua cesta e envie o pedido pelo WhatsApp.',
  'Monte a sua cesta e envie o pedido pelo WhatsApp',
  'BRL',
  'Cardápio de exemplo — em ajustes.',
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

-- 2. Categorias Oficiais (14 categorias)
INSERT INTO marketflow.categories (id, company_id, name, description, active) VALUES
('cat-bebidas', 'comp-cesta-1', 'Bebidas', 'Conta no limite de itens da cesta', true),
('cat-paes-bolos', 'comp-cesta-1', 'Pães & Bolos', 'Conta no limite de itens da cesta', true),
('cat-biscoitos', 'comp-cesta-1', 'Biscoitos & Bolachas', 'Conta no limite de itens da cesta', true),
('cat-frios-queijos', 'comp-cesta-1', 'Frios & Queijos', 'Conta no limite de itens da cesta', true),
('cat-doces-geleias', 'comp-cesta-1', 'Doces & Geleias', 'Conta no limite de itens da cesta', true),
('cat-frutas', 'comp-cesta-1', 'Frutas', 'Conta no limite de itens da cesta', true),
('cat-mercearia-cafe', 'comp-cesta-1', 'Café & Mercearia', 'Conta no limite de itens da cesta', true),
('cat-adicionais', 'comp-cesta-1', 'Adicionais (opcional, à parte)', 'Opcional, à parte (não conta no limite)', true),
('cat-padaria', 'comp-cesta-1', 'Padaria & Confeitaria', 'Pães especiais, torradas, croissants, bolos e waffles', true),
('cat-frios', 'comp-cesta-1', 'Frios & Laticínios', 'Queijos selecionados, iogurtes, manteigas e requeijão', true),
('cat-geleias', 'comp-cesta-1', 'Geleias & Doces', 'Geleias artesanais, mel puro, cremes e chocolates', true),
('cat-flores', 'comp-cesta-1', 'Flores & Afeto', 'Arranjos florais compactos e botões de rosas naturais', true),
('cat-canecas', 'comp-cesta-1', 'Canecas & Lembranças', 'Canecas de cerâmica, xícaras especiais e cartões comemorativos', true),
('cat-embalagens', 'comp-cesta-1', 'Cestas & Embalagens', 'Cestas de vime rústico, caixas cartonadas premium e laços', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name, description = EXCLUDED.description;

-- 3. Marcas Oficiais (39 marcas)
INSERT INTO marketflow.brands (id, company_id, name, description, active) VALUES
('brand-1', 'comp-cesta-1', 'Del Valle', NULL, true),
('brand-2', 'comp-cesta-1', 'Toddynho', NULL, true),
('brand-3', 'comp-cesta-1', 'Kero Coco', NULL, true),
('brand-4', 'comp-cesta-1', 'Danone', NULL, true),
('brand-5', 'comp-cesta-1', 'Ades', NULL, true),
('brand-6', 'comp-cesta-1', 'Natural One', NULL, true),
('brand-7', 'comp-cesta-1', 'Antarctica', NULL, true),
('brand-8', 'comp-cesta-1', 'Leão', NULL, true),
('brand-9', 'comp-cesta-1', 'Aurora', NULL, true),
('brand-10', 'comp-cesta-1', 'Maguary', NULL, true),
('brand-11', 'comp-cesta-1', 'Pullman', NULL, true),
('brand-12', 'comp-cesta-1', 'Wickbold', NULL, true),
('brand-13', 'comp-cesta-1', 'Ana Maria', NULL, true),
('brand-14', 'comp-cesta-1', 'Forno de Minas', NULL, true),
('brand-15', 'comp-cesta-1', 'Padaria', NULL, true),
('brand-16', 'comp-cesta-1', 'Trakinas', NULL, true),
('brand-17', 'comp-cesta-1', 'Negresco', NULL, true),
('brand-18', 'comp-cesta-1', 'Bono', NULL, true),
('brand-19', 'comp-cesta-1', 'Passatempo', NULL, true),
('brand-20', 'comp-cesta-1', 'Club Social', NULL, true),
('brand-21', 'comp-cesta-1', 'Adria', NULL, true),
('brand-22', 'comp-cesta-1', 'Bauducco', NULL, true),
('brand-23', 'comp-cesta-1', 'Sadia', NULL, true),
('brand-24', 'comp-cesta-1', 'Seara', NULL, true),
('brand-25', 'comp-cesta-1', 'Tirolez', NULL, true),
('brand-26', 'comp-cesta-1', 'Catupiry', NULL, true),
('brand-27', 'comp-cesta-1', 'Queensberry', NULL, true),
('brand-28', 'comp-cesta-1', 'Nutella', NULL, true),
('brand-29', 'comp-cesta-1', 'Aviação', NULL, true),
('brand-30', 'comp-cesta-1', 'Karo', NULL, true),
('brand-31', 'comp-cesta-1', 'Yoki', NULL, true),
('brand-32', 'comp-cesta-1', 'Hortifruti', NULL, true),
('brand-33', 'comp-cesta-1', 'Pilão', NULL, true),
('brand-34', 'comp-cesta-1', '3 Corações', NULL, true),
('brand-35', 'comp-cesta-1', 'Twinings', NULL, true),
('brand-36', 'comp-cesta-1', 'União', NULL, true),
('brand-37', 'comp-cesta-1', 'Salton', NULL, true),
('brand-38', 'comp-cesta-1', 'Pérgola', NULL, true),
('brand-39', 'comp-cesta-1', 'Lindt', NULL, true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 4. Fabricantes Oficiais
INSERT INTO marketflow.manufacturers (id, company_id, name, document, phone, email, active) VALUES
('mfg-1', 'comp-cesta-1', 'Ambev S.A.', '07.526.557/0001-00', '(11) 2122-1000', 'contato@ambev.com.br', true),
('mfg-2', 'comp-cesta-1', 'Coca-Cola FEMSA Brasil', '45.997.418/0001-53', '0800 021 2121', 'sac@cocacola.com.br', true),
('mfg-3', 'comp-cesta-1', 'Vinícola Aurora Bento Gonçalves', '87.548.724/0001-30', '(54) 3455-2000', 'comercial@vinicolaaurora.com.br', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 5. Fornecedores Oficiais
INSERT INTO marketflow.suppliers (id, company_id, name, legal_name, cnpj, phone, whatsapp, active) VALUES
('sup-1', 'comp-cesta-1', 'Distribuidora Matinais Brasil', 'Distribuidora Matinais Brasil Ltda', '11.222.333/0001-44', '(11) 3344-5566', '5511933445566', true),
('sup-2', 'comp-cesta-1', 'Empório Central de Alimentos', 'Empório Central Alimentos Eireli', '22.333.444/0001-55', '(11) 4455-6677', '5511944556677', true),
('sup-3', 'comp-cesta-1', 'Hortifruti & Flores Selecionadas', 'Hortifruti e Flores Ltda', '33.444.555/0001-66', '(11) 5566-7788', '5511955667788', true)
ON CONFLICT (id) DO UPDATE SET name = EXCLUDED.name;

-- 6. Produtos Oficiais (51 itens com shelf-life real)
INSERT INTO marketflow.products (
  id, company_id, category_id, brand_id, name, description,
  cost_price, sale_price, minimum_stock, maximum_stock,
  expiration_date, active, catalog_visible, show_price, allow_contact,
  active_in_basket, basket_sizes, drink_tier
) VALUES
(
  'beb-suco-delvalle-200',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Suco Del Valle Uva 200 ml',
  'Suco Del Valle Uva 200 ml (Del Valle). Ideal para montagem de cestas matinais personalizadas.',
  2.69,
  4.49,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena"]'::jsonb,
  'P'
),
(
  'beb-toddynho-200',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Achocolatado Toddynho 200 ml',
  'Achocolatado Toddynho 200 ml (Toddynho). Ideal para montagem de cestas matinais personalizadas.',
  1.97,
  3.29,
  5,
  50,
  '2026-12-30',
  true,
  true,
  true,
  true,
  true,
  '["pequena"]'::jsonb,
  'P'
),
(
  'beb-agua-coco-200',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Água de Coco Kero Coco 200 ml',
  'Água de Coco Kero Coco 200 ml (Kero Coco). Ideal para montagem de cestas matinais personalizadas.',
  2.99,
  4.99,
  5,
  50,
  '2027-01-14',
  true,
  true,
  true,
  true,
  true,
  '["pequena"]'::jsonb,
  'P'
),
(
  'beb-iog-danone-170',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Iogurte Líquido Danone 170 g',
  'Iogurte Líquido Danone 170 g (Danone). Ideal para montagem de cestas matinais personalizadas.',
  2.27,
  3.79,
  5,
  50,
  '2026-10-23',
  true,
  true,
  true,
  true,
  true,
  '["pequena"]'::jsonb,
  'P'
),
(
  'beb-ades-500',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Bebida de Soja Ades Maçã 500 ml',
  'Bebida de Soja Ades Maçã 500 ml (Ades). Ideal para montagem de cestas matinais personalizadas.',
  3.89,
  6.49,
  5,
  50,
  '2026-11-30',
  true,
  true,
  true,
  true,
  true,
  '["media"]'::jsonb,
  'M'
),
(
  'beb-suco-natone-500',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Suco Natural One Laranja 500 ml',
  'Suco Natural One Laranja 500 ml (Natural One). Ideal para montagem de cestas matinais personalizadas.',
  6.54,
  10.90,
  5,
  50,
  '2026-10-30',
  true,
  true,
  true,
  true,
  true,
  '["media"]'::jsonb,
  'M'
),
(
  'beb-guarana-350',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Guaraná Antarctica 350 ml (lata)',
  'Guaraná Antarctica 350 ml (lata) (Antarctica). Ideal para montagem de cestas matinais personalizadas.',
  2.99,
  4.99,
  5,
  50,
  '2027-04-14',
  true,
  true,
  true,
  true,
  true,
  '["media"]'::jsonb,
  'M'
),
(
  'beb-cha-leao-450',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Chá Leão Pêssego 450 ml',
  'Chá Leão Pêssego 450 ml (Leão). Ideal para montagem de cestas matinais personalizadas.',
  4.14,
  6.90,
  5,
  50,
  '2027-01-14',
  true,
  true,
  true,
  true,
  true,
  '["media"]'::jsonb,
  'M'
),
(
  'beb-suco-aurora-1l',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Suco de Uva Integral Aurora 1 L',
  'Suco de Uva Integral Aurora 1 L (Aurora). Ideal para montagem de cestas matinais personalizadas.',
  11.34,
  18.90,
  5,
  50,
  '2027-02-13',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  'G'
),
(
  'beb-maguary-1l',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Néctar Maguary Manga 1 L',
  'Néctar Maguary Manga 1 L (Maguary). Ideal para montagem de cestas matinais personalizadas.',
  5.94,
  9.90,
  5,
  50,
  '2027-01-24',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  'G'
),
(
  'beb-guarana-1l',
  'comp-cesta-1',
  'cat-bebidas',
  NULL,
  'Guaraná Antarctica 1 L',
  'Guaraná Antarctica 1 L (Antarctica). Ideal para montagem de cestas matinais personalizadas.',
  5.09,
  8.49,
  5,
  50,
  '2027-04-14',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  'G'
),
(
  'pb-pao-forma-pullman',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Pão de Forma Pullman 100% Integral',
  'Pão de Forma Pullman 100% Integral (Pullman). Ideal para montagem de cestas matinais personalizadas.',
  5.94,
  9.90,
  5,
  50,
  '2026-10-30',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'pb-bisnaguinha-wickbold',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Bisnaguinha Wickbold',
  'Bisnaguinha Wickbold (Wickbold). Ideal para montagem de cestas matinais personalizadas.',
  4.49,
  7.49,
  5,
  50,
  '2026-11-03',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'pb-bolo-anamaria',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Bolinho Ana Maria (unid.)',
  'Bolinho Ana Maria (unid.) (Ana Maria). Ideal para montagem de cestas matinais personalizadas.',
  2.09,
  3.49,
  5,
  50,
  '2026-11-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'pb-pao-queijo-fdm',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Pão de Queijo Forno de Minas 400 g',
  'Pão de Queijo Forno de Minas 400 g (Forno de Minas). Ideal para montagem de cestas matinais personalizadas.',
  10.14,
  16.90,
  5,
  50,
  '2027-01-14',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'pb-croissant',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Croissant Folhado (unid.)',
  'Croissant Folhado (unid.) (Padaria). Ideal para montagem de cestas matinais personalizadas.',
  3.30,
  5.50,
  5,
  50,
  '2026-10-19',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'pb-rosca-coco',
  'comp-cesta-1',
  'cat-paes-bolos',
  NULL,
  'Rosca de Coco (unid.)',
  'Rosca de Coco (unid.) (Padaria). Ideal para montagem de cestas matinais personalizadas.',
  7.74,
  12.90,
  5,
  50,
  '2026-10-21',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  NULL
),
(
  'bis-trakinas-morango',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Biscoito Recheado Trakinas Morango',
  'Biscoito Recheado Trakinas Morango (Trakinas). Ideal para montagem de cestas matinais personalizadas.',
  1.91,
  3.19,
  5,
  50,
  '2027-03-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-negresco',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Biscoito Recheado Negresco',
  'Biscoito Recheado Negresco (Negresco). Ideal para montagem de cestas matinais personalizadas.',
  2.09,
  3.49,
  5,
  50,
  '2027-03-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-bono-choc',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Biscoito Bono Chocolate',
  'Biscoito Bono Chocolate (Bono). Ideal para montagem de cestas matinais personalizadas.',
  1.97,
  3.29,
  5,
  50,
  '2027-03-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-passatempo',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Biscoito Recheado Passatempo',
  'Biscoito Recheado Passatempo (Passatempo). Ideal para montagem de cestas matinais personalizadas.',
  2.03,
  3.39,
  5,
  50,
  '2027-03-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-club-social',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Biscoito Club Social Original (6x)',
  'Biscoito Club Social Original (6x) (Club Social). Ideal para montagem de cestas matinais personalizadas.',
  3.29,
  5.49,
  5,
  50,
  '2027-01-14',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-cream-cracker-adria',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Cream Cracker Adria',
  'Cream Cracker Adria (Adria). Ideal para montagem de cestas matinais personalizadas.',
  2.57,
  4.29,
  5,
  50,
  '2027-02-13',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'bis-waffer-bauducco',
  'comp-cesta-1',
  'cat-biscoitos',
  NULL,
  'Wafer Bauducco Chocolate',
  'Wafer Bauducco Chocolate (Bauducco). Ideal para montagem de cestas matinais personalizadas.',
  2.27,
  3.79,
  5,
  50,
  '2027-03-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fq-queijo-prato-sadia',
  'comp-cesta-1',
  'cat-frios-queijos',
  NULL,
  'Queijo Prato Fatiado Sadia 150 g',
  'Queijo Prato Fatiado Sadia 150 g (Sadia). Ideal para montagem de cestas matinais personalizadas.',
  7.74,
  12.90,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fq-presunto-seara',
  'comp-cesta-1',
  'cat-frios-queijos',
  NULL,
  'Presunto Cozido Fatiado Seara 150 g',
  'Presunto Cozido Fatiado Seara 150 g (Seara). Ideal para montagem de cestas matinais personalizadas.',
  5.94,
  9.90,
  5,
  50,
  '2026-10-21',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fq-mussarela-tirolez',
  'comp-cesta-1',
  'cat-frios-queijos',
  NULL,
  'Mussarela Fatiada Tirolez 150 g',
  'Mussarela Fatiada Tirolez 150 g (Tirolez). Ideal para montagem de cestas matinais personalizadas.',
  8.10,
  13.50,
  5,
  50,
  '2026-10-31',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fq-requeijao-catupiry',
  'comp-cesta-1',
  'cat-frios-queijos',
  NULL,
  'Requeijão Catupiry 200 g',
  'Requeijão Catupiry 200 g (Catupiry). Ideal para montagem de cestas matinais personalizadas.',
  7.14,
  11.90,
  5,
  50,
  '2026-11-25',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'dg-geleia-queensberry',
  'comp-cesta-1',
  'cat-doces-geleias',
  NULL,
  'Geleia Queensberry Morango 320 g',
  'Geleia Queensberry Morango 320 g (Queensberry). Ideal para montagem de cestas matinais personalizadas.',
  9.54,
  15.90,
  5,
  50,
  '2027-08-12',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'dg-nutella-140',
  'comp-cesta-1',
  'cat-doces-geleias',
  NULL,
  'Creme de Avelã Nutella 140 g',
  'Creme de Avelã Nutella 140 g (Nutella). Ideal para montagem de cestas matinais personalizadas.',
  8.34,
  13.90,
  5,
  50,
  '2027-08-12',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'dg-doce-leite-aviacao',
  'comp-cesta-1',
  'cat-doces-geleias',
  NULL,
  'Doce de Leite Aviação 400 g',
  'Doce de Leite Aviação 400 g (Aviação). Ideal para montagem de cestas matinais personalizadas.',
  7.50,
  12.50,
  5,
  50,
  '2027-08-12',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'dg-mel-karo',
  'comp-cesta-1',
  'cat-doces-geleias',
  NULL,
  'Mel Karo Squeeze 200 g',
  'Mel Karo Squeeze 200 g (Karo). Ideal para montagem de cestas matinais personalizadas.',
  8.94,
  14.90,
  5,
  50,
  '2027-08-12',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'dg-pacoca-yoki',
  'comp-cesta-1',
  'cat-doces-geleias',
  NULL,
  'Paçoca Rolha Yoki (unid.)',
  'Paçoca Rolha Yoki (unid.) (Yoki). Ideal para montagem de cestas matinais personalizadas.',
  0.77,
  1.29,
  5,
  50,
  '2027-08-12',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'fr-maca',
  'comp-cesta-1',
  'cat-frutas',
  NULL,
  'Maçã Gala (unid.)',
  'Maçã Gala (unid.) (Hortifruti). Ideal para montagem de cestas matinais personalizadas.',
  1.19,
  1.99,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'fr-banana',
  'comp-cesta-1',
  'cat-frutas',
  NULL,
  'Banana Prata (unid.)',
  'Banana Prata (unid.) (Hortifruti). Ideal para montagem de cestas matinais personalizadas.',
  0.77,
  1.29,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'fr-uva-verde',
  'comp-cesta-1',
  'cat-frutas',
  NULL,
  'Uva Verde sem Semente (150 g)',
  'Uva Verde sem Semente (150 g) (Hortifruti). Ideal para montagem de cestas matinais personalizadas.',
  4.14,
  6.90,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fr-morango-bandeja',
  'comp-cesta-1',
  'cat-frutas',
  NULL,
  'Morango Bandeja 250 g',
  'Morango Bandeja 250 g (Hortifruti). Ideal para montagem de cestas matinais personalizadas.',
  5.94,
  9.90,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'fr-kiwi',
  'comp-cesta-1',
  'cat-frutas',
  NULL,
  'Kiwi (unid.)',
  'Kiwi (unid.) (Hortifruti). Ideal para montagem de cestas matinais personalizadas.',
  1.49,
  2.49,
  5,
  50,
  '2026-10-28',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  NULL
),
(
  'mc-cafe-pilao-sache',
  'comp-cesta-1',
  'cat-mercearia-cafe',
  NULL,
  'Café Pilão em sachê (10 g)',
  'Café Pilão em sachê (10 g) (Pilão). Ideal para montagem de cestas matinais personalizadas.',
  0.89,
  1.49,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'mc-capuccino-3coracoes',
  'comp-cesta-1',
  'cat-mercearia-cafe',
  NULL,
  'Cappuccino 3 Corações Sachê',
  'Cappuccino 3 Corações Sachê (3 Corações). Ideal para montagem de cestas matinais personalizadas.',
  1.49,
  2.49,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'mc-cha-twinings',
  'comp-cesta-1',
  'cat-mercearia-cafe',
  NULL,
  'Chá Twinings (cx. 10 saquinhos)',
  'Chá Twinings (cx. 10 saquinhos) (Twinings). Ideal para montagem de cestas matinais personalizadas.',
  7.14,
  11.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'mc-manteiga-aviacao',
  'comp-cesta-1',
  'cat-mercearia-cafe',
  NULL,
  'Manteiga Aviação 200 g',
  'Manteiga Aviação 200 g (Aviação). Ideal para montagem de cestas matinais personalizadas.',
  8.34,
  13.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'mc-acucar-sache',
  'comp-cesta-1',
  'cat-mercearia-cafe',
  NULL,
  'Açúcar refinado em sachês (10x)',
  'Açúcar refinado em sachês (10x) (União). Ideal para montagem de cestas matinais personalizadas.',
  2.34,
  3.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'ad-caneca',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Caneca personalizada',
  'Caneca personalizada (Sem marca). Ideal para montagem de cestas matinais personalizadas.',
  14.94,
  24.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'ad-cartao',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Cartão com mensagem',
  'Cartão com mensagem (Sem marca). Ideal para montagem de cestas matinais personalizadas.',
  3.00,
  5.00,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'ad-balao',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Balão metalizado',
  'Balão metalizado (Sem marca). Ideal para montagem de cestas matinais personalizadas.',
  8.94,
  14.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'ad-mini-buque',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Mini buquê de flores',
  'Mini buquê de flores (Sem marca). Ideal para montagem de cestas matinais personalizadas.',
  17.94,
  29.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["pequena","media","grande"]'::jsonb,
  NULL
),
(
  'ad-espumante',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Mini Espumante Salton 187 ml',
  'Mini Espumante Salton 187 ml (Salton). Ideal para montagem de cestas matinais personalizadas.',
  13.74,
  22.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'ad-vinho-pergola',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Vinho Pérgola Tinto Suave 750 ml',
  'Vinho Pérgola Tinto Suave 750 ml (Pérgola). Ideal para montagem de cestas matinais personalizadas.',
  17.94,
  29.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["grande"]'::jsonb,
  NULL
),
(
  'ad-chocolate-lindt',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Chocolate Lindt Lindor 100 g',
  'Chocolate Lindt Lindor 100 g (Lindt). Ideal para montagem de cestas matinais personalizadas.',
  20.94,
  34.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
),
(
  'ad-taca',
  'comp-cesta-1',
  'cat-adicionais',
  NULL,
  'Par de taças de vidro',
  'Par de taças de vidro (Sem marca). Ideal para montagem de cestas matinais personalizadas.',
  11.94,
  19.90,
  5,
  50,
  '2026-12-15',
  true,
  true,
  true,
  true,
  true,
  '["media","grande"]'::jsonb,
  NULL
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  sale_price = EXCLUDED.sale_price,
  cost_price = EXCLUDED.cost_price,
  expiration_date = EXCLUDED.expiration_date,
  active_in_basket = EXCLUDED.active_in_basket,
  basket_sizes = EXCLUDED.basket_sizes,
  drink_tier = EXCLUDED.drink_tier;

-- 7. Estoque Inicial (25 unidades de cada produto)
INSERT INTO marketflow.inventory_items (id, company_id, product_id, quantity, reserved_quantity, location) VALUES
('inv-beb-suco-delvalle-200', 'comp-cesta-1', 'beb-suco-delvalle-200', 25, 0, 'Prateleira A'),
('inv-beb-toddynho-200', 'comp-cesta-1', 'beb-toddynho-200', 25, 0, 'Prateleira A'),
('inv-beb-agua-coco-200', 'comp-cesta-1', 'beb-agua-coco-200', 25, 0, 'Prateleira A'),
('inv-beb-iog-danone-170', 'comp-cesta-1', 'beb-iog-danone-170', 25, 0, 'Prateleira A'),
('inv-beb-ades-500', 'comp-cesta-1', 'beb-ades-500', 25, 0, 'Prateleira A'),
('inv-beb-suco-natone-500', 'comp-cesta-1', 'beb-suco-natone-500', 25, 0, 'Prateleira A'),
('inv-beb-guarana-350', 'comp-cesta-1', 'beb-guarana-350', 25, 0, 'Prateleira A'),
('inv-beb-cha-leao-450', 'comp-cesta-1', 'beb-cha-leao-450', 25, 0, 'Prateleira A'),
('inv-beb-suco-aurora-1l', 'comp-cesta-1', 'beb-suco-aurora-1l', 25, 0, 'Prateleira A'),
('inv-beb-maguary-1l', 'comp-cesta-1', 'beb-maguary-1l', 25, 0, 'Prateleira A'),
('inv-beb-guarana-1l', 'comp-cesta-1', 'beb-guarana-1l', 25, 0, 'Prateleira A'),
('inv-pb-pao-forma-pullman', 'comp-cesta-1', 'pb-pao-forma-pullman', 25, 0, 'Prateleira A'),
('inv-pb-bisnaguinha-wickbold', 'comp-cesta-1', 'pb-bisnaguinha-wickbold', 25, 0, 'Prateleira A'),
('inv-pb-bolo-anamaria', 'comp-cesta-1', 'pb-bolo-anamaria', 25, 0, 'Prateleira A'),
('inv-pb-pao-queijo-fdm', 'comp-cesta-1', 'pb-pao-queijo-fdm', 25, 0, 'Prateleira A'),
('inv-pb-croissant', 'comp-cesta-1', 'pb-croissant', 25, 0, 'Prateleira A'),
('inv-pb-rosca-coco', 'comp-cesta-1', 'pb-rosca-coco', 25, 0, 'Prateleira A'),
('inv-bis-trakinas-morango', 'comp-cesta-1', 'bis-trakinas-morango', 25, 0, 'Prateleira A'),
('inv-bis-negresco', 'comp-cesta-1', 'bis-negresco', 25, 0, 'Prateleira A'),
('inv-bis-bono-choc', 'comp-cesta-1', 'bis-bono-choc', 25, 0, 'Prateleira A'),
('inv-bis-passatempo', 'comp-cesta-1', 'bis-passatempo', 25, 0, 'Prateleira A'),
('inv-bis-club-social', 'comp-cesta-1', 'bis-club-social', 25, 0, 'Prateleira A'),
('inv-bis-cream-cracker-adria', 'comp-cesta-1', 'bis-cream-cracker-adria', 25, 0, 'Prateleira A'),
('inv-bis-waffer-bauducco', 'comp-cesta-1', 'bis-waffer-bauducco', 25, 0, 'Prateleira A'),
('inv-fq-queijo-prato-sadia', 'comp-cesta-1', 'fq-queijo-prato-sadia', 25, 0, 'Prateleira A'),
('inv-fq-presunto-seara', 'comp-cesta-1', 'fq-presunto-seara', 25, 0, 'Prateleira A'),
('inv-fq-mussarela-tirolez', 'comp-cesta-1', 'fq-mussarela-tirolez', 25, 0, 'Prateleira A'),
('inv-fq-requeijao-catupiry', 'comp-cesta-1', 'fq-requeijao-catupiry', 25, 0, 'Prateleira A'),
('inv-dg-geleia-queensberry', 'comp-cesta-1', 'dg-geleia-queensberry', 25, 0, 'Prateleira A'),
('inv-dg-nutella-140', 'comp-cesta-1', 'dg-nutella-140', 25, 0, 'Prateleira A'),
('inv-dg-doce-leite-aviacao', 'comp-cesta-1', 'dg-doce-leite-aviacao', 25, 0, 'Prateleira A'),
('inv-dg-mel-karo', 'comp-cesta-1', 'dg-mel-karo', 25, 0, 'Prateleira A'),
('inv-dg-pacoca-yoki', 'comp-cesta-1', 'dg-pacoca-yoki', 25, 0, 'Prateleira A'),
('inv-fr-maca', 'comp-cesta-1', 'fr-maca', 25, 0, 'Prateleira A'),
('inv-fr-banana', 'comp-cesta-1', 'fr-banana', 25, 0, 'Prateleira A'),
('inv-fr-uva-verde', 'comp-cesta-1', 'fr-uva-verde', 25, 0, 'Prateleira A'),
('inv-fr-morango-bandeja', 'comp-cesta-1', 'fr-morango-bandeja', 25, 0, 'Prateleira A'),
('inv-fr-kiwi', 'comp-cesta-1', 'fr-kiwi', 25, 0, 'Prateleira A'),
('inv-mc-cafe-pilao-sache', 'comp-cesta-1', 'mc-cafe-pilao-sache', 25, 0, 'Prateleira A'),
('inv-mc-capuccino-3coracoes', 'comp-cesta-1', 'mc-capuccino-3coracoes', 25, 0, 'Prateleira A'),
('inv-mc-cha-twinings', 'comp-cesta-1', 'mc-cha-twinings', 25, 0, 'Prateleira A'),
('inv-mc-manteiga-aviacao', 'comp-cesta-1', 'mc-manteiga-aviacao', 25, 0, 'Prateleira A'),
('inv-mc-acucar-sache', 'comp-cesta-1', 'mc-acucar-sache', 25, 0, 'Prateleira A'),
('inv-ad-caneca', 'comp-cesta-1', 'ad-caneca', 25, 0, 'Prateleira A'),
('inv-ad-cartao', 'comp-cesta-1', 'ad-cartao', 25, 0, 'Prateleira A'),
('inv-ad-balao', 'comp-cesta-1', 'ad-balao', 25, 0, 'Prateleira A'),
('inv-ad-mini-buque', 'comp-cesta-1', 'ad-mini-buque', 25, 0, 'Prateleira A'),
('inv-ad-espumante', 'comp-cesta-1', 'ad-espumante', 25, 0, 'Prateleira A'),
('inv-ad-vinho-pergola', 'comp-cesta-1', 'ad-vinho-pergola', 25, 0, 'Prateleira A'),
('inv-ad-chocolate-lindt', 'comp-cesta-1', 'ad-chocolate-lindt', 25, 0, 'Prateleira A'),
('inv-ad-taca', 'comp-cesta-1', 'ad-taca', 25, 0, 'Prateleira A')
ON CONFLICT (id) DO UPDATE SET quantity = EXCLUDED.quantity;

-- 8. Lotes com Data de Validade Real
INSERT INTO marketflow.lots (id, company_id, product_id, lot_number, initial_quantity, current_quantity, manufacturing_date, expiration_date, cost_price, status) VALUES
('lot-beb-suco-delvalle-200', 'comp-cesta-1', 'beb-suco-delvalle-200', 'LOT-2026-001', 25, 25, '2026-01-10', '2026-12-15', 2.69, 'active'),
('lot-beb-toddynho-200', 'comp-cesta-1', 'beb-toddynho-200', 'LOT-2026-002', 25, 25, '2026-01-10', '2026-12-30', 1.97, 'active'),
('lot-beb-agua-coco-200', 'comp-cesta-1', 'beb-agua-coco-200', 'LOT-2026-003', 25, 25, '2026-01-10', '2027-01-14', 2.99, 'active'),
('lot-beb-iog-danone-170', 'comp-cesta-1', 'beb-iog-danone-170', 'LOT-2026-004', 25, 25, '2026-01-10', '2026-10-23', 2.27, 'active'),
('lot-beb-ades-500', 'comp-cesta-1', 'beb-ades-500', 'LOT-2026-005', 25, 25, '2026-01-10', '2026-11-30', 3.89, 'active'),
('lot-beb-suco-natone-500', 'comp-cesta-1', 'beb-suco-natone-500', 'LOT-2026-006', 25, 25, '2026-01-10', '2026-10-30', 6.54, 'active'),
('lot-beb-guarana-350', 'comp-cesta-1', 'beb-guarana-350', 'LOT-2026-007', 25, 25, '2026-01-10', '2027-04-14', 2.99, 'active'),
('lot-beb-cha-leao-450', 'comp-cesta-1', 'beb-cha-leao-450', 'LOT-2026-008', 25, 25, '2026-01-10', '2027-01-14', 4.14, 'active'),
('lot-beb-suco-aurora-1l', 'comp-cesta-1', 'beb-suco-aurora-1l', 'LOT-2026-009', 25, 25, '2026-01-10', '2027-02-13', 11.34, 'active'),
('lot-beb-maguary-1l', 'comp-cesta-1', 'beb-maguary-1l', 'LOT-2026-010', 25, 25, '2026-01-10', '2027-01-24', 5.94, 'active'),
('lot-beb-guarana-1l', 'comp-cesta-1', 'beb-guarana-1l', 'LOT-2026-011', 25, 25, '2026-01-10', '2027-04-14', 5.09, 'active'),
('lot-pb-pao-forma-pullman', 'comp-cesta-1', 'pb-pao-forma-pullman', 'LOT-2026-012', 25, 25, '2026-01-10', '2026-10-30', 5.94, 'active'),
('lot-pb-bisnaguinha-wickbold', 'comp-cesta-1', 'pb-bisnaguinha-wickbold', 'LOT-2026-013', 25, 25, '2026-01-10', '2026-11-03', 4.49, 'active'),
('lot-pb-bolo-anamaria', 'comp-cesta-1', 'pb-bolo-anamaria', 'LOT-2026-014', 25, 25, '2026-01-10', '2026-11-15', 2.09, 'active'),
('lot-pb-pao-queijo-fdm', 'comp-cesta-1', 'pb-pao-queijo-fdm', 'LOT-2026-015', 25, 25, '2026-01-10', '2027-01-14', 10.14, 'active'),
('lot-pb-croissant', 'comp-cesta-1', 'pb-croissant', 'LOT-2026-016', 25, 25, '2026-01-10', '2026-10-19', 3.30, 'active'),
('lot-pb-rosca-coco', 'comp-cesta-1', 'pb-rosca-coco', 'LOT-2026-017', 25, 25, '2026-01-10', '2026-10-21', 7.74, 'active'),
('lot-bis-trakinas-morango', 'comp-cesta-1', 'bis-trakinas-morango', 'LOT-2026-018', 25, 25, '2026-01-10', '2027-03-15', 1.91, 'active'),
('lot-bis-negresco', 'comp-cesta-1', 'bis-negresco', 'LOT-2026-019', 25, 25, '2026-01-10', '2027-03-15', 2.09, 'active'),
('lot-bis-bono-choc', 'comp-cesta-1', 'bis-bono-choc', 'LOT-2026-020', 25, 25, '2026-01-10', '2027-03-15', 1.97, 'active'),
('lot-bis-passatempo', 'comp-cesta-1', 'bis-passatempo', 'LOT-2026-021', 25, 25, '2026-01-10', '2027-03-15', 2.03, 'active'),
('lot-bis-club-social', 'comp-cesta-1', 'bis-club-social', 'LOT-2026-022', 25, 25, '2026-01-10', '2027-01-14', 3.29, 'active'),
('lot-bis-cream-cracker-adria', 'comp-cesta-1', 'bis-cream-cracker-adria', 'LOT-2026-023', 25, 25, '2026-01-10', '2027-02-13', 2.57, 'active'),
('lot-bis-waffer-bauducco', 'comp-cesta-1', 'bis-waffer-bauducco', 'LOT-2026-024', 25, 25, '2026-01-10', '2027-03-15', 2.27, 'active'),
('lot-fq-queijo-prato-sadia', 'comp-cesta-1', 'fq-queijo-prato-sadia', 'LOT-2026-025', 25, 25, '2026-01-10', '2026-10-28', 7.74, 'active'),
('lot-fq-presunto-seara', 'comp-cesta-1', 'fq-presunto-seara', 'LOT-2026-026', 25, 25, '2026-01-10', '2026-10-21', 5.94, 'active'),
('lot-fq-mussarela-tirolez', 'comp-cesta-1', 'fq-mussarela-tirolez', 'LOT-2026-027', 25, 25, '2026-01-10', '2026-10-31', 8.10, 'active'),
('lot-fq-requeijao-catupiry', 'comp-cesta-1', 'fq-requeijao-catupiry', 'LOT-2026-028', 25, 25, '2026-01-10', '2026-11-25', 7.14, 'active'),
('lot-dg-geleia-queensberry', 'comp-cesta-1', 'dg-geleia-queensberry', 'LOT-2026-029', 25, 25, '2026-01-10', '2027-08-12', 9.54, 'active'),
('lot-dg-nutella-140', 'comp-cesta-1', 'dg-nutella-140', 'LOT-2026-030', 25, 25, '2026-01-10', '2027-08-12', 8.34, 'active'),
('lot-dg-doce-leite-aviacao', 'comp-cesta-1', 'dg-doce-leite-aviacao', 'LOT-2026-031', 25, 25, '2026-01-10', '2027-08-12', 7.50, 'active'),
('lot-dg-mel-karo', 'comp-cesta-1', 'dg-mel-karo', 'LOT-2026-032', 25, 25, '2026-01-10', '2027-08-12', 8.94, 'active'),
('lot-dg-pacoca-yoki', 'comp-cesta-1', 'dg-pacoca-yoki', 'LOT-2026-033', 25, 25, '2026-01-10', '2027-08-12', 0.77, 'active'),
('lot-fr-maca', 'comp-cesta-1', 'fr-maca', 'LOT-2026-034', 25, 25, '2026-01-10', '2026-10-28', 1.19, 'active'),
('lot-fr-banana', 'comp-cesta-1', 'fr-banana', 'LOT-2026-035', 25, 25, '2026-01-10', '2026-10-28', 0.77, 'active'),
('lot-fr-uva-verde', 'comp-cesta-1', 'fr-uva-verde', 'LOT-2026-036', 25, 25, '2026-01-10', '2026-10-28', 4.14, 'active'),
('lot-fr-morango-bandeja', 'comp-cesta-1', 'fr-morango-bandeja', 'LOT-2026-037', 25, 25, '2026-01-10', '2026-10-28', 5.94, 'active'),
('lot-fr-kiwi', 'comp-cesta-1', 'fr-kiwi', 'LOT-2026-038', 25, 25, '2026-01-10', '2026-10-28', 1.49, 'active'),
('lot-mc-cafe-pilao-sache', 'comp-cesta-1', 'mc-cafe-pilao-sache', 'LOT-2026-039', 25, 25, '2026-01-10', '2026-12-15', 0.89, 'active'),
('lot-mc-capuccino-3coracoes', 'comp-cesta-1', 'mc-capuccino-3coracoes', 'LOT-2026-040', 25, 25, '2026-01-10', '2026-12-15', 1.49, 'active'),
('lot-mc-cha-twinings', 'comp-cesta-1', 'mc-cha-twinings', 'LOT-2026-041', 25, 25, '2026-01-10', '2026-12-15', 7.14, 'active'),
('lot-mc-manteiga-aviacao', 'comp-cesta-1', 'mc-manteiga-aviacao', 'LOT-2026-042', 25, 25, '2026-01-10', '2026-12-15', 8.34, 'active'),
('lot-mc-acucar-sache', 'comp-cesta-1', 'mc-acucar-sache', 'LOT-2026-043', 25, 25, '2026-01-10', '2026-12-15', 2.34, 'active'),
('lot-ad-caneca', 'comp-cesta-1', 'ad-caneca', 'LOT-2026-044', 25, 25, '2026-01-10', '2026-12-15', 14.94, 'active'),
('lot-ad-cartao', 'comp-cesta-1', 'ad-cartao', 'LOT-2026-045', 25, 25, '2026-01-10', '2026-12-15', 3.00, 'active'),
('lot-ad-balao', 'comp-cesta-1', 'ad-balao', 'LOT-2026-046', 25, 25, '2026-01-10', '2026-12-15', 8.94, 'active'),
('lot-ad-mini-buque', 'comp-cesta-1', 'ad-mini-buque', 'LOT-2026-047', 25, 25, '2026-01-10', '2026-12-15', 17.94, 'active'),
('lot-ad-espumante', 'comp-cesta-1', 'ad-espumante', 'LOT-2026-048', 25, 25, '2026-01-10', '2026-12-15', 13.74, 'active'),
('lot-ad-vinho-pergola', 'comp-cesta-1', 'ad-vinho-pergola', 'LOT-2026-049', 25, 25, '2026-01-10', '2026-12-15', 17.94, 'active'),
('lot-ad-chocolate-lindt', 'comp-cesta-1', 'ad-chocolate-lindt', 'LOT-2026-050', 25, 25, '2026-01-10', '2026-12-15', 20.94, 'active'),
('lot-ad-taca', 'comp-cesta-1', 'ad-taca', 'LOT-2026-051', 25, 25, '2026-01-10', '2026-12-15', 11.94, 'active')
ON CONFLICT (id) DO UPDATE SET expiration_date = EXCLUDED.expiration_date;

-- ====================================================================
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
