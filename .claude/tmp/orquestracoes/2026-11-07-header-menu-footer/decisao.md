# Decisão — Topo centralizado e menu no footer do chat

## Pedido
vamos centralizar em cima a logo + Ben | {data de hoje} e mover o menu hamburguer para o footer na parte esquerda, e deve abrir um sheet com a opção atual

## Ideia principal
Problema: no chat, o menu fica no canto superior direito, longe do polegar, e divide o topo com a marca.
Não é: mudar o que o menu oferece nem criar abas embaixo.
Exemplo: com o celular numa mão, você abre Tasks pelo footer sem mudar a pegada, e o topo fica só com logo + Ben | Sat, Nov 7 centralizado.
Confirma? Sim, é isso (usuário, 2026-11-07).

## Brief
problema:       o menu no canto superior direito fica fora do alcance do polegar e divide o topo com a marca (usuário)
para quem:      quem usa o Ben com uma mão, no meio do dia corrido — a persona "busy-day" do produto (agente)
por que agora:  o chat v2 está em iteração de layout no sandbox e no mobile; mudar agora custa menos que depois de mais telas herdarem o header (agente)
sinal de sucesso: abrir qualquer opção do menu com o polegar a partir do footer, sem alcançar o topo; visto na prova de tela em 390x844 (agente)
menor versão:   topo centralizado (logo + Ben | data), botão do menu à esquerda do campo, sheet com as 4 opções atuais
versão completa: a menor + layout e design melhorados do campo de texto e da gravação de voz (usuário, rodada 1)

## Pesquisa
- Projeto: r0-mobile.md e r0-design.md desta pasta (header em `chat-top-bar.tsx`, menu como rota modal `/menu`, sheets via `Modal` + reanimated, header repetido em 3 shells do sandbox, `ux-philosophy.md:21-22` contraditório).
- Padrão: `padroes-design-ui-ux.md:217` recomenda bottom sheet em mobile; menu de ação na zona do polegar é a mesma lógica dos apps de mensagem que ancoram ações ao composer.

## Lentes
- PM: problema real para uso com uma mão; sinal observável na tela (opção aberta a partir do footer).
- Fundador: barato, num protótipo de layout; move a ergonomia do chat, que é a tela principal.
- Tech lead: reaproveita header, sheet e views existentes; custo real está em redesenhar o composer e a gravação, que é eixo de protótipo, e em manter sandbox e mobile alinhados.

## Veredito
vai — problema confirmado pelo usuário, custo baixo, peças já existem.

## Decisão do usuário
vai — aprovado com a spec (rodada 2, 2026-11-07), versão completa (com input e gravação melhorados)

## Complementos
nenhum proposto (o usuário acrescentou a melhoria do input e da gravação, já em `versão completa`)

## Menor versão
ver Brief; o usuário pediu a versão completa (com input e gravação melhorados) na rodada 1.

## Como medir
Prova de tela (browser-mobile-tester, 390x844): topo centralizado, botão no footer à esquerda, sheet com as 4 opções, cada opção abrindo a view de hoje.
