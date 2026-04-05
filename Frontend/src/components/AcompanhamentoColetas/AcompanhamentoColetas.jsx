/* src/components/AcompanhamentoColetas/AcompanhamentoColetas.jsx */

import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import './AcompanhamentoColetas.css';

function AcompanhamentoColetas() {
  const [coletas, setColetas] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [novaColeta, setNovaColeta] = useState({
    ocorrencia_id: '',
    transportadora: '',
    protocolo: '',
    data_coleta: ''
  });

  // Função para buscar coletas
  const fetchColetas = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Aguardando autenticação...');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('coletas')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar coletas:', error);
        setError(error.message);
      } else {
        console.log('Coletas carregadas:', data);
        setColetas(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColetas();
  }, []);

  // Função para criar nova coleta
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const { data, error } = await supabase
        .from('coletas')
        .insert([{
          ocorrencia_id: parseInt(novaColeta.ocorrencia_id),
          transportadora: novaColeta.transportadora,
          protocolo: novaColeta.protocolo,
          data_coleta: novaColeta.data_coleta || null,
          status: 'Pendente'
        }]);

      if (error) {
        console.error('Erro ao criar coleta:', error);
        alert(`Erro: ${error.message}`);
      } else {
        alert('✅ Coleta registrada com sucesso!');
        setNovaColeta({
          ocorrencia_id: '',
          transportadora: '',
          protocolo: '',
          data_coleta: ''
        });
        fetchColetas(); // Recarregar lista
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao registrar coleta');
    }
  };

  // Função para atualizar status da coleta
  const handleStatusUpdate = async (id, novoStatus) => {
    try {
      const { error } = await supabase
        .from('coletas')
        .update({ status: novoStatus, updated_at: new Date() })
        .eq('id', id);

      if (error) {
        console.error('Erro ao atualizar status:', error);
        alert(`Erro: ${error.message}`);
      } else {
        alert(`✅ Status atualizado para: ${novoStatus}`);
        fetchColetas(); // Recarregar lista
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao atualizar status');
    }
  };

  // Links das transportadoras
  const transportadorasLinks = {
    'Braspress': 'https://www.braspress.com/area-do-cliente/minha-conta/',
    'Daytona': 'https://www.daytonaexpress.com.br/coleta-online',
    'Correios': 'https://www.correios.com.br/servicos-online'
  };

  if (loading) {
    return (
      <div className="coletas-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>🔄 Carregando coletas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="coletas-container">
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>📦 Acompanhamento de Coletas</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            ❌ Erro: {error}
          </div>
        )}

        {/* Formulário para nova coleta */}
        <form onSubmit={handleSubmit} style={{ marginBottom: '30px', padding: '15px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <h3>Solicitar Nova Coleta</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '10px' }}>
            <input
              type="number"
              placeholder="ID da Ocorrência"
              value={novaColeta.ocorrencia_id}
              onChange={(e) => setNovaColeta({...novaColeta, ocorrencia_id: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <select
              value={novaColeta.transportadora}
              onChange={(e) => setNovaColeta({...novaColeta, transportadora: e.target.value})}
              required
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            >
              <option value="">Selecione a Transportadora</option>
              <option value="Braspress">Braspress</option>
              <option value="Daytona">Daytona</option>
              <option value="Correios">Correios</option>
            </select>
            <input
              type="text"
              placeholder="Protocolo de Coleta"
              value={novaColeta.protocolo}
              onChange={(e) => setNovaColeta({...novaColeta, protocolo: e.target.value})}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
            <input
              type="date"
              placeholder="Data da Coleta"
              value={novaColeta.data_coleta}
              onChange={(e) => setNovaColeta({...novaColeta, data_coleta: e.target.value})}
              style={{ padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
            />
          </div>
          <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
            📝 Registrar Coleta
          </button>
        </form>

        {/* Lista de coletas */}
        {coletas.length === 0 ? (
          <p>📭 Nenhuma coleta registrada ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ocorrência</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Transportadora</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Protocolo</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {coletas.map((coleta) => (
                <tr key={coleta.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coleta.id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coleta.ocorrencia_id}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {coleta.transportadora}
                    {transportadorasLinks[coleta.transportadora] && (
                      <a href={transportadorasLinks[coleta.transportadora]} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '10px', fontSize: '12px' }}>
                        🔗 Acessar
                      </a>
                    )}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{coleta.protocolo || '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <span className={`status-${coleta.status?.toLowerCase()}`}>
                      {coleta.status}
                    </span>
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    <select 
                      onChange={(e) => handleStatusUpdate(coleta.id, e.target.value)}
                      defaultValue={coleta.status}
                      style={{ padding: '5px', borderRadius: '4px' }}
                    >
                      <option value="Pendente">Pendente</option>
                      <option value="Coletado">Coletado</option>
                      <option value="Em transporte">Em transporte</option>
                      <option value="Entregue">Entregue</option>
                      <option value="Cancelado">Cancelado</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

export default AcompanhamentoColetas;
