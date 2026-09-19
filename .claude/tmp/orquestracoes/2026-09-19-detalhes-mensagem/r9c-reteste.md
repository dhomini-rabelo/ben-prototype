# r9c — Reteste dos 3 pontos corrigidos (r9b-fix.md)

Ambiente: Expo web já de pé na 8081 + backend na 3333, sessão já logada (token em
`localStorage`). Usei `/messages/list` (com headers `jwtauthenticationtoken`) para confirmar
qual bolha da tela correspondia a cada id, já que o DOM não expõe o id da mensagem.

## 1. Menu de long-press com estilo de superfície — PASSA

Long-press real (mouse down → 900ms → up) na bolha `f1e16a1f` (timestamp "Sep 19, 2026, 8:08 PM"
confirmado no dialog). Computed style do card: `background-color: rgb(255,255,255)`,
`border: 1px solid rgba(196,199,199,0.4)`, `border-radius: 16px`,
`box-shadow: ... 0 8px 32px rgba(0,0,0,0.12)`. Backdrop: `rgba(47,49,49,0.25)` cobrindo os
390×844. Visualmente o card branco com borda/sombra fica legível sobre o fundo escurecido (ver
screenshot). Corrigido.

Screenshot: `screenshots/12-longpress-menu-style.png`

## 2. Sheet: sem nested-button, copy funciona — PASSA (com uma ressalva sobre o console)

**Nested button:** inspecionei o DOM ao vivo (`querySelectorAll('button')` filtrado por
`.querySelector('button')`) com o sheet inteiro aberto (Messages, System prompt, Tools do Step
2 e 3): **21 botões, 0 aninhados** — bate exatamente com o número que o r9b relatou. A ancestralidade
do botão de copiar confirma que o pai é uma `DIV` comum, não outro `button`.

**Ressalva:** `browser_console_messages` com `all: true` ainda retorna uma entrada antiga do
warning `<button> cannot contain a nested <button>` (com stack apontando pro `CollapsibleSection`
"user"/copyValue). Ela não muda de contagem em nenhuma nova interação que fiz (repetido várias
vezes ao longo do teste) e não bate com a estrutura DOM atual — é consistente com ter ficado
presa no buffer de console desde o carregamento inicial (mesmo tipo de ruído de cache que o r9
já registrou: erros 500 de bundle do Metro aparecem no mesmo log). Não vi esse warning aparecer
"since last navigation" em nenhum momento. Não bloqueia o veredito, mas sinalizo para quem for
conferir: se abrir com DevTools nativo (não Playwright) e o warning reaparecer ao vivo, é bug
real; pela evidência de DOM que colhi, não é.

**Feedback "Copied":** clique simples (`.click()`, `mouse.click()`, `mouse.down`+`wait`+`up`)
seguido de checagem imediata/100ms/polling de 1s via `waitForFunction` **não** mostrou mudança de
`aria-label` — parecia reproduzir o "inconclusivo" do r9 original. Investiguei com
`MutationObserver` no `aria-label` do próprio botão clicado (mesmo elementHandle) e follow-up ao
longo de 2s: o atributo muda para `"Copied"` **25ms** após o clique e volta para `"Copy"`
**1527ms** depois — bate com `COPIED_FEEDBACK_MS = 1500` no código. Ou seja, o feedback funciona
corretamente; minhas checagens pontuais anteriores só erraram o timing (a troca acontece e reverte
rápido demais pra um `getAttribute` avulso pegar de forma confiável nesse ambiente). Não é bug.

Screenshots: `screenshots/13-sheet-messages-expanded.png` (sheet aberto, seção Messages expandida
com 3 sub-itens e botão de copiar em cada), `screenshots/16-after-messages-toggle.png` (accordion
Step 2/Messages colapsado, confirma toggle funcionando).

## 3. Mensagem sem trace (estado vazio) — PASSA, nada quebrou

Long-press na bolha `c446432d` (timestamp "Sep 19, 2026, 8:44 PM" confirmado), toquei "Ver
output": sheet abriu mostrando só a mensagem vazia — *"no trace for this one — it was sent
before Ben started recording model calls."* + linha mono com id e timestamp. Sem meta strip, sem
segmented control, sem crash, sem warning novo no console.

Screenshot: `screenshots/18-empty-state.png`

## Bugs novos encontrados

Nenhum. Os 3 pontos do fix se confirmam corrigidos ao vivo no browser. A única coisa fora do
esperado foi o warning de nested-button que ainda aparece no histórico "all" do console — mas a
evidência de DOM ao vivo (0 nested buttons, estrutura sibling confirmada) e a ausência do warning
"since last navigation" apontam para ruído de cache do console, não regressão real.
