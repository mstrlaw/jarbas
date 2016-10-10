import { Template } from 'meteor/templating';
import { ReactiveVar } from 'meteor/reactive-var';

import nlp from 'nlp_compromise';

import './main.html';

Meteor.startup(function(){

	//Check if the browser is supported

	if (!('webkitSpeechRecognition' in window)) {
		//toastr.warning('Jarbas apenas funciona em Chrome =/')
		hasSpeechRecognition = false;
	}
	else {
		recognition = new webkitSpeechRecognition();
		hasSpeechRecognition = true;
		//select_dialect = navigator.language || navigator.userLanguage; 
		select_dialect = 'pt-PT';
		//select_dialect = 'en-EN'; 
		console.log("The language is: " + select_dialect);
	}


	//Set toaster options
	toastr.options.timeOut = 5000;
    toastr.options.newestOnTop = false;
    toastr.options.positionClass = "toast-bottom-full-width";
})