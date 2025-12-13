# Project Update Summary (Last 7 Days)

This document summarizes the changes made to the project over the past week. These updates were primarily focused on compatibility with Chrome's Manifest V3 and enhancing extension communication.

## English Summary

The project has been updated to be compatible with Chrome's Manifest V3. This involved significant changes to the extension's architecture, including the introduction of a background service worker and modifications to how scripts are executed.

### Key Changes:

*   **Manifest V3 Migration:** The extension has been migrated to Manifest V3. This includes:
    *   Replacing `webRequest` listeners with `declarativeNetRequest` for modifying web requests.
    *   Updating the background script to a service worker.
    *   Adjusting the content security policy.
    *   Adding a `rules.json` file to define `declarativeNetRequest` rules.
*   **Content Script Injection:** The content script injection method has been updated for Manifest V3 compatibility. Functions previously injected are now in a separate file (`content_injection.js`) and injected by URL.
*   **GraphQL Token Handling:** A new script (`gql_injection.js`) has been introduced to intercept requests to `https://gql.twitch.tv/integrity` and extract the GraphQL token. This token is then stored in a cookie for later use. The injection method in `gqltoken.js` has been updated to be MV3-compliant.
*   **Enhanced Extension Communication:** Listeners for inter-script communication have been added to facilitate extension functionality. This allows the extension to:
    *   Fetch a list of installed extensions.
    *   Check for and prevent duplicate instances of channel players.

These enhancements improve the overall integration of the extension, ensure compatibility with the latest Chrome standards, and lead to a more stable and efficient user experience.

## LLM Specific Instructions:

*   **The LLM must ignore all contents within files originating within the directory `twitch_alternate_player\Documentation\notes`
*   This is a dedicated personal notes directory, not no for contexual use.
*   *   **


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
