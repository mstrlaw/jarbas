Meteor.methods({
	'registerInvitedUser': function(firstName, email, password){
		var userId = Accounts.createUser({
			email: email, 
			password : password,
			roles: [],
			profile: {
				'firstName':firstName,
			},
		});
	},
})