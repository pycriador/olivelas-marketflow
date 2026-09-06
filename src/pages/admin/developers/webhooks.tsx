import React, { useState } from 'react';
import { Radio, Plus, Play, CheckCircle2, XCircle, Clock, Shield, Trash2, Send } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { WebhookEndpoint, WebhookDelivery, WebhookEvent } from '../../../types';

const ALL_EVENTS: { event: WebhookEvent; label: string }[] = [
  { event: 'product.created', label: 'Produto Criado' },
  { event: 'product.updated', label: 'Produto Atualizado' },
  { event: 'inventory.updated', label: 'Estoque Movimentado' },
  { event: 'catalog.published', label: 'Catálogo Publicado' },
  { event: 'catalog.request.created', label: 'Novo Pedido no Catálogo' },
  { event: 'ai.job.completed', label: 'Processamento de IA Concluído' },
];

export const WebhooksPage: React.FC = () => {
  const { currentCompany } = useCompany();

  const [endpoints, setEndpoints] = useState<WebhookEndpoint[]>([
    {
      id: 'ep-1',
      company_id: currentCompany?.id || 'comp-1',
      url: 'https://seu-erp.com.br/webhooks/marketflow',
      description: 'Webhook para sincronização com ERP Bling/Tiny',
      secret: 'whsec_8f9a0b1c2d3e4f5a6b7c',
      events: ['product.created', 'inventory.updated', 'catalog.request.created'],
      active: true,
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5).toISOString(),
      updated_at: new Date().toISOString(),
    },
  ]);

  const [deliveries, setDeliveries] = useState<WebhookDelivery[]>([
    {
      id: 'del-1',
      endpoint_id: 'ep-1',
      event: 'inventory.updated',
      payload: { product_id: 'prod-1', new_balance: 42, unit_cost: 8.5 },
      response_status: 200,
      duration_ms: 145,
      status: 'success',
      attempt_count: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    },
    {
      id: 'del-2',
      endpoint_id: 'ep-1',
      event: 'catalog.request.created',
      payload: { request_id: 'REQ-1042', customer_name: 'João Silva' },
      response_status: 200,
      duration_ms: 210,
      status: 'success',
      attempt_count: 1,
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [selectedEvents, setSelectedEvents] = useState<WebhookEvent[]>([
    'product.created',
    'inventory.updated',
  ]);

  const [testingEndpointId, setTestingEndpointId] = useState<string | null>(null);

  const handleToggleEvent = (ev: WebhookEvent) => {
    setSelectedEvents(prev =>
      prev.includes(ev) ? prev.filter(e => e !== ev) : [...prev, ev]
    );
  };

  const handleCreateEndpoint = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim()) return;

    const newEp: WebhookEndpoint = {
      id: `ep-${Date.now()}`,
      company_id: currentCompany?.id || 'comp-1',
      url,
      description,
      secret: `whsec_${Math.random().toString(36).substring(2, 18)}`,
      events: selectedEvents,
      active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    setEndpoints(prev => [newEp, ...prev]);
    setUrl('');
    setDescription('');
    setIsModalOpen(false);
  };

  const handleTestDispatch = (epId: string) => {
    setTestingEndpointId(epId);
    setTimeout(() => {
      const newDel: WebhookDelivery = {
        id: `del-${Date.now()}`,
        endpoint_id: epId,
        event: 'product.created',
        payload: { test: true, timestamp: new Date().toISOString() },
        response_status: 200,
        duration_ms: 98,
        status: 'success',
        attempt_count: 1,
        created_at: new Date().toISOString(),
      };
      setDeliveries(prev => [newDel, ...prev]);
      setTestingEndpointId(null);
    }, 600);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Desenvolvedores' }, { label: 'Webhooks & Eventos' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Webhooks em Tempo Real</h1>
          <p className="text-sm text-muted-foreground">
            Receba notificações HTTP POST automáticas quando ocorrerem eventos no seu estoque e catálogo.
          </p>
        </div>
        <Button size="sm" onClick={() => setIsModalOpen(true)}>
          <Plus className="mr-1.5 h-4 w-4" /> Cadastrar Endpoint
        </Button>
      </div>

      {/* Endpoints Cadastrados */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Radio className="mr-2 h-4 w-4 text-primary" /> Endpoints Configurados
          </CardTitle>
        </CardHeader>
        <CardContent>
          {endpoints.length === 0 ? (
            <div className="py-8 text-center text-sm text-muted-foreground">
              Nenhum webhook cadastrado.
            </div>
          ) : (
            <div className="divide-y">
              {endpoints.map(ep => (
                <div key={ep.id} className="py-4 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-foreground font-mono text-sm">{ep.url}</span>
                        <Badge variant="outline" className="bg-emerald-500/10 text-emerald-600 text-[10px]">
                          Ativo
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{ep.description}</p>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        isLoading={testingEndpointId === ep.id}
                        loadingText="Enviando..."
                        onClick={() => handleTestDispatch(ep.id)}
                      >
                        <Send className="mr-1.5 h-3.5 w-3.5 text-primary" /> Testar Disparo
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs bg-muted/40 p-2 rounded-md font-mono">
                    <span className="text-muted-foreground">Secret:</span>
                    <span className="text-foreground font-bold">{ep.secret}</span>
                  </div>

                  <div className="flex flex-wrap gap-1">
                    <span className="text-[11px] font-semibold text-muted-foreground mr-1">Eventos:</span>
                    {ep.events.map(ev => (
                      <span key={ev} className="inline-flex items-center rounded bg-primary/10 px-1.5 py-0.5 text-[10px] font-mono text-primary font-bold">
                        {ev}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Histórico de Entregas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center">
            <Clock className="mr-2 h-4 w-4 text-primary" /> Logs Recentes de Disparos
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="divide-y text-xs">
            {deliveries.map(d => (
              <div key={d.id} className="py-3 flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {d.status === 'success' ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-destructive shrink-0" />
                  )}
                  <div>
                    <span className="font-mono font-bold text-foreground">{d.event}</span>
                    <span className="text-muted-foreground ml-2">({d.duration_ms}ms)</span>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  <Badge variant="outline" className="font-mono text-[10px]">
                    HTTP {d.response_status}
                  </Badge>
                  <span className="text-muted-foreground">{new Date(d.created_at).toLocaleTimeString()}</span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in-50">
          <div className="w-full max-w-md rounded-xl border bg-card p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Novo Endpoint de Webhook</h3>

            <form onSubmit={handleCreateEndpoint} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  URL de Destino (HTTPS) *
                </label>
                <Input
                  type="url"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  placeholder="https://seu-servidor.com/webhook"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                  Descrição / Identificador
                </label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Ex: Servidor de Estoque da Matriz"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase text-muted-foreground mb-2">
                  Eventos Assinados *
                </label>
                <div className="space-y-2 max-h-36 overflow-y-auto border p-2 rounded-md">
                  {ALL_EVENTS.map(item => (
                    <label key={item.event} className="flex items-center space-x-2 text-xs cursor-pointer">
                      <input
                        type="checkbox"
                        checked={selectedEvents.includes(item.event)}
                        onChange={() => handleToggleEvent(item.event)}
                        className="rounded border-input text-primary"
                      />
                      <span>{item.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsModalOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit">Salvar Endpoint</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
