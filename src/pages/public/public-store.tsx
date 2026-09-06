import React, { useState } from 'react';
import { Store, Search, MessageSquare, Phone, MapPin, Tag, ArrowLeft, Coffee, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { formatCurrency } from '../../lib/utils';
import { dataStore } from '../../lib/data-store';
import { Product } from '../../types';
import { REAL_COMPANY } from '../../lib/real-basket-data';

export const PublicStorePage: React.FC<{
  slug?: string;
  productId?: string;
  onBackToAdmin?: () => void;
  onNavigateBasket?: () => void;
  onSelectProduct?: (product: Product) => void;
  onCloseProduct?: () => void;
}> = ({
  slug = 'mercado-central',
  productId,
  onBackToAdmin,
  onNavigateBasket,
  onSelectProduct,
  onCloseProduct,
}) => {
  // Ler do localStorage se disponível para refletir edições em tempo real
  const localCompanies = typeof window !== 'undefined'
    ? JSON.parse(localStorage.getItem('marketflow_all_companies') || 'null')
    : null;
  const companiesList = localCompanies || [REAL_COMPANY];
  const company = companiesList.find((c: any) => c.slug === slug) || companiesList[0];

  const products = dataStore.getProducts(company.id).filter(p => p.active && p.catalog_visible);
  const categories = dataStore.getCategories(company.id).filter(c => c.active);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState('all');

  // Produto em destaque selecionado via URL ou clique
  const activeProduct = productId
    ? products.find(p => p.id === productId)
    : null;

  const isBasketEnabled = !!company.breakfast_basket_enabled || company.slug === 'cestas-cafe-da-manha';

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesCat = selectedCat === 'all' || p.category_id === selectedCat;
    return matchesSearch && matchesCat;
  });

  const getWhatsappLink = (productName?: string) => {
    const num = (company.whatsapp || company.phone || '5511963820374').replace(/\D/g, '');
    const msg = productName
      ? `Olá! Gostaria de consultar a disponibilidade do produto "${productName}".`
      : `Olá! Gostaria de informações sobre a loja ${company.name}.`;
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

      {/* Header Público da Loja */}
      <header className="border-b bg-card shadow-sm sticky top-0 z-20">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow">
              {isBasketEnabled ? <Coffee className="h-6 w-6" /> : <Store className="h-6 w-6" />}
            </div>
            <div>
              <h1 className="text-xl font-bold text-foreground">{company.name}</h1>
              <p className="text-xs text-muted-foreground">{company.subtitulo || company.description || 'Vitrine Digital de Produtos'}</p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {isBasketEnabled && onNavigateBasket && (
              <Button
                onClick={onNavigateBasket}
                className="bg-amber-600 hover:bg-amber-700 text-white font-semibold shadow-sm"
              >
                <Coffee className="mr-2 h-4 w-4" />
                Monte sua Cesta
              </Button>
            )}
            <a
              href={getWhatsappLink()}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-2 bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors shadow-sm"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Falar no WhatsApp</span>
            </a>
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
        {/* Barra de Pesquisa e Filtro de Categorias */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Pesquisar produto na vitrine..."
              className="pl-10 h-12 text-base rounded-xl border-muted-foreground/20 shadow-sm"
            />
          </div>

          {/* Categorias Pills */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedCat('all')}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                selectedCat === 'all'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-muted-foreground hover:bg-accent'
              }`}
            >
              Todos os Produtos
            </button>
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCat === cat.id
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-muted text-muted-foreground hover:bg-accent'
                }`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>

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

      {/* Footer Público */}
      <footer className="border-t bg-card mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>© 2026 {company.name} — Desenvolvido com MarketFlow</p>
      </footer>
    </div>
  );
};
