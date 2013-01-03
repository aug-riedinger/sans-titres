var express = require('express');


var app = express.createServer(express.logger());
// var oneYear = 31557600000;
// app.use(express.static(__dirname + '/public', { maxAge: oneYear }));

app.use("/js", express.static(__dirname + '/src/js'));
app.use("/css", express.static(__dirname + '/src/css'));
app.use("/images", express.static(__dirname + '/src/images'));
app.use("/libs", express.static(__dirname + '/src/libs'));
app.use("/rooms", express.static(__dirname + '/src/rooms'));
app.use("/arts", express.static(__dirname + '/src/arts'));


app.use(express.errorHandler());

app.get('/', function(request, response) {
	response.sendfile(__dirname + "/src/index.html");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
	console.log("Listening on " + port);
});