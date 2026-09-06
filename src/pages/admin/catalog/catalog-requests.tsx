import React, { useState } from 'react';
import { ShoppingBag, Search, Phone, MessageSquare, Mail, Clock, CheckCircle2, XCircle, ArrowRight } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { EmptyState } from '../../../components/ui/empty-state';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatCurrency, formatDate } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { CatalogRequest, RequestStatus } from '../../../types';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const CatalogRequestsPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [requests, setRequests] = useState<CatalogRequest[]>(() =>
    dataStore.getRequests(currentCompany?.id)
  );

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState<string>(initialParams.get('status') || 'all');

  const updateUrlParams = (newSearch: string, newStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchFilterChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, statusFilter);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val);
    updateUrlParams(search, val);
  };

  // Reatividade ao dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setRequests(dataStore.getRequests(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const filteredRequests = requests.filter(req => {
    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;
    const matchesSearch =
      req.customer_name.toLowerCase().includes(search.toLowerCase()) ||
      req.customer_phone.includes(search) ||
      req.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  const handleStatusChange = (requestId: string, newStatus: RequestStatus) => {
    const req = requests.find(r => r.id === requestId);
    if (req) {
      dataStore.saveRequest({ ...req, status: newStatus, updated_at: new Date().toISOString() });
    }
  };

  const getStatusBadge = (status: RequestStatus) => {
    switch (status) {
      case 'new':
        return <Badge variant="destructive" className="animate-pulse">Nova Solicitação</Badge>;
      case 'in_progress':
        return <Badge variant="warning">Em Atendimento</Badge>;
      case 'completed':
        return <Badge variant="success">Concluído</Badge>;
      case 'cancelled':
        return <Badge variant="secondary">Cancelado</Badge>;
    }
  };

  const getWhatsappLink = (phone: string, customerName: string) => {
    const num = phone.replace(/\D/g, '');
    const msg = `Olá ${customerName}! Recebemos sua solicitação no catálogo digital do ${currentCompany?.name}. Vamos conversar?`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Recursos' }, { label: 'Catálogo' }, { label: 'Solicitações' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Solicitações de Clientes</h1>
          <p className="text-sm text-muted-foreground">
            Acompanhe e responda os pedidos de orçamentos e contato enviados pela vitrine digital.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchFilterChange(e.target.value)}
              placeholder="Buscar por cliente, telefone ou ID..."
              className="pl-9"
            />
          </div>

          <div className="flex items-center space-x-2">
            <DropdownFilterMenu
              groups={[
                {
                  id: 'status',
                  title: 'Status do Atendimento',
                  selectedValue: statusFilter,
                  onChange: handleStatusFilterChange,
                  options: [
                    { id: 'all', label: 'Todas as Solicitações', badge: requests.length },
                    { id: 'new', label: 'Novas Solicitações', badge: requests.filter(r => r.status === 'new').length },
                    { id: 'in_progress', label: 'Em Atendimento', badge: requests.filter(r => r.status === 'in_progress').length },
                    { id: 'completed', label: 'Concluídos', badge: requests.filter(r => r.status === 'completed').length },
                    { id: 'cancelled', label: 'Cancelados', badge: requests.filter(r => r.status === 'cancelled').length },
                  ],
                },
              ]}
              onResetAll={() => {
                setStatusFilter('all');
                setSearch('');
                updateUrlParams('', 'all');
              }}
            />
          </div>
        </div>
      </Card>

      {filteredRequests.length === 0 ? (
        <EmptyState
          icon={ShoppingBag}
          title="Nenhuma solicitação encontrada"
          description="Quando clientes enviarem pedidos pelo catálogo digital público, eles aparecerão aqui."
        />
      ) : (
        <div className="space-y-4">
          {filteredRequests.map(req => {
            const totalEstimated = req.items.reduce(
              (acc, item) => acc + (item.unit_price || 0) * item.quantity,
              0
            );

            return (
              <Card key={req.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0 pb-3 border-b">
                  <div className="flex items-center space-x-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                      <ShoppingBag className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-semibold">{req.customer_name}</CardTitle>
                      <p className="text-xs text-muted-foreground font-mono">
                        {req.customer_phone} {req.customer_email && `• ${req.customer_email}`}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusBadge(req.status)}
                    <a
                      href={getWhatsappLink(req.customer_phone, req.customer_name)}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="outline" size="sm" className="text-xs text-success border-success/30 hover:bg-success/10">
                        <MessageSquare className="mr-1.5 h-3.5 w-3.5" /> Abrir no WhatsApp
                      </Button>
                    </a>
                  </div>
                </CardHeader>

                <CardContent className="pt-4 space-y-4">
                  {req.notes && (
                    <div className="rounded-md bg-muted p-3 text-xs text-muted-foreground">
                      <span className="font-semibold text-foreground">Observações do Cliente:</span> "{req.notes}"
                    </div>
                  )}

                  {/* Tabela de Itens Solicitados */}
                  <div className="rounded-md border overflow-hidden">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                        <tr>
                          <th className="p-3">Item Solicitado</th>
                          <th className="p-3 text-center">Quantidade</th>
                          <th className="p-3 text-right">Preço Unitário</th>
                          <th className="p-3 text-right">Subtotal Estimado</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y font-mono">
                        {req.items.map((item, idx) => (
                          <tr key={idx}>
                            <td className="p-3 font-sans font-medium text-foreground">{item.product_name}</td>
                            <td className="p-3 text-center font-bold">{item.quantity}</td>
                            <td className="p-3 text-right">{item.unit_price ? formatCurrency(item.unit_price) : '-'}</td>
                            <td className="p-3 text-right font-bold">
                              {item.unit_price ? formatCurrency(item.unit_price * item.quantity) : '-'}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Footer com Status Alterar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pt-2 gap-2 text-xs">
                    <span className="text-muted-foreground">
                      Recebido em: <strong className="text-foreground">{formatDate(req.created_at)}</strong>
                    </span>

                    <div className="flex items-center space-x-2">
                      <span className="text-muted-foreground">Alterar Status:</span>
                      <Button
                        variant={req.status === 'in_progress' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'in_progress')}
                        className="text-xs h-7"
                      >
                        Em Atendimento
                      </Button>
                      <Button
                        variant={req.status === 'completed' ? 'success' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'completed')}
                        className="text-xs h-7"
                      >
                        Concluído
                      </Button>
                      <Button
                        variant={req.status === 'cancelled' ? 'secondary' : 'outline'}
                        size="sm"
                        onClick={() => handleStatusChange(req.id, 'cancelled')}
                        className="text-xs h-7"
                      >
                        Cancelar
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
