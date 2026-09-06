import React, { useState } from 'react';
import { CalendarDays, Plus, Search, AlertCircle, Clock } from 'lucide-react';
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

  const updateUrlParams = (newSearch: string, newStatus: string, newProd: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    if (newProd !== 'all') params.set('product', newProd); else params.delete('product');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, statusFilter, productFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateUrlParams(search, val, productFilter);
  };

  const handleProductChange = (val: string) => {
    setProductFilter(val);
    updateUrlParams(search, statusFilter, val);
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
              ]}
              onResetAll={() => {
                setStatusFilter('all');
                setProductFilter('all');
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
              <th className="p-4">Número do Lote</th>
              <th className="p-4">Produto</th>
              <th className="p-4">Fornecedor</th>
              <th className="p-4 text-center">Data de Validade</th>
              <th className="p-4 text-center">Qtd Atual</th>
              <th className="p-4 text-center">Status de Validade</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filteredLots.map(lot => {
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
