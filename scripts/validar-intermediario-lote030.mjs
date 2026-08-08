import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const mapa = ler('dados/mapeamento-fontes-extensas-030.json');
const triagem = ler('dados/lote-030-triagem.json');
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(n => ler(`dados/${n}/unidades.json`));
const ids = new Set(unidades.map(u => u.id));
const f = mapa.fontes.find(item => item.numero === 1200);
const checks = [
  f.leitura_integral,
  f.secoes.length === 12,
  f.secoes.every(s => s.decisao),
  f.secoes.every(s => ids.has(s.destino_curricular_especifico)),
  f.totais.uteis_sem_destino === 0,
  f.integridade.caracteres_substituicao === 0 && f.integridade.marcadores_cid === 0 && !f.integridade.corrupcao,
  f.secoes.every(s => !s.elegivel_atividade && !s.elegivel_jornada),
  unidades.length === 834,
  ler('dados/atividades.json').length === 1977,
  ler('dados/subpaineis.json').length === 95,
  new Set(unidades.map(u => u.id)).size === 834,
  !JSON.stringify(mapa).includes('conteudo_fonte'),
  triagem.intervalo[0] === 1200 && triagem.sequenciais.some(item => item.numero === 1200)
];
const nomes = ['leitura integral','12 blocos','todas decisões','destinos válidos','zero útil sem destino','integridade textual','sem automação','834 unidades','1977 atividades','95 subpainéis','IDs únicos','sem reprodução','barreira em 1200'];
const resultados = checks.map((ok,i) => ({ teste: nomes[i], resultado: ok ? 'APROVADO' : 'FALHOU' }));
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-030'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-030/resultados-intermediarios-1200.json'), `${JSON.stringify({ total: checks.length, aprovados: checks.filter(Boolean).length, resultados }, null, 2)}\n`);
if (checks.some(ok => !ok)) throw new Error('Validação intermediária 1200 falhou.');
triagem.validacao_intermediaria = { pendente: false, encerrada_em: 1200, testes: `${checks.length}/${checks.length}`, aprovada: true };
fs.writeFileSync(path.join(raiz, 'dados/lote-030-triagem.json'), `${JSON.stringify(triagem, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 030/1200: ${checks.length}/${checks.length}`);
