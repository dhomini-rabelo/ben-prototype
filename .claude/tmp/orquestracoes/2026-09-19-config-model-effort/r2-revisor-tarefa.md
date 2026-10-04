# Tarefa — r2, revisor do plano (opus, READ-ONLY)

Você revisa um plano de implementação escrito por outro agente. **Você não é o dono do plano e não tem
nenhum interesse em aprová-lo.** Um plano aprovado com defeito custa uma rodada inteira de implementação
errada; um plano reprovado com motivo concreto custa uma rodada de replanejamento. Reprovar por um
defeito real é o resultado barato. Aprovar por educação é o caro.

## Leia
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — o contrato. Ele manda sobre o plano.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r1-plano.md` — o que você revisa (687 linhas).
- O código real do repo `/root/so/repos/ben-prototype` (branch `feat/config-model-and-effort`), sempre que
  o plano afirmar algo sobre arquivo, assinatura, schema ou comportamento existente. **Não acredite no
  plano sobre o código: confira.** Afirmação do plano que não bate com o arquivo real é achado bloqueante.
- Opcional, se precisar de contexto do estado atual: `r0-mobile-settings.md` e `r0-backend-model.md` na mesma pasta.

## Skills obrigatórias
Carregue `code-get-coding-designs` **e** `code-get-project-context` para `project-backend` e para
`project-mobile` — o plano cruza os dois apps. Leia os subarquivos que os SKILL.md referenciam. Metade da
sua revisão é: **o plano segue os padrões que este repo já documentou?** Divergência de padrão sem
justificativa explícita no plano é achado.

## Fato novo que o plano não tinha
O planejador assumiu que faltava `OPENROUTER_API_KEY` no ambiente. **Está preenchida** em
`/root/so/repos/ben-prototype/project-backend/.env` (junto com `DATABASE_URL` e `PERSISTENCE_DRIVER`).
Logo, chamada real ao modelo é possível, e um plano de teste baseado em "provas substitutas" para os itens
3 e 4 da Definição de Pronto está resolvendo um problema que não existe. Avalie se isso sozinho já obriga
uma correção do `## Plano de teste`.

## O que examinar, em ordem de gravidade
1. **Contrato.** Cada item da Definição de Pronto do briefing tem etapa que o entrega? As quatro respostas
   do usuário (persistência no backend por usuário **e** modelo/effort no input/output da mensagem;
   deepseek fixo em V4.1 Flash; efforts só os suportados por modelo; chat **e** mensagens de task) estão
   honradas? Alguma coisa fora do escopo declarado entrou de contrabando?
2. **Lógica.** Furos de correção: effort inválido ao trocar de modelo, validação no backend, o modelo
   `z-ai/glm-5.3-flash` com `reasoning.mandatory: true`, o descasamento do enum sem `max` no `.d.ts` do
   provider (o plano resolve por `extraBody` — a justificativa se sustenta no código do pacote instalado?),
   concorrência/cache do serviço agora que o modelo deixa de ser module-scope, o que acontece com usuários
   sem preferência salva, e o caminho de erro de cada rota nova.
3. **Padrões de código.** Camadas do backend (domínio × adapters × infra × http), rota por operação,
   use-case, presenter, espelhamento manual de types no mobile, container × apresentacional no mobile,
   nomes kebab-case, onde mora o registro de modelos. Cite o documento de design que o plano contraria.
4. **Executabilidade por um sonnet.** Alguma etapa exige uma decisão que o plano não tomou? Contrato
   ausente, tipo pela metade, "ajuste conforme necessário"? Isso é achado: o implementador não reprojeta.
5. **Plano de teste.** O roteiro do browser-tester prova mesmo os itens 1 a 4 da Definição de Pronto, com
   a chave de API disponível? Dá para executá-lo lendo só o plano?

## Formato da entrega
Escreva em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r2-revisao.md`:

```md
# Revisão do r1-plano.md

## Veredito
APROVADO | REPROVADO
{uma linha de motivo}

## Bloqueantes
1. {o defeito, onde no plano (seção/linha), a evidência no código real (arquivo:linha), e o que precisa mudar}

## Não bloqueantes
- {melhoria que não impede a implementação}

## O que verifiquei e está correto
- {uma linha por ponto conferido contra o código, para o planejador não refazer o que já passou}
```

Regras do veredito: **REPROVADO se existir ao menos um bloqueante.** Bloqueante é o que faz a
implementação sair errada, incompleta, fora do contrato ou fora do padrão do repo. Não invente bloqueante
para parecer rigoroso: item sem evidência vai para "Não bloqueantes". Se aprovar, a seção `## Bloqueantes`
recebe `nenhum` — e você está afirmando que um sonnet implementa esse plano sem adivinhar nada.

## Regras
- Não sub-delegue. Não chame `AskUserQuestion`: ambiguidade vira premissa assumida, documentada no seu arquivo.
- Não edite arquivo do projeto, não rode comando que muda estado, não implemente nada. Rodar `git log`/`git show`
  e ler `node_modules` é permitido.
- Escreva o arquivo **antes** de retornar. Retorno de no máximo 10 linhas: caminho, veredito e os bloqueantes em uma linha cada.
- **Teto de janela**: ~140k de contexto e no máximo 50 turns. Perto do teto, escreva o que tem e retorne.
