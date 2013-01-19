(function() {
	var 
		fullScreenApi = { 
			supportsFullScreen: false,
			isFullScreen: function() { return false; }, 
			requestFullScreen: function() {}, 
			cancelFullScreen: function() {},
			fullScreenEventName: '',
			prefix: ''
		},
		browserPrefixes = 'webkit moz o ms khtml'.split(' ');
	
	// check for native support
	if (typeof document.cancelFullScreen != 'undefined') {
		fullScreenApi.supportsFullScreen = true;
	} else {	 
		// check for fullscreen support by vendor prefix
		for (var i = 0, il = browserPrefixes.length; i < il; i++ ) {
			fullScreenApi.prefix = browserPrefixes[i];
			
			if (typeof document[fullScreenApi.prefix + 'CancelFullScreen' ] != 'undefined' ) {
				fullScreenApi.supportsFullScreen = true;
				
				break;
			}
		}
	}
	
	// update methods to do something useful
	if (fullScreenApi.supportsFullScreen) {
		fullScreenApi.fullScreenEventName = fullScreenApi.prefix + 'fullscreenchange';
		
		fullScreenApi.isFullScreen = function() {
			switch (this.prefix) {	
				case '':
					return document.fullScreen;
				case 'webkit':
					return document.webkitIsFullScreen;
				default:
					return document[this.prefix + 'FullScreen'];
			}
		}
		fullScreenApi.requestFullScreen = function(el) {
			return (this.prefix === '') ? el.requestFullScreen() : el[this.prefix + 'RequestFullScreen']();
		}
		fullScreenApi.cancelFullScreen = function(el) {
			return (this.prefix === '') ? document.cancelFullScreen() : document[this.prefix + 'CancelFullScreen']();
		}		
	}

	// jQuery plugin
	if (typeof jQuery != 'undefined') {
		jQuery.fn.requestFullScreen = function() {
	
			return this.each(function() {
				var el = jQuery(this);
				if (fullScreenApi.supportsFullScreen) {
					fullScreenApi.requestFullScreen(el);
				}
			});
		};
	}

	// export api
	window.fullScreenApi = fullScreenApi;	
})();
////////////////////////////////////////////////////////////
// ==== In Out Easing - notime version ====
// @author Gerard Ferrandez / http://www.dhteumeuleu.com/
// last update: Jan 12, 2012
// Licensed under CC-BY - do not remove this notice
////////////////////////////////////////////////////////////
var ge1doot = ge1doot || {};

ge1doot.tweens = {
	first: false,
	prev: false,
	iterate: function() {
		var obj = this.first;
		do {
			obj.ease();
			obj = obj.next;
		} while (obj);
	}
};

ge1doot.tweens.Add = function(steps, initValue, initValueTarget, isAngle, minValue, maxValue) {
	this.target = initValueTarget || 0;
	this.value = initValue || 0;
	this.steps = steps;
	this.isAngle = isAngle || false;
	this.speedMod = 1;
	this.minValue = minValue;
	this.maxValue = maxValue;
	// ---- used for normalizing angles ----
	if(isAngle) {
		this.normalizePI = function() {
			if(Math.abs(this.target - this.value) > Math.PI) {
				if(this.target < this.value) this.value -= 2 * Math.PI;
				else this.value += 2 * Math.PI;
			}
		};
	}
	// ---- init target ----
	this.setTarget(this.target, 1, false);
	// ---- add tween in queue ----
	if(!ge1doot.tweens.first) {
		ge1doot.tweens.first = this;
	} else {
		ge1doot.tweens.prev.next = this;
	}
	ge1doot.tweens.prev = this;
};

// ---- set target ----
ge1doot.tweens.Add.prototype.setTarget = function(target, strict) {
	this.speedMod = 1;
	strict = (strict !== undefined ? strict : true);
	this.target = target;
	// ---- normalize PI ----
	if(this.isAngle) {
		this.target = this.target % (2 * Math.PI);
		this.normalizePI();
	}
	this.locked = false;
	if(strict) {
		if(this.minValue && target < this.minValue) {
			this.target = this.minValue;
		}
		if(this.maxValue && target > this.maxValue) {
			this.target = this.maxValue;
		}
	} else {
		if((this.minValue && target < this.minValue) || (this.maxValue && target > this.maxValue)) {
			this.locked = true;
		}
	}
	// ---- set target ----
	if(this.running && this.oldTarget === target) {
		return;
	}
	this.oldTarget = target;
	this.running = true;
	this.prog = 0;
	this.from = this.value;
	this.dist = -(this.target - this.from) * 0.5;
};
// ---- easing ----
ge1doot.tweens.Add.prototype.ease = function() {
	if(!this.running) {
		return;
	}
	var s = this.speedMod * this.steps;
	if(this.prog++ < s) {
		// ---- inOut easing ----
		this.value = this.dist * (Math.cos(Math.PI * (this.prog / s)) - 1) + this.from;
		// ---- normalize PI ----
		if(this.isAngle) this.normalizePI();
	} else {
		// ---- stop ----
		this.running = false;
		this.value = this.target;
	}
};

ge1doot.tweens.Add.prototype.setValue = function(value) {

	if(this.isAngle) {
		this.normalizePI();
	}
	this.running = false;
	if(!this.locked) {
		if(this.minValue && value < this.minValue) {
			return this.target = this.value = this.minValue;
		}
		if(this.maxValue && value > this.maxValue) {
			return this.target = this.value = this.maxValue;
		}
		return this.target = this.value = value;
	}
};
var scr;
var rooms = [];
var cursor;
var keyboard;
var camera;

var SLOW = false;
var cpt = 100;

var showing;

var params = {
	unit: 1000,
	height: 4000,
	focalLength: 1000,
	humanHeight: 300,
	wallDist: 0,
	artDist: 500,
	cursorX: 4,
	cursorY: 6
};

var colors = {
	'floor': '#80827d',
	'aimedFloor': '#70726D',
	// 'gradient': '#F9F9F9',
	'top': '#E9E9E9',
	'bottom': '#E9E9E9',
	'left': '#D9D9D9',
	'right': '#D9D9D9'
};
var Screen = function (ids) {
	this.container = document.getElementById(ids.container);
	this.canvas = document.getElementById(ids.canvas);
	this.ctx = this.canvas.getContext("2d");
	this.setSize();
	this.initEvents();

	return this;
};

Screen.prototype.setSize = function() {
	// ---- size ----
	this.width  = this.container.offsetWidth;
	this.height = this.container.offsetHeight;
	// ---- offset ----
	var o = this.container;
	for (this.left = 0, this.top = 0; o !== null; o = o.offsetParent) {
		this.left += o.offsetLeft;
		this.top  += o.offsetTop;
	}
	// ---- canvas resize ----
	if (this.canvas) {
		this.canvas.width  = this.width;
		this.canvas.height = this.height;
	}
};

