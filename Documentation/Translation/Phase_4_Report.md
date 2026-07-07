# Phase 4 Report — CSS Class & HTML ID Rename Plan
## Twitch Alternate Player: Atomic Cyrillic → English Identifier Rename

**Date:** 2026-07-07
**Task:** Rename every Cyrillic CSS class name, HTML ID, data-* attribute name, CSS custom property,
and @keyframes name to English equivalents. Every rename must be atomic (all occurrences across
all files in one commit).
**Files affected:** player.html, player.css, content.css
**Risk level: HIGH** — 350+ line changes required. Partial renames will break the extension.

---

## Executive Summary

| Category | Unique Names | Files | Total Line Changes |
|----------|-------------|-------|-------------------|
| CSS class names | 47 | player.css, player.html | ~140 |
| HTML IDs | 64 | player.css, player.html | ~120 |
| data-* attribute names | 5 | player.css, player.html | ~55 |
| CSS custom properties | 14 | player.css, content.css | ~50 |
| @keyframes names | 6 | player.css | ~12 |
| **TOTAL** | **136** | 3 files | **~350+** |

---

## Master Rename Table

### CSS Class Names (47 unique)

| Russian | English | player.css lines | player.html lines |
|---------|---------|-----------------|------------------|
| .радио-значок | .radio-icon | 9, 11, 67, 69, 81 | 563, 747, and others |
| .флажок-значок | .checkbox-icon | 9, 11, 77, 85 | 565, 747, and others |
| .радио-метка | .radio-label | 63 | 743, and others |
| .радио-текст | .radio-text | 89 | 565, and others |
| .окно | .window | 105 | 503, 509, 571, 594, 683 |
| .окнооткрыто | .window-open | 118, 137 | (set via JS) |
| .анимацияинтерфейса | .interface-animation | 124, 447 | (set via JS) |
| .анимацияокна | .window-animation | 124 | (none) |
| .индикаторпрокрутки | .scroll-indicator | 129, 137, 139 | 578, 589 |
| .тащилка-перехват | .dragger-intercept | 154 | (none) |
| .автоскрытие | .autohide | 207, 447 | (set via JS) |
| .выборскорости | .speedchoice | 207 | (set via JS) |
| .нетвидео | .novideo | 207, 606 | (set via JS) |
| .нетзвука | .nosound | 607, 608 | (set via JS) |
| .проверкацветафон | .colorcheck-background | ~1290 | ~1004 |
| .проверкацвета | .colorcheck | ~1290 | ~1004 |
| .горизвырав | .horizalign | ~590 | 578, 583, 587, 591 |
| .горизвырав-лево | .horizalign-left | ~590 | 580 |
| .горизвырав-середина | .horizalign-middle | ~590 | 584 |
| .горизвырав-право | .horizalign-right | ~590 | 588 |
| .метка | .label | ~434 | 380, 390, and others |
| .крутилка | .spinner | 337, 407, 408 | 21 |
| .панель | .panel | 434, 447, 458 | 373, 399 |
| .верхняя | .top | 458 | 373 |
| .нижняя | .bottom | 462 | 399 |
| .элементпанели | .panelelement | 467, 475, 447 | 375, 380, 390, and 20+ |
| .многоточие | .ellipsis | 475 | 380 |
| .можнотыкать | .clickable | 483 | 380, 390, 401, and 10+ |
| .пара | .pair | 501 | 390 |
| .заполнитель | .filler | 497, 570 | 419, 421 |
| .кнопка | .button | 517 | 401, 408, 453, 459, and 10+ |
| .типтрансляции | .streamtype | 512 | 377 |
| .прямаятрансляция | .livestream | ~600 | (set via JS) |
| .категориятрансляции | .streamcategory | ~512 | 380 |
| .шкала-фон | .scale-background | ~625 | 445 |
| .скрытиерекламы | .adblock | 680 | 498, 500 |
| .скрытиерекламы-текст | .adblock-text | 694 | 500 |
| .канал | .channel | 737, 743, 755 | 509, 513 |
| .канал-аватар | .channel-avatar | 764 | 513 |
| .канал-ссылка | .channel-link | 780 | 520 |
| .зритель-уведомлять | .viewer-notify | 784 | 559 |
| .обновляется | .updating | ~790 | (set via JS) |
| .главноеменю | .mainmenu | 808 | 594, 459 |
| .меню-секция | .menu-section | 817 | 596, 614, 621, 660 |
| .меню-пункт | .menu-item | 821, 832 | 598, 608, 613, and 15+ |
| .меню-значок | .menu-icon | 844 | 600, 608, 614, and 8+ |
| .меню-текст | .menu-text | 853 | 602, 611, 617, and 7+ |
| .меню-клавиши | .menu-keys | 857 | 606, 614, and 2+ |
| .поддержать | .support | 864 | 668 |
| .ужатьглавноеменю | .compressmainmenu | 869 | (set via JS) |
| .заголовокнастроек | .settingsheader | 894 | 687, 757, 848, 931, 955, 1004 |
| .группанастроек | .settingsgroup | 920 | 689, 759, 850, 933, 957, 1006 |
| .настройка | .setting | 936 | 691–1134 (many) |
| .настройка-имя | .setting-name | 943 | 693–1134 (many) |
| .настройка-данные | .setting-data | 950 | 695–1134 (many) |
| .вводчисла-число | .numberinput-number | 975 | 701, 729, and others |
| .вводчисла-минус | .numberinput-minus | 983 | 703, 731, and others |
| .вводчисла-плюс | .numberinput-plus | 991 | 705, 733, and others |
| .положениечата | .chatposition | 1000 | 779–797 (5 occurrences) |
| .ужатьнастройки | .compresssettings | ~1040 | (set via JS) |
| .новости | .news | 1044 | 571 |
| .новости-текст | .news-text | 1052 | 573 |
| .новость-перевести | .news-translate | ~1060 | 577 |
| .непрочитано | .unread | 1113 | (set via JS) |
| .обновлениерасширения | .extensionupdate | 680 | 503 |
| .обновлениерасширения-закрыть | .extensionupdate-close | 686 | 505 |
| .статистика-кнопка | .statistics-button | 1191 | 35, 41 |
| .статистика-переместить | .statistics-move | 1191 | 41 |
| .статистика-прокрутка | .statistics-scroll | ~1200 | 47 |
| .статистика-главнаятаблица | .statistics-maintable | ~1210 | 49 |
| .статистика-символ | .statistics-symbol | ~1230 | 55–282 (12 occurrences) |
| .статистика-подробно | .statistics-detailed | ~1240 | 56–283 (13 occurrences) |
| .статистика-анализ | .statistics-analysis | ~1250 | 57–284 (3 occurrences) |
| .анализ-минимум | .analysis-minimum | ~1260 | 57–284 |
| .анализ-среднее | .analysis-average | ~1270 | 57–284 |
| .анализ-максимум | .analysis-maximum | ~1280 | 57–284 (2 occurrences) |
| .анализ-история | .analysis-history | ~1290 | 57–284 (4 occurrences) |
| .статистика-выделить | .statistics-highlight | ~1300 | (set via JS) |
| .дляповтора | .forrepeat | 570 | 421 |
| .недляповтора | .notforrepeat | 604 | 419 |
| .скрытьчат | .hidechat | 231 | (set via JS) |
| .чатслева | .chatleft | 247, 254, 258 | (set via JS) |
| .чатвнизу | .chatbottom | 262, 267 | (set via JS) |
| .чатвверху | .chattop | 272, 278 | (set via JS) |
| .чатсправа | .chatright | 279 | (set via JS) |
| .автоположениечата | .autopositionchat | 289, 293, 303, 307 | 875, 883, 891, 899 |

