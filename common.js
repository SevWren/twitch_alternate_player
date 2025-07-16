'use strict';

const ЭТО_CONTENT_SCRIPT = !document.currentScript;
// const THIS_IS_CONTENT_SCRIPT = !document.currentScript;

const АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ = 'twitch5=0';
// const DO_NOT_REDIRECT_ADDRESS = 'twitch5=0';

const ЛЕВАЯ_КНОПКА = 0;
// const LEFT_BUTTON = 0;

const СРЕДНЯЯ_КНОПКА = 1;
// const MIDDLE_BUTTON = 1;

const ПРАВАЯ_КНОПКА = 2;
// const RIGHT_BUTTON = 2;

const НАЖАТА_ЛЕВАЯ_КНОПКА = 1;
// const LEFT_BUTTON_PRESSED = 1;

const НАЖАТА_ПРАВАЯ_КНОПКА = 2;
// const RIGHT_BUTTON_PRESSED = 2;

const НАЖАТА_СРЕДНЯЯ_КНОПКА = 4;
// const MIDDLE_BUTTON_PRESSED = 4;

const ПАССИВНЫЙ_ОБРАБОТЧИК = {
// const PASSIVE_HANDLER = {
	passive: true
};

const МИН_ЗНАЧЕНИЕ_НАСТРОЙКИ = Number.MIN_SAFE_INTEGER + 1e3;
// const MIN_SETTING_VALUE = Number.MIN_SAFE_INTEGER + 1e3;

const МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ = Number.MAX_SAFE_INTEGER - 1e3;
// const MAX_SETTING_VALUE = Number.MAX_SAFE_INTEGER - 1e3;

const АВТОНАСТРОЙКА = Number.MIN_SAFE_INTEGER;
// const AUTO_ADJUSTMENT = Number.MIN_SAFE_INTEGER;

const МИНИМАЛЬНАЯ_ГРОМКОСТЬ = 1;
// const MIN_VOLUME = 1;

const МАКСИМАЛЬНАЯ_ГРОМКОСТЬ = 100;
// const MAX_VOLUME = 100;

const ШАГ_ПОВЫШЕНИЯ_ГРОМКОСТИ_КЛАВОЙ = 4;
// const VOLUME_INCREASE_STEP_BY_KEY = 4;

const ШАГ_ПОНИЖЕНИЯ_ГРОМКОСТИ_КЛАВОЙ = 2;
// const VOLUME_DECREASE_STEP_BY_KEY = 2;

const ЧАТ_ВЫГРУЖЕН = 0;
// const CHAT_UNLOADED = 0;

const ЧАТ_СКРЫТ = 1;
// const CHAT_HIDDEN = 1;

const ЧАТ_ПАНЕЛЬ = 2;
// const CHAT_PANEL = 2;

const ВЕРХНЯЯ_СТОРОНА = 1;
// const TOP_SIDE = 1;

const ПРАВАЯ_СТОРОНА = 2;
// const RIGHT_SIDE = 2;

const НИЖНЯЯ_СТОРОНА = 3;
// const BOTTOM_SIDE = 3;

const ЛЕВАЯ_СТОРОНА = 4;
// const LEFT_SIDE = 4;

const МИН_ДЛИТЕЛЬНОСТЬ_ПОВТОРА = 30;
// const MIN_REPEAT_DURATION = 30;

const МАКС_ДЛИТЕЛЬНОСТЬ_ПОВТОРА = 300;
// const MAX_REPEAT_DURATION = 300;

const МИН_РАЗМЕР_БУФЕРА = 1.5;
// const MIN_BUFFER_SIZE = 1.5;

const МАКС_РАЗМЕР_БУФЕРА = 30;
// const MAX_BUFFER_SIZE = 30;

const МИН_РАСТЯГИВАНИЕ_БУФЕРА = 9;
// const MIN_BUFFER_STRETCH = 9;

const МАКС_РАСТЯГИВАНИЕ_БУФЕРА = 30;
// const MAX_BUFFER_STRETCH = 30;

const ПЕРЕПОЛНЕНИЕ_БУФЕРА = МАКС_РАЗМЕР_БУФЕРА + МАКС_РАСТЯГИВАНИЕ_БУФЕРА;
// const BUFFER_OVERFLOW = MAX_BUFFER_SIZE + MAX_BUFFER_STRETCH;

let г_лРаботаЗавершена = false;
// let g_bWorkFinished = false;

if (!NodeList.prototype[Symbol.iterator]) {
	NodeList.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}

if (!HTMLCollection.prototype[Symbol.iterator]) {
	HTMLCollection.prototype[Symbol.iterator] = Array.prototype[Symbol.iterator];
}

if (!ЭТО_CONTENT_SCRIPT && !window.PointerEvent) {
// if (!THIS_IS_CONTENT_SCRIPT && !window.PointerEvent) {
	const узСкрипт = document.createElement('script');
	// const nodeScript = document.createElement('script');
	узСкрипт.src = 'pointerevent.js';
	// nodeScript.src = 'pointerevent.js';
	document.currentScript.parentNode.appendChild(узСкрипт);
	// document.currentScript.parentNode.appendChild(nodeScript);
}

const ЗАГЛУШКА = () => {};
// const STUB = () => {};

function Проверить(пУсловие) {
// function Check(pCondition) {
	if (!пУсловие) {
	// if (!pCondition) {
		throw new Error('Проверка не пройдена');
		// throw new Error('Check failed');
	}
}

function ДобавитьОбработчикИсключений(фФункция) {
// function AddExceptionHandler(fFunction) {
	return function() {
		if (г_лРаботаЗавершена) {
		// if (g_bWorkFinished) {
			return;
		}
		try {
			return фФункция.apply(this, arguments);
			// return fFunction.apply(this, arguments);
		} catch (пИсключение) {
		// } catch (pException) {
			м_Отладка.ПойманоИсключение(пИсключение);
			// m_Debug.CaughtException(pException);
		}
	};
}

function ПеревестиИсключениеВСтроку(пИсключение) {
// function ExceptionToString(pException) {
	return пИсключение instanceof Error ? пИсключение.stack : `[typeof ${typeof пИсключение}] ${new Error(пИсключение).stack}`;
	// return pException instanceof Error ? pException.stack : `[typeof ${typeof pException}] ${new Error(pException).stack}`;
}

function Тип(пЗначение) {
// function Type(pValue) {
	return пЗначение === null ? 'null' : typeof пЗначение;
	// return pValue === null ? 'null' : typeof pValue;
}

function ЭтоЧисло(пЗначение) {
// function IsNumber(pValue) {
	return typeof пЗначение == 'number' && пЗначение == пЗначение;
	// return typeof pValue == 'number' && pValue == pValue;
}

function ЭтоОбъект(пЗначение) {
// function IsObject(pValue) {
	return typeof пЗначение == 'object' && пЗначение !== null;
	// return typeof pValue == 'object' && pValue !== null;
}

function ЭтоНепустаяСтрока(пЗначение) {
// function IsNonEmptyString(pValue) {
	return typeof пЗначение == 'string' && пЗначение !== '';
	// return typeof pValue == 'string' && pValue !== '';
}

function ОграничитьДлинуСтроки(сСтрока, чМаксимальнаяДлина) {
// function LimitStringLength(sString, nMaxLength) {
	return сСтрока.length <= чМаксимальнаяДлина ? сСтрока : `${сСтрока.slice(0, чМаксимальнаяДлина)}---8<---${сСтрока.length - чМаксимальнаяДлина}`;
	// return sString.length <= nMaxLength ? sString : `${sString.slice(0, nMaxLength)}---8<---${sString.length - nMaxLength}`;
}

function получитьВерсиюДвижкаБраузера() {
// function getBrowserEngineVersion() {
	if (!получитьВерсиюДвижкаБраузера._чРезультат) {
	// if (!getBrowserEngineVersion._nResult) {
		if (navigator.userAgentData) {
			for (const {brand, version} of navigator.userAgentData.brands) {
				if (brand === 'Chromium' || brand === 'Google Chrome') {
					получитьВерсиюДвижкаБраузера._чРезультат = Number.parseInt(version, 10);
					// getBrowserEngineVersion._nResult = Number.parseInt(version, 10);
					break;
				}
			}
		}
		if (!получитьВерсиюДвижкаБраузера._чРезультат) {
		// if (!getBrowserEngineVersion._nResult) {
			получитьВерсиюДвижкаБраузера._чРезультат = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)[1]);
			// getBrowserEngineVersion._nResult = Number(/Chrome\/(\d+)/.exec(navigator.userAgent)[1]);
		}
	}
	return получитьВерсиюДвижкаБраузера._чРезультат;
	// return getBrowserEngineVersion._nResult;
}

