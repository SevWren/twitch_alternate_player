# TESTING PLAN #4: Integration & End-to-End Testing

**Priority:** CRITICAL (P0) - Must verify fixes work
**Estimated Time:** 30-45 minutes
**Risk Level:** ZERO (testing only, no code changes)

---

## Executive Summary

After implementing Plans #1, #2, and #3, perform comprehensive integration and end-to-end testing to verify:
1. Player loads and initializes without errors
2. Statistics overlay displays all data correctly
3. No regressions in existing functionality
4. English translations are complete and accurate

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Ensure all fixes are applied
cd /home/vercel-sandbox/twitch_alternate_player
git status  # Should show clean or staged changes

# 2. Verify Chrome is installed
google-chrome --version || chromium --version

# 3. Load extension
# - Open chrome://extensions
# - Enable "Developer mode"
# - Click "Load unpacked"
# - Select /home/vercel-sandbox/twitch_alternate_player
```

---

## Test Suite 1: Smoke Tests (5 minutes)

### Test 1.1: Extension Loads Without Errors
**Steps:**
1. Load extension in Chrome
2. Open DevTools Console (F12)
3. Navigate to any Twitch channel page

**Expected:**
- No red errors in console
- Extension icon appears in toolbar
- Page redirects to player.html

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 1.2: Player Initializes
**Steps:**
1. Wait for player to load (~2-5 seconds)
2. Check console for errors

**Expected:**
- Video starts playing
- Controls visible
- No "TypeError" or "null" errors

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 1.3: Statistics Overlay Opens
**Steps:**
1. Press **S** key
2. Observe statistics panel

**Expected:**
- Panel slides in from right side
- No console errors
- No "undefined" or "null" in display

**Status:** ⬜ PASS / ⬜ FAIL

---

## Test Suite 2: Element ID Verification (10 minutes)

### Test 2.1: Fixed Element IDs Display Data

**Elements to verify (after ~10 seconds):**

| Element | Expected Display | Status |
|---------|------------------|--------|
| Video compression | H264 High 5.1, limited, 60fps | ⬜ |
| Server hostname | video-edge-abc123.fra01.abs.hls.ttvnw.net | ⬜ |
| Update interval | 2.0 < 2.5 < 3.0 [table] | ⬜ |
| Segments added | 1 < 1.2 < 2 [table] | ⬜ |
| Seconds added | 2.0 < 2.4 < 3.0 [table] | ⬜ |
| Stream bitrate | 4.5 < 5.2 < 6.0 Mbit/s [table] | ⬜ |
| Download speed | 8.0 < 10.5 < 15.0 Mbit/s [table] | ⬜ |
| Response time | 0.05 < 0.08 < 0.12 s [table] | ⬜ |
| Buffer fullness | 3.5 < 4.2 < 5.0 s [table] | ⬜ |

**Pass Criteria:** All 9 elements show live data (not "—")

---

### Test 2.2: Unchanged Russian IDs Still Work

**Elements to verify:**

| Element ID | Expected Display | Status |
|-----------|------------------|--------|
| статистика-разрешениевидео | 1920x1080 | ⬜ |
| статистика-частотакадров | 60.00 fps | ⬜ |
| статистика-сжатиезвука | AAC-LC 48000 Hz 2ch | ⬜ |
| статистика-битрейтзвука | 160 kbit/s | ⬜ |

**Pass Criteria:** All 4 elements show live data

---

## Test Suite 3: Tooltip Verification (5 minutes)

### Test 3.1: Fixed Tooltips Display English

**Hover mouse over each element and verify English tooltip:**

| Element | Tooltip Starts With | Status |
|---------|---------------------|--------|
| Video resolution | "Source video width X..." | ⬜ |
| Video compression | "Video compression parameters..." | ⬜ |
| Audio compression | "Audio compression parameters..." | ⬜ |
| Server | "The server from which..." | ⬜ |
| Playlist | "Number of segments in the list..." | ⬜ |
| Queue | "Video duration at different..." | ⬜ |
| Update interval | "Interval between playlist downloads..." | ⬜ |
| Segments added | "Number of new segments..." | ⬜ |
| Seconds added | "Duration of new segments..." | ⬜ |
| Stream bitrate | "Sum of bitrates of video..." | ⬜ |
| Download speed | "Segment download speed..." | ⬜ |
| Response time | "The time elapsed from..." | ⬜ |
| Remux time | "Time spent converting..." | ⬜ |
| Stream delay | "Time between the transmission..." | ⬜ |
| Viewing duration | "The time during which you watch..." | ⬜ |
| Downloaded size | "The amount of data received..." | ⬜ |
| Buffer underruns | "Counter of buffer underruns..." | ⬜ |

**Pass Criteria:** All tooltips display in English (no Russian)

---

## Test Suite 4: Functional Regression (10 minutes)

### Test 4.1: Video Playback
**Steps:**
1. Play video for 30 seconds
2. Pause and resume
3. Skip forward 10 seconds
4. Skip backward 10 seconds

**Expected:**
- Smooth playback
- No buffering issues
- Seek works correctly

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 4.2: Quality Selection
**Steps:**
1. Open settings panel
2. Change quality (e.g., 1080p → 720p)
3. Verify statistics update

**Expected:**
- Video quality changes
- Statistics reflect new resolution
- No playback interruption

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 4.3: Statistics Accuracy
**Steps:**
1. Open statistics (S key)
2. Watch for 60 seconds
3. Observe counter updates

**Expected:**
- Viewing duration increments
- Downloaded size increases
- Buffer fullness fluctuates normally
- All analysis tables populate

**Status:** ⬜ PASS / ⬜ FAIL

---

## Test Suite 5: Error Handling (5 minutes)

### Test 5.1: Network Interruption
**Steps:**
1. Play video
2. Throttle network to "Slow 3G" in DevTools
3. Observe statistics overlay

**Expected:**
- Player handles buffering gracefully
- Error counters increment
- No console errors

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 5.2: Ad Segment Handling
**Steps:**
1. Wait for ad segments (if any)
2. Check statistics during ad playback

**Expected:**
- Statistics continue updating
- No null reference errors
- Ad segments counted separately

**Status:** ⬜ PASS / ⬜ FAIL

---

## Test Suite 6: Browser Compatibility (10 minutes)

### Test 6.1: Chrome (Primary)
**Version:** Chrome 120+
**Status:** ⬜ PASS / ⬜ FAIL

### Test 6.2: Edge (Secondary)
**Version:** Edge 120+
**Status:** ⬜ PASS / ⬜ FAIL / ⬜ SKIP

---

## Test Suite 7: Locale Testing (5 minutes)

### Test 7.1: English Locale
**Steps:**
1. Set Chrome language to English (chrome://settings/languages)
2. Reload extension
3. Open player and statistics

**Expected:**
- All UI text in English
- All tooltips in English

**Status:** ⬜ PASS / ⬜ FAIL

---

### Test 7.2: Russian Locale (Regression)
**Steps:**
1. Set Chrome language to Russian
2. Reload extension
3. Open player and statistics

**Expected:**
- UI text in Russian (from _locales/ru/messages.json)
- Tooltips should be English (per our fixes)
- No mixed language displays

**Status:** ⬜ PASS / ⬜ FAIL

---

## Automated Test Script

```bash
#!/bin/bash