Screen.prototype.initEvents = function() {
	var that = this;
	window.addEventListener('resize', function () {
		that.setSize();
	}, false);

	window.addEventListener('keydown', function(event) {
	// $(document).keypress(function(e) {
		if(event.keyCode == 13) { // enter
			window.fullScreenApi.requestFullScreen(document.getElementsByTagName('body')[0]);
		}
	});
};
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
	var dx = this.x.target - this.x.value;
	var dy = this.y.target - this.y.value;
	var dz = this.z.target - this.z.value;
	var drx = this.rx.target - this.rx.value;
	var dry = this.ry.target - this.ry.value;
	var dzoom = this.zoom.target - this.zoom.value;

	var inPosition = (dx * dx + dy * dy + dz * dz < 10);

	if(inPosition) {
		$(scr.canvas).trigger('inPosition');
	}
};

Camera.prototype.targetToPosition = function(obj, strict) {
	strict = (strict !== undefined ? strict : true);
	var x = (obj.x !== undefined ? obj.x : this.x.target);
	var y = (obj.y !== undefined ? obj.y : params.height / 2 - params.humanHeight);
	var z = (obj.z !== undefined ? obj.z : this.z.target);

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

var Cursor = function(canvas_ID, segmentX, segmentY) {
	this.segmentX = segmentX;
	this.segmentY = segmentY;
	this.container = document.getElementById(canvas_ID);

	this.X = 0;
	this.Y = 0;
	this.strengthX = 0;
	this.strengthY = 0;
	this.aimedFace = null;
	this.going = null;
	// this.moving = false;
	this.initEvents();

	return this;
};

Cursor.prototype.initEvents = function() {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);

		if(that.muted && (Math.abs(that.muted.X - that.X) > 20 || Math.abs(that.muted.Y - that.Y) > 20)) {
			that.muted = null;
			console.log('unmuted');
		}

		that.calcStrength();

		that.aimedFace = that.inFace();
		that.setCursor();
	};

	this.container.onclick = function(e) {
		var roomId, artId, title;

		if(that.aimedFace) {
			roomId = parseInt(that.aimedFace.f.id.split(':')[0], 10);
			
			if(that.aimedFace.f.type === 'art') {
				artId = that.aimedFace.f.artId || null;
				showHtml(that.aimedFace.html);
				$('#artInfo').fadeOut(1000);
			}

			if(that.aimedFace.f.type === 'floor') {
				if(that.aimedFace.f.art) {
					artId = that.aimedFace.f.art.f.artId || null;
					camera.targetToFace(that.aimedFace);
					$(scr.canvas).one('inPosition', $.proxy(function() {
						cursor.mute();
						$('#artTitle').html(this.f.art.f.info.title || 'Inconnu');
						$('#artAuthor').html(this.f.art.f.info.author || 'Inconnu');
						$('#artDescription').html(this.f.art.f.info.description || 'Inconnu');
						$('#artInfo').fadeIn(1000, function() {
							setTimeout(function() {
								$('#artInfo').fadeOut(1000);
							}, 3000);
						});
					},that.aimedFace));
				} else {
					camera.targetToFace(that.aimedFace);
					if(roomId !== rooms[0].id) {
						enteredRoom(roomId);
					}
				}
			}
			if (!history.state || history.state.roomId !== roomId || history.state.artId !== artId) {
				title = 'Sans-titres, Salle ' + roomId + (artId?' Oeuvre ' + artId:'');
				history.pushState({
					roomId: roomId,
					artId: artId
				}, title, '#!room=' + roomId + (artId?'&art=' + artId:''));
				document.title = title;
			}
		}

		e.preventDefault();
		return false;
	};

	this.container.ondblclick = function(e) {
		camera.godView();
		e.preventDefault();
		return false;
	};

	this.container.onmspointerdown = this.container.ontouchstart = this.container.onmousedown = function(e) {};

	this.container.onmspointerup = this.container.ontouchend = this.container.onmouseup = function(e) {};

	this.container.onmspointercancel = this.container.ontouchcancel = function(e) {};

};

Cursor.prototype.mute = function() {
	this.muted = {
		X: this.X,
		Y: this.Y
	};
	this.calcStrength();
	// this.aimedFace = this.inFace();
	this.setCursor();
};

Cursor.prototype.calcStrength = function() {

	if(this.muted) {
		return this.strengthX = this.strengthY = 0;
	}

	if(this.X > scr.width / this.segmentX && this.X < scr.width - scr.width / this.segmentX) {
		this.strengthX = 0;
		// this.moving = false;
	}

	if(this.X < scr.width / this.segmentX) {
		this.strengthX = (this.X - scr.width / this.segmentX) / (scr.width / this.segmentX);
		// this.moving = true;
	}
	if(this.X > scr.width - scr.width / this.segmentX) {
		this.strengthX = 1 - (scr.width - this.X) / (scr.width / this.segmentX);
		// this.moving = true;
	}

	if(this.Y > scr.height / this.segmentY && this.Y < scr.height - scr.height / this.segmentY) {
		this.strengthY = 0;
		// this.moving = false;
	}

	if(this.Y < scr.height / this.segmentY) {
		this.strengthY = (this.Y - scr.height / this.segmentY) / (scr.height / this.segmentY);
		// this.moving = true;
	}
	if(this.Y > scr.height - scr.height / this.segmentY) {
		this.strengthY = 1 - (scr.height - this.Y) / (scr.height / this.segmentY);
		// this.moving = true;
	}
};

Cursor.prototype.inTriangle = function(p1, p2, p3) {
	// ---- Compute vectors ----
	var v0x = p3.X - p1.X;
	var v0y = p3.Y - p1.Y;
	var v1x = p2.X - p1.X;
	var v1y = p2.Y - p1.Y;
	var v2x = this.X - p1.X;
	var v2y = this.Y - p1.Y;
	// ---- Compute dot products ----
	var dot00 = v0x * v0x + v0y * v0y;
	var dot01 = v0x * v1x + v0y * v1y;
	var dot02 = v0x * v2x + v0y * v2y;
	var dot11 = v1x * v1x + v1y * v1y;
	var dot12 = v1x * v2x + v1y * v2y;
	// ---- Compute barycentric coordinates ----
	var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	// ---- Check if point is in triangle ----
	return(u >= 0) && (v >= 0) && (u + v < 1);
};

Cursor.prototype.inFace = function() {
	var i, j, k;
	var face;
	var room;

	for(k=0; k<rooms.length; k++) {
		room = rooms[k];

		for(i = 0; i < room.arts.length; i++) {
			face = room.arts[i];
			if(this.faceSelected(face)) {
				return face;
			}
		}

		for(i = 0; i < room.floors.length; i++) {
			face = room.floors[i];
			face.projection();
			if(this.faceSelected(face)) {
				return face;
			}
		}
	}

	return null;
};

