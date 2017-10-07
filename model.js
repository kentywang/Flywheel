const state = {
	flywheel: [],
	selectedTabIndex: null
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.action) {
	case "keyDown":
		// console.log('keyDown')
		Promise.all([getTabList(), getActiveTab()])
		.then(([tabList, selectedTabIndex]) => {
			// only time we update the internal list of tabs is here
			state.flywheel = withCoords(tabList);
			state.selectedTabIndex = selectedTabIndex;

			sendResponse({
				command: "showTabs",
				payload: state
			});
		});

		break;

	case "mouseMoved":
		state.selectedTabIndex = determineSelectedTabIndex(
			request.payload,
			state.flywheel.length
		);
		console.log('mouseMoved')

		// if (!isCurrentTab(state.selectedTabIndex)) {
			sendResponse({command: "cleanUp"});
		// }

		getWindow()
		.then(window => {
			return switchToTabAt(window, state.selectedTabIndex);
		})
		.then(tab => {
			// console.log('tab', tab)

			// pass state to newly activated tab
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, {
					command: "showTabs",
					payload: state
				});
			});
		});

		break;

	// case "cleaned":
	// 	// console.log('cleaned')
	// 	getWindow()
	// 	.then(window => {
	// 		return switchToTabAt(window, state.selectedTabIndex);
	// 	})
	// 	.then(tab => {
	// 		// console.log('tab', tab)
	// 		sendResponse({
	// 			command: "showTabs",
	// 			payload: state
	// 		});
	// 	});

	// 	break;

	default:
		break;
	}

	// need this to send async response
	return true;
});

// duplicate functionality w/ getWindow
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

function getActiveTab () {
	return new Promise((resolve, reject) => {
		chrome.tabs.query({active: true, currentWindow: true}, tabs => {
			resolve(tabs[0].index);
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

		return tabWithCoords;
	});
}

function determineSelectedTabIndex (movement, tabListLength) {
	// movement.x: left-, right+
	// movement.y: up-, down+
	const radiansPerTab = (2 * Math.PI) / tabListLength;

	// swap arg order to rotate 90 degrees
	let radiansAtMouse = Math.atan2(movement.x, -movement.y);

	// convert negative radians to positive
	if (radiansAtMouse < 0) {
		radiansAtMouse += (2 * Math.PI);
	}

	return Math.floor(radiansAtMouse / radiansPerTab);
}

function getWindow () {
	return new Promise((resolve, reject) => {
		chrome.windows.getLastFocused({populate: true}, window => {
			resolve(window);
		});
	});
}

function switchToTabAt (window, index) {
	return new Promise((resolve, reject) => {
		chrome.tabs.update(window.tabs[index].id, {active: true}, tab => {
			resolve(tab);
		});
	});
}

