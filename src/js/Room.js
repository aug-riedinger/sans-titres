// ======= Room constructor ========
var Room = function(id, mainRoom) {
	this.id = id;
	this.mainRoom = mainRoom;
	this.arts = [];
	this.sounds = [];
	this.adj = [];
	this.positions = [];
	this.tops = [];
	this.bottoms = [];
	this.lefts = [];
	this.rights = [];
	this.ceilings = [];
	this.floors = [];
	this.walls = [];
	this.doors = [];
	this.images = [];
	this.texts = [];
	this.ready = false;
	return this;
};

Room.prototype.load = function() {
	$.getJSON('/rooms/room' + this.id + '.json', $.proxy(function(data) {
		this.init(data);
		$(scr.container).trigger('loaded');
	}, this));
	return this;
};

Room.prototype.init = function(constr) {
	this.name = constr.name;
	this.path = constr.path;
	this.position = constr.position;
	this.map = constr.map;
	this.color = constr.color;
	this.doorsConstr = constr.doors || [];
	this.artsConstr = constr.arts || [];
	this.soundsConstr = constr.sounds || [];

	this.readMap();
	if(this.mainRoom) {
		this.loadAdj();
		this.makeSounds();
	}
	this.ready = true;
	return this;
};

Room.prototype.render = function() {
	var i, j, depth, depth2;
	var face, door;
	var toRender = [];
	var points;

	if(this.ready) {

		if(this.mainRoom) {
			this.renderAdj();
		}


		for(i = 0; i < this.floors.length; i++) {
			points = getEdges(this.floors[i], 'y');
			points.type = 'floor';
			points.color = this.color || '#80827d';
			renderer.facesMerged(points);

			for (j=0; j < this.floors[i].length; j++ ) {
				face = this.floors[i][j];
				if(cursor.aimedFace && face.f.id === cursor.aimedFace.f.id) {
					scr.ctx.beginPath();
					scr.ctx.lineTo(face.p0.X, face.p0.Y);
					scr.ctx.lineTo(face.p1.X, face.p1.Y);
					scr.ctx.lineTo(face.p2.X, face.p2.Y);
					scr.ctx.lineTo(face.p3.X, face.p3.Y);
					scr.ctx.closePath();
					scr.ctx.strokeStyle = '#000000';
					scr.ctx.stroke();
				}
				
			}
		}

		if (this.mainRoom) {
			for(i = 0; i < this.positions.length; i++) {
				face = this.positions[i];
				face.projection();
				if(face.visible) {
					face.render();
				}
			}
		}

		for(depth in this.tops) {
			if(this.tops.hasOwnProperty(depth)) {
				for(depth2 in this.tops[depth]) {
					if(this.tops[depth].hasOwnProperty(depth2)) {
						points = getEdges(this.tops[depth][depth2], 'z');
						points.type = 'wall';
						points.color = this.color || '#E9E9E9';
						points.color2 = (this.mainRoom && !this.color ?'#F9F9F9': undefined);
						toRender.push(points);
					}
				}
			}
		}
		for(depth in this.bottoms) {
			if(this.bottoms.hasOwnProperty(depth)) {
				for(depth2 in this.bottoms[depth]) {
					if(this.bottoms[depth].hasOwnProperty(depth2)) {
						points = getEdges(this.bottoms[depth][depth2], 'z');
						points.type = 'wall';
						points.color = this.color || '#E9E9E9';
						points.color2 = (this.mainRoom && !this.color ?'#F9F9F9': undefined);
						toRender.push(points);
					}
				}
			}
		}
		for(depth in this.lefts) {
			if(this.lefts.hasOwnProperty(depth)) {
				for(depth2 in this.lefts[depth]) {
					if(this.lefts[depth].hasOwnProperty(depth2)) {
						points = getEdges(this.lefts[depth][depth2], 'x');
						points.type = 'wall';
						points.color = this.color || '#D9D9D9';
						points.color2 = (this.mainRoom && !this.color ?'#F9F9F9': undefined);
						toRender.push(points);
					}
				}
			}
		}
		for(depth in this.rights) {
			if(this.rights.hasOwnProperty(depth)) {
				for(depth2 in this.rights[depth]) {
					if(this.rights[depth].hasOwnProperty(depth2)) {
						points = getEdges(this.rights[depth][depth2], 'x');
						points.type = 'wall';
						points.color = this.color || '#D9D9D9';
						points.color2 = (this.mainRoom && !this.color ?'#F9F9F9': undefined);
						toRender.push(points);
					}
				}
			}
		}

		if(this.mainRoom) {
			for(i = 0; i < this.arts.length; i++) {
				face = this.arts[i];
				face.projection();
				if(face.visible) {
					toRender.push({
						type: 'art',
						distance: this.arts[i].distance,
						art: this.arts[i]
					});
				}
			}
		}

		toRender.sort(function(points1, points2) {
			return points2.distance - points1.distance;
		});

		for(i=0; i< toRender.length; i++) {
			if(toRender[i].type === 'wall') {
				renderer.facesMerged(toRender[i]);
			}
			if(toRender[i].type === 'art') {
				toRender[i].art.render();
			}
		}

	}

};

