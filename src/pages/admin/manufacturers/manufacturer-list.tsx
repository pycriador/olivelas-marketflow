import React, { useState, useEffect } from 'react';
import {
  Factory,
  Plus,
  Search,
  Edit,
  Globe,
  Phone,
  Mail,
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
import { Manufacturer } from '../../../types';
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

export const ManufacturerListPage: React.FC = () => {
  const { currentCompany } = useCompany();

  const [manufacturers, setManufacturers] = useState<Manufacturer[]>(() =>
    dataStore.getManufacturers(currentCompany?.id)
  );

  // Escuta atualizações reativas do dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setManufacturers(dataStore.getManufacturers(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  // URL Query Parameters Sync (Filtros e Paginação)
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(initialParams.get('status') || 'all');

  const parsedPage = parseInt(initialParams.get('page') || '1', 10);
  const [page, setPage] = useState<number>(isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage);

  const parsedLimit = parseInt(initialParams.get('limit') || '10', 10);
  const [limit, setLimit] = useState<number>([10, 20, 30].includes(parsedLimit) ? parsedLimit : 10);

  const updateUrlParams = (
    newSearch: string,
    newStatus: string,
    newPage: number,
    newLimit: number
  ) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newStatus !== 'all') params.set('status', newStatus);

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
      setStatusFilter(params.get('status') || 'all');

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
    updateUrlParams(val, statusFilter, 1, limit);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    setPage(1);
    updateUrlParams(search, val, 1, limit);
  };

  const handleLimitChange = (newLimit: number) => {
    setLimit(newLimit);
    setPage(1);
    updateUrlParams(search, statusFilter, 1, newLimit);
  };

  const handlePageChange = (newPage: number) => {
    setPage(newPage);
    updateUrlParams(search, statusFilter, newPage, limit);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMfg, setEditingMfg] = useState<Manufacturer | null>(null);

  const [name, setName] = useState('');
  const [document, setDocument] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [website, setWebsite] = useState('');

  const filtered = manufacturers.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      (m.document && m.document.includes(search)) ||
      (m.email && m.email.toLowerCase().includes(search.toLowerCase())) ||
      m.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? m.active !== false : m.active === false);

    return matchesSearch && matchesStatus;
  });

  // Paginação
  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / limit));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const startIndex = (safePage - 1) * limit;
  const endIndex = Math.min(startIndex + limit, totalItems);
  const paginatedManufacturers = filtered.slice(startIndex, endIndex);

  const handleOpenModal = (mfg?: Manufacturer) => {
    if (mfg) {
      setEditingMfg(mfg);
      setName(mfg.name);
      setDocument(mfg.document || '');
      setPhone(mfg.phone || '');
      setEmail(mfg.email || '');
      setWebsite(mfg.website || '');
    } else {
      setEditingMfg(null);
      setName('');
      setDocument('');
      setPhone('');
      setEmail('');
      setWebsite('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingMfg) {
      const updatedMfg: Manufacturer = {
        ...editingMfg,
        name,
        document,
        phone,
        email,
        website,
        updated_at: new Date().toISOString(),
      };
      dataStore.saveManufacturer(updatedMfg);
      setManufacturers(dataStore.getManufacturers(currentCompany?.id));
    } else {
      const newMfg: Manufacturer = {
        id: `mfg-${Date.now()}`,
        company_id: currentCompany?.id || 'comp-1',
        name,
        document,
        phone,
        email,
        website,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataStore.saveManufacturer(newMfg);
      setManufacturers(dataStore.getManufacturers(currentCompany?.id));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Fabricantes' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Fabricantes de Produtos</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os fabricantes industriais das mercadorias vendidas em {currentCompany?.name}.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fabricante
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome do fabricante ou CNPJ..."
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
                  { id: '10', label: '10 fabricantes por página' },
                  { id: '20', label: '20 fabricantes por página' },
                  { id: '30', label: '30 fabricantes por página' },
                ],
              },
              {
                id: 'status',
                title: 'Status',
                selectedValue: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { id: 'all', label: 'Todos os Status', badge: manufacturers.length },
                  { id: 'active', label: 'Ativos', badge: manufacturers.filter(m => m.active !== false).length },
                  { id: 'inactive', label: 'Inativos', badge: manufacturers.filter(m => m.active === false).length },
                ],
              },
            ]}
            onResetAll={() => {
              setSearch('');
              setStatusFilter('all');
              setPage(1);
              setLimit(10);
              updateUrlParams('', 'all', 1, 10);
            }}
          />
        </div>
      </Card>

      {/* Tabela de Fabricantes */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={Factory}
          title="Nenhum fabricante encontrado"
          description="Ajuste os filtros de pesquisa ou cadastre um novo fabricante."
          actionLabel="Cadastrar Fabricante"
          onAction={() => handleOpenModal()}
        />
      ) : (
        <div className="rounded-lg border bg-card shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-muted/50 text-xs font-semibold uppercase text-muted-foreground">
                <tr>
                  <th className="p-4">Fabricante</th>
                  <th className="p-4">CNPJ / Documento</th>
                  <th className="p-4">Contato & Web</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {paginatedManufacturers.map(mfg => (
                  <tr key={mfg.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center space-x-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                          <Factory className="h-5 w-5" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{mfg.name}</p>
                          <span className="font-mono bg-muted px-1.5 py-0.5 rounded text-[10px] text-foreground font-semibold">
                            ID: {mfg.id}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-xs text-foreground">
                      {mfg.document || 'Não informado'}
                    </td>
                    <td className="p-4">
                      <div className="space-y-1 text-xs text-muted-foreground">
                        {mfg.phone && (
                          <div className="flex items-center">
                            <Phone className="mr-1.5 h-3.5 w-3.5 text-primary shrink-0" />
                            <span>{mfg.phone}</span>
                          </div>
                        )}
                        {mfg.email && (
                          <div className="flex items-center">
                            <Mail className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <span>{mfg.email}</span>
                          </div>
                        )}
                        {mfg.website && (
                          <div className="flex items-center">
                            <Globe className="mr-1.5 h-3.5 w-3.5 text-muted-foreground shrink-0" />
                            <a href={mfg.website} target="_blank" rel="noreferrer" className="text-primary hover:underline truncate max-w-xs">
                              {mfg.website}
                            </a>
                          </div>
                        )}
                        {!mfg.phone && !mfg.email && !mfg.website && <span>Sem contato</span>}
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      {mfg.active !== false ? (
                        <Badge variant="success">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary">Inativo</Badge>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleOpenModal(mfg)}
                        title="Editar fabricante"
                      >
                        <Edit className="h-4 w-4 text-muted-foreground hover:text-foreground" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Barra Inferior de Paginação e Seletor 10, 20, 30 */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 border-t bg-muted/20 text-sm">
            <div className="text-xs text-muted-foreground">
              Mostrando <span className="font-semibold text-foreground">{startIndex + 1}</span> a{' '}
              <span className="font-semibold text-foreground">{endIndex}</span> de{' '}
              <span className="font-semibold text-foreground">{totalItems}</span> fabricantes
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
              {editingMfg ? 'Editar Fabricante' : 'Novo Fabricante'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome do Fabricante *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Ambev S.A." />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  CNPJ / Documento
                </label>
                <Input value={document} onChange={(e) => setDocument(e.target.value)} placeholder="00.000.000/0001-00" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Telefone
                  </label>
                  <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="(11) 2222-3333" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    E-mail
                  </label>
                  <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="contato@fabrica.com" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Website
                </label>
                <Input value={website} onChange={(e) => setWebsite(e.target.value)} placeholder="https://fabrica.com.br" />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Fabricante</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
