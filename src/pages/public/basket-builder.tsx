import React, { useState, useMemo } from 'react';
import {
  Coffee,
  Check,
  Plus,
  Minus,
  Send,
  ArrowLeft,
  AlertCircle,
  ShoppingBag,
  Sparkles,
  Store,
  Info,
  ChevronRight,
  ChevronDown,
  Building2,
  Phone,
  Search,
  CheckCircle2,
  Tag,
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { OFFICIAL_BREAKFAST_BASKET_JSON } from '../../lib/real-basket-data';
import { BasketSize, BasketProductItem } from '../../types';
import { dataStore } from '../../lib/data-store';
import { DropdownFilterMenu } from '../../components/ui/dropdown-filter-menu';

interface BasketBuilderProps {
  slug?: string;
  onBackToStore?: () => void;
  onNavigateStore?: (slug: string) => void;
  whatsappNumber?: string;
  storeName?: string;
}

export const BasketBuilderPage: React.FC<BasketBuilderProps> = ({
  slug,
  onBackToStore,
  onNavigateStore,
  whatsappNumber = '5511963820374',
  storeName = 'Cestas de Café da Manhã',
}) => {
  const companies = dataStore.getCompanies();
  const company = (slug ? dataStore.getCompanyBySlug(slug) : null) || companies[0];
  const effectiveStoreName = company?.name || storeName;
  const effectiveWhatsapp = company?.whatsapp || company?.phone || whatsappNumber;

  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<BasketSize>(OFFICIAL_BREAKFAST_BASKET_JSON.tamanhos[1]); // Média default

  // Filtros de Cardápio via Dropdown
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [priceFilter, setPriceFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Quantidade de cada item selecionado { [itemId]: quantidade }
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Obter todos os itens em mapa plano
  const allItemsMap = useMemo(() => {
    const map: Record<string, BasketProductItem & { categoryId: string; categoryName: string; contaNoLimite: boolean }> = {};
    OFFICIAL_BREAKFAST_BASKET_JSON.categorias.forEach(cat => {
      cat.itens.forEach(item => {
        map[item.id] = { ...item, categoryId: cat.id, categoryName: cat.nome, contaNoLimite: cat.contaNoLimite };
      });
    });
    return map;
  }, []);

  // Lista de todos os itens do cardápio com filtros aplicados
  const filteredCatalogItems = useMemo(() => {
    const allList: (BasketProductItem & { categoryId: string; categoryName: string; contaNoLimite: boolean })[] = [];
    OFFICIAL_BREAKFAST_BASKET_JSON.categorias.forEach(cat => {
      cat.itens.forEach(item => {
        allList.push({ ...item, categoryId: cat.id, categoryName: cat.nome, contaNoLimite: cat.contaNoLimite });
      });
    });

    return allList.filter(item => {
      // Filtro de Categoria
      const matchesCat = selectedCategory === 'all' || item.categoryId === selectedCategory;

      // Filtro de Busca por Nome ou Marca
      const matchesSearch =
        !searchQuery ||
        item.nome.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.marca && item.marca.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filtro de Compatibilidade com Cesta
      let matchesTier = true;
      if (tierFilter === 'compatible') {
        matchesTier = item.tamanhos.includes(selectedSize.id);
      } else if (tierFilter === 'drinks_tier') {
        matchesTier = item.categoryId === 'bebidas' && item.tamanhoBebida === selectedSize.bebidaTier;
      }

      // Filtro de Preço
      let matchesPrice = true;
      if (priceFilter === 'under10') {
        matchesPrice = item.preco <= 10;
      } else if (priceFilter === '10to20') {
        matchesPrice = item.preco > 10 && item.preco <= 20;
      } else if (priceFilter === 'above20') {
        matchesPrice = item.preco > 20;
      }

      return matchesCat && matchesSearch && matchesTier && matchesPrice;
    });
  }, [selectedCategory, searchQuery, tierFilter, priceFilter, selectedSize]);

  // Cálculo de total de itens que contam no limite
  const countInLimit = useMemo(() => {
    let count = 0;
    Object.entries(selectedQuantities).forEach(([itemId, qty]) => {
      const item = allItemsMap[itemId];
      if (item && item.contaNoLimite) {
        count += qty;
      }
    });
    return count;
  }, [selectedQuantities, allItemsMap]);

  // Checagem de bebida obrigatória do porte do tamanho
  const hasRequiredDrink = useMemo(() => {
    return Object.entries(selectedQuantities).some(([itemId, qty]) => {
      if (qty <= 0) return false;
      const item = allItemsMap[itemId];
      return item && item.categoryId === 'bebidas' && item.tamanhoBebida === selectedSize.bebidaTier;
    });
  }, [selectedQuantities, allItemsMap, selectedSize]);

  // Cálculo financeiro total
  const totalPrice = useMemo(() => {
    let sum = selectedSize.precoBase;
    Object.entries(selectedQuantities).forEach(([itemId, qty]) => {
      const item = allItemsMap[itemId];
      if (item && qty > 0) {
        sum += item.preco * qty;
      }
    });
    return sum;
  }, [selectedSize, selectedQuantities, allItemsMap]);

  const handleAddItem = (item: BasketProductItem, contaNoLimite: boolean) => {
    if (contaNoLimite && countInLimit >= selectedSize.maxItens) {
      return;
    }
    setSelectedQuantities(prev => ({
      ...prev,
      [item.id]: (prev[item.id] || 0) + 1,
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedQuantities(prev => {
      const curr = prev[itemId] || 0;
      if (curr <= 1) {
        const copy = { ...prev };
        delete copy[itemId];
        return copy;
      }
      return { ...prev, [itemId]: curr - 1 };
    });
  };

  const handleSendWhatsAppOrder = () => {
    if (!hasRequiredDrink) {
      alert(`Atenção: Sua cesta precisa ter pelo menos 1 bebida do porte ${selectedSize.bebidaTier}.`);
      return;
    }

    const itemsTextList: string[] = [];
    const extrasTextList: string[] = [];

    Object.entries(selectedQuantities).forEach(([itemId, qty]) => {
      const item = allItemsMap[itemId];
      if (item && qty > 0) {
        const line = `• ${qty}x ${item.nome} (R$ ${(item.preco * qty).toFixed(2)})`;
        if (item.contaNoLimite) {
          itemsTextList.push(line);
        } else {
          extrasTextList.push(line);
        }
      }
    });

    let message = `*NOVO PEDIDO DE CESTA — ${effectiveStoreName.toUpperCase()}*\n`;
    message += `🏬 *Loja:* ${effectiveStoreName} (@${company.slug} | ID: ${company.id})\n\n`;
    message += `🎁 *Tamanho Escolhido:* ${selectedSize.nome}\n`;
    message += `💰 *Preço Base:* R$ ${selectedSize.precoBase.toFixed(2)}\n`;
    message += `📦 *Total de Itens:* ${countInLimit} / ${selectedSize.maxItens}\n\n`;

    message += `*ITENS DA CESTA:*\n${itemsTextList.join('\n')}\n\n`;

    if (extrasTextList.length > 0) {
      message += `*ADICIONAIS EXTRAS:*\n${extrasTextList.join('\n')}\n\n`;
    }

    message += `*VALOR TOTAL ESTIMADO:* R$ ${totalPrice.toFixed(2)}\n\n`;
    message += `Gostaria de confirmar a disponibilidade e prazo de entrega para esta loja!`;

    const cleanPhone = effectiveWhatsapp.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Header Fixo com Identificação Clara da Loja */}
      <header className="sticky top-0 z-30 border-b bg-card/95 px-4 py-3 backdrop-blur lg:px-8">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div className="flex items-center space-x-3">
            {onBackToStore && (
              <button
                onClick={onBackToStore}
                className="rounded-lg border p-2 hover:bg-accent text-foreground transition-colors shrink-0"
                title="Voltar ao catálogo da loja"
              >
                <ArrowLeft className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center space-x-2.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-500 text-white font-bold shadow-xs">
                <Coffee className="h-5 w-5" />
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-1.5">
                  <h1 className="text-base font-bold leading-tight text-foreground">{effectiveStoreName}</h1>
                  <Badge variant="outline" className="text-[10px] px-1.5 py-0 border-primary/30 text-primary font-mono">
                    @{company.slug}
                  </Badge>
                  <span className="text-[10px] font-mono text-muted-foreground">ID: {company.id}</span>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {company.subtitulo || 'Monte a sua cesta e envie o pedido pelo WhatsApp'}
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0 self-end sm:self-auto">
            {/* Seletor Dropdown de Lojas da Plataforma */}
            {companies.length > 1 && (
              <div className="relative">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
                  className="h-8 text-xs font-medium border-dashed flex items-center space-x-1"
                >
                  <Store className="h-3.5 w-3.5 mr-1 text-primary" />
                  <span>Outras Lojas ({companies.length})</span>
                  <ChevronDown className={`h-3 w-3 transition-transform ${storeSwitcherOpen ? 'rotate-180' : ''}`} />
                </Button>

                {storeSwitcherOpen && (
                  <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-card p-2 shadow-2xl z-50 animate-in fade-in zoom-in-95">
                    <p className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                      Lojas na Plataforma MarketFlow
                    </p>
                    <div className="space-y-1 mt-1">
                      {companies.map(c => (
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

            <Badge variant="outline" className="font-mono text-xs border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200 px-2.5 py-1">
              Total: R$ {totalPrice.toFixed(2)}
            </Badge>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
        {/* Banner de Identificação e Unidade da Loja */}
        <div className="rounded-xl border bg-card/80 p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="font-semibold text-foreground">Loja Selecionada: <strong>{effectiveStoreName}</strong></span>
                <Badge variant="secondary" className="text-[10px] font-mono py-0">ID: {company.id}</Badge>
                <Badge variant="outline" className="text-[10px] py-0 text-emerald-600 border-emerald-500/30 bg-emerald-500/10">
                  <CheckCircle2 className="h-2.5 w-2.5 mr-0.5 inline" /> Loja Verificada
                </Badge>
              </div>
              <p className="text-[11px] text-muted-foreground mt-0.5">
                {company.description || company.legal_name || 'Comércio verificado e ativo na plataforma MarketFlow'}
                {company.cnpj && ` • CNPJ: ${company.cnpj}`}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 shrink-0">
            <span className="text-[11px] text-muted-foreground">WhatsApp da Loja:</span>
            <span className="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded text-xs">
              {effectiveWhatsapp}
            </span>
          </div>
        </div>

        {/* Passo 1: Escolha do Tamanho da Cesta */}
        <section className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-foreground flex items-center">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-2 font-black">1</span>
              Escolha o Tamanho da Cesta
            </h2>
            <span className="text-xs text-muted-foreground">
              Limite: <strong>{selectedSize.maxItens} itens</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {OFFICIAL_BREAKFAST_BASKET_JSON.tamanhos.map(size => {
              const isSelected = selectedSize.id === size.id;
              return (
                <button
                  key={size.id}
                  onClick={() => setSelectedSize(size)}
                  className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all relative ${
                    isSelected
                      ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/30 shadow-md'
                      : 'hover:border-primary/50 bg-card'
                  }`}
                >
                  {size.destaque && (
                    <span className="absolute top-2 right-2 rounded-full bg-amber-500 px-2 py-0.5 text-[9px] font-black uppercase text-white">
                      Mais Pedida
                    </span>
                  )}
                  <div>
                    <h3 className="font-bold text-sm text-foreground">{size.nome}</h3>
                    <p className="text-xs text-muted-foreground mt-1">{size.resumo}</p>
                  </div>
                  <div className="mt-4 pt-2 border-t flex items-baseline justify-between w-full">
                    <span className="text-lg font-black text-amber-600 dark:text-amber-400">
                      R$ {size.precoBase.toFixed(2)}
                    </span>
                    <span className="text-[10px] text-muted-foreground">Preço Base</span>
                  </div>
                </button>
              );
            })}
          </div>
        </section>

        {/* Status de Seleção & Validação */}
        <div className="rounded-xl border bg-card p-4 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center space-x-2">
              <span className="font-semibold text-muted-foreground">Itens na Cesta:</span>
              <span className={`font-bold font-mono px-2 py-0.5 rounded ${
                countInLimit === selectedSize.maxItens
                  ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300'
                  : 'bg-primary/10 text-primary'
              }`}>
                {countInLimit} de {selectedSize.maxItens} itens
              </span>
            </div>

            <div className="flex items-center space-x-2">
              {hasRequiredDrink ? (
                <span className="flex items-center text-emerald-600 font-semibold">
                  <Check className="h-4 w-4 mr-1" /> Bebida porte {selectedSize.bebidaTier} inclusa
                </span>
              ) : (
                <span className="flex items-center text-amber-600 font-semibold">
                  <AlertCircle className="h-4 w-4 mr-1" /> Toda cesta precisa de pelo menos 1 bebida porte {selectedSize.bebidaTier}
                </span>
              )}
            </div>
          </div>

          {/* Barra de Progresso */}
          <div className="h-2 w-full rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${Math.min(100, (countInLimit / selectedSize.maxItens) * 100)}%` }}
            />
          </div>
        </div>

        {/* Passo 2: Seleção de Itens com Menu Dropdown de Filtros */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs mr-2 font-black">2</span>
                Escolha os Itens para Compor a Cesta
              </h2>
              <p className="text-xs text-muted-foreground">
                Utilize o menu dropdown de filtros para selecionar categorias, compatibilidade e valores.
              </p>
            </div>

            <div className="text-xs font-medium text-muted-foreground">
              Mostrando <strong className="text-foreground">{filteredCatalogItems.length}</strong> produtos disponíveis
            </div>
          </div>

          {/* Barra de Busca e Menu Dropdown de Filtros (Padrão das telas de Admin) */}
          <Card className="p-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar item pelo nome, sabor ou marca..."
                  className="pl-9 h-9 text-xs"
                />
              </div>

              <div className="flex items-center space-x-2">
                <DropdownFilterMenu
                  groups={[
                    {
                      id: 'category',
                      title: 'Categorias do Cardápio',
                      selectedValue: selectedCategory,
                      onChange: setSelectedCategory,
                      options: [
                        {
                          id: 'all',
                          label: 'Todas as Categorias',
                          badge: OFFICIAL_BREAKFAST_BASKET_JSON.categorias.reduce((acc, c) => acc + c.itens.length, 0),
                        },
                        ...OFFICIAL_BREAKFAST_BASKET_JSON.categorias.map(c => ({
                          id: c.id,
                          label: c.contaNoLimite ? c.nome : `${c.nome} (À parte)`,
                          badge: c.itens.length,
                        })),
                      ],
                    },
                    {
                      id: 'tier',
                      title: 'Compatibilidade com a Cesta',
                      selectedValue: tierFilter,
                      onChange: setTierFilter,
                      options: [
                        { id: 'all', label: 'Todos os Itens do Cardápio' },
                        { id: 'compatible', label: `Disponíveis para Cesta ${selectedSize.nome}` },
                        { id: 'drinks_tier', label: `Apenas Bebidas Porte ${selectedSize.bebidaTier}` },
                      ],
                    },
                    {
                      id: 'price',
                      title: 'Faixa de Preço',
                      selectedValue: priceFilter,
                      onChange: setPriceFilter,
                      options: [
                        { id: 'all', label: 'Todos os Valores' },
                        { id: 'under10', label: 'Até R$ 10,00' },
                        { id: '10to20', label: 'R$ 10,01 a R$ 20,00' },
                        { id: 'above20', label: 'Acima de R$ 20,00' },
                      ],
                    },
                  ]}
                  onResetAll={() => {
                    setSelectedCategory('all');
                    setTierFilter('all');
                    setPriceFilter('all');
                    setSearchQuery('');
                  }}
                />
              </div>
            </div>

            {/* Chips de Filtros Ativos */}
            {(selectedCategory !== 'all' || tierFilter !== 'all' || priceFilter !== 'all' || searchQuery) && (
              <div className="flex flex-wrap items-center gap-1.5 pt-2 mt-2 border-t text-xs">
                <span className="text-muted-foreground text-[11px]">Filtros ativos:</span>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                    <span>Categoria: {OFFICIAL_BREAKFAST_BASKET_JSON.categorias.find(c => c.id === selectedCategory)?.nome}</span>
                    <button onClick={() => setSelectedCategory('all')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {tierFilter !== 'all' && (
                  <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                    <span>{tierFilter === 'compatible' ? `Para Cesta ${selectedSize.nome}` : `Porte ${selectedSize.bebidaTier}`}</span>
                    <button onClick={() => setTierFilter('all')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {priceFilter !== 'all' && (
                  <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                    <span>
                      {priceFilter === 'under10' ? 'Até R$ 10' : priceFilter === '10to20' ? 'R$ 10 a R$ 20' : 'Acima de R$ 20'}
                    </span>
                    <button onClick={() => setPriceFilter('all')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="secondary" className="text-[11px] py-0 px-2 flex items-center space-x-1">
                    <span>Busca: "{searchQuery}"</span>
                    <button onClick={() => setSearchQuery('')} className="ml-1 hover:text-destructive">×</button>
                  </Badge>
                )}
                <button
                  onClick={() => {
                    setSelectedCategory('all');
                    setTierFilter('all');
                    setPriceFilter('all');
                    setSearchQuery('');
                  }}
                  className="text-[11px] text-primary hover:underline ml-1"
                >
                  Limpar todos
                </button>
              </div>
            )}
          </Card>

          {/* Grid de Itens Filtrados */}
          {filteredCatalogItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 text-center text-muted-foreground border border-dashed rounded-xl space-y-2">
              <ShoppingBag className="h-8 w-8 opacity-30" />
              <p className="text-sm font-semibold">Nenhum item encontrado com os filtros selecionados</p>
              <p className="text-xs">Tente ajustar o menu dropdown de filtros ou alterar o termo de busca.</p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setSelectedCategory('all');
                  setTierFilter('all');
                  setPriceFilter('all');
                  setSearchQuery('');
                }}
                className="mt-2 text-xs"
              >
                Restaurar Filtros
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {filteredCatalogItems.map(item => {
                const qty = selectedQuantities[item.id] || 0;
                const isAvailableForSize = item.tamanhos.includes(selectedSize.id);
                const reachedLimit = item.contaNoLimite && countInLimit >= selectedSize.maxItens;

                return (
                  <div
                    key={item.id}
                    className={`flex flex-col justify-between p-3.5 rounded-xl border transition-all ${
                      qty > 0 ? 'bg-amber-500/5 border-amber-500/40 shadow-sm' : 'bg-card'
                    } ${!isAvailableForSize ? 'opacity-40 pointer-events-none' : ''}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-xs text-foreground leading-snug">{item.nome}</h4>
                        <div className="flex items-center space-x-1 shrink-0">
                          {item.tamanhoBebida && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                              Porte {item.tamanhoBebida}
                            </Badge>
                          )}
                          {!item.contaNoLimite && (
                            <Badge variant="secondary" className="text-[9px] px-1 py-0">
                              À parte
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 text-[10px] text-muted-foreground mt-0.5">
                        {item.marca && <span>{item.marca}</span>}
                        <span>• {item.categoryName}</span>
                      </div>
                    </div>

                    <div className="mt-3 pt-2 border-t flex items-center justify-between">
                      <span className="text-sm font-black text-primary">
                        R$ {item.preco.toFixed(2)}
                      </span>

                      <div className="flex items-center space-x-2">
                        {qty > 0 && (
                          <>
                            <button
                              onClick={() => handleRemoveItem(item.id)}
                              className="h-7 w-7 rounded-md border flex items-center justify-center text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                            >
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="font-bold font-mono text-xs w-4 text-center">{qty}</span>
                          </>
                        )}

                        <button
                          onClick={() => handleAddItem(item, item.contaNoLimite)}
                          disabled={reachedLimit && qty === 0}
                          className={`h-7 px-2.5 rounded-md text-xs font-bold flex items-center justify-center transition-colors ${
                            reachedLimit && qty === 0
                              ? 'bg-muted text-muted-foreground cursor-not-allowed'
                              : 'bg-primary text-primary-foreground hover:bg-primary/90'
                          }`}
                        >
                          <Plus className="h-3.5 w-3.5 mr-1" /> {qty > 0 ? 'Mais' : 'Adicionar'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>

      {/* Barra Inferior Fixa de Conclusão do Pedido */}
      <footer className="fixed bottom-0 inset-x-0 z-40 border-t bg-card/95 backdrop-blur px-4 py-3 shadow-xl">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-xs text-muted-foreground">Total da Cesta:</span>
              <span className="text-xl font-black text-foreground">R$ {totalPrice.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-muted-foreground">
              {countInLimit} de {selectedSize.maxItens} itens • {hasRequiredDrink ? 'Bebida OK' : 'Bebida pendente'} • Loja: <strong>{effectiveStoreName}</strong>
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleSendWhatsAppOrder}
            disabled={!hasRequiredDrink || countInLimit === 0}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Send className="mr-2 h-4 w-4" /> Enviar Pedido pelo WhatsApp ({effectiveStoreName})
          </Button>
        </div>
      </footer>
    </div>
  );
};

