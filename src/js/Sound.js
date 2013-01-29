var Sound = function(room, constr) {
	this.audio = new Audio();
	this.id = constr.id;
	this.audio.src = constr.mp3;
	this.autoPlay = (constr.play === 'true');
	this.rooms = [room.id].concat(constr.rooms);
	this.muted = false;
	if(constr.position) {
		this.position = {
			x: (room.position.x + constr.position.x)*params.unit,
			z: (room.position.z + constr.position.z)*params.unit
		};
	}

};


Sound.prototype.adjustVolume = function() {
	var volume;
	var distance;
	if(this.position && camera) {
		distance = Math.sqrt((camera.x.value - this.position.x)*(camera.x.value - this.position.x) + (camera.z.value - params.focalLength - this.position.z)*(camera.z.value - params.focalLength - this.position.z));
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