"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.utils) palito.santanderrio.utils = {};


palito.santanderrio.utils.executeScript = function(script, eventMatcher) {
	return new Promise((resolve, reject) => {
		let listener = function(event) {
			if (event.source != window) return;
			if (eventMatcher(event)) {
				window.removeEventListener("message", listener);
				resolve(event.data);
			}
		};
		window.addEventListener("message", listener, false);

		var scriptElement = document.createElement('script');
		scriptElement.textContent = script;
		document.head.appendChild(scriptElement);
	});
};

palito.santanderrio.utils.getScopeFromElements = function(selector, keyFromScope) {
	let eventType = "SCOPE_FETCH";
	return palito.santanderrio.utils.executeScript(`
		(function() {
			let elements = document.querySelectorAll("${selector}");
			let scopes = [];
			for (var i = 0; i < elements.length; i++) {
				scopes.push(angular.element(elements[i]).scope()["${keyFromScope}"]);
			}
			window.postMessage({
				type: "${eventType}",
				selector: "${selector}",
				keyFromScope: "${keyFromScope}",
				scopes: scopes
			}, "*");
		})();
	`, event => event.data.type && event.data.type == eventType &&
				event.data.selector === selector && event.data.keyFromScope === keyFromScope
	).then(eventData => eventData.scopes);
};


palito.santanderrio.utils.updateScopeToElement = function(selector, keyFromScope, keyInScope, valueForKey) {
	let eventType = "SCOPE_CHANGE";
	return palito.santanderrio.utils.executeScript(`
		(function() {
			let element = document.querySelector("${selector}");
			let scope = angular.element(element).scope()["${keyFromScope}"];
			scope["${keyInScope}"] = "${valueForKey}";
			window.postMessage({
				type: "${eventType}",
				selector: "${selector}",
				keyFromScope: "${keyFromScope}",
				scope: scope
			}, "*");
		})();
	`, event => event.data.type && event.data.type == eventType &&
				event.data.selector === selector && event.data.keyFromScope === keyFromScope &&
				event.data.keyInScope === keyInScope && event.data.valueForKey === valueForKey
	).then(eventData => eventData.scope);
};

palito.santanderrio.utils.scopeToText = function(scope) {
	return Object.entries(scope).map(entry => entry[0] + ": " + entry[1]).join("\n");
};
