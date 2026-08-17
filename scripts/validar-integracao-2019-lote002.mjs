import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const sourcePath = 'D:/AI/3_Coversão_em_marldown/2019_English/01_arquivos_extraídos_e_convertidos_em_md/BBC_English_Plus_transcricoes_PT_EN.md';
const readJson = relative => JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
const lote = readJson('dados/integracao-2019-english-lote-002.json');
const manifesto = readJson('dados/integracao-2019-english-manifesto.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids']
  .flatMap(nivel => readJson(`dados/${nivel}/unidades.json`));
const ids = new Set(unidades.map(unidade => unidade.id));
const rotulos = new Set([
  'ja_coberto_integralmente', 'ja_coberto_com_exemplos_equivalentes',
  'enriquecimento_de_unidade_existente', 'nova_unidade_necessaria',
  'contexto_util_nao_publicado', 'duplicata_interna_da_fonte',
  'conteudo_sem_objetivo_independente', 'revisao_editorial_necessaria',
]);
const fail = message => { throw new Error(message); };

if (!fs.existsSync(sourcePath)) fail('Fonte somente leitura não localizada.');
const sourceHash = crypto.createHash('sha256').update(fs.readFileSync(sourcePath)).digest('hex');
if (sourceHash !== lote.fonte.sha256_saida) fail('SHA-256 atual da fonte diverge do lote.');
const item = manifesto.itens.find(entry => entry.nome === lote.fonte.nome);
if (!item || item.sha256_saida !== sourceHash) fail('Manifesto e fonte divergem.');
if (lote.estado !== 'parcialmente_analisado') fail('Estado parcial esperado.');
if (lote.fonte.unidades_totais !== 30 || lote.fonte.unidades_concluidas.join(',') !== Array.from({ length: 15 }, (_, i) => i + 1).join(',')) fail('Barreira 15/30 inválida.');
if (lote.proxima_secao_exata !== `${lote.fonte.nome} — Unidade 16`) fail('Próxima seção inválida.');
if (lote.leituras.length !== 15 || lote.leituras.some((leitura, i) => leitura.unidade !== i + 1 || !leitura.leitura_integral_da_unidade)) fail('Leituras sequenciais inválidas.');
if (lote.leituras.reduce((sum, itemLeitura) => sum + itemLeitura.pares_en_pt, 0) !== lote.contagens.pares_en_pt) fail('Total de pares divergente.');
if (lote.decisoes.length !== lote.contagens.blocos_pedagogicos) fail('Total de blocos divergente.');
for (const decisao of lote.decisoes) {
  if (!rotulos.has(decisao.classificacao)) fail(`Rótulo inválido: ${decisao.classificacao}.`);
  if (!decisao.destinos_unidades.length || decisao.destinos_unidades.some(id => !ids.has(id))) fail(`Destino inválido na Unidade ${decisao.unidade_fonte}.`);
  if (decisao.classificacao === 'contexto_util_nao_publicado') {
    for (const campo of ['unidade_canonica', 'objetivo_comunicativo', 'conteudo_exclusivo', 'motivo_concreto', 'risco_redundancia', 'risco_fragmentacao', 'decisao_final_nao_publicacao']) {
      if (!decisao[campo]) fail(`Contexto sem ${campo} na Unidade ${decisao.unidade_fonte}.`);
    }
    if (!ids.has(decisao.unidade_canonica)) fail(`Unidade canônica inválida: ${decisao.unidade_canonica}.`);
  }
}
for (const [rotulo] of [...rotulos].map(rotulo => [rotulo])) {
  const real = lote.decisoes.filter(decisao => decisao.classificacao === rotulo).length;
  if (lote.contagens.por_classificacao[rotulo] !== real) fail(`Contagem divergente para ${rotulo}.`);
}
if (lote.impacto.unidades_novas !== 0 || lote.impacto.atividades_novas !== 0) fail('Impacto curricular inesperado.');

console.log(`INTEGRAÇÃO 2019 LOTE 002 OK: 15/30 unidades, ${lote.contagens.pares_en_pt} pares, ${lote.decisoes.length} blocos, SHA-256 preservado.`);
