/* src/components/Ocorrencias/Ocorrencias.jsx */

import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import * as XLSX from 'xlsx';
import './Ocorrencias.css';

function Ocorrencias() {
  const [ocorrencias, setOcorrencias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtros, setFiltros] = useState({
    data: '',
    cliente: '',
    status: '',
    produto: '',
  });

  // Função para buscar ocorrências
  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      
      // Verificar autenticação
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Aguardando autenticação...');
        setLoading(false);
        return;
      }
      
      let query = supabase.from('ocorrencias').select('*');

      if (filtros.data) query = query.eq('data', filtros.data);
      if (filtros.cliente) query = query.eq('cliente', filtros.cliente);
      if (filtros.status) query = query.eq('status', filtros.status);
      if (filtros.produto) query = query.eq('produto', filtros.produto);

      const { data, error } = await query;
      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
      } else {
        setOcorrencias(data || []);
      }
    } catch (error) {
      console.error('Erro ao buscar ocorrências:', error);
    } finally {
      setLoading(false);
    }
  };

  // Executar busca quando filtros mudarem
  useEffect(() => {
    fetchOcorrencias();
  }, [filtros]);

  // Função para registrar decisão
  const handleDecisao = async (id, decisao) => {
    if (!decisao) return;
    
    const { error } = await supabase
      .from('ocorrencias')
      .update({ status: decisao === 'Desconto' ? 'Aguardando NFD' : 'Aguardando Coleta', decisao })
      .eq('id', id);

    if (error) {
      console.error('Erro ao atualizar decisão:', error);
      alert('Erro ao registrar decisão!');
    } else {
      alert(`Decisão "${decisao}" registrada com sucesso!`);
      fetchOcorrencias(); // Recarregar lista
    }
  };

  // Função para importar planilha (versão corrigida)
