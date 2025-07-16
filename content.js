"use strict";

const ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА = 2e4;
// const STORE_CHANNEL_STATE = 2e4;

let г_оРазобранныйАдрес = null;
// let g_oParsedAddress = null;

let г_сСпособЗаданияАдреса = "";
// let g_sAddressSettingMethod = '';

let г_чПоследняяПроверка = 0;
// let g_nLastCheck = 0;

let г_оЗапрос = null;
// let g_oRequest = null;

let г_сКодКанала = "";
// let g_sChannelCode = '';

let г_лИдетТрансляция = false;
// let g_bIsStreaming = false;

const м_Отладка = {
  // const m_Debug = {
  ЗавершитьРаботуИПоказатьСообщение: завершитьРаботу,
  // FinishWorkAndShowMessage: finishWork,
  ПойманоИсключение: завершитьРаботу,
  // CaughtException: finishWork
};

function завершитьРаботу(пИсключениеИлиКодСообщения) {
  // function finishWork(pExceptionOrMessageCode) {
  if (!г_лРаботаЗавершена) {
    // if (!g_bWorkFinished) {
    console.error(пИсключениеИлиКодСообщения);
    // console.error(pExceptionOrMessageCode);
    try {
      г_лРаботаЗавершена = true;
      // g_bWorkFinished = true;
      м_Журнал.Окак("[content.js] Работа завершена");
      // m_Log.Wow('[content.js] Work finished');
    } catch (_) {}
  }
  throw void 0;
}

function задатьАдресСтраницы(сАдрес, лЗаменить = false) {
  // function setPageAddress(sAddress, bReplace = false) {
  location[лЗаменить ? "replace" : "assign"](сАдрес);
  // location[bReplace ? 'replace' : 'assign'](sAddress);
}

function вставитьНаСтраницу() {
  // function insertOnPage() {
  const узСкрипт = document.createElement("script");
  // const nodeScript = document.createElement('script');
  // MV3-compliant: Injects the script by URL instead of using textContent.
  узСкрипт.src = chrome.runtime.getURL("content_injection.js");
  // nodeScript.src = chrome.runtime.getURL('content_injection.js');
  (document.head || document.documentElement).appendChild(узСкрипт);
  // (document.head || document.documentElement).appendChild(nodeScript);
  узСкрипт.remove();
  // nodeScript.remove();
}

function этотАдресМожноПеренаправлять(оАдрес) {
  // function thisAddressCanBeRedirected(oAddress) {
  return !оАдрес.search.includes(АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ);
  // return !oAddress.search.includes(DO_NOT_REDIRECT_ADDRESS);
}

function получитьНеперенаправляемыйАдрес(оАдрес) {
  // function getNonRedirectableAddress(oAddress) {
  return `${оАдрес.protocol}//${оАдрес.host}${оАдрес.pathname}${
    оАдрес.search.length > 1
      ? `${оАдрес.search}&${АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ}`
      : `?${АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ}`
  }${оАдрес.hash}`;
  // return `${oAddress.protocol}//${oAddress.host}${oAddress.pathname}${oAddress.search.length > 1 ? `${oAddress.search}&${DO_NOT_REDIRECT_ADDRESS}` : `?${DO_NOT_REDIRECT_ADDRESS}`}${oAddress.hash}`;
}

function запретитьАвтоперенаправлениеЭтойСтраницы() {
  // function disableAutoRedirectForThisPage() {
  if (этотАдресМожноПеренаправлять(location)) {
    // if (thisAddressCanBeRedirected(location)) {
    history.replaceState(
      history.state,
      "",
      получитьНеперенаправляемыйАдрес(location)
    );
    // history.replaceState(history.state, '', getNonRedirectableAddress(location));
  }
}

разобратьАдрес.ЭТО_НЕ_КОД_КАНАЛА = new Set([
  "directory",
  "embed",
  "friends",
  "inventory",
  "login",
  "logout",
  "manager",
  "messages",
  "payments",
  "popout",
  "search",
  "settings",
  "signup",
  "subscriptions",
  "team",
]);
// parseAddress.THIS_IS_NOT_A_CHANNEL_CODE = new Set([ 'directory', 'embed', 'friends', 'inventory', 'login', 'logout', 'manager', 'messages', 'payments', 'popout', 'search', 'settings', 'signup', 'subscriptions', 'team' ]);

