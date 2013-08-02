var scr;
var rooms = [];
var cursor;
var keyboard;
var camera;
var sounds = [];
var MENU;
var map;

var SLOW = false;
var cpt = 100;

var showing;

var params = {
	unit: 1000,
	height: 4000,
	focalLength: 1000,
	humanHeight: 300,
	wallDist: 0,
	artDist: 500,
	cursorX: 4,
	cursorY: 6
};

var OeuvresURL = 'http://numero-0.s3-external-3.amazonaws.com/';

var colors = {
	'floor': '#80827d',
	'aimedFloor': '#70726D',
	// 'gradient': '#F9F9F9',
	'top': '#E9E9E9',
	'bottom': '#E9E9E9',
	'left': '#D9D9D9',
	'right': '#D9D9D9'
};