---

### HTML IDs (64 unique)

| Russian | English | player.css | player.html |
|---------|---------|-----------|-------------|
| проигрывательичат | playerandchat | 173, 179, 188, 200, 254, 289, 293, 303, 307 | 15 |
| проигрыватель | player | 200, 207 | 17 |
| глаз | eye | 337, 369 | 19 |
| статистика | statistics | 1160–1296 | 33 |
| закрытьстатистику | closestatistics | (none in CSS) | 35 |
| верхняяпанель | toppanel | (none in CSS) | 373 |
| типтрансляции | streamtype | 512 | 377 |
| названиетрансляции | streamtitle | ~512 | 380 |
| заполнитель | filler | (none in CSS) | 382 |
| категориятрансляции | streamcategory | ~512 | 380 |
| количествозрителей | viewercount | (none in CSS) | 390 |
| переключитьтрансляцию | togglestream | 594, 604 | 401 |
| переключитьприглушить | togglemute | 607 | 408 |
| громкость | volume | 630, 608 | 415 |
| позиция | position | (none in CSS) | 417 |
| скорость | speed | 635 | 417 |
| переключитьпаузу | togglepause | 594, 596, 598, 600, 602 | (implicit) |
| шкала | scale | 643 | 443 |
| шкала-просмотрено | scale-viewed | 654 | 447 |
| открытьновости | opennews | 1120 | 453 |
| переключитьглавноеменю | togglemainmenu | (none in CSS) | 459 |
| переключитьчат | togglechat | ~605 | 465 |
| создатьклип | createclip | ~605 | 477 |
| переключитькартинкавкартинке | togglepictureinpicture | 606 | 483 |
| переключитьполноэкранный | togglefullscreen | (none in CSS) | 490 |
| размерчата | chatsize | 231, 237, 247, 262, 267, 272, 278, 289, 293, 297, 303, 307, 311 | 1137 |
| чат | chat | 225 | (implicit) |
| обновлениерасширения | extensionupdate | 680, 694 | 503 |
| канал | channel | 737, 755, 760, 780 | 509 |
| канал-аватар | channel-avatar | 764 | 515 |
| канал-имя | channel-name | 773 | 518 |
| канал-описание | channel-description | (none in CSS) | 520 |
| канал-язык | channel-language | (none in CSS) | 525 |
| канал-подписчиков | channel-followers | (none in CSS) | 530 |
| канал-создан | channel-created | (none in CSS) | 535 |
| канал-команды | channel-teams | (none in CSS) | 540 |
| зритель-имя | viewer-name | (none in CSS) | 549 |
| зритель-подписка | viewer-subscription | 784, 785, 790 | 551, 554 |
| зритель-подписаться | viewer-subscribe | 794 | 556 |
| зритель-отписаться | viewer-unsubscribe | 798 | 559 |
| зритель-уведомлять | viewer-notify | 784 | 561 |
| новости | news | 1044, 1052 | 571 |
| текстновостей | newstext | (none in CSS) | 573 |
| закрытьновости | closenews | (none in CSS) | 575 |
| индикаторпрокрутки-текстновостей | scrollindicator-newstext | (none in CSS) | 578 |
| отложитьновости | postponenews | (none in CSS) | 582 |
| главноеменю | mainmenu | 808 | 594 |
| адресзаписи | recordaddress | (none in CSS) | 609 |
| копироватьадрестрансляции | copybroadcastaddress | (none in CSS) | 613 |
| копироватьадресканала | copychanneladdress | (none in CSS) | 617 |
| переключитьстатистику | togglestatistics | (none in CSS) | 621 |
| отправитьотзыв | sendfeedback | (none in CSS) | 656 |
| открытьновости2 | opennews2 | (none in CSS) | 660 |
| открытьсправку | openhelp | (none in CSS) | 664 |
| настройки | settings | 889 | 683 |
| группаосновные | maingroup | (none in CSS) | 685 |
| варианттрансляции | streamvariant | (none in CSS) | 697 |
| предустановка-буферизация | preset-buffering | (none in CSS) | 709 |
| аудиоустройства | audiodevices | (none in CSS) | 711 |
| аудиоустройства-доступ | audiodevices-access | (none in CSS) | 713 |
| аудиоустройства-список | audiodevices-list | (none in CSS) | 715 |
| длительностьповтора | repeatduration | 1015, 1023 | 727 |
| масштабироватьизображение | scaleimage | (none in CSS) | 741 |
| группачат | chatgroup | (none in CSS) | 755 |
| автоположениечата | autopositionchat | 289, 293, 303, 307 | 875 |
| состояниезакрытогочата | closedchatstate | (none in CSS) | 879 |
| адресчата | chataddress | (none in CSS) | 893 |
| группаинтерфейс | interfacegroup | (none in CSS) | 931 |
| предустановка-оформление | preset-appearance | (none in CSS) | 943 |
| размеринтерфейса | interfacesize | 963 | 947 |
| интервалавтоскрытия | autohideinterval | 967 | 951 |
| менятьгромкостьколесом | changevolumewithwheel | (none in CSS) | 961 |
| анимацияинтерфейса | interfaceanimation | (none in CSS) | 965 |
| группацвета | colorsgroup | (none in CSS) | 1003 |
| сЦветФона | sBackgroundColor | 112, 196, etc. | 1007 |
| сЦветГрадиента | sGradientColor | 112, etc. | 1015 |
| сЦветКнопок | sButtonColor | 196, etc. | 1021 |
| сЦветЗаголовка | sHeaderColor | ~various | 1027 |
| сЦветВыделения | sHighlightColor | ~various | 1033 |
| прозрачность | opacity | ~various | 1039 |
| проверкацвета | colorcheck | ~1290 | 1045 |
| группабуферизация | bufferinggroup | (none in CSS) | 1051 |
| началовоспроизведения | playbackstart | 1031 | 1059 |
| размербуфера | buffersize | 1036 | 1067 |
| растягиваниебуфера | bufferstretch | ~1040 | 1081 |
| группавсенастройки | allsettingsgroup | (none in CSS) | 1095 |
| экспортнастроек | exportsettings | (none in CSS) | 1099 |
| импортнастроек | importsettings | (none in CSS) | 1103 |
| сброситьнастройки | resetsettings | (none in CSS) | 1107 |
| уведомление | notification | 626, 631, 643, 668, 671 | 29 |
| выборфайладляимпортанастроек | filechooserforimportsettings | (none in CSS) | 1140 |

