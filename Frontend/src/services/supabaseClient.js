import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_KEY são necessárias.");
}

// Configuração mais robusta do cliente
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: localStorage
  },
  global: {
    headers: {
      'apikey': supabaseKey,
    }
  }
});

// Log para debug
console.log('Supabase client inicializado com URL:', supabaseUrl);

// Teste de conexão automático
supabase.from('coletas').select('count', { count: 'exact', head: true })
  .then(({ count, error }) => {
    if (error) {
      console.error('❌ Erro de conexão com tabela coletas:', error.message);
      console.error('Status do erro:', error.status);
    } else {
      console.log('✅ Conexão com tabela coletas OK! Total:', count);
    }
  });

export default supabase;
