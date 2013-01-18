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

var enteredRoom = function(roomId) {
	var i, j;
	var room;
	var newRoom, oldRoom, switchRoom;

	oldRoom = rooms[0];
	oldRoom.removeSounds();
	for(k = 0; k < rooms.length; k++) {
		if(rooms[k].id === roomId) {
			switchRoom = rooms[k];
			rooms[k] = rooms[0];
			rooms[0] = switchRoom;
			newRoom = rooms[0];
			for(i = 0; i < newRoom.adj.length; i++) {
				room = null;
				for(j = 1; j < rooms.length; j++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in rooms
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					// New Room to create
					new Room(newRoom.adj[i]);
				}

			}
			for(j = 1; j < rooms.length; j++) {
				room = null;
				for(i = 0; i < newRoom.adj.length; i++) {
					if(rooms[j].id === newRoom.adj[i]) {
						// Found in adj
						room = rooms[j];
						break;
					}
				}
				if(!room) {
					// Not adjacent Anymore, removal !
					rooms.splice(j, 1);
				}
			}
			newRoom.makeSounds();
			return rooms;
		}
	}
	return rooms;
};

var init = function() {
	var parameters = getParameters();
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	new Room(parameters.room || 1);

	$(scr.container).one('loaded', function() {

		enteredRoom(parameters.room || 1);

		camera = new Camera(rooms[0].floors[parseInt(rooms[0].floors.length / 2, 10)].pc.x, rooms[0].floors[parseInt(rooms[0].floors.length / 2, 10)].pc.z);
		// keyboard = new Keyboard();
		cursor = new Cursor('screen', params.cursorX, params.cursorY);

		if(parameters.art !== undefined) {
			var i;
			for(i = 0; i < rooms[0].floors.length; i++) {
					if(rooms[0].floors[i].f.art && rooms[0].floors[i].f.art.f.artId === parameters.art) {
						camera.targetToFace(rooms[0].floors[i]);
					}
			}
		}

		requestAnimFrame(run);
		$(scr.canvas).fadeIn(3000, function() {
			setTimeout(remHtml, 1000);
		});
	});

	startCpt();

};


var run = function() {
	// ---- loop ----
	requestAnimFrame(run);

	// ---- clear screen ----
	scr.ctx.clearRect(0, 0, scr.width, scr.height);
	
	// ---- camera ----
	camera.move();

	// ---- 3D projection ----
	renderer.renderAll();

	cpt++;
};


init();