---

### data-* Attribute Names (5 unique)

| Russian Attr Name | English Attr Name | Occurrences | Notes |
|------------------|------------------|-------------|-------|
| data-тащилка | data-dragger | 40+ in HTML, 3 in CSS | Also rename VALUES that are Cyrillic IDs |
| data-состояние | data-state | 35 in CSS, 8 in HTML | Values are numbers — no change needed |
| data-окно-открыто | data-window-open | 2 in CSS | (set via JS — also update JS) |
| data-окно-переключить | data-window-toggle | 6 in HTML | VALUES are Cyrillic IDs — rename those IDs too |
| data-очистить | data-clear | 9 in HTML | (values are IDs — update those IDs) |

**Important:** When renaming `data-тащилка`, also rename the VALUES that reference Cyrillic IDs.
For example: `data-тащилка=статистика` → `data-dragger=statistics`

---

### CSS Custom Properties (14 unique)

| Russian | English | player.css | content.css |
|---------|---------|-----------|-------------|
| --сЦветГрадиента | --sGradientColor | 13 uses | 8 uses |
| --сЦветФона | --sBackgroundColor | 14 uses | 8 uses |
| --чНепрозрачность | --nOpacity | 8 uses | 0 uses |
| --чНепрозрачностьОкна | --nWindowOpacity | 2 uses | 0 uses |
| --сЦветКнопок | --sButtonColor | 8 uses | 4 uses |
| --сЦветВыделения | --sHighlightColor | 6 uses | 2 uses |
| --сЦветЗаголовка | --sHeaderColor | 5 uses | 2 uses |
| --ширина | --width | 1 use | 0 uses |
| --tw5-ширинаспискасмайликов | --tw5-emoji-list-width | 0 uses | 2 uses |
| --tw5-высотазаголовка | --tw5-header-height | 3 uses | 0 uses |
| --tw5-отступокна | --tw5-window-indent | 7 uses | 0 uses |
| --tw5-нижнийотступчата | --tw5-chat-bottom-offset | 5 uses | 0 uses |
| --tw5-высотавводасообщения | --tw5-message-input-height | 2 uses | 0 uses |
| --tw5-вышевводасообщения-в | --tw5-above-message-input | 5 uses | 0 uses |

