let state;
let page = "https://wikiviz.rainflame.com";
let allTrails = [];
const shortenerUrl = "https://rainfla.me/api/v1/shorten/";

// recursively traverse the state object to get the last pages
function getEndPages(prevObj, trailObj, keepers) {
  if (trailObj.t.length === 0) {
    keepers.push(trailObj.p);
    return;
  } else {
    for (const step of trailObj.t) {
      getEndPages(trailObj, step, keepers);
    }
  }
}

// recursively traverse the state object to get all pages
function getAllPages(prevObj, trailObj, keepers) {
  keepers.push(trailObj.p);
  if (trailObj.t.length === 0) {
    return;
  } else {
    for (const step of trailObj.t) {
      getAllPages(trailObj, step, keepers);
    }
  }
}

// get the current page URL and add it to the popup
function getTrail() {
  // get the page url, if it exists
  let gettingUrl = browser.storage.sync.get("page");
  gettingUrl.then((res) => {
    if (res.page !== undefined) {
      // get the state by decoding the trail from base64
      state = JSON.parse(atob(res.page.split("trail/")[1]));
      page = res.page;

      const pages = [state.p];
      getEndPages(state, state, pages);
      if (pages[1] === state.p) pages.splice(1, 1);
      if (pages.length > 3) pages.splice(3, pages.length - 3);
      let pagesStr = pages.toString();
      pagesStr = pagesStr.split("_").join(" ");
      pagesStr = pagesStr.split(",").join(", ");
      pagesStr = pages.length > 1 ? pagesStr.substr(0, 37) + "..." : pagesStr;

      // set the save button back if it's been changed
      document.getElementById("save-button").innerHTML = "Save trail";
      document.getElementById("save-button").onclick = () => {
        saveTrail();
      };
      document.getElementById("trail").innerHTML = pagesStr;
    }
  });
}

// get the saved trails from browser storage
function getSavedTrails() {
  let getting = browser.storage.sync.get("trails");
  getting.then((result) => {
    if (result.trails) {
      allTrails = result.trails;
    }
  });
}

// called when the search query changes and filters through the trail objects
function searchForTrail(e) {
  const query = e.target.value;

  let temp = [];

  if (query !== "") {
    temp = allTrails.filter((obj) => {
      return obj.t.toLowerCase().includes(query.toLowerCase());
    });
  }

  const recs = document.getElementById("search-recs");
  recs.innerHTML = "";

  for (const trail of temp) {
    const t = document.createElement("DIV");
    t.classList.add("rec");
    t.innerHTML = trail.t;
    t.onclick = () => {
      browser.tabs.create(
        { url: trail.l } // object
      );
    };
    recs.appendChild(t);
  }

  console.log(temp);
}

// save the trail as a short URL and in browser memory
function saveTrail() {
  document.getElementById("save-button").innerHTML = "Saving...";

  // post body data
  const body = {
    long_url: page,
  };

  // create request object
  const request = new Request(shortenerUrl, {
    method: "POST",
    body: JSON.stringify(body),
    headers: new Headers({
      "Content-Type": "application/json",
    }),
  });

  // pass request object to `fetch()`
  fetch(request)
    .then((res) => res.json())
    .then((res) => {
      // change the button
      document.getElementById("save-button").onclick = () => {};
      document.getElementById("save-button").innerHTML = "Saved!";
      document.getElementById("saved-wrapper").style.display = "block";

      const link = document.getElementById("saved");
      const instructions = document.getElementById("saved-instructions");
      instructions.innerHTML = "Click link to copy";
      link.spellcheck = false;
      //link.disabled = true;
      link.value = res.short_url;

      // save to clipboard when link is clicked
      link.onclick = () => {
        link.select();
        document.execCommand("copy");
        document.getElementById("saved-instructions").innerHTML =
          "Copied link!";
      };

      // save the trail to browser storage
      browser.storage.sync.get("trails").then((result) => {
        // get the previously saved trails if they exist
        let newTrails = [];
        if (result.trails) {
          newTrails = result.trails;
        }
        const pages = [];
        // get all the pages in the current trail and create a string
        getAllPages(state, state, pages);
        let pagesStr = pages.toString();
        pagesStr = pagesStr.split("_").join(" ");
        pagesStr = pagesStr.split(",").join(", ");

        // add the new trail to the list of trails in storage
        newTrails.push({ t: pagesStr, l: res.short_url });
        browser.storage.sync.set({ trails: newTrails });
      });
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
  const currentOption = document.getElementById("options-button").textContent;
  let newOption = "Disable";
  if (currentOption === "Disable") newOption = "Enable";
  browser.storage.sync.set({ option: newOption });
  setOutline(newOption);
  document.getElementById("options-button").innerHTML = newOption;
}

// set the option from storage when page is opened
function restoreOptions() {
  function setCurrentChoice(result) {
    const newOption = result.option || "Disable";
    document.getElementById("options-button").innerHTML = newOption;

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
  // add onclick functionality to buttons in options
  document.getElementById("save-button").onclick = () => {
    saveTrail();
  };
  document.getElementById("options-button").onclick = (e) => {
    saveOptions(e);
  };

  document.getElementById("input-search").onfocus = () => {
    getSavedTrails();
  };

  document
    .getElementById("input-search")
    .addEventListener("input", searchForTrail);
});
