# General Outline of what `player.js.full.js.doc.md` *will* look like
*     **player.js.full.js.doc.md** is still WIP

## 1. Summary
**What is this file?**
`player.js` is the **Brain** of the extension. It lives in its own tab (the player window) and controls everything the user sees and hears. It does not run on the Twitch website itself; it runs in the extension's isolated environment.

**How does it work?**
Imagine `player.js` as a **General Contractor** building a house. It doesn't do the heavy lifting (video processing) itself—it hires a specialized worker (`worker.js`) for that. Instead, it coordinates the blueprints (playlists), the materials (video downloads), and the interior design (user interface).

---

## 2. The Rosetta Stone (Russian-to-English Guide)
*The original developer wrote variable names in Russian. This section translates the naming conventions so you can read the code fluently.*

### The "Module" Concept (`м_`)
In this codebase, you will frequently see variables starting with `м_` (e.g., `м_Настройки`).
*   **Translation:** `м` stands for **Module**.
*   **What is a Module here?** Think of the `player.js` file as a large office building. The **Modules** are the different **Departments** in that building.
    *   Each Module is a self-contained group of functions and data dedicated to **one specific job**.
    *   *Example:* `м_Настройки` (m_Settings) is the "Settings Department." It handles saving preferences, reading them, and resetting them. It doesn't care about video or chat; it only cares about settings.

### Common Prefixes
*   `м_` -> **Module/Manager** (The department handling a specific job).
*   `с` -> **String** (Text).
*   `ч` -> **Number** (Count/Integer).
*   `л` -> **Logic** (Boolean: True/False).
*   `о` -> **Object** (A complex data structure).
*   `ф` -> **Function** (An action to perform).

---

## 3. Streaming Basics: What is a "Segment"?
*Before understanding the code, you must understand how Twitch streaming works.*

**The Concept:**
When you watch a "Live" stream, you aren't downloading one massive file. You are downloading thousands of tiny files, one after another.

**The "Segment":**
*   **Definition:** A Segment is a **Time Slice**. It is a tiny video file (usually `.ts` format) that contains **only 2 to 6 seconds** of video.
*   **In the Code:** The class `Сегмент` (Segment) represents one of these 4-second chunks.
*   **What gets stored?** The `Segment` object in memory holds:
    1.  **The URL:** Where to download this specific 4-second chunk.
    2.  **The Duration:** Exactly how long this chunk is (e.g., 4.002 seconds).
    3.  **The Data:** Eventually, it holds the raw binary data (video/audio bytes) downloaded from the internet.
    4.  **Status:** Is it waiting to download? Is it downloading? Is it ready to play?

---

## 4. The "Assembly Line" (Logic Flow)
*How a video travels from the internet to your screen.*

1.  **The Order (`m_List`):**
    The `m_List` module downloads a "Menu" (Playlist) from Twitch. It says: *"Here are the next 3 segments available: chunk_100.ts, chunk_101.ts, chunk_102.ts."*
2.  **The Queue (`Queue`):**
    `m_List` creates `Segment` objects for these files and puts them in a line (The Queue). They are marked as "Waiting for Download."
3.  **The Fetch (`m_Loader`):**
    The `m_Loader` module looks at the Queue. It sees a segment waiting, connects to the internet, downloads the raw bytes, and saves them into the `Segment` object.
4.  **The Processing (`m_Converter`):**
    The browser cannot play raw `.ts` files easily. The `m_Converter` sends the raw data to the **Worker** (`worker.js`). The Worker acts like a factory machine: it strips away the wrapper and converts the video into `MP4` format.
5.  **The Playback (`m_Player`):**
    The processed data comes back from the Worker. `m_Player` takes this clean MP4 data and feeds it into the browser's video buffer. You see the video 4 seconds at a time.

---

## 5. Detailed Code Structure

### A. Core Data Structures (Classes)
*   **`Class: ОтменаОбещания` (PromiseCancellation)**
    *   **Job:** A "Stop Button" for internet requests. If the user closes the player, this allows the code to cancel a download immediately so bandwidth isn't wasted.
*   **`Class: Сегмент` (Segment)**
    *   **Job:** The container for a 4-second video slice (as described in Section 3).
