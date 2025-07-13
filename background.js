'use strict';

// Listener for `content.js` to get a list of other installed extensions.
// This allows the player's chat iframe to load support for BetterTTV and FrankerFaceZ.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.сЗапрос === 'ВставитьСторонниеРасширения') {
        // This must return true to indicate that sendResponse will be called asynchronously.
        chrome.management.getAll().then(extensions => {
            const response = { сСторонниеРасширения: '' };
            for (const ext of extensions) {
                if (ext.enabled) {
                    switch (ext.id) {
                        // BetterTTV IDs
                        case 'ajopnjidmegmdimjlfnijceegpefgped': // Chrome
                        case 'deofbbdfofnmppcjbhjibgodpcdchjii': // Opera
                        case 'icllegkipkooaicfmdfaloehobmglglb': // Edge
                            response.сСторонниеРасширения += 'BTTV ';
                            break;
                        // FrankerFaceZ IDs
                        case 'fadndhdgpmmaapbmfcknlfgcflmmmieb': // Chrome
                        case 'djkpepcignmpfblhbfpmlhoindhndkdj': // Opera
                            response.сСторонниеРасширения += 'FFZ ';
                            break;
                    }
                }
            }
            try {
                sendResponse(response);
            } catch (e) {
                // This can happen if the original tab was closed. Ignore the error.
                console.log("Could not send response for 'ВставитьСторонниеРасширения', tab may have closed.", e);
            }
        });
        return true; 
    }
});


// Listener for `player.js` to check if the same channel is already open.
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.сЗапрос === 'ЭтотКаналУжеОткрыт') {
        // Query all tabs for one that matches the extension's player URL and channel.
        const playerUrl = `chrome-extension://${chrome.runtime.id}/player.html`;
        
        chrome.tabs.query({ url: `${playerUrl}?*` }).then(tabs => {
            // Find a tab that is not the sender and has the same channel.
            const duplicate = tabs.find(tab => 
                tab.id !== sender.tab.id && 
                new URL(tab.url).searchParams.get('channel') === message.сКанал
            );

            if (duplicate) {
                // If a duplicate is found, send `true` back.
                try {
                    sendResponse(true);
                } catch (e) {
                    console.log("Could not send response for 'ЭтотКаналУжеОткрыт', tab may have closed.", e);
                }
            } else {
                // Otherwise, the original logic doesn't explicitly send `false`,
                // but we can do that for clarity. The original code relies on an empty response.
                try {
                    sendResponse(false);
                } catch(e) {
                    console.log("Could not send response for 'ЭтотКаналУжеОткрыт', tab may have closed.", e);
                }
            }
        });
        // Indicate that the response is asynchronous.
        return true;
    }
});