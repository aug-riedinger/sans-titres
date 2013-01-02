var scr;
var room;
var cursor;
var keyboard;
// var orthoSet;
var faces = [];
var arts = [];
var points = [];
var position = {
	x:0,
	z:0
};
var showing;
var cursor;

var cpt=0;
var timestamp = new Date().getTime();

var params = {
	path: "images/",
	unit : 700,
	height : 700,
	wallColor: '#f9f9f9',
	floorColor: '#80827d',
	wallDist : 50,
	artDist : 500,
	focalLength : 700,
	viewAngle: Math.PI/6
};