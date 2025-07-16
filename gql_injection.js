// gql_injection.js
'use strict';

(() => {
    const оригинальнаяФункция = window.fetch;
    // const originalFunction = window.fetch;
    window.fetch = function (адрес, параметры) {
    // window.fetch = function (address, parameters) {
        const обещание = оригинальнаяФункция(адрес, параметры);
        // const promise = originalFunction(address, parameters);
        if (адрес === 'https://gql.twitch.tv/integrity' && параметры && параметры.method && параметры.method.toUpperCase() === 'POST' && параметры.headers && параметры.headers.Authorization) {
        // if (address === 'https://gql.twitch.tv/integrity' && parameters && parameters.method && parameters.method.toUpperCase() === 'POST' && parameters.headers && parameters.headers.Authorization) {
            обещание.then(ответ => {
            // promise.then(response => {
                if (ответ.ok && ответ.status === 200) {
                // if (response.ok && response.status === 200) {
                    return ответ.clone().json().then(({
                    // return response.clone().json().then(({
                        token: сТокен,
                        // token: sToken,
                        expiration: чПротухнетПосле
                        // expiration: nExpiresAt
                    }) => {
                        if (typeof сТокен == 'string' && сТокен && Number.isSafeInteger(чПротухнетПосле)) {
                        // if (typeof sToken == 'string' && sToken && Number.isSafeInteger(nExpiresAt)) {
                            const текущееВремя = Date.now();
                            // const currentTime = Date.now();
                            чПротухнетПосле = Math.min(Math.max(чПротухнетПосле - 3 * 60 * 1e3, текущееВремя + 1 * 60 * 60 * 1e3), текущееВремя + 24 * 60 * 60 * 1e3);
                            // nExpiresAt = Math.min(Math.max(nExpiresAt - 3 * 60 * 1e3, currentTime + 1 * 60 * 60 * 1e3), currentTime + 24 * 60 * 60 * 1e3);
                            document.cookie = `tw5~gqltoken=${encodeURIComponent(JSON.stringify({
                                сТокен,
                                // sToken,
                                чПротухнетПосле
                                // nExpiresAt
                            }))}; path=/tw5~storage/; samesite=none; secure; max-age=86400`;
                        }
                    });
                }
            }).catch(причина => {});
            // }).catch(reason => {});
        }
        return обещание;
        // return promise;
    };
})();