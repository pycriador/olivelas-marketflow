/**
 * Gerador de Especificação OpenAPI 3.0 do MarketFlow API v1
 * Acessível via /api/openapi.json e renderizável via Swagger UI / Redoc UI
 */
export const openApiSpecV1 = {
  openapi: '3.0.3',
  info: {
    title: 'MarketFlow SaaS API',
    version: '1.0.0',
    description: `
API RESTful oficial do MarketFlow SaaS para gestão inteligente de catálogo, produtos, estoque multi-tenant, reconhecimento visual por Inteligência Artificial e mensagens WhatsApp.

### Autenticação
Todas as requisições autenticadas exigem um cabeçalho HTTP no formato:
\`Authorization: Bearer mf_live_...\` ou \`Authorization: Bearer mf_test_...\`

### Suporte a Idempotência
Para operações de modificação (POST, PATCH, DELETE), você pode enviar o cabeçalho \`Idempotency-Key: <unique_string>\` para evitar duplicidades em caso de retentativas de rede.
    `,
    contact: {
      name: 'MarketFlow Developer Experience Team',
      email: 'suporte.dev@marketflow.app',
      url: 'https://marketflow.app/desenvolvedores',
    },
    license: {
      name: 'Proprietário Multi-tenant SaaS',
    },
  },
  servers: [
    {
      url: 'https://api.marketflow.app/api/v1',
      description: 'Servidor de Produção (Live)',
    },
    {
      url: 'http://localhost:5173/api/v1',
      description: 'Servidor de Desenvolvimento Local',
    },
  ],
  security: [
    {
      BearerAuth: [],
    },
  ],
  paths: {
    '/products': {
      get: {
        summary: 'Listar Produtos',
        description: 'Retorna a lista paginada de produtos da empresa com suporte a busca, filtros por categoria/marca e ordenação.',
        operationId: 'listProducts',
        tags: ['Produtos'],
        security: [{ BearerAuth: ['products:read'] }],
        parameters: [
          { name: 'page', in: 'query', schema: { type: 'integer', default: 1 } },
          { name: 'page_size', in: 'query', schema: { type: 'integer', default: 25, maximum: 100 } },
          { name: 'search', in: 'query', schema: { type: 'string' }, description: 'Busca por nome, SKU ou barcode' },
          { name: 'category_id', in: 'query', schema: { type: 'string', format: 'uuid' } },
        ],
        responses: {
          '200': {
            description: 'Lista de produtos retornada com sucesso.',
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/ProductListResponse',
                },
              },
            },
          },
          '401': { $ref: '#/components/responses/UnauthorizedError' },
          '403': { $ref: '#/components/responses/ForbiddenError' },
        },
      },
      post: {
        summary: 'Criar Produto',
        description: 'Cadastra um novo produto no estoque da empresa.',
        operationId: 'createProduct',
        tags: ['Produtos'],
        security: [{ BearerAuth: ['products:write'] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/ProductInput' },
            },
          },
        },
        responses: {
          '201': {
            description: 'Produto criado com sucesso.',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/ProductSingleResponse' },
              },
            },
          },
          '400': { $ref: '#/components/responses/ValidationError' },
        },
      },
    },
    '/products/{id}': {
      get: {
        summary: 'Obter Detalhes do Produto',
        operationId: 'getProductById',
        tags: ['Produtos'],
        security: [{ BearerAuth: ['products:read'] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Detalhes do produto.' },
          '404': { $ref: '#/components/responses/NotFoundError' },
        },
      },
      patch: {
        summary: 'Atualizar Parcialmente Produto',
        operationId: 'updateProduct',
        tags: ['Produtos'],
        security: [{ BearerAuth: ['products:write'] }],
        parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
        responses: {
          '200': { description: 'Produto atualizado.' },
        },
      },
    },
    '/inventory/{product_id}/entry': {
      post: {
        summary: 'Dar Entrada de Estoque',
        description: 'Adiciona saldo ao produto e gera histórico auditável de movimentação.',
        operationId: 'addInventoryEntry',
        tags: ['Estoque'],
        security: [{ BearerAuth: ['inventory:write'] }],
        parameters: [{ name: 'product_id', in: 'path', required: true, schema: { type: 'string' } }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['quantity', 'unit_cost'],
                properties: {
                  quantity: { type: 'number', example: 50 },
                  unit_cost: { type: 'number', example: 12.5 },
                  notes: { type: 'string', example: 'NF 1042' },
                },
              },
            },
          },
        },
        responses: {
          '200': { description: 'Estoque atualizado com sucesso.' },
        },
      },
    },
    '/ai/analyze-image': {
      post: {
        summary: 'Analisar Imagem de Produto por IA',
        description: 'Processa uma imagem de embalagem/rótulo utilizando a camada de IA e retorna campos sugeridos com Confidence Score.',
        operationId: 'analyzeImageAI',
        tags: ['Inteligência Artificial'],
        security: [{ BearerAuth: ['ai:use'] }],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['image_url'],
                properties: {
                  image_url: { type: 'string', example: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c' },
                  provider: { type: 'string', enum: ['openai', 'gemini', 'anthropic', 'mock'], default: 'openai' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Resultado da análise com confidence score.',
          },
        },
      },
    },
  },
  components: {
    securitySchemes: {
      BearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'API Key (mf_live_...)',
      },
    },
    schemas: {
      ProductInput: {
        type: 'object',
        required: ['name', 'price'],
        properties: {
          name: { type: 'string', example: 'Arroz Integral 1kg' },
          sku: { type: 'string', example: 'ARR-001' },
          barcode: { type: 'string', example: '7891234567890' },
          price: { type: 'number', example: 8.9 },
          cost_price: { type: 'number', example: 5.5 },
          min_stock: { type: 'number', example: 10 },
          unit: { type: 'string', example: 'UN' },
        },
      },
      ProductListResponse: {
        type: 'object',
        properties: {
          data: {
            type: 'array',
            items: { $ref: '#/components/schemas/ProductInput' },
          },
          meta: {
            type: 'object',
            properties: {
              page: { type: 'integer', example: 1 },
              page_size: { type: 'integer', example: 25 },
              total: { type: 'integer', example: 100 },
            },
          },
        },
      },
    },
    responses: {
      UnauthorizedError: {
        description: 'Token de autenticação ausente ou inválido.',
        content: {
          'application/json': {
            schema: {
              type: 'object',
              properties: {
                error: {
                  type: 'object',
                  properties: {
                    code: { type: 'string', example: 'UNAUTHORIZED' },
                    message: { type: 'string', example: 'Formato de autorização inválido.' },
                  },
                },
              },
            },
          },
        },
      },
      ForbiddenError: {
        description: 'Token não possui o escopo necessário.',
      },
      NotFoundError: {
        description: 'Recurso não encontrado.',
      },
      ValidationError: {
        description: 'Campos inválidos no corpo da requisição.',
      },
    },
  },
};
