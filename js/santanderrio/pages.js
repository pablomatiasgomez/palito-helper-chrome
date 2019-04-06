"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};

(function() {

	const PAGE_HANDLERS = {
		"!/plazo-fijo": palito.santanderrio.pages.plazosFijos,
		"!/fondos-de-inversion": palito.santanderrio.pages.fondosDeInversion,
		"!/titulos-valores":  palito.santanderrio.pages.titulosValores,
		"!/tarjetas":  palito.santanderrio.pages.tarjetas,
	};


	// TODO move this to the returned object of the handlers.
	let onContentLoadCallback = () => {};
	let contentLoadObserver = callback => onContentLoadCallback = callback;
	const loadingSelector = "md-dialog[aria-label='cargando'] md-progress-circular";
	let checkContentLoaded = () => {
		return PalitoHelperUtils.waitForElementToShow(loadingSelector).then(() => {
			// It actually disappears, but just in case.
			return PalitoHelperUtils.waitForElementToHide(loadingSelector);
		}).then(() => {
			onContentLoadCallback();
			return checkContentLoaded();
		});
	};
	checkContentLoaded();


	let lastHandler = null;
	window.addEventListener("hashchange", function(e) {
		if (lastHandler) lastHandler.destroy();
		contentLoadObserver(() => {});

		let hash = location.hash.replace(/^#/, '');
		let handler = PAGE_HANDLERS[hash];
		if (handler) {
			lastHandler = handler(contentLoadObserver);
		} else {
			console.warn(`No handler found for ${hash}`);
		}
	}, false);

})();