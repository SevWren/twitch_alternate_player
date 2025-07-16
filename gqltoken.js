'use strict';

{
	function вставитьНаСтраницу() {
	// function insertIntoPage() {
		const скрипт = document.createElement('script');
		// const script = document.createElement('script');
		// MV3-compliant: Injects the script by URL instead of using textContent.
		скрипт.src = chrome.runtime.getURL('gql_injection.js');
		// script.src = chrome.runtime.getURL('gql_injection.js');
		(document.head || document.documentElement).appendChild(скрипт);
		// (document.head || document.documentElement).appendChild(script);
		// The script is removed from the DOM after it has been added, but it will continue to execute.
		скрипт.remove();
		// script.remove();
	}
	вставитьНаСтраницу();
	// insertIntoPage();
}