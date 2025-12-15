# player.js Documentation - As Of 7/16/2025 - (DO NOT Assume it is current)

| Original Code | Translated Code |
|---|---|
| `ВЕРСИЯ_РАСШИРЕНИЯ` | `EXTENSION_VERSION` |
| `ЗАГРУЖАТЬ_МЕТАДАННЫЕ_НЕ_ДОЛЬШЕ` | `LOAD_METADATA_NO_LONGER_THAN` |
| `ЗАГРУЖАТЬ_СПИСОК_ВАРИАНТОВ_НЕ_ДОЛЬШЕ` | `LOAD_VARIANT_LIST_NO_LONGER_THAN` |
| `ЗАГРУЖАТЬ_СПИСОК_СЕГМЕНТОВ_НЕ_ДОЛЬШЕ` | `LOAD_SEGMENT_LIST_NO_LONGER_THAN` |
| `ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ` | `PROCESSING_AWAITING_DOWNLOAD` |
| `ОБРАБОТКА_ЗАГРУЖАЕТСЯ` | `PROCESSING_DOWNLOADING` |
| `ОБРАБОТКА_ЗАГРУЖЕН` | `PROCESSING_DOWNLOADED` |
| `ОБРАБОТКА_ПРЕОБРАЗОВАН` | `PROCESSING_CONVERTED` |
| `СОСТОЯНИЕ_ЗАПУСК` | `STATE_START` |
| `СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ` | `STATE_BROADCAST_START` |
| `СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ` | `STATE_BROADCAST_END` |
| `СОСТОЯНИЕ_ЗАГРУЗКА` | `STATE_LOADING` |
| `СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ` | `STATE_PLAYBACK_START` |
| `СОСТОЯНИЕ_ВОСПРОИЗВЕДЕНИЕ` | `STATE_PLAYING` |
| `СОСТОЯНИЕ_ОСТАНОВКА` | `STATE_STOP` |
| `СОСТОЯНИЕ_ПОВТОР` | `STATE_REPEAT` |
| `СОСТОЯНИЕ_СМЕНА_ВАРИАНТА` | `STATE_VARIANT_CHANGE` |
| `ПОДПИСКА_ОБНОВЛЯЕТСЯ` | `SUBSCRIPTION_UPDATING` |
| `ПОДПИСКА_НЕДОСТУПНА` | `SUBSCRIPTION_UNAVAILABLE` |
| `ПОДПИСКА_НЕОФОРМЛЕНА` | `SUBSCRIPTION_NOT_SUBSCRIBED` |
| `ПОДПИСКА_НЕУВЕДОМЛЯТЬ` | `SUBSCRIPTION_DO_NOT_NOTIFY` |
| `ПОДПИСКА_УВЕДОМЛЯТЬ` | `SUBSCRIPTION_NOTIFY` |
| `КОД_ОТВЕТА = "Сервер вернул код ";` | `RESPONSE_CODE = 'Server returned code ';` |
| `let г_чТочноеВремя = NaN;` | `let g_nExactTime = NaN;` |
| `navigator.clipboard.writeText = function (сТекст) {` | `navigator.clipboard.writeText = function(sText) {` |
| `Проверить(typeof сТекст == "string");` | `Check(typeof sText == 'string');` |
| `ДобавитьОбработчикИсключений((фВыполнить, фОтказаться) => {` | `AddExceptionHandler((fResolve, fReject) => {` |
| `const узТекст = document.createElement("input");` | `const nodeText = document.createElement('input');` |
| `узТекст.value = сТекст;` | `nodeText.value = sText;` |
| `const лПолучилось = document.execCommand("copy");` | `const bSuccess = document.execCommand('copy');` |
| `if (лПолучилось) {` | `if (bSuccess) {` |
| `фВыполнить();` | `fResolve();` |
| `фОтказаться();` | `fReject();` |
| `function Текст(сКод, сПодстановка) {` | `function Text(sCode, sSubstitution) {` |
| `return м_i18n.GetMessage(сКод, сПодстановка);` | `return m_i18n.GetMessage(sCode, sSubstitution);` |
| `function Округлить(чЗначение, чТочность) {` | `function Round(nValue, nPrecision) {` |
| `typeof чЗначение == "number" &&` | `typeof nValue == 'number' &&` |
| `Number.isInteger(чТочность) &&` | `Number.isInteger(nPrecision) &&` |
| `return Math.round(чЗначение);` | `return Math.round(nValue);` |
| `const ч = Math.pow(10, чТочность);` | `const n = Math.pow(10, nPrecision);` |
| `return Math.round(чЗначение * ч) / ч;` | `return Math.round(nValue * n) / n;` |
| `function Ограничить(чЗначение, чМинимум, чМаксимум) {` | `function Clamp(nValue, nMin, nMax) {` |
| `Number.isFinite(чЗначение) &&` | `Number.isFinite(nValue) &&` |
| `Number.isFinite(чМинимум) &&` | `Number.isFinite(nMin) &&` |
| `Number.isFinite(чМаксимум) &&` | `Number.isFinite(nMax) &&` |
| `чМинимум <= чМаксимум` | `nMin <= nMax` |
| `return Math.min(Math.max(чЗначение, чМинимум), чМаксимум);` | `return Math.min(Math.max(nValue, nMin), nMax);` |
| `function цепочка(пОбъект, ...мсСвойства) {` | `function chain(pObject, ...msProperties) {` |
| `Проверить(мсСвойства.length !== 0);` | `Check(msProperties.length !== 0);` |
| `for (const сСвойство of мсСвойства) {` | `for (const sProperty of msProperties) {` |
| `if (!ЭтоОбъект(пОбъект)) {` | `if (!IsObject(pObject)) {` |
| `Проверить(ЭтоНепустаяСтрока(сСвойство));` | `Check(IsNonEmptyString(sProperty));` |
| `пОбъект = пОбъект[сСвойство];` | `pObject = pObject[sProperty];` |
| `return пОбъект;` | `return pObject;` |
| `function ИзменитьЗаголовокДокумента(сЗаголовок) {` | `function ChangeDocumentTitle(sTitle) {` |
| `document.title = сЗаголовок;` | `document.title = sTitle;` |
| `function проверитьРазрешенияРасширения() {` | `function checkExtensionPermissions() {` |
| `origins: chrome.runtime.getManifest().permissions.filter((сРазрешение) => сРазрешение.includes(":")),` | `origins: chrome.runtime.getManifest().permissions.filter((sPermission) => sPermission.includes(":")),` |
| `(лРазрешено) => {` | `(bAllowed) => {` |
| `if (!лРазрешено) {` | `if (!bAllowed) {` |
| `фВыполнить();` | `fResolve();` |
| `получитьТекущуюВкладку.чИдВкладки = NaN;` | `getCurrentTab.nTabId = NaN;` |
| `получитьТекущуюВкладку.cХранилищеПеченек = "";` | `getCurrentTab.sCookieStore = "";` |
| `function получитьТекущуюВкладку() {` | `function getCurrentTab() {` |
| `ДобавитьОбработчикИсключений((оВкладка) => {` | `AddExceptionHandler((oTab) => {` |
| `!ЭтоОбъект(оВкладка) ||` | `!IsObject(oTab) ||` |
| `!Number.isSafeInteger(оВкладка.id) ||` | `!Number.isSafeInteger(oTab.id) ||` |
| `оВкладка.id === chrome.tabs.TAB_ID_NONE` | `oTab.id === chrome.tabs.TAB_ID_NONE` |
| `получитьТекущуюВкладку.чИдВкладки = оВкладка.id;` | `getCurrentTab.nTabId = oTab.id;` |
| `фВыполнить();` | `fResolve();` |
| `function получитьВсеПеченьки(сАдрес) {` | `function getAllCookies(sAddress) {` |
| `return new Promise((фВыполнить) => {` | `return new Promise((fResolve) => {` |
| `const оПараметры = {` | `const oParameters = {` |
| `url: сАдрес,` | `url: sAddress,` |
| `if (получитьТекущуюВкладку.cХранилищеПеченек) {` | `if (getCurrentTab.sCookieStore) {` |
| `оПараметры.storeId = получитьТекущуюВкладку.cХранилищеПеченек;` | `oParameters.storeId = getCurrentTab.sCookieStore;` |
| `ДобавитьОбработчикИсключений((моПеченьки) => {` | `AddExceptionHandler((maCookies) => {` |
| `м_Журнал.Вот(`[API] Количество печенек: ${моПеченьки.length}`);` | `m_Log.Log(`[API] Number of cookies: ${maCookies.length}`);` |
| `фВыполнить(моПеченьки);` | `fResolve(maCookies);` |
| `function удалитьПеченьку(сИмя, сАдрес) {` | `function deleteCookie(sName, sAddress) {` |
| `return new Promise((фВыполнить) => {` | `return new Promise((fResolve) => {` |
| `name: сИмя,` | `name: sName,` |
| `url: сАдрес,` | `url: sAddress,` |
| `ДобавитьОбработчикИсключений(() => {` | `AddExceptionHandler(() => {` |
| `фВыполнить();` | `fResolve();` |
| `function ОткрытьАдресВНовойВкладке(сАдрес) {` | `function OpenAddressInNewTab(sAddress) {` |
| `function ЗаписатьТекстВЛокальныйФайл(сТекст, сТипДанных, сИмяФайла) {` | `function WriteTextToLocalFile(sText, sDataType, sFileName) {` |
| `typeof сТекст == "string" &&` | `typeof sText == "string" &&` |
| `ЭтоНепустаяСтрока(сТипДанных) &&` | `IsNonEmptyString(sDataType) &&` |
| `ЭтоНепустаяСтрока(сИмяФайла)` | `IsNonEmptyString(sFileName)` |
| `const узСсылка = document.createElement("a");` | `const nodeLink = document.createElement("a");` |
| `new Blob([сТекст], {` | `new Blob([sText], {` |
| `type: сТипДанных,` | `type: sDataType,` |
| `узСсылка.download = сИмяФайла;` | `nodeLink.download = sFileName;` |
| `узСсылка.dispatchEvent(new MouseEvent("click"));` | `nodeLink.dispatchEvent(new MouseEvent("click"));` |
| `function создатьОбработчикСобытийЭлемента(фВызвать) {` | `function createElementEventHandler(fCall) {` |
| `ДобавитьОбработчикИсключений((оСобытие) => {` | `AddExceptionHandler((oEvent) => {` |
| `if (оСобытие.target.nodeType === Node.ELEMENT_NODE) {` | `if (oEvent.target.nodeType === Node.ELEMENT_NODE) {` |
| `фВызвать(оСобытие);` | `fCall(oEvent);` |
| `function ЭтоСобытиеДляСсылки(оСобытие) {` | `function IsLinkEvent(oEvent) {` |
| `function ЭлементВЭтойТочкеМожноПрокрутить(x, y) {` | `function ElementAtThisPointCanScroll(x, y) {` |
| `let узЭлемент = document.elementFromPoint(x, y);` | `let nodeElement = document.elementFromPoint(x, y);` |
| `узЭлемент = узЭлемент.parentElement` | `nodeElement = nodeElement.parentElement` |
| `if (ЭтотЭлементМожноПрокрутить(узЭлемент)) {` | `if (ThisElementCanScroll(nodeElement)) {` |
| `function ЭтотЭлементМожноПрокрутить(узЭлемент) {` | `function ThisElementCanScroll(nodeElement) {` |
| `const оСтиль = getComputedStyle(узЭлемент);` | `const oStyle = getComputedStyle(nodeElement);` |
| `(оСтиль.overflowY === "scroll" || оСтиль.overflowY === "auto") &&` | `(oStyle.overflowY === "scroll" || oStyle.overflowY === "auto") &&` |
| `узЭлемент.clientHeight < узЭлемент.scrollHeight` | `nodeElement.clientHeight < nodeElement.scrollHeight` |
| `function этотЭлементПолностьюПрокручен(элЭлемент) {` | `function thisElementIsFullyScrolled(elElement) {` |
| `элЭлемент.scrollHeight - элЭлемент.scrollTop - элЭлемент.clientHeight < 2` | `elElement.scrollHeight - elElement.scrollTop - elElement.clientHeight < 2` |
| `function ПоказатьЭлемент(пЭлемент, лПоказать) {` | `function ShowElement(pElement, bShow) {` |
| `const узЭлемент = Узел(пЭлемент);` | `const nodeElement = Node(pElement);` |
| `if (лПоказать) {` | `if (bShow) {` |
| `function ЭлементПоказан(пЭлемент) {` | `function ElementIsShown(pElement) {` |
| `return !Узел(пЭлемент).hasAttribute("hidden");` | `return !Node(pElement).hasAttribute("hidden");` |
| `function ИзменитьКнопку(пКнопка, пСостояние) {` | `function ChangeButton(pButton, pState) {` |
| `const узКнопка = Узел(пКнопка);` | `const nodeButton = Node(pButton);` |
| `const чСостояние = Number(пСостояние);` | `const nState = Number(pState);` |
| `const сузСостояния = узКнопка.getElementsByTagName("use");` | `const nodeStates = nodeButton.getElementsByTagName("use");` |
| `Проверить(чСостояние >= 0 && чСостояние < сузСостояния.length);` | `Check(nState >= 0 && nState < nodeStates.length);` |
| `for (let ы = 0; ы < сузСостояния.length; ++ы) {` | `for (let i = 0; i < nodeStates.length; ++i) {` |
| `if (ы === чСостояние) {` | `if (i === nState) {` |
| `const сПодсказка = сузСостояния[ы].getAttributeNS(` | `const sTooltip = nodeStates[i].getAttributeNS(` |
| `"http://www.w3.org/1999/xlink",` | `"http://www.w3.org/1999/xlink",` |
| `"title"` | `"title"` |
| `if (сПодсказка) {` | `if (sTooltip) {` |
| `узКнопка.title = Текст(сПодсказка);` | `nodeButton.title = Text(sTooltip);` |
| `сузСостояния[ы].removeAttribute("display");` | `nodeStates[i].removeAttribute("display");` |
| `сузСостояния[ы].setAttribute("display", "none");` | `nodeStates[i].setAttribute("display", "none");` |
| `return узКнопка;` | `return nodeButton;` |
| `const м_Отладка = (() => {` | `const m_Debug = (() => {` |
| `const МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА = 15e4;` | `const MAX_REPORT_STRING_LENGTH = 15e4;` |
| `let _сТокенТрансляции = "";` | `let _sBroadcastToken = "";` |
| `let _сТокенТрансляцииБезРекламы = "";` | `let _sBroadcastTokenWithoutAds = "";` |
| `let _сСписокВариантов = "";` | `let _sVariantList = "";` |
| `let _мсСпискиСегментов = [];` | `let _msSegmentLists = [];` |
| `function ВставитьСсылкиДляСкачиванияФайлов(узФорма) {}` | `function InsertFileDownloadLinks(nodeForm) {}` |
| `function ПоказатьСтраницу() {` | `function ShowPage() {` |
| `м_ПолноэкранныйРежим.Отключить();` | `m_FullscreenMode.Disable();` |
| `for (let уз of document.querySelectorAll('link[rel="stylesheet"], style')) {` | `for (let node of document.querySelectorAll('link[rel="stylesheet"], style')) {` |
| `for (let уз of [document.documentElement, document.body]) {` | `for (let node of [document.documentElement, document.body]) {` |
| `const уз = document.createElement("iframe");` | `const node = document.createElement("iframe");` |
| `м_i18n.TranslateDocument(уз.contentDocument);` | `m_i18n.TranslateDocument(node.contentDocument);` |
| `фВыполнить(уз.contentDocument);` | `fResolve(node.contentDocument);` |
| `function ПоказатьФорму(оДокумент, сИдФормы, лНастроитьФон) {` | `function ShowForm(oDocument, sFormId, bConfigureBackground) {` |
| `if (лНастроитьФон) {` | `if (bConfigureBackground) {` |
| `оДокумент.documentElement.classList.add(сИдФормы);` | `oDocument.documentElement.classList.add(sFormId);` |
| `let узПоказатьИлиСкрыть, сузПоказатьИлиСкрыть = оДокумент.forms, ы = 0;` | `let nodeShowOrHide, nodeForms = oDocument.forms, i = 0;` |
| `(узПоказатьИлиСкрыть = сузПоказатьИлиСкрыть[ы]);` | `(nodeShowOrHide = nodeForms[i]);` |
| `if (узПоказатьИлиСкрыть.id === сИдФормы) {` | `if (nodeShowOrHide.id === sFormId) {` |
| `ПоказатьЭлемент(узПоказатьИлиСкрыть, true);` | `ShowElement(nodeShowOrHide, true);` |
| `const узФокус = узПоказатьИлиСкрыть.querySelector("[autofocus]");` | `const nodeFocus = nodeShowOrHide.querySelector("[autofocus]");` |
| `ПоказатьЭлемент(узПоказатьИлиСкрыть, false);` | `ShowElement(nodeShowOrHide, false);` |
| `function ПоказатьСообщение(сСообщение, сКодСсылки, сАдресСсылки) {` | `function ShowMessage(sMessage, sLinkCode, sLinkAddress) {` |
| `оДокумент.getElementById("отладка-текстсообщения").textContent =` | `oDocument.getElementById("debug-messagetext").textContent =` |
| `сСообщение;` | `sMessage;` |
| `if (сКодСсылки) {` | `if (sLinkCode) {` |
| `const элСсылка = оДокумент.getElementById("отладка-ссылкасообщения");` | `const elLink = oDocument.getElementById("debug-messagelink");` |
| `элСсылка.textContent = Текст(сКодСсылки);` | `elLink.textContent = Text(sLinkCode);` |
| `элСсылка.href = сАдресСсылки;` | `elLink.href = sLinkAddress;` |
| `ПоказатьФорму(оДокумент, "отладка-сообщение", true);` | `ShowForm(oDocument, "debug-message", true);` |
| `function ПоказатьИОтправитьОтчет(оОтчет, буфОтправить) {` | `function ShowAndSendReport(oReport, bufSend) {` |
| `let узФорма;` | `let nodeForm;` |
| `if (оОтчет.ПричинаЗавершенияРаботы === "ОТПРАВИТЬ ОТЗЫВ") {` | `if (oReport.TerminationReason === "SEND FEEDBACK") {` |
| `узФорма = оДокумент.getElementById("отладка-отзыв");` | `nodeForm = oDocument.getElementById("debug-feedback");` |
| `узФорма = оДокумент.getElementById("отладка-ошибка");` | `nodeForm = oDocument.getElementById("debug-error");` |
| `ВставитьСсылкиДляСкачиванияФайлов(узФорма);` | `InsertFileDownloadLinks(nodeForm);` |
| `узФорма.elements["отладка-отчет"].value = JSON.stringify(оОтчет);` | `nodeForm.elements["debug-report"].value = JSON.stringify(oReport);` |
| `ПоказатьФорму(оДокумент, узФорма.id, true);` | `ShowForm(oDocument, nodeForm.id, true);` |
| `оДокумент.addEventListener("reset", (оСобытие) => {` | `oDocument.addEventListener("reset", (oEvent) => {` |
| `оСобытие.preventDefault();` | `oEvent.preventDefault();` |
| `let оЗапрос, оДанные, чКод;` | `let oRequest, oData, nCode;` |
| `оДокумент.addEventListener("submit", (оСобытие) => {` | `oDocument.addEventListener("submit", (oEvent) => {` |
| `оСобытие.preventDefault();` | `oEvent.preventDefault();` |
| `if (оСобытие.target.id === "отладка-идетотправка") {` | `if (oEvent.target.id === "debug-sending") {` |
| `оЗапрос.abort();` | `oRequest.abort();` |
| `оДокумент.getElementById("отладка-ходотправки").value = 0;` | `oDocument.getElementById("debug-sendprogress").value = 0;` |
| `ПоказатьФорму(оДокумент, "отладка-идетотправка", false);` | `ShowForm(oDocument, "debug-sending", false);` |
| `оЗапрос = new XMLHttpRequest();` | `oRequest = new XMLHttpRequest();` |
| `оЗапрос.upload.addEventListener("progress", (оСобытие) => {` | `oRequest.upload.addEventListener("progress", (oEvent) => {` |
| `оДокумент.getElementById("отладка-ходотправки").value =` | `oDocument.getElementById("debug-sendprogress").value =` |
| `оСобытие.loaded / оСобытие.total;` | `oEvent.loaded / oEvent.total;` |
| `оЗапрос.addEventListener("load", () => {` | `oRequest.addEventListener("load", () => {` |
| `оЗапрос.addEventListener("loadend", () => {` | `oRequest.addEventListener("loadend", () => {` |
| `else if (чКод === 474) {` | `else if (nCode === 474) {` |
| `показатьФорму("отладка-браузерустарел", true);` | `showForm("debug-browseroutdated", true);` |
| `else if (чКод >= 400 && чКод <= 499) {` | `else if (nCode >= 400 && nCode <= 499) {` |
| `ПоказатьФорму(оДокумент, "отладка-версияустарела", true);` | `ShowForm(oDocument, "debug-versionoutdated", true);` |
| `ПоказатьФорму(оДокумент, "отладка-сбойотправки", true);` | `ShowForm(oDocument, "debug-sendfailed", true);` |
| `оДанные = new FormData(узФорма);` | `oData = new FormData(nodeForm);` |
| `if (буфОтправить) {` | `if (bufSend) {` |
| `оДанные.append(` | `oData.append(` |
| `"отладка-транспортныйпоток-0",` | `"debug-transportstream-0",` |
| `new Blob([буфОтправить], {` | `new Blob([bufSend], {` |
| `type: "video/mp2t",` | `type: "video/mp2t",` |
| `оЗапрос.open("POST", "http://r90354g8.beget.tech/tw5/report3.php");` | `oRequest.open("POST", "http://r90354g8.beget.tech/tw5/report3.php");` |
| `оЗапрос.send(оДанные);` | `oRequest.send(oData);` |
| `function сохранитьТокенТрансляции(сТокенТрансляции, лБезРекламы) {` | `function saveBroadcastToken(sBroadcastToken, bWithoutAds) {` |
| `сТокенТрансляции = ОграничитьДлинуСтроки(` | `sBroadcastToken = LimitStringLength(` |
| `сТокенТрансляции,` | `sBroadcastToken,` |
| `МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА` | `MAX_REPORT_STRING_LENGTH` |
| `if (лБезРекламы) {` | `if (bWithoutAds) {` |
| `_сТокенТрансляцииБезРекламы = сТокенТрансляции;` | `_sBroadcastTokenWithoutAds = sBroadcastToken;` |
| `_сТокенТрансляции = сТокенТрансляции;` | `_sBroadcastToken = sBroadcastToken;` |
| `function СохранитьСписокВариантов(сСписокВариантов) {` | `function SaveVariantList(sVariantList) {` |
| `_сСписокВариантов = сСписокВариантов;` | `_sVariantList = sVariantList;` |
| `function СохранитьСписокСегментов(сСписокСегментов) {` | `function SaveSegmentList(sSegmentList) {` |
| `if (_мсСпискиСегментов.length === 10) {` | `if (_msSegmentLists.length === 10) {` |
| `_мсСпискиСегментов.shift();` | `_msSegmentLists.shift();` |
| `_мсСпискиСегментов.push(сСписокСегментов);` | `_msSegmentLists.push(sSegmentList);` |
| `function СохранитьТранспортныйПоток(оСегмент) {}` | `function SaveTransportStream(oSegment) {}` |
| `function СохранитьПреобразованныйСегмент(оСегмент) {}` | `function SaveConvertedSegment(oSegment) {}` |
| `function сжатьСписок(сСписок) {` | `function compressList(sList) {` |
| `return ОграничитьДлинуСтроки(` | `return LimitStringLength(` |
| `сСписок.replace(` | `sList.replace(` |
| `(сСтрока) => ОграничитьДлинуСтроки(сСтрока, 100)` | `(sString) => LimitStringLength(sString, 100)` |
| `МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА` | `MAX_REPORT_STRING_LENGTH` |
| `function ОбнюхатьПроцессорИОперативку(фВызвать) {` | `function SniffProcessorAndRAM(fCall) {` |
| `const оПроцессорИОперативка = {` | `const oProcessorAndRAM = {` |
| `capacity: navigator.deviceMemory,` | `capacity: navigator.deviceMemory,` |
| `numOfProcessors: navigator.hardwareConcurrency,` | `numOfProcessors: navigator.hardwareConcurrency,` |
| `оПроцессорИОперативка.jsHeapSizeLimit = Math.round(` | `oProcessorAndRAM.jsHeapSizeLimit = Math.round(` |
| `оПроцессорИОперативка.totalJSHeapSize = Math.round(` | `oProcessorAndRAM.totalJSHeapSize = Math.round(` |
| `оПроцессорИОперативка.usedJSHeapSize = Math.round(` | `oProcessorAndRAM.usedJSHeapSize = Math.round(` |
| `chrome.system.memory.getInfo((оОперативка) => {` | `chrome.system.memory.getInfo((oRAM) => {` |
| `оПроцессорИОперативка.capacity = Округлить(` | `oProcessorAndRAM.capacity = Round(` |
| `оОперативка.capacity / 1024 / 1024 / 1024,` | `oRAM.capacity / 1024 / 1024 / 1024,` |
| `оПроцессорИОперативка.availableCapacity = Округлить(` | `oProcessorAndRAM.availableCapacity = Round(` |
| `оОперативка.availableCapacity / 1024 / 1024 / 1024,` | `oRAM.availableCapacity / 1024 / 1024 / 1024,` |
| `chrome.system.cpu.getInfo((оПроцессор) => {` | `chrome.system.cpu.getInfo((oProcessor) => {` |
| `оПроцессорИОперативка.numOfProcessors =` | `oProcessorAndRAM.numOfProcessors =` |
| `оПроцессор.numOfProcessors;` | `oProcessor.numOfProcessors;` |
| `оПроцессорИОперативка.modelName = оПроцессор.modelName;` | `oProcessorAndRAM.modelName = oProcessor.modelName;` |
| `оПроцессорИОперативка.archName = оПроцессор.archName;` | `oProcessorAndRAM.archName = oProcessor.archName;` |
| `фВызвать(оПроцессорИОперативка);` | `fCall(oProcessorAndRAM);` |
| `фВызвать(оПроцессорИОперативка);` | `fCall(oProcessorAndRAM);` |
| `фВызвать(оПроцессорИОперативка);` | `fCall(oProcessorAndRAM);` |
| `function ОбнюхатьВидюху() {` | `function SniffGPU() {` |
| `function получитьПараметрыСоединения() {` | `function getConnectionParameters() {` |
| `const оСоединение = navigator.connection || {};` | `const oConnection = navigator.connection || {};` |
| `online: navigator.onLine,` | `online: navigator.onLine,` |
| `effectiveType: оСоединение.effectiveType,` | `effectiveType: oConnection.effectiveType,` |
| `downlink: оСоединение.downlink,` | `downlink: oConnection.downlink,` |
| `rtt: оСоединение.rtt,` | `rtt: oConnection.rtt,` |
| `type: оСоединение.type,` | `type: oConnection.type,` |
| `downlinkMax: оСоединение.downlinkMax,` | `downlinkMax: oConnection.downlinkMax,` |
| `function ПолучитьЯзыки() {` | `function GetLanguages() {` |
| `return \`\${navigator.language} | \${navigator.languages} | \${Текст(}\`;` | `return \`\${navigator.language} | \${navigator.languages} | \${Text(}\`;` |
| `function ПолучитьУстановкиДаты() {` | `function GetDateSettings() {` |
| `const оУстановки = new Intl.DateTimeFormat().resolvedOptions();` | `const oSettings = new Intl.DateTimeFormat().resolvedOptions();` |
| `оУстановки.timezoneOffset = new Date().getTimezoneOffset();` | `oSettings.timezoneOffset = new Date().getTimezoneOffset();` |
| `return оУстановки;` | `return oSettings;` |
| `function СоздатьПоказатьИОтправитьОтчет(` | `function CreateShowAndSendReport(` |
| `сПричинаЗавершенияРаботы,` | `sTerminationReason,` |
| `буфОтправить` | `bufSend` |
| `ОбнюхатьПроцессорИОперативку((оПроцессорИОперативка) => {` | `SniffProcessorAndRAM((oProcessorAndRAM) => {` |
| `ПоказатьИОтправитьОтчет(` | `ShowAndSendReport(` |
| `ПричинаЗавершенияРаботы: сПричинаЗавершенияРаботы,` | `TerminationReason: sTerminationReason,` |
| `ВерсияРасширения: ВЕРСИЯ_РАСШИРЕНИЯ,` | `ExtensionVersion: EXTENSION_VERSION,` |
| `Оборзеватель: navigator.userAgent,` | `Browser: navigator.userAgent,` |
| `Время: new Date().toISOString(),` | `Time: new Date().toISOString(),` |
| `Адрес: window.location.href,` | `Address: window.location.href,` |
| `Инкогнито: chrome.extension.inIncognitoContext,` | `Incognito: chrome.extension.inIncognitoContext,` |
| `Рассинхронизация: Date.now() - performance.now() - г_чТочноеВремя,` | `Desync: Date.now() - performance.now() - g_nExactTime,` |
| `Фокусник: м_Фокусник.ПолучитьСостояние(),` | `FocusManager: m_FocusManager.GetState(),` |
| `Пульс: м_Пульс.ПолучитьДанныеДляОтчета(),` | `Heartbeat: m_Heartbeat.GetDataForReport(),` |
| `Настройки: м_Настройки.ПолучитьДанныеДляОтчета(),` | `Settings: m_Settings.GetDataForReport(),` |
| `Статистика: м_Статистика.ПолучитьДанныеДляОтчета(),` | `Statistics: m_Statistics.GetDataForReport(),` |
| `Языки: ПолучитьЯзыки(),` | `Languages: GetLanguages(),` |
| `УстановкиДаты: ПолучитьУстановкиДаты(),` | `DateSettings: GetDateSettings(),` |
| `Соединение: получитьПараметрыСоединения(),` | `Connection: getConnectionParameters(),` |
| `Видюха: ОбнюхатьВидюху(),` | `GPU: SniffGPU(),` |
| `ПроцессорИОперативка: оПроцессорИОперативка,` | `ProcessorAndRAM: oProcessorAndRAM,` |
| `ТочекКасания: navigator.maxTouchPoints,` | `TouchPoints: navigator.maxTouchPoints,` |
| `Экран: {` | `Screen: {` |
| `ТокенТрансляции: _сТокенТрансляции,` | `BroadcastToken: _sBroadcastToken,` |
| `ТокенТрансляцииБезРекламы: _сТокенТрансляцииБезРекламы,` | `BroadcastTokenWithoutAds: _sBroadcastTokenWithoutAds,` |
| `СписокВариантов: сжатьСписок(_сСписокВариантов),` | `VariantList: compressList(_sVariantList),` |
| `СпискиСегментов: _мсСпискиСегментов.map(сжатьСписок),` | `SegmentLists: _msSegmentLists.map(compressList),` |
| `Журнал: м_Журнал.ПолучитьДанныеДляОтчета(),` | `Log: m_Log.GetDataForReport(),` |
| `буфОтправить` | `bufSend` |
| `function ЗавершитьРаботуИПоказатьСообщение(` | `function TerminateAndShowMessage(` |
| `сКодСообщения,` | `sMessageCode,` |
| `сКодСсылки,` | `sLinkCode,` |
| `сАдресСсылки` | `sLinkAddress` |
| `if (!г_лРаботаЗавершена) {` | `if (!g_bWorkTerminated) {` |
| `ЗавершитьРаботу(false);` | `Terminate(false);` |
| `ПоказатьСообщение(Текст(сКодСообщения), сКодСсылки, сАдресСсылки);` | `ShowMessage(Text(sMessageCode), sLinkCode, sLinkAddress);` |
| `function ЗавершитьРаботуИОтправитьОтчет(` | `function TerminateAndSendReport(` |
| `сПричинаЗавершенияРаботы,` | `sTerminationReason,` |
| `буфОтправить` | `bufSend` |
| `if (!г_лРаботаЗавершена) {` | `if (!g_bWorkTerminated) {` |
| `сПричинаЗавершенияРаботы = ОграничитьДлинуСтроки(` | `sTerminationReason = LimitStringLength(` |
| `String(сПричинаЗавершенияРаботы),` | `String(sTerminationReason),` |
| `МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА` | `MAX_REPORT_STRING_LENGTH` |
| `if (сПричинаЗавершенияРаботы.includes("out of memory")) {` | `if (sTerminationReason.includes("out of memory")) {` |
| `ЗавершитьРаботуИПоказатьСообщение("J0200");` | `TerminateAndShowMessage("J0200");` |
| `м_Проигрыватель.ПоказатьСостояние("Вот", "Завершаю работу");` | `m_Player.ShowState("Log", "Terminating work");` |
| `г_моОчередь.ПоказатьСостояние();` | `g_maQueue.ShowState();` |
| `ЗавершитьРаботу(false);` | `Terminate(false);` |
| `СоздатьПоказатьИОтправитьОтчет(сПричинаЗавершенияРаботы, буфОтправить);` | `CreateShowAndSendReport(sTerminationReason, bufSend);` |
| `function ПойманоИсключение(пИсключение) {` | `function CaughtException(pException) {` |
| `ЗавершитьРаботуИОтправитьОтчет(ПеревестиИсключениеВСтроку(пИсключение));` | `TerminateAndSendReport(ConvertExceptionToString(pException));` |
| `function ЗавершитьРаботуИОтправитьОтзыв() {` | `function TerminateAndSendFeedback() {` |
| `ЗавершитьРаботуИОтправитьОтчет("ОТПРАВИТЬ ОТЗЫВ");` | `TerminateAndSendReport("SEND FEEDBACK");` |
| `ПойманоИсключение,` | `CaughtException,` |
| `ЗавершитьРаботуИПоказатьСообщение,` | `TerminateAndShowMessage,` |
| `ЗавершитьРаботуИОтправитьОтчет,` | `TerminateAndSendReport,` |
| `ЗавершитьРаботуИОтправитьОтзыв,` | `TerminateAndSendFeedback,` |
| `сохранитьТокенТрансляции,` | `saveBroadcastToken,` |
| `СохранитьСписокВариантов,` | `SaveVariantList,` |
| `СохранитьСписокСегментов,` | `SaveSegmentList,` |
| `СохранитьТранспортныйПоток,` | `SaveTransportStream,` |
| `СохранитьПреобразованныйСегмент,` | `SaveConvertedSegment,` |
| `class ОтменаОбещания {` | `class PromiseCancellation {` |
| `constructor() {` | `constructor() {` |
| `this.лОтменено = false;` | `this.bCancelled = false;` |
| `this._фОбработчик = null;` | `this._fHandler = null;` |
| `Отменить() {` | `Cancel() {` |
| `this.лОтменено = true;` | `this.bCancelled = true;` |
| `if (this._фОбработчик) {` | `if (this._fHandler) {` |
| `this._фОбработчик();` | `this._fHandler();` |
| `this._фОбработчик = null;` | `this._fHandler = null;` |
| `ЗаменитьОбработчик(фОбработчик) {` | `ReplaceHandler(fHandler) {` |
| `Проверить(!this.лОтменено);` | `Check(!this.bCancelled);` |
| `Проверить(typeof фОбработчик == "function" || фОбработчик === null);` | `Check(typeof fHandler == "function" || fHandler === null);` |
| `this._фОбработчик = фОбработчик;` | `this._fHandler = fHandler;` |
| `ОтменаОбещания.ПРИЧИНА = new Error("ОБЕЩАНИЕ_ОТМЕНЕНО");` | `PromiseCancellation.REASON = new Error("PROMISE_CANCELLED");` |
| `function Ждать(оОтменаОбещания, чМиллисекунды) {` | `function Wait(oPromiseCancellation, nMilliseconds) {` |
| `if (оОтменаОбещания && оОтменаОбещания.лОтменено) {` | `if (oPromiseCancellation && oPromiseCancellation.bCancelled) {` |
| `return Promise.reject(ОтменаОбещания.ПРИЧИНА);` | `return Promise.reject(PromiseCancellation.REASON);` |
| `let оОбещание = Promise.resolve();` | `let oPromise = Promise.resolve();` |
| `if (оОтменаОбещания) {` | `if (oPromiseCancellation) {` |
| `оОбещание = оОбещание.then(() => {` | `oPromise = oPromise.then(() => {` |
| `if (оОтменаОбещания.лОтменено) {` | `if (oPromiseCancellation.bCancelled) {` |
| `throw ОтменаОбещания.ПРИЧИНА;` | `throw PromiseCancellation.REASON;` |
| `Проверить(Number.isFinite(чМиллисекунды));` | `Check(Number.isFinite(nMilliseconds));` |
| `чМиллисекунды = Math.round(чМиллисекунды);` | `nMilliseconds = Math.round(nMilliseconds);` |
| `Проверить(чМиллисекунды >= 0 && чМиллисекунды <= 2147483647);` | `Check(nMilliseconds >= 0 && nMilliseconds <= 2147483647);` |
| `if (оОтменаОбещания) {` | `if (oPromiseCancellation) {` |
| `return new Promise((фВыполнить, фОтказаться) => {` | `return new Promise((fResolve, fReject) => {` |
| `const чТаймер = setTimeout(() => {` | `const nTimer = setTimeout(() => {` |
| `оОтменаОбещания.ЗаменитьОбработчик(null);` | `oPromiseCancellation.ReplaceHandler(null);` |
| `фВыполнить();` | `fResolve();` |
| `оОтменаОбещания.ЗаменитьОбработчик(() => {` | `oPromiseCancellation.ReplaceHandler(() => {` |
| `clearTimeout(чТаймер);` | `clearTimeout(nTimer);` |
| `фОтказаться(ОтменаОбещания.ПРИЧИНА);` | `fReject(PromiseCancellation.REASON);` |
| `return new Promise((фВыполнить) => {` | `return new Promise((fResolve) => {` |
| `setTimeout(фВыполнить, чМиллисекунды);` | `setTimeout(fResolve, nMilliseconds);` |
| `class Сегмент {` | `class Segment {` |
| `constructor(чОбработка, пДанные, чДлительность, лРазрыв, чНомер) {` | `constructor(nProcessing, pData, nDuration, bDiscontinuity, nNumber) {` |
| `Проверить(` | `Check(` |
| `typeof чОбработка == "number" &&` | `typeof nProcessing == "number" &&` |
| `чОбработка >= ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ &&` | `nProcessing >= PROCESSING_AWAITING_DOWNLOAD &&` |
| `чОбработка <= ОБРАБОТКА_ПРЕОБРАЗОВАН` | `nProcessing <= PROCESSING_CONVERTED` |
| `Проверить(` | `Check(` |
| `(typeof пДанные == "number" && чОбработка >= ОБРАБОТКА_ЗАГРУЖЕН) ||` | `(typeof pData == "number" && nProcessing >= PROCESSING_DOWNLOADED) ||` |
| `(typeof пДанные == "string" &&` | `(typeof pData == "string" &&` |
| `чОбработка === ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ) ||` | `nProcessing === PROCESSING_AWAITING_DOWNLOAD) ||` |
| `(ЭтоОбъект(пДанные) && чОбработка > ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ)` | `(IsObject(pData) && nProcessing > PROCESSING_AWAITING_DOWNLOAD)` |
| `case 2:` | `case 2:` |
| `чДлительность = 0;` | `nDuration = 0;` |
| `лРазрыв = true;` | `bDiscontinuity = true;` |
| `case 4:` | `case 4:` |
| `Проверить(Number.isFinite(чДлительность) && чДлительность >= 0);` | `Check(Number.isFinite(nDuration) && nDuration >= 0);` |
| `Проверить(typeof лРазрыв == "boolean");` | `Check(typeof bDiscontinuity == "boolean");` |
| `чНомер = ++Сегмент._чНомер;` | `nNumber = ++Segment._nNumber;` |
| `case 5:` | `case 5:` |
| `Проверить(Number.isFinite(чНомер));` | `Check(Number.isFinite(nNumber));` |
| `if (typeof пДанные == "number") {` | `if (typeof pData == "number") {` |
| `м_Журнал.Вот(`[Очередь] Добавлен сегмент ${чНомер} Состояние=${пДанные} Обработка=${чОбработка}`);` | `m_Log.Log(`[Queue] Added segment ${nNumber} State=${pData} Processing=${nProcessing}`);` |
| `this.чОбработка = чОбработка;` | `this.nProcessing = nProcessing;` |
| `this.пДанные = пДанные;` | `this.pData = pData;` |
| `this.чДлительность = чДлительность;` | `this.nDuration = nDuration;` |
| `this.лРазрыв = лРазрыв;` | `this.bDiscontinuity = bDiscontinuity;` |
| `this.чНомер = чНомер;` | `this.nNumber = nNumber;` |
| `toString() {` | `toString() {` |
| `if (typeof this.пДанные == "number") {` | `if (typeof this.pData == "number") {` |
| `return \`\${this.чНомер}-\${this.чОбработка}-\${this.пДанные}\`;` | `return \`\${this.nNumber}-\${this.nProcessing}-\${this.pData}\`;` |
| `if (this.лРазрыв) {` | `if (this.bDiscontinuity) {` |
| `return \`\${this.чНомер}-\${this.чОбработка}-Р\`;` | `return \`\${this.nNumber}-\${this.nProcessing}-D\`;` |
| `return \`\${this.чНомер}-\${this.чОбработка}\`;` | `return \`\${this.nNumber}-\${this.nProcessing}\`;` |
| `Сегмент._чНомер = 0;` | `Segment._nNumber = 0;` |
| `let г_моОчередь = [];` | `let g_maQueue = [];` |
| `г_моОчередь.ПодсчитатьПреобразованныеСегменты = function () {` | `g_maQueue.CountConvertedSegments = function () {` |
| `let кКоличество = 0,` | `let nAmount = 0,` |
| `чДлительность = 0;` | `nDuration = 0;` |
| `кКоличество < this.length &&` | `nAmount < this.length &&` |
| `this[кКоличество].чОбработка === ОБРАБОТКА_ПРЕОБРАЗОВАН;` | `this[nAmount].nProcessing === PROCESSING_CONVERTED;` |
| `if (typeof this[кКоличество].пДанные != "number") {` | `if (typeof this[nAmount].pData != "number") {` |
| `чДлительность += this[кКоличество].чДлительность;` | `nDuration += this[nAmount].nDuration;` |
| `кКоличество,` | `nAmount,` |
| `чДлительность,` | `nDuration,` |
| `г_моОчередь.Добавить = function (оСегмент) {` | `g_maQueue.Add = function (oSegment) {` |
| `Проверить(оСегмент instanceof Сегмент);` | `Check(oSegment instanceof Segment);` |
| `for (let о of this) {` | `for (let o of this) {` |
| `Проверить(о.чНомер !== оСегмент.чНомер);` | `Check(o.nNumber !== oSegment.nNumber);` |
| `if (оСегмент.чОбработка !== ОБРАБОТКА_ПРЕОБРАЗОВАН) {` | `if (oSegment.nProcessing !== PROCESSING_CONVERTED) {` |
| `this.push(оСегмент);` | `this.push(oSegment);` |
| `const { кКоличество, чДлительность } =` | `const { nAmount, nDuration } =` |
| `this.ПодсчитатьПреобразованныеСегменты();` | `this.CountConvertedSegments();` |
| `if (чДлительность > ПЕРЕПОЛНЕНИЕ_БУФЕРА * 1.5) {` | `if (nDuration > BUFFER_OVERFLOW * 1.5) {` |
| `м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0208");` | `m_Debug.TerminateAndShowMessage("J0208");` |
| `this.splice(кКоличество, 0, оСегмент);` | `this.splice(nAmount, 0, oSegment);` |
| `return оСегмент;` | `return oSegment;` |
| `г_моОчередь.Удалить = function (пЭлемент, кКоличество = 1) {` | `g_maQueue.Remove = function (pElement, nAmount = 1) {` |
| `Проверить(Number.isInteger(кКоличество) && кКоличество > 0);` | `Check(Number.isInteger(nAmount) && nAmount > 0);` |
| `let чИндекс;` | `let nIndex;` |
| `if (typeof пЭлемент == "number") {` | `if (typeof pElement == "number") {` |
| `Проверить(Number.isInteger(пЭлемент) && пЭлемент >= 0);` | `Check(Number.isInteger(pElement) && pElement >= 0);` |
| `чИндекс = пЭлемент;` | `nIndex = pElement;` |
| `else if ((чИндекс = this.indexOf(пЭлемент)) === -1) {` | `else if ((nIndex = this.indexOf(pElement)) === -1) {` |
| `Проверить(пЭлемент instanceof Сегмент);` | `Check(pElement instanceof Segment);` |
| `while (--кКоличество >= 0) {` | `while (--nAmount >= 0) {` |
| `Проверить(чИндекс < this.length);` | `Check(nIndex < this.length);` |
| `switch (this[чИндекс].чОбработка) {` | `switch (this[nIndex].nProcessing) {` |
| `case ОБРАБОТКА_ЗАГРУЖАЕТСЯ:` | `case PROCESSING_DOWNLOADING:` |
| `if (ЭтоОбъект(this[чИндекс].пДанные)) {` | `if (IsObject(this[nIndex].pData)) {` |
| `м_Журнал.Вот(`[Очередь] Отменяю загрузку ${this[чИндекс]}`);` | `m_Log.Log(`[Queue] Cancelling download ${this[nIndex]}`);` |
| `this[чИндекс].пДанные.Отменить();` | `this[nIndex].pData.Cancel();` |
| `case ОБРАБОТКА_ЗАГРУЖЕН:` | `case PROCESSING_DOWNLOADED:` |
| `м_Помойка.Выбросить(this[чИндекс].пДанные);` | `m_GarbageCollector.Discard(this[nIndex].pData);` |
| `case ОБРАБОТКА_ПРЕОБРАЗОВАН:` | `case PROCESSING_CONVERTED:` |
| `if (ЭтоОбъект(this[чИндекс].пДанные)) {` | `if (IsObject(this[nIndex].pData)) {` |
| `м_Помойка.Выбросить(this[чИндекс].пДанные.мбСегментИнициализации);` | `m_GarbageCollector.Discard(this[nIndex].pData.mbInitializationSegment);` |
| `м_Помойка.Выбросить(this[чИндекс].пДанные.мбМедиасегмент);` | `m_GarbageCollector.Discard(this[nIndex].pData.mbMediaSegment);` |
| `м_Журнал.Вот(`[Очередь] Удаляю ${this[чИндекс]}`);` | `m_Log.Log(`[Queue] Removing ${this[nIndex]}`);` |
| `this.splice(чИндекс, 1);` | `this.splice(nIndex, 1);` |
| `г_моОчередь.Очистить = function () {` | `g_maQueue.Clear = function () {` |
| `this.Удалить(0, this.length);` | `this.Remove(0, this.length);` |
| `г_моОчередь.ПоказатьСостояние = function () {` | `g_maQueue.ShowState = function () {` |
| `м_Журнал.Вот(`[Очередь] ${this.join(" ")}`);` | `m_Log.Log(`[Queue] ${this.join(" ")}`);` |
| `class ВводЧисла {` | `class NumberInput {` |
| `constructor(сИмяНастройки, чШаг, чТочность, сИдУзла) {` | `constructor(sSettingName, nStep, nPrecision, sNodeId) {` |
| `Проверить(чТочность >= 0 && ЭтоНепустаяСтрока(сИдУзла));` | `Check(nPrecision >= 0 && IsNonEmptyString(sNodeId));` |
| `this._сИмяНастройки = сИмяНастройки;` | `this._sSettingName = sSettingName;` |
| `this._чШаг = чШаг;` | `this._nStep = nStep;` |
| `this._чТочность = чТочность;` | `this._nPrecision = nPrecision;` |
| `this._чДобавить = 0;` | `this._nToAdd = 0;` |
| `this._кИнтервал = 0;` | `this._nInterval = 0;` |
| `this._чТаймер = 0;` | `this._nTimer = 0;` |
| `м_События.ДобавитьОбработчик("тащилка-перетаскивание-${сИдУзла}", (оПараметры) => this._ОбработатьПеретаскивание(оПараметры))` | `m_Events.AddHandler("dragger-drag-${sNodeId}", (oParameters) => this._HandleDrag(oParameters))` |
| `this._узЧисло = document.querySelector(\`#\${сИдУзла} > .вводчисла-число\`);` | `this._nodeNumber = document.querySelector(\`#\${sNodeId} > .numberinput-number\`);` |
| `Обновить(чЗначение = м_Настройки.Получить(this._сИмяНастройки)) {` | `Update(nValue = m_Settings.Get(this._sSettingName)) {` |
| `this._узЧисло.value =` | `this._nodeNumber.value =` |
| `чЗначение === АВТОНАСТРОЙКА` | `nValue === AUTO_SETTING` |
| `м_Настройки.ПолучитьПараметрыНастройки(this._сИмяНастройки)` | `m_Settings.GetSettingParameters(this._sSettingName)` |
| `.сАвтонастройка` | `.sAutoSetting` |
| `м_i18n.ФорматироватьЧисло(чЗначение, this._чТочность);` | `m_i18n.FormatNumber(nValue, this._nPrecision);` |
| `_ОбработатьПеретаскивание(оПараметры) {` | `_HandleDrag(oParameters) {` |
| `const ИНТЕРВАЛ_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ = 130;` | `const VALUE_CHANGE_INTERVAL = 130;` |
| `if (оПараметры.чШаг === 1) {` | `if (oParameters.nStep === 1) {` |
| `this._чДобавить = оПараметры.узНажат.classList.contains("вводчисла-минус")` | `this._nToAdd = oParameters.nodePressed.classList.contains("numberinput-minus")` |
| `-this._чШаг` | `-this._nStep` |
| `this._чШаг;` | `this._nStep;` |
| `this._кИнтервал = 0;` | `this._nInterval = 0;` |
| `this._чТаймер = setInterval(` | `this._nTimer = setInterval(` |
| `() => this._ОбработатьТаймер(),` | `() => this._HandleTimer(),` |
| `ИНТЕРВАЛ_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ` | `VALUE_CHANGE_INTERVAL` |
| `this._ОбработатьТаймер();` | `this._HandleTimer();` |
| `if (оПараметры.чШаг === 3) {` | `if (oParameters.nStep === 3) {` |
| `clearInterval(this._чТаймер);` | `clearInterval(this._nTimer);` |
| `ВводЧисла.prototype._ОбработатьТаймер = ДобавитьОбработчикИсключений(` | `NumberInput.prototype._HandleTimer = AddExceptionHandler(` |
| `function () {` | `function () {` |
| `const ЗАДЕРЖКА_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ = 3;` | `const VALUE_CHANGE_DELAY = 3;` |
| `if (` | `if (` |
| `++this._кИнтервал == 1 ||` | `++this._nInterval == 1 ||` |
| `this._кИнтервал > ЗАДЕРЖКА_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ` | `this._nInterval > VALUE_CHANGE_DELAY` |
| `const оПараметрыНастройки = м_Настройки.ПолучитьПараметрыНастройки(` | `const oSettingParameters = m_Settings.GetSettingParameters(` |
| `this._сИмяНастройки` | `this._sSettingName` |
| `const чЗначение = м_Настройки.Получить(this._сИмяНастройки);` | `const nValue = m_Settings.Get(this._sSettingName);` |
| `let чНовоеЗначение;` | `let nNewValue;` |
| `оПараметрыНастройки.сАвтонастройка &&` | `oSettingParameters.sAutoSetting &&` |
| `this._чДобавить < 0 &&` | `this._nToAdd < 0 &&` |
| `чЗначение === оПараметрыНастройки.чМинимальное) ||` | `nValue === oSettingParameters.nMin) ||` |
| `оПараметрыНастройки.сАвтонастройка &&` | `oSettingParameters.sAutoSetting &&` |
| `this._чДобавить > 0 &&` | `this._nToAdd > 0 &&` |
| `чЗначение === оПараметрыНастройки.чМаксимальное)` | `nValue === oSettingParameters.nMax)` |
| `чНовоеЗначение = АВТОНАСТРОЙКА;` | `nNewValue = AUTO_SETTING;` |
| `else if (чЗначение === АВТОНАСТРОЙКА && this._чДобавить > 0) {` | `else if (nValue === AUTO_SETTING && this._nToAdd > 0) {` |
| `чНовоеЗначение = оПараметрыНастройки.чМинимальное;` | `nNewValue = oSettingParameters.nMin;` |
| `else if (чЗначение === АВТОНАСТРОЙКА && this._чДобавить < 0) {` | `else if (nValue === AUTO_SETTING && this._nToAdd < 0) {` |
| `чНовоеЗначение = оПараметрыНастройки.чМаксимальное;` | `nNewValue = oSettingParameters.nMax;` |
| `чНовоеЗначение = чЗначение + this._чДобавить;` | `nNewValue = nValue + this._nToAdd;` |
| `if (чНовоеЗначение !== АВТОНАСТРОЙКА) {` | `if (nNewValue !== AUTO_SETTING) {` |
| `чНовоеЗначение = Ограничить(` | `nNewValue = Clamp(` |
| `Округлить(чНовоеЗначение, this._чТочность),` | `Round(nNewValue, this._nPrecision),` |
| `оПараметрыНастройки.чМинимальное,` | `oSettingParameters.nMin,` |
| `оПараметрыНастройки.чМаксимальное` | `oSettingParameters.nMax` |
| `if (чНовоеЗначение !== чЗначение) {` | `if (nNewValue !== nValue) {` |
| `м_Настройки.Изменить(this._сИмяНастройки, чНовоеЗначение);` | `m_Settings.Set(this._sSettingName, nNewValue);` |
| `this.Обновить(чНовоеЗначение);` | `this.Update(nNewValue);` |
| `this.ПослеИзменения(чНовоеЗначение);` | `this.AfterChange(nNewValue);` |
| `ВводЧисла.prototype.ПослеИзменения = ЗАГЛУШКА;` | `NumberInput.prototype.AfterChange = STUB;` |
| `const м_События = (() => {` | `const m_Events = (() => {` |
| `let _амОбработчики = new Map();` | `let _amHandlers = new Map();` |
| `function ДобавитьОбработчик(сСобытие, фОбработчик) {` | `function AddHandler(sEvent, fHandler) {` |
| `Проверить(ЭтоНепустаяСтрока(сСобытие));` | `Check(IsNonEmptyString(sEvent));` |
| `Проверить(typeof фОбработчик == "function" || ЭтоОбъект(фОбработчик));` | `Check(typeof fHandler == "function" || IsObject(fHandler));` |
| `let мноОбработчикиСобытия = _амОбработчики.get(сСобытие);` | `let setEventHandlers = _amHandlers.get(sEvent);` |
| `if (мноОбработчикиСобытия === void 0) {` | `if (setEventHandlers === void 0) {` |
| `мноОбработчикиСобытия = new Set();` | `setEventHandlers = new Set();` |
| `_амОбработчики.set(сСобытие, мноОбработчикиСобытия);` | `_amHandlers.set(sEvent, setEventHandlers);` |
| `мноОбработчикиСобытия.add(фОбработчик);` | `setEventHandlers.add(fHandler);` |
| `function УдалитьОбработчик(сСобытие, фОбработчик) {` | `function RemoveHandler(sEvent, fHandler) {` |
| `Проверить(ЭтоНепустаяСтрока(сСобытие));` | `Check(IsNonEmptyString(sEvent));` |
| `Проверить(typeof фОбработчик == "function" || ЭтоОбъект(фОбработчик));` | `Check(typeof fHandler == "function" || IsObject(fHandler));` |
| `const мноОбработчикиСобытия = _амОбработчики.get(сСобытие);` | `const setEventHandlers = _amHandlers.get(sEvent);` |
| `if (мноОбработчикиСобытия !== void 0) {` | `if (setEventHandlers !== void 0) {` |
| `мноОбработчикиСобытия.delete(фОбработчик);` | `setEventHandlers.delete(fHandler);` |
| `if (мноОбработчикиСобытия.size === 0) {` | `if (setEventHandlers.size === 0) {` |
| `_амОбработчики.delete(сСобытие);` | `_amHandlers.delete(sEvent);` |
| `function ПослатьСобытие(сСобытие, пДанные) {` | `function SendEvent(sEvent, pData) {` |
| `Проверить(ЭтоНепустаяСтрока(сСобытие));` | `Check(IsNonEmptyString(sEvent));` |
| `м_Журнал.Вот(`[События] Произошло событие ${сСобытие}`);` | `m_Log.Log(`[Events] Event ${sEvent} occurred`);` |
| `const мноОбработчикиСобытия = _амОбработчики.get(сСобытие);` | `const setEventHandlers = _amHandlers.get(sEvent);` |
| `if (мноОбработчикиСобытия !== void 0) {` | `if (setEventHandlers !== void 0) {` |
| `Проверить(мноОбработчикиСобытия.size !== 0);` | `Check(setEventHandlers.size !== 0);` |
| `let оСобытие;` | `let oEvent;` |
| `for (let фОбработчик of мноОбработчикиСобытия.values()) {` | `for (let fHandler of setEventHandlers.values()) {` |
| `if (typeof фОбработчик == "function") {` | `if (typeof fHandler == "function") {` |
| `фОбработчик(пДанные, сСобытие);` | `fHandler(pData, sEvent);` |
| `if (оСобытие === void 0) {` | `if (oEvent === void 0) {` |
| `оСобытие = {` | `oEvent = {` |
| `type: сСобытие,` | `type: sEvent,` |
| `data: пДанные,` | `data: pData,` |
| `фОбработчик.handleEvent(оСобытие);` | `fHandler.handleEvent(oEvent);` |
| `ДобавитьОбработчик,` | `AddHandler,` |
| `УдалитьОбработчик,` | `RemoveHandler,` |
| `ПослатьСобытие,` | `SendEvent,` |
| `const м_Помойка = (() => {` | `const m_GarbageCollector = (() => {` |
| `class ПомойкаВКаналеСообщений {` | `class MessageChannelGarbageCollector {` |
| `constructor() {` | `constructor() {` |
| `this._оКаналСообщений = null;` | `this._oMessageChannel = null;` |
| `Выбросить(пБарахло) {` | `Discard(pJunk) {` |
| `if (ЭтоОбъект(пБарахло)) {` | `if (IsObject(pJunk)) {` |
| `const буфБарахло = пБарахло.buffer ? пБарахло.buffer : пБарахло;` | `const bufJunk = pJunk.buffer ? pJunk.buffer : pJunk;` |
| `if (буфБарахло.byteLength) {` | `if (bufJunk.byteLength) {` |
| `м_Журнал.Вот(`[Помойка] Выбрасываю ${буфБарахло.byteLength} байтов`);` | `m_Log.Log(`[GarbageCollector] Discarding ${bufJunk.byteLength} bytes`);` |
| `if (this._оКаналСообщений === null) {` | `if (this._oMessageChannel === null) {` |
| `this._оКаналСообщений = new MessageChannel();` | `this._oMessageChannel = new MessageChannel();` |
| `this._оКаналСообщений.port2.close();` | `this._oMessageChannel.port2.close();` |
| `this._оКаналСообщений.port1.postMessage(буфБарахло, [буфБарахло]);` | `this._oMessageChannel.port1.postMessage(bufJunk, [bufJunk]);` |
| `Сжечь() {}` | `Burn() {}` |
| `class ПомойкаВРабочемПотоке {` | `class WorkerThreadGarbageCollector {` |
| `constructor() {` | `constructor() {` |
| `this._оРабочийПоток = null;` | `this._oWorkerThread = null;` |
| `this._кбВПомойке = 0;` | `this._kbInGarbage = 0;` |
| `м_События.ДобавитьОбработчик("управление-изменилосьсостояние", (чСостояние) => {` | `m_Events.AddHandler("control-statechanged", (nState) => {` |
| `if (` | `if (` |
| `чСостояние === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ ||` | `nState === STATE_BROADCAST_END ||` |
| `чСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||` | `nState === STATE_STOP ||` |
| `чСостояние === СОСТОЯНИЕ_ПОВТОР` | `nState === STATE_REPEAT` |
| `this.Сжечь();` | `this.Burn();` |
| `Выбросить(пБарахло) {` | `Discard(pJunk) {` |
| `const ВМЕСТИМОСТЬ_ПОМОЙКИ = 1e7;` | `const GARBAGE_CAPACITY = 1e7;` |
| `if (ЭтоОбъект(пБарахло)) {` | `if (IsObject(pJunk)) {` |
| `const буфБарахло = пБарахло.buffer ? пБарахло.buffer : пБарахло;` | `const bufJunk = pJunk.buffer ? pJunk.buffer : pJunk;` |
| `if (буфБарахло.byteLength) {` | `if (bufJunk.byteLength) {` |
| `м_Журнал.Вот(`[Помойка] Выбрасываю ${буфБарахло.byteLength} байтов`);` | `m_Log.Log(`[GarbageCollector] Discarding ${bufJunk.byteLength} bytes`);` |
| `if (this._оРабочийПоток === null) {` | `if (this._oWorkerThread === null) {` |
| `this._оРабочийПоток = new Worker("/recycler.js");` | `this._oWorkerThread = new Worker("/recycler.js");` |
| `this._кбВПомойке += буфБарахло.byteLength;` | `this._kbInGarbage += bufJunk.byteLength;` |
| `this._оРабочийПоток.postMessage(буфБарахло, [буфБарахло]);` | `this._oWorkerThread.postMessage(bufJunk, [bufJunk]);` |
| `if (this._кбВПомойке > ВМЕСТИМОСТЬ_ПОМОЙКИ) {` | `if (this._kbInGarbage > GARBAGE_CAPACITY) {` |
| `this.Сжечь();` | `this.Burn();` |
| `Сжечь() {` | `Burn() {` |
| `if (this._оРабочийПоток !== null) {` | `if (this._oWorkerThread !== null) {` |
| `м_Журнал.Вот(`[Помойка] Сжигаю ${this._кбВПомойке} байтов`);` | `m_Log.Log(`[GarbageCollector] Burning ${this._kbInGarbage} bytes`);` |
| `this._оРабочийПоток.postMessage(null);` | `this._oWorkerThread.postMessage(null);` |
| `this._оРабочийПоток = null;` | `this._oWorkerThread = null;` |
| `this._кбВПомойке = 0;` | `this._kbInGarкой = 0;` |
| `if (этоМобильноеУстройство()) {` | `if (isMobileDevice()) {` |
| `Выбросить: ЗАГЛУШКА,` | `Discard: STUB,` |
| `Сжечь: ЗАГЛУШКА,` | `Burn: STUB,` |
| `return получитьВерсиюДвижкаБраузера() < 67` | `return getBrowserEngineVersion() < 67` |
| `? new ПомойкаВРабочемПотоке()` | `? new WorkerThreadGarbageCollector()` |
| `: new ПомойкаВКаналеСообщений();` | `new MessageChannelGarbageCollector();` |
| `Выбросить,` | `Discard,` |
| `Сжечь,` | `Burn,` |
| `const м_Фокусник = (() => {` | `const m_FocusManager = (() => {` |
| `let _оСостояние = ПолучитьНовоеСостояние();` | `let _oState = GetNewState();` |
| `function ПолучитьСостояние() {` | `function GetState() {` |
| `return _оСостояние;` | `return _oState;` |
| `function ПолучитьНовоеСостояние() {` | `function GetNewState() {` |
| `const лПоказан = !document.hidden;` | `const bShown = !document.hidden;` |
| `const лАктивен = лПоказан && document.hasFocus();` | `const bActive = bShown && document.hasFocus();` |
| `лПоказан,` | `bShown,` |
| `лАктивен,` | `bActive,` |
| `const ОбработатьСобытие = ДобавитьОбработчикИсключений((оСобытие) => {` | `const HandleEvent = AddExceptionHandler((oEvent) => {` |
| `м_Журнал.Вот(`[Фокусник] Событие ${оСобытие.type}, старое состояние ${м_Журнал.O(_оСостояние)}`);` | `m_Log.Log(`[FocusManager] Event ${oEvent.type}, old state ${m_Log.O(_oState)}`);` |
| `setTimeout(ОбновитьСостояние);` | `setTimeout(UpdateState);` |
| `const ОбновитьСостояние = ДобавитьОбработчикИсключений(() => {` | `const UpdateState = AddExceptionHandler(() => {` |
| `const оНовоеСостояние = ПолучитьНовоеСостояние();` | `const oNewState = GetNewState();` |
| `if (_оСостояние.лПоказан !== оНовоеСостояние.лПоказан || _оСостояние.лАктивен !== оНовоеСостояние.лАктивен)` | `if (_oState.bShown !== oNewState.bShown || _oState.bActive !== oNewState.bActive)` |
| `м_Журнал.Окак(`[Фокусник] Новое состояние ${м_Журнал.O(оНовоеСостояние)}`);` | `m_Log.Ok(`[FocusManager] New state ${m_Log.O(oNewState)}`);` |
| `_оСостояние = оНовоеСостояние;` | `_oState = oNewState;` |
| `м_События.ПослатьСобытие("фокусник-изменилосьсостояние", оНовоеСостояние);` | `m_Events.SendEvent("focusmanager-statechanged", oNewState);` |
| `м_Журнал.Вот(`[Фокусник] Начальное состояние ${м_Журнал.O(_оСостояние)}`);` | `m_Log.Log(`[FocusManager] Initial state ${m_Log.O(_oState)}`);` |
| `document.addEventListener("visibilitychange", ОбработатьСобытие);` | `document.addEventListener("visibilitychange", HandleEvent);` |
| `window.addEventListener("focus", ОбработатьСобытие);` | `window.addEventListener("focus", HandleEvent);` |
| `window.addEventListener("blur", ОбработатьСобытие);` | `window.addEventListener("blur", HandleEvent);` |
| `ПолучитьСостояние,` | `GetState,` |
| `const м_Пульс = (() => {` | `const m_Heartbeat = (() => {` |
| `const ИНТЕРВАЛ_ПРОВЕРКИ = 970;` | `const CHECK_INTERVAL = 970;` |
| `const МИН_ОТКЛОНЕНИЕ_ВРЕМЕНИ = -30;` | `const MIN_TIME_DEVIATION = -30;` |
| `const МАКС_ОТКЛОНЕНИЕ_ВРЕМЕНИ = 200;` | `const MAX_TIME_DEVIATION = 200;` |
| `const МАКС_ОТКЛОНЕНИЕ_ДАТЫ = 40;` | `const MAX_DATE_DEVIATION = 40;` |
| `let _чМаксимальноеОтклонение = 0;` | `let _nMaximumDeviation = 0;` |
| `let _чТаймер = 0;` | `let _nTimer = 0;` |
| `let _чВремя;` | `let _nTime;` |
| `let _чДата;` | `let _nDate;` |
| `const ПроверитьПульс = ДобавитьОбработчикИсключений(() => {` | `const CheckHeartbeat = AddExceptionHandler(() => {` |
| `const чВремя = performance.now();` | `const nTime = performance.now();` |
| `const чДата = Date.now();` | `const nDate = Date.now();` |
| `const чОтклонениеВремени = чВремя - _чВремя - ИНТЕРВАЛ_ПРОВЕРКИ;` | `const nTimeDeviation = nTime - _nTime - CHECK_INTERVAL;` |
| `const чОтклонениеДаты = чДата - _чДата - (чВремя - _чВремя);` | `const nDateDeviation = nDate - _nDate - (nTime - _nTime);` |
| `if (чОтклонениеВремени < МИН_ОТКЛОНЕНИЕ_ВРЕМЕНИ || чОтклонениеВремени > МАКС_ОТКЛОНЕНИЕ_ВРЕМЕНИ || Math.abs(чОтклонениеДаты) > МАКС_ОТКЛОНЕНИЕ_ДАТЫ)` | `if (nTimeDeviation < MIN_TIME_DEVIATION || nTimeDeviation > MAX_TIME_DEVIATION || Math.abs(nDateDeviation) > MAX_DATE_DEVIATION)` |
| `м_Журнал.Ой(\`[Пульс] \${м_Журнал.F0(чОтклонениеВремени)} \${м_Журнал.F0(чОтклонениеДаты)}\`);` | `m_Log.Error(\`[Heartbeat] \${m_Log.F0(nTimeDeviation)} \${m_Log.F0(nDateDeviation)}\`);` |
| `_чМаксимальноеОтклонение = Math.max(` | `_nMaximumDeviation = Math.max(` |
| `_чМаксимальноеОтклонение,` | `_nMaximumDeviation,` |
| `чОтклонениеВремени` | `nTimeDeviation` |
| `_чВремя = чВремя;` | `_nTime = nTime;` |
| `_чДата = чДата;` | `_nDate = nDate;` |
| `_чТаймер = setTimeout(ПроверитьПульс, ИНТЕРВАЛ_ПРОВЕРКИ);` | `_nTimer = setTimeout(CheckHeartbeat, CHECK_INTERVAL);` |
| `function ОбработатьИзменениеСостояния(чСостояние) {` | `function HandleStateChange(nState) {` |
| `if (` | `if (` |
| `чСостояние === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ ||` | `nState === STATE_BROADCAST_END ||` |
| `чСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||` | `nState === STATE_STOP ||` |
| `чСостояние === СОСТОЯНИЕ_ПОВТОР` | `nState === STATE_REPEAT` |
| `if (_чТаймер !== 0) {` | `if (_nTimer !== 0) {` |
| `м_Журнал.Вот("[Пульс] Таймер остановлен");` | `m_Log.Log("[Heartbeat] Timer stopped");` |
| `clearTimeout(_чТаймер);` | `clearTimeout(_nTimer);` |
| `_чТаймер = 0;` | `_nTimer = 0;` |
| `else if (_чТаймер === 0) {` | `else if (_nTimer === 0) {` |
| `м_Журнал.Вот("[Пульс] Таймер запущен");` | `m_Log.Log("[Heartbeat] Timer started");` |
| `_чВремя = performance.now();` | `_nTime = performance.now();` |
| `_чДата = Date.now();` | `_nDate = Date.now();` |
| `_чТаймер = setTimeout(ПроверитьПульс, ИНТЕРВАЛ_ПРОВЕРКИ);` | `_nTimer = setTimeout(CheckHeartbeat, CHECK_INTERVAL);` |
| `function ПолучитьДанныеДляОтчета() {` | `function GetDataForReport() {` |
| `return _чМаксимальноеОтклонение;` | `return _nMaximumDeviation;` |
| `м_События.ДобавитьОбработчик("управление-изменилосьсостояние", ОбработатьИзменениеСостояния)` | `m_Events.AddHandler("control-statechanged", HandleStateChange)` |
| `ПолучитьДанныеДляОтчета,` | `GetDataForReport,` |
| `const м_Статистика = (() => {` | `const m_Statistics = (() => {` |
| `const ЧАСТОТА_ОБНОВЛЕНИЯ_СТАТИСТИКИ = 3;` | `const STATISTICS_UPDATE_FREQUENCY = 3;` |
| `const РАЗМЕР_ИСТОРИИ_СПИСКА = 30;` | `const LIST_HISTORY_SIZE = 30;` |
| `const РАЗМЕР_ИСТОРИИ_ЗАГРУЗКИ = 30;` | `const DOWNLOAD_HISTORY_SIZE = 30;` |
| `const РАЗМЕР_ИСТОРИИ_БУФЕРА = 30;` | `const BUFFER_HISTORY_SIZE = 30;` |
| `const РАЗМЕР_ИСТОРИИ_РЕКЛАМЫ = 15;` | `const AD_HISTORY_SIZE = 15;` |
| `const ВЫДЕЛИТЬ_ОЖИДАНИЕ_ОТВЕТА = 1;` | `const HIGHLIGHT_RESPONSE_WAIT = 1;` |
| `const ВЫДЕЛИТЬ_ПРЕОБРАЗОВАНО = 2;` | `const HIGHLIGHT_CONVERTED = 2;` |
| `const ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МИН = 1;` | `const HIGHLIGHT_UNWATCHED_MIN = 1;` |
| `const ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МАКС = 0.5;` | `const HIGHLIGHT_UNWATCHED_MAX = 0.5;` |
| `const ВЫДЕЛИТЬ_ПРОПУЩЕННЫЕ_КАДРЫ = 100;` | `const HIGHLIGHT_DROPPED_FRAMES = 100;` |
| `const ВЫДЕЛИТЬ_ЧАСТОТУ_КАДРОВ = 0.85;` | `const HIGHLIGHT_FRAME_RATE = 0.85;` |
| `const ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_ОТН = 1 / 5;` | `const HIGHLIGHT_VIDEO_LOSS_REL = 1 / 5;` |
| `const ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_АБС = 300;` | `const HIGHLIGHT_VIDEO_LOSS_ABS = 300;` |
| `const ВЫДЕЛИТЬ_ИСЧЕРПАНИЕ_БУФЕРА = 5;` | `const HIGHLIGHT_BUFFER_EXHAUSTION = 5;` |
| `let _чТаймер = 0;` | `let _nTimer = 0;` |
| `let _nTargetDuration = 0;` | `let _nTargetDuration = 0;` |
| `let _чМинДлительностьВидеосемпла = -Infinity;` | `let _nMinVideoSampleDuration = -Infinity;` |
| `let _чМаксДлительностьВидеосемпла = +Infinity;` | `let _nMaxVideoSampleDuration = +Infinity;` |
| `let _оИнтервалОбновления = null;` | `let _oUpdateInterval = null;` |
| `let _оСегментовДобавлено = null;` | `let _oSegmentsAdded = null;` |
| `let _оСекундДобавлено = null;` | `let _oSecondsAdded = null;` |
| `let _оТолщинаСегмента = null;` | `let _oSegmentThickness = null;` |
| `let _оТолщинаКанала = null;` | `let _oChannelThickness = null;` |
| `let _оОжиданиеОтвета = null;` | `let _oResponseWait = null;` |
| `let _оНеПросмотрено = null;` | `let _oUnwatched = null;` |
| `let _кИсходныхСегментов = 0;` | `let _nInitialSegments = 0;` |
| `let _кЗабракованныхСегментов = 0;` | `let _nRejectedSegments = 0;` |
| `let _кбВсегоСкачано = 0;` | `let _kbTotalDownloaded = 0;` |
| `let _кОшибокЗагрузки = 0;` | `let _nDownloadErrors = 0;` |
| `let _кПропущенныхСегментов = 0;` | `let _nSkippedSegments = 0;` |
| `let _кНезагруженныхСегментов = 0;` | `let _nUndownloadedSegments = 0;` |
| `let _кПотерьВидео = 0;` | `let _nVideoLosses = 0;` |
| `let _кПотерьЗвука = 0;` | `let _nAudioLosses = 0;` |
| `let _кИсчерпанийБуфера = 0;` | `let _nBufferExhaustions = 0;` |
| `let _кИсчерпанийБуфераДосрочно = 0;` | `let _nEarlyBufferExhaustions = 0;` |
| `let _кПереполненийБуфера = 0;` | `let _nBufferOverflows = 0;` |
| `let _чПропущеноВБуфере = 0;` | `let _nSkippedInBuffer = 0;` |
| `let _кКоличествоРекламы = 0;` | `let _nAdCount = 0;` |
| `let _мчНачалоРекламы = [];` | `let _nAdStartTimes = [];` |
| `let _мчКонецРекламы = [];` | `let _nAdEndTimes = [];` |
| `let _чВремяПоследнегоОбновления;` | `let _nLastUpdateTime;` |
| `function ВыделитьСегментовДобавлено(чЧисло) {` | `function HighlightSegmentsAdded(nNumber) {` |
| `return чЧисло !== 1 && чЧисло !== 2;` | `return nNumber !== 1 && nNumber !== 2;` |
| `function ВыделитьОжиданиеОтвета(чЧисло) {` | `function HighlightResponseWait(nNumber) {` |
| `return чЧисло >= ВЫДЕЛИТЬ_ОЖИДАНИЕ_ОТВЕТА;` | `return nNumber >= HIGHLIGHT_RESPONSE_WAIT;` |
| `function ВыделитьНеПросмотрено(чЧи