var Store = function() {

	const DETAILS_BY_COMPROBANTE_STORE_KEY = "santanderrio.detailsByComprobante";

	function readDetailsByComprobanteFromStore() {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(DETAILS_BY_COMPROBANTE_STORE_KEY, function(result) {
				resolve(result[DETAILS_BY_COMPROBANTE_STORE_KEY]);
			});
		});
	}

	function saveDetailsByComprobanteToStore(detailsByComprobante) {
		chrome.storage.sync.set({ [DETAILS_BY_COMPROBANTE_STORE_KEY]: detailsByComprobante });
	}

	// Public
	return {
		readDetailsByComprobanteFromStore: readDetailsByComprobanteFromStore,
		saveDetailsByComprobanteToStore: saveDetailsByComprobanteToStore
	};
};