Cursor.prototype.faceSelected = function(face) {
	return(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3)));
};

Cursor.prototype.setCursor = function() {
	if(this.strengthY < 0 && this.strengthX < 0) {
		return this.changeClass('top-left');
	}
	if(this.strengthY < 0 && this.strengthX > 0) {
		return this.changeClass('top-right');
	}
	if(this.strengthY > 0 && this.strengthX < 0) {
		return this.changeClass('bottom-left');
	}
	if(this.strengthY > 0 && this.strengthX > 0) {
		return this.changeClass('bottom-right');
	}

	if(this.strengthY < 0) {
		return this.changeClass('top');
	}
	if(this.strengthY > 0) {
		return this.changeClass('bottom');
	}

	if(this.strengthX > 0) {
		return this.changeClass('right');
	}
	if(this.strengthX < 0) {
		return this.changeClass('left');
	}

	if(this.aimedFace) {
		if(this.aimedFace.f.type === 'art') {
			return this.changeClass('see');
		}
		if(this.aimedFace.f.type === 'floor') {
			return this.changeClass('go');
		}
	}
	return this.changeClass('');
};

Cursor.prototype.changeClass = function(class_name) {
	if(this.container.className !== class_name) {
		return this.container.className = class_name;
	}
}
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

	// this.p = p;

	this.behind = p.z <= -1 * params.focalLength;

	// ---- distance to the camera ----
	var z = p.z + camera.focalLength;
	this.distance = Math.sqrt(p.x * p.x + z * z);
	// this.distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
	if(this.face) {
		if(this.behind) {
			this.face.nbBehind+=1;
		}
		if(this.distance > this.face.distance) {
			this.face.distance = this.distance;
		}
	}

	// --- 2D projection ----
	this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
	// this.X = parseInt(((scr.width * 0.5) + (p.x * this.scale)), 10);
	// this.Y = parseInt(((scr.height * 0.5) + (p.y * this.scale)), 10);
	// Hack to math.round;
	this.X = ((scr.width  * 0.5) + (p.x * this.scale) + 0.5) | 0;
	this.Y = ((scr.height * 0.5) + (p.y * this.scale) + 0.5) | 0;
	// this.X = ((scr.width  * 0.5) + (p.x * this.scale) + 0.5) << 0;
	// this.Y = ((scr.height * 0.5) + (p.y * this.scale) + 0.5) << 0;
	return true;

};
	// ======= faces constructor ========
	var Face = function(f) {
		this.f = f;
		var w = f.w * 0.5;
		var h = f.h * 0.5;
		var ax = f.rx * Math.PI * 0.5;
		var ay = f.ry * Math.PI * 0.5;
		this.visible = true;
		// ---- 3D transform ----
		var transform = function(x, y, z, ax, ay) {
			var tz = z * Math.cos(ay) + x * Math.sin(ay);
			var ty = y * Math.cos(ax) + tz * Math.sin(ax);
			return {
				x: x * Math.cos(ay) - z * Math.sin(ay),
				y: ty,
				z: tz * Math.cos(ax) - y * Math.sin(ax)
			};
		};
		// ---- center point ----
		this.pc = new Point(this, [f.x, f.y, f.z]);
		// ---- quad points ----
		this.p0 = new Point(this, [f.x, f.y, f.z], transform(-w, -h, 0, ax, ay));
		this.p1 = new Point(this, [f.x, f.y, f.z], transform(w, -h, 0, ax, ay));
		this.p2 = new Point(this, [f.x, f.y, f.z], transform(w, h, 0, ax, ay));
		this.p3 = new Point(this, [f.x, f.y, f.z], transform(-w, h, 0, ax, ay));

		this.points = [this.p0, this.p1, this.p2, this.p3];

		this.pv = this.makePv();

		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----
		if(this.f.type === 'art') {
			this.img = new CanvasEl.Image(scr.canvas, this.f.thumb, this.f.level || 2);
		}

		this.buffer();
		return this;
	};

	Face.prototype.makePv = function() {
		if(this.f.adj) {

			var res = [];
			var found;
			for (i=0; i<this.points.length; i++) {
				found = false;
				for (j=0; j<this.f.adj.length; j++){
					if (this.f.adj[j]) {
						for (k=0; k<this.f.adj[j].points.length; k++) {
							if(equalsCoord(this.points[i], this.f.adj[j].points[k])) {
								found = true;
							}
						}
					}
				}
				if(!found) {
					res.push(this.points[i]);
				}
			}

			var pvx, pvy, pvz;
			pvx=0;
			pvy=0;
			pvz=0;
			for (i=0; i<res.length; i++) {
				pvx+=res[i].x;
				pvy+=res[i].y;
				pvz+=res[i].z;
			}
			pvx = pvx/res.length;
			pvy = pvy/res.length;
			pvz = pvz/res.length;

			this.res = res;
			return new Point(null, [pvx, pvy, pvz]);
		} else {
			return this.pc;
		}
	};

	// ======== face projection ========
	Face.prototype.projection = function() {
		this.nbBehind = 0;
		this.distance = 0;
		this.conditions = 0;
		this.visible = true;
		this.distance = -99999;
		// ---- points projection ----
		// this.pc.projection(); // optional
		this.p0.projection();
		this.p1.projection();
		this.p2.projection();
		this.p3.projection();

		if (this.forceVisible) {
			return this.visible = true;
		}

		// Remove invisible faces;

		if(this.nbBehind > 1) {
			this.visible = false;
			this.distance = -99999;
			this.conditions += 40;
			return;
		}

		// if(this.p0.behind || this.p1.behind || this.p2.behind || this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 20;
		// 	return;
		// }

		// if(this.p0.behind && this.p1.behind && this.p2.behind && this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 10;
		// 	return;
		// }

		// if((this.p1.Y - this.p0.Y) * (this.p3.X - this.p0.X) - (this.p1.X - this.p0.X) * (this.p3.Y - this.p0.Y) > 0) {
			// this.visible = false;
			// this.distance = -99999;
			// this.conditions += 1;
			if((this.p3.Y - this.p2.Y) * (this.p1.X - this.p2.X) - (this.p3.X - this.p2.X) * (this.p1.Y - this.p2.Y) > 0){
				this.visible = false;
				this.distance = -99999;
				this.conditions += 2;
				return;
			}
		// }


		// if(this.p0.behind || this.p1.behind || this.p2.behind || this.p3.behind) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 20;
		// }

		// if(!(
		// 	((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) -
		// 		(this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) < 0) ^
		// 	(this.p0.X <= this.p1.X == this.p0.X > this.p2.X)
		// 	)) {
		// 	this.visible = false;
		// 	this.distance = -99999;
		// 	this.conditions += 40;
		// }


	};

	Face.prototype.buffer = function() {
		if(this.f.type === 'art' && this.f.subtype === 'image') {
			this.html = new Image();
			this.html.src = this.f.src;
			this.html.id = this.f.id;
			this.html.className = 'art';
		}

		if(this.f.type === 'art' && this.f.subtype === 'html') {
			this.html = document.createElement('iframe');
			this.html.setAttribute('src', this.f.src);
			this.html.className = 'html';
			this.html.id = this.f.id;
			this.html.height = this.f.iFrameHeight || 600;
			this.html.width = this.f.iFrameWidth || 800;
		}
	};

	Face.prototype.render = function() {
		if(this.f.type === 'art') {
			if(cursor.aimedFace && this.f.id === cursor.aimedFace.f.id) {
				this.img.render(this.p0, this.p1, this.p2, this.p3, 'black', this.f.border);
			} else {
				this.img.render(this.p0, this.p1, this.p2, this.p3, 'white', this.f.border);
			}
		}
	};

	var faceMaker = {
		'top': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':top',
				type: 'top',
				x: params.unit * (_x + _room.position.x),
				y: 0,
				z: params.unit * (_z + 1 / 2 + _room.position.z),
				rx: 0,
				ry: 0,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'bottom': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':bottom',
				type: 'bottom',
				x: params.unit * (_x + _room.position.x),
				y: 0,
				z: params.unit * (_z - 1 / 2 + _room.position.z),
				rx: 0,
				ry: -2,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'left': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':left',
				type: 'left',
				x: params.unit * (_x - 1 / 2 + _room.position.x),
				y: 0,
				z: params.unit * (_z + _room.position.z),
				rx: 0,
				ry: 1,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'right': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':right',
				type: 'right',
				x: params.unit * (_x + 1 / 2 + _room.position.x),
				y: 0,
				z: params.unit * (_z + _room.position.z),
				rx: 0,
				ry: -1,
				w: params.unit,
				h: params.height,
				select: false
			};
			return new Face(f);
		},
		'ceiling': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':ceiling',
				type: 'ceiling',
				x: params.unit * (_x + _room.position.x),
				y: -params.height / 2,
				z: params.unit * (_z + _room.position.z),
				rx: -1,
				ry: 0,
				w: params.unit,
				h: params.unit,
				select: false
			};
			return new Face(f);
		},
		'floor': function(_room, _x, _z, adj, art) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':floor',
				type: 'floor',
				x: params.unit * (_x + _room.position.x),
				y: params.height / 2,
				z: params.unit * (_z + _room.position.z),
				rx: 1,
				ry: 0,
				w: params.unit,
				h: params.unit,
				adj: adj,
				select: true
			};
			if(art !== undefined) {
				f.art = art;
			}
			return new Face(f);
		},
		'door': function(_room, face, doorConstr) {
			var f = {
				id: _room.id + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':door',
				type: 'door',
				x: face.f.x,
				y: face.f.y,
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				// w: 100,
				// h: 200,
				w: face.f.w,
				h: face.f.h,
				to: doorConstr.to,
				select: true
			};
			return new Face(f);
		},
		'art': function(_room, face, artConstr) {
			var f = {
				id: _room.id + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
				type: 'art',
				subtype: artConstr.type,
				x: face.f.x + (artConstr.x||0),
				y: params.height / 2 - params.humanHeight * 1.8 + (artConstr.y||0),
				z: face.f.z + (artConstr.z||0),
				rx: face.f.rx,
				ry: face.f.ry,
				w: artConstr.width,
				h: artConstr.height,
				thumb: artConstr.thumb,
				src: artConstr.src,
				info: artConstr.info || {},
				iFrameHeight: artConstr.iFrameHeight,
				iFrameWidth: artConstr.iFrameWidth,
				level: artConstr.level,
				artId: artConstr.id,
				select: true
			};
			return new Face(f);
		},
		'position': function(_room, art) {
			var f = {
				id: _room.id + ':' + Math.floor(art.f.x / params.unit) + ':' + Math.floor(art.f.z / params.unit) + ':position',
				type: 'position',
				x: parseInt(art.f.x + params.unit * Math.sin(art.f.ry * Math.PI / 2), 10),
				y: params.height / 2,
				z: parseInt(art.f.z - params.unit * Math.cos(art.f.ry * Math.PI / 2), 10),
				rx: 1,
				ry: 0,
				w: 500,
				h: 500,
				ryf: art.f.ry,
				info: art.f.info || {},
				art: art,
				select: true
			};
			return new Face(f);
		}
	};
