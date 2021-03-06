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
		if(this.f.src) {
			var splited = this.f.src.split('.');
			var ext = splited[splited.length-1];
			if(ext === 'html' || ext === 'htm') {
				this.html = document.createElement('iframe');
				this.html.setAttribute('src', this.f.src);
				this.html.className = 'html';
				this.html.id = this.f.id;
				this.html.height = this.f.iFrameHeight || 600;
				this.html.width = this.f.iFrameWidth || 800;

				return;
			}

			if(ext === 'jpg' || ext === 'png' || ext === 'jpeg') {
				this.html = new Image();
				this.html.src = this.f.src;
				this.html.id = this.f.id;
				this.html.className = 'art';

				return;
			}

			console.log('Warning ! Extension not buffered : '+ext);
			
		}

	};

	Face.prototype.render = function() {
		if(this.f.type === 'art') {
			if(cursor.aimedFace && this.f.id === cursor.aimedFace.f.id) {
				this.img.render(this.p0, this.p1, this.p2, this.p3, this.f.borderColor||'black', this.f.border);
			} else {
				if(this.f.subtype === 'text' || this.f.subtype === 'video') {
					this.img.render(this.p0, this.p1, this.p2, this.p3, '', false);
				} else {
					this.img.render(this.p0, this.p1, this.p2, this.p3, this.f.borderHoverColor||'white', this.f.border);

				}
			}
		}
	};

	var faceMaker = {
		'top': function(_room, _x, _z) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':top',
				roomId: _room.id,
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
				roomId: _room.id,
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
				roomId: _room.id,
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
				roomId: _room.id,
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
		'floor': function(_room, _x, _z, adj, art) {
			var f = {
				id: _room.id + ':' + _x + ':' + _z + ':floor',
				roomId: _room.id,
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
		'art': function(_room, face, artConstr) {
			var f = {
				id: _room.id + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
				roomId: _room.id,
				type: 'art',
				subtype: artConstr.type,
				x: face.f.x + (artConstr.x||0),
				y: params.height / 2 - params.humanHeight * 1.8 + (artConstr.y||0),
				z: face.f.z + (artConstr.z||0),
				rx: face.f.rx,
				ry: face.f.ry,
				w: artConstr.width,
				h: artConstr.height,
				thumb: OeuvresURL + artConstr.thumb,
				src: OeuvresURL + (artConstr.src||artConstr.thumb),
				border: artConstr.border,
				info: artConstr.info || {},
				iFrameHeight: artConstr.iFrameHeight,
				iFrameWidth: artConstr.iFrameWidth,
				level: artConstr.level,
				artId: artConstr.id,
				select: true,
				sound: artConstr.sound
			};
			return new Face(f);
		},
		'position': function(_room, art) {
			var f = {
				id: _room.id + ':' + Math.floor(art.f.x / params.unit) + ':' + Math.floor(art.f.z / params.unit) + ':position',
				roomId: _room.id,
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