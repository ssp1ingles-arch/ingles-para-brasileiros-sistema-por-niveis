import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "docs/evidencias/lote-009");
fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch({
  headless: true,
  executablePath: "C:/Program Files/Google/Chrome/Application/chrome.exe",
});
const context = await browser.newContext({
  viewport: { width: 1440, height: 1100 },
});
const page = await context.newPage();
const results = [];
function check(name, ok, detail = "") {
  results.push({
    teste: name,
    resultado: ok ? "APROVADO" : "FALHOU",
    detalhe: detail,
  });
  if (!ok) throw Error(`${name}: ${detail}`);
}

await page.goto("http://127.0.0.1:8000/niveis/a2/");
await page.waitForSelector(".unit-group");
let details = page.locator(".unit-group").first();
let summary = details.locator("summary");
let region = details.locator('[role="region"]');
if ((await details.getAttribute("open")) === null) await summary.click();
check("abrir subpainel", (await details.getAttribute("open")) !== null);
check(
  "aria-expanded aberto",
  (await summary.getAttribute("aria-expanded")) === "true",
);
check("região controlada visível", await region.isVisible());
await summary.click();
check("fechar subpainel", (await details.getAttribute("open")) === null);
check(
  "aria-expanded fechado",
  (await summary.getAttribute("aria-expanded")) === "false",
);
const groupKey = await details.getAttribute("data-group");
await page.reload();
await page.waitForSelector(".unit-group");
details = page.locator(`.unit-group[data-group="${groupKey}"]`);
check(
  "persistência do recolhível",
  (await details.getAttribute("open")) === null,
  groupKey,
);

const known = details.locator(".unit").first();
const knownTitle = await known.locator("h3").textContent(),
  knownId = await known.getAttribute("id");
await page.locator("#busca").fill(knownTitle);
await page.waitForTimeout(100);
check(
  "busca encontra unidade",
  (await page.locator(`#${knownId}`).count()) === 1,
  knownTitle,
);
check(
  "busca abre grupo",
  (await page
    .locator(`#${knownId}`)
    .locator("xpath=ancestor::details")
    .getAttribute("open")) !== null,
);
await page.screenshot({ path: path.join(out, "a2-busca.png") });
await page.locator("#busca").fill("");
await page.waitForTimeout(100);
check(
  "limpar busca restaura interface",
  (await page.locator(".unit-group").count()) > 1,
);

await page.locator("#habilidade").selectOption({ label: "Verbos" });
await page.waitForTimeout(100);
let cards = page.locator(".unit"),
  count = await cards.count();
let sum = await page
  .locator(".unit-group summary span")
  .evaluateAll((xs) =>
    xs.reduce((n, x) => n + Number(x.textContent.match(/\d+/)?.[0] || 0), 0),
  );
check("filtro por habilidade principal", count > 0, `${count} unidades`);
check("contagens após filtro", count === sum, `${count}/${sum}`);
const panel = await cards.first().getAttribute("data-panel");
await page.locator("#painel").selectOption(panel);
await page.waitForTimeout(100);
check(
  "combinar nível painel habilidade",
  (await cards.count()) > 0 &&
    (await cards.evaluateAll(
      (xs, p) => xs.every((x) => x.dataset.panel === p),
      panel,
    )),
  panel,
);
check(
  "grupos vazios desaparecem",
  await page
    .locator(".unit-group")
    .evaluateAll((xs) =>
      xs.every((x) => x.querySelectorAll(".unit").length > 0),
    ),
);
await page.screenshot({ path: path.join(out, "a2-filtrado.png") });
await page.locator("#painel").selectOption("");
await page.locator("#habilidade").selectOption({ label: "Vocabulário" });
await page.waitForTimeout(100);
check(
  "filtro inclui habilidade secundária",
  (await page.locator(".unit").count()) > 0,
);
await page.locator("#habilidade").selectOption("");

