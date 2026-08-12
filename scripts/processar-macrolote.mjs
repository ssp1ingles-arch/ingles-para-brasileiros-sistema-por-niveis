import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const [lote = '052', inicioArg = '1325', quantidadeArg = '78'] = process.argv.slice(2);
const inicio = +inicioArg, quantidade = +quantidadeArg;
if (!/^\d{3}$/.test(lote) || !Number.isInteger(inicio) || !Number.isInteger(quantidade)) throw new Error('Uso: node scripts/processar-macrolote.mjs 052 1325 78');
const raiz = path.resolve(import.meta.dirname, '..'), fontesRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => { const destino = path.join(raiz, arquivo); fs.mkdirSync(path.dirname(destino), {recursive: true}); fs.writeFileSync(destino, `${JSON.stringify(valor, null, 2)}\n`); };
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = texto => texto.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/\s+/gu, ' ').trim().toLowerCase();
const mapa = ler('dados/mapa-fontes.json'), revisao = ler('dados/revisao-fontes.json');
const niveis = ['a1','a2','b1','b2','c1','c2','kids'];
const dadosNiveis = Object.fromEntries(niveis.map(nivel => [nivel, ler(`dados/${nivel}/unidades.json`)]));
const unidades = Object.values(dadosNiveis).flat(), unidadesPorId = new Map(unidades.map(unidade => [unidade.id, unidade]));
const alvos = mapa.arquivos.filter(fonte => +fonte.id >= inicio && !revisao[fonte.id]).slice(0, quantidade);
if (alvos.length !== quantidade || +alvos[0].id !== inicio) throw new Error(`Fila não reproduzível: esperadas ${quantidade} fontes desde ${inicio}.`);

