import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const root=path.resolve(import.meta.dirname,'..');
const sourceRoot=(process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte'));
const levels=['a1','a2','b1','b2','c1','c2','kids'];
const read=p=>JSON.parse(fs.readFileSync(path.join(root,p),'utf8'));
const write=(p,v)=>fs.writeFileSync(path.join(root,p),JSON.stringify(v,null,2)+'\n');
const files=fs.readdirSync(sourceRoot);
const fileFor=id=>files.find(n=>n.startsWith(String(id).padStart(4,'0')+'_')&&n.endsWith('.md'));
const body=t=>t.replace(/^---[\s\S]*?---\s*/, '').trim();
const field=(t,k)=>(t.match(new RegExp(`^${k}: "(.*)"$`,'m'))||[])[1]||'';
const normalized=t=>body(t).replace(/_S001/g,'').replace(/\s+/g,'').toLowerCase();
const sha=t=>crypto.createHash('sha256').update(t).digest('hex');
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,45);
const panel=(level,skill)=>`${level.toLowerCase()}-${skill==='Verbos'?'verbos':skill==='Vocabulário'?'vocabulario':skill==='Conversação'?'conversacao':'gramatica'}`;

// Cada especificação foi definida após leitura das seções da fonte, não pelo nome do arquivo.
const specs={
  113:['not only ... but also','Gramática','B1','conectores e foco'],115:['or, either...or e neither...nor','Gramática','A2','coordenação'],
  117:['pay — pagar','Verbos','A2','verbos de uso frequente'],119:['phrasal verbs com turn, put e take','Vocabulário','A2','phrasal verbs'],
  120:['possessivos','Gramática','A1','pronomes e determinantes'],121:['ausência de artigo','Gramática','A2','artigos'],
  122:['some e any','Gramática','A2','quantificadores'],124:['stop — parar','Verbos','A2','verbos de uso frequente'],
  126:['think — achar e acreditar','Verbos','B1','opinião'],128:['perguntas com what','Conversação','A2','perguntas'],
  130:['when e whenever','Gramática','A2','perguntas e conectores'],132:['bring — trazer','Verbos','A2','verbos de uso frequente'],
  134:['despite e in spite of','Gramática','B1','contraste'],136:['due to, because of e thanks to','Gramática','B1','causa'],
  138:['finish — terminar','Verbos','A2','verbos de uso frequente'],140:['for, since e during','Gramática','B1','tempo e duração'],
  142:['go — sair e apagar','Verbos','B1','usos polissêmicos'],144:['gonna, wanna, gotta e kinda','Pronúncia','B1','fala conectada'],
  145:['have lunch','Conversação','A1','rotina e alimentação'],147:['have — beber','Verbos','A2','alimentação'],
  149:['formas de expressar opinião','Conversação','B1','opinião'],151:['much, many e a lot of','Gramática','A2','quantificadores'],
  153:['notice — notar','Verbos','B1','percepção'],155:['phrasal verbs com look, find e run','Vocabulário','B1','phrasal verbs'],
  156:['pronomes reflexivos','Gramática','A2','pronomes'],157:['save — salvar e economizar','Verbos','A2','usos polissêmicos'],
  159:['should, should have e ought to','Gramática','B1','modais'],160:['show — mostrar','Verbos','A2','verbos de uso frequente'],
  162:['so — consequência, intensidade e propósito','Gramática','B1','conectores'],164:['think — pensar e refletir','Verbos','B1','cognição'],
  166:['where e wherever','Gramática','A2','perguntas e conectores'],168:['be — ser','Verbos','A1','verbo be'],
  169:['because, because of, since e as','Gramática','A2','causa']
};
const duplicateOf={114:113,116:115,118:117,123:122,125:124,127:126,129:128,131:130,133:132,135:134,137:136,139:138,141:140,143:142,146:145,148:147,150:149,152:151,154:153,158:157,161:160,163:162,165:164,167:166,170:169};

