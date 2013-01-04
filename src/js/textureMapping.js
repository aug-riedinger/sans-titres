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

var topRenderer = function () {
	var face, face0, face1;
	for (var i=0; i<room.tops.length; i++) {
		face = room.tops[i];
		if(face.visible) {
			if(face0===undefined && face1 === undefined) {
				face0 = face1 = face;
			} 
			if (face.f.x > face0.f.x) {
				face0 = face;
			}
			if (face.f.x < face1.f.x) {
				face1 = face;
			}
		}
	}
	if (face0 !== undefined && face1 !== undefined) {
		scr.ctx.beginPath();
		scr.ctx.moveTo(face0.p1.X,face0.p1.Y);
		scr.ctx.lineTo(face0.p2.X,face0.p2.Y);
		scr.ctx.lineTo(face1.p3.X,face1.p3.Y);
		scr.ctx.lineTo(face1.p0.X,face1.p0.Y);
		scr.ctx.lineTo(face0.p1.X,face0.p1.Y);
		scr.ctx.closePath();
		// scr.ctx.fillStyle = '#f9f9f9';
		var grd = scr.ctx.createLinearGradient(face0.p1.X, face0.p1.Y, face1.p0.X, face1.p0.Y);
		grd.addColorStop(0, '#f9f9f9');   
		grd.addColorStop(1, '#A1A1A1');      
		scr.ctx.fillStyle = grd;

		scr.ctx.fill();
		scr.ctx.stroke();
	}
}

var bottomRenderer = function () {
	var face, face0, face1;
	for (var i=0; i<room.bottoms.length; i++) {
		face = room.bottoms[i];
		if(face.visible) {
			if(face0===undefined && face1 === undefined) {
				face0 = face1 = face;
			} 
			if (face.f.x > face0.f.x) {
				face0 = face;
			}
			if (face.f.x < face1.f.x) {
				face1 = face;
			}
		}
	}
	if (face0 !== undefined && face1 !== undefined) {
		scr.ctx.beginPath();
		scr.ctx.moveTo(face0.p3.X,face0.p3.Y);
		scr.ctx.lineTo(face0.p0.X,face0.p0.Y);
		scr.ctx.lineTo(face1.p1.X,face1.p1.Y);
		scr.ctx.lineTo(face1.p2.X,face1.p2.Y);
		scr.ctx.lineTo(face0.p3.X,face0.p3.Y);
		scr.ctx.closePath();
		scr.ctx.fillStyle = '#f9f9f9';
		var grd = scr.ctx.createLinearGradient(face0.p1.X, face0.p1.Y, face1.p0.X, face1.p0.Y);
		grd.addColorStop(0, '#A1A1A1');      
		grd.addColorStop(1, '#f9f9f9');   
		scr.ctx.fillStyle = grd;

		scr.ctx.fill();
		scr.ctx.stroke();
	}

}

var floorRenderer = function () {
	var face, face0, face1, face2, face3;
	for (var i=0; i<room.floors.length; i++) {
		face = room.floors[i];
		if(face.visible) {
			if(face0===undefined && face1 === undefined && face2 === undefined && face3 === undefined) {
				face0 = face1 = face2 = face3 = face;
			} 

			if (face.f.x >= face0.f.x && face.f.z >= face0.f.z) {
				face0 = face;
			}
			if (face.f.x <= face1.f.x && face.f.z >= face1.f.z) {
				face1 = face;
			}
			if (face.f.x <= face2.f.x && face.f.z <= face2.f.z) {
				face2 = face;
			}
			if (face.f.x >= face3.f.x && face.f.z <= face3.f.z) {
				face3 = face;
			}
		}
	}
	// console.log(face0);
	// console.log(face1);
	// console.log(face2);
	// console.log(face3);
	if (face0 !== undefined && face1 !== undefined) {
		scr.ctx.beginPath();
		scr.ctx.moveTo(face0.p1.X,face0.p1.Y);
		scr.ctx.lineTo(face1.p0.X,face1.p0.Y);
		scr.ctx.lineTo(face2.p3.X,face2.p3.Y);
		scr.ctx.lineTo(face3.p2.X,face3.p2.Y);
		scr.ctx.moveTo(face0.p1.X,face0.p1.Y);
		scr.ctx.closePath();
		scr.ctx.fillStyle = '#80827d';
		// var grd = scr.ctx.createLinearGradient(face0.p1.X, face0.p1.Y, face1.p0.X, face1.p0.Y);
		// grd.addColorStop(0, '#A1A1A1');      
		// grd.addColorStop(1, '#f9f9f9');   
		// scr.ctx.fillStyle = grd;

		scr.ctx.fill();
		scr.ctx.stroke();
	}

}
var floorRenderer2 = function () {
	var face, point;
	var points = [];
	var sortedPoints = [];
	var toAdd;
	for (var i=0; i<room.floors.length; i++) {
		face = room.floors[i];
		if(face.visible) {
			toAdd = {
				p0: true,
				p1: true,
				p2: true,
				p3: true
			};

			for(var j=0; j< points.length; j++) {
				point = points[j];
				if(face.p0.x === point.x && face.p0.z === point.z) {
					point.cpt++;
					toAdd.p0 = false;
				}
				if(face.p1.x === point.x && face.p1.z === point.z) {
					point.cpt++;
					toAdd.p1 = false;
				}
				if(face.p2.x === point.x && face.p2.z === point.z) {
					point.cpt++;
					toAdd.p2 = false;
				}
				if(face.p3.x === point.x && face.p3.z === point.z) {
					point.cpt++;
					toAdd.p3 = false;
				}
			}	

			if(toAdd.p0) {
				points.push({
					x: face.p0.x,
					z: face.p0.z,
					X: face.p0.X,
					Y: face.p0.Y,
					cpt: 1
				});
			}
			if(toAdd.p1) {
				points.push({
					x: face.p1.x,
					z: face.p1.z,
					X: face.p1.X,
					Y: face.p1.Y,
					cpt: 1
				});
			}
			if(toAdd.p2) {
				points.push({
					x: face.p2.x,
					z: face.p2.z,
					X: face.p2.X,
					Y: face.p2.Y,
					cpt: 1
				});
			}
			if(toAdd.p3) {
				points.push({
					x: face.p3.x,
					z: face.p3.z,
					X: face.p3.X,
					Y: face.p3.Y,
					cpt: 1
				});
			}
		}
	}


	scr.ctx.beginPath();
	for(var k=0; k<points.length; k++) {
		point = points[k];
		if(point.cpt === 1) {
			scr.ctx.lineTo(point.X,point.Y);
		}
	}
	scr.ctx.closePath();
	scr.ctx.fillStyle = '#80827d';
		// var grd = scr.ctx.createLinearGradient(face0.p1.X, face0.p1.Y, face1.p0.X, face1.p0.Y);
		// grd.addColorStop(0, '#A1A1A1');      
		// grd.addColorStop(1, '#f9f9f9');   
		// scr.ctx.fillStyle = grd;

		scr.ctx.fill();
		scr.ctx.stroke();

	}

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
