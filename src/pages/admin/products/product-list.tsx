import React, { useState, useEffect } from 'react';
import {
  Package,
  Plus,
  Search,
  Filter,
  Eye,
  EyeOff,
  Edit,
  Trash2,
  Sparkles,
  ExternalLink,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Printer,
  Coffee,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency, formatQuantity } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { Product } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu, FilterGroup } from '../../../components/ui/dropdown-filter-menu';

interface ProductListProps {
  onNavigate: (path: string) => void;
  onEditProduct: (product: Product) => void;
}

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

export const ProductListPage: React.FC<ProductListProps> = ({ onNavigate, onEditProduct }) => {
  const { currentCompany, canStock } = useCompany();

  // URL Query Parameters Sync (Filtros e Paginação)
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [selectedCategory, setSelectedCategory] = useState<string>(initialParams.get('category') || 'all');
  const [statusFilter, setStatusFilter] = useState<string>(initialParams.get('status') || 'all');
  const [basketFilter, setBasketFilter] = useState<string>(initialParams.get('basket') || 'all');

  const parsedPage = parseInt(initialParams.get('page') || '1', 10);
  const [page, setPage] = useState<number>(isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage);

  const parsedLimit = parseInt(initialParams.get('limit') || '10', 10);
  const [limit, setLimit] = useState<number>([10, 20, 30].includes(parsedLimit) ? parsedLimit : 10);

  const updateUrlParams = (
    newSearch: string,
    newCat: string,
    newStatus: string,
    newBasket: string,
    newPage: number,
    newLimit: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCat !== 'all') params.set('category', newCat);
    if (newStatus !== 'all') params.set('status', newStatus);
    if (newBasket !== 'all') params.set('basket', newBasket);

    // Paginação sempre expressa na URL
    params.set('page', newPage.toString());
    params.set('limit', newLimit.toString());

    const newQuery = `?${params.toString()}`;
    const targetUrl = `${window.location.pathname}${newQuery}`;
    window.history.pushState({}, '', targetUrl);
  };

  // Suporte aos botões voltar/avançar do navegador
  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || '');
      setSelectedCategory(params.get('category') || 'all');
      setStatusFilter(params.get('status') || 'all');
      setBasketFilter(params.get('basket') || 'all');

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
    updateUrlParams(val, selectedCategory, statusFilter, basketFilter, 1, limit);
  };

  const handleCategoryChange = (val: string) => {
    setSelectedCategory(val);
    setPage(1);
    updateUrlParams(search, val, statusFilter, basketFilter, 1, limit);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    updateUrlParams(search, selectedCategory, val, basketFilter, 1, limit);
  };

  const handleBasketChange = (val: string) => {
    setBasketFilter(val);
    setPage(1);
    updateUrlParams(search, selectedCategory, statusFilter, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, selectedCategory, statusFilter, basketFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, selectedCategory, statusFilter, basketFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [products, setProducts] = useState<Product[]>(() =>
    dataStore.getProducts(currentCompany?.id)
  );

  // Escuta alterações reativas no dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const categories = dataStore.getCategories(currentCompany?.id);
  const brands = dataStore.getBrands(currentCompany?.id);
  const inventory = dataStore.getInventory(currentCompany?.id);

  // Filtragem de busca e dropdown
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.barcode && p.barcode.includes(search)) ||
      p.id.toLowerCase().includes(search.toLowerCase());

    const matchesCat = selectedCategory === 'all' || p.category_id === selectedCategory;
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? p.active : !p.active);
    const matchesBasket =
      basketFilter === 'all' ||
      (basketFilter === 'basket_only' ? p.active_in_basket !== false : p.active_in_basket === false);

    return matchesSearch && matchesCat && matchesStatus && matchesBasket;
  });

  // Cálculo da Paginação
  const totalItems = filteredProducts.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Produtos' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Produtos Cadastrados</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie o catálogo de itens da sua empresa e controle de visibilidade pública.
          </p>
        </div>
        {canStock && (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/products/import')}>
              <FileSpreadsheet className="mr-1.5 h-4 w-4 text-success" /> Importar CSV
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/products/labels')}>
              <Printer className="mr-1.5 h-4 w-4 text-foreground" /> Etiquetas
            </Button>
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/ai')}>
              <Sparkles className="mr-1.5 h-4 w-4 text-primary" /> IA Foto
            </Button>
            <Button size="sm" onClick={() => onNavigate('/admin/products/new')}>
              <Plus className="mr-1.5 h-4 w-4" /> Novo Produto
            </Button>
          </div>
        )}
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome, SKU ou código de barras..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
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
                  id: 'status',
                  title: 'Status do Produto',
                  selectedValue: statusFilter,
                  onChange: handleStatusChange,
                  options: [
                    { id: 'all', label: 'Todos os Status' },
                    { id: 'active', label: 'Apenas Ativos', badge: products.filter(p => p.active).length },
                    { id: 'inactive', label: 'Inativos', badge: products.filter(p => !p.active).length },
                  ],
                },
                {
                  id: 'basket',
                  title: 'Cesta de Café da Manhã',
                  selectedValue: basketFilter,
                  onChange: handleBasketChange,
                  options: [
                    { id: 'all', label: 'Todos os Produtos' },
                    { id: 'basket_only', label: 'Presente na Cesta', badge: products.filter(p => p.active_in_basket !== false).length },
                    { id: 'not_in_basket', label: 'Fora da Cesta', badge: products.filter(p => p.active_in_basket === false).length },
                  ],
                },
              ]}
              onResetAll={() => {
                setSelectedCategory('all');
                setStatusFilter('all');
                setBasketFilter('all');
                setSearch('');
                setPage(1);
                setLimit(10);
                updateUrlParams('', 'all', 'all', 'all', 1, 10);
              }}
            />
          </div>
        </div>
      </Card>

      {/* Tabela / Grid de Produtos */}
      {filteredProducts.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Nenhum produto encontrado"
          description="Tente ajustar os termos da pesquisa ou cadastre seu primeiro produto."
          actionLabel={canStock ? 'Cadastrar Novo Produto' : undefined}
          onAction={() => onNavigate('/admin/products/new')}
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Produto</th>
                  <th className="p-4">Categoria / Marca</th>
                  <th className="p-4 text-right">Preço de Venda</th>
                  <th className="p-4 text-center">Estoque Atual</th>
                  <th className="p-4 text-center">Catálogo</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedProducts.map(product => {
                  const category = categories.find(c => c.id === product.category_id);
                  const brand = brands.find(b => b.id === product.brand_id);
                  const invItem = inventory.find(i => i.product_id === product.id);
                  const qty = invItem ? invItem.quantity : 0;
                  const isLowStock = qty < product.minimum_stock;

                  return (
                    <tr key={product.id} className="hover:bg-muted/30 transition-colors">
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
                            <div className="flex items-center space-x-1.5">
                              <p className="font-semibold text-foreground">{product.name}</p>
                              {product.active_in_basket !== false && (
                                <Badge variant="outline" className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/30 text-[9px] px-1 py-0 font-sans">
                                  <Coffee className="w-2.5 h-2.5 mr-0.5" /> Cesta
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
                              <span className="bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-semibold">ID: {product.id}</span>
                              {product.sku && <span>SKU: {product.sku}</span>}
                              {product.barcode && <span>• EAN: {product.barcode}</span>}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="text-xs">
                          <span className="font-medium text-foreground block">{category?.name || 'Sem categoria'}</span>
                          <span className="text-muted-foreground">{brand?.name || 'Sem marca'}</span>
                        </div>
                      </td>
                      <td className="p-4 text-right font-mono font-semibold">
                        {product.promotional_price ? (
                          <div>
                            <span className="text-destructive block">{formatCurrency(product.promotional_price)}</span>
                            <span className="line-through text-xs text-muted-foreground">{formatCurrency(product.sale_price)}</span>
                          </div>
                        ) : (
                          formatCurrency(product.sale_price)
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant={isLowStock ? 'warning' : 'outline'} className="font-mono">
                          {formatQuantity(qty, product.unit)}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {product.catalog_visible ? (
                          <span className="inline-flex items-center text-xs font-semibold text-success">
                            <Eye className="mr-1 h-3.5 w-3.5" /> Visível
                          </span>
                        ) : (
                          <span className="inline-flex items-center text-xs text-muted-foreground">
                            <EyeOff className="mr-1 h-3.5 w-3.5" /> Oculto
                          </span>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        {product.active ? (
                          <Badge variant="success">Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right space-x-1 whitespace-nowrap">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            const prefix = window.location.pathname.startsWith('/olivelas-marketflow') ? '/olivelas-marketflow' : '';
                            window.open(`${prefix}/loja/${currentCompany?.slug || 'cestas-cafe-da-manha'}/produto/${product.id}`, '_blank');
                          }}
                          title="Ver página pública do produto"
                        >
                          <ExternalLink className="h-4 w-4 text-primary" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => onEditProduct(product)}
                          title="Editar produto"
                        >
                          <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
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
              <span className="font-semibold text-foreground">{totalItems}</span> produtos
            </div>

            <div className="flex flex-wrap items-center gap-4">
              {/* Seletor rápido de 10, 20, 30 itens por página */}
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

              {/* Botões de Navegação de Página */}
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

                {/* Páginas Numeradas */}
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
    </div>
  );
};
