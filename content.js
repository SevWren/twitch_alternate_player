'use strict';
/**
 * @fileoverview Content script for Twitch pages.
 * This script is responsible for determining if a channel is live and redirecting to the custom player page.
 * It also injects a button to manually trigger the player and handles auto-redirection settings.
 */

/**
 * @const {number}
 * @description The duration to store the channel state in milliseconds.
 * @translation ХРАНИТЬ_СОСТОЯНИЕ_КАНАЛА
 */
const STORE_CHANNEL_STATE = 2e4;

/**
 * @type {?object}
 * @description The parsed address of the current page.
 * @translation г_оРазобранныйАдрес
 */
let g_oParsedAddress = null;

/**
 * @type {string}
 * @description The method used to set the address.
 * @translation г_сСпособЗаданияАдреса
 */
let g_sAddressSetMethod = '';

/**
 * @type {number}
 * @description The timestamp of the last check.
 * @translation г_чПоследняяПроверка
 */
let g_nLastCheck = 0;

/**
 * @type {?XMLHttpRequest}
 * @description The current request object.
 * @translation г_оЗапрос
 */
let g_oRequest = null;

/**
 * @type {string}
 * @description The channel code.
 * @translation г_сКодКанала
 */
let g_sChannelCode = '';

/**
 * @type {boolean}
 * @description Whether the channel is currently broadcasting.
 * @translation г_лИдетТрансляция
 */
let g_bIsBroadcasting = false;

/**
 * @const {object}
 * @description Debugging module.
 * @translation м_Отладка
 */
const m_Debug = {
	/**
  * @function
  * @description Terminates the script and shows a message.
  * @translation ЗавершитьРаботуИПоказатьСообщение
  */
	TerminateAndShowMessage: terminateWork,
	/**
  * @function
  * @description Catches an exception and terminates the script.
  * @translation ПойманоИсключение
  */
	ExceptionCaught: terminateWork
};

/**
 * @function
 * @description Terminates the script.
 * @param {Error|string} pExceptionOrMessageCode - The exception or message code.
 * @translation завершитьРаботу
 */
function terminateWork(pExceptionOrMessageCode) {
	if (!g_bWorkFinished) {
		console.error(pExceptionOrMessageCode);
		try {
			g_bWorkFinished = true;
			m_Log.Log('[content.js] Work finished');
		} catch (_) {}
	}
	throw void 0;
}

/**
 * @function
 * @description Sets the page address.
 * @param {string} sAddress - The address to set.
 * @param {boolean} [bReplace=false] - Whether to replace the current history entry.
 * @translation задатьАдресСтраницы
 */
function setPageAddress(sAddress, bReplace = false) {
	location[bReplace ? 'replace' : 'assign'](sAddress);
}

/**
 * @function
 * @description Injects a script into the page.
 * @translation вставитьНаСтраницу
 */
function insertIntoPage() {
	const elScript = document.createElement('script');
	// MV3-compliant: Injects the script by URL instead of using textContent.
	elScript.src = chrome.runtime.getURL('content_injection.js');
	(document.head || document.documentElement).appendChild(elScript);
	elScript.remove();
}

/**
 * @function
 * @description Checks if the address can be redirected.
 * @param {URL} oAddress - The address to check.
 * @returns {boolean} Whether the address can be redirected.
 * @translation этотАдресМожноПеренаправлять
 */
function canRedirectThisAddress(oAddress) {
	return !oAddress.search.includes(DO_NOT_REDIRECT_ADDRESS);
}

/**
 * @function
 * @description Gets a non-redirectable address.
 * @param {URL} oAddress - The original address.
 * @returns {string} The non-redirectable address.
 * @translation получитьНеперенаправляемыйАдрес
 */
function getNonRedirectableAddress(oAddress) {
	return `${oAddress.protocol}//${oAddress.host}${oAddress.pathname}${oAddress.search.length > 1 ? `${oAddress.search}&${DO_NOT_REDIRECT_ADDRESS}` : `?${DO_NOT_REDIRECT_ADDRESS}`}${oAddress.hash}`;
}

/**
 * @function
 * @description Disables auto-redirection for the current page.
 * @translation запретитьАвтоперенаправлениеЭтойСтраницы
 */
function disableAutoRedirectionForThisPage() {
	if (canRedirectThisAddress(location)) {
		history.replaceState(history.state, '', getNonRedirectableAddress(location));
	}
}

