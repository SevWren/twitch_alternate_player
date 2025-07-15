'use strict';
/**
 * @fileoverview This file contains common constants, functions and modules that are used across the extension.
 * It includes constants for mouse buttons, chat states, UI positions, and various settings' limits.
 * It also provides utility functions for type checking, string manipulation, and browser feature detection.
 * The file defines several modules: a logging module, an internationalization (i18n) module, and a settings management module.
 */
/**
 * @const {boolean} IS_CONTENT_SCRIPT - True if the script is running as a content script.
 * @translation ЭТО_CONTENT_SCRIPT
 */
const IS_CONTENT_SCRIPT = !document.currentScript;

/**
 * @const {string} DO_NOT_REDIRECT_ADDRESS - A string to be added to the URL to prevent redirection.
 * @translation АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ
 */
const DO_NOT_REDIRECT_ADDRESS = 'twitch5=0';

/**
 * @const {number} LEFT_BUTTON - The value for the left mouse button.
 * @translation ЛЕВАЯ_КНОПКА
 */
const LEFT_BUTTON = 0;

/**
 * @const {number} MIDDLE_BUTTON - The value for the middle mouse button.
 * @translation СРЕДНЯЯ_КНОПКА
 */
const MIDDLE_BUTTON = 1;

/**
 * @const {number} RIGHT_BUTTON - The value for the right mouse button.
 * @translation ПРАВАЯ_КНОПКА
 */
const RIGHT_BUTTON = 2;

/**
 * @const {number} LEFT_BUTTON_PRESSED - The bitmask for the left mouse button being pressed.
 * @translation НАЖАТА_ЛЕВАЯ_КНОПКА
 */
const LEFT_BUTTON_PRESSED = 1;

/**
 * @const {number} RIGHT_BUTTON_PRESSED - The bitmask for the right mouse button being pressed.
 * @translation НАЖАТА_ПРАВАЯ_КНОПКА
 */
const RIGHT_BUTTON_PRESSED = 2;

/**
 * @const {number} MIDDLE_BUTTON_PRESSED - The bitmask for the middle mouse button being pressed.
 * @translation НАЖАТА_СРЕДНЯЯ_КНОПКА
 */
const MIDDLE_BUTTON_PRESSED = 4;

/**
 * @const {object} PASSIVE_HANDLER - An object to specify a passive event listener.
 * @translation ПАССИВНЫЙ_ОБРАБОТЧИК
 */
const PASSIVE_HANDLER = {
	passive: true
};

/**
 * @const {number} MIN_SETTING_VALUE - The minimum safe integer value for a setting.
 * @translation МИН_ЗНАЧЕНИЕ_НАСТРОЙКИ
 */
const MIN_SETTING_VALUE = Number.MIN_SAFE_INTEGER + 1e3;

/**
 * @const {number} MAX_SETTING_VALUE - The maximum safe integer value for a setting.
 * @translation МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ
 */
const MAX_SETTING_VALUE = Number.MAX_SAFE_INTEGER - 1e3;

/**
 * @const {number} AUTO_SETTING - A special value to indicate automatic configuration.
 * @translation АВТОНАСТРОЙКА
 */
const AUTO_SETTING = Number.MIN_SAFE_INTEGER;

/**
 * @const {number} MIN_VOLUME - The minimum volume level.
 * @translation МИНИМАЛЬНАЯ_ГРОМКОСТЬ
 */
const MIN_VOLUME = 1;

/**
 * @const {number} MAX_VOLUME - The maximum volume level.
 * @translation МАКСИМАЛЬНАЯ_ГРОМКОСТЬ
 */
const MAX_VOLUME = 100;

/**
 * @const {number} VOLUME_INCREASE_STEP_KEY - The amount to increase volume by when using the keyboard.
 * @translation ШАГ_ПОВЫШЕНИЯ_ГРОМКОСТИ_КЛАВОЙ
 */
const VOLUME_INCREASE_STEP_KEY = 4;

/**
 * @const {number} VOLUME_DECREASE_STEP_KEY - The amount to decrease volume by when using the keyboard.
 * @translation ШАГ_ПОНИЖЕНИЯ_ГРОМКОСТИ_КЛАВОЙ
 */
const VOLUME_DECREASE_STEP_KEY = 2;

/**
 * @const {number} CHAT_UNLOADED - The state when the chat is unloaded.
 * @translation ЧАТ_ВЫГРУЖЕН
 */
const CHAT_UNLOADED = 0;

/**
 * @const {number} CHAT_HIDDEN - The state when the chat is hidden.
 * @translation ЧАТ_СКРЫТ
 */
const CHAT_HIDDEN = 1;

/**
 * @const {number} CHAT_PANEL - The state when the chat is in a panel.
 * @translation ЧАТ_ПАНЕЛЬ
 */
const CHAT_PANEL = 2;

/**
 * @const {number} TOP_SIDE - The value for the top side.
 * @translation ВЕРХНЯЯ_СТОРОНА
 */
const TOP_SIDE = 1;

/**
 * @const {number} RIGHT_SIDE - The value for the right side.
 * @translation ПРАВАЯ_СТОРОНА
 */
const RIGHT_SIDE = 2;

/**
 * @const {number} BOTTOM_SIDE - The value for the bottom side.
 * @translation НИЖНЯЯ_СТОРОНА
 */
const BOTTOM_SIDE = 3;

/**
 * @const {number} LEFT_SIDE - The value for the left side.
 * @translation ЛЕВАЯ_СТОРОНА
 */
const LEFT_SIDE = 4;

/**
 * @const {number} MIN_REPEAT_DURATION - The minimum duration for repeat in seconds.
 * @translation МИН_ДЛИТЕЛЬНОСТЬ_ПОВТОРА
 */
const MIN_REPEAT_DURATION = 30;

/**
 * @const {number} MAX_REPEAT_DURATION - The maximum duration for repeat in seconds.
 * @translation МАКС_ДЛИТЕЛЬНОСТЬ_ПОВТОРА
 */
