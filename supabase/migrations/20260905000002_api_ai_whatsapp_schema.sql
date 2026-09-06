-- ====================================================================
-- MarketFlow — API First, Tokens, IA & WhatsApp Database Migration
-- Especificação: sdd/API_FIRST_SPEC.md
-- ====================================================================

-- 1. Tabela de API Keys / Tokens
CREATE TABLE IF NOT EXISTS public.api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  created_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  key_prefix VARCHAR(20) NOT NULL, -- ex: mf_live_a1b2 / mf_test_c3d4
  secret_hash VARCHAR(128) NOT NULL, -- Hash SHA-256 da chave inteira
  environment VARCHAR(10) NOT NULL DEFAULT 'live', -- 'live' | 'test'
  scopes TEXT[] NOT NULL DEFAULT ARRAY['products:read', 'inventory:read'],
  status VARCHAR(20) NOT NULL DEFAULT 'active', -- 'active' | 'revoked' | 'expired'
  expires_at TIMESTAMPTZ,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  revoked_at TIMESTAMPTZ
);

-- Index para busca rápida por hash de token
CREATE INDEX IF NOT EXISTS idx_api_keys_hash ON public.api_keys(secret_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_company ON public.api_keys(company_id);

-- 2. Tabela de Logs de Requisições de API
CREATE TABLE IF NOT EXISTS public.api_request_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
  endpoint VARCHAR(255) NOT NULL,
  method VARCHAR(10) NOT NULL,
  status_code INT NOT NULL,
  duration_ms INT NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  idempotency_key VARCHAR(100),
  correlation_id VARCHAR(100),
  error_code VARCHAR(50),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_api_logs_company ON public.api_request_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_api_logs_idempotency ON public.api_request_logs(idempotency_key);

-- 3. Tabela de Jobs de Processamento de IA Assíncrono
CREATE TABLE IF NOT EXISTS public.ai_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_type VARCHAR(50) NOT NULL, -- 'product_analysis' | 'shelf_recognition' | 'ocr'
  provider VARCHAR(30) NOT NULL, -- 'openai' | 'gemini' | 'anthropic' | 'mock'
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled'
  input_data JSONB NOT NULL DEFAULT '{}'::jsonb,
  output_data JSONB,
  confidence_score NUMERIC(4,3),
  requires_human_review BOOLEAN NOT NULL DEFAULT false,
  error_message TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Tabela de Histórico de Consumo de IA (Tokens & Custos)
CREATE TABLE IF NOT EXISTS public.ai_usage_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  job_id UUID REFERENCES public.ai_jobs(id) ON DELETE SET NULL,
  provider VARCHAR(30) NOT NULL,
  model VARCHAR(50) NOT NULL,
  operation VARCHAR(50) NOT NULL,
  input_tokens INT NOT NULL DEFAULT 0,
  output_tokens INT NOT NULL DEFAULT 0,
  estimated_cost_usd NUMERIC(8,6) NOT NULL DEFAULT 0.0,
  status VARCHAR(20) NOT NULL DEFAULT 'success',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Tabela de Templates de Mensagens do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  category VARCHAR(50) NOT NULL, -- 'greeting' | 'product' | 'order' | 'request' | 'stock' | 'confirmation'
  language VARCHAR(10) NOT NULL DEFAULT 'pt-BR', -- 'pt-BR' | 'en' | 'es'
  body_text TEXT NOT NULL,
  variables TEXT[] DEFAULT ARRAY[]::TEXT[], -- ex: ['customer_name', 'company_name']
  active BOOLEAN NOT NULL DEFAULT true,
  is_system_default BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Tabela de Histórico e Fila de Mensagens do WhatsApp
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  template_id UUID REFERENCES public.whatsapp_templates(id) ON DELETE SET NULL,
  request_id UUID REFERENCES public.catalog_requests(id) ON DELETE SET NULL,
  recipient_phone VARCHAR(30) NOT NULL,
  message_body TEXT NOT NULL,
  provider VARCHAR(30) NOT NULL DEFAULT 'whatsapp_official',
  status VARCHAR(20) NOT NULL DEFAULT 'queued', -- 'queued' | 'sending' | 'sent' | 'delivered' | 'read' | 'failed'
  provider_message_id VARCHAR(100),
  retry_count INT NOT NULL DEFAULT 0,
  max_retries INT NOT NULL DEFAULT 3,
  error_details TEXT,
  sent_at TIMESTAMPTZ,
  delivered_at TIMESTAMPTZ,
  read_at TIMESTAMPTZ,
  failed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Tabela de Endpoints de Webhooks
CREATE TABLE IF NOT EXISTS public.webhook_endpoints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  description TEXT,
  secret VARCHAR(100) NOT NULL, -- HMAC-SHA256 Secret
  events TEXT[] NOT NULL DEFAULT ARRAY['product.created', 'inventory.updated'],
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Tabela de Entregas de Webhooks (Logs)
CREATE TABLE IF NOT EXISTS public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint_id UUID NOT NULL REFERENCES public.webhook_endpoints(id) ON DELETE CASCADE,
  event VARCHAR(50) NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  duration_ms INT,
  status VARCHAR(20) NOT NULL DEFAULT 'pending', -- 'pending' | 'success' | 'failed'
  attempt_count INT NOT NULL DEFAULT 1,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ====================================================================

ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_request_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_endpoints ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;

-- Exemplo RLS para API Keys: isolamento estrito por empresa do usuário
CREATE POLICY api_keys_company_isolation ON public.api_keys
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
    )
  );

CREATE POLICY whatsapp_templates_company_isolation ON public.whatsapp_templates
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
    ) OR is_system_default = true
  );

CREATE POLICY whatsapp_messages_company_isolation ON public.whatsapp_messages
  FOR ALL
  USING (
    company_id IN (
      SELECT company_id FROM public.company_users WHERE user_id = auth.uid()
    )
  );
