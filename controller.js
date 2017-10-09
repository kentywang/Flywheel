const tabDistFromCenterMultiplier = 20;
const mouseSensitivityThreshold = 5;

let canAddHud = true;

function updatePosition (e) {
	if (Math.hypot(e.movementX, e.movementY) > mouseSensitivityThreshold) {
		if (e.altKey) { // this...
			chrome.runtime.sendMessage({
				action: "mouseMoved",
				payload: {x: e.movementX, y: e.movementY}
			});
		} else {
			cleanUp(); // ...and this kinda mitigate sticky hud issue, but only after user moves mouse
		}
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
	}
}

function handleVisibilityChange() {
	if (document.webkitHidden) {
		cleanUp();
	}
}

function cleanUp () {
	// console.log('cleaning')
	document.getElementById("hud").remove();
	document.removeEventListener("mousemove", updatePosition);
	document.removeEventListener("webkitvisibilitychange", handleVisibilityChange);

	canAddHud = true;
	// promisify this?
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
	switch (request.command) {
	case "showHud":
		console.log('addtopage from updatepos resp')
		addToPage(request.payload);

		break;
	case "clearHud":
		console.log('cleanhud')
		cleanUp();

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

// need state for keyheld?

// page sometimes not detecting any key events until mouseclick
// think it's cuz focus is on console
// window focus doesn't seem to work

// radial distance from first hold