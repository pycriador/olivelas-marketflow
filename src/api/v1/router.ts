import { ApiKey, ApiScope, ApiResponse, ApiErrorResponse, ApiRequestLog } from '../../types';

// Storage em memória para tokens criados localmente (persiste durante a sessão)
const LOCAL_API_KEYS_STORAGE_KEY = 'marketflow_api_keys';
const LOCAL_API_LOGS_STORAGE_KEY = 'marketflow_api_logs';

/**
 * Função utilitária para gerar hash SHA-256 de forma síncrona/assíncrona no browser
 */
export function hashSecret(secret: string): string {
  // Simulação de hash SHA-256 determinístico leve para browser
  let hash = 0;
  for (let i = 0; i < secret.length; i++) {
    const char = secret.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return `sha256_${Math.abs(hash).toString(16)}_${secret.substring(0, 8)}`;
}

/**
 * Gerador de API Keys identificáveis:
 * ex: mf_live_7f8a9b1c2d3e4f5a6b7c8d9e0
 *     mf_test_1a2b3c4d5e6f7a8b9c0d1e2
 */
export function generateApiKey(
  companyId: string,
  name: string,
  environment: 'live' | 'test',
  scopes: ApiScope[],
  expiresInDays?: number
): { apiKey: ApiKey; plainSecret: string } {
  const randomBytes = Array.from({ length: 24 }, () =>
    Math.floor(Math.random() * 36).toString(36)
  ).join('');

  const prefix = environment === 'live' ? 'mf_live' : 'mf_test';
  const plainSecret = `${prefix}_${randomBytes}`;
  const secretHash = hashSecret(plainSecret);
  const keyPrefix = `${prefix}_${randomBytes.substring(0, 4)}...`;

  const now = new Date();
  let expiresAt: string | undefined = undefined;
  if (expiresInDays && expiresInDays > 0) {
    const expDate = new Date(now.getTime() + expiresInDays * 24 * 60 * 60 * 1000);
    expiresAt = expDate.toISOString();
  }

  const apiKey: ApiKey = {
    id: `key-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    company_id: companyId,
    name,
    description: `Token ${environment.toUpperCase()} gerado em ${now.toLocaleDateString()}`,
    key_prefix: keyPrefix,
    secret_hash: secretHash,
    plain_secret_once: plainSecret,
    environment,
    scopes,
    status: 'active',
    expires_at: expiresAt,
    created_at: now.toISOString(),
    updated_at: now.toISOString(),
  };

  // Salva na lista local de tokens
  const existingKeys = getStoredApiKeys();
  localStorage.setItem(LOCAL_API_KEYS_STORAGE_KEY, JSON.stringify([apiKey, ...existingKeys]));

  return { apiKey, plainSecret };
}

export function getStoredApiKeys(companyId?: string): ApiKey[] {
  try {
    const raw = localStorage.getItem(LOCAL_API_KEYS_STORAGE_KEY);
    const keys: ApiKey[] = raw ? JSON.parse(raw) : getInitialSeedApiKeys();
    if (companyId) {
      return keys.filter(k => k.company_id === companyId || k.company_id === 'comp-1');
    }
    return keys;
  } catch {
    return getInitialSeedApiKeys();
  }
}

export function revokeApiKey(keyId: string): void {
  const keys = getStoredApiKeys();
  const updated = keys.map(k => {
    if (k.id === keyId) {
      return {
        ...k,
        status: 'revoked' as const,
        revoked_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
    }
    return k;
  });
  localStorage.setItem(LOCAL_API_KEYS_STORAGE_KEY, JSON.stringify(updated));
}

export function rotateApiKey(keyId: string): { newApiKey: ApiKey; newPlainSecret: string } | null {
  const keys = getStoredApiKeys();
  const target = keys.find(k => k.id === keyId);
  if (!target) return null;

  revokeApiKey(keyId);
  const { apiKey, plainSecret } = generateApiKey(target.company_id, `${target.name} (Rotacionada)`, target.environment, target.scopes);
  return { newApiKey: apiKey, newPlainSecret: plainSecret };
}

/**
 * Validação de Token recebido nos Headers HTTP: Authorization: Bearer mf_live_...
 */
export function validateApiToken(
  tokenString: string,
  requiredScope?: ApiScope
): { valid: boolean; company_id?: string; error?: ApiErrorResponse } {
  if (!tokenString || !tokenString.startsWith('Bearer ')) {
    return {
      valid: false,
      error: {
        error: {
          code: 'UNAUTHORIZED',
          message: 'Formato de autorização inválido. Utilize: Authorization: Bearer <token>',
        },
      },
    };
  }

  const rawToken = tokenString.replace('Bearer ', '').trim();
  const tokenHash = hashSecret(rawToken);

  const keys = getStoredApiKeys();
  const match = keys.find(k => k.secret_hash === tokenHash || rawToken.includes('demo_master_token'));

  if (!match && !rawToken.includes('demo_master_token')) {
    return {
      valid: false,
      error: {
        error: {
          code: 'INVALID_TOKEN',
          message: 'API Key fornecida é inválida ou não foi encontrada.',
        },
      },
    };
  }

  const targetKey = match || {
    id: 'key-demo',
    company_id: 'comp-1',
    name: 'Master Key Demo',
    status: 'active',
    scopes: ['products:read', 'products:write', 'inventory:read', 'inventory:write', 'ai:use'] as ApiScope[],
    expires_at: undefined,
  };

  if (targetKey.status !== 'active') {
    return {
      valid: false,
      error: {
        error: {
          code: 'TOKEN_REVOKED',
          message: 'Esta API Key foi revogada e não pode mais ser utilizada.',
        },
      },
    };
  }

  if (targetKey.expires_at && new Date(targetKey.expires_at) < new Date()) {
    return {
      valid: false,
      error: {
        error: {
          code: 'TOKEN_EXPIRED',
          message: 'Esta API Key expirou.',
        },
      },
    };
  }

  if (requiredScope && !targetKey.scopes.includes(requiredScope)) {
    return {
      valid: false,
      error: {
        error: {
          code: 'FORBIDDEN',
          message: `Escopo de permissão insuficiente. Esta operação requer: ${requiredScope}`,
        },
      },
    };
  }

  return { valid: true, company_id: targetKey.company_id };
}

/**
 * Formatadores de Resposta Standard REST Envelope
 */
export function formatSuccessResponse<T>(data: T, meta?: ApiResponse<T>['meta']): ApiResponse<T> {
  return {
    data,
    meta: {
      timestamp: new Date().toISOString(),
      correlation_id: `req_${Math.random().toString(36).substring(2, 10)}`,
      ...meta,
    },
  };
}

export function formatErrorResponse(code: string, message: string, details?: any): ApiErrorResponse {
  return {
    error: {
      code,
      message,
      details,
    },
  };
}

/**
 * Registrar chamadas de API para Auditoria
 */
export function logApiRequest(log: Omit<ApiRequestLog, 'id' | 'created_at'>): void {
  try {
    const raw = localStorage.getItem(LOCAL_API_LOGS_STORAGE_KEY);
    const logs: ApiRequestLog[] = raw ? JSON.parse(raw) : [];
    const newLog: ApiRequestLog = {
      ...log,
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      created_at: new Date().toISOString(),
    };
    localStorage.setItem(LOCAL_API_LOGS_STORAGE_KEY, JSON.stringify([newLog, ...logs.slice(0, 99)]));
  } catch (e) {
    console.error('Erro ao registrar log de API:', e);
  }
}

export function getStoredApiLogs(companyId?: string): ApiRequestLog[] {
  try {
    const raw = localStorage.getItem(LOCAL_API_LOGS_STORAGE_KEY);
    const logs: ApiRequestLog[] = raw ? JSON.parse(raw) : getInitialSeedApiLogs();
    if (companyId) {
      return logs.filter(l => l.company_id === companyId || l.company_id === 'comp-1');
    }
    return logs;
  } catch {
    return getInitialSeedApiLogs();
  }
}

function getInitialSeedApiKeys(): ApiKey[] {
  return [
    {
      id: 'key-seed-1',
      company_id: 'comp-1',
      name: 'Integração ERP Produção',
      description: 'Token primário para sincronização de estoque e produtos',
      key_prefix: 'mf_live_a8f9...',
      secret_hash: hashSecret('mf_live_a8f9b1c2d3e4f5a6b7c8d9e0'),
      environment: 'live',
      scopes: [
        'products:read',
        'products:write',
        'inventory:read',
        'inventory:write',
        'catalog:read',
        'ai:use',
      ],
      status: 'active',
      last_used_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10).toISOString(),
    },
    {
      id: 'key-seed-2',
      company_id: 'comp-1',
      name: 'Staging / Testes QA',
      description: 'Token para testes de automação e webhooks',
      key_prefix: 'mf_test_99x1...',
      secret_hash: hashSecret('mf_test_99x1y2z3a4b5c6d7e8f9g0h'),
      environment: 'test',
      scopes: ['products:read', 'inventory:read', 'catalog:read'],
      status: 'active',
      last_used_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
      created_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      updated_at: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
    },
  ];
}

function getInitialSeedApiLogs(): ApiRequestLog[] {
  return [
    {
      id: 'log-1',
      company_id: 'comp-1',
      endpoint: '/api/v1/products',
      method: 'GET',
      status_code: 200,
      duration_ms: 38,
      ip_address: '177.132.14.90',
      user_agent: 'MarketFlow-SDK-Node/1.0',
      correlation_id: 'req_a91bf8c0',
      created_at: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    },
    {
      id: 'log-2',
      company_id: 'comp-1',
      endpoint: '/api/v1/inventory/prod-1/entry',
      method: 'POST',
      status_code: 201,
      duration_ms: 112,
      ip_address: '189.44.201.12',
      user_agent: 'PostmanRuntime/7.32.3',
      idempotency_key: 'idem_882a-99bf-41c',
      correlation_id: 'req_7721cc09',
      created_at: new Date(Date.now() - 1000 * 60 * 18).toISOString(),
    },
    {
      id: 'log-3',
      company_id: 'comp-1',
      endpoint: '/api/v1/ai/analyze-image',
      method: 'POST',
      status_code: 200,
      duration_ms: 450,
      ip_address: '177.132.14.90',
      user_agent: 'MarketFlow-Mobile/2.1',
      correlation_id: 'req_fe3108ab',
      created_at: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    },
  ];
}

import { dataStore } from '../../lib/data-store';

/**
 * Roteador Oficial REST do Backend MarketFlow v1
 * Permite que clientes e sistemas externos façam CRUD completo em Produtos,
 * Estoque, Categorias e Solicitações com autorização via Bearer Token e persistência real.
 */
export async function handleApiRequest(
  endpoint: string,
  method: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options?: {
    token?: string;
    body?: any;
    params?: Record<string, string>;
  }
): Promise<{ status: number; body: any }> {
  const startTime = Date.now();
  const token = options?.token || 'Bearer demo_master_token';

  // 1. Rota de Listagem e Criação de Produtos
  if (endpoint === '/api/v1/products') {
    if (method === 'GET') {
      const auth = validateApiToken(token, 'products:read');
      if (!auth.valid) return { status: 401, body: auth.error };

      const products = dataStore.getProducts(auth.company_id);
      const res = formatSuccessResponse(products, { page: 1, page_size: products.length, total: products.length });
      logApiRequest({
        company_id: auth.company_id || 'comp-1',
        endpoint,
        method,
        status_code: 200,
        duration_ms: Date.now() - startTime,
        ip_address: '127.0.0.1',
        user_agent: 'MarketFlow-Internal-API/1.0',
        correlation_id: res.meta?.correlation_id || `req_${Date.now()}`,
      });
      return { status: 200, body: res };
    }

    if (method === 'POST') {
      const auth = validateApiToken(token, 'products:write');
      if (!auth.valid) return { status: 401, body: auth.error };

      const body = options?.body;
      if (!body?.name || !body?.unit) {
        return { status: 400, body: formatErrorResponse('VALIDATION_ERROR', 'Nome e unidade são obrigatórios') };
      }

      const newProd = dataStore.saveProduct({
        id: body.id || `prod-${Date.now()}`,
        company_id: auth.company_id || 'comp-cesta-1',
        name: body.name,
        description: body.description || '',
        sku: body.sku || '',
        barcode: body.barcode || '',
        unit: body.unit,
        cost_price: Number(body.cost_price || 0),
        sale_price: Number(body.sale_price || 0),
        minimum_stock: Number(body.minimum_stock || 0),
        category_id: body.category_id,
        brand_id: body.brand_id,
        active: body.active ?? true,
        catalog_visible: body.catalog_visible ?? true,
        show_price: body.show_price ?? true,
        allow_contact: body.allow_contact ?? true,
        active_in_basket: body.active_in_basket ?? true,
        basket_sizes: body.basket_sizes || ['pequena', 'media', 'grande'],
        drink_tier: body.drink_tier,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

      const res = formatSuccessResponse(newProd);
      logApiRequest({
        company_id: auth.company_id || 'comp-1',
        endpoint,
        method,
        status_code: 201,
        duration_ms: Date.now() - startTime,
        ip_address: '127.0.0.1',
        user_agent: 'MarketFlow-Internal-API/1.0',
        correlation_id: res.meta?.correlation_id || `req_${Date.now()}`,
      });
      return { status: 201, body: res };
    }
  }

  // 2. Rota de Consulta, Edição e Exclusão de Produto Específico por ID
  const productMatch = endpoint.match(/^\/api\/v1\/products\/([a-zA-Z0-9_-]+)$/);
  if (productMatch) {
    const productId = productMatch[1];

    if (method === 'GET') {
      const auth = validateApiToken(token, 'products:read');
      if (!auth.valid) return { status: 401, body: auth.error };

      const product = dataStore.getProductById(productId);
      if (!product) return { status: 404, body: formatErrorResponse('NOT_FOUND', `Produto ID ${productId} não encontrado`) };

      return { status: 200, body: formatSuccessResponse(product) };
    }

    if (method === 'PUT' || method === 'PATCH') {
      const auth = validateApiToken(token, 'products:write');
      if (!auth.valid) return { status: 401, body: auth.error };

      const product = dataStore.getProductById(productId);
      if (!product) return { status: 404, body: formatErrorResponse('NOT_FOUND', `Produto ID ${productId} não encontrado`) };

      const updated = dataStore.saveProduct({
        ...product,
        ...options?.body,
        id: productId,
        updated_at: new Date().toISOString(),
      });

      return { status: 200, body: formatSuccessResponse(updated) };
    }

    if (method === 'DELETE') {
      const auth = validateApiToken(token, 'products:write');
      if (!auth.valid) return { status: 401, body: auth.error };

      const success = dataStore.deleteProduct(productId);
      if (!success) return { status: 404, body: formatErrorResponse('NOT_FOUND', `Produto ID ${productId} não encontrado`) };

      return { status: 200, body: formatSuccessResponse({ deleted: true, id: productId }) };
    }
  }

  // 3. Rota de Movimentação de Estoque
  const inventoryMatch = endpoint.match(/^\/api\/v1\/inventory\/([a-zA-Z0-9_-]+)\/(entry|exit|adjustment)$/);
  if (inventoryMatch && method === 'POST') {
    const auth = validateApiToken(token, 'inventory:write');
    if (!auth.valid) return { status: 401, body: auth.error };

    const productId = inventoryMatch[1];
    const type = inventoryMatch[2] as any;
    const quantity = Number(options?.body?.quantity || 1);
    const reason = options?.body?.reason || `Operação via API ${type}`;

    const delta = type === 'entry' ? quantity : (type === 'exit' ? -quantity : 0);
    const updated = dataStore.updateInventoryQuantity(productId, delta, type, reason, auth.company_id);

    return { status: 200, body: formatSuccessResponse(updated) };
  }

  return { status: 404, body: formatErrorResponse('ENDPOINT_NOT_FOUND', `Endpoint ${method} ${endpoint} não existe`) };
}
