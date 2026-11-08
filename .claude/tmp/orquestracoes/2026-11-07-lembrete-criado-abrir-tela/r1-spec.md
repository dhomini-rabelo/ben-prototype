# r1-spec — insumo do gate da Etapa 2

Veredito: ok. Spec em `spec.md` (sem `## Gate`). Contagem: 20 AC, 4 RT, 12 CB, 10 PR, com [Visual].

## (a) Resumo
- Rótulo de repetição no card, na lista e no detalhe: "Único" (alarme e goal sem repetição), "Todo dia", "Dias úteis" (seg-sex), dias abreviados para outros conjuntos ("Seg, Qua"); en "One-time" / "Every day" / "Weekdays" / "Mon, Wed" (AC-001 a AC-005, AC-010, AC-011).
- Conditional: "Quando acontecer" no card; na lista e no detalhe o selo de tipo já diz isso, sem repetir (AC-004, AC-010, AC-011).
- Card de lembrete inteiro tocável, com retorno visual, abre a tela de lembretes com o detalhe aberto; fechar fica na lista; voltar leva ao chat (AC-006 a AC-009).
- Editar a repetição atualiza o rótulo no detalhe e na lista (AC-012).
- Continua como hoje: botão da task, nota não tocável, long press da bolha, menu pelo topo (inclusive depois de vir pelo card), lista → detalhe, editor, horário e tipo, alarme/notificações (AC-013 a AC-020).
- RT: repetição chega junto do card (criação e histórico); card antigo mostra a repetição atual; sem rota nova; "veio do chat" vale só para aquela abertura.
- Bordas: concluído, sumiu, carregando, falha/sem conexão com tentar de novo, toque duplo, card em erro, vários lembretes numa resposta, card que some ao recarregar, card desatualizado após editar, voltar do sistema, falha da lista.
- Prova: 2 testes unitários (domínio e rótulos), vídeos do fluxo, de edição e do que continua como hoje, fotos en/pt-BR e dos estados, 1 teste de componente (sem captura), ponta a ponta no navegador 390x844 (geral).

## (b) Perguntas da regra 7
Nenhuma: nada recusável (sem serviço novo, custo ou dependência).

## (c) Design
Não é óbvio: entra um elemento novo (rótulo) em três telas, com decisão de forma e posição, e o card ganha uma interação nova (sinal de toque). [Visual] está escrito. Recomendação: protótipo (recomendada pela skill). A galeria está defasada em relação ao app (sem selo de tipo, card como div); o protótipo precisa partir do estado atual do app.

## (d) Quebra em partes
Não proponho (1 parte). O critério até permitiria separar "tocar abre o detalhe" (AC-006 a AC-009) de "rótulo de repetição" (AC-001 a AC-005, AC-010 a AC-012), mas as duas são pequenas, mexem no mesmo card e na mesma tela, e cada parte paga reconhecimento, roteiro, plano e dois gates. Na dúvida, não quebre.

## (e) Premissas (agente) mais arriscadas
1. **CB-010, card desatualizado depois de editar**: o card só mostra a repetição nova quando a conversa recarrega (igual ao título hoje). Alternativa mais cara: atualizar o card na hora, ao voltar do detalhe. Isso tira a contradição "Único" no card x "Todo dia" no detalhe, mas exige atualizar o histórico em memória.
2. **AC-003, dias quaisquer**: o Ben pode criar repetição em dias soltos (ex.: seg e qua; o schema do agente aceita qualquer lista). O rótulo lista os dias ("Seg, Qua"), mas o editor do detalhe, que continua como hoje (AC-018), marca esse lembrete como "Dias úteis". No detalhe, rótulo e editor podem discordar. Alternativas: chamar todo conjunto de "Dias úteis" (consistente com o editor, mas falso) ou mexer no editor (fora de escopo).
3. **AC-004/AC-010/AC-011, conditional**: "Quando acontecer" no card; na lista e no detalhe não aparece rótulo extra, porque o selo de tipo já diz isso. Alternativa: mostrar também a frequência de checagem ("diária").
4. **AC-009, "mesmo ponto"**: voltar preserva a rolagem da conversa. A conversa continua montada por baixo do menu, mas não verifiquei a rolagem.
5. **CB-011, voltar do sistema/navegador** com o detalhe aberto leva à conversa, em vez de só fechar o detalhe.
6. **Rótulos en**: "One-time", "Every day", "Weekdays", "Mon, Wed".
7. A memória `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` (recorrente fora do v1) continua desatualizada frente ao código; a atualização fica para o usuário (save-memory).
