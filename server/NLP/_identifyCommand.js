_identifyCommand = function(string){
	var simplifyiedString = string.removeStopWords();
	var strippedString = simplifyiedString;

	//console.log(simplifyiedString);

	var commands = CommandAssumptions.find().fetch();

	var command_current_index = 0;
	var indexChoice;
	var similarity_score = {};
	var exact_match = {};


	for(var i = 0; i < commands.length; i++){
		var action = commands[i].action;
		var command_list = commands[i].command_list;

		//Check similarity in commands
		for(var j = 0; j < command_list.length; j++){
			var score = sSimilarity(simplifyiedString, command_list[j]);

			var re = new RegExp(command_list[j], 'gi')

			strippedString = strippedString.replace(re, '');

			if(simplifyiedString.match(re) !== null){
				//console.log('found ' + command_list[j])
				if(typeof exact_match[action] !== 'undefined'){
					exact_match[action] += 1;
				}
				else{
					exact_match[action] = 1;
				}
			}

			if(typeof similarity_score[action] !== 'undefined'){
				similarity_score[action] += score;
			}
			else{
				similarity_score[action] = score;
			}
		}

		similarity_score[action] = similarity_score[action] / command_list.length;

		command_current_index++;
	}

	//Combine scores of both matching types
	var combinedMatches = {};

	_.each(similarity_score, function(val, key){
		if(typeof combinedMatches[key] === 'undefined'){ combinedMatches[key] = val; }
		else{ combinedMatches[key] += val; }
	});

	_.each(exact_match, function(val, key){
		if(typeof combinedMatches[key] === 'undefined'){ combinedMatches[key] = val; }
		else{ combinedMatches[key] += val; }
	});

	//Get largest score
	var largest = Object.keys(combinedMatches).reduce(function(a, b){ return combinedMatches[a] > combinedMatches[b] ? a : b });

	var index = commands.findIndex(obj => obj.action === largest);

	//console.log(largest, index)
	console.log('strippedString -> ' + strippedString)

	//strippedString = strippedString.replace(/\b\s?\.{1}\b/g, ' ');
	strippedString = strippedString.replace(/^\s+|\s+$/g, ""); //Remove extra whitespaces
	strippedString = strippedString.replace(/\w\*+/g, ""); //Remove censored foul language
	strippedString = strippedString.removeStopWords(); //Remove any "stopwords" that may have comeup
	strippedString = strippedString.replace(/-me|-/g, ""); //Remove '-me'
	strippedString = strippedString.replace(/^\s+|\s+$/g, ""); //Remove extra whitespaces

	console.log('strippedString2 ->"' + strippedString +'"')

	if(combinedMatches[largest] >= 0.8){
		return {
			'action': commands[index].action,
			'strippedString': strippedString,
			'score': combinedMatches[largest]
		};
	}
}