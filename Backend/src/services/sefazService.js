const { DistribuicaoNFe } = require('@vexta-systems/node-mde');
const fs = require('fs');
const xml2js = require('xml2js');
const { supabase } = require('../config/supabaseClient');

class SefazService {
  constructor() {
    this.distribuicao = null;
    this.init();
  }

  init() {
    try {
      const certificadoPath = process.env.CERTIFICADO_PATH;
      
      if (!fs.existsSync(certificadoPath)) {
        console.warn('⚠️ Certificado digital não encontrado em:', certificadoPath);
        return;
      }

      const certificado = fs.readFileSync(certificadoPath);
      
      this.distribuicao = new DistribuicaoNFe({
        pfx: certificado,
        passphrase: process.env.CERTIFICADO_SENHA,
        cnpj: process.env.CNPJ_EMPRESA,
        cUFAutor: process.env.UF_CODIGO || '35',
        tpAmb: process.env.AMBIENTE_SEFAZ || '2',
      });
      
      console.log('✅ Cliente SEFAZ inicializado com sucesso');
    } catch (error) {
      console.error('❌ Erro ao inicializar cliente SEFAZ:', error.message);
    }
  }

  async consultarNFD(chaveAcesso, ocorrenciaId = null) {
    try {
      console.log(`🔍 Consultando NFD com chave: ${chaveAcesso}`);
      console.log(`📌 CNPJ do certificado: ${process.env.CNPJ_EMPRESA}`);
      console.log(`📌 UF: ${process.env.UF_CODIGO}`);
      console.log(`📌 Ambiente: ${process.env.AMBIENTE_SEFAZ === '1' ? 'Produção' : 'Homologação'}`);
      
      if (!chaveAcesso || chaveAcesso.length !== 44) {
        throw new Error('Chave de acesso inválida. Deve ter 44 dígitos.');
      }
      
      // Verificar cache
      const { data: existente } = await supabase
        .from('sefaz_documentos')
        .select('*')
        .eq('chave_acesso', chaveAcesso)
        .single();
      
      if (existente) {
        console.log('📦 Documento encontrado no cache');
        return { success: true, data: existente, fromCache: true };
      }
      
      if (!this.distribuicao) {
        throw new Error('Cliente SEFAZ não inicializado. Verifique o certificado.');
      }
      
      const resultado = await this.distribuicao.consultaChNFe(chaveAcesso);
      
      if (resultado && resultado.data) {
        const cStat = resultado.data.cStat;
        const xMotivo = resultado.data.xMotivo;
        
        console.log(`📌 SEFAZ retornou: ${cStat} - ${xMotivo}`);
        
        // cStat 100 = Documento localizado (com XML)
        // cStat 137 = Documento localizado com NSU
        // cStat 138 = Documento localizado (sem XML, precisa buscar)
        
        if (cStat === '100' || cStat === '137' || cStat === '138') {
          let xml = null;
          
          // Tentar pegar XML direto
          if (resultado.data.docZip && resultado.data.docZip.length > 0) {
            const docZip = resultado.data.docZip[0];
            xml = docZip.xml || docZip;
          }
          
          // Se não veio XML e é código 138, buscar por NSU
          if (!xml && cStat === '138' && resultado.data.ultNSU) {
            console.log(`📌 Buscando por NSU: ${resultado.data.ultNSU}`);
            try {
              const nsuResult = await this.distribuicao.consultaNSU(resultado.data.ultNSU);
              if (nsuResult && nsuResult.data && nsuResult.data.docZip && nsuResult.data.docZip.length > 0) {
                const docZip = nsuResult.data.docZip[0];
                xml = docZip.xml || docZip;
              }
            } catch (nsuError) {
              console.log(`⚠️ Erro na busca por NSU: ${nsuError.message}`);
            }
          }
          
          // Se ainda não tem XML, tentar buscar pela chave novamente
          if (!xml) {
            console.log('📌 Tentando buscar XML diretamente...');
            const docResultado = await this.distribuicao.consultaChNFe(chaveAcesso);
            if (docResultado && docResultado.data && docResultado.data.docZip && docResultado.data.docZip.length > 0) {
              const docZip = docResultado.data.docZip[0];
              xml = docZip.xml || docZip;
            }
          }
          
          if (!xml) {
            throw new Error('XML não encontrado na resposta');
          }
          
          const dadosExtraidos = await this.extrairDadosDoXML(xml);
          
          const { data: salvo, error } = await supabase
            .from('sefaz_documentos')
            .insert({
              chave_acesso: chaveAcesso,
              tipo: 'NFD',
              numero: dadosExtraidos.numero,
              serie: dadosExtraidos.serie,
              data_emissao: dadosExtraidos.data_emissao,
              valor_total: dadosExtraidos.valor_total,
              emitente_cnpj: dadosExtraidos.emitente?.cnpj,
              emitente_ie: dadosExtraidos.emitente?.ie,
              emitente_razao_social: dadosExtraidos.emitente?.razao_social,
              emitente_endereco: dadosExtraidos.emitente?.endereco,
              destinatario_cnpj: dadosExtraidos.destinatario?.cnpj,
              destinatario_ie: dadosExtraidos.destinatario?.ie,
              destinatario_razao_social: dadosExtraidos.destinatario?.razao_social,
              destinatario_endereco: dadosExtraidos.destinatario?.endereco,
              transportadora_cnpj: dadosExtraidos.transportadora?.cnpj,
              transportadora_razao_social: dadosExtraidos.transportadora?.razao_social,
              frete_por_conta: dadosExtraidos.frete_por_conta,
              peso_bruto: dadosExtraidos.peso_bruto,
              quantidade_volume: dadosExtraidos.quantidade_volume,
              xml_completo: typeof xml === 'string' ? xml : JSON.stringify(xml),
              status: 'validado',
              ultima_consulta: new Date(),
              ocorrencia_id: ocorrenciaId
            })
            .select()
            .single();
          
          if (error) throw error;
          
          console.log('✅ NFD validada e salva com sucesso');
          return { success: true, data: salvo, fromCache: false };
        }
        
        return { success: false, error: `SEFAZ: ${xMotivo} (cStat: ${cStat})` };
      }
      
      throw new Error('Resposta inválida da SEFAZ');
      
    } catch (error) {
      console.error('❌ Erro na consulta:', error.message);
      return { success: false, error: error.message };
    }
  }

