import fs from 'node:fs';
import path from 'node:path';
import { chromium } from 'playwright-core';

const root = path.resolve(import.meta.dirname, '..');
const base = (process.argv[2] || 'http://127.0.0.1:8765/').replace(/\/?$/, '/');
const lote = process.argv[3] || '001';
const out = path.join(root, `docs/evidencias/integracao-2019-english-lote-${lote}`);
const executablePath = 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const routes = ['index.html', 'niveis/a1/', 'niveis/a2/', 'niveis/b1/', 'niveis/b2/', 'niveis/c1/', 'niveis/c2/', 'niveis/kids/', 'estudar.html', 'praticar.html', 'jornada.html'];
const viewports = { desktop: { width: 1440, height: 1000 }, celular: { width: 390, height: 844 } };
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({ headless: true, executablePath });
const version = browser.version();
const resultados = [];
for (const [dispositivo, viewport] of Object.entries(viewports)) {
  const context = await browser.newContext({ viewport });
  for (const rota of routes) {
    const page = await context.newPage();
    const consoleErros = [], paginaErros = [], requisicoesFalhas = [];
    page.on('console', msg => { if (msg.type() === 'error') consoleErros.push(msg.text()); });
    page.on('pageerror', err => paginaErros.push(err.message));
    page.on('requestfailed', req => requisicoesFalhas.push(`${req.method()} ${req.url()}: ${req.failure()?.errorText}`));
    await page.addInitScript(loteAtual => {
      localStorage.setItem('interfaceThemeV1', 'light');
      localStorage.setItem('auditIsolationMarker', `integracao-2019-lote-${loteAtual}`);
    }, lote);
    const response = await page.goto(new URL(rota, base).href, { waitUntil: 'networkidle' });
    const metricas = await page.evaluate(() => ({
      viewport_largura: innerWidth,
      viewport_altura: innerHeight,
      documento_largura: document.documentElement.scrollWidth,
      documento_altura: document.documentElement.scrollHeight,
      overflow_horizontal: document.documentElement.scrollWidth > document.documentElement.clientWidth + 1,
      tema: document.documentElement.dataset.theme || null,
      titulo: document.title,
      marcador_perfil_isolado: localStorage.getItem('auditIsolationMarker'),
    }));
    const slug = rota.replace(/index\.html$/, 'inicio').replaceAll('/', '-').replace(/\.html$/, '').replace(/-$/, '') || 'inicio';
    const screenshot = `${slug}-${dispositivo}.png`;
    await page.screenshot({ path: path.join(out, screenshot), fullPage: true });
    resultados.push({ rota, dispositivo, viewport, http_status: response?.status() || 0, ...metricas, console_erros: [...new Set(consoleErros)], pagina_erros: [...new Set(paginaErros)], requisicoes_falhas: [...new Set(requisicoesFalhas)], screenshot });
    await page.close();
  }
  await context.close();
}

const context = await browser.newContext({ viewport: viewports.desktop });
const page = await context.newPage();
await page.goto(new URL('niveis/a2/', base).href, { waitUntil: 'networkidle' });
await page.waitForSelector('.unit-group');
await page.locator('.theme-toggle').click();
const temaEscuro = await page.evaluate(() => ({ tema: document.documentElement.dataset.theme, persistido: localStorage.getItem('interfaceThemeV1') }));
await page.screenshot({ path: path.join(out, 'a2-tema-escuro-desktop.png'), fullPage: true });
await page.reload({ waitUntil: 'networkidle' });
const temaPersistiu = await page.evaluate(() => document.documentElement.dataset.theme === localStorage.getItem('interfaceThemeV1'));
await context.close();
await browser.close();

const aprovado = resultados.length === 22 && resultados.every(r => r.http_status === 200 && !r.overflow_horizontal && !r.console_erros.length && !r.pagina_erros.length && !r.requisicoes_falhas.length && r.marcador_perfil_isolado === `integracao-2019-lote-${lote}`) && temaEscuro.tema === 'dark' && temaEscuro.persistido === 'dark' && temaPersistiu;
const relatorio = { schema_version: 1, lote: `integracao-2019-english-${lote}`, executado_em: new Date().toISOString(), base_local: base, navegador: { produto: 'Google Chrome', versao: version, executavel: executablePath, headless: true, perfil: 'contexto Playwright isolado' }, resultado: aprovado ? 'APROVADO' : 'FALHOU', cenarios: resultados.length, tema_escuro: { ...temaEscuro, persistencia_apos_reload: temaPersistiu }, resultados };
fs.writeFileSync(path.join(out, 'auditoria-navegador.json'), JSON.stringify(relatorio, null, 2) + '\n');
console.log(`${relatorio.resultado}: ${resultados.length}/22 cenários; Chrome ${version}; evidências em ${path.relative(root, out)}.`);
if (!aprovado) process.exitCode = 1;
