import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const raiz = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dados = path.join(raiz, 'dados');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(dados, arquivo), 'utf8'));
const unidades = fs.readdirSync(dados, { withFileTypes: true })
  .filter(item => item.isDirectory())
  .flatMap(item => {
    const arquivo = path.join(dados, item.name, 'unidades.json');
    return fs.existsSync(arquivo) ? JSON.parse(fs.readFileSync(arquivo, 'utf8')) : [];
  });
const revisao = ler('revisao-fontes.json');
const mapa = ler('mapa-fontes.json');
const atividades = ler('atividades.json');
const jornadas = ler('jornadas.json');
const subpaineis = ler('subpaineis.json');

const contar = (lista, chave) => Object.fromEntries([...new Set(lista.map(x => x[chave] || 'Não informado'))]
  .sort((a, b) => a.localeCompare(b, 'pt-BR'))
  .map(valor => [valor, lista.filter(x => (x[chave] || 'Não informado') === valor).length]));
const estados = Object.values(revisao).map(x => x.estado || 'não analisada');
const integral = estados.filter(x => x.includes('integralmente classificada')).length;
const duplicatas = estados.filter(x => x === 'duplicata').length;
const parciais = estados.filter(x => x.includes('parcial')).length;
const semDidatico = estados.filter(x => x.includes('sem conteúdo didático')).length;
const tratados = integral + duplicatas + parciais + semDidatico;
const totalFontes = mapa.total || mapa.arquivos.length;
const cobertura = (tratados / totalFontes * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const niveis = ler('niveis.json').map(nivel => nivel.id.toUpperCase());
const porNivel = Object.fromEntries(niveis.map(nivel => [nivel === 'KIDS' ? 'Kids' : nivel, unidades.filter(x => x.nivel?.toUpperCase() === nivel).length]));
const porHabilidade = contar(unidades, 'habilidade_principal');
const porTipo = contar(atividades, 'tipo');
const etapas = jornadas.reduce((n, j) => n + j.etapas.length, 0);
const modulos = jornadas.reduce((n, j) => n + j.etapas.reduce((m, e) => m + e.modulos.length, 0), 0);

function htmls(dir = raiz) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => {
    if (item.name === 'node_modules' || item.name === '.git') return [];
    const destino = path.join(dir, item.name);
    return item.isDirectory() ? htmls(destino) : item.name.endsWith('.html') ? [path.relative(raiz, destino).replaceAll('\\', '/')] : [];
  });
}

const resultadosTestes = [
  'docs/evidencias/lote-009/resultados-interacao.json',
  'docs/evidencias/lote-010/resultados-lote010.json',
  'docs/evidencias/lote-011/resultados-lote011.json',
  'docs/evidencias/lote-012/resultados-rotas-012.json',
  'docs/evidencias/lote-012/resultados-validacao-012.json',
  'docs/evidencias/lote-013/resultados-validacao-013.json'
  ,'docs/evidencias/lote-013/resultados-rotas-013.json'
  ,'docs/evidencias/lote-014/resultados-validacao-014.json'
  ,'docs/evidencias/lote-014/resultados-rotas-014.json'
  ,'docs/evidencias/lote-015/resultados-validacao-015.json'
  ,'docs/evidencias/lote-015/resultados-rotas-015.json'
  ,'docs/evidencias/lote-016/resultados-validacao-016.json'
  ,'docs/evidencias/lote-016/resultados-rotas-016.json'
  ,'docs/evidencias/lote-017/resultados-validacao-017.json'
  ,'docs/evidencias/lote-017/resultados-rotas-017.json'
  ,'docs/evidencias/lote-018/resultados-validacao-018.json'
  ,'docs/evidencias/lote-018/resultados-rotas-018.json'
  ,'docs/evidencias/lote-019/resultados-validacao-019.json'
  ,'docs/evidencias/lote-019/resultados-rotas-019.json'
  ,'docs/evidencias/lote-020/resultados-validacao-020.json'
  ,'docs/evidencias/lote-020/resultados-rotas-020.json'
  ,'docs/evidencias/lote-021/resultados-validacao-021.json'
  ,'docs/evidencias/lote-021/resultados-rotas-021.json'
  ,'docs/evidencias/lote-022/resultados-validacao-022.json'
  ,'docs/evidencias/lote-022/resultados-rotas-022.json'
  ,'docs/evidencias/lote-023/resultados-validacao-023.json'
  ,'docs/evidencias/lote-023/resultados-rotas-023.json'
  ,'docs/evidencias/lote-024/resultados-validacao-024.json'
  ,'docs/evidencias/lote-024/resultados-comparacao-024.json'
  ,'docs/evidencias/lote-024/resultados-rotas-024.json'
  ,'docs/evidencias/lote-025/resultados-intermediarios-1189.json'
  ,'docs/evidencias/lote-025/resultados-validacao-025.json'
  ,'docs/evidencias/lote-025/resultados-comparacao-025.json'
  ,'docs/evidencias/lote-025/resultados-rotas-025.json'
  ,'docs/evidencias/lote-026/resultados-intermediarios-1191.json'
  ,'docs/evidencias/lote-026/resultados-validacao-026.json'
  ,'docs/evidencias/lote-026/resultados-comparacao-026.json'
  ,'docs/evidencias/lote-026/resultados-rotas-026.json'
  ,'docs/evidencias/lote-027/resultados-intermediarios-1193.json'
  ,'docs/evidencias/lote-027/resultados-validacao-027.json'
  ,'docs/evidencias/lote-027/resultados-comparacao-027.json'
  ,'docs/evidencias/lote-027/resultados-rotas-027.json'
].map(arquivo => {
  const resultado = JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
  if (resultado.total !== resultado.aprovados) throw new Error(`Suíte registrada com falhas: ${arquivo}`);
  return resultado;
});
const testes = resultadosTestes.reduce((total, resultado) => total + resultado.total, 0);

