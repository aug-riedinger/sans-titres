	// ======= Room constructor ========
	var Room = function (constr) {
		// console.log(constr);
		this.id = constr.id;
		this.name = constr.name;
		this.path = constr.path;
		this.position = constr.position;
		this.map = constr.map;
		this.makeCubes(constr.map);
		this.makeArts(constr.arts);

		return this;
	};

	Room.prototype.makeCubes = function(constr) {
		for(var h=0; h < constr.length; h++) {
			for (var w=0; w< constr[h].length; w+=2) {
				cubeMaker[constr[h][w]](this,this.position.x+w/2,this.position.z+(constr.length-(h+1)),constr[h][w+1]);
			}
		}
	}

	Room.prototype.makeArts = function(constr) {
		for(var i=0; i< constr.length; i++) {
			faces.push(faceMaker.art(constr[i].face, constr[i].width, constr[i].height, constr[i].thumb, constr[i].src));
			//TODO : get face by ID, so add ID to face and use it here;
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

var cubeMaker = {
	'T' : function(room,_x,_z) { // Top Left
		var top = faceMaker.top(_x,_z,[1,3,4]);
		faces.push(top);
		var left = faceMaker.left(_x,_z,[1,2,3]);
		faces.push(left);
		var ceiling = faceMaker.ceiling(_x, _z,[3,4]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[1,4]);
		faces.push(floor);
	},
	't' : function(room,_x,_z) { // Top Right
		var top = faceMaker.top(_x,_z,[1,2,3]);
		faces.push(top);
		var right = faceMaker.right(_x,_z,[1,3,4]);
		faces.push(right);
		var ceiling = faceMaker.ceiling(_x, _z,[2,3]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[1,2]);
		faces.push(floor);
	},
	'B' : function(room,_x,_z) { // Bottom Left
		var bottom = faceMaker.bottom(_x,_z,[1,2,3]);
		faces.push(bottom);
		var left = faceMaker.left(_x,_z,[1,3,4]);
		faces.push(left);
		var ceiling = faceMaker.ceiling(_x, _z,[1,4]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[3,4]);
		faces.push(floor);
	},
	'b' : function(room,_x,_z) { // Bottom Right
		var bottom = faceMaker.bottom(_x,_z,[1,3,4]);
		faces.push(bottom);
		var right = faceMaker.right(_x,_z,[1,2,3]);
		faces.push(right);
		var ceiling = faceMaker.ceiling(_x, _z,[1,2]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[2,3]);
		faces.push(floor);
	},
	'-' : function(room,_x,_z,toRoom) { // Top
		var top = faceMaker.top(_x,_z,[1,3],toRoom);
		faces.push(top);
		var ceiling = faceMaker.ceiling(_x, _z,[3]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[1]);
		faces.push(floor);
	},
	'_' : function(room,_x,_z,toRoom) { // Bottom
		var bottom = faceMaker.bottom(_x,_z,[1,3],toRoom);
		faces.push(bottom);
		var ceiling = faceMaker.ceiling(_x, _z,[1]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[3]);
		faces.push(floor);
	},
	'|' : function(room,_x,_z,toRoom) { // Left
		var left = faceMaker.left(_x,_z,[1,3],toRoom);
		faces.push(left);
		var ceiling = faceMaker.ceiling(_x, _z,[4]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[4]);
		faces.push(floor);
	},
	'!' : function(room,_x,_z,toRoom) { // Right
		var right = faceMaker.right(_x,_z,[1,3],toRoom);
		faces.push(right);
		var ceiling = faceMaker.ceiling(_x, _z,[2]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[2]);
		faces.push(floor);
	},
	'*' : function(room,_x,_z) { // Inside
		var ceiling = faceMaker.ceiling(_x, _z,[]);
		faces.push(ceiling);
		var floor = faceMaker.floor(_x, _z,[]);
		faces.push(floor);
	},
	'.' : function(room,_x,_z) { // Outside
	}
}