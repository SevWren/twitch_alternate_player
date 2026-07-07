# Output Templates — Repository Documentation Audit

*Use these templates for all five output documents. Fill every section — no visible placeholders in final output. Zero-finding categories still require a "No Findings Identified" section stating what was examined.*

---

## Template 1: `Repository-Audit-Report.md`

```markdown
# Repository Documentation Audit Report

| | |
|---|---|
| **Repository** | [name] |
| **Repository Path / URL** | [local path or remote URL] |
| **Primary Language(s)** | [e.g., Python 3.11 / PowerShell 7 / C# .NET 8] |
| **Audit Date** | [YYYY-MM-DD] |
| **Files Examined** | [P1: N fully / P2: N strategically / P3: N sampled] |
| **Audit Coverage** | Full / Triage (sampled — note if large_repo threshold exceeded) |

---

## Executive Summary

[2–4 sentences: overall health rating (Healthy / Needs Attention / At Risk / Critical),
total findings count by severity, and top 2–3 risks requiring immediate action.]

### Findings Summary

| Category | Critical | High | Medium | Low | Total |
|---|---|---|---|---|---|
| Direct Contradictions (DC) | | | | | |
| Semantic Contradictions (SC) | | | | | |
| Glossary / Terminology Drift (GD) | | | | | |
| Traceability Failures (TF) | | | | | |
| Documentation Drift (DD) | | | | | |
| Process Drift (PD) | | | | | |
| Dead Knowledge (DK) | | | | | |
| Orphan Knowledge (OK) | | | | | |
| Coverage Gaps (CG) | | | | | |
| **Total** | | | | | |

### Top Risks

1. [Most critical finding — ID and one-line description]
2. [Second — ID and one-line description]
3. [Third — ID and one-line description]

---

## Section 1 — Purpose

[Audit purpose tied to this specific repository: what problem it solves, which stakeholders
it serves, what decisions its findings inform.]

---

## Section 2 — Scope

### In Scope
[Artifact types examined, with specific paths.]

### Out of Scope
[Anything explicitly excluded and why.]

### Examination Method
- Priority 1 (read fully): [N] files
- Priority 2 (read strategically): [N] files
- Priority 3 (sampled, first 80 lines): [N] files

---

## Section 3 — Repository Inventory

### Documentation Artifacts

| Path | Authority Level | Maintenance Status | Owner | Purpose |
|---|---|---|---|---|
| [path] | Authoritative / Derived / Reference / Generated | Active / Stale / Abandoned / Unknown | [team/role] | [purpose] |

### Source Code Artifacts

| Module / Path | Purpose | Documented? |
|---|---|---|
| [path] | [purpose] | Yes / Partially / No |

### Configuration Artifacts

| File | Purpose | Authoritative For |
|---|---|---|
| [file] | [purpose] | [knowledge domain] |

### Governance Artifacts

| File | Type | Status |
|---|---|---|
| [file] | CLAUDE.md / AGENTS.md / CONTRIBUTING / etc. | Current / Stale / Missing |

### Operational Artifacts

| File | Type | Status |
|---|---|---|
| [file] | Runbook / Makefile / CI Pipeline / etc. | Current / Stale / Missing |

---

## Section 4 — Source-of-Truth Map

[For each significant knowledge domain, identify canonical source and any derived or conflicting sources.]

### Domain: [e.g., Dependency Versions]
- **Authoritative source:** [file path]
- **Derived sources:** [file paths]
- **Conflicts:** [DC-NNN if applicable, or "None"]

### Governance Conflicts
[Cases where multiple files claim authority without a defined precedence rule — each becomes DC-NNN.]

---

## Section 5 — Extracted Knowledge Graph

### Core Entities
[Primary systems, components, modules, and actors documented in the repository.]

### Key Relationships
[Most significant documented relationships — dependencies, ownership, process flows.]

### Knowledge Graph Gaps
[Expected relationships that are absent — these feed into Section 8 (Traceability) and Section 14 (Coverage).]

---

## Section 6 — Direct Contradictions

[Total DC findings: N. Severity distribution: Critical N / High N / Medium N / Low N.]

### DC-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact A** | `[file path]` — [section or line reference] |
| **Artifact B** | `[file path]` — [section or line reference] |
| **Authority Assessment** | [which is more authoritative and why] |

**Statement from Artifact A:**
> [Exact quote or precise paraphrase]

**Statement from Artifact B:**
> [Exact quote or precise paraphrase]

**Impact:** [What breaks, misleads, or causes incorrect action if this persists]

**Resolution:** [Which artifact changes, what it should say, who acts]

---

### No Direct Contradictions Identified (if applicable)

Examined: [specific artifact pairs checked]. No mutually exclusive claims found.

---

## Section 7 — Semantic Contradictions

[Total SC findings: N. Severity distribution: Critical N / High N / Medium N / Low N.]

### SC-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact A** | `[file path]` — [relevant section] |
| **Artifact B** | `[file path]` — [relevant section] |

**What Artifact A implies:** [Concrete belief or action a reader would take]

**What Artifact B implies:** [Concrete belief or action a reader would take]

**Why these are incompatible:** [The logical or operational conflict]

**Impact:** [Specific harm scenario — what goes wrong and when]

**Resolution:** [Which artifact changes and what it should say]

---

### No Semantic Contradictions Identified (if applicable)

[What was examined and why no findings were raised.]

---

## Section 8 — Traceability Failures

[Total TF findings: N. Severity distribution: Critical N / High N / Medium N / Low N.]

### TF-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Expected Relationship** | [e.g., "Requirement R-04 → implementing module"] |
| **Artifact(s) Involved** | `[file paths]` |

**Missing Linkage:** [The specific relationship that cannot be established]

**Verification Attempted:** [What was checked and what could not be confirmed]

**Governance Impact:** [What decisions cannot be safely made without this traceability]

**Resolution:** [What artifact or linkage to create, by whom]

---

### No Traceability Failures Identified (if applicable)

[What traceability domains were examined and what confirmed traceability was intact.]

---

## Section 9 — Documentation Drift

[Total DD findings: N.]

### DD-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact** | `[file path]` — [section / line] |
| **Drifted Claim** | [What the document says] |
| **Current Reality** | [What is actually true in the implementation] |
| **Evidence** | [Where in source the current reality is confirmed] |

**Resolution:** [Specific update required]

---

## Section 10 — Process Drift

[Total PD findings: N.]

### PD-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Documented Procedure** | `[file path]` — [what the doc prescribes] |
| **Observed Reality** | [What repo evidence shows actually happens] |
| **Evidence of Deviation** | [Specific files or CI config demonstrating the drift] |

**Root Cause:** [Why this drift occurred]

**Organisational Impact:** [What risks the deviation creates]

**Resolution:** [Update the procedure, or update the practice — specify which is correct]

---

## Section 11 — Dead Knowledge

[Total DK findings: N.]

### DK-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact** | `[file path]` — [section if partial] |
| **Dead Type** | Dead Artifact / Dead Section / Dead Reference / Dead Dependency |
| **Evidence of Death** | [Why no longer valid — removed system, renamed function, broken link, etc.] |

**Risk if Acted Upon:** [What breaks if a developer or agent follows this guidance]

**Recommended Disposition:** Archive / Delete / Update — [with specific action]

---

## Section 12 — Orphan Knowledge

[Total OK findings: N.]

### OK-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Orphaned Artifact** | `[file path]` |
| **Missing References** | [Documents that should link here but do not] |
| **Missing Ownership** | [No documented owner — if applicable] |

**Recommended Integration:** [Specific links or ownership assignments needed]

---

## Section 13 — Terminology / Glossary Drift

[Total GD findings: N.]

### GD-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Drifted Concept** | [What the concept is] |
| **Term Variants** | [All names in use and where each appears] |

**Impact:** [Where the inconsistency causes misunderstanding or search failures]

**Resolution:** [Which term to standardise on; which files require updates; or recommend a Glossary artifact]

---

### No Terminology Drift Identified (if applicable)

[What was examined.]

---

## Section 14 — Documentation Coverage Gaps

[Total CG findings: N. Severity distribution: Critical N / High N / Medium N / Low N.]

### CG-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Coverage Domain** | Architectural / Operational / Governance / Security / Dependency / Process / Ownership / Information-type |
| **Gap Description** | [What knowledge is absent] |
| **Impact** | [What cannot be done safely without this documentation] |

**Resolution:** [Specific artifact to create, with required content outline]

---

## Section 15 — Root Cause Analysis

### Systemic Root Causes

[Group findings by underlying root cause. Reference finding IDs.]

#### Root Cause 1: [e.g., Undefined Documentation Ownership]
- **Findings affected:** [DC-001, SC-003, CG-002, …]
- **Description:** [Why this root cause exists and how it manifests]
- **Systemic fix:** [RGI-NNN]

### Root Cause Summary Table

| Root Cause | Findings Affected | Count | Governance Fix |
|---|---|---|---|
| [root cause] | [IDs] | N | RGI-NNN |

---

## Section 16 — Risk Assessment

### Risk Register

| Risk ID | Category | Description | Likelihood | Impact | Severity | Findings | Mitigation |
|---|---|---|---|---|---|---|---|
| R-001 | [Operational / Architectural / Compliance / Security / Knowledge / Governance / Maintenance] | [description] | Probable / Possible / Unlikely | Critical / High / Medium / Low | Critical / High / Medium / Low | [IDs] | [action] |

### Critical Risks Requiring Immediate Action

[Narrative description of top 2–3 risks, why they are urgent, and consequences if unaddressed.]

---

## Section 17 — Recommended Remediation Order

| Priority | Finding(s) | Action | Effort | Done Criteria |
|---|---|---|---|---|
| 1 | [IDs] | [specific action] | S / M / L / XL | [measurable criteria] |

### Remediation Phases

**Phase 1 — Immediate (0–14 days):** Critical findings. Actions that unblock safe operation or safe agent use.

**Phase 2 — Short-term (15–60 days):** High severity findings. Actions that reduce material risk.

**Phase 3 — Ongoing (60+ days):** Medium/Low findings and governance improvements.

---

## Section 18 — Proposed Repository Governance Improvements

*See `Proposed-Repository-Governance-Improvements.md` for complete RGI findings.*

| ID | Title | Priority | Root Cause Addressed | Effort |
|---|---|---|---|---|
| RGI-001 | [title] | Critical / High / Medium / Low | [root cause] | S / M / L / XL |

---

## Appendix A — Files Examined (P1 and P2)

[List all files read fully or strategically, with classification.]

## Appendix B — Files Sampled (P3)

[List sampled files — first 80 lines only.]

## Appendix C — Files Not Examined

[Files skipped and why — too large, out of scope, generated, etc.]
```

