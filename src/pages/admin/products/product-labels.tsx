import React, { useState } from 'react';
import { Printer, Barcode, CheckSquare, Square, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency } from '../../../lib/utils';
import { mockProducts } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';

export const ProductLabelsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentCompany } = useCompany();
  const products = mockProducts.filter(p => p.company_id === currentCompany?.id);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(
    products.slice(0, 3).map(p => p.id)
  );

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 print:hidden">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Produtos', href: '#' }, { label: 'Imprimir Etiquetas' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Gerador de Etiquetas de Gôndola</h1>
          <p className="text-sm text-muted-foreground">
            Selecione os produtos para gerar etiquetas prontas para gôndolas e prateleiras.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button size="sm" onClick={() => window.print()} disabled={selectedProducts.length === 0}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Etiquetas
          </Button>
        </div>
      </div>

      {/* Seleção de Produtos (Escondida na impressão) */}
      <Card className="print:hidden">
        <CardHeader>
          <CardTitle className="text-base">Selecione os Produtos para a Folha de Etiquetas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map(p => {
              const isSelected = selectedProductIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => toggleSelect(p.id)}
                  className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer transition-colors ${
                    isSelected ? 'bg-primary/10 border-primary font-medium' : 'hover:bg-accent'
                  }`}
                >
                  <div className="truncate">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground font-mono">{formatCurrency(p.sale_price)}</p>
                  </div>
                  {isSelected ? (
                    <CheckSquare className="h-5 w-5 text-primary shrink-0" />
                  ) : (
                    <Square className="h-5 w-5 text-muted-foreground shrink-0" />
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Layout de Impressão de Etiquetas */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold uppercase text-muted-foreground print:hidden">
          Folha de Impressão ({selectedProducts.length} etiquetas)
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
          {selectedProducts.map(p => (
            <div
              key={p.id}
              className="border-2 border-black bg-white text-black p-3 rounded-md flex flex-col justify-between h-36 shadow-sm print:shadow-none print:break-inside-avoid"
            >
              <div>
                <span className="text-[10px] uppercase font-bold text-gray-500 block truncate">
                  {currentCompany?.name}
                </span>
                <h4 className="font-extrabold text-sm leading-tight uppercase line-clamp-2 mt-0.5">
                  {p.name}
                </h4>
              </div>

              <div className="my-1 flex items-baseline justify-between border-t border-b border-black py-1">
                <span className="text-[10px] font-bold uppercase">Preço R$</span>
                <span className="text-xl font-black font-mono">
                  {p.sale_price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <div className="flex items-center justify-between text-[9px] font-mono">
                <div className="flex items-center space-x-1">
                  <Barcode className="h-4 w-4 shrink-0" />
                  <span>{p.barcode || p.sku || '789000000000'}</span>
                </div>
                <span>UN: {p.unit}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
