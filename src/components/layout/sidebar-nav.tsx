import React from 'react';
import {
  LayoutDashboard,
  Package,
  Tags,
  Bookmark,
  Truck,
  Boxes,
  History,
  CalendarDays,
  Store,
  ShoppingBag,
  Sparkles,
  Bell,
  BarChart3,
  Terminal,
  Users,
  Building2,
  Moon,
  Sun,
  LogOut,
  ChevronRight,
  ShieldCheck,
  FileSpreadsheet,
  Printer,
  Factory,
  MessageSquare,
  Key,
  Code2,
  Radio,
  Activity,
  Coffee,
} from 'lucide-react';
import { useCompany } from '../../context/company-context';
import { useTheme } from '../../context/theme-context';
import { useAuth } from '../../context/auth-context';

interface SidebarNavProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ currentPath, onNavigate, onCloseMobile }) => {
  const { canAdmin, canStock, currentRole, currentCompany } = useCompany();
  const { isDarkMode, setTheme } = useTheme();
  const { logout, profile, user } = useAuth();

  const handleNav = (path: string) => {
    onNavigate(path);
    if (onCloseMobile) onCloseMobile();
  };

  const navSections = [
    {
      title: 'Geral',
      items: [
        { label: 'Dashboard', path: '/admin/dashboard', icon: LayoutDashboard, show: true },
        { label: 'Plataforma SaaS', path: '/admin/global', icon: ShieldCheck, show: currentRole === 'global_admin' },
        { label: 'Gerenciar Empresas', path: '/admin/global/companies', icon: Building2, show: currentRole === 'global_admin' },
        { label: 'Notificações', path: '/admin/notifications', icon: Bell, show: true },
      ],
    },
    {
      title: 'Cadastros',
      items: [
        { label: 'Produtos', path: '/admin/products', icon: Package, show: true },
        { label: 'Histórico de Preços', path: '/admin/products/price-history', icon: History, show: canAdmin },
        { label: 'Importar Planilha', path: '/admin/products/import', icon: FileSpreadsheet, show: canStock },
        { label: 'Etiquetas & Barcode', path: '/admin/products/labels', icon: Printer, show: canStock },
        { label: 'Categorias', path: '/admin/categories', icon: Tags, show: true },
        { label: 'Marcas', path: '/admin/brands', icon: Bookmark, show: canStock },
        { label: 'Fabricantes', path: '/admin/manufacturers', icon: Factory, show: canStock },
        { label: 'Fornecedores', path: '/admin/suppliers', icon: Truck, show: canStock },
      ],
    },
    {
      title: 'Estoque',
      items: [
        { label: 'Saldos & Estoque', path: '/admin/inventory', icon: Boxes, show: true },
        { label: 'Lotes & Validades', path: '/admin/lots', icon: CalendarDays, show: canStock },
        { label: 'Movimentações', path: '/admin/movements', icon: History, show: canStock },
      ],
    },
    {
      title: 'Recursos & Automações',
      items: [
        { label: 'Cesta de Café da Manhã', path: '/admin/breakfast-basket', icon: Coffee, show: !!currentCompany?.breakfast_basket_enabled, highlight: true },
        { label: 'Catálogo Digital', path: '/admin/catalog', icon: Store, show: canAdmin },
        { label: 'Solicitações de Clientes', path: '/admin/catalog/requests', icon: ShoppingBag, show: canAdmin, highlight: true },
        { label: 'Assistente de IA', path: '/admin/ai', icon: Sparkles, show: canStock },
        { label: 'WhatsApp & Mensagens', path: '/admin/whatsapp', icon: MessageSquare, show: canAdmin },
      ],
    },
    {
      title: 'Desenvolvedores & API',
      items: [
        { label: 'Dashboard & Métricas', path: '/admin/developers/dashboard', icon: Activity, show: canAdmin },
        { label: 'API Keys & Tokens', path: '/admin/developers/api-keys', icon: Key, show: canAdmin },
        { label: 'Documentação OpenAPI', path: '/admin/developers/api-docs', icon: Code2, show: true },
        { label: 'Webhooks', path: '/admin/developers/webhooks', icon: Radio, show: canAdmin },
      ],
    },
    {
      title: 'Administração & Relatórios',
      items: [
        { label: 'Relatórios Operacionais', path: '/admin/reports', icon: BarChart3, show: canAdmin },
        { label: 'Trilha de Auditoria', path: '/admin/audit', icon: Terminal, show: canAdmin },
        { label: 'Usuários & Acessos', path: '/admin/users', icon: Users, show: canAdmin },
        { label: 'Dados da Empresa', path: '/admin/company', icon: Building2, show: canAdmin },
      ],
    },
  ];

  return (
    <div className="flex h-full flex-col justify-between overflow-y-auto px-3 py-4">
      <div className="space-y-6">
        {navSections.map((section, idx) => {
          const visibleItems = section.items.filter(item => item.show);
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              <h4 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {section.title}
              </h4>
              <div className="space-y-0.5 pt-1">
                {visibleItems.map(item => {
                  const Icon = item.icon;
                  const isActive = currentPath === item.path;

                  return (
                    <button
                      key={item.path}
                      onClick={() => handleNav(item.path)}
                      className={`group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-all ${
                        isActive
                          ? 'bg-primary text-primary-foreground shadow-sm'
                          : 'text-foreground/80 hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        <Icon className={`h-4 w-4 ${isActive ? 'text-primary-foreground' : 'text-muted-foreground group-hover:text-foreground'}`} />
                        <span>{item.label}</span>
                      </div>
                      {item.highlight && !isActive && (
                        <span className="flex h-2 w-2 rounded-full bg-primary animate-pulse" />
                      )}
                      {isActive && <ChevronRight className="h-4 w-4 text-primary-foreground" />}
                    </button>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer da Sidebar: Perfil & Troca de Tema */}
      <div className="border-t pt-4 space-y-3">
        <div className="flex items-center justify-between px-2">
          <span className="text-xs font-medium text-muted-foreground">Tema da Interface</span>
          <button
            onClick={() => setTheme(isDarkMode ? 'theme-corporate' : 'theme-dark-corporate')}
            className="flex items-center rounded-md border p-1.5 hover:bg-accent text-foreground text-xs"
            title="Alternar tema claro/escuro"
          >
            {isDarkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4 text-slate-700" />}
          </button>
        </div>

        <div className="flex items-center justify-between rounded-lg bg-card border p-2">
          <div className="flex items-center space-x-2 truncate">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground uppercase">
              {profile?.full_name?.substring(0, 2) || 'US'}
            </div>
            <div className="truncate">
              <p className="truncate text-xs font-medium leading-tight">{profile?.full_name || 'Comerciante'}</p>
              <p className="truncate text-[10px] text-muted-foreground">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="rounded-md p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
            title="Sair da conta"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
