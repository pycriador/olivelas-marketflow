import React, { useState, useEffect } from 'react';
import { Key, Plus, Shield, Copy, Check, RefreshCw, Trash2, AlertTriangle, Lock, Eye, Calendar, Terminal } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { ApiKey, ApiScope, ApiEnvironment } from '../../../types';
import { getStoredApiKeys, generateApiKey, revokeApiKey, rotateApiKey } from '../../../api/v1/router';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';
import { Search } from 'lucide-react';

const ALL_SCOPES: { scope: ApiScope; label: string; group: string }[] = [
  { scope: 'products:read', label: 'Consultar Produtos', group: 'Produtos' },
  { scope: 'products:write', label: 'Criar & Editar Produtos', group: 'Produtos' },
  { scope: 'categories:read', label: 'Consultar Categorias', group: 'Categorias' },
  { scope: 'categories:write', label: 'Gerenciar Categorias', group: 'Categorias' },
  { scope: 'inventory:read', label: 'Consultar Saldos de Estoque', group: 'Estoque' },
  { scope: 'inventory:write', label: 'Movimentar Estoque (Entradas/Saídas)', group: 'Estoque' },
  { scope: 'lots:read', label: 'Consultar Lotes & Validades', group: 'Lotes' },
  { scope: 'lots:write', label: 'Gerenciar Lotes', group: 'Lotes' },
  { scope: 'catalog:read', label: 'Consultar Catálogo', group: 'Catálogo' },
  { scope: 'catalog:write', label: 'Publicar/Alterar Catálogo', group: 'Catálogo' },
  { scope: 'requests:read', label: 'Consultar Pedidos de Clientes', group: 'Pedidos' },
  { scope: 'requests:write', label: 'Atualizar Status de Pedidos', group: 'Pedidos' },
  { scope: 'ai:use', label: 'Executar Análises de IA (Visão/OCR)', group: 'Inteligência Artificial' },
  { scope: 'reports:read', label: 'Exportar Relatórios Operacionais', group: 'Relatórios' },
];

