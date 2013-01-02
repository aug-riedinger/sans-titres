// ======== points constructor ========
var Point = function (parentFace, point, rotate) {
	this.face = parentFace;
	this.x = point[0];
	this.y = point[1];
	this.z = point[2];
	this.scale = 0;
	this.distance = 0;
	this.X = 0;
	this.Y = 0;
	this.inScreen = false;
	if (rotate) {
		this.x += rotate.x;
		this.y += rotate.y;
		this.z += rotate.z;
	}
	
	return this;
};

// ======== points projection ========

Point.prototype.projection = function () {
	// ---- 3D rotation ----
	var p = camera.rotate(
		this.x - camera.x.value,
		this.y - camera.y.value,
		this.z - camera.z.value
		);

	// ---- distance to the camera ----
	var z = Math.abs(p.z) + camera.focalLength;
	this.distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
	if (this.face) {
		if (this.distance > this.face.distance) {
			this.face.distance = this.distance;
		}
	}

	
	// --- 2D projection ----
	// this.scale = 1;
	// this.scale = (camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value || 10000; // Me !!!
	// var calc = ((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value)|| 10000;
	// this.scale = calc>-params.focalLength?calc:-params.focalLength; // Me !!!
	this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
	// this.X = (scr.width  * 0.5) + (p.x * this.scale);
	// this.Y = (scr.height * 0.5) + (p.y * this.scale);
	this.X = (scr.width  * 0.5) + (p.x * this.scale);
	this.Y = (scr.height * 0.5) + (p.y * this.scale);

	this.inScreen = this.X >= 0 && this.X < scr.width && this.Y >= 0 && this.Y < scr.height;
	this.p = p;

	return true;

};

Point.prototype.highlight = function (color,size) {
	this.projection();

	scr.ctx.beginPath();
	scr.ctx.arc(this.X, this.Y, 5, 0, 2 * Math.PI, false);
	scr.ctx.lineWidth = size || 1;
	scr.ctx.strokeStyle = color || 'rgb(255,255,255)';
	scr.ctx.stroke();
};

var Vector = function (p1, p2) {
	this.p1 = p1;
	this.p2 = p2;
	this.x = p2.x - p1.x;
	this.y = p2.y - p1.y;
	this.z = p2.z - p1.z;
}

Vector.prototype.draw = function(color) {
	this.p1.projection();
	this.p2.projection();

	scr.ctx.beginPath();
	scr.ctx.moveTo(this.p1.X, this.p1.Y);
	scr.ctx.lineTo(this.p2.X, this.p2.Y);
	scr.ctx.strokeStyle = (color||'rgb(128,128,128)');
	scr.ctx.lineWidth = 4;
	scr.ctx.lineJoin = "round";
	scr.ctx.stroke();
}

var OrthonormalSet = function() {
	this.origin = new Point(null, [0,0,0]);
	this.px = new Point(null, [200,0,0]);
	this.py = new Point(null, [0,200,0]);
	this.pz = new Point(null, [0,0,200]);

	this.vx = new Vector(this.origin,this.px);
	this.vy = new Vector(this.origin,this.py);
	this.vz = new Vector(this.origin,this.pz);
}

OrthonormalSet.prototype.draw = function () {
	this.origin.highlight('green');
	this.vx.draw('yellow');
	this.px.highlight('yellow')
	this.vy.draw('orange');
	this.py.highlight('orange');
	this.vz.draw('red');
	this.pz.highlight('red');
}