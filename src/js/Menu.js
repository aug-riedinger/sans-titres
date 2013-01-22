var MENU = true;
var artsMenu = [];
var imagesMenu = [];
var soundsMenu = [];
var textsMenu = [];
var videosMenu = [];

$('#visite').click(function(e) {
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;
	run();
});

$('#menu_images').click(function(e){
	showList(imagesMenu);
});
$('#menu_sounds').click(function(e){
	showList(soundsMenu);
});
$('#menu_texts').click(function(e){
	showList(textsMenu);
});
$('#menu_videos').click(function(e){
	showList(videosMenu);
});

map = new Raphael(document.getElementById('map'), 479, 479);

var circleHover = function() {
	this.animate({r:7}, 1000, 'elastic');
};

var circleOutHover = function() {
	this.animate({r:3}, 1000, 'elastic');
};

var showList = function(arts) {
	var art;
	var ratio = 479/54;
	var i;
	var srcSplit;
	var fileName;

	artsMenu = arts;

	map.clear();
	$('#content_list_left').empty();

	for(i = 0; i < artsMenu.length; i++) {
		art = artsMenu[i];
		art.circle = map.circle(art.x*ratio, 479 - art.z*ratio, 3);

		srcSplit = art.src.split('/');
		fileName = srcSplit[srcSplit.length -1];

		if(art.type === 'text') {
			art.circle.attr("fill", "red");
		}
		if(art.type === 'image') {
			art.circle.attr("fill", "green");
		}
		if(art.type === 'video') {
			art.circle.attr("fill", "blue");
		}
		if(art.type === 'sound') {
			art.circle.attr("fill", "yellow");
		}

		art.circle.attr("stroke", "#fff");

		art.circle.attr('href', '/#!room='+art.room+'&art='+art.artId);

		art.circle.hover(circleHover, circleOutHover);

		$('#content_list_left').append('<li id="'+art.room+'-'+art.artId+'"><a href="/#!room='+art.room+'&art='+art.artId+'">'+fileName+'</a></li>');

		$('#'+art.room+'-'+art.artId).hover($.proxy(circleHover, art.circle), $.proxy(circleOutHover, art.circle));

	}

};

$.getJSON('/numero0/artList.json', function(data){
	var i;
	artsMenu = data;
	for(i=0; i< artsMenu.length; i++) {
		if(artsMenu[i].type === 'image') {
			imagesMenu.push(artsMenu[i]);
		}
		if(artsMenu[i].type === 'text') {
			textsMenu.push(artsMenu[i]);
		}
		if(artsMenu[i].type === 'sounds') {
			soundsMenu.push(artsMenu[i]);
		}
		if(artsMenu[i].type === 'video') {
			videosMenu.push(artsMenu[i]);
		}
	}
	showList(artsMenu);
});