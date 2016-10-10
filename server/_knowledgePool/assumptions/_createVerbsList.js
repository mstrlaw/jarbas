import nlp from 'nlp_compromise';

_createVerbsList = function(){

	//Dump all documents from verb collection
	Verbs.remove({});

	//----- Organizational verbs
	for(var i = 0; i < verb_list.length; i++){

		//Insert verb data
		Verbs.insert({
			verb: verb_list[i]
		});
	};
};