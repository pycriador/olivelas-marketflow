import React, { useState, useEffect } from 'react';
import {
  Printer,
  Barcode,
  CheckSquare,
  Square,
  ArrowLeft,
  Search,
  Package,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  CheckCheck,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
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

export const ProductLabelsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentCompany } = useCompany();
  const [products, setProducts] = useState(() =>
    dataStore.getProducts(currentCompany?.id)
  );

  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const categories = dataStore.getCategories(currentCompany?.id);

  // URL Query Parameters Sync (Filtros e Paginação)
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [categoryFilter, setCategoryFilter] = useState(initialParams.get('category') || 'all');
  const [selectionFilter, setSelectionFilter] = useState(initialParams.get('selection') || 'all');

  const parsedPage = parseInt(initialParams.get('page') || '1', 10);
  const [page, setPage] = useState<number>(isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage);

  const parsedLimit = parseInt(initialParams.get('limit') || '10', 10);
  const [limit, setLimit] = useState<number>([10, 20, 30].includes(parsedLimit) ? parsedLimit : 10);

  const [selectedProductIds, setSelectedProductIds] = useState<string[]>(() =>
    products.slice(0, 4).map(p => p.id)
  );

  const updateUrlParams = (
    newSearch: string,
    newCat: string,
    newSel: string,
    newPage: number,
    newLimit: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCat !== 'all') params.set('category', newCat);
    if (newSel !== 'all') params.set('selection', newSel);

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
      setCategoryFilter(params.get('category') || 'all');
      setSelectionFilter(params.get('selection') || 'all');

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
    updateUrlParams(val, categoryFilter, selectionFilter, 1, limit);
  };

  const handleCategoryChange = (val: string) => {
    setCategoryFilter(val);
    setPage(1);
    updateUrlParams(search, val, selectionFilter, 1, limit);
  };

  const handleSelectionChange = (val: string) => {
    setSelectionFilter(val);
    setPage(1);
    updateUrlParams(search, categoryFilter, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, categoryFilter, selectionFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, categoryFilter, selectionFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const toggleSelect = (id: string) => {
    setSelectedProductIds(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search)) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = categoryFilter === 'all' || p.category_id === categoryFilter;

    const isSelected = selectedProductIds.includes(p.id);
    const matchesSel =
      selectionFilter === 'all' ||
      (selectionFilter === 'selected' ? isSelected : !isSelected);

    return matchesSearch && matchesCat && matchesSel;
  });

  // Paginação
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  const selectAllCurrentPage = () => {
    const pageIds = paginatedProducts.map(p => p.id);
    setSelectedProductIds(prev => Array.from(new Set([...prev, ...pageIds])));
  };

  const deselectAllCurrentPage = () => {
    const pageIds = new Set(paginatedProducts.map(p => p.id));
    setSelectedProductIds(prev => prev.filter(id => !pageIds.has(id)));
  };

  const selectedProducts = products.filter(p => selectedProductIds.includes(p.id));

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 print:hidden">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Produtos', href: '#' }, { label: 'Imprimir Etiquetas' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Gerador de Etiquetas de Gôndola</h1>
          <p className="text-sm text-muted-foreground">
            Selecione produtos na tabela abaixo para gerar etiquetas padronizadas para gôndolas e prateleiras.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={onBack}>
            <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
          </Button>
          <Button size="sm" onClick={() => window.print()} disabled={selectedProducts.length === 0}>
            <Printer className="mr-2 h-4 w-4" /> Imprimir Etiquetas ({selectedProducts.length})
          </Button>
        </div>
      </div>

      {/* Barra de Filtros (Escondida na impressão) */}
      <Card className="p-4 print:hidden">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar produto por nome, SKU ou código de barras..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={selectAllCurrentPage}
              title="Selecionar todos os itens exibidos nesta página"
            >
              <CheckCheck className="mr-1.5 h-4 w-4 text-primary" /> Marcar Página
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={deselectAllCurrentPage}
              title="Desmarcar itens desta página"
            >
              Desmarcar
            </Button>

            <DropdownFilterMenu
              groups={[
                {
                  id: 'limit',
                  title: 'Itens por Página',
                  selectedValue: String(limit),
                  onChange: (val) => handleLimitChange(Number(val)),
                  options: [
                    { id: '10', label: '10 produtos por página' },
                    { id: '20', label: '20 produtos por página' },
                    { id: '30', label: '30 produtos por página' },
                  ],
                },
                {
                  id: 'selection',
                  title: 'Seleção para Impressão',
                  selectedValue: selectionFilter,
                  onChange: handleSelectionChange,
                  options: [
                    { id: 'all', label: 'Todos os Produtos', badge: products.length },
                    { id: 'selected', label: 'Apenas Marcados', badge: selectedProductIds.length },
                    { id: 'unselected', label: 'Não Marcados', badge: products.length - selectedProductIds.length },
                  ],
                },
                {
                  id: 'category',
                  title: 'Categorias',
                  selectedValue: categoryFilter,
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
              ]}
              onResetAll={() => {
                setSearch('');
                setCategoryFilter('all');
                setSelectionFilter('all');
                setPage(1);
                setLimit(10);
                updateUrlParams('', 'all', 'all', 1, 10);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabela de Produtos para Seleção de Etiquetas */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Tente ajustar os filtros ou os termos da pesquisa."
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden print:hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4 w-12 text-center">Sel.</th>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria</th>
                  <th className="p-4 text-right">Preço de Venda</th>
                  <th className="p-4 text-center">Unidade</th>
                  <th className="p-4 text-center">Etiqueta</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(product => {
                  const isSelected = selectedProductIds.includes(product.id);
                  const category = categories.find(c => c.id === product.category_id);

                  return (
                    <tr
                      key={product.id}
                      onClick={() => toggleSelect(product.id)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-primary/5 hover:bg-primary/10' : 'hover:bg-muted/30'
                      }`}
                    >
                      <td className="p-4 text-center">
                        {isSelected ? (
                          <CheckSquare className="h-5 w-5 text-primary mx-auto" />
                        ) : (
                          <Square className="h-5 w-5 text-muted-foreground mx-auto" />
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-md border bg-muted flex items-center justify-center">
                            {product.image_url ? (
                              <img src={product.image_url} alt={product.name} className="h-full w-full object-cover" />
                            ) : (
                              <Package className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{product.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
                              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-semibold">ID: {product.id}</span>
                              {product.sku && <span>SKU: {product.sku}</span>}
                              {product.barcode && <span>• EAN: {product.barcode}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-xs font-medium text-foreground">
                        {category?.name || 'Sem categoria'}
                      </td>
                      <td className="p-4 text-right font-mono font-semibold text-foreground">
                        {formatCurrency(product.sale_price)}
                      </td>
                      <td className="p-4 text-center font-mono text-xs">
                        {product.unit}
                      </td>
                      <td className="p-4 text-center">
                        {isSelected ? (
                          <Badge variant="success">Incluído ({selectedProducts.filter(p => p.id === product.id).length})</Badge>
                        ) : (
                          <Badge variant="secondary">Não incluso</Badge>
                        )}
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
              <span className="font-semibold text-foreground">{totalItems}</span> produtos{' '}
              (<strong className="text-primary">{selectedProducts.length}</strong> selecionados para impressão)
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

      {/* Visualização da Folha de Impressão de Etiquetas */}
      <div className="space-y-4 pt-2">
        <div className="flex items-center justify-between print:hidden">
          <h3 className="text-base font-semibold tracking-tight">
            Folha de Impressão ({selectedProducts.length} {selectedProducts.length === 1 ? 'etiqueta' : 'etiquetas'})
          </h3>
          {selectedProducts.length > 0 && (
            <Button size="sm" onClick={() => window.print()}>
              <Printer className="mr-2 h-4 w-4" /> Imprimir Folha Agora
            </Button>
          )}
        </div>

        {selectedProducts.length === 0 ? (
          <div className="p-8 border-2 border-dashed rounded-lg text-center text-muted-foreground text-sm print:hidden">
            Nenhuma etiqueta selecionada. Marque produtos na tabela acima para gerar o modelo de impressão.
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 print:grid-cols-3 print:gap-2">
            {selectedProducts.map(p => (
              <div
                key={`label-${p.id}`}
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
        )}
      </div>
    </div>
  );
};

