import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const origem = 'D:/AI/3_Coversão_em_marldown/2019_English/01_arquivos_extraídos_e_convertidos_em_md';
const nome = 'BBC_English_Plus_transcricoes_PT_EN.md';
const manifestoPath = path.join(root, 'dados/integracao-2019-english-manifesto.json');
const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'));
const item = manifesto.itens.find(x => x.nome === nome);
if (!item) throw new Error('Fonte de transcrições ausente do manifesto de integração.');
const texto = fs.readFileSync(path.join(origem, nome), 'utf8');
const unidade1 = texto.match(/^## Unidade 1\r?\n([\s\S]*?)(?=^## Unidade 2\r?$)/m)?.[0];
if (!unidade1) throw new Error('Unidade 1 não localizada.');
const pares = [...unidade1.matchAll(/^- \*\*EN:\*\*/gm)].length;
if (pares !== 73) throw new Error(`Esperados 73 pares EN-PT na Unidade 1; encontrados ${pares}.`);

const decisoes = [
  ['Apresentar-se e dizer o nome', 'conteúdo já coberto', ['A1-L5-0168-04', 'A1-GRAM-0001']],
  ['Cumprimentos por período do dia', 'conteúdo já coberto', ['A2-L10-1377-01', 'A2-L10-1378-01']],
  ['Recepção formal e encaminhamento', 'exemplo complementar', ['A2-L10-1377-01', 'B1-L15-0836-01']],
  ['Perguntar e confirmar nomes com cortesia', 'conteúdo já coberto', ['A1-L4-1521-01', 'A1-L5-0168-04']],
  ['Identificação, correção e pedido de desculpas', 'conteúdo já coberto', ['A1-L5-0168-04', 'A2-L10-1377-01']],
  ['Apresentações mútuas e respostas curtas com be', 'conteúdo já coberto', ['A1-L5-0168-04', 'A1-GRAM-0001']],
  ['Confirmação de número em chamada telefônica', 'exemplo complementar', ['A1-L4-0086-01', 'A2-L10-1377-01']],
].map(([secao, classificacao, destinos], indice) => ({ ordem: indice + 1, unidade_fonte: 1, secao, classificacao, nivel_cefr: 'A1', habilidade: indice === 6 ? 'Conversação e Escuta' : 'Conversação', painel: 'a1-conversacao', subpainel: indice === 6 ? 'Comunicação e informação' : 'Interação e prática integrada', destinos_unidades: destinos, decisao: classificacao === 'exemplo complementar' ? 'preservar procedência e contexto sem republicar o diálogo' : 'consolidar em unidade canônica existente', atividade: 'não criada; o bloco é diálogo contextual e não oferece resposta única sem reproduzir o material' }));

const lote = {
  schema_version: 1,
  lote: '002',
  estado: 'parcialmente_analisado',
  fonte: { nome, sha256_saida: item.sha256_saida, unidades_totais: 30, unidades_concluidas: [1], unidades_pendentes: [2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30] },
  leitura: { unidade: 1, linhas: unidade1.split(/\r?\n/).length, pares_en_pt: pares, leitura_integral_da_unidade: true },
  contagens: { secoes_examinadas: 7, ja_cobertas: 5, duplicatas_parciais: 0, exemplos_complementares: 2, explicacoes_complementares: 0, exercicios_aproveitaveis: 0, conteudo_novo: 0, inadequadas: 0, revisao_humana: 0 },
  impacto: { enriquecimentos_de_procedencia: 2, unidades_novas: 0, atividades_novas: 0, jornadas_alteradas: false, ids_anteriores_preservados: true },
  decisoes,
  proxima_secao_exata: 'BBC_English_Plus_transcricoes_PT_EN.md — Unidade 2',
};

item.status_editorial = 'parcialmente_analisado';
item.lote_integracao = '002';
item.progresso_secoes = { unidades_concluidas: 1, unidades_totais: 30 };
fs.writeFileSync(manifestoPath, JSON.stringify(manifesto, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'dados/integracao-2019-english-lote-002.json'), JSON.stringify(lote, null, 2) + '\n');
console.log('Lote 002 preparado: Unidade 1 integral, 7 seções decididas, fonte parcial 1/30.');
