function redir() {
	// get the wikipedia page, encode to state, and redir to wikiviz
	const curLoc = window.location.href;
	const wiki = curLoc.split("wiki/")[1];

	const trail = { p: wiki, t: [] };
	const enc = btoa(JSON.stringify(trail));

	window.location.href = `https://wikiviz.rainflame.com/trail/${enc}`;
}

function onGot(result) {
	// the extension is currently activated
	if (result.option === undefined || result.option !== "Enable") {
		redir();
	}
}

function onError(e) {
	console.log(e);
}

let getting = browser.storage.sync.get("option");
getting.then(onGot, onError);
