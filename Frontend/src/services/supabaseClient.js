import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL;
const supabaseKey = process.env.REACT_APP_SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error("Variáveis de ambiente REACT_APP_SUPABASE_URL e REACT_APP_SUPABASE_KEY são necessárias.");
}

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
