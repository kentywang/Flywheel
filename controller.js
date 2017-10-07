const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 8;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.command) {
	case "hideTabs":
		document.exitPointerLock();
		document.removeEventListener("mousemove", updatePosition);

		document.getElementById("hud").remove();

		chrome.runtime.sendMessage({action: "tabCleared"});

		break;

	case "showTabs":
		// create ordered list of tabs
		const hud = document.createElement("ol");
		hud.setAttribute("id", "hud");

		request.payload.flywheel.forEach((tab, i) => {
			// create item in list
			const item = document.createElement("li");

			// amplify coords and stringify with relevant CSS units
			item.style.marginTop = tab.x * tabDistFromCenterMultiplier + "vw";
			item.style.marginLeft = tab.y * tabDistFromCenterMultiplier + "vh";

			// add title
			item.appendChild(document.createTextNode(tab.title));
			
			// add favicon
			const image = document.createElement("img");
			image.src = tab.favIconUrl;
			image.width = "32";
			image.height = "32";
			item.appendChild(image);

			// highlight selected tab
			if (i === request.payload.selectedTabIndex) {
				item.classList.add("selected");
			}

			// add item to list
			hud.appendChild(item);
		});

		// add list to doc body
		document.body.appendChild(hud);

		document.body.requestPointerLock();
		document.addEventListener("mousemove", updatePosition);

		break;

	default:
		break;
	}

	// return true;
});

if (window == top) {
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}

function onKeyDown (e) {
	if (e.key === "Alt") {
		chrome.runtime.sendMessage({action: "keyDown"});
	}
}

function onKeyUp (e) {
	if (e.key === "Alt") {
		// chrome.runtime.sendMessage({action: "keyUp"});

		// don't need model to tell us to clean up
		document.exitPointerLock();
		document.removeEventListener("mousemove", updatePosition);
		
		document.getElementById("hud").remove();
	}
}

function updatePosition (e) {
	if (
		Math.abs(e.movementX) > mouseSensitivityThreshold
		|| Math.abs(e.movementY) > mouseSensitivityThreshold
	) {
		chrome.runtime.sendMessage({
			action: "mouseMoved",
			payload: {x: e.movementX, y: e.movementY}
		});
	}
}

// tasks:
// render favicon under text
// make circle of tabs
// mark current tab

// switch to new tab on movement
// map movement to degree
// switch to tab if within certain degree

// placeholder favicon

// list => radians => x,y
// mouse x,y => radians

// remove html before siwtching tabs
// then add to newly siwtched tab

// fix leftover hud, leftover mouselistener, errors

// normalize css
// better styling

// get pointerlock working
// get better mousetracking
