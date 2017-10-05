const state = {
	keyHeld: false
};

const flywheel = {
	tabs: [
		"Hello",
		"World",
		"Star"
	],
	selected: 1
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.action) {

	case "keyUp":
		state.keyHeld = false;

		sendResponse({action: state.keyHeld});

		break;

	case "keyDown":
		state.keyHeld = true;

		getTabList().then(tabList => {
			flywheel.tabs = tabList;
			
			sendResponse({action: state.keyHeld, payload: flywheel});
		});

		break;

	default:
		break;
	}

	// need this to send async response
	return true;
});

function getTabList () {
	return new Promise((resolve, reject) => {
		chrome.windows.getLastFocused({populate: true}, window => {
			resolve(window.tabs.map(tab => ({title: tab.title, favIconUrl: tab.favIconUrl})));
		});
	});
}

// chrome.windows.getLastFocused({populate: true}, window =>	{
// 	var foundSelected = false;

// 	for (var i = 0; i < window.tabs.length; i++) {
// 		// Finding the selected tab.
// 		if (window.tabs[i].active) {
// 			foundSelected = true;
// 		}
// 		// Finding the next tab.
// 		else if (foundSelected) {
// 			// Selecting the next tab.
// 			chrome.tabs.update(window.tabs[i].id, {active: true});
// 			return;
// 		}
// 	}
// });