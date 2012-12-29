// var Room = function () {
// ======== private vars ========

var init = function (json) {
	// ---- init script ----
	scr = new Screen({
		container: "screen",
		canvas: "canvas"
	});

	// orthoSet = new OrthonormalSet();
	// orthoSet.draw();

	// ---- create faces ----
	// $.getJSON('/newrooms/room'+(getParameters().room||1)+'.json', function(data) {
	// 	// console.log((data.id)+' loaded ...');
	// 	room = new Room(data);

	// 	for(var i=0; i< room.cubes.length;i++) {
	// 		faces = faces.concat(room.cubes[i].walls, room.cubes[i].arts);
	// 		arts = arts.concat(room.cubes[i].arts);
	// 	}
	// 	run();
	// });

room = new Room(getParameters().room||1, true).load();

$(room).on('ready', function(e) {
	run();
	$(scr.canvas).fadeIn(3000);
	cursor = new Cursor('screen');
	camera.center();
});

	// console.log('Loading Room'+(getParameters().room||1)+'...');
	camera = new Camera();
	keyboard = new Keyboard();	

	// faces.push(faceMaker.top(0,0));
	// run();

	// ---- engine start ----
};


////////////////////////////////////////////////////////////////////////////
// ===== main loop =====
var run = function () {
	var face;

	// ---- clear screen ----
	scr.ctx.clearRect(0,0, scr.width, scr.height);
	// ---- 3D projection ----

	// while ( f = faces[i++] ) {
	// 	f.projection();
	// }
	// // ---- faces depth sorting ----
	// faces.sort(function (p0, p1) {
	// 	return p1.distance - p0.distance;
	// });

	// Render Adjacent Rooms
	for (var i=0; i < room.adj.length; i++) {
		for (var j=0; j < room.adj[i].cubes.length; j++) {
			for (var k=0; k < room.adj[i].cubes[j].walls.length; k++) {
				face = room.adj[i].cubes[j].walls[k];
					face.projection();
				if( face.visible) {
					face.render();
				}
			}
		}
	}

	for (var i=0; i < room.cubes.length; i++) {
		for (var j=0; j < room.cubes[i].walls.length; j++) {
			face = room.cubes[i].walls[j];
				face.projection();
			if( face.visible) {
				face.render();
			}			
		}
	}

	for (var i=0; i < room.arts.length; i++) {
		face = room.arts[i];
			face.projection();
		if( face.visible) {
			face.render();
		}			
	}


	// // ---- drawing ----
	// for(var i=0;i<faces.length; i++) {
	// 	face = faces[i];
	// 	if (face.visible) {
	// 		// ---- draw image ----
	// 		face.render();
	// 		if(showing && showing.distance > params.artDist) {
	// 			remImg();
	// 			showing = null;
	// 		}

	// 		if (face.f.type == 'art' && face.distance < params.artDist && (!showing || showing.f.id != face.f.id)) {
	// 			showing = face;
	// 			showImg(face.f.src);
	// 		} 
	// 	}

	// }

	for(var j=0; j<points.length; j++) {
		points[j].highlight('blue');
	}

	// orthoSet.draw();

	// ---- camera ----
	camera.move();
	// ---- loop ----
	requestAnimFrame(run);
};
	// return {    
		////////////////////////////////////////////////////////////////////////////
		// ---- onload event ----
		// var loadImages = function (json) {
		// 	window.addEventListener('load', function () {
		// 		setTimeout(function () {
		// 		}, 500);
		// 	}, false);
		// };
	// 	}
// }



init();