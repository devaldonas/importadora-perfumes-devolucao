const express = require('express');
const sefazService = require('../services/sefazService');
const { supabase } = require('../config/supabaseClient');

const router = express.Router();

// Consultar NFD pela chave de acesso
router.post('/consultar-nfd', async (req, res) => {
  const { chaveAcesso, ocorrenciaId } = req.body;
  
  if (!chaveAcesso || chaveAcesso.length !== 44) {
    return res.status(400).json({ 
      success: false, 
      error: 'Chave de acesso inválida. Deve ter 44 dígitos.' 
    });
  }
  
  const resultado = await sefazService.consultarNFD(chaveAcesso, ocorrenciaId);
  
  if (resultado.success) {
    res.json(resultado);
  } else {
    res.status(404).json(resultado);
  }
});


// Listar documentos
router.get('/documentos', async (req, res) => {
  const { data, error } = await supabase
    .from('sefaz_documentos')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    res.status(500).json({ error: error.message });
  } else {
    res.json(data);
  }
});

// Download do XML por ID do documento
router.get('/download-xml/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const { data, error } = await supabase
      .from('sefaz_documentos')
      .select('xml_completo, chave_acesso, numero')
      .eq('id', id)
      .single();
    
    if (error || !data || !data.xml_completo) {
      return res.status(404).json({ error: 'XML não encontrado' });
    }
    
    // Definir headers para download
    res.setHeader('Content-Type', 'application/xml');
    res.setHeader('Content-Disposition', `attachment; filename=NFD_${data.chave_acesso}.xml`);
    res.send(data.xml_completo);
    
  } catch (error) {
    console.error('Erro no download do XML:', error);
    res.status(500).json({ error: 'Erro interno' });
  }
});

// Health check
router.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    sefazReady: !!sefazService.distribuicao,
    timestamp: new Date()
  });
});

module.exports = router;