const MAX_REPEAT_DURATION = 300;

/**
 * @const {number} MIN_BUFFER_SIZE - The minimum buffer size in seconds.
 * @translation МИН_РАЗМЕР_БУФЕРА
 */
const MIN_BUFFER_SIZE = 1.5;

/**
 * @const {number} MAX_BUFFER_SIZE - The maximum buffer size in seconds.
 * @translation МАКС_РАЗМЕР_БУФЕРА
 */
const MAX_BUFFER_SIZE = 30;

/**
 * @const {number} MIN_BUFFER_STRETCH - The minimum buffer stretch in seconds.
 * @translation МИН_РАСТЯГИВАНИЕ_БУФЕРА
 */
const MIN_BUFFER_STRETCH = 9;

/**
 * @const {number} MAX_BUFFER_STRETCH - The maximum buffer stretch in seconds.
 * @translation МАКС_РАСТЯГИВАНИЕ_БУФЕРА
 */
const MAX_BUFFER_STRETCH = 30;

/**
 * @const {number} BUFFER_OVERFLOW - The buffer size that is considered an overflow.
 * @translation ПЕРЕПОЛНЕНИЕ_БУФЕРА
 */
const BUFFER_OVERFLOW = MAX_BUFFER_SIZE + MAX_BUFFER_STRETCH;

/**
 * @type {boolean} g_bWorkFinished - A flag indicating if the work is finished.
 * @translation г_лРаботаЗавершена
 */
let g_bWorkFinished = false;

if (!NodeList.prototype[Symbol.iterator]) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}

if (!HTMLCollection.prototype[Symbol.iterator]) {
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}

if (!IS_CONTENT_SCRIPT && !window.PointerEvent) {
	const elScript = document.createElement('script');
	elScript.src = 'pointerevent.js';
	document.currentScript.parentNode.appendChild(elScript);
}

/**
 * @const {function} NOOP - A no-operation function.
 * @translation ЗАГЛУШКА
 */
const NOOP = () => {};

/**
 * @function Check
 * @description Checks a condition and throws an error if it's not met.
 * @param {*} pCondition - The condition to check.
 * @translation Проверить
 */
function Check(pCondition) {
	if (!pCondition) {
		throw new Error('Check failed');
	}
}

/**
 * @function AddExceptionHandler
 * @description Wraps a function with an exception handler.
 * @param {function} fFunction - The function to wrap.
 * @returns {function} The wrapped function.
 * @translation ДобавитьОбработчикИсключений
 */
function AddExceptionHandler(fFunction) {
	return function() {
		if (g_bWorkFinished) {
			return;
		}
		try {
			return fFunction.apply(this, arguments);
		} catch (pException) {
			m_Debug.ExceptionCaught(pException);
		}
	};
}

/**
 * @function ExceptionToString
 * @description Converts an exception to a string.
 * @param {*} pException - The exception to convert.
 * @returns {string} The string representation of the exception.
 * @translation ПеревестиИсключениеВСтроку
 */
function ExceptionToString(pException) {
	return pException instanceof Error ? pException.stack : `[typeof ${typeof pException}] ${new Error(pException).stack}`;
}

/**
 * @function Type
 * @description Gets the type of a value.
 * @param {*} pValue - The value.
 * @returns {string} The type of the value.
 * @translation Тип
 */
function Type(pValue) {
	return pValue === null ? 'null' : typeof pValue;
}

/**
 * @function IsNumber
 * @description Checks if a value is a number.
 * @param {*} pValue - The value to check.
 * @returns {boolean} True if the value is a number, false otherwise.
 * @translation ЭтоЧисло
 */
function IsNumber(pValue) {
	return typeof pValue == 'number' && pValue == pValue;
}

/**
 * @function IsObject
 * @description Checks if a value is an object.
 * @param {*} pValue - The value to check.
 * @returns {boolean} True if the value is an object, false otherwise.
 * @translation ЭтоОбъект
 */
function IsObject(pValue) {
	return typeof pValue == 'object' && pValue !== null;
}

/**
 * @function IsNotEmptyString
 * @description Checks if a value is a non-empty string.
 * @param {*} pValue - The value to check.
 * @returns {boolean} True if the value is a non-empty string, false otherwise.
 * @translation ЭтоНепустаяСтрока
 */
function IsNotEmptyString(pValue) {
	return typeof pValue == 'string' && pValue !== '';
}

/**
 * @function LimitStringLength
 * @description Limits the length of a string.
 * @param {string} sString - The string to limit.
 * @param {number} nMaxLength - The maximum length.
 * @returns {string} The limited string.
 * @translation ОграничитьДлинуСтроки
 */
function LimitStringLength(sString, nMaxLength) {
	return sString.length <= nMaxLength ? sString : `${sString.slice(0, nMaxLength)}---8<---${sString.length - nMaxLength}`;
}

/**
 * @function getBrowserEngineVersion
 * @description Gets the version of the browser engine.
 * @returns {number} The browser engine version.
 * @translation получитьВерсиюДвижкаБраузера
 */
function getBrowserEngineVersion() {
	if (!getBrowserEngineVersion._nResult) {
		if (navigator.userAgentData) {
			for (const {brand, version} of navigator.userAgentData.brands) {
				if (brand === 'Chromium' || brand === 'Google Chrome') {
					getBrowserEngineVersion._nResult = Number.parseInt(version, 10);
					break;
				}
			}
		}
		if (!getBrowserEngineVersion._nResult) {
			getBrowserEngineVersion._nResult = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)[1]);
		}
	}
	return getBrowserEngineVersion._nResult;
}

/**
 * @function isMobileDevice
 * @description Checks if the device is a mobile device.
 * @returns {boolean} True if the device is a mobile device, false otherwise.
 * @translation этоМобильноеУстройство
 */
function isMobileDevice() {
	if (!isMobileDevice.hasOwnProperty('_bResult')) {
		isMobileDevice._bResult = navigator.userAgentData ? navigator.userAgentData.mobile : navigator.userAgent.includes('Android');
	}
	return isMobileDevice._bResult;
}

