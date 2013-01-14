Room.prototype.makePositions = function() {
	var x = 0, z = 0, cpt = 0;
	var zone = 3;
	var res;

	for(var h=0; h < this.map.length; h+=zone) {
		for (var w=0; w< this.map[h].length; w+=2*zone) {
			for (var i=0; i<zone; i++)  {
				for (var j=0; j< zone; j+=2) {
					if(this.map[h+i] && this.map[h+i][w+j] && this.map[h+i][w+j] != '.') {
						z += h+i;
						x += w/2 + j;
						cpt +=1;
					}
				}
			}
			res = {
				x: this.position.x + x/cpt,
				z: this.position.z + z/cpt,
				dst: 999999
				// dst: (Math.abs((this.position.x + x/cpt)*params.unit - (camera.x.value||0) ) + Math.abs((this.position.z + z/cpt)*params.unit - (camera.z.value||0) ))||9999999
			};
			if(this.inside(res.x, res.z)) {
				this.positions.push(res);
			}
			x = 0;
			z = 0;
			cpt = 0;
		}
	}

	this.positions.sort(function (p0, p1) {
		return p0.dst - p1.dst;
	});

};

Room.prototype.setCenter = function() {
	var z = 0;
	var x = 0;
	var cpt = 0;
	for(var h=0; h < this.map.length; h++) {
		for (var w=0; w< this.map[h].length; w+=2) {
			if(this.map[h][w] == 'T' || this.map[h][w] == 't' || this.map[h][w] == 'B' || this.map[h][w] == 'b') {
				z += h;
				x += w/2;
				cpt += 1;
			}
		}
	}
	return this.center = {
		x: this.position.x + x/cpt,
		z: this.position.z + z/cpt
	};
};


Room.prototype.readHorizontally = function() {
	var h, w;
	var x, z, charType;
	var next, doorId, artId;
	var door, art, artConstr;
	var top, bottom;


	for(h = -1; h < this.map.length + 1; h++) {
		z = this.map.length - (h + 1);
		for(w = -2; w < this.map[0].length + 2; w += 2) {
			x = w / 2;
			this.floors.push(faceMaker.floor(this, x, z));
			this.ceilings.push(faceMaker.ceiling(this, x, z));
		}
	}

	for(h = 0; h < this.map.length; h++) {
		z = this.map.length - (h + 1);
		this.addWall(this.tops);
		this.addWall(this.bottoms);
		for(w = 0; w < this.map[h].length; w += 2) {
			x = w / 2;
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			doorId = next.replace(/^[^0-9]$/, '');
			artId = next.replace(/^[^a-zA-Z]$/, '');
			top = faceMaker.top(this, x, z);
			bottom = faceMaker.bottom(this, x, z);

			// if (this.isInside(charType)) {
			// 	this.floors.push(faceMaker.floor(this, x, z));
			// 	this.ceilings.push(faceMaker.ceiling(this, x, z));
			// }
			if(this.isNoWall(charType)) {
				// this.positions.push(faceMaker.position(this, x, z));
			}

			if(doorId === '') {
				if(this.isTop(charType)) {
					this.tops[this.tops.length - 1].push(top);
				}
				if(this.isBottom(charType)) {
					this.bottoms[this.bottoms.length - 1].push(bottom);
				}
			} else {
				door = this.getDoor(doorId);
				if(!this.isTop(door.side) && this.isTop(charType)) {
					this.tops[this.tops.length - 1].push(top);
				} else {
					if(this.isTop(charType)) {
						this.doors.push(faceMaker.door(this, top, door.to));
					}
					this.addWall(this.tops);
				}
				if(!this.isBottom(door.side) && this.isBottom(charType)) {
					this.bottoms[this.bottoms.length - 1].push(bottom);
				} else {
					if(this.isBottom(charType)) {
						this.doors.push(faceMaker.door(this, bottom, door.to));
					}
					this.addWall(this.bottoms);
				}
			}


			if(artId !== '') {
				artConstr = this.getArt(artId);
				if(this.isTop(charType)) {
					art = faceMaker.art(this, top, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, top));
				}
				if(this.isBottom(charType)) {
					art = faceMaker.art(this, bottom, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, bottom));
				}

				if(art) {

					if(art.f.subtype === 'image') {
						var img = new Image();
						img.src = art.f.src;
						img.id = art.f.id;
						img.className = 'art';
						this.images.push(img);
					}

					if(art.f.subtype === 'html') {
						var ifrm = document.createElement('iframe');
						ifrm.setAttribute('src', art.f.src);
						ifrm.className = 'html';
						ifrm.id = art.f.id;
						ifrm.height = artConstr.iFrameHeight || 600;
						ifrm.width = artConstr.iFrameWidth || 800;
						this.texts.push(ifrm);
					}
				}

			}

		}
	}
};

