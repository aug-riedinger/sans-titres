// ======== points constructor ========
var Point = function(parentFace, point, rotate) {
	this.face = parentFace;
	this.x = point[0];
	this.y = point[1];
	this.z = point[2];
	this.scale = 0;
	this.distance = 0;
	this.X = 0;
	this.Y = 0;
	this.inScreen = false;
	if(rotate) {
		this.x += rotate.x;
		this.y += rotate.y;
		this.z += rotate.z;
	}
	this.x = Math.round(this.x);
	this.y = Math.round(this.y);
	this.z = Math.round(this.z);

	return this;
};

// ======== points projection ========
Point.prototype.projection = function() {
	// ---- 3D rotation ----
	var p = camera.rotate(
	this.x - camera.x.value, this.y - camera.y.value, this.z - camera.z.value);

	this.p = p;
	if(this.face && this.face.f.type === 'floor') {
		this.behind = this.p.z <= -2 * params.focalLength;

	} else {
		this.behind = this.p.z <= -1 * params.focalLength;
	}
	// ---- distance to the camera ----
	var z = p.z + camera.focalLength;
	this.distance = Math.sqrt(p.x * p.x + z * z);
	// this.distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
	if(this.face) {
		if(this.distance > this.face.distance) {
			this.face.distance = this.distance;
		}
	}


	// --- 2D projection ----
	this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
	this.X = parseInt(((scr.width * 0.5) + (p.x * this.scale)), 10);
	this.Y = parseInt(((scr.height * 0.5) + (p.y * this.scale)), 10);
	// Hack to math.round;
	// this.X = ((scr.width  * 0.5) + (p.x * this.scale) + 0.5) << 0;
	// this.Y = ((scr.height * 0.5) + (p.y * this.scale) + 0.5) << 0;
	return true;

};