/**
 * @const {Set<string>}
 * @description A set of pathnames that are not channel codes.
 * @translation ЭТО_НЕ_КОД_КАНАЛА
 */
parseAddress.THIS_IS_NOT_A_CHANNEL_CODE = new Set([ 'directory', 'embed', 'friends', 'inventory', 'login', 'logout', 'manager', 'messages', 'payments', 'popout', 'search', 'settings', 'signup', 'subscriptions', 'team' ]);

/**
 * @function
 * @description Parses the address of the page.
 * @param {URL} oAddress - The address to parse.
 * @returns {{bIsMobile: boolean, sPage: string, sChannelCode: string, bCanRedirect: boolean}} The parsed address information.
 * @translation разобратьАдрес
 */
function parseAddress(oAddress) {
	let bIsMobile = false;
	let sPage = 'UNKNOWN';
	let sChannelCode = '';
	let bCanRedirect = false;
	if (oAddress.protocol === 'https:' && (oAddress.host === 'www.twitch.tv' || oAddress.host === 'm.twitch.tv')) {
		bIsMobile = oAddress.host === 'm.twitch.tv';
		const asParts = oAddress.pathname.split('/');
		if (asParts.length <= 3 && asParts[1] && !asParts[2]) {
			if (!parseAddress.THIS_IS_NOT_A_CHANNEL_CODE.has(asParts[1])) {
				sPage = 'POSSIBLY_LIVE_STREAM';
				sChannelCode = decodeURIComponent(asParts[1]);
				bCanRedirect = canRedirectThisAddress(oAddress);
			}
		} else if ((asParts[1] === 'embed' || asParts[1] === 'popout') && asParts[2] && asParts[3] === 'chat') {
			sPage = 'CHANNEL_CHAT';
			sChannelCode = decodeURIComponent(asParts[2]);
		}
	}
	m_Log.Log(`[content.js] Address parsed: Page=${sPage} ChannelCode=${sChannelCode} CanRedirect=${bCanRedirect}`);
	return {
		bIsMobile,
		sPage,
		sChannelCode,
		bCanRedirect
	};
}

/**
 * @function
 * @description Requests the state of the channel.
 * @param {object} oParsedAddress - The parsed address.
 * @translation запроситьСостояниеКанала
 */
function requestChannelState(oParsedAddress) {
	if (!oParsedAddress.bCanRedirect || !m_Settings.Get('bAutoRedirectAllowed')) {
		return;
	}
	if (!g_oRequest && g_sChannelCode === oParsedAddress.sChannelCode && performance.now() - g_nLastCheck < STORE_CHANNEL_STATE) {
		return;
	}
	if (g_oRequest && g_sChannelCode === oParsedAddress.sChannelCode) {
		return;
	}
	cancelRequest();
	g_sChannelCode = oParsedAddress.sChannelCode;
	g_nLastCheck = -1;
	sendRequest();
}

/**
 * @function
 * @description Handles a change in the page address.
 * @param {string} sMethod - The method of address change.
 * @translation измененАдресСтраницы
 */
function pageAddressChanged(sMethod) {
	g_oParsedAddress = parseAddress(location);
	g_sAddressSetMethod = sMethod;
	if (!g_oParsedAddress.bCanRedirect || !m_Settings.Get('bAutoRedirectAllowed')) {
		if (g_nLastCheck === -2) {
			g_nLastCheck = -1;
		}
		return;
	}
	if (!g_oRequest && g_sChannelCode === g_oParsedAddress.sChannelCode && performance.now() - g_nLastCheck < STORE_CHANNEL_STATE) {
		if (g_bIsBroadcasting) {
			redirectToOurPlayer(g_sChannelCode);
		}
		return;
	}
	if (g_oRequest && g_sChannelCode === g_oParsedAddress.sChannelCode) {
		g_nLastCheck = -2;
		return;
	}
	cancelRequest();
	g_sChannelCode = g_oParsedAddress.sChannelCode;
	g_nLastCheck = -2;
	sendRequest();
}

/**
 * @function
 * @description Cancels the current request.
 * @translation отменитьЗапрос
 */
function cancelRequest() {
	if (g_oRequest) {
		m_Log.Log('[content.js] Canceling pending request');
		g_oRequest.abort();
	}
}

