const { createClient } = require('@supabase/supabase-js');

// Substitua com suas credenciais do Supabase (encontradas em Project Settings > API)
const supabaseUrl = 'https://zqattibwcsrxdikqmifw.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InpxYXR0aWJ3Y3NyeGRpa3FtaWZ3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM4NzI0MTcsImV4cCI6MjA4OTQ0ODQxN30.PdBRzP4TI9nJ2dWFyZZSTrFpbkxB_Qn9yAVfbkloc00';
const supabase = createClient(supabaseUrl, supabaseKey);

// Função para fazer login
async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email: email,
    password: password,
  });

  if (error) {
    console.error("Erro ao fazer login:", error.message);
  } else {
    console.log("Login realizado com sucesso! Usuário:", data.user.email);
  }
}

// Teste de login com o usuário que você criou manualmente
signIn('devaldo@junoimportadora.com.br', '26071306');

