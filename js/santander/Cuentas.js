"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};
if (!palito.santander.pages) palito.santander.pages = {};

palito.santander.pages.cuentas = function (contentLoadObserver) {

	function addColumnsDetail() {
		let trsSelector = "cuentas-inicio-movimientos div.grillas table tbody > tr.ng-scope";
		palito.santander.utils.getScopeFromElements(trsSelector, "m").then(trScopes => {
			let promises = [];
			for (let i = 0; i < trScopes.length; i++) {
				let trScope = trScopes[i];
				let $tr = $(`${trsSelector}:nth-child(${i + 1})`);

				// Add popup with scope detail:
				$tr.attr("title", palito.santander.utils.scopeToText(trScope));

				// noinspection JSUnresolvedVariable
				let newDate = trScope.fechaDetalle + " " + trScope.hora;
				promises.push(palito.santander.utils.updateScopeToElement(`${trsSelector}:nth-child(${i + 1})`, "m", "fecha", newDate));
			}
			return Promise.all(promises);
		});
	}

	contentLoadObserver(() => {
		addColumnsDetail();
	});

	return {
		destroy: () => {
		}
	};
};
