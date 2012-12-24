// ---- camera ----
var camera = {
	focalLength: params.focalLength,
	x:  new ge1doot.tweens.Add(100),
	y:  new ge1doot.tweens.Add(100),
	z:  new ge1doot.tweens.Add(100, 0,0 + params.focalLength),
	// z:  new ge1doot.tweens.Add(100, 0 ,0),
	rx: new ge1doot.tweens.Add(100, 0,0, true),
	ry: new ge1doot.tweens.Add(100, 0,0, true),
	zoom: new ge1doot.tweens.Add(100, 0.1, 1),
	trig: {
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
	},
	targetToFace: function (target) {
		// ---- set position ----
		this.x.setTarget(target.pc.x);
		this.y.setTarget(target.pc.y);
		this.z.setTarget(target.pc.z);
		// ---- set view angles ----
		this.rx.setTarget((Math.PI * 0.5) - target.ax);
		this.ry.setTarget((Math.PI * 0.5) - target.ay);
		// ---- zoom ----
		this.zoom.setTarget(target.f.zoom ? target.f.zoom : 2);
	},
	targetToPosition : function(obj) {
		// ---- set position ----
		var x = (obj.x||this.x.target);
		var y = (obj.y||this.y.target);
		var z = (obj.z||this.z.target);

		if(this.inRoom(room.map,x,z)) {
			this.x.setTarget(x);
			this.y.setTarget(y);
			this.z.setTarget(z);
		}
		// ---- set view angles ----
		this.rx.setTarget((obj.rx ||this.rx.target));
		this.ry.setTarget((obj.ry||this.ry.target));
	},
	up : function(strength) {
		this.targetToPosition({
			x : this.x.target + params.unit*this.trig.sinY*(strength||1),
			z : this.z.target + params.unit*this.trig.cosY*(strength||1)
		});
	},
	down : function(strength) {
		this.targetToPosition({
			x : this.x.target - params.unit*this.trig.sinY*(strength||1),
			z : this.z.target - params.unit*this.trig.cosY*(strength||1)
		});
	},
	lft : function(strength) {
		this.targetToPosition({
			x : this.x.target - params.unit*this.trig.cosY*(strength||1),
			z : this.z.target + params.unit*this.trig.sinY*(strength||1)
		});
	},
	rght : function(strength) {
		this.targetToPosition({
			x : this.x.target + params.unit*this.trig.cosY*(strength||1),
			z : this.z.target - params.unit*this.trig.sinY*(strength||1)
		});
	},
	left : function(strength) {
		this.targetToPosition({
			ry : this.ry.target + Math.PI/4*(strength||1) + 2*Math.PI
		});
	},
	right : function(strength) {
		this.targetToPosition({
			ry : this.ry.target - Math.PI/4*(strength||1) + 2*Math.PI
		});
	},
	center: function () {
		this.x.setTarget(0);
		this.y.setTarget(0);
		this.z.setTarget(0 + params.focalLength);
		this.zoom.setTarget(1);
		this.rx.setTarget(0);
	},
	zoomIn: function () {
		this.zoom.setTarget(this.zoom.target*1.25);
	},
	zoomOut: function () {
		this.zoom.setTarget(this.zoom.target*0.8);
	},
	stop : function() {
		this.x.setTarget(this.x.value);
		this.y.setTarget(this.y.value);
		this.z.setTarget(this.z.value);
		this.rx.setTarget(this.rx.value);
		this.ry.setTarget(this.ry.value);
		this.zoom.setTarget(this.zoom.value);
	},
	toggleGodView: function() {
		if(this.y.value < 7*params.unit) {
			this.y.setTarget(-8*params.unit);
			this.rx.setTarget(-Math.PI/2);
		} else {
			this.y.setTarget(0);
			this.rx.setTarget(0);
		}
		this.zoom.setTarget(1);
	},
	move: function () {
		// ---- easing camera position and view angle ----
		ge1doot.tweens.iterate();
		// ---- pre calculate trigo ----
		this.trig.cosX = Math.cos(this.rx.value);
		this.trig.sinX = Math.sin(this.rx.value);
		this.trig.cosY = Math.cos(this.ry.value);
		this.trig.sinY = -Math.sin(this.ry.value);
	},
	rotate: function (x, y, z) { // 2 Versions: 1 rotating around (0,0,0), 1 rotating around (0,0,-folLength)
		// ---- 3D rotation ----

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
	},
	coordinates: function() {
		console.log('c: ('+Math.round(this.x.value/params.unit)+','+Math.round((this.z.value- params.focalLength)/params.unit)+')');
	},
	inRoom: function(map,_x,_z) {
		var x = Math.round(_x/params.unit);
		var z = Math.round((_z - params.focalLength)/params.unit);

		// console.log('c: ('+x+','+z+')');

		return (true && map[map.length-(z+1)] && map[map.length-(z+1)][2*x] && map[map.length-(z+1)][2*x] != '.');

	}
}