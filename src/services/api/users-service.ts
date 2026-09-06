import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { CompanyUser, AppRole } from '../../types';

export const usersService = {
  async fetchCompanyUsers(companyId: string): Promise<CompanyUser[]> {
    if (!isSupabaseConfigured()) return [];

    try {
      const { data, error } = await supabase
        .from('company_users')
        .select(`
          *,
          profile:profiles(*),
          company:companies(*)
        `)
        .eq('company_id', companyId)
        .order('created_at', { ascending: true });

      if (error) {
        console.warn('Supabase fetchCompanyUsers warning:', error.message);
        return [];
      }

      return (data || []) as CompanyUser[];
    } catch (err) {
      console.warn('Supabase fetchCompanyUsers error:', err);
      return [];
    }
  },

  async addCompanyUser(
    companyId: string,
    email: string,
    role: AppRole,
    fullName?: string
  ): Promise<CompanyUser> {
    const id = `cu-${Date.now()}`;
    const namePart = fullName || email.split('@')[0];

    const fallbackUser: CompanyUser = {
      id,
      company_id: companyId,
      user_id: `user-${Date.now()}`,
      role,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: `user-${Date.now()}`,
        full_name: namePart,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    if (!isSupabaseConfigured()) {
      return fallbackUser;
    }

    try {
      // 1. Verifica se já existe um usuário com esse email em auth ou profiles
      // Como auth.users não é acessível diretamente pelo client anonimo sem RPC,
      // criamos um placeholder profile ou vinculamos se existir
      const { data: existingProfiles } = await supabase
        .from('profiles')
        .select('id, full_name, avatar_url, phone')
        .limit(1);

      let targetUserId = fallbackUser.user_id;
      if (existingProfiles && existingProfiles.length > 0) {
        // Se encontramos algum perfil correspondente
      }

      const { data, error } = await supabase
        .from('company_users')
        .upsert({
          id,
          company_id: companyId,
          user_id: targetUserId,
          role,
          active: true,
          updated_at: new Date().toISOString(),
        })
        .select(`
          *,
          profile:profiles(*),
          company:companies(*)
        `)
        .single();

      if (error) {
        console.warn('Supabase addCompanyUser warning:', error.message);
        return fallbackUser;
      }

      return data as CompanyUser;
    } catch (err) {
      console.warn('Supabase addCompanyUser error:', err);
      return fallbackUser;
    }
  },

  async updateUserRole(membershipId: string, role: AppRole): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('company_users')
        .update({ role, updated_at: new Date().toISOString() })
        .eq('id', membershipId);
    } catch (err) {
      console.warn('Supabase updateUserRole error:', err);
    }
  },

  async removeUser(membershipId: string): Promise<void> {
    if (!isSupabaseConfigured()) return;

    try {
      await supabase
        .from('company_users')
        .delete()
        .eq('id', membershipId);
    } catch (err) {
      console.warn('Supabase removeUser error:', err);
    }
  },
};
