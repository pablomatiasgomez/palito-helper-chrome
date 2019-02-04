(function() {

	function handleMasterConsultas() {
		var BASE_PAGE = "/socios/context/index.action";

		if (location.pathname !== BASE_PAGE) return;

		if ($("#tablaMonthlyBill1").length) {
			return MonthlyBillTable($("#tablaMonthlyBill1"));
		}
	}

	function handleMercadoPago() {
		if (location.pathname === "/activities/balance") {
			return ActivitiesBalancePage();
		}
	}

	function handleSantanderRio() {
		if (location.pathname === "/hb/html/inversiones/invRes.jsp") {
			return ResumenInversionesPage();
		}
	}

	let SITES_MAP = {
		"www1.masterconsultas.com.ar": handleMasterConsultas,
		"www.mercadopago.com.ar": handleMercadoPago,
		"www.personas.santanderrio.com.ar": handleSantanderRio
	}

debugger;
	let handler = SITES_MAP[location.hostname];
	if (handler) {
		return handler();
	}
})();
