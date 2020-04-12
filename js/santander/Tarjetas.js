"use strict";
if (!window.palito) window.palito = {};
if (!palito.santander) palito.santander = {};
if (!palito.santander.pages) palito.santander.pages = {};

palito.santander.pages.tarjetas = function (contentLoadObserver) {

	// Will be initialized when reading from store
	let detailsByKey = {};

	function addTableColumns(isResumen) {
		palito.santander.utils.getScopeFromElements(".tabla-contenedor table tr", "linea").then(trScopes => {
			let $tables = $(".tabla-contenedor table");
			let rows = $tables.find("tr").toArray();

			if (rows.length !== trScopes.length) throw `Found different amount of rows. ${rows.length} !== ${trScopes.length}`;

			for (let i = 0; i < rows.length; i++) {
				let $tr = $(rows[i]);
				let trScope = trScopes[i];
				$tr.attr("title", palito.santander.utils.scopeToText(trScope));

				if ($tr.find(`th`).length) {
					// Sometimes the table is reused and therefore we do not need to re add the th
					if ($tr.find(`th`).length === 4) {
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
		$tables.find("tr .extra-detail").on("click", function (e) {
			e.stopPropagation();
			let self = $(this);
			if (self.find("input").length) return; // Input was already created.

			let prevText = self.text();
			let input = $(`<input type="text" class="extra-detail-edit" value="${self.text()}">`);
			input.on("keyup", function (e) {
				if (e.key === "Enter") {
					let newDetail = $(this).val();
					saveDetailForKey(getKeyFromTr($(this).closest("tr")), newDetail);
					self.text(newDetail);
				} else if (e.key === "Escape") {
					self.text(prevText);
				}
			});
			input.on("keypress", function (e) {
				// Avoid opening the detail.
				e.stopPropagation();
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
		if (key === "000000") {
			// En resumen online los debitos automaticos no tienen el comprobante en el campo pero si esta en el tr.
			let detail = $tr.find("td:eq(1)").text().trim();
			let match = /^.* (\d{6})[*U]$/.exec(detail);
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
			console.error(`Found more than 1 matching key. Keys: ${results}, values ${results.map(k => detailsByKey[k])}`);
			return results.map(k => detailsByKey[k]).join(" | ");
		}
	}

	function saveDetailForKey(key, detail) {
		detailsByKey[key] = detail;
		palito.santander.store.saveDetailsByKeyToStore(detailsByKey);
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
		// Something happens in Tarjetas that changes 1 second after it loades..
		setTimeout(() => {
			let selectedTab = $("nav[role='navigation'] button.md-active").text().trim();
			if (selectedTab === "Últimos consumos") {
				loadUltimosConsumos();
			} else if (selectedTab === "Último resumen") {
				loadUltimoResumen();
			} else {
				console.warn("Subtab not handled: " + selectedTab);
			}
		}, 1500);
	});

	// If the "Ultimos consumos" button is clicked, no loading appears, but we still need to process it.
	PalitoHelperUtils.waitForElementToLoad("nav[role='navigation'] button", 2).then(() => {
		$("nav[role='navigation'] button:eq(0)").on("click", loadUltimosConsumos);
	});

	palito.santander.store.readDetailsByKeyFromStore().then(result => detailsByKey = result);

	return {
		destroy: () => {
		}
	};
};
