var PalitoHelperUtils = { };

PalitoHelperUtils.waitFor = function(selector, checkOperation) {
	return new Promise((resolve, reject) => {
		let times = 0;
		let check = () => {
			if (++times > 20) return reject("Max times wait.");
			if (checkOperation(selector)) {
				resolve();
			} else {
				setTimeout(check, 200);
			}
		};
		check();
	});
};

PalitoHelperUtils.waitForElementToHide = function(selector) {
	return PalitoHelperUtils.waitFor(selector, selector => !$(selector).is(":visible"));
};

PalitoHelperUtils.waitForElementToLoad = function(selector) {
	return PalitoHelperUtils.waitFor(selector, selector => !!$(selector).length);
};

