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
		camera = new Camera(room.floors[parseInt(room.floors.length/2)].pc.x, room.floors[parseInt(room.floors.length/2)].pc.z);
		keyboard = new Keyboard();	
		cursor = new Cursor('screen');

		run();
		$(scr.canvas).fadeIn(3000, function() {
			setTimeout(remImg, 1000);
		});
	});

	$(document).keypress(function(e) {
						if (e.keyCode == 13){ // enter
							window.fullScreenApi.requestFullScreen(document.getElementsByTagName('body')[0]);
						}
					});


}


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