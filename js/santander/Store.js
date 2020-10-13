"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};
if (!palito.santander.store) palito.santander.store = {};


const DETAILS_BY_KEY_STORE_KEY = "santanderrio.detailsByComprobante";

palito.santander.store.readDetailsByKeyFromStore = function () {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(DETAILS_BY_KEY_STORE_KEY, function (result) {
			if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
			resolve(result[DETAILS_BY_KEY_STORE_KEY] || {});
		});
	});
};

palito.santander.store.saveDetailsByKeyToStore = function (detailsByKey) {
	chrome.storage.sync.set({[DETAILS_BY_KEY_STORE_KEY]: detailsByKey});
};

