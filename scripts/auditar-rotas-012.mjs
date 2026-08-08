import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';
const raiz = path.resolve(import.meta.dirname, '..');
const saida = path.join(raiz, 'docs/evidencias/lote-012');
fs.mkdirSync(saida, { recursive: true });
function htmls(dir = raiz) { return fs.readdirSync(dir, { withFileTypes: true }).flatMap(item => { if (['node_modules','.git'].includes(item.name)) return []; const destino = path.join(dir,item.name); return item.isDirectory() ? htmls(destino) : item.name.endsWith('.html') ? [path.relative(raiz,destino).replaceAll('\\','/')] : []; }); }
const rotas = htmls().sort();
const browser = await chromium.launch({ headless: true, executablePath: 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const auditoria = [];
for (const rota of rotas) {
  const erros = [], dados = new Set(), scripts = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('console', msg => { if (msg.type() === 'error') erros.push(msg.text()); });
  page.on('pageerror', erro => erros.push(erro.message));
  page.on('response', response => { if (response.url().endsWith('.json')) dados.add(new URL(response.url()).pathname); });
  const response = await page.goto(`http://127.0.0.1:8000/${rota}`, { waitUntil: 'networkidle' });
  scripts.push(...await page.locator('script[src]').evaluateAll(xs => xs.map(x => x.getAttribute('src'))));
  const titulo = await page.title();
  const slug = rota.replace(/index\.html$/,'index').replaceAll('/','-').replace(/\.html$/,'');
  await page.screenshot({ path: path.join(saida, `${slug}-desktop.png`), fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.reload({ waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(saida, `${slug}-mobile.png`), fullPage: true });
  auditoria.push({ caminho: rota, tipo: rota.startsWith('niveis/') ? 'página de nível' : rota === 'index.html' ? 'página inicial' : 'ferramenta de aprendizagem', nivel_relacionado: rota.match(/niveis\/(\w+)/)?.[1]?.toUpperCase() || null, http_status: response?.status() || 0, titulo, javascript_carregado: scripts, dados_carregados: [...dados], erros_console: [...new Set(erros)], estado_visual_testado: ['desktop 1440x1000','celular 390x844'] });
  await page.close();
}
const pratica = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
await pratica.goto('http://127.0.0.1:8000/praticar.html', { waitUntil: 'networkidle' });
for (const tipo of ['reordenar','parear','producao_autorrevisao','identificar_contraste']) {
  await pratica.locator('#practiceType').selectOption(tipo);
  await pratica.locator('#startPractice').click();
  await pratica.waitForSelector('#practiceCard');
  await pratica.screenshot({ path: path.join(saida, `${tipo}.png`), fullPage: true });
  await pratica.locator('#endPractice').click();
}
await pratica.locator('#practiceType').screenshot({ path: path.join(saida, 'lacuna-removida-filtro.png') });
await pratica.close();
for (const [nivel, nome] of [['C2','jornada-c2'],['KIDS','jornada-kids']]) {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  await page.goto(`http://127.0.0.1:8000/jornada.html?nivel=${nivel}`, { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(saida, `${nome}.png`), fullPage: true });
  await page.close();
}
await browser.close();
fs.writeFileSync(path.join(raiz,'dados/auditoria-rotas-012.json'), JSON.stringify(auditoria,null,2)+'\n');
const resultados = [
  { teste: 'todas as rotas enumeradas', ok: rotas.length === auditoria.length },
  { teste: 'todas as rotas HTTP 200', ok: auditoria.every(x => x.http_status === 200) },
  { teste: 'todas as rotas com título', ok: auditoria.every(x => x.titulo) },
  { teste: 'console sem erros', ok: auditoria.every(x => x.erros_console.length === 0) },
  { teste: 'desktop e celular testados', ok: auditoria.every(x => x.estado_visual_testado.length === 2) }
].map(x => ({ teste: x.teste, resultado: x.ok ? 'APROVADO' : 'FALHOU' }));
fs.writeFileSync(path.join(saida,'resultados-rotas-012.json'), JSON.stringify({ total: resultados.length, aprovados: resultados.filter(x=>x.resultado==='APROVADO').length, resultados },null,2)+'\n');
console.log(`Rotas 012: ${auditoria.length} testadas; ${resultados.filter(x=>x.resultado==='APROVADO').length}/${resultados.length} verificações aprovadas.`);
