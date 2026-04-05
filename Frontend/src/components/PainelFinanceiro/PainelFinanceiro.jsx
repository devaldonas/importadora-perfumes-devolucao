import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import './PainelFinanceiro.css';

function PainelFinanceiro() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchOcorrencias = async () => {
      const { data, error } = await supabase.from('ocorrencias').select('*').eq('status', 'Concluída');
      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
      } else {
        setOcorrencias(data);
      }
    };
    fetchOcorrencias();
  }, []);

  const handleBaixaProcesso = async (id) => {
    const { error } = await supabase
      .from('ocorrencias')
      .update({ status: 'Baixa Realizada' })
      .eq('id', id);

    if (error) {
      setAlert(`Erro ao dar baixa no processo: ${error.message}`);
    } else {
      setAlert('Baixa realizada com sucesso!');
      const { data, error: fetchError } = await supabase.from('ocorrencias').select('*').eq('status', 'Concluída');
      if (!fetchError) setOcorrencias(data);
    }
  };

  return (
    <div className="painel-financeiro-container">
      <h1>Painel Financeiro</h1>
      {alert && <p className="alert">{alert}</p>}
      <table className="ocorrencias-table">
        <thead>
          <tr>
            <th>Data</th>
            <th>Cliente</th>
            <th>Produto</th>
            <th>Decisão</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
          {ocorrencias.map((ocorrencia) => (
            <tr key={ocorrencia.id}>
              <td>{ocorrencia.data}</td>
              <td>{ocorrencia.cliente}</td>
              <td>{ocorrencia.produto}</td>
              <td>{ocorrencia.decisao}</td>
              <td>
                <button onClick={() => handleBaixaProcesso(ocorrencia.id)}>Dar Baixa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PainelFinanceiro;
