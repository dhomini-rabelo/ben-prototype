# Tarefa — r9: commit e push da feature "configurar modelo e effort do agente Ben"

Você é filho de um orquestrador (O2). A implementação e o teste já terminaram e passaram. Sua
tarefa é só git: revisar o diff, montar dois commits organizados e dar push. Você não edita
código.

Working directory: `/root/so/repos/ben-prototype`, branch `feat/config-model-and-effort` (já é a
branch corrente, criada a partir de `feat/update-model-and-add-logs`).

## Leia primeiro
- `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/briefing.md` — contrato da task.
- `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r7-implementacao.md` — o que foi
  implementado, por etapa.
- `git log --oneline -10` e `git show --stat a544d65` — para seguir o padrão de mensagem de commit
  do repo (mensagens em português, `tipo(escopo): descrição`).

## O que fazer

1. **Rode `git status`** e confira que as únicas mudanças no working tree são:
   - Arquivos de `project-backend/src/**` e `project-mobile/src/**` (a feature).
   - `.claude/tmp/orquestracoes/2026-09-19-detalhes-mensagem/log.md` modificado — **não é seu, não
     mexa nele, não comite**. É de uma task anterior não relacionada.
   - Um diretório `.playwright-mcp/` com logs de debug de uma sessão de browser (console/page
     logs) — **não é deliverable**, é lixo temporário da ferramenta de teste. Apague-o com
     `rm -rf .playwright-mcp` antes de commitar; não faz parte do repo.
   - A pasta da run `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/` (não aparece no
     `git status` hoje porque `.claude/tmp/` está no `.gitignore`).

2. **Commit 1 — a feature.** Adicione só os arquivos de `project-backend/` e `project-mobile/`
   modificados/criados pela feature (a lista completa está em `r7-implementacao.md`, seção "Por
   etapa"; confirme com `git status` — são as linhas sob `project-backend/src/` e
   `project-mobile/src/`, tanto modified quanto untracked). Não use `git add -A` nem `git add .`.
   Mensagem em português, no padrão do repo, descrevendo a feature (modelo configurável entre os
   3 modelos + effort por modelo, persistido por usuário no backend, refletido no chat, nas
   mensagens de task e no trace de input/output). Termine a mensagem com:
   ```
   Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
   Claude-Session: https://claude.ai/code/session_013HgDnz5GjgrHB8BFWeK6Pf
   ```

3. **Commit 2 — versionar a pasta da run.** Siga o precedente dos commits `6949afe` e `a544d65`
   deste mesmo repo (rode `git show --stat a544d65` para ver o formato). Adicione a pasta inteira
   `.claude/tmp/orquestracoes/2026-09-19-config-model-effort/` com `git add -f` (necessário porque
   `.claude/tmp/` está no `.gitignore` — é uma exceção pontual, como nas runs anteriores). Mensagem
   `docs: versiona a pasta da run que configura modelo e effort do agente Ben` (ou similar, no
   padrão dos commits citados), explicando que é briefing/planos/revisões/implementação/teste da
   orquestração do(s) commit(s) do passo 2. Mesmas linhas de atribuição do passo 2 ao final.

4. **Push.** `git push -u origin feat/config-model-and-effort` (a branch já existe local; pode não
   existir ainda no remoto). **Não abra PR.**

5. **Confirme** com `git log --oneline -3` e `git status` (deve ficar limpo, exceto o
   `detalhes-mensagem/log.md` que não é seu) que os dois commits foram criados e o push funcionou.

## Escreva sua entrega em
`.claude/tmp/orquestracoes/2026-09-19-config-model-effort/r9-commit.md`:
- Os dois hashes de commit e suas mensagens completas.
- Confirmação do push (saída do comando).
- `git status` final.

## Regras obrigatórias
- Não sub-delegue. Não chame `AskUserQuestion`.
- Nunca use `git add -A`, `git add .`, `git commit --amend`, `git push --force` ou `--no-verify`.
- Não abra Pull Request.
- Escreva o arquivo de entrega antes de retornar.
- Retorno final em até 10 linhas: os 2 hashes, confirmação de push, e se algo ficou fora do
  escopo dos dois commits (por que).
