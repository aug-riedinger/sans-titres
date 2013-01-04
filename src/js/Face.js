	// ======= faces constructor ========
	var Face = function (path, f) {
		this.f = f;
		var w  = f.w * 0.5;
		var h  = f.h * 0.5;
		var ax = f.rx * Math.PI * 0.5;
		var ay = f.ry * Math.PI * 0.5;
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

		this.pv = new Point(null, [f.x, f.y, f.z], transform(0, 0, params.unit, ax, ay));


		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----
		if (this.f.type === 'image' || this.f.type === 'txt') {
			this.img = new renderer.Image(scr.canvas, this.f.thumb, f.tl || 2);			
		}

		return this;
	};


	// ======== face projection ========
	Face.prototype.projection = function () {
		this.conditions = [];
		this.visible = true;
		this.distance = -99999;
		// ---- points projection ----
		this.pc.projection(); // optional
		this.p0.projection();
		this.p1.projection();
		this.p2.projection();
		this.p3.projection();
		this.pv.projection();

		// ---- back face culling ----
		if (this.distance < params.wallDist) {
			this.visible = false;
			this.distance = -99999;		

			this.conditions.push(0);
		}


		// if(!(
		// 	((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) - 
		// 		(this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) < 0) ^ 
		// 	(this.p0.X <= this.p1.X == this.p0.X > this.p2.X)
		// 	)) {
		// 	this.visible = false;
		// 	this.distance = -99998;
		// }
		var para = -1000;
		if(this.p0.p.z<para && this.p1.p.z<para && this.p2.p.z<para && this.p3.p.z<para) {
			this.visible = false;
			this.distance = -99999;		
			this.conditions.push(1);	
		}

		if(!(this.p0.inScreen || this.p1.inScreen || this.p2.inScreen || this.p3.inScreen || this.pc.inScreen)) {
			this.visible = false;
			this.distance = -99999;		
			this.conditions.push(5);
		}

		if ((this.p1.p.y - this.p0.p.y) * (this.p3.p.x - this.p0.p.x) - (this.p1.p.x - this.p0.p.x) * (this.p3.p.y - this.p0.p.y) > 0) {	
			this.conditions.push(3);
			// this.visible = false;
			// this.distance = -99999;	
		}

		if ((this.p1.Y - this.p0.Y) * (this.p3.X - this.p0.X) - (this.p1.X - this.p0.X) * (this.p3.Y - this.p0.Y) > 0) {
			this.visible = false;
			this.distance = -99999;		
			this.conditions.push(4);
		}
		// if (this.pc.distance < this.pv.distance) {
		// 	this.visible = false;
		// 	this.distance = -99998;
		// }
	};

	Face.prototype.render = function() {
		if (this.f.type === 'image' || this.f.type === 'txt') {
			this.img.render(this.p0, this.p1, this.p2, this.p3);
		}
	};

	var faceMaker = {
		'top' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':-',
				type : '-',
				x: params.unit * (_x + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + 1/2 + _room.position.z),    
				rx: 0,  
				ry: 0, 
				w: params.unit, 
				h: params.height,
				select: false
			};
			return new Face(params.path, f);			
		},
		'bottom' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':_',
				type : '_',
				x: params.unit * (_x + _room.position.x),    
				y: 0,    
				z: params.unit * (_z - 1/2 + + _room.position.z),  
				rx:0,  
				ry:-2,  
				w: params.unit, 
				h: params.height,
				select: false
			};
			return new Face(params.path, f);			
		},
		'left' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':|',
				type : '|',
				x: params.unit * (_x - 1/2 + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + _room.position.z),    
				rx:0,  
				ry:1,  
				w: params.unit, 
				h: params.height,
				select: false
			};
			return new Face(params.path, f);			
		},
		'right' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':!',
				type : '!',
				x: params.unit * (_x + 1/2 + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + _room.position.z),    
				rx:0,  
				ry:-1, 
				w: params.unit, 
				h: params.height,
				select: false
			};
			return new Face(params.path, f);			
		},
		'ceiling' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':£',
				type : '£',
				x: params.unit * (_x + _room.position.x),  
				y: - params.height/2,    
				z: params.unit * (_z + _room.position.z),
				rx:-1,  
				ry:0,  
				w: params.unit, 
				h: params.unit, 
				select: false
			};
			return new Face(params.path, f);			
		},
		'floor' : function(_room, _x, _z) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':€',
				type : '€',
				x: params.unit * (_x + _room.position.x),  
				y: params.height/2,    
				z: params.unit * (_z + _room.position.z),
				rx:1,  
				ry:0,  
				w: params.unit, 
				h: params.unit, 
				select: false
			};
			return new Face(params.path, f);			
		},
		'door': function(_room, face, to) {
			var f = {
				id: _room.id+':'+Math.floor(face.f.x/params.unit)+':'+Math.floor(face.f.z/params.unit)+':@',
				type : '@',
				x: face.f.x, 
				y: params.height/2 - params.humanHeight*3/4,    
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				// w: 100, 
				// h: 200,   
				w: params.unit*2/3, 
				h: params.humanHeight*3/2, 
				to: to,  
				select: true
			};
			return new Face(params.path, f);			
		},
		'image': function(_room, face, _w, _h, _thumb, _src) {
			var f = {
				id: _room.id+':'+Math.floor(face.f.x/params.unit)+':'+Math.floor(face.f.z/params.unit)+':image',
				type : 'image',
				x: face.f.x, 
				y: params.humanHeight,    
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				w: _w, 
				h: _h, 
				thumb: _thumb, 
				src: _src,   
				select: true
			};
			return new Face(params.path, f);			
		},
		'sound': function(_room, face, _w, _h, _thumb, _src) {
			var f = {
				id: _room.id+':'+Math.floor(face.f.x/params.unit)+':'+Math.floor(face.f.z/params.unit)+':sound',
				type : 'sound',
				x: face.f.x, 
				y: face.f.y,    
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				w: _w, 
				h: _h, 
				thumb: _thumb, 
				src: _src,
				select: true
			};
			return new Face(params.path, f);			
		},
		'txt': function(_room, face, _w, _h, _thumb, _src) {
			var f = {
				id: _room.id+':'+Math.floor(face.f.x/params.unit)+':'+Math.floor(face.f.z/params.unit)+':sound',
				type : 'sound',
				x: face.f.x, 
				y: params.humanHeight,    
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				w: _w, 
				h: _h, 
				thumb: _thumb,
				src: _src,   
				select: true
			};
			return new Face(params.path, f);			
		}
	}