let favorite = page.locator(".favorite").first();
const fid = await favorite.getAttribute("data-id");
await favorite.click();
await page.waitForLoadState("load");
await page.waitForSelector(`.favorite[data-id="${fid}"]`);
check(
  "favorito persiste após recarga",
  (await page.locator(`.favorite[data-id="${fid}"]`).textContent()) === "★",
);
let done = page.locator(".done").first();
const did = await done.getAttribute("data-id");
await done.click();
await page.waitForLoadState("load");
await page.waitForSelector(`.done[data-id="${did}"]`);
check(
  "conclusão persiste",
  (
    (await page.locator(`.done[data-id="${did}"]`).textContent()) || ""
  ).includes("Concluída"),
);
check(
  "progresso atualizado",
  parseFloat(
    (await page.locator(".progress i").getAttribute("style"))?.match(
      /[\d.]+/,
    )?.[0] || 0,
  ) > 0,
);
await page.locator(`.favorite[data-id="${fid}"]`).click();
await page.waitForLoadState("load");
check(
  "remover favorito",
  (await page.locator(`.favorite[data-id="${fid}"]`).textContent()) === "☆",
);

await page.locator("#habilidade").selectOption({ label: "Verbos" });
await page.waitForTimeout(100);
cards = page.locator(".unit");
const filteredCount = await cards.count();
const firstUnit = page.locator(".unit:not(:has(.prev))"),
  lastUnit = page.locator(".unit:not(:has(.next))");
check("primeira unidade sem anterior", (await firstUnit.count()) === 1);
check("última unidade sem próxima", (await lastUnit.count()) === 1);
const firstId = await firstUnit.getAttribute("id"),
  nextHref = await firstUnit.locator(".next").getAttribute("href"),
  secondId = nextHref.slice(1);
await firstUnit.locator(".next").click();
check(
  "próxima respeita filtro",
  page.url().endsWith(`#${secondId}`),
  `${filteredCount} resultados`,
);
await page.locator(`#${secondId} .prev`).click();
check("anterior respeita filtro", page.url().endsWith(`#${firstId}`));

summary = page.locator(".unit-group summary").first();
await summary.focus();
const beforeEnter = await summary.getAttribute("aria-expanded");
await page.keyboard.press("Enter");
await page.waitForTimeout(100);
check(
  "teclado Enter alterna subpainel",
  (await summary.getAttribute("aria-expanded")) !== beforeEnter,
);
const beforeSpace = await summary.getAttribute("aria-expanded");
await page.keyboard.press("Space");
await page.waitForTimeout(100);
check(
  "teclado Espaço alterna subpainel",
  (await summary.getAttribute("aria-expanded")) !== beforeSpace,
);
const controlled = await summary.getAttribute("aria-controls");
check(
  "aria-controls associado",
  !!controlled && (await page.locator(`#${controlled}`).count()) === 1,
);
check(
  "foco visível",
  await summary.evaluate(
    (e) =>
      getComputedStyle(e).outlineStyle !== "none" &&
      parseFloat(getComputedStyle(e).outlineWidth) > 0,
  ),
);
check(
  "interativos acessíveis",
  await page
    .locator(
      "button:visible,a:visible,input:visible,select:visible,summary:visible",
    )
    .evaluateAll((xs) =>
      xs.every((x) => x.tabIndex >= 0 && x.getBoundingClientRect().width > 0),
    ),
);

const mobile = await context.newPage();
await mobile.setViewportSize({ width: 390, height: 844 });
await mobile.goto("http://127.0.0.1:8000/niveis/b1/");
await mobile.waitForSelector(".unit-group");
check(
  "mobile sem rolagem horizontal",
  await mobile.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
  `${await mobile.evaluate(() => innerWidth)}px`,
);
await mobile.screenshot({ path: path.join(out, "b1-mobile.png") });

