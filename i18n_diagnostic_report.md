# i18n System Diagnostic Report - Commit ebf05b5

**Date**: 2026-07-07
**Commit**: ebf05b5121b9643cf4f75a4e6caee7a5fceb6def
**Subject**: "Replace all Russian tooltip text with English in statistics overlay"

## Executive Summary

**ISSUE FOUND**: Commit ebf05b5 did NOT fully replace Russian tooltips in the statistics overlay. **5 elements still have hardcoded Russian text in their active `title` attributes**.

The i18n system infrastructure is intact and all `data-i18n` keys are valid, but hardcoded tooltips bypass the i18n system entirely.

---

## System Architecture Verification

### 1. i18n Module (common.js)

**Status**: ✅ WORKING CORRECTLY

- Location: `/home/vercel-sandbox/twitch_alternate_player/common.js` lines 366-457
- Core function: `GetMessage(sMessageName, sSubstitution)` calls `chrome.i18n.getMessage()`
- Document translation: `TranslateDocument(oDocument)` correctly processes `data-i18n` attributes
- Tooltip syntax: `data-i18n="F0539^A0671"` sets `innerHTML` from F0539 and `title` from A0671
- Player wrapper: `Текст(sCode)` function (line 225) correctly delegates to `м_i18n.GetMessage()`

**Verification**: The i18n system correctly processes `data-i18n` attributes with the `^` delimiter for tooltips.

---

### 2. Statistics Overlay HTML Structure

**Location**: `/home/vercel-sandbox/twitch_alternate_player/player.html` lines 50-200

**Status**: ⚠️ PARTIALLY BROKEN

#### data-i18n Attributes - ✅ ALL VALID

All table header labels use `data-i18n` attributes correctly:

| Line | Attribute | Key | English Message | Status |
|------|-----------|-----|-----------------|--------|
| 52 | data-i18n=F0539 | F0539 | "Resolution" | ✅ Valid |
| 64 | data-i18n=F0540 | F0540 | "Video" | ✅ Valid |
| 71 | data-i18n=F0541 | F0541 | "Audio" | ✅ Valid |
| 86 | data-i18n=F0542 | F0542 | "Server" | ✅ Valid |
| 93 | data-i18n=F0544 | F0544 | "Playlist, s" | ✅ Valid |
| 106 | data-i18n=F0543 | F0543 | "Queue, s" | ✅ Valid |
| 128 | data-i18n=F0545 | F0545 | "Polling interval, s" | ✅ Valid |
| 152 | data-i18n=F0546 | F0546 | "Added segments" | ✅ Valid |
| 155 | data-i18n=F0547 | F0547 | "Added seconds" | ✅ Valid |
| 158 | data-i18n=F0548 | F0548 | "Stream bit rate, Mbit/s" | ✅ Valid |
| 183 | data-i18n=F0549 | F0549 | "Download rate, Mbit/s" | ✅ Valid |
| 186 | data-i18n=F0550 | F0550 | "Time to first byte, s" | ✅ Valid |
| 189 | data-i18n=F0573 | F0573 | "Buffer fullness, s" | ✅ Valid |
| 202 | data-i18n=F0551 | F0551 | "Remux, ms" | ✅ Valid |
| 208 | data-i18n=F0552 | F0552 | "Stream delay, s" | ✅ Valid |
| 217 | data-i18n=F0554 | F0554 | "Watching duration" | ✅ Valid |
| 223 | data-i18n=F0670 | F0670 | "Ads hidden" | ✅ Valid |
| 226 | data-i18n=^A0671 | A0671 | (tooltip text) | ✅ Valid |
| 237 | data-i18n=F0555 | F0555 | "Total downloaded, MB" | ✅ Valid |
| 243 | data-i18n=F0556 | F0556 | "Dropped frames" | ✅ Valid |

**All 33 data-i18n keys verified to exist in `/home/vercel-sandbox/twitch_alternate_player/_locales/en/messages.json`**

---

#### Hardcoded Tooltips - ❌ 5 BROKEN ELEMENTS

The following elements have Russian text in active (non-commented) `title` attributes:

### ❌ Element 1: Remux Time
**Line**: 205
**Element**: `<span id=статистика-преобразованза>`
**Current (RUSSIAN)**: `title="Время, затраченное на преобразование предпоследнего сегмента из TS в MP4. Увеличивается когда все ядра процессора прилично загружены."`
**Should Be (ENGLISH)**: `title="Time taken to convert the penultimate segment from TS to MP4. Increases when all processor cores are heavily loaded."`
**Commented Version Available**: Line 206 has the correct English version commented out

---

### ❌ Element 2: Stream Delay
**Line**: 211
**Element**: `<span id=статистика-задержкатрансляции>`
**Current (RUSSIAN)**:
```
title="Время между захватом видео на компьютере ведущего трансляции и просмотром этого видео вами. Ведущий увидит в чате вашу реакцию на свои действия только по прошествии указанного времени.

Это неточное значение. Реальная задержка может быть на несколько секунд больше."
```
**Should Be (ENGLISH)**:
```
title="The time between capturing video on the streamer's computer and you watching this video. The streamer will see your reaction to their actions in the chat only after the specified time has elapsed.

This is an inaccurate value. The real delay may be a few seconds longer."
```
**Commented Version Available**: Lines 212-215 have the correct English version commented out

---

### ❌ Element 3: Viewing Duration
**Line**: 220
**Element**: `<span id=статистика-длительностьпросмотра>`
**Current (RUSSIAN)**: `title="Прошло времени с начала открытия этой страницы"`
**Should Be (ENGLISH)**: `title="Time elapsed since this page was opened"`
**Commented Version Available**: Line 221 has the correct English version commented out

