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