#!/usr/bin/env python3
"""
enumerate_repo.py — Phase 1 automation for repo-doc-audit skill.

Usage:
    python enumerate_repo.py --repo-root /path/to/repo
                             [--config /path/to/audit-config.yaml]
                             [--output /tmp/repo-inventory.json]

Outputs a JSON inventory containing:
  - Files bucketed into priority_1 / priority_2 / priority_3
  - Governance artifact presence map  (null = missing → seed CG findings)
  - Version strings across config files (conflict → seed DC findings)
  - Broken internal markdown links     (confirmed → seed DK findings)
  - Large-repo threshold flags         (triage_mode, very_large_repo)
"""

import argparse
import fnmatch
import json
import os
import re
import sys
from pathlib import Path

# ── Dependency bootstrap ─────────────────────────────────────────────────────
try:
    import yaml
except ImportError:
    import subprocess
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "pyyaml",
         "--break-system-packages", "-q"],
        stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL,
    )
    import yaml  # noqa: E402  (intentional re-import after install)

# ── Default config (mirrors audit-config.yaml exactly) ───────────────────────
DEFAULT_CONFIG: dict = {
    "priorities": {
        "p1": {
            "documentation": ["*.md", "*.rst", "*.adoc", "*.txt"],
            "governance": [
                "CLAUDE.md", "AGENTS.md", "README*", "CONTRIBUTING*",
                "CHANGELOG*", "ARCHITECTURE*", "SECURITY*", "LICENSE*",
                "ROADMAP*", "ADR*", "DECISIONS*",
            ],
            "config": [
                "pyproject.toml", "setup.py", "setup.cfg", "package.json",
                "*.csproj", "Makefile", "Dockerfile*",
                "*.toml", "*.ini", "*.cfg", "*.yaml", "*.yml",
            ],
            "ci": [".github/workflows/*.yml", "Jenkinsfile", "*.ps1"],
            "env_templates": [".env.example", "appsettings.json"],
        },
        "p2": {
            "python":     ["__init__.py", "conftest.py"],
            "powershell": ["*.psd1"],
            "wpf":        ["App.xaml", "MainWindow.xaml"],
        },
        "p3": {
            "sample_lines": 80,
            "patterns": ["*.py", "*.ps1", "*.psm1", "*.cs", "*.js", "*.ts"],
        },
    },
    "exclude": [
        ".git", "node_modules", "__pycache__", "venv", ".venv",
        ".tox", "dist", "build", ".pytest_cache", "*.egg-info",
    ],
    "version_sources": [
        "pyproject.toml", "package.json", "setup.py", "setup.cfg",
        "CHANGELOG*", "*.csproj", "*.psd1",
    ],
    "thresholds": {"large_repo": 500, "very_large_repo": 1000},
    "findings": {
        "DC": True, "SC": True, "GD": True, "TF": True, "DD": True,
        "PD": True, "DK": True, "OK": True, "CG": True,
    },
}

# Governance presence checks: key → list of filename globs (case-insensitive)
GOVERNANCE_CHECKS: dict[str, list[str]] = {
    "claude_md":    ["CLAUDE.md"],
    "agents_md":    ["AGENTS.md"],
    "readme":       ["README*"],
    "contributing": ["CONTRIBUTING*"],
    "changelog":    ["CHANGELOG*"],
    "architecture": ["ARCHITECTURE*"],
    "security":     ["SECURITY*"],
    "license":      ["LICENSE*"],
}

# Version extraction: (filename glob, regex with one capture group)
VERSION_PATTERNS: list[tuple[str, str]] = [
    ("pyproject.toml", r'(?:^|\n)\s*version\s*=\s*["\']([0-9][^"\']+)["\']'),
    ("package.json",   r'"version"\s*:\s*"([0-9][^"]+)"'),
    ("setup.py",       r'version\s*=\s*["\']([0-9][^"\']+)["\']'),
    ("setup.cfg",      r'(?m)^\s*version\s*=\s*([0-9]\S+)'),
    ("*.csproj",       r'<(?:Assembly)?Version>([0-9][^<]+)</(?:Assembly)?Version>'),
    ("*.psd1",         r"ModuleVersion\s*=\s*['\"]([0-9][^'\"]+)['\"]"),
    ("CHANGELOG*",     r'(?m)^#{1,3}\s+\[?([0-9]+\.[0-9]+\.[0-9][^\]\s]*)\]?'),
]

_LINK_RE = re.compile(r'\[[^\]]*\]\(([^)]+)\)')


# ── Helpers ───────────────────────────────────────────────────────────────────

