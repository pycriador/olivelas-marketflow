import React, { useState } from 'react';
import {
  Coffee,
  Download,
  Copy,
  Check,
  Sparkles,
  ExternalLink,
  Package,
  Layers,
  AlertCircle,
  Eye,
  CheckCircle2
} from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { Product, Category } from '../../../types';
import { exportCompanyBasketJson, OFFICIAL_BREAKFAST_BASKET_JSON } from '../../../lib/real-basket-data';
import { dataStore } from '../../../lib/data-store';
import { DropdownFilterMenu } from '../../../components/ui/dropdown-filter-menu';

export const BreakfastBasketSettingsPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();

  const [products, setProducts] = useState<Product[]>(() => {
    return dataStore.getProducts(currentCompany?.id);
  });

  const [categories] = useState<Category[]>(() => {
    return dataStore.getCategories(currentCompany?.id);
  });

  // URL Query Parameters Sync
  const initialParams = new URLSearchParams(window.location.search);
  const [categoryFilter, setCategoryFilter] = useState<string>(initialParams.get('category') || 'all');
  const [basketStatusFilter, setBasketStatusFilter] = useState<string>(initialParams.get('status') || 'all');

  const updateUrlParams = (newCat: string, newStatus: string) => {
    const params = new URLSearchParams(window.location.search);
    if (newCat !== 'all') params.set('category', newCat); else params.delete('category');
    if (newStatus !== 'all') params.set('status', newStatus); else params.delete('status');
    const newQuery = params.toString() ? `?${params.toString()}` : window.location.pathname;
    window.history.replaceState({}, '', newQuery);
  };

  const handleCategoryFilterChange = (val: string) => {
    setCategoryFilter(val);
    updateUrlParams(val, basketStatusFilter);
  };

  const handleBasketStatusFilterChange = (val: string) => {
    setBasketStatusFilter(val);
    updateUrlParams(categoryFilter, val);
  };

  // Reatividade ao dataStore
  React.useEffect(() => {
    const handleUpdate = () => {
      setProducts(dataStore.getProducts(currentCompany?.id));
    };
    window.addEventListener('marketflow_datastore_change', handleUpdate);
    return () => window.removeEventListener('marketflow_datastore_change', handleUpdate);
  }, [currentCompany]);

  const [copied, setCopied] = useState(false);
  const [showJsonModal, setShowJsonModal] = useState(false);

  const toggleProductInBasket = (productId: string) => {
    const target = products.find(p => p.id === productId);
    if (target) {
      const updated = dataStore.saveProduct({
        ...target,
        active_in_basket: !target.active_in_basket,
        updated_at: new Date().toISOString(),
      });
      setProducts(prev => prev.map(p => (p.id === productId ? updated : p)));
    }
  };

  const currentBasketJson = exportCompanyBasketJson(
    currentCompany || {
      id: 'comp-cesta-1',
      name: 'Cestas de Café da Manhã',
      slug: 'cestas-cafe-da-manha',
      active: true,
      created_at: '',
      updated_at: '',
    },
    products,
    categories
  );

  const handleDownloadJson = () => {
    const jsonString = JSON.stringify(currentBasketJson, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `cesta-cafe-da-manha-${currentCompany?.slug || 'empresa'}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleCopyJson = () => {
    const jsonString = JSON.stringify(currentBasketJson, null, 2);
    navigator.clipboard.writeText(jsonString);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const totalBasketProducts = products.filter(p => p.active_in_basket !== false).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Recursos Especiais' }, { label: 'Cesta de Café da Manhã' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-foreground flex items-center">
            <Coffee className="mr-2 h-6 w-6 text-amber-500" /> Cesta de Café da Manhã Personalizada
          </h1>
          <p className="text-sm text-muted-foreground">
            Gerencie itens ativos, regras de seleção de bebidas e exporte a estrutura completa em JSON para automações e WhatsApp.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => setShowJsonModal(true)}>
            <Eye className="mr-1.5 h-4 w-4" /> Visualizar JSON
          </Button>
          <Button size="sm" onClick={handleDownloadJson} className="bg-amber-600 hover:bg-amber-700 text-white">
            <Download className="mr-1.5 h-4 w-4" /> Exportar JSON da Cesta
          </Button>
        </div>
      </div>

      {/* Card Informativo do Recurso Especial */}
      <div className="rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-500/10 via-amber-500/5 to-transparent p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2 mb-1">
            <Badge variant="outline" className="bg-amber-500/20 text-amber-800 dark:text-amber-200 border-amber-500/40 text-xs">
              Recurso Especial Ativo
            </Badge>
            <span className="text-xs text-muted-foreground">Empresa: <strong>{currentCompany?.name}</strong></span>
          </div>
          <h3 className="text-base font-bold text-foreground">Ferramenta Interativa de Montagem de Cestas</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            Os clientes podem montar cestas personalizadas com limites por tamanho (5, 8 ou 12 itens), validação de bebida e envio direto para o WhatsApp ({currentCompany?.whatsapp || '5511963820374'}).
          </p>
        </div>
        {onNavigate && (
          <Button
            size="sm"
            onClick={() => onNavigate(`/loja/${currentCompany?.slug || 'cestas-cafe-da-manha'}/cesta`)}
            className="shrink-0"
          >
            <ExternalLink className="mr-1.5 h-4 w-4" /> Abrir Montador (Visão do Cliente)
          </Button>
        )}
      </div>

      {/* Grid: Tamanhos & Regras */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {OFFICIAL_BREAKFAST_BASKET_JSON.tamanhos.map(tam => (
          <Card key={tam.id} className={tam.destaque ? 'border-2 border-primary shadow-md' : ''}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base font-bold">{tam.nome}</CardTitle>
                {tam.destaque && (
                  <Badge variant="default" className="text-[10px]">Mais Pedida</Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{tam.resumo}</p>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-foreground">
                R$ {tam.precoBase.toFixed(2)}
                <span className="text-xs font-normal text-muted-foreground ml-1">(preço base da cesta)</span>
              </div>
              <div className="mt-3 space-y-1.5 text-xs text-muted-foreground">
                <div className="flex justify-between">
                  <span>Limite de Itens:</span>
                  <span className="font-bold text-foreground">Até {tam.maxItens} itens</span>
                </div>
                <div className="flex justify-between">
                  <span>Bebida Obrigatória:</span>
                  <span className="font-bold text-foreground">Porte {tam.bebidaTier}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Listagem de Produtos Ativos na Cesta por Categoria */}
      <Card>
        <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between border-b pb-4 gap-3">
          <div>
            <CardTitle className="text-base flex items-center">
              <Package className="mr-2 h-4 w-4 text-primary" /> Produtos da Cesta ({totalBasketProducts} ativos)
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-0.5">
              Todos os produtos marcados como <strong>"Ativo na Cesta"</strong> aparecem na vitrine interativa e na exportação JSON.
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <DropdownFilterMenu
              groups={[
                {
                  id: 'category',
                  title: 'Filtrar Categoria',
                  selectedValue: categoryFilter,
                  onChange: handleCategoryFilterChange,
                  options: [
                    { id: 'all', label: 'Todas as Categorias', badge: OFFICIAL_BREAKFAST_BASKET_JSON.categorias.length },
                    ...OFFICIAL_BREAKFAST_BASKET_JSON.categorias.map(c => ({
                      id: c.id,
                      label: c.nome,
                    })),
                  ],
                },
                {
                  id: 'status',
                  title: 'Status na Cesta',
                  selectedValue: basketStatusFilter,
                  onChange: handleBasketStatusFilterChange,
                  options: [
                    { id: 'all', label: 'Todos os Produtos' },
                    { id: 'active', label: 'Apenas Ativos na Cesta' },
                    { id: 'inactive', label: 'Inativos na Cesta' },
                  ],
                },
              ]}
              onResetAll={() => {
                setCategoryFilter('all');
                setBasketStatusFilter('all');
                updateUrlParams('all', 'all');
              }}
            />
            <Button variant="outline" size="sm" onClick={handleCopyJson}>
              {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" /> : <Copy className="mr-1.5 h-4 w-4" />}
              <span>{copied ? 'Copiado!' : 'Copiar JSON'}</span>
            </Button>
          </div>
        </CardHeader>

        <CardContent className="pt-4 space-y-6">
          {OFFICIAL_BREAKFAST_BASKET_JSON.categorias
            .filter(cat => categoryFilter === 'all' || cat.id === categoryFilter)
            .map(cat => {
              const catProducts = products.filter(p => {
                const matchesCat =
                  p.category_id === `cat-${cat.id}` ||
                  p.id.startsWith(cat.id.substring(0, 3));
                const isActive = p.active_in_basket !== false;
                const matchesStatus =
                  basketStatusFilter === 'all' ||
                  (basketStatusFilter === 'active' ? isActive : !isActive);

                return matchesCat && matchesStatus;
              });

              if (catProducts.length === 0 && basketStatusFilter !== 'all') return null;

              return (
                <div key={cat.id} className="space-y-3">
                  <div className="flex items-center justify-between pb-1 border-b">
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-sm text-foreground">{cat.nome}</h4>
                      {cat.contaNoLimite ? (
                        <Badge variant="outline" className="text-[10px]">Conta no Limite</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Adicional à Parte</Badge>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">{catProducts.length} itens</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {catProducts.map(item => {
                      const isActive = item.active_in_basket !== false;
                      return (
                        <div
                          key={item.id}
                          className={`flex items-center justify-between p-3 rounded-lg border transition-all ${
                            isActive
                              ? 'bg-card border-primary/30 shadow-sm'
                              : 'bg-muted/40 border-muted opacity-60'
                          }`}
                        >
                        <div className="space-y-1">
                          <p className="font-bold text-xs text-foreground line-clamp-1">{item.name}</p>
                          <div className="flex items-center space-x-2 text-[11px] text-muted-foreground">
                            <span className="font-semibold text-primary">R$ {item.sale_price.toFixed(2)}</span>
                            {item.drink_tier && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 font-mono">
                                Porte {item.drink_tier}
                              </Badge>
                            )}
                          </div>
                        </div>

                        <label className="flex items-center cursor-pointer ml-3">
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => toggleProductInBasket(item.id)}
                            className="h-4 w-4 rounded border-input text-amber-600 focus:ring-amber-500"
                            title="Ativar/Desativar na Cesta"
                          />
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Modal de Pré-visualização do JSON da Cesta */}
      {showJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in-50">
          <div className="w-full max-w-4xl rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-lg font-bold">JSON Oficial da Cesta de Café da Manhã</h3>
                <p className="text-xs text-muted-foreground">Exportação fiel dos dados da empresa e itens ativos.</p>
              </div>
              <div className="flex items-center space-x-2">
                <Button size="sm" variant="outline" onClick={handleCopyJson}>
                  {copied ? <Check className="mr-1.5 h-4 w-4 text-emerald-500" /> : <Copy className="mr-1.5 h-4 w-4" />}
                  <span>{copied ? 'Copiado!' : 'Copiar'}</span>
                </Button>
                <Button size="sm" onClick={() => setShowJsonModal(false)}>
                  Fechar
                </Button>
              </div>
            </div>
            <pre className="flex-1 p-4 rounded-lg bg-slate-950 text-emerald-400 font-mono text-xs overflow-y-auto border border-slate-800">
              <code>{JSON.stringify(currentBasketJson, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