const fontesOrdenadas = mapa.arquivos.filter(x => /^\d{4}/.test(x.id)).sort((a, b) => Number(a.id) - Number(b.id));
const numerosSequenciais = fs.readdirSync(dados).filter(nome => /^lote-\d+-triagem\.json$/.test(nome)).flatMap(nome => {
  const triagem = JSON.parse(fs.readFileSync(path.join(dados, nome), 'utf8'));
  return (triagem.sequenciais || []).map(item => Number(item.numero ?? item.id)).filter(Number.isFinite);
});
const ultimoNumero = Math.max(0, ...numerosSequenciais);
const ultima = fontesOrdenadas.find(fonte => Number(fonte.id) === ultimoNumero) || null;
const proxima = fontesOrdenadas.find(x => Number(x.id) > Number(ultima?.id || 0) && !revisao[x.id]);
const lista = obj => Object.entries(obj).map(([k, v]) => `${k} **${v}**`).join('; ');
const rotas = htmls().sort();
const bloco = `<!-- ESTADO-ATUAL:INICIO -->
## Estado atual confirmado

> Bloco calculado automaticamente por \`scripts/atualizar-progresso.mjs\`. Não editar os números manualmente.

- Total de fontes: **${totalFontes.toLocaleString('pt-BR')}**
- Fontes integralmente classificadas: **${integral}**
- Duplicatas consolidadas: **${duplicatas}**
- Fontes parcialmente analisadas: **${parciais}**
- Fontes sem conteúdo didático: **${semDidatico}**
- Total tratado: **${tratados}**
- Fontes não analisadas: **${totalFontes - tratados}**
- Cobertura real: **${cobertura}%** (\`${tratados} ÷ ${totalFontes.toLocaleString('pt-BR')}\`)
- Unidades publicadas: **${unidades.length}**
- Por nível: ${lista(porNivel)}
- Habilidade principal: ${lista(porHabilidade)}
- Subpainéis: **${subpaineis.length}**
- Jornada: **${etapas} etapas**, **${modulos} módulos** e **${jornadas.length} níveis ativos**
- Atividades: **${atividades.length}** — ${lista(porTipo)}
- Testes executados e aprovados: **${testes}/${testes}**
- Rotas HTML existentes: **${rotas.length}** — ${rotas.map(x => `\`${x}\``).join(', ')}
- Última fonte sequencial tratada: \`${ultima?.arquivo || 'nenhuma'}\`
- Próxima fonte sequencial: \`${proxima?.arquivo || 'nenhuma'}\`
<!-- ESTADO-ATUAL:FIM -->`;

const validacoes = `<!-- VALIDACOES-VIGENTES:INICIO -->
## Validações vigentes

> Bloco calculado automaticamente por \`scripts/atualizar-progresso.mjs\`. A execução das suítes ocorre separadamente, com servidor local ativo.

- **${unidades.length} IDs únicos esperados** entre as unidades publicadas; JSON e JavaScript sujeitos à suíte de validação.
- **${subpaineis.length} subpainéis**, **${etapas} etapas** e **${modulos} módulos** registrados nos dados atuais.
- **${atividades.length} atividades** em ${Object.keys(porTipo).length} tipos: ${lista(porTipo)}.
- **${rotas.length} rotas HTML existentes**: ${rotas.map(x => `\`${x}\``).join(', ')}.
- Último resultado persistido das suítes vigentes: **${testes}/${testes} testes aprovados**.
- Hashes e estados vêm de \`dados/mapa-fontes.json\` e \`dados/revisao-fontes.json\`; \`Arquivo_Fonte\` permanece somente para leitura.
<!-- VALIDACOES-VIGENTES:FIM -->`;

const progressoPath = path.join(raiz, 'docs', 'PROGRESSO.md');
let progresso = fs.readFileSync(progressoPath, 'utf8');
// Blocos manuais de retomada ficam obsoletos e competem com o estado calculado.
progresso = progresso.replace(/\n## Retomada\n[\s\S]*?(?=\n## |\s*$)/g, '');
const regex = /(?:<!-- ESTADO-ATUAL:INICIO -->\s*)?## Estado atual confirmado[\s\S]*?(?=\n## Lote 007)/;
if (!regex.test(progresso)) throw new Error('Bloco de estado atual não encontrado em PROGRESSO.md.');
progresso = progresso.replace(regex, bloco + '\n');
const regexValidacoes = /(?:<!-- VALIDACOES-VIGENTES:INICIO -->\s*)?## Validações vigentes[\s\S]*?(?=\n## Interface e inspeção visual)/;
if (!regexValidacoes.test(progresso)) throw new Error('Bloco de validações vigentes não encontrado em PROGRESSO.md.');
progresso = progresso.replace(regexValidacoes, validacoes + '\n');
const foraDoEstado = progresso.replace(/<!-- ESTADO-ATUAL:INICIO -->[\s\S]*?<!-- ESTADO-ATUAL:FIM -->/, '');
const conflitos = foraDoEstado.match(/^## Estado atual confirmado$|^## Retomada$|^- Próxima fonte sequencial:|^- Total tratado:/gm) || [];
if (conflitos.length) throw new Error(`Informação corrente conflitante fora do bloco automático: ${conflitos.join(' | ')}`);
fs.writeFileSync(progressoPath, progresso, 'utf8');
console.log(`PROGRESSO atualizado: ${tratados}/${totalFontes} fontes, ${unidades.length} unidades, ${atividades.length} atividades, ${testes}/${testes} testes, ${rotas.length} rotas.`);
