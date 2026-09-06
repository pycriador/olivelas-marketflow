import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL || 'https://rstjtnrdpfaxlfxqycig.supabase.co';
const anonKey = process.env.SUPABASE_PUBLISHABLE_KEY || '';
const secretKey = process.env.SUPABASE_SECRET_KEY || '';

console.log('====================================================');
console.log('MarketFlow — Backend Integration Verification Suite');
console.log('Supabase URL:', url);
console.log('====================================================\n');

async function runTests() {
  const client = createClient(url, secretKey || anonKey, {
    auth: { persistSession: false }
  });

  console.log('1. [AUTH] Testando listagem e integridade de contas...');
  try {
    const { data: usersData, error: usersErr } = await client.auth.admin.listUsers();
    if (usersErr) {
      console.log('   ⚠️ client.auth.admin.listUsers:', usersErr.message);
    } else {
      console.log(`   ✅ Auth operacional: ${usersData.users.length} usuário(s) registrado(s) no Supabase.`);
      usersData.users.forEach(u => console.log(`      - ${u.email} (ID: ${u.id})`));
    }
  } catch (err) {
    console.log('   ⚠️ Auth check error:', err.message);
  }

  console.log('\n2. [TABLES] Verificando tabelas no PostgREST...');
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

  for (const table of tables) {
    try {
      const { data, error, count } = await client
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (error) {
        if (error.code === 'PGRST205') {
          console.log(`   ⏳ Tabela [${table}]: Aguardando execução do script DDL SQL no Supabase SQL Editor.`);
        } else {
          console.log(`   ⚠️ Tabela [${table}]: ${error.message} (code: ${error.code})`);
        }
      } else {
        console.log(`   ✅ Tabela [${table}]: OK! Contagem de registros: ${count ?? 0}`);
      }
    } catch (err) {
      console.log(`   ❌ Erro ao consultar [${table}]:`, err.message);
    }
  }

  console.log('\n====================================================');
  console.log('Instruções para ativação imediata no Supabase:');
  console.log('1. Abra o painel do Supabase: https://supabase.com/dashboard/project/rstjtnrdpfaxlfxqycig/sql/new');
  console.log('2. Copie todo o conteúdo do arquivo: supabase/consolidated_schema.sql');
  console.log('3. Cole no editor SQL do Supabase e clique no botão "RUN".');
  console.log('4. Pronto! Todas as 12 tabelas, enums, triggers de usuários e 51 produtos reais serão criados no PostgreSQL.');
  console.log('====================================================\n');
}

runTests();
