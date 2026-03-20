const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const authenticate = require('../middlewares/authenticate');
const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

// Rota para login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(401).json({ error: error.message });
  }

  res.json({ user: data.user, token: data.session.access_token });
});

// Rota para cadastro
router.post('/signup', async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: password,
  });

  if (error) {
    return res.status(400).json({ error: error.message });
  }

  res.json({ user: data.user });
});

// Exemplo de rota protegida
router.get('/protected', authenticate, (req, res) => {
  res.json({ message: 'Acesso permitido', user: req.user });
});

module.exports = router;
