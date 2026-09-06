import React, { useState } from 'react';
import { Sparkles, Camera, Upload, CheckCircle2, AlertTriangle, ArrowRight, Save } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputMoney } from '../../../components/ui/input-money';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { mockCategories, mockBrands, mockProducts } from '../../../lib/supabase';
import { useCompany } from '../../../context/company-context';
import { Product } from '../../../types';
import { dataStore } from '../../../lib/data-store';

export const AiAssistantPage: React.FC<{ onNavigate: (path: string) => void }> = ({ onNavigate }) => {
  const { currentCompany } = useCompany();

  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [aiResult, setAiResult] = useState<{
    name: string;
    barcode: string;
    category_id: string;
    brand_id: string;
    unit: string;
    cost_price: number;
    sale_price: number;
    confidence: number; // 0.94 -> 94%
  } | null>(null);

  const categories = dataStore.getCategories(currentCompany?.id);
  const brands = dataStore.getBrands(currentCompany?.id);

  // Simula upload de imagem pré-carregada ou arquivo
  const handleSampleImage = (url: string) => {
    setImageUrl(url);
    setIsProcessing(true);
    setAiResult(null);

    setTimeout(() => {
      setIsProcessing(false);
      setAiResult({
        name: 'Refrigerante Guaraná Antarctica 2L',
        barcode: '7891000123456',
        category_id: categories[0]?.id || '',
        brand_id: brands[0]?.id || '',
        unit: 'un',
        cost_price: 6.50,
        sale_price: 9.90,
        confidence: 0.94, // 94% de confiança
      });
    }, 1500);
  };

  const handleSaveProductFromAi = () => {
    if (!aiResult) return;
    const newProduct: Product = {
      id: `prod-ai-${Date.now()}`,
      company_id: currentCompany?.id || 'comp-1',
      name: aiResult.name,
      barcode: aiResult.barcode,
      category_id: aiResult.category_id,
      brand_id: aiResult.brand_id,
      unit: aiResult.unit,
      cost_price: aiResult.cost_price,
      sale_price: aiResult.sale_price,
      minimum_stock: 10,
      image_url: imageUrl || undefined,
      active: true,
      catalog_visible: true,
      show_price: true,
      allow_contact: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    dataStore.saveProduct(newProduct);
    onNavigate('/admin/products');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Breadcrumbs items={[{ label: 'Inteligência Artificial' }, { label: 'Cadastro por Foto' }]} />
        <div className="flex items-center space-x-2 mt-1">
          <Sparkles className="h-6 w-6 text-primary" />
          <h1 className="text-2xl font-bold tracking-tight">Assistente de Cadastro por Foto</h1>
        </div>
        <p className="text-sm text-muted-foreground">
          Utilize fotos de rótulos ou embalagens para identificar e preencher automaticamente os dados do produto.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Coluna 1: Captura e Imagem */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">1. Imagem do Produto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/20 p-6 text-center">
              {imageUrl ? (
                <img src={imageUrl} alt="Captura IA" className="h-48 rounded-md object-contain shadow" />
              ) : (
                <div className="space-y-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary mx-auto">
                    <Camera className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Tire uma foto ou faça upload</p>
                    <p className="text-xs text-muted-foreground">Fotografe o produto de frente com o rótulo visível</p>
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <p className="text-xs font-semibold text-muted-foreground uppercase">Imagens de teste instantâneas:</p>
              <div className="flex flex-wrap gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleImage('https://images.unsplash.com/photo-1622483767028-3f66f32aef97?w=400&q=80')}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Testar Guaraná 2L
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleSampleImage('https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80')}
                >
                  <Sparkles className="mr-1.5 h-3.5 w-3.5 text-primary" /> Testar Pacote de Arroz
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Coluna 2: Leitura da IA & Confirmação */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">2. Leitura & Revisão Humana</CardTitle>
            {aiResult && (
              <Badge variant="success" className="text-xs">
                {(aiResult.confidence * 100).toFixed(0)}% de Confiança
              </Badge>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {isProcessing ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center space-y-3">
                <Sparkles className="h-8 w-8 animate-spin text-primary" />
                <p className="text-sm font-medium text-foreground">Analisando imagem com Inteligência Artificial...</p>
                <p className="text-xs text-muted-foreground">Extraindo rótulo, código de barras e marcas...</p>
              </div>
            ) : aiResult ? (
              <div className="space-y-4 animate-in fade-in-50">
                <div className="rounded-md bg-primary/10 border border-primary/20 p-3 text-xs text-primary font-medium flex items-center">
                  <CheckCircle2 className="h-4 w-4 mr-2 shrink-0" />
                  Sugestão gerada. Você pode editar qualquer campo antes de salvar.
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Nome Identificado
                  </label>
                  <Input
                    value={aiResult.name}
                    onChange={(e) => setAiResult({ ...aiResult, name: e.target.value })}
                  />
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Código EAN / Barras
                    </label>
                    <Input
                      value={aiResult.barcode}
                      onChange={(e) => setAiResult({ ...aiResult, barcode: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Preço de Venda (R$)
                    </label>
                    <InputMoney
                      value={aiResult.sale_price}
                      onChange={(val) => setAiResult({ ...aiResult, sale_price: val })}
                    />
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Categoria Sugerida
                    </label>
                    <select
                      value={aiResult.category_id}
                      onChange={(e) => setAiResult({ ...aiResult, category_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Marca Sugerida
                    </label>
                    <select
                      value={aiResult.brand_id}
                      onChange={(e) => setAiResult({ ...aiResult, brand_id: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <Button onClick={handleSaveProductFromAi} className="w-full" size="lg">
                  <Save className="mr-2 h-4 w-4" /> Confirmar e Cadastrar Produto
                </Button>
              </div>
            ) : (
              <div className="flex min-h-[220px] flex-col items-center justify-center text-center text-muted-foreground">
                <Sparkles className="h-10 w-10 mb-2 opacity-50" />
                <p className="text-sm">Selecione ou envie uma imagem ao lado para iniciar</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
