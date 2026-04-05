import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import './AcompanhamentoColetas.css';

function AcompanhamentoColetas() {
  const [coletas, setColetas] = useState([]);
  const [transportadora, setTransportadora] = useState('');
  const [protocolo, setProtocolo] = useState('');
  const [alert, setAlert] = useState('');

  useEffect(() => {
    const fetchColetas = async () => {
      const { data, error } = await supabase.from('coletas').select('*');
      if (error) {
        console.error('Erro ao buscar coletas:', error);
      } else {
        setColetas(data);
      }
    };
    fetchColetas();
  }, []);

  const handleSolicitarColeta = async () => {
    if (!transportadora) {
      setAlert('Por favor, selecione uma transportadora.');
      return;
    }

    // Simular a integração com a API da transportadora
    const novoProtocolo = `PROT-${Math.floor(Math.random() * 10000)}`;

    const { error } = await supabase
      .from('coletas')
      .insert([{ transportadora, protocolo: novoProtocolo, status: 'Solicitada' }]);

    if (error) {
      setAlert(`Erro ao solicitar coleta: ${error.message}`);
    } else {
      setAlert(`Coleta solicitada com sucesso! Protocolo: ${novoProtocolo}`);
      setProtocolo(novoProtocolo);
      const { data, error: fetchError } = await supabase.from('coletas').select('*');
      if (!fetchError) setColetas(data);
    }
  };

  return (
    <div className="acompanhamento-coletas-container">
      <h1>Acompanhamento de Coletas</h1>
      <div className="solicitar-coleta">
        <select value={transportadora} onChange={(e) => setTransportadora(e.target.value)}>
          <option value="">Selecione a Transportadora</option>
          <option value="Braspress">Braspress</option>
          <option value="Daytona">Daytona</option>
          <option value="Correios">Correios</option>
        </select>
        <button onClick={handleSolicitarColeta}>Solicitar Coleta</button>
      </div>
      {alert && <p className="alert">{alert}</p>}
      <table className="coletas-table">
        <thead>
          <tr>
            <th>Transportadora</th>
            <th>Protocolo</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          {coletas.map((coleta) => (
            <tr key={coleta.id}>
              <td>{coleta.transportadora}</td>
              <td>{coleta.protocolo}</td>
              <td>{coleta.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default AcompanhamentoColetas;
