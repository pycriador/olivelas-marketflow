import React, { useState } from 'react';
import { Mail, UserPlus, Clock, Copy, Check, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { formatDate } from '../../../lib/utils';
import { useCompany } from '../../../context/company-context';
import { UserInvitation, AppRole } from '../../../types';
import { useLanguage } from '../../../context/language-context';

export const UserInvitationsPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const { currentCompany } = useCompany();
  const { t } = useLanguage();
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const [invitations, setInvitations] = useState<UserInvitation[]>([
    {
      id: 'inv-1',
      company_id: currentCompany?.id || 'comp-1',
      email: 'gerente.loja@marketflow.com',
      role: 'admin',
      token: 'mf_inv_9876543210',
      status: 'pending',
      invited_by: 'Willian Oliveira (Global Admin)',
      expires_at: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
      created_at: new Date().toISOString(),
    },
    {
      id: 'inv-2',
      company_id: currentCompany?.id || 'comp-1',
      email: 'auxiliar.estoque@marketflow.com',
      role: 'stock',
      token: 'mf_inv_1234567890',
      status: 'pending',
      invited_by: 'Willian Oliveira (Global Admin)',
      expires_at: new Date(Date.now() + 3600000 * 24 * 5).toISOString(),
      created_at: new Date().toISOString(),
    },
  ]);

  const [email, setEmail] = useState('');
  const [role, setRole] = useState<AppRole>('stock');

  const handleCreateInvite = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    const newInvite: UserInvitation = {
      id: `inv-${Date.now()}`,
      company_id: currentCompany?.id || 'comp-1',
      email,
      role,
      token: `mf_inv_${Date.now()}`,
      status: 'pending',
      invited_by: 'Willian Oliveira (Global Admin)',
      expires_at: new Date(Date.now() + 3600000 * 24 * 7).toISOString(),
      created_at: new Date().toISOString(),
    };

    setInvitations(prev => [newInvite, ...prev]);
    setEmail('');
  };

  const handleCopyLink = (inv: UserInvitation) => {
    const inviteUrl = `${window.location.origin}/accept-invite?token=${inv.token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedId(inv.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleRevoke = (id: string) => {
    setInvitations(prev => prev.filter(i => i.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Usuários', href: '#' }, { label: 'Convites Pendentes' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Convites da Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Envie links de acesso seguro para novos colaboradores participarem de {currentCompany?.name}.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> {t.back}
        </Button>
      </div>

      {/* Formulário Novo Convite */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <UserPlus className="mr-2 h-4 w-4 text-primary" /> Enviar Novo Convite de Acesso
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateInvite} className="flex flex-col sm:flex-row items-end gap-3">
            <div className="flex-1 w-full">
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                E-mail do Convidado *
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="colaborador@empresa.com"
                  required
                  className="pl-9"
                />
              </div>
            </div>

            <div className="w-full sm:w-56">
              <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                Papel de Acesso (RBAC) *
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as AppRole)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="stock">Estoque</option>
                <option value="admin">Administrador</option>
                <option value="visitor">Leitura</option>
              </select>
            </div>

            <Button type="submit" className="w-full sm:w-auto">
              Gerar Convite
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Lista de Convites */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" /> Convites Ativos e Pendentes ({invitations.length})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y">
          {invitations.map(inv => (
            <div key={inv.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 gap-3 hover:bg-muted/30">
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-foreground">{inv.email}</span>
                  <Badge variant="warning">Pendente</Badge>
                  <Badge variant="outline" className="uppercase font-mono text-[10px]">{inv.role}</Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Convidado por {inv.invited_by} • Expira em: {formatDate(inv.expires_at)}
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleCopyLink(inv)}
                  className="text-xs"
                >
                  {copiedId === inv.id ? (
                    <>
                      <Check className="mr-1.5 h-3.5 w-3.5 text-success" /> Link Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1.5 h-3.5 w-3.5" /> Copiar Link
                    </>
                  )}
                </Button>

                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleRevoke(inv.id)}
                  className="text-xs text-destructive hover:bg-destructive/10"
                >
                  <XCircle className="mr-1.5 h-3.5 w-3.5" /> Revogar
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};
