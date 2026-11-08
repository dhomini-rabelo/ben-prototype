# Revisão do plano — rodada 1 — logo antiga (balão âmbar nos ícones do app Ben)

## Veredito
parcial (medição deu `status=handoff` no turn 15: janela 88.7k, projeção 153.7k > 140k). Com o que já foi lido, o veredito provisório é **corrigir**: 2 bloqueios, ambos de conserto em uma ou duas linhas.

## Convenções carregadas
- Doc de contexto: `CLAUDE.md` (raiz); `code-get-project-context/mobile/ben/project-structure.md`.
- `code-get-coding-designs/designs/mobile-app-structure.md`.
- `code-write-code`: `SKILL.md` (índice), `coding-patterns/lint.md`, `coding-patterns/general-code-preferences.md`, `coding-patterns/frontend/frontend-code-preferences.md`, `coding-patterns/frontend/component-variant-maps.md`, `coding-patterns/mobile/mobile-icon-colors.md`.
- Código conferido: `eslint.config.mjs`, `packages/infra/mobile/ben/{tsconfig.json,metro.config.js,package.json,app.config.ts}`, `src/layout/utils/colors.ts`, `src/layout/components/icons/ben-logo.tsx`, `node_modules/metro-resolver/src/resolve.js` (0.83.3), `node_modules/expo/tsconfig.base.json`, `node_modules/eslint-config-expo/flat/*`.

## Risco do orquestrador: import `./colors.ts` com extensão dentro de `src/`. Julgado: não bloqueia
- **Metro (web e nativo):** `metro-resolver/src/resolve.js:439-452`. `resolveSourceFile` chama primeiro `resolveSourceFileForAllExts(context, "")`, que tenta o caminho exato (`colors.ts`, depois de `colors.ts.{platform}` e sem `.native` porque `sourceExt === ""`). O arquivo existe, então resolve antes de qualquer sufixo de `sourceExts`. O `metro.config.js` do app só desvia `jotai`/`zustand` e não interfere nisso. O mesmo resolver serve web, android e ios.
- **TypeScript:** `tsconfig.json` liga `allowImportingTsExtensions`; o `expo/tsconfig.base.json` tem `moduleResolution: bundler`, `module: preserve`, `noEmit: true`; o script `typecheck` é `tsc --noEmit`. Aceita.
- **ESLint:** o `eslint-config-expo` só traz settings `import/extensions` e `import/resolver` (typescript, com o `tsconfig` do app); a única regra `import/*` ligada é `import/first`. Nenhuma regra `import/extensions` nem `import/no-unresolved` reprova `./colors.ts`. Precedente que já passa no lint e no typecheck: `app.config.ts:2` importa `./src/core/app-versions.ts`.
- **Node 24 (gerador):** o reconhecimento testou `.mjs` importando `colors.ts` (ok, com aviso de reparse). O caso aninhado (`.mjs` → `ben-logo-geometry.ts` → `./colors.ts`) não foi executado por mim; o mecanismo é o mesmo (detecção de sintaxe ESM por arquivo, extensão explícita exigida e presente).
- Conclusão: o risco 1 de `## Riscos` (plano.md:230) pode baixar de "sem alternativa pronta" para "conferido no resolver"; isso é nota, não bloqueio.

## Bloqueios
### 1. `$TMPDIR` vazio quebra a prova de reprodutibilidade (CB-002): implementabilidade
Onde: plano.md:187-189, seção RT-005 (PR-010), bloco "Reprodutibilidade e offline".
Regra: critério 5 de `formats/plano.md` (checagem executável por quem não leu o código). Neste ambiente `echo $TMPDIR` imprime vazio. `"$TMPDIR/icons-a.txt"` vira `/icons-a.txt`; a gravação em `/` falha e `sha256sum -c` reprova CB-002 sem que o gerador tenha culpa.
Conserto: trocar as duas ocorrências por um caminho que existe e o git ignora, por exemplo `/home/fael/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-11-07-logo-antiga/icons-a.txt` (ou `"${TMPDIR:-/tmp}/icons-a.txt"`).

### 2. Dois afastamentos de skill fora de `## Desvios de padrão`: padrão
Onde: plano.md:53, 59-60 (passo 4) e plano.md:225-227 (`## Desvios de padrão`).
Regra: critério 14 de `formats/plano.md`. O motivo existe no plano (Resumo, plano.md:10 e 19), mas não está na seção que o revisor de código lê.
- `code-write-code/coding-patterns/frontend/component-variant-maps.md` manda declarar o `Record<Variant, …>` e a union exportada junto do componente. O passo 4 move `BenLogoVariant` e `variantPalettes` de `ben-logo.tsx` para `ben-logo-geometry.ts`.
- `code-write-code/coding-patterns/mobile/mobile-icon-colors.md` diz que todo hex de ícone vive em `@/layout/utils/colors` ("never hardcode a hex"). O passo 4 declara `SILHOUETTE_COLORS = { themed: '#000000', notification: '#ffffff' }` no módulo de geometria.

