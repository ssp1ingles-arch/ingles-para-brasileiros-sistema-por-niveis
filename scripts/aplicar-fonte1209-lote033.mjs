import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const nome = '1209_5E10C803-A29D-47EF-9925-F11EB874201E.md';
const texto = fs.readFileSync(path.join(fonteDir, nome), 'utf8');
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const fonte = {
  numero: 1209,
  nome_completo: nome,
  tipo: 'OCR de imagem didática curta',
  tamanho_bytes: Buffer.byteLength(texto),
  hash_bruto: sha(texto),
  hash_normalizado: sha(normalizar(texto)),
  leitura_integral: true,
  imagem_original_conferida_somente_leitura: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [] },
  integridade: {
    utf8_valido: true,
    caracteres_substituicao: (texto.match(/�/gu) || []).length,
    marcadores_cid: (texto.match(/\(cid:\d+\)/gu) || []).length,
    ocr_insuficiente: false,
    corrupcao: false,
    correspondencia_visual: 'texto principal confirmado; OCR omitiu acentos da aproximação fonética e separadores do crédito'
  },
  estrutura: {
    frases_bilingues: 1,
    aproximacoes_foneticas_nao_padronizadas: 1,
    creditos_ou_identificadores: 2,
    elementos_visuais_decorativos: 3,
    imagens_publicadas: 0
  },
  partes: [
    {
      id: 'frase-bilingue',
      natureza: 'frase curta com futuro afirmativo de think',
      decisao: 'consolidar procedência em unidade existente',
      nivel_cefr: 'B1',
      habilidade_principal: 'Verbos',
      destino_curricular_especifico: 'B1-L5-0164-02',
      justificativa: 'O futuro afirmativo de think já é coberto pela unidade existente; a ocorrência isolada não justifica nova unidade.',
      elegivel_atividade: false,
      elegivel_jornada: false
    },
    {
      id: 'aproximacao-fonetica',
      natureza: 'grafia aproximativa de pronúncia para falante de português, sem IPA',
      decisao: 'descartar',
      destino_curricular_especifico: null,
      justificativa: 'Não é transcrição fonética padronizada e omite contrastes relevantes.'
    },
    {
      id: 'creditos-marcas-e-visuais',
      natureza: 'crédito pessoal, perfil, marca de repostagem, bandeiras e elementos visuais',
      decisao: 'descartar',
      destino_curricular_especifico: null,
      justificativa: 'Dados pessoais/editoriais, marcas e elementos visuais não constituem conteúdo curricular e não serão publicados.'
    }
  ],
  totais: { partes: 3, consolidadas: 1, descartadas: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Somente classificação, contagens, hashes e destino; frase, imagem, pseudo-fonética, créditos e marcas não foram republicados.'
};

fs.writeFileSync(path.join(raiz, 'dados/mapeamento-fontes-extensas-033.json'), `${JSON.stringify({ lote: '033', comparacoes_integrais: [], fontes: [fonte] }, null, 2)}\n`);
fs.writeFileSync(path.join(raiz, 'dados/lote-033-triagem.json'), `${JSON.stringify({
  lote: '033',
  intervalo: [1209, 1209],
  sequenciais: [{
    numero: 1209,
    nome,
    tamanho_bytes: fonte.tamanho_bytes,
    hash_bruto: fonte.hash_bruto,
    hash_normalizado: fonte.hash_normalizado,
    leitura_integral: true,
    status: 'integralmente classificada',
    tipo: fonte.tipo,
    partes: 3,
    sem_destino_util: 0
  }],
  validacao_intermediaria: { pendente: true, encerrada_em: 1209 }
}, null, 2)}\n`);
console.log('1209 classificada integralmente: 3/3 partes decididas.');