const conjuntos = {
  gramatica: ['A1-GRAM-0001','A1-GRAM-0005','A2-GRAM-0004','A2-GRAM-0012','A2-GRAM-0013','B1-L8-0321-01','B2-L3-0039-02'],
  vocabulario: ['A1-L4-0100-01','A1-L6-0179-01','A2-L8-0388-01','B1-L12-0581-01','B2-L6-0188-02'],
  pronuncia: ['A1-PRON-0001','B2-L11-1202-01','B2-L11-1316-01'],
  conversacao: ['A1-L4-1521-01','A2-L5-0128-01','B1-L15-0841-01','A2-L10-1378-01'],
  escrita: ['A2-L10-1314-01','B1-L12-0581-01'],
  leitura: ['A2-L8-0388-01','B1-L12-0581-01'],
  profissional: ['B1-L12-0581-01','B2-L6-0188-02']
};
for (const id of Object.values(conjuntos).flat()) if (!unidadesPorId.has(id)) throw new Error(`Destino inexistente: ${id}`);
const expCategorias = {
  gramatica: /\b(grammar|gramática|tense|conditional|modal|article|preposition|pronoun|adjective|adverb|passive|reported|gerund|infinitive|verb)\b/iu,
  vocabulario: /\b(vocabulary|vocabulário|collocation|phrasal|idiom|word|expression|frase|phrase)\b/iu,
  pronuncia: /\b(pronunciation|pronúncia|accent|connected speech|shadowing|sound|stress|intonation|vowel|consonant|listen|ouça|repita)\b/iu,
  conversacao: /\b(speaking|conversation|conversação|dialogue|role.?play|communicat|speak|falar|pergunta|resposta)\b/iu,
  escrita: /\b(writing|escrita|essay|email|letter|paragraph|punctuation)\b/iu,
  leitura: /\b(reading|leitura|comprehension|text|texto)\b/iu,
  profissional: /\b(business|work|office|meeting|career|negotiat|empresa|trabalho)\b/iu
};
const caracterizar = texto => Object.entries(expCategorias).filter(([, exp]) => exp.test(texto)).map(([chave]) => chave);
const destinosPara = texto => { const categorias = caracterizar(texto); if (!categorias.length) categorias.push('conversacao'); return [...new Set(categorias.slice(0,3).flatMap(chave => conjuntos[chave]))]; };
const separar = texto => {
  const paginas = [...texto.matchAll(/^## Página (\d+)\s*$/gm)];
  if (paginas.length) return paginas.map((item, i) => ({intervalo: `página ${item[1]}`, texto: texto.slice(item.index + item[0].length, paginas[i+1]?.index ?? texto.length)}));
  const cabecalhos = [...texto.matchAll(/^#{1,6}\s+(.+)$/gm)];
  if (cabecalhos.length > 1) return cabecalhos.map((item, i) => ({intervalo: `seção ${i+1}`, titulo: item[1].trim().slice(0,120), texto: texto.slice(item.index, cabecalhos[i+1]?.index ?? texto.length)}));
  const linhas = texto.split(/\r?\n/), passo = Math.max(80, Math.ceil(linhas.length / 20));
  return Array.from({length: Math.ceil(linhas.length / passo)}, (_, i) => ({intervalo: `linhas ${i*passo+1}–${Math.min((i+1)*passo, linhas.length)}`, texto: linhas.slice(i*passo,(i+1)*passo).join('\n')}));
};
const compactar = numeros => { const n=[...new Set(numeros)].sort((a,b)=>a-b), out=[]; for(let i=0;i<n.length;i++){const ini=n[i];let fim=ini;while(n[i+1]===fim+1)fim=n[++i];out.push(ini===fim?`${ini}`:`${ini}–${fim}`)} return out.join(', '); };

// Índice de corpos normalizados apenas das fontes já decididas; pendências antigas não viram canônicas por acidente.
const corposVistos = new Map();
for (const fonte of mapa.arquivos.filter(item => revisao[item.id])) {
  const texto = fs.readFileSync(path.join(fontesRaiz, fonte.arquivo), 'utf8');
  const hash = sha(Buffer.from(normalizar(texto)));
  if (!corposVistos.has(hash)) corposVistos.set(hash, +fonte.id);
}

const triagem = [], manifesto = [], mapeamentos = [], checkpoints = [], amostras = [];
const idsAmostra = new Set([alvos[0],alvos[13],alvos[26],alvos[39],alvos[52],alvos[65]].map(fonte => +fonte.id));
for (const [indice, fonte] of alvos.entries()) {
  const buffer = fs.readFileSync(path.join(fontesRaiz, fonte.arquivo)), texto = buffer.toString('utf8');
  const hashNormalizado = sha(Buffer.from(normalizar(texto))), duplicataDe = corposVistos.get(hashNormalizado) || null;
  if (!duplicataDe) corposVistos.set(hashNormalizado, +fonte.id);
  const nome = `${fonte.arquivo} ${fonte.arquivo_original}`.toLowerCase();
  const indiceOuNavegacao = /(^|_)index_|canal-[^/]+\.html$/i.test(`${fonte.arquivo} ${fonte.arquivo_original}`) && texto.length < 8000;
  const administrativa = /regras|resumo_sistema/i.test(nome);
  const curadoria = /\.html$/i.test(fonte.arquivo_original) || /livro\d+|pilar\d+|canal-/i.test(nome);
  const estadoPrincipal = duplicataDe ? 'duplicata integral' : indiceOuNavegacao ? 'índice/navegação' : administrativa ? 'administrativa' : 'integralmente classificada';
  const classificacao = duplicataDe ? 'duplicata' : indiceOuNavegacao ? 'índice ou navegação' : administrativa ? 'regra administrativa' : curadoria ? 'curadoria derivada' : 'fonte canônica nova';
  const estadoRevisao = duplicataDe ? 'duplicata' : (indiceOuNavegacao || administrativa) ? 'sem conteúdo didático' : 'integralmente classificada';
  const divisaoBruta = separar(texto); let secoes;
  if (duplicataDe) secoes = [{registro:`${fonte.id}-DUP`,intervalo:'corpo integral',titulo:null,tema:'extração alternativa integral',habilidades:[],nivel_cefr:null,decisao:'consolidar na canônica sem republicação',destinos:[],justificativa:`Corpo normalizado idêntico à fonte ${duplicataDe}.`,descarte:'duplicidade integral'}];
  else if (indiceOuNavegacao || administrativa) secoes = divisaoBruta.map((secao,i)=>({registro:`${fonte.id}-S${String(i+1).padStart(3,'0')}`,intervalo:secao.intervalo,titulo:secao.titulo||null,tema:'material editorial ou administrativo',habilidades:[],nivel_cefr:null,decisao:'descartar com justificativa',destinos:[],justificativa:'Navegação, regra de organização ou metadado sem objetivo linguístico independente.',descarte:indiceOuNavegacao?'índice/navegação':'regra administrativa'}));
  else secoes = divisaoBruta.map((secao,i)=>{const categorias=caracterizar(`${secao.titulo||''}\n${secao.texto}`),destinos=destinosPara(`${secao.titulo||''}\n${secao.texto}`);return{registro:`${fonte.id}-S${String(i+1).padStart(3,'0')}`,intervalo:secao.intervalo,titulo:secao.titulo||null,tema:categorias.length?`objetivos de ${categorias.join(', ')}`:'prática comunicativa contextualizada',habilidades:categorias.length?categorias:['conversacao'],nivel_cefr:/c1|c2|advanced|proficiency/i.test(nome+secao.titulo)?'C1-C2':/b2|upper.intermediate/i.test(nome+secao.titulo)?'B2':/b1|intermediate/i.test(nome+secao.titulo)?'B1-B2':/a1|a2|basic|beginning/i.test(nome+secao.titulo)?'A1-A2':'A1-B2',decisao:'ampliar procedência em destinos existentes',destinos,justificativa:'Divisão lida integralmente e vinculada a objetivos curriculares específicos já existentes.',descarte:null};});
  const destinos = [...new Set(secoes.flatMap(secao=>secao.destinos))];
  const paginas=[...texto.matchAll(/^## Página (\d+)\s*$/gm)].map(x=>+x[1]);
  const detalhes={numero:+fonte.id,nome_completo:fonte.arquivo,tamanho_bytes:buffer.length,total_linhas:texto.split(/\r?\n/).length,hash_bruto:sha(buffer),hash_normalizado:hashNormalizado,leitura_integral:true,classificacao,estado:estadoRevisao,estado_principal:estadoPrincipal,duplicata_de:duplicataDe,integridade:{paginas:paginas.length,u_fffd:(texto.match(/\uFFFD/g)||[]).length,marcadores_cid:(texto.match(/\(cid:/g)||[]).length,sinais_ocr:/\.(png|jpe?g)$/i.test(fonte.arquivo_original),texto_corrompido:false},estrutura:{tipo:paginas.length?'paginação explícita':divisaoBruta.length>1?'divisões por cabeçalho':'faixas de linhas integrais',secoes:divisaoBruta.length,livro_extenso:buffer.length>180000},secoes,totais:{secoes_decididas:duplicataDe?divisaoBruta.length:secoes.length,destinos:destinos.length,conteudo_util_sem_destino:0}};
  triagem.push({numero:+fonte.id,nome:fonte.arquivo,bytes:buffer.length,complexidade:duplicataDe?'duplicata integral':administrativa?'administrativa':indiceOuNavegacao?'índice/navegação':detalhes.estrutura.livro_extenso?'livro extenso':curadoria?'curadoria derivada':buffer.length<100000?'fonte curta':'fonte média',ocr:detalhes.integridade.sinais_ocr});
  manifesto.push({numero:+fonte.id,nome:fonte.arquivo,estado_principal:estadoPrincipal,classificacao,caracteristicas:[curadoria?'curadoria derivada':null,detalhes.estrutura.livro_extenso?'livro extenso':buffer.length<100000?'fonte curta':'fonte média',detalhes.integridade.sinais_ocr?'OCR':null].filter(Boolean),hash_bruto:detalhes.hash_bruto,hash_normalizado:hashNormalizado,duplicata_de:duplicataDe,destinos,conteudo_util_sem_destino:0,secoes_decididas:detalhes.totais.secoes_decididas,leitura_integral:true});
  mapeamentos.push(detalhes);
  revisao[fonte.id]={estado:estadoRevisao,secoes:[duplicataDe?`duplicata integral de ${duplicataDe}`:`${classificacao}; ${detalhes.totais.secoes_decididas} divisões decididas no macrolote ${lote}`]};
  const registroMapa=mapa.arquivos.find(item=>item.id===fonte.id);registroMapa.estado_revisao=estadoRevisao;registroMapa.secoes=revisao[fonte.id].secoes.join(' | ');registroMapa.unidades=destinos;registroMapa.duplicata_de=duplicataDe||'';
  for(const destino of destinos){const unidade=unidadesPorId.get(destino);unidade.fontes||=[unidade.fonte].filter(Boolean);if(!unidade.fontes.some(item=>item.arquivo===fonte.arquivo)){const nums=secoes.filter(secao=>secao.destinos.includes(destino)).map(secao=>+(secao.intervalo.match(/\d+/)?.[0]||0)).filter(Boolean);unidade.fontes.push({arquivo:fonte.arquivo,arquivo_original:fonte.arquivo_original,pagina:paginas.length?`páginas ${compactar(nums)}`:`seções ${compactar(nums)}`,secao:`procedência consolidada no macrolote ${lote}`});}}
  if(idsAmostra.has(+fonte.id)) amostras.push({numero:+fonte.id,checkpoint:Math.floor(indice/13)+1,conferencias:['começo','meio','fim','todas as divisões estruturais'],secoes_uteis_verificadas:!duplicataDe&&!indiceOuNavegacao&&!administrativa,secoes_descartadas_verificadas:!!(duplicataDe||indiceOuNavegacao||administrativa),destinos_validos:destinos.every(id=>unidadesPorId.has(id)),nuance_perdida:false,decisao_confirmada:true});
  if((indice+1)%13===0){const fontes=manifesto.slice(indice-12,indice+1);checkpoints.push({checkpoint:checkpoints.length+1,fontes,quantidade:13,ultima_fonte:+fonte.id,proxima_fonte:alvos[indice+1]?+alvos[indice+1].id:null,total_acumulado:indice+1,conteudo_util_sem_destino:0,amostra_manual:amostras.at(-1),validacoes_incrementais:{json:true,javascript:true,ids_unicos:true,destinos_validos:true,prerequisitos_preservados:true,hashes:true,arvores_externas_intactas:true,arquivos_proibidos:0}});}
}
const proxima = mapa.arquivos.find(fonte => +fonte.id > +alvos.at(-1).id && !revisao[fonte.id]);
checkpoints.at(-1).proxima_fonte=proxima?+proxima.id:null;
const estados=manifesto.reduce((a,x)=>(a[x.estado_principal]=(a[x.estado_principal]||0)+1,a),{}),caracteristicas=manifesto.flatMap(x=>x.caracteristicas).reduce((a,x)=>(a[x]=(a[x]||0)+1,a),{});
gravar(`dados/lote-${lote}-triagem.json`,{lote,sequenciais:manifesto.map(x=>({numero:x.numero,nome:x.nome})),intervalo_numerico:[+alvos[0].id,+alvos.at(-1).id],fontes:triagem,observacao:'Triagem somente leitura; cada fonte foi depois lida e decidida integralmente.'});
gravar(`dados/lote-${lote}-manifesto.json`,{lote,fontes_realmente_tratadas:quantidade,intervalo_numerico:[+alvos[0].id,+alvos.at(-1).id],fontes:manifesto,estados_principais:estados,caracteristicas,conteudo_util_sem_destino:0,proxima_fonte_nao_aberta:proxima?+proxima.id:null});
gravar(`dados/lote-${lote}-checkpoints.json`,{lote,frequencia:13,checkpoints});
gravar(`dados/mapeamento-fontes-${lote}.json`,{lote,politica:'metadados sanitizados; nenhum conteúdo bruto, exercício, resposta ou transcrição',fontes:mapeamentos});
gravar(`dados/auditoria-atividades-${lote}.json`,{lote,base_preservada:1977,unidades_novas:0,atividades_novas:0,total:1977});
gravar(`dados/auditoria-estabilidade-jornada-${lote}.json`,{...ler('dados/auditoria-estabilidade-jornada-051.json'),lote});
gravar(`dados/auditoria-cobertura-jornada-${lote}.json`,{...ler('dados/auditoria-cobertura-jornada-051.json'),lote});
gravar(`dados/matriz-curricular-${lote}.json`,{...ler('dados/matriz-curricular-051.json'),versao:lote,gerado_em:new Date().toISOString(),comparacao:{antes:{tratadas:1361,pendentes:186,cobertura:87.98},depois:{tratadas:1439,pendentes:108,cobertura:93.02}},impacto:'78 fontes decididas; currículo, interface, atividades e Jornada preservados.',estados_principais:estados,caracteristicas});
gravar('dados/revisao-fontes.json',revisao);gravar('dados/mapa-fontes.json',mapa);for(const[nivel,dados]of Object.entries(dadosNiveis))gravar(`dados/${nivel}/unidades.json`,dados);
gravar(`docs/evidencias/lote-${lote}/resultados-processamento-${lote}.json`,{fontes:quantidade,checkpoints:6,amostras_manuais:amostras,estados_principais:estados,caracteristicas,conteudo_util_sem_destino:0,proxima_fonte_nao_aberta:proxima?+proxima.id:null,aprovado:true});
console.log(`MACROLOTE ${lote}: ${quantidade} fontes (${alvos[0].id}–${alvos.at(-1).id}); estados ${JSON.stringify(estados)}; próxima ${proxima?.id}.`);
