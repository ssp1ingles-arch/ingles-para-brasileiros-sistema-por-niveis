import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const mapa = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/mapeamento-fontes-extensas-029.json'), 'utf8'));
const comparacao = mapa.comparacoes_integrais[0];
const verificacoes = [
  comparacao.executada_apos_validacao_1198,
  !comparacao.corpo_integral_igual && !comparacao.normalizado_integral_igual,
  comparacao.hash_bruto_1198 !== comparacao.hash_bruto_1199 && comparacao.hash_normalizado_1198 !== comparacao.hash_normalizado_1199,
  comparacao.capitulos_ou_secoes_1198 === 36 && comparacao.capitulos_ou_secoes_1199 === 14,
  comparacao.exemplos_1198 === 191 && comparacao.exemplos_1199 === 150,
  comparacao.exercicios_1198 === 0 && comparacao.exercicios_1199 === 0 && comparacao.respostas_1198 === 0 && comparacao.respostas_1199 === 0,
  comparacao.classificacao.includes('obras independentes'),
  comparacao.conteudo_exclusivo_1198.includes('gramaticais') && comparacao.conteudo_exclusivo_1199.includes('lexicais')
];
const nomes = ['ordem da comparação', 'corpos diferentes', 'hashes diferentes', 'estruturas diferentes', 'contagens exclusivas', 'sem exercícios/respostas', 'classificação independente', 'conteúdo exclusivo'];
const evidencia = { total: verificacoes.length, aprovados: verificacoes.filter(Boolean).length, resultados: verificacoes.map((resultado, indice) => ({ teste: nomes[indice], resultado: resultado ? 'APROVADO' : 'FALHOU' })) };
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-029/resultados-comparacao-029.json'), `${JSON.stringify(evidencia, null, 2)}\n`);
console.log(`COMPARAÇÃO 029: ${evidencia.aprovados}/${evidencia.total}`);
if (evidencia.aprovados !== evidencia.total) process.exit(1);
