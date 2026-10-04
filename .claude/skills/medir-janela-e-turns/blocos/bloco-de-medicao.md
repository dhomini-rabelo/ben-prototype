# Bloco para o prompt de cada agente

Copie o bloco abaixo inline no lançamento e preencha os campos. Em `{COMANDO_DE_MEDICAO}`, use o script com seu `description` exato, ou `--transcript` com caminho previamente confirmado, e as variáveis dos limites herdados. Por exemplo, para a política padrão:

```bash
TETO=140000 TETO_TURNS=50 PASSO=5 RESERVA_TOKENS=10000 RESERVA_TURNS=5 .claude/skills/medir-janela-e-turns/scripts/medir-janela.sh "{IDENTIDADE}"
```

Não deixe marcadores no prompt efetivo. Se houver valores específicos de `PISO` ou `TAXA_MIN`, propague-os também.

---

## Seu consumo e sua continuidade

Sua identidade é `{IDENTIDADE}`, a mesma do `description` efetivo do lançamento. Seu pai é `{PAI_E_ID_REAL}`. Seu arquivo de estado é `{CAMINHO_DO_ESTADO}`.

Meça **seu próprio** transcript desde o início, até o próximo turn indicado por `proxima`, antes de novas frentes/delegações e antes/depois de operações volumosas:

```bash
{COMANDO_DE_MEDICAO}
```

Confirme a identidade em `desc` e `fonte`; o arquivo mais recente pode pertencer a outro agente. Erro, ambiguidade ou ausência de uso registrado não significam consumo zero. Faça diagnóstico curto e, sem leitura confiável, salve o estado e informe o pai antes de continuar trabalho longo.

A política recebida é `{TETO}` tokens e `{TETO_TURNS}` turns, com reservas de `{RESERVA_TOKENS}` tokens e `{RESERVA_TURNS}` turns. Não aumente esses valores por conta própria. A medição conta chamadas do modelo registradas, inclusive sem ferramentas e com uso histórico ausente; a janela exige uso válido do último turno. A projeção é estimativa: limite saídas e pare antes de uma operação que ameace a margem, mesmo com o último status `ok`.

- `ok`: prossiga dentro do escopo e remeça até `proxima`, ou antes se necessário.
- `handoff`: pare novas frentes. Salve logo o estado, use a reserva somente para fechamento e solicite ao pai um sucessor fresco com identidade nova.
- `preso`: salve estado, descreva o bloqueio e o progresso real. Taxa baixa é indício, não prova de laço. O pai decide a ação; não relance nem repita tentativas por reflexo.

O estado deve informar escopo, próximos passos, arquivos alterados, evidências e validações pendentes, tentativas falhas, autorizações, commits e alterações não commitadas, medição atual e situação dos filhos.

Antes de retornar, pare novas delegações e peça checkpoints aos filhos ativos. Recolha entregas ou confirme parada/transferência de supervisão conforme as ferramentas disponíveis. Registre ID real, responsável e caminho de estado de cada filho. Se não conseguir resolver um filho dentro da margem, reporte-o explicitamente ao pai; não peça relançamento duplicado nem suponha adoção automática pelo sucessor.

Retorne um resumo curto com `handoff`, `preso` ou conclusão, caminho de estado, sua medição e filhos pendentes. O pai lança o sucessor após resolver a execução anterior. Preserve as instruções e a política de commits da sessão; não declare verificações que ficaram pendentes.

**Propague este contrato recursivamente:** se puder delegar, todo filho ou sucessor que você lançar recebe o bloco completo inline, identidade própria igual ao seu `description` de lançamento, pai, arquivo de estado e os mesmos limites/reservas. Isso vale em qualquer profundidade suportada pelo runtime e para qualquer papel, inclusive tarefas curtas. Não contorne restrições de delegação por outra CLI.
