Camera.prototype.up = function(strength) {
	this.targetToPosition({
		x: this.x.target + params.unit * this.trig.sinY * (strength || 1),
		z: this.z.target + params.unit * this.trig.cosY * (strength || 1)
	});
};

Camera.prototype.down = function(strength) {
	this.targetToPosition({
		x: this.x.target - params.unit * this.trig.sinY * (strength || 1),
		z: this.z.target - params.unit * this.trig.cosY * (strength || 1)
	});
};

Camera.prototype.lft = function(strength) {
	this.targetToPosition({
		x: this.x.target - params.unit * this.trig.cosY * (strength || 1),
		z: this.z.target + params.unit * this.trig.sinY * (strength || 1)
	});
};

Camera.prototype.rght = function(strength) {
	this.targetToPosition({
		x: this.x.target + params.unit * this.trig.cosY * (strength || 1),
		z: this.z.target - params.unit * this.trig.sinY * (strength || 1)
	});
};

Camera.prototype.left = function(strength) {
	this.targetToPosition({
		ry: this.ry.target + Math.PI / 4 * (strength || 1) + 2 * Math.PI
	});
};

Camera.prototype.right = function(strength) {
	this.targetToPosition({
		ry: this.ry.target - Math.PI / 4 * (strength || 1) + 2 * Math.PI
	});
};


Camera.prototype.zoomIn = function() {
	this.zoom.setTarget(this.zoom.target * 1.25);
};

Camera.prototype.zoomOut = function() {
	this.zoom.setTarget(this.zoom.target * 0.8);
};

Camera.prototype.stop = function() {
	this.x.setTarget(this.x.value);
	this.y.setTarget(this.y.value);
	this.z.setTarget(this.z.value);
	this.rx.setTarget(this.rx.value);
	this.ry.setTarget(this.ry.value);
	this.zoom.setTarget(this.zoom.value);
};

var Keyboard = function(canvas_ID) {
	this.initEvents();

	return this;
};

Keyboard.prototype.initEvents = function() {
	window.addEventListener('keydown', function(event) {
		// console.log(event.keyCode);
		if(event.keyCode == 38 || event.keyCode == 90) { // Top || Z
			camera.up();
		}
		if(event.keyCode == 40 || event.keyCode == 83) { // Bottom || s
			camera.down();

		}
		if(event.keyCode == 39 || event.keyCode == 69) { // Right || e
			camera.right();
		}
		if(event.keyCode == 37 || event.keyCode == 65) { // Left || a
			camera.left();
		}
		if(event.keyCode == 68) { // d
			camera.rght();
		}
		if(event.keyCode == 81) { // q
			camera.lft();
		}
		if(event.keyCode == 32) { // space
			camera.stop();
		}
		if(event.keyCode == 82) { // r
			camera.zoomIn();
		}
		if(event.keyCode == 70) { // f
			camera.zoomOut();
		}
		if(event.keyCode == 27) { // f
			camera.godView();
		}
	}, false);

	window.addEventListener('keyup', function(event) {}, false);
};