Room.prototype.inside = function(_x, _z, big) {
	var x, z;
	if(big) {
		x = Math.round(_x / params.unit) - (this.position.x || 0);
		z = Math.round((_z - params.focalLength) / params.unit) - (this.position.z || 0);
	} else {
		x = Math.round(_x) - this.position.x;
		z = Math.round(_z) - this.position.z;
	}

	return(true && this.map[this.map.length - (z + 1)] && this.map[this.map.length - (z + 1)][2 * x] && this.map[this.map.length - (z + 1)][2 * x] != '.');
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

Room.prototype.getDoorConstr = function(doorId) {
	var doorConstr;
	for(var i = 0; i < this.doorsConstr.length; i++) {
		doorConstr = this.doorsConstr[i];
		if(doorConstr.id === doorId) {
			return doorConstr;
		}
	}
	console.log('DoorId not found');
	return undefined;
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
	var x, z;
	var charType, doorId, artId;
	var doorConstr, artConstr;
	var top, bottom, left, right, floor, door, art, position;

	this.floors = this.makeFloor();

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		for(w = 0; w < this.map[h].length; w += 2) {
			// Get Vars
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			doorId = next.replace(/^[^0-9]$/, '');
			artId = next.replace(/^[^a-zA-Z]$/, '');

			if(doorId !== '') {
				doorConstr = this.getDoorConstr(doorId);
			} else {
				doorConstr = {};
			}

			// Top maker
			if(this.isTop(charType)) {
				if(!this.tops[z]) {
					this.tops[z] = [];
				}
				top = faceMaker.top(this, x, z);
				if(this.isTop(doorConstr.side)) {
					// New Door
					this.doors.push(faceMaker.door(this, top, doorConstr));
					if(this.tops[z].length === 0 || this.tops[z][this.tops[z].length - 1].length !== 0) {
						this.tops[z].push([]);
					}
				} else {
					if(this.tops[z].length === 0) {
						this.tops[z].push([]);
					}
					// New Top
					this.tops[z][this.tops[z].length - 1].push(top);
					this.walls.push(top);
				}
			}

			// Bottom maker
			if(this.isBottom(charType)) {
				if(!this.bottoms[z]) {
					this.bottoms[z] = [];
				}
				bottom = faceMaker.bottom(this, x, z);
				if(this.isBottom(doorConstr.side)) {
					this.doors.push(faceMaker.door(this, bottom, doorConstr));
					if(this.bottoms[z].length === 0 || this.bottoms[z][this.bottoms[z].length - 1].length !== 0) {
						this.bottoms[z].push([]);
					}
				} else {
					if(this.bottoms[z].length === 0) {
						this.bottoms[z].push([]);
					}
					this.bottoms[z][this.bottoms[z].length - 1].push(bottom);
					this.walls.push(bottom);
				}
			}

			// Left maker
			if(this.isLeft(charType)) {
				if(!this.lefts[x]) {
					this.lefts[x] = [];
				}
				left = faceMaker.left(this, x, z);
				if(this.isLeft(doorConstr.side)) {
					this.doors.push(faceMaker.door(this, left, doorConstr));
					if(this.lefts[x].length === 0 || this.lefts[x][this.lefts[x].length - 1].length !== 0) {
						this.lefts[x].push([]);
					}
				} else {
					if(this.lefts[x].length === 0) {
						this.lefts[x].push([]);
					}
					this.lefts[x][this.lefts[x].length - 1].push(left);
					this.walls.push(left);
				}
			}
			// Right maker
			if(this.isRight(charType)) {
				if(!this.rights[x]) {
					this.rights[x] = [];
				}
				right = faceMaker.right(this, x, z);
				if(this.isRight(doorConstr.side)) {
					this.doors.push(faceMaker.door(this, right, doorConstr));
					if(this.rights[x].length === 0 || this.rights[x][this.rights[x].length - 1].length !== 0) {
						this.rights[x].push([]);
					}
				} else {
					if(this.rights[x].length === 0) {
						this.rights[x].push([]);
					}
					this.rights[x][this.rights[x].length - 1].push(right);
					this.walls.push(right);
				}
			}

			if(artId !== '') {
				artConstr = this.getArtConstr(artId);
				if(this.isTop(artConstr.side || charType)) {
					art = faceMaker.art(this, top, artConstr);
					art.buffer(this);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, art));
				}
				if(this.isBottom(artConstr.side || charType)) {
					art = faceMaker.art(this, bottom, artConstr);
					art.buffer(this);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, art));
				}

				if(this.isLeft(artConstr.side || charType)) {
					art = faceMaker.art(this, left, artConstr);
					art.buffer(this);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, art));
				}
				if(this.isRight(artConstr.side || charType)) {
					art = faceMaker.art(this, right, artConstr);
					art.buffer(this);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, art));
				}

			}

		}
	}
};



