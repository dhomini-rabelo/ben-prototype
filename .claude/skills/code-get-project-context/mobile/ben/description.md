# App Ben (mobile): descrição

> **Status: foco do desenvolvimento ativo.** É aqui que entram as features e mudanças.

**Pacote:** `@ben/mobile-ben`, em `packages/infra/mobile/ben`.

## Propósito

A implementação mobile do Ben, em React Native (Expo). Combina peças agnósticas de plataforma (cliente de API e contratos, estado com Zustand/Jotai, hooks do React Query, máquina de estados de voz, tokens de design) com apresentação e peças específicas de plataforma (primitivas de UI, navegação, áudio, auth, storage). Consome a API do [backend](../../backend/description.md).

Cobre: login com Google, chat com o agente Ben, o workspace de tarefas e o menu de navegação (tarefas, notas, lembretes, com detalhe e configurações), mais notificações locais para lembretes. A folha de configurações escolhe modelo e esforço do agente, o idioma da interface (inglês `en` ou português `pt-BR`, padrão `en`) e lista as versões do app ("App versions"), cada uma expansível para ler o que mudou. Convenção: a cada release com funcionalidades testáveis, adicione uma entrada no topo de `APP_VERSIONS`, pois ela define a versão do Expo.

## Idioma da interface

Todo texto da interface vive em dicionários tipados `Localized<T>` (um objeto `en` e um `pt-BR` com as mesmas chaves, que podem ser funções, por exemplo para plural e tempo relativo). Componentes leem com `useStrings(dicionario)`; código fora de componente usa `getStrings(dicionario)`. O idioma escolhido fica no `useLanguageStore` (Zustand), é gravado no AsyncStorage (`@ben/language`) e é restaurado no `auth-bootstrap` na abertura do app. Os formatadores `relativeTime` e `absoluteDateTime` recebem o `language` e usam o locale de `LANGUAGE_LOCALES`. Textos vindos do backend ou do agente não são traduzidos.

## Regras visuais

Toda tela do Ben segue as [regras de design](../design/design-rules.md) e o design system em [design.md](../../../../agents-docs/design-advisor/design.md). Telas novas são desenhadas primeiro no [sandbox de design](../design/description.md).

## Mais contexto

- [technology-stack.md](./technology-stack.md)
- [project-structure.md](./project-structure.md)
- Padrões de código: [code-get-coding-designs](../../../code-get-coding-designs/SKILL.md) (API client, page stores, feature state components, services layer, token persistence) e [code-write-code](../../../code-write-code/SKILL.md).
