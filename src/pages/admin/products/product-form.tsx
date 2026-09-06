import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { ArrowLeft, Save, Sparkles, Image as ImageIcon, Store, Coffee } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { InputMoney } from '../../../components/ui/input-money';
import { InputQuantity } from '../../../components/ui/input-quantity';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { useCompany } from '../../../context/company-context';
import { Product } from '../../../types';
import { dataStore } from '../../../lib/data-store';

const productSchema = z.object({
  name: z.string().min(2, 'Nome deve possuir pelo menos 2 caracteres'),
  description: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  unit: z.string().min(1, 'Informe a unidade de medida (ex: un, kg, L)'),
  cost_price: z.number().min(0, 'Preço de custo não pode ser negativo'),
  sale_price: z.number().min(0.01, 'Preço de venda deve ser maior que zero'),
  promotional_price: z.number().min(0, 'Preço promocional inválido').optional(),
  minimum_stock: z.number().min(0, 'Estoque mínimo não pode ser negativo'),
  category_id: z.string().optional(),
  brand_id: z.string().optional(),
  default_supplier_id: z.string().optional(),
  image_url: z.string().url('URL de imagem inválida').or(z.literal('')).optional(),
  expiration_date: z.string().optional(),
  active: z.boolean().default(true),
  catalog_visible: z.boolean().default(true),
  show_price: z.boolean().default(true),
  allow_contact: z.boolean().default(true),
  active_in_basket: z.boolean().default(true),
  basket_sizes: z.array(z.enum(['pequena', 'media', 'grande'])).default(['pequena', 'media', 'grande']),
  drink_tier: z.enum(['P', 'M', 'G']).optional(),
});

type ProductFormData = z.infer<typeof productSchema>;

interface ProductFormPageProps {
  initialProduct?: Product | null;
  onBack: () => void;
  onSaved: () => void;
}

