"use strict";
var PalitoHelperUtils = { };

PalitoHelperUtils.waitFor = function(selector, checkOperation) {
	return new Promise((resolve, reject) => {
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

PalitoHelperUtils.waitForElementToHide = function(selector) {
	return PalitoHelperUtils.waitFor(selector, selector => !$(selector).is(":visible"));
};

PalitoHelperUtils.waitForElementToShow = function(selector) {
	return PalitoHelperUtils.waitFor(selector, selector => $(selector).is(":visible"));
};

PalitoHelperUtils.waitForElementToLoad = function(selector, length) {
	return PalitoHelperUtils.waitFor(selector, selector => length ? $(selector).length === length : !!$(selector).length);
};