function разобратьАдрес(оАдрес) {
  // function parseAddress(oAddress) {
  let лМобильнаяВерсия = false;
  // let bMobileVersion = false;
  let сСтраница = "НЕИЗВЕСТНАЯ";
  // let sPage = 'UNKNOWN';
  let сКодКанала = "";
  // let sChannelCode = '';
  let лМожноПеренаправлять = false;
  // let bCanRedirect = false;
  if (
    оАдрес.protocol === "https:" &&
    (оАдрес.host === "www.twitch.tv" || оАдрес.host === "m.twitch.tv")
  ) {
    // if (oAddress.protocol === 'https:' && (oAddress.host === 'www.twitch.tv' || oAddress.host === 'm.twitch.tv')) {
    лМобильнаяВерсия = оАдрес.host === "m.twitch.tv";
    // bMobileVersion = oAddress.host === 'm.twitch.tv';
    const мсЧасти = оАдрес.pathname.split("/");
    // const msParts = oAddress.pathname.split('/');
    if (мсЧасти.length <= 3 && мсЧасти[1] && !мсЧасти[2]) {
      // if (msParts.length <= 3 && msParts[1] && !msParts[2]) {
      if (!разобратьАдрес.ЭТО_НЕ_КОД_КАНАЛА.has(мсЧасти[1])) {
        // if (!parseAddress.THIS_IS_NOT_A_CHANNEL_CODE.has(msParts[1])) {
        сСтраница = "ВОЗМОЖНО_ПРЯМАЯ_ТРАНСЛЯЦИЯ";
        // sPage = 'POSSIBLY_LIVE_STREAM';
        сКодКанала = decodeURIComponent(мсЧасти[1]);
        // sChannelCode = decodeURIComponent(msParts[1]);
        лМожноПеренаправлять = этотАдресМожноПеренаправлять(оАдрес);
        // bCanRedirect = thisAddressCanBeRedirected(oAddress);
      }
    } else if (
      (мсЧасти[1] === "embed" || мсЧасти[1] === "popout") &&
      мсЧасти[2] &&
      мсЧасти[3] === "chat"
    ) {
      // } else if ((msParts[1] === 'embed' || msParts[1] === 'popout') && msParts[2] && msParts[3] === 'chat') {
      сСтраница = "ЧАТ_КАНАЛА";
      // sPage = 'CHANNEL_CHAT';
      сКодКанала = decodeURIComponent(мсЧасти[2]);
      // sChannelCode = decodeURIComponent(msParts[2]);
    }
  }
  м_Журнал.Окак(
    `[content.js] Адрес разобран: Страница=${сСтраница} КодКанала=${сКодКанала} МожноПеренаправлять=${лМожноПеренаправлять}`
  );
  // m_Log.Wow(`[content.js] Address parsed: Page=${sPage} ChannelCode=${sChannelCode} CanRedirect=${bCanRedirect}`);
  return {
    лМобильнаяВерсия,
    // bMobileVersion,
    сСтраница,
    // sPage,
    сКодКанала,
    // sChannelCode,
    лМожноПеренаправлять,
    // bCanRedirect
  };
}

function запроситьСостояниеКанала(оРазобранныйАдрес) {
  // function requestChannelState(oParsedAddress) {
  if (
    !оРазобранныйАдрес.лМожноПеренаправлять ||
    !м_Настройки.Получить("лАвтоперенаправлениеРазрешено")
  ) {
    // if (!oParsedAddress.bCanRedirect || !m_Settings.Get('bAutoRedirectAllowed')) {
    return;
  }
  if (
    !г_оЗапрос &&
    г_сКодКанала === оРазобранныйАдрес.сКодКанала &&
    performance.now() - г_чПоследняяПроверка < ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА
  ) {
    // if (!g_oRequest && g_sChannelCode === oParsedAddress.sChannelCode && performance.now() - g_nLastCheck < STORE_CHANNEL_STATE) {
    return;
  }
  if (г_оЗапрос && г_сКодКанала === оРазобранныйАдрес.сКодКанала) {
    // if (g_oRequest && g_sChannelCode === oParsedAddress.sChannelCode) {
    return;
  }
  отменитьЗапрос();
  // cancelRequest();
  г_сКодКанала = оРазобранныйАдрес.сКодКанала;
  // g_sChannelCode = oParsedAddress.sChannelCode;
  г_чПоследняяПроверка = -1;
  // g_nLastCheck = -1;
  отправитьЗапрос();
  // sendRequest();
}

function измененАдресСтраницы(сСпособ) {
  // function pageAddressChanged(sMethod) {
  г_оРазобранныйАдрес = разобратьАдрес(location);
  // g_oParsedAddress = parseAddress(location);
  г_сСпособЗаданияАдреса = сСпособ;
  // g_sAddressSettingMethod = sMethod;
  if (
    !г_оРазобранныйАдрес.лМожноПеренаправлять ||
    !м_Настройки.Получить("лАвтоперенаправлениеРазрешено")
  ) {
    // if (!g_oParsedAddress.bCanRedirect || !m_Settings.Get('bAutoRedirectAllowed')) {
    if (г_чПоследняяПроверка === -2) {
      // if (g_nLastCheck === -2) {
      г_чПоследняяПроверка = -1;
      // g_nLastCheck = -1;
    }
    return;
  }
  if (
    !г_оЗапрос &&
    г_сКодКанала === г_оРазобранныйАдрес.сКодКанала &&
    performance.now() - г_чПоследняяПроверка < ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА
  ) {
    // if (!g_oRequest && g_sChannelCode === g_oParsedAddress.sChannelCode && performance.now() - g_nLastCheck < STORE_CHANNEL_STATE) {
    if (г_лИдетТрансляция) {
      // if (g_bIsStreaming) {
      перенаправитьНаНашПроигрыватель(г_сКодКанала);
      // redirectToOurPlayer(g_sChannelCode);
    }
    return;
  }
  if (г_оЗапрос && г_сКодКанала === г_оРазобранныйАдрес.сКодКанала) {
    // if (g_oRequest && g_sChannelCode === g_oParsedAddress.sChannelCode) {
    г_чПоследняяПроверка = -2;
    // g_nLastCheck = -2;
    return;
  }
  отменитьЗапрос();
  // cancelRequest();
  г_сКодКанала = г_оРазобранныйАдрес.сКодКанала;
  // g_sChannelCode = g_oParsedAddress.sChannelCode;
  г_чПоследняяПроверка = -2;
  // g_nLastCheck = -2;
  отправитьЗапрос();
  // sendRequest();
}

