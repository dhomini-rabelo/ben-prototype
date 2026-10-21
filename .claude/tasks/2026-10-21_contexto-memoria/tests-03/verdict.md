# Verdict tests-03 contexto-memoria (nonce modelos-gasto-historico-r15-test-memoria-video)
Ambiente: Expo web 8082 (390x844), server-ben 3335 com modelo real openai/gpt-6.1-sol (chave mascarada sk-or-***), sqlite copia de teste (backup antes da limpeza: scratchpad/test-pre-r15.db). Estado limpo: tabelas messages, conversations e memories do usuario u1 zeradas antes do roteiro.

## Roteiro (tudo pelo app, 10 mensagens do usuario reais, todas na gravacao)
1. "meu pai se chama Carlos e minha mae Maria": linha em memories key=familia:nome-familiares value="Pai: Carlos; Mae: Maria." conversationId=cc2bc8a6-711f-4b20-9102-00d2b0f62b92 (origem). Print 01.
2. 8 mensagens casuais (tempo, almoco, filme, praia, chuva, pizza, recomendacao de filme, sabado). Prints 02.
3. Pergunta A: "vou ligar pros meus pais, como eles se chamam mesmo?" -> "Mano, teu pai se chama Carlos e tua mae, Maria!" (msg 1cc9707e...). Print 03.
4. Trace A: o historico enviado tem 16 mensagens (a ultima e a pergunta), a original dos pais NAO esta nele (busca por "meu pai se chama Carlos e minha" = false). O system prompt traz "# Memorias do usuario" com familia:nome-familiares: Pai: Carlos; Mae: Maria. RESSALVA: neste trace o modelo chamou get-history-context (topics family:familia:pais), nao get-older-messages; o resumo devolvido tambem cita Carlos e Maria. Entao a resposta A nao isola memoria de resumo de historico.
5. Pergunta B (outra formulacao): "alias, qual e o nome da minha mae? esqueci" -> "Tua mae se chama Maria, mano!" (msg 6d97d3f4...). Trace B: 2 steps, ZERO tool calls, historico de 16 msgs sem a original dos pais, memoria familia:nome-familiares no prompt. Logo a lembranca veio da memoria injetada no prompt. Print 05.

## Evidencias
- Video: /root/so/repos/ben-prototype/.claude/tasks/2026-10-21_contexto-memoria/tests-03/video/memoria-casual.webm (4.3 MB, webm do browser_start_video; cobre passos 1 a 5).
- Prints: tests-03/screenshots/01-memoria-salva.png, 02-meio-conversa.png, 03-pergunta-casual-resposta.png, 04-trace-app.png (clique na msg do Ben; o app nao mostra um painel de trace legivel, o trace foi lido via GET /messages/:id/trace), 05-segunda-pergunta.png.
- Custos reais por mensagem 0.009 a 0.015 USD (rodape do app).

## PASS
Objetivo provado pela pergunta B (sem tools, original fora das 15, memoria no prompt). A pergunta A passa com a ressalva acima (resposta veio do prompt de memoria e/ou da tool get-history-context; nao houve get-older-messages).
