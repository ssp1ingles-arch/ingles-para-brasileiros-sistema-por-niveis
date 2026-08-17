import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright-core";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "docs/evidencias/acordeoes-interface");
const base = (process.argv[2] || "http://127.0.0.1:8000/").replace(/\/?$/, "/");
const levels = ["a1", "a2", "b1", "b2", "c1", "c2", "kids"];
const modes = [
  ["desktop", 1440, 1000, "light"],
  ["mobile-dark", 390, 844, "dark"],
];
fs.mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const audit = [];

for (const level of levels) {
  for (const [mode, width, height, theme] of modes) {
    const context = await browser.newContext({ viewport: { width, height } });
    await context.addInitScript((value) => localStorage.setItem("interfaceThemeV1", value), theme);
    const page = await context.newPage();
    const errors = [];
    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(error.message));
    const response = await page.goto(new URL(`niveis/${level}/`, base).href, {
      waitUntil: "networkidle",
    });
    await page.locator(".unit-group").first().waitFor();
    const state = await page.evaluate(() => ({
      overflow: document.documentElement.scrollWidth > document.documentElement.clientWidth,
      openGroups: document.querySelectorAll(".unit-group[open]").length,
      groups: document.querySelectorAll(".unit-group").length,
      footers: document.querySelectorAll(".unit-actions,.unit-nav,.unit-tools").length,
      theme: document.documentElement.dataset.theme,
    }));
    audit.push({ level, mode, status: response?.status(), errors: [...new Set(errors)], ...state });
    if (mode === "mobile-dark") {
      await page.locator("#unidades").scrollIntoViewIfNeeded();
    }
    await page.screenshot({ path: path.join(out, `${level}-${mode}.png`), fullPage: false });
    await context.close();
  }
}

const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
const page = await context.newPage();
await page.goto(new URL("niveis/a2/", base).href, { waitUntil: "networkidle" });
await page.evaluate(() => {
  localStorage.removeItem("nivelAccordionStateV2");
  localStorage.removeItem("nivelGroupState");
});
await page.reload({ waitUntil: "networkidle" });
await page.screenshot({ path: path.join(out, "a2-recolhido.png"), fullPage: false });
const summaries = page.locator(".unit-group summary");
await summaries.nth(0).click();
await page.screenshot({ path: path.join(out, "a2-aberto.png"), fullPage: false });
await summaries.nth(1).click();
audit.push({
  scenario: "exclusive",
  openGroups: await page.locator(".unit-group[open]").count(),
  secondOpen: (await page.locator(".unit-group").nth(1).getAttribute("open")) !== null,
});
await page.screenshot({ path: path.join(out, "a2-exclusivo.png"), fullPage: false });
const title = await page.locator(".unit h3").first().textContent();
await page.locator("#busca").fill(title || "");
await page.waitForTimeout(150);
audit.push({
  scenario: "search",
  query: title,
  openGroups: await page.locator(".unit-group[open]").count(),
  matches: await page.locator(".unit").count(),
});
await page.screenshot({ path: path.join(out, "a2-busca-aberta.png"), fullPage: false });
await page.locator(".unit").first().screenshot({ path: path.join(out, "cartao-sem-rodape.png") });
await context.close();
await browser.close();

fs.writeFileSync(path.join(out, "auditoria.json"), `${JSON.stringify(audit, null, 2)}\n`);
const invalid = audit.filter((item) =>
  item.scenario === "exclusive"
    ? item.openGroups !== 1 || !item.secondOpen
    : item.scenario === "search"
      ? item.openGroups !== 1 || item.matches < 1
      : item.status !== 200 || item.errors.length || item.overflow || item.openGroups > 1 || item.footers,
);
if (invalid.length) throw new Error(`Auditoria falhou: ${JSON.stringify(invalid)}`);
console.log(`APROVADO: ${audit.length} inspeções de acordeão e ${levels.length * modes.length + 5} evidências.`);