/**
 * @function Node
 * @description Gets a DOM node.
 * @param {string|Element} pElement - The element or its ID.
 * @returns {Element} The DOM node.
 * @translation Узел
 */
function Node(pElement) {
	const elElement = typeof pElement == 'string' ? document.getElementById(pElement) : pElement;
	Check(elElement.nodeType === 1);
	return elElement;
}

/**
 * @function createGqlRequestBody
 * @description Creates a GQL request body.
 * @param {string} sRequest - The GQL request.
 * @param {object} oVariables - The variables for the request.
 * @returns {string} The GQL request body.
 * @translation создатьТелоЗапросаGql
 */
function createGqlRequestBody(sRequest, oVariables) {
	Check(IsNotEmptyString(sRequest) && IsObject(oVariables));
	return `{"query":${JSON.stringify(sRequest)},"variables":${JSON.stringify(oVariables)}}`;
}

/**
 * @function combineGqlRequests
 * @description Combines multiple GQL request bodies.
 * @param {string[]} asRequestBodies - The request bodies to combine.
 * @returns {string} The combined request body.
 * @translation объединитьЗапросыGql
 */
function combineGqlRequests(asRequestBodies) {
	Check(asRequestBodies[0][0] === '{');
	return `[${asRequestBodies.join(',')}]`;
}

/**
 * @function GetOurPlayerAddress
 * @description Gets the address of our player page.
 * @param {string} sChannelCode - The channel code.
 * @returns {string} The player page address.
 * @translation ПолучитьАдресНашегоПроигрывателя
 */
function GetOurPlayerAddress(sChannelCode) {
	const sParameters = '?channel=' + encodeURIComponent(sChannelCode);
	return chrome.runtime.getURL('player.html') + sParameters;
}

/**
 * @const {object} m_Log - The logging module.
 * @translation м_Журнал
 */
const m_Log = (() => {
	const MAX_LOG_LENGTH = 1500;
	let _asLog = null;
	let _nLastRecord = -1;
	/**
  * @function Add
  * @description Adds a record to the log.
  * @param {string} sImportance - The importance of the record.
  * @param {string} sRecord - The record to add.
  * @translation Добавить
  */
	function Add(sImportance, sRecord) {
		if (_asLog) {
			Check(typeof sImportance == 'string' && typeof sRecord == 'string');
			sRecord = LimitStringLength(`${sImportance} ${(performance.now() / 1e3).toFixed(3)} ${sRecord}`, MAX_LOG_LENGTH);
			if (++_nLastRecord === _asLog.length) {
				_nLastRecord = 0;
			}
			_asLog[_nLastRecord] = sRecord;
		}
	}
	/**
  * @function GetDataForReport
  * @description Gets the log data for a report.
  * @returns {?string[]} The log data.
  * @translation ПолучитьДанныеДляОтчета
  */
	function GetDataForReport() {
		if (!_asLog) {
			return null;
		}
		const nNextRecord = _nLastRecord + 1;
		if (nNextRecord === _asLog.length) {
			return _asLog;
		}
		if (_asLog[nNextRecord] === void 0) {
			return _asLog.slice(0, nNextRecord);
		}
		return _asLog.slice(nNextRecord).concat(_asLog.slice(0, nNextRecord));
	}
	/**
  * @function Log
  * @description Logs a message.
  * @param {string} sRecord - The message to log.
  * @translation Вот
  */
	function Log(sRecord) {
		Check(arguments.length === 1);
		Add(' ', sRecord);
	}
	/**
  * @function LogInfo
  * @description Logs an informational message.
  * @param {string} sRecord - The message to log.
  * @translation Окак
  */
	function LogInfo(sRecord) {
		Check(arguments.length === 1);
		Add('~', sRecord);
	}
	/**
  * @function LogError
  * @description Logs an error message.
  * @param {string} sRecord - The message to log.
  * @translation Ой
  */
	function LogError(sRecord) {
		Check(arguments.length === 1);
		Add('@', sRecord);
	}
	/**
  * @function O
  * @description Converts an object to a string for logging.
  * @param {*} pObject - The object to convert.
  * @returns {string} The string representation of the object.
  */
	function O(pObject) {
		switch (Type(pObject)) {
		  case 'object':
			return JSON.stringify(pObject);

		  case 'function':
			return `[function ${pObject.name}]`;

		  case 'symbol':
			return '[symbol]';

		  default:
			return String(pObject);
		}
	}
	/**
  * @function F
  * @description Creates a function that formats a number to a fixed number of decimal places.
  * @param {number} nPrecision - The number of decimal places.
  * @returns {function} The formatting function.
  */
	function F(nPrecision) {
		return nValue => typeof nValue == 'number' ? nValue.toFixed(nPrecision) : 'NaN';
	}
	if (!IS_CONTENT_SCRIPT) {
		_asLog = new Array(1500);
		Log(`[Log] Log started ${performance.now().toFixed()}ms`);
	}
	return {
		Log,
		LogInfo,
		LogError,
		O,
		F0: F(0),
		F1: F(1),
		F2: F(2),
		F3: F(3),
		GetDataForReport
	};
})();

/**
 * @const {object} m_i18n - The internationalization module.
 * @translation м_i18n
 */
