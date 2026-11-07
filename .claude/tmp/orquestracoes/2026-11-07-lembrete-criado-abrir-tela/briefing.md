# Briefing — planejar (skill decidir-especificar-e-planejar): tocar no card de lembrete no chat abre o detalhe dele; único/recorrente fica claro

## O pedido
Use a skill decidir-especificar-e-planejar para planejar: Ao clicar em um lembrete na conversa que o agente acabou de criar deve abrir a tela de lembrete com o a lembrete q acabou de ser criado selecionado, também deve ficar mais claro se o alarme é recorrente ou único

## Perguntas e respostas
- Ideia principal (problema: após o Ben criar um lembrete pela conversa, o usuário não consegue conferir/ajustar a partir do chat porque o card não responde ao toque, nem saber se toca uma vez ou repete; não é: mudar como o agente decide recorrência nem criar tipos novos; exemplo: Ana, "remédio às 8"). Confirma?: Confirmo (recomendada)
- O que deve ficar claro, único ou recorrente?: Repetição real (recomendada) — alarme ou goal sem repetição = "Único"; goal que repete mostra o padrão ("Todo dia", "Dias úteis").
- Onde aparece?: Card, lista e detalhe (recomendada) — mesmo vocabulário nos três.
- "Selecionado" significa?: Detalhe aberto (recomendada) — abre a lista de lembretes com o sheet de detalhe daquele lembrete aberto; ao fechar, fica a lista.
- Voltar da lista para quem veio do chat?: Volta ao chat (recomendada)
- O que responde ao toque?: O card inteiro (recomendada) — sem botão novo.
- Gates da skill?: Todos os gates (recomendada) — veredito, spec (com opção de protótipo), roteiro de prova e plano, cada um aprovado pelo usuário.

## Definição de pronto
A pasta da run contém decisao.md, spec.md com `## Gate`, (prototipo.md se o usuário escolher protótipo), projeto.md, reconhecimento.md, roteiro.md aprovado, plano.md aprovado no gate 4.4, e o relatório final entrega a linha que chama `/implementar-e-validar` com esta pasta. Cada gate da skill passa pelo usuário via `bloco: perguntas`.

## Fora do escopo
- Implementar qualquer código (isso é da /implementar-e-validar). Esta task só planeja.
- Mudar como o agente decide a recorrência; criar tipos novos de lembrete.
- Commits de código (nenhum código é editado; a run vive em .claude/tmp, fora do git).

## Autorizações
nenhuma

## Premissas
- Os gates próprios da skill (veredito, spec, protótipo, roteiro, plano) reabrem `bloco: perguntas` por decisão do usuário; não contam no teto de duas rodadas da Etapa 0.
- Vale para qualquer card de lembrete do histórico, não só o mais recente (mesmo `itemId`); lembrete concluído ou inexistente cai nos estados que o detalhe já tem (concluído / "não existe mais").
- O conditional ("Quando acontecer") não repete por horário: o rótulo dele é decidido na spec.
- A memória `business-rules/razao-de-negocio-e-casos-de-uso-v1.md` diz que lembrete recorrente não é v1, mas o código já tem goal com daily/weekdays: vale o código; atualizar a memória fica para o usuário (save-memory).
- Reconhecimento da Etapa 0: r0-mobile.md e r0-backend.md nesta pasta.
