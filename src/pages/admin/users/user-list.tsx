import React, { useState } from 'react';
import { Users, UserPlus, Shield, Package, Eye, Mail, Trash2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { AppRole, CompanyUser } from '../../../types';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';
import { Search } from 'lucide-react';

export const UserListPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany, currentRole } = useCompany();

  const [members, setMembers] = useState<CompanyUser[]>([
    {
      id: 'cu-1',
      company_id: currentCompany?.id || 'comp-1',
      user_id: 'user-default',
      role: 'admin',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: 'user-default',
        full_name: 'Willian Oliveira (Você)',
        phone: '(11) 99999-8888',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
    {
      id: 'cu-2',
      company_id: currentCompany?.id || 'comp-1',
      user_id: 'user-maria',
      role: 'stock',
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: 'user-maria',
        full_name: 'Maria Estoquista',
        phone: '(11) 97777-6666',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    },
  ]);

  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<AppRole>('stock');

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [roleFilter, setRoleFilter] = useState(initialParams.get('role') || 'all');

  const updateUrlParams = (newSearch: string, newRole: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newSearch) params.set('search', newSearch); else params.delete('search');
    if (newRole !== 'all') params.set('role', newRole); else params.delete('role');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, roleFilter);
  };

  const handleRoleChange = (val: string) => {
    setRoleFilter(val);
    updateUrlParams(search, val);
  };

  const filteredMembers = members.filter(m => {
    const matchesSearch =
      (m.profile?.full_name && m.profile.full_name.toLowerCase().includes(search.toLowerCase())) ||
      (m.profile?.phone && m.profile.phone.includes(search)) ||
      m.role.toLowerCase().includes(search.toLowerCase());

    const matchesRole =
      roleFilter === 'all' ||
      m.role === roleFilter;

    return matchesSearch && matchesRole;
  });

  const handleInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail.trim()) return;

    const newMember: CompanyUser = {
      id: `cu-${Date.now()}`,
      company_id: currentCompany?.id || 'comp-1',
      user_id: `user-${Date.now()}`,
      role: inviteRole,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      profile: {
        id: `user-${Date.now()}`,
        full_name: inviteEmail.split('@')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    };

    setMembers(prev => [...prev, newMember]);
    setInviteEmail('');
    setIsInviteModalOpen(false);
  };

  const getRoleBadge = (role: AppRole) => {
    switch (role) {
      case 'admin':
      case 'global_admin':
        return <Badge variant="default" className="bg-primary"><Shield className="w-3 h-3 mr-1" /> Administrador</Badge>;
      case 'stock':
        return <Badge variant="warning"><Package className="w-3 h-3 mr-1" /> Estoque</Badge>;
      default:
        return <Badge variant="secondary"><Eye className="w-3 h-3 mr-1" /> Leitura / Visitante</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Usuários & Permissões' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Equipe da Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie os usuários com acesso ao painel de {currentCompany?.name} e seus perfis (RBAC).
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {onNavigate && (
            <>
              <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/users/invitations')}>
                <Mail className="mr-1.5 h-4 w-4 text-primary" /> Convites
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/users/sessions')}>
                <Shield className="mr-1.5 h-4 w-4 text-primary" /> Sessões Ativas
              </Button>
              <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/users/permissions')}>
                <Users className="mr-1.5 h-4 w-4 text-primary" /> Matriz RBAC
              </Button>
            </>
          )}
          <Button size="sm" onClick={() => setIsInviteModalOpen(true)}>
            <UserPlus className="mr-1.5 h-4 w-4" /> Convidar Usuário
          </Button>
        </div>
      </div>

      <Card className="p-4">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Buscar usuário por nome ou cargo..."
              className="pl-9"
            />
          </div>

          <DropdownFilterMenu
            groups={[
              {
                id: 'role',
                title: 'Cargo / Papel',
                selectedValue: roleFilter,
                onChange: handleRoleChange,
                options: [
                  { id: 'all', label: 'Todos os Cargos', badge: members.length },
                  { id: 'admin', label: 'Administradores', badge: members.filter(m => m.role === 'admin' || m.role === 'global_admin').length },
                  { id: 'stock', label: 'Estoquistas', badge: members.filter(m => m.role === 'stock').length },
                  { id: 'visitor', label: 'Leitura / Visitante', badge: members.filter(m => m.role === 'visitor').length },
                ],
              },
            ]}
          />
        </div>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <div className="flex items-center">
              <Users className="mr-2 h-4 w-4 text-primary" /> Integrantes da Equipe
            </div>
            <span className="text-xs font-normal text-muted-foreground">
              {filteredMembers.length} de {members.length} usuário(s)
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y">
            {filteredMembers.map(m => (
              <div key={m.id} className="flex items-center justify-between py-4">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted font-bold text-sm uppercase">
                    {m.profile?.full_name?.substring(0, 2) || 'US'}
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{m.profile?.full_name}</p>
                    <p className="text-xs text-muted-foreground">{m.profile?.phone || 'Sem telefone registrado'}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {getRoleBadge(m.role)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {isInviteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-md rounded-lg border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Convidar Novo Usuário</h3>

            <form onSubmit={handleInvite} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  E-mail do Usuário *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    required
                    placeholder="usuario@empresa.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Papel de Acesso (RBAC) *
                </label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value as AppRole)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="stock">Estoque (Cadastra e movimenta estoque)</option>
                  <option value="admin">Administrador (Acesso total)</option>
                  <option value="visitor">Leitura (Somente consulta)</option>
                </select>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsInviteModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Enviar Convite</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
