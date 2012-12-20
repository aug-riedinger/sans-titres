var express = require('express');


var app = express.createServer(express.logger());

app.use("/js", express.static(__dirname + '/src/js'));
app.use("/css", express.static(__dirname + '/src/css'));
app.use("/images", express.static(__dirname + '/src/images'));
app.use("/libs", express.static(__dirname + '/src/libs'));
app.use("/rooms", express.static(__dirname + '/src/rooms'));
app.use("/newrooms", express.static(__dirname + '/src/newrooms'));


app.get('/', function(request, response) {
	response.sendfile(__dirname + "/src/index.html");
});

var port = process.env.PORT || 5000;
app.listen(port, function() {
  console.log("Listening on " + port);
});