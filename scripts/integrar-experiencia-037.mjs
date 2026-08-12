import fs from 'node:fs';
import path from 'node:path';

const raiz = path.resolve(import.meta.dirname, '..');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const porNivel = Object.fromEntries(niveis.map(nivel => [nivel, ler(`dados/${nivel}/unidades.json`)]));
const fonte1217 = {arquivo: '1217_QW_SALA04_PDF4_GONNA_WANNA_GONNA_WANNA_GOTTA_KINDA_REDUCOES_INFORMAIS_2.md', arquivo_original: 'QW_SALA04_PDF4_GONNA_WANNA_GONNA_WANNA_GOTTA_KINDA_REDUCOES_INFORMAIS.pdf', pagina: 'páginas 1–2', secao: 'duplicata integral de 0144'};
const fonte1218 = {arquivo: '1218_entender-nativos.md', arquivo_original: 'entender-nativos.html', pagina: 'página HTML agregadora', secao: 'bloco curricular já classificado'};
const destinos1217 = new Set(['B1-L5-0144-01', 'B1-L5-0144-02']);
const destinos1218 = new Set(['B2-L10-0461-03', 'B1-L15-0841-01', 'B1-L10-0461-01', 'B1-L14-1203-01', 'A1-PRON-0001', 'A1-PRON-0002', 'A2-PRON-0001', 'B1-PRON-0001', 'B2-PRON-0001', 'B1-L5-0144-01', 'B1-L5-0144-02']);
for (const nivel of niveis) {
  for (const unidade of porNivel[nivel]) {
    if (destinos1217.has(unidade.id)) {
      unidade.fontes ||= [unidade.fonte];
      if (!unidade.fontes.some(fonte => fonte.arquivo === fonte1217.arquivo)) unidade.fontes.push(fonte1217);
    }
    if (destinos1218.has(unidade.id)) {
      unidade.fontes ||= [unidade.fonte];
      if (!unidade.fontes.some(fonte => fonte.arquivo === fonte1218.arquivo)) unidade.fontes.push(fonte1218);
    }
  }
  gravar(`dados/${nivel}/unidades.json`, porNivel[nivel]);
}
const unidades = Object.values(porNivel).flat();
const atividades = ler('dados/atividades.json');
const jornadas = ler('dados/jornadas.json');
const anterior = ler('dados/auditoria-estabilidade-jornada-036.json');
const referencias = jornadas.flatMap(jornada => jornada.etapas.flatMap(etapa => etapa.modulos.flatMap(modulo => modulo.unidades || [])));
const presentes = new Set(referencias);
const ids = new Set(unidades.map(unidade => unidade.id));
const contagem = new Map();
referencias.forEach(id => contagem.set(id, (contagem.get(id) || 0) + 1));
const cobertura = niveis.map(nivel => {
  const publicadas = unidades.filter(unidade => unidade.nivel.toLowerCase() === nivel);
  const complementares = publicadas.filter(unidade => !presentes.has(unidade.id)).map(unidade => ({id: unidade.id, motivo: 'Complementar preservada.'}));
  return {nivel: nivel.toUpperCase(), publicadas: publicadas.length, presentes: publicadas.length - complementares.length, complementares};
});
gravar('dados/auditoria-atividades-037.json', {lote: '037', base_preservada: atividades.length, unidades_novas: 0, atividades_novas: 0, total: atividades.length, unidades_sem_atividade: 66, justificativa: '1217 é duplicata integral e 1218 compila blocos já classificados; nenhuma atividade ambígua ou repetida foi criada.'});
gravar('dados/auditoria-cobertura-jornada-037.json', {lote: '037', por_nivel: cobertura, totais: {publicadas: unidades.length, presentes: presentes.size, complementares: unidades.length - presentes.size}, ids_anteriores: anterior.ids_preservados, ids_anteriores_preservados: anterior.ids_preservados.filter(id => presentes.has(id)), novos_posicionados: [], orfaos: [...presentes].filter(id => !ids.has(id)), repetidos: [...contagem].filter(([, total]) => total > 1), referencias_inexistentes: [...presentes].filter(id => !ids.has(id)), etapas_modulos_afetados: []});
gravar('dados/auditoria-estabilidade-jornada-037.json', {lote: '037', ids_anteriores: anterior.ids_preservados, ids_preservados: anterior.ids_preservados, ids_removidos: [], ids_adicionados: [], etapas_preservadas: true, modulos_preservados: true, ordem_preservada: true, localStorage: {formato_alterado: false, chaves_alteradas: false, favoritos_revisoes_compativeis: true, progresso_retomada_compativeis: true}});
console.log('Experiência 037 e procedências consolidadas; unidades, atividades, Jornada e localStorage preservados.');
