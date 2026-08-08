# Modo Prática

O modo Praticar usa somente unidades existentes e atividades rastreáveis. Atividades derivadas são marcadas `editorial_derivada`; nenhuma é apresentada como exercício original da fonte.

Tipos: reordenar tokens de uma frase exata; parear exemplos e traduções diretas; completar lacuna apenas para `a/an/do/does/did` inequívocos; produção com autorrevisão; e identificação de contrastes já presentes na unidade. Não existem distratores ou múltipla escolha inventada.

Respostas objetivas são normalizadas por caixa, espaços e pontuação terminal, sem aceitar outra ordem. Erros criam ou antecipam um registro `studyProgressV1` em estado `learning`, preservando conclusão e histórico anteriores. Acertos não produzem domínio automático.

Sessão e métricas usam `practiceSessionV1` e `practiceStatsV1`: respondidas, acertos, erros, autorrevisões, tipos, última prática e unidades enviadas à revisão. Unidades ambíguas são excluídas em `dados/auditoria-atividades-011.json`.

Limitações: o modo não avalia livremente produção aberta; nesses casos apenas revela o modelo e solicita autorrevisão. Áudio não é simulado quando a unidade possui somente transcrição.
