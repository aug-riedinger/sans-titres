var drawCanvas = function(content) {

	var titre = "La fin du monde est une chance ! Profitez-en !";

	var content = "D'autres diront qu'il s'agit d'une sentence terrible qui s'abat sur l'humanité. Et si on optait pour cette petite touche d'optimisme qui fait que tout est toujours plus beau chaque jour ?";

	ctx.beginPath();
	ctx.moveTo(170, 80);
	ctx.font = "bold 24px Calibri";
	ctx.textAlign = 'center';
	ctx.fillText(titre, canv.width/2, 200);
	ctx.font = "normal 14px Calibri";
	ctx.textAlign = 'left';
	wrapText(ctx, content, canv.width/2 - 150, 250, 300, 18);

}

var drawWall = function(_w,_h) {
	var canv = document.createElement('canvas');
	var ctx = canv.getContext('2d');
	var img;

	canv.width = _w || 500;
	canv.height = _h || 332;

	ctx.beginPath();
	ctx.rect(0, 0, canv.width, canv.height);
	ctx.fillStyle = 'white';
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
	ctx.rect(canv.width/2-100-2, 100-2, 200+4, canv.height-100+4);
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