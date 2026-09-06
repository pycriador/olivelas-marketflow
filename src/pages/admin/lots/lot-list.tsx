import React, { useState, useEffect } from 'react';
import {
  CalendarDays,
  Plus,
  Search,
  AlertCircle,
  Clock,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputQuantity } from '../../../components/ui/input-quantity';
import { InputMoney } from '../../../components/ui/input-money';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate, getDaysUntilExpiration, formatCurrency } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { Lot, Product, Supplier } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';
import { EmptyState } from '../../../components/ui/empty-state';

function getPageNumbers(current: number, total: number): (number | string)[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }
  if (current <= 4) {
    return [1, 2, 3, 4, 5, '...', total];
  }
  if (current >= total - 3) {
    return [1, '...', total - 4, total - 3, total - 2, total - 1, total];
  }
  return [1, '...', current - 1, current, current + 1, '...', total];
}

export const LotListPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [lots, setLots] = useState<Lot[]>(() =>
    dataStore.getLots(currentCompany?.id)
  );

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(initialParams.get('status') || 'all');
  const [productFilter, setProductFilter] = useState<string>(initialParams.get('product') || 'all');

  const [page, setPage] = useState(() => {
    const p = parseInt(initialParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [limit, setLimit] = useState<number>(() => {
    const l = parseInt(initialParams.get('limit') || '10', 10);
    return [10, 20, 30].includes(l) ? l : 10;
  });

  const updateUrlParams = (
    newSearch: string,
    newStatus: string,
    newProd: string,
    newPage: number = page,
    newLimit: number = limit
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus !== 'all') params.set('status', newStatus);
    if (newProd !== 'all') params.set('product', newProd);
    if (newPage > 1) params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());

    const newQuery = `?${params.toString()}`;
    const targetUrl = `${window.location.pathname}${newQuery}`;
    window.history.pushState({}, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || '');
      setStatusFilter(params.get('status') || 'all');
      setProductFilter(params.get('product') || 'all');

      const p = parseInt(params.get('page') || '1', 10);
      setPage(isNaN(p) || p < 1 ? 1 : p);

      const l = parseInt(params.get('limit') || '10', 10);
      setLimit([10, 20, 30].includes(l) ? l : 10);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    setPage(1);
    updateUrlParams(val, statusFilter, productFilter, 1, limit);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    updateUrlParams(search, val, productFilter, 1, limit);
  };

  const handleProductChange = (val: string) => {
    setProductFilter(val);
    setPage(1);
    updateUrlParams(search, statusFilter, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, statusFilter, productFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, statusFilter, productFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);

  // Sincronização reativa com o dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setLots(dataStore.getLots(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const products = dataStore.getProducts(currentCompany?.id);
  const suppliers = dataStore.getSuppliers(currentCompany?.id);

  // Form states
  const [productId, setProductId] = useState('');
  const [supplierId, setSupplierId] = useState('');
  const [lotNumber, setLotNumber] = useState('');
  const [expirationDate, setExpirationDate] = useState('');
  const [quantity, setQuantity] = useState<number>(10);
  const [costPrice, setCostPrice] = useState<number>(0);

  const filteredLots = lots.filter(l => {
    const prod = products.find(p => p.id === l.product_id);
    const matchesSearch =
      l.lot_number.toLowerCase().includes(search.toLowerCase()) ||
      (prod && prod.name.toLowerCase().includes(search.toLowerCase())) ||
      l.id.toLowerCase().includes(search.toLowerCase());

    const matchesProduct = productFilter === 'all' || l.product_id === productFilter;

    const daysLeft = getDaysUntilExpiration(l.expiration_date);
    let status = 'ok';
    if (daysLeft !== null) {
      if (daysLeft < 0) status = 'expired';
      else if (daysLeft <= 30) status = 'critical';
      else if (daysLeft <= 60) status = 'warning';
    }

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === status);

    return matchesSearch && matchesProduct && matchesStatus;
  });

  // Paginação
  const totalItems = filteredLots.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedLots = filteredLots.slice(startIndex, endIndex);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId || !lotNumber) return;

    const newLot: Lot = {
      id: `lot-${Date.now()}`,
      company_id: currentCompany?.id || 'comp-cesta-1',
      product_id: productId,
      supplier_id: supplierId || undefined,
      lot_number: lotNumber,
      expiration_date: expirationDate || undefined,
      initial_quantity: quantity,
      current_quantity: quantity,
      cost_price: costPrice,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataStore.saveLot(newLot);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Estoque' }, { label: 'Lotes & Validades' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Controle de Lotes e Validade</h1>
          <p className="text-sm text-muted-foreground">
            Rastreie o prazo de validade de lotes para evitar perdas de estoque.
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-2 h-4 w-4" /> Cadastrar Lote
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por número do lote ou nome do produto..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <DropdownFilterMenu
              groups={[
                {
                  id: 'status',
                  title: 'Status de Validade',
                  selectedValue: statusFilter,
                  onChange: handleStatusChange,
                  options: [
                    { id: 'all', label: 'Todos os Status' },
                    { id: 'critical', label: 'Crítico (≤ 30 dias)' },
                    { id: 'warning', label: 'Atenção (31 a 60 dias)' },
                    { id: 'ok', label: 'Validade Confortável (> 60 dias)' },
                    { id: 'expired', label: 'Vencidos' },
                  ],
                },
                {
                  id: 'product',
                  title: 'Filtrar por Produto',
                  selectedValue: productFilter,
                  onChange: handleProductChange,
                  options: [
                    { id: 'all', label: 'Todos os Produtos', badge: lots.length },
                    ...products.slice(0, 15).map(p => ({
                      id: p.id,
                      label: p.name,
                      badge: lots.filter(l => l.product_id === p.id).length,
                    })),
                  ],
                },
                {
                  id: 'limit',
                  title: 'Itens por Página',
                  selectedValue: limit.toString(),
                  onChange: (val) => handleLimitChange(parseInt(val, 10)),
                  options: [
                    { id: '10', label: '10 itens por página' },
                    { id: '20', label: '20 itens por página' },
                    { id: '30', label: '30 itens por página' },
                  ],
                },
              ]}
              onResetAll={() => {
                setStatusFilter('all');
                setProductFilter('all');
                setSearch('');
                setPage(1);
                setLimit(10);
                updateUrlParams('', 'all', 'all', 1, 10);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabela de Lotes */}
      {filteredLots.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title="Nenhum lote encontrado"
          description="Ajuste os filtros de pesquisa ou cadastre um novo lote de produtos."
          actionLabel="Cadastrar Lote"
          onAction={() => setIsModalOpen(true)}
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Número do Lote</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Fornecedor</th>
                  <th className="p-4 text-center">Data de Validade</th>
                  <th className="p-4 text-center">Qtd Atual</th>
                  <th className="p-4 text-center">Status de Validade</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedLots.map(lot => {
                  const prod = products.find(p => p.id === lot.product_id);
                  const sup = suppliers.find(s => s.id === lot.supplier_id);
                  const daysLeft = getDaysUntilExpiration(lot.expiration_date);

                  let badgeVariant: 'success' | 'warning' | 'destructive' | 'outline' = 'success';
                  let badgeLabel = 'Validade OK';

                  if (daysLeft !== null) {
                    if (daysLeft < 0) {
                      badgeVariant = 'destructive';
                      badgeLabel = 'Lote Vencido';
                    } else if (daysLeft <= 15) {
                      badgeVariant = 'destructive';
                      badgeLabel = `Vence em ${daysLeft} dias`;
                    } else if (daysLeft <= 30) {
                      badgeVariant = 'warning';
                      badgeLabel = `Vence em ${daysLeft} dias`;
                    }
                  }

                  return (
                    <tr key={lot.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4 font-mono font-bold text-foreground">
                        {lot.lot_number}
                      </td>
                      <td className="p-4 font-medium">
                        {prod?.name || 'Produto não encontrado'}
                      </td>
                      <td className="p-4 text-xs text-muted-foreground">
                        {sup?.name || 'Não informado'}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        {formatDate(lot.expiration_date)}
                      </td>
                      <td className="p-4 text-center font-mono font-semibold">
                        {lot.current_quantity} {prod?.unit || 'un'}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={badgeVariant}>
                          {badgeLabel}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Barra Inferior de Paginação e Seletor 10, 20, 30 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20 text-sm">
            <div className="text-xs text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{startIndex + 1}</span> a{' '}
              <span className="font-semibold text-foreground">{endIndex}</span> de{' '}
              <span className="font-semibold text-foreground">{totalItems}</span> lotes
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center space-x-2">
                <span className="text-xs text-muted-foreground">Exibir:</span>
                <div className="inline-flex rounded-md border bg-background p-0.5 shadow-xs">
                  {[10, 20, 30].map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => handleLimitChange(size)}
                      className={`px-2.5 py-1 text-xs font-semibold rounded transition-all ${
                        limit === size
                          ? 'bg-primary text-primary-foreground shadow-xs'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">por pág.</span>
              </div>

              <div className="flex items-center space-x-1">
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(1)}
                  disabled={safePage <= 1}
                  title="Primeira página"
                >
                  <ChevronsLeft className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(safePage - 1)}
                  disabled={safePage <= 1}
                  title="Página anterior"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>

                <div className="flex items-center space-x-1 px-1">
                  {getPageNumbers(safePage, totalPages).map((p, idx) =>
                    p === '...' ? (
                      <span key={`ellipsis-${idx}`} className="px-1.5 text-xs text-muted-foreground font-mono">
                        ...
                      </span>
                    ) : (
                      <Button
                        key={`page-${p}`}
                        variant={safePage === p ? 'default' : 'outline'}
                        size="icon"
                        className="h-8 w-8 text-xs font-semibold"
                        onClick={() => handlePageChange(p as number)}
                      >
                        {p}
                      </Button>
                    )
                  )}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(safePage + 1)}
                  disabled={safePage >= totalPages}
                  title="Próxima página"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={safePage >= totalPages}
                  title="Última página"
                >
                  <ChevronsRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Cadastrar Novo Lote</h3>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Produto *
                </label>
                <select
                  value={productId}
                  onChange={(e) => setProductId(e.target.value)}
                  required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione o Produto</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Número do Lote *
                </label>
                <Input
                  value={lotNumber}
                  onChange={(e) => setLotNumber(e.target.value)}
                  required
                  placeholder="Ex: LOTE-2026-A1"
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Data de Validade
                  </label>
                  <Input
                    type="date"
                    value={expirationDate}
                    onChange={(e) => setExpirationDate(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Quantidade Inicial
                  </label>
                  <InputQuantity
                    value={quantity}
                    onChange={(val) => setQuantity(val)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Fornecedor
                </label>
                <select
                  value={supplierId}
                  onChange={(e) => setSupplierId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Selecione Fornecedor</option>
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Lote</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
