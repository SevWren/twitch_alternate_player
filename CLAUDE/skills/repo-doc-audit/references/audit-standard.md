# Repository Documentation Audit and Governance Standard

*Reference document for the repo-doc-audit skill. Load at the start of every audit.*

---

## Section 1 — Purpose Statement

Open the audit report with a purpose statement tied to this specific repository: what problem the audit is solving, which stakeholders it serves, and what decisions its findings will inform.

---

## Section 2 — Scope

Document the complete boundary of what was and was not examined.

Evaluate all repository artifacts contributing to organisational knowledge:
source code, architecture documentation, design records, requirements, operational procedures and runbooks, standards, policies, configuration artifacts, build and deployment definitions, testing documentation, and agent-orientation files (CLAUDE.md, AGENTS.md, wikis).

Assess both **documented intent** and **implemented reality**. Note any explicit out-of-scope items.

---

## Section 3 — Repository Inventory

Establish a complete inventory of repository knowledge assets, built from the JSON output of `enumerate_repo.py`.

Classify each artifact or artifact group by:
- **Ownership** — who is responsible for maintaining it
- **Purpose** — what question it answers
- **Authority level** — Authoritative / Derived / Reference / Generated / Operational
- **Maintenance status** — Active / Stale / Abandoned / Unknown
- **Update frequency** — how often it should change
- **Dependency relationships** — what it references; what references it

Gaps in the inventory (artifacts expected but absent) are themselves CG findings.

---

## Section 4 — Source-of-Truth Map

Identify the authoritative source for every significant knowledge domain.

For each domain define:
- **Canonical ownership** — which team or role owns it
- **Authoritative document(s)** — primary source file(s)
- **Derived documents** — files that copy or restate the source
- **Synchronisation requirements** — how derived docs should stay current
- **Dependency relationships** — what depends on this truth domain

A governance conflict exists when multiple artifacts claim authority over the same subject without a defined precedence rule. Each conflict becomes a DC finding.

Explicitly identify: primary authorities, secondary references, generated documentation, and deprecated authorities.

---

## Section 5 — Extracted Knowledge Graph

Describe the key entities, concepts, and relationships across the repository.

Capture:
- **Entities**: systems, components, services, modules, actors
- **Concepts**: key domain terms and their definitions
- **Processes**: workflows, pipelines, procedures
- **Responsibilities**: who does what
- **Constraints**: rules, policies, limits
- **Dependencies**: internal and external

Relationships include references, ownership, implementation links, process flows, and architectural relationships.

The knowledge graph is the basis for contradiction detection (S6–S8), traceability analysis (S9), and coverage assessment (S14).

---

## Section 6 — Direct Contradictions

Identify explicit conflicts between repository artifacts.

A **direct contradiction** exists when two authoritative sources make mutually exclusive statements — both cannot simultaneously be true.

Common hotspots:
- Version requirements for the same dependency across multiple files
- Conflicting deployment procedures (README says X, Makefile does Y)
- Inconsistent ownership assignments
- Contradictory architectural descriptions
- Divergent environment variable definitions (name, type, required vs. optional)
- Mismatched API specifications across documents
- Conflicting security or compliance requirements
- Contradictory dependency or package management guidance
- Different incident response or escalation procedures
- **Version string mismatches** — compare `version_strings` from the inventory; flag `version_conflict: true` entries immediately as DC findings

Each DC-NNN finding must include:
- **Conflicting artifacts** — both file paths with section/line references
- **Statement from Artifact A** — exact quote or precise paraphrase
- **Statement from Artifact B** — exact quote or precise paraphrase
- **Authority assessment** — which is more authoritative and why
- **Impact analysis** — what breaks or misleads if this persists
- **Severity** — Critical / High / Medium / Low
- **Resolution** — specific recommended action

---

## Section 7 — Semantic Contradictions

Identify conflicts that exist despite no explicit textual disagreement.

A **semantic contradiction** exists when artifacts imply incompatible realities — individually plausible, but together they cannot both describe the same system truthfully.

Examples:
- Documentation describing a workflow that cannot occur under current implementation
- Architecture diagrams inconsistent with the actual dependency graph
- A CLAUDE.md instructing an agent to call a function that was renamed or removed
- A README describing the app as stateless when the code manages persistent state
- Process descriptions incompatible with the CI/CD pipeline's actual steps
- Governance requirements the implementation structurally cannot satisfy

