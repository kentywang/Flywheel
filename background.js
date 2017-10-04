 alert('momma')

 console.log('momma')

//  chrome.commands.onCommand.addListener(function(command) 
//   if (command === "save") {
//       // alert("save");
//       changeBackgroundColor("red");
//   saveBackgroundColor(url, "red");
//   } else if (command === "random") {
//       // alert("random");
//                 changeBackgroundColor("red");
//   saveBackgroundColor(url, "red");
//   }
// });





chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(sender.tab ?
                "from a content script:" + sender.tab.url :
                "from the extension");
    if (request.greeting == "hello") {
      sendResponse({farewell: "goodbye"});


                  // Getting a list of tabs of the current window.
          chrome.windows.getLastFocused(
           // Without this, window.tabs is not populated.
           {populate: true},
           function (window)
           {
            var foundSelected = false;
            for (var i = 0; i < window.tabs.length; i++)
            {
             // Finding the selected tab.
             if (window.tabs[i].active)
             {
              foundSelected = true;
             }
             // Finding the next tab.
             else if (foundSelected)
             {
              // Selecting the next tab.
              chrome.tabs.update(window.tabs[i].id, {active: true});
              return;
             }
            }
           });
    }

      if (request.greeting == "herro") {
      sendResponse({farewell: "goodbye"});


                  // Getting a list of tabs of the current window.
          chrome.windows.getLastFocused(
           // Without this, window.tabs is not populated.
           {populate: true},
           function (window)
           {
            var foundSelected = false;
            for (var i = 0; i < window.tabs.length; i++)
            {
             // Finding the selected tab.
             if (window.tabs[i].active)
             {
              foundSelected = true;
             }
             // Finding the next tab.
             else
             {
              // Selecting the next tab.
              chrome.tabs.update(window.tabs[i - 2].id, {active: true});
              return;
             }
            }
           });
    }
  });