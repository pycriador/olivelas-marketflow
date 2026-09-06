import React, { useState } from 'react';
import {
  Building2,
  Save,
  CheckCircle2,
  Phone,
  Mail,
  FileText,
  MapPin,
  Coffee,
  Globe,
  Store
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { Badge } from '../../../components/ui/badge';

export const CompanyProfilePage: React.FC = () => {
  const { currentCompany, updateCompany } = useCompany();

  const [name, setName] = useState(currentCompany?.name || '');
  const [legalName, setLegalName] = useState(currentCompany?.legal_name || '');
  const [cnpj, setCnpj] = useState(currentCompany?.cnpj || '');
  const [slug, setSlug] = useState(currentCompany?.slug || '');
  const [phone, setPhone] = useState(currentCompany?.phone || '');
  const [whatsapp, setWhatsapp] = useState(currentCompany?.whatsapp || '');
  const [email, setEmail] = useState(currentCompany?.email || '');
  const [subtitulo, setSubtitulo] = useState(currentCompany?.subtitulo || '');
  const [avisoRodape, setAvisoRodape] = useState(currentCompany?.avisoRodape || '');
  const [description, setDescription] = useState(currentCompany?.description || '');

  const [isSaved, setIsSaved] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCompany) return;
    setIsSaving(true);
    try {
      await updateCompany(currentCompany.id, {
        name,
        legal_name: legalName,
        cnpj,
        slug,
        phone,
        whatsapp,
        email,
        subtitulo,
        avisoRodape,
        description,
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 3500);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Administração' }, { label: 'Dados da Empresa' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Cadastro e Perfil da Empresa</h1>
          <p className="text-sm text-muted-foreground">
            Gerencie a razão social, CNPJ, canais de comunicação e identidade corporativa.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => {
              const prefix = window.location.pathname.startsWith('/olivelas-marketflow') ? '/olivelas-marketflow' : '';
              window.open(`${prefix}/loja/${slug || currentCompany?.slug || 'cestas-cafe-da-manha'}`, '_blank');
            }}
          >
            <Globe className="mr-2 h-4 w-4 text-primary" /> Ver Vitrine Pública
          </Button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {isSaved && (
          <div className="rounded-xl bg-success/10 border border-success/30 p-4 text-sm text-success font-semibold flex items-center shadow-xs">
            <CheckCircle2 className="h-5 w-5 mr-2.5 shrink-0" />
            Dados da empresa atualizados com sucesso e sincronizados em tempo real!
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2">
          {/* Card: Identificação Legal */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Building2 className="mr-2 h-4 w-4 text-primary" /> Identificação Cadastral & Fiscal
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Nome Fantasia / Nome Público *
                </label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Ex: Cestas de Café da Manhã"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Razão Social / Nome Jurídico
                </label>
                <Input
                  value={legalName}
                  onChange={(e) => setLegalName(e.target.value)}
                  placeholder="Ex: Olivelas Cestas e Delícias Ltda"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  CNPJ / Documento Fiscal
                </label>
                <Input
                  value={cnpj}
                  onChange={(e) => setCnpj(e.target.value)}
                  placeholder="00.000.000/0001-00"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Slug / Identificador de URL
                </label>
                <div className="flex items-center space-x-2">
                  <span className="text-xs text-muted-foreground font-mono">/loja/</span>
                  <Input
                    value={slug}
                    onChange={(e) => setSlug(e.target.value)}
                    placeholder="cestas-cafe-da-manha"
                    className="font-mono"
                    required
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Card: Contato e Comunicação */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Phone className="mr-2 h-4 w-4 text-primary" /> Contatos & Atendimento
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  WhatsApp Oficial para Pedidos *
                </label>
                <Input
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="5511963820374"
                  required
                />
                <p className="text-[11px] text-muted-foreground">
                  Número que receberá as mensagens diretas e pedidos das cestas.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Telefone Comercial
                </label>
                <Input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="(11) 96382-0374"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  E-mail de Contato
                </label>
                <Input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="contato@empresa.com"
                />
              </div>
            </CardContent>
          </Card>

          {/* Card: Apresentação da Loja & Cestas */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle className="text-base flex items-center justify-between">
                <div className="flex items-center">
                  <Coffee className="mr-2 h-4 w-4 text-amber-600" /> Apresentação da Vitrine & Mensagens
                </div>
                {currentCompany?.breakfast_basket_enabled && (
                  <Badge variant="outline" className="bg-amber-500/10 text-amber-700 border-amber-500/30 text-xs">
                    Cesta Ativa
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Subtítulo / Chamada Principal da Loja
                </label>
                <Input
                  value={subtitulo}
                  onChange={(e) => setSubtitulo(e.target.value)}
                  placeholder="Ex: Monte a sua cesta e envie o pedido pelo WhatsApp"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Aviso de Rodapé da Vitrine
                </label>
                <Input
                  value={avisoRodape}
                  onChange={(e) => setAvisoRodape(e.target.value)}
                  placeholder="Ex: Cardápio de exemplo — em ajustes."
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase text-muted-foreground">
                  Descrição Geral / Sobre a Loja
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="w-full rounded-md border border-input bg-background p-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  placeholder="Conte a história da sua loja para seus clientes..."
                />
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="flex justify-end pt-2">
          <Button type="submit" disabled={isSaving} className="min-w-[140px]">
            <Save className="mr-2 h-4 w-4" />
            {isSaving ? 'Salvando...' : 'Salvar Alterações'}
          </Button>
        </div>
      </form>
    </div>
  );
};
