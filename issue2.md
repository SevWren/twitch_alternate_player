## Parent

N/A

## What to build

Swap the 5 remaining hardcoded Russian `title` attributes in `player.html` with their English equivalents (already present as commented lines). These tooltips bypass the i18n system and show Russian text regardless of browser locale.

**Elements to fix:**
1. Line 205: `statistics-remuxtime` - "Time spent converting from TS to MP4. Depends on computer performance."
2. Line 211: `statistics-streamdelay` - "Time between the transmission of a segment on air and its display in the player. Depends on computer performance and player buffer size."
3. Line 220: `statistics-viewingduration` - "The time during which you watch the broadcast. Only main segments are counted (ads are not counted)."
4. Line 240: `statistics-downloaded` - "The amount of data received since opening the broadcast."
5. Line 364: `statistics-bufferunderruns` - "Counter of buffer underruns. A buffer underrun occurs when there is not enough unwatched video in the buffer to continue playback without stopping. When the buffer is exhausted, playback stops until more video is loaded into the buffer. Also see the 'Buffer size' statistic."

## Acceptance criteria

- [ ] Line 205: `statistics-remuxtime` tooltip shows English
- [ ] Line 211: `statistics-streamdelay` tooltip shows English
- [ ] Line 220: `statistics-viewingduration` tooltip shows English
- [ ] Line 240: `statistics-downloaded` tooltip shows English
- [ ] Line 364: `statistics-bufferunderruns` tooltip shows English
- [ ] Hover verification: all 5 tooltips display in English
- [ ] No HTML structure broken

## Blocked by

- #6 (Fix Statistics Element ID Mismatch)