# Twitch Alternate Player (Manifest V3)

## Project Overview
This is an alternate player for Twitch.tv, optimized for performance and customizability. It minimizes buffering, provides detailed stream diagnostics, and includes a mechanism to bypass Twitch's Server-Side Ad Insertion (SSAI).

## Technical Deep Dive: The Absolute Truth
*Verified by 100% Line-by-Line Code Audit (December 2025)*

### 1. Ad Avoidance Mechanism & Status
**Mechanism**:
The player avoids ads not by magic, but by requesting a specific stream type that Twitch serves to "Picture-by-Picture" clients.
-   **Method**: When an ad is detected, the player switches to a backup stream requested with `playerType: "picture-by-picture"`.
-   **Tracking Bypass**: Crucially, this request explicitly **omits** the `play_session_id` parameter (`player.js` line 8538), which prevents Twitch from attaching the stitched ad playlist.
-   **Independence**: This process does **NOT** use the `tw5~gqltoken` (GQL Integrity Token). Code verification (`player.js` line 8480) confirms the GQL token argument is hardcoded to `false` for these requests.

**Current Status: Work In Progress (WIP)**
> [!WARNING]
> **Ad Bypass Instability ("Black Screen")**
> While the code mechanism is verified, users may experience "Black Screens" or frozen video during ads.
> **Identified Issue**: "Zombie Ads" (Expired Ad Tags).
> **Details**: Twitch sometimes leaves expired Ad Metadata (`#EXT-X-DATERANGE`) in the live manifest. The current HLS parser can process these "zombie" tags *after* valid tags, corrupting the internal state (overwriting valid Ad Types/Tokens with expired ones).
> **Investigation**: Debugging is focused on validating `START-DATE` in the parser to filter out these expired tags.

**Debugging Reference (player.js)**:
-   **Ad Detection**: Line ~6719 (`CLASS="twitch-stitched-ad"`).
-   **State Corruption**: Line ~6726 (Overwrites `сТипРекламы`) and ~6748 (Overwrites `сТокенРекламы`).
-   **Defect**: Missing boolean check for `START-DATE < CurrentTime` buffer.

### 2. GQL Integrity Token (`tw5~gqltoken`)
-   **Purpose**: This token is intercepted from the official Twitch client (`gql_injection.js`) and stored in a cookie.
-   **Usage**: It is required for *interactive* API calls made by the extension, such as Follow/Unfollow actions, Claiming Bonus Points, and reporting Ad Telemetry.
-   **Clarification**: It is **NOT** used for the core video playback or ad-free stream fetching.

### 3. Third-Party Integrations (BTTV/FFZ)
-   **Implementation**: The extension uses `chrome.management` to detect if you have BetterTTV or FrankerFaceZ installed.
-   **Limitation**: If detected, it "sideloads" the generic CDN version of these scripts into the player.
    -   **Result**: You get basic emote functionality.
    -   **Warning**: **Your custom settings, blacklists, and authenticated features (e.g., exclusively owned emotes) will NOT sync.** The player cannot access the local storage or authenticated state of other extensions.

## Detailed Statistics Catalog
The player overlay provides real-time diagnostics (Lines 50-370 in `player.html`).

| Metric (English) | DOM ID | Description |
| :--- | :--- | :--- |
| **Video Resolution** | `statistics-videoresolution` | Source video width × height. |
| **Frame Rate** | `statistics-framerate` | Average FPS ± Maximum deviation. |
| **Video Compression** | `statistics-videocompression` | Standard, profile, level, ref frames, range. |
| **Audio Compression** | `statistics-audiocompression` | Standard, sample rate, channels. |
| **Audio Bitrate** | `statistics-audiobitrate` | Calculated segment bitrate. |
| **Server** | `statistics-server` | The Twitch server delivering the video. |
| **Playlist Duration** | `statistics-list` | Total duration of segments in the current playlist buffer. |
| **Target Duration** | `statistics-targetduration` | Max declared segment duration (HLS tag). |
| **Buffer Queue** | `statistics-queue` | Waiting for download + Downloading + Waiting to add + Buffered. |
| **Update Interval** | `statistics-updateinterval` | Time between playlist downloads (Min < Avg < Max). |
| **Segments Added** | `statistics-segmentsadded` | Number of new segments per update (Min < Avg < Max). |
| **Seconds Added** | `statistics-secondsadded` | Duration of new segments per update (Min < Avg < Max). |
| **Segment Thickness** | `statistics-segmentthickness` | Total bitrate (Video + Audio + Metadata) of loaded segment. |
| **Channel Thickness** | `statistics-channelthickness` | Download speed vs Bitrate (Min < Avg < Max). |
| **Response Wait** | `statistics-responsewait` | Time to first byte from server (Min < Avg < Max). |
| **Unwatched Buffer** | `statistics-unwatched` | Duration of playable video in buffer (Min < Avg < Max). |
| **Conversion Time** | `statistics-convertedin` | Time to transmux TS to MP4 (CPU load indicator). |
| **Stream Delay** | `statistics-streamdelay` | Estimated latency from broadcaster to viewer. |
| **Viewing Duration** | `statistics-viewingduration` | Time elapsed since page load. |
| **Ad Count** | `statistics-adcount` | Total number of ads detected/blocked. |
| **Ad Frequency** | `statistics-adfrequency` | Frequency of ad breaks. |
| **Downloaded Data** | `statistics-downloaded` | Total data volume consumed. |
| **Skipped Frames** | `statistics-skipped` | Dropped frames (Browser/Rendering performance). |
| **Video/Audio Loss** | `statistics-videoloss` / `-audioloss` | Segments with missing data/corruption. |
| **Rejected Segments** | `statistics-rejected` | Corrupted segments that were discarded. |
| **Load Errors** | `statistics-loaderrors` | Network failures during segment fetch. |
| **Skipped Segments** | `statistics-skippedsegments` | Segments intentionally not downloaded. |
| **buffer Overflows** | `statistics-overflowed` | Times the buffer was full and data was discarded. |
| **Buffer Exhaustion** | `statistics-exhausted` | Times playback paused due to empty buffer (Stalling). |

