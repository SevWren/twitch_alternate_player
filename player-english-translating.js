"use strict";

const ВЕРСИЯ_РАСШИРЕНИЯ = chrome.runtime.getManifest().version;
// const EXTENSION_VERSION = chrome.runtime.getManifest().version;

const ЗАГРУЖАТЬ_МЕТАДАННЫЕ_НЕ_ДОЛЬШЕ = 15e3;
// const LOAD_METADATA_NO_LONGER_THAN = 15e3;

const ЗАГРУЖАТЬ_СПИСОК_ВАРИАНТОВ_НЕ_ДОЛЬШЕ = 15e3;
// const LOAD_VARIANT_LIST_NO_LONGER_THAN = 15e3;

const ЗАГРУЖАТЬ_СПИСОК_СЕГМЕНТОВ_НЕ_ДОЛЬШЕ = 6e3;
// const LOAD_SEGMENT_LIST_NO_LONGER_THAN = 6e3;

const ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ = 1;
// const PROCESSING_AWAITING_DOWNLOAD = 1;

const ОБРАБОТКА_ЗАГРУЖАЕТСЯ = 2;
// const PROCESSING_DOWNLOADING = 2;

const ОБРАБОТКА_ЗАГРУЖЕН = 3;
// const PROCESSING_DOWNLOADED = 3;

const ОБРАБОТКА_ПРЕОБРАЗОВАН = 4;
// const PROCESSING_CONVERTED = 4;

const СОСТОЯНИЕ_ЗАПУСК = 1;
// const STATE_START = 1;

const СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ = 2;
// const STATE_BROADCAST_START = 2;

const СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ = 3;
// const STATE_BROADCAST_END = 3;

const СОСТОЯНИЕ_ЗАГРУЗКА = 4;
// const STATE_LOADING = 4;

const СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ = 5;
// const STATE_PLAYBACK_START = 5;

const СОСТОЯНИЕ_ВОСПРОИЗВЕДЕНИЕ = 6;
// const STATE_PLAYING = 6;

const СОСТОЯНИЕ_ОСТАНОВКА = 7;
// const STATE_STOP = 7;

const СОСТОЯНИЕ_ПОВТОР = 8;
// const STATE_REPEAT = 8;

const СОСТОЯНИЕ_СМЕНА_ВАРИАНТА = 9;
// const STATE_VARIANT_CHANGE = 9;

const ПОДПИСКА_ОБНОВЛЯЕТСЯ = -1;
// const SUBSCRIPTION_UPDATING = -1;

const ПОДПИСКА_НЕДОСТУПНА = 0;
// const SUBSCRIPTION_UNAVAILABLE = 0;

const ПОДПИСКА_НЕОФОРМЛЕНА = 1;
// const SUBSCRIPTION_NOT_SUBSCRIBED = 1;

const ПОДПИСКА_НЕУВЕДОМЛЯТЬ = 2;
// const SUBSCRIPTION_DO_NOT_NOTIFY = 2;

const ПОДПИСКА_УВЕДОМЛЯТЬ = 3;
// const SUBSCRIPTION_NOTIFY = 3;

const КОД_ОТВЕТА = "Сервер вернул код ";
// const RESPONSE_CODE = 'Server returned code ';

let г_чТочноеВремя = NaN;
// let g_nExactTime = NaN;

if (!navigator.clipboard) {
  navigator.clipboard = {};
}

if (!navigator.clipboard.writeText) {
  navigator.clipboard.writeText = function (сТекст) {
    // navigator.clipboard.writeText = function(sText) {
    Проверить(typeof сТекст == "string");
    // Check(typeof sText == 'string');
    return new Promise(
      ДобавитьОбработчикИсключений((фВыполнить, фОтказаться) => {
        // return new Promise(AddExceptionHandler((fResolve, fReject) => {
        const узТекст = document.createElement("input");
        // const nodeText = document.createElement('input');
        узТекст.type = "text";
        // nodeText.type = 'text';
        узТекст.readOnly = true;
        // nodeText.readOnly = true;
        узТекст.value = сТекст;
        // nodeText.value = sText;
        узТекст.style.position = "fixed";
        // nodeText.style.position = 'fixed';
        узТекст.style.left = "-100500px";
        // nodeText.style.left = '-100500px';
        document.body.appendChild(узТекст);
        // document.body.appendChild(nodeText);
        узТекст.select();
        // nodeText.select();
        const лПолучилось = document.execCommand("copy");
        // const bSuccess = document.execCommand('copy');
        узТекст.remove();
        // nodeText.remove();
        if (лПолучилось) {
          // if (bSuccess) {
          фВыполнить();
          // fResolve();
        } else {
          фОтказаться();
          // fReject();
        }
      })
    );
  };
}

function Текст(сКод, сПодстановка) {
  // function Text(sCode, sSubstitution) {
  return м_i18n.GetMessage(сКод, сПодстановка);
  // return m_i18n.GetMessage(sCode, sSubstitution);
}

function Округлить(чЗначение, чТочность) {
  // function Round(nValue, nPrecision) {
  Проверить(
    typeof чЗначение == "number" &&
      Number.isInteger(чТочность) &&
      чТочность >= 0 &&
      чТочность <= 20
  );
  // Check(typeof nValue == 'number' && Number.isInteger(nPrecision) && nPrecision >= 0 && nPrecision <= 20);
  if (чТочность === 0) {
    // if (nPrecision === 0) {
    return Math.round(чЗначение);
    // return Math.round(nValue);
  }
  const ч = Math.pow(10, чТочность);
  // const n = Math.pow(10, nPrecision);
  return Math.round(чЗначение * ч) / ч;
  // return Math.round(nValue * n) / n;
}

function Ограничить(чЗначение, чМинимум, чМаксимум) {
  // function Clamp(nValue, nMin, nMax) {
  Проверить(
    Number.isFinite(чЗначение) &&
      Number.isFinite(чМинимум) &&
      Number.isFinite(чМаксимум) &&
      чМинимум <= чМаксимум
  );
  // Check(Number.isFinite(nValue) && Number.isFinite(nMin) && Number.isFinite(nMax) && nMin <= nMax);
  return Math.min(Math.max(чЗначение, чМинимум), чМаксимум);
  // return Math.min(Math.max(nValue, nMin), nMax);
}

function цепочка(пОбъект, ...мсСвойства) {
  // function chain(pObject, ...msProperties) {
  Проверить(мсСвойства.length !== 0);
  // Check(msProperties.length !== 0);
  for (const сСвойство of мсСвойства) {
    // for (const sProperty of msProperties) {
    if (!ЭтоОбъект(пОбъект)) {
      // if (!IsObject(pObject)) {
      return null;
    }
    Проверить(ЭтоНепустаяСтрока(сСвойство));
    // Check(IsNonEmptyString(sProperty));
    пОбъект = пОбъект[сСвойство];
    // pObject = pObject[sProperty];
  }
  return пОбъект;
  // return pObject;
}

function ResolveRelativeUrl(sRelativeUrl, sAbsoluteBaseUrl) {
  return new URL(sRelativeUrl, sAbsoluteBaseUrl).href;
}

function ИзменитьЗаголовокДокумента(сЗаголовок) {
  // function ChangeDocumentTitle(sTitle) {
  history.replaceState(null, "");
  document.title = сЗаголовок;
  // document.title = sTitle;
}

function проверитьРазрешенияРасширения() {
  return new Promise((фВыполнить) => {
    chrome.permissions.contains(
      {
        origins: chrome.runtime
          .getManifest()
          .permissions.filter((сРазрешение) => сРазрешение.includes(":")),
      },
      (лРазрешено) => {
        if (chrome.runtime.lastError) {
          console.error(
            "permissions.contains",
            chrome.runtime.lastError.message
          );
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0221");
        }
        if (!лРазрешено) {
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0215");
        }
        фВыполнить();
      }
    );
  });
}

получитьТекущуюВкладку.чИдВкладки = NaN;

получитьТекущуюВкладку.cХранилищеПеченек = "";

function получитьТекущуюВкладку() {
  return new Promise((фВыполнить) => {
    chrome.tabs.getCurrent(
      ДобавитьОбработчикИсключений((оВкладка) => {
        if (
          chrome.runtime.lastError ||
          !ЭтоОбъект(оВкладка) ||
          !Number.isSafeInteger(оВкладка.id) ||
          оВкладка.id === chrome.tabs.TAB_ID_NONE
        ) {
          console.error(
            "tabs.getCurrent",
            chrome.runtime.lastError && chrome.runtime.lastError.message
          );
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0221");
        }
        получитьТекущуюВкладку.чИдВкладки = оВкладка.id;
        фВыполнить();
      })
    );
  });
}

function получитьВсеПеченьки(сАдрес) {
  return new Promise((фВыполнить) => {
    const оПараметры = {
      url: сАдрес,
    };
    if (получитьТекущуюВкладку.cХранилищеПеченек) {
      оПараметры.storeId = получитьТекущуюВкладку.cХранилищеПеченек;
    }
    chrome.cookies.getAll(
      оПараметры,
      ДобавитьОбработчикИсключений((моПеченьки) => {
        if (!chrome.runtime.lastError && Array.isArray(моПеченьки)) {
          м_Журнал.Вот(`[API] Количество печенек: ${моПеченьки.length}`);
          фВыполнить(моПеченьки);
        } else {
          console.error(
            "cookies.getAll",
            chrome.runtime.lastError && chrome.runtime.lastError.message
          );
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0221");
        }
      })
    );
  });
}

function удалитьПеченьку(сИмя, сАдрес) {
  return new Promise((фВыполнить) => {
    chrome.cookies.remove(
      {
        name: сИмя,
        url: сАдрес,
      },
      ДобавитьОбработчикИсключений(() => {
        if (chrome.runtime.lastError) {
          console.error("cookies.remove", chrome.runtime.lastError.message);
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0221");
        }
        фВыполнить();
      })
    );
  });
}

function ОткрытьАдресВНовойВкладке(сАдрес) {
  window.open(сАдрес);
}

function ЗаписатьТекстВЛокальныйФайл(сТекст, сТипДанных, сИмяФайла) {
  Проверить(
    typeof сТекст == "string" &&
      ЭтоНепустаяСтрока(сТипДанных) &&
      ЭтоНепустаяСтрока(сИмяФайла)
  );
  const узСсылка = document.createElement("a");
  узСсылка.href = URL.createObjectURL(
    new Blob([сТекст], {
      type: сТипДанных,
    })
  );
  узСсылка.download = сИмяФайла;
  узСсылка.dispatchEvent(new MouseEvent("click"));
}

function создатьОбработчикСобытийЭлемента(фВызвать) {
  return ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.target.nodeType === Node.ELEMENT_NODE) {
      фВызвать(оСобытие);
    }
  });
}

function ЭтоСобытиеДляСсылки(оСобытие) {
  return !!оСобытие.target.closest("a[href]");
}

function ЭлементВЭтойТочкеМожноПрокрутить(x, y) {
  for (
    let узЭлемент = document.elementFromPoint(x, y);
    узЭлемент;
    узЭлемент = узЭлемент.parentElement
  ) {
    if (ЭтотЭлементМожноПрокрутить(узЭлемент)) {
      return true;
    }
  }
  return false;
}

function ЭтотЭлементМожноПрокрутить(узЭлемент) {
  const оСтиль = getComputedStyle(узЭлемент);
  return (
    (оСтиль.overflowY === "scroll" || оСтиль.overflowY === "auto") &&
    узЭлемент.clientHeight < узЭлемент.scrollHeight
  );
}

function этотЭлементПолностьюПрокручен(элЭлемент) {
  return (
    элЭлемент.scrollHeight - элЭлемент.scrollTop - элЭлемент.clientHeight < 2
  );
}

function ПоказатьЭлемент(пЭлемент, лПоказать) {
  const узЭлемент = Узел(пЭлемент);
  if (лПоказать) {
    узЭлемент.removeAttribute("hidden");
  } else {
    узЭлемент.setAttribute("hidden", "");
  }
  return узЭлемент;
}

function ЭлементПоказан(пЭлемент) {
  return !Узел(пЭлемент).hasAttribute("hidden");
}

function ИзменитьКнопку(пКнопка, пСостояние) {
  const узКнопка = Узел(пКнопка);
  const чСостояние = Number(пСостояние);
  const сузСостояния = узКнопка.getElementsByTagName("use");
  Проверить(чСостояние >= 0 && чСостояние < сузСостояния.length);
  for (let ы = 0; ы < сузСостояния.length; ++ы) {
    if (ы === чСостояние) {
      const сПодсказка = сузСостояния[ы].getAttributeNS(
        "http://www.w3.org/1999/xlink",
        "title"
      );
      if (сПодсказка) {
        узКнопка.title = Текст(сПодсказка);
      }
      сузСостояния[ы].removeAttribute("display");
    } else {
      сузСостояния[ы].setAttribute("display", "none");
    }
  }
  return узКнопка;
}

const м_Отладка = (() => {
  const МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА = 15e4;
  let _сТокенТрансляции = "";
  let _сТокенТрансляцииБезРекламы = "";
  let _сСписокВариантов = "";
  let _мсСпискиСегментов = [];
  function ВставитьСсылкиДляСкачиванияФайлов(узФорма) {}
  function ПоказатьСтраницу() {
    try {
      м_ПолноэкранныйРежим.Отключить();
    } catch (_) {}
    document.body.textContent = "";
    for (let уз of document.querySelectorAll('link[rel="stylesheet"], style')) {
      уз.remove();
    }
    for (let уз of [document.documentElement, document.body]) {
      уз.removeAttribute("class");
      уз.removeAttribute("style");
      уз.removeAttribute("hidden");
    }
    return new Promise((фВыполнить) => {
      const уз = document.createElement("iframe");
      уз.src = "report.html";
      уз.style.position = "fixed";
      уз.style.top = "0";
      уз.style.left = "0";
      уз.style.width = "100%";
      уз.style.height = "100%";
      уз.style.zIndex = "100500";
      уз.style.border = "0";
      уз.addEventListener("load", () => {
        м_i18n.TranslateDocument(уз.contentDocument);
        фВыполнить(уз.contentDocument);
      });
      document.body.appendChild(уз);
    });
  }
  function ПоказатьФорму(оДокумент, сИдФормы, лНастроитьФон) {
    if (лНастроитьФон) {
      оДокумент.documentElement.classList.add(сИдФормы);
    }
    for (
      let узПоказатьИлиСкрыть, сузПоказатьИлиСкрыть = оДокумент.forms, ы = 0;
      (узПоказатьИлиСкрыть = сузПоказатьИлиСкрыть[ы]);
      ++ы
    ) {
      if (узПоказатьИлиСкрыть.id === сИдФормы) {
        ПоказатьЭлемент(узПоказатьИлиСкрыть, true);
        const узФокус = узПоказатьИлиСкрыть.querySelector("[autofocus]");
        if (узФокус) {
          узФокус.focus();
        }
      } else {
        ПоказатьЭлемент(узПоказатьИлиСкрыть, false);
      }
    }
  }
  function ПоказатьСообщение(сСообщение, сКодСсылки, сАдресСсылки) {
    ПоказатьСтраницу().then((оДокумент) => {
      оДокумент.getElementById("отладка-текстсообщения").textContent =
        сСообщение;
      if (сКодСсылки) {
        const элСсылка = оДокумент.getElementById("отладка-ссылкасообщения");
        элСсылка.textContent = Текст(сКодСсылки);
        элСсылка.href = сАдресСсылки;
      }
      ПоказатьФорму(оДокумент, "отладка-сообщение", true);
    });
  }
  function ПоказатьИОтправитьОтчет(оОтчет, буфОтправить) {
    ПоказатьСтраницу().then((оДокумент) => {
      let узФорма;
      if (оОтчет.ПричинаЗавершенияРаботы === "ОТПРАВИТЬ ОТЗЫВ") {
        узФорма = оДокумент.getElementById("отладка-отзыв");
      } else {
        узФорма = оДокумент.getElementById("отладка-ошибка");
        ВставитьСсылкиДляСкачиванияФайлов(узФорма);
      }
      узФорма.elements["отладка-отчет"].value = JSON.stringify(оОтчет);
      ПоказатьФорму(оДокумент, узФорма.id, true);
      оДокумент.addEventListener("reset", (оСобытие) => {
        оСобытие.preventDefault();
        window.location.reload(true);
      });
      let оЗапрос, оДанные, чКод;
      оДокумент.addEventListener("submit", (оСобытие) => {
        оСобытие.preventDefault();
        if (оСобытие.target.id === "отладка-идетотправка") {
          чКод = 200;
          оЗапрос.abort();
          return;
        }
        оДокумент.getElementById("отладка-ходотправки").value = 0;
        ПоказатьФорму(оДокумент, "отладка-идетотправка", false);
        чКод = 0;
        if (!оЗапрос) {
          оЗапрос = new XMLHttpRequest();
          оЗапрос.upload.addEventListener("progress", (оСобытие) => {
            оДокумент.getElementById("отладка-ходотправки").value =
              оСобытие.loaded / оСобытие.total;
          });
          оЗапрос.addEventListener("load", () => {
            чКод = оЗапрос.status;
          });
          оЗапрос.addEventListener("loadend", () => {
            if (чКод >= 200 && чКод <= 299) {
              window.location.reload(true);
            } else if (чКод === 474) {
              показатьФорму("отладка-браузерустарел", true);
            } else if (чКод >= 400 && чКод <= 499) {
              ПоказатьФорму(оДокумент, "отладка-версияустарела", true);
            } else {
              ПоказатьФорму(оДокумент, "отладка-сбойотправки", true);
            }
          });
          оДанные = new FormData(узФорма);
          if (буфОтправить) {
            оДанные.append(
              "отладка-транспортныйпоток-0",
              new Blob([буфОтправить], {
                type: "video/mp2t",
              })
            );
          }
        }
        // CORRECT AND SECURE
        //оЗапрос.open('POST', 'http://r90354g8.beget.tech/tw5/report3.php');
        // оЗапрос.open("POST", "http://www.google.com"); // Comment out or delete
        // оЗапрос.send(оДанные);                      // Comment out or delete
      });
    });
  }
  function сохранитьТокенТрансляции(сТокенТрансляции, лБезРекламы) {
    сТокенТрансляции = ОграничитьДлинуСтроки(
      сТокенТрансляции,
      МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА
    );
    if (лБезРекламы) {
      _сТокенТрансляцииБезРекламы = сТокенТрансляции;
    } else {
      _сТокенТрансляции = сТокенТрансляции;
    }
  }
  function СохранитьСписокВариантов(сСписокВариантов) {
    _сСписокВариантов = сСписокВариантов;
  }
  function СохранитьСписокСегментов(сСписокСегментов) {
    if (_мсСпискиСегментов.length === 10) {
      _мсСпискиСегментов.shift();
    }
    _мсСпискиСегментов.push(сСписокСегментов);
  }
  function СохранитьТранспортныйПоток(оСегмент) {}
  function СохранитьПреобразованныйСегмент(оСегмент) {}
  function сжатьСписок(сСписок) {
    return ОграничитьДлинуСтроки(
      сСписок.replace(
        /^(?:https?:\/\/|#EXT-X-TWITCH-PREFETCH:).+$/gm,
        (сСтрока) => ОграничитьДлинуСтроки(сСтрока, 100)
      ),
      МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА
    );
  }
  function ОбнюхатьПроцессорИОперативку(фВызвать) {
    const оПроцессорИОперативка = {
      capacity: navigator.deviceMemory,
      numOfProcessors: navigator.hardwareConcurrency,
    };
    if (performance.memory) {
      оПроцессорИОперативка.jsHeapSizeLimit = Math.round(
        performance.memory.jsHeapSizeLimit / 1024 / 1024
      );
      оПроцессорИОперативка.totalJSHeapSize = Math.round(
        performance.memory.totalJSHeapSize / 1024 / 1024
      );
      оПроцессорИОперативка.usedJSHeapSize = Math.round(
        performance.memory.usedJSHeapSize / 1024 / 1024
      );
    }
    try {
      chrome.system.memory.getInfo((оОперативка) => {
        try {
          оПроцессорИОперативка.capacity = Округлить(
            оОперативка.capacity / 1024 / 1024 / 1024,
            1
          );
          оПроцессорИОперативка.availableCapacity = Округлить(
            оОперативка.availableCapacity / 1024 / 1024 / 1024,
            1
          );
          chrome.system.cpu.getInfo((оПроцессор) => {
            try {
              оПроцессорИОперативка.numOfProcessors =
                оПроцессор.numOfProcessors;
              оПроцессорИОперативка.modelName = оПроцессор.modelName;
              оПроцессорИОперативка.archName = оПроцессор.archName;
            } catch (_) {}
            фВызвать(оПроцессорИОперативка);
          });
        } catch (_) {
          фВызвать(оПроцессорИОперативка);
        }
      });
    } catch (_) {
      фВызвать(оПроцессорИОперативка);
    }
  }
  function ОбнюхатьВидюху() {
    try {
      const oContext = document.createElement("canvas").getContext("webgl");
      const oExtension = oContext.getExtension("WEBGL_debug_renderer_info");
      return `${oContext.getParameter(
        oExtension.UNMASKED_VENDOR_WEBGL
      )} | ${oContext.getParameter(oExtension.UNMASKED_RENDERER_WEBGL)}`;
    } catch (_) {}
  }
  function получитьПараметрыСоединения() {
    const оСоединение = navigator.connection || {};
    return {
      online: navigator.onLine,
      effectiveType: оСоединение.effectiveType,
      downlink: оСоединение.downlink,
      rtt: оСоединение.rtt,
      type: оСоединение.type,
      downlinkMax: оСоединение.downlinkMax,
    };
  }
  function ПолучитьЯзыки() {
    try {
      return `${navigator.language} | ${navigator.languages} | ${Текст(
        "J0103"
      )}`;
    } catch (_) {}
  }
  function ПолучитьУстановкиДаты() {
    try {
      const оУстановки = new Intl.DateTimeFormat().resolvedOptions();
      оУстановки.timezoneOffset = new Date().getTimezoneOffset();
      return оУстановки;
    } catch (_) {}
  }
  function СоздатьПоказатьИОтправитьОтчет(
    сПричинаЗавершенияРаботы,
    буфОтправить
  ) {
    ОбнюхатьПроцессорИОперативку((оПроцессорИОперативка) => {
      ПоказатьИОтправитьОтчет(
        {
          ПричинаЗавершенияРаботы: сПричинаЗавершенияРаботы,
          ВерсияРасширения: ВЕРСИЯ_РАСШИРЕНИЯ,
          Оборзеватель: navigator.userAgent,
          Время: new Date().toISOString(),
          Адрес: window.location.href,
          Инкогнито: chrome.extension.inIncognitoContext,
          Рассинхронизация: Date.now() - performance.now() - г_чТочноеВремя,
          Фокусник: м_Фокусник.ПолучитьСостояние(),
          Пульс: м_Пульс.ПолучитьДанныеДляОтчета(),
          Настройки: м_Настройки.ПолучитьДанныеДляОтчета(),
          Статистика: м_Статистика.ПолучитьДанныеДляОтчета(),
          Языки: ПолучитьЯзыки(),
          УстановкиДаты: ПолучитьУстановкиДаты(),
          Соединение: получитьПараметрыСоединения(),
          Видюха: ОбнюхатьВидюху(),
          ПроцессорИОперативка: оПроцессорИОперативка,
          ТочекКасания: navigator.maxTouchPoints,
          Экран: {
            top: window.screen.top,
            left: window.screen.left,
            width: window.screen.width,
            height: window.screen.height,
            availTop: window.screen.availTop,
            availLeft: window.screen.availLeft,
            availWidth: window.screen.availWidth,
            availHeight: window.screen.availHeight,
            colorDepth: window.screen.colorDepth,
            pixelDepth: window.screen.pixelDepth,
            orientation:
              typeof window.screen.orientation == "object"
                ? window.screen.orientation.type
                : void 0,
            screenX: window.screenX,
            screenY: window.screenY,
            outerWidth: window.outerWidth,
            outerHeight: window.outerHeight,
            innerWidth: window.innerWidth,
            innerHeight: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio,
          },
          ТокенТрансляции: _сТокенТрансляции,
          ТокенТрансляцииБезРекламы: _сТокенТрансляцииБезРекламы,
          СписокВариантов: сжатьСписок(_сСписокВариантов),
          СпискиСегментов: _мсСпискиСегментов.map(сжатьСписок),
          Журнал: м_Журнал.ПолучитьДанныеДляОтчета(),
        },
        буфОтправить
      );
    });
  }
  function ЗавершитьРаботуИПоказатьСообщение(
    сКодСообщения,
    сКодСсылки,
    сАдресСсылки
  ) {
    if (!г_лРаботаЗавершена) {
      console.error(сКодСообщения);
      ЗавершитьРаботу(false);
      ПоказатьСообщение(Текст(сКодСообщения), сКодСсылки, сАдресСсылки);
    }
    throw void 0;
  }
  function ЗавершитьРаботуИОтправитьОтчет(
    сПричинаЗавершенияРаботы,
    буфОтправить
  ) {
    if (!г_лРаботаЗавершена) {
      console.error(сПричинаЗавершенияРаботы);
      сПричинаЗавершенияРаботы = ОграничитьДлинуСтроки(
        String(сПричинаЗавершенияРаботы),
        МАКС_ДЛИНА_СТРОКИ_ОТЧЕТА
      );
      if (сПричинаЗавершенияРаботы.includes("out of memory")) {
        ЗавершитьРаботуИПоказатьСообщение("J0200");
      }
      try {
        м_Проигрыватель.ПоказатьСостояние("Вот", "Завершаю работу");
        г_моОчередь.ПоказатьСостояние();
      } catch (_) {}
      ЗавершитьРаботу(false);
      СоздатьПоказатьИОтправитьОтчет(сПричинаЗавершенияРаботы, буфОтправить);
    }
    throw void 0;
  }
  function ПойманоИсключение(пИсключение) {
    ЗавершитьРаботуИОтправитьОтчет(ПеревестиИсключениеВСтроку(пИсключение));
  }
  function ЗавершитьРаботуИОтправитьОтзыв() {
    try {
      ЗавершитьРаботуИОтправитьОтчет("ОТПРАВИТЬ ОТЗЫВ");
    } catch (_) {}
  }
  return {
    ПойманоИсключение,
    ЗавершитьРаботуИПоказатьСообщение,
    ЗавершитьРаботуИОтправитьОтчет,
    ЗавершитьРаботуИОтправитьОтзыв,
    сохранитьТокенТрансляции,
    СохранитьСписокВариантов,
    СохранитьСписокСегментов,
    СохранитьТранспортныйПоток,
    СохранитьПреобразованныйСегмент,
  };
})();

class ОтменаОбещания {
  constructor() {
    this.лОтменено = false;
    this._фОбработчик = null;
  }
  Отменить() {
    this.лОтменено = true;
    if (this._фОбработчик) {
      this._фОбработчик();
      this._фОбработчик = null;
    }
  }
  ЗаменитьОбработчик(фОбработчик) {
    Проверить(!this.лОтменено);
    Проверить(typeof фОбработчик == "function" || фОбработчик === null);
    this._фОбработчик = фОбработчик;
  }
}

ОтменаОбещания.ПРИЧИНА = new Error("ОБЕЩАНИЕ_ОТМЕНЕНО");

function Ждать(оОтменаОбещания, чМиллисекунды) {
  if (оОтменаОбещания && оОтменаОбещания.лОтменено) {
    return Promise.reject(ОтменаОбещания.ПРИЧИНА);
  }
  if (чМиллисекунды === -Infinity) {
    let оОбещание = Promise.resolve();
    if (оОтменаОбещания) {
      оОбещание = оОбещание.then(() => {
        if (оОтменаОбещания.лОтменено) {
          throw ОтменаОбещания.ПРИЧИНА;
        }
      });
    }
    return оОбещание;
  }
  Проверить(Number.isFinite(чМиллисекунды));
  чМиллисекунды = Math.round(чМиллисекунды);
  Проверить(чМиллисекунды >= 0 && чМиллисекунды <= 2147483647);
  if (оОтменаОбещания) {
    return new Promise((фВыполнить, фОтказаться) => {
      const чТаймер = setTimeout(() => {
        оОтменаОбещания.ЗаменитьОбработчик(null);
        фВыполнить();
      }, чМиллисекунды);
      оОтменаОбещания.ЗаменитьОбработчик(() => {
        clearTimeout(чТаймер);
        фОтказаться(ОтменаОбещания.ПРИЧИНА);
      });
    });
  }
  return new Promise((фВыполнить) => {
    setTimeout(фВыполнить, чМиллисекунды);
  });
}

class Сегмент {
  constructor(чОбработка, пДанные, чДлительность, лРазрыв, чНомер) {
    Проверить(
      typeof чОбработка == "number" &&
        чОбработка >= ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ &&
        чОбработка <= ОБРАБОТКА_ПРЕОБРАЗОВАН
    );
    Проверить(
      (typeof пДанные == "number" && чОбработка >= ОБРАБОТКА_ЗАГРУЖЕН) ||
        (typeof пДанные == "string" &&
          чОбработка === ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ) ||
        (ЭтоОбъект(пДанные) && чОбработка > ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ)
    );
    switch (arguments.length) {
      case 2:
        чДлительность = 0;
        лРазрыв = true;

      case 4:
        Проверить(Number.isFinite(чДлительность) && чДлительность >= 0);
        Проверить(typeof лРазрыв == "boolean");
        чНомер = ++Сегмент._чНомер;

      case 5:
        Проверить(Number.isFinite(чНомер));
        break;

      default:
        Проверить(false);
    }
    if (typeof пДанные == "number") {
      м_Журнал.Окак(
        `[Очередь] Добавлен сегмент ${чНомер} Состояние=${пДанные} Обработка=${чОбработка}`
      );
    }
    this.чОбработка = чОбработка;
    this.пДанные = пДанные;
    this.чДлительность = чДлительность;
    this.лРазрыв = лРазрыв;
    this.чНомер = чНомер;
  }
  toString() {
    if (typeof this.пДанные == "number") {
      return `${this.чНомер}-${this.чОбработка}-${this.пДанные}`;
    }
    if (this.лРазрыв) {
      return `${this.чНомер}-${this.чОбработка}-Р`;
    }
    return `${this.чНомер}-${this.чОбработка}`;
  }
}

Сегмент._чНомер = 0;

let г_моОчередь = [];

г_моОчередь.ПодсчитатьПреобразованныеСегменты = function () {
  let кКоличество = 0,
    чДлительность = 0;
  for (
    ;
    кКоличество < this.length &&
    this[кКоличество].чОбработка === ОБРАБОТКА_ПРЕОБРАЗОВАН;
    ++кКоличество
  ) {
    if (typeof this[кКоличество].пДанные != "number") {
      чДлительность += this[кКоличество].чДлительность;
    }
  }
  return {
    кКоличество,
    чДлительность,
  };
};

г_моОчередь.Добавить = function (оСегмент) {
  Проверить(оСегмент instanceof Сегмент);
  for (let о of this) {
    Проверить(о.чНомер !== оСегмент.чНомер);
  }
  if (оСегмент.чОбработка !== ОБРАБОТКА_ПРЕОБРАЗОВАН) {
    this.push(оСегмент);
  } else {
    const { кКоличество, чДлительность } =
      this.ПодсчитатьПреобразованныеСегменты();
    if (чДлительность > ПЕРЕПОЛНЕНИЕ_БУФЕРА * 1.5) {
      м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0208");
    }
    this.splice(кКоличество, 0, оСегмент);
  }
  return оСегмент;
};

г_моОчередь.Удалить = function (пЭлемент, кКоличество = 1) {
  if (кКоличество === 0) {
    return;
  }
  Проверить(Number.isInteger(кКоличество) && кКоличество > 0);
  let чИндекс;
  if (typeof пЭлемент == "number") {
    Проверить(Number.isInteger(пЭлемент) && пЭлемент >= 0);
    чИндекс = пЭлемент;
  } else if ((чИндекс = this.indexOf(пЭлемент)) === -1) {
    Проверить(пЭлемент instanceof Сегмент);
    return;
  }
  while (--кКоличество >= 0) {
    Проверить(чИндекс < this.length);
    switch (this[чИндекс].чОбработка) {
      case ОБРАБОТКА_ЗАГРУЖАЕТСЯ:
        if (ЭтоОбъект(this[чИндекс].пДанные)) {
          м_Журнал.Вот(`[Очередь] Отменяю загрузку ${this[чИндекс]}`);
          this[чИндекс].пДанные.Отменить();
        }
        break;

      case ОБРАБОТКА_ЗАГРУЖЕН:
        м_Помойка.Выбросить(this[чИндекс].пДанные);
        break;

      case ОБРАБОТКА_ПРЕОБРАЗОВАН:
        if (ЭтоОбъект(this[чИндекс].пДанные)) {
          м_Помойка.Выбросить(this[чИндекс].пДанные.мбСегментИнициализации);
          м_Помойка.Выбросить(this[чИндекс].пДанные.мбМедиасегмент);
        }
    }
    м_Журнал.Вот(`[Очередь] Удаляю ${this[чИндекс]}`);
    this.splice(чИндекс, 1);
  }
};

г_моОчередь.Очистить = function () {
  this.Удалить(0, this.length);
};

г_моОчередь.ПоказатьСостояние = function () {
  м_Журнал.Вот(`[Очередь] ${this.join(" ")}`);
};

class ВводЧисла {
  constructor(сИмяНастройки, чШаг, чТочность, сИдУзла) {
    Проверить(чТочность >= 0 && ЭтоНепустаяСтрока(сИдУзла));
    this._сИмяНастройки = сИмяНастройки;
    this._чШаг = чШаг;
    this._чТочность = чТочность;
    this._чДобавить = 0;
    this._кИнтервал = 0;
    this._чТаймер = 0;
    м_События.ДобавитьОбработчик(
      `тащилка-перетаскивание-${сИдУзла}`,
      (оПараметры) => this._ОбработатьПеретаскивание(оПараметры)
    );
    this._узЧисло = document.querySelector(`#${сИдУзла} > .вводчисла-число`);
    this.Обновить();
  }
  Обновить(чЗначение = м_Настройки.Получить(this._сИмяНастройки)) {
    this._узЧисло.value =
      чЗначение === АВТОНАСТРОЙКА
        ? Текст(
            м_Настройки.ПолучитьПараметрыНастройки(this._сИмяНастройки)
              .сАвтонастройка
          )
        : м_i18n.ФорматироватьЧисло(чЗначение, this._чТочность);
  }
  _ОбработатьПеретаскивание(оПараметры) {
    const ИНТЕРВАЛ_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ = 130;
    if (оПараметры.чШаг === 1) {
      this._чДобавить = оПараметры.узНажат.classList.contains("вводчисла-минус")
        ? -this._чШаг
        : this._чШаг;
      this._кИнтервал = 0;
      this._чТаймер = setInterval(
        () => this._ОбработатьТаймер(),
        ИНТЕРВАЛ_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ
      );
      this._ОбработатьТаймер();
    }
    if (оПараметры.чШаг === 3) {
      clearInterval(this._чТаймер);
    }
  }
}

ВводЧисла.prototype._ОбработатьТаймер = ДобавитьОбработчикИсключений(
  function () {
    const ЗАДЕРЖКА_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ = 3;
    if (
      ++this._кИнтервал == 1 ||
      this._кИнтервал > ЗАДЕРЖКА_ИЗМЕНЕНИЯ_ЗНАЧЕНИЯ
    ) {
      const оПараметрыНастройки = м_Настройки.ПолучитьПараметрыНастройки(
        this._сИмяНастройки
      );
      const чЗначение = м_Настройки.Получить(this._сИмяНастройки);
      let чНовоеЗначение;
      if (
        (оПараметрыНастройки.сАвтонастройка &&
          this._чДобавить < 0 &&
          чЗначение === оПараметрыНастройки.чМинимальное) ||
        (оПараметрыНастройки.сАвтонастройка &&
          this._чДобавить > 0 &&
          чЗначение === оПараметрыНастройки.чМаксимальное)
      ) {
        чНовоеЗначение = АВТОНАСТРОЙКА;
      } else if (чЗначение === АВТОНАСТРОЙКА && this._чДобавить > 0) {
        чНовоеЗначение = оПараметрыНастройки.чМинимальное;
      } else if (чЗначение === АВТОНАСТРОЙКА && this._чДобавить < 0) {
        чНовоеЗначение = оПараметрыНастройки.чМаксимальное;
      } else {
        чНовоеЗначение = чЗначение + this._чДобавить;
      }
      if (чНовоеЗначение !== АВТОНАСТРОЙКА) {
        чНовоеЗначение = Ограничить(
          Округлить(чНовоеЗначение, this._чТочность),
          оПараметрыНастройки.чМинимальное,
          оПараметрыНастройки.чМаксимальное
        );
      }
      if (чНовоеЗначение !== чЗначение) {
        м_Настройки.Изменить(this._сИмяНастройки, чНовоеЗначение);
        this.Обновить(чНовоеЗначение);
        this.ПослеИзменения(чНовоеЗначение);
      }
    }
  }
);

ВводЧисла.prototype.ПослеИзменения = ЗАГЛУШКА;

const м_События = (() => {
  let _амОбработчики = new Map();
  function ДобавитьОбработчик(сСобытие, фОбработчик) {
    Проверить(ЭтоНепустаяСтрока(сСобытие));
    Проверить(typeof фОбработчик == "function" || ЭтоОбъект(фОбработчик));
    let мноОбработчикиСобытия = _амОбработчики.get(сСобытие);
    if (мноОбработчикиСобытия === void 0) {
      мноОбработчикиСобытия = new Set();
      _амОбработчики.set(сСобытие, мноОбработчикиСобытия);
    }
    мноОбработчикиСобытия.add(фОбработчик);
  }
  function УдалитьОбработчик(сСобытие, фОбработчик) {
    Проверить(ЭтоНепустаяСтрока(сСобытие));
    Проверить(typeof фОбработчик == "function" || ЭтоОбъект(фОбработчик));
    const мноОбработчикиСобытия = _амОбработчики.get(сСобытие);
    if (мноОбработчикиСобытия !== void 0) {
      мноОбработчикиСобытия.delete(фОбработчик);
      if (мноОбработчикиСобытия.size === 0) {
        _амОбработчики.delete(сСобытие);
      }
    }
  }
  function ПослатьСобытие(сСобытие, пДанные) {
    Проверить(ЭтоНепустаяСтрока(сСобытие));
    м_Журнал.Вот(`[События] Произошло событие ${сСобытие}`);
    const мноОбработчикиСобытия = _амОбработчики.get(сСобытие);
    if (мноОбработчикиСобытия !== void 0) {
      Проверить(мноОбработчикиСобытия.size !== 0);
      let оСобытие;
      for (let фОбработчик of мноОбработчикиСобытия.values()) {
        if (typeof фОбработчик == "function") {
          фОбработчик(пДанные, сСобытие);
        } else {
          if (оСобытие === void 0) {
            оСобытие = {
              type: сСобытие,
              data: пДанные,
            };
          }
          фОбработчик.handleEvent(оСобытие);
        }
      }
    }
  }
  return {
    ДобавитьОбработчик,
    УдалитьОбработчик,
    ПослатьСобытие,
  };
})();

const м_Помойка = (() => {
  class ПомойкаВКаналеСообщений {
    constructor() {
      this._оКаналСообщений = null;
    }
    Выбросить(пБарахло) {
      if (ЭтоОбъект(пБарахло)) {
        const буфБарахло = пБарахло.buffer ? пБарахло.buffer : пБарахло;
        if (буфБарахло.byteLength) {
          м_Журнал.Вот(`[Помойка] Выбрасываю ${буфБарахло.byteLength} байтов`);
          if (this._оКаналСообщений === null) {
            this._оКаналСообщений = new MessageChannel();
            this._оКаналСообщений.port2.close();
          }
          this._оКаналСообщений.port1.postMessage(буфБарахло, [буфБарахло]);
        }
      }
    }
    Сжечь() {}
  }
  class ПомойкаВРабочемПотоке {
    constructor() {
      this._оРабочийПоток = null;
      this._кбВПомойке = 0;
      м_События.ДобавитьОбработчик(
        "управление-изменилосьсостояние",
        (чСостояние) => {
          if (
            чСостояние === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ ||
            чСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||
            чСостояние === СОСТОЯНИЕ_ПОВТОР
          ) {
            this.Сжечь();
          }
        }
      );
    }
    Выбросить(пБарахло) {
      const ВМЕСТИМОСТЬ_ПОМОЙКИ = 1e7;
      if (ЭтоОбъект(пБарахло)) {
        const буфБарахло = пБарахло.buffer ? пБарахло.buffer : пБарахло;
        if (буфБарахло.byteLength) {
          м_Журнал.Вот(`[Помойка] Выбрасываю ${буфБарахло.byteLength} байтов`);
          if (this._оРабочийПоток === null) {
            this._оРабочийПоток = new Worker("/recycler.js");
          }
          this._кбВПомойке += буфБарахло.byteLength;
          this._оРабочийПоток.postMessage(буфБарахло, [буфБарахло]);
          if (this._кбВПомойке > ВМЕСТИМОСТЬ_ПОМОЙКИ) {
            this.Сжечь();
          }
        }
      }
    }
    Сжечь() {
      if (this._оРабочийПоток !== null) {
        м_Журнал.Вот(`[Помойка] Сжигаю ${this._кбВПомойке} байтов`);
        this._оРабочийПоток.postMessage(null);
        this._оРабочийПоток = null;
        this._кбВПомойке = 0;
      }
    }
  }
  if (этоМобильноеУстройство()) {
    return {
      Выбросить: ЗАГЛУШКА,
      Сжечь: ЗАГЛУШКА,
    };
  }
  return получитьВерсиюДвижкаБраузера() < 67
    ? new ПомойкаВРабочемПотоке()
    : new ПомойкаВКаналеСообщений();
})();

const м_Фокусник = (() => {
  let _оСостояние = ПолучитьНовоеСостояние();
  function ПолучитьСостояние() {
    return _оСостояние;
  }
  function ПолучитьНовоеСостояние() {
    const лПоказан = !document.hidden;
    const лАктивен = лПоказан && document.hasFocus();
    return {
      лПоказан,
      лАктивен,
    };
  }
  const ОбработатьСобытие = ДобавитьОбработчикИсключений((оСобытие) => {
    м_Журнал.Вот(
      `[Фокусник] Событие ${оСобытие.type}, старое состояние ${м_Журнал.O(
        _оСостояние
      )}`
    );
    setTimeout(ОбновитьСостояние);
  });
  const ОбновитьСостояние = ДобавитьОбработчикИсключений(() => {
    const оНовоеСостояние = ПолучитьНовоеСостояние();
    if (
      _оСостояние.лПоказан !== оНовоеСостояние.лПоказан ||
      _оСостояние.лАктивен !== оНовоеСостояние.лАктивен
    ) {
      м_Журнал.Окак(
        `[Фокусник] Новое состояние ${м_Журнал.O(оНовоеСостояние)}`
      );
      _оСостояние = оНовоеСостояние;
      м_События.ПослатьСобытие("фокусник-изменилосьсостояние", оНовоеСостояние);
    }
  });
  м_Журнал.Вот(`[Фокусник] Начальное состояние ${м_Журнал.O(_оСостояние)}`);
  document.addEventListener("visibilitychange", ОбработатьСобытие);
  window.addEventListener("focus", ОбработатьСобытие);
  window.addEventListener("blur", ОбработатьСобытие);
  return {
    ПолучитьСостояние,
  };
})();

const м_Пульс = (() => {
  const ИНТЕРВАЛ_ПРОВЕРКИ = 970;
  const МИН_ОТКЛОНЕНИЕ_ВРЕМЕНИ = -30;
  const МАКС_ОТКЛОНЕНИЕ_ВРЕМЕНИ = 200;
  const МАКС_ОТКЛОНЕНИЕ_ДАТЫ = 40;
  let _чМаксимальноеОтклонение = 0;
  let _чТаймер = 0;
  let _чВремя;
  let _чДата;
  const ПроверитьПульс = ДобавитьОбработчикИсключений(() => {
    const чВремя = performance.now();
    const чДата = Date.now();
    const чОтклонениеВремени = чВремя - _чВремя - ИНТЕРВАЛ_ПРОВЕРКИ;
    const чОтклонениеДаты = чДата - _чДата - (чВремя - _чВремя);
    if (
      чОтклонениеВремени < МИН_ОТКЛОНЕНИЕ_ВРЕМЕНИ ||
      чОтклонениеВремени > МАКС_ОТКЛОНЕНИЕ_ВРЕМЕНИ ||
      Math.abs(чОтклонениеДаты) > МАКС_ОТКЛОНЕНИЕ_ДАТЫ
    ) {
      м_Журнал.Ой(
        `[Пульс] ${м_Журнал.F0(чОтклонениеВремени)} ${м_Журнал.F0(
          чОтклонениеДаты
        )}`
      );
    }
    _чМаксимальноеОтклонение = Math.max(
      _чМаксимальноеОтклонение,
      чОтклонениеВремени
    );
    _чВремя = чВремя;
    _чДата = чДата;
    _чТаймер = setTimeout(ПроверитьПульс, ИНТЕРВАЛ_ПРОВЕРКИ);
  });
  function ОбработатьИзменениеСостояния(чСостояние) {
    if (
      чСостояние === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ ||
      чСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||
      чСостояние === СОСТОЯНИЕ_ПОВТОР
    ) {
      if (_чТаймер !== 0) {
        м_Журнал.Вот("[Пульс] Таймер остановлен");
        clearTimeout(_чТаймер);
        _чТаймер = 0;
      }
    } else if (_чТаймер === 0) {
      м_Журнал.Вот("[Пульс] Таймер запущен");
      _чВремя = performance.now();
      _чДата = Date.now();
      _чТаймер = setTimeout(ПроверитьПульс, ИНТЕРВАЛ_ПРОВЕРКИ);
    }
  }
  function ПолучитьДанныеДляОтчета() {
    return _чМаксимальноеОтклонение;
  }
  м_События.ДобавитьОбработчик(
    "управление-изменилосьсостояние",
    ОбработатьИзменениеСостояния
  );
  return {
    ПолучитьДанныеДляОтчета,
  };
})();

const м_Статистика = (() => {
  const ЧАСТОТА_ОБНОВЛЕНИЯ_СТАТИСТИКИ = 3;
  const РАЗМЕР_ИСТОРИИ_СПИСКА = 30;
  const РАЗМЕР_ИСТОРИИ_ЗАГРУЗКИ = 30;
  const РАЗМЕР_ИСТОРИИ_БУФЕРА = 30;
  const РАЗМЕР_ИСТОРИИ_РЕКЛАМЫ = 15;
  const ВЫДЕЛИТЬ_ОЖИДАНИЕ_ОТВЕТА = 1;
  const ВЫДЕЛИТЬ_ПРЕОБРАЗОВАНО = 2;
  const ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МИН = 1;
  const ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МАКС = 0.5;
  const ВЫДЕЛИТЬ_ПРОПУЩЕННЫЕ_КАДРЫ = 100;
  const ВЫДЕЛИТЬ_ЧАСТОТУ_КАДРОВ = 0.85;
  const ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_ОТН = 1 / 5;
  const ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_АБС = 300;
  const ВЫДЕЛИТЬ_ИСЧЕРПАНИЕ_БУФЕРА = 5;
  let _чТаймер = 0;
  let _nTargetDuration = 0;
  let _чМинДлительностьВидеосемпла = -Infinity;
  let _чМаксДлительностьВидеосемпла = +Infinity;
  let _оИнтервалОбновления = null;
  let _оСегментовДобавлено = null;
  let _оСекундДобавлено = null;
  let _оТолщинаСегмента = null;
  let _оТолщинаКанала = null;
  let _оОжиданиеОтвета = null;
  let _оНеПросмотрено = null;
  let _кИсходныхСегментов = 0;
  let _кЗабракованныхСегментов = 0;
  let _кбВсегоСкачано = 0;
  let _кОшибокЗагрузки = 0;
  let _кПропущенныхСегментов = 0;
  let _кНезагруженныхСегментов = 0;
  let _кПотерьВидео = 0;
  let _кПотерьЗвука = 0;
  let _кИсчерпанийБуфера = 0;
  let _кИсчерпанийБуфераДосрочно = 0;
  let _кПереполненийБуфера = 0;
  let _чПропущеноВБуфере = 0;
  let _кКоличествоРекламы = 0;
  let _мчНачалоРекламы = [];
  let _мчКонецРекламы = [];
  let _чВремяПоследнегоОбновления;
  function ВыделитьСегментовДобавлено(чЧисло) {
    return чЧисло !== 1 && чЧисло !== 2;
  }
  function ВыделитьОжиданиеОтвета(чЧисло) {
    return чЧисло >= ВЫДЕЛИТЬ_ОЖИДАНИЕ_ОТВЕТА;
  }
  function ВыделитьНеПросмотрено(чЧисло) {
    return (
      чЧисло < ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МИН ||
      чЧисло >=
        м_Настройки.Получить("чМаксРазмерБуфера") +
          м_Настройки.Получить("чРастягиваниеБуфера") *
            ВЫДЕЛИТЬ_НЕ_ПРОСМОТРЕНО_МАКС
    );
  }
  class Анализ {
    constructor(сИдУзла, чРазмерИстории, чТочность) {
      Проверить(чРазмерИстории > 0 && чТочность >= 0);
      this._узТаблица = Узел(сИдУзла);
      this._мчИстория = new Array(чРазмерИстории);
      this._млВыделить = new Array(чРазмерИстории);
      this._чТочность = чТочность;
      this._Очистить();
    }
    Освободить() {
      this._узТаблица.textContent = "";
      this._узТаблица = null;
    }
    Очистить() {
      if (this._кЗаполнено !== 0) {
        this._Очистить();
      }
    }
    ПолучитьПоследнееЧисло(чЗаглушка) {
      return this._кЗаполнено === 0
        ? чЗаглушка
        : this._мчИстория[this._чИндекс];
    }
    ДобавитьЧисло(чЧисло, пВыделить, пВыделитьСреднее) {
      const НАЧАЛО_ИСТОРИИ = 5;
      const лВыделить = Boolean(
        typeof пВыделить == "function" ? пВыделить(чЧисло) : пВыделить
      );
      if (this._кЗаполнено !== 0) {
        this._узТаблица.children[НАЧАЛО_ИСТОРИИ + this._чИндекс].classList.add(
          "статистика-подробно"
        );
      }
      if (this._кЗаполнено !== this._мчИстория.length) {
        ++this._кЗаполнено;
      }
      if (++this._чИндекс === this._мчИстория.length) {
        this._чИндекс = 0;
      }
      this._мчИстория[this._чИндекс] = чЧисло;
      this._млВыделить[this._чИндекс] = лВыделить;
      let чМинимальноеЧисло = Infinity,
        лВыделитьМинимальное = false;
      let чМаксимальноеЧисло = -Infinity,
        лВыделитьМаксимальное = false;
      let чСреднееЧисло = 0,
        кЧисел = 0;
      for (let ы = 0; ы < this._кЗаполнено; ++ы) {
        if (Number.isFinite(this._мчИстория[ы])) {
          if (
            this._мчИстория[ы] < чМинимальноеЧисло ||
            (this._мчИстория[ы] === чМинимальноеЧисло && this._млВыделить[ы])
          ) {
            чМинимальноеЧисло = this._мчИстория[ы];
            лВыделитьМинимальное = this._млВыделить[ы];
          }
          if (
            this._мчИстория[ы] > чМаксимальноеЧисло ||
            (this._мчИстория[ы] === чМаксимальноеЧисло && this._млВыделить[ы])
          ) {
            чМаксимальноеЧисло = this._мчИстория[ы];
            лВыделитьМаксимальное = this._млВыделить[ы];
          }
          чСреднееЧисло += this._мчИстория[ы];
          ++кЧисел;
        }
      }
      let лВыделитьСреднее;
      if (кЧисел === 0) {
        чСреднееЧисло = NaN;
        лВыделитьСреднее = false;
      } else {
        чСреднееЧисло /= кЧисел;
        лВыделитьСреднее = Boolean(
          typeof пВыделитьСреднее == "function"
            ? пВыделитьСреднее(чСреднееЧисло)
            : пВыделитьСреднее
        );
      }
      ОбновитьЗначение(
        this._узТаблица.children[0],
        this._ВСтроку(чМинимальноеЧисло),
        лВыделитьМинимальное
      );
      ОбновитьЗначение(
        this._узТаблица.children[2],
        this._ВСтроку(чСреднееЧисло),
        лВыделитьСреднее
      );
      ОбновитьЗначение(
        this._узТаблица.children[4],
        this._ВСтроку(чМаксимальноеЧисло),
        лВыделитьМаксимальное
      );
      ОбновитьЗначение(
        this._узТаблица.children[НАЧАЛО_ИСТОРИИ + this._чИндекс],
        this._ВСтроку(чЧисло),
        лВыделить
      ).classList.remove("статистика-подробно");
      return чСреднееЧисло;
    }
    _Очистить() {
      this._кЗаполнено = 0;
      this._чИндекс = -1;
      const узФрагмент = document.createDocumentFragment();
      узФрагмент.appendChild(document.createElement("td")).className =
        "анализ-минимум";
      узФрагмент.appendChild(document.createElement("td")).textContent = " < ";
      узФрагмент.lastChild.className = "статистика-символ";
      узФрагмент.appendChild(document.createElement("td")).className =
        "анализ-среднее";
      узФрагмент.appendChild(document.createElement("td")).textContent = " < ";
      узФрагмент.lastChild.className = "статистика-символ";
      узФрагмент.appendChild(document.createElement("td")).className =
        "анализ-максимум";
      for (let ы = this._мчИстория.length; --ы >= 0; ) {
        узФрагмент.appendChild(document.createElement("td")).className =
          "анализ-история статистика-подробно";
      }
      this._узТаблица.textContent = "";
      this._узТаблица.appendChild(узФрагмент);
    }
    _ВСтроку(чЧисло) {
      return Number.isFinite(чЧисло)
        ? чЧисло.toFixed(чЧисло < 100 ? this._чТочность : 0)
        : " ";
    }
  }
  function ОбновитьЗначение(пЭлемент, пЗначение, лВыделить) {
    const узЭлемент = Узел(пЭлемент);
    узЭлемент.classList.toggle("статистика-выделить", лВыделить);
    узЭлемент.textContent = пЗначение;
    return узЭлемент;
  }
  function ПолучитьНазваниеПрофиляH264(nProfileIndication, nConstraintSetFlag) {
    switch (nProfileIndication) {
      case 66:
        return (nConstraintSetFlag & 64) == 0
          ? "Baseline"
          : "Constrained Baseline";

      case 77:
        return "Main";

      case 88:
        return "Extended";

      case 100:
        switch (nConstraintSetFlag & 12) {
          case 8:
            return "Progressive High";

          case 12:
            return "Constrained High";
        }
        return "High";

      case 110:
        return (nConstraintSetFlag & 16) == 0 ? "High 10" : "High 10 Intra";

      case 122:
        return (nConstraintSetFlag & 16) == 0
          ? "High 4:2:2"
          : "High 4:2:2 Intra";

      case 244:
        return (nConstraintSetFlag & 16) == 0
          ? "High 4:4:4 Predictive"
          : "High 4:4:4 Intra";

      case 44:
        return "CAVLC 4:4:4 Intra";
    }
    м_Журнал.Ой(
      `[Статистика] Неизвестный профиль H.264 ProfileIndication=${nProfileIndication} ConstraintSetFlag=${nConstraintSetFlag}`
    );
    return `P${nProfileIndication}C${nConstraintSetFlag}`;
  }
  function ОбновитьСтатистику() { // function UpdateStatistics() {
    document.getElementById("статистика-длительностьпросмотра").textContent = // document.getElementById("statistics-viewingduration").textContent =
      м_i18n.ПеревестиСекундыВСтроку(performance.now() / 1e3, true); // m_i18n.ConvertSecondsToString(performance.now() / 1e3, true);
    const { droppedVideoFrames, totalVideoFrames } =
      м_Проигрыватель.ПолучитьКоличествоПропущенныхКадров(); // m_Player.GetDroppedFramesCount();
    ОбновитьЗначение( // UpdateValue(
      "статистика-пропущено", // "statistics-dropped",
      droppedVideoFrames,
      droppedVideoFrames >= ВЫДЕЛИТЬ_ПРОПУЩЕННЫЕ_КАДРЫ // droppedVideoFrames >= HIGHLIGHT_DROPPED_FRAMES
    ).nextElementSibling.nextElementSibling.textContent = totalVideoFrames;
    let чЖдетЗагрузки = 0, // let nWaitingForDownload = 0,
      чЗагружается = 0, // nDownloading = 0,
      кПреобразовано = 0, // nConvertedCount = 0,
      чПреобразовано = 0; // nConvertedDuration = 0;
    for (let оСегмент of г_моОчередь) { // for (let oSegment of g_aoQueue) {
      switch (оСегмент.чОбработка) { // switch (oSegment.nProcessing) {
        case ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ: // case PROCESSING_WAITING_FOR_DOWNLOAD:
          чЖдетЗагрузки += оСегмент.чДлительность; // nWaitingForDownload += oSegment.nDuration;
          break;

        case ОБРАБОТКА_ЗАГРУЖАЕТСЯ: // case PROCESSING_DOWNLOADING:
        case ОБРАБОТКА_ЗАГРУЖЕН: // case PROCESSING_DOWNLOADED:
          чЗагружается += оСегмент.чДлительность; // nDownloading += oSegment.nDuration;
          break;

        case ОБРАБОТКА_ПРЕОБРАЗОВАН: // case PROCESSING_CONVERTED:
          кПреобразовано++;
          чПреобразовано += оСегмент.чДлительность; // nConvertedDuration += oSegment.nDuration;
          break;

        default:
          Проверить(false); // Check(false);
      }
    }
    const { чПросмотрено, чНеПросмотрено } = // const { nWatched, nNotWatched } =
      м_Проигрыватель.ПолучитьЗаполненностьБуфера(); // m_Player.GetBufferFullness();
    let уз = ОбновитьЗначение( // let node = UpdateValue(
      "статистика-очередь", // "statistics-queue",
      чЖдетЗагрузки.toFixed(1), // nWaitingForDownload.toFixed(1),
      чЖдетЗагрузки > м_Настройки.Получить("чМаксРазмерБуфера") // nWaitingForDownload > m_Settings.Get("nMaxBufferSize")
    );
    уз = уз.nextElementSibling.nextElementSibling;
    уз.textContent = чЗагружается.toFixed(1); // node.textContent = nDownloading.toFixed(1);
    уз = уз.nextElementSibling;
    ОбновитьЗначение( // UpdateValue(
      уз, // node,
      чПреобразовано.toFixed(1), // nConvertedDuration.toFixed(1),
      кПреобразовано >= ВЫДЕЛИТЬ_ПРЕОБРАЗОВАНО // nConvertedCount >= HIGHLIGHT_CONVERTED
    );
    уз = уз.nextElementSibling;
    ОбновитьЗначение( // UpdateValue(
      уз, // node,
      чНеПросмотрено.toFixed(1), // nNotWatched.toFixed(1),
      ВыделитьНеПросмотрено(чНеПросмотрено) // HighlightNotWatched(nNotWatched)
    );
    уз = уз.nextElementSibling.nextElementSibling;
    уз.textContent = чПросмотрено.toFixed(1); // node.textContent = nWatched.toFixed(1);
  }
  function ОкноОткрыто() {
    return _чТаймер !== 0;
  }
  function ОткрытьОкно() {
    if (ОкноОткрыто()) {
      return;
    }
    _оИнтервалОбновления = new Анализ(
      "статистика-интервалобновления",
      РАЗМЕР_ИСТОРИИ_СПИСКА,
      1
    );
    _оСегментовДобавлено = new Анализ(
      "статистика-сегментовдобавлено",
      РАЗМЕР_ИСТОРИИ_СПИСКА,
      0
    );
    _оСекундДобавлено = new Анализ(
      "статистика-секунддобавлено",
      РАЗМЕР_ИСТОРИИ_СПИСКА,
      1
    );
    _оТолщинаСегмента = new Анализ(
      "статистика-толщинасегмента",
      РАЗМЕР_ИСТОРИИ_ЗАГРУЗКИ,
      1
    );
    _оТолщинаКанала = new Анализ(
      "статистика-толщинаканала",
      РАЗМЕР_ИСТОРИИ_ЗАГРУЗКИ,
      1
    );
    _оОжиданиеОтвета = new Анализ(
      "статистика-ожиданиеответа",
      РАЗМЕР_ИСТОРИИ_ЗАГРУЗКИ,
      1
    );
    _оНеПросмотрено = new Анализ(
      "статистика-непросмотрено",
      РАЗМЕР_ИСТОРИИ_БУФЕРА,
      1
    );
    _чВремяПоследнегоОбновления = NaN;
    Узел("статистика-количестворекламы").textContent = _кКоличествоРекламы;
    Узел("статистика-частотарекламы").textContent = получитьЧастотуРекламы();
    Узел("статистика-исходных").textContent = _кИсходныхСегментов;
    ОбновитьЗначение(
      "статистика-забракованных",
      _кЗабракованныхСегментов,
      _кЗабракованныхСегментов !== 0
    );
    ОбновитьЗначение(
      "статистика-ошибокзагрузки",
      _кОшибокЗагрузки,
      _кОшибокЗагрузки !== 0
    );
    ОбновитьЗначение(
      "статистика-пропущенныхсегментов",
      _кПропущенныхСегментов,
      _кПропущенныхСегментов !== 0
    );
    Узел("статистика-незагруженныхсегментов").textContent =
      _кНезагруженныхСегментов;
    ОбновитьЗначение(
      "статистика-потерьвидео",
      _кПотерьВидео,
      _кПотерьВидео !== 0
    );
    ОбновитьЗначение(
      "статистика-потерьзвука",
      _кПотерьЗвука,
      _кПотерьЗвука !== 0
    );
    ОбновитьЗначение(
      "статистика-исчерпано",
      _кИсчерпанийБуфера,
      _кИсчерпанийБуфера >= ВЫДЕЛИТЬ_ИСЧЕРПАНИЕ_БУФЕРА
    );
    ОбновитьЗначение(
      "статистика-переполнено",
      _кПереполненийБуфера,
      _кПереполненийБуфера !== 0
    ).nextElementSibling.nextElementSibling.textContent =
      _чПропущеноВБуфере.toFixed(1);
    _чТаймер = setInterval(
      ДобавитьОбработчикИсключений(ОбновитьСтатистику),
      1e3 / ЧАСТОТА_ОБНОВЛЕНИЯ_СТАТИСТИКИ
    );
    ОбновитьСтатистику();
    м_События.ДобавитьОбработчик(
      "тащилка-перетаскивание-статистика",
      ОбработатьПеретаскиваниеОкна
    );
    ПоказатьЭлемент("статистика", true);
    м_Настройки.Изменить("лПоказатьСтатистику", true);
  }
  function ЗакрытьОкно() {
    if (!ОкноОткрыто()) {
      return;
    }
    ПоказатьЭлемент("статистика", false);
    _оИнтервалОбновления.Освободить();
    _оИнтервалОбновления = null;
    _оСегментовДобавлено.Освободить();
    _оСегментовДобавлено = null;
    _оСекундДобавлено.Освободить();
    _оСекундДобавлено = null;
    _оТолщинаСегмента.Освободить();
    _оТолщинаСегмента = null;
    _оТолщинаКанала.Освободить();
    _оТолщинаКанала = null;
    _оОжиданиеОтвета.Освободить();
    _оОжиданиеОтвета = null;
    _оНеПросмотрено.Освободить();
    _оНеПросмотрено = null;
    for (let уз of document.querySelectorAll("[data-очистить]")) {
      уз.textContent = "";
    }
    clearInterval(_чТаймер);
    _чТаймер = 0;
    м_Настройки.Изменить("лПоказатьСтатистику", false);
  }
  function ОбработатьПеретаскиваниеОкна(оПараметры) {
    switch (оПараметры.чШаг) {
      case 1:
        const оСтиль = getComputedStyle(оПараметры.узТащится);
        оПараметры._чНачальнаяX = Number.parseInt(оСтиль.left, 10);
        оПараметры._чНачальнаяY = Number.parseInt(оСтиль.top, 10);
        break;

      case 2:
        оПараметры.узТащится.style.setProperty(
          "--x",
          `${оПараметры._чНачальнаяX + оПараметры.чИзменениеX}px`
        );
        оПараметры.узТащится.style.setProperty(
          "--y",
          `${оПараметры._чНачальнаяY + оПараметры.чИзменениеY}px`
        );
        break;

      case 3:
        break;

      default:
        Проверить(false);
    }
  }
  function Запустить() {
    if (м_Настройки.Получить("лПоказатьСтатистику")) {
      ОткрытьОкно();
    }
  }
  function ОчиститьИсторию() {
    if (_оИнтервалОбновления !== null) {
      _оИнтервалОбновления.Очистить();
      _оСегментовДобавлено.Очистить();
      _оСекундДобавлено.Очистить();
      _оТолщинаСегмента.Очистить();
      _оТолщинаКанала.Очистить();
      _оОжиданиеОтвета.Очистить();
      _оНеПросмотрено.Очистить();
      _чВремяПоследнегоОбновления = NaN;
    }
    ОбновитьЗначение(
      "статистика-ошибокзагрузки",
      (_кОшибокЗагрузки = 0),
      false
    );
    ОбновитьЗначение(
      "статистика-пропущенныхсегментов",
      (_кПропущенныхСегментов = 0),
      false
    );
    Узел("статистика-незагруженныхсегментов").textContent =
      _кНезагруженныхСегментов = 0;
    ОбновитьЗначение("статистика-исчерпано", (_кИсчерпанийБуфера = 0), false);
    ОбновитьЗначение(
      "статистика-переполнено",
      (_кПереполненийБуфера = 0),
      false
    ).nextElementSibling.nextElementSibling.textContent =
      (_чПропущеноВБуфере = 0).toFixed(1);
  }
  function ПолучитьTargetDuration() {
    return _nTargetDuration;
  }
  function ПолучитьДлительностьКадраВСекундах() {
    return {
      чМинимальная: Math.max(17, _чМинДлительностьВидеосемпла) / 1e3,
      чМаксимальная: Math.min(1e3 / 25, _чМаксДлительностьВидеосемпла) / 1e3,
    };
  }
  function ПолучитьДанныеДляОтчета() {
    return {
      ПараметрыВидео:
        Узел("статистика-разрешениевидео").textContent +
        " " +
        Узел("статистика-сжатиевидео").textContent,
      ПараметрыЗвука: Узел("статистика-сжатиезвука").textContent,
      ЗабракованныхСегментов: _кЗабракованныхСегментов,
      ПропущенныхСегментов: _кПропущенныхСегментов,
      ОшибокЗагрузки: _кОшибокЗагрузки,
      НезагруженныхСегментов: _кНезагруженныхСегментов,
      ПотерьВидео: _кПотерьВидео,
      ПотерьЗвука: _кПотерьЗвука,
      ИсчерпанийБуфера: _кИсчерпанийБуфера,
      ИсчерпанийБуфераДосрочно: _кИсчерпанийБуфераДосрочно,
      ПереполненийБуфера: _кПереполненийБуфера,
      ПропущеноВБуфере: _чПропущеноВБуфере,
      Реклама: `${_кКоличествоРекламы} ${получитьЧастотуРекламы()}`,
    };
  }
  function РазобранСписокСегментов(оСписок) {
    _nTargetDuration = оСписок.nTargetDuration;
    if (ОкноОткрыто()) {
      if (оСписок.моСегменты.length !== 0) {
        Узел("статистика-сервер").textContent = new URL(
          оСписок.моСегменты[оСписок.моСегменты.length - 1].сАдрес
        ).host;
      }
      const чДлительностьСписка = оСписок.моСегменты.reduce(
        (чСумма, { чДлительность }) => чСумма + чДлительность,
        0
      );
      Узел("статистика-список").textContent = `${
        оСписок.моСегменты.length
      } × ${(чДлительностьСписка / оСписок.моСегменты.length).toFixed(
        1
      )} = ${чДлительностьСписка.toFixed(1)} − ${оСписок.кРекламныхСегментов}`;
      Узел("статистика-targetduration").textContent = оСписок.nTargetDuration;
    }
  }
  function ДобавленыСегментыВОчередь(кСегментовДобавлено, кСекундДобавлено) {
    if (ОкноОткрыто()) {
      const чВремя = performance.now();
      _оИнтервалОбновления.ДобавитьЧисло(
        (чВремя - _чВремяПоследнегоОбновления) / 1e3
      );
      _чВремяПоследнегоОбновления = чВремя;
      _оСегментовДобавлено.ДобавитьЧисло(
        кСегментовДобавлено,
        ВыделитьСегментовДобавлено,
        ВыделитьСегментовДобавлено
      );
      _оСекундДобавлено.ДобавитьЧисло(кСекундДобавлено);
    }
  }
  function ПолученИсходныйСегмент() {
    ++_кИсходныхСегментов;
    if (ОкноОткрыто()) {
      document.getElementById("статистика-исходных").textContent =
        _кИсходныхСегментов;
    }
  }
  function ЗабракованСегмент() {
    ++_кЗабракованныхСегментов;
    if (ОкноОткрыто()) {
      ОбновитьЗначение(
        "статистика-забракованных",
        _кЗабракованныхСегментов,
        true
      );
    }
  }
  function СкачаноНечто(кбСкачано) {
    if (Number.isFinite(кбСкачано)) {
      _кбВсегоСкачано += кбСкачано;
      if (ОкноОткрыто()) {
        document.getElementById("статистика-скачано").textContent = (
          _кбВсегоСкачано /
          1024 /
          1024
        ).toFixed();
      }
    }
  }
  function ЗагруженСегмент(
    чРазмерСегмента,
    чДлительностьСегмента,
    чДлительностьЗагрузки,
    чОжиданиеОтвета
  ) {
    if (ОкноОткрыто()) {
      const чСредняяТолщинаСегмента = _оТолщинаСегмента.ДобавитьЧисло(
        (чРазмерСегмента * 8) / 1e6 / чДлительностьСегмента
      );
      чДлительностьЗагрузки /= 1e3;
      _оТолщинаКанала.ДобавитьЧисло(
        (чРазмерСегмента * 8) / 1e6 / чДлительностьЗагрузки,
        чДлительностьЗагрузки > чДлительностьСегмента,
        (чЧисло) => чЧисло < чСредняяТолщинаСегмента
      );
      _оОжиданиеОтвета.ДобавитьЧисло(
        чОжиданиеОтвета / 1e3,
        ВыделитьОжиданиеОтвета,
        ВыделитьОжиданиеОтвета
      );
    }
  }
  function НеЗагруженыСегменты(кНезагруженныхСегментов) {
    Проверить(кНезагруженныхСегментов > 0);
    _кОшибокЗагрузки++;
    _кНезагруженныхСегментов += кНезагруженныхСегментов;
    if (ОкноОткрыто()) {
      ОбновитьЗначение("статистика-ошибокзагрузки", _кОшибокЗагрузки, true);
      Узел("статистика-незагруженныхсегментов").textContent =
        _кНезагруженныхСегментов;
    }
  }
  function пропущеныСегменты(кПропущенныхСегментов) {
    Проверить(кПропущенныхСегментов > 0);
    _кПропущенныхСегментов++;
    _кНезагруженныхСегментов += кПропущенныхСегментов;
    if (ОкноОткрыто()) {
      ОбновитьЗначение(
        "статистика-пропущенныхсегментов",
        _кПропущенныхСегментов,
        true
      );
      Узел("статистика-незагруженныхсегментов").textContent =
        _кНезагруженныхСегментов;
    }
  }
  function ПолученПреобразованныйСегмент(оСегмент) {
    const лОкноОткрыто = ОкноОткрыто();
    const оДанные = оСегмент.пДанные;
    if (оДанные.hasOwnProperty("мбМедиасегмент")) {
      if (оСегмент.лРазрыв) {
        if (оДанные.лЕстьВидео) {
          let сСжатиеВидео =
            "H.264" +
            ` ${ПолучитьНазваниеПрофиляH264(
              оДанные.nProfileIndication,
              оДанные.nConstraintSetFlag
            )}` +
            ` L${(оДанные.nLevelIndication / 10).toFixed(1)}` +
            ` RF${оДанные.nMaxNumberReferenceFrames}`;
          if (оДанные.чДиапазон !== -1) {
            сСжатиеВидео += оДанные.чДиапазон === 0 ? " 16-235" : " 0-255";
          }
          if (оДанные.лЧересстрочное) {
            сСжатиеВидео += " чересстрочное";
          }
          if (оДанные.чЧастотаКадров !== 0) {
            сСжатиеВидео += ` ${
              оДанные.чЧастотаКадров < 0 ? "≈" : ""
            }${Math.abs(оДанные.чЧастотаКадров).toFixed(2)} ${Текст("J0140")}`;
          }
          Узел("статистика-сжатиевидео").textContent = сСжатиеВидео;
          Узел(
            "статистика-разрешениевидео"
          ).textContent = `${оДанные.чШиринаКартинки}x${оДанные.чВысотаКартинки}`;
        } else {
          Узел("статистика-сжатиевидео").textContent = "—";
          Узел("статистика-разрешениевидео").textContent = "—";
        }
        Узел("статистика-частотакадров").textContent = "";
        if (оДанные.лЕстьЗвук) {
          Узел("статистика-сжатиезвука").textContent =
            ["AAC-Main", "AAC-LC", "AAC-SSR", "AAC-LTP"][
              оДанные.nAudioObjectType - 1
            ] +
            ` ${оДанные.чЧастотаДискретизации} ${Текст("J0141")}` +
            ` ${оДанные.чКоличествоКаналов} ${Текст("J0142")}`;
        } else {
          Узел("статистика-сжатиезвука").textContent = "—";
        }
        Узел("статистика-битрейтзвука").textContent = "";
      }
      if (Number.isFinite(оДанные.чСредняяДлительностьВидеоСемпла)) {
        _чМинДлительностьВидеосемпла = оДанные.чМинДлительностьВидеоСемпла;
        _чМаксДлительностьВидеосемпла = оДанные.чМаксДлительностьВидеоСемпла;
        Проверить(
          _чМинДлительностьВидеосемпла <= _чМаксДлительностьВидеосемпла
        );
        const чОтносительноеОтклонение =
          оДанные.чСредняяДлительностьВидеоСемпла /
          оДанные.чМаксДлительностьВидеоСемпла;
        const чАбсолютноеОтклонение =
          оДанные.чМаксДлительностьВидеоСемпла -
          оДанные.чСредняяДлительностьВидеоСемпла;
        if (
          чОтносительноеОтклонение <= ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_ОТН &&
          чАбсолютноеОтклонение >= ВЫДЕЛИТЬ_ПОТЕРЮ_ВИДЕО_АБС
        ) {
          м_Журнал.Ой(
            `[Статистика] Превышено отклонение длительности кадра в сегменте ${оСегмент.чНомер}` +
              ` СредняяДлительностьКадра=${м_Журнал.F0(
                оДанные.чСредняяДлительностьВидеоСемпла
              )}мс` +
              ` АбсолютноеОтклонение=${м_Журнал.F0(чАбсолютноеОтклонение)}мс` +
              ` ОтносительноеОтклонение=${м_Журнал.F2(
                чОтносительноеОтклонение
              )}`
          );
          оДанные.лПотериВидео = true;
        }
        if (лОкноОткрыто) {
          let сОтклонение = `@${(
            1e3 / оДанные.чСредняяДлительностьВидеоСемпла
          ).toFixed(1)}`;
          if (
            оДанные.чМаксДлительностьВидеоСемпла -
              оДанные.чМинДлительностьВидеоСемпла >
            2
          ) {
            сОтклонение +=
              ` −${(
                100 -
                (оДанные.чСредняяДлительностьВидеоСемпла /
                  оДанные.чМаксДлительностьВидеоСемпла) *
                  100
              ).toFixed()}%` +
              ` +${(
                (оДанные.чСредняяДлительностьВидеоСемпла /
                  оДанные.чМинДлительностьВидеоСемпла) *
                  100 -
                100
              ).toFixed()}%`;
          }
          ОбновитьЗначение(
            "статистика-частотакадров",
            сОтклонение,
            чОтносительноеОтклонение <= ВЫДЕЛИТЬ_ЧАСТОТУ_КАДРОВ
          );
        }
      }
      if (Number.isFinite(оДанные.чБитрейтЗвука) && лОкноОткрыто) {
        Узел(
          "статистика-битрейтзвука"
        ).textContent = `${оДанные.чБитрейтЗвука.toFixed()} ${Текст("J0143")}`;
      }
    }
    if (ЭтоЧисло(оДанные.чПреобразованЗа) && лОкноОткрыто) {
      Узел("статистика-преобразованза").textContent =
        оДанные.чПреобразованЗа.toFixed();
    }
    if (оДанные.лЗабраковано) {
      ЗабракованСегмент();
    }
    if (оДанные.лПотериВидео) {
      ++_кПотерьВидео;
      if (лОкноОткрыто) {
        ОбновитьЗначение("статистика-потерьвидео", _кПотерьВидео, true);
      }
    }
    if (оДанные.лПотериЗвука) {
      ++_кПотерьЗвука;
      if (лОкноОткрыто) {
        ОбновитьЗначение("статистика-потерьзвука", _кПотерьЗвука, true);
      }
    }
  }
  function обновитьЗаполненностьБуфера(чНеПросмотрено) {
    if (ОкноОткрыто()) {
      _оНеПросмотрено.ДобавитьЧисло(
        чНеПросмотрено,
        ВыделитьНеПросмотрено,
        ВыделитьНеПросмотрено
      );
    }
  }
  function ИсчерпанБуферПроигрывателя(лДосрочно) {
    ++_кИсчерпанийБуфера;
    if (лДосрочно) {
      ++_кИсчерпанийБуфераДосрочно;
    }
    if (ОкноОткрыто()) {
      ОбновитьЗначение(
        "статистика-исчерпано",
        _кИсчерпанийБуфера,
        _кИсчерпанийБуфера >= ВЫДЕЛИТЬ_ИСЧЕРПАНИЕ_БУФЕРА
      );
    }
  }
  function получитьЧастотуРекламы() {
    let сРезультат = "";
    for (let ы = 0; ы < _мчНачалоРекламы.length; ++ы) {
      if (ы !== 0) {
        сРезультат += ` <${(
          (_мчНачалоРекламы[ы] - _мчКонецРекламы[ы - 1]) /
          1e3
        ).toFixed()}> `;
      }
      if (ы < _мчКонецРекламы.length) {
        сРезультат += (
          (_мчКонецРекламы[ы] - _мчНачалоРекламы[ы]) /
          1e3
        ).toFixed();
      } else {
        сРезультат += "?";
      }
    }
    return сРезультат;
  }
  м_События.ДобавитьОбработчик("список-началорекламы", () => {
    Проверить(_мчНачалоРекламы.length === _мчКонецРекламы.length);
    _кКоличествоРекламы++;
    _мчНачалоРекламы.push(performance.now());
    if (ОкноОткрыто()) {
      Узел("статистика-количестворекламы").textContent = _кКоличествоРекламы;
      Узел("статистика-частотарекламы").textContent = получитьЧастотуРекламы();
    }
  });
  м_События.ДобавитьОбработчик("список-конецрекламы", () => {
    if (_мчНачалоРекламы.length !== _мчКонецРекламы.length) {
      if (_мчКонецРекламы.length === РАЗМЕР_ИСТОРИИ_РЕКЛАМЫ) {
        _мчНачалоРекламы.shift();
        _мчКонецРекламы.shift();
      }
      _мчКонецРекламы.push(performance.now());
      if (ОкноОткрыто()) {
        Узел("статистика-частотарекламы").textContent =
          получитьЧастотуРекламы();
      }
    }
  });
  м_События.ДобавитьОбработчик(
    "проигрыватель-переполненбуфер",
    (чПропущено) => {
      ++_кПереполненийБуфера;
      _чПропущеноВБуфере += чПропущено;
      if (ОкноОткрыто()) {
        ОбновитьЗначение(
          "статистика-переполнено",
          _кПереполненийБуфера,
          true
        ).nextElementSibling.nextElementSibling.textContent =
          _чПропущеноВБуфере.toFixed(1);
      }
    }
  );
  м_События.ДобавитьОбработчик(
    "управление-изменилосьсостояние",
    (чСостояние) => {
      if (чСостояние === СОСТОЯНИЕ_ЗАПУСК) {
        ОчиститьИсторию();
      }
    }
  );
  м_События.ДобавитьОбработчик(
    "список-выбранварианттрансляции",
    ([моВарианты]) => {
      if (моВарианты) {
        ОчиститьИсторию();
      }
    }
  );
  return {
    Запустить,
    ОкноОткрыто,
    ОткрытьОкно,
    ЗакрытьОкно,
    ОбновитьЗначение,
    ОчиститьИсторию,
    ПолучитьTargetDuration,
    ПолучитьДлительностьКадраВСекундах,
    ПолучитьДанныеДляОтчета,
    РазобранСписокСегментов,
    ДобавленыСегментыВОчередь,
    ПолученИсходныйСегмент,
    ЗабракованСегмент,
    СкачаноНечто,
    ЗагруженСегмент,
    НеЗагруженыСегменты,
    пропущеныСегменты,
    ПолученПреобразованныйСегмент,
    обновитьЗаполненностьБуфера,
    ИсчерпанБуферПроигрывателя,
  };
})();

const м_Окно = (() => {
  function получитьОткрытое() {
    return document.body.getAttribute("data-окно-открыто") || "";
  }
  function открытьОкно(сИдОкна) {
    const элОкно = Узел(сИдОкна);
    Проверить(элОкно.classList.contains("окно"));
    элОкно.classList.add("окнооткрыто", "анимацияокна");
    document.body.setAttribute("data-окно-открыто", сИдОкна);
    м_События.ПослатьСобытие(`окно-открыто-${сИдОкна}`);
  }
  function закрытьОкно(сИдОкна, лСАнимацией = true) {
    const элОкно = Узел(сИдОкна);
    Проверить(элОкно.classList.contains("окно"));
    элОкно.classList.remove("окнооткрыто");
    элОкно.classList.toggle("анимацияокна", лСАнимацией);
    document.body.removeAttribute("data-окно-открыто");
  }
  function открыть(сИдОкна) {
    Проверить(ЭтоНепустаяСтрока(сИдОкна));
    const сИдОткрытогоОкна = получитьОткрытое();
    if (сИдОкна === сИдОткрытогоОкна) {
      return false;
    }
    if (сИдОткрытогоОкна) {
      закрытьОкно(сИдОткрытогоОкна);
    }
    открытьОкно(сИдОкна);
    return true;
  }
  function закрыть(лСАнимацией = true) {
    const сИдОткрытогоОкна = получитьОткрытое();
    if (сИдОткрытогоОкна) {
      закрытьОкно(сИдОткрытогоОкна, лСАнимацией);
    }
  }
  function переключить(сИдОкна) {
    открыть(сИдОкна) || закрытьОкно(сИдОкна);
  }
  function настроитьИндикаторПрокрутки(пПрокрутка) {
    const элПрокрутка = Узел(пПрокрутка);
    элПрокрутка.scrollTop = 0;
    обновитьИндикаторПрокрутки(элПрокрутка);
  }
  function обновитьИндикаторПрокрутки(элПрокрутка) {
    const лПоказать = !этотЭлементПолностьюПрокручен(элПрокрутка);
    ПоказатьЭлемент(Узел(`индикаторпрокрутки-${элПрокрутка.id}`), лПоказать);
    элПрокрутка[лПоказать ? "addEventListener" : "removeEventListener"](
      "scroll",
      обработатьПрокрутку
    );
  }
  const обработатьПрокрутку = ДобавитьОбработчикИсключений((оСобытие) => {
    обновитьИндикаторПрокрутки(оСобытие.target);
  });
  м_События.ДобавитьОбработчик(
    "управление-левыйщелчок",
    ({ target: элЩелчок }) => {
      const сИдОкна = элЩелчок.getAttribute("data-окно-переключить");
      if (сИдОкна) {
        переключить(сИдОкна);
        return;
      }
      const сИдОткрытогоОкна = получитьОткрытое();
      if (
        сИдОткрытогоОкна &&
        !Узел(сИдОткрытогоОкна).contains(элЩелчок) &&
        Узел("проигрыватель").contains(элЩелчок)
      ) {
        закрытьОкно(сИдОткрытогоОкна);
      }
    }
  );
  return {
    открыть,
    закрыть,
    переключить,
    настроитьИндикаторПрокрутки,
  };
})();

const м_Меню = (() => {
  function задатьДоступностьПункта(пПункт, лДоступен) {
    Узел(пПункт).tabIndex = лДоступен ? 0 : -1;
  }
  Узел("глаз").addEventListener("contextmenu", (оСобытие) => {
    оСобытие.preventDefault();
    м_Окно.переключить("главноеменю");
  });
  м_События.ДобавитьОбработчик("управление-левыйщелчок", (оСобытие) => {
    if (оСобытие.target.classList.contains("меню-пункт")) {
      м_Окно.закрыть(false);
    }
  });
  return {
    задатьДоступностьПункта,
  };
})();

const м_ПолноэкранныйРежим = (() => {
  let _sRequestFullscreen = "requestFullscreen";
  let _sExitFullscreen = "exitFullscreen";
  let _sFullscreenElement = "fullscreenElement";
  let _sFullscreenchange = "fullscreenchange";
  if (!document.exitFullscreen) {
    _sRequestFullscreen = "webkitRequestFullscreen";
    _sExitFullscreen = "webkitExitFullscreen";
    _sFullscreenElement = "webkitFullscreenElement";
    _sFullscreenchange = "webkitfullscreenchange";
  }
  const ОбработатьИзменениеРежима = ДобавитьОбработчикИсключений(() => {
    м_События.ПослатьСобытие("полноэкранныйрежим-изменен", Обновить());
  });
  const ОбработатьДвойнойЩелчок = ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.button === ЛЕВАЯ_КНОПКА) {
      оСобытие.preventDefault();
      Переключить();
    }
  });
  function ПолучитьЭлемент() {
    return Узел("проигрывательичат");
  }
  function Включен() {
    return !!document[_sFullscreenElement];
  }
  function Обновить() {
    const лВключен = Включен();
    м_Журнал.Окак(`[ПолноэкранныйРежим] Режим включен: ${лВключен}`);
    ИзменитьКнопку("переключитьполноэкранный", лВключен);
    return лВключен;
  }
  function Включить() {
    if (Включен()) {
      return false;
    }
    м_Журнал.Вот("[ПолноэкранныйРежим] Включаю режим");
    м_Автоскрытие.Скрыть(false);
    м_КартинкаВКартинке.отключить();
    ПолучитьЭлемент()[_sRequestFullscreen]();
    return true;
  }
  function Отключить() {
    if (!Включен()) {
      return false;
    }
    м_Журнал.Вот("[ПолноэкранныйРежим] Отключаю режим");
    м_Автоскрытие.Скрыть(false);
    document[_sExitFullscreen]();
    return true;
  }
  function Переключить() {
    Включить() || Отключить();
  }
  document.addEventListener(_sFullscreenchange, ОбработатьИзменениеРежима);
  Узел("глаз").addEventListener("dblclick", ОбработатьДвойнойЩелчок);
  Обновить();
  return {
    Включен,
    Отключить,
    Переключить,
    ПолучитьЭлемент,
  };
})();

const м_КартинкаВКартинке = (() => {
  let _oMediaElement = null;
  const обработатьИзменениеРежима = ДобавитьОбработчикИсключений(() => {
    обновить();
  });
  function включен() {
    return Boolean(document.pictureInPictureElement);
  }
  function обновить() {
    const лВключен = включен();
    м_Журнал.Окак(`[КартинкаВКартинке] Режим включен: ${лВключен}`);
    ИзменитьКнопку("переключитькартинкавкартинке", лВключен);
  }
  function включить() {
    if (включен()) {
      return false;
    }
    м_Журнал.Вот("[КартинкаВКартинке] Включаю режим");
    м_ПолноэкранныйРежим.Отключить();
    _oMediaElement.requestPictureInPicture();
    return true;
  }
  function отключить() {
    if (!включен()) {
      return false;
    }
    м_Журнал.Вот("[КартинкаВКартинке] Отключаю режим");
    document.exitPictureInPicture();
    return true;
  }
  function переключить() {
    _oMediaElement &&
      !document.body.classList.contains("нетвидео") &&
      (включить() || отключить());
  }
  function запустить(oMediaElement) {
    if (
      !document.pictureInPictureEnabled ||
      oMediaElement.disablePictureInPicture
    ) {
      м_Журнал.Ой(
        `[КартинкаВКартинке] pictureInPictureEnabled=${document.pictureInPictureEnabled} disablePictureInPicture=${oMediaElement.disablePictureInPicture}`
      );
      return;
    }
    _oMediaElement = oMediaElement;
    oMediaElement.addEventListener(
      "enterpictureinpicture",
      обработатьИзменениеРежима
    );
    oMediaElement.addEventListener(
      "leavepictureinpicture",
      обработатьИзменениеРежима
    );
    обновить();
    ПоказатьЭлемент("переключитькартинкавкартинке", true);
  }
  return {
    запустить,
    отключить,
    переключить,
  };
})();

const м_Тащилка = (() => {
  const МИН_ИНТЕРВАЛ_ПЕРЕТАСКИВАНИЯ = 45;
  let _чИдУказателя = NaN;
  let _оПараметры = null;
  let _чВремяПоследнегоПеретаскивания;
  let _чНачальнаяX, _чНачальнаяY;
  let _чПоследняяX, _чПоследняяY;
  function Параметры(узНажат, узТащится) {
    this.узНажат = узНажат;
    this.узТащится = узТащится;
    this.чШаг = 1;
    this.лОтмена = false;
    this.лИзмениласьX = false;
    this.лИзмениласьY = false;
    this.чИзменениеX = 0;
    this.чИзменениеY = 0;
  }
  const ОбработатьPointerDown = создатьОбработчикСобытийЭлемента((оСобытие) => {
    if (!Number.isNaN(_чИдУказателя) || оСобытие.button !== ЛЕВАЯ_КНОПКА) {
      return;
    }
    const узНажат = оСобытие.target.closest("[data-тащилка]");
    if (узНажат === null) {
      return;
    }
    _чИдУказателя = оСобытие.pointerId;
    _оПараметры = new Параметры(
      узНажат,
      Узел(узНажат.getAttribute("data-тащилка"))
    );
    _чВремяПоследнегоПеретаскивания = 0;
    _чНачальнаяX = _чПоследняяX = оСобытие.clientX;
    _чНачальнаяY = _чПоследняяY = оСобытие.clientY;
    м_Журнал.Окак(
      `[Тащилка] Начинаю перетаскивать ${_оПараметры.узТащится.id} X=${_чНачальнаяX} Y=${_чНачальнаяY} id=${_чИдУказателя} type=${оСобытие.pointerType} primary=${оСобытие.isPrimary}`
    );
    document.addEventListener(
      "pointermove",
      ОбработатьPointerMove,
      ПАССИВНЫЙ_ОБРАБОТЧИК
    );
    document.addEventListener(
      "pointerup",
      ОбработатьPointerUpИPointerCancel,
      ПАССИВНЫЙ_ОБРАБОТЧИК
    );
    document.addEventListener(
      "pointercancel",
      ОбработатьPointerUpИPointerCancel
    );
    м_События.ДобавитьОбработчик(
      "фокусник-изменилосьсостояние",
      ОбработатьПокиданиеВкладки
    );
    м_ПолноэкранныйРежим
      .ПолучитьЭлемент()
      .style.setProperty(
        "cursor",
        getComputedStyle(узНажат).cursor,
        "important"
      );
    м_ПолноэкранныйРежим.ПолучитьЭлемент().classList.add("тащилка-перехват");
    _оПараметры.узТащится.classList.add("тащилка");
    м_События.ПослатьСобытие(
      `тащилка-перетаскивание-${_оПараметры.узТащится.id}`,
      _оПараметры
    );
  });
  const ОбработатьPointerMove = ДобавитьОбработчикИсключений((оСобытие) => {
    if (_чИдУказателя === оСобытие.pointerId) {
      if ((оСобытие.buttons & НАЖАТА_ЛЕВАЯ_КНОПКА) == 0) {
        ЗавершитьПеретаскивание("кнопка отпущена");
      } else {
        const чВремя = performance.now();
        if (
          чВремя - _чВремяПоследнегоПеретаскивания >=
          МИН_ИНТЕРВАЛ_ПЕРЕТАСКИВАНИЯ
        ) {
          _чВремяПоследнегоПеретаскивания = чВремя;
          _оПараметры.лИзмениласьX = _чПоследняяX !== оСобытие.clientX;
          _оПараметры.лИзмениласьY = _чПоследняяY !== оСобытие.clientY;
          if (_оПараметры.лИзмениласьX || _оПараметры.лИзмениласьY) {
            _чПоследняяX = оСобытие.clientX;
            _чПоследняяY = оСобытие.clientY;
            _оПараметры.чШаг = 2;
            _оПараметры.чИзменениеX = _чПоследняяX - _чНачальнаяX;
            _оПараметры.чИзменениеY = _чПоследняяY - _чНачальнаяY;
            м_События.ПослатьСобытие(
              `тащилка-перетаскивание-${_оПараметры.узТащится.id}`,
              _оПараметры
            );
          }
        }
      }
    }
  });
  const ОбработатьPointerUpИPointerCancel = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      if (_чИдУказателя === оСобытие.pointerId) {
        ЗавершитьПеретаскивание(оСобытие.type);
      }
    }
  );
  function ОбработатьПокиданиеВкладки({ лАктивен }) {
    if (!лАктивен) {
      ЗавершитьПеретаскивание("вкладка неактивна");
    }
  }
  function ОтменитьПеретаскивание(сИдУзла) {
    Проверить(сИдУзла === void 0 || ЭтоНепустаяСтрока(сИдУзла));
    if (
      !Number.isNaN(_чИдУказателя) &&
      (сИдУзла === void 0 || сИдУзла === _оПараметры.узТащится.id)
    ) {
      _оПараметры.лОтмена = true;
      ЗавершитьПеретаскивание("операция отменена");
    }
  }
  function ЗавершитьПеретаскивание(сПричина) {
    if (_оПараметры.чШаг !== 3) {
      м_Журнал.Окак(
        `[Тащилка] Заканчиваю перетаскивание: ${сПричина} X=${_чПоследняяX} Y=${_чПоследняяY}`
      );
      _оПараметры.чШаг = 3;
      м_События.ПослатьСобытие(
        `тащилка-перетаскивание-${_оПараметры.узТащится.id}`,
        _оПараметры
      );
      м_ПолноэкранныйРежим.ПолучитьЭлемент().style.removeProperty("cursor");
      м_ПолноэкранныйРежим
        .ПолучитьЭлемент()
        .classList.remove("тащилка-перехват");
      _оПараметры.узТащится.classList.remove("тащилка");
      document.removeEventListener(
        "pointermove",
        ОбработатьPointerMove,
        ПАССИВНЫЙ_ОБРАБОТЧИК
      );
      document.removeEventListener(
        "pointerup",
        ОбработатьPointerUpИPointerCancel,
        ПАССИВНЫЙ_ОБРАБОТЧИК
      );
      document.removeEventListener(
        "pointercancel",
        ОбработатьPointerUpИPointerCancel
      );
      м_События.УдалитьОбработчик(
        "фокусник-изменилосьсостояние",
        ОбработатьПокиданиеВкладки
      );
      _чИдУказателя = NaN;
      _оПараметры = null;
    }
  }
  document.addEventListener(
    "pointerdown",
    ОбработатьPointerDown,
    ПАССИВНЫЙ_ОБРАБОТЧИК
  );
  return {
    ОтменитьПеретаскивание,
  };
})();

const м_Автоскрытие = (() => {
  const МИН_ИНТЕРВАЛ_ДВИЖЕНИЯ = 150;
  const ПОРОГ_ДВИЖЕНИЯ = 3;
  const _узАвтоскрытие = document.getElementById("проигрыватель");
  let _чТаймер = 0;
  let _чСкрытьПосле = 0;
  let _чНеПоказыватьДо = 0;
  let _чЭкранX = 0,
    _чЭкранY = 0;
  let _чКлиентX = 0,
    _чКлиентY = 0;
  let _чИдТаймераВыбораСкорости = 0;
  function Показать() {
    if (_чТаймер === 0) {
      document.body.classList.remove("автоскрытие");
      document.body.classList.add("анимацияпанели");
      _чТаймер = setTimeout(
        обработатьТаймер,
        м_Настройки.Получить("чИнтервалАвтоскрытия") * 1e3
      );
      _чСкрытьПосле = _чНеПоказыватьДо = 0;
    } else {
      _чСкрытьПосле =
        performance.now() + м_Настройки.Получить("чИнтервалАвтоскрытия") * 1e3;
    }
  }
  function Скрыть(лСАнимацией = true) {
    if (_чТаймер !== 0) {
      clearTimeout(_чТаймер);
      _чТаймер = 0;
      document.body.classList.add("автоскрытие");
    }
    document.body.classList.toggle("анимацияпанели", лСАнимацией);
    if (!лСАнимацией) {
      document.body.clientTop;
      document.body.classList.add("анимацияпанели");
      _чНеПоказыватьДо = performance.now() + 500;
    }
  }
  const обработатьТаймер = ДобавитьОбработчикИсключений(() => {
    Проверить(_чТаймер !== 0);
    const чСкрытьЧерез = _чСкрытьПосле - performance.now();
    if (чСкрытьЧерез > 50) {
      _чТаймер = setTimeout(обработатьТаймер, чСкрытьЧерез);
      _чСкрытьПосле = 0;
    } else {
      Скрыть();
    }
  });
  const обработатьДвижениеУказателя = ДобавитьОбработчикИсключений(
    ({ screenX, screenY, clientX, clientY }) => {
      _узАвтоскрытие.removeEventListener(
        "pointermove",
        обработатьДвижениеУказателя,
        ПАССИВНЫЙ_ОБРАБОТЧИК
      );
      setTimeout(перехватитьДвижениеУказателя, МИН_ИНТЕРВАЛ_ДВИЖЕНИЯ);
      if (
        (_чЭкранX !== screenX || _чЭкранY !== screenY) &&
        (_чКлиентX !== clientX || _чКлиентY !== clientY) &&
        (Math.abs(_чКлиентX - clientX) >= ПОРОГ_ДВИЖЕНИЯ ||
          Math.abs(_чКлиентY - clientY) >= ПОРОГ_ДВИЖЕНИЯ) &&
        performance.now() >= _чНеПоказыватьДо
      ) {
        Показать();
      }
      _чЭкранX = screenX;
      _чЭкранY = screenY;
      _чКлиентX = clientX;
      _чКлиентY = clientY;
    }
  );
  const перехватитьДвижениеУказателя = ДобавитьОбработчикИсключений(() => {
    _узАвтоскрытие.addEventListener(
      "pointermove",
      обработатьДвижениеУказателя,
      ПАССИВНЫЙ_ОБРАБОТЧИК
    );
  });
  const обработатьЩелчок = ДобавитьОбработчикИсключений(() => {
    Показать();
  });
  const обработатьПокиданиеУказателя = ДобавитьОбработчикИсключений(() => {
    Скрыть();
  });
  const обработатьВыборСкорости = ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.button === ЛЕВАЯ_КНОПКА) {
      if (_чИдТаймераВыбораСкорости !== 0) {
        clearTimeout(_чИдТаймераВыбораСкорости);
      }
      _чИдТаймераВыбораСкорости = setTimeout(
        () => document.body.classList.remove("выборскорости"),
        5e3
      );
      document.body.classList.add("выборскорости");
    }
  });
  function Запустить() {
    перехватитьДвижениеУказателя();
    _узАвтоскрытие.addEventListener("click", обработатьЩелчок);
    _узАвтоскрытие.addEventListener("mouseleave", обработатьПокиданиеУказателя);
    Узел("скорость").addEventListener("pointerdown", обработатьВыборСкорости);
  }
  return {
    Запустить,
    Показать,
    Скрыть,
  };
})();

const м_Медиазапрос = (() => {
  let _чТаймер = -2;
  const обновить = ДобавитьОбработчикИсключений(() => {
    Проверить(_чТаймер !== 0);
    _чТаймер = 0;
    const элПроигрыватель = Узел("проигрыватель");
    const чВысотаПроигрывателя =
      (элПроигрыватель.clientHeight * 100) /
      м_Настройки.Получить("чРазмерИнтерфейса");
    Проверить(чВысотаПроигрывателя > 0);
    элПроигрыватель.classList.toggle(
      "ужатьглавноеменю",
      чВысотаПроигрывателя <= 460
    );
    элПроигрыватель.classList.toggle(
      "ужатьнастройки",
      чВысотаПроигрывателя <= 412
    );
    const РАЗМЕР_ШРИФТА_МИН = 100;
    const РАЗМЕР_ШРИФТА_МАКС = 124;
    const РАЗМЕР_ШРИФТА_ШАГ = 8;
    const оСтильПанели = Узел("верхняяпанель").style;
    const элЗаполнитель = Узел("заполнитель");
    for (
      let чРазмерШрифта = РАЗМЕР_ШРИФТА_МАКС;
      ;
      чРазмерШрифта -= РАЗМЕР_ШРИФТА_ШАГ
    ) {
      оСтильПанели.fontSize = `${чРазмерШрифта}%`;
      if (
        чРазмерШрифта === РАЗМЕР_ШРИФТА_МИН ||
        элЗаполнитель.clientWidth > 0
      ) {
        break;
      }
    }
  });
  function обновитьБыстро() {
    if (_чТаймер !== -1) {
      if (_чТаймер > 0) {
        clearTimeout(_чТаймер);
      }
      _чТаймер = -1;
      requestAnimationFrame(обновить);
    }
  }
  function обновитьМедленно() {
    if (_чТаймер === -2 || _чТаймер === 0) {
      _чТаймер = setTimeout(обновить, 200);
      Проверить(_чТаймер > 0);
    }
  }
  window.addEventListener(
    "resize",
    ДобавитьОбработчикИсключений(() => {
      if (_чТаймер !== -2) {
        обновитьМедленно();
      }
    })
  );
  return {
    обновитьБыстро,
    обновитьМедленно,
  };
})();

const м_Оформление = (() => {
  const СЕЛЕКТОР_КНОПКИ_ЦВЕТА = 'input[type="color"]';
  let _оПрозрачность = null;
  const ОбработатьВводЦвета = ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.target.matches(СЕЛЕКТОР_КНОПКИ_ЦВЕТА)) {
      ОбновитьСтили();
    }
  });
  const ОбработатьИзменениеЦвета = ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.target.matches(СЕЛЕКТОР_КНОПКИ_ЦВЕТА)) {
      м_Настройки.Изменить(оСобытие.target.id, оСобытие.target.value);
    }
  });
  function ОбработатьИзменениеПредустановкиОформления() {
    ОбновитьОкноНастроек();
    ОбновитьСтили();
  }
  function ОбновитьОкноНастроек() {
    for (let узКнопка of document.querySelectorAll(СЕЛЕКТОР_КНОПКИ_ЦВЕТА)) {
      узКнопка.value = м_Настройки.Получить(узКнопка.id);
    }
    _оПрозрачность.Обновить();
  }
  function ОбновитьСтили() {
    const оСтиль = document.documentElement.style;
    for (let узКнопка of document.querySelectorAll(СЕЛЕКТОР_КНОПКИ_ЦВЕТА)) {
      оСтиль.setProperty(
        `--${узКнопка.id}`,
        Number.parseInt(узКнопка.value.slice(1, 3), 16) +
          "," +
          Number.parseInt(узКнопка.value.slice(3, 5), 16) +
          "," +
          Number.parseInt(узКнопка.value.slice(5, 7), 16)
      );
    }
    const чНепрозрачность = Округлить(
      1 - м_Настройки.Получить("чПрозрачность") / 100,
      2
    );
    оСтиль.setProperty("--чНепрозрачность", чНепрозрачность);
    оСтиль.setProperty(
      "--чНепрозрачностьОкна",
      Ограничить(чНепрозрачность, 0.85, 1)
    );
  }
  function ПрименитьРазмерИнтерфейса() {
    document.documentElement.style.fontSize = `${
      (16 * м_Настройки.Получить("чРазмерИнтерфейса")) / 100
    }px`;
    м_Медиазапрос.обновитьМедленно();
  }
  function Запустить() {
    м_i18n.TranslateDocument(document);
    _оПрозрачность = new ВводЧисла("чПрозрачность", 5, 0, "прозрачность");
    _оПрозрачность.ПослеИзменения = ОбновитьСтили;
    document.addEventListener("input", ОбработатьВводЦвета);
    document.addEventListener("change", ОбработатьИзменениеЦвета);
    м_События.ДобавитьОбработчик(
      "настройки-измениласьпредустановка-оформление",
      ОбработатьИзменениеПредустановкиОформления
    );
    ОбработатьИзменениеПредустановкиОформления();
    new ВводЧисла(
      "чРазмерИнтерфейса",
      1,
      0,
      "размеринтерфейса"
    ).ПослеИзменения = ПрименитьРазмерИнтерфейса;
    ПрименитьРазмерИнтерфейса();
    ПоказатьЭлемент(document.body, true);
  }
  return {
    Запустить,
  };
})();

const м_Уведомление = (() => {
  const ПОКАЗЫВАТЬ_УВЕДОМЛЕНИЕ = 2e3;
  let _чТаймер = 0;
  function Показать(сИдЗначка, лЖопа) {
    Проверить(document.getElementById(сИдЗначка) && typeof лЖопа == "boolean");
    const узУведомление = Узел("уведомление");
    узУведомление.classList.toggle("жопа", лЖопа);
    ПоказатьЭлемент(узУведомление, true);
    узУведомление.firstElementChild.setAttributeNS(
      "http://www.w3.org/1999/xlink",
      "href",
      `#${сИдЗначка}`
    );
    if (_чТаймер !== 0) {
      clearTimeout(_чТаймер);
    }
    _чТаймер = setTimeout(СкрытьУведомление, ПОКАЗЫВАТЬ_УВЕДОМЛЕНИЕ);
  }
  function ПоказатьСчастье() {
    Показать("svg-success", false);
  }
  function ПоказатьЖопу() {
    Показать("svg-fail", true);
  }
  const СкрытьУведомление = ДобавитьОбработчикИсключений(() => {
    ПоказатьЭлемент("уведомление", false);
    _чТаймер = 0;
  });
  return {
    Показать,
    ПоказатьСчастье,
    ПоказатьЖопу,
  };
})();

const м_Шкала = (() => {
  let _чНачало = 0;
  let _чКонец = 0;
  let _чПросмотрено;
  function ОграничитьВремя(чВремя) {
    return Ограничить(чВремя, _чНачало, _чКонец);
  }
  function Обновить() {
    Проверить(
      Number.isFinite(_чНачало) &&
        Number.isFinite(_чКонец) &&
        Number.isFinite(_чПросмотрено)
    );
    Узел("шкала-просмотрено").style.transform = `scaleX(${(
      (_чПросмотрено - _чНачало) /
      (_чКонец - _чНачало)
    ).toFixed(4)})`;
  }
  const ОбработатьЩелчок = ДобавитьОбработчикИсключений((оСобытие) => {
    if (м_Управление.ПолучитьСостояние() !== СОСТОЯНИЕ_ПОВТОР) {
      return;
    }
    const оБордюр = оСобытие.currentTarget.getBoundingClientRect();
    const оСтиль = getComputedStyle(оСобытие.currentTarget);
    const чНачалоШкалы = Math.round(
      оБордюр.left + Number.parseFloat(оСтиль.paddingLeft)
    );
    const чКонецШкалы = Math.round(
      оБордюр.right - Number.parseFloat(оСтиль.paddingRight)
    );
    const чУказатель = оСобытие.clientX + 1;
    const чПеремотатьДо = ОграничитьВремя(
      ((чУказатель - чНачалоШкалы) / (чКонецШкалы - чНачалоШкалы)) *
        (_чКонец - _чНачало) +
        _чНачало
    );
    м_Журнал.Окак(`[Шкала] Перематываю до ${чПеремотатьДо}`);
    м_Проигрыватель.ПеремотатьПовторДо(чПеремотатьДо);
  });
  function ЗадатьНачалоИКонец(чНачало, чКонец) {
    Проверить(чНачало <= чКонец);
    _чНачало = чНачало;
    _чКонец = чКонец;
    document
      .getElementById("шкала")
      .addEventListener("click", ОбработатьЩелчок);
  }
  function ЗадатьПросмотрено(чПросмотрено) {
    _чПросмотрено = ОграничитьВремя(чПросмотрено);
    Обновить();
  }
  function ПолучитьНачало() {
    return _чНачало;
  }
  function ПолучитьКонец() {
    return _чКонец;
  }
  return {
    ЗадатьНачалоИКонец,
    ЗадатьПросмотрено,
    ПолучитьНачало,
    ПолучитьКонец,
  };
})();

/**
 * Module: News & Updates Manager (м_Новости)
 * -----------------------------------------------------------------------------
 * This module is a Singleton (IIFE) responsible for:
 * 1. CHANGELOG & NEWS DISPLAY:
 *    - Stores the entire history of changes (`_мНовости`) as [Date/Version, TitleKey, ContentKeys...].
 *    - Renders these items into the UI (via `ДобавитьНовости`).
 *    - Supports "Special" pages like "Full Help" (`ПОЛНАЯ_СПРАВКА`) or "Tablet Info".
 *    - Auto-generates "Google Translate" links for non-Russian users.
 *
 * 2. UPDATE CHECKING:
 *    - Periodically checks `coolcmd.github.io/tw5/version.json` for new versions (`проверитьОбновлениеРасширения`).
 *    - Notifies the user if a new version is found (logic involves `м_Настройки.чПоследняяПроверкаОбновленияРасширения`).
 *
 * 3. VERSION TRACKING:
 *    - On startup (`Запустить`), compares the current extension version (`ВЕРСИЯ_РАСШИРЕНИЯ`)
 *      with the last seen version (`сПредыдущаяВерсия` in Settings).
 *    - If upgraded, highlights the "News" button to alert the user of new features.
 *
 * USAGE IN CODEBASE:
 * - `м_Новости.Запустить()`: Called on player startup to verify version and check for updates.
 * - `м_Новости.ОткрытьНовости()`: Triggered by UI menu ("открытьновости"). Shows relevant changes based on what the user has seen.
 * - `м_Новости.ОткрытьСправку()`: Triggered by UI menu ("открытьсправку"). Displays the full manual.
 *
 * DEPENDENCIES:
 * - `м_Настройки`: To read/write version history and check times.
 * - `м_i18n`: To translate news keys (Jxxxx, Fxxxx) into text.
 * - `м_Загрузчик`: To fetch the version.json file.
 * - `м_Окно`: To open the modal window.
 */
const м_Новости = (() => {
  // Special "Version" Constants (Markers for non-date items)
  const ПОКАЗАТЬ_ОДИН_РАЗ = "2000.1.1"; // Show once (e.g. urgent notice)
  const ПОКАЗЫВАТЬ_ВСЕГДА = "2000.2.2"; // Always visible (e.g. pinned)
  const ПОЛНАЯ_СПРАВКА = "2000.3.3";    // Full Help/Manual identifier
  const ДЛЯ_ПЛАНШЕТА = "2000.4.4";      // Tablet-specific info

  // Changelog Data: [Version/Date, Title_I18n_Key, Content_I18n_Keys...]
  // Used to generate the "What's New" list.
  const _мНовости = [
    ["2025.5.28", "J1010", "F1078"],
    ["2024.6.14", "J1010", "F1077"],
    ["2024.6.5", "J1010", "F1076"],
    ["2024.6.5", "J1010", "F1074"],
    ["2024.5.31", "F1072", "F1073"],
    ["2022.1.20", "J1513", "F1515"],
    ["2021.12.17", "J1066", "F1070", "F1514"],
    ["2021.12.17", "J1010", "F1069"],
    ["2021.3.7", "J1010", "F1068"],
    ["2020.10.30", "J1066", "F1067"],
    ["2020.10.5", "J1010", "F1065"],
    ["2019.10.9", "J1010", "F1064"],
    ["2019.3.17", "J1010", "F1063"],
    ["2018.10.28", "J1010", "F1062"],
    ["2018.8.17", "J1010", "F1060"],
    ["2018.7.30", "J1010", "F1059"],
    ["2018.6.27", "J1010", "F1058"],
    ["2018.6.12", "J1010", "F1057"],
    ["2018.5.18", "J1010", "F1049"],
    ["2018.4.24", "J1036", "F1048"],
    ["2018.4.6", "J1010", "F1047"],
    ["2018.3.17", "J1010", "F1046"],
    ["2018.3.4", "J1041", "F1042"],
    ["2018.2.17", "J1010", "F1044"],
    ["2018.1.7", "J1010", "F1043"],
    ["2017.11.6", "J1010", "F1037", "F1038"],
    ["2017.10.22", "J1010", "F1023"],
    ["2017.10.14", "J1010", "F1020"],
    ["2017.9.11", "J1010", "F1018"],
    ["2017.8.8", "J1035", "F1017"],
    ["2017.6.23", "J1010", "F1014"],
    ["2017.5.29", "J1010", "F1013"],
    ["2017.3.31", "J1031", "F1012"],
    ["2017.2.26", "J1030", "F1011"],
    [
      ПОЛНАЯ_СПРАВКА,
      "J1500", // Start of manual ? (Keys are cryptic, likely "Manual" or "Help")
      "F1501",
      "F1503",
      "F1502",
      "F1575",
      "F1509",
      "F1573",
      "F1574",
      "F1504",
      "F1514",
      "F1507",
    ],
    [
      ПОЛНАЯ_СПРАВКА,
      "J1513",
      "F1570",
      "F1571",
      "F1572",
      "F1515",
      "F1511",
      "F1506",
      "F1510",
    ],
    [ПОКАЗАТЬ_ОДИН_РАЗ, "J1054", "F1501"],
    [ДЛЯ_ПЛАНШЕТА, "J1055", "F1056"],
    [ПОКАЗЫВАТЬ_ВСЕГДА, "J1003", "F1000"],
  ];
  function ПеревестиВерсиюВМиллисекунды(сВерсия) {
    const мчЧасти = /^(\d+)\.(\d+)\.(\d+)(?:\.(\d+))?$/.exec(сВерсия);
    мчЧасти[1] |= 0;
    мчЧасти[2] |= 0;
    мчЧасти[3] |= 0;
    мчЧасти[4] |= 0;
    return Date.UTC(
      мчЧасти[1],
      мчЧасти[2] - 1,
      мчЧасти[3],
      0,
      0,
      0,
      мчЧасти[4]
    );
  }
  function ЕстьНовостиСВерсиейСтарше(сВерсия) {
    const чВерсия = ПеревестиВерсиюВМиллисекунды(сВерсия);
    return _мНовости.some(
      (мНовость) => ПеревестиВерсиюВМиллисекунды(мНовость[0]) > чВерсия
    );
  }
  function ДобавитьНовости(чДобавитьВерсииСтарше, сДобавитьВерсиюСправки) {
    Проверить(
      typeof чДобавитьВерсииСтарше == "number" && чДобавитьВерсииСтарше >= 0
    );
    Проверить(
      сДобавитьВерсиюСправки === "" || сДобавитьВерсиюСправки.startsWith("2000")
    );
    Проверить(
      Number.isFinite(чДобавитьВерсииСтарше) || сДобавитьВерсиюСправки !== ""
    );
    const элДобавитьВ = Узел("текстновостей");
    элДобавитьВ.textContent = "";
    for (let мНовость of _мНовости) {
      const сВерсия = мНовость[0];
      if (сВерсия.startsWith("2000")) {
        if (
          сВерсия === сДобавитьВерсиюСправки ||
          (сВерсия === ДЛЯ_ПЛАНШЕТА && этоМобильноеУстройство()) ||
          сВерсия === ПОКАЗЫВАТЬ_ВСЕГДА
        ) {
          ДобавитьНовость(элДобавитьВ, мНовость, 0);
        }
      } else {
        const чВерсия = ПеревестиВерсиюВМиллисекунды(сВерсия);
        if (чВерсия > чДобавитьВерсииСтарше) {
          ДобавитьНовость(элДобавитьВ, мНовость, чВерсия);
        }
      }
    }
    м_Окно.настроитьИндикаторПрокрутки(элДобавитьВ);
  }
  function ДобавитьНовость(элДобавитьВ, мНовость, чДатаНовости) {
    if (элДобавитьВ.firstElementChild) {
      элДобавитьВ.appendChild(document.createElement("hr"));
    }
    const узЗаголовок = document.createElement("h4");
    if (чДатаНовости === 0) {
      узЗаголовок.textContent = Текст(мНовость[1]);
    } else {
      узЗаголовок.textContent = `${м_i18n.ФорматироватьДату(
        чДатаНовости
      )} · ${Текст(мНовость[1])}`;
    }
    элДобавитьВ.appendChild(узЗаголовок);
    if (Текст("M0010") !== "ru") {
      const элСсылка = узЗаголовок.appendChild(document.createElement("a"));
      элСсылка.className = "новость-перевести";
      элСсылка.href = "translate:";
      элСсылка.target = "_blank";
      элСсылка.title = Текст("J0148");
    }
    for (let ы = 2; ы < мНовость.length; ++ы) {
      м_i18n.InsertAdjacentHtmlMessage(элДобавитьВ, "beforeend", мНовость[ы]);
    }
  }
  function ОткрытьОкно(лПодтвердитьПрочтение) {
    if (лПодтвердитьПрочтение) {
      м_i18n.InsertAdjacentHtmlMessage(
        "закрытьновости",
        "content",
        "F0619"
      ).title = Текст("A0620");
      ПоказатьЭлемент("отложитьновости", true);
    } else {
      м_i18n.InsertAdjacentHtmlMessage(
        "закрытьновости",
        "content",
        "F0663"
      ).title = "";
      ПоказатьЭлемент("отложитьновости", false);
    }
    м_События.ДобавитьОбработчик(
      "управление-левыйщелчок",
      ОбработатьЛевыйЩелчок
    );
    м_Окно.открыть("новости");
  }
  function ОбработатьЛевыйЩелчок(оСобытие) {
    if (
      оСобытие.сПозывной === "закрытьновости" &&
      ЭлементПоказан("отложитьновости")
    ) {
      ПоказатьЭлемент("открытьновости", false);
      м_Настройки.Изменить("сПредыдущаяВерсия", ВЕРСИЯ_РАСШИРЕНИЯ);
    } else if (оСобытие.target.href === "translate:") {
      let сТекст = "";
      for (
        let элТекст = оСобытие.target.parentElement;
        элТекст && элТекст.nodeName !== "HR";
        элТекст = элТекст.nextElementSibling
      ) {
        сТекст += `${элТекст.textContent}\n\n`;
      }
      оСобытие.target.href = `https://translate.google.com/?op=translate&sl=${Текст(
        "M0010"
      )}&text=${encodeURIComponent(сТекст)}`;
    }
  }
  function ОткрытьСправку() {
    ДобавитьНовости(Infinity, ПОЛНАЯ_СПРАВКА);
    ОткрытьОкно(false);
  }
  function ОткрытьНовости() {
    const { пТекущее: сПредыдущаяВерсия, пНачальное: сНачальнаяВерсия } =
      м_Настройки.ПолучитьПараметрыНастройки("сПредыдущаяВерсия");
    if (сПредыдущаяВерсия === сНачальнаяВерсия) {
      ДобавитьНовости(Infinity, ПОКАЗАТЬ_ОДИН_РАЗ);
      ОткрытьОкно(false);
      ПоказатьЭлемент("открытьновости", false);
      м_Настройки.Изменить("сПредыдущаяВерсия", ВЕРСИЯ_РАСШИРЕНИЯ);
    } else if (сПредыдущаяВерсия !== ВЕРСИЯ_РАСШИРЕНИЯ) {
      ДобавитьНовости(ПеревестиВерсиюВМиллисекунды(сПредыдущаяВерсия), "");
      ОткрытьОкно(true);
      Узел("открытьновости").classList.remove("непрочитано");
    } else {
      ДобавитьНовости(0, "");
      ОткрытьОкно(false);
    }
  }
  function проверитьОбновлениеРасширения() {
    const ИНТЕРВАЛ_ПРОВЕРКИ_ОБНОВЛЕНИЯ = 1e3 * 60 * 60 * 24 * 5;
    const ЗАНИМАЕТ_УСТАНОВКА_ОБНОВЛЕНИЯ = 1e3 * 60 * 60 * 24 * 3;
    const чСейчас = Date.now();
    let чПоследняяПроверка = м_Настройки.Получить(
      "чПоследняяПроверкаОбновленияРасширения"
    );
    if (
      Math.abs(чСейчас - Math.abs(чПоследняяПроверка)) <
      ИНТЕРВАЛ_ПРОВЕРКИ_ОБНОВЛЕНИЯ
    ) {
      return;
    }
    Ждать(null, 900)
      .then(() => {
        return м_Загрузчик.ЗагрузитьJson(
          null,
          `https://coolcmd.github.io/tw5/version.json?${чСейчас}`,
          3e4,
          "обновление расширения",
          false
        );
      })
      .then((оРезультат) => {
        let лОбновлениеДоступно = false;
        try {
          const {
            оПоддерживаемаяВерсия: {
              оХромой: { сВерсияРасширения, чВерсияБраузера },
            },
          } = оРезультат;
          Проверить(
            ЭтоНепустаяСтрока(сВерсияРасширения) &&
              Number.isSafeInteger(чВерсияБраузера)
          );
          лОбновлениеДоступно =
            получитьВерсиюДвижкаБраузера() >= чВерсияБраузера &&
            ПеревестиВерсиюВМиллисекунды(ВЕРСИЯ_РАСШИРЕНИЯ) <
              ПеревестиВерсиюВМиллисекунды(сВерсияРасширения);
        } catch (пИсключение) {
          throw String(пИсключение);
        }
        if (!лОбновлениеДоступно) {
          чПоследняяПроверка = чСейчас;
        } else if (чПоследняяПроверка >= 0) {
          чПоследняяПроверка = -(
            чСейчас -
            (ИНТЕРВАЛ_ПРОВЕРКИ_ОБНОВЛЕНИЯ - ЗАНИМАЕТ_УСТАНОВКА_ОБНОВЛЕНИЯ)
          );
        } else {
          чПоследняяПроверка = -чСейчас;
          м_Окно.открыть("обновлениерасширения");
        }
        м_Настройки.Изменить(
          "чПоследняяПроверкаОбновленияРасширения",
          чПоследняяПроверка
        );
        м_Настройки.СохранитьИзменения();
      })
      .catch(
        ДобавитьОбработчикИсключений((пПричина) => {
          if (typeof пПричина == "string") {
            м_Журнал.Ой(
              `[Новости] Не удалось проверить обновление расширения. ${пПричина}`
            );
            м_Настройки.Изменить(
              "чПоследняяПроверкаОбновленияРасширения",
              чПоследняяПроверка < 0 ? -чСейчас : чСейчас
            );
            м_Настройки.СохранитьИзменения();
          } else {
            throw пПричина;
          }
        })
      );
  }
  function Запустить() {
    const { пТекущее: сПредыдущаяВерсия, пНачальное: сНачальнаяВерсия } =
      м_Настройки.ПолучитьПараметрыНастройки("сПредыдущаяВерсия");
    if (сПредыдущаяВерсия !== ВЕРСИЯ_РАСШИРЕНИЯ) {
      м_Журнал.Окак(
        `[Новости] Версия расширения изменилась с ${сПредыдущаяВерсия} на ${ВЕРСИЯ_РАСШИРЕНИЯ}`
      );
      if (
        сПредыдущаяВерсия === сНачальнаяВерсия ||
        ЕстьНовостиСВерсиейСтарше(сПредыдущаяВерсия)
      ) {
        ПоказатьЭлемент("открытьновости", true).classList.add("непрочитано");
      } else {
        м_Настройки.Изменить("сПредыдущаяВерсия", ВЕРСИЯ_РАСШИРЕНИЯ);
      }
    }
    проверитьОбновлениеРасширения();
  }
  return {
    Запустить,
    ОткрытьНовости,
    ОткрытьСправку,
  };
})();

const м_Управление = (() => {
  const ПЕРЕМАТЫВАТЬ_СТРЕЛКАМИ_НА = 5;
  const ПЕРЕМАТЫВАТЬ_ПО_КАДРАМ_НА = 3;
  const НАЗВАНИЕ_ТРАНСЛЯЦИИ_НЕИЗВЕСТНО = "• • •";
  let _чСостояние;
  let _оНачалоВоспроизведения,
    _оРазмерБуфера,
    _оРастягиваниеБуфера,
    _оДлительностьПовтора;
  let _оИнтервалАвтоскрытия;
  function запуститьИзменениеГромкостиКолесом() {
    document.removeEventListener("pointerdown", обработатьНажатиеКолеса);
    document.removeEventListener("wheel", обработатьВращениеКолеса);
    if (м_Настройки.Получить("лМенятьГромкостьКолесом")) {
      document.addEventListener("pointerdown", обработатьНажатиеКолеса);
      if (м_Настройки.Получить("чШагИзмененияГромкостиКолесом") !== 0) {
        document.addEventListener("wheel", обработатьВращениеКолеса, {
          passive: false,
        });
      }
    }
  }
  const обработатьНажатиеКолеса = создатьОбработчикСобытийЭлемента(
    (оСобытие) => {
      if (
        !(
          оСобытие.button !== СРЕДНЯЯ_КНОПКА ||
          оСобытие.shiftKey ||
          оСобытие.ctrlKey ||
          оСобытие.altKey ||
          оСобытие.metaKey ||
          ЭтоСобытиеДляСсылки(оСобытие)
        )
      ) {
        оСобытие.preventDefault();
        СохранитьИПрименитьГромкость(!м_Настройки.Получить("лПриглушить"));
      }
    }
  );
  const обработатьВращениеКолеса = ДобавитьОбработчикИсключений((оСобытие) => {
    if (
      !(
        оСобытие.shiftKey ||
        оСобытие.ctrlKey ||
        оСобытие.altKey ||
        оСобытие.metaKey ||
        ЭлементВЭтойТочкеМожноПрокрутить(оСобытие.clientX, оСобытие.clientY)
      )
    ) {
      оСобытие.preventDefault();
      м_Журнал.Вот(
        `[Управление] Движение колеса deltaY=${оСобытие.deltaY} deltaMode=${оСобытие.deltaMode}`
      );
      if (оСобытие.deltaY !== 0) {
        СохранитьИПрименитьГромкость(
          void 0,
          Ограничить(
            м_Настройки.Получить("чГромкость2") -
              м_Настройки.Получить("чШагИзмененияГромкостиКолесом") *
                Math.sign(оСобытие.deltaY),
            МИНИМАЛЬНАЯ_ГРОМКОСТЬ,
            МАКСИМАЛЬНАЯ_ГРОМКОСТЬ
          )
        );
      }
    }
  });
  function ПрименитьМасштабированиеИзображения() {
    Узел("глаз").classList.toggle(
      "масштабировать",
      м_Настройки.Получить("лМасштабироватьИзображение")
    );
  }
  function ПрименитьАнимациюИнтерфейса() {
    document.body.classList.toggle(
      "анимацияинтерфейса",
      м_Настройки.Получить("лАнимацияИнтерфейса")
    );
  }
  function ОстановитьПросмотрТрансляции() {
    if (
      _чСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||
      _чСостояние === СОСТОЯНИЕ_ПОВТОР
    ) {
      return false;
    }
    м_Журнал.Окак("[Управление] Останавливаю просмотр трансляции");
    м_Список.Остановить();
    м_Преобразователь.Остановить();
    г_моОчередь.Очистить();
    г_моОчередь.Добавить(new Сегмент(ОБРАБОТКА_ПРЕОБРАЗОВАН, СОСТОЯНИЕ_ПОВТОР));
    м_Проигрыватель.ДобавитьСледующийСегмент();
    return true;
  }
  function ПереключитьПросмотрТрансляции() {
    if (!ОстановитьПросмотрТрансляции()) {
      м_Журнал.Окак("[Управление] Начинаю просмотр трансляции");
      г_моОчередь.Очистить();
      м_Проигрыватель.Перезагрузить(СОСТОЯНИЕ_ЗАПУСК);
      м_Список.Запустить();
    }
  }
  function ПереключитьОкноСтатистики() {
    if (м_Статистика.ОкноОткрыто()) {
      м_Статистика.ЗакрытьОкно();
    } else {
      м_Статистика.ОткрытьОкно();
    }
  }
  function ПереключитьПроверкуЦвета(оСобытие) {
    if (document.body.classList.toggle("проверкацвета")) {
      document.body.classList.toggle("проверкацветафон", !оСобытие.shiftKey);
      м_Новости.ОткрытьСправку();
    } else {
      document.body.classList.remove("проверкацветафон");
    }
  }
  function КопироватьТекстВБуферОбмена(сТекст) {
    Проверить(typeof сТекст == "string");
    if (сТекст === "") {
      м_Уведомление.ПоказатьЖопу();
      return;
    }
    navigator.clipboard
      .writeText(сТекст)
      .then(
        () => {
          м_Журнал.Вот("[Управление] Копирование в буфер обмена завершено");
          м_Уведомление.ПоказатьСчастье();
        },
        (пПричина) => {
          м_Журнал.Ой(
            `[Управление] Ошибка при копировании в буфер обмена: ${пПричина}`
          );
          м_Уведомление.ПоказатьЖопу();
        }
      )
      .catch(м_Отладка.ПойманоИсключение);
  }
  function КопироватьАдресТрансляцииВБуферОбмена() {
    if (КопироватьАдресТрансляцииВБуферОбмена.лИдетВыполнение) {
      return;
    }
    КопироватьАдресТрансляцииВБуферОбмена.лИдетВыполнение = true;
    м_Журнал.Окак("[Управление] Получаю адрес трансляции для копирования");
    м_Twitch
      .ПолучитьАбсолютныйАдресСпискаВариантов(null, true, false)
      .then((сРезультат) => {
        м_Журнал.Вот("[Управление] Копирую адрес трансляции в буфер обмена");
        return navigator.clipboard.writeText(сРезультат).then(
          () => {
            КопироватьАдресТрансляцииВБуферОбмена.лИдетВыполнение = false;
            м_Журнал.Вот("[Управление] Копирование в буфер обмена завершено");
            м_Управление.ОстановитьПросмотрТрансляции();
            м_Уведомление.ПоказатьСчастье();
          },
          (пПричина) => {
            throw `Ошибка при копировании в буфер обмена: ${пПричина}`;
          }
        );
      })
      .catch(
        ДобавитьОбработчикИсключений((пПричина) => {
          КопироватьАдресТрансляцииВБуферОбмена.лИдетВыполнение = false;
          if (typeof пПричина == "string") {
            м_Журнал.Ой(
              `[Управление] Ошибка при копировании адреса трансляции в буфер обмена: ${пПричина}`
            );
            м_Уведомление.ПоказатьЖопу();
          } else {
            throw пПричина;
          }
        })
      );
  }
  const ОбработатьИзменениеГромкости = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      СохранитьИПрименитьГромкость(false, оСобытие.target.valueAsNumber);
    }
  );
  function СохранитьИПрименитьГромкость(лПриглушить, чГромкость) {
    Проверить(лПриглушить !== void 0 || чГромкость !== void 0);
    if (document.body.classList.contains("нетзвука")) {
      return;
    }
    if (лПриглушить !== void 0) {
      м_Настройки.Изменить("лПриглушить", лПриглушить);
    }
    if (чГромкость !== void 0) {
      м_Настройки.Изменить("чГромкость2", Math.round(чГромкость));
    }
    м_Проигрыватель.ПрименитьГромкость();
    ОбновитьГромкость();
    м_Автоскрытие.Показать();
  }
  function ОбновитьГромкость() {
    const чГромкость = м_Настройки.Получить("чГромкость2");
    const узГромкость = Узел("громкость");
    узГромкость.value = чГромкость;
    узГромкость.style.setProperty(
      "--ширина",
      `${
        ((чГромкость - МИНИМАЛЬНАЯ_ГРОМКОСТЬ) / (100 - МИНИМАЛЬНАЯ_ГРОМКОСТЬ)) *
        100
      }%`
    );
    ИзменитьКнопку(
      "переключитьприглушить",
      м_Настройки.Получить("лПриглушить")
    );
  }
  function ОбновитьКоличествоДорожек(лЕстьВидео, лЕстьЗвук) {
    document.body.classList.toggle("нетвидео", !лЕстьВидео);
    document.body.classList.toggle("нетзвука", !лЕстьЗвук);
  }
  function ИзменитьПодпискуЗрителяНаКанал(чПодписка) {
    if (
      !document
        .getElementById("зритель-подписка")
        .classList.contains("обновляется")
    ) {
      м_Twitch.ИзменитьПодпискуЗрителяНаКанал(чПодписка);
    }
  }
  const ОбработатьЛевыйЩелчок = создатьОбработчикСобытийЭлемента((оСобытие) => {
    if (оСобытие.button !== ЛЕВАЯ_КНОПКА) {
      return;
    }
    const узЩелчок = оСобытие.target;
    let узПозывной = узЩелчок;
    let сПозывной = узПозывной.id || узПозывной.name;
    if (!сПозывной && узЩелчок.parentNode) {
      узПозывной = узЩелчок.parentNode;
      сПозывной = узПозывной.id || узПозывной.name;
    }
    оСобытие.узПозывной = узПозывной;
    оСобытие.сПозывной = сПозывной;
    м_События.ПослатьСобытие("управление-левыйщелчок", оСобытие);
    switch (сПозывной) {
      case "переключитьтрансляцию":
        ПереключитьПросмотрТрансляции();
        break;

      case "переключитьпаузу":
        if (_чСостояние === СОСТОЯНИЕ_ПОВТОР) {
          м_Проигрыватель.ПереключитьПаузу();
        }
        break;

      case "переключитьприглушить":
        СохранитьИПрименитьГромкость(!м_Настройки.Получить("лПриглушить"));
        break;

      case "переключитьчат":
        м_Чат.ПереключитьСостояниеПанели();
        break;

      case "создатьклип":
        м_Twitch.СоздатьКлип();
        break;

      case "переключитькартинкавкартинке":
        м_КартинкаВКартинке.переключить();
        break;

      case "переключитьполноэкранный":
        м_ПолноэкранныйРежим.Переключить();
        break;

      case "одновременныхзагрузок":
        Проверить(узЩелчок.checked);
        м_Настройки.Изменить(
          "кОдновременныхЗагрузок",
          Number.parseInt(узЩелчок.value, 10)
        );
        м_Статистика.ОчиститьИсторию();
        break;

      case "анимацияинтерфейса":
        м_Настройки.Изменить("лАнимацияИнтерфейса", узЩелчок.checked);
        ПрименитьАнимациюИнтерфейса();
        break;

      case "масштабироватьизображение":
        м_Настройки.Изменить("лМасштабироватьИзображение", узЩелчок.checked);
        ПрименитьМасштабированиеИзображения();
        break;

      case "автоположениечата":
        м_Настройки.Изменить("лАвтоПоложениеЧата", узЩелчок.checked);
        ОбновитьОкноНастроек();
        м_Чат.ПрименитьПоложениеПанели();
        break;

      case "горизонтальноеположениечата":
        Проверить(узЩелчок.checked);
        м_Настройки.Изменить(
          "чГоризонтальноеПоложениеЧата",
          Number.parseInt(узЩелчок.value, 10)
        );
        м_Чат.ПрименитьПоложениеПанели();
        break;

      case "вертикальноеположениечата":
        Проверить(узЩелчок.checked);
        м_Настройки.Изменить(
          "чВертикальноеПоложениеЧата",
          Number.parseInt(узЩелчок.value, 10)
        );
        м_Чат.ПрименитьПоложениеПанели();
        break;

      case "положениечата":
        Проверить(узЩелчок.checked);
        м_Настройки.Изменить(
          "чПоложениеПанелиЧата",
          Number.parseInt(узЩелчок.value, 10)
        );
        м_Чат.ПрименитьПоложениеПанели();
        break;

      case "состояниезакрытогочата":
        Проверить(узЩелчок.checked);
        м_Чат.СохранитьИПрименитьСостояниеЗакрытойПанели(
          Number.parseInt(узЩелчок.value, 10)
        );
        break;

      case "переключитьстатистику":
      case "позиция":
        ПереключитьОкноСтатистики();
        break;

      case "открытьновости":
      case "открытьновости2":
        м_Новости.ОткрытьНовости();
        break;

      case "открытьсправку":
        м_Новости.ОткрытьСправку();
        break;

      case "отправитьотзыв":
        м_Отладка.ЗавершитьРаботуИОтправитьОтзыв();
        break;

      case "экспортнастроек":
        м_Настройки.Экспорт();
        break;

      case "импортнастроек":
        const уз = document.getElementById("выборфайладляимпортанастроек");
        уз.value = "";
        уз.click();
        break;

      case "сброситьнастройки":
        м_Настройки.Сбросить();
        break;

      case "проверкацвета":
        ПереключитьПроверкуЦвета(оСобытие);
        break;

      case "зритель-подписаться":
        ИзменитьПодпискуЗрителяНаКанал(ПОДПИСКА_УВЕДОМЛЯТЬ);
        break;

      case "зритель-отписаться":
        ИзменитьПодпискуЗрителяНаКанал(ПОДПИСКА_НЕОФОРМЛЕНА);
        break;

      case "зритель-уведомлять":
        ИзменитьПодпискуЗрителяНаКанал(
          узЩелчок.checked ? ПОДПИСКА_УВЕДОМЛЯТЬ : ПОДПИСКА_НЕУВЕДОМЛЯТЬ
        );
        break;

      case "закрытьстатистику":
        м_Статистика.ЗакрытьОкно();
        break;

      case "копироватьадресканала":
        м_Журнал.Вот("[Управление] Копирую адрес канала в буфер обмена");
        КопироватьТекстВБуферОбмена(м_Twitch.ПолучитьАдресКанала(false));
        break;

      case "копироватьадрестрансляции":
        КопироватьАдресТрансляцииВБуферОбмена();
    }
  });
  const ОбработатьНажатиеИОтпусканиеКлавы = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      const SHIFT_KEY = 1 << 16;
      const CTRL_KEY = 1 << 17;
      const ALT_KEY = 1 << 18;
      const META_KEY = 1 << 19;
      const лНажатие = оСобытие.type === "keydown";
      const лНажатие1 = лНажатие && !оСобытие.repeat;
      switch (
        оСобытие.keyCode +
        оСобытие.shiftKey * SHIFT_KEY +
        оСобытие.ctrlKey * CTRL_KEY +
        оСобытие.altKey * ALT_KEY +
        оСобытие.metaKey * META_KEY
      ) {
        case 27:
          оСобытие.preventDefault();
          if (лНажатие1) {
            getSelection().removeAllRanges();
            м_Окно.закрыть(false);
            м_Автоскрытие.Скрыть(false);
          }
          break;

        case 70:
        case 13:
        case 13 + ALT_KEY:
          if (лНажатие1) {
            м_ПолноэкранныйРежим.Переключить();
          }
          break;

        case 13 + SHIFT_KEY:
          if (лНажатие1) {
            м_КартинкаВКартинке.переключить();
          }
          break;

        case 93:
          if (!лНажатие) {
            Узел("глаз").focus();
          }
          return;

        case 88:
          if (лНажатие1) {
            м_Окно.переключить("главноеменю");
          }
          break;

        case 67:
          if (лНажатие1) {
            м_Чат.ПереключитьСостояниеПанели();
          }
          break;

        case 86:
          if (лНажатие1) {
            м_Окно.переключить("настройки");
          }
          break;

        case 73:
          if (лНажатие1) {
            м_Окно.переключить("канал");
          }
          break;

        case 83:
          if (лНажатие1) {
            ПереключитьОкноСтатистики();
          }
          break;

        case 112:
          if (лНажатие1) {
            м_Новости.ОткрытьСправку();
          }
          break;

        case 65 + CTRL_KEY:
          break;

        case 85 + CTRL_KEY:
          if (лНажатие1) {
            м_Чат.ПереключитьПоложениеПанели();
            ОбновитьОкноНастроек();
          }
          break;

        case 32:
          if (лНажатие1) {
            ПереключитьПросмотрТрансляции();
            м_Автоскрытие.Показать();
          }
          break;

        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
        case 48:
          if (лНажатие1 && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            задатьСкоростьПовтора(
              58 - (оСобытие.keyCode === 48 ? 58 : оСобытие.keyCode)
            );
            м_Автоскрытие.Показать();
          }
          break;

        case 187:
        case 107:
        case 190:
          if (лНажатие1 && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            задатьСкоростьПовтора(-Infinity);
            м_Автоскрытие.Показать();
          }
          break;

        case 189:
        case 109:
        case 188:
          if (лНажатие1 && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            задатьСкоростьПовтора(Infinity);
            м_Автоскрытие.Показать();
          }
          break;

        case 75:
        case 12:
          if (лНажатие1 && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            м_Проигрыватель.ПереключитьПаузу();
            м_Автоскрытие.Показать();
          }
          break;

        case 74:
        case 37:
          if (лНажатие && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            м_Журнал.Окак(
              `[Управление] Перематываю на -${ПЕРЕМАТЫВАТЬ_СТРЕЛКАМИ_НА}с`
            );
            м_Проигрыватель.ПеремотатьПовторНа(
              false,
              -ПЕРЕМАТЫВАТЬ_СТРЕЛКАМИ_НА
            );
            м_Автоскрытие.Показать();
          }
          break;

        case 76:
        case 39:
          if (лНажатие && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            м_Журнал.Окак(
              `[Управление] Перематываю на +${ПЕРЕМАТЫВАТЬ_СТРЕЛКАМИ_НА}с`
            );
            м_Проигрыватель.ПеремотатьПовторНа(
              false,
              ПЕРЕМАТЫВАТЬ_СТРЕЛКАМИ_НА
            );
            м_Автоскрытие.Показать();
          }
          break;

        case 74 + SHIFT_KEY:
        case 37 + SHIFT_KEY:
          if (лНажатие && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            м_Журнал.Окак(
              `[Управление] Перематываю на -${ПЕРЕМАТЫВАТЬ_ПО_КАДРАМ_НА} кадров`
            );
            м_Проигрыватель.ПеремотатьПовторНа(
              true,
              -ПЕРЕМАТЫВАТЬ_ПО_КАДРАМ_НА
            );
          }
          break;

        case 76 + SHIFT_KEY:
        case 39 + SHIFT_KEY:
          if (лНажатие && _чСостояние === СОСТОЯНИЕ_ПОВТОР) {
            м_Журнал.Окак(`[Управление] Перематываю на +1 кадр`);
            м_Проигрыватель.ПеремотатьПовторНа(true, 1);
          }
          break;

        case 38:
          if (лНажатие) {
            СохранитьИПрименитьГромкость(
              false,
              Math.min(
                м_Настройки.Получить("чГромкость2") +
                  ШАГ_ПОВЫШЕНИЯ_ГРОМКОСТИ_КЛАВОЙ,
                МАКСИМАЛЬНАЯ_ГРОМКОСТЬ
              )
            );
          }
          break;

        case 40:
          if (лНажатие) {
            СохранитьИПрименитьГромкость(
              false,
              Math.max(
                м_Настройки.Получить("чГромкость2") -
                  ШАГ_ПОНИЖЕНИЯ_ГРОМКОСТИ_КЛАВОЙ,
                МИНИМАЛЬНАЯ_ГРОМКОСТЬ
              )
            );
          }
          break;

        case 33:
          if (лНажатие1) {
            СохранитьИПрименитьГромкость(false);
          }
          break;

        case 34:
          if (лНажатие1) {
            СохранитьИПрименитьГромкость(true);
          }
          break;

        case 77:
          if (лНажатие1) {
            СохранитьИПрименитьГромкость(!м_Настройки.Получить("лПриглушить"));
          }
          break;

        case 73 + CTRL_KEY:
          if (лНажатие1) {
            const лМасштабироватьИзображение = м_Настройки.Получить(
              "лМасштабироватьИзображение"
            );
            м_Настройки.Изменить(
              "лМасштабироватьИзображение",
              !лМасштабироватьИзображение
            );
            ОбновитьОкноНастроек();
            ПрименитьМасштабированиеИзображения();
            м_Уведомление.Показать(
              `svg-fullscreen-${лМасштабироватьИзображение}`,
              false
            );
          }
          break;

        case 88 + ALT_KEY:
          if (лНажатие1) {
            м_Twitch.СоздатьКлип();
          }
          break;

        default:
          return;
      }
      оСобытие.preventDefault();
    }
  );
  function ОбновитьОкноНастроек() {
    document.querySelector(
      `input[name="одновременныхзагрузок"][value="${м_Настройки.Получить(
        "кОдновременныхЗагрузок"
      )}"]`
    ).checked = true;
    document.querySelector(
      `input[name="состояниезакрытогочата"][value="${м_Настройки.Получить(
        "чСостояниеЗакрытогоЧата"
      )}"]`
    ).checked = true;
    Узел("адресчата").selectedIndex = м_Настройки.Получить("лПолноценныйЧат")
      ? 0
      : м_Настройки.Получить("лЗатемнитьЧат")
      ? 2
      : 1;
    Узел("масштабироватьизображение").checked = м_Настройки.Получить(
      "лМасштабироватьИзображение"
    );
    Узел("анимацияинтерфейса").checked = м_Настройки.Получить(
      "лАнимацияИнтерфейса"
    );
    Узел("менятьгромкостьколесом").value = м_Настройки.Получить(
      "лМенятьГромкостьКолесом"
    )
      ? м_Настройки.Получить("чШагИзмененияГромкостиКолесом")
      : "";
    const лАвтоПоложение = м_Настройки.Получить("лАвтоПоложениеЧата");
    Узел("автоположениечата").checked = лАвтоПоложение;
    const сузСтороны = document.querySelectorAll(".положениечата input");
    if (лАвтоПоложение) {
      const чГоризонтальноеПоложение = м_Настройки.Получить(
        "чГоризонтальноеПоложениеЧата"
      );
      const чВертикальноеПоложение = м_Настройки.Получить(
        "чВертикальноеПоложениеЧата"
      );
      let узГоризонтальноеПоложение, узВертикальноеПоложение;
      for (let узСторона of сузСтороны) {
        const чСторона = Number.parseInt(узСторона.value, 10);
        if (чГоризонтальноеПоложение === чСторона) {
          узГоризонтальноеПоложение = узСторона;
        }
        if (чВертикальноеПоложение === чСторона) {
          узВертикальноеПоложение = узСторона;
        }
        узСторона.name =
          чСторона === ПРАВАЯ_СТОРОНА || чСторона === ЛЕВАЯ_СТОРОНА
            ? "горизонтальноеположениечата"
            : "вертикальноеположениечата";
      }
      узГоризонтальноеПоложение.checked =
        узВертикальноеПоложение.checked = true;
    } else {
      const чПоложение = м_Настройки.Получить("чПоложениеПанелиЧата");
      let узПоложение;
      for (let узСторона of сузСтороны) {
        if (чПоложение === Number.parseInt(узСторона.value, 10)) {
          узПоложение = узСторона;
        }
        узСторона.name = "положениечата";
      }
      узПоложение.checked = true;
    }
    if (_оНачалоВоспроизведения) {
      _оНачалоВоспроизведения.Обновить();
      _оРазмерБуфера.Обновить();
      _оРастягиваниеБуфера.Обновить();
      _оДлительностьПовтора.Обновить();
      _оИнтервалАвтоскрытия.Обновить();
    } else {
      _оНачалоВоспроизведения = new ВводЧисла(
        "чНачалоВоспроизведения",
        0.5,
        1,
        "началовоспроизведения"
      );
      _оРазмерБуфера = new ВводЧисла("чРазмерБуфера", 0.5, 1, "размербуфера");
      _оРастягиваниеБуфера = new ВводЧисла(
        "чРастягиваниеБуфера",
        0.5,
        1,
        "растягиваниебуфера"
      );
      _оДлительностьПовтора = new ВводЧисла(
        "чДлительностьПовтора2",
        30,
        0,
        "длительностьповтора"
      );
      _оНачалоВоспроизведения.ПослеИзменения =
        _оРазмерБуфера.ПослеИзменения =
        _оРастягиваниеБуфера.ПослеИзменения =
          м_Статистика.ОчиститьИсторию;
      _оИнтервалАвтоскрытия = new ВводЧисла(
        "чИнтервалАвтоскрытия",
        0.5,
        1,
        "интервалавтоскрытия"
      );
    }
  }
  function ОбработатьОткрытиеГлавногоМеню() {
    const элПункт = Узел("адресзаписи");
    const сАдрес = м_Twitch.ПолучитьАдресЗаписиДляТекущейПозиции();
    if (сАдрес) {
      элПункт.href = сАдрес;
      м_Меню.задатьДоступностьПункта(элПункт, true);
    } else {
      элПункт.removeAttribute("href");
      м_Меню.задатьДоступностьПункта(элПункт, false);
    }
  }
  function ОбработатьПаузу(лПауза) {
    ИзменитьКнопку("переключитьпаузу", лПауза);
  }
  function ОбработатьИзменениеПредустановкиБуферизации() {
    ОбновитьОкноНастроек();
    м_Статистика.ОчиститьИсторию();
  }
  function получитьСкоростьПовтора() {
    const узСкорость = Узел("скорость");
    if (узСкорость.options[0].text === "") {
      for (const уз of узСкорость.options) {
        уз.text = уз.defaultSelected
          ? "1x"
          : м_i18n.ФорматироватьЧисло(уз.value, 2);
      }
    }
    const чСкорость = Number.parseFloat(узСкорость.value);
    Проверить(чСкорость > 0);
    return чСкорость;
  }
  function задатьСкоростьПовтора(чКод) {
    const узСкорость = Узел("скорость");
    if (!Number.isSafeInteger(чКод)) {
      Проверить(
        узСкорость.selectedIndex >= 0 &&
          (чКод === -Infinity || чКод === Infinity)
      );
      чКод = узСкорость.selectedIndex + Math.sign(чКод);
    }
    if (чКод >= 0 && чКод < узСкорость.options.length) {
      узСкорость.selectedIndex = чКод;
      м_Проигрыватель.ЗадатьСкоростьПовтора(получитьСкоростьПовтора());
    }
  }
  const ОбработатьИзменениеСкоростиВоспроизведения =
    ДобавитьОбработчикИсключений((оСобытие) => {
      if (_чСостояние === СОСТОЯНИЕ_ПОВТОР) {
        м_Проигрыватель.ЗадатьСкоростьПовтора(получитьСкоростьПовтора());
      }
    });
  const ОбработатьИзменениеВариантаТрансляции = ДобавитьОбработчикИсключений(
    ({ target: { selectedIndex } }) => {
      if (selectedIndex !== -1) {
        м_Журнал.Окак(`[Управление] Выбран вариант ${selectedIndex}`);
        м_Список.ИзменитьВариантТрансляции(selectedIndex);
      }
    }
  );
  const ОбработатьИзменениеГромкостиКолесом = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      if (оСобытие.target.value) {
        м_Настройки.Изменить("лМенятьГромкостьКолесом", true);
        м_Настройки.Изменить(
          "чШагИзмененияГромкостиКолесом",
          Number(оСобытие.target.value)
        );
      } else {
        м_Настройки.Изменить("лМенятьГромкостьКолесом", false);
      }
      запуститьИзменениеГромкостиКолесом();
    }
  );
  const ОбработатьИзменениеАдресаЧата = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      м_Журнал.Окак(
        `[Управление] Выбран адрес чата ${оСобытие.target.selectedIndex}`
      );
      switch (оСобытие.target.selectedIndex) {
        case 0:
          м_Настройки.Изменить("лПолноценныйЧат", true);
          break;

        case 1:
          м_Настройки.Изменить("лПолноценныйЧат", false);
          м_Настройки.Изменить("лЗатемнитьЧат", false);
          break;

        case 2:
          м_Настройки.Изменить("лПолноценныйЧат", false);
          м_Настройки.Изменить("лЗатемнитьЧат", true);
          break;

        default:
          Проверить(false);
      }
      м_Чат.ПрименитьАдрес();
    }
  );
  const ОбработатьВыборФайлаДляИмпортаНастроек = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      if (оСобытие.target.files.length === 1) {
        м_Настройки.Импорт(оСобытие.target.files[0]);
      }
    }
  );
  function ОбновитьСписокВариантовТрансляции([моВарианты, оВыбранныйВариант]) {
    const узСписок = Узел("варианттрансляции");
    узСписок.length = 0;
    if (моВарианты) {
      for (const оВариант of моВарианты) {
        let сНазвание = оВариант.сНазвание;
        if (сНазвание === "audio_only") {
          сНазвание = Текст("J0144");
        } else if (сНазвание.endsWith("(source)")) {
          сНазвание = сНазвание.slice(0, -8) + Текст("J0139");
        }
        узСписок.add(
          new Option(
            сНазвание,
            void 0,
            оВариант === оВыбранныйВариант,
            оВариант === оВыбранныйВариант
          )
        );
      }
    }
    узСписок.disabled = узСписок.length < 2;
  }
  function обработатьНачалоРекламы() {
    document.body.classList.add("реклама");
  }
  function обработатьКонецРекламы() {
    document.body.classList.remove("реклама");
  }
  function обработатьПереполнениеБуфера() {
    м_Уведомление.Показать("svg-cut", true);
  }
  function Запустить() {
    Проверить(_чСостояние === void 0);
    Узел("названиетрансляции").href = м_Twitch.ПолучитьАдресКанала(true);
    const узГромкость = Узел("громкость");
    узГромкость.min = МИНИМАЛЬНАЯ_ГРОМКОСТЬ;
    узГромкость.addEventListener("input", ОбработатьИзменениеГромкости);
    ОбновитьГромкость();
    ОбновитьОкноНастроек();
    м_Настройки.НастроитьСпискиПредустановок();
    м_Автоскрытие.Запустить();
    м_Автоскрытие.Показать();
    м_Новости.Запустить();
    м_Чат.Восстановить();
    м_События.ДобавитьОбработчик(
      "окно-открыто-главноеменю",
      ОбработатьОткрытиеГлавногоМеню
    );
    м_События.ДобавитьОбработчик(
      "список-выбранварианттрансляции",
      ОбновитьСписокВариантовТрансляции
    );
    м_События.ДобавитьОбработчик(
      "список-началорекламы",
      обработатьНачалоРекламы
    );
    м_События.ДобавитьОбработчик("список-конецрекламы", обработатьКонецРекламы);
    м_События.ДобавитьОбработчик(
      "проигрыватель-переполненбуфер",
      обработатьПереполнениеБуфера
    );
    м_События.ДобавитьОбработчик("проигрыватель-пауза", ОбработатьПаузу);
    м_События.ДобавитьОбработчик(
      "настройки-измениласьпредустановка-буферизация",
      ОбработатьИзменениеПредустановкиБуферизации
    );
    м_События.ДобавитьОбработчик(
      "twitch-полученыметаданныеканала",
      ПоказатьМетаданныеКанала
    );
    м_События.ДобавитьОбработчик(
      "twitch-полученыметаданныезрителя",
      ПоказатьМетаданныеЗрителя
    );
    м_События.ДобавитьОбработчик(
      "twitch-полученыметаданныетрансляции",
      ПоказатьМетаданныеТрансляции
    );
    document.documentElement.addEventListener("click", ОбработатьЛевыйЩелчок);
    document.addEventListener("keydown", ОбработатьНажатиеИОтпусканиеКлавы);
    document.addEventListener("keyup", ОбработатьНажатиеИОтпусканиеКлавы);
    Узел("скорость").addEventListener(
      "change",
      ОбработатьИзменениеСкоростиВоспроизведения
    );
    Узел("варианттрансляции").addEventListener(
      "change",
      ОбработатьИзменениеВариантаТрансляции
    );
    Узел("менятьгромкостьколесом").addEventListener(
      "change",
      ОбработатьИзменениеГромкостиКолесом
    );
    Узел("адресчата").addEventListener("change", ОбработатьИзменениеАдресаЧата);
    Узел("выборфайладляимпортанастроек").addEventListener(
      "change",
      ОбработатьВыборФайлаДляИмпортаНастроек
    );
    запуститьИзменениеГромкостиКолесом();
    ИзменитьСостояние(СОСТОЯНИЕ_ЗАПУСК);
    ПрименитьМасштабированиеИзображения();
    ПрименитьАнимациюИнтерфейса();
    м_Оформление.Запустить();
  }
  function ИзменитьСостояние(чНовоеСостояние) {
    Проверить(Number.isInteger(чНовоеСостояние));
    if (_чСостояние === чНовоеСостояние) {
      return;
    }
    м_Журнал.Вот(
      `[Управление] Состояние трансляции изменилось с ${_чСостояние} на ${чНовоеСостояние}`
    );
    _чСостояние = чНовоеСостояние;
    document.body.setAttribute("data-состояние", чНовоеСостояние);
    ИзменитьКнопку(
      "переключитьтрансляцию",
      чНовоеСостояние === СОСТОЯНИЕ_ОСТАНОВКА ||
        чНовоеСостояние === СОСТОЯНИЕ_ПОВТОР
    );
    м_События.ПослатьСобытие("управление-изменилосьсостояние", чНовоеСостояние);
    switch (чНовоеСостояние) {
      case СОСТОЯНИЕ_ЗАПУСК:
        ПоказатьМетаданныеТрансляции({
          сТипТрансляции: null,
          сНазваниеТрансляции: НАЗВАНИЕ_ТРАНСЛЯЦИИ_НЕИЗВЕСТНО,
          сНазваниеИгры: null,
          сАдресИгры: null,
          кЗрителей: null,
          чДлительностьТрансляции: null,
        });
        м_Twitch.ЗавершитьСборМетаданныхТрансляции(true);
        break;

      case СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ:
        ПоказатьМетаданныеТрансляции({
          сТипТрансляции: null,
          сНазваниеТрансляции: НАЗВАНИЕ_ТРАНСЛЯЦИИ_НЕИЗВЕСТНО,
          сНазваниеИгры: null,
          сАдресИгры: null,
          кЗрителей: null,
          чДлительностьТрансляции: null,
        });
        м_Twitch.НачатьСборМетаданныхТрансляции();
        break;

      case СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ:
        ПоказатьМетаданныеТрансляции({
          сТипТрансляции: "завершена",
          кЗрителей: null,
          чДлительностьТрансляции: null,
        });
        м_Twitch.ЗавершитьСборМетаданныхТрансляции(true);
        Узел("статистика-задержкатрансляции").textContent = "";
        break;

      case СОСТОЯНИЕ_ЗАГРУЗКА:
      case СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ:
      case СОСТОЯНИЕ_ВОСПРОИЗВЕДЕНИЕ:
        break;

      case СОСТОЯНИЕ_ОСТАНОВКА:
      case СОСТОЯНИЕ_ПОВТОР:
        ПоказатьМетаданныеТрансляции({
          кЗрителей: null,
        });
        м_Twitch.ЗавершитьСборМетаданныхТрансляции(false);
        Узел("статистика-задержкатрансляции").textContent = "";
        break;

      default:
        Проверить(false);
    }
  }
  function ПолучитьСостояние() {
    Проверить(_чСостояние !== void 0);
    return _чСостояние;
  }
  function ПоказатьМетаданныеКанала(оМетаданные) {
    if (оМетаданные.сИмя !== void 0) {
      ИзменитьЗаголовокДокумента(
        `${оМетаданные.сИмя} - Alternate Player for Twitch.tv`
      );
      Узел("канал-имя").textContent = оМетаданные.сИмя;
    }
    if (оМетаданные.сАватар !== void 0) {
      Проверить(оМетаданные.сАватар);
      Узел("канал-аватар").src = оМетаданные.сАватар;
    }
    if (оМетаданные.сОписание !== void 0) {
      Узел("канал-описание").textContent = оМетаданные.сОписание || "";
    }
    if (оМетаданные.сКодЯзыка !== void 0) {
      const уз = Узел("канал-язык");
      if (оМетаданные.сКодЯзыка) {
        уз.textContent = м_i18n.ПолучитьНазваниеЯзыка(оМетаданные.сКодЯзыка);
        ПоказатьЭлемент(уз.parentNode, true);
      } else {
        ПоказатьЭлемент(уз.parentNode, false);
      }
    }
    if (оМетаданные.кПодписчиков !== void 0) {
      const уз = Узел("канал-подписчиков");
      if (Number.isFinite(оМетаданные.кПодписчиков)) {
        уз.textContent = м_i18n.ФорматироватьЧисло(оМетаданные.кПодписчиков);
        ПоказатьЭлемент(уз.parentNode, true);
      } else {
        ПоказатьЭлемент(уз.parentNode, false);
      }
    }
    if (оМетаданные.чКаналСоздан !== void 0) {
      const уз = Узел("канал-создан");
      if (Number.isFinite(оМетаданные.чКаналСоздан)) {
        уз.textContent = м_i18n.ФорматироватьДату(оМетаданные.чКаналСоздан);
        ПоказатьЭлемент(уз.parentNode, true);
      } else {
        ПоказатьЭлемент(уз.parentNode, false);
      }
    }
    if (оМетаданные.моКоманды !== void 0) {
      ПоказатьМассивСсылок(оМетаданные.моКоманды, "канал-команды");
    }
  }
  function ПоказатьМассивСсылок(моСсылки, пВставить) {
    const узВставить = Узел(пВставить);
    if (моСсылки.length === 0) {
      ПоказатьЭлемент(узВставить.parentNode, false);
    } else {
      const оФрагмент = document.createDocumentFragment();
      for (let оСсылка, ы = 0; (оСсылка = моСсылки[ы]); ++ы) {
        if (ы !== 0) {
          оФрагмент.appendChild(document.createTextNode(", "));
        }
        Проверить(
          ЭтоНепустаяСтрока(оСсылка.сАдрес) && ЭтоНепустаяСтрока(оСсылка.сИмя)
        );
        const узСсылка = document.createElement("a");
        узСсылка.href = оСсылка.сАдрес;
        узСсылка.rel = "noopener noreferrer";
        узСсылка.target = "_blank";
        if (оСсылка.сОписание) {
          узСсылка.className = "канал-ссылка";
          узСсылка.title = оСсылка.сОписание;
        }
        узСсылка.textContent = оСсылка.сИмя;
        оФрагмент.appendChild(узСсылка);
      }
      узВставить.textContent = "";
      узВставить.appendChild(оФрагмент);
      ПоказатьЭлемент(узВставить.parentNode, true);
    }
  }
  function ПоказатьМетаданныеЗрителя(оМетаданные) {
    if (оМетаданные.сИмя !== void 0) {
      if (оМетаданные.сИмя !== "") {
        Узел("зритель-имя").textContent = оМетаданные.сИмя;
      } else {
        м_i18n.InsertAdjacentHtmlMessage("зритель-имя", "content", "F0590");
      }
    }
    if (оМетаданные.чПодписка !== void 0) {
      const уз = Узел("зритель-подписка");
      if (оМетаданные.чПодписка === ПОДПИСКА_ОБНОВЛЯЕТСЯ) {
        уз.classList.add("обновляется");
      } else {
        уз.classList.remove("обновляется");
        уз.setAttribute("data-подписка", оМетаданные.чПодписка);
        Узел("зритель-уведомлять").checked =
          оМетаданные.чПодписка === ПОДПИСКА_УВЕДОМЛЯТЬ;
      }
    }
  }
  const _оТипыТрансляции = {
    завершена: ["J0145", "J0100", false],
    прямая: ["J0146", "J0149", true],
    повтор: ["J0147", "J0150", false],
  };
  function ПоказатьМетаданныеТрансляции(оМетаданные) {
    if (оМетаданные.сТипТрансляции !== void 0) {
      const уз = Узел("типтрансляции");
      if (typeof оМетаданные.сТипТрансляции == "string") {
        Проверить(_оТипыТрансляции.hasOwnProperty(оМетаданные.сТипТрансляции));
        уз.textContent = Текст(_оТипыТрансляции[оМетаданные.сТипТрансляции][0]);
        уз.parentElement.title = Текст(
          _оТипыТрансляции[оМетаданные.сТипТрансляции][1]
        );
        уз.classList.toggle(
          "прямаятрансляция",
          _оТипыТрансляции[оМетаданные.сТипТрансляции][2]
        );
        ПоказатьЭлемент(уз.parentElement, true);
      } else {
        ПоказатьЭлемент(уз.parentElement, false);
      }
      м_Медиазапрос.обновитьБыстро();
    }
    if (оМетаданные.сНазваниеТрансляции !== void 0) {
      Проверить(оМетаданные.сНазваниеТрансляции !== null);
      const уз = Узел("названиетрансляции");
      уз.title = оМетаданные.сНазваниеТрансляции + Текст("J0101");
      уз.textContent = оМетаданные.сНазваниеТрансляции;
      м_Медиазапрос.обновитьБыстро();
    }
    if (оМетаданные.сНазваниеИгры !== void 0) {
      const уз = Узел("категориятрансляции");
      if (оМетаданные.сНазваниеИгры) {
        уз.textContent = оМетаданные.сНазваниеИгры;
        уз.title = уз.previousElementSibling.title =
          оМетаданные.сНазваниеИгры + Текст("J0102");
        if (оМетаданные.сАдресИгры) {
          уз.href = оМетаданные.сАдресИгры;
        } else {
          уз.removeAttribute("href");
        }
        ПоказатьЭлемент(уз, true);
        ПоказатьЭлемент(уз.previousElementSibling, true);
      } else {
        ПоказатьЭлемент(уз, false);
        ПоказатьЭлемент(уз.previousElementSibling, false);
      }
      м_Медиазапрос.обновитьБыстро();
    }
    if (оМетаданные.кЗрителей !== void 0) {
      const уз = Узел("количествозрителей");
      if (
        Number.isFinite(оМетаданные.кЗрителей) &&
        оМетаданные.кЗрителей >= 0
      ) {
        уз.textContent = м_i18n.ФорматироватьЧисло(оМетаданные.кЗрителей);
        ПоказатьЭлемент(уз, true);
        ПоказатьЭлемент(уз.previousElementSibling, true);
      } else {
        ПоказатьЭлемент(уз, false);
        ПоказатьЭлемент(уз.previousElementSibling, false);
      }
      м_Медиазапрос.обновитьБыстро();
    }
    if (оМетаданные.чДлительностьТрансляции !== void 0) {
      Узел("позиция").textContent =
        Number.isFinite(оМетаданные.чДлительностьТрансляции) &&
        оМетаданные.чДлительностьТрансляции >= 0
          ? м_i18n.ПеревестиСекундыВСтроку(
              оМетаданные.чДлительностьТрансляции / 1e3,
              false
            )
          : "";
    }
  }
  return {
    Запустить,
    ПолучитьСостояние,
    ИзменитьСостояние,
    получитьСкоростьПовтора,
    ОбновитьКоличествоДорожек,
    ОстановитьПросмотрТрансляции,
  };
})();

const м_Чат = (() => {
  let _узЧат = null;
  //! <iframe>
  function ПолучитьПоложениеПанели() {
    switch (
      getComputedStyle(document.getElementById("проигрывательичат"))
        .flexDirection
    ) {
      case "column-reverse":
        return ВЕРХНЯЯ_СТОРОНА;

      case "row":
        return ПРАВАЯ_СТОРОНА;

      case "column":
        return НИЖНЯЯ_СТОРОНА;

      case "row-reverse":
        return ЛЕВАЯ_СТОРОНА;

      default:
        Проверить(false);
    }
  }
  function ВставитьПанель() {
    if (_узЧат) {
      return;
    }
    const сАдрес = м_Twitch.открытьЧат();
    м_Журнал.Вот(`[Чат] Вставляю iframe ${сАдрес}`);
    _узЧат = document.createElement("iframe");
    _узЧат.src = сАдрес;
    _узЧат.id = "чат";
    _узЧат.width = м_Настройки.Получить("чШиринаПанелиЧата");
    _узЧат.height = м_Настройки.Получить("чВысотаПанелиЧата");
    Узел("размерчата").insertAdjacentElement("afterend", _узЧат);
  }
  function УдалитьПанель() {
    if (_узЧат) {
      м_Журнал.Вот(`[Чат] Удаляю iframe ${_узЧат.src}`);
      м_Twitch.закрытьЧат();
      _узЧат.remove();
      _узЧат = null;
    }
  }
  function ПрименитьАдрес() {
    if (_узЧат) {
      м_Журнал.Окак("[Чат] Меняю адрес iframe");
      УдалитьПанель();
      ВставитьПанель();
    }
  }
  function ПрименитьСостояниеПанели() {
    const чСостояние = м_Настройки.Получить("чСостояниеЧата");
    м_Журнал.Окак(`[Чат] Новое состояние панели: ${чСостояние}`);
    ОтменитьПеретаскиваниеПанели();
    switch (чСостояние) {
      case ЧАТ_ВЫГРУЖЕН:
        document.body.classList.add("скрытьчат");
        УдалитьПанель();
        break;

      case ЧАТ_СКРЫТ:
        ВставитьПанель();
        document.body.classList.add("скрытьчат");
        break;

      case ЧАТ_ПАНЕЛЬ:
        ВставитьПанель();
        document.body.classList.remove("скрытьчат");
        break;

      default:
        Проверить(false);
    }
    м_Медиазапрос.обновитьМедленно();
  }
  function ПрименитьПоложениеПанели() {
    ОтменитьПеретаскиваниеПанели();
    const оКлассы = document.body.classList;
    if (м_Настройки.Получить("лАвтоПоложениеЧата")) {
      оКлассы.add("автоположениечата");
      оКлассы.toggle(
        "чатвверху",
        м_Настройки.Получить("чВертикальноеПоложениеЧата") === ВЕРХНЯЯ_СТОРОНА
      );
      оКлассы.toggle(
        "чатслева",
        м_Настройки.Получить("чГоризонтальноеПоложениеЧата") === ЛЕВАЯ_СТОРОНА
      );
    } else {
      const чПоложение = м_Настройки.Получить("чПоложениеПанелиЧата");
      оКлассы.remove("автоположениечата");
      оКлассы.toggle("чатвверху", чПоложение === ВЕРХНЯЯ_СТОРОНА);
      оКлассы.toggle("чатсправа", чПоложение === ПРАВАЯ_СТОРОНА);
      оКлассы.toggle("чатвнизу", чПоложение === НИЖНЯЯ_СТОРОНА);
      оКлассы.toggle("чатслева", чПоложение === ЛЕВАЯ_СТОРОНА);
    }
    м_Медиазапрос.обновитьМедленно();
  }
  function СохранитьИПрименитьСостояниеЗакрытойПанели(чНовоеСостояние) {
    м_Настройки.Изменить("чСостояниеЗакрытогоЧата", чНовоеСостояние);
    const чСостояние = м_Настройки.Получить("чСостояниеЧата");
    if (
      (чСостояние === ЧАТ_ВЫГРУЖЕН || чСостояние === ЧАТ_СКРЫТ) &&
      чСостояние !== чНовоеСостояние
    ) {
      м_Настройки.Изменить("чСостояниеЧата", чНовоеСостояние);
      ПрименитьСостояниеПанели();
    }
  }
  function ПереключитьСостояниеПанели() {
    const лПолноэкранныйРежим = м_ПолноэкранныйРежим.Включен();
    switch (м_Настройки.Получить("чСостояниеЧата")) {
      case ЧАТ_ВЫГРУЖЕН:
      case ЧАТ_СКРЫТ:
        м_Настройки.Изменить("чСостояниеЧата", ЧАТ_ПАНЕЛЬ, лПолноэкранныйРежим);
        break;

      case ЧАТ_ПАНЕЛЬ:
        м_Настройки.Изменить(
          "чСостояниеЧата",
          лПолноэкранныйРежим
            ? ЧАТ_СКРЫТ
            : м_Настройки.Получить("чСостояниеЗакрытогоЧата"),
          лПолноэкранныйРежим
        );
        break;

      default:
        Проверить(false);
    }
    ПрименитьСостояниеПанели();
  }
  function ПереключитьПоложениеПанели() {
    if (м_Настройки.Получить("чСостояниеЧата") !== ЧАТ_ПАНЕЛЬ) {
      return;
    }
    let чПоложение;
    if (м_Настройки.Получить("лАвтоПоложениеЧата")) {
      м_Настройки.Изменить("лАвтоПоложениеЧата", false);
      чПоложение = ПолучитьПоложениеПанели();
    } else {
      чПоложение = м_Настройки.Получить("чПоложениеПанелиЧата");
    }
    switch (чПоложение) {
      case ВЕРХНЯЯ_СТОРОНА:
        м_Настройки.Изменить("чПоложениеПанелиЧата", ПРАВАЯ_СТОРОНА);
        break;

      case ПРАВАЯ_СТОРОНА:
        м_Настройки.Изменить("чПоложениеПанелиЧата", НИЖНЯЯ_СТОРОНА);
        break;

      case НИЖНЯЯ_СТОРОНА:
        м_Настройки.Изменить("чПоложениеПанелиЧата", ЛЕВАЯ_СТОРОНА);
        break;

      case ЛЕВАЯ_СТОРОНА:
        м_Настройки.Изменить("чПоложениеПанелиЧата", ВЕРХНЯЯ_СТОРОНА);
        break;

      default:
        Проверить(false);
    }
    ПрименитьПоложениеПанели();
  }
  function ОбработатьПеретаскиваниеПанели(оПараметры) {
    if (оПараметры.лОтмена) {
      return;
    }
    const чПоложение = ПолучитьПоложениеПанели();
    if (
      оПараметры.чШаг !== 1 &&
      оПараметры._чНачальноеПоложение !== чПоложение
    ) {
      м_Журнал.Ой(
        `[Чат] Положение перетаскиваемой панели изменилось с ${оПараметры._чНачальноеПоложение} на ${чПоложение}`
      );
      ОтменитьПеретаскиваниеПанели();
      return;
    }
    switch (оПараметры.чШаг) {
      case 1:
        оПараметры._чНачальноеПоложение = чПоложение;
        if (чПоложение === ПРАВАЯ_СТОРОНА || чПоложение === ЛЕВАЯ_СТОРОНА) {
          оПараметры._чНачальныйРазмер = Number.parseInt(
            getComputedStyle(_узЧат).width,
            10
          );
        } else {
          оПараметры._чНачальныйРазмер = Number.parseInt(
            getComputedStyle(_узЧат).height,
            10
          );
        }
        break;

      case 2:
        if (чПоложение === ПРАВАЯ_СТОРОНА || чПоложение === ЛЕВАЯ_СТОРОНА) {
          if (оПараметры.лИзмениласьX) {
            const чМаксРазмер =
              Number.parseInt(
                getComputedStyle(Узел("проигрывательичат")).width,
                10
              ) -
              Number.parseInt(
                getComputedStyle(Узел("проигрыватель")).minWidth,
                10
              );
            _узЧат.width = Math.max(
              Math.min(
                чПоложение === ЛЕВАЯ_СТОРОНА
                  ? оПараметры._чНачальныйРазмер + оПараметры.чИзменениеX
                  : оПараметры._чНачальныйРазмер - оПараметры.чИзменениеX,
                чМаксРазмер
              ),
              0
            );
            м_Медиазапрос.обновитьМедленно();
          }
        } else if (оПараметры.лИзмениласьY) {
          const чМаксРазмер =
            Number.parseInt(
              getComputedStyle(Узел("проигрывательичат")).height,
              10
            ) -
            Number.parseInt(
              getComputedStyle(Узел("проигрыватель")).minHeight,
              10
            );
          _узЧат.height = Math.max(
            Math.min(
              чПоложение === ВЕРХНЯЯ_СТОРОНА
                ? оПараметры._чНачальныйРазмер + оПараметры.чИзменениеY
                : оПараметры._чНачальныйРазмер - оПараметры.чИзменениеY,
              чМаксРазмер
            ),
            0
          );
          м_Медиазапрос.обновитьМедленно();
        }
        break;

      case 3:
        if (чПоложение === ПРАВАЯ_СТОРОНА || чПоложение === ЛЕВАЯ_СТОРОНА) {
          м_Настройки.Изменить(
            "чШиринаПанелиЧата",
            Number.parseInt(getComputedStyle(_узЧат).width, 10)
          );
        } else {
          м_Настройки.Изменить(
            "чВысотаПанелиЧата",
            Number.parseInt(getComputedStyle(_узЧат).height, 10)
          );
        }
        break;

      default:
        Проверить(false);
    }
  }
  function ОтменитьПеретаскиваниеПанели() {
    м_Тащилка.ОтменитьПеретаскивание("размерчата");
  }
  ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме = -1;
  function ОбработатьИзменениеПолноэкранногоРежима(лВключен) {
    if (лВключен) {
      if (
        ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме === -1
      ) {
        ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме =
          м_Настройки.Получить("чСостояниеЧата");
        if (
          ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме ===
          ЧАТ_ПАНЕЛЬ
        ) {
          м_Настройки.Изменить("чСостояниеЧата", ЧАТ_СКРЫТ, true);
          ПрименитьСостояниеПанели();
        }
      }
    } else if (
      ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме !== -1
    ) {
      if (
        ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме ===
        ЧАТ_ПАНЕЛЬ
      ) {
        м_Настройки.Изменить("чСостояниеЧата", ЧАТ_ПАНЕЛЬ);
        ПрименитьСостояниеПанели();
      } else if (
        м_Настройки.Получить("чСостояниеЧата") === ЧАТ_СКРЫТ &&
        м_Настройки.Получить("чСостояниеЗакрытогоЧата") === ЧАТ_ВЫГРУЖЕН
      ) {
        м_Настройки.Изменить("чСостояниеЧата", ЧАТ_ВЫГРУЖЕН);
        ПрименитьСостояниеПанели();
      }
      ОбработатьИзменениеПолноэкранногоРежима.чСостояниеВОбычномРежиме = -1;
    }
  }
  function Восстановить() {
    ПрименитьСостояниеПанели();
    ПрименитьПоложениеПанели();
    м_События.ДобавитьОбработчик(
      "тащилка-перетаскивание-размерчата",
      ОбработатьПеретаскиваниеПанели
    );
    м_События.ДобавитьОбработчик(
      "полноэкранныйрежим-изменен",
      ОбработатьИзменениеПолноэкранногоРежима
    );
  }
  return {
    Восстановить,
    ПрименитьПоложениеПанели,
    ПрименитьАдрес,
    СохранитьИПрименитьСостояниеЗакрытойПанели,
    ПереключитьСостояниеПанели,
    ПереключитьПоложениеПанели,
  };
})();

const м_Аудиоустройство = (() => {
  const УСТРОЙСТВО_ПО_УМОЛЧАНИЮ = "default";
  const УСТРОЙСТВО_ДЛЯ_ОБЩЕНИЯ = "communications";
  let _oMediaElement = null;
  function обновитьСписокУстройствИВыбратьУстройство() {
    const узСписокУстройств = Узел("аудиоустройства-список");
    м_Журнал.Окак("[Аудиоустройства] Получаю список медиаустройств");
    navigator.mediaDevices
      .enumerateDevices()
      .then(
        (моМедиаустройства) => {
          if (!Array.isArray(моМедиаустройства)) {
            м_Журнал.Ой("[Аудиоустройства] Список аудиоустройств недоступен");
            ПоказатьЭлемент("аудиоустройства", false);
            return;
          }
          узСписокУстройств.length = 0;
          м_Журнал.Вот(
            `[Аудиоустройства] Текущее устройство ${_oMediaElement.sinkId}`
          );
          const сТекущееУстройство =
            _oMediaElement.sinkId === УСТРОЙСТВО_ПО_УМОЛЧАНИЮ
              ? ""
              : _oMediaElement.sinkId;
          const сСохраненноеУстройство =
            м_Настройки.Получить("сИдАудиоустройства");
          let кУстройств = 0,
            кНастоящихУстройств = 0;
          let лЕстьУстройствоПоУмолчанию = false,
            лЕстьТекущееУстройство = сТекущееУстройство === "",
            лЕстьСохраненноеУстройство = сСохраненноеУстройство === "";
          for (const оМедиаустройство of моМедиаустройства) {
            м_Журнал.Вот(
              `[Аудиоустройства] Медиаустройство kind=${оМедиаустройство.kind} deviceId=${оМедиаустройство.deviceId} groupId=${оМедиаустройство.groupId} label=${оМедиаустройство.label}`
            );
            if (оМедиаустройство.kind === "audiooutput") {
              кУстройств++;
              if (оМедиаустройство.deviceId && оМедиаустройство.label) {
                кНастоящихУстройств +=
                  оМедиаустройство.deviceId !== УСТРОЙСТВО_ПО_УМОЛЧАНИЮ &&
                  оМедиаустройство.deviceId !== УСТРОЙСТВО_ДЛЯ_ОБЩЕНИЯ;
                лЕстьУстройствоПоУмолчанию =
                  лЕстьУстройствоПоУмолчанию ||
                  оМедиаустройство.deviceId === УСТРОЙСТВО_ПО_УМОЛЧАНИЮ;
                лЕстьТекущееУстройство =
                  лЕстьТекущееУстройство ||
                  оМедиаустройство.deviceId === сТекущееУстройство;
                лЕстьСохраненноеУстройство =
                  лЕстьСохраненноеУстройство ||
                  оМедиаустройство.deviceId === сСохраненноеУстройство;
                узСписокУстройств.add(
                  new Option(
                    оМедиаустройство.label,
                    оМедиаустройство.deviceId === УСТРОЙСТВО_ПО_УМОЛЧАНИЮ
                      ? ""
                      : оМедиаустройство.deviceId
                  )
                );
              }
            }
          }
          if (кУстройств !== 0 && узСписокУстройств.length === 0) {
            if (
              получитьВерсиюДвижкаБраузера() <= 68 &&
              chrome.extension.inIncognitoContext
            ) {
              ПоказатьЭлемент("аудиоустройства", false);
            } else {
              ПоказатьЭлемент("аудиоустройства-доступ", true);
              ПоказатьЭлемент(узСписокУстройств, false);
              ПоказатьЭлемент("аудиоустройства", true);
              м_События.ДобавитьОбработчик(
                "управление-левыйщелчок",
                обработатьЩелчокИПолучитьДоступКАудиоустройствам
              );
            }
          } else {
            if (!лЕстьУстройствоПоУмолчанию && узСписокУстройств.length !== 0) {
              узСписокУстройств.add(new Option("Default", ""), 0);
            }
            узСписокУстройств.value = сТекущееУстройство;
            узСписокУстройств.disabled = узСписокУстройств.length === 0;
            ПоказатьЭлемент("аудиоустройства-доступ", false);
            ПоказатьЭлемент(узСписокУстройств, true);
            if (кНастоящихУстройств > 1) {
              ПоказатьЭлемент("аудиоустройства", true);
              узСписокУстройств.addEventListener(
                "change",
                обработатьВыборУстройства
              );
            }
            let сВыбрать;
            if (
              лЕстьСохраненноеУстройство &&
              сСохраненноеУстройство !== сТекущееУстройство
            ) {
              сВыбрать = сСохраненноеУстройство;
            } else if (
              !лЕстьТекущееУстройство &&
              узСписокУстройств.length !== 0
            ) {
              сВыбрать = "";
            }
            if (сВыбрать !== void 0) {
              м_Журнал.Окак(`[Аудиоустройства] Выбираю устройство ${сВыбрать}`);
              return _oMediaElement.setSinkId(сВыбрать).then(
                () => {
                  м_Журнал.Вот("[Аудиоустройства] Устройство выбрано");
                  узСписокУстройств.value = сВыбрать;
                },
                (пПричина) => {
                  м_Журнал.Ой(
                    `[Аудиоустройства] Не удалось выбрать устройство: ${пПричина}`
                  );
                }
              );
            }
          }
        },
        (пПричина) => {
          м_Журнал.Ой(
            `[Аудиоустройства] Не удалось получить список медиаустройств: ${пПричина}`
          );
          узСписокУстройств.length = 0;
          узСписокУстройств.disabled = true;
        }
      )
      .catch(м_Отладка.ПойманоИсключение);
  }
  function обработатьЩелчокИПолучитьДоступКАудиоустройствам({ сПозывной }) {
    if (сПозывной !== "аудиоустройства-доступ") {
      return;
    }
    м_Журнал.Окак("[Аудиоустройства] Запрашиваю разрешение contentSettings");
    chrome.permissions.request(
      {
        permissions: ["contentSettings"],
      },
      ДобавитьОбработчикИсключений((лРазрешениеПолучено) => {
        if (лРазрешениеПолучено) {
          м_Журнал.Окак("[Аудиоустройства] Получаю доступ к аудиоустройствам");
          chrome.contentSettings.microphone.set(
            {
              primaryPattern: `*://${chrome.runtime.id}/*`,
              setting: "allow",
              scope: chrome.extension.inIncognitoContext
                ? "incognito_session_only"
                : "regular",
            },
            ДобавитьОбработчикИсключений(() => {
              if (chrome.runtime.lastError) {
                м_Журнал.Ой(
                  `[Аудиоустройства] Доступ не получен: ${chrome.runtime.lastError.message}`
                );
                м_Уведомление.ПоказатьЖопу();
              }
              обновитьСписокУстройствИВыбратьУстройство();
            })
          );
        } else {
          м_Журнал.Ой(
            `[Аудиоустройства] Разрешение не получено: ${
              chrome.runtime.lastError && chrome.runtime.lastError.message
            }`
          );
          м_Уведомление.ПоказатьЖопу();
        }
      })
    );
  }
  const обработатьВыборУстройства = ДобавитьОбработчикИсключений((оСобытие) => {
    if (оСобытие.target.selectedIndex !== -1) {
      const сВыбрать = оСобытие.target.value;
      м_Журнал.Окак(
        `[Аудиоустройства] Выбираю устройство ${сВыбрать} вместо ${_oMediaElement.sinkId}`
      );
      _oMediaElement
        .setSinkId(сВыбрать)
        .then(
          () => {
            м_Журнал.Вот("[Аудиоустройства] Устройство выбрано");
            м_Настройки.Изменить("сИдАудиоустройства", сВыбрать);
          },
          (пПричина) => {
            м_Журнал.Ой(
              `[Аудиоустройства] Не удалось выбрать устройство: ${пПричина}`
            );
            м_Уведомление.ПоказатьЖопу();
            обновитьСписокУстройствИВыбратьУстройство();
          }
        )
        .catch(м_Отладка.ПойманоИсключение);
    }
  });
  function запустить(oMediaElement) {
    if (_oMediaElement) {
      return;
    }
    _oMediaElement = oMediaElement;
    if (!("setSinkId" in _oMediaElement)) {
      м_Журнал.Ой(
        "[Аудиоустройства] Браузер не поддерживает MediaElement.setSinkId"
      );
      return;
    }
    if (!("addEventListener" in navigator.mediaDevices)) {
      м_Журнал.Ой(
        "[Аудиоустройства] Браузер не поддерживает MediaDevices.ondevicechange"
      );
    } else {
      navigator.mediaDevices.addEventListener(
        "devicechange",
        ДобавитьОбработчикИсключений(обновитьСписокУстройствИВыбратьУстройство)
      );
    }
    обновитьСписокУстройствИВыбратьУстройство();
  }
  return {
    запустить,
  };
})();

const м_Проигрыватель = (() => {
  const ИНТЕРВАЛ_УДАЛЕНИЯ_ВИДЕО = 10;
  const ИСЧЕРПАНИЕ_БУФЕРА = (1 / 25) * 7;
  const ПОВТОР_ДОСТУПЕН_ЕСЛИ_ПРОСМОТРЕНО = 1;
  const ПРОВЕРИТЬ_ДОБАВЛЕНИЕ_СЕГМЕНТА = -1;
  const ПРОВЕРИТЬ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ = -2;
  const ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ = -3;
  const ПРОВЕРИТЬ_ОСТАНОВКА_ВОСПРОИЗВЕДЕНИЯ = -4;
  const ВОСПРОИЗВЕДЕНИЕ_НЕВОЗМОЖНО = 0;
  const ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО = 1;
  const ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО_ПОСЛЕ_ПЕРЕМОТКИ = 2;
  let _oMediaElement;
  let _oMediaSource;
  let _oMediaSourceBuffer = null;
  let _лЕстьВидеодорожка = false;
  let _чВоспроизведениеНачиналось = 0;
  let _лАсинхроннаяОперация = false;
  let _сРазмерБуфера = "чНачалоВоспроизведения";
  let _лЖдатьЗаполненияБуфера = true;
  let _чСмещениеТрансляции = NaN;
  let _лНужнаПеремотка = false;
  const _оПрямаяТрансляция = {
    ОбработатьSourceOpen() {
      Проверить(_oMediaElement.paused);
      _чВоспроизведениеНачиналось = Math.max(_чВоспроизведениеНачиналось, 1);
      ДобавитьСледующийСегмент();
    },
    ОбработатьProgress() {
      if (!_лАсинхроннаяОперация) {
        НачатьВоспроизведение(
          ПроверитьПозициюВоспроизведения(ПРОВЕРИТЬ_ДОБАВЛЕНИЕ_СЕГМЕНТА)
        );
      }
    },
    ОбработатьWaiting() {},
    ОбработатьPlaying() {
      if (
        м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ &&
        !_oMediaElement.paused
      ) {
        м_Управление.ИзменитьСостояние(СОСТОЯНИЕ_ВОСПРОИЗВЕДЕНИЕ);
      }
    },
    ОбработатьSeeking: ЗАГЛУШКА,
    ОбработатьSeeked: НачатьВоспроизведение,
    ОбработатьEnded() {
      ПерезагрузитьПроигрыватель(СОСТОЯНИЕ_ЗАГРУЗКА);
    },
    ОбработатьTimeUpdate() {
      if (
        !_oMediaElement.seeking &&
        !_oMediaElement.paused &&
        !_oMediaElement.ended
      ) {
        ПроверитьПозициюВоспроизведения(ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ);
      }
    },
  };
  const _оПовтор = {
    лПауза: true,
    ОбработатьSourceOpen() {
      Проверить(_oMediaElement.paused);
      _чВоспроизведениеНачиналось = Math.max(_чВоспроизведениеНачиналось, 1);
    },
    ОбработатьProgress: ЗАГЛУШКА,
    ОбработатьWaiting: ЗАГЛУШКА,
    ОбработатьPlaying: ЗАГЛУШКА,
    ОбработатьSeeked: ЗАГЛУШКА,
    ОбработатьSeeking() {
      м_Шкала.ЗадатьПросмотрено(_oMediaElement.currentTime);
    },
    ОбработатьEnded() {
      if (!this.лПауза) {
        _oMediaElement.play();
      }
    },
    ОбработатьTimeUpdate() {
      if (!this.лПауза && !_oMediaElement.seeking) {
        this.ПроверитьПозициюВоспроизведения(ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ);
      }
      м_Шкала.ЗадатьПросмотрено(_oMediaElement.currentTime);
    },
    ПроверитьПозициюВоспроизведения(чВремя) {
      Проверить(Number.isFinite(чВремя));
      Проверить(
        чВремя === ПРОВЕРИТЬ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ ||
          чВремя === ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ ||
          чВремя >= 0
      );
      const оБуфер = _oMediaElement.buffered;
      const чПоследняяОбласть = оБуфер.length - 1;
      const чТекущееВремя = _oMediaElement.currentTime + 1e-4;
      let чПеремотатьДо = чВремя >= 0 ? чВремя : чТекущееВремя;
      let сПричинаПеремотки = "";
      for (let лНачатьСначала = false; ; ) {
        let чНужноДляВоспроизведения =
          чВремя === ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ
            ? ИСЧЕРПАНИЕ_БУФЕРА
            : МИН_РАЗМЕР_БУФЕРА;
        for (let чОбласть = 0; чОбласть <= чПоследняяОбласть; ++чОбласть) {
          if (чПеремотатьДо < оБуфер.start(чОбласть)) {
            чНужноДляВоспроизведения = МИН_РАЗМЕР_БУФЕРА;
            сПричинаПеремотки += "Перепрыгиваю яму. ";
            чПеремотатьДо = оБуфер.start(чОбласть);
          }
          if (
            оБуфер.end(чОбласть) - чПеремотатьДо >=
            чНужноДляВоспроизведения
          ) {
            break;
          }
        }
        if (this.лПауза || чПеремотатьДо < м_Шкала.ПолучитьКонец()) {
          break;
        }
        if (лНачатьСначала) {
          ПоказатьСостояние("Ой", `Бесконечная перемотка Время=${чВремя}`);
          return;
        }
        чПеремотатьДо = м_Шкала.ПолучитьНачало();
        сПричинаПеремотки += "Начинаю сначала. ";
        лНачатьСначала = true;
      }
      if (чПеремотатьДо !== чТекущееВремя) {
        ПоказатьСостояние(
          "Окак",
          `${сПричинаПеремотки}Перематываю до ${чПеремотатьДо}`
        );
        _oMediaElement.currentTime = чПеремотатьДо;
      }
    },
  };
  let _оПоведение = _оПрямаяТрансляция;
  function ПоказатьСостояние(сВажность, сЗапись) {
    const оБуфер =
      _oMediaSource.sourceBuffers.length !== 0
        ? _oMediaSource.sourceBuffers[0]
        : null;
    const сОбластиБуфера = ПеревестиОбластиВСтроку(
      оБуфер ? оБуфер.buffered : null
    );
    const сОбласти = ПеревестиОбластиВСтроку(_oMediaElement.buffered);
    const лОбластиРавны = сОбластиБуфера === сОбласти;
    if (
      сВажность === "Вот" &&
      ((оБуфер && оБуфер.buffered.length > 1) ||
        _oMediaElement.buffered.length > 1)
    ) {
      сВажность = "Окак";
    }
    if (_oMediaElement.error || !лОбластиРавны) {
      сВажность = "Ой";
    }
    м_Журнал[сВажность](
      `${сЗапись.charAt(0) === "[" ? "" : "[Проигрыватель] "}${сЗапись} •••` +
        (оБуфер && оБуфер.updating ? " [U]" : "") +
        (_oMediaElement.paused ? " [P]" : "") +
        (_oMediaElement.seeking ? " [S]" : "") +
        (_oMediaElement.ended ? " [E]" : "") +
        (_oMediaElement.error ? ` error=${_oMediaElement.error.code}` : "") +
        (_oMediaElement.src.startsWith("blob:") ||
        _oMediaElement.src.startsWith("mediasource:")
          ? ""
          : ` src=${_oMediaElement.src}`) +
        (_oMediaSource.readyState === "open"
          ? ""
          : ` MSE.readyState=${_oMediaSource.readyState}`) +
        (_oMediaSource.sourceBuffers.length === 1
          ? ""
          : ` MSE.buffers=${_oMediaSource.sourceBuffers.length}`) +
        (_oMediaElement.networkState === HTMLMediaElement.NETWORK_LOADING
          ? ""
          : ` networkState=${_oMediaElement.networkState}`) +
        ` readyState=${_oMediaElement.readyState}` +
        ` currentTime=${_oMediaElement.currentTime}` +
        (лОбластиРавны
          ? ` buffered=${сОбласти}`
          : ` MSE.buffered=${сОбластиБуфера} buffered=${сОбласти}`) +
        (_oMediaElement.duration === Infinity
          ? ""
          : ` duration=${_oMediaElement.duration}`) +
        ` seekable=${ПеревестиОбластиВСтроку(_oMediaElement.seekable)}` +
        ` played=${ПеревестиОбластиВСтроку(_oMediaElement.played)}`
    );
  }
  function ПеревестиОбластиВСтроку(оОбласти) {
    let сРезультат = "";
    if (оОбласти && оОбласти.length !== 0) {
      let чОбласть = Math.max(оОбласти.length - 5, 0);
      if (чОбласть !== 0) {
        сРезультат = `[${чОбласть}]`;
      }
      for (; чОбласть < оОбласти.length; ++чОбласть) {
        if (чОбласть !== 0) {
          сРезультат += `(${(
            оОбласти.start(чОбласть) - оОбласти.end(чОбласть - 1)
          ).toFixed(3)})`;
        }
        сРезультат += `${оОбласти.start(чОбласть)}-${оОбласти.end(чОбласть)}`;
      }
    }
    return сРезультат;
  }
  function ПолучитьЗаполненностьБуфера(оБуфер = _oMediaElement.buffered) {
    let чПросмотрено = 0;
    let чНеПросмотрено = 0;
    if (оБуфер.length !== 0) {
      const чНачало = оБуфер.start(0);
      const чКонец = оБуфер.end(оБуфер.length - 1);
      const чТекущееВремя = Ограничить(
        _oMediaElement.currentTime,
        чНачало,
        чКонец
      );
      чПросмотрено = чТекущееВремя - чНачало;
      чНеПросмотрено = чКонец - чТекущееВремя;
    }
    return {
      чПросмотрено,
      чНеПросмотрено,
    };
  }
  function ПолучитьКоличествоПропущенныхКадров() {
    return _oMediaElement.getVideoPlaybackQuality
      ? _oMediaElement.getVideoPlaybackQuality()
      : {
          totalVideoFrames: _oMediaElement.webkitDecodedFrameCount,
          droppedVideoFrames: _oMediaElement.webkitDroppedFrameCount,
        };
  }
  function ПолучитьПозициюВоспроизведенияТрансляции(лДляКлипа) {
    if (Number.isNaN(_чСмещениеТрансляции)) {
      return -1;
    }
    СледитьЗаОшибками();
    let чПозиция = _oMediaElement.currentTime;
    if (лДляКлипа && м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ПОВТОР) {
      чПозиция = м_Шкала.ПолучитьКонец();
    }
    if (!лДляКлипа && чПозиция === 0 && _oMediaSourceBuffer !== null) {
      if (_oMediaSourceBuffer.buffered.length !== 0) {
        чПозиция = _oMediaSourceBuffer.buffered.start(0);
      }
    }
    return чПозиция === 0 ? -1 : Math.max(чПозиция + _чСмещениеТрансляции, 0);
  }
  function РасчитатьСмещениеТрансляции(оСегмент) {
    if (
      Number.isFinite(оСегмент.пДанные.чПозицияКодирования) &&
      Number.isFinite(оСегмент.пДанные.чПозицияТрансляции)
    ) {
      const чСмещениеТрансляции =
        оСегмент.пДанные.чПозицияТрансляции -
        оСегмент.пДанные.чПозицияКодирования;
      м_Журнал[
        Math.abs(чСмещениеТрансляции - _чСмещениеТрансляции) > 2 ? "Ой" : "Вот"
      ](
        `[Проигрыватель] Смещение трансляции: ${м_Журнал.F1(
          чСмещениеТрансляции
        )}с`
      );
      _чСмещениеТрансляции = чСмещениеТрансляции;
    }
  }
  function ПоказатьЗадержкуТрансляции(оСегмент) {
    if (
      м_Статистика.ОкноОткрыто() &&
      Number.isFinite(оСегмент.пДанные.чПозицияКодирования) &&
      Number.isFinite(оСегмент.пДанные.чВремяКодирования) &&
      _oMediaElement.currentTime !== 0
    ) {
      const чПолучение =
        (performance.now() +
          г_чТочноеВремя -
          оСегмент.пДанные.чВремяКодирования) /
        1e3;
      const чВоспроизведение =
        оСегмент.пДанные.чПозицияКодирования - _oMediaElement.currentTime;
      const сЗадержка = `${чПолучение.toFixed(1)} + ${чВоспроизведение.toFixed(
        1
      )} = ${(чПолучение + чВоспроизведение).toFixed(1)}`;
      м_Журнал[чПолучение > 0 && чВоспроизведение > -0.1 ? "Вот" : "Ой"](
        `[Проигрыватель] Задержка трансляции: ${сЗадержка}с`
      );
      Узел("статистика-задержкатрансляции").textContent = сЗадержка;
    }
  }
  function ПрименитьГромкость() {
    _oMediaElement.volume =
      м_Настройки.Получить("чГромкость2") / МАКСИМАЛЬНАЯ_ГРОМКОСТЬ;
    _oMediaElement.muted = м_Настройки.Получить("лПриглушить");
  }
  function ПерезагрузитьИЖдатьЗаполненияБуфера(чНовоеСостояние) {
    _лЖдатьЗаполненияБуфера = true;
    ПерезагрузитьПроигрыватель(чНовоеСостояние);
  }
  function ПерезагрузитьПроигрыватель(чНовоеСостояние) {
    ПоказатьСостояние("Окак", "Перезагрузка проигрывателя");
    м_Управление.ИзменитьСостояние(чНовоеСостояние);
    _оПоведение = _оПрямаяТрансляция;
    _oMediaSourceBuffer = null;
    _лНужнаПеремотка = false;
    подключитьMediaSourceКMediaElement();
  }
  function СледитьЗаОшибками() {
    if (_oMediaElement.error) {
      м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0206");
    }
  }
  const СледитьЗаСобытиямиMediaSource = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      СледитьЗаОшибками();
      const сЗапись = `[MediaSource] ${оСобытие.type}`;
      switch (оСобытие.type) {
        case "sourceopen":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьSourceOpen();
          break;

        case "sourceended":
        case "sourceclose":
          ПоказатьСостояние("Вот", сЗапись);
          break;

        default:
          м_Журнал.Вот(сЗапись);
      }
    }
  );
  const СледитьЗаСобытиямиMediaElement = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      СледитьЗаОшибками();
      const сЗапись = `[MediaElement] ${оСобытие.type}`;
      switch (оСобытие.type) {
        case "loadstart":
          ПоказатьСостояние(
            "Вот",
            `${сЗапись} src=${_oMediaElement.src} currentSrc=${_oMediaElement.currentSrc}`
          );
          break;

        case "progress":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьProgress();
          break;

        case "abort":
          ПоказатьСостояние("Вот", сЗапись);
          break;

        case "waiting":
          ПоказатьСостояние("Окак", сЗапись);
          _оПоведение.ОбработатьWaiting();
          break;

        case "playing":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьPlaying();
          break;

        case "seeking":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьSeeking();
          break;

        case "seeked":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьSeeked();
          break;

        case "ended":
          ПоказатьСостояние("Вот", сЗапись);
          _оПоведение.ОбработатьEnded();
          break;

        case "timeupdate":
          м_Журнал.Вот(
            `${сЗапись} readyState=${_oMediaElement.readyState} currentTime=${
              _oMediaElement.currentTime
            } НеПросмотрено=${м_Журнал.F2(
              ПолучитьЗаполненностьБуфера().чНеПросмотрено
            )}`
          );
          _оПоведение.ОбработатьTimeUpdate();
          break;

        default:
          м_Журнал.Вот(сЗапись);
      }
    }
  );
  function ПроверитьПозициюВоспроизведения(
    чИсточникПроверки,
    чБудетДобавлено = 0
  ) {
    const оБуфер = _oMediaElement.buffered;
    const чПоследняяОбласть = оБуфер.length - 1;
    if (чПоследняяОбласть === -1) {
      return false;
    }
    const чТекущееВремя = _oMediaElement.currentTime + 1e-4;
    let чПеремотатьДо = Math.max(чТекущееВремя, оБуфер.start(0));
    let сПричинаПеремотки = "";
    const чНеПросмотрено = оБуфер.end(чПоследняяОбласть) - чПеремотатьДо;
    if (чИсточникПроверки === ПРОВЕРИТЬ_ДОБАВЛЕНИЕ_СЕГМЕНТА) {
      const чРазмерБуфера = м_Настройки.Получить("чМаксРазмерБуфера");
      const чПереполнение =
        чРазмерБуфера + м_Настройки.Получить("чРастягиваниеБуфера");
      if (чНеПросмотрено <= чПереполнение) {
        return;
      }
      if (_чВоспроизведениеНачиналось === 2) {
        м_События.ПослатьСобытие(
          "проигрыватель-переполненбуфер",
          чНеПросмотрено - чРазмерБуфера
        );
      }
      сПричинаПеремотки += `Переполнен буфер проигрывателя ${чНеПросмотрено.toFixed(
        2
      )}с > ${чПереполнение}с. `;
      чПеремотатьДо = оБуфер.end(чПоследняяОбласть) - чРазмерБуфера - 0.1;
    }
    if (
      чИсточникПроверки === ПРОВЕРИТЬ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ &&
      _чВоспроизведениеНачиналось !== 2
    ) {
      _чВоспроизведениеНачиналось = 2;
      const чПереполнение =
        м_Настройки.Получить("чМаксРазмерБуфера") +
        м_Статистика.ПолучитьTargetDuration() / 2;
      if (чНеПросмотрено > чПереполнение) {
        сПричинаПеремотки += `Превышена задержка трансляции ${чНеПросмотрено.toFixed(
          2
        )}с > ${чПереполнение}с. `;
        чПеремотатьДо = оБуфер.end(чПоследняяОбласть) - чПереполнение;
      }
    }
    Проверить(ИСЧЕРПАНИЕ_БУФЕРА < МИН_РАЗМЕР_БУФЕРА);
    let чНужноДляВоспроизведения =
      чИсточникПроверки === ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ
        ? ИСЧЕРПАНИЕ_БУФЕРА
        : чИсточникПроверки === ПРОВЕРИТЬ_ОСТАНОВКА_ВОСПРОИЗВЕДЕНИЯ
        ? Infinity
        : МИН_РАЗМЕР_БУФЕРА;
    let лВоспроизведениеВозможно = _oMediaSource.readyState === "ended";
    let чДоКонцаОбласти;
    for (let чОбласть = 0; чОбласть <= чПоследняяОбласть; ++чОбласть) {
      if (чПеремотатьДо < оБуфер.start(чОбласть)) {
        чНужноДляВоспроизведения = МИН_РАЗМЕР_БУФЕРА;
        сПричинаПеремотки += "Перепрыгиваю яму. ";
        чПеремотатьДо = оБуфер.start(чОбласть);
      }
      чДоКонцаОбласти = оБуфер.end(чОбласть) - чПеремотатьДо;
      if (чДоКонцаОбласти >= чНужноДляВоспроизведения) {
        лВоспроизведениеВозможно = true;
        break;
      }
    }
    if (!лВоспроизведениеВозможно && !_oMediaElement.paused) {
      БуферИсчерпан(чДоКонцаОбласти, чНеПросмотрено, чБудетДобавлено);
    }
    if (
      (лВоспроизведениеВозможно ||
        чИсточникПроверки === ПРОВЕРИТЬ_ДОБАВЛЕНИЕ_СЕГМЕНТА) &&
      (чПеремотатьДо !== чТекущееВремя || _лНужнаПеремотка)
    ) {
      if (чПеремотатьДо === чТекущееВремя) {
        чПеремотатьДо = _oMediaElement.currentTime;
      }
      ПоказатьСостояние(
        сПричинаПеремотки ? "Ой" : "Окак",
        `${сПричинаПеремотки}Перематываю до ${чПеремотатьДо}`
      );
      _лНужнаПеремотка = false;
      _oMediaElement.currentTime = чПеремотатьДо;
      return ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО_ПОСЛЕ_ПЕРЕМОТКИ;
    }
    return лВоспроизведениеВозможно
      ? ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО
      : ВОСПРОИЗВЕДЕНИЕ_НЕВОЗМОЖНО;
  }
  function НачатьВоспроизведение(чПроверка) {
    if (
      _oMediaElement.seeking ||
      чПроверка === ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО_ПОСЛЕ_ПЕРЕМОТКИ ||
      !_oMediaElement.paused ||
      _oMediaElement.ended
    ) {
      return;
    }
    if (_лЖдатьЗаполненияБуфера && _oMediaSource.readyState !== "ended") {
      const { чНеПросмотрено } = ПолучитьЗаполненностьБуфера();
      const чРазмерБуфера = м_Настройки.Получить(_сРазмерБуфера);
      if (чНеПросмотрено < чРазмерБуфера) {
        м_Журнал.Вот(
          `[Проигрыватель] В буфере не просмотрено ${м_Журнал.F3(
            чНеПросмотрено
          )}с < ${чРазмерБуфера}с`
        );
        return;
      }
      м_Журнал.Окак(
        `[Проигрыватель] В буфере не просмотрено ${м_Журнал.F3(
          чНеПросмотрено
        )}с >= ${чРазмерБуфера}с`
      );
    } else {
      м_Журнал.Окак("[Проигрыватель] Не нужно ждать заполнения буфера");
    }
    switch (ПроверитьПозициюВоспроизведения(ПРОВЕРИТЬ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ)) {
      case ВОСПРОИЗВЕДЕНИЕ_НЕВОЗМОЖНО:
        ПоказатьСостояние(
          "Ой",
          `Не найдена область >= ${МИН_РАЗМЕР_БУФЕРА}с для начала воспроизведения`
        );
        _лЖдатьЗаполненияБуфера = true;
        break;

      case ВОСПРОИЗВЕДЕНИЕ_ВОЗМОЖНО:
        ПоказатьСостояние("Окак", "Начало воспроизведения");
        _лЖдатьЗаполненияБуфера = true;
        _oMediaElement.play();
        м_Управление.ИзменитьСостояние(СОСТОЯНИЕ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ);
    }
  }
  function ОстановитьВоспроизведение(чНовоеСостояние) {
    if (чНовоеСостояние !== void 0) {
      м_Управление.ИзменитьСостояние(чНовоеСостояние);
    }
    _oMediaElement.pause();
  }
  function БуферИсчерпан(
    чДоКонцаПоследнейОбласти,
    чНеПросмотрено,
    чБудетДобавлено
  ) {
    Проверить(_oMediaSource.readyState !== "ended");
    Проверить(чДоКонцаПоследнейОбласти < МИН_РАЗМЕР_БУФЕРА);
    const лДосрочно = чНеПросмотрено > 1;
    м_Статистика.ИсчерпанБуферПроигрывателя(лДосрочно);
    _сРазмерБуфера = "чМаксРазмерБуфера";
    const чРазмерБуфера = м_Настройки.Получить(_сРазмерБуфера);
    if (
      чДоКонцаПоследнейОбласти + чБудетДобавлено >= МИН_РАЗМЕР_БУФЕРА &&
      чНеПросмотрено + чБудетДобавлено >= чРазмерБуфера
    ) {
      ПоказатьСостояние(
        лДосрочно ? "Ой" : "Окак",
        `Буфер исчерпан, остановка не нужна БудетДобавлено=${м_Журнал.F3(
          чБудетДобавлено
        )}с ДоКонцаПоследнейОбласти=${м_Журнал.F3(
          чДоКонцаПоследнейОбласти
        )}с НеПросмотрено=${м_Журнал.F3(
          чНеПросмотрено
        )}с РазмерБуфера=${чРазмерБуфера}с`
      );
    } else {
      ПоказатьСостояние(
        лДосрочно ? "Ой" : "Окак",
        `Приостанавливаю воспроизведение для заполнения буфера ДоКонцаПоследнейОбласти=${м_Журнал.F3(
          чДоКонцаПоследнейОбласти
        )}с НеПросмотрено=${м_Журнал.F3(
          чНеПросмотрено
        )}с РазмерБуфера=${чРазмерБуфера}с`
      );
      _лНужнаПеремотка = true;
      ОстановитьВоспроизведение(СОСТОЯНИЕ_ЗАГРУЗКА);
    }
  }
  function ЗавершитьПоток(оСегмент) {
    ПоказатьСостояние(
      "Окак",
      `Сегмент ${оСегмент.чНомер} вызвал окончание потока`
    );
    if (
      _oMediaElement.buffered.length === 0 ||
      (_oMediaElement.paused &&
        ПолучитьЗаполненностьБуфера().чНеПросмотрено < ИСЧЕРПАНИЕ_БУФЕРА + 0.1)
    ) {
      ПерезагрузитьИЖдатьЗаполненияБуфера(СОСТОЯНИЕ_ЗАГРУЗКА);
    } else {
      _лЖдатьЗаполненияБуфера =
        typeof оСегмент.пДанные == "number" ||
        (!_oMediaElement.seeking && _oMediaElement.paused);
      _oMediaSource.endOfStream();
      НачатьВоспроизведение();
    }
  }
  function УдалитьПросмотренноеВидео(оСегмент) {
    const МАКС_ДЛИТЕЛЬНОСТЬ_ПОВТОРА_ЗВУКА = 640;
    СледитьЗаОшибками();
    let чДлительностьПовтора = м_Настройки.Получить("чДлительностьПовтора2");
    if (чДлительностьПовтора === АВТОНАСТРОЙКА) {
      if (_лЕстьВидеодорожка) {
        return Promise.resolve(оСегмент);
      }
      чДлительностьПовтора = МАКС_ДЛИТЕЛЬНОСТЬ_ПОВТОРА_ЗВУКА;
    }
    const { чПросмотрено } = ПолучитьЗаполненностьБуфера(
      _oMediaSourceBuffer.buffered
    );
    if (чПросмотрено < чДлительностьПовтора + ИНТЕРВАЛ_УДАЛЕНИЯ_ВИДЕО) {
      return Promise.resolve(оСегмент);
    }
    const чУдалитьДо = _oMediaElement.currentTime - чДлительностьПовтора;
    return new Promise((фВыполнить, фОтказаться) => {
      ПоказатьСостояние(
        "Вот",
        `Удаляю просмотренное видео Просмотрено=${м_Журнал.F3(
          чПросмотрено
        )}с УдалитьДо=${м_Журнал.F3(чУдалитьДо)}с`
      );
      _oMediaSourceBuffer.addEventListener("updateend", Удалено);
      let чПрошлоВремени = -performance.now();
      _oMediaSourceBuffer.remove(0, чУдалитьДо);
      function Удалено() {
        try {
          if (_oMediaSourceBuffer === null) {
            фОтказаться(ОтменаОбещания.ПРИЧИНА);
          } else {
            чПрошлоВремени += performance.now();
            _oMediaSourceBuffer.removeEventListener("updateend", Удалено);
            const { чПросмотрено } = ПолучитьЗаполненностьБуфера(
              _oMediaSourceBuffer.buffered
            );
            ПоказатьСостояние(
              чПрошлоВремени > 100 || чПросмотрено < МИН_РАЗМЕР_БУФЕРА
                ? "Ой"
                : "Вот",
              `Просмотренное видео удалено за ${м_Журнал.F0(
                чПрошлоВремени
              )}мс Просмотрено=${м_Журнал.F0(чПросмотрено)}с`
            );
            фВыполнить(оСегмент);
          }
        } catch (пИсключение) {
          фОтказаться(пИсключение);
        }
      }
    });
  }
  function ДобавитьСегментИнициализации(оСегмент) {
    return ДобавитьСегмент(
      оСегмент,
      оСегмент.пДанные.мбСегментИнициализации,
      "сегмент инициализации"
    );
  }
  function ДобавитьМедиасегмент(оСегмент) {
    return ДобавитьСегмент(
      оСегмент,
      оСегмент.пДанные.мбМедиасегмент,
      "медиасегмент"
    );
  }
  function ДобавитьСегмент(оСегмент, мбДобавить, сДобавить) {
    СледитьЗаОшибками();
    return new Promise((фВыполнить, фОтказаться) => {
      ПоказатьСостояние("Вот", `Добавляю ${сДобавить} ${оСегмент.чНомер}`);
      _oMediaSourceBuffer.addEventListener("updateend", Добавлено);
      let чПрошлоВремени = -performance.now();
      _oMediaSourceBuffer.appendBuffer(мбДобавить);
      function Добавлено() {
        try {
          if (_oMediaSourceBuffer === null) {
            фОтказаться(ОтменаОбещания.ПРИЧИНА);
          } else {
            чПрошлоВремени += performance.now();
            _oMediaSourceBuffer.removeEventListener("updateend", Добавлено);
            ПоказатьСостояние(
              чПрошлоВремени > 100 ? "Ой" : "Вот",
              `Добавлен ${сДобавить} ${оСегмент.чНомер} за ${м_Журнал.F0(
                чПрошлоВремени
              )}мс`
            );
            фВыполнить(оСегмент);
          }
        } catch (пИсключение) {
          фОтказаться(пИсключение);
        }
      }
    });
  }
  function ПроверитьИсчерпаниеБуфера(оСегмент) {
    if (
      !_oMediaElement.seeking &&
      !_oMediaElement.paused &&
      !_oMediaElement.ended
    ) {
      ПроверитьПозициюВоспроизведения(
        ПРОВЕРИТЬ_ВОСПРОИЗВЕДЕНИЕ,
        оСегмент.чДлительность
      );
    }
    if (_oMediaElement.played.length !== 0) {
      м_Статистика.обновитьЗаполненностьБуфера(
        ПолучитьЗаполненностьБуфера().чНеПросмотрено
      );
    }
    return оСегмент;
  }
  function СегментБылДобавлен(оСегмент) {
    _лАсинхроннаяОперация = false;
    г_моОчередь.Удалить(оСегмент);
    РасчитатьСмещениеТрансляции(оСегмент);
    if (!(г_моОчередь[0] && г_моОчередь[0].пДанные === СОСТОЯНИЕ_ПОВТОР)) {
      const чПроверка = ПроверитьПозициюВоспроизведения(
        ПРОВЕРИТЬ_ДОБАВЛЕНИЕ_СЕГМЕНТА
      );
      if (
        !(
          г_моОчередь[0] && г_моОчередь[0].чОбработка === ОБРАБОТКА_ПРЕОБРАЗОВАН
        )
      ) {
        НачатьВоспроизведение(чПроверка);
        ПоказатьЗадержкуТрансляции(оСегмент);
      }
    }
    ДобавитьСледующийСегмент();
  }
  const СегментНеБылДобавлен = ДобавитьОбработчикИсключений((пПричина) => {
    _лАсинхроннаяОперация = false;
    if (пПричина === "ДОБАВЛЕНИЕ СЕГМЕНТА ОТЛОЖЕНО") {
      return;
    }
    if (пПричина === ОтменаОбещания.ПРИЧИНА) {
      м_Журнал.Вот("[Проигрыватель] Отменено добавление сегмента");
    } else {
      throw пПричина;
    }
  });
  function ПредотвратитьПереполнениеОчереди() {
    const { чДлительность } = г_моОчередь.ПодсчитатьПреобразованныеСегменты();
    if (чДлительность >= ПЕРЕПОЛНЕНИЕ_БУФЕРА) {
      м_Журнал.Ой(
        `[Проигрыватель] MediaSource закрыт слишком долго ${чДлительность}с >= ${ПЕРЕПОЛНЕНИЕ_БУФЕРА}с`
      );
      Проверить(
        м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ЗАПУСК ||
          м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ
      );
      м_Управление.ОстановитьПросмотрТрансляции();
    }
  }
  function НайтиИОбработатьСменуВариантаТрансляции() {
    for (let ы = г_моОчередь.length; --ы >= 0; ) {
      if (
        г_моОчередь[ы].пДанные === СОСТОЯНИЕ_СМЕНА_ВАРИАНТА &&
        г_моОчередь[ы].чОбработка === ОБРАБОТКА_ПРЕОБРАЗОВАН
      ) {
        г_моОчередь.ПоказатьСостояние();
        do {
          if (
            г_моОчередь[ы].пДанные === СОСТОЯНИЕ_СМЕНА_ВАРИАНТА ||
            typeof г_моОчередь[ы].пДанные != "number"
          ) {
            г_моОчередь.Удалить(ы);
          }
        } while (--ы >= 0);
        г_моОчередь.ПоказатьСостояние();
        ПерезагрузитьИЖдатьЗаполненияБуфера(СОСТОЯНИЕ_ЗАГРУЗКА);
        break;
      }
    }
  }
  function ДобавитьСледующийСегмент() {
    СледитьЗаОшибками();
    НайтиИОбработатьСменуВариантаТрансляции();
    const оСегмент = г_моОчередь[0];
    if (!оСегмент || оСегмент.чОбработка !== ОБРАБОТКА_ПРЕОБРАЗОВАН) {
      return;
    }
    Проверить(_оПоведение === _оПрямаяТрансляция);
    if (оСегмент.пДанные === СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ) {
      Проверить(_oMediaSource.sourceBuffers.length === 0);
      _чСмещениеТрансляции = NaN;
      м_Управление.ИзменитьСостояние(оСегмент.пДанные);
      г_моОчередь.Удалить(0);
      ДобавитьСледующийСегмент();
      return;
    }
    if (_лАсинхроннаяОперация) {
      return;
    }
    if (оСегмент.пДанные === СОСТОЯНИЕ_ПОВТОР) {
      Проверить(
        м_Управление.ПолучитьСостояние() !== СОСТОЯНИЕ_ОСТАНОВКА &&
          м_Управление.ПолучитьСостояние() !== СОСТОЯНИЕ_ПОВТОР
      );
      ЗапуститьПовтор();
      г_моОчередь.Удалить(0);
      ДобавитьСледующийСегмент();
      return;
    }
    const сГотовность = _oMediaSource.readyState;
    if (сГотовность !== "open") {
      м_Журнал.Вот(
        `[Проигрыватель] Добавление сегмента ${оСегмент.чНомер} отложено MediaSource.readyState=${сГотовность} MediaElement.src=${_oMediaElement.src}`
      );
      if (сГотовность === "closed" && _чВоспроизведениеНачиналось === 0) {
        ПредотвратитьПереполнениеОчереди();
      }
      return;
    }
    if (оСегмент.лРазрыв && _oMediaSource.sourceBuffers.length !== 0) {
      ЗавершитьПоток(оСегмент);
      return;
    }
    if (оСегмент.пДанные === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ) {
      Проверить(оСегмент.лРазрыв && _oMediaSource.sourceBuffers.length === 0);
      м_Управление.ИзменитьСостояние(оСегмент.пДанные);
      г_моОчередь.Удалить(0);
      ДобавитьСледующийСегмент();
      return;
    }
    if (_oMediaSource.sourceBuffers.length === 0) {
      ДобавитьБуферы(оСегмент);
      м_Управление.ОбновитьКоличествоДорожек(
        оСегмент.пДанные.лЕстьВидео,
        оСегмент.пДанные.лЕстьЗвук
      );
    }
    _лАсинхроннаяОперация = true;
    let оОбещание = УдалитьПросмотренноеВидео(оСегмент).then(
      ПроверитьИсчерпаниеБуфера
    );
    if (оСегмент.пДанные.мбСегментИнициализации) {
      оОбещание = оОбещание.then(ДобавитьСегментИнициализации);
    }
    оОбещание
      .then(ДобавитьМедиасегмент)
      .then(СегментБылДобавлен)
      .catch(СегментНеБылДобавлен);
  }
  function ПеремотатьПовторДо(чПеремотатьДо) {
    Проверить(м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ПОВТОР);
    _оПовтор.ПроверитьПозициюВоспроизведения(чПеремотатьДо);
  }
  function ПеремотатьПовторНа(лКадры, чПеремотатьНа) {
    Проверить(м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ПОВТОР);
    Проверить(Number.isFinite(чПеремотатьНа));
    if (лКадры) {
      чПеремотатьНа *=
        м_Статистика.ПолучитьДлительностьКадраВСекундах().чМинимальная;
    }
    if (чПеремотатьНа !== 0) {
      ПеремотатьПовторДо(
        Ограничить(
          _oMediaElement.currentTime + чПеремотатьНа,
          м_Шкала.ПолучитьНачало(),
          м_Шкала.ПолучитьКонец()
        )
      );
    }
  }
  function ПереключитьПаузу() {
    Проверить(м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ПОВТОР);
    if ((_оПовтор.лПауза = !_оПовтор.лПауза)) {
      м_Журнал.Окак("[Проигрыватель] Ставлю повтор на паузу");
      _oMediaElement.pause();
    } else {
      м_Журнал.Окак("[Проигрыватель] Снимаю повтор с паузы");
      _оПовтор.ПроверитьПозициюВоспроизведения(
        ПРОВЕРИТЬ_НАЧАЛО_ВОСПРОИЗВЕДЕНИЯ
      );
      _oMediaElement.play();
    }
    м_События.ПослатьСобытие("проигрыватель-пауза", _оПовтор.лПауза);
  }
  function ЗадатьСкоростьПовтора(чСкорость) {
    Проверить(чСкорость > 0);
    Проверить(м_Управление.ПолучитьСостояние() === СОСТОЯНИЕ_ПОВТОР);
    м_Журнал.Окак(`[Проигрыватель] Задана скорость ${чСкорость}`);
    _oMediaElement.playbackRate = чСкорость;
  }
  function ЗапуститьПовтор() {
    _оПовтор.лПауза = true;
    _оПоведение = _оПовтор;
    ОстановитьВоспроизведение();
    if (
      _oMediaSource.sourceBuffers.length !== 0 &&
      _oMediaSource.readyState === "open"
    ) {
      _oMediaSource.endOfStream();
    }
    if (
      _oMediaElement.played.length === 0 ||
      ПолучитьЗаполненностьБуфера().чПросмотрено <
        ПОВТОР_ДОСТУПЕН_ЕСЛИ_ПРОСМОТРЕНО
    ) {
      ПоказатьСостояние("Окак", "Повторять нечего");
      м_Управление.ИзменитьСостояние(СОСТОЯНИЕ_ОСТАНОВКА);
      return;
    }
    ПоказатьСостояние("Окак", "Запуск повтора");
    м_События.ПослатьСобытие("проигрыватель-пауза", _оПовтор.лПауза);
    м_Шкала.ЗадатьНачалоИКонец(
      _oMediaElement.buffered.start(0),
      _oMediaElement.buffered.end(_oMediaElement.buffered.length - 1)
    );
    м_Шкала.ЗадатьПросмотрено(_oMediaElement.currentTime);
    м_Управление.ИзменитьСостояние(СОСТОЯНИЕ_ПОВТОР);
    ЗадатьСкоростьПовтора(м_Управление.получитьСкоростьПовтора());
  }
  function ДобавитьБуферы(оСегмент) {
    м_Журнал.Окак(`[Проигрыватель] Добавляю буфер ${оСегмент.пДанные.сКодеки}`);
    Проверить(оСегмент.лРазрыв && оСегмент.пДанные.сКодеки);
    try {
      _oMediaSourceBuffer = _oMediaSource.addSourceBuffer(
        оСегмент.пДанные.сКодеки
      );
    } catch (пИсключение) {
      if (ЭтоОбъект(пИсключение) && пИсключение.name === "NotSupportedError") {
        м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0201");
      } else {
        м_Отладка.ПойманоИсключение(пИсключение);
      }
    }
    _лЕстьВидеодорожка = оСегмент.пДанные.лЕстьВидео;
    _oMediaSourceBuffer.addEventListener(
      "updatestart",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSourceBuffer.addEventListener(
      "update",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSourceBuffer.addEventListener(
      "updateend",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSourceBuffer.addEventListener(
      "abort",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSourceBuffer.addEventListener(
      "error",
      СледитьЗаСобытиямиMediaSource
    );
  }
  function подключитьMediaSourceКMediaElement() {
    if (_oMediaElement.src) {
      URL.revokeObjectURL(_oMediaElement.src);
    }
    _oMediaElement.src = URL.createObjectURL(_oMediaSource);
    м_Аудиоустройство.запустить(_oMediaElement);
  }
  function Запустить() {
    Проверить(!_oMediaElement);
    try {
      _oMediaSource = new MediaSource();
    } catch (пИсключение) {
      console.error(`MediaSource ${пИсключение}`);
      м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0221");
    }
    _oMediaSource.addEventListener("sourceopen", СледитьЗаСобытиямиMediaSource);
    _oMediaSource.addEventListener(
      "sourceended",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSource.addEventListener(
      "sourceclose",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSource.sourceBuffers.addEventListener(
      "addsourcebuffer",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaSource.sourceBuffers.addEventListener(
      "removesourcebuffer",
      СледитьЗаСобытиямиMediaSource
    );
    _oMediaElement = document.getElementById("глаз");
    ПрименитьГромкость();
    м_КартинкаВКартинке.запустить(_oMediaElement);
    for (let сСобытие of [
      "progress",
      "error",
      "playing",
      "seeking",
      "seeked",
      "ended",
      "timeupdate",
      "waiting",
      "loadstart",
      "suspend",
      "abort",
      "emptied",
      "stalled",
      "loadedmetadata",
      "loadeddata",
      "canplay",
      "canplaythrough",
      "durationchange",
      "play",
      "pause",
      "ratechange",
      "resize",
    ]) {
      _oMediaElement.addEventListener(сСобытие, СледитьЗаСобытиямиMediaElement);
    }
    подключитьMediaSourceКMediaElement();
    return true;
  }
  function Остановить() {
    if (_oMediaElement) {
      URL.revokeObjectURL(_oMediaElement.src);
      _oMediaElement.removeAttribute("src");
      _oMediaElement.load();
    }
  }
  return {
    Запустить,
    Остановить,
    ПолучитьЗаполненностьБуфера,
    ПолучитьКоличествоПропущенныхКадров,
    ПолучитьПозициюВоспроизведенияТрансляции,
    ПоказатьСостояние,
    Перезагрузить: ПерезагрузитьИЖдатьЗаполненияБуфера,
    ПрименитьГромкость,
    ДобавитьСледующийСегмент,
    ПеремотатьПовторДо,
    ПеремотатьПовторНа,
    ПереключитьПаузу,
    ЗадатьСкоростьПовтора,
  };
})();

const м_Список = (() => {
  const ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКА_С_РЕКЛАМОЙ = 2e3;
  const МИН_ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКОВ = 500;
  class ОбновлениеСписков {
    constructor(лБезРекламы) {
      this._лБезРекламы = лБезРекламы;
      this._оОтменаОбещания = null;
      this.очистить();
    }
    очистить() {
      this.оСписокВариантов = null;
      this.оСписокСегментов = null;
      this.оВыбранныйВариант = null;
    }
    запустить() {
      Проверить(!this._оОтменаОбещания);
      this._оОтменаОбещания = new ОтменаОбещания();
      this._обновить(this._оОтменаОбещания, -Infinity);
    }
    остановить() {
      if (this._оОтменаОбещания) {
        м_Журнал.Вот(
          `[Список] Останавливаю обновление списков ${+this._лБезРекламы}`
        );
        this._оОтменаОбещания.Отменить();
        this._оОтменаОбещания = null;
      }
    }
    сохранитьВариантТрансляции(оВариант) {
      м_Настройки.Изменить("сНазваниеВарианта", оВариант.сИдентификатор);
      м_Настройки.Изменить("чБитрейтВарианта", оВариант.чБитрейт);
    }
    выбратьВариантТрансляции(моВарианты) {
      const сСохраненныйИд = м_Настройки.Получить("сНазваниеВарианта");
      const чСохраненныйБитрейт = м_Настройки.Получить("чБитрейтВарианта");
      let оВыбранныйВариант = моВарианты.find(
        ({ сИдентификатор }) => сИдентификатор === сСохраненныйИд
      );
      if (!оВыбранныйВариант) {
        if (сСохраненныйИд === "chunked" || сСохраненныйИд === "audio_only") {
          оВыбранныйВариант = моВарианты[0];
        } else {
          оВыбранныйВариант = моВарианты.find(
            ({ сИдентификатор, чБитрейт }) =>
              сИдентификатор !== "audio_only" && чБитрейт <= чСохраненныйБитрейт
          );
          if (!оВыбранныйВариант) {
            оВыбранныйВариант = моВарианты.reduceRight((оРезультат, оВариант) =>
              оРезультат.сИдентификатор === "audio_only" ? оВариант : оРезультат
            );
          }
        }
      }
      м_Журнал.Вот(
        `[Список] Для списка ${+this._лБезРекламы} выбран вариант трансляции ${
          оВыбранныйВариант.сИдентификатор
        }/${
          оВыбранныйВариант.чБитрейт
        }. Сохраненный ${сСохраненныйИд}/${чСохраненныйБитрейт}`
      );
      return оВыбранныйВариант;
    }
    _обновить(оОтменаОбещания, чЧерез) {
      Проверить(ЭтоЧисло(чЧерез));
      if (чЧерез >= МИН_ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКОВ || чЧерез === -Infinity) {
        м_Журнал.Вот(
          `[Список] Обновление списков ${+this
            ._лБезРекламы} начнется через ${м_Журнал.F0(чЧерез)}мс`
        );
      } else {
        м_Журнал.Ой(
          `[Список] Обновление списков ${+this
            ._лБезРекламы} начнется через ${МИН_ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКОВ}мс вместо ${м_Журнал.F0(
            чЧерез
          )}мс`
        );
        чЧерез = МИН_ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКОВ;
      }
      let оОбещание = Ждать(оОтменаОбещания, чЧерез);
      let { оСписокВариантов, оВыбранныйВариант } = this;
      if (оСписокВариантов === null) {
        let сАбсолютныйАдресСпискаВариантов;
        оОбещание = оОбещание
          .then(() =>
            м_Twitch.ПолучитьАбсолютныйАдресСпискаВариантов(
              оОтменаОбещания,
              false,
              this._лБезРекламы
            )
          )
          .then((сРезультат) => {
            сАбсолютныйАдресСпискаВариантов = сРезультат;
            return м_Загрузчик.ЗагрузитьТекст(
              оОтменаОбещания,
              сАбсолютныйАдресСпискаВариантов,
              ЗАГРУЖАТЬ_СПИСОК_ВАРИАНТОВ_НЕ_ДОЛЬШЕ,
              `список вариантов ${+this._лБезРекламы}`,
              false
            );
          })
          .then((сРезультат) => {
            м_Отладка.СохранитьСписокВариантов(сРезультат);
            оСписокВариантов = РазобратьСписок(
              true,
              сАбсолютныйАдресСпискаВариантов,
              сРезультат
            );
            if (оСписокВариантов.моВарианты.length === 0) {
              throw `Список вариантов пуст`;
            }
          });
      }
      let чНачалоОбновления;
      оОбещание
        .then(() => {
          if (оВыбранныйВариант === null) {
            оВыбранныйВариант = this.выбратьВариантТрансляции(
              оСписокВариантов.моВарианты
            );
          }
          чНачалоОбновления = performance.now();
          return м_Загрузчик.ЗагрузитьТекст(
            оОтменаОбещания,
            оВыбранныйВариант.сАбсолютныйАдресСпискаСегментов,
            ЗАГРУЖАТЬ_СПИСОК_СЕГМЕНТОВ_НЕ_ДОЛЬШЕ,
            `список сегментов ${+this._лБезРекламы}`,
            false
          );
        })
        .then((сРезультат) => {
          м_Отладка.СохранитьСписокСегментов(сРезультат);
          const оСписокСегментов = РазобратьСписок(
            false,
            оВыбранныйВариант.сАбсолютныйАдресСпискаСегментов,
            сРезультат
          );
          let чИнтервалОбновления;
          if (
            this._этоТухлыйСписокСегментов(
              оСписокВариантов,
              оСписокСегментов,
              оВыбранныйВариант
            )
          ) {
            м_Статистика.ДобавленыСегментыВОчередь(0, 0);
            if (оСписокСегментов.лКонецСписка) {
              throw "КОНЕЦ_СПИСКА";
            }
            чИнтервалОбновления = ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКА_С_РЕКЛАМОЙ;
          } else {
            const лУкороченныйИнтервал =
              чЧерез === -Infinity || this.оСписокВариантов === null;
            this.оСписокВариантов = оСписокВариантов;
            this.оСписокСегментов = оСписокСегментов;
            this.оВыбранныйВариант = оВыбранныйВариант;
            чИнтервалОбновления =
              this._обновленСписокСегментов(лУкороченныйИнтервал);
          }
          this._обновить(
            оОтменаОбещания,
            чНачалоОбновления + чИнтервалОбновления - performance.now()
          );
          м_Загрузчик.ЗагрузитьСледующийСегмент();
        })
        .catch(
          ДобавитьОбработчикИсключений((пПричина) => {
            if (typeof пПричина == "string") {
              this._списокНеОбновлен(оОтменаОбещания, пПричина);
              м_Загрузчик.ЗагрузитьСледующийСегмент();
            } else if (пПричина === ОтменаОбещания.ПРИЧИНА) {
              м_Журнал.Вот(
                `[Список] Отменено обновление списков ${+this._лБезРекламы}`
              );
            } else {
              throw пПричина;
            }
          })
        );
    }
    _этоТухлыйСписокСегментов(
      оСписокВариантов,
      оСписокСегментов,
      оВыбранныйВариант
    ) {
      const ПОРОГ_СМЕНЫ_СЕССИИ = 5;
      Проверить(
        (this.оСписокВариантов === null) == (this.оСписокСегментов === null)
      );
      if (оСписокСегментов.моСегменты.length === 0) {
        м_Журнал.Ой(`[Список] Список сегментов ${+this._лБезРекламы} пуст`);
        return true;
      }
      if (this.оСписокСегментов === null) {
        return false;
      }
      Проверить(
        !(
          this.оСписокВариантов.сИдТрансляции !==
            оСписокВариантов.сИдТрансляции &&
          this.оСписокВариантов.чИдСессии === оСписокВариантов.чИдСессии
        )
      );
      if (
        this.оСписокСегментов.nTargetDuration !==
        оСписокСегментов.nTargetDuration
      ) {
        м_Журнал.Ой(
          `[Список] В списке ${+this._лБезРекламы} изменился target duration ${
            this.оСписокСегментов.nTargetDuration
          } ==> ${оСписокСегментов.nTargetDuration}`
        );
      }
      if (this.оВыбранныйВариант !== null) {
        const чРазница =
          оСписокСегментов.чПорядковыйНомер -
          this.оСписокСегментов.чПорядковыйНомер;
        const чНачало = Math.max(-чРазница, 0);
        const чКонец = Math.min(
          this.оСписокСегментов.моСегменты.length - чРазница,
          оСписокСегментов.моСегменты.length
        );
        for (
          let чНовый = чНачало, чСтарый = чНачало + чРазница;
          чНовый < чКонец;
          чНовый++, чСтарый++
        ) {
          if (
            оСписокСегментов.моСегменты[чНовый].сАдрес !==
            this.оСписокСегментов.моСегменты[чСтарый].сАдрес
          ) {
            м_Журнал.Ой(
              `[Список] В списке ${+this._лБезРекламы} у сегмента ${
                оСписокСегментов.чПорядковыйНомер + чНовый
              } изменился адрес ${ОграничитьДлинуСтроки(
                this.оСписокСегментов.моСегменты[чСтарый].сАдрес,
                100
              )} ==> ${ОграничитьДлинуСтроки(
                оСписокСегментов.моСегменты[чНовый].сАдрес,
                100
              )}`
            );
            оСписокСегментов.лХаос = true;
            break;
          }
        }
      }
      const чРазница =
        this.оСписокСегментов.чПорядковыйНомер +
        this.оСписокСегментов.моСегменты.length -
        оСписокСегментов.чПорядковыйНомер -
        оСписокСегментов.моСегменты.length;
      if (чРазница > 0) {
        if (this.оВыбранныйВариант === null && чРазница <= ПОРОГ_СМЕНЫ_СЕССИИ) {
          м_Журнал.Ой(
            `[Список] При переключении варианта в списке ${+this
              ._лБезРекламы} уменьшился порядковый номер ${
              this.оСписокСегментов.чПорядковыйНомер
            } + ${this.оСписокСегментов.моСегменты.length} ==> ${
              оСписокСегментов.чПорядковыйНомер
            } + ${оСписокСегментов.моСегменты.length}`
          );
          return false;
        }
        if (
          оСписокСегментов.чПорядковыйНомер === 0 ||
          чРазница > ПОРОГ_СМЕНЫ_СЕССИИ
        ) {
          м_Журнал.Ой(
            `[Список] Меняю ИдСессии: в списке ${+this
              ._лБезРекламы} уменьшился порядковый номер ${
              this.оСписокСегментов.чПорядковыйНомер
            } + ${this.оСписокСегментов.моСегменты.length} ==> ${
              оСписокСегментов.чПорядковыйНомер
            } + ${оСписокСегментов.моСегменты.length}`
          );
          оСписокВариантов.чИдСессии = _чИдСессии++;
          return false;
        }
        м_Журнал.Ой(
          `[Список] Получен протухший список ${+this
            ._лБезРекламы}: порядковый номер ${
            this.оСписокСегментов.чПорядковыйНомер
          } + ${this.оСписокСегментов.моСегменты.length} ==> ${
            оСписокСегментов.чПорядковыйНомер
          } + ${оСписокСегментов.моСегменты.length}`
        );
        return true;
      }
      if (
        this.оСписокСегментов.чПорядковыйНомер >
        оСписокСегментов.чПорядковыйНомер
      ) {
        м_Журнал.Ой(
          `[Список] В списке ${+this
            ._лБезРекламы} уменьшился порядковый номер ${
            this.оСписокСегментов.чПорядковыйНомер
          } ==> ${оСписокСегментов.чПорядковыйНомер}`
        );
      }
      return false;
    }
  }
  class ОбновлениеСписковСРекламой extends ОбновлениеСписков {
    constructor() {
      super(false);
    }
    _обновленСписокСегментов(лУкороченныйИнтервал) {
      const лСписокЗаканчиваетсяРекламой = этотСписокЗаканчиваетсяРекламой(
        this.оСписокСегментов
      );
      м_Twitch.отправитьДанныеСлеженияЗаРекламой(
        лСписокЗаканчиваетсяРекламой ? this.оСписокСегментов : null
      );
      if (!_лИдетРеклама || !лСписокЗаканчиваетсяРекламой) {
        лУкороченныйИнтервал =
          ДобавитьСегментыВОчередь(
            this.оСписокВариантов,
            this.оСписокСегментов,
            this.оВыбранныйВариант
          ) || лУкороченныйИнтервал;
      }
      if (this.оСписокСегментов.лКонецСписка) {
        throw "КОНЕЦ_СПИСКА";
      }
      задатьСостояниеРекламы(лСписокЗаканчиваетсяРекламой);
      return лСписокЗаканчиваетсяРекламой
        ? ИНТЕРВАЛ_ОБНОВЛЕНИЯ_СПИСКА_С_РЕКЛАМОЙ
        : получитьИнтервалОбновленияСпискаСегментов(
            this.оСписокСегментов,
            лУкороченныйИнтервал
          );
    }
    _списокНеОбновлен(оОтменаОбещания, сПричина) {
      if (сПричина === "ОТКАЗАНО_В_ДОСТУПЕ") {
        м_Управление.ОстановитьПросмотрТрансляции();
        м_Уведомление.ПоказатьЖопу();
      } else {
        м_Журнал[сПричина === "КОНЕЦ_СПИСКА" ? "Окак" : "Ой"](
          `[Список] Трансляция завершена. ${сПричина}`
        );
        ЗавершитьТрансляцию();
        this._обновить(
          оОтменаОбещания,
          получитьИнтервалОбновленияСпискаВариантов()
        );
      }
    }
  }
  /**
   * Class: AdFreePlaylistUpdate (ОбновлениеСписковБезРекламы)
   *
   * This class is responsible for managing the life cycle of the "Ad-Free" (clean) playlist stream.
   * It extends the base `PlaylistUpdate` (ОбновлениеСписков) functionality to handle specific checks
   * and behaviors required for the backup stream used to bypass automated twitch advertisements.
   *
   * Purpose:
   * When the main stream receives an identifying ad-marker, the player switches to this "Ad-Free" stream.
   * This class ensures that the backup stream is fetched, parsed, and validated to be free of ads
   * before adding segments to the buffer.
   *
   * @extends ОбновлениеСписков
   */
  class ОбновлениеСписковБезРекламы extends ОбновлениеСписков {
    /**
     * Constructor: AdFreePlaylistUpdate
     * Initializes the playlist updater with `isAdFree` (лБезРекламы) set to true.
     */
    constructor() {
      super(true); // true = Ad-Free / Backup stream mode
    }

    /**
     * Method: stop (остановить)
     * Stops the playlist update loop and clears all internal state.
     * This calls the parent `stop` to cancel any pending promises/timers,
     * and then `clean` (очистить) to wipe segment and variant processing data.
     */
    остановить() {
      super.остановить();
      this.очистить();
    }

    /**
     * Method: onSegmentListUpdated (_обновленСписокСегментов)
     * Called when a new playlist (segment list) has been successfully downloaded.
     *
     * Responsibilities:
     * 1. Checks if the new list ends with an ad (throws exception if true).
     * 2. Adds valid segments to the playback queue via `AddSegmentsToQueue`.
     * 3. Detects if the stream has ended (ENDLIST tag).
     * 4. Calculates the delay until the next playlist refresh.
     *
     * @param {boolean} лУкороченныйИнтервал (isShortenedInterval) - Flag indicating if the previous update happened faster than target duration.
     * @returns {number} The calculated delay in ms for the next update.
     * @throws {string} "Найдена реклама" - If the ad-free stream actually contains ads.
     * @throws {string} "КОНЕЦ_СПИСКА" - If the stream has ended.
     */
    _обновленСписокСегментов(лУкороченныйИнтервал) {
      // DEBUG MODIFICATION: BYPASS THE THROW
      if (этотСписокЗаканчиваетсяРекламой(this.оСписокСегментов)) {
        console.warn("Ad detected in backup stream, IGNORING and FORCING playback.");
        //throw "Найдена реклама";   // Original Code, bypassing for manual testing forcing any video to play during ad detected
      }
      лУкороченныйИнтервал = // isShortenedInterval
        ДобавитьСегментыВОчередь( // AddSegmentsToQueue
          this.оСписокВариантов, // ListOfVariants
          this.оСписокСегментов, // ListOfSegments
          this.оВыбранныйВариант // SelectedVariant
        ) || лУкороченныйИнтервал; // or isShortenedInterval
      if (this.оСписокСегментов.лКонецСписка) { // .isEndOfList
        throw "КОНЕЦ_СПИСКА"; // "END_OF_LIST"
      }
      return получитьИнтервалОбновленияСпискаСегментов( // getSegmentListUpdateInterval
        this.оСписокСегментов, // ListOfSegments
        лУкороченныйИнтервал // isShortenedInterval
      );
    }

    /**
     * Method: onListNotUpdated (_списокНеОбновлен)
     * Handles failures during the playlist update process.
     *
     * Since this is the backup stream, any failure is considered critical for the bypass feature.
     * It logs the error and stops the updater.
     *
     * @param {Object} оОтменаОбещания (promiseCancellation) - Token to check if the operation was cancelled.
     * @param {string} сПричина (sReason) - Failure reason string.
     */
    _списокНеОбновлен(оОтменаОбещания, сПричина) {
      // Code modified to implement debugging problems of not successfully falling
      // back to alternative video streams during AD playback.      
      console.error(`CRITICAL FAILURE: Backup stream rejected! Reason: ${сПричина}`);
      м_Журнал.Ой(`[Список] Список 1 не обновлен. ${сПричина}`);
      this.остановить();
    }
  }
  const _оСпискиСРекламой = new ОбновлениеСписковСРекламой();
  const _оСпискиБезРекламы = new ОбновлениеСписковБезРекламы();
  let _чСостояние = СОСТОЯНИЕ_ОСТАНОВКА;
  let _лИдетРеклама = false;
  let _чИнтервалОбновленияСпискаВариантов = -1;
  let _чИдСессии = 1;
  function РазобратьСписок(
    лЭтоСписокВариантов,
    сАбсолютныйАдресСписка,
    сРазбираемыйСписок
  ) {
    const МАКС_ПОДДЕРЖИВАЕМАЯ_ВЕРСИЯ_HLS = 7;
    if (сРазбираемыйСписок.includes("shelblock.proxy")) {
      м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0220");
    }
    if (!сРазбираемыйСписок.startsWith("#EXTM3U")) {
      throw `Вместо списка загружена какая-то фигня длиною ${сРазбираемыйСписок.length}\n${сРазбираемыйСписок}`;
    }
    let чВерсия = 1;
    let mapRenditionGroups,
      моВарианты,
      оНовыйВариант,
      сИдТрансляции,
      сАдресСлеженияЗаПросмотром;
    let nTargetDuration,
      чПорядковыйНомер,
      лКонецСписка,
      кРекламныхСегментов,
      сТипРекламы,
      кРоликов,
      чНомерРолика,
      чПродолжительностьРолика,
      сТокенРекламы,
      сИдРолика1,
      сИдРолика2,
      сИдРолика3,
      сИдРолика4,
      сИдРолика5,
      сИдРолика6,
      чНомерКвартеля,
      моСегменты,
      оНовыйСегмент;
    let лРазрыв, чВремя;
    if (лЭтоСписокВариантов) {
      mapRenditionGroups = new Map();
      моВарианты = [];
      оНовыйВариант = null;
      сИдТрансляции = "";
      сАдресСлеженияЗаПросмотром = "";
    } else {
      nTargetDuration = -1;
      чПорядковыйНомер = 0;
      лКонецСписка = false;
      кРекламныхСегментов = 0;
      сТипРекламы = "";
      моСегменты = [];
      оНовыйСегмент = null;
      лРазрыв = false;
      чВремя = NaN;
    }
    const рвТегИлиАдрес = /^#EXT([^:\r\n]+)(?::(.*))?$|^[^#\r\n].*$/gm;
    рвТегИлиАдрес.lastIndex = 7;
    for (
      let мсТегИлиАдрес;
      (мсТегИлиАдрес = рвТегИлиАдрес.exec(сРазбираемыйСписок));

    ) {
      const [сАдрес, сНазваниеТега = "", сЗначениеТега = ""] = мсТегИлиАдрес;
      try {
        switch (сНазваниеТега) {
          case "":
            if (лЭтоСписокВариантов) {
              Проверить(оНовыйВариант !== null);
              оНовыйВариант.сАбсолютныйАдресСпискаСегментов =
                ResolveRelativeUrl(сАдрес, сАбсолютныйАдресСписка);
              моВарианты.push(оНовыйВариант);
              оНовыйВариант = null;
            } else {
              браковать(оНовыйСегмент !== null);
              оНовыйСегмент.сАдрес = ResolveRelativeUrl(
                сАдрес,
                сАбсолютныйАдресСписка
              );
              оНовыйСегмент.лРазрыв = лРазрыв;
              моСегменты.push(оНовыйСегмент);
              лРазрыв = false;
              кРекламныхСегментов += Boolean(оНовыйСегмент.лРеклама);
              оНовыйСегмент = null;
            }
            break;

          case "INF": {
            Проверить(!лЭтоСписокВариантов);
            Проверить(nTargetDuration !== -1);
            Проверить(оНовыйСегмент === null);
            оНовыйСегмент = Object.create(null);
            const { чДлительность, сИмяСегмента } =
              разобратьEXTINF(сЗначениеТега);
            оНовыйСегмент.чДлительность = чДлительность;
            оНовыйСегмент.лРеклама = м_Twitch.этоРекламныйСегмент(сИмяСегмента);
            if (оНовыйСегмент.лРеклама) {
              чВремя = NaN;
            }
            оНовыйСегмент.чВремя = чВремя;
            чВремя++;
            if (оНовыйСегмент.чДлительность < 0) {
              м_Журнал.Ой(
                `[Список] У сегмента ${
                  чПорядковыйНомер + моСегменты.length
                } отрицательная длительность ${сЗначениеТега}`
              );
              оНовыйСегмент.чДлительность = 0;
            }
            if (Math.round(оНовыйСегмент.чДлительность) > nTargetDuration) {
              м_Журнал.Ой(
                `[Список] Длительность сегмента ${
                  чПорядковыйНомер + моСегменты.length
                } больше target duration на ${
                  оНовыйСегмент.чДлительность - nTargetDuration
                }с`
              );
              if (оНовыйСегмент.чДлительность > nTargetDuration * 3) {
                оНовыйСегмент.чДлительность = 0;
              }
            }
            break;
          }

          case "-X-DISCONTINUITY":
            Проверить(!лЭтоСписокВариантов);
            Проверить(!сЗначениеТега);
            лРазрыв = true;
            break;

          case "-X-PROGRAM-DATE-TIME":
            Проверить(!лЭтоСписокВариантов);
            break;

          case "-X-KEY":
          case "-X-MAP":
            Проверить(!лЭтоСписокВариантов);
            м_Отладка.ЗавершитьРаботуИПоказатьСообщение(
              "J0219",
              "J0731",
              м_Twitch.ПолучитьАдресКанала(true)
            );
            break;

          case "-X-BYTERANGE":
          case "-X-GAP":
            Проверить(false);
            break;

          case "-X-TARGETDURATION":
            Проверить(!лЭтоСписокВариантов);
            Проверить(nTargetDuration === -1);
            nTargetDuration = РазобратьЦелоеПоложительноеЧисло(сЗначениеТега);
            Проверить(nTargetDuration > 0 && nTargetDuration < 60);
            break;

          case "-X-MEDIA-SEQUENCE":
            Проверить(!лЭтоСписокВариантов);
            Проверить(чПорядковыйНомер === 0);
            чПорядковыйНомер = РазобратьЦелоеПоложительноеЧисло(сЗначениеТега);
            break;

          case "-X-ENDLIST":
            Проверить(!лЭтоСписокВариантов);
            Проверить(!сЗначениеТега);
            лКонецСписка = true;
            break;

          case "-X-DISCONTINUITY-SEQUENCE":
            Проверить(!лЭтоСписокВариантов);
            break;

          case "-X-PLAYLIST-TYPE":
          case "-X-I-FRAMES-ONLY":
            Проверить(false);
            break;

          case "-X-TWITCH-LIVE-SEQUENCE":
            Проверить(!лЭтоСписокВариантов);
            чВремя = РазобратьЦелоеПоложительноеЧисло(сЗначениеТега);
            break;

          case "-X-DATERANGE": {
            /**
             * -------------------------------------------------------------------------
             * #EXT-X-DATERANGE Handling (Ad Metadata Parser)
             * -------------------------------------------------------------------------
             * This block is responsible for detecting and parsing metadata related to
             * Server-Side Ad Insertion (SSAI) on Twitch.
             *
             * HOW IT WORKS:
             * Twitch embeds `#EXT-X-DATERANGE` tags in the video manifest to signal
             * when an advertisement ("stitched ad") is starting.
             *
             * STEPS:
             * 1. Check Context: Verifies this tag is in a Media Playlist (segments),
             *    not a Master Playlist.
             * 2. Parse Attributes: Converts the raw string of attributes into a Map.
             * 3. Detect Ad: Looks for `CLASS="twitch-stitched-ad"`.
             * 4. Extract Data: If an ad is found, it pulls out critical info:
             *    - `сТипРекламы` (Ad Type): e.g., "MIDROLL".
             *    - `кРоликов` (Pod Length): Total number of ads in this break.
             *    - `чНомерРолика` (Pod Position): Index of the current ad (1-based).
             *    - `чПродолжительностьРолика` (Duration): Length of ad in seconds.
             *    - Tracking IDs: Token, Advertiser ID, Creative ID, etc.
             *
             * This data drives the player's "Ad Mode," informing the UI and enabling
             * the ad-bypass mechanism to switch streams if necessary.
             */
            Проверить(!лЭтоСписокВариантов);
            const амАтрибуты = РазобратьСписокАтрибутов(сЗначениеТега);
            try {
              switch (амАтрибуты.get("CLASS")) {
                case "twitch-stitched-ad":
                  // --- 12/13/2025 ADDED DEBUGGING CODE ---
                  // сЗначениеТега contains the raw string value of the ad tag, including all attributes.
                  console.warn("AD TAG DETECTED. RAW DATA BELOW:"); // debugging added
                  console.log("Raw Tag Value:", сЗначениеТега); // log to console

                  // Extract Ad Type (e.g., standard, midroll)
                  сТипРекламы = амАтрибуты.get("X-TV-TWITCH-AD-ROLL-TYPE");

                  // Extract Total Number of Ads in this break (Pod Length)
                  кРоликов = РазобратьЦелоеПоложительноеЧисло(
                    амАтрибуты.get("X-TV-TWITCH-AD-POD-LENGTH")
                  );

                  // Extract Current Ad Position (e.g., 2 in a sequence of 4)
                  чНомерРолика = РазобратьЦелоеПоложительноеЧисло(
                    амАтрибуты.get("X-TV-TWITCH-AD-POD-POSITION")
                  );

                  // Extract Duration of the ad in seconds
                  чПродолжительностьРолика = РазобратьПоложительноеЧисло(
                    амАтрибуты.get("DURATION") || "0"
                  );

                  // Extract specific Ad Tracking tokens and IDs for analytics
                  // These IDs are NOT used for playback logic. They are only used to construct
                  // the "Proof of View" telemetry packet sent back to Twitch via 'recordAdEvent'.
                  
                  // RADS Token: The unique cryptographic token validating this specific ad impression.
                  сТокенРекламы =
                    амАтрибуты.get("X-TV-TWITCH-AD-RADS-TOKEN") || "";
                  
                  // Advertiser ID: Identifies the company buying the ad (mapped to 'ad_id' in GQL).
                  сИдРолика1 =
                    амАтрибуты.get("X-TV-TWITCH-AD-ADVERTISER-ID") || "";
                  
                  // Creative ID: Identifies the specific video asset/commercial (mapped to 'creative_id').
                  сИдРолика2 =
                    амАтрибуты.get("X-TV-TWITCH-AD-CREATIVE-ID") || "";
                  
                  // Line Item ID: Internal campaign management ID (mapped to 'line_item_id').
                  сИдРолика3 =
                    амАтрибуты.get("X-TV-TWITCH-AD-LINE-ITEM-ID") || "";
                  
                  // Order ID: Purchase order ID for the ad campaign (mapped to 'order_id').
                  сИдРолика4 = амАтрибуты.get("X-TV-TWITCH-AD-ORDER-ID") || "";
                  
                  // Ad Session ID: Ties this ad view to the user's viewing session (mapped to 'ad_session_id').
                  сИдРолика5 =
                    амАтрибуты.get("X-TV-TWITCH-AD-AD-SESSION-ID") || "";
                  
                  // Ad Format: The format of the ad, e.g., 'Video', 'Display' (mapped to 'format_name').
                  сИдРолика6 = амАтрибуты.get("X-TV-TWITCH-AD-AD-FORMAT") || "";

                  // Validate that we found a valid Ad Type
                  Проверить(сТипРекламы);
              }
            } catch (пИсключение) {
              // Safety fallback: if parsing fails, reset ad type and log error.
              сТипРекламы = "";
              м_Журнал.Ой(`[Список] Ошибка разбора рекламы: ${сЗначениеТега}`);
            }
            break;
          }

          case "-X-MEDIA": {
            Проверить(лЭтоСписокВариантов);
            const амАтрибуты = РазобратьСписокАтрибутов(сЗначениеТега);
            const сТип = амАтрибуты.get("TYPE");
            Проверить(сТип);
            Проверить(
              (сТип !== "VIDEO" && сТип !== "AUDIO") || !амАтрибуты.has("URI")
            );
            if (сТип === "VIDEO") {
              const сГруппа = амАтрибуты.get("GROUP-ID");
              const сИмя = амАтрибуты.get("NAME");
              Проверить(сГруппа && сИмя);
              Проверить(!mapRenditionGroups.has(сГруппа));
              mapRenditionGroups.set(сГруппа, сИмя);
            } else {
              м_Журнал.Ой(`[Список] Найден #EXT-X-MEDIA TYPE=${сТип}`);
            }
            break;
          }

          case "-X-STREAM-INF": {
            Проверить(лЭтоСписокВариантов);
            Проверить(оНовыйВариант === null);
            оНовыйВариант = Object.create(null);
            const амАтрибуты = РазобратьСписокАтрибутов(сЗначениеТега);
            оНовыйВариант.чБитрейт = РазобратьЦелоеПоложительноеЧисло(
              амАтрибуты.get("BANDWIDTH")
            );
            Проверить(
              !амАтрибуты.has("AUDIO") &&
                !амАтрибуты.has("SUBTITLES") &&
                !амАтрибуты.has("CLOSED-CAPTIONS")
            );
            оНовыйВариант.сИдентификатор = амАтрибуты.get("VIDEO") || "";
            break;
          }

          case "-X-I-FRAME-STREAM-INF":
          case "-X-SESSION-DATA":
          case "-X-SESSION-KEY":
            Проверить(лЭтоСписокВариантов);
            break;

          case "-X-TWITCH-INFO": {
            Проверить(лЭтоСписокВариантов);
            const амАтрибуты = РазобратьСписокАтрибутов(сЗначениеТега);
            const чСекунды = РазобратьПоложительноеЧисло(
              амАтрибуты.get("SERVER-TIME")
            );
            Проверить(чСекунды > 1531267200 && чСекунды < 1846886400);
            const чМиллисекунды = чСекунды * 1e3 + 50;
            г_чТочноеВремя = чМиллисекунды - performance.now();
            const чРассинхронизацияВремени = чМиллисекунды - Date.now();
            сИдТрансляции = амАтрибуты.get("BROADCAST-ID");
            Проверить(сИдТрансляции);
            try {
              const сАдрес = atob(амАтрибуты.get("C"));
              Проверить(сАдрес.startsWith("https://"));
              сАдресСлеженияЗаПросмотром = сАдрес;
            } catch (пИсключение) {
              м_Журнал.Ой(
                `[Список] Не удалось разобрать адрес слежения за просмотром: ${пИсключение}`
              );
            }
            м_Журнал[Math.abs(чРассинхронизацияВремени) > 5e3 ? "Ой" : "Окак"](
              `[Список] РассинхронизацияВремени=${чРассинхронизацияВремени}мс ИдТрансляции=${сИдТрансляции}`
            );
            break;
          }

          case "-X-VERSION":
            Проверить(чВерсия === 1);
            чВерсия = РазобратьЦелоеПоложительноеЧисло(сЗначениеТега);
            Проверить(
              чВерсия >= 2 && чВерсия <= МАКС_ПОДДЕРЖИВАЕМАЯ_ВЕРСИЯ_HLS
            );
            break;

          case "-X-START":
            м_Журнал.Ой(`[Список] Найден #EXT-X-START=${сЗначениеТега}`);
            break;

          case "M3U":
          case "-X-DEFINE":
            Проверить(false);
        }
      } catch (пИсключение) {
        if (
          пИсключение instanceof Error &&
          пИсключение.message === "БРАКОВАТЬ"
        ) {
          throw `Ошибка разбора строки списка:\n${ПеревестиИсключениеВСтроку(
            пИсключение
          )}\n${сАдрес}`;
        }
      }
    }
    if (лЭтоСписокВариантов) {
      Проверить(оНовыйВариант === null);
      for (let оВариант of моВарианты) {
        if (оВариант.сИдентификатор) {
          Проверить(mapRenditionGroups.has(оВариант.сИдентификатор));
          оВариант.сНазвание = mapRenditionGroups.get(оВариант.сИдентификатор);
        } else {
          оВариант.сИдентификатор = `CoolCmd${оВариант.чБитрейт}`;
          оВариант.сНазвание = `${м_i18n.ФорматироватьЧисло(
            оВариант.чБитрейт / 1e6,
            1
          )} ${Текст("J0114")}`;
        }
      }
      м_Журнал.Вот(
        `[Список] Количество вариантов в списке: ${моВарианты.length}`
      );
      return м_Twitch.сортироватьСписокВариантов({
        сИдТрансляции,
        чИдСессии: _чИдСессии++,
        сАдресСлеженияЗаПросмотром,
        моВарианты,
      });
    } else {
      Проверить(оНовыйСегмент === null);
      Проверить(nTargetDuration !== -1);
      const оСписокСегментов = {
        nTargetDuration,
        чПорядковыйНомер,
        лКонецСписка,
        лХаос: false,
        кРекламныхСегментов,
        сТипРекламы,
        кРоликов,
        чНомерРолика,
        чПродолжительностьРолика,
        сТокенРекламы,
        сИдРолика1,
        сИдРолика2,
        сИдРолика3,
        сИдРолика4,
        сИдРолика5,
        сИдРолика6,
        моСегменты,
      };
      м_Журнал.Вот(
        `[Список] Разобран список сегментов TargetDuration=${nTargetDuration} ПорядковыйНомер=${чПорядковыйНомер} КонецСписка=${лКонецСписка} КоличествоСегментов=${моСегменты.length} РекламныхСегментов=${кРекламныхСегментов}`
      );
      if (сТипРекламы) {
        м_Журнал.Окак(
          `[Список] Найдена реклама ТипРекламы=${сТипРекламы} ТокенРекламы=${сТокенРекламы.slice(
            -10
          )} Роликов=${кРоликов} НомерРолика=${чНомерРолика} ПродолжительностьРолика=${чПродолжительностьРолика} НомерКвартеля=${чНомерКвартеля} ЗаканчиваетсяРекламой=${этотСписокЗаканчиваетсяРекламой(
            оСписокСегментов
          )}`
        );
      }
      м_Статистика.РазобранСписокСегментов(оСписокСегментов);
      return оСписокСегментов;
    }
  }
  function браковать(пУсловие) {
    if (!пУсловие) {
      throw new Error("БРАКОВАТЬ");
    }
  }
  function РазобратьСписокАтрибутов(сИсходныйТекст) {
    const амАтрибуты = new Map();
    const рвАтрибут = /([A-Z0-9-]+)=(?:"([^"]*)"|([^",]+))(?:,|$)/g;
    while (рвАтрибут.lastIndex !== сИсходныйТекст.length) {
      const { lastIndex } = рвАтрибут;
      const мсАтрибут = рвАтрибут.exec(сИсходныйТекст);
      Проверить(мсАтрибут.index === lastIndex);
      Проверить(!амАтрибуты.has(мсАтрибут[1]));
      амАтрибуты.set(мсАтрибут[1], мсАтрибут[3] || мсАтрибут[2]);
    }
    return амАтрибуты;
  }
  function РазобратьЦелоеПоложительноеЧисло(сИсходныйТекст) {
    const чРезультат = parseFloat(сИсходныйТекст);
    Проверить(Number.isSafeInteger(чРезультат) && чРезультат >= 0);
    return чРезультат;
  }
  function РазобратьПоложительноеЧисло(сИсходныйТекст) {
    const чРезультат = parseFloat(сИсходныйТекст);
    Проверить(Number.isFinite(чРезультат) && чРезультат >= 0);
    return чРезультат;
  }
  function РазобратьЛюбоеЧисло(сИсходныйТекст) {
    const чРезультат = parseFloat(сИсходныйТекст);
    Проверить(Number.isFinite(чРезультат));
    return чРезультат;
  }
  function разобратьEXTINF(сИсходныйТекст) {
    let чЗапятая = сИсходныйТекст.indexOf(",");
    if (чЗапятая === -1) {
      чЗапятая = сИсходныйТекст.length;
    }
    return {
      чДлительность: РазобратьЛюбоеЧисло(сИсходныйТекст.slice(0, чЗапятая)),
      сИмяСегмента: сИсходныйТекст.slice(чЗапятая + 1),
    };
  }
  function этотСписокЗаканчиваетсяРекламой(оСписок) {
    return (
      оСписок !== null &&
      оСписок.моСегменты.length !== 0 &&
      оСписок.моСегменты[оСписок.моСегменты.length - 1].лРеклама
    );
  }
  function задатьСостояниеРекламы(лИдетРеклама) {
    if (_лИдетРеклама !== лИдетРеклама) {
      _лИдетРеклама = лИдетРеклама;
      if (лИдетРеклама) {
        _оСпискиБезРекламы.запустить();
        м_События.ПослатьСобытие("список-началорекламы");
      } else {
        _оСпискиБезРекламы.остановить();
        м_События.ПослатьСобытие("список-конецрекламы");
      }
    }
    if (!лИдетРеклама) {
      м_Twitch.отправитьДанныеСлеженияЗаРекламой(null);
    }
  }
  let _сДобавленныйИдТрансляции;
  let _чДобавленныйИдСессии;
  let _сДобавленныйИдВарианта;
  let _чДобавленныйПорядковыйНомер;
  let _чДобавленноеВремя;
  let _лДобавитьРазрыв;
  function очиститьСтатистикуДобавления() {
    _сДобавленныйИдТрансляции = "";
    _чДобавленныйИдСессии = NaN;
    _сДобавленныйИдВарианта = "";
    _чДобавленныйПорядковыйНомер = -1;
    _чДобавленноеВремя = -1;
    _лДобавитьРазрыв = false;
  }
  очиститьСтатистикуДобавления();
  function ДобавитьСегментыВОчередь(
    оНовыеВарианты,
    оНовыеСегменты,
    оВыбранныйВариант
  ) {
    Проверить(
      !(
        _сДобавленныйИдТрансляции !== оНовыеВарианты.сИдТрансляции &&
        _чДобавленныйИдСессии === оНовыеВарианты.чИдСессии
      )
    );
    if (оНовыеСегменты.лХаос) {
      _лДобавитьРазрыв = true;
      м_Статистика.ДобавленыСегментыВОчередь(0, 0);
      return false;
    }
    let кСегментовДобавлено = 0;
    let кСекундДобавлено = 0;
    let чИндексДобавляемогоСегмента = оНовыеСегменты.моСегменты.length;
    let кДобавитьСегментов =
      _сДобавленныйИдТрансляции !== оНовыеВарианты.сИдТрансляции ? 1 : 3;
    let чДобавитьСекунд = м_Настройки.Получить("чРазмерБуфера");
    while (--чИндексДобавляемогоСегмента > 0) {
      if (
        !оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента].лРеклама &&
        оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента].чДлительность !==
          0
      ) {
        кДобавитьСегментов--;
        чДобавитьСекунд -=
          оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента].чДлительность;
        if (кДобавитьСегментов <= 0 && чДобавитьСекунд <= 0) {
          break;
        }
      }
    }
    if (_сДобавленныйИдТрансляции !== оНовыеВарианты.сИдТрансляции) {
      м_Журнал.Окак(
        `[Список] Изменился ИдТрансляции ${_сДобавленныйИдТрансляции} ==> ${оНовыеВарианты.сИдТрансляции}`
      );
      _чДобавленноеВремя = -1;
      _лДобавитьРазрыв = true;
      for (
        let оДобавляемыйСегмент;
        (оДобавляемыйСегмент =
          оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента]);
        чИндексДобавляемогоСегмента++
      ) {
        добавитьСегментВОчередь(
          оДобавляемыйСегмент,
          оНовыеСегменты.чПорядковыйНомер + чИндексДобавляемогоСегмента
        );
      }
    } else if (_чДобавленныйИдСессии !== оНовыеВарианты.чИдСессии) {
      м_Журнал.Окак(
        `[Список] Изменился ИдСессии ${_чДобавленныйИдСессии} ==> ${оНовыеВарианты.чИдСессии}`
      );
      _лДобавитьРазрыв = true;
      for (
        let оДобавляемыйСегмент;
        (оДобавляемыйСегмент =
          оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента]);
        чИндексДобавляемогоСегмента++
      ) {
        if (оДобавляемыйСегмент.чВремя > _чДобавленноеВремя) {
          добавитьСегментВОчередь(
            оДобавляемыйСегмент,
            оНовыеСегменты.чПорядковыйНомер + чИндексДобавляемогоСегмента
          );
        }
      }
    } else {
      if (_сДобавленныйИдВарианта !== оВыбранныйВариант.сИдентификатор) {
        м_Журнал.Окак(
          `[Список] Изменился ИдВарианта ${_сДобавленныйИдВарианта} ==> ${оВыбранныйВариант.сИдентификатор}`
        );
        _лДобавитьРазрыв = true;
      }
      for (
        let оДобавляемыйСегмент;
        (оДобавляемыйСегмент =
          оНовыеСегменты.моСегменты[чИндексДобавляемогоСегмента]);
        чИндексДобавляемогоСегмента++
      ) {
        if (
          оНовыеСегменты.чПорядковыйНомер + чИндексДобавляемогоСегмента >
          _чДобавленныйПорядковыйНомер
        ) {
          добавитьСегментВОчередь(
            оДобавляемыйСегмент,
            оНовыеСегменты.чПорядковыйНомер + чИндексДобавляемогоСегмента
          );
        }
      }
    }
    м_Статистика.ДобавленыСегментыВОчередь(
      кСегментовДобавлено,
      кСекундДобавлено
    );
    return кСегментовДобавлено === 0;
    function добавитьСегментВОчередь(оСегмент, чПорядковыйНомер) {
      начатьТрансляцию();
      if (оСегмент.лРеклама) {
        м_Журнал.Вот(
          `[Список] Не добавляю рекламу ПорядковыйНомер=${чПорядковыйНомер}`
        );
        return;
      }
      if (оСегмент.чДлительность === 0) {
        м_Журнал.Ой(
          `[Список] Не добавляю сегмент ПорядковыйНомер=${чПорядковыйНомер} Время=${оСегмент.чВремя} Длительность=0`
        );
        return;
      }
      if (
        _чДобавленныйИдСессии === оНовыеВарианты.чИдСессии &&
        _чДобавленныйПорядковыйНомер + 1 < чПорядковыйНомер
      ) {
        м_Журнал.Ой(
          `[Список] Пропущены сегменты с ${
            _чДобавленныйПорядковыйНомер + 1
          } по ${чПорядковыйНомер - 1}`
        );
        м_Статистика.пропущеныСегменты(
          чПорядковыйНомер - _чДобавленныйПорядковыйНомер - 1
        );
        _лДобавитьРазрыв = true;
      }
      const оДобавлено = г_моОчередь.Добавить(
        new Сегмент(
          ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ,
          оСегмент.сАдрес,
          оСегмент.чДлительность,
          оСегмент.лРазрыв || _лДобавитьРазрыв
        )
      );
      м_Журнал[оДобавлено.лРазрыв ? "Окак" : "Вот"](
        `[Список] Добавлен сегмент ${оДобавлено.чНомер} ПорядковыйНомер=${чПорядковыйНомер} Время=${оСегмент.чВремя} Длительность=${оДобавлено.чДлительность} Разрыв=${оДобавлено.лРазрыв}`
      );
      кСегментовДобавлено++;
      кСекундДобавлено += оДобавлено.чДлительность;
      _сДобавленныйИдТрансляции = оНовыеВарианты.сИдТрансляции;
      _чДобавленныйИдСессии = оНовыеВарианты.чИдСессии;
      _сДобавленныйИдВарианта = оВыбранныйВариант.сИдентификатор;
      _чДобавленныйПорядковыйНомер = чПорядковыйНомер;
      if (!Number.isNaN(оСегмент.чВремя)) {
        _чДобавленноеВремя = оСегмент.чВремя;
      }
      _лДобавитьРазрыв = false;
    }
  }
  function получитьИнтервалОбновленияСпискаСегментов(
    оСписокСегментов,
    лУкороченныйИнтервал
  ) {
    let кСегментов = 0,
      чДлительностьСписка = 0;
    let чСредняяДлительностьСегмента,
      чМинДлительностьСегмента = Infinity,
      чМаксДлительностьСегмента = -Infinity;
    for (const { лРеклама, чДлительность } of оСписокСегментов.моСегменты) {
      if (!лРеклама && чДлительность > 0) {
        кСегментов++;
        чДлительностьСписка += чДлительность;
        чМинДлительностьСегмента = Math.min(
          чМинДлительностьСегмента,
          чДлительность
        );
        чМаксДлительностьСегмента = Math.max(
          чМаксДлительностьСегмента,
          чДлительность
        );
      }
    }
    if (кСегментов !== 0) {
      чСредняяДлительностьСегмента = чДлительностьСписка / кСегментов;
      м_Журнал.Вот(
        `[Список] ДлительностьСегментов=${м_Журнал.F2(
          чМинДлительностьСегмента
        )}<${м_Журнал.F2(чСредняяДлительностьСегмента)}<${м_Журнал.F2(
          чМаксДлительностьСегмента
        )} ДлительностьСписка=${м_Журнал.F1(чДлительностьСписка)} НеЗагружать=${
          оСписокСегментов.моСегменты.length - кСегментов
        }`
      );
    } else {
      чСредняяДлительностьСегмента =
        чМинДлительностьСегмента =
        чМаксДлительностьСегмента =
          Math.max(оСписокСегментов.nTargetDuration / 3, 1);
      м_Журнал.Ой(
        `[Список] Предполагаемая длительность сегментов ${м_Журнал.F1(
          чСредняяДлительностьСегмента
        )}`
      );
    }
    return лУкороченныйИнтервал
      ? (чСредняяДлительностьСегмента / 2) * 1e3
      : чСредняяДлительностьСегмента * 1e3 - 16;
  }
  function получитьИнтервалОбновленияСпискаВариантов() {
    Проверить(_чСостояние === СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ);
    if (_чИнтервалОбновленияСпискаВариантов === -1) {
      _чИнтервалОбновленияСпискаВариантов = 1e3;
    } else {
      _чИнтервалОбновленияСпискаВариантов = Math.min(
        _чИнтервалОбновленияСпискаВариантов + 1e3,
        3e4
      );
    }
    return _чИнтервалОбновленияСпискаВариантов;
  }
  function начатьТрансляцию() {
    if (_чСостояние !== СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ) {
      _чСостояние = СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ;
      г_моОчередь.Добавить(
        new Сегмент(ОБРАБОТКА_ЗАГРУЖЕН, СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ)
      );
      м_События.ПослатьСобытие("список-выбранварианттрансляции", [
        _оСпискиСРекламой.оСписокВариантов.моВарианты,
        _оСпискиСРекламой.оВыбранныйВариант,
      ]);
    }
  }
  function ЗавершитьТрансляцию() {
    if (_чСостояние !== СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ) {
      _чСостояние = СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ;
      _чИнтервалОбновленияСпискаВариантов = -1;
      г_моОчередь.Добавить(
        new Сегмент(ОБРАБОТКА_ЗАГРУЖЕН, СОСТОЯНИЕ_ЗАВЕРШЕНИЕ_ТРАНСЛЯЦИИ)
      );
      м_События.ПослатьСобытие("список-выбранварианттрансляции", [null, null]);
    }
    _оСпискиСРекламой.очистить();
    задатьСостояниеРекламы(false);
  }
  function ИзменитьВариантТрансляции(чВыбранныйВариант) {
    if (_оСпискиСРекламой.оСписокВариантов !== null) {
      _оСпискиСРекламой.сохранитьВариантТрансляции(
        _оСпискиСРекламой.оСписокВариантов.моВарианты[чВыбранныйВариант]
      );
      _оСпискиСРекламой.оВыбранныйВариант = null;
      if (_чСостояние === СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ) {
        _оСпискиСРекламой.остановить();
        _оСпискиСРекламой.запустить();
        if (!_лИдетРеклама) {
          очиститьСтатистикуДобавления();
          г_моОчередь.Добавить(
            new Сегмент(ОБРАБОТКА_ЗАГРУЖЕН, СОСТОЯНИЕ_СМЕНА_ВАРИАНТА)
          );
          м_Загрузчик.ЗагрузитьСледующийСегмент();
        }
      }
    }
  }
  function Остановить() {
    _чСостояние = СОСТОЯНИЕ_ОСТАНОВКА;
    _оСпискиСРекламой.остановить();
    очиститьСтатистикуДобавления();
    задатьСостояниеРекламы(false);
  }
  function Запустить() {
    Проверить(_чСостояние === СОСТОЯНИЕ_ОСТАНОВКА);
    _оСпискиСРекламой.запустить();
  }
  return {
    Запустить,
    Остановить,
    ИзменитьВариантТрансляции,
  };
})();

const м_Преобразователь = (() => {
  let _оРабочийПоток = null;
  let _чПоследнийЗагруженный = -1;
  function ПреобразоватьСледующийСегмент() {
    let чУдалить,
      кУдалить = 0;
    for (
      let оСегмент, чСегмент = 0;
      (оСегмент = г_моОчередь[чСегмент]);
      ++чСегмент
    ) {
      if (оСегмент.чОбработка > ОБРАБОТКА_ЗАГРУЖЕН) {
        continue;
      }
      if (оСегмент.чОбработка < ОБРАБОТКА_ЗАГРУЖЕН) {
        break;
      }
      if (
        _чПоследнийЗагруженный !== -1 &&
        _чПоследнийЗагруженный + 1 !== оСегмент.чНомер
      ) {
        м_Журнал.Ой(
          `[Преобразование] Не загружены сегменты между ${_чПоследнийЗагруженный} и ${оСегмент.чНомер}`
        );
        оСегмент.лРазрыв = true;
      }
      _чПоследнийЗагруженный = оСегмент.чНомер;
      if (typeof оСегмент.пДанные == "number" && _оРабочийПоток === null) {
        м_Журнал.Вот(
          `[Преобразование] Пропускаю сегмент ${оСегмент.чНомер} Состояние=${оСегмент.пДанные}`
        );
        оСегмент.чОбработка = ОБРАБОТКА_ПРЕОБРАЗОВАН;
        if (оСегмент.пДанные === СОСТОЯНИЕ_НАЧАЛО_ТРАНСЛЯЦИИ) {
          СоздатьРабочийПоток();
        }
      } else {
        if (typeof оСегмент.пДанные == "number") {
          м_Журнал.Вот(
            `[Преобразование] Отсылаю сегмент ${оСегмент.чНомер} Состояние=${оСегмент.пДанные}`
          );
          _оРабочийПоток.postMessage(оСегмент);
        } else {
          м_Отладка.СохранитьТранспортныйПоток(оСегмент);
          м_Статистика.ПолученИсходныйСегмент();
          м_Журнал.Вот(`[Преобразование] Отсылаю сегмент ${оСегмент.чНомер}`);
          _оРабочийПоток.postMessage(оСегмент, [оСегмент.пДанные]);
        }
        if (++кУдалить == 1) {
          чУдалить = чСегмент;
        }
      }
    }
    if (кУдалить !== 0) {
      г_моОчередь.Удалить(чУдалить, кУдалить);
    }
    м_Проигрыватель.ДобавитьСледующийСегмент();
  }
  const ОбработатьОкончаниеПреобразования = ДобавитьОбработчикИсключений(
    (оСобытие) => {
      const мДанные = оСобытие.data;
      Проверить(Array.isArray(мДанные));
      switch (мДанные[0]) {
        case 1:
          Проверить(мДанные.length === 2 && ЭтоОбъект(мДанные[1]));
          const оСегмент = new Сегмент(
            ОБРАБОТКА_ПРЕОБРАЗОВАН,
            мДанные[1].пДанные,
            мДанные[1].чДлительность,
            мДанные[1].лРазрыв,
            мДанные[1].чНомер
          );
          м_Журнал.Вот(
            `[Преобразование] Получен сегмент ${
              оСегмент.чНомер
            } ПреобразованЗа=${м_Журнал.F0(оСегмент.пДанные.чПреобразованЗа)}мс`
          );
          if (typeof оСегмент.пДанные != "number") {
            м_Статистика.ПолученПреобразованныйСегмент(оСегмент);
            if (!оСегмент.пДанные.hasOwnProperty("мбМедиасегмент")) {
              return;
            }
            м_Отладка.СохранитьПреобразованныйСегмент(оСегмент);
          }
          г_моОчередь.Добавить(оСегмент);
          м_Проигрыватель.ДобавитьСледующийСегмент();
          return;

        case 2:
          const мсВажность = мДанные[1],
            мсЗаписи = мДанные[2];
          Проверить(
            мДанные.length === 3 &&
              Array.isArray(мсВажность) &&
              Array.isArray(мсЗаписи) &&
              мсВажность.length === мсЗаписи.length
          );
          for (let ы = 0; ы < мсВажность.length; ++ы) {
            Проверить(
              (мсВажность[ы] === "Вот" ||
                мсВажность[ы] === "Окак" ||
                мсВажность[ы] === "Ой") &&
                typeof мсЗаписи[ы] == "string"
            );
            м_Журнал[мсВажность[ы]](мсЗаписи[ы]);
          }
          return;

        case 3:
          Проверить(
            мДанные.length === 3 &&
              typeof мДанные[1] == "string" &&
              typeof мДанные[2] == "object"
          );
          м_Отладка.ЗавершитьРаботуИОтправитьОтчет(мДанные[1], мДанные[2]);
          return;

        case 4:
          Проверить(мДанные.length === 2 && typeof мДанные[1] == "string");
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение(мДанные[1]);
          return;

        case 5:
          Проверить(мДанные.length === 2 && мДанные[1].byteLength);
          м_Помойка.Выбросить(мДанные[1]);
          return;

        default:
          Проверить(false);
      }
    }
  );
  function ОбработатьОшибкуПреобразования(оСобытие) {
    м_Отладка.ЗавершитьРаботуИОтправитьОтчет(
      `Произошло событие ${оСобытие.type} в рабочем потоке в строке ${оСобытие.lineno}. ${оСобытие.message}`
    );
  }
  function СоздатьРабочийПоток() {
    м_Журнал.Вот("[Преобразование] Создаю рабочий поток");
    _оРабочийПоток = new Worker("/worker.js");
    _оРабочийПоток.addEventListener(
      "message",
      ОбработатьОкончаниеПреобразования
    );
    _оРабочийПоток.addEventListener("error", ОбработатьОшибкуПреобразования);
    _оРабочийПоток.addEventListener(
      "messageerror",
      ОбработатьОшибкуПреобразования
    );
  }
  function Остановить() {
    _чПоследнийЗагруженный = -1;
    if (_оРабочийПоток) {
      м_Журнал.Вот("[Преобразование] Убиваю рабочий поток");
      _оРабочийПоток.terminate();
      _оРабочийПоток = null;
    }
  }
  return {
    Остановить,
    ПреобразоватьСледующийСегмент,
  };
})();

const м_Загрузчик = (() => {
  const МАКС_КОЛИЧЕСТВО_ПОПЫТОК = 2;
  function ЗагрузитьТекст(
    оОтменаОбещания,
    сАдрес,
    чНеДольше,
    сНазвание,
    лЖурнал,
    оЗаголовки = null,
    сМетод = "GET"
  ) {
    return Загрузить(
      оОтменаОбещания,
      сМетод,
      сАдрес,
      чНеДольше,
      оЗаголовки,
      null,
      сНазвание,
      лЖурнал,
      "text"
    );
  }
  function ЗагрузитьJson(
    оОтменаОбещания,
    сАдрес,
    чНеДольше,
    сНазвание,
    лЖурнал,
    оЗаголовки = null,
    сМетод = "GET"
  ) {
    return Загрузить(
      оОтменаОбещания,
      сМетод,
      сАдрес,
      чНеДольше,
      оЗаголовки,
      null,
      сНазвание,
      лЖурнал,
      "json"
    );
  }
  function Загрузить(
    оОтменаОбещания,
    сМетод,
    сАдрес,
    чНеДольше,
    оЗаголовки,
    пТело,
    сНазвание,
    лЖурнал,
    пТипДанных
  ) {
    if (г_лРаботаЗавершена) {
      throw void 0;
    }
    Проверить(
      сМетод === "GET" ||
        сМетод === "PUT" ||
        сМетод === "DELETE" ||
        сМетод === "POST"
    );
    Проверить(typeof сАдрес == "string");
    Проверить(
      Number.isFinite(чНеДольше) && (чНеДольше === 0 || чНеДольше > 1e3)
    );
    Проверить(
      пТело === null ||
        (сМетод !== "GET" &&
          (пТело instanceof URLSearchParams ||
            (typeof пТело == "string" &&
              оЗаголовки &&
              ЭтоНепустаяСтрока(оЗаголовки["Content-Type"]))))
    );
    Проверить(
      typeof оЗаголовки == "object" &&
        typeof сНазвание == "string" &&
        typeof лЖурнал == "boolean"
    );
    Проверить(
      пТипДанных === "none" ||
        пТипДанных === "text" ||
        пТипДанных === "json" ||
        Number.isFinite(пТипДанных)
    );
    if (оОтменаОбещания && оОтменаОбещания.лОтменено) {
      return Promise.reject(ОтменаОбещания.ПРИЧИНА);
    }
    м_Журнал.Вот(
      `[Загрузчик] ${сМетод} ${сНазвание} не дольше ${м_Журнал.F0(чНеДольше)}мс`
    );
    м_Twitch.проверитьДоступностьАдреса(сАдрес);
    const оЗапрос = new XMLHttpRequest();
    оЗапрос._сМетод = сМетод;
    оЗапрос._сАдрес = сАдрес;
    оЗапрос._чНеДольше = чНеДольше;
    оЗапрос._оЗаголовки = оЗаголовки;
    оЗапрос._пТело = пТело;
    оЗапрос._сНазвание = сНазвание;
    оЗапрос._лЖурнал = лЖурнал;
    оЗапрос._пТипДанных = пТипДанных;
    оЗапрос._кОсталосьПопыток =
      typeof пТипДанных == "number" ? 1 : МАКС_КОЛИЧЕСТВО_ПОПЫТОК;
    оЗапрос._чВремяОтправкиЗапроса = performance.now();
    оЗапрос._чОжиданиеОтвета = NaN;
    оЗапрос.addEventListener("timeout", ОбработатьОшибку);
    оЗапрос.addEventListener("error", ОбработатьОшибку);
    оЗапрос.addEventListener("abort", ОбработатьОшибку);
    оЗапрос.addEventListener("load", ОбработатьОкончаниеЗагрузки);
    if (лЖурнал && typeof пТипДанных == "number") {
      оЗапрос.addEventListener("readystatechange", ОбработатьПолучениеОтвета);
    }
    return new Promise((фВыполнить, фОтказаться) => {
      оЗапрос._фВыполнить = фВыполнить;
      оЗапрос._фОтказаться = фОтказаться;
      if (оОтменаОбещания) {
        оЗапрос._оОтменаОбещания = оОтменаОбещания;
        оОтменаОбещания.ЗаменитьОбработчик(
          ПолучитьОбработчикОтменыОбещания(оЗапрос)
        );
      }
      ПослатьЗапрос(оЗапрос, false);
    });
  }
  function ПослатьЗапрос(оЗапрос, лПовторно) {
    if (оЗапрос._кОсталосьПопыток === 0) {
      return false;
    }
    if (лПовторно) {
      м_Журнал.Ой(`[Загрузчик] Повторно загружаю ${оЗапрос._сНазвание}`);
    }
    оЗапрос._кОсталосьПопыток--;
    оЗапрос.open(оЗапрос._сМетод, оЗапрос._сАдрес);
    оЗапрос.responseType =
      typeof оЗапрос._пТипДанных == "number" ? "arraybuffer" : "text";
    оЗапрос.timeout = оЗапрос._чНеДольше;
    if (оЗапрос._оЗаголовки) {
      for (let сЗаголовок of Object.keys(оЗапрос._оЗаголовки)) {
        оЗапрос.setRequestHeader(сЗаголовок, оЗапрос._оЗаголовки[сЗаголовок]);
      }
    }
    if (оЗапрос._пТело instanceof URLSearchParams) {
      оЗапрос.setRequestHeader(
        "Content-Type",
        "application/x-www-form-urlencoded; charset=UTF-8"
      );
      оЗапрос.send(оЗапрос._пТело.toString());
    } else {
      оЗапрос.send(оЗапрос._пТело);
    }
    return true;
  }
  function ПолучитьОбработчикОтменыОбещания(оЗапрос) {
    return () => {
      м_Журнал.Вот(
        `[Загрузчик] Отменяю загрузку ${оЗапрос._сНазвание} readyState=${оЗапрос.readyState}`
      );
      оЗапрос.removeEventListener("abort", ОбработатьОшибку);
      оЗапрос.abort();
      оЗапрос._фОтказаться(ОтменаОбещания.ПРИЧИНА);
    };
  }
  const ОбработатьПолучениеОтвета = ДобавитьОбработчикИсключений(
    ({ target: оЗапрос }) => {
      if (оЗапрос.readyState >= XMLHttpRequest.HEADERS_RECEIVED) {
        оЗапрос.removeEventListener(
          "readystatechange",
          ОбработатьПолучениеОтвета
        );
        Проверить(Number.isNaN(оЗапрос._чОжиданиеОтвета));
        оЗапрос._чОжиданиеОтвета = Math.round(
          performance.now() - оЗапрос._чВремяОтправкиЗапроса
        );
      }
    }
  );
  const ОбработатьОшибку = ДобавитьОбработчикИсключений(
    ({ target: оЗапрос, type: сТипСобытия }) => {
      м_Журнал.Ой(
        `[Загрузчик] Не удалось загрузить ${оЗапрос._сНазвание}. Произошло событие ${сТипСобытия}` +
          ` readyState=${оЗапрос.readyState}` +
          (оЗапрос._лЖурнал && typeof оЗапрос._пТипДанных == "number"
            ? ` ОжиданиеОтвета=${оЗапрос._чОжиданиеОтвета}мс`
            : ``)
      );
      if (сТипСобытия === "abort" || !ПослатьЗапрос(оЗапрос, true)) {
        if (оЗапрос.responseType === "arraybuffer") {
          м_Статистика.ЗагруженСегмент(NaN, NaN, NaN, оЗапрос._чОжиданиеОтвета);
        }
        оЗапрос._оОтменаОбещания &&
          оЗапрос._оОтменаОбещания.ЗаменитьОбработчик(null);
        оЗапрос._фОтказаться(`Произошло событие ${сТипСобытия}`);
      }
    }
  );
  const ОбработатьОкончаниеЗагрузки = ДобавитьОбработчикИсключений(
    ({ target: оЗапрос }) => {
      Проверить(оЗапрос.readyState === XMLHttpRequest.DONE);
      const чКод = оЗапрос.status;
      if (
        чКод >= 200 &&
        чКод <= 299 &&
        (оЗапрос._пТипДанных === "none" || оЗапрос.response !== null)
      ) {
        const чДлительностьЗагрузки = Math.round(
          performance.now() - оЗапрос._чВремяОтправкиЗапроса
        );
        оЗапрос._оОтменаОбещания &&
          оЗапрос._оОтменаОбещания.ЗаменитьОбработчик(null);
        м_Журнал.Вот(
          `[Загрузчик] Загрузил ${оЗапрос._сНазвание} за ${чДлительностьЗагрузки}мс` +
            (оЗапрос._лЖурнал && typeof оЗапрос._пТипДанных == "number"
              ? ` ОжиданиеОтвета=${оЗапрос._чОжиданиеОтвета}мс`
              : ``) +
            (typeof оЗапрос._пТипДанных == "number"
              ? ` Отношение=${м_Журнал.F1(
                  чДлительностьЗагрузки / оЗапрос._пТипДанных / 1e3
                )}`
              : ``) +
            (чКод === 200 ? `` : ` Код=${чКод} ${оЗапрос.statusText}`) +
            (оЗапрос._пТипДанных === "none"
              ? ""
              : оЗапрос._лЖурнал && ЭтоНепустаяСтрока(оЗапрос.response)
              ? `\n${оЗапрос.response}`
              : оЗапрос.responseType === "arraybuffer"
              ? ` Размер=${оЗапрос.response.byteLength}байт`
              : ` Размер=${оЗапрос.response.length}символов`)
        );
        if (оЗапрос._чНеДольше !== 0) {
          м_Статистика.СкачаноНечто(ПолучитьРазмерОтвета(оЗапрос));
        }
        switch (оЗапрос._пТипДанных) {
          case "none":
            оЗапрос._фВыполнить();
            break;

          case "text":
            оЗапрос._фВыполнить(оЗапрос.response);
            break;

          case "json":
            try {
              оЗапрос._фВыполнить(JSON.parse(оЗапрос.response));
            } catch (пИсключение) {
              м_Журнал.Ой(
                `[Загрузчик] Не удалось разобрать ${оЗапрос._сНазвание}. ${пИсключение}`
              );
              оЗапрос._фОтказаться("Не удалось разобрать JSON");
            }
            break;

          default:
            м_Статистика.ЗагруженСегмент(
              оЗапрос.response.byteLength,
              оЗапрос._пТипДанных,
              чДлительностьЗагрузки,
              оЗапрос._чОжиданиеОтвета
            );
            оЗапрос._фВыполнить(оЗапрос.response);
        }
      } else {
        м_Журнал.Ой(
          `[Загрузчик] Не удалось загрузить ${оЗапрос._сНазвание}. ${
            КОД_ОТВЕТА + чКод
          } ${оЗапрос.statusText}` +
            (оЗапрос._лЖурнал && typeof оЗапрос._пТипДанных == "number"
              ? ` ОжиданиеОтвета=${оЗапрос._чОжиданиеОтвета}мс`
              : ``) +
            (ЭтоНепустаяСтрока(оЗапрос.response)
              ? `\n${оЗапрос.response}`
              : оЗапрос.response === null
              ? " response=null"
              : оЗапрос.responseType === "arraybuffer"
              ? ` Размер=${оЗапрос.response.byteLength}байт`
              : ` Размер=${оЗапрос.response.length}символов`)
        );
        if (
          (чКод >= 400 && чКод <= 499) ||
          оЗапрос.response === null ||
          !ПослатьЗапрос(оЗапрос, true)
        ) {
          if (оЗапрос.responseType === "arraybuffer") {
            м_Статистика.ЗагруженСегмент(
              NaN,
              NaN,
              NaN,
              оЗапрос._чОжиданиеОтвета
            );
          }
          оЗапрос._оОтменаОбещания &&
            оЗапрос._оОтменаОбещания.ЗаменитьОбработчик(null);
          оЗапрос._фОтказаться(КОД_ОТВЕТА + чКод);
        }
      }
    }
  );
  function ПолучитьРазмерОтвета(оЗапрос) {
    let кбРазмерЗаголовков =
      17 + оЗапрос.statusText.length + оЗапрос.getAllResponseHeaders().length;
    if (ЭтоHTTP2(оЗапрос)) {
      кбРазмерЗаголовков = Math.round(кбРазмерЗаголовков * 0.5);
    }
    let кбРазмерТела;
    let сЗаголовок = оЗапрос.getResponseHeader("Content-Length");
    if (сЗаголовок) {
      кбРазмерТела = Number.parseInt(сЗаголовок, 10);
    } else if (оЗапрос.responseType === "arraybuffer") {
      кбРазмерТела = оЗапрос.response.byteLength;
    } else {
      кбРазмерТела = оЗапрос.response.length;
      сЗаголовок = оЗапрос.getResponseHeader("Content-Encoding");
      if (сЗаголовок && сЗаголовок !== "identity") {
        кбРазмерТела = Math.round(кбРазмерТела * 0.35);
      }
    }
    return кбРазмерЗаголовков + кбРазмерТела;
  }
  function ЭтоHTTP2(оЗапрос) {
    return оЗапрос.statusText.length === 0;
  }
  function ЗагрузитьСледующийСегмент() {
    let ч = г_моОчередь.length - 1;
    if (
      ч >= 0 &&
      г_моОчередь[ч].пДанные === СОСТОЯНИЕ_СМЕНА_ВАРИАНТА &&
      г_моОчередь[ч].чОбработка === ОБРАБОТКА_ЗАГРУЖЕН
    ) {
      г_моОчередь.ПоказатьСостояние();
      while (--ч >= 0 && г_моОчередь[ч].чОбработка <= ОБРАБОТКА_ЗАГРУЖЕН) {
        if (typeof г_моОчередь[ч].пДанные != "number") {
          г_моОчередь.Удалить(ч);
        }
      }
      г_моОчередь.ПоказатьСостояние();
    } else {
      let кОдновременныхЗагрузок = м_Настройки.Получить(
        "кОдновременныхЗагрузок"
      );
      let чДлительностьВсехЗагрузок = 0;
      for (let оСегмент of г_моОчередь) {
        if (оСегмент.чОбработка <= ОБРАБОТКА_ЗАГРУЖЕН) {
          чДлительностьВсехЗагрузок += оСегмент.чДлительность;
          if (оСегмент.чОбработка <= ОБРАБОТКА_ЗАГРУЖАЕТСЯ) {
            --кОдновременныхЗагрузок;
            if (
              оСегмент.чОбработка === ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ &&
              кОдновременныхЗагрузок >= 0
            ) {
              ЗагрузитьСегмент(оСегмент);
            }
          }
        }
      }
      const чПереполнениеОчереди =
        м_Настройки.Получить("чМаксРазмерБуфера") +
        м_Настройки.Получить("чРастягиваниеБуфера");
      if (чДлительностьВсехЗагрузок > чПереполнениеОчереди) {
        м_Журнал.Ой(
          `[Загрузчик] Длительность всех загрузок в очереди ${м_Журнал.F1(
            чДлительностьВсехЗагрузок
          )}с > ${м_Журнал.F1(чПереполнениеОчереди)}с`
        );
        ОбработатьНеудачнуюЗагрузкуСегмента(null);
        ЗагрузитьСледующийСегмент();
        return;
      }
    }
    м_Преобразователь.ПреобразоватьСледующийСегмент();
  }
  function ЗагрузитьСегмент(оСегмент) {
    const сАдрес = оСегмент.пДанные;
    оСегмент.пДанные = new ОтменаОбещания();
    оСегмент.чОбработка = ОБРАБОТКА_ЗАГРУЖАЕТСЯ;
    Загрузить(
      оСегмент.пДанные,
      "GET",
      сАдрес,
      ЗагружатьСегментНеДольше(оСегмент),
      null,
      null,
      `сегмент ${оСегмент.чНомер}`,
      м_Статистика.ОкноОткрыто(),
      оСегмент.чДлительность
    )
      .then((буфДанные) => {
        Проверить(г_моОчередь.includes(оСегмент));
        оСегмент.пДанные = буфДанные;
        оСегмент.чОбработка = ОБРАБОТКА_ЗАГРУЖЕН;
        ЗагрузитьСледующийСегмент();
      })
      .catch(
        ДобавитьОбработчикИсключений((пПричина) => {
          if (
            typeof пПричина == "string" &&
            оСегмент.чОбработка === ОБРАБОТКА_ЗАГРУЖАЕТСЯ
          ) {
            Проверить(г_моОчередь.includes(оСегмент));
            ОбработатьНеудачнуюЗагрузкуСегмента(
              пПричина.сПричина === КОД_ОТВЕТА + 404 ||
                пПричина.сПричина === КОД_ОТВЕТА + 410
                ? null
                : оСегмент
            );
            Проверить(!г_моОчередь.includes(оСегмент));
            ЗагрузитьСледующийСегмент();
          } else if (пПричина === ОтменаОбещания.ПРИЧИНА) {
            м_Журнал.Вот(
              `[Загрузчик] Отменена загрузка сегмента ${оСегмент.чНомер}`
            );
            Проверить(!г_моОчередь.includes(оСегмент));
          } else {
            throw пПричина;
          }
        })
      );
  }
  function ЗагружатьСегментНеДольше(оСегмент) {
    const чПеременная =
      оСегмент.чДлительность *
      м_Настройки.Получить("кОдновременныхЗагрузок") *
      1.15;
    const чПостоянная = 8;
    return (чПеременная + чПостоянная) * 1e3;
  }
  function ОбработатьНеудачнуюЗагрузкуСегмента(оНезагруженныйСегмент) {
    г_моОчередь.ПоказатьСостояние();
    const кВОчереди = г_моОчередь.length;
    if (оНезагруженныйСегмент) {
      г_моОчередь.Удалить(оНезагруженныйСегмент);
    } else {
      let чРазмерБуфера = м_Настройки.Получить("чРазмерБуфера");
      for (let оСегмент, ы = кВОчереди; (оСегмент = г_моОчередь[--ы]); ) {
        if (оСегмент.чОбработка === ОБРАБОТКА_ЖДЕТ_ЗАГРУЗКИ) {
          if (чРазмерБуфера > 0) {
            чРазмерБуфера -= оСегмент.чДлительность;
          } else {
            г_моОчередь.Удалить(ы);
          }
        } else if (оСегмент.чОбработка === ОБРАБОТКА_ЗАГРУЖАЕТСЯ) {
          г_моОчередь.Удалить(ы);
        }
      }
    }
    г_моОчередь.ПоказатьСостояние();
    м_Статистика.НеЗагруженыСегменты(кВОчереди - г_моОчередь.length);
  }
  const обработатьИзменениеСети = ДобавитьОбработчикИсключений((оСобытие) => {
    м_Журнал.Ой(
      `[Загрузчик] Событие ${оСобытие.type} navigator.onLine=${
        navigator.onLine
      } connection.type=${navigator.connection && navigator.connection.type}`
    );
  });
  if (navigator.connection) {
    navigator.connection.addEventListener(
      "onchange" in navigator.connection ? "change" : "typechange",
      обработатьИзменениеСети
    );
  } else {
    window.addEventListener("online", обработатьИзменениеСети);
    window.addEventListener("offline", обработатьИзменениеСети);
  }
  if (!navigator.onLine) {
    м_Журнал.Ой("[Загрузчик] navigator.onLine=false");
  }
  return {
    Загрузить,
    ЗагрузитьТекст,
    ЗагрузитьJson,
    ЗагрузитьСледующийСегмент,
  };
})();

const м_Twitch = (() => {
  const ИНТЕРВАЛ_ОБНОВЛЕНИЯ_МЕТАДАННЫХ_ТРАНСЛЯЦИИ = 6e4;
  const ИНТЕРВАЛ_СЛЕЖЕНИЯ_ЗА_ПРОСМОТРОМ = 6e4;
  let _сАдресСлеженияЗаПросмотром = "https://spade.twitch.tv/track";
  let _сКодКанала = "";
  let _сИдКанала = "";
  let _сИдТрансляции = "";
  let _сАдресЗаписи = "";
  let _сИдУстройства = "";
  let _сИдЗрителя = "";
  let _сКодЗрителя = "";
  let _сТокенЗрителя = "";
  let _сИмяЗрителя = "";
  let _сТокенGql = "";
  let _чТокенGqlПротухнетПосле = 0;
  let _sPlaySessionID = "";
  let _оОтменаОбновленияМетаданных = null;
  let _чТаймерСлеженияЗаПросмотром = 0;
  function ОчиститьДанныеТрансляции() {
    _сИдТрансляции = _сАдресЗаписи = "";
  }
  function ПолучитьАдресКанала(лНеПеренаправлять) {
    return лНеПеренаправлять
      ? `https://www.twitch.tv/${encodeURIComponent(
          _сКодКанала
        )}?${АДРЕС_НЕ_ПЕРЕНАПРАВЛЯТЬ}`
      : `https://www.twitch.tv/${encodeURIComponent(_сКодКанала)}`;
  }
  function ПолучитьАдресПанелиЧата() {
    if (м_Настройки.Получить("лПолноценныйЧат")) {
      return `https://www.twitch.tv/popout/${encodeURIComponent(
        _сКодКанала
      )}/chat?no-mobile-redirect=true&popout=`;
    }
    return `https://www.twitch.tv/embed/${encodeURIComponent(
      _сКодКанала
    )}/chat?${
      м_Настройки.Получить("лЗатемнитьЧат") ? "darkpopout&" : ""
    }parent=localhost`;
  }
  function ПолучитьАдресЗаписи(сИдЗаписи) {
    Проверить(ЭтоНепустаяСтрока(сИдЗаписи));
    return `https://www.twitch.tv/videos/${encodeURIComponent(сИдЗаписи)}`;
  }
  function получитьАдресКатегории(сИмяКатегории) {
    Проверить(ЭтоНепустаяСтрока(сИмяКатегории));
    return `https://www.twitch.tv/directory/category/${encodeURIComponent(
      сИмяКатегории
    )}`;
  }
  function получитьАдресКоманды(сИмяКоманды) {
    Проверить(ЭтоНепустаяСтрока(сИмяКоманды));
    return `https://www.twitch.tv/team/${encodeURIComponent(сИмяКоманды)}`;
  }
  function проверитьДоступностьАдреса(сАдрес) {
    if (сАдрес.startsWith("https://coolcmd.github.io/")) {
      return;
    }
    if (
      !/^https?:\/\/(?:[^/]+\.)?(?:twitch\.tv|twitchcdn\.net|ttvnw\.net|jtvnw\.net|live-video\.net|akamaized\.net|cloudfront\.net)\//.test(
        сАдрес
      )
    ) {
      throw new Error(`Неизвестный адрес: ${сАдрес}`);
    }
  }
  function создатьУникальныйИдентификатор(кДлина) {
    Проверить(Number.isInteger(кДлина) && кДлина > 0);
    const сДопустимыеСимволы =
      "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
    let сРезультат = "";
    while (сРезультат.length !== кДлина) {
      сРезультат +=
        сДопустимыеСимволы[
          Math.floor(Math.random() * сДопустимыеСимволы.length)
        ];
    }
    return сРезультат;
  }
  получитьТокенGql._оОбещание = null;
  получитьТокенGql.фИзменилсяТокенGql = null;
  function получитьТокенGql() {
    const ЖДАТЬ_ПОЛУЧЕНИЯ_ТОКЕНА = 3e4;
    if (получитьТокенGql._оОбещание === null) {
      получитьТокенGql._оОбещание = new Promise((фВыполнить, фОтказаться) => {
        м_Журнал.Окак("[Twitch] Вставляю фрейм для перехвата токена GQL");
        const элФрейм = document.createElement("iframe");
        элФрейм.src = "https://www.twitch.tv/popout/";
        элФрейм.id = "токенgql";
        элФрейм.hidden = true;
        Проверить(!document.getElementById(элФрейм.id));
        document.body.appendChild(элФрейм);
        const чТаймер = setTimeout(
          ДобавитьОбработчикИсключений(() => {
            м_Журнал.Ой("[Twitch] Истекло время получения токена GQL");
            элФрейм.remove();
            получитьТокенGql._оОбещание = получитьТокенGql.фИзменилсяТокенGql =
              null;
            фОтказаться("ОТКАЗАНО_В_ДОСТУПЕ");
          }),
          ЖДАТЬ_ПОЛУЧЕНИЯ_ТОКЕНА
        );
        получитьТокенGql.фИзменилсяТокенGql = () => {
          if (_сТокенGql !== "") {
            clearTimeout(чТаймер);
            элФрейм.remove();
            получитьТокенGql._оОбещание = получитьТокенGql.фИзменилсяТокенGql =
              null;
            фВыполнить(_сТокенGql);
          }
        };
      });
    }
    return получитьТокенGql._оОбещание;
  }
  function отправитьЗапросGql(
    оОтменаОбещания,
    сЗапрос,
    оПеременные,
    лПосылатьТокенЗрителя,
    лПосылатьТокенGql,
    лПовторятьЗапрос,
    сНазваниеЗагрузки,
    чЗагружатьНеДольше = ЗАГРУЖАТЬ_МЕТАДАННЫЕ_НЕ_ДОЛЬШЕ
  ) {
    const ПОВТОРЯТЬ_ЗАПРОС_ЧЕРЕЗ = 5e3;
    Проверить(ЭтоНепустаяСтрока(_сИдУстройства));
    if (оПеременные !== null) {
      сЗапрос = создатьТелоЗапросаGql(сЗапрос, оПеременные);
    }
    const оЗаголовкиЗапроса = {
      "Accept-Language": "en-US",
      "Client-ID": "kimne78kx3ncx6brgo4mv6wki5h1ko",
      "Content-Type": "text/plain; charset=UTF-8",
      "X-Device-ID": _сИдУстройства,
    };
    if (лПосылатьТокенЗрителя && _сТокенЗрителя) {
      оЗаголовкиЗапроса.Authorization = `OAuth ${_сТокенЗрителя}`;
    }
    let лСвежийТокен = false;
    let оОбещание;
    if (лПосылатьТокенGql) {
      if (_сТокенGql !== "" && _чТокенGqlПротухнетПосле > Date.now()) {
        м_Журнал.Вот(
          `[Twitch] Токен GQL протухнет через ${м_Журнал.F0(
            (_чТокенGqlПротухнетПосле - Date.now()) / 1e3
          )}с`
        );
        оЗаголовкиЗапроса["Client-Integrity"] = _сТокенGql;
        оОбещание = Promise.resolve();
      } else {
        лСвежийТокен = true;
        оОбещание = получитьТокенGql().then((сТокен) => {
          оЗаголовкиЗапроса["Client-Integrity"] = сТокен;
        });
      }
    } else {
      оОбещание = Promise.resolve();
    }
    return оОбещание
      .then(() =>
        м_Загрузчик.Загрузить(
          оОтменаОбещания,
          "POST",
          "https://gql.twitch.tv/gql",
          чЗагружатьНеДольше,
          оЗаголовкиЗапроса,
          сЗапрос,
          сНазваниеЗагрузки,
          true,
          "json"
        )
      )
      .then((оРезультат) => {
        if (!оРезультат.errors) {
          return оРезультат;
        }
        let оОбещание;
        if (
          оРезультат.errors.some(
            ({ message }) => message === "failed integrity check"
          )
        ) {
          м_Журнал.Ой("[Twitch] Серверу не понравился токен GQL");
          if (
            оЗаголовкиЗапроса["Client-Integrity"] === _сТокенGql &&
            _сТокенGql !== ""
          ) {
            очиститьТокенGql();
          }
          if (!лПосылатьТокенGql || лСвежийТокен) {
            throw "ОТКАЗАНО_В_ДОСТУПЕ";
          }
          if (
            оЗаголовкиЗапроса["Client-Integrity"] !== _сТокенGql &&
            _сТокенGql !== ""
          ) {
            оЗаголовкиЗапроса["Client-Integrity"] = _сТокенGql;
            оОбещание = Promise.resolve();
          } else {
            оОбещание = получитьТокенGql().then((сТокен) => {
              оЗаголовкиЗапроса["Client-Integrity"] = сТокен;
            });
          }
        } else if (
          оРезультат.errors.some(({ message }) => message === "service timeout")
        ) {
          if (!лПовторятьЗапрос) {
            м_Журнал.Ой("[Twitch] Сервер GQL занят");
            return оРезультат;
          }
          const повторитьЧерез =
            ПОВТОРЯТЬ_ЗАПРОС_ЧЕРЕЗ +
            (ПОВТОРЯТЬ_ЗАПРОС_ЧЕРЕЗ / 2) * Math.random();
          м_Журнал.Ой(
            `[Twitch] Сервер GQL занят. Запрос будет повторно отправлен через ${повторитьЧерез.toFixed()}мс`
          );
          оОбещание = Ждать(оОтменаОбещания, повторитьЧерез);
        } else {
          м_Журнал.Ой("[Twitch] В ответе GQL есть неизвестные ошибки");
          return оРезультат;
        }
        return оОбещание
          .then(() =>
            м_Загрузчик.Загрузить(
              оОтменаОбещания,
              "POST",
              "https://gql.twitch.tv/gql",
              чЗагружатьНеДольше,
              оЗаголовкиЗапроса,
              сЗапрос,
              сНазваниеЗагрузки,
              true,
              "json"
            )
          )
          .then((оРезультат) => {
            if (оРезультат.errors) {
              if (
                оРезультат.errors.some(
                  ({ message }) => message === "failed integrity check"
                )
              ) {
                м_Журнал.Ой("[Twitch] Серверу не понравился токен GQL");
                if (
                  оЗаголовкиЗапроса["Client-Integrity"] === _сТокенGql &&
                  _сТокенGql !== ""
                ) {
                  очиститьТокенGql();
                }
                throw "ОТКАЗАНО_В_ДОСТУПЕ";
              }
              м_Журнал.Ой(
                оРезультат.errors.some(
                  ({ message }) => message === "service timeout"
                )
                  ? "[Twitch] Сервер GQL занят"
                  : "[Twitch] В ответе GQL есть неизвестные ошибки"
              );
            }
            return оРезультат;
          });
      });
  }
  function ИзменитьПодпискуЗрителяНаКанал(чПодписка) {
    Проверить(_сИдКанала && _сИдЗрителя && _сТокенЗрителя);
    Проверить(_сИдКанала !== _сИдЗрителя);
    switch (чПодписка) {
      case ПОДПИСКА_НЕОФОРМЛЕНА:
        неОтслеживатьКанал();
        break;

      case ПОДПИСКА_НЕУВЕДОМЛЯТЬ:
      case ПОДПИСКА_УВЕДОМЛЯТЬ:
        отслеживатьКанал(чПодписка);
        break;

      default:
        Проверить(false);
    }
  }
  function неОтслеживатьКанал() {
    отправитьЗапросGql(
      null,
      `mutation($input: UnfollowUserInput!) {\n\t\t\t\tunfollowUser(input: $input) {\n\t\t\t\t\t__typename\n\t\t\t\t}\n\t\t\t}`,
      {
        input: {
          targetID: _сИдКанала,
        },
      },
      true,
      true,
      true,
      "не отслеживать канал"
    )
      .then((оРезультат) => {
        if (
          оРезультат.errors ||
          !оРезультат.data ||
          !оРезультат.data.unfollowUser
        ) {
          throw "Сервер не смог выполнить операцию";
        }
        м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
          чПодписка: ПОДПИСКА_НЕОФОРМЛЕНА,
        });
      })
      .catch((пПричина) => {
        if (typeof пПричина == "string") {
          м_Журнал.Ой(`[Twitch] Не удалось не отслеживать канал. ${пПричина}`);
          м_Уведомление.ПоказатьЖопу();
          м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
            чПодписка: ПОДПИСКА_НЕДОСТУПНА,
          });
        } else {
          м_Отладка.ПойманоИсключение(пПричина);
        }
      });
  }
  function отслеживатьКанал(чПодписка) {
    отправитьЗапросGql(
      null,
      `mutation($input: FollowUserInput!) {
				followUser(input: $input) {
					error {
						code
					}
					follow {
						user {
							id
						}
					}
				}
			}`,
      {
        input: {
          disableNotifications: чПодписка === ПОДПИСКА_НЕУВЕДОМЛЯТЬ,
          targetID: _сИдКанала,
        },
      },
      true,
      true,
      true,
      "отслеживать канал"
    )
      .then((оРезультат) => {
        if (
          оРезультат.errors ||
          !оРезультат.data ||
          !оРезультат.data.followUser ||
          !оРезультат.data.followUser.follow ||
          !оРезультат.data.followUser.follow.user ||
          оРезультат.data.followUser.error
        ) {
          throw "Сервер не смог выполнить операцию";
        }
        м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
          чПодписка,
        });
      })
      .catch((пПричина) => {
        if (typeof пПричина == "string") {
          м_Журнал.Ой(`[Twitch] Не удалось отслеживать канал. ${пПричина}`);
          м_Уведомление.ПоказатьЖопу();
          м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
            чПодписка: ПОДПИСКА_НЕДОСТУПНА,
          });
        } else {
          м_Отладка.ПойманоИсключение(пПричина);
        }
      });
  }
  function этоРекламныйСегмент(сИмяСегмента) {
    return сИмяСегмента !== "" && сИмяСегмента !== "live";
  }
  let _оНужноОтправить = null;
  function отправитьДанныеСлеженияЗаРекламой(оСписокСегментов) {
    if (
      _оНужноОтправить !== null &&
      (оСписокСегментов === null ||
        _оНужноОтправить.сТокенРекламы !== оСписокСегментов.сТокенРекламы)
    ) {
      отправитьПросмотрРекламногоБлока(_оНужноОтправить);
      _оНужноОтправить = null;
    }
    if (
      _оНужноОтправить === null &&
      оСписокСегментов !== null &&
      оСписокСегментов.сТипРекламы
    ) {
      _оНужноОтправить = оСписокСегментов;
    }
  }
  function отправитьПросмотрРекламногоБлока(оСписокСегментов) {
    Ждать(null, 3e3)
      .then(() => {
        return отправитьЗапросGql(
          null,
          объединитьЗапросыGql([
            создатьСобытиеРекламы("video_ad_impression", оСписокСегментов),
            создатьСобытиеРекламы(
              "video_ad_quartile_complete",
              оСписокСегментов,
              1
            ),
            создатьСобытиеРекламы(
              "video_ad_quartile_complete",
              оСписокСегментов,
              2
            ),
            создатьСобытиеРекламы(
              "video_ad_quartile_complete",
              оСписокСегментов,
              3
            ),
            создатьСобытиеРекламы(
              "video_ad_quartile_complete",
              оСписокСегментов,
              4
            ),
            создатьСобытиеРекламы("video_ad_pod_complete", оСписокСегментов),
          ]),
          null,
          true,
          false,
          false,
          `${
            оСписокСегментов.сТипРекламы
          } ${оСписокСегментов.сТокенРекламы.slice(-10)}`,
          3e4
        );
      })
      .then((моРезультаты) => {
        for (const оРезультат of моРезультаты) {
          if (
            оРезультат.errors ||
            !оРезультат.data ||
            !оРезультат.data.recordAdEvent ||
            оРезультат.data.recordAdEvent.error
          ) {
            throw `Сервер не смог выполнить операцию: ${м_Журнал.O(
              оРезультат
            )}`;
          }
        }
      })
      .catch((пПричина) => {
        if (typeof пПричина == "string") {
          м_Журнал.Ой(
            `[Twitch] Не удалось отправить данные слежения за рекламой. ${пПричина}`
          );
        } else {
          м_Отладка.ПойманоИсключение(пПричина);
        }
      });
  }
  function создатьСобытиеРекламы(
    сИмяСобытия,
    оСписокСегментов,
    чНомерКвартеля
  ) {
    const оДетали = {
      stitched: true,
      player_mute: true,
      player_volume: 0.5,
      visible: true,
      roll_type: оСписокСегментов.сТипРекламы.toLowerCase(),
    };
    switch (сИмяСобытия) {
      case "video_ad_quartile_complete":
        оДетали.quartile = чНомерКвартеля;

      case "video_ad_impression":
        оДетали.total_ads = оСписокСегментов.кРоликов;
        оДетали.ad_position = оСписокСегментов.чНомерРолика + 1;
        оДетали.duration = Math.round(
          оСписокСегментов.чПродолжительностьРолика
        );
        оДетали.ad_id = оСписокСегментов.сИдРолика1;
        оДетали.creative_id = оСписокСегментов.сИдРолика2;
        оДетали.line_item_id = оСписокСегментов.сИдРолика3;
        оДетали.order_id = оСписокСегментов.сИдРолика4;
        break;

      case "video_ad_pod_complete":
        оДетали.ad_session_id = оСписокСегментов.сИдРолика5;
        оДетали.format_name = оСписокСегментов.сИдРолика6;
        break;

      default:
        Проверить(false);
    }
    return создатьТелоЗапросаGql(
      `mutation($input: RecordAdEventInput!) {
				recordAdEvent(input: $input) {
					error {
						code
					}
				}
			}`,
      {
        input: {
          eventName: сИмяСобытия,
          eventPayload: JSON.stringify(оДетали),
          radToken: оСписокСегментов.сТокенРекламы,
        },
      }
    );
  }
  ПолучитьАбсолютныйАдресСпискаВариантов._чПротухнетПосле = -1;
  ПолучитьАбсолютныйАдресСпискаВариантов._сАдрес = "";
  function ПолучитьАбсолютныйАдресСпискаВариантов(
    оОтменаОбещания,
    лБезHttps,
    лБезРекламы
  ) {
    const ТОКЕН_ПРОТУХНЕТ_ЧЕРЕЗ = 15 * 60 * 1e3;
    if (!лБезРекламы) {
      const чПротухнетЧерез =
        ПолучитьАбсолютныйАдресСпискаВариантов._чПротухнетПосле -
        performance.now();
      if (чПротухнетЧерез > 0) {
        м_Журнал.Вот(
          `[Twitch] До протухания токена трансляции осталось ${м_Журнал.F0(
            чПротухнетЧерез / 1e3
          )}с`
        );
        return Promise.resolve(ПолучитьАбсолютныйАдресСпискаВариантов._сАдрес);
      }
    }
    return отправитьЗапросGql(
      оОтменаОбещания,
      `query(
				$login: String!
				$playerType: String!
				$disableHTTPS: Boolean!
			) {
				streamPlaybackAccessToken(
					channelName: $login
					params: {
						disableHTTPS: $disableHTTPS
						playerType: $playerType
						platform: "web"
						playerBackend: "mediaplayer"
					}
				) {
					value
					signature
				}
			}`,
      {
        login: _сКодКанала,
        playerType: лБезРекламы ? "picture-by-picture" : "site",
        disableHTTPS: лБезHttps,
      },
      true,
      false,
      true,
      `токен трансляции ${+лБезРекламы}`
    ).then((оРезультат) => {
      const сТокен = цепочка(
        оРезультат.data,
        "streamPlaybackAccessToken",
        "value"
      );
      const сПодпись = цепочка(
        оРезультат.data,
        "streamPlaybackAccessToken",
        "signature"
      );
      м_Отладка.сохранитьТокенТрансляции(
        `ИдУстройства=${_сИдУстройства} ТокенЗрителя=${Boolean(
          _сТокенЗрителя
        )}\n${сТокен}`,
        лБезРекламы
      );
      if (!ЭтоНепустаяСтрока(сТокен) || !ЭтоНепустаяСтрока(сПодпись)) {
        if (оРезультат.errors) {
          throw "Сервер не смог выполнить операцию";
        }
        м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0203");
      }
      const оТокен = JSON.parse(сТокен);
      Проверить(оТокен.channel === _сКодКанала);
      if (оТокен.ci_gb) {
        м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0217");
      }
      if (_сИдКанала === "") {
        Проверить(оТокен.channel_id);
        _сИдКанала = String(оТокен.channel_id);
        setTimeout(
          ДобавитьОбработчикИсключений(обновитьМетаданныеЗрителяИКанала)
        );
      } else {
        Проверить(_сИдКанала === String(оТокен.channel_id));
      }
      let сАдрес =
        `${
          лБезHttps ? "http" : "https"
        }://usher.ttvnw.net/api/channel/hls/${encodeURIComponent(
          _сКодКанала
        )}.m3u8` +
        "?allow_source=true" +
        "&allow_audio_only=true" +
        "&cdm=wv" +
        "&fast_bread=true" +
        "&platform=web" +
        "&player_backend=mediaplayer" +
        "&playlist_include_framerate=true" +
        "&reassignments_supported=true" +
        "&supported_codecs=h264" +
        "&transcode_mode=cbr_v1" +
        `&p=${Math.floor(Math.random() * 9999999)}` +
        `&token=${encodeURIComponent(сТокен)}` +
        `&sig=${encodeURIComponent(сПодпись)}`;
      if (!лБезРекламы) {
        _sPlaySessionID = создатьУникальныйИдентификатор(32);
        сАдрес += `&play_session_id=${_sPlaySessionID}`;
        ПолучитьАбсолютныйАдресСпискаВариантов._сАдрес = сАдрес;
        ПолучитьАбсолютныйАдресСпискаВариантов._чПротухнетПосле =
          performance.now() + ТОКЕН_ПРОТУХНЕТ_ЧЕРЕЗ;
      }
      return сАдрес;
    });
  }
  function очиститьТокенGql() {
    _сТокенGql = "";
    удалитьПеченьку("tw5~gqltoken", "https://www.twitch.tv/tw5~storage/").catch(
      м_Отладка.ПойманоИсключение
    );
  }
  function получитьУникальныйИдентификаторУстройства() {
    return (
      "0000000000000000" +
      (м_Настройки.Получить("чСлучайноеЧисло") || 0.1).toFixed(16).slice(2)
    );
  }
  function разобратьПеченькуАвторизации(сПеченька) {
    if (сПеченька) {
      try {
        const о = JSON.parse(decodeURIComponent(сПеченька));
        Проверить(
          ЭтоОбъект(о) &&
            ЭтоНепустаяСтрока(о.id) &&
            ЭтоНепустаяСтрока(о.login) &&
            ЭтоНепустаяСтрока(о.authToken)
        );
        return о;
      } catch (_) {}
      м_Журнал.Ой(
        `[Twitch] Не удалось разобрать печеньку авторизации: ${сПеченька}`
      );
    }
    return {
      id: "",
      login: "",
      authToken: "",
      displayName: "",
    };
  }
  function разобратьПеченькуТокенаGql(сПеченька) {
    if (сПеченька) {
      try {
        const о = JSON.parse(decodeURIComponent(сПеченька));
        Проверить(
          ЭтоНепустаяСтрока(о.сТокен) && Number.isSafeInteger(о.чПротухнетПосле)
        );
        return [о.сТокен, о.чПротухнетПосле];
      } catch (_) {
        м_Журнал.Ой(
          `[Twitch] Не удалось разобрать печеньку токена GQL: ${сПеченька}`
        );
      }
    }
    return ["", 0];
  }
  function разобратьПеченьку(чДействие, { name, domain, path, value }) {
    if (чДействие === 3 || typeof value != "string") {
      value = "";
    }
    switch (name) {
      case "twilight-user":
        if (domain === ".twitch.tv" && path === "/") {
          const { id, login, authToken, displayName } =
            разобратьПеченькуАвторизации(value);
          if (
            чДействие !== 1 &&
            (_сИдЗрителя !== id ||
              _сКодЗрителя !== login ||
              _сТокенЗрителя !== authToken)
          ) {
            м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0222");
          }
          _сИдЗрителя = id;
          _сКодЗрителя = login;
          _сТокенЗрителя = authToken;
          _сИмяЗрителя = ЭтоНепустаяСтрока(displayName) ? displayName : login;
        }
        break;

      case "unique_id":
        if (
          domain === ".twitch.tv" &&
          path === "/" &&
          чДействие === 1 &&
          _сИдУстройства === ""
        ) {
          _сИдУстройства = value;
        }
        break;

      case "tw5~gqltoken":
        if (domain === "www.twitch.tv" && path === "/tw5~storage/") {
          [_сТокенGql, _чТокенGqlПротухнетПосле] =
            разобратьПеченькуТокенаGql(value);
          if (получитьТокенGql.фИзменилсяТокенGql) {
            получитьТокенGql.фИзменилсяТокенGql();
          }
        }
    }
  }
  function запустить(сКодКанала) {
    Проверить(ЭтоНепустаяСтрока(сКодКанала));
    _сКодКанала = сКодКанала;
    return получитьВсеПеченьки("https://www.twitch.tv/tw5~storage/").then(
      (моПеченьки) => {
        for (const оПеченька of моПеченьки) {
          разобратьПеченьку(1, оПеченька);
        }
        if (_сИдУстройства === "") {
          м_Журнал.Ой("[Twitch] Не найден идентификатор устройства");
          _сИдУстройства = получитьУникальныйИдентификаторУстройства();
        }
        chrome.cookies.onChanged.addListener(
          ДобавитьОбработчикИсключений(({ removed, cause, cookie }) => {
            if (!(removed && cause === "overwrite")) {
              разобратьПеченьку(removed ? 3 : 2, cookie);
            }
          })
        );
      }
    );
  }
  function обновитьМетаданныеЗрителяИКанала() {
    Проверить(_сИдКанала);
    отправитьЗапросGql(
      null,
      `query($login: String!, $skip: Boolean!) {
				user(login: $login) {
					broadcastSettings {
						language
					}
					createdAt
					description
					displayName
					followers {
						totalCount
					}
					id
					lastBroadcast {
						startedAt
					}
					primaryTeam {
						displayName
						name
					}
					profileImageURL(width: 70)
					self @skip(if: $skip) {
						canFollow
						follower {
							disableNotifications
						}
					}
				}
			}`,
      {
        login: _сКодКанала,
        skip: _сКодКанала === _сКодЗрителя,
      },
      true,
      false,
      true,
      "метаданные канала"
    )
      .then((оРезультат) => {
        if (!оРезультат.data) {
          throw "В ответе сервера нет метаданных";
        }
        const oUser = оРезультат.data.user;
        if (!oUser) {
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0203");
        }
        Проверить(oUser.id === _сИдКанала);
        const сКодЯзыка = цепочка(oUser.broadcastSettings, "language");
        const моКоманды = [];
        if (oUser.primaryTeam) {
          моКоманды.push({
            сАдрес: получитьАдресКоманды(oUser.primaryTeam.name),
            сИмя: oUser.primaryTeam.displayName || oUser.primaryTeam.name,
          });
        }
        const чПодписка = !цепочка(oUser.self, "canFollow")
          ? ПОДПИСКА_НЕДОСТУПНА
          : !oUser.self.follower
          ? ПОДПИСКА_НЕОФОРМЛЕНА
          : oUser.self.follower.disableNotifications
          ? ПОДПИСКА_НЕУВЕДОМЛЯТЬ
          : ПОДПИСКА_УВЕДОМЛЯТЬ;
        м_События.ПослатьСобытие("twitch-полученыметаданныеканала", {
          сИмя: oUser.displayName || _сКодКанала,
          сАватар: oUser.profileImageURL || "player.svg#svg-missingavatar",
          сОписание: oUser.description,
          сКодЯзыка: сКодЯзыка && сКодЯзыка !== "OTHER" ? сКодЯзыка : null,
          кПодписчиков: цепочка(oUser.followers, "totalCount"),
          чКаналСоздан: Date.parse(oUser.createdAt),
          моКоманды,
        });
        м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
          сИмя: _сИмяЗрителя,
          чПодписка,
        });
      })
      .catch((пПричина) => {
        if (typeof пПричина == "string") {
          м_Журнал.Ой(
            `[Twitch] Не удалось получить метаданные канала. ${пПричина}`
          );
          м_События.ПослатьСобытие("twitch-полученыметаданныеканала", {
            сИмя: _сКодКанала,
            сАватар: "player.svg#svg-missingavatar",
            сКодЯзыка: null,
            кПодписчиков: null,
            чКаналСоздан: null,
          });
          м_События.ПослатьСобытие("twitch-полученыметаданныезрителя", {
            сИмя: _сИмяЗрителя,
            чПодписка: ПОДПИСКА_НЕДОСТУПНА,
          });
        } else {
          м_Отладка.ПойманоИсключение(пПричина);
        }
      });
  }
  function ОбновитьМетаданныеТрансляции(оОтменаОбещания, чЧерез) {
    Проверить(_сИдКанала);
    м_Журнал.Вот(
      `[Twitch] Загрузка метаданных трансляции начнется через ${м_Журнал.F0(
        чЧерез
      )}мс`
    );
    Ждать(оОтменаОбещания, чЧерез)
      .then(() => {
        return отправитьЗапросGql(
          оОтменаОбещания,
          `query($id: ID!, $all: Boolean!) {
					user(id: $id) {
						broadcastSettings {
							game {
								displayName
								slug
							}
							title
						}
						login
						stream {
							archiveVideo @include(if: $all) {
								id
							}
							createdAt
							id
							type
							viewersCount
						}
					}
				}`,
          {
            id: _сИдКанала,
            all: _сИдТрансляции === "",
          },
          false,
          false,
          true,
          "метаданные трансляции"
        );
      })
      .then((оРезультат) => {
        const oUser = цепочка(оРезультат.data, "user");
        const сКодКанала = цепочка(oUser, "login");
        if (сКодКанала !== _сКодКанала && ЭтоНепустаяСтрока(сКодКанала)) {
          м_Журнал.Ой(`[Twitch] Новый код канала ${сКодКанала}`);
          location.replace(`?channel=${encodeURIComponent(сКодКанала)}`);
          return;
        }
        const оМетаданные = {
          кЗрителей: цепочка(oUser, "stream", "viewersCount"),
        };
        const сИдТрансляции = цепочка(oUser, "stream", "id");
        if (_сИдТрансляции === "" && ЭтоНепустаяСтрока(сИдТрансляции)) {
          м_Журнал.Окак(`[Twitch] Идентификатор трансляции ${сИдТрансляции}`);
          _сИдТрансляции = сИдТрансляции;
          начатьСлежениеЗаПросмотром();
          const сИдЗаписи = цепочка(oUser, "stream", "archiveVideo", "id");
          _сАдресЗаписи = ЭтоНепустаяСтрока(сИдЗаписи)
            ? ПолучитьАдресЗаписи(сИдЗаписи)
            : "";
          const сТипТрансляции = цепочка(oUser, "stream", "type");
          оМетаданные.сТипТрансляции =
            сТипТрансляции === "live"
              ? "прямая"
              : сТипТрансляции === "rerun"
              ? "повтор"
              : null;
        }
        if (_сИдТрансляции === "" || _сИдТрансляции === сИдТрансляции) {
          const сНазваниеТрансляции = цепочка(
            oUser,
            "broadcastSettings",
            "title"
          );
          if (typeof сНазваниеТрансляции == "string") {
            оМетаданные.сНазваниеТрансляции =
              сНазваниеТрансляции.trim() || Текст("J0103");
          }
          оМетаданные.сНазваниеИгры = цепочка(
            oUser,
            "broadcastSettings",
            "game",
            "displayName"
          );
          const сАдресИгры = цепочка(
            oUser,
            "broadcastSettings",
            "game",
            "slug"
          );
          if (сАдресИгры) {
            оМетаданные.сАдресИгры = получитьАдресКатегории(сАдресИгры);
          }
          оМетаданные.чДлительностьТрансляции =
            performance.now() +
            г_чТочноеВремя -
            Date.parse(цепочка(oUser, "stream", "createdAt"));
        }
        м_События.ПослатьСобытие(
          "twitch-полученыметаданныетрансляции",
          оМетаданные
        );
        ОбновитьМетаданныеТрансляции(
          оОтменаОбещания,
          ИНТЕРВАЛ_ОБНОВЛЕНИЯ_МЕТАДАННЫХ_ТРАНСЛЯЦИИ
        );
      })
      .catch(
        ДобавитьОбработчикИсключений((пПричина) => {
          if (typeof пПричина == "string") {
            м_Журнал.Ой(
              `[Twitch] Не удалось загрузить метаданные трансляции. ${пПричина}`
            );
            ОбновитьМетаданныеТрансляции(
              оОтменаОбещания,
              ИНТЕРВАЛ_ОБНОВЛЕНИЯ_МЕТАДАННЫХ_ТРАНСЛЯЦИИ / 2
            );
          } else if (пПричина === ОтменаОбещания.ПРИЧИНА) {
            м_Журнал.Вот("[Twitch] Отменено обновление метаданных трансляции");
          } else {
            throw пПричина;
          }
        })
      );
  }
  function НачатьСборМетаданныхТрансляции() {
    ОчиститьДанныеТрансляции();
    Проверить(!_оОтменаОбновленияМетаданных);
    _оОтменаОбновленияМетаданных = new ОтменаОбещания();
    ОбновитьМетаданныеТрансляции(_оОтменаОбновленияМетаданных, 0);
  }
  function ЗавершитьСборМетаданныхТрансляции(лТрансляцияЗавершена) {
    if (лТрансляцияЗавершена) {
      ОчиститьДанныеТрансляции();
    }
    if (_оОтменаОбновленияМетаданных) {
      м_Журнал.Вот(
        `[Twitch] Отменяю цепочку обновления метаданных трансляции ТрансляцияЗавершена=${лТрансляцияЗавершена}`
      );
      _оОтменаОбновленияМетаданных.Отменить();
      _оОтменаОбновленияМетаданных = null;
    }
    завершитьСлежениеЗаПросмотром();
  }
  function начатьСлежениеЗаПросмотром() {
    if (_сИдЗрителя !== "") {
      м_Журнал.Вот("[Twitch] Начинаю слежение за просмотром");
      Проверить(_чТаймерСлеженияЗаПросмотром === 0);
      _чТаймерСлеженияЗаПросмотром = setInterval(
        отправитьДанныеСлеженияЗаПросмотром,
        ИНТЕРВАЛ_СЛЕЖЕНИЯ_ЗА_ПРОСМОТРОМ
      );
      отправитьДанныеСлеженияЗаПросмотром();
    }
  }
  function завершитьСлежениеЗаПросмотром() {
    if (_чТаймерСлеженияЗаПросмотром !== 0) {
      м_Журнал.Вот("[Twitch] Завершаю слежение за просмотром");
      clearInterval(_чТаймерСлеженияЗаПросмотром);
      _чТаймерСлеженияЗаПросмотром = 0;
    }
  }
  const отправитьДанныеСлеженияЗаПросмотром = ДобавитьОбработчикИсключений(
    () => {
      Проверить(_сИдТрансляции && _сИдКанала && _сИдЗрителя);
      const оОтправить = new URLSearchParams();
      оОтправить.set(
        "data",
        btoa(
          JSON.stringify([
            {
              event: "minute-watched",
              properties: {
                broadcast_id: _сИдТрансляции,
                channel_id: _сИдКанала,
                user_id: Number(_сИдЗрителя),
                player: "site",
              },
            },
          ])
        )
      );
      м_Загрузчик
        .Загрузить(
          null,
          "POST",
          _сАдресСлеженияЗаПросмотром,
          ЗАГРУЖАТЬ_МЕТАДАННЫЕ_НЕ_ДОЛЬШЕ,
          null,
          оОтправить,
          "слежение за просмотром",
          false,
          "none"
        )
        .catch((пПричина) => {
          if (typeof пПричина == "string") {
            м_Журнал.Ой(
              `[Twitch] Не удалось отправить данные слежения за просмотром. ${пПричина}`
            );
          } else {
            м_Отладка.ПойманоИсключение(пПричина);
          }
        });
    }
  );
  function ПолучитьАдресЗаписиДляТекущейПозиции() {
    if (_сАдресЗаписи === "") {
      м_Журнал.Ой("[Twitch] Адрес записи не известен");
      return "";
    }
    const чПозиция =
      м_Проигрыватель.ПолучитьПозициюВоспроизведенияТрансляции(false);
    if (чПозиция === -1) {
      м_Журнал.Вот("[Twitch] Адрес записи создан без позиции воспроизведения");
      return _сАдресЗаписи;
    }
    return `${_сАдресЗаписи}?t=${Math.floor(чПозиция / 60 / 60)}h${Math.floor(
      (чПозиция / 60) % 60
    )}m${Math.floor(чПозиция % 60)}s`;
  }
  function СоздатьКлип() {
    const чПозиция =
      м_Проигрыватель.ПолучитьПозициюВоспроизведенияТрансляции(true);
    if (_сИдТрансляции === "" || чПозиция <= 0) {
      м_Журнал.Ой(
        `[Twitch] Недостаточно данных для создания клипа ИдТрансляции=${_сИдТрансляции} Позиция=${чПозиция}`
      );
      м_Уведомление.ПоказатьЖопу();
    } else {
      м_Журнал.Окак(
        `[Twitch] Создаю клип ИдТрансляции=${_сИдТрансляции} Позиция=${чПозиция} ИдЗрителя=${_сИдЗрителя}`
      );
      м_Уведомление.Показать("svg-cut", false);
      ОткрытьАдресВНовойВкладке(
        `https://clips.twitch.tv/create?${new URLSearchParams({
          broadcastID: _сИдТрансляции,
          broadcasterLogin: _сКодКанала,
          offsetSeconds: Math.ceil(чПозиция),
        })}`
      );
    }
  }
  function ПолучитьАбсолютныйАдресСпискаСегментов(
    сАбсолютныйАдресСпискаСегментов
  ) {
    return сАбсолютныйАдресСпискаСегментов;
  }
  function сортироватьСписокВариантов(оСписокВариантов) {
    if (оСписокВариантов.сАдресСлеженияЗаПросмотром) {
      _сАдресСлеженияЗаПросмотром = оСписокВариантов.сАдресСлеженияЗаПросмотром;
    }
    return оСписокВариантов;
  }
  const обработатьСообщениеЧата = ДобавитьОбработчикИсключений(
    (оСообщение, оОтправитель, фОтветить) => {
      if (оСообщение.сЗапрос !== "ВставитьСторонниеРасширения") {
        return false;
      }
      if (
        (оОтправитель.tab ? оОтправитель.tab.id : chrome.tabs.TAB_ID_NONE) !==
        получитьТекущуюВкладку.чИдВкладки
      ) {
        return false;
      }
      м_Журнал.Вот("[Twitch] Получен запрос на вставку сторонних расширений");
      chrome.management.getAll(
        ДобавитьОбработчикИсключений((моРасширения) => {
          if (chrome.runtime.lastError) {
            throw new Error(
              `Не удалось получить список расширений: ${chrome.runtime.lastError.message}`
            );
          }
          //! Send to content script a list of known browser extensions that are currently installed and enabled in the browser.
          //! These extensions will be loaded into <iframe>. See вставитьСторонниеРасширения() in content.js.
          //! Chrome itself cannot load installed extensions into another extension.
          //! See https://bugs.chromium.org/p/chromium/issues/detail?id=599167
          оСообщение.сСторонниеРасширения = "";
          for (let оРасширение of моРасширения) {
            if (оРасширение.enabled) {
              switch (оРасширение.id) {
                case /*! Chrome */ "ajopnjidmegmdimjlfnijceegpefgped":
                case /*! Opera  */ "deofbbdfofnmppcjbhjibgodpcdchjii":
                case /*! Edge   */ "icllegkipkooaicfmdfaloehobmglglb":
                  //! BetterTTV browser extension
                  //! https://betterttv.com/
                  //! https://chrome.google.com/webstore/detail/ajopnjidmegmdimjlfnijceegpefgped
                  оСообщение.сСторонниеРасширения += "BTTV ";
                  break;

                case /*! Chrome */ "fadndhdgpmmaapbmfcknlfgcflmmmieb":
                case /*! Opera  */ "djkpepcignmpfblhbfpmlhoindhndkdj":
                  //! FrankerFaceZ browser extension
                  //! https://www.frankerfacez.com/
                  //! https://chrome.google.com/webstore/detail/fadndhdgpmmaapbmfcknlfgcflmmmieb
                  оСообщение.сСторонниеРасширения += "FFZ ";
              }
            }
          }
          м_Журнал.Вот(
            `[Twitch] Посылаю ответ на вставку сторонних расширений: ${оСообщение.сСторонниеРасширения}`
          );
          try {
            фОтветить(оСообщение);
          } catch (пИсключение) {
            м_Журнал.Ой(`[Twitch] Ошибка при посылке ответа: ${пИсключение}`);
          }
        })
      );
      return true;
    }
  );
  function открытьЧат() {
    chrome.runtime.onMessage.addListener(обработатьСообщениеЧата);
    return ПолучитьАдресПанелиЧата();
  }
  function закрытьЧат() {
    chrome.runtime.onMessage.removeListener(обработатьСообщениеЧата);
  }
  return {
    этоРекламныйСегмент,
    отправитьДанныеСлеженияЗаРекламой,
    ПолучитьАбсолютныйАдресСпискаВариантов,
    ПолучитьАбсолютныйАдресСпискаСегментов,
    ПолучитьАдресКанала,
    проверитьДоступностьАдреса,
    НачатьСборМетаданныхТрансляции,
    ЗавершитьСборМетаданныхТрансляции,
    ИзменитьПодпискуЗрителяНаКанал,
    ПолучитьАдресЗаписиДляТекущейПозиции,
    СоздатьКлип,
    сортироватьСписокВариантов,
    открытьЧат,
    закрытьЧат,
    запустить,
  };
})();

function ЗавершитьРаботу(лБыстро) {
  try {
    г_лРаботаЗавершена = true;
    м_Журнал.Окак("[Запускалка] Завершаю работу");
    window.stop();
    if (!лБыстро) {
      м_Преобразователь.Остановить();
      м_Проигрыватель.Остановить();
      м_Помойка.Сжечь();
    }
    м_Журнал.Окак("[Запускалка] Работа завершена");
  } catch (_) {}
}

ДобавитьОбработчикИсключений(() => {
  function ЭтотКаналУжеОткрыт(сКанал) {
    Проверить(ЭтоНепустаяСтрока(сКанал));
    chrome.runtime.sendMessage(
      {
        сЗапрос: "ЭтотКаналУжеОткрыт",
        сКанал,
      },
      (пОтвет) => {
        if (пОтвет === true) {
          м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0211");
        }
      }
    );
    chrome.runtime.onMessage.addListener(
      ДобавитьОбработчикИсключений((оСообщение, _, фОтветить) => {
        if (оСообщение.сЗапрос === "ЭтотКаналУжеОткрыт") {
          м_Журнал.Ой(
            `[Запускалка] В другой вкладке открыт канал ${оСообщение.сКанал}`
          );
          if (оСообщение.сКанал === сКанал) {
            фОтветить(true);
          }
        }
      })
    );
  }
  function ОбработатьВыгрузкуСтраницы(оСобытие) {
    м_Журнал.Окак(`[Запускалка] window.on${оСобытие.type}`);
    ЗавершитьРаботу(true);
  }
  function НачатьРаботу() {
    Проверить(!г_лРаботаЗавершена);
    м_Журнал.Вот(`[Запускалка] Начало работы ${performance.now().toFixed()}мс`);
    window.addEventListener("unload", ОбработатьВыгрузкуСтраницы);
    м_Управление.Запустить();
    if (м_Проигрыватель.Запустить()) {
      м_Список.Запустить();
    } else {
      м_Управление.ОстановитьПросмотрТрансляции();
    }
    м_Статистика.Запустить();
  }
  if (window.top !== window) {
    return;
  }
  if (navigator.userAgent.includes("Gecko/")) {
    м_Отладка.ЗавершитьРаботуИПоказатьСообщение("J0204");
  }
  const сКанал = (
    new URLSearchParams(location.search.slice(1)).get("channel") || "channel"
  ).toLowerCase();
  ЭтотКаналУжеОткрыт(сКанал);
  Promise.all([
    проверитьРазрешенияРасширения(),
    м_Настройки.Восстановить(),
    получитьТекущуюВкладку(),
  ])
    .then(() => м_Twitch.запустить(сКанал))
    .then(НачатьРаботу)
    .catch(м_Отладка.ПойманоИсключение);
})();
