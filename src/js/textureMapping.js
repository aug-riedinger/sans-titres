////////////////////////////////////////////////////////////
// ==== HTML5 CANVAS Texture Mapping Image ====
// @author Gerard Ferrandez / http://www.dhteumeuleu.com/
// last update: Feb 26, 2012
// Licensed under CC-BY - do not remove this notice
////////////////////////////////////////////////////////////

"use strict";

var ge1doot = ge1doot || {};

ge1doot.textureMapping = {};

// ==== triangle constructor ====
ge1doot.textureMapping.Triangle = function (parent, p0, p1, p2) {
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

// ==== wall constructor ====
ge1doot.textureMapping.Monochromatic = function (canvas, p0, p1, p2, p3, edges, color, door) {
	this.canvas        = canvas;
	this.ctx           = canvas.getContext("2d");
	this.p0 = p0;
	this.p1 = p1;
	this.p2 = p2;
	this.p3 = p3;
	this.edges = edges||[1,2,3,4];
	this.color = color||'white';
	this.door = door||false;
};

// My.renderer = function () {
// 	var face = face0 = face1 = face2 = face3 = room.tops[0];
// 	for (var i=0; i<room.tops.length; i++) {
// 		face = room.tops[i];
// 		if(face.visible) {
// 			if (face.X < face0.X) {
// 				face0 = face;
// 			}
// 			if (face.Y < face1.Y) {
// 				face1 = face;
// 			}
// 			if (face.X > face2.X) {
// 				face2 = face;
// 			}
// 			if (face.Y > face3.Y) {
// 				face3 = face;
// 			}
// 		}
// 	}

// 	this.ctx.beginPath();
// 	this.ctx.moveTo(this.p0.X,this.p0.Y);
// 	this.ctx.lineTo(this.p1.X,this.p1.Y);
// 	this.ctx.lineTo(this.p2.X,this.p2.Y);

// }

ge1doot.textureMapping.Monochromatic.prototype.render = function() {
	this.ctx.beginPath();
	this.ctx.moveTo(this.p0.X,this.p0.Y);
	this.ctx.lineTo(this.p1.X,this.p1.Y);
	this.ctx.lineTo(this.p2.X,this.p2.Y);
	if(this.door) {
		this.ctx.lineTo((this.p2.X*5+this.p3.X)/6,(this.p2.Y*5+this.p3.Y)/6);
		this.ctx.lineTo((((this.p1.X*5+this.p0.X)/6) + (this.p2.X*5+this.p3.X)/6)/2,(((this.p1.Y*5+this.p0.Y)/6) + (this.p2.Y*5+this.p3.Y)/6)/2);
		this.ctx.lineTo((((this.p1.X+this.p0.X*5)/6) + (this.p2.X+this.p3.X*5)/6)/2,(((this.p1.Y+this.p0.Y*5)/6) + (this.p2.Y+this.p3.Y*5)/6)/2);
		this.ctx.lineTo((this.p2.X+this.p3.X*5)/6,(this.p2.Y+this.p3.Y*5)/6);		
	}
	this.ctx.lineTo(this.p3.X,this.p3.Y);
	this.ctx.closePath();
	this.ctx.fillStyle = this.color;
	this.ctx.strokeStyle = this.color;
      // var grd = this.ctx.createLinearGradient(this.p0.X, this.p0.Y, this.p3.X, this.p3.Y);
      // grd.addColorStop(0, this.color);   
      // grd.addColorStop(1, 'white');      
      // this.ctx.fillStyle = grd;

      this.ctx.fill();
      this.ctx.stroke();

	// this.ctx.beginPath();

	// if(this.edges.indexOf(1) > -1) {
	// 	this.ctx.moveTo(this.p0.X,this.p0.Y);
	// 	this.ctx.lineTo(this.p1.X,this.p1.Y);
	// } 
	// if(this.edges.indexOf(2) > -1) {
	// 	this.ctx.moveTo(this.p1.X,this.p1.Y);
	// 	this.ctx.lineTo(this.p2.X,this.p2.Y);
	// } 
	// if(this.edges.indexOf(3) > -1) {
	// 	this.ctx.moveTo(this.p2.X,this.p2.Y);

	// if(this.door) {
	// 	this.ctx.lineTo((this.p2.X*5+this.p3.X)/6,(this.p2.Y*5+this.p3.Y)/6);
	// 	this.ctx.lineTo((((this.p1.X*5+this.p0.X)/6) + (this.p2.X*5+this.p3.X)/6)/2,(((this.p1.Y*5+this.p0.Y)/6) + (this.p2.Y*5+this.p3.Y)/6)/2);
	// 	this.ctx.lineTo((((this.p1.X+this.p0.X*5)/6) + (this.p2.X+this.p3.X*5)/6)/2,(((this.p1.Y+this.p0.Y*5)/6) + (this.p2.Y+this.p3.Y*5)/6)/2);
	// 	this.ctx.lineTo((this.p2.X+this.p3.X*5)/6,(this.p2.Y+this.p3.Y*5)/6);		
	// }

	// 	this.ctx.lineTo(this.p3.X,this.p3.Y);
	// } 
	// if(this.edges.indexOf(4) > -1) {
	// 	this.ctx.moveTo(this.p3.X,this.p3.Y);
	// 	this.ctx.lineTo(this.p0.X,this.p0.Y);
	// } 		
	// this.ctx.strokeStyle = 'black';
	// this.ctx.stroke();

};

// ==== image constructor ====
ge1doot.textureMapping.Image = function (canvas, imgSrc, lev) {
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

// ==== loading prototype ====
ge1doot.textureMapping.Image.prototype.loading = function () {
	if (this.texture.complete && this.texture.width) {
		this.isLoading = false;
		var points = [];
		// ---- create points ----
		for (var i = 0; i <= this.lev; i++) {
			for (var j = 0; j <= this.lev; j++) {
				var tx = (i * (this.texture.width / this.lev));
				var ty = (j * (this.texture.height / this.lev));
				var p = {
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
		var lev = this.lev + 1;
		for (var i = 0; i < this.lev; i++) {
			for (var j = 0; j < this.lev; j++) {
				// ---- up ----
				var t = new ge1doot.textureMapping.Triangle(this, 
					points[j + i * lev],
					points[j + i * lev + 1],
					points[j + (i + 1) * lev]
					);
				// ---- down ----
				var t = new ge1doot.textureMapping.Triangle(this,
					points[j + (i + 1) * lev + 1],
					points[j + (i + 1) * lev],
					points[j + i * lev + 1]
					);
			}
		}
	}
};
// ==== draw3D prototype ====
ge1doot.textureMapping.Image.prototype.render = function (p0, p1, p2, p3) {
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
				// this.ctx.fillStyle = 'white';
				// this.ctx.fill();

				// DEBUG
				// this.ctx.strokeStyle = t.randColor;
				// this.ctx.lineWidth = 2;
				// this.ctx.lineJoin = "round";
				// this.ctx.stroke();

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
	}
};
