# CLAUDE.md — Twitch Alternate Player

This file provides persistent instructions for Claude Code agents working in this repository.
Read it fully before making any changes.

---

## Agent Start Here

**Three facts every agent must hold before touching any file:**

1. All identifiers in this codebase are in **Russian (Cyrillic)**. New code must use **English only**.
2. `Documentation/legacy_code_translation_reference.md` is the authoritative Russian→English glossary.
3. `.agent/rules/js-doc-master-template.md` defines mandatory JSDoc format for translated functions.

---

## Project Ownership & Context

**The current maintainer does not speak Russian.**

This project was originally developed by a Russian-speaking developer (Alexander Choporov / CoolCmd).
Variable names, function names, constants, CSS classes, HTML IDs, comments, and some UI strings are all Cyrillic.
The current maintainer is actively translating **everything** to English.

- Introduce no new Cyrillic identifiers or strings under any circumstances.
- When modifying existing code, translate Cyrillic identifiers in the surrounding scope as part of the change (opportunistic translation).
- Translation commits must be **atomic per file** — no mixing translation with logic changes.
- Cyrillic `chrome.runtime.sendMessage` event names must be renamed in **sender + listener pairs simultaneously**.

---

## Project Overview

**Alternate Player for Twitch.tv** — Chrome extension (Manifest V3) that replaces Twitch's native player:

- Server-side ad bypass (omits `play_session_id` to skip SSAI ad injection)
- Real-time stream diagnostics overlay (the **S** key statistics panel)
- WebAssembly-accelerated TS→MP4 transcoding via a Web Worker
- BetterTTV / FrankerFaceZ emote integration (generic CDN fallback)
- Auto-claim channel points, GraphQL token interception, duplicate-tab prevention

**GitHub:** https://github.com/SevWren/twitch_alternate_player
**Manifest version:** 3 | **Min Chrome:** 92 | **Extension version:** 2025.5.28

---

## Architecture

### File Roles

| File | Layer | Role |
|---|---|---|
| `manifest.json` | Config | Extension entry point — permissions, content scripts, web-accessible resources |
| `background.js` | Service Worker | Inter-tab messaging: detects third-party extensions, prevents duplicate player tabs |
| `content.js` | Content Script | Detects Twitch channel URLs, redirects to `player.html` |
| `gqltoken.js` | Content Script | Intercepts Twitch GraphQL integrity token at `document_start` |
| `autoclaim.js` | Content Script | Auto-claims channel bonus points |
| `content_injection.js` | Page Context | Injected into page context for GQL token capture (MV3 workaround) |
| `gql_injection.js` | Page Context | Additional GQL interception (web-accessible resource) |
| `player.html` | Player UI | Full alternate player — video element, controls, settings tabs, stats overlay |
| `player.js` | Player Logic | ~8,000-line main module: HLS fetching, MSE pipeline, stats, settings, chat |
| `player.css` | Styles | Player UI styling |
| `common.js` | Shared Util | Shared helpers: i18n wrapper, storage, DOM utilities |
| `worker.js` | Web Worker | MPEG-TS demuxer → MP4 muxer, runs off main thread |
| `wasm.wasm` | Binary | Compiled WebAssembly runtime for segment transcoding — **never open as text** |
| `asmjs.js` | Fallback | asm.js fallback when WASM unavailable |
| `rules.json` | Net Rules | `declarativeNetRequest` rules — strips ad-related request/response headers |
| `_locales/en/messages.json` | i18n | English UI strings |
| `_locales/ru/messages.json` | i18n | Russian UI strings |
| `recycler.js` | Util | Memory recycler — reuses typed-array buffers to reduce GC pressure |
| `pointerevent.js` | Util | Pointer event / drag utilities |
| `report.html` / `report.css` | UI | Extension report/feedback page |

### Message-Passing Flow

```
Twitch page
  └── content.js          (detects channel, redirects)
  └── gqltoken.js         (captures GQL integrity token)
  └── content_injection.js (page-context token relay)
        |
        v
  background.js           (service worker: tab dedup, ext detection)
        |
        v
  player.html + player.js (HLS fetch → MediaSource)
        |
        v
  worker.js               (TS demux → MP4 mux via WASM)
```

---

## Development Commands

There is **no build system**. This is a raw browser extension — edit files directly.

| Task | How |
|---|---|
| Load extension | Chrome → `chrome://extensions` → "Load unpacked" → select repo root |
| Reload after JS/HTML/CSS change | Click the reload icon on `chrome://extensions` |
| Reload after `manifest.json` change | Remove and re-add the extension |
| Reload background worker | Click "Service worker" link on the extension card |
| Debug player | Open `player.html` tab → DevTools → Console / Sources |
| Debug background | Click "Service worker" → DevTools |
| Capture logs | Run `node tools/chrome-tools/fetch_logs.js` (requires Chrome remote debugging on port 9222) |
| Git diff bundle (Windows) | Run `tools/git_changes_tool/gather_comparison_info.ps1` |

**Run the extension after every non-trivial change** — there are no automated tests.

---

## Code Style & Conventions

### Language & Identifiers

- All new code: **English identifiers only**
- Glossary for existing Russian names: `Documentation/legacy_code_translation_reference.md`
- JSDoc standards when translating: `.agent/rules/js-doc-master-template.md`

### Hungarian-Notation Prefixes (Russian style in legacy code)

