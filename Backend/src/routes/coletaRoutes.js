const express = require('express');
const { pool } = require('../config/supabaseClient');
const router = express.Router();

// GET /coletas - Listar todas
router.get('/', async (req, res) => {
  try {
    let query = 'SELECT * FROM coletas WHERE 1=1';
    const values = [];
    
    if (req.query.status) {
      values.push(req.query.status);
      query += ` AND status = $${values.length}`;
    }
    if (req.query.ocorrencia_id) {
      values.push(parseInt(req.query.ocorrencia_id));
      query += ` AND ocorrencia_id = $${values.length}`;
    }
    
    query += ' ORDER BY id DESC';
    
    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ error: err.message });
  }
});

// GET /coletas/:id
router.get('/:id', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM coletas WHERE id = $1', [parseInt(req.params.id)]);
    if (result.rows.length === 0) return res.status(404).json({ error: 'Coleta não encontrada' });
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// POST /coletas
router.post('/', async (req, res) => {
  try {
    const { ocorrencia_id, transportadora, protocolo, data_coleta, observacoes } = req.body;
    
    const result = await pool.query(
      `INSERT INTO coletas (ocorrencia_id, transportadora, protocolo, data_coleta, observacoes, status)
       VALUES ($1, $2, $3, $4, $5, 'Pendente') RETURNING *`,
      [ocorrencia_id, transportadora, protocolo, data_coleta || null, observacoes || null]
    );
    
    return res.status(201).json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

// PUT /coletas/:id
router.put('/:id', async (req, res) => {
  try {
    const { status, protocolo, transportadora, data_coleta } = req.body;
    const setClauses = [];
    const values = [];
    
    if (status) { values.push(status); setClauses.push(`status = $${values.length}`); }
    if (protocolo) { values.push(protocolo); setClauses.push(`protocolo = $${values.length}`); }
    if (transportadora) { values.push(transportadora); setClauses.push(`transportadora = $${values.length}`); }
    if (data_coleta) { values.push(data_coleta); setClauses.push(`data_coleta = $${values.length}`); }
    
    if (setClauses.length === 0) return res.status(400).json({ error: 'Nada para atualizar' });
    
    setClauses.push(`updated_at = NOW()`);
    values.push(parseInt(req.params.id));
    
    const result = await pool.query(
      `UPDATE coletas SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`,
      values
    );
    
    return res.json(result.rows[0]);
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
});

module.exports = router;
