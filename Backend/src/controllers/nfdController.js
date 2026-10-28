const { pool } = require('../config/supabaseClient');

async function validateNFD(req, res) {
  try {
    const { remetente, destinatario, transportadora, frete, volume, peso, valor } = req.body;
    
    if (!remetente || !destinatario || !transportadora || !frete) {
      return res.status(400).json({ error: 'Campos obrigatórios faltando' });
    }
    
    if (frete !== 'CIF' && frete !== 'FOB') {
      return res.status(400).json({ error: 'Frete deve ser CIF ou FOB' });
    }
    
    const result = await pool.query(
      `INSERT INTO nfd (emitente_razao_social, destinatario_razao_social, transportadora_razao_social, 
                        frete_conta, quantidade_volume, peso_bruto, valor, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, 'Validada') RETURNING *`,
      [remetente, destinatario, transportadora, frete, 
       parseInt(volume) || 0, parseFloat(peso) || 0, parseFloat(valor) || 0]
    );
    
    return res.status(201).json({ message: 'NFD validada!', data: result.rows[0] });
  } catch (err) {
    console.error('Erro:', err);
    return res.status(500).json({ error: err.message });
  }
}

async function listNFDs(req, res) {
  try {
    let query = 'SELECT * FROM nfd WHERE 1=1';
    const values = [];
    
    if (req.query.frete) {
      values.push(req.query.frete);
      query += ` AND frete_conta = $${values.length}`;
    }
    
    query += ' ORDER BY id DESC';
    
    const result = await pool.query(query, values);
    return res.json({ nfds: result.rows, total: result.rows.length, filtro: req.query.frete || 'todos' });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}

module.exports = { validateNFD, listNFDs };
