var TarjetaResumenPage = function(store) {

	const ENTER_KEY_CODE = 13;
	const ESCAPE_KEY_CODE = 27;

	const IS_DATE_REGEX = /^\d{2}\/\d{2}\/\d{2}$/;

	// Will be initialized when reading from store
	var detailsByComprobante = { };

	function addTableColumns() {
		let $table = $("#UltResumentrj table.infoTable.lim").nextAll("table.infoTable:first");

		$table.find("tr.tilesTRInfo").toArray().forEach(tr => {
			let $tr = $(tr);
			if ($tr.find(`td[valign="middle"]`).length) {
				$tr.find("td:eq(1)").after(`<td align="center" width="48%" valign="middle"><b>Descripción Extra</b></td>`);
			}
			$tr.find(`td[colspan="5"]`).attr("colspan", 6);
			$tr.find(`th[colspan="5"]`).attr("colspan", 6);
			$tr.find(`td.tot[colspan="2"]`).attr("colspan", 3);

			let isConsumo = IS_DATE_REGEX.test($tr.find("td:first").text());
			if (isConsumo) {
				let $extraDetail = $(`<td class="extra-detail" style="text-align:left"></td>`);
				$tr.find("td:eq(1)").after($extraDetail);
				$extraDetail.text(getDetailForComprobante(getComprobanteFromTr($tr)));
			}
		});

		$table.on("click", ".extra-detail", function() {
			let self = $(this);
			if (self.find("input").length) return; // Input was already created.

			let prevText = self.text();
			let input = $(`<input type="text" style="width: 97%; font-family: inherit;" value="${self.text()}">`);
			input.on("keyup", function(e) {
				if (e.keyCode == ENTER_KEY_CODE) {
					let newDetail = $(this).val();
					let comprobante = getComprobanteFromTr($(this).closest("tr"));
					saveDetailForComprobante(comprobante, newDetail);
					self.text(newDetail);
				} else if (e.keyCode == ESCAPE_KEY_CODE) {
					self.text(prevText);
				}
			});
			self.html(input);
			input.focus();
		});
	}

	function getComprobanteFromTr($tr) {
		let comprobante = $tr.find("td:eq(3)").text().trim();
		// TODO check if this is accurate:
		if (comprobante.indexOf("*") !== -1) {
			comprobante = "0" + comprobante.slice(0, -1); 
		}
		return comprobante;
	}

	function getDetailForComprobante(comprobante) {
		return detailsByComprobante[comprobante] || "";
	}

	function saveDetailForComprobante(comprobante, detail) {
		detailsByComprobante[comprobante] = detail;
		store.saveDetailsByComprobanteToStore();
	}

	function readDetailsByComprobanteFromStore() {
		return store.readDetailsByComprobanteFromStore().then(result => detailsByComprobante = result);
	}

	function waitForElementToHide(selector) {
		return new Promise((resolve, reject) => {
			let check = () => {
				if (!$(selector).is(":visible")) {
					resolve();
				} else {
					setTimeout(check, 200);
				}
			}
			check();
		});
	}

	// Init
	(function() {
		Promise.all([
			waitForElementToHide("#template_wait_div"),
			readDetailsByComprobanteFromStore()
		]).then(() => {
			addTableColumns();
		})
	})();
	

	// Public
	return {};
};
