"use strict";
(function() {
	let BASE_PAGE = "/socios/context/index.action";

	if (location.pathname !== BASE_PAGE) return;

	if ($("#tablaMonthlyBill1").length) {
		return MonthlyBillTable($("#tablaMonthlyBill1"));
	}
})();
