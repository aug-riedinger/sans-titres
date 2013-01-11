
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
}

var logFaces = function() {
	for (var i in faces) {
		console.log( i +'- id:' + faces[i].f.id + ' distance:'+ faces[i].distance);
		console.log(faces[i].pc);
	}
}

var logPosition = function() {
	console.log('x: '+camera.x.value);
	console.log('y: '+camera.y.value);
	console.log('z: '+camera.z.value);
	console.log('rx: '+camera.rx.value);
	console.log('ry: '+camera.ry.value);

}

var getFaceById = function(faces, _id) {
	for (var i in faces) {
		if (faces[i].f.id == _id) {
			return faces[i];
		}
	}
	return null;
};

var getFloor = function(_x, _z) {
	for (var i=0; i< room.floors.length; i++) {
		if(parseInt(room.floors[i].f.id.split(':')[1]) === _x && parseInt(room.floors[i].f.id.split(':')[2]) === _z) {
			return room.floors[i];
		}
	}
}

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

var logFloor = function() {
	var map = [];
	var floor;
	var x, z;
	var res;

	for (var k=0; k< room.map.length; k++) {
		map.push(strGen(parseInt(room.map[k].length/2)*6));
	}
	for(var i=0; i<room.floors.length; i++) {
		floor = room.floors[i];

		x = floor.f.id.split(':')[1];
		z = floor.f.id.split(':')[2];

		if (room.map[room.map.length-1-z][2*x] !== '.') {
			if(floor.visible) {
				res = ',,,,,';
			} else {
				res = ''+(floor.conditions+10000);
			}
			if(parseInt(camera.x.value/params.unit) === parseInt(x) && parseInt(camera.z.value/params.unit) === parseInt(z)) {
				res += 'x';
			} else {
				res += '-';
			}
		}
		map[map.length-1-z] = map[map.length-1-z].replaceAt(6*x,res);
	}

	for (var j=0; j<map.length; j++) {
		console.log(map[j]);
	}
	// return map;
}