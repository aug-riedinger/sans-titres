
var logCam = function() {
	console.log('x: '+camera.x.value);
	console.log('y: '+camera.y.value);
	console.log('z: '+camera.z.value);
	console.log('rx: '+camera.rx.value);
	console.log('ry: '+camera.ry.value);
};

var logMyFace = function(_id) {
	var face = null;
	for (var i in faces) {
		if (faces[i].f.id == _id) {
			face = faces[i];
		}
	}
	console.log( i +'- id:' + face.f.id + ' distance:'+ face.distance+'visible : '+ face.visible);
	console.log(face.pc.X +' - '+ face.pc.Y +' - '+ face.pc.scale);
	console.log(face.psc.X +' - '+ face.psc.Y +' - '+ face.psc.scale);

	console.log(face.p0.X +' - '+ face.p0.Y +' - '+ face.p0.scale);
	console.log(face.p1.X +' - '+ face.p1.Y +' - '+ face.p1.scale);
	console.log(face.p2.X +' - '+ face.p2.Y +' - '+ face.p2.scale);
	console.log(face.p3.X +' - '+ face.p3.Y +' - '+ face.p3.scale);
};

var logFaces = function() {
	for (var i in faces) {
		console.log( i +'- id:' + faces[i].f.id + ' distance:'+ faces[i].distance);
		console.log(faces[i].pc);
	}
};

var logPosition = function() {
	console.log('x: '+camera.x.value);
	console.log('y: '+camera.y.value);
	console.log('z: '+camera.z.value);
	console.log('rx: '+camera.rx.value);
	console.log('ry: '+camera.ry.value);

};

var getFaceById = function(faces, _id) {
	for (var i in faces) {
		if (faces[i].f.id == _id) {
			return faces[i];
		}
	}
	return null;
};

var getFloor = function(_x, _z, _room) {
	var i, j;
	var floor;
	_room = _room||room;
	for (i=0; i< _room.floors.length; i++) {
		for (j=0; j<_room.floors[i].length; j++) {
			floor = _room.floors[i][j];
			if(parseInt(floor.f.id.split(':')[1], 10) === _x && parseInt(floor.f.id.split(':')[2], 10) === _z) {
				return floor;
			}
		}
	}
};

var getWall = function(_x, _z, wall, _room) {
	_room = _room||room;
	for (var i=0; i< wall.length; i++) {
		if(parseInt(wall[i].f.id.split(':')[1], 10) === _x && parseInt(wall[i].f.id.split(':')[2], 10) === _z) {
			return wall[i];
		}
	}
};

var logConditions = function() {
	var cpt = [ 0, 0, 0, 0, 0];
	for (var i=0;i<room.faces.length;i++) {
		if(!room.faces[i].visible) {
			for(var j=0; j < room.faces[i].conditions.length; j++) {
				cpt[room.faces[i].conditions[j]]++;
			}
		}
	}
	return cpt;
}

String.prototype.replaceAt=function(index, char) {
	return this.substr(0, index) + char + this.substr(index+char.length);
}

var strGen = function(length) {
	var res = '';
	for(var i=0; i< length; i++) {
		res+='.';
	}
	return res
}

var logFloor = function(_room) {
	var _room = _room||room;
	var map = [];
	var floor;
	var x, z;
	var res;
	for (var k=0; k< _room.map.length +2; k++) {
		map.push(strGen(parseInt(_room.map[0].length/2+2, 10)*6));
	}
	for(var i=0; i<_room.floors.length; i++) {
		for(var j=0; j<_room.floors[i].length; j++) {
			floor = _room.floors[i][j];

			x = parseInt(floor.f.id.split(':')[1], 10) +1;
			z = parseInt(floor.f.id.split(':')[2], 10)+1;

		// if (_room.map[_room.map.length-1-z][2*x] !== '.') {

			res = ''+(floor.conditions+10000);
			if(parseInt(camera.x.value/params.unit - _room.position.x, 10) === x && parseInt((camera.z.value - camera.focalLength)/params.unit - _room.position.z, 10) === z) {
				res += 'x';
			} else {
				res += '-';
			}
		// }
		map[z] = map[z].replaceAt(6*x,res);

	}
}

for (var j=map.length-1; j>=0; j--) {
	console.log(map[j]);
}
	// return map;
};

var logFaces = function(faces, _room) {
	var _room = _room||room;
	var map = [];
	var face;
	var x, z;
	var res;
	for (var k=0; k< _room.map.length; k++) {
		map.push(strGen(parseInt(_room.map[0].length/2, 10)*6));
	}
	for(var i=0; i<faces.length; i++) {
		face = faces[i];

		x = parseInt(face.f.id.split(':')[1], 10);
		z = parseInt(face.f.id.split(':')[2], 10);

		// if (_room.map[_room.map.length-1-z][2*x] !== '.') {

			res = ''+(face.conditions+10000);
			if(parseInt(camera.x.value/params.unit - _room.position.x, 10) === x && parseInt((camera.z.value - camera.focalLength)/params.unit - _room.position.z, 10) === z) {
				res += 'x';
			} else {
				res += '-';
			}
		// }
		map[z] = map[z].replaceAt(6*x,res);
	}

	for (var j=map.length-1; j>=0; j--) {
		console.log(map[j]);
	}
	// return map;
};

var concatWall = function(faces) {
	var depth, depth2;
	var res = [];
	for(depth in faces) {
		if(faces.hasOwnProperty(depth)) {
			for(depth2 in faces[depth]) {
				if (faces[depth].hasOwnProperty(depth2)) {
					for (var i=0; i< faces[depth][depth2].length; i++){
						res.push(faces[depth][depth2][i]);
					}
				}
			}
		}
	}
	return res;
};


var getWalls = function(_room) {
	var _room = _room||room;
	var faces = [];

	for(var j=0; j< concatWall(rooms[i].tops).length; j++){
		faces.push(concatWall(rooms[i].tops)[j]);
	}
	for(var j=0; j< concatWall(rooms[i].bottoms).length; j++){
		faces.push(concatWall(rooms[i].bottoms)[j]);
	}
	for(var j=0; j< concatWall(rooms[i].lefts).length; j++){
		faces.push(concatWall(rooms[i].lefts)[j]);
	}
	for(var j=0; j< concatWall(rooms[i].rights).length; j++){
		faces.push(concatWall(rooms[i].rights)[j]);
	}

	return faces;
};

var getTargetedFace = function() {
	var faces = getWalls();
	for (var i=0; i< faces.length; i++) {
		face = room.faces[i];
		if(cursor.faceSelected(face)) {
			console.log(face);
		}
	}
}