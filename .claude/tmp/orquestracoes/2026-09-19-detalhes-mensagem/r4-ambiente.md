# r4 — Ambiente de teste pronto (backend 3333 + Expo web 8081)

Escrito para o `browser-mobile-tester` (ou quem for testar o long-press). Este agente
(r4) só mexeu em ambiente/banco/processos — **nada em `src/` dos dois projetos, nenhuma
dependência nova, nenhum `package.json` alterado.**

## Handoff no meio do trabalho

Bati o teto de janela (`status=handoff`, ver rodapé) logo depois de deixar os dois
processos no ar e confirmados por `curl`. **Não cheguei a abrir um browser de verdade**
para confirmar visualmente a tela de chat — a seção 4 abaixo explica por quê e dá o
comando de um passe para completar essa última verificação.

---

## 1. O que está no ar AGORA

| Processo | Porta | PID (pode já ter mudado) | Log |
|---|---|---|---|
| Backend (`npm run dev`, tsx watch) | 3333 | 1342528/1342529 | `/tmp/claude-1000/-root-so-repos-ben-prototype/4c33de24-7ee5-4b1f-9684-69346aa37a69/scratchpad/backend.log` |
| Mobile (`npx expo start --web --port 8081`) | 8081 | 1342773/1342786 | `/tmp/claude-1000/-root-so-repos-ben-prototype/4c33de24-7ee5-4b1f-9684-69346aa37a69/scratchpad/mobile.log` |

Verificação em um comando cada (rodei isso agora mesmo, ambos passaram):

```bash
curl -s -o /dev/null -w "backend=%{http_code}\n" http://localhost:3333/messages/list
# backend=400 é o esperado SEM headers de auth (zod reclama dos headers ausentes) —
# é prova de que o processo está de pé e respondendo, não de erro.

curl -s -o /dev/null -w "mobile=%{http_code}\n" http://localhost:8081
# mobile=200

curl -s http://localhost:8081 | head -c 200
# deve devolver HTML (<!DOCTYPE html>...); confirmado.
```

## 2. Como subir cada processo de novo, se cair

**Backend:**
```bash
cd /root/so/repos/ben-prototype/project-backend
nohup npm run dev > /tmp/claude-1000/-root-so-repos-ben-prototype/4c33de24-7ee5-4b1f-9684-69346aa37a69/scratchpad/backend.log 2>&1 &
disown
sleep 4 && tail -20 /tmp/claude-1000/-root-so-repos-ben-prototype/4c33de24-7ee5-4b1f-9684-69346aa37a69/scratchpad/backend.log
# espera ver "Server is running on port 3333"
```
Pré-requisito já satisfeito: `project-backend/.env.development` existe e tem
`PERSISTENCE_DRIVER=sqlite` com `prisma/dev.db` já migrado (`npx prisma migrate deploy`
já rodou). Se o arquivo `prisma/dev.db` sumir, rode de novo
`cd /root/so/repos/ben-prototype/project-backend && npx prisma migrate deploy` antes de
subir o server.

**Mobile (Expo web):**
```bash
cd /root/so/repos/ben-prototype/project-mobile
nohup npx expo start --web --port 8081 > /tmp/claude-1000/-root-so-repos-ben-prototype/4c33de24-7ee5-4b1f-9684-69346aa37a69/scratchpad/mobile.log 2>&1 &
disown
sleep 10 && curl -s -o /dev/null -w "%{http_code}\n" http://localhost:8081
# espera 200
```
Se a porta 8081 já estiver ocupada por um processo travado, mate antes:
`pkill -f "expo start --web"` e `pkill -f "tsx watch ./src/infra/http/server.ts"`.

## 3. Arquivos de ambiente criados (não estão no `.gitignore`? verifique antes do
commit da feature — eles não fazem parte dela)

- `/root/so/repos/ben-prototype/project-backend/.env` — criado a partir do
  `.env.example`, valores fictícios abaixo.
- `/root/so/repos/ben-prototype/project-backend/.env.development` — **cópia idêntica
  do `.env` acima.** Descoberta importante: `src/infra/services/env.ts` faz
  `if (NODE_ENV === 'development') config({ path: '.env.development' })`, e o script
  `npm run dev` seta `NODE_ENV=development` no shell *antes* do dotenv rodar — ou seja,
  **o backend em dev NUNCA lê `.env`, só `.env.development`.** Criei os dois para
  cobrir tanto o pedido literal da tarefa quanto o arquivo que o processo de fato usa.
- `/root/so/repos/ben-prototype/project-mobile/.env` — criado a partir do
  `.env.example` do mobile.

### Valores escolhidos e por quê

