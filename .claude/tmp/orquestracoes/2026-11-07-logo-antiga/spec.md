# Spec — Trocar a logo antiga (3 círculos) pela logo atual (balão âmbar do header) nos ícones do app Ben

Decisão:   .claude/tmp/orquestracoes/2026-11-07-logo-antiga/decisao.md
Versão:    completa (= menor) — balão âmbar do header, sem texto, em todos os ícones do app Ben, mais os complementos aceitos no gate: notificação em âmbar (1) e fonte única da logo (3)
Para quem: P1 pessoa que usa o Ben no celular e na web; P2 quem desenvolve e gera o app Ben

## Fora de escopo
- Sandbox de design (:3002): logo (3 círculos pretos) e favicon (raio roxo do Vite) ficam como estão.
- Redesenhar a logo, mudar o tema ou as cores das telas.
- Editar a pasta `android/` do app (gerada pelo prebuild e ignorada pelo git).
- Texto "Ben" (wordmark) nos ícones: os ícones levam só o símbolo.
- Complementos recusados no gate: teste automatizado permanente sobre os PNGs (2) e limpeza separada de restos antigos (4, já coberta pela reescrita do gerador e pela AC-008). Nenhum teste de pixels entra no repositório; a verificação dos PNGs é feita na prova, por comando, e não fica versionada.

## [Specs]

### Ao ver o ícone do Ben no celular
AC-001  Espera ver o balão âmbar do header, sem o texto "Ben", sobre o fundo claro das telas do app (`#f6f4f2`), no lugar dos 3 círculos pretos (agente: o tom do fundo).
AC-002  Espera ver o mesmo balão âmbar sobre o mesmo fundo claro no ícone adaptativo do Android, inteiro dentro da área que nenhuma máscara corta (circular, quadrada ou arredondada).
AC-003  Espera que no ícone tematizado do Android o balão apareça como silhueta de uma cor só, com as 3 barras vazadas.

### Ao abrir o app
AC-004  Espera ver o balão âmbar centralizado sobre o mesmo fundo claro na tela de splash, no lugar dos 3 círculos pretos.

### Ao abrir o app no navegador
AC-005  Espera ver o balão âmbar sobre o fundo claro na aba do navegador, no lugar dos 3 círculos pretos.

### Ao receber um lembrete
AC-006  Espera ver na barra de status uma silhueta branca do balão com as 3 barras vazadas, e o ícone em âmbar quando abre a gaveta de notificações, no lugar dos círculos (agente: o âmbar; hoje é preto) (complemento 1).

### Ao subir o app para desenvolver ou gerar o APK
AC-007  (P2) Espera que os ícones continuem sendo regenerados antes de subir o app ou gerar o APK e saiam sempre com o balão, sem nenhum comando voltar a escrever os círculos.

### Ao ler a documentação do app
AC-008  (P2) Espera que o README do app descreva a marca como o balão âmbar do header e explique como regenerar os ícones, sem citar os círculos nem as cores antigas.

### Continua como hoje
AC-009  Espera que o header do chat, o menu lateral, a tela de login e o avatar do Ben nos balões do chat continuem com a logo atual, idênticos aos de hoje.
AC-010  Espera que o sandbox de design (:3002) continue com a logo e o favicon de hoje.
AC-011  Espera que, ao abrir o app, a tela de splash continue centralizada e no mesmo tamanho (180 de largura) de hoje, mudando só a arte e o fundo.

## [Requisitos técnicos]

RT-001 (geral)  Rasterizador de SVG como dependência de desenvolvimento do app (ex.: resvg), usado pelo script de ícones para desenhar exatamente o SVG da logo. Motivo: o script de hoje só sabe desenhar círculos, e escrever um rasterizador próprio de curvas e arcos duplicaria a geometria e erraria o contorno. Custo aceito pelo usuário: o script deixa de ser "sem dependência" e passa a precisar do binário do rasterizador instalado pela instalação do workspace.
RT-002 (AC-007) O script de ícones continua nos comandos de subir o app (web, start, android) e de gerar o APK, e uma falha na geração interrompe o comando em vez de seguir com PNGs antigos. Motivo: o gancho já existe e é ele que desfaz troca manual de arquivo; seguir com falha silenciosa traria os círculos de volta sem aviso.
RT-003 (AC-001, AC-002, AC-004) Fundo claro = `#f6f4f2`, o `background` do tema (`tailwind.config.js`, usado por `bg-background` no login e no chat), em vez do `#f9f9f9` do `app.config.ts`; vale para ícone, fundo do adaptativo, splash e favicon, com um valor só. Motivo: o splash passa direto para uma tela em `#f6f4f2`, e `#f9f9f9` faria um salto de tom visível (agente).
RT-004 (geral)  Fonte única da geometria e das cores: o desenho da marca (viewBox, contorno do balão, dobra, barras, paleta `brand`) vive num módulo de dados sem dependência de React Native, lido tanto pelo componente da logo (que monta os elementos SVG) quanto pelo script (que monta o SVG em texto para o rasterizador). Motivo: duas cópias divergem sem ninguém ver; o README de hoje depende de "manter em lockstep" à mão. O script ler o `.tsx` por texto está descartado por ser frágil (agente) (complemento 3).
RT-005 (AC-001, AC-002, AC-003, AC-006) Formato dos arquivos: mesmos 6 arquivos, nomes e tamanhos de hoje (ícone, adaptive e splash 1024, notificação 96, favicon 64), ícone do app sem transparência, adaptativo e splash com transparência e balão dentro dos 66% centrais, tematizado e notificação em silhueta única (corpo e dobra cheios, barras transparentes) e a notificação em branco. Motivo: a loja do iOS rejeita ícone com transparência, o Android corta fora dos 66% e tinge o tematizado e a notificação, de modo que qualquer pixel colorido vira mancha.

