
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