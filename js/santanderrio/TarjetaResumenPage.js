var TarjetaResumenPage = function(store) {

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
	}

	function getComprobanteFromTr($tr) {
		// En resumen online agarramos el comprobante del detalle ya que la columna Comprobante puede decir cualquier cosa..
		var regex = /^.*\ (\d{6})[*U]$/;
		let detail = $tr.find("td:eq(1)").text().trim();

		var match = regex.exec(detail);
		if (!match) return "";
		return match[1];
	}

	function getDetailForComprobante(comprobante) {
		if (comprobante.length < 6) return "";
		let results = Object.keys(detailsByComprobante).filter(key => key.endsWith(comprobante));
		if (results.length === 0) {
			return "";
		} else if (results.length === 1) {
			return detailsByComprobante[results[0]];
		} else {
			throw "Found more than 1 matching key: " + results;
		}
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
			};
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
		});
	})();
	

	// Public
	return {};
};
