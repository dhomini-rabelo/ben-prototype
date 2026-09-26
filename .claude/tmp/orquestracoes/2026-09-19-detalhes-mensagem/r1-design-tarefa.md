# Tarefa — especificação de design do menu de long-press e do sheet de detalhes

Você é consultor de design desta feature. Sua entrega é uma **especificação de design pronta para
um planejador técnico consumir sem inventar nada**. Você não escreve código de feature.

## Leia antes de decidir

1. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md` — o contrato da task.
2. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r0-mobile-chat.md` — o que já existe no chat do mobile.
3. `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r0-design-memoria.md` — tokens e padrões de superfície do repo.
4. `/root/so/repos/ben-prototype/.claude/agents-docs/design-advisor/design.md` — a fonte de verdade do design system.
5. A imagem de referência do usuário: `/home/dev/.claude/uploads/4c33de24-7ee5-4b1f-9684-69346aa37a69/e33331f3-image.jpg` (abra com a tool Read). É o long-press do ChatGPT mobile e é o alvo visual do menu.
6. Os componentes reais que você vai mandar reaproveitar: leia de fato os arquivos citados no `r0-mobile-chat.md` (`message-bubble`, `settings-sheet-overlay`, `menu-sheet`, `item-detail-root`) antes de prescrever qualquer coisa. Prescrição que não bate com o componente real custa uma rodada de retrabalho.

## O que especificar

**A. O menu de long-press**
- Como ele aparece: posição em relação à bolha pressionada, o que acontece com o fundo, animação de entrada e saída, como fecha (toque fora, back, escolher um item), feedback háptico se houver precedente no app.
- A aparência: superfície, radius, elevação, largura, altura de cada item, ícone (nome real do `lucide-react-native`), tipografia (token real), espaçamento, estado de pressed.
- Os dois itens: rótulo exato ("Ver input" / "Ver output") e ícone de cada um.
- O que acontece quando a mensagem não tem dados de debug: o item fica desabilitado, some, ou abre o sheet num estado vazio? Decida e justifique.

**B. O bottom sheet de detalhes**
- Altura, comportamento de scroll, header (título, o que mais), como fecha, se tem handle de arrastar.
- **A parte que mais importa: como o conteúdo fica "fácil de navegar".** O conteúdo é grande: system prompt longo, histórico de várias mensagens, definição de tools, resposta crua, tool calls, tokens, modelo, latência. Especifique a hierarquia concreta: quais seções existem, em que ordem, o que já vem aberto e o que vem colapsado, o que é resumo e o que é detalhe, onde ficam os botões de copiar, como o JSON é apresentado para ser legível num celular (fonte mono, quebra de linha, indentação, limite de altura com "ver mais").
- Estados: carregando, vazio (mensagem antiga sem dados), erro.
- Diga se input e output são dois sheets separados ou um sheet só com a seção certa aberta. Justifique pela navegação, não pela facilidade de implementar.

**C. O que reaproveitar e o que é novo**
Lista explícita: componente existente que serve como está, componente existente que precisa de prop nova, componente novo a criar (com nome e caminho sugerido seguindo a convenção do repo).

## Regras

- Use os tokens reais do repo. Se não existe token para o que você precisa, diga qual criar e onde.
- Toda prescrição vem com o princípio de design que a sustenta, em uma linha. Nada de gosto pessoal solto.
- Não sub-delegue: não use a tool `Agent`.
- Não chame `AskUserQuestion`: toda ambiguidade vira premissa assumida e documentada no seu arquivo, numa seção `Premissas`.
- Não edite nenhum arquivo do projeto. Você escreve um arquivo só, o da sua entrega.

## Entrega

Escreva em: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r1-design.md`

Seções curtas, caminhos absolutos, nomes reais de tokens/componentes/ícones. Escrito para um
planejador que não viu a sua janela.

## Teto de janela

Rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r1-design"` a cada ~15 turns.
Se vier `status=handoff` ou `status=preso`, pare, escreva o arquivo com o que já tem e retorne.

## Retorno

No máximo 10 linhas: o caminho do arquivo e as decisões de design que mudam o plano técnico.
