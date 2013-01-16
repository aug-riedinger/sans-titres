var startCpt = function resetCpt() {
	if(!SLOW && cpt < 50) {
		console.log(cpt);
		console.log('Slow Mode');
		SLOW = true;
	}
	if(SLOW && cpt > 100) {
		console.log(cpt);
		console.log('Fast Mode');
		SLOW = false;
	}
	cpt = 0;
	setTimeout(resetCpt, 5000);
};

var init = function() {
	var parameters = getParameters();
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	room = new Room(parameters.room || 1, true);
	room.load();

	$(scr.container).one('loaded', function() {
		// ---- engine start ----
		camera = new Camera(room.floors[0][parseInt(room.floors[0].length / 2, 10)].pc.x, room.floors[0][parseInt(room.floors[0].length / 2, 10)].pc.z);
		keyboard = new Keyboard();
		cursor = new Cursor('screen', params.cursorX, params.cursorY);

		if(parameters.art !== undefined) {
			var i, j;
			for(i = 0; i < room.floors.length; i++) {
				for (j=0; j< room.floors[i].length; j++) {
					console.log(room.floors[i][j]);
						if(room.floors[i][j].f.art && room.floors[i][j].f.art.f.artId === parameters.art) {
							camera.targetToFace(room.floors[i][j]);
						}
				}
			}
		}

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

	startCpt();

};


var run = function() {
	// ---- loop ----
	requestAnimFrame(run);

	// ---- clear screen ----
	scr.ctx.clearRect(0, 0, scr.width, scr.height);

	if(newRoom && newRoom.ready) {
		room = newRoom;
		newRoom = null;
		camera.targetToFace(getFloor(parseInt(camera.x.value / params.unit - room.position.x, 10), parseInt((camera.z.value - camera.focalLength) / params.unit - room.position.z, 10)));
	}

	if(room.ready) {
		// ---- camera ----
		camera.move();

		// ---- 3D projection ----
		room.render();

		cpt++;

	}
};


init();