var Monolythe = function(face, artConstr) {

	this.dim = artConstr.dim;

	var f0 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x + this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: 1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: artConstr.thumb.top,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f1 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x - this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: -1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: artConstr.thumb.bottom,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f2 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2 + 12,
		z: face.f.z - this.dim.width/2 + 15,
		rx: -0.03,
		ry: 0,
		w: this.dim.depth,
		h: this.dim.height - 24,
		thumb: artConstr.thumb.left,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f3 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2,
		z: face.f.z + this.dim.width/2 - 18,
		rx: -0.03,
		ry: 2,
		w: this.dim.depth,
		h: this.dim.height,
		thumb: artConstr.thumb.right,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};

	this.face0 = new Face(f0);
	this.face1 = new Face(f1);
	this.face2 = new Face(f2);
	this.face3 = new Face(f3);

	this.faces = [this.face0, this.face1, this.face2, this.face3];

	return this;
};
// ======= Room constructor ========
var Room = function(id, mainRoom) {
	this.id = id;
	this.mainRoom = mainRoom;
	this.arts = [];
	this.sounds = [];
	this.adj = [];
	this.positions = [];
	this.tops = [];
	this.bottoms = [];
	this.lefts = [];
	this.rights = [];
	this.floors = [];
	this.images = [];
	this.texts = [];
	return this.load();
};

Room.prototype.load = function() {
	$.getJSON('/numero0/room' + this.id + '.json', $.proxy(function(data) {
		this.init(data);
		$(scr.container).trigger('loaded');
	}, this));
	return this;
};

Room.prototype.init = function(constr) {
	this.name = constr.name||'Room '+this.id;
	this.position = constr.position;
	this.map = constr.map;
	this.adj = constr.adj||[];
	this.color = constr.color;
	this.artsConstr = constr.arts || [];
	this.soundsConstr = constr.sounds || [];

	this.readMap();

	if(!this.startFloor) {
		this.startFloor = this.floors[parseInt(this.floors.length / 2, 10)];
	}

	this.makeSounds();
	rooms[rooms.length] = this;
	return this;
};

