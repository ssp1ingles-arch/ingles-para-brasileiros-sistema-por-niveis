import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = a => JSON.parse(fs.readFileSync(path.join(raiz, a), 'utf8'));
const escrever = (a, v) => fs.writeFileSync(path.join(raiz, a), JSON.stringify(v, null, 2) + '\n');
const niveis = ['a1','a2','b1','b2','c1','c2','kids'];
const unidades = niveis.flatMap(n => ler(`dados/${n}/unidades.json`));
const atividades = ler('dados/auditoria-atividades-018.json');
const jornada = ler('dados/auditoria-cobertura-jornada-018.json');
const triagem = ler('dados/lote-018-triagem.json');
const contar = (lista, chave) => Object.fromEntries([...new Set(lista.map(x => x[chave]))].sort().map(v => [v, lista.filter(x => x[chave] === v).length]));
escrever('dados/matriz-curricular-018.json', {versao:'018',gerado_em:new Date().toISOString(),comparacao:{antes:{tratadas:1072,pendentes:475,cobertura:69.30},depois:{tratadas:1172,pendentes:375,cobertura:75.76}},unidades:unidades.length,atividades:atividades.total,subpaineis:ler('dados/subpaineis.json').length,por_nivel:contar(unidades,'nivel'),por_habilidade:contar(unidades,'habilidade_principal'),impacto:'92 duplicatas consolidadas, seis compêndios classificados por seção e dois arquivos sem conteúdo didático; sem novas unidades.',lacunas_abertas:ler('dados/matriz-curricular-017.json').lacunas_abertas});
function bloco(arquivo, chave, texto) { const p=path.join(raiz,arquivo),i=`<!-- LOTE-018-${chave}:INICIO -->`,f=`<!-- LOTE-018-${chave}:FIM -->`,b=`${i}\n${texto}\n${f}`;let x=fs.readFileSync(p,'utf8');x=x.includes(i)?x.replace(new RegExp(`${i}[\\s\\S]*?${f}`),b):x.trim()+`\n\n${b}\n`;fs.writeFileSync(p,x,'utf8'); }
const lote = `<!-- LOTE-018:INICIO -->
## Lote 018

- Auditoria do lote 017: **16/16 duplicatas confirmadas** por comparação integral; nenhuma decisão corrigida.
- Sequenciais: **100** (\`1021\`–\`1120\`): **92 duplicatas**, **6 canônicas integralmente classificadas** e **2 sem conteúdo didático independente**.
- Dirigidas: **0**; os compêndios canônicos exigiram leitura e mapeamento integral.
- Unidades: **0 novas**; total **${unidades.length}**. Atividades: **0 novas**; total **${atividades.total}**.
- Dois exemplos exatos preexistentes foram deduplicados, preservando uma ocorrência canônica de cada.
- Subpainéis: **95 → 95**.
- Jornada: **${jornada.ids_anteriores_preservados.length}/${jornada.ids_anteriores.length} IDs preservados**, ${jornada.totais.complementares} complementares, sem órfãos ou repetições.
- Última fonte: \`1120_teste-seu-nivel.md\`; próxima: \`1121_QW_CONJ_ACTUALLY_NA_VERDADE_DE_FATO_2.md\`.
- Nenhum commit ou push; ainda restam fontes.
<!-- LOTE-018:FIM -->`;
const progressoPath = path.join(raiz,'docs/PROGRESSO.md');
let progresso = fs.readFileSync(progressoPath,'utf8').replace(/Atualizado em 2026-08-08 após o lote 017\./,'Atualizado em 2026-08-08 após o lote 018.');
progresso = progresso.includes('<!-- LOTE-018:INICIO -->') ? progresso.replace(/<!-- LOTE-018:INICIO -->[\s\S]*?<!-- LOTE-018:FIM -->/,lote) : progresso.trim()+`\n\n${lote}\n`;
fs.writeFileSync(progressoPath,progresso,'utf8');
bloco('docs/MAPEAMENTO_FONTES_PARA_CONTEUDO.md','MAPEAMENTO','## Lote 018 — mapeamento\n\nAs fontes 1021–1120 foram lidas integralmente. As 92 duplicatas tiveram igualdade normalizada comprovada; seis compêndios foram distribuídos por seção e dois arquivos administrativos/navegacionais foram rejeitados como lição. Consulte `dados/mapeamento-fontes-extensas-018.json`.');
bloco('docs/DECISOES.md','DECISOES','## Decisões do lote 018\n\n- Confirmar a amostra do lote 017 somente por igualdade do corpo integral normalizado.\n- Consolidar compêndios de estruturas, preposições e quantificadores sem criar painéis ou micro-unidades.\n- Não converter índice, regras administrativas ou teste de nivelamento em lições/atividades.\n- Corrigir duas duplicações exatas preexistentes de exemplos, mantendo a ocorrência pedagogicamente canônica.\n- Preservar 95 subpainéis, Jornada, atividades e localStorage.');
bloco('docs/AUDITORIA_COBERTURA_CURRICULAR.md','COBERTURA','## Atualização curricular — lote 018\n\nA cobertura documental avançou de 69,30% para 75,76%. A matriz pedagógica permaneceu estável porque o material útil já estava representado; as lacunas do lote 017 continuam abertas.');
console.log(`Documentos 018 finalizados; ${triagem.sequenciais.length} fontes.`);
