const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { supabase } = require('../config/supabaseClient');
const {
  listOcorrencias,
  getOcorrencia,
  createOcorrencia,
  updateOcorrencia
} = require('../controllers/ocorrenciaController');

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// =====================================================
// ROTAS CRUD DE OCORRÊNCIAS
// =====================================================

// GET /ocorrencias - Listar todas
router.get('/', listOcorrencias);

// GET /ocorrencias/:id - Buscar por ID
router.get('/:id', getOcorrencia);

// POST /ocorrencias - Criar nova
router.post('/', createOcorrencia);

// PUT /ocorrencias/:id - Atualizar
router.put('/:id', updateOcorrencia);

// =====================================================
// ROTA DE UPLOAD DE PLANILHA
// =====================================================

// POST /ocorrencias/upload - Upload de planilha Excel
router.post('/upload', upload.single('planilha'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'Nenhum arquivo enviado.' });
    }

    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const dados = xlsx.utils.sheet_to_json(worksheet);

    console.log('Total de linhas na planilha:', dados.length);

    // Mapear apenas registros válidos
    const ocorrenciasMapeadas = dados
      .map(ocorrencia => {
        const cliente = String(ocorrencia['NOME DO CLIENTE'] || '').trim();
        const notaFiscal = String(ocorrencia['NÚMERO NF'] || '').trim();
        const produto = String(ocorrencia['DESCRIÇÃO PRODUTO'] || '').trim();
        
        // Ignorar linhas vazias/inválidas
        if (!cliente || cliente === 'Pendente' || cliente === '-' || cliente.length < 3) {
          return null;
        }
        
        return {
          data: new Date(),
          cliente,
          codigo_cliente: String(ocorrencia['CÓDIGO CLIENTE'] || '').trim() || null,
          nota_fiscal: notaFiscal || null,
          produto,
          quantidade: parseInt(ocorrencia['QUANTIDADE']) || 1,
          tipo_ocorrencia: ocorrencia['TIPO DE OCORRÊNCI (Avaria / Falta / Troca)'] || null,
          observacoes: ocorrencia['OBSERVAÇÕES'] || null,
          status: 'Pendente',
          finalizado: false
        };
      })
      .filter(o => o !== null);

    if (ocorrenciasMapeadas.length === 0) {
      return res.status(400).json({ error: 'Nenhum registro válido encontrado na planilha' });
    }

    console.log(`Importando ${ocorrenciasMapeadas.length} ocorrências válidas`);

    let sucesso = 0;
    let erros = 0;

    for (const ocorrencia of ocorrenciasMapeadas) {
      const { error } = await supabase.from('ocorrencias').insert([ocorrencia]);
      if (error) {
        console.error('Erro ao inserir:', error);
        erros++;
      } else {
        sucesso++;
      }
    }

    res.json({
      message: 'Planilha processada!',
      total: ocorrenciasMapeadas.length,
      sucesso,
      erros
    });

  } catch (error) {
    console.error('Erro no upload:', error);
    res.status(500).json({ error: 'Erro interno no servidor' });
  }
});

module.exports = router;
