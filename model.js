const state = {
	flywheel: [],
	selectedTabIndex: null
};

function getTabList () {
	return new Promise((resolve, reject) => {
		chrome.windows.getLastFocused({populate: true}, window => {
			resolve(window.tabs);
		});
	});
}

function switchToTabAt (tabList, index) {
	return new Promise((resolve, reject) => {
		chrome.tabs.update(tabList[index].id, {active: true}, tab => {
			resolve(tab);
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
	const offset = radiansPerTab / 2;

	// swap arg order to rotate 90 degrees
	let radiansAtMouse = Math.atan2(movement.x, -movement.y);

	// convert negative radians to positive
	if (radiansAtMouse < 0) {
		radiansAtMouse += (2 * Math.PI);
	}

	// console.log(radiansAtMouse, Math.floor(radiansAtMouse / radiansPerTab))

	return Math.floor((radiansAtMouse + offset) / radiansPerTab);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.action) {
	case "keyDown":
		// console.log('keyDown')
		getTabList()
		.then(tabList => {
			// store culled property list with coords
			state.flywheel = withCoords(tabList.map(({
				title,
				favIconUrl,
				id,
				active
			}) => ({
				title,
				favIconUrl,
				id,
				active
			})));

			// store index of active tab
			state.selectedTabIndex = state.flywheel.findIndex(tab => (
				tab.active
			));

			// console.log(state)


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

		getTabList()
		.then(tabList => {
			// update tabList again since active tab may have changed
			state.flywheel = withCoords(tabList.map(({
				title,
				favIconUrl,
				id,
				active
			}) => ({
				title,
				favIconUrl,
				id,
				active
			})));

			// check if the newly selected tab is different from active tab
			if (!state.flywheel[state.selectedTabIndex].active) {
				// console.log(`from ${sender.url} send cleanup, switch to`, state.selectedTabIndex, Date.now())
				// sendResponse({command: "cleanUp"});
				return switchToTabAt(tabList, state.selectedTabIndex);
			} else {
				throw "Same tab selected.";
			}
		})
		.then(tab => {
			// pass state to newly activated tab
			chrome.tabs.query({active: true, currentWindow: true}, tabs => {
				chrome.tabs.sendMessage(tabs[0].id, {
					command: "showHud",
					payload: state
				});
			});
			// maybe I can start preloading the flywheel to the new active tab
			// before it is switched to
		})
		.catch(error => {
			// console.log(error);
		});

		break;
	default:
		break;
	}

	// need this to send async response
	return true;
});