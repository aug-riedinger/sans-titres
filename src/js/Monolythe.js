var Monolythe = function(face, artConstr) {

	this.dim = artConstr.dim;

	var f0 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x + this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: 1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: artConstr.thumb.top,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f1 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x - this.dim.depth/2,
		y: face.f.y - this.dim.height/2,
		z: face.f.z,
		rx: 0,
		ry: -1,
		w: this.dim.width,
		h: this.dim.height,
		thumb: artConstr.thumb.bottom,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f2 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2 + 12,
		z: face.f.z - this.dim.width/2 + 15,
		rx: -0.03,
		ry: 0,
		w: this.dim.depth,
		h: this.dim.height - 24,
		thumb: artConstr.thumb.left,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};
	var f3 = {
		id: face.f.id.split(':')[0] + ':' + Math.floor(face.f.x / params.unit) + ':' + Math.floor(face.f.z / params.unit) + ':art',
		type: 'art',
		subtype: 'monolythe',
		x: face.f.x,
		y: face.f.y - this.dim.height/2,
		z: face.f.z + this.dim.width/2 - 18,
		rx: -0.03,
		ry: 2,
		w: this.dim.depth,
		h: this.dim.height,
		thumb: artConstr.thumb.right,
		src: '',
		info: artConstr.info || {},
		artId: artConstr.id,
		border: false,
		select: true
	};

	this.face0 = new Face(f0);
	this.face1 = new Face(f1);
	this.face2 = new Face(f2);
	this.face3 = new Face(f3);

	this.faces = [this.face0, this.face1, this.face2, this.face3];

	return this;
};