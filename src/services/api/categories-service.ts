import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Category, Brand, Manufacturer, Supplier, CatalogRequest } from '../../types';

export const categoriesService = {
  async fetchCategories(companyId?: string): Promise<Category[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('categories').select('*').order('name');
      if (companyId) query = query.eq('company_id', companyId);

      const { data, error } = await query;
      if (error) return [];
      return (data || []) as Category[];
    } catch {
      return [];
    }
  },

  async saveCategory(category: Category): Promise<Category> {
    if (!isSupabaseConfigured()) return category;

    try {
      const { data, error } = await supabase
        .from('categories')
        .upsert({
          id: category.id,
          company_id: category.company_id,
          name: category.name,
          description: category.description || null,
          parent_id: category.parent_id || null,
          image_url: category.image_url || null,
          active: category.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return category;
      return data as Category;
    } catch {
      return category;
    }
  },

  async deleteCategory(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('categories').delete().eq('id', id);
    } catch {}
  },
};

export const brandsService = {
  async fetchBrands(companyId?: string): Promise<Brand[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      let query = supabase.from('brands').select('*').order('name');
      if (companyId) query = query.eq('company_id', companyId);

      const { data, error } = await query;
      if (error) return [];
      return (data || []) as Brand[];
    } catch {
      return [];
    }
  },

  async saveBrand(brand: Brand): Promise<Brand> {
    if (!isSupabaseConfigured()) return brand;

    try {
      const { data, error } = await supabase
        .from('brands')
        .upsert({
          id: brand.id,
          company_id: brand.company_id,
          name: brand.name,
          description: brand.description || null,
          manufacturer_id: brand.manufacturer_id || null,
          logo_url: brand.logo_url || null,
          active: brand.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return brand;
      return data as Brand;
    } catch {
      return brand;
    }
  },

  async deleteBrand(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;
    try {
      await supabase.from('brands').delete().eq('id', id);
    } catch {}
  },
};

export const catalogService = {
  async createRequest(request: CatalogRequest): Promise<CatalogRequest> {
    if (!isSupabaseConfigured()) return request;

    try {
      const { data, error } = await supabase
        .from('catalog_requests')
        .insert({
          id: request.id,
          company_id: request.company_id,
          customer_name: request.customer_name,
          customer_phone: request.customer_phone,
          customer_email: request.customer_email || null,
          notes: request.notes || null,
          items: request.items || [],
          status: request.status || 'new',
          created_at: request.created_at || new Date().toISOString(),
          updated_at: request.updated_at || new Date().toISOString(),
        })
        .select()
        .single();

      if (error) return request;
      return data as CatalogRequest;
    } catch {
      return request;
    }
  },
};
