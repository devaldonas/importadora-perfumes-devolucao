/* src/components/PainelFinanceiro/PainelFinanceiro.jsx */

import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import './PainelFinanceiro.css';

function PainelFinanceiro() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [nfdList, setNfdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [resumo, setResumo] = useState({
    totalDescontos: 0,
    totalDevolucoes: 0,
    pendentesFinanceiro: 0,
    concluidasFinanceiro: 0
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Aguardando autenticação...');
        setLoading(false);
        return;
      }

      // Buscar ocorrências com decisão de desconto
      const { data: ocorrenciasData, error: ocorrenciasError } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('decisao', 'Desconto')
        .order('data', { ascending: false });

      if (ocorrenciasError) {
        console.error('Erro ao buscar ocorrências:', ocorrenciasError);
        setError(ocorrenciasError.message);
      } else {
        setOcorrencias(ocorrenciasData || []);
      }

      // Buscar NFDs validadas
      const { data: nfdData, error: nfdError } = await supabase
        .from('nfd')
        .select('*, ocorrencias(cliente, nota_fiscal)')
        .eq('status', 'Validada')
        .order('created_at', { ascending: false });

      if (nfdError) {
        console.error('Erro ao buscar NFDs:', nfdError);
      } else {
        setNfdList(nfdData || []);
        
        // Calcular resumo financeiro
        const totalDescontos = (nfdData || []).reduce((sum, nfd) => sum + (parseFloat(nfd.valor) || 0), 0);
        const pendentesFinanceiro = (ocorrenciasData || []).filter(oc => oc.status === 'Aguardando NFD' || oc.status === 'Aguardando Coleta').length;
        const concluidasFinanceiro = (ocorrenciasData || []).filter(oc => oc.status === 'Concluída').length;
        
        setResumo({
          totalDescontos: totalDescontos,
          totalDevolucoes: ocorrenciasData?.length || 0,
          pendentesFinanceiro: pendentesFinanceiro,
          concluidasFinanceiro: concluidasFinanceiro
        });
      }

    } catch (err) {
      console.error('Erro inesperado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleConcluirProcesso = async (id) => {
    if (window.confirm('Confirmar que o desconto foi concedido e o processo está concluído?')) {
      try {
        const { error } = await supabase
          .from('ocorrencias')
          .update({ 
            status: 'Concluída',
            finalizado: true
          })
          .eq('id', id);

        if (error) {
          console.error('Erro ao concluir processo:', error);
          alert(`Erro: ${error.message}`);
        } else {
          alert('✅ Processo concluído com sucesso!');
          fetchData(); // Recarregar dados
        }
      } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao concluir processo');
      }
    }
  };

  if (loading) {
    return (
      <div className="financeiro-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>🔄 Carregando dados financeiros...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="financeiro-container">
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>💰 Painel Financeiro - Contas a Receber</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            ❌ Erro: {error}
          </div>
        )}

        {/* Cards de resumo */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(4, 1fr)', 
          gap: '20px', 
          marginBottom: '30px' 
        }}>
          <div style={{ padding: '20px', backgroundColor: '#007bff', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <h3>💰 Total de Descontos</h3>
            <p style={{ fontSize: '28px', margin: '10px 0' }}>R$ {resumo.totalDescontos.toFixed(2)}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#17a2b8', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <h3>📦 Total Devoluções</h3>
            <p style={{ fontSize: '28px', margin: '10px 0' }}>{resumo.totalDevolucoes}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#ffc107', color: '#333', borderRadius: '8px', textAlign: 'center' }}>
            <h3>⏳ Pendentes</h3>
            <p style={{ fontSize: '28px', margin: '10px 0' }}>{resumo.pendentesFinanceiro}</p>
          </div>
          <div style={{ padding: '20px', backgroundColor: '#28a745', color: 'white', borderRadius: '8px', textAlign: 'center' }}>
            <h3>✅ Concluídas</h3>
            <p style={{ fontSize: '28px', margin: '10px 0' }}>{resumo.concluidasFinanceiro}</p>
          </div>
        </div>

        {/* Tabela de ocorrências com desconto */}
        <h3>📋 Ocorrências com Desconto</h3>
        {ocorrencias.length === 0 ? (
          <p>Nenhuma ocorrência com decisão de desconto encontrada.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cliente</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>NF Original</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>NF Devolução</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {ocorrencias.map((oc) => {
                const nfd = nfdList.find(n => n.ocorrencia_id === oc.id);
                return (
                  <tr key={oc.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{new Date(oc.data).toLocaleDateString('pt-BR')}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.cliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.nota_fiscal || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.nota_devolucao || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <span className={`status-${oc.status?.toLowerCase().replace(/\s/g, '-')}`}>
                        {oc.status}
                      </span>
                    </td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      {oc.status !== 'Concluída' && (
                        <button 
                          onClick={() => handleConcluirProcesso(oc.id)}
                          style={{ padding: '5px 10px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          ✅ Concluir Desconto
                        </button>
                      )}
                      {oc.status === 'Concluída' && (
                        <span style={{ color: 'green' }}>✓ Concluído</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}

        {/* Tabela de NFDs com valores */}
        <h3 style={{ marginTop: '30px' }}>💵 Descontos Concedidos por NFD</h3>
        {nfdList.length === 0 ? (
          <p>Nenhum desconto concedido ainda.</p>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
            <thead>
              <tr>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>NFD</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cliente</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>NF Original</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Valor do Desconto</th>
                <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Data</th>
              </tr>
            </thead>
            <tbody>
              {nfdList.map((nfd) => (
                <tr key={nfd.id}>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.numero_nfd}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.ocorrencias?.cliente || '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.ocorrencias?.nota_fiscal || '-'}</td>
                  <td style={{ border: '1px solid #ddd', padding: '8px', fontWeight: 'bold', color: '#28a745' }}>
                    R$ {parseFloat(nfd.valor || 0).toFixed(2)}
                  </td>
                  <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                    {new Date(nfd.created_at).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ backgroundColor: '#f0f0f0', fontWeight: 'bold' }}>
                <td colSpan="3" style={{ padding: '10px', textAlign: 'right' }}>TOTAL:</td>
                <td style={{ padding: '10px', color: '#28a745' }}>R$ {resumo.totalDescontos.toFixed(2)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        )}
      </div>
    </div>
  );
}

export default PainelFinanceiro;