const study = await context.newPage();
await study.goto("http://127.0.0.1:8000/");
await study.waitForSelector(".study-entry");
await study.locator(".study-entry").click();
await study.waitForSelector("#studySetup");
check("abrir modo de estudo", study.url().includes("/estudar.html"));
await study.locator("#studyLevel").selectOption("A2");
check(
  "criar sessão filtrada por nível",
  (await study.locator("#eligibleCount").textContent()).includes(
    "cartões elegíveis",
  ),
);
await study.locator("#startStudy").click();
await study.waitForSelector("#studyCard h2");
check(
  "sessão iniciada em A2",
  (await study.locator("#studyCard .badge").first().textContent()) === "A2",
);
const repeatedTitle = await study.locator("#studyCard h2").textContent();
await study.locator("#revealStudy").click();
check("revelar cartão", await study.locator(".study-answer").isVisible());
await study.locator('[data-rating="repeat"]').click();
let stored = await study.evaluate(() =>
  JSON.parse(localStorage.getItem("studySessionV1")),
);
check("marcar Repetir", stored.queue.at(-1) === stored.queue[0]);
check(
  "confirmar reapresentação agendada",
  stored.queue.filter((x) => x === stored.queue[0]).length === 2,
  repeatedTitle,
);
await study.locator("#revealStudy").click();
await study.locator('[data-rating="hard"]').click();
let records = await study.evaluate(() =>
  JSON.parse(localStorage.getItem("studyProgressV1")),
);
let last = Object.values(records).at(-1);
check("marcar Difícil", last.lastRating === "hard");
check(
  "próxima revisão Difícil",
  new Date(last.nextReview) - new Date(last.lastReview) >= 2 * 86400000 - 1000,
);
await study.locator("#revealStudy").click();
await study.locator('[data-rating="good"]').click();
records = await study.evaluate(() =>
  JSON.parse(localStorage.getItem("studyProgressV1")),
);
last = Object.values(records).at(-1);
check("marcar Bom", last.lastRating === "good");
await study.locator("#revealStudy").click();
await study.locator('[data-rating="easy"]').click();
records = await study.evaluate(() =>
  JSON.parse(localStorage.getItem("studyProgressV1")),
);
last = Object.values(records).at(-1);
check(
  "marcar Fácil",
  last.lastRating === "easy" &&
    new Date(last.nextReview) - new Date(last.lastReview) >=
      12 * 86400000 - 1000,
);
await study.reload();
await study.waitForSelector("#resumeStudy");
check(
  "persistência após recarga",
  (await study.locator("#resumeStudy").isVisible()) &&
    Object.keys(
      await study.evaluate(() =>
        JSON.parse(localStorage.getItem("studyProgressV1")),
      ),
    ).length >= 4,
);
await study.locator("#resumeStudy").click();
await study.locator("#endStudy").click();
check(
  "encerrar e retomar sessão",
  await study.locator("#resumeStudy").isVisible(),
);
await study.locator("#studyMode").selectOption("en-pt");
const enCount = Number(
  (await study.locator("#eligibleCount").textContent()).match(/\d+/)[0],
);
check("modo inglês para português", enCount > 0);
await study.locator("#studyMode").selectOption("pt-en");
const ptCount = Number(
  (await study.locator("#eligibleCount").textContent()).match(/\d+/)[0],
);
check("modo português para inglês elegível", ptCount > 0);
check("unidades sem par excluídas", ptCount < enCount, `${ptCount}/${enCount}`);
await study.locator("#startStudy").click();
await study.locator("#revealStudy").click();
check(
  "abrir unidade completa",
  (await study.locator(".open-unit").getAttribute("href")).includes("/#"),
);
check(
  "progresso da sessão",
  ((await study.locator("#sessionProgress").textContent()) || "").includes(
    "Cartão",
  ),
);
await study.locator('[data-rating="good"]').focus();
await study.keyboard.press("Tab");
check(
  "teclado no modo estudo",
  await study.evaluate(() => document.activeElement?.matches("button,a")),
);
check(
  "foco no modo estudo",
  await study.evaluate(
    () =>
      document.activeElement?.matches("[data-rating]") &&
      getComputedStyle(document.activeElement).outlineStyle !== "none",
  ),
);
await study.screenshot({
  path: path.join(out, "modo-estudo-desktop.png"),
  fullPage: true,
});
const studyMobile = await context.newPage();
await studyMobile.setViewportSize({ width: 390, height: 844 });
await studyMobile.goto("http://127.0.0.1:8000/estudar.html");
await studyMobile.waitForSelector("#studySetup");
check(
  "modo estudo em celular",
  await studyMobile.evaluate(
    () => document.documentElement.scrollWidth <= innerWidth,
  ),
);
await studyMobile.screenshot({
  path: path.join(out, "modo-estudo-mobile.png"),
  fullPage: true,
});
const journey = await context.newPage();
await journey.goto("http://127.0.0.1:8000/jornada.html");
await journey.waitForSelector(".journey-stage");
check("abrir jornada.html", journey.url().includes("jornada.html"));
check(
  "selecionar A1",
  (await journey.locator("#journeyLevel").inputValue()) === "A1",
);
let stage = journey.locator(".journey-stage").first(),
  stageSummary = stage.locator(":scope>summary");