Room.prototype.getElementsToRender = function() {
	var i, j, depth, depth2;
	var face;
	var toRender = [];
	var cptToRender = 0;

	for(i=0; i< this.sounds.length; i++) {
		this.sounds[i].adjustVolume(camera.x.value, camera.z.value);
	}

	for(depth in this.tops) {
		if(this.tops.hasOwnProperty(depth)) {
			for(depth2 in this.tops[depth]) {
				if(this.tops[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.tops[depth][depth2], 'top');
					cptToRender +=1;
				}
			}
		}
	}
	for(depth in this.bottoms) {
		if(this.bottoms.hasOwnProperty(depth)) {
			for(depth2 in this.bottoms[depth]) {
				if(this.bottoms[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.bottoms[depth][depth2], 'bottom');
					cptToRender +=1;
				}
			}
		}
	}
	for(depth in this.lefts) {
		if(this.lefts.hasOwnProperty(depth)) {
			for(depth2 in this.lefts[depth]) {
				if(this.lefts[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.lefts[depth][depth2], 'left');
					cptToRender +=1;
				}
			}
		}
	}
	for(depth in this.rights) {
		if(this.rights.hasOwnProperty(depth)) {
			for(depth2 in this.rights[depth]) {
				if(this.rights[depth].hasOwnProperty(depth2)) {
					toRender[cptToRender] = getEdges(this.rights[depth][depth2], 'right');
					cptToRender +=1;
				}
			}
		}
	}

	for(i = 0; i < this.arts.length; i++) {
		face = this.arts[i];
		face.projection();
		if(face.visible) {
			toRender[cptToRender] = {
				type: 'art',
				distance: this.arts[i].distance*0.5, // A corriger
				art: this.arts[i]
			};
			cptToRender +=1;
		}
	}

	return toRender;
	
};


Room.prototype.isTop = function(charType) {
	return(charType === '#' || charType === '-' || charType === '+') || false;
};
Room.prototype.isBottom = function(charType) {
	return(charType === '%' || charType === '_' || charType === '¤') || false;
};
Room.prototype.isLeft = function(charType) {
	return(charType === '#' || charType === '|' || charType === '%') || false;
};
Room.prototype.isRight = function(charType) {
	return(charType === '+' || charType === '!' || charType === '¤') || false;
};
Room.prototype.isInside = function(charType) {
	return(charType !== '.') || false;
};
Room.prototype.isNoWall = function(charType) {
	return(charType === ',') || false;
};

Room.prototype.getArtConstr = function(artId) {
	var artConstr;
	for(var i = 0; i < this.artsConstr.length; i++) {
		artConstr = this.artsConstr[i];
		if(artConstr.id === artId) {
			return artConstr;
		}
	}
	console.log('artId not found');
	return undefined;
};

Room.prototype.readMap = function() {
	var h, w, x, z;
	var charType, artId, next;
	var artConstr;
	var top, bottom, left, right, floor, art;

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		for(w = 0; w < this.map[h].length; w += 2) {
			// Get Vars
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			artId = next.replace(/^[^a-zA-Z0-9]$/, '');


			if(this.isInside(charType)) {

				top = this.putFaceToWall(this.tops, this.isTop(charType), z, faceMaker.top(this, x, z));
				bottom = this.putFaceToWall(this.bottoms, this.isBottom(charType), z, faceMaker.bottom(this, x, z));
				left = this.putFaceToWall(this.lefts, this.isLeft(charType), x, faceMaker.left(this, x, z));
				right = this.putFaceToWall(this.rights, this.isRight(charType), x, faceMaker.right(this, x, z));


				art = undefined;
				artConstr = undefined;
				if(artId !== '') {
					artConstr = this.getArtConstr(artId);
					if(this.isTop(artConstr.side || charType)) {
						art = faceMaker.art(this, top, artConstr);
						this.arts.push(art);
					}
					if(this.isBottom(artConstr.side || charType)) {
						art = faceMaker.art(this, bottom, artConstr);
						this.arts.push(art);
					}
					if(this.isLeft(artConstr.side || charType)) {
						art = faceMaker.art(this, left, artConstr);
						this.arts.push(art);
					}
					if(this.isRight(artConstr.side || charType)) {
						art = faceMaker.art(this, right, artConstr);
						this.arts.push(art);
					}


				}
				floor = faceMaker.floor(this, x, z, [top, bottom, left, right], art);
				if(next === '@') {
					this.startFloor = floor;
				}

				if(artConstr && artConstr.type === 'monolythe') {
					art = new Monolythe(floor, artConstr);
					floor.f.select = false;
					this.arts = this.arts.concat(art.faces);
				}

				this.floors.push(floor);
			}

		}
	}
};


Room.prototype.putFaceToWall = function(wall, test, dim, face) {
	if(test) {
		if(!wall[dim]) {
			wall[dim] = [];
		}
		if(wall[dim].length === 0) {
			wall[dim].push([]);
		}
		wall[dim][wall[dim].length - 1].push(face);
		return face;
	} else {
		if(wall[dim] && (wall[dim].length === 0 || wall[dim][wall[dim].length - 1].length !== 0)) {
			wall[dim].push([]);
		}
		return null;
	}
};

Room.prototype.makeSounds = function() {
	var i;
	var sound;
	for(i = 0; i < this.soundsConstr.length; i++) {
		sound = this.soundsConstr[i];
		this.sounds.push(new Sound(this, sound));
	}
};

Room.prototype.enter = function() {
	var sound;

	if(this.sounds.length > 0) {
		if($('#volume').css('display') === 'none') {
			$('#volume').fadeIn(1000);
		}

		$('#volume').click($.proxy(function(e) {
			var i;
			for (i=0; i< this.sounds.length; i++) {
				if(!this.sounds[i].muted) {
					this.sounds[i].formerVolume = this.sounds[i].audio.volume;
					this.sounds[i].audio.volume = 0;
					this.sounds[i].muted = true;
					$('#volume').addClass('muted');
				} else {
					this.sounds[i].audio.volume = this.sounds[i].formerVolume;
					this.sounds[i].adjustVolume();
					this.sounds[i].muted = false;
					$('#volume').removeClass('muted');
				}

			}
		}, this));
		
	}

	for(i = 0; i < this.sounds.length; i++) {
		if(this.sounds[i].autoPlay) {
			this.sounds[i].adjustVolume(this.startFloor.f.x, this.startFloor.f.z);
			this.sounds[i].audio.play();
		}
	}

};

Room.prototype.exit = function() {
	var i;
	$('#volume').fadeOut(1000);
	for (i=0; i<this.sounds.length; i++) {
		this.sounds[i].audio.pause();
	}
};