function отменитьЗапрос() {
  // function cancelRequest() {
  if (г_оЗапрос) {
    // if (g_oRequest) {
    м_Журнал.Окак("[content.js] Отменяю незавершенный запрос");
    // m_Log.Wow('[content.js] Canceling pending request');
    г_оЗапрос.abort();
    // g_oRequest.abort();
  }
}

function отправитьЗапрос() {
  // function sendRequest() {
  м_Журнал.Окак(`[content.js] Посылаю запрос для канала ${г_сКодКанала}`);
  // m_Log.Wow(`[content.js] Sending request for channel ${g_sChannelCode}`);
  г_оЗапрос = new XMLHttpRequest();
  // g_oRequest = new XMLHttpRequest();
  г_оЗапрос.addEventListener("loadend", обработатьОтвет);
  // g_oRequest.addEventListener('loadend', processResponse);
  г_оЗапрос.open("POST", "https://gql.twitch.tv/gql#origin=twilight");
  // g_oRequest.open('POST', 'https://gql.twitch.tv/gql#origin=twilight');
  г_оЗапрос.responseType = "json";
  // g_oRequest.responseType = 'json';
  г_оЗапрос.timeout = 15e3;
  // g_oRequest.timeout = 15e3;
  г_оЗапрос.setRequestHeader("Accept-Language", "en-US");
  // g_oRequest.setRequestHeader('Accept-Language', 'en-US');
  г_оЗапрос.setRequestHeader("Client-ID", "kimne78kx3ncx6brgo4mv6wki5h1ko");
  // g_oRequest.setRequestHeader('Client-ID', 'kimne78kx3ncx6brgo4mv6wki5h1ko');
  г_оЗапрос.setRequestHeader("Content-Type", "text/plain; charset=UTF-8");
  // g_oRequest.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
  if (отправитьЗапрос._мсИдУстройства === void 0) {
    // if (sendRequest._msDeviceId === void 0) {
    отправитьЗапрос._мсИдУстройства = document.cookie.match(
      /(?:^|;[ \t]?)unique_id=([^;]+)/
    );
    // sendRequest._msDeviceId = document.cookie.match(/(?:^|;[ \t]?)unique_id=([^;]+)/);
  }
  if (отправитьЗапрос._мсИдУстройства) {
    // if (sendRequest._msDeviceId) {
    г_оЗапрос.setRequestHeader(
      "X-Device-ID",
      отправитьЗапрос._мсИдУстройства[1]
    );
    // g_oRequest.setRequestHeader('X-Device-ID', sendRequest._msDeviceId[1]);
  }
  // g_oRequest.send(createGqlRequestBody(`query($login: String!) {
  г_оЗапрос.send(
    создатьТелоЗапросаGql(
      `query($login: String!) {
	
			user(login: $login) {
				stream {
					isEncrypted
				}
				watchParty {
					session {
						state
					}
				}
			}
		}`,
      {
        login: г_сКодКанала,
        // login: g_sChannelCode
      }
    )
  );
}

function обработатьОтвет({ target: оЗапрос }) {
  // function processResponse({target: oRequest}) {
  г_оЗапрос = null;
  // g_oRequest = null;
  if (
    оЗапрос.status >= 200 &&
    оЗапрос.status < 300 &&
    ЭтоОбъект(оЗапрос.response)
  ) {
    // if (oRequest.status >= 200 && oRequest.status < 300 && IsObject(oRequest.response)) {
    const лПеренаправить = г_чПоследняяПроверка === -2;
    // const bRedirect = g_nLastCheck === -2;
    г_чПоследняяПроверка = performance.now();
    // g_nLastCheck = performance.now();
    let лТрансляцияЗавершенаИлиЗакодирована = true,
      лСовместныйПросмотр = false;
    // let bStreamFinishedOrEncoded = true, bWatchParty = false;
    try {
      лТрансляцияЗавершенаИлиЗакодирована =
        оЗапрос.response.data.user.stream.isEncrypted === true;
      // bStreamFinishedOrEncoded = oRequest.response.data.user.stream.isEncrypted === true;
      лСовместныйПросмотр =
        оЗапрос.response.data.user.watchParty.session.state === "IN_PROGRESS";
      // bWatchParty = oRequest.response.data.user.watchParty.session.state === 'IN_PROGRESS';
    } catch (_) {}
    г_лИдетТрансляция =
      !лТрансляцияЗавершенаИлиЗакодирована && !лСовместныйПросмотр;
    // g_bIsStreaming = !bStreamFinishedOrEncoded && !bWatchParty;
    if (г_лИдетТрансляция && лПеренаправить) {
      // if (g_bIsStreaming && bRedirect) {
      перенаправитьНаНашПроигрыватель(г_сКодКанала);
      // redirectToOurPlayer(g_sChannelCode);
    }
  } else {
    г_чПоследняяПроверка = 0;
    // g_nLastCheck = 0;
  }
}

