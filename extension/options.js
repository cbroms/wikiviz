function setOutline(option) {
  if (option === "Enable") {
    document.body.style.border = "4px solid red";
  } else {
    document.body.style.border = "4px solid green";
  }

  document.getElementById("option").innerHTML =
    option === "Disable" ? "ON" : "OFF";
}

function saveOptions(e) {
  e.preventDefault();
  const currentOption = document.getElementById("button").textContent;
  let newOption = "Disable";
  if (currentOption === "Disable") newOption = "Enable";
  browser.storage.sync.set({ option: newOption });
  setOutline(newOption);
  document.getElementById("button").innerHTML = newOption;
}

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

document.addEventListener("DOMContentLoaded", restoreOptions);
document.querySelector("form").addEventListener("submit", saveOptions);
