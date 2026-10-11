# Orquestration — app-versions-in-settings

Date: 2026-10-11
Skill: simple-loop

## Extrato da task

- Decisões vinculantes: constante única `APP_VERSIONS` em `ben/src/core/app-versions.ts` (1ª entrada = versão atual; `app.config.ts` lê dela); semver + data; histórico 1.1.0 (esta feature) e 1.0.0 (protótipo), textos em inglês; seção inline "App versions" entre "Ben's model" e "Sign out", cabeçalho com versão atual, item = número + título, descrição alterna com toque, só a mais recente aberta; só mobile (design/ fora do escopo); seção estática, independe do backend.
- Critérios de aceitação: APP_VERSIONS = [1.1.0, 1.0.0], CURRENT_APP_VERSION '1.1.0'; `npx expo config` mostra 1.1.0; posição da seção correta com v1.1.0 no cabeçalho; 1.1.0 aberta / 1.0.0 fechada, toque alterna; lint + typecheck ok; prints como prova.
- Arquivos no escopo: ben/src/core/app-versions.ts (novo), app-version-item.tsx (novo), app-versions-section.tsx (novo), layout/components/menu-settings/settings-sheet.tsx, settings-view.tsx, app.config.ts.
- Estado de git: branch feat/add-version-in-settings | commit-base d2dbfe8
- Armadilhas: mobile web sem `.env` (env.ts lança) → `ben/.env` fictício, NÃO commitar; dev-login só no Expo Go → injetar `@ben/jwttoken` e `@ben/user` no localStorage; não há testes automatizados no mobile.
- Cenário/preset de teste: browser-mobile-tester, :8081, 390x844; prints em tests-NN/screenshots/.

## 2026-10-11 — bootstrap

- Task folder created; branch feat/add-version-in-settings | commit-base d2dbfe8.

## 2026-10-11 — recon (recon-app-versions-in-settings)

- Pointer: `recon.md` | Veredito: complexa (decisões de produto abertas, >6 arquivos) | Partição: não
- Next: plan in opus

## 2026-10-11 — planner (plan-app-versions-in-settings)

- Question batch: 4 tópicos; usuário escolheu todas as recomendadas (constante única | semver+data curto | seção inline | só mobile)
- Pointers: `plan.md`, `prompts/mobile-app-versions.md` ×1
- Next: implement
