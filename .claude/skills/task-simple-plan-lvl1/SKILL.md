---
name: task-simple-plan-lvl1
description: Create a simple high-level plan in English with topic-level steps and subtasks. No file-specific code changes — scope stays at feature/behavior level.
disable-model-invocation: true
---

# Simple Plan Level 1

## Overview

Use this skill to produce a concise, high-level implementation plan in English. The plan describes **what** needs to happen at each step, not **how** it maps to specific files or code changes.

## When to use

- Before starting a new feature or task that spans multiple concerns.
- When the user needs a shared understanding of scope before diving into code.
- When the plan should be readable by non-technical stakeholders.

## Output format

Write a numbered list of steps. Each step has:

1. A short **topic title** (one line, imperative verb).
2. A bullet list of **subtasks** scoped to behaviors, data, or user-facing concerns — never to file names or code symbols.

## Rules

- Write in **English**.
- Keep the plan short: 3–7 top-level steps.
- Subtasks should describe outcomes or behaviors, not implementation details.
- Do **not** mention specific files, functions, classes, or code constructs.
- Do **not** include a "Summary" or "Conclusion" section.

## Example

**Task:** Add a user notification system.

---

**Plan**

1. **Define notification types**
   - Identify the categories of events that trigger notifications
   - Clarify which are real-time vs. digest-style

2. **Design the data model**
   - Determine what data each notification must carry
   - Decide on read/unread state management

3. **Build the delivery mechanism**
   - Establish how notifications reach the user (in-app, email, push)
   - Define retry and failure behavior

4. **Create the user-facing inbox**
   - Show a list of notifications ordered by recency
   - Allow marking notifications as read

5. **Add notification triggers**
   - Connect the relevant user actions to notification creation
   - Ensure triggers respect user preferences

---
