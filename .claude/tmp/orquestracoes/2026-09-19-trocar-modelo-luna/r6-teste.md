# Teste (rodada 6) — troca do modelo Ben para `openai/gpt-5.6-luna`

RESULTADO: bloqueado

## O que foi verificado

1. **`models.ts:15` — verificado.** Li o arquivo
   `project-backend/src/infra/services/ben-agent-provider/models.ts`. A linha 15 é:
   `export const openRouterModel = openrouter('openai/gpt-5.6-luna', {` — confirma a mudança
   descrita em `r5-implementacao.md`.

2. **Backend (`npm run dev`) — bloqueado, exatamente como o alerta previa.** Rodei
   `cd project-backend && npm run dev`. Não existe `.env`, só `.env.example`. O processo
   caiu no bootstrap do Zod (`src/infra/services/env.ts:31`), antes de qualquer código do
   agente Ben rodar. Erro literal:
   ```
   Errors:  {
     "_errors": [],
     "API_PORT": { "_errors": ["Invalid input: expected number, received NaN"] },
     "FIREBASE_PROJECT_ID": { "_errors": ["Invalid input: expected string, received undefined"] },
     "FIREBASE_CLIENT_EMAIL": { "_errors": ["Invalid input: expected string, received undefined"] },
     "FIREBASE_PRIVATE_KEY": { "_errors": ["Invalid input: expected string, received undefined"] },
     "JWT_PRIVATE_KEY": { "_errors": ["Invalid input: expected string, received undefined"] },
     "JWT_EXPIRATION_TIME_IN_SECONDS": { "_errors": ["Invalid input: expected number, received NaN"] },
     "GOOGLE_GENERATIVE_AI_API_KEY": { "_errors": ["Invalid input: expected string, received undefined"] },
     "OPENROUTER_API_KEY": { "_errors": ["Invalid input: expected string, received undefined"] },
     "ASSEMBLYAI_API_KEY": { "_errors": ["Invalid input: expected string, received undefined"] }
   }
   Error: Invalid environment variables!
       at <anonymous> (/root/so/repos/ben-prototype/project-backend/src/infra/services/env.ts:31:9)
   ```
   Isso é falha de validação de env (faltam todas as variáveis, não só `OPENROUTER_API_KEY`,
   porque não há `.env` nenhum), **não** um erro introduzido pela troca de modelo. Não criei
   `.env`, não inventei chave, não mockei o provider — segui a instrução. Backend nunca chegou a
   escutar em nenhuma porta (`ss` confirmou porta 3333 livre depois).

3. **App em `localhost:8081` — não verificado visualmente (bloqueio adicional, de infra local, não
   do código).** Subi `npx expo start --web --port 8081` em `project-mobile`; o Metro respondeu
   `HTTP 200` em `curl http://localhost:8081` (confirma que o servidor Expo web sobe e serve algo).
   Tentei então `browser_navigate` via Playwright MCP para tirar screenshot da tela, e recebi:
   ```
   Error: Browser "chrome-for-testing" is not installed; expected executable at
   /opt/ms-playwright/chromium-1246/chrome-linux64/chrome. Run
   `npx @playwright/mcp install-browser chrome-for-testing` to install
   ```
   Tentei uma vez instalar (`npx @playwright/mcp install-browser chrome-for-testing`), o comando
   ficou parado sem output até o timeout de 90s (provável falta de acesso de rede no sandbox para
   baixar o binário) e não instalou. Repeti `browser_navigate` uma segunda vez para confirmar —
   mesmo erro. Não insisti mais, conforme a regra de uma tentativa limpa por passo. Não há
   screenshot: nenhuma tela chegou a ser vista, então não posso reportar como verificado o
   carregamento visual do app.

4. **Chat de ponta a ponta (enviar mensagem, resposta do Ben, `POST /chat`) — não testado.**
   Depende do backend de pé (bloqueado no passo 2) e da interação visual no browser (bloqueada no
   passo 3). Nenhuma mensagem foi enviada, nenhuma resposta foi observada.

## Onde a prova para

- Prova-se estaticamente que a mudança de modelo está aplicada corretamente (linha 15).
- Prova-se que o backend, do jeito que o ambiente está agora (sem `.env`, sem
  `OPENROUTER_API_KEY`), não consegue nem inicializar — e a causa é validação de env, não a
  mudança de modelo em si.
- Prova-se que o Metro/Expo web sobe e responde em `localhost:8081` via HTTP.
- Não se prova, nesta rodada, que a tela de chat renderiza, que uma mensagem pode ser enviada, ou
  que o Ben responde com o novo modelo — porque (a) o backend não tem credenciais para subir, e
  (b) o navegador do Playwright MCP não está instalado neste ambiente e a instalação falhou por
  timeout/rede.

## Premissas assumidas (task não previa este segundo bloqueio)

- A tarefa só antecipava o bloqueio de `OPENROUTER_API_KEY`. O bloqueio do navegador Playwright não
  instalado é um problema de infra separado, descoberto nesta rodada. Assumi que o espírito da
  regra "não gaste a rodada tentando furar o bloqueio" também se aplica aqui: fiz uma tentativa de
  instalação (não é workaround nem mock, é setup legítimo de ferramenta), ela falhou por timeout, e
  segui para reportar em vez de insistir.

## Estado do ambiente ao final

- Backend: nunca chegou a subir (crash imediato); nada para derrubar.
- Expo web (`npx expo start --web --port 8081`, PID 1339998): **derrubado** com `pkill -f "expo start"`.
  Confirmado depois: `ss -tlnp` não mostra nada nas portas 3333 ou 8081; `pgrep -fl
  "expo|metro|tsx watch"` não retorna processo nenhum.
- Nenhum processo ficou de pé.

## Screenshots

Nenhum. Não foi possível tirar screenshot porque o navegador do Playwright MCP não está instalado
neste ambiente (ver item 3).
