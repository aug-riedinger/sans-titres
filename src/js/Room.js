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
	$.getJSON('/numero0/room' + this.id + '.json', $.proxy(function(data) {
		this.init(data);
		$(scr.container).trigger('loaded');
	}, this));
	return this;
};

Room.prototype.init = function(constr) {
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
	rooms[rooms.length] = this;
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
				distance: this.arts[i].distance * 0.5,
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
	for(var i = 0; i < this.artsConstr.length; i++) {
		artConstr = this.artsConstr[i];
		if(artConstr.id === artId) {
			return artConstr;
		}
	}
	console.log('artId not found');
	return undefined;
};

Room.prototype.readMap = function() {
	var h, w, x, z;
	var charType, artId, next;
	var artConstr;
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


				art = undefined;
				artConstr = undefined;
				if(artId !== '') {
					artConstr = this.getArtConstr(artId);
					if(this.isTop(artConstr.side || charType)) {
						art = faceMaker.art(this, top, artConstr);
						this.arts.push(art);
					}
					if(this.isBottom(artConstr.side || charType)) {
						art = faceMaker.art(this, bottom, artConstr);
						this.arts.push(art);
					}
					if(this.isLeft(artConstr.side || charType)) {
						art = faceMaker.art(this, left, artConstr);
						this.arts.push(art);
					}
					if(this.isRight(artConstr.side || charType)) {
						art = faceMaker.art(this, right, artConstr);
						this.arts.push(art);
					}


				}
				floor = faceMaker.floor(this, x, z, [top, bottom, left, right], art);
				if(next === '@') {
					this.startFloor = floor;
				}

				if(artConstr && artConstr.type === 'monolythe') {
					art = new Monolythe(floor, artConstr);
					floor.f.select = false;
					this.arts = this.arts.concat(art.faces);
				}

				this.floors.push(floor);
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
			if(this.soundsConstr[i].src === sounds[j].audio.src) {
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
	var i;
	var toPlay;
	var showMuter = false;

	for(j=0; j<sounds.length; j++) {
		toPlay = false;
		for(i=0; i<sounds[j].rooms.length; i++) {
			if(sounds[j].rooms[i] === this.id) {
				toPlay = true;
				showMuter = true;
			}
		}
		if(!toPlay && !sounds[j].audio.paused) {
			sounds[j].audio.pause();
		}

		if(toPlay && sounds[j].audio.paused && sounds[j].autoPlay) {
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


};

Room.prototype.exit = function(newRoomId) {
	// var i, j;
	// var keepPlaying;
	// for(i = 0; i < this.sounds.length; i++) {
	// 	keepPlaying = false;
	// 	for(j = 0; j < this.sounds[i].rooms.length; j++) {
	// 		if(this.sounds[i].rooms[j] === newRoomId) {
	// 			keepPlaying = true;
	// 		}
	// 	}
	// 	if(!keepPlaying) {
	// 		$('#volume').fadeOut(1000);
	// 		this.sounds[i].audio.pause();
	// 	} else {
	// 		soundsToKeepPlaying.push(this.sounds[i]);
	// 	}
	// }
	// console.log(soundsToKeepPlaying);
	// return soundsToKeepPlaying;
};