function этоМобильноеУстройство() {
// function isMobileDevice() {
	if (!этоМобильноеУстройство.hasOwnProperty('_лРезультат')) {
	// if (!isMobileDevice.hasOwnProperty('_bResult')) {
		этоМобильноеУстройство._лРезультат = navigator.userAgentData ? navigator.userAgentData.mobile : navigator.userAgent.includes('Android');
		// isMobileDevice._bResult = navigator.userAgentData ? navigator.userAgentData.mobile : navigator.userAgent.includes('Android');
	}
	return этоМобильноеУстройство._лРезультат;
	// return isMobileDevice._bResult;
}

function Узел(пЭлемент) {
// function Node(pElement) {
	const элЭлемент = typeof пЭлемент == 'string' ? document.getElementById(пЭлемент) : пЭлемент;
	// const elElement = typeof pElement == 'string' ? document.getElementById(pElement) : pElement;
	Проверить(элЭлемент.nodeType === 1);
	// Check(elElement.nodeType === 1);
	return элЭлемент;
	// return elElement;
}

function создатьТелоЗапросаGql(сЗапрос, оПеременные) {
// function createGqlRequestBody(sQuery, oVariables) {
	Проверить(ЭтоНепустаяСтрока(сЗапрос) && ЭтоОбъект(оПеременные));
	// Check(IsNonEmptyString(sQuery) && IsObject(oVariables));
	return `{"query":${JSON.stringify(сЗапрос)},"variables":${JSON.stringify(оПеременные)}}`;
	// return `{"query":${JSON.stringify(sQuery)},"variables":${JSON.stringify(oVariables)}}`;
}

function объединитьЗапросыGql(мсТелаЗапросов) {
// function combineGqlRequests(msRequestBodies) {
	Проверить(мсТелаЗапросов[0][0] === '{');
	// Check(msRequestBodies[0][0] === '{');
	return `[${мсТелаЗапросов.join(',')}]`;
	// return `[${msRequestBodies.join(',')}]`;
}

function ПолучитьАдресНашегоПроигрывателя(сКодКанала) {
// function GetOurPlayerAddress(sChannelCode) {
	const сПараметры = '?channel=' + encodeURIComponent(сКодКанала);
	// const sParameters = '?channel=' + encodeURIComponent(sChannelCode);
	return chrome.runtime.getURL('player.html') + сПараметры;
	// return chrome.runtime.getURL('player.html') + sParameters;
}

const м_Журнал = (() => {
// const m_Log = (() => {
	const МАКС_ДЛИНА_ЗАПИСИ = 1500;
	// const MAX_RECORD_LENGTH = 1500;
	let _мсЖурнал = null;
	// let _msLog = null;
	let _чПоследняяЗапись = -1;
	// let _nLastRecord = -1;
	function Добавить(сВажность, сЗапись) {
	// function Add(sImportance, sRecord) {
		if (_мсЖурнал) {
		// if (_msLog) {
			Проверить(typeof сВажность == 'string' && typeof сЗапись == 'string');
			// Check(typeof sImportance == 'string' && typeof sRecord == 'string');
			сЗапись = ОграничитьДлинуСтроки(`${сВажность} ${(performance.now() / 1e3).toFixed(3)} ${сЗапись}`, МАКС_ДЛИНА_ЗАПИСИ);
			// sRecord = LimitStringLength(`${sImportance} ${(performance.now() / 1e3).toFixed(3)} ${sRecord}`, MAX_RECORD_LENGTH);
			if (++_чПоследняяЗапись === _мсЖурнал.length) {
			// if (++_nLastRecord === _msLog.length) {
				_чПоследняяЗапись = 0;
				// _nLastRecord = 0;
			}
			_мсЖурнал[_чПоследняяЗапись] = сЗапись;
			// _msLog[_nLastRecord] = sRecord;
		}
	}
	function ПолучитьДанныеДляОтчета() {
	// function GetDataForReport() {
		if (!_мсЖурнал) {
		// if (!_msLog) {
			return null;
		}
		const чСледующаяЗапись = _чПоследняяЗапись + 1;
		// const nNextRecord = _nLastRecord + 1;
		if (чСледующаяЗапись === _мсЖурнал.length) {
		// if (nNextRecord === _msLog.length) {
			return _мсЖурнал;
			// return _msLog;
		}
		if (_мсЖурнал[чСледующаяЗапись] === void 0) {
		// if (_msLog[nNextRecord] === void 0) {
			return _мсЖурнал.slice(0, чСледующаяЗапись);
			// return _msLog.slice(0, nNextRecord);
		}
		return _мсЖурнал.slice(чСледующаяЗапись).concat(_мсЖурнал.slice(0, чСледующаяЗапись));
		// return _msLog.slice(nNextRecord).concat(_msLog.slice(0, nNextRecord));
	}
	function Вот(сЗапись) {
	// function Here(sRecord) {
		Проверить(arguments.length === 1);
		// Check(arguments.length === 1);
		Добавить(' ', сЗапись);
		// Add(' ', sRecord);
	}
	function Окак(сЗапись) {
	// function Wow(sRecord) {
		Проверить(arguments.length === 1);
		// Check(arguments.length === 1);
		Добавить('~', сЗапись);
		// Add('~', sRecord);
	}
	function Ой(сЗапись) {
	// function Oops(sRecord) {
		Проверить(arguments.length === 1);
		// Check(arguments.length === 1);
		Добавить('@', сЗапись);
		// Add('@', sRecord);
	}
	function O(пОбъект) {
	// function O(pObject) {
		switch (Тип(пОбъект)) {
		// switch (Type(pObject)) {
		  case 'object':
			return JSON.stringify(пОбъект);
			// return JSON.stringify(pObject);

		  case 'function':
			return `[function ${пОбъект.name}]`;
			// return `[function ${pObject.name}]`;

		  case 'symbol':
			return '[symbol]';

		  default:
			return String(пОбъект);
			// return String(pObject);
		}
	}
	function F(чТочность) {
	// function F(nPrecision) {
		return чЗначение => typeof чЗначение == 'number' ? чЗначение.toFixed(чТочность) : 'NaN';
		// return nValue => typeof nValue == 'number' ? nValue.toFixed(nPrecision) : 'NaN';
	}
	if (!ЭТО_CONTENT_SCRIPT) {
	// if (!THIS_IS_CONTENT_SCRIPT) {
		_мсЖурнал = new Array(1500);
		// _msLog = new Array(1500);
		Вот(`[Журнал] Журнал запущен ${performance.now().toFixed()}мс`);
		// Here(`[Log] Log started ${performance.now().toFixed()}ms`);
	}
	return {
		Вот,
		// Here,
		Окак,
		// Wow,
		Ой,
		// Oops,
		O,
		F0: F(0),
		F1: F(1),
		F2: F(2),
		F3: F(3),
		ПолучитьДанныеДляОтчета
		// GetDataForReport
	};
})();