def _deep_merge(base: dict, override: dict) -> dict:
    """Recursively merge override into base, returning a new dict."""
    result = dict(base)
    for k, v in override.items():
        if isinstance(v, dict) and isinstance(result.get(k), dict):
            result[k] = _deep_merge(result[k], v)
        else:
            result[k] = v
    return result


def load_config(config_path: str | None) -> dict:
    """Load YAML config; silently fall back to DEFAULT_CONFIG on any failure."""
    if not config_path:
        return DEFAULT_CONFIG
    p = Path(config_path)
    if not p.exists():
        print(f"⚠  Config not found at {config_path} — using defaults", file=sys.stderr)
        return DEFAULT_CONFIG
    try:
        with p.open() as f:
            data = yaml.safe_load(f) or {}
        return _deep_merge(DEFAULT_CONFIG, data)
    except Exception as exc:  # noqa: BLE001
        print(f"⚠  Could not parse config ({exc}) — using defaults", file=sys.stderr)
        return DEFAULT_CONFIG


def _comp_excluded(component: str, patterns: list[str]) -> bool:
    """True if a single path component matches any exclusion pattern."""
    return any(fnmatch.fnmatch(component, p) for p in patterns)


def _file_matches(name: str, rel_path: str, patterns: list[str]) -> bool:
    """True if filename or normalised relative path matches any pattern."""
    norm = rel_path.replace("\\", "/")
    for p in patterns:
        if fnmatch.fnmatch(name, p):
            return True
        if fnmatch.fnmatch(norm, p):
            return True
        # Allow patterns like '.github/workflows/*.yml' to match anywhere
        if "/" in p and fnmatch.fnmatch(norm, f"*/{p}"):
            return True
    return False


# ── Core functions ────────────────────────────────────────────────────────────

def walk_and_classify(repo_root: Path, config: dict) -> dict:
    """Walk repo_root and bucket each file into p1 / p2 / p3 / unclassified."""
    prio  = config.get("priorities", {})
    excl  = config.get("exclude", [])

    p1_pats = [p for sub in prio.get("p1", {}).values() for p in sub]
    p2_pats = [p for sub in prio.get("p2", {}).values() for p in sub]
    p3_pats = prio.get("p3", {}).get("patterns", [])

    all_files, p1, p2, p3, unc = [], [], [], [], []

    for dirpath, dirnames, filenames in os.walk(repo_root):
        # Prune excluded directories in-place to stop os.walk descending
        dirnames[:] = [d for d in dirnames if not _comp_excluded(d, excl)]

        for fname in sorted(filenames):
            full = Path(dirpath) / fname
            try:
                rel = str(full.relative_to(repo_root))
            except ValueError:
                continue

            # Skip if any path component is excluded
            if any(_comp_excluded(part, excl) for part in Path(rel).parts):
                continue

            all_files.append(rel)

            if _file_matches(fname, rel, p1_pats):
                p1.append(rel)
            elif _file_matches(fname, rel, p2_pats):
                p2.append(rel)
            elif _file_matches(fname, rel, p3_pats):
                p3.append(rel)
            else:
                unc.append(rel)

    return {"all_files": all_files, "p1": p1, "p2": p2, "p3": p3, "unclassified": unc}


def find_governance_artifacts(all_files: list[str]) -> dict:
    """Return a map of governance key → relative path (None if absent)."""
    result: dict[str, str | None] = {}
    for key, globs in GOVERNANCE_CHECKS.items():
        found = next(
            (f for f in all_files
             if any(fnmatch.fnmatch(Path(f).name.upper(), g.upper()) for g in globs)),
            None,
        )
        result[key] = found
    return result


def extract_version_strings(repo_root: Path, p1_files: list[str]) -> dict:
    """Extract the first version string found in each version-bearing P1 file."""
    versions: dict[str, str] = {}
    for rel in p1_files:
        fname = Path(rel).name
        for glob, pattern in VERSION_PATTERNS:
            if not fnmatch.fnmatch(fname.upper(), glob.upper()):
                continue
            try:
                text = (repo_root / rel).read_text(encoding="utf-8", errors="ignore")
            except OSError:
                break
            m = re.search(pattern, text)
            if m:
                versions[rel] = m.group(1).strip()
            break   # only apply the first matching pattern per file
    return versions


