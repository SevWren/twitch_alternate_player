# FORENSIC ANALYSIS: Partial ID Translation in Commit ebf05b5

**Investigation Date:** 2026-07-07
**Commit:** ebf05b5121b9643cf4f75a4e6caee7a5fceb6def
**Commit Message:** "Replace all Russian tooltip text with English in statistics overlay"

---

## EXECUTIVE SUMMARY

Commit ebf05b5 performed a **partial and inconsistent translation** of HTML element IDs in the statistics overlay. Despite claiming to have replaced "all Russian tooltip text", the commit:

1. ✅ Successfully translated **9 element IDs** from Russian to English
2. ❌ Left **23 element IDs** in Russian (untranslated)
3. ⚠️ **CRITICAL BUG:** Created HTML/JavaScript mismatch - 2 IDs changed in HTML but player.js still references Russian names, causing `getElementById()` to return null

**Impact:** Statistics overlay is partially broken. Video compression and server info fields will fail to populate.

---

## ROOT CAUSE ANALYSIS

### What Commit ebf05b5 Actually Did

The commit **only uncommented pre-existing English ID translations** that were already present as HTML comments. It did NOT:
- Create new translations for the remaining 23 IDs
- Update player.js references to match the changed IDs
- Verify that all English translations were complete

**Pattern observed in git diff:**
```html
<!-- BEFORE (Russian active, English commented) -->
<span id=статистика-сжатиевидео title="Russian tooltip"></span>
<!-- <span id=statistics-videocompression title="English tooltip"></span> -->

<!-- AFTER (English active, Russian commented) -->
<!-- <span id=статистика-сжатиевидео title="Russian tooltip"></span> -->
<span id=statistics-videocompression title="English tooltip"></span>
```

### Why Only 9 IDs Were Translated

Only 9 elements had **pre-existing English comment placeholders** in player.html. The original developer apparently started translating analysis-related table rows (`<tr>` elements inside `<table class=статистика-анализ>`), created commented English versions, but never completed the full translation or updated JavaScript references.

**The 9 translated IDs:**
- statistics-videocompression (was: статистика-сжатиевидео)
- statistics-server (was: статистика-сервер)
- statistics-updateinterval (was: статистика-интервалобновления)
- statistics-segmentsadded (was: статистика-сегментовдобавлено)
- statistics-secondsadded (was: статистика-секунддобавлено)
- statistics-segmentthickness (was: статистика-толщинасегмента)
- statistics-channelthickness (was: статистика-толщинаканала)
- statistics-responsewait (was: статистика-ожиданиеответа)
- statistics-unwatched (was: статистика-непросмотрено)

**The other 23 IDs had NO pre-existing English translations**, so they remained Russian.

---

## CRITICAL FINDINGS

### 1. BROKEN JAVASCRIPT REFERENCES (2 IDs)

These IDs were changed in HTML but `player.js` still uses the old Russian names:

| Russian ID | English ID (active in HTML) | player.js References | Impact |
|-----------|----------------------------|---------------------|---------|
| **статистика-сжатиевидео** | **statistics-videocompression** | Lines 1846, 1995, 2000 | Video compression info won't display |
| **статистика-сервер** | **statistics-server** | Line 1865 | Server hostname won't display |

**Code locations:**
```javascript
// Line 1846
Узел("статистика-сжатиевидео").textContent,

// Line 1865
Узел("статистика-сервер").textContent = new URL(

// Line 1995
Узел("статистика-сжатиевидео").textContent = сСжатиеВидео;

// Line 2000
Узел("статистика-сжатиевидео").textContent = "—";
```

These calls will return `null` because the HTML element now has id=`statistics-videocompression` instead of id=`статистика-сжатиевидео`.

### 2. SUCCESSFULLY TRANSLATED BUT UNREFERENCED (7 IDs)

These `<tr>` elements were translated but are NEVER directly referenced in player.js by `getElementById()` or `Узел()`:

- statistics-updateinterval
- statistics-segmentsadded
- statistics-secondsadded
- statistics-segmentthickness
- statistics-channelthickness
- statistics-responsewait
- statistics-unwatched

**Reason:** These are populated dynamically by `Анализ` objects (player.js lines 1656-1686), which use the `<tr>` elements' DOM references stored during initialization, not by querying IDs. The translation is safe but provides no functional benefit.

