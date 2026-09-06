import React, { useState } from 'react';
import { Truck, Plus, Search, Edit, Phone, Mail, MessageSquare } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { mockSuppliers } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { Supplier } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const SupplierListPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [suppliers, setSuppliers] = useState<Supplier[]>(() =>
    dataStore.getSuppliers(currentCompany?.id)
  );

  // Escuta atualizações reativas do dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setSuppliers(dataStore.getSuppliers(currentCompany?.id));
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
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  const [name, setName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [contactName, setContactName] = useState('');
  const [phone, setPhone] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');

  const filtered = suppliers.filter(s => {
    const matchesSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.cnpj && s.cnpj.includes(search)) ||
      (s.contact_name && s.contact_name.toLowerCase().includes(search.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(search.toLowerCase())) ||
      s.id.toLowerCase().includes(search.toLowerCase());

    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'active' ? s.active !== false : s.active === false);

    return matchesSearch && matchesStatus;
  });

  const handleOpenModal = (sup?: Supplier) => {
    if (sup) {
      setEditingSupplier(sup);
      setName(sup.name);
      setCnpj(sup.cnpj || '');
      setContactName(sup.contact_name || '');
      setPhone(sup.phone || '');
      setWhatsapp(sup.whatsapp || '');
      setEmail(sup.email || '');
    } else {
      setEditingSupplier(null);
      setName('');
      setCnpj('');
      setContactName('');
      setPhone('');
      setWhatsapp('');
      setEmail('');
    }
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingSupplier) {
      const updatedSup: Supplier = {
        ...editingSupplier,
        name,
        cnpj,
        contact_name: contactName,
        phone,
        whatsapp,
        email,
        updated_at: new Date().toISOString(),
      };
      dataStore.saveSupplier(updatedSup);
      setSuppliers(dataStore.getSuppliers(currentCompany?.id));
    } else {
      const newSup: Supplier = {
        id: `sup-${Date.now()}`,
        company_id: currentCompany?.id || 'comp-1',
        name,
        cnpj,
        contact_name: contactName,
        phone,
        whatsapp,
        email,
        active: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      dataStore.saveSupplier(newSup);
      setSuppliers(dataStore.getSuppliers(currentCompany?.id));
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Cadastros' }, { label: 'Fornecedores' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Fornecedores Parceiros</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie contatos, razões sociais e canais de fornecimento sincronizados no backend.
          </p>
        </div>
        <Button onClick={() => handleOpenModal()}>
          <Plus className="mr-2 h-4 w-4" /> Novo Fornecedor
        </Button>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome, contato ou CNPJ..."
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
                  { id: 'all', label: 'Todos os Status', badge: suppliers.length },
                  { id: 'active', label: 'Ativos', badge: suppliers.filter(s => s.active !== false).length },
                  { id: 'inactive', label: 'Inativos', badge: suppliers.filter(s => s.active === false).length },
                ],
              },
            ]}
          />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map(sup => (
          <Card key={sup.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
              <div className="flex items-center space-x-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  <Truck className="h-5 w-5" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">{sup.name}</CardTitle>
                  {sup.cnpj && <p className="text-xs text-muted-foreground font-mono">CNPJ: {sup.cnpj}</p>}
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => handleOpenModal(sup)}>
                <Edit className="h-4 w-4 text-muted-foreground" />
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 text-xs">
              {sup.contact_name && (
                <p className="text-foreground font-medium">Contato: {sup.contact_name}</p>
              )}
              {sup.whatsapp && (
                <p className="flex items-center text-muted-foreground">
                  <MessageSquare className="mr-1.5 h-3.5 w-3.5 text-success" /> WhatsApp: {sup.whatsapp}
                </p>
              )}
              {sup.email && (
                <p className="flex items-center text-muted-foreground">
                  <Mail className="mr-1.5 h-3.5 w-3.5" /> Email: {sup.email}
                </p>
              )}
              <div className="pt-2">
                <Badge variant="success">Ativo</Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">
              {editingSupplier ? 'Editar Fornecedor' : 'Novo Fornecedor'}
            </h3>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome do Fornecedor / Razão Social *
                </label>
                <Input value={name} onChange={(e) => setName(e.target.value)} required placeholder="Ex: Distribuidora SP" />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  CNPJ
                </label>
                <Input value={cnpj} onChange={(e) => setCnpj(e.target.value)} placeholder="00.000.000/0001-00" />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Nome do Contato
                  </label>
                  <Input value={contactName} onChange={(e) => setContactName(e.target.value)} placeholder="Ex: Carlos" />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    WhatsApp
                  </label>
                  <Input value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} placeholder="(11) 99999-8888" />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  E-mail Comercial
                </label>
                <Input value={email} onChange={(e) => setEmail(e.target.value)} type="email" placeholder="pedidos@fornecedor.com" />
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Fornecedor</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
