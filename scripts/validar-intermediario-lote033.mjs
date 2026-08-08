import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const mapa = ler('dados/mapeamento-fontes-extensas-033.json');
const triagem = ler('dados/lote-033-triagem.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const ids = new Set(unidades.map(unidade => unidade.id));
const fonte = mapa.fontes.find(item => item.numero === 1209);
const uteis = fonte.partes.filter(parte => parte.decisao.startsWith('consolidar'));
const hashAtual = crypto.createHash('sha256').update(fs.readFileSync(path.join(fonteDir, fonte.nome_completo))).digest('hex');
const checks = [
  fonte.leitura_integral && fonte.imagem_original_conferida_somente_leitura,
  fonte.partes.length === 3 && fonte.partes.every(parte => parte.decisao),
  uteis.length === 1 && uteis.every(parte => ids.has(parte.destino_curricular_especifico)),
  fonte.totais.uteis_sem_destino === 0,
  fonte.integridade.caracteres_substituicao === 0 && fonte.integridade.marcadores_cid === 0 && !fonte.integridade.corrupcao,
  fonte.partes.every(parte => !parte.elegivel_atividade && !parte.elegivel_jornada),
  fonte.estrutura.imagens_publicadas === 0,
  !JSON.stringify(mapa).match(/caminho_origem|conteudo_fonte|perfil_social|nome_autor|credito_pessoal/i),
  hashAtual === fonte.hash_bruto,
  unidades.length === 834,
  ler('dados/atividades.json').length === 1977,
  ler('dados/subpaineis.json').length === 95,
  ids.size === 834,
  triagem.intervalo[0] === 1209 && triagem.sequenciais.some(item => item.numero === 1209)
];
const nomes = ['leitura e inspeção integral', '3 partes decididas', 'destino válido', 'zero útil sem destino', 'integridade', 'sem automação', 'zero imagem publicada', 'sanitização', 'hash preservado', '834 unidades', '1977 atividades', '95 subpainéis', 'IDs únicos', 'barreira 1209'];
const resultado = { total: checks.length, aprovados: checks.filter(Boolean).length, resultados: checks.map((ok, indice) => ({ teste: nomes[indice], resultado: ok ? 'APROVADO' : 'FALHOU' })) };
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-033'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-033/resultados-intermediarios-1209.json'), `${JSON.stringify(resultado, null, 2)}\n`);
if (resultado.aprovados !== resultado.total) throw new Error('Validação intermediária 1209 falhou.');
triagem.validacao_intermediaria = { pendente: false, encerrada_em: 1209, testes: `${resultado.total}/${resultado.total}`, aprovada: true };
fs.writeFileSync(path.join(raiz, 'dados/lote-033-triagem.json'), `${JSON.stringify(triagem, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 033/1209: ${resultado.aprovados}/${resultado.total}`);
