import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
const raiz = path.resolve(import.meta.dirname, '..');
const fonteDir = path.resolve(raiz, '..', 'Arquivo_Fonte');
const ler = arquivo => JSON.parse(fs.readFileSync(path.join(raiz, arquivo), 'utf8'));
const gravar = (arquivo, valor) => fs.writeFileSync(path.join(raiz, arquivo), `${JSON.stringify(valor, null, 2)}\n`);
const sha = valor => crypto.createHash('sha256').update(valor).digest('hex');
const normalizar = valor => valor.replace(/^---[\s\S]*?---\s*/u, '').replace(/\r\n/g, '\n').replace(/[ \t]+/g, ' ').replace(/\n{3,}/g, '\n\n').trim();
const nome1205 = '1205_2E6834F9-E31A-4992-8A29-F6622BD1EBED.md';
const nome1206 = '1206_3314942F-07CF-487C-9C83-707A4EB8B493.md';
const texto1205 = fs.readFileSync(path.join(fonteDir, nome1205), 'utf8');
const texto1206 = fs.readFileSync(path.join(fonteDir, nome1206), 'utf8');
const mapa = ler('dados/mapeamento-fontes-extensas-031.json');
const triagem = ler('dados/lote-031-triagem.json');
const fonte1206 = {
  numero: 1206,
  nome_completo: nome1206,
  tipo: 'OCR de imagem didática curta',
  tamanho_bytes: Buffer.byteLength(texto1206),
  hash_bruto: sha(texto1206),
  hash_normalizado: sha(normalizar(texto1206)),
  leitura_integral: true,
  imagem_original_conferida_somente_leitura: true,
  paginacao: { possui_marcadores: false, presentes: 0, ausentes: [], repetidas: [], vazias: [] },
  integridade: { utf8_valido: true, caracteres_substituicao: (texto1206.match(/�/gu) || []).length, marcadores_cid: (texto1206.match(/\(cid:\d+\)/gu) || []).length, ocr_insuficiente: false, corrupcao: false, correspondencia_visual: 'texto principal e créditos confirmados; OCR aglutinou separador dos créditos e simplificou a aproximação fonética' },
  estrutura: { frases_bilingues: 1, aproximacoes_foneticas_nao_padronizadas: 1, creditos_ou_identificadores: 2, imagens_publicadas: 0 },
  partes: [
    { id: 'frase-bilingue', natureza: 'frase curta com would para situação hipotética', decisao: 'consolidar procedência em unidade existente', nivel_cefr: 'B1', habilidade_principal: 'Gramática', destino_curricular_especifico: 'B1-L6-0230-01', justificativa: 'O uso fundamental de would já é coberto pela unidade existente; a ocorrência não justifica nova unidade.', elegivel_atividade: false, elegivel_jornada: false },
    { id: 'aproximacao-fonetica', natureza: 'grafia aproximativa de pronúncia para falante de português, sem IPA', decisao: 'descartar', destino_curricular_especifico: null, justificativa: 'Não é transcrição fonética padronizada e neutraliza contrastes importantes; não será ensinada como pronúncia confiável.' },
    { id: 'creditos', natureza: 'nome, perfil social e marca de republicação', decisao: 'descartar', destino_curricular_especifico: null, justificativa: 'Créditos e identificadores pessoais/editoriais não constituem conteúdo curricular e não serão republicados.' }
  ],
  totais: { partes: 3, consolidadas: 1, descartadas: 2, uteis_sem_destino: 0 },
  observacao_publica: 'Somente classificação, contagens, hashes e destino; a frase, a imagem, a aproximação fonética e os créditos não foram republicados.'
};
const fonte1205 = mapa.fontes.find(item => item.numero === 1205);
mapa.fontes = [fonte1205, fonte1206];
mapa.comparacoes_integrais = [{
  fontes: [1205, 1206],
  executada_apos_validacao_1205: true,
  tamanho_1205: Buffer.byteLength(texto1205),
  tamanho_1206: Buffer.byteLength(texto1206),
  hash_bruto_1205: sha(texto1205),
  hash_bruto_1206: sha(texto1206),
  hash_normalizado_1205: sha(normalizar(texto1205)),
  hash_normalizado_1206: sha(normalizar(texto1206)),
  corpo_integral_igual: normalizar(texto1205) === normalizar(texto1206),
  ordem_estrutural_igual: true,
  tipo_origem_igual: true,
  modelo_visual_igual: true,
  verbo_base_compartilhado: 'think',
  foco_gramatical_1205: 'going to para futuro planejado',
  foco_gramatical_1206: 'would para situação hipotética',
  imagens_origem_iguais: false,
  creditos_editoriais_equivalentes: true,
  sobreposicao: 'extensa no modelo visual, créditos e verbo-base; conteúdo linguístico central distinto',
  conteudo_exclusivo_1205: 'uma ocorrência de futuro planejado com going to',
  conteudo_exclusivo_1206: 'uma ocorrência de would em formulação hipotética',
  classificacao: 'fragmentos complementares com sobreposição editorial; não são duplicatas',
  decisao: 'classificar separadamente, consolidar em destinos gramaticais distintos e não publicar imagens, frases, pseudo-fonética ou créditos'
}];
gravar('dados/mapeamento-fontes-extensas-031.json', mapa);
triagem.intervalo = [1205, 1206];
triagem.sequenciais.push({ numero: 1206, nome: nome1206, tamanho_bytes: fonte1206.tamanho_bytes, hash_bruto: fonte1206.hash_bruto, hash_normalizado: fonte1206.hash_normalizado, leitura_integral: true, status: 'integralmente classificada', tipo: fonte1206.tipo, partes: 3, sem_destino_util: 0 });
triagem.observacao = 'Lote encerrado em 1206, antes de 1207; 1205 e 1206 são fragmentos complementares, não duplicatas.';
gravar('dados/lote-031-triagem.json', triagem);
const revisao = ler('dados/revisao-fontes.json');
revisao['1205'] = { estado: 'integralmente classificada', secoes: ['OCR de imagem; futuro com going to consolidado; pseudo-fonética e créditos descartados'] };
revisao['1206'] = { estado: 'integralmente classificada', secoes: ['OCR de imagem; would consolidado; pseudo-fonética e créditos descartados'] };
gravar('dados/revisao-fontes.json', revisao);
const fontes = ler('dados/mapa-fontes.json');
for (const item of fontes.arquivos) { const estado = revisao[item.id]; if (estado) { item.estado_revisao = estado.estado; item.secoes = estado.secoes.join(' | '); } }
gravar('dados/mapa-fontes.json', fontes);
console.log('1206 classificada e comparação 1205×1206 concluída.');
