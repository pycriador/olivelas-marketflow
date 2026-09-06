import React from 'react';
import { ShieldCheck, Check, X, ArrowLeft, Lock } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { PermissionMatrixItem, AppRole } from '../../../types';

export const UserPermissionsMatrixPage: React.FC<{ onBack: () => void }> = ({ onBack }) => {
  const permissions: PermissionMatrixItem[] = [
    // Módulo Produtos
    { module: 'Produtos', resource: 'Produtos', action: 'Visualizar catálogo e preços', allowed_roles: ['global_admin', 'admin', 'stock', 'visitor'] },
    { module: 'Produtos', resource: 'Produtos', action: 'Cadastrar / Editar produtos', allowed_roles: ['global_admin', 'admin', 'stock'] },
    { module: 'Produtos', resource: 'Produtos', action: 'Inativar / Excluir produto', allowed_roles: ['global_admin', 'admin'] },
    { module: 'Produtos', resource: 'Histórico de Preços', action: 'Visualizar histórico comercial', allowed_roles: ['global_admin', 'admin'] },
    // Módulo Estoque
    { module: 'Estoque', resource: 'Saldos', action: 'Consultar quantidades em estoque', allowed_roles: ['global_admin', 'admin', 'stock', 'visitor'] },
    { module: 'Estoque', resource: 'Movimentações', action: 'Registrar Entrada / Saída / Ajuste', allowed_roles: ['global_admin', 'admin', 'stock'] },
    { module: 'Estoque', resource: 'Lotes & Validade', action: 'Cadastrar e editar lotes', allowed_roles: ['global_admin', 'admin', 'stock'] },
    // Módulo Catálogo Público
    { module: 'Catálogo', resource: 'Configuração', action: 'Editar slug, banner e WhatsApp', allowed_roles: ['global_admin', 'admin'] },
    { module: 'Catálogo', resource: 'Solicitações', action: 'Atender pedidos de clientes', allowed_roles: ['global_admin', 'admin', 'stock'] },
    // Módulo Administração
    { module: 'Administração', resource: 'Usuários', action: 'Convidar integrantes e alterar papéis', allowed_roles: ['global_admin', 'admin'] },
    { module: 'Administração', resource: 'Empresa', action: 'Editar CNPJ, Nome e Logo', allowed_roles: ['global_admin', 'admin'] },
    { module: 'Administração', resource: 'Auditoria', action: 'Visualizar logs de segurança', allowed_roles: ['global_admin', 'admin'] },
    { module: 'Administração Global', resource: 'Plataforma SaaS', action: 'Gerenciar tenants e SaaS', allowed_roles: ['global_admin'] },
  ];

  const rolesList: { code: AppRole; name: string }[] = [
    { code: 'global_admin', name: 'Global Admin' },
    { code: 'admin', name: 'Admin Empresa' },
    { code: 'stock', name: 'Estoque' },
    { code: 'visitor', name: 'Leitura' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Usuários', href: '#' }, { label: 'Matriz de Permissões' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Matriz de Permissões de Acesso (RBAC)</h1>
          <p className="text-sm text-muted-foreground">
            Mapeamento server-side de recursos, ações e papéis autorizados na plataforma.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Lock className="mr-2 h-4 w-4 text-primary" /> Mapeamento Granular de Acessos
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="rounded-lg overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Módulo</th>
                  <th className="p-3">Recurso / Ação</th>
                  {rolesList.map(r => (
                    <th key={r.code} className="p-3 text-center">{r.name}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {permissions.map((perm, idx) => (
                  <tr key={idx} className="hover:bg-muted/30">
                    <td className="p-3 font-semibold text-muted-foreground">{perm.module}</td>
                    <td className="p-3">
                      <span className="font-bold text-foreground block">{perm.resource}</span>
                      <span className="text-muted-foreground">{perm.action}</span>
                    </td>
                    {rolesList.map(roleObj => {
                      const isAllowed = perm.allowed_roles.includes(roleObj.code);
                      return (
                        <td key={roleObj.code} className="p-3 text-center">
                          {isAllowed ? (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-success/10 text-success mx-auto">
                              <Check className="h-3.5 w-3.5" />
                            </span>
                          ) : (
                            <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-muted text-muted-foreground/40 mx-auto">
                              <X className="h-3.5 w-3.5" />
                            </span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
