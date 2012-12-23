	// ======= Room constructor ========
	var Room = function (constr) {
		// console.log(constr);
		this.id = constr.id;
		this.name = constr.name;
		this.path = constr.path;
		this.position = constr.position;
		this.map = constr.map;
		this.cubes = [];
		this.makeCubes(constr.map);
		this.makeArts(constr.arts);

		return this;
	};

	Room.prototype.makeCubes = function(constr) {
		for(var h=0; h < constr.length; h++) {
			for (var w=0; w< constr[h].length; w+=2) {
				this.cubes.push(cubeWallMaker[constr[h][w]](this,this.position.x+w/2,this.position.z+(constr.length-(h+1)),constr[h][w+1]));
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
			cube = this.getCube(constr[i].x, constr[i].z);
			if(cube) {
				cube.arts.push(faceMaker.art(this, cube.walls[0], constr[i].width, constr[i].height, constr[i].thumb, constr[i].src));
			} else {
				console.log('cube not found');
			}
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
	'T' : function(room,_x,_z) { // Top Left
		var cube = {
			type: 'T',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var top = faceMaker.top(room,_x,_z,[1,3,4]);
		cube.walls.push(top);
		var left = faceMaker.left(room,_x,_z,[1,2,3]);
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[3,4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1,4]);
		cube.walls.push(floor);

		return cube;
	},
	't' : function(room,_x,_z) { // Top Right
		var cube = {
			type: 't',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var top = faceMaker.top(room,_x,_z,[1,2,3]);
		cube.walls.push(top);
		var right = faceMaker.right(room,_x,_z,[1,3,4]);
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[2,3]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1,2]);
		cube.walls.push(floor);

		return cube;

	},
	'B' : function(room,_x,_z) { // Bottom Left
		var cube = {
			type: 'B',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var bottom = faceMaker.bottom(room,_x,_z,[1,2,3]);
		cube.walls.push(bottom);
		var left = faceMaker.left(room,_x,_z,[1,3,4]);
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1,4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[3,4]);
		cube.walls.push(floor);

		return cube;

	},
	'b' : function(room,_x,_z) { // Bottom Right
		var cube = {
			type: 'b',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var bottom = faceMaker.bottom(room,_x,_z,[1,3,4]);
		cube.walls.push(bottom);
		var right = faceMaker.right(room,_x,_z,[1,2,3]);
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1,2]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[2,3]);
		cube.walls.push(floor);

		return cube;

	},
	'-' : function(room,_x,_z,toRoom) { // Top
		var cube = {
			type: '-',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var top = faceMaker.top(room,_x,_z,[1,3],toRoom);
		cube.walls.push(top);
		var ceiling = faceMaker.ceiling(room,_x, _z,[3]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[1]);
		cube.walls.push(floor);

		return cube;

	},
	'_' : function(room,_x,_z,toRoom) { // Bottom
		var cube = {
			type: '_',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var bottom = faceMaker.bottom(room,_x,_z,[1,3],toRoom);
		cube.walls.push(bottom);
		var ceiling = faceMaker.ceiling(room,_x, _z,[1]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[3]);
		cube.walls.push(floor);

		return cube;

	},
	'|' : function(room,_x,_z,toRoom) { // Left
		var cube = {
			type: '|',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var left = faceMaker.left(room,_x,_z,[1,3],toRoom);
		cube.walls.push(left);
		var ceiling = faceMaker.ceiling(room,_x, _z,[4]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[4]);
		cube.walls.push(floor);

		return cube;

	},
	'!' : function(room,_x,_z,toRoom) { // Right
		var cube = {
			type: '!',
			x: _x,
			z: _z,
			walls : [],
			arts: []
		}
		var right = faceMaker.right(room,_x,_z,[1,3],toRoom);
		cube.walls.push(right);
		var ceiling = faceMaker.ceiling(room,_x, _z,[2]);
		cube.walls.push(ceiling);
		var floor = faceMaker.floor(room,_x, _z,[2]);
		cube.walls.push(floor);

		return cube;

	},
	'*' : function(room,_x,_z) { // Inside
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