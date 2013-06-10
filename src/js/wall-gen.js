

var drawWall = function(_w,_h,color) {
	var canv = document.createElement('canvas');
	var ctx = canv.getContext('2d');
	var img;

	canv.width = _w || 500;
	canv.height = _h || 332;

	ctx.beginPath();
	ctx.rect(0, 0, canv.width, canv.height);
	ctx.fillStyle = color || 'white';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	ctx.stroke();

	img = new Image();
	img.src = canv.toDataURL();
	img.className = 'Wall';

	return img;
}

var drawDoor = function(_w,_h) {
	var canv = document.createElement('canvas');
	var ctx = canv.getContext('2d');
	var img;

	canv.width = _w || 500;
	canv.height = _h || 332;

	ctx.beginPath();
	ctx.rect(0, 0, canv.width, canv.height);
	ctx.rect(canv.width/2-100-1, 100-1, 200+2, canv.height-100+2);
	ctx.fillStyle = 'white';
	ctx.fill();
	ctx.lineWidth = 2;
	ctx.strokeStyle = 'black';
	ctx.stroke();

	ctx.clearRect(canv.width/2-100, 100, 200, canv.height-100);


	img = new Image();
	img.src = canv.toDataURL();
	img.className = 'Door';

	return img;
}