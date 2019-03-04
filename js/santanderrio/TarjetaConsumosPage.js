var TarjetaConsumosPage = function(store) {

	const ENTER_KEY_CODE = 13;
	const ESCAPE_KEY_CODE = 27;

	const IS_DATE_REGEX = /^\d{2}\/\d{2}\/\d{4}$/;

	// Will be initialized when reading from store
	var detailsByComprobante = { };

	function addTableColumns() {
		let $table = $("#contenedorMovimientos table.infoTable");

		$table.find("tr.tilesTRInfo").toArray().forEach(tr => {
			let $tr = $(tr);
			if ($tr.find(`th[align="center"]`).length) {
				$tr.find("th:eq(1)").after(`<th style="text-align: left; border-top: 1px solid #c8c8c8;">Descripción Extra</th>`);
			}
			$tr.find(`td[colspan="6"]`).attr("colspan", 7);
			$tr.find(`th[colspan="6"]`).attr("colspan", 7);
			$tr.find(`td[align="left"][colspan="3"]`).attr("colspan", 4);
			$tr.find(`th[align="left"][colspan="3"]`).attr("colspan", 4);

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
		return $tr.find("td:eq(4)").text().trim();
	}

	function getDetailForComprobante(comprobante) {
		return detailsByComprobante[comprobante] || "";
	}

	function saveDetailForComprobante(comprobante, detail) {
		if (comprobante.length !== 7) throw "Illegal comprobante";
		detailsByComprobante[comprobante] = detail;
		store.saveDetailsByComprobanteToStore(detailsByComprobante);
	}

	function readDetailsByComprobanteFromStore() {
		return store.readDetailsByComprobanteFromStore().then(result => detailsByComprobante = result);
	}

	// Init
	(function() {
		Promise.all([
			PalitoHelperUtils.waitForElementToHide("#template_wait_div"),
			readDetailsByComprobanteFromStore()
		]).then(() => {
			addTableColumns();
		});
	})();
	

	// Public
	return {};
};
