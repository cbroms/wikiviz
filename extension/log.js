// this is a stupid way of getting the current window location should probably change it
window.setInterval(function () {
	browser.storage.sync.set({ page: window.location.href });
}, 500);
