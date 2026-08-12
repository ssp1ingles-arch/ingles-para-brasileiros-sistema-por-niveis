import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/\s+/gu, ' ').trim();
const mapa = ler('dados/mapeamento-fontes-extensas-037.json');
const triagem = ler('dados/lote-037-triagem.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const ids = new Set(unidades.map(unidade => unidade.id));
const fonte = mapa.fontes[0];
const atual = fs.readFileSync(path.join(fonteRaiz, fonte.nome_completo), 'utf8');
const canonica = fs.readFileSync(path.join(fonteRaiz, '0144_04_Gonna_Wanna_Gotta_Kinda_Reducoes.md'), 'utf8');
const intermediaria = fs.readFileSync(path.join(fonteRaiz, '0781_QW_SALA04_PDF4_GONNA_WANNA_GONNA_WANNA_GOTTA_KINDA_REDUCOES_INFORMAIS.md'), 'utf8');
const uteis = fonte.partes.filter(parte => parte.decisao.startsWith('consolidar'));
const verificacoes = [
  fonte.leitura_integral,
  fonte.paginacao.presentes.join(',') === '1,2' && !fonte.paginacao.ausentes.length && !fonte.paginacao.repetidas.length && !fonte.paginacao.vazias.length,
  fonte.partes.length === 3 && fonte.partes.every(parte => parte.decisao),
  uteis.length === 2 && uteis.every(parte => ids.has(parte.destino_curricular_especifico)),
  fonte.totais.uteis_sem_destino === 0,
  !fonte.integridade.corrupcao && fonte.integridade.caracteres_substituicao === 0 && fonte.integridade.marcadores_cid === 0,
  fonte.partes.every(parte => !parte.elegivel_atividade && !parte.elegivel_jornada),
  fonte.estrutura.imagens_publicadas === 0,
  !JSON.stringify(mapa).match(/caminho_origem|conteudo_fonte|arquivo_origem|credito_pessoal/i),
  sha(atual) === fonte.hash_bruto,
  sha(normalizar(atual)) === fonte.hash_normalizado,
  normalizar(atual) === normalizar(canonica) && normalizar(atual) === normalizar(intermediaria),
  fonte.duplicidade.corpo_integral_igual && fonte.duplicidade.estrutura_igual && fonte.duplicidade.paginacao_igual && !fonte.duplicidade.conteudo_exclusivo,
  unidades.length === 834 && ids.size === 834,
  ler('dados/atividades.json').length === 1977,
  ler('dados/subpaineis.json').length === 95,
  triagem.intervalo[0] === 1217 && triagem.sequenciais[0]?.numero === 1217 && triagem.validacao_intermediaria.encerrada_em === 1217
];
const nomes = ['leitura integral', 'paginação íntegra', '3 partes decididas', 'destinos válidos', 'zero útil sem destino', 'integridade', 'sem automação', 'zero imagem publicada', 'sanitização', 'hash bruto preservado', 'hash normalizado', 'corpo igual a 0144 e 0781', 'duplicidade integral', '834 IDs únicos', '1977 atividades', '95 subpainéis', 'barreira 1217'];
const resultado = {total: verificacoes.length, aprovados: verificacoes.filter(Boolean).length, resultados: verificacoes.map((valor, indice) => ({teste: nomes[indice], resultado: valor ? 'APROVADO' : 'FALHOU'}))};
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-037'), {recursive: true});
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-037/resultados-intermediarios-1217.json'), `${JSON.stringify(resultado, null, 2)}\n`);
if (resultado.aprovados !== resultado.total) throw new Error('Validação intermediária 1217 falhou.');
triagem.validacao_intermediaria = {pendente: false, encerrada_em: 1217, testes: `${resultado.total}/${resultado.total}`, aprovada: true};
fs.writeFileSync(path.join(raiz, 'dados/lote-037-triagem.json'), `${JSON.stringify(triagem, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 037/1217: ${resultado.aprovados}/${resultado.total}`);