## [Casos de borda]

### Ao gerar os ícones
CB-001  (P2) Espera ser avisado, com o passo que falhou e o jeito de resolver (rodar a instalação do workspace), se o rasterizador não estiver instalado ou a geração falhar, e que o app não suba com os ícones antigos em silêncio (AC-007, RT-001, RT-002)
CB-002  (P2) Espera que gerar duas vezes seguidas deixe os arquivos idênticos, sem diferença no git (AC-007) (agente)
CB-003  (P2) Espera conseguir regenerar sem internet depois que a instalação do workspace foi feita (AC-007, RT-001) (agente)

### Ao ver o ícone em máscaras e tamanhos diferentes
CB-004  Espera que nenhuma das máscaras do launcher do Android corte o balão nem as barras no ícone adaptativo (AC-002, RT-005)
CB-005  Espera reconhecer o balão e distinguir as barras vazadas na barra de status, no tamanho pequeno (24 dp) em que a notificação aparece (AC-006) (agente)
CB-006  Espera reconhecer o balão âmbar na aba do navegador em 16 px, sobre fundo claro (AC-005) (agente)

### Ao abrir o app
CB-007  Espera que o splash não mostre outro tom de fundo na passagem para a primeira tela (AC-004, RT-003)

## [Prova]

PR-001  Foto de antes e depois dos arquivos de ícone gerados (ícone do app, adaptativo composto sobre o fundo, tematizado, splash, notificação e aba), círculos antes e balão depois (AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, CB-004)
PR-002  Foto de antes e depois da aba do navegador com o app aberto no web (AC-005, CB-006)
PR-005  Leitura de código por comando: o componente da logo do header e o gerador de ícones importam o mesmo módulo de geometria e paleta, e nenhum dos dois declara contorno ou cor da marca por conta própria (AC-007, AC-009, RT-004)
PR-006  Foto: header do chat, menu lateral, login e avatar do Ben nos balões iguais aos de antes, e o sandbox de design (:3002) com a logo e o favicon de antes (AC-009, AC-010)
PR-007  Foto: notificação reduzida a 24 px e aba reduzida a 16 px, ao lado do original (CB-005, CB-006)
PR-008  Comando: busca no README do app não acha os círculos nem as cores antigas, e o texto descreve o balão e como regenerar os ícones (AC-008)
PR-009  Teste de ponta a ponta: subir o app no web (que regenera os ícones), conferir que os arquivos saem com o balão e que a aba mostra o balão (geral) (sem captura do aparelho: launcher, splash nativo e notificação só no APK)
PR-010  Comando, sem teste versionado: gerar os ícones duas vezes seguidas sem acesso à rede e conferir que o git não mostra diferença entre as duas; conferir nos 6 PNGs as dimensões, o ícone do app opaco, o fundo `#f6f4f2`, o âmbar `#f9a12f` no centro do balão, o balão dentro dos 66% centrais no adaptativo e no splash, tematizado e notificação só com transparência e barras vazadas, notificação branca; e no `app.config.ts` o splash com 180 de largura, o fundo `#f6f4f2` e a cor da notificação em âmbar (AC-001, AC-002, AC-003, AC-004, AC-005, AC-006, AC-011, CB-002, CB-003, CB-004, CB-007) (sem captura do aparelho: launcher, adaptativo, tematizado, splash nativo e notificação só provados pelo arquivo)
PR-011  Comando: com o rasterizador indisponível, o comando de subir o app para antes de subir e mostra o passo que falhou e como resolver (AC-007, CB-001)

## Gate
Aprovada:   2026-11-07
Protótipo:  não — design óbvio: arte (balão do header, sem texto) e fundo claro já decididos, sem tela nova nem decisão de disposição
Partes:     1