export const ProductFormPage: React.FC<ProductFormPageProps> = ({ initialProduct, onBack, onSaved }) => {
  const { currentCompany } = useCompany();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const categories = dataStore.getCategories(currentCompany?.id);
  const brands = dataStore.getBrands(currentCompany?.id);
  const suppliers = dataStore.getSuppliers(currentCompany?.id);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: initialProduct ? {
      name: initialProduct.name,
      description: initialProduct.description || '',
      sku: initialProduct.sku || '',
      barcode: initialProduct.barcode || '',
      unit: initialProduct.unit,
      cost_price: initialProduct.cost_price,
      sale_price: initialProduct.sale_price,
      promotional_price: initialProduct.promotional_price,
      minimum_stock: initialProduct.minimum_stock,
      category_id: initialProduct.category_id || '',
      brand_id: initialProduct.brand_id || '',
      default_supplier_id: initialProduct.default_supplier_id || '',
      image_url: initialProduct.image_url || '',
      expiration_date: initialProduct.expiration_date || '',
      active: initialProduct.active,
      catalog_visible: initialProduct.catalog_visible,
      show_price: initialProduct.show_price,
      allow_contact: initialProduct.allow_contact,
      active_in_basket: initialProduct.active_in_basket ?? true,
      basket_sizes: (initialProduct.basket_sizes as any) || ['pequena', 'media', 'grande'],
      drink_tier: initialProduct.drink_tier,
    } : {
      unit: 'un',
      cost_price: 0,
      sale_price: 0,
      minimum_stock: 5,
      expiration_date: '',
      active: true,
      catalog_visible: true,
      show_price: true,
      allow_contact: true,
      active_in_basket: true,
      basket_sizes: ['pequena', 'media', 'grande'],
    },
  });

  const watchImageUrl = watch('image_url');
  const watchUnit = watch('unit');

  const onSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      if (initialProduct) {
        dataStore.saveProduct({
          ...initialProduct,
          ...data,
          updated_at: new Date().toISOString(),
        });
      } else {
        dataStore.saveProduct({
          id: `prod-${Date.now()}`,
          company_id: currentCompany?.id || 'comp-cesta-1',
          ...data,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });
      }
      onSaved();
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs
            items={[
              { label: 'Cadastros' },
              { label: 'Produtos', href: '#' },
              { label: initialProduct ? 'Editar Produto' : 'Novo Produto' },
            ]}
          />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">
            {initialProduct ? `Editar: ${initialProduct.name}` : 'Cadastrar Novo Produto'}
          </h1>
          <p className="text-sm text-muted-foreground">
            Preencha os dados do item, valores, estoque e preferências do catálogo público.
          </p>
        </div>
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" /> Voltar para Lista
        </Button>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-3">
          {/* Coluna 1 e 2: Informações Principais */}
          <div className="md:col-span-2 space-y-6">
            {/* Card: Dados Básicos */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Nome do Produto *
                  </label>
                  <Input
                    {...register('name')}
                    placeholder="Ex: Coca-Cola Garrafa 2 Litros"
                    error={errors.name?.message}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    Descrição Detalhada
                  </label>
                  <textarea
                    {...register('description')}
                    rows={3}
                    placeholder="Descrição para uso interno e catálogo..."
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Código SKU
                    </label>
                    <Input {...register('sku')} placeholder="Ex: COC-2L-001" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Código de Barras (EAN/GTIN)
                    </label>
                    <Input {...register('barcode')} placeholder="7894900011517" />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Categoria
                    </label>
                    <select
                      {...register('category_id')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione Categoria</option>
                      {categories.map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Marca
                    </label>
                    <select
                      {...register('brand_id')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione Marca</option>
                      {brands.map(b => (
                        <option key={b.id} value={b.id}>{b.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Unidade de Medida *
                    </label>
                    <select
                      {...register('unit')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="un">Unidade (un)</option>
                      <option value="kg">Quilograma (kg)</option>
                      <option value="g">Grama (g)</option>
                      <option value="L">Litro (L)</option>
                      <option value="ml">Mililitro (ml)</option>
                      <option value="cx">Caixa (cx)</option>
                      <option value="pct">Pacote (pct)</option>
                    </select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card: Preços e Estoque */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Preços e Níveis de Estoque</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Preço de Custo (R$)
                    </label>
                    <Controller
                      name="cost_price"
                      control={control}
                      render={({ field }) => (
                        <InputMoney
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.cost_price?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Preço de Venda (R$) *
                    </label>
                    <Controller
                      name="sale_price"
                      control={control}
                      render={({ field }) => (
                        <InputMoney
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.sale_price?.message}
                        />
                      )}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Preço Promocional (R$)
                    </label>
                    <Controller
                      name="promotional_price"
                      control={control}
                      render={({ field }) => (
                        <InputMoney
                          value={field.value}
                          onChange={field.onChange}
                          error={errors.promotional_price?.message}
                        />
                      )}
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Estoque Mínimo (Alerta)
                    </label>
                    <Controller
                      name="minimum_stock"
                      control={control}
                      render={({ field }) => (
                        <InputQuantity
                          value={field.value}
                          onChange={field.onChange}
                          unit={watchUnit}
                          error={errors.minimum_stock?.message}
                        />
                      )}
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Dispara alerta no dashboard quando a quantidade estiver abaixo deste valor.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Fornecedor Padrão
                    </label>
                    <select
                      {...register('default_supplier_id')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Selecione Fornecedor</option>
                      {suppliers.map(s => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                      ))}
                    </select>
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Fornecedor principal vinculado para reposição.
                    </p>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                      Data de Validade
                    </label>
                    <Input
                      type="date"
                      {...register('expiration_date')}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    />
                    <p className="mt-1 text-[11px] text-muted-foreground">
                      Prazo de validade do produto ou lote atual.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna 3: Imagem e Visibilidade do Catálogo */}
          <div className="space-y-6">
            {/* Card Preview de Imagem */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <ImageIcon className="mr-2 h-4 w-4 text-primary" /> Imagem do Produto
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 bg-muted/20">
                  {watchImageUrl ? (
                    <img src={watchImageUrl} alt="Preview" className="h-40 w-full object-contain rounded-md" />
                  ) : (
                    <div className="flex flex-col items-center py-6 text-muted-foreground">
                      <ImageIcon className="h-10 w-10 mb-2" />
                      <p className="text-xs text-center">Cole o link da imagem abaixo</p>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase text-muted-foreground mb-1">
                    URL da Imagem
                  </label>
                  <Input
                    {...register('image_url')}
                    placeholder="https://exemplo.com/foto.jpg"
                    error={errors.image_url?.message}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Card: Visibilidade no Catálogo */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base flex items-center">
                  <Store className="mr-2 h-4 w-4 text-primary" /> Catálogo Público
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('catalog_visible')}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Publicar no Catálogo Online</span>
                </label>

                <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('show_price')}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Exibir preço para visitantes</span>
                </label>

                <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('allow_contact')}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Permitir contato direto via WhatsApp</span>
                </label>

                <hr className="my-2" />

                <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('active')}
                    className="h-4 w-4 rounded border-input text-primary focus:ring-primary"
                  />
                  <span>Produto Ativo no Sistema</span>
                </label>
              </CardContent>
            </Card>

            {/* Card Cesta de Café da Manhã */}
            <Card className="border-amber-500/30 bg-amber-500/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center text-amber-900 dark:text-amber-200">
                  <Coffee className="mr-2 h-4 w-4 text-amber-500" /> Cesta de Café da Manhã
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <label className="flex items-center space-x-2 text-sm font-semibold cursor-pointer">
                  <input
                    type="checkbox"
                    {...register('active_in_basket')}
                    className="h-4 w-4 rounded border-amber-500 text-amber-600 focus:ring-amber-500"
                  />
                  <span>Ativo na Cesta de Café da Manhã</span>
                </label>
                <p className="text-[11px] text-muted-foreground">
                  Habilita este produto para escolha no montador de cestas e inclusão no JSON exportado.
                </p>

                <div className="pt-2 border-t border-amber-500/20">
                  <label className="block text-[11px] font-bold uppercase text-muted-foreground mb-1">
                    Porte da Bebida (opcional)
                  </label>
                  <select
                    {...register('drink_tier')}
                    className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-xs"
                  >
                    <option value="">Não é bebida / Padrão</option>
                    <option value="P">Porte P (~200 ml - Cesta Pequena)</option>
                    <option value="M">Porte M (~500 ml - Cesta Média)</option>
                    <option value="G">Porte G (~1 Litro - Cesta Grande)</option>
                  </select>
                </div>
              </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg" isLoading={isSubmitting} loadingText="Salvando Produto...">
              <Save className="mr-2 h-5 w-5" /> Salvar Produto
            </Button>
          </div>
        </div>
      </form>
    </div>
  );
};
