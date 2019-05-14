"use strict";
// TODO rename file?
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.pages) palito.santanderrio.pages = {};


palito.santanderrio.pages.plazosFijos = function(contentLoadObserver) {
	let loadTenencia = () => PalitoHelperUtils.waitForElementToLoad("table.tenencia").then(() => {
		// Expando todos los PF por default.
		$("table.tenencia .skip.ng-scope td").click();

		// Muevo el grafico al fondo
		$(".tabla-contenedor").after($("obp-container"));
		$(".tabla-contenedor").after("<br>");
	});

	contentLoadObserver(() => {
		let selectedTab = $("nav[role='navigation'] button.md-active").text().trim();
		if (selectedTab === "Tenencia") {
			loadTenencia();
		} else {
			console.warn("Subtab not handled: " + selectedTab);
		}
	});

	return {
		destroy: () => {}
	};
};


palito.santanderrio.pages.fondosDeInversion = function(contentLoadObserver) {
	let loadTenencia = () => PalitoHelperUtils.waitForElementToLoad("table.tenencia").then(() => {
		// If any radio is disabled, then there is nothing to do.
		if (!$('[data-ng-model="cuenta.monedaSel"] md-radio-button[disabled=disabled]').length) {
			// Clono el de pesos y lo dejo arriba, luego cambio el de abajo a dolares.
			let fondosUSD = $("table.tenencia").parent();
			let fondosARS = fondosUSD.clone();
			fondosUSD.before(fondosARS);

			// Cambio el de abajo a dolares y oculto radios
			$('[aria-label="Fondos en dólares"]').click();
			$('[data-ng-model="cuenta.monedaSel"]').hide();

			// Headers para cada tabla.
			fondosARS.before("<h4>Fondos en pesos</h4>");
			fondosUSD.before("<br><h4>Fondos en dolares</h4>");
		}

		// Muevo el grafico al fondo
		$(".tabla-contenedor").after($("obp-container"));
		$(".tabla-contenedor").after("<br>");
	});

	contentLoadObserver(() => {
		let selectedTab = $("nav[role='navigation'] button.md-active").text().trim();
		if (selectedTab === "Tenencia") {
			loadTenencia();
		} else {
			console.warn("Subtab not handled: " + selectedTab);
		}
	});

	return {
		destroy: () => {}
	};
};


palito.santanderrio.pages.titulosValores = function(contentLoadObserver) {
	let loadTenencia = () => PalitoHelperUtils.waitForElementToLoad("table.tenencia").then(() => {
		// If any radio is disabled, then there is nothing to do.
		if (!$('[data-ng-model="cuenta.monedaSel"] md-radio-button[disabled=disabled]').length) {
			// Clono el de pesos y lo dejo arriba, luego cambio el de abajo a dolares.
			let titulosUSD = $("table.tenencia").parent();
			let titulosARS = titulosUSD.clone();
			titulosUSD.before(titulosARS);

			// Cambio el de abajo a dolares y oculto radios
			$('[aria-label="Emisión en otras monedas"]').click();
			$('[data-ng-model="cuenta.monedaSel"]').hide();

			// Headers para cada tabla.
			titulosARS.before("<h4>Emisión en pesos</h4>");
			titulosUSD.before("<h4>Emisión en otras monedas</h4>");
		}

		// Muevo el grafico al fondo
		$(".tabla-contenedor").after($("obp-container"));
		$(".tabla-contenedor").after("<br>");

		// Agrego ciertos datos particulares
		let trsSelector = "table.tenencia tbody > tr.ng-scope";
		palito.santanderrio.utils.getScopeFromElements(trsSelector, "item").then(trScopes => {
			for (let i = 0; i < trScopes.length; i++) {
				let trScope = trScopes[i];
				let $tr = $(`${trsSelector}:nth-child(${i + 1})`);

				// Add popup with scope detail:
				$tr.attr("title", palito.santanderrio.utils.scopeToText(trScope));

				// Fix cotiacion with all decimals
				let $cotizacionSpan = $tr.find("td:eq(3) span")
				$cotizacionSpan.text($cotizacionSpan.text().split(" ")[0] + " " + trScope.precioMercado);
			}
		});
	});

	contentLoadObserver(() => {
		let selectedTab = $("nav[role='navigation'] button.md-active").text().trim();
		if (selectedTab === "Tenencia") {
			loadTenencia();
		} else {
			console.warn("Subtab not handled: " + selectedTab);
		}
	});

	return {
		destroy: () => {}
	};
};




