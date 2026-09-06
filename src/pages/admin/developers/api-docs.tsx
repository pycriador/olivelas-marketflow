import React, { useState } from 'react';
import { Terminal, Copy, Check, Code2, Shield, Layers, Play, ExternalLink, Download } from 'lucide-react';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Breadcrumbs } from '../../../components/layout/breadcrumbs';
import { openApiSpecV1 } from '../../../api/v1/openapi-spec';

type CodeLang = 'curl' | 'javascript' | 'typescript' | 'python';

export const ApiDocsPage: React.FC<{ onNavigate?: (path: string) => void }> = ({ onNavigate }) => {
  const [selectedLang, setSelectedLang] = useState<CodeLang>('curl');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('list_products');
  const [copied, setCopied] = useState(false);
  const [showSpecJsonModal, setShowSpecJsonModal] = useState(false);

  const getCodeSnippet = (endpointKey: string, lang: CodeLang): string => {
    switch (endpointKey) {
      case 'list_products':
        if (lang === 'curl') {
          return `curl -X GET "https://api.marketflow.app/api/v1/products?page=1&page_size=25" \\
  -H "Authorization: Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0" \\
  -H "Content-Type: application/json"`;
        }
        if (lang === 'javascript') {
          return `const response = await fetch('https://api.marketflow.app/api/v1/products?page=1&page_size=25', {
  headers: {
    'Authorization': 'Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0',
    'Content-Type': 'application/json'
  }
});
const { data, meta } = await response.json();
console.log('Produtos:', data);`;
        }
        if (lang === 'typescript') {
          return `import { ApiResponse, Product } from '@marketflow/sdk';

const res = await fetch('https://api.marketflow.app/api/v1/products', {
  headers: { Authorization: 'Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0' }
});
const { data }: ApiResponse<Product[]> = await res.json();`;
        }
        if (lang === 'python') {
          return `import requests

headers = {
    'Authorization': 'Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0',
    'Content-Type': 'application/json'
}
response = requests.get('https://api.marketflow.app/api/v1/products', headers=headers)
print(response.json())`;
        }
        return '';

      case 'add_inventory':
        if (lang === 'curl') {
          return `curl -X POST "https://api.marketflow.app/api/v1/inventory/prod-102/entry" \\
  -H "Authorization: Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0" \\
  -H "Idempotency-Key: idem_7721_abc" \\
  -H "Content-Type: application/json" \\
  -d '{
    "quantity": 50,
    "unit_cost": 12.50,
    "notes": "Entrada Nota Fiscal 4092"
  }'`;
        }
        if (lang === 'javascript') {
          return `const res = await fetch('https://api.marketflow.app/api/v1/inventory/prod-102/entry', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0',
    'Idempotency-Key': 'idem_7721_abc',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    quantity: 50,
    unit_cost: 12.50,
    notes: 'Entrada Nota Fiscal 4092'
  })
});`;
        }
        if (lang === 'typescript') {
          return `const body = { quantity: 50, unit_cost: 12.50, notes: 'NF 4092' };
const res = await api.post('/inventory/prod-102/entry', body, {
  headers: { 'Idempotency-Key': crypto.randomUUID() }
});`;
        }
        if (lang === 'python') {
          return `import requests

payload = {"quantity": 50, "unit_cost": 12.50, "notes": "NF 4092"}
headers = {
    'Authorization': 'Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0',
    'Idempotency-Key': 'idem_7721_abc'
}
res = requests.post('https://api.marketflow.app/api/v1/inventory/prod-102/entry', json=payload, headers=headers)`;
        }
        return '';

      case 'ai_analyze':
        if (lang === 'curl') {
          return `curl -X POST "https://api.marketflow.app/api/v1/ai/analyze-image" \\
  -H "Authorization: Bearer mf_live_a8f9b1c2d3e4f5a6b7c8d9e0" \\
  -H "Content-Type: application/json" \\
  -d '{
    "image_url": "https://example.com/rotulo.jpg",
    "provider": "openai"
  }'`;
        }
        return `// Análise Multimodal de Imagem por IA\nconst res = await api.post('/ai/analyze-image', { image_url: 'https://example.com/rotulo.jpg' });`;

      default:
        return '';
    }
  };

  const handleCopyCode = () => {
    const code = getCodeSnippet(selectedEndpoint, selectedLang);
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadSpec = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(openApiSpecV1, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'marketflow-openapi-v1.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col space-y-2 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
        <div>
          <Breadcrumbs items={[{ label: 'Desenvolvedores' }, { label: 'Documentação OpenAPI' }]} />
          <h1 className="mt-1 text-2xl font-bold tracking-tight">Documentação Interativa da API v1</h1>
          <p className="text-sm text-muted-foreground">
            Explore endpoints RESTful, contratos de request/response e trechos de código em cURL, JS, TS e Python.
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" onClick={handleDownloadSpec}>
            <Download className="mr-1.5 h-4 w-4" /> Download OpenAPI JSON
          </Button>
          <Button size="sm" onClick={() => setShowSpecJsonModal(true)}>
            <Code2 className="mr-1.5 h-4 w-4" /> Ver JSON OpenAPI
          </Button>
        </div>
      </div>

      {/* Grid Principal */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Sidebar de Endpoints (Esquerda) */}
        <div className="lg:col-span-4 space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center">
                <Layers className="mr-2 h-4 w-4 text-primary" /> Endpoints Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-1 p-2">
              <button
                onClick={() => setSelectedEndpoint('list_products')}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                  selectedEndpoint === 'list_products' ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'hover:bg-accent text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-emerald-600 text-[10px]">GET</Badge>
                  <span>/api/v1/products</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedEndpoint('add_inventory')}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                  selectedEndpoint === 'add_inventory' ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'hover:bg-accent text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-blue-600 text-[10px]">POST</Badge>
                  <span>/api/v1/inventory/{'{id}'}/entry</span>
                </div>
              </button>

              <button
                onClick={() => setSelectedEndpoint('ai_analyze')}
                className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-medium text-left transition-all ${
                  selectedEndpoint === 'ai_analyze' ? 'bg-primary/10 text-primary font-bold border-l-4 border-primary' : 'hover:bg-accent text-foreground'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <Badge variant="default" className="bg-purple-600 text-[10px]">POST</Badge>
                  <span>/api/v1/ai/analyze-image</span>
                </div>
              </button>
            </CardContent>
          </Card>

          {/* Card de Autenticação */}
          <Card className="bg-card/50">
            <CardHeader>
              <CardTitle className="text-sm flex items-center text-foreground">
                <Shield className="mr-2 h-4 w-4 text-primary" /> Cabeçalhos Padrão
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-xs font-mono">
              <div className="p-2 rounded bg-muted/60">
                <span className="text-muted-foreground block text-[10px] uppercase">Autenticação:</span>
                <span className="text-primary font-bold">Authorization: Bearer mf_live_...</span>
              </div>
              <div className="p-2 rounded bg-muted/60">
                <span className="text-muted-foreground block text-[10px] uppercase">Idempotência:</span>
                <span className="text-foreground">Idempotency-Key: &lt;uuid&gt;</span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Editor & Preview de Código (Direita) */}
        <div className="lg:col-span-8 space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between border-b pb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="h-5 w-5 text-primary" />
                <CardTitle className="text-base">Exemplo de Requisição</CardTitle>
              </div>

              {/* Seletor de Linguagem */}
              <div className="flex items-center space-x-1 bg-muted p-1 rounded-md">
                {(['curl', 'javascript', 'typescript', 'python'] as CodeLang[]).map(lang => (
                  <button
                    key={lang}
                    onClick={() => setSelectedLang(lang)}
                    className={`px-2.5 py-1 text-xs font-semibold rounded transition-all capitalize ${
                      selectedLang === lang ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {lang}
                  </button>
                ))}
              </div>
            </CardHeader>

            <CardContent className="pt-4 space-y-4">
              <div className="relative">
                <pre className="p-4 rounded-lg bg-slate-950 text-slate-100 font-mono text-xs overflow-x-auto border border-slate-800 leading-relaxed">
                  <code>{getCodeSnippet(selectedEndpoint, selectedLang)}</code>
                </pre>
                <button
                  onClick={handleCopyCode}
                  className="absolute right-3 top-3 rounded-md bg-slate-800 p-1.5 text-slate-300 hover:bg-slate-700 hover:text-white transition-colors"
                  title="Copiar código"
                >
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>

              {/* Resposta de Exemplo */}
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground mb-2">
                  Resposta de Exemplo (Standard Envelope)
                </h4>
                <pre className="p-4 rounded-lg bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800">
                  <code>
{selectedEndpoint === 'list_products' ? `{
  "data": [
    {
      "id": "prod-1",
      "name": "Arroz Integral 1kg",
      "sku": "ARR-001",
      "barcode": "7891234567890",
      "price": 8.90,
      "stock_quantity": 42
    }
  ],
  "meta": {
    "page": 1,
    "page_size": 25,
    "total": 100,
    "correlation_id": "req_a91bf8c0"
  }
}` : `{
  "data": {
    "movement_id": "mov-9912",
    "product_id": "prod-102",
    "new_balance": 92,
    "unit_cost": 12.50
  },
  "meta": {
    "correlation_id": "req_7721cc09"
  }
}`}
                  </code>
                </pre>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal do JSON da OpenAPI */}
      {showSpecJsonModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-4 animate-in fade-in-50">
          <div className="w-full max-w-4xl rounded-xl border bg-card p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-lg font-bold">Especificação OpenAPI 3.0 (JSON)</h3>
              <Button size="sm" variant="outline" onClick={() => setShowSpecJsonModal(false)}>
                Fechar
              </Button>
            </div>
            <pre className="flex-1 p-4 rounded-lg bg-slate-950 text-slate-200 font-mono text-xs overflow-y-auto border border-slate-800">
              <code>{JSON.stringify(openApiSpecV1, null, 2)}</code>
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};
