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

		this.c0 = new Point(null, [f.x, f.y, f.z], transform(-w-10, -h-10, 0, ax, ay));
		this.c1 = new Point(null, [f.x, f.y, f.z], transform(w+10, -h-10, 0, ax, ay));
		this.c2 = new Point(null, [f.x, f.y, f.z], transform(w+10, h+10, 0, ax, ay));
		this.c3 = new Point(null, [f.x, f.y, f.z], transform(-w-10, h+10, 0, ax, ay));

		this.points = [this.p0, this.p1, this.p2, this.p3];

		this.pv = this.makePv();

		// ---- target angle ----
		var r = transform(ax, ay, 0, ax, ay, 0);
		this.ax = r.x + Math.PI / 2;
		this.ay = r.y + Math.PI / 2;

		// ---- create 3D image ----
		if(this.f.type === 'art') {
			this.img = new renderer.Image(scr.canvas, this.f.thumb, f.tl || 2);
		}

		return this;
	};

	Face.prototype.makePv = function() {
		if(this.f.adj) {

			var res = [];
			var found;
			for (i=0; i<this.points.length; i++) {
				found = false;
				for (j=0; j<this.f.adj.length; j++){
					for (k=0; k<this.f.adj[j].points.length; k++) {
						if(equalsCoord(this.points[i], this.f.adj[j].points[k])) {
							found = true;
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
		this.distance = 0;
		this.conditions = 0;
		this.visible = true;
		this.distance = -99999;
		// ---- points projection ----
		this.pc.projection(); // optional
		this.p0.projection();
		this.p1.projection();
		this.p2.projection();
		this.p3.projection();

		// Remove invisible faces;

		if((this.p1.Y - this.p0.Y) * (this.p3.X - this.p0.X) - (this.p1.X - this.p0.X) * (this.p3.Y - this.p0.Y) > 0) {
			// this.visible = false;
			// this.distance = -99999;
			this.conditions += 1;
			if((this.p3.Y - this.p2.Y) * (this.p1.X - this.p2.X) - (this.p3.X - this.p2.X) * (this.p1.Y - this.p2.Y) > 0){
				this.visible = false;
				this.distance = -99999;
				this.conditions += 2;
			}
		}


		if(this.p0.behind && this.p1.behind && this.p2.behind && this.p3.behind) {
			this.visible = false;
			this.distance = -99999;
			this.conditions += 10;
		}

		if(this.p0.behind || this.p1.behind || this.p2.behind || this.p3.behind) {
			// this.visible = false;
			// this.distance = -99999;
			this.conditions += 20;
		}

		if(!(
			((this.p1.Y - this.p0.Y) / (this.p1.X - this.p0.X) -
				(this.p2.Y - this.p0.Y) / (this.p2.X - this.p0.X) < 0) ^
			(this.p0.X <= this.p1.X == this.p0.X > this.p2.X)
			)) {
			// this.visible = false;
			// this.distance = -99999;
			// this.conditions += 40;
		}

		this.visible = (this.forceVisible !== undefined ? this.forceVisible : this.visible);

	};

	Face.prototype.buffer = function(room) {
		if(this.f.type === 'art' && this.f.subtype === 'image') {
			var img = new Image();
			img.src = this.f.src;
			img.id = this.f.id;
			img.className = 'art';
			room.images.push(img);
		}

		if(this.f.type === 'art' && this.f.subtype === 'html') {
			var ifrm = document.createElement('iframe');
			ifrm.setAttribute('src', this.f.src);
			ifrm.className = 'html';
			ifrm.id = this.f.id;
			ifrm.height = this.f.iFrameHeight || 600;
			ifrm.width = this.f.iFrameWidth || 800;
			room.texts.push(ifrm);
		}
	};

	Face.prototype.render = function() {
		if(this.f.type === 'art') {
			if(cursor.aimedFace && this.f.id === cursor.aimedFace.f.id) {
				this.img.render(this.p0, this.p1, this.p2, this.p3, 'black');
			} else {
				this.img.render(this.p0, this.p1, this.p2, this.p3, 'white');
			}
		}
		// if(this.f.type === 'position') {
		// 	scr.ctx.beginPath();
		// 	if(this.f.ryf === 0) {
		// 		scr.ctx.lineTo(this.p2.X, this.p2.Y);
		// 		scr.ctx.lineTo(this.p3.X, this.p3.Y);
		// 		scr.ctx.lineTo(this.pc.X, this.pc.Y);
		// 	}
		// 	if(this.f.ryf === 1) {
		// 		scr.ctx.lineTo(this.p1.X, this.p1.Y);
		// 		scr.ctx.lineTo(this.pc.X, this.pc.Y);
		// 		scr.ctx.lineTo(this.p2.X, this.p2.Y);
		// 	}
		// 	if(this.f.ryf === -1) {
		// 		scr.ctx.lineTo(this.p0.X, this.p0.Y);
		// 		scr.ctx.lineTo(this.pc.X, this.pc.Y);
		// 		scr.ctx.lineTo(this.p3.X, this.p3.Y);
		// 	}
		// 	if(this.f.ryf === -2) {
		// 		scr.ctx.lineTo(this.p0.X, this.p0.Y);
		// 		scr.ctx.lineTo(this.p1.X, this.p1.Y);
		// 		scr.ctx.lineTo(this.pc.X, this.pc.Y);
		// 	}
		// 	// scr.ctx.lineTo(this.p2.X,this.p2.Y);
		// 	// scr.ctx.lineTo(this.p3.X,this.p3.Y);
		// 	scr.ctx.closePath();
		// 	scr.ctx.lineWidth = 1;
		// 	scr.ctx.fillStyle = '#70726d';
		// 	scr.ctx.fill();
		// }
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
				art: art,
				select: true
			};
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
				x: face.f.x,
				y: params.height / 2 - params.humanHeight * 1.8,
				z: face.f.z,
				rx: face.f.rx,
				ry: face.f.ry,
				w: artConstr.width,
				h: artConstr.height,
				thumb: artConstr.thumb,
				src: artConstr.src,
				info: artConstr.info || {},
				iFrameHeight: artConstr.iFrameHeight,
				iFrameWidth: artConstr.iFrameWidth,
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