**Backend:**
- `PERSISTENCE_DRIVER=sqlite` (não `in-memory`): a tarefa pede "o driver que torna o
  teste reproduzível". `in-memory` perde todo o estado (usuário de teste, mensagem do
  bot) a cada restart do processo; `sqlite` persiste em
  `project-backend/prisma/dev.db`, então se o backend cair e subir de novo, o usuário
  logado e as mensagens seedadas continuam lá — o próximo agente não precisa re-semear
  nada só porque o processo reiniciou.
- `JWT_PRIVATE_KEY=b4e91b770a5a95c85dd242356a7d9dbbafd94f5e023108e65f6ad0acfcbc94c7`
  (32 bytes aleatórios via `openssl rand -hex 32`, HS256). Escolhido por mim porque a
  tarefa autorizava e não há segredo real disponível.
- `FIREBASE_PROJECT_ID` / `FIREBASE_CLIENT_EMAIL` / `FIREBASE_PRIVATE_KEY`: valores
  fictícios plausíveis. **Confirmado empiricamente que o boot NÃO quebra com essas
  credenciais falsas**: `firebase-auth-provider.ts` só chama `initializeApp`/`getAuth`
  dentro de `getFirebaseAuth()`, que só é invocada dentro de
  `getUserFromToken()` — e essa função só é chamada quando `VerifyAuthenticationUseCase`
  decide que o JWT está expirado (fallback pro provider) ou na rota de login. Como o
  fluxo de teste usa sempre um JWT válido e não expirado (7 dias), o Firebase nunca é
  tocado. Não precisei achar um "caminho que não depende do Firebase" além deste, que
  já é o caminho natural do próprio middleware de auth (`src/infra/http/middlewares/auth.ts`,
  `src/domain/use-cases/auth/verify-authentication.ts`).
- `GOOGLE_GENERATIVE_AI_API_KEY`, `OPENROUTER_API_KEY`, `ASSEMBLYAI_API_KEY`: valores
  fictícios. Nunca são chamados de verdade porque a mensagem do bot foi semeada direto
  no banco (seção 5), não gerada pelo modelo.

**Mobile:**
- `BACKEND_URL=http://localhost:3333`.
- `FIREBASE_API_KEY`, `FIREBASE_AUTH_DOMAIN`, `FIREBASE_PROJECT_ID`,
  `GOOGLE_WEB_CLIENT_ID`, `GOOGLE_IOS_CLIENT_ID`: fictícios. São `required()` em
  `src/core/env.ts` (o app lança exceção e não renderiza nada sem eles) mas nunca são
  usados de verdade, porque autenticamos sem passar pelo fluxo de Google (seção 4).
- `DEV_ACCESS_TOKEN`: preenchido com o mesmo JWT da seção 5, só por documentação — na
  prática esse atalho **não aparece na UI no Expo web** (ver seção 4, é isso que
  impediu a verificação visual completa).

## 4. Estado exato do app — login e a única coisa que ficou pendente

**Logado como quem:** o usuário seedado pelo script da seção 5, `providerId` fixo
`dev-seed-provider-id`, criado com id real gerado pelo repositório sqlite
(o id concreto sai no output do script toda vez que ele roda pela primeira vez — na
minha execução foi `cc466e01-fff2-4b36-a0ae-59c6fc566292`, mas **não confie nesse
valor**: se você rodar o script nesta seção e o usuário já existir, ele reaproveita o
mesmo id; se o banco for recriado do zero, vai gerar outro. O jeito certo de saber o id
e o token válidos AGORA é rodar o comando da seção 5 de novo — ele é idempotente e
sempre imprime o token certo no final).

**Que tela abre:** `app/index.tsx` faz `if (getCachedToken()) return <Redirect
href={ROUTES.chat} />`, e `getCachedToken()` é hidratado em `useAuthBootstrap` a partir
de `AsyncStorage` (que no build web é só `window.localStorage`, chave exata
`ben.jwttoken`, valor = o JWT puro, sem `JSON.stringify`). Ou seja: **se o
`localStorage` do browser tiver essa chave com um JWT válido antes do app montar, ele
abre direto na tela de chat, sem passar pelo login.**

**Por que eu não fiz essa última verificação sozinho:** minhas tools de Playwright
(`mcp__playwright__browser_navigate` etc.) apontam para um servidor MCP configurado com
o browser `chrome-for-testing`, que **não está instalado** neste ambiente
(`/opt/ms-playwright/chromium-1246/...` não existe). Só existe `chromium-1244`
instalado, que é o que outros processos `playwright-mcp --browser chromium` já rodando
no ambiente usam — ou seja, o browser-tester real provavelmente já está configurado
para usar o `chromium` que existe, e não vai bater nesse mesmo problema. Disparei
`npx @playwright/mcp install-browser chrome-for-testing` em background (pode já ter
terminado, ou não — não fiquei esperando por causa do teto de janela). Não é um segredo
faltando, é só uma diferença de setup de browser entre a minha ferramenta e a do
próximo agente — **não deveria bloquear o teste real**.

