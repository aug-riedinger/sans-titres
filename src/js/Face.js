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

		this.pv = new Point(null, [f.x, f.y, f.z], transform(0, 0, - params.unit, ax, ay));


		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----

		if (this.f.type === 'wall') {
			this.wall = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, this.f.color||params.wallColor);
		}
		if (this.f.type === 'door') {
			this.door = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, this.f.color||params.wallColor ,true);
		}
		if (this.f.type === 'ceiling') {
			this.ceiling = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, this.f.color||params.wallColor);
		}		
		if (this.f.type === 'floor') {
			this.floor = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, this.f.color||params.floorColor);
		}
		if (this.f.type === 'image') {
			this.img = new ge1doot.textureMapping.Image(scr.canvas, this.f.thumb, f.tl || 2);			
		}
		if (this.f.type === 'sound') {
			this.img = new ge1doot.textureMapping.Image(scr.canvas, this.f.thumb, f.tl || 2);			
		}
		if (this.f.type === 'txt') {
			// console.log(this.f.src);
			// $.getJSON(this.f.src, $.proxy(function(data) {
			// 	console.log(data);
			// 	this.img = new ge1doot.textureMapping.Image(scr.canvas, drawCanvas(data), f.tl || 2);			
			// }, this));
	this.img = new ge1doot.textureMapping.Image(scr.canvas, this.f.thumb, f.tl || 2);			
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

		// if(!(this.p0.inScreen || this.p1.inScreen || this.p2.inScreen || this.p3.inScreen || this.pc.inScreen)) {
		// 	this.visible = false;
		// 	this.distance = -99999;		
		// 	this.conditions.push(2);

		// }

		if ((this.p1.p.y - this.p0.p.y) * (this.p3.p.x - this.p0.p.x) - (this.p1.p.x - this.p0.p.x) * (this.p3.p.y - this.p0.p.y) > 0) {	
			this.conditions.push(3);

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
		if (this.f.type == 'wall') {
			this.wall.render();
		}

		if (this.f.type == 'door') {
			this.door.render();
		}

		if (this.f.type == 'ceiling') {
			this.ceiling.render();
		}		

		if (this.f.type == 'floor') {
			this.floor.render();
			// this.img.render(this.p0, this.p1, this.p2, this.p3);				
		}

		if (this.f.type == 'image') {
			this.img.render(this.p0, this.p1, this.p2, this.p3);
		}
		if (this.f.type == 'sound') {
			this.img.render(this.p0, this.p1, this.p2, this.p3);
		}
		if (this.f.type == 'txt') {
			this.img.render(this.p0, this.p1, this.p2, this.p3);
		}
	};

	var faceMaker = {
		'top' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':top',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * (_x + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + 1/2 + _room.position.z),    
				rx: 0,  
				ry: 0, 
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: (toRoom && toRoom != '.')
			};
			return new Face(params.path, f);			
		},
		'bottom' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':bottom',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * (_x + _room.position.x),    
				y: 0,    
				z: params.unit * (_z - 1/2 + + _room.position.z),  
				rx:0,  
				ry:-2,  
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: (toRoom && toRoom != '.')
			};
			return new Face(params.path, f);			
		},
		'left' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':left',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * (_x - 1/2 + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + _room.position.z),    
				rx:0,  
				ry:1,  
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: (toRoom && toRoom != '.')
			};
			return new Face(params.path, f);			
		},
		'right' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':right',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * (_x + 1/2 + _room.position.x),  
				y: 0,    
				z: params.unit * (_z + _room.position.z),    
				rx:0,  
				ry:-1, 
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: (toRoom && toRoom != '.')
			};
			return new Face(params.path, f);			
		},
		'ceiling' : function(_room, _x, _z, edges) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':ceiling',
				type : 'ceiling',
				x: params.unit * (_x + _room.position.x),  
				y: - params.height/2,    
				z: params.unit * (_z + _room.position.z),
				rx:-1,  
				ry:0,  
				w: params.unit, 
				h: params.unit, 
				edges: (edges||[1,2,3,4]),
				select: false
			};
			return new Face(params.path, f);			
		},
		'floor' : function(_room, _x, _z, edges) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':floor',
				type : 'floor',
				x: params.unit * (_x + _room.position.x),  
				y: params.height/2,    
				z: params.unit * (_z + _room.position.z),
				rx:1,  
				ry:0,  
				w: params.unit, 
				h: params.unit, 
				src:"floor-tx.png",    
				edges: (edges||[1,2,3,4]),
				select: false
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

