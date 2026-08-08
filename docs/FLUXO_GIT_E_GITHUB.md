# Fluxo Git e GitHub

- Repositório: `https://github.com/ssp1ingles-arch/ingles-para-brasileiros-sistema-por-niveis`
- Visibilidade obrigatória: pública, somente após auditoria de segredos, direitos e arquivos expostos.
- Branch principal: `main`.
- Remoto: `origin`, sem credenciais embutidas na URL.

## Commits

Use mensagens descritivas no formato `tipo: descrição`, por exemplo `feat: concluir lote 025 de classificação das fontes` ou `chore: atualizar auditorias do repositório`.

Antes de cada commit:

1. Atualize `docs/PROGRESSO.md` com `node scripts/atualizar-progresso.mjs`.
2. Execute a suíte-base e os validadores do lote.
3. Execute a auditoria das 11 rotas com o servidor local ativo.
4. Valide JSON, JavaScript, IDs, Jornada e interface.
5. Revise `git diff`, `git status` e a lista preparada.
6. Procure segredos e arquivos grandes.
7. Confirme que as árvores externas somente leitura não foram alteradas ou incluídas.
8. Confirme que não existem livros, PDFs, páginas digitalizadas, transcrições integrais ou campos brutos de fonte no conjunto preparado.

## Push

Use `git push -u origin main` no primeiro envio e `git push origin main` nos seguintes. Confirme que `git rev-parse HEAD` é igual a `git rev-parse origin/main` após `git fetch origin`. Nunca use `git push --force` e nunca reescreva histórico publicado.

## Recuperação segura

Em falhas de autenticação ou rede, preserve o commit local e retome apenas o push. Em conflitos remotos, inspecione e integre conscientemente; não apague alterações legítimas e não use operações destrutivas para descartá-las.

Credenciais, tokens, cookies, sessões, perfis de navegador, `.env` e chaves privadas são proibidos. Também é proibido adicionar `Arquivo_Fonte`, o sistema anterior, livros, PDFs, imagens integrais de páginas ou reproduções extensas de terceiros ao Git.