var renderer = {
	renderAll: function() {
		this.renderFloor();
		this.renderAiming();
		this.renderRooms();
	},
	renderFloor: function() {
		var y = camera.trig.sinX * (100 * params.unit + camera.focalLength);
		var z = camera.trig.cosX * (100 * params.unit + camera.focalLength) - camera.focalLength;

		var scale = Math.abs((camera.focalLength / (z + camera.focalLength)) * camera.zoom.value) || 10000; // Me !!!
		var horizonLine = parseInt(((scr.height * 0.5) + (y * scale)), 10);

		if(horizonLine < scr.height) {
			scr.ctx.beginPath();
			scr.ctx.rect(0, horizonLine, scr.width, scr.height - horizonLine);
			scr.ctx.fillStyle = colors['floor'];
			scr.ctx.fill();
		}
	},
	renderAiming: function() {
		if(cursor.aimedFace && cursor.aimedFace.f.type === 'floor') {
			face = cursor.aimedFace;
			face.projection();
			scr.ctx.beginPath();
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p0.X * 5 + face.p1.X) / 6, (face.p0.Y * 5 + face.p1.Y) / 6);
				scr.ctx.moveTo((face.p0.X + face.p1.X * 5) / 6, (face.p0.Y + face.p1.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p1.X, face.p1.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p1.X * 5 + face.p2.X) / 6, (face.p1.Y * 5 + face.p2.Y) / 6);
				scr.ctx.moveTo((face.p1.X + face.p2.X * 5) / 6, (face.p1.Y + face.p2.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p2.X, face.p2.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p2.X * 5 + face.p3.X) / 6, (face.p2.Y * 5 + face.p3.Y) / 6);
				scr.ctx.moveTo((face.p2.X + face.p3.X * 5) / 6, (face.p2.Y + face.p3.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p3.X, face.p3.Y);
			if(!cursor.aimedFace.f.art) {
				scr.ctx.lineTo((face.p3.X * 5 + face.p0.X) / 6, (face.p3.Y * 5 + face.p0.Y) / 6);
				scr.ctx.moveTo((face.p3.X + face.p0.X * 5) / 6, (face.p3.Y + face.p0.Y * 5) / 6);
			}
			scr.ctx.lineTo(face.p0.X, face.p0.Y);
			scr.ctx.closePath();
			if(!cursor.aimedFace.f.art) {
				scr.ctx.strokeStyle = colors['aimedFloor'];
				scr.ctx.stroke();
			} else {
				scr.ctx.fillStyle = colors['aimedFloor'];
				scr.ctx.fill();
			}
		}
	},
	renderRooms: function() {
		var i;
		var toRender = [];
		var toRenderElements;
		var cpt = 0;
		for(i = 0; i < rooms.length; i++) {
			toRenderElements = rooms[i].getElementsToRender();
			for (j=0; j < toRenderElements.length; j++) {
				toRender[cpt] = toRenderElements[j];
				cpt+=1;
			}
		}
		renderer.renderElementsToRender(toRender);
	},
	renderElementsToRender: function(toRender) {
		toRender = insertSortDistance(toRender);

		for(i = 0; i < toRender.length; i++) {
			// if(toRender[i].type === 'top' || toRender[i].type === 'bottom' || toRender[i].type === 'left' || toRender[i].type === 'right') {
			if(toRender[i].type !== 'art') {
				renderer.facesMerged(toRender[i]);
			}
			if(toRender[i].type === 'art') {
				face = toRender[i].art;
				face.render();
			}
		}
	},
	facesMerged: function(pointList) {
		var grd;
		var point;
		var points = pointList.points;
		var color = colors[pointList.type];

		if(points.length > 2) {
			scr.ctx.beginPath();
			for(var k = 0; k < points.length; k++) {
				point = points[k];
				scr.ctx.lineTo(point.X, point.Y);
			}
			scr.ctx.closePath();
			if(colors['gradient'] === undefined || SLOW) {
				scr.ctx.fillStyle = color || '#F9F9F9';
			} else {
				grd = scr.ctx.createLinearGradient(points[points.length - 1].X, points[points.length - 1].Y, points[parseInt((points.length - 1) / 2, 10)].X, points[parseInt((points.length - 1) / 2, 10)].Y);
				grd.addColorStop(0, color);
				grd.addColorStop(1, colors['gradient']);
				scr.ctx.fillStyle = grd;
			}
			scr.ctx.lineWidth = 1;
			scr.ctx.strokeStyle = '#E4E4E4';
			scr.ctx.fill();
			scr.ctx.stroke();
		}
	}
};

var CanvasEl = {
	Triangle: function(parent, p0, p1, p2) {
		// this.randColor = 'rgb('+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+')';
		this.p0 = p0;
		this.p1 = p1;
		this.p2 = p2;
		this.next = false;
		// ---- pre calculation for transform----
		this.d = p0.tx * (p2.ty - p1.ty) - p1.tx * p2.ty + p2.tx * p1.ty + (p1.tx - p2.tx) * p0.ty;
		this.pmy = p1.ty - p2.ty;
		this.pmx = p1.tx - p2.tx;
		this.pxy = p2.tx * p1.ty - p1.tx * p2.ty;
		// ---- link for iteration ----
		if(!parent.firstTriangle) parent.firstTriangle = this;
		else parent.prev.next = this;
		parent.prev = this;
	},
	Image: function(canvas, imgSrc, lev) {
		this.canvas = canvas;
		this.ctx = canvas.getContext("2d");
		if(typeof(imgSrc) == 'string') {
			this.texture = new Image();
			this.texture.src = imgSrc;
		}
		if(typeof(imgSrc) == 'object') {
			this.texture = imgSrc;
		}
		this.lev = lev;
		this.isLoading = true;
		this.firstPoint = false;
		this.firstTriangle = false;
		this.prev = false;
	}
};

CanvasEl.Image.prototype.loading = function() {
	var i, j;
	var tx, ty;
	var p;
	var t;
	var lev;
	var points;
	var cptPoints = 0;
	if(this.texture.complete && this.texture.width) {
		this.isLoading = false;
		points = [];
		// ---- create points ----
		for(i = 0; i <= this.lev; i++) {
			for(j = 0; j <= this.lev; j++) {
				tx = (i * (this.texture.width / this.lev));
				ty = (j * (this.texture.height / this.lev));
				p = {
					tx: tx,
					ty: ty,
					nx: tx / this.texture.width,
					ny: ty / this.texture.height,
					next: false
				};
				points[cptPoints] = p;
				cptPoints +=1;
				if(!this.firstPoint) this.firstPoint = p;
				else this.prev.next = p;
				this.prev = p;
			}
		}
		lev = this.lev + 1;
		for(i = 0; i < this.lev; i++) {
			for(j = 0; j < this.lev; j++) {
				// ---- up ----
				t = new CanvasEl.Triangle(this, points[j + i * lev], points[j + i * lev + 1], points[j + (i + 1) * lev]);
				// ---- down ----
				t = new CanvasEl.Triangle(this, points[j + (i + 1) * lev + 1], points[j + (i + 1) * lev], points[j + i * lev + 1]);
			}
		}
	}
};



