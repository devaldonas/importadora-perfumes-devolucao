import React from 'react';
import './App.css';
import Ocorrencias from './components/Ocorrencias/Ocorrencias';
import ValidacaoNFD from './components/ValidacaoNFD/ValidacaoNFD';
import AcompanhamentoColetas from './components/AcompanhamentoColetas/AcompanhamentoColetas';
import PainelFinanceiro from './components/PainelFinanceiro/PainelFinanceiro';

function App() {
  return (
    <div className="App">
      <Ocorrencias />
      <ValidacaoNFD />
      <AcompanhamentoColetas />
      <PainelFinanceiro />
    </div>
  );
}

export default App;
