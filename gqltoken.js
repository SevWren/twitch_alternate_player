'use strict';

{
	function вставитьНаСтраницу() {
		const скрипт = document.createElement('script');
		// MV3-compliant: Injects the script by URL instead of using textContent.
		скрипт.src = chrome.runtime.getURL('gql_injection.js');
		(document.head || document.documentElement).appendChild(скрипт);
		// The script is removed from the DOM after it has been added, but it will continue to execute.
		скрипт.remove();
	}
	вставитьНаСтраницу();
}