const m_i18n = (() => {
	const LANGUAGE_NAMES = {
		AR: 'العربية',
		ASE: 'American Sign Language',
		ASL: 'American Sign Language',
		BG: 'Български',
		CA: 'Català',
		CS: 'Čeština',
		DA: 'Dansk',
		DE: 'Deutsch',
		EL: 'Ελληνικά',
		EN: 'English',
		EN_GB: 'English (UK)',
		ES: 'Español',
		ES_MX: 'Español (Latinoamérica)',
		FI: 'Suomi',
		FR: 'Français',
		HI: 'हिन्दी',
		HU: 'Magyar',
		ID: 'Bahasa Indonesia',
		IT: 'Italiano',
		JA: '日本語',
		KO: '한국어',
		MS: 'بهاس ملايو',
		NL: 'Nederlands',
		NO: 'Norsk',
		PL: 'Polski',
		PT: 'Português',
		PT_BR: 'Português (Brasil)',
		RO: 'Română',
		RU: 'Русский',
		SK: 'Slovenčina',
		SV: 'Svenska',
		TH: 'ภาษาไทย',
		TL: 'Tagalog',
		TR: 'Türkçe',
		UK: 'Українська',
		VI: 'Tiếng Việt',
		ZH: '中文',
		ZH_HK: '中文（香港）',
		ZH_CN: '简体中文',
		ZH_TW: '繁體中文'
	};
	const _amFormatNumber = new Map();
	let _fFormatDate = null;
	/**
  * @function GetMessage
  * @description Gets a message from the i18n API.
  * @param {string} sMessageName - The name of the message.
  * @param {string} [sSubstitution] - A substitution for the message.
  * @returns {string} The message text.
  */
	function GetMessage(sMessageName, sSubstitution) {
		Check(IsNotEmptyString(sMessageName));
		Check(sSubstitution === void 0 || typeof sSubstitution == 'string');
		const sMessageText = chrome.i18n.getMessage(sMessageName, sSubstitution);
		if (!sMessageText) {
			throw new Error(`Message not found ${sMessageName}`);
		}
		return sMessageText;
	}
	/**
  * @function FastInsertAdjacentHtmlMessage
  * @description Inserts a message as HTML into an element.
  * @param {Element} elInsertTo - The element to insert into.
  * @param {string} sPosition - The position to insert at.
  * @param {string} sMessageName - The name of the message.
  */
	function FastInsertAdjacentHtmlMessage(elInsertTo, sPosition, sMessageName) {
		
		//! HTML content is taken from the file messages.json. See GetMessage().
		elInsertTo.insertAdjacentHTML(sPosition, GetMessage(sMessageName));
	}
	/**
  * @function InsertAdjacentHtmlMessage
  * @description Inserts a message as HTML into an element.
  * @param {string|Element} vInsertTo - The element or its ID.
  * @param {string} sPosition - The position to insert at.
  * @param {string} sMessageName - The name of the message.
  * @returns {Element} The element.
  */
	function InsertAdjacentHtmlMessage(vInsertTo, sPosition, sMessageName) {
		const elInsertTo = Node(vInsertTo);
		if (sPosition === 'content') {
			sPosition = 'beforeend';
			elInsertTo.textContent = '';
		}
		FastInsertAdjacentHtmlMessage(elInsertTo, sPosition, sMessageName);
		return elInsertTo;
	}
	/**
  * @function TranslateDocument
  * @description Translates the document.
  * @param {Document} oDocument - The document to translate.
  */
	function TranslateDocument(oDocument) {
		m_Log.Log('[i18n] Translating document');
		for (let elTranslate, celTranslate = oDocument.querySelectorAll('*[data-i18n]'), i = 0; elTranslate = celTranslate[i]; ++i) {
			const sNames = elTranslate.getAttribute('data-i18n');
			const sNamesDelimiter = sNames.indexOf('^');
			if (sNamesDelimiter !== 0) {
				FastInsertAdjacentHtmlMessage(elTranslate, 'afterbegin', sNamesDelimiter === -1 ? sNames : sNames.slice(0, sNamesDelimiter));
			}
			if (sNamesDelimiter !== -1) {
				elTranslate.title = GetMessage(sNames.slice(sNamesDelimiter + 1));
			}
		}
	}
	/**
  * @function FormatNumber
  * @description Formats a number.
  * @param {number} pNumber - The number to format.
  * @param {number} [nFractionDigits] - The number of fraction digits.
  * @returns {string} The formatted number.
  * @translation ФорматироватьЧисло
  */
	function FormatNumber(pNumber, nFractionDigits) {
		Check(nFractionDigits === void 0 || typeof nFractionDigits == 'number' && nFractionDigits >= 0);
		let fFormatter = _amFormatNumber.get(nFractionDigits);
		if (!fFormatter) {
			fFormatter = new Intl.NumberFormat([], nFractionDigits === void 0 ? void 0 : {
				minimumFractionDigits: nFractionDigits,
				maximumFractionDigits: nFractionDigits
			}).format;
			_amFormatNumber.set(nFractionDigits, fFormatter);
		}
		return fFormatter(pNumber);
	}
	/**
  * @function FormatDate
  * @description Formats a date.
  * @param {Date|number} pDate - The date to format.
  * @returns {string} The formatted date.
  * @translation ФорматироватьДату
  */
	function FormatDate(pDate) {
		Check(Number.isFinite(pDate) || Number.isFinite(pDate.getTime()));
		if (!_fFormatDate) {
			_fFormatDate = new Intl.DateTimeFormat([], {
				timeZone: 'UTC'
			}).format;
		}
		return _fFormatDate(pDate);
	}
	/**
  * @function SecondsToString
  * @description Converts seconds to a string.
  * @param {number} nSeconds - The number of seconds.
  * @param {boolean} bNeedSeconds - Whether to include seconds in the string.
  * @returns {string} The formatted string.
  * @translation ПеревестиСекундыВСтроку
  */
	function SecondsToString(nSeconds, bNeedSeconds) {
		let n = Math.floor(nSeconds / 60 % 60);
		let s = Math.floor(nSeconds / 60 / 60) + (n < 10 ? ' : 0' : ' : ') + n;
		if (bNeedSeconds) {
			n = Math.floor(nSeconds % 60);
			s += (n < 10 ? ' : 0' : ' : ') + n;
		}
		return s;
	}
	/**
  * @function GetLanguageName
  * @description Gets the name of a language.
  * @param {string} sLanguageCode - The language code.
  * @returns {string} The language name.
  * @translation ПолучитьНазваниеЯзыка
  */
	function GetLanguageName(sLanguageCode) {
		const sLanguageName = LANGUAGE_NAMES[sLanguageCode.toUpperCase()];
		if (!sLanguageName) {
			throw new Error(`Unknown language code: ${sLanguageCode}`);
		}
		return sLanguageName;
	}
	return {
		GetMessage,
		InsertAdjacentHtmlMessage,
		TranslateDocument,
		FormatNumber,
		FormatDate,
		SecondsToString,
		GetLanguageName
	};
})();

