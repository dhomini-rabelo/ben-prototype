---
name: code-get-coding-designs
description: Use when you need to create/edit a feature that requires writing code in multiple files and you are not sure about the design or architecture of the code to write. This skill will help you get the necessary context about the design structure patterns to keep the code consistent with the existing codebase.
---

- **Page Structure Patterns**:
  - Purpose: Define the page-level file organization and composition pattern for frontend pages, including `page.tsx`, scoped components, hooks, and states.
  - When to Use: Use when creating or refactoring frontend pages to keep folder hierarchy and component boundaries consistent.
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/get-coding-designs/designs/page-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)

- **Backend Domain Structure**:
  - Purpose: Define how the `project-backend` domain layer is organized — where use-cases, shared util functions, and shared validation functions live.
  - When to Use: Use when creating or refactoring domain code in `project-backend` (adding a use-case, or a helper shared across many use-cases).
  - Coding structures: `${PROJECT_ROOT}/.claude/skills/code-get-coding-designs/designs/backend-domain-structure.md` (use the `read/readFile` tool to understand more of this structure if needed)
