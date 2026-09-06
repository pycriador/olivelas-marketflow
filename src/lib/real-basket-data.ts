import { Company, Category, Brand, Product, BreakfastBasketExportJson, BasketSize, BasketRules } from '../types';

export const OFFICIAL_BREAKFAST_BASKET_JSON: BreakfastBasketExportJson = {
  loja: {
    nome: "Cestas de Café da Manhã",
    subtitulo: "Monte a sua cesta e envie o pedido pelo WhatsApp",
    whatsapp: "5511963820374",
    moeda: "BRL",
    heroImagem: "",
    avisoRodape: "Cardápio de exemplo — em ajustes."
  },
  tamanhos: [
    {
      id: "pequena",
      nome: "Cesta Pequena",
      maxItens: 5,
      precoBase: 15,
      bebidaTier: "P",
      resumo: "Até 5 itens • 1 bebida de ~200 ml"
    },
    {
      id: "media",
      nome: "Cesta Média",
      maxItens: 8,
      precoBase: 20,
      bebidaTier: "M",
      resumo: "Até 8 itens • 1 bebida de ~500 ml",
      destaque: true
    },
    {
      id: "grande",
      nome: "Cesta Grande",
      maxItens: 12,
      precoBase: 25,
      bebidaTier: "G",
      resumo: "Até 12 itens • 1 bebida de ~1 litro"
    }
  ],
  regras: {
    categoriasObrigatorias: ["bebidas"],
    mensagemObrigatoria: "Toda cesta precisa de pelo menos 1 bebida.",
    permiteRepetirItem: true
  },
  categorias: [
    {
      id: "bebidas",
      nome: "Bebidas",
      contaNoLimite: true,
      itens: [
        { id: "beb-suco-delvalle-200", nome: "Suco Del Valle Uva 200 ml", marca: "Del Valle", preco: 4.49, tamanhoBebida: "P", tamanhos: ["pequena"] },
        { id: "beb-toddynho-200", nome: "Achocolatado Toddynho 200 ml", marca: "Toddynho", preco: 3.29, tamanhoBebida: "P", tamanhos: ["pequena"] },
        { id: "beb-agua-coco-200", nome: "Água de Coco Kero Coco 200 ml", marca: "Kero Coco", preco: 4.99, tamanhoBebida: "P", tamanhos: ["pequena"] },
        { id: "beb-iog-danone-170", nome: "Iogurte Líquido Danone 170 g", marca: "Danone", preco: 3.79, tamanhoBebida: "P", tamanhos: ["pequena"] },
        { id: "beb-ades-500", nome: "Bebida de Soja Ades Maçã 500 ml", marca: "Ades", preco: 6.49, tamanhoBebida: "M", tamanhos: ["media"] },
        { id: "beb-suco-natone-500", nome: "Suco Natural One Laranja 500 ml", marca: "Natural One", preco: 10.9, tamanhoBebida: "M", tamanhos: ["media"] },
        { id: "beb-guarana-350", nome: "Guaraná Antarctica 350 ml (lata)", marca: "Antarctica", preco: 4.99, tamanhoBebida: "M", tamanhos: ["media"] },
        { id: "beb-cha-leao-450", nome: "Chá Leão Pêssego 450 ml", marca: "Leão", preco: 6.9, tamanhoBebida: "M", tamanhos: ["media"] },
        { id: "beb-suco-aurora-1l", nome: "Suco de Uva Integral Aurora 1 L", marca: "Aurora", preco: 18.9, tamanhoBebida: "G", tamanhos: ["grande"] },
        { id: "beb-maguary-1l", nome: "Néctar Maguary Manga 1 L", marca: "Maguary", preco: 9.9, tamanhoBebida: "G", tamanhos: ["grande"] },
        { id: "beb-guarana-1l", nome: "Guaraná Antarctica 1 L", marca: "Antarctica", preco: 8.49, tamanhoBebida: "G", tamanhos: ["grande"] }
      ]
    },
    {
      id: "paes-bolos",
      nome: "Pães & Bolos",
      contaNoLimite: true,
      itens: [
        { id: "pb-pao-forma-pullman", nome: "Pão de Forma Pullman 100% Integral", marca: "Pullman", preco: 9.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "pb-bisnaguinha-wickbold", nome: "Bisnaguinha Wickbold", marca: "Wickbold", preco: 7.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "pb-bolo-anamaria", nome: "Bolinho Ana Maria (unid.)", marca: "Ana Maria", preco: 3.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "pb-pao-queijo-fdm", nome: "Pão de Queijo Forno de Minas 400 g", marca: "Forno de Minas", preco: 16.9, tamanhos: ["media", "grande"] },
        { id: "pb-croissant", nome: "Croissant Folhado (unid.)", marca: "Padaria", preco: 5.5, tamanhos: ["media", "grande"] },
        { id: "pb-rosca-coco", nome: "Rosca de Coco (unid.)", marca: "Padaria", preco: 12.9, tamanhos: ["grande"] }
      ]
    },
    {
      id: "biscoitos",
      nome: "Biscoitos & Bolachas",
      contaNoLimite: true,
      itens: [
        { id: "bis-trakinas-morango", nome: "Biscoito Recheado Trakinas Morango", marca: "Trakinas", preco: 3.19, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-negresco", nome: "Biscoito Recheado Negresco", marca: "Negresco", preco: 3.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-bono-choc", nome: "Biscoito Bono Chocolate", marca: "Bono", preco: 3.29, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-passatempo", nome: "Biscoito Recheado Passatempo", marca: "Passatempo", preco: 3.39, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-club-social", nome: "Biscoito Club Social Original (6x)", marca: "Club Social", preco: 5.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-cream-cracker-adria", nome: "Cream Cracker Adria", marca: "Adria", preco: 4.29, tamanhos: ["pequena", "media", "grande"] },
        { id: "bis-waffer-bauducco", nome: "Wafer Bauducco Chocolate", marca: "Bauducco", preco: 3.79, tamanhos: ["media", "grande"] }
      ]
    },
    {
      id: "frios-queijos",
      nome: "Frios & Queijos",
      contaNoLimite: true,
      itens: [
        { id: "fq-queijo-prato-sadia", nome: "Queijo Prato Fatiado Sadia 150 g", marca: "Sadia", preco: 12.9, tamanhos: ["media", "grande"] },
        { id: "fq-presunto-seara", nome: "Presunto Cozido Fatiado Seara 150 g", marca: "Seara", preco: 9.9, tamanhos: ["media", "grande"] },
        { id: "fq-mussarela-tirolez", nome: "Mussarela Fatiada Tirolez 150 g", marca: "Tirolez", preco: 13.5, tamanhos: ["media", "grande"] },
        { id: "fq-requeijao-catupiry", nome: "Requeijão Catupiry 200 g", marca: "Catupiry", preco: 11.9, tamanhos: ["pequena", "media", "grande"] }
      ]
    },
    {
      id: "doces-geleias",
      nome: "Doces & Geleias",
      contaNoLimite: true,
      itens: [
        { id: "dg-geleia-queensberry", nome: "Geleia Queensberry Morango 320 g", marca: "Queensberry", preco: 15.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "dg-nutella-140", nome: "Creme de Avelã Nutella 140 g", marca: "Nutella", preco: 13.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "dg-doce-leite-aviacao", nome: "Doce de Leite Aviação 400 g", marca: "Aviação", preco: 12.5, tamanhos: ["media", "grande"] },
        { id: "dg-mel-karo", nome: "Mel Karo Squeeze 200 g", marca: "Karo", preco: 14.9, tamanhos: ["media", "grande"] },
        { id: "dg-pacoca-yoki", nome: "Paçoca Rolha Yoki (unid.)", marca: "Yoki", preco: 1.29, tamanhos: ["pequena", "media", "grande"] }
      ]
    },
    {
      id: "frutas",
      nome: "Frutas",
      contaNoLimite: true,
      itens: [
        { id: "fr-maca", nome: "Maçã Gala (unid.)", marca: "Hortifruti", preco: 1.99, tamanhos: ["pequena", "media", "grande"] },
        { id: "fr-banana", nome: "Banana Prata (unid.)", marca: "Hortifruti", preco: 1.29, tamanhos: ["pequena", "media", "grande"] },
        { id: "fr-uva-verde", nome: "Uva Verde sem Semente (150 g)", marca: "Hortifruti", preco: 6.9, tamanhos: ["media", "grande"] },
        { id: "fr-morango-bandeja", nome: "Morango Bandeja 250 g", marca: "Hortifruti", preco: 9.9, tamanhos: ["media", "grande"] },
        { id: "fr-kiwi", nome: "Kiwi (unid.)", marca: "Hortifruti", preco: 2.49, tamanhos: ["grande"] }
      ]
    },
    {
      id: "mercearia-cafe",
      nome: "Café & Mercearia",
      contaNoLimite: true,
      itens: [
        { id: "mc-cafe-pilao-sache", nome: "Café Pilão em sachê (10 g)", marca: "Pilão", preco: 1.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "mc-capuccino-3coracoes", nome: "Cappuccino 3 Corações Sachê", marca: "3 Corações", preco: 2.49, tamanhos: ["pequena", "media", "grande"] },
        { id: "mc-cha-twinings", nome: "Chá Twinings (cx. 10 saquinhos)", marca: "Twinings", preco: 11.9, tamanhos: ["media", "grande"] },
        { id: "mc-manteiga-aviacao", nome: "Manteiga Aviação 200 g", marca: "Aviação", preco: 13.9, tamanhos: ["media", "grande"] },
        { id: "mc-acucar-sache", nome: "Açúcar refinado em sachês (10x)", marca: "União", preco: 3.9, tamanhos: ["pequena", "media", "grande"] }
      ]
    },
    {
      id: "adicionais",
      nome: "Adicionais (opcional, à parte)",
      contaNoLimite: false,
      itens: [
        { id: "ad-caneca", nome: "Caneca personalizada", marca: "", preco: 24.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "ad-cartao", nome: "Cartão com mensagem", marca: "", preco: 5.0, tamanhos: ["pequena", "media", "grande"] },
        { id: "ad-balao", nome: "Balão metalizado", marca: "", preco: 14.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "ad-mini-buque", nome: "Mini buquê de flores", marca: "", preco: 29.9, tamanhos: ["pequena", "media", "grande"] },
        { id: "ad-espumante", nome: "Mini Espumante Salton 187 ml", marca: "Salton", preco: 22.9, tamanhos: ["media", "grande"] },
        { id: "ad-vinho-pergola", nome: "Vinho Pérgola Tinto Suave 750 ml", marca: "Pérgola", preco: 29.9, tamanhos: ["grande"] },
        { id: "ad-chocolate-lindt", nome: "Chocolate Lindt Lindor 100 g", marca: "Lindt", preco: 34.9, tamanhos: ["media", "grande"] },
        { id: "ad-taca", nome: "Par de taças de vidro", marca: "", preco: 19.9, tamanhos: ["media", "grande"] }
      ]
    }
  ]
};

export const REAL_COMPANY: Company = {
  id: "comp-cesta-1",
  name: "Cestas de Café da Manhã",
  legal_name: "Cestas & Cia Café da Manhã Ltda",
  cnpj: "42.109.876/0001-55",
  slug: "cestas-cafe-da-manha",
  email: "contato@cestasdecafedamanha.com.br",
  phone: "(11) 96382-0374",
  whatsapp: "5511963820374",
  description: "Monte a sua cesta e envie o pedido pelo WhatsApp.",
  subtitulo: "Monte a sua cesta e envie o pedido pelo WhatsApp",
  moeda: "BRL",
  avisoRodape: "Cardápio de exemplo — em ajustes.",
  breakfast_basket_enabled: true,
  active: true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export function getRealCategories(companyId: string = REAL_COMPANY.id): Category[] {
  return OFFICIAL_BREAKFAST_BASKET_JSON.categorias.map(cat => ({
    id: `cat-${cat.id}`,
    company_id: companyId,
    name: cat.nome,
    description: cat.contaNoLimite ? "Conta no limite de itens da cesta" : "Opcional, à parte (não conta no limite)",
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function getRealBrands(companyId: string = REAL_COMPANY.id): Brand[] {
  const brandSet = new Set<string>();
  OFFICIAL_BREAKFAST_BASKET_JSON.categorias.forEach(cat => {
    cat.itens.forEach(item => {
      if (item.marca && item.marca.trim()) {
        brandSet.add(item.marca.trim());
      }
    });
  });

  return Array.from(brandSet).map((brandName, idx) => ({
    id: `brand-${idx + 1}`,
    company_id: companyId,
    name: brandName,
    active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }));
}

export function getRealExpirationDate(categoryId: string, itemId: string): string | undefined {
  const addDays = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  switch (categoryId) {
    case 'frutas':
      if (itemId === 'fru-banana-prata') return addDays(3); // Vence em breve
      if (itemId === 'fru-mamao-papaya') return addDays(5);
      if (itemId === 'fru-uva-thompson') return addDays(7);
      if (itemId === 'fru-pera-williams') return addDays(9);
      return addDays(12);
    case 'frios-queijos':
      if (itemId === 'fq-presunto-seara') return addDays(5); // Vence em 5 dias
      if (itemId === 'fq-queijo-prato-sadia') return addDays(12);
      if (itemId === 'fq-mussarela-tirolez') return addDays(15);
      return addDays(40);
    case 'paes-bolos':
      if (itemId === 'pb-croissant') return addDays(3); // Padaria artesanal
      if (itemId === 'pb-rosca-coco') return addDays(5);
      if (itemId === 'pb-pao-forma-pullman') return addDays(14);
      if (itemId === 'pb-bisnaguinha-wickbold') return addDays(18);
      if (itemId === 'pb-bolo-anamaria') return addDays(30);
      return addDays(90);
    case 'bebidas':
      if (itemId === 'beb-iog-danone-170') return addDays(7);
      if (itemId === 'beb-suco-natone-500') return addDays(14);
      if (itemId === 'beb-ades-500') return addDays(45);
      if (itemId === 'beb-suco-delvalle-200') return addDays(60);
      if (itemId === 'beb-toddynho-200') return addDays(75);
      if (itemId === 'beb-agua-coco-200') return addDays(90);
      if (itemId === 'beb-cha-leao-450') return addDays(90);
      if (itemId === 'beb-maguary-1l') return addDays(100);
      if (itemId === 'beb-suco-aurora-1l') return addDays(120);
      return addDays(180);
    case 'biscoitos':
      if (itemId === 'bis-club-social') return addDays(90);
      if (itemId === 'bis-cream-cracker-adria') return addDays(120);
      return addDays(150);
    case 'doces-geleias':
      if (itemId === 'doc-mel-silvestre') return addDays(365);
      if (itemId === 'doc-doce-leite-vicosa') return addDays(180);
      if (itemId === 'doc-geleia-queensberry') return addDays(240);
      return addDays(300);
    case 'chocolates':
      if (itemId === 'choc-bombom-sonho') return addDays(120);
      if (itemId === 'choc-barra-milka') return addDays(180);
      if (itemId === 'choc-ferrero-rocher') return addDays(180);
      return addDays(240);
    case 'canecas-brindes':
      return undefined; // Não perecível
    default:
      return addDays(60);
  }
}

export function getRealProducts(companyId: string = REAL_COMPANY.id): Product[] {
  const products: Product[] = [];

  OFFICIAL_BREAKFAST_BASKET_JSON.categorias.forEach(cat => {
    cat.itens.forEach(item => {
      products.push({
        id: item.id,
        company_id: companyId,
        category_id: `cat-${cat.id}`,
        name: item.nome,
        description: `${item.nome} (${item.marca || 'Sem marca'}). Ideal para montagem de cestas matinais personalizadas.`,
        sku: item.id.toUpperCase(),
        barcode: `789${Math.floor(1000000000 + Math.random() * 9000000000)}`,
        unit: 'UN',
        cost_price: Number((item.preco * 0.6).toFixed(2)),
        sale_price: item.preco,
        minimum_stock: 5,
        maximum_stock: 50,
        expiration_date: getRealExpirationDate(cat.id, item.id),
        active: true,
        catalog_visible: true,
        show_price: true,
        allow_contact: true,
        active_in_basket: true,
        basket_sizes: item.tamanhos,
        drink_tier: item.tamanhoBebida,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        inventory: {
          id: `inv-${item.id}`,
          company_id: companyId,
          product_id: item.id,
          quantity: 25,
          reserved_quantity: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      });
    });
  });

  return products;
}

/**
 * Função para exportar dinamicamente o JSON da cesta para a empresa informada,
 * coletando estritamente os produtos marcados como 'active_in_basket' daquela empresa.
 */
export function exportCompanyBasketJson(
  company: Company,
  products: Product[],
  categories: Category[]
): BreakfastBasketExportJson {
  // Filtra apenas produtos marcados como ativos na cesta
  const basketProducts = products.filter(p => p.company_id === company.id && p.active_in_basket !== false);

  const basketCategories = OFFICIAL_BREAKFAST_BASKET_JSON.categorias.map(baseCat => {
    // Procura a categoria correspondente
    const matchingCat = categories.find(c => c.name.toLowerCase() === baseCat.nome.toLowerCase() || c.id === `cat-${baseCat.id}`);
    
    // Itens correspondentes a esta categoria
    const matchingProducts = basketProducts.filter(p => 
      p.category_id === `cat-${baseCat.id}` || 
      (matchingCat && p.category_id === matchingCat.id) ||
      p.id.startsWith(baseCat.id.substring(0, 3))
    );

    const items = matchingProducts.map(p => ({
      id: p.id,
      nome: p.name,
      marca: p.brand?.name || (p as any).marca || '',
      preco: p.sale_price,
      tamanhoBebida: p.drink_tier,
      tamanhos: p.basket_sizes || ['pequena', 'media', 'grande'],
    }));

    return {
      id: baseCat.id,
      nome: baseCat.nome,
      contaNoLimite: baseCat.contaNoLimite,
      itens: items.length > 0 ? items : baseCat.itens,
    };
  });

  return {
    loja: {
      nome: company.name,
      subtitulo: company.subtitulo || company.description || "Monte a sua cesta e envie o pedido pelo WhatsApp",
      whatsapp: company.whatsapp?.replace(/\D/g, '') || "5511963820374",
      moeda: company.moeda || "BRL",
      heroImagem: company.logo_url || "",
      avisoRodape: company.avisoRodape || "Cardápio de exemplo — em ajustes."
    },
    tamanhos: OFFICIAL_BREAKFAST_BASKET_JSON.tamanhos,
    regras: OFFICIAL_BREAKFAST_BASKET_JSON.regras,
    categorias: basketCategories,
  };
}
