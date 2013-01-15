var renderer = {};

renderer.facesMerged = function (faces, dim, color, color2) {
	var grd;
	var point;
	var points = getEdges(faces, dim);


	if(points.length>2) {
		scr.ctx.beginPath();
		for(var k=0; k<points.length; k++) {
			point = points[k];
			scr.ctx.lineTo(point.X,point.Y);
		}
		scr.ctx.closePath();
		if(SLOW || color2 === undefined) {
			scr.ctx.fillStyle = color||'white';
		} else {
			grd = scr.ctx.createLinearGradient(points[0].X, points[0].Y, points[parseInt((points.length-1)/2, 10)].X, points[parseInt((points.length-1)/2, 10)].Y);
			grd.addColorStop(0, color);
			grd.addColorStop(1, color2);
			scr.ctx.fillStyle = grd;
		}
		scr.ctx.lineWidth = 1;
		scr.ctx.strokeStyle = color||'white';
		scr.ctx.fill();
		scr.ctx.stroke();
	}
};

renderer.Triangle = function (parent, p0, p1, p2) {
	// this.randColor = 'rgb('+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+','+parseInt(Math.random()*256)+')';
	this.p0 = p0;
	this.p1 = p1;
	this.p2 = p2;
	this.next = false;
	// ---- pre calculation for transform----
	this.d    = p0.tx * (p2.ty - p1.ty) - p1.tx * p2.ty + p2.tx * p1.ty + (p1.tx - p2.tx) * p0.ty;
	this.pmy  = p1.ty - p2.ty;
	this.pmx  = p1.tx - p2.tx;
	this.pxy  = p2.tx * p1.ty - p1.tx * p2.ty;
	// ---- link for iteration ----
	if (!parent.firstTriangle) parent.firstTriangle = this; else parent.prev.next = this;
	parent.prev = this;
};

// ==== image constructor ====
renderer.Image = function (canvas, imgSrc, lev) {
	this.canvas        = canvas;
	this.ctx           = canvas.getContext("2d");
	if(typeof(imgSrc) == 'string') {
		this.texture       = new Image();
		this.texture.src   = imgSrc;
	}
	if(typeof(imgSrc) == 'object') {
		this.texture = imgSrc;
	}
	this.lev           = lev;
	this.isLoading     = true;
	this.firstPoint    = false;
	this.firstTriangle = false;
	this.prev          = false;
};


renderer.Image.prototype.loading = function () {
	var i, j;
	var tx, ty;
	var p;
	var t;
	var lev;
	var points;
	if (this.texture.complete && this.texture.width) {
		this.isLoading = false;
		points = [];
		// ---- create points ----
		for (i = 0; i <= this.lev; i++) {
			for (j = 0; j <= this.lev; j++) {
				tx = (i * (this.texture.width / this.lev));
				ty = (j * (this.texture.height / this.lev));
				p = {
					tx: tx,
					ty: ty,
					nx: tx / this.texture.width,
					ny: ty / this.texture.height,
					next: false
				};
				points.push(p);
				if (!this.firstPoint) this.firstPoint = p; else this.prev.next = p;
				this.prev = p;
			}
		}
		lev = this.lev + 1;
		for (i = 0; i < this.lev; i++) {
			for (j = 0; j < this.lev; j++) {
				// ---- up ----
				t = new renderer.Triangle(this,
					points[j + i * lev],
					points[j + i * lev + 1],
					points[j + (i + 1) * lev]
					);
				// ---- down ----
				t = new renderer.Triangle(this,
					points[j + (i + 1) * lev + 1],
					points[j + (i + 1) * lev],
					points[j + i * lev + 1]
					);
			}
		}
	}
};

// ==== draw3D prototype ====
renderer.Image.prototype.render = function (p0, p1, p2, p3) {
	var array = [p0, p1, p2, p3];
	// ---- loading ----
	if (this.isLoading) {
		this.loading();
	} else {
		// ---- project points ----
		var p = this.firstPoint;
		do {
			var mx = p0.X + p.ny * (p3.X - p0.X);
			var my = p0.Y + p.ny * (p3.Y - p0.Y);
			p.px = (mx + p.nx * (p1.X + p.ny * (p2.X - p1.X) - mx));
			p.py = (my + p.nx * (p1.Y + p.ny * (p2.Y - p1.Y) - my));
		} while ( p = p.next );
		// ---- draw triangles ----
		var w = this.canvas.width;
		var h = this.canvas.height;
		var t = this.firstTriangle;
		do {
			var p0 = t.p0;
			var p1 = t.p1;
			var p2 = t.p2;
			// ---- centroid ----
			var xc = (p0.px + p1.px + p2.px) / 3;
			var yc = (p0.py + p1.py + p2.py) / 3;
			// ---- clipping ----
			var isTriangleVisible = true;
			if (xc < 0 || xc > w || yc < 0 || yc > h) {
				if (Math.max(p0.px, p1.px, p2.px) < 0 || Math.min(p0.px, p1.px, p2.px) > w || Math.max(p0.py, p1.py, p2.py) < 0 || Math.min(p0.py, p1.py, p2.py) > h) {
					isTriangleVisible = false;
				}
			}
			if (isTriangleVisible) {
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
				this.ctx.transform(
					-(p0.ty * (p2.px - p1.px) -  p1.ty * p2.px  + p2.ty *  p1.px + t.pmy * p0.px) / t.d, // m11
					 (p1.ty *  p2.py + p0.ty  * (p1.py - p2.py) - p2.ty *  p1.py - t.pmy * p0.py) / t.d, // m12
					 (p0.tx * (p2.px - p1.px) -  p1.tx * p2.px  + p2.tx *  p1.px + t.pmx * p0.px) / t.d, // m21
					-(p1.tx *  p2.py + p0.tx  * (p1.py - p2.py) - p2.tx *  p1.py - t.pmx * p0.py) / t.d, // m22
					 (p0.tx * (p2.ty * p1.px  -  p1.ty * p2.px) + p0.ty * (p1.tx *  p2.px - p2.tx  * p1.px) + t.pxy * p0.px) / t.d, // dx
					 (p0.tx * (p2.ty * p1.py  -  p1.ty * p2.py) + p0.ty * (p1.tx *  p2.py - p2.tx  * p1.py) + t.pxy * p0.py) / t.d  // dy
					 );
				this.ctx.drawImage(this.texture, 0, 0);
				this.ctx.restore();
			}
		} while ( t = t.next );


		this.ctx.beginPath();
		for (var i=0; i< array.length; i++) {
			this.ctx.lineTo(array[i].X,array[i].Y);

		}
		this.ctx.closePath();
		this.ctx.lineWidth = 1;
		this.ctx.strokeStyle = 'white';
		this.ctx.stroke();

	}
};