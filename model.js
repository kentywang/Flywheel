const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 2;

const state = {
	keyHeld: false,
	flywheel: []
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.action) {
	case "keyUp":
		state.keyHeld = false;

		sendResponse({action: "showKeyState", payload: state.keyHeld});

		break;

	case "keyDown":
		state.keyHeld = true;

		getTabList().then(tabList => {
			// only time we update the internal list of tabs is here
			state.flywheel = tabList;

			sendResponse({
				action: "showTabs",
				payload: withCoords(state.flywheel)
			});
		});

		break;

	case "mouseMove":
		const selectedTabIndex = determineSelectedTabIndex(
			request.payload,
			state.flywheel.length
		);

		// switchToTabAt(selectedTabIndex);

		sendResponse({
			action: "showTabs",
			payload: selectedTabIndex
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
			resolve(window.tabs.map(tab => ({
				title: tab.title,
				favIconUrl: tab.favIconUrl
			})));
		});
	});
}

// returns argument list of tabs with coords added
function withCoords (tabList) {
	return tabList.map((tab, i) => {
		const tabWithCoords = Object.assign({}, tab);

		// calculate where item will fall on ring menu in radians
		let radiansAtTab = (tabList.length - i) * (2 * Math.PI) / tabList.length;

		// rotate 180 degrees to put first item on top
		radiansAtTab -= Math.PI;

		// get cartesian coords from radians
		tabWithCoords.x = Math.cos(radiansAtTab);
		tabWithCoords.y = Math.sin(radiansAtTab);

		// amplify coordinates
		tabWithCoords.x *= tabDistFromCenterMultiplier;
		tabWithCoords.y *= tabDistFromCenterMultiplier;

		// stringify with relevant CSS units
		tabWithCoords.x += "vw";
		tabWithCoords.y += "vh";

		return tabWithCoords;
	});
}

function determineSelectedTabIndex (movement, tabListLength) {
	// movement.x: left-, right+
	// movement.y: up-, down+

	if (Math.abs(movement.x) > mouseSensitivityThreshold || Math.abs(movement.y) > mouseSensitivityThreshold) {
		const radiansPerTab = (2 * Math.PI) / tabListLength;

		// swap arg order to rotate 90 degrees
		let radiansAtMouse = Math.atan2(movement.x, -movement.y);

		// convert negative radians to positive
		if (radiansAtMouse < 0) {
			radiansAtMouse += (2 * Math.PI);
		}

		return Math.floor(radiansAtMouse / radiansPerTab);
	}
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