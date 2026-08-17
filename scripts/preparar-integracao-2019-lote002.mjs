import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const origem = 'D:/AI/3_Coversão_em_marldown/2019_English/01_arquivos_extraídos_e_convertidos_em_md';
const nome = 'BBC_English_Plus_transcricoes_PT_EN.md';
const manifestoPath = path.join(root, 'dados/integracao-2019-english-manifesto.json');
const manifesto = JSON.parse(fs.readFileSync(manifestoPath, 'utf8'));
const item = manifesto.itens.find(x => x.nome === nome);
if (!item) throw new Error('Fonte de transcrições ausente do manifesto de integração.');
const fontePath = path.join(origem, nome);
const texto = fs.readFileSync(fontePath, 'utf8');
const sha256 = crypto.createHash('sha256').update(fs.readFileSync(fontePath)).digest('hex');
if (sha256 !== item.sha256_saida) throw new Error(`SHA-256 da fonte divergiu do manifesto: ${sha256}.`);

const analises = [
  { unidade: 1, blocos: [
    ['Apresentar-se e dizer o nome', 'ja_coberto_integralmente', ['A1-L5-0168-04', 'A1-GRAM-0001']],
    ['Cumprimentos por período do dia', 'ja_coberto_integralmente', ['A2-L10-1377-01', 'A2-L10-1378-01']],
    ['Recepção formal e encaminhamento', 'contexto_util_nao_publicado', ['A2-L10-1377-01', 'B1-L15-0836-01']],
    ['Perguntar e confirmar nomes com cortesia', 'ja_coberto_integralmente', ['A1-L4-1521-01', 'A1-L5-0168-04']],
    ['Identificação, correção e pedido de desculpas', 'ja_coberto_integralmente', ['A1-L5-0168-04', 'A2-L10-1377-01']],
    ['Apresentações mútuas e respostas curtas com be', 'ja_coberto_integralmente', ['A1-L5-0168-04', 'A1-GRAM-0001']],
    ['Confirmação de número em chamada telefônica', 'contexto_util_nao_publicado', ['A1-L4-0086-01', 'A2-L10-1377-01']],
  ]},
  { unidade: 2, blocos: [
    ['Cumprimentar, apresentar pessoas e responder formalmente', 'ja_coberto_com_exemplos_equivalentes', ['A1-L5-0168-04', 'A2-L10-1377-01']],
    ['Identificar pessoas e relações familiares com who, that e be', 'ja_coberto_com_exemplos_equivalentes', ['A2-L3-0053-01', 'A2-L15-0823-01']],
    ['Expressar relações pessoais com possessivos e genitivo', 'ja_coberto_integralmente', ['A1-GRAM-0020', 'A1-L5-0120-04', 'A2-CONV-0001']],
    ['Soletrar nome e sobrenome em interação', 'contexto_util_nao_publicado', ['A2-L10-1377-01', 'A2-L15-0829-01']],
    ['Informar endereço e telefone', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'A2-L10-1377-01']],
    ['Confirmar identidade e corrigir engano ao telefone', 'contexto_util_nao_publicado', ['A1-L4-0086-01', 'A2-L10-1377-01']],
  ]},
  { unidade: 3, blocos: [
    ['Oferecer e pedir ajuda com can', 'ja_coberto_integralmente', ['A1-VERB-0001', 'A2-L15-0832-01']],
    ['Dar instruções e fazer pedidos com imperativo e please', 'ja_coberto_com_exemplos_equivalentes', ['B1-L6-0173-01', 'A2-L10-1380-01']],
    ['Oferecer-se para agir com shall', 'ja_coberto_integralmente', ['B1-L3-0055-04']],
    ['Indicar posição com here e there', 'ja_coberto_com_exemplos_equivalentes', ['A2-L14-0742-01']],
    ['Interpretar placas e expressar permissão ou proibição', 'ja_coberto_integralmente', ['A1-VERB-0001', 'A1-VERB-0002']],
    ['Recepcionar hóspedes e cuidar da bagagem', 'contexto_util_nao_publicado', ['A2-L15-0832-01', 'B1-L15-0836-01']],
  ]},
  { unidade: 4, blocos: [
    ['Dar direções com left, right e straight ahead', 'ja_coberto_com_exemplos_equivalentes', ['A2-L4-0111-01', 'A2-L14-0742-01']],
    ['Perguntar onde ficam serviços públicos', 'ja_coberto_com_exemplos_equivalentes', ['A2-L5-0166-01', 'A2-L15-0832-01']],
    ['Localizar lugares com there is e preposições', 'ja_coberto_integralmente', ['A1-L7-0264-01', 'A2-L14-0742-01']],
    ['Perguntar pelo lugar mais próximo', 'ja_coberto_com_exemplos_equivalentes', ['A2-L4-0111-01', 'A2-L4-0068-02']],
    ['Expressar desconhecimento e incerteza ao orientar', 'ja_coberto_com_exemplos_equivalentes', ['B1-L5-0149-02', 'A2-L15-0832-01']],
    ['Encadear orientação urbana até hotel com mapa e pontos de referência', 'contexto_util_nao_publicado', ['A2-L14-0742-01', 'B1-L15-0836-01']],
  ]},
  { unidade: 5, blocos: [
    ['Perguntar e informar onde uma pessoa está', 'ja_coberto_integralmente', ['A2-L5-0166-01', 'A1-L6-0203-01']],
    ['Usar at e in para locais e atividades', 'ja_coberto_integralmente', ['A1-GRAM-0010', 'A2-L6-0203-02']],
    ['Contrastar estar em um local e ter ido para lá', 'ja_coberto_integralmente', ['B1-L15-0844-01']],
    ['Perguntar por hóspedes e verificar quarto ou dependência do hotel', 'contexto_util_nao_publicado', ['A2-L15-0832-01', 'B1-L15-0836-01']],
    ['Expressar incerteza sobre paradeiro com I think e I do not know', 'ja_coberto_com_exemplos_equivalentes', ['B1-L5-0149-02', 'A2-L15-0829-01']],
    ['Relatar sequência de localizações em um itinerário', 'contexto_util_nao_publicado', ['A2-L14-0742-01', 'A2-L10-1377-01']],
  ]},
  { unidade: 6, blocos: [
    ['Perguntar e dizer horas exatas e fracionadas', 'ja_coberto_integralmente', ['A1-GRAM-0002', 'A2-L5-0128-02']],
    ['Usar at com horários', 'ja_coberto_integralmente', ['A1-GRAM-0005']],
    ['Informar horários de abertura e fechamento por dia', 'ja_coberto_com_exemplos_equivalentes', ['A1-GRAM-0015', 'A2-L15-0832-01']],
    ['Perguntar e informar partidas e chegadas de trens', 'contexto_util_nao_publicado', ['A2-L5-0128-02', 'B1-L15-0836-01']],
    ['Reagir a atraso e perda de horário', 'ja_coberto_com_exemplos_equivalentes', ['B1-L6-0201-02', 'A2-L10-1377-01']],
    ['Comparar horas simultâneas em diferentes fusos', 'contexto_util_nao_publicado', ['A1-GRAM-0002', 'A2-L10-1377-01']],
  ]},
  { unidade: 7, blocos: [
    ['Identificar bagagem e pedir abertura na alfândega', 'contexto_util_nao_publicado', ['B1-L3-0053-03', 'B2-L6-0173-02']],
    ['Identificar objetos com this, that, these e those', 'ja_coberto_com_exemplos_equivalentes', ['A2-GRAM-0010', 'B1-L3-0053-04']],
    ['Descrever mapa e paisagem com cores e substantivos', 'ja_coberto_com_exemplos_equivalentes', ['A2-L14-0742-01', 'A2-L15-0823-01']],
    ['Orientar deslocamento com straight ahead e this way', 'ja_coberto_integralmente', ['A2-L4-0111-01', 'A2-L14-0742-01']],
    ['Conduzir quiz de identificação sobre pontos turísticos', 'conteudo_sem_objetivo_independente', ['A2-L10-1377-01']],
    ['Perguntar e informar idade, comprimento e altura', 'ja_coberto_integralmente', ['A1-L4-0068-01', 'A1-L4-1521-03', 'A2-L4-0068-03']],
  ]},
  { unidade: 8, blocos: [
    ['Expressar gostos e rejeição com like e not at all', 'ja_coberto_integralmente', ['A1-L8-0336-01', 'A2-L15-0829-01']],
    ['Pedir e dar opinião com What do you think of', 'ja_coberto_integralmente', ['B1-L5-0149-01', 'B1-L5-0149-02']],
    ['Comparar preferências com prefer e prefer to', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'B1-L6-0177-01']],
    ['Receber visitas e oferecer bebida na casa nova', 'contexto_util_nao_publicado', ['A2-L10-1377-01', 'A2-L15-0823-01']],
    ['Propor programas com shall e decidir ficar em casa', 'ja_coberto_integralmente', ['B1-L3-0055-04', 'A2-L10-1377-01']],
    ['Consultar horários de cinema, concerto e televisão', 'contexto_util_nao_publicado', ['A1-GRAM-0005', 'A2-L5-0128-02']],
  ]},
  { unidade: 9, blocos: [
    ['Dizer o que se tem com have got', 'ja_coberto_com_exemplos_equivalentes', ['A2-L11-0533-01', 'A2-L11-0534-01']],
    ['Perguntar por disponibilidade com have you got, some e any', 'ja_coberto_integralmente', ['A1-GRAM-0021', 'A2-GRAM-0011', 'B1-L11-0533-02']],
    ['Receber clientes e reservar mesa em restaurante', 'contexto_util_nao_publicado', ['A2-L15-0832-01', 'B1-L15-0836-01']],
    ['Anotar e confirmar pedido de comida e bebida', 'contexto_util_nao_publicado', ['A2-L15-0823-01', 'B1-L10-0466-02']],
    ['Perguntar por garagem ou hotel e dar direções', 'ja_coberto_com_exemplos_equivalentes', ['A2-L4-0111-01', 'A2-L14-0742-01']],
    ['Distinguir hotel e restaurante ao pedir quarto', 'conteudo_sem_objetivo_independente', ['A2-L15-0832-01']],
  ]},
  { unidade: 10, blocos: [
    ['Perguntar e dizer o que alguém está fazendo', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'B1-L15-0844-01']],
    ['Contrastar ação em curso e rotina habitual', 'ja_coberto_com_exemplos_equivalentes', ['B1-L15-0844-01', 'A2-L6-0201-01']],
    ['Descrever rotina com always, every e never', 'ja_coberto_integralmente', ['A2-L15-0829-01', 'A2-L6-0201-01']],
    ['Relatar notícias pessoais de cartão-postal', 'contexto_util_nao_publicado', ['A2-L10-1377-01', 'A2-L15-0829-01']],
    ['Descrever ações simultâneas em chamada telefônica', 'contexto_util_nao_publicado', ['A1-L4-0086-01', 'B1-L15-0844-01']],
    ['Combinar programa futuro com presente contínuo', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'A2-L10-1377-01']],
  ]},
  { unidade: 11, blocos: [
    ['Recepcionar visitante, confirmar nome e encaminhar ao escritório', 'contexto_util_nao_publicado', ['A2-L10-1377-01', 'B1-L15-0836-01']],
    ['Recusar acesso momentâneo com I am afraid e explicar por quê', 'ja_coberto_integralmente', ['B2-L6-0173-02', 'B1-L5-0149-02']],
    ['Identificar interlocutores e transferir chamada telefônica', 'ja_coberto_com_exemplos_equivalentes', ['A1-L4-0086-01', 'A2-L10-1377-01']],
    ['Marcar visita informando hotel, quarto e horário', 'contexto_util_nao_publicado', ['A2-L15-0829-01', 'A2-L5-0128-02']],
    ['Combinar entrega no quarto com shall e will', 'ja_coberto_com_exemplos_equivalentes', ['B1-L3-0055-04', 'A2-L15-0832-01']],
    ['Confirmar quarto e identidade ao chegar', 'conteudo_sem_objetivo_independente', ['A2-L10-1377-01']],
    ['Perguntar por contato e planos de outra pessoa', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'A2-L15-0823-01']],
  ]},
  { unidade: 12, blocos: [
    ['Identificar pessoa por roupa, porte e objeto carregado', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0823-01', 'B1-L3-0053-03']],
    ['Procurar hóspede informando nome completo e quarto', 'contexto_util_nao_publicado', ['A2-L15-0832-01', 'B1-L15-0836-01']],
    ['Perguntar e descrever aparência física e vestuário', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0823-01', 'A2-L15-0829-01']],
    ['Informar idade e altura em sistemas métrico e imperial', 'ja_coberto_integralmente', ['A1-L4-1521-03', 'A2-L4-0068-03']],
    ['Comparar cabelo, altura e idade', 'ja_coberto_com_exemplos_equivalentes', ['B1-L6-0237-01', 'A2-L15-0823-01']],
    ['Reunir duas pessoas que se procuram', 'conteudo_sem_objetivo_independente', ['A2-L10-1377-01']],
  ]},
  { unidade: 13, blocos: [
    ['Pedir permissão e responder com may, can e afraid not', 'ja_coberto_integralmente', ['A1-VERB-0001', 'B2-L6-0173-02']],
    ['Interpretar placas e proibições em espaços públicos', 'ja_coberto_integralmente', ['A1-VERB-0002', 'A2-L15-0832-01']],
    ['Pedir e servir bebidas com may I have e would you', 'ja_coberto_com_exemplos_equivalentes', ['A1-GRAM-0021', 'B1-L10-0466-02']],
    ['Pedir conta e táxi com cortesia', 'contexto_util_nao_publicado', ['B2-L6-0173-02', 'A2-L15-0832-01']],
    ['Fazer sugestões com shall e let us', 'ja_coberto_integralmente', ['B1-L3-0055-04', 'A2-L10-1377-01']],
    ['Negociar programa conforme gostos e proximidade', 'contexto_util_nao_publicado', ['A2-L15-0829-01', 'A2-L4-0111-01']],
  ]},
  { unidade: 14, blocos: [
    ['Nomear andares com ordinais e ground floor', 'ja_coberto_com_exemplos_equivalentes', ['A2-L4-0068-03', 'A2-L14-0742-01']],
    ['Localizar escritório por andar, sala e referência', 'ja_coberto_com_exemplos_equivalentes', ['A2-L14-0742-01', 'A2-L15-0832-01']],
    ['Orientar deslocamento interno com lift, upstairs e downstairs', 'contexto_util_nao_publicado', ['A2-L14-0742-01', 'A2-L4-0111-01']],
    ['Convidar para jantar e combinar restaurante', 'ja_coberto_com_exemplos_equivalentes', ['A2-L10-1377-01', 'A2-L15-0829-01']],
    ['Dar percurso com turn e turning numerado', 'ja_coberto_integralmente', ['A2-L4-0111-01', 'A2-L14-0742-01']],
    ['Contrastar numeração de andares no inglês britânico e americano', 'contexto_util_nao_publicado', ['A2-L14-0742-01']],
  ]},
  { unidade: 15, blocos: [
    ['Informar saída para almoço e retorno ao escritório', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0829-01', 'B1-L15-0844-01']],
    ['Atender chamada e informar ausência e horário de retorno', 'contexto_util_nao_publicado', ['A1-L4-0086-01', 'A2-L5-0128-02']],
    ['Decidir voltar ao trabalho ou permanecer no café', 'conteudo_sem_objetivo_independente', ['A2-L10-1377-01']],
    ['Procurar pessoa e oferecer-se para encontrá-la', 'ja_coberto_com_exemplos_equivalentes', ['A2-L15-0832-01', 'A2-L10-1377-01']],
    ['Pedir que a pessoa ligue novamente em horário combinado', 'contexto_util_nao_publicado', ['A1-L4-0086-01', 'A2-L5-0128-02']],
    ['Perguntar onde alguém esteve com present perfect', 'ja_coberto_integralmente', ['B1-L15-0844-01']],
    ['Consultar mensagens e informar retorno futuro', 'ja_coberto_com_exemplos_equivalentes', ['A2-L10-1377-01', 'A2-L15-0829-01']],
  ]},
];

const secoes = [...texto.matchAll(/^## Unidade (\d+)\r?\n([\s\S]*?)(?=^## Unidade \d+\r?$|(?![\s\S]))/gm)]
  .map(m => ({ unidade: Number(m[1]), texto: m[0] }));
if (secoes.length !== 30) throw new Error(`Esperadas 30 unidades; encontradas ${secoes.length}.`);
const leituras = analises.map(analise => {
  const secao = secoes.find(x => x.unidade === analise.unidade);
  if (!secao) throw new Error(`Unidade ${analise.unidade} não localizada.`);
  const paresEn = [...secao.texto.matchAll(/^- \*\*EN:\*\*/gm)].length;
  const paresPt = [...secao.texto.matchAll(/^  \*\*PT:\*\*/gm)].length;
  if (paresEn !== paresPt) throw new Error(`Unidade ${analise.unidade}: EN=${paresEn}, PT=${paresPt}.`);
  return { unidade: analise.unidade, linhas: secao.texto.trimEnd().split(/\r?\n/).length, pares_en_pt: paresEn, campos_pt_preenchidos: [...secao.texto.matchAll(/^  \*\*PT:\*\*[^\S\r\n]+[^\s\r\n]/gm)].length, blocos_pedagogicos: analise.blocos.length, leitura_integral_da_unidade: true };
});

const decisoes = analises.flatMap(analise => analise.blocos.map(([secao, classificacao, destinos], indice) => {
  const contexto = classificacao === 'contexto_util_nao_publicado';
  return {
    ordem_na_unidade: indice + 1, unidade_fonte: analise.unidade, secao, classificacao,
    nivel_cefr: 'A1-A2', habilidade: 'Conversação, escuta e uso funcional', destinos_unidades: destinos,
    decisao_editorial: contexto ? 'preservar somente a procedência e a decisão editorial' : 'consolidar no destino canônico sem alterar conteúdo publicado',
    atividade: 'não criada; o trecho depende do diálogo e não oferece resposta única sem reproduzir a fonte',
    ...(contexto ? {
      unidade_canonica: destinos[0],
      objetivo_comunicativo: secao,
      conteudo_exclusivo: secao,
      motivo_concreto: `O valor exclusivo está no encadeamento situacional de “${secao}”; as estruturas necessárias para cumprir esse objetivo já são ensinadas nos destinos indicados.`,
      risco_redundancia: 'A publicação repetiria estruturas e funções comunicativas já cobertas pelas unidades canônicas indicadas.',
      risco_fragmentacao: 'Separar o cenário da fonte criaria uma micro-unidade dependente do diálogo, sem progressão pedagógica autônoma.',
      decisao_final_nao_publicacao: 'Não publicar; preservar somente a decisão e a procedência, sem reproduzir a transcrição.',
    } : {}),
  };
}));

const concluidas = analises.map(x => x.unidade);
const pendentes = Array.from({ length: 30 }, (_, i) => i + 1).filter(x => !concluidas.includes(x));
const rotulos = ['ja_coberto_integralmente','ja_coberto_com_exemplos_equivalentes','enriquecimento_de_unidade_existente','nova_unidade_necessaria','contexto_util_nao_publicado','duplicata_interna_da_fonte','conteudo_sem_objetivo_independente','revisao_editorial_necessaria'];
const porClasse = Object.fromEntries(rotulos.map(k => [k, decisoes.filter(x => x.classificacao === k).length]));
const lote = {
  schema_version: 2, lote: '002', estado: pendentes.length ? 'parcialmente_analisado' : 'analisado_integralmente',
  fonte: { nome, sha256_saida: item.sha256_saida, unidades_totais: 30, unidades_concluidas: concluidas, unidades_pendentes: pendentes },
  leituras,
  contagens: { unidades_examinadas: concluidas.length, pares_en_pt: leituras.reduce((n,x) => n + x.pares_en_pt, 0), blocos_pedagogicos: decisoes.length, por_classificacao: porClasse },
  impacto: { enriquecimentos_de_unidade: porClasse.enriquecimento_de_unidade_existente, contextos_uteis_nao_publicados: porClasse.contexto_util_nao_publicado, unidades_novas: porClasse.nova_unidade_necessaria, atividades_novas: 0, jornadas_alteradas: false, ids_anteriores_preservados: true },
  decisoes, proxima_secao_exata: pendentes.length ? `${nome} — Unidade ${pendentes[0]}` : null,
};
item.status_editorial = pendentes.length ? 'parcialmente_analisado' : 'analisado_integralmente';
item.lote_integracao = '002';
item.progresso_secoes = { unidades_concluidas: concluidas.length, unidades_totais: 30 };
fs.writeFileSync(manifestoPath, JSON.stringify(manifesto, null, 2) + '\n');
fs.writeFileSync(path.join(root, 'dados/integracao-2019-english-lote-002.json'), JSON.stringify(lote, null, 2) + '\n');
console.log(`Lote 002 preparado: ${concluidas.length}/30 unidades, ${lote.contagens.pares_en_pt} pares e ${decisoes.length} blocos decididos.`);
