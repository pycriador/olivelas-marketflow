import React from 'react';
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
  MessageSquare
} from 'lucide-react';

export const LandingPage: React.FC<{
  onNavigateLogin: () => void;
  onNavigateCatalogDemo: () => void;
}> = ({ onNavigateLogin, onNavigateCatalogDemo }) => {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground font-black text-xl shadow">
              M
            </div>
            <span className="text-lg font-bold tracking-tight">MarketFlow</span>
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium text-muted-foreground">
            <a href="#recursos" className="hover:text-foreground transition-colors">Recursos</a>
            <a href="#ia" className="hover:text-foreground transition-colors">Inteligência Artificial</a>
            <a href="#catalogo" className="hover:text-foreground transition-colors">Catálogo Digital</a>
            <a href="#planos" className="hover:text-foreground transition-colors">Planos</a>
            <a href="#faq" className="hover:text-foreground transition-colors">FAQ</a>
          </nav>

          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onNavigateLogin}>
              Entrar
            </Button>
            <Button size="sm" onClick={onNavigateLogin}>
              Criar Conta Grátis
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-16 md:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <div className="inline-flex items-center space-x-2 bg-primary/10 text-primary border border-primary/20 px-3.5 py-1.5 rounded-full text-xs font-semibold">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Gestão Inteligente com IA para Pequenos Comércios</span>
        </div>

        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight max-w-4xl mx-auto leading-tight">
          Digitalize seu mercado e elimine planilhas em poucos minutos.
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
          Controle produtos, preços, validade de lotes e catálogo online público utilizando Inteligência Artificial para acelerar cadastros.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <Button size="lg" onClick={onNavigateLogin} className="w-full sm:w-auto h-12 px-8 text-base">
            Começar Grátis Agora <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button size="lg" variant="outline" onClick={onNavigateCatalogDemo} className="w-full sm:w-auto h-12 px-8 text-base">
            <Store className="mr-2 h-5 w-5" /> Ver Vitrine de Demonstração
          </Button>
        </div>
      </section>

      {/* Recursos Principais */}
      <section id="recursos" className="py-16 bg-muted/40 border-y">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Tudo o que seu comércio precisa em um só lugar</h2>
            <p className="text-muted-foreground text-sm max-w-xl mx-auto">
              Projetado para ser simples, rápido e mobile-first para quem opera a loja pelo celular.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Package className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Cadastro Rápido de Produtos</h3>
                <p className="text-sm text-muted-foreground">
                  Organize categorias, marcas, código de barras e preços de custo e venda com margem calculada.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Boxes className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Controle de Estoque & Lotes</h3>
                <p className="text-sm text-muted-foreground">
                  Alertas automáticos de estoque baixo e monitoramento de validades para evitar perda de mercadorias.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6 space-y-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Store className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold">Catálogo Digital Grátis</h3>
                <p className="text-sm text-muted-foreground">
                  Sua vitrine online exclusiva para clientes consultarem preços e fazerem pedidos via WhatsApp.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Seção IA */}
      <section id="ia" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          <div className="space-y-4">
            <Badge variant="default" className="bg-primary">IA Integrada</Badge>
            <h2 className="text-3xl font-bold tracking-tight">Cadastre produtos tirando apenas uma foto</h2>
            <p className="text-muted-foreground text-sm">
              Nossa IA lê rótulos, identifica o nome, fabricante, categoria e código de barras, gerando a sugestão para você revisar e salvar em segundos.
            </p>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Leitura automática de rótulos e EAN
              </li>
              <li className="flex items-center text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Exibição da porcentagem de confiança da leitura
              </li>
              <li className="flex items-center text-foreground font-medium">
                <CheckCircle2 className="h-4 w-4 mr-2 text-success" /> O comerciante mantém sempre o controle final
              </li>
            </ul>
          </div>
          <div className="rounded-xl border bg-card p-6 shadow-lg space-y-4">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase text-muted-foreground">Demonstração da IA</span>
              <Badge variant="success">94% Confiança</Badge>
            </div>
            <div className="space-y-2">
              <p className="text-sm font-bold text-foreground">Refrigerante Guaraná Antarctica 2L</p>
              <p className="text-xs text-muted-foreground font-mono">EAN: 7891000123456 • Categoria: Bebidas</p>
            </div>
            <Button className="w-full" size="sm" onClick={onNavigateLogin}>
              Testar Assistente de IA
            </Button>
          </div>
        </div>
      </section>

      {/* Planos */}
      <section id="planos" className="py-16 bg-muted/40 border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <h2 className="text-3xl font-bold tracking-tight">Plano Gratuito Inicial</h2>
            <p className="text-muted-foreground text-sm">Comece sem cartão de crédito.</p>
          </div>

          <div className="max-w-md mx-auto">
            <Card className="border-2 border-primary shadow-xl">
              <CardContent className="pt-6 space-y-6">
                <div className="text-center space-y-2">
                  <Badge variant="default" className="bg-primary">Plano Gratuito</Badge>
                  <div className="text-4xl font-extrabold">R$ 0 <span className="text-sm font-normal text-muted-foreground">/mês</span></div>
                </div>

                <ul className="space-y-3 text-sm">
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Até 3 empresas por conta</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Até 100 produtos por empresa</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Controle de estoque e validades</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-success" /> Vitrine do Catálogo Público</li>
                  <li className="flex items-center"><CheckCircle2 className="h-4 w-4 mr-2 text-success" /> IA para cadastro por foto</li>
                </ul>

                <Button size="lg" className="w-full" onClick={onNavigateLogin}>
                  Criar Minha Conta Grátis
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8 text-center text-xs text-muted-foreground mt-auto">
        <p>© 2026 MarketFlow — Plataforma SaaS para Gestão Inteligente de Pequenos Comércios</p>
      </footer>
    </div>
  );
};
