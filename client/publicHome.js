var string = "Assistente de compras";
var array = string.split("");
var timer;

frameLooper = function() {
	if (array.length > 0) {
		document.getElementById("dynamicTitle").innerHTML += array.shift();
	} else {
		clearTimeout(timer);
			}
	loopTimer = setTimeout('frameLooper()',70); /* change 70 for speed */
}

Template.publicHome.onRendered(function(){
	var h = $(window).height();
	$('body').css({'height': h+'px'});

	var randColors = ['pink', 'purple', 'red', 'green', 'blue'];
	var randIndex = Math.round(Math.random() * (randColors.length - 1));

	console.log(randIndex)

	$('body, html').addClass(randColors[randIndex]);
	$('.full-background').addClass(randColors[randIndex]);
	$('.full-background').css({
		'height': h+'px'
	});

	$('#basketLogo').fadeIn();
	
	$('#basketGlasses').delay(1000).animate({
		'opacity':'1',
		'top':'0',
	},1500);

	
	$('#aboutModalBtn, #loginModalBtn, #registerModalBtn').css({ 'color': randColors[randIndex] });

	Meteor.setTimeout(function(){
		frameLooper();
	}, 1550);

});