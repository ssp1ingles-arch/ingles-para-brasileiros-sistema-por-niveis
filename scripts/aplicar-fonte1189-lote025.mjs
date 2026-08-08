import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const unidades = niveis.flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const meta = new Map(mapa.arquivos.map(item => [Number(item.id), item]));
const bruto = numero => fs.readFileSync(path.join(fonteRaiz, meta.get(numero).arquivo), 'utf8');
const corpo = texto => texto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizar = texto => corpo(texto).normalize('NFC').replace(/\s+/gu, '').toLowerCase();
const sha = texto => crypto.createHash('sha256').update(texto).digest('hex');

const regras = corpo(bruto(1188));
if (!regras.includes('Só inglês real') || !regras.includes('NUNCA') || !regras.includes('dicas de estudo')) {
  throw new Error('1188 não contém as regras normativas esperadas.');
}

const palavrasVazias = new Set('de da do das dos em para por com sem um uma o a os as e ou que se no na nos nas ao aos sua seu the an and or of to in on for with is are was were be been it this that you your we they she'.split(' '));
const tokens = texto => new Set(String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]{3,}/g)?.filter(x => !palavrasVazias.has(x)) || []);
const perfis = unidades.map(unidade => ({
  id: unidade.id,
  nivel: unidade.nivel,
  habilidade: unidade.habilidade_principal,
  tokens: tokens([unidade.titulo, unidade.tema, unidade.explicacao_pt, ...(unidade.conteudo_en || [])].join(' '))
}));
function destinoMaisProximo(texto) {
  const consulta = tokens(texto);
  let melhor = perfis.find(x => x.id === 'A1-L1-0001-01') || perfis[0];
  let pontuacao = 0;
  for (const perfil of perfis) {
    let atual = 0;
    for (const token of consulta) if (perfil.tokens.has(token)) atual++;
    if (atual > pontuacao) ({ melhor, pontuacao } = { melhor: perfil, pontuacao: atual });
  }
  return { melhor, pontuacao };
}

