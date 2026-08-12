import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/^## Página \d+\s*/gmu, '').replace(/[\\*`#←✅❌⚠️💡🔴]/gu, '').replace(/\([^)]*\.html[^)]*\)/gu, '').normalize('NFKD').replace(/[\u0300-\u036f]/gu, '').replace(/[^a-zA-Z0-9']+/gu, ' ').toLowerCase().replace(/\s+/gu, ' ').trim();
const nome17 = '1217_QW_SALA04_PDF4_GONNA_WANNA_GONNA_WANNA_GOTTA_KINDA_REDUCOES_INFORMAIS_2.md';
const nome18 = '1218_entender-nativos.md';
const texto17 = fs.readFileSync(path.join(fonteRaiz, nome17), 'utf8');
const texto18 = fs.readFileSync(path.join(fonteRaiz, nome18), 'utf8');
const anteriores = [
  '1214_QW_SALA04_PDF1_CONNECTED_SPEECH_CONNECTED_SPEECH_FLAP_T_2.md',
  '1215_QW_SALA04_PDF2_CONTENT_FUNCTION_CONTENT_WORDS_FUNCTION_WORDS_STRESS_2.md',
  '1216_QW_SALA04_PDF3_CONTRACTIONS_CONTRACOES_ESSENCIAIS_FALA_NATURAL_2.md',
  nome17
].map(nome => ({nome, texto: fs.readFileSync(path.join(fonteRaiz, nome), 'utf8')}));
const mapa = ler('dados/mapeamento-fontes-extensas-037.json');
const triagem = ler('dados/lote-037-triagem.json');
if (!triagem.validacao_intermediaria?.aprovada || triagem.validacao_intermediaria.encerrada_em !== 1217) throw new Error('Validação intermediária obrigatória de 1217 ausente.');
const fonte18 = {
  numero: 1218,
  nome_completo: nome18,
  tipo: 'extração de página HTML agregadora',
  tamanho_bytes: Buffer.byteLength(texto18),
  hash_bruto: sha(texto18),
  hash_normalizado: sha(normalizar(texto18)),
  leitura_integral: true,
  paginacao: {possui_marcadores: false, blocos_presentes: 4, ausentes: [], repetidos: [], vazios: [], continua: true},
  integridade: {utf8_valido: true, caracteres_substituicao: (texto18.match(/�/gu) || []).length, marcadores_cid: (texto18.match(/\(cid:\d+\)/gu) || []).length, ocr_aplicado: false, ocr_insuficiente: false, corrupcao: false},
  estrutura: {pagina_agregadora: true, blocos_didaticos: 4, navegacao_ou_interface: true, explicacoes: true, exemplos: true, traducoes: true, exercicios_formais: 0, respostas: 0, material_editorial: true, imagens_publicadas: 0},
  cobertura: {fontes_contidas: [1214, 1215, 1216, 1217], blocos_integralmente_contidos: anteriores.map(item => normalizar(texto18).includes(normalizar(item.texto))), conteudo_didatico_exclusivo: false},
  partes: [
    {id: 'connected-speech-flap-t', natureza: 'connected speech, Flap T, linking, elision, assimilation, intrusion e treino', decisao: 'consolidar procedência em unidades existentes', nivel_cefr: 'B1-B2', habilidade_principal: 'Pronúncia', destino_curricular_especifico: 'B2-L10-0461-03', destinos_adicionais: ['B1-L15-0841-01'], justificativa: 'Bloco integral de 1214, já decidido e coberto por destinos existentes.', elegivel_atividade: false, elegivel_jornada: false},
    {id: 'content-function-stress', natureza: 'palavras de conteúdo e função, stress e estratégia de escuta', decisao: 'consolidar procedência em unidades existentes', nivel_cefr: 'B1', habilidade_principal: 'Pronúncia', destino_curricular_especifico: 'B1-L10-0461-01', destinos_adicionais: ['B1-L14-1203-01', 'B1-L15-0841-01'], justificativa: 'Bloco integral de 1215, já decidido e coberto por destinos existentes.', elegivel_atividade: false, elegivel_jornada: false},
    {id: 'contracoes', natureza: 'contrações afirmativas, negativas, temporais e interrogativas', decisao: 'consolidar procedência em unidades existentes', nivel_cefr: 'A1-B2', habilidade_principal: 'Pronúncia', destino_curricular_especifico: 'A1-PRON-0001', destinos_adicionais: ['A1-PRON-0002', 'A2-PRON-0001', 'B1-PRON-0001', 'B2-PRON-0001'], justificativa: 'Bloco integral de 1216, já decidido e coberto por destinos existentes.', elegivel_atividade: false, elegivel_jornada: false},
    {id: 'reducoes-informais', natureza: 'gonna, wanna, gotta, kinda, dunno, lemme, gimme e reduções associadas', decisao: 'consolidar procedência em unidades existentes', nivel_cefr: 'B1', habilidade_principal: 'Pronúncia', destino_curricular_especifico: 'B1-L5-0144-01', destinos_adicionais: ['B1-L5-0144-02'], justificativa: 'Bloco integral de 1217/0144, já coberto por destinos existentes.', elegivel_atividade: false, elegivel_jornada: false},
    {id: 'navegacao-interface-editorial', natureza: 'cabeçalho, navegação, contagem, busca vazia, alertas e resumos repetitivos', decisao: 'descartar', destino_curricular_especifico: null, justificativa: 'Interface e enquadramento editorial não constituem objetivo curricular autônomo.', elegivel_atividade: false, elegivel_jornada: false}
  ],
  totais: {partes: 5, consolidadas: 4, descartadas: 1, uteis_sem_destino: 0},
  observacao_publica: 'Compilação de quatro blocos já classificados; somente metadados, hashes, decisões e procedências sanitizadas serão registrados.'
};
mapa.fontes.push(fonte18);
mapa.comparacoes_integrais = [{
  fontes: [1217, 1218],
  executada_apos_validacao_1217: true,
  tamanhos: [Buffer.byteLength(texto17), Buffer.byteLength(texto18)],
  hashes_brutos: [sha(texto17), sha(texto18)],
  hashes_normalizados: [sha(normalizar(texto17)), sha(normalizar(texto18))],
  corpo_integral_igual: false,
  estrutura_igual: false,
  paginacao: '1217 tem duas páginas; 1218 é uma página HTML agregadora com quatro blocos',
  tema_1217: 'reduções informais de fala',
  tema_1218: 'compilação de connected speech, stress, contrações e reduções informais',
  sobreposicao: '1217 está integralmente contida como o quarto bloco de 1218',
  conteudo_1217_integralmente_contido: normalizar(texto18).includes(normalizar(texto17)),
  conteudo_exclusivo_1217: false,
  conteudo_exclusivo_1218: 'três blocos anteriores já classificados (1214–1216) e elementos de interface sem valor curricular',
  classificacao: 'fontes distintas por estrutura; 1218 é compilação sem conteúdo didático exclusivo e não uma duplicata integral de 1217',
  decisao: 'consolidar separadamente as procedências sem criar unidades, atividades, painéis ou subpainéis'
}];
gravar('dados/mapeamento-fontes-extensas-037.json', mapa);
triagem.intervalo = [1217, 1218];
triagem.sequenciais.push({numero: 1218, nome: nome18, tamanho_bytes: fonte18.tamanho_bytes, hash_bruto: fonte18.hash_bruto, hash_normalizado: fonte18.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: fonte18.tipo, blocos: 4, partes: 5, sem_destino_util: 0});
triagem.observacao = 'Lote encerrado em 1218, antes de 1219; 1217 é duplicata integral e 1218 é compilação sem conteúdo didático exclusivo.';
gravar('dados/lote-037-triagem.json', triagem);
const revisao = ler('dados/revisao-fontes.json');
revisao['1217'] = {estado: 'duplicata', secoes: ['corpo integral igual a 0144 e 0781; páginas 1–2 consolidadas nos destinos B1 existentes']};
revisao['1218'] = {estado: 'integralmente classificada', secoes: ['quatro blocos integralmente contidos e já cobertos por 1214–1217; interface e editorial descartados']};
gravar('dados/revisao-fontes.json', revisao);
const mapaFontes = ler('dados/mapa-fontes.json');
for (const item of mapaFontes.arquivos) {
  const registro = revisao[item.id];
  if (registro) {item.estado_revisao = registro.estado; item.secoes = registro.secoes.join(' | ');}
  if (item.id === '1217') item.unidades = ['B1-L5-0144-01', 'B1-L5-0144-02'];
  if (item.id === '1218') item.unidades = [...new Set(fonte18.partes.flatMap(parte => [parte.destino_curricular_especifico, ...(parte.destinos_adicionais || [])]).filter(Boolean))];
}
gravar('dados/mapa-fontes.json', mapaFontes);
console.log('1218 classificada e comparação 1217×1218 concluída.');