const handleFileUpload = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = async (event) => {
    try {
      const data = new Uint8Array(event.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      console.log('Total de linhas na planilha:', jsonData.length);
      
      // Filtrar apenas registros válidos
      const formattedData = jsonData
        .map(item => {
          // Extrair os dados
          const notaFiscal = String(item['NÚMERO NF'] || '').trim();
          const cliente = String(item['NOME DO CLIENTE'] || '').trim();
          const codigoCliente = String(item['CÓDIGO CLIENTE'] || '').trim();
          const produto = String(item['DESCRIÇÃO PRODUTO'] || item['CÓDIGO PRODUTO'] || '').trim();
          const quantidade = parseInt(item['QUANTIDADE'] || 0);
          const tipoOcorrencia = String(item['TIPO DE OCORRÊNCI (Avaria / Falta / Troca)'] || '').trim();
          const observacoes = String(item['OBSERVAÇÕES'] || '').trim();
          
          // Verificar se é um registro válido (tem pelo menos cliente ou nota fiscal)
          const isValid = cliente && cliente !== '' && 
                          cliente !== 'Pendente' && 
                          cliente !== 'pendente' &&
                          cliente !== '-' &&
                          (notaFiscal !== '' || produto !== '');
          
          if (!isValid) {
            console.log('Registro inválido ignorado:', { cliente, notaFiscal, produto });
            return null;
          }
          
          return {
            data: new Date().toISOString().split('T')[0],
            nota_fiscal: notaFiscal || '',
            cliente: cliente,
            codigo_cliente: codigoCliente,
            produto: produto,
            quantidade: quantidade > 0 ? quantidade : 1,
            tipo_ocorrencia: tipoOcorrencia,
            observacoes: observacoes,
            status: 'Pendente'
          };
        })
        .filter(registro => registro !== null); // Remover os registros nulos
      
      console.log(`📊 Linhas válidas: ${formattedData.length} de ${jsonData.length}`);
      
      if (formattedData.length === 0) {
        alert('⚠️ Nenhum registro válido encontrado na planilha. Verifique se há dados nas colunas "NOME DO CLIENTE" ou "NÚMERO NF".');
        return;
      }
      
      console.log('Primeiro registro válido:', formattedData[0]);
      
      // Inserir apenas os registros válidos
      const { data: inserted, error } = await supabase
        .from('ocorrencias')
        .insert(formattedData)
        .select();
      
      if (error) {
        console.error('Erro detalhado:', error);
        alert(`Erro ao importar: ${error.message}\n\nDetalhes: ${error.details || 'N/A'}`);
      } else {
        alert(`✅ ${inserted.length} ocorrências importadas com sucesso!\n\n${jsonData.length - formattedData.length} linhas vazias foram ignoradas.`);
        fetchOcorrencias(); // Recarregar a lista
      }
      
    } catch (err) {
      console.error('Erro ao processar planilha:', err);
      alert('Erro ao processar o arquivo: ' + err.message);
    }
  };
  reader.readAsArrayBuffer(file);
};

  const totalOcorrencias = ocorrencias.length;
  const ocorrenciasPendentes = ocorrencias.filter(oc => oc.status === 'Pendente').length;
  const ocorrenciasConcluidas = ocorrencias.filter(oc => oc.status === 'Concluída').length;

  if (loading) {
    return (
      <div className="ocorrencias-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>🔄 Carregando ocorrências...</p>
        </div>
      </div>
    );
  }

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
        <div style={{ flex: 1 }}>
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
                📂 Importar Planilha:
                <input type="file" accept=".xlsx, .xls" onChange={handleFileUpload} />
              </label>
            </div>
            <input 
              type="date" 
              placeholder="Data" 
              onChange={(e) => setFiltros({ ...filtros, data: e.target.value })} 
            />
            <input 
              type="text" 
              placeholder="Nome do Cliente" 
              onChange={(e) => setFiltros({ ...filtros, cliente: e.target.value })} 
            />
            <select onChange={(e) => setFiltros({ ...filtros, status: e.target.value })}>
              <option value="">Todos os Status</option>
              <option value="Pendente">Pendente</option>
              <option value="Aguardando NFD">Aguardando NFD</option>
              <option value="Aguardando Coleta">Aguardando Coleta</option>
              <option value="Concluída">Concluída</option>
            </select>
            <input 
              type="text" 
              placeholder="Nome do Produto" 
              onChange={(e) => setFiltros({ ...filtros, produto: e.target.value })} 
            />
            <button onClick={() => fetchOcorrencias()}>🔍 Aplicar filtro</button>
          </div>
          
          <div className="ocorrencias-table-container">
            {ocorrencias.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '40px' }}>
                📭 Nenhuma ocorrência encontrada. Importe uma planilha para começar.
              </p>
            ) : (
              <table className="ocorrencias-table">
                <thead>
                  <tr>
                    <th>Data</th>
                    <th>Cliente</th>
                    <th>Status</th>
                    <th>Produto</th>
                    <th>Nota Fiscal</th>
                    <th>Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {ocorrencias.map((ocorrencia) => (
                    <tr key={ocorrencia.id}>
                      <td>{new Date(ocorrencia.data).toLocaleDateString('pt-BR')}</td>
                      <td>{ocorrencia.cliente}</td>
                      <td>
                        <span className={`status-${ocorrencia.status?.toLowerCase().replace(/\s/g, '-')}`}>
                          {ocorrencia.status}
                        </span>
                      </td>
                      <td>{ocorrencia.produto}</td>
                      <td>{ocorrencia.nota_fiscal || '-'}</td>
                      <td>
                        {ocorrencia.status === 'Pendente' && (
                          <select 
                            onChange={(e) => handleDecisao(ocorrencia.id, e.target.value)} 
                            defaultValue=""
                            style={{ padding: '5px', borderRadius: '4px' }}
                          >
                            <option value="" disabled>Selecione uma decisão</option>
                            <option value="Reposição">🔄 Reposição/Troca</option>
                            <option value="Desconto">💰 Desconto no boleto</option>
                          </select>
                        )}
                        {ocorrencia.status !== 'Pendente' && (
                          <span>✅ Decisão registrada</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Ocorrencias;