const м_i18n = (() => {
// const m_i18n = (() => {
	const НАЗВАНИЯ_ЯЗЫКОВ = {
	// const LANGUAGE_NAMES = {
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
	const _амФорматироватьЧисло = new Map();
	// const _amFormatNumber = new Map();
	let _фФорматироватьДату = null;
	// let _fFormatDate = null;
	function GetMessage(sMessageName, sSubstitution) {
		Проверить(ЭтоНепустаяСтрока(sMessageName));
		// Check(IsNonEmptyString(sMessageName));
		Проверить(sSubstitution === void 0 || typeof sSubstitution == 'string');
		// Check(sSubstitution === void 0 || typeof sSubstitution == 'string');
		const sMessageText = chrome.i18n.getMessage(sMessageName, sSubstitution);
		if (!sMessageText) {
			throw new Error(`Не найден текст ${sMessageName}`);
			// throw new Error(`Text not found ${sMessageName}`);
		}
		return sMessageText;
	}
	function FastInsertAdjacentHtmlMessage(elInsertTo, sPosition, sMessageName) {
		
		//! HTML content is taken from the file messages.json. See GetMessage().
		elInsertTo.insertAdjacentHTML(sPosition, GetMessage(sMessageName));
	}
	function InsertAdjacentHtmlMessage(vInsertTo, sPosition, sMessageName) {
		const elInsertTo = Узел(vInsertTo);
		// const elInsertTo = Node(vInsertTo);
		if (sPosition === 'content') {
			sPosition = 'beforeend';
			elInsertTo.textContent = '';
		}
		FastInsertAdjacentHtmlMessage(elInsertTo, sPosition, sMessageName);
		return elInsertTo;
	}
	function TranslateDocument(оДокумент) {
	// function TranslateDocument(oDocument) {
		м_Журнал.Вот('[i18n] Перевод документа');
		// m_Log.Here('[i18n] Translating document');
		for (let elTranslate, celTranslate = оДокумент.querySelectorAll('*[data-i18n]'), i = 0; elTranslate = celTranslate[i]; ++i) {
		// for (let elTranslate, celTranslate = oDocument.querySelectorAll('*[data-i18n]'), i = 0; elTranslate = celTranslate[i]; ++i) {
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
	function ФорматироватьЧисло(пЧисло, кДробныхРазрядов) {
	// function FormatNumber(pNumber, nDecimalPlaces) {
		Проверить(кДробныхРазрядов === void 0 || typeof кДробныхРазрядов == 'number' && кДробныхРазрядов >= 0);
		// Check(nDecimalPlaces === void 0 || typeof nDecimalPlaces == 'number' && nDecimalPlaces >= 0);
		let фФорматировать = _амФорматироватьЧисло.get(кДробныхРазрядов);
		// let fFormat = _amFormatNumber.get(nDecimalPlaces);
		if (!фФорматировать) {
		// if (!fFormat) {
			фФорматировать = new Intl.NumberFormat([], кДробныхРазрядов === void 0 ? void 0 : {
			// fFormat = new Intl.NumberFormat([], nDecimalPlaces === void 0 ? void 0 : {
				minimumFractionDigits: кДробныхРазрядов,
				// minimumFractionDigits: nDecimalPlaces,
				maximumFractionDigits: кДробныхРазрядов
				// maximumFractionDigits: nDecimalPlaces
			}).format;
			_амФорматироватьЧисло.set(кДробныхРазрядов, фФорматировать);
			// _amFormatNumber.set(nDecimalPlaces, fFormat);
		}
		return фФорматировать(пЧисло);
		// return fFormat(pNumber);
	}
	function ФорматироватьДату(пДата) {
	// function FormatDate(pDate) {
		Проверить(Number.isFinite(пДата) || Number.isFinite(пДата.getTime()));
		// Check(Number.isFinite(pDate) || Number.isFinite(pDate.getTime()));
		if (!_фФорматироватьДату) {
		// if (!_fFormatDate) {
			_фФорматироватьДату = new Intl.DateTimeFormat([], {
			// _fFormatDate = new Intl.DateTimeFormat([], {
				timeZone: 'UTC'
			}).format;
		}
		return _фФорматироватьДату(пДата);
		// return _fFormatDate(pDate);
	}
	function ПеревестиСекундыВСтроку(кСекунды, лНужныСекунды) {
	// function SecondsToString(nSeconds, bNeedSeconds) {
		let ч = Math.floor(кСекунды / 60 % 60);
		// let h = Math.floor(nSeconds / 60 % 60);
		let с = Math.floor(кСекунды / 60 / 60) + (ч < 10 ? ' : 0' : ' : ') + ч;
		// let s = Math.floor(nSeconds / 60 / 60) + (h < 10 ? ' : 0' : ' : ') + h;
		if (лНужныСекунды) {
		// if (bNeedSeconds) {
			ч = Math.floor(кСекунды % 60);
			// h = Math.floor(nSeconds % 60);
			с += (ч < 10 ? ' : 0' : ' : ') + ч;
			// s += (h < 10 ? ' : 0' : ' : ') + h;
		}
		return с;
		// return s;
	}
	function ПолучитьНазваниеЯзыка(сКодЯзыка) {
	// function GetLanguageName(sLanguageCode) {
		const сНазваниеЯзыка = НАЗВАНИЯ_ЯЗЫКОВ[сКодЯзыка.toUpperCase()];
		// const sLanguageName = LANGUAGE_NAMES[sLanguageCode.toUpperCase()];
		if (!сНазваниеЯзыка) {
		// if (!sLanguageName) {
			throw new Error(`Неизвестный код языка: ${сКодЯзыка}`);
			// throw new Error(`Unknown language code: ${sLanguageCode}`);
		}
		return сНазваниеЯзыка;
		// return sLanguageName;
	}
	return {
		GetMessage,
		InsertAdjacentHtmlMessage,
		TranslateDocument,
		ФорматироватьЧисло,
		// FormatNumber,
		ФорматироватьДату,
		// FormatDate,
		ПеревестиСекундыВСтроку,
		// SecondsToString,
		ПолучитьНазваниеЯзыка
		// GetLanguageName
	};
})();

const м_Настройки = (() => {
// const m_Settings = (() => {
	const ВЕРСИЯ_НАСТРОЕК = 2;
	// const SETTINGS_VERSION = 2;
	const _амПредустановкиБуферизации = new Map([ [ 'J0126', {
	// const _amBufferingPresets = new Map([ [ 'J0126', {
		кОдновременныхЗагрузок: 1,
		// nConcurrentDownloads: 1,
		чНачалоВоспроизведения: 3,
		// nPlaybackStart: 3,
		чРазмерБуфера: 5,
		// nBufferSize: 5,
		чРастягиваниеБуфера: 15
		// nBufferStretch: 15
	} ], [ 'J0127', {
		кОдновременныхЗагрузок: 2,
		// nConcurrentDownloads: 2,
		чНачалоВоспроизведения: 3,
		// nPlaybackStart: 3,
		чРазмерБуфера: 8.5,
		// nBufferSize: 8.5,
		чРастягиваниеБуфера: 20
		// nBufferStretch: 20
	} ], [ 'J0128', {
		кОдновременныхЗагрузок: 2,
		// nConcurrentDownloads: 2,
		чНачалоВоспроизведения: 17,
		// nPlaybackStart: 17,
		чРазмерБуфера: 9.5,
		// nBufferSize: 9.5,
		чРастягиваниеБуфера: 30
		// nBufferStretch: 30
	} ] ]);
	const _амПредустановкиОформления = new Map([ [ 'J0122', {
	// const _amAppearancePresets = new Map([ [ 'J0122', {
		сЦветФона: '#282828',
		// sBackgroundColor: '#282828',
		сЦветГрадиента: '#d4d4d4',
		// sGradientColor: '#d4d4d4',
		сЦветКнопок: '#d3be96',
		// sButtonColor: '#d3be96',
		сЦветЗаголовка: '#cdbdec',
		// sHeaderColor: '#cdbdec',
		сЦветВыделения: '#ffd862',
		// sHighlightColor: '#ffd862',
		чПрозрачность: 25
		// nOpacity: 25
	} ], [ 'J0121', {
		сЦветФона: '#405b77',
		// sBackgroundColor: '#405b77',
		сЦветГрадиента: '#aaccf2',
		// sGradientColor: '#aaccf2',
		сЦветКнопок: '#ffffff',
		// sButtonColor: '#ffffff',
		сЦветЗаголовка: '#c2e4ff',
		// sHeaderColor: '#c2e4ff',
		сЦветВыделения: '#fef17c',
		// sHighlightColor: '#fef17c',
		чПрозрачность: 30
		// nOpacity: 30
	} ], [ 'J0138', {
		сЦветФона: '#4b4b4b',
		// sBackgroundColor: '#4b4b4b',
		сЦветГрадиента: '#aaaaaa',
		// sGradientColor: '#aaaaaa',
		сЦветКнопок: '#bad4f8',
		// sButtonColor: '#bad4f8',
		сЦветЗаголовка: '#e2ebb4',
		// sHeaderColor: '#e2ebb4',
		сЦветВыделения: '#75a9f0',
		// sHighlightColor: '#75a9f0',
		чПрозрачность: 5
		// nOpacity: 5
	} ], [ 'J0125', {
		сЦветФона: '#161616',
		// sBackgroundColor: '#161616',
		сЦветГрадиента: '#a0a0a0',
		// sGradientColor: '#a0a0a0',
		сЦветКнопок: '#f0f0f0',
		// sButtonColor: '#f0f0f0',
		сЦветЗаголовка: '#baccda',
		// sHeaderColor: '#baccda',
		сЦветВыделения: '#6cb6ff',
		// sHighlightColor: '#6cb6ff',
		чПрозрачность: 20
		// nOpacity: 20
	} ] ]);
	const _моМетаданныеПредустановок = [ {
	// const _moPresetMetadata = [ {
		амДанные: _амПредустановкиБуферизации,
		// amData: _amBufferingPresets,
		сНастраиваемая: 'J0129',
		// sCustomizable: 'J0129',
		сВыбрана: 'сПредустановкаВыбрана_буферизация',
		// sSelected: 'sPresetSelected_buffering',
		сЗаполнена: 'лПредустановкаЗаполнена_буферизация',
		// sFilled: 'bPresetFilled_buffering',
		сСписок: 'предустановка-буферизация',
		// sList: 'preset-buffering',
		сСобытие: 'настройки-измениласьпредустановка-буферизация'
		// sEvent: 'settings-presetChanged-buffering'
	}, {
		амДанные: _амПредустановкиОформления,
		// amData: _amAppearancePresets,
		сНастраиваемая: 'J0123',
		// sCustomizable: 'J0123',
		сВыбрана: 'сПредустановкаВыбрана_оформление',
		// sSelected: 'sPresetSelected_appearance',
		сЗаполнена: 'лПредустановкаЗаполнена_оформление',
		// sFilled: 'bPresetFilled_appearance',
		сСписок: 'предустановка-оформление',
		// sList: 'preset-appearance',
		сСобытие: 'настройки-измениласьпредустановка-оформление'
		// sEvent: 'settings-presetChanged-appearance'
	} ];
	const _мноПостоянныеНастройки = new Set([ 'чВерсияНастроек', 'чСлучайноеЧисло', 'сПредыдущаяВерсия', 'чПоследняяПроверкаОбновленияРасширения', 'лАвтоперенаправлениеЗамечено' ]);
	// const _mnoPermanentSettings = new Set([ 'nSettingsVersion', 'nRandomNumber', 'sPreviousVersion', 'nLastExtensionUpdateCheck', 'bAutoredirectNoticed' ]);
	const _мноНеСветить = new Set();
	// const _mnoDoNotShow = new Set();
	class Настройка {
	// class Setting {
		constructor(пНачальное, мпПеречисление, чМинимальное, чМаксимальное, сАвтонастройка) {
		// constructor(pInitial, mpEnumeration, nMinimum, nMaximum, sAutoTune) {
			this.пТекущее = void 0;
			// this.pCurrent = void 0;
			this.пНачальное = пНачальное;
			// this.pInitial = pInitial;
			this.мпПеречисление = мпПеречисление;
			// this.mpEnumeration = mpEnumeration;
			this.чМинимальное = чМинимальное;
			// this.nMinimum = nMinimum;
			this.чМаксимальное = чМаксимальное;
			// this.nMaximum = nMaximum;
			this.сАвтонастройка = сАвтонастройка;
			// this.sAutoTune = sAutoTune;
		}
		static Создать(пНачальное) {
		// static Create(pInitial) {
			return new this(пНачальное, null, МИН_ЗНАЧЕНИЕ_НАСТРОЙКИ, МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ, '');
			// return new this(pInitial, null, MIN_SETTING_VALUE, MAX_SETTING_VALUE, '');
		}
		static СоздатьПеречисление(пНачальное, мпПеречисление) {
		// static CreateEnumeration(pInitial, mpEnumeration) {
			return new this(пНачальное, мпПеречисление, МИН_ЗНАЧЕНИЕ_НАСТРОЙКИ, МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ, '');
			// return new this(pInitial, mpEnumeration, MIN_SETTING_VALUE, MAX_SETTING_VALUE, '');
		}
		static СоздатьДиапазон(пНачальное, чМинимальное, чМаксимальное, сАвтонастройка = '') {
		// static CreateRange(pInitial, nMinimum, nMaximum, sAutoTune = '') {
			return new this(пНачальное, null, чМинимальное, чМаксимальное, сАвтонастройка);
			// return new this(pInitial, null, nMinimum, nMaximum, sAutoTune);
		}
		static ПроверитьЗначение(пЗначение) {
		// static CheckValue(pValue) {
			Проверить(пЗначение == пЗначение && пЗначение !== Infinity && пЗначение !== -Infinity && пЗначение !== void 0 && typeof пЗначение != 'function' && typeof пЗначение != 'symbol' && typeof пЗначение != 'object');
			// Check(pValue == pValue && pValue !== Infinity && pValue !== -Infinity && pValue !== void 0 && typeof pValue != 'function' && typeof pValue != 'symbol' && typeof pValue != 'object');
		}
		ИсправитьЗначение(пЗначение) {
		// CorrectValue(pValue) {
			Настройка.ПроверитьЗначение(пЗначение);
			// Setting.CheckValue(pValue);
			Проверить(typeof пЗначение == typeof this.пНачальное);
			// Check(typeof pValue == typeof this.pInitial);
			if (this.мпПеречисление) {
			// if (this.mpEnumeration) {
				if (!this.мпПеречисление.includes(пЗначение)) {
				// if (!this.mpEnumeration.includes(pValue)) {
					пЗначение = this.пНачальное;
					// pValue = this.pInitial;
				}
			} else if (typeof пЗначение == 'number') {
			// } else if (typeof pValue == 'number') {
				if (пЗначение === АВТОНАСТРОЙКА) {
				// if (pValue === AUTO_TUNE) {
					if (this.сАвтонастройка === '') {
					// if (this.sAutoTune === '') {
						пЗначение = this.пНачальное;
						// pValue = this.pInitial;
					}
				} else if (пЗначение < this.чМинимальное) {
				// } else if (pValue < this.nMinimum) {
					пЗначение = this.чМинимальное;
					// pValue = this.nMinimum;
				} else if (пЗначение > this.чМаксимальное) {
				// } else if (pValue > this.nMaximum) {
					пЗначение = this.чМаксимальное;
					// pValue = this.nMaximum;
				}
			}
			return пЗначение;
			// return pValue;
		}
	}
	const _оНастройки = {
	// const _oSettings = {
		чВерсияНастроек: Настройка.Создать(ВЕРСИЯ_НАСТРОЕК),
		// nSettingsVersion: Setting.Create(SETTINGS_VERSION),
		чСлучайноеЧисло: Настройка.Создать(Math.random()),
		// nRandomNumber: Setting.Create(Math.random()),
		сПредыдущаяВерсия: Настройка.Создать('2000.1.1'),
		// sPreviousVersion: Setting.Create('2000.1.1'),
		чПоследняяПроверкаОбновленияРасширения: Настройка.Создать(0),
		// nLastExtensionUpdateCheck: Setting.Create(0),
		чГромкость2: Настройка.СоздатьДиапазон(МАКСИМАЛЬНАЯ_ГРОМКОСТЬ / 2, МИНИМАЛЬНАЯ_ГРОМКОСТЬ, МАКСИМАЛЬНАЯ_ГРОМКОСТЬ),
		// nVolume2: Setting.CreateRange(MAX_VOLUME / 2, MIN_VOLUME, MAX_VOLUME),
		лПриглушить: Настройка.Создать(false),
		// bMute: Setting.Create(false),
		сИдАудиоустройства: Настройка.Создать(''),
		// sAudioDeviceId: Setting.Create(''),
		сНазваниеВарианта: Настройка.Создать('CoolCmd'),
		// sVariantName: Setting.Create('CoolCmd'),
		чБитрейтВарианта: Настройка.Создать(МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ),
		// nVariantBitrate: Setting.Create(MAX_SETTING_VALUE),
		чДлительностьПовтора2: Настройка.СоздатьДиапазон(60, МИН_ДЛИТЕЛЬНОСТЬ_ПОВТОРА, МАКС_ДЛИТЕЛЬНОСТЬ_ПОВТОРА, 'J0124'),
		// nRepeatDuration2: Setting.CreateRange(60, MIN_REPEAT_DURATION, MAX_REPEAT_DURATION, 'J0124'),
		лМасштабироватьИзображение: Настройка.Создать(true),
		// bScaleImage: Setting.Create(true),
		чСостояниеЧата: Настройка.СоздатьПеречисление(ЧАТ_ВЫГРУЖЕН, [ ЧАТ_ВЫГРУЖЕН, ЧАТ_СКРЫТ, ЧАТ_ПАНЕЛЬ ]),
		// nChatState: Setting.CreateEnum(CHAT_UNLOADED, [ CHAT_UNLOADED, CHAT_HIDDEN, CHAT_PANEL ]),
		чСостояниеЗакрытогоЧата: Настройка.СоздатьПеречисление(ЧАТ_ВЫГРУЖЕН, [ ЧАТ_ВЫГРУЖЕН, ЧАТ_СКРЫТ ]),
		// nClosedChatState: Setting.CreateEnum(CHAT_UNLOADED, [ CHAT_UNLOADED, CHAT_HIDDEN ]),
		лАвтоПоложениеЧата: Настройка.Создать(этоМобильноеУстройство()),
		// bAutoChatPosition: Setting.Create(isMobileDevice()),
		чГоризонтальноеПоложениеЧата: Настройка.СоздатьПеречисление(ПРАВАЯ_СТОРОНА, [ ПРАВАЯ_СТОРОНА, ЛЕВАЯ_СТОРОНА ]),
		// nHorizontalChatPosition: Setting.CreateEnum(RIGHT_SIDE, [ RIGHT_SIDE, LEFT_SIDE ]),
		чВертикальноеПоложениеЧата: Настройка.СоздатьПеречисление(НИЖНЯЯ_СТОРОНА, [ ВЕРХНЯЯ_СТОРОНА, НИЖНЯЯ_СТОРОНА ]),
		// nVerticalChatPosition: Setting.CreateEnum(BOTTOM_SIDE, [ TOP_SIDE, BOTTOM_SIDE ]),
		чПоложениеПанелиЧата: Настройка.СоздатьПеречисление(ПРАВАЯ_СТОРОНА, [ ВЕРХНЯЯ_СТОРОНА, ПРАВАЯ_СТОРОНА, НИЖНЯЯ_СТОРОНА, ЛЕВАЯ_СТОРОНА ]),
		// nChatPanelPosition: Setting.CreateEnum(RIGHT_SIDE, [ TOP_SIDE, RIGHT_SIDE, BOTTOM_SIDE, LEFT_SIDE ]),
		чШиринаПанелиЧата: Настройка.СоздатьДиапазон(340, 100, МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ),
		// nChatPanelWidth: Setting.CreateRange(340, 100, MAX_SETTING_VALUE),
		чВысотаПанелиЧата: Настройка.СоздатьДиапазон(250, 100, МАКС_ЗНАЧЕНИЕ_НАСТРОЙКИ),
		// nChatPanelHeight: Setting.CreateRange(250, 100, MAX_SETTING_VALUE),
		лПолноценныйЧат: Настройка.Создать(true),
		// bFullFeaturedChat: Setting.Create(true),
		лЗатемнитьЧат: Настройка.Создать(false),
		// bDimChat: Setting.Create(false),
		чРазмерИнтерфейса: Настройка.СоздатьДиапазон(этоМобильноеУстройство() ? 115 : 100, 50, 200),
		// nInterfaceSize: Setting.CreateRange(isMobileDevice() ? 115 : 100, 50, 200),
		чИнтервалАвтоскрытия: Настройка.СоздатьДиапазон(4, .5, 60),
		// nAutoHideInterval: Setting.CreateRange(4, .5, 60),
		лАнимацияИнтерфейса: Настройка.Создать(!этоМобильноеУстройство()),
		// bInterfaceAnimation: Setting.Create(!isMobileDevice()),
		лМенятьГромкостьКолесом: Настройка.Создать(true),
		// bChangeVolumeWithWheel: Setting.Create(true),
		чШагИзмененияГромкостиКолесом: Настройка.СоздатьДиапазон(5, -10, 10),
		// nVolumeChangeStepWithWheel: Setting.CreateRange(5, -10, 10),
		лПоказатьСтатистику: Настройка.Создать(false),
		// bShowStatistics: Setting.Create(false),
		сПредустановкаВыбрана_буферизация: Настройка.Создать('J0127'),
		// sPresetSelected_buffering: Setting.Create('J0127'),
		лПредустановкаЗаполнена_буферизация: Настройка.Создать(false),
		// bPresetFilled_buffering: Setting.Create(false),
		кОдновременныхЗагрузок: Настройка.СоздатьДиапазон(0, 1, 3),
		// nConcurrentDownloads: Setting.CreateRange(0, 1, 3),
		чНачалоВоспроизведения: Настройка.СоздатьДиапазон(0, МИН_РАЗМЕР_БУФЕРА, МАКС_РАЗМЕР_БУФЕРА),
		// nPlaybackStart: Setting.CreateRange(0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE),
		чРазмерБуфера: Настройка.СоздатьДиапазон(0, МИН_РАЗМЕР_БУФЕРА, МАКС_РАЗМЕР_БУФЕРА),
		// nBufferSize: Setting.CreateRange(0, MIN_BUFFER_SIZE, MAX_BUFFER_SIZE),
		чРастягиваниеБуфера: Настройка.СоздатьДиапазон(0, МИН_РАСТЯГИВАНИЕ_БУФЕРА, МАКС_РАСТЯГИВАНИЕ_БУФЕРА),
		// nBufferStretch: Setting.CreateRange(0, MIN_BUFFER_STRETCH, MAX_BUFFER_STRETCH),
		сПредустановкаВыбрана_оформление: Настройка.Создать('J0122'),
		// sPresetSelected_appearance: Setting.Create('J0122'),
		лПредустановкаЗаполнена_оформление: Настройка.Создать(false),
		// bPresetFilled_appearance: Setting.Create(false),
		сЦветФона: Настройка.Создать(''),
		// sBackgroundColor: Setting.Create(''),
		сЦветГрадиента: Настройка.Создать('#ffffff'),
		// sGradientColor: Setting.Create('#ffffff'),
		сЦветКнопок: Настройка.Создать(''),
		// sButtonColor: Setting.Create(''),
		сЦветЗаголовка: Настройка.Создать(''),
		// sHeaderColor: Setting.Create(''),
		сЦветВыделения: Настройка.Создать(''),
		// sHighlightColor: Setting.Create(''),
		чПрозрачность: Настройка.СоздатьДиапазон(0, 0, 80),
		// nOpacity: Setting.CreateRange(0, 0, 80),
		лАвтоперенаправлениеРазрешено: Настройка.Создать(true),
		// bAutoRedirectAllowed: Setting.Create(true),
		лАвтоперенаправлениеЗамечено: Настройка.Создать(false)
		// bAutoRedirectNoticed: Setting.Create(false)
	};
	const ОТКЛАДЫВАТЬ_СОХРАНЕНИЕ_НА = ЭТО_CONTENT_SCRIPT ? 50 : 500;
	// const DELAY_SAVE_FOR = THIS_IS_CONTENT_SCRIPT ? 50 : 500;
	let _чТаймерОтложенногоСохранения = 0;
	// let _nDelayedSaveTimer = 0;
	let _оОтложенноеСохранение = null;
	// let _oDelayedSave = null;
	let _лОтложенноеУдаление = false;
	// let _bDelayedDelete = false;
	function Восстановить() {
	// function Restore() {
		м_Журнал.Вот('[Настройки] Восстанавливаю настройки');
		// m_Log.Here('[Settings] Restoring settings');
		return new Promise((фВыполнить, фОтказаться) => {
		// return new Promise((fResolve, fReject) => {
			chrome.storage.local.get(null, оВосстановленныеНастройки => {
			// chrome.storage.local.get(null, oRestoredSettings => {
				if (г_лРаботаЗавершена) {
				// if (g_bWorkFinished) {
					return;
				}
				try {
					if (chrome.runtime.lastError) {
						console.error('storage.local.get', chrome.runtime.lastError.message);
						м_Отладка.ЗавершитьРаботуИПоказатьСообщение('J0221');
						// m_Debug.FinishWorkAndShowMessage('J0221');
					}
					м_Журнал.Вот(`[Настройки] Настройки прочитаны из хранилища: ${м_Журнал.O(оВосстановленныеНастройки)}`);
					// m_Log.Here(`[Settings] Settings read from storage: ${m_Log.O(oRestoredSettings)}`);
					ЗавершитьВосстановление(оВосстановленныеНастройки);
					// FinishRestoring(oRestoredSettings);
					фВыполнить();
					// fResolve();
				} catch (пИсключение) {
				// } catch (pException) {
					фОтказаться(пИсключение);
					// fReject(pException);
				}
			});
		});
	}
	function ЗавершитьВосстановление(оВосстановленныеНастройки) {
	// function FinishRestoring(oRestoredSettings) {
		Проверить(ЭтоОбъект(оВосстановленныеНастройки));
		// Check(IsObject(oRestoredSettings));
		Проверить(!_оНастройки.чВерсияНастроек.пТекущее);
		// Check(!_oSettings.nSettingsVersion.pCurrent);
		const оСохранить = {};
		// const oSave = {};
		const лОстальноеУдалить = ПроверитьВерсиюНастроек(оВосстановленныеНастройки, оСохранить);
		// const bDeleteRest = CheckSettingsVersion(oRestoredSettings, oSave);
		for (let сИмя of Object.keys(_оНастройки)) {
		// for (let sName of Object.keys(_oSettings)) {
			if (оВосстановленныеНастройки.hasOwnProperty(сИмя)) {
			// if (oRestoredSettings.hasOwnProperty(sName)) {
				const пЗначение = _оНастройки[сИмя].ИсправитьЗначение(оВосстановленныеНастройки[сИмя]);
				// const pValue = _oSettings[sName].CorrectValue(oRestoredSettings[sName]);
				if (пЗначение !== оВосстановленныеНастройки[сИмя]) {
				// if (pValue !== oRestoredSettings[sName]) {
					оСохранить[сИмя] = пЗначение;
					// oSave[sName] = pValue;
				}
				_оНастройки[сИмя].пТекущее = пЗначение;
				// _oSettings[sName].pCurrent = pValue;
			} else {
				if (_мноПостоянныеНастройки.has(сИмя)) {
				// if (_mnoPermanentSettings.has(sName)) {
					оСохранить[сИмя] = _оНастройки[сИмя].пНачальное;
					// oSave[sName] = _oSettings[sName].pInitial;
				}
				_оНастройки[сИмя].пТекущее = _оНастройки[сИмя].пНачальное;
				// _oSettings[sName].pCurrent = _oSettings[sName].pInitial;
			}
		}
		НачатьСохранение(оСохранить, лОстальноеУдалить);
		// StartSaving(oSave, bDeleteRest);
	}
	function ПроверитьВерсиюНастроек(оНастройки, оСохранить) {
	// function CheckSettingsVersion(oSettings, oSave) {
		if (!Number.isInteger(оНастройки.чВерсияНастроек) || оНастройки.чВерсияНастроек < 1 || оНастройки.чВерсияНастроек > ВЕРСИЯ_НАСТРОЕК) {
		// if (!Number.isInteger(oSettings.nSettingsVersion) || oSettings.nSettingsVersion < 1 || oSettings.nSettingsVersion > SETTINGS_VERSION) {
			for (let сИмя of Object.keys(оНастройки)) {
			// for (let sName of Object.keys(oSettings)) {
				delete оНастройки[сИмя];
				// delete oSettings[sName];
			}
			return true;
		}
		for (let оМетаданные of _моМетаданныеПредустановок) {
		// for (let oMetadata of _moPresetMetadata) {
			let сИмя = оНастройки[оМетаданные.сВыбрана];
			// let sName = oSettings[oMetadata.sSelected];
			if (сИмя !== void 0 && сИмя !== оМетаданные.сНастраиваемая) {
			// if (sName !== void 0 && sName !== oMetadata.sCustomizable) {
				for (let сИмяПредустановки of оМетаданные.амДанные.keys()) {
				// for (let sPresetName of oMetadata.amData.keys()) {
					if (сИмя === сИмяПредустановки) {
					// if (sName === sPresetName) {
						сИмя = void 0;
						// sName = void 0;
						break;
					}
				}
				if (сИмя !== void 0) {
				// if (sName !== void 0) {
					оСохранить[оМетаданные.сВыбрана] = оНастройки[оМетаданные.сВыбрана] = _оНастройки[оМетаданные.сВыбрана].пНачальное;
					// oSave[oMetadata.sSelected] = oSettings[oMetadata.sSelected] = _oSettings[oMetadata.sSelected].pInitial;
				}
			}
		}
		if (оНастройки.чСостояниеЗакрытогоЧата !== оНастройки.чСостояниеЧата && (оНастройки.чСостояниеЧата === ЧАТ_ВЫГРУЖЕН || оНастройки.чСостояниеЧата === ЧАТ_СКРЫТ)) {
		// if (oSettings.nClosedChatState !== oSettings.nChatState && (oSettings.nChatState === CHAT_UNLOADED || oSettings.nChatState === CHAT_HIDDEN)) {
			оСохранить.чСостояниеЗакрытогоЧата = оНастройки.чСостояниеЗакрытогоЧата = оНастройки.чСостояниеЧата;
			// oSave.nClosedChatState = oSettings.nClosedChatState = oSettings.nChatState;
		}
		if (оНастройки.чВерсияНастроек === ВЕРСИЯ_НАСТРОЕК) {
		// if (oSettings.nSettingsVersion === SETTINGS_VERSION) {
			return false;
		}
		оСохранить.чВерсияНастроек = оНастройки.чВерсияНастроек = ВЕРСИЯ_НАСТРОЕК;
		// oSave.nSettingsVersion = oSettings.nSettingsVersion = SETTINGS_VERSION;
		return false;
	}
	function НачатьСохранение(оСохранить, лОстальноеУдалить) {
	// function StartSaving(oSave, bDeleteRest) {
		Проверить(ЭтоОбъект(оСохранить));
		// Check(IsObject(oSave));
		if (Object.keys(оСохранить).length !== 0 || лОстальноеУдалить) {
		// if (Object.keys(oSave).length !== 0 || bDeleteRest) {
			if (_чТаймерОтложенногоСохранения === 0) {
			// if (_nDelayedSaveTimer === 0) {
				м_Журнал.Вот(`[Настройки] Откладываю сохранение настроек на ${ОТКЛАДЫВАТЬ_СОХРАНЕНИЕ_НА}мс`);
				// m_Log.Here(`[Settings] Delaying settings save for ${DELAY_SAVE_FOR}ms`);
				_оОтложенноеСохранение = оСохранить;
				// _oDelayedSave = oSave;
				_лОтложенноеУдаление = лОстальноеУдалить;
				// _bDelayedDelete = bDeleteRest;
				_чТаймерОтложенногоСохранения = setTimeout(ДобавитьОбработчикИсключений(ЗавершитьСохранение), ОТКЛАДЫВАТЬ_СОХРАНЕНИЕ_НА);
				// _nDelayedSaveTimer = setTimeout(AddExceptionHandler(FinishSaving), DELAY_SAVE_FOR);
			} else if (лОстальноеУдалить) {
			// } else if (bDeleteRest) {
				_оОтложенноеСохранение = оСохранить;
				// _oDelayedSave = oSave;
				_лОтложенноеУдаление = лОстальноеУдалить;
				// _bDelayedDelete = bDeleteRest;
			} else {
				Object.assign(_оОтложенноеСохранение, оСохранить);
				// Object.assign(_oDelayedSave, oSave);
			}
		}
	}
	function ЗавершитьСохранение() {
	// function FinishSaving() {
		м_Журнал.Вот('[Настройки] Завершаю отложенное сохранение');
		// m_Log.Here('[Settings] Finishing delayed save');
		Проверить(_чТаймерОтложенногоСохранения !== 0);
		// Check(_nDelayedSaveTimer !== 0);
		_чТаймерОтложенногоСохранения = 0;
		// _nDelayedSaveTimer = 0;
		Проверить(ЭтоОбъект(_оОтложенноеСохранение));
		// Check(IsObject(_oDelayedSave));
		Сохранить(_оОтложенноеСохранение, _лОтложенноеУдаление);
		// Save(_oDelayedSave, _bDelayedDelete);
		_оОтложенноеСохранение = null;
		// _oDelayedSave = null;
	}
	function Сохранить(оСохранить, лОстальноеУдалить) {
	// function Save(oSave, bDeleteRest) {
		if (лОстальноеУдалить) {
		// if (bDeleteRest) {
			chrome.storage.local.clear(ПроверитьРезультатСохранения);
			// chrome.storage.local.clear(CheckSaveResult);
			м_Журнал.Вот('[Настройки] Все настройки удалены из хранилища');
			// m_Log.Here('[Settings] All settings deleted from storage');
		}
		chrome.storage.local.set(оСохранить, ПроверитьРезультатСохранения);
		// chrome.storage.local.set(oSave, CheckSaveResult);
		м_Журнал.Вот(`[Настройки] Настройки записаны в хранилище: ${м_Журнал.O(оСохранить)}`);
		// m_Log.Here(`[Settings] Settings written to storage: ${m_Log.O(oSave)}`);
	}
	function ПроверитьРезультатСохранения() {
	// function CheckSaveResult() {
		if (chrome.runtime.lastError) {
			console.error('storage.local.set', chrome.runtime.lastError.message);
			м_Отладка.ЗавершитьРаботуИПоказатьСообщение('J0221');
			// m_Debug.FinishWorkAndShowMessage('J0221');
		}
	}
	function Сбросить() {
	// function Reset() {
		м_Журнал.Окак('[Настройки] Сбрасываю настройки');
		// m_Log.Wow('[Settings] Resetting settings');
		Проверить(_оНастройки.чВерсияНастроек.пТекущее);
		// Check(_oSettings.nSettingsVersion.pCurrent);
		const оСохранить = {};
		// const oSave = {};
		for (let сИмя of _мноПостоянныеНастройки) {
		// for (let sName of _mnoPermanentSettings) {
			оСохранить[сИмя] = _оНастройки[сИмя].пТекущее;
			// oSave[sName] = _oSettings[sName].pCurrent;
		}
		НачатьСохранение(оСохранить, true);
		// StartSaving(oSave, true);
		window.location.reload(true);
	}
	function Экспорт() {
	// function Export() {
		м_Журнал.Окак('[Настройки] Экспортирую настройки');
		// m_Log.Wow('[Settings] Exporting settings');
		Проверить(_оНастройки.чВерсияНастроек.пТекущее);
		// Check(_oSettings.nSettingsVersion.pCurrent);
		const оЭкспорт = {
		// const oExport = {
			чВерсияНастроек: ВЕРСИЯ_НАСТРОЕК
			// nSettingsVersion: SETTINGS_VERSION
		};
		for (let сИмя of Object.keys(_оНастройки)) {
		// for (let sName of Object.keys(_oSettings)) {
			if (!_мноПостоянныеНастройки.has(сИмя) && !_мноНеСветить.has(сИмя)) {
			// if (!_mnoPermanentSettings.has(sName) && !_mnoDoNotShow.has(sName)) {
				оЭкспорт[сИмя] = _оНастройки[сИмя].пТекущее;
				// oExport[sName] = _oSettings[sName].pCurrent;
			}
		}
		м_Журнал.Вот(`[Настройки] Отобраны настройки для экспорта: ${м_Журнал.O(оЭкспорт)}`);
		// m_Log.Here(`[Settings] Settings selected for export: ${m_Log.O(oExport)}`);
		ЗаписатьТекстВЛокальныйФайл(JSON.stringify(оЭкспорт), 'application/json', Текст('J0133'));
		// WriteTextToLocalFile(JSON.stringify(oExport), 'application/json', Text('J0133'));
	}
	function Импорт(оИзФайла) {
	// function Import(oFromFile) {
		м_Журнал.Окак(`[Настройки] Импортирую настройки из файла ${оИзФайла.name}`);
		// m_Log.Wow(`[Settings] Importing settings from file ${oFromFile.name}`);
		Проверить(_оНастройки.чВерсияНастроек.пТекущее);
		// Check(_oSettings.nSettingsVersion.pCurrent);
		if (оИзФайла.size === 0 || оИзФайла.size > 1e4) {
		// if (oFromFile.size === 0 || oFromFile.size > 1e4) {
			м_Журнал.Ой(`[Настройки] Размер файла: ${оИзФайла.size}`);
			// m_Log.Oops(`[Settings] File size: ${oFromFile.size}`);
			м_Уведомление.ПоказатьЖопу();
			// m_Notification.ShowAss();
			return;
		}
		const оЧиталка = new FileReader();
		// const oReader = new FileReader();
		оЧиталка.addEventListener('loadend', ДобавитьОбработчикИсключений(() => {
		// oReader.addEventListener('loadend', AddExceptionHandler(() => {
			if (!ЭтоНепустаяСтрока(оЧиталка.result)) {
			// if (!IsNonEmptyString(oReader.result)) {
				м_Журнал.Ой(`[Настройки] Результат чтения файла: ${оЧиталка.result}`);
				// m_Log.Oops(`[Settings] File read result: ${oReader.result}`);
				м_Уведомление.ПоказатьЖопу();
				// m_Notification.ShowAss();
				return;
			}
			м_Журнал.Вот(`[Настройки] Настройки прочитаны из файла: ${оЧиталка.result}`);
			// m_Log.Here(`[Settings] Settings read from file: ${oReader.result}`);
			let оСохранить;
			// let oSave;
			try {
				оСохранить = JSON.parse(оЧиталка.result);
				// oSave = JSON.parse(oReader.result);
				if (!ЭтоОбъект(оСохранить)) {
				// if (!IsObject(oSave)) {
					throw 1;
				}
				if (ПроверитьВерсиюНастроек(оСохранить, оСохранить)) {
				// if (CheckSettingsVersion(oSave, oSave)) {
					throw 2;
				}
				for (let сИмя of Object.keys(оСохранить)) {
				// for (let sName of Object.keys(oSave)) {
					if (!_оНастройки.hasOwnProperty(сИмя) || _мноНеСветить.has(сИмя)) {
					// if (!_oSettings.hasOwnProperty(sName) || _mnoDoNotShow.has(sName)) {
						delete оСохранить[сИмя];
						// delete oSave[sName];
					} else {
						оСохранить[сИмя] = _оНастройки[сИмя].ИсправитьЗначение(оСохранить[сИмя]);
						// oSave[sName] = _oSettings[sName].CorrectValue(oSave[sName]);
						if (оСохранить[сИмя] === _оНастройки[сИмя].пНачальное) {
						// if (oSave[sName] === _oSettings[sName].pInitial) {
							delete оСохранить[сИмя];
							// delete oSave[sName];
						}
					}
				}
			} catch (пИсключение) {
			// } catch (pException) {
				м_Журнал.Ой(`[Настройки] Поймано исключение во время разбора настроек: ${пИсключение}`);
				// m_Log.Oops(`[Settings] Exception caught while parsing settings: ${pException}`);
				м_Уведомление.ПоказатьЖопу();
				// m_Notification.ShowAss();
				return;
			}
			for (let сИмя of _мноПостоянныеНастройки) {
			// for (let sName of _mnoPermanentSettings) {
				оСохранить[сИмя] = _оНастройки[сИмя].пТекущее;
				// oSave[sName] = _oSettings[sName].pCurrent;
			}
			НачатьСохранение(оСохранить, true);
			// StartSaving(oSave, true);
			window.location.reload(true);
		}));
		оЧиталка.readAsText(оИзФайла);
		// oReader.readAsText(oFromFile);
	}
	function Получить2(сИмя) {
	// function Get2(sName) {
		Проверить(typeof сИмя == 'string');
		// Check(typeof sName == 'string');
		Проверить(_оНастройки.hasOwnProperty(сИмя));
		// Check(_oSettings.hasOwnProperty(sName));
		Проверить(_оНастройки.чВерсияНастроек.пТекущее);
		// Check(_oSettings.nSettingsVersion.pCurrent);
		for (let оМетаданные of _моМетаданныеПредустановок) {
		// for (let oMetadata of _moPresetMetadata) {
			const оПредустановка = оМетаданные.амДанные.get(_оНастройки[оМетаданные.сВыбрана].пТекущее);
			// const oPreset = oMetadata.amData.get(_oSettings[oMetadata.sSelected].pCurrent);
			if (оПредустановка) {
			// if (oPreset) {
				const пЗначение = оПредустановка[сИмя];
				// const pValue = oPreset[sName];
				if (пЗначение !== void 0) {
				// if (pValue !== void 0) {
					return пЗначение;
					// return pValue;
				}
			}
		}
		return _оНастройки[сИмя].пТекущее;
		// return _oSettings[sName].pCurrent;
	}
	function Получить(сИмя) {
	// function Get(sName) {
		if (сИмя === 'чМаксРазмерБуфера') {
		// if (sName === 'nMaxBufferSize') {
			return Math.max(Получить2('чНачалоВоспроизведения'), Получить2('чРазмерБуфера'));
			// return Math.max(Get2('nPlaybackStart'), Get2('nBufferSize'));
		}
		return Получить2(сИмя);
		// return Get2(sName);
	}
	function Изменить(сИмя, пЗначение, лНеСохранять = false) {
	// function Change(sName, pValue, bNoSave = false) {
		Проверить(typeof сИмя == 'string');
		// Check(typeof sName == 'string');
		Проверить(_оНастройки[сИмя].ИсправитьЗначение(пЗначение) === пЗначение);
		// Check(_oSettings[sName].CorrectValue(pValue) === pValue);
		const оСохранить = {};
		// const oSave = {};
		for (let оМетаданные of _моМетаданныеПредустановок) {
		// for (let oMetadata of _moPresetMetadata) {
			const оПредустановка = оМетаданные.амДанные.get(_оНастройки[оМетаданные.сВыбрана].пТекущее);
			// const oPreset = oMetadata.amData.get(_oSettings[oMetadata.sSelected].pCurrent);
			if (оПредустановка && оПредустановка.hasOwnProperty(сИмя)) {
			// if (oPreset && oPreset.hasOwnProperty(sName)) {
				if (пЗначение === оПредустановка[сИмя]) {
				// if (pValue === oPreset[sName]) {
					return;
				}
				Проверить(!лНеСохранять);
				// Check(!bNoSave);
				оСохранить[оМетаданные.сВыбрана] = _оНастройки[оМетаданные.сВыбрана].пТекущее = оМетаданные.сНастраиваемая;
				// oSave[oMetadata.sSelected] = _oSettings[oMetadata.sSelected].pCurrent = oMetadata.sCustomizable;
				оСохранить[оМетаданные.сЗаполнена] = _оНастройки[оМетаданные.сЗаполнена].пТекущее = true;
				// oSave[oMetadata.sFilled] = _oSettings[oMetadata.sFilled].pCurrent = true;
				for (let сИмяПредустановки of Object.keys(оПредустановка)) {
				// for (let sPresetName of Object.keys(oPreset)) {
					оСохранить[сИмяПредустановки] = _оНастройки[сИмяПредустановки].пТекущее = оПредустановка[сИмяПредустановки];
					// oSave[sPresetName] = _oSettings[sPresetName].pCurrent = oPreset[sPresetName];
				}
				ОбновитьСписокПредустановок(оМетаданные);
				// UpdatePresetList(oMetadata);
				break;
			}
		}
		if (_оНастройки[сИмя].пТекущее !== пЗначение) {
		// if (_oSettings[sName].pCurrent !== pValue) {
			оСохранить[сИмя] = _оНастройки[сИмя].пТекущее = пЗначение;
			// oSave[sName] = _oSettings[sName].pCurrent = pValue;
		}
		if (!лНеСохранять) {
		// if (!bNoSave) {
			НачатьСохранение(оСохранить, false);
			// StartSaving(oSave, false);
		}
	}
	function ОбновитьСписокПредустановок(оМетаданные) {
	// function UpdatePresetList(oMetadata) {
		const узСписок = Узел(оМетаданные.сСписок);
		// const nodeList = Node(oMetadata.sList);
		узСписок.length = 0;
		// nodeList.length = 0;
		const сВыбрать = _оНастройки[оМетаданные.сВыбрана].пТекущее;
		// const sSelect = _oSettings[oMetadata.sSelected].pCurrent;
		for (let сИмя of оМетаданные.амДанные.keys()) {
		// for (let sName of oMetadata.amData.keys()) {
			узСписок.add(new Option(Текст(сИмя), сИмя, сИмя === сВыбрать, сИмя === сВыбрать));
			// nodeList.add(new Option(Text(sName), sName, sName === sSelect, sName === sSelect));
		}
		if (_оНастройки[оМетаданные.сЗаполнена].пТекущее) {
		// if (_oSettings[oMetadata.sFilled].pCurrent) {
			узСписок.add(new Option(Текст(оМетаданные.сНастраиваемая), оМетаданные.сНастраиваемая, оМетаданные.сНастраиваемая === сВыбрать, оМетаданные.сНастраиваемая === сВыбрать));
			// nodeList.add(new Option(Text(oMetadata.sCustomizable), oMetadata.sCustomizable, oMetadata.sCustomizable === sSelect, oMetadata.sCustomizable === sSelect));
		}
		Проверить(узСписок.value);
		// Check(nodeList.value);
		return узСписок;
		// return nodeList;
	}
	const ОбработатьИзменениеПредустановки = ДобавитьОбработчикИсключений(оСобытие => {
	// const ProcessPresetChange = AddExceptionHandler(oEvent => {
		for (let оМетаданные of _моМетаданныеПредустановок) {
		// for (let oMetadata of _moPresetMetadata) {
			if (оМетаданные.сСписок === оСобытие.target.id) {
			// if (oMetadata.sList === oEvent.target.id) {
				Проверить(оСобытие.target.value);
				// Check(oEvent.target.value);
				Изменить(оМетаданные.сВыбрана, оСобытие.target.value);
				// Change(oMetadata.sSelected, oEvent.target.value);
				м_События.ПослатьСобытие(оМетаданные.сСобытие);
				// m_Events.SendEvent(oMetadata.sEvent);
				return;
			}
		}
		Проверить(false);
		// Check(false);
	});
	function НастроитьСпискиПредустановок() {
	// function ConfigurePresetLists() {
		for (let оМетаданные of _моМетаданныеПредустановок) {
		// for (let oMetadata of _moPresetMetadata) {
			ОбновитьСписокПредустановок(оМетаданные).addEventListener('change', ОбработатьИзменениеПредустановки);
			// UpdatePresetList(oMetadata).addEventListener('change', ProcessPresetChange);
		}
	}
	function ПолучитьПараметрыНастройки(сИмя) {
	// function GetSettingParameters(sName) {
		Проверить(typeof сИмя == 'string');
		// Check(typeof sName == 'string');
		Проверить(_оНастройки.hasOwnProperty(сИмя));
		// Check(_oSettings.hasOwnProperty(sName));
		return _оНастройки[сИмя];
		// return _oSettings[sName];
	}
	function ПолучитьДанныеДляОтчета() {
	// function GetDataForReport() {
		const оОтчет = {};
		// const oReport = {};
		for (let сИмя of Object.keys(_оНастройки)) {
		// for (let sName of Object.keys(_oSettings)) {
			if (!_мноНеСветить.has(сИмя) && (_мноПостоянныеНастройки.has(сИмя) || _оНастройки[сИмя].пТекущее !== _оНастройки[сИмя].пНачальное)) {
			// if (!_mnoDoNotShow.has(sName) && (_mnoPermanentSettings.has(sName) || _oSettings[sName].pCurrent !== _oSettings[sName].pInitial)) {
				оОтчет[сИмя] = _оНастройки[сИмя].пТекущее;
				// oReport[sName] = _oSettings[sName].pCurrent;
			}
		}
		return оОтчет;
		// return oReport;
	}
	function СохранитьИзменения() {
	// function SaveChanges() {
		if (_чТаймерОтложенногоСохранения !== 0) {
		// if (_nDelayedSaveTimer !== 0) {
			clearTimeout(_чТаймерОтложенногоСохранения);
			// clearTimeout(_nDelayedSaveTimer);
			ЗавершитьСохранение();
			// FinishSaving();
		}
	}
	window.addEventListener('beforeunload', СохранитьИзменения);
	// window.addEventListener('beforeunload', SaveChanges);
	return {
		Восстановить,
		// Restore,
		Сбросить,
		// Reset,
		Экспорт,
		// Export,
		Импорт,
		// Import,
		Получить,
		// Get,
		Изменить,
		// Change,
		СохранитьИзменения,
		// SaveChanges,
		ПолучитьПараметрыНастройки,
		// GetSettingParameters,
		НастроитьСпискиПредустановок,
		// ConfigurePresetLists,
		ПолучитьДанныеДляОтчета
		// GetDataForReport
	};
})();