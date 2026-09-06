import React, { useState, useEffect } from 'react';
import {
  Tags,
  Plus,
  Search,
  Edit,
  Trash2,
  FolderTree,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { Category } from '../../../types';
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

export const CategoryListPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [categories, setCategories] = useState<Category[]>(() =>
    dataStore.getCategories(currentCompany?.id)
  );

  // Escuta atualizações reativas do dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setCategories(dataStore.getCategories(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  // URL Query Parameters Sync (Filtros e Paginação)
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState(initialParams.get('type') || 'all');

  const parsedPage = parseInt(initialParams.get('page') || '1', 10);
  const [page, setPage] = useState<number>(isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage);

  const parsedLimit = parseInt(initialParams.get('limit') || '10', 10);
  const [limit, setLimit] = useState<number>([10, 20, 30].includes(parsedLimit) ? parsedLimit : 10);

  const updateUrlParams = (
    newSearch: string,
    newStatus: string,
    newType: string,
    newPage: number,
    newLimit: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus !== 'all') params.set('status', newStatus);
    if (newType !== 'all') params.set('type', newType);

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
      setStatusFilter(params.get('status') || 'all');
      setTypeFilter(params.get('type') || 'all');

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
    updateUrlParams(val, statusFilter, typeFilter, 1, limit);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    updateUrlParams(search, val, typeFilter, 1, limit);
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    setPage(1);
    updateUrlParams(search, statusFilter, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, statusFilter, typeFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, statusFilter, typeFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

  const products = dataStore.getProducts(currentCompany?.id);

  const filteredCategories = categories.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      (c.description && c.description.toLowerCase().includes(search.toLowerCase())) ||
      c.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? c.active !== false : c.active === false);

    const matchesType =
      typeFilter === 'all' ||
      (typeFilter === 'parent' ? !c.parent_id : !!c.parent_id);

    return matchesSearch && matchesStatus && matchesType;
  });

  // Paginação
  const totalItems = filteredCategories.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedCategories = filteredCategories.slice(startIndex, endIndex);

  const handleOpenModal = (cat?: Category) => {
    if (cat) {
      setEditingCategory(cat);
      setName(cat.name);
      setDescription(cat.description || '');
      setParentId(cat.parent_id || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setParentId('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategory) {
      const updatedCat: Category = {
        ...editingCategory,
        name,
        description,
        parent_id: parentId || undefined,
        updated_at: new Date().toISOString(),
      };
      dataStore.saveCategory(updatedCat);
      setCategories(dataStore.getCategories(currentCompany?.id));
    } else {
      const newCat: Category = {
        id: `cat-${Date.now()}`,
        company_id: currentCompany?.id || 'comp-1',
        name,
        description,
        parent_id: parentId || undefined,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataStore.saveCategory(newCat);
      setCategories(dataStore.getCategories(currentCompany?.id));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Categorias' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Categorias de Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Organize seus produtos por categorias e subcategorias sincronizadas no backend.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Categoria
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome ou descrição da categoria..."
              className="pl-9"
            />
          </div>

          <DropdownFilterMenu
            groups={[
              {
                id: 'limit',
                title: 'Itens por Página',
                selectedValue: String(limit),
                onChange: (val) => handleLimitChange(Number(val)),
                options: [
                  { id: '10', label: '10 categorias por página' },
                  { id: '20', label: '20 categorias por página' },
                  { id: '30', label: '30 categorias por página' },
                ],
              },
              {
                id: 'status',
                title: 'Status',
                selectedValue: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { id: 'all', label: 'Todos os Status', badge: categories.length },
                  { id: 'active', label: 'Ativas', badge: categories.filter(c => c.active !== false).length },
                  { id: 'inactive', label: 'Inativas', badge: categories.filter(c => c.active === false).length },
                ],
              },
              {
                id: 'type',
                title: 'Nível Hierárquico',
                selectedValue: typeFilter,
                onChange: handleTypeChange,
                options: [
                  { id: 'all', label: 'Todas as Categorias', badge: categories.length },
                  { id: 'parent', label: 'Categorias Principais', badge: categories.filter(c => !c.parent_id).length },
                  { id: 'sub', label: 'Subcategorias', badge: categories.filter(c => !!c.parent_id).length },
                ],
              },
            ]}
            onResetAll={() => {
              setSearch('');
              setStatusFilter('all');
              setTypeFilter('all');
              setPage(1);
              setLimit(10);
              updateUrlParams('', 'all', 'all', 1, 10);
            }}
          />
        </div>
      </Card>

      {/* Tabela de Categorias */}
      {filteredCategories.length === 0 ? (
        <EmptyState
          icon={Tags}
          title="Nenhuma categoria encontrada"
          description="Ajuste os filtros de pesquisa ou cadastre uma nova categoria."
          actionLabel="Cadastrar Categoria"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Categoria</th>
                  <th className="p-4">Hierarquia</th>
                  <th className="p-4 text-center">Produtos Vinculados</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedCategories.map(cat => {
                  const parent = categories.find(c => c.id === cat.parent_id);
                  const linkedProductsCount = products.filter(p => p.category_id === cat.id).length;

                  return (
                    <tr key={cat.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <Tags className="h-5 w-5" />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{cat.name}</p>
                            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                              <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-semibold">
                                ID: {cat.id}
                              </span>
                              {cat.description && (
                                <span className="line-clamp-1">{cat.description}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        {parent ? (
                          <div className="flex items-center text-xs text-muted-foreground">
                            <FolderTree className="h-3.5 w-3.5 mr-1 text-primary shrink-0" />
                            <span>Subcategoria de: <strong className="text-foreground">{parent.name}</strong></span>
                          </div>
                        ) : (
                          <Badge variant="outline" className="text-xs">
                            Categoria Principal
                          </Badge>
                        )}
                      </td>
                      <td className="p-4 text-center">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {linkedProductsCount} {linkedProductsCount === 1 ? 'produto' : 'produtos'}
                        </Badge>
                      </td>
                      <td className="p-4 text-center">
                        {cat.active !== false ? (
                          <Badge variant="success">Ativa</Badge>
                        ) : (
                          <Badge variant="secondary">Inativa</Badge>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleOpenModal(cat)}
                          title="Editar categoria"
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
              <span className="font-semibold text-foreground">{totalItems}</span> categorias
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

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingCategory ? 'Editar Categoria' : 'Nova Categoria'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome da Categoria *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Bebidas" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Categoria Pai (Hierarquia Opcional)
                </label>
                <select
                  value={parentId}
                  onChange={(e) => setParentId(e.target.value)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="">Nenhuma (Categoria Principal)</option>
                  {categories
                    .filter(c => c.id !== editingCategory?.id)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Descrição
                </label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Breve descrição..." />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Categoria</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
