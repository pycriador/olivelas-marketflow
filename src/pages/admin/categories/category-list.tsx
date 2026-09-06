import React, { useState } from 'react';
import { Tags, Plus, Search, Edit, Trash2, FolderTree } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { mockCategories } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { Category } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

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

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.get('status') || 'all');
  const [typeFilter, setTypeFilter] = useState(initialParams.get('type') || 'all');

  const updateUrlParams = (newSearch: string, newStatus: string, newType: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    if (newType !== 'all') params.set('type', newType); else params.delete('type');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, statusFilter, typeFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateUrlParams(search, val, typeFilter);
  };

  const handleTypeChange = (val: string) => {
    setTypeFilter(val);
    updateUrlParams(search, statusFilter, val);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');

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
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredCategories.map(cat => {
          const parent = categories.find(c => c.id === cat.parent_id);
          return (
            <Card key={cat.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-start justify-between pb-2">
                <div className="flex items-center space-x-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Tags className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-semibold">{cat.name}</CardTitle>
                    {parent && (
                      <span className="text-xs text-muted-foreground flex items-center mt-0.5">
                        <FolderTree className="h-3 w-3 mr-1" /> Subcategoria de: {parent.name}
                      </span>
                    )}
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => handleOpenModal(cat)}>
                  <Edit className="h-4 w-4 text-muted-foreground" />
                </Button>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground line-clamp-2">
                  {cat.description || 'Sem descrição cadastrada.'}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <Badge variant="success">Ativa</Badge>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

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