function запуститьНашПроигрыватель(сКодКанала) {
  // function launchOurPlayer(sChannelCode) {
  const сАдресПроигрывателя = ПолучитьАдресНашегоПроигрывателя(сКодКанала);
  // const sPlayerAddress = GetOurPlayerAddress(sChannelCode);
  м_Журнал.Окак(`[content.js] Перехожу на страницу ${сАдресПроигрывателя}`);
  // m_Log.Wow(`[content.js] Navigating to page ${sPlayerAddress}`);
  запретитьАвтоперенаправлениеЭтойСтраницы();
  // disableAutoRedirectForThisPage();
  задатьАдресСтраницы(сАдресПроигрывателя);
  // setPageAddress(sPlayerAddress);
}

function перенаправитьНаНашПроигрыватель(сКодКанала) {
  // function redirectToOurPlayer(sChannelCode) {
  const сАдресПроигрывателя = ПолучитьАдресНашегоПроигрывателя(сКодКанала);
  // const sPlayerAddress = GetOurPlayerAddress(sChannelCode);
  м_Журнал.Окак(
    `[content.js] Меняю адрес страницы с ${location.href} на ${сАдресПроигрывателя}`
  );
  // m_Log.Wow(`[content.js] Changing page address from ${location.href} to ${sPlayerAddress}`);
  document.documentElement.setAttribute(
    "data-tw5-перенаправление",
    сАдресПроигрывателя
  );
  // document.documentElement.setAttribute('data-tw5-redirect', sPlayerAddress);
  задатьАдресСтраницы(сАдресПроигрывателя, true);
  // setPageAddress(sPlayerAddress, true);
}

function обработатьPointerDownИClick(оСобытие) {
  // function handlePointerDownAndClick(oEvent) {
  if (г_оРазобранныйАдрес) {
    // if (g_oParsedAddress) {
    const узСсылка = оСобытие.target.closest("a[href]");
    // const nodeLink = oEvent.target.closest('a[href]');
    if (
      узСсылка &&
      оСобытие.isPrimary !== false &&
      оСобытие.button === ЛЕВАЯ_КНОПКА &&
      !оСобытие.shiftKey &&
      !оСобытие.ctrlKey &&
      !оСобытие.altKey &&
      !оСобытие.metaKey
    ) {
      // if (nodeLink && oEvent.isPrimary !== false && oEvent.button === LEFT_BUTTON && !oEvent.shiftKey && !oEvent.ctrlKey && !oEvent.altKey && !oEvent.metaKey) {
      м_Журнал.Окак(
        `[content.js] Произошло событие ${оСобытие.type} у ссылки ${узСсылка.href}`
      );
      // m_Log.Wow(`[content.js] Event ${oEvent.type} occurred on link ${nodeLink.href}`);
      запроситьСостояниеКанала(разобратьАдрес(узСсылка));
      // requestChannelState(parseAddress(nodeLink));
    }
  }
}

function обработатьPopState(оСобытие) {
  // function handlePopState(oEvent) {
  if (г_оРазобранныйАдрес) {
    // if (g_oParsedAddress) {
    м_Журнал.Окак(`[content.js] Произошло событие popstate ${location.href}`);
    // m_Log.Wow(`[content.js] popstate event occurred ${location.href}`);
    if (получитьВерсиюДвижкаБраузера() < 67) {
      // if (getBrowserEngineVersion() < 67) {
      document.title = "Twitch";
    }
    измененАдресСтраницы("POPSTATE");
    // pageAddressChanged('POPSTATE');
    if (document.documentElement.hasAttribute("data-tw5-перенаправление")) {
      // if (document.documentElement.hasAttribute('data-tw5-redirect')) {
      м_Журнал.Окак("[content.js] Скрываю событие popstate");
      // m_Log.Wow('[content.js] Hiding popstate event');
      оСобытие.stopImmediatePropagation();
      // oEvent.stopImmediatePropagation();
    }
  }
}

function обработатьPushState(оСобытие) {
  // function handlePushState(oEvent) {
  м_Журнал.Окак(
    `[content.js] Произошло событие tw5-pushstate ${location.href}`
  );
  // m_Log.Wow(`[content.js] tw5-pushstate event occurred ${location.href}`);
  измененАдресСтраницы("PUSHSTATE");
  // pageAddressChanged('PUSHSTATE');
}

