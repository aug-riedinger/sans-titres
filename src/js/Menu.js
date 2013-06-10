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

	for (var i = 0; i < artsMenu.length; i++) {
		if (criteria.type === 'all' || criteria.type === artsMenu[i].type) {
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
		if (el1[criteria.sort] < el2[criteria.sort]) return -1;
		if (el1[criteria.sort] > el2[criteria.sort]) return 1;

		return 0;
	});

	formerCriteria = arts[0][criteria.sort];
	artGroup.push(arts[0]);

	for (i = 1; i < arts.length; i++) {
		art = arts[i];
		if (formerCriteria !== art[criteria.sort]) {
			el = $('<li class="left">' + criteria.label(arts[i - 1]) + '</li>');
			ul = $('<ul class="full_info" id="' + criteria.sort + '-' + arts[i - 1][criteria.sort] + '"></ul>');

			for (j = 0; j < artGroup.length; j++) {
				ul.append('<li id="' + artGroup[j].room + '-' + artGroup[j].artId + '"><a class="enter" href="/#!room=' + artGroup[j].room + '&art=' + artGroup[j].artId + '">' + (artGroup[j].info.titre || 'sans titre') + '</a> <span class="small">' + (artGroup[j].info.ensemble || '') + ' ' + (artGroup[j].info.description || '') + '</span></li');
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

	el = $('<li class="left">' + criteria.label(arts[i - 1]) + '</li>');
	ul = $('<ul class="full_info" id="' + criteria.sort + '-' + arts[i - 1][criteria.sort] + '"></ul>');

	for (j = 0; j < artGroup.length; j++) {
		ul.append('<li id="' + artGroup[j].room + '-' + artGroup[j].artId + '"><a class="enter" href="/#!room=' + artGroup[j].room + '&art=' + artGroup[j].artId + '">' + (artGroup[j].info.titre || 'sans titre') + '</a> <span class="small">' + (artGroup[j].info.ensemble || '') + ' ' + (artGroup[j].info.description || '') + '</span></li');
	}

	$(el).append(ul);

	artGroups.push({
		criteria: formerCriteria,
		el: el,
		arts: artGroup
	});

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

			showCircles(this.arts);

		}, artGroup));

		$('#content_list').append(artGroup.el);

	});

	// $('#content_list').tinyscrollbar();

};


$.getJSON('numero0/artList.json', function(data) {
	var i;
	this.artsMenu = data;

	this.criteria = {
		type: 'all',
		sort: 'artistId',
		label: function(art) {
			if (this.sort === 'artistId') {
				return art.info.artiste;
			}
			if (this.sort === 'room') {
				return '<a href="#!room=' + art.room + '" class="enter">Salle ' + art.room + '</a>';
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
	map.clear();
	if (camera) {
		setPosition(camera.x.value / params.unit * ratio, 479 - camera.z.value / params.unit * ratio);
	}

	$.each(arts, function(index, art) {
		art.circle = map.circle(art.x * ratio, 479 - art.z * ratio, 5);

		if (art.type === 'text') {
			art.circle.attr("fill", "purple");
		}
		if (art.type === 'image') {
			art.circle.attr("fill", "green");
		}
		if (art.type === 'video') {
			art.circle.attr("fill", "blue");
		}
		if (art.type === 'sound') {
			art.circle.attr("fill", "yellow");
		}

		art.circle.attr("stroke", "#fff");

		art.circle.attr('href', '/#!room=' + art.room + '&art=' + art.artId);

		art.circle.click($.proxy(function() {
			enterMuseum(this.room);
		}, art));

		art.circle.hover(circleHover, circleOutHover);

		$('#' + art.room + '-' + art.artId).hover($.proxy(circleHover, art.circle), $.proxy(circleOutHover, art.circle));

	});

};

var setPosition = function(x, z) {
	if (x && z) {
		var cross_size = 5;
		var path = 'M' + (x - cross_size) + ',' + (z - cross_size) + 'L' + (x + cross_size) + ',' + (z + cross_size) + 'M' + (x + cross_size) + ',' + (z - cross_size) + 'L' + (x - cross_size) + ',' + (z + cross_size);
		var cross = map.path(path);
		cross.attr('stroke', 'red');
		cross.attr('stroke-width', 3);
	}
};

var enterMuseum = function(roomId) {
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;

	if (rooms.length && rooms[0].id === roomId) {
		rooms[0].enter();
		run();
	} else {
		rooms = [];
		init(roomId);
	}

	$('#minimap').click(enterMenu);

};


var enterMenu = function(e) {
	if (e) {
		e.preventDefault();
		console.log(e.srcElement);
		if (e.srcElement.id === 'minimap') {
			$('#visite').find('.drop_content').html('Retourner<br /> à la <br />visite');
		}
	}
	var ratio = 479 / 54;
	var i;
	$('#menu').fadeIn(1000);
	$('#screen').fadeOut(1000);
	MENU = true;

	map.clear();
	if (camera) {
		setPosition(camera.x.value / params.unit * ratio, 479 - camera.z.value / params.unit * ratio);
	}

	if (sounds.length) {
		for (i = 0; i < sounds.length; i++) {
			sounds[i].audio.pause();
		}
	}


	// $('.enter').live('click', function(e) {
	$('.enter').click(function(e) {
		var room;

		room = parseInt(getParameters($(this).attr('href') || window.location.href).room, 10);
		if (room) {
			return enterMuseum(room);
		}

		if (rooms[0]) {
			return enterMuseum(rooms[0].id);
		}
		return enterMuseum(1);
	});

	return false;
};

var firstEnterMenu = function() {
	$('#intro').fadeOut(1000, function() {
		$(this).remove();
	});
	enterMenu();
	$.proxy(show_Page, $('.iframeLink[data-link="manifeste-editorial.html"]'))();

};


var show_Page = function() {
	$('#menuIframeView').attr('height', ($(this).attr('data-height') || '100%'));
	$('#menuIframeView').html('<iframe src="menu_pages/' + $(this).attr('data-link') + '" class="menu_page" height="' + ($(this).attr('data-height') || '100%') + '"></iframe>');
	$('#menuIframeView').append('<a class="rotate_3PM"><span>Sommaire<span></a>');
	$('#menuIframeView').fadeIn(1000);
	$('#menuIframeView a').one('click', function() {
		$('#menuIframeView').fadeOut(1000, function() {
			$('#menuIframeView').empty();
		});
	});
};

$('.iframeLink').click(function() {
	$.proxy(show_Page, $(this))();
});


$('.close').one('click', function(e) {

	$('#full-screen').fadeOut(1000, function() {
		$(this).remove();
	});
	$('#screen').focus();

	e.preventDefault();
	return false;
});

// $('#volume').live('click',function(e) {
$('#volume').click(function(e) {
	var i;
	if (!$('#volume').hasClass('muted')) {
		$('#volume').addClass('muted');
		for (i = 0; i < sounds.length; i++) {
			sounds[i].audio.pause();
		}
	} else {
		$('#volume').removeClass('muted');
		for (i = 0; i < sounds.length; i++) {
			if (sounds[i].playNow) {
				sounds[i].adjustVolume();
				sounds[i].audio.play();
			}
		}
	}
	e.preventDefault();
	return false;
});

var onload = function() {
	var room = parseInt(getParameters(window.location.href).room, 10);

	if (room) {
		$('#intro').remove();
		$('#menuIframeView').empty();
		enterMuseum(room);
	} else {
		$('#start').click(firstEnterMenu);
	}
};

onload();