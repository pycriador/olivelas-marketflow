import React, { useState, useEffect } from 'react';
import {
  Store,
  Search,
  MessageSquare,
  Phone,
  MapPin,
  Tag,
  ArrowLeft,
  Coffee,
  Sparkles,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Card } from '../../components/ui/card';
import { formatCurrency } from '../../lib/utils';
import { dataStore } from '../../lib/data-store';
import { Product } from '../../types';
import { REAL_COMPANY } from '../../lib/real-basket-data';
import { DropdownFilterMenu } from '../../components/ui/dropdown-filter-menu';

export const PublicStorePage: React.FC<{
  slug?: string;
  productId?: string;
  onBackToAdmin?: () => void;
  onNavigateBasket?: () => void;
  onNavigateStore?: (slug: string) => void;
  onSelectProduct?: (product: Product) => void;
  onCloseProduct?: () => void;
}> = ({
  slug = 'mercado-central',
  productId,
  onBackToAdmin,
  onNavigateBasket,
  onNavigateStore,
  onSelectProduct,
  onCloseProduct,
}) => {
  const companiesList = dataStore.getCompanies();
  const company = (slug ? dataStore.getCompanyBySlug(slug) : null) || companiesList[0] || REAL_COMPANY;

  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false);

  // Produtos e categorias da loja ativa
  const products = dataStore.getProducts(company.id).filter(p => p.active && p.catalog_visible);
  const categories = dataStore.getCategories(company.id).filter(c => c.active);

  // Parâmetros de busca e filtros
  const initialParams = new URLSearchParams(window.location.search);
  const [search, setSearch] = useState(initialParams.get('search') || '');
  const [selectedCat, setSelectedCat] = useState(initialParams.get('category') || 'all');
  const [offerFilter, setOfferFilter] = useState(initialParams.get('offer') || 'all');
  const [orderFilter, setOrderFilter] = useState(initialParams.get('order') || 'default');

  const isBasketEnabled = !!company.breakfast_basket_enabled || company.slug === 'cestas-cafe-da-manha';

  // Sincronização via URL
  const updateUrlParams = (newSearch: string, newCat: string, newOffer: string, newOrder: string) => {
    const params = new URLSearchParams();
    if (newSearch) params.set('search', newSearch);
    if (newCat !== 'all') params.set('category', newCat);
    if (newOffer !== 'all') params.set('offer', newOffer);
    if (newOrder !== 'default') params.set('order', newOrder);

    const query = params.toString() ? `?${params.toString()}` : '';
    const targetUrl = `${window.location.pathname}${query}`;
    window.history.pushState({}, '', targetUrl);
  };

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setSearch(params.get('search') || '');
      setSelectedCat(params.get('category') || 'all');
      setOfferFilter(params.get('offer') || 'all');
      setOrderFilter(params.get('order') || 'default');
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleSearchChange = (val: string) => {
    setSearch(val);
    updateUrlParams(val, selectedCat, offerFilter, orderFilter);
  };

  const handleCatChange = (val: string) => {
    setSelectedCat(val);
    updateUrlParams(search, val, offerFilter, orderFilter);
  };

  const handleOfferChange = (val: string) => {
    setOfferFilter(val);
    updateUrlParams(search, selectedCat, val, orderFilter);
  };

  const handleOrderChange = (val: string) => {
    setOrderFilter(val);
    updateUrlParams(search, selectedCat, offerFilter, val);
  };

  // Produto em destaque selecionado via URL ou clique
  const activeProduct = productId
    ? products.find(p => p.id === productId)
    : null;

  // Filtragem e Ordenação
  const filteredProducts = products.filter(p => {
    const matchesSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.sku && p.sku.toLowerCase().includes(search.toLowerCase())) ||
      (p.description && p.description.toLowerCase().includes(search.toLowerCase()));

    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;

    let matchesOffer = true;
    if (offerFilter === 'offers') {
      matchesOffer = !!p.promotional_price && p.promotional_price < p.sale_price;
    } else if (offerFilter === 'with_price') {
      matchesOffer = !!p.show_price && p.sale_price > 0;
    }

    return matchesSearch && matchesCat && matchesOffer;
  }).sort((a, b) => {
    if (orderFilter === 'price_asc') {
      const priceA = a.promotional_price || a.sale_price;
      const priceB = b.promotional_price || b.sale_price;
      return priceA - priceB;
    }
    if (orderFilter === 'price_desc') {
      const priceA = a.promotional_price || a.sale_price;
      const priceB = b.promotional_price || b.sale_price;
      return priceB - priceA;
    }
    if (orderFilter === 'name_asc') {
      return a.name.localeCompare(b.name);
    }
    return 0;
  });

  const getWhatsappLink = (productName?: string) => {
    const num = (company.whatsapp || company.phone || '5511963820374').replace(/\D/g, '');
    const msg = productName
      ? `Olá! Estou na vitrine da loja *${company.name}* (@${company.slug}) e gostaria de consultar a disponibilidade do produto "${productName}".`
      : `Olá! Estou na vitrine digital da loja *${company.name}* (@${company.slug}) e gostaria de mais informações.`;
    return `https://wa.me/${num}?text=${encodeURIComponent(msg)}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Botão de Retorno para o Painel Admin se acessado via preview */}
      {onBackToAdmin && (
        <div className="bg-muted px-4 py-2 border-b flex items-center justify-between text-xs text-muted-foreground">
          <span>Modo Pré-visualização da Vitrine Digital Pública</span>
          <Button variant="ghost" size="sm" onClick={onBackToAdmin} className="h-7 text-xs">
            <ArrowLeft className="mr-1 h-3.5 w-3.5" /> Voltar ao Painel Admin
          </Button>
        </div>
      )}

      {/* Header Público com Identificação Clara da Loja */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-xs">
              {isBasketEnabled ? <Coffee className="h-6 w-6" /> : <Store className="h-6 w-6" />}
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-xl font-bold text-foreground leading-tight">{company.name}</h1>
                <Badge variant="outline" className="text-[10px] px-2 py-0 border-primary/30 text-primary font-mono">
                  @{company.slug}
                </Badge>
                <Badge variant="secondary" className="text-[10px] font-mono py-0">
                  ID: {company.id}
                </Badge>
                <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-500/30 bg-emerald-500/10 hidden sm:inline-flex">
                  <ShieldCheck className="h-3 w-3 mr-0.5 inline" /> Loja Verificada
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                {company.subtitulo || company.description || 'Vitrine Digital Oficial de Produtos credenciada na plataforma MarketFlow'}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end sm:self-auto">
            {/* Seletor Dropdown de Lojas da Plataforma */}
            {companiesList.length > 1 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
                  className="h-9 text-xs font-medium border-dashed flex items-center space-x-1"
                >
                  <Store className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>Outras Lojas ({companiesList.length})</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${storeSwitcherOpen ? 'rotate-180' : ''}`} />
                </Button>

                {storeSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Lojas na Plataforma MarketFlow
                    </p>
                    <div className="space-y-1 mt-1">
                      {companiesList.map(c => (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => {
                            setStoreSwitcherOpen(false);
                            onNavigateStore?.(c.slug);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-lg text-xs flex items-center justify-between transition-colors ${
                            c.slug === company.slug
                              ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                              : 'hover:bg-muted text-foreground'
                          }`}
                        >
                          <div className="truncate pr-2">
                            <p className="font-semibold truncate">{c.name}</p>
                            <p className={`text-[10px] font-mono truncate ${c.slug === company.slug ? 'text-primary-foreground/80' : 'text-muted-foreground'}`}>
                              @{c.slug} • ID: {c.id}
                            </p>
                          </div>
                          {c.slug === company.slug && <Check className="h-4 w-4 shrink-0" />}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {isBasketEnabled && onNavigateBasket && (
              <Button
                onClick={onNavigateBasket}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-xs h-9 text-xs"
              >
                <Coffee className="mr-1.5 h-4 w-4" />
                Monte sua Cesta
              </Button>
            )}

            <a
              href={getWhatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1.5 bg-emerald-600 text-white px-3.5 py-2 rounded-lg text-xs font-semibold hover:bg-emerald-700 transition-colors shadow-xs h-9"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Falar no WhatsApp</span>
            </a>
          </div>
        </div>

        {/* Faixa de Informações Institucionais da Loja */}
        <div className="border-t bg-muted/30 px-4 py-1.5 text-[11px] text-muted-foreground">
          <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center">
                <Building2 className="h-3 w-3 mr-1 text-primary" />
                Unidade: <strong className="ml-1 text-foreground">{company.name}</strong>
              </span>
              {company.cnpj && (
                <span>CNPJ: <strong className="text-foreground font-mono">{company.cnpj}</strong></span>
              )}
              {company.phone && (
                <span className="flex items-center">
                  <Phone className="h-3 w-3 mr-1" />
                  {company.phone}
                </span>
              )}
            </div>
            <div className="flex items-center space-x-2 font-medium">
              <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-emerald-700 dark:text-emerald-400">Atendimento Online Disponível</span>
            </div>
          </div>
        </div>
      </header>

      {/* Banner de Cesta de Café da Manhã Interativa */}
      {isBasketEnabled && onNavigateBasket && (
        <div className="bg-gradient-to-r from-amber-500/15 via-orange-500/10 to-amber-500/15 border-b border-amber-500/20 py-4 px-4">
          <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 bg-amber-500/20 text-amber-600 rounded-xl">
                <Coffee className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h2 className="text-base font-bold text-foreground">Monte sua Cesta Personalizada</h2>
                  <Badge variant="outline" className="border-amber-500/40 text-amber-700 bg-amber-500/10 text-[10px]">
                    Interativo
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">
                  Escolha o tamanho da cesta (Pequena, Média ou Grande), selecione seus itens favoritos e envie direto para o WhatsApp!
                </p>
              </div>
            </div>
            <Button
              onClick={onNavigateBasket}
              className="w-full sm:w-auto bg-amber-600 hover:bg-amber-700 text-white font-bold px-6 shadow-sm"
            >
              <Sparkles className="mr-2 h-4 w-4" />
              Montar Minha Cesta Agora
            </Button>
          </div>
        </div>
      )}

      {/* Conteúdo Principal */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Barra de Pesquisa e Menu Dropdown de Filtros (Padrão das telas de Administração) */}
        <Card className="p-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => handleSearchChange(e.target.value)}
                placeholder="Pesquisar por nome do produto, SKU ou descrição na vitrine..."
                className="pl-10 h-10 text-sm"
              />
            </div>

            <div className="flex items-center space-x-2 shrink-0">
              <DropdownFilterMenu
                groups={[
                  {
                    id: 'category',
                    title: 'Categorias de Produtos',
                    selectedValue: selectedCat,
                    onChange: handleCatChange,
                    options: [
                      { id: 'all', label: 'Todas as Categorias', badge: products.length },
                      ...categories.map(c => ({
                        id: c.id,
                        label: c.name,
                        badge: products.filter(p => p.category_id === c.id).length,
                      })),
                    ],
                  },
                  {
                    id: 'offer',
                    title: 'Ofertas & Preço',
                    selectedValue: offerFilter,
                    onChange: handleOfferChange,
                    options: [
                      { id: 'all', label: 'Todos os Produtos' },
                      { id: 'offers', label: 'Apenas Ofertas / Promoções' },
                      { id: 'with_price', label: 'Apenas com Preço Visível' },
                    ],
                  },
                  {
                    id: 'order',
                    title: 'Ordenação',
                    selectedValue: orderFilter,
                    onChange: handleOrderChange,
                    options: [
                      { id: 'default', label: 'Ordem Padrão' },
                      { id: 'price_asc', label: 'Menor Preço' },
                      { id: 'price_desc', label: 'Maior Preço' },
                      { id: 'name_asc', label: 'Nome (A - Z)' },
                    ],
                  },
                ]}
                onResetAll={() => {
                  setSearch('');
                  setSelectedCat('all');
                  setOfferFilter('all');
                  setOrderFilter('default');
                  updateUrlParams('', 'all', 'all', 'default');
                }}
              />
            </div>
          </div>

          {/* Chips de Filtros Ativos */}
          {(selectedCat !== 'all' || offerFilter !== 'all' || orderFilter !== 'default' || search) && (
            <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t text-xs">
              <span className="text-muted-foreground text-[11px]">Filtros aplicados:</span>
              {selectedCat !== 'all' && (
                <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                  <span>Categoria: {categories.find(c => c.id === selectedCat)?.name || selectedCat}</span>
                  <button onClick={() => handleCatChange('all')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {offerFilter !== 'all' && (
                <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                  <span>{offerFilter === 'offers' ? 'Apenas Ofertas' : 'Com Preço'}</span>
                  <button onClick={() => handleOfferChange('all')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {orderFilter !== 'default' && (
                <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                  <span>
                    Ordem: {orderFilter === 'price_asc' ? 'Menor Preço' : orderFilter === 'price_desc' ? 'Maior Preço' : 'Nome (A-Z)'}
                  </span>
                  <button onClick={() => handleOrderChange('default')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              {search && (
                <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                  <span>Busca: "{search}"</span>
                  <button onClick={() => handleSearchChange('')} className="ml-1 hover:text-destructive">×</button>
                </Badge>
              )}
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCat('all');
                  setOfferFilter('all');
                  setOrderFilter('default');
                  updateUrlParams('', 'all', 'all', 'default');
                }}
                className="text-[11px] text-primary hover:underline ml-1"
              >
                Limpar todos
              </button>
            </div>
          )}
        </Card>

        {/* Grid de Produtos */}
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border border-dashed rounded-xl">
            <Store className="h-12 w-12 mb-3 opacity-40" />
            <p className="font-semibold text-base">Nenhum produto disponível no momento</p>
            <p className="text-xs">Tente buscar por outro termo ou selecione outra categoria.</p>
          </div>
        ) : (
          <div className="grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {filteredProducts.map(product => (
              <div
                key={product.id}
                onClick={() => onSelectProduct?.(product)}
                className="flex flex-col justify-between rounded-xl border bg-card overflow-hidden shadow-sm hover:shadow-md transition-shadow group cursor-pointer"
              >
                <div className="relative aspect-square w-full bg-muted overflow-hidden">
                  {product.image_url ? (
                    <img
                      src={product.image_url}
                      alt={product.name}
                      className="h-full w-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                        <Store className="h-10 w-10 opacity-30" />
                      </div>
                    )}
                    {product.promotional_price && (
                      <span className="absolute top-2 left-2 bg-destructive text-destructive-foreground text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
                        Oferta
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-muted-foreground block mb-0.5">ID: {product.id}</span>
                      <h3 className="font-semibold text-sm line-clamp-2 text-foreground group-hover:text-primary transition-colors">{product.name}</h3>
                      {product.description && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-1">{product.description}</p>
                      )}
                    </div>

                    <div className="pt-2 border-t flex flex-col space-y-3">
                      <div>
                        {product.show_price ? (
                          <div>
                            {product.promotional_price ? (
                              <div>
                                <span className="text-base font-bold text-destructive font-mono">
                                  {formatCurrency(product.promotional_price)}
                                </span>
                                <span className="text-xs line-through text-muted-foreground ml-1.5 font-mono">
                                  {formatCurrency(product.sale_price)}
                                </span>
                              </div>
                            ) : (
                              <span className="text-base font-bold text-foreground font-mono">
                                {formatCurrency(product.sale_price)}
                              </span>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground italic">Preço sob consulta</span>
                        )}
                      </div>

                      {product.allow_contact && (
                        <a
                          href={getWhatsappLink(product.name)}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          className="w-full inline-flex items-center justify-center space-x-1.5 bg-primary/10 text-primary hover:bg-primary/20 font-semibold text-xs py-2 rounded-lg transition-colors"
                        >
                          <MessageSquare className="h-3.5 w-3.5" />
                          <span>Pedir no Whats</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal de Detalhes do Produto Selecionado com URL Única (/loja/:slug/produto/:productId) */}
      {activeProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-in fade-in">
          <div className="relative w-full max-w-lg rounded-2xl bg-card border shadow-2xl overflow-hidden p-6 space-y-5 animate-in zoom-in-95">
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <Badge variant="outline" className="text-[10px] font-semibold text-primary border-primary/30">
                    {company.name}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">Loja ID: {company.id}</span>
                </div>
                <span className="text-xs font-mono text-muted-foreground">URL Exclusiva: /loja/{slug}/produto/{activeProduct.id}</span>
                <h3 className="text-xl font-bold text-foreground mt-1">{activeProduct.name}</h3>
                <span className="text-xs text-muted-foreground">ID do Produto: <strong className="font-mono text-foreground">{activeProduct.id}</strong></span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onCloseProduct}
                className="h-8 w-8 p-0 rounded-full"
              >
                ✕
              </Button>
            </div>

            {activeProduct.image_url && (
              <div className="w-full aspect-video rounded-xl bg-muted overflow-hidden">
                <img src={activeProduct.image_url} alt={activeProduct.name} className="w-full h-full object-cover" />
              </div>
            )}

            {activeProduct.description && (
              <p className="text-sm text-muted-foreground leading-relaxed">
                {activeProduct.description}
              </p>
            )}

            <div className="flex items-center justify-between p-4 rounded-xl bg-muted/50 border">
              <div>
                <span className="text-xs text-muted-foreground block">Preço</span>
                <span className="text-2xl font-bold font-mono text-foreground">
                  {formatCurrency(activeProduct.promotional_price || activeProduct.sale_price)}
                </span>
                {activeProduct.promotional_price && (
                  <span className="text-xs line-through text-muted-foreground ml-2 font-mono">
                    {formatCurrency(activeProduct.sale_price)}
                  </span>
                )}
              </div>
              <Badge variant="outline" className="text-xs font-mono">UN: {activeProduct.unit}</Badge>
            </div>

            <div className="flex items-center space-x-3 pt-2">
              <a
                href={getWhatsappLink(activeProduct.name)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center space-x-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-4 rounded-xl shadow-sm transition-colors"
              >
                <MessageSquare className="h-4 w-4" />
                <span>Pedir este Produto no WhatsApp</span>
              </a>
              <Button
                variant="outline"
                onClick={onCloseProduct}
                className="rounded-xl py-3"
              >
                Fechar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Footer Público com Identificação da Loja */}
      <footer className="border-t bg-card mt-12 py-8 text-center text-xs text-muted-foreground">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 font-mono text-[11px]">
            <span><strong>Loja:</strong> {company.name} (@{company.slug})</span>
            <span>•</span>
            <span><strong>ID da Loja:</strong> {company.id}</span>
            {company.cnpj && (
              <>
                <span>•</span>
                <span><strong>CNPJ:</strong> {company.cnpj}</span>
              </>
            )}
            {company.whatsapp && (
              <>
                <span>•</span>
                <span><strong>WhatsApp:</strong> {company.whatsapp}</span>
              </>
            )}
          </div>
          <p>© 2026 {company.name} — Desenvolvido com MarketFlow</p>
        </div>
      </footer>
    </div>
  );
};
