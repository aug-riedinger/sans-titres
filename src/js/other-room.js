// =============================================================
//           ===== CANVAS 3D experiment =====
// script written by Gerard Ferrandez - February 14, 2012
// http://www.dhteumeuleu.com/
// =============================================================

// "use strict";

var UNIT = 300;
var HEIGHT = 300;
var THRESHOLD = 630;

// var Room = function () {
	// ======== private vars ========
	var PAUSE = false;
	var faces = [];
	var scr, target, targetold, faceOver;
	var globalRX = 0, globalRY = 0;
	// ---- tweening engine ----
	var tweens = ge1doot.tweens;
	// ---- camera ----
	var camera = {
		x:  new tweens.Add(100),
		y:  new tweens.Add(100),
		z:  new tweens.Add(100, 0,0),
		rx: new tweens.Add(100, 0,0, true),
		ry: new tweens.Add(100, 0,0, true),
		zoom: new tweens.Add(100, 0.1, 1),
		focalLength: 1000,
		centered: false,
		cosX: 0,
		cosY: 0,
		sinX: 0,
		sinY: 0,
		setTarget: function (target) {
			// ---- set position ----
			this.x.setTarget(target.pc.x);
			this.y.setTarget(target.pc.y);
			this.z.setTarget(target.pc.z);
			// ---- set view angles ----
			this.rx.setTarget((Math.PI * 0.5) - target.ax - globalRX);
			this.ry.setTarget((Math.PI * 0.5) - target.ay - globalRY);
			// ---- zoom ----
			this.zoom.setTarget(target.f.zoom ? target.f.zoom : 2);
			this.centered = false;
		},
		center: function () {
			this.x.setTarget(0);
			this.y.setTarget(0);
			this.z.setTarget(0);
			this.zoom.setTarget(1);
			this.centered = true;
		},
		move: function () {
			// ---- easing camera position and view angle ----
			tweens.iterate();
			// ---- additional drag/touch rotations ----
			globalRX += (((-scr.dragY * 0.01) - globalRX) * 0.1);
			globalRY += (((-scr.dragX * 0.01) - globalRY) * 0.1);
			if (!this.centered && scr.drag) {
				// ---- reset zoom & position ----
				this.center();
				targetold = false;
			}
			// ---- pre calculate trigo ----
			this.cosX = Math.cos(this.rx.value + globalRX);
			this.sinX = Math.sin(this.rx.value + globalRX);
			this.cosY = Math.cos(this.ry.value + globalRY);
			this.sinY = Math.sin(this.ry.value + globalRY);
		},
		rotate: function (x, y, z) {
			// ---- 3D rotation ----
			return {
				x: this.cosY * x - this.sinY * z,
				y: this.sinX * (this.cosY * z + this.sinY * x) + this.cosX * y,
				z: this.cosX * (this.cosY * z + this.sinY * x) - this.sinX * y	
			}
		}
	}
	// ======== points constructor ========
	var Point = function (parentFace, point, rotate) {
		this.face = parentFace;
		this.x = point[0];
		this.y = point[1];
		this.z = point[2];
		this.scale = 0;
		this.X = 0;
		this.Y = 0;
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
		if (this.face) {
			var z = p.z + camera.focalLength;
			var distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
			if (distance > this.face.distance) this.face.distance = distance;
		}
		// --- 2D projection ----
		this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value); // Me !!!
		this.X = (scr.width  * 0.5) + (p.x * this.scale);
		this.Y = (scr.height * 0.5) + (p.y * this.scale);
	};

	// ======= faces constructor ========
	var Face = function (path, f) {
		this.f = f;
		var w  = f.w * 0.5;
		var h  = f.h * 0.5;
		var ax = f.rx * Math.PI * 0.5;
		var ay = f.ry * Math.PI * 0.5;
		this.locked   = false;
		this.hidden   = f.hidden || null;
		this.visible  = true;
		this.distance = 0;
		// ---- 3D transform ----
		var transform = function (x, y, z, ax, ay) {
			var tz = z * Math.cos(ay) + x * Math.sin(ay);
			var ty = y * Math.cos(ax) + tz * Math.sin(ax);
			return {
				x: x * Math.cos(ay) - z * Math.sin(ay),
				y: ty,
				z: tz * Math.cos(ax) - y * Math.sin(ax)
			}
		};
		// ---- center point ----
		this.pc = new Point(this, [f.x, f.y, f.z]);
		// ---- quad points ----
		this.p0 = new Point(this, [f.x, f.y, f.z], transform(-w, -h, 0, ax, ay));
		this.p1 = new Point(this, [f.x, f.y, f.z], transform( w, -h, 0, ax, ay));
		this.p2 = new Point(this, [f.x, f.y, f.z], transform( w,  h, 0, ax, ay));
		this.p3 = new Point(this, [f.x, f.y, f.z], transform(-w,  h, 0, ax, ay));
		// ---- corner points ----
		this.c0 = new Point(false, [f.x, f.y, f.z], transform(-w, -h, -15, ax, ay));
		this.c1 = new Point(false, [f.x, f.y, f.z], transform( w, -h, -15, ax, ay));
		this.c2 = new Point(false, [f.x, f.y, f.z], transform( w,  h, -15, ax, ay));
		this.c3 = new Point(false, [f.x, f.y, f.z], transform(-w,  h, -15, ax, ay));

		this.norm = Math.sqrt(Math.pow((this.p0.y-this.pc.y)*(this.p1.z-this.pc.z) - (this.p0.z-this.pc.z)*(this.p1.y-this.pc.y),2)+Math.pow((this.p0.z-this.pc.z)*(this.p1.x-this.pc.x) - (this.p0.x-this.pc.x)*(this.p1.z-this.pc.z),2)+Math.pow((this.p0.x-this.pc.x)*(this.p1.y-this.pc.y) - (this.p0.y-this.pc.y)*(this.p1.x-this.pc.x),2));

		this.psc = new Point(false, [
			this.pc.x + ((this.p0.y-this.pc.y)*(this.p1.z-this.pc.z) - (this.p0.z-this.pc.z)*(this.p1.y-this.pc.y))*100/this.norm,
			this.pc.y + ((this.p0.z-this.pc.z)*(this.p1.x-this.pc.x) - (this.p0.x-this.pc.x)*(this.p1.z-this.pc.z))*100/this.norm,
			this.pc.z + ((this.p0.x-this.pc.x)*(this.p1.y-this.pc.y) - (this.p0.y-this.pc.y)*(this.p1.x-this.pc.x))*100/this.norm
			])


		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;
		// ---- create 3D image ----
		this.img = new ge1doot.textureMapping.Image(scr.canvas, path + f.src, f.tl || 2);
	};


	// ======== face projection ========
	Face.prototype.projection = function () {
		this.visible = true;
		this.distance = -99999;
		// ---- points projection ----
		this.pc.projection(); // optional
		this.p0.projection();
		this.p1.projection();
		this.p2.projection();
		this.p3.projection();
		this.psc.projection();

		// ---- back face culling ----
		if(this.distance < THRESHOLD || 
			!(((this.p1.Y - this.p0.Y) * (this.p3.X - this.p0.X) - 
						(this.p1.X - this.p0.X) * (this.p3.Y - this.p0.Y) < 0) // Me !!! Vectorial Product
			) || this.hidden) {
		// if (!(
		// 	((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) - 
		// 		(this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) < 0) ^ 
		// 	(this.p0.X <= this.p1.X == this.p0.X > this.p2.X)
		// 	) || this.hidden) {
	this.visible = false;
	this.distance = -99999;
	if (!this.locked && this.hidden === false) this.hidden = true;
}
};

	// ======== face border ========
	Face.prototype.border = function () {

		// this.pc.highlight();
		this.psc.highlight();

		// var temp;
		// var ratio = 1/2;
		// this.c0.projection();
		// this.c1.projection();
		// this.c2.projection();
		// this.c3.projection();
		// this.pc.projection();
		// scr.ctx.beginPath();

		// this.pc.highlight();

		// temp = new Point(false, [Math.abs(this.c0.x - this.pc.x)*ratio + this.pc.x,Math.abs(this.c0.y - this.pc.y)*ratio + this.pc.y,Math.abs(this.c0.z - this.pc.z)*ratio + this.pc.z] );
		// // temp.projection();
		// // temp.highlight();
		// scr.ctx.moveTo(this.c0.X, this.c0.Y);

		// temp = new Point(false, [Math.abs(this.c1.x - this.pc.x)*ratio,Math.abs(this.c1.y - this.pc.y)*ratio,Math.abs(this.c1.z - this.pc.z)*ratio] );
		// temp.projection();
		// scr.ctx.moveTo(this.c1.X, this.c1.Y);

		// temp = new Point(false, [Math.abs(this.c2.x - this.pc.x)*ratio,Math.abs(this.c2.y - this.pc.y)*ratio,Math.abs(this.c2.z - this.pc.z)*ratio] );
		// temp.projection();
		// scr.ctx.moveTo(this.c2.X, this.c2.Y);

		// temp = new Point(false, [Math.abs(this.c3.x - this.pc.x)*ratio,Math.abs(this.c3.y - this.pc.y)*ratio,Math.abs(this.c3.z - this.pc.z)*ratio] );
		// temp.projection();
		// scr.ctx.moveTo(this.c3.X, this.c3.Y);

		// scr.ctx.closePath();
		// scr.ctx.strokeStyle = "rgb(0,255,0)";
		// scr.ctx.lineWidth = this.pc.scale * this.f.w / 30;
		// scr.ctx.lineJoin = "round";
		// scr.ctx.stroke();
	};
	
	// ======== update pointer style (PC)  ========
	var pointer = function () {
		// ---- on mouse over ----	
		target = false;
		var i = 0, f;
		while ( f = faces[i++] ) {
			if (f.visible) {
				if (
					f.img.pointerInside(
						scr.mouseX,
						scr.mouseY,
						f.p0, f.p1, f.p2, f.p3
						)
					) target = f;	
			} else break;
	}
	if (target && target.f.select != false && !scr.drag) {
		faceOver = target;
		scr.container.style.cursor = "pointer";
	} else scr.container.style.cursor = "move";
};
	// ======== onclick ========
	var click = function () {
		pointer();
		// ---- target image ----
		if (target && target.f.select != false) {
			if (target == targetold) {
				// ---- reset scene ----
				camera.center();
				targetold = false;
			} else {
				targetold = target;
				target.locked = false;
				// ---- target redirection ----
				if (target.f.target != "") {
					var i = 0, f;
					while ( f = faces[i++] ) {
						if (f.f.id && f.f.id == target.f.target) {
							target = f;
							targetold = f;
							if (f.hidden) {
								f.hidden = false;
								f.locked = true;
								targetold = false;
							}
							break;
						}
					}
				}
				// ---- move camera ----
				target.pc.projection();
				camera.setTarget(target);
			}
		}
	};
	////////////////////////////////////////////////////////////////////////////
	var init = function (json) {
		// ---- init script ----
		scr = new ge1doot.screen.InitEvents({
			container: "screen",
			canvas: "canvas",
			click: click,
			move: pointer
		});
		// ---- create faces ----
		var i = 0, f;
		while ( f = json.faces[i++] ) {
			faces.push(
				new Face(json.path, f)
				);
		}
		// ---- engine start ----
		run();
	};


	////////////////////////////////////////////////////////////////////////////
	// ===== main loop =====
	var run = function () {
		// ---- clear screen ----
		scr.ctx.clearRect(0,0, scr.width, scr.height);
		// ---- 3D projection ----
		var i = 0, f;
		while ( f = faces[i++] ) {
			f.projection();
		}
		// ---- faces depth sorting ----
		faces.sort(function (p0, p1) {
			return p1.distance - p0.distance;
		});

		// ---- drawing ----
		var i = 0, f;
		while ( f = faces[i++] ) {
			if (f.visible) {
				// ---- draw image ----
				f.img.draw3D(f.p0, f.p1, f.p2, f.p3);
				if (f.locked && scr.drag) f.locked = false;
				// if (f === faceOver) faceOver.border();
			} else break;
		}

		// ---- camera ----
		camera.move();
		// ---- loop ----

		if(PAUSE == true) {
			return true
		} else {
			requestAnimFrame(run);
		}

		// setTimeout(run, 16);
	};
	// return {    
		////////////////////////////////////////////////////////////////////////////
		// ---- onload event ----
		var loadImages = function (json) {
			window.addEventListener('load', function () {
				setTimeout(function () {
					init(json);
				}, 500);
			}, false);
		};
	// 	}