Room.prototype.makeFloor = function() {
	var h, w, x, z;
	var minx, maxx;
	var oldminx, oldmaxx;
	var floor;
	var line;
	var blocks = [];


	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		minx = this.map[h].length;
		maxx = -1;
		line = [];
		for(w = 0; w < this.map[h].length; w += 2) {
			x = w / 2;
			if(this.isInside(this.map[h][w])) {
				if(minx > x) {
					minx = x;
				}
				if(maxx < x) {
					maxx = x;
				}
				line.push(faceMaker.floor(this, x, z));

			}

		}

		if((minx !== oldminx || maxx !== oldmaxx)) {
			blocks.push(line);
		} else {
			blocks[blocks.length-1] = blocks[blocks.length-1].concat(line);
		}
		oldminx = minx;
		oldmaxx = maxx;
	}
	return blocks;
};




Room.prototype.getWall = function(_x, _z, type) {
	var ar;
	var res = [];
	for(var i = 0; i < this.walls.length; i++) {
		ar = this.walls[i].f.id.split(':');
		if(parseInt(ar[1], 10) === _x && parseInt(ar[2], 10) === _z) {
			res[res.length] = this.walls[i];
		}
	}
	if(res.length === 1 || (!type && res.length > 0)) {
		return res[0];
	} else {
		for(var j = 0; j < res.length; j++) {
			if(type === res[j].f.id.split(':')[3]) {
				return res[i];
			}
		}
	}
	console.log('Face Not Found');
	return null;
},

Room.prototype.makeArt = function(id, potentialWalls) {
	var art, wall;
	for(var i = 0; i < this.artsConstr.length; i++) {
		art = this.artsConstr[i];
		if(art.id === id) {

			if(potentialWalls.length === 1) {
				wall = potentialWalls[0];
			} else {
				for(var j = 0; j < potentialWalls.length; j++) {
					if(potentialWalls[j].f.type === art.side) {
						wall = potentialWalls[j];
					}
				}
			}

			if(wall !== undefined) {
				if(art.type === 'txt') {
					return this.arts.push(faceMaker.txt(this, wall, art.width, art.height, art.thumb, art.src));
				}
				if(art.type === 'image') {
					return this.arts.push(faceMaker.image(this, wall, art.width, art.height, art.thumb, art.src));
				}

			}

		}
	}
	console.log('ArtId not found');
	return false;
};

Room.prototype.makeDoor = function(id, potentialWalls) {
	var door;
	for(var i = 0; i < this.doorsConstr.length; i++) {
		door = this.doorsConstr[i];
		if(door.id === id) {
			if(potentialWalls.length === 1 || door.side === undefined) {
				wall = potentialWalls[0];
			} else {
				for(var j = 0; j < potentialWalls.length; j++) {
					if(potentialWalls[j].f.type === door.side) {
						wall = potentialWalls[j];
					}
				}
			}
			if(wall !== undefined) {
				wall.doorTo = door.to;
				door.face = faceMaker.door(this, wall, door.to);
				return this.doors.push(door);
			}
		}
	}
	console.log('DoorId not found');
	return false;
};

