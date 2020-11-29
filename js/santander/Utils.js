"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};
if (!palito.santander.utils) palito.santander.utils = {};


/**
 * @param selector of elements that want to match.
 * @param keyFromScope can include "." if nested properties want to be returned.
 * @return {Promise<*[]>}
 */
palito.santander.utils.getScopeFromElements = function (selector, keyFromScope) {
	let eventType = "SCOPE_FETCH";
	return PalitoHelperUtils.executeScript(`
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
	`, event => event.data.type && event.data.type === eventType &&
		event.data.selector === selector && event.data.keyFromScope === keyFromScope
	).then(eventData => eventData.scopes);
};


palito.santander.utils.updateScopeToElement = function (selector, keyFromScope, keyInScope, valueForKey) {
	let eventType = "SCOPE_CHANGE";
	return PalitoHelperUtils.executeScript(`
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
	`, event => event.data.type && event.data.type === eventType &&
		event.data.selector === selector && event.data.keyFromScope === keyFromScope &&
		event.data.keyInScope === keyInScope && event.data.valueForKey === valueForKey
	).then(eventData => eventData.scope);
};

palito.santander.utils.scopeToText = function (scope) {
	if (!scope) return "";
	return Object.entries(scope).map(entry => entry[0] + ": " + entry[1]).join("\n");
};
