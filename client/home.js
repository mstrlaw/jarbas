var final_transcript = '';
var recognizing = false;
var ignore_onend;
var start_timestamp;
var last_input_timestamp;
var recognition_interval;


Template.home.onRendered(function(){
	var resultArea = $('#resultArea');
	Session.set('last_input_timestamp', moment().utc().unix());

	$('body').css({'background': '#FFF'});

	/*
	Meteor.setTimeout(function(){
		$('#resultArea').masonry({
			itemSelector: '.tile',
			columnWidth: '.tile',
			percentPosition: true
		});
	},100);
	*/

	if (hasSpeechRecognition) {
		
		select_dialect = 'pt-PT';
		startRecognition(event);

		recognition.continuous = true;
		recognition.interimResults = true;
		
		recognition.onstart = function() {
			recognition_interval = getRecognitionState();

			$('#start_button').find('.fa').removeClass('fa-microphone-slash').addClass('fa-microphone');
			
			last_input_timestamp = moment().utc().unix();
			Session.set('last_input_timestamp', last_input_timestamp);
			recognizing = true;
		};
		
		recognition.onerror = function(event) {
			console.log(event.error);
			if (event.error == 'no-speech') {
				ignore_onend = true;
			}
			if (event.error == 'audio-capture') {
				ignore_onend = true;
			}
			if (event.error == 'not-allowed') {
				if (event.timeStamp - start_timestamp < 100) {
				}
				else {
				}
				ignore_onend = true;
			}
		};

		//recognition.onaudiostart = function(){ toastr.info('onaudiostart'); };
		//recognition.onsoundstart = function(){ toastr.info('onsoundstart'); };
		
		recognition.onspeechstart = function(){ 
			//toastr.info('onspeechstart');
			Session.set('recognitionState', 'listening');
		};
		//recognition.onspeechend = function(){ toastr.info('onspeechend'); };
		//recognition.onsoundend = function(){ toastr.info('onsoundend'); };
		recognition.onaudioend = function(){
			//toastr.info('onaudioend');
			Session.set('recognitionState', 'not_listening');
		};
		//recognition.onnomatch = function(){ toastr.info('onnomatch'); };
		
		recognition.onend = function() {
			recognizing = false;
			//toastr.info('onend');

			clearInterval(recognition_interval);
			
			Session.set('recognitionState', 'end_recognition');

			$('#start_button').find('.fa').removeClass('fa-microphone').addClass('fa-microphone-slash');
			if(Meteor.userId()){
				Meteor.setTimeout(function(){
					recognition.start();
				}, 1000);
			}


			if (ignore_onend) {
				return;
			}
		};

		//Process results onresult event
		recognition.onresult = function(event) {
			//console.log('processing result');
			var interim_transcript = '';
			var receive_timestamp = moment().utc().unix();
			var dif = receive_timestamp - last_input_timestamp;
			Session.set('last_input_timestamp', dif);

			// if(dif <= 2){
			// 	console.log('restart recognition')
			// 	//recognition.stop();
			// 	final_transcript = '';
			// }
			
			if(event.results.length > 0){

				for (var i = event.resultIndex; i < event.results.length; ++i) {
					if (event.results[i].isFinal) {
						
						last_input_timestamp = moment().utc().unix();
						Session.set('last_input_timestamp', last_input_timestamp);

						if(dif < 3){
							final_transcript += event.results[i][0].transcript;
						}
						else{
							final_transcript = event.results[i][0].transcript;
						}
					}
					else {
						interim_transcript += event.results[i][0].transcript;
					}
				}
			}
			else{
				console.log('no result')
			}

			final_transcript = capitalize(final_transcript);

			interim_span.innerHTML = linebreak(interim_transcript);


			if(final_transcript !== ''){
				var existingProducts = Session.get('matchedProducts');
				var previousContext = Session.get('context');

				var re = new RegExp(/limpar pesquisa|esquecer pesquisa|esquece a pesquisa|nova pesquisa/gi)
				
				if(final_transcript.match(re) !== null){
					resultArea.html('');
					final_span.innerHTML = '';
					$(document).scrollTop(0);
					Session.set('matchedProducts');
					Session.set('context');
				}
				else{
					
					if(typeof existingProducts === 'undefined'){ existingProducts = []; }

					Meteor.call('identifyCommand', final_transcript, existingProducts, previousContext, function(err, result){
						if(!err){

							final_span.innerHTML = linebreak(final_transcript);

							console.log(result.response)

							if(typeof result.response !== 'undefined'){
								
								if(typeof result.response.context !== 'undefined'){
									Session.set('context', result.response.context);
								}
								else{
									Session.set('context');
								}

								switch(result.response.action){
									case 'hello':
									case 'jarbas':
										toastr.success(result.response.context.action);
										Session.set('context');
										break;
									case 'create_list':
									case 'confirm_finalize_list':
										$('#shoppingList').addClass('show');
										if(typeof result.response.context !== 'undefined'){
											Session.set('context', result.response.context);
											toastr.info(result.response.context.verbose);
										}
										break;

									case 'closed_list':
										toastr.info(result.response.context.verbose)
										Session.set('context', result.response.context);
										$('#shoppingList').removeClass('show');
										resultArea.html('');
										final_span.innerHTML = '';
										$(document).scrollTop(0);
										break;
									case 'mostrar':
										$('#shoppingList').addClass('show');
										if(typeof result.response.context !== 'undefined'){
											Session.set('context', result.response.context);
											toastr.success(result.response.context.action);
										}
										break;
									case 'esconder':
										$('#shoppingList').removeClass('show');
										break;
									case 'logout':
										var userName = Meteor.user().profile.firstName;
										toastr.success('Até à proxima ' + userName + ' :)');
										Meteor.logout();
										Router.go('logout');
										break;
									default:
										if(result.response.action !== 'confirm_add'){
											toastr.info(result.response.action);
										}
										break;
								}

								if(result.products.length > 0){
									Session.set('matchedProducts', result.products);
									animateTiles(result.products);
								}

								//Clear final_transcript
								final_transcript = '';
							}
						}
						else{
							console.log(err);
							toastr.error(err);
						}
					});
				}
			}
		};
	}
	else{
		alert('no SpeechRecognition found!')
	}
});
	