---

## Template 2: `Direct-Contradictions.md`

```markdown
# Direct Contradictions

| | |
|---|---|
| **Repository** | [name] |
| **Audit Date** | [YYYY-MM-DD] |
| **Total Findings** | [N] |

> A **direct contradiction** exists when two authoritative sources make mutually exclusive statements.

## Severity Summary

| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **N** |

---

## Findings

### DC-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact A** | `[exact file path]` — [section or line range] |
| **Artifact B** | `[exact file path]` — [section or line range] |
| **Authority Assessment** | [Which is more authoritative and why] |

**Statement from Artifact A:**
> [Exact quote or precise paraphrase]

**Statement from Artifact B:**
> [Exact quote or precise paraphrase]

**Impact:** [What breaks, misleads, or causes incorrect action if this persists — be specific]

**Resolution:** [Which artifact changes, what the corrected content should say, who acts]

---

### No Direct Contradictions Identified (if applicable)

Artifact pairs examined: [list]. No mutually exclusive claims found.
```

---

## Template 3: `Semantic-Contradictions.md`

```markdown
# Semantic Contradictions

| | |
|---|---|
| **Repository** | [name] |
| **Audit Date** | [YYYY-MM-DD] |
| **Total Findings** | [N] |

> A **semantic contradiction** exists when artifacts imply incompatible realities, even if
> neither explicitly contradicts the other in words.

## Severity Summary

| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **N** |

---

## Findings

### SC-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Artifact A** | `[exact file path]` — [relevant section] |
| **Artifact B** | `[exact file path]` — [relevant section] |

**What Artifact A implies:** [Concrete belief or action a reader would take acting on A alone]

**What Artifact B implies:** [Same level of concreteness for B]

**Why these are incompatible:** [The logical or operational conflict]

**Impact:** [Specific harm scenario — what goes wrong and at what point in a workflow]

**Resolution:** [Which artifact changes and what it should say after the fix]

---

### No Semantic Contradictions Identified (if applicable)

[What was examined and why no findings were raised.]
```

