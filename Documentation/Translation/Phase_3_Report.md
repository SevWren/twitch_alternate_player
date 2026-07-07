# Phase 3 Report — Hardcoded Russian in HTML/JS
## Twitch Alternate Player: player.html, player.js, common.js

**Date:** 2026-07-07
**Task:** Find every place where Russian text is hardcoded OUTSIDE the i18n system and replace it.
**Files:** player.html, player.js, common.js

---

## Executive Summary

| Metric | Count |
|--------|-------|
| Total hardcoded Russian instances | 13 |
| User-visible hardcoded Russian | 7 |
| Developer-only Russian (internal) | 6 |
| player.html hardcoded Russian | 0 |
| player.js hardcoded Russian | 10 |
| common.js hardcoded Russian | 3 |

**Key Finding:** `player.html` is fully compliant — zero hardcoded Russian display strings.
All display text uses `data-i18n` attributes. The issues are exclusively in `player.js` and `common.js`.

---

## How the i18n System Works (Reference)

```
HTML:   <element data-i18n=F0539>           → sets innerHTML to locale string for F0539
HTML:   <element data-i18n=F0539^A0503>     → sets innerHTML + title tooltip
JS:     м_i18n.GetMessage('F0539')          → returns locale string
JS:     Текст('F0539')                      → shorthand for GetMessage
```

Anything that sets visible text WITHOUT going through this system is a Phase 3 fix.

---

## Section A: player.html

**Result: FULLY COMPLIANT — NO FIXES REQUIRED**

Every Russian string in player.html is in:
- `id=` attributes (not user-visible)
- `class=` attributes (not user-visible)
- `data-тащилка=` attributes (not user-visible — these are dragger targets)
- `data-i18n=` keys (routed through i18n correctly)

No Russian text appears between HTML tags or in `title=`, `placeholder=`, `value=`, or `aria-label=` attributes outside of i18n.

---

## Section B: player.js — Hardcoded Russian Table

### B1. USER-VISIBLE — Server Error Strings (PRIORITY 1)

These strings are thrown as exceptions and caught by the error-handling system, which then
displays them to the user via the debug/notification overlay.

| Line | Russian Text | Context | Existing EN Key | Fix |
|------|--------------|---------|----------------|-----|
| 8344 | `"Сервер не смог выполнить операцию"` | `throw "Сервер не смог..."` | **J0221** | Map to `J0221` |
| 8397 | `"Сервер не смог выполнить операцию"` | `throw "Сервер не смог..."` | **J0221** | Map to `J0221` |
| 8620 | `"Сервер не смог выполнить операцию"` | `throw "Сервер не смог..."` | **J0221** | Map to `J0221` |
| 8827 | `"В ответе сервера нет метаданных"` | `throw "В ответе сервера..."` | MISSING | Create new key, map |

**J0221 existing value (en):**
> "An error occurred in $FULL_EXTENSION_NAME$ browser extension. Try to reload this page. If this error appears constantly, then the extension is not compatible with your browser or its settings."

**Exact replacements for lines 8344, 8397, 8620:**
```javascript
// BEFORE:
throw "Сервер не смог выполнить операцию";
// AFTER:
throw м_i18n.GetMessage('J0221');
```

**New key needed for line 8827:**
```json
// Add to _locales/en/messages.json:
"F0998": {
  "message": "The server response does not contain required metadata. Please reload the page.",
  "description": "Error message when Twitch server returns incomplete stream metadata"
}

// Add to _locales/ru/messages.json:
"F0998": {
  "message": "В ответе сервера отсутствуют необходимые метаданные. Пожалуйста, перезагрузите страницу.",
  "description": "Сообщение об ошибке, когда сервер Twitch возвращает неполные метаданные"
}
```

**Exact replacement for line 8827:**
```javascript
// BEFORE:
throw "В ответе сервера нет метаданных";
// AFTER:
throw м_i18n.GetMessage('F0998');
```

---

### B2. USER-VISIBLE — Em-Dash Placeholders (PRIORITY 3 — LOW)

These lines set an em-dash ("—") as a placeholder when metadata is unavailable.
The em-dash itself is culturally neutral, but for strict i18n completeness, it can be extracted.

| Line | Russian Text | Context | Proposed Key |
|------|--------------|---------|-------------|
| 2000 | `"—"` | `Узел("статистика-сжатиевидео").textContent = "—"` | F0997 |
| 2001 | `"—"` | `Узел("статистика-разрешениевидео").textContent = "—"` | F0997 |
| 2012 | `"—"` | `Узел("статистика-сжатиезвука").textContent = "—"` | F0997 |

**Note:** These are LOW priority. The em-dash is universally understood. Only fix if strict
locale completeness is required.