/**
 * @const {object} m_Settings - The settings management module.
 * @translation м_Настройки
 */
const m_Settings = (() => {
	const SETTINGS_VERSION = 2;
	const _amBufferingPresets = new Map([ [ 'J0126', {
		nConcurrentDownloads: 1,
		nPlaybackStart: 3,
		nBufferSize: 5,
		nBufferStretch: 15
	} ], [ 'J0127', {
		nConcurrentDownloads: 2,
		nPlaybackStart: 3,
		nBufferSize: 8.5,
		nBufferStretch: 20
	} ], [ 'J0128', {
		nConcurrentDownloads: 2,
		nPlaybackStart: 17,
		nBufferSize: 9.5,
		nBufferStretch: 30
	} ] ]);
	const _amAppearancePresets = new Map([ [ 'J0122', {
		sBackgroundColor: '#282828',
		sGradientColor: '#d4d4d4',
		sButtonColor: '#d3be96',
		sTitleColor: '#cdbdec',
		sHighlightColor: '#ffd862',
		nOpacity: 25
	} ], [ 'J0121', {
		sBackgroundColor: '#405b77',
		sGradientColor: '#aaccf2',
		sButtonColor: '#ffffff',
		sTitleColor: '#c2e4ff',
		sHighlightColor: '#fef17c',
		nOpacity: 30
	} ], [ 'J0138', {
		sBackgroundColor: '#4b4b4b',
		sGradientColor: '#aaaaaa',
		sButtonColor: '#bad4f8',
		sTitleColor: '#e2ebb4',
		sHighlightColor: '#75a9f0',
		nOpacity: 5
	} ], [ 'J0125', {
		sBackgroundColor: '#161616',
		sGradientColor: '#a0a0a0',
		sButtonColor: '#f0f0f0',
		sTitleColor: '#baccda',
		sHighlightColor: '#6cb6ff',
		nOpacity: 20
	} ] ]);
	const _amoPresetMetadata = [ {
		amData: _amBufferingPresets,
		sCustom: 'J0129',
		sSelected: 'sPresetSelected_buffering',
		sFilled: 'bPresetFilled_buffering',
		sList: 'preset-buffering',
		sEvent: 'settings-preset-buffering-changed'
	}, {
		amData: _amAppearancePresets,
		sCustom: 'J0123',
		sSelected: 'sPresetSelected_appearance',
		sFilled: 'bPresetFilled_appearance',
		sList: 'preset-appearance',
		sEvent: 'settings-preset-appearance-changed'
	} ];
	const _mnoPermanentSettings = new Set([ 'nSettingsVersion', 'nRandomNumber', 'sPreviousVersion', 'nLastExtensionUpdateCheck', 'bAutoRedirectNoticed' ]);
	const _mnoDoNotExport = new Set();
	class Setting {
		constructor(pInitial, apEnumeration, nMinimum, nMaximum, sAutoSetting) {
			this.pCurrent = void 0;
			this.pInitial = pInitial;
			this.apEnumeration = apEnumeration;
			this.nMinimum = nMinimum;
			this.nMaximum = nMaximum;
			this.sAutoSetting = sAutoSetting;
		}
		static Create(pInitial) {
			return new this(pInitial, null, MIN_SETTING_VALUE, MAX_SETTING_VALUE, '');
		}
		static CreateEnumeration(pInitial, apEnumeration) {
			return new this(pInitial, apEnumeration, MIN_SETTING_VALUE, MAX_SETTING_VALUE, '');
		}
		static CreateRange(pInitial, nMinimum, nMaximum, sAutoSetting = '') {
			return new this(pInitial, null, nMinimum, nMaximum, sAutoSetting);
		}
		static CheckValue(pValue) {
			Check(pValue == pValue && pValue !== Infinity && pValue !== -Infinity && pValue !== void 0 && typeof pValue != 'function' && typeof pValue != 'symbol' && typeof pValue != 'object');
		}
		FixValue(pValue) {
			Setting.CheckValue(pValue);
			Check(typeof pValue == typeof this.pInitial);
			if (this.apEnumeration) {
				if (!this.apEnumeration.includes(pValue)) {
					pValue = this.pInitial;
				}
			} else if (typeof pValue == 'number') {
				if (pValue === AUTO_SETTING) {
					if (this.sAutoSetting === '') {
						pValue = this.pInitial;
					}
				} else if (pValue < this.nMinimum) {
					pValue = this.nMinimum;
				} else if (pValue > this.nMaximum) {
					pValue = this.nMaximum;
				}
			}
			return pValue;
		}
	}
	const _oSettings = {
		nSettingsVersion: Setting.Create(SETTINGS_VERSION),
		nRandomNumber: Setting.Create(Math.random()),
		sPreviousVersion: Setting.Create('2000.1.1'),
		nLastExtensionUpdateCheck: Setting.Create(0),
		nVolume2: Setting.CreateRange(MAX_VOLUME / 2, MIN_VOLUME, MAX_VOLUME),
		bMute: Setting.Create(false),
		sAudioDeviceId: Setting.Create(''),
		sVariantName: Setting.Create('CoolCmd'),
		nVariantBitrate: Setting.Create(MAX_SETTING_VALUE),
		nRepeatDuration2: Setting.CreateRange(60, MIN_REPEAT_DURATION, MAX_REPEAT_DURATION, 'J0124'),
		bScaleImage: Setting.Create(true),
		nChatState: Setting.CreateEnumeration(CHAT_UNLOADED, [ CHAT_UNLOADED, CHAT_HIDDEN, CHAT_PANEL ]),
		nClosedChatState: Setting.CreateEnumeration(CHAT_UNLOADED, [ CHAT_UNLOADED, CHAT_HIDDEN ]),
		bAutoChatPosition: Setting.Create(isMobileDevice()),
		nHorizontalChatPosition: Setting.CreateEnumeration(RIGHT_SIDE, [ RIGHT_SIDE, LEFT_SIDE ]),
		nVerticalChatPosition: Setting.CreateEnumeration(BOTTOM_SIDE, [ TOP_SIDE, BOTTOM_SIDE ]),
		nChatPanelPosition: Setting.CreateEnumeration(RIGHT_SIDE, [ TOP_SIDE, RIGHT_SIDE, BOTTOM_SIDE, LEFT_SIDE ]),
		nChatPanelWidth: Setting.CreateRange(340, 100, MAX_SETTING_VALUE),
		nChatPanelHeight: Setting.CreateRange(250, 100, MAX_SETTING_VALUE),
		bFullFeaturedChat: Setting.Create(true),
		bDimChat: Setting.Create(false),
		nInterfaceSize: Setting.CreateRange(isMobileDevice() ? 115 : 100, 50, 200),
		nAutoHideInterval: Setting.CreateRange(4, .5, 60),
		bInterfaceAnimation: Setting.Create(!isMobileDevice()),
		bChangeVolumeWithWheel: Setting.Create(true),
		nVolumeChangeStepWithWheel: Setting.CreateRange(5, -10, 10),
		bShowStatistics: Setting.Create(false),
		sPresetSelected_buffering: Setting.Create('J0127'),
		bPresetFilled_buffering: Setting.Create(false),
		nConcurrentDownloads: Setting.CreateRange(0, 1, 3),
		nPlaybackStart: Setting.CreateRange(0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE),
		nBufferSize: Setting.CreateRange(0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE),
		nBufferStretch: Setting.CreateRange(0, MIN_BUFFER_STRETCH, MAX_BUFFER_STRETCH),
		sPresetSelected_appearance: Setting.Create('J0122'),
		bPresetFilled_appearance: Setting.Create(false),
		sBackgroundColor: Setting.Create(''),
		sGradientColor: Setting.Create('#ffffff'),
		sButtonColor: Setting.Create(''),
		sTitleColor: Setting.Create(''),
		sHighlightColor: Setting.Create(''),
		nOpacity: Setting.CreateRange(0, 0, 80),
		bAutoRedirectAllowed: Setting.Create(true),
		bAutoRedirectNoticed: Setting.Create(false)
	};
	const SAVE_DELAY = IS_CONTENT_SCRIPT ? 50 : 500;
	let _nDelayedSaveTimer = 0;
	let _oDelayedSave = null;
	let _bDelayedDelete = false;
	/**
  * @function Restore
  * @description Restores the settings from storage.
  * @returns {Promise<void>} A promise that resolves when the settings are restored.
  * @translation Восстановить
  */
	function Restore() {
		m_Log.Log('[Settings] Restoring settings');
		return new Promise((fResolve, fReject) => {
			chrome.storage.local.get(null, oRestoredSettings => {
				if (g_bWorkFinished) {
					return;
				}
				try {
					if (chrome.runtime.lastError) {
						console.error('storage.local.get', chrome.runtime.lastError.message);
						m_Debug.TerminateAndShowMessage('J0221');
					}
					m_Log.Log(`[Settings] Settings read from storage: ${m_Log.O(oRestoredSettings)}`);
					FinishRestoring(oRestoredSettings);
					fResolve();
				} catch (pException) {
					fReject(pException);
				}
			});
		});
	}
	/**
  * @function FinishRestoring
  * @description Finishes restoring the settings.
  * @param {object} oRestoredSettings - The settings restored from storage.
  * @translation ЗавершитьВосстановление
  */
	function FinishRestoring(oRestoredSettings) {
		Check(IsObject(oRestoredSettings));
		Check(!_oSettings.nSettingsVersion.pCurrent);
		const oToSave = {};
		const bDeleteRest = CheckSettingsVersion(oRestoredSettings, oToSave);
		for (let sName of Object.keys(_oSettings)) {
			if (oRestoredSettings.hasOwnProperty(sName)) {
				const pValue = _oSettings[sName].FixValue(oRestoredSettings[sName]);
				if (pValue !== oRestoredSettings[sName]) {
					oToSave[sName] = pValue;
				}
				_oSettings[sName].pCurrent = pValue;
			} else {
				if (_mnoPermanentSettings.has(sName)) {
					oToSave[sName] = _oSettings[sName].pInitial;
				}
				_oSettings[sName].pCurrent = _oSettings[sName].pInitial;
			}
		}
		StartSaving(oToSave, bDeleteRest);
	}
	/**
  * @function CheckSettingsVersion
  * @description Checks the version of the settings.
  * @param {object} oSettings - The settings to check.
  * @param {object} oToSave - The object to store settings to be saved.
  * @returns {boolean} True if the rest of the settings should be deleted.
  * @translation ПроверитьВерсиюНастроек
  */
	function CheckSettingsVersion(oSettings, oToSave) {
		if (!Number.isInteger(oSettings.nSettingsVersion) || oSettings.nSettingsVersion < 1 || oSettings.nSettingsVersion > SETTINGS_VERSION) {
			for (let sName of Object.keys(oSettings)) {
				delete oSettings[sName];
			}
			return true;
		}
		for (let oMetadata of _amoPresetMetadata) {
			let sName = oSettings[oMetadata.sSelected];
			if (sName !== void 0 && sName !== oMetadata.sCustom) {
				for (let sPresetName of oMetadata.amData.keys()) {
					if (sName === sPresetName) {
						sName = void 0;
						break;
					}
				}
				if (sName !== void 0) {
					oToSave[oMetadata.sSelected] = oSettings[oMetadata.sSelected] = _oSettings[oMetadata.sSelected].pInitial;
				}
			}
		}
		if (oSettings.nClosedChatState !== oSettings.nChatState && (oSettings.nChatState === CHAT_UNLOADED || oSettings.nChatState === CHAT_HIDDEN)) {
			oToSave.nClosedChatState = oSettings.nClosedChatState = oSettings.nChatState;
		}
		if (oSettings.nSettingsVersion === SETTINGS_VERSION) {
			return false;
		}
		oToSave.nSettingsVersion = oSettings.nSettingsVersion = SETTINGS_VERSION;
		return false;
	}
	/**
  * @function StartSaving
  * @description Starts the process of saving the settings.
  * @param {object} oToSave - The settings to save.
  * @param {boolean} bDeleteRest - Whether to delete the rest of the settings.
  * @translation НачатьСохранение
  */
	function StartSaving(oToSave, bDeleteRest) {
		Check(IsObject(oToSave));
		if (Object.keys(oToSave).length !== 0 || bDeleteRest) {
			if (_nDelayedSaveTimer === 0) {
				m_Log.Log(`[Settings] Delaying settings save for ${SAVE_DELAY}ms`);
				_oDelayedSave = oToSave;
				_bDelayedDelete = bDeleteRest;
				_nDelayedSaveTimer = setTimeout(AddExceptionHandler(FinishSaving), SAVE_DELAY);
			} else if (bDeleteRest) {
				_oDelayedSave = oToSave;
				_bDelayedDelete = bDeleteRest;
			} else {
				Object.assign(_oDelayedSave, oToSave);
			}
		}
	}
	/**
  * @function FinishSaving
  * @description Finishes saving the settings.
  * @translation ЗавершитьСохранение
  */
	function FinishSaving() {
		m_Log.Log('[Settings] Finishing delayed save');
		Check(_nDelayedSaveTimer !== 0);
		_nDelayedSaveTimer = 0;
		Check(IsObject(_oDelayedSave));
		Save(_oDelayedSave, _bDelayedDelete);
		_oDelayedSave = null;
	}
	/**
  * @function Save
  * @description Saves the settings to storage.
  * @param {object} oToSave - The settings to save.
  * @param {boolean} bDeleteRest - Whether to delete the rest of the settings.
  * @translation Сохранить
  */
	function Save(oToSave, bDeleteRest) {
		if (bDeleteRest) {
			chrome.storage.local.clear(CheckSaveResult);
			m_Log.Log('[Settings] All settings deleted from storage');
		}
		chrome.storage.local.set(oToSave, CheckSaveResult);
		m_Log.Log(`[Settings] Settings written to storage: ${m_Log.O(oToSave)}`);
	}
	/**
  * @function CheckSaveResult
  * @description Checks the result of a save operation.
  * @translation ПроверитьРезультатСохранения
  */
	function CheckSaveResult() {
		if (chrome.runtime.lastError) {
			console.error('storage.local.set', chrome.runtime.lastError.message);
			m_Debug.TerminateAndShowMessage('J0221');
		}
	}
	/**
  * @function Reset
  * @description Resets the settings to their default values.
  * @translation Сбросить
  */
	function Reset() {
		m_Log.LogInfo('[Settings] Resetting settings');
		Check(_oSettings.nSettingsVersion.pCurrent);
		const oToSave = {};
		for (let sName of _mnoPermanentSettings) {
			oToSave[sName] = _oSettings[sName].pCurrent;
		}
		StartSaving(oToSave, true);
		window.location.reload(true);
	}
	/**
  * @function Export
  * @description Exports the settings to a file.
  * @translation Экспорт
  */
	function Export() {
		m_Log.LogInfo('[Settings] Exporting settings');
		Check(_oSettings.nSettingsVersion.pCurrent);
		const oExport = {
			nSettingsVersion: SETTINGS_VERSION
		};
		for (let sName of Object.keys(_oSettings)) {
			if (!_mnoPermanentSettings.has(sName) && !_mnoDoNotExport.has(sName)) {
				oExport[sName] = _oSettings[sName].pCurrent;
			}
		}
		m_Log.Log(`[Settings] Settings selected for export: ${m_Log.O(oExport)}`);
		WriteTextToLocalFile(JSON.stringify(oExport), 'application/json', Text('J0133'));
	}
	/**
  * @function Import
  * @description Imports settings from a file.
  * @param {File} oFromFile - The file to import from.
  * @translation Импорт
  */
	function Import(oFromFile) {
		m_Log.LogInfo(`[Settings] Importing settings from file ${oFromFile.name}`);
		Check(_oSettings.nSettingsVersion.pCurrent);
		if (oFromFile.size === 0 || oFromFile.size > 1e4) {
			m_Log.LogError(`[Settings] File size: ${oFromFile.size}`);
			m_Notification.ShowError();
			return;
		}
		const oReader = new FileReader();
		oReader.addEventListener('loadend', AddExceptionHandler(() => {
			if (!IsNotEmptyString(oReader.result)) {
				m_Log.LogError(`[Settings] File read result: ${oReader.result}`);
				m_Notification.ShowError();
				return;
			}
			m_Log.Log(`[Settings] Settings read from file: ${oReader.result}`);
			let oToSave;
			try {
				oToSave = JSON.parse(oReader.result);
				if (!IsObject(oToSave)) {
					throw 1;
				}
				if (CheckSettingsVersion(oToSave, oToSave)) {
					throw 2;
				}
				for (let sName of Object.keys(oToSave)) {
					if (!_oSettings.hasOwnProperty(sName) || _mnoDoNotExport.has(sName)) {
						delete oToSave[sName];
					} else {
						oToSave[sName] = _oSettings[sName].FixValue(oToSave[sName]);
						if (oToSave[sName] === _oSettings[sName].pInitial) {
							delete oToSave[sName];
						}
					}
				}
			} catch (pException) {
				m_Log.LogError(`[Settings] Exception caught while parsing settings: ${pException}`);
				m_Notification.ShowError();
				return;
			}
			for (let sName of _mnoPermanentSettings) {
				oToSave[sName] = _oSettings[sName].pCurrent;
			}
			StartSaving(oToSave, true);
			window.location.reload(true);
		}));
		oReader.readAsText(oFromFile);
	}
	/**
  * @function Get2
  * @description Gets a setting value, considering presets.
  * @param {string} sName - The name of the setting.
  * @returns {*} The setting value.
  * @translation Получить2
  */
	function Get2(sName) {
		Check(typeof sName == 'string');
		Check(_oSettings.hasOwnProperty(sName));
		Check(_oSettings.nSettingsVersion.pCurrent);
		for (let oMetadata of _amoPresetMetadata) {
			const oPreset = oMetadata.amData.get(_oSettings[oMetadata.sSelected].pCurrent);
			if (oPreset) {
				const pValue = oPreset[sName];
				if (pValue !== void 0) {
					return pValue;
				}
			}
		}
		return _oSettings[sName].pCurrent;
	}
	/**
  * @function Get
  * @description Gets a setting value.
  * @param {string} sName - The name of the setting.
  * @returns {*} The setting value.
  * @translation Получить
  */
	function Get(sName) {
		if (sName === 'nMaxBufferSize') {
			return Math.max(Get2('nPlaybackStart'), Get2('nBufferSize'));
		}
		return Get2(sName);
	}
	/**
  * @function Set
  * @description Sets a setting value.
  * @param {string} sName - The name of the setting.
  * @param {*} pValue - The value to set.
  * @param {boolean} [bDoNotSave=false] - Whether to not save the setting.
  * @translation Изменить
  */
	function Set(sName, pValue, bDoNotSave = false) {
		Check(typeof sName == 'string');
		Check(_oSettings[sName].FixValue(pValue) === pValue);
		const oToSave = {};
		for (let oMetadata of _amoPresetMetadata) {
			const oPreset = oMetadata.amData.get(_oSettings[oMetadata.sSelected].pCurrent);
			if (oPreset && oPreset.hasOwnProperty(sName)) {
				if (pValue === oPreset[sName]) {
					return;
				}
				Check(!bDoNotSave);
				oToSave[oMetadata.sSelected] = _oSettings[oMetadata.sSelected].pCurrent = oMetadata.sCustom;
				oToSave[oMetadata.sFilled] = _oSettings[oMetadata.sFilled].pCurrent = true;
				for (let sPresetName of Object.keys(oPreset)) {
					oToSave[sPresetName] = _oSettings[sPresetName].pCurrent = oPreset[sPresetName];
				}
				UpdatePresetList(oMetadata);
				break;
			}
		}
		if (_oSettings[sName].pCurrent !== pValue) {
			oToSave[sName] = _oSettings[sName].pCurrent = pValue;
		}
		if (!bDoNotSave) {
			StartSaving(oToSave, false);
		}
	}
	/**
  * @function UpdatePresetList
  * @description Updates a preset list dropdown.
  * @param {object} oMetadata - The metadata for the preset list.
  * @returns {Element} The updated list element.
  * @translation ОбновитьСписокПредустановок
  */
	function UpdatePresetList(oMetadata) {
		const elList = Node(oMetadata.sList);
		elList.length = 0;
		const sSelect = _oSettings[oMetadata.sSelected].pCurrent;
		for (let sName of oMetadata.amData.keys()) {
			elList.add(new Option(Text(sName), sName, sName === sSelect, sName === sSelect));
		}
		if (_oSettings[oMetadata.sFilled].pCurrent) {
			elList.add(new Option(Text(oMetadata.sCustom), oMetadata.sCustom, oMetadata.sCustom === sSelect, oMetadata.sCustom === sSelect));
		}
		Check(elList.value);
		return elList;
	}
	const HandlePresetChange = AddExceptionHandler(oEvent => {
		for (let oMetadata of _amoPresetMetadata) {
			if (oMetadata.sList === oEvent.target.id) {
				Check(oEvent.target.value);
				Set(oMetadata.sSelected, oEvent.target.value);
				m_Events.SendEvent(oMetadata.sEvent);
				return;
			}
		}
		Check(false);
	});
	/**
  * @function ConfigurePresetLists
  * @description Configures the preset list dropdowns.
  * @translation НастроитьСпискиПредустановок
  */
	function ConfigurePresetLists() {
		for (let oMetadata of _amoPresetMetadata) {
			UpdatePresetList(oMetadata).addEventListener('change', HandlePresetChange);
		}
	}
	/**
  * @function GetSettingParameters
  * @description Gets the parameters of a setting.
  * @param {string} sName - The name of the setting.
  * @returns {object} The setting parameters.
  * @translation ПолучитьПараметрыНастройки
  */
	function GetSettingParameters(sName) {
		Check(typeof sName == 'string');
		Check(_oSettings.hasOwnProperty(sName));
		return _oSettings[sName];
	}
	/**
  * @function GetDataForReport
  * @description Gets the settings data for a report.
  * @returns {object} The settings data.
  * @translation ПолучитьДанныеДляОтчета
  */
	function GetDataForReport() {
		const oReport = {};
		for (let sName of Object.keys(_oSettings)) {
			if (!_mnoDoNotExport.has(sName) && (_mnoPermanentSettings.has(sName) || _oSettings[sName].pCurrent !== _oSettings[sName].pInitial)) {
				oReport[sName] = _oSettings[sName].pCurrent;
			}
		}
		return oReport;
	}
	/**
  * @function SaveChanges
  * @description Saves any pending changes to the settings.
  * @translation СохранитьИзменения
  */
	function SaveChanges() {
		if (_nDelayedSaveTimer !== 0) {
			clearTimeout(_nDelayedSaveTimer);
			FinishSaving();
		}
	}
	window.addEventListener('beforeunload', SaveChanges);
	return {
		Restore,
		Reset,
		Export,
		Import,
		Get,
		Set,
		SaveChanges,
		GetSettingParameters,
		ConfigurePresetLists,
		GetDataForReport
	};
})();