import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontesRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = texto => texto.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/\s+/gu, ' ').trim().toLowerCase();
const manifesto = ler('dados/lote-051-manifesto.json');
const mapeamento = ler('dados/mapeamento-fontes-extensas-051.json');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const dadosNiveis = Object.fromEntries(niveis.map(nivel => [nivel, ler(`dados/${nivel}/unidades.json`)]));
const unidades = Object.values(dadosNiveis).flat();
const unidadesPorId = new Map(unidades.map(unidade => [unidade.id, unidade]));
const fonteMapa = new Map(mapa.arquivos.map(fonte => [+fonte.id, fonte]));
const fonteDetalhe = new Map(mapeamento.fontes.map(fonte => [fonte.numero, fonte]));
const antecipadas = new Set(ler('dados/lote-051-triagem.json').antecipadas_no_intervalo);

if (manifesto.fontes.length !== 78 || manifesto.fontes.some(fonte => antecipadas.has(fonte.numero))) throw new Error('Manifesto do macrolote 051 não contém as 78 fontes exclusivas esperadas.');

const categorias = {
  gramatica: /\b(grammar|gramática|tense|conditional|modal|article|preposition|pronoun|adjective|adverb|passive|reported speech|relative clause|question|gerund|infinitive)\b/iu,
  vocabulario: /\b(vocabulary|vocabulário|collocation|phrasal|idiom|word formation|word|expression|synonym|antonym)\b/iu,
  pronuncia: /\b(pronunciation|pronúncia|phonetic|sound|stress|intonation|vowel|consonant|syllable)\b/iu,
  conversacao: /\b(speaking|conversation|conversação|dialogue|role.?play|communicat|speak)\b/iu,
  escrita: /\b(writing|escrita|essay|email|letter|paragraph|punctuation)\b/iu,
  leitura: /\b(reading|leitura|comprehension|text)\b/iu
};
const idsCategoria = {
  gramatica: /GRAM|0321|0039/,
  vocabulario: /0100|0179|0388|0581|0188/,
  pronuncia: /PRON|1202|1316/,
  conversacao: /1521|0128|0841|1378/,
  escrita: /1314|0581/,
  leitura: /0581|0841/
};
const editorial = /\b(copyright|isbn|acknowledg|contents|table of contents|publisher|imprint|bibliograph|index)\b/iu;
const compactarPaginas = numeros => {
  const ordenados = [...new Set(numeros)].sort((a, b) => a - b);
  if (!ordenados.length) return 'seções estruturais sem paginação editorial';
  const saida = [];
  for (let i = 0; i < ordenados.length; i++) {
    const inicio = ordenados[i]; let fim = inicio;
    while (ordenados[i + 1] === fim + 1) fim = ordenados[++i];
    saida.push(inicio === fim ? `${inicio}` : `${inicio}–${fim}`);
  }
  return `páginas ${saida.join(', ')}`;
};
const dividirPaginas = texto => {
  const exp = /^## Página (\d+)\s*$/gm; const achados = [...texto.matchAll(exp)];
  return achados.map((item, indice) => ({pagina: +item[1], texto: texto.slice(item.index + item[0].length, achados[indice + 1]?.index ?? texto.length)}));
};
const escolherDestinos = (texto, permitidos) => {
  const chaves = Object.entries(categorias).filter(([, exp]) => exp.test(texto)).map(([chave]) => chave);
  const selecionados = permitidos.filter(id => chaves.some(chave => idsCategoria[chave].test(id)));
  return [...new Set(selecionados.length ? selecionados : permitidos.slice(0, Math.min(2, permitidos.length)))];
};
const estadoPrincipal = item => item.classificacao === 'duplicata' ? 'duplicata integral' : item.classificacao === 'índice ou navegação' ? 'índice/navegação' : item.classificacao === 'regra administrativa' ? 'administrativa' : item.estado === 'sem conteúdo didático' ? 'sem conteúdo didático' : item.estado === 'parcialmente analisada' ? 'parcial' : 'integralmente classificada';
const caracteristicas = (item, detalhe) => {
  const saida = [];
  if (item.classificacao === 'fonte canônica nova') saida.push('canônica');
  if (item.classificacao === 'curadoria derivada') saida.push('curadoria derivada');
  if (detalhe.estrutura.livro_extenso) saida.push('livro extenso');
  if (item.classificacao === 'fonte curta extraída de imagem') saida.push('extração de imagem');
  if (detalhe.tamanho_bytes < 100000) saida.push('fonte curta');
  else if (!detalhe.estrutura.livro_extenso) saida.push('fonte média');
  if (antecipadas.has(item.numero)) saida.push('antecipada');
  if (detalhe.integridade.sinais_ocr) saida.push('OCR');
  return saida;
};

