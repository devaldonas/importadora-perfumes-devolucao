const { pool } = require('../config/supabaseClient');

// =====================================================
// LISTAR todas as ocorrências
// =====================================================
async function listOcorrencias(req, res) {
  try {
    const { status, cliente, decisao } = req.query;
    
    let query = 'SELECT * FROM ocorrencias WHERE 1=1';
    const values = [];
    
    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    if (cliente) {
      values.push(cliente);
      query += ` AND cliente = $${values.length}`;
    }
    if (decisao) {
      values.push(decisao);
      query += ` AND decisao = $${values.length}`;
    }
    
    query += ' ORDER BY id DESC';
    
    const result = await pool.query(query, values);
    return res.json(result.rows);
  } catch (err) {
    console.error('Erro ao listar ocorrências:', err);
    return res.status(500).json({ error: err.message });
  }
}

// =====================================================
// BUSCAR ocorrência por ID
// =====================================================
async function getOcorrencia(req, res) {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM ocorrencias WHERE id = $1', [parseInt(id)]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    return res.json(result.rows[0]);
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ error: 'Erro interno' });
  }
}

// =====================================================
// CRIAR nova ocorrência
// =====================================================
async function createOcorrencia(req, res) {
  try {
    const {
      cliente, codigo_cliente, nota_fiscal, produto,
      quantidade, tipo_ocorrencia, observacoes
    } = req.body;
    
    if (!cliente || !produto) {
      return res.status(400).json({ error: 'Cliente e produto são obrigatórios' });
    }
    
    const result = await pool.query(
      `INSERT INTO ocorrencias 
       (cliente, codigo_cliente, nota_fiscal, produto, quantidade, tipo_ocorrencia, observacoes, status, finalizado)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Pendente', false)
       RETURNING *`,
      [cliente, codigo_cliente || null, nota_fiscal || null, produto, 
       parseInt(quantidade) || 1, tipo_ocorrencia || null, observacoes || null]
    );
    
    return res.status(201).json({ 
      message: 'Ocorrência criada com sucesso!', 
      data: result.rows[0] 
    });
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}

// =====================================================
// ATUALIZAR ocorrência
// =====================================================
async function updateOcorrencia(req, res) {
  try {
    const { id } = req.params;
    const { status, decisao, nota_devolucao, finalizado } = req.body;
    
    const setClauses = [];
    const values = [];
    
    if (status !== undefined) {
      values.push(status);
      setClauses.push(`status = $${values.length}`);
    }
    if (decisao !== undefined) {
      values.push(decisao);
      setClauses.push(`decisao = $${values.length}`);
    }
    if (nota_devolucao !== undefined) {
      values.push(nota_devolucao);
      setClauses.push(`nota_devolucao = $${values.length}`);
    }
    if (finalizado !== undefined) {
      values.push(finalizado);
      setClauses.push(`finalizado = $${values.length}`);
    }
    
    if (setClauses.length === 0) {
      return res.status(400).json({ error: 'Nenhum campo para atualizar' });
    }
    
    setClauses.push(`updated_at = NOW()`);
    values.push(parseInt(id));
    
    const query = `UPDATE ocorrencias SET ${setClauses.join(', ')} WHERE id = $${values.length} RETURNING *`;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Ocorrência não encontrada' });
    }
    
    return res.json({ message: 'Ocorrência atualizada!', data: result.rows[0] });
  } catch (err) {
    console.error('Erro ao atualizar:', err);
    return res.status(500).json({ error: err.message });
  }
}

module.exports = {
  listOcorrencias,
  getOcorrencia,
  createOcorrencia,
  updateOcorrencia
};
