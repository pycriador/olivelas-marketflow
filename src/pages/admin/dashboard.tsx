import React from 'react';
import {
  Package,
  AlertTriangle,
  CalendarDays,
  Sparkles,
  Plus,
  ArrowRight,
  TrendingDown,
  Boxes,
  Store,
  CheckCircle2,
} from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Breadcrumbs } from '../../components/layout/breadcrumbs';
import { formatCurrency, formatDate, getDaysUntilExpiration } from '../../lib/utils';
import { useCompany } from '../../context/company-context';
import { dataStore } from '../../lib/data-store';

export const DashboardPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();

  const [products, setProducts] = React.useState(() => dataStore.getProducts(currentCompany?.id));
  const [inventory, setInventory] = React.useState(() => dataStore.getInventory(currentCompany?.id));
  const [lots, setLots] = React.useState(() => dataStore.getLots(currentCompany?.id));
  const [movements, setMovements] = React.useState(() => dataStore.getMovements(currentCompany?.id));

  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
      setInventory(dataStore.getInventory(currentCompany?.id));
      setLots(dataStore.getLots(currentCompany?.id));
      setMovements(dataStore.getMovements(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  // Produtos com estoque baixo (< minimum_stock)
  const lowStockItems = products.filter(p => {
    const inv = inventory.find(i => i.product_id === p.id);
    const qty = inv ? inv.quantity : 0;
    return qty < p.minimum_stock;
  });

  // Lotes próximos do vencimento (menos de 30 dias)
  const expiringLots = lots.filter(l => {
    const days = getDaysUntilExpiration(l.expiration_date);
    return days !== null && days <= 30 && l.current_quantity > 0;
  });

  return (
    <div className="space-y-6">
      {/* Header da Página */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Dashboard' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            Painel da Empresa
          </h1>
          <p className="text-sm text-muted-foreground">
            Visão geral do estoque, produtos e alertas de {currentCompany?.name}.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button onClick={() => onNavigate('/admin/ai')} className="bg-primary text-primary-foreground shadow">
            <Sparkles className="mr-2 h-4 w-4" /> Cadastrar via IA
          </Button>
          <Button onClick={() => onNavigate('/admin/products/new')} variant="outline">
            <Plus className="mr-2 h-4 w-4" /> Novo Produto
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Total Produtos */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total de Produtos
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{products.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {products.filter(p => p.catalog_visible).length} visíveis no catálogo
            </p>
          </CardContent>
        </Card>

        {/* Estoque Baixo */}
        <Card className="hover:shadow-md transition-shadow border-amber-200 dark:border-amber-900/50">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-amber-700 dark:text-amber-400">
              Estoque Baixo
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {lowStockItems.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Itens abaixo do estoque mínimo
            </p>
          </CardContent>
        </Card>

        {/* Lotes Próximos do Vencimento */}
        <Card className="hover:shadow-md transition-shadow border-destructive/30">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-destructive">
              Alerta de Validade
            </CardTitle>
            <CalendarDays className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">
              {expiringLots.length}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Lotes vencendo nos próximos 30 dias
            </p>
          </CardContent>
        </Card>

        {/* Catálogo Digital */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Catálogo Digital
            </CardTitle>
            <Store className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <Badge variant="success" className="text-xs">Ativo</Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-2 truncate">
              /{currentCompany?.slug}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Grid Central: Alertas Prioritários & Ações Rápidas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Painel de Alertas de Estoque Baixo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center">
                <TrendingDown className="mr-2 h-4 w-4 text-amber-500" />
                Produtos com Reposição Necessária
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Itens com saldo menor que a quantidade mínima configurada.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/inventory')}>
              Ver todos <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {lowStockItems.length === 0 ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Todos os produtos estão com estoque adequado!
              </div>
            ) : (
              <div className="divide-y">
                {lowStockItems.map(prod => {
                  const inv = inventory.find(i => i.product_id === prod.id);
                  const qty = inv ? inv.quantity : 0;
                  return (
                    <div key={prod.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold text-foreground">{prod.name}</p>
                        <p className="text-xs text-muted-foreground">Mínimo: {prod.minimum_stock} {prod.unit}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="warning" className="font-mono">
                          {qty} {prod.unit} em estoque
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Alertas de Vencimento de Lotes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-base flex items-center text-destructive">
                <CalendarDays className="mr-2 h-4 w-4" />
                Lotes com Vencimento Próximo
              </CardTitle>
              <p className="text-xs text-muted-foreground mt-1">
                Acompanhamento de datas para evitar perda de estoque.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/lots')}>
              Ver Lotes <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </CardHeader>
          <CardContent>
            {expiringLots.length === 0 ? (
              <div className="flex items-center justify-center p-6 text-sm text-muted-foreground">
                <CheckCircle2 className="mr-2 h-4 w-4 text-success" />
                Nenhum lote com vencimento crítico nos próximos 30 dias.
              </div>
            ) : (
              <div className="divide-y">
                {expiringLots.map(lot => {
                  const prod = products.find(p => p.id === lot.product_id);
                  const days = getDaysUntilExpiration(lot.expiration_date);
                  return (
                    <div key={lot.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold">{prod?.name || 'Produto'}</p>
                        <p className="text-xs text-muted-foreground font-mono">
                          Lote: {lot.lot_number} • Validade: {formatDate(lot.expiration_date)}
                        </p>
                      </div>
                      <div>
                        <Badge variant="destructive">
                          {days === 0 ? 'Vence hoje' : days && days < 0 ? 'Vencido' : `Vence em ${days} dias`}
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Seção de Últimas Movimentações */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center">
            <Boxes className="mr-2 h-4 w-4 text-primary" />
            Últimas Movimentações de Estoque
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={() => onNavigate('/admin/movements')}>
            Histórico completo <ArrowRight className="ml-1 h-3.5 w-3.5" />
          </Button>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {movements.slice(0, 5).map(mov => {
              const prod = products.find(p => p.id === mov.product_id);
              const isEntry = mov.type === 'entry';
              return (
                <div key={mov.id} className="flex items-center justify-between py-3">
                  <div className="flex items-center space-x-3">
                    <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold ${
                      isEntry ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive'
                    }`}>
                      {isEntry ? '+' : '-'}
                    </span>
                    <div>
                      <p className="text-sm font-medium">{prod?.name || 'Produto'}</p>
                      <p className="text-xs text-muted-foreground">{mov.reason || 'Sem observação'}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-mono font-bold ${isEntry ? 'text-success' : 'text-foreground'}`}>
                      {isEntry ? '+' : '-'}{mov.quantity} {prod?.unit || 'un'}
                    </span>
                    <p className="text-[10px] text-muted-foreground">{formatDate(mov.created_at)}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
