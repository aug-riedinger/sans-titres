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
		run();
		$(scr.canvas).fadeIn(3000);
		cursor = new Cursor('screen');
	});

	camera = new Camera();
	keyboard = new Keyboard();	

};


////////////////////////////////////////////////////////////////////////////
// ===== main loop =====
var run = function () {
	// ---- loop ----
	requestAnimFrame(run);

	// ---- clear screen ----
	scr.ctx.clearRect(0,0, scr.width, scr.height);

	// ---- 3D projection ----
	room.render();

	// ---- camera ----
	camera.move();
};


init();