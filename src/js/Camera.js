// ---- camera ----
var Camera = function(_x, _z) {
	this.focalLength = params.focalLength;
	this.x = new ge1doot.tweens.Add(100, _x, _x);
	this.y = new ge1doot.tweens.Add(100, -8*params.unit, params.height/2 - params.humanHeight);
	this.z = new ge1doot.tweens.Add(100, _z, _z);
	this.rx = new ge1doot.tweens.Add(100, -Math.PI/2, 0, true,- Math.PI/16, Math.PI/8);
	this.ry = new ge1doot.tweens.Add(100, 0,0, true);
	// this.ry = {
	// 	value:0
	// }
	this.zoom = new ge1doot.tweens.Add(100, 1, 1);
	this.inPosition = false;
	this.position = 0;
	this.godView = false;
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
	var dx = this.x.target - this.x.value;
	var dy = this.y.target - this.y.value;
	var dz = this.z.target - this.z.value;
	var drx = this.rx.target - this.rx.value;
	var dry = this.ry.target - this.ry.value;
	var dzoom = this.zoom.target - this.zoom.value;

	this.inPosition = (dx*dx + dy*dy + dz*dz < 10);

	if(this.inPosition) {
		$(scr.canvas).trigger('inPosition');
	}
}

Camera.prototype.targetToPosition = function(obj, strict) {
	var strict = (strict!==undefined?strict:true);
	var x = (obj.x||this.x.target);
	var y = (obj.y||this.y.target);
	var z = (obj.z||this.z.target);

	if(room.inside(x,z, true) || !strict) {
		this.x.setTarget(x);
		this.z.setTarget(z);
	}
	this.y.setTarget(y);
	// this.rx.setTarget(-Math.PI/2);
	// this.rx.setTarget((obj.rx ||this.rx.target));
	this.ry.setTarget((obj.ry||this.ry.target));

	this.zoom.setTarget((obj.zoom||this.zoom.target));
};


Camera.prototype.targetToFace = function (face) {
	this.targetToPosition({
		x: face.pv.x,
		y: face.pv.y,
		z: face.pv.z,
		rx: 0,
		ry: (face.ay + (Math.PI)),
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
	// this.y.setTarget(0);
	this.z.setTarget((room.center.z*params.unit||0) + this.focalLength);
	this.zoom.setTarget(1);
	// this.rx.setTarget(0);
};

Camera.prototype.goToPosition = function(id) {
	this.position = id % room.positions.length;
	this.x.setTarget(room.positions[this.position].x*params.unit||0);
	// this.y.setTarget(0);
	this.z.setTarget((room.positions[this.position].z*params.unit||0));
	this.zoom.setTarget(1);
	// this.rx.setTarget(0);

}

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
		this.rx.setTarget(-Math.PI/2+0.001);
		this.godView = true;
	} else {
		this.y.setTarget(params.height/2 - params.humanHeight);
		this.rx.setTarget(0);
		this.godView = false;
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

Camera.prototype.rotate = function (x, y, z) { // 2 Versions: 1 rotating around (0,0,0), 1 rotating around (0,0,-focalLength)

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

