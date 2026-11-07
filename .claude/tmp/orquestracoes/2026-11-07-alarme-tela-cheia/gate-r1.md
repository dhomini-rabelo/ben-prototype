# Gate rodada 1 (O1) — estado para retomar

Fluxo: skill decidir-especificar-e-planejar. Rodada 1 junta Etapa 1 Passo 0 (ideia principal) + entrevista (Passo 3) + preferências de processo (protótipo, gates do roteiro/plano), para poupar idas ao usuário.

## Ideia principal enviada
Problema: quando um lembrete com horário vence, o aviso é uma notificação comum (ou, com o app aberto, um painel pequeno embaixo); a pessoa ocupada não percebe ou ignora, e o compromisso passa.
Não é: mudar como o lembrete é criado por voz, o resumo diário, nem gamificar o despertar.
Exemplo: Ana pede "me lembra às 15h de buscar o filho"; às 15h o celular está bloqueado no silencioso, o aviso some entre outras notificações e ela só vê às 15h40.
Confirma? O aviso tem de ser impossível de ignorar, com celular bloqueado e app fechado, até a pessoa parar ou adiar.

## Rascunho do brief (agente)
problema: acima. para quem: usuário ocupado do Ben que cria lembrete por voz (memória business-rules v1). por que agora: lembrete local já existe (task notificacoes-correcoes, 30/10) mas é fraco; é o que dá valor ao "say it, Ben files it". sinal de sucesso: % de alarmes com ação (parar/soneca/concluir) em até 5 min do disparo (acknowledge no backend já registra). menor versão: Android dev build/APK, só kind alarm, tela cheia + som em loop até agir, soneca e parar; web/app aberto mostra a mesma tela. versão completa: + iOS AlarmKit, missão para dispensar, Play Store.

## Perguntas enviadas: ver o bloco no retorno do O1 (8 perguntas: ideia, plataforma, tipos, som, missão, distribuição, protótipo, gates).

## Próximo passo ao receber respostas
1. Escrever briefing.md (pedido verbatim + respostas).
2. Escrever decisao.md (formato SKILL.md Etapa 1) com veredito.
3. Disparar filho opus para escrever spec.md (Etapa 2) lendo decisao.md, r0-mobile.md, r0-pesquisa.md, SKILL.md Etapa 2.
4. Rodada 2 de perguntas = veredito + gate da spec (+ quebra).
