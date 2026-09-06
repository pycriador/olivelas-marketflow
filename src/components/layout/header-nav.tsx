import React from 'react';
import { Menu, ExternalLink, Sparkles, Bell, Palette } from 'lucide-react';
import { CompanySwitcher } from '../ui/company-switcher';
import { Button } from '../ui/button';
import { LanguageSwitcher } from '../ui/language-switcher';
import { useCompany } from '../../context/company-context';

interface HeaderNavProps {
  onToggleMobileMenu: () => void;
  onOpenCreateCompanyModal: () => void;
  onOpenThemeModal?: () => void;
  onNavigate: (path: string) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({
  onToggleMobileMenu,
  onOpenCreateCompanyModal,
  onOpenThemeModal,
  onNavigate,
}) => {
  const { currentCompany } = useCompany();

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b bg-background/95 px-4 backdrop-blur transition-all lg:px-6">
      {/* Lado Esquerdo: Mobile Menu Toggle + Seletor de Empresa */}
      <div className="flex items-center space-x-3 lg:space-x-4">
        <button
          onClick={onToggleMobileMenu}
          className="rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-foreground lg:hidden"
          aria-label="Abrir menu"
        >
          <Menu className="h-5 w-5" />
        </button>

        <div className="w-56 sm:w-64 lg:w-72">
          <CompanySwitcher onOpenCreateModal={onOpenCreateCompanyModal} />
        </div>
      </div>

      {/* Lado Direito: Seletor de Idioma, Galeria de Temas, Ações Rápidas */}
      <div className="flex items-center space-x-2 sm:space-x-3">
        <LanguageSwitcher />

        {onOpenThemeModal && (
          <button
            onClick={onOpenThemeModal}
            className="flex items-center space-x-1 rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
            title="Galeria de 20 Temas (Visuals)"
          >
            <Palette className="h-4 w-4 text-primary" />
            <span className="hidden md:inline text-xs font-semibold">Temas</span>
          </button>
        )}

        <button
          onClick={() => onNavigate('/admin/notifications')}
          className="relative rounded-md border p-2 text-muted-foreground hover:bg-accent hover:text-foreground transition-colors"
          title="Notificações e Alertas"
        >
          <Bell className="h-4 w-4" />
          <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-destructive text-[10px] font-bold text-destructive-foreground">
            2
          </span>
        </button>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onNavigate('/admin/ai')}
          className="hidden sm:flex items-center space-x-1.5 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Sparkles className="h-4 w-4 text-primary" />
          <span>Cadastrar por Foto</span>
        </Button>

        {currentCompany?.slug && (
          <a
            href={`/loja/${currentCompany.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex h-9 items-center justify-center rounded-md border border-input bg-background px-3 text-xs font-medium ring-offset-background transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ExternalLink className="mr-1.5 h-3.5 w-3.5 text-muted-foreground" />
            <span className="hidden xs:inline">Ver Catálogo</span>
          </a>
        )}
      </div>
    </header>
  );
};