function обработатьЗапускНашегоПроигрывателя(оСобытие) {
  // function handleLaunchOurPlayer(oEvent) {
  оСобытие.preventDefault();
  // oEvent.preventDefault();
  if (
    оСобытие.button === ЛЕВАЯ_КНОПКА &&
    г_оРазобранныйАдрес.сСтраница === "ВОЗМОЖНО_ПРЯМАЯ_ТРАНСЛЯЦИЯ"
  ) {
    // if (oEvent.button === LEFT_BUTTON && g_oParsedAddress.sPage === 'POSSIBLY_LIVE_STREAM') {
    запуститьНашПроигрыватель(г_оРазобранныйАдрес.сКодКанала);
    // launchOurPlayer(g_oParsedAddress.sChannelCode);
  } else {
    м_Журнал.Окак(
      `[content.js] Не запускать проигрыватель Кнопка=${оСобытие.button} Страница=${г_оРазобранныйАдрес.сСтраница}`
    );
    // m_Log.Wow(`[content.js] Do not launch player Button=${oEvent.button} Page=${g_oParsedAddress.sPage}`);
  }
}

function обработатьПереключениеАвтоперенаправления(оСобытие) {
  // function handleToggleAutoRedirect(oEvent) {
  оСобытие.preventDefault();
  // oEvent.preventDefault();
  const л = !м_Настройки.Получить("лАвтоперенаправлениеРазрешено");
  // const b = !m_Settings.Get('bAutoRedirectAllowed');
  м_Журнал.Окак(`[content.js] Автоперенаправление разрешено: ${л}`);
  // m_Log.Wow(`[content.js] Auto-redirect allowed: ${b}`);
  м_Настройки.Изменить("лАвтоперенаправлениеРазрешено", л);
  // m_Settings.Change('bAutoRedirectAllowed', b);
  обновитьНашуКнопку();
  // updateOurButton();
}

function обработатьЗакрытиеСправки(оСобытие) {
  // function handleCloseHelp(oEvent) {
  оСобытие.preventDefault();
  // oEvent.preventDefault();
  м_Журнал.Окак("[content.js] Закрываю справку");
  // m_Log.Wow('[content.js] Closing help');
  оСобытие.currentTarget.classList.remove("tw5-справка");
  // oEvent.currentTarget.classList.remove('tw5-help');
  оСобытие.currentTarget.removeEventListener(
    "mouseover",
    обработатьЗакрытиеСправки
  );
  // oEvent.currentTarget.removeEventListener('mouseover', handleCloseHelp);
  оСобытие.currentTarget.removeEventListener(
    "touchstart",
    обработатьЗакрытиеСправки,
    {
      // oEvent.currentTarget.removeEventListener('touchstart', handleCloseHelp, {
      passive: false,
    }
  );
  м_Настройки.Изменить("лАвтоперенаправлениеЗамечено", true);
  // m_Settings.Change('bAutoRedirectNoticed', true);
}

function получитьНашуКнопку() {
  // function getOurButton() {
  return document.getElementById("tw5-автоперенаправление");
  // return document.getElementById('tw5-autoredirect');
}

function обновитьНашуКнопку() {
  // function updateOurButton() {
  получитьНашуКнопку().classList.toggle(
    "tw5-запрещено",
    !м_Настройки.Получить("лАвтоперенаправлениеРазрешено")
  );
  // getOurButton().classList.toggle('tw5-forbidden', !m_Settings.Get('bAutoRedirectAllowed'));
}

