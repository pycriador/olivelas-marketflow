import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Product } from '../../types';

export const productsService = {
  async fetchProducts(companyId?: string): Promise<Product[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          manufacturer:manufacturers(*),
          supplier:suppliers(*),
          inventory:inventory_items(*)
        `)
        .order('name', { ascending: true });

      if (companyId) {
        query = query.eq('company_id', companyId);
      }

      const { data, error } = await query;

      if (error) {
        console.warn('Supabase fetchProducts warning:', error.message);
        return [];
      }

      // Converte estrutura aninhada retornada pelo Supabase se necessário
      return (data || []).map((row: any) => {
        const inv = Array.isArray(row.inventory) ? row.inventory[0] : row.inventory;
        return {
          ...row,
          inventory: inv || undefined,
        } as Product;
      });
    } catch (err) {
      console.warn('Supabase fetchProducts error:', err);
      return [];
    }
  },

  async getProductById(id: string): Promise<Product | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          category:categories(*),
          brand:brands(*),
          manufacturer:manufacturers(*),
          supplier:suppliers(*),
          inventory:inventory_items(*)
        `)
        .eq('id', id)
        .single();

      if (error) return null;

      const inv = Array.isArray(data.inventory) ? data.inventory[0] : data.inventory;
      return {
        ...data,
        inventory: inv || undefined,
      } as Product;
    } catch {
      return null;
    }
  },

  async saveProduct(product: Product): Promise<Product> {
    if (!isSupabaseConfigured()) return product;

    try {
      const payload: any = {
        id: product.id,
        company_id: product.company_id,
        category_id: product.category_id || null,
        brand_id: product.brand_id || null,
        manufacturer_id: product.manufacturer_id || null,
        supplier_id: product.default_supplier_id || null,
        name: product.name,
        description: product.description || null,
        sku: product.sku || null,
        barcode: product.barcode || null,
        unit: product.unit || 'UN',
        cost_price: product.cost_price || 0,
        sale_price: product.sale_price || 0,
        minimum_stock: product.minimum_stock || 0,
        maximum_stock: product.maximum_stock || 0,
        expiration_date: product.expiration_date || null,
        active: product.active ?? true,
        catalog_visible: product.catalog_visible ?? true,
        show_price: product.show_price ?? true,
        allow_contact: product.allow_contact ?? true,
        active_in_basket: product.active_in_basket ?? true,
        basket_sizes: product.basket_sizes || ['pequena', 'media', 'grande'],
        drink_tier: product.drink_tier || null,
        image_url: product.image_url || null,
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('products')
        .upsert(payload)
        .select()
        .single();

      if (error) {
        console.warn('Supabase saveProduct warning:', error.message);
        return product;
      }

      // Garante que existe registro na tabela inventory_items
      if (product.inventory) {
        await supabase.from('inventory_items').upsert({
          id: product.inventory.id || `inv-${product.id}`,
          company_id: product.company_id,
          product_id: product.id,
          quantity: product.inventory.quantity ?? 0,
          reserved_quantity: product.inventory.reserved_quantity ?? 0,
          updated_at: new Date().toISOString(),
        });
      }

      return {
        ...product,
        ...data,
      };
    } catch (err) {
      console.warn('Supabase saveProduct error:', err);
      return product;
    }
  },

  async deleteProduct(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('products').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteProduct error:', err);
    }
  },
};
