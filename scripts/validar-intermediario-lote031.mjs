import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const mapa = ler('dados/mapeamento-fontes-extensas-031.json');
const triagem = ler('dados/lote-031-triagem.json');
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(n => ler(`dados/${n}/unidades.json`));
const ids = new Set(unidades.map(u => u.id));
const fonte = mapa.fontes.find(item => item.numero === 1205);
const util = fonte.partes.filter(item => item.decisao.startsWith('consolidar'));
const checks = [
  fonte.leitura_integral && fonte.imagem_original_conferida_somente_leitura,
  fonte.partes.length === 3 && fonte.partes.every(item => item.decisao),
  util.length === 1 && util.every(item => ids.has(item.destino_curricular_especifico)),
  fonte.totais.uteis_sem_destino === 0,
  fonte.integridade.caracteres_substituicao === 0 && fonte.integridade.marcadores_cid === 0 && !fonte.integridade.corrupcao,
  fonte.partes.every(item => !item.elegivel_atividade && !item.elegivel_jornada),
  fonte.estrutura.imagens_publicadas === 0,
  !JSON.stringify(mapa).match(/caminho_origem|conteudo_fonte|perfil_social|nome_autor/i),
  unidades.length === 834,
  ler('dados/atividades.json').length === 1977,
  ler('dados/subpaineis.json').length === 95,
  ids.size === 834,
  triagem.intervalo[0] === 1205 && triagem.sequenciais.some(item => item.numero === 1205)
];
const nomes = ['leitura e inspeção integral','3 partes decididas','destino válido','zero útil sem destino','integridade textual','sem automação','zero imagem publicada','sanitização pública','834 unidades','1977 atividades','95 subpainéis','IDs únicos','barreira em 1205'];
const resultados = checks.map((ok, i) => ({ teste: nomes[i], resultado: ok ? 'APROVADO' : 'FALHOU' }));
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-031'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-031/resultados-intermediarios-1205.json'), `${JSON.stringify({ total: checks.length, aprovados: checks.filter(Boolean).length, resultados }, null, 2)}\n`);
if (checks.some(ok => !ok)) throw new Error('Validação intermediária 1205 falhou.');
triagem.validacao_intermediaria = { pendente: false, encerrada_em: 1205, testes: `${checks.length}/${checks.length}`, aprovada: true };
fs.writeFileSync(path.join(raiz, 'dados/lote-031-triagem.json'), `${JSON.stringify(triagem, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 031/1205: ${checks.length}/${checks.length}`);