Each SC-NNN finding must include:
- **Artifacts involved** — both file paths with relevant sections
- **What Artifact A implies** — what a reader acting on it alone would believe or do
- **What Artifact B implies** — same level of concreteness
- **Why these are incompatible** — the logical or operational conflict
- **Impact** — specific harm scenario and at what workflow step it manifests
- **Severity** — Critical / High / Medium / Low
- **Resolution** — specific recommended action

---

## Section 8 — Traceability Failures

Evaluate traceability across repository knowledge domains.

Traceability requires documented relationships between:
- Requirements and their implementing code
- Architecture decisions and the code that realises them
- Policies and the procedures that enforce them
- Decisions (ADRs, tickets) and the resulting artifacts
- Documentation claims and the source code that validates them

A **traceability failure** exists when a required relationship cannot be established or verified from available artifacts.

Each TF-NNN finding must include:
- **Missing linkage** — the specific relationship that cannot be established
- **Affected artifacts** — files involved or conspicuously absent
- **Verification attempted** — what was checked and what could not be confirmed
- **Governance impact** — what decisions cannot be safely made without this traceability
- **Severity** — Critical / High / Medium / Low
- **Resolution** — what artifact or linkage should be created

---

## Section 9 — Documentation Drift

Identify where documentation no longer reflects repository reality.

Assess drift between:
- Documentation and current implementation (function signatures, API endpoints, CLI flags)
- Documentation and current operational behaviour (runtime behaviour, environment requirements)
- Documentation and current architecture (module structure, dependency graph)

Also check for **missing freshness markers**: documents without a version date or "last updated" field cannot be assessed for drift by readers. Flag absence of freshness markers as a DD-NNN risk even when content appears current.

Drift severity:
- **Critical** — will cause incorrect action that breaks the system
- **High** — will cause material misunderstanding
- **Medium** — noticeably outdated but error is recoverable
- **Low** — minor staleness unlikely to cause operational harm

Each DD-NNN finding must include: file path, the drifted or freshness-absent claim, the current reality, and a resolution recommendation.

---

## Section 10 — Process Drift

Identify where actual execution differs from documented procedures.

Compare:
- Defined development workflows vs. actual commit/branch patterns observable in the repo
- Documented deployment procedures vs. what the CI/CD pipelines actually do
- Governance workflows vs. what PR templates and merge rules enforce
- Documented testing requirements vs. what the test suite actually covers

Each PD-NNN finding must include: the documented procedure, the observed deviation, evidence of the deviation, root cause, and organisational impact.

---

## Section 11 — Dead Knowledge

Identify information that no longer corresponds to active repository reality.

Dead knowledge creates decision-making risk — developers and agents may act on information that is no longer valid.

Examples:
- Procedures for retired systems or removed features
- Architecture descriptions of replaced components
- Configuration instructions for deprecated tooling
- Setup steps for environments that no longer exist
- `broken_links` entries from the inventory are pre-confirmed dead references — assign DK-NNN immediately

Identify:
- **Dead artifacts** — entire files no longer relevant
- **Dead sections** — specific sections within otherwise current files
- **Dead references** — links or citations to removed/renamed targets
- **Dead dependencies** — references to packages or services no longer in use

Each DK-NNN finding must include: artifact/section path, evidence of dead status, risk if acted upon, and recommended disposition (archive / delete / update).

---

## Section 12 — Orphan Knowledge

Identify information lacking sufficient integration into the repository knowledge ecosystem.

Examples:
- Valid documentation no other document links to
- A standards document no procedure references
- An isolated ADR no code comment or README acknowledges
- An operational runbook the main README does not mention

Each OK-NNN finding must include: the orphaned artifact, what references are missing, missing ownership if applicable, and recommended integration.

---

## Section 13 — Terminology / Glossary Drift

Identify inconsistent naming for the same concept across repository artifacts.

Terminology drift is distinct from semantic contradictions: neither document is wrong, but the inconsistency forces readers to infer equivalence that should be explicit. It is one of the most common documentation failures and is not detectable by text-matching alone.

Examples:
- The same entity called "user", "customer", "account", and "actor" in different files
- A function referred to as "process", "transform", "convert", and "parse" across docs and code
- An environment referred to as "prod", "production", "live", and "main" inconsistently
- A configuration key with different capitalisation conventions across files

