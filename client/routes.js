Router.route('/',{
	name: 'home',
	waitOn: function(){
		return [
			Meteor.subscribe('lists'),
			Meteor.subscribe('products'),
			Meteor.subscribe('userProducts'),
		]
	},
	action: function(){

		console.log(Meteor.userId())

		if(typeof Meteor.userId() !== 'undefined' && Meteor.userId() !== null){
			this.render('home',{
				data: function(){
					var list = Lists.findOne({ active: true });

					var allLists = Lists.find({ active: false }).fetch();
					
					var products = Products.find().fetch();

					var userProducts = UserProducts.find({},{
						sort:{
							lastBought: -1
						}
					}).fetch();

					var topProduct = UserProducts.findOne({},{
						sort:{ quantity: -1 }
					});

					//Calculate avg product price
					var avgPrice = 0;
					if(userProducts.length > 0){
						var total = 0;
						_.each(userProducts, function(p, k){
							total += p.price;
						});
						avgPrice = total / userProducts.length;
					}

					//Calculate avg list total
					var avgListP = 0;
					var lastList;
					if(allLists.length > 0){
						lastList = allLists[0];
						var total = 0;
						_.each(allLists, function(l, k){
							total += l.total;
						});
						avgListP = total / allLists.length;
					}

					//This doesn't work inside the route apparently
					try{ Android.recentProducts(JSON.stringify(products)) }
					catch(err){ console.log('Ignore Android recentProducts') }

					var listProducts = []

					if(typeof list !== 'undefined'){
						var total = 0;
						for(var i=0; i<list.products.length; i++){
							total += list.products[i].price;
						}
						listProducts = list.products
					}
					return{
						'avgPrice': Math.round(avgPrice * 100) / 100,
						'avgListP': Math.round(avgListP * 100) / 100,
						'lastList': lastList,
						'topProduct': topProduct,
						'userProducts': userProducts,
						'listProducts': listProducts,
						'total': Math.round(total * 100 ) / 100
					}
				}
			});
			toastr.success('Olá ' + Meteor.user().profile.firstName);
		}
		else{
			this.render('publicHome')
		}

	},
});

Router.route('/logout',{
	name: 'logout',
	action: function(){
		Meteor.logout();
		Router.go('home');
	},
});

Router.route('/webview',{
	name: 'webview',
	action: function(){
		this.render('webview');
	},
});