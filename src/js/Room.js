	// ======= Room constructor ========
	var Room = function (id, mainRoom) {
		this.id = id;
		this.mainRoom = mainRoom;
		this.arts = [];
		this.sounds = [];
		this.adj = [];
		this.positions = [];
		this.tops = {};
		this.bottoms = {};
		this.lefts = {};
		this.rights = {};
		this.ceilings = {};
		this.floors = {};
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
		this.walls = []; //this.tops.concat(this.bottoms, this.lefts, this.rights);
		// this.faces = this.tops.concat(this.bottoms, this.lefts, this.rights, this.ceilings, this.floors);

		if(this.mainRoom) {
			this.makeArts(constr.arts);
			this.loadAdj();
			this.makePositions();
		}
		return this;	
	}

	Room.prototype.render = function() {

		if(this.mainRoom) {
			this.renderAdj();
		}	

		for (var depth in this.ceilings) {
			if (this.ceilings.hasOwnProperty(depth)) {
				render(this.ceilings[depth],'y', '#ffffff');
			}
		}

		for (var depth in this.floors) {
			if (this.floors.hasOwnProperty(depth)) {
				render(this.floors[depth],'y', '#80827d');
			}
		}

		for (var depth in this.tops) {
			if (this.tops.hasOwnProperty(depth)) {
				render(this.tops[depth],'z', '#f9f9f9', '#D9D9D9');
			}
		}


		for (var depth in this.bottoms) {
			if (this.bottoms.hasOwnProperty(depth)) {
				render(this.bottoms[depth],'z', '#f9f9f9', '#D9D9D9');
			}
		}

		for (var depth in this.lefts) {
			if (this.lefts.hasOwnProperty(depth)) {
				render(this.lefts[depth],'x', '#E9E9E9', '#f9f9f9');
			}
		}

		for (var depth in this.rights) {
			if (this.rights.hasOwnProperty(depth)) {
				render(this.rights[depth],'x', '#E9E9E9', '#f9f9f9');
			}
		}

		for (var i=0; i < this.arts.length; i++) {
			face = this.arts[i];
			face.projection();
			// if( face.visible) {
			// 	face.render();
			// }			
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
				this.wallMaker(this.map[h][w],w/2,(this.map.length-(h+1)));
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

	Room.prototype.wallMaker = function(charType, _x, _z) {
		if(this.wallE[charType].top) {
			if(!this.tops.hasOwnProperty(_z)) {
				this.tops[_z] = [];
			}
			this.tops[_z].push(faceMaker.top(this,_x,_z));
		}
		if(this.wallE[charType].bottom) {
			if(!this.bottoms.hasOwnProperty(_z)) {
				this.bottoms[_z] = [];
			}
			this.bottoms[_z].push(faceMaker.bottom(this,_x,_z));
		}
		if(this.wallE[charType].left) {
			if(!this.lefts.hasOwnProperty(_x)) {
				this.lefts[_x] = [];
			}
			this.lefts[_x].push(faceMaker.left(this,_x,_z));
		}
		if(this.wallE[charType].right) {
			if(!this.rights.hasOwnProperty(_x)) {
				this.rights[_x] = [];
			}
			this.rights[_x].push(faceMaker.right(this,_x,_z));
		}
		if(this.wallE[charType].ceiling) {
			if(!this.ceilings.hasOwnProperty(0)) {
				this.ceilings[0] = [];
			}
			this.ceilings[0].push(faceMaker.ceiling(this,_x, _z));		
		}
		if(this.wallE[charType].floor) {
			if(!this.floors.hasOwnProperty(0)) {
				this.floors[0] = [];
			}
			this.floors[0].push(faceMaker.floor(this,_x, _z));	
		}
	};


    // "╔------0--╗.",
    // "|.,.,.,.,.║.",
    // "|.,.,.,.,.║.",
    // "|.,.,.,.,.║.",
    // "|.,.,.,.,.║.",
    // "|.,.,.,.,.║1",
    // "╚═════════╝."


Room.prototype.wallE = {
	'╔': { // Top Left
		top: true,
		bottom: false,
		left: true,
		right: false,
		ceiling: true,
		floor: true
	},
	'╗': { // Top Right
		top: true,
		bottom: false,
		left: false,
		right: true,
		ceiling: true,
		floor: true
	},
	'╚': { // Bottom Left
		top: false,
		bottom: true,
		left: true,
		right: false,
		ceiling: true,
		floor: true
	},
	'╝': { // Bottom Right
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
	'═': { // Bottom
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
	'║': { // Right
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
}
