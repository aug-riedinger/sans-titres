
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


////////////////////
// 3D debug tools //
////////////////////

	Point.prototype.highlight = function (color,size) {
		this.projection();

		scr.ctx.beginPath();
		scr.ctx.arc(this.X, this.Y, 5, 0, 2 * Math.PI, false);
		// scr.ctx.fillStyle = 'green';
		// scr.ctx.fill();
		scr.ctx.lineWidth = size || 1;
		scr.ctx.strokeStyle = color || 'rgb(255,255,255)';
		scr.ctx.stroke();
	};

	var Vector = function (p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		this.x = p2.x - P1.x;
		this.y = p2.y - P1.y;
		this.z = p2.z - P1.z;
	}

	Vector.prototype.draw = function() {
		this.p1.highlight();
		this.p2.highlight();

		scr.ctx.moveTo(this.p1.X, this.p1.Y);
		scr.ctx.lineTo(this.p1.X, this.p2.Y);
		scr.ctx.strokeStyle = rgb(128,128,128);
		scr.ctx.lineWidth = 4;
		scr.ctx.lineJoin = "round";
		scr.ctx.stroke();
	}