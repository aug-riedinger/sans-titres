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

var showImg = function(src) {
	var img = new Image();
	img.src = params.path+src;
	img.className = 'art';
	$('#artClearView').html(img);
	$('#artClearView').fadeIn(1000);
	$('#artClearView').on('click',function(eventName) {
		remImg();
	});
};

var remImg = function() {
	$('#artClearView').fadeOut(1000, function() {
		$('#artClearView').empty();
	});
	camera.center();
	targetold = false;
	$('#artClearView').off('click',function(eventName) {
		remImg();
	});

}