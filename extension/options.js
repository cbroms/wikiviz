// recursively traverse the state object
function getEndPages(prevObj, trailObj, keepers) {
  if (trailObj.t.length === 0) {
    keepers.push(trailObj.p.replace("_", " "));
    return;
  } else {
    for (const step of trailObj.t) {
      getEndPages(trailObj, step, keepers);
    }
  }
}

function getTrail() {
  // get the page url, if it exists
  let gettingUrl = browser.storage.sync.get("page");
  gettingUrl.then((res) => {
    console.log(res.page);
    if (res.page !== undefined) {
      // get the state by decoding the trail from base64
      const state = JSON.parse(atob(res.page.split("trail/")[1]));

      const pages = [state.p.replace("_", " ")];
      getEndPages(state, state, pages);
      if (pages[1] === state.p.replace("_", " ")) pages.splice(1, 1);
      if (pages.length > 3) pages.splice(3, pages.length - 3);
      let pagesStr = pages.toString();
      pagesStr = pages.length > 1 ? pagesStr.substr(0, 37) + "..." : pagesStr;

      document.getElementById("trail").innerHTML = pagesStr;
    }
  });
}

// set the outline color of the page (green for enabled, red for disabled)
function setOutline(option) {
  // if (option === "Enable") {
  //   document.body.style.border = "4px solid red";
  // } else {
  //   document.body.style.border = "4px solid green";
  // }

  document.getElementById("option").innerHTML =
    option === "Disable" ? "ON" : "OFF";
}

// save the options (currenly just enabled/disabled)
function saveOptions(e) {
  e.preventDefault();
  const currentOption = document.getElementById("button").textContent;
  let newOption = "Disable";
  if (currentOption === "Disable") newOption = "Enable";
  browser.storage.sync.set({ option: newOption });
  setOutline(newOption);
  document.getElementById("button").innerHTML = newOption;
}

// set the option from storage when page is opened
function restoreOptions() {
  function setCurrentChoice(result) {
    const newOption = result.option || "Disable";
    document.getElementById("button").innerHTML = newOption;

    setOutline(newOption);
  }

  function onError(error) {
    console.log(`Error: ${error}`);
  }

  let getting = browser.storage.sync.get("option");
  getting.then(setCurrentChoice, onError);
}

// listeners for setting up and saving options
document.addEventListener("DOMContentLoaded", function () {
  restoreOptions();
  getTrail();
});
document.querySelector("form").addEventListener("submit", saveOptions);
