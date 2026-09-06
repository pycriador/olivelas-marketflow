import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<{ user: any; session: any }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Inicialização e escuta da sessão real do Supabase
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      if (!isSupabaseConfigured()) {
        if (isMounted) setIsLoading(false);
        return;
      }

      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.warn('Erro ao obter sessão do Supabase:', error.message);
        }

        if (session?.user && isMounted) {
          const authUser = session.user;
          const isGlobalAdmin = authUser.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
          const uid = authUser.id;

          setUser({ id: uid, email: authUser.email || '' });

          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .single();

            if (isMounted) {
              setProfile({
                id: uid,
                full_name: profileRow?.full_name || authUser.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(authUser.email || '')),
                avatar_url: profileRow?.avatar_url || authUser.user_metadata?.avatar_url,
                phone: profileRow?.phone || authUser.user_metadata?.phone,
                created_at: profileRow?.created_at || new Date().toISOString(),
                updated_at: profileRow?.updated_at || new Date().toISOString(),
              });
            }
          } catch {
            if (isMounted) {
              setProfile({
                id: uid,
                full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : authUser.user_metadata?.full_name || nameFromEmail(authUser.email || ''),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              });
            }
          }
        } else if (isMounted) {
          setUser(null);
          setProfile(null);
        }
      } catch (err) {
        console.warn('Falha na inicialização da autenticação:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    if (isSupabaseConfigured()) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const authUser = session.user;
          const isGlobalAdmin = authUser.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
          const uid = authUser.id;

          setUser({ id: uid, email: authUser.email || '' });

          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .single();

            setProfile({
              id: uid,
              full_name: profileRow?.full_name || authUser.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(authUser.email || '')),
              avatar_url: profileRow?.avatar_url || authUser.user_metadata?.avatar_url,
              phone: profileRow?.phone || authUser.user_metadata?.phone,
              created_at: profileRow?.created_at || new Date().toISOString(),
              updated_at: profileRow?.updated_at || new Date().toISOString(),
            });
          } catch {
            setProfile({
              id: uid,
              full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : authUser.user_metadata?.full_name || nameFromEmail(authUser.email || ''),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        } else {
          setUser(null);
          setProfile(null);
        }
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    } else {
      setIsLoading(false);
    }
  }, []);

  const nameFromEmail = (email: string) => {
    if (!email) return 'Usuário';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado no ambiente.');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: pass,
      });

      if (error) {
        throw error;
      }

      if (data?.user) {
        const uid = data.user.id;
        setUser({ id: uid, email: data.user.email || email });

        try {
          const { data: profileRow } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', uid)
            .single();

          setProfile({
            id: uid,
            full_name: profileRow?.full_name || data.user.user_metadata?.full_name || nameFromEmail(email),
            avatar_url: profileRow?.avatar_url,
            phone: profileRow?.phone,
            created_at: profileRow?.created_at || new Date().toISOString(),
            updated_at: profileRow?.updated_at || new Date().toISOString(),
          });
        } catch {
          setProfile({
            id: uid,
            full_name: data.user.user_metadata?.full_name || nameFromEmail(email),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        throw new Error('Supabase não configurado no ambiente.');
      }

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password: pass,
        options: {
          data: {
            full_name: name.trim(),
          },
        },
      });

      if (error) {
        throw error;
      }

      if (data?.session && data?.user) {
        const uid = data.user.id;
        setUser({ id: uid, email: data.user.email || email });
        setProfile({
          id: uid,
          full_name: name.trim(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }

      return {
        user: data.user,
        session: data.session,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin + window.location.pathname,
        },
      });
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut();
      }
    } catch (err) {
      console.warn('Erro ao sair:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        loginWithEmail,
        signupWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de AuthProvider');
  }
  return context;
};