/**
 * @function
 * @description Sends a request to the GQL API.
 * @translation отправитьЗапрос
 */
function sendRequest() {
	m_Log.Log(`[content.js] Sending request for channel ${g_sChannelCode}`);
	g_oRequest = new XMLHttpRequest();
	g_oRequest.addEventListener('loadend', processResponse);
	g_oRequest.open('POST', 'https://gql.twitch.tv/gql#origin=twilight');
	g_oRequest.responseType = 'json';
	g_oRequest.timeout = 15e3;
	g_oRequest.setRequestHeader('Accept-Language', 'en-US');
	g_oRequest.setRequestHeader('Client-ID', 'kimne78kx3ncx6brgo4mv6wki5h1ko');
	g_oRequest.setRequestHeader('Content-Type', 'text/plain; charset=UTF-8');
	if (sendRequest._asDeviceId === void 0) {
		sendRequest._asDeviceId = document.cookie.match(/(?:^|;[ \t]?)unique_id=([^;]+)/);
	}
	if (sendRequest._asDeviceId) {
		g_oRequest.setRequestHeader('X-Device-ID', sendRequest._asDeviceId[1]);
	}
	g_oRequest.send(createGqlRequestBody(`query($login: String!) {
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
		}`, {
		login: g_sChannelCode
	}));
}

/**
 * @function
 * @description Processes the response from the GQL API.
 * @param {Event} oEvent - The loadend event.
 * @translation обработатьОтвет
 */
function processResponse({target: oRequest}) {
	g_oRequest = null;
	if (oRequest.status >= 200 && oRequest.status < 300 && IsObject(oRequest.response)) {
		const bRedirect = g_nLastCheck === -2;
		g_nLastCheck = performance.now();
		let bBroadcastFinishedOrEncoded = true, bCooperativeView = false;
		try {
			bBroadcastFinishedOrEncoded = oRequest.response.data.user.stream.isEncrypted === true;
			bCooperativeView = oRequest.response.data.user.watchParty.session.state === 'IN_PROGRESS';
		} catch (_) {}
		g_bIsBroadcasting = !bBroadcastFinishedOrEncoded && !bCooperativeView;
		if (g_bIsBroadcasting && bRedirect) {
			redirectToOurPlayer(g_sChannelCode);
		}
	} else {
		g_nLastCheck = 0;
	}
}

/**
 * @function
 * @description Launches our player.
 * @param {string} sChannelCode - The channel code.
 * @translation запуститьНашПроигрыватель
 */
function launchOurPlayer(sChannelCode) {
	const sPlayerAddress = GetOurPlayerAddress(sChannelCode);
	m_Log.Log(`[content.js] Navigating to page ${sPlayerAddress}`);
	disableAutoRedirectionForThisPage();
	setPageAddress(sPlayerAddress);
}

/**
 * @function
 * @description Redirects to our player.
 * @param {string} sChannelCode - The channel code.
 * @translation перенаправитьНаНашПроигрыватель
 */
function redirectToOurPlayer(sChannelCode) {
	const sPlayerAddress = GetOurPlayerAddress(sChannelCode);
	m_Log.Log(`[content.js] Changing page address from ${location.href} to ${sPlayerAddress}`);
	document.documentElement.setAttribute('data-tw5-redirection', sPlayerAddress);
	setPageAddress(sPlayerAddress, true);
}

/**
 * @function
 * @description Handles pointerdown and click events.
 * @param {Event} oEvent - The event.
 * @translation обработатьPointerDownИClick
 */
function handlePointerDownAndClick(oEvent) {
	if (g_oParsedAddress) {
		const elLink = oEvent.target.closest('a[href]');
		if (elLink && oEvent.isPrimary !== false && oEvent.button === LEFT_BUTTON && !oEvent.shiftKey && !oEvent.ctrlKey && !oEvent.altKey && !oEvent.metaKey) {
			m_Log.Log(`[content.js] Event ${oEvent.type} occurred on link ${elLink.href}`);
			requestChannelState(parseAddress(elLink));
		}
	}
}

/**
 * @function
 * @description Handles the popstate event.
 * @param {Event} oEvent - The event.
 * @translation обработатьPopState
 */