### 3. HIGH-VALUE UNTRANSLATED IDs (14 IDs)

These remain Russian despite:
- Having English translation comments available in HTML
- Being actively referenced in player.js (total of 31 references)

| Russian ID | English ID (commented) | player.js Lines | Reference Count |
|-----------|----------------------|----------------|----------------|
| статистика-разрешениевидео | statistics-videoresolution | 1844, 1997, 2001 | 3 |
| статистика-частотакадров | statistics-framerate | 2003, 2068 | 2 |
| статистика-сжатиезвука | statistics-audiocompression | 1847, 2005, 2012 | 3 |
| статистика-битрейтзвука | statistics-audiobitrate | 2014, 2076 | 2 |
| статистика-список | statistics-list | 1873 | 1 |
| статистика-targetduration | statistics-targetduration | 1877 | 1 |
| статистика-преобразованза | statistics-convertedin | 2081 | 1 |
| статистика-задержкатрансляции | statistics-streamdelay | 4323, 4337, 5355 | 3 |
| статистика-длительностьпросмотра | statistics-viewingduration | 1591 | 1 |
| статистика-количестворекламы | statistics-adcount | 1691, 2147 | 2 |
| статистика-частотарекламы | statistics-adfrequency | 1692, 2148, 2159 | 3 |
| статистика-скачано | statistics-downloaded | 1916 | 1 |
| статистика-забракованных | statistics-rejected | 1695 | 1 |
| статистика-исходных | statistics-source | 1693, 1898 | 2 |
| статистика-незагруженныхсегментов | statistics-undownloadedsegments | 1709, 1822, 1953, 1967 | 4 |

---

## COMPLETE ELEMENT INVENTORY (All 32 Statistics IDs)

### Current Status in player.html

| Line | Russian ID | English ID (target) | HTML Status | JS References | Priority |
|------|-----------|-------------------|-------------|---------------|----------|
| 57 | статистика-разрешениевидео | statistics-videoresolution | Russian (active) | 3 | HIGH |
| 59 | статистика-частотакадров | statistics-framerate | Russian (active) | 2 | HIGH |
| 68 | ~~статистика-сжатиевидео~~ | **statistics-videocompression** | **English (BROKEN)** | **3** | **CRITICAL** |
| 79 | статистика-сжатиезвука | statistics-audiocompression | Russian (active) | 3 | HIGH |
| 81 | статистика-битрейтзвука | statistics-audiobitrate | Russian (active) | 2 | HIGH |
| 90 | ~~статистика-сервер~~ | **statistics-server** | **English (BROKEN)** | **1** | **CRITICAL** |
| 98 | статистика-список | statistics-list | Russian (active) | 1 | HIGH |
| 102 | статистика-targetduration | statistics-targetduration | Russian (active) | 1 | HIGH |
| 118 | статистика-очередь | statistics-queue | Russian (active) | 0 | LOW |
| 136 | ~~статистика-интервалобновления~~ | statistics-updateinterval | English (OK) | 0 (Анализ) | MEDIUM |
| 142 | ~~статистика-сегментовдобавлено~~ | statistics-segmentsadded | English (OK) | 0 (Анализ) | MEDIUM |
| 146 | ~~статистика-секунддобавлено~~ | statistics-secondsadded | English (OK) | 0 (Анализ) | MEDIUM |
| 164 | ~~статистика-толщинасегмента~~ | statistics-segmentthickness | English (OK) | 0 (Анализ) | MEDIUM |
| 169 | ~~статистика-толщинаканала~~ | statistics-channelthickness | English (OK) | 0 (Анализ) | MEDIUM |
| 177 | ~~статистика-ожиданиеответа~~ | statistics-responsewait | English (OK) | 0 (Анализ) | MEDIUM |
| 195 | ~~статистика-непросмотрено~~ | statistics-unwatched | English (OK) | 0 (Анализ) | MEDIUM |
| 205 | статистика-преобразованза | statistics-convertedin | Russian (active) | 1 | HIGH |
| 211 | статистика-задержкатрансляции | statistics-streamdelay | Russian (active) | 3 | HIGH |
| 220 | статистика-длительностьпросмотра | statistics-viewingduration | Russian (active) | 1 | HIGH |
| 227 | статистика-количестворекламы | statistics-adcount | Russian (active) | 2 | HIGH |
| 231 | статистика-частотарекламы | statistics-adfrequency | Russian (active) | 3 | HIGH |
| 240 | статистика-скачано | statistics-downloaded | Russian (active) | 1 | HIGH |
| 251 | статистика-пропущено | statistics-skipped | Russian (active) | 0 | LOW |
| 269 | статистика-потерьвидео | statistics-videoloss | Russian (active) | 0 | LOW |
| 273 | статистика-потерьзвука | statistics-audioloss | Russian (active) | 0 | LOW |
| 277 | статистика-забракованных | statistics-rejected | Russian (active) | 1 | HIGH |
| 281 | статистика-исходных | statistics-source | Russian (active) | 2 | HIGH |
| 320 | статистика-ошибокзагрузки | statistics-loaderrors | Russian (active) | 0 | LOW |
| 324 | статистика-пропущенныхсегментов | statistics-skippedsegments | Russian (active) | 0 | LOW |
| 328 | статистика-незагруженныхсегментов | statistics-undownloadedsegments | Russian (active) | 4 | HIGH |
| 352 | статистика-переполнено | statistics-overflowed | Russian (active) | 0 | LOW |
| 364 | статистика-исчерпано | statistics-exhausted | Russian (active) | 0 | LOW |

