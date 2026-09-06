import React from 'react';
import { ShieldCheck, Store, Users, Sparkles, Server, CheckCircle2, TrendingUp } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { mockUserCompanies } from '../../../lib/supabase';
import { useAuth } from '../../../context/auth-context';
import { dataStore } from '../../../lib/data-store';

export const GlobalAdminDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const companies = dataStore.getCompanies();
  const products = dataStore.getProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração Global' }, { label: 'Visão Geral da Plataforma' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-primary flex items-center">
            <ShieldCheck className="mr-2 h-6 w-6" /> Painel de Controle SaaS (Global Admin)
          </h1>
          <p className="text-sm text-muted-foreground">
            Métricas globais de utilização da plataforma MarketFlow, empresas (tenants) e consumo de IA.
          </p>
        </div>
        <Badge variant="default" className="bg-primary px-3 py-1 text-xs">
          Administrador da Plataforma
        </Badge>
      </div>

      {/* KPI Cards Globais */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Total de Empresas (Tenants)
            </CardTitle>
            <Store className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{companies.length}</div>
            <p className="text-xs text-muted-foreground mt-1">100% ativas no plano Free</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Usuários Cadastrados
            </CardTitle>
            <Users className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">{mockUserCompanies.length + 1}</div>
            <p className="text-xs text-muted-foreground mt-1">Sessões ativas no sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Requisições de IA
            </CardTitle>
            <Sparkles className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold font-mono">148</div>
            <p className="text-xs text-muted-foreground mt-1">Reconhecimentos de imagem este mês</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-xs font-semibold uppercase text-muted-foreground">
              Status da Plataforma
            </CardTitle>
            <Server className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-1 text-success font-bold text-lg">
              <CheckCircle2 className="h-5 w-5" /> <span>Operacional</span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">Latência média: 45ms</p>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Tenants da Plataforma */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Empresas Cadastradas no SaaS</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">CNPJ / Slug</th>
                  <th className="p-3 text-center">Plano Ativo</th>
                  <th className="p-3 text-center">Produtos</th>
                  <th className="p-3 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {companies.map(comp => {
                  const compProds = products.filter(p => p.company_id === comp.id);
                  return (
                    <tr key={comp.id} className="hover:bg-muted/30">
                      <td className="p-3 font-sans font-bold text-foreground">{comp.name}</td>
                      <td className="p-3">{comp.cnpj || comp.slug}</td>
                      <td className="p-3 text-center">
                        <Badge variant="outline">Plano Gratuito</Badge>
                      </td>
                      <td className="p-3 text-center font-bold">{compProds.length} / 100</td>
                      <td className="p-3 text-center">
                        <Badge variant="success">Ativa</Badge>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
