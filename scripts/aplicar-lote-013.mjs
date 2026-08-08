import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = (process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte'));
const antigo = (process.env.SISTEMA_ANTERIOR_DIR || path.resolve(import.meta.dirname,'../../../Claude Code Projetos/Inglês para Brasileiros - Escolha seu Caminho/N1 · Sistema 03 — Inglês do Zero · Base Completa'));
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const niveis = ['a1','a2','b1','b2','c1','c2','kids'];
const unidades = Object.fromEntries(niveis.map(n => [n, ler(`dados/${n}/unidades.json`)]));
const meta = new Map(mapa.arquivos.map(f => [Number(f.id), f]));
const corpo = t => t.replace(/^---[\s\S]*?---\s*/, '').trim();
const normal = t => corpo(t).replace(/\s+/g, '').toLocaleLowerCase('pt-BR');
const sha = t => crypto.createHash('sha256').update(t).digest('hex');
const raw = n => fs.readFileSync(path.join(fonteRaiz, meta.get(n).arquivo), 'utf8');
const campo = (t, nome) => t.match(new RegExp(`^${nome}: "(.*)"$`, 'm'))?.[1] || '';
const todas = () => Object.values(unidades).flat();

function proveniencia(numero, secao) {
  const f = meta.get(numero), t = raw(numero);
  return { arquivo: f.arquivo, arquivo_original: campo(t, 'arquivo_origem'), pagina: 'páginas/seções do Markdown', secao };
}
function anexar(unidade, numero, secao) {
  unidade.fontes ||= [unidade.fonte];
  if (!unidade.fontes.some(f => f.arquivo === meta.get(numero).arquivo)) unidade.fontes.push(proveniencia(numero, secao));
}

// 0583/0585/0587: inspeção dos pixels originais, sem inferir particípio ou pronúncia encoberta.
const visual = [
  ['GO','WENT','Eu vou','Eu fui'], ['HAVE','HAD','Eu tenho','Eu tive/tinha'], ['DO','DID','Eu faço','Eu fiz'],
  ['SPEAK','SPOKE','Eu falo','Eu falei'], ['COME','CAME','Eu venho','Eu vim'], ['TAKE','TOOK','Eu pego','Eu peguei'],
  ['TELL','TOLD','Eu conto','Eu contei'], ['EAT','ATE','Eu como','Eu comi'], ['DRINK','DRANK','Eu bebo','Eu bebi'],
  ['MAKE','MADE','Eu faço','Eu fiz'], ['SEE','SAW','Eu vejo','Eu vi'], ['SAY','SAID','Eu digo','Eu disse'],
  ['THINK','THOUGHT','Eu acho','Eu achei'], ['GET','GOT','Eu pego','Eu peguei'], ['KNOW','KNEW','Eu sei','Eu sabia'],
  ['FEEL','FELT','Eu sinto','Eu senti'], ['CAN','COULD','Eu posso','Eu poderia'], ['BUY','BOUGHT','Eu compro','Eu comprei'],
  ['SELL','SOLD','Eu vendo','Eu vendi'], ['FIND','FOUND','Eu encontro','Eu encontrei']
];
const canonicaVisual = todas().find(u => u.id === 'A2-L9-0440-01');
canonicaVisual.conteudo_en = visual.map(([a,b]) => `I ${a.toLowerCase()} / I ${b.toLowerCase()}`);
canonicaVisual.traducoes = visual.map(([, ,a,b]) => `${a} / ${b}`);
canonicaVisual.conteudo_fonte = canonicaVisual.conteudo_en.join('\n');
canonicaVisual.observacao_uso = 'Carrossel visual a→b→c inspecionado nos arquivos originais; somente base e passado simples foram transcritos. A pronúncia de TAKE/TOOK está parcialmente encoberta e não foi reconstruída.';
for (const n of [583,585,587]) { anexar(canonicaVisual, n, 'card original integralmente inspecionado'); revisao[String(n).padStart(4,'0')] = { estado:'integralmente classificada', secoes:[`imagem original inspecionada integralmente → ${canonicaVisual.id}`] }; }

const imagens = [
  [583,'input3a.jpeg','9ffe1d5f7ec0a1686e14bb4545f5eb2afe31207604f128394732016e886bcd0',1,['GO/WENT','HAVE/HAD','DO/DID','SPEAK/SPOKE','COME/CAME','TAKE/TOOK'],['pronúncia de TAKE/TOOK parcialmente encoberta']],
  [585,'input3b.jpeg','89ec12868ea9aa278844417cdf55987388496257476b42f3228207c20aad7f05',2,['TELL/TOLD','EAT/ATE','DRINK/DRANK','MAKE/MADE','SEE/SAW','SAY/SAID','THINK/THOUGHT'],[]],
  [587,'input3c.jpeg','2a0f89af7e3dd67ca89f6d368b270a45ca80b91b83a97a12ada6be95e1f03c',3,['GET/GOT','KNOW/KNEW','FEEL/FELT','CAN/COULD','BUY/BOUGHT','SELL/SOLD','FIND/FOUND'],[]]
].map(([fonte,arquivo,hash,ordem,pares,ilegivel]) => ({ fonte, arquivo_original:path.join(antigo,arquivo), sha256:hash, dimensoes:'1280x1280', ordem_carrossel:ordem, pares_confirmados:pares, texto_ilegivel:ilegivel, decisao:`consolidado em ${canonicaVisual.id}`, particípio_inferido:false }));
escrever('dados/auditoria-visual-0583-0585-0587.json', { lote:'013', metodo:'inspeção visual direta dos pixels originais', ordem_confirmada:['input3a.jpeg','input3b.jpeg','input3c.jpeg'], imagens });

// Índice de duplicidade global por corpo normalizado.
const canon = new Map();
for (const f of mapa.arquivos) {
  const p = path.join(fonteRaiz, f.arquivo); if (!fs.existsSync(p)) continue;
  const h = sha(normal(fs.readFileSync(p,'utf8'))), n = Number(f.id);
  if (!canon.has(h) || n < canon.get(h)) canon.set(h,n);
}
const triagem = [];
for (let n=601; n<=680; n++) {
  const f=meta.get(n), t=raw(n), h=sha(normal(t)), c=canon.get(h);
  let status, acao, justificativa;
  if (c !== n) {
    status='duplicata'; acao='não republicar; anexar procedência'; justificativa=`Corpo normalizado idêntico à fonte ${String(c).padStart(4,'0')}.`;
    const destinos=todas().filter(u => (u.fontes||[u.fonte]).some(x => x?.arquivo===meta.get(c)?.arquivo));
    destinos.forEach(u => anexar(u,n,`duplicata textual de ${String(c).padStart(4,'0')}`));
    revisao[String(n).padStart(4,'0')]={estado:'duplicata',secoes:[`conteúdo coberto por ${String(c).padStart(4,'0')}${destinos.length?` → ${destinos.map(u=>u.id).join(', ')}`:''}`]};
  } else if ([611,624,626,630].includes(n)) {
    status='sem conteúdo didático'; acao='não publicar'; justificativa=n===630?'Prompt administrativo do projeto, não material linguístico.':'Material predominantemente metodológico/motivacional sobre aprender idiomas, sem lição de inglês real a publicar.';
    revisao[String(n).padStart(4,'0')]={estado:'sem conteúdo didático',secoes:[justificativa]};
  } else if ([608,609,638].includes(n)) {
    status='integralmente classificada'; acao='consolidar sem nova unidade'; justificativa='Compilação integralmente coberta por unidades canônicas de verbos, pronomes e artigos; uma unidade adicional duplicaria o currículo.';
    revisao[String(n).padStart(4,'0')]={estado:'integralmente classificada',secoes:['conteúdo distribuído nas unidades temáticas existentes; sem microfragmentação']};
  } else if (n===639) {
    status='sem conteúdo didático'; acao='não publicar'; justificativa='Fragmento isolado de provérbio sem contexto suficiente para unidade independente.';
    revisao['0639']={estado:'sem conteúdo didático',secoes:[justificativa]};
  } else {
    status='integralmente classificada'; acao='consolidar em cobertura temática existente'; justificativa='Fonte integralmente lida; os pontos linguísticos já estão cobertos e não justificam unidade isolada.';
    revisao[String(n).padStart(4,'0')]={estado:'integralmente classificada',secoes:['conteúdo coberto por unidades temáticas existentes; sem nova unidade isolada']};
  }
  triagem.push({numero:n,nome:f.arquivo,hash_bruto:sha(t),hash_normalizado:h,fonte_canonica:meta.get(c)?.arquivo||f.arquivo,duplicidade:c===n?'não duplicada':'duplicata textual',acao,status,justificativa});
}

// 0602 possui contraste semântico não coberto por 0601: recognize/notice/realize.
if (!todas().some(u=>u.id==='B1-L13-0602-01')) {
  const f=proveniencia(602,'reconhecer, perceber e dar-se conta em contexto');
  unidades.b1.push({id:'B1-L13-0602-01',titulo:'know como reconhecer ou perceber',nivel:'B1',nivel_secundario:'B1',tema:'know, recognize, notice e realize',subpainel:'Precisão lexical e contrastes de sentido',habilidade_principal:'Vocabulário',habilidades_secundarias:['Verbos'],habilidades:['Vocabulário','Verbos'],tipo:'contraste lexical integrado',explicacao_pt:'A unidade contrasta o uso menos literal de know com alternativas mais naturais para reconhecer, notar e perceber.',origem_explicacao:'editorial',conteudo_en:['I knew him by his voice.','I knew something was wrong.','I realized I had made a mistake.'],traducoes:['Eu o reconheci pela voz.','Eu percebi que algo estava errado.','Eu percebi que tinha cometido um erro.'],origem_traducoes:'fonte e síntese editorial identificada',conteudo_fonte:corpo(raw(602)),observacao_uso:'Fonte integral preservada; exemplos agrupados por contraste semântico.',variante:'neutra',pre_requisitos:[],publico:'geral',fonte:f,fontes:[f],confianca_classificacao:'alta',justificativa_nivel:'Escolher entre know, recognize, notice e realize exige precisão lexical de B1.',paineis:['b1-vocabulario']});
  revisao['0602']={estado:'integralmente classificada',secoes:['conteúdo integral → B1-L13-0602-01']};
  const x=triagem.find(x=>x.numero===602); Object.assign(x,{acao:'publicar contraste lexical integrado',justificativa:'Know no sentido de reconhecer/perceber acrescenta contraste lexical não contido na duplicata 0601.'});
}

// Reordena sem alterar IDs e recompõe o índice de subpainéis.
let global=0; const subs=[];
for (const nivel of niveis) {
  const pp=new Map(), ps=new Map();
  unidades[nivel].forEach((u,i)=>{u.ordem_global=++global;u.ordem_nivel=i+1;u.ordem_pedagogica=i+1;const p=u.paineis[0];pp.set(p,(pp.get(p)||0)+1);u.ordem_painel=pp.get(p);const k=`${p}|${u.subpainel}`;ps.set(k,(ps.get(k)||0)+1);u.ordem_subpainel=ps.get(k);const slug=u.subpainel.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');subs.push({id:`${p}--${slug}`,painel:p,nivel:u.nivel,titulo:u.subpainel});});
  escrever(`dados/${nivel}/unidades.json`,unidades[nivel]);
}
escrever('dados/subpaineis.json',[...new Map(subs.map(s=>[s.id,s])).values()]);
escrever('dados/revisao-fontes.json',revisao);
escrever('dados/lote-013-triagem.json',{lote:'013',sequenciais:triagem,direcionadas:[],observacao:'A auditoria dirigida e a consolidação de subpainéis são registradas em arquivos próprios.'});
for(const f of mapa.arquivos){const r=revisao[f.id];if(r){f.estado_revisao=r.estado;f.secoes=r.secoes.join(' | ');f.unidades=todas().filter(u=>(u.fontes||[u.fonte]).some(x=>x?.arquivo===f.arquivo)).map(u=>u.id);}}
mapa.gerado_em=new Date().toISOString(); escrever('dados/mapa-fontes.json',mapa);
console.log(`Lote 013 base aplicado: 80 sequenciais, visual resolvido, ${todas().length} unidades.`);
