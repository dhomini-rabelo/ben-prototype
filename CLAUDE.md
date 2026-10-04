# Intenção e evidências

**Sem adivinhar: nunca adivinhe a intenção do usuário, a tarefa ou a resposta.** Separe cada dúvida em duas.

- O que o repositório responde (nomes de arquivos e variáveis, fluxos existentes, como algo está implementado hoje): resolva buscando e lendo o código, nunca inventando.
- O que só o usuário responde (intenção, resultado esperado, qual de duas leituras válidas é a certa): pergunte.

Toda causa apontada e toda correção proposta devem se apoiar em código lido ou em saída de comando executado. Quando faltar evidência, diga o que falta em vez de preencher a lacuna com uma explicação plausível. Antes da primeira edição, saiba dizer o que muda, onde e qual é o resultado esperado. Se o raciocínio depender de "provavelmente", "presumo" ou "deve ser", a dúvida continua aberta: feche pesquisando ou perguntando.

**Intent check.** Se o usuário pedir a ação A, mas o contexto ou a lógica do código sugerir que o objetivo real seja B (ou A parecer contraintuitiva, contraditória ou fora de contexto), não execute nenhuma das duas em silêncio. Use `AskUserQuestion`: "Você pediu [A], mas isso parece incomum neste contexto. Seu objetivo real é [B]? Prefere que eu execute [B]?"

**Pergunte o que só o usuário sabe; decida o resto.** Pergunta custa. Não pergunte o que uma busca responderia, nem escolhas pequenas e reversíveis em código que o usuário não especificou (nome de variável interna, forma de um helper privado): decida e diga o que decidiu. Pergunte quando as leituras possíveis levam a trabalhos diferentes, quando a mudança toca comportamento de produto ou design visível, ou quando errar significa jogar o trabalho fora.

**Pergunte antes de codar, não depois.** Use `AskUserQuestion` antes da primeira edição e cubra tudo numa única rodada. Exemplos:

- Intenção pouco clara: "Limpe a tela de chat." Pergunte se é refatorar o código, remover UI sem uso ou reduzir ruído visual.
- Resultado esperado incompleto: "Crie um modal para editar o perfil." Pergunte de onde o modal abre e quais campos ele tem.
- Escopo ambíguo: "Mude a cor do botão." Pergunte qual dos tipos (Primary, Secondary, Danger).
- Arquivo ambíguo: "Valide o formulário." Pergunte qual dos formulários encontrados.
- Formato de nome: "Renomeie para GetUserData.ts." Avise que a convenção da pasta é kebab-case e pergunte se prefere `get-user-data.ts`.

# Commits ao fechar ciclo

O usuário não escreve código neste repositório. Materialize o trabalho no git.

Crie um commit a cada ciclo fechado, inclusive no meio da task. Ciclo fechado: um lote que você não pretende reeditar nesta task, por exemplo uma slice de implementação ou um conjunto de testes pronto. Vários commits por task são o esperado.

Commite somente quando não houver mais edição prevista nesses arquivos nesta task. Deixe rascunho e WIP fora do git.

Não espere o usuário olhar o diff e não pergunte se pode commitar: esta seção já é o pedido. Não faça push; publicar o branch é decisão do usuário.

# Leitura de skills

Ao usar uma skill, leia o `SKILL.md` como ponto de entrada e consulte também os subarquivos relevantes antes de planejar ou executar. Explore os índices e as pastas da skill para achar padrões, exemplos e referências aplicáveis à tarefa, mesmo quando não houver link direto no `SKILL.md`. Selecione o conteúdo pelo escopo da tarefa, sem carregar arquivos de assuntos ou plataformas que a tarefa não toca.

# Ben Prototype (este repositório)

Ben é um assistente pessoal por voz ("your busy-day brain: say it, Ben files it"). Este repositório é o workspace v1 de prototipação: desenha, itera e valida as telas e as interações antes do produto real. Monorepo **pnpm** (`pnpm-workspace.yaml`), pacotes com escopo `@ben/<camada>-<nome>`.

