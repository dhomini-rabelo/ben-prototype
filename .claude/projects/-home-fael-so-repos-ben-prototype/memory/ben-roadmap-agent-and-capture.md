---
name: ben-roadmap-agent-and-capture
description: Ben prototype roadmap — agent topic-memory/structured-output done; Capture Card is next; DB migration decided
metadata:
  type: project
---

Roadmap decided with the user on 2026-06-01 for the Ben prototype (project-web + project-backend):

1. **Agent upgrade — DONE** (task `.claude/current-tasks/agent-topic-memory-and-structured-output/`). The Gemini agent now: receives a topic index (`kind:category:slug`) as system-prompt suggestions; exposes ONE tool `get-history-context` used at most once per turn; returns structured output `{ message, newReminders, newNotes, newTasks, historyTopics[] }`; streams `message` as text + emits captures/topics as additive UI data parts (non-breaking for web). Topic memory persisted via `Topic`/`TopicSummary` entities (in-memory).
2. **Capture Card — NEXT feature.** Persisting `newReminders/newNotes/newTasks` into real `Note`/`Reminder`/`Task` entities + linking them to `Message.capture` ({kind,itemId}, currently always null) + rendering the capture cards in project-web (component already exists, wired for data) was deliberately DEFERRED out of the agent task.
3. **Persistence — migrate to a real DB** was decided (backend is in-memory only today) but the DB stack was NOT chosen yet (Prisma/SQLite vs Postgres vs Drizzle — the question was interrupted). Treat as a separate step.

**Why:** keeps the agent contract preparable before the capture UI; the agent only OUTPUTS drafts, capture use-cases persist them after output.
**How to apply:** when resuming, the next build is the Capture Card feature; confirm the DB stack first. See [[ben-prototype-overview]] if present.
