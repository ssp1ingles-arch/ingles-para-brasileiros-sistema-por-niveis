import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const manifestoPath = path.join(raiz, 'dados/integracao-2019-english-manifesto.json');
const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'));
const fonteRaiz = manifesto.fonte_somente_leitura;
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const unidades = niveis.flatMap(nivel => JSON.parse(fs.readFileSync(path.join(raiz, `dados/${nivel}/unidades.json`), 'utf8')));
const atividades = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/atividades.json'), 'utf8'));
const pendentes = manifesto.itens.filter(item => item.status_editorial === 'pendente');

const normalizar = valor => String(valor || '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[’`]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim();
const stop = new Set('a an and are as at be been being but by da das de do dos e em for from he her hers him his i in is it its la le les lo los mais mas me meu minha na nas no nos o os of on or para por que se she sua seu the their them they this to um uma un une was we were with you your'.split(' '));
const tokens = valor => [...new Set(normalizar(valor).split(' ').filter(token => token.length > 2 && !stop.has(token)))];
const limitar = (valor, max = 120) => String(valor || '').replace(/\s+/g, ' ').trim().slice(0, max);
const textoUnidade = unidade => [unidade.titulo, unidade.tema, unidade.explicacao_pt, ...(unidade.conteudo_en || []), ...(unidade.traducoes || []), ...(unidade.habilidades || []), ...(unidade.paineis || []), unidade.subpainel].filter(Boolean).join(' ');
const atividadesPorUnidade = Object.groupBy(atividades, atividade => atividade.unidade_id);
const indice = unidades.map(unidade => {
  const texto = textoUnidade(unidade);
  const termos = new Set(tokens(texto));
  const exemplos = new Set([...(unidade.conteudo_en || []), ...(unidade.traducoes || []), ...(atividadesPorUnidade[unidade.id] || []).flatMap(a => [a.resposta?.texto, a.resposta?.normalizada])].map(normalizar).filter(v => v.length >= 12));
  return { unidade, termos, exemplos, titulo: normalizar(unidade.titulo), tema: normalizar(unidade.tema) };
});
const ids = new Set(unidades.map(unidade => unidade.id));

function dividirSecoes(markdown) {
  const linhas = markdown.replace(/^\uFEFF/, '').split(/\r?\n/);
  const secoes = [];
  let atual = { titulo: 'Abertura', nivel: 0, inicio: 1, linhas: [] };
  for (let i = 0; i < linhas.length; i++) {
    const match = linhas[i].match(/^(#{1,4})\s+(.+?)\s*$/);
    if (match && match[1].length <= 2) {
      if (atual.linhas.join('\n').trim()) secoes.push(atual);
      atual = { titulo: limitar(match[2], 180), nivel: match[1].length, inicio: i + 1, linhas: [] };
    } else atual.linhas.push(linhas[i]);
  }
  if (atual.linhas.join('\n').trim()) secoes.push(atual);
  return secoes.map((secao, i) => ({ ...secao, fim: i + 1 < secoes.length ? secoes[i + 1].inicio - 1 : linhas.length }));
}

function comparar(titulo, corpo) {
  const texto = `${titulo} ${corpo}`;
  const termos = new Set(tokens(texto));
  const frases = new Set(corpo.split(/\r?\n|(?<=[.!?])\s+/).map(normalizar).filter(v => v.length >= 12 && v.length <= 240));
  return indice.map(item => {
    let intersecao = 0;
    for (const termo of termos) if (item.termos.has(termo)) intersecao++;
    const uniao = Math.max(1, termos.size + item.termos.size - intersecao);
    const jaccard = intersecao / uniao;
    const cobertura = intersecao / Math.max(1, Math.min(termos.size, 35));
    let exemplosExatos = 0;
    for (const frase of frases) if (item.exemplos.has(frase)) exemplosExatos++;
    const tituloExato = normalizar(titulo) && [item.titulo, item.tema].includes(normalizar(titulo));
    const score = Math.min(1, jaccard * 2.4 + cobertura * 0.65 + Math.min(exemplosExatos, 3) * 0.18 + (tituloExato ? 0.18 : 0));
    return { id: item.unidade.id, titulo: item.unidade.titulo, nivel: item.unidade.nivel, score, intersecao, exemplosExatos, tituloExato };
  }).sort((a, b) => b.score - a.score || b.exemplosExatos - a.exemplosExatos).slice(0, 3);
}

function decidir(secao, comparacoes) {
  const corpo = secao.linhas.join('\n').trim();
  const norm = normalizar(`${secao.titulo} ${corpo}`);
  const palavras = norm.split(' ').filter(Boolean);
  const melhor = comparacoes[0];
  const pagina = secao.titulo.match(/p(?:a|\u00e1)gina\s+\d+/i)?.[0] || null;
  const ruim = /ï¿½|\(cid:\d+\)|\ufffd|ocursodeinglesdaabril/i.test(corpo) || (corpo.length > 300 && palavras.length && palavras.filter(p => /[^aeiou]{7,}/.test(p)).length / palavras.length > 0.08);
  const portugues = (norm.match(/\b(?:nao|uma|voce|como|para|ingles|portugues|frase|exemplo|exercicio|resposta|traducao|verbo|palavra|pagina|aula)\b/g) || []).length;
  const multilingue = (norm.match(/\b(?:espanol|francais|deutsch|italiano|russian|chinese|japanese|arabic|portuguese)\b/g) || []).length >= 2 && portugues < 2;
  const editorial = /^(procedencia|sumario|indice|contents|copyright|acknowledg|credits|abertura)$/i.test(normalizar(secao.titulo)) || corpo.length < 80;
  const exercicio = /\b(exercic|exercise|practice|quiz|question|complete|choose|match|write|listen|reading comprehension)\b/.test(norm);
  const prioridade = /\b(writing|essay|paragraph|email|letter|listening|audio|transcript|transcription|business|professional|workplace|pronunciation|phonetic|conversation|dialogue|c1|c2|kids|children)\b/.test(norm);
  const avancado = /\b(c1|c2|advanced|academic|essay|business|professional|idiom|collocation|discourse|argument|presentation|negotiat)\b/.test(norm);
  const lista = /\b(vocabulario|vocabulary|dictionary|glossary|word list|lista de palavras)\b/.test(norm) || corpo.split(/\r?\n/).filter(l => /^\s*[-*]\s+/.test(l)).length > 35;
  let classificacao;
  if (ruim) classificacao = 'qualidade_linguistica_insuficiente';
  else if (multilingue) classificacao = 'conteudo_multilingue_sem_portugues';
  else if (editorial || lista) classificacao = 'conteudo_sem_objetivo_independente';
  else if (melhor.exemplosExatos >= 2 || (melhor.tituloExato && melhor.exemplosExatos >= 1) || melhor.score >= 0.62) classificacao = 'cobertura_confirmada';
  else if (melhor.score >= 0.34) classificacao = 'provavel_cobertura_revisar_amostra';
  else if (prioridade && exercicio && melhor.score < 0.28 && corpo.length >= 350) classificacao = 'candidata_nova_atividade';
  else if (prioridade && avancado && melhor.score < 0.2 && corpo.length >= 500) classificacao = 'candidata_nova_unidade';
  else if (prioridade && melhor.score >= 0.22 && corpo.length >= 350) classificacao = 'candidata_enriquecimento';
  else if (corpo.length >= 500 && melhor.score < 0.18) classificacao = 'necessita_revisao_profunda';
  else classificacao = 'provavel_cobertura_revisar_amostra';

  const candidata = classificacao.startsWith('candidata_');
  const cobertura = classificacao === 'cobertura_confirmada';
  const linhaSignificativa = corpo.split(/\r?\n/).map(l => l.replace(/^\s*[-*]\s*/, '').trim()).find(l => l.length >= 18 && !/^(?:origem|sha-?256|metodo|arquivo|total de paginas|!\[)/i.test(l));
  const tituloGenerico = /^(?:pagina|page)\s+\d+$/i.test(normalizar(secao.titulo));
  const objetivo = limitar(tituloGenerico || secao.titulo === 'Abertura' ? (linhaSignificativa || secao.titulo) : secao.titulo, 160);
  const destino = melhor.id ? `${melhor.nivel} / ${melhor.id}` : 'a definir na revisao profunda';
  return {
    secao: limitar(secao.titulo, 180),
    linhas: { inicio: secao.inicio, fim: secao.fim },
    pagina,
    classificacao,
    metadados_extraidos: {
      objetivo_resumido: objetivo,
      caracteres_analisados: corpo.length,
      tem_exemplos_ou_dialogo: /[.!?]|\b(?:dialog|woman:|man:|example|exemplo)\b/i.test(corpo),
      tem_exercicio: exercicio,
      termos_relevantes: tokens(`${secao.titulo} ${corpo}`).slice(0, 12)
    },
    comparacao: {
      unidade_mais_proxima: melhor.id,
      correspondencias: comparacoes.map(c => ({ unidade_id: c.id, score: Number(c.score.toFixed(4)), termos_em_comum: c.intersecao, exemplos_exatos: c.exemplosExatos })),
      metodo: 'sobreposicao normalizada de termos, titulo/tema e exemplos; titulo isolado nao confirma cobertura'
    },
    ...(cobertura ? { evidencia_cobertura: { ids_canonicos: comparacoes.filter(c => c.score >= Math.max(0.3, melhor.score * 0.72)).map(c => c.id), objetivo_equivalente: objetivo, exemplos_equivalentes: melhor.exemplosExatos, evidencia: `score ${melhor.score.toFixed(4)}; ${melhor.intersecao} termos; ${melhor.exemplosExatos} exemplo(s) normalizado(s) exato(s)` } } : {}),
    ...(candidata ? { justificativa_candidata: { conteudo_exclusivo_resumido: objetivo, unidade_canonica_mais_proxima: melhor.id, diferenca_concreta: `Secao substantiva de prioridade curricular com correspondencia insuficiente (score ${melhor.score.toFixed(4)}; ${melhor.exemplosExatos} exemplos exatos).`, destino_curricular_provavel: destino, prioridade: avancado ? 'alta' : 'media' } } : {})
  };
}

const fontes = [];
for (let i = 0; i < pendentes.length; i++) {
  const item = pendentes[i];
  const arquivo = path.join(fonteRaiz, item.nome);
  const buffer = fs.readFileSync(arquivo);
  const markdown = buffer.toString('utf8');
  const secoes = dividirSecoes(markdown).map(secao => decidir(secao, comparar(secao.titulo, secao.linhas.join('\n'))));
  const pesoTipoCandidata = { candidata_nova_unidade: 0, candidata_enriquecimento: 1, candidata_nova_atividade: 2 };
  const candidatasFonte = secoes
    .map((secao, indiceSecao) => ({ secao, indiceSecao }))
    .filter(itemSecao => itemSecao.secao.classificacao.startsWith('candidata_'))
    .sort((a, b) => pesoTipoCandidata[a.secao.classificacao] - pesoTipoCandidata[b.secao.classificacao] || b.secao.metadados_extraidos.caracteres_analisados - a.secao.metadados_extraidos.caracteres_analisados);
  for (const excedente of candidatasFonte.slice(3)) {
    excedente.secao.classificacao = 'necessita_revisao_profunda';
    delete excedente.secao.justificativa_candidata;
  }
  const contagens = Object.fromEntries(Object.entries(Object.groupBy(secoes, secao => secao.classificacao)).map(([rotulo, itens]) => [rotulo, itens.length]));
  fontes.push({ ordem_manifesto: item.ordem_manifesto, fonte: item.nome, sha256: crypto.createHash('sha256').update(buffer).digest('hex'), bytes: buffer.length, secoes_identificadas: secoes.length, contagens, possui_candidata: secoes.some(s => s.classificacao.startsWith('candidata_')), exige_revisao_profunda: secoes.some(s => s.classificacao === 'necessita_revisao_profunda'), secoes });
  if ((i + 1) % 10 === 0 || i + 1 === pendentes.length) console.log(`Checkpoint deterministico: ${i + 1}/${pendentes.length} fontes analisadas.`);
}

const todasSecoes = fontes.flatMap(fonte => fonte.secoes.map(secao => ({ fonte: fonte.fonte, ordem_manifesto: fonte.ordem_manifesto, ...secao })));
const contagens = Object.fromEntries(Object.entries(Object.groupBy(todasSecoes, secao => secao.classificacao)).map(([rotulo, itens]) => [rotulo, itens.length]));
const pesoPrioridade = { alta: 0, media: 1, baixa: 2 };
const candidatas = todasSecoes
  .filter(secao => secao.classificacao.startsWith('candidata_'))
  .sort((a, b) => pesoPrioridade[a.justificativa_candidata.prioridade] - pesoPrioridade[b.justificativa_candidata.prioridade] || a.ordem_manifesto - b.ordem_manifesto || a.linhas.inicio - b.linhas.inicio)
  .map((secao, i) => ({ prioridade_ordem: i + 1, fonte: secao.fonte, secao: secao.secao, linhas: secao.linhas, classificacao: secao.classificacao, ...secao.justificativa_candidata }));
const revisaoProfunda = todasSecoes.filter(secao => secao.classificacao === 'necessita_revisao_profunda');
const saida = {
  schema_version: 1,
  fase: 'triagem_global_nao_equivale_a_revisao_profunda',
  gerado_em: new Date().toISOString(),
  escopo: { fontes_manifesto: manifesto.itens.length, fontes_ja_revisadas: manifesto.itens.length - pendentes.length, fontes_triadas: fontes.length, unidades_canonicas_comparadas: unidades.length, atividades_comparadas: atividades.length },
  metodologia: { etapa_a: 'Extracao por secoes Markdown coerentes e comparacao normalizada com titulos, explicacoes, exemplos, traducoes, habilidades, temas, paineis, subpaineis e atividades.', etapa_b: 'Classificacao editorial conservadora por evidencia; semelhanca de titulo isolada nunca confirma cobertura. Para manter uma fila acionavel, no maximo tres candidatas de maior sinal por fonte permanecem na fila; excedentes substantivos sao encaminhados a necessita_revisao_profunda.', limitacao: 'Triagem automatizada prioriza revisao humana; rotulos provavel, candidata e necessita_revisao_profunda nao afirmam novidade ate a revisao editorial.' },
  totais: { secoes_identificadas: todasSecoes.length, ...contagens, candidatas_reais: candidatas.length, fontes_sem_candidata: fontes.filter(f => !f.possui_candidata).length, fontes_exigem_revisao_profunda: new Set(revisaoProfunda.map(s => s.fonte)).size },
  ordem_prioridade_revisao: candidatas,
  proxima_candidata_exata: candidatas[0] || null,
  fontes
};

fs.writeFileSync(path.join(raiz, 'dados/integracao-2019-english-triagem-global.json'), `${JSON.stringify(saida, null, 2)}\n`);
const linhasRelatorio = [
  '# Triagem global — 2019 English', '',
  '> Esta triagem automatizada nao substitui revisao editorial profunda e nao altera unidades, atividades ou interface.', '',
  '## Escopo e resultado', '',
  `- Fontes triadas: **${fontes.length}/91**.`,
  `- Secoes identificadas e comparadas: **${todasSecoes.length}**.`,
  `- Cobertura confirmada por evidencia automatizada: **${contagens.cobertura_confirmada || 0}**.`,
  `- Provavel cobertura, com amostra ainda necessaria: **${contagens.provavel_cobertura_revisar_amostra || 0}**.`,
  `- Candidatas a enriquecimento: **${contagens.candidata_enriquecimento || 0}**.`,
  `- Candidatas a nova unidade: **${contagens.candidata_nova_unidade || 0}**.`,
  `- Candidatas a nova atividade: **${contagens.candidata_nova_atividade || 0}**.`,
  `- Conteudo sem objetivo independente: **${contagens.conteudo_sem_objetivo_independente || 0}**.`,
  `- Qualidade linguistica insuficiente: **${contagens.qualidade_linguistica_insuficiente || 0}**.`,
  `- Multilingue sem portugues: **${contagens.conteudo_multilingue_sem_portugues || 0}**.`,
  `- Necessita revisao profunda: **${contagens.necessita_revisao_profunda || 0}** secoes em **${saida.totais.fontes_exigem_revisao_profunda}** fontes.`,
  `- Fontes sem qualquer candidata: **${saida.totais.fontes_sem_candidata}**.`, '',
  '## Metodo', '',
  'A etapa A extraiu secoes, paginas, objetivos resumidos e sinais de exemplos, dialogos, vocabulario e exercicios. Cada secao foi comparada com os 834 registros canonicos e as 1.977 atividades apos normalizacao de caixa, pontuacao, espacos e variantes tipograficas.', '',
  'A etapa B aplicou rotulos conservadores. Titulo semelhante, sozinho, nao foi aceito como cobertura. Correspondencias confirmadas guardam IDs, objetivo e evidencia; candidatas guardam diferenca concreta, destino e prioridade. Para manter uma fila acionavel, ficaram no maximo tres candidatas de maior sinal por fonte; os demais blocos substantivos foram encaminhados a revisao profunda. Nenhuma transcricao extensa foi copiada.', '',
  '## Prioridade de revisao profunda', '',
  ...candidatas.slice(0, 50).flatMap(c => [`${c.prioridade_ordem}. **${c.classificacao}** — \`${c.fonte}\`, secao “${c.secao}” (linhas ${c.linhas.inicio}-${c.linhas.fim}); mais proxima: \`${c.unidade_canonica_mais_proxima}\`; prioridade ${c.prioridade}.`, `   Diferenca: ${c.diferenca_concreta}`]),
  ...(candidatas.length > 50 ? ['', `A lista integral e rastreavel das **${candidatas.length}** candidatas esta no JSON.`] : []), '',
  '## Proxima etapa', '',
  candidatas[0] ? `Revisar primeiro \`${candidatas[0].fonte}\`, secao “${candidatas[0].secao}” (linhas ${candidatas[0].linhas.inicio}-${candidatas[0].linhas.fim}), sem iniciar automaticamente as demais.` : 'Nenhuma candidata automatizada foi identificada; amostrar primeiro as secoes marcadas para revisao profunda.', ''
];
fs.writeFileSync(path.join(raiz, 'docs/TRIAGEM_GLOBAL_2019_ENGLISH.md'), linhasRelatorio.join('\n'));
console.log(`Triagem concluida: ${fontes.length} fontes, ${todasSecoes.length} secoes, ${candidatas.length} candidatas.`);
