var Cursor = function(canvas_ID, segmentX, segmentY) {
	this.segmentX = segmentX;
	this.segmentY = segmentY;
	this.container = document.getElementById(canvas_ID);

	this.X = 0;
	this.Y = 0;
	this.strengthX = 0;
	this.strengthY = 0;
	this.aimedFace = null;
	this.going = null;
	this.moving = false;
	this.initEvents();

	return this;
};

Cursor.prototype.initEvents = function() {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);
		that.calcStrength();

		that.aimedFace = that.inFace();
		that.setCursor();
	};

	this.container.onclick = function(e) {

		if($('#artInfo').css('top') === '0px') {
			$('#artInfo').animate({
				top: -50
			}, 1000);
		}

		if(that.aimedFace) {
			if(that.aimedFace.f.type === 'art') {
				if(that.aimedFace.f.subtype === 'image') {
					showImg(that.aimedFace);
				}
				if(that.aimedFace.f.subtype === 'html') {
					showTxt(that.aimedFace);
				}
				history.pushState({
					viewArt: that.aimedFace.f.artId
				}, 'Sans-titres, Salle ' + room.id + ' Oeuvre' + that.aimedFace.f.artId, '#!room=' + room.id + '&art=' + that.aimedFace.f.artId);
			}

			if(that.aimedFace.f.type === 'door') {
				camera.targetToFace(that.aimedFace);

				that.going = that.aimedFace.f.to;
				$(scr.canvas).one('inPosition', $.proxy(function(e) {
					for(var i = 0; i < room.sounds.length; i++) {
						room.sounds[i].remove();
					}
					history.pushState({
						goToRoom: this.going
					}, 'Sans-titres, Salle ' + this.going, '#!room=' + this.going);
					newRoom = new Room(this.going, true);
					newRoom.load();
					this.going = null;
				}, that));
			}

			// if(that.aimedFace.f.type === 'position') {
			// }
			if(that.aimedFace.f.type === 'floor') {
				if(that.aimedFace.f.art) {
				camera.targetToFace(that.aimedFace);
				history.pushState({
					goToArt: that.aimedFace.f.art.f.artId
				}, 'Sans-titres, Salle ' + room.id + ' Oeuvre' + that.aimedFace.f.art.f.artId, '#!room=' + room.id + '&art=' + that.aimedFace.f.art.f.artId);
				$('#artTitle').html(that.aimedFace.f.art.f.info.title || 'Inconnu');
				$('#artAuthor').html(that.aimedFace.f.art.f.info.author || 'Inconnu');
				$('#artCategory').html(that.aimedFace.f.art.f.info.category || 'Inconnu');
				$(scr.canvas).one('inPosition', function() {
					$('#artInfo').animate({
						top: 0
					}, 1000);
				});
				} else {
				camera.targetToFace(that.aimedFace);
					
				}
			}

		}

		e.preventDefault();
		return false;
	};

	this.container.ondblclick = function(e) {
		camera.godView();
		e.preventDefault();
		return false;
	};

	this.container.onmspointerdown = this.container.ontouchstart = this.container.onmousedown = function(e) {};

	this.container.onmspointerup = this.container.ontouchend = this.container.onmouseup = function(e) {};

	this.container.onmspointercancel = this.container.ontouchcancel = function(e) {};

};

Cursor.prototype.calcStrength = function() {
	if(this.X > scr.width / this.segmentX && this.X < scr.width - scr.width / this.segmentX) {
		this.strengthX = 0;
		this.moving = false;
	}

	if(this.X < scr.width / this.segmentX) {
		this.strengthX = (this.X - scr.width / this.segmentX) / (scr.width / this.segmentX);
		this.moving = true;
	}
	if(this.X > scr.width - scr.width / this.segmentX) {
		this.strengthX = 1 - (scr.width - this.X) / (scr.width / this.segmentX);
		this.moving = true;
	}

	if(this.Y > scr.height / this.segmentY && this.Y < scr.height - scr.height / this.segmentY) {
		this.strengthY = 0;
		this.moving = false;
	}

	if(this.Y < scr.height / this.segmentY) {
		this.strengthY = (this.Y - scr.height / this.segmentY) / (scr.height / this.segmentY);
		this.moving = true;
	}
	if(this.Y > scr.height - scr.height / this.segmentY) {
		this.strengthY = 1 - (scr.height - this.Y) / (scr.height / this.segmentY);
		this.moving = true;
	}
};

Cursor.prototype.inTriangle = function(p1, p2, p3) {
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
	return(u >= 0) && (v >= 0) && (u + v < 1);
};

Cursor.prototype.inFace = function() {
	var i, j;
	var face;

	for(i = 0; i < room.arts.length; i++) {
		face = room.arts[i];
		if(this.faceSelected(face)) {
			return face;
		}
	}

	for(i = 0; i < room.doors.length; i++) {
		face = room.doors[i];
		face.projection();
		if(this.faceSelected(face)) {
			return face;
		}
	}

	// for(i = 0; i < room.positions.length; i++) {
	// 	face = room.positions[i];
	// 	face.projection();
	// 	if(this.faceSelected(face)) {
	// 		return face;
	// 	}
	// }

	for(i = 0; i < room.floors.length; i++) {
		for(j = 0; j < room.floors[i].length; j++) {
			face = room.floors[i][j];
			face.projection();
			if(this.faceSelected(face)) {
				return face;
			}
		}

	}

	return null;
};

Cursor.prototype.faceSelected = function(face) {
	return(face.f.select && face.visible && (this.inTriangle(face.p0, face.p1, face.p2) || this.inTriangle(face.p0, face.p2, face.p3)));
};

Cursor.prototype.setCursor = function() {
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

	if(this.strengthY < 0) {
		return this.container.className = 'top';
	}
	if(this.strengthY > 0) {
		return this.container.className = 'bottom';
	}

	if(this.strengthX > 0) {
		return this.container.className = 'right';
	}
	if(this.strengthX < 0) {
		return this.container.className = 'left';
	}

	if(this.aimedFace) {
		if(this.aimedFace.f.type === 'art') {
			return this.container.className = 'see';
		}
		if(this.aimedFace.f.type === 'door') {
			return this.container.className = 'goroom';
		}
		// if(this.aimedFace.f.type === 'position') {
		// 	return this.container.className = 'gonsee';
		// }
		if(this.aimedFace.f.type === 'floor') {
			return this.container.className = 'go';
		}
	}

	return this.container.className = '';
};