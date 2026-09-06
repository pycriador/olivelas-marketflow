-- ====================================================================
-- Seed: Administrador Global (global_admin)
-- E-mail: willian.o.jesus@gmail.com
-- ====================================================================

DO $$
DECLARE
  new_user_id UUID := gen_random_uuid();
  comp_id UUID;
BEGIN
  -- 1. Cria usuário na tabela do Supabase Auth (caso ainda não exista)
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE email = 'willian.o.jesus@gmail.com') THEN
    INSERT INTO auth.users (
      id,
      instance_id,
      email,
      encrypted_password,
      email_confirmed_at,
      raw_app_meta_data,
      raw_user_meta_data,
      created_at,
      updated_at,
      role,
      aud
    ) VALUES (
      new_user_id,
      '00000000-0000-0000-0000-000000000000',
      'willian.o.jesus@gmail.com',
      crypt('Mf#2026!Wj8x9', gen_salt('bf')),
      now(),
      '{"provider":"email","providers":["email"]}',
      '{"full_name":"Willian Oliveira (Global Admin)"}',
      now(),
      now(),
      'authenticated',
      'authenticated'
    );

    -- 2. Insere perfil de usuário
    INSERT INTO public.profiles (id, full_name, created_at, updated_at)
    VALUES (new_user_id, 'Willian Oliveira (Global Admin)', now(), now())
    ON CONFLICT (id) DO UPDATE SET full_name = EXCLUDED.full_name;

    -- 3. Associa como Global Admin na primeira empresa cadastrada (se houver)
    SELECT id INTO comp_id FROM public.companies LIMIT 1;
    IF comp_id IS NOT NULL THEN
      INSERT INTO public.company_users (company_id, user_id, role, active)
      VALUES (comp_id, new_user_id, 'global_admin', true)
      ON CONFLICT (company_id, user_id) DO UPDATE SET role = 'global_admin';
    END IF;
  END IF;
END $$;
