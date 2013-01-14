// ======== private vars ========
var init = function() {
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	room = new Room(getParameters().room || 1, true);
	room.load();

	$(scr.container).one('loaded', function() {
		// ---- engine start ----
		camera = new Camera(room.floors[0][parseInt(room.floors[0].length / 2, 10)].pc.x, room.floors[0][parseInt(room.floors[0].length / 2, 10)].pc.z);
		keyboard = new Keyboard();
		cursor = new Cursor('screen', params.cursorX, params.cursorY);

		requestAnimFrame(run);
		$(scr.canvas).fadeIn(3000, function() {
			setTimeout(remImg, 1000);
		});
	});

	$(document).keypress(function(e) {
		if(e.keyCode == 13) { // enter
			window.fullScreenApi.requestFullScreen(document.getElementsByTagName('body')[0]);
		}
	});
};


var run = function() {
	// ---- loop ----
	requestAnimFrame(run);

	// ---- clear screen ----
	scr.ctx.clearRect(0, 0, scr.width, scr.height);

	if(newRoom && newRoom.ready) {
		room = newRoom;
		newRoom = null;
		camera.targetToFace(getFloor(parseInt(camera.x.value / params.unit - room.position.x, 10), parseInt( (camera.z.value - camera.focalLength) / params.unit - room.position.z, 10)));
	}

	if(room.ready) {
	// ---- camera ----
	camera.move();

	// ---- 3D projection ----
	room.render();

}

};


init();