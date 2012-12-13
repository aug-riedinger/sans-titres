


var params = {
	path: "images/",
	unit : 200,
	height : 300,
	threshold : 500
}

var room;
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

	var Rect = function(id,constr) {

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

		if(constr.walls[i]!= 'undefined') {
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
			if(typeof(constr.walls[i]) == 'object') {
				f.image = constr.walls[i];
			} else {
				f.src = (constr.walls[i]||'wall-nb.png');
			}
			faces.push(
				new Face(params.path, f)
				);
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

		if(constr.walls[i] != 'undefined') {
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
			if(typeof(constr.walls[i]) == 'object') {
				f.image = constr.walls[i];
			} else {
				f.src = (constr.walls[i]||'wall.png');
			}			
			faces.push(
				new Face(params.path, f)
				);
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

		if(constr.walls[i]!= 'undefined') {
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
			if(typeof(constr.walls[i]) == 'object') {
				f.image = constr.walls[i];
			} else {
				f.src = (constr.walls[i]||'wall-nb.png');
			}
			faces.push(
				new Face(params.path, f)
				);
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

		if(constr.walls[i]!= 'undefined') {
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
			if(typeof(constr.walls[i]) == 'object') {
				f.image = constr.walls[i];
			} else {
				f.src = (constr.walls[i]||'wall-nb.png');
			}
			faces.push(
				new Face(params.path, f)
				);
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
			src:"ceiling.png",    
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

		$.each(constr.arts,$.proxy(function(ind,art) {
			new Art(this,art);
		},this));
		return this;

	};

	var Art = function(rect,constr) {
		this.face = getFaceById(rect.id+':'+constr.face);
		var f = {
			id: rect.id+':'+constr.face+':'+constr.id,
			src: constr.src,
			full : constr.full,
			x:this.face.f.x,
			y:this.face.f.y,
			z:this.face.f.z + 10,
			rx:this.face.f.rx,
			ry:this.face.f.ry,
			w: constr.dimx,
			h: constr.dimz,
			select : true
		};
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
		this.rects = [];
		$.each(constr.rects,$.proxy(function(i,rect) {
			this.rects.push(new Rect(this.id+':'+i,rect));
		},this));

		return this;
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
				camera.setTarget(target);
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
		var parameters = getParameters();

		// ---- create faces ----
		getRoom(parameters.room||1,parameters.x||undefined,parameters.z||undefined);

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

var getRoom = function(id,x,z) {
	$.getJSON('/rooms/room'+id+'.json', function(data) {
		if(x != undefined || z != undefined) {
			var room = new Room(reCenter(data,x,z));
		} else {
			var bari = getBari(data);
			var room = new Room(reCenter(data,bari.x,bari.z));
		}
	});
};

var reCenter = function(data,x,z) {
	var locData = data;
	for(var i=0;i<locData.rects.length;i++) {
		locData.rects[i].position.x = locData.rects[i].position.x - x;
		locData.rects[i].position.z = locData.rects[i].position.z - z;
	}
	return locData;
};

var getBari = function(data) {
	var barix = 0;
	var bariz = 0;
	for(var i=0;i<data.rects.length;i++) {
		barix += data.rects[i].position.x + data.rects[i].size.dimx/2;
		bariz += data.rects[i].position.z + data.rects[i].size.dimz/2 ;
	}
	return {
		x: Math.round(barix/data.rects.length),
		z: Math.round(bariz/data.rects.length)
	}
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