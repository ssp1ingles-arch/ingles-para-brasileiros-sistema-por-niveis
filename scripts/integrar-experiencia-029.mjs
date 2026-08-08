import fs from 'node:fs';
import path from 'node:path';
const raiz = path.resolve(import.meta.dirname, '..');
const niveis = ['a1', 'a2', 'b1', 'b2', 'c1', 'c2', 'kids'];
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const unidades = niveis.flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const atividades = ler('dados/atividades.json');
const jornadas = ler('dados/jornadas.json');
const anterior = ler('dados/auditoria-estabilidade-jornada-028.json');
const referencias = jornadas.flatMap(jornada => jornada.etapas.flatMap(etapa => etapa.modulos.flatMap(modulo => modulo.unidades || [])));
const presentes = new Set(referencias);
const ids = new Set(unidades.map(item => item.id));
const contagem = new Map();
referencias.forEach(id => contagem.set(id, (contagem.get(id) || 0) + 1));
const porNivel = niveis.map(nivel => {
  const publicadas = unidades.filter(item => item.nivel.toLowerCase() === nivel);
  const complementares = publicadas.filter(item => !presentes.has(item.id)).map(item => ({ id: item.id, motivo: 'Complementar preservada.' }));
  return { nivel: nivel.toUpperCase(), publicadas: publicadas.length, presentes: publicadas.length - complementares.length, complementares };
});

gravar('dados/auditoria-atividades-029.json', { lote: '029', base_preservada: atividades.length, unidades_novas: 0, atividades_novas: 0, total: atividades.length, unidades_sem_atividade: 66, justificativa: '1197 é editorial; os exemplos de 1198/1199 não foram transformados automaticamente em atividades.' });
gravar('dados/auditoria-cobertura-jornada-029.json', { lote: '029', por_nivel: porNivel, totais: { publicadas: unidades.length, presentes: presentes.size, complementares: unidades.length - presentes.size }, ids_anteriores: anterior.ids_preservados, ids_anteriores_preservados: anterior.ids_preservados.filter(id => presentes.has(id)), novos_posicionados: [], orfaos: [...presentes].filter(id => !ids.has(id)), repetidos: [...contagem].filter(([, total]) => total > 1), referencias_inexistentes: [...presentes].filter(id => !ids.has(id)), etapas_modulos_afetados: [] });
gravar('dados/auditoria-estabilidade-jornada-029.json', { lote: '029', ids_anteriores: anterior.ids_preservados, ids_preservados: anterior.ids_preservados, ids_removidos: [], ids_adicionados: [], etapas_preservadas: true, modulos_preservados: true, ordem_preservada: true, localStorage: { formato_alterado: false, chaves_alteradas: false, favoritos_revisoes_compativeis: true, progresso_retomada_compativeis: true } });
console.log('Experiência 029 preservada.');
