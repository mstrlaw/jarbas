/*
	Populates the database with premade assumptions
*/
runKnowledgeFixtures = function(){
	console.log('** Init Assumptions **')
	_createCommandAssumptions();

	//console.log('> Create Verbs List')
	if(typeof Verbs.findOne() === 'undefined' || Verbs.findOne().length === 0){
		_createVerbsList();
	}

}