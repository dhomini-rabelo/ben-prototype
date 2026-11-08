# Decisão — card de lembrete no chat abre o detalhe; único/recorrente claro

## Pedido
Ao clicar em um lembrete na conversa que o agente acabou de criar deve abrir a tela de lembrete com o a lembrete q acabou de ser criado selecionado, também deve ficar mais claro se o alarme é recorrente ou único

## Ideia principal
Problema: depois que o Ben cria um lembrete pela conversa, o usuário não tem como conferir ou ajustar esse lembrete a partir do chat, porque o card não responde ao toque. Também não dá para saber se ele vai tocar uma vez ou se repete.
Não é: mudar como o agente decide a recorrência nem criar tipos novos de lembrete.
Exemplo: Ana diz "me lembra de tomar o remédio às 8", toca no card para ver se ficou "todo dia" e nada acontece.
Confirmado pelo usuário.

## Brief
problema:         o descrito acima; acontece a cada lembrete criado por voz (usuário)
para quem:        P1 a pessoa ocupada que captura lembretes falando com o Ben ("say it, Ben files it") (agente)
por que agora:    a criação por voz e a recorrência de goal (diária, dias úteis) já existem; sem conferência no chat, a confiança no que o Ben arquivou é baixa. Custo baixo: o id do lembrete já chega no card e o detalhe por id já existe (agente)
sinal de sucesso: num protótipo sem analytics, mede-se pela prova: tocar no card abre o detalhe certo, e único/recorrente é legível no card, na lista e no detalhe (agente)
menor versão:     card de lembrete inteiro tocável → lista de lembretes com o detalhe dele aberto; voltar leva ao chat; rótulo "Único" / "Todo dia" / "Dias úteis" no card, na lista e no detalhe (usuário, nas respostas do gate)
versão completa:  igual à menor (o usuário escolheu os três lugares)

## Pesquisa
Projeto: r0-mobile.md (card é View sem toque; menu-store já tem openDetail/detailTarget; ReminderDetail busca por id e trata 404; recorrência só aparece no editor de goal; galeria defasada) e r0-backend.md (CaptureView só traz kind/itemId/title/meta; recorrência existe em kind=goal com none/daily/weekdays; alarm sempre único; GET /reminders/:id/detail existe; só a primeira capture vira card). Externa: nenhuma — padrão comum (tocar no item criado abre o item) dispensa pesquisa.

## Lentes
- PM: problema real — o valor de capturar por voz depende de confiar no que foi arquivado, e conferir hoje exige ir ao menu e caçar o item; sinal observável em vídeo/print.
- Fundador: vale agora; pequeno e reforça o laço central do produto (dizer → Ben arquiva → conferir); não desloca nada grande.
- Tech lead: metade existe (itemId no card, openDetail, detalhe por id). Custo: estender a capture com a recorrência (domínio + presenter + tipo mobile + teste), tornar o card tocável, lembrar a origem "chat" para o voltar, strings en/pt-BR e desenhar na galeria antes. Risco baixo; atenção à memória v1 desatualizada sobre recorrência.

## Veredito
vai — persona nomeada, custo baixo com metade pronta, e reforça o laço central.

## Decisão do usuário
vai — "Aprovo, siga à spec" (usuário, 2026-11-07)

## Complementos
nenhum proposto (bordas como lembrete concluído ou inexistente entram em [Casos de borda] da spec)

## Menor versão
a do brief

## Como medir
provas da spec: vídeo do toque no card abrindo o detalhe certo e voltando ao chat; prints dos rótulos no card, na lista e no detalhe; teste do domínio para a recorrência na capture.
