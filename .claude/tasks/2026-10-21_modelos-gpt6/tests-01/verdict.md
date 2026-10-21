# Verdict tests-01 (modelos-gpt6, modo browser leve)

## Resultado: FAIL (bloqueado, nada do fluxo foi exercitado)

## Evidencia
- localhost:8081 responde 200, mas serve OUTRO app: titulo "Shiplog", tela "Idioma · Language / New project".
- Processo na porta 8081 (pid 1559783): `node /root/so/repos/project-manager/packages/infra/mobile/shiplog/.../expo start --web`, ou seja, o Expo do repositorio project-manager, nao `@ben/mobile-ben`.
- Nenhum listener em 3333 (API do Ben) tambem.
- Viewport 390x844 aplicado; snapshot da pagina confirmou que nao e o Ben.

## Casos NAO executados (motivo: app errado na 8081, sem API do Ben)
1. Configuracoes mostra GPT-6 Luna (padrao) e GPT-6.1 Sol, sem GPT-5.6 Luna.
2. Sol nao oferece effort none.
3. Trocar modelo/effort persiste apos reload.

Nao e culpa da task de modelos nem da edicao paralela de preferencias: o app Ben nem esta no ar.

## Premissa assumida
Nao matei o processo da 8081 (pertence a outro projeto) nem subi o Ben em outra porta, pois a regra do ambiente de teste fixa a 8081.

## Para refazer
Liberar a 8081 (parar o Expo do project-manager), subir `pnpm dev` na raiz do ben-prototype (API 3333 + Expo 8081) e repetir os 3 casos.

FAIL
