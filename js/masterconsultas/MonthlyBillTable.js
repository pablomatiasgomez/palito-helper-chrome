"use strict";
let MonthlyBillTable = function ($container) {

	const SHARE_REGEX = /^\d+\/\d+$/;

	const DETAILS_BY_DATE_STORE_KEY = "masterconsultas.detailsByDate";
	// Will be initialized when reading from sync
	let detailsByDate = {};

	let $headerTable;
	let $table;
	let $pageSizeSelector;

	function setItems() {
		$headerTable = $container.find("table.ui-jqgrid-htable");
		if ($headerTable.length !== 1) throw "headerTable not found, or more than one found! weird..";

		$table = $container.find("table#gridtable");
		if ($table.length !== 1) throw "table not found, or more than one found! weird..";

		$pageSizeSelector = $container.find("select.ui-pg-selbox");
		if ($pageSizeSelector.length !== 1) throw "pageSizeSelector not found, or more than one found! weird..";
	}

	function setPageSizeToMax() {
		let lastValue = $pageSizeSelector.find("option:last").val();
		$pageSizeSelector.val(lastValue);
		triggerEvent($pageSizeSelector, "change");
		return PalitoHelperUtils.waitForElementToHide("#tablaMonthlyBill1 .loading.ui-state-default.ui-state-active");
	}

	function addDebtAmountColumn() {
		// Just having a validation if the page changes something...
		if ($table.find("tr.jqgfirstrow td:eq(0)").css("width") !== "133px") {
			throw "The dates width changed.. Stopping.!";
		}

		function getHeaderHtml(id, width, text) {
			return `<th id="gridtable_${id}" role="columnheader" class="ui-state-default ui-th-column ui-th-ltr" style="width: ${width};"><div id="jqgh_gridtable_${id}" class="ui-jqgrid-sortable">${text}</div></th>`;
		}

		$headerTable.find("th#gridtable_dateOperation").css("width", "60px").find(">div").text("F. Operacion");			// Changing from 133px to 60px = 73px gain
		$headerTable.find("th#gridtable_datePresentation").css("width", "60px").find(">div").text("F. Presentacion");	// Changing from 133px to 60px = 73px gain
		$headerTable.find("th#gridtable_detailOperation").css("width", "200px")                                         // Changing from 355px to 200px = 155px gain
			.after(getHeaderHtml("moreDetail", "180px", "Detalle"));
		$headerTable.find("th#gridtable_share").css("width", "40px").find(">div").text("Cuotas");						// Changing from 111px to 40px = 71px gain
		$headerTable.find("th#gridtable_totalInPesos")
			.after(getHeaderHtml("realTotalInPesos", "70px", "Total $"));
		$headerTable.find("th#gridtable_totalInPesos")
			.after(getHeaderHtml("totalInPesosLeft", "60px", "Restante $"));
		$headerTable.find("th#gridtable_totalInDollars").css("width", "55px"); // This is just bugged in the original page..

		$table.find("tr.jqgfirstrow td:eq(0)").css("width", "60px");													// Changing from 133px to 60px = 73px gain
		$table.find("tr.jqgfirstrow td:eq(1)").css("width", "60px");													// Changing from 133px to 60px = 73px gain
		$table.find("tr.jqgfirstrow td:eq(2)").css("width", "200px")                                                    // Changing from 355px to 200px = 155px gain
			.after('<td role="gridcell" style="height:0;width:180px;"></td>');
		$table.find("tr.jqgfirstrow td:eq(4)").css("width", "40px");													// Changing from 111px to 40px = 71px gain
		$table.find("tr.jqgfirstrow td:eq(5)")
			.after('<td role="gridcell" style="height:0;width:70px;"></td>');
		$table.find("tr.jqgfirstrow td:eq(5)")
			.after('<td role="gridcell" style="height:0;width:60px;"></td>');
		$table.find("tr.jqgfirstrow td:eq(8)").css("width", "55px"); // This is just bugged in the original page..

		let total = 0;
		let totalLeft = 0;
		let totalSet = false;
		$table.find("tr").each(function () {
			let date = getDateFromTr($(this));
			let share = $(this).find("td[aria-describedby=gridtable_share]").text().trim();
			let amountPerShare = parseValueToFloat($(this).find("td[aria-describedby=gridtable_totalInPesos]").text().trim());
			let description = $(this).find("td[aria-describedby=gridtable_detailOperation]").text().trim();

			let amountStr = "";
			let amountLeftStr = "";
			if (SHARE_REGEX.test(share) && description !== "SU PAGO") {
				let shares;
				let sharesLeft;
				if (share.trim() === "0/0") {
					shares = 1;
					sharesLeft = 1;
				} else {
					shares = parseInt(share.split("/")[1]);
					sharesLeft = shares - (share.split("/")[0] - 1); // Minus 1 because I want to count the one that I haven't paid yet.
				}
				let amount = shares * amountPerShare;
				let amountLeft = sharesLeft * amountPerShare;

				total += amount;
				totalLeft += amountLeft;
				amountStr = parseValueToString(amount);
				amountLeftStr = parseValueToString(amountLeft);
			} else if ($(this).hasClass("gridTotal") && description.indexOf("Total de Consumos") !== -1 && totalSet === false) {
				totalSet = true;
				amountStr = parseValueToString(total);
				amountLeftStr = parseValueToString(totalLeft);
			}

			let moreDetail = getDetailForDate(date);
			$(this).find("td[aria-describedby=gridtable_detailOperation]").after('<td role="gridcell" style="text-align:left;" title="' + moreDetail + '" class="more-detail">' + moreDetail + '</td>');
			$(this).find("td[aria-describedby=gridtable_totalInPesos]").after('<td role="gridcell" style="text-align:center;" title="' + amountStr + '">' + amountStr + '</td>');
			$(this).find("td[aria-describedby=gridtable_totalInPesos]").after('<td role="gridcell" style="text-align:center;" title="' + amountLeftStr + '">' + amountLeftStr + '</td>');
		});

		$table.on("click", ".more-detail", function () {
			let self = $(this);
			if (self.find("input").length) return; // Input was already created.

			let prevText = self.text();
			let input = $(`<input type="text" style="width: 97%; font-family: inherit;" value="${self.text()}">`);
			input.on("keyup", function (e) {
				if (e.key === "Enter") {
					let newDetail = $(this).val();
					let date = getDateFromTr($(this).closest("tr"));
					saveDetailForDate(date, newDetail);
					self.text(newDetail);
				} else if (e.key === "Escape") {
					self.text(prevText);
				}
			});
			self.html(input);
			input.focus();
		});
	}

	function getDateFromTr($tr) {
		return $tr.find("td[aria-describedby=gridtable_dateOperation]").text().trim();
	}

	function readDetailsByDateFromStore() {
		return new Promise((resolve, reject) => {
			chrome.storage.sync.get(DETAILS_BY_DATE_STORE_KEY, function (result) {
				if (chrome.runtime.lastError) return reject(chrome.runtime.lastError);
				detailsByDate = result[DETAILS_BY_DATE_STORE_KEY] || {};
				resolve(detailsByDate);
			});
		});
	}

	function saveDetailsByDateToStore() {
		chrome.storage.sync.set({[DETAILS_BY_DATE_STORE_KEY]: detailsByDate});
	}

	function getDetailForDate(date) {
		let detail = detailsByDate[date];
		return detail || '';
	}

	function saveDetailForDate(date, detail) {
		detailsByDate[date] = detail;
		saveDetailsByDateToStore();
	}

	function triggerEvent($obj, eventName) {
		$obj[0].dispatchEvent(new Event(eventName));
	}

	function parseValueToFloat(str) {
		if (!str) return 0;
		return parseFloat(str.replace(" ", "").replace(".", "").replace(",", ".").trim());
		// return parseFloat(str.replace(" ", "").replace(",", "").trim());
	}

	function parseValueToString(value) {
		let parts = value.toString().split(".");

		let integerPart = parts[0].split("").reverse().join("").match(/.{1,3}/g).join(".").split("").reverse().join("");
		return integerPart + (parts[1] ? ("," + parts[1].substr(0, 2)) : ",00");
	}

	// Init
	(function () {
		Promise.all([
			PalitoHelperUtils.waitForElementToLoad("#tablaMonthlyBill1")
				.then(() => PalitoHelperUtils.waitForElementToHide("#loadingIndicator")),
			readDetailsByDateFromStore()
		]).then(() => {
			setItems();
			return setPageSizeToMax();
		}).then(() => {
			addDebtAmountColumn();
		});
	})();

	// Public
	return {};
};
