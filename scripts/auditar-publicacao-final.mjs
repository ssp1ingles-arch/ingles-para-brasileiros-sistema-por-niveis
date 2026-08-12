import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';

const raiz = path.resolve(import.meta.dirname, '..');
const fontesRaiz = path.resolve(raiz, '..', 'Arquivo_Fonte');
const mapa = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/mapa-fontes.json'), 'utf8'));
const git = args => execFileSync('git', args, { cwd: raiz, encoding: 'utf8', maxBuffer: 100 * 1024 * 1024 }).split(/\r?\n/).filter(Boolean);
let hashes = 0;
for (const fonte of mapa.arquivos) {
  const arquivo = path.join(fontesRaiz, fonte.arquivo);
  if (fs.existsSync(arquivo) && crypto.createHash('sha256').update(fs.readFileSync(arquivo)).digest('hex') === fonte.sha256) hashes++;
}
const arquivos = git(['ls-files', '--cached', '--others', '--exclude-standard']);
const novos = new Set([...git(['diff', '--name-only', '--diff-filter=A', 'HEAD']), ...git(['ls-files', '--others', '--exclude-standard'])]);
const proibidos = [...novos].filter(a => /\.(pdf|epub|mobi|png|jpe?g|gif|webp|tiff?)$/i.test(a));
const grandes = arquivos.filter(a => fs.existsSync(path.join(raiz, a)) && fs.statSync(path.join(raiz, a)).size > 25 * 1024 * 1024);
let segredos = 0, caminhos = 0, bruto = 0;
for (const arquivo of arquivos.filter(a => /\.(md|json|mjs|js|html|css|ps1|txt)$/i.test(a))) {
  const texto = fs.readFileSync(path.join(raiz, arquivo), 'utf8');
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|(?:api[_-]?key|access[_-]?token|client[_-]?secret|password)\s*[:=]\s*["'][^"']{12,}["']/iu.test(texto)) segredos++;
  if (novos.has(arquivo) && /C:\\Users\\/iu.test(texto)) caminhos++;
  if (novos.has(arquivo) && /"conteudo_fonte"\s*:/u.test(texto)) bruto++;
}
const rotas = JSON.parse(fs.readFileSync(path.join(raiz, 'dados/auditoria-rotas-055.json'), 'utf8'));
const resultado = hashes === 1547 && rotas.length === 11 && !proibidos.length && !grandes.length && !segredos && !caminhos && !bruto ? 'APROVADO' : 'FALHOU';
const saida = { resultado, hashes: { aprovados: hashes, total: 1547 }, rotas_locais: rotas.length, seguranca: { arquivos_proibidos: proibidos, arquivos_maiores_25mb: grandes, segredos, caminhos_pessoais_novos: caminhos, conteudo_bruto_novo: bruto } };
fs.writeFileSync(path.join(raiz, 'dados/auditoria-final-publicacao.json'), `${JSON.stringify(saida, null, 2)}\n`);
fs.writeFileSync(path.join(raiz, 'docs/evidencias/auditoria-final/resultados-publicacao.json'), `${JSON.stringify(saida, null, 2)}\n`);
console.log(`PUBLICAÇÃO FINAL: ${resultado}; hashes ${hashes}/1547; rotas ${rotas.length}/11.`);
if (resultado !== 'APROVADO') process.exit(1);
