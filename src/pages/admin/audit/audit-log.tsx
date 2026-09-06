import React, { useState } from 'react';
import { History, Search, Shield, User, Clock, Terminal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate } from '../../../lib/utils';
import { mockAuditLogs } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { AuditLog } from '../../../types';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const AuditLogPage: React.FC = () => {
  const { currentCompany } = useCompany();
  const [logs, setLogs] = useState<AuditLog[]>(() =>
    mockAuditLogs.filter(l => l.company_id === currentCompany?.id)
  );

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [resourceFilter, setResourceFilter] = useState(initialParams.get('resource') || 'all');
  const [actionFilter, setActionFilter] = useState(initialParams.get('action') || 'all');

  const updateUrlParams = (newSearch: string, newResource: string, newAction: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newResource !== 'all') params.set('resource', newResource); else params.delete('resource');
    if (newAction !== 'all') params.set('action', newAction); else params.delete('action');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, resourceFilter, actionFilter);
  };

  const handleResourceChange = (val: string) => {
    setResourceFilter(val);
    updateUrlParams(search, val, actionFilter);
  };

  const handleActionChange = (val: string) => {
    setActionFilter(val);
    updateUrlParams(search, resourceFilter, val);
  };

  const resources = Array.from(new Set(logs.map(l => l.resource)));

  const filteredLogs = logs.filter(log => {
    const matchesSearch =
      log.user_name.toLowerCase().includes(search.toLowerCase()) ||
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      log.resource.toLowerCase().includes(search.toLowerCase()) ||
      (log.details && log.details.toLowerCase().includes(search.toLowerCase()));

    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
    const matchesAction = actionFilter === 'all' || log.action.toLowerCase().includes(actionFilter.toLowerCase());

    return matchesSearch && matchesResource && matchesAction;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Trilha de Auditoria' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Trilha de Auditoria & Logs</h1>
          <p className="text-sm text-muted-foreground">
            Rastreamento de operações críticas realizadas por integrantes da equipe em {currentCompany?.name}.
          </p>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Filtrar por ação, usuário ou recurso..."
              className="pl-9"
            />
          </div>

          <DropdownFilterMenu
            groups={[
              {
                id: 'resource',
                title: 'Recurso / Entidade',
                selectedValue: resourceFilter,
                onChange: handleResourceChange,
                options: [
                  { id: 'all', label: 'Todos os Recursos', badge: logs.length },
                  ...resources.map(r => ({
                    id: r,
                    label: r,
                    badge: logs.filter(l => l.resource === r).length,
                  })),
                ],
              },
              {
                id: 'action',
                title: 'Tipo de Ação',
                selectedValue: actionFilter,
                onChange: handleActionChange,
                options: [
                  { id: 'all', label: 'Todas as Ações' },
                  { id: 'create', label: 'Criação / Cadastro' },
                  { id: 'update', label: 'Edição / Atualização' },
                  { id: 'delete', label: 'Exclusão' },
                  { id: 'login', label: 'Autenticação / Login' },
                ],
              },
            ]}
          />
        </div>
      </Card>

      <Card>
        <CardHeader className="border-b">
          <CardTitle className="text-base flex items-center">
            <History className="mr-2 h-4 w-4 text-primary" /> Histórico de Ações Auditadas
          </CardTitle>
        </CardHeader>
        <CardContent className="divide-y p-0">
          {filteredLogs.map(log => (
            <div key={log.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-muted/30 transition-colors gap-3">
              <div className="flex items-start space-x-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary font-bold">
                  <Terminal className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-sm text-foreground">{log.action}</span>
                    <Badge variant="outline" className="text-[10px] font-mono">{log.resource}</Badge>
                  </div>
                  {log.details && (
                    <p className="text-xs text-muted-foreground font-mono">{log.details}</p>
                  )}
                  <div className="flex items-center space-x-3 text-[11px] text-muted-foreground pt-1">
                    <span className="flex items-center font-medium text-foreground">
                      <User className="mr-1 h-3 w-3 text-muted-foreground" /> {log.user_name}
                    </span>
                    {log.ip_address && <span>IP: {log.ip_address}</span>}
                  </div>
                </div>
              </div>

              <div className="text-xs font-mono text-muted-foreground sm:text-right shrink-0">
                {formatDate(log.created_at)}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
