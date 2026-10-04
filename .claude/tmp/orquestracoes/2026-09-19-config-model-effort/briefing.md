# Briefing — escolher o modelo do agente Ben (3 opções) e o effort, na aba de configurações do app

## O pedido
Verbatim do usuário:

> abra uma branch apartir dessa branch atual, depois preciso que faça uma task seguindo o padrão de loop 'faça um loop agente opus planeja -> pedi p outro agente opus revisar logica e padrao de codigos, sem ser tendecioso a aprovar (se recusar, volta ao planejador) -> depois outro agente sonnet implementa -> depois um sonnet browser tester testa- (sempre fazendo os handoffs de todos os agentes respitando o limte de 140k de janela e 50 turns) - no final commit e push ' . A task: na aba de configurações adicione a opção de configurar o model como deepseek flash mais recente, glm 5.3 flash ou gpt luna 5.6 como atualmente e tambem a possibilidade de controlar o effort dependendo do effort disponivel para cada modelo

## Perguntas e respostas
- Onde a escolha de modelo/effort deve ficar guardada?: "no backend, por usuário e na mensagem na estrutura de input e output"
  (leitura: preferência persistida por usuário no backend **e** o modelo/effort usados aparecem no trace de input/output da mensagem — a feature do commit `1ea2d11`, rota `GET /messages/:id/trace`)
- Qual slug usar para o 'deepseek flash mais recente'?: "Fixo no V4.1 Flash"
- Como expor os níveis de effort?: "Só o que cada modelo suporta (recomendada)"
- A configuração vale também para mensagens de task?: "Chat e mensagens de task (recomendada)"

## Dados já resolvidos (não pesquisar de novo)
Catálogo OpenRouter salvo em `openrouter-models.json` nesta pasta. Os três modelos-alvo e seus efforts
(campo `reasoning.supported_efforts` / `reasoning.default_effort` da API do OpenRouter):

- `openai/gpt-5.6-luna` — atual. efforts: none, low, medium, high, xhigh, max. default: medium. reasoning não obrigatório.
- `deepseek/deepseek-v4.1-flash` — efforts: low, high, max. default: high. reasoning não obrigatório.
- `z-ai/glm-5.3-flash` — efforts: low, high, max. default: max. **reasoning obrigatório** (`mandatory: true`), então não existe "desligar".

Atenção: o `.d.ts` de `@openrouter/ai-sdk-provider` v2.9 tipa `reasoning.effort` como
`'xhigh'|'high'|'medium'|'low'|'minimal'|'none'` — **sem `max`**. A API aceita `max`. Quem implementar
precisa resolver esse descasamento (ex.: `extraBody`/`reasoning_effort`) em vez de silenciosamente
remover o nível `max` da lista.

## Reconhecimento já feito
- `r0-mobile-settings.md` — Settings é um bottom-sheet (`src/layout/components/menu-settings/`), não uma rota; hoje só perfil + sign-out. Não existe nenhuma preferência de usuário no app.
- `r0-backend-model.md` — modelo hardcoded em `src/infra/services/ben-agent-provider/models.ts`, instanciado module-scope em `routes/chat.ts` e `routes/tasks/create-task-message.ts`; nenhum effort é passado hoje; types backend↔mobile são espelhados à mão.

## Definição de pronto
Provado de fora, com o app rodando na porta 8081 e o backend de pé:

1. No bottom-sheet de Settings do app dá para escolher um dos 3 modelos e, separadamente, o effort — e a lista de efforts muda conforme o modelo selecionado.
2. A escolha é persistida no backend por usuário: fechar e reabrir o app (ou outro device do mesmo usuário) mostra a escolha salva.
3. Uma mensagem nova no chat **e** uma mensagem nova dentro de uma task usam o modelo e o effort escolhidos.
4. O trace de input/output da mensagem (`GET /messages/:id/trace`, sheet de inspeção no app) mostra o modelo e o effort usados naquela chamada.
5. `npm run lint:fix` e `npx tsc --noEmit` limpos em `project-backend` e em `project-mobile`.
6. Commit e push na branch `feat/config-model-and-effort`.

## Fora do escopo
- Qualquer modelo além dos 3 listados; catálogo dinâmico vindo da API do OpenRouter.
- Transcrição (AssemblyAI) e qualquer outro serviço de IA.
- Remover o `geminiModel` morto de `models.ts` ("consertar de passagem" é proibido).
- Infraestrutura de i18n; os textos novos seguem o inglês do resto do sheet.
- Controle de temperature/topP ou qualquer outro parâmetro de sampling.

## Autorizações
- Criar branch (já feita: `feat/config-model-and-effort`, a partir de `feat/update-model-and-add-logs`).
- Commit e push nessa branch ao final, autorizados explicitamente pelo usuário. Nada de PR.

## Premissas
- Os controles entram no bottom-sheet de Settings existente, não em tela nova.
- Textos da UI em inglês, sentence-case, como o resto do sheet.
- Sem preferência salva, o default é o comportamento de hoje: `openai/gpt-5.6-luna` com o effort default do modelo (`medium`).
- Ao trocar de modelo, se o effort atual não existir no novo modelo, cai no `default_effort` do novo modelo.
- "Effort disponível para cada modelo" é uma tabela estática no código (backend como fonte da verdade), não uma consulta à API do OpenRouter em runtime.
- O backend valida o par (modelo, effort) e rejeita combinação inválida; o mobile não é a única barreira.
