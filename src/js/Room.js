	// ======= Room constructor ========
	var Room = function (id, mainRoom) {
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
		return this;
	};

	Room.prototype.load = function() {
		var that = this;
		$.getJSON('/rooms/room'+this.id+'.json', function(data) {
			that.init(data);
			if(that.mainRoom) {
				if (camera) {
					camera.targetToFace(getFloor(parseInt(camera.x.value/params.unit - that.position.x, 10), parseInt(camera.z.value/params.unit - that.position.z, 10)));
				}
			}
			$(that).trigger('ready');
		});
		return this;
	};

	Room.prototype.init = function(constr) {
		this.name = constr.name;
		this.path = constr.path;
		this.position = constr.position;
		this.map = constr.map;
		this.color = constr.color;
		this.doorsConstr = constr.doors||[];
		this.artsConstr = constr.arts||[];
		this.soundsConstr = constr.sounds||[];

		this.readMap();
		// this.faces = this.tops.concat(this.bottoms, this.lefts, this.rights, this.ceilings, this.floors);

		if(this.mainRoom) {
			// this.makeArts(constr.arts);
			this.loadAdj();
			// this.makePositions();
			this.makeSounds();
		}
		return this;
	};

	Room.prototype.render = function() {
		var i, depth;
		var face, door;

		if(this.mainRoom) {
			this.renderAdj();
		}

		renderer.facesMerged(this.floors,'y', this.color||'#80827d');

		for (i=0; i<this.floors.length; i++) {
			face = this.floors[i];
			if (cursor.aimedFace && face.f.id === cursor.aimedFace.f.id) {
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

		for (i=0; i < this.positions.length; i++) {
			face = this.positions[i];
			face.projection();
			if( face.visible) {
				face.render();
			}
		}

		for (depth in this.tops) {
			if (this.tops.hasOwnProperty(depth)) {
				renderer.facesMerged(this.tops[depth],'z', this.color||'#f9f9f9', this.color||'#D9D9D9');
			}
		}


		for (depth in this.bottoms) {
			if (this.bottoms.hasOwnProperty(depth)) {
				renderer.facesMerged(this.bottoms[depth],'z', this.color||'#f9f9f9', this.color||'#D9D9D9');
			}
		}

		for (depth in this.lefts) {
			if (this.lefts.hasOwnProperty(depth)) {
				renderer.facesMerged(this.lefts[depth],'x', this.color||'#D9D9D9', this.color||'#f9f9f9');
			}
		}

		for (depth in this.rights) {
			if (this.rights.hasOwnProperty(depth)) {
				renderer.facesMerged(this.rights[depth],'x', this.color||'#D9D9D9', this.color||'#f9f9f9');
			}
		}

		for (i=0; i < this.arts.length; i++) {
			face = this.arts[i];
			face.projection();
			if( face.visible) {
				face.render();
			}
		}

	};

	Room.prototype.inside = function(_x,_z, big) {
		var x, z;
		if (big) {
			x = Math.round(_x/params.unit ) - (this.position.x||0);
			z = Math.round((_z - params.focalLength)/params.unit) - (this.position.z||0);
		} else {
			x = Math.round(_x) - this.position.x;
			z= Math.round(_z) - this.position.z;
		}

		return (true && this.map[this.map.length-(z+1)] && this.map[this.map.length-(z+1)][2*x] && this.map[this.map.length-(z+1)][2*x] != '.');
	};



	Room.prototype.readMap = function() {

		this.readHorizontally();
		this.readVertically();
	};

	Room.prototype.expandCharType = function(charType) {
		if( charType === '-' || charType === '_' || charType === '|' || charType === '!') {
			return [charType];
		} else {
			if (charType == '#') {
				return ['|', '-'];
			}
			if (charType == '%') {
				return ['|', '_'];
			}
			if (charType == '+') {
				return ['!', '-'];
			}
			if (charType == '¤') {
				return ['!', '_'];
			}
		}
	};

	Room.prototype.isTop = function(charType) {
		return (charType === '#' || charType === '-' || charType === '+');
	};
	Room.prototype.isBottom = function(charType) {
		return (charType === '%' || charType === '_' || charType === '¤');
	};
	Room.prototype.isLeft = function(charType) {
		return (charType === '#' || charType === '|' || charType === '%');
	};
	Room.prototype.isRight = function(charType) {
		return (charType === '+' || charType === '!' || charType === '¤');
	};
	Room.prototype.isInside = function(charType) {
		return (charType !== '.');
	};
	Room.prototype.isNoWall = function(charType) {
		return (charType === ',');
	};

	Room.prototype.getDoor = function(doorId) {
		var door;
		for(var i=0; i< this.doorsConstr.length; i++) {
			door = this.doorsConstr[i];
			if (door.id === doorId) {
				return door;
			}
		}
		console.log('DoorId not found');
		return false;
	};

	Room.prototype.getArt = function(artId) {
		var art;
		for(var i=0; i< this.artsConstr.length; i++) {
			art = this.artsConstr[i];
			if (art.id === artId) {
				return art;
			}
		}
		console.log('artId not found');
		return false;
	};

	Room.prototype.addWall = function(wall) {
		if (wall.length === 0 || wall[wall.length-1].length > 0) {
			wall.push([]);
		}
	};

	Room.prototype.readHorizontally = function() {
		var h, w;
		var x, z, charType;
		var next, doorId, artId;
		var door, art, artConstr;
		var top, bottom;


		for (h=-1; h< this.map.length+1; h++) {
			z = this.map.length-(h+1);
			for (w=-2; w< this.map[0].length+2; w+=2) {
				x = w/2;
				this.floors.push(faceMaker.floor(this, x, z));
				this.ceilings.push(faceMaker.ceiling(this, x, z));
			}
		}

		for(h=0; h < this.map.length; h++) {
			z = this.map.length-(h+1);
			this.addWall(this.tops);
			this.addWall(this.bottoms);
			for (w=0; w< this.map[h].length; w+=2) {
				x = w/2;
				charType = this.map[h][w];
				next = this.map[h][w+1];
				doorId = next.replace(/^[^0-9]$/,'');
				artId = next.replace(/^[^a-zA-Z]$/,'');
				top = faceMaker.top(this, x, z);
				bottom = faceMaker.bottom(this, x, z);

				// if (this.isInside(charType)) {
				// 	this.floors.push(faceMaker.floor(this, x, z));
				// 	this.ceilings.push(faceMaker.ceiling(this, x, z));
				// }

				if (this.isNoWall(charType)) {
					// this.positions.push(faceMaker.position(this, x, z));
				}

				if(doorId === '') {
					if(this.isTop(charType)) {
						this.tops[this.tops.length-1].push(top);
					}
					if(this.isBottom(charType)) {
						this.bottoms[this.bottoms.length-1].push(bottom);
					}
				} else {
					door = this.getDoor(doorId);
					if (!this.isTop(door.side) && this.isTop(charType)) {
						this.tops[this.tops.length-1].push(top);
					} else {
						if (this.isTop(charType)) {
							this.doors.push(faceMaker.door(this, top, door.to));
						}
						this.addWall(this.tops);
					}
					if (!this.isBottom(door.side) && this.isBottom(charType)) {
						this.bottoms[this.bottoms.length-1].push(bottom);
					} else {
						if (this.isBottom(charType)) {
							this.doors.push(faceMaker.door(this, bottom, door.to));
						}
						this.addWall(this.bottoms);
					}
				}


				if(artId !== '') {
					artConstr = this.getArt(artId);
					if(this.isTop(charType)) {
						art = faceMaker.art(this, top, artConstr.type, artConstr.width, artConstr.height, artConstr.thumb, artConstr.src);
						this.arts.push(art);
						this.positions.push(faceMaker.position(this, top));
					}
					if(this.isBottom(charType)) {
						art = faceMaker.art(this, bottom, artConstr.type, artConstr.width, artConstr.height, artConstr.thumb, artConstr.src);
						this.arts.push(art);
						this.positions.push(faceMaker.position(this, bottom));
					}

					if(art) {

						if (art.f.subtype === 'image') {
							var img = new Image();
							img.src = art.f.src;
							img.id = art.f.id;
							img.className = 'art';
							this.images.push(img);
						}

						if (art.f.subtype === 'html') {
							var ifrm = document.createElement('iframe');
							ifrm.setAttribute('src', art.f.src);
							ifrm.className = 'html';
							ifrm.id = art.f.id;
							ifrm.height = artConstr.iFrameHeight||600;
							ifrm.width = artConstr.iFrameWidth||800;
							this.texts.push(ifrm);
						}
					}

				}

			}
		}
	};
	Room.prototype.readVertically = function() {
		var w, h;
		var x, z, charType;
		var next, doorId, artId;
		var door, art, artConstr;
		var left, right;

		for (w=0; w< this.map[0].length; w+=2) {
			this.addWall(this.lefts);
			this.addWall(this.rights);
			for(h=0; h < this.map.length; h++) {
				x = w/2;
				z = this.map.length-(h+1);
				charType = this.map[h][w];
				next = this.map[h][w+1];
				doorId = next.replace(/^[^0-9]$/,'');
				artId = next.replace(/^[^a-zA-Z]$/,'');
				left = faceMaker.left(this, x, z);
				right = faceMaker.right(this, x, z);

				if(doorId === '') {
					if(this.isLeft(charType)) {
						this.lefts[this.lefts.length-1].push(left);
					}
					if(this.isRight(charType)) {
						this.rights[this.rights.length-1].push(right);
					}
				} else {
					door = this.getDoor(doorId);
					if (!this.isLeft(door.side) && this.isLeft(charType)) {
						this.lefts[this.lefts.length-1].push(left);
					} else {
						if (this.isLeft(charType)) {
							this.doors.push(faceMaker.door(this, left, door.to));
						}
						this.addWall(this.lefts);
					}
					if (!this.isRight(door.side) && this.isRight(charType)) {
						this.rights[this.rights.length-1].push(right);
					} else {
						if (this.isRight(charType)) {
							this.doors.push(faceMaker.door(this, right, door.to));
						}
						this.addWall(this.rights);
					}
				}

				if(artId !== '') {
					artConstr = this.getArt(artId);
					if(this.isLeft(charType)) {
						art = faceMaker.art(this, left, artConstr.type, artConstr.width, artConstr.height, artConstr.thumb, artConstr.src);
						this.arts.push(art);
						this.positions.push(faceMaker.position(this, left));
					}
					if(this.isRight(charType)) {
						art = faceMaker.art(this, right, artConstr.type, artConstr.width, artConstr.height, artConstr.thumb, artConstr.src);
						this.arts.push(art);
						this.positions.push(faceMaker.position(this, right));
					}

					if(art) {
						if (art.f.subtype === 'image') {
							var img = new Image();
							img.src = art.f.src;
							img.id = art.f.id;
							img.className = 'art';
							this.images.push(img);
						}

						if (art.f.subtype === 'html') {
							var ifrm = document.createElement('iframe');
							ifrm.setAttribute('src', art.f.src);
							ifrm.className = 'html';
							ifrm.id = art.f.id;
							ifrm.height = artConstr.iFrameHeight||600;
							ifrm.width = artConstr.iFrameWidth||800;
							this.texts.push(ifrm);
						}
						
					}

				}
			}
		}
	};


	Room.prototype.getWall = function(_x, _z, type) {
		var ar;
		var res = [];
		for (var i=0; i<this.walls.length; i++) {
			ar = this.walls[i].f.id.split(':');
			if(parseInt(ar[1], 10) === _x && parseInt(ar[2], 10) === _z) {
				res[res.length] = this.walls[i];
			}
		}
		if(res.length === 1 || (!type && res.length > 0)) {
			return res[0];
		} else {
			for(var j=0; j< res.length; j++) {
				if (type === res[j].f.id.split(':')[3]) {
					return res[i];
				}
			}
		}
		console.log('Face Not Found');
		return null;
	},

	Room.prototype.makeArt = function(id, potentialWalls) {
		var art, wall;
		for(var i=0; i< this.artsConstr.length; i++) {
			art = this.artsConstr[i];
			if (art.id === id) {

				if(potentialWalls.length === 1 ) {
					wall = potentialWalls[0];
				} else {
					for(var j=0; j<potentialWalls.length; j++) {
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
		for(var i=0; i< this.doorsConstr.length; i++) {
			door = this.doorsConstr[i];
			if (door.id === id) {
				if(potentialWalls.length === 1 || door.side === undefined ) {
					wall = potentialWalls[0];
				} else {
					for(var j=0; j<potentialWalls.length; j++) {
						if(potentialWalls[j].f.type === door.side) {
							wall = potentialWalls[j];
						}
					}
				}
				if (wall !== undefined) {
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
		for(var i=0; i< this.soundsConstr.length; i++) {
			sound = this.soundsConstr[i];
			this.sounds.push(new Sound(sound));
		}
	};

	Room.prototype.loadAdj = function() {
		for(var i=0; i< this.doorsConstr.length; i++) {
			this.adj.push(new Room(this.doorsConstr[i].to, false).load());
		}
	};

	Room.prototype.renderAdj = function () {
		for (var i=0; i<this.adj.length; i++) {
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
			wall = faceMaker.top(this,_x,_z);
			this.tops[_z].push(wall);
			this.walls.push(wall);
			potentialWalls.push(wall);
		}
		if(this.wallE[charType].bottom) {
			if(!this.bottoms.hasOwnProperty(_z)) {
				this.bottoms[_z] = [];
			}
			wall = faceMaker.bottom(this,_x,_z);
			this.bottoms[_z].push(wall);
			this.walls.push(wall);
			potentialWalls.push(wall);
		}
		if(this.wallE[charType].left) {
			if(!this.lefts.hasOwnProperty(_x)) {
				this.lefts[_x] = [];
			}
			wall = faceMaker.left(this,_x,_z);
			this.lefts[_x].push(wall);
			this.walls.push(wall);
			potentialWalls.push(wall);
		}
		if(this.wallE[charType].right) {
			if(!this.rights.hasOwnProperty(_x)) {
				this.rights[_x] = [];
			}
			wall = faceMaker.right(this,_x,_z);
			this.rights[_x].push(wall);
			this.walls.push(wall);
			potentialWalls.push(wall);
		}
		if(this.wallE[charType].ceiling) {
			if(!this.ceilings.hasOwnProperty(0)) {
				this.ceilings[0] = [];
			}
			wall = faceMaker.ceiling(this,_x, _z);
			this.ceilings[0].push(wall);
		}
		if(this.wallE[charType].floor) {
			if(!this.floors.hasOwnProperty(0)) {
				this.floors[0] = [];
			}
			wall = faceMaker.floor(this,_x, _z);
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
