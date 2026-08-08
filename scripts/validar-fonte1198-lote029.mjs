import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontes = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const triagem = ler('dados/lote-029-triagem.json');
const mapa = ler('dados/mapeamento-fontes-extensas-029.json');
const fonte = mapa.fontes.find(item => item.numero === 1198);
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const ids = new Set(unidades.map(item => item.id));
const resultados = [];
const testar = (nome, condicao) => {
  resultados.push({ teste: nome, resultado: condicao ? 'APROVADO' : 'FALHOU' });
  if (!condicao) throw new Error(nome);
};

testar('1197 intermediária aprovada', ler('docs/evidencias/lote-029/resultados-intermediarios-1197.json').aprovados === 18);
testar('1198 integralmente lida', fonte.leitura_integral);
testar('1199 ainda fechada', triagem.intervalo.join(',') === '1197,1198' && mapa.fontes.every(item => item.numero !== 1199));
testar('36 temas', fonte.secoes.length === 36 && fonte.estrutura.temas === 36);
testar('191 itens', fonte.secoes.reduce((total, secao) => total + secao.itens_identificados, 0) === 191);
testar('todas as seções decididas', fonte.secoes.every(secao => secao.decisao));
testar('todos os destinos existem', fonte.secoes.every(secao => ids.has(secao.destino_curricular_especifico)));
testar('zero útil sem destino', fonte.totais.uteis_sem_destino === 0);
testar('descartes justificados', fonte.descartes.every(item => item.justificativa));
testar('sem paginação inventada', !fonte.paginacao.possui_marcadores && fonte.paginacao.presentes === 0);
testar('UTF-8 sem corrupção', fonte.integridade.utf8_valido && fonte.integridade.caracteres_substituicao === 0 && fonte.integridade.marcadores_cid === 0 && !fonte.integridade.corrupcao);
testar('sem exercícios ou respostas', fonte.estrutura.exercicios === 0 && fonte.estrutura.respostas === 0);
testar('sem atividade automática', fonte.secoes.every(secao => !secao.elegivel_atividade));
testar('sem reprodução de frases', !JSON.stringify(mapa).includes('conteudo_fonte') && fonte.observacao_publica.includes('permanecem exclusivamente'));
testar('base preservada', unidades.length === 834 && ler('dados/atividades.json').length === 1977 && ler('dados/subpaineis.json').length === 95);
const meta = ler('dados/mapa-fontes.json').arquivos.find(item => Number(item.id) === 1198);
const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(fontes, meta.arquivo))).digest('hex');
testar('hash 1198 preservado', hash === fonte.hash_bruto);
testar('JSON sanitizado', !JSON.stringify(mapa).includes('C:\\Users\\') && !JSON.stringify(mapa).includes('caminho_origem'));

const evidencia = { total: resultados.length, aprovados: resultados.filter(item => item.resultado === 'APROVADO').length, resultados };
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-029/resultados-fonte1198.json'), `${JSON.stringify(evidencia, null, 2)}\n`);
console.log(`FONTE 1198: ${evidencia.aprovados}/${evidencia.total}`);
