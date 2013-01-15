var Sound = function(constr) {
	this.audio = new Audio();
	this.audio.src = constr.src;
	if(constr.play === 'true') {
		this.audio.volume = 0.8;
		this.audio.play();
	}

	this.activateControls();
};

Sound.prototype.activateControls = function() {
	if($('#audio').css('display') === 'none') {
		$('#audio').fadeIn(1000);
	}

	$('#s_mute').click($.proxy(function(e) {
		this.formerVolume = this.audio.volume;
		this.audio.volume = 0;
	}, this));
	$('#s_lower').click($.proxy(function(e) {
		if(this.audio.volume === 0) {
			this.audio.volume = this.formerVolume || 0;
		} else {
			this.audio.volume -= 0.1;
		}
	}, this));
	$('#s_higher').click($.proxy(function(e) {
		if(this.audio.volume === 0) {
			this.audio.volume = this.formerVolume || 1;
		} else {
			this.audio.volume += 0.1;
		}
	}, this));

};

Sound.prototype.remove = function() {
	this.audio.pause();
	$('#audio').fadeOut(1000);
	// this.removeChild(audio);
};