import React, { createContext, useContext, useEffect, useState } from 'react';
import { Profile } from '../types';
import { isSupabaseConfigured, supabase } from '../lib/supabase';

interface AuthContextType {
  user: { id: string; email: string } | null;
  profile: Profile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isOfflineSession: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  signupWithEmail: (email: string, pass: string, name: string) => Promise<{ user: any; session: any }>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const LOCAL_SESSION_KEY = 'marketflow_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<{ id: string; email: string } | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOfflineSession, setIsOfflineSession] = useState<boolean>(false);

  const nameFromEmail = (email: string) => {
    if (!email) return 'Usuário';
    const namePart = email.split('@')[0];
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  const handleLocalFallbackLogin = (email: string, pass?: string, customName?: string) => {
    const cleanEmail = email.trim().toLowerCase();
    const isGlobalAdmin = cleanEmail === 'willian.o.jesus@gmail.com';
    const uid = isGlobalAdmin ? 'user-willian-global' : `user-${Date.now()}`;
    const fullName = customName || (isGlobalAdmin
      ? 'Willian Oliveira (Global Admin)'
      : nameFromEmail(cleanEmail));

    const fallbackUser = { id: uid, email: cleanEmail };
    const fallbackProfile: Profile = {
      id: uid,
      full_name: fullName,
      phone: isGlobalAdmin ? '(11) 96382-0374' : undefined,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setUser(fallbackUser);
    setProfile(fallbackProfile);
    setIsOfflineSession(true);
    try {
      localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: fallbackUser, profile: fallbackProfile }));
    } catch {}
  };

  // Inicialização e escuta da sessão real do Supabase
  useEffect(() => {
    let isMounted = true;

    async function initSession() {
      // 1. Se houver sessão offline salva previamente, restaura de imediato
      try {
        const saved = localStorage.getItem(LOCAL_SESSION_KEY);
        if (saved && isMounted) {
          const parsed = JSON.parse(saved);
          if (parsed?.user) {
            setUser(parsed.user);
            setProfile(parsed.profile);
            setIsOfflineSession(true);
          }
        }
      } catch {}

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
          setIsOfflineSession(false);

          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .single();

            if (isMounted) {
              const p = {
                id: uid,
                full_name: profileRow?.full_name || authUser.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(authUser.email || '')),
                avatar_url: profileRow?.avatar_url || authUser.user_metadata?.avatar_url,
                phone: profileRow?.phone || authUser.user_metadata?.phone,
                created_at: profileRow?.created_at || new Date().toISOString(),
                updated_at: profileRow?.updated_at || new Date().toISOString(),
              };
              setProfile(p);
              try {
                localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || '' }, profile: p }));
              } catch {}
            }
          } catch {
            if (isMounted) {
              const p = {
                id: uid,
                full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : authUser.user_metadata?.full_name || nameFromEmail(authUser.email || ''),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setProfile(p);
              try {
                localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || '' }, profile: p }));
              } catch {}
            }
          }
        }
      } catch (err) {
        console.warn('Supabase inacessível no initSession (DNS ou projeto pausado):', err);
        setIsOfflineSession(true);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    initSession();

    if (isSupabaseConfigured()) {
      try {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
          if (session?.user) {
            const authUser = session.user;
            const isGlobalAdmin = authUser.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
            const uid = authUser.id;

            setUser({ id: uid, email: authUser.email || '' });
            setIsOfflineSession(false);

            try {
              const { data: profileRow } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', uid)
                .single();

              const p = {
                id: uid,
                full_name: profileRow?.full_name || authUser.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(authUser.email || '')),
                avatar_url: profileRow?.avatar_url || authUser.user_metadata?.avatar_url,
                phone: profileRow?.phone || authUser.user_metadata?.phone,
                created_at: profileRow?.created_at || new Date().toISOString(),
                updated_at: profileRow?.updated_at || new Date().toISOString(),
              };
              setProfile(p);
              try {
                localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || '' }, profile: p }));
              } catch {}
            } catch {
              const p = {
                id: uid,
                full_name: isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : authUser.user_metadata?.full_name || nameFromEmail(authUser.email || ''),
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setProfile(p);
              try {
                localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || '' }, profile: p }));
              } catch {}
            }
          }
        });

        return () => {
          isMounted = false;
          subscription?.unsubscribe();
        };
      } catch (err) {
        console.warn('Erro ao registrar listener onAuthStateChange:', err);
      }
    }
  }, []);

  const loginWithEmail = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        handleLocalFallbackLogin(email, pass);
        return;
      }

      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password: pass,
        });

        if (error) {
          throw error;
        }

        if (data?.user) {
          const uid = data.user.id;
          const isGlobalAdmin = data.user.email?.toLowerCase() === 'willian.o.jesus@gmail.com';
          const authUser = data.user;
          setUser({ id: uid, email: authUser.email || email });
          setIsOfflineSession(false);

          try {
            const { data: profileRow } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', uid)
              .single();

            const p: Profile = {
              id: uid,
              full_name: profileRow?.full_name || data.user.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email)),
              avatar_url: profileRow?.avatar_url,
              phone: profileRow?.phone,
              created_at: profileRow?.created_at || new Date().toISOString(),
              updated_at: profileRow?.updated_at || new Date().toISOString(),
            };
            setProfile(p);
            try {
              localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || email }, profile: p }));
            } catch {}
          } catch {
            const p: Profile = {
              id: uid,
              full_name: data.user.user_metadata?.full_name || (isGlobalAdmin ? 'Willian Oliveira (Global Admin)' : nameFromEmail(email)),
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setProfile(p);
            try {
              localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: authUser.email || email }, profile: p }));
            } catch {}
          }
        }
      } catch (networkErr: any) {
        const isNetworkOrDnsError =
          networkErr?.message?.includes('Failed to fetch') ||
          networkErr?.name === 'TypeError' ||
          networkErr?.message?.includes('NetworkError') ||
          networkErr?.message?.includes('fetch') ||
          networkErr?.message?.includes('network');

        if (isNetworkOrDnsError) {
          console.warn('Supabase inacessível (DNS/Rede/Pausado). Ativando sessão de contingência offline.');
          handleLocalFallbackLogin(email, pass);
          return;
        }
        throw networkErr;
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signupWithEmail = async (email: string, pass: string, name: string) => {
    setIsLoading(true);
    try {
      if (!isSupabaseConfigured()) {
        handleLocalFallbackLogin(email, pass, name);
        return {
          user: { id: `user-${Date.now()}`, email },
          session: { access_token: 'local-session-token' },
        };
      }

      try {
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
          setIsOfflineSession(false);
          const p = {
            id: uid,
            full_name: name.trim(),
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setProfile(p);
          try {
            localStorage.setItem(LOCAL_SESSION_KEY, JSON.stringify({ user: { id: uid, email: data.user.email || email }, profile: p }));
          } catch {}
        }

        return {
          user: data.user,
          session: data.session,
        };
      } catch (networkErr: any) {
        const isNetworkOrDnsError =
          networkErr?.message?.includes('Failed to fetch') ||
          networkErr?.name === 'TypeError' ||
          networkErr?.message?.includes('NetworkError') ||
          networkErr?.message?.includes('fetch');

        if (isNetworkOrDnsError) {
          console.warn('Supabase inacessível no cadastro. Ativando conta local de contingência.');
          handleLocalFallbackLogin(email, pass, name);
          return {
            user: { id: `user-${Date.now()}`, email },
            session: { access_token: 'local-session-token' },
          };
        }
        throw networkErr;
      }
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
      try {
        localStorage.removeItem(LOCAL_SESSION_KEY);
      } catch {}
      if (isSupabaseConfigured()) {
        await supabase.auth.signOut().catch(() => {});
      }
    } catch (err) {
      console.warn('Erro ao sair:', err);
    } finally {
      setUser(null);
      setProfile(null);
      setIsOfflineSession(false);
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
        isOfflineSession,
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
