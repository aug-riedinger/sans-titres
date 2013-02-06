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
	// this.moving = false;
	this.initEvents();

	return this;
};

Cursor.prototype.initEvents = function() {
	var that = this;

	this.container.onmspointermove = this.container.ontouchmove = this.container.onmousemove = function(e) {

		that.X = (e.clientX !== undefined ? e.clientX : e.touches[0].clientX);
		that.Y = (e.clientY !== undefined ? e.clientY : e.touches[0].clientY);

		// if(that.muted && (Math.abs(that.muted.X - that.X) > 20 || Math.abs(that.muted.Y - that.Y) > 20)) {
		// 	that.muted = null;
		// }

		that.calcStrength();

		that.aimedFace = that.inFace();
		that.setCursor();
	};

	this.container.onclick = function(e) {
		var roomId, artId, title;

		if(that.aimedFace) {
			roomId = that.aimedFace.f.roomId;
			
			if(that.aimedFace.f.type === 'art') {
				artId = that.aimedFace.f.artId || null;
				showHtml(that.aimedFace.html);
				showArtInfo(that.aimedFace);

				if(that.aimedFace.f.subtype === 'text' || that.aimedFace.f.subtype === 'video') {
					for(i=0; i<sounds.length; i++) {
						sounds[i].audio.pause();
					}
				}

			}

			if(that.aimedFace.f.type === 'floor') {
				// if(that.aimedFace.f.art) {
				// 	artId = that.aimedFace.f.art.f.artId || null;
				// 	$(scr.canvas).one('inPosition', $.proxy(function() {
				// 		cursor.mute();
				// 		$('#artTitle').html(this.f.art.f.info.title || 'Inconnu');
				// 		$('#artAuthor').html(this.f.art.f.info.author || 'Inconnu');
				// 		$('#artDescription').html(this.f.art.f.info.description || 'Inconnu');
				// 		$('#artInfo').fadeIn(1000, function() {
				// 			setTimeout(function() {
				// 				$('#artInfo').fadeOut(1000);
				// 			}, 3000);
				// 		});
				// 	},that.aimedFace));
				// }
				camera.targetToFace(that.aimedFace);

				if(roomId !== rooms[0].id) {
					$(scr.canvas).one('inMidPosition', $.proxy(function() {
						enteredRoom(this.roomId);
					}, {
						roomId: roomId
					}));
				}
			}

			if (!history.state || history.state.roomId !== roomId || history.state.artId !== artId) {
				title = 'Sans-titres, Salle ' + roomId + (artId?' Oeuvre ' + artId:'');
				history.pushState({
					roomId: roomId,
					artId: artId
				}, title, '#!room=' + roomId + (artId?'&art=' + artId:''));
				document.title = title;
			}
		}

		// e.preventDefault();
		// return false;
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

// Cursor.prototype.mute = function() {
// 	this.muted = {
// 		X: this.X,
// 		Y: this.Y
// 	};
// 	this.calcStrength();
// 	// this.aimedFace = this.inFace();
// 	this.setCursor();
// };

Cursor.prototype.calcStrength = function() {

	// if(this.muted) {
	// 	return this.strengthX = this.strengthY = 0;
	// }

	if(this.X > scr.width / this.segmentX && this.X < scr.width - scr.width / this.segmentX) {
		this.strengthX = 0;
		// this.moving = false;
	}

	if(this.X < scr.width / this.segmentX) {
		this.strengthX = (this.X - scr.width / this.segmentX) / (scr.width / this.segmentX);
		// this.moving = true;
	}
	if(this.X > scr.width - scr.width / this.segmentX) {
		this.strengthX = 1 - (scr.width - this.X) / (scr.width / this.segmentX);
		// this.moving = true;
	}

	if(this.Y > scr.height / this.segmentY && this.Y < scr.height - scr.height / this.segmentY) {
		this.strengthY = 0;
		// this.moving = false;
	}

	if(this.Y < scr.height / this.segmentY) {
		this.strengthY = (this.Y - scr.height / this.segmentY) / (scr.height / this.segmentY);
		// this.moving = true;
	}
	if(this.Y > scr.height - scr.height / this.segmentY) {
		this.strengthY = 1 - (scr.height - this.Y) / (scr.height / this.segmentY);
		// this.moving = true;
	}

	this.strengthX = this.strengthX*0.5;
	this.strengthY = this.strengthY*0.5;

	if(this.strengthX > 0 && this.strengthY !== 0) {
		this.strengthX = 0;
		this.strengthY = 0;
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
	var i, j, k;
	var face;
	var room;

	for(k=0; k<rooms.length; k++) {
		room = rooms[k];

		for(i = 0; i < room.arts.length; i++) {
			face = room.arts[i];
			if(this.faceSelected(face)) {
				return face;
			}
		}

		for(i = 0; i < room.floors.length; i++) {
			face = room.floors[i];
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
		return this.changeClass('top-left');
	}
	if(this.strengthY < 0 && this.strengthX > 0) {
		return this.changeClass('top-right');
	}
	if(this.strengthY > 0 && this.strengthX < 0) {
		return this.changeClass('bottom-left');
	}
	if(this.strengthY > 0 && this.strengthX > 0) {
		return this.changeClass('bottom-right');
	}

	if(this.strengthY < 0) {
		return this.changeClass('top');
	}
	if(this.strengthY > 0) {
		return this.changeClass('bottom');
	}

	if(this.strengthX > 0) {
		return this.changeClass('right');
	}
	if(this.strengthX < 0) {
		return this.changeClass('left');
	}

	if(this.aimedFace) {
		if(this.aimedFace.f.type === 'art') {
			return this.changeClass('see');
		}
		if(this.aimedFace.f.type === 'floor') {
			return this.changeClass('go');
		}
	}
	return this.changeClass('');
};

Cursor.prototype.changeClass = function(class_name) {
	if(this.container.className !== class_name) {
		return this.container.className = class_name;
	}
};