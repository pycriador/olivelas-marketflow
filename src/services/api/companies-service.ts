import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Company } from '../../types';

export const companiesService = {
  async fetchCompanies(): Promise<Company[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.warn('Supabase fetch companies failed:', error.message);
        return [];
      }

      return (data || []) as Company[];
    } catch (err) {
      console.warn('Network error querying companies:', err);
      return [];
    }
  },

  async getCompanyBySlug(slug: string): Promise<Company | null> {
    if (!isSupabaseConfigured()) return null;

    try {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .or(`slug.eq.${slug},id.eq.${slug}`)
        .single();

      if (error) return null;
      return data as Company;
    } catch {
      return null;
    }
  },

  async saveCompany(company: Company): Promise<Company> {
    if (!isSupabaseConfigured()) return company;

    try {
      const { data, error } = await supabase
        .from('companies')
        .upsert({
          id: company.id,
          name: company.name,
          legal_name: company.legal_name,
          cnpj: company.cnpj,
          slug: company.slug,
          email: company.email,
          phone: company.phone,
          whatsapp: company.whatsapp,
          logo_url: company.logo_url,
          description: company.description,
          subtitulo: company.subtitulo,
          moeda: company.moeda || 'BRL',
          avisoRodape: company.avisoRodape,
          breakfast_basket_enabled: company.breakfast_basket_enabled,
          active: company.active ?? true,
          updated_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) {
        console.warn('Supabase saveCompany warning:', error.message);
        return company;
      }

      return (data || company) as Company;
    } catch (err) {
      console.warn('Supabase saveCompany error:', err);
      return company;
    }
  },

  async deleteCompany(id: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase.from('companies').delete().eq('id', id);
    } catch (err) {
      console.warn('Supabase deleteCompany error:', err);
    }
  },
};
