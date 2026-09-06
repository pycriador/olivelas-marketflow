import React, { useState } from 'react';
import { History, TrendingUp, TrendingDown, ArrowLeft, DollarSign, Calendar } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { dataStore } from '../../../lib/data-store';
import { useCompany } from '../../../context/company-context';

export interface PriceHistoryRecord {
  id: string;
  product_id: string;
  product_name: string;
  old_cost_price: number;
  new_cost_price: number;
  old_sale_price: number;
  new_sale_price: number;
  old_promotional_price?: number;
  new_promotional_price?: number;
  changed_by_name: string;
  created_at: string;
}

export const PriceHistoryPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentCompany } = useCompany();
  const products = dataStore.getProducts(currentCompany?.id);
  const [selectedProductId, setSelectedProductId] = useState<string>('all');

  const historyRecords: PriceHistoryRecord[] = [
    {
      id: 'ph-1',
      product_id: 'prod-1',
      product_name: 'Refrigerante Coca-Cola 2L',
      old_cost_price: 7.00,
      new_cost_price: 7.50,
      old_sale_price: 10.90,
      new_sale_price: 11.90,
      changed_by_name: 'Willian Oliveira (Global Admin)',
      created_at: new Date(Date.now() - 3600000 * 24 * 2).toISOString(),
    },
    {
      id: 'ph-2',
      product_id: 'prod-2',
      product_name: 'Arroz Tipo 1 Camil 5kg',
      old_cost_price: 20.00,
      new_cost_price: 22.00,
      old_sale_price: 26.90,
      new_sale_price: 29.90,
      changed_by_name: 'Willian Oliveira (Global Admin)',
      created_at: new Date(Date.now() - 3600000 * 24 * 5).toISOString(),
    },
    {
      id: 'ph-3',
      product_id: 'prod-3',
      product_name: 'Leite Integral Ninho 1L',
      old_cost_price: 4.00,
      new_cost_price: 4.20,
      old_sale_price: 5.99,
      new_sale_price: 6.49,
      changed_by_name: 'Maria Estoquista',
      created_at: new Date(Date.now() - 3600000 * 24 * 10).toISOString(),
    },
  ];

  const filteredHistory = historyRecords.filter(r =>
    selectedProductId === 'all' || r.product_id === selectedProductId
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Produtos', href: '#' }, { label: 'Histórico de Preços' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Histórico de Alteração de Preços</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe o histórico de reajustes dos preços de custo e venda dos produtos.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex items-center space-x-3 max-w-md">
          <label className="text-xs font-semibold uppercase text-muted-foreground shrink-0">Filtrar Produto:</label>
          <select
            value={selectedProductId}
            onChange={(e) => setSelectedProductId(e.target.value)}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
          >
            <option value="all">Todos os Produtos</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <History className="mr-2 h-4 w-4 text-primary" /> Registros de Reajuste Comercial
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="p-4">Data do Reajuste</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4 text-right">Custo Anterior → Novo</th>
                  <th className="p-4 text-right">Venda Anterior → Novo</th>
                  <th className="p-4 text-center">Variação Venda</th>
                  <th className="p-4">Alterado por</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {filteredHistory.map(rec => {
                  const saleDiff = rec.new_sale_price - rec.old_sale_price;
                  const isPriceUp = saleDiff > 0;

                  return (
                    <tr key={rec.id} className="hover:bg-muted/30">
                      <td className="p-4 text-muted-foreground">{formatDate(rec.created_at)}</td>
                      <td className="p-4 font-sans font-bold text-foreground">{rec.product_name}</td>
                      <td className="p-4 text-right">
                        <span className="line-through text-muted-foreground">{formatCurrency(rec.old_cost_price)}</span>
                        <span className="ml-1 text-foreground font-bold">{formatCurrency(rec.new_cost_price)}</span>
                      </td>
                      <td className="p-4 text-right">
                        <span className="line-through text-muted-foreground">{formatCurrency(rec.old_sale_price)}</span>
                        <span className="ml-1 text-foreground font-bold">{formatCurrency(rec.new_sale_price)}</span>
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={isPriceUp ? 'destructive' : 'success'} className="font-mono">
                          {isPriceUp ? '+' : ''}{formatCurrency(saleDiff)}
                        </Badge>
                      </td>
                      <td className="p-4 font-sans text-muted-foreground">{rec.changed_by_name}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
