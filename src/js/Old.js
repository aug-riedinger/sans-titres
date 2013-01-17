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
				dst: 999999
				// dst: (Math.abs((this.position.x + x/cpt)*params.unit - (camera.x.value||0) ) + Math.abs((this.position.z + z/cpt)*params.unit - (camera.z.value||0) ))||9999999
			};
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

};

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


Room.prototype.readHorizontally = function() {
	var h, w;
	var x, z, charType;
	var next, doorId, artId;
	var door, art, artConstr;
	var top, bottom;


	for(h = -1; h < this.map.length + 1; h++) {
		z = this.map.length - (h + 1);
		for(w = -2; w < this.map[0].length + 2; w += 2) {
			x = w / 2;
			this.floors.push(faceMaker.floor(this, x, z));
			this.ceilings.push(faceMaker.ceiling(this, x, z));
		}
	}

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		this.addWall(this.tops);
		this.addWall(this.bottoms);
		for(w = 0; w < this.map[h].length; w += 2) {
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			doorId = next.replace(/^[^0-9]$/, '');
			artId = next.replace(/^[^a-zA-Z]$/, '');
			top = faceMaker.top(this, x, z);
			bottom = faceMaker.bottom(this, x, z);

			// if (this.isInside(charType)) {
			// 	this.floors.push(faceMaker.floor(this, x, z));
			// 	this.ceilings.push(faceMaker.ceiling(this, x, z));
			// }
			if(this.isNoWall(charType)) {
				// this.positions.push(faceMaker.position(this, x, z));
			}

			if(doorId === '') {
				if(this.isTop(charType)) {
					this.tops[this.tops.length - 1].push(top);
				}
				if(this.isBottom(charType)) {
					this.bottoms[this.bottoms.length - 1].push(bottom);
				}
			} else {
				door = this.getDoor(doorId);
				if(!this.isTop(door.side) && this.isTop(charType)) {
					this.tops[this.tops.length - 1].push(top);
				} else {
					if(this.isTop(charType)) {
						this.doors.push(faceMaker.door(this, top, door.to));
					}
					this.addWall(this.tops);
				}
				if(!this.isBottom(door.side) && this.isBottom(charType)) {
					this.bottoms[this.bottoms.length - 1].push(bottom);
				} else {
					if(this.isBottom(charType)) {
						this.doors.push(faceMaker.door(this, bottom, door.to));
					}
					this.addWall(this.bottoms);
				}
			}


			if(artId !== '') {
				artConstr = this.getArt(artId);
				if(this.isTop(charType)) {
					art = faceMaker.art(this, top, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, top));
				}
				if(this.isBottom(charType)) {
					art = faceMaker.art(this, bottom, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, bottom));
				}

				if(art) {

					if(art.f.subtype === 'image') {
						var img = new Image();
						img.src = art.f.src;
						img.id = art.f.id;
						img.className = 'art';
						this.images.push(img);
					}

					if(art.f.subtype === 'html') {
						var ifrm = document.createElement('iframe');
						ifrm.setAttribute('src', art.f.src);
						ifrm.className = 'html';
						ifrm.id = art.f.id;
						ifrm.height = artConstr.iFrameHeight || 600;
						ifrm.width = artConstr.iFrameWidth || 800;
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

	for(w = 0; w < this.map[0].length; w += 2) {
		this.addWall(this.lefts);
		this.addWall(this.rights);
		for(h = 0; h < this.map.length; h++) {
			x = w / 2;
			z = this.map.length - (h + 1);
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			doorId = next.replace(/^[^0-9]$/, '');
			artId = next.replace(/^[^a-zA-Z]$/, '');
			left = faceMaker.left(this, x, z);
			right = faceMaker.right(this, x, z);

			if(doorId === '') {
				if(this.isLeft(charType)) {
					this.lefts[this.lefts.length - 1].push(left);
				}
				if(this.isRight(charType)) {
					this.rights[this.rights.length - 1].push(right);
				}
			} else {
				door = this.getDoor(doorId);
				if(!this.isLeft(door.side) && this.isLeft(charType)) {
					this.lefts[this.lefts.length - 1].push(left);
				} else {
					if(this.isLeft(charType)) {
						this.doors.push(faceMaker.door(this, left, door.to));
					}
					this.addWall(this.lefts);
				}
				if(!this.isRight(door.side) && this.isRight(charType)) {
					this.rights[this.rights.length - 1].push(right);
				} else {
					if(this.isRight(charType)) {
						this.doors.push(faceMaker.door(this, right, door.to));
					}
					this.addWall(this.rights);
				}
			}

			if(artId !== '') {
				artConstr = this.getArt(artId);
				if(this.isLeft(charType)) {
					art = faceMaker.art(this, left, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, left));
				}
				if(this.isRight(charType)) {
					art = faceMaker.art(this, right, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, right));
				}

				if(art) {
					if(art.f.subtype === 'image') {
						var img = new Image();
						img.src = art.f.src;
						img.id = art.f.id;
						img.className = 'art';
						this.images.push(img);
					}

					if(art.f.subtype === 'html') {
						var ifrm = document.createElement('iframe');
						ifrm.setAttribute('src', art.f.src);
						ifrm.className = 'html';
						ifrm.id = art.f.id;
						ifrm.height = artConstr.iFrameHeight || 600;
						ifrm.width = artConstr.iFrameWidth || 800;
						this.texts.push(ifrm);
					}

				}

			}
		}
	}
};