def find_broken_links(repo_root: Path, md_files: list[str]) -> list[dict]:
    """Find internal markdown links that resolve to non-existent paths."""
    broken: list[dict] = []
    for rel in md_files:
        full = repo_root / rel
        try:
            lines = full.read_text(encoding="utf-8", errors="ignore").splitlines()
        except OSError:
            continue
        md_dir = full.parent
        for lineno, line in enumerate(lines, 1):
            for m in _LINK_RE.finditer(line):
                raw = m.group(1).strip()
                # Skip external, anchor-only, or mailto links
                if raw.startswith(("http://", "https://", "ftp://", "mailto:", "#")):
                    continue
                link_path = raw.split("#")[0]
                if not link_path:
                    continue
                try:
                    resolved = (md_dir / link_path).resolve()
                    if not resolved.exists():
                        broken.append({
                            "file": rel, "line": lineno,
                            "link": raw, "status": "NOT_FOUND",
                        })
                except (OSError, ValueError):
                    pass
    return broken


# ── Main ──────────────────────────────────────────────────────────────────────

def main() -> None:
    ap = argparse.ArgumentParser(
        description="Enumerate a repository for the repo-doc-audit skill.",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    ap.add_argument("--repo-root", required=True, metavar="PATH",
                    help="Absolute path to the repository root")
    ap.add_argument("--config", default=None, metavar="PATH",
                    help="Path to audit-config.yaml (optional)")
    ap.add_argument("--output", default="/tmp/repo-inventory.json", metavar="PATH",
                    help="Destination for the JSON inventory (default: /tmp/repo-inventory.json)")
    args = ap.parse_args()

    repo_root = Path(args.repo_root).resolve()
    if not repo_root.is_dir():
        sys.exit(f"ERROR: --repo-root is not a directory: {repo_root}")

    cfg = load_config(args.config)

    # Merge repo-local override if present (.audit-config.yaml in repo root)
    local_cfg_path = repo_root / ".audit-config.yaml"
    if local_cfg_path.exists():
        try:
            with local_cfg_path.open() as f:
                local_data = yaml.safe_load(f) or {}
            cfg = _deep_merge(cfg, local_data)
            print(f"ℹ  Merged repo-local config: .audit-config.yaml")
        except Exception as exc:  # noqa: BLE001
            print(f"⚠  Could not parse .audit-config.yaml ({exc}), skipping", file=sys.stderr)

    # Walk and classify
    clf = walk_and_classify(repo_root, cfg)
    total = len(clf["all_files"])
    thresh = cfg.get("thresholds", {})
    large      = total > thresh.get("large_repo",      500)
    very_large = total > thresh.get("very_large_repo", 1000)

    # Derive audit signals
    governance = find_governance_artifacts(clf["all_files"])
    versions   = extract_version_strings(repo_root, clf["p1"])
    md_files   = [f for f in clf["p1"] if f.lower().endswith(".md")]
    broken     = find_broken_links(repo_root, md_files)

    ver_values   = list(versions.values())
    ver_conflict = len(set(ver_values)) > 1 if len(ver_values) > 1 else False

    inventory = {
        "repo_root":  str(repo_root),
        "file_counts": {
            "total":        total,
            "priority_1":   len(clf["p1"]),
            "priority_2":   len(clf["p2"]),
            "priority_3":   len(clf["p3"]),
            "unclassified": len(clf["unclassified"]),
        },
        "large_repo":       large,
        "very_large_repo":  very_large,
        "triage_mode":      large,
        "priority_1_files": sorted(clf["p1"]),
        "priority_2_files": sorted(clf["p2"]),
        "priority_3_sample": sorted(clf["p3"]),
        "governance_artifacts": governance,
        "version_strings":  versions,
        "version_conflict": ver_conflict,
        "broken_links":     broken,
        "enabled_findings": cfg.get("findings", {}),
    }

    out = Path(args.output)
    out.parent.mkdir(parents=True, exist_ok=True)
    out.write_text(json.dumps(inventory, indent=2))

    # ── Console summary ──
    missing_gov = [k for k, v in governance.items() if v is None]
    print(f"✓  {total} files  "
          f"({len(clf['p1'])} P1 / {len(clf['p2'])} P2 / {len(clf['p3'])} P3 / "
          f"{len(clf['unclassified'])} unclassified)")
    if missing_gov:
        print(f"⚠  Missing governance artifacts: {', '.join(missing_gov)}")
    if ver_conflict:
        print(f"⚠  Version conflict across {len(versions)} files: {versions}")
    if broken:
        print(f"⚠  {len(broken)} broken internal link(s) found")
    if very_large:
        print(f"⚠  Very large repo ({total} files) — notify user before starting")
    elif large:
        print(f"⚠  Large repo ({total} files) — triage mode active")
    print(f"✓  Inventory written → {args.output}")


if __name__ == "__main__":
    main()
