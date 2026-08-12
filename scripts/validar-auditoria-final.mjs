import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const falhas = [];
const exigir = (condicao, mensagem) => { if (!condicao) falhas.push(mensagem); };
const estados = ler('dados/auditoria-final-estados-fontes.json');
const duplicatas = ler('dados/auditoria-final-duplicatas.json');
const global = ler('dados/auditoria-final-global.json');
const destinos = ler('dados/auditoria-final-destinos-procedencias.json');
const manifesto054 = ler('dados/lote-054-manifesto.json');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const fontes = estados.fontes;
const porNumero = new Map(fontes.map(f => [f.numero, f]));
const principais = new Set(['integralmente classificada', 'duplicata integral', 'sem conteúdo didático', 'administrativa', 'índice/navegação', 'parcial']);

exigir(fontes.length === 1547 && porNumero.size === 1547, 'fechamento não exclusivo em 1547 fontes');
for (let numero = 1; numero <= 1547; numero++) exigir(porNumero.has(numero), `fonte ausente: ${numero}`);
exigir(fontes.every(f => principais.has(f.estado_principal)), 'estado principal inválido');
exigir((estados.estados.parcial || 0) === 0, 'há fonte parcial');
exigir(fontes.every(f => /^[a-f0-9]{64}$/.test(f.hash_bruto)), 'hash ausente ou inválido');
exigir(global.divergencias.fontes_uteis_sem_destino === 0, 'conteúdo útil sem destino');
exigir(global.divergencias.procedencias_ausentes_corrigidas === 1619, 'linha de base de 1.619 procedências alterada');
exigir(global.impacto.unidades_afetadas === 387 && destinos.unidades_afetadas === 387, 'linha de base de 387 unidades afetadas alterada');
exigir(global.raizes_canonicas_promovidas.length === 16, 'linha de base de 16 raízes canônicas alterada');
exigir(estados.estados['sem conteúdo didático'] === 29 && estados.estados.administrativa === 27 && estados.estados['índice/navegação'] === 35, 'estados editoriais exclusivos divergentes');
exigir(duplicatas.problemas.length === 0 && duplicatas.amostra_manual.length >= 60, 'duplicatas sem canônica ou amostra insuficiente');
for (const f of fontes.filter(x => x.estado_principal === 'duplicata integral')) {
  const c = +f.canonica_relacionada;
  exigir(Number.isInteger(c) && c !== f.numero && porNumero.has(c), `canônica inválida: ${f.numero}`);
  exigir(porNumero.get(c)?.estado_principal !== 'duplicata integral', `cadeia de duplicata: ${f.numero} -> ${c}`);
}
const contagem054 = manifesto054.fontes.reduce((a, f) => (a[f.estado_principal] = (a[f.estado_principal] || 0) + 1, a), {});
exigir(manifesto054.fontes.length === 30, 'manifesto 054 não contém 30 fontes');
exigir(contagem054['duplicata integral'] === 26 && contagem054['integralmente classificada'] === 2 && contagem054.administrativa === 1 && contagem054['sem conteúdo didático'] === 1, 'distribuição residual 054 divergente');
for (const [numero, canonica] of [[9, 974]]) exigir(manifesto054.fontes.find(f => f.numero === numero)?.duplicata_de === canonica, `relação 054 inválida: ${numero}`);
for (const numero of [18, 56]) exigir(manifesto054.fontes.find(f => f.numero === numero)?.caracteristicas.includes('extração alternativa'), `extração alternativa 054 ausente: ${numero}`);
for (const f of manifesto054.fontes) {
  const id = String(f.numero).padStart(4, '0');
  exigir(mapa.arquivos.some(x => x.id === id) && revisao[id], `decisão 054 não persistida: ${id}`);
}
const artefatos = ['global','estados-fontes','duplicatas','extracoes-curadorias','fontes-extensas','ocr','destinos-procedencias','curriculo','atividades-jornada','interface'];
for (const nome of artefatos) exigir(fs.existsSync(path.join(raiz, `dados/auditoria-final-${nome}.json`)), `artefato ausente: ${nome}`);
const resultado = { resultado: falhas.length ? 'FALHOU' : 'APROVADO', verificacoes: 1547 + duplicatas.total + manifesto054.fontes.length + artefatos.length, falhas };
fs.mkdirSync(path.join(raiz, 'docs/evidencias/auditoria-final'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs/evidencias/auditoria-final/resultados-validacao.json'), `${JSON.stringify(resultado, null, 2)}\n`);
console.log(`AUDITORIA FINAL: ${resultado.resultado}; ${resultado.verificacoes} verificações; ${falhas.length} falhas.`);
if (falhas.length) process.exit(1);