Room.prototype.expandCharType = function(charType) {
	if(charType === '-' || charType === '_' || charType === '|' || charType === '!') {
		return [charType];
	} else {
		if(charType == '#') {
			return ['|', '-'];
		}
		if(charType == '%') {
			return ['|', '_'];
		}
		if(charType == '+') {
			return ['!', '-'];
		}
		if(charType == '¤') {
			return ['!', '_'];
		}
	}
};


var getEdges = function(faces, dim) {
	var points = [];
	var goodPoints = [];
	var doors = [];
	var face, point;
	var toAdd;
	var cx, cy, cz;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

	for(var i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {
			toAdd = {
				p0: true,
				p1: true,
				p2: true,
				p3: true
			};

			for(var j = 0; j < points.length; j++) {
				point = points[j];
				if(face.p0.x === point.x && face.p0.y === point.y && face.p0.z === point.z) {
					point.cpt++;
					toAdd.p0 = false;
				}
				if(face.p1.x === point.x && face.p1.y === point.y && face.p1.z === point.z) {
					point.cpt++;
					toAdd.p1 = false;
				}
				if(face.p2.x === point.x && face.p2.y === point.y && face.p2.z === point.z) {
					point.cpt++;
					toAdd.p2 = false;
				}
				if(face.p3.x === point.x && face.p3.y === point.y && face.p3.z === point.z) {
					point.cpt++;
					toAdd.p3 = false;
				}
			}
			if(toAdd.p0) {
				points.push({
					x: face.p0.x,
					y: face.p0.y,
					z: face.p0.z,
					X: face.p0.X,
					Y: face.p0.Y,
					cpt: 1
				});
			}
			if(toAdd.p1) {
				points.push({
					x: face.p1.x,
					y: face.p1.y,
					z: face.p1.z,
					X: face.p1.X,
					Y: face.p1.Y,
					cpt: 1
				});
			}
			if(toAdd.p2) {
				points.push({
					x: face.p2.x,
					y: face.p2.y,
					z: face.p2.z,
					X: face.p2.X,
					Y: face.p2.Y,
					cpt: 1
				});
			}
			if(toAdd.p3) {
				points.push({
					x: face.p3.x,
					y: face.p3.y,
					z: face.p3.z,
					X: face.p3.X,
					Y: face.p3.Y,
					cpt: 1
				});
			}
		}
	}

	// for (var d=0; d<doors.length; d++) {
	//   var bary = barycenter([doors[i].p2, doors[i].p3]);
	//   points.push({
	//     x: bary.x,
	//     y: bary.y,
	//     z: bary.z,
	//   });
	// }
	cx = cy = cz = 0;

	for(var k = 0; k < points.length; k++) {
		if(points[k].cpt === 1) {
			goodPoints.push(points[k]);
			cx += points[k].x;
			cy += points[k].y;
			cz += points[k].z;
		}
	}

	cx = cx / goodPoints.length;
	cy = cy / goodPoints.length;
	cz = cz / goodPoints.length;


	if(goodPoints.length > 0) {
		point = goodPoints[0];
		for(var k = 0; k < goodPoints.length; k++) {
			var ux = point.x - cx;
			var uy = point.y - cy;
			var uz = point.z - cz;
			var vx = goodPoints[k].x - cx;
			var vy = goodPoints[k].y - cy;
			var vz = goodPoints[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				var cosTheta = (uy * vy + uz * vz);
				var sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				var cosTheta = (ux * vx + uz * vz);
				var sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				var cosTheta = (ux * vx + uy * vy);
				var sinTheta = (ux * vy - uy * vx);
			}
			var theta = Math.atan(sinTheta / cosTheta);
			if(cosTheta >= 0) {
				goodPoints[k].theta = theta;
			} else {
				goodPoints[k].theta = theta + Math.PI;
			}

			// goodPoints[k].cosTheta = cosTheta;
			// goodPoints[k].sinTheta = sinTheta;
			// goodPoints[k].cx = cx;
			// goodPoints[k].cy = cy;
			// goodPoints[k].cz = cz;
		}

		goodPoints.sort(function(p0, p1) {
			return p0.theta - p1.theta;
		});

	}
	return goodPoints;
};



