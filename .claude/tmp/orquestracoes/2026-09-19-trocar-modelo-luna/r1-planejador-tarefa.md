# Tarefa — planejador (rodada 1)

Você é um filho de uma orquestração no repo `/root/so/repos/ben-prototype`.
Seu papel é **planejar**, não implementar. **Não edite nenhum arquivo do projeto.**
O seu único `Write` é a sua entrega.

## Leia antes de qualquer coisa
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/briefing.md` — o contrato da task.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r0-recon-codigo.md` — onde o modelo vive hoje.
- `/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r0-recon-doc.md` — os fatos do modelo novo.
- O arquivo real que vai mudar, com os próprios olhos:
  `/root/so/repos/ben-prototype/project-backend/src/infra/services/ben-agent-provider/models.ts`

## Skills obrigatórias
- `code-get-project-context` — arquitetura e convenções do repo.
- `code-get-coding-designs` — os padrões de código a respeitar.
Leia os subarquivos que o SKILL.md de cada uma referenciar.

## O que entregar
Um plano de implementação que um agente `sonnet` executa sem precisar decidir nada:
1. **Diff pretendido, arquivo por arquivo**: caminho absoluto, linha, o texto exato antes e o
   texto exato depois. A task é pequena — o plano tem que ser cirúrgico, não uma refatoração.
2. **Verificação de que o id existe no OpenRouter.** O id que vai no código é
   `openai/gpt-5.6-luna`. Confirme o slug exato do modelo no catálogo do OpenRouter (WebFetch em
   `https://openrouter.ai/api/v1/models` e filtre, ou a página do modelo). Se o slug real for
   diferente, o plano usa o slug real e você registra a divergência em destaque.
3. **Compatibilidade**: o `extraBody.provider.require_parameters: true` e o
   `ignore: ['cerebras']` continuam corretos para esse modelo? Recomende manter ou mudar, com
   justificativa de uma linha. O briefing manda manter por padrão; contrarie só com motivo forte.
4. **Varredura**: liste toda ocorrência remanescente de `gpt-oss-120b` no repo (fora de
   `node_modules` e de `.claude/tmp`) que o implementador precisa tocar. Se não houver nenhuma
   além de `models.ts`, diga isso explicitamente.
5. **Como provar**: os comandos exatos de lint e typecheck, e o que o teste de browser deve ver.
6. **Riscos e o que NÃO fazer**: copie do briefing o que está fora do escopo.

## Regras
- Não sub-delegue: não chame a tool `Agent`.
- Não chame `AskUserQuestion`. Toda ambiguidade vira premissa assumida e documentada no seu arquivo.
- Não invente: se um fato não foi confirmado, escreva "não confirmado" em vez de supor.
- Não faça o trabalho crescer. O usuário disse, com estas palavras: "não overdo the task, a task
  é bem simples". Um plano que propõe env var nova, refatoração, teste novo ou log novo está errado.

## Entrega
Escreva o plano em:
`/root/so/repos/ben-prototype/.claude/tmp/orquestracoes/2026-09-19-trocar-modelo-luna/r1-plano.md`
Escreva o arquivo **antes** de retornar. Retorne no máximo 10 linhas: o caminho do arquivo e o
resumo das decisões.

## Teto de janela
Meça o seu consumo conforme avança. Se chegar perto do limite, pare a investigação, escreva no
arquivo o que já apurou e o que ficou em aberto, e retorne. Nunca termine sem ter escrito o arquivo.
