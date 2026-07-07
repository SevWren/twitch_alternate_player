# CLAUDE.md — Twitch Alternate Player

This file provides persistent instructions for Claude Code agents working in this repository.
Read it fully before making any changes.

---

## Project Overview

**Alternate Player for Twitch.tv** is a Chrome browser extension (Manifest V3) that replaces
Twitch's native video player with a custom implementation featuring:
- Server-side ad bypass (omits `play_session_id` to skip SSAI ad injection)
- Real-time stream diagnostics overlay (the "S" key statistics panel)
- WebAssembly-accelerated TS→MP4 transcoding via a Web Worker
- BetterTTV / FrankerFaceZ emote integration (generic CDN fallback)
- Auto-claim channel points, GraphQL token interception, duplicate-tab prevention

**GitHub:** https://github.com/SevWren/twitch_alternate_player
**Manifest version:** 3 | **Min Chrome:** 92 | **Extension version:** 2025.5.28

---

## Architecture Overview

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
| `wasm.wasm` | Binary | Compiled WebAssembly runtime for segment transcoding |
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

---

## Code Style & Conventions

### Language & Identifiers
- The codebase uses **Russian (Cyrillic) identifiers** throughout — variable names, function names,
  constants, and CSS class/ID names. This is intentional legacy style.
- **Active translation effort is in progress** to rename all identifiers to English.
  See `Documentation/legacy_code_translation_reference.md` for the full glossary.
- See `.agent/rules/js-doc-master-template.md` for the mandatory JSDoc format when translating:
  every function must document both its English alias and its original Russian name.
- New code should use **English identifiers only**.

### Hungarian-notation prefixes (Russian style)
| Prefix | Meaning |
|---|---|
| `г_` / `g_` | Global variable |
| `м_` / `m_` | Module-level variable |
| `о` / `o` | Object |
| `с` / `s` | String |
| `ч` / `n` | Number (integer) |
| `л` / `b` | Boolean |
| `ф` / `f` | Float |
| `цел` / `fn` | Function |

### Formatting
- No bundler, no TypeScript, no ES modules — plain ES2020 JavaScript
- IIFE singleton pattern per module: `const м_НазваниеМодуля = (function() { ... })()`
- Semicolons required; 2-space indentation
- Use `chrome.*` APIs — **not** `browser.*` (WebExtensions polyfill is not included)
- Avoid `eval()` — blocked by MV3 Content Security Policy

---

## i18n System

All user-facing strings are externalized. **Never hardcode UI text.**

- **Locale files:** `_locales/en/messages.json` and `_locales/ru/messages.json`
- **HTML usage:** `<element data-i18n=F0539>` — sets innerHTML to message F0539
- **HTML with tooltip:** `<element data-i18n=F0539^A0503>` — innerHTML + title attribute
- **JS usage:** `м_i18n.GetMessage('F0539')` or the shorthand `Текст('F0539')`
- **Key prefixes:** `F` = UI labels/buttons, `A` = tooltips/descriptions, `J` = short values/codes, `M` = metadata

### Statistics Overlay Message Keys (F0539–F0573)

| Key | English | Russian |
|---|---|---|
| F0539 | Resolution | Разрешение |
| F0540 | Video | Видео |
| F0541 | Audio | Звук |
| F0542 | Server | Сервер |
| F0543 | Queue, s | Очередь, с |
| F0544 | Playlist, s | Список сегментов, с |
| F0545 | Polling interval, s | Интервал опроса, с |
| F0546 | Added segments | Добавлено сегментов |
| F0547 | Added seconds | Добавлено секунд |
| F0548 | Stream bit rate, Mbit/s | Битрейт трансляции, Мбит/с |
| F0549 | Download rate, Mbit/s | Скорость загрузки, Мбит/с |
| F0550 | Time to first byte, s | Ожидание ответа, с |
| F0551 | Remux, ms | Преобразовано за, мс |
| F0552 | Stream delay, s | Задержка трансляции, с |
| F0554 | Watching duration | Продолжит-ть просмотра |
| F0555 | Total downloaded, MB | Всего скачано, МБайт |
| F0556 | Dropped frames | Пропущено кадров |
| F0557 | Incomplete segments | Проблемных сегментов |
| F0558 | Download errors | Ошибок скачивания |
| F0559 | Buffer overflows | Переполнений буфера |
| F0560 | Buffer underruns | Исчерпаний буфера |
| F0573 | Buffer fullness, s | Заполненность буфера, с |