**Legend:**
- **CRITICAL**: ID changed in HTML but player.js not updated (broken)
- **HIGH**: Actively referenced in player.js (needs synchronized translation)
- **MEDIUM**: Already translated, populated by Анализ objects (verify functionality)
- **LOW**: Display-only, no JavaScript references

---

## WHY THIS HAPPENED

### Hypothesis: Three-Stage Incomplete Work

1. **Stage 1 (Original developer):** Created English comment placeholders for 9 analysis-related `<tr>` elements, intending to translate later
2. **Stage 2 (Never completed):** Never finished translating the remaining 23 IDs or updating player.js
3. **Stage 3 (Commit ebf05b5):** Blindly activated all commented English translations without:
   - Verifying JavaScript compatibility
   - Checking for complete coverage
   - Testing functionality

The commit author likely searched for `<!-- <span id=statistics-` and uncommented everything found, assuming it was complete.

---

## COMPLETE MAPPING TABLE (All 32 IDs)

| Russian ID | English ID | HTML Line | player.js Lines | Translation Status |
|-----------|-----------|-----------|----------------|-------------------|
| статистика-разрешениевидео | statistics-videoresolution | 57 | 1844, 1997, 2001 | ❌ Untranslated |
| статистика-частотакадров | statistics-framerate | 59 | 2003, 2068 | ❌ Untranslated |
| **статистика-сжатиевидео** | **statistics-videocompression** | 68 | **1846, 1995, 2000** | ⚠️ **BROKEN** |
| статистика-сжатиезвука | statistics-audiocompression | 79 | 1847, 2005, 2012 | ❌ Untranslated |
| статистика-битрейтзвука | statistics-audiobitrate | 81 | 2014, 2076 | ❌ Untranslated |
| **статистика-сервер** | **statistics-server** | 90 | **1865** | ⚠️ **BROKEN** |
| статистика-список | statistics-list | 98 | 1873 | ❌ Untranslated |
| статистика-targetduration | statistics-targetduration | 102 | 1877 | ❌ Untranslated |
| статистика-очередь | statistics-queue | 118 | - | ❌ Untranslated |
| статистика-интервалобновления | statistics-updateinterval | 136 | (Анализ) | ✅ Translated |
| статистика-сегментовдобавлено | statistics-segmentsadded | 142 | (Анализ) | ✅ Translated |
| статистика-секунддобавлено | statistics-secondsadded | 146 | (Анализ) | ✅ Translated |
| статистика-толщинасегмента | statistics-segmentthickness | 164 | (Анализ) | ✅ Translated |
| статистика-толщинаканала | statistics-channelthickness | 169 | (Анализ) | ✅ Translated |
| статистика-ожиданиеответа | statistics-responsewait | 177 | (Анализ) | ✅ Translated |
| статистика-непросмотрено | statistics-unwatched | 195 | (Анализ) | ✅ Translated |
| статистика-преобразованза | statistics-convertedin | 205 | 2081 | ❌ Untranslated |
| статистика-задержкатрансляции | statistics-streamdelay | 211 | 4323, 4337, 5355 | ❌ Untranslated |
| статистика-длительностьпросмотра | statistics-viewingduration | 220 | 1591 | ❌ Untranslated |
| статистика-количестворекламы | statistics-adcount | 227 | 1691, 2147 | ❌ Untranslated |
| статистика-частотарекламы | statistics-adfrequency | 231 | 1692, 2148, 2159 | ❌ Untranslated |
| статистика-скачано | statistics-downloaded | 240 | 1916 | ❌ Untranslated |
| статистика-пропущено | statistics-skipped | 251 | - | ❌ Untranslated |
| статистика-потерьвидео | statistics-videoloss | 269 | - | ❌ Untranslated |
| статистика-потерьзвука | statistics-audioloss | 273 | - | ❌ Untranslated |
| статистика-забракованных | statistics-rejected | 277 | 1695 | ❌ Untranslated |
| статистика-исходных | statistics-source | 281 | 1693, 1898 | ❌ Untranslated |
| статистика-ошибокзагрузки | statistics-loaderrors | 320 | - | ❌ Untranslated |
| статистика-пропущенныхсегментов | statistics-skippedsegments | 324 | - | ❌ Untranslated |
| статистика-незагруженныхсегментов | statistics-undownloadedsegments | 328 | 1709, 1822, 1953, 1967 | ❌ Untranslated |
| статистика-переполнено | statistics-overflowed | 352 | - | ❌ Untranslated |
| статистика-исчерпано | statistics-exhausted | 364 | - | ❌ Untranslated |

