# BUG FIX PLAN #2: Hardcoded Russian Tooltips in HTML

**Priority:** MEDIUM (P2) - Cosmetic issue, does not break functionality
**Estimated Time:** 10-15 minutes
**Risk Level:** VERY LOW (HTML-only changes, no JavaScript)

---

## Executive Summary

Five statistics elements in `player.html` still have hardcoded Russian text in their `title` attributes instead of using the i18n system. While the player functions correctly, these tooltips display in Russian regardless of browser locale.

---

## Root Cause

Commit `ebf05b5` successfully replaced most tooltip translations but **missed 5 elements** that have hardcoded Russian `title` attributes. The English translations exist in the file as commented-out lines but were never activated.

---

## Affected Elements (5 Total)

| Line | Element ID | Current (Russian) | Available (English) |
|------|-----------|-------------------|---------------------|
| 205 | `статистика-преобразованза` | "Время затраченное на преобразование..." | "Time spent converting from TS to MP4..." |
| 211 | `статистика-задержкатрансляции` | "Время между передачей сегмента..." | "Time between the transmission of a segment..." |
| 220 | `статистика-длительностьпросмотра` | "Время, в течение которого..." | "The time during which you watch..." |
| 240 | `статистика-скачано` | "Количество полученных данных..." | "The amount of data received..." |
| 364 | `статистика-исчерпано` | "Счётчик исчерпаний..." | "Counter of buffer underruns..." |

---

## Implementation Steps

### Method 1: Line-by-Line Swap (Recommended)

#### Fix #1: Line 205 (Remux Time)
```html
<!-- BEFORE: -->
<span id=статистика-преобразованза data-очистить="" title="Время затраченное на преобразование из TS в MP4. Зависит от производительности компьютера."></span>

<!-- AFTER: -->
<span id=statistics-remuxtime data-clear="" title="Time spent converting from TS to MP4. Depends on computer performance."></span>
```

#### Fix #2: Line 211 (Stream Delay)
```html
<!-- BEFORE: -->
<span id=статистика-задержкатрансляции data-очистить="" title="Время между передачей сегмента в эфир и его отображением в проигрывателе. Зависит от производительности компьютера и размера буфера проигрывателя."></span>

<!-- AFTER: -->
<span id=statistics-streamdelay data-clear="" title="Time between the transmission of a segment on air and its display in the player. Depends on computer performance and player buffer size."></span>
```

#### Fix #3: Line 220 (Viewing Duration)
```html
<!-- BEFORE: -->
<span id=статистика-длительностьпросмотра title="Время, в течение которого вы смотрите трансляцию. Учитываются только основные сегменты (реклама не учитывается)."></span>

<!-- AFTER: -->
<span id=statistics-viewingduration title="The time during which you watch the broadcast. Only main segments are counted (ads are not counted)."></span>
```

#### Fix #4: Line 240 (Downloaded Size)
```html
<!-- BEFORE: -->
<span id=статистика-скачано data-очистить="" title="Количество полученных данных с момента открытия трансляции."></span>

<!-- AFTER: -->
<span id=statistics-downloaded data-clear="" title="The amount of data received since opening the broadcast."></span>
```

#### Fix #5: Line 364 (Buffer Underruns)
```html
<!-- BEFORE: -->
<span id=статистика-исчерпано title="Счётчик исчерпаний буфера проигрывателя. Исчерпание буфера происходит, когда непросмотренного видео в буфере недостаточно, чтобы продолжить воспроизведение без остановки. При исчерпании буфера воспроизведение останавливается, пока в буфер не будет загружено ещё видео. Также смотрите в статистике "Размер буфера"."></span>

<!-- AFTER: -->
<span id=statistics-bufferunderruns title="Counter of buffer underruns. A buffer underrun occurs when there is not enough unwatched video in the buffer to continue playback without stopping. When the buffer is exhausted, playback stops until more video is loaded into the buffer. Also see the 'Buffer size' statistic."></span>
```

---

## Automated Fix Script

