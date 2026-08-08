import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontesRaiz = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const unidades = niveis.flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const meta = new Map(mapa.arquivos.map(item => [Number(item.id), item]));
const bruto = numero => fs.readFileSync(path.join(fontesRaiz, meta.get(numero).arquivo), 'utf8');
const corpo = texto => texto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizar = texto => corpo(texto).normalize('NFC').replace(/\s+/gu, '').toLowerCase();
const sha = texto => crypto.createHash('sha256').update(texto).digest('hex');

const palavrasVazias = new Set('de da do das dos em para por com sem um uma o a os as e ou que se no na nos nas ao aos the an and or of to in on for with is are was were be been it this that you your we they she'.split(' '));
const tokens = texto => new Set(String(texto).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]{3,}/g)?.filter(x => !palavrasVazias.has(x)) || []);
const perfis = unidades.map(unidade => ({ id: unidade.id, nivel: unidade.nivel, habilidade: unidade.habilidade_principal, tokens: tokens([unidade.titulo, unidade.tema, unidade.explicacao_pt, ...(unidade.conteudo_en || [])].join(' ')) }));
function destino(texto) {
  const consulta = tokens(texto); let melhor = perfis[0], pontos = -1;
  for (const perfil of perfis) { let atual = 0; for (const token of consulta) if (perfil.tokens.has(token)) atual++; if (atual > pontos) { melhor = perfil; pontos = atual; } }
  return { melhor, pontos };
}