  async extrairDadosDoXML(xmlString) {
    const parser = new xml2js.Parser({ explicitArray: false });
    const xmlObj = await parser.parseStringPromise(xmlString);
    
    const nfe = xmlObj.nfeProc?.NFe || xmlObj.NFe;
    const infNFe = nfe?.infNFe;
    
    if (!infNFe) {
      throw new Error('Estrutura do XML não reconhecida');
    }
    
    const emit = infNFe.emit;
    const dest = infNFe.dest;
    const total = infNFe.total?.ICMSTot;
    const transp = infNFe.transp;
    
    return {
      numero: infNFe.ide?.nNF,
      serie: infNFe.ide?.serie,
      data_emissao: infNFe.ide?.dhEmi?.split('T')[0] || infNFe.ide?.dEmi,
      valor_total: parseFloat(total?.vNF || 0),
      emitente: {
        cnpj: emit?.CNPJ,
        ie: emit?.IE,
        razao_social: emit?.xNome,
        endereco: this.formatarEndereco(emit?.enderEmit)
      },
      destinatario: {
        cnpj: dest?.CNPJ,
        ie: dest?.IE,
        razao_social: dest?.xNome,
        endereco: this.formatarEndereco(dest?.enderDest)
      },
      transportadora: transp?.transporta ? {
        cnpj: transp.transporta.CNPJ,
        ie: transp.transporta.IE,
        razao_social: transp.transporta.xNome
      } : null,
      frete_por_conta: transp?.modFrete === '0' ? 'Emitente' : 
                       transp?.modFrete === '1' ? 'Destinatário' : 'Terceiros',
      peso_bruto: parseFloat(transp?.vol?.pesoB || 0),
      quantidade_volume: parseInt(transp?.vol?.qVol || 0)
    };
  }

  formatarEndereco(endereco) {
    if (!endereco) return '';
    return `${endereco.xLgr || ''}, ${endereco.nro || ''} - ${endereco.xBairro || ''} - ${endereco.xMun || ''}/${endereco.UF || ''}`;
  }
}

module.exports = new SefazService();