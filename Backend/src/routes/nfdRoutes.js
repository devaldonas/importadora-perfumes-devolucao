const express = require('express');
const { validateNFD, listNFDs } = require('../controllers/nfdController');
const { supabase } = require('../config/supabaseClient');
const router = express.Router();

// =====================================================
// ROTAS REST PADRÃO (compatível com cliente fake)
// =====================================================

// GET /nfd - Listar todas as NFDs
router.get('/', async (req, res) => {
  try {
    let query = supabase.from('nfd').select('*');
    
    // Filtros opcionais
    if (req.query.frete) query = query.eq('frete_conta', req.query.frete);
    if (req.query.ocorrencia_id) query = query.eq('ocorrencia_id', parseInt(req.query.ocorrencia_id));
    
    const { data, error } = await query.order('id', { ascending: false });
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data || []);
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// GET /nfd/:id - Buscar por ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('nfd')
      .select('*')
      .eq('id', parseInt(id))
      .single();
    
    if (error) return res.status(404).json({ error: 'NFD não encontrada' });
    return res.json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// POST /nfd - Criar nova NFD
router.post('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('nfd')
      .insert([req.body])
      .select();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.status(201).json(data[0] || data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// PUT /nfd/:id - Atualizar NFD
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('nfd')
      .update({ ...req.body, updated_at: new Date() })
      .eq('id', parseInt(id))
      .select();
    
    if (error) return res.status(500).json({ error: error.message });
    return res.json(data[0] || data);
  } catch (err) {
    return res.status(500).json({ error: 'Erro interno' });
  }
});

// =====================================================
// ROTAS CUSTOMIZADAS (legado)
// =====================================================
router.post('/validate', validateNFD);
router.get('/list', listNFDs);

module.exports = router;