---

## Template 4: `Traceability-Failures.md`

```markdown
# Traceability Failures

| | |
|---|---|
| **Repository** | [name] |
| **Audit Date** | [YYYY-MM-DD] |
| **Total Findings** | [N] |

> A **traceability failure** exists when a required relationship between artifacts cannot be
> established or verified — requirements without implementing code, architectural decisions
> without rationale, procedures without enforcement mechanisms.

## Severity Summary

| Severity | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **N** |

## Traceability Domains Examined

| Domain | Relationship Expected | Status |
|---|---|---|
| Requirements → Implementation | Each requirement traceable to implementing module | Passed / Failures found / N/A |
| Architecture → Code | ADRs / arch docs traceable to implementing code | Passed / Failures found / N/A |
| Policy → Procedure | Each policy has enforcing procedures | Passed / Failures found / N/A |
| Decision → Artifact | Each design decision traceable to resulting artifacts | Passed / Failures found / N/A |
| Documentation → Source | Documentation claims verifiable in source code | Passed / Failures found / N/A |

---

## Findings

### TF-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Severity** | Critical / High / Medium / Low |
| **Traceability Domain** | [e.g., Requirements → Implementation] |
| **Expected Relationship** | [What linkage should exist and is absent] |
| **Artifact(s) Involved** | `[file paths]` |

**Missing Linkage:** [The specific relationship that cannot be established]

**Verification Attempted:** [What was checked; what was and was not found]

**Governance Impact:** [What decisions or safe operations cannot proceed without this traceability]

**Resolution:** [What artifact or linkage to create; naming the responsible party if determinable]

---

### No Traceability Failures Identified (if applicable)

[What domains were examined and what evidence confirmed traceability was intact.]
```

