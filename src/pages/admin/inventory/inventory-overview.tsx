import React, { useState, useEffect } from 'react';
import {
  Boxes,
  Search,
  PlusCircle,
  MinusCircle,
  RefreshCw,
  AlertTriangle,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  Package,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputQuantity } from '../../../components/ui/input-quantity';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatQuantity } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { MovementType, InventoryMovement, Product, InventoryItem } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

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

export const InventoryOverviewPage: React.FC = () => {
  const { currentCompany } = useCompany();

  // URL Query Parameters Sync (Filtros e Paginação)
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.get('category') || 'all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>(initialParams.get('stock') || 'all');

  const parsedPage = parseInt(initialParams.get('page') || '1', 10);
  const [page, setPage] = useState<number>(isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage);

  const parsedLimit = parseInt(initialParams.get('limit') || '10', 10);
  const [limit, setLimit] = useState<number>([10, 20, 30].includes(parsedLimit) ? parsedLimit : 10);

  const updateUrlParams = (
    newSearch: string,
    newCat: string,
    newStock: string,
    newPage: number,
    newLimit: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCat !== 'all') params.set('category', newCat);
    if (newStock !== 'all') params.set('stock', newStock);

    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());

    const newQuery = `?${params.toString()}`;
    const targetUrl = `${window.location.pathname}${newQuery}`;
    window.history.pushState({}, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || '');
      setSelectedCategory(params.get('category') || 'all');
      setStockStatusFilter(params.get('stock') || 'all');

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
    updateUrlParams(val, selectedCategory, stockStatusFilter, 1, limit);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
    updateUrlParams(search, val, stockStatusFilter, 1, limit);
  };

  const handleStockStatusChange = (val: string) => {
    setStockStatusFilter(val);
    setPage(1);
    updateUrlParams(search, selectedCategory, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, selectedCategory, stockStatusFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, selectedCategory, stockStatusFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [movementModalOpen, setMovementModalOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState('');
  const [movementType, setMovementType] = useState<MovementType>('entry');
  const [movementQuantity, setMovementQuantity] = useState<number>(1);
  const [movementReason, setMovementReason] = useState('');

  const [products, setProducts] = useState<Product[]>(() =>
    dataStore.getProducts(currentCompany?.id)
  );
  const [inventoryState, setInventoryState] = useState<InventoryItem[]>(() =>
    dataStore.getInventory(currentCompany?.id)
  );

  const categories = dataStore.getCategories(currentCompany?.id);

  // Sincronização reativa
  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
      setInventoryState(dataStore.getInventory(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;

    const inv = inventoryState.find(i => i.product_id === p.id);
    const qty = inv ? inv.quantity : 0;
    const isLow = qty < p.minimum_stock;

    const matchesStock =
      stockStatusFilter === 'all' ||
      (stockStatusFilter === 'low' ? isLow : !isLow);

    return matchesSearch && matchesCat && matchesStock;
  });

  // Paginação
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const handleOpenModal = (productId: string, type: MovementType = 'entry') => {
    setSelectedProductId(productId);
    setMovementType(type);
    setMovementQuantity(1);
    setMovementReason('');
    setMovementModalOpen(true);
  };

  const handleSaveMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProductId || movementQuantity <= 0) return;

    const delta = movementType === 'entry' ? movementQuantity : -movementQuantity;
    dataStore.updateInventoryQuantity(
      selectedProductId,
      delta,
      movementType,
      movementReason || (movementType === 'entry' ? 'Entrada manual no estoque' : 'Saída manual de estoque'),
      currentCompany?.id
    );

    setMovementModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Estoque' }, { label: 'Saldos de Estoque' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Controle de Saldos de Estoque</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o estoque disponível e realize entradas, saídas ou ajustes rápidos.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filtrar por nome do produto, SKU ou ID..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <DropdownFilterMenu
              groups={[
                {
                  id: 'category',
                  title: 'Categorias',
                  selectedValue: selectedCategory,
                  onChange: handleCategoryChange,
                  options: [
                    { id: 'all', label: 'Todas as Categorias', badge: products.length },
                    ...categories.map(c => ({
                      id: c.id,
                      label: c.name,
                      badge: products.filter(p => p.category_id === c.id).length,
                    })),
                  ],
                },
                {
                  id: 'stock',
                  title: 'Status de Reposição',
                  selectedValue: stockStatusFilter,
                  onChange: handleStockStatusChange,
                  options: [
                    { id: 'all', label: 'Todos os Níveis' },
                    { id: 'low', label: 'Apenas Reposição Urgente (Estoque Baixo)' },
                    { id: 'normal', label: 'Estoque Normal / Acima do Mínimo' },
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
                setSelectedCategory('all');
                setStockStatusFilter('all');
                setSearch('');
                setPage(1);
                setLimit(10);
                updateUrlParams('', 'all', 'all', 1, 10);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabela de Estoque */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Boxes}
          title="Nenhum item de estoque encontrado"
          description="Ajuste os filtros de pesquisa para visualizar os produtos em estoque."
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4 text-center">Mínimo</th>
                  <th className="p-4 text-center">Saldo Atual</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações Rápidas</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(prod => {
                  const inv = inventoryState.find(i => i.product_id === prod.id);
                  const qty = inv ? inv.quantity : 0;
                  const isLowStock = qty < prod.minimum_stock;

                  return (
                    <tr key={prod.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div>
                          <p className="font-semibold text-foreground">{prod.name}</p>
                          <p className="text-xs text-muted-foreground font-mono">
                            {prod.sku ? `SKU: ${prod.sku}` : 'Sem SKU'}
                          </p>
                        </div>
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        {prod.minimum_stock} {prod.unit}
                      </td>
                      <td className="p-4 text-center font-mono font-bold text-base">
                        {formatQuantity(qty, prod.unit)}
                      </td>
                      <td className="p-4 text-center">
                        {isLowStock ? (
                          <Badge variant="warning" className="flex items-center justify-center w-fit mx-auto">
                            <AlertTriangle className="mr-1 h-3 w-3" /> Reposição
                          </Badge>
                        ) : (
                          <Badge variant="success">Normal</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(prod.id, 'entry')}
                          className="text-xs text-success border-success/30 hover:bg-success/10"
                        >
                          <PlusCircle className="mr-1 h-3.5 w-3.5" /> Entrada
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenModal(prod.id, 'exit')}
                          className="text-xs text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                          <MinusCircle className="mr-1 h-3.5 w-3.5" /> Saída
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleOpenModal(prod.id, 'adjustment')}
                          className="text-xs"
                        >
                          <RefreshCw className="mr-1 h-3.5 w-3.5" /> Ajustar
                        </Button>
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
              <span className="font-semibold text-foreground">{totalItems}</span> itens
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

      {/* Modal de Movimentação de Estoque */}
      {movementModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Registrar Movimentação de Estoque</h3>

            <form onSubmit={handleSaveMovement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Tipo de Movimentação *
                </label>
                <select
                  value={movementType}
                  onChange={(e) => setMovementType(e.target.value as MovementType)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="entry">Entrada (Compra / Reposição)</option>
                  <option value="exit">Saída (Venda / Uso Interno)</option>
                  <option value="adjustment">Ajuste / Inventário Físico</option>
                  <option value="loss">Perda / Avaria</option>
                  <option value="expired">Produto Vencido</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Quantidade *
                </label>
                <InputQuantity
                  value={movementQuantity}
                  onChange={(val) => setMovementQuantity(val)}
                  unit={products.find(p => p.id === selectedProductId)?.unit || 'un'}
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Motivo / Observação
                </label>
                <Input
                  value={movementReason}
                  onChange={(e) => setMovementReason(e.target.value)}
                  placeholder="Ex: Nota Fiscal 402, Quebra de embalagem, etc."
                />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setMovementModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Confirmar Movimentação</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
