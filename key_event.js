
console.log(document)

var div=document.createElement("div");
div.setAttribute("id", "hud"); 
div.classList.add("hidden"); 
document.body.appendChild(div); 
div.innerText="test123 OMG!!!!!!!!!!!";

console.log('woof')

if (window == top) {
window.addEventListener('keydown', doKeyPress, false); //add the keyboard handler
}

trigger_key = 71; // g key
function doKeyPress(e){

	if (div.className === "hidden") {
		div.classList.remove("hidden");

		div.requestPointerLock = div.requestPointerLock || div.mozRequestPointerLock;
		div.requestPointerLock();

		document.addEventListener("mousemove", updatePosition, false);
	} else {
		div.classList.add("hidden"); 

		document.exitPointerLock = document.exitPointerLock || document.mozExitPointerLock;
		document.exitPointerLock();
	}

	if (e.altKey && e.keyCode == trigger_key){ // if e.shiftKey is not provided then script will run at all instances of typing "G"
		console.log('bruh')
		// chrome.extension.sendRequest({redirect: newurl}); //build newurl as per viewtext URL generated earlier.

	}
}

function updatePosition(e) {
	if (e.movementX > e.movementY) {
		chrome.runtime.sendMessage({greeting: "hello"}, function(response) {
		  console.log(response.farewell);
		});
	} else {
		chrome.runtime.sendMessage({greeting: "herro"}, function(response) {
		  console.log(response.farewell);
		});
	}
}

// i need to store key state in centralized location, e.g. on background js.!!!
// also need to store how the hud looks there too.