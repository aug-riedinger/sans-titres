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
	$.getJSON('/numero0/room' + this.id + '.json', $.proxy(function(data) {
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
			renderer.renderFloor();
			this.renderAdj();
		}


		for(i = 0; i < this.floors.length; i++) {
			// points = getEdges(this.floors[i], 'y');
			// points.type = 'floor';
			// points.color = this.color || '#80827d';
			// renderer.facesMerged(points);

			if(cursor.aimedFace) {
				for(j = 0; j < this.floors[i].length; j++) {
					face = this.floors[i][j];
					if(face.f.id === cursor.aimedFace.f.id) {
						face.projection();
						scr.ctx.beginPath();
						scr.ctx.lineTo(face.p0.X, face.p0.Y);
						if(!cursor.aimedFace.f.art) {
							scr.ctx.lineTo((face.p0.X*5+face.p1.X)/6, (face.p0.Y*5+face.p1.Y)/6);
							scr.ctx.moveTo((face.p0.X+face.p1.X*5)/6, (face.p0.Y+face.p1.Y*5)/6);
						}
						scr.ctx.lineTo(face.p1.X, face.p1.Y);
						if(!cursor.aimedFace.f.art) {
							scr.ctx.lineTo((face.p1.X*5+face.p2.X)/6, (face.p1.Y*5+face.p2.Y)/6);
							scr.ctx.moveTo((face.p1.X+face.p2.X*5)/6, (face.p1.Y+face.p2.Y*5)/6);
						}
						scr.ctx.lineTo(face.p2.X, face.p2.Y);
						if(!cursor.aimedFace.f.art) {
							scr.ctx.lineTo((face.p2.X*5+face.p3.X)/6, (face.p2.Y*5+face.p3.Y)/6);
							scr.ctx.moveTo((face.p2.X+face.p3.X*5)/6, (face.p2.Y+face.p3.Y*5)/6);
						}
						scr.ctx.lineTo(face.p3.X, face.p3.Y);
						if(!cursor.aimedFace.f.art) {
							scr.ctx.lineTo((face.p3.X*5+face.p0.X)/6, (face.p3.Y*5+face.p0.Y)/6);
							scr.ctx.moveTo((face.p3.X+face.p0.X*5)/6, (face.p3.Y+face.p0.Y*5)/6);
						}
						scr.ctx.lineTo(face.p0.X, face.p0.Y);
						scr.ctx.closePath();
						if(cursor.aimedFace.f.art) {
							scr.ctx.fillStyle = '#70726D';
							scr.ctx.fill();
						} else {
							scr.ctx.strokeStyle = '#70726D';
							scr.ctx.stroke();
						}
					}

				}
				
			}
		}

		if(this.mainRoom) {
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
						points.color2 = (this.mainRoom && !this.color ? '#F9F9F9' : undefined);
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
						points.color2 = (this.mainRoom && !this.color ? '#F9F9F9' : undefined);
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
						points.color2 = (this.mainRoom && !this.color ? '#F9F9F9' : undefined);
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
						points.color2 = (this.mainRoom && !this.color ? '#F9F9F9' : undefined);
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

		for(i = 0; i < toRender.length; i++) {
			if(toRender[i].type === 'wall') {
				renderer.facesMerged(toRender[i]);
			}
			if(toRender[i].type === 'art') {
				face = toRender[i].art;
				face.render();
				// if(cursor.aimedFace && face.f.id === cursor.aimedFace.f.id) {
				// 	scr.ctx.beginPath();
				// 	scr.ctx.moveTo(face.p0.X, face.p0.Y);
				// 	scr.ctx.moveTo((face.p0.X*5+face.p1.X)/6, (face.p0.Y*5+face.p1.Y)/6);
				// 	scr.ctx.lineTo((face.p0.X+face.p1.X*5)/6, (face.p0.Y+face.p1.Y*5)/6);
				// 	scr.ctx.moveTo(face.p1.X, face.p1.Y);
				// 	scr.ctx.moveTo((face.p1.X*5+face.p2.X)/6, (face.p1.Y*5+face.p2.Y)/6);
				// 	scr.ctx.lineTo((face.p1.X+face.p2.X*5)/6, (face.p1.Y+face.p2.Y*5)/6);
				// 	scr.ctx.moveTo(face.p2.X, face.p2.Y);
				// 	scr.ctx.moveTo((face.p2.X*5+face.p3.X)/6, (face.p2.Y*5+face.p3.Y)/6);
				// 	scr.ctx.lineTo((face.p2.X+face.p3.X*5)/6, (face.p2.Y+face.p3.Y*5)/6);
				// 	scr.ctx.moveTo(face.p3.X, face.p3.Y);
				// 	scr.ctx.moveTo((face.p3.X*5+face.p0.X)/6, (face.p3.Y*5+face.p0.Y)/6);
				// 	scr.ctx.lineTo((face.p3.X+face.p0.X*5)/6, (face.p3.Y+face.p0.Y*5)/6);
				// 	scr.ctx.moveTo(face.p0.X, face.p0.Y);
				// 	scr.ctx.closePath();
				// 	scr.ctx.strokeStyle = 'black';
				// 	scr.ctx.lineWidth = 1;
				// 	scr.ctx.stroke();
				// }
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

			if(artId !== '' && this.mainRoom) {
				artConstr = this.getArtConstr(artId);
				if(this.isTop(artConstr.side || charType)) {
					art = faceMaker.art(this, top, artConstr);
					art.buffer(this);
					this.arts.push(art);
					// this.positions.push(faceMaker.position(this, art));
				}
				if(this.isBottom(artConstr.side || charType)) {
					art = faceMaker.art(this, bottom, artConstr);
					art.buffer(this);
					this.arts.push(art);
					// this.positions.push(faceMaker.position(this, art));
				}

				if(this.isLeft(artConstr.side || charType)) {
					art = faceMaker.art(this, left, artConstr);
					art.buffer(this);
					this.arts.push(art);
					// this.positions.push(faceMaker.position(this, art));
				}
				if(this.isRight(artConstr.side || charType)) {
					art = faceMaker.art(this, right, artConstr);
					art.buffer(this);
					this.arts.push(art);
					// this.positions.push(faceMaker.position(this, art));
				}

			}

		}
	}

	this.floors = this.makeFloor();

};


Room.prototype.makeFloor = function() {
	var h, w, x, z, i;
	var minx, maxx;
	var oldminx, oldmaxx;
	var floor;
	var line;
	var blocks = [];
	var charType, next, artId;
	var art;
	var adj;
	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		minx = this.map[h].length;
		maxx = -1;
		line = [];
		for(w = 0; w < this.map[h].length; w += 2) {
			charType = this.map[h][w];
			if(this.isInside(charType)) {
				x = w / 2;
				next = this.map[h][w + 1];
				artId = next.replace(/^[^a-zA-Z]$/, '');
				adj = [];

				if(minx > x) {
					minx = x;
				}
				if(maxx < x) {
					maxx = x;
				}
				art = undefined;
				if (artId !== '' && this.mainRoom) {
					for(i=0; i<this.arts.length; i++) {
						if(this.arts[i].f.artId === artId) {
							art = this.arts[i];
							break;
						}
					}
				}

				if(this.isTop(charType)) {
					adj.push(faceMaker.top(this, x, z));
				}
				if(this.isBottom(charType)) {
					adj.push(faceMaker.bottom(this, x, z));
				}
				if(this.isLeft(charType)) {
					adj.push(faceMaker.left(this, x, z));
				}
				if(this.isRight(charType)) {
					adj.push(faceMaker.right(this, x, z));
				}

				line.push(faceMaker.floor(this, x, z, adj, art));
			}

		}

		if((minx !== oldminx || maxx !== oldmaxx)) {
			blocks.push(line);
		} else {
			blocks[blocks.length - 1] = blocks[blocks.length - 1].concat(line);
		}
		oldminx = minx;
		oldmaxx = maxx;
	}
	return blocks;
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
