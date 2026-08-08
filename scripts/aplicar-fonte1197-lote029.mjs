import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontes = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const lerJson = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravarJson = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const mapa = lerJson('dados/mapa-fontes.json');
const revisao = lerJson('dados/revisao-fontes.json');
const meta = mapa.arquivos.find(item => Number(item.id) === 1197);
const bruto = fs.readFileSync(path.join(fontes, meta.arquivo), 'utf8');
const corpo = bruto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizado = corpo.normalize('NFC').replace(/\s+/gu, '').toLowerCase();
const sha256 = valor => crypto.createHash('sha256').update(valor).digest('hex');

if (!corpo.includes('English Grammar Guide') || !corpo.includes('Practice Book · Nível 2')) {
  throw new Error('Estrutura editorial de 1197 não reconhecida.');
}

const partes = [
  { id: 'frontmatter', natureza: 'metadados técnicos de migração', decisao: 'descartar', justificativa: 'Procedência técnica, sem conteúdo linguístico independente.' },
  { id: 'navegacao', natureza: 'link de retorno e cabeçalho do sistema', decisao: 'descartar', justificativa: 'Navegação do sistema anterior, sem destino curricular.' },
  { id: 'apresentacao', natureza: 'apresentação editorial da coleção', decisao: 'descartar', justificativa: 'Descrição promocional/editorial; não constitui explicação didática autônoma.' },
  { id: 'metricas', natureza: 'contadores de livros, disponibilidade e exemplos', decisao: 'descartar', justificativa: 'Métricas históricas do painel anterior, não conteúdo curricular.' },
  { id: 'livro-01', natureza: 'cartão editorial — English Grammar Guide', decisao: 'registrar referência editorial', fonte_relacionada: 1189, destino_curricular_especifico: null, justificativa: 'O cartão apenas referencia a obra; não prova processamento, duplicidade ou novo conteúdo.' },
  { id: 'livro-02', natureza: 'cartão editorial — English Vocabulary Builder', decisao: 'registrar referência editorial', fonte_relacionada: 1191, destino_curricular_especifico: null, justificativa: 'O cartão apenas referencia a obra; não prova processamento, duplicidade ou novo conteúdo.' },
  { id: 'livro-03', natureza: 'cartão editorial — Practice Book Level 1', decisao: 'registrar referência editorial', fonte_relacionada: 1193, destino_curricular_especifico: null, justificativa: 'O cartão apenas referencia a obra; não prova processamento, duplicidade ou novo conteúdo.' },
  { id: 'livro-04', natureza: 'cartão editorial — Practice Book Level 2', decisao: 'registrar referência editorial', fonte_relacionada: 1195, destino_curricular_especifico: null, justificativa: 'O cartão apenas referencia a obra; não prova processamento, duplicidade ou novo conteúdo.' },
  { id: 'nota-final', natureza: 'declaração editorial sobre implementação e regras', decisao: 'descartar', justificativa: 'Resumo administrativo do sistema anterior; as obras são avaliadas diretamente em suas próprias fontes.' }
];

const fonte = {
  numero: 1197,
  nome_completo: meta.arquivo,
  tipo: 'índice, inventário e hub editorial de obras',
  tamanho_bytes: Buffer.byteLength(bruto),
  hash_bruto: sha256(bruto),
  hash_normalizado: sha256(normalizado),
  leitura_integral: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [], ocr_insuficiente: [], corrompidas: [] },
  estrutura: { frontmatter: 1, titulos_de_obras: 4, links_de_livros: 4, blocos_editoriais: 4 },
  partes,
  totais: { partes: partes.length, referencias_editoriais: 4, descartadas: 5, conteudo_didatico_util: 0, uteis_sem_destino: 0 },
  decisao_global: 'sem conteúdo didático independente',
  observacao_publica: 'Somente metadados estruturais e decisões; nenhum texto extenso, exemplo, exercício ou conteúdo dos livros foi republicado.'
};

gravarJson('dados/mapeamento-fontes-extensas-029.json', { lote: '029', comparacoes_integrais: [], fontes: [fonte] });
gravarJson('dados/lote-029-triagem.json', {
  lote: '029',
  intervalo: [1197, 1197],
  sequenciais: [{ numero: 1197, nome: meta.arquivo, tamanho_bytes: fonte.tamanho_bytes, hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, leitura_integral: true, status: 'sem conteúdo didático', tipo: fonte.tipo, sem_destino_util: 0, justificativa: 'Hub editorial com quatro referências de obras; nenhuma lição autônoma.' }],
  duplicatas: [],
  parciais: [],
  validacao_intermediaria: { pendente: true, encerrada_em: 1197, testes: null, aprovada: false },
  observacao: '1198 permanece bloqueada até a validação intermediária de 1197.'
});

revisao['1197'] = { estado: 'sem conteúdo didático', secoes: ['Índice/hub editorial; 9 partes decididas, quatro referências de obras e zero conteúdo didático independente'] };
gravarJson('dados/revisao-fontes.json', revisao);
for (const item of mapa.arquivos) {
  const estado = revisao[item.id];
  if (estado) {
    item.estado_revisao = estado.estado;
    item.secoes = estado.secoes.join(' | ');
  }
}
gravarJson('dados/mapa-fontes.json', mapa);
console.log('1197 classificada: índice editorial, 9/9 partes decididas.');
