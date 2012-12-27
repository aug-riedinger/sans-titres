var Keyboard = function (canvas_ID) {
	this.initEvents();

	return this;
};

Keyboard.prototype.initEvents = function() {
	window.addEventListener('keydown', function(event) {
		// console.log(event.keyCode);
		if (event.keyCode == 38 || event.keyCode == 90){ // Top || Z
			camera.up();
		}
		if (event.keyCode == 40 || event.keyCode == 83){ // Bottom || s
			camera.down();

		}
		if (event.keyCode == 39 || event.keyCode == 69 ){ // Right || e
			camera.right();
		}
		if (event.keyCode == 37 || event.keyCode == 65){ // Left || a
			camera.left();
		}
		if (event.keyCode == 68){ // d
			camera.rght();
		}
		if (event.keyCode == 81){ // q
			camera.lft();
		}
		if (event.keyCode == 32){ // space
			camera.stop();
		}
		if (event.keyCode == 13){ // enter
			camera.center();
		}
		if (event.keyCode == 82){ // r
			camera.zoomIn();
		}
		if (event.keyCode == 70){ // f
			camera.zoomOut();
		}
		if (event.keyCode == 27){ // f
			camera.toggleGodView();
		}
	}, false);

	window.addEventListener('keyup', function(event) {
	}, false);
}