---

## Active Task: Russian → English UI Text Replacement

The statistics overlay (opened with the **S** key) currently displays Russian text when the
browser locale is Russian. The goal is to ensure English strings are the canonical display for
English-locale users and to audit the player for any hardcoded Russian strings that bypass i18n.

See **Translation Plan** section below for the full execution plan.

---

## Key Constraints & Gotchas

1. **No build step** — do not introduce npm, webpack, or any bundler. The extension loads files
   directly as listed in `manifest.json`.
2. **MV3 CSP** — `eval()` and `new Function(string)` are blocked. Do not add them.
3. **Service worker lifecycle** — `background.js` is a service worker; it has no persistent DOM
   and can be terminated at any time. Do not store state in module globals there.
4. **Web Worker scope** — `worker.js` has no access to `chrome.*` APIs or the DOM.
5. **wasm.wasm is a binary** — never open or edit it as text. Never delete it.
6. **recycler.js** — the memory recycler in `worker.js` pools `Uint8Array` buffers. Do not
   replace it with plain `new Uint8Array()` without understanding GC implications on long sessions.
7. **gql_injection.js page context** — this script runs in the Twitch page context (not extension
   context) to intercept the GQL token. Changes here affect token capture for follows/bonus claims.
8. **Russian event-message names** — `background.js` listens for Cyrillic message names
   (e.g., `ВставитьСторонниеРасширения`, `ЭтотКаналУжеОткрыт`). These must match exactly between
   sender and listener. When translating, update **both** sides simultaneously.
9. **Zombie Ads bug (open)** — expired `#EXT-X-DATERANGE` ad metadata is not filtered; this
   causes black-screen flashes. The fix requires `START-DATE` timestamp validation in the HLS
   parser inside `player.js`.
10. **BTTV/FFZ IDs are hardcoded** — extension IDs for BetterTTV and FrankerFaceZ are hardcoded
    in `background.js`. Only generic CDN versions load; authenticated features are unavailable.
11. **i18n strings only** — all UI text must go through `_locales/*/messages.json` and
    `data-i18n` attributes. Do not hardcode display strings in HTML or JS.
12. **UTF-8 required** — all source files must be saved as UTF-8 (no BOM) to preserve Cyrillic
    characters correctly.

---

## Translation Plan: Russian UI Text → English

### Root Cause
The stats overlay and other UI panels display Russian because:
1. `chrome.i18n.getMessage()` returns strings from whichever `_locales/{lang}/messages.json`
   matches the browser's locale. Russian-locale Chrome → Russian strings displayed.
2. Some labels inside `player.js` and `player.html` may also be **hardcoded in Russian** outside
   of the i18n system (CSS class names, HTML IDs, data attributes written in Cyrillic).

### What Needs to Change

#### Phase 1 — Audit (Read Only)
- [ ] Grep all `.js`, `.html`, `.css` files for Cyrillic characters outside of comments
- [ ] Identify every hardcoded Russian string that is **displayed to the user** (not just identifiers)
- [ ] Cross-reference each found string against `_locales/en/messages.json` to confirm an English
      key exists
- [ ] List any strings missing from the English locale

#### Phase 2 — Fix Missing English Locale Entries
- [ ] For every Russian string found without an English equivalent in `_locales/en/messages.json`,
      add the English translation using the existing key naming convention (F/A/J prefix)
- [ ] Mirror every new key in `_locales/ru/messages.json` as well (keep locales in sync)

#### Phase 3 — Replace Hardcoded Russian Display Strings in HTML/JS
- [ ] In `player.html`: replace any hardcoded Russian text content with `data-i18n=KEY` attributes
- [ ] In `player.js`: replace any hardcoded Russian strings assigned to `.textContent`,
      `.innerHTML`, or `.innerText` with `м_i18n.GetMessage('KEY')`
- [ ] In `player.js`: replace any hardcoded Russian strings used in `alert()`, `console.log()`,
      or user-visible error messages

