var Art = function(face,constr) {
	this.face = face;
	var f = {
		id: this.face.id+':'+constr.id,
		full : constr.full,
		x:this.face.f.x,
		// y:this.face.f.y,
		y:this.face.f.y - this.face.f.h/2 + this.face.f.h*(constr.posy||0.5),
		// z:this.face.f.z,
		z:this.face.f.z - this.face.f.w/2 + this.face.f.w*(constr.posz||0.5),
		rx:this.face.f.rx,
		ry:this.face.f.ry,
		w: constr.dimz,
		h: constr.dimy,
		select : true
	};

	if(constr.type == 'image') {
		f.image = new Image();
		f.image.src = params.path+constr.src;
	}

	faces.push(
		new Face(params.path, f)
		);
	return this;
}

