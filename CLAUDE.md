## Rules

### At the start of every task

- Always use the `code-get-project-context` skill to load the project context before doing anything else.

### When performing any task

- **NO GUESSING**: Do not assume workflows, file names, variable names, or business logic if they are not explicitly provided or found via search.
- **Intent Check**: If the user asks to execute Action A, but the context or logic suggests the objective is actually B (or if Action A seems counter-intuitive or confusing), use `AskUserQuestion` to clarify intent. Ask explicitly: "You asked for [A], but that seems unusual in this context. Is your actual goal [B]? Would you prefer I execute [B] instead?"
- Use the `AskUserQuestion` tool whenever ambiguity arises. Do not try to solve ambiguity by yourself. Examples of when to ask:
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

#### After finishing a task

- Run the linting command in the right project. The lint command is always `npm run lint:fix`.

```bash
cd /path/to/project && npm run lint:fix
```

- Run the typescript compiler in the right project. The command is always `tsc --noEmit`.

```bash
cd /path/to/project && npx tsc --noEmit
```
