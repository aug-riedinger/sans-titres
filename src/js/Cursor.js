var Cursor = function (canvas_ID) {
	this.X = 0;
	this.Y = 0;
	// this.startX = null;
	this.startY = null;
	this.aimedArt = null;
	this.aimedDoor = null;
	this.aimedSound = null;
	this.aimedPosition = null;
	this.aimedFloor = null;
	this.going = null;
	this.container = document.getElementById(canvas_ID);
	this.strengthX = 0;
	this.strengthY = 0;
	this.initEvents();
	this.moving = false;

	return this;
};

Cursor.prototype.initEvents = function () {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {
		var face, point;
		var segmentX = 8;
		var segmentY = 15;

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);
		face = that.inFace();
		point = that.inPointView();

		if(that.X > scr.width/segmentX && that.X < scr.width - scr.width/segmentX) {
			that.strengthX = 0;
			that.moving = false;
		}

		if(that.X < scr.width/segmentX) {
			that.strengthX = (that.X - scr.width/segmentX) / (scr.width/segmentX), that.strengthX;
			that.moving = true;
		}
		if(that.X > scr.width - scr.width/segmentX) {
			that.strengthX =  1 - (scr.width - that.X )/(scr.width/segmentX), that.strengthX;
			that.moving = true;
		}

		if(that.Y > scr.height/segmentY && that.Y < scr.height - scr.height/segmentY) {
			that.strengthY = 0;
			that.moving = false;
		}

		if(that.Y < scr.height/segmentY) {
			that.strengthY = (that.Y - scr.height/segmentY) / (scr.height/segmentY), that.strengthY;
			that.moving = true;
		}
		if(that.Y > scr.height - scr.height/segmentY) {
			that.strengthY =  1 - (scr.height - that.Y )/(scr.height/segmentY), that.strengthY;
			that.moving = true;
		}

		if(face && (face.f.type == 'art') ) {
			that.aimedArt = face;
		} else {
			that.aimedArt = null;
		}

		if(face && face.f.type == '@') {
			that.aimedDoor = face;
		} else {
			that.aimedDoor = null;
		}

		if(face && face.f.type === 'position') {
			that.aimedPosition = face;
		} else {
			that.aimedPosition = null;
		}

		if(face && face.f.type === '€') {
			that.aimedFloor = face;
		} else {
			that.aimedFloor = null;
		}

		that.setCursor();
	}

	this.container.onclick = function (e) { 

		if (that.aimedArt || that.aimedDoor || that.aimedPosition || that.aimedFloor) {
			if(that.aimedArt) {
				if (that.aimedArt.f.subtype === 'image') {
					showImg(that.aimedArt.f.src);
				}
				if (that.aimedArt.f.subtype === 'txt') {
					showTxt(that.aimedArt.f.src);
				}
			} 

			if (that.aimedDoor) {
				camera.targetToFace(that.aimedDoor);


				that.going = that.aimedDoor.f.to;
				$(scr.canvas).one('inPosition', $.proxy(function(e){
					for(var i=0; i<room.sounds.length; i++) {
						room.sounds[i].remove();
					}
					room = new Room(this.going, true).load();
					this.going = null;
				}, that));
			}

			if(that.aimedPosition) {
				camera.targetToFace(that.aimedPosition);
			}
			if(that.aimedFloor) {
				camera.targetToFace(that.aimedFloor);
			}

		}

		e.preventDefault();
		return false; 
	};

	this.container.ondblclick = function (e) {
		// console.log('dblclick');
		// camera.goToPosition(camera.position + 1);
		e.preventDefault();
		return false;
	}

	this.container.onmspointerdown = this.container.ontouchstart = this.container.onmousedown = function (e) {
		// that.startX = that.X;
		that.startY = that.Y;
	}

	this.container.onmspointerup = this.container.ontouchend = this.container.onmouseup = function(e) {
		var mvt = that.Y - that.startY
		
		if (mvt > 5) {
			camera.left();
		} 

		// that.startX = null;		
		that.startY = null;		
	}

	this.container.onmspointercancel = this.container.ontouchcancel = function(e) {
		console.log('touchcancel');
	}

}

