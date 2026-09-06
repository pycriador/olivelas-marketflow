import React, { useState } from 'react';
import { SidebarNav } from './sidebar-nav';
import { HeaderNav } from './header-nav';
import { ThemeSwitcherModal } from '../ui/theme-switcher-modal';
import { X, Store } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useCompany } from '../../context/company-context';

interface AdminLayoutProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  children: React.ReactNode;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({
  currentPath,
  onNavigate,
  children,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [createCompanyModalOpen, setCreateCompanyModalOpen] = useState(false);
  const [themeModalOpen, setThemeModalOpen] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [companyCnpj, setCompanyCnpj] = useState('');
  const [isCreatingCompany, setIsCreatingCompany] = useState(false);
  const [createCompanyError, setCreateCompanyError] = useState<string | null>(null);

  const { createCompany } = useCompany();

  const handleCreateCompanySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) return;

    setIsCreatingCompany(true);
    setCreateCompanyError(null);
    try {
      await createCompany({
        name: companyName,
        cnpj: companyCnpj,
      });
      setCompanyName('');
      setCompanyCnpj('');
      setCreateCompanyModalOpen(false);
    } catch (err: any) {
      setCreateCompanyError(err.message || 'Erro ao criar empresa.');
    } finally {
      setIsCreatingCompany(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col lg:flex-row">
      {/* Sidebar Desktop Fixa */}
      <aside className="hidden lg:flex w-64 flex-col border-r bg-card shrink-0">
        <div className="flex h-16 items-center border-b px-6 space-x-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg">
            M
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-foreground">MarketFlow</h1>
            <p className="text-[10px] text-muted-foreground uppercase font-semibold tracking-wide">
              Gestão Inteligente
            </p>
          </div>
        </div>
        <SidebarNav currentPath={currentPath} onNavigate={onNavigate} />
      </aside>

      {/* Drawer Sidebar Mobile */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setMobileMenuOpen(false)}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-card border-r shadow-2xl flex flex-col animate-in slide-in-from-left duration-200">
            <div className="flex h-16 items-center justify-between border-b px-4">
              <div className="flex items-center space-x-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-lg">
                  M
                </div>
                <h1 className="text-base font-bold text-foreground">MarketFlow</h1>
              </div>
              <button
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-md border p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <SidebarNav
              currentPath={currentPath}
              onNavigate={onNavigate}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </div>
      )}

      {/* Área Principal de Conteúdo */}
      <div className="flex flex-1 flex-col overflow-x-hidden">
        <HeaderNav
          onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)}
          onOpenCreateCompanyModal={() => setCreateCompanyModalOpen(true)}
          onOpenThemeModal={() => setThemeModalOpen(true)}
          onNavigate={onNavigate}
        />

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>

      {/* Modal de 20 Temas Visuais */}
      <ThemeSwitcherModal isOpen={themeModalOpen} onClose={() => setThemeModalOpen(false)} />

      {/* Modal de Criação de Empresa */}
      {createCompanyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Store className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold">Criar Nova Empresa</h3>
              </div>
              <button
                onClick={() => setCreateCompanyModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCompanySubmit} className="space-y-4">
              {createCompanyError && (
                <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive font-medium">
                  {createCompanyError}
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome do Comércio / Empresa *
                </label>
                <Input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  placeholder="Ex: Mercadinho São Paulo"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  CNPJ (opcional)
                </label>
                <Input
                  value={companyCnpj}
                  onChange={(e) => setCompanyCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setCreateCompanyModalOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" isLoading={isCreatingCompany} loadingText="Criando...">
                  Cadastrar Empresa
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
