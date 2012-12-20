// var Room = function () {
// ======== private vars ========

var init = function (json) {
	// ---- init script ----
	scr = new ge1doot.screen.InitEvents({
		container: "screen",
		canvas: "canvas",
		click: click,
		move: pointer
	});

	// orthoSet = new OrthonormalSet();
	// orthoSet.draw();

	// ---- create faces ----
	$.getJSON('/newrooms/room'+(getParameters().room||1)+'.json', function(data) {
		console.log((data.id)+' loaded ...');
		room = new Room(data);
		run();
	});
	console.log('Loading Room'+(getParameters().room||1)+'...');


	// faces.push(faceMaker.top(0,0));
	// run();

	// ---- engine start ----
};


////////////////////////////////////////////////////////////////////////////
// ===== main loop =====
var run = function () {
	// ---- clear screen ----
	scr.ctx.clearRect(0,0, scr.width, scr.height);
	// ---- 3D projection ----
	var i = 0, f;
	while ( f = faces[i++] ) {
		f.projection();
	}
	// ---- faces depth sorting ----
	faces.sort(function (p0, p1) {
		return p1.distance - p0.distance;
	});

	// ---- drawing ----
	var i = 0, face;
	while ( face = faces[i++] ) {
		if (face.visible) {
			// ---- draw image ----
			face.render();
			// if (f.locked && scr.drag) f.locked = false;
			// if (f === faceOver) faceOver.border();
		} else break;
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