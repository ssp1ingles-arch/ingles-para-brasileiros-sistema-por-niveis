import fs from 'node:fs';import path from 'node:path';import crypto from 'node:crypto';const raiz=path.resolve(import.meta.dirname,'..'),src=(process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte'));
const ler=a=>JSON.parse(fs.readFileSync(path.join(raiz,a),'utf8')),ns=['a1','a2','b1','b2','c1','c2','kids'],u=ns.flatMap(n=>ler(`dados/${n}/unidades.json`)),a=ler('dados/atividades.json'),t=ler('dados/lote-013-triagem.json'),d=ler('dados/auditoria-dirigida-013.json'),v=ler('dados/auditoria-visual-0583-0585-0587.json'),s=ler('dados/subpaineis.json'),p=ler('dados/paineis.json'),r=ler('dados/revisao-fontes.json'),m=ler('dados/mapa-fontes.json');
const out=[];function ok(nome,cond,det=''){out.push({teste:nome,resultado:cond?'APROVADO':'FALHOU',detalhe:det});if(!cond)throw Error(`${nome}: ${det}`)}
ok('80 fontes sequenciais',t.sequenciais.length===80&&t.sequenciais[0].numero===601&&t.sequenciais.at(-1).numero===680);
ok('12 fontes dirigidas únicas',d.quantidade===12&&new Set(d.fontes.map(x=>x.numero)).size===12);
ok('visual completo e em ordem',v.imagens.length===3&&v.imagens.every((x,i)=>x.ordem_carrossel===i+1&&!x.particípio_inferido));
ok('parciais visuais resolvidas',[583,585,587].every(n=>r[String(n).padStart(4,'0')].estado==='integralmente classificada'));
ok('IDs de unidade únicos',new Set(u.map(x=>x.id)).size===u.length,String(u.length));ok('IDs de atividade únicos',new Set(a.map(x=>x.id)).size===a.length,String(a.length));
ok('todas as unidades apontam para painel existente',u.every(x=>p.some(y=>y.id===x.paineis[0])));
ok('subpainéis consolidados',s.length<=96,`${s.length}`);ok('compatibilidade registrada',Object.keys(ler('dados/compatibilidade-subpaineis-013.json').aliases).length>=17);
ok('novas unidades têm atividade',u.filter(x=>x.id.includes('-L13-')).every(x=>a.some(y=>y.unidade_id===x.id)));
ok('sem lacuna ambígua',a.every(x=>x.tipo!=='completar_lacuna'));
ok('Kids tem CEFR',ler('dados/kids/unidades.json').every(x=>x.nivel_cefr));ok('C2 tem justificativa',ler('dados/c2/unidades.json').every(x=>x.justificativa_c2));
ok('fontes originais preservadas por hash',[...t.sequenciais,...d.fontes].every(x=>{const q=path.join(src,x.nome);return fs.existsSync(q)&&crypto.createHash('sha256').update(fs.readFileSync(q)).digest('hex')===x.hash_bruto}));
ok('mapa reflete revisão',m.arquivos.filter(x=>r[x.id]).every(x=>x.estado_revisao===r[x.id].estado));
const prog=fs.readFileSync(path.join(raiz,'docs/PROGRESSO.md'),'utf8');ok('um bloco atual automático',(prog.match(/<!-- ESTADO-ATUAL:INICIO -->/g)||[]).length===1);ok('Retomada manual removida',!/^## Retomada$/m.test(prog));
const payload={total:out.length,aprovados:out.filter(x=>x.resultado==='APROVADO').length,resultados:out};fs.writeFileSync(path.join(raiz,'docs/evidencias/lote-013/resultados-validacao-013.json'),JSON.stringify(payload,null,2)+'\n');console.log(`LOTE 013: ${payload.aprovados}/${payload.total}`);