**Optional new key:**
```json
// Add to both en and ru messages.json:
"F0997": {
  "message": "—",
  "description": "Placeholder em-dash shown when metadata is unavailable"
}
```

---

### B3. INTERNAL CONTROL FLOW — DO NOT FIX

These strings are used as exception tokens for internal control flow (catch/rethrow).
They are NEVER displayed to users.

| Line | String | Reason to Skip |
|------|--------|---------------|
| 6242 | `"КОНЕЦ_СПИСКА"` | Internal control token, caught and handled by calling code |
| 6415 | `"КОНЕЦ_СПИСКА"` | Same |
| 6543 | `"КОНЕЦ_СПИСКА"` | Same |
| 7054 | `"БРАКОВАТЬ"` | Internal reject signal, never reaches UI |
| 8234 | `"ОТКАЗАНО_В_ДОСТУПЕ"` | Access denial code, handled internally |
| 8293 | `"ОТКАЗАНО_В_ДОСТУПЕ"` | Same |

**Decision: KEEP AS-IS.** These are internal state machine tokens. Translating them would require
updating all catch handlers simultaneously and provides no user-facing benefit.

---

## Section C: common.js — Developer Error Strings (PRIORITY 4 — LOW)

These errors are thrown by internal assertion/validation checks. They are caught by
`AddExceptionHandler()` (line ~128) and sent to the debug report system. They do NOT
appear in the player UI but DO appear in debug reports sent by users.

| Line | Russian Text | Context | Fix |
|------|--------------|---------|-----|
| 123 | `'Проверка не пройдена'` | `throw new Error('Проверка не пройдена')` | Replace with `'Check failed'` |
| 422 | `` `Не найден текст ${sMessageName}` `` | `throw new Error(...)` | Replace with `` `Text not found: ${sMessageName}` `` |
| 515 | `` `Неизвестный код языка: ${сКодЯзыка}` `` | `throw new Error(...)` | Replace with `` `Unknown language code: ${сКодЯзыка}` `` |

**Exact replacements:**
```javascript
// Line 123 — BEFORE:
throw new Error('Проверка не пройдена');
// Line 123 — AFTER:
throw new Error('Check failed');

// Line 422 — BEFORE:
throw new Error(`Не найден текст ${sMessageName}`);
// Line 422 — AFTER:
throw new Error(`Text not found: ${sMessageName}`);

// Line 515 — BEFORE:
throw new Error(`Неизвестный код языка: ${сКодЯзыка}`);
// Line 515 — AFTER:
throw new Error(`Unknown language code: ${сКодЯзыка}`);
```

---

## Prioritized Fix Order

| Priority | File | Lines | Action | Impact |
|----------|------|-------|--------|--------|
| **1 — HIGH** | player.js | 8344, 8397, 8620 | Map to existing J0221 | User-visible error messages |
| **2 — HIGH** | player.js | 8827 | Create F0998 key + replace | User-visible error message |
| **3 — LOW** | player.js | 2000, 2001, 2012 | Optional: create F0997 key | Em-dash placeholder (cosmetic) |
| **4 — LOW** | common.js | 123, 422, 515 | Direct English string replacement | Debug reports only |
| **SKIP** | player.js | 6242, 6415, 6543, 7054, 8234, 8293 | No change | Internal control flow tokens |

---

## New Locale Keys to Add (if executing fixes)

Add these to **both** `_locales/en/messages.json` and `_locales/ru/messages.json`
before making the code changes:

### _locales/en/messages.json additions:
```json
"F0997": {
  "message": "—",
  "description": "Placeholder em-dash shown when video/audio metadata is unavailable"
},
"F0998": {
  "message": "The server response does not contain required metadata. Please reload the page.",
  "description": "Error thrown when Twitch server returns incomplete stream metadata"
}
```

### _locales/ru/messages.json additions:
```json
"F0997": {
  "message": "—",
  "description": "Символ тире — заглушка, когда метаданные видео/аудио недоступны"
},
"F0998": {
  "message": "В ответе сервера отсутствуют необходимые метаданные. Пожалуйста, перезагрузите страницу.",
  "description": "Ошибка, когда сервер Twitch возвращает неполные метаданные потока"
}
```

---

## Execution Checklist

- [ ] Add F0997 and F0998 to both locale files
- [ ] Replace `throw "Сервер не смог выполнить операцию"` (×3) → `throw м_i18n.GetMessage('J0221')`
- [ ] Replace `throw "В ответе сервера нет метаданных"` → `throw м_i18n.GetMessage('F0998')`
- [ ] Replace `throw new Error('Проверка не пройдена')` → `throw new Error('Check failed')`
- [ ] Replace i18n text-not-found error → English
- [ ] Replace language-code error → English
- [ ] Reload extension and verify error paths do not display Russian
- [ ] Commit with message: `fix(i18n): replace hardcoded Russian error strings with locale keys`
