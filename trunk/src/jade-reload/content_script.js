//todo - add hotkey support

chrome.extension.onMessage.addListener(function(request, sender, sendResponse){
    switch (request) {
        case 'refresh':
            refresh();
            break;
    }
    sendResponse(true);
});

function refresh(){
		var injectedCode = 'try{ria.__REQUIRE.reloadJade()}catch(e){}';
		var script = document.createElement('script');
		script.appendChild(document.createTextNode(injectedCode));
		(document.body || document.head || document.documentElement).appendChild(script);
}
