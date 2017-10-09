const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 5;

let canAddHud = true;

function onKeyDown (e) {
	console.log('KEYDOWN')
	if (e.key === "Alt") {
		chrome.runtime.sendMessage({action: "keyDown"}, response => {
			console.log('addtopage from keydown resp')
			addToPage(response.payload);
		});
	}
}

function onKeyUp (e) {
	console.log('KEYUP')
	if (e.key === "Alt") {
		// console.log('cleanup from keyup')
		cleanUp();
	}
}

function updatePosition (e) {
	if (
		Math.hypot(e.movementX, e.movementY) > mouseSensitivityThreshold
		// && document.getElementById("hud")
	) {
		chrome.runtime.sendMessage({
			action: "mouseMoved",
			payload: {x: e.movementX, y: e.movementY}
		}, response => {
			// console.log('cleanup from updatepos resp', Date.now())
			// cleanUp();
		});
	}
}

function addToPage ({flywheel, selectedTabIndex}) {
	if (canAddHud) {
		canAddHud = false;

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
		document.addEventListener("webkitvisibilitychange", handleVisibilityChange);

		window.addEventListener("keyup", onKeyUp);
	}
}

function handleVisibilityChange() {
	if (document.webkitHidden) {
		cleanUp();
	}
}

function cleanUp () {
	console.log('cleaning')
	document.getElementById("hud").remove();
	document.removeEventListener("mousemove", updatePosition);
	document.removeEventListener("webkitvisibilitychange", handleVisibilityChange);

	window.removeEventListener("keyup", onKeyUp);

	canAddHud = true;
	// promisify this?


}

// if (window == top) {
	// console.log('windowTop')
	window.addEventListener("keydown", onKeyDown);
	// window.addEventListener("keyup", onKeyUp);
// }

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.command) {
	case "showHud":
		console.log('addtopage from updatepos resp')
		addToPage(request.payload);

		break;
	default:
		break;
	}
});

// tasks:

// placeholder favicon

// fix leftover hud
// leftover mouselistener [DONE?]
// errors

// normalize css
// better styling

// get pointerlock working
// get better mousetracking

// handle multiple windows

// namespace #hud

// switching to incorrect tabs on input
// reason: divvying up sections wrong.

// visibility api may be my key to pointerlock?

// I think I solved the lefthover hud issue (not the most elegant solution,
// using state instaed of figuring out root)

// sticky hud, unsticks after keydown and keyup
// (my guess is keyup not being detected)

// page sometimes not detecting any key events until mouseclick
// think it's cuz focus is on console
// window focus doesn't seem to work

// radial distance from first hold