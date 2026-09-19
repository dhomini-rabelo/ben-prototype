# Briefing — long-press numa mensagem do bot abre "Ver input" / "Ver output", e cada um abre um bottom sheet com todos os detalhes da chamada ao modelo

## O pedido

Verbatim, como o usuário escreveu:

> Agora preciso que faça uma task seguindo o padrão de loop 'faça um loop agente opus planeja -> pedi p outro agente opus revisar logica e padrao de codigos, sem ser tendecioso a aprovar (se recusar, volta ao planejador) -> depois outro agente sonnet implementa -> depois um sonnet browser tester testa - no final commit e push' .  A task: ao pressionar uma mensagem do bot deve aparecer as opções ver input e ver output e quando clicar aparecer um modal com todas as informações de uma forma fácil de navegar e ver os detalhes. O único user sou eu, o dev do app, portanto eu quero ver os detalhes para ver se o bot está se comportando bem. Deixei uma imagem de referencia do exemplo do que acontece ao pressionar uma mensagem do chatgpt. Qualquer duvida sobre como deve ficar o resultado final me pergunte no planejamento tente enteder exatamente oq eu espero, não quero ter ficar em um loop de fazer varias correções até ficar decente, não me decepcione.

Imagem de referência: `/home/dev/.claude/uploads/4c33de24-7ee5-4b1f-9684-69346aa37a69/e33331f3-image.jpg` — long-press numa mensagem do ChatGPT mobile: um card escuro flutuante sobre a conversa, com timestamp no topo e uma lista vertical de ações com ícone à esquerda (Copiar, Selecionar texto, Editar mensagem, Compartilhar prompt). O fundo da conversa continua visível e escurecido.

O usuário é o único user do app e é o dev. A feature é ferramenta de inspeção: ele quer ver se o bot está se comportando bem.

## O fluxo que o usuário pediu (é parte do contrato, não sugestão)

1. Um agente **opus** planeja.
2. Outro agente **opus** revisa lógica e padrão de código, **sem viés de aprovar**. Se recusar, volta ao planejador.
3. Um agente **sonnet** implementa.
4. Um **browser tester sonnet** testa no app rodando.
5. No fim, commit e push.

## Perguntas e respostas

- Quanto capturar de input/output (os dados não existem hoje no backend): **input e output brutos, completos** — payload enviado ao modelo (system prompt, histórico, definição das tools) e a resposta crua (texto, tool calls, tokens, modelo, latência), persistidos no sqlite.
- Como o detalhe aparece: **bottom sheet quase full-screen**, seguindo o padrão do app (`ItemDetailSheet`, `SettingsSheet`), com seções colapsáveis, JSON legível, botão de copiar e scroll longo confortável. Não é modal centralizado.
- Desenhar antes em `project-design`: **não** — vai direto no `project-mobile`, porque é ferramenta de debug e não tela de produto.
- Itens do menu de long-press: **só "Ver input" e "Ver output"**.

## Definição de pronto

Provável de fora, no app rodando (Expo web na porta 8081, viewport de celular 390x844):

1. Long-press numa mensagem do bot abre um menu flutuante com exatamente dois itens: "Ver input" e "Ver output".
2. Tocar em qualquer um dos dois abre um bottom sheet quase full-screen com os dados completos daquela chamada, navegável: seções, scroll, copiar.
3. Long-press numa mensagem do usuário **não** abre o menu.
4. O backend persiste input e output brutos por mensagem no sqlite e os expõe por uma rota; a mensagem antiga, sem dados, mostra um estado vazio explícito em vez de quebrar.
5. `npm run lint:fix` e `npx tsc --noEmit` passam em `project-mobile` e em `project-backend`.
6. Screenshot do menu aberto e do sheet aberto, tirados pelo browser tester.
7. Commit e push na branch `feat/update-model-and-add-logs`.

## Fora do escopo

- `project-design`: nenhuma tela nova desenhada lá.
- Itens de menu além dos dois pedidos (copiar texto, editar, compartilhar).
- Long-press em mensagem do usuário.
- Qualquer mudança na `main` ou deploy.
- Backfill de mensagens antigas: elas ficam sem dados, e isso é estado vazio, não erro.

## Autorizações

- Commit e push na branch `feat/update-model-and-add-logs`, autorizados pelo usuário no pedido.
- Migração de schema no sqlite local, autorizada pela resposta "input e output brutos, completos".

## Premissas

- Commit e push vão para a branch atual `feat/update-model-and-add-logs`, nunca para a `main`: há CI de deploy automático na VPS a cada push na main, e o usuário não pediu deploy.
- "Modal" no pedido do usuário significa a superfície de detalhe do app, que ele confirmou ser bottom sheet quase full-screen.
- O menu de long-press imita o formato da imagem de referência (card flutuante sobre a conversa escurecida, itens com ícone à esquerda), com o conteúdo reduzido aos dois itens pedidos.
- O app roda em Expo web na porta 8081 para o teste de browser; o teste é feito em viewport de celular.
