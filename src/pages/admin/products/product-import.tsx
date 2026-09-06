import React, { useState } from 'react';
import { Upload, FileSpreadsheet, CheckCircle2, AlertTriangle, ArrowLeft, Save, Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency } from '../../../lib/utils';
import { mockProducts } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { Product } from '../../../types';

interface CsvRow {
  name: string;
  sku: string;
  barcode: string;
  unit: string;
  cost_price: number;
  sale_price: number;
  minimum_stock: number;
  status: 'valid' | 'invalid';
  errorReason?: string;
}

export const ProductImportPage: React.FC<{ onBack: () => void; onImportComplete: () => void }> = ({
  onBack,
  onImportComplete,
}) => {
  const { currentCompany } = useCompany();
  const [parsedRows, setParsedRows] = useState<CsvRow[]>([]);
  const [isImported, setIsImported] = useState(false);

  const handleDownloadTemplate = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Nome;SKU;CodigoBarras;Unidade;PrecoCusto;PrecoVenda;EstoqueMinimo\n' +
      '"Café Torrado 500g";"CAF-500";"7891234567890";"un";8.50;14.90;10\n' +
      '"Açúcar Refinado 1kg";"ACU-1KG";"7891234567891";"un";3.20;4.99;20\n';

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'modelo-importacao-produtos.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleSimulateUpload = () => {
    // Simula a leitura e parsing de um arquivo CSV de exemplo
    const sampleData: CsvRow[] = [
      {
        name: 'Café Torrado e Moído 500g',
        sku: 'CAF-500G',
        barcode: '7891234567890',
        unit: 'un',
        cost_price: 8.50,
        sale_price: 14.90,
        minimum_stock: 10,
        status: 'valid',
      },
      {
        name: 'Açúcar Refinado 1kg',
        sku: 'ACU-1KG',
        barcode: '7891234567891',
        unit: 'un',
        cost_price: 3.20,
        sale_price: 4.99,
        minimum_stock: 20,
        status: 'valid',
      },
      {
        name: 'Feijão Carioca 1kg',
        sku: 'FEI-1KG',
        barcode: '7891234567892',
        unit: 'un',
        cost_price: 5.50,
        sale_price: 7.80,
        minimum_stock: 15,
        status: 'valid',
      },
      {
        name: 'Produto Sem Nome',
        sku: '',
        barcode: '',
        unit: 'un',
        cost_price: 0,
        sale_price: -5.00,
        minimum_stock: 0,
        status: 'invalid',
        errorReason: 'Preço de venda inválido',
      },
    ];

    setParsedRows(sampleData);
  };

  const handleConfirmImport = () => {
    const validRows = parsedRows.filter(r => r.status === 'valid');

    validRows.forEach(row => {
      const newProd: Product = {
        id: `prod-csv-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
        company_id: currentCompany?.id || 'comp-1',
        name: row.name,
        sku: row.sku,
        barcode: row.barcode,
        unit: row.unit,
        cost_price: row.cost_price,
        sale_price: row.sale_price,
        minimum_stock: row.minimum_stock,
        active: true,
        catalog_visible: true,
        show_price: true,
        allow_contact: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mockProducts.unshift(newProd);
    });

    setIsImported(true);
    setTimeout(() => {
      onImportComplete();
    }, 1500);
  };

  const validCount = parsedRows.filter(r => r.status === 'valid').length;
  const invalidCount = parsedRows.filter(r => r.status === 'invalid').length;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Produtos', href: '#' }, { label: 'Importar Planilha' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Importação de Produtos em Massa</h1>
          <p className="text-sm text-muted-foreground">
            Cadastre múltiplos produtos rapidamente através de uma planilha CSV.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadTemplate}>
            <Download className="mr-2 h-4 w-4" /> Baixar Planilha Modelo (.CSV)
          </Button>
          <Button variant="ghost" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
        </div>
      </div>

      {isImported && (
        <div className="rounded-lg bg-success/10 border border-success/20 p-4 text-sm font-semibold text-success flex items-center">
          <CheckCircle2 className="h-5 w-5 mr-2" />
          {validCount} produtos importados com sucesso! Redirecionando...
        </div>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <FileSpreadsheet className="mr-2 h-4 w-4 text-primary" /> Seleção do Arquivo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex min-h-[160px] flex-col items-center justify-center border-2 border-dashed rounded-lg bg-muted/20 p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
            <p className="text-sm font-semibold">Arraste e solte sua planilha CSV aqui</p>
            <p className="text-xs text-muted-foreground mt-1">Formatos suportados: .CSV com separador ponto e vírgula (;)</p>

            <div className="mt-4 flex items-center space-x-3">
              <Button type="button" onClick={handleSimulateUpload}>
                <FileSpreadsheet className="mr-2 h-4 w-4" /> Carregar Planilha de Exemplo
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pré-visualização da Planilha */}
      {parsedRows.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">Pré-visualização dos Dados ({parsedRows.length} linhas)</CardTitle>
            <div className="flex items-center space-x-2">
              <Badge variant="success">{validCount} Válidos</Badge>
              {invalidCount > 0 && <Badge variant="destructive">{invalidCount} Com Erro</Badge>}
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Nome do Produto</th>
                    <th className="p-3">SKU</th>
                    <th className="p-3">Código de Barras</th>
                    <th className="p-3 text-right">Custo</th>
                    <th className="p-3 text-right">Venda</th>
                    <th className="p-3 text-center">Estoque Mín</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {parsedRows.map((row, idx) => (
                    <tr key={idx} className={row.status === 'invalid' ? 'bg-destructive/10' : ''}>
                      <td className="p-3 font-sans">
                        {row.status === 'valid' ? (
                          <Badge variant="success">OK</Badge>
                        ) : (
                          <Badge variant="destructive">{row.errorReason}</Badge>
                        )}
                      </td>
                      <td className="p-3 font-sans font-semibold text-foreground">{row.name}</td>
                      <td className="p-3">{row.sku || '-'}</td>
                      <td className="p-3">{row.barcode || '-'}</td>
                      <td className="p-3 text-right">{formatCurrency(row.cost_price)}</td>
                      <td className="p-3 text-right font-bold">{formatCurrency(row.sale_price)}</td>
                      <td className="p-3 text-center">{row.minimum_stock} {row.unit}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <Button
              onClick={handleConfirmImport}
              disabled={validCount === 0 || isImported}
              className="w-full"
              size="lg"
            >
              <Save className="mr-2 h-4 w-4" /> Confirmar Importação de {validCount} Produtos
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
