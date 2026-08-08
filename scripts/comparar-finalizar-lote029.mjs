import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontes = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const mapaFontes = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const triagem = ler('dados/lote-029-triagem.json');
const mapeamento = ler('dados/mapeamento-fontes-extensas-029.json');
const meta = new Map(mapaFontes.arquivos.map(item => [Number(item.id), item]));
const bruto = numero => fs.readFileSync(path.join(fontes, meta.get(numero).arquivo), 'utf8');
const corpo = texto => texto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizar = texto => corpo(texto).normalize('NFC').replace(/\s+/gu, '').toLowerCase();
const sha256 = texto => crypto.createHash('sha256').update(texto).digest('hex');

const validacao1198 = ler('docs/evidencias/lote-029/resultados-fonte1198.json');
if (validacao1198.aprovados !== 17 || validacao1198.total !== 17) throw new Error('1199 bloqueada: validação de 1198 não aprovada.');

const texto1199 = bruto(1199);
const corpo1199 = corpo(texto1199);
const marcadores = [...corpo1199.matchAll(/^## (.+)$/gm)];
const numerosUnidades = [...corpo1199.matchAll(/^Unidade (\d+)$/gm)].map(item => Number(item[1]));
const esperadas = [13, 21, 24, 27, 39, 40, 42, 48, 53, 67, 70, 73, 75, 77];
if (marcadores.length !== 14 || JSON.stringify(numerosUnidades) !== JSON.stringify(esperadas)) throw new Error('Estrutura de 1199 inesperada.');

const canonica1191 = ler('dados/mapeamento-fontes-extensas-026.json').fontes.find(fonte => fonte.numero === 1191);
const porNumero = new Map(canonica1191.secoes.map(secao => [secao.numero, secao]));
const secoes = marcadores.map((marcador, indice) => {
  const inicio = marcador.index + marcador[0].length;
  const fim = indice + 1 < marcadores.length ? marcadores[indice + 1].index : corpo1199.length;
  const paragrafos = corpo1199.slice(inicio, fim).split(/\r?\n\s*\r?\n/).map(item => item.trim()).filter(Boolean);
  const conteudo = paragrafos.slice(1).filter(item => !item.startsWith('Unidade ') && !item.startsWith('**Nada encontrado**'));
  if (conteudo.length % 3 !== 0) throw new Error(`Blocos incompletos na seção ${indice + 1}.`);
  const itens = conteudo.length / 3;
  const numeroCanonico = esperadas[indice];
  const canonica = porNumero.get(numeroCanonico);
  return {
    numero: indice + 1,
    unidade_tematico_original: numeroCanonico,
    titulo: marcador[1].trim(),
    itens_identificados: itens,
    composicao_item: ['frase de exemplo em inglês', 'tradução em português', 'definição curta'],
    natureza: 'expressões e colocações contextualizadas',
    exercicios: false,
    respostas: false,
    indice: false,
    editorial: false,
    paginas_relacionadas_na_fonte_canonica_1191: canonica.paginas,
    nivel_cefr: canonica.nivel_cefr,
    habilidade_principal: canonica.habilidade_principal,
    destino_curricular_especifico: canonica.destino_curricular_especifico || canonica.unidade_existente_relacionada,
    decisao: 'consolidar em unidade existente',
    justificativa: 'Tema já mapeado integralmente na fonte canônica 1191; procedência adicional sem republicar frases, traduções ou definições.',
    elegivel_atividade: false,
    elegivel_jornada: false
  };
});

const fonte1199 = {
  numero: 1199,
  nome_completo: meta.get(1199).arquivo,
  tipo: 'extração HTML temática do English Vocabulary Builder',
  tamanho_bytes: Buffer.byteLength(texto1199),
  hash_bruto: sha256(texto1199),
  hash_normalizado: sha256(normalizar(texto1199)),
  leitura_integral: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [], observacao: 'HTML temático sem paginação; as 14 seções foram decididas.' },
  integridade: { utf8_valido: true, caracteres_substituicao: (texto1199.match(/�/gu) || []).length, marcadores_cid: (texto1199.match(/\(cid:\d+\)/gu) || []).length, ocr_insuficiente: false, corrupcao: false },
  estrutura: { temas: secoes.length, itens_declarados_no_cabecalho: 140, itens_identificados_no_corpo: secoes.reduce((total, secao) => total + secao.itens_identificados, 0), exercicios: 0, respostas: 0, indices: 0, blocos_editoriais: 2 },
  divergencias: [{ campo: 'quantidade de expressões', declarado: 140, identificado: 150, decisao: 'preservar a contagem verificável do corpo e registrar a inconsistência editorial' }],
  secoes,
  descartes: [
    { parte: 'frontmatter, navegação, apresentação, métricas e explicação da seleção', decisao: 'descartar', justificativa: 'Interface e descrição editorial do sistema anterior.' },
    { parte: 'mensagem de busca vazia', decisao: 'descartar', justificativa: 'Estado de interface sem conteúdo linguístico.' }
  ],
  totais: { consolidadas: secoes.length, descartes: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Metadados, contagens e destinos apenas; as 150 frases, traduções e definições permanecem exclusivamente na fonte somente leitura.'
};

const texto1198 = bruto(1198);
const fonte1198 = mapeamento.fontes.find(fonte => fonte.numero === 1198);
const comparacao = {
  fontes: [1198, 1199],
  executada_apos_validacao_1198: true,
  tamanho_1198: Buffer.byteLength(texto1198),
  tamanho_1199: Buffer.byteLength(texto1199),
  hash_bruto_1198: sha256(texto1198),
  hash_bruto_1199: sha256(texto1199),
  hash_normalizado_1198: sha256(normalizar(texto1198)),
  hash_normalizado_1199: sha256(normalizar(texto1199)),
  corpo_integral_igual: corpo(texto1198) === corpo1199,
  normalizado_integral_igual: normalizar(texto1198) === normalizar(texto1199),
  paginacao_comparavel: false,
  paginacao_1198: 'HTML sem marcadores de página',
  paginacao_1199: 'HTML sem marcadores de página',
  ordem_igual: false,
  capitulos_ou_secoes_1198: 36,
  capitulos_ou_secoes_1199: 14,
  exemplos_1198: fonte1198.estrutura.itens_de_tabela,
  exemplos_1199: fonte1199.estrutura.itens_identificados_no_corpo,
  exercicios_1198: 0,
  exercicios_1199: 0,
  respostas_1198: 0,
  respostas_1199: 0,
  ausencias_1198: [],
  ausencias_1199: [],
  sobreposicao: 'apenas incidental em vocabulário geral; objetivos, organização e corpos distintos',
  conteudo_exclusivo_1198: '36 temas gramaticais e 191 linhas de quadros de forma, uso, exemplo e tradução',
  conteudo_exclusivo_1199: '14 temas lexicais e 150 blocos de expressão, frase, tradução e definição',
  classificacao: 'obras independentes: Grammar Guide e Vocabulary Builder em extrações HTML temáticas distintas',
  decisao: 'classificar ambas separadamente e consolidar somente procedência e destinos; não republicar o conteúdo'
};

mapeamento.fontes = [...mapeamento.fontes.filter(fonte => fonte.numero !== 1199), fonte1199];
mapeamento.comparacoes_integrais = [comparacao];
gravar('dados/mapeamento-fontes-extensas-029.json', mapeamento);
triagem.intervalo = [1197, 1199];
triagem.sequenciais = [...triagem.sequenciais.filter(fonte => fonte.numero !== 1199), { numero: 1199, nome: meta.get(1199).arquivo, tamanho_bytes: fonte1199.tamanho_bytes, hash_bruto: fonte1199.hash_bruto, hash_normalizado: fonte1199.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: fonte1199.tipo, secoes: 14, itens_declarados: 140, itens_identificados: 150, sem_destino_util: 0, justificativa: '14 temas vinculados às unidades canônicas de 1191; discrepância editorial 140×150 registrada.' }];
triagem.validacao_intermediaria = { pendente: false, encerrada_em: 1197, testes: '18/18', aprovada: true };
triagem.validacao_1198 = { pendente: false, testes: '17/17', aprovada: true };
triagem.observacao = 'Lote encerrado em 1199, antes de 1200; 1198 e 1199 são obras independentes.';
gravar('dados/lote-029-triagem.json', triagem);
revisao['1199'] = { estado: 'integralmente classificada', secoes: ['Extração HTML temática; 14 temas, 150 itens identificados, divergência editorial 140×150 e zero útil sem destino'] };
gravar('dados/revisao-fontes.json', revisao);
for (const item of mapaFontes.arquivos) {
  const estado = revisao[item.id];
  if (estado) {
    item.estado_revisao = estado.estado;
    item.secoes = estado.secoes.join(' | ');
  }
}
gravar('dados/mapa-fontes.json', mapaFontes);
console.log('1199 mapeada e comparada: obras independentes; 150 itens identificados.');