---

### @keyframes Names (6 unique)

| Russian | English | Definition | Usage |
|---------|---------|-----------|-------|
| индикаторпрокрутки | scrollindicator | player.css:142 | player.css:139 |
| показатьнесразу | showdelayed | player.css:413 | player.css:419 |
| загрузка | loading | player.css:425 | player.css:422 |
| уведомление | notification | player.css:671 | player.css:668 |
| реклама | ad | player.css:724 | player.css:721 |
| непрочитано | unread | player.css:1120 | player.css:1113 |

---

## Rename Execution Order

Execute in this exact order to maintain a working extension at each checkpoint:

### Stage 1: CSS Custom Properties (Safest first — no HTML/JS dependencies)
1. Rename all `--сЦвет*`, `--ч*`, `--tw5-*` variables in player.css
2. Rename all `var(--...)` references in player.css
3. Rename all `--tw5-*` variables in content.css
4. **Checkpoint:** Reload extension, verify colors/layout render correctly

### Stage 2: @keyframes Names
5. Rename @keyframes definitions AND animation references in player.css simultaneously
6. **Checkpoint:** Verify loading spinner, notification animations, scroll indicator animate

### Stage 3: CSS Class Names (High volume)
7. Rename all `.кириллица` class definitions in player.css
8. Rename all matching `class=` values in player.html
9. Update all compound selectors (`:not(.class)`, `.class.class2`, `body.class`)
10. **Checkpoint:** Reload extension, verify entire UI renders, all panels open/close

