import React, { useState } from 'react';
import { Store, ChevronDown, Check, Plus, ShieldCheck, Package, Eye } from 'lucide-react';
import { useCompany } from '../../context/company-context';
import { Button } from './button';

interface CompanySwitcherProps {
  onOpenCreateModal?: () => void;
}

export const CompanySwitcher: React.FC<CompanySwitcherProps> = ({ onOpenCreateModal }) => {
  const { userCompanies, currentCompany, currentRole, switchCompany } = useCompany();
  const [isOpen, setIsOpen] = useState(false);

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin':
      case 'global_admin':
        return (
          <span className="flex items-center text-[10px] uppercase font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded">
            <ShieldCheck className="w-3 h-3 mr-1" /> Admin
          </span>
        );
      case 'stock':
        return (
          <span className="flex items-center text-[10px] uppercase font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded dark:text-amber-400">
            <Package className="w-3 h-3 mr-1" /> Estoque
          </span>
        );
      default:
        return (
          <span className="flex items-center text-[10px] uppercase font-bold text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
            <Eye className="w-3 h-3 mr-1" /> Leitura
          </span>
        );
    }
  };

  return (
    <div className="relative w-full">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between rounded-lg border bg-card px-3 py-2 text-left shadow-sm transition-colors hover:bg-accent focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <div className="flex items-center space-x-3 truncate">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground font-semibold">
            {currentCompany?.logo_url ? (
              <img src={currentCompany.logo_url} alt={currentCompany.name} className="h-9 w-9 rounded-md object-cover" />
            ) : (
              <Store className="h-5 w-5" />
            )}
          </div>
          <div className="truncate">
            <div className="truncate text-sm font-semibold leading-tight text-foreground">
              {currentCompany?.name || 'Selecione uma Empresa'}
            </div>
            <div className="mt-0.5 flex items-center space-x-2">
              {getRoleBadge(currentRole)}
            </div>
          </div>
        </div>
        <ChevronDown className="h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-200" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute left-0 top-full z-50 mt-1 w-full rounded-lg border bg-popover p-1 shadow-lg ring-1 ring-black ring-opacity-5 animate-in fade-in-80 zoom-in-95">
            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Empresas ativas
            </div>
            <div className="max-h-60 overflow-y-auto space-y-1">
              {Array.from(new Map(userCompanies.map(cu => [cu.company_id, cu])).values()).map(cu => {
                const isSelected = cu.company_id === currentCompany?.id;
                return (
                  <button
                    key={cu.id}
                    onClick={() => {
                      switchCompany(cu.company_id);
                      setIsOpen(false);
                    }}
                    className={`flex w-full items-center justify-between rounded-md px-2 py-2 text-sm transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-accent text-popover-foreground'
                    }`}
                  >
                    <div className="flex items-center space-x-2 truncate">
                      <Store className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{cu.company?.name}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {getRoleBadge(cu.role)}
                      {isSelected && <Check className="h-4 w-4 text-primary shrink-0" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="mt-1 border-t pt-1">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-xs font-medium text-primary hover:text-primary hover:bg-primary/10"
                onClick={() => {
                  setIsOpen(false);
                  if (onOpenCreateModal) onOpenCreateModal();
                }}
              >
                <Plus className="mr-2 h-3.5 w-3.5" /> Criar nova empresa
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
