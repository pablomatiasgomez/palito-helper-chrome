"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.pages) palito.santanderrio.pages = {};

palito.santanderrio.pages.cuentas = function(contentLoadObserver) {

	function addColumnsDetail() {
		let trsSelector = "cuentas-inicio-movimientos div.grillas table tbody > tr.ng-scope";
		palito.santanderrio.utils.getScopeFromElements(trsSelector, "m").then(trScopes => {
			var promises = [];
			for (let i = 0; i < trScopes.length; i++) {
				let trScope = trScopes[i];
				let $tr = $(`${trsSelector}:nth-child(${i + 1})`);

				// Add popup with scope detail:
				$tr.attr("title", palito.santanderrio.utils.scopeToText(trScope));

				let newDate = trScope.fechaDetalle + " " + trScope.hora;
				promises.push(palito.santanderrio.utils.updateScopeToElement(`${trsSelector}:nth-child(${i + 1})`, "m", "fecha", newDate));
			}
			return Promise.all(promises);
		});
	}

	contentLoadObserver(() => {
		addColumnsDetail();
	});

	return {
		destroy: () => {}
	};
};
