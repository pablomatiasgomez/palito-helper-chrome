"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};

(function () {

	const PAGE_HANDLERS = {
		"!/cuentas-inicio": palito.santander.pages.cuentas,
		"!/plazo-fijo": palito.santander.pages.plazosFijos,
		"!/fondos-de-inversion": palito.santander.pages.fondosDeInversion,
		"!/titulos-valores": palito.santander.pages.titulosValores,
		"!/tarjetas": palito.santander.pages.tarjetas,
	};


	// TODO move this to the returned object of the handlers.
	let onContentLoadCallback = () => {
	};
	let contentLoadObserver = callback => onContentLoadCallback = callback;
	const loadingSelector = "md-dialog[aria-label='cargando'] md-progress-circular";
	let checkContentLoaded = () => {
		return PalitoHelperUtils.waitForElementToShow(loadingSelector).then(() => {
			console.warn("Loading element shown");
			// It actually disappears, but just in case.
			return PalitoHelperUtils.waitForElementToHide(loadingSelector);
		}).then(() => {
			console.warn("Loading element disspeared");
			onContentLoadCallback();
			return checkContentLoaded();
		});
	};
	checkContentLoaded();


	let lastHandler = null;
	window.addEventListener("hashchange", function () {
		if (lastHandler) lastHandler.destroy();
		contentLoadObserver(() => {
		});

		let hash = location.hash.replace(/^#/, '');
		let handler = PAGE_HANDLERS[hash];
		if (handler) {
			lastHandler = handler(contentLoadObserver);
		} else {
			console.warn(`No handler found for ${hash}`);
		}
	}, false);

})();
