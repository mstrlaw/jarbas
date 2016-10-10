import request from '/node_modules/request';

process.setMaxListeners(0);

categories_list = [
	'produtos_frescos',
	'mercearia_salgada',
	'mercearia_doce',
]

parseProducts = function(text, query){
	var counter = 0;

	var jsonRes = JSON.parse(text);
	var products = jsonRes.ProductsFound;

	console.log('#############\n RESULTS FOR ' + query + '\n############');

	if(products.length > 0){
		for(var i=0; i<products.length; i++){
			counter+=1;
			console.log(products[i].ProductWebDisplayName, products[i].ProductId)
			
			Products.upsert({
				name: products[i].ProductWebDisplayName,
			},{
				productId: products[i].ProductId,
				price: products[i].ProductOriginalListPrice,
				brand: products[i].ProductBrand,
				category: products[i].ProductPrimaryParentCategoryId,
				image: products[i].ProductImage,
			});
		}
		console.log('inserted ' + counter + ' products')
	}
	else{
		console.log('no products found')
	}

	return;
}

Meteor.methods({
	'insertProduct': function(product){
		Products.upsert({
			name: product.ProductWebDisplayName,
		},{
			'$setOnInsert':{
				name: product.ProductWebDisplayName,
				productId: product.ProductId,
				price: product.ProductOriginalListPrice,
				brand: product.ProductBrand,
				category: product.ProductPrimaryParentCategoryId,
				image: product.ProductImage,
			}
		});
	},
	'populateProducts': function(query){
		//var url = 'https://www.continente.pt/stores/continente/pt-pt/public/Pages/category.aspx?cat=Mercearia(eCsf_WebProductCatalog_MegastoreContinenteOnline_Continente_EUR_Colombo_PT)#/?t=1475758755917&pl=20';
		//var query = 'a';
		
		this.unblock();
		console.log('#############\n Retrieving ' + query + '\n############');

		var url = 'http://crossorigin.me/http://apicolpixelcamp.azure-api.net//api/search?query=' + query;

		var r = request({
		    url: url,
		    timeout: 60000,
		    jar: request.jar(),
		    headers: {
		        'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_8_3) AppleWebKit/537.31 (KHTML, like Gecko) Chrome/26.0.1410.65 Safari/537.31'
		    }
		}, Meteor.bindEnvironment(function (err, res, html) {
			try{
				var jsonRes = JSON.parse(html);
				var products = jsonRes.ProductsFound;

				console.log('#############\n RESULTS FOR ' + query + '\n############');
				var counter = 0;

				if(products.length > 0){
					for(var i=0; i<products.length; i++){
						counter+=1;
						
						Meteor.call('insertProduct', products[i]);

					}
					console.log('inserted ' + counter + ' products')
				}
				else{
					console.log('no products found')
				}
			}
			catch(err){
				console.log('error retrieving products')
			}

		})); 
		/*
		function(err, response, html){
			
			var jsonRes = JSON.parse(html);
			var products = jsonRes.ProductsFound;

			console.log('#############\n RESULTS FOR ' + query + '\n############');

			var counter = 0;

			if(products.length > 0){
				for(var i=0; i<products.length; i++){
					counter+=1;
					
					Meteor.call('insertProduct', products[i]);

				}
				console.log('inserted ' + counter + ' products')
			}
			else{
				console.log('no products found')
			}
		});
		*/
		
		//console.log('#############\nSearch for ' + query + '\n############');

		
	},
});