// }


						// oooooooooooo
						// o    19    o
						// o          o
						// o 22    20 o  23/24
						// o    21    o
						// o----------o
						// o    13    o
						// o          o
						// o 16    14 o  17/18
						// o    15    o
						// o----------ooooooooooo
						// o     1    |    7    o
						// o          |         o
						// o 4      2 | 10    8 o
						// o     3    |    9    o
						// oooooooooooooooooooooo
						//    5/6        11/12

						loadImages({
							path: "images/",
							faces: [
		// ---- main images ----
		{id: "1", src:"door.png",    x:0,    y:0,    z:UNIT,  rx:0,  ry:0,  w: 2*UNIT, h: HEIGHT, tl:4},
		// {id: "2", src:"wall2.png",  x:UNIT,  y:0,    z:0,    rx:0,  ry:-1, w: 2*UNIT, h: HEIGHT},
		{id: "3", src:"wall_violet.png", x:0,    y:0,    z:-UNIT, rx:0,  ry:-2, w: 2*UNIT, h: HEIGHT},
		{id: "4", src:"wall_blue.png", x:-UNIT, y:0,    z:0,    rx:0,  ry:1,  w: 2*UNIT, h: HEIGHT},
		{id: "5", src:"floor-tx.png",  x:0,    y:HEIGHT/2,  z:0,    rx:1,  ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "6", src:"wall_pink.png",  x:0,    y:-HEIGHT/2, z:0,    rx:-1, ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "7", src:"wall_green.png",    x:2*UNIT,    y:0,    z:UNIT,  rx:0,  ry:0,  w: 2*UNIT, h: HEIGHT},
		{id: "8", src:"wall_cyan.png",  x:3*UNIT,  y:0,    z:0,    rx:0,  ry:-1, w: 2*UNIT, h: HEIGHT},
		{id: "9", src:"wall_orange.png", x:2*UNIT,    y:0,    z:-UNIT, rx:0,  ry:-2, w: 2*UNIT, h: HEIGHT},
		// {id: "10", src:"door.png", x:UNIT, y:0,    z:0,    rx:0,  ry:1,  w: 2*UNIT, h: HEIGHT},
		{id: "11", src:"floor-tx.png",  x:2*UNIT,    y:HEIGHT/2,  z:0,    rx:1,  ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "12", src:"wall_yellow.png",  x:2*UNIT,    y:-HEIGHT/2, z:0,    rx:-1, ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		// {id: "13", src:"wall1.png",    x:0,    y:0,    z:3*UNIT,  rx:0,  ry:0,  w: 2*UNIT, h: HEIGHT},
		{id: "14", src:"wall_dark-blue.png",  x:UNIT,  y:0,    z:2*UNIT,    rx:0,  ry:-1, w: 2*UNIT, h: HEIGHT},
		{id: "15", src:"door.png", x:0,    y:0,    z:UNIT, rx:0,  ry:-2, w: 2*UNIT, h: HEIGHT, tl:4},
		{id: "16", src:"door.png", x:-UNIT, y:0,    z:2*UNIT,    rx:0,  ry:1,  w: 2*UNIT, h: HEIGHT, tl:4},
		{id: "17", src:"floor-tx.png",  x:0,    y:HEIGHT/2,  z:2*UNIT,    rx:1,  ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "18", src:"wall_dark-green.png",  x:0,    y:-HEIGHT/2, z:2*UNIT,    rx:-1, ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "19", src:"wall_light-grey.png",    x:0,    y:0,    z:5*UNIT,  rx:0,  ry:0,  w: 2*UNIT, h: HEIGHT},
		{id: "20", src:"wall_red.png",  x:UNIT,  y:0,    z:4*UNIT,    rx:0,  ry:-1, w: 2*UNIT, h: HEIGHT},
		// {id: "21", src:"wall3.png", x:0,    y:0,    z:3*UNIT, rx:0,  ry:-2, w: 2*UNIT, h: HEIGHT}
		{id: "22", src:"wall_shit.png", x:-UNIT, y:0,    z:4*UNIT,    rx:0,  ry:1,  w: 2*UNIT, h: HEIGHT},
		{id: "23", src:"floor-tx.png",  x:0,    y:150,  z:4*UNIT,    rx:1,  ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		{id: "24", src:"wall_bordeaux.png",  x:0,    y:-HEIGHT/2, z:4*UNIT,    rx:-1, ry:0,  w: 2*UNIT, h: 2*UNIT, select: false},
		]
	});

    // shim layer with setTimeout fallback
    window.requestAnimFrame = (function(){
    	return  window.requestAnimationFrame       || 
    	window.webkitRequestAnimationFrame || 
    	window.mozRequestAnimationFrame    || 
    	window.oRequestAnimationFrame      || 
    	window.msRequestAnimationFrame     || 
    	function( callback ){
    		window.setTimeout(callback, 1000 / 60);
    	};
    })();