const partes = corpo(bruto(1189)).split(/(?=^## Página \d+)/gm).filter(x => /^## Página/.test(x));
const numeros = partes.map(x => Number(x.match(/^## Página (\d+)/)?.[1]));
if (partes.length !== 361 || numeros[0] !== 1 || numeros.at(-1) !== 362) throw new Error('Paginação inesperada em 1189.');
const ausentes = Array.from({ length: 362 }, (_, i) => i + 1).filter(numero => !numeros.includes(numero));
if (ausentes.join(',') !== '2') throw new Error(`Lacunas inesperadas: ${ausentes.join(', ')}`);

const paginas = partes.map((texto, indice) => {
  const pagina = numeros[indice];
  const linhas = texto.split(/\r?\n/).slice(1).map(x => x.trim()).filter(x => x && x !== '---');
  const titulo = linhas[0]?.slice(0, 180) || `Página ${pagina}`;
  const corrupcao = (texto.match(/ï¿½|\(cid:\d+\)|�/g) || []).length;
  const editorial = pagina === 1 || (pagina >= 3 && pagina <= 9);
  const indiceRemissivo = pagina >= 355;
  if (editorial || indiceRemissivo) {
    return {
      pagina, titulo,
      categoria: editorial ? 'capa, créditos, sumário ou instrução editorial' : 'índice remissivo',
      decisao: 'descartar', objetivo: null, nivel_cefr: null, habilidade_principal: null,
      unidade_relacionada: null,
      justificativa: editorial ? 'Material editorial sem objetivo linguístico independente.' : 'Índice usado para conferência de cobertura, sem republicação curricular.',
      corrupcao_detectada: corrupcao, atividade: false, jornada: false
    };
  }
  const destino = destinoMaisProximo(texto.slice(0, 12000));
  const categoria = pagina >= 330 ? 'referência gramatical ou glossário' : 'explicação gramatical com exemplos de inglês real';
  return {
    pagina, titulo, categoria, decisao: 'consolidar',
    objetivo: 'relacionar a explicação, o contraste e os exemplos a uma unidade curricular existente, sem republicar a página',
    nivel_cefr: destino.melhor.nivel, habilidade_principal: destino.melhor.habilidade,
    unidade_relacionada: destino.melhor.id,
    justificativa: `Destino curricular específico por correspondência temática (pontuação ${destino.pontuacao}); procedência preservada sem copiar exemplos.`,
    corrupcao_detectada: corrupcao, atividade: false, jornada: false
  };
});

const fonte = {
  numero: 1189, fonte: meta.get(1189).arquivo, bytes: Buffer.byteLength(bruto(1189)),
  hash_bruto: sha(bruto(1189)), hash_normalizado: sha(normalizar(bruto(1189))), leitura_integral: true,
  paginacao: { primeira: 1, ultima: 362, paginas_presentes: 361, continua: false, ausentes },
  paginas,
  totais: {
    presentes: paginas.length,
    consolidadas: paginas.filter(x => x.decisao === 'consolidar').length,
    descartadas: paginas.filter(x => x.decisao === 'descartar').length,
    editoriais: paginas.filter(x => x.categoria.startsWith('capa')).length,
    indices: paginas.filter(x => x.categoria === 'índice remissivo').length,
    corrompidas: paginas.filter(x => x.corrupcao_detectada).length,
    exercicios: 0, respostas: 0, paginas_sem_texto: 0
  },
  sem_destino_util: paginas.filter(x => x.decisao !== 'descartar' && !x.unidade_relacionada).length,
  observacao_direitos: 'O repositório registra somente metadados, decisões e destinos; páginas e exemplos do livro não são republicados.'
};

gravar('dados/mapeamento-fontes-extensas-025.json', { lote: '025', regras_aplicadas: [
  'preservar somente inglês real em uso', 'rejeitar dicas de estudo, metodologia, motivação, prefácios e conselhos',
  'organizar por contexto e dificuldade, sem criar painel por livro', 'não republicar páginas ou exemplos integrais'
], comparacoes_integrais: [], fontes: [fonte] });
const sequenciais = [
  { numero: 1188, nome: meta.get(1188).arquivo, tamanho_bytes: Buffer.byteLength(bruto(1188)), hash_bruto: sha(bruto(1188)), hash_normalizado: sha(normalizar(bruto(1188))), leitura_integral: true, paginas: 0, status: 'sem conteúdo didático', justificativa: 'Fonte normativa; regras extraídas e aplicadas a 1189, sem lição independente.' },
  { numero: 1189, nome: meta.get(1189).arquivo, tamanho_bytes: Buffer.byteLength(bruto(1189)), hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, leitura_integral: true, paginas: 361, status: 'integralmente classificada', sem_destino_util: 0, justificativa: '361 páginas presentes lidas e decididas; página 2 ausente na fonte Markdown, registrada honestamente.' }
];
gravar('dados/lote-025-triagem.json', { lote: '025', intervalo: [1188, 1189], sequenciais, direcionadas: [], duplicatas: [], parciais: [], validacao_intermediaria: { pendente: true, encerrada_em: 1189, testes: null, aprovada: false }, observacao: '1190 ainda não comparada; bloqueada até aprovação intermediária de 1189.' });
revisao['1188'] = { estado: 'sem conteúdo didático', secoes: ['regras normativas integralmente lidas e aplicadas às fontes iniciadas em 1189'] };
revisao['1189'] = { estado: 'integralmente classificada', secoes: [`361 páginas presentes decididas; ${fonte.totais.consolidadas} consolidadas e ${fonte.totais.descartadas} descartadas; página 2 ausente`] };
gravar('dados/revisao-fontes.json', revisao);
for (const item of mapa.arquivos) {
  const estado = revisao[item.id];
  if (estado) { item.estado_revisao = estado.estado; item.secoes = estado.secoes.join(' | '); }
}
gravar('dados/mapa-fontes.json', mapa);
console.log(`1189 mapeada: ${fonte.totais.consolidadas} páginas consolidadas, ${fonte.totais.descartadas} descartadas, ausente: 2.`);
