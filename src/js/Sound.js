var Sound = function(room, constr) {
	this.audio = new Audio();
	this.id = constr.id;

	if (this.audio.canPlayType('audio/mpeg;')) {
		this.audio.type= 'audio/mpeg';
		this.audio.src= OeuvresURL + constr.mp3;
	} else {
		this.audio.type= 'audio/ogg';
		this.audio.src= OeuvresURL + constr.ogg;
	}
	this.autoPlay = (constr.play === 'true');
	this.startRoom = [room.id];
	this.rooms = [room.id];
	if(constr.rooms) {
		this.rooms = this.rooms.concat(constr.rooms);
	}
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