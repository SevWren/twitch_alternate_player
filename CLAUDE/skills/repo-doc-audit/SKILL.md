---
name: repo-doc-audit
description: >
  Performs a comprehensive Repository Documentation Audit and Governance Standard (RDAGS) against an entire codebase. Use this skill whenever the user wants to audit, evaluate, or assess repository documentation — including requests like "audit my repo docs", "find doc inconsistencies", "check for documentation drift", "governance review", "find dead or orphan knowledge", "check my CLAUDE.md or AGENTS.md for accuracy", or any systematic documentation quality evaluation. Always trigger this skill when the user asks to run a documentation audit or governance review, even if they describe only part of the standard (e.g., "check traceability" or "find contradictions in my docs"). Produces five output files: Repository-Audit-Report.md (full 18-section report) plus Direct-Contradictions.md, Semantic-Contradictions.md, Traceability-Failures.md, and Proposed-Repository-Governance-Improvements.md as standalone action-oriented findings documents.
---

# Repository Documentation Audit and Governance Standard (RDAGS) Skill

## Overview

This skill conducts an 18-section documentation audit across all repository artifacts and produces a full audit report plus four standalone findings documents.

Think of it like a building inspection for repository knowledge: blueprints are compared to what was actually built, each system is checked for internal consistency, and anything decommissioned-but-still-in-the-walls is flagged. This audit does the same — comparing what docs *claim* to what code *actually does*, surfacing conflicts between authoritative sources, and identifying knowledge that was abandoned without being officially retired.

## Reference Files

Load both at the start of every audit:
- `references/audit-standard.md` — 18-section criteria and finding definitions
- `references/output-templates.md` — Templates for all five output documents

## Configuration

`audit-config.yaml` (bundled) defines file patterns, exclusion paths, thresholds, and per-finding-type toggles. `enumerate_repo.py` reads it automatically. To override for a specific repo, create `.audit-config.yaml` in the repo root — the script deep-merges it over the bundled defaults at runtime.

## Finding ID Prefixes

`DC` Direct Contradiction · `SC` Semantic Contradiction · `GD` Glossary/Terminology Drift · `TF` Traceability Failure · `DD` Documentation Drift · `PD` Process Drift · `DK` Dead Knowledge · `OK` Orphan Knowledge · `CG` Coverage Gap · `RGI` Repository Governance Improvement

IDs use zero-padded sequences (`DC-001`, `DC-002`…) and are stable — they never change between the full report and the extracted findings documents.

## Prerequisites

1. Get the repository root path from the user — ask if not provided
2. If a GitHub URL is supplied, clone it first:
   `git clone <url> /home/claude/audit-target/ && REPO_ROOT="/home/claude/audit-target"`
3. Note the primary language(s) — informs which P2 files are most relevant

## Phase 1 — Repository Enumeration

Run the bundled script. It classifies files into priority buckets, maps governance artifact presence, extracts version strings for DC detection, and verifies internal markdown links for DK detection — all in one pass, before Claude reads a single file.

```bash
SKILL_ROOT="/mnt/skills/user/repo-doc-audit"
REPO_ROOT="/path/to/repo"   # replace with actual path

python "$SKILL_ROOT/scripts/enumerate_repo.py" \
  --repo-root "$REPO_ROOT" \
  --config    "$SKILL_ROOT/audit-config.yaml" \
  --output    /tmp/repo-inventory.json

cat /tmp/repo-inventory.json
```

Read the JSON output before proceeding. It drives the rest of the audit:

- `priority_1_files` / `priority_2_files` / `priority_3_sample` — what to read and at what depth
- `governance_artifacts` null keys — immediate CG candidates (governance artifact absent)
- `version_conflict: true` + `version_strings` map — pre-confirmed DC candidates
- `broken_links` entries — pre-confirmed DK findings (dead references, path-verified)
- `triage_mode: true` — inform the user that source code will be sampled, not read fully
- `very_large_repo: true` — notify the user before beginning; offer to accept a prioritised module list
- `enabled_findings` — which finding types are active per the config

## Phase 2 — Content Ingestion

Read files in the order the inventory defines:

- **P1** — Read fully: all docs and governance artifacts in `priority_1_files`
- **P2** — Read strategically: module entry points and manifests in `priority_2_files`
- **P3** — First 80 lines only: representative samples from `priority_3_sample`

Flag version numbers, command syntax, environment variable names, and ownership claims as contradiction hotspots while reading.

## Phase 3 — Audit Analysis

Apply all 18 sections from `references/audit-standard.md`. For each section, gather evidence from the ingested content, identify findings, assign IDs, and classify severity:

- **Critical** — Causes operational failure, security risk, or misleads an agent into destructive action
- **High** — Material risk of incorrect deployment, data loss, or architectural misalignment
- **Medium** — Degrades maintainability, discoverability, or team reliability
- **Low** — Minor inconsistency with limited operational impact

**Highest-yield sections:** S6 (DC — version specs, env vars, command syntax), S7 (SC — workflow descriptions vs. code reality), S8 (TF — requirement-to-implementation chains), S11 (DK — deprecated instructions), S13 (GD — terminology drift across docs), S14 (CG — undocumented modules, missing runbooks).

An absence of linkage is a finding. If traceability cannot be established because the linkage artifact doesn't exist — that is `TF-NNN`. If a procedure carries no version date — that is `DD-NNN` risk. When evidence is sparse, note what was examined rather than skipping the section.

## Phase 4 — Output Generation

Write exactly five files to `/mnt/user-data/outputs/`. Use the templates in `references/output-templates.md`.

| File | Content |
|------|---------|
| `Repository-Audit-Report.md` | Full 18-section audit narrative |
| `Direct-Contradictions.md` | All DC-NNN findings, complete detail |
| `Semantic-Contradictions.md` | All SC-NNN findings, complete detail |
| `Traceability-Failures.md` | All TF-NNN findings, complete detail |
| `Proposed-Repository-Governance-Improvements.md` | All RGI-NNN items with phased roadmap |

The four findings documents are not summaries — they contain complete finding detail. A developer must be able to act on `Direct-Contradictions.md` without opening the full report. Zero-finding categories still get a document with a "No Findings Identified" section that states what was examined (this is confidence evidence, not a gap).

Call `present_files` with all five paths after writing.

## Handling Large Repositories

When `triage_mode: true`: read all P1 files before any P2/P3; sample source code at directory level (one file per top-level module); tag source-derived findings `[sampled-not-exhaustive]`. All 18 audit sections still run — some will rely on documentation analysis only.
