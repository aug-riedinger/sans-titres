// ======= Room constructor ========
var Room = function(id, mainRoom) {
	this.id = id;
	this.mainRoom = mainRoom;
	this.arts = [];
	// this.sounds = [];
	this.adj = [];
	this.positions = [];
	this.tops = [];
	this.bottoms = [];
	this.lefts = [];
	this.rights = [];
	this.floors = [];
	this.images = [];
	this.texts = [];
	return this.load();
};

Room.prototype.load = function() {
	$.getJSON('numero0/salle' + this.id + '.json', $.proxy(function(data) {
		this.init(data);
		$(scr.container).trigger('loaded');
	}, this));
	return this;
};

Room.prototype.init = function(constr) {
	var i;
	var alreadyFound = false;
	this.name = constr.name || 'Room ' + this.id;
	this.position = constr.position;
	this.color = constr.color;
	this.map = constr.map;
	this.adj = constr.adj || [];
	this.colors = constr.colors || {};
	this.artsConstr = constr.arts || [];
	this.soundsConstr = constr.sounds || [];

	this.readMap();

	if(!this.startFloor) {
		this.startFloor = this.floors[parseInt(this.floors.length / 2, 10)];
	}

	this.makeSounds();

	for(i=0; i<rooms.length; i++){
		if(rooms[i].id === this.id) {
			alreadyFound = true;
			break;
		}
	}
	if(!alreadyFound) {
		rooms[rooms.length] = this;
	}

	return this;
};

