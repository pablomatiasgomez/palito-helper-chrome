"use strict";
let PalitoHelperUtils = {};

PalitoHelperUtils.waitFor = function (selector, checkOperation) {
	return new Promise((resolve) => {
		let check = () => {
			if (checkOperation(selector)) {
				resolve();
			} else {
				setTimeout(check, 100);
			}
		};
		check();
	});
};

PalitoHelperUtils.waitForElementToHide = function (selector) {
	return PalitoHelperUtils.waitFor(selector, selector => !$(selector).is(":visible"));
};

PalitoHelperUtils.waitForElementToShow = function (selector) {
	return PalitoHelperUtils.waitFor(selector, selector => $(selector).is(":visible"));
};

PalitoHelperUtils.waitForElementToLoad = function (selector, length) {
	return PalitoHelperUtils.waitFor(selector, selector => length ? $(selector).length === length : !!$(selector).length);
};


PalitoHelperUtils.executeScript = function (script, eventMatcher) {
	return new Promise((resolve) => {
		if (eventMatcher) {
			// if event matcher provided, create listener and the promise will wait until we get the event.
			let listener = function (event) {
				if (event.source !== window) return;
				if (eventMatcher(event)) {
					window.removeEventListener("message", listener);
					resolve(event.data);
				}
			};
			window.addEventListener("message", listener, false);
		}

		let scriptElement = document.createElement('script');
		scriptElement.textContent = script;
		document.head.appendChild(scriptElement);

		if (!eventMatcher) {
			resolve();
		}
	});
};