"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};
if (!palito.santander.pages) palito.santander.pages = {};


palito.santander.pages.plazosFijos = function (contentLoadObserver) {
	let loadTenencia = () => PalitoHelperUtils.waitForElementToLoad("table.tenencia").then(() => {
		// Expando todos los PF por default.
		$("table.tenencia .skip.ng-scope td").click();

		// Muevo el grafico al fondo
		$(".tabla-contenedor")
			.after($("obp-container"))
			.after("<br>");
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
		destroy: () => {
		}
	};
};


palito.santander.pages.fondosDeInversion = function (contentLoadObserver) {
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
		$(".tabla-contenedor")
			.after($("obp-container"))
			.after("<br>");
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
		destroy: () => {
		}
	};
};


palito.santander.pages.titulosValores = function (contentLoadObserver) {
	let loadTenencia = () => PalitoHelperUtils.waitForElementToLoad("table.tenencia").then(() => {
		// If any radio is disabled, then there is nothing to do.
		if (!$('[data-ng-model="cuenta.monedaSel"] md-radio-button[disabled=disabled]').length) {
			// TODO when this happens, the angular scope of the old elements is lost.
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
		$(".tabla-contenedor")
			.after($("obp-container"))
			.after("<br>");

		// Agrego ciertos datos particulares
		let trsSelector = "table.tenencia tbody > tr.ng-scope";
		palito.santander.utils.getScopeFromElements(trsSelector, "item").then(trScopes => {
			let $trs = $(trsSelector);
			for (let i = 0; i < trScopes.length; i++) {
				let trScope = trScopes[i];
				if (!trScope) continue; // This because if multiple currencies, some rows miss their scope.
				let $tr = $trs.eq(i);

				// Add popup with scope detail:
				$tr.attr("title", palito.santander.utils.scopeToText(trScope));

				// Fix cotiacion with all decimals
				let $cotizacionSpan = $tr.find("td:eq(3) span");
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
		destroy: () => {
		}
	};
};




