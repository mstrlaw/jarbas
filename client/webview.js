identifyCommand = function(final_transcript){
	var final_span = $(document).find('#final_span');
	var resultArea = $(document).find('#resultArea');
	
	if(final_transcript !== ''){
		var existingProducts = Session.get('matchedProducts');
		var previousContext = Session.get('context');

		var re = new RegExp(/limpar pesquisa|esquecer pesquisa|esquece a pesquisa|nova pesquisa/gi)
		
		if(final_transcript.match(re) !== null){
			resultArea.html('');
			final_span.innerHTML = '';
			Session.set('matchedProducts');
			Session.set('context');
		}
		else{
			
			if(typeof existingProducts === 'undefined'){ existingProducts = []; }
			final_span.html('');

			Meteor.call('identifyCommand', final_transcript, existingProducts, previousContext, function(err, result){
				if(!err){

					final_span.innerHTML = final_transcript;

					console.log(result.response)

					if(typeof result.response !== 'undefined'){
						
						if(typeof result.response.context !== 'undefined'){
							Session.set('context', result.response.context);
						}
						else{
							Session.set('context');
						}

						switch(result.response.action){
							case 'hello':
							case 'jarbas':
								toastr.success(result.response.context.action);
								Session.set('context');
								break;
							case 'create_list':
							case 'confirm_finalize_list':
								if(typeof result.response.context !== 'undefined'){
									Session.set('context', result.response.context);
									toastr.info(result.response.context.verbose);
								}
								break;

							case 'mostrar':
								$('#shoppingList').addClass('show');
								if(typeof result.response.context !== 'undefined'){
									Session.set('context', result.response.context);
									toastr.success(result.response.context.action);
								}
								break;
							case 'esconder':
								$('#shoppingList').removeClass('show');
								break;
							case 'logout':
								var userName = Meteor.user().profile.firstName;
								toastr.success('Até à proxima ' + userName + ' :)');
								Meteor.logout();
								try{
									Android.logoutUser();
								}
								catch(err){ console.log('ignore Android (logout)'); }
								Router.go('logout');
								break;
							default:
								toastr.info(result.response.action);
								break;
						}

						if(result.products.length > 0){
							Session.set('matchedProducts', result.products);
							animateTiles(result.products);
						}

						//Clear final_transcript
						final_transcript = '';
					}
				}
				else{
					console.log(err);
					toastr.error(err);
				}
			});
		}
	}


	/*
	Meteor.call('identifyCommand', final_transcript, function(err, result){
		if(!err){
			if(typeof result.command !== 'undefined'){
				toastr.info(result.command.action);

				if(result.products.length > 0){
					Session.set('matchedProducts', result.products);
					var encodedURL = "jarbasurl://q?products=" + encodeURIComponent(JSON.stringify(result.products))
					Android.displayProducts(encodedURL);
				}
				//Clear final_transcript
				final_transcript = '';
			}
		}
		else{
			console.log(err);
			toastr.error(err);
		}
	});
	*/
};

loginWithPassword = function(email, password){
	Meteor.loginWithPassword(email, password, function(err){
		if (err){
			if (err.message = 'Incorrect password [403]') {
				submitBtn.removeAttr("disabled");
		  		toastr.error('Verifica que o teu email/passwords estão corretos');
			}
			else{
				submitBtn.removeAttr("disabled");
				toastr.error('Erro a fazer login! =/');
			}
		}
		else{
			submitBtn.removeAttr("disabled");
			try{
				var user = Meteor.user();
				Android.getUserName(user.profile.firstName);
			}
			catch(err){
				alert('Error sending username to Android');
			}

			Router.go('home');
		}
	});
};

registerWithPassword = function(email, password, name){
	Meteor.call('registerInvitedUser', name, email, password, function(err, data){
		if(err){
			toastr.error(err);
		}
		else{
			Meteor.loginWithPassword(email, password, function(err){
				try{
					var user = Meteor.user();
					Android.getUserName(user.profile.firstName);
				}
				catch(err){
					alert('Error sending username to Android');
				}

				Meteor.setTimeout(function(){
					toastr('Obrigado por criares conta!');
					Router.go('home');
				}, 1000);
			});
		}
	});
}