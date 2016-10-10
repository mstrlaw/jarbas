Template.registerForm.events({
	'click #create-account' : function(e, t) {
		e.preventDefault();
		var el = $(e.currentTarget);
		if (!el.is("[disabled]")) {
			var	firstName = t.find('#first-name').value,
				email = t.find('#email').value,
				password = t.find('#password').value;

			if(cleanRegisterForm(firstName, email, password)){
				el.attr('disabled','disabled').addClass('m-progress');
				
				Meteor.call('registerInvitedUser', firstName, email, password, function(err, data){
					if(err){
						if(err.error === 403){
							toastr.error('Este email ja esta a ser usado');	
						}
						else{
							toastr.error(err.error);
						}
						el.removeClass('m-progress').removeAttr("disabled");
					}
					else{
						Meteor.loginWithPassword(email, password, function(err){
							
							el.removeClass('m-progress').removeAttr("disabled");

							try{
								var user = Meteor.user();
								var str = ''+user.emails[0].address+','+user.profile.firstName;
								Android.getLoginResult(str);
							}
							catch(err){
								console.log('ignore Android (browser)');
							}

							Meteor.setTimeout(function(){
								toastr.success('Obrigado por criares conta!');
								Router.go('home');
							}, 1000);
						});
					}
				});
			}
			else{ toastr.error('Erro ao validar formulário.'); };
		}
		return false;
	}
});

var cleanRegisterForm = function(firstName, email, password){
	var reNames = new RegExp('^[A-Za-z ]+$');
	
	//Names validation (IMPROVE)
	if(firstName != "" && firstName != " " && firstName.length > 0){
		if(!reNames.test(firstName)){
			toastr.error('Insere um nome válido (letras e números');
			return false;
		}
	}
	else{
		toastr.error('Por favor indica o teu nome.');
		return false;
	}

	//Email
	if(email.length === 0){
		toastr.error('Por favor indica um email.');
		return false;
	}

	//Password
	if(password.length === 0){
		toastr.error('Indica uma password.');
		return false;
	}

	if(password.length < 6){
		toastr.error('A password deve ter pelo menos 6 caracteres.');
		return false;
	}


	return true;

}