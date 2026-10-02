import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  ArrowLeft,
  Server,
  Layers,
  Clock,
  Laptop,
  Database,
  Search,
  Maximize2
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';

interface TestEvidencePageProps {
  onBack: () => void;
  onNavigateLogin?: () => void;
}

export const TestEvidencePage: React.FC<TestEvidencePageProps> = ({ onBack, onNavigateLogin }) => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'auth' | 'catalog' | 'sales' | 'dev'>('all');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Helper para caminhos com base do Vite
  const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${cleanBase}${cleanPath}`;
  };

  const apiTests = [
    { name: 'Auth Token (Login com Senha)', method: 'POST', status: 200, latency: '705 ms', detail: 'Token JWT emitido para willian.o.jesus@gmail.com' },
    { name: 'Empresas Cadastradas (Companies)', method: 'GET', status: 200, latency: '271 ms', detail: 'Registro de comp-cesta-1 com CNPJ e WhatsApp' },
    { name: 'Catálogo de Produtos + Relações', method: 'GET', status: 200, latency: '445 ms', detail: '51 produtos com categorias e marcas vinculadas' },
    { name: 'Categorias de Produtos (Categories)', method: 'GET', status: 200, latency: '428 ms', detail: '10 categorias ativas ordenadas por nome' },
    { name: 'Marcas Cadastradas (Brands)', method: 'GET', status: 200, latency: '423 ms', detail: '39 marcas parceiras sincronizadas' },
    { name: 'Saldos de Estoque (Inventory Items)', method: 'GET', status: 200, latency: '435 ms', detail: '51 itens com contagem física e reservas' },
    { name: 'Perfis de Usuários (Profiles)', method: 'GET', status: 200, latency: '169 ms', detail: 'Tabela pública vinculada ao auth.users' },
  ];

  const screenEvidences = [
    {
      id: '01',
      category: 'sales',
      title: 'Landing Page Oficial',
      filename: '01-landing-page.png',
      badge: 'Pública',
      description: 'Apresentação comercial com hero, métricas, recursos, selos de qualidade e FAQ interativo.',
    },
    {
      id: '02',
      category: 'auth',
      title: 'Tela de Autenticação (Login)',
      filename: '02-login-screen.png',
      badge: 'Segurança',
      description: 'Formulário de acesso com e-mail/senha, atalhos para credenciais reais e OAuth Google.',
    },
    {
      id: '03',
      category: 'auth',
      title: 'Criação de Conta (Sign Up)',
      filename: '03-signup-screen.png',
      badge: 'Segurança',
      description: 'Auto-cadastro no Supabase com validação de senhas, nome e confirmação imediata.',
    },
    {
      id: '04',
      category: 'catalog',
      title: 'Dashboard Executivo 360°',
      filename: '04-dashboard.png',
      badge: 'Gestão',
      description: 'KPIs financeiros, alertas de validade crítica, estoque mínimo e atalhos operacionais.',
    },
    {
      id: '05',
      category: 'catalog',
      title: 'Catálogo de Produtos & Validade',
      filename: '05-products-catalog.png',
      badge: 'Catálogo',
      description: '51 produtos reais com badges de validade, filtros dinâmicos e paginação em tabela.',
    },
    {
      id: '06',
      category: 'catalog',
      title: 'Cadastro & Edição de Produto',
      filename: '06-product-form.png',
      badge: 'Catálogo',
      description: 'Formulário com código EAN-13, precificação, categoria, fabricante e controle de validade.',
    },
    {
      id: '07',
      category: 'catalog',
      title: 'Emissão de Etiquetas Térmicas',
      filename: '07-thermal-labels.png',
      badge: 'Operação',
      description: 'Formatação de etiquetas de gôndola em folha A4 com código de barras legível por leitor.',
    },
    {
      id: '08',
      category: 'catalog',
      title: 'Estoque Consolidado & Inventário',
      filename: '08-inventory.png',
      badge: 'Estoque',
      description: 'Saldo físico real, reserva operacional e valor financeiro total imobilizado.',
    },
    {
      id: '09',
      category: 'catalog',
      title: 'Controle de Lotes & Validades',
      filename: '09-lots-expiration.png',
      badge: 'Estoque',
      description: 'Rastreabilidade lote a lote com data de fabricação, dias restantes e alertas visuais.',
    },
    {
      id: '10',
      category: 'catalog',
      title: 'Movimentações Kardex de Estoque',
      filename: '10-movements-kardex.png',
      badge: 'Auditoria',
      description: 'Histórico cronológico de entradas, saídas, baixas por avaria e ajustes com auditoria.',
    },
    {
      id: '11',
      category: 'sales',
      title: 'Relatórios & Métricas Operacionais',
      filename: '11-reports-overview.png',
      badge: 'BI & Dados',
      description: 'Curva ABC de produtos, estimativa de perdas por validade e relatórios exportáveis.',
    },
    {
      id: '12',
      category: 'sales',
      title: 'Montador Interativo de Cestas',
      filename: '12-basket-builder.png',
      badge: 'Experiência Cliente',
      description: 'Personalização de cestas de presentes (P, M, G) com bebida obrigatória e envio ao WhatsApp.',
    },
    {
      id: '13',
      category: 'sales',
      title: 'Vitrine Digital Pública da Loja',
      filename: '13-public-storefront.png',
      badge: 'Vendas Online',
      description: 'Catálogo online exclusivo com selo de loja verificada e contato direto sem comissões.',
    },
    {
      id: '14',
      category: 'dev',
      title: 'Perfil da Empresa & Configurações',
      filename: '14-company-profile.png',
      badge: 'Multi-tenant',
      description: 'Configuração de dados fiscais (CNPJ, Razão Social), WhatsApp de atendimento e identidade visual.',
    },
    {
      id: '15',
      category: 'dev',
      title: 'Central de Desenvolvedores & API Docs',
      filename: '15-api-docs.png',
      badge: 'Integrações',
      description: 'Documentação interativa OpenAPI/Swagger com payloads JSON e autenticação Bearer Token.',
    },
    {
      id: '16',
      category: 'dev',
      title: 'Assistente Inteligente com IA',
      filename: '16-ai-assistant.png',
      badge: 'Inteligência Artificial',
      description: 'Copiloto de IA para auxílio na precificação, elaboração de promoções e análise de rupturas.',
    },
    {
      id: '17',
      category: 'dev',
      title: 'Gestão de Usuários & Acessos',
      filename: '17-users-matrix.png',
      badge: 'Segurança',
      description: 'Matriz de permissões (Global Admin, Admin, Estoque, Visitante) e sessões ativas com isolamento RLS.',
    },
  ];

  const filteredScreens = screenEvidences.filter((s) => {
    if (selectedFilter === 'all') return true;
    return s.category === selectedFilter;
  });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header Fixo */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="text-xs font-semibold gap-1.5">
              <ArrowLeft className="w-4 h-4" /> Voltar
            </Button>
            <div className="h-4 w-px bg-border hidden sm:block" />
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-base shadow-sm">
                M
              </div>
              <span className="font-bold text-sm tracking-tight hidden sm:inline">Evidências de Testes & Homologação</span>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              100% Aprovado
            </span>
            {onNavigateLogin && (
              <Button size="sm" onClick={onNavigateLogin} className="text-xs font-semibold shadow-sm">
                Acessar o Painel
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Conteúdo Principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 flex-1">
        {/* Banner do Título */}
        <div className="space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary/10 text-primary border border-primary/20">
            <ShieldCheck className="w-4 h-4 text-primary" />
            <span>Relatório Oficial de Homologação • E2E & APIs na Nuvem</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Evidências Visuais e Técnicas do MarketFlow
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
            Todas as telas, APIs de integração do Supabase, regras de negócios e fluxos de usuário foram validados e documentados com capturas reais em alta resolução.
          </p>
        </div>

        {/* Métricas Executivas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Taxa de Sucesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</div>
              <p className="text-xs text-muted-foreground mt-1">24 testes executados sem falhas</p>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telas Homologadas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-blue-600 dark:text-blue-400">17 Telas</div>
              <p className="text-xs text-muted-foreground mt-1">Capturas em resolução 1440x900 @2x</p>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Endpoints REST Supabase</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-purple-600 dark:text-purple-400">7/7 OK</div>
              <p className="text-xs text-muted-foreground mt-1">Auth, RLS, produtos, estoque e perfis</p>
            </CardContent>
          </Card>

          <Card className="bg-card border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Latência Média de API</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-black text-amber-600 dark:text-amber-400">411 ms</div>
              <p className="text-xs text-muted-foreground mt-1">Conexão direta com PostgreSQL</p>
            </CardContent>
          </Card>
        </div>

        {/* Seção 1: Validação de APIs REST Supabase */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-purple-500" />
              <h2 className="text-xl font-bold tracking-tight">Testes de Integração de API (Supabase REST & Auth)</h2>
            </div>
            <Badge variant="outline" className="font-mono text-xs text-purple-600 dark:text-purple-400 border-purple-500/30">
              Supabase Status: 200 OK
            </Badge>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-muted/60 uppercase font-semibold text-muted-foreground border-b">
                  <tr>
                    <th className="px-4 py-3">Serviço / Endpoint</th>
                    <th className="px-4 py-3">Método</th>
                    <th className="px-4 py-3">Status HTTP</th>
                    <th className="px-4 py-3">Latência</th>
                    <th className="px-4 py-3">Validação & Payload</th>
                    <th className="px-4 py-3 text-right">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y font-mono">
                  {apiTests.map((t, idx) => (
                    <tr key={idx} className="hover:bg-muted/30 transition-colors">
                      <td className="px-4 py-3 font-semibold font-sans text-foreground">{t.name}</td>
                      <td className="px-4 py-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          t.method === 'POST' ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400' : 'bg-blue-500/10 text-blue-600 dark:text-blue-400'
                        }`}>
                          {t.method}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-emerald-600 dark:text-emerald-400 font-bold">{t.status} OK</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.latency}</td>
                      <td className="px-4 py-3 text-muted-foreground">{t.detail}</td>
                      <td className="px-4 py-3 text-right">
                        <span className="inline-flex items-center gap-1 text-[11px] px-2 py-0.5 rounded-full font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                          ✓ Aprovado
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Seção 2: Galeria de Telas & Evidências E2E */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <Laptop className="w-5 h-5 text-blue-500" />
              <h2 className="text-xl font-bold tracking-tight">Galeria de Evidências das Telas (17 Capturas)</h2>
            </div>

            {/* Filtros em Botões */}
            <div className="flex flex-wrap gap-1.5 bg-muted/60 p-1 rounded-lg border text-xs">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  selectedFilter === 'all' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Todas ({screenEvidences.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('catalog')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  selectedFilter === 'catalog' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Catálogo & Estoque
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('sales')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  selectedFilter === 'sales' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Vendas & Cestas
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('auth')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  selectedFilter === 'auth' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Autenticação
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('dev')}
                className={`px-3 py-1 rounded-md font-semibold transition ${
                  selectedFilter === 'dev' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'
                }`}
              >
                Configurações & API
              </button>
            </div>
          </div>

          {/* Grid de Evidências */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScreens.map((s) => (
              <Card key={s.id} className="overflow-hidden border bg-card shadow-sm hover:shadow-md transition-shadow flex flex-col group">
                <div className="p-3.5 border-b flex items-center justify-between bg-muted/30">
                  <div className="flex items-center space-x-2">
                    <span className="w-5 h-5 rounded-md bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                      {s.id}
                    </span>
                    <h3 className="font-bold text-xs text-foreground truncate max-w-[180px]">{s.title}</h3>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-semibold">
                    {s.badge}
                  </Badge>
                </div>

                {/* Imagem com visualizador */}
                <div
                  className="relative aspect-[16/10] bg-muted/40 overflow-hidden cursor-pointer"
                  onClick={() => setSelectedImage(getAssetUrl(`screenshots/${s.filename}`))}
                >
                  <img
                    src={getAssetUrl(`screenshots/${s.filename}`)}
                    alt={s.title}
                    loading="lazy"
                    className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 text-white text-xs font-semibold">
                    <Maximize2 className="w-4 h-4" /> Clique para Expandir
                  </div>
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                  <div className="pt-2 border-t flex items-center justify-between text-[11px] text-muted-foreground font-mono">
                    <span>{s.filename}</span>
                    <a
                      href={getAssetUrl(`screenshots/${s.filename}`)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline font-sans font-medium flex items-center gap-1"
                    >
                      Abrir Imagem ↗
                    </a>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* Modal Lightbox para Zoom na Imagem */}
        {selectedImage && (
          <div
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-pointer"
            onClick={() => setSelectedImage(null)}
          >
            <div className="relative max-w-5xl w-full max-h-[90vh] bg-background rounded-2xl overflow-hidden shadow-2xl border p-2">
              <img src={selectedImage} alt="Evidência ampliada" className="w-full h-auto max-h-[82vh] object-contain rounded-xl" />
              <div className="p-3 flex items-center justify-between text-xs text-muted-foreground font-medium">
                <span>Clique em qualquer lugar para fechar</span>
                <a href={selectedImage} target="_blank" rel="noreferrer" className="text-primary font-bold hover:underline">
                  Abrir arquivo original em nova aba ↗
                </a>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/20 py-6 text-center text-xs text-muted-foreground">
        MarketFlow — Sistema Homologado e Testado Automatizadamente • Evidências geradas via Puppeteer
      </footer>
    </div>
  );
};