function вставитьНашуКнопку() {
  // function insertOurButton() {
  if (г_оРазобранныйАдрес.лМобильнаяВерсия) {
    // if (g_oParsedAddress.bMobileVersion) {
    const узКудаВставлять = document.querySelector(
      ".top-nav__menu > div:last-child > div:first-child"
    );
    // const nodeToInsert = document.querySelector('.top-nav__menu > div:last-child > div:first-child');
    if (!узКудаВставлять) {
      // if (!nodeToInsert) {
      return false;
    }
    м_Журнал.Окак("[content.js] Вставляю нашу кнопку для мобильного сайта");
    // m_Log.Wow('[content.js] Inserting our button for mobile site');
    узКудаВставлять.insertAdjacentHTML(
      "afterend",
      `
		<div class="tw5-автоперенаправление tw5-js-удалить">
			<button id="tw5-автоперенаправление">
		// <div class="tw5-autoredirect tw5-js-remove">
			// <button id="tw5-autoredirect">
				<svg viewBox="0 0 128 128">
					<g>
						<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
					</g>
				</svg>
			</button>
			<style>
				.tw5-автоперенаправление
				// .tw5-autoredirect
				{
					flex: 0 0;
					margin: 0 0 0 .5rem;
				}
				.tw5-автоперенаправление button
				// .tw5-autoredirect button
				{
					align-items: center;
					background-color: transparent;
					border-radius: .4rem;
					color: #0e0e10;
					display: inline-flex;
					height: 3.6rem;
					justify-content: center;
					width: 3.6rem;
				}
				.tw-root--theme-dark .tw5-автоперенаправление button
				// .tw-root--theme-dark .tw5-autoredirect button
				{
					color: #efeff1;
				}
				.tw5-автоперенаправление button:active
				// .tw5-autoredirect button:active
				{
					background-color: rgba(0, 0, 0, 0.05);
				}
				.tw-root--theme-dark .tw5-автоперенаправление button:active
				// .tw-root--theme-dark .tw5-autoredirect button:active
				{
					background-color: rgba(255, 255, 255, 0.15);
				}
				.tw5-автоперенаправление svg
				// .tw5-autoredirect svg
				{
					fill: currentColor;
					width: 75%;
				}
				.tw5-запрещено svg
				// .tw5-forbidden svg
				{
					opacity: .4;
				}
			</style>
		</div>
		`
    );
  } else {
    const узКудаВставлять = document.querySelector(
      ".top-nav__menu > div:last-child > div:first-child"
    );
    // const nodeToInsert = document.querySelector('.top-nav__menu > div:last-child > div:first-child');
    if (!узКудаВставлять) {
      // if (!nodeToInsert) {
      return false;
    }
    м_Журнал.Окак("[content.js] Вставляю нашу кнопку");
    // m_Log.Wow('[content.js] Inserting our button');
    узКудаВставлять.insertAdjacentHTML(
      "afterend",
      `
		<div class="tw5-автоперенаправление tw5-js-удалить">
			<button id="tw5-автоперенаправление">
		// <div class="tw5-autoredirect tw5-js-remove">
			// <button id="tw5-autoredirect">
				<svg viewBox="0 0 128 128">
					<g>
						<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
					</g>
				</svg>
			</button>
			<div class="tw5-tooltip">
				${м_i18n.GetMessage("F0600")}
			</div>
			<style>
				.tw5-автоперенаправление
				// .tw5-autoredirect
				{
					flex: 0 0;
					margin: 0 .5rem;
					position: relative;
				}
				.tw5-автоперенаправление button
				// .tw5-autoredirect button
				{
					align-items: center;
					background-color: var(--color-background-button-text-default);
					border-radius: var(--border-radius-medium);
					color: var(--color-fill-button-icon);
					display: inline-flex;
					height: var(--button-size-default);
					justify-content: center;
					width: var(--button-size-default);
				}
				.tw5-автоперенаправление button:hover
				// .tw5-autoredirect button:hover
				{
					background-color: var(--color-background-button-text-hover);
					color: var(--color-fill-button-icon-hover);
				}
				.tw5-автоперенаправление button:active
				// .tw5-autoredirect button:active
				{
					background-color: var(--color-background-button-text-active);
					color: var(--color-fill-button-icon-active);
				}
				.tw5-автоперенаправление svg
				// .tw5-autoredirect svg
				{
					fill: currentColor;
					width: 75%;
				}
				.tw5-запрещено svg
				// .tw5-forbidden svg
				{
					opacity: .4;
				}
				.tw5-tooltip
				{
					background-color: var(--color-background-tooltip);
					border-radius: var(--border-radius-medium);
					color: var(--color-text-tooltip);
					display: none;
					font-size: var(--font-size-6);
					font-weight: var(--font-weight-semibold);
					left: 50%;
					line-height: var(--line-height-heading);
					margin-top: 6px;
					padding: 3px 6px;
					pointer-events: none;
					position: absolute;
					text-align: left;
					top: 100%;
					transform: translateX(-50%);
					user-select: none;
					white-space: nowrap;
					z-index: var(--z-index-balloon);
				}
				.tw5-tooltip::after
				{
					background-color: inherit;
					content: "";
					height: 6px;
					left: 50%;
					position: absolute;
					top: 0;
					transform: rotate(45deg) translateX(-68%);
					width: 6px;
					z-index: var(--z-index-below);
				}
				.tw5-автоперенаправление:hover .tw5-tooltip
				// .tw5-autoredirect:hover .tw5-tooltip
				{
					display: block;
				}
				.tw5-справка .tw5-tooltip
				// .tw5-help .tw5-tooltip
				{
					background: #f00000;
					color: #fff;
					cursor: pointer;
					display: block;
					pointer-events: auto;
				}
			</style>
		</div>
		`
    );
  }
  const узКнопка = получитьНашуКнопку();
  // const nodeButton = getOurButton();
  узКнопка.addEventListener("click", обработатьЗапускНашегоПроигрывателя);
  // nodeButton.addEventListener('click', handleLaunchOurPlayer);
  узКнопка.addEventListener(
    "contextmenu",
    обработатьПереключениеАвтоперенаправления
  );
  // nodeButton.addEventListener('contextmenu', handleToggleAutoRedirect);
  if (
    !г_оРазобранныйАдрес.лМобильнаяВерсия &&
    !м_Настройки.Получить("лАвтоперенаправлениеЗамечено")
  ) {
    // if (!g_oParsedAddress.bMobileVersion && !m_Settings.Get('bAutoRedirectNoticed')) {
    узКнопка.parentNode.classList.add("tw5-справка");
    // nodeButton.parentNode.classList.add('tw5-help');
    узКнопка.parentNode.addEventListener(
      "mouseover",
      обработатьЗакрытиеСправки
    );
    // nodeButton.parentNode.addEventListener('mouseover', handleCloseHelp);
    узКнопка.parentNode.addEventListener(
      "touchstart",
      обработатьЗакрытиеСправки,
      {
        // nodeButton.parentNode.addEventListener('touchstart', handleCloseHelp, {
        passive: false,
      }
    );
  }
  обновитьНашуКнопку();
  // updateOurButton();
  return true;
}

