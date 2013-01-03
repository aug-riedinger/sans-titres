	// ======= Room constructor ========
	var Room = function (id, mainRoom) {
		this.id = id;
		this.mainRoom = mainRoom;
		this.cubes = [];
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
		return this;
	};

	Room.prototype.load = function() {
		var that = this;
		$.getJSON('/rooms/room'+this.id+'.json', function(data) {
			that.init(data);
			if(that.mainRoom) {
				camera.goToPosition(0);
			}
			$(that).trigger('ready');
		});
		return this;
	}

	Room.prototype.init = function(constr) {
		this.name = constr.name;
		this.path = constr.path;
		this.position = constr.position;
		this.map = constr.map;
		this.doors = constr.doors;
		this.setCenter();

		this.makeWalls();
		this.walls = this.tops.concat(this.bottoms, this.lefts, this.rights);
		this.faces = this.tops.concat(this.bottoms, this.lefts, this.rights, this.ceilings, this.floors);

		if(this.mainRoom) {
			this.makeArts(constr.arts);
			this.loadAdj();
			this.makePositions();
		}
		return this;	
	}

	Room.prototype.render = function() {
		var face;

		if(this.mainRoom) {
			this.renderAdj();
		}

		for (var i=0; i < this.tops.length; i++) {
			face = this.tops[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}

		for (var i=0; i < this.bottoms.length; i++) {
			face = this.bottoms[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}

		for (var i=0; i < this.lefts.length; i++) {
			face = this.lefts[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}

		for (var i=0; i < this.rights.length; i++) {
			face = this.rights[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}

		for (var i=0; i < this.ceilings.length; i++) {
			face = this.ceilings[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}
		for (var i=0; i < this.floors.length; i++) {
			face = this.floors[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}

		for (var i=0; i < this.arts.length; i++) {
			face = this.arts[i];
			face.projection();
			if( face.visible) {
				face.render();
			}			
		}
	}

	Room.prototype.inside = function(_x,_z, big) {
		var x, z;
		if (big) {
			var x = Math.round(_x/params.unit ) - (this.position.x||0);
			var z = Math.round((_z - params.focalLength)/params.unit) - (this.position.z||0);
		} else {
			x = Math.round(_x) - this.position.x;
			z= Math.round(_z) - this.position.z;
		}

		return (true && this.map[this.map.length-(z+1)] && this.map[this.map.length-(z+1)][2*x] && this.map[this.map.length-(z+1)][2*x] != '.');
	};

	Room.prototype.makePositions = function() {
		var x = 0, z = 0, cpt = 0;
		var zone = 3;
		var res;

		for(var h=0; h < this.map.length; h+=zone) {
			for (var w=0; w< this.map[h].length; w+=2*zone) {
				for (var i=0; i<zone; i++)  {
					for (var j=0; j< zone; j+=2) {
						if(this.map[h+i] && this.map[h+i][w+j] && this.map[h+i][w+j] != '.') {
							z += h+i;
							x += w/2 + j;
							cpt +=1;
						}
					}
				}
				res = {
					x: this.position.x + x/cpt,
					z: this.position.z + z/cpt,
					dst: (Math.abs((this.position.x + x/cpt)*params.unit - camera.x.value) + Math.abs((this.position.z + z/cpt)*params.unit - camera.z.value))||9999999
				}
				if(this.inside(res.x, res.z)) {
					this.positions.push(res);					
				}
				x = 0;
				z = 0;
				cpt = 0;
			}
		}

		this.positions.sort(function (p0, p1) {
			return p0.dst - p1.dst;
		});

	}

	Room.prototype.setCenter = function() {
		var z = 0;
		var x = 0;
		var cpt = 0;
		for(var h=0; h < this.map.length; h++) {
			for (var w=0; w< this.map[h].length; w+=2) {
				if(this.map[h][w] == 'T' || this.map[h][w] == 't' || this.map[h][w] == 'B' || this.map[h][w] == 'b') {
					z += h;
					x += w/2;
					cpt += 1;
				}
			}
		}
		return this.center = {
			x: this.position.x + x/cpt,
			z: this.position.z + z/cpt
		};
	};

	Room.prototype.doorIDtoDoor = function(doorID) {
		if (doorID !== '.') {
			if(typeof(this.doors[doorID]) == 'string') {
				return {
					to: this.doors[doorID].substring(0,this.doors[doorID].length-1),
					type: this.doors[doorID].substring(this.doors[doorID].length-1,this.doors[doorID].length)
				};
			} else {
				return {
					to: this.doors[doorID]
				};
			}
		} else {
			return {
				to : '.'
			};
		}
	}

	Room.prototype.makeWalls = function() {
		for(var h=0; h < this.map.length; h++) {
			for (var w=0; w< this.map[h].length; w+=2) {
				wallMaker[this.map[h][w]](this,w/2,(this.map.length-(h+1)),this.doorIDtoDoor(this.map[h][w+1]));
			}
		}
	}

	Room.prototype.getWall = function(_x, _z, type) {
		var ar;
		var res = [];
		for (var i=0; i<this.walls.length; i++) {
			ar = this.walls[i].f.id.split(':');
			if(parseInt(ar[1]) === _x && parseInt(ar[2]) === _z) {
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
	}

	Room.prototype.makeArts = function(constr) {
		var cube;
		for(var i=0; i< constr.length; i++) {
			wall = this.getWall(constr[i].x, constr[i].z, constr[i].wall || null);
			console.log(wall);
			if(wall) {
				if(constr[i].type === 'sound') {
					this.arts[this.arts.length] = faceMaker.sound(this, wall, constr[i].width, constr[i].height, constr[i].thumb, constr[i].src);
					this.sounds[this.sounds.length] = new Sound(constr[i]);
				}
				if(constr[i].type === 'txt') {
					this.arts[this.arts.length] = faceMaker.txt(this, wall, constr[i].width, constr[i].height, constr[i].thumb, constr[i].src);
				}
				if(constr[i].type === 'image') {
					this.arts[this.arts.length] = faceMaker.image(this, wall, constr[i].width, constr[i].height, constr[i].thumb, constr[i].src);
				}

			} 
		}
	}

	Room.prototype.loadAdj = function() {
		var roomID;
		for(var i=0; i< this.doors.length; i++) {
			if (typeof(this.doors[i]) === 'string') {
				roomID = this.doors[i].substring(0,this.doors[i].length-1);
			} else {
				roomID = this.doors[i];
			}
			// console.log('creating room '+roomID);
			this.adj.push(new Room(roomID, false).load());
		}
	}

	Room.prototype.renderAdj = function () {
		for (var i=0; i<this.adj.length; i++) {
			this.adj[i].render();
		}
	}



//      ooooooooooo
//      o    1    o
//      o         o
//      o 0     2 o   4\5
//      o    3    o
//      ooooooooooo
//   z↑
//    |
//    0---→
//        x

var wallMaker = {
	'T' : function(room,_x,_z,door) { // Top Left

		if(door.type === '-') {
			var top = faceMaker.top(room,_x,_z,[1,3,4], door.to);
		} else {
			var top = faceMaker.top(room,_x,_z,[1,3,4]);			
		}
		room.tops[room.tops.length] = top;

		if(door.type === '|') {
			var left = faceMaker.left(room,_x,_z,[1,2,3], door.to);
		} else {
			var left = faceMaker.left(room,_x,_z,[1,2,3]);			
		}
		room.lefts[room.lefts.length] = left;
		var ceiling = faceMaker.ceiling(room,_x, _z,[3,4]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[1,4]);
		room.floors[room.floors.length] = floor;


	},
	't' : function(room,_x,_z, door) { // Top Right

		if(door.type === '-') {
			var top = faceMaker.top(room,_x,_z,[1,2,3], door.to);
		} else {
			var top = faceMaker.top(room,_x,_z,[1,2,3]);			
		}		
		room.tops[room.tops.length] = top;

		if(door.type === '!') {
			var right = faceMaker.right(room,_x,_z,[1,3,4], door.to);
		} else {
			var right = faceMaker.right(room,_x,_z,[1,3,4]);
		}

		room.rights[room.rights.length] = right;

		var ceiling = faceMaker.ceiling(room,_x, _z,[2,3]);
		room.ceilings[room.ceilings.length] = ceiling;


		var floor = faceMaker.floor(room,_x, _z,[1,2]);
		room.floors[room.floors.length] = floor;

	},
	'B' : function(room,_x,_z, door) { // Bottom Left

		if(door.type === '_') {
			var bottom = faceMaker.bottom(room,_x,_z,[1,2,3], door.to);
		} else {
			var bottom = faceMaker.bottom(room,_x,_z,[1,2,3]);
		}
		room.bottoms[room.bottoms.length] = bottom;

		if(door.type === '|') {
			var left = faceMaker.left(room,_x,_z,[1,3,4], door.to);
		} else {
			var left = faceMaker.left(room,_x,_z,[1,3,4]);			
		}

		room.lefts[room.lefts.length] = left;
		var ceiling = faceMaker.ceiling(room,_x, _z,[1,4]);
		room.ceilings[room.ceilings.length] = ceiling;


		var floor = faceMaker.floor(room,_x, _z,[3,4]);

		room.floors[room.floors.length] = floor;
	},
	'b' : function(room,_x,_z, door) { // Bottom Right

		if(door.type === '_') {
			var bottom = faceMaker.bottom(room,_x,_z,[1,3,4], door.to);
		} else {
			var bottom = faceMaker.bottom(room,_x,_z,[1,3,4]);
		}
		room.bottoms[room.bottoms.length] = bottom;

		if(door.type === '!') {
			var right = faceMaker.right(room,_x,_z,[1,2,3], door.to);
		} else {
			var right = faceMaker.right(room,_x,_z,[1,2,3]);
		}

		room.rights[room.rights.length] = right;

		var ceiling = faceMaker.ceiling(room,_x, _z,[1,2]);
		room.ceilings[room.ceilings.length] = ceiling;


		var floor = faceMaker.floor(room,_x, _z,[2,3]);

		room.floors[room.floors.length] = floor;

	},
	'-' : function(room,_x,_z,door) { // Top

		var top = faceMaker.top(room,_x,_z,[1,3],door.to);
		room.tops[room.tops.length] = top;

		var ceiling = faceMaker.ceiling(room,_x, _z,[3]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[1]);
		room.floors[room.floors.length] = floor;

	},
	'_' : function(room,_x,_z,door) { // Bottom

		var bottom = faceMaker.bottom(room,_x,_z,[1,3],door.to);
		room.bottoms[room.bottoms.length] = bottom;

		var ceiling = faceMaker.ceiling(room,_x, _z,[1]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[3]);
		room.floors[room.floors.length] = floor;

	},
	'|' : function(room,_x,_z,door) { // Left

		var left = faceMaker.left(room,_x,_z,[1,3],door.to);
		room.lefts[room.lefts.length] = left;

		var ceiling = faceMaker.ceiling(room,_x, _z,[4]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[4]);
		room.floors[room.floors.length] = floor;

	},
	'!' : function(room,_x,_z,door) { // Right

		var right = faceMaker.right(room,_x,_z,[1,3],door.to);
		room.rights[room.rights.length] = right;

		var ceiling = faceMaker.ceiling(room,_x, _z,[2]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[2]);
		room.floors[room.floors.length] = floor;

	},
	',' : function(room,_x,_z) { // Inside
		var cube = {
			type: '*',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var ceiling = faceMaker.ceiling(room,_x, _z,[]);
		room.ceilings[room.ceilings.length] = ceiling;

		var floor = faceMaker.floor(room,_x, _z,[]);
		room.floors[room.floors.length] = floor;

	},
	'.' : function(room,_x,_z) { // Outside
	}
}
