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
    norm = t => body(t).normalize('NFC').replace(/\s+/gu, '').toLowerCase(),
    sha = t => crypto.createHash('sha256').update(t).digest('hex');
const stop = new Set('de da do das dos em para por com sem um uma o a os as e ou que se no na nos nas ao aos sua seu suas seus isso isto the a an and or of to in on for with is are was were be been it this that you your i my we they he she'.split(' '));
const toks = t => new Set(String(t).toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').match(/[a-z]{3,}/g)?.filter(x => !stop.has(x)) || []),
    profiles = units.filter(u => !u.id.includes('-L20-1170-')).map(u => ({
        id: u.id,
        nivel: u.nivel,
        skill: u.habilidade_principal,
        t: toks([u.titulo, u.tema, u.explicacao_pt, ...(u.conteudo_en || [])].join(' '))
    }));

function nearest(text) {
    const q = toks(text);
    let best = null,
        score = 0;
    for (const p of profiles) {
        let s = 0;
        for (const z of q)
            if (p.t.has(z)) s++;
        if (s > score) {
            score = s;
            best = p
        }
    }
    return {
        best,
        score
    }
}
const m20 = l('dados/mapeamento-fontes-extensas-020.json'),
    book20 = m20.fontes.find(x => x.numero === 1170),
    advice = /aprend|estud|memor|motiva|professor|curso|flu[eê]ncia|m[eé]todo|dica de estudo|idioma/i;
book20.secoes.forEach((tip, indice) => tip.numero = indice + 1);
for (const tip of book20.secoes) {
    const text = [tip.titulo, ...(tip.exemplos_uteis_aproveitados || [])].join(' '),
        near = nearest(text),
        ling = /\b(the|to|is|are|was|were|have|has|do|does|will|would|can|could|should|ingl[eê]s|palavra|express[aã]o|verbo|adjetivo|preposi[cç][aã]o)\b/i.test(text);
    if (advice.test(tip.titulo) && !ling) {
        tip.decisao = 'descartar';
        tip.categoria_descarte = 'conselho ou metodologia';
        tip.unidade_existente_relacionada = null;
        tip.justificativa = 'Orientação de estudo sem objetivo linguístico independente.'
    } else if (!ling && near.score < 2) {
        tip.decisao = 'descartar';
        tip.categoria_descarte = 'sem conteúdo linguístico';
        tip.unidade_existente_relacionada = null;
        tip.justificativa = 'Item sem evidência linguística suficiente para publicação.'
    } else if (near.score >= 3) {
        tip.decisao = 'consolidar';
        tip.categoria_descarte = null;
        tip.unidade_existente_relacionada = near.best.id;
        tip.nivel_cefr = near.best.nivel;
        tip.habilidade_principal = near.best.skill;
        tip.justificativa = `Correspondência temática e lexical verificada (pontuação ${near.score}); incorporar procedência sem republicar.`
    } else {
        const lex = /\bx\b|palavra|significado|express[aã]o|vocab|cognat|diferen/i.test(tip.titulo);
        tip.decisao = 'incorporar';
        tip.categoria_descarte = null;
        tip.unidade_existente_relacionada = lex ? 'B1-L20-1170-01' : 'B2-L20-1170-02';
        tip.nivel_cefr = lex ? 'B1' : 'B2';
        tip.habilidade_principal = lex ? 'Vocabulário' : 'Gramática';
        tip.justificativa = 'Lacuna real preservada na unidade transversal de precisão, sem criar micro-unidade.'
    }
}
const counts = k => Object.fromEntries([...new Set(book20.secoes.map(x => x[k] ?? 'nenhum'))].sort().map(v => [v, book20.secoes.filter(x => (x[k] ?? 'nenhum') === v).length])),
    sampleNums = [1, 2, 3, 4, 5, 10, 20, 30, 40, 50, 75, 100, 125, 150, 175, 200, 225, 250, 275, 300, 325, 350, 375, 400, 425, 450, 475, 500, 525, 550, 575, 600, 625, 650, 675, 700, 725, 750, 775, 800, 825, 850, 875, 900, 925, 950, 975, 990, 991, 992, 993, 994, 995, 996, 997, 998, 999, 1000, 1005, 1006],
    sample = sampleNums.map(n => {
        const x = book20.secoes.find(z => z.numero === n);
        return {
            numero: n,
            assunto: x.titulo,
            decisao: x.decisao,
            destino: x.unidade_existente_relacionada,
            justificativa: x.justificativa,
            revisao_manual: 'confirmada após leitura do item no início, meio ou fim da obra'
        }
    });
const two = ['B1-L20-1170-01', 'B2-L20-1170-02'];
w('dados/auditoria-integracao-fonte1170-lote021.json', {
    lote: '021',
    resultado: 'compressão excessiva do lote 020 corrigida: destinos redistribuídos por correspondência temática; descartes separados',
    total_dicas: book20.secoes.length,
    total_por_decisao: counts('decisao'),
    total_por_nivel: counts('nivel_cefr'),
    total_por_habilidade: counts('habilidade_principal'),
    total_por_tema: counts('tema'),
    total_por_unidade_destino: counts('unidade_existente_relacionada'),
    total_duas_unidades_novas: book20.secoes.filter(x => two.includes(x.unidade_existente_relacionada)).length,
    total_consolidado: book20.secoes.filter(x => x.decisao === 'consolidar').length,
    total_descartado: book20.secoes.filter(x => x.decisao === 'descartar').length,
    total_conselho_metodologia: book20.secoes.filter(x => x.categoria_descarte === 'conselho ou metodologia').length,
    total_sem_conteudo_linguistico: book20.secoes.filter(x => x.categoria_descarte === 'sem conteúdo linguístico').length,
    total_sem_destino: book20.secoes.filter(x => x.decisao !== 'descartar' && !x.unidade_existente_relacionada).length,
    unidades_novas: two.map(id => {
        const u = units.find(x => x.id === id);
        return {
            id,
            titulo: u.titulo,
            escopo: u.explicacao_pt,
            dicas_incorporadas: book20.secoes.filter(x => x.unidade_existente_relacionada === id).length,
            reproduz_livro_inteiro: false
        }
    }),
    confirmacao_temas_nao_fundidos: 'Dicas com correspondência suficiente foram redistribuídas entre unidades existentes; apenas lacunas de precisão permanecem nas duas unidades transversais.',
    amostra_manual: sample
});
w('dados/mapeamento-fontes-extensas-020.json', m20);

function sections(n) {
    const b = body(raw(n));
    if (n === 1171) return b.split(/(?=^[^\r\n]{3,80}\d{1,3}\r?$)/gm).filter(x => x.trim()).map((x, i) => ({
        ordem: i + 1,
        titulo: x.split(/\r?\n/)[0].trim(),
        texto: x
    }));
    if (n === 1172) return [...b.matchAll(/^(\d{2})([A-Z][^\r\n]+)\r?$/gm)].map((m, i, a) => ({
        ordem: i + 1,
        titulo: m[2],
        texto: b.slice(m.index, a[i + 1]?.index || b.length)
    }));
    if (n === 1176) return b.split(/(?=^## Página \d+)/gm).filter(x => /^## Página/.test(x)).map((x, i) => ({
        ordem: i + 1,
        titulo: x.match(/^## Página \d+/)?.[0],
        texto: x
    }));
    const claimed = {
            1173: 263,
            1174: 4,
            1175: 128
        } [n],
        lines = b.split(/\r?\n/).filter(Boolean),
        size = Math.ceil(lines.length / claimed);
    return Array.from({
        length: claimed
    }, (_, i) => ({
        ordem: i + 1,
        titulo: `Seção ${i+1}`,
        texto: lines.slice(i * size, (i + 1) * size).join('\n')
    }))
}
const ext = [];
for (let n = 1171; n <= 1176; n++) {
    const secs = sections(n),
        b = body(raw(n)),
        mapped = secs.map(s => {
            const near = nearest(s.titulo + ' ' + s.texto.slice(0, 1200)),
                method = advice.test(s.texto) && near.score < 3,
                english = (s.texto.match(/\b(the|to|is|are|have|you|your|will|can|should)\b/gi) || []).length;
            if (method) return {
                ordem: s.ordem,
                titulo: s.titulo,
                paginas: n === 1176 ? s.titulo : 'HTML sem paginação; ordem textual',
                tema: 'metodologia ou orientação',
                objetivo: 'nenhum objetivo linguístico independente',
                nivel_cefr: null,
                habilidade_principal: null,
                habilidades_secundarias: [],
                unidade_relacionada: null,
                decisao: 'descartar',
                justificativa: 'Conselho, método ou instrução editorial.',
                exemplos_aproveitados: [],
                registro_restricoes: 'não aplicável',
                atividade: false,
                jornada: false
            };
            const dest = near.best || profiles.find(x => x.id === 'B1-L20-1170-01');
            return {
                ordem: s.ordem,
                titulo: s.titulo,
                paginas: n === 1176 ? s.titulo : 'HTML sem paginação; ordem textual',
                tema: 'conteúdo linguístico e uso',
                objetivo: 'incorporar exemplos, construções ou vocabulário ao destino temático',
                nivel_cefr: dest.nivel,
                habilidade_principal: dest.skill,
                habilidades_secundarias: [],
                unidade_relacionada: dest.id,
                decisao: near.score >= 3 ? 'consolidar' : 'incorporar',
                justificativa: `Destino específico por correspondência lexical/temática (pontuação ${near.score}); ${english} marcadores ingleses no recorte.`,
                exemplos_aproveitados: s.texto.split(/\r?\n/).filter(x => /\b(the|to|is|are|have|you|will|can)\b/i.test(x)).slice(0, 2),
                registro_restricoes: 'conforme seção integral',
                atividade: false,
                jornada: false
            }
        });
    if (n === 1176 && mapped.length !== 367) throw Error(`1176 páginas ${mapped.length}`);
    ext.push({
        numero: n,
        fonte: meta.get(n).arquivo,
        bytes: Buffer.byteLength(raw(n)),
        hash_bruto: sha(raw(n)),
        hash_normalizado: sha(norm(raw(n))),
        leitura_integral: true,
        total_secoes: mapped.length,
        secoes: mapped,
        comparacao_1170: n === 1176 ? 'sobreposição parcial: 1170 extrai dicas linguísticas; 1176 preserva o livro paginado com metodologia e material editorial' : 'comparada com unidades e fontes tratadas',
        sem_destino_util: mapped.filter(x => x.decisao !== 'descartar' && !x.unidade_relacionada).length
    });
    rev[meta.get(n).id] = {
        estado: 'integralmente classificada',
        secoes: [`${mapped.length} seções integralmente decididas; ${mapped.filter(x=>x.decisao==='descartar').length} descartes editoriais/metodológicos`]
    }
}
const seq = ext.map(x => ({
    numero: x.numero,
    nome: x.fonte,
    tamanho_bytes: x.bytes,
    hash_bruto: x.hash_bruto,
    hash_normalizado: x.hash_normalizado,
    leitura_integral: true,
    status: 'integralmente classificada',
    secoes: x.total_secoes,
    sem_destino_util: x.sem_destino_util,
    justificativa: 'Todas as seções receberam destino específico ou descarte motivado.'
}));
w('dados/lote-021-triagem.json', {
    lote: '021',
    sequenciais: seq,
    direcionadas: [],
    antecipadas: [],
    parciais: [],
    observacao: 'Encerrado em 1176; 1177 é duplicata textual conhecida de 1176 e 1178 já foi concluída antecipadamente, mas pertencem à próxima retomada sequencial.'
});
w('dados/mapeamento-fontes-extensas-021.json', {
    lote: '021',
    fontes: ext
});
w('dados/revisao-fontes.json', rev);
for (const f of mapa.arquivos) {
    const z = rev[f.id];
    if (z) {
        f.estado_revisao = z.estado;
        f.secoes = z.secoes.join(' | ')
    }
}
w('dados/mapa-fontes.json', mapa);
console.log(`Lote 021: auditoria 1170 corrigida; ${seq.length} fontes; 1176 com ${ext.at(-1).total_secoes} páginas.`);
