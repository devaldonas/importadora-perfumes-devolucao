import React, { useEffect, useState } from 'react';
import './App.css';
import supabase from './services/supabaseClient';  // ← CAMINHO CORRETO
import Ocorrencias from './components/Ocorrencias/Ocorrencias';
import ValidacaoNFD from './components/ValidacaoNFD/ValidacaoNFD';
import AcompanhamentoColetas from './components/AcompanhamentoColetas/AcompanhamentoColetas';
import PainelFinanceiro from './components/PainelFinanceiro/PainelFinanceiro';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  useEffect(() => {
    // Função para fazer login anônimo
    const initializeAuth = async () => {
      try {
        // Verificar se já existe uma sessão
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          console.log('✅ Sessão existente encontrada');
          setIsAuthenticated(true);
          setLoading(false);
          return;
        }

        // Tentar login anônimo
        console.log('🔄 Tentando login anônimo...');
        const { data, error } = await supabase.auth.signInAnonymously();
        
        if (error) {
          console.error('❌ Erro no login anônimo:', error);
          setAuthError(error.message);
          setLoading(false);
          return;
        }
        
        console.log('✅ Login anônimo realizado com sucesso!', data);
        setIsAuthenticated(true);
        setLoading(false);
        
      } catch (err) {
        console.error('❌ Erro inesperado na autenticação:', err);
        setAuthError(err.message);
        setLoading(false);
      }
    };

    initializeAuth();

    // Monitorar mudanças no estado de autenticação
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('🔄 Estado de autenticação mudou:', event, !!session);
      setIsAuthenticated(!!session);
      
      if (event === 'SIGNED_OUT') {
        console.log('⚠️ Usuário desconectado, tentando reconectar...');
        supabase.auth.signInAnonymously();
      }
    });

    // Cleanup da subscription
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Tela de loading
  if (loading) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column'
        }}>
          <h2>🚀 Iniciando sistema...</h2>
          <p>Conectando ao servidor...</p>
        </div>
      </div>
    );
  }

  // Tela de erro de autenticação
  if (authError || !isAuthenticated) {
    return (
      <div className="App">
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          height: '100vh',
          flexDirection: 'column',
          color: 'red'
        }}>
          <h2>❌ Erro de Conexão</h2>
          <p>Não foi possível conectar ao banco de dados.</p>
          <p style={{ fontSize: '12px', color: '#666' }}>{authError}</p>
          <button 
            onClick={() => window.location.reload()}
            style={{
              marginTop: '20px',
              padding: '10px 20px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '5px',
              cursor: 'pointer'
            }}
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  // Sistema principal (autenticado)
  return (
    <div className="App">
      <header style={{
        backgroundColor: '#282c34',
        padding: '20px',
        color: 'white',
        textAlign: 'center'
      }}>
        <h1>📦 Sistema de Gestão e Controle de Devoluções</h1>
        <p style={{ fontSize: '12px', marginTop: '5px' }}>
          Status: ✅ Conectado ao Supabase
        </p>
      </header>
      
      <main style={{ padding: '20px' }}>
        <Ocorrencias />
        <ValidacaoNFD />
        <AcompanhamentoColetas />
        <PainelFinanceiro />
      </main>
    </div>
  );
}

export default App;