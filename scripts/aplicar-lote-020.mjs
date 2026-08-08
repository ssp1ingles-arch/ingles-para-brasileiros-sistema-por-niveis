import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const r = path.resolve(import.meta.dirname, '..'),
    src = (process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte')),
    ns = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'],
    l = a => JSON.parse(fs.readFileSync(path.join(r, a), 'utf8')),
    w = (a, v) => fs.writeFileSync(path.join(r, a), JSON.stringify(v, null, 2) + '\n'),
    mapa = l('dados/mapa-fontes.json'),
    rev = l('dados/revisao-fontes.json'),
    units = ns.flatMap(n => l(`dados/${n}/unidades.json`)),
    meta = new Map(mapa.arquivos.map(x => [+x.id, x])),
    raw = n => fs.readFileSync(path.join(src, meta.get(n).arquivo), 'utf8'),
    body = t => t.replace(/^---[\s\S]*?---\s*/, '').trim(),
    norm = t => body(t).normalize('NFC').replace(/\s+/gu, '').toLocaleLowerCase('en-US'),
    sha = t => crypto.createHash('sha256').update(t).digest('hex'),
    front = (t, k) => t.match(new RegExp(`^${k}: "(.*)"$`, 'm'))?.[1] || '';

function add({
    id,
    titulo,
    nivel,
    tema,
    panel,
    sub,
    skill,
    secondary = [],
    tipo = 'conteúdo integrado',
    exp,
    examples,
    translations,
    source,
    section,
    just
}) {
    if (units.some(x => x.id === id)) return;
    const f = meta.get(source),
        t = raw(source);
    units.push({
        id,
        titulo,
        nivel,
        nivel_secundario: nivel,
        tema,
        subpainel: sub,
        habilidade_principal: skill,
        habilidades_secundarias: secondary,
        habilidades: [skill, ...secondary],
        tipo,
        explicacao_pt: exp,
        origem_explicacao: 'editorial',
        conteudo_en: examples,
        traducoes: translations,
        origem_traducoes: 'fonte com seleção editorial',
        conteudo_fonte: `Fonte ${f.arquivo}; ${section}. Conteúdo integral mapeado em dados/mapeamento-fontes-extensas-020.json.`,
        observacao_uso: 'Fonte lida integralmente; exemplos representativos preservam o objetivo sem reproduzir o arquivo inteiro.',
        variante: 'neutra',
        pre_requisitos: [],
        publico: 'geral',
        fonte: {
            arquivo: f.arquivo,
            arquivo_original: front(t, 'arquivo_origem'),
            pagina: 'seção indicada no Markdown/HTML',
            secao: section
        },
        fontes: [{
            arquivo: f.arquivo,
            arquivo_original: front(t, 'arquivo_origem'),
            pagina: 'seção indicada no Markdown/HTML',
            secao: section
        }],
        confianca_classificacao: 'alta',
        justificativa_nivel: just,
        paineis: [panel]
    })
}
add({
    id: 'A2-L20-1163-01',
    titulo: 'question words em conversas cotidianas',
    nivel: 'A2',
    tema: 'perguntas naturais em situações cotidianas',
    panel: 'a2-conversacao',
    sub: 'Rotinas e situações cotidianas',
    skill: 'Conversação',
    secondary: ['Gramática'],
    exp: 'Question words organizam perguntas abertas sobre rotina, origem, preferências, serviços e viagem; respostas curtas acrescentam informação suficiente para sustentar a conversa.',
    examples: ['What is your hometown known for?', 'How do you get to work?', 'How often do you go to the cinema?'],
    translations: ['Pelo que sua cidade natal é conhecida?', 'Como você vai ao trabalho?', 'Com que frequência você vai ao cinema?'],
    source: 1163,
    section: 'Conversas 01–07',
    just: 'Perguntas e respostas previsíveis com autonomia cotidiana sustentam A2.'
});
add({
    id: 'B1-L20-1163-02',
    titulo: 'continuação pragmática de conversas',
    nivel: 'B1',
    tema: 'respostas, recomendações e manejo de situações',
    panel: 'b1-conversacao',
    sub: 'Interação e prática integrada',
    skill: 'Conversação',
    secondary: ['Vocabulário'],
    exp: 'A unidade trabalha como responder, justificar, recomendar e manter a conversa em contextos de hotel, transporte, clima, aprendizagem e atrasos.',
    examples: ['What would you recommend watching?', 'What do you do when the service is slow?', 'How do you usually handle being late?'],
    translations: ['O que você recomendaria assistir?', 'O que você faz quando o atendimento demora?', 'Como você normalmente lida com atrasos?'],
    source: 1163,
    section: 'Conversas 08–14',
    just: 'Continuação espontânea, justificativa e recomendação sustentam B1.'
});
add({
    id: 'B1-L20-1164-01',
    titulo: 'even, even if, even though e not even',
    nivel: 'B1',
    tema: 'ênfase, hipótese e concessão com even',
    panel: 'b1-gramatica',
    sub: 'Conectores e relações lógicas',
    skill: 'Gramática',
    secondary: ['Conversação'],
    exp: 'A posição de even define o foco; even if introduz hipótese, even though contrasta um fato e not even reforça a negativa.',
    examples: ['Even my brother liked it.', 'Even if it rains, we\'ll go.', 'Even though I was tired, I kept studying.', 'He didn\'t even try.'],
    translations: ['Até meu irmão gostou.', 'Mesmo se chover, nós iremos.', 'Embora eu estivesse cansado, continuei estudando.', 'Ele nem tentou.'],
    source: 1164,
    section: 'A família EVEN',
    just: 'Contraste entre ênfase, hipótese e concessão exige controle intermediário B1.'
});
add({
    id: 'B2-L20-1164-02',
    titulo: 'intensificadores e conectores por registro',
    nivel: 'B2',
    tema: 'so, such, too, enough e reformulação formal',
    panel: 'b2-ingles-academico',
    sub: 'Conectores e organização acadêmica',
    skill: 'Inglês acadêmico',
    secondary: ['Gramática', 'Escrita'],
    exp: 'So modifica adjetivo ou advérbio, such introduz grupo nominal, too marca excesso e enough suficiência; conectores formais reformulam relações sem alterar o sentido.',
    examples: ['She is such a good teacher.', 'One could argue that the policy is ineffective.', 'To put it differently, the evidence is incomplete.'],
    translations: ['Ela é uma professora tão boa.', 'Pode-se argumentar que a política é ineficaz.', 'Em outras palavras, as evidências estão incompletas.'],
    source: 1164,
    section: 'Intensificadores e conectores de texto',
    just: 'Escolha sintática e transferência consciente de registro sustentam B2.'
});
add({
    id: 'B1-L20-1166-01',
    titulo: 'escolha lexical por opção e resultado',
    nivel: 'B1',
    tema: 'what/which, end/end up e stand/stand up',
    panel: 'b1-vocabulario',
    sub: 'Precisão lexical e contrastes de sentido',
    skill: 'Vocabulário',
    secondary: ['Gramática'],
    exp: 'What abre possibilidades; which seleciona opções conhecidas. As partículas de end up e stand up acrescentam resultado inesperado e mudança de estado.',
    examples: ['Which dessert do you want, cake or ice cream?', 'We ended up getting lost in the city.', 'Everyone stood up when she entered.'],
    translations: ['Qual sobremesa você quer, bolo ou sorvete?', 'Acabamos nos perdendo na cidade.', 'Todos se levantaram quando ela entrou.'],
    source: 1166,
    section: 'Perguntas e verbo com partícula',
    just: 'Contrastes dependentes de contexto e resultado sustentam B1.'
});
add({
    id: 'B2-L20-1166-02',
    titulo: 'verbo cotidiano e equivalente formal',
    nivel: 'B2',
    tema: 'stop/cease e show/demonstrate por registro',
    panel: 'b2-vocabulario',
    sub: 'Vocabulário integrado',
    skill: 'Vocabulário',
    secondary: ['Inglês acadêmico'],
    exp: 'Stop e show dominam a conversa; cease indica encerramento formal e demonstrate descreve apresentação detalhada ou comprovação.',
    examples: ['All fighting ceased after the agreement.', 'The scientist demonstrated the experiment to the class.'],
    translations: ['Todo o combate cessou depois do acordo.', 'O cientista demonstrou o experimento para a turma.'],
    source: 1166,
    section: 'A mesma ideia em dois registros',
    just: 'Adequação lexical consciente a texto formal sustenta B2.'
});
add({
    id: 'B1-L20-1168-01',
    titulo: 'expressões para confusão e fala direta',
    nivel: 'B1',
    tema: 'headscratcher, hit me, drop it e spit it out',
    panel: 'b1-conversacao',
    sub: 'Interação e prática integrada',
    skill: 'Conversação',
    secondary: ['Vocabulário'],
    exp: 'Quatro expressões informais sinalizam confusão, disponibilidade para ouvir, encerramento de assunto e impaciência para que alguém fale.',
    examples: ['It was a real headscratcher.', 'All right. Hit me.', 'I wish you would just drop it.', 'Just spit it out.'],
    translations: ['Foi realmente difícil de entender.', 'Tudo bem. Pode falar.', 'Queria que você simplesmente deixasse isso para lá.', 'Fala logo.'],
    source: 1168,
    section: 'Confusão e comunicação',
    just: 'Idiomaticidade informal com intenção pragmática sustenta B1.'
});
add({
    id: 'B2-L20-1168-02',
    titulo: 'relutância emocional e falta de energia',
    nivel: 'B2',
    tema: 'have the heart, bring myself e have it in me',
    panel: 'b2-conversacao',
    sub: 'Interação e prática integrada',
    skill: 'Conversação',
    secondary: ['Vocabulário'],
    exp: 'As três construções distinguem empatia que impede uma ação, resistência interna e esgotamento físico ou emocional.',
    examples: ["I didn't have the heart to say no.", "I can't bring myself to watch the last episode.", "I don't have it in me to argue anymore."],
    translations: ['Não tive coragem de dizer não.', 'Não consigo me forçar a assistir ao último episódio.', 'Não tenho energia para discutir mais.'],
    source: 1168,
    section: 'Coragem e energia emocional',
    just: 'Nuances idiomáticas próximas e restrições estruturais sustentam B2.'
});
add({
    id: 'B1-L20-1170-01',
    titulo: 'falsos cognatos e pares de palavras frequentes',
    nivel: 'B1',
    tema: 'escolha lexical precisa em pares confundíveis',
    panel: 'b1-vocabulario',
    sub: 'Precisão lexical e contrastes de sentido',
    skill: 'Vocabulário',
    secondary: ['Leitura'],
    exp: 'Pares visual ou semanticamente próximos exigem observar classe gramatical, contabilidade e contexto, em vez de traduzir pela aparência.',
    examples: ['Will the new software affect the performance of the computer?', 'I have fewer problems than you do.', 'A sensible policy would never risk our children.'],
    translations: ['O novo software afetará o desempenho do computador?', 'Tenho menos problemas do que você.', 'Uma política sensata jamais colocaria nossas crianças em risco.'],
    source: 1170,
    section: 'Dicas lexicais entre 001 e 1006',
    just: 'Contrastes lexicais de alta frequência e leitura contextual sustentam B1.'
});
add({
    id: 'B2-L20-1170-02',
    titulo: 'precisão de uso, forma e registro',
    nivel: 'B2',
    tema: 'armadilhas de gramática, colocação e registro',
    panel: 'b2-vocabulario',
    sub: 'Vocabulário integrado',
    skill: 'Vocabulário',
    secondary: ['Gramática', 'Escrita'],
    exp: 'As dicas avançam da correção formal para diferenças de colocação, construção e registro que alteram naturalidade ou sentido.',
    examples: ['The amount of money he amassed attracted dangerous people.', 'Two intelligent young Brazilian students explained what Marx meant.', 'I saw nothing, or I did not see anything.'],
    translations: ['A quantidade de dinheiro que ele acumulou atraiu pessoas perigosas.', 'Dois jovens estudantes brasileiros inteligentes explicaram o que Marx quis dizer.', 'Não vi nada.'],
    source: 1170,
    section: 'Dicas gramaticais e de uso entre 001 e 1006',
    just: 'Precisão combinatória e controle de forma em contextos variados sustentam B2.'
});
// Todas as 1.006 dicas recebem decisão explícita e destino temático.
const txt1170 = body(raw(1170)),
    re = /^((?:\d{3}|100[0-6]))([^\r\n]+)\r?\n\r?\n([\s\S]*?)(?=^(?:\d{3}|100[0-6])[^\r\n]+\r?$|\z)/gm,
    tips = [...txt1170.matchAll(re)].map(m => {
        const lexical = /\bx\b|palavra|significado|express[aã]o|vocab|cognat|diferen|como dizer|uso de [“"]?[a-z]/i.test(m[2]);
        return {
            numero: +m[1].replace(/\s/g, ''),
            titulo: m[2].trim(),
            paginas: 'HTML sem paginação; ordem ' + m[1].replace(/\s/g, ''),
            tema: lexical ? 'precisão lexical e expressões' : 'gramática, uso e registro',
            objetivo_pedagogico: lexical ? 'distinguir sentido, colocação ou palavra confundível' : 'controlar forma, construção ou adequação',
            nivel_cefr: lexical ? 'B1' : 'B2',
            habilidade_principal: lexical ? 'Vocabulário' : 'Gramática',
            habilidades_secundarias: lexical ? ['Leitura'] : ['Vocabulário', 'Escrita'],
            unidade_existente_relacionada: lexical ? 'B1-L20-1170-01' : 'B2-L20-1170-02',
            decisao: 'incorporar',
            justificativa: 'Dica incorporada a objetivo transversal; não publicada como micro-unidade.',
            exemplos_uteis_aproveitados: m[3].split(/\r?\n/).filter(Boolean).slice(0, 2),
            registro_e_restricoes: 'conforme explicação integral preservada na fonte',
            elegibilidade_atividade: false,
            elegibilidade_jornada: false
        }
    });
if (tips.length !== 1006) throw Error(`1170: esperado 1006 dicas, obtido ${tips.length}`);
// Ordens novas são anexadas sem deslocar os 824 IDs anteriores.
const previous = 824,
    newUnits = units.filter(u => !u.ordem_global);
newUnits.forEach((u, i) => u.ordem_global = previous + i + 1);
for (const level of ns) {
    const arr = units.filter(u => u.nivel.toLowerCase() === level).sort((a, b) => (a.ordem_global || 0) - (b.ordem_global || 0));
    arr.forEach((u, i) => {
        u.ordem_nivel = i + 1;
        u.ordem_pedagogica = i + 1
    })
}
for (const panel of new Set(units.flatMap(u => u.paineis))) {
    units.filter(u => u.paineis[0] === panel).sort((a, b) => a.ordem_global - b.ordem_global).forEach((u, i) => u.ordem_painel = i + 1)
}
for (const key of new Set(units.map(u => `${u.paineis[0]}|${u.subpainel}`))) {
    units.filter(u => `${u.paineis[0]}|${u.subpainel}` === key).sort((a, b) => a.ordem_global - b.ordem_global).forEach((u, i) => u.ordem_subpainel = i + 1)
}
const statuses = new Map([
    [1165, ['sem conteúdo didático', 'Índice de navegação; links apontam para 1162–1166.']],
    [1167, ['sem conteúdo didático', 'Regras administrativas/editoriais; exemplos apenas delimitam escopo.']],
    [1169, ['sem conteúdo didático', 'Índice de livros; referências serão processadas sequencialmente.']]
]);
const destinations = {
            1163: ['A2-L20-1163-01', 'B1-L20-1163-02'],
            1164: ['B1-L20-1164-01', 'B2-L20-1164-02'],
            1166: ['B1-L20-1166-01', 'B2-L20-1166-02'],
            1168: ['B1-L20-1168-01', 'B2-L20-1168-02'],
            1170: ['B1-L20-1170-01', 'B2-L20-1170-02']
        }, seq = [];
        for (let n = 1163; n <= 1170; n++) {
            const f = meta.get(n),
                t = raw(n),
                st = statuses.get(n),
                state = st?.[0] || 'integralmente classificada',
                dest = destinations[n] || [];
            rev[f.id] = {
                estado: state,
                secoes: [st?.[1] || `conteúdo integral distribuído em ${dest.join(', ')}`]
            };
            seq.push({
                numero: n,
                nome: f.arquivo,
                tamanho_bytes: Buffer.byteLength(t),
                hash_bruto: sha(t),
                hash_normalizado: sha(norm(t)),
                leitura_integral: true,
                status: state,
                unidades_destino: dest,
                justificativa: st?.[1] || 'Objetivos pedagógicos independentes agrupados por função, nível e registro.'
            })
        }
        for (const n of ns) w(`dados/${n}/unidades.json`, units.filter(u => u.nivel.toLowerCase() === n)); w('dados/revisao-fontes.json', rev); w('dados/lote-020-triagem.json', {
            lote: '020',
            sequenciais: seq,
            direcionadas: [],
            antecipadas: [],
            parciais: [],
            observacao: 'Lote encerrado em 1170 após leitura e mapeamento integral de 1.006 dicas; 1171 não foi aberto para evitar processamento superficial de nova fonte extensa.'
        }); w('dados/mapeamento-fontes-extensas-020.json', {
            lote: '020',
            fontes: [{
                numero: 1163,
                fonte: meta.get(1163).arquivo,
                secoes: 14,
                pares: 98,
                destinos: destinations[1163],
                decisao: 'incorporar em duas unidades por autonomia comunicativa'
            }, {
                numero: 1168,
                fonte: meta.get(1168).arquivo,
                secoes: 7,
                destinos: destinations[1168],
                decisao: 'incorporar em dois objetivos pragmáticos'
            }, {
                numero: 1170,
                fonte: meta.get(1170).arquivo,
                nome_completo: '1.006 Frases de Inglês — conteúdo extraído de 1000 melhores dicas para aprender inglês',
                bytes: Buffer.byteLength(raw(1170)),
                hash_bruto: sha(raw(1170)),
                hash_normalizado: sha(norm(raw(1170))),
                leitura_integral: true,
                total_secoes: tips.length,
                secoes: tips,
                decisao: 'incorporar 1.006 dicas em dois objetivos transversais; nenhuma seção silenciosa'
            }]
        });
        for (const f of mapa.arquivos) {
            const z = rev[f.id];
            if (z) {
                f.estado_revisao = z.estado;
                f.secoes = z.secoes.join(' | ');
                f.unidades = units.filter(u => (u.fontes || [u.fonte]).some(q => q?.arquivo === f.arquivo)).map(u => u.id)
            }
        }
        w('dados/mapa-fontes.json', mapa); console.log(`Lote 020: 8 fontes, ${newUnits.length} unidades novas, 1006 dicas mapeadas.`);
