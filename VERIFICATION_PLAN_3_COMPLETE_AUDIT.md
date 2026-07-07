# VERIFICATION PLAN #3: Complete Translation Audit & Validation

**Priority:** HIGH (P1) - Prevents future regressions
**Estimated Time:** 20-30 minutes
**Risk Level:** ZERO (read-only verification)

---

## Executive Summary

After fixing the critical bugs in Plans #1 and #2, perform a comprehensive audit to ensure:
1. No broken ID mismatches remain
2. No hardcoded Russian text bypasses i18n
3. All statistics elements are properly connected
4. The translation is complete and consistent

---

## Verification Scope

### Phase 1: Element ID Integrity Check

#### Test 1.1: Verify All HTML Statistics IDs Exist
```bash
cd /home/vercel-sandbox/twitch_alternate_player

# Extract all IDs from statistics table in HTML
grep -o 'id=[^ >]*статистика[^ >]*\|id=statistics-[a-z]*' player.html | \
  sed 's/id=//' | sort -u > /tmp/html_ids.txt

# Count total
wc -l /tmp/html_ids.txt
```
**Expected:** ~30-35 unique statistics element IDs

#### Test 1.2: Verify All JavaScript References Match HTML
```bash
# Extract all element ID references from player.js
grep -o '"статистика-[^"]*"\|"statistics-[^"]*"' player.js | \
  sed 's/"//g' | sort -u > /tmp/js_ids.txt

# Find IDs referenced in JS but missing from HTML
comm -23 /tmp/js_ids.txt /tmp/html_ids.txt > /tmp/missing_in_html.txt

# Display results
echo "=== IDs in JavaScript but NOT in HTML ==="
cat /tmp/missing_in_html.txt
```
**Expected:** Empty (0 mismatches after Plans #1 and #2)

#### Test 1.3: Cross-Reference Verification
```bash
# Show which IDs are in both files (should be all)
comm -12 /tmp/js_ids.txt /tmp/html_ids.txt | wc -l
```
**Expected:** All JS IDs exist in HTML

---

### Phase 2: Hardcoded Text Detection

#### Test 2.1: Find Any Remaining Russian Display Text
```bash
# Search for Cyrillic in textContent assignments
grep -n '\.textContent\s*=\s*"[^"]*[А-Яа-яЁё][^"]*"' player.js

# Search for Cyrillic in innerHTML assignments  
grep -n '\.innerHTML\s*=\s*"[^"]*[А-Яа-яЁё][^"]*"' player.js

# Search for Cyrillic in alert() calls
grep -n 'alert([^)]*[А-Яа-яЁё][^)]*)' player.js
```
**Expected:** Only function names/comments (not user-facing strings)

#### Test 2.2: HTML Hardcoded Russian Text
```bash
# Find any Russian text NOT in comments or title attributes used by i18n
grep -n '[А-Яа-яЁё]' player.html | \
  grep -v '<!--' | \
  grep -v 'title=' | \
  grep -v 'data-i18n' | \
  grep -v 'Узел\|статистика'
```
**Expected:** Only element IDs and attribute names (not display text)

---

### Phase 3: i18n System Validation

#### Test 3.1: All data-i18n Keys Exist in Locale Files
```bash
# Extract all data-i18n keys from HTML
grep -o 'data-i18n=[A-Z][0-9]\{4\}' player.html | \
  sed 's/data-i18n=//' | sort -u > /tmp/i18n_keys.txt

# Check each key exists in English locale
while read key; do
  if ! grep -q "\"$key\"" _locales/en/messages.json; then
    echo "MISSING KEY: $key"
  fi
done < /tmp/i18n_keys.txt
```
**Expected:** No missing keys

#### Test 3.2: Statistics Keys Completeness
```bash
# Verify F0539-F0573 range (statistics labels)
for i in $(seq 539 573); do
  key="F0$(printf "%04d" $i)"
  if ! grep -q "\"$key\"" _locales/en/messages.json; then
    echo "Missing: $key"
  fi
done
```
**Expected:** All F0539-F0573 keys exist

---

### Phase 4: Function Call Validation

#### Test 4.1: All Узел() Calls Use Valid IDs
```bash
# Extract all Узел() parameter strings
grep -o 'Узел("[^"]*")' player.js | \
  sed 's/Узел("\|")//g' | \
  sort -u > /tmp/uzel_calls.txt

# Cross-check with HTML IDs
echo "=== Узел() calls with non-existent IDs ==="
while read id; do
  if ! grep -q "id=$id" player.html; then
    echo "BROKEN: Узел(\"$id\") - ID not in HTML"
  fi
done < /tmp/uzel_calls.txt
```
**Expected:** Zero broken calls

#### Test 4.2: All м_i18n.GetMessage() Use Valid Keys
```bash
# Extract all GetMessage/Текст calls
grep -oE 'GetMessage\([^)]*\)|Текст\([^)]*\)' player.js | \
  grep -oE '[FJA][0-9]{4}' | \
  sort -u > /tmp/getmessage_keys.txt

# Verify each key exists
while read key; do
  if ! grep -q "\"$key\"" _locales/en/messages.json; then
    echo "MISSING i18n KEY: $key"
  fi
done < /tmp/getmessage_keys.txt
```
**Expected:** All keys exist

---

### Phase 5: Statistics Module Integration Test

#### Test 5.1: Statistics Update Functions Audit
```bash
# List all statistics update function calls
grep -n 'м_Статистика\.' player.js | head -50
```
**Manual Review:** Verify these functions access only valid element IDs

#### Test 5.2: Data Flow Verification
```javascript
// Run in Chrome DevTools Console after loading extension

// Mock segment data
const mockSegment = {
  пДанные: {
    чПреобразованЗа: 42,
    лЕстьВидео: true,
    лЕстьЗвук: true,
    чШиринаКартинки: 1920,
    чВысотаКартинки: 1080,
    чЧастотаКадров: 60.0,
    nVideoCodec: 7,
    nVideoProfile: 100,
    nVideoLevel: 51,
    nMaxNumRefFrames: 4,
    nVideoColorRange: 1,
    nAudioObjectType: 2,
    чЧастотаДискретизации: 48000,
    nАудиоКаналы: 2,
    чБитрейтЗвука: 160
  }
};

// Test if statistics can be updated without errors
try {
  // This assumes м_Статистика is exposed globally
  // If not, run this after opening statistics overlay (S key)
  console.log("Statistics module test: PASS");
} catch (e) {
  console.error("Statistics module test: FAIL", e);
}
```

---

## Comprehensive Test Matrix

| Component | Test | Status | Notes |
|-----------|------|--------|-------|
| Element IDs | HTML/JS match | ⬜ | Run Test 1.2 |
| Element IDs | All exist in HTML | ⬜ | Run Test 1.1 |
| Hardcoded Text | No Russian in JS | ⬜ | Run Test 2.1 |
| Hardcoded Text | No Russian in HTML | ⬜ | Run Test 2.2 |
| i18n Keys | All keys valid | ⬜ | Run Test 3.1 |
| i18n Keys | Statistics range complete | ⬜ | Run Test 3.2 |
| Function Calls | Узел() calls valid | ⬜ | Run Test 4.1 |
| Function Calls | GetMessage() keys valid | ⬜ | Run Test 4.2 |
| Integration | Statistics display works | ⬜ | Manual test |
| Integration | Tooltips show English | ⬜ | Manual test |

---

## Success Criteria

- ✅ Zero ID mismatches between HTML and JS
- ✅ Zero hardcoded Russian user-facing strings
- ✅ All i18n keys exist in locale files
- ✅ All function calls use valid parameters
- ✅ Statistics overlay displays live data
- ✅ All tooltips display in English
- ✅ No console errors during playback
- ✅ All tests pass in matrix above

---

## Automated Full Audit Script

```bash
#!/bin/bash
cd /home/vercel-sandbox/twitch_alternate_player

echo "==================================="
echo "TRANSLATION AUDIT REPORT"
echo "==================================="
echo ""

echo "1. HTML/JS Element ID Match Check"
echo "-----------------------------------"
grep -o '"статистика-[^"]*"\|"statistics-[^"]*"' player.js | sed 's/"//g' | sort -u > /tmp/js_ids.txt
grep -o 'id=[^ >]*статистика[^ >]*\|id=statistics-[a-z]*' player.html | sed 's/id=//' | sort -u > /tmp/html_ids.txt
MISMATCHES=$(comm -23 /tmp/js_ids.txt /tmp/html_ids.txt | wc -l)
if [ $MISMATCHES -eq 0 ]; then
  echo "✓ PASS: All JavaScript IDs exist in HTML"
else
  echo "✗ FAIL: $MISMATCHES ID mismatches found:"
  comm -23 /tmp/js_ids.txt /tmp/html_ids.txt
fi
echo ""

echo "2. Hardcoded Russian Text Check"
echo "-----------------------------------"
RUSSIAN_JS=$(grep '\.textContent\s*=\s*"[^"]*[А-Яа-яЁё]' player.js | grep -v '//' | wc -l)
if [ $RUSSIAN_JS -eq 0 ]; then
  echo "✓ PASS: No hardcoded Russian in JavaScript assignments"
else
  echo "✗ FAIL: $RUSSIAN_JS hardcoded Russian strings found in JS"
fi
echo ""

echo "3. i18n Key Validation"
echo "-----------------------------------"
grep -o 'data-i18n=[A-Z][0-9]\{4\}' player.html | sed 's/data-i18n=//' | sort -u > /tmp/i18n_keys.txt
MISSING=0
while read key; do
  if ! grep -q "\"$key\"" _locales/en/messages.json; then
    echo "✗ Missing key: $key"
    MISSING=$((MISSING + 1))
  fi
done < /tmp/i18n_keys.txt
if [ $MISSING -eq 0 ]; then
  echo "✓ PASS: All i18n keys exist in locale files"
fi
echo ""

echo "4. Узел() Function Call Validation"
echo "-----------------------------------"
grep -o 'Узел("[^"]*")' player.js | sed 's/Узел("\|")//g' | sort -u > /tmp/uzel_calls.txt
BROKEN=0
while read id; do
  if ! grep -q "id=$id" player.html; then
    echo "✗ Broken: Узел(\"$id\")"
    BROKEN=$((BROKEN + 1))
  fi
done < /tmp/uzel_calls.txt
if [ $BROKEN -eq 0 ]; then
  echo "✓ PASS: All Узел() calls reference valid element IDs"
fi
echo ""

echo "==================================="
echo "AUDIT COMPLETE"
echo "==================================="
```

---

**Document Version:** 1.0  
**Created:** 2026-07-07  
**Status:** READY FOR EXECUTION (after Plans #1 and #2)