---

### ❌ Element 4: Downloaded Size
**Line**: 240
**Element**: `<span id=статистика-скачано>`
**Current (RUSSIAN)**: `title="Примерный размер данных, которые проигрыватель загрузил из сети с начала открытия этой страницы"`
**Should Be (ENGLISH)**: `title="Approximate size of data that the player has downloaded from the network since this page was opened"`
**Commented Version Available**: Line 241 has the correct English version commented out

---

### ❌ Element 5: Buffer Exhaustion
**Lines**: 364-370
**Element**: `<span id=статистика-исчерпано>`
**Current (RUSSIAN)**:
```
title="Количество раз, когда в буфере проигрывателя закончилось видео и воспроизведение было приостановлено до заполнения буфера.

Чем ниже в настройках проигрывателя размер буфера, тем выше шанс его исчерпания.

Во время заполнения буфера в середине экрана рисуются песочные часы. Их отсутствие во время приостановки воспроизведения — знак, что в проигрывателе "что-то пошло не так"."
```
**Should Be (ENGLISH)**:
```
title="The number of times the video in the player's buffer ran out and playback was paused until the buffer was filled.

The lower the buffer size in the player settings, the higher the chance of it being exhausted.

During buffer filling, an hourglass is drawn in the middle of the screen. Its absence during playback pause is a sign that "something went wrong" in the player."
```
**Commented Version Available**: Lines 365-371 have the correct English version commented out

---

## Root Cause Analysis

### Why These Were Missed

1. **Incomplete swap**: Commit ebf05b5 swapped English/Russian tooltips for most elements but missed 5 specific elements
2. **Pattern inconsistency**: The commit correctly handled tooltips on lines 56, 68, 75-78, 90, 97, etc., but failed to apply the same pattern to lines 205, 211, 220, 240, 364
3. **No i18n integration**: These tooltips are hardcoded in HTML rather than using `data-i18n="KEY^TOOLTIP_KEY"` syntax

### Impact

- **English-locale users**: Will see Russian tooltips on these 5 statistics items when hovering
- **Russian-locale users**: Unaffected (Russian is still correct for them)
- **Other locales**: Will also see Russian (no translations exist for other locales anyway)

---

## Recommendations

### Immediate Fix (Low Effort)

Swap the commented/active lines for these 5 elements to match the pattern used elsewhere in the commit:

1. **Line 205-206**: Uncomment English version, comment Russian version
2. **Line 211-215**: Uncomment English version (lines 212-215), comment Russian version (lines 211, 214)
3. **Line 220-221**: Uncomment English version, comment Russian version
4. **Line 240-241**: Uncomment English version, comment Russian version
5. **Line 364-371**: Uncomment English version (lines 365-371), comment Russian version (lines 364, 367, 370)

**Effort**: ~5 minutes
**Risk**: None (exact pattern already proven to work for other elements)

---

### Long-Term Fix (Medium Effort)

Replace all hardcoded tooltips with i18n keys:

1. Create tooltip message keys in `_locales/en/messages.json` and `_locales/ru/messages.json`:
   - `A0551` for "Remux time" tooltip
   - `A0552` for "Stream delay" tooltip
   - `A0554` for "Viewing duration" tooltip
   - `A0555` for "Downloaded size" tooltip
   - `A0560` for "Buffer exhaustion" tooltip

2. Update HTML to use `data-i18n` syntax:
   ```html
   <span id=статистика-преобразованза data-i18n=^A0551 data-очистить=""></span>
   ```

3. Remove all hardcoded `title=` attributes from these elements

**Effort**: ~30 minutes
**Risk**: Low (requires testing i18n system processes dynamic IDs correctly)
**Benefit**: Proper i18n architecture, supports future localization

---

## JavaScript Verification

**Status**: ✅ NO ISSUES FOUND

Checked all dynamic tooltip assignments in `player.js`:
- Line 290: `document.title` - uses variable (not hardcoded Russian)
- Line 475: `узКнопка.title = Текст(сПодсказка)` - uses i18n correctly
- Line 3137: `элСсылка.title = Текст("J0148")` - uses i18n correctly
- Line 3149: `title = Текст("A0620")` - uses i18n correctly
- Line 4412: `узСсылка.title = оСсылка.сОписание` - uses data property (likely from API)
- Line 4453: `уз.parentElement.title = Текст(...)` - uses i18n correctly
- Line 4469, 4477: Uses concatenated translated strings

**All JavaScript tooltip assignments use the `Текст()` wrapper which correctly calls `м_i18n.GetMessage()`**

---

## Conclusion

**i18n System Status**: ✅ **INTACT**
**Commit ebf05b5 Impact**: ⚠️ **INCOMPLETE**

The i18n infrastructure was not broken by commit ebf05b5. The issue is that 5 specific tooltip translations were not swapped from Russian to English as intended by the commit message.

**Action Required**: Apply the immediate fix to swap the remaining 5 hardcoded Russian tooltips with their English equivalents (already present in commented form).

---

## Files Checked

- `/home/vercel-sandbox/twitch_alternate_player/player.html` (lines 50-400)
- `/home/vercel-sandbox/twitch_alternate_player/common.js` (lines 366-457)
- `/home/vercel-sandbox/twitch_alternate_player/player.js` (tooltip assignments)
- `/home/vercel-sandbox/twitch_alternate_player/_locales/en/messages.json` (all F05XX and A06XX keys)

**Diagnostic Complete**
