import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fonteRaiz = (process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte'));
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
if (revisao['0602']?.secoes?.some(secao => secao.includes('B1-L12-0602'))) delete revisao['0602'];
const paineis = ler('dados/paineis.json');
const dados = Object.fromEntries(niveis.map(nivel => [nivel, ler(`dados/${nivel}/unidades.json`).filter(unidade => !unidade.id.includes('-L12-'))]));
const meta = new Map(mapa.arquivos.map(fonte => [Number(fonte.id), fonte]));
const bruto = numero => fs.readFileSync(path.join(fonteRaiz, meta.get(numero).arquivo), 'utf8');
const corpo = texto => texto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normal = texto => corpo(texto).replace(/\s+/g, '').toLocaleLowerCase('pt-BR');
const hash = texto => crypto.createHash('sha256').update(texto).digest('hex');
const campo = (texto, nome) => texto.match(new RegExp(`^${nome}: "(.*)"$`, 'm'))?.[1] || '';
const hashCanonico = new Map();
for (const fonte of mapa.arquivos) {
  const arquivo = path.join(fonteRaiz, fonte.arquivo);
  if (!fs.existsSync(arquivo)) continue;
  const chave = hash(normal(fs.readFileSync(arquivo, 'utf8')));
  if (!hashCanonico.has(chave)) hashCanonico.set(chave, Number(fonte.id));
}

const specs = [
  [559, 'A2', 'passado de be em contexto', 'Gramática', ['I was happy yesterday.', 'I was at home all day.', 'I was hungry after work.'], 'A2'],
  [563, 'A2', "can't wait — expectativa", 'Conversação', ["I can't wait to see you.", "I can't wait for the weekend.", "I can't wait to start my new job."], 'A2'],
  [567, 'A2', 'should para conselhos pessoais', 'Gramática', ['I should study more.', 'I should call my parents.', 'I should drink more water.'], 'A2'],
  [571, 'A2', "I'd like — pedidos e desejos", 'Conversação', ["I'd like a cup of coffee, please.", "I'd like to book a hotel room.", "I'd like to speak to the manager."], 'A2'],
  [575, 'A2', 'May I...? — pedir permissão', 'Conversação', ['May I help you?', 'May I borrow your pen?', 'May I see the menu, please?'], 'A2'],
  [577, 'B1', 'continuous: presente, passado e futuro', 'Gramática', ['I am reading a book now.', 'I was reading a book yesterday.', 'I will be reading a book tomorrow.'], 'B1'],
  [579, 'A2', 'simple: presente, passado e futuro', 'Gramática', ['I play football every day.', 'I played football yesterday.', 'I will play football tomorrow.'], 'A2'],
  [581, 'B1', 'perfect: presente, passado e futuro', 'Gramática', ['I have finished my homework.', 'I had finished my homework before dinner.', 'I will have finished my homework by tomorrow.'], 'B2'],
  [589, 'B1', 'respostas básicas e naturais em conversa', 'Conversação', ["I'm doing great.", 'I work as a teacher.', 'Got it. / Makes sense.', "I'm heading to the market.", "I'd be glad to help."], 'B1', [591, 593]]
];

function painel(nivel, habilidade) {
  const sufixo = habilidade === 'Conversação' ? 'conversacao' : habilidade === 'Verbos' ? 'verbos' : habilidade === 'Escuta' ? 'escuta' : habilidade === 'Leitura' ? 'leitura' : habilidade === 'Escrita' ? 'escrita' : habilidade === 'Inglês profissional' ? 'ingles-profissional' : habilidade === 'Inglês acadêmico' ? 'ingles-academico' : 'gramatica';
  return `${nivel.toLowerCase()}-${sufixo}`;
}

function unidade(numero, nivel, titulo, habilidade, exemplos, secundario = nivel, extras = [], opcoes = {}) {
  const fonte = meta.get(numero), raw = bruto(numero);
  const id = `${nivel}-L12-${String(numero).padStart(4, '0')}-01`;
  const fontes = [numero, ...extras].map(n => ({ arquivo: meta.get(n).arquivo, arquivo_original: campo(bruto(n), 'arquivo_origem'), pagina: 'páginas/seções do Markdown', secao: n === numero ? 'conteúdo canônico integrado' : 'continuação temática integrada' }));
  dados[nivel.toLowerCase()].push({
    id, titulo, nivel, ...(nivel === 'KIDS' ? { nivel_cefr: opcoes.nivel_cefr || 'A1' } : {}), nivel_secundario: secundario, tema: titulo,
    subpainel: opcoes.subpainel || titulo, habilidade_principal: habilidade, habilidades_secundarias: opcoes.secundarias || [], habilidades: [habilidade, ...(opcoes.secundarias || [])],
    tipo: 'conceito, texto ou diálogo integrado', explicacao_pt: opcoes.explicacao || `A unidade reúne o uso verificável de ${titulo} sem transformar pequenas variações em unidades isoladas.`, origem_explicacao: 'editorial',
    conteudo_en: exemplos, traducoes: exemplos.map(() => 'Consulte o contexto bilíngue ou a autorrevisão da unidade.'), origem_traducoes: 'editorial identificada quando a fonte não fornece par direto',
    conteudo_fonte: opcoes.evidencia || corpo(raw).slice(0, 12000), observacao_uso: 'Fonte lida integralmente; recorte de evidência mantido para renderização segura.', variante: 'neutra', pre_requisitos: [], publico: nivel === 'KIDS' ? 'infantil' : 'geral',
    fonte: fontes[0], fontes, confianca_classificacao: 'alta', justificativa_nivel: opcoes.justificativa || `As funções e estruturas observadas sustentam ${nivel}.`, justificativa_c2: nivel === 'C2' ? opcoes.justificativa_c2 : undefined,
    paineis: [painel(nivel, habilidade)]
  });
  revisao[String(numero).padStart(4, '0')] = { estado: opcoes.antecipada ? 'integralmente classificada antecipadamente' : 'integralmente classificada', secoes: [`conteúdo integral → ${id}`] };
  for (const extra of extras) revisao[String(extra).padStart(4, '0')] = { estado: opcoes.antecipada ? 'integralmente classificada antecipadamente' : 'integralmente classificada', secoes: [`conteúdo integrado → ${id}`] };
  return id;
}

for (const spec of specs) unidade(...spec);

const dirigidas = [
  [1504, 'KIDS', 'história, rotina e perguntas para crianças', 'Leitura', ['A story', 'Where are the children?', 'Which children are happy?'], 'A1', [], { nivel_cefr: 'A1', antecipada: true, secundarias: ['Conversação'], justificativa: 'Livro infantil com personagens, história e perguntas concretas para young learners.' }],
  [1506, 'KIDS', 'família e comparações para crianças', 'Gramática', ["Simon's younger cousin", "Aunt May's younger than Suzy.", "She's got short brown hair."], 'A2', [], { nivel_cefr: 'A2', antecipada: true, justificativa: 'Material infantil ilustrado com família, descrição e comparativos.' }],
  [1508, 'KIDS', 'gramática contextualizada para young learners', 'Gramática', ['Grammar for Young Learners', 'Teaching Grammar to Young Learners'], 'A2', [], { nivel_cefr: 'A2', antecipada: true, justificativa: 'Material explicitamente destinado a crianças e young learners.' }],
  [1510, 'KIDS', 'diálogos iniciais para crianças', 'Conversação', ['Alphabet and handwriting guide', 'New grammar is explained with a simple dialogue.', 'English course for children.'], 'A1', [], { nivel_cefr: 'A1', antecipada: true, justificativa: 'Curso Junior Beginner explicitamente infantil, com diálogos simples.' }],
  [1513, 'KIDS', 'histórias e descrições infantis bilíngues', 'Leitura', ['A horse reading a story at four in the morning.', "There weren't many children.", 'The books and toys are for children in the park.'], 'A2', [], { nivel_cefr: 'A2', antecipada: true, justificativa: 'Histórias, crianças, brinquedos e pares bilíngues sustentam trilha infantil.' }],
  [1431, 'C2', 'reformulação, síntese e idiomaticidade de proficiência', 'Inglês acadêmico', ['Summarising ideas', 'Reformulation clauses', 'Adjectives and idioms'], 'C2', [], { antecipada: true, secundarias: ['Escrita'], justificativa_c2: 'Material de Objective Proficiency exige síntese, reformulação, idiomaticidade e controle de registro em nível C2.', justificativa: 'Tarefas explícitas de proficiência e escrita avançada sustentam C2.' }],
  [1433, 'C1', 'aspecto verbal e efeitos pragmáticos avançados', 'Gramática', ["Ella stays with us quite often.", "Ella's with us at the moment.", "You're always complaining about my handwriting."], 'C2', [], { antecipada: true, justificativa: 'Contrastes aspectuais e uso pragmático avançado sustentam C1, sem forçar C2.' }],
  [1435, 'C1', 'colocações, idioms e vocabulário avançado', 'Vocabulário', ['collocations and idioms', 'Economics and business', 'Personal history'], 'C2', [], { antecipada: true, justificativa: 'Combina vocabulário avançado, colocações e idiomaticidade em múltiplos registros.' }],
  [1437, 'C2', 'transferência de registro e linguagem idiomática', 'Escrita', ['formal/informal register transfer task', 'idiomatic phrases', "written in a 'telegram' style"], 'C2', [], { antecipada: true, secundarias: ['Gramática'], justificativa_c2: 'A fonte exige transformação formal/informal, controle estilístico e idiomaticidade, evidências diretas de C2.', justificativa: 'Transferência de registro e estilo com idiomaticidade avançada sustentam C2.' }],
  [1439, 'C1', 'escrita avançada e linguagem idiomática', 'Escrita', ['Idiomatic language', 'A letter of complaint', 'Dramatic past'], 'C2', [], { antecipada: true, justificativa: 'Produção avançada, reclamação formal e recursos narrativos sustentam C1.' }],
  [1329, 'B1', 'transcrição: contar uma história e expressões', 'Escuta', ['I have a story to tell.', 'side conversation', 'meeting'], 'B2', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1330, 'B1', 'transcrição: iniciar conversa naturalmente', 'Escuta', ['start a conversation', 'naturally in real conversations'], 'B2', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1332, 'B2', 'transcrição: aprendizagem e conexão intercultural', 'Escuta', ['negotiate a little bit', 'a true conversation with someone in another language', 'your learning style'], 'C1', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1335, 'B1', 'transcrição de filme: reconstruir uma história', 'Escuta', ['I know the whole story.', 'I know the whole story now.'], 'B2', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1340, 'B1', 'transcrição: meeting someone e seeing anyone', 'Escuta', ['Are you meeting someone?', 'Are you seeing anyone?'], 'B2', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1406, 'B1', 'reuniões, conversa e storytelling profissional', 'Inglês profissional', ['Making conversation', 'Collocations for business meetings', 'Storytelling devices'], 'B2', [], { antecipada: true, secundarias: ['Conversação'] }],
  [1408, 'C1', 'currículo, carta de apresentação e idioms profissionais', 'Inglês profissional', ['Writing a resume and cover letter', 'Travel adjectives and idioms', 'Idioms about time'], 'C1', [], { antecipada: true, secundarias: ['Escrita'] }]
];
for (const spec of dirigidas) unidade(...spec);
for (const u of Object.values(dados).flat().filter(u => u.id.includes('-L12-'))) if (!paineis.some(p => p.id === u.paineis[0])) paineis.push({ id: u.paineis[0], nivel: u.nivel, titulo: u.habilidade_principal });

const seqIds = new Set(specs.flatMap(spec => [spec[0], ...(spec[6] || [])]));
const parciais = new Set([583, 585, 587]);
const semDidatico = new Set([554, 556, 595, 598]);
const consolidarEmPosterior = new Map([[557, 559], [561, 563], [565, 567], [569, 571], [573, 575]]);
const triagemSequencial = [];
for (let numero = 541; numero <= 600; numero++) {
  const fonte = meta.get(numero), raw = bruto(numero), chave = hash(normal(raw));
  let canonica = hashCanonico.get(chave);
  let duplicidade = canonica !== numero ? 'duplicata textual' : 'não duplicada';
  let acao = 'classificar integralmente', status = 'integralmente classificada', justificativa = 'Fonte integralmente lida e destinada sem microfragmentação.';
  if (consolidarEmPosterior.has(numero)) {
    canonica = consolidarEmPosterior.get(numero); duplicidade = 'fragmento consolidado'; acao = 'integrar à fonte canônica mais completa'; status = 'integralmente classificada'; justificativa = 'O fragmento curto está integralmente coberto pela captura expandida.';
    revisao[String(numero).padStart(4, '0')] = { estado: 'integralmente classificada', secoes: [`fragmento integrado → ${revisao[String(canonica).padStart(4, '0')]?.secoes?.[0] || canonica}`] };
  } else if (seqIds.has(numero)) {
    canonica = numero;
  } else if (duplicidade === 'duplicata textual' || /# Conteúdo duplicado/.test(corpo(raw))) {
    const apontada = Number(campo(raw, 'duplicata_de')?.match(/(\d{4})_/)?.[1]);
    canonica = apontada || canonica || numero - 1; duplicidade = 'duplicata textual'; acao = 'não republicar; anexar procedência'; status = 'duplicata consolidada'; justificativa = 'Hash normalizado ou declaração explícita de duplicidade aponta para fonte canônica.';
    revisao[String(numero).padStart(4, '0')] = { estado: 'duplicata', secoes: [`conteúdo coberto por ${String(canonica).padStart(4, '0')}`] };
  } else if (parciais.has(numero)) {
    acao = 'não publicar até revisão visual'; status = 'parcialmente analisada'; justificativa = 'OCR corrompido impede reconstrução linguística confiável.';
    revisao[String(numero).padStart(4, '0')] = { estado: 'parcialmente analisada', secoes: ['OCR insuficiente; publicação suspensa'] };
  } else if (semDidatico.has(numero)) {
    acao = 'não publicar'; status = 'sem conteúdo didático'; justificativa = numero === 556 || numero === 598 ? 'Documento de navegação ou planejamento, sem lição linguística independente.' : 'Fragmento incompleto ou comentário metodológico sem unidade linguística confiável.';
    revisao[String(numero).padStart(4, '0')] = { estado: 'sem conteúdo didático', secoes: [justificativa] };
  } else if (!revisao[String(numero).padStart(4, '0')]) {
    acao = 'não criar micro-unidade'; status = 'integralmente classificada'; justificativa = 'Conteúdo útil já coberto por unidade temática existente ou insuficiente para destino isolado.';
    revisao[String(numero).padStart(4, '0')] = { estado: 'integralmente classificada', secoes: ['conteúdo coberto sem nova unidade isolada'] };
  }
  triagemSequencial.push({ numero, nome: fonte.arquivo, hash_bruto: hash(raw), hash_normalizado: chave, fonte_canonica: meta.get(canonica)?.arquivo || fonte.arquivo, duplicidade, acao, status, justificativa });
}

const triagemDirigida = dirigidas.map(spec => {
  const numero = spec[0], fonte = meta.get(numero), raw = bruto(numero);
  return { numero, nome: fonte.arquivo, hash_bruto: hash(raw), hash_normalizado: hash(normal(raw)), fonte_canonica: fonte.arquivo, duplicidade: 'não duplicada', acao: 'classificar antecipadamente após leitura integral', status: 'integralmente classificada', justificativa: spec[7]?.justificativa || 'Fonte canônica reduz lacuna curricular com evidência textual.' };
});

let global = 0;
const subpaineis = [];
for (const nivel of niveis) {
  const porPainel = new Map(), porSub = new Map();
  dados[nivel].forEach((u, indice) => {
    u.ordem_global = ++global; u.ordem_nivel = indice + 1; u.ordem_pedagogica = indice + 1;
    const p = u.paineis[0]; porPainel.set(p, (porPainel.get(p) || 0) + 1); u.ordem_painel = porPainel.get(p);
    const chave = `${p}|${u.subpainel}`; porSub.set(chave, (porSub.get(chave) || 0) + 1); u.ordem_subpainel = porSub.get(chave);
    const id = `${p}--${u.subpainel.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}`;
    subpaineis.push({ id, painel: p, nivel: u.nivel, titulo: u.subpainel });
  });
  escrever(`dados/${nivel}/unidades.json`, dados[nivel]);
}
escrever('dados/subpaineis.json', [...new Map(subpaineis.map(item => [item.id, item])).values()]);
escrever('dados/paineis.json', paineis);
escrever('dados/revisao-fontes.json', revisao);
escrever('dados/lote-012-triagem.json', { lote: '012', sequenciais: triagemSequencial, direcionadas: triagemDirigida, ja_concluidas_antecipadamente: [] });
for (const item of mapa.arquivos) {
  const r = revisao[item.id];
  if (r) { item.estado_revisao = r.estado; item.secoes = r.secoes.join(' | '); item.unidades = Object.values(dados).flat().filter(u => (u.fontes || [u.fonte]).some(f => f.arquivo === item.arquivo)).map(u => u.id); }
  else if (item.id === '0602') { item.estado_revisao = 'não analisada'; item.secoes = null; item.unidades = []; }
}
mapa.gerado_em = new Date().toISOString();
escrever('dados/mapa-fontes.json', mapa);
console.log(`Lote 012 aplicado: ${triagemSequencial.length} sequenciais, ${triagemDirigida.length} dirigidas, ${Object.values(dados).flat().length} unidades.`);