function вставитьНашуКнопкуЕслиНужно() {
  // function insertOurButtonIfNeeded() {
  return Boolean(получитьНашуКнопку()) || вставитьНашуКнопку();
  // return Boolean(getOurButton()) || insertOurButton();
}

function вставитьНашуКнопкуВПервыйРаз() {
  // function insertOurButtonFirstTime() {
  вставитьНашуКнопку();
  // insertOurButton();
  if (г_оРазобранныйАдрес.лМобильнаяВерсия) {
    // if (g_oParsedAddress.bMobileVersion) {
    new MutationObserver((моЗаписи) => {
      // new MutationObserver(moRecords => {
      вставитьНашуКнопкуЕслиНужно();
      // insertOurButtonIfNeeded();
    }).observe(document.head || document.documentElement, {
      childList: true,
      subtree: true,
    });
  } else {
    window.addEventListener(
      "tw5-изменензаголовок",
      вставитьНашуКнопкуЕслиНужно
    );
    // window.addEventListener('tw5-titlechanged', insertOurButtonIfNeeded);
  }
}

function ждатьЗагрузкуДомика() {
  // function waitForDom() {
  return new Promise((фВыполнить) => {
    // return new Promise(fResolve => {
    if (document.readyState !== "loading") {
      фВыполнить();
      // fResolve();
    } else {
      document.addEventListener(
        "DOMContentLoaded",
        function ОбработатьЗагрузкуДомика() {
          // document.addEventListener('DOMContentLoaded', function HandleDomLoad() {
          document.removeEventListener(
            "DOMContentLoaded",
            ОбработатьЗагрузкуДомика
          );
          // document.removeEventListener('DOMContentLoaded', HandleDomLoad);
          фВыполнить();
          // fResolve();
        }
      );
    }
  });
}

function ждатьЗагрузкуСтраницы() {
  // function waitForPageLoad() {
  return new Promise((фВыполнить) => {
    // return new Promise(fResolve => {
    if (document.readyState === "complete") {
      фВыполнить();
      // fResolve();
    } else {
      window.addEventListener("load", function ОбработатьЗагрузкуСтраницы() {
        // window.addEventListener('load', function HandlePageLoad() {
        window.removeEventListener("load", ОбработатьЗагрузкуСтраницы);
        // window.removeEventListener('load', HandlePageLoad);
        фВыполнить();
        // fResolve();
      });
    }
  });
}

function вставитьСторонниеРасширения() {
  // function insertThirdPartyExtensions() {
  chrome.runtime.sendMessage(
    {
      сЗапрос: "ВставитьСторонниеРасширения",
      // sRequest: 'InsertThirdPartyExtensions'
    },
    (оСообщение) => {
      // }, oMessage => {
      if (chrome.runtime.lastError) {
        м_Журнал.Окак(
          `[content.js] Не удалось послать запрос на вставку сторонних расширений: ${chrome.runtime.lastError.message}`
        );
        // m_Log.Wow(`[content.js] Failed to send request to insert third-party extensions: ${chrome.runtime.lastError.message}`);
        return;
      }
      //! оСообщение.сСторонниеРасширения contains a limited set of known browser extensions that are currently
      // ! oMessage.sThirdPartyExtensions contains a limited set of known browser extensions that are currently
      //! installed and enabled in the browser. See обработатьСообщениеЧата() in player.js. Load those
      // ! installed and enabled in the browser. See handleChatMessage() in player.js. Load those
      //! extensions into <iframe>. Chrome itself cannot load installed extensions into another extension.
      //! See https://bugs.chromium.org/p/chromium/issues/detail?id=599167
      if (оСообщение.сСторонниеРасширения.includes("BTTV ")) {
        // if (oMessage.sThirdPartyExtensions.includes('BTTV ')) {
        ждатьЗагрузкуСтраницы().then(() => {
          // waitForPageLoad().then(() => {

          //! BetterTTV browser extension
          //! https://betterttv.com/
          //! https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped
          const script = document.createElement("script");
          script.id = "betterttv";
          script.src = "https://cdn.betterttv.net/betterttv.js";
          document.head.appendChild(script);
        });
      }
      if (оСообщение.сСторонниеРасширения.includes("FFZ ")) {
        // if (oMessage.sThirdPartyExtensions.includes('FFZ ')) {
        ждатьЗагрузкуДомика().then(() => {
          // waitForDom().then(() => {

          //! FrankerFaceZ browser extension
          //! https://www.frankerfacez.com/
          //! https://chrome.google.com/webstore/detail/fadndhdgpmmaapbmfcknlfgcflmmmieb
          const script = document.createElement("script");
          script.id = "ffz_script";
          script.src = "https://cdn.frankerfacez.com/script/script.min.js";
          document.head.appendChild(script);
        });
      }
    }
  );
}

