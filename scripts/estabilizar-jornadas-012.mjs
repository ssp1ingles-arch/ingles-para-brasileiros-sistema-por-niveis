import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const escrever = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), JSON.stringify(valor, null, 2) + '\n');
const jornadas = ler('dados/jornadas.json');
for (const jornada of jornadas) {
  const vistos = new Set();
  for (const etapa of jornada.etapas) for (const modulo of etapa.modulos) modulo.unidades = modulo.unidades.filter(id => !vistos.has(id) && vistos.add(id));
}
const idsAntes = jornadas.flatMap(j => j.etapas.flatMap(e => [e.id, ...e.modulos.map(m => m.id)]));
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(n => ler(`dados/${n}/unidades.json`));
const unidadesValidas = new Set(unidades.map(u => u.id));
for (const jornada of jornadas) for (const etapa of jornada.etapas) for (const modulo of etapa.modulos) modulo.unidades = modulo.unidades.filter(id => unidadesValidas.has(id));
for (const nivel of ['A1','A2','B1','B2','C1']) {
  const jornada = jornadas.find(j => j.nivel === nivel);
  const novas = unidades.filter(u => u.nivel === nivel && u.id.includes('-L12-'));
  for (const unidade of novas) {
    if (jornada.etapas.some(e => e.modulos.some(m => m.unidades.includes(unidade.id)))) continue;
    const etapa = unidade.habilidade_principal === 'Conversação' || unidade.habilidade_principal === 'Escuta' ? jornada.etapas.at(-2) || jornada.etapas.at(-1) : jornada.etapas.at(-1);
    let modulo = etapa.modulos.at(-1);
    if (!modulo || modulo.unidades.length >= 12) {
      const numero = Math.max(0, ...jornada.etapas.flatMap(e => e.modulos).map(m => Number(m.id.match(/(\d+)$/)?.[1] || 0))) + 1;
      modulo = { id: `${nivel.toLowerCase()}-modulo-${String(numero).padStart(2,'0')}`, titulo: `${etapa.titulo} — lote 012`, ordem: etapa.modulos.length + 1, unidades: [], pre_requisitos: [] };
      etapa.modulos.push(modulo);
    }
    if (!modulo.unidades.includes(unidade.id)) modulo.unidades.push(unidade.id);
  }
}
for (const [nivel, titulo, etapasTitulos] of [['C2','Jornada C2',['Proficiência, estilo e registro']],['KIDS','Jornada Kids',['Histórias e linguagem infantil','Gramática e conversa infantil']]]) {
  const mine = unidades.filter(u => u.nivel === nivel);
  if (!mine.length || jornadas.some(j => j.nivel === nivel)) continue;
  const buckets = etapasTitulos.map(() => []);
  mine.forEach(u => buckets[nivel === 'KIDS' && u.habilidade_principal === 'Gramática' ? 1 : 0].push(u));
  const etapas = buckets.map((bucket, i) => ({ id: `${nivel.toLowerCase()}-etapa-${String(i+1).padStart(2,'0')}`, titulo: etapasTitulos[i], descricao: `Desenvolver ${etapasTitulos[i].toLowerCase()} com acesso livre.`, ordem: i+1, modulos: [{ id: `${nivel.toLowerCase()}-modulo-${String(i+1).padStart(2,'0')}`, titulo: etapasTitulos[i], ordem: 1, unidades: bucket.map(u => u.id), pre_requisitos: [] }] })).filter(e => e.modulos[0].unidades.length);
  jornadas.push({ nivel, titulo, etapas });
}
const idsDepois = jornadas.flatMap(j => j.etapas.flatMap(e => [e.id, ...e.modulos.map(m => m.id)]));
escrever('dados/jornadas.json', jornadas);
escrever('dados/auditoria-estabilidade-jornada-012.json', { ids_anteriores: idsAntes, ids_preservados: idsAntes.filter(id => idsDepois.includes(id)), ids_novos: idsDepois.filter(id => !idsAntes.includes(id)), ids_removidos: idsAntes.filter(id => !idsDepois.includes(id)), compatibilidade_progresso: 'O progresso permanece associado aos IDs estáveis de unidade; nenhum ID anterior foi removido.' });
console.log(`Jornada 012: ${idsAntes.filter(id => idsDepois.includes(id)).length}/${idsAntes.length} IDs preservados, ${jornadas.length} níveis ativos.`);
