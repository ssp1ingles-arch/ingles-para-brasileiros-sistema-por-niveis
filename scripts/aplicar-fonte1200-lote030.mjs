import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const nome = '1200_livro03_3.md';
const texto = fs.readFileSync(path.join(fonteDir, nome), 'utf8');
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const definicoes = [
  ['Negativas — to be e outros verbos', 'A1-GRAM-0011', 'Gramática', 'A1'],
  ['Perguntas simples e respostas curtas', 'A2-L15-0829-01', 'Conversação', 'A2'],
  ['Perguntas abertas e palavras interrogativas', 'A2-L20-1163-01', 'Conversação', 'A2'],
  ['There is e there are', 'A1-L7-0264-01', 'Gramática', 'A1'],
  ['And, but e adjetivos', 'A1-GRAM-0011', 'Gramática', 'A1'],
  ['Because para expressar motivo', 'A2-L5-0169-01', 'Gramática', 'A2'],
  ['Have e has para posse', 'A1-L3-0066-01', 'Verbos', 'A1'],
  ['Advérbios e expressões de frequência', 'A2-L14-0752-01', 'Gramática', 'A2'],
  ['Love, like e hate', 'A2-L8-0336-02', 'Verbos', 'A2'],
  ['Estrutura favorite', 'A2-L14-0754-01', 'Vocabulário', 'A2'],
  ['Can e cannot para habilidade', 'A2-L8-0358-02', 'Gramática', 'A2'],
  ['Mapa temático das unidades 05–48', 'A2-L11-1336-01', 'Leitura', 'A2']
];
const titulos = [...texto.matchAll(/^## (.+)$/gm)].map(item => item[1].trim());
if (titulos.length !== 12) throw new Error(`1200: esperados 12 blocos, encontrados ${titulos.length}.`);
const secoes = definicoes.map(([titulo, destino, habilidade, nivel], indice) => ({
  numero: indice + 1,
  titulo,
  titulo_na_extracao: titulos[indice],
  natureza: indice === 11 ? 'mapa editorial de cobertura temática' : 'síntese temática com frases completas e traduções',
  nivel_cefr: nivel,
  habilidade_principal: habilidade,
  destino_curricular_especifico: destino,
  fonte_canonica_relacionada: 1193,
  decisao: indice === 11 ? 'referenciar cobertura em destino existente' : 'consolidar procedência em destino existente',
  justificativa: 'Conteúdo já coberto por unidades existentes e pela classificação integral da fonte canônica 1193; frases não republicadas.',
  elegivel_atividade: false,
  elegivel_jornada: false
}));
const registro = {
  numero: 1200,
  nome_completo: nome,
  tipo: 'extração HTML temática do Practice Book Level 1 Beginner',
  tamanho_bytes: Buffer.byteLength(texto),
  hash_bruto: sha(texto),
  hash_normalizado: sha(normalizar(texto)),
  leitura_integral: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [], observacao: 'Extração HTML temática sem marcadores de página; os 12 blocos foram decididos.' },
  integridade: { utf8_valido: true, caracteres_substituicao: (texto.match(/�/gu) || []).length, marcadores_cid: (texto.match(/\(cid:\d+\)/gu) || []).length, ocr_insuficiente: false, corrupcao: false },
  estrutura: { blocos_didaticos: 12, unidades_do_livro_referidas: 48, exercicios_brutos: 0, respostas_separadas: 0, indices: 0, blocos_editoriais: 4 },
  secoes,
  descartes: [
    { parte: 'frontmatter, navegação, apresentação e métricas', decisao: 'descartar', justificativa: 'Metadados e interface do sistema anterior.' },
    { parte: 'estado de busca vazia', decisao: 'descartar', justificativa: 'Mensagem de interface sem conteúdo linguístico.' }
  ],
  totais: { consolidadas: 11, referenciadas: 1, descartes: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Somente metadados, decisões e destinos; nenhuma frase, tradução, tabela, página, exercício ou resposta foi republicada.'
};
fs.writeFileSync(path.join(raiz, 'dados/mapeamento-fontes-extensas-030.json'), `${JSON.stringify({ lote: '030', comparacoes_integrais: [], fontes: [registro] }, null, 2)}\n`);
fs.writeFileSync(path.join(raiz, 'dados/lote-030-triagem.json'), `${JSON.stringify({ lote: '030', intervalo: [1200, 1200], sequenciais: [{ numero: 1200, nome, tamanho_bytes: registro.tamanho_bytes, hash_bruto: registro.hash_bruto, hash_normalizado: registro.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: registro.tipo, secoes: 12, sem_destino_util: 0 }], validacao_intermediaria: { pendente: true, encerrada_em: 1200 } }, null, 2)}\n`);
console.log('1200 classificada integralmente: 12/12 blocos decididos.');