#### Phase 4 — CSS Class & ID Names (Cosmetic, Non-Breaking)
- [ ] CSS class names and HTML IDs in Russian (e.g., `class=статистика-кнопка`, `id=статистика`)
      are not user-visible but contribute to confusion
- [ ] Rename cautiously — every reference in HTML, JS, and CSS must be updated atomically
- [ ] Use `grep -r` / Grep tool to find all usages before renaming any class or ID

#### Phase 5 — Code Identifier Translation (Long-Running)
- [ ] Follow `Documentation/legacy_code_translation_reference.md` for the glossary
- [ ] Follow `.agent/rules/js-doc-master-template.md` for JSDoc standards during translation
- [ ] Translate module by module in this priority order:
      1. `common.js` (shared utilities — highest leverage)
      2. `content.js` (entry point — simpler)
      3. `background.js` (service worker — small file)
      4. `player.js` (largest — do in logical sections)
      5. `worker.js` (self-contained — translate last)

### Verification After Each Phase
```
# Confirm no user-visible Cyrillic remains in HTML
grep -rn "[А-Яа-яЁё]" player.html

# Confirm English locale has all keys referenced in HTML
# (manual cross-reference)

# Reload extension in Chrome and set browser language to English
# Open a Twitch stream, press S — confirm all stats labels are in English
```

---

## Available Claude Skills

All skills live in `CLAUDE/skills/`. Invoke them by name when the task matches.

### Engineering
| Skill | Use When |
|---|---|
| `diagnose` | Tracking down a hard bug — structured reproduce → hypothesize → instrument → fix loop |
| `triage` | Managing GitHub issues — applying state labels (needs-triage, ready-for-agent, etc.) |
| `tdd` | Writing new features test-first (red → green → refactor) |
| `to-issues` | Breaking a spec or PRD into vertical-slice GitHub issues |
| `to-prd` | Synthesizing a conversation into a formal PRD document |
| `zoom-out` | Getting a higher-level architectural view of a module |
| `improve-codebase-architecture` | Finding shallow modules, tight coupling, refactor opportunities |
| `grill-with-docs` | Stress-testing a design decision against domain docs and ADRs |
| `prototype` | Throwaway spike to validate a design before committing |

### Productivity
| Skill | Use When |
|---|---|
| `caveman` | Ultra-compressed communication (75% token reduction for long sessions) |
| `grill-me` | Interviewing Claude about a plan before implementing |
| `handoff` | Generating a compact session summary for the next agent |
| `write-a-skill` | Creating a new reusable Claude skill |

### Misc
| Skill | Use When |
|---|---|
| `setup-pre-commit` | Configuring Husky + lint-staged + Prettier commit hooks |
| `scaffold-exercises` | Building course/training exercise directory structures |

### Documentation
| Skill | Use When |
|---|---|
| `repo-doc-audit` | Full 18-section audit of repo documentation quality |

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
docs: add CLAUDE.md with architecture and translation plan
```

**Always push after committing:**
```bash
git push origin <branch>
```

**Token for HTTPS push:**
Configure the remote URL with your personal access token (stored securely, not in this file).

---

## Important Notes for AI Agents

- **Read before editing.** `player.js` is ~8,000 lines. Always read the relevant section first.
- **Stay within module boundaries.** Each IIFE module has a clear responsibility. Do not
  move logic between modules without understanding the message-passing contracts.
- **Do not delete `player-english-translating-test.js`** — it is the active translation
  reference/test file.
- **Do not edit `wasm.wasm` as text.** It is a compiled binary.
- **Do not introduce npm or Node.js dependencies.** The extension runs natively in the browser.
- **Do not use ES modules (`import`/`export`).** MV3 content scripts do not support them.
- **Check `.agent/rules/`** before adding JSDoc comments — there are mandatory formatting rules.
- **Translation commits must be atomic per file.** Do not mix translation of identifiers with
  logic changes in the same commit.
- **Cyrillic event names must be renamed in pairs.** When renaming a `chrome.runtime.sendMessage`
  call, find and rename the matching `chrome.runtime.onMessage` listener simultaneously.
- **Run the extension after every non-trivial change** — there are no automated tests.
