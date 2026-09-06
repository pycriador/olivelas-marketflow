import React, { useState } from 'react';
import {
  History,
  Search,
  ArrowDownRight,
  ArrowUpRight,
  AlertCircle,
  Clock,
  Filter,
  PlusCircle,
  FileSpreadsheet
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate, formatQuantity } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { InventoryMovement, MovementType, Product } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const MovementListPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [typeFilter, setTypeFilter] = useState<string>(initialParams.get('type') || 'all');
  const [productFilter, setProductFilter] = useState<string>(initialParams.get('product') || 'all');

  const updateUrlParams = (newSearch: string, newType: string, newProd: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newType !== 'all') params.set('type', newType); else params.delete('type');
    if (newProd !== 'all') params.set('product', newProd); else params.delete('product');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, typeFilter, productFilter);
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    updateUrlParams(search, val, productFilter);
  };

  const handleProductChange = (val: string) => {
    setProductFilter(val);
    updateUrlParams(search, typeFilter, val);
  };

  const [movements, setMovements] = useState<InventoryMovement[]>(() =>
    dataStore.getMovements(currentCompany?.id)
  );

  // Reatividade ao dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setMovements(dataStore.getMovements(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const products = dataStore.getProducts(currentCompany?.id);

  const filteredMovements = movements.filter(m => {
    const prod = products.find(p => p.id === m.product_id);
    const matchesSearch =
      (m.reason && m.reason.toLowerCase().includes(search.toLowerCase())) ||
      (prod && prod.name.toLowerCase().includes(search.toLowerCase())) ||
      (prod && prod.sku && prod.sku.toLowerCase().includes(search.toLowerCase())) ||
      m.id.toLowerCase().includes(search.toLowerCase());

    const matchesType = typeFilter === 'all' || m.type === typeFilter;
    const matchesProduct = productFilter === 'all' || m.product_id === productFilter;

    return matchesSearch && matchesType && matchesProduct;
  });

  const getTypeBadge = (type: MovementType) => {
    switch (type) {
      case 'entry':
        return (
          <Badge variant="success" className="flex items-center space-x-1">
            <ArrowUpRight className="h-3 w-3 mr-0.5" /> Entrada
          </Badge>
        );
      case 'exit':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <ArrowDownRight className="h-3 w-3 mr-0.5" /> Saída
          </Badge>
        );
      case 'adjustment':
        return (
          <Badge variant="warning" className="flex items-center space-x-1">
            <Clock className="h-3 w-3 mr-0.5" /> Ajuste
          </Badge>
        );
      case 'loss':
      case 'expired':
        return (
          <Badge variant="destructive" className="flex items-center space-x-1">
            <AlertCircle className="h-3 w-3 mr-0.5" /> Perda/Vencido
          </Badge>
        );
      default:
        return <Badge variant="outline">{type}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Estoque' }, { label: 'Movimentações de Estoque' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Trilha de Movimentações de Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Auditoria completa de todas as entradas, saídas, consumos e ajustes do estoque da empresa.
          </p>
        </div>
        {onNavigate && (
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/inventory')}>
              <PlusCircle className="mr-1.5 h-4 w-4" /> Novo Ajuste em Saldos
            </Button>
          </div>
        )}
      </div>

      {/* Busca e Menu Dropdown de Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por motivo, produto ou código..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <DropdownFilterMenu
              groups={[
                {
                  id: 'type',
                  title: 'Tipo de Movimentação',
                  selectedValue: typeFilter,
                  onChange: handleTypeChange,
                  options: [
                    { id: 'all', label: 'Todos os Tipos', badge: movements.length },
                    { id: 'entry', label: 'Entradas de Estoque', badge: movements.filter(m => m.type === 'entry').length },
                    { id: 'exit', label: 'Saídas e Pedidos', badge: movements.filter(m => m.type === 'exit').length },
                    { id: 'adjustment', label: 'Ajustes e Conferência', badge: movements.filter(m => m.type === 'adjustment').length },
                    { id: 'expired', label: 'Lotes Vencidos / Perdas' },
                  ],
                },
                {
                  id: 'product',
                  title: 'Produto Afetado',
                  selectedValue: productFilter,
                  onChange: handleProductChange,
                  options: [
                    { id: 'all', label: 'Todos os Produtos', badge: movements.length },
                    ...products.slice(0, 15).map(p => ({
                      id: p.id,
                      label: p.name,
                      badge: movements.filter(m => m.product_id === p.id).length,
                    })),
                  ],
                },
              ]}
              onResetAll={() => {
                setTypeFilter('all');
                setProductFilter('all');
                setSearch('');
                updateUrlParams('', 'all', 'all');
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabela de Movimentações */}
      {filteredMovements.length === 0 ? (
        <EmptyState
          icon={History}
          title="Nenhuma movimentação encontrada"
          description="Quando ocorrerem entradas, saídas ou montagens de cestas, o histórico completo aparecerá aqui."
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
              <tr>
                <th className="p-4">Data / Hora</th>
                <th className="p-4">Tipo</th>
                <th className="p-4">Produto</th>
                <th className="p-4 text-center">Quantidade</th>
                <th className="p-4">Motivo / Justificativa</th>
                <th className="p-4">Responsável</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredMovements.map(m => {
                const prod = products.find(p => p.id === m.product_id);
                return (
                  <tr key={m.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4 font-mono text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(m.created_at)}
                    </td>
                    <td className="p-4">
                      {getTypeBadge(m.type)}
                    </td>
                    <td className="p-4">
                      <p className="font-semibold text-foreground">{prod?.name || m.product_id}</p>
                      {prod?.sku && (
                        <span className="text-[11px] text-muted-foreground font-mono">
                          SKU: {prod.sku}
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center font-mono font-bold">
                      <span className={m.type === 'entry' ? 'text-success' : 'text-foreground'}>
                        {m.type === 'entry' ? `+${m.quantity}` : `-${m.quantity}`} {prod?.unit || 'un'}
                      </span>
                    </td>
                    <td className="p-4 text-xs text-foreground">
                      {m.reason || 'Sem justificativa informada'}
                    </td>
                    <td className="p-4 text-xs text-muted-foreground">
                      {m.performed_by || 'Sistema Automático / Admin'}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
