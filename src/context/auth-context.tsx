import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>({
    id: 'user-willian-global',
    email: 'willian.o.jesus@gmail.com',
  });
  const [profile, setProfile] = useState<Profile | null>({
    id: 'user-willian-global',
    full_name: 'Willian Oliveira (Global Admin)',
    avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&q=80',
    phone: '(11) 99999-8888',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (isSupabaseConfigured()) {
      supabase.auth.getSession().then(async ({ data: { session } }) => {
        if (session?.user) {
          const isGlobalAdmin = session.user.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
          const uid = session.user.id;
          setUser({ id: uid, email: session.user.email || '' });

          try {
            const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', uid).single();
            setProfile({
              id: uid,
              full_name: profileRow?.full_name || session.user.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : 'Comerciante'),
              avatar_url: profileRow?.avatar_url,
              phone: profileRow?.phone,
              created_at: profileRow?.created_at || new Date().toISOString(),
              updated_at: profileRow?.updated_at || new Date().toISOString(),
            });
          } catch {
            setProfile({
              id: uid,
              full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : session.user.user_metadata?.full_name || 'Comerciante',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      });

      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session?.user) {
          const isGlobalAdmin = session.user.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
          const uid = session.user.id;
          setUser({ id: uid, email: session.user.email || '' });

          try {
            const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', uid).single();
            setProfile({
              id: uid,
              full_name: profileRow?.full_name || session.user.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : 'Comerciante'),
              avatar_url: profileRow?.avatar_url,
              phone: profileRow?.phone,
              created_at: profileRow?.created_at || new Date().toISOString(),
              updated_at: profileRow?.updated_at || new Date().toISOString(),
            });
          } catch {
            setProfile({
              id: uid,
              full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : session.user.user_metadata?.full_name || 'Comerciante',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
        }
      });

      return () => subscription.unsubscribe();
    }
  }, []);

  const loginWithEmail = async (email: string, _pass: string) => {
    setIsLoading(true);
    const isGlobalAdmin = email.toLowerCase() === 'willian.o.jesus@gmail.com';

    try {
      if (isSupabaseConfigured()) {
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password: _pass,
        });

        if (signInError) {
          const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
            email,
            password: _pass,
            options: {
              data: {
                full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email),
              },
            },
          });

          if (signUpData?.user) {
            const uid = signUpData.user.id;
            setUser({ id: uid, email });
            setProfile({
              id: uid,
              full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
            return;
          }

          if (signUpError && !isGlobalAdmin) {
            throw signInError;
          }
        } else if (signInData?.user) {
          const uid = signInData.user.id;
          setUser({ id: uid, email: signInData.user.email || email });

          try {
            const { data: profileRow } = await supabase.from('profiles').select('*').eq('id', uid).single();
            setProfile({
              id: uid,
              full_name: profileRow?.full_name || signInData.user.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email)),
              avatar_url: profileRow?.avatar_url,
              phone: profileRow?.phone,
              created_at: profileRow?.created_at || new Date().toISOString(),
              updated_at: profileRow?.updated_at || new Date().toISOString(),
            });
          } catch {
            setProfile({
              id: uid,
              full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            });
          }
          return;
        }
      }

      // Fallback para modo offline / desenvolvimento
      setUser({
        id: isGlobalAdmin ? 'user-willian-global' : 'user-default',
        email,
      });
      setProfile({
        id: isGlobalAdmin ? 'user-willian-global' : 'user-default',
        full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const nameFromEmail = (email: string) => {
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const signupWithEmail = async (email: string, _pass: string, name: string) => {
    setIsLoading(true);
    try {
      if (isSupabaseConfigured()) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password: _pass,
          options: { data: { full_name: name } },
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          const uid = data.user.id;
          setUser({ id: uid, email: data.user.email || email });
          setProfile({
            id: uid,
            full_name: name,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          });
          return;
        }
      }
      setUser({ id: 'user-default', email });
      setProfile({
        id: 'user-default',
        full_name: name,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithGoogle = async () => {
    if (isSupabaseConfigured()) {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    }
    setUser({ id: 'user-willian-global', email: 'willian.o.jesus@gmail.com' });
    setProfile({
      id: 'user-willian-global',
      full_name: 'Willian Oliveira (Global Admin)',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
  };

  const logout = async () => {
    if (isSupabaseConfigured()) {
      try {
        await supabase.auth.signOut();
      } catch {
        // Ignora erros ao deslogar
      }
    }
    setUser(null);
    setProfile(null);
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
