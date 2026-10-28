require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;

console.log('🔐 Authenticate - URL:', supabaseUrl ? '✅' : '❌');
console.log('🔐 Authenticate - KEY:', supabaseKey ? '✅' : '❌');

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Authenticate: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
}

const supabase = createClient(supabaseUrl, supabaseKey);

const authenticate = async (req, res, next) => {
  console.log('Corpo da requisição no authenticate:', req.body);
  console.log('Headers da requisição:', req.headers);

  const token = req.headers.authorization?.split(' ')[1];
  console.log('Token extraído:', token);

  if (!token) {
    console.log('Token não fornecido');
    return res.status(401).json({ error: 'Token não fornecido' });
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token);
    console.log('Usuário autenticado:', user);

    if (error) {
      console.error('Erro na autenticação:', error);
      return res.status(401).json({ error: 'Não autorizado' });
    }

    req.user = user;
    next();
  } catch (err) {
    console.error('Erro no authenticate:', err);
    return res.status(500).json({ error: 'Erro interno no servidor' });
  }
};

module.exports = authenticate;