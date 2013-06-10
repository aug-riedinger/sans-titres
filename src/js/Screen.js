var Screen = function (ids) {
	this.container = document.getElementById(ids.container);
	this.canvas = document.getElementById(ids.canvas);
	this.ctx = this.canvas.getContext("2d");
	this.setSize();
	this.initEvents();

	return this;
};

Screen.prototype.setSize = function() {
	// ---- size ----
	this.width  = this.container.offsetWidth;
	this.height = this.container.offsetHeight;
	// ---- offset ----
	var o = this.container;
	for (this.left = 0, this.top = 0; o !== null; o = o.offsetParent) {
		this.left += o.offsetLeft;
		this.top  += o.offsetTop;
	}
	// ---- canvas resize ----
	if (this.canvas) {
		this.canvas.width  = this.width;
		this.canvas.height = this.height;
	}
};

Screen.prototype.initEvents = function() {
	var that = this;
	window.addEventListener('resize', function () {
		that.setSize();
	}, false);

	window.addEventListener('keydown', function(event) {
	// $(document).keypress(function(e) {
		if(event.keyCode == 13) { // enter
			window.fullScreenApi.requestFullScreen(document.getElementsByTagName('body')[0]);
		}
	});
};