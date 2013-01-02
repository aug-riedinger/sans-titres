	// ======= Room constructor ========
	var Room = function (id, mainRoom) {
		this.id = id;
		this.mainRoom = mainRoom;
		this.cubes = [];
		this.arts = [];
		this.sounds = [];
		this.adj = [];
		this.positions = [];
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

		this.makeCubes();


		if(this.mainRoom) {
			this.makeArts(constr.arts);
			this.loadAdj();
			this.makePositions();
		}
		return this;	
	}

	Room.prototype.render = function() {
		var face;

		for (var i=0; i < this.adj.length; i++) {
			for (var j=0; j < this.adj[i].cubes.length; j++) {
				for (var k=0; k < this.adj[i].cubes[j].walls.length; k++) {
					face = this.adj[i].cubes[j].walls[k];
					face.projection();
					if( face.visible) {
						face.render();
					}
				}
			}
		}

		for (var i=0; i < this.cubes.length; i++) {
			for (var j=0; j < this.cubes[i].walls.length; j++) {
				face = this.cubes[i].walls[j];
				face.projection();
				if( face.visible) {
					face.render();
				}			
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

	Room.prototype.makeCubes = function() {
		for(var h=0; h < this.map.length; h++) {
			for (var w=0; w< this.map[h].length; w+=2) {
				this.cubes.push(cubeWallMaker[this.map[h][w]](this,w/2,(this.map.length-(h+1)),this.doorIDtoDoor(this.map[h][w+1])));
			}
		}
	}

	Room.prototype.getCube = function(_x, _z) {
		for (var i=0; i< this.cubes.length; i++) {
			if(this.cubes[i].x == _x && this.cubes[i].z == _z) {
				return this.cubes[i];
			}
		}
		return null;
	}

	Room.prototype.makeArts = function(constr) {
		var cube = {};
		for(var i=0; i< constr.length; i++) {
			cube = this.getCube(constr[i].x,constr[i].z);
			if(cube) {
				if(constr[i].type === 'sound') {
					this.arts.push(faceMaker.sound(this, cube.walls[0], constr[i].width, constr[i].height, constr[i].thumb, constr[i].src));
					this.sounds.push(new Sound(constr[i]));
				}
				if(constr[i].type === 'txt') {
					this.arts.push(faceMaker.txt(this, cube.walls[0], constr[i].width, constr[i].height, constr[i].thumb, constr[i].src));
				}
				if(constr[i].type === 'image') {
					this.arts.push(faceMaker.image(this, cube.walls[0], constr[i].width, constr[i].height, constr[i].thumb, constr[i].src));
				}

			} else {
				console.log('cube not found');
				console.log({
					room: this.id,
					x: constr[i].x, 
					z: constr[i].z
				});
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

var cubeWallMaker = {
	'T' : function(room,_x,_z,door) { // Top Left
		var cube = {
			type: 'T',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		if(door.type === '-') {
			var top = faceMaker.top(room,_x,_z,[1,3,4], door.to);
		} else {
			var top = faceMaker.top(room,_x,_z,[1,3,4]);			
		}
		cube.walls.push(top);
		if(door.type === '|') {
			var left = faceMaker.left(room,_x,_z,[1,2,3], door.to);
		} else {
			var left = faceMaker.left(room,_x,_z,[1,2,3]);			
		}
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[3,4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1,4]);
		cube.walls.push(floor);

		return cube;
	},
	't' : function(room,_x,_z, door) { // Top Right
		var cube = {
			type: 't',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};
		if(door.type === '-') {
			var top = faceMaker.top(room,_x,_z,[1,2,3], door.to);
		} else {
			var top = faceMaker.top(room,_x,_z,[1,2,3]);			
		}		
		cube.walls.push(top);
		if(door.type === '!') {
			var right = faceMaker.right(room,_x,_z,[1,3,4], door.to);
		} else {
			var right = faceMaker.right(room,_x,_z,[1,3,4]);
		}
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[2,3]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1,2]);
		cube.walls.push(floor);

		return cube;

	},
	'B' : function(room,_x,_z, door) { // Bottom Left
		var cube = {
			type: 'B',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};
		if(door.type === '_') {
			var bottom = faceMaker.bottom(room,_x,_z,[1,2,3], door.to);
		} else {
			var bottom = faceMaker.bottom(room,_x,_z,[1,2,3]);
		}
		cube.walls.push(bottom);
		if(door.type === '|') {
			var left = faceMaker.left(room,_x,_z,[1,3,4], door.to);
		} else {
			var left = faceMaker.left(room,_x,_z,[1,3,4]);			
		}
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1,4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[3,4]);
		cube.walls.push(floor);

		return cube;

	},
	'b' : function(room,_x,_z, door) { // Bottom Right
		var cube = {
			type: 'b',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};
		if(door.type === '_') {
			var bottom = faceMaker.bottom(room,_x,_z,[1,3,4], door.to);
		} else {
			var bottom = faceMaker.bottom(room,_x,_z,[1,3,4]);
		}
		cube.walls.push(bottom);
		if(door.type === '!') {
			var right = faceMaker.right(room,_x,_z,[1,2,3], door.to);
		} else {
			var right = faceMaker.right(room,_x,_z,[1,2,3]);
		}
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1,2]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[2,3]);
		cube.walls.push(floor);

		return cube;

	},
	'-' : function(room,_x,_z,door) { // Top
		var cube = {
			type: '-',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};
		var top = faceMaker.top(room,_x,_z,[1,3],door.to);
		cube.walls.push(top);
		var ceiling = faceMaker.ceiling(room,_x, _z,[3]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1]);
		cube.walls.push(floor);
		
		return cube;

	},
	'_' : function(room,_x,_z,door) { // Bottom
		var cube = {
			type: '_',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};

		var bottom = faceMaker.bottom(room,_x,_z,[1,3],door.to);
		cube.walls.push(bottom);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[3]);
		cube.walls.push(floor);

		return cube;

	},
	'|' : function(room,_x,_z,door) { // Left
		var cube = {
			type: '|',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};

		var left = faceMaker.left(room,_x,_z,[1,3],door.to);
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[4]);
		cube.walls.push(floor);

		return cube;

	},
	'!' : function(room,_x,_z,door) { // Right
		var cube = {
			type: '!',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		};

		var right = faceMaker.right(room,_x,_z,[1,3],door.to);
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[2]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[2]);
		cube.walls.push(floor);

		return cube;

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
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[]);
		cube.walls.push(floor);

		return cube;

	},
	'.' : function(room,_x,_z) { // Outside
		var cube = {
			type: '.',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}

		return cube;

	}
}
