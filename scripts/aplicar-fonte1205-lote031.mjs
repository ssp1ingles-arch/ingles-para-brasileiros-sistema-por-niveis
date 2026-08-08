import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const nome = '1205_2E6834F9-E31A-4992-8A29-F6622BD1EBED.md';
const texto = fs.readFileSync(path.join(fonteDir, nome), 'utf8');
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const fonte = {
  numero: 1205,
  nome_completo: nome,
  tipo: 'OCR de imagem didática curta',
  tamanho_bytes: Buffer.byteLength(texto),
  hash_bruto: sha(texto),
  hash_normalizado: sha(normalizar(texto)),
  leitura_integral: true,
  imagem_original_conferida_somente_leitura: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [] },
  integridade: { utf8_valido: true, caracteres_substituicao: (texto.match(/�/gu) || []).length, marcadores_cid: (texto.match(/\(cid:\d+\)/gu) || []).length, ocr_insuficiente: false, corrupcao: false, correspondencia_visual: 'texto principal e créditos confirmados; OCR omitiu apenas pontuação/acentuação da aproximação fonética' },
  estrutura: { frases_bilingues: 1, aproximacoes_foneticas_nao_padronizadas: 1, creditos_ou_identificadores: 2, imagens_publicadas: 0 },
  partes: [
    { id: 'frase-bilingue', natureza: 'frase curta com futuro planejado por going to', decisao: 'consolidar procedência em unidade existente', nivel_cefr: 'B1', habilidade_principal: 'Gramática', destino_curricular_especifico: 'B1-L3-0055-02', justificativa: 'O futuro planejado com going to já é coberto pela unidade existente; a ocorrência acrescenta apenas procedência e não justifica nova unidade.', elegivel_atividade: false, elegivel_jornada: false },
    { id: 'aproximacao-fonetica', natureza: 'grafia aproximativa de pronúncia para falante de português, sem IPA', decisao: 'descartar', destino_curricular_especifico: null, justificativa: 'Não é transcrição fonética padronizada e neutraliza contrastes importantes; não será ensinada como pronúncia confiável.' },
    { id: 'creditos', natureza: 'nome, perfil social e marca de republicação', decisao: 'descartar', destino_curricular_especifico: null, justificativa: 'Créditos e identificadores pessoais/editoriais não constituem conteúdo curricular e não serão republicados.' }
  ],
  totais: { partes: 3, consolidadas: 1, descartadas: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Somente classificação, contagens, hashes e destino; a frase, a imagem, a aproximação fonética e os créditos não foram republicados.'
};
fs.writeFileSync(path.join(raiz, 'dados/mapeamento-fontes-extensas-031.json'), `${JSON.stringify({ lote: '031', comparacoes_integrais: [], fontes: [fonte] }, null, 2)}\n`);
fs.writeFileSync(path.join(raiz, 'dados/lote-031-triagem.json'), `${JSON.stringify({ lote: '031', intervalo: [1205, 1205], sequenciais: [{ numero: 1205, nome, tamanho_bytes: fonte.tamanho_bytes, hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: fonte.tipo, partes: 3, sem_destino_util: 0 }], validacao_intermediaria: { pendente: true, encerrada_em: 1205 } }, null, 2)}\n`);
console.log('1205 classificada integralmente: 3/3 partes decididas.');
