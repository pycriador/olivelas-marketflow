import React, { useState } from 'react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardContent } from '../../components/ui/card';
import {
  Store,
  Sparkles,
  Package,
  Boxes,
  CalendarDays,
  ShieldCheck,
  Zap,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  MessageSquare,
  Tag,
  Printer,
  Smartphone,
  Layers,
  Users,
  Sliders,
  Globe,
  ChevronRight,
  Eye,
  Star,
  ExternalLink,
  ArrowUpRight,
  BarChart3,
  Clock,
  Check,
  X,
  Shield,
  Palette,
  Laptop
} from 'lucide-react';

interface LandingPageProps {
  onNavigateLogin: () => void;
  onNavigateSignup?: () => void;
  onNavigateCatalogDemo: () => void;
  onNavigateBasketDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onNavigateLogin,
  onNavigateSignup = onNavigateLogin,
  onNavigateCatalogDemo,
  onNavigateBasketDemo,
}) => {
  // Helper para montar caminhos de assets estáticos garantindo compatibilidade com GitHub Pages e local
  const getAssetUrl = (path: string) => {
    const base = import.meta.env.BASE_URL || '/';
    const cleanBase = base.endsWith('/') ? base : `${base}/`;
    const cleanPath = path.startsWith('/') ? path.slice(1) : path;
    return `${cleanBase}${cleanPath}`;
  };

  // Screenshots reais da aplicação capturados do sistema
  const screens = [
    {
      id: 'dashboard',
      title: 'Painel Geral (Dashboard)',
      subtitle: 'Visão executiva em tempo real com métricas financeiras, alertas de estoque e validades críticas.',
      image: getAssetUrl('screenshots/dashboard.png'),
      badge: 'Gestão 360°',
      highlights: [
        'Total de produtos e valor acumulado do inventário',
        'Alertas imediatos de itens com estoque baixo',
        'Contador de lotes vencidos ou próximos da expiração',
        'Acesso rápido a cadastros e movimentações Kardex'
      ]
    },
    {
      id: 'products',
      title: 'Gestão de Produtos & Validade',
      subtitle: 'Catálogo de produtos com paginação sincronizada na URL, filtros dinâmicos e controle de validade real.',
      image: getAssetUrl('screenshots/products.png'),
      badge: 'Controle de Validade',
      highlights: [
        '51 produtos reais pré-cadastrados com imagens e descrições',
        'Data de validade com status visual (Dentro do Prazo, Vence em Breve, Vencido)',
        'Paginação em tabela com 10, 20 ou 30 itens por página',
        'Filtros por categoria, marcas e busca em tempo real'
      ]
    },
    {
      id: 'inventory',
      title: 'Estoque Consolidado & Lotes',
      subtitle: 'Rastreabilidade total de inventário com número de lote, data de fabricação e saldo por prateleira.',
      image: getAssetUrl('screenshots/inventory.png'),
      badge: 'Rastreabilidade Kardex',
      highlights: [
        'Entradas, saídas e ajustes com registro de motivo e documento',
        'Dias restantes calculados automaticamente para cada lote',
        'Localização física de cada item no depósito ou loja',
        'Histórico cronológico de movimentações para auditoria'
      ]
    },
    {
      id: 'labels',
      title: 'Gerador de Etiquetas Térmicas',
      subtitle: 'Emissão de etiquetas de gôndola e código de barras personalizadas prontas para impressão.',
      image: getAssetUrl('screenshots/labels.png'),
      badge: 'Pronto para Impressão',
      highlights: [
        'Geração de código de barras padrão EAN-13 legível por leitor',
        'Seleção em lote de produtos com recurso "Marcar Página"',
        'Folha A4 formatada com 24 etiquetas por página ou impressora térmica',
        'Exibição de nome, marca, código e preço de venda em destaque'
      ]
    },
    {
      id: 'basket-builder',
      title: 'Montador Interativo de Cestas',
      subtitle: 'Personalização de cestas de presentes pelo cliente com validação de regras de negócio em tempo real.',
      image: getAssetUrl('screenshots/basket-builder.png'),
      badge: 'Vendas Especiais',
      highlights: [
        'Seleção de tamanhos: Cesta Pequena (5 itens), Média (8 itens) e Grande (12 itens)',
        'Regras automáticas com bebida obrigatória adequada ao tamanho',
        'Cálculo de subtotal dinâmico com valor base da cesta',
        'Envio de pedido pronto formatado diretamente no WhatsApp da loja'
      ]
    },
    {
      id: 'public-store',
      title: 'Vitrine Digital / Catálogo Público',
      subtitle: 'Página exclusiva da sua loja para clientes consultarem preços e produtos pelo celular.',
      image: getAssetUrl('screenshots/public-store.png'),
      badge: 'Sem Comissões',
      highlights: [
        'Link direto para divulgação: /loja/nome-da-sua-empresa',
        'Carrinho de compras simples com cálculo de frete e observações',
        'Identificação oficial da empresa com selo de loja verificada e CNPJ',
        'Zero intermediação: o pagamento e a entrega são combinados diretamente'
      ]
    }
  ];

  const [activeScreenIndex, setActiveScreenIndex] = useState(0);
  const activeScreen = screens[activeScreenIndex];

  // FAQ Interativo
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      question: 'Preciso de cartão de crédito para começar a usar?',
      answer: 'Não! O MarketFlow possui um plano gratuito completo que permite cadastrar até 3 empresas, 100 produtos por empresa, controlar validades de estoque e publicar o catálogo online sem exigir nenhum dado de pagamento.'
    },
    {
      question: 'Como funciona o envio de pedidos pelo WhatsApp?',
      answer: 'Quando o cliente monta uma cesta ou seleciona produtos no seu catálogo online, o sistema gera automaticamente uma mensagem estruturada com a lista de itens, quantidades, valores e endereço de entrega, abrindo o WhatsApp da sua loja com um clique.'
    },
    {
      question: 'Como a Inteligência Artificial auxilia no cadastro de produtos?',
      answer: 'Você só precisa tirar uma foto do rótulo ou da embalagem do produto com a câmera do celular. Nossa IA com visão computacional identifica o nome do produto, fabricante, código de barras (EAN), volume e sugere a categoria adequada com percentual de confiança. Você apenas confere e salva.'
    },
    {
      question: 'Posso cadastrar mais de uma loja ou filial na mesma conta?',
      answer: 'Sim! O MarketFlow foi projetado com arquitetura multi-tenant nativa. Na barra superior você pode criar e alternar instantaneamente entre diferentes lojas (ex: Mercearia Central, Adega Gourmet, Cestas Matinais), cada uma com seus próprios produtos, estoque e catálogo exclusivo.'
    },
    {
      question: 'Os dados ficam salvos de verdade em banco de dados na nuvem?',
      answer: 'Sim. Todos os dados são salvos em PostgreSQL gerenciado pelo Supabase com políticas de segurança RLS (Row Level Security), garantindo que apenas os membros autorizados da sua empresa tenham acesso aos registros, além de sincronização em tempo real.'
    },
    {
      question: 'Como funciona o controle de data de validade?',
      answer: 'Cada produto e lote possui registro de data de validade. O sistema calcula automaticamente os dias restantes e classifica com cores intuitivas: verde (dentro do prazo), amarelo (vencendo em até 15 dias) e vermelho (vencido), permitindo criar promoções antes de perder a mercadoria.'
    }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col selection:bg-primary/20 selection:text-primary">
      {/* 1. Header / Navbar */}
      <header className="sticky top-0 z-50 border-b bg-background/90 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow-md">
              M
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight leading-none">MarketFlow</span>
              <span className="text-[10px] text-muted-foreground font-medium tracking-wider uppercase">SaaS Multi-tenant</span>
            </div>
          </div>

          <nav className="hidden lg:flex items-center space-x-7 text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            <a href="#telas" className="hover:text-primary transition-colors">Telas & Usabilidade</a>
            <a href="#recursos" className="hover:text-primary transition-colors">Módulos</a>
            <a href="#ia" className="hover:text-primary transition-colors">IA Multimodal</a>
            <a href="#cestas" className="hover:text-primary transition-colors">Cestas & Catálogo</a>
            <a href="#comparativo" className="hover:text-primary transition-colors">Comparativo</a>
            <a href="#planos" className="hover:text-primary transition-colors">Planos</a>
            <a href="#faq" className="hover:text-primary transition-colors">Dúvidas</a>
          </nav>

          <div className="flex items-center space-x-2.5">
            <Button variant="ghost" size="sm" onClick={onNavigateLogin} className="text-xs font-semibold">
              Entrar
            </Button>
            <Button size="sm" onClick={onNavigateSignup} className="text-xs font-semibold shadow-sm">
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-12 pb-20 md:pt-20 md:pb-28">
        {/* Background gradient decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/10 via-primary/5 to-transparent blur-3xl -z-10 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-7">
          <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/25 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-sm">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Versão 2.0 • PostgreSQL na Nuvem + IA com Visão Computacional</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight max-w-5xl mx-auto leading-[1.12]">
            A Plataforma Definitiva de <span className="text-primary underline decoration-primary/30 decoration-wavy">Gestão, Estoque Inteligente</span> e Catálogo Online.
          </h1>

          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground max-w-3xl mx-auto font-normal leading-relaxed">
            Elimine planilhas confusas e cadernos de anotações. Controle produtos com <strong>data de validade rigorosa</strong>, rastreie lotes, emita <strong>etiquetas de gôndola</strong>, monte cestas de presentes e receba pedidos organizados direto no seu <strong>WhatsApp</strong>.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-3">
            <Button size="lg" onClick={onNavigateSignup} className="w-full sm:w-auto h-13 px-8 text-sm font-bold shadow-lg">
              Começar Gratuitamente <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <a
              href="#telas"
              className="inline-flex items-center justify-center h-13 px-6 text-sm font-semibold rounded-md border border-input bg-card hover:bg-accent transition-colors w-full sm:w-auto"
            >
              <Laptop className="mr-2 h-4 w-4 text-primary" /> Explorar Telas do Sistema
            </a>
            <Button
              size="lg"
              variant="outline"
              onClick={onNavigateCatalogDemo}
              className="w-full sm:w-auto h-13 px-6 text-sm font-semibold"
            >
              <Store className="mr-2 h-4 w-4 text-emerald-600" /> Vitrine de Demonstração
            </Button>
          </div>

          {/* Destaques rápidos */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium">
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> 100% Responsivo & Mobile First</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Multi-tenant (Várias Empresas)</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Supabase Auth + PostgreSQL</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> 20 Temas de Cores & Modo Escuro</span>
            <span className="flex items-center"><CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-500" /> Trilingue (PT, EN, ES)</span>
          </div>

          {/* Hero Mockup Showcase */}
          <div className="pt-10 max-w-6xl mx-auto">
            <div className="rounded-2xl border bg-card/80 p-2 sm:p-3 shadow-2xl backdrop-blur">
              <div className="rounded-xl overflow-hidden border bg-background relative shadow-inner">
                {/* Janela de navegador estilizada */}
                <div className="bg-muted/80 px-4 py-2.5 border-b flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                    <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  </div>
                  <div className="flex items-center space-x-2 bg-background/80 border px-3 py-1 rounded-md text-[11px] font-mono text-muted-foreground">
                    <Shield className="w-3 h-3 text-emerald-600 inline" />
                    <span>marketflow.app/admin/dashboard</span>
                  </div>
                  <div className="text-[11px] font-semibold text-muted-foreground">
                    Painel Operacional
                  </div>
                </div>

                {/* Imagem do print em alta resolução */}
                <img
                  src={getAssetUrl('screenshots/dashboard.png')}
                  alt="Painel Geral MarketFlow"
                  className="w-full h-auto object-cover max-h-[620px]"
                  loading="eager"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Números & Métricas de Impacto */}
      <section className="py-12 border-y bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 text-center">
            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-primary">51 Itens</p>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Produtos Reais Cadastrados</p>
              <p className="text-[11px] text-muted-foreground">Sucos, pães, queijos, doces artesanais e chocolates</p>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">-85%</p>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Tempo de Cadastro com IA</p>
              <p className="text-[11px] text-muted-foreground">Tire uma foto do rótulo e a IA preenche o formulário</p>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-amber-600">0 Perdas</p>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">Alertas de Vencimento</p>
              <p className="text-[11px] text-muted-foreground">Monitoramento proativo de lotes que vencem em ≤ 15 dias</p>
            </div>
            <div className="p-4 space-y-1">
              <p className="text-3xl sm:text-4xl font-black text-primary">100%</p>
              <p className="text-xs uppercase tracking-wider font-bold text-muted-foreground">WhatsApp Integrado</p>
              <p className="text-[11px] text-muted-foreground">Pedidos do catálogo enviados prontos no WhatsApp da loja</p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Telas & Usabilidade (Apresentação Visual Completa) */}
      <section id="telas" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="default" className="bg-primary">Tour Visual do Sistema</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Veja as Telas Reais do MarketFlow em Ação
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
            Interface moderna e limpa, desenhada para máxima eficiência operacional no balcão, no depósito ou no celular.
          </p>
        </div>

        {/* Seletor de Abas de Telas */}
        <div className="flex flex-wrap items-center justify-center gap-2 border-b pb-4">
          {screens.map((s, idx) => (
            <button
              key={s.id}
              onClick={() => setActiveScreenIndex(idx)}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                activeScreenIndex === idx
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground'
              }`}
            >
              {s.title.split('(')[0].trim()}
            </button>
          ))}
        </div>

        {/* Detalhe da Tela Selecionada */}
        <div className="grid lg:grid-cols-12 gap-8 items-center pt-2">
          {/* Lado Esquerdo: Print em Alta Resolução */}
          <div className="lg:col-span-8">
            <div className="rounded-xl border bg-card p-2 sm:p-2.5 shadow-xl">
              <div className="rounded-lg overflow-hidden border bg-background">
                <div className="bg-muted/70 px-3.5 py-2 border-b flex items-center justify-between text-xs text-muted-foreground font-mono">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500/70" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/70" />
                  </div>
                  <span className="truncate max-w-[280px]">marketflow.app/admin/{activeScreen.id}</span>
                  <Badge variant="secondary" className="text-[10px] uppercase">{activeScreen.badge}</Badge>
                </div>
                <img
                  src={activeScreen.image}
                  alt={activeScreen.title}
                  className="w-full h-auto object-cover max-h-[560px]"
                />
              </div>
            </div>
          </div>

          {/* Lado Direito: Usabilidade & Benefícios da Tela */}
          <div className="lg:col-span-4 space-y-6">
            <div className="space-y-2">
              <Badge variant="outline" className="text-primary border-primary/30 font-bold uppercase text-[10px]">
                {activeScreen.badge}
              </Badge>
              <h3 className="text-2xl font-bold tracking-tight">{activeScreen.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeScreen.subtitle}
              </p>
            </div>

            <div className="space-y-3 pt-2">
              <p className="text-xs font-bold uppercase tracking-wider text-foreground">Destaques de Usabilidade:</p>
              <ul className="space-y-2.5 text-xs text-muted-foreground">
                {activeScreen.highlights.map((h, i) => (
                  <li key={i} className="flex items-start">
                    <CheckCircle2 className="w-4 h-4 mr-2 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="font-medium text-foreground">{h}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="pt-4 flex flex-col sm:flex-row gap-2.5">
              <Button size="sm" onClick={onNavigateSignup} className="w-full sm:w-auto font-bold text-xs">
                Experimentar Esta Tela <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
              </Button>
              {activeScreen.id === 'basket-builder' && (
                <Button size="sm" variant="outline" onClick={onNavigateCatalogDemo} className="w-full sm:w-auto text-xs">
                  Abrir Montador ao Vivo
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* 5. Módulos & Recursos Principais (`#recursos`) */}
      <section id="recursos" className="py-20 bg-muted/40 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="uppercase font-bold text-[10px]">Arquitetura Modular</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Tudo o Que Seu Comércio Precisa em Uma Única Ferramenta
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-2xl mx-auto">
              Chega de pagar múltiplos softwares para estoque, emissão de etiquetas e catálogo.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Card 1: Multi-tenant */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Multi-Empresas (Tenants)</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Gerencie matriz, filiais ou segmentos diferentes (ex: hortifruti, adega e presentes) na mesma conta, alternando com 1 clique no seletor de topo.
                </p>
              </CardContent>
            </Card>

            {/* Card 2: Controle de Validades */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold">
                  <CalendarDays className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Monitor de Validades & Lotes</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Identifique imediatamente lotes perecíveis que vencem em 3, 7 ou 15 dias. Evite prejuízos e programe promoções no tempo certo.
                </p>
              </CardContent>
            </Card>

            {/* Card 3: IA Multimodal */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Cadastro por Foto com IA</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Aponte a câmera para o rótulo do produto e a IA extrai nome, categoria, marca e código de barras, economizando até 85% do tempo de cadastro.
                </p>
              </CardContent>
            </Card>

            {/* Card 4: Etiquetas Térmicas */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-600 flex items-center justify-center font-bold">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Emissor de Etiquetas de Gôndola</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Imprima etiquetas de preço e código de barras padronizadas para gôndolas e prateleiras em folhas de etiquetas comuns ou impressoras térmicas.
                </p>
              </CardContent>
            </Card>

            {/* Card 5: Montador de Cestas & WhatsApp */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center font-bold">
                  <Store className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Catálogo & Cestas Personalizadas</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Vitrine pública para seus clientes montarem cestas de café da manhã ou kits de presentes com validação de regras e envio direto para o seu WhatsApp.
                </p>
              </CardContent>
            </Card>

            {/* Card 6: Controle RBAC & Usuários */}
            <Card className="hover:border-primary/50 transition-colors shadow-sm">
              <CardContent className="pt-6 space-y-3">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-foreground">Equipe & Permissões RBAC</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Convide colaboradores com papéis restritos: Administrador (acesso total), Estoquista (movimenta estoque) ou Leitura (somente consulta).
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* 6. IA Multimodal em Destaque (`#ia`) */}
      <section id="ia" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-6">
            <Badge variant="default" className="bg-purple-600">Inteligência Artificial Nativa</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Chega de Digitar Códigos de Barras e Descrições Manualmente
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
              O assistente visual do MarketFlow analisa a embalagem ou rótulo do produto via câmera do smartphone, reconhece o texto e dados técnicos, preenchendo automaticamente o formulário de cadastro.
            </p>

            <div className="space-y-3 text-xs">
              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Leitura de Código de Barras (EAN-13)</p>
                  <p className="text-muted-foreground">Identifica o número no código mesmo sob iluminação desfavorável.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Classificação Automática de Categoria</p>
                  <p className="text-muted-foreground">Sugere Bebidas, Laticínios, Pães ou Frios com base no fabricante e descrição.</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <div>
                  <p className="font-bold text-foreground">Controle Humano Sempre no Comando</p>
                  <p className="text-muted-foreground">O comerciante confere as sugestões da IA e ajusta os preços antes de salvar no banco.</p>
                </div>
              </div>
            </div>

            <Button onClick={onNavigateSignup} className="mt-2 font-bold text-xs">
              Testar Cadastro por Foto <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Demonstração visual do Assistente de IA */}
          <div className="rounded-2xl border bg-gradient-to-br from-card to-muted p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b pb-4">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-5 h-5 text-purple-600 animate-pulse" />
                <span className="font-bold text-sm">Leitura de Rótulo Concluída</span>
              </div>
              <Badge variant="success" className="bg-emerald-600 text-white text-[11px] font-bold">
                98% de Confiança
              </Badge>
            </div>

            <div className="space-y-3 bg-background rounded-xl border p-4 shadow-sm text-xs">
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground font-medium">Produto Detectado:</span>
                <span className="font-bold text-foreground">Suco Integral Aurora Uva 1 Litro</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground font-medium">Fabricante:</span>
                <span className="font-semibold text-foreground">Vinícola Aurora Bento Gonçalves</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground font-medium">Código EAN:</span>
                <span className="font-mono text-foreground font-semibold">7891141020015</span>
              </div>
              <div className="flex justify-between items-center border-b pb-2">
                <span className="text-muted-foreground font-medium">Categoria Sugerida:</span>
                <span className="font-semibold text-primary">Bebidas (Sucos & Néctares)</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-muted-foreground font-medium">Preço de Venda Sugerido:</span>
                <span className="font-bold text-emerald-600 text-sm">R$ 18,90</span>
              </div>
            </div>

            <div className="flex items-center justify-between text-[11px] text-muted-foreground italic">
              <span>* Baseado no modelo multimodal configurado no Supabase</span>
              <span className="text-primary font-semibold">Pronto para salvar!</span>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Comparativo: Planilha Manual vs. MarketFlow (`#comparativo`) */}
      <section id="comparativo" className="py-20 bg-muted/40 border-y">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="outline" className="uppercase font-bold text-[10px]">Comparativo Real</Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Por Que Abandonar Planilhas e Cadernos?
            </h2>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
              Veja a diferença de controle e segurança ao migrar para uma plataforma moderna.
            </p>
          </div>

          <div className="rounded-xl border bg-card overflow-hidden shadow-lg">
            <div className="grid grid-cols-3 bg-muted/80 p-4 border-b font-bold text-xs uppercase tracking-wider text-muted-foreground">
              <div>Funcionalidade / Processo</div>
              <div className="text-center text-rose-500">Planilhas & Caderno</div>
              <div className="text-center text-emerald-600">MarketFlow 2.0</div>
            </div>

            <div className="divide-y text-xs">
              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-foreground">Alertas de Vencimento de Produtos</span>
                <span className="text-center text-muted-foreground flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-500 mr-1" /> Manual / Facilmente esquecido
                </span>
                <span className="text-center font-bold text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-1" /> Alertas automáticos no painel
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-muted/20">
                <span className="font-semibold text-foreground">Tempo para Cadastrar Novo Item</span>
                <span className="text-center text-muted-foreground flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-500 mr-1" /> 3 a 5 minutos digitando
                </span>
                <span className="text-center font-bold text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-1" /> Segundos com foto e IA
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-foreground">Vitrine Online para Clientes</span>
                <span className="text-center text-muted-foreground flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-500 mr-1" /> Enviar PDF desatualizado
                </span>
                <span className="text-center font-bold text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-1" /> Link com estoque em tempo real
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center bg-muted/20">
                <span className="font-semibold text-foreground">Emissão de Etiquetas de Gôndola</span>
                <span className="text-center text-muted-foreground flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-500 mr-1" /> Fazer no Word / Manual
                </span>
                <span className="text-center font-bold text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-1" /> 1 clique em folha ou térmica
                </span>
              </div>

              <div className="grid grid-cols-3 p-4 items-center">
                <span className="font-semibold text-foreground">Segurança e Backup na Nuvem</span>
                <span className="text-center text-muted-foreground flex items-center justify-center">
                  <X className="w-4 h-4 text-rose-500 mr-1" /> Risco de perda de arquivo
                </span>
                <span className="text-center font-bold text-emerald-600 flex items-center justify-center">
                  <Check className="w-4 h-4 text-emerald-500 mr-1" /> PostgreSQL com replicação contínua
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 8. Planos (`#planos`) */}
      <section id="planos" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        <div className="text-center space-y-3">
          <Badge variant="default" className="bg-primary">Investimento Transparente</Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            Comece no Gratuito e Escale Conforme Crescer
          </h2>
          <p className="text-sm sm:text-base text-muted-foreground max-w-xl mx-auto">
            Sem pegadinhas, sem cobranças inesperadas. Escolha o plano perfeito para o seu negócio.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Plano 1: Grátis */}
          <Card className="border shadow-sm flex flex-col justify-between">
            <CardContent className="pt-6 space-y-6">
              <div>
                <Badge variant="outline" className="font-bold text-xs uppercase">Iniciante</Badge>
                <h3 className="text-xl font-bold mt-2">Plano Gratuito</h3>
                <p className="text-xs text-muted-foreground mt-1">Ideal para mercearias, padarias e pequenos negócios.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black">R$ 0 <span className="text-xs font-normal text-muted-foreground">/mês para sempre</span></div>
                <p className="text-[11px] text-emerald-600 font-semibold">Sem necessidade de cartão de crédito</p>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Até 3 empresas (lojas) cadastradas</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Até 100 produtos por loja</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Monitor completo de validades & lotes</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Catálogo público com pedidos WhatsApp</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Gerador de etiquetas de gôndola</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> 10 leituras com IA por mês</li>
              </ul>

              <Button variant="outline" className="w-full text-xs font-bold" onClick={onNavigateSignup}>
                Criar Conta Gratuita
              </Button>
            </CardContent>
          </Card>

          {/* Plano 2: Pro (Destaque) */}
          <Card className="border-2 border-primary shadow-2xl relative flex flex-col justify-between scale-105 bg-card">
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-[10px] font-black uppercase px-3 py-1 rounded-full tracking-wider shadow">
              Mais Recomendado
            </div>

            <CardContent className="pt-6 space-y-6">
              <div>
                <Badge variant="default" className="bg-primary font-bold text-xs uppercase">Profissional</Badge>
                <h3 className="text-xl font-bold mt-2">Crescimento Pro</h3>
                <p className="text-xs text-muted-foreground mt-1">Para lojas ativas com alto giro de estoque e catálogo movimentado.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black text-primary">R$ 49 <span className="text-xs font-normal text-muted-foreground">/mês</span></div>
                <p className="text-[11px] text-muted-foreground">Cobrado mensalmente • Cancele quando quiser</p>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center font-medium text-foreground"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> <strong>Empresas ilimitadas</strong> na mesma conta</li>
                <li className="flex items-center font-medium text-foreground"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> <strong>Produtos ilimitados</strong></li>
                <li className="flex items-center font-medium text-foreground"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> <strong>Leituras ilimitadas com IA</strong></li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> Controle de lotes com cálculo de dias</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> Catálogo digital personalizado</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> Relatórios operacionais e margens</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-primary shrink-0" /> Suporte prioritário via WhatsApp</li>
              </ul>

              <Button className="w-full text-xs font-bold shadow-md" size="lg" onClick={onNavigateSignup}>
                Iniciar Teste Grátis de 14 Dias
              </Button>
            </CardContent>
          </Card>

          {/* Plano 3: Redes e Franquias */}
          <Card className="border shadow-sm flex flex-col justify-between">
            <CardContent className="pt-6 space-y-6">
              <div>
                <Badge variant="outline" className="font-bold text-xs uppercase">Corporativo</Badge>
                <h3 className="text-xl font-bold mt-2">Redes & Franquias</h3>
                <p className="text-xs text-muted-foreground mt-1">Para operações com múltiplas lojas, equipe grande e integração externa.</p>
              </div>

              <div className="space-y-1">
                <div className="text-3xl font-black">R$ 129 <span className="text-xs font-normal text-muted-foreground">/mês</span></div>
                <p className="text-[11px] text-muted-foreground">Multi-usuários avançado</p>
              </div>

              <ul className="space-y-2.5 text-xs text-muted-foreground">
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Tudo do Plano Pro</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Usuários ilimitados com perfis RBAC</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Acesso à API REST & Webhooks</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Auditoria detalhada de ações</li>
                <li className="flex items-center"><Check className="w-4 h-4 mr-2 text-emerald-500 shrink-0" /> Treinamento e implantação assistida</li>
              </ul>

              <Button variant="outline" className="w-full text-xs font-bold" onClick={onNavigateSignup}>
                Falar com Especialista
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 9. FAQ (`#faq`) */}
      <section id="faq" className="py-20 bg-muted/30 border-y">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="text-center space-y-3">
            <Badge variant="secondary" className="uppercase font-bold text-[10px]">Tire Suas Dúvidas</Badge>
            <h2 className="text-3xl font-extrabold tracking-tight">Perguntas Frequentes</h2>
            <p className="text-sm text-muted-foreground">
              Tudo o que você precisa saber sobre o MarketFlow antes de começar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((f, i) => (
              <div
                key={i}
                className="rounded-xl border bg-card p-4 transition-all cursor-pointer shadow-sm"
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
              >
                <div className="flex items-center justify-between font-bold text-sm">
                  <span>{f.question}</span>
                  <span className="text-primary text-base ml-2">
                    {openFaq === i ? '−' : '+'}
                  </span>
                </div>
                {openFaq === i && (
                  <p className="pt-3 text-xs text-muted-foreground leading-relaxed border-t mt-3">
                    {f.answer}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 10. CTA Final */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl sm:text-5xl font-black tracking-tight">
            Pronto para Modernizar a Gestão do Seu Comércio Hoje?
          </h2>
          <p className="text-base text-muted-foreground">
            Crie sua conta em menos de 1 minuto, explore os 51 produtos reais pré-configurados e veja como é fácil gerenciar validades, imprimir etiquetas e vender online.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button size="lg" onClick={onNavigateSignup} className="w-full sm:w-auto h-13 px-8 text-sm font-bold shadow-xl">
            Criar Minha Conta Grátis <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button size="lg" variant="outline" onClick={onNavigateLogin} className="w-full sm:w-auto h-13 px-8 text-sm font-semibold">
            Já Tenho Uma Conta • Fazer Login
          </Button>
        </div>
      </section>

      {/* 11. Footer Completo */}
      <footer className="border-t bg-muted/50 py-12 text-xs text-muted-foreground mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="space-y-3 col-span-2 md:col-span-1">
              <div className="flex items-center space-x-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground font-black text-sm">
                  M
                </div>
                <span className="font-extrabold text-foreground text-sm">MarketFlow</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                Plataforma SaaS de gestão inteligente para pequenos e médios mercados, adegas, padarias e lojas de conveniência.
              </p>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">Módulos</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><a href="#telas" className="hover:text-primary transition-colors">Controle de Validades</a></li>
                <li><a href="#telas" className="hover:text-primary transition-colors">Gestão de Lotes & Kardex</a></li>
                <li><a href="#telas" className="hover:text-primary transition-colors">Gerador de Etiquetas</a></li>
                <li><a href="#telas" className="hover:text-primary transition-colors">Montador de Cestas</a></li>
                <li><a href="#telas" className="hover:text-primary transition-colors">Vitrine Digital WhatsApp</a></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">Tecnologia</p>
              <ul className="space-y-1.5 text-[11px]">
                <li><span className="text-foreground font-medium">PostgreSQL & Supabase</span></li>
                <li><span className="text-foreground font-medium">Row Level Security (RLS)</span></li>
                <li><span className="text-foreground font-medium">IA Multimodal Vision</span></li>
                <li><span className="text-foreground font-medium">20 Temas Visuais & i18n</span></li>
                <li><span className="text-foreground font-medium">Hospedagem GitHub Pages</span></li>
              </ul>
            </div>

            <div className="space-y-2.5">
              <p className="font-bold text-foreground uppercase tracking-wider text-[10px]">Acesso Rápido</p>
              <ul className="space-y-1.5 text-[11px]">
                <li>
                  <button onClick={onNavigateLogin} className="hover:text-primary transition-colors">
                    Entrar na Plataforma
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateSignup} className="hover:text-primary transition-colors">
                    Criar Conta Gratuita
                  </button>
                </li>
                <li>
                  <button onClick={onNavigateCatalogDemo} className="hover:text-primary transition-colors">
                    Ver Loja Demonstrativa
                  </button>
                </li>
                <li>
                  <a
                    href="https://github.com/pycriador/olivelas-marketflow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-primary transition-colors inline-flex items-center"
                  >
                    Repositório no GitHub <ArrowUpRight className="w-3 h-3 ml-1" />
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px]">
            <p>© 2026 Olivelas MarketFlow. Todos os direitos reservados.</p>
            <p className="text-muted-foreground font-mono">Construído com React, TypeScript, Tailwind CSS e Supabase.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