*   **`Class: ВводЧисла` (NumberInput)**
    *   **Job:** A UI helper. It controls the "Plus" and "Minus" buttons in the settings menu (e.g., changing buffer size). It handles clicking and dragging mouse interactions.

### B. The Departments (Modules)

#### **1. The Brains (System & Logic)**
*   **`м_События` (m_Events):**
    *   **Job:** The Internal Phone System. When something happens (e.g., "User clicked Mute"), this module broadcasts a message so other modules can listen and react.
*   **`м_Отладка` (m_Debug):**
    *   **Job:** The Black Box Recorder. If the player crashes, this module collects all data (Chrome version, PC specs, log history) to show a report.
*   **`м_Помойка` (m_GarbageCollector):**
    *   **Job:** The Janitor. Video processing creates massive amounts of temporary garbage data. This module uses advanced tricks to force the browser to clean up memory immediately, preventing the extension from crashing your browser.

#### **2. The Face (User Interface)**
*   **`м_Окно` (m_Window):**
    *   **Job:** The Window Manager. It handles opening the Settings panel, closing the Chat panel, or switching to the Help panel. It ensures windows don't overlap messily.
*   **`м_Меню` (m_Menu):**
    *   **Job:** The Right-Click Menu. Customizes the menu you see when you right-click the player.
*   **`м_Оформление` (m_Appearance):**
    *   **Job:** The Painter. It applies the colors (Dark Mode, Light Mode, Custom Colors) and font sizes selected by the user.
*   **`м_Уведомление` (m_Notification):**
    *   **Job:** The Toast Popups. Shows temporary messages like "Copied to Clipboard" or "Screenshot Taken."
*   **`м_Автоскрытие` (m_AutoHide):**
    *   **Job:** The Ghost. It detects if your mouse stops moving and fades out the UI overlay so you can see the video clearly.

#### **3. The Hands (Controls)**
*   **`м_Управление` (m_Control):**
    *   **Job:** The Input Handler. It listens for keyboard shortcuts (e.g., Space to pause, 'M' to mute) and mouse clicks. It tells the other modules what to do based on user input.
*   **`м_ПолноэкранныйРежим` (m_Fullscreen):**
    *   **Job:** Handles entering and exiting Fullscreen mode safely.
*   **`м_Шкала` (m_Seekbar):**
    *   **Job:** The Instant Replay Bar. It manages the purple bar at the bottom, allowing you to "rewind" the live stream to see what happened 30 seconds ago.

#### **4. The Worker Bees (Networking & Video)**
*   **`м_Twitch` (m_Twitch):**
    *   **Job:** The Twitch Liaison. It talks to Twitch servers. It asks: "Is this channel live?", "Give me an access token," or "Here are my ad-viewing statistics."
*   **`м_Список` (m_List):**
    *   **Job:** The Playlist Manager. It continuously downloads the `.m3u8` playlist file from Twitch to find out what new video segments have been published.
*   **`м_Загрузчик` (m_Loader):**
    *   **Job:** The Fetcher. It performs the actual raw file downloads. It handles retries if the internet connection blips.
*   **`м_Преобразователь` (m_Converter):**
    *   **Job:** The Translator. It takes the raw downloaded segments and sends them to the `worker.js` file to be converted into a format the browser can display.
*   **`м_Проигрыватель` (m_Player):**
    *   **Job:** The Projector. It manages the HTML `<video>` tag. It receives the converted video data and pushes it into the browser's video buffer. It handles Play, Pause, and Volume.

---

## 6. Initialization Sequence
*What happens when you first open the player?*

1.  **Duplicate Check:** The code checks `background.js` to see: "Is this channel already open in another tab?" If yes, it stops to prevent audio echoes.
2.  **Permissions:** It checks `manifest.json` permissions to ensure it is allowed to download video from Twitch's servers.
3.  **Restore Settings:** It asks `m_Settings` to load your preferences (volume, color, quality) from storage.
4.  **Twitch Login:** `m_Twitch` checks your cookies to see if you are logged in (so you can use chat or create clips).
5.  **Start the Engine:** The function `НачатьРаботу` (StartWork) is called.
    *   It tells `m_Control` to start listening for keys.
    *   It tells `m_Player` to prepare the video screen.
    *   It tells `m_List` to start downloading the playlist.