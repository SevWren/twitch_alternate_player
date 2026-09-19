## Parent

N/A

## What to build

Manual integration testing in Chrome to verify the complete fix works end-to-end across all scenarios.

**Test matrix (42 tests):**
- **Smoke tests (3):** Extension loads, player initializes, statistics overlay opens
- **Element ID tests (13):** 9 fixed fields + 4 unchanged Russian IDs display live data
- **Tooltip tests (17):** All tooltips display English on hover
- **Functional regression (3):** Video playback, quality selection, statistics accuracy
- **Error handling (2):** Network interruption, ad segment handling
- **Browser compatibility (2):** Chrome, Edge
- **Locale testing (2):** English locale, Russian locale

## Acceptance criteria

- [ ] Extension loads, player initializes, video plays without console errors
- [ ] Statistics overlay (S key) displays all 13 fields with live data
- [ ] All 17 tooltips display English text on hover
- [ ] Video playback, quality switching, seeking work correctly
- [ ] Statistics accuracy verified over 60-second playback
- [ ] Network throttling / ad segments handled gracefully
- [ ] English and Russian browser locales tested
- [ ] 42/42 test matrix items pass

## Blocked by

- #8 (Complete Translation Audit & Validation)