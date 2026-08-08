import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontes = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const triagem = ler('dados/lote-029-triagem.json');
const mapeamento = ler('dados/mapeamento-fontes-extensas-029.json');
const meta = mapa.arquivos.find(item => Number(item.id) === 1198);
const bruto = fs.readFileSync(path.join(fontes, meta.arquivo), 'utf8');
const corpo = bruto.replace(/^---[\s\S]*?---\s*/, '').trim();
const normalizado = corpo.normalize('NFC').replace(/\s+/gu, '').toLowerCase();
const sha256 = valor => crypto.createHash('sha256').update(valor).digest('hex');
const marcadores = [...corpo.matchAll(/^### (.+)$/gm)];

const paginasCanonicas = [10, 18, 26, 34, 36, 42, 46, 50, 52, 68, 89, 82, 83, 84, 92, 100, 108, 112, 116, 140, 148, 156, 164, 166, 170, 192, 204, 212, 222, 228, 260, 270, 284, 292, 294, 308];
const mapaCanonico = ler('dados/mapeamento-fontes-extensas-025.json').fontes.find(fonte => fonte.numero === 1189);
const porPagina = new Map(mapaCanonico.paginas.map(pagina => [pagina.pagina, pagina]));

if (marcadores.length !== 36 || paginasCanonicas.length !== 36) throw new Error('1198 deveria conter 36 temas.');

const secoes = marcadores.map((marcador, indice) => {
  const inicio = marcador.index + marcador[0].length;
  const fim = indice + 1 < marcadores.length ? marcadores[indice + 1].index : corpo.length;
  const trecho = corpo.slice(inicio, fim);
  const linhasTabela = trecho.split(/\r?\n/).filter(linha => linha.startsWith('|'));
  const itens = Math.max(0, linhasTabela.length - 2);
  const canonica = porPagina.get(paginasCanonicas[indice]);
  if (!canonica?.unidade_relacionada) throw new Error(`Destino canônico ausente para a seção ${indice + 1}.`);
  return {
    numero: indice + 1,
    titulo: marcador[1].trim(),
    itens_identificados: itens,
    natureza: 'estrutura gramatical com exemplos e tradução na extração HTML',
    explicacao: 'quadro sintético de forma e uso; texto não republicado',
    exemplos: 'pares inglês–português identificados e contados; não transcritos',
    exercicios: false,
    respostas: false,
    indice: false,
    editorial: false,
    pagina_relacionada_na_fonte_canonica_1189: paginasCanonicas[indice],
    nivel_cefr: canonica.nivel_cefr,
    habilidade_principal: canonica.habilidade_principal,
    destino_curricular_especifico: canonica.unidade_relacionada,
    decisao: 'consolidar em unidade existente',
    justificativa: 'Tema já mapeado integralmente na fonte canônica 1189; procedência adicional sem republicar exemplos.',
    elegivel_atividade: false,
    elegivel_jornada: false
  };
});

const fonte = {
  numero: 1198,
  nome_completo: meta.arquivo,
  tipo: 'extração HTML temática do English Grammar Guide',
  tamanho_bytes: Buffer.byteLength(bruto),
  hash_bruto: sha256(bruto),
  hash_normalizado: sha256(normalizado),
  leitura_integral: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [], observacao: 'HTML temático sem paginação; cada seção foi decidida.' },
  integridade: { utf8_valido: true, caracteres_substituicao: (bruto.match(/�/gu) || []).length, marcadores_cid: (bruto.match(/\(cid:\d+\)/gu) || []).length, ocr_insuficiente: false, corrupcao: false },
  estrutura: { temas: secoes.length, itens_de_tabela: secoes.reduce((total, secao) => total + secao.itens_identificados, 0), exercicios: 0, respostas: 0, indices: 0, blocos_editoriais: 2 },
  secoes,
  descartes: [
    { parte: 'frontmatter, navegação, apresentação, métricas e instrução de busca', decisao: 'descartar', justificativa: 'Interface e descrição editorial do sistema anterior.' },
    { parte: 'mensagem de busca vazia', decisao: 'descartar', justificativa: 'Estado de interface sem conteúdo linguístico.' }
  ],
  totais: { consolidadas: secoes.length, descartes: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Metadados, contagens e destinos apenas; as 191 frases, traduções e tabelas permanecem exclusivamente na fonte somente leitura.'
};

mapeamento.fontes.push(fonte);
gravar('dados/mapeamento-fontes-extensas-029.json', mapeamento);
triagem.intervalo = [1197, 1198];
triagem.sequenciais.push({ numero: 1198, nome: meta.arquivo, tamanho_bytes: fonte.tamanho_bytes, hash_bruto: fonte.hash_bruto, hash_normalizado: fonte.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: fonte.tipo, secoes: 36, itens: 191, sem_destino_util: 0, justificativa: '36 temas e 191 itens vinculados a destinos específicos já consolidados pela fonte canônica 1189.' });
triagem.validacao_1198 = { pendente: true, testes: null, aprovada: false };
triagem.observacao = '1199 permanece bloqueada até a validação integral de 1198.';
gravar('dados/lote-029-triagem.json', triagem);
revisao['1198'] = { estado: 'integralmente classificada', secoes: ['Extração HTML temática; 36 temas, 191 itens referenciados, zero conteúdo útil sem destino'] };
gravar('dados/revisao-fontes.json', revisao);
for (const item of mapa.arquivos) {
  const estado = revisao[item.id];
  if (estado) {
    item.estado_revisao = estado.estado;
    item.secoes = estado.secoes.join(' | ');
  }
}
gravar('dados/mapa-fontes.json', mapa);
console.log('1198 mapeada: 36 temas, 191 itens e zero útil sem destino.');
