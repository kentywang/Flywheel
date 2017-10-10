const tabDistFromCenterMultiplier = 20;

// let canAddHud = true;

function onKeyDown (e) {
	// console.log('KEYDOWN')
	if (e.key === "Alt") {
		chrome.runtime.sendMessage({action: "keyDown"}, response => {
			// console.log('addtopage from keydown resp')
			addToPage(response.payload);
		});
	}
}

function onKeyUp (e) {
	// console.log('KEYUP')
	if (e.key === "Alt") {
		console.log('cleanup from keyup')
		cleanUp();
	}
}

function updatePosition (e) {
	if (!e.altKey) {
		// this is a bandage solution to problem with the rare keyup being lost 
		// in between tab switches
		cleanUp();
	} else {
		chrome.runtime.sendMessage({
			action: "mouseMoved",
			payload: {x: e.movementX, y: e.movementY}
		});
	}
}

function addToPage ({flywheel, activeTabIndex, selectedTabIndex}) {
	// if (canAddHud) {
		cleanUp();
		// create ordered list of tabs
		const hud = document.createElement("div");
		hud.setAttribute("id", "hud");

		const ring = document.createElement("ol")
		hud.appendChild(ring);

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

			if (i === activeTabIndex) {
				item.classList.add("active");
			}

			// add item to list
			ring.appendChild(item);
		});

		// add list to doc body
		document.body.appendChild(hud); 

		document.addEventListener("mousemove", updatePosition);
		document.addEventListener("webkitvisibilitychange", handleVisibilityChange);

		window.addEventListener("keyup", onKeyUp);
		
		// canAddHud = false;
	// }
}

function handleVisibilityChange() {
	if (document.webkitHidden) {
		console.log('cleanup from tabhide')
		cleanUp();
	}
}

function cleanUp () {
	if (document.getElementById("hud")) {
		document.getElementById("hud").remove();
		document.removeEventListener("mousemove", updatePosition);
		document.removeEventListener("webkitvisibilitychange", handleVisibilityChange);

		window.removeEventListener("keyup", onKeyUp);
	}

	// promisify this?
	// canAddHud = true;
}

// if (window == top) {
	window.addEventListener("keydown", onKeyDown);
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

// fix leftover hud [DONE]
// leftover mouselistener [DONE]
// errors [DONE]
// get pointerlock working [DONE]
// get better mousetracking [DONE]
// switching to incorrect tabs on input [DONE]
	// reason: divvying up sections wrong.
// I think I solved the lefthover hud issue (not the most elegant solution, [DONE]
	// using state instaed of figuring out root)
// sticky hud, unsticks after keydown and keyup [DONE]
	// (my guess is keyup not being detected)
// page sometimes not detecting any key events until mouseclick [DONE]
	// think it's cuz focus is on console
// radial distance from first hold [DONE]

// placeholder favicon
	// give icons nice border radius!

// normalize css
// better styling

// handle multiple windows

// namespace #hud

// merge state and pointer

// hud color/bold issues

// selectedtabindex wrong values??

// implement buffer zone for selected tab?

// snapping/slighty-sticky tabs?