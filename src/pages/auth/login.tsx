import React, { useState } from 'react';
import { Mail, Lock, LogIn, UserPlus, User, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { useAuth } from '../../context/auth-context';

export const LoginPage: React.FC<{
  onSuccess: () => void;
  initialMode?: 'login' | 'signup';
  onNavigateLanding?: () => void;
}> = ({ onSuccess, initialMode = 'login', onNavigateLanding }) => {
  const { loginWithEmail, signupWithEmail, loginWithGoogle, isLoading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Feedback states
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!email.trim() || !password) {
      setError('Por favor, informe seu e-mail e sua senha.');
      return;
    }

    try {
      await loginWithEmail(email, password);
      onSuccess();
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('Invalid login credentials')) {
        setError('E-mail ou senha incorretos. Verifique suas credenciais.');
      } else if (msg.includes('Email not confirmed')) {
        setError('Seu e-mail ainda não foi confirmado. Verifique sua caixa de entrada.');
      } else {
        setError(msg || 'Erro ao efetuar login no banco de dados. Tente novamente.');
      }
    }
  };

  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!name.trim()) {
      setError('Por favor, informe seu nome completo.');
      return;
    }
    if (!email.trim()) {
      setError('Por favor, informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }
    if (password !== confirmPassword) {
      setError('As senhas digitadas não coincidem.');
      return;
    }

    try {
      const res = await signupWithEmail(email, password, name);

      if (res?.session) {
        // Logado imediatamente
        onSuccess();
      } else {
        // Conta criada, mas precisa de confirmação por e-mail
        setSuccessMessage(
          `Conta de ${name} criada com sucesso no Supabase! Verifique seu e-mail (${email}) para confirmar seu acesso ou faça login.`
        );
        setPassword('');
        setConfirmPassword('');
        setMode('login');
      }
    } catch (err: any) {
      const msg = err?.message || '';
      if (msg.includes('User already registered')) {
        setError('Este e-mail já está cadastrado no sistema. Faça login com suas credenciais.');
      } else if (msg.includes('rate limit')) {
        setError('Limite de envio de e-mails do Supabase atingido. Tente novamente em alguns minutos ou use as credenciais de teste.');
      } else {
        setError(msg || 'Erro ao cadastrar novo usuário no banco de dados.');
      }
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);
    setSuccessMessage(null);
    try {
      await loginWithGoogle();
    } catch (err: any) {
      setError(err.message || 'Erro ao iniciar autenticação com Google.');
    }
  };

  const fillDemoCredentials = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('marketflow2026');
    setError(null);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-2xl border bg-card">
        <CardHeader className="space-y-3 text-center pb-4">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-2xl mx-auto shadow-md">
            M
          </div>
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">MarketFlow</CardTitle>
            <CardDescription className="text-xs mt-1">
              Plataforma Integrada de Gestão & Catálogo Digital
            </CardDescription>
          </div>

          {/* Seletor de Abas: Entrar / Criar Conta */}
          <div className="flex rounded-lg border bg-muted p-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'login'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <LogIn className="w-3.5 h-3.5 inline mr-1" />
              Entrar na Conta
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
                mode === 'signup'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <UserPlus className="w-3.5 h-3.5 inline mr-1" />
              Criar Nova Conta
            </button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {error && (
            <div className="flex items-start space-x-2 rounded-lg bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-start space-x-2 rounded-lg bg-emerald-500/10 border border-emerald-500/20 p-3 text-xs text-emerald-600 dark:text-emerald-400 font-medium">
              <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{successMessage}</span>
            </div>
          )}

          {mode === 'login' ? (
            /* Formulário de Login */
            <form onSubmit={handleLoginSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@exemplo.com"
                    required
                    autoComplete="email"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground">
                    Senha
                  </label>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Sua senha secreta"
                    required
                    autoComplete="current-password"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                isLoading={isLoading}
                loadingText="Conectando ao banco..."
              >
                <LogIn className="mr-2 h-4 w-4" /> Entrar no Painel
              </Button>
            </form>
          ) : (
            /* Formulário de Cadastro */
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome Completo *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João da Silva"
                    required
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  E-mail de Acesso *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu.email@empresa.com"
                    required
                    autoComplete="email"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Senha (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Crie uma senha forte"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Confirmar Senha *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a senha criada"
                    required
                    minLength={6}
                    autoComplete="new-password"
                    className="pl-9"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2"
                size="lg"
                isLoading={isLoading}
                loadingText="Criando conta no banco..."
              >
                <UserPlus className="mr-2 h-4 w-4" /> Criar Minha Conta
              </Button>
            </form>
          )}

          <div className="relative flex items-center justify-center my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative bg-card px-2 text-[10px] uppercase text-muted-foreground font-semibold">
              ou login social
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            onClick={handleGoogleLogin}
            disabled={isLoading}
          >
            <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Entrar com Google
          </Button>

          {/* Dica de Acesso Rápido de Teste */}
          <div className="rounded-lg bg-muted/60 border p-2.5 text-[11px] text-muted-foreground space-y-1.5">
            <p className="font-semibold text-foreground">💡 Contas reais cadastradas no Supabase:</p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fillDemoCredentials('comerciante@marketflow.com')}
                className="underline hover:text-primary transition-colors text-left"
              >
                • comerciante@marketflow.com
              </button>
              <button
                type="button"
                onClick={() => fillDemoCredentials('willian.o.jesus@gmail.com')}
                className="underline hover:text-primary transition-colors text-left"
              >
                • willian.o.jesus@gmail.com
              </button>
            </div>
            <p className="text-[10px] text-muted-foreground italic">
              (Senha padrão dos testes: <code>marketflow2026</code>)
            </p>
          </div>
        </CardContent>

        <CardFooter className="flex-col space-y-2 justify-center border-t py-3.5">
          <p className="text-[11px] text-muted-foreground text-center">
            {mode === 'login' ? (
              <>
                Ainda não tem cadastro?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('signup');
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Criar conta grátis
                </button>
              </>
            ) : (
              <>
                Já possui conta cadastrada?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setError(null);
                  }}
                  className="font-bold text-primary hover:underline"
                >
                  Fazer login
                </button>
              </>
            )}
          </p>

          {onNavigateLanding && (
            <button
              type="button"
              onClick={onNavigateLanding}
              className="text-[11px] text-muted-foreground hover:text-primary transition-colors font-medium"
            >
              ← Conhecer a plataforma e ver telas do sistema
            </button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};