function handlePopState(oEvent) {
	if (g_oParsedAddress) {
		m_Log.Log(`[content.js] popstate event occurred ${location.href}`);
		if (getBrowserEngineVersion() < 67) {
			document.title = 'Twitch';
		}
		pageAddressChanged('POPSTATE');
		if (document.documentElement.hasAttribute('data-tw5-redirection')) {
			m_Log.Log('[content.js] Hiding popstate event');
			oEvent.stopImmediatePropagation();
		}
	}
}

/**
 * @function
 * @description Handles the tw5-pushstate event.
 * @param {Event} oEvent - The event.
 * @translation обработатьPushState
 */
function handlePushState(oEvent) {
	m_Log.Log(`[content.js] tw5-pushstate event occurred ${location.href}`);
	pageAddressChanged('PUSHSTATE');
}

/**
 * @function
 * @description Handles the launch of our player.
 * @param {Event} oEvent - The event.
 * @translation обработатьЗапускНашегоПроигрывателя
 */
function handleLaunchOurPlayer(oEvent) {
	oEvent.preventDefault();
	if (oEvent.button === LEFT_BUTTON && g_oParsedAddress.sPage === 'POSSIBLY_LIVE_STREAM') {
		launchOurPlayer(g_oParsedAddress.sChannelCode);
	} else {
		m_Log.Log(`[content.js] Do not launch player Button=${oEvent.button} Page=${g_oParsedAddress.sPage}`);
	}
}

/**
 * @function
 * @description Handles toggling auto-redirection.
 * @param {Event} oEvent - The event.
 * @translation обработатьПереключениеАвтоперенаправления
 */
function handleToggleAutoRedirection(oEvent) {
	oEvent.preventDefault();
	const b = !m_Settings.Get('bAutoRedirectAllowed');
	m_Log.Log(`[content.js] Auto-redirection allowed: ${b}`);
	m_Settings.Set('bAutoRedirectAllowed', b);
	updateOurButton();
}

/**
 * @function
 * @description Handles closing the help tooltip.
 * @param {Event} oEvent - The event.
 * @translation обработатьЗакрытиеСправки
 */
function handleCloseHelp(oEvent) {
	oEvent.preventDefault();
	m_Log.Log('[content.js] Closing help');
	oEvent.currentTarget.classList.remove('tw5-help');
	oEvent.currentTarget.removeEventListener('mouseover', handleCloseHelp);
	oEvent.currentTarget.removeEventListener('touchstart', handleCloseHelp, {
		passive: false
	});
	m_Settings.Set('bAutoRedirectNoticed', true);
}

/**
 * @function
 * @description Gets our button element.
 * @returns {?Element} The button element.
 * @translation получитьНашуКнопку
 */
function getOurButton() {
	return document.getElementById('tw5-autoredirect');
}

/**
 * @function
 * @description Updates the state of our button.
 * @translation обновитьНашуКнопку
 */
function updateOurButton() {
	getOurButton().classList.toggle('tw5-disabled', !m_Settings.Get('bAutoRedirectAllowed'));
}

/**
 * @function
 * @description Inserts our button into the page.
 * @returns {boolean} Whether the button was inserted.
 * @translation вставитьНашуКнопку
 */