Conserto: acrescentar duas linhas em `## Desvios de padrão`:
- `passo 4 — component-variant-maps.md (map e union junto do componente) — RT-004 exige a paleta no módulo de dados lido pelo script; ben-logo.tsx consulta o map importado.`
- `passo 4 — mobile-icon-colors.md (hex só em colors.ts) — preto e branco da silhueta são exigência do Android (tingimento e barra de status), não tokens do tema; ficam fora do lockstep com tailwind.config.js de propósito.`

A alternativa também serve: mover os dois hexes para `colors.ts` como exports nomeados e importá-los no módulo de geometria. Nesse caso o desvio de `mobile-icon-colors` some, e o comentário de lockstep do `colors.ts` passa a ter uma exceção, como já acontece com `onSurfaceVariantMuted`.

## Notas
- plano.md:62 e plano.md:21: o plano diz que `id-length` e a denylist "valem para `scripts/**`". No `eslint.config.mjs:113-120,184-196`, `local/no-comments`, `id-length` e `id-denylist` só valem para `backendFiles`, que não incluem o mobile. A instrução (sem comentário, sem abreviação) continua certa pela skill `lint.md`; só o motivo citado está errado. O lint não vai pegar desvio no script, então a revisão de código precisa conferir.
- plano.md:63: `@resvg/resvg-js` é CJS com binding nativo. Com `await import(...)`, o `Resvg` nomeado pode não aparecer pelo cjs-module-lexer. Não conferi, porque o pacote não está instalado. Sugestão: `const rasterizer = await import('@resvg/resvg-js'); const { Resvg } = rasterizer.default ?? rasterizer`.
- plano.md:182: `everyVisibleIs(note, 255)` exige RGB exatamente 255 nos pixels de borda com alfa parcial. Se o desmultiplicar do resvg arredondar para 254, a checagem dá FAIL falso. Sugestão: aceitar `>= 250` nos pixels com alfa < 255.
- plano.md:230: com a conferência do resolver acima, o risco do Metro pode ser reescrito como "conferido: Metro resolve o caminho exato antes das extensões (`metro-resolver` 0.83.3, `resolve.js:440`)".
- plano.md:226: o desvio 1 cita `mobile-app-structure.md` como fonte do "importa pelo alias `@/`", mas a regra está em `general-code-preferences.md` ("Use path-alias imports, not deep relative paths"). `./colors.ts` é import de irmão, não caminho relativo profundo, e `brand-mark.tsx:3` já importa `./icons/ben-logo`. O desvio é aceito; só a citação deve mudar.

## Spec em dúvida
nenhum

## Premissas
- O ambiente do tester tem o mesmo `TMPDIR` vazio que o meu shell (mesmo harness). É a base do bloqueio 1.
- Os exemplos `// Wrong way` nas skills não são lidos como regra de comentário em código.
- `BALLOON_BOUNDS = { minX: 3, minY: 3, maxX: 27, maxY: 30 }` conferido à mão contra o `BALLOON_PATH`: o arco superior esquerdo chega a x≈2,97, diferença desprezível. Pelas escalas do passo 6, o adaptativo fica em ~285 px de raio (≤ 338) e o splash em ~328 px de meio-lado (≤ 338). O ponto de amostra (12,6; 16,5) cai no corpo e o (15; 16,5) cai na barra do meio.

## Parcial
O que fiz:
- Li plano, spec, roteiro, reconhecimento, projeto e o contrato `formats/plano.md` (template e os 14 critérios).
- Conferi o risco do Metro, TypeScript e ESLint no código: resolvido, não bloqueia.
- Conferi as regras de lint reais e as skills listadas acima.
- Checagens que passaram:
  - cobertura 5/5 RT, 9/9 PR e 7/7 CB pela spec;
  - S01 a S17 do roteiro aparecem com o texto aprovado (S09 já com PR-009);
  - seções obrigatórias e as linhas `estado`, `ambiente` e `url` presentes;
  - consumidores de `BenLogoVariant` (só `ben-logo.tsx`, por grep);
  - `pngjs` presente na raiz;
  - coerência das escalas com a PR-010.

O que falta, em ordem:
1. Rodar o caso aninhado no Node 24 numa cópia no scratchpad: `.mjs` → `ben-logo-geometry.ts` → `./colors.ts`.
2. Ler `code-get-project-context/mobile/ben/description.md` e `technology-stack.md`, e `frontend/react-components.md`, contra o passo 5 (`ben-logo.tsx`).
3. Conferir o comando da RT-002 (PR-011): com `nodeLinker: hoisted`, o `@resvg` fica só em `node_modules/@resvg` da raiz? Se houver cópia em `packages/infra/mobile/ben/node_modules`, o `mv` não simula a ausência.

O que tentei e falhou: nada falhou. A janela projetou acima do teto antes dos três itens acima.