export const ApiKeysPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();
  const [keys, setKeys] = useState<ApiKey[]>([]);

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [envFilter, setEnvFilter] = useState(initialParams.get('env') || 'all');
  const [statusFilter, setStatusFilter] = useState(initialParams.get('status') || 'all');

  const updateUrlParams = (newSearch: string, newEnv: string, newStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newEnv !== 'all') params.set('env', newEnv); else params.delete('env');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, envFilter, statusFilter);
  };

  const handleEnvChange = (val: string) => {
    setEnvFilter(val);
    updateUrlParams(search, val, statusFilter);
  };

  const handleStatusChange = (val: string) => {
    setStatusFilter(val);
    updateUrlParams(search, envFilter, val);
  };

  const filteredKeys = keys.filter(k => {
    const matchesSearch =
      k.name.toLowerCase().includes(search.toLowerCase()) ||
      k.key_prefix.toLowerCase().includes(search.toLowerCase()) ||
      (k.description && k.description.toLowerCase().includes(search.toLowerCase()));

    const matchesEnv = envFilter === 'all' || k.environment === envFilter;
    const matchesStatus = statusFilter === 'all' || k.status === statusFilter;

    return matchesSearch && matchesEnv && matchesStatus;
  });

  // Estados dos Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyEnv, setNewKeyEnv] = useState<ApiEnvironment>('live');
  const [selectedScopes, setSelectedScopes] = useState<ApiScope[]>([
    'products:read',
    'inventory:read',
  ]);
  const [expiresInDays, setExpiresInDays] = useState<number>(30);

  // Modal de Exibição Única da Chave Secreta
  const [createdSecretOnce, setCreatedSecretOnce] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    refreshKeys();
  }, [currentCompany]);

  const refreshKeys = () => {
    const list = getStoredApiKeys(currentCompany?.id || 'comp-1');
    setKeys(list);
  };

  const handleToggleScope = (scope: ApiScope) => {
    setSelectedScopes(prev =>
      prev.includes(scope) ? prev.filter(s => s !== scope) : [...prev, scope]
    );
  };

  const handleCreateKeySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;

    const companyId = currentCompany?.id || 'comp-1';
    const { apiKey, plainSecret } = generateApiKey(
      companyId,
      newKeyName,
      newKeyEnv,
      selectedScopes,
      expiresInDays
    );

    refreshKeys();
    setIsCreateModalOpen(false);
    setCreatedSecretOnce(plainSecret);
    setNewKeyName('');
    setCopied(false);
  };

  const handleCopySecret = () => {
    if (!createdSecretOnce) return;
    navigator.clipboard.writeText(createdSecretOnce);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleRevoke = (keyId: string) => {
    if (confirm('Tem certeza que deseja revogar este token de API? Aplicações que utilizam esta chave perderão o acesso imediatamente.')) {
      revokeApiKey(keyId);
      refreshKeys();
    }
  };

  const handleRotate = (keyId: string) => {
    const res = rotateApiKey(keyId);
    if (res) {
      refreshKeys();
      setCreatedSecretOnce(res.newPlainSecret);
      setCopied(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Desenvolvedores' }, { label: 'API Keys & Tokens' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">API Keys & Autenticação</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie chaves secretas de acesso para integração com sistemas ERP, e-commerce e automações.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/developers/api-docs')}>
              <Terminal className="mr-1.5 h-4 w-4 text-primary" /> Documentação API
            </Button>
          )}
          <Button size="sm" onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="mr-1.5 h-4 w-4" /> Criar API Key
          </Button>
        </div>
      </div>

      {/* Barra de Busca e Filtros */}
      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar por nome da chave ou prefixo..."
              className="pl-9"
            />
          </div>

          <DropdownFilterMenu
            groups={[
              {
                id: 'env',
                title: 'Ambiente',
                selectedValue: envFilter,
                onChange: handleEnvChange,
                options: [
                  { id: 'all', label: 'Todos os Ambientes', badge: keys.length },
                  { id: 'live', label: 'Produção (Live)', badge: keys.filter(k => k.environment === 'live').length },
                  { id: 'test', label: 'Testes / Sandbox', badge: keys.filter(k => k.environment === 'test').length },
                ],
              },
              {
                id: 'status',
                title: 'Status',
                selectedValue: statusFilter,
                onChange: handleStatusChange,
                options: [
                  { id: 'all', label: 'Todos os Status', badge: keys.length },
                  { id: 'active', label: 'Ativas', badge: keys.filter(k => k.status === 'active').length },
                  { id: 'revoked', label: 'Revogadas', badge: keys.filter(k => k.status === 'revoked').length },
                ],
              },
            ]}
          />
        </div>
      </Card>

      {/* Lista de Tokens */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Key className="h-4 w-4 text-primary" />
              <span>Chaves de API Ativas da Empresa</span>
            </div>
            <span className="text-xs font-normal text-muted-foreground">
              {filteredKeys.length} de {keys.length} chave(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {filteredKeys.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhuma API Key encontrada para os filtros aplicados.
            </div>
          ) : (
            <div className="divide-y">
              {filteredKeys.map(k => (
                <div key={k.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground text-sm">{k.name}</span>
                        <Badge
                          variant={k.environment === 'live' ? 'default' : 'secondary'}
                          className="text-[10px] uppercase"
                        >
                          {k.environment}
                        </Badge>
                        {k.status === 'active' ? (
                          <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                            Ativa
                          </Badge>
                        ) : (
                          <Badge variant="destructive" className="text-[10px]">
                            Revogada
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{k.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      {k.status === 'active' && (
                        <>
                          <Button variant="outline" size="sm" onClick={() => handleRotate(k.id)} title="Revogar atual e gerar nova">
                            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Rotacionar
                          </Button>
                          <Button variant="destructive" size="sm" onClick={() => handleRevoke(k.id)}>
                            <Trash2 className="h-3.5 w-3.5 mr-1" /> Revogar
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Informações da Chave */}
                  <div className="flex flex-wrap items-center gap-4 text-xs bg-muted/50 p-2.5 rounded-md font-mono">
                    <div className="flex items-center space-x-1.5 text-foreground font-bold">
                      <Lock className="h-3.5 w-3.5 text-muted-foreground" />
                      <span>{k.key_prefix}</span>
                    </div>

                    <div className="text-muted-foreground flex items-center space-x-1">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>Criada em: {new Date(k.created_at).toLocaleDateString()}</span>
                    </div>

                    {k.last_used_at && (
                      <div className="text-muted-foreground">
                        Último uso: {new Date(k.last_used_at).toLocaleString()}
                      </div>
                    )}

                    {k.expires_at && (
                      <div className="text-amber-600 font-semibold">
                        Expira em: {new Date(k.expires_at).toLocaleDateString()}
                      </div>
                    )}
                  </div>

                  {/* Badges de Escopos */}
                  <div className="flex flex-wrap gap-1 pt-1">
                    <span className="text-[11px] font-semibold text-muted-foreground mr-1">Escopos ({k.scopes.length}):</span>
                    {k.scopes.map(s => (
                      <span key={s} className="inline-flex items-center rounded-sm bg-accent px-1.5 py-0.5 text-[10px] font-mono text-accent-foreground">
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Criação de Token */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">Criar Nova API Key</h3>

            <form onSubmit={handleCreateKeySubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Nome Identificador do Token *
                </label>
                <Input
                  value={newKeyName}
                  onChange={(e) => setNewKeyName(e.target.value)}
                  placeholder="Ex: Integração ERP Bling / Script de Estoque"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Ambiente *
                  </label>
                  <select
                    value={newKeyEnv}
                    onChange={(e) => setNewKeyEnv(e.target.value as ApiEnvironment)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="live">Produção (Live - mf_live_)</option>
                    <option value="test">Testes / Staging (Test - mf_test_)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Validade do Token
                  </label>
                  <select
                    value={expiresInDays}
                    onChange={(e) => setExpiresInDays(Number(e.target.value))}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value={30}>30 Dias</option>
                    <option value={90}>90 Dias</option>
                    <option value={365}>1 Ano</option>
                    <option value={0}>Sem Expiração (Infinito)</option>
                  </select>
                </div>
              </div>

              {/* Escopos de Acesso */}
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Permissões & Escopos (RBAC Scopes) *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto border p-3 rounded-md bg-muted/20">
                  {ALL_SCOPES.map(item => {
                    const isChecked = selectedScopes.includes(item.scope);
                    return (
                      <label key={item.scope} className="flex items-center space-x-2 text-xs cursor-pointer hover:bg-accent/50 p-1 rounded">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleScope(item.scope)}
                          className="rounded border-input text-primary focus:ring-ring h-3.5 w-3.5"
                        />
                        <div>
                          <span className="font-medium text-foreground">{item.label}</span>
                          <span className="block font-mono text-[10px] text-muted-foreground">{item.scope}</span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Gerar API Key</Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exibição Única do Segredo */}
      {createdSecretOnce && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in zoom-in-95">
          <div className="w-full max-w-lg rounded-xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-amber-500">
              <AlertTriangle className="h-6 w-6 shrink-0" />
              <h3 className="text-lg font-bold text-foreground">Guarde esta API Key com Segurança!</h3>
            </div>

            <p className="text-xs text-muted-foreground">
              Por razões de segurança, o segredo completo do token é exibido <strong>somente uma vez</strong>. Armazenamos apenas o hash SHA-256 no banco de dados. Se você perder esta chave, precisará rotacioná-la.
            </p>

            <div className="space-y-1">
              <label className="block text-[11px] font-bold uppercase text-muted-foreground">Sua API Key Secreta</label>
              <div className="flex items-center space-x-2">
                <Input
                  readOnly
                  value={createdSecretOnce}
                  className="font-mono text-xs bg-muted text-primary font-bold selection:bg-primary selection:text-white"
                />
                <Button onClick={handleCopySecret} size="sm" className="shrink-0">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                  <span className="ml-1.5">{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t">
              <Button onClick={() => setCreatedSecretOnce(null)}>Entendi, salvei a chave</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