echo "======================================"
echo "AUTOMATED INTEGRATION TEST SUITE"
echo "======================================"
echo ""

cd /home/vercel-sandbox/twitch_alternate_player

echo "Test 1: Syntax Validation"
echo "--------------------------------------"
node -c common.js && echo "✓ common.js: Valid" || echo "✗ common.js: FAIL"
node -c player.js && echo "✓ player.js: Valid" || echo "✗ player.js: FAIL"
echo ""

echo "Test 2: Element ID Verification"
echo "--------------------------------------"
echo "Checking for broken ID references..."
BROKEN=$(grep -o 'Узел("[^"]*")' player.js | sed 's/Узел("\|")//g' | while read id; do
  if ! grep -q "id=$id" player.html; then
    echo "$id"
  fi
done | wc -l)

if [ $BROKEN -eq 0 ]; then
  echo "✓ All element IDs valid"
else
  echo "✗ FAIL: $BROKEN broken ID references found"
fi
echo ""

echo "Test 3: i18n Key Check"
echo "--------------------------------------"
MISSING=0
grep -o 'data-i18n=[A-Z][0-9]\{4\}' player.html | sed 's/data-i18n=//' | sort -u | while read key; do
  if ! grep -q "\"$key\"" _locales/en/messages.json; then
    echo "✗ Missing key: $key"
    MISSING=$((MISSING + 1))
  fi
done

if [ $MISSING -eq 0 ]; then
  echo "✓ All i18n keys present"
fi
echo ""

echo "Test 4: File Integrity"
echo "--------------------------------------"
ls -lh player.js player.html common.js worker.js | awk '{print $9, $5}'
echo ""

echo "======================================"
echo "Manual tests required:"
echo "- Load extension in Chrome"
echo "- Open Twitch stream"
echo "- Press S key"
echo "- Verify statistics display"
echo "======================================"
```

---

## Test Results Summary Template

```
===================================
TEST EXECUTION REPORT
===================================
Date: 2026-07-07
Tester: [Your Name]
Build: post-fix (Plans #1, #2, #3)

SMOKE TESTS:          [X/3] PASS
ELEMENT ID TESTS:     [X/13] PASS  
TOOLTIP TESTS:        [X/17] PASS
FUNCTIONAL TESTS:     [X/3] PASS
ERROR HANDLING:       [X/2] PASS
BROWSER COMPAT:       [X/2] PASS
LOCALE TESTS:         [X/2] PASS

TOTAL:                [X/42] PASS

CRITICAL FAILURES:    0
MINOR ISSUES:         0
NOTES:                None

RECOMMENDATION:       ✅ APPROVED FOR DEPLOYMENT
===================================
```

---

## Rollback Criteria

**Initiate rollback if:**
- 3+ critical tests fail
- Any null reference errors in console
- Statistics overlay does not display data
- Video playback is broken
- Existing Russian functionality broken

**Rollback Command:**
```bash
git log --oneline -5
git revert HEAD~2..HEAD  # Revert Plans #1 and #2
git push origin HEAD
```

---

## Success Criteria

- ✅ All 42 tests pass
- ✅ Zero console errors during normal playback
- ✅ Statistics overlay displays live data in all 9 fixed fields
- ✅ All tooltips display in English
- ✅ No regressions in video playback
- ✅ Extension loads within 3 seconds
- ✅ Buffer management works correctly

---

**Document Version:** 1.0  
**Created:** 2026-07-07  
**Status:** READY FOR EXECUTION (after Plans #1, #2, #3)
