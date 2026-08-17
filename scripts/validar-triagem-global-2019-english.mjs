import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const manifesto = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/integracao-2019-english-manifesto.json'), 'utf8'));
const triagem = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/integracao-2019-english-triagem-global.json'), 'utf8'));
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(n => JSON.parse(fs.readFileSync(path.join(raiz, `dados/${n}/unidades.json`), 'utf8')));
const atividades = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/atividades.json'), 'utf8'));
const ids = new Set(unidades.map(u => u.id));
const pendentes = manifesto.itens.filter(item => item.status_editorial === 'pendente');
const rotulos = new Set(['cobertura_confirmada', 'provavel_cobertura_revisar_amostra', 'candidata_enriquecimento', 'candidata_nova_unidade', 'candidata_nova_atividade', 'conteudo_sem_objetivo_independente', 'qualidade_linguistica_insuficiente', 'conteudo_multilingue_sem_portugues', 'necessita_revisao_profunda']);
const erros = [];
const falhar = (condicao, mensagem) => { if (!condicao) erros.push(mensagem); };
falhar(triagem.escopo.fontes_triadas === 91 && triagem.fontes.length === 91, 'escopo deve conter exatamente 91 fontes');
falhar(triagem.escopo.unidades_canonicas_comparadas === 834 && unidades.length === 834, '834 unidades devem permanecer validas');
falhar(triagem.escopo.atividades_comparadas === 1977 && atividades.length === 1977, '1.977 atividades devem permanecer validas');
falhar(new Set(triagem.fontes.map(f => f.fonte)).size === 91, 'fontes duplicadas na triagem');
falhar(pendentes.every(item => triagem.fontes.some(f => f.fonte === item.nome)), 'ha fonte pendente omitida');
let secoes = 0;
for (const fonte of triagem.fontes) {
  const item = pendentes.find(p => p.nome === fonte.fonte);
  const arquivo = path.join(manifesto.fonte_somente_leitura, fonte.fonte);
  falhar(Boolean(item), `fonte fora do escopo: ${fonte.fonte}`);
  falhar(fs.existsSync(arquivo), `caminho ausente: ${fonte.fonte}`);
  if (fs.existsSync(arquivo)) falhar(crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex') === fonte.sha256 && fonte.sha256 === item?.sha256_saida, `hash divergente: ${fonte.fonte}`);
  falhar(fonte.secoes.length === fonte.secoes_identificadas && fonte.secoes.length > 0, `contagem de secoes invalida: ${fonte.fonte}`);
  secoes += fonte.secoes.length;
  for (const secao of fonte.secoes) {
    falhar(rotulos.has(secao.classificacao), `rotulo invalido: ${secao.classificacao}`);
    falhar(ids.has(secao.comparacao.unidade_mais_proxima), `ID mais proximo invalido: ${secao.comparacao.unidade_mais_proxima}`);
    falhar(secao.comparacao.correspondencias.every(c => ids.has(c.unidade_id)), `referencia canonica invalida em ${fonte.fonte}`);
    if (secao.classificacao === 'cobertura_confirmada') falhar(secao.evidencia_cobertura?.ids_canonicos?.length && secao.evidencia_cobertura.ids_canonicos.every(id => ids.has(id)), `cobertura sem evidencia canonica: ${fonte.fonte}`);
    if (secao.classificacao.startsWith('candidata_')) falhar(secao.justificativa_candidata?.diferenca_concreta && secao.justificativa_candidata?.destino_curricular_provavel && ids.has(secao.justificativa_candidata?.unidade_canonica_mais_proxima), `candidata sem justificativa: ${fonte.fonte}`);
  }
}
falhar(secoes === triagem.totais.secoes_identificadas, 'total de secoes divergente');
falhar(triagem.ordem_prioridade_revisao.length === triagem.totais.candidatas_reais, 'total de candidatas divergente');
falhar(triagem.proxima_candidata_exata === null || triagem.proxima_candidata_exata.prioridade_ordem === 1, 'proxima candidata invalida');
console.log(JSON.stringify({ resultado: erros.length ? 'FALHOU' : 'APROVADO', fontes: triagem.fontes.length, secoes, candidatas: triagem.totais.candidatas_reais, unidades: unidades.length, atividades: atividades.length, erros }, null, 2));
if (erros.length) process.exit(1);
