const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

// Função helper para criar cliente Supabase com token do usuário
function getSupabaseClient(req) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return null;
  }

  return createClient(supabaseUrl, supabaseKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });
}

// Função para validar uma NFD
async function validateNFD(req, res) {
  try {
    const supabase = getSupabaseClient(req);

    // 🔐 Verifica token
    if (!supabase) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    console.log('Corpo da requisição no validateNFD:', req.body);

    const {
      remetente,
      destinatario,
      transportadora,
      frete,
      volume,
      peso,
      valor
    } = req.body;

    // 🧱 Validação de campos obrigatórios (com verificação de string vazia)
    if (!remetente || remetente.trim() === '') {
      return res.status(400).json({ error: 'Campo remetente é obrigatório' });
    }
    
    if (!destinatario || destinatario.trim() === '') {
      return res.status(400).json({ error: 'Campo destinatario é obrigatório' });
    }
    
    if (!transportadora || transportadora.trim() === '') {
      return res.status(400).json({ error: 'Campo transportadora é obrigatório' });
    }
    
    // Validação específica para frete (CIF ou FOB)
    if (!frete || (frete !== 'CIF' && frete !== 'FOB')) {
      return res.status(400).json({ 
        error: 'Campo frete é obrigatório e deve ser "CIF" ou "FOB"' 
      });
    }
    
    // Validar campos numéricos
    if (volume === undefined || volume === null) {
      return res.status(400).json({ error: 'Campo volume é obrigatório' });
    }
    
    if (peso === undefined || peso === null) {
      return res.status(400).json({ error: 'Campo peso é obrigatório' });
    }
    
    if (valor === undefined || valor === null) {
      return res.status(400).json({ error: 'Campo valor é obrigatório' });
    }

    // Converter e validar valores numéricos
    const volumeNum = parseInt(volume);
    const pesoNum = parseFloat(peso);
    const valorNum = parseFloat(valor);
    
    if (isNaN(volumeNum)) {
      return res.status(400).json({ error: 'Campo volume deve ser um número inteiro válido' });
    }
    
    if (isNaN(pesoNum)) {
      return res.status(400).json({ error: 'Campo peso deve ser um número válido' });
    }
    
    if (isNaN(valorNum)) {
      return res.status(400).json({ error: 'Campo valor deve ser um número válido' });
    }

    // Validações adicionais (opcionais)
    if (volumeNum <= 0) {
      return res.status(400).json({ error: 'Campo volume deve ser maior que zero' });
    }
    
    if (pesoNum <= 0) {
      return res.status(400).json({ error: 'Campo peso deve ser maior que zero' });
    }
    
    if (valorNum <= 0) {
      return res.status(400).json({ error: 'Campo valor deve ser maior que zero' });
    }

    console.log('Dados validados para inserção:', {
      remetente: remetente.trim(),
      destinatario: destinatario.trim(),
      transportadora: transportadora.trim(),
      frete: frete.toUpperCase(),
      volume: volumeNum,
      peso: pesoNum,
      valor: valorNum,
      status: 'validado'
    });

    // 📦 Inserção no Supabase
    const { data, error } = await supabase
      .from('nfd')
      .insert([
        {
          remetente: remetente.trim(),
          destinatario: destinatario.trim(),
          transportadora: transportadora.trim(),
          frete: frete.toUpperCase(), // Garantir que seja maiúsculo
          volume: volumeNum,
          peso: pesoNum,
          valor: valorNum,
          status: 'validado'
        }
      ])
      .select();

    if (error) {
      console.error('Erro ao inserir no Supabase:', error);
      return res.status(400).json({ 
        error: error.message,
        details: error.details 
      });
    }

    console.log('Inserção bem-sucedida:', data);

    return res.status(201).json({
      message: 'NFD validada e salva com sucesso!',
      data
    });

  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({
      error: 'Erro interno no servidor',
      message: err.message
    });
  }
}

// Função para listar NFDs
async function listNFDs(req, res) {
  try {
    const supabase = getSupabaseClient(req);

    // 🔐 Verifica token
    if (!supabase) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }

    // Suporte para filtro opcional por frete
    const { frete } = req.query;
    
    let query = supabase.from('nfd').select('*');
    
    // Se o filtro de frete foi fornecido e é válido, aplicar
    if (frete && (frete === 'CIF' || frete === 'FOB')) {
      query = query.eq('frete', frete.toUpperCase());
      console.log(`Filtrando NFDs por frete: ${frete.toUpperCase()}`);
    }

    const { data, error } = await query;

    if (error) {
      console.error('Erro ao listar NFDs:', error);
      return res.status(400).json({ error: error.message });
    }

    console.log(`NFDs listadas com sucesso: ${data.length} registros encontrados`);

    return res.status(200).json({
      nfds: data,
      total: data.length,
      filtro: frete || 'todos'
    });

  } catch (err) {
    console.error('Erro no servidor:', err);
    return res.status(500).json({
      error: 'Erro interno no servidor'
    });
  }
}

module.exports = { validateNFD, listNFDs };
