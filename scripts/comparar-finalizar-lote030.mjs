import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const norm = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g,'\n').replace(/[ \t]+/g,' ').replace(/\n{3,}/g,'\n\n').trim();
const texto1200 = fs.readFileSync(path.join(fonteDir, '1200_livro03_3.md'), 'utf8');
const texto1201 = fs.readFileSync(path.join(fonteDir, '1201_livro04_3.md'), 'utf8');
const mapa = ler('dados/mapeamento-fontes-extensas-030.json');
const triagem = ler('dados/lote-030-triagem.json');
const destinos = [
 ['Verbos de ação e estado','A2-L8-0336-02','Gramática'],
 ['Saúde, tempo e temperatura','A1-GRAM-0002','Vocabulário'],
 ['Comparativos, superlativos e números','A2-GRAM-0006','Gramática'],
 ['Datas e passado de be','A1-GRAM-0016','Gramática'],
 ['Passado simples regular e irregular','A2-L15-0829-01','Gramática'],
 ['Perguntas de sujeito e objeto','A2-L20-1163-01','Gramática'],
 ['Pronomes indefinidos e perguntas-eco','A2-L15-0829-01','Conversação'],
 ['Futuro com present continuous e going to','B1-L3-0055-02','Gramática'],
 ['Will, might, should e could','B1-L6-0185-01','Gramática'],
 ['Present perfect e passado simples','B1-L8-0321-01','Gramática'],
 ['Restaurante, desejos e planos','A2-L12-0571-01','Conversação'],
 ['Tabela Review das unidades 11–49','A2-L11-1336-01','Leitura']
];
const headings = [...texto1201.matchAll(/^## (.+)$/gm)].map(m => m[1].trim());
if (headings.length !== 12) throw new Error(`1201: esperados 12 blocos, encontrados ${headings.length}.`);
const secoes = destinos.map(([titulo,destino,habilidade],i) => ({ numero:i+1, titulo, titulo_na_extracao:headings[i], natureza:i===11?'tabela editorial Review com estruturas e frases-modelo':'síntese temática com frases completas e traduções', nivel_cefr:'A2', habilidade_principal:habilidade, destino_curricular_especifico:destino, fonte_canonica_relacionada:1195, decisao:i===11?'referenciar cobertura em destino existente':'consolidar procedência em destino existente', justificativa:'Conteúdo já coberto por unidades existentes e pela classificação integral da fonte canônica 1195; frases e respostas não republicadas.', elegivel_atividade:false, elegivel_jornada:false }));
const f1201 = { numero:1201, nome_completo:'1201_livro04_3.md', tipo:'extração HTML temática do Practice Book Level 2 Beginner', tamanho_bytes:Buffer.byteLength(texto1201), hash_bruto:sha(texto1201), hash_normalizado:sha(norm(texto1201)), leitura_integral:true, paginacao:{possui_marcadores:false,presentes:0,ausentes:[],repetidas:[],vazias:[],observacao:'Extração HTML temática sem marcadores de página; os 12 blocos foram decididos.'}, integridade:{utf8_valido:true,caracteres_substituicao:(texto1201.match(/�/gu)||[]).length,marcadores_cid:(texto1201.match(/\(cid:\d+\)/gu)||[]).length,ocr_insuficiente:false,corrupcao:false}, estrutura:{blocos_didaticos:12,unidades_do_livro_referidas:49,exercicios_brutos:0,respostas_separadas:0,indices:0,tabela_review:1,blocos_editoriais:4}, secoes, descartes:[{parte:'frontmatter, navegação, apresentação e métricas',decisao:'descartar',justificativa:'Metadados e interface do sistema anterior.'},{parte:'estado de busca vazia',decisao:'descartar',justificativa:'Mensagem de interface sem conteúdo linguístico.'}], totais:{consolidadas:11,referenciadas:1,descartes:2,uteis_sem_destino:0}, observacao_publica:'Somente metadados, decisões e destinos; nenhuma frase, tradução, tabela, página, exercício ou resposta foi republicada.' };
const f1200 = mapa.fontes.find(f=>f.numero===1200);
mapa.fontes = [f1200,f1201];
mapa.comparacoes_integrais = [{ fontes:[1200,1201], executada_apos_validacao_1200:true, tamanho_1200:Buffer.byteLength(texto1200), tamanho_1201:Buffer.byteLength(texto1201), hash_bruto_1200:sha(texto1200), hash_bruto_1201:sha(texto1201), hash_normalizado_1200:sha(norm(texto1200)), hash_normalizado_1201:sha(norm(texto1201)), corpo_integral_igual:norm(texto1200)===norm(texto1201), ordem_igual:false, blocos_1200:12, blocos_1201:12, nivel_1200:'A1', nivel_1201:'A2', exercicios_brutos_1200:0, exercicios_brutos_1201:0, respostas_separadas_1200:0, respostas_separadas_1201:0, ausencias_1200:[], ausencias_1201:[], sobreposicao:'extensa apenas na função editorial de selecionar frases completas de livros de prática; tópicos e progressão são distintos', conteudo_exclusivo_1200:'negativas, perguntas iniciais, existência, frequência, preferências e habilidade do nível 1', conteudo_exclusivo_1201:'estado, saúde, comparação, passado, futuros, modais e present perfect do nível 2', classificacao:'obras independentes e complementares em níveis diferentes', decisao:'classificar separadamente e consolidar procedência nas fontes canônicas 1193 e 1195' }];
gravar('dados/mapeamento-fontes-extensas-030.json',mapa);
triagem.intervalo=[1200,1201];
triagem.sequenciais.push({numero:1201,nome:f1201.nome_completo,tamanho_bytes:f1201.tamanho_bytes,hash_bruto:f1201.hash_bruto,hash_normalizado:f1201.hash_normalizado,leitura_integral:true,status:'integralmente classificada',tipo:f1201.tipo,secoes:12,sem_destino_util:0});
triagem.observacao='Lote encerrado em 1201, antes de 1202; 1200 e 1201 são obras independentes e complementares.';
gravar('dados/lote-030-triagem.json',triagem);
const revisao=ler('dados/revisao-fontes.json');
revisao['1200']={estado:'integralmente classificada',secoes:['Extração HTML temática do Practice Book Level 1; 12 blocos e zero útil sem destino']};
revisao['1201']={estado:'integralmente classificada',secoes:['Extração HTML temática do Practice Book Level 2; 12 blocos e zero útil sem destino']};
gravar('dados/revisao-fontes.json',revisao);
const fontes=ler('dados/mapa-fontes.json');
for(const item of fontes.arquivos){const estado=revisao[item.id];if(estado){item.estado_revisao=estado.estado;item.secoes=estado.secoes.join(' | ');}}
gravar('dados/mapa-fontes.json',fontes);
console.log('1201 classificada e comparação 1200×1201 concluída.');
