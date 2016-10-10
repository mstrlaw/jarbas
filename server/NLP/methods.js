Meteor.methods({
	'identifyCommand': function(query, existingProducts, previousContext){
		console.log('identify-> ' + query)
		console.log('previousContext-> ' + previousContext)

		var response = _identifyCommand(query);
		var products = [];
		var userId = this.userId;

		Meteor.defer(function(userId){
			if(query !== ''){
				SpeechInputs.insert({
					query: query,
					user: userId,
					createDate: new Date()
				});
			};
		});

		//console.log(response)

		//In this case, user just started conversation and there is no context
		if(typeof response !== 'undefined' && (typeof previousContext === 'undefined' || previousContext === null)){
			console.log('case1, NO previousContext')
			var res = _processCommand(response, existingProducts, this.userId);
			response = res.response;
			products = res.products;
		}
		//In this case, user spoke already, we have an undefined response but have a previous context
		else if(typeof response === 'undefined' && typeof previousContext !== 'undefined' && previousContext !== null){
			console.log('case 2')
			
			switch(previousContext.action){
				case 'select_multiple_result':
					if(typeof existingProducts !== 'undefined' && existingProducts.length > 0){
						response = {
							action: 'adicionar',
							strippedString: query,
						}

						var res = _processCommand(response, existingProducts, this.userId);
						
						response = res.response;
						//products = res.products;
					}
					break;
				case 'confirm_add':
					
					console.log('#### previousContext.product ####');
					console.log(previousContext.product);

					response = {
						action: 'confirm_add',
						strippedString: query,
						product: previousContext.product,
					}

					var res = _processCommand(response, existingProducts, this.userId);
					
					response = res.response;
					break;

				case 'confirm_finalize_list':
					console.log('#### FINALIZE LIST ####');
					
					response = {
						action: 'confirm_finalize_list',
						strippedString: query,
						listId: previousContext.list
					}
					var res = _processCommand(response, existingProducts, this.userId);
					
					response = res.response;

					break;

				case 'add_unknown_product':
					console.log('#### add_unknown_product ####');
					console.log(previousContext.product);
					response = {
						action: 'confirm_add',
						strippedString: query,
						product: {
							_id: '0000000',
							name: previousContext.product,
							price: 0,
						},
					}

					var res = _processCommand(response, existingProducts, this.userId);
			}

			/*
			console.log('existingProducts-> ' + existingProducts.length)
	

			
			*/
		}
		//In this case, user spoke but we didn't understand and have no prior context
		else{
			var new_response = false;
			if(typeof response !== 'undefined'){
				var res = _processCommand(response, existingProducts, this.userId);
				response = res.response;
				products = res.products;
				new_response = true;
			}

			if(!new_response){
				if(typeof existingProducts !== 'undefined'){
					var response = {
						action: 'Não percebi o que pretende.',
						context: {
							'action': 'select_multiple_result',
						}
					}
				}
				else{
					var response = {
						action: 'Não percebi o que pretende.',
					}	
				}
			}
			
		}

		console.log('-------')

		return {
			'response': response,
			'products': products,
		}

	},
});