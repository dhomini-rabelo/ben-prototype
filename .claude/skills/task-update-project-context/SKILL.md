---
name: task-update-project-context
description: Initialize or refresh the unified project context from current application code, using per-app Git review points and local uncommitted changes. Run only when explicitly invoked by the user.
disable-model-invocation: true
user-invocable: true
---

# Update Project Context

Run only when the user explicitly invokes `/task-update-project-context`. The invocation authorizes the first population of empty context or a refresh of existing context. Do not run automatically after coding or as a side effect of reading context.

Maintain [code-get-project-context](../code-get-project-context/SKILL.md) and its app documents as a description of the actual project, including the current working tree. Write context in English, matching the coding skills in this base. Do not copy project names, technologies, paths, or business rules from reference projects.

All command paths below are relative to the repository root. The documentation root is `.claude/skills/code-get-project-context/`. Review state lives separately at `.claude/skills/task-update-project-context/last-reviewed.json`; create it only after a real review, not in the empty factory template.

## 1. Identify apps and capture the review boundary

Read the context entrypoint and any existing review state. Discover actual apps using the repository structure, manifests, entrypoints, and runtime responsibilities. Do not assume a monorepo, a particular framework, or a literal `apps/` directory. Do not treat shared libraries as standalone apps.

Capture `git rev-parse HEAD` once as `runHead`. Inspect `git status --short`, staged and unstaged changes, and `git ls-files --others --exclude-standard`. Include relevant untracked application files; do not read ignored secrets or credentials to document them.

If the user names apps, review those apps. Otherwise, inspect all app boundaries and select apps with relevant changes, missing context, or previously recorded `localPaths` that need reconciliation even if the working tree is now clean. Include new apps, removed apps, source-path changes, and changes to shared code or root configuration that affect app behavior, dependencies, or structure. Trace affected consumers rather than creating context for shared packages. Update the root overview and app index when their facts change; an app the run does not review must not receive a review point.

Group context by type under `backend/`, `frontend/`, or `mobile/`. A single app of a type may use that type's folder directly. Multiple apps of a type use named subfolders, such as `frontend/admin/` and `frontend/web/`. Record the real source path independently of the documentation path. If adding a second app requires moving existing context, update its links and state paths without treating the move as a code review. Ask the user if an app's purpose or grouping cannot be established from evidence.

## 2. Resolve each app's review window

Use a stable app identifier in the review state. For each app, take the newest recorded `reviewedHead` that is an ancestor of `runHead`, checking with `git merge-base --is-ancestor`. Keep each app's baseline independent.

If context is empty, the app is new, state is missing, all recorded commits are unreachable, or app boundaries changed enough to invalidate the old scope, review that app's current code in full. Do not use the last commit touching documentation as a substitute baseline: editing documentation does not prove its code was reviewed. With no Git repository or no initial commit, inspect the current files in full and leave `reviewedHead` null; do not invent a commit or initialize Git.

For an incremental review, collect the union of:

- Committed changes: `git diff --name-status <baseline> <runHead>`.
- Staged changes: `git diff --cached --name-status <runHead>`.
- Unstaged changes: `git diff --name-status`.
- Relevant untracked files from step 1.
- Previously recorded `localPaths`, including files that are now clean, deleted, or ignored.

Scope that set to the app, its shared dependencies, and applicable root configuration. Inspect renames and deletions as well as additions. Read the necessary diffs and the current files to determine the actual behavior; a filename change alone does not explain it. The final documentation describes the current working tree, not an intermediate staged version. Handle previous local paths that became ignored without opening secrets.

Always revisit the latest record's `localPaths`, even when its commit is no longer reachable. Earlier documentation may describe an uncommitted change that was later reverted, leaving no current Git diff. Re-reading those paths reconciles the documentation with the restored code. Do not discard these paths merely because a different commit is used as baseline.

Report the selected apps and whether each uses an incremental or full review. If nothing needs documentation changes, still record a completed review for the apps actually inspected.

## 3. Populate or reconcile the app documents

Read the existing documents for the app under review and verify their claims against source code, manifests, and applicable configuration. Create files only when real content supports them; do not create empty sections or invented flows merely to fill the structure.

