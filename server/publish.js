Meteor.publish('lists', function(){
	return Lists.find({
		user:this.userId
	},{sort:{updateDate:-1}, limit: 20});
});

Meteor.publish('products', function(){
	return Products.find({
	},{sort:{price:-1}, limit: 10});
});

Meteor.publish('userProducts', function(){
	return UserProducts.find({
	},{
		sort:{ price:-1 }, 
		limit: 25
	});
});