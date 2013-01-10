// ======== private vars ========

var init = function () {
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	room = new Room(getParameters().room||1, true).load();

	$(room).one('ready', function(e) {
		// ---- engine start ----
		camera = new Camera(room.positions[0].x * params.unit, room.positions[0].z * params.unit);
		keyboard = new Keyboard();	
		cursor = new Cursor('screen');

		run();
		$(scr.canvas).fadeIn(3000);
	});


};



var run = function () {
	// ---- loop ----
	requestAnimFrame(run);

	// ---- clear screen ----
	scr.ctx.clearRect(0,0, scr.width, scr.height);

	// ---- 3D projection ----
	room.render();

	// ---- camera ----
	cursor.move();
	camera.move();
};


init();