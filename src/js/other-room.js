var origin, camPos, vect;

var params = {
	path: "images/",
	unit : 300,
	height : 300,
	threshold : 0,
	focalLength : 100
};

var position = {};

// var texture = {
// 	wall : drawWall(),
// 	door : drawDoor()
// };

// var cpt = 0;

var room;
// var Room = function () {
	// ======== private vars ========
	var PAUSE = false;
	var faces = [];
	var scr, target, targetold, faceOver;
	// ---- tweening engine ----
	var tweens = ge1doot.tweens;
	// ---- camera ----
	var camera = {
		focalLength: params.focalLength,
		x:  new tweens.Add(100),
		y:  new tweens.Add(100),
		z:  new tweens.Add(100, 0,0),
		ry: new tweens.Add(100, 0,0, true),
		zoom: new tweens.Add(100, 0.1, 1),
		// centered: false,
		cosX: 1,
		cosY: 1,
		sinX: 0,
		sinY: 0,
		targetToFace: function (target) {
			// ---- set position ----
			this.x.setTarget(target.pc.x);
			this.y.setTarget(target.pc.y);
			this.z.setTarget(target.pc.z);
			// ---- set view angles ----
			// this.rx.setTarget((Math.PI * 0.5) - target.ax);
			this.ry.setTarget((Math.PI * 0.5) - target.ay);
			// ---- zoom ----
			this.zoom.setTarget(target.f.zoom ? target.f.zoom : 2);
			// this.centered = false;
		},
		targetToPosition : function(obj) {
			// ---- set position ----
			this.x.setTarget((obj.x||this.x.target));
			this.y.setTarget((obj.y||this.y.target));
			this.z.setTarget((obj.z||this.z.target));
			// ---- set view angles ----

			// this.rx.setTarget((obj.rx ||this.rx.target));
			this.ry.setTarget((obj.ry||this.ry.target));

			// this.rx.setTarget((Math.PI * 0.5) - (obj.ax ||this.rx.value) - globalRX);
			// this.ry.setTarget((Math.PI * 0.5) - (obj.ay||this.ry.value) - globalRY);
			// this.centered = false;
		},
		up : function(strength) {
			this.targetToPosition({
				x : this.x.target + params.unit*this.sinY*(strength||1),
				z : this.z.target + params.unit*this.cosY*(strength||1)
			});
		},
		down : function(strength) {
			this.targetToPosition({
				x : this.x.target - params.unit*this.sinY*(strength||1),
				z : this.z.target - params.unit*this.cosY*(strength||1)
			});
		},
		left : function(strength) {
			this.targetToPosition({
				ry : this.ry.target - Math.PI/8*(strength||1) + 2*Math.PI
			});
		},
		right : function(strength) {
			this.targetToPosition({
				ry : this.ry.target + Math.PI/8*(strength||1) + 2*Math.PI
			});
		},
		center: function () {
			this.x.setTarget(0);
			this.y.setTarget(0);
			this.z.setTarget(0);
			this.zoom.setTarget(1);
			// this.centered = true;
		},
		zoomIn: function () {
			this.zoom.setTarget(this.zoom.target*1.25);
		},
		zoomOut: function () {
			this.zoom.setTarget(this.zoom.target*0.8);
		},
		move: function () {
			// ---- easing camera position and view angle ----
			tweens.iterate();
			// if(cpt % 100 == 0) {

			// 	console.log('x: '+camera.x.value);
			// 	console.log('y: '+camera.y.value);
			// 	console.log('z: '+camera.z.value);
			// 	console.log('rx: '+camera.rx.value);
			// 	console.log('ry: '+camera.ry.value);

			// }
			// ---- additional drag/touch rotations ----
			// globalRX += (((-scr.dragY * 0.01) - globalRX) * 0.1);
			// globalRY += (((-scr.dragX * 0.01) - globalRY) * 0.1);

			// this.ry.setTarget(((-scr.dragX * 1) - this.ry.value) * 0.1);

			// if (!this.centered && scr.drag) {
			// 	// ---- reset zoom & position ----
			// 	this.center();
			// 	targetold = false;
			// }
			// ---- pre calculate trigo ----
			// this.cosX = Math.cos(this.rx.value);
			// this.sinX = Math.sin(this.rx.value);
			this.cosY = Math.cos(this.ry.value);
			this.sinY = Math.sin(this.ry.value);
		},
		rotate: function (x, y, z) {
			// ---- 3D rotation ----

			var obj = {
				x: this.cosY * x - this.sinY * z,
				y: this.sinX * (this.cosY * z + this.sinY * x) + this.cosX * y,
				z: this.cosX * (this.cosY * z + this.sinY * x) - this.sinX * y	
			};

			var obj2 = {
				x: this.cosY * x + this.sinY * z,
				y: this.cosX * y - this.sinX * (this.cosY * z - this.sinY * x),
				z: this.sinX * y + this.cosX * (this.cosY * z - this.sinY * x) 	
			};

			var obj3 = {
				x: this.cosY * x - this.sinY * z,
				y: y,
				z: this.sinY * x  + this.cosY * z	
			};

			// var norm = Math.sqrt(obj.x*obj.x + obj.y*obj.y + obj.z*obj.z);
			// console.log(norm);

			return obj3;
			// return {
			// 	x: obj.x/norm,
			// 	y: obj.y/norm,
			// 	z: obj.z/norm
			// }
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
			// this.z - (camera.z.value - camera.focalLength)
			);

		//0.7303981633974492

		// ---- distance to the camera ----
		if (this.face) {
			var z = p.z + camera.focalLength;
			var distance = Math.sqrt(p.x * p.x + p.y * p.y + z * z);
			if (distance > this.face.distance) {
				this.face.distance = distance;
			}
		}
		// --- 2D projection ----
		// this.scale = 1;
		this.scale = Math.abs((camera.focalLength / (p.z + camera.focalLength)) * camera.zoom.value); // Me !!!
		this.X = (scr.width  * 0.5) + (p.x * this.scale);
		this.Y = (scr.height * 0.5) + (p.y * this.scale);
		this.p = p;
	};

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
		// this.c0 = new Point(false, [f.x, f.y, f.z], transform(-w, -h, -15, ax, ay));
		// this.c1 = new Point(false, [f.x, f.y, f.z], transform( w, -h, -15, ax, ay));
		// this.c2 = new Point(false, [f.x, f.y, f.z], transform( w,  h, -15, ax, ay));
		// this.c3 = new Point(false, [f.x, f.y, f.z], transform(-w,  h, -15, ax, ay));

		// this.norm = Math.sqrt(Math.pow((this.p0.y-this.pc.y)*(this.p1.z-this.pc.z) - (this.p0.z-this.pc.z)*(this.p1.y-this.pc.y),2)+Math.pow((this.p0.z-this.pc.z)*(this.p1.x-this.pc.x) - (this.p0.x-this.pc.x)*(this.p1.z-this.pc.z),2)+Math.pow((this.p0.x-this.pc.x)*(this.p1.y-this.pc.y) - (this.p0.y-this.pc.y)*(this.p1.x-this.pc.x),2));

		// this.psc = new Point(false, [
		// 	this.pc.x + ((this.p0.y-this.pc.y)*(this.p1.z-this.pc.z) - (this.p0.z-this.pc.z)*(this.p1.y-this.pc.y))*100/this.norm,
		// 	this.pc.y + ((this.p0.z-this.pc.z)*(this.p1.x-this.pc.x) - (this.p0.x-this.pc.x)*(this.p1.z-this.pc.z))*100/this.norm,
		// 	this.pc.z + ((this.p0.x-this.pc.x)*(this.p1.y-this.pc.y) - (this.p0.y-this.pc.y)*(this.p1.x-this.pc.x))*100/this.norm
		// 	])


		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----
		if(f.hasOwnProperty('src') && typeof(f.src) == 'string') {
			this.img = new ge1doot.textureMapping.Image(scr.canvas, path + f.src, f.tl || 2);
		} else {
			if(f.hasOwnProperty('image') && typeof(f.image) == 'object') {
				this.img = new ge1doot.textureMapping.Image(scr.canvas, f.image, f.tl || 2);
			}
		}


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
		// this.psc.projection();

		// ---- back face culling ----
		if(this.distance < params.threshold || 
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

	var Cube = function(id,constr) {

		//      ooooooooooo
		//      o    1    o
		//      o         o
		//      o 0     2 o   4\5
		//      o    3    o
		//      ooooooooooo
		//   z↑
		//    |
		//    0---→
		//        x
		this.id = id;
		this.dimx = constr.size.dimx;
		this.dimz = constr.size.dimz;

		this.x = constr.position.x*params.unit || 0;
		this.y = constr.position.y*params.unit || 0;
		this.z = constr.position.z*params.unit || 0;

		var i=0;
		var tempFace;

		//         Wall 0
		//      o..........
		//      o    1    .
		//      o         .
		//      o 0     2 .   4\5
		//      o    3    .
		//      o..........
		//   z↑
		//    |
		//    0---→
		//        x

		if(constr.walls[i].type != 'none') {
			var f = {
				id: this.id+':'+i, 
				x:this.x,  
				y:this.y,    
				z:this.z+params.unit*this.dimz/2,    
				rx:0,  
				ry:1, 
				w: params.unit*this.dimz, 
				h: params.height,
				select: false
			};
			if(constr.walls[i].type == 'wall') {
				f.image = drawWall(f.w, f.h);
			} else {
				if(constr.walls[i].type == 'door') {
					f.image = drawDoor(f.w,f.h);
					if(constr.walls[i].toRoom) {
						$.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
							room.adj.push(new Room(reCenter(data,position.x,position.z)));
						});
					}
				}
			}

			tempFace = new Face(params.path, f);

			faces.push(tempFace);

			$.each(constr.walls[i].arts,$.proxy(function(ind,art) {
				new Art(this,art);
			},tempFace));
		}
		i++;

		//         Wall 1
		//      ooooooooooo
		//      .    1    .
		//      .         .
		//      . 0     2 .   4\5
		//      .    3    .
		//      ...........
		//   z↑
		//    |
		//    0---→
		//        x

		if(constr.walls[i].type != 'none') {
			var f = {
				id: this.id+':'+i, 
				x:this.x+params.unit*this.dimx/2,    
				y:this.y,    
				z:this.z+params.unit*this.dimz,  
				rx:0,  
				ry:0,  
				w: params.unit*this.dimx, 
				h: params.height,
				select: false
			};
			if(constr.walls[i].type == 'wall') {
				f.image = drawWall(f.w, f.h);
				// f.image = texture.wall;
			} else {
				if(constr.walls[i].type == 'door') {
					f.image = drawDoor(f.w,f.h);

					if(constr.walls[i].toRoom) {
						$.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
							room.adj.push(new Room(reCenter(data,position.x,position.z)));
						});
					}
				}
			}

			tempFace = new Face(params.path, f);

			faces.push(tempFace);

			$.each(constr.walls[i].arts,$.proxy(function(ind,art) {
				new Art(this,art);
			},tempFace));
		}
		i++;

		//         Wall 2
		//      ..........o
		//      .    1    o
		//      .         o
		//      . 0     2 o   4\5
		//      .    3    o
		//      ..........o
		//   z↑
		//    |
		//    0---→
		//        x

		if(constr.walls[i].type != 'none') {
			var f = {
				id: this.id+':'+i, 
				x:this.x+ params.unit*this.dimx,  
				y:this.y,    
				z:this.z+ params.unit*this.dimz/2,    
				rx:0,  
				ry:-1, 
				w: params.unit*this.dimz, 
				h: params.height,
				select: false
			};
			if(constr.walls[i].type == 'wall') {
				f.image = drawWall(f.w, f.h);
				// f.image = texture.wall;
			} else {
				if(constr.walls[i].type == 'door') {
					f.image = drawDoor(f.w,f.h);

					if(constr.walls[i].toRoom) {
						$.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
							room.adj.push(new Room(reCenter(data,position.x,position.z)));
						});
					}
				}
			}

			tempFace = new Face(params.path, f);

			faces.push(tempFace);

			$.each(constr.walls[i].arts,$.proxy(function(ind,art) {
				new Art(this,art);
			},tempFace));
		}
		i++;

		//         Wall 3
		//      ...........
		//      .    1    .
		//      .         .
		//      . 0     2 .   4\5
		//      .    3    .
		//      ooooooooooo
		//   z↑
		//    |
		//    0---→
		//        x

		if(constr.walls[i].type != 'none') {
			var f = {
				id: this.id+':'+i, 
				x:this.x+params.unit*this.dimx/2,    
				y:this.y,    
				z:this.z,  
				rx:0,  
				ry:-2,  
				w: params.unit*this.dimx, 
				h: params.height,
				select: false
			};
			if(constr.walls[i].type == 'wall') {
				f.image = drawWall(f.w, f.h);
				// f.image = texture.wall;
			} else {
				if(constr.walls[i].type == 'door') {
					f.image = drawDoor(f.w,f.h);

					if(constr.walls[i].toRoom) {
						$.getJSON('/rooms/room'+constr.walls[i].toRoom+'.json', function(data) {
							room.adj.push(new Room(reCenter(data,position.x,position.z)));
						});
					}
				}
			}

			tempFace = new Face(params.path, f);

			faces.push(tempFace);

			$.each(constr.walls[i].arts,$.proxy(function(ind,art) {
				new Art(this,art);
			},tempFace));
		}
		i++;

		//         Wall 4
		//      ...........
		//      .    1    .
		//      .         .
		//      . 0     2 .   4\5
		//      .    3    .
		//      ...........
		//   z↑
		//    |
		//    0---→
		//        x

		var f = {
			id: this.id+':'+i, 
			src:"floor-tx.png",    
			x:this.x+params.unit*this.dimx/2,  
			y:this.y+params.height/2,    
			z:this.z+params.unit*this.dimz/2, 
			rx:1,  
			ry:0,  
			w: params.unit*this.dimx, 
			h: params.unit*this.dimz, 
			select: false
		};
		faces.push(
			new Face(params.path, f)
			);

		i++;
		//         Wall 5
		//      ...........
		//      .    1    .
		//      .         .
		//      . 0     2 .   4\5
		//      .    3    .
		//      ...........
		//   z↑
		//    |
		//    0---→
		//        x

		var f = {
			id: this.id+':'+i, 
			image: drawWall(params.unit*this.dimx,params.unit*this.dimz),
			x:this.x+params.unit*this.dimx/2,  
			y:this.y-params.height/2,    
			z:this.z+params.unit*this.dimz/2,
			rx:-1,  
			ry:0,  
			w: params.unit*this.dimx, 
			h: params.unit*this.dimz, 
			select: false
		};
		faces.push(
			new Face(params.path, f)
			);

		return this;

	};

	var Art = function(face,constr) {
		this.face = face;
		var f = {
			id: this.face.id+':'+constr.id,
			full : constr.full,
			x:this.face.f.x,
			// y:this.face.f.y,
			y:this.face.f.y - this.face.f.h/2 + this.face.f.h*(constr.posy||0.5),
			// z:this.face.f.z,
			z:this.face.f.z - this.face.f.w/2 + this.face.f.w*(constr.posz||0.5),
			rx:this.face.f.rx,
			ry:this.face.f.ry,
			w: constr.dimz,
			h: constr.dimy,
			select : true
		};

		if(constr.type == 'image') {
			f.image = new Image();
			f.image.src = params.path+constr.src;
		}

		faces.push(
			new Face(params.path, f)
			);
		return this;
	}

	// ======= faces constructor ========
	var Room = function (constr) {
		this.id = constr.id;
		this.name = constr.name;
		this.path = constr.path;
		this.cubes = [];
		this.adj = [];
		$.each(constr.cubes,$.proxy(function(i,cube) {
			this.cubes.push(new Cube(this.id+':'+i,cube));
		},this));

		return this;
	};

	var Vector = function (p1, p2) {
		this.p1 = p1;
		this.p2 = p2;
		this.x = p2.x - p1.x;
		this.y = p2.y - p1.y;
		this.z = p2.z - p1.z;
	}

	Vector.prototype.draw = function(color) {
		this.p1.highlight('yellow',2);
		this.p2.highlight('blue',5);

		this.p1.projection();
		this.p2.projection();

		scr.ctx.moveTo(this.p1.X, this.p1.Y);
		scr.ctx.lineTo(this.p2.X, this.p2.Y);
		scr.ctx.strokeStyle = (color||'rgb(128,128,128)');
		scr.ctx.lineWidth = 4;
		scr.ctx.lineJoin = "round";
		scr.ctx.stroke();
	}
	
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
	} else { 
		// scr.container.style.cursor = "move";
		// scr.container.style.cursor = "url('images/left.png'), move";

		if(scr.mouseX<scr.width/5) {
			scr.container.style.cursor = "url('images/left.png'), move";
		} else {
			if(scr.mouseX> scr.width - scr.width/5) {
				scr.container.style.cursor = "url('images/right.png'), move";
			} else {
				scr.container.style.cursor = "default";
			}
		}

	}
};
	// ======== onclick ========
	var click = function () {
		pointer();
		// ---- target image ----
		if (target && target.f.select != false) {
			if (target == targetold) {
				// ---- reset scene ----
				showImg(target.f.full);
			} else {
				targetold = target;
				target.locked = false;
				// ---- target redirection ----
				if (target.f.target != "") {
					//														What for ?
					var i = 0, f;
					while ( f = faces[i++] ) {
						if (f.f.id && f.f.id == target.f.target) {
							console.log('condition impossible ?');
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
				} else {
					console.log('condition impossible ?');
				}
				// ---- move camera ----
				target.pc.projection();
				camera.targetToFace(target);
				// target.on()
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

		var f = {
			id: '0', 
			x:0,  
			y:0,    
			z:0,    
			rx:0,  
			ry:0, 
			w: params.unit*1, 
			h: params.height,
			select: false,
		};

		f.image = drawWall(f.w, f.h);

		faces.push(new Face(params.path,f));

		f.ry = 2;

		faces.push(new Face(params.path,f));


		origin = new Point(null, [0,0,0]);
		px = new Point(null, [200,0,0]);
		py = new Point(null, [0,200,0]);
		pz = new Point(null, [0,0,200]);

		vx = new Vector(origin,px);
		vy = new Vector(origin,py);
		vz = new Vector(origin,pz);

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

		// origin.highlight();
		// camPos.highlight();
		vx.draw('green');
		vy.draw('yellow');
		vz.draw('orange');

		// ---- camera ----
		camera.move();
		// ---- loop ----

		// cpt++;		
		if(PAUSE == true) {
			return true
		} else {
			requestAnimFrame(run);
		}
	};
	// return {    
		////////////////////////////////////////////////////////////////////////////
		// ---- onload event ----
		// var loadImages = function (json) {
		// 	window.addEventListener('load', function () {
		// 		setTimeout(function () {
		// 		}, 500);
		// 	}, false);
		// };
	// 	}
// }

var getRoom = function(id) {
	$.getJSON('/rooms/room'+id+'.json', function(data) {
		if(!(position.hasOwnProperty('x') || position.hasOwnProperty('z'))) {
			setPosition(data, getParameters().x, getParameters().z);
		}
		room = new Room(reCenter(data,position.x,position.z));
	});
};

var reCenter = function(data,x,z) {
	var locData = data;
	for(var i=0;i<locData.cubes.length;i++) {
		locData.cubes[i].position.x = locData.cubes[i].position.x - x;
		locData.cubes[i].position.z = locData.cubes[i].position.z - z;
	}
	return locData;
};

var setPosition = function(data,x,z) {
	if(x != undefined || z != undefined) {
		position.x = x||0;
		position.z = z||0;
	} else {
		var barix = 0;
		var bariz = 0;
		for(var i=0;i<data.cubes.length;i++) {
			barix += data.cubes[i].position.x + data.cubes[i].size.dimx/2;
			bariz += data.cubes[i].position.z + data.cubes[i].size.dimz/2 ;
		}
		position.x = Math.round(barix/data.cubes.length);
		position.z = Math.round(bariz/data.cubes.length);
	}		
	return true;
}

var getFaceById = function(_id) {
	for (var i in faces) {
		if (faces[i].f.id == _id) {
			return faces[i];
		}
	}
	return null;
};

var showImg = function(src) {
	var img = new Image();
	img.src = params.path+src;
	img.className = 'art';
	$('#artClearView').html(img);
	$('#artClearView').fadeIn(1000);
	$('#artClearView').on('click',function(eventName) {
		remImg();
	});
};

var remImg = function() {
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
	camera.center();
	targetold = false;
	$('#artClearView').off('click',function(eventName) {
		remImg();
	});

}




init();