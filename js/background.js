"use strict";
chrome.runtime.onMessage.addListener(function (requestInfo, sender, resolve) {
	fetch(requestInfo.url, requestInfo).then(response => {
		if (response.ok) {
			return response.text();
		} else {
			return response.text().then(body => {
				throw response.status + " - " + body;
			});
		}
	}).then(responseText => {
		resolve(responseText);
	}).catch(e => {
		resolve({error: e});
	});
	return true;
});
