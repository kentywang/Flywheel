const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 8;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.command) {
	case "hideTabs":
		console.log('hideTabs')
		// clean up listeners and HTML injection on current tab
		document.getElementById("hud").remove();
		
		new Promise((resolve, reject) => {
			resolve(document.exitPointerLock());
		}).then(() => {
			console.log('exitedPointerLock')
			chrome.runtime.sendMessage({action: "tabCleared"});
		});

		break;

	case "showTabs":
		console.log('showTabs')
		// create ordered list of tabs
		const hud = document.createElement("ol");
		hud.setAttribute("id", "hud");

		request.payload.flywheel.forEach((tab, i) => {
			// create item in list
			const item = document.createElement("li");

			// amplify coords and stringify with relevant CSS units
			item.style.marginTop = tab.x * tabDistFromCenterMultiplier + "vw";
			item.style.marginLeft = tab.y * tabDistFromCenterMultiplier + "vw";

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

		break;

	default:
		break;
	}
});

document.addEventListener("pointerlockchange", pointerLockChanged);

if (window == top) {
	console.log('windowTop')
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}

function onKeyDown (e) {
	if (e.key) {
		console.log('altkeydown')
		document.body.requestPointerLock();
	}
}

function onKeyUp (e) {
	if (e.key) {
		console.log('altkeyup')
		// don't need model to tell us to clean up
		document.getElementById("hud").remove();
		
		document.exitPointerLock();
	}
}

function pointerLockChanged () {
	console.log('pointer status:', document.pointerLockElement)
	if (document.pointerLockElement) {
		chrome.runtime.sendMessage({action: "pointerLocked"});
		document.addEventListener("mousemove", updatePosition);
	} else {
		document.removeEventListener("mousemove", updatePosition);
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

// elliptical ring?

// normalize css
// better styling

// get pointerlock working
// get better mousetracking

// handle multiple windows