Room.prototype.makeSounds = function() {
	var sound;
	for(var i = 0; i < this.soundsConstr.length; i++) {
		sound = this.soundsConstr[i];
		this.sounds.push(new Sound(sound));
	}
};

Room.prototype.loadAdj = function() {
	for(var i = 0; i < this.doorsConstr.length; i++) {
		this.adj.push(new Room(this.doorsConstr[i].to, false).load());
	}
};

Room.prototype.renderAdj = function() {
	for(var i = 0; i < this.adj.length; i++) {
		this.adj[i].render();
	}
};

Room.prototype.wallMaker = function(charType, _x, _z) {
	var wall;
	var potentialWalls = [];
	if(this.wallE[charType].top) {
		if(!this.tops.hasOwnProperty(_z)) {
			this.tops[_z] = [];
		}
		wall = faceMaker.top(this, _x, _z);
		this.tops[_z].push(wall);
		this.walls.push(wall);
		potentialWalls.push(wall);
	}
	if(this.wallE[charType].bottom) {
		if(!this.bottoms.hasOwnProperty(_z)) {
			this.bottoms[_z] = [];
		}
		wall = faceMaker.bottom(this, _x, _z);
		this.bottoms[_z].push(wall);
		this.walls.push(wall);
		potentialWalls.push(wall);
	}
	if(this.wallE[charType].left) {
		if(!this.lefts.hasOwnProperty(_x)) {
			this.lefts[_x] = [];
		}
		wall = faceMaker.left(this, _x, _z);
		this.lefts[_x].push(wall);
		this.walls.push(wall);
		potentialWalls.push(wall);
	}
	if(this.wallE[charType].right) {
		if(!this.rights.hasOwnProperty(_x)) {
			this.rights[_x] = [];
		}
		wall = faceMaker.right(this, _x, _z);
		this.rights[_x].push(wall);
		this.walls.push(wall);
		potentialWalls.push(wall);
	}
	if(this.wallE[charType].ceiling) {
		if(!this.ceilings.hasOwnProperty(0)) {
			this.ceilings[0] = [];
		}
		wall = faceMaker.ceiling(this, _x, _z);
		this.ceilings[0].push(wall);
	}
	if(this.wallE[charType].floor) {
		if(!this.floors.hasOwnProperty(0)) {
			this.floors[0] = [];
		}
		wall = faceMaker.floor(this, _x, _z);
		this.floors[0].push(wall);
	}

	return potentialWalls;
};


// "#---------+.",
// "|.,.,.,.,.!.",
// "|0,.,.,.,.!.",
// "%_________¤1"
Room.prototype.wallE = {
	'#': { // Top Left
		top: true,
		bottom: false,
		left: true,
		right: false,
		ceiling: true,
		floor: true
	},
	'+': { // Top Right
		top: true,
		bottom: false,
		left: false,
		right: true,
		ceiling: true,
		floor: true
	},
	'%': { // Bottom Left
		top: false,
		bottom: true,
		left: true,
		right: false,
		ceiling: true,
		floor: true
	},
	'¤': { // Bottom Right
		top: false,
		bottom: true,
		left: false,
		right: true,
		ceiling: true,
		floor: true
	},
	'-': { // Top
		top: true,
		bottom: false,
		left: false,
		right: false,
		ceiling: true,
		floor: true
	},
	'_': { // Bottom
		top: false,
		bottom: true,
		left: false,
		right: false,
		ceiling: true,
		floor: true
	},
	'|': { // Left
		top: false,
		bottom: false,
		left: true,
		right: false,
		ceiling: true,
		floor: true
	},
	'!': { // Right
		top: false,
		bottom: false,
		left: false,
		right: true,
		ceiling: true,
		floor: true
	},
	',': { // Inside
		top: false,
		bottom: false,
		left: false,
		right: false,
		ceiling: true,
		floor: true
	},
	'.': { // Outside
		top: false,
		bottom: false,
		left: false,
		right: false,
		ceiling: false,
		floor: false
	}
};