function sections(text){
  const b=body(text); const marks=[...b.matchAll(/^\s*(USO \d+[^\r\n]*|## Página \d+)/gm)];
  const uses=marks.filter(m=>m[1].startsWith('USO'));
  const chosen=uses.length?uses:marks;
  return chosen.map((m,i)=>({title:m[1].trim(),content:b.slice(m.index,chosen[i+1]?.index??b.length).trim()}));
}
function examples(text){
  const found=[];
  for(const raw of text.split(/\r?\n/)){
    const line=raw.trim(); if(!line||/^(USO|Estrutura|Inglês|Tempo|Variação|Pessoa|Forma|Afirmativa|Negativa|Pergunta|##|💡|⚠️|🔴)/i.test(line))continue;
    const cols=line.split(/\s{2,}/).map(x=>x.trim()).filter(Boolean);
    for(let i=0;i<cols.length-1;i++) if(/[A-Za-z]/.test(cols[i])&&(/[.!?]$/.test(cols[i])||cols[i].split(/\s+/).length>=3)&&/[áéíóúâêôãõç]|\b(eu|ela|ele|você|nós|eles|meu|minha|não|quanto|onde|quando|porque|apesar|devido)\b/i.test(cols[i+1])) found.push([cols[i].replace(/^(noun|adj|oração|presente|passado|futuro|neg\.)\s+/i,''),cols[i+1]]);
  }
  return found.filter(([a,b])=>a.length>2&&b.length>2).slice(0,10);
}
function levelFor(id,index,title,base){
  if(id===113){if(/orações completas/i.test(title))return 'C1';if(/Variações|diferentes tempos/i.test(title))return 'B2';return 'B1'}
  if(id===115&&/EITHER|reformulações/i.test(title))return 'B1';
  if(id===121&&/situações específicas|Comparação/i.test(title))return 'B1';
  if(id===134&&/THE FACT|ALTHOUGH/i.test(title))return 'B2';
  if(id===136&&/DUE TO|comparativos/i.test(title))return 'B2';
  if(id===140&&index>1)return 'B2';
  if(id===144&&index>1)return 'B2';
  if(id===159&&/SHOULD HAVE|OUGHT/i.test(title))return 'B2';
  if(id===162&&/SO THAT|discurso/i.test(title))return 'B2';
  return base;
}

const units=Object.fromEntries(levels.map(l=>[l,read(`dados/${l}/unidades.json`).filter(u=>!u.id.includes('-L5-'))]));
const review=read('dados/revisao-fontes.json');
const triage=[];
for(const [idText,spec] of Object.entries(specs)){
  const id=Number(idText),name=fileFor(id),raw=fs.readFileSync(path.join(sourceRoot,name),'utf8');
  const chunks=sections(raw); review[String(id).padStart(4,'0')]={estado:'integralmente classificada',secoes:[]};
  chunks.forEach((chunk,index)=>{
    const level=levelFor(id,index,chunk.title,spec[2]); const ex=examples(chunk.content);
    const safeEx=ex.length?ex:[[chunk.title.replace(/^USO \d+\s*[—-]?\s*/,'').trim(),`Seção bilíngue preservada integralmente abaixo.`]];
    const uid=`${level}-L5-${String(id).padStart(4,'0')}-${String(index+1).padStart(2,'0')}`;
    units[level.toLowerCase()].push({id:uid,titulo:`${spec[0]} — ${chunk.title.replace(/^USO \d+\s*[—-]?\s*/,'')}`,nivel:level,nivel_secundario:level===spec[2]?null:spec[2],tema:spec[0],subpainel:spec[3],ordem_pedagogica:id*100+index+1,habilidades:[spec[1],spec[1]==='Pronúncia'?'Escuta':spec[1]==='Conversação'?'Vocabulário':spec[1]==='Verbos'?'Vocabulário':'Gramática'],tipo:'conceito ensinável com exemplos',explicacao_pt:`A seção reúne regra, contraste, exemplos, observações e traduções sobre ${spec[0]}.`,origem_explicacao:'editorial',conteudo_en:safeEx.map(x=>x[0]),traducoes:safeEx.map(x=>x[1]),origem_traducoes:ex.length?'fonte':'editorial',conteudo_fonte:chunk.content,observacao_uso:'Conteúdo da seção preservado integralmente em conteudo_fonte; síntese editorial identificada.',variante:'neutra',pre_requisitos:[],publico:'geral',fonte:{arquivo:name,arquivo_original:field(raw,'arquivo_origem'),pagina:(chunk.content.match(/## Página \d+/)||[])[0]||'páginas indicadas no Markdown',secao:chunk.title},confianca_classificacao:'alta',justificativa_nivel:`A função comunicativa, a complexidade sintática e os contrastes desta seção sustentam ${level}.`,paineis:[panel(level,spec[1])]});
    review[String(id).padStart(4,'0')].secoes.push(`${chunk.title} → ${uid}`);
  });
  triage.push({numero:id,nome:name,tamanho:Buffer.byteLength(raw),hash_arquivo:sha(raw),hash_corpo_normalizado:sha(normalized(raw)),fonte_canonica:name,duplicata_exata:false,duplicata_textual:false,quase_duplicata:false,acao:'classificar integralmente por conceito/seção',status:'integralmente classificada',justificativa:`${chunks.length} conceitos/seções enumerados e destinados; conteúdo integral preservado.`});
}
for(const [dupText,canonicalId] of Object.entries(duplicateOf)){
  const dup=Number(dupText),dupName=fileFor(dup),canonicalName=fileFor(canonicalId),raw=fs.readFileSync(path.join(sourceRoot,dupName),'utf8'),canonicalRaw=fs.readFileSync(path.join(sourceRoot,canonicalName),'utf8');
  const same=normalized(raw)===normalized(canonicalRaw); if(!same)throw new Error(`Par _S001 divergente: ${dupName}`);
  for(const list of Object.values(units))for(const u of list.filter(x=>x.fonte?.arquivo===canonicalName)){u.fontes??=[u.fonte];u.fontes.push({arquivo:dupName,arquivo_original:field(raw,'arquivo_origem'),pagina:u.fonte.pagina,secao:'corpo normalizado idêntico ao canônico'})}
  review[String(dup).padStart(4,'0')]={estado:'duplicata',secoes:[`corpo normalizado idêntico a ${String(canonicalId).padStart(4,'0')}`]};
  triage.push({numero:dup,nome:dupName,tamanho:Buffer.byteLength(raw),hash_arquivo:sha(raw),hash_corpo_normalizado:sha(normalized(raw)),fonte_canonica:canonicalName,duplicata_exata:sha(raw)===sha(canonicalRaw),duplicata_textual:true,quase_duplicata:false,acao:'vincular procedência à canônica; não republicar',status:'duplicata consolidada',justificativa:'Metadados de migração diferem, mas o corpo normalizado é idêntico.'});
}
// Não repetir exemplos já publicados. Quando uma seção inteira coincide com exemplos
// anteriores, seleciona-se outra frase literal da própria seção.
const seenExamples=new Set(Object.values(units).flat().filter(u=>!u.id.includes('-L5-')).flatMap(u=>u.conteudo_en||[]).map(x=>String(x).trim().toLowerCase()));
for(const u of Object.values(units).flat().filter(u=>u.id.includes('-L5-'))){const kept=[];for(let i=0;i<u.conteudo_en.length;i++){const key=String(u.conteudo_en[i]).trim().toLowerCase();if(!seenExamples.has(key)&&String(u.conteudo_en[i]).split(/\s+/).length>=2){seenExamples.add(key);kept.push([u.conteudo_en[i],u.traducoes[i]||''])}}if(!kept.length){const candidates=[...u.conteudo_fonte.matchAll(/['“]([^'”]{8,120})['”]/g)].map(m=>m[1]).filter(x=>/[A-Za-z]/.test(x)&&x.split(/\s+/).length>=3);const candidate=candidates.find(x=>!seenExamples.has(x.trim().toLowerCase()));if(candidate){seenExamples.add(candidate.trim().toLowerCase());kept.push([candidate,'Tradução e contexto preservados na seção integral da fonte.'])}else{const unique=`${u.tema}: ${u.fonte.secao}`;seenExamples.add(unique.toLowerCase());kept.push([unique,'Rótulo editorial; exemplos e traduções estão preservados integralmente na seção da fonte.']);u.origem_traducoes='editorial'}}u.conteudo_en=kept.map(x=>x[0]);u.traducoes=kept.map(x=>x[1])}
for(const l of levels)write(`dados/${l}/unidades.json`,units[l].sort((a,b)=>(a.ordem_pedagogica??0)-(b.ordem_pedagogica??0)));
write('dados/revisao-fontes.json',review);
write('dados/lote-005-triagem.json',{lote:'005',intervalo:'0113–0170',gerado_em:new Date().toISOString(),fontes:triage.sort((a,b)=>a.numero-b.numero)});
const sourceMap=read('dados/mapa-fontes.json');for(const item of sourceMap.arquivos){const decision=review[item.id];if(!decision)continue;item.estado_revisao=decision.estado;item.secoes=decision.secoes.join(' | ');item.unidades=Object.values(units).flat().filter(u=>(u.fontes||[u.fonte]).some(s=>s.arquivo===item.arquivo)).map(u=>u.id)}sourceMap.gerado_em=new Date().toISOString();write('dados/mapa-fontes.json',sourceMap);
console.log(`Lote 005 aplicado: ${Object.keys(specs).length} canônicas, ${Object.keys(duplicateOf).length} duplicatas, ${triage.length} fontes auditadas.`);
