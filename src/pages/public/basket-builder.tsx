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
  ChevronRight
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { OFFICIAL_BREAKFAST_BASKET_JSON } from '../../lib/real-basket-data';
import { BasketSize, BasketProductItem } from '../../types';

interface BasketBuilderProps {
  onBackToStore?: () => void;
  whatsappNumber?: string;
  storeName?: string;
}

export const BasketBuilderPage: React.FC<BasketBuilderProps> = ({
  onBackToStore,
  whatsappNumber = '5511963820374',
  storeName = 'Cestas de Café da Manhã',
}) => {
  const [selectedSize, setSelectedSize] = useState<BasketSize>(OFFICIAL_BREAKFAST_BASKET_JSON.tamanhos[1]); // Média default
  const [selectedCategory, setSelectedCategory] = useState<string>('bebidas');

  // Quantidade de cada item selecionado { [itemId]: quantidade }
  const [selectedQuantities, setSelectedQuantities] = useState<Record<string, number>>({});

  // Obter todos os itens em mapa plano
  const allItemsMap = useMemo(() => {
    const map: Record<string, BasketProductItem & { categoryId: string; contaNoLimite: boolean }> = {};
    OFFICIAL_BREAKFAST_BASKET_JSON.categorias.forEach(cat => {
      cat.itens.forEach(item => {
        map[item.id] = { ...item, categoryId: cat.id, contaNoLimite: cat.contaNoLimite };
      });
    });
    return map;
  }, []);

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

    let message = `*NOVO PEDIDO DE CESTA — ${storeName.toUpperCase()}*\n\n`;
    message += `🎁 *Tamanho Escolhido:* ${selectedSize.nome}\n`;
    message += `💰 *Preço Base:* R$ ${selectedSize.precoBase.toFixed(2)}\n`;
    message += `📦 *Total de Itens:* ${countInLimit} / ${selectedSize.maxItens}\n\n`;

    message += `*ITENS DA CESTA:*\n${itemsTextList.join('\n')}\n\n`;

    if (extrasTextList.length > 0) {
      message += `*ADICIONAIS EXTRAS:*\n${extrasTextList.join('\n')}\n\n`;
    }

    message += `*VALOR TOTAL ESTIMADO:* R$ ${totalPrice.toFixed(2)}\n\n`;
    message += `Gostaria de confirmar a disponibilidade e prazo de entrega!`;

    const cleanPhone = whatsappNumber.replace(/\D/g, '');
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/${cleanPhone}?text=${encoded}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Header Fixo */}
      <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/95 px-4 backdrop-blur lg:px-8">
        <div className="flex items-center space-x-3">
          {onBackToStore && (
            <button
              onClick={onBackToStore}
              className="rounded-md border p-2 hover:bg-accent text-foreground transition-colors"
              title="Voltar ao catálogo"
            >
              <ArrowLeft className="h-4 w-4" />
            </button>
          )}
          <div className="flex items-center space-x-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500 text-white font-bold">
              <Coffee className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-sm font-bold leading-tight">{storeName}</h1>
              <p className="text-[11px] text-muted-foreground">Monte a sua cesta e envie pelo WhatsApp</p>
            </div>
          </div>
        </div>

        <Badge variant="outline" className="font-mono text-xs border-amber-500/30 bg-amber-500/10 text-amber-800 dark:text-amber-200">
          Total: R$ {totalPrice.toFixed(2)}
        </Badge>
      </header>

      <main className="max-w-5xl mx-auto p-4 sm:p-6 space-y-6">
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

        {/* Passo 2: Navegação de Categorias */}
        <section className="space-y-4">
          <div className="flex items-center justify-between border-b pb-2 overflow-x-auto">
            <div className="flex space-x-2 shrink-0">
              {OFFICIAL_BREAKFAST_BASKET_JSON.categorias.map(cat => {
                const isActive = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-primary text-primary-foreground shadow-sm'
                        : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
                    }`}
                  >
                    {cat.nome}
                    {!cat.contaNoLimite && (
                      <span className="ml-1 text-[9px] opacity-80">(À parte)</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de Itens da Categoria Selecionada */}
          {OFFICIAL_BREAKFAST_BASKET_JSON.categorias
            .filter(cat => cat.id === selectedCategory)
            .map(cat => (
              <div key={cat.id} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {cat.itens.map(item => {
                  const qty = selectedQuantities[item.id] || 0;
                  const isAvailableForSize = item.tamanhos.includes(selectedSize.id);
                  const reachedLimit = cat.contaNoLimite && countInLimit >= selectedSize.maxItens;

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
                          {item.tamanhoBebida && (
                            <Badge variant="outline" className="text-[9px] px-1 py-0 shrink-0 font-mono">
                              Porte {item.tamanhoBebida}
                            </Badge>
                          )}
                        </div>
                        {item.marca && (
                          <p className="text-[10px] text-muted-foreground mt-0.5">{item.marca}</p>
                        )}
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
                            onClick={() => handleAddItem(item, cat.contaNoLimite)}
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
            ))}
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
              {countInLimit} de {selectedSize.maxItens} itens • {hasRequiredDrink ? 'Bebida OK' : 'Bebida pendente'}
            </p>
          </div>

          <Button
            size="lg"
            onClick={handleSendWhatsAppOrder}
            disabled={!hasRequiredDrink || countInLimit === 0}
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white font-bold"
          >
            <Send className="mr-2 h-4 w-4" /> Enviar Pedido pelo WhatsApp
          </Button>
        </div>
      </footer>
    </div>
  );
};
