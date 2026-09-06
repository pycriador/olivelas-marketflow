import React, { useState } from 'react';
import { Bookmark, Plus, Search, Edit, Factory } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { mockBrands } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { Brand } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const BrandListPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [brands, setBrands] = useState<Brand[]>(() =>
    dataStore.getBrands(currentCompany?.id)
  );

  // Escuta atualizações reativas do dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setBrands(dataStore.getBrands(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.get('status') || 'all');

  const updateUrlParams = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, statusFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateUrlParams(search, val);
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const filtered = brands.filter(b => {
    const matchesSearch =
      b.name.toLowerCase().includes(search.toLowerCase()) ||
      (b.description && b.description.toLowerCase().includes(search.toLowerCase())) ||
      b.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? b.active !== false : b.active === false);

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (brand?: Brand) => {
    if (brand) {
      setEditingBrand(brand);
      setName(brand.name);
      setDescription(brand.description || '');
    } else {
      setEditingBrand(null);
      setName('');
      setDescription('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingBrand) {
      const updatedBrand: Brand = {
        ...editingBrand,
        name,
        description,
        updated_at: new Date().toISOString(),
      };
      dataStore.saveBrand(updatedBrand);
      setBrands(dataStore.getBrands(currentCompany?.id));
    } else {
      const newBrand: Brand = {
        id: `brand-${Date.now()}`,
        company_id: currentCompany?.id || 'comp-1',
        name,
        description,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataStore.saveBrand(newBrand);
      setBrands(dataStore.getBrands(currentCompany?.id));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Marcas' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Marcas Comercializadas</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie as marcas e fabricantes dos produtos da sua loja com persistência em tempo real.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Nova Marca
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome ou descrição da marca..."
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
                  { id: 'all', label: 'Todas as Marcas', badge: brands.length },
                  { id: 'active', label: 'Ativas', badge: brands.filter(b => b.active !== false).length },
                  { id: 'inactive', label: 'Inativas', badge: brands.filter(b => b.active === false).length },
                ],
              },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(b => (
          <Card key={b.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  <Bookmark className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{b.name}</CardTitle>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal(b)}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              <p className="text-muted-foreground">{b.description || 'Sem descrição cadastrada.'}</p>
              <div className="pt-2">
                <Badge variant="success">Ativa</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingBrand ? 'Editar Marca' : 'Nova Marca'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome da Marca *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Coca-Cola" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Descrição
                </label>
                <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Linha de produtos da marca..." />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Marca</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
