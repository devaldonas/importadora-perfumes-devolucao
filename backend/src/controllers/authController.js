const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para fazer login
async function signIn(req, res) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user });
}

// Função para fazer cadastro
async function signUp(req, res) {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ user: data.user });
}

module.exports = { signIn, signUp };
