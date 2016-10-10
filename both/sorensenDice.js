
/**
	Uses the Sørensen–Dice coeficient to compare similarity between two strings or one string against array of strings
	(Taken from https://gist.github.com/doorhammer/9957864 then tweaked)

**/

sSimilarity = function(sa1, sa2){

	if(typeof(sa2) === 'string'){
	    var s1 = sa1.replace(/\s/g, "").toLowerCase();
	    var s2 = sa2.replace(/\s/g, "").toLowerCase();

	    var similarity = checkSimilarity(s1, s2);
	}

	if(typeof(sa2) === 'object'){
		var scores = {};

		//var s1 = sa1.replace(/\s/g, "").toLowerCase();
		var s1 = sa1.toLowerCase();
		
		if(sa2.length > 0){
			//console.log('compare "' + s1 + '" to: ');
			for(i=0; i<sa2.length; i++){
				//sa2[i] = sa2[i].replace(/\s/g, "").toLowerCase();
				sa2[i] = sa2[i].toLowerCase();
				
				var similarity = checkSimilarity(s1, sa2[i]);
				
				//console.log(sa2[i] + " === " + similarity);
			}
		}
		else{
			var similarity = 0;
		}

	}

    return similarity;
};

checkSimilarity = function(s1, s2){
	var similarity_num = 2 * intersect(pairs(s1), pairs(s2)).length;
	var similarity_den = pairs(s1).length + pairs(s2).length;
	return similarity_num / similarity_den;
}

pairs = function(s){ // Get an array of all pairs of adjacent letters in a string
	var pairs = [];
	
	for(var i = 0; i < s.length - 1; i++){
		pairs[i] = s.slice(i, i+2);
	}

	return pairs;
}	

intersect = function(arr1, arr2) {
	var r = [], o = {}, l = arr2.length, i, v;
	
	for (i = 0; i < l; i++) {
		o[arr2[i]] = true;
	}
	
	l = arr1.length;
	
	for (i = 0; i < l; i++) {
		v = arr1[i];
		if (v in o) {
			r.push(v);
		}
	}
	
	return r;
}