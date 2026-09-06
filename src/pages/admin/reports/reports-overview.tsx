import React, { useState } from 'react';
import { BarChart3, Download, Printer, TrendingUp, Boxes, CalendarDays, DollarSign } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency, formatQuantity, formatDate, getDaysUntilExpiration } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { dataStore } from '../../../lib/data-store';

export const ReportsOverviewPage: React.FC = () => {
  const { currentCompany } = useCompany();

  // URL Query Parameters Sync para a aba ativa
  const initialParams = new URLSearchParams(window.location.search);
  const initialTab = (initialParams.get('tab') as 'valuation' | 'expiration' | 'missing_prices') || 'valuation';
  const [activeTab, setActiveTab] = useState<'valuation' | 'expiration' | 'missing_prices'>(initialTab);

  const handleTabChange = (tab: 'valuation' | 'expiration' | 'missing_prices') => {
    setActiveTab(tab);
    const params = new URLSearchParams(window.location.search);
    params.set('tab', tab);
    window.history.replaceState({}, '', `?${params.toString()}`);
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
          <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
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
                {products.map(p => {
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
        </div>
      )}

      {/* Conteúdo da Aba 2: Curva de Validade de Lotes */}
      {activeTab === 'expiration' && (
        <div className="rounded-lg border bg-card shadow-sm overflow-x-auto">
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
              {sortedLots.map(lot => {
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
      )}

      {/* Conteúdo da Aba 3: Conferência de Preços */}
      {activeTab === 'missing_prices' && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Inconsistências de Preço ou Cadastro</CardTitle>
          </CardHeader>
          <CardContent>
            {missingPricesProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground p-4 text-center">
                Todos os produtos cadastrados possuem preço de custo e venda válidos.
              </p>
            ) : (
              <div className="divide-y">
                {missingPricesProducts.map(p => (
                  <div key={p.id} className="flex items-center justify-between py-3">
                    <div>
                      <p className="text-sm font-semibold">{p.name}</p>
                      <p className="text-xs text-muted-foreground">SKU: {p.sku || 'Sem SKU'}</p>
                    </div>
                    <Badge variant="destructive">Revisar Preço</Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