```bash
#!/bin/bash
cd /home/vercel-sandbox/twitch_alternate_player

# Backup
cp player.html player.html.backup.plan2

# Fix line 205 - Remux time
sed -i '205s/id=статистика-преобразованза data-очистить="" title="Время затраченное на преобразование из TS в MP4\. Зависит от производительности компьютера\.">/id=statistics-remuxtime data-clear="" title="Time spent converting from TS to MP4. Depends on computer performance.">/' player.html

# Fix line 211 - Stream delay
sed -i '211s/id=статистика-задержкатрансляции data-очистить="" title="Время между передачей сегмента в эфир и его отображением в проигрывателе\. Зависит от производительности компьютера и размера буфера проигрывателя\.">/id=statistics-streamdelay data-clear="" title="Time between the transmission of a segment on air and its display in the player. Depends on computer performance and player buffer size.">/' player.html

# Fix line 220 - Viewing duration  
sed -i '220s/id=статистика-длительностьпросмотра title="Время, в течение которого вы смотрите трансляцию\. Учитываются только основные сегменты (реклама не учитывается)\.">/id=statistics-viewingduration title="The time during which you watch the broadcast. Only main segments are counted (ads are not counted).">/' player.html

# Fix line 240 - Downloaded size
sed -i '240s/id=статистика-скачано data-очистить="" title="Количество полученных данных с момента открытия трансляции\.">/id=statistics-downloaded data-clear="" title="The amount of data received since opening the broadcast.">/' player.html

# Fix line 364 - Buffer underruns
sed -i '364s/id=статистика-исчерпано title="Счётчик исчерпаний буфера проигрывателя.*">/id=statistics-bufferunderruns title="Counter of buffer underruns. A buffer underrun occurs when there is not enough unwatched video in the buffer to continue playback without stopping. When the buffer is exhausted, playback stops until more video is loaded into the buffer. Also see the \x27Buffer size\x27 statistic.">/' player.html

echo "✓ All 5 tooltips fixed"
```

---

## Verification Steps

### Step 1: Verify No Hardcoded Russian Tooltips
```bash
# Check these 5 IDs have English tooltips
grep -n "id=statistics-remuxtime\|id=statistics-streamdelay\|id=statistics-viewingduration\|id=statistics-downloaded\|id=statistics-bufferunderruns" player.html
```
**Expected:** 5 lines showing English IDs with English title attributes

### Step 2: Manual Visual Check
Open `player.html` and verify lines 205, 211, 220, 240, 364 have:
- English element IDs
- English `title` attributes
- No Cyrillic characters

---

## Testing Checklist

1. Load extension
2. Open Twitch stream  
3. Press **S** to open statistics
4. Hover mouse over each of these 5 fields:
   - Remux time (преобразование)
   - Stream delay (задержка)
   - Viewing duration (продолжительность)
   - Downloaded size (скачано)
   - Buffer underruns (исчерпано)
5. **Verify:** Tooltips display in English

---

## Git Commit

```bash
git add player.html
git commit -m "$(cat <<'EOF'
fix(player.html): replace 5 remaining hardcoded Russian tooltips with English

Commit ebf05b5 missed 5 elements that still had hardcoded Russian text in 
title attributes. These are now replaced with English tooltips.

Updated tooltips for:
- statistics-remuxtime (line 205)
- statistics-streamdelay (line 211)
- statistics-viewingduration (line 220)
- statistics-downloaded (line 240)
- statistics-bufferunderruns (line 364)

Completes: English tooltip translation started in ebf05b5

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>
EOF
)"

git push origin HEAD
```

---

## Success Criteria

- ✅ All 5 elements have English IDs
- ✅ All 5 elements have English tooltips
- ✅ No Cyrillic in title attributes for these 5
- ✅ Tooltips display correctly on hover
- ✅ No functionality broken

---

**Document Version:** 1.0  
**Created:** 2026-07-07  
**Status:** READY FOR IMPLEMENTATION (after Plan #1)
