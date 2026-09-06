import React, { useState } from 'react';
import {
  Building2,
  Plus,
  Search,
  Edit2,
  Trash2,
  Coffee,
  CheckCircle2,
  XCircle,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  ArrowRight
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { Company } from '../../../types';

export const GlobalAdminCompaniesPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { allCompanies, createCompany, updateCompany, deleteCompany, toggleBreakfastBasket, switchCompany } = useCompany();

  const [search, setSearch] = useState('');
  const [filterBasket, setFilterBasket] = useState<'all' | 'enabled' | 'disabled'>('all');

  // Modais de Criação / Edição
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<Company | null>(null);

  // Form State
  const [name, setName] = useState('');
  const [legalName, setLegalName] = useState('');
  const [cnpj, setCnpj] = useState('');
  const [slug, setSlug] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [email, setEmail] = useState('');
  const [description, setDescription] = useState('');
  const [breakfastBasketEnabled, setBreakfastBasketEnabled] = useState(false);
  const [active, setActive] = useState(true);

  // Confirmação de Exclusão
  const [deletingCompany, setDeletingCompany] = useState<Company | null>(null);

  const filteredCompanies = allCompanies.filter(c => {
    const matchesSearch =
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.slug.toLowerCase().includes(search.toLowerCase()) ||
      (c.cnpj && c.cnpj.includes(search));

    if (filterBasket === 'enabled') return matchesSearch && c.breakfast_basket_enabled;
    if (filterBasket === 'disabled') return matchesSearch && !c.breakfast_basket_enabled;
    return matchesSearch;
  });

  const handleOpenCreateModal = () => {
    setEditingCompany(null);
    setName('');
    setLegalName('');
    setCnpj('');
    setSlug('');
    setWhatsapp('');
    setEmail('');
    setDescription('');
    setBreakfastBasketEnabled(false);
    setActive(true);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (comp: Company) => {
    setEditingCompany(comp);
    setName(comp.name);
    setLegalName(comp.legal_name || '');
    setCnpj(comp.cnpj || '');
    setSlug(comp.slug);
    setWhatsapp(comp.whatsapp || '');
    setEmail(comp.email || '');
    setDescription(comp.description || '');
    setBreakfastBasketEnabled(!!comp.breakfast_basket_enabled);
    setActive(comp.active);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCompany) {
      await updateCompany(editingCompany.id, {
        name,
        legal_name: legalName,
        cnpj,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        whatsapp,
        email,
        description,
        breakfast_basket_enabled: breakfastBasketEnabled,
        active,
      });
    } else {
      await createCompany({
        name,
        legal_name: legalName,
        cnpj,
        slug: slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        whatsapp,
        email,
        description,
        breakfast_basket_enabled: breakfastBasketEnabled,
        active,
      });
    }

    setIsModalOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deletingCompany) {
      await deleteCompany(deletingCompany.id);
      setDeletingCompany(null);
    }
  };

  const handleSwitchAndGo = (companyId: string) => {
    switchCompany(companyId);
    if (onNavigate) {
      onNavigate('/admin/dashboard');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração Global' }, { label: 'Gerenciamento de Empresas' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground flex items-center">
            <Building2 className="mr-2 h-6 w-6 text-primary" /> Gerenciamento de Tenants (Empresas)
          </h1>
          <p className="text-sm text-muted-foreground">
            Painel exclusivo do Administrador Global para criar, editar, configurar recursos especiais e auditar empresas.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          {onNavigate && (
            <Button variant="outline" size="sm" onClick={() => onNavigate('/admin/global')}>
              <ShieldCheck className="mr-1.5 h-4 w-4" /> Visão Geral SaaS
            </Button>
          )}
          <Button size="sm" onClick={handleOpenCreateModal}>
            <Plus className="mr-1.5 h-4 w-4" /> Nova Empresa
          </Button>
        </div>
      </div>

      {/* Filtros e Busca */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Buscar por nome, slug ou CNPJ..."
                className="pl-9 text-xs"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <span className="text-xs font-semibold text-muted-foreground">Cesta de Café:</span>
              <select
                value={filterBasket}
                onChange={(e) => setFilterBasket(e.target.value as any)}
                className="flex h-9 rounded-md border border-input bg-background px-3 py-1 text-xs"
              >
                <option value="all">Todas as empresas</option>
                <option value="enabled">Com Cesta Habilitada</option>
                <option value="disabled">Sem Cesta</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Empresas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center justify-between">
            <span>Empresas Registradas ({filteredCompanies.length})</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-lg border overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-muted/50 font-semibold uppercase text-muted-foreground border-b">
                <tr>
                  <th className="p-3">Empresa</th>
                  <th className="p-3">CNPJ / Slug</th>
                  <th className="p-3">WhatsApp / Contato</th>
                  <th className="p-3 text-center">Recurso Especial</th>
                  <th className="p-3 text-center">Status</th>
                  <th className="p-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y font-mono">
                {filteredCompanies.map(comp => (
                  <tr key={comp.id} className="hover:bg-muted/30 transition-colors">
                    <td className="p-3 font-sans font-bold text-foreground">
                      <div className="flex items-center space-x-2">
                        <div className="flex h-7 w-7 items-center justify-center rounded-md bg-primary/10 text-primary font-black text-xs">
                          {comp.name.substring(0, 1).toUpperCase()}
                        </div>
                        <div>
                          <span>{comp.name}</span>
                          {comp.legal_name && (
                            <span className="block text-[10px] text-muted-foreground font-normal">{comp.legal_name}</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="p-3">
                      <div>{comp.cnpj || 'Sem CNPJ'}</div>
                      <span className="text-[10px] text-muted-foreground">/{comp.slug}</span>
                    </td>
                    <td className="p-3 font-sans">
                      <div>{comp.whatsapp || comp.phone || 'Sem contato'}</div>
                      <span className="text-[10px] text-muted-foreground">{comp.email}</span>
                    </td>
                    <td className="p-3 text-center font-sans">
                      <button
                        onClick={() => toggleBreakfastBasket(comp.id, !comp.breakfast_basket_enabled)}
                        className={`inline-flex items-center space-x-1 px-2 py-1 rounded-full text-[11px] font-bold border transition-all ${
                          comp.breakfast_basket_enabled
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20'
                            : 'bg-muted border-muted-foreground/30 text-muted-foreground hover:bg-accent'
                        }`}
                        title="Clique para alternar a ativação do recurso especial"
                      >
                        <Coffee className="h-3 w-3" />
                        <span>{comp.breakfast_basket_enabled ? 'Cesta Ativa' : 'Desativada'}</span>
                      </button>
                    </td>
                    <td className="p-3 text-center font-sans">
                      {comp.active ? (
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 border-emerald-500/30 text-[10px]">
                          Ativa
                        </Badge>
                      ) : (
                        <Badge variant="destructive" className="text-[10px]">
                          Inativa
                        </Badge>
                      )}
                    </td>
                    <td className="p-3 text-right font-sans">
                      <div className="flex items-center justify-end space-x-1.5">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSwitchAndGo(comp.id)}
                          title="Alternar contexto para esta empresa"
                          className="h-8 text-xs font-semibold text-primary"
                        >
                          <span>Acessar</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOpenEditModal(comp)}
                          className="h-8 w-8 p-0"
                          title="Editar empresa"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => setDeletingCompany(comp)}
                          className="h-8 w-8 p-0"
                          title="Excluir empresa"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Criação / Edição de Empresa */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-xl rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-bold">
              {editingCompany ? 'Editar Empresa' : 'Cadastrar Nova Empresa (Tenant)'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Nome Fantasia *
                  </label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: Cestas de Café da Manhã"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Razão Social
                  </label>
                  <Input
                    value={legalName}
                    onChange={(e) => setLegalName(e.target.value)}
                    placeholder="Ex: Cestas & Cia Ltda"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    CNPJ
                  </label>
                  <Input
                    value={cnpj}
                    onChange={(e) => setCnpj(e.target.value)}
                    placeholder="00.000.000/0001-00"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Slug da Loja (URL Pública)
                  </label>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cestas-cafe-da-manha"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    WhatsApp para Pedidos (com DDI + DDD) *
                  </label>
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="5511963820374"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    E-mail de Contato
                  </label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com.br"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Status da Empresa
                  </label>
                  <select
                    value={active ? 'true' : 'false'}
                    onChange={(e) => setActive(e.target.value === 'true')}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="true">Ativa (Permite acessos e vendas)</option>
                    <option value="false">Inativa (Bloqueada)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Descrição / Slogan
                  </label>
                  <Input
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Monte a sua cesta e envie o pedido pelo WhatsApp"
                  />
                </div>
              </div>

              {/* Toggle Especial de Cesta de Café da Manhã */}
              <div className="rounded-lg border-2 border-amber-500/30 bg-amber-500/5 p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Coffee className="h-5 w-5 text-amber-500" />
                    <span className="font-bold text-sm text-foreground">
                      Habilitar Recurso Especial: "Cesta de Café da Manhã"
                    </span>
                  </div>
                  <input
                    type="checkbox"
                    checked={breakfastBasketEnabled}
                    onChange={(e) => setBreakfastBasketEnabled(e.target.checked)}
                    className="h-5 w-5 rounded border-input text-amber-600 focus:ring-amber-500"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Quando ativado pelo Admin Global, a empresa recebe o menu "Cesta de Café da Manhã", ferramentas de exportação de JSON de cesta e a experiência interativa de montagem no catálogo público.
                </p>
              </div>

              <div className="flex justify-end space-x-3 pt-2 border-t">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">
                  {editingCompany ? 'Salvar Alterações' : 'Cadastrar Empresa'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal de Exclusão de Empresa */}
      {deletingCompany && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-2xl space-y-4">
            <div className="flex items-center space-x-2 text-destructive">
              <AlertTriangle className="h-6 w-6" />
              <h3 className="text-lg font-bold">Excluir Empresa</h3>
            </div>
            <p className="text-xs text-muted-foreground">
              Tem certeza que deseja excluir a empresa <strong>{deletingCompany.name}</strong>?
              Esta ação removerá o tenant e seus acessos do sistema.
            </p>
            <div className="flex justify-end space-x-3 pt-2 border-t">
              <Button variant="outline" onClick={() => setDeletingCompany(null)}>
                Cancelar
              </Button>
              <Button variant="destructive" onClick={handleDeleteConfirm}>
                Confirmar Exclusão
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
