"use strict";
let MapPage = function () {

	const HOST = "http://www.ssplan.buenosaires.gob.ar";
	const types = [
		{
			name: "Croquis Parcela",
			key: "croquis_parcela",
			body: (seccion, manzana, parcela) => {
				return `a=advsearch&type=and&asearchfield%5B%5D=SECCION&asearchopt_SECCION=Contains&value_SECCION=${seccion}&value1_SECCION=&asearchfield%5B%5D=MANZANA&asearchopt_MANZANA=Contains&value_MANZANA=${manzana}&value1_MANZANA=&asearchfield%5B%5D=PARCELA&asearchopt_PARCELA=Contains&value_PARCELA=${parcela}&value1_PARCELA=&asearchfield%5B%5D=NOMENCLATURA&asearchopt_NOMENCLATURA=Contains&value_NOMENCLATURA=&value1_NOMENCLATURA=&asearchfield%5B%5D=LINK_IMAGEN&asearchopt_LINK_IMAGEN=Contains&value_LINK_IMAGEN=&value1_LINK_IMAGEN=`;
			},
			idTdIndex: 3,
			linkTdIndexes: [ 4 ],
		},
		{
			name: "Perimetro Manzana",
			key: "peri_man",
			body: (seccion, manzana, parcela) => {
				return `a=advsearch&type=and&asearchfield%5B%5D=SECCION&asearchopt_SECCION=Contains&value_SECCION=${seccion}&value1_SECCION=&asearchfield%5B%5D=MANZANA&asearchopt_MANZANA=Contains&value_MANZANA=${manzana}&value1_MANZANA=&asearchfield%5B%5D=SECCION_MANZANA&asearchopt_SECCION_MANZANA=Contains&value_SECCION_MANZANA=&value1_SECCION_MANZANA=&asearchfield%5B%5D=LINK_IMAGEN&asearchopt_LINK_IMAGEN=Contains&value_LINK_IMAGEN=&value1_LINK_IMAGEN=`;
			},
			idTdIndex: 2,
			linkTdIndexes: [ 3 ],
		},
		{
			name: "Plano Manzana",
			key: "planos_indices",
			body: (seccion, manzana, parcela) => {
				return `a=advsearch&type=and&asearchfield%5B%5D=SECCION&asearchopt_SECCION=Contains&value_SECCION=${seccion}&value1_SECCION=&asearchfield%5B%5D=MANZANA&asearchopt_MANZANA=Contains&value_MANZANA=${manzana}&value1_MANZANA=&asearchfield%5B%5D=SECCION_MANZANA&asearchopt_SECCION_MANZANA=Contains&value_SECCION_MANZANA=&value1_SECCION_MANZANA=&asearchfield%5B%5D=LINK_IMAGEN&asearchopt_LINK_IMAGEN=Contains&value_LINK_IMAGEN=&value1_LINK_IMAGEN=`;
			},
			idTdIndex: 2,
			linkTdIndexes: [ 3 ],
		},
		{
			name: "Ficha Poligonal",
			key: "ficha_poli",
			body: (seccion, manzana, parcela) => {
				return `a=advsearch&type=and&asearchfield%5B%5D=SECCION&asearchopt_SECCION=Contains&value_SECCION=${seccion}&value1_SECCION=&asearchfield%5B%5D=MANZANA&asearchopt_MANZANA=Contains&value_MANZANA=${manzana}&value1_MANZANA=&asearchfield%5B%5D=SECCION_MANZANA&asearchopt_SECCION_MANZANA=Contains&value_SECCION_MANZANA=&value1_SECCION_MANZANA=&asearchfield%5B%5D=ORIGEN&asearchopt_ORIGEN=Contains&value_ORIGEN=&value1_ORIGEN=&asearchfield%5B%5D=ANTECEDENTE&asearchopt_ANTECEDENTE=Contains&value_ANTECEDENTE=&value1_ANTECEDENTE=&asearchfield%5B%5D=LINK_IMAGEN_FRENTE&asearchopt_LINK_IMAGEN_FRENTE=Contains&value_LINK_IMAGEN_FRENTE=&value1_LINK_IMAGEN_FRENTE=&asearchfield%5B%5D=LINK_IMAGEN_DORSO&asearchopt_LINK_IMAGEN_DORSO=Contains&value_LINK_IMAGEN_DORSO=&value1_LINK_IMAGEN_DORSO=`;
			},
			idTdIndex: 2,
			linkTdIndexes: [ 5, 6 ],
		},
	];

	let infoDiv = $(".datos-parcela");
	let currentId;

	let getImageItems = function(type, seccion, manzana, parcela) {
		return makeRequest({
			"url": `${HOST}/${type.key}/${type.key.toUpperCase()}_list.php`,
			"method": "POST",
			"headers": {
				"accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
				"accept-language": "en-US,en;q=0.9,es;q=0.8",
				"cache-control": "max-age=0",
				"content-type": "application/x-www-form-urlencoded",
			},
			"referrer": `${HOST}/${type.key}/${type.key.toUpperCase()}_search.php`,
			"body": type.body(seccion, manzana, parcela),
		}).then(response => {
			return $(response).find("table.data tr:not(:first)").toArray()
				.flatMap(tr => {
					let $tr = $(tr);
					let id = $tr.find("td").eq(type.idTdIndex).text();
					return type.linkTdIndexes.map(linkTdIndex => {
						let imagePath = $tr.find("td").eq(linkTdIndex).text();
						let link = `${HOST}/${type.key}/${imagePath}`;
						return {
							id: id,
							link: link,
						};
					});
				});
		});
	};

	let processNewId = function(id) {
		console.log("Processing new id ", id);
		currentId = id;

		let idSplit = id.split("-");
		if (idSplit.length != 3) {
			throw "Do not know how to handle id: " + id;
		}
		let seccion = idSplit[0];
		let manzana = idSplit[1];
		let parcela = idSplit[2];
		let promise = Promise.resolve();
		types.forEach(type => {
			promise = promise.then(() => {
				return getImageItems(type, seccion, manzana, parcela);
			}).then(items => {
				items.forEach(item => {
					$("table.data-list:first tbody")
						.append(`<tr><td class="clave">${type.name}: </td><td class="valor"><a href="${item.link}" target="_blank">${item.id}</a></td></tr>`);
				});
			});
		});
	};

	let listenToInfoOpen = function() {
		let observerFn = function() {
			let id = infoDiv.find("table td.clave").toArray()
				.filter(el => el.innerText.trim() === "Identificador Catastral:")
				.map(el => $(el).next().text().trim())
				[0];

			if (id && id != currentId) {
				processNewId(id);
			}
		};

		let mutationObserver = new MutationObserver(observerFn);
		mutationObserver.observe(infoDiv.get(0), { attributes : true, attributeFilter : ['style'] });

		// trigger a check to see if it Info is already opened:
		observerFn();
	};

	let makeRequest = function (options) {
		return new Promise((resolve, reject) => {
			chrome.runtime.sendMessage(options, response => (response && response.error) ? reject(response.error) : resolve(response));
		}).catch(e => {
			console.error("Error while making request", e);
			throw e;
		});
	};

	// Temporary fix because the page is currently broken.
	// It is using ids like "093-049-033" to get the pictures, but it currently works only with "93-049-033"
	// so we are stripping the first 0 for now.
	let fixParcelaPictures = function() {
		return PalitoHelperUtils.executeScript(`
			(function() {
				let usigFotosParcela = usig.FotosParcela;
				usig.FotosParcela = function(a, b) {
					if (a[0] === "0") {
						a = a.substring(1);
						console.log("Changing id to " + a);
					}
					return usigFotosParcela.call(this, a, b);
				};
				usig.FotosParcela.defaults = usigFotosParcela.defaults;
			})();
		`);
	};

	// Init
	(function () {
		return Promise.resolve().then(() => {
			return fixParcelaPictures();
		}).then(() => {
			return listenToInfoOpen();
		});
	})();

	// Public
	return {};
};
