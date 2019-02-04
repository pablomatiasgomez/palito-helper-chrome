var ActivitiesBalancePage = function() {

	function addInvestOperationsIframe() {
		setTimeout(function (){ 
			let url = "https://www.mercadopago.com.ar/asset-management/operations";
			$(`<iframe src="${url}" frameborder="0" style="width: 100%; height: 800px;">`).appendTo(".c-balance-view .c-balance-view__col:last");
		}, 1000);
	}

	// Init
	(function() {
		addInvestOperationsIframe();
	})();

	// Public
	return {};
};