| File relative to the app's context folder | Content |
| --- | --- |
| `description.md` | App purpose, users or consumers, responsibilities, and boundaries. |
| `technology-stack.md` | Technologies and their roles, grounded in manifests and configuration. Distinguish declared version ranges from resolved versions when documenting versions. |
| `architecture-overview.md` | Current layers, dependencies, data ownership, integrations, and contracts with other apps. |
| `project-structure.md` | Key source paths and what belongs there; a useful navigation map rather than an exhaustive file inventory. |
| `system-flows/README.md` | Index of implemented flows with short descriptions and links that help select what to read. |
| `system-flows/<flow-name>/index.md` | Trigger, actors, prerequisites, ordered behavior, business rules, branches, failure behavior, and side effects confirmed in code. |
| `system-flows/<flow-name>/code-reference.md` | Verified source paths and symbols implementing that flow, relevant contracts and data structures, and how the pieces connect. |

Use kebab-case flow names. Introduce category folders inside `system-flows/` only when the number of flows makes them useful, maintaining links in the index. Add focused documents such as `data-model.md`, `integrations.md`, `api-surface.md`, or flow relationships only when they explain substantial content better than existing files. Link them from the app's entry in the root skill or the relevant app document so they remain discoverable.

Keep business behavior in the flow overview and implementation navigation in its code reference. Link across apps for shared contracts; describe each app's own responsibility without duplicating entire flows. Mention relevant shared packages here rather than creating contexts for them.

Update documentation when a change makes it inaccurate or materially incomplete: new or removed capabilities, changed business rules or flow steps, contracts, side effects, stack, architecture, or referenced paths. Inspect changed referenced code, but rewrite its documentation only if the documented facts changed. Skip formatting, internal refactors, logs, test-only edits, or dependency changes that do not change any documented fact. Leave accurate files untouched.

Remove obsolete descriptions and repair links when apps or flows disappear. Preserve valid existing content and organization. Distinguish confirmed code behavior from user intent: ask about missing product meaning or unresolved contradictions instead of guessing. Do not turn a proposed feature into an implemented flow.

## 4. Update the entrypoint and validate

Replace the entrypoint's empty overview with a brief, verified project description once real app context exists. Populate its app index with app type, source path, responsibility, and relative links to the documents actually created, including each available system-flow index. Preserve its reading instructions and content boundaries. If no app exists yet, leave the context empty and do not manufacture app documents or review entries.

Check that all local documentation links resolve, referenced source paths exist or correctly describe a removal, and the root index exposes every app context. Paths relative to Markdown files change with nesting depth: calculate them from each document, not from a copied example. Preserve the skills' names and invocation settings.

Keep plans, progress, status reports, session history, and reasons for future work out of context documents. Do not modify memory, its categories, coding-convention skills, or application code in this workflow. The review state below is only a technical synchronization marker, not a project progress log.

## 5. Record completed reviews last

After all scoped documentation is reconciled and validated, write the review state. If the run is interrupted, fails, or leaves part of a scoped app unreviewed, do not advance its baseline. Check that HEAD and relevant source files have not changed since they were inspected; if they have, reconcile those changes before recording a review, or leave the review state unchanged and report the incomplete review.

Use this shape, substituting actual identifiers and values:

```json
{
  "apps": {
    "<app-id>": {
      "sourcePath": "<repo-relative-app-path>",
      "contextPath": "<path-relative-to-code-get-project-context>",
      "reviews": [
        {
          "reviewedHead": "<runHead-or-null>",
          "reviewedAt": "<ISO-8601-timestamp>",
          "outcome": "updated",
          "localPaths": []
        }
      ]
    }
  }
}
```

`reviewedHead` is the captured commit whose committed changes were reviewed, not a claim that local edits belong to that commit. Use JSON null when no commit exists. `outcome` is `updated` or `no-change`. `localPaths` lists repository-relative paths of all relevant staged, unstaged, and untracked changes whose current state was reviewed for that app, including shared dependencies and deleted paths. A fully reviewed clean tree records an empty list. Do not include generated context documents or this state file as application changes.

Prepend a review and retain the newest five per app, providing fallback commits after a rebase. Once previous local paths have been reconciled, replace them with the currently outstanding local changes. Preserve entries for apps outside the completed scope. Remove an obsolete app entry only after verifying the app's removal and reconciling its documentation. Write the state only after the scoped review has finished, including when no documentation update was needed.

Report which apps were reviewed, the baseline or reason for full review, documents changed, skipped changes, and whether local edits were included. Keep the state file with its corresponding documentation when committing; this skill does not itself authorize creating a commit.
