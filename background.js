// This service worker is intentionally left blank.
// All web request modifications from the previous Manifest V2 version
// have been migrated to declarativeNetRequest rules in rules.json.



// const beforeSendHeadersOptions = [ 'requestHeaders', 'blocking' ];
//
// for (const option of Object.keys(chrome.webRequest.OnBeforeSendHeadersOptions)) {
// 	if (chrome.webRequest.OnBeforeSendHeadersOptions[option] === 'extraHeaders') {
// 		beforeSendHeadersOptions.push('extraHeaders');
// 		break;
// 	}
// }
//
// chrome.webRequest.onBeforeSendHeaders.addListener(request => {
// 	if (request.frameId !== 0 || request.parentFrameId !== -1) {
// 		return;
// 	}
// 	const initiator = request.initiator || request.originUrl || request.documentUrl;
// 	if (!initiator || !initiator.startsWith(chrome.runtime.getURL('').slice(0, -1))) {
// 		return;
// 	}
// 	const remove = [ 'origin', 'referer' ];
// 	const requestHeaders = request.requestHeaders.filter(({name}) => !remove.includes(name.toLowerCase()));
// 	requestHeaders.push({
// 		name: 'Origin',
// 		value: 'https://www.twitch.tv'
// 	}, {
// 		name: 'Referer',
// 		value: 'https://www.twitch.tv/'
// 	});
// 	return {
// 		requestHeaders
// 	};
// }, {
// 	urls: chrome.runtime.getManifest().permissions.filter(permission => permission.includes(':')),
// 	types: [ 'xmlhttprequest' ]
// }, beforeSendHeadersOptions);
//
// const headersReceivedOptions = [ 'responseHeaders', 'blocking' ];
//
// for (const option of Object.keys(chrome.webRequest.OnHeadersReceivedOptions)) {
// 	if (chrome.webRequest.OnHeadersReceivedOptions[option] === 'extraHeaders') {
// 		headersReceivedOptions.push('extraHeaders');
// 		break;
// 	}
// }
//
// //! Removes HTTP response headers that prevent the document from loading into <iframe>.
// chrome.webRequest.onHeadersReceived.addListener(response => {
// 	if (response.frameId <= 0 || response.parentFrameId !== 0) {
// 		return;
// 	}
// 	return {
// 		responseHeaders: response.responseHeaders.filter(({name, value}) => {
// 			const headerName = name.toLowerCase();
// 			return headerName !== 'x-frame-options' && (headerName !== 'content-security-policy' || !value.toLowerCase().includes('frame-ancestors'));
// 		})
// 	};
// }, {
// 	urls: [ 'https://www.twitch.tv/popout/*/chat', 'https://www.twitch.tv/embed/*/chat', 'https://www.twitch.tv/*/chat?*', 'https://www.twitch.tv/popout/' ],
// 	types: [ 'sub_frame' ]
// }, headersReceivedOptions);