---

## Template 5: `Proposed-Repository-Governance-Improvements.md`

```markdown
# Proposed Repository Governance Improvements

| | |
|---|---|
| **Repository** | [name] |
| **Audit Date** | [YYYY-MM-DD] |
| **Total Improvements** | [N] |

> These improvements address the **systemic root causes** of audit findings.
> Each is specific to this repository's actual gaps — not generic advice.

## Priority Summary

| Priority | Count |
|---|---|
| Critical | N |
| High | N |
| Medium | N |
| Low | N |
| **Total** | **N** |

## Root Causes Addressed

| Root Cause | Findings It Explains | Governance Fix |
|---|---|---|
| [root cause] | [DC-001, SC-002, …] | RGI-NNN |

---

## Governance Improvements

### RGI-001 — [Short Descriptive Title]

| Field | Value |
|---|---|
| **Priority** | Critical / High / Medium / Low |
| **Category** | Source-of-truth ownership / Documentation lifecycle / Review workflow / Traceability / Quality standards / Taxonomy / Change management / Automated validation / Glossary standard |
| **Root Cause Addressed** | [root cause name] |
| **Findings That Motivated This** | [DC-NNN, SC-NNN, TF-NNN, GD-NNN, …] |
| **Estimated Effort** | S (hours) / M (1–3 days) / L (1–2 weeks) / XL (ongoing) |

**Problem Addressed:** [Why this governance gap exists and what harm it has caused — reference specific findings]

**Proposed Solution:** [Specific mechanism. State what sections a new document must contain and why each is required. "Add a CLAUDE.md" is insufficient.]

**Implementation Steps:**
1. [Concrete first action]
2. [Concrete second action]
3. [...]

**Success Criteria:** [Measurable definition of done — e.g., "CI fails if any *.md contains a link to a non-existent path"]

**Prevents Recurrence Of:** [DC / SC / GD / TF / DD / PD / DK / OK / CG]

---

## Implementation Roadmap

### Phase 1 — Immediate (0–14 days)
*Critical and High priority items that unblock safe operation or safe agent use.*

| RGI | Title | Owner | Done Criteria |
|---|---|---|---|
| RGI-001 | [title] | [team/role] | [criteria] |

### Phase 2 — Short-term (15–60 days)
*Medium priority items that reduce ongoing risk.*

| RGI | Title | Owner | Done Criteria |
|---|---|---|---|

### Phase 3 — Ongoing (60+ days)
*Low priority items and systemic practices that prevent long-term drift.*

| RGI | Title | Owner | Done Criteria |
|---|---|---|---|

---

## Governance Health Projection

[1–2 sentences: if all RGI items are implemented, what will the state of documentation
governance be in 90 days? What residual risk remains?]
```
