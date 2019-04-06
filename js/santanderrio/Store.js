"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.store) palito.santanderrio.store = {};


const DETAILS_BY_KEY_STORE_KEY = "santanderrio.detailsByComprobante";

palito.santanderrio.store.readDetailsByKeyFromStore = function() {
	return new Promise((resolve, reject) => {
		chrome.storage.sync.get(DETAILS_BY_KEY_STORE_KEY, function(result) {
			resolve(result[DETAILS_BY_KEY_STORE_KEY]);
		});
	});
};

palito.santanderrio.store.saveDetailsByKeyToStore = function(detailsByKey) {
	chrome.storage.sync.set({ [DETAILS_BY_KEY_STORE_KEY]: detailsByKey });
};