Cursor.prototype.inTriangle = function (p1, p2, p3) {
	// ---- Compute vectors ----
	var v0x = p3.X - p1.X;
	var v0y = p3.Y - p1.Y;
	var v1x = p2.X - p1.X;
	var v1y = p2.Y - p1.Y;
	var v2x = this.X - p1.X;
	var v2y = this.Y - p1.Y;
	// ---- Compute dot products ----
	var dot00 = v0x * v0x + v0y * v0y;
	var dot01 = v0x * v1x + v0y * v1y;
	var dot02 = v0x * v2x + v0y * v2y;
	var dot11 = v1x * v1x + v1y * v1y;
	var dot12 = v1x * v2x + v1y * v2y;
	// ---- Compute barycentric coordinates ----
	var invDenom = 1 / (dot00 * dot11 - dot01 * dot01);
	var u = (dot11 * dot02 - dot01 * dot12) * invDenom;
	var v = (dot00 * dot12 - dot01 * dot02) * invDenom;
	// ---- Check if point is in triangle ----
	return (u >= 0) && (v >= 0) && (u + v < 1);
};

// Cursor.prototype.inArts = function() {
// 	var art;
// 	for (var i=0; i< arts.length; i++) {
// 		art = arts[i];
// 		if(this.inTriangle(art.p0, art.p1, art.p2) || this.inTriangle(art.p0, art.p2, art.p3)) {
// 			return art;
// 		}
// 	}
// 	return null;
// };

Cursor.prototype.inFace = function() {
	var face;
	for (var i=0; i< room.arts.length; i++) {
		face = room.arts[i];
		if(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3))) {
			return face;
		}
	}
	for (var i=0; i< room.doors.length; i++) {
		face = room.doors[i];
		face.projection();
		if(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3))) {
			return face;
		}

	}
	for (var i=0; i< room.positions.length; i++) {
		face = room.positions[i];
		face.projection();
		if(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3))) {
			return face;
		}

	}

	for (var i=0; i< room.floors.length; i++) {
		face = room.floors[i];
		face.projection();
		if(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3))) {
			return face;
		}

	}




	return null;
};

Cursor.prototype.inPointView = function() {
	// var threshold = 300;
	// var point;
	// for(var i=0; i<room.arts.length; i++) {
	// 	point = room.arts[i].pv;
	// 	if ((this.X - point.X)*(this.X - point.X) + (this.Y - point.Y)*(this.Y - point.Y) < threshold) {
	// 		return point;
	// 	}
	// }
}


Cursor.prototype.move = function () {
	if (!camera.godView && camera.rx.target === camera.rx.value) {
		camera.rx.setValue(camera.rx.value - 0.02*this.strengthY);
	}
	if (!camera.godView && camera.ry.target === camera.ry.value) {
		camera.ry.setValue(camera.ry.value - 0.02*this.strengthX);
	}	
}

Cursor.prototype.setCursor = function () {
	if (this.aimedArt) {
		return this.container.className = 'see' ;
	} 

	if(this.strengthY < 0 && this.strengthX < 0) {
		return this.container.className = 'top-left';
	}
	if(this.strengthY < 0 && this.strengthX > 0) {
		return this.container.className = 'top-right';
	}
	if(this.strengthY > 0 && this.strengthX < 0) {
		return this.container.className = 'bottom-left';
	}
	if(this.strengthY > 0 && this.strengthX > 0) {
		return this.container.className = 'bottom-right';
	}

	if (this.strengthY < 0) {
		return this.container.className = 'top';
	}
	if (this.strengthY > 0) {
		return this.container.className = 'bottom';
	}

	if (this.strengthX > 0) {
		return this.container.className = 'right';
	}
	if (this.strengthX < 0) {
		return this.container.className = 'left';
	}

	if (this.aimedDoor) {
		return this.container.className = 'goroom';
	}

	if (this.aimedPosition) {
		return this.container.className = 'gonsee';
	}

	if (this.aimedFloor) {
		return this.container.className = 'go';
	}	

	return this.container.className = '';
};