function изменитьСтильЧата() {
  // function changeChatStyle() {
  const узСтиль = document.createElement("link");
  // const nodeStyle = document.createElement('link');
  узСтиль.rel = "stylesheet";
  // nodeStyle.rel = 'stylesheet';
  узСтиль.href = chrome.runtime.getURL("content.css");
  // nodeStyle.href = chrome.runtime.getURL('content.css');
  узСтиль.className = "tw5-js-удалить";
  // nodeStyle.className = 'tw5-js-remove';
  (document.head || document.documentElement).appendChild(узСтиль);
  // (document.head || document.documentElement).appendChild(nodeStyle);
}

function изменитьПоведениеЧата() {
  // function changeChatBehavior() {
  window.addEventListener(
    "click",
    (оСобытие) => {
      // window.addEventListener('click', oEvent => {
      if (оСобытие.button !== ЛЕВАЯ_КНОПКА) {
        // if (oEvent.button !== LEFT_BUTTON) {
        return;
      }
      const узСсылка = оСобытие.target.closest(
        'a[href^="http:"],a[href^="https:"],a[href]:not([href=""]):not([href^="#"]):not([href*=":"]):not([href$="/not-a-location"])'
      );
      // const nodeLink = oEvent.target.closest('a[href^="http:"],a[href^="https:"],a[href]:not([href=""]):not([href^="#"]):not([href*=":"]):not([href$="/not-a-location"])');
      if (!узСсылка) {
        // if (!nodeLink) {
        return;
      }
      м_Журнал.Окак(
        `[content.js] Открываю ссылку в новой вкладке: ${узСсылка.getAttribute(
          "href"
        )}`
      );
      // m_Log.Wow(`[content.js] Opening link in new tab: ${nodeLink.getAttribute('href')}`);
      узСсылка.target = "_blank";
      // nodeLink.target = '_blank';
      оСобытие.stopImmediatePropagation();
      // oEvent.stopImmediatePropagation();
    },
    true
  );
  const оНаблюдатель = new MutationObserver((моЗаписи) => {
    // const oObserver = new MutationObserver(moRecords => {
    const сэл = document.getElementsByClassName("channel-leaderboard");
    // const sel = document.getElementsByClassName('channel-leaderboard');
    if (сэл.length !== 0) {
      // if (sel.length !== 0) {
      сэл[0].parentElement.parentElement.classList.add(
        "tw5-parent-channel-leaderboard"
      );
      // sel[0].parentElement.parentElement.classList.add('tw5-parent-channel-leaderboard');
      оНаблюдатель.disconnect();
      // oObserver.disconnect();
    }
  });
  оНаблюдатель.observe(document.body || document.documentElement, {
    // oObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });
  setTimeout(() => оНаблюдатель.disconnect(), 6e4);
  // setTimeout(() => oObserver.disconnect(), 6e4);
}

function удалитьХвостыСтаройВерсии() {}
// function removeOldVersionTails() {}

ДобавитьОбработчикИсключений(() => {
  // AddExceptionHandler(() => {
  м_Журнал.Окак(
    `[content.js] Запущен ${performance.now().toFixed()}мс ${location.href}`
  );
  // m_Log.Wow(`[content.js] Launched ${performance.now().toFixed()}ms ${location.href}`);
  if (разобратьАдрес(location).сСтраница === "ЧАТ_КАНАЛА") {
    // if (parseAddress(location).sPage === 'CHANNEL_CHAT') {
    вставитьНаСтраницу();
    // insertOnPage();
    if (window.top !== window) {
      вставитьСторонниеРасширения();
      // insertThirdPartyExtensions();
      изменитьСтильЧата();
      // changeChatStyle();
      изменитьПоведениеЧата();
      // changeChatBehavior();
    }
    return;
  }
  удалитьХвостыСтаройВерсии();
  // removeOldVersionTails();
  const сСобытие = window.PointerEvent ? "pointerdown" : "mousedown";
  // const sEvent = window.PointerEvent ? 'pointerdown' : 'mousedown';
  window.addEventListener(сСобытие, обработатьPointerDownИClick, true);
  // window.addEventListener(sEvent, handlePointerDownAndClick, true);
  window.addEventListener("click", обработатьPointerDownИClick, true);
  // window.addEventListener('click', handlePointerDownAndClick, true);
  window.addEventListener("popstate", обработатьPopState);
  // window.addEventListener('popstate', handlePopState);
  м_Настройки
    .Восстановить()
    .then(() => {
      // m_Settings.Restore().then(() => {
      измененАдресСтраницы("LOAD");
      // pageAddressChanged('LOAD');
      window.addEventListener("tw5-pushstate", обработатьPushState);
      // window.addEventListener('tw5-pushstate', handlePushState);
      вставитьНаСтраницу();
      // insertOnPage();
      вставитьНашуКнопкуВПервыйРаз();
      // insertOurButtonFirstTime();
    })
    .catch(м_Отладка.ПойманоИсключение);
  // }).catch(m_Debug.CaughtException);
})();