const texto1191 = corpo(bruto(1191));
const partes = texto1191.split(/(?=^## Página \d+)/gm).filter(x => /^## Página/.test(x));
const numeros = partes.map(x => Number(x.match(/^## Página (\d+)/)?.[1]));
const frequencia = new Map(); numeros.forEach(n => frequencia.set(n, (frequencia.get(n) || 0) + 1));
const ausentes = Array.from({ length: 362 }, (_, i) => i + 1).filter(n => !frequencia.has(n));
const repetidas = [...frequencia].filter(([, n]) => n > 1).map(([pagina, ocorrencias]) => ({ pagina, ocorrencias }));
if (partes.length !== 361 || numeros[0] !== 1 || numeros.at(-1) !== 362 || ausentes.join(',') !== '2' || repetidas.length) throw new Error('Estrutura inesperada em 1191.');

const porPagina = new Map(numeros.map((numero, i) => [numero, partes[i]]));
const secoes = [];
for (let unidade = 1; unidade <= 78; unidade++) {
  const inicio = 12 + (unidade - 1) * 4, fim = inicio + 3;
  const linhas = porPagina.get(inicio).split(/\r?\n/).slice(1).map(x => x.trim()).filter(x => x && x !== '---');
  const indiceTitulo = linhas.findIndex(x => new RegExp(`^0?${unidade}$`).test(x));
  const titulo = (linhas[indiceTitulo + 1] || linhas.find(x => /[A-Za-z]/.test(x)) || `Unidade ${unidade}`).slice(0, 140);
  const trechoAnalise = [porPagina.get(inicio), porPagina.get(inicio + 1)].join('\n').slice(0, 18000);
  const vinculo = destino(`${titulo}\n${trechoAnalise}`);
  secoes.push({
    numero: unidade, titulo, paginas: [inicio, fim], paginas_ensino: [inicio, inicio + 1], paginas_exercicios: [inicio + 2, fim],
    tema: titulo, objetivo_pedagogico: 'ampliar vocabulário contextual, colocações e expressões com distinção de uso',
    nivel_cefr: vinculo.melhor.nivel, habilidade_principal: 'Vocabulário', habilidades_secundarias: ['Leitura', vinculo.melhor.habilidade].filter((x, i, a) => a.indexOf(x) === i && x !== 'Vocabulário'),
    unidade_existente_relacionada: vinculo.melhor.id, destino_especifico: vinculo.melhor.id,
    decisao: 'consolidar em unidade existente', justificativa: `Correspondência temática com destino existente (pontuação ${vinculo.pontos}); nenhuma lista ou exercício republicado.`,
    procedencia: { fonte: meta.get(1191).arquivo, paginas: `${inicio}-${fim}` }, registro: 'neutro, com variantes UK/US quando indicadas',
    restricoes: ['sem áudio no repositório', 'sem imagens', 'sem listas extensas', 'sem reprodução dos exercícios'], elegivel_atividade: false, elegivel_jornada: false
  });
}

const paginas = partes.map((texto, i) => {
  const pagina = numeros[i], corrupcao = (texto.match(/ï¿½|\(cid:\d+\)|�/g) || []).length;
  if (pagina === 1 || (pagina >= 3 && pagina <= 11)) return { pagina, secao: null, categoria: pagina <= 9 ? 'capa, créditos ou sumário' : 'instruções editoriais', tema: null, objetivo_pedagogico: null, nivel_cefr: null, habilidade_principal: null, habilidades_secundarias: [], unidade_existente_relacionada: null, decisao: 'descartar', destino_especifico: null, justificativa: 'Material editorial ou instrução de uso sem objetivo linguístico independente.', procedencia: `${meta.get(1191).arquivo}#pagina-${pagina}`, registro: null, restricoes: ['não publicar'], elegivel_atividade: false, elegivel_jornada: false, sem_texto: false, ocr_insuficiente: false, corrupcao_detectada: corrupcao };
  if (pagina >= 324 && pagina <= 341) { const unidadeInicial = Math.floor((pagina - 324) * 78 / 18) + 1, secao = secoes[Math.min(unidadeInicial - 1, 77)]; return { pagina, secao: `Respostas — referência a partir da unidade ${unidadeInicial}`, categoria: 'respostas', tema: 'verificação dos exercícios', objetivo_pedagogico: 'preservar rastreabilidade da correção sem republicar o gabarito', nivel_cefr: secao.nivel_cefr, habilidade_principal: 'Vocabulário', habilidades_secundarias: ['Leitura'], unidade_existente_relacionada: secao.unidade_existente_relacionada, decisao: 'referenciar sem publicar', destino_especifico: secao.destino_especifico, justificativa: 'Página de respostas registrada para cobertura e validação; conteúdo não copiado.', procedencia: `${meta.get(1191).arquivo}#pagina-${pagina}`, registro: 'neutro', restricoes: ['gabarito não republicado'], elegivel_atividade: false, elegivel_jornada: false, sem_texto: false, ocr_insuficiente: false, corrupcao_detectada: corrupcao }; }
  if (pagina >= 342) return { pagina, secao: 'Word list', categoria: 'índice alfabético', tema: null, objetivo_pedagogico: null, nivel_cefr: null, habilidade_principal: null, habilidades_secundarias: [], unidade_existente_relacionada: null, decisao: 'descartar', destino_especifico: null, justificativa: 'Lista alfabética usada somente para conferir cobertura; não constitui unidade nem é republicada.', procedencia: `${meta.get(1191).arquivo}#pagina-${pagina}`, registro: null, restricoes: ['lista extensa não publicada'], elegivel_atividade: false, elegivel_jornada: false, sem_texto: false, ocr_insuficiente: false, corrupcao_detectada: corrupcao };
  const numeroUnidade = Math.floor((pagina - 12) / 4) + 1, secao = secoes[numeroUnidade - 1], exercicio = (pagina - 12) % 4 >= 2;
  return { pagina, secao: `Unidade ${String(numeroUnidade).padStart(2, '0')} — ${secao.titulo}`, categoria: exercicio ? 'exercícios' : 'vocabulário contextual, colocações e expressões', tema: secao.tema, objetivo_pedagogico: secao.objetivo_pedagogico, nivel_cefr: secao.nivel_cefr, habilidade_principal: secao.habilidade_principal, habilidades_secundarias: secao.habilidades_secundarias, unidade_existente_relacionada: secao.unidade_existente_relacionada, decisao: exercicio ? 'referenciar sem publicar' : 'consolidar em unidade existente', destino_especifico: secao.destino_especifico, justificativa: exercicio ? 'Exercício registrado e relacionado ao destino da seção; enunciado e respostas não copiados.' : 'Conteúdo lexical relacionado ao destino específico; listas e exemplos extensos não copiados.', procedencia: `${meta.get(1191).arquivo}#pagina-${pagina}`, registro: secao.registro, restricoes: secao.restricoes, elegivel_atividade: false, elegivel_jornada: false, sem_texto: false, ocr_insuficiente: false, corrupcao_detectada: corrupcao };
});

const fonte = { numero: 1191, nome_completo: meta.get(1191).arquivo, tamanho_bytes: Buffer.byteLength(bruto(1191)), hash_bruto: sha(bruto(1191)), hash_normalizado: sha(normalizar(bruto(1191))), leitura_integral: true, paginacao: { primeira: 1, ultima: 362, presentes: paginas.length, ausentes, repetidas, sem_texto: [], ocr_insuficiente: [], corrompidas: [] }, estrutura: { unidades_tematicas: secoes.length, paginas_editoriais: 10, paginas_ensino: 156, paginas_exercicios: 156, paginas_respostas: 18, paginas_indice: 21 }, secoes, paginas, totais: { consolidadas: paginas.filter(x => x.decisao === 'consolidar em unidade existente').length, referenciadas: paginas.filter(x => x.decisao === 'referenciar sem publicar').length, descartadas: paginas.filter(x => x.decisao === 'descartar').length, uteis_sem_destino: paginas.filter(x => x.decisao !== 'descartar' && !x.destino_especifico).length }, observacao_publica: 'Somente metadados, decisões, contagens e destinos; nenhuma página, lista, imagem, resposta ou coleção de exemplos foi publicada.' };
gravar('dados/mapeamento-fontes-extensas-026.json', { lote: '026', comparacoes_integrais: [], fontes: [fonte] });
gravar('dados/lote-026-triagem.json', { lote: '026', intervalo: [1191, 1191], sequenciais: [{ numero: 1191, nome: fonte.nome_completo, tamanho_bytes: fonte.tamanho_bytes, hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, leitura_integral: true, paginas: 361, status: 'integralmente classificada', sem_destino_util: 0, justificativa: '361 páginas presentes e 78 seções temáticas integralmente decididas; página 2 ausente registrada.' }], direcionadas: [], duplicatas: [], parciais: [], validacao_intermediaria: { pendente: true, encerrada_em: 1191, testes: null, aprovada: false }, observacao: '1192 permanece bloqueada até a validação intermediária de 1191.' });
revisao['1191'] = { estado: 'integralmente classificada', secoes: [`361 páginas presentes; 78 unidades temáticas; ${fonte.totais.consolidadas} consolidadas, ${fonte.totais.referenciadas} referenciadas e ${fonte.totais.descartadas} descartadas; página 2 ausente`] };
gravar('dados/revisao-fontes.json', revisao); for (const item of mapa.arquivos) { const estado = revisao[item.id]; if (estado) { item.estado_revisao = estado.estado; item.secoes = estado.secoes.join(' | '); } } gravar('dados/mapa-fontes.json', mapa);
console.log(`1191 mapeada: ${paginas.length} páginas, ${secoes.length} seções, ${fonte.totais.uteis_sem_destino} úteis sem destino.`);
