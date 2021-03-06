const state = {
  flywheel: [],
  activeTabIndex: null,
  selectedTabIndex: null,
};

const mouseSensitivityThreshold = 50;


function getTabList() {
  return new Promise((resolve) => {
    chrome.windows.getLastFocused({ populate: true }, (window) => {
      resolve(window.tabs);
    });
  });
}


function switchToTabAt(tabList, index) {
  return new Promise((resolve) => {
    chrome.tabs.update(tabList[index].id, { active: true }, (tab) => {
      resolve(tab);
    });
  });
}


// returns argument list of tabs with coords added
function withCoords(tabList) {
  return tabList.map((tab, i) => {
    const tabWithCoords = Object.assign({}, tab);

    // calculate where item will fall on ring menu in radians
    let radiansAtTab = ((tabList.length - i) * (2 * Math.PI)) / tabList.length;

    // rotate 180 degrees to put first item on top
    radiansAtTab -= Math.PI;

    // get cartesian coords from radians
    tabWithCoords.x = Math.cos(radiansAtTab);
    tabWithCoords.y = Math.sin(radiansAtTab);

    return tabWithCoords;
  });
}


function determineSelectedTabIndex(radiansAtMouse, tabListLength) {
  const radiansPerTab = (2 * Math.PI) / tabListLength;

  // offset to rotate tracking clockwise half a tab unit
  const offset = radiansPerTab / 2;

  // convert negative radians to positive
  if (radiansAtMouse < 0) {
    radiansAtMouse += (2 * Math.PI);
  }

  // console.log(
  //   radiansAtMouse,
  //   radiansPerTab,
  //   Math.floor((radiansAtMouse + offset) / radiansPerTab) % tabListLength
  // );

  // need modulo because the radians with offset can exceed 2π
  return Math.floor((radiansAtMouse + offset) / radiansPerTab) % tabListLength;
}


const pointer = new Pointer(mouseSensitivityThreshold);

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.action) {
    case 'keyDown':
      // console.log('keyDown')
      getTabList()
        .then((tabList) => {
          // store culled property list with coords
          state.flywheel = withCoords(tabList.map(({
            title,
            favIconUrl,
            id,
            active,
          }) => ({
            title,
            favIconUrl,
            id,
            active,
          })));

          // store index of active tab
          state.activeTabIndex = state.flywheel.findIndex(tab => (
            tab.active
          ));

          state.selectedTabIndex = null;

          // console.log(state)

          sendResponse({
            command: 'showHud',
            payload: state,
          });

          pointer.resetCoords();
        });

      break;
    case 'mouseMoved':
      pointer.updateCoords(request.payload);

      state.selectedTabIndex = pointer.overThreshold() ?
        determineSelectedTabIndex(
          pointer.radiansAtMouse,
          state.flywheel.length,
        ) :
        null;

      new Promise((resolve) => {
        // check if the newly selected tab is different from active tab
        if (
          state.flywheel[state.selectedTabIndex]
          && !state.flywheel[state.selectedTabIndex].active
        ) {
          // console.log(`from ${sender.url}, switch to`, state.selectedTabIndex, Date.now())
          resolve(switchToTabAt(state.flywheel, state.selectedTabIndex));
        } else {
          resolve(true);
        }
      })
        .then(() => (
          getTabList()
        ))
        .then((tabList) => {
          // update tabList again since active tab may have changed
          state.flywheel = withCoords(tabList.map(({
            title,
            favIconUrl,
            id,
            active,
          }) => ({
            title,
            favIconUrl,
            id,
            active,
          })));

          // console.log(state.selectedTabIndex, state.flywheel.length)

          state.activeTabIndex = state.flywheel.findIndex(tab => (
            tab.active
          ));

          // pass state to newly activated tab
          chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.tabs.sendMessage(tabs[0].id, {
              command: 'showHud',
              payload: state,
            });
          });
          // maybe I can start preloading the flywheel to the new active tab
          // before it is switched to
        })
        .catch((error) => {
          console.log(error);
        });

      break;
    default:
      break;
  }

  // need this to send async response
  return true;
});