Room.prototype.getElementsToRender = function() {
	var i, j, depth, depth2;
	var face;
	var toRender = [];
	var cptToRender = 0;

	for(depth in this.tops) {
		if(this.tops.hasOwnProperty(depth)) {
			for(depth2 in this.tops[depth]) {
				if(this.tops[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.tops[depth][depth2], 'top', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.bottoms) {
		if(this.bottoms.hasOwnProperty(depth)) {
			for(depth2 in this.bottoms[depth]) {
				if(this.bottoms[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.bottoms[depth][depth2], 'bottom', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.lefts) {
		if(this.lefts.hasOwnProperty(depth)) {
			for(depth2 in this.lefts[depth]) {
				if(this.lefts[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.lefts[depth][depth2], 'left', this.colors);
					cptToRender += 1;
				}
			}
		}
	}
	for(depth in this.rights) {
		if(this.rights.hasOwnProperty(depth)) {
			for(depth2 in this.rights[depth]) {
				if(this.rights[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.rights[depth][depth2], 'right', this.colors);
					cptToRender += 1;
				}
			}
		}
	}

	for(i = 0; i < this.arts.length; i++) {
		face = this.arts[i];
		face.projection();
		if(face.visible) {
			toRender[cptToRender] = {
				type: 'art',
				distance: this.arts[i].distance * 0.6,
				// A corriger
				art: this.arts[i]
			};
			cptToRender += 1;
		}
	}

	return toRender;
};


Room.prototype.isTop = function(charType) {
	return(charType === '#' || charType === '-' || charType === '+') || false;
};
Room.prototype.isBottom = function(charType) {
	return(charType === '%' || charType === '_' || charType === '¤') || false;
};
Room.prototype.isLeft = function(charType) {
	return(charType === '#' || charType === '|' || charType === '%') || false;
};
Room.prototype.isRight = function(charType) {
	return(charType === '+' || charType === '!' || charType === '¤') || false;
};
Room.prototype.isInside = function(charType) {
	return(charType !== '.') || false;
};
Room.prototype.isNoWall = function(charType) {
	return(charType === ',') || false;
};

Room.prototype.getArtConstr = function(artId) {
	var artConstr;
	var artConstrs = [];
	for(var i = 0; i < this.artsConstr.length; i++) {
		artConstr = this.artsConstr[i];
		if(artConstr.id[0] === artId) {
			artConstrs.push(artConstr);
		}
	}
	return artConstrs;
};

Room.prototype.readMap = function() {
	var h, w, x, z;
	var charType, artId, next;
	var artConstr, artConstrs;
	var top, bottom, left, right, floor, art;

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		for(w = 0; w < this.map[h].length; w += 2) {
			// Get Vars
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			artId = next.replace(/^[^a-zA-Z0-9]$/, '');


			if(this.isInside(charType)) {

				top = this.putFaceToWall(this.tops, this.isTop(charType), z, faceMaker.top(this, x, z));
				bottom = this.putFaceToWall(this.bottoms, this.isBottom(charType), z, faceMaker.bottom(this, x, z));
				left = this.putFaceToWall(this.lefts, this.isLeft(charType), x, faceMaker.left(this, x, z));
				right = this.putFaceToWall(this.rights, this.isRight(charType), x, faceMaker.right(this, x, z));

				floor = faceMaker.floor(this, x, z, [top, bottom, left, right], undefined);
				this.floors.push(floor);

				if(next === '@') {
					this.startFloor = floor;
				}
				art = undefined;
				artConstr = undefined;
				if(artId !== '') {
					artConstrs = this.getArtConstr(artId, charType);

					for(i=0; i<artConstrs.length; i++) {
						artConstr = artConstrs[i];

						if(this.isTop(artConstr.side || charType)) {
							art = faceMaker.art(this, top || faceMaker.top(this, x, z), artConstr);
							this.arts.push(art);
							this.floors[this.floors.length-1].f.art = art;
						}
						if(this.isBottom(artConstr.side || charType)) {
							art = faceMaker.art(this, bottom || faceMaker.bottom(this, x, z), artConstr);
							this.arts.push(art);
							this.floors[this.floors.length-1].f.art = art;
						}
						if(this.isLeft(artConstr.side || charType)) {
							art = faceMaker.art(this, left || faceMaker.left(this, x, z), artConstr);
							this.arts.push(art);
							this.floors[this.floors.length-1].f.art = art;
						}
						if(this.isRight(artConstr.side || charType)) {
							art = faceMaker.art(this, right || faceMaker.right(this, x, z), artConstr);
							this.arts.push(art);
							this.floors[this.floors.length-1].f.art = art;
						}
						if(this.isNoWall(artConstr.side || charType)) {
							if(artConstr.type === 'monolythe') {
								art = new Monolythe(floor, artConstr);
								floor.f.select = false;
								this.arts = this.arts.concat(art.faces);
							}
							
						}

					}

				}
				// floor = faceMaker.floor(this, x, z, [top, bottom, left, right], art);

			}

		}
	}
};


Room.prototype.putFaceToWall = function(wall, test, dim, face) {
	if(test) {
		if(!wall[dim]) {
			wall[dim] = [];
		}
		if(wall[dim].length === 0) {
			wall[dim].push([]);
		}
		wall[dim][wall[dim].length - 1].push(face);
		return face;
	} else {
		if(wall[dim] && (wall[dim].length === 0 || wall[dim][wall[dim].length - 1].length !== 0)) {
			wall[dim].push([]);
		}
		return null;
	}
};

Room.prototype.makeSounds = function() {
	var i, j;
	var sound;
	for(i = 0; i < this.soundsConstr.length; i++) {
		for (j=0; j<sounds.length; j++) {
			if(this.soundsConstr[i].id === sounds[j].id) {
				sounds[j].startRoom.push(this.id);
				sound = sounds[j];
			}
		}
		if(!sound) {
			sounds.push(new Sound(this, this.soundsConstr[i]));
		}
	}
};

Room.prototype.enter = function() {
	var sound;
	var i, j;
	var toPlay;
	var showMuter = false;
	var inStartRoom = false;

	// The sound comes from this room ==> play it
	for(j=0; j<sounds.length; j++) {
		for(i=0; i<sounds[j].startRoom.length; i++) {
			if(sounds[j].startRoom[i] === this.id) {
				sounds[j].playNow = true;
				showMuter = true;
				inStartRoom = true;
			}
		}
		if(!inStartRoom) {
			// The sound is already playing
			if(sounds[j].playNow) {
				sounds[j].playNow = false;
				for(i=0; i<sounds[j].rooms.length; i++) {
					// And we enter in a continuing room ...
					if(sounds[j].rooms[i] === this.id) {
						sounds[j].playNow = true;
						showMuter = true;
					}
				}
			}

		}

		if(!sounds[j].playNow && !sounds[j].audio.paused) {
			sounds[j].audio.pause();
		}

		if(sounds[j].playNow && sounds[j].audio.paused && !$('#volume').hasClass('muted')) {
			sounds[j].adjustVolume();
			sounds[j].audio.play();
		}
	}


	if(showMuter && $('#volume').css('display') === 'none') {
		$('#volume').fadeIn(1000);
	}

	if(!showMuter && $('#volume').css('display') !== 'none') {
		$('#volume').fadeOut(1000);
	}

	_gaq.push(['_trackEvent', 'room '+this.id]);

};

Room.prototype.exit = function(newRoomId) {
};