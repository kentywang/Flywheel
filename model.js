const tabDistFromCenterMultiplier = 20;

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
			flywheel.tabs = addCoords(tabList);
			console.log(flywheel)
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

function addCoords(tabList) {
	return tabList.map((tab, i) => {
		const tabWithCoords = Object.assign({}, tab);

		// calculate where item will fall on ring menu in radians
		const radians = i * 2 * Math.PI / tabList.length;

		// get cartesian coords from radians
		tabWithCoords.x = Math.cos(radians);
		tabWithCoords.y = Math.sin(radians);

		// amplify coordinates
		tabWithCoords.x *= tabDistFromCenterMultiplier;
		tabWithCoords.y *= tabDistFromCenterMultiplier;

		// stringify with relevant CSS units
		tabWithCoords.x += "vw";
		tabWithCoords.y += "vh";

		return tabWithCoords;
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