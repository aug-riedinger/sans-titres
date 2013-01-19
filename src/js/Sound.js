var Sound = function(room, constr) {
	this.audio = new Audio();
	this.audio.src = constr.src;
	this.autoPlay = constr.play;
	this.muted = false;
	if(constr.position) {
		this.position = {
			x: (room.position.x + constr.position.x)*params.unit,
			z: (room.position.z + constr.position.z)*params.unit
		};
	}
};


Sound.prototype.adjustVolume = function(x, z) {
	var volume;
	var distance;
	if(this.position) {
		distance = Math.sqrt((x - this.position.x)*(x - this.position.x) + (z - params.focalLength - this.position.z)*(z - params.focalLength - this.position.z));
		volume = params.unit / distance;

		if(volume>1) {
			volume = 1;
		}

		if(volume<0) {
			volume = 0;
		}

	} else {
		volume = 0.8;
	}
	this.audio.volume = volume;
};
