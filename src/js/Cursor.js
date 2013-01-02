var Cursor = function (canvas_ID) {
	this.X = 0;
	this.Y = 0;
	// this.startX = null;
	this.startY = null;
	this.aimedArt = null;
	this.aimedDoor = null;
	this.aimedSound = null;
	this.going = null;
	this.container = document.getElementById(canvas_ID);

	this.initEvents();

	return this;
};

Cursor.prototype.initEvents = function () {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {
		var face;

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);
		face = that.inFace();

		if(face && (face.f.type == 'image' || face.f.type == 'txt') ) {
			that.aimedArt = face;
		} else {
			that.aimedArt = null;
		}

		if(face && face.f.type == 'sound' ) {
			that.aimedSound = face;
		} else {
			that.aimedSound = null;
		}

		if(face && face.f.type == 'door') {
			that.aimedDoor = face;
		} else {
			that.aimedDoor = null;
		}

		that.setCursor();
	}

	this.container.onclick = function (e) { 

		if (that.aimedArt || that.aimedDoor) {
			if(that.aimedArt) {
				camera.targetToFace(that.aimedArt);
			} 

			if (that.aimedDoor) {
				camera.targetToPosition({
					x: that.aimedDoor.pc.x,
					y: that.aimedDoor.pc.y,
					z: that.aimedDoor.pc.z + params.focalLength,
					rx: 0,
					ry: (that.aimedDoor.ay - (Math.PI * 0.5)),
					zoom: 1
				}, false);
			// console.log(this)
			that.going = that.aimedDoor.f.toRoom;
			$(scr.canvas).one('inPosition', $.proxy(function(e){
				room = new Room(this.going, true).load();
				this.going = null;
			}, that));
		}

	} else {
		camera.goToPosition(camera.position + 1);
		console.log('going to position '+ (camera.position + 1));
	}



	e.preventDefault();
	return false; 
};

this.container.ondblclick = function (e) {
		// console.log('dblclick');

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
	for (var i=0; i< room.cubes.length; i++) {
		for (var j=0; j < room.cubes[i].walls.length; j++) {
			face = room.cubes[i].walls[j];
			if(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3))) {
				return face;
			}
			
		}
	}
	return null;
};


Cursor.prototype.setCursor = function () {
	if (this.aimedArt) {
		// return this.container.style.cursor = "pointer";
		return this.container.style.cursor = "url('images/eye_icon.png'), pointer";
	} 

	if (this.aimedDoor) {
		return this.container.style.cursor = "url('images/arrow.png'), pointer";
	}

	if (this.aimedSound) {
		return this.container.style.cursor = "pointer";
	}

	return this.container.style.cursor = "move";
};