### Stage 4: HTML IDs & CSS #id Selectors
11. Rename all `id=` attributes in player.html
12. Rename all `#id` selectors in player.css
13. **Checkpoint:** Verify panels open, settings work, statistics show

### Stage 5: data-* Attribute Names
14. Rename `data-тащилка` → `data-dragger` in HTML AND CSS (also update Cyrillic values)
15. Rename `data-состояние` → `data-state` in CSS (values are numbers, unchanged)
16. Rename `data-окно-открыто` → `data-window-open` in CSS
17. Rename `data-окно-переключить` → `data-window-toggle` in HTML
18. Rename `data-очистить` → `data-clear` in HTML
19. **Checkpoint:** Verify drag-to-reposition statistics panel works, window toggles work

---

## Critical Warnings

### JavaScript References (player.js)
Before executing this plan, **player.js must be searched** for every Cyrillic identifier being renamed.
The JS code references HTML IDs and data-* attributes using string literals:

```javascript
document.getElementById('статистика')        → must become getElementById('statistics')
document.querySelector('.крутилка')          → must become querySelector('.spinner')
element.getAttribute('data-тащилка')         → must become getAttribute('data-dragger')
element.classList.add('окнооткрыто')         → must become classList.add('window-open')
```

**This phase report covers ONLY player.html and player.css.**
A full scan of player.js for these references is REQUIRED before execution.
If player.js is not updated simultaneously, the extension will break.

### Cyrillic data-* Attribute Values
Some data-* attributes have Cyrillic VALUES (not just names):
- `data-тащилка=статистика` — the value `статистика` is a Cyrillic ID being renamed
- `data-окно-переключить=главноеменю` — the value `главноеменю` is a Cyrillic ID being renamed
- `data-очистить=размерчата` — the value `размерчата` is a Cyrillic ID being renamed

When renaming the ID `статистика` → `statistics`, ALL occurrences must be updated including
data-* attribute values, not just `id=статистика`.

---

## Validation Commands

Run after completion to confirm zero Cyrillic remains in CSS and HTML:

```bash
# Should return 0 results:
grep -n "[А-Яа-яЁё]" /home/vercel-sandbox/twitch_alternate_player/player.css
grep -n "[А-Яа-яЁё]" /home/vercel-sandbox/twitch_alternate_player/content.css
grep -n "[А-Яа-яЁё]" /home/vercel-sandbox/twitch_alternate_player/player.html
```

---

## Estimated Effort

| Stage | Unique Renames | Est. Line Changes | Estimated Risk |
|-------|---------------|-----------------|----------------|
| CSS Custom Properties | 14 | ~50 | LOW |
| @keyframes | 6 | ~12 | LOW |
| CSS Class Names | 73 | ~140 | MEDIUM |
| HTML IDs | 64 | ~120 | HIGH (JS dependency) |
| data-* Attributes | 5 | ~55 | HIGH (JS dependency) |
| **Total** | **162** | **~377** | **HIGH** |

Commit message format: `translate(css/html): rename Cyrillic identifiers to English [stage N/5]`