**Summary:**
- ✅ **9 translated** (7 OK, 2 broken)
- ❌ **23 untranslated**
- **Total:** 32 statistics element IDs

---

## RECOMMENDATIONS

### Immediate Action Required

**Revert the 2 broken IDs** to restore functionality:

```bash
# In player.html, comment out the English IDs and uncomment Russian IDs for:
# Line 68: statistics-videocompression → статистика-сжатиевидео
# Line 90: statistics-server → статистика-сервер
```

### Complete Translation Strategy

For each ID, create **one atomic commit** that updates:
1. HTML element ID (uncomment English, comment Russian)
2. ALL player.js references (`getElementById()` and `Узел()` calls)
3. Any player.css selectors (if any)

**Priority order:**
1. **Fix broken (2 IDs):** Revert or fix player.js references
2. **High priority (14 IDs):** Actively referenced in player.js
3. **Medium priority (7 IDs):** Already translated, verify functionality
4. **Low priority (9 IDs):** Display-only, no JS references

### Files Requiring Changes

| File | Path | Changes Needed |
|------|------|----------------|
| player.html | `/home/vercel-sandbox/twitch_alternate_player/player.html` | Uncomment English IDs (already present) |
| player.js | `/home/vercel-sandbox/twitch_alternate_player/player.js` | Update ~31 `getElementById()` and `Узел()` calls |
| player.css | `/home/vercel-sandbox/twitch_alternate_player/player.css` | Check for ID-based selectors (unlikely) |

---

## APPENDIX: player.js Reference Locations

### Broken References (Require Immediate Fix)
```javascript
// статистика-сжатиевидео (now statistics-videocompression in HTML)
Line 1846: Узел("статистика-сжатиевидео").textContent,
Line 1995: Узел("статистика-сжатиевидео").textContent = сСжатиеВидео;
Line 2000: Узел("статистика-сжатиевидео").textContent = "—";

// статистика-сервер (now statistics-server in HTML)
Line 1865: Узел("статистика-сервер").textContent = new URL(
```

### High-Priority References (Require Synchronized Translation)
```javascript
// статистика-разрешениевидео
Line 1844: Узел("статистика-разрешениевидео").textContent +
Line 1997: "статистика-разрешениевидео"
Line 2001: Узел("статистика-разрешениевидео").textContent = "—";

// статистика-частотакадров
Line 2003: Узел("статистика-частотакадров").textContent = "";
Line 2068: "статистика-частотакадров",

// статистика-сжатиезвука
Line 1847: ПараметрыЗвука: Узел("статистика-сжатиезвука").textContent,
Line 2005: Узел("статистика-сжатиезвука").textContent =
Line 2012: Узел("статистика-сжатиезвука").textContent = "—";

// ...and 11 more high-priority IDs (see mapping table)
```

---

**End of Report**