Detection approach:
1. While reading P1 and P2 files, collect all domain terms with their definitions or usages
2. Compare definitions of semantically similar terms across files
3. Flag any concept represented by more than one name without a documented alias or synonym table

Each GD-NNN finding must include:
- **Drifted concept** — what the concept is
- **Term variants found** — all names used and where each appears (file path, section)
- **Impact** — where the inconsistency causes misunderstanding or search failures
- **Severity** — Critical (agent-facing) / High (developer-facing) / Medium / Low
- **Resolution** — which term to standardise on and which files require updates; or recommend adding a Glossary artifact

---

## Section 14 — Documentation Coverage Gaps

Identify areas where required knowledge is absent or insufficiently documented.

Coverage analysis:
- **Architectural coverage** — are all major components and their relationships documented?
- **Operational coverage** — are all deployment, monitoring, and incident procedures documented?
- **Governance coverage** — are agent-orientation files (CLAUDE.md/AGENTS.md), contribution standards, and ownership rules present? Use `governance_artifacts` null keys from the inventory as pre-confirmed CG candidates.
- **Security coverage** — are security requirements, secrets management procedures, and vulnerability disclosure policies documented?
- **Dependency coverage** — are all external dependencies documented with version constraints and purpose?
- **Process coverage** — are all development lifecycle processes documented?
- **Ownership coverage** — does every significant component have a documented owner?
- **Information-type coverage** (Diátaxis) — does the repo have a reasonable balance of Tutorials (learning-oriented), How-to Guides (task-oriented), Reference (lookup), and Explanation (understanding)? A repo with only Reference docs and no How-to guides is a coverage gap.

Each CG-NNN finding must include: the missing knowledge domain, criticality, operational impact, and the specific artifact to create with a required-content outline.

---

## Section 15 — Root Cause Analysis

Analyse findings to determine underlying systemic causes rather than isolated symptoms.

Root causes to consider:
- Missing governance controls (no policy requiring the missing documentation)
- Undefined ownership (no one responsible for keeping it current)
- Weak review processes (PRs merged without documentation review)
- Inadequate documentation standards (no template or standard exists)
- Organisational fragmentation (teams work in silos)
- Tooling limitations (no automated checks enforce standards)
- Process noncompliance (standards exist but are not followed)
- Knowledge silos (critical knowledge lives only in individuals' heads)

Group findings by shared root cause — multiple findings with the same cause indicate a systemic fix is more efficient than point remediation.

---

## Section 16 — Risk Assessment

Evaluate repository risks arising from identified findings.

Risk categories: Operational, Architectural, Compliance, Security, Knowledge Continuity, Governance, Maintenance.

For each significant risk include:
- **Likelihood** — Probable / Possible / Unlikely
- **Impact** — Critical / High / Medium / Low
- **Severity** (combined) — Critical / High / Medium / Low
- **Affected systems** — what breaks or degrades
- **Mitigation** — specific required action and which RGI-NNN addresses it

---

## Section 17 — Recommended Remediation Order

Define a prioritised remediation sequence with measurable completion criteria.

Typical sequence:
1. Resolve source-of-truth conflicts
2. Resolve direct contradictions
3. Resolve semantic contradictions and terminology drift
4. Restore traceability
5. Eliminate critical documentation drift
6. Eliminate critical process drift
7. Address critical coverage gaps
8. Remove dead knowledge
9. Integrate orphan knowledge
10. Implement governance improvements

Each remediation item must have a measurable done-criteria so the team knows when it is complete.

---

## Section 18 — Proposed Repository Governance Improvements

Define governance enhancements to prevent recurrence of identified issues.

Improvements may include:
- Source-of-truth ownership models (define who owns each knowledge domain)
- Documentation lifecycle management (creation, review, versioning, retirement)
- Review and approval workflows (documentation PR requirements)
- Traceability requirements (mandatory links between requirements, decisions, implementation)
- Documentation quality standards (templates, required sections, freshness markers)
- Repository taxonomy standards (directory structure, naming conventions)
- Change management controls (what triggers documentation updates)
- Automated validation (linters, broken-link checkers, version-consistency gates)
- Glossary / terminology standard (canonical term list to prevent GD recurrence)

Each RGI-NNN must be specific and actionable. "Add a CLAUDE.md" is insufficient. "Add a CLAUDE.md specifying allowed file mutation paths and agent scope boundaries, because their absence caused SC-003 and TF-007" is a valid improvement item.