---

# Project Update Summary

## English Summary

The project has been updated to be compatible with Chrome's Manifest V3. This involved significant changes to the extension's architecture, including the introduction of a background service worker and modifications to how scripts are executed.

### Key Changes:

*   **Manifest V3 Migration:** The extension has been migrated to Manifest V3. This includes:
    *   Replacing `webRequest` listeners with `declarativeNetRequest` for modifying web requests.
    *   Updating the background script to a service worker.
    *   Adjusting the content security policy.
    *   Adding a `rules.json` file to define `declarativeNetRequest` rules.
*   **Content Script Injection:** The content script injection method has been updated for Manifest V3 compatibility. Functions previously injected are now in a separate file (`content_injection.js`) and injected by URL.
*   **GraphQL Token Handling:** A new script (`gql_injection.js`) has been introduced to intercept requests to `https://gql.twitch.tv/integrity` and extract the GraphQL token. This token is then stored in a cookie for later use. The injection method in `gqltoken.js` has been updated to be MV3-compliant. (TODO: Revisit this feature upon Twitch modifying anything relating to ads)
*   **Enhanced Extension Communication:** Listeners for inter-script communication have been added to facilitate extension functionality. This allows the extension to:
    *   Fetch a list of installed extensions.
    *   Check for and prevent duplicate instances of channel players.

These enhancements improve the overall integration of the extension, ensure compatibility with the latest Chrome standards, and lead to a more stable and efficient user experience.

## LLM Specific Instructions:

*   **The LLM must ignore all contents within files originating within the directory `twitch_alternate_player\Documentation\notes`
*   This is a dedicated personal notes directory, not no for contexual use.

## Russian Summary

# Сводка обновлений проекта (за последние 7 дней)
# Project Update Summary (Last 7 Days)

В этом документе обобщены изменения, внесенные в проект за последнюю неделю. Эти обновления были в первую очередь направлены на обеспечение совместимости с Chrome Manifest V3 и улучшение взаимодействия между расширениями.
This document summarizes the changes made to the project over the past week. These updates were primarily focused on compatibility with Chrome's Manifest V3 and enhancing extension communication.

## Краткое изложение на русском языке
## Russian Summary

Проект был обновлен для совместимости с Chrome Manifest V3. Это повлекло за собой значительные изменения в архитектуре расширения, включая внедрение фонового сервисного работника и изменение способа выполнения скриптов.
The project has been updated to be compatible with Chrome's Manifest V3. This involved significant changes to the extension's architecture, including the introduction of a background service worker and modifications to how scripts are executed.

### Ключевые изменения:
### Key Changes:

*   **Миграция на Manifest V3:** Расширение было переведено на Manifest V3. Это включает в себя:
*   **Manifest V3 Migration:** The extension has been migrated to Manifest V3. This includes:
    *   Замену прослушивателей `webRequest` на `declarativeNetRequest` для изменения веб-запросов.
    *   Replacing `webRequest` listeners with `declarativeNetRequest` for modifying web requests.
    *   Обновление фонового скрипта до сервисного работника.
    *   Updating the background script to a service worker.
    *   Корректировку политики безопасности контента.
    *   Adjusting the content security policy.
    *   Добавление файла `rules.json` для определения правил `declarativeNetRequest`.
    *   Adding a `rules.json` file to define `declarativeNetRequest` rules.
*   **Внедрение скриптов контента:** Метод внедрения скриптов контента был обновлен для совместимости с Manifest V3. Функции, которые ранее внедрялись, теперь находятся в отдельном файле (`content_injection.js`) и внедряются по URL.
*   **Content Script Injection:** The content script injection method has been updated for Manifest V3 compatibility. Functions previously injected are now in a separate file (`content_injection.js`) and injected by URL.
*   **Обработка токена GraphQL:** Был добавлен новый скрипт (`gql_injection.js`) для перехвата запросов к `https://gql.twitch.tv/integrity` и извлечения токена GraphQL. Этот токен затем сохраняется в файле cookie для последующего использования. Метод внедрения в `gqltoken.js` был обновлен для соответствия требованиям MV3.
*   **GraphQL Token Handling:** A new script (`gql_injection.js`) has been introduced to intercept requests to `https://gql.twitch.tv/integrity` and extract the GraphQL token. This token is then stored in a cookie for later use. The injection method in `gqltoken.js` has been updated to be MV3-compliant.
*   **Улучшенное взаимодействие между расширениями:** Были добавлены прослушиватели для межскриптового взаимодействия, чтобы облегчить функциональность расширения. Это позволяет расширению:
*   **Enhanced Extension Communication:** Listeners for inter-script communication have been added to facilitate extension functionality. This allows the extension to:
    *   Получать список установленных расширений.
    *   Fetch a list of installed extensions.
    *   Проверять и предотвращать создание дублирующихся экземпляров плееров каналов.
    *   Check for and prevent duplicate instances of channel players.

Эти усовершенствования улучшают общую интеграцию расширения, обеспечивают совместимость с последними стандартами Chrome и обеспечивают более стабильную и эффективную работу для пользователя.
These enhancements improve the overall integration of the extension, ensure compatibility with the latest Chrome standards, and lead to a more stable and efficient user experience.
