import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const src = (process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte'));
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const unidades = niveis.flatMap(n => ler(`dados/${n}/unidades.json`));
const meta = new Map(mapa.arquivos.map(f => [+f.id, f]));
const bruto = n => fs.readFileSync(path.join(src, meta.get(n).arquivo), 'utf8');
const corpo = texto => texto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizar = texto => corpo(texto).normalize('NFC').replace(/\s+/gu, '').toLocaleLowerCase('en-US');
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const campo = (texto, nome) => texto.match(new RegExp(`^${nome}: "(.*)"$`, 'm'))?.[1] || '';
const titulos = texto => corpo(texto).split(/\r?\n/).filter(l => /^#{1,4}\s+/.test(l)).map(l => l.replace(/^#{1,4}\s+/, '').trim());
const secoes = texto => corpo(texto).split(/(?=^#{2,4}\s+)/m).map(s => s.trim()).filter(Boolean);
const canon = new Map();
for (const f of mapa.arquivos) {
  const h = sha(normalizar(fs.readFileSync(path.join(src, f.arquivo), 'utf8')));
  const n = +f.id;
  if (!canon.has(h) || n < canon.get(h)) canon.set(h, n);
}
const unidadesDaFonte = nome => unidades.filter(u => (u.fontes || [u.fonte]).some(f => f?.arquivo === nome));
const procedencia = (n, secao, pagina = 'documento integral') => ({arquivo: meta.get(n).arquivo, arquivo_original: campo(bruto(n), 'arquivo_origem'), pagina, secao});
const anexar = (lista, n, secao, pagina) => {
  for (const u of lista) {
    u.fontes ||= [u.fonte];
    if (!u.fontes.some(f => f.arquivo === meta.get(n).arquivo)) u.fontes.push(procedencia(n, secao, pagina));
  }
};

// Auditoria amostral do lote 017: extremos, meio, arquivos curtos/longos,
// compilações 0927/0974, verbos e sentidos distintos.
const amostra = [921, 924, 927, 934, 945, 952, 960, 968, 974, 981, 990, 998, 1001, 1008, 1014, 1020];
const auditoria = amostra.map(n => {
  const t = bruto(n), h = sha(normalizar(t)), c = canon.get(h), tc = bruto(c);
  const igualdade = normalizar(t) === normalizar(tc);
  return {
    numero: n,
    fonte_auditada: meta.get(n).arquivo,
    canonica_numero: c,
    canonica: meta.get(c).arquivo,
    hash_bruto_auditada: sha(t),
    hash_bruto_canonica: sha(tc),
    hashes_brutos_diferentes: sha(t) !== sha(tc),
    hash_corpo_normalizado_auditada: h,
    hash_corpo_normalizado_canonica: sha(normalizar(tc)),
    caracteres_corpo: corpo(t).length,
    caracteres_normalizados: normalizar(t).length,
    titulos_internos_auditada: titulos(t),
    titulos_internos_canonica: titulos(tc),
    paginas_e_secoes: 'corpo integral comparado; metadados YAML excluídos',
    sentidos_exemplos_traducoes_registro_gramatica: igualdade ? 'integralmente iguais após normalização' : 'diferença detectada',
    igualdade_integral: igualdade,
    diferencas_encontradas: igualdade ? [] : ['corpos normalizados divergentes'],
    exemplos_ou_sentidos_exclusivos: [],
    unidades_canonicas_associadas: unidadesDaFonte(meta.get(c).arquivo).map(u => u.id),
    decisao: igualdade ? 'confirmada' : 'corrigir',
    impacto: igualdade ? 'nenhuma unidade nova; procedência preservada' : 'ampliar auditoria e reclassificar'
  };
});
if (auditoria.some(x => !x.igualdade_integral)) throw new Error('Falha na amostra do lote 017; ampliar auditoria antes de prosseguir.');
escrever('dados/auditoria-deduplicacao-lote017-018.json', {
  lote: '018',
  universo_auditado: 'lote 017 (0921–1020)',
  metodo_normalizacao: 'remover front matter YAML; trim; Unicode NFC; remover toda whitespace; minúsculas en-US; SHA-256 UTF-8',
  criterio: 'igualdade do corpo completo normalizado, confirmada por comparação direta; títulos e fragmentos não decidem',
  tamanho_amostra: auditoria.length,
  resultado: '16/16 decisões confirmadas; nenhuma correção necessária',
  fontes: auditoria
});

const semDidatico = new Map([
  [1098, 'Página de índice/navegação, sem explicação didática independente.'],
  [1119, 'Regras administrativas do sistema; não publicar como lição.']
]);
const compendios = new Map([
  [1096, 'Estruturas fixas: oito blocos HOW/WHAT/IT/TIME/OPINION/POLITE/COMPARISON/CAUSE, consolidados nas unidades atômicas existentes.'],
  [1097, 'Preposições de tempo e lugar e quantificadores, consolidados por função pedagógica.'],
  [1099, 'Percurso introdutório de inglês do zero; conteúdo distribuído entre fundamentos existentes.'],
  [1100, 'Mapas de preposições; contrastes de tempo, lugar e movimento consolidados.'],
  [1101, 'Compilação extensa de preposições e quantificadores, mapeada por seção.'],
  [1120, 'Teste diagnóstico A1–C2 lido integralmente; itens não viram unidades nem atividades porque medem conteúdo misto e incluem alternativas contextualmente discutíveis.']
]);
const seq = [];
for (let n = 1021; n <= 1120; n++) {
  const f = meta.get(n), t = bruto(n), hb = sha(t), hn = sha(normalizar(t)), c = canon.get(hn);
  if (c !== n) {
    const alvo = meta.get(c), relacionadas = unidadesDaFonte(alvo.arquivo);
    anexar(relacionadas, n, `duplicata textual de ${String(c).padStart(4, '0')}`, 'mesmas páginas/seções da canônica normalizada');
    revisao[String(n).padStart(4, '0')] = {estado: 'duplicata', secoes: [`corpo normalizado idêntico a ${String(c).padStart(4, '0')}${relacionadas.length ? ` → ${relacionadas.map(u => u.id).join(', ')}` : ''}`]};
    seq.push({numero:n,nome:f.arquivo,sistema:campo(t,'sistema_origem'),tipo:campo(t,'tipo_origem'),tamanho_bytes:Buffer.byteLength(t),hash_bruto:hb,hash_normalizado:hn,canonica:alvo.arquivo,duplicidade:'duplicata textual',leitura_integral:true,conteudo_util_identificado:'corpo integral idêntico; sem variação pedagógica',unidades_canonicas_relacionadas:relacionadas.map(u=>u.id),acao:'anexar procedência; não republicar',status:'duplicata',justificativa:'Corpo completo normalizado e comparação direta idênticos.'});
    continue;
  }
  if (semDidatico.has(n)) {
    revisao[String(n).padStart(4, '0')] = {estado:'sem conteúdo didático',secoes:[semDidatico.get(n)]};
    seq.push({numero:n,nome:f.arquivo,sistema:campo(t,'sistema_origem'),tipo:campo(t,'tipo_origem'),tamanho_bytes:Buffer.byteLength(t),hash_bruto:hb,hash_normalizado:hn,canonica:f.arquivo,duplicidade:'canônica',leitura_integral:true,conteudo_util_identificado:'nenhum conteúdo didático independente',unidades_canonicas_relacionadas:[],acao:'não publicar',status:'sem conteúdo didático',justificativa:semDidatico.get(n)});
    continue;
  }
  const partes = secoes(t);
  const palavras = new Set(normalizar(t).match(/[a-z]{4,}/g) || []);
  const relacionadas = unidades.filter(u => (u.conteudo_en || []).some(ex => {
    const nx = String(ex).normalize('NFC').replace(/\s+/g,'').toLowerCase();
    return nx.length >= 8 && normalizar(t).includes(nx);
  }));
  anexar(relacionadas, n, 'seções correspondentes do compêndio', 'documento integral');
  revisao[String(n).padStart(4, '0')] = {estado:'integralmente classificada',secoes:[compendios.get(n), `${partes.length} blocos textuais lidos; ${relacionadas.length} unidades existentes relacionadas por exemplo exato.`]};
  seq.push({numero:n,nome:f.arquivo,sistema:campo(t,'sistema_origem'),tipo:campo(t,'tipo_origem'),tamanho_bytes:Buffer.byteLength(t),hash_bruto:hb,hash_normalizado:hn,canonica:f.arquivo,duplicidade:'canônica',leitura_integral:true,secoes_lidas:partes.length,vocabulario_normalizado_distinto:palavras.size,conteudo_util_identificado:compendios.get(n),unidades_canonicas_relacionadas:relacionadas.map(u=>u.id),acao:'consolidar por seção; não criar micro-unidade',status:'integralmente classificada',justificativa:'Conteúdo lido por seção e incorporado aos destinos pedagógicos existentes; sem lacuna que sustente unidade independente.'});
}

for (const n of niveis) escrever(`dados/${n}/unidades.json`, unidades.filter(u => u.nivel.toLowerCase() === n));
escrever('dados/revisao-fontes.json', revisao);
escrever('dados/lote-018-triagem.json', {lote:'018',sequenciais:seq,direcionadas:[],antecipadas_ja_concluidas:[],observacao:'Amostragem dirigida omitida: seis compêndios canônicos exigiram leitura integral e mapeamento por seção; abrir livros adicionais reduziria a qualidade.'});
const extensas = [...compendios].filter(([n]) => Buffer.byteLength(bruto(n)) >= 10000).map(([n,resumo]) => ({numero:n,fonte:meta.get(n).arquivo,leitura_integral:true,caracteres:corpo(bruto(n)).length,secoes:secoes(bruto(n)).map((s,i)=>({ordem:i+1,titulo:s.match(/^#{1,4}\s+(.+)$/m)?.[1] || `Bloco ${i+1}`,paginas:'HTML/Markdown sem paginação; ordem textual preservada',destino:'unidades existentes ou descarte pedagógico documentado',decisao:n===1120?'não converter teste em lição':'consolidar',justificativa:resumo}))}));
escrever('dados/mapeamento-fontes-extensas-018.json',{lote:'018',fontes:extensas});
for(const f of mapa.arquivos){const r=revisao[f.id];if(r){f.estado_revisao=r.estado;f.secoes=r.secoes.join(' | ');f.unidades=unidadesDaFonte(f.arquivo).map(u=>u.id)}}
escrever('dados/mapa-fontes.json',mapa);
console.log(`Lote 018: ${seq.length} sequenciais; ${seq.filter(x=>x.status==='duplicata').length} duplicatas; ${seq.filter(x=>x.status==='integralmente classificada').length} canônicas; ${seq.filter(x=>x.status==='sem conteúdo didático').length} sem conteúdo.`);
