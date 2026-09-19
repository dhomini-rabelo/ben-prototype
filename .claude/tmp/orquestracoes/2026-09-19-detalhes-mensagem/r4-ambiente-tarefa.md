# Tarefa — deixar o app rodando na porta 8081 para o teste de browser

Você prepara o **ambiente de teste**, não a feature. Outro agente está implementando a feature nos
mesmos repositórios ao mesmo tempo: **não edite nada dentro de `src/` de nenhum dos dois projetos.**
Você mexe em arquivos de ambiente, banco local e processos.

## O problema

O repositório não tem `.env` em lugar nenhum, não tem banco, e nada escuta na porta 8081. Sem o app
no ar, o teste de browser não acontece e a task não fecha. O usuário não forneceu chaves de API, e
você **não vai pedir nenhuma**.

## O alvo

`http://localhost:8081` servindo o `project-mobile` em Expo web, com o backend em
`http://localhost:3333`, autenticado, na tela de chat, com **pelo menos uma mensagem do bot
visível**. Esse é o estado em que outro agente vai entrar para testar o long-press.

## Como chegar lá

1. **Leia primeiro** `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/briefing.md`
   e a seção de prova (§5) de `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r2-plano.md`.
2. **Backend.** Crie `/root/so/repos/ben-prototype/project-backend/.env` a partir do `.env.example`.
   Chaves reais não existem: preencha as de terceiros com valores fictícios plausíveis e **escolha
   você mesmo** o `JWT_PRIVATE_KEY`. Leia a validação de env (Zod, em `src/infra/services/`) e o
   provider de auth do Firebase antes de chutar o formato: descubra se o boot quebra com credencial
   falsa e, se quebrar, ache o caminho que não depende do Firebase.
   Escolha o `PERSISTENCE_DRIVER` que torna o teste reproduzível e diga qual escolheu e por quê.
3. **Mobile.** Crie `/root/so/repos/ben-prototype/project-mobile/.env`. O `.env.example` documenta um
   atalho: `DEV_ACCESS_TOKEN`, um JWT emitido pelo backend que pula o login do Google. Emita esse
   token você mesmo, com o `JWT_PRIVATE_KEY` que você escolheu e o mesmo formato de payload que o
   backend emite no login (leia o use case de auth e o serviço de JWT para copiar o payload exato,
   inclusive o id do usuário). Garanta que o usuário desse token **existe** no banco do backend.
4. **Suba os dois.** Backend com `npm run dev`, mobile com Expo web na porta 8081. Ambos em
   background, e cada um continua de pé quando você terminar — o próximo agente depende disso.
   Confirme com uma requisição de verdade, não com "deve estar rodando": um `curl` numa rota do
   backend e um `curl -s http://localhost:8081 | head` que volte HTML.
5. **Uma mensagem do bot na tela.** Sem chave de LLM não há resposta real do modelo. Descubra o
   caminho mais barato de ter uma mensagem de bot persistida e visível no chat — semear direto no
   banco é aceitável e provavelmente é a resposta. Qualquer script que você escrever para isso vive
   em `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/`, **nunca
   dentro dos projetos**, porque nada disso pode entrar no commit da feature.

## Regras

- Não sub-delegue: não use a tool `Agent`.
- Não chame `AskUserQuestion`: toda ambiguidade vira premissa assumida, documentada no seu arquivo.
- Não toque em `src/` dos projetos, não instale dependência nova, não altere `package.json`.
- Não escreva chave real de ninguém, e não chame serviço externo de verdade.
- Se algo for genuinamente impossível sem um segredo do usuário, **pare nesse ponto**, deixe tudo o
  que deu para deixar de pé, e nomeie no seu arquivo exatamente qual segredo falta e para quê.

## Entrega

Escreva em: `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/r4-ambiente.md`

Precisa conter, para o próximo agente conseguir testar sem te perguntar nada:
- Como subir cada processo de novo, o comando exato, se ele cair.
- O que está no ar agora e como verificar em um comando.
- O estado exato do app: logado como quem, que tela abre, que mensagens existem.
- O comando para semear outra mensagem de bot, se precisar.
- O que ficou impossível, e o segredo que falta.

## Teto de janela

Rode `bash /root/so/repos/ben-prototype/.claude/skills/sem-nivel-0/scripts/medir-janela.sh "r4-ambiente"` a cada ~15 turns.
Se vier `status=handoff` ou `status=preso`, pare, escreva o arquivo com o estado real e retorne.

## Retorno

No máximo 10 linhas: o caminho do arquivo, se a 8081 está no ar, e o que falta.
