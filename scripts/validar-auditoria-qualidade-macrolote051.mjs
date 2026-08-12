import fs from 'node:fs';
const ler = arquivo => JSON.parse(fs.readFileSync(new URL(`../${arquivo}`, import.meta.url), 'utf8'));
const auditoria = ler('dados/auditoria-qualidade-macrolote051.json');
const manifesto = ler('dados/lote-051-manifesto.json');
const checkpoints = ler('dados/lote-051-checkpoints.json');
const mapa = ler('dados/mapa-fontes.json');
const revisao = ler('dados/revisao-fontes.json');
const unidades = ['a1','a2','b1','b2','c1','c2','kids'].flatMap(nivel => ler(`dados/${nivel}/unidades.json`));
const idsUnidades = new Set(unidades.map(unidade => unidade.id));
const testes = [];
const testar = (nome, condicao) => { if (!condicao) throw new Error(`Falhou: ${nome}`); testes.push(nome); };

testar('soma exclusiva dos estados principais', Object.values(auditoria.fechamento_estados_principais).reduce((a,b) => a+b, 0) === 78 && auditoria.fontes.every(fonte => typeof fonte.estado_principal === 'string'));
testar('características secundárias sobrepostas sem alterar estado', auditoria.fontes.some(fonte => fonte.caracteristicas.length > 1) && auditoria.fontes.every(fonte => Array.isArray(fonte.caracteristicas)));
testar('78 fontes únicas', auditoria.fontes.length === 78 && new Set(auditoria.fontes.map(fonte => fonte.numero)).size === 78);
testar('antecipadas não recontadas', !auditoria.fontes.some(fonte => [1252,1253,1278,1279,1313,1314,1315,1316].includes(fonte.numero)));
testar('seis checkpoints de 13', checkpoints.checkpoints.length === 6 && checkpoints.checkpoints.every(checkpoint => checkpoint.fontes.length === 13));
testar('hashes completos', auditoria.fontes.every(fonte => /^[a-f0-9]{64}$/.test(fonte.hash_bruto) && /^[a-f0-9]{64}$/.test(fonte.hash_normalizado)));
testar('retomada após checkpoint', checkpoints.checkpoints.every(checkpoint => checkpoint.retomada_segura) && checkpoints.checkpoints.at(-1).proxima_fonte === 1325);
testar('prevenção de salto silencioso', checkpoints.checkpoints.every(checkpoint => checkpoint.continuidade_numerica) && checkpoints.checkpoints.flatMap(checkpoint => checkpoint.fontes).length === 78);
testar('prevenção de destino genérico', auditoria.fontes.flatMap(fonte => fonte.ids_destinos).every(id => idsUnidades.has(id) && !/gener|pendente|outro/i.test(id)));
testar('decisão por seção para livros extensos', auditoria.livros_extensos.length === 36 && auditoria.livros_extensos.every(livro => livro.total_secoes_decididas === livro.total_capitulos_ou_secoes && livro.total_secoes_decididas > 0));
testar('detecção de conteúdo útil sem destino', auditoria.fontes.every(fonte => fonte.conteudo_util_sem_destino === 0) && auditoria.destinos_e_procedencias.fontes_com_conteudo_util_sem_destino === 0);
testar('manifesto consistente com revisão e mapa', manifesto.fontes.every(item => auditoria.fontes.some(fonte => fonte.numero === item.numero && fonte.hash_bruto === item.hash_bruto) && revisao[String(item.numero)] && mapa.arquivos.some(fonte => +fonte.id === item.numero)));

console.log(`AUDITORIA QUALIDADE 051: ${testes.length}/${testes.length} testes específicos aprovados.`);
