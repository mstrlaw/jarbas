Template.loginForm.events({
	'submit #login-form' : function(e, t){
		e.preventDefault();
		
		var loginForm = $(e.currentTarget),
			submitBtn = loginForm.find('#login-button');
		
		if (!submitBtn.is("[disabled]")) {

			var email = t.find('#login-email').value, 
				password = t.find('#login-password').value,
				validEmail = true,
				validPassword = true;

			// Todo-> Trim and validate input here
			if(email == '' || password == '') {
				//Materialize.toast('Please provide your email and password.', 4000, 'red');
				validEmail=false;
				validPassword=false;
			};

		  
			// If validation passes, supply the appropriate fields to the
			if (validEmail && validPassword) {
				submitBtn.attr('disabled','disabled')
				
				Meteor.loginWithPassword(email, password, function(err){
					if (err){
						if (err.message = 'Incorrect password [403]') {
							submitBtn.removeAttr("disabled");
		        	  		toastr.error('Email/password incorretos ou conta inexistente.');
		        		}
						else{
							submitBtn.removeAttr("disabled");
							toastr.error('Erro a fazer login! =/');
						}
					}
					else{
						
						try{
							var user = Meteor.user();
							if(typeof user !== 'undefined'){
								var str = ''+user.emails[0].address+','+user.profile.firstName;
								Android.getLoginResult(str);
							}
						}
						catch(err){
							console.log('ignore Android (browser)');
						}

						submitBtn.removeAttr("disabled");
						Router.go('home');
					}
				});
			}
			else{
				submitBtn.removeAttr("disabled");
				toastr.error('Indica as tuas credenciais.');
			}
		}

	return false; 
	
	}
});