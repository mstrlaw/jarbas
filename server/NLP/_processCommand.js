findProducts = function(query){
	var products = [];
	if(query !== '' && query !== ' ' && query.length >= 3){
		var s = '.*'+ query +'.*';
		var re = new RegExp(s, 'ig')
		products = Products.find({
			"name": {
				'$regex' : re,
				'$options' : 'ig'
			}
		}).fetch();
		console.log('found '+ products.length);
	}

	return products;
}


_processCommand = function(response, existingProducts, userId){
	var query = response.strippedString;
	var products = [];
	switch(response.action){
		case 'comprar':
		case 'procurar' :
			
			products = findProducts(query);

			if(products.length === 0){
				response['action'] = 'Não encontrei o produto ' + query +'. Adicionar à lista de qualquer forma?';
				response['context'] = {
					'action': 'add_unknown_product',
					'product': query,
				}

			}
			else if(products.length === 1){
				response['action'] = 'Acrescentar ' + products[0].name +' à lista de compras.';
				response['context'] = {
					'action': 'confirm_add',
					'product': selectedProduct,
				};
			}
			else{
				console.log('escolher produto ' + query);
				response['action'] = 'Escolha qual o produto pretendido.';
				response['context'] = {
					'action': 'select_multiple_result',
				};
			}
			break;

		case 'adicionar':
			if(typeof existingProducts !== 'undefined' && existingProducts.length > 0){
				console.log('escolher produto ' + query)
				
				var similarity_score = {};

				for(var i=0; i<existingProducts.length; i++){
					var productName = existingProducts[i].name;
					var score = sSimilarity(query, productName);

					if(typeof similarity_score[existingProducts[i]._id] !== 'undefined'){
						similarity_score[existingProducts[i]._id] += score;
					}
					else{
						similarity_score[existingProducts[i]._id] = score;
					}
				}

				//console.log(similarity_score);

				var largest = Object.keys(similarity_score).reduce(function(a, b){ return similarity_score[a] > similarity_score[b] ? a : b });

				score = similarity_score[largest];
				var index = existingProducts.findIndex(obj => obj._id === largest);
				var selectedProduct = existingProducts[index];
				console.log(selectedProduct)

				if(score >= 0.5){
					response['action'] = 'Acrescentei ' + selectedProduct.name + ' à lista de compras';
					response['context'] = {
						'action': 'select_multiple_result',
					};
					//products = existingProducts;

					var shoppingList = Lists.findOne({ 
						user: userId,
						active: true
					},{
						sort:{ createDate: -1 }
					});

					if(typeof shoppingList === 'undefined' || shoppingList.length === 0){
						console.log('criar nova lista')
						var listCounter = Lists.find({
							user: userId,
							active:true,
						}).count();

						Lists.insert({
							user: userId,
							active: true,
							createDate: new Date(),
							updateDate: new Date(),
							products:[{
								productId: selectedProduct._id,
								productName: selectedProduct.name,
								image: selectedProduct.image,
								price: selectedProduct.price,
								quantity: 1
							}]
						});

					}
					else{
						console.log('acrescentar a lista existente');
						Lists.update({
							_id: shoppingList._id
						},{
							$addToSet:{
								products:{
									productId: selectedProduct._id,
									productName: selectedProduct.name,
									image: selectedProduct.image,
									price: selectedProduct.price,
									quantity: 1
								}
							}
						});
					}
				}
				// else if(score < 1 && score >= 0.5){
				// 	console.log('yolo yolo')
				// 	response['action'] = 'Acrescentar ' + selectedProduct.name + ' à lista de compras?';
				// 	response['context'] = {
				// 		'action': 'confirm_add',
				// 		'product': selectedProduct,
				// 	};
				// 	//products = existingProducts;
				// }
				else{
					response['action'] = 'Não percebi qual o produto que pretende.';
					response['context'] = {
						'action': 'select_multiple_result',
					};

					//products = existingProducts;
				}


			}
			else if(typeof existingProducts === 'undefined' || existingProducts.length === 0){
				products = findProducts(query);
				
				if(products.length === 0){
					response['action'] = 'Não encontrei o produto ' + query +'. Adicionar à lista de qualquer forma?';
					response['context'] = {
						'action': 'add_unknown_product',
						'product': query,
					}

				}
				else if(products.length === 1){
					response['action'] = 'Acrescentar ' + products[0].nane +' à lista de compras.';
					response['context'] = {
						'action': 'confirm_add',
						'product': selectedProduct,
					};
				}
				else{
					response['action'] = 'Escolha qual o produto pretendido.';
					response['context'] = {
						'action': 'select_multiple_result',
					};
				}
			}
			break;

		case 'confirm_add':
			if(typeof response.product !== 'undefined'){
				console.log('CONFIRMAR-> ' + query);
				console.log(response.product)
				var positiveRe = new RegExp(/sim|acrescentar|acrescenta|adicionar|adiciona/gi);
				var negativeRe = new RegExp(/não|ignorar|ignora|esquece|nada/gi);
				
				if(query.match(positiveRe) !== null){
					var shoppingList = Lists.findOne({ 
						user: userId,
						active: true
					},{
						sort:{ createDate: -1 }
					});

					if(typeof shoppingList === 'undefined' || shoppingList.length === 0){
						console.log('criar nova lista')
						var listCounter = Lists.find({
							user: userId,
							active:true,
						}).count();

						Lists.insert({
							user: userId,
							active: true,
							createDate: new Date(),
							updateDate: new Date(),
							products:[{
								productId: response.product._id,
								productName: response.product.name,
								image: response.product.image,
								price: response.product.price,
								quantity: 1
							}]
						});

					}
					else{
						console.log('acrescentar a lista existente');
						Lists.update({
							_id: shoppingList._id
						},{
							$addToSet:{
								products:{
									productId: response.product._id,
									productName: response.product.name,
									image: response.product.image,
									price: response.product.price,
									quantity: 1
								}
							}
						});
					}

					response['action'] = 'Acrescentei ' + response.product.name + ' à lista de compras.';

				}
				if(query.match(negativeRe) !== null){ console.log('NÃO ACRESCENTAR!!!!!') }
			}
			response['context'] = { 'action': 'select_multiple_result', };
			break;

		case 'criar':
			console.log('CRIAR-> ' + query)
			
			response['action'] = 'Criar nova tasklist.';
			response['context'] = {
				'action': 'create_tasklist',
			};
			break;

		case 'remover':
			console.log('REMOVER-> ' + query)

			response['action'] = 'Remover último produto.';
			response['context'] = {
				'action': 'confirm_remove_product',
			};


			var shoppingList = Lists.findOne({ 
				user: userId,
				active: true
			},{
				sort:{ createDate: -1 }
			});

			if(typeof shoppingList !== 'undefined'){
				console.log('remove produto')
				Lists.update({
					_id: shoppingList._id,
					'products.0': { $exists: 1 },
				},{
					$pop: { products: 1 }
				});
			}
			break;

		case 'finalizar':
			console.log('FINALIZAR lista de compras');
			var shoppingList = Lists.findOne({ 
				user: userId,
				active: true
			},{
				sort:{ createDate: -1 }
			});

			if(typeof shoppingList === 'undefined' || shoppingList.length === 0){
				response['action'] = 'create_list';
				response['context'] = {
					'action': 'create_list',
					'verbose': 'Não existe nenhuma lista em aberto. Pretende criar uma nova?'
				};
			}
			else{
				response['action'] = 'confirm_finalize_list';
				response['context'] = {
					'action': 'confirm_finalize_list',
					'list': shoppingList._id,
					'verbose': 'Pretende finalizar esta lista?'
				};	
			}
			break;

		case 'confirm_finalize_list':
			console.log('FINALIZE LIST NOW');

			var positiveRe = new RegExp(/sim|acrescentar|acrescenta|adicionar|adiciona/gi);
			var sendEmail = new RegExp(/envia email|enviar|email|mail/gi);
			//var negativeRe = new RegExp(/não|ignorar|ignora|esquece|nada/gi);
			
			if(query.match(positiveRe) !== null){
				
				var products = Lists.findOne({_id: response.listId }).products;

				/* Update product stats */
				var listTotal = 0;

				_.each(products, function(product, k){
					console.log(products);

					var productDB = Products.findOne({
						_id: product.productId
					});

					listTotal += productDB.price;

					UserProducts.upsert({
						productId: product.productId,
						user: userId
					},{
						$inc:{
							quantity: 1
						},
						$set:{
							name: productDB.name,
							lastBought: new Date(),
							price: productDB.price,
							image: productDB.image
						}
					});
				});

				var shoppingList = Lists.update({ 
					_id: response.listId,
				},{
					$set:{
						active: false,
						total: listTotal
					}
				});

				if(query.match(sendEmail) !== null){
					console.log('enviar por mail');
					response['action'] = 'closed_list';
					response['context'] = {
						'action': 'email_sent',
						'verbose': 'Enviei a lista para o seu email.'
					};
				}
				else{
					response['action'] = 'closed_list';
					response['context'] = {
						'action': 'email_list',
						'list': response.listId,
						'verbose': 'Quer a lista enviada para o email?'
					};
				}
				//response['action'] = 'email_list';

			}
			break;

		case 'email_list':
			console.log('SEND TO EMAIL!');
			break;

		case 'encomendar':
			break;

		case 'logout':
			response['action'] = 'logout';
			break;

		case 'hello':
			var randGreeting = ['Olá, tudo bem?', 'Olá, como posso ajudar hoje? :)', 'Olá, o que precisas hoje?', 'Hey, tudo bem?', 'Hey! O que precisas comprar?', 'Olá!', 'Hello!', 'Hey hey!', 'Ahoy! Vamos fazer compras?'];
			var randIndex = Math.round(Math.random() * (randGreeting.length - 1));
			response['action'] = 'hello';
			response['context'] = {
				'action': randGreeting[randIndex],
			};
			break;
		case 'jarbas':
			var randGreeting = ['Sim?', 'Estou aqui.', 'Estou a ouvir.', 'Hey, estou à escuta :)',];
			var randIndex = Math.round(Math.random() * (randGreeting.length - 1));
			response['action'] = 'hello';
			response['context'] = {
				'action': randGreeting[randIndex],
			};
			break;

		default:
			break;
	}

	console.log('THE RESPONSE')
	console.log(response)

	return {
		'response': response,
		'products': products
	}
}