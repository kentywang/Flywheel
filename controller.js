(() => {
	if (window == top) {
		window.addEventListener("keydown", onKeyDown);
		window.addEventListener("keyup", onKeyUp);
	}
})();

function onKeyDown (e) {
	if (e.key === "Alt") {
		chrome.runtime.sendMessage({action: "keyDown"}, response => {
			console.log(response.payload);

			const hud = document.createElement("ol");
			hud.setAttribute("id", "hud");

			response.payload.tabs.forEach(tab => {
				const item = document.createElement("li");

				item.appendChild(document.createTextNode(tab.title));
				
				const image = document.createElement("img");
				image.src = tab.favIconUrl;
				image.width = "32";
				image.height = "32";
				item.appendChild(image);

				hud.appendChild(item);
			});

			document.body.appendChild(hud);

			document.body.requestPointerLock();
			document.addEventListener("mousemove", updatePosition);
		});
	}
}

function onKeyUp (e) {
	if (e.key === "Alt") {
		chrome.runtime.sendMessage({action: "keyUp"}, response => {
			console.log(response.action);

			document.getElementById("hud").remove();

			document.exitPointerLock();
			document.removeEventListener("mousemove", updatePosition);
		});
	}
}

function updatePosition(e) {
	if (e.movementX > e.movementY) {
		console.log('x > y')
	} else {
		console.log('x <= y')
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