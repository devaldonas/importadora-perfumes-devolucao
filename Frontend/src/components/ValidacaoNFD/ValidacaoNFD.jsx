import React, { useState } from 'react';
import supabase from '../../services/supabaseClient';
import './ValidacaoNFD.css';

function ValidacaoNFD() {
  const [file, setFile] = useState(null);
  const [nfdData, setNfdData] = useState(null);
  const [alert, setAlert] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleUpload = async () => {
    if (!file) {
      setAlert('Por favor, selecione um arquivo.');
      return;
    }

    // Simular a leitura e validação do arquivo (você pode usar uma biblioteca como `xlsx` para ler arquivos Excel)
    const data = {
      remetente: 'Remetente Exemplo',
      destinatario: 'Destinatário Exemplo',
      transportadora: 'Transportadora Exemplo',
      frete: 'CIF',
      volume: 1,
      peso: 10,
      valor: 100,
    };

    setNfdData(data);
    setAlert('Arquivo carregado com sucesso!');
  };

  const handleValidation = async () => {
    if (!nfdData) {
      setAlert('Nenhum dado de NFD para validar.');
      return;
    }

    // Validar os dados da NFD
    if (!nfdData.remetente || !nfdData.destinatario || !nfdData.transportadora || !nfdData.frete || !nfdData.volume || !nfdData.peso || !nfdData.valor) {
      setAlert('Dados da NFD incompletos.');
      return;
    }

    // Enviar dados validados para o Supabase
    const { error } = await supabase
      .from('nfd')
      .insert([nfdData]);

    if (error) {
      setAlert(`Erro ao salvar NFD: ${error.message}`);
    } else {
      setAlert('NFD validada e salva com sucesso!');
    }
  };

  return (
    <div className="validacao-nfd-container">
      <h1>Validação de NFD</h1>
      <div className="upload-section">
        <input type="file" onChange={handleFileChange} />
        <button onClick={handleUpload}>Carregar Arquivo</button>
      </div>
      {nfdData && (
        <div className="nfd-data">
          <h2>Dados da NFD</h2>
          <p><strong>Remetente:</strong> {nfdData.remetente}</p>
          <p><strong>Destinatário:</strong> {nfdData.destinatario}</p>
          <p><strong>Transportadora:</strong> {nfdData.transportadora}</p>
          <p><strong>Frete:</strong> {nfdData.frete}</p>
          <p><strong>Volume:</strong> {nfdData.volume}</p>
          <p><strong>Peso:</strong> {nfdData.peso}</p>
          <p><strong>Valor:</strong> {nfdData.valor}</p>
        </div>
      )}
      {alert && <p className="alert">{alert}</p>}
      <button onClick={handleValidation}>Validar NFD</button>
    </div>
  );
}

export default ValidacaoNFD;
