import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
const root = path.resolve(import.meta.dirname, ".."),
  src = (process.env.ARQUIVO_FONTE_DIR || path.resolve(import.meta.dirname,'../../Arquivo_Fonte')),
  read = (p) => JSON.parse(fs.readFileSync(path.join(root, p), "utf8")),
  sha = (b) => crypto.createHash("sha256").update(b).digest("hex"),
  errors = [],
  tri = read("dados/lote-009-triagem.json");
if (tri.fontes.length !== 60) errors.push("Triagem 009 não tem 60 fontes");
for (const x of tri.fontes)
  if (sha(fs.readFileSync(path.join(src, x.nome))) !== x.hash_bruto)
    errors.push(`Fonte modificada ${x.nome}`);
const units = ["a1", "a2", "b1", "b2", "c1", "c2", "kids"].flatMap((l) =>
    read(`dados/${l}/unidades.json`),
  ),
  ids = new Set(units.map((u) => u.id)),
  j = read("dados/jornadas.json");
if (j.length < 5 || !["A1", "A2", "B1", "B2", "C1"].every((nivel) => j.some((x) => x.nivel === nivel))) errors.push("Jornadas históricas A1–C1 não foram preservadas");
for (const x of j) {
  const seen = new Set();
  for (const e of x.etapas) {
    if (!e.modulos.length) errors.push(`${e.id} sem módulos`);
    for (const m of e.modulos) {
      if (!m.unidades.length) errors.push(`${m.id} vazio`);
      for (const id of m.unidades) {
        if (!ids.has(id)) errors.push(`${m.id}: unidade ausente ${id}`);
        if (seen.has(id)) errors.push(`${x.nivel}: unidade repetida ${id}`);
        seen.add(id);
      }
    }
  }
}
const a = read("dados/auditoria-prerequisitos-009.json");
if (a.ciclos.length || a.dependencias_posteriores_ou_avancadas.length)
  errors.push("Auditoria de pré-requisitos falhou");
const t = read("docs/evidencias/lote-009/resultados-interacao.json");
if (t.total < 68 || t.aprovados !== t.total)
  errors.push(`Testes ${t.aprovados}/${t.total}`);
if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}
console.log(`LOTE 009 OK: 60 fontes, ${units.length} unidades, jornadas A1–C1 preservadas, ${t.aprovados}/${t.total} testes.`);
