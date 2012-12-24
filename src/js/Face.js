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

		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----

		if (this.f.type == 'wall') {
			this.wall = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges);
		}

		if (this.f.type == 'door') {
			this.door = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, 'white' ,true);
		}

		if (this.f.type == 'ceiling') {
			this.ceiling = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges);
		}		

		if (this.f.type == 'floor') {
			this.floor = new ge1doot.textureMapping.Monochromatic(scr.canvas, this.p0, this.p1, this.p2, this.p3, this.f.edges, '#ead49a');

			// this.img = new ge1doot.textureMapping.Image(scr.canvas, path + f.src, f.tl || 2);
		}

		if (this.f.type == 'art') {
			this.img = new ge1doot.textureMapping.Image(scr.canvas, path + f.thumb, f.tl || 2);			
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
		if(this.distance < params.wallDist || 
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
	// if (!this.locked && this.hidden === false) this.hidden = true;
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

		if (this.f.type == 'art') {
			this.img.render(this.p0, this.p1, this.p2, this.p3);				
		}
	};

	var faceMaker = {
		'top' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':top',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * _x,  
				y: 0,    
				z: params.unit * (_z + 1/2),    
				rx: 0,  
				ry: 0, 
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: false
			};
			return new Face(params.path, f);			
		},
		'bottom' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':bottom',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * _x,    
				y: 0,    
				z: params.unit * (_z - 1/2),  
				rx:0,  
				ry:-2,  
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: false
			};
			return new Face(params.path, f);			
		},
		'left' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':left',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * _x - params.unit/2,  
				y: 0,    
				z: params.unit * _z,    
				rx:0,  
				ry:1,  
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: false
			};
			return new Face(params.path, f);			
		},
		'right' : function(_room, _x, _z, edges, toRoom) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':right',
				type : (toRoom && toRoom != '.')?'door':'wall',
				x: params.unit * _x + params.unit/2,  
				y: 0,    
				z: params.unit * _z,    
				rx:0,  
				ry:-1, 
				w: params.unit, 
				h: params.height,
				edges: (edges||[1,2,3,4]),
				toRoom : (toRoom && toRoom != '.')?toRoom:-1,
				select: false
			};
			return new Face(params.path, f);			
		},
		'ceiling' : function(_room, _x, _z, edges) {
			var f = {
				id: _room.id+':'+_x+':'+_z+':ceiling',
				type : 'ceiling',
				x: params.unit * _x,  
				y: - params.height/2,    
				z: params.unit * _z,
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
				x: params.unit * _x,  
				y: params.height/2,    
				z: params.unit * _z,
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
		'art': function(_room, face, _w, _h, _thumb, _src) {
			var f = {
				id: _room.id+':'+face.f.x+':'+face.f.z+':art',
				type : 'art',
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
		}
	}