function insertOurButton() {
	if (g_oParsedAddress.bIsMobile) {
		const elWhereToInsert = document.querySelector('.top-nav__menu > div:last-child > div:first-child');
		if (!elWhereToInsert) {
			return false;
		}
		m_Log.Log('[content.js] Inserting our button for mobile site');
		elWhereToInsert.insertAdjacentHTML('afterend', `
		<div class="tw5-autoredirect tw5-js-remove">
			<button id="tw5-autoredirect">
				<svg viewBox="0 0 128 128">
					<g>
						<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
					</g>
				</svg>
			</button>
			<style>
				.tw5-autoredirect
				{
					flex: 0 0;
					margin: 0 0 0 .5rem;
				}
				.tw5-autoredirect button
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
				.tw-root--theme-dark .tw5-autoredirect button
				{
					color: #efeff1;
				}
				.tw5-autoredirect button:active
				{
					background-color: rgba(0, 0, 0, 0.05);
				}
				.tw-root--theme-dark .tw5-autoredirect button:active
				{
					background-color: rgba(255, 255, 255, 0.15);
				}
				.tw5-autoredirect svg
				{
					fill: currentColor;
					width: 75%;
				}
				.tw5-disabled svg
				{
					opacity: .4;
				}
			</style>
		</div>
		`);
	} else {
		const elWhereToInsert = document.querySelector('.top-nav__menu > div:last-child > div:first-child');
		if (!elWhereToInsert) {
			return false;
		}
		m_Log.Log('[content.js] Inserting our button');
		elWhereToInsert.insertAdjacentHTML('afterend', `
		<div class="tw5-autoredirect tw5-js-remove">
			<button id="tw5-autoredirect">
				<svg viewBox="0 0 128 128">
					<g>
						<path d="M64 53h-19.688l-1.313-15.225h57l1.313-14.7h-74.55l3.937 44.888h51.712l-1.8 19.162-16.6 4.463l-16.8-4.463-1.1-11.813h-14.7l1.838 23.362 30.713 8.4l30.45-8.4 4.2-45.675z"/>
					</g>
				</svg>
			</button>
			<div class="tw5-tooltip">
				${m_i18n.GetMessage('F0600')}
			</div>
			<style>
				.tw5-autoredirect
				{
					flex: 0 0;
					margin: 0 .5rem;
					position: relative;
				}
				.tw5-autoredirect button
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
				.tw5-autoredirect button:hover
				{
					background-color: var(--color-background-button-text-hover);
					color: var(--color-fill-button-icon-hover);
				}
				.tw5-autoredirect button:active
				{
					background-color: var(--color-background-button-text-active);
					color: var(--color-fill-button-icon-active);
				}
				.tw5-autoredirect svg
				{
					fill: currentColor;
					width: 75%;
				}
				.tw5-disabled svg
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
				.tw5-autoredirect:hover .tw5-tooltip
				{
					display: block;
				}
				.tw5-help .tw5-tooltip
				{
					background: #f00000;
					color: #fff;
					cursor: pointer;
					display: block;
					pointer-events: auto;
				}
			</style>
		</div>
		`);
	}
	const elButton = getOurButton();
	elButton.addEventListener('click', handleLaunchOurPlayer);
	elButton.addEventListener('contextmenu', handleToggleAutoRedirection);
	if (!g_oParsedAddress.bIsMobile && !m_Settings.Get('bAutoRedirectNoticed')) {
		elButton.parentNode.classList.add('tw5-help');
		elButton.parentNode.addEventListener('mouseover', handleCloseHelp);
		elButton.parentNode.addEventListener('touchstart', handleCloseHelp, {
			passive: false
		});
	}
	updateOurButton();
	return true;
}

/**
 * @function
 * @description Inserts our button if it's needed.
 * @returns {boolean} Whether the button was inserted.
 * @translation вставитьНашуКнопкуЕслиНужно
 */
function insertOurButtonIfNeeded() {
	return Boolean(getOurButton()) || insertOurButton();
}

/**
 * @function
 * @description Inserts our button for the first time.
 * @translation вставитьНашуКнопкуВПервыйРаз
 */
function insertOurButtonForTheFirstTime() {
	insertOurButton();
	if (g_oParsedAddress.bIsMobile) {
		new MutationObserver(moRecords => {
			insertOurButtonIfNeeded();
		}).observe(document.head || document.documentElement, {
			childList: true,
			subtree: true
		});
	} else {
		window.addEventListener('tw5-titlechanged', insertOurButtonIfNeeded);
	}
}

/**
 * @function
 * @description Waits for the DOM to be loaded.
 * @returns {Promise<void>} A promise that resolves when the DOM is loaded.
 * @translation ждатьЗагрузкуДомика
 */
function waitForDOMLoad() {
	return new Promise(fResolve => {
		if (document.readyState !== 'loading') {
			fResolve();
		} else {
			document.addEventListener('DOMContentLoaded', function HandleDOMLoad() {
				document.removeEventListener('DOMContentLoaded', HandleDOMLoad);
				fResolve();
			});
		}
	});
}

/**
 * @function
 * @description Waits for the page to be fully loaded.
 * @returns {Promise<void>} A promise that resolves when the page is loaded.
 * @translation ждатьЗагрузкуСтраницы
 */
function waitForPageLoad() {
	return new Promise(fResolve => {
		if (document.readyState === 'complete') {
			fResolve();
		} else {
			window.addEventListener('load', function HandlePageLoad() {
				window.removeEventListener('load', HandlePageLoad);
				fResolve();
			});
		}
	});
}

/**
 * @function
 * @description Inserts third-party extensions.
 * @translation вставитьСторонниеРасширения
 */
