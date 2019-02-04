var ResumenInversionesPage = function() {

	var pesosSum = 0;
	var dollarsSum = 0;

	var $allTables = $();
	var $plazosFijosTable = $();
	var $fondosPesosTable = $();
	var $fondosDollarsTable = $();
	var $bonosTable = $();
	var $accionesTable = $();

	var infoTrStr = "<tr class='tilesTRInfo'><td class='sub' colspan='{{colspan}}'><strong>{{infoText}}</strong></td><td align='right'><strong><table width='20' border='0' style='table-layout:auto; background-color:transparent; width:20px !important;'><tbody><tr><td align='left' style='border-width:0px; padding: 1px 2px 1px 1px; background-color:transparent;' nowrap=''>$</td><td align='right' style='border-width:0px; padding: 1px; background-color:transparent;' nowrap=''>{{totalPesos}}</td></tr></tbody></table></strong></td><td align='right'><strong><table width='20' border='0' style='table-layout:auto; background-color:transparent; width:20px !important;'><tbody><tr><td align='left' style='border-width:0px; padding: 1px 2px 1px 1px; background-color:transparent;' nowrap=''>U$S</td><td align='right' style='border-width:0px; padding: 1px; background-color:transparent;' nowrap=''>{{totalDollars}}</td></tr></tbody></table></strong></td><td>&nbsp;</td></tr>";

	var setTables = function() {
		$("table.header").each(function() {
			var title = $(this).find("> tbody > tr > td").text();
			var $table = $(this).nextAll("table:first");
			$allTables = $allTables.add($table);

			if (title == "PLAZOS FIJOS") {
				$plazosFijosTable = $table;
			} else if (title == "FONDOS OPERATIVOS EN PESOS") {
				$fondosPesosTable = $table;
			} else if (title == "FONDOS OPERATIVOS EN DÓLARES") {
				$fondosDollarsTable = $table;
			} else if (title == "BONOS") {
				$bonosTable = $table;
			} else if (title == "ACCIONES") {
				$accionesTable = $table;
			}
		});
	};

	var changeTableLinkTexts = function() {
		var replaceTexts = {
			"Más información": "Info",
			"Ver Comprobante": "Comp.",
			"Modificar acción al vto.": "Acción vto.",
			"Últimos movimientos": "Ult. movimientos"
		};

		$allTables.find(".resumen a").each(function() {
			var replaceText = replaceTexts[$(this).text()];
			if (replaceText) {
				$(this).attr("title", $(this).text());
				$(this).text(replaceText);
			}
		});

		$plazosFijosTable.find("td:last-child").each(function() {
			$(this).html($("<div class='formlink'>").html($(this).html()));
		});
	};

	var addDescriptionColumnToBonosTable = function() {
		var $bonoColumnHeader = $bonosTable.find("> tbody > tr.title > th:nth-child(2)");
		$bonoColumnHeader.after($bonoColumnHeader.clone().text("Descripcion"));

		$bonosTable.find("> tbody > tr:not(.title)").each(function() {
			var $link = $(this).find("div.formlink a:first");
			var description = $link.length ? $link.attr("href").split("\"")[3] : "";
			var $bonoColumn = $(this).find("> td:nth-child(2)");
			$bonoColumn.after($bonoColumn.clone().css("white-space", "nowrap").attr("align", "center").text(description));
		});

		$bonosTable.find("> tbody > tr:last td:first").attr("colspan", "5");
	};

	var getTotals = function() {
		// PF
		pesosSum += parseValueToFloat($plazosFijosTable.find("> tbody > tr:last > td:eq(1) td[align=right]").text());
		dollarsSum += parseValueToFloat($plazosFijosTable.find("> tbody > tr:last > td:eq(2) td[align=right]").text());

		// Fondos
		var fondosPesosSum = 0;
		$fondosPesosTable.find("tr.fondos > td:nth-child(5)").each(function() {
			fondosPesosSum += parseValueToFloat($(this).text().replace("$", ""));
		});
		$fondosPesosTable.find("> tbody").append(infoTrStr.replace("{{infoText}}", "TOTAL").replace("{{colspan}}", "4").replace("{{totalPesos}}", parseValueToString(fondosPesosSum)).replace("{{totalDollars}}", "0"));
		pesosSum += fondosPesosSum;

		var fondosDollarsSum = 0;
		$fondosDollarsTable.find("tr.fondos > td:nth-child(6)").each(function() {
			fondosDollarsSum += parseValueToFloat($(this).text().replace("U$S", ""));
		});
		$fondosDollarsTable.find("> tbody").append(infoTrStr.replace("{{infoText}}", "TOTAL").replace("{{colspan}}", "4").replace("{{totalPesos}}", "0").replace("{{totalDollars}}", parseValueToString(fondosDollarsSum)));
		dollarsSum += fondosDollarsSum;

		// Bonos
		pesosSum += parseValueToFloat($bonosTable.find("> tbody > tr:last > th:eq(0) td[align=right]").text());

		// Acciones
		pesosSum += parseValueToFloat($accionesTable.find("> tbody > tr:last > th:eq(0) td[align=right]").text());

		return {
			pesos: pesosSum,
			dollars: dollarsSum
		};
	};

	var getVencimientos = function() {
		var vencimientos = {};
		var addValue = function(dateStr, value) {
			if (vencimientos[dateStr]) {
				vencimientos[dateStr] += value;
			} else {
				vencimientos[dateStr] = value;
			}
		};
		var getDateSubstring = function(str) {
			var match = str.match(/\d{2}\/\d{2}\/\d{4}/);
			if (match && match.length > 0) return match[0];
		};

		$plazosFijosTable.find("> tbody > tr:not(.title)").each(function() {
			var dateStr = getDateSubstring($(this).find("> td:eq(1)").text());
			if (!dateStr) return;
			var value = parseValueToFloat($(this).find("> td:eq(6) td[align=right]").text());
			addValue(dateStr, value);
		});
	
		$bonosTable.find("> tbody > tr:not(.title)").each(function() {
			var dateStr = getDateSubstring($(this).find("> td:eq(2)").text());
			if (!dateStr) return;
			var value = parseValueToFloat($(this).find("> td:eq(5) td[align=right]").text());
			addValue(dateStr, value);
		});

		return vencimientos;
	};

	var appendInfoTable = function(totals, vencimientos) {
		var $infoTable = $("<table style='margin: 50px 100px;'><tbody></tbody></table>");
		$allTables.last().after($infoTable);

		var getDateFromStr = function(str) {
			var split = str.trim().split("/");
			return new Date(split[2], split[1] - 1, split[0]);
		};

		var acum = 0;
		Object.keys(vencimientos).sort(function(a, b) { 
			return getDateFromStr(a).getTime() - getDateFromStr(b).getTime();
		}).map(function(dateStr) {
			acum += vencimientos[dateStr];
			return infoTrStr.replace("{{infoText}}", dateStr).replace("{{colspan}}", "1").replace("{{totalPesos}}", parseValueToString(vencimientos[dateStr])).replace("{{totalDollars}}", parseValueToString(acum));
		}).forEach(function(tr) {
			$infoTable.find("> tbody").append(tr);
		});

		var totalTr = infoTrStr.replace("{{infoText}}", "TOTAL").replace("{{colspan}}", "1").replace("{{totalPesos}}", parseValueToString(totals.pesos)).replace("{{totalDollars}}", parseValueToString(totals.dollars));
		$infoTable.find("> tbody").append(totalTr);
	};

	function parseValueToFloat(str) {
		if (!str) return 0;
		return parseFloat(str.replace(".", "").replace(",", "."));
	}

	function parseValueToString(value) {
		var parts = value.toString().split(".");

		var integerPart = parts[0].split("").reverse().join("").match(/.{1,3}/g).join(".").split("").reverse().join("");
		return integerPart + (parts[1] ? ("," + parts[1].substr(0, 2)) : ",00");
	}

	// Init
	(function() {
		setTables();

		changeTableLinkTexts();
		addDescriptionColumnToBonosTable();
		var totals = getTotals();
		var vencimientos = getVencimientos();
		appendInfoTable(totals, vencimientos);
	})();
	

	// Public
	return {};
};