CanvasEl.Image.prototype.render = function(p0, p1, p2, p3, color, border) {
	if(border === undefined) {
		border = true;
	}
	var array = [p0, p1, p2, p3];
	// ---- loading ----
	if(this.isLoading) {
		this.loading();
	} else {
		// ---- project points ----
		var p = this.firstPoint;
		do {
			var mx = p0.X + p.ny * (p3.X - p0.X);
			var my = p0.Y + p.ny * (p3.Y - p0.Y);
			p.px = (mx + p.nx * (p1.X + p.ny * (p2.X - p1.X) - mx));
			p.py = (my + p.nx * (p1.Y + p.ny * (p2.Y - p1.Y) - my));
			p = p.next;
		} while (p);
		// ---- draw triangles ----
		var w = this.canvas.width;
		var h = this.canvas.height;
		var t = this.firstTriangle;
		do {
			p0 = t.p0;
			p1 = t.p1;
			p2 = t.p2;
			// ---- centroid ----
			var xc = (p0.px + p1.px + p2.px) / 3;
			var yc = (p0.py + p1.py + p2.py) / 3;
			// ---- clipping ----
			var isTriangleVisible = true;
			if(xc < 0 || xc > w || yc < 0 || yc > h) {
				if(Math.max(p0.px, p1.px, p2.px) < 0 || Math.min(p0.px, p1.px, p2.px) > w || Math.max(p0.py, p1.py, p2.py) < 0 || Math.min(p0.py, p1.py, p2.py) > h) {
					isTriangleVisible = false;
				}
			}
			if(isTriangleVisible) {
				this.ctx.save();
				this.ctx.beginPath();
				var dx, dy, d;
				// ---- draw non anti-aliased triangle ----
				dx = xc - p0.px;
				dy = yc - p0.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.moveTo(p0.px - 2 * (dx / d), p0.py - 2 * (dy / d));
				dx = xc - p1.px;
				dy = yc - p1.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.lineTo(p1.px - 2 * (dx / d), p1.py - 2 * (dy / d));
				dx = xc - p2.px;
				dy = yc - p2.py;
				d = Math.max(Math.abs(dx), Math.abs(dy));
				this.ctx.lineTo(p2.px - 2 * (dx / d), p2.py - 2 * (dy / d));
				this.ctx.closePath();

				// ---- clip ----
				this.ctx.clip();
				// ---- texture mapping ----
				this.ctx.transform(-(p0.ty * (p2.px - p1.px) - p1.ty * p2.px + p2.ty * p1.px + t.pmy * p0.px) / t.d, // m11
				(p1.ty * p2.py + p0.ty * (p1.py - p2.py) - p2.ty * p1.py - t.pmy * p0.py) / t.d, // m12
				(p0.tx * (p2.px - p1.px) - p1.tx * p2.px + p2.tx * p1.px + t.pmx * p0.px) / t.d, // m21
				-
				(p1.tx * p2.py + p0.tx * (p1.py - p2.py) - p2.tx * p1.py - t.pmx * p0.py) / t.d, // m22
				(p0.tx * (p2.ty * p1.px - p1.ty * p2.px) + p0.ty * (p1.tx * p2.px - p2.tx * p1.px) + t.pxy * p0.px) / t.d, // dx
				(p0.tx * (p2.ty * p1.py - p1.ty * p2.py) + p0.ty * (p1.tx * p2.py - p2.tx * p1.py) + t.pxy * p0.py) / t.d // dy
				);
				this.ctx.drawImage(this.texture, 0, 0);
				this.ctx.restore();
			}
			t = t.next;
		} while (t);

		if(border) {
			this.ctx.beginPath();
			for(var i = 0; i < array.length; i++) {
				this.ctx.lineTo(array[i].X, array[i].Y);

			}
			this.ctx.closePath();
			this.ctx.lineWidth = 1;
			this.ctx.strokeStyle = color || 'white';
			this.ctx.stroke();
		}

	}
};
// shim layer with setTimeout fallback
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
	function(callback) {
		window.setTimeout(callback, 1000 / 60);
	};
})();

var insertSortTheta = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].theta > tmp.theta) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};

var insertSortDistance = function (arr) {
	for (var i = 1; i < arr.length; i++) {
		var tmp = arr[i],
		j = i;
		while (arr[j - 1] && arr[j - 1].distance < tmp.distance) {
			arr[j] = arr[j - 1];
			--j;
		}
		arr[j] = tmp;
	}

	return arr;
};


var getParameters = function() {
	var tab = window.location.href.replace(/.*#!/, '').split('&');
	var obj = {};
	for(var i = 0; i < tab.length; i++) {
		var subtab = tab[i].split('=');
		obj[subtab[0]] = subtab[1];
	}
	return obj;
};


var showHtml = function(html) {
	$('#artClearView').html(html);
	$('#artClearView').fadeIn(1000);
	$('#artClearView').one('click', function(eventName) {
		remHtml();
	});
};

var remHtml = function() {
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
};


var getEdges = function(faces, dim) {

	if(faces.length === 0) {
		return {
			distance: -99999,
			points: []
		};
	}

	var i, j;
	var face;
	var point;
	var points;
	var minDim, maxDim;
	var maxDist;
	var moyDist = 0;
	var nbVisible = 0;
	for(i=0; i<faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			if(!minDim && !maxDim && !maxDist) {
				minDim = maxDim = faces[i];
				maxDist = faces[i].distance;
			}

			nbVisible +=1;
			moyDist +=face.distance;

			if (dim === 'left' || dim === 'right') {
				if(face.f.z < minDim.f.z) {
					minDim = face;
				}
				if(face.f.z > maxDim.f.z) {
					maxDim = face;
				}
				
			}
			if (dim === 'top' || dim === 'bottom') {
				if(face.f.x < minDim.f.x) {
					minDim = face;
				}
				if(face.f.x > maxDim.f.x) {
					maxDim = face;
				}
				
			}
		}
	}

	if(!minDim && !maxDim && !maxDist) {
		return {
			distance: -99999,
			points: []
		};
	}

	if(dim === 'top' || dim === 'left') {
		return {
			type: dim,
			distance: moyDist/nbVisible,
			points: [minDim.p3, minDim.p0, maxDim.p1, maxDim.p2]
		};
	}
	if(dim === 'bottom' || dim === 'right') {
		return {
			type: dim,
			distance: moyDist/nbVisible,
			points: [minDim.p1, minDim.p2, maxDim.p3, maxDim.p0]
		};
	}

};