Template.home.events({
	'click #start_button': function(e){
		e.preventDefault();
		startRecognition(event);
	},
});

function getRecognitionState(){
	return Meteor.setInterval(function(){
		var now = moment().utc().unix();
		var dif = now - Session.get('last_input_timestamp');
		var state = Session.get('recognitionState');

		// console.log('last_input: ' + Session.get('last_input_timestamp'))
		// console.log('now: ' + now);
		// console.log('state:' + state + ', dif: ' + dif); 

		if(typeof state !== 'undefined' && state === 'listening'){
			if(dif >= 10){
				console.log('restart recognition')
				recognition.stop();
			}
		}

	}, 5000);
}

function startRecognition(event) {
	if (recognizing) {
		//toastr.warning('ended recognition');
		recognition.stop();
		return;
	}

	//toastr.info('start recognition');
	final_transcript = '';
	recognition.lang = select_dialect;
	recognition.start();
	ignore_onend = false;
	final_span.innerHTML = '';
	interim_span.innerHTML = '';
	start_timestamp = moment().utc().unix();
}

function endRecognition(event){
	//toastr.info('end recognition');
	recognition.stop();
	return;
}

function upgrade() {
  start_button.style.visibility = 'hidden';
}

var two_line = /\n\n/g;
var one_line = /\n/g;
function linebreak(s) {
  return s.replace(two_line, '<p></p>').replace(one_line, '<br>');
}

var first_char = /\S/;
function capitalize(s) {
  return s.replace(first_char, function(m) { return m.toUpperCase(); });
}

animateTiles = function(products){
    var resultArea = $('#resultArea');
    resultArea.html('');

    for(var i=0; i<products.length; i++){
      //console.log(products[i].ProductWebDisplayName)
      
		time=200+(100*i);

		var tile = '<div class="tile">'
			+ '<img src="'+ products[i].image +'"/>'
			+ '<p class="product-display-name">'+ products[i].name +'</p>'
			+ '<span class="product-price">€'+ products[i].price + '</span>'
			+'</div>';

		$(tile).appendTo(resultArea).addClass('move').delay(time).animate({
			'opacity':'1',
			'top':'0',
			'left':'0'
		},300);
	}
}//Animate function