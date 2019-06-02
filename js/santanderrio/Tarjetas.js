"use strict";
if (!window.palito) var palito = window.palito = {};
if (!palito.santanderrio) palito.santanderrio = {};
if (!palito.santanderrio.pages) palito.santanderrio.pages = {};

palito.santanderrio.pages.tarjetas = function(contentLoadObserver) {

	const ENTER_KEY_CODE = 13;
	const ESCAPE_KEY_CODE = 27;

	// Will be initialized when reading from store
	var detailsByKey = { };

	function addTableColumns(isResumen) {
		palito.santanderrio.utils.getScopeFromElements(".tabla-contenedor table tr", "linea").then(trScopes => {
			let $tables = $(".tabla-contenedor table");
			let rows = $tables.find("tr").toArray();

			if (rows.length !== trScopes.length) throw `Found different amount of rows. ${rows.length} !== ${trScopes.length}`;
			
			for (let i = 0; i < rows.length; i++) {
				let $tr = $(rows[i]);
				let trScope = trScopes[i];
				$tr.attr("title", palito.santanderrio.utils.scopeToText(trScope));

				if ($tr.find(`th`).length) {
					// Sometimes the table is reused and therefore we do not need to re add the th
					if ($tr.find(`th`).length == 4) {
						$tr.find("th:eq(1)").after(`<th scope="col" class="util-pdl">Descripción Extra</th>`);
					}
				} else {
					$tr.find("td:eq(1)").after(`<td class="extra-detail">${getDetailForKey(getKeyFromTr($tr, trScope))}</td>`);
				}
			}

			if (!isResumen) {
				bindExtraDetailClick($tables);
			}
		});
	}

	function bindExtraDetailClick($tables) {
		$tables.find("tr .extra-detail").on("click", function(e) {
			e.stopPropagation();
			let self = $(this);
			if (self.find("input").length) return; // Input was already created.

			let prevText = self.text();
			let input = $(`<input type="text" class="extra-detail-edit" value="${self.text()}">`);
			input.on("keypress", function(e) {
				e.stopPropagation();
				if (e.keyCode == ENTER_KEY_CODE) {
					let newDetail = $(this).val();
					saveDetailForKey(getKeyFromTr($(this).closest("tr")), newDetail);
					self.text(newDetail);
				} else if (e.keyCode == ESCAPE_KEY_CODE) {
					self.text(prevText);
				}
			});
			self.html(input);
			input.focus();
		});
	}

	function getKeyFromTr($tr, scope) {
		if (!scope) {
			return $tr.attr("detail-key");
		}
		let key = scope.comprobante.trim();
		if (key == "000000") {
			// En resumen online los debitos automaticos no tienen el comprobante en el campo pero si esta en el tr.
			var regex = /^.*\ (\d{6})[*U]$/;
			let detail = $tr.find("td:eq(1)").text().trim();

			var match = regex.exec(detail);
			key = match ? match[1] : "";
		}

		$tr.attr("detail-key", key);
		return key;
	}

	function getDetailForKey(key) {
		if (key.length < 6) return "";
		let results = Object.keys(detailsByKey).filter(k => k.endsWith(key));
		if (results.length === 0) {
			return "";
		} else if (results.length === 1) {
			return detailsByKey[results[0]];
		} else {
			throw "Found more than 1 matching key: " + results;
		}
	}

	function saveDetailForKey(key, detail) {
		detailsByKey[key] = detail;
		palito.santanderrio.store.saveDetailsByKeyToStore(detailsByKey);
	}

	function loadUltimosConsumos() {
		console.warn("Handling ultimos consumos");
		return PalitoHelperUtils.waitForElementToLoad(".tabla-contenedor table").then(() => addTableColumns(false));
	}

	function loadUltimoResumen() {
		console.warn("Handling ultimo resumen");
		return PalitoHelperUtils.waitForElementToLoad(".tabla-contenedor table").then(() => addTableColumns(true));
	}


	contentLoadObserver(() => {
		let selectedTab = $("nav[role='navigation'] button.md-active").text().trim();
		if (selectedTab === "Últimos consumos") {
			loadUltimosConsumos();
		} else if (selectedTab === "Último resumen") {
			loadUltimoResumen();
		} else {
			console.warn("Subtab not handled: " + selectedTab);
		}
	});

	// If the "Ultimos consumos" button is clicked, no loading appears, but we still need to process it.
	PalitoHelperUtils.waitForElementToLoad("nav[role='navigation'] button", 2).then(() => {
		$("nav[role='navigation'] button:eq(0)").on("click", loadUltimosConsumos);
	});

	palito.santanderrio.store.readDetailsByKeyFromStore().then(result => detailsByKey = result);

	return {
		destroy: () => {}
	};
};
