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