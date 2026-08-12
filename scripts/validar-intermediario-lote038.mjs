import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/\s+/gu, ' ').trim();
const mapa = ler('dados/mapeamento-fontes-extensas-038.json');
const triagem = ler('dados/lote-038-triagem.json');
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const ids = new Set(unidades.map(unidade => unidade.id));
const fonte = mapa.fontes[0];
const atual = fs.readFileSync(path.join(fonteRaiz, fonte.nome_completo), 'utf8');
const uteis = fonte.partes.filter(parte => parte.decisao.startsWith('consolidar'));
const destinos = uteis.flatMap(parte => [parte.destino_curricular_especifico, ...(parte.destinos_adicionais || [])]);
const verificacoes = [
  fonte.leitura_integral,
  fonte.paginacao.blocos_presentes === 12 && !fonte.paginacao.ausentes.length && !fonte.paginacao.repetidos.length && !fonte.paginacao.vazios.length,
  fonte.partes.length === 13 && fonte.partes.every(parte => parte.decisao && parte.justificativa),
  uteis.length === 12 && destinos.every(id => ids.has(id)),
  fonte.totais.uteis_sem_destino === 0,
  !fonte.integridade.corrupcao && fonte.integridade.caracteres_substituicao === 0 && fonte.integridade.marcadores_cid === 0 && !fonte.integridade.ocr_aplicado,
  fonte.partes.every(parte => !parte.elegivel_atividade && !parte.elegivel_jornada),
  fonte.estrutura.imagens_publicadas === 0 && fonte.estrutura.exercicios_formais === 0 && fonte.estrutura.respostas === 0,
  !JSON.stringify(mapa).match(/caminho_origem|conteudo_fonte|arquivo_origem|credito_pessoal/i),
  sha(atual) === fonte.hash_bruto,
  sha(normalizar(atual)) === fonte.hash_normalizado,
  (atual.match(/^## /gm) || []).length === 12,
  fonte.estrutura.explicacoes && fonte.estrutura.exemplos && fonte.estrutura.traducoes && fonte.estrutura.material_editorial,
  unidades.length === 834 && ids.size === 834,
  ler('dados/atividades.json').length === 1977,
  ler('dados/subpaineis.json').length === 95,
  triagem.intervalo[0] === 1219 && triagem.sequenciais[0]?.numero === 1219 && triagem.validacao_intermediaria.encerrada_em === 1219
];
const nomes = ['leitura integral','12 blocos íntegros','13 partes decididas','destinos válidos','zero útil sem destino','integridade e sem OCR','sem automação','sem reprodução extensa','sanitização','hash bruto','hash normalizado','estrutura de 12 seções','tipos de conteúdo identificados','834 IDs únicos','1977 atividades','95 subpainéis','barreira 1219'];
const resultado = {total: verificacoes.length, aprovados: verificacoes.filter(Boolean).length, resultados: verificacoes.map((valor, indice) => ({teste: nomes[indice], resultado: valor ? 'APROVADO' : 'FALHOU'}))};
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-038'), {recursive: true});
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-038/resultados-intermediarios-1219.json'), `${JSON.stringify(resultado, null, 2)}\n`);
if (resultado.aprovados !== resultado.total) throw new Error('Validação intermediária 1219 falhou.');
triagem.validacao_intermediaria = {pendente:false, encerrada_em:1219, testes:`${resultado.total}/${resultado.total}`, aprovada:true};
fs.writeFileSync(path.join(raiz, 'dados/lote-038-triagem.json'), `${JSON.stringify(triagem, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 038/1219: ${resultado.aprovados}/${resultado.total}`);
