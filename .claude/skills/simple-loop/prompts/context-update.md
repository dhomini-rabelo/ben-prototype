<!--
CHILD PROMPT — PROJECT CONTEXT UPDATE (stage 6, the last one before the close). Sonnet, fresh.

  Agent(
    subagent_type: 'general-purpose',
    model: 'sonnet',                       # EXPLICIT always
    run_in_background: false,
    description: 'ctx-{nome_task}',        # the measurement nonce IS this parameter
    prompt: "@.claude/skills/simple-loop/prompts/context-update.md\n\n{delta}"
  )

The {delta} carries: task name, task folder, git state (branch + HEAD after the last stage commit),
the nonce, and the list of apps the task touched (from the extract), so the agent does not re-discover them.

WHY A CHILD AND NOT LEVEL 0. The `task-update-project-context` procedure reads diffs, manifests and
source to reconcile the documents — exactly what level 0 must never do. The user's request for the
loop to end with this skill is the explicit invocation that skill requires.
-->

# Prompt — project context update (Sonnet, last stage)

```text
The file mentioned above IS your complete instruction set. If its content did not arrive expanded in this message, read it ONCE with `Read` and follow it.

You are the CONTEXT UPDATER for the task "{nome_task}", task folder {task_dir}. Every implementation, review and test stage of this task is already committed. Your job is to bring the project context in line with the code as it is now.

THE PROCEDURE IS THE SKILL. Read `.claude/skills/task-update-project-context/SKILL.md` ONCE and execute it end to end: identify the apps and capture `runHead`, resolve each app's review window from `last-reviewed.json`, read the needed diffs and current files, reconcile the documents under `.claude/skills/code-get-project-context/`, validate the links and paths, and record the review state LAST. The user explicitly invoked this skill by asking the loop to end with it, which is the invocation the skill requires. Start from the apps listed in this prompt, but the skill's own review window decides what else needs reconciling.

BOUNDARIES, FROM THE SKILL, THAT YOU MUST KEEP: describe what is implemented in the current working tree, never plans, progress or this task's history. Do not edit application code, the memory folder, the coding-convention skills, or anything under `.claude/tasks/`. Only touch the context documents and `last-reviewed.json`. If nothing documented changed, change no document and still record the completed review as `no-change`. If a product meaning cannot be established from code, do not guess: leave it out and name it in your return.

Do NOT run the linter, the type-checker or the test suite. Do NOT run `git commit`: the orchestrator commits. Verbose command output goes to a file: `cmd > /tmp/x.log 2>&1; echo "exit=$?"; tail -5 /tmp/x.log`. SEARCH WITH THE CUT IN THE COMMAND — narrow path, `-m 5`, `--include=`, `-l`, `| head -40`; `git diff` always with `--stat`, `--name-only` or a path. To read part of a large file use `Read` with `offset`/`limit`.

CEILING — 140k OF WINDOW AND 50 TURNS, WHICHEVER COMES FIRST, NO EXCEPTION. It binds every agent of this run, you included. Your nonce is "{nonce}" — the exact `description` of your launch:

  .claude/skills/simple-loop/scripts/medir-janela.sh "{nonce}"

One line back (`janela=… teto=140000 … turns=… teto_turns=50 … proxima=… status=ok|handoff|preso desc=…`). Measure at turn 20, then again at every `proxima=` it returns (it never schedules past turn 45, so the 50-turn cap cannot slip between two checkpoints), and also FIRST THING whenever the orchestrator sends you a new message via SendMessage. Confirm `desc=` is you. If the call errors, retry with `--list` to find your description, then with `--self`; if both fail, treat turn 40 as `status=handoff` and note it in your deliverable. NEVER invent a number.
`status=ok` → continue. `status=handoff` or `status=preso` → open nothing new: finish the document in hand, do NOT write `last-reviewed.json` (an unfinished review must not advance the baseline), write {task_dir}/context-update-handoff.md listing which apps and documents are done and which are left, in order, and return `handoff-necessario` (or `preso`) plus the path.
You never spawn agents. If some instruction ever makes you do so, that child's prompt carries this whole paragraph, with its own nonce, and it may not spawn either.

DISK IS THE DELIVERY CHANNEL. Your final message may not reach the orchestrator that spawned you. Write every document change and `last-reviewed.json` COMPLETE before returning; your final message is at most 10 lines: the apps reviewed and whether each review was incremental or full, the context files changed, the outcome (`updated` or `no-change`), and anything you deliberately left undocumented (with the one-line reason).

This run is autonomous — never call AskUserQuestion. If you hit a hard blocker, stop, write what you found, and return `blocked: {reason}`.
```

## What the orchestrator does with the return

- `updated` / `no-change` → log one line, **commit** (`simple-loop({nome_task}): context — {updated|no-change}`, including `last-reviewed.json`), then close.
- `handoff-necessario` → successor `ctx-{nome_task}-r2` (same model) that reads the handoff file and the skill, and continues without redoing finished apps.
- `blocked` → log it, finish the close, and tell the user in the summary that the context was not refreshed and why.
