var Camera = function(_x, _z) {
	this.focalLength = params.focalLength;
	this.x = new ge1doot.tweens.Add(100, _x, _x);
	this.y = new ge1doot.tweens.Add(100, -8 * params.unit, params.height / 2 - params.humanHeight);
	this.z = new ge1doot.tweens.Add(100, _z + this.focalLength, _z + this.focalLength);
	this.rx = new ge1doot.tweens.Add(100, -Math.PI / 2, 0, true, -Math.PI / 36, Math.PI / 8);
	this.ry = new ge1doot.tweens.Add(100, 0, 0, true);
	this.zoom = new ge1doot.tweens.Add(100, 1, 1);
	this.trig = {
		cosX: 1,
		cosY: 1,
		sinX: 0,
		sinY: 0
	};

	return this;
};

Camera.prototype.isInPosition = function() {
	var i;
	var dx, dy, dz;
	var inPosition, inMidPosition;

	dx = this.x.target - this.x.value;
	dy = this.y.target - this.y.value;
	dz = this.z.target - this.z.value;

	inPosition = (dx * dx + dy * dy + dz * dz < 10);

	if(inPosition) {
		$(scr.canvas).trigger('inPosition');

		for(i=0; i<sounds.length;i++) {
			if(!sounds[i].audio.paused) {
				sounds[i].adjustVolume();
			}
		}

	}

	if(this.midTarget) {
		dx = this.midTarget.x - this.x.value;
		dy = this.midTarget.y - this.y.value;
		dz = this.midTarget.z - this.z.value;

		inMidPosition = (dx * dx + dy * dy + dz * dz < 10);
		if(inMidPosition) {
			$(scr.canvas).trigger('inMidPosition');
		}
	}

};

Camera.prototype.targetToPosition = function(obj, strict) {
	strict = (strict !== undefined ? strict : true);
	var x = (obj.x !== undefined ? obj.x : this.x.target);
	var y = (obj.y !== undefined ? obj.y : params.height / 2 - params.humanHeight);
	var z = (obj.z !== undefined ? obj.z : this.z.target);

	this.midTarget = {
		x: this.x.value + (x - this.x.value)/2,
		y: this.y.value + (y - this.y.value)/2,
		z: this.z.value + (z - this.z.value)/2
	};

	this.x.setTarget(x, strict);
	this.z.setTarget(z, strict);
	this.y.setTarget(y, strict);
	this.rx.setTarget((obj.rx !== undefined ? obj.rx : this.rx.target), strict);
	this.ry.setTarget((obj.ry !== undefined ? obj.ry : this.ry.target), strict);

	this.zoom.setTarget((obj.zoom !== undefined ? obj.zoom : this.zoom.target));
};


Camera.prototype.targetToFace = function(face) {

	if(face.f.type === 'floor') {
		if(face.f.art) {
			return this.targetToPosition({
				x: face.pv.x,
				z: face.pv.z + this.focalLength,
				rx: Math.PI / 16,
				ry: face.f.art.f.ry * Math.PI / 2,
				zoom: 1
			}, true);
		} else {
			return this.targetToPosition({
				x: face.pv.x,
				z: face.pv.z + this.focalLength,
				rx: 0,
				zoom: 1
			}, true);
		}

	}

};

Camera.prototype.godView = function() {
	this.targetToPosition({
		y: -8 * params.unit,
		rx: -Math.PI / 2 + 0.001
	}, false);
};

Camera.prototype.move = function() {
	// ---- easing camera position and view angle ----
	ge1doot.tweens.iterate();

	if(cursor.strengthY !== 0 && this.rx.target === this.rx.value) {
		this.rx.setValue(this.rx.value - 0.02 * cursor.strengthY);
	}
	if(cursor.strengthX !== 0 && this.ry.target === this.ry.value) {
		this.ry.setValue(this.ry.value - 0.02 * cursor.strengthX);
	}

	// ---- pre calculate trigo ----
	this.trig.cosX = Math.cos(this.rx.value);
	this.trig.sinX = Math.sin(this.rx.value);
	this.trig.cosY = Math.cos(this.ry.value);
	this.trig.sinY = -Math.sin(this.ry.value);

	this.isInPosition();

};

Camera.prototype.rotate = function(x, y, z) {
	return {
		x: this.trig.cosY * x - this.trig.sinY * (z + this.focalLength),
		y: this.trig.sinX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) + this.trig.cosX * y,
		z: this.trig.cosX * (this.trig.cosY * (z + this.focalLength) + this.trig.sinY * x) - this.trig.sinX * y - this.focalLength
	};
};

Camera.prototype.coordinates = function() {
	console.log('c: (' + Math.round(this.x.value / params.unit) + ',' + Math.round((this.z.value - this.focalLength) / params.unit) + ')');
};
