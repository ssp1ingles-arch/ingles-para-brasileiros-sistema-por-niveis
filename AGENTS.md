# Instruções permanentes do projeto

- Ao concluir e validar uma atualização, crie um commit descritivo e envie a branch `main` ao GitHub.
- Nunca faça commit de trabalho incompleto ou com validações falhando.
- Nunca armazene ou envie credenciais, tokens, cookies, sessões, `.env` ou chaves privadas.
- Nunca adicione a árvore externa `Arquivo_Fonte` nem a árvore externa do sistema anterior “Inglês para Brasileiros — Escolha seu Caminho”.
- Nunca use `git push --force` nem operações destrutivas para descartar alterações.
- Preserve alterações legítimas existentes e revise `git diff` antes de preparar arquivos.
- Use mensagens de commit descritivas.
- Atualize `docs/PROGRESSO.md` somente com `node scripts/atualizar-progresso.mjs`.
- Antes do commit, valide dados, scripts, interface, rotas, segredos, arquivos grandes e integridade das árvores somente leitura.
- Como o repositório é público, revise também direitos autorais: não publique livros, PDFs, imagens de páginas, transcrições integrais nem campos brutos de fonte.
- No relatório final, informe o hash do commit, o resultado do push e a igualdade entre o commit local e o remoto.