function insertThirdPartyExtensions() {
	chrome.runtime.sendMessage({
		sRequest: 'InsertThirdPartyExtensions'
	}, oMessage => {
		if (chrome.runtime.lastError) {
			m_Log.Log(`[content.js] Failed to send request to insert third-party extensions: ${chrome.runtime.lastError.message}`);
			return;
		}
		//! oMessage.sThirdPartyExtensions contains a limited set of known browser extensions that are currently
		//! installed and enabled in the browser. See handleChatMessage() in player.js. Load those
		//! extensions into <iframe>. Chrome itself cannot load installed extensions into another extension.
		//! See https://bugs.chromium.org/p/chromium/issues/detail?id=599167
				if (oMessage.sThirdPartyExtensions.includes('BTTV ')) {
			waitForPageLoad().then(() => {
				
				//! BetterTTV browser extension
				//! https://betterttv.com/
				//! https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped
				const script = document.createElement('script');
				script.id = 'betterttv';
				script.src = 'https://cdn.betterttv.net/betterttv.js';
				document.head.appendChild(script);
			});
		}
		if (oMessage.sThirdPartyExtensions.includes('FFZ ')) {
			waitForDOMLoad().then(() => {
				
				//! FrankerFaceZ browser extension
				//! https://www.frankerfacez.com/
				//! https://chrome.google.com/webstore/detail/fadndhdgpmmaapbmfcknlfgcflmmmieb
				const script = document.createElement('script');
				script.id = 'ffz_script';
				script.src = 'https://cdn.frankerfacez.com/script/script.min.js';
				document.head.appendChild(script);
			});
		}
	});
}

/**
 * @function
 * @description Changes the chat style.
 * @translation изменитьСтильЧата
 */
function changeChatStyle() {
	const elStyle = document.createElement('link');
	elStyle.rel = 'stylesheet';
	elStyle.href = chrome.runtime.getURL('content.css');
	elStyle.className = 'tw5-js-remove';
	(document.head || document.documentElement).appendChild(elStyle);
}

/**
 * @function
 * @description Changes the chat behavior.
 * @translation изменитьПоведениеЧата
 */
function changeChatBehavior() {
	window.addEventListener('click', oEvent => {
		if (oEvent.button !== LEFT_BUTTON) {
			return;
		}
		const elLink = oEvent.target.closest('a[href^="http:"],a[href^="https:"],a[href]:not([href=""]):not([href^="#"]):not([href*=":"]):not([href$="/not-a-location"])');
		if (!elLink) {
			return;
		}
		m_Log.Log(`[content.js] Opening link in a new tab: ${elLink.getAttribute('href')}`);
		elLink.target = '_blank';
		oEvent.stopImmediatePropagation();
	}, true);
	const oObserver = new MutationObserver(moRecords => {
		const ael = document.getElementsByClassName('channel-leaderboard');
		if (ael.length !== 0) {
			ael[0].parentElement.parentElement.classList.add('tw5-parent-channel-leaderboard');
			oObserver.disconnect();
		}
	});
	oObserver.observe(document.body || document.documentElement, {
		childList: true,
		subtree: true
	});
	setTimeout(() => oObserver.disconnect(), 6e4);
}

/**
 * @function
 * @description Removes the remnants of the old version.
 * @translation удалитьХвостыСтаройВерсии
 */
function removeOldVersionRemnants() {}

AddExceptionHandler(() => {
	m_Log.Log(`[content.js] Launched ${performance.now().toFixed()}ms ${location.href}`);
	if (parseAddress(location).sPage === 'CHANNEL_CHAT') {
		insertIntoPage();
		if (window.top !== window) {
			insertThirdPartyExtensions();
			changeChatStyle();
			changeChatBehavior();
		}
		return;
	}
	removeOldVersionRemnants();
	const sEvent = window.PointerEvent ? 'pointerdown' : 'mousedown';
	window.addEventListener(sEvent, handlePointerDownAndClick, true);
	window.addEventListener('click', handlePointerDownAndClick, true);
	window.addEventListener('popstate', handlePopState);
	m_Settings.Restore().then(() => {
		pageAddressChanged('LOAD');
		window.addEventListener('tw5-pushstate', handlePushState);
		insertIntoPage();
		insertOurButtonForTheFirstTime();
	}).catch(m_Debug.ExceptionCaught);
})();