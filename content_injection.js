// content_injection.js
'use strict';

(() => {
    // This self-executing function contains the code previously injected by content.js
    // This is the Manifest V3 compatible way to run code in the page's MAIN world.

    // Function from content.js: перехватитьФункции()
    let _лНеПерехватывать = false;
    window.addEventListener('tw5-неперехватывать', () => {
        _лНеПерехватывать = true;
    });
    const oTitleDescriptor = Object.getOwnPropertyDescriptor(Document.prototype, 'title');
    Object.defineProperty(document, 'title', {
        configurable: oTitleDescriptor.configurable,
        enumerable: oTitleDescriptor.enumerable,
        get() {
            return oTitleDescriptor.get.call(this);
        },
        set(title) {
            if (_лНеПерехватывать) {
                oTitleDescriptor.set.call(this, title);
            } else if (this.documentElement.hasAttribute('data-tw5-перенаправление')) {} else {
                oTitleDescriptor.set.call(this, title);
                window.dispatchEvent(new CustomEvent('tw5-изменензаголовок'));
            }
        }
    });
    const fPushState = history.pushState;
    history.pushState = function (state, title) {
        if (_лНеПерехватывать) {
            fPushState.apply(this, arguments);
        } else if (document.documentElement.hasAttribute('data-tw5-перенаправление')) {} else {
            const сБыло = location.pathname;
            fPushState.apply(this, arguments);
            if (сБыло !== location.pathname) {
                oTitleDescriptor.set.call(document, 'Twitch');
                window.dispatchEvent(new CustomEvent('tw5-pushstate'));
            }
        }
    };

    // Function from content.js: разрешитьРаботуЧата()
    const fGetItem = Storage.prototype.getItem;
    Storage.prototype.getItem = function (сИмя) {
        let сЗначение = fGetItem.apply(this, arguments);
        if (сИмя === 'TwitchCache:Layout' && сЗначение) {
            сЗначение = сЗначение.replace('"isRightColumnClosedByUserAction":true', '"isRightColumnClosedByUserAction":false');
        }
        return сЗначение;
    };

})();