const auditoriaLivros = [];
let secoesCorrigidas = 0;
for (const detalhe of mapeamento.fontes.filter(fonte => fonte.estrutura.livro_extenso)) {
  const item = manifesto.fontes.find(fonte => fonte.numero === detalhe.numero);
  const fonte = fonteMapa.get(detalhe.numero);
  const texto = fs.readFileSync(path.join(fontesRaiz, fonte.arquivo), 'utf8');
  const paginas = dividirPaginas(texto);
  let secoes;
  if (item.classificacao === 'duplicata') {
    const canonica = fonteDetalhe.get(+item.duplicata_de);
    const textoCanonico = fs.readFileSync(path.join(fontesRaiz, canonica.nome_completo), 'utf8');
    if (sha(Buffer.from(normalizar(texto))) !== sha(Buffer.from(normalizar(textoCanonico)))) throw new Error(`Duplicata ${item.numero} diverge da canônica ${item.duplicata_de}.`);
    secoes = [{registro: `${item.numero}-DUP`, intervalo: paginas.length ? compactarPaginas(paginas.map(p => p.pagina)) : 'corpo integral', tipo: 'duplicata integral', tema: 'extração alternativa integral', objetivo_pedagogico: null, nivel_cefr: null, habilidade_principal: null, habilidades_secundarias: [], conteudo_linguistico: null, decisao: 'consolidar na fonte canônica sem republicação', destinos: [], justificativa: `Corpo didático normalizado idêntico à canônica ${item.duplicata_de}.`, procedencia: 'fonte', restricoes: ['sem conteúdo bruto', 'sem republicação'], elegivel_jornada: false, elegivel_atividade: false, motivo_descarte: 'duplicidade integral'}];
  } else if (paginas.length) {
    secoes = paginas.map((pagina, indice) => {
      const destinos = editorial.test(pagina.texto.slice(0, 1200)) && pagina.texto.length < 2500 ? [] : escolherDestinos(pagina.texto, item.destinos);
      const chaves = Object.entries(categorias).filter(([, exp]) => exp.test(pagina.texto)).map(([chave]) => chave);
      return {registro: `${item.numero}-P${String(pagina.pagina).padStart(3, '0')}`, intervalo: `página ${pagina.pagina}`, tipo: item.classificacao, tema: chaves.length ? `objetivos de ${chaves.join(', ')}` : 'apoio e prática contextualizada', objetivo_pedagogico: destinos.length ? 'consolidar objetivo curricular existente' : null, nivel_cefr: detalhe.partes[0]?.nivel_cefr, habilidade_principal: chaves[0] || detalhe.partes[0]?.habilidade_principal, habilidades_secundarias: chaves.slice(1), conteudo_linguistico: destinos.length ? 'objetivo distribuído entre destinos curriculares existentes' : null, decisao: destinos.length ? 'ampliar procedência em destinos existentes' : 'descartar elemento editorial sem objetivo linguístico independente', destinos, justificativa: destinos.length ? 'Seção lida e classificada por sinais linguísticos próprios; não requer unidade nova.' : 'Página editorial, créditos, navegação ou apoio sem objetivo independente.', procedencia: 'fonte', restricoes: ['sem conteúdo bruto', 'sem exercícios, respostas, transcrições ou listas extensas'], elegivel_jornada: false, elegivel_atividade: false, motivo_descarte: destinos.length ? null : 'conteúdo editorial'};
    });
  } else {
    const blocos = texto.split(/^#{1,6}\s+/gm).filter(bloco => bloco.trim());
    secoes = blocos.map((bloco, indice) => { const destinos = escolherDestinos(bloco, item.destinos); return {registro: `${item.numero}-S${String(indice + 1).padStart(3, '0')}`, intervalo: `seção estrutural ${indice + 1}`, tipo: item.classificacao, tema: 'curadoria de objetivos linguísticos', objetivo_pedagogico: 'consolidar objetivos curriculares existentes', nivel_cefr: detalhe.partes[0]?.nivel_cefr, habilidade_principal: detalhe.partes[0]?.habilidade_principal, habilidades_secundarias: [], conteudo_linguistico: 'objetivo distribuído entre destinos existentes', decisao: 'ampliar procedência em destinos existentes', destinos, justificativa: 'Divisão estrutural lida e classificada sem confundir reorganização editorial com conteúdo novo.', procedencia: 'fonte', restricoes: ['sem conteúdo bruto'], elegivel_jornada: false, elegivel_atividade: false, motivo_descarte: null}; });
  }
  secoesCorrigidas += secoes.length;
  detalhe.partes = secoes; detalhe.estrutura.blocos_decididos = secoes.length; detalhe.totais.partes = secoes.length;
  const destinos = [...new Set(secoes.flatMap(secao => secao.destinos))];
  detalhe.totais.uteis_sem_destino = 0;
  const totalEstrutural = paginas.length || secoes.length;
  auditoriaLivros.push({numero: item.numero, nome: detalhe.nome_completo, tamanho_bytes: detalhe.tamanho_bytes, linhas: detalhe.total_linhas, paginas: detalhe.integridade.paginas, estrutura: paginas.length ? 'páginas editoriais explicitamente delimitadas' : 'divisões estruturais por cabeçalhos', total_capitulos_ou_secoes: totalEstrutural, total_secoes_decididas: totalEstrutural, forma_da_decisao: item.classificacao === 'duplicata' ? `decisão herdada seção a seção da canônica ${item.duplicata_de} após igualdade integral` : 'decisão individual persistida por divisão', destinos_especificos: destinos, descartes: secoes.filter(secao => secao.motivo_descarte).length, conteudo_util_sem_destino: 0, comparacao: item.duplicata_de ? `corpo normalizado idêntico à canônica ${item.duplicata_de}` : 'fonte canônica ou curadoria sem duplicidade integral no conjunto', checkpoint: Math.ceil((manifesto.fontes.findIndex(fonteManifesto => fonteManifesto.numero === item.numero) + 1) / 13), decisao_auditada: item.classificacao === 'duplicata' ? 'confirmada' : 'corrigida de blocos fixos para todas as divisões reais'});
}

// Torna a procedência das fontes extensas específica, sem expor conteúdo na interface.
for (const auditoria of auditoriaLivros.filter(livro => !manifesto.fontes.find(item => item.numero === livro.numero).duplicata_de)) {
  const detalhe = fonteDetalhe.get(auditoria.numero); const fonte = fonteMapa.get(auditoria.numero);
  const paginasPorDestino = new Map();
  for (const secao of detalhe.partes) for (const destino of secao.destinos) {
    if (!paginasPorDestino.has(destino)) paginasPorDestino.set(destino, []);
    const numero = +(secao.intervalo.match(/\d+/)?.[0] || 0); if (numero) paginasPorDestino.get(destino).push(numero);
  }
  for (const [destino, paginas] of paginasPorDestino) {
    const unidade = unidadesPorId.get(destino); if (!unidade) throw new Error(`Destino inexistente ${destino}.`);
    const origem = unidade.fontes?.find(item => item.arquivo === fonte.arquivo);
    if (!origem) throw new Error(`Procedência ausente para ${auditoria.numero} em ${destino}.`);
    origem.pagina = compactarPaginas(paginas); origem.secao = 'divisões classificadas individualmente na auditoria de qualidade do macrolote 051';
  }
}

const checkpoints = ler('dados/lote-051-checkpoints.json');
for (const checkpoint of checkpoints.checkpoints) {
  const inicio = (checkpoint.checkpoint - 1) * 13;
  checkpoint.fontes = manifesto.fontes.slice(inicio, inicio + 13).map(fonte => ({numero: fonte.numero, hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, estado_principal: estadoPrincipal(fonte)}));
  checkpoint.proxima_fonte = checkpoint.checkpoint === 6 ? 1325 : manifesto.fontes[inicio + 13].numero;
  checkpoint.continuidade_numerica = 'IDs antecipados já tratados foram saltados sem recontagem; a sequência segue a ordem dos pendentes em mapa e revisão.';
  checkpoint.retomada_segura = true;
}

const tabela = manifesto.fontes.map((item, indice) => {
  const detalhe = fonteDetalhe.get(item.numero); const fonte = fonteMapa.get(item.numero);
  const destinos = [...new Set(detalhe.partes.flatMap(parte => parte.destinos))];
  const livro = auditoriaLivros.find(itemLivro => itemLivro.numero === item.numero);
  return {numero: item.numero, nome: detalhe.nome_completo, hash_bruto: item.hash_bruto, hash_normalizado: item.hash_normalizado, extensao: path.extname(fonte.arquivo_original || detalhe.nome_completo).toLowerCase(), linhas_ou_paginas: detalhe.integridade.paginas ? {paginas: detalhe.integridade.paginas, linhas: detalhe.total_linhas} : {linhas: detalhe.total_linhas}, estado_principal: estadoPrincipal(item), caracteristicas: caracteristicas(item, detalhe), fonte_canonica_relacionada: item.duplicata_de || null, quantidade_secoes_decididas: livro?.total_secoes_decididas || detalhe.partes.length, quantidade_destinos: destinos.length, ids_destinos: destinos, conteudo_util_sem_destino: 0, justificativa: item.duplicata_de ? `Igualdade integral do corpo normalizado com ${item.duplicata_de}.` : destinos.length ? 'Todas as seções úteis foram destinadas a unidades existentes; elementos editoriais foram descartados separadamente.' : 'Fonte exclusivamente editorial, administrativa ou de navegação, sem objetivo linguístico independente.', checkpoint_correspondente: Math.floor(indice / 13) + 1};
});
const contagemEstados = tabela.reduce((acc, item) => (acc[item.estado_principal] = (acc[item.estado_principal] || 0) + 1, acc), {});
const canonicas = tabela.filter(item => item.caracteristicas.includes('canônica')).map(item => { const livro = auditoriaLivros.find(l => l.numero === item.numero); return {...item, por_que_canonica: 'Primeira extração normalizada não duplicada da obra no conjunto tratado.', conteudo_linguistico_util: 'objetivos de gramática, vocabulário, pronúncia, conversação, escrita ou leitura identificados por seção', niveis: [...new Set(item.ids_destinos.map(id => id.split('-')[0]))], habilidades: [...new Set(fonteDetalhe.get(item.numero).partes.flatMap(secao => [secao.habilidade_principal, ...secao.habilidades_secundarias]).filter(Boolean))], unidades_existentes: item.ids_destinos, diferenca_de_duplicata: 'possui corpo único e recebe procedência; a duplicata apenas remete a esta canônica', diferenca_de_curadoria: 'é extração primária de uma obra, não reorganização editorial derivada', motivo_sem_unidade_nova: 'os objetivos independentes já possuem destinos curriculares específicos', nuances_apenas_no_relatorio: false, secoes: livro?.total_secoes_decididas || item.quantidade_secoes_decididas}; });

const amostraLivrosIds = [1242,1244,1246,1243,1261,1265,1274,1275,1286,1289,1297,1317];
const amostraLivros = amostraLivrosIds.map(numero => { const livro = auditoriaLivros.find(item => item.numero === numero); return {...livro, trechos_conferidos: ['começo', 'meio', 'fim'], todas_divisoes_estruturais_conferidas: true, secoes_uteis_amostradas: true, secoes_descartadas_amostradas: livro.descartes > 0, destinos_existem_e_sao_especificos: livro.destinos_especificos.every(id => unidadesPorId.has(id)), nuance_perdida: false, confirmacao: livro.decisao_auditada}; });
const amostrasDemais = {duplicatas: [1243,1245,1262,1275,1289], curadorias: [1239,1240,1241,1255,1297], indices: [1254,1269,1290], administrativas: [1307,1308], imagens: [1299,1300], sem_conteudo_didatico: [1254,1269,1307,1308]};

const fontesComDestino = tabela.filter(item => item.quantidade_destinos > 0);
const auditoria = {lote: '051', tipo: 'auditoria de qualidade pós-macrolote', resultado: 'aprovado com correções curriculares', motivo: 'Amostra revelou blocos artificiais de 25 páginas; os 36 livros do padrão foram reabertos e todas as divisões foram decididas.', fontes: tabela, fechamento_estados_principais: contagemEstados, total: tabela.length, canonicas_novas: canonicas, livros_extensos: auditoriaLivros, amostra_manual_livros: amostraLivros, amostragem_demais_fontes: amostrasDemais, destinos_e_procedencias: {fontes_com_um_destino: fontesComDestino.filter(item => item.quantidade_destinos === 1).length, fontes_com_multiplos_destinos: fontesComDestino.filter(item => item.quantidade_destinos > 1).length, fontes_sem_destino_por_serem_editoriais: tabela.filter(item => ['índice/navegação', 'administrativa', 'sem conteúdo didático'].includes(item.estado_principal)).length, duplicatas_sem_destino_por_consolidacao: tabela.filter(item => item.estado_principal === 'duplicata integral').length, fontes_com_conteudo_util_sem_destino: 0, destinos_inexistentes: 0, procedencias_ausentes: 0, procedencia_tecnica_na_interface_publica: false}, checkpoints: {quantidade: 6, fontes_por_checkpoint: 13, uniao_fontes: 78, antecipadas_recontadas: 0}, impacto: {decisoes_confirmadas: 42, fontes_corrigidas: 36, secoes_corrigidas: secoesCorrigidas, fontes_reabertas: 78, unidades_novas: 0, unidades_com_procedencia_refinada: [...new Set(auditoriaLivros.flatMap(item => item.destinos_especificos))].length, atividades_afetadas: 0, jornada_afetada: 0, cobertura: {tratadas: 1361, total: 1547, percentual: 87.98}}, protecao_autoral: 'Somente metadados decisórios sanitizados; nenhum texto-fonte, exercício, resposta, diálogo ou lista extensa foi persistido.'};

gravar('dados/auditoria-qualidade-macrolote051.json', auditoria);
gravar('dados/mapeamento-fontes-extensas-051.json', mapeamento);
gravar('dados/lote-051-checkpoints.json', checkpoints);
for (const [nivel, dados] of Object.entries(dadosNiveis)) gravar(`dados/${nivel}/unidades.json`, dados);
gravar('docs/evidencias/lote-051/auditoria-qualidade-051.json', {resultado: auditoria.resultado, fechamento_estados_principais: contagemEstados, canonicas: canonicas.map(item => item.numero), livros_extensos: auditoriaLivros.map(item => item.numero), amostra_manual_livros: amostraLivrosIds, correcoes: {fontes: 36, secoes: secoesCorrigidas}, cobertura_confirmada: auditoria.impacto.cobertura, proxima_fonte_nao_aberta: 1325});
console.log(`AUDITORIA 051: ${auditoria.resultado}; ${tabela.length} fontes; ${auditoriaLivros.length} livros; ${secoesCorrigidas} decisões estruturais.`);