var getEdges2 = function(faces, dim) {
	var i, j, k;
	var points = [];
	var cptPoints = 0;
	var face, point;
	var cx, cy, cz, cpt;
	var ux, uy, uz, vx, vy, vz, cosTheta, sinTheta, theta;
	var maxDist = 0;

	cx = cy = cz = 0;
	cpt = 0;

	for(i = 0; i < faces.length; i++) {
		face = faces[i];
		face.projection();
		if(face.visible) {

			cx += face.f.x;
			cy += face.f.y;
			cz += face.f.z;
			cpt++;

			if(!face.p0.behind) {
				points[cptPoints] = face.p0;
				cptPoints +=1;
			}
			if(!face.p1.behind) {
				points[cptPoints] = face.p1;
				cptPoints +=1;
			}
			if(!face.p2.behind) {
				points[cptPoints] = face.p2;
				cptPoints +=1;
			}
			if(!face.p3.behind) {
				points[cptPoints] = face.p3;
				cptPoints +=1;
			}
		}
	}

	cx = cx / cpt || 0;
	cy = cy / cpt || 0;
	cz = cz / cpt || 0;

	points = remMany(points, equalsCoord, 4);

	if(points.length > 0) {
		point = points[0];
		for(k = 0; k < points.length; k++) {

			if(maxDist < points[k].distance) {
				maxDist = points[k].distance;
			}

			ux = point.x - cx;
			uy = point.y - cy;
			uz = point.z - cz;
			vx = points[k].x - cx;
			vy = points[k].y - cy;
			vz = points[k].z - cz;
			if(dim === 'x') {
				// var norm = Math.sqrt((uy*uy + uz*uz)*(vy*vy + vz*vz));
				cosTheta = (uy * vy + uz * vz);
				sinTheta = (uy * vz - uz * vy);
			}
			if(dim === 'y') {
				// var norm = Math.sqrt((ux*ux + uz*uz)*(vx*vx + vz*vz));
				cosTheta = (ux * vx + uz * vz);
				sinTheta = (uz * vx - ux * vz);
			}
			if(dim === 'z') {
				// var norm = Math.sqrt((ux*ux + uy*uy)*(vx*vx + vy*vy));
				cosTheta = (ux * vx + uy * vy);
				sinTheta = (ux * vy - uy * vx);
			}

			theta = Math.atan(sinTheta / cosTheta) || 0;
			if(cosTheta >= 0) {
				points[k].theta = theta;
			} else {
				points[k].theta = theta + Math.PI;
			}

			points[k].cosTheta = cosTheta;
			points[k].sinTheta = sinTheta;
		}

		points = insertSortTheta(points);
		// points.sort(function(p0, p1) {
		// 	return p0.theta - p1.theta;
		// });

}
return {
	distance: maxDist,
	points: points
};
};

var remMany = function(array, eqFn, many) {
	var i, j;
	var cpt = [];
	var res = [];
	var present;

	for(i = 0; i < array.length; i++) {
		present = false;
		for(j = 0; j < res.length; j++) {
			if(eqFn(array[i], res[j])) {
				cpt[j] = cpt[j] + 1;
				present = true;
			}
		}
		if(!present) {
			res.push(array[i]);
			cpt.push(1);
		}
	}

	for(i = 0; i < res.length; i++) {
		if(cpt[i] >= many) {
			res.splice(i, 1);
			cpt.splice(i, 1);
			i--;
		}
	}

	return res;
};

var equalsCoord = function(point1, point2) {
	return point1.x === point2.x && point1.y === point2.y && point1.z === point2.z;
};
var startCpt = function resetCpt() {
	if(!SLOW && cpt < 50) {
		console.log(cpt);
		console.log('Slow Mode');
		SLOW = true;
	}
	if(SLOW && cpt > 100) {
		console.log(cpt);
		console.log('Fast Mode');
		SLOW = false;
	}
	cpt = 0;
	setTimeout(resetCpt, 5000);
};

var enteredRoom = function(roomId) {
	var i, j;
	var room;
	var newRoom, oldRoom, switchRoom;

	oldRoom = rooms[0];
	oldRoom.exit();
	for(k = 0; k < rooms.length; k++) {
		if(rooms[k].id === roomId) {
			switchRoom = rooms[k];
			rooms[k] = rooms[0];
			rooms[0] = switchRoom;
			newRoom = rooms[0];
			for(i = 0; i < newRoom.adj.length; i++) {
				room = null;
				for(j = 1; j < rooms.length; j++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in rooms
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					// New Room to create
					new Room(newRoom.adj[i]);
				}

			}
			for(j = 1; j < rooms.length; j++) {
				room = null;
				for(i = 0; i < newRoom.adj.length; i++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in adj
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					// Not adjacent Anymore, removal !
					rooms.splice(j, 1);
				}
			}
			newRoom.enter();
			return rooms;
		}
	}
	return rooms;
};

var init = function() {
	var parameters = getParameters();
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	new Room(parseInt(parameters.room, 10) || 1);

	$(scr.container).one('loaded', function() {

		enteredRoom(rooms[0].id);
		if(typeof(Keyboard) === 'function') {
			keyboard = new Keyboard();
		}
		cursor = new Cursor('screen', params.cursorX, params.cursorY);

		camera = new Camera(rooms[0].startFloor.pv.x, rooms[0].startFloor.pv.z);
		if(parameters.art !== undefined) {
			var i;
			for(i = 0; i < rooms[0].floors.length; i++) {
				if(rooms[0].floors[i].f.art && rooms[0].floors[i].f.art.f.artId === parameters.art) {
					camera.targetToFace(rooms[0].floors[i]);
				}
			}
		}


		requestAnimFrame(run);
		$(scr.canvas).fadeIn(3000, function() {
			setTimeout(remHtml, 1000);
		});
	});

	startCpt();

};


var run = function() {
	// ---- loop ----
	if(!MENU) {
	requestAnimFrame(run);
	}

	// ---- clear screen ----
	scr.ctx.clearRect(0, 0, scr.width, scr.height);
	
	// ---- camera ----
	camera.move();

	// ---- 3D projection ----
	renderer.renderAll();

	cpt++;
};


init();
var Sound = function(room, constr) {
	this.audio = new Audio();
	this.audio.src = constr.src;
	this.autoPlay = constr.play;
	this.muted = false;
	if(constr.position) {
		this.position = {
			x: (room.position.x + constr.position.x)*params.unit,
			z: (room.position.z + constr.position.z)*params.unit
		};
	}
};


Sound.prototype.adjustVolume = function(x, z) {
	var volume;
	var distance;
	if(this.position) {
		distance = Math.sqrt((x - this.position.x)*(x - this.position.x) + (z - params.focalLength - this.position.z)*(z - params.focalLength - this.position.z));
		volume = params.unit / distance;

		if(volume>1) {
			volume = 1;
		}

		if(volume<0) {
			volume = 0;
		}

	} else {
		volume = 0.8;
	}
	this.audio.volume = volume;
};

var MENU = true;

$('#visite').click(function(e) {
	$('#menu').fadeOut(1000);
	$('#screen').fadeIn(1000);
	MENU = false;
	run();
});
var _gaq = _gaq || [];
_gaq.push(['_setAccount', 'UA-36223212-4']);
_gaq.push(['_trackPageview']);

(function() {
	var ga = document.createElement('script'); ga.type = 'text/javascript'; ga.async = true;
	ga.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
	var s = document.getElementsByTagName('script')[0]; s.parentNode.insertBefore(ga, s);
})();