var getEdges2 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var goodPoints = [];
	var doors = [];
	var face, point;
	var toAdd;
	var cx, cy, cz;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {
			// if(!face.p0.behind) {
				points.push(face.p0);
			// }
			// if(!face.p1.behind) {
				points.push(face.p1);
			// }
			// if(!face.p2.behind) {
				points.push(face.p2);
			// }
			// if(!face.p3.behind) {
				points.push(face.p3);
			// }
		}
	}
	var spliced = false;
	// console.log(points.length);

	for (j=0; j< points.length-1; j++) {
		for (k=j+1; k < points.length; k++) {
			if (points[j].x === points[k].x && points[j].y === points[k].y && points[j].z === points[k].z) {
				points.splice(k, 1);
				k -= 1;
				spliced = true;
			}
		}
		if(spliced) {
			points.splice(j, 1);
			j -= 1;
			spliced = false;
		}
	}
	// console.log(points.length);

	cx = cy = cz = 0;

	for(k = 0; k < points.length; k++) {

		// if(points[k].behind) {
		// 	points[k] = points[k].face.pc;
		// }

		cx += points[k].x;
		cy += points[k].y;
		cz += points[k].z;
	}

	cx = cx / points.length;
	cy = cy / points.length;
	cz = cz / points.length;


	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {
			ux = point.x - cx;
			uy = point.y - cy;
			uz = point.z - cz;
			vx = points[k].x - cx;
			vy = points[k].y - cy;
			vz = points[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				cosTheta = (uy * vy + uz * vz);
				sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				cosTheta = (ux * vx + uz * vz);
				sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				cosTheta = (ux * vx + uy * vy);
				sinTheta = (ux * vy - uy * vx);
			}
			theta = Math.atan(sinTheta / cosTheta);
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			// goodPoints[k].cosTheta = cosTheta;
			// goodPoints[k].sinTheta = sinTheta;
			// goodPoints[k].cx = cx;
			// goodPoints[k].cy = cy;
			// goodPoints[k].cz = cz;
		}

		points.sort(function(p0, p1) {
			return p0.theta - p1.theta;
		});

	}
	return points;
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
};


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

Point.prototype.highlight = function(color, size) {

	var distH = Math.sqrt((this.x - camera.x.value) * (this.x - camera.x.value) + (this.z - camera.z.value) * (this.z - camera.z.value));
	var h = Math.abs(this.y - camera.y.value);

	this.projection();

	scr.ctx.save();
	scr.ctx.beginPath();
	scr.ctx.translate(this.X, this.Y);
	scr.ctx.scale(1, Math.sin(camera.rx.value + Math.asin(distH / this.distance)));
	scr.ctx.arc(0, 0, 25 * this.distance / distH, 0, 2 * Math.PI, false);
	scr.ctx.restore();

	scr.ctx.lineWidth = size || 5;
	scr.ctx.strokeStyle = color || 'rgb(0,0,255)';
	scr.ctx.stroke();
};

var Vector = function(p1, p2) {
	this.p1 = p1;
	this.p2 = p2;
	this.x = p2.x - p1.x;
	this.y = p2.y - p1.y;
	this.z = p2.z - p1.z;
};

Vector.prototype.draw = function(color) {
	this.p1.projection();
	this.p2.projection();

	scr.ctx.beginPath();
	scr.ctx.moveTo(this.p1.X, this.p1.Y);
	scr.ctx.lineTo(this.p2.X, this.p2.Y);
	scr.ctx.strokeStyle = (color || 'rgb(128,128,128)');
	scr.ctx.lineWidth = 4;
	scr.ctx.lineJoin = "round";
	scr.ctx.stroke();
};

var OrthonormalSet = function() {
	this.origin = new Point(null, [0, 0, 0]);
	this.px = new Point(null, [200, 0, 0]);
	this.py = new Point(null, [0, 200, 0]);
	this.pz = new Point(null, [0, 0, 200]);

	this.vx = new Vector(this.origin, this.px);
	this.vy = new Vector(this.origin, this.py);
	this.vz = new Vector(this.origin, this.pz);
};

OrthonormalSet.prototype.draw = function() {
	this.origin.highlight('green');
	this.vx.draw('yellow');
	this.px.highlight('yellow');
	this.vy.draw('orange');
	this.py.highlight('orange');
	this.vz.draw('red');
	this.pz.highlight('red');
};

Sound.prototype.increaseVolume = function() {
	for(var i = 0; i < 10; i++) {
		setTimeout($.proxy(function() {
			this.audio.volume += 0.1;
		}, this), 100 * i);
	}
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