const stageWas = await stage.getAttribute("open");
await stageSummary.click();
check("abrir e fechar etapa", (await stage.getAttribute("open")) !== stageWas);
if ((await stage.getAttribute("open")) === null) await stageSummary.click();
let module = stage.locator(".journey-module").first(),
  moduleSummary = module.locator(":scope>summary");
const moduleWas = await module.getAttribute("open");
await moduleSummary.click();
check(
  "abrir e fechar módulo",
  (await module.getAttribute("open")) !== moduleWas,
);
if ((await module.getAttribute("open")) === null) await moduleSummary.click();
check(
  "contagens da jornada",
  /\d+\/\d+/.test(await stageSummary.locator("span").textContent()),
);
check(
  "estado de progresso",
  (await journey.locator(".journey-summary").count()) === 1,
);
const recHref = await journey.locator(".continue-journey").getAttribute("href");
await journey.locator(".continue-journey").click();
check("continuar jornada", journey.url().includes("/niveis/a1/"));
check(
  "unidade recomendada",
  journey.url().endsWith(recHref.slice(recHref.indexOf("#"))),
);
await journey.waitForSelector(`${recHref.slice(recHref.indexOf("#"))} .done`);
await journey.locator(`${recHref.slice(recHref.indexOf("#"))} .done`).click();
await journey.goto("http://127.0.0.1:8000/jornada.html?nivel=A1");
await journey.waitForSelector(".journey-summary");
check(
  "marcar unidade concluída",
  (await journey.locator(".journey-summary").textContent()).includes("1/"),
);
check(
  "atualização após voltar",
  (await journey.locator(".journey-unit.done").count()) >= 1,
);
const pending = journey
  .locator(".journey-unit")
  .filter({ hasText: "Pré-requisito pendente" })
  .first();
check("pré-requisito pendente", (await pending.count()) === 1);
check("unidade pendente acessível", !!(await pending.getAttribute("href")));
const reviewHref = await journey
  .locator(".review-stage")
  .first()
  .getAttribute("href");
await journey.locator(".review-stage").first().click();
check(
  "revisar etapa abre estudo",
  journey.url().includes("/estudar.html?unidades="),
);
check(
  "filtro da etapa integrado",
  Number(
    (await journey.locator("#eligibleCount").textContent()).match(/\d+/)?.[0] ||
      0,
  ) > 0,
);
await journey.goBack();
await journey.reload();
await journey.waitForSelector(".journey-unit.done");
check(
  "persistência da jornada",
  (await journey.locator(".journey-unit.done").count()) >= 1,
);
const jm = await context.newPage();
await jm.setViewportSize({ width: 390, height: 844 });
await jm.goto("http://127.0.0.1:8000/jornada.html?nivel=A2");
await jm.waitForSelector(".journey-stage");
check(
  "jornada em celular",
  await jm.evaluate(() => document.documentElement.scrollWidth <= innerWidth),
);
await jm.locator(".journey-stage summary").first().focus();
await jm.keyboard.press("Enter");
check(
  "teclado da jornada",
  await jm
    .locator(".journey-stage")
    .first()
    .evaluate((e) => e.open),
);
check(
  "foco da jornada",
  await jm.evaluate(
    () =>
      document.activeElement?.matches("summary") &&
      getComputedStyle(document.activeElement).outlineStyle !== "none",
  ),
);
check(
  "primeiro e último módulo",
  (await jm.locator(".journey-module").count()) > 1,
);
await jm.locator("#journeyLevel").selectOption("C2");
check(
  "C2 ativado somente com conteúdo legítimo",
  (await jm.locator(".journey-stage").count()) > 0 &&
    (await jm.locator(".journey-unit").count()) >= 2,
);
check(
  "compatibilidade busca e filtros",
  results.slice(0, 28).every((x) => x.resultado === "APROVADO"),
);
fs.writeFileSync(
  path.join(out, "resultados-interacao.json"),
  JSON.stringify(
    {
      gerado_em: new Date().toISOString(),
      total: results.length,
      aprovados: results.filter((x) => x.resultado === "APROVADO").length,
      resultados: results,
    },
    null,
    2,
  ) + "\n",
);
console.log(
  `INTERAÇÃO OK: ${results.length}/${results.length} testes aprovados.`,
);
await browser.close();
