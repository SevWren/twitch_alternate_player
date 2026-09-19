## Parent

N/A - Root issue

## What to build

Update `player.js` to reference the English element IDs that are now active in `player.html` (changed in commit ebf05b5). Currently 11 lines in `player.js` reference Russian IDs that no longer exist in the DOM, causing `TypeError: Cannot read property 'nodeType' of null` when the statistics overlay initializes.

**Broken IDs in player.js:**
- `статистика-сжатиевидео` → `statistics-videocompression` (3 occurrences: lines 1846, 1995, 2000)
- `статистика-сервер` → `statistics-server` (1 occurrence: line 1865)
- `статистика-интервалобновления` → `statistics-updateinterval` (1 occurrence: line 1656)
- `статистика-сегментовдобавлено` → `statistics-segmentsadded` (1 occurrence: line 1661)
- `статистика-секунддобавлено` → `statistics-secondsadded` (1 occurrence: line 1666)
- `статистика-толщинасегмента` → `statistics-segmentthickness` (1 occurrence: line 1671)
- `статистика-толщинаканала` → `statistics-channelthickness` (1 occurrence: line 1676)
- `статистика-ожиданиеответа` → `statistics-responsewait` (1 occurrence: line 1681)
- `статистика-непросмотрено` → `statistics-unwatched` (1 occurrence: line 1686)

## Acceptance criteria

- [ ] All 11 `Узел("статистика-...")` calls in `player.js` updated to English IDs
- [ ] Extension loads without console errors
- [ ] Statistics overlay opens with 'S' key and displays live data in all 9 fixed fields
- [ ] No regressions: 4 unchanged Russian IDs still work

## Blocked by

None - can start immediately