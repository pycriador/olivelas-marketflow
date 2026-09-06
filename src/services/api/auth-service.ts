import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { Profile } from '../../types';

export interface AuthSessionUser {
  id: string;
  email: string;
  profile?: Profile;
}

export const authService = {
  async signInWithPassword(email: string, password: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: 'user-default', email },
        session: null,
      };
    }

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw error;
    }

    // Busca perfil correspondente se existir
    let profile: Profile | null = null;
    try {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      profile = profileData;
    } catch {
      // Perfil será gerado via fallback
    }

    return {
      user: data.user,
      session: data.session,
      profile,
    };
  },

  async signUpWithEmail(email: string, password: string, fullName: string) {
    if (!isSupabaseConfigured()) {
      return {
        user: { id: `user-${Date.now()}`, email },
        session: null,
      };
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      throw error;
    }

    // Tenta upsert direto no profiles para garantir consistência
    if (data.user) {
      try {
        await supabase.from('profiles').upsert({
          id: data.user.id,
          full_name: fullName,
          updated_at: new Date().toISOString(),
        });
      } catch {
        // Ignora erro se trigger já cuidou
      }
    }

    return data;
  },

  async signOut() {
    if (isSupabaseConfigured()) {
      await supabase.auth.signOut();
    }
  },

  async getCurrentSession() {
    if (!isSupabaseConfigured()) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (!isSupabaseConfigured()) return null;
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) return null;
    return data as Profile;
  },
};
