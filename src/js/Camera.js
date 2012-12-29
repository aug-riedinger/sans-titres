// ---- camera ----
var Camera = function() {
	this.focalLength = params.focalLength;
	this.x = new ge1doot.tweens.Add(100);
	this.y = new ge1doot.tweens.Add(100);
	this.z = new ge1doot.tweens.Add(100, 0,0 + params.focalLength);
	// this.z = new ge1doot.tweens.Add(100, 0,0);
	this.rx = new ge1doot.tweens.Add(100, 0,0, true);
	this.ry = new ge1doot.tweens.Add(100, 0,0, true);
	this.zoom = new ge1doot.tweens.Add(100, 1, 1);
	this.inPosition = false;
	this.trig = {
		// that: this,
		cosX: 1,
		cosY: 1,
		sinX: 0,
		sinY: 0
		// calc : function() {
		// 	// ---- pre calculate trigo ----
		// 	this.cosX = Math.cos(this.that.rx.value);
		// 	this.sinX = Math.sin(this.that.rx.value);
		// 	this.cosY = Math.cos(this.that.ry.value);
		// 	this.sinY = Math.sin(this.that.ry.value);
		// }
	};

	return this;
}

Camera.prototype.isInPosition = function() {
	var dx = Math.abs(this.x.target - this.x.value);
	var dy = Math.abs(this.y.target - this.y.value);
	var dz = Math.abs(this.z.target - this.z.value);
	var drx = Math.abs(this.rx.target - this.rx.value);
	var dry = Math.abs(this.ry.target - this.ry.value);
	var dzoom = Math.abs(this.zoom.target - this.zoom.value);

	this.inPosition = (dx*dx + dy*dy + dz*dz < 10);

	if(this.inPosition) {
		$(scr.canvas).trigger('inPosition');
	}
}

Camera.prototype.targetToPosition = function(obj, strict) {
	var strict = (strict!=undefined?strict:true);
	var x = (obj.x||this.x.target);
	var y = (obj.y||this.y.target);
	var z = (obj.z||this.z.target);

	if(this.inRoom(room,x,z) || !strict) {
		this.x.setTarget(x);
		this.y.setTarget(y);
		this.z.setTarget(z);
	}
	this.rx.setTarget((obj.rx ||this.rx.target));
	this.ry.setTarget((obj.ry||this.ry.target));

	this.zoom.setTarget((obj.zoom||this.zoom.target));
};

Camera.prototype.targetToFace = function (face) {
	this.targetToPosition({
		x: face.pv.x,
		y: face.pv.y,
		z: face.pv.z + this.focalLength,
		rx: 0,
		ry: (face.ay - (Math.PI * 0.5)),
		zoom: 1
	});
};

Camera.prototype.up = function(strength) {
	this.targetToPosition({
		x : this.x.target + params.unit*this.trig.sinY*(strength||1),
		z : this.z.target + params.unit*this.trig.cosY*(strength||1)
	});
};

Camera.prototype.down = function(strength) {
	this.targetToPosition({
		x : this.x.target - params.unit*this.trig.sinY*(strength||1),
		z : this.z.target - params.unit*this.trig.cosY*(strength||1)
	});
};

Camera.prototype.lft = function(strength) {
	this.targetToPosition({
		x : this.x.target - params.unit*this.trig.cosY*(strength||1),
		z : this.z.target + params.unit*this.trig.sinY*(strength||1)
	});
};

Camera.prototype.rght = function(strength) {
	this.targetToPosition({
		x : this.x.target + params.unit*this.trig.cosY*(strength||1),
		z : this.z.target - params.unit*this.trig.sinY*(strength||1)
	});
};

Camera.prototype.left = function(strength) {
	this.targetToPosition({
		ry : this.ry.target + Math.PI/4*(strength||1) + 2*Math.PI
	});
};

Camera.prototype.right = function(strength) {
	this.targetToPosition({
		ry : this.ry.target - Math.PI/4*(strength||1) + 2*Math.PI
	});
};

Camera.prototype.center = function () {
	this.x.setTarget(room.center.x*params.unit||0);
	this.y.setTarget(0);
	this.z.setTarget((room.center.z*params.unit||0) + this.focalLength);
	this.zoom.setTarget(1);
	this.rx.setTarget(0);
};

Camera.prototype.zoomIn = function () {
	this.zoom.setTarget(this.zoom.target*1.25);
};

Camera.prototype.zoomOut = function () {
	this.zoom.setTarget(this.zoom.target*0.8);
};

Camera.prototype.stop = function() {
	this.x.setTarget(this.x.value);
	this.y.setTarget(this.y.value);
	this.z.setTarget(this.z.value);
	this.rx.setTarget(this.rx.value);
	this.ry.setTarget(this.ry.value);
	this.zoom.setTarget(this.zoom.value);
};

Camera.prototype.toggleGodView = function() {
	if(this.y.value > -7*params.unit) {
		this.y.setTarget(-8*params.unit);
		this.rx.setTarget(-Math.PI/2);
	} else {
		this.y.setTarget(0);
		this.rx.setTarget(0);
	}
	this.zoom.setTarget(1);
};

Camera.prototype.move = function () {
		// ---- easing camera position and view angle ----
		ge1doot.tweens.iterate();
		// ---- pre calculate trigo ----
		this.trig.cosX = Math.cos(this.rx.value);
		this.trig.sinX = Math.sin(this.rx.value);
		this.trig.cosY = Math.cos(this.ry.value);
		this.trig.sinY = -Math.sin(this.ry.value);

		this.isInPosition();

	};

Camera.prototype.rotate = function (x, y, z) { // 2 Versions: 1 rotating around (0,0,0), 1 rotating around (0,0,-folLength)

	var noFocal = {
		x: this.trig.cosY * x - this.trig.sinY * z,
		y: this.trig.sinX * (this.trig.cosY * z + this.trig.sinY * x) + this.trig.cosX * y,
		z: this.trig.cosX * (this.trig.cosY * z + this.trig.sinY * x) - this.trig.sinX * y			
	}

	var withFocal = {
		x: this.trig.cosY * x - this.trig.sinY * (z + this.focalLength),
		y: this.trig.sinX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) + this.trig.cosX * y,
		z: this.trig.cosX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) - this.trig.sinX * y - this.focalLength
	}

	return withFocal;
};

Camera.prototype.coordinates = function() {
	console.log('c: ('+Math.round(this.x.value/params.unit)+','+Math.round((this.z.value- this.focalLength)/params.unit)+')');
};

Camera.prototype.inRoom = function(room,_x,_z) {
	var x = Math.round(_x/params.unit ) - (room.position.x||0);
	var z = Math.round((_z - this.focalLength)/params.unit) - (room.position.z||0);

	// console.log('c: ('+x+','+z+')');

	return (true && room.map[room.map.length-(z+1)] && room.map[room.map.length-(z+1)][2*x] && room.map[room.map.length-(z+1)][2*x] != '.');
};