var MENU = true;
var artsMenu;

$('#visite').click(function(e) {
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;
	run();
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

	artsMenu = arts;

	for(i = 0; i < artsMenu.length; i++) {
		art = artsMenu[i];
		art.circle = map.circle(art.x*ratio, 479 - art.z*ratio, 3);

		if(art.type === 'text') {
			art.circle.attr("fill", "#f00");
		}
		if(art.type === 'image') {
			art.circle.attr("fill", "#0F0");
		}
		if(art.type === 'video') {
			art.circle.attr("fill", "#00F");
		}

		art.circle.attr("stroke", "#fff");

		art.circle.hover(circleHover, circleOutHover);

	}

};

$.getJSON('/numero0/artList.json', showList);