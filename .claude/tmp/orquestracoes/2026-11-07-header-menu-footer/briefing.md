# Briefing — planejar (skill decidir-especificar-e-planejar) a mudança do header e do footer do chat Ben

## O pedido
Use a skill decidir-especificar-e-planejar para planejar: vamos centralizar em cima a logo + Ben | {data de hoje} e mover o menu hamburguer para o footer na parte esquerda, e deve abrir um sheet com a opção atual

## Perguntas e respostas
- Ideia principal. Problema: no chat, o menu fica no canto superior direito, longe do polegar, e divide o topo com a marca. Não é: mudar o que o menu oferece nem criar abas embaixo. Exemplo: com o celular numa mão, você abre Tasks pelo footer sem mudar a pegada, e o topo fica só com logo + Ben | Sat, Nov 7 centralizado. Confirma que o motivo é alcance do polegar mais topo limpo?: Sim, é isso (recomendada)
- O que o sheet do menu mostra ao abrir?: As 4 opções atuais (recomendada)
- Onde fica o botão do menu no footer?: A esuqerda do campo, vamos melhorar o layout e designs dos componente de input e de gravar voz tambem
- Até onde vai o plano?: Sandbox + mobile + doc (recomendada)

## Definição de pronto
A skill decidir-especificar-e-planejar percorrida até o passo 4.5: na pasta da run existem
`decisao.md`, `spec.md` (com `## Gate`), `prototipo.md` se a Etapa 3 rodar, `projeto.md`,
`reconhecimento.md`, `roteiro.md` aprovado, `plano.md` aprovado pelo revisor e pelo usuário, e o
relatório final traz a linha `/implementar-e-validar .claude/tmp/orquestracoes/2026-11-07-header-menu-footer/`.
Nada do código de produto é implementado nesta run (só o protótipo da Etapa 3, se rodar).

## Fora do escopo
- Implementar a mudança (é da /implementar-e-validar).
- Mudar as opções do menu (Tasks, Notes, Reminders, Settings) ou o conteúdo de cada view.
- Navegação por abas no rodapé.

## Autorizações
nenhuma

## Premissas
- Os gates da skill (veredito, spec, escolha do protótipo, roteiro, plano) vão ao usuário como `bloco: perguntas`; o teto de duas rodadas do Etapa 0 vale só para dúvidas de reconhecimento.
- "Melhorar o layout e design do input e da gravação de voz" entra no escopo como eixo livre do protótipo: a spec não fixa o resultado, as variações exploram e o usuário escolhe vendo.
- O separador "|" segue o divisor vertical que o mobile já usa no `ChatTopBar`.
- Durante a gravação, o botão do menu segue o resto do footer (o footer vira `RecordingBar`); o desenho da gravação é eixo do protótipo.
- O topo centralizado vale para as 3 telas do sandbox que repetem o header (chat, picker, detail) e para o chat do mobile, a única tela com header lá.
- `ux-philosophy.md:21-22` (menu na top bar, sem nav inferior) é atualizado no mesmo trabalho.
- O sheet do menu reaproveita o padrão de sheet que o app já tem (`Modal` + reanimated); tocar numa opção leva à mesma view/folha de hoje.