| Russian Prefix | English Equivalent | Meaning |
|---|---|---|
| `г_` | `g_` | Global variable |
| `м_` | `m_` | Module-level variable |
| `о` | `o` | Object |
| `с` | `s` | String |
| `ч` | `n` | Number (integer) |
| `л` | `b` | Boolean |
| `ф` | `f` | Float |
| `цел` | `fn` | Function |

### Formatting

- No bundler, no TypeScript, no ES modules — plain ES2020 JavaScript
- IIFE singleton pattern per module: `const м_НазваниеМодуля = (function() { ... })()`
- Semicolons required; 2-space indentation
- Use `chrome.*` APIs — `browser.*` (WebExtensions polyfill) is not included
- `eval()` is blocked by MV3 Content Security Policy

---

## i18n System

All user-facing strings are externalized. **Hardcoded UI text is a bug.**

- **Locale files:** `_locales/en/messages.json` and `_locales/ru/messages.json`
- **HTML usage:** `<element data-i18n=F0539>` — sets innerHTML to message F0539
- **HTML with tooltip:** `<element data-i18n=F0539^A0503>` — innerHTML + title attribute
- **JS usage:** `м_i18n.GetMessage('F0539')` or the shorthand `Текст('F0539')`
- **Key prefixes:** `F` = UI labels/buttons, `A` = tooltips/descriptions, `J` = short values/codes, `M` = metadata
- **Stats overlay keys (F0539–F0573):** see `_locales/en/messages.json` directly for the full list

---

## Active Translation Work

**Status:** Russian→English UI text replacement in progress. The stats overlay (opened with the **S** key) and other UI panels may still display Russian in Russian-locale browsers.

**Translation phases — see `HANDOFF.md` for detailed task tracking:**

1. **Audit** — grep JS/HTML/CSS for user-visible Cyrillic outside the i18n system
2. **Fix locale gaps** — add any missing English keys to `_locales/en/messages.json`; mirror in `_locales/ru/messages.json`
3. **Replace hardcoded strings** — `.textContent`, `.innerHTML`, `alert()`, `player.html` literal text
4. **CSS/ID rename** — Cyrillic class/ID names (cosmetic; rename all usages atomically)
5. **Code identifier translation** — follow glossary; priority: `common.js` → `content.js` → `background.js` → `player.js` → `worker.js`

**Verification after each phase:**
```bash
# Confirm no user-visible Cyrillic remains in HTML
grep -rn "[А-Яа-яЁё]" player.html
```

---

## Key Constraints

1. **No build step** — no npm, webpack, or bundler. Extension loads files as listed in `manifest.json`.
2. **MV3 CSP** — `eval()` and `new Function(string)` are blocked.
3. **Service worker lifecycle** — `background.js` has no persistent DOM and can be terminated at any time. Store no state in module globals there.
4. **Web Worker scope** — `worker.js` has no access to `chrome.*` APIs or the DOM.
5. **wasm.wasm is a binary** — edit or delete it and the transcoding pipeline breaks.
6. **recycler.js** — pools `Uint8Array` buffers in `worker.js` to reduce GC pressure on long sessions; understand this before changing buffer allocation.
7. **gql_injection.js page context** — runs in the Twitch page context, not extension context. Changes here affect token capture for follows/bonus claims.
8. **Cyrillic event-message names** — `background.js` listens for Cyrillic message names (e.g., `ВставитьСторонниеРасширения`). These must match exactly between sender and listener; rename both sides simultaneously.
9. **Zombie Ads bug (open)** — expired `#EXT-X-DATERANGE` metadata is not filtered, causing black-screen flashes. Fix requires `START-DATE` timestamp validation in the HLS parser in `player.js`.
10. **BTTV/FFZ IDs are hardcoded** — only generic CDN versions load; authenticated features are unavailable.
11. **UTF-8 required** — all source files must be saved as UTF-8 (no BOM) to preserve Cyrillic characters.

---

## Git Workflow

```
main          — stable, production-ready
feature/*     — new features
fix/*         — bug fixes
translate/*   — Russian→English translation PRs (keep separate from logic changes)
```

**Commit message format:**
```
type(scope): short description

feat(player): add English fallback for hardcoded stats labels
fix(i18n): add missing buffer-fullness key to en locale
translate(common): rename module-level variables to English
docs: update CLAUDE.md
```

---

## Available Skills

All skills live in `CLAUDE/skills/`. See `CLAUDE/skills/engineering/README.md` for the full listing with descriptions and invocation guidance.

**Quick reference:**

| Skill | Use When |
|---|---|
| `ask-matt` | Route to the right skill for your situation |
| `diagnosing-bugs` | Hard bug — structured reproduce → hypothesize → instrument → fix loop |
| `triage` | Managing GitHub issues |
| `improve-codebase-architecture` | Finding shallow modules, tight coupling, refactor opportunities |
| `grill-with-docs` | Sharpen an idea before building; maintains `CONTEXT.md` and ADRs |
| `writing-for-agents` | Creating or editing skills, CLAUDE.md, or any agent-consumed doc |

---

## Notes for This File

This file is always in the agent's context window — every line costs on every turn.
- Keep reference material behind pointers (locale files, translation glossary, skill READMEs) rather than inlining it here.
- Push operational tracking (checklists, task status) to `HANDOFF.md` or issue tracker.
- Prune any section that restates what a file lookup would reveal.
