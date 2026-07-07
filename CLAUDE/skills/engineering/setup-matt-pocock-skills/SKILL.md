---
name: setup-matt-pocock-skills
description: Sets up an `## Agent skills` block in AGENTS.md/CLAUDE.md and `docs/agents/` so the engineering skills know this repo's issue tracker (GitHub or local markdown), triage label vocabulary, and domain doc layout. Run before first use of `to-issues`, `to-prd`, `triage`, `diagnose`, `tdd`, `improve-codebase-architecture`, or `zoom-out` — or if those skills appear to be missing context about the issue tracker, triage labels, or domain docs.
disable-model-invocation: true
---

# Setup Matt Pocock's Skills

Scaffold the per-repo configuration that the engineering skills assume:

- **Issue tracker** — where issues live (GitHub by default; local markdown is also supported out of the box)
- **Triage labels** — the strings used for the five canonical triage roles
- **Domain docs** — where `CONTEXT.md` and ADRs live, and the consumer rules for reading them

This is a prompt-driven skill, not a deterministic script. Explore, present what you found, confirm with the user, then write.

## Process

### 1. Explore

Look at the current repo to understand its starting state. Read whatever exists; don't assume:

- `git remote -v` and `.git/config` — is this a GitHub repo? Which one?
- `AGENTS.md` and `CLAUDE.md` at the repo root — does either exist? Is there already an `## Agent skills` section in either?
- `CONTEXT.md` and `CONTEXT-MAP.md` at the repo root
- `docs/adr/` and any `src/*/docs/adr/` directories
- `docs/agents/` — does this skill's prior output already exist?
- `.scratch/` — sign that a local-markdown issue tracker convention is already in use

### 2. Present findings and ask

Summarise what's present and what's missing. Then walk the user through the three decisions **one at a time**.

**Section A — Issue tracker.**

Options:
- **GitHub** — issues live in the repo's GitHub Issues (uses the `gh` CLI)
- **GitLab** — issues live in the repo's GitLab Issues (uses the `glab` CLI)
- **Local markdown** — issues live as files under `.scratch/<feature>/` in this repo
- **Other** (Jira, Linear, etc.) — ask the user to describe the workflow in one paragraph

**Section B — Triage label vocabulary.**

The five canonical roles:

- `needs-triage` — maintainer needs to evaluate
- `needs-info` — waiting on reporter
- `ready-for-agent` — fully specified, AFK-ready
- `ready-for-human` — needs human implementation
- `wontfix` — will not be actioned

**Section C — Domain docs.**

- **Single-context** — one `CONTEXT.md` + `docs/adr/` at the repo root.
- **Multi-context** — `CONTEXT-MAP.md` at the root pointing to per-context `CONTEXT.md` files.

### 3. Confirm and edit

Show the user a draft of the `## Agent skills` block and `docs/agents/` file contents. Let them edit before writing.

### 4. Write

- If `CLAUDE.md` exists, edit it. Else if `AGENTS.md` exists, edit it. If neither, ask the user.
- If an `## Agent skills` block already exists, update it in-place — never append a duplicate.
- Write `docs/agents/issue-tracker.md`, `docs/agents/triage-labels.md`, `docs/agents/domain.md`.

### 5. Done

Tell the user the setup is complete and which engineering skills will now read from these files.