**O que o próximo agente faz, em um passo, para chegar exatamente no estado alvo:**

```js
// depois de abrir http://localhost:8081 no browser (mobile-mobile viewport 390x844):
localStorage.setItem('ben.jwttoken', 'COLE_O_TOKEN_DA_SEÇÃO_5_AQUI')
location.reload()
```
Depois do reload, o app deve abrir direto na tela de chat (rota `(protected)`, sem
passar pela tela de login) com a mensagem do bot visível (seção 5).

Se preferir confirmar por API antes de tocar no browser:
```bash
JWT='COLE_O_TOKEN_AQUI'
curl -s http://localhost:3333/messages/list \
  -H "jwtauthenticationtoken: $JWT" -H "providerauthenticationtoken: x"
# eu rodei isso e recebi de volta a mensagem do bot seedada, 200 OK — a API está 100%
# funcional, só a ponta do browser ficou sem confirmação visual.
```

## 5. Mensagens existentes e comando para semear outra mensagem do bot

Script (fica **fora dos dois projetos**, não entra no commit da feature):
`/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts`

```bash
cd /root/so/repos/ben-prototype/project-backend && \
  NODE_ENV=development npx tsx /root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/seed-ambiente.ts
```

Opcional: passe um texto customizado como argumento para a mensagem do bot:
```bash
... seed-ambiente.ts "outra mensagem de teste do bot"
```

O que ele faz (idempotente): reaproveita o usuário de teste se já existir (por
`providerId` fixo `dev-seed-provider-id`); sempre insere **uma mensagem nova do Ben**
(`role: 'ben'`) via `SqliteMessageRepository` de verdade (mesmo formato que o app usa,
sem migração de schema — a tabela é JSON genérico); e imprime no final:
- o `userId` real do usuário de teste;
- um JWT novo (mesmo `JsonWebTokenJwtService` de produção, payload `{ userId }`,
  HS256, assinado com `JWT_PRIVATE_KEY` do `.env.development`) pronto para colar em
  `localStorage["ben.jwttoken"]`.

**Estado atual do banco** (confirmado por `curl` na seção 4): exatamente **uma**
mensagem, `role: "ben"`, texto "oi! sou o Ben, sua segunda memória. semeei essa
mensagem direto no banco porque o ambiente de teste não tem chave de LLM de verdade.".
Sem mensagens de usuário — não precisei de nenhuma para o objetivo da tarefa (uma
mensagem do bot visível), e nenhuma mensagem antiga sem `trace` existe além dessa (o
que aliás é o cenário de "estado vazio" que o r2-plano.md §10.3 item 12 pede para
testar — esta é a mensagem "anterior à feature" que não vai ter trace).

Se quiser mandar uma mensagem de usuário de verdade pela API (sem depender do LLM,
porque a rota `POST /chat` chama o modelo de verdade e não temos chave — isso vai
falhar ou pendurar): **não tente**, é o único fluxo que exige a chave que não temos.
Continue semeando direto no banco.

## 6. O que ficou impossível / segredo que falta

**Nada ficou impossível dentro do escopo desta tarefa.** O único caminho genuinamente
bloqueado é: **gerar uma resposta real do modelo** (`POST /chat` completo,
ponta a ponta, passando pelo `BenAgentProviderService` de verdade) — isso exige uma
`OPENROUTER_API_KEY` (ou `GOOGLE_GENERATIVE_AI_API_KEY`) real, que o usuário não
forneceu e que esta tarefa proíbe pedir. Não é necessário para o teste do long-press:
o r2-plano.md pede uma mensagem do bot com dados de trace para provar a feature nova,
e por enquanto (a feature ainda não foi implementada por este agente) só existe o
formato antigo de mensagem (`role/content/capture/createdAt`, sem `trace`). Quando o
outro agente terminar a implementação e quiser uma mensagem **com trace** para testar
o "Ver input"/"Ver output" de verdade, o caminho mais barato ainda vai ser seedar
direto no banco (agora incluindo o campo `trace` que a feature adicionar a
`MessageProps`) — este script pode servir de base, só precisa de mais uma chave no
objeto passado a `messageRepository.create(...)`.

A única verificação que ficou pendente é visual/browser (seção 4), não bloqueada por
segredo nenhum, só pelo teto de janela batendo antes de eu terminar de instalar o
browser da minha própria ferramenta.

---

Medição do teto de janela na hora do handoff: `janela=128789 teto=140000 pct=91
turns=69 teto_turns=50 taxa=1023 proj=154364 status=handoff`.
