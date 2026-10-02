import fs from 'fs';
import path from 'path';

// Carrega variáveis do .env caso existam
let envUrl = process.env.VITE_SUPABASE_URL || '';
let envAnonKey = process.env.VITE_SUPABASE_ANON_KEY || '';
let envSecretKey = process.env.SUPABASE_SECRET_KEY || '';

try {
  const envContent = fs.readFileSync('.env', 'utf-8');
  for (const line of envContent.split('\n')) {
    const [k, ...v] = line.trim().split('=');
    const val = v.join('=').trim();
    if (k === 'VITE_SUPABASE_URL' && !envUrl) envUrl = val;
    if (k === 'VITE_SUPABASE_ANON_KEY' && !envAnonKey) envAnonKey = val;
    if (k === 'SUPABASE_SECRET_KEY' && !envSecretKey) envSecretKey = val;
  }
} catch {}

const supabaseUrl = envUrl || 'https://mfyyezvpfpflpekosjif.supabase.co';
const secretKey = envSecretKey || process.env.SUPABASE_SECRET_KEY || '';
const anonKey = envAnonKey || 'sb_publishable_1TrxmlacdOxuxq55tYwj2w_UkAHA7BN';

const usersToCreate = [
  {
    email: 'willian.o.jesus@gmail.com',
    password: 'marketflow2026',
    fullName: 'Willian Oliveira',
    phone: '(11) 96382-0374'
  },
  {
    email: 'comerciante@marketflow.com',
    password: 'marketflow2026',
    fullName: 'Comerciante MarketFlow',
    phone: '(11) 98888-7777'
  },
  {
    email: 'admin@olivelas.com',
    password: 'marketflow2026',
    fullName: 'Administrador Olivelas',
    phone: '(11) 97777-6666'
  }
];

async function seedUsers() {
  console.log('--- Iniciando criação de usuários no Supabase Auth ---');

  for (const u of usersToCreate) {
    try {
      console.log(`\nCriando / Atualizando usuário: ${u.email}...`);

      const res = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
        method: 'POST',
        headers: {
          'apikey': secretKey,
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: u.email,
          password: u.password,
          email_confirm: true,
          user_metadata: {
            full_name: u.fullName,
            phone: u.phone
          }
        })
      });

      const resData = await res.json();

      if (res.ok) {
        console.log(`✅ Usuário ${u.email} criado com sucesso! (ID: ${resData.id})`);
        
        // Upsert no profiles
        const profileRes = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
          method: 'POST',
          headers: {
            'apikey': secretKey,
            'Authorization': `Bearer ${secretKey}`,
            'Content-Type': 'application/json',
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            id: resData.id,
            full_name: u.fullName,
            phone: u.phone,
            updated_at: new Date().toISOString()
          })
        });
        console.log(`   Perfil em public.profiles: status ${profileRes.status}`);

      } else if (resData.message?.includes('already been registered') || resData.error_code === 'email_exists') {
        console.log(`ℹ️ Usuário ${u.email} já existe. Atualizando senha e confirmação...`);
        
        // Listar usuário existente para pegar o ID
        const listRes = await fetch(`${supabaseUrl}/auth/v1/admin/users`, {
          headers: {
            'apikey': secretKey,
            'Authorization': `Bearer ${secretKey}`
          }
        });
        const listData = await listRes.json();
        const existing = listData?.users?.find(x => x.email === u.email);

        if (existing) {
          const updateRes = await fetch(`${supabaseUrl}/auth/v1/admin/users/${existing.id}`, {
            method: 'PUT',
            headers: {
              'apikey': secretKey,
              'Authorization': `Bearer ${secretKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              password: u.password,
              email_confirm: true,
              user_metadata: {
                full_name: u.fullName,
                phone: u.phone
              }
            })
          });
          console.log(`   Atualização: status ${updateRes.status}`);
        }
      } else {
        console.error(`❌ Erro ao criar ${u.email}:`, resData);
      }
    } catch (err) {
      console.error(`❌ Exceção em ${u.email}:`, err);
    }
  }

  console.log('\n--- Validando Login com senha padrão (marketflow2026) ---');
  for (const u of usersToCreate) {
    try {
      const loginRes = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'apikey': anonKey,
          'Authorization': `Bearer ${anonKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: u.email,
          password: u.password
        })
      });

      const loginData = await loginRes.json();
      if (loginRes.ok) {
        console.log(`🎉 Login de teste para ${u.email}: SUCESSO 200 OK! Access token gerado.`);
      } else {
        console.error(`⚠️ Falha no login para ${u.email}:`, loginData);
      }
    } catch (e) {
      console.error(`⚠️ Erro no login para ${u.email}:`, e);
    }
  }
}

seedUsers();
