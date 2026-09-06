import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  TrendingUp,
  Boxes,
  CalendarDays,
  DollarSign,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency, formatQuantity, formatDate, getDaysUntilExpiration } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { dataStore } from '../../../lib/data-store';

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

export const ReportsOverviewPage: React.FC = () => {
  const { currentCompany } = useCompany();

  // URL Query Parameters Sync para a aba ativa e paginação
  const initialParams = new URLSearchParams(window.location.search);
  const initialTab = (initialParams.get('tab') as 'valuation' | 'expiration' | 'missing_prices') || 'valuation';
  const [activeTab, setActiveTab] = useState<'valuation' | 'expiration' | 'missing_prices'>(initialTab);

  const [page, setPage] = useState(() => {
    const p = parseInt(initialParams.get('page') || '1', 10);
    return isNaN(p) || p < 1 ? 1 : p;
  });
  const [limit, setLimit] = useState<number>(() => {
    const l = parseInt(initialParams.get('limit') || '10', 10);
    return [10, 20, 30].includes(l) ? l : 10;
  });

  const updateUrlParams = (
    newTab: 'valuation' | 'expiration' | 'missing_prices',
    newPage: number = page,
    newLimit: number = limit
  ) => {
    const params = new URLSearchParams();
    params.set('tab', newTab);
    if (newPage > 1) params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());

    const targetUrl = `${window.location.pathname}?${params.toString()}`;
    window.history.pushState({}, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      const tab = (params.get('tab') as 'valuation' | 'expiration' | 'missing_prices') || 'valuation';
      setActiveTab(tab);

      const p = parseInt(params.get('page') || '1', 10);
      setPage(isNaN(p) || p < 1 ? 1 : p);

      const l = parseInt(params.get('limit') || '10', 10);
      setLimit([10, 20, 30].includes(l) ? l : 10);
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleTabChange = (tab: 'valuation' | 'expiration' | 'missing_prices') => {
    setActiveTab(tab);
    setPage(1);
    updateUrlParams(tab, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(activeTab, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(activeTab, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [products, setProducts] = useState(() => dataStore.getProducts(currentCompany?.id));
  const [inventory, setInventory] = useState(() => dataStore.getInventory(currentCompany?.id));
  const [lots, setLots] = useState(() => dataStore.getLots(currentCompany?.id));

  // Sincronização reativa com o dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
      setInventory(dataStore.getInventory(currentCompany?.id));
      setLots(dataStore.getLots(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  // Cálculos do Relatório de Posição de Estoque
  let totalCostValue = 0;
  let totalSaleValue = 0;
  let totalQuantity = 0;

  products.forEach(p => {
    const inv = inventory.find(i => i.product_id === p.id);
    const qty = inv ? inv.quantity : 0;
    totalQuantity += qty;
    totalCostValue += qty * p.cost_price;
    totalSaleValue += qty * p.sale_price;
  });

  const estimatedProfit = totalSaleValue - totalCostValue;
  const profitMarginPercent = totalSaleValue > 0 ? (estimatedProfit / totalSaleValue) * 100 : 0;

  // Produtos sem preço ou sem imagem
  const missingPricesProducts = products.filter(p => p.sale_price <= 0 || !p.cost_price);

  // Lotes ordenados por data de validade
  const sortedLots = [...lots].sort((a, b) => {
    if (!a.expiration_date) return 1;
    if (!b.expiration_date) return -1;
    return new Date(a.expiration_date).getTime() - new Date(b.expiration_date).getTime();
  });

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'valuation') {
      csvContent += 'Produto;SKU;Unidade;Estoque;Preco Custo;Preco Venda;Valor Custo Total;Valor Venda Total\n';
      products.forEach(p => {
        const inv = inventory.find(i => i.product_id === p.id);
        const qty = inv ? inv.quantity : 0;
        csvContent += `"${p.name}";"${p.sku || ''}";"${p.unit}";${qty};${p.cost_price};${p.sale_price};${qty * p.cost_price};${qty * p.sale_price}\n`;
      });
    } else if (activeTab === 'expiration') {
      csvContent += 'Lote;Produto;Data Validade;Dias Restantes;Quantidade;Preco Custo\n';
      sortedLots.forEach(l => {
        const prod = products.find(p => p.id === l.product_id);
        const days = getDaysUntilExpiration(l.expiration_date);
        csvContent += `"${l.lot_number}";"${prod?.name || ''}";"${l.expiration_date || ''}";${days || ''};${l.current_quantity};${l.cost_price || 0}\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio-${activeTab}-${currentCompany?.slug || 'marketflow'}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Itens da aba ativa para paginação
  const currentTabItems =
    activeTab === 'valuation'
      ? products
      : activeTab === 'expiration'
      ? sortedLots
      : missingPricesProducts;

  const totalItems = currentTabItems.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);

  const paginatedProducts = products.slice(startIndex, endIndex);
  const paginatedLots = sortedLots.slice(startIndex, endIndex);
  const paginatedMissingPrices = missingPricesProducts.slice(startIndex, endIndex);

  const renderPagination = (itemName: string) => (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20 text-sm">
      <div className="text-xs text-muted-foreground">
        Mostrando <span className="font-semibold text-foreground">{totalItems === 0 ? 0 : startIndex + 1}</span> a{' '}
        <span className="font-semibold text-foreground">{endIndex}</span> de{' '}
        <span className="font-semibold text-foreground">{totalItems}</span> {itemName}
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
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Relatórios' }, { label: 'Relatórios Operacionais' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Relatórios Operacionais</h1>
          <p className="text-sm text-muted-foreground">
            Análise de valoração do estoque, previsões de validade e consistência de cadastros.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir
          </Button>
          <Button size="sm" onClick={handleExportCSV}>
            <Download className="mr-2 h-4 w-4" /> Exportar CSV
          </Button>
        </div>
      </div>

      {/* Selector de Abas de Relatório */}
      <div className="flex space-x-2 border-b pb-2">
        <button
          onClick={() => handleTabChange('valuation')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'valuation' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <DollarSign className="h-4 w-4" />
          <span>Valoração do Estoque</span>
        </button>

        <button
          onClick={() => handleTabChange('expiration')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'expiration' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <CalendarDays className="h-4 w-4" />
          <span>Curva de Validade</span>
        </button>

        <button
          onClick={() => handleTabChange('missing_prices')}
          className={`flex items-center space-x-2 px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
            activeTab === 'missing_prices' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-accent'
          }`}
        >
          <BarChart3 className="h-4 w-4" />
          <span>Conferência de Preços</span>
        </button>
      </div>

      {/* Conteúdo da Aba 1: Valoração de Estoque */}
      {activeTab === 'valuation' && (
        <div className="space-y-6">
          {/* KPI Cards de Métricas de Valoração */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Valor em Custo (Investido)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{formatCurrency(totalCostValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Custo total das mercadorias em estoque</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Valor Potencial de Venda
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-success">{formatCurrency(totalSaleValue)}</div>
                <p className="text-xs text-muted-foreground mt-1">Receita prevista se todo estoque for vendido</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Lucro Bruto Estimado
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono text-primary">{formatCurrency(estimatedProfit)}</div>
                <p className="text-xs text-muted-foreground mt-1">Margem média: {profitMarginPercent.toFixed(1)}%</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
                  Total de Unidades Físicas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">{totalQuantity} itens</div>
                <p className="text-xs text-muted-foreground mt-1">Distribuídos em {products.length} produtos</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabela Detalhada por Produto */}
          <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                  <tr>
                    <th className="p-4">Produto</th>
                    <th className="p-4 text-center">Qtd Estoque</th>
                    <th className="p-4 text-right">Preço Custo</th>
                    <th className="p-4 text-right">Preço Venda</th>
                    <th className="p-4 text-right">Total Custo</th>
                    <th className="p-4 text-right">Total Venda</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono text-xs">
                  {paginatedProducts.map(p => {
                    const inv = inventory.find(i => i.product_id === p.id);
                    const qty = inv ? inv.quantity : 0;
                    return (
                      <tr key={p.id} className="hover:bg-muted/30">
                        <td className="p-4 font-sans font-medium text-foreground">{p.name}</td>
                        <td className="p-4 text-center font-bold">{qty} {p.unit}</td>
                        <td className="p-4 text-right">{formatCurrency(p.cost_price)}</td>
                        <td className="p-4 text-right font-bold text-foreground">{formatCurrency(p.sale_price)}</td>
                        <td className="p-4 text-right text-muted-foreground">{formatCurrency(qty * p.cost_price)}</td>
                        <td className="p-4 text-right text-success font-bold">{formatCurrency(qty * p.sale_price)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {renderPagination('produtos')}
          </div>
        </div>
      )}

      {/* Conteúdo da Aba 2: Curva de Validade de Lotes */}
      {activeTab === 'expiration' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Lote</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4 text-center">Data de Validade</th>
                  <th className="p-4 text-center">Quantidade</th>
                  <th className="p-4 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedLots.map(lot => {
                  const prod = products.find(p => p.id === lot.product_id);
                  const days = getDaysUntilExpiration(lot.expiration_date);

                  return (
                    <tr key={lot.id} className="hover:bg-muted/30">
                      <td className="p-4 font-mono font-bold">{lot.lot_number}</td>
                      <td className="p-4 font-medium">{prod?.name || 'Produto'}</td>
                      <td className="p-4 text-center font-mono">{formatDate(lot.expiration_date)}</td>
                      <td className="p-4 text-center font-mono font-semibold">{lot.current_quantity} {prod?.unit || 'un'}</td>
                      <td className="p-4 text-center">
                        <Badge variant={days !== null && days <= 15 ? 'destructive' : 'warning'}>
                          {days === 0 ? 'Vence hoje' : days && days < 0 ? 'Vencido' : `${days} dias restantes`}
                        </Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {renderPagination('lotes')}
        </div>
      )}

      {/* Conteúdo da Aba 3: Conferência de Preços */}
      {activeTab === 'missing_prices' && (
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-base">Inconsistências de Preço ou Cadastro</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {missingPricesProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-6 text-center">
                Todos os produtos cadastrados possuem preço de custo e venda válidos.
              </p>
            ) : (
              <div>
                <div className="divide-y px-6">
                  {paginatedMissingPrices.map(p => (
                    <div key={p.id} className="flex items-center justify-between py-3">
                      <div>
                        <p className="text-sm font-semibold">{p.name}</p>
                        <p className="text-xs text-muted-foreground font-mono">SKU: {p.sku || 'Sem SKU'}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-mono text-muted-foreground">
                          Custo: {formatCurrency(p.cost_price)} | Venda: {formatCurrency(p.sale_price)}
                        </span>
                        <Badge variant="destructive">Revisar Preço</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {renderPagination('produtos com inconsistências')}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
