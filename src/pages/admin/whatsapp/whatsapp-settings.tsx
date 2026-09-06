import React, { useState, useEffect } from 'react';
import { MessageSquare, Send, Check, AlertCircle, Sparkles, Globe, Edit3, Plus, RefreshCw, CheckCheck, Phone, Eye } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { WhatsAppTemplate, WhatsAppMessage, WhatsAppCategory, Language } from '../../../types';
import { WhatsAppService } from '../../../services/whatsapp/whatsapp-service';

export const WhatsAppSettingsPage: React.FC = () => {
  const { currentCompany } = useCompany();

  const [templates, setTemplates] = useState<WhatsAppTemplate[]>([]);
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WhatsAppTemplate | null>(null);

  // Estados de Edição do Template
  const [templateName, setTemplateName] = useState('');
  const [templateCategory, setTemplateCategory] = useState<WhatsAppCategory>('request');
  const [templateLang, setTemplateLang] = useState<Language>('pt-BR');
  const [templateBody, setTemplateBody] = useState('');

  // Validação em Tempo Real de Variáveis
  const [validationResult, setValidationResult] = useState<{
    valid: boolean;
    foundVariables: string[];
    invalidVariables: string[];
  }>({ valid: true, foundVariables: [], invalidVariables: [] });

  // Valores Simulados para o Preview do WhatsApp
  const [simulatedValues, setSimulatedValues] = useState({
    customer_name: 'João Silva',
    company_name: currentCompany?.name || 'Mercadinho Central',
    product_name: 'Café Gourmet 500g',
    product_price: 'R$ 24,90',
    request_id: 'REQ-1042',
    catalog_url: `https://marketflow.app/loja/${currentCompany?.slug || 'mercado-central'}`,
  });

  const [isSendingTest, setIsSendingTest] = useState(false);
  const [testPhone, setTestPhone] = useState('(11) 99999-8888');

  useEffect(() => {
    refreshData();
  }, [currentCompany]);

  const refreshData = () => {
    const companyId = currentCompany?.id || 'comp-1';
    const tpls = WhatsAppService.getStoredTemplates(companyId);
    const msgs = WhatsAppService.getStoredMessages(companyId);
    setTemplates(tpls);
    setMessages(msgs);
    if (tpls.length > 0 && !selectedTemplate) {
      handleSelectTemplate(tpls[0]);
    }
  };

  const handleSelectTemplate = (tpl: WhatsAppTemplate) => {
    setSelectedTemplate(tpl);
    setTemplateName(tpl.name);
    setTemplateCategory(tpl.category);
    setTemplateLang(tpl.language);
    setTemplateBody(tpl.body_text);
    validateBody(tpl.body_text);
  };

  const validateBody = (text: string) => {
    const res = WhatsAppService.extractAndValidateVariables(text);
    setValidationResult(res);
  };

  const handleBodyChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const text = e.target.value;
    setTemplateBody(text);
    validateBody(text);
  };

  const handleSaveTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validationResult.valid) {
      alert('Corrija as variáveis inválidas antes de salvar o template.');
      return;
    }

    const companyId = currentCompany?.id || 'comp-1';
    const saved = WhatsAppService.saveTemplate({
      id: selectedTemplate?.id,
      company_id: companyId,
      name: templateName,
      category: templateCategory,
      language: templateLang,
      body_text: templateBody,
      variables: validationResult.foundVariables,
      active: true,
      is_system_default: false,
    });

    refreshData();
    setSelectedTemplate(saved);
  };

  const handleSendTestMessage = async () => {
    setIsSendingTest(true);
    const rendered = WhatsAppService.renderTemplate(templateBody, simulatedValues);
    const companyId = currentCompany?.id || 'comp-1';

    await WhatsAppService.sendMessage({
      companyId,
      recipientPhone: testPhone,
      templateId: selectedTemplate?.id,
      renderedText: rendered,
    });

    setIsSendingTest(false);
    refreshData();
  };

  const renderedPreviewText = WhatsAppService.renderTemplate(templateBody, simulatedValues);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Automações' }, { label: 'WhatsApp & Templates' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">WhatsApp & Mensagens Customizadas</h1>
          <p className="text-sm text-muted-foreground">
            Configure templates de mensagens com suporte a multi-idioma (PT, EN, ES), variáveis dinâmicas e preview em tempo real.
          </p>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar de Templates (Esquerda) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base flex items-center">
                <MessageSquare className="mr-2 h-4 w-4 text-emerald-500" /> Templates Salvos
              </CardTitle>
              <Button size="sm" variant="outline" onClick={() => {
                setSelectedTemplate(null);
                setTemplateName('Novo Template');
                setTemplateBody('Olá {{customer_name}}! Obrigado por entrar em contato com {{company_name}}.');
                validateBody('Olá {{customer_name}}! Obrigado por entrar em contato com {{company_name}}.');
              }}>
                <Plus className="h-4 w-4 mr-1" /> Criar
              </Button>
            </CardHeader>
            <CardContent className="space-y-2 p-2">
              {templates.map(tpl => {
                const isSelected = selectedTemplate?.id === tpl.id;
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleSelectTemplate(tpl)}
                    className={`w-full flex items-center justify-between p-3 rounded-lg text-xs font-medium text-left transition-all ${
                      isSelected
                        ? 'bg-emerald-500/10 border-l-4 border-emerald-500 text-emerald-700 dark:text-emerald-300 font-bold'
                        : 'hover:bg-accent text-foreground'
                    }`}
                  >
                    <div>
                      <span className="block font-bold">{tpl.name}</span>
                      <span className="text-[10px] text-muted-foreground uppercase">{tpl.category}</span>
                    </div>
                    <Badge variant="outline" className="text-[10px]">
                      {tpl.language}
                    </Badge>
                  </button>
                );
              })}
            </CardContent>
          </Card>

          {/* Variáveis Permitidas */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-xs uppercase font-bold text-muted-foreground flex items-center">
                <Sparkles className="mr-1.5 h-3.5 w-3.5 text-emerald-500" /> Variáveis Dinâmicas Aceitas
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 text-xs">
              <p className="text-muted-foreground text-[11px] mb-2">
                Use a sintaxe <code>{'{{variavel}}'}</code> para que o sistema substitua os dados automaticamente:
              </p>
              <div className="flex flex-wrap gap-1">
                {['customer_name', 'company_name', 'product_name', 'product_price', 'request_id', 'catalog_url', 'support_name'].map(v => (
                  <span
                    key={v}
                    onClick={() => {
                      setTemplateBody(prev => `${prev} {{${v}}}`);
                      validateBody(`${templateBody} {{${v}}}`);
                    }}
                    className="inline-flex items-center cursor-pointer rounded bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-mono text-emerald-600 hover:bg-emerald-500/20"
                    title="Clique para inserir no texto"
                  >
                    +{v}
                  </span>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor e Preview do WhatsApp (Direita) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Form Editor */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Edit3 className="mr-2 h-4 w-4 text-primary" /> Editor de Template
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSaveTemplate} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Nome do Template *
                    </label>
                    <Input
                      value={templateName}
                      onChange={(e) => setTemplateName(e.target.value)}
                      required
                      placeholder="Ex: Confirmação de Pedido"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                        Categoria *
                      </label>
                      <select
                        value={templateCategory}
                        onChange={(e) => setTemplateCategory(e.target.value as WhatsAppCategory)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="greeting">Saudação</option>
                        <option value="request">Solicitação</option>
                        <option value="confirmation">Confirmação</option>
                        <option value="product">Produto</option>
                        <option value="stock">Estoque</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                        Idioma (i18n) *
                      </label>
                      <select
                        value={templateLang}
                        onChange={(e) => setTemplateLang(e.target.value as Language)}
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="pt-BR">🇧🇷 Português</option>
                        <option value="en">🇺🇸 English</option>
                        <option value="es">🇪🇸 Español</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Conteúdo da Mensagem *
                    </label>
                    <textarea
                      rows={6}
                      value={templateBody}
                      onChange={handleBodyChange}
                      required
                      className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-xs font-mono focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                  </div>

                  {/* Feedback de Validação */}
                  {!validationResult.valid && (
                    <div className="rounded-md bg-destructive/10 p-3 text-xs text-destructive flex items-center space-x-2">
                      <AlertCircle className="h-4 w-4 shrink-0" />
                      <span>Variáveis inválidas detectadas: {validationResult.invalidVariables.join(', ')}</span>
                    </div>
                  )}

                  <div className="flex justify-end pt-2">
                    <Button type="submit" disabled={!validationResult.valid}>
                      Salvar Template
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            {/* Simulação Visual do Chat do WhatsApp */}
            <Card className="flex flex-col justify-between overflow-hidden border-emerald-500/30">
              <CardHeader className="bg-emerald-700 text-white p-3 flex flex-row items-center space-x-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-white/20 font-bold text-sm">
                  MF
                </div>
                <div>
                  <h4 className="text-sm font-bold leading-tight">{currentCompany?.name || 'Mercadinho Central'}</h4>
                  <p className="text-[10px] text-emerald-200">Atendimento Oficial WhatsApp</p>
                </div>
              </CardHeader>

              <CardContent className="flex-1 p-4 bg-emerald-950/10 dark:bg-emerald-950/40 space-y-4">
                <div className="text-[10px] text-center text-muted-foreground font-semibold">HOJE</div>

                {/* Balão de Mensagem Estilo WhatsApp */}
                <div className="max-w-[85%] rounded-lg bg-emerald-100 text-emerald-950 dark:bg-emerald-900 dark:text-emerald-50 p-3 text-xs shadow space-y-2 relative animate-in fade-in-50">
                  <p className="whitespace-pre-wrap leading-relaxed">{renderedPreviewText}</p>
                  <div className="flex items-center justify-end space-x-1 text-[9px] text-emerald-700 dark:text-emerald-300">
                    <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                    <CheckCheck className="h-3 w-3 text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </CardContent>

              {/* Botão de Disparo de Teste */}
              <div className="p-3 border-t bg-card space-y-2">
                <div className="flex items-center space-x-2">
                  <Input
                    size={1}
                    value={testPhone}
                    onChange={(e) => setTestPhone(e.target.value)}
                    placeholder="(11) 99999-8888"
                    className="text-xs h-8"
                  />
                  <Button
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 h-8"
                    isLoading={isSendingTest}
                    onClick={handleSendTestMessage}
                  >
                    <Send className="h-3.5 w-3.5 mr-1" /> Testar Envio
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          {/* Histórico de Envios */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Phone className="mr-2 h-4 w-4 text-emerald-500" /> Logs de Envios de Mensagens
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="divide-y text-xs">
                {messages.map(m => (
                  <div key={m.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground">{m.recipient_phone}</span>
                        <Badge
                          variant="outline"
                          className={
                            m.status === 'delivered' || m.status === 'read'
                              ? 'bg-emerald-500/10 text-emerald-600 border-emerald-500/30'
                              : 'bg-amber-500/10 text-amber-600'
                          }
                        >
                          {m.status}
                        </Badge>
                      </div>
                      <p className="text-[11px] text-muted-foreground truncate max-w-md mt-0.5">{m.message_body}</p>
                    </div>

                    <div className="text-right text-[11px] text-muted-foreground">
                      {new Date(m.created_at).toLocaleString()}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
