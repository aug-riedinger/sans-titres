var MENU = true;
// var artsMenu = [];

map = new Raphael(document.getElementById('map'), 479, 479);

var circleHover = function() {
	this.animate({
		r: 10
	}, 1000, 'elastic');
};

var circleOutHover = function() {
	this.animate({
		r: 5
	}, 1000, 'elastic');
};

var filterType = function(artsMenu, criteria) {
	var res = [];

	for(var i=0; i<artsMenu.length; i++) {
		if(criteria.type === 'all' || criteria.type === artsMenu[i].type) {
			res.push(artsMenu[i]);
		}
	}
	return res;
};

var makeGroups = function(artsMenu, criteria) {
	var i, j;
	var formerCriteria;
	var artGroup = [];
	var artGroups = [];
	var art;

	arts = filterType(artsMenu, criteria).sort(function(el1, el2) {
		if(el1[criteria.sort] < el2[criteria.sort]) return -1;
		if(el1[criteria.sort] > el2[criteria.sort]) return 1;

		return 0;
	});

	formerCriteria = arts[0][criteria.sort];
	artGroup.push(arts[0]);

	for(i = 1; i < arts.length; i++) {
		art = arts[i];
		if(formerCriteria !== art[criteria.sort]) {
			el = $('<li class="left">'+criteria.label(arts[i-1])+'</li>');
			ul = $('<ul class="full_info" id="'+criteria.sort+'-'+art[criteria.sort]+'"></ul>');

			for(j=0; j<artGroup.length; j++) {
				ul.append('<li id="' + artGroup[j].room + '-' + artGroup[j].artId + '"><a href="/#!room=' + artGroup[j].room + '&art=' + artGroup[j].artId + '">' + (artGroup[j].info.titre || 'Inconnu') + '</a> <span class="small">' + (artGroup[j].info.description || 'Inconnu') + '</span></li');
			}

			$(el).append(ul);

			artGroups.push({
				criteria: formerCriteria,
				el: el,
				arts: artGroup
			});
			artGroup = [];
		}

		formerCriteria = art[criteria.sort];
		artGroup.push(art);
	}
	return artGroups;

};

var showList = function(artsMenu, criteria) {
	var i;
	var artGroups = makeGroups(artsMenu, criteria);

	$('#content_list').empty();

	$.each(artGroups, function(index, artGroup) {

		$(artGroup.el).hover($.proxy(function() {
			$('ul.full_info').stop().fadeOut(500);
			$(this.el).find('ul.full_info').stop().fadeIn(500);

			map.clear();
			showCircles(this.arts);

		}, artGroup));

		$('#content_list').append(artGroup.el);

	});

	// $('#content_list').tinyscrollbar();

};


$.getJSON('/numero0/artList.json', function(data) {
	var i;
	this.artsMenu = data;

	this.criteria = {
		type: 'all',
		sort: 'artistId',
		label: function(art) {
			if(this.sort === 'artistId') {
				return art.info.artiste;
			}
			if(this.sort === 'room') {
				return 'Salle '+art.room;
			}
		}
	};

	showList(this.artsMenu, this.criteria);

	// $('#menu_tous').addClass('active');
	$('#menu_participants').addClass('active');

	$('#menu_images').click($.proxy(function(e) {
		this.criteria.type = 'image';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_images').addClass('active');
		map.clear();
	}, this));
	$('#menu_sounds').click($.proxy(function(e) {
		this.criteria.type = 'sound';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_sounds').addClass('active');
		map.clear();
	}, this));
	$('#menu_texts').click($.proxy(function(e) {
		this.criteria.type = 'text';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_texts').addClass('active');
		map.clear();
	}, this));
	$('#menu_videos').click($.proxy(function(e) {
		this.criteria.type = 'video';
		showList(this.artsMenu, this.criteria);
		$('.menu_type').removeClass('active');
		$('#menu_videos').addClass('active');
		map.clear();
	}, this));

	$('#menu_participants').click($.proxy(function(e) {
		this.criteria.sort = 'artistId';
		this.criteria.type = 'all';
		showList(this.artsMenu, this.criteria);
		$('.menu_sort').removeClass('active');
		$('.menu_type').removeClass('active');
		$('#menu_participants').addClass('active');
		map.clear();
	}, this));

	$('#menu_salles').click($.proxy(function(e) {
		this.criteria.sort = 'room';
		this.criteria.type = 'all';
		showList(this.artsMenu, this.criteria);
		$('.menu_sort').removeClass('active');
		$('.menu_type').removeClass('active');
		$('#menu_salles').addClass('active');
		map.clear();
	}, this));

});

var showCircles = function(arts) {
	var ratio = 479 / 54;

	$.each(arts, function(index, art) {
		art.circle = map.circle(art.x * ratio, 479 - art.z * ratio, 5);

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

		art.circle.attr('href', '/#!room=' + art.room + '&art=' + art.artId);

		art.circle.hover(circleHover, circleOutHover);

		$('#' + art.room + '-' + art.artId).hover($.proxy(circleHover, art.circle), $.proxy(circleOutHover, art.circle));

	});

};

var enterMuseum = function() {
	var parameters = getParameters();
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;

	if(rooms[0].id === parseInt(parameters.room, 10)||1) {
		run();
	} else {
		init(parseInt(parameters.room, 10) || 1);
	}

};

$('a').click(enterMuseum);

$('#visite').click(enterMuseum);