Room.prototype.readVertically = function() {
	var w, h;
	var x, z, charType;
	var next, doorId, artId;
	var door, art, artConstr;
	var left, right;

	for(w = 0; w < this.map[0].length; w += 2) {
		this.addWall(this.lefts);
		this.addWall(this.rights);
		for(h = 0; h < this.map.length; h++) {
			x = w / 2;
			z = this.map.length - (h + 1);
			charType = this.map[h][w];
			next = this.map[h][w + 1];
			doorId = next.replace(/^[^0-9]$/, '');
			artId = next.replace(/^[^a-zA-Z]$/, '');
			left = faceMaker.left(this, x, z);
			right = faceMaker.right(this, x, z);

			if(doorId === '') {
				if(this.isLeft(charType)) {
					this.lefts[this.lefts.length - 1].push(left);
				}
				if(this.isRight(charType)) {
					this.rights[this.rights.length - 1].push(right);
				}
			} else {
				door = this.getDoor(doorId);
				if(!this.isLeft(door.side) && this.isLeft(charType)) {
					this.lefts[this.lefts.length - 1].push(left);
				} else {
					if(this.isLeft(charType)) {
						this.doors.push(faceMaker.door(this, left, door.to));
					}
					this.addWall(this.lefts);
				}
				if(!this.isRight(door.side) && this.isRight(charType)) {
					this.rights[this.rights.length - 1].push(right);
				} else {
					if(this.isRight(charType)) {
						this.doors.push(faceMaker.door(this, right, door.to));
					}
					this.addWall(this.rights);
				}
			}

			if(artId !== '') {
				artConstr = this.getArt(artId);
				if(this.isLeft(charType)) {
					art = faceMaker.art(this, left, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, left));
				}
				if(this.isRight(charType)) {
					art = faceMaker.art(this, right, artConstr);
					this.arts.push(art);
					this.positions.push(faceMaker.position(this, right));
				}

				if(art) {
					if(art.f.subtype === 'image') {
						var img = new Image();
						img.src = art.f.src;
						img.id = art.f.id;
						img.className = 'art';
						this.images.push(img);
					}

					if(art.f.subtype === 'html') {
						var ifrm = document.createElement('iframe');
						ifrm.setAttribute('src', art.f.src);
						ifrm.className = 'html';
						ifrm.id = art.f.id;
						ifrm.height = artConstr.iFrameHeight || 600;
						ifrm.width = artConstr.iFrameWidth || 800;
						this.texts.push(ifrm);
					}

				}

			}
		}
	}
};


Room.prototype.expandCharType = function(charType) {
	if(charType === '-' || charType === '_' || charType === '|' || charType === '!') {
		return [charType];
	} else {
		if(charType == '#') {
			return ['|', '-'];
		}
		if(charType == '%') {
			return ['|', '_'];
		}
		if(charType == '+') {
			return ['!', '-'];
		}
		if(charType == '¤') {
			return ['!', '_'];
		}
	}
};