import React, { useState } from 'react';
import { Store, Globe, ExternalLink, Save, MessageSquare, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';

export const CatalogSettingsPage: React.FC = () => {
  const { currentCompany } = useCompany();

  const [enabled, setEnabled] = useState(true);
  const [slug, setSlug] = useState(currentCompany?.slug || 'mercado-central');
  const [whatsapp, setWhatsapp] = useState(currentCompany?.whatsapp || '(11) 98765-4321');
  const [email, setEmail] = useState(currentCompany?.email || 'contato@mercadocentral.com');
  const [showPrices, setShowPrices] = useState(true);
  const [allowContact, setAllowContact] = useState(true);
  const [isSaved, setIsSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const publicUrl = `${window.location.origin}/loja/${slug}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Recursos' }, { label: 'Catálogo Digital' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Catálogo Digital Público</h1>
          <p className="text-sm text-muted-foreground">
            Configure a vitrine online da sua loja para consulta dos seus clientes.
          </p>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            const prefix = window.location.pathname.startsWith('/olivelas-marketflow') ? '/olivelas-marketflow' : '';
            window.open(`${prefix}/loja/${slug}`, '_blank');
          }}
        >
          <ExternalLink className="mr-2 h-4 w-4" /> Visualizar Vitrine Pública
        </Button>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {isSaved && (
          <div className="rounded-md bg-success/10 border border-success/20 p-4 text-sm text-success font-semibold flex items-center">
            <CheckCircle2 className="h-5 w-5 mr-2" />
            Configurações do Catálogo salvas com sucesso!
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Status e Endereço Público */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Globe className="mr-2 h-4 w-4 text-primary" /> Endereço do Catálogo
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={enabled}
                  onChange={(e) => setEnabled(e.target.checked)}
                  className="h-5 w-5 rounded border-input text-primary focus:ring-primary"
                />
                <div>
                  <span className="text-sm font-semibold text-foreground">Catálogo Público Ativo</span>
                  <p className="text-xs text-muted-foreground">Quando desativado, o público não poderá visualizar seus produtos.</p>
                </div>
              </label>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Identificador Público (Slug da URL) *
                </label>
                <div className="flex rounded-md shadow-sm">
                  <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-xs text-muted-foreground font-mono">
                    marketflow.app/loja/
                  </span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/\s+/g, '-'))}
                    className="rounded-l-none font-mono"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Preferências de Exibição */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Store className="mr-2 h-4 w-4 text-primary" /> Opções de Exibição e Contato
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  WhatsApp para Atendimento
                </label>
                <div className="relative">
                  <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(e.target.value)}
                    placeholder="(11) 98765-4321"
                    className="pl-9"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  E-mail de Contato
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="contato@empresa.com"
                    className="pl-9"
                  />
                </div>
              </div>

              <hr />

              <div className="space-y-2">
                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showPrices}
                    onChange={(e) => setShowPrices(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Exibir preços de produtos por padrão</span>
                </label>

                <label className="flex items-center space-x-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowContact}
                    onChange={(e) => setAllowContact(e.target.checked)}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Exibir botão "Solicitar via WhatsApp" na vitrine</span>
                </label>
              </div>
            </CardContent>
          </Card>
        </div>

        <Button type="submit" size="lg">
          <Save className="mr-2 h-5 w-5" /> Salvar Configurações do Catálogo
        </Button>
      </form>
    </div>
  );
};
