const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 8;

if (window == top) {
	console.log('windowTop')
	window.addEventListener("keydown", onKeyDown);
	window.addEventListener("keyup", onKeyUp);
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.command) {
	case "showTabs":
		addToPage(request.payload);

		break;

	default:
		break;
	}
});

function onKeyDown (e) {
	if (e.key === "Alt") {
		console.log('keydown')
		chrome.runtime.sendMessage({action: "keyDown"}, response => {
			addToPage(response.payload);
		});
	}
}

function onKeyUp (e) {
	if (e.key === "Alt") {
		cleanUp();
	}
}

function updatePosition (e) {
	if (
		Math.abs(e.movementX) > mouseSensitivityThreshold
		|| Math.abs(e.movementY) > mouseSensitivityThreshold
		// && document.getElementById("hud")
	) {
		console.log('firingMouseMoved')
		chrome.runtime.sendMessage({
			action: "mouseMoved",
			payload: {x: e.movementX, y: e.movementY}
		}, response => {
			cleanUp();
			// chrome.runtime.sendMessage({action: "cleaned"});
		});
	}
}

function addToPage ({flywheel, selectedTabIndex}) {
	console.log('adding')
	// create ordered list of tabs
	const hud = document.createElement("ol");
	hud.setAttribute("id", "hud");

	flywheel.forEach((tab, i) => {
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
		if (i === selectedTabIndex) {
			item.classList.add("selected");
		}

		// add item to list
		hud.appendChild(item);
	});

	// add list to doc body
	document.body.appendChild(hud); 

	document.addEventListener("mousemove", updatePosition);
}

function cleanUp () {
	document.getElementById("hud").remove();
	document.removeEventListener("mousemove", updatePosition);
	console.log('cleaned up')
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

// namespace #hud

// switch to newly opened tab -> kills hud and no
// mouse listen, and active hud and mouse listen on last pg

// I figured out controller js is like an instance of a tab, so when I think
// I'm adding the active tab to the newly switched page, I be wrong

// now I gotta figure out why cleanup isn't finishing to completion all the time
