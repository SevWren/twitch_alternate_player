'use strict';

{
	function перехватитьФункцию() {
		const оригинальнаяФункция = window.fetch;
		window.fetch = function(адрес, параметры) {
			const обещание = оригинальнаяФункция(адрес, параметры);
			if (адрес === 'https://gql.twitch.tv/integrity' && параметры && параметры.method && параметры.method.toUpperCase() === 'POST' && параметры.headers && параметры.headers.Authorization) {
				обещание.then(ответ => {
					if (ответ.ok && ответ.status === 200) {
						return ответ.clone().json().then(({token: сТокен, expiration: чПротухнетПосле}) => {
							if (typeof сТокен == 'string' && сТокен && Number.isSafeInteger(чПротухнетПосле)) {
								const текущееВремя = Date.now();
								чПротухнетПосле = Math.min(Math.max(чПротухнетПосле - 3 * 60 * 1e3, текущееВремя + 1 * 60 * 60 * 1e3), текущееВремя + 24 * 60 * 60 * 1e3);
								document.cookie = `tw5~gqltoken=${encodeURIComponent(JSON.stringify({
									сТокен,
									чПротухнетПосле
								}))}; path=/tw5~storage/; samesite=none; secure; max-age=86400`;
							}
						});
					}
				}).catch(причина => {});
			}
			return обещание;
		};
	}
	function вставитьНаСтраницу(функция) {
		const скрипт = document.createElement('script');
		скрипт.textContent = `\n\t\t'use strict';\n\t\t(${функция})();\n\t`;
		(document.head || document.documentElement).appendChild(скрипт);
		скрипт.remove();
	}
	вставитьНаСтраницу(перехватитьФункцию);
}