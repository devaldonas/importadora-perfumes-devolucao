/* src/components/ValidacaoNFD/ValidacaoNFD.jsx */

import React, { useState, useEffect } from 'react';
import supabase from '../../services/supabaseClient';
import * as XLSX from 'xlsx';
import './ValidacaoNFD.css';

function ValidacaoNFD() {
  const [chaveAcesso, setChaveAcesso] = useState('');
  const [consultando, setConsultando] = useState(false);
  const [documentoEncontrado, setDocumentoEncontrado] = useState(null);
  const [ocorrencias, setOcorrencias] = useState([]);
  const [nfdList, setNfdList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedOcorrencia, setSelectedOcorrencia] = useState(null);
  const [importing, setImporting] = useState(false);
  const [formData, setFormData] = useState({
    numero_nfd: '',
    emitente_razao_social: '',
    emitente_ie: '',
    emitente_cnpj: '',
    emitente_endereco: '',
    emitente_data_emissao: '',
    destinatario_razao_social: '',
    destinatario_ie: '',
    destinatario_cnpj: '',
    destinatario_endereco: '',
    transportadora_razao_social: '',
    transportadora_ie: '',
    transportadora_cnpj: '',
    transportadora_endereco: '',
    frete_conta: '',
    quantidade_volume: '',
    peso_bruto: '',
    valor: '',
    responsavel_devolucao: '',
    telefone_responsavel: '',
    observacoes: ''
  });

  // Buscar ocorrências pendentes de NFD (TODAS as decisões)
  const fetchOcorrencias = async () => {
    try {
      setLoading(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log('Aguardando autenticação...');
        setLoading(false);
        return;
      }

      // CORREÇÃO: Agora pega TODAS as ocorrências com status "Aguardando NFD"
      // independente da decisão (Reposição, Troca, Desconto)
      const { data, error } = await supabase
        .from('ocorrencias')
        .select('*')
        .eq('status', 'Aguardando NFD')
        .order('data', { ascending: false });

      if (error) {
        console.error('Erro ao buscar ocorrências:', error);
        setError(error.message);
      } else {
        setOcorrencias(data || []);
      }
    } catch (err) {
      console.error('Erro inesperado:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Buscar NFDs já cadastradas
  const fetchNFDs = async () => {
    try {
      const { data, error } = await supabase
        .from('nfd')
        .select('*, ocorrencias(cliente, nota_fiscal)')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Erro ao buscar NFDs:', error);
      } else {
        setNfdList(data || []);
      }
    } catch (err) {
      console.error('Erro:', err);
    }
  };

  useEffect(() => {
    fetchOcorrencias();
    fetchNFDs();
  }, []);

  // Handle form change
  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // Função para consultar a SEFAZ
  const consultarSEFAZ = async () => {
    if (!chaveAcesso || chaveAcesso.length !== 44) {
      alert('Digite uma chave de acesso válida (44 dígitos)');
      return;
    }
    
    setConsultando(true);
    setDocumentoEncontrado(null);
    
    try {
      const response = await fetch('http://localhost:3000/sefaz/consultar-nfd', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          chaveAcesso, 
          ocorrenciaId: selectedOcorrencia?.id 
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        const doc = result.data;
        setDocumentoEncontrado(doc);
        
        setFormData({
          ...formData,
          numero_nfd: doc.numero,
          emitente_razao_social: doc.emitente_razao_social,
          emitente_cnpj: doc.emitente_cnpj,
          emitente_ie: doc.emitente_ie,
          emitente_endereco: doc.emitente_endereco,
          emitente_data_emissao: doc.data_emissao,
          destinatario_razao_social: doc.destinatario_razao_social,
          destinatario_cnpj: doc.destinatario_cnpj,
          destinatario_ie: doc.destinatario_ie,
          destinatario_endereco: doc.destinatario_endereco,
          transportadora_razao_social: doc.transportadora_razao_social,
          transportadora_cnpj: doc.transportadora_cnpj,
          valor: doc.valor_total,
          quantidade_volume: doc.quantidade_volume,
          peso_bruto: doc.peso_bruto
        });
        
        alert(`✅ NFD ${doc.numero} encontrada na SEFAZ! Dados preenchidos automaticamente.`);
      } else {
        alert(`❌ Erro: ${result.error}`);
      }
    } catch (error) {
      console.error('Erro na consulta SEFAZ:', error);
      alert('Erro ao consultar SEFAZ. Verifique se o backend está rodando.');
    } finally {
      setConsultando(false);
    }
  };

  // Download do XML
  const downloadXML = async (documentoId) => {
    try {
      const response = await fetch(`http://localhost:3000/sefaz/download-xml/${documentoId}`);
      
      if (!response.ok) {
        throw new Error('Erro ao baixar XML');
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `NFD_${documentoId}.xml`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      alert('✅ XML baixado com sucesso!');
    } catch (error) {
      console.error('Erro no download:', error);
      alert('Erro ao baixar XML');
    }
  };

  // Importar NFD de planilha Excel
  const handleImportExcel = (data) => {
    const excelData = data[0];
    setFormData({
      ...formData,
      numero_nfd: excelData['NÚMERO NFD'] || excelData['NUMERO NFD'] || '',
      emitente_razao_social: excelData['EMITENTE RAZÃO SOCIAL'] || excelData['EMITENTE'] || '',
      emitente_cnpj: excelData['EMITENTE CNPJ'] || '',
      emitente_data_emissao: excelData['DATA EMISSÃO'] || '',
      destinatario_razao_social: excelData['DESTINATÁRIO RAZÃO SOCIAL'] || '',
      destinatario_cnpj: excelData['DESTINATÁRIO CNPJ'] || '',
      transportadora_razao_social: excelData['TRANSPORTADORA RAZÃO SOCIAL'] || '',
      valor: excelData['VALOR NOTA'] || '',
      quantidade_volume: excelData['QUANTIDADE'] || '',
      peso_bruto: excelData['PESO BRUTO'] || ''
    });
    alert('✅ Dados importados do Excel com sucesso!');
  };

  // Importar NFD de PDF
  const handleImportPDF = async (arrayBuffer) => {
    try {
      const text = await extractTextFromPDF(arrayBuffer);
      console.log('Texto extraído:', text);
      
      const extracted = {};
      
      const nfeMatch = text.match(/N[eE]F[eE]?\s*[Nn]º?\s*(\d{1,3}\.?\d{3}\.?\d{3})/i);
      if (nfeMatch) extracted.numero_nfd = nfeMatch[1];
      
      const cnpjMatch = text.match(/CNPJ[:\s]*(\d{2}\.\d{3}\.\d{3}\/\d{4}-\d{2})/i);
      if (cnpjMatch) extracted.emitente_cnpj = cnpjMatch[1];
      
      const dataMatch = text.match(/(?:Data de Emissão|Emissão)[:\s]*(\d{2}\/\d{2}\/\d{4})/i);
      if (dataMatch) {
        const parts = dataMatch[1].split('/');
        extracted.emitente_data_emissao = `${parts[2]}-${parts[1]}-${parts[0]}`;
      }
      
      const valorMatch = text.match(/(?:Valor Total|Vlr\. Total)[:\s]*R?\$?\s*([\d.,]+)/i);
      if (valorMatch) extracted.valor = valorMatch[1].replace(/\./g, '').replace(',', '.');
      
      setFormData({
        ...formData,
        numero_nfd: extracted.numero_nfd || '',
        emitente_cnpj: extracted.emitente_cnpj || '',
        emitente_data_emissao: extracted.emitente_data_emissao || '',
        valor: extracted.valor || ''
      });
      
      if (Object.keys(extracted).length === 0) {
        alert('⚠️ Não foi possível extrair dados automaticamente. Preencha manualmente.');
      } else {
        alert('✅ Dados extraídos do PDF! Verifique e complete os campos.');
      }
    } catch (err) {
      console.error('Erro ao processar PDF:', err);
      alert('Erro ao processar PDF. Preencha os dados manualmente.');
    }
  };

  // Função auxiliar para extrair texto do PDF
  const extractTextFromPDF = async (arrayBuffer) => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
      script.onload = async () => {
        try {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
          const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
          let fullText = '';
          for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            const pageText = textContent.items.map(item => item.str).join(' ');
            fullText += pageText + ' ';
          }
          resolve(fullText);
        } catch (err) {
          reject(err);
        }
      };
      script.onerror = () => reject(new Error('Erro ao carregar PDF.js'));
      document.head.appendChild(script);
    });
  };

  // Handler principal de importação
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setImporting(true);
    const fileType = file.name.split('.').pop().toLowerCase();
    
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        if (fileType === 'xlsx' || fileType === 'xls') {
          const data = new Uint8Array(event.target.result);
          const workbook = XLSX.read(data, { type: 'array' });
          const worksheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(worksheet);
          handleImportExcel(jsonData);
        } else if (fileType === 'pdf') {
          await handleImportPDF(event.target.result);
        } else {
          alert('Formato não suportado. Use arquivos .xlsx, .xls ou .pdf');
        }
      } catch (err) {
        console.error('Erro:', err);
        alert('Erro ao processar arquivo');
      } finally {
        setImporting(false);
      }
    };
    reader.readAsArrayBuffer(file);
    e.target.value = '';
  };

  // Selecionar ocorrência para validar NFD
  const handleSelectOcorrencia = (ocorrencia) => {
    setSelectedOcorrencia(ocorrencia);
    setFormData({
      numero_nfd: '',
      emitente_razao_social: '',
      emitente_ie: '',
      emitente_cnpj: '',
      emitente_endereco: '',
      emitente_data_emissao: '',
      destinatario_razao_social: '',
      destinatario_ie: '',
      destinatario_cnpj: '',
      destinatario_endereco: '',
      transportadora_razao_social: '',
      transportadora_ie: '',
      transportadora_cnpj: '',
      transportadora_endereco: '',
      frete_conta: '',
      quantidade_volume: '',
      peso_bruto: '',
      valor: '',
      responsavel_devolucao: '',
      telefone_responsavel: '',
      observacoes: ''
    });
  };

  // Validar e salvar NFD
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedOcorrencia) {
      alert('Selecione uma ocorrência primeiro!');
      return;
    }

    if (!formData.numero_nfd) {
      alert('O número da NFD é obrigatório!');
      return;
    }

    try {
      const { data: nfdData, error: nfdError } = await supabase
        .from('nfd')
        .insert([{
          ocorrencia_id: selectedOcorrencia.id,
          numero_nfd: formData.numero_nfd,
          emitente_razao_social: formData.emitente_razao_social,
          emitente_ie: formData.emitente_ie,
          emitente_cnpj: formData.emitente_cnpj,
          emitente_endereco: formData.emitente_endereco,
          emitente_data_emissao: formData.emitente_data_emissao,
          destinatario_razao_social: formData.destinatario_razao_social,
          destinatario_ie: formData.destinatario_ie,
          destinatario_cnpj: formData.destinatario_cnpj,
          destinatario_endereco: formData.destinatario_endereco,
          transportadora_razao_social: formData.transportadora_razao_social,
          transportadora_ie: formData.transportadora_ie,
          transportadora_cnpj: formData.transportadora_cnpj,
          transportadora_endereco: formData.transportadora_endereco,
          frete_conta: formData.frete_conta,
          quantidade_volume: parseInt(formData.quantidade_volume) || 0,
          peso_bruto: parseFloat(formData.peso_bruto) || 0,
          valor: parseFloat(formData.valor) || 0,
          responsavel_devolucao: formData.responsavel_devolucao,
          telefone_responsavel: formData.telefone_responsavel,
          observacoes: formData.observacoes,
          status: 'Validada'
        }]);

      if (nfdError) {
        console.error('Erro ao salvar NFD:', nfdError);
        alert(`Erro: ${nfdError.message}`);
        return;
      }

      const { error: updateError } = await supabase
        .from('ocorrencias')
        .update({ 
          status: 'Aguardando Coleta',
          nota_devolucao: formData.numero_nfd
        })
        .eq('id', selectedOcorrencia.id);

      if (updateError) {
        console.error('Erro ao atualizar ocorrência:', updateError);
      }

      alert(`✅ NFD ${formData.numero_nfd} validada com sucesso!`);
      
      setSelectedOcorrencia(null);
      setFormData({
        numero_nfd: '',
        emitente_razao_social: '',
        emitente_ie: '',
        emitente_cnpj: '',
        emitente_endereco: '',
        emitente_data_emissao: '',
        destinatario_razao_social: '',
        destinatario_ie: '',
        destinatario_cnpj: '',
        destinatario_endereco: '',
        transportadora_razao_social: '',
        transportadora_ie: '',
        transportadora_cnpj: '',
        transportadora_endereco: '',
        frete_conta: '',
        quantidade_volume: '',
        peso_bruto: '',
        valor: '',
        responsavel_devolucao: '',
        telefone_responsavel: '',
        observacoes: ''
      });
      
      fetchOcorrencias();
      fetchNFDs();
      
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao validar NFD');
    }
  };

  if (loading) {
    return (
      <div className="nfd-container">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <p>🔄 Carregando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="nfd-container">
      <div style={{ 
        marginBottom: '30px', 
        padding: '20px', 
        border: '1px solid #ddd', 
        borderRadius: '8px',
        backgroundColor: '#f9f9f9'
      }}>
        <h2>📄 Validação de Nota Fiscal de Devolução (NFD)</h2>
        
        {error && (
          <div style={{ color: 'red', marginBottom: '15px', padding: '10px', backgroundColor: '#ffebee', borderRadius: '4px' }}>
            ❌ Erro: {error}
          </div>
        )}

        {/* Lista de ocorrências pendentes */}
        <div style={{ marginBottom: '30px' }}>
          <h3>📋 Ocorrências Aguardando NFD</h3>
          {ocorrencias.length === 0 ? (
            <p>✅ Nenhuma ocorrência aguardando NFD no momento.</p>
          ) : (
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
              <thead>
                <tr>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>ID</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cliente</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Nota Fiscal</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Produto</th>
                  <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Ação</th>
                </tr>
              </thead>
              <tbody>
                {ocorrencias.map((oc) => (
                  <tr key={oc.id}>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.id}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.cliente}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.nota_fiscal || '-'}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>{oc.produto}</td>
                    <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                      <button 
                        onClick={() => handleSelectOcorrencia(oc)}
                        style={{ padding: '5px 10px', backgroundColor: '#007bff', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                      >
                        Validar NFD
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Formulário de NFD */}
        {selectedOcorrencia && (
          <div style={{ marginTop: '30px', padding: '20px', backgroundColor: '#fff', borderRadius: '8px', border: '2px solid #007bff' }}>
            <h3>📝 Validar NFD para: {selectedOcorrencia.cliente}</h3>
            <p><strong>Nota Fiscal Original:</strong> {selectedOcorrencia.nota_fiscal || 'N/A'}</p>
            
            {/* Consulta SEFAZ */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#e8f5e9', 
              borderRadius: '8px',
              border: '1px solid #4caf50'
            }}>
              <h4>🔑 Consultar NFD na SEFAZ</h4>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  placeholder="Digite a chave de acesso (44 dígitos)"
                  value={chaveAcesso}
                  onChange={(e) => setChaveAcesso(e.target.value)}
                  maxLength="44"
                  style={{ 
                    flex: 1, 
                    padding: '10px', 
                    borderRadius: '4px', 
                    border: '1px solid #ccc',
                    fontFamily: 'monospace',
                    fontSize: '14px'
                  }}
                />
                <button
                  type="button"
                  onClick={consultarSEFAZ}
                  disabled={consultando}
                  style={{ 
                    padding: '10px 20px', 
                    backgroundColor: '#4caf50', 
                    color: 'white', 
                    border: 'none', 
                    borderRadius: '4px', 
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}
                >
                  {consultando ? '⏳ Consultando...' : '🔍 Consultar SEFAZ'}
                </button>
              </div>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                Informe a chave de acesso de 44 dígitos da NFD (localizada no DANFE). O sistema buscará os dados automaticamente na SEFAZ.
              </p>
            </div>

            {/* Documento encontrado */}
            {documentoEncontrado && (
              <div style={{ 
                marginBottom: '20px', 
                padding: '15px', 
                backgroundColor: '#c8e6c9', 
                borderRadius: '8px',
                border: '1px solid #388e3c'
              }}>
                <h4>✅ Documento encontrado na SEFAZ!</h4>
                <p><strong>Número:</strong> {documentoEncontrado.numero}</p>
                <p><strong>Emitente:</strong> {documentoEncontrado.emitente_razao_social}</p>
                <p><strong>Valor:</strong> R$ {parseFloat(documentoEncontrado.valor_total || 0).toFixed(2)}</p>
                <button
                  onClick={() => downloadXML(documentoEncontrado.id)}
                  style={{
                    marginTop: '10px',
                    padding: '8px 16px',
                    backgroundColor: '#ff9800',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  📄 Baixar XML da NFD
                </button>
              </div>
            )}

            {/* Botão de importação */}
            <div style={{ 
              marginBottom: '20px', 
              padding: '15px', 
              backgroundColor: '#e3f2fd', 
              borderRadius: '8px',
              border: '1px solid #90caf9'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', flexWrap: 'wrap' }}>
                <label htmlFor="import-nfd-file" style={{ cursor: 'pointer' }}>
                  <div style={{
                    padding: '12px 24px',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontSize: '14px',
                    fontWeight: 'bold'
                  }}>
                    <span>📂</span>
                    {importing ? '⏳ Importando...' : '📥 Importar NFD (Excel/PDF)'}
                  </div>
                  <input 
                    type="file" 
                    accept=".xlsx, .xls, .pdf" 
                    onChange={handleFileUpload}
                    disabled={importing}
                    style={{ display: 'none' }}
                    id="import-nfd-file"
                  />
                </label>
                <span style={{ fontSize: '13px', color: '#555' }}>
                  Importe arquivos Excel (.xlsx, .xls) ou PDF da NFD
                </span>
              </div>
              <p style={{ fontSize: '12px', marginTop: '10px', color: '#666' }}>
                📌 <strong>PDF:</strong> O sistema tentará extrair automaticamente os dados da NFe.<br/>
                📊 <strong>Excel:</strong> Use o modelo com colunas: NÚMERO NFD, EMITENTE RAZÃO SOCIAL, VALOR NOTA, etc.
              </p>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                
                {/* Seção: Dados da NFD */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px' }}>
                  <h4 style={{ margin: 0 }}>📄 Dados da NFD</h4>
                </div>
                
                <div>
                  <label>Número da NFD *</label>
                  <input
                    type="text"
                    name="numero_nfd"
                    value={formData.numero_nfd}
                    onChange={handleChange}
                    required
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    placeholder="Ex: NFD-001/2026"
                  />
                </div>
                
                <div>
                  <label>Data de Emissão</label>
                  <input
                    type="date"
                    name="emitente_data_emissao"
                    value={formData.emitente_data_emissao}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {/* Seção: Emitente */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                  <h4 style={{ margin: 0 }}>🏢 Emitente (Remetente)</h4>
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Razão Social</label>
                  <input
                    type="text"
                    name="emitente_razao_social"
                    value={formData.emitente_razao_social}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>CNPJ</label>
                  <input
                    type="text"
                    name="emitente_cnpj"
                    value={formData.emitente_cnpj}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Inscrição Estadual</label>
                  <input
                    type="text"
                    name="emitente_ie"
                    value={formData.emitente_ie}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Endereço</label>
                  <input
                    type="text"
                    name="emitente_endereco"
                    value={formData.emitente_endereco}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {/* Seção: Destinatário */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                  <h4 style={{ margin: 0 }}>📦 Destinatário</h4>
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Razão Social</label>
                  <input
                    type="text"
                    name="destinatario_razao_social"
                    value={formData.destinatario_razao_social}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>CNPJ</label>
                  <input
                    type="text"
                    name="destinatario_cnpj"
                    value={formData.destinatario_cnpj}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Inscrição Estadual</label>
                  <input
                    type="text"
                    name="destinatario_ie"
                    value={formData.destinatario_ie}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Endereço</label>
                  <input
                    type="text"
                    name="destinatario_endereco"
                    value={formData.destinatario_endereco}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {/* Seção: Transportadora */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                  <h4 style={{ margin: 0 }}>🚚 Transportadora</h4>
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Razão Social</label>
                  <input
                    type="text"
                    name="transportadora_razao_social"
                    value={formData.transportadora_razao_social}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>CNPJ</label>
                  <input
                    type="text"
                    name="transportadora_cnpj"
                    value={formData.transportadora_cnpj}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Inscrição Estadual</label>
                  <input
                    type="text"
                    name="transportadora_ie"
                    value={formData.transportadora_ie}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div style={{ gridColumn: '1/-1' }}>
                  <label>Endereço</label>
                  <input
                    type="text"
                    name="transportadora_endereco"
                    value={formData.transportadora_endereco}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {/* Seção: Dados da Devolução */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                  <h4 style={{ margin: 0 }}>📊 Dados da Devolução</h4>
                </div>
                
                <div>
                  <label>Valor da Nota (R$)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Frete por Conta</label>
                  <select
                    name="frete_conta"
                    value={formData.frete_conta}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  >
                    <option value="">Selecione</option>
                    <option value="Emitente">Emitente (Remetente)</option>
                    <option value="Destinatário">Destinatário</option>
                    <option value="Terceiros">Terceiros</option>
                  </select>
                </div>
                
                <div>
                  <label>Quantidade/Volume</label>
                  <input
                    type="number"
                    name="quantidade_volume"
                    value={formData.quantidade_volume}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Peso Bruto (kg)</label>
                  <input
                    type="number"
                    step="0.01"
                    name="peso_bruto"
                    value={formData.peso_bruto}
                    onChange={handleChange}
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                {/* Seção: Responsável pela Devolução */}
                <div style={{ gridColumn: '1/-1', backgroundColor: '#f0f0f0', padding: '10px', borderRadius: '4px', marginTop: '10px' }}>
                  <h4 style={{ margin: 0 }}>👤 Responsável pela Devolução</h4>
                </div>
                
                <div>
                  <label>Responsável</label>
                  <input
                    type="text"
                    name="responsavel_devolucao"
                    value={formData.responsavel_devolucao}
                    onChange={handleChange}
                    placeholder="Nome do responsável"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>
                
                <div>
                  <label>Telefone</label>
                  <input
                    type="text"
                    name="telefone_responsavel"
                    value={formData.telefone_responsavel}
                    onChange={handleChange}
                    placeholder="(00) 00000-0000"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                  />
                </div>

                <div style={{ gridColumn: '1/-1' }}>
                  <label>Observações</label>
                  <textarea
                    name="observacoes"
                    value={formData.observacoes}
                    onChange={handleChange}
                    rows="3"
                    style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid #ccc' }}
                    placeholder="Informações adicionais..."
                  />
                </div>
              </div>
              
              <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ padding: '10px 20px', backgroundColor: '#28a745', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  ✅ Validar e Salvar NFD
                </button>
                <button type="button" onClick={() => setSelectedOcorrencia(null)} style={{ padding: '10px 20px', backgroundColor: '#6c757d', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Lista de NFDs já validadas */}
        <div style={{ marginTop: '30px' }}>
          <h3>📜 Histórico de NFDs Validadas</h3>
          {nfdList.length === 0 ? (
            <p>Nenhuma NFD validada ainda.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '10px' }}>
                <thead>
                  <tr>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>NFD</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Cliente</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Emitente</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Transportadora</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Valor</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Responsável</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>Status</th>
                    <th style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'left' }}>XML</th>
                  </tr>
                </thead>
                <tbody>
                  {nfdList.map((nfd) => (
                    <tr key={nfd.id}>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.numero_nfd}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.ocorrencias?.cliente || '-'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.emitente_razao_social || '-'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.transportadora_razao_social || '-'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>R$ {parseFloat(nfd.valor || 0).toFixed(2)}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>{nfd.responsavel_devolucao || '-'}</td>
                      <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                        <span style={{ color: 'green', fontWeight: 'bold' }}>✅ {nfd.status}</span>
                      </td>
                      <td style={{ border: '1px solid #ddd', padding: '8px', textAlign: 'center' }}>
                        <button
                          onClick={() => downloadXML(nfd.id)}
                          style={{
                            padding: '5px 10px',
                            backgroundColor: '#ff9800',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            cursor: 'pointer',
                            fontSize: '12px'
                          }}
                        >
                          📄 Baixar XML
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ValidacaoNFD;