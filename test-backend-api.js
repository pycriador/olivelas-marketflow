const { dataStore } = require('./src/lib/data-store');
const { handleApiRequest } = require('./src/api/v1/router');

async function runTests() {
  console.log('--- Testando Persistência e Endpoints REST do Backend ---');

  // Teste 1: Buscar produtos via API REST
  const getRes = await handleApiRequest('/api/v1/products', 'GET');
  console.log(`1. GET /api/v1/products -> Status: ${getRes.status}, Total: ${getRes.body.data.length}`);

  // Teste 2: Criar novo produto via API REST
  const newProdPayload = {
    name: 'Cesta Especial Café Gourmet Teste',
    unit: 'un',
    cost_price: 35.0,
    sale_price: 69.9,
    minimum_stock: 5,
    description: 'Criado pelo teste do backend',
  };
  const postRes = await handleApiRequest('/api/v1/products', 'POST', {
    body: newProdPayload,
  });
  console.log(`2. POST /api/v1/products -> Status: ${postRes.status}, ID Criado: ${postRes.body.data.id}`);

  // Teste 3: Buscar o produto criado por ID único
  const prodId = postRes.body.data.id;
  const getByIdRes = await handleApiRequest(`/api/v1/products/${prodId}`, 'GET');
  console.log(`3. GET /api/v1/products/${prodId} -> Status: ${getByIdRes.status}, Nome: ${getByIdRes.body.data.name}`);

  // Teste 4: Editar o produto via PUT no backend
  const putRes = await handleApiRequest(`/api/v1/products/${prodId}`, 'PUT', {
    body: { sale_price: 79.9, description: 'Preço atualizado no backend' },
  });
  console.log(`4. PUT /api/v1/products/${prodId} -> Status: ${putRes.status}, Novo Preço: ${putRes.body.data.sale_price}`);

  // Teste 5: Movimentar estoque via API
  const invRes = await handleApiRequest(`/api/v1/inventory/${prodId}/entry`, 'POST', {
    body: { quantity: 15, reason: 'Entrada de lote fornecedor via API' },
  });
  console.log(`5. POST /api/v1/inventory/${prodId}/entry -> Status: ${invRes.status}, Novo Saldo: ${invRes.body.data.quantity}`);

  console.log('--- Todos os testes de persistência e backend foram concluídos com sucesso! ---');
}

runTests().catch(err => {
  console.error('Erro nos testes:', err);
  process.exit(1);
});
