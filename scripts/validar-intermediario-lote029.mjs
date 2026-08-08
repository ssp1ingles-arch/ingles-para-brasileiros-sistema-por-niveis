import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const raiz = path.resolve(import.meta.dirname, '..');
const fontes = process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname, '../../Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const triagem = ler('dados/lote-029-triagem.json');
const mapeamento = ler('dados/mapeamento-fontes-extensas-029.json');
const unidades = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const atividades = ler('dados/atividades.json');
const subpaineis = ler('dados/subpaineis.json');
const cobertura = ler('dados/auditoria-cobertura-jornada-028.json');
const estabilidade = ler('dados/auditoria-estabilidade-jornada-028.json');
const fonte = mapeamento.fontes[0];
const resultados = [];
const testar = (nome, condicao) => {
  resultados.push({ teste: nome, resultado: condicao ? 'APROVADO' : 'FALHOU' });
  if (!condicao) throw new Error(nome);
};

testar('somente 1197 aberta', triagem.intervalo.join(',') === '1197,1197' && mapeamento.fontes.length === 1);
testar('1198 bloqueada', triagem.validacao_intermediaria.pendente);
testar('leitura integral', fonte.leitura_integral);
testar('função real registrada', fonte.tipo.includes('índice') && fonte.tipo.includes('editorial'));
testar('9/9 partes decididas', fonte.partes.length === 9 && fonte.partes.every(parte => parte.decisao));
testar('quatro obras apenas referenciadas', fonte.partes.filter(parte => parte.decisao === 'registrar referência editorial').length === 4);
testar('nenhuma duplicata presumida', triagem.duplicatas.length === 0 && !JSON.stringify(fonte).includes('duplicata integral'));
testar('descartes justificados', fonte.partes.filter(parte => parte.decisao === 'descartar').every(parte => parte.justificativa));
testar('zero conteúdo didático útil', fonte.totais.conteudo_didatico_util === 0);
testar('zero útil sem destino', fonte.totais.uteis_sem_destino === 0);
testar('sem reprodução extensa', !JSON.stringify(mapeamento).includes('conteudo_fonte') && fonte.observacao_publica.includes('nenhum texto extenso'));
testar('base 834/1977/95', unidades.length === 834 && atividades.length === 1977 && subpaineis.length === 95);
testar('IDs únicos', new Set(unidades.map(item => item.id)).size === 834);
testar('Jornada 806+28 sem órfãos', cobertura.totais.presentes === 806 && cobertura.totais.complementares === 28 && cobertura.orfaos.length === 0 && cobertura.repetidos.length === 0);
testar('806 IDs preservados', estabilidade.ids_preservados.length === 806);
testar('localStorage compatível', estabilidade.localStorage.progresso_retomada_compativeis && estabilidade.localStorage.favoritos_revisoes_compativeis);
const meta = ler('dados/mapa-fontes.json').arquivos.find(item => Number(item.id) === 1197);
const hash = crypto.createHash('sha256').update(fs.readFileSync(path.join(fontes, meta.arquivo))).digest('hex');
testar('hash 1197 preservado', hash === fonte.hash_bruto);
testar('JSON público sanitizado', !JSON.stringify(mapeamento).includes('C:\\Users\\') && !JSON.stringify(mapeamento).includes('caminho_origem'));

const evidencia = { total: resultados.length, aprovados: resultados.filter(item => item.resultado === 'APROVADO').length, resultados };
fs.mkdirSync(path.join(raiz, 'docs/evidencias/lote-029'), { recursive: true });
fs.writeFileSync(path.join(raiz, 'docs/evidencias/lote-029/resultados-intermediarios-1197.json'), `${JSON.stringify(evidencia, null, 2)}\n`);
console.log(`INTERMEDIÁRIA 1197: ${evidencia.aprovados}/${evidencia.total}`);
