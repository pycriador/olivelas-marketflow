import React, { useState } from 'react';
import { Boxes, Search, PlusCircle, MinusCircle, RefreshCw, AlertTriangle, ArrowUpDown } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputQuantity } from '../../../components/ui/input-quantity';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatQuantity } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { MovementType, InventoryMovement, Product, InventoryItem } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const InventoryOverviewPage: React.FC = () => {
  const { currentCompany } = useCompany();

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.get('category') || 'all');
  const [stockStatusFilter, setStockStatusFilter] = useState<string>(initialParams.get('stock') || 'all');

  const updateUrlParams = (newSearch: string, newCat: string, newStock: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newCat !== 'all') params.set('category', newCat); else params.delete('category');
    if (newStock !== 'all') params.set('stock', newStock); else params.delete('stock');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, selectedCategory, stockStatusFilter);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    updateUrlParams(search, val, stockStatusFilter);
  };

  const handleStockStatusChange = (val: string) => {
    setStockStatusFilter(val);
    updateUrlParams(search, selectedCategory, val);
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
              ]}
              onResetAll={() => {
                setSelectedCategory('all');
                setStockStatusFilter('all');
                setSearch('');
                updateUrlParams('', 'all', 'all');
              }}
            />
          </div>
        </div>
      </Card>

      <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
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
            {filteredProducts.map(prod => {
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
