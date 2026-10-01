import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

// Carrega as variáveis do .env
const envPath = path.resolve('.env');
const envContent = fs.readFileSync(envPath, 'utf8');

const env = {};
envContent.split('\n').forEach(line => {
  const trimmed = line.trim();
  if (trimmed && !trimmed.startsWith('#')) {
    const idx = trimmed.indexOf('=');
    if (idx !== -1) {
      const key = trimmed.substring(0, idx).trim();
      const val = trimmed.substring(idx + 1).trim();
      env[key] = val;
    }
  }
});

const url = env.VITE_SUPABASE_URL || env.SUPABASE_URL;
const anonKey = env.VITE_SUPABASE_ANON_KEY || env.SUPABASE_PUBLISHABLE_KEY;
const secretKey = env.SUPABASE_SECRET_KEY;

console.log('========================================================');
console.log('🔍 Testando Conectividade com o Novo Projeto Supabase');
console.log('URL:', url);
console.log('Anon Key:', anonKey ? anonKey.substring(0, 20) + '...' : 'Não definida');
console.log('Secret Key:', secretKey ? secretKey.substring(0, 20) + '...' : 'Não definida');
console.log('========================================================\n');

async function testProject() {
  // 1. Testa cliente anônimo (mesmo que roda no navegador)
  const publicClient = createClient(url, anonKey);

  console.log('1. [PING / HTTP] Testando requisição pública REST...');
  try {
    const { data, error } = await publicClient
      .from('companies')
      .select('*')
      .limit(5);

    if (error) {
      console.log('   ⚠️ Resposta do Supabase com erro:');
      console.log('      Código:', error.code);
      console.log('      Mensagem:', error.message);
      if (error.code === 'PGRST205' || error.message?.includes('does not exist')) {
        console.log('      💡 Diagnóstico: O banco de dados está online, mas as tabelas ainda não foram criadas.');
      }
    } else {
      console.log(`   ✅ Sucesso! Conexão REST com a tabela 'companies' funcionando perfeitamente.`);
      console.log(`      Empresas retornadas: ${data.length}`);
      data.forEach(c => console.log(`      - ${c.name} (slug: ${c.slug}, id: ${c.id})`));
    }
  } catch (err) {
    console.log('   ❌ Erro de conexão HTTP / Fetch:', err.message);
  }

  // 2. Testa as demais tabelas
  console.log('\n2. [TABELAS] Testando presença das tabelas do schema...');
  const tables = [
    'profiles',
    'companies',
    'company_users',
    'categories',
    'brands',
    'manufacturers',
    'suppliers',
    'products',
    'inventory_items',
    'lots',
    'inventory_movements',
    'catalog_requests'
  ];

  let missingTables = [];
  let existingTables = [];

  for (const t of tables) {
    try {
      const { data, error, count } = await publicClient
        .from(t)
        .select('*', { count: 'exact', head: true });

      if (error) {
        missingTables.push({ table: t, error: error.message, code: error.code });
      } else {
        existingTables.push({ table: t, count: count ?? 0 });
      }
    } catch (err) {
      missingTables.push({ table: t, error: err.message });
    }
  }

  if (existingTables.length > 0) {
    console.log(`   ✅ ${existingTables.length} tabela(s) encontradas:`);
    existingTables.forEach(item => {
      console.log(`      - ${item.table.padEnd(22)}: ${item.count} registro(s)`);
    });
  }

  if (missingTables.length > 0) {
    console.log(`\n   ⏳ ${missingTables.length} tabela(s) não encontradas ou bloqueadas:`);
    missingTables.forEach(item => {
      console.log(`      - ${item.table.padEnd(22)}: [${item.code || 'ERR'}] ${item.error}`);
    });
  }

  // 3. Testa Auth
  console.log('\n3. [AUTH] Testando serviço de autenticação...');
  try {
    const { data, error } = await publicClient.auth.getSession();
    if (error) {
      console.log('   ⚠️ Erro ao checar getSession:', error.message);
    } else {
      console.log('   ✅ Endpoint auth.getSession() respondeu com sucesso.');
    }
  } catch (err) {
    console.log('   ❌ Erro no Auth:', err.message);
  }

  // 4. Se houver secretKey, verifica usuários existentes no banco
  if (secretKey) {
    console.log('\n4. [ADMIN / SECRET KEY] Testando credenciais de serviço...');
    try {
      const adminClient = createClient(url, secretKey, { auth: { persistSession: false } });
      const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
      if (userError) {
        console.log('   ⚠️ Erro ao listar usuários via admin:', userError.message);
      } else {
        console.log(`   ✅ Chave de serviço válida! ${userData.users.length} usuário(s) no Supabase Auth.`);
        userData.users.forEach(u => console.log(`      - ${u.email} (ID: ${u.id})`));
      }
    } catch (err) {
      console.log('   ❌ Erro no teste admin:', err.message);
    }
  }

  console.log('\n========================================================');
  console.log('🏁 Diagnóstico Concluído');
  console.log('========================================================');
}

testProject();
