---
name: medir-janela-e-turns
description: Mede janela e turns de um agente pelo seu transcript do Claude Code, com projeção e reservas para handoff. Use ao criar prompts de agentes, propagar limites por uma cadeia de delegação ou decidir como tratar consumo elevado e possível repetição sem progresso.
---

# Medir janela e turns por agente

Cada agente mede seu próprio consumo. Os padrões são 140000 tokens de janela e 50 turns, com reservas de 10000 tokens e 5 turns para registrar estado e devolver o trabalho ao pai. O primeiro limiar atingido inicia a parada; não espere exceder o teto.

A medição é cooperativa, não um limite imposto pelo runtime. O script lê o uso de entrada registrado na última chamada do modelo; não inclui saídas ainda não registradas nem antecipa saltos inesperados. Projeção e taxa de crescimento são estimativas. Planeje operações e retornos para caber na margem disponível.

## Identificar o transcript

Execute a partir da raiz do repositório, usando a mesma identidade única do `description` efetivo do lançamento:

```bash
.claude/skills/medir-janela-e-turns/scripts/medir-janela.sh "run-{id}-agente-{instancia}"
```

O pai deve usar uma identidade única por instância e repeti-la no prompt. Inclua um identificador da execução para não colidir com outras sessões. Um sucessor recebe uma identidade nova.

| Modo | Uso |
| --- | --- |
| `<description-exato>` | Exige um único metadado com descrição exatamente igual. Não usa substring, aproximação nem arquivo mais recente. |
| `--transcript CAMINHO` | Lê o arquivo `.jsonl` cujo vínculo com este agente o chamador já confirmou. Use quando o runtime fornecer um caminho confiável ou a descoberta por metadados não estiver disponível. |
| `--list` | Diagnóstico de descrições e caminhos; não mede nem prova a identidade do chamador. |
| `--main` | Mede a sessão principal identificada por `CLAUDE_CODE_SESSION_ID`, quando necessário ao fluxo que usa esta skill. |
| `--self` | Retorna erro orientando usar identidade exata ou caminho confirmado; recência não identifica um agente concorrente. |

O script usa `CLAUDE_CONFIG_DIR/projects` ou, por padrão, `~/.claude/projects`. Se `CLAUDE_CODE_SESSION_ID` estiver disponível, restringe a descoberta e o caminho explícito àquela sessão, sem buscar outra no fallback. Sem ela, exige descrição exata única em toda a raiz de transcripts. Não invente um ID de sessão para satisfazer o comando.

Confirme `desc` e `fonte` na saída. Com `--transcript`, a responsabilidade de confirmar o caminho continua sendo do chamador. Metadados, estrutura de diretórios ou formato de uso podem variar com o runtime: falha de identificação ou ausência de `usage` válido no último turno é erro, **não** janela zero nem `status=ok`. Faça um diagnóstico curto; se não houver leitura confiável, salve estado e reporte a indisponibilidade ao pai antes de continuar trabalho longo.

## O que é medido

- `janela`: soma de `input_tokens`, `cache_read_input_tokens` e `cache_creation_input_tokens` da última chamada registrada.
- `turns`: chamadas do modelo registradas, deduplicadas por `message.id`, inclusive quando uma amostra histórica não contém `usage`. Inclui respostas sem ferramentas; não é a quantidade de chamadas de ferramenta nem de mensagens do usuário.
- `taxa`: crescimento médio não negativo da janela na metade recente da execução, usando amostras válidas. Não mede produtividade nem o valor do trabalho.
- `proj`: janela atual mais taxa multiplicada pelo horizonte até a próxima medição.
- `proxima`: próximo checkpoint, no máximo no início da reserva de turns. Quando já chegou à reserva, indica o turn atual: é hora de parar.

Dependências: Bash e Python 3. O script não altera o transcript nem grava estado do agente.

## Cadência e decisões

Meça no início, antes de novas frentes ou delegações, antes/depois de entradas grandes e até o turn indicado por `proxima`. O padrão de cinco turns limita o intervalo entre checkpoints; meça mais cedo quando a próxima operação puder consumir a margem. Reserve espaço também para retornos de filhos ativos.

| Status | Ação |
| --- | --- |
| `ok` | Continue dentro do escopo, observando a margem e o próximo checkpoint. |
| `handoff` | Pare novas frentes, salve estado e devolva ao pai para um sucessor fresco. A reserva serve ao fechamento, não a uma nova rodada. |
| `preso` | Salve estado e reporte possível repetição sem progresso. O pai verifica evidências antes de relançar ou declarar bloqueio. |

Com os padrões, a janela inicia handoff em 130000 tokens, ou antes por projeção quando a ocupação já alcança `PISO`. Aos 45 turns, o status é `handoff` ou `preso` conforme a taxa; os cinco restantes são margem de fechamento. Janela tem precedência na classificação. Uma taxa abaixo de `TAXA_MIN` só sinaliza a necessidade de revisão: tarefas produtivas também podem ter contexto estável.

Nenhum agente pode elevar os próprios tetos para terminar uma tarefa. O chamador define limites adequados à capacidade real e à política da sessão e os propaga a filhos e sucessores. Não retome o agente esgotado como se fosse uma instância nova.

## Configuração

Passe variáveis de ambiente em cada medição quando os valores diferirem dos padrões:

| Variável | Padrão | Significado |
| --- | --- | --- |
| `TETO` | 140000 | Teto de tokens de janela. |
| `TETO_TURNS` | 50 | Teto de chamadas do modelo registradas. |
| `RESERVA_TOKENS` | 10000 | Margem de janela reservada ao fechamento. |
| `RESERVA_TURNS` | 5 | Margem de turns reservada ao fechamento. |
| `PASSO` | 5 | Intervalo máximo desejado e horizonte de projeção, reduzido quando a reserva de turns estiver mais próxima. |
| `PISO` | 60 | Percentual do teto a partir do qual a projeção pode antecipar handoff. |
| `TAXA_MIN` | 400 | Limiar indicativo para sinalizar `preso` ao chegar à reserva de turns. |

As reservas precisam ser positivas e menores que os respectivos tetos. O valor de `TETO` não detecta automaticamente a capacidade do modelo.

## Propagar a todos os agentes

Copie [o bloco de medição](blocos/bloco-de-medicao.md) **inline** no prompt de cada agente interno: orquestrador, trabalhador, revisor, descendente ou sucessor, inclusive quando a tarefa parece curta. Preencha identidade, comando com os limites herdados, pai e arquivo de estado.

O próprio bloco exige propagação recursiva nas delegações permitidas pelo runtime. A ausência de capacidade para subdelegar não remove o controle de consumo do agente atual. Esta skill fornece medição e contrato; o fluxo chamador define o escopo, os formatos de entrega e a supervisão.

Antes de handoff, resolva filhos ativos: entregas recolhidas, parada confirmada ou transferência suportada com responsável reconhecido. Não relance uma tarefa que ainda esteja rodando. Preserve a política de commits e as autorizações da sessão; o checkpoint registra também alterações não commitadas e verificações pendentes.
