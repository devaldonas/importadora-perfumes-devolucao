/* src/components/Ocorrencias/Ocorrencias.jsx */

import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import * as XLSX from 'xlsx'; // linha adicionada para importar a biblioteca xlsx
import './Ocorrencias.css';

function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [filtros, setFiltros] = useState({
    data: '',
    cliente: '',
    status: '',
    produto: '',
  });

  useEffect(() => {
    const fetchOcorrencias = async () => {
      let query = supabase.from('ocorrencias').select('*');

      if (filtros.data) query = query.eq('data', filtros.data);
      if (filtros.cliente) query = query.eq('cliente', filtros.cliente);
      if (filtros.status) query = query.eq('status', filtros.status);
      if (filtros.produto) query = query.eq('produto', filtros.produto);

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
      } else {
        setOcorrencias(data);
      }
    };

    fetchOcorrencias();
  }, [filtros]);

  const handleDecisao = async (id, decisao) => {
    const { error } = await supabase
      .from('ocorrencias')
      .update({ decisao })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar decisão:', error);
    } else {
      alert('Decisão registrada com sucesso!');
    }
  };

 const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    const data = new Uint8Array(event.target.result);
    const workbook = XLSX.read(data, { type: 'array' });
    const worksheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(worksheet);

    const formattedData = jsonData.map(item => ({
      data: item.Data,
      cliente: item.Cliente,
      status: item.Status || 'Pendente',
      produto: item.Produto,
      tipo_ocorrencia: item.Tipo,
      observacoes: item.Observações,
    }));

    const { error } = await supabase.from('ocorrencias').insert(formattedData);
    if (error) {
      console.error('Erro ao importar planilha:', error.message);
    } else {
      alert('Planilha importada com sucesso!');
      window.location.reload();
    }
  };
  reader.readAsArrayBuffer(file);
};

  const totalOcorrencias = ocorrencias.length;
  const ocorrenciasPendentes = ocorrencias.filter(ocorrencia => ocorrencia.status === 'Pendente').length;
  const ocorrenciasConcluidas = ocorrencias.filter(ocorrencia => ocorrencia.status === 'Concluída').length;

  return (
    <div className="ocorrencias-container">
      <div className="ocorrencias-header">
        <div className="sidebar">
          <div className="sidebar-item">🌐 JUNO IMPORTADORA</div>
          <div className="sidebar-item">• Ocorrências</div>
          <div className="sidebar-item">• Validação de NFD</div>
          <div className="sidebar-item">• Acomp de Coletas</div>
          <div className="sidebar-item">• Painel Financeiro</div>
          <div className="sidebar-item">• Relatórios</div>
        </div>
        <div>
          <div className="metrics-container">
            <div className="metric-card total">
              <h3>Total de Ocorrências:</h3>
              <p>{totalOcorrencias}</p>
            </div>
            <div className="metric-card pending">
              <h3>Ocorrências Pendentes:</h3>
              <p>{ocorrenciasPendentes}</p>
            </div>
            <div className="metric-card concluded">
              <h3>Ocorrências Concluídas:</h3>
              <p>{ocorrenciasConcluidas}</p>
            </div>
            <div className="metric-card avg-time">
              <h3>Tempo Médio de Processamento:</h3>
              <p>2 dias</p>
            </div>
          </div>
          <div className="filters">
            <div className="import-section">
              <label className="import-label">
                Importar Planilha:
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </label>
            </div>
            <input type="date" placeholder="Data" onChange={(e) => setFiltros({ ...filtros, data: e.target.value })} />
            <input type="text" placeholder="Nome do Cliente" onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })} />
            <select onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="">Selecionar Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Concluída">Concluída</option>
            </select>
            <input type="text" placeholder="Nome do Produto" onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })} />
            <button>Aplicar filtro</button>
          </div>
          <div className="ocorrencias-table-container">
            <table className="ocorrencias-table">
              <thead>
                <tr>
                  <th>Data</th>
                  <th>Cliente</th>
                  <th>Status</th>
                  <th>Produto</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((ocorrencia) => (
                  <tr key={ocorrencia.id}>
                    <td>{ocorrencia.data}</td>
                    <td>{ocorrencia.cliente}</td>
                    <td>{ocorrencia.status}</td>
                    <td>{ocorrencia.produto}</td>
                    <td>
                      <select onChange={(e) => handleDecisao(ocorrencia.id, e.target.value)} defaultValue="">
                        <option value="" disabled>Selecione uma decisão</option>
                        <option value="Reposição">Reposição</option>
                        <option value="Troca">Troca</option>
                        <option value="Desconto">Desconto</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ocorrencias;
