import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const manifesto = ler('dados/integracao-2019-english-manifesto.json');
const triagem = ler('dados/integracao-2019-english-triagem-global.json');
const revisao = ler('dados/integracao-2019-english-revisao-candidatas.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const atividades = ler('dados/atividades.json');
const ids = new Set(unidades.map(unidade => unidade.id));
const estados = new Set(['enriquecimento_confirmado', 'nova_unidade_confirmada', 'nova_atividade_confirmada', 'ja_coberta', 'redundante', 'qualidade_insuficiente', 'sem_objetivo_independente']);
const erros = [];
const exigir = (condicao, mensagem) => { if (!condicao) erros.push(mensagem); };
exigir(revisao.decisoes.length === 128 && revisao.totais.decididas === 128, 'devem existir 128 decisões');
exigir(new Set(revisao.decisoes.map(decisao => decisao.ordem)).size === 128, 'ordens duplicadas');
exigir(revisao.decisoes.every(decisao => estados.has(decisao.estado_final)), 'estado final inválido');
exigir(revisao.decisoes.every(decisao => decisao.estado_final === 'qualidade_insuficiente' || decisao.estado_final === 'sem_objetivo_independente' || ids.has(decisao.destino_unidade_id)), 'destino canônico inválido');
for (const decisao of revisao.decisoes) {
  const candidato = triagem.ordem_prioridade_revisao.find(item => item.prioridade_ordem === decisao.ordem);
  exigir(Boolean(candidato), `candidata ${decisao.ordem} ausente da triagem`);
  const arquivo = path.join(manifesto.fonte_somente_leitura, decisao.fonte);
  exigir(fs.existsSync(arquivo), `fonte ausente: ${decisao.fonte}`);
  if (fs.existsSync(arquivo)) {
    const linhas = fs.readFileSync(arquivo, 'utf8').split(/\r?\n/);
    const recorte = linhas.slice(decisao.linhas.inicio - 1, decisao.linhas.fim).join('\n');
    exigir(crypto.createHash('sha256').update(recorte).digest('hex') === decisao.sha256_recorte, `recorte divergente: ${decisao.ordem}`);
  }
  exigir(candidato?.decisao_final === decisao.estado_final, `decisão não reconciliada na triagem: ${decisao.ordem}`);
}
exigir(triagem.revisao_candidatas?.pendentes === 0, 'triagem ainda possui pendências');
exigir(unidades.length === 834, 'total de unidades alterado');
exigir(atividades.length === 1977, 'total de atividades alterado');
exigir(revisao.totais.nova_unidade_confirmada === undefined && revisao.totais.nova_atividade_confirmada === undefined, 'novas unidades ou atividades inesperadas');
exigir(revisao.decisoes.filter(d => d.estado_final === 'enriquecimento_confirmado').every(d => d.procedencia_interna?.arquivo === d.fonte && ids.has(d.destino_unidade_id)), 'procedência interna de enriquecimento ausente');
console.log(JSON.stringify({ resultado: erros.length ? 'FALHOU' : 'APROVADO', decididas: revisao.decisoes.length, por_estado: Object.fromEntries(Object.entries(Object.groupBy(revisao.decisoes, d => d.estado_final)).map(([k, v]) => [k, v.length])), unidades: unidades.length, atividades: atividades.length, erros }, null, 2));
if (erros.length) process.exit(1);
