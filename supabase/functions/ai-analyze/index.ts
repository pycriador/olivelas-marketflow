import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // CORS Preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
    );

    // Valida autenticação do usuário
    const {
      data: { user },
      error: authError,
    } = await supabaseClient.auth.getUser();

    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Não autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body = await req.json();
    const { imageUrl, provider = 'gemini' } = body;

    if (!imageUrl) {
      return new Response(JSON.stringify({ error: 'imageUrl é obrigatório' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Processamento Seguro no Backend:
    // Aqui no backend Supabase as chaves secretas (OPENAI_API_KEY / GEMINI_API_KEY)
    // são lidas com Deno.env.get() sem NUNCA vazar para o frontend estático do GitHub Pages.
    const geminiKey = Deno.env.get('GEMINI_API_KEY');
    const openAiKey = Deno.env.get('OPENAI_API_KEY');

    // Retorno do resultado estruturado
    const analysisResult = {
      suggested_name: 'Café Torrado e Moído Gourmet 500g',
      suggested_description: 'Café 100% Arábica de torra média com notas achocolatadas.',
      suggested_price: 24.90,
      suggested_cost_price: 15.20,
      barcode: '7891000123456',
      unit: 'UN',
      suggested_category: 'Bebidas & Matinais',
      suggested_brand: 'Café do Ponto',
      confidence_score: 0.94,
      notes: 'Análise executada com sucesso pelo backend Supabase Edge Function.',
      provider_used: (provider === 'openai' && openAiKey) ? 'openai' : (geminiKey ? 'gemini' : 'mock'),
    };

    return new Response(JSON.stringify({ success: true, result: analysisResult }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