| Onde | Pacote | O que é |
| --- | --- | --- |
| `packages/domain/base` | `@ben/domain-base` | Primitivos de domínio compartilhados (entity, repository, errors, types, use-case). |
| `packages/domain/{user,task,chat,topic,transcription}` | `@ben/domain-*` | Módulos de domínio: entidades, repositórios (contratos), use cases e validação. Quem é dono de quê está em `packages/domain/ownerships.md`. |
| `packages/adapters` | `@ben/adapters` | Portos de serviços externos (JWT, auth, agente, transcrição). Sem repositórios. |
| `packages/modules/{utils,env,tests}` | `@ben/modules-*` | Capacidades compartilhadas: helpers, leitura de env e dublês de adapters para testes. |
| `packages/infra/db` | `@ben/infra-db` | Prisma + SQLite, migrations e implementações dos repositórios. |
| `packages/infra/adapters` | `@ben/infra-adapters` | Implementações reais dos portos (Firebase, provedores de IA e transcrição). |
| `packages/infra/server-ben` | `@ben/server-ben` | API HTTP em Express 5 + Zod, que compõe domínio e infra (`API_PORT`, 3333 em desenvolvimento). |
| `packages/infra/mobile/ben` | `@ben/mobile-ben` | App Expo + React Native; é o foco do desenvolvimento (web em `:8081`). |
| `packages/infra/mobile/design` | `@ben/mobile-design` | Sandbox e galeria de design (Vite + React + Tailwind v4, `:3002`): a tela é desenhada aqui antes de ser implementada no mobile. |

O mobile não importa use cases nem pacotes de domínio: fala com o backend só por HTTP. Visão completa e regras de design das telas Ben em [code-get-project-context](.claude/skills/code-get-project-context/SKILL.md).

Orquestração longa mede janela e turns com [medir-janela-e-turns](.claude/skills/medir-janela-e-turns/SKILL.md). Os artefatos temporários dessas orquestrações ficam em `.claude/tmp/`, que o git ignora.

# Desenvolvimento

Ao planejar ou implementar funcionalidades, consulte [code-get-coding-designs](.claude/skills/code-get-coding-designs/SKILL.md) e [code-write-code](.claude/skills/code-write-code/SKILL.md). Cada use case tem teste de comportamento ao lado (Vitest, `application/use-cases/__tests__/`).

## Depois de terminar uma tarefa de código

Rode sempre na **raiz** do repositório (um único workspace, sem `cd` para subprojeto):

```bash
pnpm lint:fix
pnpm typecheck
pnpm test
```

- `pnpm lint:fix` roda `eslint . --fix` em todos os pacotes.
- `pnpm typecheck` roda o `typecheck` de cada pacote que o declara.
- `pnpm test` roda o `test:unit` dos pacotes de domínio. Rode quando a tarefa tocar domínio, adapters ou use cases.

Para um pacote só, use `pnpm --filter @ben/<pacote> <script>`.

# Contexto e memória do projeto

Ao começar uma conversa nova, carregue [code-get-project-context](.claude/skills/code-get-project-context/SKILL.md) para entender o projeto e identificar os apps envolvidos. Leia apenas os documentos e fluxos pertinentes. Se o contexto estiver incompleto, consulte o código da tarefa atual; o preenchimento e a atualização da documentação acontecem somente quando o usuário invocar [task-update-project-context](.claude/skills/task-update-project-context/SKILL.md).

Antes de planejar ou executar uma tarefa, consulte [o índice de memória](.claude/memory/README.md). Abra os índices das categorias pertinentes e somente os registros relacionados ao trabalho atual. Para gravar algo ali, use a skill [save-memory](.claude/skills/save-memory/SKILL.md).

A memória reúne informações duradouras que o código não entrega: requisitos de ambiente, regras de negócio, decisões e seus motivos, regras de trabalho, preferências, lições e vocabulário. Confirme o que possa ter mudado antes de aplicar; memória não substitui as instruções atuais do usuário nem a evidência do repositório.
