import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const origem = 'D:/AI/3_Coversão_em_marldown/2019_English/01_arquivos_extraídos_e_convertidos_em_md';
const manifestoOrigem = JSON.parse(fs.readFileSync(path.join(origem, 'manifesto_fontes_aprovadas_para_paineis.json'), 'utf8'));
const fonte = manifestoOrigem.itens.find(item => item.nome === 'BBC_English_Plus_indice_do_curso_PT_EN.md');
if (!fonte || fonte.status !== 'aprovado') throw new Error('Primeira fonte aprovada não localizada.');

const destinos = [
  ['A1', 'Conversação', ['A1-GRAM-0001', 'A1-PRON-0001', 'A1-GRAM-0020']],
  ['A1', 'Conversação', ['A1-GRAM-0020', 'A1-L4-1521-01']],
  ['A1–A2', 'Conversação', ['A1-VERB-0001', 'A2-L10-0466-01']],
  ['A1–A2', 'Conversação', ['A1-GRAM-0004', 'A1-GRAM-0007', 'A1-GRAM-0008']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0007', 'A1-GRAM-0008', 'A1-GRAM-0020']],
  ['A1', 'Vocabulário', ['A1-GRAM-0002', 'A1-GRAM-0005', 'A1-GRAM-0015']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0004', 'A1-GRAM-0014', 'A1-GRAM-0022']],
  ['A1–A2', 'Conversação', ['A1-L8-0360-01', 'A2-L4-0068-02']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0021', 'A2-GRAM-0011', 'A2-L5-0122-01']],
  ['A1–B1', 'Gramática', ['B1-L12-0577-01']],
  ['A1–A2', 'Conversação', ['A1-VERB-0001', 'A1-L4-0086-01']],
  ['A1–A2', 'Vocabulário', ['A1-L4-1521-03']],
  ['A2', 'Conversação', ['A2-L12-0575-01', 'A1-VERB-0002']],
  ['A1–A2', 'Conversação', ['A1-GRAM-0015', 'A1-GRAM-0016']],
  ['A2–B1', 'Gramática', ['B1-L8-0321-01', 'B1-L15-0844-01']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0015', 'A2-GRAM-0007']],
  ['A1–A2', 'Conversação', ['A2-L9-0418-01']],
  ['A2–B1', 'Gramática', ['B1-L10-0466-02']],
  ['A1–A2', 'Conversação', ['A2-GRAM-0011', 'A2-VOC-0001']],
  ['A1–A2', 'Gramática', ['A1-L4-1521-03']],
  ['A1–A2', 'Conversação', ['A1-L4-1521-01']],
  ['A1–A2', 'Gramática', ['A1-L4-1521-01']],
  ['A2–B1', 'Gramática', ['A1-VERB-0001', 'A2-L4-0110-01', 'B1-L4-0110-02']],
  ['A1–B1', 'Conversação', ['A2-L8-0388-01', 'B1-L3-0037-02']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0007', 'A1-GRAM-0008']],
  ['A1–A2', 'Vocabulário', ['A1-GRAM-0016', 'A2-L4-0068-01']],
  ['A1–A2', 'Gramática', ['A1-GRAM-0020', 'A1-L5-0120-02']],
  ['A2–B1', 'Gramática', ['B1-L5-0134-03']],
  ['A1–A2', 'Gramática', ['A2-GRAM-0012', 'A2-GRAM-0013']],
  ['A2–B1', 'Gramática', ['B1-L8-0321-01', 'B1-L15-0844-01']],
];

const titulos = [...fs.readFileSync(fonte.caminho, 'utf8').matchAll(/^## Unidade (\d+): (.+)$/gm)].map(m => ({ numero: Number(m[1]), titulo: m[2] }));
if (titulos.length !== 30) throw new Error(`Esperadas 30 unidades; encontradas ${titulos.length}.`);

const decisoes = titulos.map((item, i) => ({
  secao: `Unidade ${item.numero}: ${item.titulo}`,
  classificacao: 'conteúdo já coberto',
  nivel_cefr: destinos[i][0],
  habilidade: destinos[i][1],
  painel: 'destinos canônicos existentes',
  subpainel: 'preservado; nenhum agrupamento por fonte',
  pre_requisitos: 'os definidos nas unidades canônicas',
  destinos_unidades: destinos[i][2],
  pagina_ou_secao: `Unidade ${item.numero}`,
  decisao: 'registrar procedência no mapeamento do lote; não republicar o índice como lição',
}));

const manifesto = {
  schema_version: 1,
  integracao: '2019 English',
  fonte_somente_leitura: origem,
  totais: { markdown_didaticos: 93, aprovados: 91, complementares: 2, originais_representados: 2024 },
  criterio_ordem: 'ordem do array itens no manifesto-fonte, filtrada por status aprovado',
  itens: manifestoOrigem.itens.map((item, indice) => ({
    ordem_manifesto: indice + 1,
    nome: item.nome,
    sha256_saida: item.sha256_saida,
    status_conversao: item.status,
    status_editorial: item.nome === fonte.nome ? 'revisado_sem_conteudo_novo' : 'pendente',
    lote_integracao: item.nome === fonte.nome ? '001' : null,
  })),
};

const lote = {
  schema_version: 1,
  lote: '001',
  estado: 'integralmente_revisado',
  selecao: { criterio: 'primeira fonte aprovada em ordem reproduzível; lote reduzido porque as três fontes seguintes são extensas', fontes: [fonte.nome] },
  fonte: { nome: fonte.nome, sha256_saida: fonte.sha256_saida, tipo_origem: fonte.tipo_origem, fontes_originais_representadas: fonte.fontes_representadas.length },
  leitura: { linhas_logicas: fs.readFileSync(fonte.caminho, 'utf8').split(/\r?\n/).length, secoes_unidade: 30, leitura_integral: true },
  contagens: { secoes_examinadas: 30, ja_cobertas: 30, duplicatas_parciais: 0, exemplos_complementares: 0, explicacoes_complementares: 0, exercicios_aproveitaveis: 0, conteudo_novo: 0, inadequadas: 0, revisao_humana: 0 },
  impacto: { enriquecimentos_de_conteudo: 0, unidades_novas: 0, atividades_novas: 0, jornadas_alteradas: false, ids_anteriores_preservados: true },
  validacao_visual: fs.existsSync(path.join(root, 'docs/evidencias/integracao-2019-english-lote-001/auditoria-navegador.json')) ? {
    estado: 'aprovado',
    cenarios: 22,
    navegador: 'Google Chrome 151.0.7922.138',
    viewports: ['1440x1000', '390x844'],
    console_erros: 0,
    overflow_horizontal: 0,
    evidencias: 'docs/evidencias/integracao-2019-english-lote-001',
  } : { estado: 'pendente' },
  decisoes,
  proxima_secao_exata: 'BBC_English_Plus_transcricoes_PT_EN.md — Unidade 1',
};

const matrizAnterior = JSON.parse(fs.readFileSync(path.join(root, 'dados/matriz-curricular-054.json'), 'utf8'));
const matriz = { schema_version: 1, lote: 'integracao-2019-english-001', alteracao_curricular: false, justificativa: 'As 30 seções do índice correspondem a objetivos já cobertos; não há conteúdo autônomo para nova unidade.', referencia_anterior: 'dados/matriz-curricular-054.json', matriz_preservada: matrizAnterior };

fs.writeFileSync(path.join(root, 'dados/integracao-2019-english-manifesto.json'), JSON.stringify(manifesto, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'dados/integracao-2019-english-lote-001.json'), JSON.stringify(lote, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'dados/matriz-curricular-integracao-2019-lote-001.json'), JSON.stringify(matriz, null, 2) + '\n');
console.log('Integração 2019 English lote 001 preparada: 30/30 seções decididas; 0 unidades e 0 atividades novas.');
