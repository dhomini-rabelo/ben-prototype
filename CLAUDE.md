## Rules

### At the start of every new conversation - if the conversation was already started, skip this step

- Always use the `code-get-project-context` skill to load the project context before starting any work.

### When performing any task

- **Check the memory** in [`.claude/memory/`](.claude/memory/README.md) before planning or executing a task. It holds what you cannot deduce from the code: environment requirements, business rules, past decisions and their why, standing rules, user preferences, past failures, and project vocabulary. The root `README.md` indexes the categories and each category indexes its entries. Open only the ones your task touches. To record anything there, use the `save-memory` skill.
- **NO GUESSING — never guess what the user wants.** The user's intent is the one thing you cannot infer. If the request allows more than one reading, stop and ask instead of picking the reading that seems most likely. The same applies to facts about the project: never invent workflows, file names, variable names, or business logic — they must be stated by the user or confirmed by a search.
- **Be certain about the task before starting it.** Never guess what the task is. Before the first edit, you must be able to state, without filling any gap yourself: what is going to change, in which project and files, and what the expected result is. If you cannot state all three — or if you catch yourself thinking "probably", "I assume", or "it must be" — you do not know the task yet: ask with `AskUserQuestion` instead of starting. A wrong assumption discovered after the code is written costs far more than one question asked before it.
- **Intent check.** If the user asks for action A but the context or the logic of the code suggests the real goal is B (or A looks counter-intuitive, contradictory, or out of place), do not silently do either one. Use `AskUserQuestion`: "You asked for [A], but that seems unusual in this context. Is your actual goal [B]? Would you prefer I execute [B] instead?"
- **Ask, do not resolve ambiguity on your own.** Whenever something is unclear, use `AskUserQuestion` before writing any code. Prefer one round of questions that covers everything you need over guessing now and rewriting later. Typical cases:
  - Unclear intent behind the request:
    - User: "Clean up the chat screen."
    - Ask: "Do you mean refactoring the code, removing unused UI, or reducing visual clutter in the layout?"
  - Missing expected outcome details:
    - User: "Implement a new modal to edit the user profiles."
    - Ask: "Where should the modal be triggered from?", "What fields should be included?"
  - Ambiguous scope:
    - User: "Update the button color."
    - Ask: "There are 3 types of buttons (Primary, Secondary, Danger). Which one?"
  - Missing file context:
    - User: "Add validation to the user form."
    - Ask: "I found `LoginForm.tsx` and `RegisterForm.tsx`. Which one are you referring to?"
  - Text formatting:
    - User: "Rename this file to GetUserData.ts."
    - Ask: "The coding convention for file names is kebab-case for this folder. Do you want me to rename it to get-user-data.ts instead?"

### When using skills

- Make sure to read the subfiles referenced in the main SKILLS.md file. They contain important guidance on how to use each skill properly.

### When editing or planning code

- Always use the `code-get-coding-designs` skill
- Always use the `code-write-code` skill

#### After finishing a coding task

- Run the linting command in the right project. The lint command is always `npm run lint:fix`.

```bash
cd /path/to/project && npm run lint:fix
```

- Run the typescript compiler in the right project. The command is always `tsc --noEmit`.

```bash
cd /path/to/project && npx tsc --noEmit
```
