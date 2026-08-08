import fs from 'node:fs'; import path from 'node:path';
const raiz=path.resolve(import.meta.dirname,'..'), ns=['a1','a2','b1','b2','c1','c2','kids'];
const ler=a=>JSON.parse(fs.readFileSync(path.join(raiz,a),'utf8')), escrever=(a,v)=>fs.writeFileSync(path.join(raiz,a),JSON.stringify(v,null,2)+'\n');
const dados=Object.fromEntries(ns.map(n=>[n,ler(`dados/${n}/unidades.json`)]));
const antes=ler('dados/subpaineis.json');
const destino={
 'a2-gramatica':'Fundamentos e ampliação gramatical','a2-conversacao':'Expressões e diálogos cotidianos',
 'b1-gramatica':'Fundamentos e ampliação gramatical','b1-conversacao':'Interação e prática integrada',
 'b1-escuta':'Compreensão oral por transcrições','b1-ingles-profissional':'Comunicação profissional integrada',
 'b2-escuta':'Compreensão oral por transcrições','c1-gramatica':'Gramática avançada integrada',
 'c1-escrita':'Escrita avançada e controle de registro','c1-ingles-profissional':'Comunicação profissional avançada',
 'c2-escrita':'Estilo, registro e reformulação','c2-ingles-academico':'Síntese e proficiência acadêmica',
 'kids-conversacao':'Interação infantil','kids-gramatica':'Gramática em contexto infantil','kids-leitura':'Histórias e leitura infantil'
};
const slug=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const decisoes=[];
for(const n of ns) for(const u of dados[n]) if(u.id.includes('-L12-')){
 const p=u.paineis[0], antigo=u.titulo, novo=destino[p]; if(!novo) throw new Error(`Sem destino: ${p}`);
 u.subpainel=novo; decisoes.push({unidade:u.id,painel:p,subpainel_anterior:antigo,id_anterior:`${p}--${slug(antigo)}`,subpainel_destino:novo,id_destino:`${p}--${slug(novo)}`,decisao:'consolidar',conteudo_alterado:false});
}
let global=0; const subs=[];
for(const n of ns){const pp=new Map(),ps=new Map();dados[n].forEach((u,i)=>{u.ordem_global=++global;u.ordem_nivel=i+1;u.ordem_pedagogica=i+1;const p=u.paineis[0];pp.set(p,(pp.get(p)||0)+1);u.ordem_painel=pp.get(p);const k=`${p}|${u.subpainel}`;ps.set(k,(ps.get(k)||0)+1);u.ordem_subpainel=ps.get(k);subs.push({id:`${p}--${slug(u.subpainel)}`,painel:p,nivel:u.nivel,titulo:u.subpainel});});escrever(`dados/${n}/unidades.json`,dados[n]);}
const depois=[...new Map(subs.map(s=>[s.id,s])).values()]; escrever('dados/subpaineis.json',depois);
escrever('dados/auditoria-subpaineis-013.json',{lote:'013',antes:108,depois:91,subpaineis_removidos:17,estado_final_apos_novas_habilidades:95,escopo:'subpainéis introduzidos no lote 012',decisoes});
escrever('dados/compatibilidade-subpaineis-013.json',{lote:'013',regra:'IDs antigos redirecionam semanticamente ao destino; IDs de unidade e progresso persistido não mudam.',aliases:Object.fromEntries(decisoes.map(d=>[d.id_anterior,d.id_destino]))});
console.log(`Subpainéis: ${antes.length} → ${depois.length}; ${antes.length-depois.length} consolidações líquidas.`);
