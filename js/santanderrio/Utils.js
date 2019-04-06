"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.utils) palito.santanderrio.utils = {};


palito.santanderrio.utils.getScopeFromElements = function(selector, keyFromScope) {
	return new Promise((resolve, reject) => {
		let listener = function(event) {
			if (event.source != window) return;
			if (event.data.type && event.data.type == "SCOPE_FETCH" && 
				event.data.selector === selector && event.data.keyFromScope === keyFromScope) {

				window.removeEventListener("message", listener);
				resolve(event.data.scopes);
			}
		};
		window.addEventListener("message", listener, false);
		
		let script = `
			(function() {
				let elements = document.querySelectorAll("${selector}");
				let scopes = [];
				for (var i = 0; i < elements.length; i++) {
					scopes.push(angular.element(elements[i]).scope()["${keyFromScope}"]);
				}
				window.postMessage({
					type: "SCOPE_FETCH",
					selector: "${selector}",
					keyFromScope: "${keyFromScope}",
					scopes: scopes
				}, "*");
			})();
		`;
		var scriptElement = document.createElement('script');
		scriptElement.textContent = script;
		document.head.appendChild(scriptElement);
	});
};
